import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, LocationInfo, PrayerTimesData, CurrentWaqtStatus, UserGender } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  getCurrentWaqtStatus,
  getBengaliDate,
  getHijriDate,
  formatPrayerTime12h,
  getRunningNaflPrayer,
  getNaflPrayersList,
} from '../utils/prayerTimes';
import { HADITHS_LIST } from '../data/hadithData';
import { DAILY_AYAHS_LIST } from '../data/dailyAyahData';
import { PrayerHeroCard } from './PrayerHeroCard';
import { NaflHeroCard } from './NaflHeroCard';
import {
  getPeriodApproachingStatus,
  checkAndTriggerPeriodNotification,
  PeriodNotificationStatus,
} from '../utils/periodNotification';
import {
  BookOpen,
  Clock,
  Compass,
  Heart,
  BookmarkCheck,
  Sparkles,
  AlertTriangle,
  Sunrise,
  Sunset,
  Moon,
  ChevronRight,
  ChevronDown,
  Share2,
  Check,
  Shield,
  Volume2,
  VolumeX,
  RotateCw,
  ExternalLink,
  X,
  Calendar,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';
import {
  triggerHaptic,
  speakArabic,
  getAyahAudioUrl,
  getDailyAyahPlaylist,
  AyahAudioTrack,
  speakAyahTranslation,
  stopSpeechAudio,
} from '../utils/audioPlayer';
import heroMosqueArt from '../assets/images/islamic_hero_mosque_1790957336258.jpg';
import { getQuranLastRead, QuranLastRead } from '../utils/quranTracker';
import { getAyyamBizStatus } from '../utils/ayyamBiz';

interface HomeDashboardProps {
  language: AppLanguage;
  gender?: UserGender | null;
  location: LocationInfo;
  prayerTimes: PrayerTimesData;
  onNavigate: (tab: string, extra?: unknown) => void;
  onOpenLocationModal: () => void;
  ramadanMode: boolean;
  onToggleRamadanMode?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  language,
  gender,
  location,
  prayerTimes,
  onNavigate,
  onOpenLocationModal,
  ramadanMode,
  onToggleRamadanMode,
}) => {
  const t = TRANSLATIONS[language];
  const [now, setNow] = useState<Date>(new Date());
  const [copiedHadith, setCopiedHadith] = useState(false);
  const [activeHomeView, setActiveHomeView] = useState<'standard' | 'ramadan'>('standard');
  const [showDuaType, setShowDuaType] = useState<'iftar' | 'niyyah'>('iftar');
  const [lastReadQuran, setLastReadQuran] = useState<QuranLastRead | null>(() => getQuranLastRead());
  const [showAyyamBizNiyyah, setShowAyyamBizNiyyah] = useState<boolean>(false);
  const [ayyamBizDismissed, setAyyamBizDismissed] = useState<boolean>(false);

  // 1-second timer for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for Quran reading progress updates across app
  useEffect(() => {
    const refreshLastRead = () => {
      setLastReadQuran(getQuranLastRead());
    };
    window.addEventListener('storage', refreshLastRead);
    window.addEventListener('focus', refreshLastRead);
    return () => {
      window.removeEventListener('storage', refreshLastRead);
      window.removeEventListener('focus', refreshLastRead);
    };
  }, []);

  const waqtStatus: CurrentWaqtStatus = getCurrentWaqtStatus(now, prayerTimes);
  const runningNafl = getRunningNaflPrayer(prayerTimes, now, language);
  const bengaliDate = getBengaliDate(now);
  const hijriDate = getHijriDate(now);
  const ayyamBiz = getAyyamBizStatus(now);

  // Helper to convert "HH:mm" on date to timestamp
  const parseTimeToMs = (date: Date, timeStr: string, dayOffset = 0): number => {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date(date);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(h, m, 0, 0);
    return d.getTime();
  };

  // Ramadan Fasting Calculations
  const nowMs = now.getTime();
  const fajrTodayMs = parseTimeToMs(now, prayerTimes.sahriEnd);
  const maghribTodayMs = parseTimeToMs(now, prayerTimes.iftar);
  const fajrTomorrowMs = parseTimeToMs(now, prayerTimes.sahriEnd, 1);
  const maghribYesterdayMs = parseTimeToMs(now, prayerTimes.iftar, -1);

  let isFasting = false;
  let fastingProgressPercent = 0;
  let remainingSec = 0;
  let targetEventLabelBn = '';
  let targetEventLabelEn = '';
  let targetEventTime24 = '';

  if (nowMs >= fajrTodayMs && nowMs < maghribTodayMs) {
    // Daytime Fasting (Fajr/Sahri End until Maghrib/Iftar)
    isFasting = true;
    const totalFastingMs = maghribTodayMs - fajrTodayMs;
    const elapsedFastingMs = nowMs - fajrTodayMs;
    fastingProgressPercent = Math.min(100, Math.max(0, (elapsedFastingMs / totalFastingMs) * 100));
    remainingSec = Math.max(0, Math.floor((maghribTodayMs - nowMs) / 1000));
    targetEventLabelBn = 'ইফতার হতে বাকি';
    targetEventLabelEn = 'Time until Iftar';
    targetEventTime24 = prayerTimes.iftar;
  } else if (nowMs >= maghribTodayMs) {
    // Night after Iftar (Preparing for next day Sahri)
    isFasting = false;
    const totalNightMs = fajrTomorrowMs - maghribTodayMs;
    const elapsedNightMs = nowMs - maghribTodayMs;
    fastingProgressPercent = Math.min(100, Math.max(0, (elapsedNightMs / totalNightMs) * 100));
    remainingSec = Math.max(0, Math.floor((fajrTomorrowMs - nowMs) / 1000));
    targetEventLabelBn = 'সাহরি শেষ হতে বাকি';
    targetEventLabelEn = 'Time until Suhoor ends';
    targetEventTime24 = prayerTimes.sahriEnd;
  } else {
    // Early Morning before Fajr
    isFasting = false;
    const totalNightMs = fajrTodayMs - maghribYesterdayMs;
    const elapsedNightMs = nowMs - maghribYesterdayMs;
    fastingProgressPercent = Math.min(100, Math.max(0, (elapsedNightMs / totalNightMs) * 100));
    remainingSec = Math.max(0, Math.floor((fajrTodayMs - nowMs) / 1000));
    targetEventLabelBn = 'সাহরি শেষ হতে বাকি';
    targetEventLabelEn = 'Time until Suhoor ends';
    targetEventTime24 = prayerTimes.sahriEnd;
  }

  // Format countdown string
  const countdownHours = Math.floor(remainingSec / 3600);
  const countdownMinutes = Math.floor((remainingSec % 3600) / 60);
  const countdownSeconds = remainingSec % 60;
  const formattedCountdown = `${countdownHours.toString().padStart(2, '0')}:${countdownMinutes
    .toString()
    .padStart(2, '0')}:${countdownSeconds.toString().padStart(2, '0')}`;

  // Bengali digits converter
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBn = (num: number | string) =>
    num
      .toString()
      .split('')
      .map((c) => bnDigits[parseInt(c, 10)] || c)
      .join('');

  // Circular gauge geometry
  const radius = 72;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (fastingProgressPercent / 100) * circumference;

  // Today's Hadith
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const todayHadith = HADITHS_LIST[dayOfYear % HADITHS_LIST.length];

  // Daily Ayah (Verse of the Day) State
  const [dailyAyahIndex, setDailyAyahIndex] = useState<number>(() => {
    return Math.abs(dayOfYear) % DAILY_AYAHS_LIST.length;
  });
  const [copiedAyah, setCopiedAyah] = useState(false);
  // Audio state: 'idle' | 'tilawat' (Arabic recitation) | 'ortho' (translation speech)
  const [audioState, setAudioState] = useState<'idle' | 'tilawat' | 'ortho'>('idle');
  const ayahAudioRef = useRef<HTMLAudioElement | null>(null);
  const playlistIndexRef = useRef<number>(0);
  const currentPlaylistRef = useRef<AyahAudioTrack[]>([]);

  const todayAyah = DAILY_AYAHS_LIST[dailyAyahIndex] || DAILY_AYAHS_LIST[0];

  // Stop all audio & speech playback
  const stopAllAyahAudio = () => {
    if (ayahAudioRef.current) {
      try {
        ayahAudioRef.current.pause();
        ayahAudioRef.current.currentTime = 0;
      } catch {
        // ignore
      }
    }
    stopSpeechAudio();
    setAudioState('idle');
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAllAyahAudio();
    };
  }, []);

  // Period countdown status for female users
  const [periodStatus, setPeriodStatus] = useState<PeriodNotificationStatus | null>(null);
  const [periodBannerDismissed, setPeriodBannerDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (gender === 'female') {
      const status = getPeriodApproachingStatus(language);
      setPeriodStatus(status);
      checkAndTriggerPeriodNotification();
    } else {
      setPeriodStatus(null);
    }
  }, [gender, language]);

  const handleRandomizeAyah = () => {
    triggerHaptic(20);
    stopAllAyahAudio();
    let nextIndex: number;
    do {
      nextIndex = Math.floor(Math.random() * DAILY_AYAHS_LIST.length);
    } while (nextIndex === dailyAyahIndex && DAILY_AYAHS_LIST.length > 1);
    setDailyAyahIndex(nextIndex);
  };

  // Play Tilawat of that specific ayah, and immediately upon conclusion speak the ortho (translation)
  const handlePlayAyahAudio = () => {
    triggerHaptic(15);
    if (audioState !== 'idle') {
      stopAllAyahAudio();
      return;
    }

    // Prime speech synthesis during active user touch event (permits fallback speaking later)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const primer = new SpeechSynthesisUtterance('');
        primer.volume = 0;
        window.speechSynthesis.speak(primer);
      } catch {
        // ignore
      }
    }

    const playlist = getDailyAyahPlaylist(todayAyah, language === 'en' ? 'en' : 'bn');
    currentPlaylistRef.current = playlist;
    playlistIndexRef.current = 0;

    if (playlist.length === 0) return;

    // Use or create a single audio instance so mobile browsers allow sequential playback
    if (!ayahAudioRef.current) {
      ayahAudioRef.current = new Audio();
      try {
        (ayahAudioRef.current as HTMLAudioElement & { referrerPolicy?: string }).referrerPolicy = 'no-referrer';
      } catch {
        // ignore
      }
    }
    const audio = ayahAudioRef.current;

    // Play the single specific ayah recitation, then immediately speak Bengali translation in a male voice
    const playTrackAtIndex = (index: number) => {
      if (index >= playlist.length) {
        setAudioState('idle');
        return;
      }

      playlistIndexRef.current = index;
      const track = playlist[index];
      setAudioState('tilawat');

      audio.src = track.url;
      audio.onended = () => {
        // Tilawat concludes: immediately speak translation (ortho) in male voice
        setAudioState('ortho');
        speakAyahTranslation(
          todayAyah.translationBn,
          language === 'en' ? 'en' : 'bn',
          () => setAudioState('idle'),
          () => setAudioState('idle')
        );
      };

      audio.onerror = () => {
        // Fallback: speak Arabic recitation then speak translation in male voice
        speakArabic(todayAyah.textArabic);
        setTimeout(() => {
          setAudioState('ortho');
          speakAyahTranslation(
            todayAyah.translationBn,
            language === 'en' ? 'en' : 'bn',
            () => setAudioState('idle'),
            () => setAudioState('idle')
          );
        }, 3500);
      };

      audio.play().catch((err) => {
        console.warn('Playback error:', err);
        setAudioState('ortho');
        speakAyahTranslation(
          todayAyah.translationBn,
          language === 'en' ? 'en' : 'bn',
          () => setAudioState('idle'),
          () => setAudioState('idle')
        );
      });
    };

    playTrackAtIndex(0);
  };

  const handleCopyAyah = () => {
    const surahLabel = language === 'bn'
      ? `আজকের আয়াত (সূরা ${todayAyah.surahNameBn} - আয়াত ${toBn(todayAyah.ayahNumber)})`
      : `Daily Ayah (Surah ${todayAyah.surahNameEn || todayAyah.surahNumber} - Ayah ${todayAyah.ayahNumber})`;
    const meaningLabel = language === 'bn' ? `অর্থ: "${todayAyah.translationBn}"` : `Translation: "${todayAyah.translationEn || todayAyah.translationBn}"`;
    const appBrand = language === 'bn' ? '(নূর কুরআন - ইসলামিক কম্প্যানিয়ন)' : '(Noor Quran - Islamic Companion)';
    const shareText = `${surahLabel}:\n\n${todayAyah.textArabic}\n\n${meaningLabel}\n\n${appBrand}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedAyah(true);
      triggerHaptic(20);
      setTimeout(() => setCopiedAyah(false), 2000);
    }
  };

  // Day of week & Friday / Thursday Maghrib detection
  const dayOfWeek = now.getDay(); // 0 = Sun, 4 = Thu, 5 = Fri
  const isFriday = dayOfWeek === 5;
  const isThursday = dayOfWeek === 4;

  let isThursdayPostMaghrib = false;
  if (isThursday && prayerTimes.maghrib) {
    const [mHour, mMin] = prayerTimes.maghrib.split(':').map(Number);
    const maghribDate = new Date(now);
    maghribDate.setHours(mHour, mMin, 0, 0);
    isThursdayPostMaghrib = now >= maghribDate;
  }

  // Jumuah special amals widget shows ONLY on Thursday after Maghrib and on Friday
  const showJumuahWidget = isThursdayPostMaghrib || isFriday;

  // On Friday: Dhuhr is replaced with Jumu'ah (জুমু'আ)
  const getWaqtName = (name: string) => {
    if (name === 'fajr') return t.fajr;
    if (name === 'sunrise') return t.sunrise;
    if (name === 'dhuhr') {
      if (isFriday) {
        return language === 'bn' ? 'জুমু\'আ' : language === 'ar' ? 'الجمعة' : 'Jumu\'ah';
      }
      return t.dhuhr;
    }
    if (name === 'asr') return t.asr;
    if (name === 'maghrib') return t.maghrib;
    if (name === 'isha') return t.isha;
    if (name === 'prohibited_sunrise') return language === 'bn' ? 'সূর্যোদয় (নিষিদ্ধ)' : 'Sunrise (Makruh)';
    if (name === 'prohibited_zawal') return language === 'bn' ? 'দ্বিপ্রহর (নিষিদ্ধ)' : 'Noon (Makruh)';
    if (name === 'prohibited_sunset') return language === 'bn' ? 'সূর্যাস্ত (নিষিদ্ধ)' : 'Sunset (Makruh)';
    return name;
  };

  // Jumuah special serial guide expanded state
  const [isJumuahCardExpanded, setIsJumuahCardExpanded] = useState(true);

  const jumuahAmalsList = isThursdayPostMaghrib
    ? [
        {
          id: 'kahf_thu',
          title: 'সূরা আল-কাহফ তিলাওয়াত',
          titleEn: 'Recitation of Surah Al-Kahf',
          subtitle: 'বৃহস্পতিবার মাগরিবের পর থেকেই সূরা কাহফ পড়া সুন্নাত',
          subtitleEn: 'Sunnah to recite Surah Kahf starting from Thursday after Maghrib',
          reward: 'রাসূলুল্লাহ (ﷺ) বলেছেন: যে ব্যক্তি জুমুআর রাতে সূরা কাহফ পাঠ করবে, তার ও কা\'বা শরীফের মধ্যবর্তী স্থান নূর দ্বারা আলোকিত হয়ে যাবে (সুনান দারিমী: ৩৪৫০)। এটি দাজ্জালের ফিতনা থেকে নিরাপত্তা দেয়।',
          rewardEn: 'The Prophet (ﷺ) said: Whoever recites Surah Al-Kahf on the night of Jumuah will have a light shining between him and the Ancient House (Sunan Darimi: 3450). It shields against Dajjal.',
          hasQuranAction: true,
        },
        {
          id: 'durood_thu',
          title: 'অধিক পরিমাণে দরূদ শরীফ পাঠ',
          titleEn: 'Abundant Salawat upon the Prophet',
          subtitle: 'নবীজি (ﷺ)-এর ওপর বেশি বেশি দরূদে ইবরাহিম বা সংক্ষিপ্ত দরূদ পাঠ',
          subtitleEn: 'Reciting Durood Ibrahim or concise salawat frequently',
          reward: 'রাসূলুল্লাহ (ﷺ) বলেন: তোমরা জুমুআর দিনে ও জুমুআর রাতে আমার ওপর অধিক দরূদ পড়ো। যে ব্যক্তি ১ বার দরূদ পড়বে, আল্লাহ তার ওপর ১০টি রহমত বর্ষণ করবেন, ১০টি গুনাহ মাফ করবেন এবং ১০টি মর্যাদা বৃদ্ধি করবেন (সুনান নাসায়ী, বায়হাকী)।',
          rewardEn: 'The Prophet (ﷺ) said: Increase your supplications for blessings on me on Friday and the night of Friday; whoever sends blessings on me once, Allah will send blessings on him ten times (Sunan an-Nasa\'i).',
        },
        {
          id: 'dua_thu',
          title: 'জুমু\'আর রাতের খাস দোয়া ও ইস্তিগফার',
          titleEn: 'Special Dua & Istighfar on Jumuah Night',
          subtitle: 'মাগরিব-এশা ও তাহাজ্জুদের সময়ে মন খুলে দোয়া ও ক্ষমা প্রার্থনা',
          subtitleEn: 'Heartfelt supplication and repentance during Maghrib-Isha and Tahajjud',
          reward: 'জুমু\'আর রাত দোয়া কবুলের অন্যতম শ্রেষ্ঠ সুবর্ণ সুযোগ। আল্লাহর নৈকট্য লাভ ও গোনাহ মাফের মহিমান্বিত সময়।',
          rewardEn: 'The night of Friday is a blessed time for acceptance of supplications, gaining nearness to Allah and receiving forgiveness of sins.',
        },
        {
          id: 'prep_thu',
          title: 'শুক্রবার জুমু\'আর সার্বিক প্রস্তুতি ও নিয়ত',
          titleEn: 'Preparation & Sincere Intention for Friday',
          subtitle: 'নখ কাটা, পরিষ্কার জামাকাপড় রাখা ও সকালে মসজিদে আগেভাগে যাওয়ার নিয়ত',
          subtitleEn: 'Clipping nails, preparing clean clothes, and intending early arrival at the mosque',
          reward: 'পরদিনের বরকতময় জুমু\'আর প্রতিটি নেক আমলের জন্য পূর্ণ আত্মিক প্রস্তুতি ও সওয়াবের নিয়ত।',
          rewardEn: 'Spiritual readiness and multiplying intentions for every virtuous deed on the blessed day of Jumuah.',
        },
      ]
    : [
        {
          id: 'ghusl_fri',
          title: 'গোসল, মিসওয়াক, সুগন্ধি ও উত্তম পোশাক',
          titleEn: 'Ghusl, Miswak, Fragrance & Clean Clothes',
          subtitle: 'জুমু\'আর উদ্দেশ্যে গোসল করা, মিসওয়াক ও পরিচ্ছন্ন পোশাক পরিধান',
          subtitleEn: 'Taking a ritual bath, using miswak, and wearing clean, pleasant clothes',
          reward: 'রাসূলুল্লাহ (ﷺ) বলেছেন: যে ব্যক্তি জুমুআর দিন গোসল করে, মিসওয়াক করে ও সুগন্ধি মেখে মসজিদে যায়, তার পূর্ববর্তী জুমুআ থেকে এ জুমুআ পর্যন্ত সব সগীরা গুনাহ ক্ষমা করে দেওয়া হয় (সহীহ বুখারী: ৮৮৩)।',
          rewardEn: 'The Prophet (ﷺ) said: Whoever takes a bath on Friday, uses tooth-stick (miswak), applies scent and goes to the mosque, his minor sins between that Friday and the next are forgiven (Sahih Bukhari: 883).',
        },
        {
          id: 'early_mosque_fri',
          title: 'মসজিদে প্রথমভাগে উপস্থিত হওয়া',
          titleEn: 'Arriving Early at the Mosque',
          subtitle: 'আজানের অপেক্ষা না করে প্রথম প্রহরেই মসজিদে আগে আগে রওয়ানা হওয়া',
          subtitleEn: 'Setting off early in the first hour before the Adhan',
          reward: 'যে প্রথম প্রহরে যায় সে যেন একটি উট কোরবানি করল, দ্বিতীয় প্রহরে গরু, তৃতীয় প্রহরে ছাগল কোরবানির সওয়াব লাভ করে। খুতবা শুরু হলে ফেরেশতারা খাতা গুটিয়ে খুতবা শুনতে বসেন (সহীহ বুখারী: ৮৮১)।',
          rewardEn: 'He who goes in the first hour is like one who sacrificed a camel; in the second hour like a cow; in the third like a sheep. When the Khutbah begins, angels close their records to listen (Sahih Bukhari: 881).',
        },
        {
          id: 'khutbah_silence_fri',
          title: 'খুতবা চলাকালে পূর্ণ নীরবতা পালন',
          titleEn: 'Absolute Silence during the Khutbah',
          subtitle: 'খুতবার সময় কথা বলা এমনকি অন্যকে \'চুপ কর\' বলা থেকেও বিরত থাকা',
          subtitleEn: 'Refraining from speech or even telling someone to be quiet during the sermon',
          reward: 'খুতবার সময় কথা বলা সম্পূর্ণ নিষিদ্ধ। সম্পূর্ণ মনোযোগ দিয়ে খুতবা শোনা জুমু\'আর পরিপূর্ণ সওয়াব অর্জনের শর্ত (সহীহ বুখারী: ৯৩৪)।',
          rewardEn: 'Speaking during the sermon nullifies the special reward of Jumuah. Attentive listening is essential (Sahih Bukhari: 934).',
        },
        {
          id: 'kahf_fri',
          title: 'সূরা আল-কাহফ তিলাওয়াত করা',
          titleEn: 'Reciting Surah Al-Kahf',
          subtitle: 'জুমু\'আর দিনে ১ থেকে ১১০ আয়াত পর্যন্ত তিলাওয়াত',
          subtitleEn: 'Reciting Verses 1 to 110 on the day of Jumuah',
          reward: 'যে ব্যক্তি জুমুআর দিনে সূরা কাহফ পাঠ করবে, পরবর্তী জুমুআ পর্যন্ত তার জন্য একটি বিশেষ নূর চমকাতে থাকবে (মুস্তাদরাক হাকিম, বায়হাকী: ৫৯৯৬)।',
          rewardEn: 'Whoever reads Surah Al-Kahf on Friday will have a light shining for him from one Friday to the next (Mustadrak Hakim, Bayhaqi: 5996).',
          hasQuranAction: true,
        },
        {
          id: 'asr_dua_fri',
          title: 'আসরের পর থেকে মাগরিব পর্যন্ত খাস দোয়া',
          titleEn: 'Special Dua Between Asr and Maghrib',
          subtitle: 'দোয়া কবুলের বিশেষ মুহূর্তে একাগ্রচিত্তে মোনাজাত ও জিকির',
          subtitleEn: 'Heartfelt Dua during the special hour of guaranteed acceptance',
          reward: 'জুমুআর দিনে এমন একটি মুহূর্ত রয়েছে, যাতে বান্দা যা প্রার্থনা করে আল্লাহ তা কবুল করেন। অধিকাংশ সাহাবীর মতে এটি আসরের পর থেকে সূর্যাস্ত পর্যন্ত সময় (সহীহ বুখারী: ৯৩৫, মুসলিম: ৮৫২)।',
          rewardEn: 'On Friday there is an hour wherein if a Muslim servant asks Allah for something, Allah grants it. Most Sahabah noted this as the hour between Asr and sunset (Sahih Bukhari: 935, Muslim: 852).',
        },
        {
          id: 'durood_fri',
          title: '৮০ বার বা অধিক দরূদ শরীফ পাঠ',
          titleEn: 'Sending Abundant Salawat (Durood)',
          subtitle: 'আসরের নামাজের পর জায়নামাজে বসে দরূদ পাঠ করা',
          subtitleEn: 'Reciting Salawat upon the Prophet ﷺ after Asr prayer',
          reward: 'নবীজি (ﷺ)-এর ওপর অধিক দরূদ পাঠের মাধ্যমে গুনাহ মার্জনা এবং কিয়ামতের দিন তাঁর বিশেষ শাফায়াত নসিব হবে (সুনান আবু দাউদ)।',
          rewardEn: 'Sending abundant blessings upon the Prophet (ﷺ) brings remission of sins and earns his intercession on the Day of Judgment (Sunan Abu Dawood).',
        },
      ];

  const handleCopyHadith = () => {
    const hadithText = language === 'bn' ? todayHadith.translationBn : (todayHadith.translationEn || todayHadith.translationBn);
    const hadithSource = language === 'bn' ? todayHadith.sourceBn : (todayHadith.source || todayHadith.sourceBn);
    const hadithTitle = language === 'bn' ? 'আজকের হাদিস' : 'Daily Hadith';
    const appBrand = language === 'bn' ? '(নূর কুরআন - ইসলামিক কম্প্যানিয়ন)' : '(Noor Quran - Islamic Companion)';
    const shareText = `${hadithTitle}:\n"${hadithText}"\n— ${hadithSource}\n\n${appBrand}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedHadith(true);
      triggerHaptic(20);
      setTimeout(() => setCopiedHadith(false), 2000);
    }
  };

  const gregorianDateStr = now.toLocaleDateString(
    language === 'bn' ? 'bn-BD' : language === 'ar' ? 'ar-EG' : 'en-US',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

  return (
    <div className="pb-32 pt-1 sm:pt-2 px-3 sm:px-4 w-full max-w-lg mx-auto space-y-3.5 sm:space-y-4 overflow-x-hidden">
      {/* 1. Date & Location Card (Compact Gregorian, Bangla & Hijri) */}
      <div className="bg-white dark:bg-[#142042] rounded-2xl p-3 border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-slate-400">
          <span className="font-semibold text-[#1F2937] dark:text-slate-200">{gregorianDateStr}</span>
          <button
            onClick={onOpenLocationModal}
            className="text-[#21409A] dark:text-[#E9B7C3] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{language === 'bn' ? location.nameBn : location.name}</span>
          </button>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#6B7280] dark:text-slate-400 flex-wrap">
          {language === 'bn' ? (
            <>
              <span>{bengaliDate.fullBn}</span>
              <span aria-hidden="true" className="text-[#E7D9DE] dark:text-slate-700">·</span>
              <span className="font-uthmani font-semibold text-[#10235A] dark:text-[#F8E8ED]">{hijriDate.fullBn}</span>
            </>
          ) : (
            <span className="font-semibold text-[#10235A] dark:text-[#F8E8ED]">{hijriDate.fullEn}</span>
          )}
        </div>
      </div>

      {/* 2. Prayer / Ramadan Mode Segmented Selector */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-[#F8E8ED]/70 dark:bg-[#10235A]/50 rounded-2xl text-xs font-semibold border border-[#E7D9DE]/60 dark:border-[#1C2D5A]">
        <button
          onClick={() => {
            triggerHaptic(15);
            setActiveHomeView('standard');
          }}
          className={`py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeHomeView === 'standard'
              ? 'bg-[#21409A] text-white shadow-xs font-bold'
              : 'text-[#10235A] dark:text-slate-300 hover:text-[#21409A]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'নামাজের ওয়াক্ত' : 'Prayer Times'}</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic(15);
            setActiveHomeView('ramadan');
            if (onToggleRamadanMode && !ramadanMode) {
              onToggleRamadanMode();
            }
          }}
          className={`py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeHomeView === 'ramadan'
              ? 'bg-[#21409A] text-white shadow-xs font-bold'
              : 'text-[#10235A] dark:text-slate-300 hover:text-[#21409A]'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-[#E9B7C3]" />
          <span>{language === 'bn' ? 'রমাদান ও রোজা মোড' : 'Ramadan & Fasting Mode'}</span>
        </button>
      </div>

      {/* 3. PRAYER HERO CARD (Standard vs Ramadan Fasting) */}
      <AnimatePresence mode="wait">
        {activeHomeView === 'ramadan' ? (
          <motion.div
            key="ramadan"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="space-y-3"
          >
            {/* Ramadan Hero Card with Deep Sapphire & Rose Quartz */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#083B40] via-[#0b484e] to-[#062c30] text-white shadow-md border border-[#13545A] p-5">
              <img
                src={heroMosqueArt}
                alt=""
                role="presentation"
                loading="eager"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
                className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay pointer-events-none"
              />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#B9E2DD] font-bold flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#B9E2DD] animate-pulse" />
                    {language === 'bn'
                      ? (isFasting ? 'রোজা চলমান (দিবাভাগ)' : 'সাহরির প্রস্তুতি ও অপেক্ষা')
                      : (isFasting ? 'Fasting in Progress (Daytime)' : 'Preparing for Sahoor')}
                  </span>
                  <span className="text-xs text-[#B9E2DD]/90 font-medium">
                    {language === 'bn' ? targetEventLabelBn : targetEventLabelEn}: <strong className="text-white font-mono">{formatPrayerTime12h(targetEventTime24, language)}</strong>
                  </span>
                </div>

                {/* Circular Progress Gauge */}
                <div className="flex flex-col items-center justify-center py-1">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 170 170">
                      <circle
                        cx="85"
                        cy="85"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-white/15"
                        fill="transparent"
                      />
                      <circle
                        cx="85"
                        cy="85"
                        r={radius}
                        stroke="#B9E2DD"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                        fill="transparent"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
                      <span className="text-[11px] text-[#F3FAF9]/90 font-medium">
                        {language === 'bn'
                          ? (isFasting ? 'ইফতার বাকি' : 'সাহরি শেষ বাকি')
                          : (isFasting ? 'Time until Iftar' : 'Time until Sahoor ends')}
                      </span>
                      <span className="text-2xl font-bold font-mono tabular-nums tracking-tight text-white drop-shadow-xs mt-0.5">
                        {formattedCountdown}
                      </span>
                      <span className="mt-1 px-2.5 py-0.5 rounded-full bg-[#0C454B]/80 text-[10px] font-bold font-mono text-[#B9E2DD] backdrop-blur-xs border border-[#13545A]">
                        {language === 'bn'
                          ? `${toBn(Math.round(fastingProgressPercent))}% সম্পন্ন`
                          : `${Math.round(fastingProgressPercent)}% completed`}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#B9E2DD]/85 mt-1.5 text-center">
                    {language === 'bn'
                      ? (isFasting
                          ? `সূর্যোদয় থেকে সূর্যাস্ত পর্যন্ত রোজার অগ্রগতি (${toBn(Math.round(fastingProgressPercent))}%)`
                          : 'পরবর্তী রোজার জন্য সাহরি গ্রহণ ও প্রস্তুতি নিন')
                      : (isFasting
                          ? `Fasting progress from sunrise to sunset (${Math.round(fastingProgressPercent)}%)`
                          : 'Prepare Sahoor and make intention for tomorrow’s fast')}
                  </p>
                </div>

                {/* Sahri, Sunrise, Sunset & Iftar 4 Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2.5 rounded-2xl bg-[#0C454B]/80 backdrop-blur-xs border border-[#13545A] space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#B9E2DD]">
                      <Sunrise className="w-3.5 h-3.5 text-[#B9E2DD]" />
                      <span className="font-semibold text-white truncate">
                        {language === 'bn' ? 'সাহরি শেষ' : 'Sahoor Ends'}
                      </span>
                    </div>
                    <span className="text-base font-bold font-mono text-white block">
                      {formatPrayerTime12h(prayerTimes.sahriEnd, language)}
                    </span>
                    <span className="text-[9px] text-[#B9E2DD] block truncate">
                      {language === 'bn' ? 'সতর্কতা: ' : 'Warning: '}
                      {formatPrayerTime12h(prayerTimes.sahriWarning, language)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-[#0C454B]/80 backdrop-blur-xs border border-[#13545A] space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#B9E2DD]">
                      <Sunrise className="w-3.5 h-3.5 text-amber-300" />
                      <span className="font-semibold text-white truncate">{t.sunrise}</span>
                    </div>
                    <span className="text-base font-bold font-mono text-white block">
                      {formatPrayerTime12h(prayerTimes.sunrise, language)}
                    </span>
                    <span className="text-[9px] text-[#B9E2DD]/80 block truncate">
                      {language === 'bn' ? 'সূর্যোদয় মুহূর্ত' : 'Sunrise'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-[#0C454B]/80 backdrop-blur-xs border border-[#13545A] space-y-1 ring-1 ring-orange-400/30">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#B9E2DD]">
                      <Sunset className="w-3.5 h-3.5 text-orange-400" />
                      <span className="font-semibold text-white truncate">{t.sunset || (language === 'bn' ? 'সূর্যাস্ত' : 'Sunset')}</span>
                    </div>
                    <span className="text-base font-bold font-mono text-orange-200 block">
                      {formatPrayerTime12h(prayerTimes.sunset, language)}
                    </span>
                    <span className="text-[9px] text-[#B9E2DD]/80 block truncate">
                      {language === 'bn' ? 'দিবসের সমাপ্তি' : 'Day End'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-[#0C454B]/80 backdrop-blur-xs border border-[#13545A] space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#B9E2DD]">
                      <Sunset className="w-3.5 h-3.5 text-[#B9E2DD]" />
                      <span className="font-semibold text-white truncate">{t.iftar}</span>
                    </div>
                    <span className="text-base font-bold font-mono text-[#B9E2DD] block">
                      {formatPrayerTime12h(prayerTimes.iftar, language)}
                    </span>
                    <span className="text-[9px] text-[#B9E2DD]/80 block truncate">
                      {language === 'bn' ? 'সূর্যাস্তে ইফতার' : 'Iftar at Sunset'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ramadan Duas Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#E7D9DE]/60 dark:border-[#1C2D5A] pb-2">
                <div className="flex items-center gap-1.5 bg-[#F8E8ED] dark:bg-[#10235A] p-0.5 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setShowDuaType('iftar')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      showDuaType === 'iftar'
                        ? 'bg-[#21409A] text-white shadow-xs'
                        : 'text-[#10235A] dark:text-slate-300'
                    }`}
                  >
                    {language === 'bn' ? 'ইফতারের দোয়া' : 'Iftar Dua'}
                  </button>
                  <button
                    onClick={() => setShowDuaType('niyyah')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      showDuaType === 'niyyah'
                        ? 'bg-[#21409A] text-white shadow-xs'
                        : 'text-[#10235A] dark:text-slate-300'
                    }`}
                  >
                    {language === 'bn' ? 'রোজার নিয়ত' : 'Fasting Intention'}
                  </button>
                </div>

                <button
                  onClick={() =>
                    speakArabic(
                      showDuaType === 'iftar'
                        ? 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ'
                        : 'نَوَيْتُ أَنْ أَصُومَ غَدًا مِنْ شَهْرِ رَمَضَانَ الْمُبَارَكِ'
                    )
                  }
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[#21409A] dark:text-[#E9B7C3] hover:bg-[#F8E8ED] dark:hover:bg-[#10235A] transition-colors cursor-pointer"
                  title={language === 'bn' ? 'উচ্চারণ শুনুন' : 'Listen audio'}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {showDuaType === 'iftar' ? (
                <div className="space-y-2 text-xs">
                  <p className="font-uthmani text-lg leading-loose text-right text-[#10235A] dark:text-white font-bold block" dir="rtl">
                    ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ
                  </p>
                  <p className="text-[#1F2937] dark:text-[#F8E8ED] font-medium text-left block" dir="ltr">
                    {language === 'bn'
                      ? 'উচ্চারণ: যাহাবায জামাউ ওয়াবতাল্লাতিল উরূক্বু ওয়া সাবাতাল আজরু ইনশাআল্লাহ।'
                      : "Pronunciation: Dhahabadh-dhama'u wabtallatil 'urooqu wa thabatal ajru insha'Allah."}
                  </p>
                  <p className="text-[#1F2937] dark:text-slate-200 font-medium text-left block" dir="ltr">
                    {language === 'bn'
                      ? 'অর্থ: "পিপাসা দূর হলো, শিরা-উপশিরা সিক্ত হলো এবং ইনশাআল্লাহ প্রতিদান ও সওয়াব নির্ধারিত হলো।"'
                      : 'Meaning: "The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills."'}
                  </p>
                  <span className="text-[10px] text-[#6B7280] dark:text-slate-400 block pt-1 text-left" dir="ltr">
                    {language === 'bn' ? 'সূত্র: সুনান আবু দাউদ: ২৩৫৭ (সহিহ)' : 'Source: Sunan Abi Dawud: 2357 (Sahih)'}
                  </span>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <p className="font-uthmani text-lg leading-loose text-right text-[#10235A] dark:text-white font-bold block" dir="rtl">
                    نَوَيْتُ أَنْ أَصُومَ غَدًا مِنْ شَهْرِ رَمَضَانَ الْمُبَارَكِ فَرْضًا لَكَ يَا اللَّهُ
                  </p>
                  <p className="text-[#1F2937] dark:text-[#F8E8ED] font-medium text-left block" dir="ltr">
                    {language === 'bn'
                      ? 'উচ্চারণ: নাওয়াইতু আন আসূমা গাদাম মিন শাহরি রামাদানাল মুবারাকি ফারদাল্লাকা ইয়া আল্লাহ।'
                      : 'Pronunciation: Nawaytu an asooma ghadan min shahri Ramadanal mubaraki fardallaka ya Allah.'}
                  </p>
                  <p className="text-[#1F2937] dark:text-slate-200 font-medium text-left block" dir="ltr">
                    {language === 'bn'
                      ? 'অর্থ: "হে আল্লাহ! আমি আগামীকাল পবিত্র রমাদান মাসের আপনার নির্দেশিত ফরজ রোজা রাখার আন্তরিক নিয়ত করছি।"'
                      : 'Meaning: "O Allah, I intend to observe the obligatory fast of tomorrow in the blessed month of Ramadan for Your sake."'}
                  </p>
                  <span className="text-[10px] text-[#6B7280] dark:text-slate-400 block pt-1 text-left" dir="ltr">
                    {language === 'bn'
                      ? 'জ্ঞাতব্য: মুখে উচ্চারণ জরুরি নয়, অন্তরের দৃঢ় সংকল্পই নিয়তের জন্য যথেষ্ট।'
                      : 'Note: Verbal utterance is not mandatory; sincere intention in the heart is sufficient.'}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="standard"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="space-y-3"
          >
            {/* PRAYER HERO CARD - Multi-Style Card with Tap to Cycle 6 Styles & Sunset */}
            <PrayerHeroCard
              waqtStatus={waqtStatus}
              prayerTimes={prayerTimes}
              language={language}
              isFriday={isFriday}
              t={t}
              getWaqtName={getWaqtName}
              formatPrayerTime12h={formatPrayerTime12h}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3.5. AYYAM-E-BIZ (13, 14, 15 HIJRI) MONTHLY SUNNAH FASTING NOTICE */}
      {ayyamBiz.isActive && !ayyamBizDismissed && (
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0F5F62] via-[#0D4E50] to-[#072F31] text-white p-4 sm:p-4.5 shadow-md border border-[#1FB5A2]/30 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#B9E2DD]/20 border border-[#B9E2DD]/30 flex items-center justify-center shrink-0 text-[#B9E2DD] shadow-2xs">
                <Moon className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-white font-bengali">
                    {language === 'bn' ? 'আইয়ামে বীজের সুন্নাত রোজা' : 'Ayyam-e-Biz Sunnah Fasting'}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                    ayyamBiz.isFastingToday
                      ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/40 animate-pulse'
                      : 'bg-amber-500/25 text-amber-200 border-amber-400/40'
                  }`}>
                    {ayyamBiz.isFastingToday
                      ? (language === 'bn' ? `আজ ${toBn(ayyamBiz.currentFastDay || 1)}ম রোজা (${toBn(ayyamBiz.hijriDay)} ${ayyamBiz.hijriMonthBn})` : `Today Fast ${ayyamBiz.currentFastDay || 1} (${ayyamBiz.hijriDay} ${ayyamBiz.hijriMonthEn})`)
                      : (language === 'bn' ? `আর ${toBn(ayyamBiz.daysUntilStart)} দিন বাকি • প্রস্তুতি নিন` : `${ayyamBiz.daysUntilStart} days left`)}
                  </span>
                </div>
                <p className="text-xs text-[#B9E2DD]/90 mt-0.5">
                  {language === 'bn'
                    ? `প্রতি চন্দ্রমাসের ১৩, ১৪ ও ১৫ তারিখ (${ayyamBiz.hijriMonthBn} ${toBn(ayyamBiz.hijriYear)} হিজরি)`
                    : `13th, 14th & 15th of ${ayyamBiz.hijriMonthEn} ${ayyamBiz.hijriYear} AH`}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic(10);
                setAyyamBizDismissed(true);
              }}
              className="text-[#B9E2DD]/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title={language === 'bn' ? 'লুকান' : 'Dismiss'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Days Schedule Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
            <div className={`p-2.5 rounded-2xl border backdrop-blur-xs transition-all ${
              ayyamBiz.hijriDay === 13
                ? 'bg-[#B9E2DD]/25 border-[#B9E2DD] text-white ring-2 ring-[#B9E2DD]/50'
                : 'bg-black/25 border-white/10 text-white/90'
            }`}>
              <div className="flex items-center justify-between text-[11px] text-[#B9E2DD] font-semibold mb-1">
                <span>{language === 'bn' ? '১ম রোজা (১৩ হিজরি)' : 'Day 1 (13 Hijri)'}</span>
                {ayyamBiz.hijriDay === 13 && <span className="text-[10px] bg-emerald-400 text-black px-1.5 py-0.2 rounded-full font-bold">{language === 'bn' ? 'আজ' : 'Today'}</span>}
              </div>
              <p className="font-bold text-white text-xs sm:text-sm">{ayyamBiz.dates.day13Bn}</p>
            </div>

            <div className={`p-2.5 rounded-2xl border backdrop-blur-xs transition-all ${
              ayyamBiz.hijriDay === 14
                ? 'bg-[#B9E2DD]/25 border-[#B9E2DD] text-white ring-2 ring-[#B9E2DD]/50'
                : 'bg-black/25 border-white/10 text-white/90'
            }`}>
              <div className="flex items-center justify-between text-[11px] text-[#B9E2DD] font-semibold mb-1">
                <span>{language === 'bn' ? '২য় রোজা (১৪ হিজরি)' : 'Day 2 (14 Hijri)'}</span>
                {ayyamBiz.hijriDay === 14 && <span className="text-[10px] bg-emerald-400 text-black px-1.5 py-0.2 rounded-full font-bold">{language === 'bn' ? 'আজ' : 'Today'}</span>}
              </div>
              <p className="font-bold text-white text-xs sm:text-sm">{ayyamBiz.dates.day14Bn}</p>
            </div>

            <div className={`p-2.5 rounded-2xl border backdrop-blur-xs transition-all ${
              ayyamBiz.hijriDay === 15
                ? 'bg-[#B9E2DD]/25 border-[#B9E2DD] text-white ring-2 ring-[#B9E2DD]/50'
                : 'bg-black/25 border-white/10 text-white/90'
            }`}>
              <div className="flex items-center justify-between text-[11px] text-[#B9E2DD] font-semibold mb-1">
                <span>{language === 'bn' ? '৩য় রোজা (১৫ হিজরি)' : 'Day 3 (15 Hijri)'}</span>
                {ayyamBiz.hijriDay === 15 && <span className="text-[10px] bg-emerald-400 text-black px-1.5 py-0.2 rounded-full font-bold">{language === 'bn' ? 'আজ' : 'Today'}</span>}
              </div>
              <p className="font-bold text-white text-xs sm:text-sm">{ayyamBiz.dates.day15Bn}</p>
            </div>
          </div>

          {/* Authentic Hadith Reference */}
          <div className="p-2.5 rounded-2xl bg-black/30 border border-white/10 text-xs space-y-1">
            <p className="text-white/95 leading-relaxed font-bengali">
              "{ayyamBiz.hadithBn}"
            </p>
            <p className="text-[10px] text-[#B9E2DD] font-mono">
              — {ayyamBiz.hadithSourceBn}
            </p>
          </div>

          {/* Niyyah Accordion Toggle */}
          <div className="pt-0.5">
            <button
              onClick={() => {
                triggerHaptic(10);
                setShowAyyamBizNiyyah((prev) => !prev);
              }}
              className="w-full py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>{language === 'bn' ? 'রোজার নিয়ত ও নিয়ম দেখুন' : 'View Fasting Intention'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAyyamBizNiyyah ? 'rotate-180' : ''}`} />
            </button>

            {showAyyamBizNiyyah && (
              <div className="mt-2 p-3 rounded-2xl bg-black/40 border border-white/15 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#B9E2DD]">{language === 'bn' ? 'আরবি নিয়ত' : 'Arabic Intention'}:</span>
                  <p className="font-uthmani text-base text-right text-white font-bold leading-relaxed pt-1" dir="rtl">
                    {ayyamBiz.niyyahAr}
                  </p>
                </div>
                <div className="pt-1 border-t border-white/10">
                  <span className="text-[10px] uppercase font-bold text-[#B9E2DD]">{language === 'bn' ? 'বাংলা উচ্চারণ ও অর্থ' : 'Meaning'}:</span>
                  <p className="text-white/90 font-bengali leading-relaxed mt-0.5">
                    {ayyamBiz.niyyahBn}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3.6. QURAN AUTO-RESUME READING TRACKER CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] p-4 sm:p-4.5 shadow-2xs hover:shadow-xs transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0F5F62]/10 dark:bg-[#0F5F62]/30 text-[#0F5F62] dark:text-[#B9E2DD] flex items-center justify-center shrink-0 border border-[#0F5F62]/20 shadow-2xs">
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F5F62] dark:text-[#B9E2DD]">
                  {language === 'bn' ? 'সর্বশেষ পঠিত কুরআন' : 'Last Read Quran'}
                </span>
                {lastReadQuran && (
                  <span className="px-2 py-0.5 rounded-full bg-[#0F5F62]/10 dark:bg-[#0F5F62]/30 text-[#0F5F62] dark:text-[#B9E2DD] text-[10px] font-bold font-mono">
                    {toBn(lastReadQuran.progressPercent)}% {language === 'bn' ? 'সম্পন্ন' : 'done'}
                  </span>
                )}
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#10235A] dark:text-white font-bengali truncate mt-0.5">
                {lastReadQuran
                  ? (language === 'bn'
                      ? `সূরা ${lastReadQuran.surahNameBn} • আয়াত ${toBn(lastReadQuran.ayahNumber)}`
                      : `Surah ${lastReadQuran.surahNameBn} • Ayah ${lastReadQuran.ayahNumber}`)
                  : (language === 'bn' ? 'কুরআন তিলাওয়াত শুরু করুন' : 'Start Reading Quran')}
              </h4>
              <p className="text-xs text-muted-slate font-bengali truncate">
                {lastReadQuran
                  ? (language === 'bn'
                      ? `পৃষ্ঠা ${toBn(lastReadQuran.pageNumber)} · মোট ${toBn(lastReadQuran.totalAyahs)} আয়াত`
                      : `Page ${lastReadQuran.pageNumber} · ${lastReadQuran.totalAyahs} Ayahs`)
                  : (language === 'bn' ? 'সূরা আল-ফাতিহা থেকে শুরু করুন' : 'Begin with Surah Al-Fatihah')}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic(15);
              if (lastReadQuran) {
                onNavigate('quran', { surah: lastReadQuran.surahNumber, ayah: lastReadQuran.ayahNumber });
              } else {
                onNavigate('quran', { surah: 1, ayah: 1 });
              }
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#0F5F62] hover:bg-[#123234] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer shrink-0"
          >
            <span>{lastReadQuran ? (language === 'bn' ? 'পড়া চালিয়ে যান' : 'Continue Reading') : (language === 'bn' ? 'কুরআন পড়ুন' : 'Read Quran')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        {lastReadQuran && (
          <div className="mt-3 pt-2.5 border-t border-[#E7D9DE]/60 dark:border-[#1C2D5A]">
            <div className="flex items-center justify-between text-[11px] text-muted-slate mb-1">
              <span>{language === 'bn' ? 'পড়ার অগ্রগতি' : 'Reading Progress'}</span>
              <span className="font-mono font-bold text-[#0F5F62] dark:text-[#B9E2DD]">
                {toBn(lastReadQuran.ayahNumber)} / {toBn(lastReadQuran.totalAyahs)} {language === 'bn' ? 'আয়াত' : 'Ayahs'}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-[#0F5F62] to-[#1FB5A2] transition-all duration-500"
                style={{ width: `${Math.max(3, lastReadQuran.progressPercent)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. QUICK ACCESS GRID ("দ্রুত প্রবেশ") - Placed right below */}
      <div className="bg-white dark:bg-[#142042] rounded-2xl p-3 sm:p-4 border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#10235A] dark:text-[#E9B7C3]">
            {t.quickLinks || 'দ্রুত প্রবেশ'}
          </h3>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {/* 1. Quran */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onNavigate('quran');
            }}
            className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl hover:bg-[#F8E8ED]/60 dark:hover:bg-[#1C2D5A] transition-all duration-200 active:scale-95 text-center min-h-[72px] cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-[#F8E8ED] dark:bg-[#1C2D5A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center mb-1 shadow-2xs">
              <BookOpen className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-semibold text-[#1F2937] dark:text-slate-200 truncate w-full">
              {t.quran}
            </span>
          </button>

          {/* 2. Prayer */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onNavigate('prayer');
            }}
            className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl hover:bg-[#F8E8ED]/60 dark:hover:bg-[#1C2D5A] transition-all duration-200 active:scale-95 text-center min-h-[72px] cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-[#F8E8ED] dark:bg-[#1C2D5A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center mb-1 shadow-2xs">
              <Clock className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-semibold text-[#1F2937] dark:text-slate-200 truncate w-full">
              {t.prayer}
            </span>
          </button>

          {/* 3. Tasbeeh */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onNavigate('tasbeeh');
            }}
            className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl hover:bg-[#F8E8ED]/60 dark:hover:bg-[#1C2D5A] transition-all duration-200 active:scale-95 text-center min-h-[72px] cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-[#F8E8ED] dark:bg-[#1C2D5A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center mb-1 shadow-2xs">
              <Sparkles className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-semibold text-[#1F2937] dark:text-slate-200 truncate w-full">
              {t.tasbeeh}
            </span>
          </button>

          {/* 4. Dua */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onNavigate('dua');
            }}
            className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl hover:bg-[#F8E8ED]/60 dark:hover:bg-[#1C2D5A] transition-all duration-200 active:scale-95 text-center min-h-[72px] cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-[#F8E8ED] dark:bg-[#1C2D5A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center mb-1 shadow-2xs">
              <Heart className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-semibold text-[#1F2937] dark:text-slate-200 truncate w-full">
              {t.dua}
            </span>
          </button>

          {/* 5. Ruqyah */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onNavigate('ruqyah');
            }}
            className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl hover:bg-[#F8E8ED]/60 dark:hover:bg-[#1C2D5A] transition-all duration-200 active:scale-95 text-center min-h-[72px] cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-[#F8E8ED] dark:bg-[#1C2D5A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center mb-1 shadow-2xs">
              <Shield className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-semibold text-[#1F2937] dark:text-slate-200 truncate w-full">
              {language === 'bn' ? 'রুকইয়াহ' : 'Ruqyah'}
            </span>
          </button>

          {/* 6. Salah Guide */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onNavigate('salahGuide');
            }}
            className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl hover:bg-[#F8E8ED]/60 dark:hover:bg-[#1C2D5A] transition-all duration-200 active:scale-95 text-center min-h-[72px] cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-[#F8E8ED] dark:bg-[#1C2D5A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center mb-1 shadow-2xs">
              <BookmarkCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-semibold text-[#1F2937] dark:text-slate-200 truncate w-full">
              {t.salahGuide}
            </span>
          </button>

          {/* 7. Qibla */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onNavigate('qibla');
            }}
            className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl hover:bg-[#F8E8ED]/60 dark:hover:bg-[#1C2D5A] transition-all duration-200 active:scale-95 text-center min-h-[72px] cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-[#F8E8ED] dark:bg-[#1C2D5A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center mb-1 shadow-2xs">
              <Compass className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-semibold text-[#1F2937] dark:text-slate-200 truncate w-full">
              {t.qibla}
            </span>
          </button>

          {/* 8. Hadith or Period Tracker */}
          {gender === 'female' ? (
            <button
              onClick={() => {
                triggerHaptic(15);
                onNavigate('tracker');
              }}
              className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl hover:bg-[#F8E8ED]/60 dark:hover:bg-[#1C2D5A] transition-all duration-200 active:scale-95 text-center min-h-[72px] cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-[#F8E8ED] dark:bg-[#1C2D5A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center mb-1 shadow-2xs">
                <Heart className="w-5 h-5 fill-current text-[#21409A] dark:text-[#E9B7C3]" />
              </div>
              <span className="text-[11px] font-semibold text-[#1F2937] dark:text-slate-200 truncate w-full">
                {language === 'bn' ? 'পবিত্রতা ও তাহরাত' : 'Period Tracker'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => {
                triggerHaptic(15);
                onNavigate('hadith');
              }}
              className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl hover:bg-[#F8E8ED]/60 dark:hover:bg-[#1C2D5A] transition-all duration-200 active:scale-95 text-center min-h-[72px] cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-[#F8E8ED] dark:bg-[#1C2D5A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center mb-1 shadow-2xs">
                <BookOpen className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-[11px] font-semibold text-[#1F2937] dark:text-slate-200 truncate w-full">
                {t.hadith}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 4.5. GENTLE PERIOD REMINDER BANNER FOR FEMALE USERS */}
      {gender === 'female' && periodStatus && (periodStatus.isApproaching || periodStatus.isActive) && !periodBannerDismissed && (
        <div className="rounded-3xl bg-linear-to-r from-pink-50 via-rose-50 to-pink-100/70 dark:from-[#2A1224] dark:via-[#35162D] dark:to-[#220E1E] border border-pink-200 dark:border-pink-900/60 p-4 shadow-xs space-y-2.5 transition-all">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-300 flex items-center justify-center shrink-0 shadow-2xs">
                <Heart className="w-5 h-5 fill-current text-pink-500 dark:text-pink-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-sm font-bold text-pink-950 dark:text-pink-100">
                    {language === 'bn'
                      ? (periodStatus.isActive ? 'তাহরাত ও স্বাস্থ্য সতর্কতা (মাসিক চলমান)' : 'আসন্ন পিরিয়ডের রিমাইন্ডার')
                      : (periodStatus.isActive ? 'Taharah & Health Notice (Period active)' : 'Upcoming Period Reminder')}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-pink-200/80 dark:bg-pink-900/80 text-pink-800 dark:text-pink-200 text-[10px] font-bold">
                    {periodStatus.isActive
                      ? (language === 'bn' ? 'চক্র চলমান' : 'Cycle Active')
                      : periodStatus.daysRemaining === 0
                      ? (language === 'bn' ? 'আজ সম্ভাব্য দিন' : 'Expected Today')
                      : (language === 'bn' ? `আর ${toBn(periodStatus.daysRemaining)} দিন পর` : `In ${periodStatus.daysRemaining} days`)}
                  </span>
                </div>
                <p className="text-xs text-pink-900/80 dark:text-pink-200/80 mt-0.5">
                  {periodStatus.isActive
                    ? (language === 'bn'
                        ? 'আপনার মাসিক চক্রের দিন চলমান। নামাজ ও রোজা থেকে বিরতি এবং শারীরিক বিশ্রাম বজায় রাখুন।'
                        : 'Your monthly cycle is active. Pause prayers and fasting, and take care of your health.')
                    : periodStatus.daysRemaining === 0
                    ? (language === 'bn'
                        ? `আজ আপনার সম্ভাব্য পিরিয়ডের তারিখ (${periodStatus.nextDateFormatted})। প্রয়োজনীয় প্রস্তুতি সঙ্গে রাখুন।`
                        : `Your cycle is expected today (${periodStatus.nextDateFormatted}). Keep care essentials handy.`)
                    : (language === 'bn'
                        ? `সম্ভাব্য তারিখ: ${periodStatus.nextDateFormatted}। প্রয়োজনীয় প্রস্তুতি ও সুরক্ষা সঙ্গে রাখুন।`
                        : `Expected date: ${periodStatus.nextDateFormatted}. Keep supplies and essentials handy.`)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setPeriodBannerDismissed(true);
              }}
              className="text-pink-400 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-200 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
              title={language === 'bn' ? 'বার্তাটি বন্ধ করুন' : 'Dismiss notice'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-pink-200/60 dark:border-pink-900/50 text-xs">
            <span className="text-[11px] text-pink-700/80 dark:text-pink-300/80">
              {language === 'bn' ? '🔒 অন-ডিভাইস এনক্রিপ্টেড ও সম্পূর্ণ ব্যক্তিগত' : '🔒 On-device encrypted & fully private'}
            </span>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15);
                onNavigate('tracker');
              }}
              className="text-xs font-bold text-pink-700 dark:text-pink-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'bn' ? 'ট্র্যাকার ওপেন করুন' : 'Open Tracker'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. THURSDAY POST-MAGHRIB & FRIDAY SPECIAL AMALS WIDGET */}
      {showJumuahWidget && (
        <div className="rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] border-t-4 border-t-[#21409A] p-4 sm:p-5 shadow-2xs space-y-3.5 transition-all">
          <div className="flex items-start justify-between gap-2 border-b border-[#E7D9DE] dark:border-[#1C2D5A] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#F8E8ED] dark:bg-[#1C2D5A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center font-bold text-xl shrink-0">
                {isThursdayPostMaghrib ? '🌙' : '🕌'}
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-sm sm:text-base font-extrabold text-[#1F2937] dark:text-white leading-tight">
                    {isThursdayPostMaghrib
                      ? (language === 'bn' ? 'পবিত্র জুমু\'আর রাত (মাগরিব পরবর্তী আমল)' : 'Blessed Jumuah Night (Post-Maghrib Sunnah)')
                      : (language === 'bn' ? 'পবিত্র জুমু\'আ মুবারক — বিশেষ আমল ও ফযীলত' : 'Blessed Jumuah Mubarak — Sunnah Acts & Virtues')}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#F8E8ED] dark:bg-[#10235A] text-[#10235A] dark:text-[#E9B7C3] text-[10px] font-bold border border-[#E7D9DE] dark:border-[#24386E]">
                    {isThursdayPostMaghrib
                      ? (language === 'bn' ? 'বৃহস্পতিবার মাগরিব পরবর্তী' : 'Thursday Post-Maghrib')
                      : (language === 'bn' ? 'সপ্তাহের শ্রেষ্ঠ দিন' : 'Best Day of the Week')}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280] dark:text-slate-300 mt-1 leading-snug">
                  {isThursdayPostMaghrib
                    ? (language === 'bn'
                        ? 'সূর্যাস্তের পর থেকেই বরকতময় জুমু\'আর রাত শুরু হয়েছে। হাদিসে বর্ণিত আমল ও সওয়াবসমূহ:'
                        : 'The blessed night of Jumuah has begun after sunset. Virtues and Sunnah deeds from Hadith:')
                    : (language === 'bn'
                        ? 'আজ সাইয়্যিদুল আইয়্যাম (জুমু\'আ)। হাদিসে বর্ণিত বরকতময় আমল, সওয়াব ও ফযীলতসমূহ:'
                        : 'Today is Sayyidul Ayyam (Friday). Authentic Sunnah deeds, rewards and virtues:')}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic(15);
                setIsJumuahCardExpanded(!isJumuahCardExpanded);
              }}
              className="text-xs text-[#10235A] dark:text-[#E9B7C3] hover:underline flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F8E8ED] dark:bg-[#1C2D5A] font-bold shrink-0 cursor-pointer"
            >
              <span>
                {isJumuahCardExpanded
                  ? (language === 'bn' ? 'সংক্ষেপ' : 'Collapse')
                  : (language === 'bn' ? 'আমল তালিকা' : 'View Deeds')}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isJumuahCardExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Quick Surah Kahf Action */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8E8ED]/70 dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#24386E]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#21409A] text-white flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#1F2937] dark:text-white block">
                  {language === 'bn' ? 'সূরা আল-কাহফ তিলাওয়াত' : 'Recitation of Surah Al-Kahf'}
                </span>
                <span className="text-[10px] text-[#21409A] dark:text-[#E9B7C3] block">
                  {language === 'bn' ? 'এক জুমু\'আ থেকে অন্য জুমু\'আ পর্যন্ত নূরের আলোকবর্তিকা' : 'A beacon of divine light from one Friday to the next'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                triggerHaptic(15);
                onNavigate('quran', 18);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#21409A] hover:bg-[#10235A] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>{language === 'bn' ? 'সূরা কাহফ পড়ুন' : 'Read Surah Kahf'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Detailed Amals List - SERIAL ORDER (NOT CHECKLIST) */}
          {isJumuahCardExpanded && (
            <div className="space-y-2.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#10235A] dark:text-[#E9B7C3] block">
                {language === 'bn' ? 'আজকের করণীয় আমল ও অফুরন্ত সওয়াব (ধারাবাহিক নির্দেশনা):' : 'Recommended Sunnah Acts & Virtues (In Sequence):'}
              </span>

              <div className="grid grid-cols-1 gap-2.5">
                {jumuahAmalsList.map((amal, index) => (
                  <div
                    key={amal.id}
                    className="p-3.5 rounded-2xl border bg-white dark:bg-[#142042] border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#21409A] dark:bg-[#E9B7C3] text-white dark:text-[#10235A] text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {language === 'bn' ? toBn(index + 1) : index + 1}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold leading-tight text-[#1F2937] dark:text-white">
                            {language === 'bn' ? amal.title : amal.titleEn}
                          </h4>
                          {amal.hasQuranAction && (
                            <button
                              onClick={() => {
                                triggerHaptic(15);
                                onNavigate('quran', 18);
                              }}
                              className="text-[10px] text-[#21409A] dark:text-[#E9B7C3] font-bold hover:underline shrink-0 cursor-pointer"
                            >
                              {language === 'bn' ? 'তিলাওয়াত →' : 'Recite →'}
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-[#21409A] dark:text-[#E9B7C3] font-semibold leading-snug">
                          {language === 'bn' ? amal.subtitle : amal.subtitleEn}
                        </p>
                        <div className="p-2.5 rounded-xl bg-[#F8E8ED] dark:bg-[#10235A] border border-[#E7D9DE] dark:border-[#24386E] text-[11px] text-[#10235A] dark:text-[#F8E8ED] leading-relaxed font-normal">
                          <span className="font-bold text-[#21409A] dark:text-[#E9B7C3]">
                            {language === 'bn' ? '✨ সওয়াব ও ফযীলত: ' : '✨ Reward & Virtue: '}
                          </span>
                          {language === 'bn' ? amal.reward : amal.rewardEn}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. RUNNING NAFL PRAYER BANNER (OR UPCOMING NAFL TIMES) */}
      {runningNafl ? (
        <NaflHeroCard
          runningNafl={runningNafl}
          language={language}
          onNavigate={onNavigate}
        />
      ) : (
        <div
          onClick={() => {
            triggerHaptic(15);
            onNavigate('prayer');
          }}
          className="rounded-2xl bg-white dark:bg-[#142042] p-3.5 border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs cursor-pointer hover:border-[#21409A]/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F8E8ED] dark:bg-[#1C2D5A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center shrink-0">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1F2937] dark:text-white flex items-center gap-1.5">
                <span>{language === 'bn' ? 'নফল নামাজের সময়সূচি ও ফজিলত' : 'Nafl Prayer Schedule & Virtues'}</span>
                <span className="text-[10px] bg-[#F8E8ED] dark:bg-[#10235A] text-[#10235A] dark:text-[#E9B7C3] px-1.5 py-0.2 rounded-md font-semibold">
                  {language === 'bn' ? '১০টি নফল' : '10 Nafl Prayers'}
                </span>
              </h4>
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#6B7280] dark:text-slate-400 mt-0.5">
                <span>{language === 'bn' ? 'ইশরাক' : 'Ishraq'}: {formatPrayerTime12h(prayerTimes.ishraqStart, language)}</span>
                <span>·</span>
                <span>{language === 'bn' ? 'চাশত' : 'Chasht'}: {formatPrayerTime12h(prayerTimes.chashtStart, language)}</span>
                <span>·</span>
                <span>
                  {language === 'bn' ? 'তাহাজ্জুদ' : 'Tahajjud'}: {formatPrayerTime12h(prayerTimes.tahajjudStart, language)} - {formatPrayerTime12h(prayerTimes.tahajjudEnd, language)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-[#21409A] dark:text-[#E9B7C3] group-hover:translate-x-1 transition-transform shrink-0">
            <span>{language === 'bn' ? 'দেখুন' : 'View'}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* 7. DAILY 5 WAQT NAMAZ CHECKLIST & MISSED COUNTER BANNER */}
      <div
        onClick={() => {
          triggerHaptic(15);
          onNavigate('prayer');
        }}
        className="bg-white dark:bg-[#142042] rounded-2xl p-3 border border-[#E7D9DE] dark:border-[#1C2D5A] flex items-center justify-between cursor-pointer hover:border-[#21409A]/40 transition-all active:scale-[0.99] shadow-2xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#21409A] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            ✓
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1F2937] dark:text-slate-200">
              {language === 'bn' ? 'দৈনিক ৫ ওয়াক্ত সালাত চেকলিস্ট ও মিস হিসাব' : 'Daily 5 Prayers Tracker & Missed Counter'}
            </h4>
            <p className="text-[11px] text-[#6B7280] dark:text-slate-400 mt-0.5">
              {language === 'bn' ? 'আজকের ওয়াক্ত চিহ্নিত করুন এবং এই মাসে কত ওয়াক্ত মিস হয়েছে তা দেখুন' : "Mark today's prayers and review missed prayers this month"}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-[#21409A] dark:text-[#E9B7C3] flex items-center gap-0.5 shrink-0">
          <span>{language === 'bn' ? 'হিসাব দেখুন' : 'View Tracker'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* 8. DAILY AYAH (Verse of the Day) */}
      <div className="rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] border-t-4 border-t-[#21409A] p-4 sm:p-5 shadow-2xs space-y-3.5 relative overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E7D9DE] dark:border-[#1C2D5A] pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F8E8ED] dark:bg-[#1C2D5A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[#1F2937] dark:text-white">
                  {t.dailyAyah || (language === 'bn' ? 'আজকের আয়াত' : 'Daily Ayah')}
                </h4>
                {todayAyah.themeBn && (
                  <span className="text-[10px] bg-[#F8E8ED] dark:bg-[#10235A] text-[#10235A] dark:text-[#E9B7C3] font-semibold px-2 py-0.5 rounded-full border border-[#E7D9DE] dark:border-[#24386E]">
                    {language === 'bn' ? todayAyah.themeBn : (todayAyah.themeEn || todayAyah.themeBn)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#6B7280] dark:text-slate-400">
                {language === 'bn'
                  ? `সূরা ${todayAyah.surahNameBn} (${todayAyah.surahNameEn}) · আয়াত ${toBn(todayAyah.ayahNumber)}`
                  : `Surah ${todayAyah.surahNameEn || todayAyah.surahNumber} · Ayah ${todayAyah.ayahNumber}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleRandomizeAyah}
              className="text-xs text-[#6B7280] dark:text-slate-300 hover:text-[#21409A] dark:hover:text-[#E9B7C3] flex items-center gap-1 transition-colors px-2 py-1.5 rounded-xl hover:bg-[#F8E8ED] dark:hover:bg-[#1C2D5A] cursor-pointer"
              title={language === 'bn' ? 'অন্য আয়াত দেখুন' : 'Show another verse'}
            >
              <RotateCw className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
              <span className="hidden sm:inline font-medium text-[11px]">
                {language === 'bn' ? 'অন্য আয়াত' : 'New Ayah'}
              </span>
            </button>

            <button
              onClick={handleCopyAyah}
              className="text-xs text-[#6B7280] dark:text-slate-300 hover:text-[#21409A] dark:hover:text-[#E9B7C3] flex items-center gap-1 transition-colors px-2 py-1.5 rounded-xl hover:bg-[#F8E8ED] dark:hover:bg-[#1C2D5A] cursor-pointer"
              title={language === 'bn' ? 'শেয়ার করুন' : 'Share'}
            >
              {copiedAyah ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#21409A]" />
                  <span className="text-[#21409A] font-medium text-[11px]">
                    {language === 'bn' ? 'কপি হয়েছে' : 'Copied'}
                  </span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="sr-only sm:not-sr-only text-[11px]">
                    {language === 'bn' ? 'শেয়ার' : 'Share'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Arabic Ayah Text in Deep Navy / Near-Black */}
        <div className="py-1">
          <p
            className="font-uthmani text-xl sm:text-2xl leading-loose text-center text-[#10235A] dark:text-white font-bold select-text"
            dir="rtl"
          >
            {todayAyah.textArabic}
          </p>
        </div>

        {/* Translation: Pure English in English mode, Pure Bengali in Bengali mode */}
        <div className="pt-0.5">
          <p className={`text-sm sm:text-base text-[#1F2937] dark:text-slate-100 text-center leading-relaxed font-medium ${language === 'bn' ? 'font-bengali' : 'font-sans'}`}>
            "{language === 'bn' ? todayAyah.translationBn : (todayAyah.translationEn || todayAyah.translationBn)}"
          </p>
        </div>

        {/* Audio state banner */}
        {audioState !== 'idle' && (
          <div
            className={`flex items-center justify-between px-3 py-2 rounded-2xl border text-xs font-semibold animate-in fade-in duration-200 ${
              audioState === 'tilawat'
                ? 'bg-[#F8E8ED] dark:bg-[#10235A] border-[#E9B7C3] dark:border-[#24386E] text-[#10235A] dark:text-[#F8E8ED]'
                : 'bg-[#F8E8ED] dark:bg-[#10235A] border-[#21409A]/40 dark:border-[#E9B7C3]/40 text-[#21409A] dark:text-[#E9B7C3]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 animate-pulse shrink-0" />
              <span>
                {audioState === 'tilawat'
                  ? (language === 'bn'
                      ? `${t.recitingAyah || 'তেলাওয়াত চলছে...'} (সূরা ${todayAyah.surahNameBn} - আয়াত ${toBn(todayAyah.ayahNumber)})`
                      : `Reciting Ayah... (Surah ${todayAyah.surahNameEn || todayAyah.surahNumber} - Ayah ${todayAyah.ayahNumber})`)
                  : (language === 'bn'
                      ? `${t.speakingTranslation || 'অর্থ পাঠ চলছে...'} (অনুবাদ)`
                      : 'Speaking translation...')}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="w-1 h-3.5 bg-current rounded-full animate-pulse" />
              <span className="w-1 h-5 bg-current rounded-full animate-pulse delay-75" />
              <span className="w-1 h-2 bg-current rounded-full animate-pulse delay-150" />
            </div>
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E7D9DE] dark:border-[#1C2D5A] text-xs">
          {/* Secondary CTA: Soft Rose / Royal Sapphire Button */}
          <button
            onClick={() => {
              if (audioState !== 'idle') {
                stopAllAyahAudio();
              } else {
                handlePlayAyahAudio();
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all active:scale-95 cursor-pointer shadow-2xs ${
              audioState !== 'idle'
                ? 'bg-rose-700 hover:bg-rose-800 text-white'
                : 'bg-[#F8E8ED] dark:bg-[#1C2D5A] text-[#10235A] dark:text-[#F8E8ED] hover:bg-[#E9B7C3]/40 border border-[#E7D9DE] dark:border-[#24386E]'
            }`}
            title={language === 'bn' ? 'আয়াতটির আরবি তেলাওয়াত শুনুন' : 'Listen to Arabic recitation'}
          >
            {audioState !== 'idle' ? (
              <>
                <VolumeX className="w-4 h-4 animate-pulse" />
                <span>{t.stopAudio || (language === 'bn' ? 'থামান' : 'Stop')}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />
                <span>{language === 'bn' ? 'তিলাওয়াত শুনুন' : 'Listen Tilawat'}</span>
              </>
            )}
          </button>

          {/* Outline CTA: Read in Quran */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onNavigate('quran', todayAyah.surahNumber);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[#21409A] dark:text-[#E9B7C3] hover:bg-[#F8E8ED] dark:hover:bg-[#10235A] transition-all active:scale-95 border border-[#21409A]/40 dark:border-[#E9B7C3]/40 cursor-pointer"
          >
            <span>{t.readInQuran || (language === 'bn' ? 'কুরআনে পড়ুন' : 'Read in Quran')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 9. DAILY HADITH CARD */}
      <div className="rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] border-t-2 border-t-[#E9B7C3] p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E7D9DE]/60 dark:border-[#1C2D5A] pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#21409A] dark:bg-[#E9B7C3]" />
            <h4 className="text-xs font-bold text-[#1F2937] dark:text-white">
              {t.dailyHadith}
            </h4>
          </div>
          <button
            onClick={handleCopyHadith}
            className="text-xs text-[#6B7280] dark:text-slate-400 hover:text-[#21409A] flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-[#F8E8ED] dark:hover:bg-[#10235A] cursor-pointer"
            title={language === 'bn' ? 'কপি / শেয়ার করুন' : 'Copy / Share'}
          >
            {copiedHadith ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#21409A]" />
                <span className="text-[#21409A] font-medium">
                  {language === 'bn' ? 'কপি হয়েছে' : 'Copied'}
                </span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'শেয়ার' : 'Share'}</span>
              </>
            )}
          </button>
        </div>

        <p className="font-uthmani text-lg leading-relaxed text-right text-[#10235A] dark:text-slate-100 block mb-2 font-bold" dir="rtl">
          {todayHadith.arabic}
        </p>

        <p className={`text-sm text-[#1F2937] dark:text-slate-200 leading-normal text-left block ${language === 'bn' ? 'font-bengali' : 'font-sans'}`} dir="ltr">
          "{language === 'bn' ? todayHadith.translationBn : (todayHadith.translationEn || todayHadith.translationBn)}"
        </p>

        <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-slate-400 pt-1">
          <span>{language === 'bn' ? todayHadith.sourceBn : (todayHadith.source || todayHadith.sourceBn)}</span>
          <span className="text-[11px] text-[#21409A] dark:text-[#E9B7C3] font-semibold">
            {language === 'bn' ? todayHadith.gradeBn : (todayHadith.grade || todayHadith.gradeBn)}
          </span>
        </div>
      </div>
    </div>
  );
};
