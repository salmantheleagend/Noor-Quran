import React, { useState, useEffect, useRef } from 'react';
import {
  Sunrise,
  Sunset,
  Moon,
  AlertTriangle,
  Palette,
  Utensils,
} from 'lucide-react';
import { AppLanguage, CurrentWaqtStatus, PrayerTimesData } from '../types';
import { triggerHaptic } from '../utils/audioPlayer';
import { toBn } from '../utils/prayerTimes';

export type PrayerCardStyleId =
  | 'masjid_nabawi'
  | 'masjid_haram'
  | 'masjid_aqsa'
  | 'sheikh_zayed'
  | 'blue_mosque_istanbul'
  | 'baitul_mukarram'
  | 'faisal_mosque'
  | 'badshahi_mosque'
  | 'classic_teal'
  | 'thuluth_gold_calligraphy'
  | 'kaaba_kiswah'
  | 'sunset_dusk'
  | 'modern_glass'
  | 'celestial_night'
  | 'kufic_indigo_mosaic'
  | 'desert_fajr_dunes';

export interface PrayerCardStyleOption {
  id: PrayerCardStyleId;
  nameBn: string;
  nameEn: string;
  badge: string;
  badgeEn: string;
  icon: string;
  descBn: string;
  descEn?: string;
}

export const PRAYER_CARD_STYLES: PrayerCardStyleOption[] = [
  {
    id: 'masjid_nabawi',
    nameBn: 'আল-মসজিদ আন-নববী (মদিনা)',
    nameEn: 'Al-Masjid an-Nabawi (Madinah)',
    badge: '১/১৬ মদিনা মুনাওয়ারা',
    badgeEn: '1/16 Prophet\'s Mosque',
    icon: '🕌',
    descBn: 'মদিনা শরিফের পবিত্র সবুজ গম্বুজ, সুউচ্চ মিনার ও রওজা মোবারকের নুরানী আভা',
    descEn: 'Sacred Green Dome, towering minarets and peaceful Madinah serenity',
  },
  {
    id: 'masjid_haram',
    nameBn: 'মসজিদুল হারাম ও পবিত্র কাবা (মক্কা)',
    nameEn: 'Masjid al-Haram & Kaaba (Makkah)',
    badge: '২/১৬ কাবা শরিফ',
    badgeEn: '2/16 Holy Kaaba',
    icon: '🕋',
    descBn: 'পবিত্র কাবার সোনালি কিসওয়াহ ও মসজিদুল হারামের আকাশছোঁয়া মার্বেল মিনার',
    descEn: 'Golden embroidered Kaaba Kiswah and grand minarets of Makkah',
  },
  {
    id: 'masjid_aqsa',
    nameBn: 'আল-আকসা ও কুব্বাতুস সাখরা (কুদস)',
    nameEn: 'Al-Aqsa & Dome of the Rock',
    badge: '৩/১৬ পবিত্র আল-আকসা',
    badgeEn: '3/16 Sacred Al-Aqsa',
    icon: '✨',
    descBn: 'প্রথম কিবলা আল-আকসা ও সোনালি গম্বুজের পবিত্র ঐতিহাসিক প্রাঙ্গণ',
    descEn: 'The historic first Qibla, golden dome and ancient Jerusalem sanctuary',
  },
  {
    id: 'sheikh_zayed',
    nameBn: 'শেখ জায়েদ গ্র্যান্ড মসজিদ (আবু ধাবি)',
    nameEn: 'Sheikh Zayed Grand Mosque',
    badge: '৪/১৬ শেখ জায়েদ মসজিদ',
    badgeEn: '4/16 Sheikh Zayed Mosque',
    icon: '🏛️',
    descBn: 'শ্বেতশুভ্র ধবল মার্বেল গম্বুজ ও শান্ত স্বচ্ছ পানির মনোরম প্রতিফলন',
    descEn: 'Pure white marble domes reflecting across tranquil crystal pools',
  },
  {
    id: 'blue_mosque_istanbul',
    nameBn: 'সুলতান আহমেদ ব্লু মসজিদ (ইস্তাম্বুল)',
    nameEn: 'Sultan Ahmed Blue Mosque',
    badge: '৫/১৬ ব্লু মসজিদ ইস্তাম্বুল',
    badgeEn: '5/16 Blue Mosque Istanbul',
    icon: '🇹🇷',
    descBn: 'ছয়টি সুউচ্চ অটোমান মিনার ও ঐতিহাসিক নীল সিরামিক টালির অনন্য স্থাপত্য',
    descEn: 'Six iconic Ottoman minarets, cascading domes and historic Iznik blue tiles',
  },
  {
    id: 'baitul_mukarram',
    nameBn: 'বায়তুল মোকাররম জাতীয় মসজিদ (ঢাকা)',
    nameEn: 'Baitul Mukarram National Mosque',
    badge: '৬/১৬ বায়তুল মোকাররম ঢাকা',
    badgeEn: '6/16 Baitul Mukarram Dhaka',
    icon: '🇧🇩',
    descBn: 'কাবার আদলে নির্মিত বাংলাদেশের জাতীয় মসজিদের মহিমান্বিত রূপ ও ফোয়ারা',
    descEn: 'Bangladesh\'s national mosque cube architecture and fountain courtyard',
  },
  {
    id: 'faisal_mosque',
    nameBn: 'শাহ ফয়সাল মসজিদ (ইসলামাবাদ)',
    nameEn: 'Shah Faisal Mosque Islamabad',
    badge: '৭/১৬ ফয়সাল মসজিদ',
    badgeEn: '7/16 Faisal Mosque',
    icon: '⛺',
    descBn: 'মরু তাঁবুর জ্যামিতিক নকশায় নির্মিত আধুনিক মার্বেল স্থাপত্য ও চারটি সাদা মিনার',
    descEn: 'Iconic Bedouin tent inspired modern geometry and four soaring minarets',
  },
  {
    id: 'badshahi_mosque',
    nameBn: 'বাদশাহী মসজিদ (লাহোর)',
    nameEn: 'Badshahi Mosque Lahore',
    badge: '৮/১৬ বাদশাহী মসজিদ',
    badgeEn: '8/16 Badshahi Mosque',
    icon: '👑',
    descBn: 'মুঘল আমলের ঐতিহ্যবাহী লাল বেলেপাথরের বিশাল খিলান ও তিনটি শ্বেত মার্বেল গম্বুজ',
    descEn: 'Mughal red sandstone grand arches and three white marble onion domes',
  },
  {
    id: 'classic_teal',
    nameBn: 'মরোক্কান টিল ও মসজিদ',
    nameEn: 'Classic Moroccan Teal',
    badge: '৯/১৬ টিল মসজিদ',
    badgeEn: '9/16 Teal Mosque',
    icon: '🕌',
    descBn: 'মূল ক্লাসিক টিল ব্যাকগ্রাউন্ড ও ঐতিহ্যবাহী মসজিদ সিলুয়েট',
    descEn: 'Classic teal background with traditional mosque silhouette',
  },
  {
    id: 'thuluth_gold_calligraphy',
    nameBn: 'স্বর্ণালী ক্যালিগ্রাফি পাণ্ডুলিপি',
    nameEn: 'Gold Thuluth Calligraphy',
    badge: '১০/১৬ স্বর্ণালী ক্যালিগ্রাফি',
    badgeEn: '10/16 Gold Thuluth',
    icon: '📜',
    descBn: 'কুরআনিক পাণ্ডুলিপির সোনালি তুলূস ক্যালিগ্রাফি ও আলোকোজ্জ্বল বর্ডার',
    descEn: 'Golden manuscript calligraphy and illuminating border',
  },
  {
    id: 'kaaba_kiswah',
    nameBn: 'পবিত্র কাবার কিসওয়াহ ও স্বর্ণসূতা',
    nameEn: 'Kaaba Kiswah Black Silk',
    badge: '১১/১৬ কাবার কিসওয়াহ',
    badgeEn: '11/16 Kaaba Kiswah',
    icon: '🕋',
    descBn: 'কালো রেশমি কিসওয়াহ কাপড়, স্বর্ণসূতায় বোনা হিজাম বেল্ট ও আরবি নকশা',
    descEn: 'Deep black silk Kiswah with golden woven calligraphy belt',
  },
  {
    id: 'sunset_dusk',
    nameBn: 'গোধূলি সূর্যাস্ত ও দিগন্ত',
    nameEn: 'Sunset Dusk & Horizon',
    badge: '১২/১৬ গোধূলি দিগন্ত',
    badgeEn: '12/16 Sunset Dusk',
    icon: '🌇',
    descBn: 'মাগরিবের লালচে-কমলা দিগন্ত ও উজ্জ্বল সূর্যাস্ত ডিস্ক',
    descEn: 'Warm sunset horizon with glowing dusk twilight disk',
  },
  {
    id: 'modern_glass',
    nameBn: 'মডার্ন ফ্রস্টেড গ্লাস',
    nameEn: 'Modern Frosted Glass',
    badge: '১৩/১৬ নিয়ন গ্লাস',
    badgeEn: '13/16 Frosted Glass',
    icon: '💎',
    descBn: 'স্বচ্ছ আধুনিক ফ্রস্টেড গ্লাস ও উজ্জ্বল নিয়ন পান্না আভা',
    descEn: 'Translucent frosted glass with emerald luminous glow',
  },
  {
    id: 'celestial_night',
    nameBn: 'সেলিশিয়াল ও তারাভরা রাত',
    nameEn: 'Celestial Midnight Stars',
    badge: '১৪/১৬ গ্যালাক্সি রাত',
    badgeEn: '14/16 Midnight Stars',
    icon: '🌌',
    descBn: 'মহাজাগতিক নীল আকাশ, উজ্জ্বল হেলাল চাঁদ ও অ্যাস্ট্রোল্যাব চক্র',
    descEn: 'Celestial indigo sky with crescent moon and astrolabe rings',
  },
  {
    id: 'kufic_indigo_mosaic',
    nameBn: 'কুফি ক্যালিগ্রাফি ও নীল মনি',
    nameEn: 'Kufic Geometric Indigo',
    badge: '১৫/১৬ কুফি নীল মনি',
    badgeEn: '15/16 Kufic Indigo',
    icon: '🔷',
    descBn: 'মরক্কান নীল মনি ব্যাকগ্রাউন্ডে চতুষ্কোণ জ্যামিতিক কুফি ক্যালিগ্রাফি',
    descEn: 'Moroccan sapphire mosaic with geometric square Kufic script',
  },
  {
    id: 'desert_fajr_dunes',
    nameBn: 'ফজরের আলো ও শান্ত মরুভূমি',
    nameEn: 'Desert Dunes Dawn',
    badge: '১৬/১৬ শান্ত মরুভূমি',
    badgeEn: '16/16 Desert Dawn',
    icon: '🏜️',
    descBn: 'সুবহে সাদিকের শান্ত মরুভূমির বালুকা রেখা ও ভোরের বাঁকা চাঁদ',
    descEn: 'Dawn serenity across desert dunes with morning crescent',
  },
];

