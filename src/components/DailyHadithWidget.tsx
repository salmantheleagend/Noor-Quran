import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppLanguage, HadithItem } from '../types';
import { HADITHS_LIST } from '../data/hadithData';
import { triggerHaptic, speakAyahTranslation, stopSpeechAudio } from '../utils/audioPlayer';
import {
  BookOpen,
  RotateCw,
  Share2,
  Check,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Bookmark,
} from 'lucide-react';

interface DailyHadithWidgetProps {
  language: AppLanguage;
  onNavigate: (tab: string, extra?: unknown) => void;
  toBn: (num: number | string) => string;
}

export interface FetchedHadith {
  id: string;
  hadithNumber: number;
  arabic: string;
  translationBn: string;
  translationEn: string;
  narratorBn?: string;
  sourceBn: string;
  sourceEn: string;
  chapterNameBn?: string;
  chapterNameEn?: string;
  gradeBn: string;
  gradeEn: string;
}

// Curated list of high-virtue, authentic Sahih al-Bukhari hadith numbers
// Covering Faith (Iman), Good Character, Salah, Knowledge, Charity, Truthfulness, Parents, Forgiveness
const CURATED_BUKHARI_NUMBERS = [
  1, 2, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 21, 24, 25, 26, 30, 39, 41, 42,
  47, 50, 52, 53, 56, 58, 60, 68, 70, 71, 73, 79, 87, 98, 100, 101, 142, 143,
  144, 238, 250, 300, 500, 505, 506, 608, 647, 650, 700, 1000, 1145, 1400,
  2000, 2442, 3559, 5027, 6011, 6018, 6094, 6407, 6412, 6491,
];

