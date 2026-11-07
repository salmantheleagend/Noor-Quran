import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage } from '../types';
import { DAILY_AYAHS_LIST, DailyAyahItem } from '../data/dailyAyahData';
import {
  triggerHaptic,
  speakArabic,
  getDailyAyahPlaylist,
  AyahAudioTrack,
  speakAyahTranslation,
  stopSpeechAudio,
} from '../utils/audioPlayer';
import {
  BookOpen,
  RotateCw,
  Share2,
  Check,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  Bookmark,
  Languages,
} from 'lucide-react';

interface DailyAyahWidgetProps {
  language: AppLanguage;
  onNavigate: (tab: string, extra?: unknown) => void;
  toBn: (num: number | string) => string;
}

export const DailyAyahWidget: React.FC<DailyAyahWidgetProps> = ({
  language,
  onNavigate,
  toBn,
}) => {
  const isBn = language === 'bn';

  // Deterministic daily index based on day of year
  const defaultDailyIndex = useMemo(() => {
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.abs(dayOfYear) % DAILY_AYAHS_LIST.length;
  }, []);

  const [currentIndex, setCurrentIndex] = useState<number>(defaultDailyIndex);
  const [showTransliteration, setShowTransliteration] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  // Audio state: 'idle' | 'tilawat' (Arabic recitation) | 'ortho' (translation speech)
  const [audioState, setAudioState] = useState<'idle' | 'tilawat' | 'ortho'>('idle');
  const ayahAudioRef = useRef<HTMLAudioElement | null>(null);
  const playlistIndexRef = useRef<number>(0);
  const currentPlaylistRef = useRef<AyahAudioTrack[]>([]);

  const currentAyah: DailyAyahItem = DAILY_AYAHS_LIST[currentIndex] || DAILY_AYAHS_LIST[0];

  // Stop all active audio & speech synthesis
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

  // Clean up audio on unmount or index change
  useEffect(() => {
    return () => {
      stopAllAyahAudio();
    };
  }, [currentIndex]);

  // Handle randomly selecting another Ayah
  const handleRandomizeAyah = () => {
    triggerHaptic(20);
    stopAllAyahAudio();
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 500);

    let nextIndex: number;
    do {
      nextIndex = Math.floor(Math.random() * DAILY_AYAHS_LIST.length);
    } while (nextIndex === currentIndex && DAILY_AYAHS_LIST.length > 1);

    setCurrentIndex(nextIndex);
  };

  // Play audio recitation followed by translation
  const handlePlayAyahAudio = () => {
    triggerHaptic(15);
    if (audioState !== 'idle') {
      stopAllAyahAudio();
      return;
    }

    // Prime speech synthesis during user click
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const primer = new SpeechSynthesisUtterance('');
        primer.volume = 0;
        window.speechSynthesis.speak(primer);
      } catch {
        // ignore
      }
    }

    const playlist = getDailyAyahPlaylist(currentAyah, isBn ? 'bn' : 'en');
    currentPlaylistRef.current = playlist;
    playlistIndexRef.current = 0;

    if (playlist.length === 0) return;

    if (!ayahAudioRef.current) {
      ayahAudioRef.current = new Audio();
      try {
        (ayahAudioRef.current as HTMLAudioElement & { referrerPolicy?: string }).referrerPolicy = 'no-referrer';
      } catch {
        // ignore
      }
    }
    const audio = ayahAudioRef.current;

    setAudioState('tilawat');
    audio.src = playlist[0].url;

    audio.onended = () => {
      setAudioState('ortho');
      speakAyahTranslation(
        currentAyah.translationBn,
        isBn ? 'bn' : 'en',
        () => setAudioState('idle'),
        () => setAudioState('idle')
      );
    };

    audio.onerror = () => {
      speakArabic(currentAyah.textArabic);
      setTimeout(() => {
        setAudioState('ortho');
        speakAyahTranslation(
          currentAyah.translationBn,
          isBn ? 'bn' : 'en',
          () => setAudioState('idle'),
          () => setAudioState('idle')
        );
      }, 3500);
    };

    audio.play().catch((err) => {
      console.warn('Playback error, falling back to speech:', err);
      setAudioState('ortho');
      speakAyahTranslation(
        currentAyah.translationBn,
        isBn ? 'bn' : 'en',
        () => setAudioState('idle'),
        () => setAudioState('idle')
      );
    });
  };

  // Copy Ayah text & reference to clipboard
  const handleCopyAyah = async () => {
    triggerHaptic(15);
    const surahRef = isBn
      ? `সূরা ${currentAyah.surahNameBn}, আয়াত ${toBn(currentAyah.ayahNumber)}`
      : `Surah ${currentAyah.surahNameEn || currentAyah.surahNumber}, Ayah ${currentAyah.ayahNumber}`;

    const textToCopy = `${currentAyah.textArabic}\n\n"${isBn ? currentAyah.translationBn : (currentAyah.translationEn || currentAyah.translationBn)}"\n\n— ${surahRef}\n[নূর কুরআন • Noor Quran]`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy ayah:', err);
    }
  };

  // Share Ayah using native Web Share API
  const handleShareAyah = async () => {
    triggerHaptic(15);
    const surahRef = isBn
      ? `সূরা ${currentAyah.surahNameBn}, আয়াত ${toBn(currentAyah.ayahNumber)}`
      : `Surah ${currentAyah.surahNameEn || currentAyah.surahNumber}, Ayah ${currentAyah.ayahNumber}`;

    const textToShare = `${currentAyah.textArabic}\n\n"${isBn ? currentAyah.translationBn : (currentAyah.translationEn || currentAyah.translationBn)}"\n\n— ${surahRef}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: isBn ? `আজকের আয়াত: ${surahRef}` : `Daily Ayah: ${surahRef}`,
          text: textToShare,
        });
        return;
      } catch {
        // fallback to copy
      }
    }
    handleCopyAyah();
  };

  return (
    <motion.section
      key={currentAyah.id || currentIndex}
      initial={{ opacity: 0, y: 12, scale: 0.985 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: [0.985, 1.012, 0.998, 1],
        boxShadow: [
          '0 2px 4px 0 rgba(33, 64, 154, 0.04)',
          '0 12px 28px -4px rgba(33, 64, 154, 0.18), 0 0 0 3px rgba(33, 64, 154, 0.12)',
          '0 2px 4px 0 rgba(33, 64, 154, 0.04)',
        ],
      }}
      transition={{
        duration: 1.15,
        ease: [0.25, 1, 0.5, 1],
      }}
      className="rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] border-t-4 border-t-[#21409A] p-4 sm:p-5 shadow-2xs space-y-3.5 relative overflow-hidden transition-all"
    >
      {/* Subtle pulsing accent sheen along top accent */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0.7 }}
        animate={{ opacity: [0.35, 0.9, 0.45], scaleX: [0.7, 1, 0.85] }}
        transition={{ duration: 2.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        className="absolute top-0 left-0 right-0 h-[2.5px] bg-linear-to-r from-transparent via-[#21409A] dark:via-[#E9B7C3] to-transparent pointer-events-none"
      />

      {/* 1. Header with Title, Theme Badge & Quick Action Buttons */}
      <div className="flex items-center justify-between border-b border-[#E7D9DE] dark:border-[#1C2D5A] pb-3 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-10 h-10 rounded-2xl bg-linear-to-br from-[#21409A]/15 via-[#21409A]/10 to-[#10235A]/15 dark:from-[#21409A]/30 dark:to-[#10235A]/20 text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center shrink-0 border border-[#21409A]/20 shadow-2xs overflow-hidden">
            <motion.span
              animate={{
                scale: [1, 1.45, 1.7],
                opacity: [0.35, 0.15, 0],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute inset-0 rounded-2xl bg-[#21409A] dark:bg-[#E9B7C3] pointer-events-none"
            />
            <BookOpen className="w-5 h-5 stroke-[2.2] relative z-10" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm sm:text-base font-extrabold text-[#1F2937] dark:text-white leading-tight">
                {isBn ? 'আজকের আয়াত' : 'Daily Ayah'}
              </h3>
              {currentAyah.themeBn && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F8E8ED] dark:bg-[#10235A] text-[#10235A] dark:text-[#E9B7C3] border border-[#E7D9DE] dark:border-[#24386E]">
                  <Sparkles className="w-2.5 h-2.5 text-[#21409A] dark:text-[#E9B7C3]" />
                  <span>{isBn ? currentAyah.themeBn : (currentAyah.themeEn || currentAyah.themeBn)}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 truncate mt-0.5">
              {isBn
                ? `সূরা ${currentAyah.surahNameBn} (${currentAyah.surahNameEn}) · আয়াত ${toBn(currentAyah.ayahNumber)}`
                : `Surah ${currentAyah.surahNameEn || currentAyah.surahNumber} · Ayah ${currentAyah.ayahNumber}`}
            </p>
          </div>
        </div>

        {/* Action Controls: Shuffle & Share */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleRandomizeAyah}
            className="flex items-center gap-1 text-xs font-semibold text-[#21409A] dark:text-[#E9B7C3] hover:text-[#10235A] dark:hover:text-white bg-[#F8E8ED] dark:bg-[#1C2D5A] hover:bg-[#E9B7C3]/50 dark:hover:bg-[#24386E] px-2.5 py-1.5 rounded-xl border border-[#E7D9DE] dark:border-[#24386E] transition-colors cursor-pointer active:scale-95"
            title={isBn ? 'অন্য একটি আয়াত দেখুন' : 'View another randomly selected Ayah'}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline text-[11px]">
              {isBn ? 'অন্য আয়াত' : 'New Ayah'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleShareAyah}
            className="p-1.5 rounded-xl text-[#6B7280] dark:text-slate-300 hover:text-[#21409A] dark:hover:text-[#E9B7C3] hover:bg-[#F8E8ED] dark:hover:bg-[#1C2D5A] border border-transparent hover:border-[#E7D9DE] dark:hover:border-[#24386E] transition-colors cursor-pointer active:scale-95"
            title={isBn ? 'আয়াতটি শেয়ার করুন' : 'Share Ayah'}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Arabic Ayah Text with Calligraphy */}
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
        className="py-1"
      >
        <p
          className="font-uthmani text-xl sm:text-2xl leading-loose text-center text-[#10235A] dark:text-white font-bold select-text px-1"
          dir="rtl"
        >
          {currentAyah.textArabic}
        </p>
      </motion.div>

      {/* 3. Optional Bengali Transliteration / Pronunciation */}
      {showTransliteration && currentAyah.transliterationBn && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="bg-[#F8E8ED]/60 dark:bg-[#10235A]/40 p-2.5 rounded-xl border border-[#E7D9DE]/80 dark:border-[#24386E]/60 text-xs text-[#10235A] dark:text-[#E9B7C3] text-center font-medium"
        >
          <span className="font-bold mr-1">উচ্চারণ:</span>
          <span>{currentAyah.transliterationBn}</span>
        </motion.div>
      )}

      {/* 4. Translation Box */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.18, ease: 'easeOut' }}
        className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800"
      >
        <p
          className={`text-sm sm:text-base text-[#1F2937] dark:text-slate-100 text-center leading-relaxed font-normal select-text ${
            isBn ? 'font-bengali' : 'font-sans'
          }`}
        >
          "{isBn ? currentAyah.translationBn : (currentAyah.translationEn || currentAyah.translationBn)}"
        </p>
      </motion.div>

      {/* 5. Audio State Playing Indicator (when active) */}
      {audioState !== 'idle' && (
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold animate-in fade-in duration-200 ${
            audioState === 'tilawat'
              ? 'bg-[#F8E8ED] dark:bg-[#10235A] border-[#E9B7C3] dark:border-[#24386E] text-[#10235A] dark:text-[#F8E8ED]'
              : 'bg-[#F8E8ED] dark:bg-[#10235A] border-[#21409A]/40 dark:border-[#E9B7C3]/40 text-[#21409A] dark:text-[#E9B7C3]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 animate-pulse shrink-0" />
            <span>
              {audioState === 'tilawat'
                ? (isBn
                    ? `তেলাওয়াত চলছে... (সূরা ${currentAyah.surahNameBn} - আয়াত ${toBn(currentAyah.ayahNumber)})`
                    : `Reciting Ayah... (Surah ${currentAyah.surahNameEn || currentAyah.surahNumber} - Ayah ${currentAyah.ayahNumber})`)
                : (isBn
                    ? 'অনুবাদ পাঠ চলছে...'
                    : 'Speaking translation...')}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-1 h-3 bg-current rounded-full animate-pulse" />
            <span className="w-1 h-4.5 bg-current rounded-full animate-pulse delay-75" />
            <span className="w-1 h-2 bg-current rounded-full animate-pulse delay-150" />
          </div>
        </div>
      )}

      {/* 6. Footer Controls: Audio, Pronunciation Toggle, Copy & Read in Quran */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E7D9DE] dark:border-[#1C2D5A] text-xs flex-wrap">
        {/* Left Actions: Audio & Transliteration toggle */}
        <div className="flex items-center gap-2">
          {/* Audio Listen / Stop */}
          <button
            type="button"
            onClick={handlePlayAyahAudio}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all active:scale-95 cursor-pointer shadow-2xs ${
              audioState !== 'idle'
                ? 'bg-rose-700 hover:bg-rose-800 text-white'
                : 'bg-[#F8E8ED] dark:bg-[#1C2D5A] text-[#10235A] dark:text-[#F8E8ED] hover:bg-[#E9B7C3]/40 border border-[#E7D9DE] dark:border-[#24386E]'
            }`}
            title={isBn ? 'আয়াতটির আরবি তেলাওয়াত শুনুন' : 'Listen to Arabic recitation'}
          >
            {audioState !== 'idle' ? (
              <>
                <VolumeX className="w-4 h-4 animate-pulse" />
                <span>{isBn ? 'থামান' : 'Stop'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />
                <span>{isBn ? 'তিলাওয়াত শুনুন' : 'Listen'}</span>
              </>
            )}
          </button>

          {/* Pronunciation toggle */}
          {currentAyah.transliterationBn && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setShowTransliteration((prev) => !prev);
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-medium transition-colors cursor-pointer border ${
                showTransliteration
                  ? 'bg-[#21409A] text-white border-[#21409A]'
                  : 'bg-white dark:bg-[#142042] text-[#6B7280] dark:text-slate-300 hover:text-[#21409A] border-[#E7D9DE] dark:border-[#1C2D5A]'
              }`}
              title={isBn ? 'বাংলা উচ্চারণ দেখুন' : 'Toggle pronunciation'}
            >
              <Languages className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden xs:inline">{isBn ? 'উচ্চারণ' : 'Pronounce'}</span>
            </button>
          )}

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyAyah}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:text-[#21409A] dark:hover:text-[#E9B7C3] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95 border border-slate-200/60 dark:border-slate-700/60"
            title={isBn ? 'ক্লিপবোর্ডে কপি করুন' : 'Copy Ayah'}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#21409A]" />
                <span className="text-[#21409A] font-bold text-[11px]">
                  {isBn ? 'কপি হয়েছে' : 'Copied'}
                </span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span className="text-[11px]">{isBn ? 'কপি' : 'Copy'}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Action: Read in Quran */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(15);
            onNavigate('quran', currentAyah.surahNumber);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[#21409A] dark:text-[#E9B7C3] hover:bg-[#F8E8ED] dark:hover:bg-[#10235A] transition-all active:scale-95 border border-[#21409A]/40 dark:border-[#E9B7C3]/40 cursor-pointer"
        >
          <span>{isBn ? 'কুরআনে পড়ুন' : 'Read in Quran'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.section>
  );
};
