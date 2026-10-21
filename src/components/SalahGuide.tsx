import React, { useState } from 'react';
import { AppLanguage } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  SALAH_RAKAT_TABLE,
  SALAH_STEPS,
  WUDU_RULES,
  GHUSL_RULES,
} from '../data/namazGuideData';
import {
  BookOpen,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  User,
  Users,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';

interface SalahGuideProps {
  language: AppLanguage;
}

export const SalahGuide: React.FC<SalahGuideProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [activeSection, setActiveSection] = useState<'rakats' | 'steps' | 'wudu' | 'ghusl'>('rakats');
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [viewForWomen, setViewForWomen] = useState(false);

  const toggleStep = (stepNum: number) => {
    triggerHaptic(15);
    setExpandedStep(expandedStep === stepNum ? null : stepNum);
  };

  return (
    <div className="pb-32 pt-2 px-3 sm:px-4 max-w-2xl mx-auto space-y-4 text-[#1F2937] dark:text-[#F8E8ED]">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#10235A] dark:text-white">
          {t.salahGuide}
        </h2>
        <p className="text-xs text-[#6B7280] dark:text-slate-400">
          বিশুদ্ধ সুন্নাহ ও নির্ভরযোগ্য ফিকহ অনুযায়ী নামাজ, অজু ও গোসলের পূর্ণাঙ্গ গাইড
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-[#F8E8ED] dark:bg-[#142042] rounded-2xl text-xs font-medium border border-[#E7D9DE] dark:border-[#24386E]">
        <button
          onClick={() => setActiveSection('rakats')}
          className={`py-2 rounded-xl transition-all min-h-[38px] cursor-pointer ${
            activeSection === 'rakats'
              ? 'bg-[#21409A] text-white shadow-xs font-bold'
              : 'text-[#10235A] dark:text-slate-300 hover:text-[#21409A]'
          }`}
        >
          রাকাতের হিসাব
        </button>
        <button
          onClick={() => setActiveSection('steps')}
          className={`py-2 rounded-xl transition-all min-h-[38px] cursor-pointer ${
            activeSection === 'steps'
              ? 'bg-[#21409A] text-white shadow-xs font-bold'
              : 'text-[#10235A] dark:text-slate-300 hover:text-[#21409A]'
          }`}
        >
          ধাপে ধাপে নামাজ
        </button>
        <button
          onClick={() => setActiveSection('wudu')}
          className={`py-2 rounded-xl transition-all min-h-[38px] cursor-pointer ${
            activeSection === 'wudu'
              ? 'bg-[#21409A] text-white shadow-xs font-bold'
              : 'text-[#10235A] dark:text-slate-300 hover:text-[#21409A]'
          }`}
        >
          অজুর নিয়ম
        </button>
        <button
          onClick={() => setActiveSection('ghusl')}
          className={`py-2 rounded-xl transition-all min-h-[38px] cursor-pointer ${
            activeSection === 'ghusl'
              ? 'bg-[#21409A] text-white shadow-xs font-bold'
              : 'text-[#10235A] dark:text-slate-300 hover:text-[#21409A]'
          }`}
        >
          গোসলের নিয়ম
        </button>
      </div>

      {/* RAKAT BREAKDOWN SECTION */}
      {activeSection === 'rakats' && (
        <div className="space-y-3">
          <div className="p-3.5 bg-[#F8E8ED] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#24386E] rounded-2xl text-xs text-[#10235A] dark:text-[#F8E8ED]">
            <strong>পাঁচ ওয়াক্ত নামাজের রাকাতের তালিকা:</strong> প্রত্যেক ওয়াক্তে ফরজ নামাজ পড়া অত্যাবশ্যকীয়। এর পাশাপাশি সুন্নাতে মুয়াক্কাদা ও নফল নামাজের অসীম সওয়াব রয়েছে।
          </div>

          <div className="space-y-2.5">
            {SALAH_RAKAT_TABLE.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between border-b border-[#E7D9DE] dark:border-[#1C2D5A] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#21409A]" />
                    <h4 className="text-sm font-bold text-[#10235A] dark:text-white">
                      {item.waqtBn} ({item.waqtEn})
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-[#21409A] dark:text-[#E9B7C3] bg-[#F8E8ED] dark:bg-[#10235A] px-2.5 py-0.5 rounded-full border border-[#E7D9DE] dark:border-[#24386E]">
                    মোট {item.total} রাকাত
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                  {item.breakdown.map((b, bIdx) => {
                    const isFard = b.type === 'fard';
                    const isWitr = b.type === 'witr';

                    return (
                      <div
                        key={bIdx}
                        className={`p-2 rounded-xl border ${
                          isFard
                            ? 'bg-[#F8E8ED] dark:bg-[#10235A] border-[#21409A]/40 text-[#10235A] dark:text-[#F8E8ED]'
                            : isWitr
                            ? 'bg-[#FCFAF8] dark:bg-[#1c357f]/40 border-[#E9B7C3] text-[#10235A] dark:text-[#E9B7C3]'
                            : 'bg-[#FCFAF8] dark:bg-[#142042] border-[#E7D9DE] dark:border-[#24386E] text-[#6B7280] dark:text-slate-300'
                        }`}
                      >
                        <span className="font-semibold block">{b.label}</span>
                        <span className="text-sm font-bold font-mono mt-0.5 block">
                          {b.rakat} রাকাত
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP-BY-STEP SALAH GUIDE */}
      {activeSection === 'steps' && (
        <div className="space-y-3">
          {/* Gender Filter Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A]">
            <span className="text-xs font-bold text-[#10235A] dark:text-white">
              নামাজের পদ্ধতি প্রদর্শন মোড:
            </span>
            <div className="flex items-center gap-1 bg-[#F8E8ED] dark:bg-[#10235A] p-0.5 rounded-xl text-xs border border-[#E7D9DE] dark:border-[#24386E]">
              <button
                onClick={() => setViewForWomen(false)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors font-bold cursor-pointer ${
                  !viewForWomen
                    ? 'bg-[#21409A] text-white shadow-xs'
                    : 'text-[#10235A] dark:text-slate-400'
                }`}
              >
                <User className="w-3 h-3" />
                <span>পুরুষদের পদ্ধতি</span>
              </button>
              <button
                onClick={() => setViewForWomen(true)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors font-bold cursor-pointer ${
                  viewForWomen
                    ? 'bg-[#21409A] text-white shadow-xs'
                    : 'text-[#10235A] dark:text-slate-400'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>নারীদের বিশেষ নিয়ম</span>
              </button>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-2">
            {SALAH_STEPS.map((step) => {
              const isExpanded = expandedStep === step.stepNumber;

              return (
                <div
                  key={step.stepNumber}
                  className="rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs overflow-hidden"
                >
                  <button
                    onClick={() => toggleStep(step.stepNumber)}
                    className="w-full flex items-center justify-between p-3.5 text-left hover:bg-[#F8E8ED]/40 dark:hover:bg-[#1C2D5A] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-[#F8E8ED] dark:bg-[#10235A] text-[#21409A] dark:text-[#E9B7C3] font-bold text-xs flex items-center justify-center font-mono border border-[#E7D9DE] dark:border-[#24386E]">
                        {step.stepNumber}
                      </span>
                      <h4 className="text-sm font-bold text-[#10235A] dark:text-white">
                        {step.titleBn}
                      </h4>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#6B7280]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-1 border-t border-[#E7D9DE] dark:border-[#1C2D5A] text-xs space-y-3">
                      <p className="text-[#1F2937] dark:text-slate-300 leading-relaxed font-bengali">
                        {step.instructionBn}
                      </p>

                      {/* Arabic recitation box if present */}
                      {step.arabic && (
                        <div className="p-3 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#24386E] space-y-1.5">
                          <p className="font-arabic text-base leading-loose text-right text-[#10235A] dark:text-white block mb-1.5" dir="rtl">
                            {step.arabic}
                          </p>
                          {step.transliterationBn && (
                            <p className="text-[#6B7280] dark:text-slate-400 italic text-left block" dir="ltr">
                              উচ্চারণ: {step.transliterationBn}
                            </p>
                          )}
                          {step.meaningBn && (
                            <p className="text-[#1F2937] dark:text-slate-200 font-medium pt-1 border-t border-[#E7D9DE]/60 dark:border-[#1C2D5A] text-left block" dir="ltr">
                              অর্থ: {step.meaningBn}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Women difference note */}
                      {step.womenDifferenceBn && (
                        <div className={`p-3 rounded-xl border ${
                          viewForWomen
                            ? 'bg-[#F8E8ED] dark:bg-[#10235A] border-[#21409A] text-[#10235A] dark:text-[#F8E8ED]'
                            : 'bg-[#FCFAF8] dark:bg-[#142042] border-[#E7D9DE] dark:border-[#24386E] text-[#1F2937] dark:text-slate-300'
                        }`}>
                          <strong className="block mb-1 text-[#21409A] dark:text-[#E9B7C3]">
                            {viewForWomen ? '🌸 নারীদের জন্য পদ্ধতি:' : 'নারীদের জন্য বিশেষ নির্দেশনা:'}
                          </strong>
                          <span>{step.womenDifferenceBn}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WUDU RULES */}
      {activeSection === 'wudu' && (
        <div className="space-y-4">
          {/* 4 Fard */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 border-b border-[#E7D9DE] dark:border-[#1C2D5A] pb-2">
              <CheckCircle className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />
              <h4 className="text-sm font-bold text-[#10235A] dark:text-white">
                অজুর ফরজ ৪টি (যেকোনো একটি বাদ পড়লে অজু হবে না)
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs text-[#1F2937] dark:text-slate-300 pt-1">
              {WUDU_RULES.fardList.map((fard, i) => (
                <li key={i} className="p-2 rounded-xl bg-[#F8E8ED]/70 dark:bg-[#10235A]/50">
                  {fard}
                </li>
              ))}
            </ul>
          </div>

          {/* Wudu Breakers */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 border-b border-[#E7D9DE] dark:border-[#1C2D5A] pb-2">
              <AlertCircle className="w-4 h-4 text-[#991B1B]" />
              <h4 className="text-sm font-bold text-[#10235A] dark:text-white">
                অজু ভঙ্গের কারণসমূহ (৭টি প্রধান কারণ)
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs text-[#1F2937] dark:text-slate-300 pt-1">
              {WUDU_RULES.breakers.map((brk: string, i: number) => (
                <li key={i} className="p-2 rounded-xl bg-[#FCFAF8] dark:bg-[#10235A]/50">
                  {brk}
                </li>
              ))}
            </ul>
          </div>

          {/* Sunnahs */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 border-b border-[#E7D9DE] dark:border-[#1C2D5A] pb-2">
              <Sparkles className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />
              <h4 className="text-sm font-bold text-[#10235A] dark:text-white">
                অজুর প্রধান সুন্নতসমূহ
              </h4>
            </div>
            <ul className="space-y-1 text-xs text-[#6B7280] dark:text-slate-300 list-disc list-inside pt-1">
              {WUDU_RULES.sunnahList.map((sunnah, i) => (
                <li key={i}>{sunnah}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* GHUSL RULES */}
      {activeSection === 'ghusl' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 border-b border-[#E7D9DE] dark:border-[#1C2D5A] pb-2">
              <CheckCircle className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />
              <h4 className="text-sm font-bold text-[#10235A] dark:text-white">
                ফরজ গোসলের ফরজ ৩টি
              </h4>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-slate-300 leading-normal">
              ফরজ গোসলে এই তিনটি বিষয়ের কোনো একটি চুল পরিমাণ বাদ পড়লে শরীর পবিত্র হবে না:
            </p>
            <ul className="space-y-2 text-xs text-[#1F2937] dark:text-slate-200 pt-1">
              {GHUSL_RULES.fardList.map((fard, i) => (
                <li key={i} className="p-2.5 rounded-xl bg-[#F8E8ED] dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#24386E] text-[#10235A] dark:text-[#F8E8ED]">
                  {fard}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalahGuide;
