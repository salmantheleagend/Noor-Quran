import React, { useState } from 'react';
import { UserGender } from '../types';
import { Check, User, Heart, ArrowRight, X } from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';

interface GenderSelectionModalProps {
  language?: string;
  currentGender?: UserGender | null;
  onSelectGender: (gender: UserGender) => void;
  onClose?: () => void;
}

export const GenderSelectionModal: React.FC<GenderSelectionModalProps> = ({
  currentGender = null,
  onSelectGender,
  onClose,
}) => {
  const [selected, setSelected] = useState<UserGender | null>(currentGender || null);

  const handleConfirm = () => {
    if (!selected) return;
    triggerHaptic(20);
    onSelectGender(selected);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-xs w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl text-center relative overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Close Button if opened from settings */}
        {onClose && currentGender && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="pt-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Select Gender
          </h3>
        </div>

        {/* Gender Choices */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* MALE OPTION */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(15);
              setSelected('male');
            }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
              selected === 'male'
                ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-600 dark:border-teal-400 text-teal-800 dark:text-teal-200 shadow-xs'
                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform ${
                selected === 'male'
                  ? 'bg-teal-600 text-white scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <User className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold">Male</span>
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                selected === 'male'
                  ? 'bg-teal-600 border-teal-600 text-white'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
            >
              {selected === 'male' && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </button>

          {/* FEMALE OPTION */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(15);
              setSelected('female');
            }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
              selected === 'female'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 dark:border-rose-400 text-rose-800 dark:text-rose-200 shadow-xs'
                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform ${
                selected === 'female'
                  ? 'bg-rose-500 text-white scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <span className="text-sm font-bold">Female</span>
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                selected === 'female'
                  ? 'bg-rose-500 border-rose-500 text-white'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
            >
              {selected === 'female' && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </button>
        </div>

        {/* Continue Action */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selected}
          className={`w-full py-3 rounded-2xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 ${
            selected
              ? 'bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white active:scale-[0.99]'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GenderSelectionModal;
