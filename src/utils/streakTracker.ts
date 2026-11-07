import { DayNamazRecord, WaqtKey, STORAGE_KEY_NAMAZ_LOG } from '../components/NamazTracker';
import { AppLanguage } from '../types';

export interface DayStreakItem {
  dateStr: string;
  dayNameBn: string;
  dayNameEn: string;
  dateNum: number;
  prayedCount: number; // 0 to 5
  isFull: boolean; // prayedCount === 5
  hasAny: boolean; // prayedCount > 0
  isToday: boolean;
}

export interface PrayerStreakSummary {
  currentStreak: number;
  bestStreak: number;
  todayPrayedCount: number;
  todayCompletionPercent: number;
  isTodayCompleted: boolean;
  last7Days: DayStreakItem[];
  weeklyCompletionCount: number; // out of 35
  totalPrayersAllTime: number;
}

const WAQTS: WaqtKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const formatIsoDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const DAY_NAMES_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getDayPrayedCount(record?: DayNamazRecord): number {
  if (!record) return 0;
  return WAQTS.filter((w) => record[w] === 'prayed').length;
}

export function calculatePrayerStreak(logs: Record<string, DayNamazRecord>): PrayerStreakSummary {
  const today = new Date();
  const todayStr = formatIsoDate(today);
  const todayRecord = logs[todayStr];
  const todayPrayedCount = getDayPrayedCount(todayRecord);
  const isTodayCompleted = todayPrayedCount === 5;
  const todayCompletionPercent = Math.round((todayPrayedCount / 5) * 100);

  // Compute Last 7 Days (ending today)
  const last7Days: DayStreakItem[] = [];
  let weeklyCompletionCount = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dStr = formatIsoDate(d);
    const record = logs[dStr];
    const count = getDayPrayedCount(record);
    const dayOfWeek = d.getDay();

    weeklyCompletionCount += count;

    last7Days.push({
      dateStr: dStr,
      dayNameBn: DAY_NAMES_BN[dayOfWeek],
      dayNameEn: DAY_NAMES_EN[dayOfWeek],
      dateNum: d.getDate(),
      prayedCount: count,
      isFull: count === 5,
      hasAny: count > 0,
      isToday: i === 0,
    });
  }

  // Calculate Current Streak
  // If today is completed (5/5), start from today.
  // If today is in progress (has some or 0 prayers since day is ongoing),
  // we check backwards starting from yesterday. If yesterday was completed, the streak remains intact.
  // Plus if today is completed, add today.
  let currentStreak = 0;
  let checkDate = new Date(today);

  if (isTodayCompleted) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // Check if yesterday had 5/5
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = formatIsoDate(yesterday);
    if (getDayPrayedCount(logs[yStr]) === 5) {
      checkDate = yesterday;
    } else {
      // If neither today nor yesterday has 5/5, streak is 0
      checkDate = yesterday;
    }
  }

  // Walk backwards to count consecutive completed days
  while (true) {
    const dStr = formatIsoDate(checkDate);
    const count = getDayPrayedCount(logs[dStr]);
    if (count === 5) {
      // If today wasn't completed, currentStreak wasn't incremented yet for yesterday
      if (!isTodayCompleted && checkDate.getDate() === today.getDate() - 1) {
        currentStreak++;
      } else if (checkDate.getTime() < today.getTime() - 24 * 60 * 60 * 1000) {
        currentStreak++;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate Best Streak across all recorded history
  let bestStreak = currentStreak;
  const recordedDates = Object.keys(logs)
    .filter((d) => getDayPrayedCount(logs[d]) === 5)
    .sort();

  if (recordedDates.length > 0) {
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of recordedDates) {
      const parts = dStr.split('-').map(Number);
      const currDate = new Date(parts[0], parts[1] - 1, parts[2]);

      if (prevDate) {
        const diffMs = currDate.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }

      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
      prevDate = currDate;
    }
  }

  // Total prayers completed across all logs
  let totalPrayersAllTime = 0;
  for (const key of Object.keys(logs)) {
    totalPrayersAllTime += getDayPrayedCount(logs[key]);
  }

  return {
    currentStreak,
    bestStreak,
    todayPrayedCount,
    todayCompletionPercent,
    isTodayCompleted,
    last7Days,
    weeklyCompletionCount,
    totalPrayersAllTime,
  };
}
