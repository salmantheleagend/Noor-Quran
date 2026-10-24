import { PrayerTimesData, AppLanguage } from '../types';
import { playAdhanTone, triggerHaptic } from './audioPlayer';
import { formatPrayerTime12h, toBn } from './prayerTimes';

export interface PrayerNotificationSettings {
  enabled: boolean;
  adhanToneEnabled: boolean;
  vibrateEnabled: boolean;
  reminderOffsetMinutes: number; // 0, 5, 10, 15
  prayers: {
    fajr: boolean;
    sunrise: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    tahajjud: boolean;
  };
}

export const STORAGE_KEY_NOTIFICATION_SETTINGS = 'noor_prayer_notifications_settings_v1';
export const STORAGE_KEY_LAST_NOTIFIED = 'noor_prayer_notifications_last_notified_v1';

export const DEFAULT_NOTIFICATION_SETTINGS: PrayerNotificationSettings = {
  enabled: true,
  adhanToneEnabled: true,
  vibrateEnabled: true,
  reminderOffsetMinutes: 0,
  prayers: {
    fajr: true,
    sunrise: false,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    tahajjud: false,
  },
};

/**
 * Check browser and mobile support for Web Notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current Notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<{
  granted: boolean;
  permission: NotificationPermission | 'unsupported';
}> {
  if (!isNotificationSupported()) {
    return { granted: false, permission: 'unsupported' };
  }

  try {
    const permission = await Notification.requestPermission();
    // Dispatch event so UI components immediately re-render with new permission state
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('prayer_notification_permission_changed', { detail: permission }));
    }
    return {
      granted: permission === 'granted',
      permission,
    };
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return {
      granted: false,
      permission: Notification.permission || 'denied',
    };
  }
}

/**
 * Load saved prayer notification settings
 */
export function getPrayerNotificationSettings(): PrayerNotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATION_SETTINGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...parsed,
        prayers: {
          ...DEFAULT_NOTIFICATION_SETTINGS.prayers,
          ...(parsed.prayers || {}),
        },
      };
    }
  } catch {
    // fallback
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

/**
 * Save notification settings
 */
export function savePrayerNotificationSettings(settings: PrayerNotificationSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATION_SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('prayer_notification_settings_updated', { detail: settings }));
  } catch {
    // ignore
  }
}

/**
 * Update partial notification settings
 */
export function updatePrayerNotificationSettings(
  partial: Partial<PrayerNotificationSettings> | { prayers?: Partial<PrayerNotificationSettings['prayers']> }
): PrayerNotificationSettings {
  const current = getPrayerNotificationSettings();
  const updated: PrayerNotificationSettings = {
    ...current,
    ...partial,
    prayers: {
      ...current.prayers,
      ...(partial.prayers || {}),
    },
  };
  savePrayerNotificationSettings(updated);
  return updated;
}

/**
 * Display a system notification using ServiceWorker or standard Notification API
 */
export async function showSystemNotification(
  title: string,
  options: NotificationOptions & { playTone?: boolean; vibratePattern?: number[] }
): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  // Trigger optional adhan audio
  if (options.playTone) {
    try {
      playAdhanTone();
    } catch {
      // ignore
    }
  }

  // Trigger optional vibration
  if (options.vibratePattern && options.vibratePattern.length > 0) {
    try {
      triggerHaptic(options.vibratePattern[0]);
    } catch {
      // ignore
    }
  }

  const defaultOptions: NotificationOptions & { renotify?: boolean; vibrate?: number[] } = {
    icon: '/islamic_badge.jpg',
    badge: '/islamic_badge.jpg',
    dir: 'auto',
    lang: 'bn',
    renotify: true,
    tag: options.tag || 'prayer-notification',
    vibrate: options.vibratePattern || [200, 100, 200, 100, 400],
    data: {
      url: '/',
      timestamp: Date.now(),
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
  };

  // 1. Try Service Worker showNotification (Best for Android & iOS PWA background)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, finalOptions);
        return true;
      }
    } catch {
      // fallback to standard Notification
    }
  }

  // 2. Standard Web Notification fallback
  try {
    new Notification(title, finalOptions);
    return true;
  } catch (err) {
    console.warn('Standard Web Notification failed:', err);
    return false;
  }
}

/**
 * Send an immediate test notification to verify mobile permissions and alert rendering
 */
