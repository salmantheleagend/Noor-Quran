import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, ColorTheme } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  RotateCcw,
  Sparkles,
  Target,
  AlertTriangle,
  Volume2,
  VolumeX,
  Vibrate,
  BookOpen,
  Award,
  Plus,
  Check,
  TrendingUp,
  History,
  Edit3,
  Trash2,
  Tag,
} from 'lucide-react';
import { playTasbeehClick, triggerHaptic } from '../utils/audioPlayer';

export interface TasbeehPreset {
  id: string;
  nameBn: string;
  nameEn?: string;
  nameAr: string;
  meaningBn: string;
  meaningEn?: string;
  defaultTarget: number;
  category?: string;
  categoryLabel?: string;
  categoryLabelEn?: string;
  isCustom?: boolean;
}

export const DEFAULT_PRESETS: TasbeehPreset[] = [
  {
    id: 'istighfar',
    nameBn: 'আস্তাগফিরুল্লাহ',
    nameEn: 'Astaghfirullah',
    nameAr: 'أَسْتَغْفِرُ اللَّهَ',
    meaningBn: 'আমি আল্লাহর কাছে ক্ষমা প্রার্থনা করছি — গুনাহ মোচন ও রিজিক বৃদ্ধির শ্রেষ্ঠ আমল',
    meaningEn: 'I seek forgiveness from Allah — seeking pardon and blessings',
    defaultTarget: 100,
    category: 'istighfar',
    categoryLabel: 'ইস্তিগফার ও তওবা',
    categoryLabelEn: 'Istighfar & Repentance',
  },
  {
    id: 'subhanallah',
    nameBn: 'সুবহানাল্লাহ',
    nameEn: 'SubhanAllah',
    nameAr: 'سُبْحَانَ اللَّهِ',
    meaningBn: 'আল্লাহ অতি পবিত্র ও সকল ত্রুটি থেকে মুক্ত',
    meaningEn: 'Glory be to Allah, free from all imperfections',
    defaultTarget: 33,
    category: 'daily',
    categoryLabel: 'দৈনিক তাসবীহ',
    categoryLabelEn: 'Daily Tasbeeh',
  },
  {
    id: 'alhamdulillah',
    nameBn: 'আলহামদুলিল্লাহ',
    nameEn: 'Alhamdulillah',
    nameAr: 'الْحَمْدُ لِلَّهِ',
    meaningBn: 'সকল প্রশংসা এবং কৃতজ্ঞতা একমাত্র আল্লাহর জন্য',
    meaningEn: 'All praise and gratitude belong exclusively to Allah',
    defaultTarget: 33,
    category: 'daily',
    categoryLabel: 'দৈনিক তাসবীহ',
    categoryLabelEn: 'Daily Tasbeeh',
  },
  {
    id: 'allahuakbar',
    nameBn: 'আল্লাহু আকবার',
    nameEn: 'Allahu Akbar',
    nameAr: 'اللَّهُ أَكْبَرُ',
    meaningBn: 'আল্লাহ সর্বশ্রেষ্ঠ, সবচেয়ে মহান ও পরাক্রমশালী',
    meaningEn: 'Allah is the Greatest, most exalted and mighty',
    defaultTarget: 34,
    category: 'daily',
    categoryLabel: 'দৈনিক তাসবীহ',
    categoryLabelEn: 'Daily Tasbeeh',
  },
  {
    id: 'tahlil',
    nameBn: 'লা ইলাহা ইল্লাল্লাহ',
    nameEn: 'La Ilaha Illallah',
    nameAr: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    meaningBn: 'আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই — সর্বোত্তম জিকির ও কালেমায়ে তাওহিদ',
    meaningEn: 'There is no god but Allah — the supreme phrase of monotheism',
    defaultTarget: 100,
    category: 'daily',
    categoryLabel: 'দৈনিক তাসবীহ',
    categoryLabelEn: 'Daily Tasbeeh',
  },
  {
    id: 'darood',
    nameBn: 'দুরুদ শরিফ (সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম)',
    nameEn: 'Salawat (Sallallahu Alayhi Wasallam)',
    nameAr: 'صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ',
    meaningBn: 'আল্লাহ তাঁর প্রিয় রাসূল (সা.)-এর ওপর রহমত ও শান্তি বর্ষণ করুন',
    meaningEn: 'May Allah send peace and blessings upon His beloved Messenger',
    defaultTarget: 100,
    category: 'salawat',
    categoryLabel: 'দুরুদ ও সালাওয়াত',
    categoryLabelEn: 'Salawat & Blessings',
  },
  {
    id: 'hawqala',
    nameBn: 'লা হাওলা ওয়ালা কুওয়াতা...',
    nameEn: 'La Hawla Wa La Quwwata...',
    nameAr: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    meaningBn: 'আল্লাহর সাহায্য ছাড়া অনিষ্ট থেকে বাঁচার এবং সৎকাজ করার কোনো শক্তি নেই (জান্নাতের গুপ্তধন)',
    meaningEn: 'There is no power nor strength except with Allah (a treasure of Paradise)',
    defaultTarget: 100,
    category: 'daily',
    categoryLabel: 'দৈনিক তাসবীহ',
    categoryLabelEn: 'Daily Tasbeeh',
  },
  {
    id: 'hasbunallah',
    nameBn: 'হাসবুনাল্লাহু ওয়া নি\'মাল ওয়াকিল',
    nameEn: 'Hasbunallahu Wa Ni\'mal Wakeel',
    nameAr: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    meaningBn: 'আল্লাহই আমাদের জন্য যথেষ্ট এবং তিনি সর্বোত্তম অভিভাবক ও কার্যনির্বাহী',
    meaningEn: 'Sufficient for us is Allah, and He is the best Disposer of affairs',
    defaultTarget: 100,
    category: 'quranic',
    categoryLabel: 'কুরআনী দোয়া',
    categoryLabelEn: 'Quranic Supplications',
  },
  {
    id: 'tasbeeh_tamhid',
    nameBn: 'সুবহানাল্লাহি ওয়া বিহামদিহি...',
    nameEn: 'SubhanAllahi Wa Bihamdihi...',
    nameAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
    meaningBn: 'আল্লাহর প্রশংসাসহ পবিত্রতা ঘোষণা করছি, মহান আল্লাহর পবিত্রতা ঘোষণা করছি',
    meaningEn: 'Glory be to Allah and His praise, glory be to Allah the Almighty',
    defaultTarget: 100,
    category: 'daily',
    categoryLabel: 'দৈনিক তাসবীহ',
    categoryLabelEn: 'Daily Tasbeeh',
  },
  {
    id: 'yunus',
    nameBn: 'দোয়া ইউনুস (লা ইলাহা ইল্লা আনতা...)',
    nameEn: 'Dua of Yunus (La Ilaha Illa Anta...)',
    nameAr: 'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
    meaningBn: 'আপনি ছাড়া কোনো উপাস্য নেই, আপনি পবিত্র; নিশ্চয়ই আমি অবিচারকারীদের অন্তর্ভুক্ত',
    meaningEn: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers',
    defaultTarget: 100,
    category: 'quranic',
    categoryLabel: 'কুরআনী দোয়া',
    categoryLabelEn: 'Quranic Supplications',
  },
];

