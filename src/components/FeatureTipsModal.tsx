import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Clock,
  Moon,
  Sparkles,
  Compass,
  ChevronRight,
  ChevronLeft,
  Check,
  ArrowRight,
  X,
  Volume2,
  BellRing,
  Bookmark,
  WifiOff,
} from 'lucide-react';
import { AppLanguage } from '../types';
import { triggerHaptic } from '../utils/audioPlayer';
import { toBengaliNumber } from '../utils/quranPageManager';

interface FeatureTipsModalProps {
  language?: AppLanguage;
  onComplete: () => void;
}

export const FeatureTipsModal: React.FC<FeatureTipsModalProps> = ({
  language = 'bn',
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tips = [
    {
      id: 'quran',
      icon: <BookOpen className="w-8 h-8 text-[#0F5F62] dark:text-[#2DD4BF]" />,
      badgeBn: 'পূর্ণ কুরআন ও অডিও',
      badgeEn: 'Full Quran & Audio',
      titleBn: 'আল-কুরআনুল কারীম ও মুসহাফ পৃষ্ঠা মোড',
      titleEn: 'Holy Quran & Mushaf Page Mode',
      descBn:
        'মুদ্রিত কিতাবের মতো ১১৪টি সূরার হাফেজী, নূরানী ও তাজভীদ কালার কোডেড পেজ মোড। ইন্দো-পাক ও মদিনা নাসখ স্পষ্ট হরকত ফন্ট, বিশুদ্ধ অডিও তিলাওয়াত এবং পড়ার সাথে সাথে তাৎক্ষণিক সর্বশেষ পঠিত আয়াত স্বয়ংক্রিয় সংরক্ষণ।',
      descEn:
        'Read Quran in real 604-page Mushaf print (Hafezi, Nurani & Tajweed colors) or Study mode with Bengali meaning, audio recitation and instant real-time Last Read tracking.',
      featuresBn: [
        'হাফেজী, নূরানী ও তাজভীদ কালার কোডেড মুসহাফ পৃষ্ঠা',
        'ইন্দো-পাক ও মদিনা নাসখ স্পষ্ট হরকত ফন্ট',
        'বাংলা অনুবাদ ও তাৎক্ষণিক সর্বশেষ পঠিত লাইভ ট্র্যাকিং',
      ],
      featuresEn: [
        'Color-coded Tajweed, Hafezi & Nurani Mushaf pages',
        'Indo-Pak & Madinah Naskh clear Harakat fonts',
        'Bengali translation & instant real-time Last Read sync',
      ],
      accentColor: 'from-[#0F5F62] to-[#147A7E]',
    },
    {
      id: 'prayer',
      icon: <Clock className="w-8 h-8 text-[#21409A] dark:text-[#818CF8]" />,
      badgeBn: 'ওয়াক্ত ও আযান অ্যালার্ট',
      badgeEn: 'Prayer & Adhan Alerts',
      titleBn: 'সঠিক নামাজের সময় ও আযান নোটিফিকেশন',
      titleEn: 'Accurate Prayer Times & Adhan Notifications',
      descBn:
        'বাংলাদেশের ৬৪ জেলা ও জিপিএস লোকেশনে নির্ভুল নামাজের ওয়াক্ত। ওয়াক্ত শুরু হওয়ার সাথে সাথে ফোনে আযান সতর্কতা, নিষিদ্ধ সময় নির্দেশিকা এবং ৫ ওয়াক্তের কাযা নামাজের হিসাব রাখা ও ওয়াক্তভিত্তিক কাযা পরিশোধ ট্র্যাকার।',
      descEn:
        'Accurate prayer times for all 64 districts of Bangladesh and worldwide. Get timely adhan alerts on your phone, prohibited times and a waqt-by-waqt Qaza repayment tracker.',
      featuresBn: [
        '৬৪ জেলা ও জিপিএস নির্ভুল ওয়াক্ত ও নিষিদ্ধ সময়ের হিসাব',
        'ফোনে সময়োপযোগী আযান সতর্কতা ও ওয়াক্ত রিমাইন্ডার',
        'ওয়াক্তভিত্তিক কাযা নামাজ হিসাব ও পরিশোধ ট্র্যাকার',
      ],
      featuresEn: [
        'Accurate prayer times and prohibited times indicators',
        'Timely adhan and prayer alerts on your device',
        'Waqt-by-waqt Qaza prayer repayment tracker',
      ],
      accentColor: 'from-[#21409A] to-[#1E3A8A]',
    },
    {
      id: 'ramadan',
      icon: <Moon className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
      badgeBn: 'রোজা ও নফল নামাজ',
      badgeEn: 'Fasting & Nafl Prayers',
      titleBn: 'রমাদান রোজা ও নফল সালাত গাইড',
      titleEn: 'Ramadan Fasting & Nafl Prayers Guide',
      descBn:
        'লাইভ সাহরি ও ইফতার কাউন্টডাউন টাইমার। তাহাজ্জুদ, ইশরাক, চাশত, আওয়াবীন ও সালাতুত তাসবীহ নামাজের সময় ও সঠিক নিয়ম। এছাড়াও প্রতি মাসের আইয়ামে বীজের নফল রোজা ও আমলের নিয়মিত রিমাইন্ডার।',
      descEn:
        'Live Sahri and Iftar countdown timer. Complete guides for Tahajjud, Ishraq, Duha, Awwabin, Salatut Tasbeeh, and regular Ayyam al-Bid fasting reminders.',
      featuresBn: [
        'লাইভ সাহরি ও ইফতার নির্ভুল কাউন্টডাউন টাইমার',
        'তাহাজ্জুদ, ইশরাক, চাশত ও সালাতুত তাসবীহ সময় ও নিয়ম',
        'আইয়ামে বীজের নফল রোজা ও বিশেষ বরকতময় আমল',
      ],
      featuresEn: [
        'Live Sahri and Iftar accurate countdown timer',
        'Tahajjud, Ishraq, Duha & Nafl prayer timings and guides',
        'Ayyam al-Bid voluntary fasting and Sunnah habits',
      ],
      accentColor: 'from-amber-600 to-amber-700',
    },
    {
      id: 'hadith_dua',
      icon: <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
      badgeBn: 'মাসনূন দু\'আ ও হাদিস',
      badgeEn: 'Duas & Sahih Hadiths',
      titleBn: 'হিসনুল মুসলিম দু\'আ ও সহীহ হাদিস ভাণ্ডার',
      titleEn: 'Hisnul Muslim Duas & Sahih Hadiths',
      descBn:
        'প্রাত্যহিক জীবনের প্রয়োজনীয় সকাল-সন্ধ্যার আমল, খাদ্য, নিদ্রা ও রোগমুক্তির মাসনূন দু\'আ। বুখারী ও মুসলিমসহ বিশুদ্ধ হাদিসের সংকলন, আরবি পাঠ, অর্থ, নির্ভরযোগ্য সূত্র ও পছন্দের দু\'আ বুকমার্ক করার সুবিধা।',
      descEn:
        'Daily morning and evening remembrance, Masnoon duas from Hisnul Muslim, authentic Hadiths from Bukhari & Muslim with Arabic, Bengali meaning, references, and bookmarks.',
      featuresBn: [
        'সকাল-সন্ধ্যা ও প্রাত্যহিক জীবনের সহীহ মাসনূন দু\'আ',
        'বিষয়ভিত্তিক সহীহ হাদিস ও নির্ভরযোগ্য রেফারেন্স',
        'পছন্দের দু\'আ ও হাদিস সহজে বুকমার্কে সংরক্ষণ',
      ],
      featuresEn: [
        'Morning & evening authentic Masnoon duas',
        'Thematic Sahih Hadiths with trusted references',
        'Quick bookmarking for favorite duas and hadiths',
      ],
      accentColor: 'from-emerald-600 to-emerald-700',
    },
    {
      id: 'tools_offline',
      icon: <Compass className="w-8 h-8 text-[#0F5F62] dark:text-[#2DD4BF]" />,
      badgeBn: 'স্মার্ট টুলস ও ১০০% অফলাইন',
      badgeEn: 'Smart Tools & 100% Offline',
      titleBn: 'ডিজিটাল তাসবীহ, কিবলা ও পূর্ণ অফলাইন',
      titleEn: 'Digital Tasbeeh, Qibla & 100% Offline',
      descBn:
        'ট্যাকটাইল ভাইব্রেশন ও সাউন্ডসহ ডিজিটাল তাসবীহ কাউন্টার ও কাস্টম যিকির। বিশ্বের যেকোনো প্রান্ত থেকে নির্ভুল কিবলা কম্পাস। এছাড়া ইন্টারনেট ছাড়াই অফলাইনে কুরআন, নামাজ, হাদিস ও দু\'আ পড়ার পূর্ণ সুবিধা।',
      descEn:
        'Tactile digital tasbeeh with sound, vibration and custom dhikrs. Real-time accurate Qibla compass. Plus 100% offline access to Quran, prayers, hadiths and duas without internet.',
      featuresBn: [
        'সাউন্ড ও ভাইব্রেশনসহ ডিজিটাল তাসবীহ ও কাস্টম যিকির',
        'নির্ভুল রিয়েল-টাইম কিবলা দিক-নির্দেশক কম্পাস',
        'ইন্টারনেট ছাড়াই সম্পূর্ণ অ্যাপ ব্যবহার করার পূর্ণ সুবিধা',
      ],
      featuresEn: [
        'Digital tasbeeh counter with sound & vibration feedback',
        'Accurate live sensor-based Qibla compass',
        '100% offline access to all Quran & prayer features',
      ],
      accentColor: 'from-[#0F5F62] to-[#1E3A8A]',
    },
  ];

  const handleNext = () => {
    triggerHaptic(15);
    if (currentStep < tips.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    triggerHaptic(15);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    triggerHaptic(20);
    onComplete();
  };

  const activeTip = tips[currentStep];

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0E1416] rounded-3xl max-w-md w-full border border-[#D7E9E7] dark:border-[#22353B] shadow-2xl overflow-hidden flex flex-col text-[#123234] dark:text-[#EAF2F1]">
        {/* Top Header Bar with Logo, Step Badge & Skip Button */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-[#E7D9DE]/80 dark:border-[#22353B] flex items-center justify-between gap-2 bg-[#F3FAF9]/80 dark:bg-[#142023]/80">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#083B40] dark:bg-[#18282D] text-white flex items-center justify-center font-arabic font-bold text-base shadow-xs ring-1 ring-[#2DD4BF]/30 shrink-0">
              ن
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs sm:text-sm text-[#083B40] dark:text-white block leading-tight truncate">
                Noor Quran
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                {language === 'bn'
                  ? `ফিচার টিপস (${toBengaliNumber(currentStep + 1)} / ${toBengaliNumber(tips.length)})`
                  : `Feature Tips (${currentStep + 1} / ${tips.length})`}
              </span>
            </div>
          </div>

          {/* Prominent Skip Button */}
          <button
            type="button"
            onClick={handleSkip}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-[#1C2B2F] border border-[#D7E9E7] dark:border-[#22353B] text-xs font-bold text-[#0F5F62] dark:text-[#2DD4BF] hover:bg-[#F3FAF9] dark:hover:bg-[#25393E] transition-all flex items-center gap-1 cursor-pointer shadow-2xs shrink-0 active:scale-95"
            title={language === 'bn' ? 'স্কিপ করে সামনে যান' : 'Skip walkthrough'}
          >
            <span>{language === 'bn' ? 'স্কিপ করুন' : 'Skip'}</span>
            <span className="text-[10px] text-slate-400">✕</span>
          </button>
        </div>

        {/* Carousel Content Card */}
        <div className="p-5 sm:p-6 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTip.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Icon & Badge */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#F3FAF9] dark:bg-[#18282D] border border-[#D7E9E7] dark:border-[#22353B] flex items-center justify-center shadow-xs shrink-0">
                  {activeTip.icon}
                </div>
                <div className="min-w-0">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EAF5F4] dark:bg-[#18282D] text-[#0F5F62] dark:text-[#2DD4BF] text-[10.5px] font-bold border border-[#D7E9E7] dark:border-[#22353B] inline-block mb-1">
                    {language === 'bn' ? activeTip.badgeBn : activeTip.badgeEn}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#083B40] dark:text-white leading-snug">
                    {language === 'bn' ? activeTip.titleBn : activeTip.titleEn}
                  </h3>
                </div>
              </div>

              {/* Main Tip Description */}
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {language === 'bn' ? activeTip.descBn : activeTip.descEn}
              </p>

              {/* Bullet Features Checklist */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAF9] dark:bg-[#142023] border border-[#E2EBE9] dark:border-[#22353B] space-y-2 text-xs">
                {(language === 'bn' ? activeTip.featuresBn : activeTip.featuresEn).map(
                  (feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#0F5F62]/10 dark:bg-[#2DD4BF]/20 text-[#0F5F62] dark:text-[#2DD4BF] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="text-[#1F2937] dark:text-slate-200 font-medium leading-snug">
                        {feat}
                      </span>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Step Indicator Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {tips.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setCurrentStep(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentStep
                    ? 'w-7 bg-[#083B40] dark:bg-[#2DD4BF]'
                    : 'w-2 bg-[#D7E9E7] dark:bg-slate-700 hover:bg-[#A2C0BE]'
                }`}
                aria-label={`Go to tip ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="px-5 py-4 border-t border-[#E7D9DE]/80 dark:border-[#22353B] bg-[#F3FAF9]/80 dark:bg-[#142023]/80 flex items-center justify-between gap-3">
          {/* Back button (disabled on first step) */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed border-transparent text-slate-400'
                : 'border-[#D7E9E7] dark:border-[#22353B] text-[#083B40] dark:text-slate-200 hover:bg-white dark:hover:bg-[#1C2B2F] cursor-pointer shadow-2xs'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'পূর্ববর্তী' : 'Back'}</span>
          </button>

          {/* Next / Get Started button */}
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 max-w-[200px] py-2.5 px-4 rounded-xl bg-[#083B40] hover:bg-[#0c4e54] dark:bg-[#2DD4BF] dark:hover:bg-[#26b8a5] text-white dark:text-[#0E1416] font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            {currentStep < tips.length - 1 ? (
              <>
                <span>{language === 'bn' ? 'পরবর্তী' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>{language === 'bn' ? 'শুরু করুন' : 'Get Started'}</span>
                <Check className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
