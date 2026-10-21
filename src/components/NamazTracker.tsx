import React, { useState, useEffect, useMemo } from 'react';
import { AppLanguage } from '../types';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Check,
  History,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';
import { toBn } from '../utils/prayerTimes';

export interface NamazTrackerProps {
  language: AppLanguage;
}

export type WaqtKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type WaqtStatus = 'prayed' | 'missed' | 'none';

export interface DayNamazRecord {
  dateStr: string; // YYYY-MM-DD
  fajr?: WaqtStatus;
  dhuhr?: WaqtStatus;
  asr?: WaqtStatus;
  maghrib?: WaqtStatus;
  isha?: WaqtStatus;
  tahajjud?: boolean;
}

export const STORAGE_KEY_NAMAZ_LOG = 'noor_quran_namaz_tracker_log_v2';
export const STORAGE_KEY_QAZA_COUNT = 'noor_quran_namaz_qaza_repaid_v2';
export const STORAGE_KEY_TRACKING_START_DATE = 'noor_quran_namaz_tracking_start_date';

const WAQT_LIST: { id: WaqtKey; nameBn: string; nameEn: string; nameAr: string; rakatsBn: string; rakatsEn: string }[] = [
  { id: 'fajr', nameBn: 'ফজর', nameEn: 'Fajr', nameAr: 'الفجر', rakatsBn: '২ রাকাত ফরজ', rakatsEn: '2 Rakats Fard' },
  { id: 'dhuhr', nameBn: 'যোহর', nameEn: 'Dhuhr', nameAr: 'الظهر', rakatsBn: '৪ রাকাত ফরজ', rakatsEn: '4 Rakats Fard' },
  { id: 'asr', nameBn: 'আসর', nameEn: 'Asr', nameAr: 'العصر', rakatsBn: '৪ রাকাত ফরজ', rakatsEn: '4 Rakats Fard' },
  { id: 'maghrib', nameBn: 'মাগরিব', nameEn: 'Maghrib', nameAr: 'المغرب', rakatsBn: '৩ রাকাত ফরজ', rakatsEn: '3 Rakats Fard' },
  { id: 'isha', nameBn: 'ইশা', nameEn: 'Isha', nameAr: 'العشاء', rakatsBn: '৪ রাকাত ফরজ', rakatsEn: '4 Rakats Fard' },
];

