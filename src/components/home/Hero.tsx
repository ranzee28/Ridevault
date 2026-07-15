import { motion } from 'motion/react';
import { Shield, Zap, Clock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

export default function Hero() {
  const [isHovering, setIsHovering] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#050505] pt-20">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Luxury Sport Bike"
          className="w-full h-full object-cover mix-blend-lighten opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-16">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left mt-12 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block text-[#D4AF37] text-[12px] uppercase tracking-[0.4em] font-semibold mb-6">
              {t('hero.badge')}
            </span>
            <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter leading-[0.9] mb-8">
              {t('hero.title1')} <br className="hidden md:block" />
              <motion.span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#94a3b8] via-white to-[#94a3b8] bg-[length:200%_auto]"
                animate={{ backgroundPosition: ["200% center", "-200% center"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                {t('hero.title3')}
              </motion.span>
            </h1>
            <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto lg:mx-0 mb-10 font-light leading-relaxed">
              {t('hero.desc')}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => {
                  if (user) {
                    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/login');
                  }
                }}
                className="w-full sm:w-auto px-10 py-4 bg-white text-black font-semibold rounded-sm hover:bg-[#D4AF37] transition-colors uppercase text-xs tracking-widest"
              >
                {t('hero.cta.reserve')}
              </button>
              <button 
                onClick={() => {
                  if (user) {
                    navigate('/collection');
                  } else {
                    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full sm:w-auto px-10 py-4 bg-white/5 backdrop-blur-md text-[#F3F4F6] border border-white/10 rounded-sm font-semibold hover:bg-white/10 transition-colors uppercase text-xs tracking-widest"
              >
                {t('hero.cta.collection')}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Stats Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-sm lg:w-[400px]"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="relative group cursor-pointer overflow-hidden glassmorphism border border-white/10 bg-[#050505]/40 backdrop-blur-xl p-8 transition-all duration-500 hover:border-white/20">
            
            {/* Interactive Stats Content */}
            <div className={`transition-opacity duration-300 ${isHovering ? 'opacity-0 h-0 hidden' : 'opacity-100'}`}>
              <h3 className="text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] font-bold mb-8">The Vault Advantage</h3>
              <ul className="space-y-6">
                <li className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Fleet Size</span>
                    <span className="text-xl font-bold text-white">50+ Premium Bikes</span>
                  </div>
                </li>
                <div className="h-px w-full bg-white/10 my-4"></div>
                <li className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Assistance</span>
                    <span className="text-xl font-bold text-white">24/7 Global</span>
                  </div>
                </li>
                <div className="h-px w-full bg-white/10 my-4"></div>
                <li className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Community</span>
                    <span className="text-xl font-bold text-white">Verified Riders Only</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Hover Specs Animation */}
            {isHovering && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white"
              >
                <div className="mb-6 flex justify-between items-end">
                  <div>
                    <span className="text-[#D4AF37] text-[10px] uppercase tracking-widest block mb-1">Featured Spec</span>
                    <h3 className="font-bold text-2xl tracking-tight">Supersport Class</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
                  <div>
                    <span className="text-[9px] text-white/40 block uppercase tracking-widest">Top Speed</span>
                    <span className="font-mono text-sm">318 km/h</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/40 block uppercase tracking-widest">Engine</span>
                    <span className="font-mono text-sm">998cc V4</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/40 block uppercase tracking-widest">Power</span>
                    <span className="font-mono text-sm">214 hp</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/40 block uppercase tracking-widest">Price</span>
                    <span className="font-mono text-sm">Rp 5.500.000/Day</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex justify-center">
        <div className="w-[30px] h-[48px] border-2 border-white/50 rounded-full flex justify-center p-2">
          <motion.div
            animate={{
              y: [0, 16, 0],
              opacity: [1, 0, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-1 h-3 bg-white rounded-full"
          />
        </div>
      </div>
    </section>
  );
}
