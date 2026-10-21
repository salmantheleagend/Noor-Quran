import React, { useState } from 'react';
import { AppLanguage, HadithItem } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  HADITHS_LIST,
  HADITH_CATEGORIES,
} from '../data/hadithData';
import {
  BookOpen,
  Share2,
  Check,
  Heart,
  Search,
  Sparkles,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';

interface HadithSectionProps {
  language: AppLanguage;
  favoriteHadiths: string[];
  onToggleFavoriteHadith: (hadithId: string) => void;
}

export const HadithSection: React.FC<HadithSectionProps> = ({
  language,
  favoriteHadiths,
  onToggleFavoriteHadith,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShareHadith = (hadith: HadithItem) => {
    const text = `হাদিস: ${hadith.titleBn}\n\n${hadith.arabic}\n\nঅনুবাদ: "${hadith.translationBn}"\n\nসূত্র: ${hadith.sourceBn}\nব্যাখ্যা: ${hadith.explanationBn}\n\n(নূর কুরআন)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(hadith.id);
      triggerHaptic(20);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredHadiths = HADITHS_LIST.filter(h => {
    const matchesCat = selectedCategory === 'all' || h.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      h.titleBn.toLowerCase().includes(q) ||
      h.translationBn.toLowerCase().includes(q) ||
      h.arabic.includes(q) ||
      h.sourceBn.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t.hadith}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {language === 'bn'
            ? 'সহিহ বুখারি, সহিহ মুসলিম ও বিশুদ্ধ উৎস হতে শিক্ষণীয় নির্বাচিত হাদিস সম্ভার'
            : 'Selected authentic Hadiths compiled from Sahih Bukhari, Sahih Muslim and verified sources'}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'bn' ? 'হাদিসের বিষয় বা উৎস দিয়ে খুঁজুন...' : 'Search Hadiths by topic, narrator or source...'}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] text-sm text-[#1F2937] dark:text-slate-100 placeholder-[#6B7280] focus:outline-hidden focus:ring-2 focus:ring-[#21409A]/40"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {HADITH_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full shrink-0 font-medium transition-colors cursor-pointer min-h-[36px] ${
              selectedCategory === cat.id
                ? 'bg-[#21409A] text-white shadow-xs font-bold'
                : 'bg-[#F8E8ED] dark:bg-[#142042] text-[#10235A] dark:text-slate-300 hover:bg-[#E9B7C3]/30'
            }`}
          >
            {cat.nameBn}
          </button>
        ))}
      </div>

      {/* Hadith Cards */}
      <div className="space-y-3">
        {filteredHadiths.map((hadith) => {
          const isFav = favoriteHadiths.includes(hadith.id);
          const isCopied = copiedId === hadith.id;

          return (
            <div
              key={hadith.id}
              className="p-4 rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs space-y-3"
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between border-b border-[#E7D9DE] dark:border-[#1C2D5A] pb-2">
                <div>
                  <h4 className="text-sm font-bold text-[#10235A] dark:text-white">
                    {hadith.titleBn}
                  </h4>
                  <span className="text-[11px] text-[#21409A] dark:text-[#E9B7C3] font-medium">
                    {hadith.categoryBn}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleShareHadith(hadith)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B7280] hover:bg-[#F8E8ED] dark:hover:bg-[#10235A] transition-colors cursor-pointer"
                    title={language === 'bn' ? 'শেয়ার বা কপি করুন' : 'Share or Copy'}
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => onToggleFavoriteHadith(hadith.id)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      isFav ? 'text-rose-500' : 'text-[#6B7280] hover:bg-[#F8E8ED]'
                    }`}
                    title={language === 'bn' ? 'প্রিয় তালিকা' : 'Favorite'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Arabic */}
              <p className="font-arabic text-xl leading-loose text-right text-[#10235A] dark:text-white block mb-2" dir="rtl">
                {hadith.arabic}
              </p>

              {/* Translation */}
              <p className="text-xs text-[#1F2937] dark:text-slate-200 font-bengali leading-relaxed text-left block mb-2" dir="ltr">
                "{hadith.translationBn}"
              </p>

              {/* Explanation & Source */}
              <div className="p-3 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#24386E] text-[11px] space-y-1.5">
                <p className="text-[#1F2937] dark:text-slate-300 leading-normal">
                  <strong>সংক্ষিপ্ত ব্যাখ্যা:</strong> {hadith.explanationBn}
                </p>
                <div className="flex items-center justify-between text-[#6B7280] dark:text-slate-400 pt-1 border-t border-[#E7D9DE] dark:border-[#24386E]">
                  <span>বর্ণনাকারী: {hadith.narratorBn}</span>
                  <span className="font-bold text-[#21409A] dark:text-[#E9B7C3]">
                    {hadith.sourceBn}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