// Authentic Hadiths on the severe consequence of neglecting prayer
const PRAYER_WARNING_HADITHS = [
  {
    id: 'muslim_82',
    arabic: 'بَيْنَ الرَّجُلِ وَبَيْنَ الشِّرْكِ وَالْكُفْرِ تَرْكُ الصَّلَاةِ',
    bangla: 'বান্দা এবং শিরক ও কুফরের মাঝে একমাত্র পার্থক্যই হলো সালাত ত্যাগ করা।',
    english: 'Between a person and disbelief or polytheism is the abandonment of prayer.',
    referenceBn: 'সহীহ মুসলিম: ৮২, সুনানে তিরমিযী: ২৬১৮, আবু দাউদ: ৪৬৭৮',
    referenceEn: 'Sahih Muslim: 82, Jami` at-Tirmidhi: 2618',
    highlightBn: 'সালাত ত্যাগ কুফর ও শিরকের সমান মারাত্মক অপরাধ',
    highlightEn: 'Abandoning prayer is a grave sin separating faith from disbelief',
  },
  {
    id: 'tirmidhi_2621',
    arabic: 'الْعَهْدُ الَّذِي بَيْنَنَا وَبَيْنَهُمُ الصَّلَاةُ فَمَنْ تَرَكَهَا فَقَدْ كَفَرَ',
    bangla: 'আমাদের এবং তাদের (কাফের ও মুনাফিকদের) মাঝে চুক্তি হলো সালাত; সুতরাং যে ব্যক্তি সালাত ত্যাগ করল, সে সুস্পষ্ট কুফরী করল।',
    english: 'The covenant between us and them is prayer; whoever neglects it has committed an act of disbelief.',
    referenceBn: 'জামে তিরমিযী: ২৬২১, সুনানে নাসাঈ: ৪৬৩, ইবনে মাজাহ: ১০৭৯ (সহীহ)',
    referenceEn: 'Jami` at-Tirmidhi: 2621, Sunan an-Nasa\'i: 463 (Sahih)',
    highlightBn: 'ঈমান ও কুফরের সীমারেখা হলো সালাত',
    highlightEn: 'Prayer is the dividing line of religious commitment',
  },
  {
    id: 'tirmidhi_413',
    arabic: 'إِنَّ أَوَّلَ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ مِنْ عَمَلِهِ صَلَاتُهُ، فَإِنْ صَلَحَتْ فَقَدْ أَفْلَحَ وَأَنْجَحَ، وَإِنْ فَسَدَتْ فَقَدْ خَابَ وَخَسِرَ',
    bangla: 'কিয়ামতের দিন বান্দার আমলসমূহের মধ্যে সর্বপ্রথম সালাতের হিসাব নেওয়া হবে। সালাত সঠিক হলে সে সফলকাম ও মুক্তি পাবে; আর সালাত বরবাদ হলে সে ব্যর্থ, ধ্বংস ও চির ক্ষতিগ্রস্ত হবে।',
    english: 'The first matter that the slave will be brought to account for on the Day of Judgment is prayer. If it is sound, he will succeed and prosper; but if it is corrupt, he will fail and lose.',
    referenceBn: 'জামে তিরমিযী: ৪১৩, সুনানে আবু দাউদ: ৮৬৪ (সহীহ)',
    referenceEn: 'Jami` at-Tirmidhi: 413, Sunan Abi Dawud: 864 (Sahih)',
    highlightBn: 'আখেরাতের প্রথম বিচার হবে সালাতের',
    highlightEn: 'The first reckoning on the Day of Judgment is prayer',
  },
  {
    id: 'quran_muddathir',
    arabic: 'مَا سَلَكَكُمْ فِي سَقَرَ ۝ قَالُوا لَمْ نَكُ مِنَ الْمُصَلِّينَ',
    bangla: 'জাহান্নামীদের জিজ্ঞেস করা হবে: কীসে তোমাদের সাক্বার (ভয়াবহ জাহান্নামে) নিক্ষেপ করল? তারা বলবে: আমরা নামাজি ছিলাম না (সালাত আদায় করতাম না)।',
    english: '"What has caused you to enter Hell?" They will say: "We were not of those who prayed."',
    referenceBn: 'পবিত্র কুরআন: সূরা আল-মুদ্দাসসির (৪২-৪৩)',
    referenceEn: 'Holy Quran: Surah Al-Muddaththir (74:42-43)',
    highlightBn: 'জাহান্নামে যাওয়ার অন্যতম প্রধান কারণ সালাত না পড়া',
    highlightEn: 'Neglecting prayer is a direct cause of entering Saqar',
  },
];