const LOCAL_STORAGE_KEY = 'islamic_companion_prayer_card_style';

interface PrayerHeroCardProps {
  waqtStatus: CurrentWaqtStatus;
  prayerTimes: PrayerTimesData;
  language: AppLanguage;
  isFriday: boolean;
  t: Record<string, string>;
  getWaqtName: (name: string) => string;
  formatPrayerTime12h: (time: string, lang: AppLanguage) => string;
}

export const PrayerHeroCard: React.FC<PrayerHeroCardProps> = ({
  waqtStatus,
  prayerTimes,
  language,
  isFriday,
  t,
  getWaqtName,
  formatPrayerTime12h,
}) => {
  const [styleId, setStyleId] = useState<PrayerCardStyleId>(() => {
    if (typeof window === 'undefined') return 'classic_teal';
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY) as PrayerCardStyleId;
      if (saved && PRAYER_CARD_STYLES.some((s) => s.id === saved)) {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'classic_teal';
  });

  // Controls visibility of style badge and bottom hint
  // Initially true for 2.5s, then vanishes. On tap, appears for 2s, then vanishes.
  const [showIndicator, setShowIndicator] = useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [completedCount, setCompletedCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('noor_quran_namaz_tracker_log_v2');
      if (saved) {
        const d = new Date();
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const parsed = JSON.parse(saved);
        const today = parsed[key];
        if (today) {
          return ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].filter((w) => today[w] === 'prayed').length;
        }
      }
    } catch {
      // ignore
    }
    return 0;
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('noor_quran_namaz_tracker_log_v2');
        if (saved) {
          const d = new Date();
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const parsed = JSON.parse(saved);
          const today = parsed[key];
          if (today) {
            setCompletedCount(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].filter((w) => today[w] === 'prayed').length);
            return;
          }
        }
        setCompletedCount(0);
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

  useEffect(() => {
    // Show on initial mount, then vanish after 2.5 seconds
    hideTimerRef.current = setTimeout(() => {
      setShowIndicator(false);
    }, 2500);

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // Cycle to next style on card tap
  const handleCardClick = () => {
    triggerHaptic(20);
    const currentIndex = PRAYER_CARD_STYLES.findIndex((s) => s.id === styleId);
    const nextIndex = (currentIndex + 1) % PRAYER_CARD_STYLES.length;
    const nextStyle = PRAYER_CARD_STYLES[nextIndex].id;
    setStyleId(nextStyle);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, nextStyle);
    } catch {
      // ignore
    }

    // Immediately show badge & hint, then vanish after 2.0 seconds
    setShowIndicator(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowIndicator(false);
    }, 2000);
  };

  const currentStyleMeta =
    PRAYER_CARD_STYLES.find((s) => s.id === styleId) || PRAYER_CARD_STYLES[0];

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className="relative overflow-hidden rounded-3xl text-white shadow-xl p-5 cursor-pointer select-none transition-all duration-300 active:scale-[0.99] group focus:outline-none focus:ring-2 focus:ring-white/40"
      style={{
        transform: 'translateZ(0)',
      }}
      title={
        language === 'bn'
          ? 'কার্ডে ট্যাপ করে ১৬টি বিশ্ববিখ্যাত মসজিদের আকর্ষণীয় ডিজাইনের মধ্যে পরিবর্তন করুন'
          : 'Tap card to switch between 16 world-famous mosque styles'
      }
    >
      {/* =========================================================================
          BACKGROUNDS & ARTWORK PER STYLE (16 WORLD-FAMOUS MOSQUES & STYLES)
          ========================================================================= */}

      {/* 1. AL-MASJID AN-NABAWI (MADINAH AL-MUNAWWARAH) */}
      {styleId === 'masjid_nabawi' && (
        <>
          <div className="absolute inset-0 bg-linear-to-br from-[#021A15] via-[#063328] to-[#021410] border border-emerald-400/40 rounded-3xl pointer-events-none shadow-[inset_0_0_60px_rgba(16,185,129,0.12)]" />
          
          {/* Mosque Photographic Artwork Backdrop */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-40 mix-blend-luminosity">
            <img
              src="/src/assets/images/masjid_nabawi_art_1792513330965.jpg"
              alt="Al-Masjid an-Nabawi Madinah"
              className="w-full h-full object-cover object-center filter saturate-150 contrast-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#021A15] via-[#021A15]/60 to-transparent" />
          </div>

          {/* Luminous Green Dome Ambient Glow & Starry Sky */}
          <div className="absolute top-2 right-12 w-48 h-40 rounded-full bg-emerald-500/25 blur-3xl pointer-events-none" />
          <div className="absolute top-6 left-10 w-36 h-28 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />

          {/* Sacred Calligraphy Watermark: الصلاة والسلام عليك يا رسول الله */}
          <div className="absolute top-2 right-4 pointer-events-none opacity-[0.25] text-emerald-200 font-arabic text-xl sm:text-2xl font-bold select-none text-right" dir="rtl">
            مَسْجِدُ النَّبِيِّ ﷺ · المَدِينَةُ المُنَوَّرَة
          </div>

          {/* Architectural Medina Umbrella & Mihrab Arch Motifs */}
          <div className="absolute bottom-0 right-0 left-0 h-16 pointer-events-none opacity-20 text-emerald-300 overflow-hidden flex justify-between px-2">
            <svg viewBox="0 0 400 50" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full" preserveAspectRatio="none">
              <path d="M 30,50 L 30,25 Q 50,5 70,25 L 70,50" />
              <path d="M 130,50 L 130,25 Q 150,5 170,25 L 170,50" />
              <path d="M 230,50 L 230,25 Q 250,5 270,25 L 270,50" />
              <path d="M 330,50 L 330,25 Q 350,5 370,25 L 370,50" />
              <line x1="0" y1="48" x2="400" y2="48" strokeWidth="1.5" />
            </svg>
          </div>
        </>
      )}

      {/* 2. MASJID AL-HARAM & HOLY KAABA (MAKKAH AL-MUKARRAMAH) */}
      {styleId === 'masjid_haram' && (
        <>
          <div className="absolute inset-0 bg-linear-to-br from-[#0A0B0E] via-[#1A1612] to-[#070709] border border-amber-400/50 rounded-3xl pointer-events-none shadow-[inset_0_0_60px_rgba(245,158,11,0.12)]" />

          {/* Kaaba & Masjid al-Haram Grand Artwork Backdrop */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-35">
            <img
              src="/src/assets/images/kaaba_makkah_art_1790957360864.jpg"
              alt="Masjid al-Haram & Kaaba"
              className="w-full h-full object-cover object-center filter saturate-125"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#0A0B0E] via-[#0A0B0E]/60 to-transparent" />
          </div>

          {/* Golden Kiswah Calligraphy Belt Watermark */}
          <div className="absolute top-2 right-4 pointer-events-none opacity-[0.25] text-amber-200 font-arabic text-xl sm:text-2xl font-bold select-none text-right" dir="rtl">
            المَسْجِدُ الحَرَام · مَكَّةُ المُكَرَّمَة
          </div>

          {/* Golden Ambient Glow */}
          <div className="absolute top-4 right-8 w-52 h-40 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-2 left-6 w-36 h-28 rounded-full bg-yellow-500/15 blur-2xl pointer-events-none" />
        </>
      )}

      {/* 3. AL-AQSA & DOME OF THE ROCK (JERUSALEM / AL-QUDS) */}
      {styleId === 'masjid_aqsa' && (
        <>
          <div className="absolute inset-0 bg-linear-to-br from-[#091428] via-[#122B4D] to-[#070E1C] border border-amber-400/45 rounded-3xl pointer-events-none shadow-[inset_0_0_60px_rgba(245,158,11,0.1)]" />

          {/* Al-Aqsa & Golden Dome Artwork Backdrop */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-40">
            <img
              src="/src/assets/images/masjid_aqsa_art_1792513345392.jpg"
              alt="Al-Aqsa Mosque & Dome of the Rock"
              className="w-full h-full object-cover object-center filter saturate-130"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#091428] via-[#091428]/60 to-transparent" />
          </div>

          {/* Golden Dome Radiation & Azure Twilight Glow */}
          <div className="absolute top-2 right-12 w-52 h-44 rounded-full bg-amber-400/25 blur-3xl pointer-events-none" />
          <div className="absolute top-6 left-12 w-36 h-36 rounded-full bg-sky-500/15 blur-2xl pointer-events-none" />

          {/* Calligraphy Watermark: المسجد الأقصى المبارك */}
          <div className="absolute top-2 right-4 pointer-events-none opacity-[0.28] text-amber-200 font-arabic text-xl sm:text-2xl font-bold select-none text-right" dir="rtl">
            المَسْجِدُ الأَقْصَى المُبَارَك · القُدْس
          </div>
        </>
      )}

      {/* 4. SHEIKH ZAYED GRAND MOSQUE (ABU DHABI) */}
      {styleId === 'sheikh_zayed' && (
        <>
          <div className="absolute inset-0 bg-linear-to-br from-[#0D1226] via-[#1A2246] to-[#0A0D1E] border border-indigo-300/40 rounded-3xl pointer-events-none shadow-[inset_0_0_60px_rgba(167,139,250,0.1)]" />

          {/* Sheikh Zayed Reflective Pool Artwork Backdrop */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-40">
            <img
              src="/src/assets/images/sheikh_zayed_art_1792513359645.jpg"
              alt="Sheikh Zayed Grand Mosque Abu Dhabi"
              className="w-full h-full object-cover object-center filter saturate-125"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#0D1226] via-[#0D1226]/50 to-transparent" />
          </div>

          {/* Lavender Moonlight & Amber Window Glow */}
          <div className="absolute top-4 right-10 w-48 h-40 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-4 left-8 w-44 h-32 rounded-full bg-amber-300/15 blur-2xl pointer-events-none" />

          {/* Calligraphy Watermark: جامع الشيخ زايد الكبير */}
          <div className="absolute top-2 right-4 pointer-events-none opacity-[0.25] text-indigo-100 font-arabic text-xl sm:text-2xl font-bold select-none text-right" dir="rtl">
            جَامِعُ الشَّيْخ زَايِد الكَبِير · أَبُو ظَبْي
          </div>
        </>
      )}

      {/* 5. SULTAN AHMED BLUE MOSQUE (ISTANBUL, TURKEY) */}
      {styleId === 'blue_mosque_istanbul' && (
        <>
          <div className="absolute inset-0 bg-linear-to-br from-[#061530] via-[#102C5A] to-[#040E20] border border-sky-400/40 rounded-3xl pointer-events-none shadow-[inset_0_0_60px_rgba(56,189,248,0.1)]" />

          {/* Blue Mosque Ottoman Cascading Domes Artwork Backdrop */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-40">
            <img
              src="/src/assets/images/blue_mosque_art_1792513374990.jpg"
              alt="Sultan Ahmed Blue Mosque Istanbul"
              className="w-full h-full object-cover object-center filter saturate-130"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#061530] via-[#061530]/60 to-transparent" />
          </div>

          {/* Deep Iznik Cobalt & Golden Sunset Ambient Glow */}
          <div className="absolute top-4 right-8 w-52 h-40 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />
          <div className="absolute top-10 left-10 w-36 h-28 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />

          {/* Calligraphy Watermark: جامع السلطان أحمد */}
          <div className="absolute top-2 right-4 pointer-events-none opacity-[0.25] text-sky-200 font-arabic text-xl sm:text-2xl font-bold select-none text-right" dir="rtl">
            جَامِعُ السُّلْطَان أَحْمَد · إِسْطَنْبُول
          </div>
        </>
      )}

      {/* 6. BAITUL MUKARRAM NATIONAL MOSQUE (DHAKA, BANGLADESH) */}
      {styleId === 'baitul_mukarram' && (
        <>
          <div className="absolute inset-0 bg-linear-to-br from-[#081C16] via-[#143B2F] to-[#061510] border border-emerald-400/45 rounded-3xl pointer-events-none shadow-[inset_0_0_60px_rgba(52,211,153,0.1)]" />

          {/* Baitul Mukarram National Mosque Artwork Backdrop */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-45">
            <img
              src="/src/assets/images/baitul_mukarram_art_1792513393050.jpg"
              alt="Baitul Mukarram National Mosque Dhaka"
              className="w-full h-full object-cover object-center filter saturate-125"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#081C16] via-[#081C16]/60 to-transparent" />
          </div>

          {/* Bengal Emerald & Golden Portal Glow */}
          <div className="absolute top-4 right-10 w-52 h-40 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-4 left-6 w-40 h-32 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />

          {/* Calligraphy Watermark: بيت المكرم المسجد الوطني */}
          <div className="absolute top-2 right-4 pointer-events-none opacity-[0.25] text-emerald-200 font-arabic text-xl sm:text-2xl font-bold select-none text-right" dir="rtl">
            بَيْتُ المُكَرَّمِ المَسْجِدُ الوَطَنِيّ · دَاكَا
          </div>
        </>
      )}

      {/* 7. SHAH FAISAL MOSQUE (ISLAMABAD, PAKISTAN) */}
      {styleId === 'faisal_mosque' && (
        <>
          <div className="absolute inset-0 bg-linear-to-br from-[#091326] via-[#142646] to-[#070E1C] border border-slate-300/40 rounded-3xl pointer-events-none shadow-[inset_0_0_60px_rgba(203,213,225,0.08)]" />

          {/* Geometric Bedouin Tent Inspired Lines & White Minarets Silhouette */}
          <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center text-slate-100">
            <svg viewBox="0 0 400 240" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
              {/* Central Tent Structure */}
              <polygon points="200,60 130,170 270,170" strokeWidth="2" />
              <polygon points="200,60 160,170 240,170" strokeWidth="1" strokeDasharray="4 2" />
              <line x1="200" y1="60" x2="200" y2="170" strokeWidth="1" />
              {/* Four Soaring Turkish-style Sharp Minarets */}
              <line x1="90" y1="20" x2="90" y2="180" strokeWidth="2.5" />
              <polygon points="90,15 87,25 93,25" fill="currentColor" />
              <line x1="310" y1="20" x2="310" y2="180" strokeWidth="2.5" />
              <polygon points="310,15 307,25 313,25" fill="currentColor" />
              <line x1="50" y1="40" x2="50" y2="190" strokeWidth="1.8" />
              <line x1="350" y1="40" x2="350" y2="190" strokeWidth="1.8" />
            </svg>
          </div>

          {/* Moonlight Silver Glow */}
          <div className="absolute top-4 right-10 w-48 h-40 rounded-full bg-slate-200/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-2 left-6 w-36 h-28 rounded-full bg-blue-400/15 blur-2xl pointer-events-none" />

          {/* Calligraphy Watermark: مسجد الملك فيصل */}
          <div className="absolute top-2 right-4 pointer-events-none opacity-[0.25] text-slate-200 font-arabic text-xl sm:text-2xl font-bold select-none text-right" dir="rtl">
            مَسْجِدُ المَلِكِ فَيْصَل · إِسْلَام أَبَاد
          </div>
        </>
      )}

      {/* 8. BADSHAHI MOSQUE (LAHORE) */}
      {styleId === 'badshahi_mosque' && (
        <>
          <div className="absolute inset-0 bg-linear-to-br from-[#260C0C] via-[#4A1616] to-[#1F0808] border border-rose-400/40 rounded-3xl pointer-events-none shadow-[inset_0_0_60px_rgba(251,113,133,0.1)]" />

          {/* Mughal Red Sandstone Grand Arches & Triple Marble Onion Domes Silhouette */}
          <div className="absolute inset-0 pointer-events-none opacity-25 flex items-center justify-center text-rose-200">
            <svg viewBox="0 0 400 240" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
              {/* Grand Central Onion Dome */}
              <path d="M 200,60 Q 180,90 170,115 Q 165,135 200,135 Q 235,135 230,115 Q 220,90 200,60 Z" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
              <line x1="200" y1="45" x2="200" y2="60" strokeWidth="2" />
              {/* Flanking Side Onion Domes */}
              <path d="M 130,85 Q 115,110 110,125 Q 105,140 130,140 Q 155,140 150,125 Q 145,110 130,85 Z" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
              <path d="M 270,85 Q 255,110 250,125 Q 245,140 270,140 Q 295,140 290,125 Q 285,110 270,85 Z" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
              {/* Grand Mughal Cusped Archway */}
              <path d="M 150,190 L 150,150 Q 165,135 200,125 Q 235,135 250,150 L 250,190" strokeWidth="2" />
              {/* Flanking Octagonal Minarets */}
              <rect x="50" y="40" width="16" height="150" strokeWidth="1.5" />
              <polygon points="50,40 58,25 66,40" fill="currentColor" />
              <rect x="334" y="40" width="16" height="150" strokeWidth="1.5" />
              <polygon points="334,40 342,25 350,40" fill="currentColor" />
            </svg>
          </div>

          {/* Mughal Sandstone Amber & Pearl Glow */}
          <div className="absolute top-4 right-10 w-48 h-40 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-4 left-8 w-40 h-32 rounded-full bg-rose-500/20 blur-2xl pointer-events-none" />

          {/* Calligraphy Watermark: مسجد پادشاہی */}
          <div className="absolute top-2 right-4 pointer-events-none opacity-[0.25] text-rose-200 font-arabic text-xl sm:text-2xl font-bold select-none text-right" dir="rtl">
            مَسْجِدُ بَادْشَاهِي · لَاهُور
          </div>
        </>
      )}

      {/* 9. CLASSIC TEAL & MOSQUE (ORIGINAL PRESERVED) */}
      {styleId === 'classic_teal' && (
        <>
          <div className="absolute inset-0 bg-linear-to-br from-[#083B40] via-[#0A444A] to-[#042629] border border-[#13545A] rounded-3xl pointer-events-none" />
          
          {/* Night-Sky Dot Pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(rgba(185, 226, 221, 0.45) 0.75px, transparent 0.75px), radial-gradient(rgba(233, 183, 195, 0.3) 0.75px, transparent 0.75px)',
              backgroundSize: '28px 28px',
              backgroundPosition: '0 0, 14px 14px',
            }}
          />

          {/* Mosque Silhouette in center */}
          <img
            src="/src/assets/images/islamic_hero_mosque_1790957336258.jpg"
            alt="Islamic Mosque Silhouette"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.08] mix-blend-overlay pointer-events-none"
          />

          {/* 8-Point Islamic Geometric Star Pattern - Top-Right */}
          <div className="absolute -top-6 -right-6 w-32 h-32 pointer-events-none opacity-[0.14] text-[#B9E2DD]">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-full h-full">
              <polygon points="50,5 63,37 95,50 63,63 50,95 37,63 5,50 37,37" />
              <polygon points="50,15 60,40 85,50 60,60 50,85 40,60 15,50 40,40" strokeDasharray="2 2" />
              <circle cx="50" cy="50" r="16" />
              <circle cx="50" cy="50" r="32" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* 8-Point Islamic Geometric Star Pattern - Bottom-Left */}
          <div className="absolute -bottom-8 -left-8 w-36 h-36 pointer-events-none opacity-[0.10] text-[#B9E2DD]">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-full h-full">
              <polygon points="50,5 63,37 95,50 63,63 50,95 37,63 5,50 37,37" />
              <circle cx="50" cy="50" r="22" strokeDasharray="3 3" />
              <rect x="25" y="25" width="50" height="50" strokeWidth="0.8" transform="rotate(45 50 50)" />
            </svg>
          </div>

          {/* Pointed arches arcade */}
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none opacity-[0.08] text-[#B9E2DD] overflow-hidden flex justify-around">
            <svg viewBox="0 0 400 60" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full" preserveAspectRatio="none">
              <path d="M 0,60 L 0,35 Q 25,10 50,0 Q 75,10 100,35 L 100,60" />
              <path d="M 100,60 L 100,35 Q 125,10 150,0 Q 175,10 200,35 L 200,60" />
              <path d="M 200,60 L 200,35 Q 225,10 250,0 Q 275,10 300,35 L 300,60" />
              <path d="M 300,60 L 300,35 Q 325,10 350,0 Q 375,10 400,35 L 400,60" />
              <line x1="0" y1="58" x2="400" y2="58" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Rose quartz glow */}
          <div className="absolute top-8 right-4 w-44 h-36 rounded-full bg-[#E9B7C3]/15 blur-2xl pointer-events-none" />
        </>
      )}

      {/* STYLE 2: THULUTH GOLD CALLIGRAPHY & MANUSCRIPT (NEW CALLIGRAPHY STYLE) */}
      {styleId === 'thuluth_gold_calligraphy' && (
        <>
          <div className="absolute inset-0 bg-linear-to-br from-[#0A0A0F] via-[#15121D] to-[#07060B] border border-amber-400/40 rounded-3xl pointer-events-none shadow-[inset_0_0_60px_rgba(245,158,11,0.08)]" />

          {/* Illuminated Quranic Manuscript Calligraphy Artwork in Background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.16] flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 400 240" fill="none" className="w-full h-full text-amber-300">
              {/* Grand Thuluth Bismillah & Noor Ayah Calligraphic curves */}
              <path
                d="M 50,110 Q 90,40 140,85 Q 180,120 220,70 Q 260,30 310,65 Q 350,90 380,80"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 40,140 Q 110,180 180,140 Q 250,90 320,150 Q 360,180 390,140"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 120,60 Q 150,130 190,60 Q 220,130 260,60"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* Diacritics and calligraphic vocalization marks */}
              <circle cx="165" cy="50" r="3" fill="currentColor" />
              <circle cx="235" cy="45" r="3" fill="currentColor" />
              <polygon points="140,40 148,32 152,44" fill="currentColor" />
              <polygon points="270,45 278,37 282,49" fill="currentColor" />
              <path d="M 90,80 Q 98,72 105,82" stroke="currentColor" strokeWidth="1.5" />
              <path d="M 330,90 Q 338,82 345,92" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Arabic Calligraphy Watermark Text: بسم الله الرحمن الرحيم */}
          <div className="absolute top-2 right-4 pointer-events-none opacity-[0.22] text-amber-200 font-arabic text-2xl font-bold select-none text-right" dir="rtl">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </div>

          {/* Islamic Illuminated Manuscript Border Frame */}
          <div className="absolute inset-2 pointer-events-none rounded-2xl border border-amber-400/20" />
          <div className="absolute top-3 left-3 w-8 h-8 pointer-events-none text-amber-300 opacity-40">
            <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M 0,0 L 20,0 Q 20,20 0,20 Z" />
              <circle cx="8" cy="8" r="3" />
            </svg>
          </div>
          <div className="absolute top-3 right-3 w-8 h-8 pointer-events-none text-amber-300 opacity-40">
            <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M 30,0 L 10,0 Q 10,20 30,20 Z" />
              <circle cx="22" cy="8" r="3" />
            </svg>
          </div>

          {/* Warm Golden Parchment Core Glow */}
          <div className="absolute top-8 right-6 w-52 h-44 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
        </>
      )}

      {/* STYLE 3: KAABA KISWAH BLACK SILK & GOLD EMBROIDERY (NEW KAABA STYLE) */}
      {styleId === 'kaaba_kiswah' && (
        <>
          <div className="absolute inset-0 bg-linear-to-br from-[#090A0D] via-[#121318] to-[#060608] border border-yellow-500/40 rounded-3xl pointer-events-none shadow-[inset_0_0_60px_rgba(234,179,8,0.08)]" />

          {/* Kiswah Diagonal Islamic Calligraphic Jacquard Weave */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.14]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(234, 179, 8, 0.25) 0px, rgba(234, 179, 8, 0.25) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(-45deg, rgba(234, 179, 8, 0.15) 0px, rgba(234, 179, 8, 0.15) 1px, transparent 1px, transparent 20px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Kaaba Golden Hizam (Belt) Inscribed Ribbon at Top Background */}
          <div className="absolute top-0 left-0 right-0 h-10 pointer-events-none opacity-25 overflow-hidden flex items-center justify-center border-b border-yellow-500/30">
            <div className="text-yellow-300 font-arabic text-sm tracking-widest uppercase font-bold whitespace-nowrap">
              لا إِلٰهَ إِلَّا اللهُ مُحَمَّدٌ رَسُولُ اللهِ · سُبْحَانَ اللهِ وَبِحَمْدِهِ سُبْحَانَ اللهِ الْعَظِيمِ
            </div>
          </div>

          {/* Kaaba Door Golden Medallion / Lock Outline in Bottom-Right */}
          <div className="absolute -bottom-6 -right-6 w-36 h-36 pointer-events-none opacity-20 text-yellow-300">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="20" y="20" width="60" height="60" rx="8" />
              <rect x="28" y="28" width="44" height="44" rx="4" strokeDasharray="3 2" />
              <circle cx="50" cy="50" r="14" />
              <polygon points="50,38 53,46 62,50 53,54 50,62 47,54 38,50 47,46" fill="currentColor" opacity="0.7" />
            </svg>
          </div>

          {/* Gold Foil Glow */}
          <div className="absolute top-10 right-8 w-44 h-36 rounded-full bg-yellow-500/15 blur-3xl pointer-events-none" />
        </>
      )}

      {/* STYLE 4: SUNSET DUSK & HORIZON (WARM MAGHRIB DUSK) */}
      {styleId === 'sunset_dusk' && (
        <>
          <div className="absolute inset-0 bg-linear-to-br from-[#1C0E2B] via-[#431B39] via-[#66233B] to-[#2B0E1F] border border-rose-500/40 rounded-3xl pointer-events-none shadow-[inset_0_0_60px_rgba(244,63,94,0.08)]" />

          {/* Sun Disc Rising/Setting at Horizon with Amber Glow */}
          <div className="absolute top-10 right-8 w-36 h-36 rounded-full bg-linear-to-t from-amber-400/40 via-rose-400/25 to-transparent blur-xl pointer-events-none" />
          <div className="absolute top-12 right-12 w-20 h-20 rounded-full bg-linear-to-tr from-amber-300/30 to-rose-400/20 border border-amber-300/30 pointer-events-none opacity-60" />

          {/* Dusk Horizon Line & Silhouette Minarets */}
          <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none opacity-20 text-amber-200 overflow-hidden">
            <svg viewBox="0 0 400 70" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-full h-full" preserveAspectRatio="none">
              <path
                d="M 0,70 L 0,55 Q 30,45 60,55 L 70,55 L 70,30 L 74,18 L 78,30 L 78,55 L 110,55 Q 130,40 150,55 L 200,55 L 205,25 L 210,12 L 215,25 L 220,55 L 250,55 Q 275,38 300,55 L 340,55 L 345,35 L 350,22 L 355,35 L 360,55 L 400,55 L 400,70 Z"
                fill="currentColor"
              />
              <line x1="0" y1="56" x2="400" y2="56" stroke="rgba(251, 146, 60, 0.6)" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Dusky Stardust Particles in Upper Violet Sky */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(rgba(254, 215, 170, 0.7) 0.75px, transparent 0.75px), radial-gradient(rgba(251, 113, 133, 0.5) 0.75px, transparent 0.75px)',
              backgroundSize: '26px 26px',
              backgroundPosition: '0 0, 13px 13px',
            }}
          />
        </>
      )}

      {/* STYLE 5: MODERN FROSTED GLASS & EMERALD GLOW */}
      {styleId === 'modern_glass' && (
        <>
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl border border-emerald-500/40 rounded-3xl pointer-events-none shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_0_40px_rgba(16,185,129,0.06)]" />

          {/* Futuristic Isometric Islamic Geometry Pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(30deg, #10B981 12%, transparent 12.5%, transparent 87%, #10B981 87.5%, #10B981), linear-gradient(150deg, #10B981 12%, transparent 12.5%, transparent 87%, #10B981 87.5%, #10B981), linear-gradient(30deg, #10B981 12%, transparent 12.5%, transparent 87%, #10B981 87.5%, #10B981), linear-gradient(150deg, #10B981 12%, transparent 12.5%, transparent 87%, #10B981 87.5%, #10B981)',
              backgroundSize: '40px 70px',
              backgroundPosition: '0 0, 0 0, 20px 35px, 20px 35px',
            }}
          />

          {/* Ambient Neon Emerald Diffuse Backlight */}
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-teal-500/15 blur-2xl pointer-events-none" />

          {/* Minimal Modern Diamond Compass Corner Accent */}
          <div className="absolute top-4 right-4 w-10 h-10 pointer-events-none opacity-25 text-emerald-400">
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="10" y="10" width="20" height="20" transform="rotate(45 20 20)" strokeWidth="1.2" />
              <circle cx="20" cy="20" r="3" fill="currentColor" />
            </svg>
          </div>
        </>
      )}

      {/* STYLE 6: CELESTIAL MIDNIGHT & STARRY DOME */}
      {styleId === 'celestial_night' && (
        <>
          <div className="absolute inset-0 bg-linear-to-br from-[#040714] via-[#091432] to-[#030612] border border-cyan-500/35 rounded-3xl pointer-events-none shadow-[inset_0_0_60px_rgba(6,182,212,0.06)]" />

          {/* Celestial Stars array */}
          <div
            className="absolute inset-0 pointer-events-none opacity-35"
            style={{
              backgroundImage:
                'radial-gradient(rgba(255, 255, 255, 0.9) 0.8px, transparent 0.8px), radial-gradient(rgba(103, 232, 249, 0.7) 1px, transparent 1px), radial-gradient(rgba(192, 132, 252, 0.5) 0.75px, transparent 0.75px)',
              backgroundSize: '36px 36px, 52px 52px, 24px 24px',
              backgroundPosition: '0 0, 18px 18px, 9px 9px',
            }}
          />

          {/* Astrolabe Circular Ring Motif in Background */}
          <div className="absolute -top-12 -right-12 w-64 h-64 pointer-events-none opacity-20 text-cyan-300">
            <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="100" cy="100" r="90" strokeWidth="1.2" />
              <circle cx="100" cy="100" r="82" strokeDasharray="2 3" />
              <circle cx="100" cy="100" r="68" strokeWidth="0.8" />
              <circle cx="100" cy="100" r="48" strokeDasharray="3 3" />
              <circle cx="100" cy="100" r="28" strokeWidth="1" />
              <line x1="10" y1="100" x2="190" y2="100" strokeWidth="0.8" />
              <line x1="100" y1="10" x2="100" y2="190" strokeWidth="0.8" />
              <polygon points="100,10 104,25 100,22 96,25" fill="currentColor" />
            </svg>
          </div>

          {/* Luminous Crescent Moon (Hilal) in top center/right */}
          <div className="absolute top-5 right-20 w-8 h-8 pointer-events-none opacity-60 text-cyan-200">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
            </svg>
            <div className="absolute inset-0 rounded-full bg-cyan-400/40 blur-sm pointer-events-none" />
          </div>

          {/* Nebular Cyan Glow */}
          <div className="absolute top-10 right-8 w-44 h-36 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        </>
      )}

      {/* STYLE 7: KUFIC GEOMETRIC CALLIGRAPHY & INDIGO MOSAIC (NEW KUFIC STYLE) */}
      {styleId === 'kufic_indigo_mosaic' && (
        <>
          <div className="absolute inset-0 bg-linear-to-br from-[#08122E] via-[#0E1E4C] to-[#060D20] border border-cyan-400/35 rounded-3xl pointer-events-none shadow-[inset_0_0_60px_rgba(34,211,238,0.06)]" />

          {/* Geometric Square Kufic Calligraphy Medallion in Background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.14] flex items-center justify-center text-cyan-300">
            <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-56 h-56">
              {/* Outer square Kufic knot */}
              <rect x="20" y="20" width="160" height="160" rx="4" strokeWidth="1.5" />
              <rect x="35" y="35" width="130" height="130" strokeWidth="1" strokeDasharray="3 3" />
              {/* Square Kufic geometric letters labyrinth */}
              <path d="M 50,50 L 150,50 L 150,150 L 50,150 Z" strokeWidth="1.5" />
              <path d="M 70,70 L 130,70 L 130,130 L 70,130 Z" strokeWidth="1.2" />
              <line x1="50" y1="100" x2="70" y2="100" strokeWidth="2" />
              <line x1="130" y1="100" x2="150" y2="100" strokeWidth="2" />
              <line x1="100" y1="50" x2="100" y2="70" strokeWidth="2" />
              <line x1="100" y1="130" x2="100" y2="150" strokeWidth="2" />
              <circle cx="100" cy="100" r="10" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Kufic Islamic Diamond Corners */}
          <div className="absolute top-3 left-3 w-8 h-8 pointer-events-none opacity-30 text-cyan-300">
            <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="5" y="5" width="20" height="20" transform="rotate(45 15 15)" />
            </svg>
          </div>
          <div className="absolute top-3 right-3 w-8 h-8 pointer-events-none opacity-30 text-cyan-300">
            <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="5" y="5" width="20" height="20" transform="rotate(45 15 15)" />
            </svg>
          </div>

          {/* Deep Indigo/Cyan Core Glow */}
          <div className="absolute top-8 right-8 w-48 h-40 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />
        </>
      )}

      {/* STYLE 8: DESERT DUNES & FAJR DAWN (NEW PEACEFUL DESERT STYLE) */}
      {styleId === 'desert_fajr_dunes' && (
        <>
          <div className="absolute inset-0 bg-linear-to-br from-[#16101D] via-[#2F1B28] to-[#1C1210] border border-orange-500/35 rounded-3xl pointer-events-none shadow-[inset_0_0_60px_rgba(249,115,22,0.06)]" />

          {/* Rolling Sand Dune Contours at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none opacity-30 text-orange-200 overflow-hidden">
            <svg viewBox="0 0 400 90" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full" preserveAspectRatio="none">
              <path
                d="M 0,90 Q 70,40 160,65 Q 260,90 400,35 L 400,90 Z"
                fill="rgba(249, 115, 22, 0.15)"
              />
              <path
                d="M 0,90 Q 120,60 220,75 Q 320,90 400,55 L 400,90 Z"
                fill="rgba(234, 88, 12, 0.2)"
              />
              <path
                d="M 0,90 Q 180,30 310,70 L 400,75 L 400,90 Z"
                fill="rgba(194, 65, 12, 0.25)"
              />
            </svg>
          </div>

          {/* Peaceful Crescent Moon in Dawn Desert Sky */}
          <div className="absolute top-6 right-8 w-10 h-10 pointer-events-none opacity-70 text-orange-200">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
            </svg>
            <div className="absolute inset-0 rounded-full bg-orange-400/30 blur-md pointer-events-none" />
          </div>

          {/* Dawn Amber Warm Glow */}
          <div className="absolute top-10 right-10 w-44 h-36 rounded-full bg-orange-400/15 blur-3xl pointer-events-none" />
        </>
      )}

      {/* =========================================================================
          CONTENT LAYER - RICH & ACCESSIBLE
          ========================================================================= */}
      <div className="relative z-10 space-y-3.5">
        {/* Top Status & Style Badge Row */}
        <div className="flex items-center justify-between gap-2 min-h-[30px]">
          {/* Left: Waqt badge & Friday badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border backdrop-blur-xs transition-colors ${
                styleId === 'classic_teal'
                  ? 'bg-[#B9E2DD]/20 text-[#B9E2DD] border-[#B9E2DD]/40'
                  : styleId === 'thuluth_gold_calligraphy'
                  ? 'bg-amber-400/20 text-[#FDE047] border-amber-400/40'
                  : styleId === 'kaaba_kiswah'
                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                  : styleId === 'sunset_dusk'
                  ? 'bg-rose-500/20 text-rose-200 border-rose-500/40'
                  : styleId === 'modern_glass'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : styleId === 'celestial_night'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : styleId === 'kufic_indigo_mosaic'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-orange-500/20 text-orange-200 border-orange-500/40'
              }`}
            >
              {waqtStatus.isProhibited ? t.prohibitedTime : t.currentWaqt}
            </span>

            {isFriday && (
              <span className="px-2 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-bold border border-white/30 backdrop-blur-xs">
                {language === 'bn' ? "🕌 পবিত্র জুমু'আ" : '🕌 Blessed Friday'}
              </span>
            )}

            {/* Daily Prayer Consistency Tracker Indicator */}
            <span
              className="px-2 py-0.5 rounded-full bg-black/40 text-white text-[10px] font-bold border border-white/20 backdrop-blur-xs flex items-center gap-1 shadow-xs"
              title={
                language === 'bn'
                  ? 'আজকের ৫ ওয়াক্ত সালাত সম্পন্ন করার অগ্রগতি'
                  : "Today's 5 daily prayers progress"
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  completedCount === 5
                    ? 'bg-emerald-400 animate-pulse'
                    : completedCount > 0
                    ? 'bg-amber-300'
                    : 'bg-slate-400'
                }`}
              />
              <span>
                {language === 'bn'
                  ? `সালাত: ${toBn(completedCount)}/৫ (${toBn(Math.round((completedCount / 5) * 100))}%)`
                  : `Prayers: ${completedCount}/5 (${Math.round((completedCount / 5) * 100)}%)`}
              </span>
            </span>
          </div>

          {/* Right: Style Badge - visible initially, vanishes, appears on tap for 2s, then vanishes */}
          <div
            className={`transition-all duration-300 ${
              showIndicator
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md transition-all cursor-pointer shadow-md bg-white text-slate-900 border-white hover:bg-white/90"
              title={language === 'bn' ? 'ট্যাপ করে ডিজাইন পরিবর্তন করুন' : 'Tap to change style'}
            >
              <Palette className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'bn' ? currentStyleMeta.badge : currentStyleMeta.badgeEn}</span>
            </button>
          </div>
        </div>

        {/* Current Waqt Title, Next Waqt & Countdown */}
        <div className="flex items-baseline justify-between pt-0.5">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-xs">
              {getWaqtName(waqtStatus.currentWaqt)}
            </h2>
            {waqtStatus.isProhibited ? (
              <p className="text-xs text-rose-300 font-medium flex items-center gap-1 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {waqtStatus.prohibitedReason}
              </p>
            ) : (
              <p className="text-xs text-white/80 font-medium mt-0.5">
                {t.nextPrayer}:{' '}
                <strong className="text-white font-semibold">
                  {getWaqtName(waqtStatus.nextWaqt)} ({formatPrayerTime12h(waqtStatus.nextWaqtTime, language)})
                </strong>
              </p>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10.5px] text-white/75 block leading-tight">
              {t.timeRemaining}
            </span>
            <span
              className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight transition-opacity duration-200 block ${
                styleId === 'classic_teal'
                  ? 'text-[#B9E2DD]'
                  : styleId === 'thuluth_gold_calligraphy'
                  ? 'text-[#FDE047] drop-shadow-[0_2px_12px_rgba(253,224,71,0.5)]'
                  : styleId === 'kaaba_kiswah'
                  ? 'text-yellow-300 drop-shadow-[0_2px_10px_rgba(253,224,71,0.4)]'
                  : styleId === 'sunset_dusk'
                  ? 'text-[#FDBA74] drop-shadow-[0_2px_10px_rgba(251,146,60,0.4)]'
                  : styleId === 'modern_glass'
                  ? 'text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                  : styleId === 'celestial_night'
                  ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.5)]'
                  : styleId === 'kufic_indigo_mosaic'
                  ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.5)]'
                  : 'text-orange-200 drop-shadow-[0_2px_8px_rgba(254,215,170,0.4)]'
              }`}
            >
              {waqtStatus.formattedRemaining}
            </span>
          </div>
        </div>

        {/* Linear Progress Bar customized per theme */}
        <div className="space-y-1 pt-0.5">
          <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/15">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                styleId === 'classic_teal'
                  ? 'bg-[#B9E2DD]'
                  : styleId === 'thuluth_gold_calligraphy'
                  ? 'bg-linear-to-r from-amber-600 via-amber-400 to-yellow-200'
                  : styleId === 'kaaba_kiswah'
                  ? 'bg-linear-to-r from-yellow-700 via-yellow-400 to-amber-200'
                  : styleId === 'sunset_dusk'
                  ? 'bg-linear-to-r from-rose-500 via-orange-400 to-amber-300'
                  : styleId === 'modern_glass'
                  ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]'
                  : styleId === 'celestial_night'
                  ? 'bg-linear-to-r from-blue-500 via-cyan-400 to-teal-300'
                  : styleId === 'kufic_indigo_mosaic'
                  ? 'bg-linear-to-r from-indigo-500 via-blue-400 to-cyan-300'
                  : 'bg-linear-to-r from-rose-600 via-orange-400 to-amber-200'
              }`}
              style={{ width: `${waqtStatus.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/80">
            <span>{language === 'bn' ? 'ওয়াক্ত শুরু' : 'Start'}</span>
            <span>
              {language === 'bn'
                ? `${toBn(waqtStatus.progressPercent)}% অতিবাহিত`
                : `${waqtStatus.progressPercent}% elapsed`}
            </span>
            <span>{language === 'bn' ? 'ওয়াক্ত শেষ' : 'End'}</span>
          </div>
        </div>

        {/* 4 Small Balanced Cards inside Hero:
            1. সূর্যোদয় (Sunrise)
            2. সূর্যাস্ত (Sunset)
            3. ইফতার (Iftar)
            4. তাহাজ্জুদ (Tahajjud)
        */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-2 border-t border-white/15 text-center">
          {/* 1. সূর্যোদয় */}
          <div
            className={`rounded-xl p-1.5 sm:p-2 border backdrop-blur-xs transition-colors ${
              styleId === 'classic_teal'
                ? 'bg-[#0C454B]/80 border-[#13545A]'
                : styleId === 'thuluth_gold_calligraphy'
                ? 'bg-[#181424]/85 border-amber-400/30'
                : styleId === 'kaaba_kiswah'
                ? 'bg-[#15171E]/85 border-yellow-500/30'
                : styleId === 'sunset_dusk'
                ? 'bg-[#3D182E]/80 border-rose-500/30'
                : styleId === 'modern_glass'
                ? 'bg-slate-800/80 border-emerald-500/25'
                : styleId === 'celestial_night'
                ? 'bg-[#0B1736]/85 border-cyan-500/25'
                : styleId === 'kufic_indigo_mosaic'
                ? 'bg-[#0F1D42]/85 border-cyan-500/25'
                : 'bg-[#291822]/85 border-orange-500/30'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] text-white/90">
              <Sunrise className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">{t.sunrise}</span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold font-mono tabular-nums mt-0.5 block text-white">
              {formatPrayerTime12h(prayerTimes.sunrise, language)}
            </span>
          </div>

          {/* 2. সূর্যাস্ত (Sunset) */}
          <div
            className={`rounded-xl p-1.5 sm:p-2 border backdrop-blur-xs transition-colors ${
              styleId === 'classic_teal'
                ? 'bg-[#0C454B]/80 border-[#13545A]'
                : styleId === 'thuluth_gold_calligraphy'
                ? 'bg-[#181424]/85 border-amber-400/30 ring-1 ring-amber-400/30'
                : styleId === 'kaaba_kiswah'
                ? 'bg-[#15171E]/85 border-yellow-500/30'
                : styleId === 'sunset_dusk'
                ? 'bg-[#3D182E]/80 border-rose-500/30 ring-1 ring-amber-400/40'
                : styleId === 'modern_glass'
                ? 'bg-slate-800/80 border-emerald-500/25'
                : styleId === 'celestial_night'
                ? 'bg-[#0B1736]/85 border-cyan-500/25'
                : styleId === 'kufic_indigo_mosaic'
                ? 'bg-[#0F1D42]/85 border-cyan-500/25'
                : 'bg-[#291822]/85 border-orange-500/30 ring-1 ring-orange-400/40'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] text-white/90">
              <Sunset className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="truncate">{t.sunset || (language === 'bn' ? 'সূর্যাস্ত' : 'Sunset')}</span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold font-mono tabular-nums mt-0.5 block text-orange-200">
              {formatPrayerTime12h(prayerTimes.sunset, language)}
            </span>
          </div>

          {/* 3. ইফতার */}
          <div
            className={`rounded-xl p-1.5 sm:p-2 border backdrop-blur-xs transition-colors ${
              styleId === 'classic_teal'
                ? 'bg-[#0C454B]/80 border-[#13545A]'
                : styleId === 'thuluth_gold_calligraphy'
                ? 'bg-[#181424]/85 border-amber-400/30'
                : styleId === 'kaaba_kiswah'
                ? 'bg-[#15171E]/85 border-yellow-500/30'
                : styleId === 'sunset_dusk'
                ? 'bg-[#3D182E]/80 border-rose-500/30'
                : styleId === 'modern_glass'
                ? 'bg-slate-800/80 border-emerald-500/25'
                : styleId === 'celestial_night'
                ? 'bg-[#0B1736]/85 border-cyan-500/25'
                : styleId === 'kufic_indigo_mosaic'
                ? 'bg-[#0F1D42]/85 border-cyan-500/25'
                : 'bg-[#291822]/85 border-orange-500/30'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] text-white/90">
              <Utensils className="w-3.5 h-3.5 text-rose-300 shrink-0" />
              <span className="truncate">{t.iftar}</span>
            </div>
            <span
              className={`text-[11px] sm:text-xs font-bold font-mono tabular-nums mt-0.5 block ${
                styleId === 'classic_teal'
                  ? 'text-[#B9E2DD]'
                  : styleId === 'thuluth_gold_calligraphy'
                  ? 'text-[#FDE047]'
                  : styleId === 'kaaba_kiswah'
                  ? 'text-yellow-300'
                  : styleId === 'sunset_dusk'
                  ? 'text-[#FDBA74]'
                  : styleId === 'modern_glass'
                  ? 'text-emerald-300'
                  : styleId === 'celestial_night'
                  ? 'text-cyan-300'
                  : styleId === 'kufic_indigo_mosaic'
                  ? 'text-cyan-300'
                  : 'text-orange-200'
              }`}
            >
              {formatPrayerTime12h(prayerTimes.iftar, language)}
            </span>
          </div>

          {/* 4. তাহাজ্জুদ */}
          <div
            className={`rounded-xl p-1.5 sm:p-2 border backdrop-blur-xs transition-colors ${
              styleId === 'classic_teal'
                ? 'bg-[#0C454B]/80 border-[#13545A]'
                : styleId === 'thuluth_gold_calligraphy'
                ? 'bg-[#181424]/85 border-amber-400/30'
                : styleId === 'kaaba_kiswah'
                ? 'bg-[#15171E]/85 border-yellow-500/30'
                : styleId === 'sunset_dusk'
                ? 'bg-[#3D182E]/80 border-rose-500/30'
                : styleId === 'modern_glass'
                ? 'bg-slate-800/80 border-emerald-500/25'
                : styleId === 'celestial_night'
                ? 'bg-[#0B1736]/85 border-cyan-500/25'
                : styleId === 'kufic_indigo_mosaic'
                ? 'bg-[#0F1D42]/85 border-cyan-500/25'
                : 'bg-[#291822]/85 border-orange-500/30'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] text-white/90">
              <Moon className="w-3.5 h-3.5 text-cyan-200 shrink-0" />
              <span className="truncate">{t.tahajjud}</span>
            </div>
            <div className="mt-0.5">
              <span className="text-[10px] sm:text-[11px] font-bold font-mono tabular-nums block text-white leading-tight">
                {formatPrayerTime12h(prayerTimes.tahajjudStart, language)}
              </span>
              <span className="text-[8.5px] sm:text-[9px] font-mono text-white/70 block leading-tight truncate">
                {language === 'bn' ? 'শেষ: ' : 'Ends: '}{formatPrayerTime12h(prayerTimes.tahajjudEnd, language)}
              </span>
            </div>
          </div>
        </div>

        {/* Subtle tap guidance hint pill at bottom - vanishes after 2-2.5s, appears on tap */}
        <div
          className={`flex items-center justify-between pt-0.5 text-[10px] text-white/75 transition-all duration-300 min-h-[16px] ${
            showIndicator
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-1 pointer-events-none'
          }`}
        >
          <span className="flex items-center gap-1">
            <span>{currentStyleMeta.icon}</span>
            <span>{language === 'bn' ? currentStyleMeta.nameBn : currentStyleMeta.nameEn}</span>
          </span>
          <span className="flex items-center gap-1 text-white/80 group-hover:text-white transition-colors">
            <span>{language === 'bn' ? '👆 ট্যাপে পরবর্তী স্টাইল' : '👆 Tap for next style'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
