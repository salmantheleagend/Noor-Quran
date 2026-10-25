import React, { useState, useEffect } from 'react';
import { AppLanguage } from '../types';
import { Home, BookOpen, Clock, Search, Menu } from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';

export type MainTabType = 'home' | 'quran' | 'prayer' | 'search' | 'more';

interface BottomNavProps {
  currentTab: string;
  onChangeTab: (tab: any) => void;
  language: AppLanguage;
  bottomNavSpacing?: 'auto' | 'compact' | 'standard' | 'extra';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  language,
  bottomNavSpacing = 'auto',
}) => {
  const [screenMetrics, setScreenMetrics] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        width: 390,
        height: 844,
        isMobile: true,
        isSmallScreen: false,
        isVeryNarrow: false,
        isTallPhone: false,
        isStandalone: false,
        isAndroid: false,
      };
    }
    const width = window.innerWidth;
    const height = window.innerHeight;
    const ua = navigator.userAgent || '';
    const isAndroid = /android/i.test(ua);
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const isMobile = width <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = height < 660;
    const isVeryNarrow = width < 360;
    const isTallPhone = height >= 820;

    return {
      width,
      height,
      isMobile,
      isSmallScreen,
      isVeryNarrow,
      isTallPhone,
      isStandalone,
      isAndroid,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const ua = navigator.userAgent || '';
      const isAndroid = /android/i.test(ua);
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      const isMobile = width <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = height < 660;
      const isVeryNarrow = width < 360;
      const isTallPhone = height >= 820;

      setScreenMetrics({
        width,
        height,
        isMobile,
        isSmallScreen,
        isVeryNarrow,
        isTallPhone,
        isStandalone,
        isAndroid,
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const handleTabClick = (tab: string) => {
    triggerHaptic(15);
    onChangeTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    {
      id: 'home',
      label: language === 'bn' ? 'হোম' : 'Home',
      icon: <Home className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] stroke-[1.9]" />,
    },
    {
      id: 'quran',
      label: language === 'bn' ? 'কুরআন' : 'Quran',
      icon: <BookOpen className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] stroke-[1.9]" />,
    },
    {
      id: 'prayer',
      label: language === 'bn' ? 'নামাজ' : 'Prayer',
      icon: <Clock className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] stroke-[1.9]" />,
    },
    {
      id: 'search',
      label: language === 'bn' ? 'অনুসন্ধান' : 'Search',
      icon: <Search className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] stroke-[1.9]" />,
    },
    {
      id: 'more',
      label: language === 'bn' ? 'মেন্যু' : 'Menu',
      icon: <Menu className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] stroke-[1.9]" />,
    },
  ];

  // Dynamic bottom padding calculation that automatically clears Android 3-button, gesture pills, and iOS bars
  const computedBottomPadding = (() => {
    if (!screenMetrics.isMobile) return '0.75rem'; // Desktop / large screen

    // Manual overrides if user set in preferences
    if (bottomNavSpacing === 'compact') return 'max(env(safe-area-inset-bottom, 0px), 18px)';
    if (bottomNavSpacing === 'standard') return 'max(env(safe-area-inset-bottom, 0px), 28px)';
    if (bottomNavSpacing === 'extra') return 'max(env(safe-area-inset-bottom, 0px), 42px)';

    // AUTO MODE: Smart screen size & device adaptation
    // On Android (with 3-button or gesture bars) or PWA standalone mode:
    if (screenMetrics.isStandalone || screenMetrics.isAndroid) {
      return 'max(env(safe-area-inset-bottom, 0px), 30px)';
    }

    // iOS and other mobile devices
    if (screenMetrics.isSmallScreen) {
      return 'max(env(safe-area-inset-bottom, 0px), 22px)';
    }
    return 'max(env(safe-area-inset-bottom, 0px), 26px)';
  })();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/98 dark:bg-[#0E1416]/98 backdrop-blur-xl border-t border-[#D7E9E7] dark:border-[#22353B] transition-all shadow-[0_-4px_25px_rgba(0,0,0,0.08)] select-none pt-1"
      style={{
        paddingBottom: computedBottomPadding,
      }}
    >
      <div className="max-w-md mx-auto grid grid-cols-5 min-h-[58px] sm:min-h-[64px] items-center px-1">
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
              className="group flex flex-col items-center justify-center h-full min-h-[52px] py-1 cursor-pointer transition-all relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF] active:scale-95"
              aria-label={item.label}
            >
              <div
                className={`flex flex-col items-center justify-center w-full max-w-[68px] sm:max-w-[76px] py-1 px-1 rounded-2xl transition-all duration-200 relative ${
                  isActive
                    ? 'bg-[#EAF5F4] dark:bg-[#16272B] text-[#083B40] dark:text-[#2DD4BF] shadow-2xs -translate-y-0.5 border border-[#B9E2DD]/80 dark:border-[#2DD4BF]/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#083B40] dark:hover:text-[#2DD4BF]'
                }`}
              >
                {/* Active Top Accent Pip */}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#083B40] dark:bg-[#2DD4BF] absolute -top-1" />
                )}

                <div className="transition-transform duration-200 shrink-0">
                  {item.icon}
                </div>

                <span
                  className={`w-full text-center mt-1 pb-0.5 transition-colors leading-none tracking-normal font-sans ${
                    screenMetrics.isVeryNarrow
                      ? 'text-[10px]'
                      : 'text-[11px] sm:text-[11.5px]'
                  } ${
                    isActive
                      ? 'font-black text-[#083B40] dark:text-[#2DD4BF]'
                      : 'font-semibold text-slate-600 dark:text-slate-300 group-hover:text-[#083B40] dark:group-hover:text-[#2DD4BF]'
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