export const NamazTracker: React.FC<NamazTrackerProps> = ({ language }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeHadithIndex, setActiveHadithIndex] = useState(0);
  const [showHadithModal, setShowHadithModal] = useState(false);

  // Namaz Log: Record<dateStr, DayNamazRecord>
  const [logs, setLogs] = useState<Record<string, DayNamazRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NAMAZ_LOG);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  // Repaid Qaza count
  const [repaidQazaCount, setRepaidQazaCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QAZA_COUNT);
      if (saved) return Number(saved) || 0;
    } catch {
      // ignore
    }
    return 0;
  });

  // Date formatting helper
  const getDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = useMemo(() => getDateStr(new Date()), []);

  // Tracking start date: The date when user first started tracking in the app
  const [trackingStartDate, setTrackingStartDate] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRACKING_START_DATE);
      if (saved) return saved;
    } catch {
      // ignore
    }
    // If not set, inspect logs to find earliest recorded day or fallback to today
    try {
      const savedLogs = localStorage.getItem(STORAGE_KEY_NAMAZ_LOG);
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        const keys = Object.keys(parsed).sort();
        if (keys.length > 0 && keys[0] <= todayStr) {
          localStorage.setItem(STORAGE_KEY_TRACKING_START_DATE, keys[0]);
          return keys[0];
        }
      }
    } catch {
      // ignore
    }
    const today = getDateStr(new Date());
    try {
      localStorage.setItem(STORAGE_KEY_TRACKING_START_DATE, today);
    } catch {
      // ignore
    }
    return today;
  });

  // Listen for external sync (e.g. from PrayerSchedule card)
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_NAMAZ_LOG);
        if (saved) setLogs(JSON.parse(saved));
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

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NAMAZ_LOG, JSON.stringify(logs));
      window.dispatchEvent(new Event('namaz_log_updated'));
    } catch (e) {
      console.warn('Failed to save namaz log', e);
    }
  }, [logs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QAZA_COUNT, repaidQazaCount.toString());
    } catch (e) {
      console.warn('Failed to save qaza count', e);
    }
  }, [repaidQazaCount]);

  const currentSelectedDateStr = useMemo(() => getDateStr(selectedDate), [selectedDate]);
  const isSelectedDateToday = currentSelectedDateStr === todayStr;

  const currentDayRecord: DayNamazRecord = logs[currentSelectedDateStr] || {
    dateStr: currentSelectedDateStr,
  };

  // Toggle or set waqt status for the selected date
  const handleSetWaqtStatus = (waqt: WaqtKey, newStatus: WaqtStatus) => {
    triggerHaptic(20);
    const existingStatus = currentDayRecord[waqt] || 'none';
    const finalStatus = existingStatus === newStatus ? 'none' : newStatus;

    setLogs((prev) => ({
      ...prev,
      [currentSelectedDateStr]: {
        ...(prev[currentSelectedDateStr] || { dateStr: currentSelectedDateStr }),
        [waqt]: finalStatus,
      },
    }));
  };

  const handleToggleTahajjud = () => {
    triggerHaptic(15);
    setLogs((prev) => ({
      ...prev,
      [currentSelectedDateStr]: {
        ...(prev[currentSelectedDateStr] || { dateStr: currentSelectedDateStr }),
        tahajjud: !currentDayRecord.tahajjud,
      },
    }));
  };

  // Repay a Qaza waqt
  const handleRepayQaza = () => {
    triggerHaptic(30);
    setRepaidQazaCount((prev) => prev + 1);
  };

  // Monthly Calculations: strictly respect tracking start date so past unrecorded days aren't falsely marked missed!
  const daysInCurrentMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();

  const isCurrentViewingMonthThisMonth =
    selectedDate.getFullYear() === new Date().getFullYear() &&
    selectedDate.getMonth() === new Date().getMonth();

  const daysElapsedInMonth = isCurrentViewingMonthThisMonth
    ? new Date().getDate()
    : daysInCurrentMonth;

  const monthlyStats = useMemo(() => {
    let totalPrayed = 0;
    let totalExplicitMissed = 0;
    let totalUnrecordedWaqts = 0;
    let activeTrackedDaysCount = 0;

    const waqtMissedBreakdown: Record<WaqtKey, number> = {
      fajr: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
    };

    const waqtPrayedBreakdown: Record<WaqtKey, number> = {
      fajr: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
    };

    for (let day = 1; day <= daysElapsedInMonth; day++) {
      const dStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const rec = logs[dStr];
      const isBeforeTrackingStarted = dStr < trackingStartDate;

      let hasExplicitUserAction = false;
      if (rec) {
        hasExplicitUserAction = WAQT_LIST.some(({ id }) => rec[id] === 'prayed' || rec[id] === 'missed');
      }

      // If the day is on/after tracking start, OR the user explicitly recorded entries for this past day
      const isEligibleDay = !isBeforeTrackingStarted || hasExplicitUserAction;

      if (isEligibleDay) {
        activeTrackedDaysCount++;

        WAQT_LIST.forEach(({ id }) => {
          const st = rec ? rec[id] : undefined;
          if (st === 'prayed') {
            totalPrayed++;
            waqtPrayedBreakdown[id]++;
          } else if (st === 'missed') {
            totalExplicitMissed++;
            waqtMissedBreakdown[id]++;
          } else {
            // Only count unrecorded waqts as missed if the day is ON or AFTER tracking start and is in the past
            if (!isBeforeTrackingStarted && dStr < todayStr) {
              totalUnrecordedWaqts++;
              waqtMissedBreakdown[id]++;
            }
          }
        });
      }
    }

    const totalEligibleWaqts = activeTrackedDaysCount * 5;
    const totalMissedCombined = totalExplicitMissed + totalUnrecordedWaqts;
    const netMissedRemaining = Math.max(0, totalMissedCombined - repaidQazaCount);
    const successRate = totalEligibleWaqts > 0 ? Math.round((totalPrayed / totalEligibleWaqts) * 100) : 0;

    return {
      activeTrackedDaysCount,
      totalEligibleWaqts,
      totalPrayed,
      totalExplicitMissed,
      totalUnrecordedWaqts,
      totalMissedCombined,
      netMissedRemaining,
      successRate,
      waqtMissedBreakdown,
      waqtPrayedBreakdown,
    };
  }, [logs, selectedDate, daysElapsedInMonth, todayStr, trackingStartDate, repaidQazaCount]);

  // Navigate dates
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    if (d > new Date()) return;
    setSelectedDate(d);
  };

  const activeHadith = PRAYER_WARNING_HADITHS[activeHadithIndex];

  // Helper for formatting tracking date string
  const formattedStartDate = useMemo(() => {
    try {
      const [y, m, d] = trackingStartDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return trackingStartDate;
    }
  }, [trackingStartDate, language]);

  return (
    <div className="space-y-4">
      {/* 1. HADITH WARNING ON PRAYER NEGLECT */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#1E0B14] via-[#0E1528] to-[#0A1020] text-white border-2 border-rose-500/30 shadow-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-rose-800/30 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-500 text-white shadow-xs">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <span className="text-xs font-black tracking-wide uppercase text-rose-300 block">
                {language === 'bn' ? 'সালাত ত্যাগের ব্যাপারে হাদিসের সতর্কবার্তা' : 'Prophetic Warning on Neglecting Prayer'}
              </span>
              <span className="text-[10px] text-rose-200/70 block">
                {language === 'bn' ? 'সহীহ হাদিসের আলোকে সালাত ত্যাগকারীর পরিণতি' : 'Consequences of abandoning prayer from authentic Hadith'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {PRAYER_WARNING_HADITHS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  triggerHaptic(10);
                  setActiveHadithIndex(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === activeHadithIndex
                    ? 'w-5 bg-amber-400'
                    : 'w-2 bg-rose-800 hover:bg-rose-700'
                }`}
                title={language === 'bn' ? `হাদিস ${idx + 1}` : `Hadith ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Hadith Content */}
        <div className="space-y-2 pt-0.5">
          <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-amber-400/40 shadow-xl backdrop-blur-md space-y-3">
            <p className="font-uthmani text-xl sm:text-2xl font-extrabold text-amber-100 text-right leading-[2.3] tracking-wide select-text" dir="rtl">
              «{activeHadith.arabic}»
            </p>
            <p className="text-xs sm:text-sm font-semibold text-rose-50 leading-relaxed border-t border-rose-800/50 pt-2.5">
              "{language === 'bn' ? activeHadith.bangla : activeHadith.english}"
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-rose-900/60 border border-rose-600/50 text-rose-100 font-bold">
              📌 {language === 'bn' ? activeHadith.highlightBn : activeHadith.highlightEn}
            </span>
            <span className="text-amber-200 font-mono text-[11px] font-bold">
              {language === 'bn' ? activeHadith.referenceBn : activeHadith.referenceEn}
            </span>
          </div>
        </div>

        {/* View all Hadiths trigger button */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => {
              triggerHaptic(15);
              setShowHadithModal(true);
            }}
            className="text-[11px] font-bold text-amber-300 hover:text-amber-100 underline underline-offset-4 flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সালাত সংক্রান্ত আরও সহীহ হাদিস পড়ুন' : 'Read all Hadiths on Salah'}</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(10);
              setActiveHadithIndex((prev) => (prev + 1) % PRAYER_WARNING_HADITHS.length);
            }}
            className="text-[11px] font-bold text-amber-200 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/10 cursor-pointer"
          >
            {language === 'bn' ? 'পরবর্তী হাদিস →' : 'Next Hadith →'}
          </button>
        </div>
      </div>

      {/* 2. DAILY NAMAZ CHECKLIST */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-sm space-y-4">
        {/* Day Selector Header */}
        <div className="flex items-center justify-between border-b border-[#E7D9DE] dark:border-[#1C2D5A] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />
              <h3 className="text-sm font-bold text-[#10235A] dark:text-white">
                {language === 'bn' ? 'দৈনিক ৫ ওয়াক্ত সালাত চেকলিস্ট' : 'Daily 5 Prayers Checklist'}
              </h3>
            </div>
            <p className="text-[11px] text-[#6B7280] dark:text-slate-400 mt-0.5">
              {language === 'bn' ? 'প্রতিটি ওয়াক্ত আদায় বা মিস চিহ্নিত করে হিসাব রাখুন' : 'Mark each prayer prayed or missed to maintain consistency'}
            </p>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center gap-1 bg-[#F8E8ED] dark:bg-[#10235A] p-1 rounded-2xl border border-[#E7D9DE] dark:border-[#24386E]">
            <button
              onClick={handlePrevDay}
              className="p-1 rounded-xl hover:bg-[#E9B7C3]/30 text-[#10235A] dark:text-slate-300 transition-colors cursor-pointer"
              title={language === 'bn' ? 'আগের দিন' : 'Previous Day'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-[#10235A] dark:text-slate-200 px-2 min-w-[75px] text-center">
              {isSelectedDateToday
                ? (language === 'bn' ? 'আজকে' : 'Today')
                : selectedDate.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                    day: 'numeric',
                    month: 'short',
                  })}
            </span>
            <button
              onClick={handleNextDay}
              disabled={isSelectedDateToday}
              className={`p-1 rounded-xl transition-colors ${
                isSelectedDateToday
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-[#E9B7C3]/30 text-[#10235A] dark:text-slate-300 cursor-pointer'
              }`}
              title={language === 'bn' ? 'পরের দিন' : 'Next Day'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5 Waqt Check Buttons Grid */}
        <div className="space-y-2">
          {WAQT_LIST.map((waqt) => {
            const status = currentDayRecord[waqt.id] || 'none';
            const isPrayed = status === 'prayed';
            const isMissed = status === 'missed';
            const isFriday = selectedDate.getDay() === 5;
            const waqtLabel = waqt.id === 'dhuhr' && isFriday
              ? (language === 'bn' ? "জুমু'আ" : "Jumu'ah")
              : (language === 'bn' ? waqt.nameBn : waqt.nameEn);
            const waqtArabic = waqt.id === 'dhuhr' && isFriday ? 'الجمعة' : waqt.nameAr;
            const rakatsLabel = waqt.id === 'dhuhr' && isFriday
              ? (language === 'bn' ? "২ রাকাত ফরজ (জুমু'আ)" : "2 Rakats Fard (Jumu'ah)")
              : (language === 'bn' ? waqt.rakatsBn : waqt.rakatsEn);

            return (
              <div
                key={waqt.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isPrayed
                    ? 'bg-[#F8E8ED]/90 dark:bg-[#142042] border-[#21409A]/40 dark:border-[#24386E]'
                    : isMissed
                    ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                    : 'bg-[#FCFAF8] dark:bg-[#10235A]/30 border-[#E7D9DE] dark:border-[#1C2D5A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isPrayed
                        ? 'bg-[#21409A] text-white shadow-2xs'
                        : isMissed
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-slate-200 dark:bg-slate-700 text-[#10235A] dark:text-slate-300'
                    }`}
                  >
                    {isPrayed ? '✓' : isMissed ? '✕' : (language === 'bn' ? waqt.nameBn[0] : waqt.nameEn[0])}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#10235A] dark:text-white">
                        {waqtLabel}
                      </span>
                      <span className="text-xs font-bold text-[#21409A] dark:text-[#E9B7C3] font-arabic px-1.5 py-0.5 rounded-md bg-[#F8E8ED] dark:bg-[#10235A] border border-[#E7D9DE] dark:border-[#24386E]">
                        {waqtArabic}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#6B7280] dark:text-slate-400 block">
                      {rakatsLabel}
                    </span>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSetWaqtStatus(waqt.id, 'prayed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isPrayed
                        ? 'bg-[#21409A] text-white shadow-xs scale-102'
                        : 'bg-white dark:bg-[#10235A] text-[#21409A] dark:text-[#E9B7C3] border border-[#21409A]/30 dark:border-[#24386E] hover:bg-[#F8E8ED]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isPrayed ? (language === 'bn' ? 'আদায়কৃত' : 'Prayed') : (language === 'bn' ? 'পড়েছি' : 'Mark')}</span>
                  </button>

                  <button
                    onClick={() => handleSetWaqtStatus(waqt.id, 'missed')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isMissed
                        ? 'bg-rose-600 text-white shadow-xs scale-102'
                        : 'bg-white dark:bg-[#10235A] text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'মিস' : 'Missed'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tahajjud Tracker */}
        <div className="pt-1 flex items-center justify-between p-2.5 rounded-2xl bg-[#F8E8ED]/70 dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#24386E]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />
            <div>
              <span className="text-xs font-bold text-[#10235A] dark:text-[#F8E8ED] block">
                {language === 'bn' ? 'তাহাজ্জুদ সালাত (নফল)' : 'Tahajjud Prayer (Voluntary)'}
              </span>
              <span className="text-[10px] text-[#6B7280] dark:text-slate-400 block">
                {language === 'bn' ? 'রাতের বিশেষ ইবাদত ও নৈকট্য' : 'Special night prayer of devotion'}
              </span>
            </div>
          </div>

          <button
            onClick={handleToggleTahajjud}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentDayRecord.tahajjud
                ? 'bg-[#21409A] text-white shadow-xs'
                : 'bg-white dark:bg-[#10235A] text-[#21409A] dark:text-[#E9B7C3] border border-[#21409A]/30 dark:border-[#24386E]'
            }`}
          >
            {currentDayRecord.tahajjud
              ? (language === 'bn' ? '✓ আদায় করেছি' : '✓ Prayed')
              : (language === 'bn' ? '+ যোগ করুন' : '+ Add')}
          </button>
        </div>
      </div>

      {/* 3. MONTHLY MISSED PRAYER ANALYTICS & TRANSPARENT TRACKING RECORD */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-sm space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7D9DE] dark:border-[#1C2D5A] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#10235A] dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />
              <span>{language === 'bn' ? 'এই মাসের সালাত ধারাবাহিকতা ও হিসাব' : 'Monthly Prayer Consistency & Record'}</span>
            </h3>
            <p className="text-[11px] text-[#6B7280] dark:text-slate-400 mt-0.5">
              {language === 'bn' ? 'হিসাবভুক্ত দিন, আদায়কৃত ওয়াক্ত এবং কাজার সঠিক খতিয়ান' : 'Included days, completed prayers, and accurate missed record'}
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-[#10235A] dark:text-slate-300 bg-[#F8E8ED] dark:bg-[#10235A] px-2.5 py-1 rounded-xl self-start sm:self-auto border border-[#E7D9DE] dark:border-[#24386E]">
            {selectedDate.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Tracking Period Info Banner */}
        <div className="p-3 rounded-2xl bg-[#F8E8ED]/60 dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#24386E] text-xs text-[#10235A] dark:text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>
              <strong>{language === 'bn' ? 'ট্র্যাকিং শুরু: ' : 'Tracking Started: '}</strong>
              {formattedStartDate}
            </span>
          </div>
          <div className="text-[11px] text-[#6B7280] dark:text-slate-400">
            {language === 'bn'
              ? `হিসাবভুক্ত সময়: ${toBn(monthlyStats.activeTrackedDaysCount)} দিন (${toBn(monthlyStats.totalEligibleWaqts)} ওয়াক্ত)`
              : `Included Period: ${monthlyStats.activeTrackedDaysCount} days (${monthlyStats.totalEligibleWaqts} waqts)`}
          </div>
        </div>

        {/* Big Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Total Waqt this month */}
          <div className="p-3 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/40 border border-[#E7D9DE] dark:border-[#1C2D5A] text-center">
            <span className="text-[10px] text-[#6B7280] dark:text-slate-400 block font-semibold">
              {language === 'bn' ? 'মোট ওয়াক্ত (হিসাবভুক্ত)' : 'Total Waqts (Active)'}
            </span>
            <span className="text-2xl font-black font-mono text-[#10235A] dark:text-white mt-1 block">
              {language === 'bn' ? toBn(monthlyStats.totalEligibleWaqts) : monthlyStats.totalEligibleWaqts}
            </span>
            <span className="text-[10px] text-[#6B7280] block">
              {language === 'bn' ? 'ওয়াক্ত' : 'prayers'}
            </span>
          </div>

          {/* Prayed Waqts */}
          <div className="p-3 rounded-2xl bg-[#F8E8ED] dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#24386E] text-center">
            <span className="text-[10px] text-[#10235A] dark:text-[#E9B7C3] block font-semibold">
              {language === 'bn' ? 'আদায়কৃত সালাত' : 'Prayed Prayers'}
            </span>
            <span className="text-2xl font-black font-mono text-[#21409A] dark:text-white mt-1 block">
              {language === 'bn' ? toBn(monthlyStats.totalPrayed) : monthlyStats.totalPrayed}
            </span>
            <span className="text-[10px] text-[#21409A] dark:text-[#E9B7C3] block font-bold">
              {language === 'bn' ? `সাফল্য: ${toBn(monthlyStats.successRate)}%` : `Rate: ${monthlyStats.successRate}%`}
            </span>
          </div>

          {/* Missed Waqts */}
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-center">
            <span className="text-[10px] text-rose-800 dark:text-rose-300 block font-black">
              {language === 'bn' ? 'পড়া হয়নি (মিস ওয়াক্ত)' : 'Missed Waqts'}
            </span>
            <span className="text-2xl font-black font-mono text-rose-700 dark:text-rose-400 mt-1 block">
              {language === 'bn' ? toBn(monthlyStats.totalMissedCombined) : monthlyStats.totalMissedCombined}
            </span>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-bold">
              {language === 'bn' ? 'ওয়াক্ত কাজা হয়েছে' : 'qaza prayers'}
            </span>
          </div>

          {/* Repaid Qaza & Net Remaining */}
          <div className="p-3 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#1C2D5A] text-center">
            <span className="text-[10px] text-[#10235A] dark:text-slate-300 block font-semibold">
              {language === 'bn' ? 'কাজা বাকি রয়েছে' : 'Net Remaining Qaza'}
            </span>
            <span className="text-2xl font-black font-mono text-[#10235A] dark:text-white mt-1 block">
              {language === 'bn' ? toBn(monthlyStats.netMissedRemaining) : monthlyStats.netMissedRemaining}
            </span>
            <span className="text-[10px] text-[#21409A] dark:text-[#E9B7C3] block font-bold">
              {language === 'bn' ? `(পরিশোধিত: ${toBn(repaidQazaCount)})` : `(Repaid: ${repaidQazaCount})`}
            </span>
          </div>
        </div>

        {/* Detailed Breakdown per Waqt */}
        <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/30 border border-[#E7D9DE] dark:border-[#1C2D5A] text-xs">
          <span className="font-bold text-[#10235A] dark:text-slate-200 block mb-2">
            {language === 'bn' ? 'ওয়াক্তভিত্তিক মিস হওয়া নামাজের বিবরণ:' : 'Waqt-by-Waqt Breakdown:'}
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            {WAQT_LIST.map((w) => {
              const missed = monthlyStats.waqtMissedBreakdown[w.id];
              const prayed = monthlyStats.waqtPrayedBreakdown[w.id];

              return (
                <div
                  key={w.id}
                  className={`p-2 rounded-xl border ${
                    missed > 0
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                      : 'bg-white dark:bg-[#142042] border-[#E7D9DE] dark:border-[#24386E] text-[#10235A] dark:text-slate-300'
                  }`}
                >
                  <span className="font-bold block">{language === 'bn' ? w.nameBn : w.nameEn}</span>
                  <div className="flex items-center justify-center gap-1.5 mt-1 font-mono text-[11px]">
                    <span className="text-[#21409A] dark:text-[#E9B7C3] font-bold">
                      ✓{language === 'bn' ? toBn(prayed) : prayed}
                    </span>
                    <span>·</span>
                    <span className="text-rose-600 font-bold">
                      ✕{language === 'bn' ? toBn(missed) : missed}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Repay Qaza Action Bar */}
        <div className="p-3 rounded-2xl bg-[#F8E8ED] dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#24386E] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div>
            <span className="text-xs font-bold text-[#10235A] dark:text-white block">
              {language === 'bn' ? 'কাজা নামাজ আদায় করেছেন?' : 'Repaid any missed (Qaza) prayer?'}
            </span>
            <span className="text-[10px] text-[#6B7280] dark:text-slate-300 block">
              {language === 'bn'
                ? 'মিস হওয়া কোনো ওয়াক্ত আদায় করা হলে এখানে ক্লিক করে বাকি কাজার সংখ্যা কমিয়ে নিন'
                : 'Click here whenever you make up a missed prayer to reduce your remaining count'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {repaidQazaCount > 0 && (
              <button
                onClick={() => {
                  triggerHaptic(15);
                  setRepaidQazaCount((p) => Math.max(0, p - 1));
                }}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#10235A] text-[#10235A] dark:text-slate-200 border border-[#E7D9DE] dark:border-[#24386E] text-xs font-bold cursor-pointer"
                title={language === 'bn' ? '১টি কাজা পরিশোধ কমান' : 'Undo 1 Qaza'}
              >
                {language === 'bn' ? '-১' : '-1'}
              </button>
            )}

            <button
              onClick={handleRepayQaza}
              className="px-4 py-2 rounded-xl bg-[#21409A] hover:bg-[#10235A] active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? '১ ওয়াক্ত কাজা আদায় সম্পন্ন' : 'Mark 1 Qaza Repaid'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ALL WARNING HADITHS MODAL */}
      {showHadithModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#10235A] rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col border border-[#E7D9DE] dark:border-[#21409A] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-linear-to-r from-rose-900 to-[#10235A] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-300" />
                <h3 className="font-bold text-base">
                  {language === 'bn' ? 'সালাতের গুরুত্ব ও ত্যাগকারীর পরিণতি' : 'Importance of Prayer & Prophetic Warnings'}
                </h3>
              </div>
              <button
                onClick={() => setShowHadithModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200">
                <p className="leading-relaxed font-semibold">
                  {language === 'bn'
                    ? 'রাসূলুল্লাহ (ﷺ) ও সাহাবায়ে কেরাম সালাত ত্যাগের ব্যাপারে সবচেয়ে বেশি কঠোর সতর্কবাণী উচ্চারণ করেছেন। সুস্থ ও প্রাপ্তবয়স্ক মুসলিমের জন্য নামাজ ত্যাগ করার কোনো সুযোগ নেই।'
                    : 'The Prophet (ﷺ) and his companions issued the sternest warnings regarding abandoning prayer. Maintaining regular prayer is essential for every Muslim.'}
                </p>
              </div>

              {PRAYER_WARNING_HADITHS.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#24386E] shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs text-rose-700 dark:text-rose-400 font-bold">
                    <span>{language === 'bn' ? `হাদিস নং ${toBn(idx + 1)}` : `Hadith #${idx + 1}`}</span>
                    <span className="font-mono text-[11px] text-[#6B7280] dark:text-slate-400">
                      {language === 'bn' ? item.referenceBn : item.referenceEn}
                    </span>
                  </div>

                  <p className="font-uthmani text-xl sm:text-2xl font-extrabold text-[#10235A] dark:text-amber-100 text-right leading-[2.2] tracking-wide select-text" dir="rtl">
                    «{item.arabic}»
                  </p>

                  <p className="text-[#1F2937] dark:text-slate-200 leading-relaxed font-medium">
                    "{language === 'bn' ? item.bangla : item.english}"
                  </p>

                  <div className="pt-1">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-[#F8E8ED] dark:bg-[#10235A] text-[#21409A] dark:text-[#E9B7C3] text-[11px] font-bold">
                      {language === 'bn' ? `গুরুত্বপূর্ণ শিক্ষা: ${item.highlightBn}` : `Key Lesson: ${item.highlightEn}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E7D9DE] dark:border-[#21409A]/40 bg-[#FCFAF8] dark:bg-[#0E172E] text-right">
              <button
                onClick={() => setShowHadithModal(false)}
                className="px-5 py-2 rounded-xl bg-[#21409A] hover:bg-[#10235A] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NamazTracker;
