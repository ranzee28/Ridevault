import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function LayoutPreloader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Noise Background */}
            <div 
              className="absolute -inset-[200%] opacity-[0.03] z-0 pointer-events-none mix-blend-overlay animate-noise" 
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
            ></div>

            {/* Glowing Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#D4AF37]/10 blur-[100px] rounded-full pointer-events-none z-0"></div>

            <div className="relative z-10 flex flex-col items-center">
              {/* Logo Mark */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8 relative"
              >
                <div className="w-16 h-16 border border-[#D4AF37]/30 transform rotate-45 flex items-center justify-center relative bg-[#050505]">
                  <div className="w-12 h-12 bg-gradient-to-tr from-[#D4AF37] to-[#F3E5AB] absolute inset-0 m-auto opacity-80 mix-blend-screen shadow-[0_0_30px_rgba(212,175,55,0.4)]"></div>
                </div>
              </motion.div>

              {/* Brand Text */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <h1 className="text-3xl font-bold tracking-[0.2em] uppercase text-white mb-2">
                  Ride<span className="text-[#D4AF37]">Vault</span>
                </h1>
                <p className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-bold">
                  Elite Motorcycle Rentals
                </p>
              </motion.div>

              {/* Progress Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="w-48 h-[1px] bg-white/10 mt-12 overflow-hidden relative"
              >
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '0%' }}
                  transition={{ duration: 1.5, ease: "easeInOut", delay: 0.8 }}
                  className="absolute top-0 left-0 h-full w-full bg-[#D4AF37]"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </>
  );
}
