import { decryptData } from './crypto';
import { PeriodTrackerData } from '../types';

const STORAGE_KEY = 'noor_quran_period_tracker_encrypted_v1';
const PIN_HASH_KEY = 'noor_quran_period_tracker_pin_hash_v1';
const NOTIFIED_DATE_KEY = 'noor_quran_period_last_notified_date';

export interface PeriodNotificationStatus {
  isApproaching: boolean;
  isActive: boolean;
  daysRemaining: number;
  nextDateFormatted: string;
  nextDateStr: string;
}

/**
 * Reads encrypted/saved tracker data and calculates period countdown
 */
export function getPeriodApproachingStatus(language: 'bn' | 'en' | 'ar' = 'bn'): PeriodNotificationStatus | null {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;

    const storedPinHash = localStorage.getItem(PIN_HASH_KEY);
    const data = decryptData<PeriodTrackerData>(encrypted, storedPinHash || 'DEFAULT');
    if (!data || !data.isEnabled || !data.lastPeriodStartDate) return null;

    const lastDate = new Date(data.lastPeriodStartDate);
    if (isNaN(lastDate.getTime())) return null;

    const cycleLen = data.cycleLengthDays || 28;
    const duration = data.periodDurationDays || 5;

    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + cycleLen);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffMs = nextDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Active period: from nextDate up to duration days
    const isActive = daysRemaining <= 0 && daysRemaining >= -duration;
    // Approaching: within 3 days (0, 1, 2, 3 days remaining)
    const isApproaching = daysRemaining >= 0 && daysRemaining <= 3;

    const nextDateFormatted = nextDate.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      day: 'numeric',
      month: 'long',
      weekday: 'short',
    });

    return {
      isApproaching,
      isActive,
      daysRemaining,
      nextDateFormatted,
      nextDateStr: nextDate.toISOString().split('T')[0],
    };
  } catch (e) {
    console.warn('Error reading period approaching status:', e);
    return null;
  }
}

/**
 * Triggers a browser desktop/mobile push notification if permission is granted
 */
export function checkAndTriggerPeriodNotification(): void {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const status = getPeriodApproachingStatus('bn');
    if (!status || (!status.isApproaching && !status.isActive)) return;

    // Check if already notified today
    const todayStr = new Date().toISOString().split('T')[0];
    const lastNotified = localStorage.getItem(NOTIFIED_DATE_KEY);
    if (lastNotified === todayStr) return;

    const title = 'নূর কুরআন - তাহরাত ও স্বাস্থ্য রিমাইন্ডার';
    const body = status.isActive
      ? 'আপনার মাসিক চক্রের দিন চলমান। নামাজ ও রোজা থেকে বিরতি ও প্রয়োজনীয় বিশ্রাম নিন।'
      : status.daysRemaining === 0
      ? 'আজ আপনার সম্ভাব্য পিরিয়ডের তারিখ। প্রয়োজনীয় প্রস্তুতি ও সুরক্ষা সঙ্গে রাখুন।'
      : `আপনার সম্ভাব্য পিরিয়ডের তারিখ আর মাত্র ${status.daysRemaining} দিন পর (${status.nextDateFormatted})। প্রয়োজনীয় প্রস্তুতি রাখুন।`;

    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });

    localStorage.setItem(NOTIFIED_DATE_KEY, todayStr);
  } catch (err) {
    console.warn('Notification error:', err);
  }
}
