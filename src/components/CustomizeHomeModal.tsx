import React from 'react';
import { AppLanguage, UserPreferences } from '../types';
import {
  X,
  Check,
  Eye,
  EyeOff,
  RotateCcw,
  BookOpen,
  Shield,
  LayoutGrid,
  Activity,
  Sparkles,
  Clock,
  Heart,
  Sliders,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';

export interface HomeWidgetConfig {
  id:
    | 'continueQuran'
    | 'dailyRuqyah'
    | 'quickAccess'
    | 'salahStreak'
    | 'dailyAyah'
    | 'dailyHadith'
    | 'naflPrayers'
    | 'jumuahSpecial'
    | 'missedSalah';
  nameBn: string;
  nameEn: string;
  descBn: string;
  descEn: string;
  icon: React.ReactNode;
  defaultEnabled: boolean;
}

export const AVAILABLE_HOME_WIDGETS: HomeWidgetConfig[] = [
  {
    id: 'continueQuran',
    nameBn: 'কুরআন পড়া চালিয়ে যান',
    nameEn: 'Continue Quran Reading',
    descBn: 'সর্বশেষ পড়া সূরা, আয়াত ও অগ্রগতির কার্ড',
    descEn: 'Last read Surah, Ayah & reading progress card',
    icon: <BookOpen className="w-4 h-4 text-[#0F5F62] dark:text-[#B9E2DD]" />,
    defaultEnabled: true,
  },
  {
    id: 'dailyRuqyah',
    nameBn: 'দৈনিক আত্মিক সুরক্ষা রুকইয়াহ',
    nameEn: 'Daily Protective Ruqyah',
    descBn: 'সকাল-সন্ধ্যার প্রমাণিত হিফাজতের আয়াত ও অডিও প্লেয়ার',
    descEn: 'Essential morning/evening protection routine & audio',
    icon: <Shield className="w-4 h-4 text-[#0F5F62] dark:text-[#B9E2DD]" />,
    defaultEnabled: true,
  },
  {
    id: 'quickAccess',
    nameBn: 'দ্রুত প্রবেশ মেনু (Quick Access Grid)',
    nameEn: 'Quick Access Grid',
    descBn: 'কুরআন, নামাজ, তাসবীহ, দোয়া ও কিবলায় এক ট্যাপে প্রবেশ',
    descEn: 'Direct shortcuts to Quran, Prayer, Tasbeeh & Dua',
    icon: <LayoutGrid className="w-4 h-4 text-[#0F5F62] dark:text-[#B9E2DD]" />,
    defaultEnabled: true,
  },
  {
    id: 'salahStreak',
    nameBn: 'সালাত ট্র্যাকার ও ৭ দিনের চার্ট',
    nameEn: 'Salah Streak & 7-Day Chart',
    descBn: 'দৈনিক ৫ ওয়াক্ত সালাত ধারাবাহিকতা ও সাপ্তাহিক গ্রাফ',
    descEn: 'Daily prayer streak counter and 7-day completion chart',
    icon: <Activity className="w-4 h-4 text-[#0F5F62] dark:text-[#B9E2DD]" />,
    defaultEnabled: false,
  },
  {
    id: 'dailyAyah',
    nameBn: 'আজকের আয়াত (Daily Ayah)',
    nameEn: 'Daily Ayah of the Day',
    descBn: 'আরবি হরফ, উচ্চারণ, অনুবাদ ও সুললিত তিলাওয়াত',
    descEn: 'Arabic verse with translation & recitation',
    icon: <Sparkles className="w-4 h-4 text-[#0F5F62] dark:text-[#B9E2DD]" />,
    defaultEnabled: false,
  },
  {
    id: 'dailyHadith',
    nameBn: 'দৈনিক সহিহ হাদিস (Daily Hadith)',
    nameEn: 'Daily Sahih Hadith',
    descBn: 'সহিহ বুখারি থেকে প্রতিদিনের খাঁটি হাদিস ও অর্থ পাঠ',
    descEn: 'Authentic Sahih Bukhari hadith daily with audio',
    icon: <BookOpen className="w-4 h-4 text-[#0F5F62] dark:text-[#B9E2DD]" />,
    defaultEnabled: false,
  },
  {
    id: 'naflPrayers',
    nameBn: 'নফল নামাজের সময়সূচি ও ফজিলত',
    nameEn: 'Nafl Prayer Timings',
    descBn: 'ইশরাক, চাশত, আওয়াবীন ও তাহাজ্জুদের সঠিক সময়',
    descEn: 'Timings & virtues for Ishraq, Duha & Tahajjud',
    icon: <Clock className="w-4 h-4 text-[#0F5F62] dark:text-[#B9E2DD]" />,
    defaultEnabled: false,
  },
  {
    id: 'jumuahSpecial',
    nameBn: 'পবিত্র জুমু\'আর বিশেষ আমল',
    nameEn: 'Jummah Sunnah Acts',
    descBn: 'বৃহস্পতিবার মাগরিব পরবর্তী ও জুমু\'আ দিনের বরকতময় আমল',
    descEn: 'Special Sunnah deeds on Thursday night & Friday',
    icon: <Heart className="w-4 h-4 text-[#0F5F62] dark:text-[#B9E2DD]" />,
    defaultEnabled: false,
  },
  {
    id: 'missedSalah',
    nameBn: 'কাজ়া সালাত ও মিস ওয়াক্ত হিসাব',
    nameEn: 'Missed Prayers Tracker',
    descBn: 'ছুটে যাওয়া নামাজের রেকর্ড ও সহজ হিসাব',
    descEn: 'Private tracker for missed & made-up prayers',
    icon: <Check className="w-4 h-4 text-[#0F5F62] dark:text-[#B9E2DD]" />,
    defaultEnabled: false,
  },
];

export interface CustomizeHomeModalProps {
  isOpen?: boolean;
  language: AppLanguage;
  preferences?: UserPreferences;
  onUpdatePreferences?: (partial: Partial<UserPreferences>) => void;
  onClose: () => void;
}

export const CustomizeHomeModal: React.FC<CustomizeHomeModalProps> = ({
  isOpen = true,
  language,
  preferences,
  onUpdatePreferences,
  onClose,
}) => {
  if (!isOpen) return null;
  const isBn = language === 'bn';

  // Get current active status for each widget ID
  const isWidgetEnabled = (widgetId: HomeWidgetConfig['id']): boolean => {
    if (!preferences?.homeWidgets || preferences.homeWidgets.length === 0) {
      const cfg = AVAILABLE_HOME_WIDGETS.find((w) => w.id === widgetId);
      return cfg ? cfg.defaultEnabled : false;
    }
    const found = preferences.homeWidgets.find((w) => w.id === widgetId);
    if (!found) {
      const cfg = AVAILABLE_HOME_WIDGETS.find((w) => w.id === widgetId);
      return cfg ? cfg.defaultEnabled : false;
    }
    return found.enabled;
  };

  const toggleWidget = (widgetId: HomeWidgetConfig['id']) => {
    triggerHaptic(15);
    const current = preferences?.homeWidgets || AVAILABLE_HOME_WIDGETS.map((w) => ({
      id: w.id,
      enabled: w.defaultEnabled,
    }));

    const existingIndex = current.findIndex((w) => w.id === widgetId);
    let nextWidgets;
    if (existingIndex >= 0) {
      nextWidgets = current.map((w, i) =>
        i === existingIndex ? { ...w, enabled: !w.enabled } : w
      );
    } else {
      nextWidgets = [...current, { id: widgetId, enabled: true }];
    }

    if (onUpdatePreferences) {
      onUpdatePreferences({ homeWidgets: nextWidgets });
    }
  };

  const handleResetToCalmDefault = () => {
    triggerHaptic(20);
    const calmDefaults = AVAILABLE_HOME_WIDGETS.map((w) => ({
      id: w.id,
      enabled: w.defaultEnabled,
    }));
    if (onUpdatePreferences) {
      onUpdatePreferences({ homeWidgets: calmDefaults });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-[#0B2527] w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-[#D7E9E7] dark:border-[#153E41] shadow-2xl flex flex-col max-h-[88dvh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D7E9E7] dark:border-[#153E41] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0F5F62]/10 dark:bg-[#0F5F62]/30 text-[#0F5F62] dark:text-[#B9E2DD] flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#123234] dark:text-[#E6F3F2]">
                {isBn ? 'হোম স্ক্রিন কাস্টমাইজ করুন' : 'Customize Home Screen'}
              </h3>
              <p className="text-xs text-[#5E7475] dark:text-[#92A9A8]">
                {isBn
                  ? 'আপনার পছন্দমতো উইজেট দেখান বা লুকান (শান্ত ও গোছানো লুক)'
                  : 'Show or hide home widgets to keep it calm and focused'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#5E7475] dark:text-[#92A9A8] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1 divide-y divide-[#D7E9E7]/40 dark:divide-[#153E41]/40">
          <div className="pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F5F62] dark:text-[#B9E2DD]">
              {isBn ? 'ডিফল্ট প্রধান উইজেটসমূহ (প্রস্তাবিত)' : 'Primary Core Widgets (Recommended)'}
            </span>
            <p className="text-xs text-[#5E7475] dark:text-[#92A9A8] mt-0.5">
              {isBn
                ? 'নামাজের সময় ও কাউন্টডাউন সর্বদা শীর্ষে দৃশ্যমান থাকে।'
                : 'Current prayer & countdown are always pinned at the top.'}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {AVAILABLE_HOME_WIDGETS.map((widget) => {
              const enabled = isWidgetEnabled(widget.id);
              return (
                <div
                  key={widget.id}
                  onClick={() => toggleWidget(widget.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    enabled
                      ? 'bg-[#F3FAF9] dark:bg-[#0C454B]/50 border-[#0F5F62]/40 shadow-xs'
                      : 'bg-white dark:bg-[#083B40]/30 border-[#D7E9E7] dark:border-[#13545A] opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#0B2527] border border-[#D7E9E7] dark:border-[#153E41] flex items-center justify-center shrink-0 shadow-2xs">
                      {widget.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#123234] dark:text-[#E6F3F2] truncate">
                        {isBn ? widget.nameBn : widget.nameEn}
                      </h4>
                      <p className="text-[11px] text-[#5E7475] dark:text-[#92A9A8] truncate mt-0.5">
                        {isBn ? widget.descBn : widget.descEn}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWidget(widget.id);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center shrink-0 p-0.5 ${
                      enabled ? 'bg-[#0F5F62]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with Reset and Done */}
        <div className="p-3.5 sm:p-5 border-t border-[#D7E9E7] dark:border-[#153E41] flex items-center justify-between gap-3 bg-[#F3FAF9] dark:bg-[#083B40] pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
          <button
            onClick={handleResetToCalmDefault}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5E7475] dark:text-[#92A9A8] hover:text-[#0F5F62] hover:bg-white/60 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isBn ? 'ডিফল্ট শান্ত রূপ' : 'Reset to Calm Default'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#0F5F62] hover:bg-[#083B40] text-white text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{isBn ? 'সম্পন্ন' : 'Save & Close'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
