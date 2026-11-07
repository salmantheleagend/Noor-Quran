import React, { useState, useEffect, useMemo } from 'react';
import { AppLanguage } from '../types';
import {
  DayNamazRecord,
  WaqtKey,
  STORAGE_KEY_NAMAZ_LOG,
  STORAGE_KEY_TRACKING_START_DATE,
  STORAGE_KEY_TRACKING_INITIALIZED,
} from './NamazTracker';
import {
  calculatePrayerStreak,
  formatIsoDate,
  PrayerStreakSummary,
  DayStreakItem,
} from '../utils/streakTracker';
import { triggerHaptic } from '../utils/audioPlayer';
import {
  Flame,
  CheckCircle2,
  TrendingUp,
  Award,
  ChevronRight,
  Sparkles,
  Check,
  Calendar,
} from 'lucide-react';

interface DailyPrayerStreakCardProps {
  language: AppLanguage;
  onNavigate: (tab: string, extra?: unknown) => void;
  toBn: (num: number | string) => string;
  activeWaqt?: string;
}

const WAQTS: { id: WaqtKey; labelBn: string; labelEn: string; icon: string }[] = [
  { id: 'fajr', labelBn: 'ফজর', labelEn: 'Fajr', icon: '🌌' },
  { id: 'dhuhr', labelBn: 'যোহর', labelEn: 'Dhuhr', icon: '☀️' },
  { id: 'asr', labelBn: 'আসর', labelEn: 'Asr', icon: '🌤️' },
  { id: 'maghrib', labelBn: 'মাগরিব', labelEn: 'Maghrib', icon: '🌇' },
  { id: 'isha', labelBn: 'ইশা', labelEn: 'Isha', icon: '🌙' },
];

