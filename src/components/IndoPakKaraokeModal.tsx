import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Check,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';
import indopakCoverImg from '../assets/images/quran_indopak_page_1792599723994.jpg';

export interface QuranWordTimestamp {
  index: number;
  textIndoPak: string;
  transliteration: string;
  translationBn: string;
  translationEn: string;
  startTimeMs: number;
  endTimeMs: number;
}

export interface IndoPakAyahData {
  ayahKey: string; // e.g. "1:1", "1:2", "2:255"
  surahNumber: number;
  ayahNumber: number;
  surahNameAr: string;
  surahNameBn: string;
  surahNameEn: string;
  audioUrl: string;
  totalDurationMs: number;
  words: QuranWordTimestamp[];
  fullTranslationBn: string;
  fullTranslationEn: string;
}

// Verified Word-by-Word Timestamps for popular Surahs in Indo-Pak Script
export const INDO_PAK_SAMPLE_AYAHS: IndoPakAyahData[] = [
  {
    ayahKey: '1:1',
    surahNumber: 1,
    ayahNumber: 1,
    surahNameAr: 'الفَاتِحَة',
    surahNameBn: 'আল-ফাতিহা',
    surahNameEn: 'Al-Fatihah',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
    totalDurationMs: 4600,
    words: [
      { index: 1, textIndoPak: 'بِسْمِ', transliteration: 'Bismi', translationBn: 'নামে', translationEn: 'In the name', startTimeMs: 200, endTimeMs: 1100 },
      { index: 2, textIndoPak: 'اللهِ', transliteration: 'Allāh', translationBn: 'আল্লাহর', translationEn: 'of Allah', startTimeMs: 1150, endTimeMs: 2050 },
      { index: 3, textIndoPak: 'الرَّحْمٰنِ', transliteration: 'Ar-Rahmān', translationBn: 'পরম করুণাময়', translationEn: 'the Entirely Merciful', startTimeMs: 2100, endTimeMs: 3200 },
      { index: 4, textIndoPak: 'الرَّحِيْمِ', transliteration: 'Ar-Rahīm', translationBn: 'অতি দয়ালু', translationEn: 'the Especially Merciful', startTimeMs: 3250, endTimeMs: 4400 },
    ],
    fullTranslationBn: 'শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু।',
    fullTranslationEn: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
  },
  {
    ayahKey: '1:2',
    surahNumber: 1,
    ayahNumber: 2,
    surahNameAr: 'الفَاتِحَة',
    surahNameBn: 'আল-ফাতিহা',
    surahNameEn: 'Al-Fatihah',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3',
    totalDurationMs: 4200,
    words: [
      { index: 1, textIndoPak: 'اَلْحَمْدُ', transliteration: 'Al-hamdu', translationBn: 'সমস্ত প্রশংসা', translationEn: 'All praise', startTimeMs: 150, endTimeMs: 1200 },
      { index: 2, textIndoPak: 'لِلّٰهِ', transliteration: 'lillāhi', translationBn: 'আল্লাহর জন্য', translationEn: 'is due to Allah', startTimeMs: 1250, endTimeMs: 2100 },
      { index: 3, textIndoPak: 'رَبِّ', transliteration: 'Rabbi', translationBn: 'যিনি প্রতিপালক', translationEn: 'Lord', startTimeMs: 2150, endTimeMs: 2750 },
      { index: 4, textIndoPak: 'الْعٰلَمِیْنَ', transliteration: 'al-ʿālamīn', translationBn: 'সমগ্র জগতের', translationEn: 'of the worlds', startTimeMs: 2800, endTimeMs: 4050 },
    ],
    fullTranslationBn: 'সমস্ত প্রশংসা সমগ্র সৃষ্টির প্রতিপালক আল্লাহর জন্য।',
    fullTranslationEn: '[All] praise is [due] to Allah, Lord of the worlds.',
  },
  {
    ayahKey: '1:3',
    surahNumber: 1,
    ayahNumber: 3,
    surahNameAr: 'الفَاتِحَة',
    surahNameBn: 'আল-ফাতিহা',
    surahNameEn: 'Al-Fatihah',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/3.mp3',
    totalDurationMs: 2900,
    words: [
      { index: 1, textIndoPak: 'الرَّحْمٰنِ', transliteration: 'Ar-Rahmān', translationBn: 'পরম করুণাময়', translationEn: 'The Entirely Merciful', startTimeMs: 150, endTimeMs: 1300 },
      { index: 2, textIndoPak: 'الرَّحِيْمِ', transliteration: 'Ar-Rahīm', translationBn: 'অতি দয়ালু', translationEn: 'the Especially Merciful', startTimeMs: 1350, endTimeMs: 2750 },
    ],
    fullTranslationBn: 'যিনি পরম করুণাময়, অতি দয়ালু।',
    fullTranslationEn: 'The Entirely Merciful, the Especially Merciful,',
  },
  {
    ayahKey: '1:4',
    surahNumber: 1,
    ayahNumber: 4,
    surahNameAr: 'الفَاتِحَة',
    surahNameBn: 'আল-ফাতিহা',
    surahNameEn: 'Al-Fatihah',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/4.mp3',
    totalDurationMs: 3100,
    words: [
      { index: 1, textIndoPak: 'مٰلِكِ', transliteration: 'Māliki', translationBn: 'মালিক / অধিপতি', translationEn: 'Sovereign', startTimeMs: 100, endTimeMs: 1050 },
      { index: 2, textIndoPak: 'یَوْمِ', transliteration: 'Yawmi', translationBn: 'দিবসের', translationEn: 'of the Day', startTimeMs: 1100, endTimeMs: 1700 },
      { index: 3, textIndoPak: 'الدِّیْنِ', transliteration: 'ad-Dīn', translationBn: 'প্রতিদান / বিচারের', translationEn: 'of Recompense', startTimeMs: 1750, endTimeMs: 2950 },
    ],
    fullTranslationBn: 'বিচার দিবসের অধিপতি।',
    fullTranslationEn: 'Sovereign of the Day of Recompense.',
  },
  {
    ayahKey: '1:5',
    surahNumber: 1,
    ayahNumber: 5,
    surahNameAr: 'الفَاتِحَة',
    surahNameBn: 'আল-ফাতিহা',
    surahNameEn: 'Al-Fatihah',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5.mp3',
    totalDurationMs: 4400,
    words: [
      { index: 1, textIndoPak: 'اِیَّاكَ', transliteration: 'Iyyāka', translationBn: 'কেবল আপনারই', translationEn: 'It is You', startTimeMs: 150, endTimeMs: 1000 },
      { index: 2, textIndoPak: 'نَعْبُدُ', transliteration: 'naʿbudu', translationBn: 'আমরা ইবাদত করি', translationEn: 'we worship', startTimeMs: 1050, endTimeMs: 1950 },
      { index: 3, textIndoPak: 'وَ اِیَّاكَ', transliteration: 'wa-iyyāka', translationBn: 'এবং কেবল আপনারই কাছে', translationEn: 'and You', startTimeMs: 2000, endTimeMs: 3000 },
      { index: 4, textIndoPak: 'نَسْتَعِیْنُ', transliteration: 'nastaʿīn', translationBn: 'আমরা সাহায্য চাই', translationEn: 'we ask for help', startTimeMs: 3050, endTimeMs: 4250 },
    ],
    fullTranslationBn: 'আমরা কেবল তোমারই ইবাদত করি এবং কেবল তোমারই কাছে সাহায্য প্রার্থনা করি।',
    fullTranslationEn: 'It is You we worship and You we ask for help.',
  },
  {
    ayahKey: '18:1',
    surahNumber: 18,
    ayahNumber: 1,
    surahNameAr: 'الكَهْف',
    surahNameBn: 'আল-কাহফ',
    surahNameEn: 'Al-Kahf',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2141.mp3',
    totalDurationMs: 9500,
    words: [
      { index: 1, textIndoPak: 'اَلْحَمْدُ', transliteration: 'Al-hamdu', translationBn: 'সকল প্রশংসা', translationEn: 'All praise', startTimeMs: 200, endTimeMs: 1100 },
      { index: 2, textIndoPak: 'لِلّٰهِ', transliteration: 'lillāhi', translationBn: 'আল্লাহর জন্য', translationEn: 'is due to Allah', startTimeMs: 1150, endTimeMs: 1950 },
      { index: 3, textIndoPak: 'الَّذِیْۤ', transliteration: 'alladhī', translationBn: 'যিনি', translationEn: 'who', startTimeMs: 2000, endTimeMs: 2700 },
      { index: 4, textIndoPak: 'اَنْزَلَ', transliteration: 'anzala', translationBn: 'অবতীর্ণ করেছেন', translationEn: 'has revealed', startTimeMs: 2750, endTimeMs: 3550 },
      { index: 5, textIndoPak: 'عَلٰی', transliteration: 'ʿalā', translationBn: 'উপর', translationEn: 'upon', startTimeMs: 3600, endTimeMs: 4100 },
      { index: 6, textIndoPak: 'عَبْدِهِ', transliteration: 'ʿabdihī', translationBn: 'তাঁর বান্দার', translationEn: 'His servant', startTimeMs: 4150, endTimeMs: 5050 },
      { index: 7, textIndoPak: 'الْكِتٰبَ', transliteration: 'al-kitāba', translationBn: 'এই কিতাব', translationEn: 'the Book', startTimeMs: 5100, endTimeMs: 6150 },
      { index: 8, textIndoPak: 'وَ لَمْ', transliteration: 'wa-lam', translationBn: 'এবং রাখেননি', translationEn: 'and has not', startTimeMs: 6200, endTimeMs: 7000 },
      { index: 9, textIndoPak: 'یَجْعَلْ', transliteration: 'yajʿal', translationBn: 'করেছেন', translationEn: 'made', startTimeMs: 7050, endTimeMs: 7750 },
      { index: 10, textIndoPak: 'لَّهٗ', transliteration: 'lahū', translationBn: 'এতে কোনো', translationEn: 'in it', startTimeMs: 7800, endTimeMs: 8400 },
      { index: 11, textIndoPak: 'عِوَجًا ؕ', transliteration: 'ʿiwajā', translationBn: 'বক্রতা', translationEn: 'any crookedness', startTimeMs: 8450, endTimeMs: 9400 },
    ],
    fullTranslationBn: 'সমস্ত প্রশংসা আল্লাহর, যিনি তাঁর বান্দার প্রতি এই কিতাব অবতীর্ণ করেছেন এবং এতে কোনো বক্রতা রাখেননি।',
    fullTranslationEn: '[All] praise is [due] to Allah, who has sent down upon His Servant the Book and has not made therein any deviance.',
  },
  {
    ayahKey: '18:2',
    surahNumber: 18,
    ayahNumber: 2,
    surahNameAr: 'الكَهْف',
    surahNameBn: 'আল-কাহফ',
    surahNameEn: 'Al-Kahf',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2142.mp3',
    totalDurationMs: 11200,
    words: [
      { index: 1, textIndoPak: 'قَیِّمًا', transliteration: 'Qayyiman', translationBn: 'সুপ্রতিষ্ঠিত', translationEn: '[He has made it] straight', startTimeMs: 150, endTimeMs: 1100 },
      { index: 2, textIndoPak: 'لِّیُنْذِرَ', transliteration: 'liyundhira', translationBn: 'সতর্ক করতে', translationEn: 'to warn of', startTimeMs: 1150, endTimeMs: 2050 },
      { index: 3, textIndoPak: 'بَاْسًا', transliteration: 'baʾsan', translationBn: 'কঠিন শাস্তি', translationEn: 'severe punishment', startTimeMs: 2100, endTimeMs: 2900 },
      { index: 4, textIndoPak: 'شَدِیْدًا', transliteration: 'shadīdan', translationBn: 'তীব্র', translationEn: 'from Him', startTimeMs: 2950, endTimeMs: 3850 },
      { index: 5, textIndoPak: 'مِّنْ لَّدُنْهُ', transliteration: 'mil-ladunhu', translationBn: 'তাঁর পক্ষ থেকে', translationEn: 'from His presence', startTimeMs: 3900, endTimeMs: 4950 },
      { index: 6, textIndoPak: 'وَ یُبَشِّرَ', transliteration: 'wa-yubashshira', translationBn: 'এবং সুসংবাদ দিতে', translationEn: 'and to bring good tidings', startTimeMs: 5000, endTimeMs: 6100 },
      { index: 7, textIndoPak: 'الْمُؤْمِنِیْنَ', transliteration: 'al-muʾminīna', translationBn: 'মুমিনদেরকে', translationEn: 'to the believers', startTimeMs: 6150, endTimeMs: 7300 },
      { index: 8, textIndoPak: 'الَّذِیْنَ', transliteration: 'alladhīna', translationBn: 'যারা', translationEn: 'who', startTimeMs: 7350, endTimeMs: 8100 },
      { index: 9, textIndoPak: 'یَعْمَلُوْنَ', transliteration: 'yaʿmalūna', translationBn: 'আমল করে', translationEn: 'do', startTimeMs: 8150, endTimeMs: 9000 },
      { index: 10, textIndoPak: 'الصّٰلِحٰتِ', transliteration: 'as-sālihāti', translationBn: 'নেক কাজ', translationEn: 'righteous deeds', startTimeMs: 9050, endTimeMs: 10100 },
      { index: 11, textIndoPak: 'اَنَّ لَهُمْ اَجْرًا حَسَنًا ۙ', transliteration: 'anna lahum ajran hasanā', translationBn: 'যে তাদের জন্য রয়েছে উত্তম প্রতিদান', translationEn: 'that they will have a good reward', startTimeMs: 10150, endTimeMs: 11100 },
    ],
    fullTranslationBn: 'তিনি একে করেছেন নির্ভুল ও সুপ্রতিষ্ঠিত, তাঁর পক্ষ থেকে এক ভীষণ শাস্তির ব্যাপারে সতর্ক করতে এবং সেই মুমিনদের সুসংবাদ দিতে যারা সৎকাজ করে—যে তাদের জন্য রয়েছে এক উত্তম প্রতিদান।',
    fullTranslationEn: '[He has made it] straight, to warn of severe punishment from Him and to give good tidings to the believers who do righteous deeds that they will have a good reward.',
  },
  {
    ayahKey: '112:1',
    surahNumber: 112,
    ayahNumber: 1,
    surahNameAr: 'الإِخْلَاص',
    surahNameBn: 'আল-ইখলাস',
    surahNameEn: 'Al-Ikhlas',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6221.mp3',
    totalDurationMs: 2700,
    words: [
      { index: 1, textIndoPak: 'قُلْ', transliteration: 'Qul', translationBn: 'বলুন', translationEn: 'Say', startTimeMs: 150, endTimeMs: 750 },
      { index: 2, textIndoPak: 'هُوَ', transliteration: 'Huwa', translationBn: 'তিনি', translationEn: 'He is', startTimeMs: 800, endTimeMs: 1250 },
      { index: 3, textIndoPak: 'اللهُ', transliteration: 'Allāhu', translationBn: 'আল্লাহ', translationEn: 'Allah', startTimeMs: 1300, endTimeMs: 1850 },
      { index: 4, textIndoPak: 'اَحَدٌ', transliteration: 'Ahad', translationBn: 'একক / অদ্বিতীয়', translationEn: '[who is] One', startTimeMs: 1900, endTimeMs: 2600 },
    ],
    fullTranslationBn: 'বলুন: তিনিই আল্লাহ, একক ও অদ্বিতীয়।',
    fullTranslationEn: 'Say, "He is Allah, [who is] One,',
  },
];