// Helper to convert English digits to Bengali digits with commas
export const toBnNumber = (num: number): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const formatted = num.toLocaleString('en-US');
  return formatted.replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
};

export const formatDhikrNumber = (num: number, lang: AppLanguage = 'bn'): string => {
  return lang === 'bn' ? toBnNumber(num) : num.toLocaleString('en-US');
};

interface TasbeehCounterProps {
  language: AppLanguage;
  activeTasbeehDhikr: string;
  onChangeDhikr: (dhikrId: string) => void;
  tasbeehCounts: Record<string, number>;
  tasbeehLifetimeCounts: Record<string, number>;
  onUpdateCount: (dhikrId: string, sessionCount: number, lifetimeDelta?: number) => void;
  onSetLifetimeCount?: (dhikrId: string, exactCount: number) => void;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  onToggleSound?: () => void;
  onToggleVibration?: () => void;
  colorTheme?: ColorTheme;
  customDhikrs?: TasbeehPreset[];
  onAddCustomDhikr?: (dhikr: TasbeehPreset) => void;
  onDeleteCustomDhikr?: (dhikrId: string) => void;
}

export const TasbeehCounter: React.FC<TasbeehCounterProps> = ({
  language,
  activeTasbeehDhikr,
  onChangeDhikr,
  tasbeehCounts,
  tasbeehLifetimeCounts,
  onUpdateCount,
  onSetLifetimeCount,
  soundEnabled,
  vibrationEnabled,
  onToggleSound,
  onToggleVibration,
  colorTheme = 'sapphire',
  customDhikrs = [],
  onAddCustomDhikr,
  onDeleteCustomDhikr,
}) => {
  const t = TRANSLATIONS[language];
  const [activeView, setActiveView] = useState<'counter' | 'records'>('counter');
  const [selectedTarget, setSelectedTarget] = useState<number>(33);
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmResetDhikr, setConfirmResetDhikr] = useState<TasbeehPreset | null>(null);
  const [manualAddModalDhikr, setManualAddModalDhikr] = useState<TasbeehPreset | null>(null);
  const [manualAddAmount, setManualAddAmount] = useState<string>('100');

  // Custom Dhikr creation state
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [newDhikrAr, setNewDhikrAr] = useState('');
  const [newDhikrBn, setNewDhikrBn] = useState('');
  const [newDhikrMeaning, setNewDhikrMeaning] = useState('');
  const [newDhikrTarget, setNewDhikrTarget] = useState<number>(100);
  const [newDhikrCustomTargetInput, setNewDhikrCustomTargetInput] = useState<string>('');
  const [newDhikrCategory, setNewDhikrCategory] = useState<string>('custom');
  const [newDhikrCategoryLabel, setNewDhikrCategoryLabel] = useState<string>('কাস্টম তালিকা');
  const [newDhikrCustomCategoryLabel, setNewDhikrCustomCategoryLabel] = useState<string>('');

  // Category Filter for Dhikr List
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Combine default presets and user custom presets
  const allPresets: TasbeehPreset[] = [...DEFAULT_PRESETS, ...customDhikrs];

  const currentPreset = allPresets.find((p) => p.id === activeTasbeehDhikr) || allPresets[0];
  const sessionCount = tasbeehCounts[currentPreset.id] || 0;
  const lifetimeCount = tasbeehLifetimeCounts[currentPreset.id] || 0;

  // Handle single tap on the interactive circular dial
  const handleTap = () => {
    const nextSessionCount = sessionCount + 1;
    // Increments session count AND adds 1 to permanent lifetime record
    onUpdateCount(currentPreset.id, nextSessionCount, 1);

    if (vibrationEnabled) {
      if (nextSessionCount % selectedTarget === 0) {
        triggerHaptic(70);
      } else {
        triggerHaptic(20);
      }
    }

    if (soundEnabled) {
      playTasbeehClick();
    }
  };

  // Reset ONLY current session count, keeping lifetime record safe
  const handleConfirmResetSession = () => {
    triggerHaptic(25);
    onUpdateCount(currentPreset.id, 0, 0); // lifetimeDelta is 0, so lifetime is preserved!
    setShowResetModal(false);
  };

  // Reset INDIVIDUAL LIFETIME GRAND TOTAL for a dhikr (user request)
  const handleConfirmResetLifetime = (dhikrId: string) => {
    triggerHaptic(35);
    if (onSetLifetimeCount) {
      onSetLifetimeCount(dhikrId, 0);
    }
    // Also reset session count for this dhikr
    onUpdateCount(dhikrId, 0, 0);
    setShowResetModal(false);
    setConfirmResetDhikr(null);
  };

  // Delete custom dhikr
  const handleDeleteCustom = (dhikrId: string) => {
    triggerHaptic(25);
    if (onDeleteCustomDhikr) {
      onDeleteCustomDhikr(dhikrId);
    }
  };

  // Manual addition to lifetime tally (e.g. from manual beads)
  const handleConfirmManualAdd = () => {
    if (!manualAddModalDhikr) return;
    const addVal = parseInt(manualAddAmount, 10);
    if (!isNaN(addVal) && addVal > 0) {
      triggerHaptic(25);
      const currentLife = tasbeehLifetimeCounts[manualAddModalDhikr.id] || 0;
      if (onSetLifetimeCount) {
        onSetLifetimeCount(manualAddModalDhikr.id, currentLife + addVal);
      } else {
        onUpdateCount(manualAddModalDhikr.id, sessionCount, addVal);
      }
    }
    setManualAddModalDhikr(null);
    setManualAddAmount('100');
  };

  // Create custom dhikr with specific target counts and unique category labels
  const handleSaveCustomDhikr = () => {
    if (!newDhikrBn.trim()) return;

    let targetCount = newDhikrTarget;
    if (newDhikrCustomTargetInput.trim()) {
      const parsed = parseInt(newDhikrCustomTargetInput, 10);
      if (!isNaN(parsed) && parsed > 0) {
        targetCount = parsed;
      }
    }
    if (targetCount <= 0) targetCount = 100;

    let catLabel = newDhikrCategoryLabel;
    if (newDhikrCustomCategoryLabel.trim()) {
      catLabel = newDhikrCustomCategoryLabel.trim();
    }

    const customId = 'custom_' + Date.now();
    const newPreset: TasbeehPreset = {
      id: customId,
      nameBn: newDhikrBn.trim(),
      nameAr: newDhikrAr.trim() || 'ذِكْرُ اللّٰهِ',
      meaningBn: newDhikrMeaning.trim() || 'আল্লাহর পবিত্র স্মরণ ও নেক আমল',
      defaultTarget: targetCount,
      category: newDhikrCategory || 'custom',
      categoryLabel: catLabel,
      isCustom: true,
    };

    if (onAddCustomDhikr) {
      onAddCustomDhikr(newPreset);
    }
    onChangeDhikr(customId);
    setSelectedTarget(targetCount);
    setShowAddCustomModal(false);

    // Reset fields
    setNewDhikrAr('');
    setNewDhikrBn('');
    setNewDhikrMeaning('');
    setNewDhikrTarget(100);
    setNewDhikrCustomTargetInput('');
    setNewDhikrCategory('custom');
    setNewDhikrCategoryLabel('কাস্টম তালিকা');
    setNewDhikrCustomCategoryLabel('');
    triggerHaptic(25);
  };

  const progressPercent =
    selectedTarget > 0 ? Math.min(100, (sessionCount % selectedTarget) / selectedTarget * 100) : 0;
  const cycleCount = Math.floor(sessionCount / selectedTarget);

  // Compute Grand Total of all lifetime dhikrs
  const totalAllLifetimeDhikrs = Object.values(tasbeehLifetimeCounts).reduce((a, b) => a + (b || 0), 0);

  // Milestone badge helper
  const getMilestoneLabel = (count: number) => {
    if (count >= 20000) return { label: language === 'bn' ? '২০k+ মুবারক' : '20k+ Mubarak', color: 'bg-emerald-500 text-white' };
    if (count >= 10000) return { label: language === 'bn' ? '১০k+ স্বর্ণপদক' : '10k+ Gold', color: 'bg-amber-500 text-white' };
    if (count >= 5000) return { label: language === 'bn' ? '৫k+ রৌপ্যপদক' : '5k+ Silver', color: 'bg-blue-500 text-white' };
    if (count >= 1000) return { label: language === 'bn' ? '১k+ ব্রোঞ্জপদক' : '1k+ Bronze', color: 'bg-rose-500 text-white' };
    if (count >= 100) return { label: language === 'bn' ? 'শতক পূর্ণ' : 'Century Complete', color: 'bg-slate-600 text-white' };
    return null;
  };

  return (
    <div className="pb-32 pt-2 px-3 sm:px-4 max-w-md mx-auto space-y-4 select-none text-[#1F2937] dark:text-[#F8E8ED]">
      {/* Top Header: Title & View Switcher */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[#10235A] dark:text-white flex items-center gap-2">
              <span>{t.tasbeehCounter}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#F8E8ED] dark:bg-[#1C2D5A] text-[#21409A] dark:text-[#E9B7C3] border border-[#E7D9DE] dark:border-[#24386E]">
                {language === 'bn' ? 'আজীবন ট্র্যাকার' : 'Lifetime Tracker'}
              </span>
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400">
              {language === 'bn'
                ? 'ডিজিটাল তাসবীহ ও স্বয়ংক্রিয় আমল রেকর্ড খাতা'
                : 'Digital Tasbeeh & Automatic Dhikr Record Book'}
            </p>
          </div>

          {/* Quick Sound & Haptic Toggles */}
          <div className="flex items-center gap-1.5">
            {onToggleSound && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  onToggleSound();
                }}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  soundEnabled
                    ? 'bg-[#F8E8ED] dark:bg-[#1C2D5A] border-[#21409A] text-[#21409A] dark:text-[#E9B7C3]'
                    : 'bg-white dark:bg-[#142042] border-[#E7D9DE] dark:border-[#1C2D5A] text-slate-400'
                }`}
                title={
                  soundEnabled
                    ? language === 'bn'
                      ? 'শব্দ চালু'
                      : 'Sound On'
                    : language === 'bn'
                    ? 'শব্দ বন্ধ'
                    : 'Sound Off'
                }
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            )}

            {onToggleVibration && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  onToggleVibration();
                }}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  vibrationEnabled
                    ? 'bg-[#F8E8ED] dark:bg-[#1C2D5A] border-[#21409A] text-[#21409A] dark:text-[#E9B7C3]'
                    : 'bg-white dark:bg-[#142042] border-[#E7D9DE] dark:border-[#1C2D5A] text-slate-400'
                }`}
                title={
                  vibrationEnabled
                    ? language === 'bn'
                      ? 'ভাইব্রেশন চালু'
                      : 'Vibration On'
                    : language === 'bn'
                    ? 'ভাইব্রেশন বন্ধ'
                    : 'Vibration Off'
                }
              >
                <Vibrate className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Top Two Tabs: Counter Mode vs Lifetime Records Book */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-[#0C152E] border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(15);
              setActiveView('counter');
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeView === 'counter'
                ? 'bg-white dark:bg-[#1C2D5A] text-[#10235A] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
            <span>{language === 'bn' ? 'জিকির কাউন্টার' : 'Dhikr Counter'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(15);
              setActiveView('records');
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeView === 'records'
                ? 'bg-white dark:bg-[#1C2D5A] text-[#10235A] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
            <span>{language === 'bn' ? 'আমল রেকর্ড খাতা' : 'Record Book'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#21409A] text-white font-mono">
              {formatDhikrNumber(allPresets.length, language)}
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: INTERACTIVE CIRCULAR COUNTER
          ========================================================================= */}
      {activeView === 'counter' && (
        <div className="space-y-4">
          {/* Preset Dhikr Selector Carousel/Grid */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold text-[#10235A] dark:text-slate-300">
                {language === 'bn' ? 'জিকির নির্বাচন করুন:' : 'Select Dhikr:'}
              </label>
              <button
                type="button"
                onClick={() => setShowAddCustomModal(true)}
                className="text-[11px] text-[#21409A] dark:text-[#E9B7C3] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{language === 'bn' ? 'নতুন জিকির যোগ' : 'Add Custom'}</span>
              </button>
            </div>

            {/* Unique Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {[
                { id: 'all', label: language === 'bn' ? 'সব জিকির' : 'All' },
                { id: 'daily', label: language === 'bn' ? 'দৈনিক' : 'Daily' },
                { id: 'istighfar', label: language === 'bn' ? 'ইস্তিগফার' : 'Istighfar' },
                { id: 'salawat', label: language === 'bn' ? 'দুরুদ' : 'Salawat' },
                { id: 'quranic', label: language === 'bn' ? 'কুরআনী' : 'Quranic' },
                { id: 'custom', label: language === 'bn' ? 'কাস্টম তালিকা' : 'Custom' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setCategoryFilter(cat.id);
                  }}
                  className={`px-2.5 py-1 rounded-xl shrink-0 font-bold transition-all cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-[#10235A] dark:bg-[#21409A] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-[#142042] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              {allPresets
                .filter((p) => {
                  if (categoryFilter === 'all') return true;
                  if (categoryFilter === 'custom') return p.isCustom || p.id.startsWith('custom_') || p.category === 'custom';
                  return p.category === categoryFilter;
                })
                .map((preset) => {
                  const isSelected = preset.id === currentPreset.id;
                  const pLifetime = tasbeehLifetimeCounts[preset.id] || 0;
                  const displayName = language === 'bn' ? preset.nameBn : (preset.nameEn || preset.nameBn);
                  const displayCat = language === 'bn' ? preset.categoryLabel : (preset.categoryLabelEn || preset.categoryLabel);
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        triggerHaptic(15);
                        if (preset.id !== currentPreset.id) {
                          onUpdateCount(preset.id, 0, 0);
                        }
                        onChangeDhikr(preset.id);
                        setSelectedTarget(preset.defaultTarget);
                      }}
                      className={`px-3 py-2 rounded-2xl border text-left shrink-0 transition-all cursor-pointer min-h-[48px] flex flex-col justify-center ${
                        isSelected
                          ? 'bg-[#F8E8ED] dark:bg-[#1C2D5A] border-[#21409A] ring-1 ring-[#21409A] shadow-xs'
                          : 'bg-white dark:bg-[#142042] border-[#E7D9DE] dark:border-[#1C2D5A] hover:border-[#21409A]/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="font-bold text-[#10235A] dark:text-white block whitespace-nowrap">
                          {displayName}
                        </span>
                        {displayCat && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold shrink-0">
                            {displayCat}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-[10px] text-[#6B7280] dark:text-[#E9B7C3] font-mono block">
                          {language === 'bn' ? `মোট: ${toBnNumber(pLifetime)} বার` : `Total: ${pLifetime.toLocaleString()}`}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {language === 'bn' ? `লক্ষ্য: ${toBnNumber(preset.defaultTarget)}` : `Target: ${preset.defaultTarget}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Current Active Dhikr Display Card */}
          <div className="relative p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#111C35] text-slate-800 dark:text-slate-100 shadow-xs border border-slate-200/90 dark:border-slate-800 space-y-3 overflow-hidden transition-colors">
            {/* Background subtle aura */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-teal-500/5 dark:bg-teal-400/10 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1.5 tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {language === 'bn'
                      ? currentPreset.categoryLabel || 'বর্তমান জিকির'
                      : currentPreset.categoryLabelEn || currentPreset.categoryLabel || 'Active Dhikr'}
                  </span>
                </span>
                {currentPreset.isCustom && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                    {language === 'bn' ? 'কাস্টম' : 'Custom'}
                  </span>
                )}
              </div>

              {/* All-time record banner badge with direct reset option */}
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-[11px] font-semibold border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                title={language === 'bn' ? 'হিসাব বা সেশন রিসেট করুন' : 'Reset session or count'}
              >
                <Award className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                <span>
                  {language === 'bn' ? 'আজীবন:' : 'All-time:'}{' '}
                  <strong className="font-mono text-teal-700 dark:text-teal-300">
                    {formatDhikrNumber(lifetimeCount, language)}
                  </strong>{' '}
                  {language === 'bn' ? 'বার' : ''}
                </span>
              </button>
            </div>

            <div className="text-center space-y-1.5 pt-0.5">
              <h3 className="font-arabic text-3xl sm:text-4xl font-bold tracking-normal leading-relaxed text-slate-900 dark:text-[#F3FAF9]">
                {currentPreset.nameAr}
              </h3>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'bn' ? currentPreset.nameBn : (currentPreset.nameEn || currentPreset.nameBn)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-300 italic max-w-sm mx-auto leading-relaxed">
                "{language === 'bn' ? currentPreset.meaningBn : (currentPreset.meaningEn || currentPreset.meaningBn)}"
              </p>
            </div>

            {/* Target Selectors directly in card footer */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {language === 'bn' ? 'টার্গেট:' : 'Target:'}
                </span>
                {[33, 100, 1000].map((tVal) => (
                  <button
                    key={tVal}
                    type="button"
                    onClick={() => {
                      triggerHaptic(15);
                      setSelectedTarget(tVal);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold font-mono text-[11px] transition-all cursor-pointer ${
                      selectedTarget === tVal
                        ? 'bg-[#0F5F62] text-white dark:bg-teal-500 dark:text-slate-950 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {language === 'bn' ? toBnNumber(tVal) : tVal}
                  </button>
                ))}
              </div>

              {/* Reset session button */}
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-[11px] text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title={language === 'bn' ? 'সেশনের গণনা শূন্য (০) করুন' : 'Reset session count to zero'}
              >
                <RotateCcw className="w-3 h-3 stroke-[2.2]" />
                <span>{language === 'bn' ? 'সেশন রিসেট' : 'Reset Session'}</span>
              </button>
            </div>
          </div>

          {/* =========================================================================
              MASSIVE ATTRACTIVE CIRCULAR COUNTER (ERGONOMIC, SMOOTH BEAD NOTCHES, SOOTHING)
              ========================================================================= */}
          <div className="flex flex-col items-center justify-center py-1 select-none">
            <div className="relative w-64 h-64 sm:w-68 sm:h-68 flex items-center justify-center">
              {/* Outer SVG Circular Progress Ring with 33 prayer bead markers */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 260 260">
                {/* Background Track Circle */}
                <circle
                  cx="130"
                  cy="130"
                  r="114"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="7"
                  className="text-slate-200 dark:text-slate-800"
                />

                {/* Animated Progress Gradient Arc */}
                <circle
                  cx="130"
                  cy="130"
                  r="114"
                  fill="none"
                  stroke="url(#tasbeehGradient)"
                  strokeWidth="7"
                  strokeDasharray={2 * Math.PI * 114}
                  strokeDashoffset={2 * Math.PI * 114 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-200 ease-out"
                />

                {/* Bead Notch Dots around perimeter (33 beads like traditional Tasbeeh) */}
                {Array.from({ length: 33 }).map((_, i) => {
                  const angle = (i * 360) / 33;
                  const rad = (angle * Math.PI) / 180;
                  const x = 130 + 114 * Math.cos(rad);
                  const y = 130 + 114 * Math.sin(rad);
                  const isCompletedBead = (sessionCount % 33) > i;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={i % 11 === 0 ? 3.5 : 2}
                      className={
                        isCompletedBead
                          ? 'fill-teal-600 dark:fill-teal-400'
                          : 'fill-slate-300 dark:fill-slate-700/80'
                      }
                    />
                  );
                })}

                <defs>
                  <linearGradient id="tasbeehGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0F766E" />
                    <stop offset="50%" stopColor="#0D9488" />
                    <stop offset="100%" stopColor="#2DD4BF" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Main Interactive Dial Button */}
              <motion.button
                type="button"
                onClick={handleTap}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                className="relative w-52 h-52 sm:w-54 sm:h-54 rounded-full bg-linear-to-b from-[#15233E] via-[#0E1A30] to-[#091122] text-white shadow-xl flex flex-col items-center justify-center border-4 border-slate-700/50 dark:border-slate-700/70 select-none group cursor-pointer focus:outline-hidden"
                style={{
                  boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.12), 0 10px 28px rgba(15,23,42,0.28)',
                }}
              >
                {/* Concentric inner highlight rim */}
                <div className="absolute inset-1.5 rounded-full border border-white/10 pointer-events-none" />

                {/* Pulse ring animation on cycle or milestone reach */}
                {sessionCount > 0 && sessionCount % selectedTarget === 0 && (
                  <motion.div
                    initial={{ scale: 1, opacity: 0.9 }}
                    animate={{ scale: 1.25, opacity: 0 }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-teal-400 pointer-events-none"
                  />
                )}

                {/* Cycle indicator / Minimal Jikir Path tag */}
                <span className="text-[11px] text-teal-300 font-bold uppercase tracking-wider">
                  {cycleCount > 0
                    ? language === 'bn'
                      ? `${toBnNumber(cycleCount)}ম চক্র সমাপ্ত`
                      : `Cycle ${cycleCount} Done`
                    : language === 'bn'
                    ? 'জিকির পাঠ'
                    : 'Recitation'}
                </span>

                {/* Main Large Digits */}
                <motion.span
                  key={sessionCount}
                  initial={{ scale: 0.92, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.1 }}
                  className="text-5xl sm:text-6xl font-black font-mono tabular-nums tracking-tighter drop-shadow-sm text-white my-0.5"
                >
                  {formatDhikrNumber(sessionCount, language)}
                </motion.span>

                {/* Subtitle Target & Touch prompt */}
                <div className="flex items-center gap-1 text-[11px] text-slate-300/80 font-mono">
                  <span>
                    {language === 'bn'
                      ? `টার্গেট: ${toBnNumber(selectedTarget)}`
                      : `Target: ${selectedTarget}`}
                  </span>
                </div>

                {/* Touch invitation capsule */}
                <div className="mt-1.5 px-3 py-0.5 rounded-full bg-white/10 hover:bg-white/15 text-[10px] text-slate-200 font-medium tracking-wide border border-white/15 backdrop-blur-xs">
                  {language === 'bn' ? 'ট্যাপ করুন' : 'Tap to Count'}
                </div>
              </motion.button>
            </div>

            {/* Direct Reset Option aligned directly below the circular counter */}
            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  setShowResetModal(true);
                }}
                className="px-4 py-2 rounded-2xl bg-white dark:bg-[#18282D] border border-[#E7D9DE] dark:border-[#22353B] text-xs font-bold text-[#0F5F62] dark:text-[#2DD4BF] hover:bg-[#F3FAF9] dark:hover:bg-[#1F333A] shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                title={language === 'bn' ? 'চলতি জিকির গণনা ০ (শূন্য) করুন' : 'Reset session count to zero'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'কাউন্টার রিসেট (০ করুন)' : 'Reset Counter (0)'}</span>
              </button>
            </div>

            {/* Permanent Cumulative Lifetime Record Banner directly under the Dial */}
            <div className="mt-3 w-full p-3 rounded-2xl bg-white dark:bg-[#18282D] border border-[#E7D9DE] dark:border-[#22353B] shadow-xs flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F8E8ED] dark:bg-[#152226] text-[#083B40] dark:text-[#2DD4BF] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#10235A] dark:text-[#EAF2F1] block">
                    {language === 'bn'
                      ? `${currentPreset.nameBn}-এর আজীবন রেকর্ড`
                      : `${currentPreset.nameEn || currentPreset.nameBn} Lifetime Record`}
                  </span>
                  <span className="text-[10px] text-[#6B7280] dark:text-slate-400">
                    {language === 'bn' ? 'প্রতিটি পাঠে স্বয়ংক্রিয় যোগ হয়' : 'Automatically saved on each count'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-black text-sm text-[#21409A] dark:text-[#E9B7C3] block">
                  {formatDhikrNumber(lifetimeCount, language)} {language === 'bn' ? 'বার' : ''}
                </span>
                <button
                  type="button"
                  onClick={() => setManualAddModalDhikr(currentPreset)}
                  className="text-[10px] text-slate-500 hover:text-[#21409A] dark:hover:text-[#E9B7C3] font-semibold underline cursor-pointer"
                >
                  {language === 'bn' ? 'হাতে যোগ' : 'Manual Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: LIFETIME DHIKR RECORD BOOK ("আমল রেকর্ড খাতা")
          Displays every dhikr with its all-time cumulative counts e.g. Astaghfirullah 21234
          ========================================================================= */}
      {activeView === 'records' && (
        <div className="space-y-4">
          {/* Lifetime Summary Hero Banner */}
          <div className="p-4 rounded-3xl bg-linear-to-r from-[#10235A] to-[#21409A] text-white shadow-md space-y-2 border border-[#24386E]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#E9B7C3] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>{language === 'bn' ? 'সর্বমোট জিকির আমল খাতা' : 'Cumulative Dhikr Record Book'}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white font-semibold">
                {language === 'bn' ? 'স্থায়ী সংরক্ষণ' : 'Permanent Record'}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                  {formatDhikrNumber(totalAllLifetimeDhikrs, language)}{' '}
                  <span className="text-xs font-normal text-[#E9B7C3]">
                    {language === 'bn' ? 'বার' : 'times'}
                  </span>
                </p>
                <p className="text-[11px] text-[#F8E8ED]/85 mt-0.5">
                  {language === 'bn'
                    ? 'সকল জিকির মিলিয়ে আজীবন পঠিত সর্বমোট সংখ্যা'
                    : 'Combined total recitations across all dhikrs'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddCustomModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#E9B7C3] hover:bg-white text-[#10235A] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'নতুন জিকির' : 'New Dhikr'}</span>
              </button>
            </div>
          </div>

          {/* List of Every Single Dhikr with its Lifetime Record */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-[#10235A] dark:text-slate-300">
                {language === 'bn' ? 'ব্যক্তিগত জিকিরভিত্তিক সর্বমোট হিসাব:' : 'Individual Dhikr Grand Totals:'}
              </h3>
              <span className="text-[10px] text-slate-500">
                {language === 'bn' ? 'ট্যাপ করে পাঠ শুরু করুন' : 'Tap to start recitation'}
              </span>
            </div>

            {allPresets.map((preset) => {
              const count = tasbeehLifetimeCounts[preset.id] || 0;
              const isCurrent = preset.id === currentPreset.id;
              const milestone = getMilestoneLabel(count);
              const displayName = language === 'bn' ? preset.nameBn : (preset.nameEn || preset.nameBn);
              const displayMeaning = language === 'bn' ? preset.meaningBn : (preset.meaningEn || preset.meaningBn);

              return (
                <div
                  key={preset.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-white dark:bg-[#142042] border-[#21409A] ring-1 ring-[#21409A]/40 shadow-xs'
                      : 'bg-white dark:bg-[#142042]/70 border-[#E7D9DE] dark:border-[#1C2D5A] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#10235A] dark:text-white text-sm">
                          {displayName}
                        </span>
                        {milestone && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${milestone.color}`}
                          >
                            {milestone.label}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#F8E8ED] text-[#21409A] dark:bg-[#1C2D5A] dark:text-[#E9B7C3]">
                            {language === 'bn' ? 'বর্তমান সক্রিয়' : 'Active'}
                          </span>
                        )}
                      </div>

                      <p className="font-arabic text-sm text-[#21409A] dark:text-[#E9B7C3] mt-0.5">
                        {preset.nameAr}
                      </p>
                      <p className="text-[11px] text-[#6B7280] dark:text-slate-400 line-clamp-1 mt-0.5">
                        {displayMeaning}
                      </p>
                    </div>

                    {/* Massive Cumulative Count */}
                    <div className="text-right shrink-0">
                      <span className="text-xs text-[#6B7280] dark:text-slate-400 block">
                        {language === 'bn' ? 'সর্বমোট পঠিত:' : 'Total Recited:'}
                      </span>
                      <span className="text-lg font-black font-mono text-[#10235A] dark:text-[#E9B7C3] block">
                        {formatDhikrNumber(count, language)}{' '}
                        <span className="text-xs font-normal">{language === 'bn' ? 'বার' : ''}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions for this specific dhikr */}
                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(15);
                          onChangeDhikr(preset.id);
                          setSelectedTarget(preset.defaultTarget);
                          setActiveView('counter');
                        }}
                        className="px-3 py-1 rounded-xl bg-[#21409A] hover:bg-[#10235A] text-white font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{language === 'bn' ? 'গণনা চালু করুন' : 'Start'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setManualAddModalDhikr(preset)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#1C2D5A] text-slate-700 dark:text-slate-300 hover:text-[#10235A] font-semibold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{language === 'bn' ? 'হাতে যোগ' : 'Manual Add'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Individual Lifetime Count Reset Button */}
                      <button
                        type="button"
                        onClick={() => setConfirmResetDhikr(preset)}
                        className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-semibold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                        title={language === 'bn' ? 'এই জিকিরের সর্বমোট হিসাব ০ করুন' : 'Reset total count to zero'}
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{language === 'bn' ? 'হিসাব রিসেট' : 'Reset'}</span>
                      </button>

                      {/* Delete Custom Dhikr Button */}
                      {(preset.isCustom || preset.id.startsWith('custom_')) && onDeleteCustomDhikr && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustom(preset.id)}
                          className="p-1 rounded-xl text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          RESET MODAL
          ========================================================================= */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0C152E] rounded-3xl max-w-xs w-full p-5 space-y-4 border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center">
              <RotateCcw className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#10235A] dark:text-white">
                {language === 'bn' ? 'গণনা রিসেট অপশন' : 'Reset Count Options'}
              </h4>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-1 leading-relaxed">
                {language === 'bn' ? (
                  <><strong>{currentPreset.nameBn}</strong>-এর জন্য কোন হিসাবটি রিসেট করতে চান?</>
                ) : (
                  <>Which counter do you want to reset for <strong>{currentPreset.nameEn || currentPreset.nameBn}</strong>?</>
                )}
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {/* Option 1: Reset current session */}
              <button
                type="button"
                onClick={handleConfirmResetSession}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-[#142042] hover:bg-slate-200 dark:hover:bg-[#1C2D5A] text-left flex items-center justify-between text-xs font-semibold text-[#10235A] dark:text-slate-200 cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-bold block">
                    {language === 'bn' ? 'বর্তমান সেশন ০ করুন' : 'Reset Current Session (0)'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    {language === 'bn' ? 'আজীবন হিসাব অক্ষত থাকবে' : 'Lifetime record will remain safe'}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-500">{sessionCount}</span>
              </button>

              {/* Option 2: Reset individual lifetime grand total */}
              <button
                type="button"
                onClick={() => handleConfirmResetLifetime(currentPreset.id)}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/40 text-left flex items-center justify-between text-xs font-semibold text-rose-700 dark:text-rose-300 cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-bold block text-rose-700 dark:text-rose-300">
                    {language === 'bn' ? 'সর্বমোট আজীবন হিসাব ০ করুন' : 'Reset Lifetime Record (0)'}
                  </span>
                  <span className="text-[10px] text-rose-500/80 block">
                    {language === 'bn' ? 'এই জিকিরের স্থায়ী মোট ০ হবে' : 'Permanent total will be wiped to 0'}
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold text-rose-600 dark:text-rose-400">
                  {formatDhikrNumber(lifetimeCount, language)}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              className="w-full py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          INDIVIDUAL DHIKR LIFETIME RESET CONFIRMATION MODAL
          ========================================================================= */}
      {confirmResetDhikr && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0C152E] rounded-3xl max-w-xs w-full p-5 space-y-4 border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center">
              <RotateCcw className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#10235A] dark:text-white">
                {language === 'bn' ? 'সর্বমোট হিসাব রিসেট নিশ্চিতকরণ' : 'Confirm Lifetime Count Reset'}
              </h4>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-1 leading-relaxed">
                {language === 'bn' ? (
                  <>
                    আপনি কি <strong>{confirmResetDhikr.nameBn}</strong>-এর সর্বমোট হিসাব (
                    <strong>{toBnNumber(tasbeehLifetimeCounts[confirmResetDhikr.id] || 0)} বার</strong>) রিসেট করে ০ করতে চান?
                  </>
                ) : (
                  <>
                    Are you sure you want to reset the lifetime record for{' '}
                    <strong>{confirmResetDhikr.nameEn || confirmResetDhikr.nameBn}</strong> (
                    <strong>{(tasbeehLifetimeCounts[confirmResetDhikr.id] || 0).toLocaleString()} times</strong>) to 0?
                  </>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmResetDhikr(null)}
                className="py-2.5 rounded-xl bg-slate-100 dark:bg-[#142042] text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmResetLifetime(confirmResetDhikr.id)}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                {language === 'bn' ? 'হ্যাঁ, ০ করুন' : 'Yes, Reset to 0'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MANUAL COUNT ADDITION MODAL
          ========================================================================= */}
      {manualAddModalDhikr && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0C152E] rounded-3xl max-w-xs w-full p-5 space-y-4 border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xl text-center">
            <div>
              <h4 className="text-sm font-bold text-[#10235A] dark:text-white">
                {language === 'bn' ? 'হাতে গুনে রেকর্ডে যোগ করুন' : 'Add Manual Recitation Count'}
              </h4>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5">
                {language === 'bn' ? manualAddModalDhikr.nameBn : (manualAddModalDhikr.nameEn || manualAddModalDhikr.nameBn)}
              </p>
            </div>

            {/* Quick buttons: +33, +100, +500, +1000 */}
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {['33', '100', '500', '1000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setManualAddAmount(amt)}
                  className={`py-1.5 rounded-xl font-bold font-mono border transition-all cursor-pointer ${
                    manualAddAmount === amt
                      ? 'bg-[#21409A] text-white border-[#21409A]'
                      : 'bg-slate-50 dark:bg-[#142042] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  +{language === 'bn' ? toBnNumber(parseInt(amt, 10)) : amt}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                {language === 'bn' ? 'সংখ্যা লিখুন:' : 'Enter Amount:'}
              </label>
              <input
                type="number"
                value={manualAddAmount}
                onChange={(e) => setManualAddAmount(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#142042] font-mono text-center font-bold text-sm text-[#10235A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#21409A]"
                placeholder="100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setManualAddModalDhikr(null)}
                className="py-2.5 rounded-xl bg-slate-100 dark:bg-[#142042] text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmManualAdd}
                className="py-2.5 rounded-xl bg-[#21409A] hover:bg-[#10235A] text-white text-xs font-bold cursor-pointer"
              >
                {language === 'bn' ? 'রেকর্ডে যোগ করুন' : 'Add to Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD CUSTOM DHIKR MODAL
          ========================================================================= */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-[#0C152E] rounded-3xl max-w-sm w-full p-5 space-y-4 border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xl my-auto">
            <div className="text-center">
              <h4 className="text-base font-bold text-[#10235A] dark:text-white">
                {language === 'bn' ? 'নতুন কাস্টম জিকির যোগ' : 'Add Custom Dhikr'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'নির্দিষ্ট টার্গেট সংখ্যা ও নিজস্ব ক্যাটাগরি লেবেল নির্ধারণ করুন'
                  : 'Set custom target count and unique category label'}
              </p>
            </div>

            <div className="space-y-3 text-xs max-h-[65vh] overflow-y-auto pr-1">
              {/* 1. Dhikr Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'জিকিরের নাম (বাংলা)' : 'Dhikr Name'} <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  value={newDhikrBn}
                  onChange={(e) => setNewDhikrBn(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: সুবহানাল্লাহিল আজিম ও বিহামদিহি' : 'e.g. SubhanAllah wa bihamdihi'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#142042] text-[#10235A] dark:text-white focus:ring-2 focus:ring-[#21409A]"
                />
              </div>

              {/* 2. Arabic Text (Optional) */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'আরবি হরফ (ঐচ্ছিক):' : 'Arabic Text (Optional):'}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={newDhikrAr}
                  onChange={(e) => setNewDhikrAr(e.target.value)}
                  placeholder="سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#142042] font-arabic text-sm text-[#10235A] dark:text-white focus:ring-2 focus:ring-[#21409A]"
                />
              </div>

              {/* 3. Meaning / Virtue (Optional) */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'অর্থ বা ফজিলত (ঐচ্ছিক):' : 'Meaning / Virtue (Optional):'}
                </label>
                <input
                  type="text"
                  value={newDhikrMeaning}
                  onChange={(e) => setNewDhikrMeaning(e.target.value)}
                  placeholder={language === 'bn' ? 'আল্লাহর প্রশংসাসহ সুমহান পবিত্রতা ঘোষণা' : 'Praising Allah and glorifying His perfection'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#142042] text-[#10235A] dark:text-white focus:ring-2 focus:ring-[#21409A]"
                />
              </div>

              {/* 4. SPECIFIC TARGET COUNT */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{language === 'bn' ? 'নির্দিষ্ট টার্গেট সংখ্যা (Target Count):' : 'Target Count:'}</span>
                  <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">
                    {language === 'bn'
                      ? `${newDhikrCustomTargetInput ? newDhikrCustomTargetInput : newDhikrTarget} বার`
                      : (newDhikrCustomTargetInput ? newDhikrCustomTargetInput : newDhikrTarget)}
                  </span>
                </label>

                {/* Target Count Quick Buttons */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[33, 100, 313, 1000].map((tVal) => (
                    <button
                      key={tVal}
                      type="button"
                      onClick={() => {
                        setNewDhikrTarget(tVal);
                        setNewDhikrCustomTargetInput('');
                      }}
                      className={`py-1.5 rounded-xl font-bold font-mono border transition-all cursor-pointer ${
                        newDhikrTarget === tVal && !newDhikrCustomTargetInput
                          ? 'bg-[#21409A] text-white border-[#21409A] shadow-xs'
                          : 'bg-slate-50 dark:bg-[#142042] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {language === 'bn' ? toBnNumber(tVal) : tVal}
                    </button>
                  ))}
                </div>

                {/* Custom Target Number Input */}
                <div className="pt-1">
                  <input
                    type="number"
                    value={newDhikrCustomTargetInput}
                    onChange={(e) => setNewDhikrCustomTargetInput(e.target.value)}
                    placeholder={language === 'bn' ? 'বা নিজস্ব টার্গেট সংখ্যা লিখুন (যেমন: ৫০, ৭০, ৫০০)' : 'Or enter custom target (e.g. 50, 70, 500)'}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#142042] text-[#10235A] dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* 5. UNIQUE CATEGORY LABEL */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{language === 'bn' ? 'ইউনিক ক্যাটাগরি লেবেল (Category Label):' : 'Category Label:'}</span>
                  <span className="text-teal-600 dark:text-teal-400 font-bold text-[11px]">
                    {newDhikrCustomCategoryLabel ? newDhikrCustomCategoryLabel : newDhikrCategoryLabel}
                  </span>
                </label>

                {/* Preset Category Chips */}
                <div className="grid grid-cols-3 gap-1 text-[11px]">
                  {[
                    { id: 'daily', label: language === 'bn' ? 'দৈনিক জিকির' : 'Daily Dhikr' },
                    { id: 'istighfar', label: language === 'bn' ? 'ইস্তিগফার ও তওবা' : 'Istighfar' },
                    { id: 'salawat', label: language === 'bn' ? 'দুরুদ ও সালাওয়াত' : 'Salawat' },
                    { id: 'quranic', label: language === 'bn' ? 'কুরআনী দোয়া' : 'Quranic' },
                    { id: 'hajat', label: language === 'bn' ? 'বিশেষ মোনাজাত' : 'Supplication' },
                    { id: 'custom', label: language === 'bn' ? 'কাস্টম তালিকা' : 'Custom' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setNewDhikrCategory(cat.id);
                        setNewDhikrCategoryLabel(cat.label);
                        setNewDhikrCustomCategoryLabel('');
                      }}
                      className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer font-medium leading-tight ${
                        newDhikrCategory === cat.id && !newDhikrCustomCategoryLabel
                          ? 'bg-teal-700 text-white border-teal-700 font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-[#142042] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Custom Unique Category Name Input */}
                <div className="pt-1">
                  <input
                    type="text"
                    value={newDhikrCustomCategoryLabel}
                    onChange={(e) => setNewDhikrCustomCategoryLabel(e.target.value)}
                    placeholder={language === 'bn' ? 'বা নিজস্ব ক্যাটাগরি নাম লিখুন (যেমন: রাতের খাস আমল)' : 'Or enter custom category name'}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#142042] text-[#10235A] dark:text-white text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="py-2.5 rounded-xl bg-slate-100 dark:bg-[#142042] text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveCustomDhikr}
                disabled={!newDhikrBn.trim()}
                className="py-2.5 rounded-xl bg-[#21409A] hover:bg-[#10235A] text-white text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasbeehCounter;

