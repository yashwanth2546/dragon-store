import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function IntroLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          setTimeout(() => {
            setDone(true);
            onComplete();
          }, 350);
          return 100;
        }
        return p + 6;
      });
    }, 40);
    return () => clearInterval(t);
  }, [onComplete]);

  const skip = () => {
    setDone(true);
    onComplete();
  };

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[60] flex select-none flex-col items-center justify-center bg-bg"
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-grid bg-grid-fade opacity-40" />
          <div className="absolute left-1/2 top-1/2 h-[40vmax] w-[40vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-[120px]" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center"
          >
            <div className="mb-5 flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 items-center justify-center">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold-deep to-gold-bright blur-[8px]" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-surface font-display text-xl text-gold-bright">
                  R
                </div>
              </div>
              <span className="font-tech text-[10px] uppercase tracking-[0.4em] text-dim">
                Hyderabad · India
              </span>
            </div>

            <h1 className="font-display text-[clamp(3rem,10vw,6rem)] leading-none tracking-tight text-ink">
              RYU<span className="text-gradient-gold glow-text">GEAR</span>
            </h1>

            <p className="mt-3 font-tech text-[11px] uppercase tracking-[0.5em] text-mut">
              Level up your game
            </p>

            {/* progress */}
            <div className="mt-10 w-64">
              <div className="mb-2 flex justify-between font-tech text-[10px] uppercase tracking-[0.25em] text-dim">
                <span>System init</span>
                <span className="text-gold-bright">{progress}%</span>
              </div>
              <div className="h-px overflow-hidden bg-surface">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold-deep to-gold-bright shadow-[0_0_8px_rgba(217,168,60,0.8)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <button
              onClick={skip}
              className="interactive mt-10 min-h-11 rounded-full border border-line px-6 font-tech text-[10px] uppercase tracking-[0.3em] text-dim transition-colors hover:border-gold/50 hover:text-gold-bright"
            >
              Skip intro
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
