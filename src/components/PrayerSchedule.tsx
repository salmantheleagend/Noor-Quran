import React, { useState, useEffect, useMemo } from 'react';
import { AppLanguage, LocationInfo, PrayerTimesData, NaflPrayerItem } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  calculatePrayerTimes,
  formatPrayerTime12h,
  getNaflPrayersList,
  getRunningNaflPrayer,
  toBn,
} from '../utils/prayerTimes';
import {
  Clock,
  Calendar,
  AlertTriangle,
  Bell,
  BellOff,
  BellRing,
  Volume2,
  ChevronDown,
  ChevronUp,
  Check,
  CheckCircle2,
  Sunrise,
  Sunset,
  Moon,
  Sparkles,
  BookOpen,
  Info,
  TrendingUp,
  Send,
  Sliders,
} from 'lucide-react';
import { playAdhanTone, triggerHaptic } from '../utils/audioPlayer';
import {
  getPrayerNotificationSettings,
  savePrayerNotificationSettings,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestPrayerNotification,
  PrayerNotificationSettings,
} from '../utils/prayerNotifications';
import {
  NamazTracker,
  DayNamazRecord,
  WaqtKey,
  STORAGE_KEY_NAMAZ_LOG,
  STORAGE_KEY_TRACKING_START_DATE,
  STORAGE_KEY_TRACKING_INITIALIZED,
} from './NamazTracker';
import { NaflHeroCard } from './NaflHeroCard';

interface PrayerScheduleProps {
  language: AppLanguage;
  location: LocationInfo;
  prayerTimes: PrayerTimesData;
  calculationMethod: string;
  asrMethod: 'hanafi' | 'standard';
  onChangeCalculationMethod: (method: string) => void;
  onChangeAsrMethod: (method: 'hanafi' | 'standard') => void;
  onOpenLocationModal: () => void;
  onOpenSettings?: () => void;
  ramadanMode?: boolean;
  onToggleRamadanMode?: () => void;
}

