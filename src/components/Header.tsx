import React from 'react';
import { AppLanguage, AppTheme, LocationInfo } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { MapPin, Moon, Sun, Settings, Globe } from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';

interface HeaderProps {
  language: AppLanguage;
  theme: AppTheme;
  location: LocationInfo;
  onOpenLocationModal: () => void;
  onToggleTheme: () => void;
  onChangeLanguage: (lang: AppLanguage) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  theme,
  location,
  onOpenLocationModal,
  onToggleTheme,
  onChangeLanguage,
  onOpenSettings,
}) => {
  const t = TRANSLATIONS[language];

  const cycleLanguage = () => {
    triggerHaptic(15);
    if (language === 'bn') onChangeLanguage('ar');
    else if (language === 'ar') onChangeLanguage('en');
    else onChangeLanguage('bn');
  };

  const getLangBadge = () => {
    if (language === 'bn') return 'বাং';
    if (language === 'ar') return 'عربي';
    return 'EN';
  };

  const locationDisplay =
    language === 'bn' ? location.nameBn : language === 'ar' ? location.nameAr : location.name;

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/95 dark:bg-[#0E1416]/95 border-b border-[#E7D9DE] dark:border-[#22353B] px-3 sm:px-4 py-2 transition-colors">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-[#083B40] dark:bg-[#18282D] flex items-center justify-center text-white font-arabic font-bold text-lg shadow-xs ring-1 ring-[#2DD4BF]/30">
            ن
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-[#1F2937] dark:text-[#EAF2F1] leading-tight truncate">
              Noor Quran
            </h1>
            {t.appSubtitle ? (
              <p className="text-[10.5px] text-[#6B7280] dark:text-[#9AB2B0] font-medium truncate mt-0.5">
                {t.appSubtitle}
              </p>
            ) : null}
          </div>
        </div>

        {/* Location Trigger */}
        <button
          onClick={() => {
            triggerHaptic(15);
            onOpenLocationModal();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8E8ED] hover:bg-[#E9B7C3]/30 dark:bg-[#18282D] dark:hover:bg-[#1F333A] text-xs font-semibold text-[#10235A] dark:text-[#EAF2F1] transition-colors border border-[#E7D9DE] dark:border-[#22353B] max-w-[130px] sm:max-w-[160px] truncate cursor-pointer min-h-[38px]"
          title={t.changeLocation}
        >
          <MapPin className="w-3.5 h-3.5 text-[#083B40] dark:text-[#2DD4BF] shrink-0" />
          <span className="truncate">{locationDisplay}</span>
        </button>

        {/* Actions Zone */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Language Switcher */}
          <button
            onClick={cycleLanguage}
            className="min-h-[44px] min-w-[40px] px-2 rounded-xl text-xs font-bold text-[#1F2937] dark:text-slate-200 hover:bg-[#F8E8ED] dark:hover:bg-[#142042] flex items-center justify-center gap-1 transition-colors cursor-pointer"
            title={language === 'bn' ? 'ভাষা পরিবর্তন (Change Language)' : 'Change Language'}
          >
            <Globe className="w-3.5 h-3.5 text-[#6B7280] dark:text-slate-400" />
            <span className="text-[11px]">{getLangBadge()}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onToggleTheme();
            }}
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#1F2937] dark:text-slate-200 hover:bg-[#F8E8ED] dark:hover:bg-[#142042] transition-colors cursor-pointer"
            title={language === 'bn' ? 'ডিসপ্লে থিম পরিবর্তন' : 'Change Display Theme'}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-[#10235A]" />
            ) : theme === 'dark' ? (
              <span className="text-[10px] font-black tracking-tight text-[#E9B7C3] px-1 py-0.5 rounded bg-[#10235A] border border-[#E9B7C3]/40">
                OLED
              </span>
            ) : (
              <Sun className="w-4 h-4 text-[#E9B7C3]" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onOpenSettings();
            }}
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#1F2937] dark:text-slate-200 hover:bg-[#F8E8ED] dark:hover:bg-[#142042] transition-colors cursor-pointer"
            title={t.settings}
          >
            <Settings className="w-4 h-4 text-[#10235A] dark:text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