export const DailyPrayerStreakCard: React.FC<DailyPrayerStreakCardProps> = ({
  language,
  onNavigate,
  toBn,
  activeWaqt,
}) => {
  const todayStr = useMemo(() => formatIsoDate(new Date()), []);

  // Namaz logs state from localStorage
  const [logs, setLogs] = useState<Record<string, DayNamazRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NAMAZ_LOG);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Listen for real-time updates across the app (PrayerSchedule, NamazTracker, HomeDashboard)
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_NAMAZ_LOG);
        if (saved) {
          const parsed = JSON.parse(saved);
          setLogs((prev) => {
            if (JSON.stringify(prev) === saved) return prev;
            return parsed;
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

  // Compute Streak & Daily Progress
  const streakSummary: PrayerStreakSummary = useMemo(() => {
    return calculatePrayerStreak(logs);
  }, [logs]);

  const todayRecord: DayNamazRecord = logs[todayStr] || { dateStr: todayStr };

  // Handle toggling prayer completion for today directly from the card
  const handleToggleWaqt = (waqtId: WaqtKey) => {
    triggerHaptic(20);
    const key = waqtId as keyof DayNamazRecord;
    const currentStatus = todayRecord[key];
    const nextStatus = currentStatus === 'prayed' ? 'none' : 'prayed';

    const updatedToday: DayNamazRecord = {
      ...todayRecord,
      [waqtId]: nextStatus,
    };

    const nextLogs: Record<string, DayNamazRecord> = {
      ...logs,
      [todayStr]: updatedToday,
    };

    try {
      localStorage.setItem(STORAGE_KEY_NAMAZ_LOG, JSON.stringify(nextLogs));

      // Ensure tracking start date is initialized
      const isInit = localStorage.getItem(STORAGE_KEY_TRACKING_INITIALIZED);
      if (isInit !== 'true') {
        localStorage.setItem(STORAGE_KEY_TRACKING_START_DATE, todayStr);
        localStorage.setItem(STORAGE_KEY_TRACKING_INITIALIZED, 'true');
      }

      setLogs(nextLogs);
      window.dispatchEvent(new Event('namaz_log_updated'));
    } catch (e) {
      console.warn('Failed to update waqt status from HomeDashboard streak card', e);
    }
  };

  const isFriday = new Date().getDay() === 5;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-white via-[#FCF9F8] to-[#F8E8ED]/40 dark:from-[#142042] dark:via-[#10235A] dark:to-[#0B1530] border border-[#E7D9DE] dark:border-[#1C2D5A] p-4 sm:p-5 shadow-2xs space-y-4 transition-all">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/10 dark:bg-emerald-400/5 rounded-full blur-2xl pointer-events-none" />

      {/* TOP HEADER: Title, Streak Badge & Best Record */}
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-300 ${
            streakSummary.currentStreak > 0
              ? 'bg-linear-to-br from-amber-500 to-orange-500 text-white scale-105 shadow-amber-500/20'
              : 'bg-[#F8E8ED] dark:bg-[#1C2D5A] text-[#21409A] dark:text-[#E9B7C3]'
          }`}>
            <Flame className={`w-5 h-5 ${streakSummary.currentStreak > 0 ? 'fill-current animate-pulse' : ''}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className={`text-sm sm:text-base font-bold text-[#10235A] dark:text-white leading-tight ${language === 'bn' ? 'font-bengali' : 'font-sans'}`}>
                {language === 'bn' ? 'দৈনিক সালাত ট্র্যাকার ও ধারাবাহিকতা' : 'Daily Prayer Tracker & Streak'}
              </h3>
            </div>
            <p className="text-[11px] text-[#6B7280] dark:text-slate-400 truncate">
              {language === 'bn'
                ? '৫ ওয়াক্ত ফরজ সালাত আদায়ের ধারাবাহিক স্ট্রিক'
                : 'Maintain consistency across all 5 daily obligatory prayers'}
            </p>
          </div>
        </div>

        {/* Dynamic Streak Pill */}
        <div className="shrink-0 flex flex-col items-end">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-2xs border transition-all ${
            streakSummary.currentStreak > 0
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
              : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'
          }`}>
            <span className="text-sm">🔥</span>
            <span>
              {streakSummary.currentStreak > 0
                ? (language === 'bn'
                    ? `${toBn(streakSummary.currentStreak)} দিনের স্ট্রিক`
                    : `${streakSummary.currentStreak} Day Streak`)
                : (language === 'bn' ? 'আজকের স্ট্রিক শুরু করুন' : 'Start Today')}
            </span>
          </div>
          {streakSummary.bestStreak > 0 && (
            <span className="text-[10px] text-[#6B7280] dark:text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
              <Award className="w-3 h-3 text-amber-500" />
              <span>
                {language === 'bn'
                  ? `সর্বোচ্চ: ${toBn(streakSummary.bestStreak)} দিন`
                  : `Best: ${streakSummary.bestStreak}d`}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* TODAY'S 5-WAQT INTERACTIVE CHECKLIST */}
      <div className="relative space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#10235A] dark:text-slate-200 flex items-center gap-1.5">
            <span>{language === 'bn' ? 'আজকের সালাত আদায়:' : "Today's Prayers:"}</span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-black">
              {toBn(streakSummary.todayPrayedCount)} / {toBn(5)} ({toBn(streakSummary.todayCompletionPercent)}%)
            </span>
          </span>
          <span className="text-[11px] text-[#6B7280] dark:text-slate-400">
            {streakSummary.isTodayCompleted
              ? (language === 'bn' ? '🎉 আলহামদুলিল্লাহ! সব ওয়াক্ত সম্পন্ন' : '🎉 All prayers completed!')
              : (language === 'bn' ? 'ট্যাপ করে আদায় চিহ্নিত করুন' : 'Tap to mark completed')}
          </span>
        </div>

        {/* 5 Waqts Grid */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {WAQTS.map((w) => {
            const isDone = todayRecord[w.id as keyof DayNamazRecord] === 'prayed';
            const isActive = activeWaqt === w.id;
            const label =
              w.id === 'dhuhr' && isFriday
                ? (language === 'bn' ? "জুমু'আ" : 'Jumuah')
                : (language === 'bn' ? w.labelBn : w.labelEn);

            return (
              <button
                key={w.id}
                type="button"
                onClick={() => handleToggleWaqt(w.id)}
                className={`group relative p-2 sm:p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 cursor-pointer border ${
                  isActive
                    ? 'prayer-active-glow ring-2 ring-[#0F5F62] dark:ring-[#B9E2DD] ' +
                      (isDone
                        ? 'bg-[#0F5F62] text-white border-[#083B40]'
                        : 'bg-[#F3FAF9] dark:bg-[#083B40] text-[#0F5F62] dark:text-[#B9E2DD] border-[#0F5F62] font-black shadow-sm')
                    : isDone
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-[#1A284E] text-[#10235A] dark:text-slate-200 border-[#E7D9DE] dark:border-[#24386E] hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-[#1C2D5A]'
                }`}
                title={language === 'bn' ? `${label} সালাত আদায় পরিবর্তন করুন` : `Toggle ${label}`}
              >
                {isActive && (
                  <span className="absolute -top-1.5 px-1 py-0.2 rounded-full bg-[#0F5F62] text-white dark:bg-[#B9E2DD] dark:text-[#083B40] text-[8px] font-black uppercase tracking-wider shadow-xs scale-90 whitespace-nowrap">
                    {language === 'bn' ? 'চলমান' : 'Now'}
                  </span>
                )}

                {/* Waqt Icon / Emoji */}
                <span className="text-xs sm:text-sm select-none">
                  {isDone ? '✓' : w.icon}
                </span>

                {/* Waqt Name */}
                <span className="text-[10.5px] sm:text-xs font-bold truncate max-w-full leading-tight">
                  {label}
                </span>

                {/* Sub-status Indicator Dot or Checkmark */}
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    isDone
                      ? 'bg-white'
                      : isActive
                      ? 'bg-[#0F5F62] dark:bg-[#B9E2DD] animate-ping'
                      : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-emerald-400'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* 7-DAY VISUAL COMPLETION STREAK HISTORY ROW */}
      <div className="relative pt-2 border-t border-[#E7D9DE]/70 dark:border-[#1C2D5A] space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-[#6B7280] dark:text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
            <span>{language === 'bn' ? 'বিগত ৭ দিনের ধারাবাহিকতা সূচক' : 'Last 7 Days Streak Indicator'}</span>
          </span>
          <span className="font-mono text-[10px] text-[#6B7280] dark:text-slate-400">
            {language === 'bn'
              ? `${toBn(streakSummary.weeklyCompletionCount)}/৩৫ সালাত সম্পন্ন`
              : `${streakSummary.weeklyCompletionCount}/35 prayers`}
          </span>
        </div>

        {/* 7 Day Pills */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
          {streakSummary.last7Days.map((day: DayStreakItem, idx: number) => {
            const isFull = day.isFull;
            const hasAny = day.hasAny;
            const isToday = day.isToday;

            return (
              <div
                key={day.dateStr}
                className={`p-1.5 rounded-xl flex flex-col items-center justify-between gap-1 border transition-all ${
                  isToday
                    ? 'ring-2 ring-[#21409A] dark:ring-[#E9B7C3] bg-white dark:bg-[#1A284E] border-[#21409A]/40 shadow-xs'
                    : 'bg-white/60 dark:bg-[#10235A]/50 border-[#E7D9DE]/70 dark:border-[#1C2D5A]'
                }`}
              >
                {/* Day Name */}
                <span className={`text-[10px] font-bold block ${
                  isToday
                    ? 'text-[#21409A] dark:text-[#E9B7C3]'
                    : 'text-[#6B7280] dark:text-slate-400'
                }`}>
                  {language === 'bn' ? day.dayNameBn : day.dayNameEn}
                </span>

                {/* Visual Status Indicator */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-transform ${
                    isFull
                      ? 'bg-emerald-600 text-white shadow-2xs scale-105'
                      : hasAny
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500'
                  }`}
                  title={`${day.dateStr}: ${day.prayedCount}/5`}
                >
                  {isFull ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : hasAny ? (
                    toBn(day.prayedCount)
                  ) : (
                    '·'
                  )}
                </div>

                {/* Date number */}
                <span className="text-[9px] font-mono text-[#6B7280] dark:text-slate-400">
                  {toBn(day.dateNum)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER BAR: Motivational Hadith + Full Tracker Navigation */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#E7D9DE]/70 dark:border-[#1C2D5A] text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <p className="italic truncate text-[10.5px]">
            {language === 'bn'
              ? '"আল্লাহর নিকট সর্বাধিক প্রিয় আমল যা নিয়মিত করা হয়..." — বুখারী'
              : '"The most beloved deed to Allah is that which is continuous..." — Bukhari'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic(15);
            onNavigate('prayer');
          }}
          className="self-end sm:self-auto inline-flex items-center gap-1 font-bold text-[#21409A] dark:text-[#E9B7C3] hover:underline cursor-pointer shrink-0"
        >
          <span>{language === 'bn' ? 'কাজা ও বিস্তারিত ট্র্যাকার' : 'Full Tracker & Missed'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
export default DailyPrayerStreakCard;