// Clean API response text (remove publication bracketed notes like "(আধুনিক প্রকাশনী... ইসলামিক ফাউন্ডেশন...)")
function cleanHadithText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\(\s*আধুনিক\s*প্রকাশনী[\s\S]*?\)/gi, '')
    .replace(/\(\s*ইসলামিক\s*ফাউন্ডেশন[\s\S]*?\)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Extract narrator from Bengali hadith text if available
function extractNarrator(text: string): { narrator?: string; cleanBody: string } {
  const match = text.match(/^([^\.]+?)(?:হতে|থেকে|বর্ণিত)\s*(?:হতে\s*বর্ণিত|থেকে\s*বর্ণিত|\(রাঃ\)\s*হতে|\(রা\.\)\s*হতে|বলেন)?[\.:]\s*(.+)$/i);
  if (match && match[1] && match[2] && match[1].length < 60) {
    return {
      narrator: match[1].trim(),
      cleanBody: match[2].trim(),
    };
  }
  return { cleanBody: text };
}

export const DailyHadithWidget: React.FC<DailyHadithWidgetProps> = ({
  language,
  onNavigate,
  toBn,
}) => {
  const isBn = language === 'bn';

  // Deterministic daily date string (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Compute daily deterministic hadith number
  const dailyHadithNumber = useMemo(() => {
    const d = new Date();
    const dayOfYear = Math.floor(
      (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    return CURATED_BUKHARI_NUMBERS[Math.abs(dayOfYear) % CURATED_BUKHARI_NUMBERS.length];
  }, []);

  // Primary State
  const [hadith, setHadith] = useState<FetchedHadith | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Fetch Hadith by number from official jsdelivr CDN Hadith API
  const fetchHadithFromApi = useCallback(async (hNum: number): Promise<FetchedHadith | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

      // Fetch Bengali, Arabic, and English in parallel
      const [bnRes, arRes, engRes] = await Promise.allSettled([
        fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ben-bukhari/${hNum}.json`, { signal: controller.signal }),
        fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari/${hNum}.json`, { signal: controller.signal }),
        fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari/${hNum}.json`, { signal: controller.signal }),
      ]);
      clearTimeout(timeoutId);

      let rawBn = '';
      let rawAr = '';
      let rawEng = '';
      let sectionName = '';

      if (bnRes.status === 'fulfilled' && bnRes.value.ok) {
        const data = await bnRes.value.json();
        rawBn = data.hadiths?.[0]?.text || '';
        sectionName = data.metadata?.section?.[Object.keys(data.metadata?.section || {})[0]] || '';
      }

      if (arRes.status === 'fulfilled' && arRes.value.ok) {
        const data = await arRes.value.json();
        rawAr = data.hadiths?.[0]?.text || '';
        if (!sectionName) {
          sectionName = data.metadata?.section?.[Object.keys(data.metadata?.section || {})[0]] || '';
        }
      }

      if (engRes.status === 'fulfilled' && engRes.value.ok) {
        const data = await engRes.value.json();
        rawEng = data.hadiths?.[0]?.text || '';
      }

      // If at least one translation or text was fetched successfully
      if (rawBn || rawAr || rawEng) {
        const cleanedBn = cleanHadithText(rawBn);
        const { narrator, cleanBody } = extractNarrator(cleanedBn);

        return {
          id: `bukhari_${hNum}`,
          hadithNumber: hNum,
          arabic: rawAr || 'قَالَ رَسُولُ اللَّهِ ﷺ : إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
          translationBn: cleanBody || cleanedBn || 'রাসূলুল্লাহ (ﷺ) এর সহিহ হাদিস।',
          translationEn: rawEng || 'Authentic Hadith of the Prophet Muhammad (ﷺ).',
          narratorBn: narrator,
          sourceBn: `সহিহ বুখারি, হাদিস নং ${toBn(hNum)}`,
          sourceEn: `Sahih al-Bukhari, Hadith #${hNum}`,
          chapterNameBn: sectionName ? `অধ্যায়: ${sectionName}` : undefined,
          chapterNameEn: sectionName ? `Chapter: ${sectionName}` : undefined,
          gradeBn: 'সহিহ (বুখারি)',
          gradeEn: 'Sahih (al-Bukhari)',
        };
      }
    } catch (e) {
      console.warn('Hadith API fetch failed, falling back gracefully to local verified dataset', e);
    }
    return null;
  }, [toBn]);

  // Fallback to local verified HADITHS_LIST in case of offline or failure
  const getLocalFallbackHadith = useCallback((indexHint = 0): FetchedHadith => {
    const item: HadithItem = HADITHS_LIST[Math.abs(indexHint) % HADITHS_LIST.length];
    return {
      id: item.id,
      hadithNumber: indexHint || 1,
      arabic: item.arabic,
      translationBn: item.translationBn,
      translationEn: item.translationEn,
      narratorBn: item.narratorBn,
      sourceBn: item.sourceBn,
      sourceEn: item.source,
      chapterNameBn: `বিষয়: ${item.categoryBn}`,
      chapterNameEn: `Topic: ${item.category}`,
      gradeBn: item.gradeBn || 'সহিহ',
      gradeEn: item.grade || 'Sahih',
    };
  }, []);

  // Load daily hadith on mount
  useEffect(() => {
    let isMounted = true;
    const cacheKey = `noor_quran_daily_hadith_v2_${todayStr}`;

    // 1. Check today's cache in localStorage
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as FetchedHadith;
        if (parsed && parsed.translationBn) {
          setHadith(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }

    // 2. Fetch fresh from API for today
    setLoading(true);
    fetchHadithFromApi(dailyHadithNumber).then((result) => {
      if (!isMounted) return;
      const finalHadith = result || getLocalFallbackHadith(dailyHadithNumber);
      setHadith(finalHadith);
      setLoading(false);

      try {
        localStorage.setItem(cacheKey, JSON.stringify(finalHadith));
      } catch {
        // ignore storage quota
      }
    });

    return () => {
      isMounted = false;
      stopSpeechAudio();
    };
  }, [todayStr, dailyHadithNumber, fetchHadithFromApi, getLocalFallbackHadith]);

  // Handle Fetching a new Random Hadith on demand
  const handleFetchRandomHadith = async () => {
    triggerHaptic(15);
    stopSpeechAudio();
    setIsPlayingAudio(false);
    setLoading(true);

    // Pick a random number distinct from the current one
    const availableNumbers = CURATED_BUKHARI_NUMBERS.filter(
      (n) => !hadith || n !== hadith.hadithNumber
    );
    const randomNum = availableNumbers[Math.floor(Math.random() * availableNumbers.length)] || Math.floor(Math.random() * 200) + 1;

    const result = await fetchHadithFromApi(randomNum);
    const finalHadith = result || getLocalFallbackHadith(randomNum);
    setHadith(finalHadith);
    setLoading(false);
  };

  // Handle Copy / Share Hadith
  const handleCopyHadith = async () => {
    if (!hadith) return;
    triggerHaptic(15);

    const title = isBn ? 'আজকের হাদিস' : 'Daily Hadith';
    const body = isBn ? hadith.translationBn : (hadith.translationEn || hadith.translationBn);
    const source = isBn ? hadith.sourceBn : hadith.sourceEn;
    const shareText = `🕌 ${title} (নূর কুরআন):\n\n${hadith.arabic ? `${hadith.arabic}\n\n` : ''}"${body}"\n\n— ${source} (${isBn ? hadith.gradeBn : hadith.gradeEn})\n\nনূর কুরআন (Noor Quran) অ্যাপ থেকে সংগৃহীত।`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch {
        // ignore
      }
    }
  };

  // Handle Native Share Sheet
  const handleShareNative = async () => {
    if (!hadith) return;
    triggerHaptic(15);
    const body = isBn ? hadith.translationBn : (hadith.translationEn || hadith.translationBn);
    const source = isBn ? hadith.sourceBn : hadith.sourceEn;
    const shareData = {
      title: isBn ? 'দৈনিক সহিহ হাদিস' : 'Daily Sahih Hadith',
      text: `"${body}"\n\n— ${source}\n(নূর কুরআন)`,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyHadith();
    }
  };

  // Handle Text-to-Speech audio reader
  const handleToggleAudio = () => {
    if (!hadith) return;
    triggerHaptic(15);

    if (isPlayingAudio) {
      stopSpeechAudio();
      setIsPlayingAudio(false);
    } else {
      const textToSpeak = isBn
        ? hadith.translationBn
        : (hadith.translationEn || hadith.translationBn);

      setIsPlayingAudio(true);
      speakAyahTranslation(
        textToSpeak,
        isBn ? 'bn' : 'en',
        () => setIsPlayingAudio(false),
        () => setIsPlayingAudio(false)
      );
    }
  };

  if (!hadith && loading) {
    return (
      <section
        aria-label={isBn ? 'দৈনিক হাদিস লোড হচ্ছে' : 'Loading Daily Hadith'}
        className="rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] p-5 shadow-2xs space-y-3 animate-pulse"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/80" />
            <div className="space-y-1.5">
              <div className="w-24 h-4 rounded-md bg-slate-200 dark:bg-slate-700" />
              <div className="w-36 h-3 rounded-md bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        </div>
        <div className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
        <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800/40" />
      </section>
    );
  }

  if (!hadith) return null;

  return (
    <section
      aria-label={isBn ? 'দৈনিক সহিহ হাদিস' : 'Daily Sahih Hadith'}
      className="rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs hover:shadow-xs transition-all overflow-hidden p-4 sm:p-5 space-y-3.5 relative"
    >
      {/* 1. Header: Icon, Title, Authenticity Badge & Actions */}
      <div className="flex items-start justify-between gap-2.5 border-b border-[#E7D9DE]/70 dark:border-[#1C2D5A] pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-teal-500/15 via-teal-600/10 to-emerald-500/15 dark:from-teal-400/20 dark:to-emerald-400/10 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/25 shadow-2xs">
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm sm:text-base font-extrabold text-[#123234] dark:text-white leading-tight">
                {isBn ? 'দৈনিক হাদিস' : 'Daily Hadith'}
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" />
                <span>{isBn ? hadith.gradeBn : hadith.gradeEn}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {isBn
                ? (hadith.chapterNameBn || 'সহিহ বুখারি থেকে দৈনিক নির্বাচিত বাণী')
                : (hadith.chapterNameEn || 'Selected from Sahih al-Bukhari')}
            </p>
          </div>
        </div>

        {/* Header Action Buttons: Shuffle / Random + Copy/Share */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleFetchRandomHadith}
            disabled={loading}
            className="flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-200 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100/70 dark:hover:bg-teal-900/60 px-2.5 py-1.5 rounded-xl border border-teal-200/60 dark:border-teal-800/50 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
            title={isBn ? 'অন্য একটি হাদিস লোড করুন' : 'Fetch another random Hadith'}
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline text-[11px]">
              {isBn ? 'অন্য হাদিস' : 'New Hadith'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleShareNative}
            className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 border border-transparent hover:border-teal-200/50 dark:hover:border-teal-800/40 transition-colors cursor-pointer active:scale-95"
            title={isBn ? 'হাদিসটি শেয়ার করুন' : 'Share this Hadith'}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Arabic Text with Elegant Uthmani Calligraphy */}
      {hadith.arabic && (
        <div className="pt-1 pb-0.5">
          <p
            className="font-uthmani text-lg sm:text-xl lg:text-2xl leading-loose text-center text-[#123234] dark:text-[#F3FAF9] font-bold select-text px-1"
            dir="rtl"
          >
            {hadith.arabic}
          </p>
        </div>
      )}

      {/* 3. Narrator & Translation Meaning */}
      <div className="space-y-1.5 bg-slate-50/80 dark:bg-slate-800/40 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        {hadith.narratorBn && isBn && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span>{hadith.narratorBn} হতে বর্ণিত:</span>
          </div>
        )}

        <p
          className={`text-sm sm:text-[15px] text-slate-800 dark:text-slate-100 leading-relaxed font-normal select-text ${
            isBn ? 'font-bengali' : 'font-sans'
          }`}
        >
          "{isBn ? hadith.translationBn : (hadith.translationEn || hadith.translationBn)}"
        </p>
      </div>

      {/* 4. Audio State Playing Indicator (when active) */}
      {isPlayingAudio && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs font-semibold text-teal-800 dark:text-teal-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 animate-pulse text-teal-600 dark:text-teal-400" />
            <span>{isBn ? 'হাদিসের অর্থ পাঠ চলছে...' : 'Speaking Hadith translation...'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1 h-3 bg-teal-600 rounded-full animate-pulse" />
            <span className="w-1 h-4.5 bg-teal-600 rounded-full animate-pulse delay-75" />
            <span className="w-1 h-2 bg-teal-600 rounded-full animate-pulse delay-150" />
          </div>
        </div>
      )}

      {/* 5. Footer: Reference, Audio Reader CTA, and Browse All Link */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E7D9DE]/70 dark:border-[#1C2D5A] text-xs flex-wrap">
        {/* Source citation */}
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
          <span className="font-semibold text-teal-700 dark:text-teal-400">
            {isBn ? hadith.sourceBn : hadith.sourceEn}
          </span>
        </div>

        {/* Action Buttons: Listen & View All */}
        <div className="flex items-center gap-2">
          {/* Audio Listen / Stop */}
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all active:scale-95 cursor-pointer shadow-2xs ${
              isPlayingAudio
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100/80 dark:hover:bg-teal-900/60 border border-teal-200/70 dark:border-teal-800/60'
            }`}
            title={isBn ? 'হাদিসের বাংলা অর্থ শুনুন' : 'Listen to translation'}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                <span>{isBn ? 'থামান' : 'Stop'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isBn ? 'শুনুন' : 'Listen'}</span>
              </>
            )}
          </button>

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopyHadith}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95 border border-slate-200/60 dark:border-slate-700/60"
            title={isBn ? 'ক্লিপবোর্ডে কপি করুন' : 'Copy to clipboard'}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-bold text-[11px]">
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

          {/* View All Hadiths in Section */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(15);
              onNavigate('hadith');
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-teal-700 dark:text-teal-300 hover:text-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 transition-all border border-teal-200/70 dark:border-teal-800/60 cursor-pointer active:scale-95"
          >
            <span>{isBn ? 'সকল হাদিস' : 'All Hadith'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </section>
  );
};
