import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Share2, Cog, Zap, User, Gauge, Heart, ArrowLeftRight, X, Check, Info } from 'lucide-react';
import BikeDetailsModal from '../ui/BikeDetailsModal';
import CompareModal from '../ui/CompareModal';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBikes } from '../../contexts/BikeContext';
import { useAuth } from '../../contexts/AuthContext';

export default function ShowcaseSlider() {
  const { bikes: showcaseBikes } = useBikes();
  const { user, toggleFavoriteBike } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailBike, setSelectedDetailBike] = useState<number | null>(null);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('favoriteBikes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleFavoritesUpdated = () => {
      try {
        const stored = localStorage.getItem('favoriteBikes');
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (e) {}
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdated);
    return () => window.removeEventListener('favoritesUpdated', handleFavoritesUpdated);
  }, []);

  const toggleFavorite = async (id: number) => {
    if (user) {
      await toggleFavoriteBike(id);
    } else {
      setFavorites(prev => {
        const newFavs = prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id];
        try {
          localStorage.setItem('favoriteBikes', JSON.stringify(newFavs));
          window.dispatchEvent(new Event('favoritesUpdated'));
        } catch (e) {
          // ignore
        }
        return newFavs;
      });
    }
  };

  const next = () => setCurrentIndex((prev) => (prev + 1) % showcaseBikes.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + showcaseBikes.length) % showcaseBikes.length);

  const openDetails = (id: number) => {
    setSelectedDetailBike(id);
    setShowDetailsModal(true);
  };

  const closeDetails = () => {
    setShowDetailsModal(false);
    setSelectedDetailBike(null);
  };

  const toggleCompare = (id: number) => {
    if (compareList.includes(id)) {
      setCompareList(prev => prev.filter(bikeId => bikeId !== id));
    } else {
      if (compareList.length < 2) {
        const newList = [...compareList, id];
        setCompareList(newList);
        if (newList.length === 2) {
          setShowCompareModal(true);
        }
      } else {
        const newList = [compareList[1], id];
        setCompareList(newList);
        setShowCompareModal(true);
      }
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      prev();
    } else if (info.offset.x < -100) {
      next();
    }
  };

  if (showcaseBikes.length === 0) {
    return (
      <section id="collection" className="py-24 bg-[#FAFAFA] border-y border-black/5 overflow-hidden relative select-none">
        {/* 1. Aligned Header Container */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6 w-full">
            <div className="text-center md:text-left">
              <div className="h-3 w-24 bg-black/5 animate-pulse mb-3 rounded" />
              <div className="h-10 w-64 bg-black/5 animate-pulse rounded" />
            </div>
            <div className="h-10 w-32 bg-black/5 animate-pulse rounded" />
          </div>
        </div>

        {/* 2. Expanded Slider Container */}
        <div className="max-w-[1500px] xl:max-w-[1800px] mx-auto px-6 md:px-12 relative z-10 w-full mb-8">
          <div className="relative h-[300px] md:h-[450px] w-full flex justify-center items-center">
            <div className="w-[80%] md:w-[45%] h-full bg-black/5 animate-pulse rounded-sm" />
          </div>
        </div>

        {/* 3. Aligned Controls & Specs Details Container */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="flex justify-center items-center gap-8 mb-16">
            <div className="h-1 w-32 bg-black/5 animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="w-10 h-10 bg-black/5 animate-pulse rounded" />
              <div className="w-10 h-10 bg-black/5 animate-pulse rounded" />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0 mt-8">
            <div className="h-16 w-24 bg-black/5 animate-pulse rounded" />
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-14 flex-1 pt-4 lg:pt-0">
              <div className="h-10 w-24 bg-black/5 animate-pulse rounded" />
              <div className="h-10 w-24 bg-black/5 animate-pulse rounded" />
              <div className="h-10 w-24 bg-black/5 animate-pulse rounded" />
              <div className="h-12 w-48 bg-black/5 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentBike = showcaseBikes[currentIndex];

  return (
    <section id="collection" className="py-24 bg-[#FAFAFA] border-y border-black/5 overflow-hidden relative select-none">
      
      {/* 1. Aligned Header Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Header Display */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6 w-full">
          <div className="text-center md:text-left">
            <p className="text-[#D4AF37] font-semibold text-[10px] uppercase mb-3 tracking-[0.4em]">{t('showcase.badge')}</p>
            <motion.h2 
              key={`brand-${currentBike.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="text-4xl md:text-5xl font-bold tracking-tighter text-[#050505] uppercase cursor-pointer hover:text-[#D4AF37] transition-colors"
              onClick={() => openDetails(currentBike.id)}
            >
              {currentBike.brand} <span className="font-light text-black/20 mx-2 cursor-default">|</span> {currentBike.model}
            </motion.h2>
          </div>
          <Link to="/collection" className="hidden md:flex items-center gap-2 border border-black/20 text-[#050505] px-8 py-3 rounded-sm text-[10px] uppercase tracking-widest hover:bg-[#050505] hover:text-white transition-all duration-500">
            {t('showcase.view_all')} <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* 2. Expanded Slider Container (Up to 1800px wide on desktop to utilize full whitespace beautifully) */}
      <div className="max-w-[1500px] xl:max-w-[1800px] mx-auto px-6 md:px-12 relative z-10 w-full mb-8">
        {/* Cinematic Slider - No backgrounds, floating bikes */}
        <div className="relative h-[300px] md:h-[450px] w-full flex justify-center items-center">
          <AnimatePresence initial={false} mode="popLayout">
            {showcaseBikes.map((bike, index) => {
              const offset = (index - currentIndex + showcaseBikes.length) % showcaseBikes.length;
              let normalizedOffset = offset;
              if (normalizedOffset > showcaseBikes.length / 2) {
                normalizedOffset -= showcaseBikes.length;
              }

              // Only render the visible, neighboring, and active cards to ensure proper AnimatePresence handling
              if (Math.abs(normalizedOffset) > 1.2) return null; 

              return (
                <motion.div
                  key={bike.id}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={handleDragEnd}
                  initial={{
                    x: normalizedOffset > 0 ? '120%' : '-120%',
                    scale: 0.5,
                    opacity: 0,
                  }}
                  animate={{
                    x: `${normalizedOffset * 75}%`,
                    scale: normalizedOffset === 0 ? 1 : 0.65,
                    opacity: normalizedOffset === 0 ? 1 : 0.35,
                    zIndex: normalizedOffset === 0 ? 30 : 10,
                  }}
                  exit={{
                    x: normalizedOffset > 0 ? '-120%' : '-120%',
                    scale: 0.5,
                    opacity: 0,
                  }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 240, 
                    damping: 26,
                    mass: 0.8
                  }}
                  className="absolute w-[80%] md:w-[45%] h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                >
                  <motion.img 
                    animate={normalizedOffset === 0 ? {
                      y: [0, -6, 0],
                    } : { y: 0 }}
                    transition={normalizedOffset === 0 ? {
                      y: {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    } : { duration: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    draggable={false}
                    src={bike.image} 
                    alt={bike.model} 
                    // mix-blend-multiply makes white backgrounds disappear
                    className="w-full h-full object-contain mix-blend-multiply drop-shadow-[0_20px_30px_rgba(0,0,0,0.06)] select-none pointer-events-none" 
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Aligned Controls & Specs Details Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Custom Progress Bar / Arrows (Centered under bikes) */}
        <div className="flex justify-center items-center gap-8 mb-16">
          <div className="flex gap-2 w-32">
            {showcaseBikes.map((_, i) => (
              <div 
                key={i} 
                className={`h-0.5 rounded-none transition-all duration-300 flex-1 ${i === currentIndex ? 'bg-[#D4AF37]' : 'bg-black/10'}`} 
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={prev} className="w-10 h-10 rounded-sm border border-black/10 flex items-center justify-center text-black/60 hover:bg-[#050505] hover:text-white hover:border-[#050505] transition-all bg-white shadow-sm">
              <ChevronLeft size={16} />
            </button>
            <button onClick={next} className="w-10 h-10 rounded-sm border border-black/10 flex items-center justify-center text-black/60 hover:bg-[#050505] hover:text-white hover:border-[#050505] transition-all bg-white shadow-sm">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Footer Details */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0 mt-8">
          
          {/* Left: Giant Index Number */}
          <div className="text-7xl md:text-8xl font-bold tracking-tighter text-black/5 leading-none tabular-nums w-24">
            0{currentIndex + 1}
          </div>

          {/* Center: Specs Grid & Actions */}
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-14 flex-1 pt-4 lg:pt-0">
            
            {/* Price */}
            <motion.div 
              key={`price-${currentBike.id}`}
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 16 }}
              className="flex items-center gap-4"
            >
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold mb-1">{t('showcase.price') || 'Price / Day'}</span>
                <span className="text-[#050505] text-2xl font-bold tracking-tight">Rp {currentBike.price.toLocaleString('id-ID')}</span>
              </div>
            </motion.div>

            {/* Status */}
            <motion.div 
              key={`status-${currentBike.id}`}
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.06 }}
              className="flex items-center gap-4 border-l border-black/10 pl-10 md:pl-14"
            >
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-black/40 font-bold mb-1">{t('showcase.status') || 'Status'}</span>
                <span className="text-sm font-semibold flex items-center gap-2 text-[#050505]">
                  <span className={`w-1.5 h-1.5 rounded-full ${currentBike.status === 'Available' ? 'bg-[#D4AF37]' : 'bg-black/20'}`}></span>
                  {currentBike.status === 'Available' ? (t('showcase.available') || 'Available') : currentBike.status}
                </span>
              </div>
            </motion.div>

            {/* Specifications */}
            <motion.div 
              key={`desc-${currentBike.id}-3`}
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.12 }}
              className="flex items-center gap-4 border-l border-black/10 pl-10 md:pl-14"
            >
              <div className="w-10 h-10 rounded-sm border border-black/10 flex items-center justify-center bg-white shadow-sm">
                <Gauge size={16} className="text-[#D4AF37]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-black/40 font-bold mb-0.5">{t('showcase.spec.power')}</span>
                <span className="text-[#050505] text-sm font-medium">{currentBike.power}</span>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div 
               key={`actions-${currentBike.id}`}
               initial={{ opacity: 0, y: 15 }} 
               animate={{ opacity: 1, y: 0 }} 
               transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.18 }}
               className="flex items-center gap-3 w-full lg:w-auto justify-center lg:ml-8 mt-6 lg:mt-0"
            >
              <button 
                disabled={currentBike.status !== 'Available'}
                onClick={() => navigate(`/reserve/${currentBike.id}`)}
                className="px-10 py-4 bg-[#050505] text-white rounded-sm font-semibold text-[10px] uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#050505] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto shadow-xl shadow-black/10"
              >
                {currentBike.status === 'Available' ? (t('showcase.book_now') || 'Pesan Sekarang') : 'Dipesan'}
              </button>

              <button 
                onClick={() => toggleCompare(currentBike.id)}
                className={`flex gap-2 items-center h-[46px] px-4 shrink-0 rounded-sm border ${compareList.includes(currentBike.id) ? 'border-[#D4AF37] text-[#D4AF37] bg-yellow-50/50' : 'border-black/10 text-black/50 bg-white'} hover:text-[#D4AF37] hover:border-[#D4AF37] hover:bg-zinc-50 transition-all shadow-sm font-semibold text-[10px] uppercase tracking-widest`}
              >
                {compareList.includes(currentBike.id) ? <Check size={16} /> : <ArrowLeftRight size={16} />}
                <span className="hidden sm:inline">
                  {compareList.includes(currentBike.id) ? (t('showcase.added') || 'Added') : compareList.length === 1 ? (t('showcase.compare_1') || 'Compare (1/2)') : (t('showcase.compare') || 'Compare')}
                </span>
              </button>

              <button 
                onClick={() => openDetails(currentBike.id)}
                className="w-[46px] h-[46px] shrink-0 rounded-sm border border-black/10 flex items-center justify-center text-black/40 hover:text-[#D4AF37] hover:border-[#D4AF37] hover:bg-zinc-50 transition-all bg-white shadow-sm"
                title={t('showcase.view_details') || "View Details"}
              >
                <Info size={16} />
              </button>

              <button 
                onClick={() => toggleFavorite(currentBike.id)}
                className={`w-[46px] h-[46px] shrink-0 rounded-sm border flex items-center justify-center transition-all shadow-sm
                  ${favorites.includes(currentBike.id) 
                    ? 'border-red-500 text-red-500 bg-red-50' 
                    : 'border-black/10 text-black/40 hover:text-red-500 hover:border-red-500 hover:bg-red-50 bg-white'}`} 
                title={favorites.includes(currentBike.id) ? (t('showcase.remove_fav') || "Remove from Favorites") : (t('showcase.add_fav') || "Add to Favorites")}
              >
                <Heart size={16} fill={favorites.includes(currentBike.id) ? "currentColor" : "none"} />
              </button>
            </motion.div>

          </div>

          <div className="flex w-full justify-center md:hidden mt-12 border-t border-black/5 pt-8">
            <Link to="/collection" className="flex items-center gap-2 border border-black/20 text-[#050505] px-8 py-3 rounded-sm text-[10px] uppercase tracking-widest hover:bg-[#050505] hover:text-white transition-all duration-500 w-full justify-center">
              {t('showcase.view_all')} <ChevronRight size={14} />
            </Link>
          </div>
          
        </div>
      </div>

      {/* Floating Compare Button */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-40"
          >
            <button 
              onClick={() => {
                if (compareList.length === 2) {
                  setShowCompareModal(true);
                }
              }}
              className={`px-6 py-4 rounded-sm shadow-xl flex items-center gap-3 font-bold text-[10px] uppercase tracking-widest transition-colors ${compareList.length === 2 ? 'bg-[#D4AF37] text-[#050505] hover:bg-[#c2a033] cursor-pointer' : 'bg-black/90 text-white cursor-pointer hover:bg-black/100'}`}
            >
              <ArrowLeftRight size={18} />
              {compareList.length === 2 ? (t('showcase.view_comparison') || 'View Comparison') : (t('showcase.select_more') || 'Select 1 More to Compare')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showCompareModal && compareList.length === 2 && (
          <CompareModal 
            compareList={compareList} 
            onClose={() => setShowCompareModal(false)}
            onClear={() => {
              setCompareList([]);
              setShowCompareModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <BikeDetailsModal 
        isOpen={showDetailsModal} 
        onClose={closeDetails} 
        bike={selectedDetailBike !== null ? showcaseBikes.find(b => b.id === selectedDetailBike) : null} 
        onPrev={() => {
          const idx = showcaseBikes.findIndex(b => b.id === selectedDetailBike);
          if (idx === -1) return;
          const nextIdx = idx > 0 ? idx - 1 : showcaseBikes.length - 1;
          setSelectedDetailBike(showcaseBikes[nextIdx].id);
        }}
        onNext={() => {
          const idx = showcaseBikes.findIndex(b => b.id === selectedDetailBike);
          if (idx === -1) return;
          const nextIdx = idx < showcaseBikes.length - 1 ? idx + 1 : 0;
          setSelectedDetailBike(showcaseBikes[nextIdx].id);
        }}
      />

    </section>
  );
}
