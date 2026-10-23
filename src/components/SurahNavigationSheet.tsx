import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  BookOpen,
  Check,
  Compass,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { SURAH_LIST } from '../data/quranData';
import { SurahMeta, AppLanguage } from '../types';
import { triggerHaptic } from '../utils/audioPlayer';
import { toBengaliNumber } from '../utils/quranPageManager';

interface SurahNavigationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeSurah: number;
  onSelectSurah: (surahNumber: number, startPage: number) => void;
  language?: AppLanguage;
}

export const SurahNavigationSheet: React.FC<SurahNavigationSheetProps> = ({
  isOpen,
  onClose,
  activeSurah,
  onSelectSurah,
  language = 'bn',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'meccan' | 'medinan'>('all');
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  // Focus search input when sheet opens
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery((prev) => (prev !== '' ? '' : prev));
      setFilterTab((prev) => (prev !== 'all' ? 'all' : prev));
      return;
    }

    const t1 = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);

    // Scroll to active surah in list after sheet render
    const t2 = setTimeout(() => {
      activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen]);

  // Comprehensive multi-lingual search (English, Arabic, Bengali, Number, Meaning)
  const filteredSurahs = useMemo(() => {
    let list = SURAH_LIST;

    if (filterTab === 'meccan') {
      list = list.filter((s) => s.revelationType === 'Meccan');
    } else if (filterTab === 'medinan') {
      list = list.filter((s) => s.revelationType === 'Medinan');
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    // Normalize Arabic search query (remove tashkeel for fuzzy match)
    const normalizedArabicQuery = q
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[إأآا]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ي/g, 'ى');

    return list.filter((s) => {
      // 1. Direct number match (e.g. "2" or "০২")
      if (s.number.toString() === q || toBengaliNumber(s.number) === q) return true;

      // 2. English name match (e.g. "Baqarah", "Kahf", "Yasin")
      if (s.nameEnglish.toLowerCase().includes(q)) return true;

      // 3. English translation match (e.g. "The Cow", "The Cave")
      if (s.englishTranslation.toLowerCase().includes(q)) return true;

      // 4. Bengali name match (e.g. "বাকারা", "কাহফ")
      if (s.nameBangla.toLowerCase().includes(q)) return true;

      // 5. Arabic name match (normalized + raw)
      const rawAr = s.nameArabic;
      const normalizedAr = rawAr
        .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
        .replace(/[إأآا]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ي/g, 'ى');

      if (rawAr.includes(q) || normalizedAr.includes(normalizedArabicQuery)) return true;

      return false;
    });
  }, [searchQuery, filterTab]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0B1E22] rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-[#D7E9E7] dark:border-[#13545A] max-h-[88vh] sm:max-h-[82vh] flex flex-col overflow-hidden text-[#123234] dark:text-[#EAF2F1] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle (Mobile) */}
        <div className="pt-2 pb-1 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mx-auto" />
        </div>

        {/* Header: Title, Total Badge, and Close Button */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-[#D7E9E7]/80 dark:border-[#13545A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0F5F62]/10 dark:bg-[#B9E2DD]/15 text-[#0F5F62] dark:text-[#B9E2DD] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2 text-[#0F5F62] dark:text-[#B9E2DD]">
                <span>{language === 'bn' ? '১১৪ সূরার তালিকা' : 'Surah Navigation'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0F5F62]/10 dark:bg-[#B9E2DD]/20 text-[#0F5F62] dark:text-[#B9E2DD]">
                  {filteredSurahs.length}
                </span>
              </h3>
              <p className="text-[11px] text-[#5E7475] dark:text-slate-400">
                {language === 'bn'
                  ? 'যেকোনো সূরায় সরাসরি জাম্প করুন'
                  : 'Instant jump between Surahs without leaving reader'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar (Quran.com Style: English + Arabic search) */}
        <div className="p-3 sm:p-4 border-b border-[#D7E9E7]/60 dark:border-[#13545A]/60 space-y-2.5 bg-slate-50/70 dark:bg-[#07171A]/70">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'সূরার নাম (English / আরবি / বাংলা) বা নম্বর দিয়ে খুঁজুন...'
                  : 'Search by Surah name (e.g. Baqarah, يس), meaning or number...'
              }
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-[#0B1E22] border border-[#D7E9E7] dark:border-[#13545A] text-xs sm:text-sm text-[#123234] dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0F5F62] dark:focus:ring-[#B9E2DD] shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:opacity-80 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter Pills: All / Meccan / Medinan */}
          <div className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => {
                triggerHaptic(10);
                setFilterTab('all');
              }}
              className={`py-1 px-3 rounded-full transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-[#0F5F62] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0B1E22] border border-[#D7E9E7] dark:border-[#13545A] text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {language === 'bn' ? 'সকল ১১৪ সূরা' : 'All 114'}
            </button>
            <button
              onClick={() => {
                triggerHaptic(10);
                setFilterTab('meccan');
              }}
              className={`py-1 px-3 rounded-full transition-all cursor-pointer ${
                filterTab === 'meccan'
                  ? 'bg-[#0F5F62] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0B1E22] border border-[#D7E9E7] dark:border-[#13545A] text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {language === 'bn' ? 'মাক্কী (৮৬)' : 'Meccan (86)'}
            </button>
            <button
              onClick={() => {
                triggerHaptic(10);
                setFilterTab('medinan');
              }}
              className={`py-1 px-3 rounded-full transition-all cursor-pointer ${
                filterTab === 'medinan'
                  ? 'bg-[#0F5F62] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0B1E22] border border-[#D7E9E7] dark:border-[#13545A] text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {language === 'bn' ? 'মাদানী (২৮)' : 'Medinan (28)'}
            </button>
          </div>
        </div>

        {/* Scrollable Surah List */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5 divide-y divide-[#D7E9E7]/40 dark:divide-[#13545A]/40 scroll-smooth">
          {filteredSurahs.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-400 stroke-1" />
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'কোনো সূরা পাওয়া যায়নি' : 'No Surah found matching your query'}
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#0F5F62] dark:text-[#B9E2DD] underline cursor-pointer"
              >
                {language === 'bn' ? 'সার্চ ক্লিয়ার করুন' : 'Clear search'}
              </button>
            </div>
          ) : (
            filteredSurahs.map((surah) => {
              const isActive = surah.number === activeSurah;

              return (
                <button
                  key={surah.number}
                  ref={isActive ? activeItemRef : undefined}
                  onClick={() => {
                    triggerHaptic(15);
                    onSelectSurah(surah.number, surah.pageStart);
                    onClose();
                  }}
                  className={`w-full pt-2 first:pt-0 flex items-center justify-between p-3 rounded-2xl transition-all duration-200 cursor-pointer text-left group ${
                    isActive
                      ? 'bg-[#0F5F62] text-white shadow-md ring-2 ring-[#0F5F62] dark:ring-[#B9E2DD]'
                      : 'hover:bg-[#F3FAF9] dark:hover:bg-[#083B40]/70 text-[#123234] dark:text-[#EAF2F1]'
                  }`}
                >
                  {/* Left: Surah Number & Names */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-[#061B1D] text-[#0F5F62] dark:text-[#B9E2DD] border border-[#D7E9E7] dark:border-[#13545A]'
                      }`}
                    >
                      {surah.number}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm truncate">
                          {surah.nameEnglish}
                        </span>
                        <span
                          className={`text-xs truncate ${
                            isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          ({surah.nameBangla})
                        </span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-[#B9E2DD] shrink-0 animate-ping" />
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-2 text-[10px] mt-0.5 ${
                          isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <span>{surah.englishTranslation}</span>
                        <span>·</span>
                        <span>
                          {language === 'bn'
                            ? `${toBengaliNumber(surah.numberOfAyahs)} আয়াত`
                            : `${surah.numberOfAyahs} Ayahs`}
                        </span>
                        <span>·</span>
                        <span className="px-1.5 py-0.2 rounded-sm bg-black/5 dark:bg-white/10">
                          {surah.revelationTypeBn}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Arabic Calligraphy & Page */}
                  <div className="text-right shrink-0 pl-2" dir="rtl">
                    <div
                      className={`font-arabic font-bold text-base sm:text-lg transition-transform group-hover:scale-105 ${
                        isActive ? 'text-white' : 'text-[#0F5F62] dark:text-[#B9E2DD]'
                      }`}
                    >
                      {surah.nameArabic}
                    </div>
                    <span
                      className={`text-[10px] font-mono block ${
                        isActive ? 'text-white/80' : 'text-slate-400 dark:text-slate-400'
                      }`}
                    >
                      {language === 'bn'
                        ? `পৃষ্ঠা ${toBengaliNumber(surah.pageStart)}`
                        : `Page ${surah.pageStart}`}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer: Active Surah Status Bar */}
        <div className="p-3 px-4 sm:px-6 bg-slate-50 dark:bg-[#07171A] border-t border-[#D7E9E7]/80 dark:border-[#13545A] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#0F5F62] dark:bg-[#B9E2DD]" />
            <span>
              {language === 'bn'
                ? `বর্তমানে সক্রিয়: সূরা ${SURAH_LIST[activeSurah - 1]?.nameBangla || activeSurah}`
                : `Currently Reading: Surah ${SURAH_LIST[activeSurah - 1]?.nameEnglish || activeSurah}`}
            </span>
          </div>

          <button
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className="py-1 px-3 rounded-xl bg-slate-200 dark:bg-[#13545A] text-slate-700 dark:text-white font-semibold cursor-pointer hover:opacity-80 transition-opacity"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
