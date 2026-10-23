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
    if (!screenMetrics.isMobile) return '0.5rem'; // Desktop / large screen

    // Manual overrides if user set in preferences
    if (bottomNavSpacing === 'compact') return 'max(env(safe-area-inset-bottom, 0px), 12px)';
    if (bottomNavSpacing === 'standard') return 'max(env(safe-area-inset-bottom, 0px), 20px)';
    if (bottomNavSpacing === 'extra') return 'max(env(safe-area-inset-bottom, 0px), 34px)';

    // AUTO MODE: Smart screen size & device adaptation
    // 1. Standalone / PWA mode on Android: Edge-to-edge transparent navigation bar overlay
    if (screenMetrics.isStandalone) {
      return 'max(env(safe-area-inset-bottom, 0px), 28px)';
    }

    // 2. Android device in browser (where env(safe-area-inset-bottom) is frequently 0px)
    if (screenMetrics.isAndroid) {
      if (screenMetrics.isSmallScreen) {
        return 'max(env(safe-area-inset-bottom, 0px), 16px)';
      }
      if (screenMetrics.isTallPhone) {
        return 'max(env(safe-area-inset-bottom, 0px), 24px)';
      }
      return 'max(env(safe-area-inset-bottom, 0px), 20px)';
    }

    // 3. iOS and other mobile devices
    if (screenMetrics.isSmallScreen) {
      return 'max(env(safe-area-inset-bottom, 0px), 14px)';
    }
    if (screenMetrics.isTallPhone) {
      return 'max(env(safe-area-inset-bottom, 0px), 22px)';
    }
    return 'max(env(safe-area-inset-bottom, 0px), 18px)';
  })();

  const containerHeightClass = screenMetrics.isSmallScreen
    ? 'h-13' // 52px for small-screen phones
    : 'h-14 sm:h-16'; // 56px on mobile, 64px on larger screens

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0E1416]/95 backdrop-blur-xl border-t border-[#D7E9E7] dark:border-[#22353B] transition-all shadow-[0_-4px_25px_rgba(0,0,0,0.08)] select-none"
      style={{
        paddingBottom: computedBottomPadding,
      }}
    >
      <div className={`max-w-md mx-auto grid grid-cols-5 ${containerHeightClass} items-center px-1`}>
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
              className="flex flex-col items-center justify-center h-full min-h-[44px] py-0.5 cursor-pointer transition-all relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF] active:scale-95"
              aria-label={item.label}
            >
              <div
                className={`flex flex-col items-center justify-center w-full max-w-[68px] sm:max-w-[76px] py-1 px-1 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#F3FAF9] dark:bg-[#18282D] text-[#0F5F62] dark:text-[#2DD4BF] shadow-2xs -translate-y-0.5 border border-[#D7E9E7]/80 dark:border-[#22353B]'
                    : 'text-[#5E7475] dark:text-[#9AB2B0] hover:text-[#0F5F62] dark:hover:text-[#EAF2F1]'
                }`}
              >
                <div className="transition-transform duration-200 shrink-0">
                  {item.icon}
                </div>
                <span
                  className={`tracking-tight truncate w-full text-center mt-0.5 transition-colors leading-tight ${
                    screenMetrics.isVeryNarrow || screenMetrics.isSmallScreen
                      ? 'text-[9.5px]'
                      : 'text-[10.5px] sm:text-[11px]'
                  } ${
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
