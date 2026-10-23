import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MushafPageData,
  MushafPageAyah,
  toBengaliNumber,
  JUZ_LIST,
  getJuzForPage,
  applyAccessibleTajweed,
  fetchMushafPage,
} from '../utils/quranPageManager';
import { stripBismillahPrefix, normalizeQuranArabic, SURAH_LIST } from '../data/quranData';
import { ArabicFontFamily, AppLanguage } from '../types';
import { triggerHaptic } from '../utils/audioPlayer';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Bookmark,
  Share2,
  X,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Search,
  AlertCircle,
  Volume2,
  ScrollText,
  BookOpen,
} from 'lucide-react';

export type MushafEdition = 'standard' | 'tajweed' | 'hafezi_15' | 'nurani_easy';

interface MushafPageViewProps {
  pageData: MushafPageData | null;
  loading: boolean;
  currentPageNumber: number;
  totalPages?: number;
  mushafEdition: MushafEdition;
  selectedFont: ArabicFontFamily;
  showTajweed: boolean;
  colorBlindMode: boolean;
  isPlaying: boolean;
  playingAyahKey: string | null; // e.g. "1_3" (surah_ayah)
  isBookmarked: boolean;
  language?: AppLanguage;
  onPrevPage: () => void;
  onNextPage: () => void;
  onJumpToPage: (page: number) => void;
  onJumpToJuz: (juz: number) => void;
  onJumpToSurah: (surah: number) => void;
  onToggleBookmark: () => void;
  onPlayAyah: (ayah: MushafPageAyah) => void;
  onPlayCurrentPage: () => void;
  onToggleAudioPause: () => void;
  onToggleTajweed: () => void;
  onToggleColorBlind: () => void;
  onChangeEdition: (ed: MushafEdition) => void;
  onChangeFont: (font: ArabicFontFamily) => void;
  isDistractionFree: boolean;
  onToggleDistractionFree: () => void;
  onRetryPage?: () => void;
}

