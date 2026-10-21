import React, { useState, useEffect, useRef } from 'react';
import { NaflPrayerItem, AppLanguage } from '../types';
import { formatPrayerTime12h } from '../utils/prayerTimes';
import { triggerHaptic } from '../utils/audioPlayer';
import { ChevronRight, Palette, Clock, Sparkles } from 'lucide-react';

export type NaflCardStyleId =
  | 'madinah_tahajjud'
  | 'makkah_ishraq'
  | 'aqsa_night'
  | 'sheikh_zayed_pool'
  | 'blue_mosque_night'
  | 'baitul_mukarram_fajr'
  | 'cordoba_mihrab'
  | 'emerald_mihrab'
  | 'kaaba_kiswah'
  | 'royal_sapphire';

interface NaflCardStyleOption {
  id: NaflCardStyleId;
  nameBn: string;
  nameEn: string;
  badgeBn: string;
  badgeEn: string;
  icon: string;
  gradientClass: string;
  borderClass: string;
  accentColor: string;
  badgeBg: string;
  quoteBg: string;
  bgImage?: string;
  calligraphy?: string;
}

const NAFL_CARD_STYLES: NaflCardStyleOption[] = [
  {
    id: 'madinah_tahajjud',
    nameBn: 'মদিনা তাহাজ্জুদ ও শান্ত রওজা',
    nameEn: 'Madinah Tahajjud Sanctuary',
    badgeBn: '১/১০ মদিনা তাহাজ্জুদ',
    badgeEn: '1/10 Madinah Tahajjud',
    icon: '🌌',
    gradientClass: 'bg-linear-to-br from-[#021814] via-[#052C22] to-[#0A3D30]',
    borderClass: 'border-emerald-400/50',
    accentColor: '#34D399',
    badgeBg: 'bg-emerald-500/25 text-emerald-100 border-emerald-400/40',
    quoteBg: 'bg-black/55 text-emerald-50 border-emerald-400/25',
    bgImage: '/src/assets/images/masjid_nabawi_art_1792513330965.jpg',
    calligraphy: 'وَمِنَ ٱلَّيْلِ فَتَهَجَّدْ بِهِۦ نَافِلَةً لَّكَ',
  },
  {
    id: 'makkah_ishraq',
    nameBn: 'মক্কা শরিফ ইশরাক ও সুবহে সাদিক',
    nameEn: 'Makkah Ishraq Golden Dawn',
    badgeBn: '২/১০ মক্কা ইশরাক',
    badgeEn: '2/10 Makkah Ishraq',
    icon: '🌅',
    gradientClass: 'bg-linear-to-br from-[#140F0A] via-[#2A1E10] to-[#3D290F]',
    borderClass: 'border-amber-400/50',
    accentColor: '#FBBF24',
    badgeBg: 'bg-amber-500/25 text-amber-100 border-amber-400/40',
    quoteBg: 'bg-black/55 text-amber-50 border-amber-400/25',
    bgImage: '/src/assets/images/kaaba_makkah_art_1790957360864.jpg',
    calligraphy: 'وَٱلضُّحَىٰ · وَٱلَّيْلِ إِذَا سَجَىٰ',
  },
  {
    id: 'aqsa_night',
    nameBn: 'আল-আকসা নিশীথ প্রার্থনা',
    nameEn: 'Al-Aqsa Midnight Starlight',
    badgeBn: '৩/১০ আল-আকসা নিশীথ',
    badgeEn: '3/10 Al-Aqsa Night',
    icon: '✨',
    gradientClass: 'bg-linear-to-br from-[#081329] via-[#102447] to-[#163566]',
    borderClass: 'border-sky-400/50',
    accentColor: '#38BDF8',
    badgeBg: 'bg-sky-500/25 text-sky-100 border-sky-400/40',
    quoteBg: 'bg-black/55 text-sky-50 border-sky-400/25',
    bgImage: '/src/assets/images/masjid_aqsa_art_1792513345392.jpg',
    calligraphy: 'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَكُن مِّنَ السَّاجِدِينَ',
  },
  {
    id: 'sheikh_zayed_pool',
    nameBn: 'শেখ জায়েদ স্বচ্ছ জলাশয় ও মার্বেল',
    nameEn: 'Sheikh Zayed Reflecting Pool',
    badgeBn: '৪/১০ শেখ জায়েদ',
    badgeEn: '4/10 Sheikh Zayed',
    icon: '🏛️',
    gradientClass: 'bg-linear-to-br from-[#0B0F24] via-[#171E42] to-[#242D5E]',
    borderClass: 'border-indigo-300/45',
    accentColor: '#A78BFA',
    badgeBg: 'bg-indigo-500/25 text-indigo-100 border-indigo-400/40',
    quoteBg: 'bg-black/55 text-indigo-50 border-indigo-400/25',
    bgImage: '/src/assets/images/sheikh_zayed_art_1792513359645.jpg',
    calligraphy: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
  },
  {
    id: 'blue_mosque_night',
    nameBn: 'ব্লু মসজিদ গভীর রাতের ইবাদত',
    nameEn: 'Blue Mosque Midnight Devotion',
    badgeBn: '৫/১০ ব্লু মসজিদ',
    badgeEn: '5/10 Blue Mosque',
    icon: '🇹🇷',
    gradientClass: 'bg-linear-to-br from-[#06142E] via-[#0D2550] to-[#133875]',
    borderClass: 'border-blue-400/45',
    accentColor: '#60A5FA',
    badgeBg: 'bg-blue-500/25 text-blue-100 border-blue-400/40',
    quoteBg: 'bg-black/55 text-blue-50 border-blue-400/25',
    bgImage: '/src/assets/images/blue_mosque_art_1792513374990.jpg',
    calligraphy: 'وَاسْجُدْ وَاقْتَرِبْ ۩',
  },
  {
    id: 'baitul_mukarram_fajr',
    nameBn: 'বায়তুল মোকাররম ফজরের নূর',
    nameEn: 'Baitul Mukarram Dawn Serenity',
    badgeBn: '৬/১০ বায়তুল মোকাররম',
    badgeEn: '6/10 Baitul Mukarram',
    icon: '🇧🇩',
    gradientClass: 'bg-linear-to-br from-[#081814] via-[#10332B] to-[#1A4C40]',
    borderClass: 'border-teal-400/45',
    accentColor: '#2DD4BF',
    badgeBg: 'bg-teal-500/25 text-teal-100 border-teal-400/40',
    quoteBg: 'bg-black/55 text-teal-50 border-teal-400/25',
    bgImage: '/src/assets/images/baitul_mukarram_art_1792513393050.jpg',
    calligraphy: 'إِنَّ قُرْآنَ الْفَجْرِ كَانَ مَشْهُودًا',
  },
  {
    id: 'cordoba_mihrab',
    nameBn: 'কর্ডোভা লাল-সাদা মেহরাব খিলান',
    nameEn: 'Cordoba Mezquita Night Mihrab',
    badgeBn: '৭/১০ কর্ডোভা মেহরাব',
    badgeEn: '7/10 Cordoba Mezquita',
    icon: '🕌',
    gradientClass: 'bg-linear-to-br from-[#1C0D12] via-[#3B1520] to-[#541E2D]',
    borderClass: 'border-rose-400/45',
    accentColor: '#FB7185',
    badgeBg: 'bg-rose-500/25 text-rose-100 border-rose-400/40',
    quoteBg: 'bg-black/55 text-rose-50 border-rose-400/25',
    calligraphy: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ',
  },
  {
    id: 'emerald_mihrab',
    nameBn: 'স্বর্ণালী মেহরাব জামারুদ',
    nameEn: 'Emerald Mihrab Gold',
    badgeBn: '৮/১০ জামারুদ মেহরাব',
    badgeEn: '8/10 Emerald Mihrab',
    icon: '🌿',
    gradientClass: 'bg-linear-to-br from-[#02211C] via-[#064E3B] to-[#047857]',
    borderClass: 'border-emerald-500/40',
    accentColor: '#FDE047',
    badgeBg: 'bg-emerald-500/25 text-emerald-100 border-emerald-400/40',
    quoteBg: 'bg-black/40 text-emerald-50 border-white/20',
    calligraphy: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
  },
  {
    id: 'kaaba_kiswah',
    nameBn: 'পবিত্র কাবার কিসওয়াহ সিল্ক',
    nameEn: 'Kaaba Kiswah Black Silk',
    badgeBn: '৯/১০ কাবার কিসওয়াহ',
    badgeEn: '9/10 Kaaba Kiswah',
    icon: '🕋',
    gradientClass: 'bg-linear-to-br from-[#0B0D14] via-[#141A29] to-[#1F293D]',
    borderClass: 'border-amber-400/40',
    accentColor: '#FBBF24',
    badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
    quoteBg: 'bg-black/50 text-slate-100 border-white/20',
    calligraphy: 'لَا إِلٰهَ إِلَّا اللهُ مُحَمَّدٌ رَسُولُ اللهِ',
  },
  {
    id: 'royal_sapphire',
    nameBn: 'রাজকীয় সফায়ার ও নীলমনি',
    nameEn: 'Royal Sapphire Night',
    badgeBn: '১০/১০ নীলমনি সফায়ার',
    badgeEn: '10/10 Royal Sapphire',
    icon: '💎',
    gradientClass: 'bg-linear-to-br from-[#071330] via-[#0D2561] to-[#173F94]',
    borderClass: 'border-indigo-400/40',
    accentColor: '#38BDF8',
    badgeBg: 'bg-cyan-500/25 text-cyan-100 border-cyan-400/40',
    quoteBg: 'bg-black/40 text-cyan-50 border-white/20',
    calligraphy: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
  },
];

