/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AppLanguage,
  AppTheme,
  ColorTheme,
  UserGender,
  LocationInfo,
  UserPreferences,
  PrayerTimesData,
  ArabicFontFamily,
} from './types';
import { DEFAULT_LOCATION, BD_DISTRICTS } from './data/districtsBD';
import { calculatePrayerTimes } from './utils/prayerTimes';
import { triggerHaptic } from './utils/audioPlayer';
import { Header } from './components/Header';
import { BottomNav, MainTabType } from './components/BottomNav';

const MAIN_TABS: MainTabType[] = ['home', 'quran', 'prayer', 'search', 'more'];
import { fetchSurahAyahs } from './data/quranData';
import { HomeDashboard } from './components/HomeDashboard';
import { QuranReader } from './components/QuranReader';
import { GlobalSearch } from './components/GlobalSearch';
import { PrayerSchedule } from './components/PrayerSchedule';
import { SalahGuide } from './components/SalahGuide';
import { DuaAzkar } from './components/DuaAzkar';
import { TasbeehCounter } from './components/TasbeehCounter';
import { HadithSection } from './components/HadithSection';
import { QiblaCompass } from './components/QiblaCompass';
import { PeriodTracker } from './components/PeriodTracker';
import { MasalaSection } from './components/MasalaSection';
import { RuqyahHome } from './components/RuqyahHome';
import { MoreMenu } from './components/MoreMenu';
import { LocationModal } from './components/LocationModal';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { GenderSelectionModal } from './components/GenderSelectionModal';
import { SplashScreen } from './components/SplashScreen';
import { applyThemeToDOM } from './utils/themeManager';

const PREFERENCES_KEY = 'noor_quran_user_preferences_v1';