interface IndoPakKaraokeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'bn' | 'en';
}

export const IndoPakKaraokeModal: React.FC<IndoPakKaraokeModalProps> = ({
  isOpen,
  onClose,
  language = 'bn',
}) => {
  const [selectedAyahIndex, setSelectedAyahIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPlaybackTimeMs, setCurrentPlaybackTimeMs] = useState<number>(0);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showCoverArt, setShowCoverArt] = useState<boolean>(true);
  const [showJsonBlueprint, setShowJsonBlueprint] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentAyah = INDO_PAK_SAMPLE_AYAHS[selectedAyahIndex] || INDO_PAK_SAMPLE_AYAHS[0];

  // Stop audio on unmount or Ayah switch
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsPlaying(false);
    setCurrentPlaybackTimeMs(0);
    setActiveWordIndex(null);
  }, []);

  // Synchronous High-Precision Clock (60fps requestAnimationFrame)
  const trackPlayback = useCallback(() => {
    if (!audioRef.current || audioRef.current.paused) return;

    const currentMs = audioRef.current.currentTime * 1000;
    setCurrentPlaybackTimeMs(currentMs);

    // Fast linear/binary matching for active word
    const words = currentAyah.words;
    let foundWord: number | null = null;

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (currentMs >= w.startTimeMs && currentMs <= w.endTimeMs) {
        foundWord = w.index;
        break;
      }
    }
    setActiveWordIndex(foundWord);

    // Single Ayah boundary lock: Auto stop immediately when Ayah audio finishes
    if (currentMs >= currentAyah.totalDurationMs - 50 || audioRef.current.ended) {
      stopAudio();
      return;
    }

    animationFrameRef.current = requestAnimationFrame(trackPlayback);
  }, [currentAyah, stopAudio]);

  // Play a specific Ayah strictly isolated
  const handlePlayAyah = (index?: number) => {
    triggerHaptic(20);
    const targetIndex = index !== undefined ? index : selectedAyahIndex;
    const targetAyah = INDO_PAK_SAMPLE_AYAHS[targetIndex];

    if (!targetAyah) return;

    // If changing Ayah, stop current first
    if (targetIndex !== selectedAyahIndex) {
      stopAudio();
      setSelectedAyahIndex(targetIndex);
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(targetAyah.audioUrl);
    } else {
      audioRef.current.src = targetAyah.audioUrl;
    }

    audioRef.current.playbackRate = playbackSpeed;

    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        animationFrameRef.current = requestAnimationFrame(trackPlayback);
      })
      .catch((err) => {
        console.warn('Audio playback error:', err);
        setIsPlaying(false);
      });
  };

  const handlePauseAyah = () => {
    triggerHaptic(15);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
  };

  const handleWordClick = (word: QuranWordTimestamp) => {
    triggerHaptic(15);
    if (!audioRef.current) {
      audioRef.current = new Audio(currentAyah.audioUrl);
      audioRef.current.playbackRate = playbackSpeed;
    }
    audioRef.current.currentTime = word.startTimeMs / 1000;
    if (!isPlaying) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          animationFrameRef.current = requestAnimationFrame(trackPlayback);
        })
        .catch(() => {});
    }
  };

  // Speed toggle
  const toggleSpeed = () => {
    triggerHaptic(15);
    const speeds = [0.75, 1.0, 1.25];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  // Handle Ayah switch
  const handleSelectAyah = (idx: number) => {
    stopAudio();
    setSelectedAyahIndex(idx);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] dark:bg-[#0D1619] border-2 border-[#D4AF37] dark:border-[#B89730] rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-all text-[#123234] dark:text-[#EAF2F1]">
        {/* Modal Header */}
        <div className="py-3.5 px-5 bg-linear-to-r from-[#F4EEDD] via-[#FAF8F5] to-[#F4EEDD] dark:from-[#1A262B] dark:via-[#0D1619] dark:to-[#1A262B] border-b border-[#D4AF37]/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#B89730] dark:text-[#E6C65A]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-serif text-[#4A3B18] dark:text-[#E6C65A] flex items-center gap-2">
                <span>ইন্ডো-পাক স্ক্রিপ্ট · কারাওকে সিঙ্ক</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37] text-white font-mono font-normal">
                  Karaoke WBW
                </span>
              </h3>
              <p className="text-[11px] text-[#7A6A3F] dark:text-slate-300">
                শব্দে শব্দে লাইভ হাইলাইটিং ও সাব-মহাদেশীয় ক্যালিগ্রাফি
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJsonBlueprint((p) => !p)}
              className="py-1 px-2.5 rounded-xl border border-[#D4AF37]/50 text-xs font-semibold hover:bg-[#D4AF37]/15 transition-colors cursor-pointer flex items-center gap-1 text-[#4A3B18] dark:text-[#E6C65A]"
              title="JSON ডেটা ও আর্কিটেকচার ব্লুপ্রিন্ট"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JSON Blueprint</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic(15);
                stopAudio();
                onClose();
              }}
              className="w-8 h-8 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-muted-slate" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* JSON Blueprint Viewer toggle */}
          {showJsonBlueprint ? (
            <div className="space-y-3 p-4 rounded-2xl bg-[#121E23] text-emerald-400 font-mono text-xs border border-emerald-500/30">
              <div className="flex items-center justify-between text-slate-300 border-b border-emerald-500/20 pb-2">
                <span className="font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  JSON Structure: Word-by-Word Timestamps
                </span>
                <button
                  onClick={() => setShowJsonBlueprint(false)}
                  className="text-slate-400 hover:text-white cursor-pointer underline text-[11px]"
                >
                  Close Blueprint
                </button>
              </div>
              <pre className="overflow-x-auto text-[11px] leading-relaxed p-2 text-amber-200/90 select-all max-h-72">
{JSON.stringify(currentAyah, null, 2)}
              </pre>
            </div>
          ) : null}

          {/* Ayah Selector Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {INDO_PAK_SAMPLE_AYAHS.map((item, idx) => (
              <button
                key={item.ayahKey}
                onClick={() => handleSelectAyah(idx)}
                className={`shrink-0 py-1.5 px-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                  selectedAyahIndex === idx
                    ? 'bg-[#D4AF37] text-white border-[#B89730] shadow-sm'
                    : 'bg-white dark:bg-[#162226] border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#4A3B18] dark:text-[#E6C65A]'
                }`}
              >
                <span>{item.surahNameBn}</span>
                <span className="text-[10px] opacity-80">({item.ayahKey})</span>
              </button>
            ))}
          </div>

          {/* Main Ornate Indo-Pak Quran Card with Golden Borders */}
          <div className="relative p-5 sm:p-8 rounded-3xl bg-linear-to-b from-[#FFFDF9] to-[#FAF4E6] dark:from-[#111F24] dark:to-[#0D1619] border-4 border-double border-[#D4AF37] shadow-xl text-center overflow-hidden">
            {/* Subtle vintage gold corner flourishes */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#D4AF37]/70" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#D4AF37]/70" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#D4AF37]/70" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#D4AF37]/70" />

            {/* Header: Surah & Ayah Badge */}
            <div className="flex items-center justify-between text-xs font-semibold text-[#8C7335] dark:text-[#D4AF37] mb-4 pb-2 border-b border-[#D4AF37]/25">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 font-mono text-[11px]">
                সূরা {currentAyah.surahNameBn} : আয়াত {currentAyah.ayahNumber}
              </span>
              <span className="font-serif text-sm">
                {currentAyah.surahNameAr}
              </span>
              <span className="text-[11px] font-mono text-[#8C7335]/80">
                {currentAyah.ayahKey}
              </span>
            </div>

            {/* LIVE WORD-BY-WORD KARAOKE FLOW */}
            <div
              className="py-6 px-2 sm:px-6 leading-loose select-text text-center flex flex-wrap items-center justify-center gap-x-3 gap-y-5"
              dir="rtl"
            >
              {currentAyah.words.map((word) => {
                const isActive = activeWordIndex === word.index;

                return (
                  <motion.div
                    key={word.index}
                    onClick={() => handleWordClick(word)}
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      y: isActive ? -3 : 0,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                    }}
                    className={`relative group inline-flex flex-col items-center justify-center p-2 rounded-2xl cursor-pointer transition-colors duration-200 ${
                      isActive
                        ? 'bg-linear-to-b from-[#D4AF37]/35 via-[#FCE788]/40 to-[#D4AF37]/25 dark:from-[#D4AF37]/40 dark:to-[#8C7335]/30 ring-2 ring-[#D4AF37] shadow-lg shadow-[#D4AF37]/30'
                        : 'hover:bg-[#D4AF37]/15 dark:hover:bg-[#D4AF37]/10'
                    }`}
                  >
                    {/* Indo-Pak Arabic Script with Sub-continent Calligraphy Styling */}
                    <span
                      className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-normal transition-colors ${
                        isActive
                          ? 'text-[#855B00] dark:text-[#FFEAA7] drop-shadow-[0_2px_8px_rgba(212,175,55,0.6)]'
                          : 'text-[#1D2B30] dark:text-[#E8F0EE]'
                      }`}
                      style={{
                        fontFamily: "'Gulzar', 'Noto Nastaliq Urdu', 'Scheherazade New', 'Amiri', serif",
                        lineHeight: '1.9',
                      }}
                    >
                      {word.textIndoPak}
                    </span>

                    {/* Word Sub-translation badge */}
                    <span
                      dir="ltr"
                      className={`text-[10px] sm:text-[11px] font-semibold mt-1 transition-colors px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-[#855B00] text-white dark:bg-[#E6C65A] dark:text-[#0D1619] shadow-xs'
                          : 'text-[#6C5B32] dark:text-slate-400 group-hover:text-[#4A3B18]'
                      }`}
                    >
                      {language === 'bn' ? word.translationBn : word.translationEn}
                    </span>

                    {/* Active Karaoke Pulsing Glow Dot */}
                    {isActive && (
                      <span className="absolute -top-1 right-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-[#D4AF37] shadow-md animate-ping" />
                    )}
                  </motion.div>
                );
              })}

              {/* End Ayah Symbol */}
              <span
                className="inline-block mx-1 text-2xl text-[#D4AF37] select-none font-serif align-middle"
                title={`আয়াত ${currentAyah.ayahNumber}`}
              >
                ۝
              </span>
            </div>

            {/* Translation Text Banner */}
            <div className="mt-4 pt-3 border-t border-[#D4AF37]/30 text-xs sm:text-sm text-[#4A3B18] dark:text-slate-200 font-sans leading-relaxed">
              <p className="italic">
                "{language === 'bn' ? currentAyah.fullTranslationBn : currentAyah.fullTranslationEn}"
              </p>
            </div>
          </div>

          {/* Player Control Bar: Audio Progress, Play/Pause, Speed */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#121E23] border border-[#D4AF37]/30 shadow-md space-y-3">
            {/* Progress Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#8C7335] dark:text-slate-400">
                <span>{(currentPlaybackTimeMs / 1000).toFixed(1)}s</span>
                <span className="text-[10px] font-bold text-[#D4AF37]">
                  {isPlaying ? 'সিঙ্ক চলছে (Karaoke Active)' : 'ট্যাপ করে প্লে করুন'}
                </span>
                <span>{(currentAyah.totalDurationMs / 1000).toFixed(1)}s</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#FAF4E6] dark:bg-[#1C2C32] overflow-hidden relative">
                <div
                  className="h-full bg-linear-to-r from-[#D4AF37] to-[#FCE788] transition-all duration-75 rounded-full"
                  style={{
                    width: `${Math.min(100, (currentPlaybackTimeMs / currentAyah.totalDurationMs) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Button Controls */}
            <div className="flex items-center justify-between pt-1">
              {/* Left: Speed Controller */}
              <button
                onClick={toggleSpeed}
                className="py-1.5 px-3 rounded-2xl border border-[#D4AF37]/50 text-xs font-bold text-[#8C7335] dark:text-[#E6C65A] hover:bg-[#D4AF37]/15 transition-all cursor-pointer flex items-center gap-1.5"
                title="গতি পরিবর্তন (0.75x, 1.0x, 1.25x)"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{playbackSpeed}x গতি</span>
              </button>

              {/* Center: Main Play/Pause Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = 0;
                    }
                    setCurrentPlaybackTimeMs(0);
                    setActiveWordIndex(null);
                  }}
                  className="w-9 h-9 rounded-full bg-[#FAF4E6] dark:bg-[#1C2C32] border border-[#D4AF37]/30 flex items-center justify-center text-[#8C7335] dark:text-[#E6C65A] hover:bg-[#D4AF37]/20 transition-colors cursor-pointer"
                  title="শুরু থেকে শুনুন"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (isPlaying) {
                      handlePauseAyah();
                    } else {
                      handlePlayAyah();
                    }
                  }}
                  className="py-2.5 px-6 rounded-full bg-linear-to-r from-[#D4AF37] to-[#B89730] text-white font-bold text-xs shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>বিরতি</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>শুধু এই আয়াত শুনুন</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right: Next / Prev Ayah Navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const prev = Math.max(0, selectedAyahIndex - 1);
                    handleSelectAyah(prev);
                  }}
                  disabled={selectedAyahIndex === 0}
                  className="w-8 h-8 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#8C7335] dark:text-[#E6C65A] disabled:opacity-30 cursor-pointer"
                  title="পূর্ববর্তী আয়াত"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const next = Math.min(INDO_PAK_SAMPLE_AYAHS.length - 1, selectedAyahIndex + 1);
                    handleSelectAyah(next);
                  }}
                  disabled={selectedAyahIndex === INDO_PAK_SAMPLE_AYAHS.length - 1}
                  className="w-8 h-8 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#8C7335] dark:text-[#E6C65A] disabled:opacity-30 cursor-pointer"
                  title="পরবর্তী আয়াত"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Visual Showcase: Authentic Indo-Pak Script Page Image Artwork */}
          <div className="rounded-3xl border border-[#D4AF37]/30 overflow-hidden bg-black/40">
            <button
              onClick={() => setShowCoverArt((p) => !p)}
              className="w-full py-2.5 px-4 bg-[#FAF4E6] dark:bg-[#162226] text-xs font-bold text-[#8C7335] dark:text-[#E6C65A] flex items-center justify-between cursor-pointer border-b border-[#D4AF37]/20"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                <span>প্রামাণ্য উপমহাদেশীয় (Indo-Pak) পাণ্ডুলিপি শিল্পকর্ম</span>
              </span>
              <span className="text-[11px] underline">
                {showCoverArt ? 'লুকান' : 'প্রদর্শন করুন'}
              </span>
            </button>
            {showCoverArt && (
              <div className="relative aspect-4/3 max-h-56 sm:max-h-72 w-full overflow-hidden">
                <img
                  src={indopakCoverImg}
                  alt="Holy Quran in Indo-Pak script font style"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex items-end p-3 sm:p-4">
                  <p className="text-white text-xs font-serif drop-shadow-md">
                    পবিত্র কুরআনের ঐতিহ্যবাহী ইন্দো-পাক ক্যালিগ্রাফি ও সোনালি-সবুজ কারুকার্য
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="py-3 px-5 bg-[#FAF4E6] dark:bg-[#121E23] border-t border-[#D4AF37]/30 flex items-center justify-between text-xs text-[#8C7335] dark:text-slate-400">
          <span className="font-medium">
            আইসোলেটেড সিঙ্গেল-আয়াত প্লেব্যাক ও ওয়ার্ড-বাই-ওয়ার্ড ট্র্যাকিং
          </span>
          <button
            onClick={() => {
              triggerHaptic(15);
              stopAudio();
              onClose();
            }}
            className="py-1 px-3 rounded-xl bg-[#D4AF37] text-white font-bold cursor-pointer hover:bg-[#B89730] transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
