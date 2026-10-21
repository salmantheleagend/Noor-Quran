import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppLanguage, SurahMeta, AyahItem, ArabicFontFamily } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { SURAH_LIST, fetchSurahAyahs, stripBismillahPrefix, normalizeQuranArabic } from '../data/quranData';
import { getAyahAudioUrl, triggerHaptic } from '../utils/audioPlayer';
import {
  fetchMushafPage,
  MushafPageData,
  MushafPageAyah,
  toBengaliNumber,
  applyAccessibleTajweed,
} from '../utils/quranPageManager';
import { MushafPageView, MushafEdition } from './MushafPageView';
import { IndoPakKaraokeModal } from './IndoPakKaraokeModal';
import {
  Search,
  BookOpen,
  Play,
  Pause,
  Bookmark,
  Share2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  X,
  Volume2,
  Check,
  Type,
  Sliders,
  Sparkles,
  Minus,
  Plus,
  RotateCcw,
  Book,
  Eye,
  EyeOff,
  Layers,
  Moon,
  Sun,
  Palette,
  SkipForward,
  SkipBack,
} from 'lucide-react';
import { motion } from 'motion/react';

export const getArabicFontFamilyStyle = (font: ArabicFontFamily): string => {
  switch (font) {
    case 'scheherazade':
      return "'Scheherazade New', 'Noto Naskh Arabic', serif";
    case 'noto-nastaliq':
      return "'Noto Nastaliq Urdu', serif";
    case 'lateef':
      return "'Lateef', serif";
    case 'amiri':
    case 'amiri-quran':
    case 'noto-naskh':
    default:
      return "'Noto Naskh Arabic', 'Scheherazade New', 'Amiri', sans-serif";
  }
};

export const ARABIC_FONTS: { id: ArabicFontFamily; name: string; labelBn: string }[] = [
  { id: 'noto-naskh', name: 'নাসখ - স্পষ্ট হরকত (Noto Naskh) [প্রস্তাবিত]', labelBn: 'নাসখ (সহজপাঠ্য)' },
  { id: 'scheherazade', name: 'শাহারাজাদ (Scheherazade)', labelBn: 'শাহারাজাদ' },
  { id: 'amiri-quran', name: 'উসমানি কুরআন (Amiri Quran)', labelBn: 'উসমানি' },
  { id: 'noto-nastaliq', name: 'নূরানী / নাস্তালিক (Nastaliq)', labelBn: 'নূরানী' },
  { id: 'amiri', name: 'ক্লাসিক আমিরি (Amiri)', labelBn: 'আমিরি' },
  { id: 'lateef', name: 'লতিফ লিপি (Lateef)', labelBn: 'লতিফ' },
];

export interface QuranReaderProps {
  language: AppLanguage;
  arabicFontSize: number;
  bengaliFontSize: number;
  arabicFont?: ArabicFontFamily;
  showTajweed: boolean;
  showTransliteration: boolean;
  showEnglishTranslation: boolean;
  selectedReciter: string;
  bookmarks: number[];
  onToggleBookmark: (surahNum: number) => void;
  onUpdateFontSize: (arabic: number, bengali: number) => void;
  onChangeArabicFont?: (font: ArabicFontFamily) => void;
  onToggleTajweed: () => void;
  onToggleTransliteration: () => void;
  onToggleEnglish: () => void;
  onChangeReciter: (reciterId: string) => void;
  initialSurah?: number;
  initialSearchOpen?: boolean;
  onOpenProfile?: () => void;
}

export type QuranReadingMode = 'study' | 'mushaf';

