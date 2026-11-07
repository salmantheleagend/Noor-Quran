import React, { useState } from 'react';
import { AppLanguage, UserGender } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  Compass,
  Sparkles,
  BookOpen,
  BookmarkCheck,
  Shield,
  HelpCircle,
  Settings,
  ChevronRight,
  Heart,
  Clock,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';
import { DesignerProfileModal } from './DesignerProfileModal';
import founderDp from '../assets/images/founder_dp.jpg';
const FOUNDER_REMOTE_DP = 'https://i.postimg.cc/mgFqFQpn/Whats-App-Image-2026-10-13-at-11-00-23-PM.jpg';

interface MoreMenuProps {
  language: AppLanguage;
  gender?: UserGender | null;
  onSelectFeature: (featureId: string) => void;
  onOpenSettings: () => void;
  onOpenGenderSelection?: () => void;
}

export const MoreMenu: React.FC<MoreMenuProps> = ({
  language,
  gender,
  onSelectFeature,
  onOpenSettings,
}) => {
  const t = TRANSLATIONS[language];
  const [showDesignerModal, setShowDesignerModal] = useState(false);

  const menuItems = [
    {
      id: 'prayer',
      title: 'নামাজের সময়সূচি ও চেকলিস্ট (Prayer Times)',
      desc: 'আজকের ৫ ওয়াক্ত সালাত, নফল সময়, আজান ও মিস নামাজের হিসাব',
      icon: <Clock className="w-5 h-5 text-[#0F5F62] dark:text-[#B9E2DD]" />,
      bg: 'bg-[#F3FAF9] dark:bg-[#083B40]',
    },
    {
      id: 'ruqyah',
      title: 'রুকইয়াহ শারইয়াহ (Ruqyah Shariyyah)',
      desc: 'বদনজর, জাদু-সিহর, জিনের ভয় ও অসুস্থতা থেকে কুরআন-সুন্নাহর আত্মিক শিফা',
      icon: <Shield className="w-5 h-5 text-[#0F5F62] dark:text-[#B9E2DD]" />,
      bg: 'bg-[#F3FAF9] dark:bg-[#083B40]',
    },
    ...(gender === 'female'
      ? [
          {
            id: 'tracker',
            title: language === 'bn' ? 'পবিত্রতা ও তাহরাত (Period Tracker)' : 'Period & Taharat Tracker',
            desc: language === 'bn' ? 'অন-ডিভাইস পবিত্রতা ও পিরিয়ড ট্র্যাকার' : 'On-device period and taharat tracker',
            icon: <Heart className="w-5 h-5 text-[#0F5F62] dark:text-[#2DD4BF] fill-current" />,
            bg: 'bg-[#F3FAF9] dark:bg-[#18282D]',
          },
        ]
      : []),
    {
      id: 'qibla',
      title: t.qibla,
      desc: 'স্মুথ লাইভ কম্পাস ও কাবার দিকনির্ণয়',
      icon: <Compass className="w-5 h-5 text-[#0F5F62] dark:text-[#B9E2DD]" />,
      bg: 'bg-[#F3FAF9] dark:bg-[#083B40]',
    },
    {
      id: 'tasbeeh',
      title: t.tasbeeh,
      desc: 'ডিজিটাল তাসবীহ ও জিকির কাউন্টার',
      icon: <Sparkles className="w-5 h-5 text-[#0F5F62] dark:text-[#B9E2DD]" />,
      bg: 'bg-[#F3FAF9] dark:bg-[#083B40]',
    },
    {
      id: 'hadith',
      title: t.hadith,
      desc: 'সহিহ হাদিস সংকলন ও প্রতিদিনের হাদিস',
      icon: <BookOpen className="w-5 h-5 text-[#0F5F62] dark:text-[#B9E2DD]" />,
      bg: 'bg-[#F3FAF9] dark:bg-[#083B40]',
    },
    {
      id: 'salahGuide',
      title: t.salahGuide,
      desc: 'অজু, গোসল ও নামাজের পূর্ণাঙ্গ চিত্র গাইড',
      icon: <BookmarkCheck className="w-5 h-5 text-[#0F5F62] dark:text-[#B9E2DD]" />,
      bg: 'bg-[#F3FAF9] dark:bg-[#083B40]',
    },
    {
      id: 'masala',
      title: t.masala,
      desc: 'দৈনন্দিন ফিকহ ও ৫০+ প্রয়োজনীয় জরুরী প্রশ্নোত্তর',
      icon: <HelpCircle className="w-5 h-5 text-[#0F5F62] dark:text-[#B9E2DD]" />,
      bg: 'bg-[#F3FAF9] dark:bg-[#083B40]',
    },
  ];

  const handleItemClick = (id: string) => {
    triggerHaptic(15);
    onSelectFeature(id);
  };

  return (
    <div className="pb-32 pt-2 px-3 sm:px-4 max-w-2xl mx-auto space-y-4 text-[#123234] dark:text-[#F3FAF9]">
      {/* Minimal Header */}
      <div className="pt-1">
        <h2 className="text-lg font-bold tracking-tight text-[#123234] dark:text-[#F3FAF9]">
          মেন্যু
        </h2>
        <p className="text-xs text-[#5E7475] dark:text-[#B9E2DD]/80">
          প্রয়োজনীয় সকল ইসলামিক ফিচার ও সেবা
        </p>
      </div>

      {/* Menu Grid */}
      <div className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#0C454B] hover:bg-[#F3FAF9] dark:hover:bg-[#0F5F62]/40 border border-[#D7E9E7] dark:border-[#13545A] shadow-2xs transition-all active:scale-[0.99] text-left cursor-pointer min-h-[48px]"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${item.bg} border border-[#D7E9E7]/80 dark:border-[#13545A] flex items-center justify-center shrink-0`}>
                {item.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#123234] dark:text-[#F3FAF9]">
                  {item.title}
                </h4>
                <p className="text-xs text-[#5E7475] dark:text-[#B9E2DD]/70">
                  {item.desc}
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-[#5E7475] dark:text-[#B9E2DD]/70 shrink-0" />
          </button>
        ))}
      </div>

      {/* Settings Row */}
      <button
        onClick={() => {
          triggerHaptic(15);
          onOpenSettings();
        }}
        className="w-full min-h-[48px] flex items-center justify-between p-3.5 rounded-2xl bg-[#F3FAF9] hover:bg-[#B9E2DD]/30 dark:bg-[#0C454B] dark:hover:bg-[#0F5F62]/50 border border-[#D7E9E7] dark:border-[#13545A] text-[#0F5F62] dark:text-[#F3FAF9] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-[#0F5F62] dark:text-[#B9E2DD]" />
          <span className="text-sm font-bold">{t.settings}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-[#5E7475] dark:text-[#B9E2DD]/70" />
      </button>

      {/* Minimal Executive About Noor Quran Card */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0C152B] border border-slate-200 dark:border-[#1E2D55] shadow-2xs space-y-3 text-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-teal-900 dark:text-teal-300">
              {language === 'bn' ? 'নূর কুরআন' : 'Noor Quran'}
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#131D38] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1E2D55]">
            v2.5 · ১০০% বিজ্ঞাপনমুক্ত
          </span>
        </div>

        {/* Founder Bio Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-amber-400/30 shadow-2xs shrink-0 bg-[#0E1A33]">
              <img
                src={founderDp}
                onError={(e) => {
                  e.currentTarget.src = FOUNDER_REMOTE_DP;
                }}
                alt="Engr. Mohammad Muzahidul Islam"
                className="w-full h-full object-cover object-top"
                loading="eager"
              />
              <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-white dark:ring-[#0E1A33]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                Engr. Mohammad Muzahidul Islam
              </h4>
              <p className="text-[11px] text-teal-700 dark:text-teal-300 font-medium truncate">
                Electrical Engineer · Lead Developer
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(15);
              setShowDesignerModal(true);
            }}
            className="shrink-0 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#131D38] dark:hover:bg-[#1C2C52] text-teal-800 dark:text-teal-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 border border-slate-200 dark:border-[#1E2D55]"
          >
            <span>{language === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Designer Profile Modal */}
      <DesignerProfileModal
        isOpen={showDesignerModal}
        onClose={() => setShowDesignerModal(false)}
        language={language}
      />
    </div>
  );
};

export default MoreMenu;