export const MushafPageView: React.FC<MushafPageViewProps> = ({
  pageData,
  loading,
  currentPageNumber,
  totalPages = 604,
  mushafEdition,
  selectedFont,
  showTajweed,
  colorBlindMode,
  isPlaying,
  playingAyahKey,
  isBookmarked,
  language = 'bn',
  onPrevPage,
  onNextPage,
  onJumpToPage,
  onJumpToJuz,
  onJumpToSurah,
  onToggleBookmark,
  onPlayAyah,
  onPlayCurrentPage,
  onToggleAudioPause,
  onToggleTajweed,
  onToggleColorBlind,
  onChangeEdition,
  onChangeFont,
  isDistractionFree,
  onToggleDistractionFree,
  onRetryPage,
}) => {
  // Page Zoom scale (85% to 140%)
  const [zoomScale, setZoomScale] = useState<number>(100);
  // Selected Ayah for Meaning Bottom Sheet
  const [selectedAyahForMeaning, setSelectedAyahForMeaning] = useState<MushafPageAyah | null>(null);
  // Collapsible Tajweed Legend corner badge
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);
  // Jump Modal state: 'none' | 'page' | 'juz' | 'surah'
  const [jumpModalTab, setJumpModalTab] = useState<'none' | 'page' | 'juz' | 'surah'>('none');
  const [pageInputVal, setPageInputVal] = useState<string>(currentPageNumber.toString());

  // Scroll Mode: 'continuous' (Continuous vertical scroll - Quran.com style) vs 'paginated' (Single page flip)
  const [scrollMode, setScrollMode] = useState<'continuous' | 'paginated'>(() => {
    try {
      return (localStorage.getItem('noor_quran_mushaf_scroll_mode') as 'continuous' | 'paginated') || 'continuous';
    } catch {
      return 'continuous';
    }
  });

  // Continuous pages cache and loading states
  const [continuousPages, setContinuousPages] = useState<MushafPageData[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [visiblePage, setVisiblePage] = useState<number>(currentPageNumber);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

  // Touch swipe tracking (for paginated mode)
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Helper to format number based on active language
  const formatNum = (num: number | string) => {
    return language === 'bn' ? toBengaliNumber(num) : num.toString();
  };

  // Sync page input & visiblePage when currentPageNumber changes
  useEffect(() => {
    setPageInputVal(currentPageNumber.toString());
    setVisiblePage(currentPageNumber);
  }, [currentPageNumber]);

  // Sync continuousPages when pageData or currentPageNumber changes
  useEffect(() => {
    if (!pageData) return;

    if (scrollMode === 'continuous') {
      setContinuousPages((prev) => {
        const exists = prev.some((p) => p.pageNumber === pageData.pageNumber);
        if (exists) {
          return prev;
        }

        // If target page is not in loaded array, initialize with this page and pre-load next page
        const initial = [pageData];
        if (pageData.pageNumber < totalPages) {
          fetchMushafPage(pageData.pageNumber + 1)
            .then((nextP) => {
              if (!nextP) return;
              setContinuousPages((curr) => {
                if (curr.some((p) => p.pageNumber === nextP.pageNumber)) return curr;
                return [...curr, nextP].sort((a, b) => a.pageNumber - b.pageNumber);
              });
            })
            .catch(() => {});
        }
        return initial;
      });
    }
  }, [pageData, scrollMode, totalPages]);

  // Load next page in continuous mode
  const handleLoadNextPage = () => {
    if (isLoadingMore || continuousPages.length === 0) return;
    const lastPage = continuousPages[continuousPages.length - 1].pageNumber;
    if (lastPage >= totalPages) return;

    setIsLoadingMore(true);
    fetchMushafPage(lastPage + 1)
      .then((newPage) => {
        if (newPage) {
          setContinuousPages((prev) => {
            if (prev.some((p) => p.pageNumber === newPage.pageNumber)) return prev;
            return [...prev, newPage];
          });
        }
        setIsLoadingMore(false);
      })
      .catch(() => {
        setIsLoadingMore(false);
      });
  };

  // Load previous page in continuous mode
  const handleLoadPrevPage = () => {
    if (isLoadingMore || continuousPages.length === 0) return;
    const firstPage = continuousPages[0].pageNumber;
    if (firstPage <= 1) return;

    setIsLoadingMore(true);
    fetchMushafPage(firstPage - 1)
      .then((prevPage) => {
        if (prevPage) {
          setContinuousPages((prev) => {
            if (prev.some((p) => p.pageNumber === prevPage.pageNumber)) return prev;
            return [prevPage, ...prev];
          });
        }
        setIsLoadingMore(false);
      })
      .catch(() => {
        setIsLoadingMore(false);
      });
  };

  // Toggle Scroll Mode (Continuous vs Paginated)
  const handleToggleScrollMode = (mode: 'continuous' | 'paginated') => {
    triggerHaptic(15);
    setScrollMode(mode);
    try {
      localStorage.setItem('noor_quran_mushaf_scroll_mode', mode);
    } catch {
      // ignore
    }
  };

  // Bottom Sentinel Observer to auto-load next page as user scrolls down
  useEffect(() => {
    if (scrollMode !== 'continuous' || isLoadingMore) return;
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadNextPage();
        }
      },
      {
        rootMargin: '600px 0px 600px 0px',
        threshold: 0.05,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [scrollMode, continuousPages, isLoadingMore]);

  // Active page detection as user scrolls in continuous mode
  useEffect(() => {
    if (scrollMode !== 'continuous' || continuousPages.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            const num = parseInt(entry.target.id.replace('mushaf-page-', ''), 10);
            if (!isNaN(num)) {
              setVisiblePage((prev) => {
                if (prev !== num) {
                  try {
                    localStorage.setItem('noor_quran_last_mushaf_page', num.toString());
                  } catch {
                    // ignore
                  }
                  return num;
                }
                return prev;
              });
            }
          }
        });
      },
      {
        threshold: [0.3, 0.6],
        rootMargin: '-60px 0px -60px 0px',
      }
    );

    continuousPages.forEach((p) => {
      const el = document.getElementById(`mushaf-page-${p.pageNumber}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [scrollMode, continuousPages]);

  // Handle Touch Swipe (Paginated mode)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollMode !== 'paginated') return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (scrollMode !== 'paginated') return;
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
    const diffY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Only swipe if horizontal distance > 55px and vertical distance < 50px
    if (Math.abs(diffX) > 55 && Math.abs(diffY) < 50) {
      if (diffX > 0) {
        // Swiped right -> In Arabic Mushaf, previous page is to the right
        handlePrev();
      } else {
        // Swiped left -> Next page
        handleNext();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handlePrev = () => {
    triggerHaptic(15);
    if (currentPageNumber > 1) onPrevPage();
  };

  const handleNext = () => {
    triggerHaptic(15);
    if (currentPageNumber < totalPages) onNextPage();
  };

  // Font styling helper - Ensuring crystal clear Jobor, Jer and Pesh readability with traditional South Asian Indo-Pak Naskh
  const getArabicFontFamily = () => {
    switch (selectedFont) {
      case 'scheherazade':
        return "'Scheherazade New', 'Noto Naskh Arabic', serif";
      case 'noto-nastaliq':
        return "'Noto Nastaliq Urdu', 'Scheherazade New', serif";
      case 'lateef':
        return "'Lateef', cursive, serif";
      case 'amiri':
      case 'amiri-quran':
        return "'Amiri Quran', 'Amiri', serif";
      case 'noto-naskh':
      default:
        return "'Scheherazade New', 'Noto Naskh Arabic', 'Amiri', sans-serif";
    }
  };

  // Typography settings based on Mushaf edition
  const getEditionTypography = () => {
    switch (mushafEdition) {
      case 'hafezi_15':
        return {
          fontSize: `${Math.round(26 * (zoomScale / 100))}px`,
          lineHeight: '2.85',
          letterSpacing: '0.2px',
        };
      case 'nurani_easy':
        return {
          fontSize: `${Math.round(30 * (zoomScale / 100))}px`,
          lineHeight: '3.15',
          letterSpacing: '0.35px',
        };
      case 'tajweed':
      case 'standard':
      default:
        return {
          fontSize: `${Math.round(27 * (zoomScale / 100))}px`,
          lineHeight: '2.95',
          letterSpacing: '0.25px',
        };
    }
  };

  const editionTypo = getEditionTypography();

  // Helper to render an individual Mushaf Page Card (used in both continuous scroll and paginated flip)
  const renderSingleMushafPage = (pData: MushafPageData, isPaginatedView: boolean) => {
    const pNum = pData.pageNumber;
    const jNum = pData.juzNumber || getJuzForPage(pNum);
    const surahMeta = pData.surahs[0];

    return (
      <div
        key={`mushaf-page-card-${pNum}`}
        id={`mushaf-page-${pNum}`}
        className="relative w-full max-w-[700px] px-2 sm:px-3 cursor-pointer scroll-mt-16"
        onClick={() => {
          onToggleDistractionFree();
        }}
      >
        {/* Outer Neat Geometric Border Frame with Clean Background */}
        <div
          className={`relative rounded-3xl transition-all duration-300 shadow-md border-2 border-[#0F5F62]/35 dark:border-[#2DD4BF]/30 p-1 sm:p-1.5 ${
            colorBlindMode ? 'tajweed-colorblind' : ''
          }`}
          style={{
            backgroundColor: '#FFFFFF',
          }}
        >
          {/* Inner Geometric Double Border Box with Corner Rosettes */}
          <div className="relative p-3 sm:p-5 rounded-[22px] border border-[#0F5F62]/20 dark:border-[#2DD4BF]/25 bg-white dark:bg-[#0B1536] text-[#111827] dark:text-[#F9FAFB] shadow-inner">
            {/* 4 Islamic Geometric Corner Rosette Accents */}
            <span className="absolute top-1.5 left-2 text-[10px] text-[#0F5F62]/40 dark:text-[#2DD4BF]/40 select-none pointer-events-none">❖</span>
            <span className="absolute top-1.5 right-2 text-[10px] text-[#0F5F62]/40 dark:text-[#2DD4BF]/40 select-none pointer-events-none">❖</span>
            <span className="absolute bottom-1.5 left-2 text-[10px] text-[#0F5F62]/40 dark:text-[#2DD4BF]/40 select-none pointer-events-none">❖</span>
            <span className="absolute bottom-1.5 right-2 text-[10px] text-[#0F5F62]/40 dark:text-[#2DD4BF]/40 select-none pointer-events-none">❖</span>

            {/* Content Container */}
            <div className="p-2 sm:p-3.5 rounded-xl border border-[#D7E9E7]/80 dark:border-[#1E3A5F] min-h-[520px] flex flex-col justify-between">
              <div>
                {/* PAGE TOP MARGIN */}
                <div className="pb-2 mb-2 border-b border-[#E7D9DE] dark:border-[#21409A]/30 flex items-center justify-between text-xs text-[#0F5F62] dark:text-[#B9E2DD]">
                  {/* Left: Juz Number */}
                  <div className="font-bold flex items-center gap-1">
                    <span>
                      {language === 'bn' ? `পারা ${formatNum(jNum)}` : `Juz ${formatNum(jNum)}`}
                    </span>
                    <span className="text-muted-slate text-[10px] font-normal">
                      ({mushafEdition === 'hafezi_15' && (language === 'bn' ? '১৫ লাইন হাফেজি' : '15-Line Hafezi')}
                      {mushafEdition === 'tajweed' && (language === 'bn' ? 'কালার তাজবীদ' : 'Tajweed Color')}
                      {mushafEdition === 'nurani_easy' && (language === 'bn' ? 'নূরানী সহজ পাঠ' : 'Nurani Script')}
                      {mushafEdition === 'standard' && (language === 'bn' ? 'মদিনা উসমানি' : 'Madani Uthmani')})
                    </span>
                  </div>

                  {/* Right: Surah Name */}
                  <div className="font-bold text-[#0F5F62] dark:text-[#2DD4BF]">
                    {surahMeta
                      ? (language === 'bn'
                          ? `সূরা ${surahMeta.nameBangla}`
                          : `Surah ${SURAH_LIST[surahMeta.number - 1]?.nameEnglish || surahMeta.nameBangla}`)
                      : (language === 'bn' ? 'পবিত্র কুরআন' : 'Holy Quran')}
                  </div>
                </div>

                {/* PAGE CORE CONTENT */}
                {pData.ayahs && pData.ayahs.length > 0 ? (
                  <div className="space-y-4 pt-1">
                    {/* Render each Surah that appears on this page */}
                    {(() => {
                      const sections: { surahNumber: number; ayahs: MushafPageAyah[]; startsOnPage: boolean }[] = [];
                      pData.ayahs.forEach((ayah) => {
                        const lastSec = sections[sections.length - 1];
                        if (lastSec && lastSec.surahNumber === ayah.surahNumber) {
                          lastSec.ayahs.push(ayah);
                          if (ayah.numberInSurah === 1) lastSec.startsOnPage = true;
                        } else {
                          sections.push({
                            surahNumber: ayah.surahNumber,
                            ayahs: [ayah],
                            startsOnPage: ayah.numberInSurah === 1,
                          });
                        }
                      });

                      return sections.map((sec) => {
                        const sMeta = SURAH_LIST.find((s) => s.number === sec.surahNumber);
                        const surahNameAr = sec.ayahs[0]?.surahNameArabic || sMeta?.nameArabic || '';
                        const surahNameBn = sec.ayahs[0]?.surahNameBangla || sMeta?.nameBangla || '';
                        const isSurahStart = sec.startsOnPage;

                        const displayAyahs = sec.surahNumber === 1
                          ? sec.ayahs.filter((a) => a.numberInSurah !== 1)
                          : sec.ayahs;

                        return (
                          <div key={`surah-section-${pNum}-${sec.surahNumber}`} className="space-y-3 mb-4">
                            {/* Surah Header & Separate Bismillah (rendered if Surah begins on this page) */}
                            {isSurahStart && (
                              <div className="space-y-2.5 my-3">
                                {/* 1. Ornate Surah Title Banner */}
                                <div className="py-2.5 px-4 rounded-2xl bg-linear-to-r from-[#F8E8ED]/90 via-[#F3FAF9] to-[#F8E8ED]/90 dark:from-[#10235A]/80 dark:via-[#0E172E] dark:to-[#10235A]/80 border-2 border-[#E7D9DE] dark:border-[#21409A]/50 text-center shadow-xs">
                                  <div className="flex items-center justify-between max-w-md mx-auto">
                                    <span className="text-[11px] sm:text-xs font-bold text-[#21409A] dark:text-[#E9B7C3]">
                                      {sMeta?.revelationTypeBn || (sMeta?.revelationType === 'Meccan' ? 'মাক্কী' : 'মাদানী')} · {sMeta?.numberOfAyahs || sec.ayahs.length} আয়াত
                                    </span>
                                    <span className="text-base sm:text-lg font-bold text-[#10235A] dark:text-white font-arabic">
                                      سُورَةُ {surahNameAr}
                                    </span>
                                    <span className="text-[11px] sm:text-xs font-semibold text-[#10235A] dark:text-[#E9B7C3]">
                                      {language === 'bn' ? `সূরা ${surahNameBn}` : `Surah ${sMeta?.nameEnglish || surahNameBn}`}
                                    </span>
                                  </div>
                                </div>

                                {/* 2. DEDICATED SEPARATE BISMILLAH BANNER */}
                                {sec.surahNumber !== 9 ? (
                                  <div className="py-3 px-4 rounded-2xl bg-white dark:bg-[#10235A]/60 border border-[#E7D9DE] dark:border-[#21409A]/40 text-center shadow-2xs group relative">
                                    <div className="flex items-center justify-center gap-3 text-[10px] sm:text-xs text-[#21409A] dark:text-[#E9B7C3] font-bold mb-1">
                                      <span className="w-10 sm:w-16 h-px bg-linear-to-r from-transparent to-[#21409A]/50 dark:to-[#E9B7C3]/50" />
                                      <span className="px-2.5 py-0.5 rounded-full bg-[#F8E8ED] dark:bg-[#10235A] border border-[#E7D9DE] dark:border-[#21409A]/50 font-bold">
                                        {language === 'bn' ? 'বিসমিল্লাহির রাহমানির রাহিম' : 'In the Name of Allah'}
                                      </span>
                                      <span className="w-10 sm:w-16 h-px bg-linear-to-l from-transparent to-[#21409A]/50 dark:to-[#E9B7C3]/50" />
                                    </div>

                                    <p
                                      className="text-2xl sm:text-3xl font-bold text-[#10235A] dark:text-white font-arabic tracking-normal select-text leading-loose py-1"
                                      style={{ fontFamily: getArabicFontFamily() }}
                                      dir="rtl"
                                    >
                                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                    </p>

                                    {/* Translation & Dedicated Bismillah Audio Recitation */}
                                    <div className="pt-1.5 mt-1 border-t border-[#E7D9DE]/60 dark:border-[#21409A]/30 flex flex-wrap items-center justify-center gap-3 text-xs text-[#21409A] dark:text-[#E9B7C3]">
                                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-bengali">
                                        {language === 'bn' ? 'পরম করুণাময়, অতি দয়ালু আল্লাহর নামে শুরু করছি।' : 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          triggerHaptic(15);
                                          onPlayAyah({ surahNumber: 1, numberInSurah: 1 } as any);
                                        }}
                                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F8E8ED] dark:bg-[#10235A] hover:bg-[#E9B7C3]/30 text-[#10235A] dark:text-[#E9B7C3] font-semibold cursor-pointer transition-colors shadow-2xs"
                                        title={language === 'bn' ? 'বিসমিল্লাহ্ তেলাওয়াত শুনুন' : 'Listen Bismillah'}
                                      >
                                        <Volume2 className="w-3 h-3" />
                                        <span>{language === 'bn' ? 'তেলাওয়াত' : 'Recite'}</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="my-2 py-2 px-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-center">
                                    <p className="text-[11px] text-amber-800 dark:text-amber-200 font-medium">
                                      {language === 'bn'
                                        ? 'কুরআনিক বিধান অনুযায়ী সূরা আত-তাওবাহ্-এর শুরুতে বিসমিল্লাহ্ পাঠ করা হয় না।'
                                        : 'By Quranic consensus, Bismillah is not recited at the beginning of Surah At-Tawbah.'}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Continuous Sacred Arabic Ayahs Flow */}
                            <div
                              className="text-justify leading-loose font-arabic select-text font-semibold"
                              dir="rtl"
                              style={{
                                fontFamily: getArabicFontFamily(),
                                fontSize: editionTypo.fontSize,
                                lineHeight: editionTypo.lineHeight,
                                letterSpacing: editionTypo.letterSpacing,
                                textAlignLast: 'center',
                              }}
                            >
                              {displayAyahs.map((ayah) => {
                                const ayahKey = `${ayah.surahNumber}_${ayah.numberInSurah}`;
                                const isPlayingThis = playingAyahKey === ayahKey && isPlaying;

                                return (
                                  <span
                                    key={ayahKey}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      triggerHaptic(15);
                                      setSelectedAyahForMeaning(ayah);
                                    }}
                                    className={`inline transition-all duration-200 rounded-md cursor-pointer ${
                                      isPlayingThis
                                        ? 'bg-[#0F5F62]/15 dark:bg-[#B9E2DD]/20 text-[#0F5F62] dark:text-[#E6F3F2] px-1 py-0.5 rounded-lg shadow-xs ring-1 ring-[#0F5F62]/30'
                                        : 'hover:bg-[#F8E8ED]/50 dark:hover:bg-[#10235A]/40'
                                    }`}
                                    title={language === 'bn' ? `আয়াত ${ayah.numberInSurah} (অর্থ দেখতে ট্যাপ করুন)` : `Verse ${ayah.numberInSurah} (Tap for translation)`}
                                  >
                                    {(() => {
                                      let textAr = normalizeQuranArabic(stripBismillahPrefix(ayah.textArabic));
                                      if (/^[\s\uFEFF\u200B\u200C]*بِ?سْ?مِ?/u.test(textAr)) {
                                        textAr = normalizeQuranArabic(stripBismillahPrefix(textAr));
                                      }
                                      const tajweedAr = showTajweed ? applyAccessibleTajweed(textAr) : undefined;

                                      if (showTajweed && tajweedAr) {
                                        return (
                                          <span
                                            className="inline tajweed-container select-text font-semibold"
                                            dangerouslySetInnerHTML={{
                                              __html: tajweedAr,
                                            }}
                                          />
                                        );
                                      }
                                      return <span className="inline select-text font-semibold">{textAr}</span>;
                                    })()}

                                    {/* Circular Ayah End Mark with Number */}
                                    <span
                                      className="inline-flex items-center justify-center mx-1.5 align-middle select-none"
                                      dir="ltr"
                                    >
                                      <span
                                        className="relative inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 text-[11px] sm:text-xs font-semibold rounded-full border border-[#21409A]/60 dark:border-[#E9B7C3]/70 bg-white/70 dark:bg-[#10235A]/70 select-none shadow-2xs cursor-pointer hover:scale-110 transition-transform"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          triggerHaptic(20);
                                          setSelectedAyahForMeaning(ayah);
                                        }}
                                      >
                                        {formatNum(ayah.numberInSurah)}
                                      </span>
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="py-16 px-4 text-center space-y-3.5 my-auto">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-[#10235A] dark:text-white">
                        {language === 'bn'
                          ? `পৃষ্ঠা ${formatNum(pNum)}-এর তথ্য লোড করা সম্ভব হয়নি`
                          : `Could not load page ${formatNum(pNum)}`}
                      </h4>
                      <p className="text-xs text-[#6B7280] dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                        {language === 'bn'
                          ? 'ইন্টারনেট সংযোগ নিশ্চিত করে পুনরায় চেষ্টা করুন।'
                          : 'Please ensure your internet connection is active and retry.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* PAGE BOTTOM MARGIN */}
              <div className="pt-2 mt-2 border-t border-[#E7D9DE] dark:border-[#21409A]/30 flex items-center justify-between text-xs text-[#10235A] dark:text-[#E9B7C3]">
                {isPaginatedView ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      disabled={pNum <= 1}
                      className="p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-[#F8E8ED] dark:hover:bg-[#10235A] disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer font-semibold"
                      title={language === 'bn' ? 'পূর্ববর্তী পৃষ্ঠা' : 'Previous Page'}
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span className="hidden sm:inline">{language === 'bn' ? 'পূর্ববর্তী' : 'Previous'}</span>
                    </button>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setJumpModalTab('page');
                      }}
                      className="px-3 py-1 rounded-full bg-white/80 dark:bg-[#10235A]/80 border border-[#E7D9DE] dark:border-[#21409A]/40 font-mono font-bold cursor-pointer hover:bg-[#F8E8ED] dark:hover:bg-[#10235A] transition-colors shadow-2xs flex items-center gap-1.5"
                      title={language === 'bn' ? 'পৃষ্ঠা পরিবর্তন করুন' : 'Change Page'}
                    >
                      <span>{language === 'bn' ? 'পৃষ্ঠা' : 'Page'}</span>
                      <span className="text-[#21409A] dark:text-[#E9B7C3]">
                        {formatNum(pNum)}
                      </span>
                      <span className="text-[#E7D9DE]">/</span>
                      <span className="text-muted-slate">{formatNum(totalPages)}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      disabled={pNum >= totalPages}
                      className="p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-[#F8E8ED] dark:hover:bg-[#10235A] disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer font-semibold"
                      title={language === 'bn' ? 'পরবর্তী পৃষ্ঠা' : 'Next Page'}
                    >
                      <span className="hidden sm:inline">{language === 'bn' ? 'পরবর্তী' : 'Next'}</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="font-semibold text-[11px] opacity-75">
                      {surahMeta ? (language === 'bn' ? `সূরা ${surahMeta.nameBangla}` : `Surah ${surahMeta.nameBangla}`) : ''}
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setJumpModalTab('page');
                      }}
                      className="px-3.5 py-1 rounded-full bg-white/80 dark:bg-[#10235A]/80 border border-[#E7D9DE] dark:border-[#21409A]/40 font-mono font-bold cursor-pointer hover:bg-[#F8E8ED] dark:hover:bg-[#10235A] transition-colors shadow-2xs flex items-center gap-1.5"
                      title={language === 'bn' ? 'পৃষ্ঠা নির্বাচন' : 'Select Page'}
                    >
                      <span>{language === 'bn' ? 'পৃষ্ঠা' : 'Page'}</span>
                      <span className="text-[#21409A] dark:text-[#E9B7C3]">
                        {formatNum(pNum)}
                      </span>
                      <span className="text-[#E7D9DE]">/</span>
                      <span className="text-muted-slate">{formatNum(totalPages)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic(15);
                        if (pData.ayahs && pData.ayahs[0]) {
                          onPlayAyah(pData.ayahs[0]);
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-[#F8E8ED] dark:hover:bg-[#10235A] text-[#21409A] dark:text-[#E9B7C3] transition-colors font-semibold cursor-pointer"
                      title={language === 'bn' ? 'এই পৃষ্ঠা শুনুন' : 'Play this page'}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span className="text-[11px]">{language === 'bn' ? 'শুনুন' : 'Play'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`relative w-full flex flex-col items-center select-none transition-all duration-200 ${
        isDistractionFree ? 'fixed inset-0 z-40 bg-[#F3FAF9] dark:bg-[#083B40] overflow-y-auto pt-2 pb-6' : ''
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* =========================================================================
          TOP MUSHAF CONTROL BAR (Smoothly hides in distraction-free mode)
          ========================================================================= */}
      <AnimatePresence>
        {!isDistractionFree && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-3xl mb-2 px-2 sm:px-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 rounded-2xl bg-white/90 dark:bg-[#10235A]/60 border border-[#E7D9DE] dark:border-[#21409A]/40 backdrop-blur-xs shadow-2xs text-xs text-[#10235A] dark:text-[#E9B7C3]">
              {/* Quick Jump Triggers */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setJumpModalTab('page')}
                  className="px-2.5 py-1.5 rounded-xl bg-[#F8E8ED] dark:bg-[#10235A] border border-[#E7D9DE] dark:border-[#21409A]/50 font-bold hover:bg-[#E9B7C3]/30 transition-colors flex items-center gap-1 cursor-pointer"
                  title={language === 'bn' ? 'পৃষ্ঠা নির্বাচন' : 'Select Page'}
                >
                  <Search className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
                  <span>{language === 'bn' ? `পৃষ্ঠা ${formatNum(visiblePage)}` : `Page ${formatNum(visiblePage)}`}</span>
                </button>

                <button
                  onClick={() => setJumpModalTab('juz')}
                  className="px-2.5 py-1.5 rounded-xl hover:bg-[#F8E8ED] dark:hover:bg-[#10235A] transition-colors cursor-pointer"
                  title={language === 'bn' ? 'পারা নির্বাচন' : 'Select Juz'}
                >
                  {language === 'bn' ? `পারা ${formatNum(getJuzForPage(visiblePage))}` : `Juz ${formatNum(getJuzForPage(visiblePage))}`}
                </button>

                {/* Scroll System Switcher: Continuous Scroll vs Paginated Single Page */}
                <div className="flex items-center p-0.5 rounded-xl bg-[#F8E8ED] dark:bg-[#10235A] border border-[#E7D9DE] dark:border-[#21409A]/40 text-xs ml-1">
                  <button
                    onClick={() => handleToggleScrollMode('continuous')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      scrollMode === 'continuous'
                        ? 'bg-[#21409A] text-white shadow-2xs'
                        : 'text-[#10235A] dark:text-[#E9B7C3] hover:text-[#21409A]'
                    }`}
                    title={language === 'bn' ? 'ধারাবাহিক স্ক্রোল মোড (Quran.com স্টাইল)' : 'Continuous Scroll Mode'}
                  >
                    <ScrollText className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">{language === 'bn' ? 'স্ক্রোল' : 'Scroll'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleScrollMode('paginated')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      scrollMode === 'paginated'
                        ? 'bg-[#21409A] text-white shadow-2xs'
                        : 'text-[#10235A] dark:text-[#E9B7C3] hover:text-[#21409A]'
                    }`}
                    title={language === 'bn' ? 'একক পৃষ্ঠা মোড (পাতা উল্টানো)' : 'Single Page Flip'}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">{language === 'bn' ? 'পাতা' : 'Page'}</span>
                  </button>
                </div>
              </div>

              {/* Center/Right Controls */}
              <div className="flex items-center gap-1 ml-auto">
                {/* Audio: Play page */}
                <button
                  onClick={() => {
                    triggerHaptic(20);
                    onPlayCurrentPage();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#21409A] text-white hover:bg-[#10235A] transition-all flex items-center gap-1 cursor-pointer shadow-2xs font-semibold"
                  title={language === 'bn' ? 'এই পৃষ্ঠার তিলাওয়াত শুনুন' : 'Play recitation of this page'}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden xs:inline">{language === 'bn' ? 'বিরতি' : 'Pause'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden xs:inline">{language === 'bn' ? 'পৃষ্ঠা শুনুন' : 'Play Page'}</span>
                    </>
                  )}
                </button>

                {/* Bookmark page */}
                <button
                  onClick={() => {
                    triggerHaptic(15);
                    onToggleBookmark();
                  }}
                  className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                    isBookmarked
                      ? 'bg-[#21409A] text-white border-[#21409A]'
                      : 'border-[#E7D9DE] dark:border-[#21409A]/40 text-[#21409A] dark:text-[#E9B7C3] hover:bg-[#F8E8ED] dark:hover:bg-[#10235A]'
                  }`}
                  title={language === 'bn' ? 'বুকমার্ক' : 'Bookmark'}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>

                {/* Zoom Controls */}
                <div className="flex items-center border border-[#E7D9DE] dark:border-[#21409A]/40 rounded-xl overflow-hidden bg-[#F8E8ED]/50 dark:bg-[#10235A]/50">
                  <button
                    onClick={() => {
                      triggerHaptic(10);
                      setZoomScale((z) => Math.max(85, z - 8));
                    }}
                    className="p-1.5 hover:bg-[#E9B7C3]/30 transition-colors cursor-pointer"
                    title={language === 'bn' ? 'জুম কমান' : 'Zoom Out'}
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono px-1 font-semibold">
                    {zoomScale}%
                  </span>
                  <button
                    onClick={() => {
                      triggerHaptic(10);
                      setZoomScale((z) => Math.min(145, z + 8));
                    }}
                    className="p-1.5 hover:bg-[#E9B7C3]/30 transition-colors cursor-pointer"
                    title={language === 'bn' ? 'জুম বাড়ান' : 'Zoom In'}
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Distraction-Free Toggle */}
                <button
                  onClick={() => {
                    triggerHaptic(15);
                    onToggleDistractionFree();
                  }}
                  className="p-1.5 rounded-xl border border-[#E7D9DE] dark:border-[#21409A]/40 hover:bg-[#F8E8ED] dark:hover:bg-[#10235A] transition-colors cursor-pointer"
                  title={language === 'bn' ? 'ফুল-স্ক্রিন মোড' : 'Fullscreen Mode'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Exit Button when in Distraction-Free Fullscreen */}
      {isDistractionFree && (
        <button
          onClick={() => {
            triggerHaptic(15);
            onToggleDistractionFree();
          }}
          className="fixed top-3 right-3 z-50 p-2 rounded-full bg-white/90 dark:bg-[#10235A]/90 border border-[#E7D9DE] dark:border-[#21409A] text-[#21409A] dark:text-[#E9B7C3] shadow-lg backdrop-blur-xs cursor-pointer hover:scale-105 transition-all"
          title={language === 'bn' ? 'ফুল-স্ক্রিন থেকে বের হন' : 'Exit Fullscreen'}
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      )}

      {/* =========================================================================
          SACRED MUSHAF BOOK PAGE CONTAINER
          - Warm ivory/cream paper background
          - Clean traditional frame in Royal Sapphire & Rose Quartz
          ========================================================================= */}
      {/* =========================================================================
          SACRED MUSHAF PAGES (Continuous Scroll vs Paginated Single Page)
          ========================================================================= */}
      {loading && continuousPages.length === 0 ? (
        <div className="py-24 text-center space-y-3 w-full max-w-[700px]">
          <div className="w-8 h-8 rounded-full border-2 border-[#21409A] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-muted-slate">
            {language === 'bn' ? 'পবিত্র কুরআনের পৃষ্ঠা লোড হচ্ছে...' : 'Loading sacred Quran page...'}
          </p>
        </div>
      ) : scrollMode === 'continuous' ? (
        <div className="w-full max-w-[700px] space-y-6 sm:space-y-8 pb-16">
          {/* Top Prepend Loader */}
          {continuousPages.length > 0 && continuousPages[0].pageNumber > 1 && (
            <div className="text-center pt-1 pb-2">
              <button
                type="button"
                onClick={handleLoadPrevPage}
                disabled={isLoadingMore}
                className="px-4 py-2 rounded-2xl bg-white dark:bg-[#10235A] border border-[#E7D9DE] dark:border-[#21409A]/50 text-xs font-bold text-[#10235A] dark:text-[#E9B7C3] shadow-xs hover:bg-[#F8E8ED] dark:hover:bg-[#152a6d] transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ChevronUp className="w-4 h-4" />
                <span>{language === 'bn' ? `পূর্ববর্তী পৃষ্ঠা ${formatNum(continuousPages[0].pageNumber - 1)} লোড করুন` : `Load Previous Page ${continuousPages[0].pageNumber - 1}`}</span>
              </button>
            </div>
          )}

          {/* Continuous Pages Stack */}
          {continuousPages.map((pData) => renderSingleMushafPage(pData, false))}

          {/* Bottom Sentinel for Auto-Loading Next Pages as User Scrolls */}
          <div ref={bottomSentinelRef} className="py-8 text-center">
            {isLoadingMore ? (
              <div className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-white/95 dark:bg-[#10235A]/95 border border-[#E7D9DE] dark:border-[#21409A]/40 max-w-xs mx-auto shadow-sm text-xs font-bold text-[#0F5F62] dark:text-[#B9E2DD]">
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                <span>{language === 'bn' ? 'পরবর্তী পৃষ্ঠা লোড হচ্ছে...' : 'Loading next page...'}</span>
              </div>
            ) : continuousPages.length > 0 && continuousPages[continuousPages.length - 1].pageNumber < totalPages ? (
              <button
                type="button"
                onClick={handleLoadNextPage}
                className="px-5 py-2.5 rounded-2xl bg-white dark:bg-[#10235A] border border-[#E7D9DE] dark:border-[#21409A]/50 text-xs font-bold text-[#10235A] dark:text-[#E9B7C3] shadow-xs hover:bg-[#F8E8ED] dark:hover:bg-[#152a6d] transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
                <span>{language === 'bn' ? `পরবর্তী পৃষ্ঠা ${formatNum(continuousPages[continuousPages.length - 1].pageNumber + 1)} লোড করুন` : `Load Next Page ${continuousPages[continuousPages.length - 1].pageNumber + 1}`}</span>
              </button>
            ) : (
              <div className="py-4 text-xs font-semibold text-muted-slate font-bengali">
                {language === 'bn' ? '— আল-কুরআন সমাপ্ত —' : '— End of Holy Quran —'}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Paginated Single Page Mode */
        <div className="w-full max-w-[700px]">
          {pageData ? (
            renderSingleMushafPage(pageData, true)
          ) : (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#21409A] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-muted-slate">
                {language === 'bn' ? 'পবিত্র কুরআনের পৃষ্ঠা লোড হচ্ছে...' : 'Loading sacred Quran page...'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Floating Quick Page Scrubber & Scroll Controller */}
      {scrollMode === 'continuous' && !isDistractionFree && (
        <div className="fixed bottom-[calc(5.2rem+env(safe-area-inset-bottom,0px))] right-3 sm:right-6 z-40 flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Scroll to Top */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-9 h-9 rounded-full bg-white/95 dark:bg-[#10235A]/95 border border-[#21409A]/30 text-[#21409A] dark:text-[#E9B7C3] shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-xs"
            title={language === 'bn' ? 'একদম উপরে স্ক্রোল করুন' : 'Scroll to Top'}
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Floating Current Page Pill with jump trigger */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(15);
              setJumpModalTab('page');
            }}
            className="px-3.5 py-1.5 rounded-full bg-[#0F5F62] dark:bg-[#2DD4BF] text-white dark:text-[#0E1416] text-xs font-bold shadow-xl flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-xs font-mono"
            title={language === 'bn' ? 'যেকোনো পৃষ্ঠায় সরাসরি যান' : 'Jump to Page'}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'পৃষ্ঠা' : 'Page'} {formatNum(visiblePage)}</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          TAJWEED LEGEND (Collapsible floating guide, never covers text)
          ========================================================================= */}
      {!isDistractionFree && (
        <div
          className="fixed bottom-[calc(5.2rem+env(safe-area-inset-bottom,0px))] left-3 sm:left-6 z-40"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            {/* Collapsed Pill Button */}
            {!isLegendOpen ? (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  setIsLegendOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-[#10235A]/95 border border-[#21409A]/40 dark:border-[#E9B7C3]/50 text-[#21409A] dark:text-[#E9B7C3] text-xs font-bold shadow-lg hover:scale-105 transition-all cursor-pointer backdrop-blur-xs"
                title={language === 'bn' ? 'তাজবীদ কালার নিয়ম দেখুন' : 'View Tajweed Color Rules'}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden xs:inline">{language === 'bn' ? 'তাজবীদ গাইড' : 'Tajweed Guide'}</span>
              </button>
            ) : (
              /* Expanded Popover */
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-72 p-3.5 rounded-2xl bg-white/95 dark:bg-[#10235A]/95 border border-[#21409A]/40 dark:border-[#E9B7C3]/40 shadow-xl backdrop-blur-md text-xs space-y-2.5"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#E7D9DE] dark:border-[#21409A]/40 pb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-[#10235A] dark:text-white">
                    <Sparkles className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
                    <span>{language === 'bn' ? 'কালার-কোডেড তাজবীদ নিয়ম' : 'Color-Coded Tajweed Rules'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLegendOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1C2D5A] text-slate-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* The 6 Verified Tajwid Color Rules */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#FAF6EB] dark:bg-[#0E172E]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C5221F] shrink-0" />
                    <span className="font-semibold text-[#C5221F]">{language === 'bn' ? 'লাল: ওয়াজিব গুন্নাহ' : 'Red: Ghunnah'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#FAF6EB] dark:bg-[#0E172E]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1565C0] shrink-0" />
                    <span className="font-semibold text-[#1565C0]">{language === 'bn' ? 'নীল: কলকলাহ' : 'Blue: Qalqalah'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#FAF6EB] dark:bg-[#0E172E]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1B7340] shrink-0" />
                    <span className="font-semibold text-[#1B7340]">{language === 'bn' ? 'সবুজ: ইদগাম' : 'Green: Idgham'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#FAF6EB] dark:bg-[#0E172E]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D9530F] shrink-0" />
                    <span className="font-semibold text-[#D9530F]">{language === 'bn' ? 'কমলা: ইখফা' : 'Orange: Ikhfa'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#FAF6EB] dark:bg-[#0E172E]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#7B1FA2] shrink-0" />
                    <span className="font-semibold text-[#7B1FA2]">{language === 'bn' ? 'বেগুনি: মাদ্দ' : 'Purple: Madd'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#FAF6EB] dark:bg-[#0E172E]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#70757A] shrink-0" />
                    <span className="font-semibold text-[#70757A]">{language === 'bn' ? 'ধূসর: ওয়াকফ / সাকিন' : 'Gray: Waqf / Sakin'}</span>
                  </div>
                </div>

                {/* Toggles */}
                <div className="pt-1.5 border-t border-[#E7D9DE] dark:border-[#21409A]/40 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={onToggleTajweed}
                    className="text-[#21409A] dark:text-[#E9B7C3] font-semibold hover:underline"
                  >
                    {showTajweed
                      ? (language === 'bn' ? 'তাজবীদ কালার বন্ধ' : 'Disable Tajweed')
                      : (language === 'bn' ? 'তাজবীদ কালার চালু' : 'Enable Tajweed')}
                  </button>

                  <button
                    type="button"
                    onClick={onToggleColorBlind}
                    className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-colors ${
                      colorBlindMode
                        ? 'bg-[#21409A] text-white border-[#21409A]'
                        : 'border-[#E7D9DE] text-muted-slate hover:bg-[#F8E8ED]'
                    }`}
                    title={language === 'bn' ? 'কালার-ব্লাইন্ড এক্সেসিবিলিটি মোড' : 'Color-blind Accessibility Mode'}
                  >
                    {language === 'bn' ? 'কালার-ব্লাইন্ড মোড' : 'Color-blind Mode'}
                  </button>
                </div>

                <p className="text-[9.5px] text-muted-slate dark:text-slate-400 italic leading-tight pt-1">
                  {language === 'bn'
                    ? 'সকল তাজবীদ কালারিং ও কায়েদা বিশুদ্ধ তাজবীদ উস্তাদের দিকনির্দেশনা অনুযায়ী পর্যালোচনা সাপেক্ষে বিন্যস্ত।'
                    : 'All Tajweed colors follow standard scholarly verified recitation guidelines.'}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          AYAH MEANING DRAWER (Bottom Sheet when Ayah is tapped)
          ========================================================================= */}
      <AnimatePresence>
        {selectedAyahForMeaning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelectedAyahForMeaning(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-lg bg-white dark:bg-[#10235A] rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl border border-[#E7D9DE] dark:border-[#21409A] max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E7D9DE] dark:border-[#21409A]/40 pb-2.5">
                <div>
                  <h3 className="text-sm font-bold text-[#10235A] dark:text-white">
                    {language === 'bn'
                      ? `${selectedAyahForMeaning.surahNameBangla} — আয়াত ${formatNum(selectedAyahForMeaning.numberInSurah)}`
                      : `Surah ${SURAH_LIST[selectedAyahForMeaning.surahNumber - 1]?.nameEnglish || selectedAyahForMeaning.surahNameBangla} — Verse ${formatNum(selectedAyahForMeaning.numberInSurah)}`}
                  </h3>
                  <p className="text-[11px] text-muted-slate dark:text-slate-400">
                    {language === 'bn'
                      ? `পারা ${formatNum(selectedAyahForMeaning.juz)} · পৃষ্ঠা ${formatNum(selectedAyahForMeaning.page)}`
                      : `Juz ${formatNum(selectedAyahForMeaning.juz)} · Page ${formatNum(selectedAyahForMeaning.page)}`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAyahForMeaning(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-[#1C2D5A] text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Verified Arabic Text */}
              <div className="p-3.5 rounded-2xl bg-[#FAF6EB] dark:bg-[#0E172E] text-center" dir="rtl">
                <p
                  className="text-xl sm:text-2xl font-bold text-[#10235A] dark:text-white font-arabic leading-loose"
                  style={{ fontFamily: getArabicFontFamily() }}
                >
                  {selectedAyahForMeaning.textArabic}
                </p>
              </div>

              {/* Translation */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#21409A] dark:text-[#E9B7C3] uppercase tracking-wide">
                  {language === 'bn' ? 'বাংলা অনুবাদ ও অর্থ:' : 'Translation & Meaning:'}
                </span>
                <p className="text-sm sm:text-base text-[#1F2937] dark:text-slate-100 leading-relaxed p-3 rounded-2xl bg-[#F8E8ED]/60 dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#21409A]/30">
                  "{selectedAyahForMeaning.translationBn || (language === 'bn' ? 'অর্থ লোড হচ্ছে...' : 'Loading translation...')}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    triggerHaptic(20);
                    onPlayAyah(selectedAyahForMeaning);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#21409A] hover:bg-[#10235A] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{language === 'bn' ? 'তিলাওয়াত শুনুন' : 'Play Ayah'}</span>
                </button>

                <button
                  onClick={() => {
                    triggerHaptic(15);
                    const sName = language === 'bn' ? selectedAyahForMeaning.surahNameBangla : (SURAH_LIST[selectedAyahForMeaning.surahNumber - 1]?.nameEnglish || selectedAyahForMeaning.surahNameBangla);
                    const shareText = `Surah ${sName} (Ayah ${selectedAyahForMeaning.numberInSurah})\n\n${selectedAyahForMeaning.textArabic}\n\n"${selectedAyahForMeaning.translationBn}"\n\n— Noor Quran`;
                    if (navigator.share) {
                      navigator.share({ title: 'Holy Quran', text: shareText }).catch(() => {});
                    } else if (navigator.clipboard) {
                      navigator.clipboard.writeText(shareText);
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl border border-[#E7D9DE] dark:border-[#21409A] hover:bg-[#F8E8ED] dark:hover:bg-[#10235A] text-[#21409A] dark:text-[#E9B7C3] transition-colors cursor-pointer"
                  title={language === 'bn' ? 'শেয়ার করুন' : 'Share'}
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setSelectedAyahForMeaning(null)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-[#1C2D5A] text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          JUMP NAVIGATION MODAL (Page, Juz, Surah)
          ========================================================================= */}
      <AnimatePresence>
        {jumpModalTab !== 'none' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setJumpModalTab('none')}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#10235A] rounded-3xl p-5 space-y-4 shadow-2xl border border-[#E7D9DE] dark:border-[#21409A] max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Tabs */}
              <div className="flex items-center justify-between border-b border-[#E7D9DE] dark:border-[#21409A]/40 pb-2.5">
                <div className="flex items-center gap-1 text-xs font-bold">
                  <button
                    onClick={() => setJumpModalTab('page')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      jumpModalTab === 'page'
                        ? 'bg-[#21409A] text-white shadow-2xs'
                        : 'text-muted-slate hover:text-[#10235A]'
                    }`}
                  >
                    {language === 'bn' ? 'পৃষ্ঠা জাম্প' : 'Jump Page'}
                  </button>
                  <button
                    onClick={() => setJumpModalTab('juz')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      jumpModalTab === 'juz'
                        ? 'bg-[#21409A] text-white shadow-2xs'
                        : 'text-muted-slate hover:text-[#10235A]'
                    }`}
                  >
                    {language === 'bn' ? '৩০ পারা' : '30 Juz'}
                  </button>
                  <button
                    onClick={() => setJumpModalTab('surah')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      jumpModalTab === 'surah'
                        ? 'bg-[#21409A] text-white shadow-2xs'
                        : 'text-muted-slate hover:text-[#10235A]'
                    }`}
                  >
                    {language === 'bn' ? '১১৪ সূরা' : '114 Surahs'}
                  </button>
                </div>
                <button
                  onClick={() => setJumpModalTab('none')}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1C2D5A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab 1: Page Jump Direct Input & Quick Steps */}
              {jumpModalTab === 'page' && (
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5 text-center">
                    <label className="text-xs font-bold text-[#10235A] dark:text-white">
                      {language === 'bn' ? 'পৃষ্ঠা নম্বর লিখুন (১ থেকে ৬০৪):' : 'Enter Page Number (1 to 604):'}
                    </label>
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="604"
                        value={pageInputVal}
                        onChange={(e) => setPageInputVal(e.target.value)}
                        className="w-28 text-center text-xl font-bold py-2 rounded-xl bg-slate-50 dark:bg-[#0E172E] border border-[#E7D9DE] dark:border-[#21409A] focus:outline-hidden focus:ring-2 focus:ring-[#21409A]"
                      />
                      <button
                        onClick={() => {
                          const num = parseInt(pageInputVal, 10);
                          if (!isNaN(num) && num >= 1 && num <= 604) {
                            onJumpToPage(num);
                            setJumpModalTab('none');
                          }
                        }}
                        className="py-2.5 px-4 rounded-xl bg-[#21409A] text-white font-bold text-xs hover:bg-[#10235A] transition-colors"
                      >
                        {language === 'bn' ? 'যান' : 'Go'}
                      </button>
                    </div>
                  </div>

                  {/* Quick Milestone Buttons */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-muted-slate block">
                      {language === 'bn' ? 'জনপ্রিয় পৃষ্ঠা ও সূরা:' : 'Popular Pages & Surahs:'}
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 text-xs">
                      {[
                        { labelBn: 'সূরা ফাতিহা', labelEn: 'Al-Fatihah', page: 1 },
                        { labelBn: 'সূরা বাকারা', labelEn: 'Al-Baqarah', page: 2 },
                        { labelBn: 'সূরা কাহফ', labelEn: 'Al-Kahf', page: 293 },
                        { labelBn: 'সূরা ইয়াসিন', labelEn: 'Yaseen', page: 440 },
                        { labelBn: 'সূরা মূলক', labelEn: 'Al-Mulk', page: 562 },
                        { labelBn: 'আমপারা শুরু', labelEn: 'Juz Amma', page: 582 },
                      ].map((item) => (
                        <button
                          key={item.page}
                          onClick={() => {
                            onJumpToPage(item.page);
                            setJumpModalTab('none');
                          }}
                          className="p-2 rounded-xl bg-[#F8E8ED] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#21409A]/40 text-[#10235A] dark:text-[#E9B7C3] font-semibold hover:bg-[#E9B7C3]/30 text-center transition-colors"
                        >
                          <div>{language === 'bn' ? item.labelBn : item.labelEn}</div>
                          <div className="text-[10px] text-muted-slate font-mono">
                            {language === 'bn' ? `পৃষ্ঠা ${formatNum(item.page)}` : `Page ${formatNum(item.page)}`}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: 30 Juz / Para Grid */}
              {jumpModalTab === 'juz' && (
                <div className="overflow-y-auto flex-1 space-y-1 pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    {JUZ_LIST.map((j) => (
                      <button
                        key={j.number}
                        onClick={() => {
                          onJumpToJuz(j.number);
                          setJumpModalTab('none');
                        }}
                        className="p-2.5 rounded-xl border border-[#E7D9DE] dark:border-[#21409A]/40 hover:bg-[#F8E8ED] dark:hover:bg-[#10235A]/60 flex items-center justify-between text-left transition-colors"
                      >
                        <div>
                          <div className="font-bold text-[#10235A] dark:text-white">
                            {language === 'bn' ? j.nameBangla : `Juz ${j.number}: ${j.nameEnglish}`}
                          </div>
                          <div className="text-[10px] text-muted-slate">
                            {language === 'bn' ? `পৃষ্ঠা ${formatNum(j.startPage)} থেকে শুরু` : `Starts at Page ${formatNum(j.startPage)}`}
                          </div>
                        </div>
                        <span className="font-arabic text-sm text-[#21409A] dark:text-[#E9B7C3]" dir="rtl">
                          {j.nameArabic}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Surah Directory Jump */}
              {jumpModalTab === 'surah' && (
                <div className="overflow-y-auto flex-1 space-y-1 pr-1">
                  <div className="space-y-1 text-xs">
                    {SURAH_LIST.map((s) => (
                      <button
                        key={s.number}
                        onClick={() => {
                          onJumpToSurah(s.number);
                          setJumpModalTab('none');
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-[#F8E8ED] dark:hover:bg-[#10235A]/50 flex items-center justify-between text-left transition-colors border border-transparent hover:border-[#E7D9DE]"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-[#1C2D5A] flex items-center justify-center font-mono font-bold text-[10px] text-[#21409A] dark:text-[#E9B7C3]">
                            {s.number}
                          </span>
                          <div>
                            <span className="font-bold text-[#10235A] dark:text-white block">
                              {language === 'bn' ? `সূরা ${s.nameBangla}` : `Surah ${s.nameEnglish}`}
                            </span>
                            <span className="text-[10px] text-[#6B7280] dark:text-slate-400">
                              {language === 'bn' ? `${formatNum(s.numberOfAyahs)} আয়াত` : `${s.numberOfAyahs} verses`} · {language === 'bn' ? `পৃষ্ঠা ${formatNum(s.pageStart)}` : `Page ${s.pageStart}`}
                            </span>
                          </div>
                        </div>
                        <span className="font-arabic text-sm font-bold text-[#21409A] dark:text-[#E9B7C3]" dir="rtl">
                          {s.nameArabic}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MushafPageView;
