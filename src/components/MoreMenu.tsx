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

      {/* Professional Founder & About Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-sm space-y-3.5 text-[#1F2937] dark:text-[#F8E8ED]">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-[#E7D9DE] dark:border-[#1C2D5A] pb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#21409A] dark:text-[#E9B7C3]">
            {language === 'bn' ? 'নূর কুরআন সম্পর্কে' : 'About Noor Quran'}
          </span>
          <span className="text-[10px] text-[#6B7280] dark:text-slate-400 font-medium">
            Noor Quran · v2.5
          </span>
        </div>

        {/* Founder Bio */}
        <div className="flex items-center gap-3">
          <div className="w-13 h-13 rounded-2xl overflow-hidden border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-xs shrink-0 bg-[#F8E8ED] dark:bg-[#10235A]">
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
          <div className="space-y-0.5 min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-[#10235A] dark:text-white truncate">
              Engr. Mohammad Muzahidul Islam (Salman)
            </h4>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#21409A] dark:text-[#E9B7C3] font-semibold">
              <span>{language === 'bn' ? 'উদ্যোগ ও প্রযুক্তি · Noor Quran' : 'Lead Creator & Engineer · Noor Quran'}</span>
              <span>·</span>
              <span className="text-[#6B7280] dark:text-slate-400 font-normal">
                {language === 'bn' ? 'Electrical Engineer' : 'Electrical Engineer'}
              </span>
            </div>
          </div>
        </div>

        {/* Short Intro */}
        <p className="text-xs text-[#4B5563] dark:text-slate-300 leading-relaxed bg-[#F8E8ED]/50 dark:bg-[#10235A]/40 p-3 rounded-2xl border border-[#E7D9DE] dark:border-[#24386E]">
          {language === 'bn'
            ? '“কুরআন, সালাত ও দৈনন্দিন ইবাদতের জন্য নির্ভরযোগ্য ডিজিটাল সহায়তা সহজে পৌঁছে দেওয়ার উদ্দেশ্যে নূর কুরআন তৈরি হয়েছে।”'
            : '"Noor Quran was created to provide reliable digital assistance for Quran, Salah, and daily worship with ease and clarity."'}
        </p>

        {/* Founder's Message Button */}
        <div className="space-y-2 pt-1 border-t border-[#E7D9DE] dark:border-[#1C2D5A]">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(15);
              setShowDesignerModal(true);
            }}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-[#21409A] hover:bg-[#10235A] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-between cursor-pointer active:scale-[0.99]"
          >
            <span>{language === 'bn' ? 'আমাদের নিবেদন ও দোয়ার আহ্বান' : "Our Dedication & Message"}</span>
            <ChevronRight className="w-4 h-4 text-white/80" />
          </button>
          <p className="text-[11px] text-[#6B7280] dark:text-slate-400 leading-normal px-1">
            {language === 'bn'
              ? '“নূর কুরআনকে আরও উপকারী ও নির্ভরযোগ্য করতে আমরা কাজ করছি। অ্যাপের কোনো তথ্য বা ফিচারে ভুল চোখে পড়লে আমাদের জানান।”'
              : '"We are constantly working to make Noor Quran more beneficial and reliable. If you notice any error in information or features, please let us know."'}
          </p>
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
