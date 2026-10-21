import { PrayerTimesData, CurrentWaqtStatus, PrayerName, LocationInfo, NaflPrayerItem } from '../types';

// Convert degrees to radians and vice versa
const deg2rad = (deg: number) => (deg * Math.PI) / 180.0;
const rad2deg = (rad: number) => (rad * 180.0) / Math.PI;

interface CalculationMethodConfig {
  fajrAngle: number;
  ishaAngle?: number;
  ishaIntervalMinutes?: number;
}

const CALCULATION_METHODS: Record<string, CalculationMethodConfig> = {
  IFB: { fajrAngle: 18.0, ishaAngle: 18.0 }, // Islamic Foundation Bangladesh / Karachi
  MWL: { fajrAngle: 18.0, ishaAngle: 17.0 }, // Muslim World League
  ISNA: { fajrAngle: 15.0, ishaAngle: 15.0 }, // North America
  EGYPT: { fajrAngle: 19.5, ishaAngle: 17.5 }, // Egyptian General Authority
  MAKKAH: { fajrAngle: 18.5, ishaIntervalMinutes: 90 }, // Umm Al-Qura University
};

// Calculate julian date from standard Gregorian date
function getJulianDate(date: Date): number {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
}

// Compute sun position (declination and equation of time)
function getSunPosition(jd: number) {
  const d = jd - 2451545.0;
  const g = 357.529 + 0.98560028 * d;
  const q = 280.459 + 0.98564736 * d;
  const L = q + 1.915 * Math.sin(deg2rad(g)) + 0.020 * Math.sin(deg2rad(2 * g));
  const e = 23.439 - 0.00000036 * d;
  const dRad = deg2rad(d);

  const RA = rad2deg(Math.atan2(Math.cos(deg2rad(e)) * Math.sin(deg2rad(L)), Math.cos(deg2rad(L)))) / 15.0;
  const declination = rad2deg(Math.asin(Math.sin(deg2rad(e)) * Math.sin(deg2rad(L))));
  const eqTime = (q / 15.0) - (RA < 0 ? RA + 24 : RA);

  return { declination, eqTime };
}

