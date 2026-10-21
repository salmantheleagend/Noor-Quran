import React, { useState } from 'react';
import { AppLanguage, LocationInfo, UserPreferences } from '../types';
import { BD_DISTRICTS } from '../data/districtsBD';
import { Check, ChevronRight, MapPin, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';

interface OnboardingModalProps {
  onComplete: (prefs: Partial<UserPreferences>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [language, setLanguage] = useState<AppLanguage>('bn');
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo>(BD_DISTRICTS[0]); // Dhaka
  const [asrMethod, setAsrMethod] = useState<'hanafi' | 'standard'>('hanafi');

  const handleNext = () => {
    triggerHaptic(20);
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete({
        language,
        location: selectedLocation,
        asrMethod,
        onboardingCompleted: true,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0C152E] rounded-3xl max-w-sm w-full p-6 space-y-5 border border-[#E7D9DE] dark:border-[#1C2D5A] shadow-2xl text-center text-[#1F2937] dark:text-[#F8E8ED]">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-[#21409A]'
                  : s < step
                  ? 'w-4 bg-[#E9B7C3]'
                  : 'w-2 bg-[#E7D9DE] dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: WELCOME & LANGUAGE */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#21409A] via-[#1c357f] to-[#10235A] text-white flex items-center justify-center mx-auto text-3xl font-arabic font-bold shadow-lg shadow-[#21409A]/30">
              ن
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-[#10235A] dark:text-[#EAF2F1]">
                Noor Quran-এ স্বাগতম
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-1">
                আপনার পছন্দের ভাষা নির্বাচন করুন
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-2">
              <button
                onClick={() => setLanguage('bn')}
                className={`p-3 rounded-2xl border text-sm font-semibold flex items-center justify-between transition-colors min-h-[48px] cursor-pointer ${
                  language === 'bn'
                    ? 'bg-[#F8E8ED] dark:bg-[#142042] border-[#21409A] text-[#10235A] dark:text-[#E9B7C3] ring-1 ring-[#21409A]'
                    : 'bg-white dark:bg-[#10235A]/40 border-[#E7D9DE] dark:border-[#24386E] text-[#1F2937] dark:text-slate-300'
                }`}
              >
                <span>বাংলা (Bengali)</span>
                {language === 'bn' && <Check className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />}
              </button>

              <button
                onClick={() => setLanguage('ar')}
                className={`p-3 rounded-2xl border text-sm font-arabic font-semibold flex items-center justify-between transition-colors min-h-[48px] cursor-pointer ${
                  language === 'ar'
                    ? 'bg-[#F8E8ED] dark:bg-[#142042] border-[#21409A] text-[#10235A] dark:text-[#E9B7C3] ring-1 ring-[#21409A]'
                    : 'bg-white dark:bg-[#10235A]/40 border-[#E7D9DE] dark:border-[#24386E] text-[#1F2937] dark:text-slate-300'
                }`}
              >
                <span>العربية (Arabic)</span>
                {language === 'ar' && <Check className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />}
              </button>

              <button
                onClick={() => setLanguage('en')}
                className={`p-3 rounded-2xl border text-sm font-semibold flex items-center justify-between transition-colors min-h-[48px] cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#F8E8ED] dark:bg-[#142042] border-[#21409A] text-[#10235A] dark:text-[#E9B7C3] ring-1 ring-[#21409A]'
                    : 'bg-white dark:bg-[#10235A]/40 border-[#E7D9DE] dark:border-[#24386E] text-[#1F2937] dark:text-slate-300'
                }`}
              >
                <span>English (International)</span>
                {language === 'en' && <Check className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F8E8ED] dark:bg-[#142042] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center mx-auto shadow-xs border border-[#E7D9DE] dark:border-[#24386E]">
              <MapPin className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#10235A] dark:text-white">
                আপনার জেলা বা শহর
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-1">
                সঠিক নামাজের সময় ও সাহরি-ইফতারের জন্য লোকেশন নির্বাচন করুন
              </p>
            </div>

            <div className="text-left space-y-1">
              <label className="text-xs font-semibold text-[#10235A] dark:text-slate-300">
                জেলা নির্বাচন:
              </label>
              <select
                value={selectedLocation.name}
                onChange={(e) => {
                  const loc = BD_DISTRICTS.find((d) => d.name === e.target.value);
                  if (loc) setSelectedLocation(loc);
                }}
                className="w-full p-3 rounded-2xl bg-[#FCFAF8] dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#24386E] text-sm font-medium text-[#10235A] dark:text-slate-100 min-h-[48px] cursor-pointer"
              >
                {BD_DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.nameBn} ({d.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* STEP 3: PREFERENCES & START */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F8E8ED] dark:bg-[#142042] text-[#21409A] dark:text-[#E9B7C3] flex items-center justify-center mx-auto shadow-xs border border-[#E7D9DE] dark:border-[#24386E]">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#10235A] dark:text-white">
                নামাজের হিসাব পদ্ধতি
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-1">
                আসরের ওয়াক্ত শুরুর নিয়ম নির্বাচন করুন
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1 text-left">
              <button
                onClick={() => setAsrMethod('hanafi')}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-colors min-h-[48px] cursor-pointer ${
                  asrMethod === 'hanafi'
                    ? 'bg-[#F8E8ED] dark:bg-[#142042] border-[#21409A] text-[#10235A] dark:text-[#E9B7C3] ring-1 ring-[#21409A]'
                    : 'bg-white dark:bg-[#10235A]/40 border-[#E7D9DE] dark:border-[#24386E] text-[#1F2937] dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="font-bold block">হানাফী মাযহাব (দ্বিগুণ ছায়া)</span>
                  <span className="text-[10px] text-[#6B7280] dark:text-slate-400">বাংলাদেশ ও দক্ষিণ এশিয়ায় বহুল প্রচলিত</span>
                </div>
                {asrMethod === 'hanafi' && <Check className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />}
              </button>

              <button
                onClick={() => setAsrMethod('standard')}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-colors min-h-[48px] cursor-pointer ${
                  asrMethod === 'standard'
                    ? 'bg-[#F8E8ED] dark:bg-[#142042] border-[#21409A] text-[#10235A] dark:text-[#E9B7C3] ring-1 ring-[#21409A]'
                    : 'bg-white dark:bg-[#10235A]/40 border-[#E7D9DE] dark:border-[#24386E] text-[#1F2937] dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="font-bold block">শাফেঈ / সাধারণ (একগুণ ছায়া)</span>
                  <span className="text-[10px] text-[#6B7280] dark:text-slate-400">জমহুর ও আরব বিশ্বে প্রচলিত</span>
                </div>
                {asrMethod === 'standard' && <Check className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />}
              </button>
            </div>
          </div>
        )}

        {/* Primary CTA Button: Solid Royal Sapphire */}
        <button
          onClick={handleNext}
          className="w-full min-h-[48px] py-3.5 rounded-2xl bg-[#21409A] hover:bg-[#10235A] text-white font-bold text-sm shadow-md shadow-[#21409A]/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>{step === 3 ? 'অ্যাপ শুরু করুন' : 'পরবর্তী ধাপ'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default OnboardingModal;