export async function sendTestPrayerNotification(language: AppLanguage = 'bn'): Promise<{
  success: boolean;
  message: string;
}> {
  const perm = getNotificationPermission();

  if (perm === 'unsupported') {
    return {
      success: false,
      message:
        language === 'bn'
          ? 'দুঃখিত, এই ব্রাউজার বা ডিভাইসে নোটিফিকেশন সুবিধা সমর্থিত নয়।'
          : 'Notification is not supported on this device/browser.',
    };
  }

  if (perm !== 'granted') {
    const req = await requestNotificationPermission();
    if (!req.granted) {
      return {
        success: false,
        message:
          language === 'bn'
            ? 'নোটিফিকেশন অনুমতি পাওয়া যায়নি। ব্রাউজার বা ফোন সেটিংস থেকে অনুমতি প্রদান করুন।'
            : 'Notification permission was not granted. Please allow in browser or phone settings.',
      };
    }
  }

  const settings = getPrayerNotificationSettings();
  const title =
    language === 'bn'
      ? '🕌 নূর কুরআন: নোটিফিকেশন সফল হয়েছে'
      : '🕌 Noor Quran: Notifications Active';

  const body =
    language === 'bn'
      ? 'আলহামদুলিল্লাহ! আপনার ফোনে নামাজের ওয়াক্ত ও আযান রিমাইন্ডার সফলভাবে সক্রিয় হয়েছে।'
      : 'Alhamdulillah! Prayer time reminders and adhan alerts are active on your device.';

  const delivered = await showSystemNotification(title, {
    body,
    tag: `test-prayer-${Date.now()}`,
    playTone: settings.adhanToneEnabled,
    vibratePattern: settings.vibrateEnabled ? [200, 100, 200, 100, 300] : undefined,
  });

  return {
    success: delivered,
    message: delivered
      ? language === 'bn'
        ? 'আপনার ফোনে টেস্ট নোটিফিকেশন পাঠানো হয়েছে!'
        : 'Test notification sent to your device!'
      : language === 'bn'
      ? 'নোটিফিকেশন পাঠানো সম্ভব হয়নি।'
      : 'Could not send test notification.',
  };
}

/**
 * Build prayer notification content in Bengali / English
 */
function getPrayerNotificationContent(
  prayerKey: keyof PrayerNotificationSettings['prayers'],
  timeStr: string,
  offsetMinutes: number,
  language: AppLanguage
): { title: string; body: string } {
  const formattedTime = formatPrayerTime12h(timeStr, language);
  const isFriday = new Date().getDay() === 5;

  if (language === 'bn') {
    const isAdvance = offsetMinutes > 0;
    const timeNotice = isAdvance ? `${toBn(offsetMinutes)} মিনিট পর ` : '';

    switch (prayerKey) {
      case 'fajr':
        return {
          title: `🕌 ${timeNotice}ফজরের ওয়াক্ত শুরু`,
          body: `ফজর: ${formattedTime} · "আস-সালাতু খাইরুম মিনান নাওম" (ঘুমের চেয়ে সালাত উত্তম)।`,
        };
      case 'sunrise':
        return {
          title: `☀️ সূর্যোদয় হয়েছে`,
          body: `সূর্যোদয়: ${formattedTime} · নিষিদ্ধ ১৫ মিনিট পর সালাতুল ইশরাক আদায় করতে পারেন।`,
        };
      case 'dhuhr':
        return {
          title: isFriday
            ? `🕌 ${timeNotice}পবিত্র জুমু'আর সময়`
            : `🕌 ${timeNotice}যোহরের ওয়াক্ত শুরু`,
          body: isFriday
            ? `জুমু'আ: ${formattedTime} · গোসল করে পরিষ্কার পোশাকে মসজিদে যাওয়ার প্রস্তুতি নিন।`
            : `যোহর: ${formattedTime} · মসজিদে জামাতের সাথে সালাত আদায়ের প্রস্তুতি নিন।`,
        };
      case 'asr':
        return {
          title: `🕌 ${timeNotice}আসরের ওয়াক্ত শুরু`,
          body: `আসর: ${formattedTime} · মধ্যবর্তী সালাত (আসরের সালাত) যথাযথভাবে সংরক্ষণ করুন।`,
        };
      case 'maghrib':
        return {
          title: `🕌 ${timeNotice}মাগরিবের ওয়াক্ত ও ইফতারের সময়`,
          body: `মাগরিব: ${formattedTime} · ইফতারের দোয়া পড়ে ইফতার করুন এবং মাগরিবের সালাত আদায় করুন।`,
        };
      case 'isha':
        return {
          title: `🕌 ${timeNotice}ইশার ওয়াক্ত শুরু`,
          body: `ইশা: ${formattedTime} · ইশার ফরজ ও বিতরের সালাত সম্পন্ন করে কুরআন তিলাওয়াত করুন।`,
        };
      case 'tahajjud':
        return {
          title: `🌙 তাহাজ্জুদের ওয়াক্ত ও শেষ প্রহর`,
          body: `তাহাজ্জুদ: ${formattedTime} · মহান রাব্বুল আলামিনের সান্নিধ্যে কিয়ামুল লাইল ও দোয়া করুন।`,
        };
      default:
        return {
          title: `🕌 নামাজের ওয়াক্ত`,
          body: `সময়: ${formattedTime}`,
        };
    }
  }

  // English fallback
  const isAdvance = offsetMinutes > 0;
  const timeNotice = isAdvance ? `In ${offsetMinutes} mins: ` : '';

  switch (prayerKey) {
    case 'fajr':
      return {
        title: `🕌 ${timeNotice}Fajr Prayer Time`,
        body: `Fajr: ${formattedTime} · Prayer is better than sleep.`,
      };
    case 'sunrise':
      return {
        title: `☀️ Sunrise`,
        body: `Sunrise: ${formattedTime} · Prepare for Ishraq prayer after sunrise.`,
      };
    case 'dhuhr':
      return {
        title: isFriday ? `🕌 ${timeNotice}Jumu'ah Prayer Time` : `🕌 ${timeNotice}Dhuhr Prayer Time`,
        body: isFriday
          ? `Jumu'ah: ${formattedTime} · Prepare for Friday congregational prayer.`
          : `Dhuhr: ${formattedTime} · Time for Dhuhr prayer.`,
      };
    case 'asr':
      return {
        title: `🕌 ${timeNotice}Asr Prayer Time`,
        body: `Asr: ${formattedTime} · Guard strictly your habit of prayers, especially Asr.`,
      };
    case 'maghrib':
      return {
        title: `🕌 ${timeNotice}Maghrib & Iftar Time`,
        body: `Maghrib: ${formattedTime} · Time for Iftar and Maghrib prayer.`,
      };
    case 'isha':
      return {
        title: `🕌 ${timeNotice}Isha Prayer Time`,
        body: `Isha: ${formattedTime} · Time for Isha and Witr prayers.`,
      };
    case 'tahajjud':
      return {
        title: `🌙 Tahajjud Time`,
        body: `Tahajjud: ${formattedTime} · Night vigil prayer and supplication.`,
      };
    default:
      return {
        title: `🕌 Prayer Time`,
        body: `Time: ${formattedTime}`,
      };
  }
}

