import React, { useState } from 'react';
import { AppLanguage, AppTheme, ColorTheme, UserPreferences } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  X,
  Moon,
  Sun,
  Globe,
  Sliders,
  Volume2,
  Trash2,
  Download,
  Check,
  Palette,
  Pipette,
  User,
  Heart,
  Eye,
  Activity,
  Sparkles,
  WifiOff,
  ShieldCheck,
  Bell,
  BellRing,
  BellOff,
  AlertCircle,
  Clock,
  Send,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';
import { applyThemeToDOM } from '../utils/themeManager';
import {
  getPrayerNotificationSettings,
  savePrayerNotificationSettings,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestPrayerNotification,
  PrayerNotificationSettings,
} from '../utils/prayerNotifications';
import islamicBadge from '../assets/images/islamic_app_badge_1791133494322.jpg';

interface SettingsModalProps {
  language: AppLanguage;
  theme: AppTheme;
  preferences: UserPreferences;
  onClose: () => void;
  onChangeLanguage: (lang: AppLanguage) => void;
  onChangeTheme: (theme: AppTheme) => void;
  onChangeColorTheme?: (colorTheme: ColorTheme) => void;
  onUpdatePreferences: (partial: Partial<UserPreferences>) => void;
  onResetAllData: () => void;
  onOpenGenderSelection?: () => void;
  onReplaySplash?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  language,
  theme,
  preferences,
  onClose,
  onChangeLanguage,
  onChangeTheme,
  onChangeColorTheme,
  onUpdatePreferences,
  onResetAllData,
  onOpenGenderSelection,
  onReplaySplash,
}) => {
  const t = TRANSLATIONS[language];
  const [customColorInput, setCustomColorInput] = useState<string>(
    preferences.customPrimaryColor || '#0F5F62'
  );

  const [notifSettings, setNotifSettings] = useState<PrayerNotificationSettings>(() =>
    getPrayerNotificationSettings()
  );
  const [permStatus, setPermStatus] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermission()
  );
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  const handleRequestPermission = async () => {
    triggerHaptic(20);
    const res = await requestNotificationPermission();
    setPermStatus(res.permission);
    if (res.granted) {
      setTestFeedback(language === 'bn' ? '✓ নোটিফিকেশন অনুমতি সফল হয়েছে!' : '✓ Notification permission granted!');
      const updated: PrayerNotificationSettings = { ...notifSettings, enabled: true };
      setNotifSettings(updated);
      savePrayerNotificationSettings(updated);
    } else {
      setTestFeedback(
        language === 'bn'
          ? 'অনুমতি প্রদান করা হয়নি। ব্রাউজার বা ফোন সেটিংসে গিয়ে অনুমতি দিন।'
          : 'Permission not granted. Please allow in browser or device settings.'
      );
    }
  };

  const handleSendTestNotification = async () => {
    triggerHaptic(20);
    setIsSendingTest(true);
    setTestFeedback(null);
    const res = await sendTestPrayerNotification(language);
    setIsSendingTest(false);
    setTestFeedback(res.message);
  };

  const handleTogglePrayer = (prayerKey: keyof PrayerNotificationSettings['prayers']) => {
    triggerHaptic(15);
    const updated: PrayerNotificationSettings = {
      ...notifSettings,
      prayers: {
        ...notifSettings.prayers,
        [prayerKey]: !notifSettings.prayers[prayerKey],
      },
    };
    setNotifSettings(updated);
    savePrayerNotificationSettings(updated);
  };

  const handleToggleMasterNotification = async () => {
    triggerHaptic(15);
    if (!notifSettings.enabled && permStatus !== 'granted') {
      const res = await requestNotificationPermission();
      setPermStatus(res.permission);
      if (!res.granted) return;
    }
    const updated: PrayerNotificationSettings = {
      ...notifSettings,
      enabled: !notifSettings.enabled,
    };
    setNotifSettings(updated);
    savePrayerNotificationSettings(updated);
  };

  const handleChangeOffset = (minutes: number) => {
    triggerHaptic(15);
    const updated: PrayerNotificationSettings = {
      ...notifSettings,
      reminderOffsetMinutes: minutes,
    };
    setNotifSettings(updated);
    savePrayerNotificationSettings(updated);
  };

  const handleToggleAdhanTone = () => {
    triggerHaptic(15);
    const updated: PrayerNotificationSettings = {
      ...notifSettings,
      adhanToneEnabled: !notifSettings.adhanToneEnabled,
    };
    setNotifSettings(updated);
    savePrayerNotificationSettings(updated);
  };

  const handleApplyCustomColor = (hex: string) => {
    let clean = hex.trim();
    if (!clean.startsWith('#')) clean = `#${clean}`;
    if (!/^#[0-9A-Fa-f]{6}$/.test(clean)) return;
    setCustomColorInput(clean);
    triggerHaptic(15);
    const isDark = theme === 'dark' || theme === 'amoled';
    applyThemeToDOM('custom', clean, isDark);
    onUpdatePreferences({ colorTheme: 'custom', customPrimaryColor: clean });
    try {
      localStorage.setItem('noor_quran_user_color_theme', 'custom');
      localStorage.setItem('noor_quran_user_custom_primary_color', clean);
    } catch {
      // ignore
    }
  };

  const handleExportBackup = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(preferences));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'noor_quran_backup.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch {
      alert('ব্যাকআপ নেওয়া সম্ভব হয়নি।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0C152E] rounded-3xl max-w-sm sm:max-w-md w-full p-4 sm:p-5 space-y-4 border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xl max-h-[88vh] flex flex-col text-[#1F2937] dark:text-[#F8E8ED]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#E7D9DE] dark:border-[#1C2D5A] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F8E8ED] dark:bg-[#142042] flex items-center justify-center text-[#21409A] dark:text-[#E9B7C3]">
              <Sliders className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#10235A] dark:text-white">
                {t.settings}
              </h3>
              <p className="text-[10px] text-[#6B7280] dark:text-slate-400">অ্যাপ সেটিংস ও এক্সেসিবিলিটি</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#6B7280] hover:text-[#10235A] hover:bg-[#F8E8ED] dark:hover:bg-[#142042] cursor-pointer transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 space-y-4 pr-1 text-xs">
          {/* 1. DISPLAY MODE: Light / Dark / AMOLED */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#1C2D5A]">
            <label className="font-bold text-[#10235A] dark:text-white block">
              ডিসপ্লে মোড (Display Mode)
            </label>
            <p className="text-[10px] text-[#6B7280] dark:text-slate-400 pb-1">
              লাইট, মিডনাইট নেভি ডার্ক ও অ্যামোলেড মোড
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onChangeTheme('light')}
                className={`min-h-[44px] p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-[#21409A] text-white border-[#21409A] shadow-xs'
                    : 'bg-white dark:bg-[#142042] border-[#E7D9DE] dark:border-[#24386E] text-[#10235A] dark:text-slate-300'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => onChangeTheme('dark')}
                className={`min-h-[44px] p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#21409A] text-white border-[#21409A] shadow-xs'
                    : 'bg-white dark:bg-[#142042] border-[#E7D9DE] dark:border-[#24386E] text-[#10235A] dark:text-slate-300'
                }`}
              >
                Dark (Navy)
              </button>
              <button
                onClick={() => onChangeTheme('amoled')}
                className={`min-h-[44px] p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  theme === 'amoled'
                    ? 'bg-[#21409A] text-white border-[#21409A] shadow-xs'
                    : 'bg-black text-[#E9B7C3] border-[#24386E]'
                }`}
              >
                AMOLED
              </button>
            </div>
          </div>

          {/* COLOR THEME SELECTOR (Minimal & User-Friendly) */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#1C2D5A]">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#10235A] dark:text-white flex items-center gap-1.5 text-xs">
                <Palette className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />
                <span>কালার থিম (Color Theme)</span>
              </label>
              <span className="text-[10px] text-[#6B7280] dark:text-slate-400">
                মিনিমাল ও ফ্রেন্ডলি
              </span>
            </div>
            <p className="text-[10px] text-[#6B7280] dark:text-slate-400">
              অ্যাপের মূল রঙ পরিবর্তন করুন — চোখের জন্য আরামদায়ক ও শান্ত
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {[
                {
                  id: 'teal' as ColorTheme,
                  nameBn: 'টিল ও পার্ল (Teal + Pearl)',
                  descBn: 'প্রশান্তিময় ইসলামিক টিল ও পার্ল (ডিফল্ট)',
                  primaryHex: '#0F5F62',
                  accentHex: '#B9E2DD',
                },
                {
                  id: 'sapphire' as ColorTheme,
                  nameBn: 'রয়েল স্যাফায়ার (Sapphire)',
                  descBn: 'রাজকীয় নীল ও রোজ কোয়ার্টজ',
                  primaryHex: '#21409A',
                  accentHex: '#E9B7C3',
                },
                {
                  id: 'emerald' as ColorTheme,
                  nameBn: 'পান্না সবুজ (Emerald)',
                  descBn: 'ইসলামিক শান্ত সবুজ ও মিন্ট',
                  primaryHex: '#047857',
                  accentHex: '#34D399',
                },
                {
                  id: 'minimal' as ColorTheme,
                  nameBn: 'মিনিমাল স্লেট (Minimal Slate)',
                  descBn: 'মার্জিত শান্ত স্লেট (চোখের জন্য আরামদায়ক)',
                  primaryHex: '#334155',
                  accentHex: '#94A3B8',
                },
                {
                  id: 'rose' as ColorTheme,
                  nameBn: 'রোজ কোয়ার্টজ (Rose)',
                  descBn: 'স্নিগ্ধ গোলাপী ও বার্গেন্ডি',
                  primaryHex: '#9D174D',
                  accentHex: '#F472B6',
                },
                {
                  id: 'amber' as ColorTheme,
                  nameBn: 'মরু অ্যাম্বার (Desert Amber)',
                  descBn: 'উষ্ণ বালুকা ও সোনালী আভা',
                  primaryHex: '#B45309',
                  accentHex: '#FBBF24',
                },
                {
                  id: 'purple' as ColorTheme,
                  nameBn: 'রয়েল পার্পল (Royal Purple)',
                  descBn: 'আভিজাত্যময় ভায়োলেট ও ল্যাভেন্ডার',
                  primaryHex: '#6D28D9',
                  accentHex: '#C4B5FD',
                },
              ].map((themeOpt) => {
                const isSelected = (preferences.colorTheme || 'teal') === themeOpt.id;
                return (
                  <button
                    key={themeOpt.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(15);
                      const isDark = theme === 'dark' || theme === 'amoled';
                      applyThemeToDOM(themeOpt.id, undefined, isDark);
                      try {
                        localStorage.setItem('noor_quran_user_color_theme', themeOpt.id);
                      } catch {
                        // ignore
                      }
                      if (onChangeColorTheme) {
                        onChangeColorTheme(themeOpt.id);
                      }
                      onUpdatePreferences({ colorTheme: themeOpt.id });
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 min-h-[46px] ${
                      isSelected
                        ? 'bg-white dark:bg-[#142042] border-[#21409A] ring-2 ring-[#21409A]/40 shadow-xs'
                        : 'bg-white/70 dark:bg-[#142042]/70 border-[#E7D9DE] dark:border-[#24386E] hover:border-[#21409A]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex items-center -space-x-1 shrink-0">
                        <span
                          data-swatch-dot="true"
                          className="w-4 h-4 rounded-full border border-white shadow-xs"
                          style={{ backgroundColor: themeOpt.primaryHex }}
                        />
                        <span
                          data-swatch-dot="true"
                          className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                          style={{ backgroundColor: themeOpt.accentHex }}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-[#10235A] dark:text-white block text-xs truncate">
                          {themeOpt.nameBn}
                        </span>
                        <span className="text-[10px] text-[#6B7280] dark:text-slate-400 block truncate">
                          {themeOpt.descBn}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#21409A] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Primary Color Picker (CSS Variable --theme-primary) */}
            <div className="mt-3 pt-3 border-t border-[#E7D9DE] dark:border-[#1C2D5A] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#10235A] dark:text-white flex items-center gap-1.5 text-xs">
                  <Pipette className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
                  <span>কাস্টম প্রাইমারি কালার (Custom Color Picker)</span>
                </span>
                {preferences.colorTheme === 'custom' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#21409A]/10 text-[#21409A] dark:text-[#E9B7C3] font-bold">
                    সক্রিয়
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#6B7280] dark:text-slate-400">
                পছন্দমতো যেকোনো হেক্স কালার নির্বাচন করুন — ডায়নামিক CSS ভেরিয়েবল হিসেবে প্রয়োগ হবে
              </p>

              {/* Color Picker Input & Hex Display */}
              <div className="flex items-center gap-2.5 bg-white dark:bg-[#142042] p-2.5 rounded-xl border border-[#E7D9DE] dark:border-[#24386E]">
                <div className="relative shrink-0">
                  <input
                    type="color"
                    value={customColorInput.startsWith('#') ? customColorInput : `#${customColorInput}`}
                    onChange={(e) => handleApplyCustomColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border-0 cursor-pointer p-0 bg-transparent block"
                    title="কালার নির্বাচন করুন"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={customColorInput}
                    onChange={(e) => {
                      setCustomColorInput(e.target.value);
                      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                        handleApplyCustomColor(e.target.value);
                      }
                    }}
                    placeholder="#0F5F62"
                    maxLength={7}
                    className="w-full font-mono text-xs font-bold text-[#10235A] dark:text-white uppercase bg-transparent outline-none focus:ring-0"
                  />
                  <span className="text-[9px] text-[#6B7280] dark:text-slate-400 block">
                    CSS Token: --theme-primary
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyCustomColor(customColorInput)}
                  className="px-3 py-1.5 rounded-lg bg-[#21409A] hover:bg-[#10235A] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  প্রয়োগ
                </button>
              </div>

              {/* Quick Preset Palette Swatches */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {[
                  { name: 'Teal', hex: '#0F5F62' },
                  { name: 'Sapphire', hex: '#21409A' },
                  { name: 'Emerald', hex: '#047857' },
                  { name: 'Forest', hex: '#15803D' },
                  { name: 'Sky', hex: '#0284C7' },
                  { name: 'Indigo', hex: '#4F46E5' },
                  { name: 'Purple', hex: '#7C3AED' },
                  { name: 'Rose', hex: '#9D174D' },
                  { name: 'Amber', hex: '#B45309' },
                  { name: 'Coffee', hex: '#78350F' },
                ].map((swatch) => (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => handleApplyCustomColor(swatch.hex)}
                    title={swatch.name}
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-[#0C152E] shadow-2xs hover:scale-110 active:scale-95 transition-transform cursor-pointer relative"
                    style={{ backgroundColor: swatch.hex }}
                  >
                    {customColorInput.toLowerCase() === swatch.hex.toLowerCase() && preferences.colorTheme === 'custom' && (
                      <span className="absolute inset-0 flex items-center justify-center text-white text-[10px]">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. ACCESSIBILITY SETTINGS (Full Accessibility Support) */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#1C2D5A]">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />
              <label className="font-bold text-[#10235A] dark:text-white block">
                এক্সেসিবিলিটি সহায়তা (Accessibility)
              </label>
            </div>

            {/* Reduce Motion Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#142042] border border-[#E7D9DE]/80 dark:border-[#1C2D5A]">
              <div>
                <span className="font-bold text-[#10235A] dark:text-white block">
                  মোশন কমান (Reduce Motion)
                </span>
                <span className="text-[10px] text-[#6B7280] dark:text-slate-400">
                  অ্যানিমেশন ও ট্রানজিশন শান্ত ও স্থির রাখুন
                </span>
              </div>
              <button
                onClick={() => {
                  triggerHaptic(10);
                  onUpdatePreferences({ reducedMotion: !preferences.reducedMotion });
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer min-h-[24px] ${
                  preferences.reducedMotion ? 'bg-[#21409A]' : 'bg-[#E7D9DE] dark:bg-slate-700'
                }`}
                aria-label="Toggle Reduce Motion"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                    preferences.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#142042] border border-[#E7D9DE]/80 dark:border-[#1C2D5A]">
              <div>
                <span className="font-bold text-[#10235A] dark:text-white block">
                  হাই কনট্রাস্ট (High Contrast)
                </span>
                <span className="text-[10px] text-[#6B7280] dark:text-slate-400">
                  দৃষ্টি সুবিধার জন্য হরফ ও বর্ডারে স্পষ্ট বৈসাদৃশ্য
                </span>
              </div>
              <button
                onClick={() => {
                  triggerHaptic(10);
                  onUpdatePreferences({ highContrast: !preferences.highContrast });
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer min-h-[24px] ${
                  preferences.highContrast ? 'bg-[#21409A]' : 'bg-[#E7D9DE] dark:bg-slate-700'
                }`}
                aria-label="Toggle High Contrast"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                    preferences.highContrast ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Large Font Mode */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#142042] border border-[#E7D9DE]/80 dark:border-[#1C2D5A]">
              <div>
                <span className="font-bold text-[#10235A] dark:text-white block">
                  বড় ফন্ট মোড (Large Font Mode)
                </span>
                <span className="text-[10px] text-[#6B7280] dark:text-slate-400">
                  সহজে পড়ার জন্য সকল লেখার আকার বড় করুন
                </span>
              </div>
              <button
                onClick={() => {
                  triggerHaptic(10);
                  onUpdatePreferences({ largeFontMode: !preferences.largeFontMode });
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer min-h-[24px] ${
                  preferences.largeFontMode ? 'bg-[#21409A]' : 'bg-[#E7D9DE] dark:bg-slate-700'
                }`}
                aria-label="Toggle Large Font Mode"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                    preferences.largeFontMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Bottom Nav Bar Safe Clearance Selector */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#142042] border border-[#E7D9DE]/80 dark:border-[#1C2D5A] space-y-1.5">
              <div>
                <span className="font-bold text-[#10235A] dark:text-white block text-xs">
                  নিচের নেভিগেশন বার ফাঁকা (Bottom Nav Clearance)
                </span>
                <span className="text-[10px] text-[#6B7280] dark:text-slate-400">
                  ফোনের ৩-বাটন বা জেসচার বারের জন্য স্বয়ংক্রিয় ফাঁকা মার্জিন
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[
                  { id: 'auto', labelBn: 'অটো', subBn: 'স্ক্রিন অনুযায়ী' },
                  { id: 'standard', labelBn: 'সাধারণ', subBn: 'স্ট্যান্ডার্ড' },
                  { id: 'extra', labelBn: 'অতিরিক্ত', subBn: '৩-বাটন নেভ' },
                  { id: 'compact', labelBn: 'কমপ্যাক্ট', subBn: 'ছোট মার্জিন' },
                ].map((opt) => {
                  const isCur = (preferences.bottomNavSpacing || 'auto') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic(10);
                        onUpdatePreferences({ bottomNavSpacing: opt.id as any });
                      }}
                      className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                        isCur
                          ? 'bg-[#0F5F62] text-white border-[#0F5F62] shadow-xs'
                          : 'bg-[#F3FAF9] dark:bg-[#10235A] text-[#123234] dark:text-slate-300 border-[#E7D9DE] dark:border-[#1C2D5A]'
                      }`}
                    >
                      <span className="text-[10px] font-bold block leading-tight">{opt.labelBn}</span>
                      <span className={`text-[8px] block ${isCur ? 'text-teal-100' : 'text-slate-500'}`}>{opt.subBn}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. USER PROFILE & GENDER */}
          <div className="space-y-2 p-3 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#1C2D5A]">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#10235A] dark:text-white flex items-center gap-1.5 text-xs">
                <User className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
                <span>{t.gender || 'ব্যবহারকারীর পরিচয় (Gender)'}</span>
              </label>
              {onOpenGenderSelection && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    onOpenGenderSelection();
                  }}
                  className="text-[11px] text-[#21409A] dark:text-[#E9B7C3] font-semibold hover:underline cursor-pointer"
                >
                  বিস্তারিত পর্দা খুলুন →
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  onUpdatePreferences({ gender: 'male' });
                  try {
                    localStorage.setItem('noor_quran_user_gender', 'male');
                  } catch {
                    // ignore
                  }
                }}
                className={`min-h-[44px] p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  preferences.gender === 'male'
                    ? 'bg-[#21409A] text-white border-[#21409A] shadow-xs'
                    : 'bg-white dark:bg-[#142042] border-[#E7D9DE] dark:border-[#24386E] text-[#10235A] dark:text-slate-300'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{t.genderMale || 'পুরুষ (Male)'}</span>
                {preferences.gender === 'male' && <Check className="w-3.5 h-3.5 ml-1" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  onUpdatePreferences({ gender: 'female' });
                  try {
                    localStorage.setItem('noor_quran_user_gender', 'female');
                  } catch {
                    // ignore
                  }
                }}
                className={`min-h-[44px] p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  preferences.gender === 'female'
                    ? 'bg-[#21409A] text-white border-[#21409A] shadow-xs'
                    : 'bg-white dark:bg-[#142042] border-[#E7D9DE] dark:border-[#24386E] text-[#10235A] dark:text-slate-300'
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-current text-white" />
                <span>{t.genderFemale || 'মহিলা (Female)'}</span>
                {preferences.gender === 'female' && <Check className="w-3.5 h-3.5 ml-1" />}
              </button>
            </div>

            <p className="text-[11px] text-[#6B7280] dark:text-slate-400 leading-snug pt-0.5">
              {preferences.gender === 'female'
                ? 'মহিলা প্রোফাইল সক্রিয়: হোমস্ক্রিন ও মেন্যুতে Period Tracker দৃশ্যমান থাকবে।'
                : 'পুরুষ প্রোফাইল সক্রিয়: জামাত সালাত, হাদিস ও আমল ট্র্যাকার প্রস্তুত (Period Tracker থাকবে না)।'}
            </p>
          </div>

          {/* 4. LANGUAGE SETTINGS */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#1C2D5A]">
            <label className="font-bold text-[#10235A] dark:text-white block">
              {t.language}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => onChangeLanguage('bn')}
                className={`min-h-[44px] p-2 rounded-xl border text-center font-bold transition-colors cursor-pointer ${
                  language === 'bn'
                    ? 'bg-[#21409A] text-white border-[#21409A]'
                    : 'bg-white dark:bg-[#142042] border-[#E7D9DE] dark:border-[#24386E] text-[#10235A] dark:text-slate-300'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => onChangeLanguage('ar')}
                className={`min-h-[44px] p-2 rounded-xl border text-center font-arabic font-bold transition-colors cursor-pointer ${
                  language === 'ar'
                    ? 'bg-[#21409A] text-white border-[#21409A]'
                    : 'bg-white dark:bg-[#142042] border-[#E7D9DE] dark:border-[#24386E] text-[#10235A] dark:text-slate-300'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => onChangeLanguage('en')}
                className={`min-h-[44px] p-2 rounded-xl border text-center font-bold transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#21409A] text-white border-[#21409A]'
                    : 'bg-white dark:bg-[#142042] border-[#E7D9DE] dark:border-[#24386E] text-[#10235A] dark:text-slate-300'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* 5. RAMADAN MODE TOGGLE */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8E8ED] dark:bg-[#10235A]/60 border border-[#E7D9DE] dark:border-[#24386E]">
            <div>
              <span className="font-bold text-[#10235A] dark:text-white block">
                {t.ramadanMode}
              </span>
              <span className="text-[10px] text-[#6B7280] dark:text-slate-300">
                হোমস্ক্রিনে সাহরি ও ইফতার কাউন্টার বিশেষ গুরুত্ব পাবে
              </span>
            </div>
            <button
              onClick={() => onUpdatePreferences({ ramadanMode: !preferences.ramadanMode })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer min-h-[24px] ${
                preferences.ramadanMode ? 'bg-[#21409A]' : 'bg-[#E7D9DE] dark:bg-slate-700'
              }`}
              aria-label="Toggle Ramadan Mode"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                  preferences.ramadanMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 6. ARABIC FONT SELECTOR */}
          <div className="space-y-2 p-3 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#1C2D5A]">
            <span className="font-bold text-[#10235A] dark:text-white block text-xs">
              আরবি কুরআন ফন্ট নির্বাচন (Arabic Quran Font)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
              {[
                { id: 'noto-naskh', name: 'নাসখ - স্পষ্ট হরকত (Noto Naskh) [প্রস্তাবিত]', preview: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ', fontClass: 'font-arabic-noto-naskh' },
                { id: 'scheherazade', name: 'শাহারাজাদ (Scheherazade)', preview: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ', fontClass: 'font-arabic-scheherazade' },
                { id: 'amiri-quran', name: 'উসমানি কুরআন (Amiri)', preview: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ', fontClass: 'font-arabic-amiri-quran' },
                { id: 'noto-nastaliq', name: 'নূরানী / নাস্তালিক (Nastaliq)', preview: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ', fontClass: 'font-arabic-noto-nastaliq' },
                { id: 'amiri', name: 'ক্লাসিক আমিরি (Amiri)', preview: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ', fontClass: 'font-arabic-amiri' },
                { id: 'lateef', name: 'লতিফ লিপি (Lateef)', preview: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ', fontClass: 'font-arabic-lateef' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    triggerHaptic(15);
                    onUpdatePreferences({ arabicFont: f.id as any });
                  }}
                  className={`min-h-[44px] p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    (preferences.arabicFont || 'noto-naskh') === f.id
                      ? 'bg-[#F8E8ED] dark:bg-[#1C2D5A] border-[#21409A] text-[#10235A] dark:text-white font-bold shadow-2xs'
                      : 'bg-white dark:bg-[#142042] border-[#E7D9DE] dark:border-[#24386E] text-[#1F2937] dark:text-slate-300 hover:border-[#21409A]/40'
                  }`}
                >
                  <span className="text-[11px] font-semibold block">{f.name}</span>
                  <span className={`${f.fontClass} text-base font-bold text-right block mt-1 text-[#10235A] dark:text-white`} dir="rtl">
                    {f.preview}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 7. SOUND & HAPTICS */}
          <div className="space-y-2 p-3 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#1C2D5A]">
            <div className="flex items-center justify-between min-h-[36px]">
              <span className="text-[#10235A] dark:text-slate-200 font-medium">শব্দ / সাউন্ড এফেক্ট</span>
              <input
                type="checkbox"
                checked={preferences.soundEnabled}
                onChange={(e) => onUpdatePreferences({ soundEnabled: e.target.checked })}
                className="accent-[#21409A] w-5 h-5 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between min-h-[36px]">
              <span className="text-[#10235A] dark:text-slate-200 font-medium">ট্যাকটাইল ভাইব্রেশন (কম্পন)</span>
              <input
                type="checkbox"
                checked={preferences.vibrationEnabled}
                onChange={(e) => onUpdatePreferences({ vibrationEnabled: e.target.checked })}
                className="accent-[#21409A] w-5 h-5 cursor-pointer"
              />
            </div>
          </div>

          {/* 8. PRAYER TIME NOTIFICATIONS & ADHAN REMINDERS */}
          <div className="space-y-3 p-3.5 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#1C2D5A]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#21409A]/10 dark:bg-[#E9B7C3]/20 text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <label className="font-bold text-[#10235A] dark:text-white block text-xs">
                    নামাজের ওয়াক্ত ও আযান নোটিফিকেশন
                  </label>
                  <p className="text-[10px] text-[#6B7280] dark:text-slate-400">
                    ফোনে প্রতিটি সালাতের রিমাইন্ডার ও আযান সতর্কতা
                  </p>
                </div>
              </div>

              {/* Master Switch */}
              <button
                onClick={handleToggleMasterNotification}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer min-h-[24px] ${
                  notifSettings.enabled ? 'bg-[#21409A]' : 'bg-[#E7D9DE] dark:bg-slate-700'
                }`}
                aria-label="Toggle Master Notification"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                    notifSettings.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Permission Status Box */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#24386E] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-[#10235A] dark:text-white flex items-center gap-1.5">
                  <span className="text-xs">📱</span>
                  <span>ফোনের অনুমতি (Phone Permission):</span>
                </span>
                {permStatus === 'granted' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/30">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>অনুমতি সক্রিয় (Allowed)</span>
                  </span>
                ) : permStatus === 'denied' ? (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 font-bold text-[10px] flex items-center gap-1 border border-red-500/30">
                    <AlertCircle className="w-3 h-3 stroke-[2.5]" />
                    <span>ব্লক করা (Blocked)</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center gap-1 border border-amber-500/30">
                    <span>অনুমতি প্রয়োজন</span>
                  </span>
                )}
              </div>

              {permStatus === 'denied' && (
                <p className="text-[10px] text-red-600 dark:text-red-400 leading-snug">
                  ⚠️ আপনার ব্রাউজারে নোটিফিকেশন পারমিশন বন্ধ আছে। অ্যাড্রেস বারের সাইট সেটিংস আইকনে ক্লিক করে Notifications ‘Allow’ করে দিন।
                </p>
              )}

              {permStatus !== 'granted' && permStatus !== 'unsupported' && (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="w-full py-2 px-3 rounded-xl bg-[#21409A] hover:bg-[#10235A] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors min-h-[38px]"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>নোটিফিকেশন অনুমতি দিন (Enable Notification)</span>
                </button>
              )}

              {permStatus === 'granted' && (
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E7D9DE]/60 dark:border-[#24386E]/60">
                  <span className="text-[10px] text-[#6B7280] dark:text-slate-400">
                    ফোনে পরীক্ষা করে দেখতে পারেন:
                  </span>
                  <button
                    type="button"
                    onClick={handleSendTestNotification}
                    disabled={isSendingTest}
                    className="py-1 px-2.5 rounded-lg bg-[#F8E8ED] hover:bg-[#E9B7C3]/30 dark:bg-[#1C2D5A] dark:hover:bg-[#24386E] text-[#21409A] dark:text-[#E9B7C3] font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors border border-[#E7D9DE] dark:border-[#24386E]"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSendingTest ? 'পাঠানো হচ্ছে...' : 'টেস্ট নোটিফিকেশন'}</span>
                  </button>
                </div>
              )}

              {testFeedback && (
                <p className="text-[10px] font-semibold text-[#21409A] dark:text-[#E9B7C3] bg-[#F8E8ED] dark:bg-[#10235A] p-2 rounded-lg leading-tight">
                  {testFeedback}
                </p>
              )}
            </div>

            {/* If master switch is ON, show detailed options */}
            {notifSettings.enabled && (
              <div className="space-y-3 pt-1">
                {/* 1. Reminder Offset Timing */}
                <div className="space-y-1.5 p-2.5 rounded-xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#24386E]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
                    <span className="font-bold text-[#10235A] dark:text-white text-[11px]">
                      কখন নোটিফিকেশন দেওয়া হবে? (Reminder Timing)
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {[
                      { mins: 0, labelBn: 'ঠিক ওয়াক্তে', subBn: 'Exact' },
                      { mins: 5, labelBn: '৫ মিনিট আগে', subBn: '5m Before' },
                      { mins: 10, labelBn: '১০ মিনিট আগে', subBn: '10m Before' },
                      { mins: 15, labelBn: '১৫ মিনিট আগে', subBn: '15m Before' },
                    ].map((opt) => {
                      const isSel = notifSettings.reminderOffsetMinutes === opt.mins;
                      return (
                        <button
                          key={opt.mins}
                          type="button"
                          onClick={() => handleChangeOffset(opt.mins)}
                          className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                            isSel
                              ? 'bg-[#21409A] text-white border-[#21409A] shadow-xs'
                              : 'bg-[#FCFAF8] dark:bg-[#10235A] text-[#10235A] dark:text-slate-300 border-[#E7D9DE] dark:border-[#24386E]'
                          }`}
                        >
                          <span className="text-[10px] font-bold block leading-tight">{opt.labelBn}</span>
                          <span className={`text-[8px] block ${isSel ? 'text-white/80' : 'text-slate-400'}`}>
                            {opt.subBn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Adhan Tone & Haptics Option */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#24386E]">
                  <div>
                    <span className="font-bold text-[#10235A] dark:text-white block text-xs">
                      আযান সুর ও কম্পন (Adhan Tone & Vibrate)
                    </span>
                    <span className="text-[10px] text-[#6B7280] dark:text-slate-400">
                      নোটিফিকেশনের সাথে সুন্দর আযান সুর ও কম্পন বাজান
                    </span>
                  </div>
                  <button
                    onClick={handleToggleAdhanTone}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer min-h-[24px] ${
                      notifSettings.adhanToneEnabled ? 'bg-[#21409A]' : 'bg-[#E7D9DE] dark:bg-slate-700'
                    }`}
                    aria-label="Toggle Adhan Tone"
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                        notifSettings.adhanToneEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Individual Prayer Reminders */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#10235A] dark:text-white text-xs">
                      ওয়াক্তভিত্তিক নোটিফিকেশন তালিকা (Prayer Waqt Toggles):
                    </span>
                    <span className="text-[10px] text-[#6B7280] dark:text-slate-400">
                      পছন্দমতো অন/অফ করুন
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {[
                      {
                        key: 'fajr' as const,
                        nameBn: 'ফজর (Fajr)',
                        meaningBn: 'সুবহে সাদিক ও ভোরের সালাত',
                        badge: 'ফরজ',
                      },
                      {
                        key: 'sunrise' as const,
                        nameBn: 'সূর্যোদয় ও ইশরাক (Sunrise / Ishraq)',
                        meaningBn: 'সূর্যোদয় সম্পন্ন ও নফল সালাতের প্রস্তুতি',
                        badge: 'নফল',
                      },
                      {
                        key: 'dhuhr' as const,
                        nameBn: "যোহর ও জুমু'আ (Dhuhr / Jumuah)",
                        meaningBn: "দুপুরের সালাত ও শুক্রবার জুমু'আ",
                        badge: 'ফরজ',
                      },
                      {
                        key: 'asr' as const,
                        nameBn: 'আসর (Asr)',
                        meaningBn: 'বিকেলের সালাত (সালাতুল উসতা)',
                        badge: 'ফরজ',
                      },
                      {
                        key: 'maghrib' as const,
                        nameBn: 'মাগরিব ও ইফতার (Maghrib & Iftar)',
                        meaningBn: 'সূর্যাস্ত, ইফতার ও সন্ধ্যার সালাত',
                        badge: 'ফরজ',
                      },
                      {
                        key: 'isha' as const,
                        nameBn: 'ইশা ও বিতর (Isha & Witr)',
                        meaningBn: 'রাতের সালাত ও বিতর',
                        badge: 'ফরজ',
                      },
                      {
                        key: 'tahajjud' as const,
                        nameBn: 'তাহাজ্জুদ ও সাহরি (Tahajjud & Sahri)',
                        meaningBn: 'রাতের শেষ তৃতীয়াংশের কিয়ামুল লাইল',
                        badge: 'নফল/সুন্নাহ',
                      },
                    ].map((item) => {
                      const isEnabled = notifSettings.prayers[item.key];
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#142042] border border-[#E7D9DE]/80 dark:border-[#24386E]/80 hover:border-[#21409A]/40 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                                isEnabled
                                  ? 'bg-[#21409A] text-white shadow-xs'
                                  : 'bg-[#E7D9DE] dark:bg-slate-700 text-[#6B7280] dark:text-slate-400'
                              }`}
                            >
                              {isEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#10235A] dark:text-white text-xs truncate">
                                  {item.nameBn}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#F8E8ED] dark:bg-[#1C2D5A] text-[#21409A] dark:text-[#E9B7C3] font-semibold shrink-0">
                                  {item.badge}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#6B7280] dark:text-slate-400 block truncate">
                                {item.meaningBn}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleTogglePrayer(item.key)}
                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer min-h-[24px] shrink-0 ml-2 ${
                              isEnabled ? 'bg-[#21409A]' : 'bg-[#E7D9DE] dark:bg-slate-700'
                            }`}
                            aria-label={`Toggle ${item.nameBn}`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                                isEnabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* 8. OFFLINE MODE STATUS CARD */}
          <div className="p-3.5 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#1C2D5A] space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0F5F62]/10 dark:bg-[#B9E2DD]/20 text-[#0F5F62] dark:text-[#B9E2DD] flex items-center justify-center">
                  <WifiOff className="w-4 h-4" />
                </div>
                <span className="font-bold text-[#10235A] dark:text-white">অফলাইন মোড (Offline Mode)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/30">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>সক্রিয় ও প্রস্তুত</span>
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] dark:text-[#B2D8D4] leading-relaxed font-bengali">
              অ্যাপের প্রতিটি ফিচার—কুরআন ও মুসহাফ পৃষ্ঠা, ৫ ওয়াক্ত নামাজ ও নফল সময়সূচি, কিবলা কম্পাস, ডিজিটাল তাসবীহ (কাস্টম তালিকা সহ), রুকইয়াহ শারইয়াহ, সহিহ হাদিস, দৈনন্দিন দোয়া, জরুরি মাসআলা, সালাত গাইড এবং পিরিয়ড ট্র্যাকার—ইন্টারনেট ছাড়াও ১০০% অফলাইনে সম্পূর্ণ সচল। শুধু অডিও তিলাওয়াত অনলাইন স্ট্রিমিংয়ের জন্য ইন্টারনেট প্রয়োজন।
            </p>
          </div>


          {/* 9. DATA BACKUP & WIPE */}
          <div className="pt-2 border-t border-[#E7D9DE] dark:border-[#1C2D5A] space-y-2">
            {/* Replay Splash / Logo Motion Graphics */}
            {onReplaySplash && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  onReplaySplash();
                  onClose();
                }}
                className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-[#F8E8ED] dark:bg-[#1C2D5A] hover:bg-[#E9B7C3]/30 text-[#21409A] dark:text-[#E9B7C3] border border-[#E7D9DE] dark:border-[#24386E] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />
                <span>লোগো ও সূচনা মোশন গ্রাফিক্স দেখুন</span>
              </button>
            )}

            {/* Outline CTA */}
            <button
              onClick={handleExportBackup}
              className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-transparent border border-[#21409A] text-[#21409A] dark:text-[#E9B7C3] dark:border-[#E9B7C3]/40 hover:bg-[#F8E8ED] dark:hover:bg-[#142042] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>ব্যাকআপ ডাউনলোড করুন</span>
            </button>

            {/* Muted Deep Red Destructive Action */}
            <button
              onClick={() => {
                if (confirm('আপনি কি নিশ্চিত যে সমস্ত ডেটা ও সেটিংস রিসেট করতে চান?')) {
                  onResetAllData();
                  onClose();
                }
              }}
              className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-[#991B1B]/10 hover:bg-[#991B1B]/20 text-[#991B1B] dark:text-red-300 border border-[#991B1B]/30 font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>সকল ডেটা ফ্যাক্টরি রিসেট করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
