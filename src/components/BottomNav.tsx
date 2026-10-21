import React from 'react';
import { AppLanguage } from '../types';
import { Home, BookOpen, Clock, Search, Menu } from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';

export type MainTabType = 'home' | 'quran' | 'prayer' | 'search' | 'more';

interface BottomNavProps {
  currentTab: string;
  onChangeTab: (tab: any) => void;
  language: AppLanguage;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  language,
}) => {
  const handleTabClick = (tab: string) => {
    triggerHaptic(15);
    onChangeTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    {
      id: 'home',
      label: language === 'bn' ? 'হোম' : 'Home',
      icon: <Home className="w-5 h-5 stroke-[1.9]" />,
    },
    {
      id: 'quran',
      label: language === 'bn' ? 'কুরআন' : 'Quran',
      icon: <BookOpen className="w-5 h-5 stroke-[1.9]" />,
    },
    {
      id: 'prayer',
      label: language === 'bn' ? 'নামাজ' : 'Prayer',
      icon: <Clock className="w-5 h-5 stroke-[1.9]" />,
    },
    {
      id: 'search',
      label: language === 'bn' ? 'অনুসন্ধান' : 'Search',
      icon: <Search className="w-5 h-5 stroke-[1.9]" />,
    },
    {
      id: 'more',
      label: language === 'bn' ? 'মেন্যু' : 'Menu',
      icon: <Menu className="w-5 h-5 stroke-[1.9]" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0E1416]/95 backdrop-blur-lg border-t border-[#D7E9E7] dark:border-[#22353B] transition-colors shadow-sm">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1.5">
        {navItems.map((item) => {
          const isActive =
            currentTab === item.id ||
            (item.id === 'more' &&
              (currentTab === 'ruqyah' ||
                currentTab === 'dua' ||
                currentTab === 'tasbeeh' ||
                currentTab === 'tracker' ||
                currentTab === 'masala' ||
                currentTab === 'salahGuide' ||
                currentTab === 'hadith' ||
                currentTab === 'qibla'));

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className="flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] py-1 cursor-pointer transition-all relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF]"
              aria-label={item.label}
            >
              <div
                className={`flex flex-col items-center justify-center px-3 py-1 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#F3FAF9] dark:bg-[#18282D] text-[#0F5F62] dark:text-[#2DD4BF] shadow-2xs -translate-y-0.5 border border-[#D7E9E7]/80 dark:border-[#22353B]'
                    : 'text-[#5E7475] dark:text-[#9AB2B0] hover:text-[#0F5F62] dark:hover:text-[#EAF2F1]'
                }`}
              >
                <div className="transition-transform duration-200">
                  {item.icon}
                </div>
                <span
                  className={`text-[10px] tracking-tight truncate max-w-[60px] mt-0.5 transition-colors ${
                    isActive
                      ? 'font-bold text-[#0F5F62] dark:text-[#B9E2DD]'
                      : 'font-medium text-[#5E7475] dark:text-[#A2C0BE]'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