/**
 * Check if any prayer is currently due to notify right now
 */
export function checkAndTriggerPrayerNotifications(
  prayerTimes: PrayerTimesData | null | undefined,
  language: AppLanguage = 'bn'
): void {
  if (!prayerTimes) return;
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  const settings = getPrayerNotificationSettings();
  if (!settings.enabled) return;

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayDateStr = `${y}-${m}-${d}`;

  // Retrieve today's sent log
  let lastNotifiedMap: Record<string, string> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LAST_NOTIFIED);
    if (raw) {
      lastNotifiedMap = JSON.parse(raw);
    }
  } catch {
    // ignore
  }

  const prayerKeyMap: Array<{
    key: keyof PrayerNotificationSettings['prayers'];
    timeStr: string;
  }> = [
    { key: 'fajr', timeStr: prayerTimes.fajr },
    { key: 'sunrise', timeStr: prayerTimes.sunrise },
    { key: 'dhuhr', timeStr: prayerTimes.dhuhr },
    { key: 'asr', timeStr: prayerTimes.asr },
    { key: 'maghrib', timeStr: prayerTimes.maghrib },
    { key: 'isha', timeStr: prayerTimes.isha },
    { key: 'tahajjud', timeStr: prayerTimes.tahajjudStart },
  ];

  for (const item of prayerKeyMap) {
    if (!settings.prayers[item.key]) continue;
    if (!item.timeStr || !item.timeStr.includes(':')) continue;

    // Check if already notified today
    const sentKey = `${item.key}_${settings.reminderOffsetMinutes}`;
    if (lastNotifiedMap[sentKey] === todayDateStr) {
      continue;
    }

    const [hStr, minStr] = item.timeStr.split(':');
    const targetHours = parseInt(hStr, 10);
    const targetMinutes = parseInt(minStr, 10);

    const prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHours, targetMinutes, 0);

    // Apply offset minutes before
    const scheduledTimeMs = prayerDate.getTime() - settings.reminderOffsetMinutes * 60 * 1000;
    const diffMs = now.getTime() - scheduledTimeMs;

    // Trigger window: between 0 and 90 seconds (1.5 minutes) after scheduled time
    if (diffMs >= 0 && diffMs <= 90000) {
      // Mark as notified today first to avoid racing triggers
      lastNotifiedMap[sentKey] = todayDateStr;
      try {
        localStorage.setItem(STORAGE_KEY_LAST_NOTIFIED, JSON.stringify(lastNotifiedMap));
      } catch {
        // ignore
      }

      const content = getPrayerNotificationContent(item.key, item.timeStr, settings.reminderOffsetMinutes, language);

      showSystemNotification(content.title, {
        body: content.body,
        tag: `prayer-${item.key}-${todayDateStr}`,
        playTone: settings.adhanToneEnabled,
        vibratePattern: settings.vibrateEnabled ? [200, 100, 200, 100, 400] : undefined,
      });
      break;
    }
  }
}