const NAFL_STYLE_STORAGE_KEY = 'noor_quran_nafl_card_style';

interface NaflHeroCardProps {
  runningNafl: NaflPrayerItem;
  language: AppLanguage;
  onNavigate?: (tab: string) => void;
  compact?: boolean;
}

export const NaflHeroCard: React.FC<NaflHeroCardProps> = ({
  runningNafl,
  language,
  onNavigate,
  compact = false,
}) => {
  const [styleIndex, setStyleIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(NAFL_STYLE_STORAGE_KEY);
      if (saved) {
        const found = NAFL_CARD_STYLES.findIndex((s) => s.id === saved);
        if (found !== -1) return found;
      }
    } catch {
      // fallback
    }
    return 0;
  });

  const [showStyleIndicator, setShowStyleIndicator] = useState<boolean>(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowStyleIndicator(true);
    hideTimerRef.current = setTimeout(() => {
      setShowStyleIndicator(false);
    }, 2200);

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [styleIndex]);

  const handleCycleStyle = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('[data-detail-button]')) {
      return;
    }

    triggerHaptic(20);
    const nextIdx = (styleIndex + 1) % NAFL_CARD_STYLES.length;
    setStyleIndex(nextIdx);
    try {
      localStorage.setItem(NAFL_STYLE_STORAGE_KEY, NAFL_CARD_STYLES[nextIdx].id);
    } catch {
      // ignore
    }
  };

  const activeStyle = NAFL_CARD_STYLES[styleIndex] || NAFL_CARD_STYLES[0];

  const displayName = language === 'bn' ? runningNafl.nameBn : (runningNafl.nameEn || runningNafl.nameBn);
  const displayImportance = language === 'bn' ? runningNafl.importanceBn : (runningNafl.importanceEn || runningNafl.importanceBn);
  const displayRakat = language === 'bn' ? runningNafl.rakatBn : (runningNafl.rakatEn || runningNafl.rakatBn);
  const displayVirtue = language === 'bn' ? runningNafl.virtueBn : (runningNafl.virtueEn || runningNafl.virtueBn);
  const statusBadgeText = language === 'bn' ? 'এখন চলমান নফল নামাজ' : 'Active Voluntary Prayer';
  const remainingText = language === 'bn'
    ? (runningNafl.remainingMinutes ? `বাকি: ${runningNafl.remainingMinutes} মিনিট` : 'চলমান')
    : (runningNafl.remainingMinutes ? `${runningNafl.remainingMinutes} min left` : 'Active');
  const timeWindowLabel = language === 'bn' ? 'ওয়াক্তের সময়সীমা' : 'Time Window';
  const detailButtonText = language === 'bn' ? 'বিস্তারিত' : 'Details';
  const tooltipText = language === 'bn' ? 'কার্ডে ট্যাপ করে নফল নামাজের ডিজাইন পরিবর্তন করুন' : 'Tap card to change prayer card design';

  return (
    <div
      onClick={handleCycleStyle}
      title={tooltipText}
      className={`relative overflow-hidden rounded-3xl ${activeStyle.gradientClass} text-white shadow-lg border ${activeStyle.borderClass} cursor-pointer active:scale-[0.99] transition-all duration-300 group select-none ${
        compact ? 'p-4' : 'p-4.5 sm:p-5'
      }`}
    >
      {/* World-Famous Mosque Night Sanctuary Backdrop */}
      {activeStyle.bgImage && (
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-30 mix-blend-luminosity">
          <img
            src={activeStyle.bgImage}
            alt={activeStyle.nameEn}
            className="w-full h-full object-cover object-center filter saturate-125"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent" />
        </div>
      )}

      {/* Sacred Calligraphy Watermark in top background */}
      {activeStyle.calligraphy && (
        <div
          className="absolute top-2 right-4 pointer-events-none opacity-[0.22] font-arabic text-lg sm:text-xl font-bold select-none text-right"
          style={{ color: activeStyle.accentColor }}
          dir="rtl"
        >
          {activeStyle.calligraphy}
        </div>
      )}

      {/* Cordoba Mezquita Arch Silhouette Overlay */}
      {activeStyle.id === 'cordoba_mihrab' && (
        <div className="absolute inset-0 pointer-events-none opacity-15 flex items-center justify-center text-rose-300">
          <svg viewBox="0 0 300 180" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <path d="M 50,180 L 50,110 A 40,40 0 1,1 110,110 L 110,180" strokeDasharray="6 3" />
            <path d="M 120,180 L 120,110 A 40,40 0 1,1 180,110 L 180,180" strokeDasharray="6 3" />
            <path d="M 190,180 L 190,110 A 40,40 0 1,1 250,110 L 250,180" strokeDasharray="6 3" />
          </svg>
        </div>
      )}

      {/* Decorative Glow Elements */}
      <div
        className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ backgroundColor: activeStyle.accentColor }}
      />
      <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full blur-xl opacity-15 pointer-events-none bg-white" />

      {/* Ephemeral Style Badge on Tap */}
      <div
        className={`absolute top-3 right-3 z-30 transition-all duration-300 pointer-events-none ${
          showStyleIndicator
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-2 scale-95'
        }`}
      >
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-lg backdrop-blur-md border animate-in fade-in zoom-in-95 duration-200"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            borderColor: activeStyle.accentColor,
            color: activeStyle.accentColor,
          }}
        >
          <Palette className="w-3 h-3" />
          <span>{language === 'bn' ? activeStyle.badgeBn : activeStyle.badgeEn}</span>
        </span>
      </div>

      <div className="relative z-10 space-y-3.5">
        {/* Row 1: Status Badge & Remaining Time Pill */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border shadow-xs ${activeStyle.badgeBg}`}
          >
            <span
              className="w-2 h-2 rounded-full animate-ping shrink-0"
              style={{ backgroundColor: activeStyle.accentColor }}
            />
            <span>{statusBadgeText}</span>
          </span>

          <span
            className="text-xs font-mono font-bold px-3 py-1 rounded-full border border-white/20 backdrop-blur-md shadow-xs bg-black/50 text-white"
          >
            {remainingText}
          </span>
        </div>

        {/* Row 2: Prayer Name, Arabic Calligraphy, Importance and Rakats */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-xs">
              {displayName}
            </h3>

            <span
              className="font-uthmani text-base sm:text-lg font-bold px-2.5 py-0.5 rounded-lg bg-black/40 border border-white/20 text-white shadow-xs select-text shrink-0"
              dir="rtl"
            >
              {runningNafl.nameAr}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-100 font-medium">
            <span className="text-white/95">{displayImportance}</span>
            <span className="text-white/40">·</span>
            <span
              className="font-bold px-2 py-0.5 rounded-md bg-white/15 border border-white/20 text-white"
              style={{ color: activeStyle.accentColor }}
            >
              {displayRakat}
            </span>
          </div>
        </div>

        {/* Row 3: Prominent, perfectly-aligned Time Window Bar */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/35 backdrop-blur-md border border-white/15 text-xs text-white">
          <div className="flex items-center gap-1.5 text-slate-200">
            <Clock className="w-3.5 h-3.5" style={{ color: activeStyle.accentColor }} />
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
              {timeWindowLabel}:
            </span>
          </div>
          <span className="font-bold font-mono text-sm tracking-wide text-white">
            {formatPrayerTime12h(runningNafl.startTime, language)} -{' '}
            {formatPrayerTime12h(runningNafl.endTime, language)}
          </span>
        </div>

        {/* Row 4: High-Contrast Virtue Quote & Detail Action */}
        <div
          className={`p-3 rounded-2xl backdrop-blur-md border text-xs flex items-center justify-between gap-3 shadow-sm ${activeStyle.quoteBg}`}
        >
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: activeStyle.accentColor }} />
            <p className="line-clamp-2 italic font-normal text-white leading-relaxed">
              {displayVirtue}
            </p>
          </div>

          <button
            data-detail-button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic(15);
              if (onNavigate) onNavigate('prayer');
            }}
            className="shrink-0 font-bold text-xs flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-xs transition-colors"
          >
            <span>{detailButtonText}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NaflHeroCard;