export const PrayerSchedule: React.FC<PrayerScheduleProps> = ({
  language,
  location,
  prayerTimes,
  calculationMethod,
  asrMethod,
  onChangeCalculationMethod,
  onChangeAsrMethod,
  onOpenLocationModal,
  onOpenSettings,
  ramadanMode = false,
  onToggleRamadanMode,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'today' | 'tracker' | '7days' | 'monthly'>('today');
  const [selectedNaflFilter, setSelectedNaflFilter] = useState<'all' | 'timed' | 'general'>('all');
  const [expandedNaflId, setExpandedNaflId] = useState<string | null>(null);
  // Prayer screen starts in normal mode by default (not active). User can turn it ON manually if wanted.
  const [isRamadanActive, setIsRamadanActive] = useState<boolean>(false);

  const [notifSettings, setNotifSettings] = useState<PrayerNotificationSettings>(() =>
    getPrayerNotificationSettings()
  );
  const [permStatus, setPermStatus] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermission()
  );
  const [isNotifConfigOpen, setIsNotifConfigOpen] = useState<boolean>(false);
  const [notifFeedback, setNotifFeedback] = useState<string | null>(null);

  // Sync settings when updated from SettingsModal or system
  useEffect(() => {
    const syncNotifs = () => {
      setNotifSettings(getPrayerNotificationSettings());
      setPermStatus(getNotificationPermission());
    };
    window.addEventListener('prayer_notification_settings_updated', syncNotifs);
    window.addEventListener('prayer_notification_permission_changed', syncNotifs);
    return () => {
      window.removeEventListener('prayer_notification_settings_updated', syncNotifs);
      window.removeEventListener('prayer_notification_permission_changed', syncNotifs);
    };
  }, []);

  const toggleNotification = async (waqtId: string) => {
    triggerHaptic(15);
    const key = waqtId as keyof PrayerNotificationSettings['prayers'];

    if (permStatus !== 'granted') {
      const res = await requestNotificationPermission();
      setPermStatus(res.permission);
      if (!res.granted) {
        setNotifFeedback(
          language === 'bn'
            ? 'নোটিফিকেশন পেতে অনুগ্রহ করে পারমিশন Allow করুন।'
            : 'Please allow notification permission to receive prayer alerts.'
        );
        setTimeout(() => setNotifFeedback(null), 3500);
        return;
      }
    }

    const currentVal = notifSettings.prayers[key] ?? true;
    const updated: PrayerNotificationSettings = {
      ...notifSettings,
      enabled: true,
      prayers: {
        ...notifSettings.prayers,
        [key]: !currentVal,
      },
    };
    setNotifSettings(updated);
    savePrayerNotificationSettings(updated);

    const isNowOn = updated.prayers[key];
    const waqtLabel =
      key === 'fajr'
        ? (language === 'bn' ? 'ফজর' : 'Fajr')
        : key === 'dhuhr'
        ? (language === 'bn' ? 'যোহর' : 'Dhuhr')
        : key === 'asr'
        ? (language === 'bn' ? 'আসর' : 'Asr')
        : key === 'maghrib'
        ? (language === 'bn' ? 'মাগরিব' : 'Maghrib')
        : (language === 'bn' ? 'ইশা' : 'Isha');

    setNotifFeedback(
      isNowOn
        ? (language === 'bn' ? `✓ ${waqtLabel} আযান রিমাইন্ডার সক্রিয়` : `✓ ${waqtLabel} reminder enabled`)
        : (language === 'bn' ? `✕ ${waqtLabel} রিমাইন্ডার বন্ধ` : `✕ ${waqtLabel} reminder disabled`)
    );
    setTimeout(() => setNotifFeedback(null), 2500);
  };

  const handleTestAdhan = () => {
    triggerHaptic(25);
    playAdhanTone();
  };

  // Helper for today's date in YYYY-MM-DD
  const getTodayDateStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayDateStr = useMemo(() => getTodayDateStr(), []);

  // Today's Namaz record for consistency tracker
  const [todayNamazLog, setTodayNamazLog] = useState<DayNamazRecord>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NAMAZ_LOG);
      if (saved) {
        const parsed = JSON.parse(saved);
        const key = getTodayDateStr();
        return parsed[key] || { dateStr: key };
      }
    } catch {
      // fallback
    }
    return { dateStr: getTodayDateStr() };
  });

  // Listen for updates from NamazTracker or other parts of the app
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_NAMAZ_LOG);
        if (saved) {
          const parsed = JSON.parse(saved);
          const key = getTodayDateStr();
          const nextDay = parsed[key] || { dateStr: key };
          setTodayNamazLog((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(nextDay)) {
              return prev;
            }
            return nextDay;
          });
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('namaz_log_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('namaz_log_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Toggle waqt completion
  const handleToggleWaqtPrayed = (waqtId: WaqtKey) => {
    triggerHaptic(20);
    const key = todayDateStr;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NAMAZ_LOG);
      const allLogs: Record<string, DayNamazRecord> = saved ? JSON.parse(saved) : {};
      const currentDay = allLogs[key] || { dateStr: key };
      const currentStatus = currentDay[waqtId];
      const nextStatus = currentStatus === 'prayed' ? 'none' : 'prayed';

      const updatedDay: DayNamazRecord = {
        ...currentDay,
        [waqtId]: nextStatus,
      };

      allLogs[key] = updatedDay;
      localStorage.setItem(STORAGE_KEY_NAMAZ_LOG, JSON.stringify(allLogs));

      // Ensure tracking start date is initialized to this day if not yet initialized
      const isInit = localStorage.getItem(STORAGE_KEY_TRACKING_INITIALIZED);
      if (isInit !== 'true') {
        localStorage.setItem(STORAGE_KEY_TRACKING_START_DATE, key);
        localStorage.setItem(STORAGE_KEY_TRACKING_INITIALIZED, 'true');
      }

      setTodayNamazLog(updatedDay);
      window.dispatchEvent(new Event('namaz_log_updated'));
    } catch (e) {
      console.warn('Failed to update waqt status', e);
    }
  };

  // Completed prayers count & percentage for circular progress ring
  const completedPrayersCount = useMemo(() => {
    const waqts: WaqtKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    return waqts.filter((w) => todayNamazLog[w] === 'prayed').length;
  }, [todayNamazLog]);

  const prayerProgressPercentage = useMemo(() => {
    return Math.round((completedPrayersCount / 5) * 100);
  }, [completedPrayersCount]);

  // Nafl Prayers Data
  const naflPrayers = getNaflPrayersList(prayerTimes, new Date(), language);
  const runningNafl = getRunningNaflPrayer(prayerTimes, new Date(), language);

  const filteredNafl = naflPrayers.filter((p) => {
    if (selectedNaflFilter === 'timed') return p.isTimeBounded;
    if (selectedNaflFilter === 'general') return !p.isTimeBounded;
    return true;
  });

  // Generate 7-day forecast
  const next7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const times = calculatePrayerTimes(d, location, calculationMethod, asrMethod);
    const dateLabel = d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    return { date: d, dateLabel, times };
  });

  // Generate 30-day monthly schedule
  const monthlyDays = [...Array(30)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const times = calculatePrayerTimes(d, location, calculationMethod, asrMethod);
    const dayStr = d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'numeric',
      day: 'numeric',
    });
    const weekdayStr = d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      weekday: 'short',
    });
    return { dayStr, weekdayStr, times };
  });

  const isFridayToday = new Date().getDay() === 5;

  const mainWaqts = [
    {
      id: 'fajr',
      label: t.fajr,
      startTime: prayerTimes.fajr,
      endTime: prayerTimes.sunrise,
      icon: <Moon className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />,
    },
    {
      id: 'dhuhr',
      label: isFridayToday ? (t.jummah || (language === 'bn' ? "জুমু'আ" : 'Jumuah')) : t.dhuhr,
      startTime: prayerTimes.dhuhr,
      endTime: prayerTimes.asr,
      icon: <Sunrise className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />,
    },
    {
      id: 'asr',
      label: t.asr,
      startTime: prayerTimes.asr,
      endTime: prayerTimes.sunsetProhibitedStart,
      icon: <Sunset className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />,
    },
    {
      id: 'maghrib',
      label: t.maghrib,
      startTime: prayerTimes.maghrib,
      endTime: prayerTimes.isha,
      icon: <Sunset className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />,
    },
    {
      id: 'isha',
      label: t.isha,
      startTime: prayerTimes.isha,
      endTime: prayerTimes.fajr,
      icon: <Moon className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />,
    },
  ];

  return (
    <div className="pb-32 pt-2 px-3 sm:px-4 max-w-2xl mx-auto space-y-4 text-[#1F2937] dark:text-[#F8E8ED]">
      {/* Header & Location & Ramadan Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#10235A] dark:text-white">
            {t.prayer}
          </h2>
          <p className="text-xs text-[#6B7280] dark:text-slate-400">
            {language === 'bn' ? location.nameBn : location.name}, {location.country}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              triggerHaptic(20);
              const nextState = !isRamadanActive;
              setIsRamadanActive(nextState);
              if (onToggleRamadanMode) {
                onToggleRamadanMode();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[38px] ${
              isRamadanActive
                ? 'bg-[#21409A] text-white border border-[#21409A]'
                : 'bg-[#F8E8ED] hover:bg-[#E9B7C3]/30 dark:bg-[#142042] dark:hover:bg-[#1C2D5A] text-[#10235A] dark:text-[#F8E8ED] border border-[#E7D9DE] dark:border-[#24386E]'
            }`}
            title={language === 'bn' ? 'রমজান ও রোজা মোড চালু/বন্ধ' : 'Toggle Ramadan & Fasting Mode'}
          >
            <span className="text-sm">🌙</span>
            <span>
              {isRamadanActive
                ? (language === 'bn' ? 'রমজান মোড: সক্রিয়' : 'Ramadan Mode: Active')
                : (language === 'bn' ? 'রমজান মোড চালু করুন' : 'Enable Ramadan Mode')}
            </span>
          </button>

          <button
            onClick={handleTestAdhan}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8E8ED] hover:bg-[#E9B7C3]/30 dark:bg-[#142042] dark:hover:bg-[#1C2D5A] text-[#21409A] dark:text-[#E9B7C3] text-xs font-semibold transition-colors border border-[#E7D9DE] dark:border-[#24386E] cursor-pointer min-h-[38px]"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'আযান সুর' : 'Adhan Melody'}</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(15);
              if (onOpenSettings) {
                onOpenSettings();
              } else {
                setIsNotifConfigOpen((prev) => !prev);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border cursor-pointer min-h-[38px] ${
              notifSettings.enabled && permStatus === 'granted'
                ? 'bg-[#21409A] text-white border-[#21409A] shadow-xs'
                : 'bg-[#F8E8ED] hover:bg-[#E9B7C3]/30 dark:bg-[#142042] dark:hover:bg-[#1C2D5A] text-[#10235A] dark:text-[#F8E8ED] border-[#E7D9DE] dark:border-[#24386E]'
            }`}
            title={language === 'bn' ? 'নামাজের আযান ও ওয়াক্ত নোটিফিকেশন সেটিংস' : 'Prayer Adhan Notification Settings'}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'নোটিফিকেশন সেটিংস' : 'Alerts Settings'}</span>
          </button>
        </div>
      </div>

      {/* Floating / Inline Toast Feedback */}
      {notifFeedback && (
        <div className="p-3 rounded-2xl bg-[#21409A] text-white dark:bg-[#E9B7C3] dark:text-[#10235A] font-bold text-xs flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 shrink-0" />
            <span>{notifFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotifFeedback(null)}
            className="text-xs opacity-75 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Subtle compact reminder link to open Settings if notification permission is not yet enabled */}
      {permStatus !== 'granted' && onOpenSettings && (
        <button
          type="button"
          onClick={() => {
            triggerHaptic(15);
            onOpenSettings();
          }}
          className="w-full py-2.5 px-3.5 rounded-2xl bg-linear-to-r from-[#21409A]/10 via-[#F8E8ED] to-white dark:from-[#10235A]/50 dark:via-[#142042] dark:to-[#0C152E] border border-[#21409A]/20 dark:border-[#24386E] flex items-center justify-between text-xs text-[#10235A] dark:text-white font-medium hover:bg-[#F8E8ED] dark:hover:bg-[#142042] transition-colors cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#21409A] dark:bg-[#E9B7C3] text-white dark:text-[#10235A] flex items-center justify-center shrink-0">
              <BellRing className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] sm:text-xs truncate">
              {language === 'bn'
                ? 'ফোনে ওয়াক্ত ও আযান রিমাইন্ডার পেতে সেটিংসে গিয়ে নোটিফিকেশন অন করুন'
                : 'Enable prayer notifications & adhan alerts in Settings'}
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#21409A] dark:text-[#E9B7C3] shrink-0 ml-2">
            {language === 'bn' ? 'সেটিংস →' : 'Settings →'}
          </span>
        </button>
      )}

      {/* SPECIAL RAMADAN FASTING BANNER (When user turns Ramadan Mode ON) */}
      {isRamadanActive && (
        <div className="p-4 rounded-3xl bg-linear-to-r from-[#10235A] via-[#18327E] to-[#0C152E] text-white border border-[#24386E] shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-[#E9B7C3] flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#E9B7C3] animate-ping" />
              <span>
                {language === 'bn'
                  ? '🌙 মোবারক রমাদান ও রোজা সময়সূচি'
                  : '🌙 Ramadan Kareem & Fasting Schedule'}
              </span>
            </span>
            <span className="text-[11px] text-[#F8E8ED]/90">
              {language === 'bn' ? 'আজকের রোজা' : "Today's Fast"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] text-[#F8E8ED]/90 block font-semibold">
                {language === 'bn' ? 'সাহরির শেষ সময়' : 'Sahri Ends'}
              </span>
              <span className="text-lg font-black font-mono text-white mt-0.5 block">
                {formatPrayerTime12h(prayerTimes.sahriEnd, language)}
              </span>
              <span className="text-[10px] text-[#F8E8ED]/70 block">
                {language === 'bn' ? 'ফজর: ' : 'Fajr: '}{formatPrayerTime12h(prayerTimes.fajr, language)}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] text-[#F8E8ED]/90 block font-semibold">
                {language === 'bn' ? 'ইফতারের সময়' : 'Iftar Time'}
              </span>
              <span className="text-lg font-black font-mono text-[#E9B7C3] mt-0.5 block">
                {formatPrayerTime12h(prayerTimes.iftar, language)}
              </span>
              <span className="text-[10px] text-[#F8E8ED]/70 block">
                {language === 'bn' ? 'মাগরিব: ' : 'Maghrib: '}{formatPrayerTime12h(prayerTimes.maghrib, language)}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-xs text-[#F8E8ED]/90 flex items-center justify-between">
            <span className="italic">
              {language === 'bn'
                ? '"হে আল্লাহ, তোমার জন্যই রোজা রেখেছি এবং তোমার রিযিকেই ইফতার করছি।"'
                : '"O Allah, for You I have fasted, and with Your provision I break my fast."'}
            </span>
          </div>
        </div>
      )}

      {/* Tabs: Today / Checklist & Missed Tracker / 7 Days / Monthly */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-[#F8E8ED] dark:bg-[#142042] rounded-2xl text-xs border border-[#E7D9DE] dark:border-[#24386E]">
        <button
          onClick={() => setActiveTab('today')}
          className={`py-2 px-2 font-medium rounded-xl transition-all truncate text-center min-h-[40px] cursor-pointer ${
            activeTab === 'today'
              ? 'bg-[#21409A] text-white shadow-xs font-bold'
              : 'text-[#10235A] dark:text-slate-300 hover:text-[#21409A]'
          }`}
        >
          {language === 'bn' ? 'আজকের ওয়াক্ত' : "Today's Waqt"}
        </button>
        <button
          onClick={() => setActiveTab('tracker')}
          className={`py-2 px-2 font-medium rounded-xl transition-all truncate text-center flex items-center justify-center gap-1 min-h-[40px] cursor-pointer ${
            activeTab === 'tracker'
              ? 'bg-[#21409A] text-white shadow-xs font-bold'
              : 'text-[#10235A] dark:text-slate-300 hover:text-[#21409A]'
          }`}
        >
          <span>{language === 'bn' ? 'সালাত চেকলিস্ট' : 'Salah Checklist'}</span>
        </button>
        <button
          onClick={() => setActiveTab('7days')}
          className={`py-2 px-2 font-medium rounded-xl transition-all truncate text-center min-h-[40px] cursor-pointer ${
            activeTab === '7days'
              ? 'bg-[#21409A] text-white shadow-xs font-bold'
              : 'text-[#10235A] dark:text-slate-300 hover:text-[#21409A]'
          }`}
        >
          {language === 'bn' ? '৭ দিনের সূচি' : '7 Days Schedule'}
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`py-2 px-2 font-medium rounded-xl transition-all truncate text-center min-h-[40px] cursor-pointer ${
            activeTab === 'monthly'
              ? 'bg-[#21409A] text-white shadow-xs font-bold'
              : 'text-[#10235A] dark:text-slate-300 hover:text-[#21409A]'
          }`}
        >
          {language === 'bn' ? 'মাসিক ক্যালেন্ডার' : 'Monthly Calendar'}
        </button>
      </div>

      {/* TODAY'S VIEW */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {/* PRAYER CONSISTENCY & CIRCULAR PROGRESS HERO CARD */}
          <div className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-linear-to-br from-white via-[#FDF9F8] to-[#F8E8ED]/50 dark:from-[#142042] dark:via-[#10235A] dark:to-[#0C152E] border border-[#E7D9DE] dark:border-[#24386E] shadow-sm space-y-4">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 dark:bg-emerald-400/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex items-center justify-between gap-3">
              {/* Left: Titles, Motivation and Interactive Waqt Pills */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#21409A] dark:bg-[#E9B7C3] text-white dark:text-[#10235A] shadow-xs">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#10235A] dark:text-white leading-tight">
                      {language === 'bn' ? 'আজকের সালাত ধারাবাহিকতা' : "Today's Prayer Consistency"}
                    </h3>
                    <span className="text-[10px] text-[#6B7280] dark:text-slate-400">
                      {language === 'bn' ? 'দৈনিক ৫ ওয়াক্ত ফরজ সালাত আদায়ের অগ্রগতি' : "Progress of 5 Daily Obligatory Prayers"}
                    </span>
                  </div>
                </div>

                <p className="text-xs font-semibold leading-relaxed pt-0.5 text-[#10235A] dark:text-emerald-300">
                  {prayerProgressPercentage === 100
                    ? (language === 'bn' ? '🎉 মাশাআল্লাহ! আজকের সব ফরজ সালাত সম্পন্ন করেছেন!' : '🎉 MashaAllah! All 5 obligatory prayers completed today!')
                    : prayerProgressPercentage >= 60
                    ? (language === 'bn' ? '✨ দারুণ একাগ্রতা! বাকি ওয়াক্তগুলো সময়মতো আদায়ের চেষ্টা করুন' : '✨ Great dedication! Strive to complete the remaining prayers on time')
                    : prayerProgressPercentage > 0
                    ? (language === 'bn' ? '🌱 আলহামদুলিল্লাহ! সালাতের ধারাবাহিকতা বজায় রাখুন' : '🌱 Alhamdulillah! Keep up your prayer consistency')
                    : (language === 'bn' ? '⏳ আজকের সালাত আদায় শুরু করে দিনটি বরকতময় করুন' : '⏳ Start today’s prayers to bless your day')}
                </p>

                {/* 5-Waqt Quick Interactive Indicator Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {mainWaqts.map((w) => {
                    const isDone = todayNamazLog[w.id as WaqtKey] === 'prayed';
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => handleToggleWaqtPrayed(w.id as WaqtKey)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-xs scale-102'
                            : 'bg-white dark:bg-[#1A284E] text-[#10235A] dark:text-slate-200 border border-[#E7D9DE] dark:border-[#24386E] hover:border-emerald-500/50'
                        }`}
                        title={language === 'bn' ? `${w.label} আদায় পরিবর্তন করুন` : `Toggle ${w.label}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isDone ? 'bg-white' : 'bg-slate-300 dark:bg-slate-500'
                          }`}
                        />
                        <span>{w.label}</span>
                        {isDone ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <span className="text-[10px] opacity-40">+</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Circular Progress Bar */}
              <div className="relative shrink-0 flex items-center justify-center p-1">
                <svg
                  className="w-20 h-20 sm:w-22 sm:h-22 -rotate-90 transform"
                  viewBox="0 0 100 100"
                >
                  <defs>
                    <linearGradient
                      id="prayerProgressGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    className="stroke-[#E7D9DE] dark:stroke-[#1E2E5D]"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Progress Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="url(#prayerProgressGrad)"
                    strokeWidth="8"
                    strokeDasharray={238.76}
                    strokeDashoffset={238.76 - (prayerProgressPercentage / 100) * 238.76}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                {/* Percentage & Count inside Circular Progress Bar */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                  <span className="text-base sm:text-lg font-black font-mono text-[#10235A] dark:text-white tabular-nums leading-none">
                    {language === 'bn' ? `${toBn(prayerProgressPercentage)}%` : `${prayerProgressPercentage}%`}
                  </span>
                  <span className="text-[10px] font-bold text-[#6B7280] dark:text-emerald-300 mt-0.5">
                    {language === 'bn' ? `${toBn(completedPrayersCount)}/৫ ওয়াক্ত` : `${completedPrayersCount}/5 Prayers`}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Footer bar linking to tracker */}
            <div className="relative flex items-center justify-between pt-2 border-t border-[#E7D9DE]/70 dark:border-[#24386E]/70 text-[11px]">
              <span className="text-[#6B7280] dark:text-slate-400 font-medium">
                {language === 'bn' ? 'ধারাবাহিকতা স্কোর: ' : 'Consistency Score: '}
                <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {completedPrayersCount === 5
                    ? (language === 'bn' ? '১০০% সফল' : '100% Achieved')
                    : (language === 'bn' ? `${toBn(completedPrayersCount * 20)}% অর্জিত` : `${completedPrayersCount * 20}% Done`)}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  setActiveTab('tracker');
                }}
                className="font-bold text-[#21409A] dark:text-[#E9B7C3] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'bn' ? 'সালাত কাজা ও পূর্ণাঙ্গ চেকলিস্ট' : 'Missed Prayers & Full Checklist'}</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Main 5 Waqts List */}
          <div className="space-y-2">
            {mainWaqts.map((waqt) => {
              const isNotified =
                notifSettings.enabled &&
                (notifSettings.prayers[waqt.id as keyof PrayerNotificationSettings['prayers']] ?? false);
              const isPrayed = todayNamazLog[waqt.id as WaqtKey] === 'prayed';

              return (
                <div
                  key={waqt.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs hover:border-[#21409A]/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#F8E8ED] dark:bg-[#10235A] flex items-center justify-center shrink-0 border border-[#E7D9DE] dark:border-[#24386E]">
                      {waqt.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#10235A] dark:text-white">
                        {waqt.label}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-[#6B7280] dark:text-slate-400 mt-0.5">
                        <span>
                          {language === 'bn' ? 'শুরু: ' : 'Start: '}
                          <strong className="text-[#21409A] dark:text-[#E9B7C3] font-mono font-semibold">
                            {formatPrayerTime12h(waqt.startTime, language)}
                          </strong>
                        </span>
                        <span>·</span>
                        <span>
                          {language === 'bn' ? 'শেষ: ' : 'End: '}
                          <strong className="text-[#10235A] dark:text-slate-300 font-mono font-semibold">
                            {formatPrayerTime12h(waqt.endTime, language)}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <span className="text-base font-bold font-mono tabular-nums text-[#10235A] dark:text-white block">
                        {formatPrayerTime12h(waqt.startTime, language)}
                      </span>
                      <span className="text-[10px] text-[#6B7280] dark:text-slate-400 block">
                        {language === 'bn' ? 'ওয়াক্ত শুরু' : 'Waqt Start'}
                      </span>
                    </div>

                    {/* Quick Mark Completed Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleWaqtPrayed(waqt.id as WaqtKey)}
                      className={`h-9 px-2.5 sm:px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isPrayed
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-[#F8E8ED] dark:bg-[#10235A] text-[#21409A] dark:text-[#E9B7C3] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-[#E7D9DE] dark:border-[#24386E]'
                      }`}
                      title={language === 'bn' ? `${waqt.label} সালাত আদায় পরিবর্তন করুন` : `Toggle ${waqt.label} prayer`}
                      aria-label={language === 'bn' ? `${waqt.label} আদায়` : `${waqt.label} prayer`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          isPrayed ? 'text-white' : 'text-[#21409A] dark:text-[#E9B7C3]'
                        }`}
                      />
                      <span className="hidden sm:inline">
                        {isPrayed
                          ? (language === 'bn' ? 'আদায়কৃত' : 'Prayed')
                          : (language === 'bn' ? 'পড়েছি' : 'Mark')}
                      </span>
                    </button>

                    <button
                      onClick={() => toggleNotification(waqt.id)}
                      className={`min-h-[44px] min-w-[36px] rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                        isNotified
                          ? 'text-[#21409A] bg-[#F8E8ED] dark:bg-[#10235A] border border-[#E7D9DE] dark:border-[#24386E]'
                          : 'text-[#6B7280] hover:bg-[#F8E8ED] dark:hover:bg-[#142042]'
                      }`}
                      title={language === 'bn' ? 'আযান নোটিফিকেশন চালু/বন্ধ' : 'Toggle Adhan Notification'}
                      aria-label="Notification toggle"
                    >
                      {isNotified ? (
                        <Bell className="w-4 h-4 fill-current text-[#21409A] dark:text-[#E9B7C3]" />
                      ) : (
                        <BellOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sun Cycle: Sunrise & Sunset (সূর্যোদয় ও সূর্যাস্ত সময়) */}
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-800/40">
                <Sunrise className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[11px] text-[#6B7280] dark:text-slate-400 font-medium block">
                  {t.sunrise} ({language === 'bn' ? 'ভোর' : 'Dawn'})
                </span>
                <span className="text-sm font-bold font-mono text-[#10235A] dark:text-white">
                  {formatPrayerTime12h(prayerTimes.sunrise, language)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 border-l border-[#E7D9DE]/60 dark:border-[#1C2D5A] pl-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200/60 dark:border-orange-800/40">
                <Sunset className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[11px] text-[#6B7280] dark:text-slate-400 font-medium block">
                  {t.sunset || (language === 'bn' ? 'সূর্যাস্ত' : 'Sunset')} ({language === 'bn' ? 'সন্ধ্যা' : 'Dusk'})
                </span>
                <span className="text-sm font-bold font-mono text-orange-600 dark:text-orange-300">
                  {formatPrayerTime12h(prayerTimes.sunset, language)}
                </span>
              </div>
            </div>
          </div>

          {/* Prohibited / Makruh Prayer Times Section (Muted Deep Red styling) */}
          <div className="rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-700 dark:text-rose-400" />
              <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wide">
                {language === 'bn' ? 'নামাজ পড়ার ৩টি নিষিদ্ধ ও মাকরুহ সময়' : '3 Prohibited / Makruh Prayer Times'}
              </h4>
            </div>

            <p className="text-xs text-[#1F2937] dark:text-slate-300 leading-normal">
              {language === 'bn'
                ? 'এই তিন সময়ে যেকোনো ফরজ, ওয়াজিব ও নফল নামাজ আদায় করা এবং সিজদা করা সম্পূর্ণ নিষিদ্ধ:'
                : 'Performing any fard, wajib, nafl prayer or sajdah is strictly prohibited during these 3 periods:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#142042] border border-rose-200/60 dark:border-rose-900/40">
                <span className="font-semibold text-rose-900 dark:text-rose-300 block">
                  {language === 'bn' ? '১. সূর্যোদয়ের সময়' : '1. Sunrise Period'}
                </span>
                <span className="text-[#6B7280] dark:text-slate-400 font-mono text-[11px] block mt-0.5">
                  {formatPrayerTime12h(prayerTimes.sunrise, language)} {language === 'bn' ? 'হতে ১৫ মিনিট' : 'for 15 mins'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-[#142042] border border-rose-200/60 dark:border-rose-900/40">
                <span className="font-semibold text-rose-900 dark:text-rose-300 block">
                  {language === 'bn' ? '২. দ্বিপ্রহর / জাওয়াল' : '2. Midday / Zawal'}
                </span>
                <span className="text-[#6B7280] dark:text-slate-400 font-mono text-[11px] block mt-0.5">
                  {formatPrayerTime12h(prayerTimes.zawalStart, language)} - {formatPrayerTime12h(prayerTimes.zawalEnd, language)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-[#142042] border border-rose-200/60 dark:border-rose-900/40">
                <span className="font-semibold text-rose-900 dark:text-rose-300 block">
                  {language === 'bn' ? '৩. সূর্যাস্তের সময়' : '3. Sunset Period'}
                </span>
                <span className="text-[#6B7280] dark:text-slate-400 font-mono text-[11px] block mt-0.5">
                  {formatPrayerTime12h(prayerTimes.sunsetProhibitedStart, language)} - {formatPrayerTime12h(prayerTimes.maghrib, language)}
                </span>
              </div>
            </div>
          </div>

          {/* COMPREHENSIVE NAFL PRAYER SCHEDULE & GUIDE */}
          <div className="rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-sm p-4 sm:p-5 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7D9DE] dark:border-[#1C2D5A] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#F8E8ED] dark:bg-[#10235A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-[#10235A] dark:text-white">
                    {language === 'bn' ? 'সকল নফল নামাজের পূর্ণাঙ্গ সময়সূচি ও গাইড' : 'Comprehensive Nafl Prayer Schedule & Guide'}
                  </h3>
                </div>
                <p className="text-[11px] text-[#6B7280] dark:text-slate-400 mt-1">
                  {language === 'bn'
                    ? 'ইশরাক, চাশত, আওয়াবীন ও তাহাজ্জুদসহ গুরুত্বপূর্ণ নফল সালাতের সময় ও ফজিলত'
                    : 'Times and virtues for Ishraq, Chasht, Awwabin, Tahajjud and other Sunnah prayers'}
                </p>
              </div>

              {runningNafl && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8E8ED] dark:bg-[#10235A] border border-[#21409A]/40 text-[#21409A] dark:text-[#E9B7C3] text-xs font-bold shrink-0 self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-[#21409A] animate-ping" />
                  <span>
                    {language === 'bn'
                      ? `এখন চলমান: ${runningNafl.nameBn}`
                      : `Now Active: ${runningNafl.nameEn || runningNafl.nameBn}`}
                  </span>
                </div>
              )}
            </div>

            {/* Highlighted active Nafl hero card with interactive styles */}
            {runningNafl && (
              <NaflHeroCard
                runningNafl={runningNafl}
                language={language}
                compact
              />
            )}

            {/* Filter Tabs for Nafl */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F8E8ED] dark:bg-[#10235A] rounded-xl text-xs font-medium border border-[#E7D9DE] dark:border-[#24386E]">
              <button
                onClick={() => setSelectedNaflFilter('all')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
                  selectedNaflFilter === 'all'
                    ? 'bg-[#21409A] text-white shadow-2xs font-bold'
                    : 'text-[#10235A] dark:text-slate-300 hover:text-[#21409A]'
                }`}
              >
                {language === 'bn' ? `সকল নফল (${toBn(naflPrayers.length)})` : `All Nafl (${naflPrayers.length})`}
              </button>
              <button
                onClick={() => setSelectedNaflFilter('timed')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
                  selectedNaflFilter === 'timed'
                    ? 'bg-[#21409A] text-white shadow-2xs font-bold'
                    : 'text-[#10235A] dark:text-slate-300 hover:text-[#21409A]'
                }`}
              >
                {language === 'bn'
                  ? `ওয়াক্তভিত্তিক (${toBn(naflPrayers.filter((p) => p.isTimeBounded).length)})`
                  : `Time-based (${naflPrayers.filter((p) => p.isTimeBounded).length})`}
              </button>
              <button
                onClick={() => setSelectedNaflFilter('general')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
                  selectedNaflFilter === 'general'
                    ? 'bg-[#21409A] text-white shadow-2xs font-bold'
                    : 'text-[#10235A] dark:text-slate-300 hover:text-[#21409A]'
                }`}
              >
                {language === 'bn'
                  ? `অন্যান্য নফল (${toBn(naflPrayers.filter((p) => !p.isTimeBounded).length)})`
                  : `Other Nafl (${naflPrayers.filter((p) => !p.isTimeBounded).length})`}
              </button>
            </div>

            {/* Nafl Prayers List */}
            <div className="space-y-2.5">
              {filteredNafl.map((nafl) => {
                const isExpanded = expandedNaflId === nafl.id;
                const isRunning = nafl.isRunning;

                return (
                  <div
                    key={nafl.id}
                    className={`rounded-2xl border transition-all ${
                      isRunning
                        ? 'bg-[#F8E8ED]/90 dark:bg-[#142042] border-[#21409A] shadow-xs'
                        : 'bg-[#FCFAF8] dark:bg-[#10235A]/40 border-[#E7D9DE] dark:border-[#1C2D5A]'
                    }`}
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => {
                        triggerHaptic(10);
                        setExpandedNaflId(isExpanded ? null : nafl.id);
                      }}
                      className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#10235A] dark:text-white flex items-center gap-1.5">
                            {language === 'bn' ? nafl.nameBn : (nafl.nameEn || nafl.nameBn)}
                          </h4>
                          <span
                            className="font-arabic text-sm sm:text-base text-[#10235A] dark:text-[#E9B7C3] font-bold px-2 py-0.5 rounded-md bg-[#F8E8ED] dark:bg-[#10235A] border border-[#E7D9DE]/60 dark:border-[#24386E]/60 shadow-2xs select-text"
                            dir="rtl"
                          >
                            {nafl.nameAr}
                          </span>
                          {isRunning && (
                            <span className="text-[10px] bg-[#21409A] text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                              <Check className="w-2.5 h-2.5" /> {language === 'bn' ? 'চলমান' : 'Active'}
                            </span>
                          )}
                        </div>

                        {/* Start & End Times */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280] dark:text-slate-300">
                          {nafl.isTimeBounded ? (
                            <>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
                                <span>
                                  {language === 'bn' ? 'শুরু: ' : 'Start: '}
                                  <strong className="font-mono text-[#21409A] dark:text-[#E9B7C3]">
                                    {formatPrayerTime12h(nafl.startTime, language)}
                                  </strong>
                                </span>
                              </span>
                              <span>·</span>
                              <span>
                                {language === 'bn' ? 'শেষ: ' : 'End: '}
                                <strong className="font-mono text-[#10235A] dark:text-slate-200">
                                  {formatPrayerTime12h(nafl.endTime, language)}
                                </strong>
                              </span>
                            </>
                          ) : (
                            <span className="flex items-center gap-1 text-[#6B7280] dark:text-slate-400">
                              <Info className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
                              <span>
                                {language === 'bn'
                                  ? `${nafl.startTime} (${nafl.endTime})`
                                  : `${nafl.startTimeEn || nafl.startTime} (${nafl.endTimeEn || nafl.endTime})`}
                              </span>
                            </span>
                          )}
                          <span>·</span>
                          <span className="text-[#21409A] dark:text-[#E9B7C3] font-medium">
                            {language === 'bn' ? `রাকাত: ${nafl.rakatBn}` : `Rakats: ${nafl.rakatEn || nafl.rakatBn}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="w-7 h-7 rounded-lg bg-white dark:bg-[#142042] text-[#6B7280] flex items-center justify-center border border-[#E7D9DE] dark:border-[#24386E] transition-transform"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className={`px-3.5 pb-4 pt-1 border-t border-[#E7D9DE] dark:border-[#1C2D5A] space-y-3 text-xs text-[#1F2937] dark:text-slate-300 ${language === 'bn' ? 'font-bengali' : 'font-sans'}`}>
                        {/* Virtue */}
                        <div className="p-3 rounded-xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] space-y-1">
                          <span className="font-bold text-[#21409A] dark:text-[#E9B7C3] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            {language === 'bn' ? 'ফজিলত ও গুরুত্ব:' : 'Virtues & Significance:'}
                          </span>
                          <p className="leading-relaxed text-[#1F2937] dark:text-slate-200">
                            {language === 'bn' ? nafl.virtueBn : (nafl.virtueEn || nafl.virtueBn)}
                          </p>
                          <span className="text-[11px] text-[#6B7280] dark:text-slate-400 block pt-0.5">
                            {language === 'bn' ? `দলিল: ${nafl.hadithReferenceBn}` : `Reference: ${nafl.hadithReferenceEn || nafl.hadithReferenceBn}`}
                          </span>
                        </div>

                        {/* How to pray */}
                        <div className="p-3 rounded-xl bg-[#F8E8ED]/70 dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#24386E] space-y-1">
                          <span className="font-bold text-[#10235A] dark:text-white flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
                            {language === 'bn' ? 'নামাজ আদায়ের নিয়ম ও পদ্ধতি:' : 'How to Pray:'}
                          </span>
                          <p className="leading-relaxed text-[#1F2937] dark:text-slate-300">
                            {language === 'bn' ? nafl.howToPrayBn : (nafl.howToPrayEn || nafl.howToPrayBn)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sahri Details */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] space-y-1">
            <div className="flex items-center gap-1.5 text-[#21409A] dark:text-[#E9B7C3] font-semibold text-xs">
              <Sunrise className="w-3.5 h-3.5" />
              <span>
                {language === 'bn'
                  ? 'সাহরির শেষ সময় (রোজা ও তাহাজ্জুদ সমাপ্তি)'
                  : 'Sahri End Time (Fasting & Tahajjud End)'}
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-0.5">
              <span className="text-sm font-bold font-mono text-[#10235A] dark:text-slate-200">
                {formatPrayerTime12h(prayerTimes.sahriEnd, language)}
              </span>
              <span className="text-[11px] text-[#6B7280]">
                {language === 'bn' ? 'সতর্কতামূলক সমাপ্তি: ' : 'Precautionary Stop: '}
                {formatPrayerTime12h(prayerTimes.sahriWarning, language)}
              </span>
            </div>
          </div>

          {/* Calculation Method & Asr Selector */}
          <div className="p-3.5 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#1C2D5A] space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#10235A] dark:text-slate-300">
                {language === 'bn' ? 'আসরের হিসাব পদ্ধতি:' : 'Asr Calculation Method:'}
              </span>
              <div className="flex items-center gap-1 bg-white dark:bg-[#142042] p-0.5 rounded-lg border border-[#E7D9DE] dark:border-[#24386E]">
                <button
                  onClick={() => onChangeAsrMethod('hanafi')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    asrMethod === 'hanafi'
                      ? 'bg-[#21409A] text-white shadow-xs font-bold'
                      : 'text-[#6B7280] dark:text-slate-400'
                  }`}
                >
                  {t.hanafi}
                </button>
                <button
                  onClick={() => onChangeAsrMethod('standard')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    asrMethod === 'standard'
                      ? 'bg-[#21409A] text-white shadow-xs font-bold'
                      : 'text-[#6B7280] dark:text-slate-400'
                  }`}
                >
                  {t.standardShafi}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#10235A] dark:text-slate-300">
                {language === 'bn' ? 'হিসাবের সংস্থা:' : 'Calculation Authority:'}
              </span>
              <select
                value={calculationMethod}
                onChange={(e) => onChangeCalculationMethod(e.target.value)}
                className="p-1.5 rounded-lg bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#24386E] text-[#10235A] dark:text-slate-200 cursor-pointer text-xs"
              >
                <option value="IFB">
                  {language === 'bn' ? 'ইসলামিক ফাউন্ডেশন বাংলাদেশ / করাচী' : 'Islamic Foundation Bangladesh / Karachi'}
                </option>
                <option value="MWL">
                  {language === 'bn' ? 'মুসলিম ওয়ার্ল্ড লীগ (MWL)' : 'Muslim World League (MWL)'}
                </option>
                <option value="MAKKAH">
                  {language === 'bn' ? 'উম্মুল কুরা বিশ্ববিদ্যালয় (মক্কা)' : 'Umm al-Qura University (Makkah)'}
                </option>
                <option value="ISNA">
                  {language === 'bn' ? 'ইসলামিক সোসাইটি অব নর্থ আমেরিকা' : 'Islamic Society of North America (ISNA)'}
                </option>
                <option value="EGYPT">
                  {language === 'bn' ? 'মিশরীয় জেনারেল অথরিটি' : 'Egyptian General Authority'}
                </option>
              </select>
            </div>
          </div>

          {/* Direct Daily Checklist & Missed Namaz Section right on Today's Screen */}
          <div className="pt-2 border-t border-[#E7D9DE] dark:border-[#1C2D5A]">
            <NamazTracker language={language} />
          </div>
        </div>
      )}

      {/* DEDICATED SALAH CHECKLIST & MONTHLY MISSED TRACKER TAB */}
      {activeTab === 'tracker' && (
        <div className="space-y-4">
          <NamazTracker language={language} />
        </div>
      )}

      {/* 7-DAY FORECAST VIEW */}
      {activeTab === '7days' && (
        <div className="space-y-2">
          {next7Days.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between border-b border-[#E7D9DE] dark:border-[#1C2D5A] pb-1.5">
                <span className="text-xs font-bold text-[#21409A] dark:text-[#E9B7C3]">
                  {item.dateLabel}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
                  <span>
                    {language === 'bn' ? 'সূর্যাস্ত: ' : 'Sunset: '}
                    <strong className="text-orange-600 dark:text-orange-300 font-mono">
                      {formatPrayerTime12h(item.times.sunset, language)}
                    </strong>
                  </span>
                  <span>·</span>
                  <span>
                    {language === 'bn' ? 'ইফতার: ' : 'Iftar: '}
                    <strong className="text-[#10235A] dark:text-white font-mono">
                      {formatPrayerTime12h(item.times.iftar, language)}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-1 text-center font-mono text-xs">
                <div>
                  <span className="text-[10px] text-[#6B7280] block font-sans">{t.fajr}</span>
                  <span className="font-semibold text-[#10235A] dark:text-white">{item.times.fajr}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B7280] block font-sans">{t.dhuhr}</span>
                  <span className="font-semibold text-[#10235A] dark:text-white">{item.times.dhuhr}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B7280] block font-sans">{t.asr}</span>
                  <span className="font-semibold text-[#10235A] dark:text-white">{item.times.asr}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B7280] block font-sans">{t.maghrib}</span>
                  <span className="font-semibold text-[#21409A] dark:text-[#E9B7C3]">{item.times.maghrib}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B7280] block font-sans">{t.isha}</span>
                  <span className="font-semibold text-[#10235A] dark:text-white">{item.times.isha}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 30-DAY MONTHLY VIEW */}
      {activeTab === 'monthly' && (
        <div className="rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] overflow-x-auto shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8E8ED] dark:bg-[#10235A] text-[#10235A] dark:text-slate-300 border-b border-[#E7D9DE] dark:border-[#1C2D5A]">
              <tr>
                <th className="p-2.5 font-semibold">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="p-2.5 font-semibold">{t.fajr}</th>
                <th className="p-2.5 font-semibold">{t.sunrise}</th>
                <th className="p-2.5 font-semibold">{t.dhuhr}</th>
                <th className="p-2.5 font-semibold">{t.asr}</th>
                <th className="p-2.5 font-semibold text-orange-600 dark:text-orange-400">
                  {t.sunset || (language === 'bn' ? 'সূর্যাস্ত' : 'Sunset')}
                </th>
                <th className="p-2.5 font-semibold">{t.maghrib}</th>
                <th className="p-2.5 font-semibold">{t.isha}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7D9DE] dark:divide-[#1C2D5A] font-mono">
              {monthlyDays.map((row, i) => (
                <tr key={i} className="hover:bg-[#F8E8ED]/40 dark:hover:bg-[#10235A]/40">
                  <td className="p-2.5 font-sans font-medium text-[#10235A] dark:text-slate-200">
                    {row.dayStr} ({row.weekdayStr})
                  </td>
                  <td className="p-2.5">{row.times.fajr}</td>
                  <td className="p-2.5 text-[#6B7280]">{row.times.sunrise}</td>
                  <td className="p-2.5">{row.times.dhuhr}</td>
                  <td className="p-2.5">{row.times.asr}</td>
                  <td className="p-2.5 text-orange-600 dark:text-orange-300">{row.times.sunset}</td>
                  <td className="p-2.5 font-semibold text-[#21409A] dark:text-[#E9B7C3]">{row.times.maghrib}</td>
                  <td className="p-2.5">{row.times.isha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PrayerSchedule;
