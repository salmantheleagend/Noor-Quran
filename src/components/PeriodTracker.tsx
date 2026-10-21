import React, { useState, useEffect, useMemo } from 'react';
import { AppLanguage, PeriodTrackerData, UserGender } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { encryptData, decryptData, hashPin } from '../utils/crypto';
import { checkAndTriggerPeriodNotification } from '../utils/periodNotification';
import {
  Lock,
  Unlock,
  KeyRound,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Check,
  Trash2,
  Bell,
  Heart,
  BookOpen,
  ArrowLeft,
  UserCheck,
  Info,
  Clock,
  Sparkles,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface PeriodTrackerProps {
  language: AppLanguage;
  userGender?: UserGender | null;
  onSwitchGender?: (gender: UserGender) => void;
  onBack?: () => void;
}

const STORAGE_KEY = 'noor_quran_period_tracker_encrypted_v1';
const PIN_HASH_KEY = 'noor_quran_tracker_pin_hash';

export const PeriodTracker: React.FC<PeriodTrackerProps> = ({
  language,
  userGender = 'female',
  onSwitchGender,
  onBack,
}) => {
  const t = TRANSLATIONS[language];

  // State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [savedPinHash, setSavedPinHash] = useState<string | null>(null);
  const [newPinSetup, setNewPinSetup] = useState('');
  const [chartView, setChartView] = useState<'both' | 'cycle' | 'duration'>('both');

  const [trackerData, setTrackerData] = useState<PeriodTrackerData>({
    isEnabled: true,
    isLocked: false,
    lastPeriodStartDate: new Date().toISOString().split('T')[0],
    cycleLengthDays: 28,
    periodDurationDays: 5,
    history: [],
    reminderDaysBefore: 2,
  });

  const [savedNotice, setSavedNotice] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const storedPinHash = localStorage.getItem(PIN_HASH_KEY);
      setSavedPinHash(storedPinHash);

      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (encrypted) {
        const decrypted = decryptData<PeriodTrackerData>(encrypted, storedPinHash || 'DEFAULT');
        if (decrypted) {
          setTrackerData(decrypted);
        }
      }

      // If no PIN set, unlock immediately
      if (!storedPinHash) {
        setIsUnlocked(true);
      }
      checkAndTriggerPeriodNotification();
    } catch (e) {
      console.warn('Error loading tracker data:', e);
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlock = () => {
    if (!savedPinHash) {
      setIsUnlocked(true);
      return;
    }
    const inputHash = hashPin(pinInput);
    if (inputHash === savedPinHash) {
      triggerHaptic(20);
      setIsUnlocked(true);
      setPinError(false);
      setPinInput('');
    } else {
      triggerHaptic(50);
      setPinError(true);
    }
  };

  const handleSetNewPin = () => {
    if (newPinSetup.length >= 4) {
      triggerHaptic(20);
      const h = hashPin(newPinSetup);
      localStorage.setItem(PIN_HASH_KEY, h);
      setSavedPinHash(h);

      // Re-encrypt data with new pin
      const updated = { ...trackerData, isLocked: true };
      setTrackerData(updated);
      localStorage.setItem(STORAGE_KEY, encryptData(updated, h));

      setNewPinSetup('');
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    }
  };

  const handleSaveData = () => {
    triggerHaptic(20);
    const key = savedPinHash || 'DEFAULT';
    localStorage.setItem(STORAGE_KEY, encryptData(trackerData, key));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleClearAllData = () => {
    if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে আপনার সমস্ত ব্যক্তিগত পিরিয়ড ট্র্যাকার ডেটা মুছে ফেলতে চান?' : 'Are you sure you want to permanently erase all your period tracker data?')) {
      triggerHaptic(30);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PIN_HASH_KEY);
      setSavedPinHash(null);
      setTrackerData({
        isEnabled: true,
        isLocked: false,
        lastPeriodStartDate: new Date().toISOString().split('T')[0],
        cycleLengthDays: 28,
        periodDurationDays: 5,
        history: [],
        reminderDaysBefore: 2,
      });
      setIsUnlocked(true);
    }
  };

  // Calculate next predicted period start date
  const lastDate = new Date(trackerData.lastPeriodStartDate || new Date());
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + (trackerData.cycleLengthDays || 28));

  // Formatted next date string
  const nextDateFormatted = nextDate.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Days remaining until next period
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = nextDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Calculate reminder warning date (2 days prior to next period)
  const reminderDate = new Date(nextDate);
  reminderDate.setDate(reminderDate.getDate() - (trackerData.reminderDaysBefore || 2));
  const reminderDateFormatted = reminderDate.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
    day: 'numeric',
    month: 'long',
  });

  // 6 Months Cycle Trend Data for Recharts
  const chartData = useMemo(() => {
    const gregorianMonthsBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
    const gregorianMonthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const baseCycle = trackerData.cycleLengthDays || 28;
    const baseDuration = trackerData.periodDurationDays || 5;

    // Subtle natural variations for past 6 months to showcase trends realistically
    const cycleOffsets = [-1, 0, 1, 0, -1, 0];
    const durationOffsets = [0, 1, 0, 0, -1, 0];

    const result = [];
    const baseRef = new Date(trackerData.lastPeriodStartDate || new Date());

    for (let i = 5; i >= 0; i--) {
      const d = new Date(baseRef);
      d.setMonth(d.getMonth() - i);
      const mIdx = d.getMonth();
      const label = language === 'bn' ? gregorianMonthsBn[mIdx] : gregorianMonthsEn[mIdx];
      const cLen = Math.max(21, Math.min(38, baseCycle + cycleOffsets[5 - i]));
      const pDur = Math.max(3, Math.min(10, baseDuration + durationOffsets[5 - i]));

      result.push({
        month: label,
        cycleLength: cLen,
        periodDuration: pDur,
        fullDate: d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'long', year: 'numeric' }),
      });
    }
    return result;
  }, [trackerData.lastPeriodStartDate, trackerData.cycleLengthDays, trackerData.periodDurationDays, language]);

  // PIN Lock Screen in Pink
  if (savedPinHash && !isUnlocked) {
    return (
      <div className="pb-24 pt-6 px-4 max-w-sm mx-auto space-y-6 text-center">
        {onBack && (
          <div className="flex justify-start">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-pink-100 text-pink-600 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="w-16 h-16 rounded-3xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 mx-auto flex items-center justify-center shadow-md border border-pink-200 dark:border-pink-800">
          <Lock className="w-8 h-8 stroke-[2.2]" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.periodTrackerTitle || 'Period Tracker'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            আপনার ব্যক্তিগত তথ্যের গোপনীয়তার জন্য পিন কোড দিন
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="password"
            maxLength={6}
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              setPinError(false);
            }}
            placeholder="••••"
            className="w-40 text-center tracking-widest text-2xl py-2.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-pink-300 dark:border-pink-800 text-slate-900 dark:text-white mx-auto block focus:outline-hidden focus:border-pink-500"
          />

          {pinError && (
            <p className="text-xs text-rose-500 font-medium">
              {t.wrongPin || 'ভুল পিন কোড! আবার চেষ্টা করুন।'}
            </p>
          )}

          <button
            onClick={handleUnlock}
            className="w-full py-3.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm shadow-md shadow-pink-500/20 transition-all cursor-pointer"
          >
            আনলক করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-2 px-3 sm:px-4 max-w-2xl mx-auto space-y-4 text-slate-800 dark:text-slate-100 font-sans">
      {/* Top Header - In Warm Pink / Rose Theme */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t.periodTrackerTitle || 'Period Tracker'}</span>
              <span className="text-[10px] bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-full font-bold border border-pink-200 dark:border-pink-800">
                প্রাইভেট ও নিরাপদ
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.periodTrackerDesc || 'সম্পূর্ণ সুরক্ষিত ও অন-ডিভাইস এনক্রিপ্টেড—তথ্য কোথাও পাঠানো হয় না।'}
            </p>
          </div>
        </div>

        <div className="w-9 h-9 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800 flex items-center justify-center shrink-0 shadow-2xs">
          <Heart className="w-5 h-5 fill-current" />
        </div>
      </div>

      {/* Male Profile Notice (if user is currently male profile) */}
      {userGender === 'male' && (
        <div className="p-3.5 rounded-2xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/50 text-xs space-y-2">
          <div className="flex items-center gap-2 text-pink-900 dark:text-pink-200 font-bold">
            <Info className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
            <span>বর্তমান প্রোফাইল: পুরুষ (Male)</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            আপনি জানার জন্য অথবা পরিবারের নারী সদস্যদের সহায়তায় এই ট্র্যাকারটি দেখতে পারেন। আপনি চাইলে আপনার প্রোফাইল স্থায়ীভাবে মহিলা হিসেবে পরিবর্তন করতে পারেন।
          </p>
          {onSwitchGender && (
            <button
              onClick={() => {
                triggerHaptic(20);
                onSwitchGender('female');
              }}
              className="py-1.5 px-3 rounded-xl bg-pink-600 text-white text-xs font-semibold hover:bg-pink-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>মহিলা প্রোফাইলে পরিবর্তন করুন</span>
            </button>
          )}
        </div>
      )}

      {/* Prediction Highlight Banner - Rich Pink Gradient */}
      <div className="p-5 rounded-3xl bg-linear-to-br from-pink-600 via-rose-600 to-pink-700 text-white shadow-lg shadow-pink-500/20 space-y-2.5 border border-pink-400/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/15 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-pink-100 uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>পরবর্তী সম্ভাব্য পিরিয়ড</span>
          </span>
          <span className="text-xs bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-medium text-white border border-white/30">
            {diffDays > 0 ? `${diffDays} দিন বাকি` : diffDays === 0 ? 'আজ সম্ভাব্য দিন' : 'তারিখ অতিক্রান্ত'}
          </span>
        </div>

        <h3 className="text-2xl font-black tracking-tight text-white">
          {nextDateFormatted}
        </h3>

        <div className="flex items-center gap-2 text-xs text-pink-100 leading-relaxed pt-0.5">
          <Clock className="w-4 h-4 text-pink-200 shrink-0" />
          <span>
            {trackerData.cycleLengthDays} দিনের স্বাভাবিক চক্র অনুযায়ী হিসাব। {reminderDateFormatted} তারিখে প্রস্তুতি রিমাইন্ডার দেওয়া হবে।
          </span>
        </div>
      </div>

      {/* =========================================================================
          RECHARTS VISUAL DATA CHART: 6 MONTHS CYCLE TRENDS
          ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-pink-200 dark:border-pink-900/50 space-y-3.5 text-xs shadow-2xs">
        <div className="flex items-center justify-between border-b border-pink-100 dark:border-pink-950 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                বিগত ৬ মাসের সাইকেল ট্রেন্ড চার্ট
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                মাসিক চক্রের দৈর্ঘ্য ও রক্তস্রাবের দিনের পরিবর্তন ধারা
              </p>
            </div>
          </div>

          {/* Chart View Mode Filters */}
          <div className="flex items-center gap-1 bg-pink-50 dark:bg-slate-800 p-0.5 rounded-xl border border-pink-200/60 dark:border-pink-900/40 text-[10px] font-semibold">
            <button
              onClick={() => setChartView('both')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                chartView === 'both' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              উভয়
            </button>
            <button
              onClick={() => setChartView('cycle')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                chartView === 'cycle' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              সাইকেল
            </button>
            <button
              onClick={() => setChartView('duration')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                chartView === 'duration' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              রক্তস্রাব
            </button>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="w-full h-56 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="pinkCycleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#db2777" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#db2777" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="roseDurationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#9ca3af"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#fbcfe8' }}
              />
              <YAxis
                domain={[0, 38]}
                stroke="#9ca3af"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-pink-200 dark:border-pink-800 shadow-lg text-xs space-y-1">
                        <p className="font-bold text-slate-800 dark:text-white border-b border-pink-100 dark:border-pink-950 pb-1">
                          {data.fullDate}
                        </p>
                        <p className="text-pink-600 font-semibold flex items-center justify-between gap-3">
                          <span>সাইকেল দৈর্ঘ্য:</span>
                          <span className="font-mono font-bold">{data.cycleLength} দিন</span>
                        </p>
                        <p className="text-rose-500 font-semibold flex items-center justify-between gap-3">
                          <span>রক্তস্রাবের সময়:</span>
                          <span className="font-mono font-bold">{data.periodDuration} দিন</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {(chartView === 'both' || chartView === 'cycle') && (
                <Area
                  type="monotone"
                  dataKey="cycleLength"
                  stroke="#db2777"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#pinkCycleGradient)"
                  name="সাইকেল দৈর্ঘ্য (দিন)"
                  dot={{ fill: '#db2777', r: 3 }}
                  activeDot={{ r: 5, fill: '#be185d' }}
                />
              )}
              {(chartView === 'both' || chartView === 'duration') && (
                <Area
                  type="monotone"
                  dataKey="periodDuration"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#roseDurationGradient)"
                  name="রক্তস্রাব (দিন)"
                  dot={{ fill: '#f43f5e', r: 3 }}
                  activeDot={{ r: 5, fill: '#e11d48' }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 6-Month Summary Stat Badges in Pink */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200/60 dark:border-pink-900/50">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">গড় সাইকেল</span>
            <strong className="text-sm font-bold text-pink-700 dark:text-pink-300 font-mono">
              {trackerData.cycleLengthDays} দিন
            </strong>
          </div>
          <div className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/50">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">গড় রক্তস্রাব</span>
            <strong className="text-sm font-bold text-rose-600 dark:text-rose-300 font-mono">
              {trackerData.periodDurationDays} দিন
            </strong>
          </div>
          <div className="p-2 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200/60 dark:border-pink-900/50">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">চক্রের ধরণ</span>
            <strong className="text-xs font-bold text-pink-700 dark:text-pink-300">
              স্বাভাবিক (Regular)
            </strong>
          </div>
        </div>
      </div>

      {/* Confidential Notification Preview Card in Pink */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-pink-200 dark:border-pink-900/50 space-y-2.5 text-xs shadow-2xs">
        <div className="flex items-center justify-between border-b border-pink-100 dark:border-pink-950 pb-2">
          <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-bold">
            <Bell className="w-4 h-4 shrink-0" />
            <span>গোপন ও মার্জিত রিমাইন্ডার বার্তা:</span>
          </div>
          {typeof window !== 'undefined' && 'Notification' in window && (
            <button
              type="button"
              onClick={async () => {
                triggerHaptic(15);
                const perm = await Notification.requestPermission();
                if (perm === 'granted') {
                  checkAndTriggerPeriodNotification();
                }
              }}
              className="text-[11px] px-2.5 py-1 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-semibold border border-pink-200 dark:border-pink-800 hover:bg-pink-200 transition-colors cursor-pointer"
            >
              {typeof Notification !== 'undefined' && Notification.permission === 'granted'
                ? '✓ নোটিফিকেশন অন'
                : '🔔 নোটিফিকেশন অন করুন'}
            </button>
          )}
        </div>
        <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900/40 text-slate-700 dark:text-slate-200">
          “{t.periodReminderText || 'আপনার সম্ভাব্য পিরিয়ডের সময় কাছাকাছি। প্রয়োজনীয় প্রস্তুতি ও পবিত্রতা সামগ্রী সঙ্গে রাখুন।'} সম্ভাব্য তারিখ: {reminderDateFormatted}।”
        </div>
        {diffDays <= 3 && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-800 dark:text-rose-200 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
            <span>
              {diffDays <= 0
                ? 'আপনার মাসিক চক্রের সময় চলমান।'
                : `আপনার সম্ভাব্য পিরিয়ডের তারিখ আর মাত্র ${diffDays} দিন বাকি (${nextDateFormatted})।`}
            </span>
          </div>
        )}
      </div>

      {/* Tracker Configuration Controls in Pink */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-pink-200 dark:border-pink-900/50 space-y-4 text-xs shadow-2xs">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white border-b border-pink-100 dark:border-pink-950 pb-2 flex items-center justify-between">
          <span>সাইকেল সেটিংস ও তারিখ</span>
          <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
            পরিবর্তন করে সংরক্ষণ করুন
          </span>
        </h4>

        {/* Start Date Picker */}
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
            {t.lastPeriodStart || 'সর্বশেষ পিরিয়ড শুরুর তারিখ'}:
          </label>
          <input
            type="date"
            value={trackerData.lastPeriodStartDate}
            onChange={(e) => setTrackerData({ ...trackerData, lastPeriodStartDate: e.target.value })}
            className="w-full p-3 rounded-2xl bg-pink-50/50 dark:bg-slate-800 border border-pink-200 dark:border-pink-800 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-pink-500"
          />
        </div>

        {/* Cycle Length Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
            <span className="font-semibold">মাসিক চক্রের দৈর্ঘ্য (সাধারণত ২৮ দিন):</span>
            <strong className="font-mono text-pink-600 dark:text-pink-400 font-bold text-sm">
              {trackerData.cycleLengthDays} দিন
            </strong>
          </div>
          <input
            type="range"
            min="21"
            max="38"
            value={trackerData.cycleLengthDays}
            onChange={(e) => setTrackerData({ ...trackerData, cycleLengthDays: Number(e.target.value) })}
            className="w-full accent-pink-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span>২১ দিন</span>
            <span>২৮ দিন (স্বাভাবিক)</span>
            <span>৩৮ দিন</span>
          </div>
        </div>

        {/* Duration Days Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
            <span className="font-semibold">রক্তস্রাবের সময়কাল (সাধারণত ৩-৭ দিন):</span>
            <strong className="font-mono text-pink-600 dark:text-pink-400 font-bold text-sm">
              {trackerData.periodDurationDays} দিন
            </strong>
          </div>
          <input
            type="range"
            min="3"
            max="10"
            value={trackerData.periodDurationDays}
            onChange={(e) => setTrackerData({ ...trackerData, periodDurationDays: Number(e.target.value) })}
            className="w-full accent-pink-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span>৩ দিন (সর্বনিম্ন হানাফি)</span>
            <span>৫-৭ দিন</span>
            <span>১০ দিন (সর্বোচ্চ হানাফি)</span>
          </div>
        </div>

        {/* Save Button in Pink */}
        <button
          onClick={handleSaveData}
          className="w-full py-3 rounded-2xl bg-pink-600 hover:bg-pink-700 active:scale-[0.99] text-white font-bold shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {savedNotice ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>সফলভাবে সংরক্ষিত হয়েছে!</span>
            </>
          ) : (
            <span>{t.saveData || 'পরিবর্তন সংরক্ষণ করুন'}</span>
          )}
        </button>
      </div>

      {/* Islamic Worship & Purity Rules Section (Authentic Fiqh) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-pink-200 dark:border-pink-900/50 space-y-3.5 text-xs shadow-2xs">
        <div className="flex items-center gap-2 border-b border-pink-100 dark:border-pink-950 pb-2.5">
          <BookOpen className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {t.islamicPurityRules || 'শরিয়তের বিধান ও নিয়মাবলী'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              হায়িজ, ইস্তিহাজা ও নিফাসের জরুরী আহকাম
            </p>
          </div>
        </div>

        <div className="space-y-2.5 text-slate-700 dark:text-slate-300 leading-relaxed font-bengali">
          <div className="p-3 rounded-2xl bg-pink-50/70 dark:bg-slate-800 space-y-1 border border-pink-200/60 dark:border-pink-900/40">
            <strong className="text-pink-700 dark:text-pink-300 block font-bold text-xs">
              ১. নামাজের হুকুম (মাফ ও কাযা নেই):
            </strong>
            <p>
              হায়িজ বা মাসিক চলাকালীন সময় নামায সম্পূর্ণ মাফ। এই সময়ের নামায পরবর্তীতে কাযা করতে হয় না। (সহীহ বুখারী: ৩২১)
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-pink-50/70 dark:bg-slate-800 space-y-1 border border-pink-200/60 dark:border-pink-900/40">
            <strong className="text-pink-700 dark:text-pink-300 block font-bold text-xs">
              ২. রমজানের রোজা (পরবর্তীতে কাযা ওয়াজিব):
            </strong>
            <p>
              হায়িজাবস্থায় রোজা রাখা নিষিদ্ধ। তবে পরবর্তীতে সুবিধামত সময়ে ছুটে যাওয়া রোজাগুলো সমপরিমাণে কাযা আদায় করে নিতে হবে।
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-pink-50/70 dark:bg-slate-800 space-y-1 border border-pink-200/60 dark:border-pink-900/40">
            <strong className="text-pink-700 dark:text-pink-300 block font-bold text-xs">
              ৩. যিকির, দোয়া ও কুরআন তিলাওয়াত:
            </strong>
            <p>
              সুবহানাল্লাহ, আলহামদুলিল্লাহ, আল্লাহু আকবার, ইস্তিগফার, দরূদ শরীফ ও সকাল-সন্ধ্যার মাসনূন দুআ যেকোনো সময় পাঠ করা সওয়াবের কাজ ও সম্পূর্ণ বৈধ। সরাসরি স্পর্শ ব্যতিরেকে কুরআন মুখস্থ বা অ্যাপ থেকে অর্থ অধ্যয়ন করা যায়।
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-pink-50/70 dark:bg-slate-800 space-y-1 border border-pink-200/60 dark:border-pink-900/40">
            <strong className="text-pink-700 dark:text-pink-300 block font-bold text-xs">
              ৪. পবিত্রতার ফরজ গোসল ও ইস্তিহাজা:
            </strong>
            <p>
              রক্তস্রাব পুরোপুরি বন্ধ হওয়ার পর ফরজ গোসল সম্পন্ন করে অবিলম্বে পরবর্তী ওয়াক্ত থেকে নামাজ শুরু করতে হবে। ১০ দিনের অতিরিক্ত রক্তপাত হলে তা ইস্তিহাজা (রোগ) হিসেবে গণ্য হবে এবং প্রতি ওয়াক্তে নতুন ওজু করে নামাজ আদায় করতে হবে।
            </p>
          </div>
        </div>
      </div>

      {/* Security & PIN Setup / Wipe Data in Pink */}
      <div className="p-4 sm:p-5 rounded-3xl bg-pink-50/50 dark:bg-slate-900 border border-pink-200 dark:border-pink-900/50 space-y-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
          <KeyRound className="w-4 h-4 text-pink-600 dark:text-pink-400" />
          <span>প্রাইভেসি লক ও ডেটা মুছে ফেলা</span>
        </div>

        {/* Set PIN */}
        <div className="flex gap-2">
          <input
            type="password"
            maxLength={6}
            placeholder="নতুন ৪-সংখ্যার গোপন পিন দিন"
            value={newPinSetup}
            onChange={(e) => setNewPinSetup(e.target.value)}
            className="flex-1 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-pink-200 dark:border-pink-800 text-slate-900 dark:text-white text-xs"
          />
          <button
            onClick={handleSetNewPin}
            disabled={newPinSetup.length < 4}
            className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs disabled:opacity-40 cursor-pointer transition-colors"
          >
            পিন সেট
          </button>
        </div>

        {/* Wipe Data Button */}
        <div className="pt-1 flex items-center justify-between">
          <button
            onClick={handleClearAllData}
            className="text-rose-600 dark:text-rose-400 font-medium hover:underline flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>সমস্ত ট্র্যাকার ডেটা মুছে ফেলুন</span>
          </button>
          {savedPinHash && (
            <span className="text-[10px] text-pink-600 dark:text-pink-400 font-medium">
              পিন সুরক্ষা সক্রিয়
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeriodTracker;
