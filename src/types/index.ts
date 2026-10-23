export type AppLanguage = 'bn' | 'ar' | 'en';
export type AppTheme = 'light' | 'dark' | 'amoled';
export type ColorTheme = 'teal' | 'sapphire' | 'emerald' | 'minimal' | 'rose' | 'amber' | 'purple' | 'custom';
export type UserGender = 'male' | 'female';
export type ArabicFontFamily = 'amiri-quran' | 'noto-naskh' | 'scheherazade' | 'amiri' | 'lateef' | 'noto-nastaliq';

export interface LocationInfo {
  name: string;
  nameBn: string;
  nameAr: string;
  lat: number;
  lng: number;
  country: string;
  timezone?: string;
}

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimesData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  sunset: string;
  maghrib: string;
  isha: string;
  tahajjudStart: string;
  tahajjudEnd: string;
  ishraqStart: string;
  ishraqEnd: string;
  chashtStart: string;
  chashtEnd: string;
  awwabinStart: string;
  awwabinEnd: string;
  sahriWarning: string;
  sahriEnd: string;
  iftar: string;
  zawalStart: string;
  zawalEnd: string;
  sunriseProhibitedEnd: string;
  sunsetProhibitedStart: string;
}

export interface NaflPrayerItem {
  id: string;
  nameBn: string;
  nameEn?: string;
  nameAr: string;
  rakatBn: string;
  rakatEn?: string;
  startTime: string; // HH:mm or textual time
  startTimeEn?: string;
  endTime: string;   // HH:mm or textual time
  endTimeEn?: string;
  isRunning: boolean;
  statusTextBn?: string;
  statusTextEn?: string;
  remainingMinutes?: number;
  importanceBn: string;
  importanceEn?: string;
  virtueBn: string;
  virtueEn?: string;
  hadithReferenceBn: string;
  hadithReferenceEn?: string;
  howToPrayBn: string;
  howToPrayEn?: string;
  isTimeBounded: boolean;
}

export interface CurrentWaqtStatus {
  currentWaqt: PrayerName | 'prohibited_sunrise' | 'prohibited_zawal' | 'prohibited_sunset' | 'none';
  nextWaqt: PrayerName;
  nextWaqtTime: string;
  remainingMinutes: number;
  remainingSeconds: number;
  formattedRemaining: string;
  progressPercent: number;
  isProhibited: boolean;
  prohibitedReason?: string;
}

export interface SurahMeta {
  number: number;
  nameArabic: string;
  nameBangla: string;
  nameEnglish: string;
  englishTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  revelationTypeBn: string;
  juzStart: number;
  pageStart: number;
}

export interface AyahItem {
  numberInSurah: number;
  numberInQuran: number;
  textArabic: string;
  textArabicTajweed?: string; // HTML with Tajweed color classes
  transliterationBn: string;
  translationBn: string;
  translationEn: string;
  juz: number;
  page: number;
  audioUrl?: string;
  isSajdah?: boolean;
}

export interface DuaItem {
  id: string;
  category: string;
  categoryBn: string;
  title: string;
  titleBn: string;
  arabic: string;
  transliterationBn: string;
  translationBn: string;
  translationEn: string;
  reference: string;
  referenceBn: string;
  benefitsBn?: string;
  audioUrl?: string;
  counterTarget?: number;
}

export interface HadithItem {
  id: string;
  category: string;
  categoryBn: string;
  titleBn: string;
  arabic: string;
  translationBn: string;
  translationEn: string;
  narratorBn: string;
  source: string;
  sourceBn: string;
  explanationBn: string;
  grade: 'Sahih' | 'Hasan';
  gradeBn: string;
}

export interface MasalaItem {
  id: string;
  category: string;
  categoryBn: string;
  questionBn: string;
  answerBn: string;
  references: string[];
  madhabNote?: string;
}

export interface PeriodTrackerData {
  isEnabled: boolean;
  isLocked: boolean;
  pinCode?: string;
  lastPeriodStartDate: string; // YYYY-MM-DD
  cycleLengthDays: number; // default 28
  periodDurationDays: number; // default 5
  history: {
    startDate: string;
    endDate?: string;
    notes?: string;
    symptoms?: string[];
  }[];
  reminderDaysBefore: number; // 2
}

export interface UserPreferences {
  language: AppLanguage;
  theme: AppTheme;
  colorTheme?: ColorTheme;
  customPrimaryColor?: string;
  gender?: UserGender | null;
  location: LocationInfo;
  calculationMethod: string;
  asrMethod: 'hanafi' | 'standard';
  ramadanMode: boolean;
  fontSizeArabic: number;
  fontSizeBengali: number;
  arabicFont?: ArabicFontFamily;
  showTransliteration: boolean;
  showEnglishTranslation: boolean;
  showTajweedColors: boolean;
  selectedReciter: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  bookmarks: number[]; // Surah numbers
  favoriteAyahs: { surah: number; ayah: number }[];
  favoriteDuas: string[];
  favoriteHadiths: string[];
  tasbeehCounts: Record<string, number>;
  tasbeehLifetimeCounts?: Record<string, number>; // Permanent grand total counts per dhikr (e.g. Astaghfirullah 21234 times)
  customDhikrs?: {
    id: string;
    nameBn: string;
    nameAr: string;
    meaningBn: string;
    defaultTarget: number;
    category?: string;
    categoryLabel?: string;
    isCustom?: boolean;
  }[];
  activeTasbeehDhikr: string;
  dailyAmalChecklist: Record<string, boolean>; // e.g., '2026-10-02_fajr': true
  onboardingCompleted: boolean;
  reducedMotion?: boolean;
  quranMode?: 'study' | 'mushaf';
  lineSpacing?: number;
  mushafEdition?: string;
  highContrast?: boolean;
  largeFontMode?: boolean;
  bottomNavSpacing?: 'auto' | 'compact' | 'standard' | 'extra';
}