export const QuranReader: React.FC<QuranReaderProps> = ({
  language,
  arabicFontSize,
  bengaliFontSize,
  arabicFont = 'noto-naskh',
  showTajweed,
  showTransliteration,
  showEnglishTranslation,
  selectedReciter,
  bookmarks,
  onToggleBookmark,
  onUpdateFontSize,
  onChangeArabicFont,
  onToggleTajweed,
  onToggleTransliteration,
  onToggleEnglish,
  onChangeReciter,
  initialSurah = 1,
  initialSearchOpen = false,
  onOpenProfile,
}) => {
  const t = TRANSLATIONS[language];
  const [activeSurah, setActiveSurah] = useState<number>(initialSurah || 1);
  const [ayahs, setAyahs] = useState<AyahItem[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState(false);

  // Modals & Bottom Sheets
  const [showSurahModal, setShowSurahModal] = useState(initialSearchOpen);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [surahSearchQuery, setSurahSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reading Mode: 'study' vs 'mushaf'
  const [readingMode, setReadingMode] = useState<QuranReadingMode>(() => {
    try {
      return (localStorage.getItem('noor_quran_reading_mode') as QuranReadingMode) || 'mushaf';
    } catch {
      return 'mushaf';
    }
  });

  // Mushaf Edition: 'standard' | 'tajweed' | 'hafezi_15' | 'nurani_easy'
  const [mushafEdition, setMushafEdition] = useState<MushafEdition>(() => {
    try {
      return (localStorage.getItem('noor_quran_mushaf_edition') as MushafEdition) || 'tajweed';
    } catch {
      return 'tajweed';
    }
  });

  // Color-Blind Accessibility Mode for Tajweed
  const [colorBlindMode, setColorBlindMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('noor_quran_tajweed_colorblind') === 'true';
    } catch {
      return false;
    }
  });

  // Current Mushaf Page Number (1 - 604)
  const [currentMushafPage, setCurrentMushafPage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('noor_quran_last_mushaf_page');
      if (saved) return Math.max(1, Math.min(604, parseInt(saved, 10)));
    } catch {
      // ignore
    }
    const targetSurah = SURAH_LIST.find((s) => s.number === (initialSurah || 1));
    return targetSurah?.pageStart || 1;
  });

  const [mushafPageData, setMushafPageData] = useState<MushafPageData | null>(null);
  const [loadingPage, setLoadingPage] = useState<boolean>(false);

  // Study Mode: Show/Hide Bengali Meaning toggle
  const [showBengaliTranslation, setShowBengaliTranslation] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('noor_quran_study_show_meaning');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  // Distraction-Free full-screen reading state for Mushaf mode
  const [isDistractionFree, setIsDistractionFree] = useState<boolean>(false);

  // Line spacing state (Study mode)
  const [lineSpacing, setLineSpacing] = useState<number>(() => {
    try {
      return parseFloat(localStorage.getItem('noor_quran_line_spacing') || '2.4');
    } catch {
      return 2.4;
    }
  });

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingAyahKey, setPlayingAyahKey] = useState<string | null>(null); // e.g. "1_1" (surah_ayah)
  const [playingAyahDetails, setPlayingAyahDetails] = useState<{
    surahNumber: number;
    surahNameBangla: string;
    ayahNumber: number;
  } | null>(null);
  const [isContinuousPlay, setIsContinuousPlay] = useState<boolean>(true);
  const [pageAudioQueue, setPageAudioQueue] = useState<{ surah: number; ayah: number }[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingAyahDetailsRef = useRef<{
    surahNumber: number;
    surahNameBangla: string;
    ayahNumber: number;
  } | null>(null);
  const isContinuousPlayRef = useRef<boolean>(true);
  const playAyahDirectRef = useRef<(surahNum: number, ayahNum: number) => void>(() => {});
  const activeSurahRef = useRef<number>(activeSurah);

  useEffect(() => {
    activeSurahRef.current = activeSurah;
  }, [activeSurah]);

  // Arabic Font Selection (defaults to crisp Noto Naskh Arabic)
  const [selectedArabicFont, setSelectedArabicFont] = useState<ArabicFontFamily>(() => {
    try {
      const saved = localStorage.getItem('noor_quran_user_arabic_font') as ArabicFontFamily;
      if (saved && saved !== 'amiri-quran' && saved !== 'amiri') {
        return saved;
      }
      localStorage.setItem('noor_quran_user_arabic_font', 'noto-naskh');
      return 'noto-naskh';
    } catch {
      return 'noto-naskh';
    }
  });

  const [showStudyFontMenu, setShowStudyFontMenu] = useState<boolean>(false);
  const [showIndoPakKaraoke, setShowIndoPakKaraoke] = useState<boolean>(false);

  // Auto-scroll to active playing Ayah in Study Mode
  useEffect(() => {
    if (isPlaying && playingAyahDetails && readingMode === 'study') {
      const el = document.getElementById(`study-ayah-${playingAyahDetails.ayahNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isPlaying, playingAyahDetails, readingMode]);

  // Bookmarks Map
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('noor_quran_ayah_bookmarks_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const currentSurahMeta = useMemo(() => {
    return SURAH_LIST.find((s) => s.number === activeSurah) || SURAH_LIST[0];
  }, [activeSurah]);

  // Load ayahs when activeSurah changes in Study Mode
  useEffect(() => {
    if (activeSurah && readingMode === 'study') {
      setLoadingAyahs(true);
      fetchSurahAyahs(activeSurah).then((data) => {
        setAyahs(data);
        setLoadingAyahs(false);
      });

      try {
        localStorage.setItem('noor_quran_last_read_surah', activeSurah.toString());
      } catch {
        // ignore
      }
    }
  }, [activeSurah, readingMode]);

  // Synchronize when external navigation passes an initialSurah (e.g. from GlobalSearch)
  useEffect(() => {
    if (initialSurah && initialSurah !== activeSurah) {
      setActiveSurah(initialSurah);
      const targetSurah = SURAH_LIST.find((s) => s.number === initialSurah);
      if (targetSurah?.pageStart) {
        setCurrentMushafPage(targetSurah.pageStart);
      }
    }
  }, [initialSurah]);

  // Load Mushaf Page when currentMushafPage changes in Mushaf Mode
  useEffect(() => {
    if (readingMode === 'mushaf') {
      setLoadingPage(true);
      fetchMushafPage(currentMushafPage).then((data) => {
        setMushafPageData(data);
        setLoadingPage(false);
        // Pre-fetch next page for seamless reading experience
        if (currentMushafPage < 604) {
          fetchMushafPage(currentMushafPage + 1).catch(() => {});
        }
      });

      try {
        localStorage.setItem('noor_quran_last_mushaf_page', currentMushafPage.toString());
      } catch {
        // ignore
      }
    }
  }, [currentMushafPage, readingMode]);

  const handleReloadMushafPage = () => {
    setLoadingPage(true);
    fetchMushafPage(currentMushafPage)
      .then((data) => {
        setMushafPageData(data);
        setLoadingPage(false);
      })
      .catch(() => {
        setLoadingPage(false);
      });
  };

  // Setup Audio Element with continuous playback & offline support
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleEnded = () => {
      // If we have a page queue, play the next ayah
      setPageAudioQueue((prevQueue) => {
        if (prevQueue.length > 1) {
          const nextQueue = prevQueue.slice(1);
          const nextItem = nextQueue[0];
          playAyahDirectRef.current(nextItem.surah, nextItem.ayah);
          return nextQueue;
        } else if (isContinuousPlayRef.current) {
          // If continuous play, advance to next ayah
          const details = playingAyahDetailsRef.current;
          if (details) {
            const { surahNumber, ayahNumber } = details;
            // If Bismillah (1:1) finished playing for a surah > 1, start Ayah 1 of that surah
            if (surahNumber === 1 && ayahNumber === 1 && activeSurahRef.current !== 1) {
              playAyahDirectRef.current(activeSurahRef.current, 1);
              return [];
            }
            // For Surah 1, if Bismillah (1:1) finished, advance to Ayah 2
            if (surahNumber === 1 && ayahNumber === 1) {
              playAyahDirectRef.current(1, 2);
              return [];
            }
            const sMeta = SURAH_LIST.find((s) => s.number === surahNumber);
            if (sMeta && ayahNumber < sMeta.numberOfAyahs) {
              playAyahDirectRef.current(surahNumber, ayahNumber + 1);
            } else if (surahNumber < 114) {
              playAyahDirectRef.current(surahNumber + 1, 1);
            } else {
              setIsPlaying(false);
              setPlayingAyahKey(null);
              setPlayingAyahDetails(null);
              playingAyahDetailsRef.current = null;
            }
          }
          return [];
        } else {
          setIsPlaying(false);
          setPlayingAyahKey(null);
          setPlayingAyahDetails(null);
          playingAyahDetailsRef.current = null;
          return [];
        }
      });
    };

    const handleError = () => {
      setIsPlaying(false);
      setPlayingAyahKey(null);
      setPlayingAyahDetails(null);
      playingAyahDetailsRef.current = null;
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        showToast('অফলাইন মোড: অডিও শোনার জন্য ইন্টারনেট সংযোগ প্রয়োজন');
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Keep isContinuousPlay in ref
  useEffect(() => {
    isContinuousPlayRef.current = isContinuousPlay;
  }, [isContinuousPlay]);

  // Keep playingAyahDetails in ref
  useEffect(() => {
    playingAyahDetailsRef.current = playingAyahDetails;
  }, [playingAyahDetails]);

  // Play Ayah Direct Helper
  const playAyahDirect = (surahNum: number, ayahNum: number) => {
    // Check if offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsPlaying(false);
      setPlayingAyahKey(null);
      setPlayingAyahDetails(null);
      playingAyahDetailsRef.current = null;
      showToast('অফলাইন মোড: অডিও শোনার জন্য ইন্টারনেট প্রয়োজন (বাকি সকল ফিচার সচল রয়েছে)');
      return;
    }

    const sMeta = SURAH_LIST.find((s) => s.number === surahNum);
    const key = `${surahNum}_${ayahNum}`;
    const url = getAyahAudioUrl(surahNum, ayahNum, selectedReciter);

    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setPlayingAyahKey(key);
          const details = {
            surahNumber: surahNum,
            surahNameBangla: sMeta?.nameBangla || `সূরা ${surahNum}`,
            ayahNumber: ayahNum,
          };
          setPlayingAyahDetails(details);
          playingAyahDetailsRef.current = details;
        })
        .catch((err) => {
          console.warn('Audio play error:', err);
          setIsPlaying(false);
          setPlayingAyahKey(null);
          setPlayingAyahDetails(null);
          playingAyahDetailsRef.current = null;
          if (typeof navigator !== 'undefined' && !navigator.onLine) {
            showToast('অফলাইন মোড: অডিও শোনার জন্য ইন্টারনেট প্রয়োজন');
          } else {
            showToast('অডিও প্লে হতে সমস্যা হয়েছে, ইন্টারনেট সংযোগ চেক করুন');
          }
        });
    }
  };

  useEffect(() => {
    playAyahDirectRef.current = playAyahDirect;
  });

  // Advance to next ayah
  const handleAdvanceNextAyah = () => {
    const details = playingAyahDetailsRef.current;
    if (!details) return;
    const { surahNumber, ayahNumber } = details;
    const sMeta = SURAH_LIST.find((s) => s.number === surahNumber);

    if (sMeta && ayahNumber < sMeta.numberOfAyahs) {
      playAyahDirect(surahNumber, ayahNumber + 1);
    } else if (surahNumber < 114) {
      playAyahDirect(surahNumber + 1, 1);
    } else {
      setIsPlaying(false);
      setPlayingAyahKey(null);
      setPlayingAyahDetails(null);
      playingAyahDetailsRef.current = null;
    }
  };

  // Play Page (queues all ayahs on this page in sequential order)
  const handlePlayCurrentPage = () => {
    if (!mushafPageData?.ayahs || mushafPageData.ayahs.length === 0) return;

    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
      setPlayingAyahKey(null);
      setPlayingAyahDetails(null);
      playingAyahDetailsRef.current = null;
      setPageAudioQueue([]);
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      showToast('অফলাইন মোড: অডিও শোনার জন্য ইন্টারনেট প্রয়োজন');
      return;
    }

    const queue = mushafPageData.ayahs.map((a) => ({
      surah: a.surahNumber,
      ayah: a.numberInSurah,
    }));

    setPageAudioQueue(queue);
    const first = queue[0];
    playAyahDirect(first.surah, first.ayah);
    showToast(`পৃষ্ঠা ${toBengaliNumber(currentMushafPage)}-এর তিলাওয়াত শুরু হয়েছে`);
  };

  // Toggle Ayah Audio
  const handleToggleAyahAudio = (surahNum: number, ayahNum: number) => {
    triggerHaptic(20);
    const key = `${surahNum}_${ayahNum}`;

    if (playingAyahKey === key && isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
      setPlayingAyahKey(null);
      setPlayingAyahDetails(null);
      playingAyahDetailsRef.current = null;
      setPageAudioQueue([]);
    } else {
      setIsContinuousPlay(true);
      isContinuousPlayRef.current = true;
      setPageAudioQueue([]);
      playAyahDirect(surahNum, ayahNum);
    }
  };

  // Bookmark Toggle
  const handleToggleAyahBookmark = (surahNum: number, ayahNum: number) => {
    triggerHaptic(15);
    const key = `${surahNum}_${ayahNum}`;
    setBookmarkedAyahs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('noor_quran_ayah_bookmarks_v1', JSON.stringify(next));
      } catch {
        // ignore
      }
      showToast(next[key] ? 'আয়াত বুকমার্কে সংরক্ষিত' : 'বুকমার্ক সরানো হয়েছে');
      return next;
    });
  };

  // Share Ayah
  const handleShareAyah = (ayah: AyahItem | MushafPageAyah, surahName: string) => {
    triggerHaptic(15);
    const shareText = `সূরা ${surahName} (আয়াত: ${ayah.numberInSurah})\n\n${ayah.textArabic}\n\nঅর্থ: "${ayah.translationBn}"\n\n— নূর কুরআন (Noor Quran)`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `সূরা ${surahName} — আয়াত ${ayah.numberInSurah}`,
        text: shareText,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      showToast('আয়াত ও অর্থ ক্লিপবোর্ডে কপি করা হয়েছে');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSelectFont = (fontId: ArabicFontFamily) => {
    triggerHaptic(15);
    setSelectedArabicFont(fontId);
    if (onChangeArabicFont) onChangeArabicFont(fontId);
    try {
      localStorage.setItem('noor_quran_user_arabic_font', fontId);
    } catch {
      // ignore
    }
  };

  const handleToggleMode = (mode: QuranReadingMode) => {
    triggerHaptic(15);
    setReadingMode(mode);
    try {
      localStorage.setItem('noor_quran_reading_mode', mode);
    } catch {
      // ignore
    }
    showToast(mode === 'mushaf' ? 'মুসহাফ পেজ মোড সক্রিয়' : 'স্টাডি মোড সক্রিয়');
  };

  const handleSelectMushafEdition = (ed: MushafEdition) => {
    triggerHaptic(15);
    setMushafEdition(ed);
    try {
      localStorage.setItem('noor_quran_mushaf_edition', ed);
    } catch {
      // ignore
    }
    if (ed === 'tajweed' && !showTajweed) {
      onToggleTajweed();
    }
  };

  const handleToggleColorBlindMode = () => {
    triggerHaptic(15);
    setColorBlindMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('noor_quran_tajweed_colorblind', next.toString());
      } catch {
        // ignore
      }
      showToast(next ? 'কালার-ব্লাইন্ড মোড চালু' : 'কালার-ব্লাইন্ড মোড বন্ধ');
      return next;
    });
  };

  // Filtered Surahs in Search Modal
  const filteredSurahs = useMemo(() => {
    if (!surahSearchQuery.trim()) return SURAH_LIST;
    const q = surahSearchQuery.toLowerCase().trim();
    return SURAH_LIST.filter(
      (s) =>
        s.number.toString() === q ||
        s.nameBangla.toLowerCase().includes(q) ||
        s.nameEnglish.toLowerCase().includes(q) ||
        s.nameArabic.includes(q) ||
        s.englishTranslation.toLowerCase().includes(q)
    );
  }, [surahSearchQuery]);

  const isSurahBookmarked = bookmarks.includes(activeSurah);

  return (
    <div className="min-h-screen bg-[#F3FAF9] dark:bg-[#083B40] pb-28 text-[#123234] dark:text-[#F3FAF9] transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0F5F62] text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 border border-[#B9E2DD]/30">
          {toastMessage}
        </div>
      )}

      {/* =========================================================================
          TOP UNIFIED NAVIGATION BAR
          ========================================================================= */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0E1416]/95 backdrop-blur-md border-b border-[#E7D9DE] dark:border-[#22353B] transition-colors">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
          {/* Left: Mode Toggle & Surah Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Reading Mode Segmented Pill */}
            <div className="p-0.5 rounded-2xl bg-[#F8E8ED] dark:bg-[#18282D] border border-[#E7D9DE] dark:border-[#22353B] flex items-center text-xs">
              <button
                onClick={() => handleToggleMode('mushaf')}
                className={`py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  readingMode === 'mushaf'
                    ? 'bg-[#083B40] dark:bg-[#2DD4BF] text-white dark:text-[#0E1416] shadow-xs'
                    : 'text-[#10235A] dark:text-[#EAF2F1] hover:text-[#083B40]'
                }`}
                title="মুসহাফ পেজ মোড (বইয়ের মতো পাতা)"
              >
                <Book className="w-3.5 h-3.5" />
                <span>মুসহাফ</span>
              </button>

              <button
                onClick={() => handleToggleMode('study')}
                className={`py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  readingMode === 'study'
                    ? 'bg-[#21409A] text-white shadow-xs'
                    : 'text-[#10235A] dark:text-[#E9B7C3] hover:text-[#21409A]'
                }`}
                title="স্টাডি মোড (আয়াত কার্ড ও অর্থ)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>স্টাডি</span>
              </button>
            </div>

            {/* Surah Selector Dropdown */}
            <button
              onClick={() => {
                triggerHaptic(15);
                setShowSurahModal(true);
              }}
              className="py-1.5 px-2.5 sm:px-3 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#21409A]/40 text-xs font-semibold text-[#10235A] dark:text-white hover:bg-[#F8E8ED] dark:hover:bg-[#1C2D5A] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer min-h-[38px]"
            >
              <span className="font-bold">
                {currentSurahMeta.number}. {currentSurahMeta.nameBangla}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
            </button>
          </div>

          {/* Right: Search, Bookmark, Reading Settings */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                triggerHaptic(15);
                setShowSurahModal(true);
              }}
              className="w-9 h-9 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#21409A]/40 flex items-center justify-center text-[#21409A] dark:text-[#E9B7C3] hover:bg-[#F8E8ED] dark:hover:bg-[#1C2D5A] transition-all shadow-2xs cursor-pointer"
              title="সূরা খুঁজুন"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                triggerHaptic(15);
                onToggleBookmark(activeSurah);
              }}
              className={`w-9 h-9 rounded-2xl border flex items-center justify-center transition-all shadow-2xs cursor-pointer ${
                isSurahBookmarked
                  ? 'bg-[#21409A] text-white border-[#21409A]'
                  : 'bg-white dark:bg-[#142042] border-[#E7D9DE] dark:border-[#21409A]/40 text-[#21409A] dark:text-[#E9B7C3] hover:bg-[#F8E8ED] dark:hover:bg-[#1C2D5A]'
              }`}
              title="বুকমার্ক"
            >
              <Bookmark className={`w-4 h-4 ${isSurahBookmarked ? 'fill-current' : ''}`} />
            </button>

            {onOpenProfile && (
              <button
                onClick={() => {
                  triggerHaptic(15);
                  onOpenProfile();
                }}
                className="w-9 h-9 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#21409A]/40 flex items-center justify-center text-[#21409A] dark:text-[#E9B7C3] hover:bg-[#F8E8ED] dark:hover:bg-[#1C2D5A] transition-all shadow-2xs cursor-pointer"
                title="প্রোফাইল ও সেটিংস"
              >
                <User className="w-4 h-4" />
              </button>
            )}

            {/* Indo-Pak Word-by-Word Karaoke Mode Trigger */}
            <button
              onClick={() => {
                triggerHaptic(20);
                setShowIndoPakKaraoke(true);
              }}
              className="py-1.5 px-2.5 sm:px-3 rounded-2xl bg-linear-to-r from-[#D4AF37]/15 via-[#FAF4E6] to-[#D4AF37]/15 dark:from-[#D4AF37]/20 dark:via-[#162226] dark:to-[#D4AF37]/20 border border-[#D4AF37]/80 text-xs font-bold text-[#8C7335] dark:text-[#E6C65A] hover:bg-[#D4AF37]/25 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs min-h-[38px] shrink-0"
              title="ইন্ডো-পাক স্ক্রিপ্ট ওয়ার্ড-বাই-ওয়ার্ড কারাওকে"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">ইন্ডো-পাক কারাওকে</span>
              <span className="sm:hidden">কারাওকে</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic(15);
                setShowSettingsSheet(true);
              }}
              className="py-1.5 px-3 rounded-2xl bg-[#F8E8ED] dark:bg-[#10235A] border border-[#E7D9DE] dark:border-[#21409A]/50 text-xs font-semibold text-[#10235A] dark:text-[#E9B7C3] hover:bg-[#E9B7C3]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs min-h-[38px]"
              title="পঠন সেটিংস"
            >
              <Sliders className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
              <span className="hidden xs:inline">সেটিংস</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN READING VIEW (Mushaf Mode vs Study Mode)
          ========================================================================= */}
      {readingMode === 'mushaf' ? (
        /* -----------------------------------------------------------------------
           1. COLOR-CODED MUSHAF MODE (Book-like Quran page by page)
           ----------------------------------------------------------------------- */
        <main className="max-w-4xl mx-auto px-2 sm:px-4 pt-3 pb-8">
          <MushafPageView
            pageData={mushafPageData}
            loading={loadingPage}
            currentPageNumber={currentMushafPage}
            totalPages={604}
            mushafEdition={mushafEdition}
            selectedFont={selectedArabicFont}
            showTajweed={showTajweed}
            colorBlindMode={colorBlindMode}
            isPlaying={isPlaying}
            playingAyahKey={playingAyahKey}
            isBookmarked={isSurahBookmarked}
            onPrevPage={() => setCurrentMushafPage((p) => Math.max(1, p - 1))}
            onNextPage={() => setCurrentMushafPage((p) => Math.min(604, p + 1))}
            onJumpToPage={(pageNum) => setCurrentMushafPage(pageNum)}
            onJumpToJuz={(juzNum) => {
              const target = SURAH_LIST.find((s) => s.juzStart === juzNum);
              if (target) setCurrentMushafPage(target.pageStart);
            }}
            onJumpToSurah={(sNum) => {
              setActiveSurah(sNum);
              const target = SURAH_LIST.find((s) => s.number === sNum);
              if (target) setCurrentMushafPage(target.pageStart);
            }}
            onToggleBookmark={() => onToggleBookmark(activeSurah)}
            onPlayAyah={(ayah) => handleToggleAyahAudio(ayah.surahNumber, ayah.numberInSurah)}
            onPlayCurrentPage={handlePlayCurrentPage}
            onToggleAudioPause={() => {
              if (audioRef.current) {
                if (isPlaying) {
                  audioRef.current.pause();
                  setIsPlaying(false);
                } else {
                  audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                }
              }
            }}
            onToggleTajweed={onToggleTajweed}
            onToggleColorBlind={handleToggleColorBlindMode}
            onChangeEdition={handleSelectMushafEdition}
            onChangeFont={handleSelectFont}
            language={language}
            isDistractionFree={isDistractionFree}
            onToggleDistractionFree={() => setIsDistractionFree((prev) => !prev)}
            onRetryPage={handleReloadMushafPage}
          />
        </main>
      ) : (
        /* -----------------------------------------------------------------------
           2. STUDY MODE: Ayah Cards with Bengali Meaning & NO Pronunciation
           - Arabic verified and visually dominant
           - Bengali meaning below with toggle: “অর্থ দেখুন / অর্থ লুকান”
           - Pronunciation/transliteration completely removed as requested
           ----------------------------------------------------------------------- */
        <main className="max-w-3xl mx-auto px-3 sm:px-4 pt-4 space-y-4">
          {/* Surah Banner & Meaning Toggle Button */}
          {/* Surah Banner & Meaning Toggle Button */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#10235A] border border-[#E7D9DE] dark:border-[#21409A]/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-base sm:text-lg font-bold text-[#10235A] dark:text-white font-bengali">
                  {language === 'bn' ? `সূরা ${currentSurahMeta.nameBangla}` : `Surah ${currentSurahMeta.nameEnglish}`}
                </span>
                <span className="text-xs font-mono text-muted-slate">
                  {language === 'bn'
                    ? `(${currentSurahMeta.revelationTypeBn} · ${toBengaliNumber(currentSurahMeta.numberOfAyahs)} আয়াত)`
                    : `(${currentSurahMeta.revelationType === 'Meccan' ? 'Meccan' : 'Medinan'} · ${currentSurahMeta.numberOfAyahs} Ayahs)`}
                </span>
              </div>
              <p className="text-xs text-muted-slate font-bengali mt-0.5">
                {language === 'bn'
                  ? `পারা ${toBengaliNumber(currentSurahMeta.juzStart)} · পৃষ্ঠা ${toBengaliNumber(currentSurahMeta.pageStart)}`
                  : `Juz ${currentSurahMeta.juzStart} · Page ${currentSurahMeta.pageStart}`}
              </p>
            </div>

            {/* Buttons: Font, Meaning, Listen */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
              {/* Arabic Font Selector in Study Mode */}
              <div className="relative">
                <button
                  onClick={() => {
                    triggerHaptic(15);
                    setShowStudyFontMenu(!showStudyFontMenu);
                  }}
                  className="py-2 px-3 rounded-2xl bg-[#F8E8ED] dark:bg-[#0A163B] border border-[#E7D9DE] dark:border-[#21409A]/40 text-xs font-bold text-[#21409A] dark:text-[#E9B7C3] hover:bg-[#E9B7C3]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title={language === 'bn' ? 'আরবি ফন্ট পরিবর্তন করুন' : 'Change Arabic font'}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>
                    {language === 'bn'
                      ? (ARABIC_FONTS.find((f) => f.id === selectedArabicFont)?.labelBn || 'ফন্ট')
                      : (ARABIC_FONTS.find((f) => f.id === selectedArabicFont)?.name.split(' ')[0] || 'Font')}
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showStudyFontMenu ? 'rotate-180' : ''}`} />
                </button>

                {showStudyFontMenu && (
                  <div className="absolute top-full mt-1.5 right-0 z-40 bg-white dark:bg-[#10235A] rounded-2xl shadow-xl border border-[#E7D9DE] dark:border-[#21409A]/50 p-1.5 w-52 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-bold text-muted-slate border-b border-slate-100 dark:border-slate-800">
                      {language === 'bn' ? 'আরবি ফন্ট নির্বাচন করুন' : 'Select Arabic Font'}
                    </div>
                    {ARABIC_FONTS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          handleSelectFont(f.id);
                          setShowStudyFontMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                          selectedArabicFont === f.id
                            ? 'bg-[#21409A] text-white shadow-xs font-bold'
                            : 'hover:bg-[#F8E8ED] dark:hover:bg-[#142042] text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span>{f.name}</span>
                        <span className="font-arabic text-sm ml-2" style={{ fontFamily: getArabicFontFamilyStyle(f.id) }}>
                          بِسْمِ ٱللَّهِ
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* “Show / Hide Meaning” Toggle Button */}
              <button
                onClick={() => {
                  triggerHaptic(15);
                  setShowBengaliTranslation((prev) => {
                    const next = !prev;
                    try {
                      localStorage.setItem('noor_quran_study_show_meaning', next.toString());
                    } catch {
                      // ignore
                    }
                    showToast(
                      language === 'bn'
                        ? (next ? 'বাংলা অর্থ দৃশ্যমান' : 'বাংলা অর্থ লুকানো')
                        : (next ? 'Translation Visible' : 'Translation Hidden')
                    );
                    return next;
                  });
                }}
                className={`py-2 px-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  showBengaliTranslation
                    ? 'bg-[#F8E8ED] dark:bg-[#10235A] border-[#E7D9DE] text-[#21409A] dark:text-[#E9B7C3]'
                    : 'bg-[#21409A] text-white border-[#21409A]'
                }`}
              >
                {showBengaliTranslation ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'অর্থ লুকান' : 'Hide Meaning'}</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'অর্থ দেখুন' : 'Show Meaning'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  triggerHaptic(20);
                  if (typeof navigator !== 'undefined' && !navigator.onLine) {
                    showToast(language === 'bn' ? 'অফলাইন মোড: অডিও শোনার জন্য ইন্টারনেট প্রয়োজন' : 'Offline Mode: Internet required for audio');
                    return;
                  }
                  if (ayahs.length > 0) {
                    setIsContinuousPlay(true);
                    isContinuousPlayRef.current = true;
                    setPageAudioQueue([]);
                    // Recite Bismillah first for each surah (except Surah 9 At-Tawbah)
                    if (activeSurah !== 9) {
                      playAyahDirect(1, 1);
                      setPlayingAyahKey(activeSurah === 1 ? '1_1' : `${activeSurah}_bismillah`);
                    } else {
                      playAyahDirect(9, 1);
                    }
                    showToast(language === 'bn' ? `সূরা ${currentSurahMeta.nameBangla}-এর তিলাওয়াত শুরু হয়েছে` : `Recitation of Surah ${currentSurahMeta.nameEnglish} started`);
                  }
                }}
                className="py-2 px-3.5 rounded-2xl bg-[#0F5F62] text-white hover:bg-[#123234] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'bn' ? 'সূরা শুনুন' : 'Play Surah'}</span>
              </button>
            </div>
          </div>

          {/* Static Centered Bismillah Header for Each Surah (except Surah 9 At-Tawbah) */}
          {activeSurah !== 9 ? (
            <div
              className={`my-4 py-4 px-4 sm:px-6 rounded-3xl transition-all duration-300 text-center shadow-xs ${
                playingAyahKey === `${activeSurah}_bismillah` || (activeSurah === 1 && playingAyahKey === '1_1' && isPlaying)
                  ? 'bg-linear-to-b from-[#F3FAF9] via-white to-[#F3FAF9] dark:from-[#0C454B] dark:via-[#083B40] dark:to-[#0C454B] border-2 border-[#0F5F62] ring-4 ring-[#B9E2DD]/40 shadow-lg scale-[1.01]'
                  : 'bg-white dark:bg-[#0C454B] border border-[#D7E9E7] dark:border-[#13545A]'
              }`}
            >
              {/* Ornamental divider & title */}
              <div className="flex items-center justify-center gap-3 text-xs text-[#0F5F62] dark:text-[#B9E2DD] font-semibold mb-2">
                <span className="w-10 sm:w-16 h-px bg-linear-to-r from-transparent to-[#0F5F62]/50 dark:to-[#B9E2DD]/50" />
                <span className="px-3 py-0.5 rounded-full bg-[#F3FAF9] dark:bg-[#083B40] border border-[#D7E9E7] dark:border-[#13545A] font-bold">
                  {language === 'bn' ? 'বিসমিল্লাহ্' : 'Bismillah'}
                </span>
                <span className="w-10 sm:w-16 h-px bg-linear-to-l from-transparent to-[#0F5F62]/50 dark:to-[#B9E2DD]/50" />
              </div>

              {/* Verified Uthmani Arabic Text */}
              <p
                className="text-2xl sm:text-3xl lg:text-4xl text-[#123234] dark:text-[#F3FAF9] font-bold font-arabic select-text tracking-wide leading-loose py-1"
                dir="rtl"
                style={{ fontFamily: getArabicFontFamilyStyle(selectedArabicFont) }}
              >
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </p>

              {/* Translation Meaning */}
              {showBengaliTranslation && (
                <p className="text-xs sm:text-sm text-[#1F2937] dark:text-slate-200 mt-2 font-normal font-bengali leading-relaxed max-w-lg mx-auto">
                  {language === 'bn'
                    ? 'পরম করুণাময়, অতি দয়ালু আল্লাহর নামে শুরু করছি।'
                    : 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'}
                </p>
              )}

              {/* Dedicated Audio Listen button for Bismillah */}
              <div className="pt-2.5 mt-2.5 border-t border-[#D7E9E7]/60 dark:border-[#13545A] flex items-center justify-center gap-4 text-xs font-semibold text-[#0F5F62] dark:text-[#B9E2DD]">
                <button
                  onClick={() => {
                    triggerHaptic(15);
                    const isBismillahPlaying = playingAyahKey === `${activeSurah}_bismillah` || (activeSurah === 1 && playingAyahKey === '1_1' && isPlaying);
                    if (isBismillahPlaying) {
                      if (audioRef.current) audioRef.current.pause();
                      setIsPlaying(false);
                      setPlayingAyahKey(null);
                    } else {
                      playAyahDirect(1, 1);
                      setPlayingAyahKey(activeSurah === 1 ? '1_1' : `${activeSurah}_bismillah`);
                    }
                  }}
                  className="flex items-center gap-1.5 hover:underline cursor-pointer py-1 px-3 rounded-full hover:bg-[#F3FAF9] dark:hover:bg-[#083B40] transition-colors"
                  title={language === 'bn' ? 'বিসমিল্লাহ্ তেলাওয়াত শুনুন' : 'Listen to Bismillah Recitation'}
                >
                  {playingAyahKey === `${activeSurah}_bismillah` || (activeSurah === 1 && playingAyahKey === '1_1' && isPlaying) ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>{language === 'bn' ? 'বিরতি' : 'Pause'}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F5F62] dark:bg-[#B9E2DD] animate-ping" />
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{language === 'bn' ? 'বিসমিল্লাহ্ শুনুন' : 'Listen Bismillah'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="my-3 py-2.5 px-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-center">
              <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                {language === 'bn'
                  ? 'কুরআনিক নিয়ম ও সর্বসম্মত বিধান অনুযায়ী সূরা আত-তাওবাহ্-এর শুরুতে বিসমিল্লাহ্ পাঠ করা হয় না।'
                  : 'By established Quranic consensus, Bismillah is not recited at the start of Surah At-Tawbah.'}
              </p>
            </div>
          )}

          {/* Ayahs List - Bismillah is strictly moved OUT of this list */}
          {loadingAyahs ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#0F5F62] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-[#6B7280] dark:text-slate-400">
                {language === 'bn'
                  ? `সূরা ${currentSurahMeta.nameBangla}-এর আয়াতসমূহ লোড হচ্ছে...`
                  : `Loading verses of Surah ${currentSurahMeta.nameEnglish}...`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ayahs
                .filter((ayah) => !(activeSurah === 1 && ayah.numberInSurah === 1))
                .map((ayah) => {
                  const ayahKey = `${activeSurah}_${ayah.numberInSurah}`;
                  const isPlayingThis = playingAyahKey === ayahKey && isPlaying;
                  const isBookmarkedThis = !!bookmarkedAyahs[ayahKey];
                  const displayedAyahNumber = activeSurah === 1 ? ayah.numberInSurah - 1 : ayah.numberInSurah;

                  return (
                    <div
                      key={ayah.numberInSurah}
                      id={`study-ayah-${ayah.numberInSurah}`}
                      className={`p-4 sm:p-5 rounded-3xl transition-all duration-300 space-y-3 shadow-2xs ${
                        isPlayingThis
                          ? 'bg-linear-to-b from-[#F3FAF9] via-white to-[#F3FAF9] dark:from-[#0C454B] dark:via-[#083B40] dark:to-[#0C454B] border-2 border-[#0F5F62] ring-4 ring-[#B9E2DD]/40 shadow-lg scale-[1.01]'
                          : 'bg-white dark:bg-[#0C454B] border border-[#D7E9E7] dark:border-[#13545A]'
                      }`}
                    >
                      {/* Ayah Card Top: Number badge & Playing Status */}
                      <div className="flex items-center justify-between text-xs font-semibold text-muted-slate border-b border-[#D7E9E7]/60 dark:border-[#13545A] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#F3FAF9] dark:bg-[#083B40] text-[#0F5F62] dark:text-[#B9E2DD] font-mono font-bold border border-[#D7E9E7] dark:border-[#13545A]">
                            {language === 'bn' ? `আয়াত ${toBengaliNumber(displayedAyahNumber)}` : `Ayah ${displayedAyahNumber}`}
                          </span>
                        {isPlayingThis && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0F5F62] text-white text-[10px] font-bold shadow-xs"
                          >
                            <Volume2 className="w-3 h-3 animate-pulse text-[#B9E2DD]" />
                            <span>{language === 'bn' ? 'তিলাওয়াত চলছে' : 'Reciting'}</span>
                            <span className="w-1 h-2.5 bg-[#B9E2DD] rounded-full animate-pulse" />
                            <span className="w-1 h-3.5 bg-[#B9E2DD] rounded-full animate-pulse delay-75" />
                            <span className="w-1 h-2 bg-[#B9E2DD] rounded-full animate-pulse delay-150" />
                          </motion.span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-[#5E7475] dark:text-[#A2C0BE]">
                        {language === 'bn'
                          ? `পারা ${toBengaliNumber(ayah.juz)} · পৃষ্ঠা ${toBengaliNumber(ayah.page)}`
                          : `Juz ${ayah.juz} · Page ${ayah.page}`}
                      </span>
                    </div>

                    {/* Prominent Verified Arabic Text (Deep Charcoal/White, Pearl glow when playing) */}
                    <div
                      className={`py-3 px-3.5 rounded-2xl text-center transition-all duration-300 ${
                        isPlayingThis
                          ? 'bg-[#B9E2DD]/25 dark:bg-[#B9E2DD]/15 ring-2 ring-[#0F5F62] dark:ring-[#B9E2DD] shadow-xs'
                          : ''
                      }`}
                      dir="rtl"
                    >
                      <p
                        className="font-bold font-arabic select-text text-[#123234] dark:text-[#F3FAF9]"
                        style={{
                          fontSize: `${arabicFontSize}px`,
                          lineHeight: lineSpacing,
                          fontFamily: getArabicFontFamilyStyle(selectedArabicFont),
                        }}
                      >
                        {(() => {
                          const isAyah1OfOtherSurah = activeSurah !== 1 && ayah.numberInSurah === 1;
                          let rawArabic = normalizeQuranArabic(isAyah1OfOtherSurah ? stripBismillahPrefix(ayah.textArabic) : ayah.textArabic);
                          if (isAyah1OfOtherSurah && /^[\s\uFEFF\u200B\u200C]*بِ?سْ?مِ?/u.test(rawArabic)) {
                            rawArabic = normalizeQuranArabic(stripBismillahPrefix(rawArabic));
                          }
                          const rawTajweed = showTajweed
                            ? (isAyah1OfOtherSurah ? applyAccessibleTajweed(rawArabic) : (ayah.textArabicTajweed || applyAccessibleTajweed(rawArabic)))
                            : undefined;

                          if (showTajweed && rawTajweed) {
                            return <span dangerouslySetInnerHTML={{ __html: rawTajweed }} />;
                          }
                          return rawArabic;
                        })()}
                        <span
                          className="inline-block mx-2 text-xl font-normal text-[#0F5F62] dark:text-[#B9E2DD] select-none font-arabic align-middle"
                          title={language === 'bn' ? `আয়াত ${toBengaliNumber(ayah.numberInSurah)}` : `Ayah ${ayah.numberInSurah}`}
                        >
                          ۝
                        </span>
                      </p>
                    </div>

                    {/* Translation Meaning (Visible only when showBengaliTranslation is true) */}
                    {showBengaliTranslation && (
                      <div className="text-center px-2 sm:px-6 pt-1">
                        {language === 'en' ? (
                          ayah.translationEn ? (
                            <p
                              className="text-[#1F2937] dark:text-slate-100 font-sans leading-relaxed font-normal"
                              style={{ fontSize: `${bengaliFontSize}px` }}
                            >
                              "{ayah.translationEn}"
                            </p>
                          ) : null
                        ) : ayah.translationBn ? (
                          <p
                            className="text-[#1F2937] dark:text-slate-100 font-bengali leading-relaxed font-normal"
                            style={{ fontSize: `${bengaliFontSize}px` }}
                          >
                            "{ayah.translationBn}"
                          </p>
                        ) : null}
                      </div>
                    )}

                    {/* Optional Secondary English Translation if user specifically enabled it in Bengali mode */}
                    {language === 'bn' && showEnglishTranslation && ayah.translationEn && (
                      <div className="text-center px-2 sm:px-6 pt-0.5">
                        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-slate-400 italic font-sans leading-relaxed">
                          {ayah.translationEn}
                        </p>
                      </div>
                    )}

                    {/* Controls: Listen, Bookmark, Share */}
                    <div className="pt-2 border-t border-[#E7D9DE]/60 dark:border-[#21409A]/30 flex items-center justify-center gap-6 text-xs font-semibold text-[#10235A] dark:text-[#E9B7C3]">
                      <button
                        onClick={() => handleToggleAyahAudio(activeSurah, ayah.numberInSurah)}
                        className="flex items-center gap-1.5 hover:underline cursor-pointer"
                        title={language === 'bn' ? 'তেলাওয়াত শুনুন' : 'Listen Recitation'}
                      >
                        {isPlayingThis ? (
                          <>
                            <Pause className="w-4 h-4 fill-current" />
                            <span>{language === 'bn' ? 'বিরতি' : 'Pause'}</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>{language === 'bn' ? 'তেলাওয়াত' : 'Recite'}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleToggleAyahBookmark(activeSurah, ayah.numberInSurah)}
                        className="flex items-center gap-1.5 hover:underline cursor-pointer"
                        title={language === 'bn' ? 'বুকমার্ক করুন' : 'Bookmark'}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarkedThis ? 'fill-current' : ''}`} />
                        <span>
                          {isBookmarkedThis
                            ? (language === 'bn' ? 'সংরক্ষিত' : 'Saved')
                            : (language === 'bn' ? 'বুকমার্ক' : 'Bookmark')}
                        </span>
                      </button>

                      <button
                        onClick={() => handleShareAyah(ayah, language === 'bn' ? currentSurahMeta.nameBangla : currentSurahMeta.nameEnglish)}
                        className="flex items-center gap-1.5 hover:underline cursor-pointer"
                        title={language === 'bn' ? 'শেয়ার করুন' : 'Share'}
                      >
                        <Share2 className="w-4 h-4" />
                        <span>{language === 'bn' ? 'শেয়ার' : 'Share'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* =========================================================================
          COMPACT MINI AUDIO PLAYER (Docked above bottom navigation)
          ========================================================================= */}
      {playingAyahDetails && (
        <div className="fixed bottom-16 left-0 right-0 z-30 p-2 sm:p-3 pointer-events-none">
          <div className="max-w-md mx-auto p-3 rounded-2xl bg-[#10235A] text-white border border-[#21409A] shadow-2xl backdrop-blur-md pointer-events-auto flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <button
                onClick={() => {
                  triggerHaptic(15);
                  if (audioRef.current) {
                    if (isPlaying) {
                      audioRef.current.pause();
                      setIsPlaying(false);
                    } else {
                      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                    }
                  }
                }}
                className="w-9 h-9 rounded-xl bg-[#21409A] hover:bg-[#18327E] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <div className="truncate text-xs">
                <span className="font-bold block truncate">
                  সূরা {playingAyahDetails.surahNameBangla} (আয়াত {toBengaliNumber(playingAyahDetails.ayahNumber)})
                </span>
                <span className="text-[10px] text-[#E9B7C3] block">
                  মিশারী রাশিদ আল-আফাসী · তিলাওয়াত
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleAdvanceNextAyah}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 cursor-pointer"
                title="পরবর্তী আয়াত"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  triggerHaptic(15);
                  if (audioRef.current) audioRef.current.pause();
                  setIsPlaying(false);
                  setPlayingAyahKey(null);
                  setPlayingAyahDetails(null);
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SURAH SELECTOR MODAL
          ========================================================================= */}
      {showSurahModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#10235A] rounded-3xl max-w-md w-full p-4 space-y-3 border border-[#E7D9DE] dark:border-[#21409A] shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E7D9DE] dark:border-[#21409A]/40 pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />
                <h3 className="text-sm font-bold text-[#10235A] dark:text-white">
                  ১১৪ সূরা নির্বাচন করুন
                </h3>
              </div>
              <button
                onClick={() => setShowSurahModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1C2D5A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={surahSearchQuery}
                onChange={(e) => setSurahSearchQuery(e.target.value)}
                placeholder="সূরার নাম বা নম্বর দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0A163B] border border-[#E7D9DE] dark:border-[#21409A]/40 text-xs text-[#1F2937] dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#21409A]"
              />
            </div>

            {/* Surah List */}
            <div className="overflow-y-auto flex-1 space-y-1 pr-1 text-xs">
              {filteredSurahs.map((surah) => {
                const isSelected = surah.number === activeSurah;
                return (
                  <button
                    key={surah.number}
                    onClick={() => {
                      triggerHaptic(15);
                      setActiveSurah(surah.number);
                      setCurrentMushafPage(surah.pageStart);
                      setShowSurahModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#21409A] text-white font-bold shadow-xs'
                        : 'hover:bg-[#F8E8ED] dark:hover:bg-[#1C2D5A] text-[#1F2937] dark:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-[#0A163B] text-[#21409A] dark:text-[#E9B7C3]'
                        }`}
                      >
                        {surah.number}
                      </span>
                      <div className="text-left font-bengali">
                        <span className="font-bold">{surah.nameBangla}</span>
                        <span className="text-[10px] ml-1.5 opacity-75">
                          ({surah.revelationTypeBn} · {toBengaliNumber(surah.numberOfAyahs)} আয়াত)
                        </span>
                      </div>
                    </div>

                    <div className="text-right" dir="rtl">
                      <span className="font-arabic font-bold text-sm">{surah.nameArabic}</span>
                      <span className="text-[10px] block opacity-75 font-mono">
                        পৃষ্ঠা {toBengaliNumber(surah.pageStart)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          READING SETTINGS BOTTOM SHEET
          ========================================================================= */}
      {showSettingsSheet && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowSettingsSheet(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#10235A] rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl border border-[#E7D9DE] dark:border-[#21409A] max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E7D9DE] dark:border-[#21409A]/40 pb-2.5">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />
                <h3 className="text-sm font-bold text-[#10235A] dark:text-white">
                  কুরআন পঠন ও মুসহাফ সেটিংস
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsSheet(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1C2D5A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reading Mode Selector */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-slate block">পঠন মোড:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleToggleMode('mushaf')}
                  className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                    readingMode === 'mushaf'
                      ? 'bg-[#21409A] text-white border-[#21409A]'
                      : 'border-[#E7D9DE] text-[#10235A] dark:text-[#E9B7C3] hover:bg-[#F8E8ED]'
                  }`}
                >
                  📖 মুসহাফ পেজ মোড
                </button>
                <button
                  onClick={() => handleToggleMode('study')}
                  className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                    readingMode === 'study'
                      ? 'bg-[#21409A] text-white border-[#21409A]'
                      : 'border-[#E7D9DE] text-[#10235A] dark:text-[#E9B7C3] hover:bg-[#F8E8ED]'
                  }`}
                >
                  📝 স্টাডি কার্ড মোড
                </button>
              </div>
            </div>

            {/* 4 Mushaf Editions */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-slate block">মুসহাফ সংস্করণ:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'standard' as MushafEdition, name: 'মদিনা উসমানি' },
                  { id: 'tajweed' as MushafEdition, name: 'কালার তাজবীদ' },
                  { id: 'hafezi_15' as MushafEdition, name: '১৫ লাইন হাফেজি' },
                  { id: 'nurani_easy' as MushafEdition, name: 'নূরানী সহজ পাঠ' },
                ].map((ed) => (
                  <button
                    key={ed.id}
                    onClick={() => handleSelectMushafEdition(ed.id)}
                    className={`p-2 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                      mushafEdition === ed.id
                        ? 'bg-[#F8E8ED] dark:bg-[#1C2D5A] border-[#21409A] text-[#21409A] dark:text-[#E9B7C3] font-bold'
                        : 'border-[#E7D9DE] dark:border-[#21409A]/40 text-slate-700 dark:text-slate-300 hover:bg-[#F8E8ED]'
                    }`}
                  >
                    {ed.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tajweed Toggles */}
            <div className="p-3 rounded-2xl bg-[#F8E8ED]/60 dark:bg-[#0A163B]/60 border border-[#E7D9DE] dark:border-[#21409A]/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#10235A] dark:text-white block">তাজবীদ কালার</span>
                  <span className="text-[10px] text-muted-slate">৬টি বিশুদ্ধ তাজবীদ নিয়মের রঙিন বিন্যাস</span>
                </div>
                <button
                  onClick={onToggleTajweed}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    showTajweed ? 'bg-[#21409A]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      showTajweed ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#E7D9DE] dark:border-[#21409A]/30">
                <div>
                  <span className="font-bold text-[#10235A] dark:text-white block">কালার-ব্লাইন্ড মোড</span>
                  <span className="text-[10px] text-muted-slate">আন্ডারলাইন ও চিহ্নে পার্থক্যকরণ</span>
                </div>
                <button
                  onClick={handleToggleColorBlindMode}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    colorBlindMode ? 'bg-[#21409A]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      colorBlindMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Arabic Font Selector */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-slate block">আরবি ফন্ট:</span>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {[
                  { id: 'amiri-quran' as ArabicFontFamily, name: 'উসমানি' },
                  { id: 'noto-naskh' as ArabicFontFamily, name: 'নাসখ' },
                  { id: 'noto-nastaliq' as ArabicFontFamily, name: 'নূরানী' },
                  { id: 'scheherazade' as ArabicFontFamily, name: 'শাহারাজাদ' },
                  { id: 'amiri' as ArabicFontFamily, name: 'আমিরি' },
                  { id: 'lateef' as ArabicFontFamily, name: 'লতিফ' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleSelectFont(f.id)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedArabicFont === f.id
                        ? 'bg-[#21409A] text-white font-bold border-[#21409A]'
                        : 'border-[#E7D9DE] dark:border-[#21409A]/40 text-slate-700 dark:text-slate-300 hover:bg-[#F8E8ED]'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Sliders */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span>আরবি হরফের আকার</span>
                  <span className="font-mono text-[#21409A] dark:text-[#E9B7C3]">
                    {arabicFontSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="44"
                  value={arabicFontSize}
                  onChange={(e) => onUpdateFontSize(parseInt(e.target.value, 10), bengaliFontSize)}
                  className="w-full accent-[#21409A]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span>বাংলা অনুবাদের আকার</span>
                  <span className="font-mono text-[#21409A] dark:text-[#E9B7C3]">
                    {bengaliFontSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="13"
                  max="24"
                  value={bengaliFontSize}
                  onChange={(e) => onUpdateFontSize(arabicFontSize, parseInt(e.target.value, 10))}
                  className="w-full accent-[#21409A]"
                />
              </div>
            </div>

            <button
              onClick={() => setShowSettingsSheet(false)}
              className="w-full py-2.5 rounded-xl bg-[#21409A] text-white font-bold text-xs hover:bg-[#10235A] transition-colors cursor-pointer"
            >
              সম্পন্ন
            </button>
          </div>
        </div>
      )}

      {/* Indo-Pak Word-by-Word Interactive Karaoke Modal */}
      <IndoPakKaraokeModal
        isOpen={showIndoPakKaraoke}
        onClose={() => setShowIndoPakKaraoke(false)}
        language={language === 'en' ? 'en' : 'bn'}
      />
    </div>
  );
};