export default function App() {
  // Load preferences or initialize default
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    let savedGender: UserGender | null = null;
    let savedColorTheme: ColorTheme | null = null;
    let savedCustomColor: string | undefined = undefined;
    if (typeof window !== 'undefined') {
      try {
        savedGender = (localStorage.getItem('noor_quran_user_gender') as UserGender) || null;
        savedColorTheme = (localStorage.getItem('noor_quran_user_color_theme') as ColorTheme) || null;
        savedCustomColor = localStorage.getItem('noor_quran_user_custom_primary_color') || undefined;
      } catch {
        // ignore
      }
    }

    try {
      const saved = localStorage.getItem(PREFERENCES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure pronunciation is ON by default
        if (parsed.showTransliteration === undefined) {
          parsed.showTransliteration = true;
        }
        parsed.gender = parsed.gender !== undefined ? parsed.gender : savedGender;
        parsed.colorTheme = parsed.colorTheme || savedColorTheme || 'teal';
        parsed.customPrimaryColor = parsed.customPrimaryColor || savedCustomColor;
        return parsed;
      }
    } catch {
      // ignore
    }
    return {
      language: 'bn',
      theme: 'light',
      colorTheme: savedColorTheme || 'teal',
      customPrimaryColor: savedCustomColor,
      gender: savedGender,
      location: DEFAULT_LOCATION,
      calculationMethod: 'IFB',
      asrMethod: 'hanafi',
      ramadanMode: false,
      fontSizeArabic: 28,
      fontSizeBengali: 15,
      arabicFont: (() => {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('noor_quran_user_arabic_font') as ArabicFontFamily;
          if (saved && saved !== 'amiri-quran' && saved !== 'amiri') {
            return saved;
          }
          localStorage.setItem('noor_quran_user_arabic_font', 'noto-naskh');
        }
        return 'noto-naskh';
      })(),
      showTransliteration: true,
      showEnglishTranslation: false,
      showTajweedColors: true,
      selectedReciter: 'alafasy',
      reducedMotion: false,
      quranMode: 'study',
      lineSpacing: 2.2,
      soundEnabled: true,
      vibrationEnabled: true,
      bookmarks: [1, 67, 112],
      favoriteAyahs: [],
      favoriteDuas: ['sayyidul_istighfar'],
      tasbeehCounts: { subhanallah: 33, alhamdulillah: 33, allahuakbar: 34, istighfar: 100 },
      tasbeehLifetimeCounts: {
        istighfar: 21234,
        subhanallah: 3450,
        alhamdulillah: 3120,
        allahuakbar: 3340,
        darood: 5100,
        tahlil: 2500,
        hawqala: 1200,
      },
      activeTasbeehDhikr: 'istighfar',
      dailyAmalChecklist: {},
      onboardingCompleted: true, // will trigger if false
    };
  });

  // Current view tab (Default opens on Home screen with Namazer Waqt mode as requested)
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [activeSurahToOpen, setActiveSurahToOpen] = useState<number | undefined>(1);

  // Modals & Screen States
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  // Prompt new users for gender on startup if not yet specified
  const [isGenderModalOpen, setIsGenderModalOpen] = useState<boolean>(() => !preferences.gender);
  // Splash screen motion graphics completely disabled on startup as requested
  const [showSplash, setShowSplash] = useState(false);

  // Prompt new users for gender selection right at the start
  useEffect(() => {
    if (!preferences.gender) {
      setIsGenderModalOpen(true);
    }
  }, [preferences.gender]);

  // Synchronize Preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.warn('Failed to save preferences to localStorage', e);
    }
  }, [preferences]);

  // Apply Theme Mode (Light / Dark / AMOLED) to document HTML root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-amoled');
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else if (preferences.theme === 'amoled') {
      root.classList.add('dark', 'theme-amoled');
    }
    if (preferences.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [preferences.theme, preferences.reducedMotion]);

  // Apply Color Theme and Custom Primary Color dynamically via CSS variables
  useEffect(() => {
    const isDark = preferences.theme === 'dark' || preferences.theme === 'amoled';
    applyThemeToDOM(preferences.colorTheme || 'teal', preferences.customPrimaryColor, isDark);
    try {
      localStorage.setItem('noor_quran_user_color_theme', preferences.colorTheme || 'teal');
      if (preferences.customPrimaryColor) {
        localStorage.setItem('noor_quran_user_custom_primary_color', preferences.customPrimaryColor);
      }
    } catch {
      // ignore
    }
  }, [preferences.colorTheme, preferences.customPrimaryColor, preferences.theme]);

  // Intelligent Offline Preloader: pre-cache popular Surahs when online
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        // Sequentially prefetch popular surahs in idle background without blocking UI
        const popularSurahs = [36, 55, 56, 67, 18];
        popularSurahs.forEach((sNum, idx) => {
          setTimeout(() => {
            fetchSurahAyahs(sNum).catch(() => {});
          }, idx * 1500);
        });
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);


  // Request location permission on install / first launch to update accurate prayer times automatically
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    const hasPrompted = localStorage.getItem('noor_quran_location_auto_prompted_v1');
    if (hasPrompted) return;

    localStorage.setItem('noor_quran_location_auto_prompted_v1', 'attempted');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let closest = BD_DISTRICTS[0];
        let minDist = 999999;
        for (const dist of BD_DISTRICTS) {
          const d = Math.hypot(dist.lat - latitude, dist.lng - longitude);
          if (d < minDist) {
            minDist = d;
            closest = dist;
          }
        }
        const detectedLocation: LocationInfo = {
          name: closest.name,
          nameBn: closest.nameBn,
          nameAr: closest.nameAr,
          lat: latitude,
          lng: longitude,
          country: 'Bangladesh (GPS)',
        };
        handleUpdatePreferences({ location: detectedLocation });
        localStorage.setItem('noor_quran_location_auto_prompted_v1', 'granted');
      },
      (err) => {
        console.info('Auto geolocation not granted or unavailable:', err.message);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  // Calculate Astronomical Prayer Times for current date & location
  const prayerTimes: PrayerTimesData = calculatePrayerTimes(
    new Date(),
    preferences.location,
    preferences.calculationMethod,
    preferences.asrMethod
  );

  // Handlers
  const handleUpdatePreferences = (partial: Partial<UserPreferences>) => {
    if (partial.arabicFont && typeof window !== 'undefined') {
      try {
        localStorage.setItem('noor_quran_user_arabic_font', partial.arabicFont);
      } catch {
        // ignore
      }
    }
    setPreferences(prev => ({
      ...prev,
      ...partial,
    }));
  };

  const handleToggleTheme = () => {
    const nextTheme: AppTheme =
      preferences.theme === 'light'
        ? 'dark'
        : preferences.theme === 'dark'
        ? 'amoled'
        : 'light';
    handleUpdatePreferences({ theme: nextTheme });
  };

  const handleToggleBookmark = (surahNum: number) => {
    const exists = preferences.bookmarks.includes(surahNum);
    const updated = exists
      ? preferences.bookmarks.filter(b => b !== surahNum)
      : [...preferences.bookmarks, surahNum];
    handleUpdatePreferences({ bookmarks: updated });
  };

  const handleToggleFavoriteDua = (duaId: string) => {
    const exists = preferences.favoriteDuas.includes(duaId);
    const updated = exists
      ? preferences.favoriteDuas.filter(d => d !== duaId)
      : [...preferences.favoriteDuas, duaId];
    handleUpdatePreferences({ favoriteDuas: updated });
  };

  const handleToggleFavoriteHadith = (hadithId: string) => {
    const exists = preferences.favoriteHadiths.includes(hadithId);
    const updated = exists
      ? preferences.favoriteHadiths.filter(h => h !== hadithId)
      : [...preferences.favoriteHadiths, hadithId];
    handleUpdatePreferences({ favoriteHadiths: updated });
  };

  const handleToggleAmalHabit = (habitId: string) => {
    const updated = {
      ...preferences.dailyAmalChecklist,
      [habitId]: !preferences.dailyAmalChecklist[habitId],
    };
    handleUpdatePreferences({ dailyAmalChecklist: updated });
  };

  const handleUpdateTasbeehCount = (dhikrId: string, count: number, lifetimeDelta: number = 0) => {
    setPreferences((prev) => {
      const prevLifetime = prev.tasbeehLifetimeCounts?.[dhikrId] ?? 0;
      const nextLifetime = Math.max(0, prevLifetime + lifetimeDelta);
      return {
        ...prev,
        tasbeehCounts: {
          ...prev.tasbeehCounts,
          [dhikrId]: count,
        },
        tasbeehLifetimeCounts: {
          ...(prev.tasbeehLifetimeCounts || {}),
          [dhikrId]: nextLifetime,
        },
      };
    });
  };

  const handleSetLifetimeCount = (dhikrId: string, count: number) => {
    setPreferences((prev) => ({
      ...prev,
      tasbeehLifetimeCounts: {
        ...(prev.tasbeehLifetimeCounts || {}),
        [dhikrId]: Math.max(0, count),
      },
    }));
  };

  const handleNavigate = (tab: string, extra?: unknown) => {
    if (tab === 'quran' && typeof extra === 'number') {
      setActiveSurahToOpen(extra);
    }
    // Female-only access guard for Period Tracker
    if (tab === 'tracker' && preferences.gender !== 'female') {
      setCurrentTab('home');
      return;
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Horizontal swipe gestures to switch between tabs (Home, Quran, Prayer, Search, Menu)
  const touchStartRef = useRef<{ x: number; y: number; time: number; target: EventTarget | null } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      target: e.target,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    const target = touchStartRef.current.target as HTMLElement | null;
    touchStartRef.current = null;

    // Do not trigger swipe if user was dragging a slider, typing, or scrolling a horizontal carousel
    if (
      target &&
      (target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select') ||
        target.closest('[role="slider"]') ||
        target.closest('.no-scrollbar') ||
        target.closest('.overflow-x-auto') ||
        target.closest('[data-prevent-swipe]'))
    ) {
      return;
    }

    // Clear horizontal swipe gesture check:
    // Distance >= 55px, horizontal-to-vertical dominance ratio >= 1.35, duration <= 550ms
    if (Math.abs(deltaX) >= 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35 && deltaTime <= 550) {
      const currentIndex = MAIN_TABS.indexOf(currentTab as MainTabType);

      if (deltaX < 0) {
        // Swiped Right-to-Left (দান থেকে বামে সোয়াইপ) -> Next Tab
        if (currentIndex !== -1 && currentIndex < MAIN_TABS.length - 1) {
          triggerHaptic(20);
          handleNavigate(MAIN_TABS[currentIndex + 1]);
        }
      } else {
        // Swiped Left-to-Right (বাম থেকে ডানে সোয়াইপ) -> Previous Tab
        if (currentIndex > 0) {
          triggerHaptic(20);
          handleNavigate(MAIN_TABS[currentIndex - 1]);
        } else if (currentIndex === -1) {
          // If in a sub-view (e.g. hadith, tasbeeh, ruqyah, tracker), return to more menu
          triggerHaptic(20);
          handleNavigate('more');
        }
      }
    }
  };

  const handleSelectGender = (gender: UserGender) => {
    try {
      localStorage.setItem('noor_quran_user_gender', gender);
      localStorage.setItem('noor_quran_gender_prompt_completed_v2', 'true');
    } catch {
      // ignore
    }
    handleUpdatePreferences({ gender });
    setIsGenderModalOpen(false);
  };

  const handleFinishSplash = () => {
    setShowSplash(false);
    const genderPromptDone =
      typeof window !== 'undefined'
        ? localStorage.getItem('noor_quran_gender_prompt_completed_v2')
        : 'true';
    if (!preferences.gender || !genderPromptDone) {
      setIsGenderModalOpen(true);
    }
  };

  const handleResetAllData = () => {
    localStorage.clear();
    setPreferences({
      language: 'bn',
      theme: 'light',
      colorTheme: 'teal',
      gender: null,
      location: DEFAULT_LOCATION,
      calculationMethod: 'IFB',
      asrMethod: 'hanafi',
      ramadanMode: false,
      fontSizeArabic: 28,
      fontSizeBengali: 15,
      showTransliteration: true,
      showEnglishTranslation: false,
      showTajweedColors: true,
      selectedReciter: 'alafasy',
      soundEnabled: true,
      vibrationEnabled: true,
      bookmarks: [1, 67, 112],
      favoriteAyahs: [],
      favoriteDuas: ['sayyidul_istighfar'],
      favoriteHadiths: ['hadith_niyyah'],
      tasbeehCounts: { subhanallah: 33, alhamdulillah: 33, allahuakbar: 34 },
      activeTasbeehDhikr: 'subhanallah',
      dailyAmalChecklist: {},
      onboardingCompleted: true,
    });
    setCurrentTab('home');
  };

  return (
    <div className="min-h-screen bg-[#F3FAF9] dark:bg-[#0E1416] text-[#123234] dark:text-[#EAF2F1] flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        language={preferences.language}
        theme={preferences.theme}
        location={preferences.location}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onToggleTheme={handleToggleTheme}
        onChangeLanguage={(lang) => handleUpdatePreferences({ language: lang })}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Content Area with Touch Gestures for Tab Navigation */}
      <main
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex-1 w-full max-w-2xl mx-auto px-2 sm:px-3 pt-1 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full"
          >
            {currentTab === 'home' && (
              <HomeDashboard
                language={preferences.language}
                gender={preferences.gender}
                location={preferences.location}
                prayerTimes={prayerTimes}
                onNavigate={handleNavigate}
                onOpenLocationModal={() => setIsLocationModalOpen(true)}
                ramadanMode={preferences.ramadanMode}
                onToggleRamadanMode={() =>
                  handleUpdatePreferences({ ramadanMode: !preferences.ramadanMode })
                }
              />
            )}

            {currentTab === 'quran' && (
              <QuranReader
                language={preferences.language}
                arabicFontSize={preferences.fontSizeArabic}
                bengaliFontSize={preferences.fontSizeBengali}
                arabicFont={preferences.arabicFont || 'noto-naskh'}
                showTajweed={preferences.showTajweedColors}
                showTransliteration={preferences.showTransliteration}
                showEnglishTranslation={preferences.showEnglishTranslation}
                selectedReciter={preferences.selectedReciter}
                bookmarks={preferences.bookmarks}
                onToggleBookmark={handleToggleBookmark}
                onUpdateFontSize={(ar, bn) =>
                  handleUpdatePreferences({ fontSizeArabic: ar, fontSizeBengali: bn })
                }
                onChangeArabicFont={(font) =>
                  handleUpdatePreferences({ arabicFont: font })
                }
                onToggleTajweed={() =>
                  handleUpdatePreferences({ showTajweedColors: !preferences.showTajweedColors })
                }
                onToggleTransliteration={() =>
                  handleUpdatePreferences({
                    showTransliteration: !preferences.showTransliteration,
                  })
                }
                onToggleEnglish={() =>
                  handleUpdatePreferences({
                    showEnglishTranslation: !preferences.showEnglishTranslation,
                  })
                }
                onChangeReciter={(reciterId) =>
                  handleUpdatePreferences({ selectedReciter: reciterId })
                }
                initialSurah={activeSurahToOpen}
                onOpenProfile={() => setIsSettingsModalOpen(true)}
              />
            )}

            {currentTab === 'search' && (
              <GlobalSearch
                language={preferences.language}
                onNavigate={(tab, surahId) => {
                  if (surahId) {
                    setActiveSurahToOpen(surahId);
                  }
                  handleNavigate(tab);
                }}
              />
            )}

            {currentTab === 'prayer' && (
              <PrayerSchedule
                language={preferences.language}
                location={preferences.location}
                prayerTimes={prayerTimes}
                calculationMethod={preferences.calculationMethod}
                asrMethod={preferences.asrMethod}
                onChangeCalculationMethod={(method) =>
                  handleUpdatePreferences({ calculationMethod: method })
                }
                onChangeAsrMethod={(asr) => handleUpdatePreferences({ asrMethod: asr })}
                onOpenLocationModal={() => setIsLocationModalOpen(true)}
                ramadanMode={preferences.ramadanMode}
                onToggleRamadanMode={() =>
                  handleUpdatePreferences({ ramadanMode: !preferences.ramadanMode })
                }
              />
            )}

            {currentTab === 'dua' && (
              <DuaAzkar
                language={preferences.language}
                dailyAmalChecklist={preferences.dailyAmalChecklist}
                onToggleAmalHabit={handleToggleAmalHabit}
                favoriteDuas={preferences.favoriteDuas}
                onToggleFavoriteDua={handleToggleFavoriteDua}
              />
            )}

            {currentTab === 'tasbeeh' && (
              <TasbeehCounter
                language={preferences.language}
                activeTasbeehDhikr={preferences.activeTasbeehDhikr}
                onChangeDhikr={(dhikrId) =>
                  handleUpdatePreferences({ activeTasbeehDhikr: dhikrId })
                }
                tasbeehCounts={preferences.tasbeehCounts}
                tasbeehLifetimeCounts={preferences.tasbeehLifetimeCounts || {}}
                onUpdateCount={handleUpdateTasbeehCount}
                onSetLifetimeCount={handleSetLifetimeCount}
                soundEnabled={preferences.soundEnabled}
                vibrationEnabled={preferences.vibrationEnabled}
                onToggleSound={() => handleUpdatePreferences({ soundEnabled: !preferences.soundEnabled })}
                onToggleVibration={() => handleUpdatePreferences({ vibrationEnabled: !preferences.vibrationEnabled })}
                colorTheme={preferences.colorTheme || 'sapphire'}
                customDhikrs={preferences.customDhikrs}
                onAddCustomDhikr={(dhikr) =>
                  handleUpdatePreferences({
                    customDhikrs: [...(preferences.customDhikrs || []), dhikr],
                  })
                }
                onDeleteCustomDhikr={(dhikrId) =>
                  handleUpdatePreferences({
                    customDhikrs: (preferences.customDhikrs || []).filter((d) => d.id !== dhikrId),
                    activeTasbeehDhikr:
                      preferences.activeTasbeehDhikr === dhikrId ? 'istighfar' : preferences.activeTasbeehDhikr,
                  })
                }
              />
            )}

            {currentTab === 'salahGuide' && (
              <SalahGuide language={preferences.language} />
            )}

            {currentTab === 'hadith' && (
              <HadithSection
                language={preferences.language}
                favoriteHadiths={preferences.favoriteHadiths}
                onToggleFavoriteHadith={handleToggleFavoriteHadith}
              />
            )}

            {currentTab === 'qibla' && (
              <QiblaCompass
                language={preferences.language}
                location={preferences.location}
              />
            )}

            {currentTab === 'tracker' && preferences.gender === 'female' && (
              <PeriodTracker
                language={preferences.language}
                userGender={preferences.gender}
                onSwitchGender={handleSelectGender}
                onBack={() => handleNavigate('home')}
              />
            )}

            {currentTab === 'masala' && (
              <MasalaSection language={preferences.language} />
            )}

            {currentTab === 'ruqyah' && (
              <RuqyahHome
                language={preferences.language}
                onBack={() => handleNavigate('home')}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            )}

            {currentTab === 'more' && (
              <MoreMenu
                language={preferences.language}
                gender={preferences.gender}
                onSelectFeature={(featId) => handleNavigate(featId)}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onOpenGenderSelection={() => setIsGenderModalOpen(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Ergonomic Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onChangeTab={(tab) => handleNavigate(tab)}
        language={preferences.language}
      />

      {/* Location Picker Modal */}
      {isLocationModalOpen && (
        <LocationModal
          language={preferences.language}
          currentLocation={preferences.location}
          onSelectLocation={(loc) => handleUpdatePreferences({ location: loc })}
          onClose={() => setIsLocationModalOpen(false)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <SettingsModal
          language={preferences.language}
          theme={preferences.theme}
          preferences={preferences}
          onClose={() => setIsSettingsModalOpen(false)}
          onChangeLanguage={(lang) => handleUpdatePreferences({ language: lang })}
          onChangeTheme={(th) => handleUpdatePreferences({ theme: th })}
          onChangeColorTheme={(ct) => handleUpdatePreferences({ colorTheme: ct })}
          onUpdatePreferences={handleUpdatePreferences}
          onResetAllData={handleResetAllData}
          onOpenGenderSelection={() => setIsGenderModalOpen(true)}
          onReplaySplash={() => setShowSplash(true)}
        />
      )}

      {/* Gender Selection Modal (Mandatory prompt for new users, or accessed via settings/menu) */}
      {isGenderModalOpen && (
        <GenderSelectionModal
          language={preferences.language}
          currentGender={preferences.gender}
          onSelectGender={handleSelectGender}
          onClose={preferences.gender ? () => setIsGenderModalOpen(false) : undefined}
        />
      )}

      {/* First-time Onboarding Modal (shows after gender is chosen) */}
      {!preferences.onboardingCompleted && !isGenderModalOpen && (
        <OnboardingModal
          onComplete={(updates) => handleUpdatePreferences(updates)}
        />
      )}

      {/* App Launch Animated Splash Screen with Sacred Logo & Motion Graphics */}
      {showSplash && (
        <SplashScreen
          onFinish={handleFinishSplash}
        />
      )}
    </div>
  );
}
