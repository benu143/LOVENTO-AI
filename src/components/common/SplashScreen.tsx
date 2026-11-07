import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Zap, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SplashScreen: React.FC = () => {
  const { setShowSplash, reducedMotion, setReducedMotion } = useApp();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 1200);
      return () => clearTimeout(timer);
    }

    const t1 = setTimeout(() => setStep(1), 400); // Heart appears & pulses
    const t2 = setTimeout(() => setStep(2), 1200); // LOVENTO AI letters reveal
    const t3 = setTimeout(() => setStep(3), 2200); // Tagline fades in
    const t4 = setTimeout(() => setStep(4), 3000); // CREATED & DEVELOPED BY
    const t5 = setTimeout(() => setStep(5), 3700); // BENU RANA cinematic sweep
    const t6 = setTimeout(() => setStep(6), 5200); // Loading indicator
    const t7 = setTimeout(() => {
      setShowSplash(false);
    }, 6600); // Transition to Welcome Screen

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
    };
  }, [reducedMotion, setShowSplash]);

  const appLetters = ['L', 'O', 'V', 'E', 'N', 'T', 'O', ' ', 'A', 'I'];
  const creatorLetters = ['B', 'E', 'N', 'U', ' ', 'R', 'A', 'N', 'A'];

  const handleSkip = () => {
    setShowSplash(false);
  };

  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion);
    setShowSplash(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#07010f] text-white overflow-hidden select-none px-4 py-8">
      {/* Background glow and subtle gradient meshes */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/60 via-[#0d031a] to-[#05000a] pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-pink-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/25 rounded-full blur-[110px] pointer-events-none" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-pink-400"
            style={{
              width: (i % 3) + 2 + 'px',
              height: (i % 3) + 2 + 'px',
              top: `${(i * 7 + 10) % 90}%`,
              left: `${(i * 13 + 5) % 95}%`,
            }}
            animate={
              reducedMotion
                ? {}
                : {
                    y: [0, -30, 0],
                    opacity: [0.2, 0.8, 0.2],
                  }
            }
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: (i % 5) * 0.4,
            }}
          />
        ))}
      </div>

      {/* Top Bar with accessibility toggle & skip button */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between pt-2">
        <button
          onClick={toggleReducedMotion}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-pink-300 bg-white/5 hover:bg-white/10 rounded-full backdrop-blur transition border border-white/10"
          title="Toggle Reduced Motion"
        >
          <EyeOff size={13} />
          <span>{reducedMotion ? 'Standard Motion' : 'Reduce Motion'}</span>
        </button>

        <button
          onClick={handleSkip}
          className="px-3 py-1 text-xs text-pink-400 hover:text-white bg-pink-500/10 hover:bg-pink-600/30 rounded-full transition border border-pink-500/30 font-medium"
        >
          Enter App &rarr;
        </button>
      </div>

      {/* Main Cinematic Core */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto w-full max-w-sm text-center">
        {/* Glowing 3D Heart Logo */}
        <motion.div
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: step >= 1 ? 1 : 0.2, opacity: step >= 1 ? 1 : 0 }}
          transition={{ duration: 0.9, type: 'spring', bounce: 0.4 }}
          className="relative mb-6"
        >
          {/* Ambient Outer Halo */}
          <div className="absolute -inset-4 bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 rounded-full blur-2xl opacity-60 animate-pulse" />

          {/* 3D Heart Emblem */}
          <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-tr from-[#220738] via-[#3a0d5c] to-[#60146e] border border-pink-500/40 p-4 shadow-[0_0_50px_rgba(244,63,94,0.45)] flex items-center justify-center">
            <Heart
              size={56}
              className="text-pink-500 fill-pink-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.95)] animate-heart-pulse"
            />
            {/* Sparkle badge */}
            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-600 p-1.5 rounded-full shadow-lg border border-white/30">
              <Sparkles size={14} className="text-white" />
            </div>
          </div>
        </motion.div>

        {/* LOVENTO AI - Letter by Letter */}
        <div className="flex items-center justify-center space-x-1.5 mb-2 overflow-hidden py-1">
          {appLetters.map((letter, idx) => (
            <motion.span
              key={idx}
              initial={{ y: 28, opacity: 0, scale: 0.8 }}
              animate={
                step >= 2
                  ? { y: 0, opacity: 1, scale: 1 }
                  : { y: 28, opacity: 0, scale: 0.8 }
              }
              transition={{
                delay: idx * 0.06,
                duration: 0.45,
                ease: 'easeOut',
              }}
              className="text-3xl sm:text-4xl font-extrabold tracking-wider bg-gradient-to-r from-pink-400 via-rose-300 to-purple-300 bg-clip-text text-transparent font-['Outfit']"
              style={{
                textShadow: '0 0 20px rgba(244, 63, 94, 0.4)',
              }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
          ))}
          <motion.span
            initial={{ scale: 0 }}
            animate={step >= 2 ? { scale: [0, 1.4, 1] } : { scale: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-2xl text-pink-500 ml-1"
          >
            ❤️
          </motion.span>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={step >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.6 }}
          className="text-sm sm:text-base font-medium text-pink-200/90 tracking-wide flex items-center justify-center gap-1.5 mb-8"
        >
          <span>Your AI Friends.</span>
          <span className="text-pink-400">❤️</span>
        </motion.p>

        {/* Cinematic Creator Branding: BENU RANA */}
        <div className="min-h-[90px] flex flex-col items-center justify-center">
          <AnimatePresence>
            {step >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400/90 mb-1 flex items-center gap-1.5"
              >
                <span className="w-4 h-[1px] bg-gradient-to-r from-transparent to-pink-500" />
                <span>CREATED & DEVELOPED BY</span>
                <span className="w-4 h-[1px] bg-gradient-to-l from-transparent to-pink-500" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step >= 5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="relative py-1 px-4"
              >
                {/* Silver and Pink light sweep background */}
                <motion.div
                  initial={{ x: '-120%' }}
                  animate={{ x: '120%' }}
                  transition={{ duration: 1.4, repeat: 1, repeatDelay: 1 }}
                  className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
                />

                <div className="flex items-center justify-center space-x-1.5">
                  {creatorLetters.map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.4,
                      }}
                      className="text-xl sm:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-purple-200 font-['Outfit'] drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  ))}
                </div>

                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-pink-500 to-transparent mt-1 shadow-[0_0_10px_#ec4899]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Loading Indicator */}
      <div className="relative z-10 w-full max-w-xs flex flex-col items-center pb-4">
        {step >= 6 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center space-y-2"
          >
            <div className="w-full bg-purple-950/80 rounded-full h-1.5 overflow-hidden border border-purple-800/40">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 shadow-[0_0_10px_#f43f5e]"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-pink-300/80 font-medium tracking-wider">
              <Zap size={12} className="animate-bounce text-pink-400" />
              <span>Awakening Companions...</span>
            </div>
          </motion.div>
        ) : (
          <div className="h-6" />
        )}

        <p className="text-[10px] text-slate-500 tracking-wider mt-3">
          LOVENTO AI &bull; Android Mobile Edition
        </p>
      </div>
    </div>
  );
};
