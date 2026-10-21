import React, { useState, useMemo } from 'react';
import { AppLanguage } from '../types';
import { SURAH_LIST } from '../data/quranData';
import { HADITHS_LIST } from '../data/hadithData';
import { DUAS_LIST } from '../data/duaData';
import { MASALAS_LIST } from '../data/masalaData';
import { JUZ_LIST } from '../utils/quranPageManager';
import { triggerHaptic } from '../utils/audioPlayer';
import { toBn } from '../utils/prayerTimes';
import {
  Search,
  BookOpen,
  Sparkles,
  HelpCircle,
  X,
  ChevronRight,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export interface GlobalSearchProps {
  language: AppLanguage;
  onNavigate: (tab: string, surahId?: number) => void;
}

type SearchCategory = 'all' | 'quran' | 'hadith' | 'dua' | 'masala';

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ language, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');

  const popularSearches = [
    { labelBn: 'সূরা আল-কাহফ', labelEn: 'Surah Al-Kahf', query: 'কাহফ', queryEn: 'Kahf' },
    { labelBn: 'সূরা ইয়াসিন', labelEn: 'Surah Yaseen', query: 'ইয়াসিন', queryEn: 'Yaseen' },
    { labelBn: 'আয়াতুল কুরসি', labelEn: 'Ayatul Kursi', query: 'কুরসি', queryEn: 'Kursi' },
    { labelBn: 'তাহাজ্জুদ নামাজ', labelEn: 'Tahajjud Prayer', query: 'তাহাজ্জুদ', queryEn: 'Tahajjud' },
    { labelBn: 'ইস্তিখারা দোয়া', labelEn: 'Istikharah Dua', query: 'ইস্তিখারা', queryEn: 'Istikharah' },
    { labelBn: 'ইফতারের দোয়া', labelEn: 'Iftar Dua', query: 'ইফতার', queryEn: 'Iftar' },
    { labelBn: 'পারা ৩০ (আমপারা)', labelEn: 'Juz 30 (Amma)', query: 'আম্মা', queryEn: 'Amma' },
  ];

  // Normalized search query
  const trimmed = searchQuery.trim().toLowerCase();

  // Search results
  const results = useMemo(() => {
    if (!trimmed) {
      return {
        quran: [],
        hadiths: [],
        duas: [],
        masalas: [],
        total: 0,
      };
    }

    // 1. Quran Surahs and Juz
    const matchedSurahs = SURAH_LIST.filter((s) => {
      const numMatch = s.number.toString() === trimmed;
      const bnMatch = s.nameBangla.toLowerCase().includes(trimmed);
      const enMatch = s.nameEnglish.toLowerCase().includes(trimmed);
      const arMatch = s.nameArabic.includes(trimmed);
      const meaningMatch = s.englishTranslation.toLowerCase().includes(trimmed);
      return numMatch || bnMatch || enMatch || arMatch || meaningMatch;
    });

    const matchedJuz = JUZ_LIST.filter((j) => {
      const numMatch = j.number.toString() === trimmed;
      const bnMatch = j.nameBangla.toLowerCase().includes(trimmed);
      const enMatch = j.nameEnglish.toLowerCase().includes(trimmed);
      const arMatch = j.nameArabic.includes(trimmed);
      return numMatch || bnMatch || enMatch || arMatch;
    });

    // 2. Hadiths
    const matchedHadiths = HADITHS_LIST.filter((h) => {
      const bnText = h.translationBn.toLowerCase();
      const enText = (h.translationEn || '').toLowerCase();
      const sourceBn = (h.sourceBn || '').toLowerCase();
      const sourceEn = (h.source || '').toLowerCase();
      return (
        bnText.includes(trimmed) ||
        enText.includes(trimmed) ||
        sourceBn.includes(trimmed) ||
        sourceEn.includes(trimmed)
      );
    });

    // 3. Duas & Azkar
    const matchedDuas = DUAS_LIST.filter((d) => {
      const titleBn = d.titleBn.toLowerCase();
      const titleEn = (d.title || '').toLowerCase();
      const meaningBn = d.translationBn.toLowerCase();
      const meaningEn = (d.translationEn || '').toLowerCase();
      const catBn = (d.categoryBn || '').toLowerCase();
      const catEn = (d.category || '').toLowerCase();
      return (
        titleBn.includes(trimmed) ||
        titleEn.includes(trimmed) ||
        meaningBn.includes(trimmed) ||
        meaningEn.includes(trimmed) ||
        catBn.includes(trimmed) ||
        catEn.includes(trimmed)
      );
    });

    // 4. Masala & Fiqh
    const matchedMasalas = MASALAS_LIST.filter((m) => {
      const qBn = m.questionBn.toLowerCase();
      const aBn = m.answerBn.toLowerCase();
      const refs = m.references.join(' ').toLowerCase();
      return (
        qBn.includes(trimmed) ||
        aBn.includes(trimmed) ||
        refs.includes(trimmed)
      );
    });

    const quranCombined = [
      ...matchedSurahs.map((s) => ({ type: 'surah' as const, data: s })),
      ...matchedJuz.map((j) => ({ type: 'juz' as const, data: j })),
    ];

    const total =
      quranCombined.length +
      matchedHadiths.length +
      matchedDuas.length +
      matchedMasalas.length;

    return {
      quran: quranCombined,
      hadiths: matchedHadiths,
      duas: matchedDuas,
      masalas: matchedMasalas,
      total,
    };
  }, [trimmed]);

  return (
    <div className="pb-32 pt-2 px-3 sm:px-4 max-w-2xl mx-auto space-y-4 text-[#1F2937] dark:text-[#F8E8ED]">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#10235A] dark:text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-[#21409A] dark:text-[#E9B7C3]" />
          <span>{language === 'bn' ? 'সমন্বিত ইসলামিক অনুসন্ধান' : 'Unified Islamic Search'}</span>
        </h2>
        <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5">
          {language === 'bn'
            ? 'কুরআনের ১১৪ সূরা, আয়াত, সহীহ হাদিস, দোআ ও প্রয়োজনীয় মাসআলা খুঁজুন'
            : 'Search across 114 Surahs, authentic Hadiths, daily Duas, and Fiqh rulings'}
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'সূরা নাম, নম্বর, হাদিসের বিষয় বা দোআ লিখুন...'
                : 'Search Surah, Hadith topic, Dua, or Masala...'
            }
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-xs text-xs sm:text-sm text-[#10235A] dark:text-white placeholder-[#6B7280] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#21409A] transition-all"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => {
                triggerHaptic(10);
                setSearchQuery('');
              }}
              className="absolute right-3 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => {
            triggerHaptic(10);
            setSelectedCategory('all');
          }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#21409A] text-white shadow-2xs'
              : 'bg-[#F8E8ED] dark:bg-[#10235A] text-[#10235A] dark:text-slate-200 border border-[#E7D9DE] dark:border-[#24386E]'
          }`}
        >
          {language === 'bn' ? 'সকল বিষয়' : 'All Topics'}
          {trimmed ? ` (${language === 'bn' ? toBn(results.total) : results.total})` : ''}
        </button>

        <button
          onClick={() => {
            triggerHaptic(10);
            setSelectedCategory('quran');
          }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            selectedCategory === 'quran'
              ? 'bg-[#21409A] text-white shadow-2xs'
              : 'bg-[#F8E8ED] dark:bg-[#10235A] text-[#10235A] dark:text-slate-200 border border-[#E7D9DE] dark:border-[#24386E]'
          }`}
        >
          {language === 'bn' ? 'কুরআন' : 'Quran'}
          {trimmed ? ` (${language === 'bn' ? toBn(results.quran.length) : results.quran.length})` : ''}
        </button>

        <button
          onClick={() => {
            triggerHaptic(10);
            setSelectedCategory('hadith');
          }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            selectedCategory === 'hadith'
              ? 'bg-[#21409A] text-white shadow-2xs'
              : 'bg-[#F8E8ED] dark:bg-[#10235A] text-[#10235A] dark:text-slate-200 border border-[#E7D9DE] dark:border-[#24386E]'
          }`}
        >
          {language === 'bn' ? 'হাদিস' : 'Hadith'}
          {trimmed ? ` (${language === 'bn' ? toBn(results.hadiths.length) : results.hadiths.length})` : ''}
        </button>

        <button
          onClick={() => {
            triggerHaptic(10);
            setSelectedCategory('dua');
          }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            selectedCategory === 'dua'
              ? 'bg-[#21409A] text-white shadow-2xs'
              : 'bg-[#F8E8ED] dark:bg-[#10235A] text-[#10235A] dark:text-slate-200 border border-[#E7D9DE] dark:border-[#24386E]'
          }`}
        >
          {language === 'bn' ? 'দোআ ও জিকির' : 'Dua & Azkar'}
          {trimmed ? ` (${language === 'bn' ? toBn(results.duas.length) : results.duas.length})` : ''}
        </button>

        <button
          onClick={() => {
            triggerHaptic(10);
            setSelectedCategory('masala');
          }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            selectedCategory === 'masala'
              ? 'bg-[#21409A] text-white shadow-2xs'
              : 'bg-[#F8E8ED] dark:bg-[#10235A] text-[#10235A] dark:text-slate-200 border border-[#E7D9DE] dark:border-[#24386E]'
          }`}
        >
          {language === 'bn' ? 'জরুরি মাসআলা' : 'Masala & Fiqh'}
          {trimmed ? ` (${language === 'bn' ? toBn(results.masalas.length) : results.masalas.length})` : ''}
        </button>
      </div>

      {/* If No Query, show Popular Suggestions */}
      {!trimmed && (
        <div className="space-y-3 pt-1">
          <span className="text-xs font-bold text-[#10235A] dark:text-slate-300 block">
            {language === 'bn' ? 'জনপ্রিয় অনুসন্ধানসমূহ:' : 'Popular Searches:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  triggerHaptic(10);
                  setSearchQuery(language === 'bn' ? p.query : p.queryEn);
                }}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] text-xs font-medium text-[#10235A] dark:text-[#E9B7C3] hover:border-[#21409A] hover:bg-[#F8E8ED]/40 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>{language === 'bn' ? p.labelBn : p.labelEn}</span>
                <ArrowUpRight className="w-3 h-3 text-[#6B7280]" />
              </button>
            ))}
          </div>

          {/* Quick Category Gateway Cards */}
          <div className="pt-3 grid grid-cols-2 gap-2.5">
            <div
              onClick={() => {
                triggerHaptic(15);
                onNavigate('quran');
              }}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] hover:border-[#21409A] transition-all cursor-pointer group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-[#F8E8ED] dark:bg-[#10235A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center mb-2">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#10235A] dark:text-white group-hover:text-[#21409A] transition-colors">
                {language === 'bn' ? 'কুরআনুল কারীম' : 'Holy Quran'}
              </h4>
              <p className="text-[10px] text-[#6B7280] dark:text-slate-400 mt-0.5">
                {language === 'bn' ? '১১৪ সূরা ও ৩০ পারা' : '114 Surahs & 30 Juz'}
              </p>
            </div>

            <div
              onClick={() => {
                triggerHaptic(15);
                onNavigate('hadith');
              }}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] hover:border-[#21409A] transition-all cursor-pointer group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-[#F8E8ED] dark:bg-[#10235A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center mb-2">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#10235A] dark:text-white group-hover:text-[#21409A] transition-colors">
                {language === 'bn' ? 'সহীহ হাদিস ভাণ্ডার' : 'Authentic Hadith'}
              </h4>
              <p className="text-[10px] text-[#6B7280] dark:text-slate-400 mt-0.5">
                {language === 'bn' ? 'বুখারী ও মুসলিমের আলোকে' : 'Bukhari, Muslim & Sunan'}
              </p>
            </div>

            <div
              onClick={() => {
                triggerHaptic(15);
                onNavigate('dua');
              }}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] hover:border-[#21409A] transition-all cursor-pointer group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-[#F8E8ED] dark:bg-[#10235A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center mb-2">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#10235A] dark:text-white group-hover:text-[#21409A] transition-colors">
                {language === 'bn' ? 'দৈনন্দিন মাসনূন দোআ' : 'Masnoon Duas'}
              </h4>
              <p className="text-[10px] text-[#6B7280] dark:text-slate-400 mt-0.5">
                {language === 'bn' ? 'সকাল-সন্ধ্যা ও প্রাত্যহিক আমল' : 'Morning & Evening Azkar'}
              </p>
            </div>

            <div
              onClick={() => {
                triggerHaptic(15);
                onNavigate('masala');
              }}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] hover:border-[#21409A] transition-all cursor-pointer group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-[#F8E8ED] dark:bg-[#10235A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center mb-2">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#10235A] dark:text-white group-hover:text-[#21409A] transition-colors">
                {language === 'bn' ? 'প্রয়োজনীয় ফিকহি মাসআলা' : 'Fiqh Masala'}
              </h4>
              <p className="text-[10px] text-[#6B7280] dark:text-slate-400 mt-0.5">
                {language === 'bn' ? 'সালাত ও তাহরাত বিষয়ক বিধান' : 'Verified Islamic rulings'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Display */}
      {trimmed && (
        <div className="space-y-4 pt-1">
          {results.total === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#F8E8ED] dark:bg-[#10235A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-[#10235A] dark:text-white">
                {language === 'bn'
                  ? `"${searchQuery}" সংক্রান্ত কিছু পাওয়া যায়নি`
                  : `No results found for "${searchQuery}"`}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-slate-400">
                {language === 'bn'
                  ? 'বানান পরিবর্তন করে অন্য শব্দ দিয়ে অনুসন্ধান করার চেষ্টা করুন।'
                  : 'Try searching with different keywords or spelling.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 1. Quran Results */}
              {(selectedCategory === 'all' || selectedCategory === 'quran') &&
                results.quran.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#10235A] dark:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
                        <span>{language === 'bn' ? 'পবিত্র কুরআন' : 'Holy Quran'}</span>
                      </span>
                      <span className="text-[#6B7280] text-[11px]">
                        {language === 'bn'
                          ? `${toBn(results.quran.length)}টি ফলাফল`
                          : `${results.quran.length} results`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {results.quran.map((item, idx) => {
                        if (item.type === 'surah') {
                          const s = item.data;
                          return (
                            <div
                              key={`s-${s.number}-${idx}`}
                              onClick={() => {
                                triggerHaptic(15);
                                onNavigate('quran', s.number);
                              }}
                              className="p-3.5 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] hover:border-[#21409A] transition-all cursor-pointer flex items-center justify-between shadow-2xs group"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-[#F8E8ED] dark:bg-[#10235A] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                                  {s.number}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs sm:text-sm font-bold text-[#10235A] dark:text-white group-hover:text-[#21409A] transition-colors">
                                      {language === 'bn' ? `সূরা ${s.nameBangla}` : `Surah ${s.nameEnglish}`}
                                    </h4>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#F8E8ED] dark:bg-[#10235A] text-[#21409A] dark:text-[#E9B7C3] font-semibold">
                                      {s.revelationType === 'Meccan'
                                        ? (language === 'bn' ? 'মাক্কী' : 'Meccan')
                                        : (language === 'bn' ? 'মাদানী' : 'Medinan')}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#6B7280] dark:text-slate-400 mt-0.5">
                                    {language === 'bn'
                                      ? `${toBn(s.numberOfAyahs)} আয়াত · পৃষ্ঠা ${toBn(s.pageStart)} · পারা ${toBn(s.juzStart)}`
                                      : `${s.numberOfAyahs} verses · Page ${s.pageStart} · Juz ${s.juzStart}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-arabic text-base sm:text-lg font-bold text-[#21409A] dark:text-[#E9B7C3]" dir="rtl">
                                  {s.nameArabic}
                                </span>
                                <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          );
                        } else {
                          const j = item.data;
                          return (
                            <div
                              key={`j-${j.number}-${idx}`}
                              onClick={() => {
                                triggerHaptic(15);
                                onNavigate('quran', j.startSurah);
                              }}
                              className="p-3.5 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] hover:border-[#21409A] transition-all cursor-pointer flex items-center justify-between shadow-2xs group"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                                  J{j.number}
                                </span>
                                <div>
                                  <h4 className="text-xs sm:text-sm font-bold text-[#10235A] dark:text-white group-hover:text-[#21409A] transition-colors">
                                    {language === 'bn' ? j.nameBangla : `Juz ${j.number}: ${j.nameEnglish}`}
                                  </h4>
                                  <p className="text-[11px] text-[#6B7280] dark:text-slate-400 mt-0.5">
                                    {language === 'bn'
                                      ? `পৃষ্ঠা ${toBn(j.startPage)} থেকে শুরু`
                                      : `Starts at Page ${j.startPage}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-arabic text-sm font-bold text-emerald-600 dark:text-emerald-400" dir="rtl">
                                  {j.nameArabic}
                                </span>
                                <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                )}

              {/* 2. Hadith Results */}
              {(selectedCategory === 'all' || selectedCategory === 'hadith') &&
                results.hadiths.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#10235A] dark:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
                        <span>{language === 'bn' ? 'সহীহ হাদিস' : 'Authentic Hadith'}</span>
                      </span>
                      <span className="text-[#6B7280] text-[11px]">
                        {language === 'bn'
                          ? `${toBn(results.hadiths.length)}টি ফলাফল`
                          : `${results.hadiths.length} results`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {results.hadiths.map((h) => (
                        <div
                          key={`hadith-${h.id}`}
                          onClick={() => {
                            triggerHaptic(15);
                            onNavigate('hadith');
                          }}
                          className="p-3.5 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] hover:border-[#21409A] transition-all cursor-pointer space-y-2 shadow-2xs group"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#21409A] dark:text-[#E9B7C3]">
                              {language === 'bn' ? h.sourceBn : (h.source || h.sourceBn)}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                              {language === 'bn' ? (h.gradeBn || 'সহিহ') : (h.grade || 'Sahih')}
                            </span>
                          </div>

                          <p className="text-xs text-[#1F2937] dark:text-slate-200 leading-relaxed line-clamp-2">
                            "{language === 'bn' ? h.translationBn : (h.translationEn || h.translationBn)}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* 3. Dua Results */}
              {(selectedCategory === 'all' || selectedCategory === 'dua') &&
                results.duas.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#10235A] dark:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
                        <span>{language === 'bn' ? 'দোআ ও জিকির' : 'Dua & Azkar'}</span>
                      </span>
                      <span className="text-[#6B7280] text-[11px]">
                        {language === 'bn'
                          ? `${toBn(results.duas.length)}টি ফলাফল`
                          : `${results.duas.length} results`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {results.duas.map((d) => (
                        <div
                          key={`dua-${d.id}`}
                          onClick={() => {
                            triggerHaptic(15);
                            onNavigate('dua');
                          }}
                          className="p-3.5 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] hover:border-[#21409A] transition-all cursor-pointer space-y-1.5 shadow-2xs group"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs sm:text-sm font-bold text-[#10235A] dark:text-white group-hover:text-[#21409A] transition-colors">
                              {language === 'bn' ? d.titleBn : (d.title || d.titleBn)}
                            </h4>
                            <span className="text-[10px] text-[#6B7280] dark:text-slate-400">
                              {language === 'bn' ? d.referenceBn : d.reference}
                            </span>
                          </div>

                          <p className="font-uthmani text-sm text-[#21409A] dark:text-[#E9B7C3] font-bold text-right line-clamp-1" dir="rtl">
                            {d.arabic}
                          </p>

                          <p className="text-xs text-[#4B5563] dark:text-slate-300 line-clamp-2">
                            {language === 'bn' ? d.translationBn : (d.translationEn || d.translationBn)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* 4. Masala Results */}
              {(selectedCategory === 'all' || selectedCategory === 'masala') &&
                results.masalas.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#10235A] dark:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
                        <span>{language === 'bn' ? 'জরুরি মাসআলা' : 'Fiqh Masala'}</span>
                      </span>
                      <span className="text-[#6B7280] text-[11px]">
                        {language === 'bn'
                          ? `${toBn(results.masalas.length)}টি ফলাফল`
                          : `${results.masalas.length} results`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {results.masalas.map((m) => (
                        <div
                          key={`masala-${m.id}`}
                          onClick={() => {
                            triggerHaptic(15);
                            onNavigate('masala');
                          }}
                          className="p-3.5 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] hover:border-[#21409A] transition-all cursor-pointer space-y-1.5 shadow-2xs group"
                        >
                          <h4 className="text-xs sm:text-sm font-bold text-[#10235A] dark:text-white group-hover:text-[#21409A] transition-colors">
                            {m.questionBn}
                          </h4>
                          <p className="text-xs text-[#4B5563] dark:text-slate-300 line-clamp-2">
                            {m.answerBn}
                          </p>
                          <span className="text-[10px] text-[#21409A] dark:text-[#E9B7C3] font-semibold block pt-0.5">
                            {language === 'bn' ? `দলিল: ${m.references.join(', ')}` : `Reference: ${m.references.join(', ')}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
