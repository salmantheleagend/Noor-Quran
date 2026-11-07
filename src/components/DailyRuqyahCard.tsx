import React, { useState } from 'react';
import { AppLanguage } from '../types';
import { Shield, Play, Pause, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';
import { ruqyahManager } from '../services/RuqyahManager';

interface DailyRuqyahCardProps {
  language: AppLanguage;
  onNavigate: (tab: string, extra?: unknown) => void;
}

export const DailyRuqyahCard: React.FC<DailyRuqyahCardProps> = ({
  language,
  onNavigate,
}) => {
  const isBn = language === 'bn';
  const routineStatus = ruqyahManager.getDailyRoutineStatus();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlayRoutineAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(20);
    // Navigate directly into Ruqyah player to experience full recitation
    onNavigate('ruqyah', { autoPlay: true });
  };

  return (
    <div
      onClick={() => {
        triggerHaptic(15);
        onNavigate('ruqyah');
      }}
      className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#083B40] via-[#0F5F62] to-[#083B40] text-white p-4 sm:p-5 border border-[#13545A] shadow-xs hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Background subtle geometric glow */}
      <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-[#B9E2DD]/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-[#B9E2DD]/15 text-[#B9E2DD] flex items-center justify-center shrink-0 border border-[#B9E2DD]/30 shadow-2xs group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B9E2DD]">
                {isBn ? 'দৈনিক আত্মিক সুরক্ষা' : 'Daily Spiritual Protection'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-white border border-white/20">
                {isBn ? 'সকাল ও সন্ধ্যার আমল' : 'Morning & Evening'}
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
              {isBn ? 'দৈনিক মাসনূন রুকইয়াহ রুটিন' : 'Daily Masnoon Ruqyah Routine'}
            </h4>

            <p className="text-xs text-[#B9E2DD]/85 truncate mt-0.5">
              {isBn
                ? 'সূরা ফাতিহা, আয়াতুল কুরসি ও তিন কুল — সার্বিক নিরাপত্তা ও প্রশান্তি'
                : 'Surah Fatihah, Ayatul Kursi & Three Quls for complete peace'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={handlePlayRoutineAudio}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#B9E2DD] hover:bg-white text-[#083B40] text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            title={isBn ? 'রুকইয়াহ শুনুন' : 'Play Ruqyah'}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isBn ? 'রুকইয়াহ শুনুন' : 'Play Ruqyah'}</span>
          </button>

          <span className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors group-hover:translate-x-0.5">
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Routine completion indicator */}
      {routineStatus.completedCount > 0 && (
        <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-[11px] text-[#B9E2DD]">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>{isBn ? 'আজকের সুরক্ষা আমল সম্পন্ন:' : "Today's protective routine:"}</span>
          </span>
          <span className="font-mono font-bold text-white">
            {routineStatus.completedCount} / {routineStatus.total} ({routineStatus.percentage}%)
          </span>
        </div>
      )}
    </div>
  );
};
