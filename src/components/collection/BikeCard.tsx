import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BikeCardProps {
  key?: React.Key;
  bike: any;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: number) => void;
  onClick: () => void;
}

export default function BikeCard({ bike, isFavorite, onToggleFavorite, onClick }: BikeCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="bg-white border border-black/5 rounded-sm overflow-hidden flex flex-col group shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      {/* Image Container */}
      <div className="h-64 bg-[#FAFAFA] relative flex justify-center items-center p-6 shrink-0 overflow-hidden">
        {/* Skeleton while image loads */}
        <AnimatePresence>
          {!isImageLoaded && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/5 animate-pulse z-0" 
            />
          )}
        </AnimatePresence>

        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={(e) => onToggleFavorite(e, bike.id)}
            className={`w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all bg-white shadow-sm border ${isFavorite ? 'border-red-500 text-red-500 bg-red-50' : 'border-transparent text-black/40 hover:text-red-500'}`}
          >
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
        
        <img 
          src={bike.image?.startsWith('src/') ? '/' + bike.image : bike.image} 
          alt={bike.model} 
          onLoad={() => setIsImageLoaded(true)}
          className={`w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-all duration-700 relative z-1 ${isImageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md scale-95'}`} 
        />
        
        <div className="absolute top-4 left-4 z-10">
          <span className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold rounded-sm border backdrop-blur-md ${bike.status === 'Available' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20' : 'bg-black/10 text-black/60 border-black/10'}`}>
            {bike.status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <p className="text-[#D4AF37] font-bold text-[9px] uppercase tracking-[0.2em] mb-1">{bike.brand}</p>
          <h3 className="text-xl font-bold tracking-tight text-[#050505] uppercase group-hover:text-[#D4AF37] transition-colors line-clamp-1">{bike.model}</h3>
        </div>

        <div className="flex-1 space-y-3 mb-6">
          <div className="flex justify-between items-center text-sm border-b border-black/5 pb-2">
            <span className="text-black/40 font-medium">Engine</span>
            <span className="font-semibold text-right max-w-[60%] line-clamp-1">{bike.engine}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-black/5 pb-2">
            <span className="text-black/40 font-medium">Power</span>
            <span className="font-semibold">{bike.power}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-black/5 pb-2">
            <span className="text-black/40 font-medium">Top Speed</span>
            <span className="font-semibold">{bike.topSpeed}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-4">
          <div>
            <span className="block text-[9px] uppercase tracking-widest text-black/40 font-bold">Tarif Harian</span>
            <span className="text-lg font-black tracking-tight">Rp {bike.price.toLocaleString('id-ID')}</span>
          </div>
          <button 
            disabled={bike.status !== 'Available'}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/reserve/${bike.id}`);
            }}
            className="px-6 py-2.5 bg-[#050505] text-white rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-[#D4AF37] hover:text-[#050505] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bike.status === 'Available' ? 'Pesan Sekarang' : 'Dipesan'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
