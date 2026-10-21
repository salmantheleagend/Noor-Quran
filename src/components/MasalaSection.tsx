import React, { useState } from 'react';
import { AppLanguage, MasalaItem } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  MASALAS_LIST,
  MASALA_CATEGORIES,
} from '../data/masalaData';
import {
  Search,
  BookOpen,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';

interface MasalaSectionProps {
  language: AppLanguage;
}

export const MasalaSection: React.FC<MasalaSectionProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(MASALAS_LIST[0].id);

  const toggleExpand = (id: string) => {
    triggerHaptic(15);
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredMasalas = MASALAS_LIST.filter(m => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      m.questionBn.toLowerCase().includes(q) ||
      m.answerBn.toLowerCase().includes(q) ||
      m.references.some(r => r.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#10235A] dark:text-white">
            {t.masala}
          </h2>
          <p className="text-xs text-[#6B7280] dark:text-slate-400">
            {language === 'bn'
              ? 'দৈনন্দিন জীবনের প্রয়োজনীয় ইসলামি ফিকহ ও মাসআলা-মাসায়েল'
              : 'Essential Islamic Fiqh & Everyday Rulings'}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#F8E8ED] dark:bg-[#10235A] text-[#21409A] dark:text-[#E9B7C3] text-xs font-bold border border-[#E7D9DE] dark:border-[#24386E]">
          {language === 'bn' ? `${filteredMasalas.length}টি মাসআলা` : `${filteredMasalas.length} Masalas`}
        </span>
      </div>

      {/* Mandatory Scholarly Disclaimer Box */}
      <div className="p-3.5 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#24386E] flex items-start gap-2.5 text-xs text-[#10235A] dark:text-[#F8E8ED]">
        <AlertTriangle className="w-4 h-4 text-[#21409A] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>{language === 'bn' ? 'শরিয়াহ সতর্কবার্তা: ' : 'Shariah Advisory: '}</strong>
          {language === 'bn'
            ? 'এই সেকশনের প্রশ্নোত্তরগুলো কেবল সাধারণ দ্বীনি শিক্ষার জন্য নির্ভরযোগ্য গ্রন্থ থেকে সংকলিত। যেকোনো বিশেষ, ব্যক্তিগত বা জটিল ফতোয়ার জন্য অনুগ্রহ করে আপনার এলাকার নির্ভরযোগ্য হক্কানী মুফতি বা আলেমের সাথে সরাসরি পরামর্শ করুন।'
            : 'Answers in this section are compiled from verified classical Fiqh sources for educational purposes. For personal or complex fatwas, please consult a qualified local Islamic scholar or Mufti.'}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'bn' ? 'মাসআলার বিষয় বা প্রশ্ন লিখে খুঁজুন...' : 'Search Masalas by topic or question...'}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] text-sm text-[#1F2937] dark:text-slate-100 placeholder-[#6B7280] focus:outline-hidden focus:ring-2 focus:ring-[#21409A]/40"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {MASALA_CATEGORIES.map((cat) => (
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

      {/* Masala Accordion List */}
      <div className="space-y-2.5">
        {filteredMasalas.map((masala) => {
          const isExpanded = expandedId === masala.id;

          return (
            <div
              key={masala.id}
              className="rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(masala.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#F8E8ED]/40 dark:hover:bg-[#1C2D5A] transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-2.5 pr-2">
                  <span className="w-5 h-5 rounded-full bg-[#F8E8ED] dark:bg-[#10235A] text-[#21409A] dark:text-[#E9B7C3] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#E7D9DE] dark:border-[#24386E]">
                    প্র
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#10235A] dark:text-white leading-snug">
                      {masala.questionBn}
                    </h4>
                    <span className="text-[10px] text-[#21409A] dark:text-[#E9B7C3] font-medium mt-0.5 block">
                      {masala.categoryBn}
                    </span>
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[#6B7280] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#6B7280] shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="p-4 pt-1 border-t border-[#E7D9DE] dark:border-[#1C2D5A] text-xs space-y-3 font-bengali">
                  <div className="p-3 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/50 leading-relaxed text-[#1F2937] dark:text-slate-200 border border-[#E7D9DE] dark:border-[#24386E]">
                    <strong className="text-[#21409A] dark:text-[#E9B7C3] block mb-1">
                      {language === 'bn' ? 'উত্তর:' : 'Answer:'}
                    </strong>
                    <p>{masala.answerBn}</p>
                  </div>

                  {masala.madhabNote && (
                    <div className="p-2.5 rounded-xl bg-[#F8E8ED] dark:bg-[#10235A] border border-[#E7D9DE] dark:border-[#24386E] text-[#10235A] dark:text-[#F8E8ED] text-[11px]">
                      <strong>{language === 'bn' ? 'মাযহাবগত মতভিন্নতা: ' : 'Juristic Note: '}</strong> {masala.madhabNote}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-[#6B7280] dark:text-slate-400 pt-1">
                    <span>{language === 'bn' ? 'প্রামাণ্য সূত্র:' : 'Verified Reference:'}</span>
                    <span className="font-semibold text-[#10235A] dark:text-slate-300">
                      {masala.references.join(', ')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
