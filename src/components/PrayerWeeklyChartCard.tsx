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
  BarChart3,
  TrendingUp,
  Calendar,
  Sparkles,
  ChevronRight,
  Info,
  Check,
  X,
  Minus,
} from 'lucide-react';

interface PrayerWeeklyChartCardProps {
  language: AppLanguage;
  onNavigate: (tab: string, extra?: unknown) => void;
  toBn: (num: number | string) => string;
}

const WAQT_CONFIG: { id: WaqtKey; labelBn: string; labelEn: string; icon: string }[] = [
  { id: 'fajr', labelBn: 'ফজর', labelEn: 'Fajr', icon: '🌌' },
  { id: 'dhuhr', labelBn: 'যোহর', labelEn: 'Dhuhr', icon: '☀️' },
  { id: 'asr', labelBn: 'আসর', labelEn: 'Asr', icon: '🌤️' },
  { id: 'maghrib', labelBn: 'মাগরিব', labelEn: 'Maghrib', icon: '🌇' },
  { id: 'isha', labelBn: 'ইশা', labelEn: 'Isha', icon: '🌙' },
];

export const PrayerWeeklyChartCard: React.FC<PrayerWeeklyChartCardProps> = ({
  language,
  onNavigate,
  toBn,
}) => {
  const isBn = language === 'bn';
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

  // Track the currently inspected day in the chart (defaults to today)
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  // Sync with updates across all components
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

  // Compute 7-day stats
  const streakSummary: PrayerStreakSummary = useMemo(() => {
    return calculatePrayerStreak(logs);
  }, [logs]);

  const { last7Days, weeklyCompletionCount } = streakSummary;
  const weeklyTotalPossible = 35; // 7 days * 5 waqt
  const weeklyPercentage = Math.round((weeklyCompletionCount / weeklyTotalPossible) * 100);
  const dailyAverage = (weeklyCompletionCount / 7).toFixed(1);

  // Fallback to today if selected day isn't in current 7 days window
  const activeDay = useMemo(() => {
    return last7Days.find((d) => d.dateStr === selectedDateStr) || last7Days[last7Days.length - 1];
  }, [last7Days, selectedDateStr]);

  const activeRecord: DayNamazRecord = logs[activeDay?.dateStr || todayStr] || {
    dateStr: activeDay?.dateStr || todayStr,
  };

  // Toggle waqt status for the selected day if it's today
  const handleToggleWaqtToday = (waqtId: WaqtKey) => {
    if (!activeDay?.isToday) return;
    triggerHaptic(20);

    const key = waqtId as keyof DayNamazRecord;
    const currentStatus = activeRecord[key];
    const nextStatus = currentStatus === 'prayed' ? 'none' : 'prayed';

    const updatedRecord: DayNamazRecord = {
      ...activeRecord,
      [waqtId]: nextStatus,
    };

    const nextLogs: Record<string, DayNamazRecord> = {
      ...logs,
      [todayStr]: updatedRecord,
    };

    try {
      localStorage.setItem(STORAGE_KEY_NAMAZ_LOG, JSON.stringify(nextLogs));
      const isInit = localStorage.getItem(STORAGE_KEY_TRACKING_INITIALIZED);
      if (isInit !== 'true') {
        localStorage.setItem(STORAGE_KEY_TRACKING_START_DATE, todayStr);
        localStorage.setItem(STORAGE_KEY_TRACKING_INITIALIZED, 'true');
      }
      setLogs(nextLogs);
      window.dispatchEvent(new CustomEvent('namaz_log_updated'));
    } catch (e) {
      console.error('Failed to save prayer log', e);
    }
  };

  // Format date display for selected day header
  const formatDisplayDate = (item: DayStreakItem) => {
    if (item.isToday) {
      return isBn ? `আজ (${item.dayNameBn})` : `Today (${item.dayNameEn})`;
    }
    const [, m, d] = item.dateStr.split('-');
    const monthsBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIdx = parseInt(m, 10) - 1;
    if (isBn) {
      return `${item.dayNameBn}, ${toBn(d)} ${monthsBn[monthIdx] || ''}`;
    }
    return `${item.dayNameEn}, ${d} ${monthsEn[monthIdx] || ''}`;
  };

  // Dynamic feedback phrase
  const getMotivationalText = () => {
    if (weeklyCompletionCount >= 30) {
      return isBn
        ? 'মাশাআল্লাহ! অসাধারণ নিয়মানুবর্তিতা ও ধারাবাহিকতা।'
        : 'MashaAllah! Outstanding discipline and consistency.';
    }
    if (weeklyCompletionCount >= 20) {
      return isBn
        ? 'চমৎকার অগ্রগতি! আগামী সপ্তাহে শতভাগ লক্ষ্য পূরণ করুন।'
        : 'Great progress! Aim for 100% completion this week.';
    }
    if (weeklyCompletionCount > 0) {
      return isBn
        ? 'ধারাবাহিক প্রচেষ্টা চালিয়ে যান, আল্লাহ আপনার সালাত কবুল করুন।'
        : 'Keep striving, may Allah accept and ease all your prayers.';
    }
    return isBn
      ? 'প্রতিদিনের ওয়াক্ত চিহ্নিত করে সালাতের ধারাবাহিকতা বজায় রাখুন।'
      : 'Log daily prayers to build and visualize your consistent prayer habit.';
  };

  return (
    <section
      aria-label={isBn ? 'গত ৭ দিনের নামাজের পরিসংখ্যান' : 'Last 7 Days Prayer Completion Stats'}
      className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 sm:p-5 transition-all overflow-hidden"
    >
      {/* 1. Header & Navigation */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200/50 dark:border-teal-800/50 shadow-2xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {isBn ? 'গত ৭ দিনের নামাজের চার্ট' : 'Last 7 Days Prayer Stats'}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-100/70 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/50">
                <TrendingUp className="w-3 h-3" />
                {toBn(weeklyPercentage)}%
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn
                ? 'দৈনিক ৫ ওয়াক্ত ফরয সালাতের সমাপ্তি হার'
                : 'Daily 5 Fard prayers completion breakdown'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('namaz-tracker')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1.5 rounded-xl border border-teal-200/60 dark:border-teal-800/40 shrink-0 transition-colors active:scale-95 cursor-pointer"
        >
          <span>{isBn ? 'ট্র্যাকার' : 'Tracker'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Mini KPI Stats Strip */}
      <div className="grid grid-cols-3 gap-2 p-2.5 mb-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80">
        <div className="text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {isBn ? 'মোট সম্পন্ন' : 'Completed'}
          </p>
          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            <span className="text-teal-600 dark:text-teal-400">{toBn(weeklyCompletionCount)}</span>
            <span className="text-xs text-slate-400 font-normal">/{toBn(weeklyTotalPossible)}</span>
          </p>
        </div>

        <div className="text-center border-x border-slate-200/60 dark:border-slate-700/60">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {isBn ? 'সাপ্তাহিক হার' : 'Success Rate'}
          </p>
          <p className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {toBn(weeklyPercentage)}%
          </p>
        </div>

        <div className="text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {isBn ? 'দৈনিক গড়' : 'Daily Avg'}
          </p>
          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {toBn(dailyAverage)}
            <span className="text-[11px] text-slate-400 font-normal ml-0.5">
              {isBn ? 'ওয়াক্ত' : 'waqt'}
            </span>
          </p>
        </div>
      </div>

      {/* 3. The 7-Day Bar Chart Container */}
      <div className="relative pt-2 pb-1 px-1">
        {/* Y-Axis Horizontal Guide Lines (5 waqt total) */}
        <div className="absolute inset-x-2 top-2 bottom-12 pointer-events-none flex flex-col justify-between opacity-35 dark:opacity-25">
          <div className="border-b border-dashed border-slate-300 dark:border-slate-600 w-full relative">
            <span className="absolute -top-2 right-0 text-[9px] font-mono font-medium text-slate-400">
              5 {isBn ? 'ওয়াক্ত' : ''}
            </span>
          </div>
          <div className="border-b border-dashed border-slate-300 dark:border-slate-600 w-full relative">
            <span className="absolute -top-2 right-0 text-[9px] font-mono font-medium text-slate-400">
              3
            </span>
          </div>
          <div className="border-b border-dashed border-slate-300 dark:border-slate-600 w-full relative">
            <span className="absolute -top-2 right-0 text-[9px] font-mono font-medium text-slate-400">
              1
            </span>
          </div>
          <div className="border-b border-slate-300 dark:border-slate-700 w-full" />
        </div>

        {/* 7 Columns Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 relative z-10">
          {last7Days.map((item) => {
            const isSelected = item.dateStr === (activeDay?.dateStr || todayStr);
            const heightPercent = (item.prayedCount / 5) * 100;
            const isFull = item.prayedCount === 5;
            const hasAny = item.prayedCount > 0;

            // Bar Gradient & Theme
            let barColorClass = 'bg-slate-200 dark:bg-slate-800';
            if (isFull) {
              barColorClass = 'bg-linear-to-t from-emerald-600 via-teal-500 to-emerald-400 shadow-sm shadow-emerald-500/20';
            } else if (item.prayedCount >= 3) {
              barColorClass = 'bg-linear-to-t from-teal-600 to-teal-400 shadow-sm shadow-teal-500/15';
            } else if (item.prayedCount >= 1) {
              barColorClass = 'bg-linear-to-t from-amber-600 to-amber-400 shadow-sm shadow-amber-500/15';
            }

            return (
              <button
                key={item.dateStr}
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  setSelectedDateStr(item.dateStr);
                }}
                className={`group flex flex-col items-center cursor-pointer p-1 rounded-xl transition-all select-none ${
                  isSelected
                    ? 'bg-teal-50/80 dark:bg-teal-950/40 ring-1.5 ring-teal-500/80 dark:ring-teal-400/80 scale-[1.02]'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
                title={`${item.dateStr}: ${item.prayedCount}/5 ${isBn ? 'ওয়াক্ত সম্পন্ন' : 'prayers completed'}`}
              >
                {/* Value Above Bar */}
                <div className="h-5 flex items-center justify-center mb-1">
                  {isFull ? (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-2xs">
                      ✓
                    </span>
                  ) : hasAny ? (
                    <span
                      className={`text-[11px] font-bold font-mono ${
                        isSelected
                          ? 'text-teal-700 dark:text-teal-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {toBn(item.prayedCount)}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono">
                      {toBn(0)}
                    </span>
                  )}
                </div>

                {/* Vertical Bar Track (Height 88px) */}
                <div className="w-full max-w-[28px] sm:max-w-[32px] h-24 rounded-full bg-slate-100 dark:bg-slate-800/90 p-0.5 flex flex-col justify-end overflow-hidden border border-slate-200/50 dark:border-slate-700/50 relative">
                  {/* Actual Filled Bar */}
                  <div
                    style={{ height: `${Math.max(heightPercent, 0)}%` }}
                    className={`w-full rounded-full transition-all duration-500 ease-out flex items-start justify-center pt-1 ${barColorClass}`}
                  >
                    {isFull && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Day Labels at Bottom */}
                <div className="mt-2 text-center flex flex-col items-center">
                  <span
                    className={`text-[11px] font-semibold leading-tight ${
                      item.isToday
                        ? 'text-teal-600 dark:text-teal-400 font-bold'
                        : isSelected
                        ? 'text-slate-900 dark:text-slate-100'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isBn ? item.dayNameBn : item.dayNameEn}
                  </span>

                  <span
                    className={`text-[10px] leading-tight font-medium ${
                      item.isToday
                        ? 'text-teal-700 dark:text-teal-300 font-bold'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {toBn(item.dateNum)}
                  </span>

                  {item.isToday && (
                    <span className="mt-0.5 inline-block w-1.5 h-1.5 rounded-full bg-teal-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Selected Day Breakdown Card */}
      {activeDay && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {formatDisplayDate(activeDay)}
              </span>
              {activeDay.isToday && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  {isBn ? 'আজ' : 'Today'}
                </span>
              )}
            </div>

            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="text-teal-600 dark:text-teal-400">{toBn(activeDay.prayedCount)}</span>
              <span className="text-slate-400 font-normal"> / {toBn(5)} {isBn ? 'ওয়াক্ত' : 'waqt'}</span>
            </span>
          </div>

          {/* Waqt 5 Status Chips */}
          <div className="grid grid-cols-5 gap-1.5">
            {WAQT_CONFIG.map((w) => {
              const status = activeRecord[w.id as keyof DayNamazRecord];
              const isPrayed = status === 'prayed';
              const isMissed = status === 'missed';
              const isToday = activeDay.isToday;

              return (
                <button
                  key={w.id}
                  type="button"
                  disabled={!isToday}
                  onClick={() => handleToggleWaqtToday(w.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all select-none ${
                    isToday ? 'cursor-pointer active:scale-95' : 'cursor-default'
                  } ${
                    isPrayed
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                      : isMissed
                      ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300/80 dark:border-rose-900/60 text-rose-700 dark:text-rose-300'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-700/60 text-slate-500 dark:text-slate-400'
                  }`}
                  title={
                    isToday
                      ? isBn
                        ? `${w.labelBn} পরিবর্তন করতে ট্যাপ করুন`
                        : `Tap to toggle ${w.labelEn}`
                      : `${w.labelEn}: ${status || 'none'}`
                  }
                >
                  <span className="text-xs leading-none mb-1">{w.icon}</span>
                  <span className="text-[11px] font-bold leading-tight truncate w-full">
                    {isBn ? w.labelBn : w.labelEn}
                  </span>
                  <div className="mt-1 flex items-center justify-center">
                    {isPrayed ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    ) : isMissed ? (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
                        <X className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-400 flex items-center justify-center text-[10px]">
                        <Minus className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {activeDay.isToday && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>
                {isBn
                  ? 'আজকের ওয়াক্ত পরিবর্তন করতে উপরে সরাসরি ট্যাপ করতে পারেন'
                  : 'Tap any waqt above to mark or unmark today’s prayer'}
              </span>
            </p>
          )}
        </div>
      )}

      {/* 5. Motivational Footer Note */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
        <span className="leading-snug">{getMotivationalText()}</span>
      </div>
    </section>
  );
};
