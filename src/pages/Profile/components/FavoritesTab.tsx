import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Star, Zap, X, Loader2 } from 'lucide-react';
import { useBikes } from '../../../contexts/BikeContext';
import { Toast } from '../types';

interface FavoritesTabProps {
  userProfile: any;
  navigate: (path: string) => void;
  toggleFavoriteBike: (id: number) => Promise<void>;
  addToast: (toast: Omit<Toast, 'id'>) => void;
}

export default function FavoritesTab({ userProfile, navigate, toggleFavoriteBike, addToast }: FavoritesTabProps) {
  const { bikes } = useBikes();
  const [removingId, setRemovingId] = useState<number | null>(null);

  const handleRemove = async (bikeId: number, bikeName: string) => {
    setRemovingId(bikeId);
    try {
      await toggleFavoriteBike(bikeId);
      addToast({ type: 'info', message: `${bikeName} berhasil dihapus dari favorit.` });
    } catch {
      addToast({ type: 'error', message: 'Gagal memperbarui favorit.' });
    } finally {
      setRemovingId(null);
    }
  };

  const favorites = userProfile?.favorites || [];

  return (
    <motion.div
      key="favorites"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-white font-semibold text-lg">Motor Favorit</h2>
        <p className="text-white/40 text-sm mt-0.5">{favorites.length} motor tersimpan di garasi Anda</p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
            <Heart size={24} className="text-white/15" />
          </div>
          <p className="text-white/40 text-sm">Garasi Anda kosong</p>
          <p className="text-white/25 text-xs mt-1">Simpan superbike favorit Anda dari katalog koleksi</p>
          <button
            onClick={() => navigate('/collection')}
            className="mt-5 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#b8942b] text-black text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            Jelajahi Koleksi
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {favorites.map((bikeId: number, i: number) => {
            const bike = bikes.find(b => b.id === bikeId);
            if (!bike) return null;
            const isRemoving = removingId === bikeId;

            return (
              <motion.div
                key={bikeId}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: isRemoving ? 0.4 : 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all group flex flex-col relative"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-black/30 flex items-center justify-center p-4">
                  <img
                    src={bike.image}
                    alt={bike.model}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 mix-blend-lighten"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(bikeId, `${bike.brand} ${bike.model}`)}
                    disabled={isRemoving}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-red-900/70 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10 hover:border-red-500/30 text-white/50 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    {isRemoving ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                  </button>

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`px-2 py-0.5 text-[8px] uppercase tracking-wider font-bold rounded-sm border backdrop-blur-md ${bike.status === 'Available' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20' : 'bg-black/20 text-white/60 border-white/5'}`}>
                      {bike.status === 'Available' ? 'Tersedia' : bike.status}
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">{bike.brand}</div>
                    <div className="font-bold text-white text-base mt-0.5 truncate uppercase">{bike.model}</div>
                  </div>

                  {/* Detailed Specs list */}
                  <div className="space-y-2 mb-5 text-xs">
                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                      <span className="text-white/40">Mesin</span>
                      <span className="font-medium text-white truncate max-w-[65%] text-right">{bike.engine}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                      <span className="text-white/40">Tenaga</span>
                      <span className="font-medium text-white text-right">{bike.power}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                      <span className="text-white/40">Kecepatan Maks</span>
                      <span className="font-medium text-white text-right">{bike.topSpeed}</span>
                    </div>
                  </div>

                  {/* Pricing & Booking Action */}
                  <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                    <div>
                      <span className="block text-[8px] uppercase tracking-widest text-white/30 font-bold">Harga Harian</span>
                      <span className="text-base font-black text-[#D4AF37] tracking-tight">
                        Rp {bike.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate('/collection')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#050505] hover:bg-[#D4AF37] hover:text-[#050505] border border-white/10 hover:border-transparent text-white text-xs font-semibold rounded-sm transition-all cursor-pointer"
                    >
                      <Zap size={10} /> Sewa Sekarang
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
