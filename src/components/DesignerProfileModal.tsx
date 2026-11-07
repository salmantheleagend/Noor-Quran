import React, { useState } from 'react';
import { AppLanguage } from '../types';
import {
  X,
  Heart,
  Sparkles,
  BookOpen,
  HandHeart,
  Briefcase,
  ShieldCheck,
  Compass,
  CheckCircle2,
} from 'lucide-react';
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
      return parseInt(localStorage.getItem('noor_quran_designer_dua_count') || '64', 10);
    } catch {
      return 64;
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

  const corePillars = [
    {
      icon: <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300" />,
      titleBn: 'বিশুদ্ধ উসমানি লিপি',
      titleEn: 'Authentic Uthmani',
      descBn: 'মদিনা শরীফের তাহকীককৃত কুরআন পাঠ',
      descEn: 'Verified Madinah Mushaf scripture',
    },
    {
      icon: <Compass className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300" />,
      titleBn: 'ভৌগোলিক সালাত ওয়াক্ত',
      titleEn: 'Precise Prayer Times',
      descBn: 'রিয়েল-টাইম স্থানাঙ্ক ও সঠিক সময়সূচি',
      descEn: 'Exact GPS coordinates and times',
    },
    {
      icon: <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300" />,
      titleBn: '১০০% বিজ্ঞাপনমুক্ত',
      titleEn: '100% Ad-Free Forever',
      descBn: 'কোনো বিজ্ঞাপন বা বিভ্রান্তি ছাড়া বিশুদ্ধ ইবাদত',
      descEn: 'Clean worship without distractions',
    },
    {
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300" />,
      titleBn: 'গোপনীয়তা ও অফলাইন',
      titleEn: 'Privacy-First & Offline',
      descBn: 'সম্পূর্ণ অন-ডিভাইস ডেটা সুরক্ষা',
      descEn: 'Safe on-device offline storage',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white dark:bg-[#0C152B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#1E2D55] overflow-hidden flex flex-col text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Executive Header */}
        <div className="relative bg-linear-to-b from-[#142C38] via-[#0E2028] to-[#071116] p-4 text-white border-b border-white/10 shrink-0">
          {/* Top-Right Close Button */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onClose();
            }}
            aria-label="Close"
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white/90 transition-all cursor-pointer z-10"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Profile Emblem + Titles Row */}
          <div className="flex items-center gap-3 pr-6">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-md bg-[#0E1A33] shrink-0">
              <img
                src={founderDp}
                onError={(e) => {
                  e.currentTarget.src = FOUNDER_REMOTE_DP;
                }}
                alt="Engr. Mohammad Muzahidul Islam"
                className="w-full h-full object-cover object-top"
                loading="eager"
              />
              <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0E1A33]" title="Verified Creator" />
            </div>

            <div className="min-w-0">
              <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-white/10 text-amber-300 text-[9.5px] font-bold tracking-wide border border-white/15 mb-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Noor Quran · v2.5</span>
              </div>
              <h3 className="text-sm font-bold tracking-tight text-white leading-tight truncate">
                Engr. Mohammad Muzahidul Islam
              </h3>
              <p className="text-[10.5px] text-teal-300 font-medium flex items-center gap-1 mt-0.5 truncate">
                <Briefcase className="w-2.5 h-2.5 text-amber-300 shrink-0" />
                <span>{language === 'bn' ? 'Electrical Engineer · Lead Developer' : 'Electrical Engineer · Lead Developer'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Minimal Content Body - 4 Crisp Badges Only, Zero Bloated Text */}
        <div className="p-3.5 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {corePillars.map((p, idx) => (
              <div
                key={idx}
                className="p-2 rounded-xl bg-slate-50 dark:bg-[#131D38] border border-slate-200/80 dark:border-[#1E2D55] shadow-2xs space-y-0.5"
              >
                <div className="flex items-center gap-1.5">
                  {p.icon}
                  <span className="font-bold text-slate-900 dark:text-slate-100 truncate text-[11px]">
                    {language === 'bn' ? p.titleBn : p.titleEn}
                  </span>
                </div>
                <p className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate leading-tight">
                  {language === 'bn' ? p.descBn : (p.descEn || p.titleEn)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Bottom Bar with Minimal Dua Button */}
        <div className="p-3 border-t border-slate-200 dark:border-[#1E2D55] bg-slate-50 dark:bg-[#0A1224] shrink-0">
          <button
            type="button"
            onClick={handleSendDua}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] cursor-pointer ${
              hasPrayed
                ? 'bg-emerald-600 text-white'
                : 'bg-[#0F5F62] hover:bg-[#134D50] text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${hasPrayed ? 'fill-current text-white animate-bounce' : 'text-amber-300'}`} />
            <span>
              {hasPrayed
                ? (language === 'bn' ? 'জাযাকাল্লাহু খাইরান! আপনার দোয়া কবুল হোক' : 'Jazakallahu Khair! Thank you for your prayer')
                : (language === 'bn' ? `উদ্যোক্তার জন্য দোয়া পাঠিয়েছি (${duaCount})` : `Pray for the Team (${duaCount})`)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignerProfileModal;
