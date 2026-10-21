import React, { useState } from 'react';
import { AppLanguage } from '../types';
import { X, Heart, Sparkles, BookOpen, HandHeart, Briefcase } from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';
import founderDp from '../assets/images/founder_dp.jpg';
const FOUNDER_REMOTE_DP = 'https://i.postimg.cc/mgFqFQpn/Whats-App-Image-2026-10-13-at-11-00-23-PM.jpg';

interface DesignerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
}

export const DesignerProfileModal: React.FC<DesignerProfileModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [duaCount, setDuaCount] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('noor_quran_designer_dua_count') || '48', 10);
    } catch {
      return 48;
    }
  });
  const [hasPrayed, setHasPrayed] = useState(false);

  if (!isOpen) return null;

  const handleSendDua = () => {
    triggerHaptic(30);
    if (!hasPrayed) {
      const next = duaCount + 1;
      setDuaCount(next);
      setHasPrayed(true);
      try {
        localStorage.setItem('noor_quran_designer_dua_count', next.toString());
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-[#0D1838] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-b from-slate-900 via-[#0B1530] to-[#0A163B] dark:from-[#070D1E] dark:to-[#0A163B] p-6 text-white text-center border-b border-white/10">
          {/* Top-Right Close Button */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onClose();
            }}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white/90 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Profile Emblem */}
          <div className="relative w-20 h-20 mx-auto mb-3">
            <div className="absolute inset-0 rounded-full bg-amber-300/20 blur-xs" />
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/30 shadow-md bg-[#10235A]">
              <img
                src={founderDp}
                onError={(e) => {
                  e.currentTarget.src = FOUNDER_REMOTE_DP;
                }}
                alt="Engr. Mohammad Muzahidul Islam"
                className="w-full h-full object-cover object-top"
                loading="eager"
              />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-100 text-[11px] font-semibold tracking-wide border border-white/20 mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'bn' ? 'নূর কুরআন সম্পর্কে ও দোয়ার নিবেদন' : 'About Noor Quran & Dedication'}</span>
          </div>

          {/* Name & Subtitle */}
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Engr. Mohammad Muzahidul Islam (Salman)
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 font-medium mt-1 flex items-center justify-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'bn' ? 'Electrical Engineer · নিবেদক, নূর কুরআন' : 'Electrical Engineer · Creator, Noor Quran'}</span>
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Mission Block */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0A163B]/90 border border-slate-200/70 dark:border-slate-800/80 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 text-[#21409A] dark:text-amber-200 font-bold text-sm">
              <BookOpen className="w-4 h-4 text-[#21409A] dark:text-amber-300" />
              <span>{language === 'bn' ? 'নূর কুরআন তৈরির উদ্দেশ্য' : 'Mission of Noor Quran'}</span>
            </div>
            <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-[13px] leading-relaxed">
              {language === 'bn'
                ? '“কুরআন, সালাত ও দৈনন্দিন ইবাদতের জন্য নির্ভরযোগ্য ডিজিটাল সহায়তা সহজে পৌঁছে দেওয়ার উদ্দেশ্যে নূর কুরআন তৈরি হয়েছে।”'
                : '"Noor Quran was created to deliver reliable digital assistance for Quran, Salah, and daily worship with ease and clarity."'}
            </p>
          </div>

          {/* Founder's Active Message */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-[#0e1d44]/70 border border-amber-200/70 dark:border-amber-900/40 text-slate-800 dark:text-slate-200 space-y-2 shadow-xs">
            <div className="font-bold flex items-center gap-2 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
              <HandHeart className="w-4 h-4 text-amber-600 dark:text-amber-300" />
              <span>{language === 'bn' ? 'আমাদের নিবেদন ও দোয়ার আবেদন:' : "Our Dedication & Message:"}</span>
            </div>
            <blockquote className="text-xs sm:text-[13px] leading-relaxed italic border-l-2 border-amber-500 pl-3 text-slate-800 dark:text-slate-200 font-medium">
              {language === 'bn'
                ? '“নূর কুরআনকে আরও উপকারী ও নির্ভরযোগ্য করতে আমরা কাজ করছি। অ্যাপের কোনো তথ্য বা ফিচারে ভুল চোখে পড়লে আমাদের জানান।”'
                : '"We are continuously working to make Noor Quran more beneficial and reliable. If you notice any error in information or features, please let us know."'}
            </blockquote>
          </div>

          {/* Key Islamic App Features */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/50">
            <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
              {language === 'bn' ? 'অ্যাপটির মূল দ্বীনি বৈশিষ্ট্যসমূহ:' : 'Key Principles of the App:'}
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                <span>{language === 'bn' ? 'মদিনা শরীফের বিশুদ্ধ উসমানি লিপি ও নির্ভরযোগ্য কুরআন পঠন।' : 'Authentic Madinah Uthmani script and verified Quran recitation.'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                <span>{language === 'bn' ? 'নির্ভরযোগ্য অ্যালগরিদম ও ভৌগোলিক স্থানাঙ্ক ভিত্তিক সালাতের ওয়াক্ত।' : 'Precise geographic coordinates and authenticated calculation methods.'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                <span>{language === 'bn' ? 'সম্পূর্ণ বিজ্ঞাপনমুক্ত, গোপনীয়তা-সুরক্ষিত ও ব্যবহারকারী-বান্ধব।' : 'Completely ad-free, tracker-free, and privacy-respecting.'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-200/70 dark:border-slate-800 bg-slate-50/90 dark:bg-[#0A163B]/90 backdrop-blur-xs">
          <button
            onClick={handleSendDua}
            className={`w-full py-3 px-5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.99] cursor-pointer ${
              hasPrayed
                ? 'bg-emerald-600 text-white'
                : 'bg-[#21409A] hover:bg-[#10235A] text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasPrayed ? 'fill-current' : ''}`} />
            <span>
              {hasPrayed
                ? (language === 'bn' ? 'জাযাকাল্লাহু খাইরান! আপনার দোয়া গৃহীত হোক' : 'Jazakallahu Khair! Thank you for your prayer')
                : (language === 'bn' ? 'উদ্যোক্তার জন্য দোয়া পাঠিয়েছি' : 'Pray for the Founder & Team')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignerProfileModal;
