import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';
import islamicBadge from '../assets/images/islamic_app_badge_1791133494322.jpg';

interface SplashScreenProps {
  onFinish: () => void;
  appName?: string;
  tagline?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  appName = 'Noor Quran',
  tagline = 'Sacred Recitation • Prayer Timings • Daily Azkar',
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Smooth auto-transition after logo display
    const timer = setTimeout(() => {
      handleExit();
    }, 2200);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleExit = () => {
    if (isExiting) return;
    triggerHaptic(20);
    setIsExiting(true);
    setTimeout(() => {
      onFinish();
    }, 500);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 overflow-hidden select-none"
          style={{
            background: 'radial-gradient(circle at 50% 35%, #0C454B 0%, #083B40 50%, #042124 100%)',
          }}
        >
          {/* Subtle Islamic Geometric Ambient Background Glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Top Teal Aura */}
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.35, 0.55, 0.35],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#0F5F62]/40 blur-3xl"
            />
            {/* Bottom Pearl Glow */}
            <motion.div
              animate={{
                scale: [1.1, 0.9, 1.1],
                opacity: [0.25, 0.45, 0.25],
              }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#B9E2DD]/25 blur-3xl"
            />

            {/* Ambient Animated Star Particles */}
            {[
              { top: '15%', left: '20%', delay: 0.2, size: 3 },
              { top: '22%', right: '18%', delay: 0.6, size: 2.5 },
              { top: '48%', left: '12%', delay: 1.0, size: 2 },
              { top: '65%', right: '15%', delay: 0.4, size: 3 },
              { top: '78%', left: '25%', delay: 0.8, size: 2.5 },
              { top: '35%', right: '28%', delay: 1.2, size: 2 },
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.2, scale: 0.6 }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.6, 1.3, 0.6],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: 'easeInOut',
                }}
                style={{
                  position: 'absolute',
                  top: p.top,
                  left: p.left,
                  right: p.right,
                  width: p.size * 4,
                  height: p.size * 4,
                }}
                className="rounded-full bg-[#B9E2DD] shadow-[0_0_8px_#B9E2DD]"
              />
            ))}
          </div>

          {/* Top Bismillah Typography */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full text-center pt-8 z-10"
          >
            <p className="font-arabic text-xl sm:text-2xl text-[#B9E2DD]/90 tracking-wide drop-shadow-xs">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          </motion.div>

          {/* Centerpiece: Motion Graphics Animated Islamic Logo */}
          <div className="flex flex-col items-center justify-center my-auto z-10 text-center max-w-sm px-4">
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
              {/* Outer Rotating Islamic Geometric Ornament Ring 1 */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border border-[#B9E2DD]/30 rounded-full border-dashed"
              />

              {/* Counter-rotating Geometric Ring 2 */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 border border-[#0F5F62]/60 rounded-full"
                style={{
                  borderStyle: 'double',
                  borderWidth: '3px',
                }}
              />

              {/* Pulsing Concentric Aura Halo */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-4 rounded-3xl bg-linear-to-tr from-[#0F5F62] via-[#B9E2DD]/30 to-[#083B40] blur-xl"
              />

              {/* Center Logo Shield / Octagram Container */}
              <motion.div
                initial={{ scale: 0.75, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 140,
                  damping: 15,
                  delay: 0.15,
                }}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-linear-to-br from-[#B9E2DD] via-[#0F5F62] to-[#083B40] shadow-2xl shadow-[#0F5F62]/70 flex items-center justify-center overflow-hidden"
              >
                {/* Logo Image / Badge Art */}
                <div className="w-full h-full rounded-[22px] overflow-hidden bg-[#083B40] relative flex items-center justify-center">
                  <img
                    src={islamicBadge}
                    alt="Noor Quran Logo"
                    className="w-full h-full object-cover transform scale-105"
                  />
                  {/* Subtle Calligraphic Overlay for Deep Spiritual Feel */}
                  <div className="absolute inset-0 bg-linear-to-t from-[#083B40]/80 via-transparent to-[#083B40]/30 flex items-center justify-center">
                    <span className="font-arabic font-extrabold text-3xl sm:text-4xl text-[#F3FAF9] drop-shadow-[0_2px_12px_rgba(15,95,98,0.9)]">
                      نُور
                    </span>
                  </div>

                  {/* Shimmer Light-Sweep Reflection */}
                  <motion.div
                    animate={{
                      x: ['-120%', '150%'],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      repeatDelay: 1.2,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-y-0 w-1/2 bg-linear-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
                  />
                </div>
              </motion.div>

              {/* Orbiting Sparkle Satellite */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 pointer-events-none"
              >
                <div className="w-6 h-6 rounded-full bg-[#B9E2DD] text-[#083B40] flex items-center justify-center shadow-lg shadow-[#B9E2DD]/60 absolute -top-1 left-1/2 -translate-x-1/2">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            </div>

            {/* App Brand Typography */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-6 space-y-1.5"
            >
              <h2 className="font-arabic text-lg sm:text-xl text-[#B9E2DD] font-medium tracking-wide">
                نُورُ الْقُرْآنِ الْكَرِيم
              </h2>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
                {appName}
              </h1>
              <p className="text-xs sm:text-sm text-[#F3FAF9]/85 font-medium leading-relaxed max-w-xs mx-auto">
                {tagline}
              </p>
            </motion.div>
          </div>

          {/* Bottom Divider & Skip Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="w-full max-w-xs space-y-4 pb-4 z-10 text-center"
          >
            {/* Clean spiritual divider (no loading text, no percentage, no loading bar) */}
            <div className="flex items-center justify-center gap-2 py-1">
              <span className="w-8 h-[1px] bg-linear-to-r from-transparent to-[#B9E2DD]/50" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9E2DD]/70" />
              <span className="w-8 h-[1px] bg-linear-to-l from-transparent to-[#B9E2DD]/50" />
            </div>

            {/* Skip / Enter Button (English only as requested) */}
            <button
              type="button"
              onClick={handleExit}
              className="w-full py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-[0.98] border border-white/20 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm backdrop-blur-xs"
            >
              <span>Enter App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