// Compute prayer times for a given day and location
export function calculatePrayerTimes(
  date: Date,
  location: LocationInfo,
  methodKey: string = 'IFB',
  asrMethod: 'hanafi' | 'standard' = 'hanafi'
): PrayerTimesData {
  const jd = getJulianDate(date);
  const { declination, eqTime } = getSunPosition(jd);

  // Timezone offset in hours
  const timezoneOffset = -date.getTimezoneOffset() / 60;
  
  // Midday / Solar Noon
  const noon = 12 + timezoneOffset - location.lng / 15 - eqTime;

  // Method angles
  const method = CALCULATION_METHODS[methodKey] || CALCULATION_METHODS.IFB;
  const fajrAngle = method.fajrAngle;

  // Sunrise and Sunset (zenith angle ~ 90.8333 degrees)
  const sunAltitude = -0.8333;
  const hourAngleSunrise = rad2deg(
    Math.acos(
      (Math.sin(deg2rad(sunAltitude)) - Math.sin(deg2rad(location.lat)) * Math.sin(deg2rad(declination))) /
      (Math.cos(deg2rad(location.lat)) * Math.cos(deg2rad(declination)))
    )
  ) / 15;

  const sunriseHour = noon - hourAngleSunrise;
  const sunsetHour = noon + hourAngleSunrise;

  // Fajr
  const hourAngleFajr = rad2deg(
    Math.acos(
      (Math.sin(deg2rad(-fajrAngle)) - Math.sin(deg2rad(location.lat)) * Math.sin(deg2rad(declination))) /
      (Math.cos(deg2rad(location.lat)) * Math.cos(deg2rad(declination)))
    )
  ) / 15;
  const fajrHour = noon - hourAngleFajr;

  // Isha
  let ishaHour: number;
  if (method.ishaIntervalMinutes) {
    ishaHour = sunsetHour + method.ishaIntervalMinutes / 60;
  } else {
    const ishaAngle = method.ishaAngle || 18.0;
    const hourAngleIsha = rad2deg(
      Math.acos(
        (Math.sin(deg2rad(-ishaAngle)) - Math.sin(deg2rad(location.lat)) * Math.sin(deg2rad(declination))) /
        (Math.cos(deg2rad(location.lat)) * Math.cos(deg2rad(declination)))
      )
    ) / 15;
    ishaHour = noon + hourAngleIsha;
  }

  // Asr
  // Hanafi: shadow = 2 + tan(abs(lat - declination))
  // Shafi/Standard: shadow = 1 + tan(abs(lat - declination))
  const shadowFactor = asrMethod === 'hanafi' ? 2 : 1;
  const minShadow = Math.tan(deg2rad(Math.abs(location.lat - declination)));
  const asrAlt = rad2deg(Math.atan(1 / (shadowFactor + minShadow)));
  const hourAngleAsr = rad2deg(
    Math.acos(
      (Math.sin(deg2rad(asrAlt)) - Math.sin(deg2rad(location.lat)) * Math.sin(deg2rad(declination))) /
      (Math.cos(deg2rad(location.lat)) * Math.cos(deg2rad(declination)))
    )
  ) / 15;
  const asrHour = noon + hourAngleAsr;

  // Dhuhr start is solar noon + small buffer (e.g. 2-3 mins after exact zenith)
  const dhuhrHour = noon + 2 / 60;

  // Format hours to HH:mm string (24h or local time)
  const formatTime = (h: number): string => {
    let normalized = h;
    while (normalized < 0) normalized += 24;
    while (normalized >= 24) normalized -= 24;
    const hours = Math.floor(normalized);
    const minutes = Math.floor((normalized - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Prohibited prayer times:
  // 1. Sunrise prohibited (from sunrise to ~15 min after)
  const sunriseProhibitedEndHour = sunriseHour + 15 / 60;
  // 2. Zawal / exact noon (from 10 min before noon to noon)
  const zawalStartHour = noon - 10 / 60;
  const zawalEndHour = dhuhrHour;
  // 3. Sunset prohibited (from 15 min before sunset until sunset)
  const sunsetProhibitedStartHour = sunsetHour - 15 / 60;

  // Sahri warning: 10 minutes before Fajr
  const sahriWarningHour = fajrHour - 10 / 60;
  const sahriEndHour = fajrHour;

  // Tahajjud: Last 1/3rd of night until Subh Sadiq (Fajr start / Sahri end)
  const nightDuration = (24 - sunsetHour) + fajrHour;
  const tahajjudStartHour = sunsetHour + (nightDuration * (2 / 3));
  const tahajjudEndHour = fajrHour; // Ends precisely at Subh Sadiq (dawn)

  // Nafl Prayer Time Windows:
  // 1. Ishraq: starts 15 min after sunrise (when prohibited sunrise window ends) to ~1h 45m after sunrise
  const ishraqStartHour = sunriseProhibitedEndHour;
  const ishraqEndHour = sunriseHour + 105 / 60;

  // 2. Chasht / Salatud Duha: starts after Ishraq (mid-morning) until ~15 min before Zawal
  const chashtStartHour = ishraqEndHour;
  const chashtEndHour = zawalStartHour;

  // 3. Awwabin: starts 15 min after Maghrib (after 3 fardh + 2 sunnah) until Isha
  const awwabinStartHour = sunsetHour + 15 / 60;
  const awwabinEndHour = ishaHour;

  return {
    fajr: formatTime(fajrHour),
    sunrise: formatTime(sunriseHour),
    dhuhr: formatTime(dhuhrHour),
    asr: formatTime(asrHour),
    sunset: formatTime(sunsetHour),
    maghrib: formatTime(sunsetHour),
    isha: formatTime(ishaHour),
    tahajjudStart: formatTime(tahajjudStartHour),
    tahajjudEnd: formatTime(tahajjudEndHour),
    ishraqStart: formatTime(ishraqStartHour),
    ishraqEnd: formatTime(ishraqEndHour),
    chashtStart: formatTime(chashtStartHour),
    chashtEnd: formatTime(chashtEndHour),
    awwabinStart: formatTime(awwabinStartHour),
    awwabinEnd: formatTime(awwabinEndHour),
    sahriWarning: formatTime(sahriWarningHour),
    sahriEnd: formatTime(sahriEndHour),
    iftar: formatTime(sunsetHour),
    zawalStart: formatTime(zawalStartHour),
    zawalEnd: formatTime(zawalEndHour),
    sunriseProhibitedEnd: formatTime(sunriseProhibitedEndHour),
    sunsetProhibitedStart: formatTime(sunsetProhibitedStartHour),
  };
}

// Convert "HH:mm" on date to epoch timestamp
function timeStringToTimestamp(date: Date, timeStr: string, dayOffset = 0): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const target = new Date(date);
  target.setDate(target.getDate() + dayOffset);
  target.setHours(hours, minutes, 0, 0);
  return target.getTime();
}

// Determine current waqt, live countdown, progress and prohibited period status
export function getCurrentWaqtStatus(
  now: Date,
  prayerTimes: PrayerTimesData
): CurrentWaqtStatus {
  const nowMs = now.getTime();

  const fajrMs = timeStringToTimestamp(now, prayerTimes.fajr);
  const sunriseMs = timeStringToTimestamp(now, prayerTimes.sunrise);
  const sunriseProhibitedEndMs = timeStringToTimestamp(now, prayerTimes.sunriseProhibitedEnd);
  const zawalStartMs = timeStringToTimestamp(now, prayerTimes.zawalStart);
  const zawalEndMs = timeStringToTimestamp(now, prayerTimes.zawalEnd);
  const dhuhrMs = timeStringToTimestamp(now, prayerTimes.dhuhr);
  const asrMs = timeStringToTimestamp(now, prayerTimes.asr);
  const sunsetProhibitedStartMs = timeStringToTimestamp(now, prayerTimes.sunsetProhibitedStart);
  const maghribMs = timeStringToTimestamp(now, prayerTimes.maghrib);
  const ishaMs = timeStringToTimestamp(now, prayerTimes.isha);

  // Tomorrow fajr for isha duration
  const tomorrowFajrMs = fajrMs + 24 * 60 * 60 * 1000;
  // Yesterday isha for pre-fajr
  const yesterdayIshaMs = ishaMs - 24 * 60 * 60 * 1000;

  // Check prohibited times first
  if (nowMs >= sunriseMs && nowMs < sunriseProhibitedEndMs) {
    const diffSec = Math.floor((sunriseProhibitedEndMs - nowMs) / 1000);
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    return {
      currentWaqt: 'prohibited_sunrise',
      nextWaqt: 'dhuhr',
      nextWaqtTime: prayerTimes.dhuhr,
      remainingMinutes: m,
      remainingSeconds: s,
      formattedRemaining: `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
      progressPercent: Math.min(100, Math.max(0, ((nowMs - sunriseMs) / (sunriseProhibitedEndMs - sunriseMs)) * 100)),
      isProhibited: true,
      prohibitedReason: 'সূর্যোদয়ের নিষিদ্ধ সময় (মাকরুহ ওয়াক্ত)',
    };
  }

  if (nowMs >= zawalStartMs && nowMs < zawalEndMs) {
    const diffSec = Math.floor((zawalEndMs - nowMs) / 1000);
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    return {
      currentWaqt: 'prohibited_zawal',
      nextWaqt: 'dhuhr',
      nextWaqtTime: prayerTimes.dhuhr,
      remainingMinutes: m,
      remainingSeconds: s,
      formattedRemaining: `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
      progressPercent: Math.min(100, Math.max(0, ((nowMs - zawalStartMs) / (zawalEndMs - zawalStartMs)) * 100)),
      isProhibited: true,
      prohibitedReason: 'দ্বিপ্রহর / ঠিক মধ্যাহ্ন (সূর্য ঠিক মাথার উপর)',
    };
  }

  if (nowMs >= sunsetProhibitedStartMs && nowMs < maghribMs) {
    const diffSec = Math.floor((maghribMs - nowMs) / 1000);
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    return {
      currentWaqt: 'prohibited_sunset',
      nextWaqt: 'maghrib',
      nextWaqtTime: prayerTimes.maghrib,
      remainingMinutes: m,
      remainingSeconds: s,
      formattedRemaining: `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
      progressPercent: Math.min(100, Math.max(0, ((nowMs - sunsetProhibitedStartMs) / (maghribMs - sunsetProhibitedStartMs)) * 100)),
      isProhibited: true,
      prohibitedReason: 'সূর্যাস্তের নিষিদ্ধ সময় (আসরের কাজা ছাড়া নামাজ পড়া নিষেধ)',
    };
  }

  // Normal prayer intervals
  let current: PrayerName = 'isha';
  let next: PrayerName = 'fajr';
  let nextTime = prayerTimes.fajr;
  let startMs = ishaMs;
  let endMs = tomorrowFajrMs;

  if (nowMs < fajrMs) {
    current = 'isha';
    next = 'fajr';
    nextTime = prayerTimes.fajr;
    startMs = yesterdayIshaMs;
    endMs = fajrMs;
  } else if (nowMs >= fajrMs && nowMs < sunriseMs) {
    current = 'fajr';
    next = 'dhuhr';
    nextTime = prayerTimes.dhuhr;
    startMs = fajrMs;
    endMs = sunriseMs;
  } else if (nowMs >= sunriseMs && nowMs < dhuhrMs) {
    // Ishraq / Chasht window
    current = 'sunrise';
    next = 'dhuhr';
    nextTime = prayerTimes.dhuhr;
    startMs = sunriseMs;
    endMs = dhuhrMs;
  } else if (nowMs >= dhuhrMs && nowMs < asrMs) {
    current = 'dhuhr';
    next = 'asr';
    nextTime = prayerTimes.asr;
    startMs = dhuhrMs;
    endMs = asrMs;
  } else if (nowMs >= asrMs && nowMs < maghribMs) {
    current = 'asr';
    next = 'maghrib';
    nextTime = prayerTimes.maghrib;
    startMs = asrMs;
    endMs = maghribMs;
  } else if (nowMs >= maghribMs && nowMs < ishaMs) {
    current = 'maghrib';
    next = 'isha';
    nextTime = prayerTimes.isha;
    startMs = maghribMs;
    endMs = ishaMs;
  } else {
    // nowMs >= ishaMs
    current = 'isha';
    next = 'fajr';
    nextTime = prayerTimes.fajr;
    startMs = ishaMs;
    endMs = tomorrowFajrMs;
  }

  const diffSec = Math.max(0, Math.floor((endMs - nowMs) / 1000));
  const h = Math.floor(diffSec / 3600);
  const m = Math.floor((diffSec % 3600) / 60);
  const s = diffSec % 60;
  const formatted = h > 0 
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  const totalDuration = endMs - startMs;
  const elapsed = nowMs - startMs;
  const percent = totalDuration > 0 ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)) : 0;

  return {
    currentWaqt: current,
    nextWaqt: next,
    nextWaqtTime: nextTime,
    remainingMinutes: Math.floor(diffSec / 60),
    remainingSeconds: s,
    formattedRemaining: formatted,
    progressPercent: Math.round(percent),
    isProhibited: false,
  };
}

const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBn(num: number | string): string {
  return num
    .toString()
    .split('')
    .map((c) => bnDigits[parseInt(c, 10)] || c)
    .join('');
}

// Bengali Calendar calculation (Bangla Sal - বঙ্গাব্দ)
export function getBengaliDate(date: Date): { day: number; monthName: string; year: number; fullBn: string } {
  const monthsBn = [
    'বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 
    'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'
  ];

  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  // Reference: Pohela Boishakh is April 14 in Bangladesh
  // Determine Bengali Year
  let banglaYear = year - 593;
  if (month < 3 || (month === 3 && day < 14)) {
    banglaYear -= 1;
  }

  // Days in Bengali months (standard reformed)
  // Boishakh to Bhadro (1-5): 31 days each
  // Ashwin to Falgun (6-11): 30 days each (Falgun 31 in leap year)
  // Choitro (12): 30 days
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const daysInMonths = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, isLeap ? 31 : 30, 30];

  // Starting anchor: April 14 is 1 Boishakh
  const anchor = new Date(year, 3, 14); // Apr 14
  let diffDays = Math.floor((date.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Falls into the previous Bengali year
    const prevAnchor = new Date(year - 1, 3, 14);
    diffDays = Math.floor((date.getTime() - prevAnchor.getTime()) / (1000 * 60 * 60 * 24));
  }

  let mIdx = 0;
  let remainingDays = diffDays;
  for (let i = 0; i < 12; i++) {
    if (remainingDays < daysInMonths[i]) {
      mIdx = i;
      break;
    }
    remainingDays -= daysInMonths[i];
  }

  const banglaDay = remainingDays + 1;
  const monthName = monthsBn[mIdx];

  return {
    day: banglaDay,
    monthName,
    year: banglaYear,
    fullBn: `${toBn(banglaDay)} ${monthName}, ${toBn(banglaYear)} বঙ্গাব্দ`,
  };
}

// Hijri Calendar approximation with Bangladesh Islamic Foundation adjustment
export function getHijriDate(date: Date, adjustmentDays = 0): { day: number; monthNameBn: string; monthNameEn: string; monthNameAr: string; year: number; fullBn: string; fullEn: string } {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBn = (num: number) => num.toString().split('').map(c => bnDigits[parseInt(c, 10)] || c).join('');

  const hijriMonthsBn = [
    'মুহাররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 'জমাদিউল আউয়াল', 'জমাদিউস সানি',
    'রজব', 'শাবান', 'রমাদান', 'শাওয়াল', 'জিলকদ', 'জিলহজ'
  ];
  const hijriMonthsEn = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi ath-Thani', 'Jumada al-Awwal', 'Jumada ath-Thani',
    'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];
  const hijriMonthsAr = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة',
    'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];

  // Umm al-Qura astronomical algorithm
  const jd = getJulianDate(new Date(date.getTime() + adjustmentDays * 24 * 60 * 60 * 1000));
  let l = Math.floor(jd - 1948440 + 10632);
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
  l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  const m = Math.floor((24 * l) / 709);
  const d = l - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;

  const monthIdx = Math.max(0, Math.min(11, m - 1));
  const hDay = Math.max(1, Math.min(30, d));

  return {
    day: hDay,
    monthNameBn: hijriMonthsBn[monthIdx],
    monthNameEn: hijriMonthsEn[monthIdx],
    monthNameAr: hijriMonthsAr[monthIdx],
    year: y,
    fullBn: `${toBn(hDay)} ${hijriMonthsBn[monthIdx]}, ${toBn(y)} হিজরি`,
    fullEn: `${hDay} ${hijriMonthsEn[monthIdx]}, ${y} AH`,
  };
}

// Convert 24hr "HH:mm" to 12hr with AM/PM or Bengali 'সকাল/দুপুর/বিকাল/সন্ধ্যা/রাত'
export function formatPrayerTime12h(time24: string, lang: 'bn' | 'en' | 'ar' = 'bn'): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const isPm = h >= 12;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mFormatted = m.toString().padStart(2, '0');

  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBn = (str: string) => str.split('').map(c => bnDigits[parseInt(c, 10)] || c).join('');

  if (lang === 'bn') {
    const timeBn = `${toBn(h12.toString())}:${toBn(mFormatted)}`;
    if (h < 5) return `রাত ${timeBn}`;
    if (h < 12) return `সকাল ${timeBn}`;
    if (h < 15) return `দুপুর ${timeBn}`;
    if (h < 18) return `বিকাল ${timeBn}`;
    if (h < 20) return `সন্ধ্যা ${timeBn}`;
    return `রাত ${timeBn}`;
  }

  const ampm = isPm ? 'PM' : 'AM';
  return `${h12}:${mFormatted} ${ampm}`;
}

// Comprehensive Nafl Prayer List with live status and time calculations
export function getNaflPrayersList(
  prayerTimes: PrayerTimesData,
  now: Date = new Date(),
  lang: 'bn' | 'en' | 'ar' = 'bn'
): NaflPrayerItem[] {
  const nowMs = now.getTime();

  // Helper to check if now is within start and end time window
  const checkStatus = (startStr: string, endStr: string, crossesMidnight = false): { isRunning: boolean; remainingMinutes: number } => {
    if (!startStr || !endStr) return { isRunning: false, remainingMinutes: 0 };
    const [sH, sM] = startStr.split(':').map(Number);
    const [eH, eM] = endStr.split(':').map(Number);

    const startDate = new Date(now);
    startDate.setHours(sH, sM, 0, 0);

    const endDate = new Date(now);
    endDate.setHours(eH, eM, 0, 0);

    if (crossesMidnight) {
      if (sH > eH) {
        if (now.getHours() < eH) {
          startDate.setDate(startDate.getDate() - 1);
        } else {
          endDate.setDate(endDate.getDate() + 1);
        }
      }
    }

    const startMs = startDate.getTime();
    const endMs = endDate.getTime();

    const isRunning = nowMs >= startMs && nowMs < endMs;
    const remainingMinutes = isRunning ? Math.max(0, Math.floor((endMs - nowMs) / 60000)) : 0;
    return { isRunning, remainingMinutes };
  };

  const ishraqStatus = checkStatus(prayerTimes.ishraqStart, prayerTimes.ishraqEnd);
  const chashtStatus = checkStatus(prayerTimes.chashtStart, prayerTimes.chashtEnd);
  const awwabinStatus = checkStatus(prayerTimes.awwabinStart, prayerTimes.awwabinEnd);
  const tahajjudStatus = checkStatus(prayerTimes.tahajjudStart, prayerTimes.tahajjudEnd, true);

  return [
    {
      id: 'ishraq',
      nameBn: 'সালাতুল ইশরাক',
      nameEn: 'Salat al-Ishraq',
      nameAr: 'صَلَاةُ الإِشْرَاقِ',
      rakatBn: '২ থেকে ৪ রাকাত (২ রাকাত করে)',
      rakatEn: '2 to 4 Rakats (in sets of 2)',
      startTime: prayerTimes.ishraqStart,
      endTime: prayerTimes.ishraqEnd,
      isRunning: ishraqStatus.isRunning,
      remainingMinutes: ishraqStatus.remainingMinutes,
      statusTextBn: ishraqStatus.isRunning ? 'এখন ইশরাকের মোবারক সময় চলমান' : undefined,
      statusTextEn: ishraqStatus.isRunning ? 'Blessed time of Ishraq is currently active' : undefined,
      importanceBn: 'সূর্যোদয়ের পর প্রথম নফল সালাত',
      importanceEn: 'First voluntary prayer after sunrise',
      virtueBn: 'রাসূলুল্লাহ ﷺ বলেছেন: "যে ব্যক্তি ফজরের নামাজ জামাতে পড়ে সূর্যোদয় পর্যন্ত আল্লাহর জিকিরে বসে থাকে, অতঃপর দুই রাকাত নামাজ আদায় করে, সে একটি পূর্ণ হজ ও একটি পূর্ণ ওমরার সমতুল্য সওয়াব লাভ করে।"',
      virtueEn: 'The Prophet ﷺ said: "Whoever prays Fajr in congregation then sits remembering Allah until sunrise, then prays two Rakats, will receive the reward of a complete Hajj and Umrah."',
      hadithReferenceBn: 'সুনানুত তিরমিযী: ৫৮৬ (হাসান)',
      hadithReferenceEn: 'Jami` at-Tirmidhi: 586 (Hasan)',
      howToPrayBn: 'সূর্যোদয়ের ১৫-২০ মিনিট পর (সূর্যোদয়ের নিষিদ্ধ সময় শেষ হলে) পবিত্র হয়ে সাধারণ নফল নামাজের মতো ২ বা ৪ রাকাত নামাজ আদায় করবেন।',
      howToPrayEn: 'Pray 2 or 4 rakats 15-20 minutes after sunrise once the prohibited sunrise window ends.',
      isTimeBounded: true,
    },
    {
      id: 'chasht',
      nameBn: 'সালাতুদ দুহা (চাশত)',
      nameEn: 'Salat ad-Duha (Chasht)',
      nameAr: 'صَلَاةُ الضُّحَىٰ',
      rakatBn: '২, ৪, ৮ বা ১২ রাকাত (২ রাকাত করে)',
      rakatEn: '2, 4, 8 or 12 Rakats (in sets of 2)',
      startTime: prayerTimes.chashtStart,
      endTime: prayerTimes.chashtEnd,
      isRunning: chashtStatus.isRunning,
      remainingMinutes: chashtStatus.remainingMinutes,
      statusTextBn: chashtStatus.isRunning ? 'এখন সালাতুদ দুহা / চাশতের সময় চলমান' : undefined,
      statusTextEn: chashtStatus.isRunning ? 'Blessed time of Duha is currently active' : undefined,
      importanceBn: 'অঙ্গ-প্রত্যঙ্গের শোকরিয়া ও রিজিকের বরকত',
      importanceEn: 'Gratitude for bodily joints and barakah in sustenance',
      virtueBn: 'রাসূলুল্লাহ ﷺ বলেছেন: "তোমাদের প্রত্যেকের শরীরের প্রতিটি গ্রন্থির পক্ষ থেকে প্রতিদিন একটি সদকা দেওয়া আবশ্যক... আর চাশতের দুই রাকাত নামাজ এই সবগুলোর পক্ষ থেকে যথেষ্ট হয়ে যায়।"',
      virtueEn: 'The Prophet ﷺ said: "Charity is due upon every joint of each of you every day... and two Rakats prayed at Duha suffices for all of that."',
      hadithReferenceBn: 'সহিহ মুসলিম: ৭২০',
      hadithReferenceEn: 'Sahih Muslim: 720',
      howToPrayBn: 'সকাল ৯:০০/৯:৩০ থেকে দ্বিপ্রহরের নিষিদ্ধ সময়ের পূর্ব পর্যন্ত (যাওয়ালের ১০ মিনিট আগে) ২ বা ৪ রাকাত করে আদায় করা সর্বোত্তম।',
      howToPrayEn: 'Best prayed between mid-morning (9:00 AM) and 15 minutes before the midday (Zawal) window.',
      isTimeBounded: true,
    },
    {
      id: 'awwabin',
      nameBn: 'সালাতুল আওয়াবীন',
      nameEn: 'Salat al-Awwabin',
      nameAr: 'صَلَاةُ الأَوَّابِينَ',
      rakatBn: '৬ থেকে ২০ রাকাত (২ রাকাত করে)',
      rakatEn: '6 to 20 Rakats (in sets of 2)',
      startTime: prayerTimes.awwabinStart,
      endTime: prayerTimes.awwabinEnd,
      isRunning: awwabinStatus.isRunning,
      remainingMinutes: awwabinStatus.remainingMinutes,
      statusTextBn: awwabinStatus.isRunning ? 'এখন আওয়াবীনের মোবারক সময় চলমান' : undefined,
      statusTextEn: awwabinStatus.isRunning ? 'Blessed time of Awwabin is currently active' : undefined,
      importanceBn: 'আল্লাহর দিকে নিবিষ্ট প্রত্যাবর্তনকারীদের বিশেষ নফল',
      importanceEn: 'Prayer of the penitents returning to Allah after Maghrib',
      virtueBn: 'হাদিস শরিফে এসেছে: "যে ব্যক্তি মাগরিবের পর কোনো অনর্থক কথা না বলে ছয় রাকাত নফল নামাজ পড়বে, তার জন্য বারো বছর নফল ইবাদতের সমপরিমাণ সওয়াব লেখা হবে।"',
      virtueEn: 'Hadith: "Whoever prays six Rakats after Maghrib without speaking ill words in between, it will be recorded for him as twelve years of worship."',
      hadithReferenceBn: 'সুনানুত তিরমিযী: ৪৩৫; ইবনে মাজাহ: ১৩৭৪',
      hadithReferenceEn: 'Jami` at-Tirmidhi: 435; Sunan Ibn Majah: 1374',
      howToPrayBn: 'মাগরিবের ৩ রাকাত ফরজ ও ২ রাকাত সুন্নাত সমাপ্তির পর এশার ওয়াক্ত শুরু হওয়ার আগ পর্যন্ত ২ রাকাত করে মোট ৬ থেকে ২০ রাকাত নামাজ আদায় করা যায়।',
      howToPrayEn: 'Prayed after the Fard and Sunnah of Maghrib in units of two rakats until Isha starts.',
      isTimeBounded: true,
    },
    {
      id: 'tahajjud',
      nameBn: 'সালাতুত তাহাজ্জুদ (কিয়ামুল লাইল)',
      nameEn: 'Salat al-Tahajjud (Night Prayer)',
      nameAr: 'صَلَاةُ التَّهَجُّدِ',
      rakatBn: '২, ৪, ৮, ১০ বা ১২ রাকাত (২ রাকাত করে)',
      rakatEn: '2, 4, 8, 10 or 12 Rakats (in sets of 2)',
      startTime: prayerTimes.tahajjudStart,
      endTime: prayerTimes.tahajjudEnd,
      isRunning: tahajjudStatus.isRunning,
      remainingMinutes: tahajjudStatus.remainingMinutes,
      statusTextBn: tahajjudStatus.isRunning ? 'এখন তাহাজ্জুদের ফযিলতপূর্ণ সময় চলমান' : undefined,
      statusTextEn: tahajjudStatus.isRunning ? 'Excellence hour of Tahajjud is currently active' : undefined,
      importanceBn: 'ফরজ নামাজের পর আল্লাহর সর্বাধিক প্রিয় সালাত',
      importanceEn: 'The most beloved prayer to Allah after the obligatory prayers',
      virtueBn: 'আল্লাহ তাআলা বলেন: "এবং রাতের কিছু অংশে তাহাজ্জুদ পড়ুন, যা আপনার জন্য এক অতিরিক্ত ইবাদত; হয়তো আপনার রব আপনাকে প্রশংসিত স্থানে (মাকামে মাহমুদ) প্রতিষ্ঠিত করবেন।" (সূরা বনী ইসরাঈল: ৭৯)।',
      virtueEn: 'Allah says: "And from the night, pray with it as additional for you; it may be that your Lord will raise you to a praised station." (Surah Al-Isra: 79).',
      hadithReferenceBn: 'সহিহ মুসলিম: ১১৬৩; তিরমিযী: ৩৪৯৯',
      hadithReferenceEn: 'Sahih Muslim: 1163; Tirmidhi: 3499',
      howToPrayBn: 'এশার নামাজ ও কিছু সময় ঘুমের পর রাতের শেষ তৃতীয়াংশে উঠে ওযু করে ধীরে ধীরে খুশু-খুজুর সাথে ২ রাকাত করে তাহাজ্জুদ পড়া সবচেয়ে উত্তম। সুবহে সাদিক পর্যন্ত এর সময় থাকে।',
      howToPrayEn: 'Prayed in the last third of the night after sleeping, in sets of 2 rakats with full devotion until Dawn.',
      isTimeBounded: true,
    },
    {
      id: 'tahiyyatul_wudu',
      nameBn: 'তাহিয়্যাতুল ওযু',
      nameEn: 'Tahiyyat al-Wudu',
      nameAr: 'تَحِيَّةُ الوُضُوءِ',
      rakatBn: '২ রাকাত',
      rakatEn: '2 Rakats',
      startTime: 'ওযু পরবর্তী সময়ে',
      startTimeEn: 'Right after Wudu',
      endTime: 'অঙ্গ শুকানোর আগে',
      endTimeEn: 'Before limbs dry',
      isRunning: false,
      importanceBn: 'পবিত্রতা অর্জনের পর পরম শোকরিয়ার নামাজ',
      importanceEn: 'Gratitude prayer immediately following ritual ablution',
      virtueBn: 'রাসূলুল্লাহ ﷺ বলেছেন: "যে ব্যক্তি সুন্দরভাবে ওযু করে একাগ্রচিত্তে দুই রাকাত নামাজ পড়ে, তার জন্য জান্নাত অবধারিত হয়ে যায়।" (সহিহ মুসলিম: ২৩৪)।',
      virtueEn: 'The Prophet ﷺ said: "Whoever makes wudu meticulously and prays two Rakats with deep devotion will be guaranteed Paradise."',
      hadithReferenceBn: 'সহিহ মুসলিম: ২৩৪',
      hadithReferenceEn: 'Sahih Muslim: 234',
      howToPrayBn: 'ওযু সমাপ্ত করার পর শরীরের অঙ্গগুলো শুকিয়ে যাওয়ার পূর্বেই যে কোনো সময়ে (নিষিদ্ধ তিনটি ওয়াক্ত ব্যতীত) দুই রাকাত নফল সালাত আদায় করবেন।',
      howToPrayEn: 'Pray 2 rakats right after finishing wudu before limbs dry (avoiding prohibited times).',
      isTimeBounded: false,
    },
    {
      id: 'tahiyyatul_masjid',
      nameBn: 'তাহিয়্যাতুল মাসজিদ',
      nameEn: 'Tahiyyat al-Masjid',
      nameAr: 'تَحِيَّةُ المَسْجِدِ',
      rakatBn: '২ রাকাত',
      rakatEn: '2 Rakats',
      startTime: 'মসজিদে প্রবেশের পর',
      startTimeEn: 'Upon entering mosque',
      endTime: 'বসার পূর্বে',
      endTimeEn: 'Before sitting down',
      isRunning: false,
      importanceBn: 'আল্লাহর ঘরের প্রতি সম্মান ও অভিবাদন',
      importanceEn: 'Honoring and greeting the House of Allah upon entering',
      virtueBn: 'রাসূলুল্লাহ ﷺ বলেছেন: "তোমাদের কেউ যখন মসজিদে প্রবেশ করবে, সে যেন বসার পূর্বে দুই রাকাত নামাজ পড়ে নেয়।"',
      virtueEn: 'The Prophet ﷺ said: "When one of you enters the mosque, let him not sit down until he prays two Rakats."',
      hadithReferenceBn: 'সহিহ বুখারী: ৪৪৪; সহিহ মুসলিম: ৭১৪',
      hadithReferenceEn: 'Sahih Bukhari: 444; Sahih Muslim: 714',
      howToPrayBn: 'মসজিদে প্রবেশের পর বসার পূর্বেই দাঁড়িয়ে দুই রাকাত নফল নামাজ আদায় করে নিতে হবে। তবে মাকরুহ সময়ে মসজিদে প্রবেশ করলে তাসবীহ ও জিকির পড়া উত্তম।',
      howToPrayEn: 'Prayed standing before sitting down upon entering the mosque.',
      isTimeBounded: false,
    },
    {
      id: 'salat_hajat',
      nameBn: 'সালাতুল হাজত',
      nameEn: 'Salat al-Hajah',
      nameAr: 'صَلَاةُ الحَاجَةِ',
      rakatBn: '২ বা ৪ রাকাত',
      rakatEn: '2 or 4 Rakats',
      startTime: 'প্রয়োজনের যেকোনো সময়',
      startTimeEn: 'Any time of need',
      endTime: 'নিষিদ্ধ সময় ব্যতীত',
      endTimeEn: 'Except prohibited times',
      isRunning: false,
      importanceBn: 'যেকোনো বৈধ জাগতিক বা পরকালীন প্রয়োজনে নিবেদিত সালাত',
      importanceEn: 'Seeking relief and guidance from Allah for any lawful need',
      virtueBn: 'রাসূলুল্লাহ ﷺ বলেছেন: "আল্লাহর নিকট বা কোনো মানুষের নিকট কারও যদি কোনো প্রয়োজন দেখা দেয়, সে যেন সুন্দরভাবে ওযু করে দুই রাকাত নামাজ পড়ে আল্লাহর প্রশংসা করে এবং দুরুদ পাঠ করে প্রার্থনা জানায়..."',
      virtueEn: 'The Prophet ﷺ said: "Whoever has a need from Allah or another person, let him make wudu well, pray two Rakats, praise Allah and invoke blessings on the Prophet..."',
      hadithReferenceBn: 'সুনানুত তিরমিযী: ৪৭৯; ইবনে মাজাহ: ১৩৮৪',
      hadithReferenceEn: 'Jami` at-Tirmidhi: 479; Sunan Ibn Majah: 1384',
      howToPrayBn: 'একাগ্রতার সাথে ২ রাকাত নফল পড়ে আল্লাহর হামদ ও সানা এবং রাসূল ﷺ-এর ওপর দুরুদ পাঠ করে দোয়ায়ে হাজত পাঠ করবেন।',
      howToPrayEn: 'Pray 2 rakats with humility, praise Allah, send salawat, and supplicate with Dua al-Hajah.',
      isTimeBounded: false,
    },
    {
      id: 'salat_tawbah',
      nameBn: 'সালাতুত তাওবা',
      nameEn: 'Salat al-Tawbah',
      nameAr: 'صَلَاةُ التَّوْبَةِ',
      rakatBn: '২ রাকাত',
      rakatEn: '2 Rakats',
      startTime: 'গোনাহের পর তাৎক্ষণিক',
      startTimeEn: 'Immediately after sinning',
      endTime: 'নিষিদ্ধ সময় ব্যতীত',
      endTimeEn: 'Except prohibited times',
      isRunning: false,
      importanceBn: 'গোনাহ মাফ ও আল্লাহর রহমতের দিকে প্রত্যাবর্তনের সালাত',
      importanceEn: 'Seeking forgiveness and returning to Allah’s mercy',
      virtueBn: 'রাসূলুল্লাহ ﷺ বলেছেন: "যখন কোনো বান্দা কোনো গোনাহ করে ফেলে, অতঃপর পবিত্রতা অর্জন করে দুই রাকাত নামাজ পড়ে এবং আল্লাহর কাছে ক্ষমা প্রার্থনা করে, আল্লাহ তাকে ক্ষমা করে দেন।"',
      virtueEn: 'The Prophet ﷺ said: "When a servant commits a sin, purifies himself, prays two Rakats and asks Allah for forgiveness, Allah forgives him."',
      hadithReferenceBn: 'সুনানুত তিরমিযী: ৪০৫; আবু দাউদ: ১৫২১',
      hadithReferenceEn: 'Jami` at-Tirmidhi: 405; Sunan Abu Dawood: 1521',
      howToPrayBn: 'আন্তরিক অনুশোচনা ও পাপ ত্যাগের দৃঢ় সংকল্প নিয়ে দুই রাকাত নফল নামাজ পড়ে বিনম্রভাবে সাইয়্যিদুল এস্তেগফার পাঠ করবেন।',
      howToPrayEn: 'Perform wudu with sincere remorse, pray 2 rakats and recite Sayyidul Istighfar.',
      isTimeBounded: false,
    },
    {
      id: 'salat_tasbeeh',
      nameBn: 'সালাতুত তাসবীহ',
      nameEn: 'Salat al-Tasbeeh',
      nameAr: 'صَلَاةُ التَّسْبِيحِ',
      rakatBn: '৪ রাকাত (মোট ৩০০ বার তাসবীহ)',
      rakatEn: '4 Rakats (300 Tasbeeh total)',
      startTime: 'সুবিধাজনক যেকোনো সময়',
      startTimeEn: 'Any convenient time',
      endTime: 'নিষিদ্ধ সময় ব্যতীত',
      endTimeEn: 'Except prohibited times',
      isRunning: false,
      importanceBn: 'জীবনের সমস্ত অতীত ও ভবিষ্যতের পাপ মোচনের নামাজ',
      importanceEn: 'Forgiveness of all past and future sins',
      virtueBn: 'রাসূলুল্লাহ ﷺ তাঁর চাচা আব্বাস (রা.)-কে বলেছিলেন: "যদি সম্ভব হয় তবে প্রতিদিন একবার, তা না হলে সপ্তাহে একবার, না পারলে মাসে একবার, না পারলে বছরে একবার, আর তাও না পারলে জীবনে অন্তত একবার এই নামাজ পড়বে..."',
      virtueEn: 'The Prophet ﷺ said to his uncle Abbas (RA): "Pray it daily, or weekly, or monthly, or yearly, or at least once in your lifetime..."',
      hadithReferenceBn: 'সুনান আবু দাউদ: ১২৯৭; তিরমিযী: ৪৮১',
      hadithReferenceEn: 'Sunan Abu Dawood: 1297; Jami` at-Tirmidhi: 481',
      howToPrayBn: '৪ রাকাত নামাজে প্রতি রাকাতে ৭৫ বার করে "সুবহানাল্লাহি ওয়াল হামদুলিল্লাহি ওয়া লা ইলাহা ইল্লাল্লাহু ওয়াল্লাহু আকবার" তাসবীহ পাঠ করতে হয়।',
      howToPrayEn: 'In 4 rakats, recite SubhanAllah wal-Hamdulillah wa La ilaha illAllah wallahu Akbar 75 times per rakat.',
      isTimeBounded: false,
    },
    {
      id: 'salat_istikharah',
      nameBn: 'সালাতুল ইস্তিখারাহ',
      nameEn: 'Salat al-Istikharah',
      nameAr: 'صَلَاةُ الاِسْتِخَارَةِ',
      rakatBn: '২ রাকাত',
      rakatEn: '2 Rakats',
      startTime: 'সিদ্ধান্তের পূর্বে যেকোনো সময়',
      startTimeEn: 'Before making decision',
      endTime: 'নিষিদ্ধ সময় ব্যতীত',
      endTimeEn: 'Except prohibited times',
      isRunning: false,
      importanceBn: 'যেকোনো গুরুত্বপূর্ণ বিষয়ে আল্লাহর কাছ থেকে কল্যাণের নির্দেশনা প্রার্থনা',
      importanceEn: 'Seeking divine guidance and barakah before important life decisions',
      virtueBn: 'রাসূলুল্লাহ ﷺ সাহাবায়ে কেরামকে কুরআনের সূরার মতো গুরুত্ব দিয়ে ইস্তিখারাহ সালাত ও দোয়া শিক্ষা দিতেন।',
      virtueEn: 'The Prophet ﷺ taught Istikharah to his companions with the same care as teaching a surah of the Quran.',
      hadithReferenceBn: 'সহিহ বুখারী: ১১৬২',
      hadithReferenceEn: 'Sahih Bukhari: 1162',
      howToPrayBn: 'বিবাহ, ব্যবসা, চাকরি বা যেকোনো গুরুত্বপূর্ণ বিষয়ের পূর্বে দুই রাকাত নফল নামাজ পড়ে সহিহ বুখারীর বর্ণিত ইস্তিখারার দোয়া পাঠ করবেন।',
      howToPrayEn: 'Pray 2 rakats before deciding, then recite the authentic Istikharah supplication.',
      isTimeBounded: false,
    },
  ];
}

// Get the currently active running Nafl prayer (if any)
export function getRunningNaflPrayer(
  prayerTimes: PrayerTimesData,
  now: Date = new Date(),
  lang: 'bn' | 'en' | 'ar' = 'bn'
): NaflPrayerItem | null {
  const allNafl = getNaflPrayersList(prayerTimes, now, lang);
  return allNafl.find(p => p.isRunning) || null;
}
