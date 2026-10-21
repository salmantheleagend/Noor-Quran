import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppLanguage } from '../types';
import {
  RuqyahCategory,
  RuqyahCategoryMeta,
  RuqyahItem,
  RUQYAH_CATEGORIES,
  RUQYAH_ITEMS,
} from '../data/ruqyahData';
import {
  ruqyahManager,
  RuqyahIntentAnalysis,
  DailyRoutineStatus,
} from '../services/RuqyahManager';
import {
  Shield,
  Play,
  Pause,
  RotateCcw,
  Search,
  Sparkles,
  BookOpen,
  Heart,
  Bookmark,
  Share2,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Volume2,
  Clock,
  AlertTriangle,
  Flame,
  Moon,
  Sun,
  Eye,
  HeartPulse,
  Home as HomeIcon,
  Compass,
  ShieldCheck,
  Download,
  Info,
  CheckCircle2,
  SkipForward,
  SkipBack,
  Sliders,
  Type,
  HelpCircle,
  Headphones,
  CheckCheck,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';

interface RuqyahHomeProps {
  language?: AppLanguage;
  onBack?: () => void;
  onOpenSettings?: () => void;
}

export const RuqyahHome: React.FC<RuqyahHomeProps> = ({
  language = 'bn',
  onBack,
}) => {
  // Mode: Simple vs Learn
  const [viewMode, setViewMode] = useState<'simple' | 'learn'>('learn');

  // Search input & Intent analysis
  const [searchQuery, setSearchQuery] = useState('');
  const [intentAnalysis, setIntentAnalysis] = useState<RuqyahIntentAnalysis | null>(null);
  const [showAllAfterSearch, setShowAllAfterSearch] = useState(false);

  // Selected Category filter ('all' or specific RuqyahCategory)
  const [selectedCategory, setSelectedCategory] = useState<RuqyahCategory | 'all'>('all');

  // Active / Playing Ruqyah item
  const [activeItem, setActiveItem] = useState<RuqyahItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSlowMode, setIsSlowMode] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isLooping, setIsLooping] = useState(false);
  const [subTrackIndex, setSubTrackIndex] = useState<number>(0);
  const [currentProgress, setCurrentProgress] = useState(0); // 0 to 100
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState('00:00');
  const [durationFormatted, setDurationFormatted] = useState('00:00');

  // Sleep Timer
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState<number | null>(null);

  // Detail Modal
  const [detailItem, setDetailItem] = useState<RuqyahItem | null>(null);
  const [fontSizeArabic, setFontSizeArabic] = useState<number>(24);

  // Daily Routine Status
  const [routineStatus, setRoutineStatus] = useState<DailyRoutineStatus>(() =>
    ruqyahManager.getDailyRoutineStatus()
  );

  // Favorites & Offline
  const [favorites, setFavorites] = useState<string[]>(() => ruqyahManager.getFavoriteIds());
  const [offlineIds, setOfflineIds] = useState<string[]>(() => ruqyahManager.getOfflineSavedIds());

  // Active Tab Filter within Category View
  const [itemFilter, setItemFilter] = useState<'all' | 'favorites' | 'routine'>('all');

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio HTML Element & Speech Synthesis Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechTimerRef = useRef<any>(null);
  const speechStartTimeRef = useRef<number>(0);
  const speechDurationRef = useRef<number>(10);
  const isUsingSpeechRef = useRef<boolean>(false);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechResumeIntervalRef = useRef<any>(null);

  // Quick Intent Suggestion Prompts
  const intentQuickChips = [
    { label: 'বদনজর / Bad Nojor', query: 'bad nojor lagse' },
    { label: 'ঘুমে চেপে ধরা', query: 'ghume chepe dhore' },
    { label: 'জিনের ভয় ও ওয়াসওয়াসা', query: 'jin er voy waswasa' },
    { label: 'জাদু / সিহর থেকে সুরক্ষা', query: 'jadu sihor theke bachte chai' },
    { label: 'শারীরিক ব্যথা ও শিফা', query: 'shorire betha' },
    { label: 'বাচ্চা ও ঘরের সুরক্ষা', query: 'child protection dua' },
    { label: 'ভয় ও দুশ্চিন্তা', query: 'anxiety voy lagse' },
    { label: 'সকাল-সন্ধ্যার দুর্গ', query: 'shokal shondha azkar' },
  ];

  // Icon Resolver
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Eye':
        return <Eye className="w-5 h-5" />;
      case 'Flame':
        return <Flame className="w-5 h-5" />;
      case 'Shield':
        return <Shield className="w-5 h-5" />;
      case 'Moon':
        return <Moon className="w-5 h-5" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5" />;
      case 'Home':
        return <HomeIcon className="w-5 h-5" />;
      case 'Sun':
        return <Sun className="w-5 h-5" />;
      case 'Compass':
        return <Compass className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  // Run Intent Analysis on Search Query
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const result = ruqyahManager.analyzeIntent(searchQuery);
      setIntentAnalysis(result);
      setShowAllAfterSearch(false);
    } else {
      setIntentAnalysis(null);
      setShowAllAfterSearch(false);
    }
  }, [searchQuery]);

  // Sleep Timer Countdown
  useEffect(() => {
    if (!sleepTimerMinutes) {
      setSleepTimeRemaining(null);
      return;
    }

    setSleepTimeRemaining(sleepTimerMinutes * 60);

    const interval = setInterval(() => {
      setSleepTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          stopAllAudio();
          setIsPlaying(false);
          setSleepTimerMinutes(null);
          showToast('স্লিপ টাইমার শেষ হয়েছে, অডিও বন্ধ করা হয়েছে।');
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerMinutes]);

  // Clean up any ongoing audio and speech on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (speechTimerRef.current) {
      clearInterval(speechTimerRef.current);
      speechTimerRef.current = null;
    }
    if (speechResumeIntervalRef.current) {
      clearInterval(speechResumeIntervalRef.current);
      speechResumeIntervalRef.current = null;
    }
    activeUtteranceRef.current = null;
    isUsingSpeechRef.current = false;
  };

  // Play complete Arabic recitation via speech synthesis (for Duas, offline or fallback)
  const playSpeechSynthesis = (item: RuqyahItem, slow: boolean = false) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsPlaying(false);
      return;
    }
    stopAllAudio();
    isUsingSpeechRef.current = true;
    setIsPlaying(true);

    // Thoroughly strip Bengali numerals/characters, brackets, punctuation so Arabic TTS voice recites completely without halting
    const cleanArabic = item.arabic
      .replace(/[\u0980-\u09FF۝০-৯0-9\(\)\{\}\[\]\.,\/\\«»\-–—:;]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanArabic) {
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanArabic);
    utterance.lang = 'ar-SA';
    utterance.rate = slow ? 0.72 : playbackSpeed * 0.85;

    // Retain global and ref pointers to prevent Chrome/Safari garbage collector from cancelling recitation prematurely
    activeUtteranceRef.current = utterance;
    (window as any).__ruqyahUtterance = utterance;

    // Estimate realistic speaking duration based on Arabic text length
    const estimatedDuration = Math.max(6, Math.round((cleanArabic.length * 0.17) / utterance.rate));
    speechDurationRef.current = estimatedDuration;
    speechStartTimeRef.current = Date.now();

    const durMin = Math.floor(estimatedDuration / 60);
    const durSec = Math.floor(estimatedDuration % 60);
    setDurationFormatted(`${durMin.toString().padStart(2, '0')}:${durSec.toString().padStart(2, '0')}`);

    speechTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - speechStartTimeRef.current) / 1000;
      const progress = Math.min(100, (elapsed / estimatedDuration) * 100);
      setCurrentProgress(progress);

      const curMin = Math.floor(elapsed / 60);
      const curSec = Math.floor(elapsed % 60);
      setCurrentTimeFormatted(`${curMin.toString().padStart(2, '0')}:${curSec.toString().padStart(2, '0')}`);

      if (elapsed >= estimatedDuration) {
        if (speechTimerRef.current) {
          clearInterval(speechTimerRef.current);
          speechTimerRef.current = null;
        }
      }
    }, 250);

    // Circumvent Chromium's 14-second audio pause bug
    if (speechResumeIntervalRef.current) {
      clearInterval(speechResumeIntervalRef.current);
    }
    speechResumeIntervalRef.current = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 4000);

    utterance.onend = () => {
      if (speechTimerRef.current) {
        clearInterval(speechTimerRef.current);
        speechTimerRef.current = null;
      }
      if (speechResumeIntervalRef.current) {
        clearInterval(speechResumeIntervalRef.current);
        speechResumeIntervalRef.current = null;
      }
      activeUtteranceRef.current = null;
      setCurrentProgress(100);
      if (isLooping) {
        playSpeechSynthesis(item, slow);
      } else {
        setIsPlaying(false);
        handleNextTrack();
      }
    };

    utterance.onerror = () => {
      if (speechTimerRef.current) {
        clearInterval(speechTimerRef.current);
        speechTimerRef.current = null;
      }
      if (speechResumeIntervalRef.current) {
        clearInterval(speechResumeIntervalRef.current);
        speechResumeIntervalRef.current = null;
      }
      activeUtteranceRef.current = null;
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Play a specific Ruqyah item completely
  const handlePlayItem = (item: RuqyahItem, slow: boolean = false, subIdx: number = 0) => {
    triggerHaptic(20);
    stopAllAudio();
    setActiveItem(item);
    setIsSlowMode(slow);
    setSubTrackIndex(subIdx);
    setIsPlaying(true);
    ruqyahManager.recordHistory(item.id);

    const hasUrls = item.audioUrls && item.audioUrls.length > 0;
    const audioUrl = hasUrls
      ? item.audioUrls![subIdx] || item.audioUrls![0]
      : (slow ? (item.audioSlowUrl || item.audioFullUrl) : (item.audioFullUrl || item.audioSlowUrl));

    if (audioUrl) {
      if (audioRef.current) {
        isUsingSpeechRef.current = false;
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = slow ? 0.8 : playbackSpeed;
        audioRef.current.loop = false;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // If network audio fails or offline, fall back to complete Arabic recitation
            playSpeechSynthesis(item, slow);
          });
      }
    } else {
      // Masnoon Dua or audio unavailable: recite full Arabic text
      playSpeechSynthesis(item, slow);
    }
  };

  const handleTogglePlayPause = () => {
    triggerHaptic(15);
    if (!activeItem) {
      const routine = ruqyahManager.getDailyProtectionRoutine();
      handlePlayItem(routine[0]);
      return;
    }

    if (isPlaying) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
      }
      if (speechTimerRef.current) {
        clearInterval(speechTimerRef.current);
        speechTimerRef.current = null;
      }
      setIsPlaying(false);
    } else {
      if (!isUsingSpeechRef.current && audioRef.current && audioRef.current.src && audioRef.current.src.startsWith('http')) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            if (activeItem) playSpeechSynthesis(activeItem, isSlowMode);
          });
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else if (activeItem) {
        handlePlayItem(activeItem, isSlowMode);
      }
    }
  };

  const handleNextTrack = () => {
    triggerHaptic(15);
    const playlist =
      selectedCategory === 'all'
        ? RUQYAH_ITEMS
        : RUQYAH_ITEMS.filter((i) => i.category === selectedCategory);
    if (!activeItem || playlist.length === 0) return;

    const currentIndex = playlist.findIndex((i) => i.id === activeItem.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    handlePlayItem(playlist[nextIndex], isSlowMode);
  };

  const handlePrevTrack = () => {
    triggerHaptic(15);
    const playlist =
      selectedCategory === 'all'
        ? RUQYAH_ITEMS
        : RUQYAH_ITEMS.filter((i) => i.category === selectedCategory);
    if (!activeItem || playlist.length === 0) return;

    const currentIndex = playlist.findIndex((i) => i.id === activeItem.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    handlePlayItem(playlist[prevIndex], isSlowMode);
  };

  // Play Daily Protection Routine or Complete Ruqyah audio sequentially
  const handlePlayDailyRuqyah = () => {
    triggerHaptic(20);
    const fullTrack = RUQYAH_ITEMS.find((it) => it.id === 'ruq_full_shariyyah');
    if (fullTrack) {
      handlePlayItem(fullTrack);
      showToast('সম্পূর্ণ রুকইয়াহ শারইয়াহ অডিও চালু হয়েছে');
    } else {
      const routine = ruqyahManager.getDailyProtectionRoutine();
      if (routine.length > 0) {
        handlePlayItem(routine[0]);
        showToast('দৈনিক সুরক্ষা রুটিন চালু হয়েছে');
      }
    }
  };

  // Toggle routine item completion
  const handleToggleRoutineCheck = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(15);
    const updated = ruqyahManager.toggleRoutineItem(itemId);
    setRoutineStatus(updated);
    if (updated.completedIds.includes(itemId)) {
      showToast('আমল সম্পন্ন চিহ্নিত হয়েছে');
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(15);
    const isNowFav = ruqyahManager.toggleFavorite(itemId);
    const updated = ruqyahManager.getFavoriteIds();
    setFavorites(updated);
    showToast(isNowFav ? 'বুকমার্কে যোগ করা হয়েছে' : 'বুকমার্ক সরানো হয়েছে');
  };

  // Share Ruqyah Item
  const handleShareItem = (item: RuqyahItem, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(15);
    const shareText = `রুকইয়াহ: ${item.titleBn}\n${item.arabic}\nঅর্থ: "${item.translationBn}"\n\nসূত্র: ${item.source}\n(Noor Quran - রুকইয়াহ শারইয়াহ)`;
    if (navigator.share) {
      navigator.share({ title: item.titleBn, text: shareText }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      showToast('ক্লিপবোর্ডে কপি হয়েছে');
    }
  };

  // Audio Time Update
  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;
    setCurrentProgress((cur / dur) * 100);

    const curMin = Math.floor(cur / 60);
    const curSec = Math.floor(cur % 60);
    setCurrentTimeFormatted(`${curMin.toString().padStart(2, '0')}:${curSec.toString().padStart(2, '0')}`);

    if (dur && !isNaN(dur)) {
      const durMin = Math.floor(dur / 60);
      const durSec = Math.floor(dur % 60);
      setDurationFormatted(`${durMin.toString().padStart(2, '0')}:${durSec.toString().padStart(2, '0')}`);
    }
  };

  // Audio Ended: seamlessly advances sub-tracks (e.g. 3 Quls or 2 ayahs) or whole playlist
  const onAudioEnded = () => {
    if (activeItem?.audioUrls && subTrackIndex + 1 < activeItem.audioUrls.length) {
      const nextSub = subTrackIndex + 1;
      setSubTrackIndex(nextSub);
      if (audioRef.current) {
        audioRef.current.src = activeItem.audioUrls[nextSub];
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }

    if (isLooping && audioRef.current) {
      setSubTrackIndex(0);
      if (activeItem?.audioUrls && activeItem.audioUrls.length > 0) {
        audioRef.current.src = activeItem.audioUrls[0];
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else {
      setSubTrackIndex(0);
      handleNextTrack();
    }
  };

  // Items to display based on category & filters
  const displayedItems = useMemo(() => {
    let list =
      selectedCategory === 'all'
        ? RUQYAH_ITEMS
        : RUQYAH_ITEMS.filter((item) => item.category === selectedCategory);

    if (itemFilter === 'favorites') {
      list = list.filter((item) => favorites.includes(item.id));
    } else if (itemFilter === 'routine') {
      const routineItems = ruqyahManager.getDailyProtectionRoutine();
      list = list.filter((item) => routineItems.some((r) => r.id === item.id));
    }

    return list;
  }, [selectedCategory, itemFilter, favorites]);

  // Routine items list
  const dailyRoutineItems = useMemo(() => {
    return ruqyahManager.getDailyProtectionRoutine();
  }, []);

  return (
    <div className="pb-36 pt-1 px-3 sm:px-4 max-w-2xl mx-auto space-y-4 text-[#1F2937] dark:text-slate-100 font-sans">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onEnded={onAudioEnded}
        onError={() => {
          if (activeItem) {
            playSpeechSynthesis(activeItem, isSlowMode);
          } else {
            setIsPlaying(false);
          }
        }}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#10235A] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xl border border-[#E9B7C3]/30 backdrop-blur-md animate-in fade-in flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#E9B7C3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-2xl bg-[#F8E8ED] dark:bg-[#142042] flex items-center justify-center text-[#10235A] dark:text-[#E9B7C3] hover:bg-[#E9B7C3]/30 transition-colors cursor-pointer"
              title="পিছনে যান"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#21409A] animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1F2937] dark:text-white flex items-center gap-2">
                <span>রুকইয়াহ শারইয়াহ</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F8E8ED] dark:bg-[#142042] text-[#21409A] dark:text-[#E9B7C3] font-bold border border-[#E7D9DE] dark:border-[#24386E]">
                  সহিহ ও সুন্নাহসম্মত
                </span>
              </h1>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5">
              কুরআন ও সুন্নাহ নির্দেশিত আত্মিক শিফা, বদনজর ও সিহর থেকে হিফাজত
            </p>
          </div>
        </div>

        {/* Mode Switcher: Simple vs Learn */}
        <div className="flex items-center bg-[#F8E8ED] dark:bg-[#142042] p-1 rounded-2xl border border-[#E7D9DE] dark:border-[#24386E]">
          <button
            onClick={() => {
              triggerHaptic(10);
              setViewMode('simple');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'simple'
                ? 'bg-[#21409A] text-white shadow-xs'
                : 'text-[#10235A] dark:text-slate-300'
            }`}
          >
            সিম্পল
          </button>
          <button
            onClick={() => {
              triggerHaptic(10);
              setViewMode('learn');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'learn'
                ? 'bg-[#21409A] text-white shadow-xs'
                : 'text-[#10235A] dark:text-slate-300'
            }`}
          >
            লার্ন
          </button>
        </div>
      </div>

      {/* 1. TOP SECTION: DEEP TEAL DAILY PROTECTION ROUTINE CARD (#083B40) */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#083B40] via-[#0b484e] to-[#062c30] text-white p-5 sm:p-6 shadow-md border border-[#13545A] space-y-4">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/10 text-[#B9E2DD] border border-white/15 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>আজকের সুরক্ষা রুটিন</span>
                <span className="text-[11px] font-medium text-[#B9E2DD] font-mono">
                  ({routineStatus.completedCount}/{routineStatus.total})
                </span>
              </h2>
              <p className="text-[11px] text-[#B9E2DD]/80">
                প্রতিদিনের মৌলিক আমল দ্বারা নিজেকে ও পরিবারকে সুরক্ষিত রাখুন
              </p>
            </div>
          </div>

          {/* Completion Percentage Badge */}
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#B9E2DD] text-xs font-mono font-bold">
              {routineStatus.percentage}% সম্পন্ন
            </span>
          </div>
        </div>

        {/* Progress Bar in Pearl Accent */}
        <div className="w-full bg-black/35 rounded-full h-2 overflow-hidden border border-white/10">
          <div
            className="bg-[#B9E2DD] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${routineStatus.percentage}%` }}
          />
        </div>

        {/* Scan-Friendly Routine Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {dailyRoutineItems.map((item) => {
            const isChecked = routineStatus.completedIds.includes(item.id);
            const isItemPlaying = activeItem?.id === item.id && isPlaying;

            return (
              <div
                key={item.id}
                onClick={() => handlePlayItem(item)}
                className={`flex items-start justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-white/15 border-[#B9E2DD]/60 text-white'
                    : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0 pr-2">
                  <button
                    onClick={(e) => handleToggleRoutineCheck(item.id, e)}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer ${
                      isChecked
                        ? 'bg-[#B9E2DD] border-[#B9E2DD] text-[#083B40] font-bold shadow-xs'
                        : 'border-white/30 hover:border-[#B9E2DD] text-transparent'
                    }`}
                    title={isChecked ? 'সম্পন্ন (আনচেক করতে ট্যাপ করুন)' : 'সম্পন্ন করুন'}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="min-w-0">
                    <span className="text-xs font-bold block leading-snug line-clamp-2">
                      {item.titleBn}
                    </span>
                    <span className="text-[10px] text-[#B9E2DD]/80 block mt-0.5">
                      {item.repeatNoteBn || `${item.repeatCount} বার পাঠ্য`}
                    </span>
                  </div>
                </div>

                {/* Secondary Play Trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isItemPlaying) {
                      handleTogglePlayPause();
                    } else {
                      handlePlayItem(item);
                    }
                  }}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer ${
                    isItemPlaying
                      ? 'bg-[#B9E2DD] text-[#083B40] font-bold'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  title={isItemPlaying ? 'পজ করুন' : 'শুনুন'}
                >
                  {isItemPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* PRIMARY CTA: “Play Daily Ruqyah” IN SOLID PRIMARY TEAL (#0F5F62) */}
        <div className="pt-2">
          <button
            onClick={handlePlayDailyRuqyah}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#0F5F62] hover:bg-[#083B40] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md active:scale-98 transition-all group cursor-pointer border border-[#B9E2DD]/30"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <span>Play Daily Ruqyah · সম্পূর্ণ দৈনিক সুরক্ষা অডিও শুনুন</span>
          </button>
        </div>
      </section>

      {/* 2. SMART RUQYAH SEARCH: Welcoming input with Bangla, Banglish & English */}
      <section className="rounded-3xl bg-white dark:bg-[#142042] p-4 sm:p-5 border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#1F2937] dark:text-white">
              স্মার্ট রুকইয়াহ সার্চ ও সমস্যা নির্দেশিকা
            </h3>
          </div>
          <span className="text-[10px] text-[#6B7280] dark:text-slate-400">বাংলা, Banglish বা English</span>
        </div>

        {/* Welcoming Input Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="আপনার সমস্যা বা লক্ষণ লিখুন (যেমন: bad nojor, ghume chepe dhore, jin er voy)..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#F8E8ED]/70 dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#24386E] text-xs sm:text-sm text-[#1F2937] dark:text-white placeholder-[#6B7280] focus:outline-hidden focus:ring-2 focus:ring-[#21409A]/40 transition-all"
          />
          <Search className="w-4.5 h-4.5 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="w-6 h-6 rounded-full bg-[#E7D9DE] dark:bg-slate-700 text-[#1F2937] absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {intentQuickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                triggerHaptic(10);
                setSearchQuery(chip.query);
              }}
              className="text-[11px] px-2.5 py-1 rounded-full bg-[#F8E8ED] dark:bg-[#10235A] text-[#10235A] dark:text-[#F8E8ED] hover:bg-[#E9B7C3]/40 border border-[#E7D9DE] dark:border-[#24386E] transition-colors cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* SINGLE CLEAN RESULT CARD (when user searches) */}
        {intentAnalysis && (
          <div className="mt-3 p-4 rounded-2xl bg-[#F8E8ED] dark:bg-[#10235A]/60 border border-[#E9B7C3] dark:border-[#24386E] space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#21409A] dark:text-[#E9B7C3] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                শনাক্তকৃত ক্যাটাগরি: {intentAnalysis.categoryMeta.nameBn}
              </span>
              <span className="text-[10px] bg-[#21409A]/15 text-[#21409A] dark:text-[#E9B7C3] font-bold px-2 py-0.5 rounded-full">
                মিল: {Math.round(intentAnalysis.confidence * 100)}%
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#1F2937] dark:text-white">
                {intentAnalysis.intentTitleBn}
              </h4>
              <p className="text-xs text-[#1F2937] dark:text-slate-300 mt-1 leading-relaxed">
                💡 <strong>কেন এই আমল:</strong> {intentAnalysis.recommendedReasonBn}
              </p>
            </div>

            {/* Medical Alert Warning if required */}
            {intentAnalysis.medicalAdviceRequired && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p>{intentAnalysis.medicalAlertMessageBn}</p>
              </div>
            )}

            {/* Primary Recommended Ruqyah Action */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-[#21409A] dark:text-[#E9B7C3] font-bold uppercase block">
                  প্রধান প্রস্তাবিত রুকইয়াহ
                </span>
                <span className="text-xs font-bold text-[#1F2937] dark:text-white truncate block">
                  {intentAnalysis.primaryRuqyah.titleBn}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setDetailItem(intentAnalysis.primaryRuqyah)}
                  className="px-3 py-1.5 rounded-xl border border-[#21409A] text-[#21409A] dark:text-[#E9B7C3] dark:border-[#E9B7C3]/50 text-xs font-semibold hover:bg-[#F8E8ED] dark:hover:bg-[#1C2D5A] cursor-pointer"
                >
                  নিয়ম দেখুন
                </button>
                <button
                  onClick={() => handlePlayItem(intentAnalysis.primaryRuqyah)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#F8E8ED] dark:bg-[#10235A] text-[#10235A] dark:text-[#E9B7C3] border border-[#21409A]/30 text-xs font-bold flex items-center gap-1.5 hover:bg-[#E9B7C3]/30 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>শুনুন</span>
                </button>
              </div>
            </div>

            {/* Toggle to see all ruqyahs if desired */}
            <div className="pt-1 text-center">
              <button
                onClick={() => setShowAllAfterSearch((prev) => !prev)}
                className="text-xs font-bold text-[#21409A] dark:text-[#E9B7C3] hover:underline cursor-pointer"
              >
                {showAllAfterSearch ? 'বাকি ফলাফলগুলো সংক্ষেপ করুন' : 'সকল রুকইয়াহ দেখুন (See all Ruqyah) &rarr;'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3. RUQYAH CATEGORIES & ITEMS (Hidden if user searched and matching result is displayed, unless toggled) */}
      {(!intentAnalysis || showAllAfterSearch) && (
        <>
          {/* CATEGORIES GRID */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#1F2937] dark:text-white flex items-center gap-1.5">
                  <span>রুকইয়াহ ক্যাটাগরি</span>
                  <span className="text-xs text-[#6B7280] font-normal">({RUQYAH_CATEGORIES.length}টি বিভাগ)</span>
                </h3>
                <p className="text-[11px] text-[#6B7280]">আপনার প্রয়োজনীয় বিষয়ে ক্লিক করে রুকইয়াহ নির্বাচন করুন</p>
              </div>

              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-xs text-[#21409A] dark:text-[#E9B7C3] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>সবগুলো দেখুন</span>
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {RUQYAH_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;

                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      triggerHaptic(15);
                      setSelectedCategory(isSelected ? 'all' : cat.id);
                    }}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-[#F8E8ED] dark:bg-[#1C2D5A] border-[#21409A] shadow-xs'
                        : 'bg-white dark:bg-[#142042] border-[#E7D9DE] dark:border-[#1C2D5A] hover:border-[#21409A]/40 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          isSelected
                            ? 'bg-[#21409A] text-white shadow-xs'
                            : 'bg-[#F8E8ED] dark:bg-[#10235A] text-[#21409A] dark:text-[#E9B7C3] border border-[#E7D9DE] dark:border-[#24386E]'
                        }`}
                      >
                        {getCategoryIcon(cat.iconName)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1F2937] dark:text-white truncate">
                            {cat.nameBn}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F8E8ED] dark:bg-[#10235A] text-[#10235A] dark:text-[#E9B7C3] font-mono font-bold shrink-0">
                            {cat.totalCount}টি
                          </span>
                        </div>

                        <p className="text-[11px] text-[#6B7280] dark:text-slate-400 line-clamp-2 mt-1 leading-normal">
                          {cat.descriptionBn}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ITEM LIST ACCORDING TO CATEGORY & FILTER */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-[#1F2937] dark:text-white">
                {selectedCategory === 'all'
                  ? 'সকল রুকইয়াহ তালিকা'
                  : RUQYAH_CATEGORIES.find((c) => c.id === selectedCategory)?.nameBn}
              </h3>
              <span className="text-xs text-[#6B7280] font-mono">
                {displayedItems.length}টি দোয়া
              </span>
            </div>

            <div className="space-y-3">
              {displayedItems.map((item) => {
                const isPlayingThis = activeItem?.id === item.id && isPlaying;
                const isFav = favorites.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-3xl border transition-all duration-200 shadow-2xs space-y-3 ${
                      isPlayingThis
                        ? 'bg-[#F8E8ED] dark:bg-[#142042] border-[#21409A] border-l-4'
                        : 'bg-white dark:bg-[#142042] border-[#E7D9DE] dark:border-[#1C2D5A] hover:border-[#21409A]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-[#1F2937] dark:text-white">
                          {item.titleBn}
                        </h4>
                        <span className="font-arabic text-xs text-[#21409A] dark:text-[#E9B7C3] block mt-0.5" dir="rtl">
                          {item.titleAr}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => handleToggleFavorite(item.id, e)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B7280] hover:text-[#21409A] cursor-pointer"
                          title="বুকমার্ক"
                        >
                          <Bookmark className={`w-4 h-4 ${isFav ? 'text-[#21409A] dark:text-[#E9B7C3] fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => handleShareItem(item, e)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B7280] hover:text-[#21409A] cursor-pointer"
                          title="শেয়ার"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text Preview */}
                    <div className="py-1 text-right" dir="rtl">
                      <p className="font-uthmani text-base sm:text-lg text-[#10235A] dark:text-white font-bold leading-relaxed line-clamp-2">
                        {item.arabic}
                      </p>
                    </div>

                    {/* Meaning */}
                    <p className="text-xs text-[#1F2937] dark:text-slate-300 font-bengali line-clamp-2 leading-relaxed">
                      "{item.translationBn}"
                    </p>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#E7D9DE]/60 dark:border-[#1C2D5A] text-xs">
                      <span className="text-[11px] text-[#6B7280] font-mono">
                        {item.repeatNoteBn || `${item.repeatCount} বার পাঠ্য`}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDetailItem(item)}
                          className="px-3 py-1.5 rounded-xl border border-[#21409A] text-[#21409A] dark:text-[#E9B7C3] dark:border-[#E9B7C3]/50 font-semibold hover:bg-[#F8E8ED] dark:hover:bg-[#1C2D5A] cursor-pointer"
                        >
                          বিস্তারিত ও নিয়ম
                        </button>

                        <button
                          onClick={() => handlePlayItem(item)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#F8E8ED] dark:bg-[#10235A] text-[#10235A] dark:text-[#E9B7C3] border border-[#21409A]/30 font-bold flex items-center gap-1.5 hover:bg-[#E9B7C3]/30 cursor-pointer"
                        >
                          {isPlayingThis ? (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current" />
                              <span>বিরতি</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>শুনুন</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* DETAIL MODAL FOR RUQYAH ITEM */}
      {detailItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0C152E] rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#E7D9DE] dark:border-[#1C2D5A] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1F2937] dark:text-white">
                {detailItem.titleBn}
              </h3>
              <button
                onClick={() => setDetailItem(null)}
                className="w-8 h-8 rounded-full hover:bg-[#F8E8ED] dark:hover:bg-[#142042] flex items-center justify-center text-[#6B7280] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Purpose */}
              <div className="p-3 rounded-2xl bg-[#F8E8ED] dark:bg-[#10235A] border border-[#E7D9DE] dark:border-[#24386E] text-[#10235A] dark:text-[#F8E8ED] space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-[#21409A] dark:text-[#E9B7C3]">
                  <Info className="w-3.5 h-3.5" />
                  কেন এই রুকইয়াহ এবং কী প্রয়োজনে পড়া হয়:
                </span>
                <p className="leading-relaxed">{detailItem.purposeBn}</p>
                {detailItem.targetBenefitBn && (
                  <p className="font-semibold text-[#21409A] dark:text-[#E9B7C3] pt-1">
                    ✨ প্রত্যক্ষ ফায়দা: {detailItem.targetBenefitBn}
                  </p>
                )}
              </div>

              {/* Arabic Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] text-right" dir="rtl">
                <p className="font-uthmani text-xl sm:text-2xl font-bold leading-loose text-[#10235A] dark:text-white">
                  {detailItem.arabic}
                </p>
              </div>

              {/* Transliteration & Meaning */}
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-[#F8E8ED]/70 dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#24386E]">
                  <span className="font-bold block text-[11px] text-[#21409A] dark:text-[#E9B7C3] mb-0.5">
                    উচ্চারণ:
                  </span>
                  <p className="leading-relaxed text-[#1F2937] dark:text-slate-200">{detailItem.transliterationBn}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A]">
                  <span className="font-bold block text-[11px] text-[#6B7280] mb-0.5">অর্থ:</span>
                  <p className="leading-relaxed text-[#1F2937] dark:text-slate-100">"{detailItem.translationBn}"</p>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-[#1F2937] dark:text-white flex items-center gap-1.5">
                  <CheckCheck className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />
                  <span>ধাপে ধাপে আমল করার নিয়মাবলী:</span>
                </h5>
                <ol className="space-y-1.5 text-[#1F2937] dark:text-slate-300 list-decimal list-inside pl-1">
                  {detailItem.instructionsBn.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Hadith / Quran Source Verification */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A]">
                <span className="font-bold text-[#1F2937] dark:text-slate-300 block mb-0.5">
                  সহিহ সূত্র ও রেফারেন্স:
                </span>
                <p className="text-[#6B7280] dark:text-slate-400 font-mono text-[11px]">
                  {detailItem.source}
                </p>
                {detailItem.repeatNoteBn && (
                  <span className="text-[11px] text-[#21409A] dark:text-[#E9B7C3] font-bold block mt-1">
                    কখন ও কতবার পাঠ্য: {detailItem.repeatNoteBn}
                  </span>
                )}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-[#E7D9DE] dark:border-[#1C2D5A] bg-white dark:bg-[#0C152E] flex items-center gap-2">
              <button
                onClick={() => {
                  handlePlayItem(detailItem);
                  setDetailItem(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#21409A] hover:bg-[#10235A] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>এখনই অডিও শুনুন</span>
              </button>

              <button
                onClick={() => setDetailItem(null)}
                className="py-3 px-4 rounded-xl bg-[#F8E8ED] dark:bg-[#142042] text-[#10235A] dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. COMPACT MINI AUDIO PLAYER (Fixed Above Bottom Navigation) */}
      {activeItem && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-2 sm:px-4 max-w-lg mx-auto">
          <div className="rounded-3xl bg-[#10235A]/95 text-white backdrop-blur-md p-3 sm:p-3.5 shadow-xl border border-[#24386E] space-y-2">
            {/* Progress Bar in Rose Quartz */}
            <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
              <div
                className="bg-[#E9B7C3] h-full rounded-full transition-all duration-200"
                style={{ width: `${currentProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              {/* Item Info */}
              <div
                onClick={() => setDetailItem(activeItem)}
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/15 text-[#E9B7C3] flex items-center justify-center shrink-0">
                  <Volume2 className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <div className="truncate">
                  <h5 className="text-xs font-bold text-white truncate">
                    {activeItem.titleBn}
                  </h5>
                  <div className="flex items-center gap-2 text-[10px] text-[#F8E8ED]/80">
                    <span>{currentTimeFormatted} / {durationFormatted}</span>
                    <span>•</span>
                    <span className="text-[#E9B7C3]">{isSlowMode ? 'লার্ন অডিও (0.8x)' : `${playbackSpeed}x`}</span>
                    {sleepTimeRemaining !== null && (
                      <span className="text-[#E9B7C3] font-mono">
                        ⏰ {Math.ceil(sleepTimeRemaining / 60)} মি.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handlePrevTrack}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                  title="পূর্ববর্তী"
                >
                  <SkipBack className="w-4 h-4 fill-current" />
                </button>

                <button
                  onClick={handleTogglePlayPause}
                  className="w-9 h-9 rounded-full bg-[#E9B7C3] text-[#10235A] font-bold flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
                  title={isPlaying ? 'পজ' : 'চালু করুন'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNextTrack}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                  title="পরবর্তী"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>

                {/* Sleep Timer Preset */}
                <button
                  onClick={() => {
                    triggerHaptic(10);
                    const presets = [null, 15, 30, 60];
                    const curIndex = presets.indexOf(sleepTimerMinutes);
                    const next = presets[(curIndex + 1) % presets.length];
                    setSleepTimerMinutes(next);
                    if (next) showToast(`স্লিপ টাইমার: ${next} মিনিট`);
                    else showToast('স্লিপ টাইমার বন্ধ');
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    sleepTimerMinutes ? 'bg-[#E9B7C3]/20 text-[#E9B7C3]' : 'text-slate-400 hover:text-white'
                  }`}
                  title="স্লিপ টাইমার"
                >
                  <Clock className="w-3.5 h-3.5" />
                </button>

                {/* Close Player */}
                <button
                  onClick={() => {
                    if (audioRef.current) audioRef.current.pause();
                    setIsPlaying(false);
                    setActiveItem(null);
                  }}
                  className="w-7 h-7 rounded-full text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                  title="বন্ধ করুন"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RuqyahHome;
