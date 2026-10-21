import React, { useState } from 'react';
import { AppLanguage, DuaItem } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  DUAS_LIST,
  DUA_CATEGORIES,
  MASNOON_HABITS,
} from '../data/duaData';
import {
  Heart,
  Volume2,
  Check,
  Share2,
  CheckCircle2,
  Circle,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { speakArabic, triggerHaptic } from '../utils/audioPlayer';

interface DuaAzkarProps {
  language: AppLanguage;
  dailyAmalChecklist: Record<string, boolean>;
  onToggleAmalHabit: (habitId: string) => void;
  favoriteDuas: string[];
  onToggleFavoriteDua: (duaId: string) => void;
}

export const DuaAzkar: React.FC<DuaAzkarProps> = ({
  language,
  dailyAmalChecklist,
  onToggleAmalHabit,
  favoriteDuas,
  onToggleFavoriteDua,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'duas' | 'checklist'>('duas');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [duaCounters, setDuaCounters] = useState<Record<string, number>>({});
  const [copiedDuaId, setCopiedDuaId] = useState<string | null>(null);

  const handleIncrement = (duaId: string) => {
    triggerHaptic(15);
    setDuaCounters(prev => ({
      ...prev,
      [duaId]: (prev[duaId] || 0) + 1,
    }));
  };

  const handleResetCounter = (duaId: string) => {
    triggerHaptic(20);
    setDuaCounters(prev => ({
      ...prev,
      [duaId]: 0,
    }));
  };

  const handleSpeak = (text: string) => {
    triggerHaptic(15);
    speakArabic(text);
  };

  const handleShareDua = (dua: DuaItem) => {
    const text = `${dua.titleBn}\n\n${dua.arabic}\n\nউচ্চারণ: ${dua.transliterationBn}\n\nঅর্থ: ${dua.translationBn}\n\nসূত্র: ${dua.referenceBn}\n(নূর কুরআন)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedDuaId(dua.id);
      triggerHaptic(20);
      setTimeout(() => setCopiedDuaId(null), 2000);
    }
  };

  const filteredDuas = DUAS_LIST.filter(
    d => selectedCategory === 'all' || d.category === selectedCategory
  );

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t.dua}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {language === 'bn'
            ? 'হিসনুল মুসলিম হতে সংকলিত সহিহ দোয়া ও দৈনন্দিন মাসনূন আমল ট্র্যাকার'
            : 'Authentic Duas from Hisnul Muslim & Daily Masnoon Deeds Tracker'}
        </p>
      </div>

      {/* Tabs: Duas vs Masnoon Checklist */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-medium">
        <button
          onClick={() => setActiveTab('duas')}
          className={`py-2 rounded-xl transition-all ${
            activeTab === 'duas'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {language === 'bn' ? `মাসনূন দোয়া সমূহ (${DUAS_LIST.length})` : `Masnoon Duas (${DUAS_LIST.length})`}
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`py-2 rounded-xl transition-all ${
            activeTab === 'checklist'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {language === 'bn' ? 'দৈনিক আমল চেকলিস্ট' : 'Daily Deeds Checklist'}
        </button>
      </div>

      {/* DUAS LIST VIEW */}
      {activeTab === 'duas' && (
        <div className="space-y-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {DUA_CATEGORIES.map((cat) => (
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

          {/* Duas Cards */}
          <div className="space-y-3">
            {filteredDuas.map((dua) => {
              const count = duaCounters[dua.id] || 0;
              const isFav = favoriteDuas.includes(dua.id);
              const isCopied = copiedDuaId === dua.id;

              return (
                <div
                  key={dua.id}
                  className="p-4 rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs space-y-3"
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-[#E7D9DE] dark:border-[#1C2D5A] pb-2">
                    <div>
                      <h4 className="text-sm font-bold text-[#10235A] dark:text-white">
                        {dua.titleBn}
                      </h4>
                      <span className="text-[10px] text-[#21409A] dark:text-[#E9B7C3] font-medium">
                        {language === 'bn' ? dua.categoryBn : (DUA_CATEGORIES.find(c => c.id === dua.category)?.nameEn || dua.category)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSpeak(dua.arabic)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B7280] hover:bg-[#F8E8ED] dark:hover:bg-[#10235A] transition-colors cursor-pointer"
                        title={language === 'bn' ? 'উচ্চারণ শুনুন' : 'Listen'}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleShareDua(dua)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B7280] hover:bg-[#F8E8ED] dark:hover:bg-[#10235A] transition-colors cursor-pointer"
                        title={language === 'bn' ? 'কপি করুন' : 'Copy'}
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => onToggleFavoriteDua(dua.id)}
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
                    {dua.arabic}
                  </p>

                  {/* Transliteration */}
                  <p className="text-xs text-[#6B7280] dark:text-slate-400 italic text-left block mb-1" dir="ltr">
                    {dua.transliterationBn}
                  </p>

                  {/* Translation */}
                  <p className="text-xs text-[#1F2937] dark:text-slate-200 font-bengali leading-relaxed text-left block mb-2" dir="ltr">
                    "{language === 'bn' ? dua.translationBn : (dua.translationEn || dua.translationBn)}"
                  </p>

                  {/* Benefits & Source */}
                  <div className="p-2.5 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#24386E] text-[11px] space-y-1">
                    {dua.benefitsBn && (
                      <p className="text-[#21409A] dark:text-[#E9B7C3] font-bold">
                        <strong>{language === 'bn' ? 'ফজিলত: ' : 'Virtue: '}</strong> {dua.benefitsBn}
                      </p>
                    )}
                    <span className="text-[#6B7280] dark:text-slate-400 block">
                      {language === 'bn' ? `সূত্র: ${dua.referenceBn}` : `Source: ${dua.reference || dua.referenceBn}`}
                    </span>
                  </div>

                  {/* Counter row */}
                  {dua.counterTarget && (
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#6B7280]">
                          {language === 'bn' ? 'পাঠ সংখ্যা: ' : 'Count: '}
                          <strong className="text-[#10235A] dark:text-white font-mono">{count}</strong>
                          {dua.counterTarget > 1 && ` / ${dua.counterTarget}`}
                        </span>
                        {count > 0 && (
                          <button
                            onClick={() => handleResetCounter(dua.id)}
                            className="text-[10px] text-[#6B7280] hover:text-[#10235A] underline cursor-pointer"
                          >
                            {language === 'bn' ? 'রিসেট' : 'Reset'}
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleIncrement(dua.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#21409A] text-white text-xs font-semibold hover:bg-[#10235A] active:scale-95 transition-all shadow-xs cursor-pointer"
                      >
                        {language === 'bn' ? 'পাঠ করেছি (+১)' : 'Recited (+1)'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MASNOON HABIT CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-3">
          <div className="p-3.5 bg-[#F8E8ED] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#24386E] rounded-2xl text-xs text-[#10235A] dark:text-[#F8E8ED]">
            <strong>{language === 'bn' ? 'দৈনিক মাসনূন আমল ট্র্যাকার: ' : 'Daily Masnoon Sunnah Tracker: '}</strong>
            {language === 'bn'
              ? 'প্রতিদিনের গুরুত্বপূর্ণ সুন্নত আমলগুলো আদায় করে টিক দিন। এটি আপনার দৈনন্দিন আধ্যাত্মিক রুটিন রক্ষা করতে সাহায্য করবে।'
              : 'Complete essential Sunnah deeds and check them off to preserve your daily spiritual routine.'}
          </div>

          <div className="space-y-2">
            {MASNOON_HABITS.map((habit) => {
              const isChecked = !!dailyAmalChecklist[habit.id];

              return (
                <div
                  key={habit.id}
                  onClick={() => {
                    triggerHaptic(20);
                    onToggleAmalHabit(habit.id);
                  }}
                  className={`p-3.5 rounded-3xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isChecked
                      ? 'bg-[#F8E8ED] dark:bg-[#10235A] border-[#21409A] shadow-2xs'
                      : 'bg-white dark:bg-[#142042] border-[#E7D9DE] dark:border-[#1C2D5A] hover:border-[#21409A]/40'
                  }`}
                >
                  <div className="mt-0.5">
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-[#21409A] fill-current dark:text-[#E9B7C3] shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#E7D9DE] dark:text-slate-600 shrink-0" />
                    )}
                  </div>

                  <div className="space-y-0.5 flex-1">
                    <h4 className={`text-xs font-bold ${
                      isChecked ? 'text-[#10235A] dark:text-[#E9B7C3] line-through opacity-80' : 'text-[#10235A] dark:text-white'
                    }`}>
                      {language === 'bn' ? habit.titleBn : habit.titleEn}
                    </h4>
                    <p className="text-[11px] text-[#6B7280] dark:text-slate-400">
                      {language === 'bn' ? 'ফজিলত: ' : 'Virtue: '}{language === 'bn' ? habit.rewardBn : habit.rewardEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
