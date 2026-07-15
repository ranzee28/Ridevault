import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Share2, Check, Heart, ChevronLeft, ChevronRight, Cpu, Gauge, Zap, RotateCw, Scale, Sliders, Calendar, ShieldCheck, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import RentalCalendar from '../collection/RentalCalendar';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const cleanMetric = (val: string) => {
  if (!val) return '';
  // match anything inside parenthesis, e.g. "112 mph (180 km/h)" -> "180 km/h"
  const match = val.match(/\(([^)]+)\)/);
  if (match) {
    return match[1].replace(/\s*curb\s*/i, '').trim();
  }
  return val;
};

const getKeyFeatures = (model: string) => {
  const m = model.toLowerCase();
  if (m.includes('r1') || m.includes('s1000') || m.includes('cbr') || m.includes('zx') || m.includes('h2') || m.includes('panigale') || m.includes('streetfighter')) {
    return [
      { title: 'Throttle By Wire', desc: '3 Mode Berkendara (Comfort, Sport, Sport+)' },
      { title: 'Quick Shifter', desc: 'Pindah gigi instan tanpa tarik kopling.' },
      { title: 'Assist & Slipper Clutch', desc: 'Tarikan kopling super ringan dan mencegah ban selip.' }
    ];
  }
  if (m.includes('xsr') || m.includes('bonneville') || m.includes('nightster') || m.includes('r7')) {
    return [
      { title: 'Assist & Slipper Clutch', desc: 'Tarikan kopling super ringan dan mencegah ban selip.' },
      { title: 'Anti-lock Braking System', desc: 'Mencegah ban terkunci saat pengereman mendadak.' },
      { title: 'Modern Classic Aesthetic', desc: 'Perpaduan sempurna gaya retro legendaris dengan teknologi modern.' }
    ];
  }
  return [
    { title: 'Throttle By Wire', desc: 'Sensasi berkendara presisi & responsif dengan mode berkendara.' },
    { title: 'Assist & Slipper Clutch', desc: 'Tarikan kopling super ringan dan halus.' },
    { title: 'Dual-Channel ABS', desc: 'Pengereman optimal untuk keamanan maksimum di jalan.' }
  ];
};

export default function BikeDetailsModal({ isOpen, onClose, bike, onNext, onPrev }: { isOpen: boolean, onClose: () => void, bike: any, onNext?: () => void, onPrev?: () => void }) {
  const { user, userProfile, toggleFavoriteBike } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [mainImage, setMainImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState<{ id: string; total: number; startDate: Date; endDate: Date } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (bike) {
        setMainImage(bike.image || '');
        setGallery(bike.gallery || []);
      }
      setIsLoading(true);
      setBookingSuccess(null);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);
      
      const updateFavoriteStatus = () => {
        if (bike) {
          try {
            const stored = localStorage.getItem('favoriteBikes');
            const favs = stored ? JSON.parse(stored) : [];
            setIsFavorite(favs.includes(bike.id));
          } catch (e) {}
          
          if (userProfile?.favorites) {
            setIsFavorite(userProfile.favorites.includes(bike.id));
          }
        }
      };

      updateFavoriteStatus();
      
      window.addEventListener('favoritesUpdated', updateFavoriteStatus);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('favoritesUpdated', updateFavoriteStatus);
      };
    } else {
      setStartDate(null);
      setEndDate(null);
      setBookingSuccess(null);
    }
  }, [isOpen, bike, userProfile]);

  const handleToggleFavorite = async () => {
    if (!bike) return;
    if (user) {
      await toggleFavoriteBike(bike.id);
    } else {
      try {
        const stored = localStorage.getItem('favoriteBikes');
        let favs = stored ? JSON.parse(stored) : [];
        if (favs.includes(bike.id)) {
          favs = favs.filter((id: number) => id !== bike.id);
          setIsFavorite(false);
        } else {
          favs.push(bike.id);
          setIsFavorite(true);
        }
        localStorage.setItem('favoriteBikes', JSON.stringify(favs));
        window.dispatchEvent(new Event('favoritesUpdated'));
      } catch (e) {}
    }
  };

  const handleReserve = () => {
    if (!user) {
      navigate('/login', { state: { from: `/reserve/${bike?.id}` } });
      return;
    }
    // Arahkan ke halaman alur reservasi premium
    onClose();
    navigate(`/reserve/${bike?.id}`);
  };

  let rentalDays = 0;
  if (startDate) {
    if (endDate) {
      rentalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    } else {
      rentalDays = 1;
    }
  }

  let totalPrice = 0;
  let appliedDiscount = 0;
  if (bike) {
    const pricePerDay = bike.price;
    if (rentalDays >= 7) {
      totalPrice = Math.round(pricePerDay * rentalDays * 0.8);
      appliedDiscount = 20;
    } else if (rentalDays >= 3) {
      totalPrice = Math.round(pricePerDay * rentalDays * 0.9);
      appliedDiscount = 10;
    } else if (rentalDays > 0) {
      totalPrice = pricePerDay * rentalDays;
    }
  }

  return (
    <AnimatePresence>
      {isOpen && bike && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 md:px-16 bg-black/70 backdrop-blur-sm py-10 overflow-y-auto">
          {onPrev && !bookingSuccess && (
            <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="hidden md:flex fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-[70] w-12 h-12 lg:w-16 lg:h-16 bg-black/50 hover:bg-black text-[#D4AF37] border border-white/10 hover:border-[#D4AF37] items-center justify-center rounded-full transition-all text-white hover:text-[#D4AF37] group shadow-2xl">
              <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
          {onNext && !bookingSuccess && (
            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="hidden md:flex fixed right-4 lg:right-8 top-1/2 -translate-y-1/2 z-[70] w-12 h-12 lg:w-16 lg:h-16 bg-black/50 hover:bg-black text-[#D4AF37] border border-white/10 hover:border-[#D4AF37] items-center justify-center rounded-full transition-all text-white hover:text-[#D4AF37] group shadow-2xl">
              <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`${bookingSuccess ? 'bg-[#0A0A0F]' : 'bg-white'} max-w-5xl w-full min-h-[600px] rounded-sm shadow-2xl relative flex flex-col my-auto overflow-hidden transition-colors duration-500`}
          >
            <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
              {!bookingSuccess && (
                <>
                  <button
                    onClick={handleToggleFavorite}
                    className="w-10 h-10 bg-white border border-black/10 hover:border-black/30 flex items-center justify-center text-black/60 hover:text-black rounded-sm transition-colors shadow-sm"
                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart size={18} className={isFavorite ? "fill-[#D4AF37] text-[#D4AF37]" : ""} />
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/collection?bike=${bike.id}`;
                      if (navigator.share) {
                        navigator.share({
                          title: `${bike.brand} ${bike.model}`,
                          text: `Check out this ${bike.brand} ${bike.model} motorcycle for rent!`,
                          url: url,
                        }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(url);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }
                    }}
                    className="w-10 h-10 bg-white border border-black/10 hover:border-black/30 flex items-center justify-center text-black/60 hover:text-black rounded-sm transition-colors shadow-sm"
                    title="Share"
                  >
                    {isCopied ? <Check size={18} className="text-green-600" /> : <Share2 size={18} />}
                  </button>
                </>
              )}
              <button 
                onClick={onClose}
                className={`w-10 h-10 flex items-center justify-center rounded-sm transition-colors shadow-sm ${
                  bookingSuccess 
                    ? "bg-white/5 border border-white/10 hover:border-white/30 text-white/60 hover:text-white" 
                    : "bg-white border border-black/10 hover:border-black/30 text-black/60 hover:text-black"
                }`}
              >
                <X size={20} />
              </button>
            </div>
            
            {isLoading ? (
              <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center">
                <Loader2 size={40} className="text-[#D4AF37] animate-spin mb-4" />
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#050505]/40 mt-4">Loading specifications...</p>
              </div>
            ) : bookingSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col md:grid md:grid-cols-12 gap-0 w-full min-h-[600px] bg-[#0A0A0F] text-white p-6 md:p-12 overflow-y-auto"
              >
                {/* Left Column: Visual Delight & Reassurance */}
                <div className="md:col-span-7 flex flex-col justify-between pr-0 md:pr-8 mb-8 md:mb-0">
                  <div className="space-y-6">
                    {/* Animated Checkmark and Title */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                        className="w-16 h-16 bg-[#D4AF37]/15 rounded-full flex items-center justify-center border border-[#D4AF37]/30 mb-6 shadow-[0_0_30px_rgba(212,175,55,0.15)]"
                      >
                        <Check size={28} className="text-[#D4AF37] stroke-[3]" />
                      </motion.div>
                      
                      <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#D4AF37] mb-2">Reservasi Diterima</p>
                      <h3 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white uppercase leading-tight">
                        Petualangan Premium <br />
                        Anda Dimulai.
                      </h3>
                      <p className="text-white/60 text-sm mt-4 leading-relaxed max-w-md">
                        Pilihan luar biasa! Anda baru saja mengamankan salah satu maha karya teknik terbaik di garasi kami. Bersiaplah untuk merasakan sensasi berkendara yang tak tertandingi.
                      </p>
                    </div>

                    {/* Cognitive Psychology: Social Proof & Loyalty Reward */}
                    <div className="space-y-4">
                      {/* Loyalty reward card */}
                      <div className="p-4 bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-l-2 border-[#D4AF37] rounded-r-lg">
                        <div className="flex gap-3">
                          <div className="mt-0.5 text-[#D4AF37]">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Garansi Keamanan RideVault</h4>
                            <p className="text-xs text-white/50 mt-1 leading-relaxed">
                              Pembatalan 100% gratis hingga 24 jam sebelum perjalanan. Armada dilindungi asuransi premium penuh, garansi terawat dan tangki bensin penuh.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* What's Next Steps (Process Clarity to reduce anxiety) */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-[10px] tracking-[0.2em] uppercase font-bold text-white/40">Langkah Selanjutnya:</h4>
                        
                        <div className="flex gap-3 items-start">
                          <span className="w-5 h-5 rounded-full bg-white/5 text-xs text-[#D4AF37] border border-white/10 flex items-center justify-center shrink-0 font-bold">1</span>
                          <div className="text-xs">
                            <span className="font-bold text-white block">Konfirmasi Personal Concierge</span>
                            <span className="text-white/50">Concierge RideVault akan menghubungi Anda via WhatsApp dalam 15 menit untuk verifikasi berkas (KTP & SIM C).</span>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="w-5 h-5 rounded-full bg-white/5 text-xs text-[#D4AF37] border border-white/10 flex items-center justify-center shrink-0 font-bold">2</span>
                          <div className="text-xs">
                            <span className="font-bold text-white block">Penjemputan / Pengantaran Unit</span>
                            <span className="text-white/50">Unit akan diantar ke lokasi Anda secara gratis (area Kuta/Seminyak) lengkap dengan 2 helm premium & jas hujan bersih.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5 mt-6">
                    <a
                      href={`https://wa.me/6281234567890?text=Halo%20RideVault%2C%20saya%20ingin%20mengonfirmasi%20reservasi%20saya%20dengan%20ID%20${bookingSuccess.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3.5 bg-[#D4AF37] text-[#0A0A0F] font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-white transition-colors text-center shadow-lg shadow-[#D4AF37]/10 flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={14} className="fill-current" />
                      Hubungi Concierge
                    </a>
                    
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/profile?tab=rentals');
                      }}
                      className="px-6 py-3.5 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-white/10 transition-colors text-center"
                    >
                      Lihat Reservasi Saya
                    </button>
                  </div>
                </div>

                {/* Right Column: Receipt summary */}
                <div className="md:col-span-5 flex flex-col justify-center">
                  <div className="bg-white/[0.02] border border-white/10 rounded-lg p-6 relative overflow-hidden backdrop-blur-sm">
                    {/* Golden glow */}
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#D4AF37] opacity-10 rounded-full blur-2xl pointer-events-none"></div>
                    
                    <div className="text-center pb-6 border-b border-white/5">
                      <p className="text-[9px] uppercase tracking-widest text-white/40">ID Transaksi</p>
                      <span className="text-sm font-mono font-bold text-[#D4AF37]">{bookingSuccess.id}</span>
                    </div>

                    <div className="py-6 space-y-4 border-b border-white/5">
                      <div className="flex justify-between">
                        <span className="text-xs text-white/40">Unit Kendaraan</span>
                        <span className="text-xs font-bold text-white uppercase">{bike.brand} {bike.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-white/40">Tarif Harian</span>
                        <span className="text-xs font-medium text-white">Rp {bike.price.toLocaleString('id-ID')} / hari</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-white/40">Tanggal Sewa</span>
                        <div className="text-right">
                          <span className="text-xs font-bold text-white block">
                            {bookingSuccess.startDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} - {bookingSuccess.endDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-white/40">({rentalDays} Hari)</span>
                        </div>
                      </div>
                      
                      {appliedDiscount > 0 && (
                        <div className="flex justify-between text-[#D4AF37]">
                          <span className="text-xs">Diskon Spesial ({appliedDiscount}%)</span>
                          <span className="text-xs font-bold">-Rp {Math.round(bike.price * rentalDays * (appliedDiscount / 100)).toLocaleString('id-ID')}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-6 flex justify-between items-center">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Total Pembayaran</span>
                      <span className="text-xl font-black text-[#D4AF37]">Rp {bookingSuccess.total.toLocaleString('id-ID')}</span>
                    </div>

                    {/* Loyalty points card */}
                    <div className="mt-6 p-3.5 bg-[#D4AF37]/5 border border-[#D4AF37]/25 rounded-md flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full animate-pulse shrink-0"></span>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">Dapatkan Poin Loyalitas</span>
                      </div>
                      <span className="text-xs font-black text-[#D4AF37] font-mono">+{rentalDays * 100} PTS</span>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="mt-6 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors text-center"
                  >
                    Tutup & Kembali ke Koleksi
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col w-full h-full">
                {/* Top: Gallery & Main Image (Horizontal Layout) */}
                <div className="w-full p-6 md:p-10 border-b border-black/5 bg-[#FAFAFA] flex flex-col relative group">
                  
                  {onPrev && (
                    <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="md:hidden absolute left-4 top-[45%] -translate-y-1/2 z-20 w-10 h-10 bg-white/80 border border-black/10 flex items-center justify-center text-black/60 rounded-full shadow-md">
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  {onNext && (
                    <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="md:hidden absolute right-4 top-[45%] -translate-y-1/2 z-20 w-10 h-10 bg-white/80 border border-black/10 flex items-center justify-center text-black/60 rounded-full shadow-md">
                      <ChevronRight size={20} />
                    </button>
                  )}

                  <div className="flex-1 flex items-center justify-center mb-6 min-h-[220px] md:min-h-[280px] max-w-xl mx-auto w-full overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={mainImage}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        src={mainImage} 
                        alt={bike.model} 
                        className="w-full h-auto max-h-[280px] md:max-h-[340px] object-contain drop-shadow-2xl mix-blend-multiply cursor-pointer hover:scale-105 transition-transform duration-300" 
                      />
                    </AnimatePresence>
                  </div>
                  
                  <div className="max-w-md mx-auto w-full mt-2">
                    <p className="text-[10px] text-center uppercase font-bold tracking-[0.2em] text-[#D4AF37] mb-2.5">Gallery</p>
                    <div className="flex justify-center gap-3">
                      {gallery && gallery.map((imgUrl: string, i: number) => (
                        <motion.div 
                          key={imgUrl}
                          layout
                          onClick={() => {
                            const currentMain = mainImage;
                            const updatedGallery = [...gallery];
                            updatedGallery[i] = currentMain;
                            setMainImage(imgUrl);
                            setGallery(updatedGallery);
                          }}
                          className="aspect-video w-24 md:w-28 overflow-hidden rounded-sm border border-black/10 bg-black/5 relative group cursor-pointer shadow-sm hover:border-[#D4AF37] transition-all"
                        >
                          <img src={imgUrl} alt={`${bike.model} gallery ${i+1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom: Detailed Specs & Rental Controls in 2 Columns on Desktop */}
                <div className="w-full p-6 md:p-12 bg-white grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  
                  {/* Left Column: Brand, Model, Price Card & Specifications */}
                  <div className="flex flex-col gap-6">
                    <div>
                      <p className="text-[#D4AF37] font-semibold text-[10px] uppercase mb-1 tracking-[0.3em]">{bike.brand}</p>
                      <h3 className="text-3xl md:text-4xl font-bold tracking-tighter text-[#050505] uppercase mb-2.5">{bike.model}</h3>
                      
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#050505] text-[#D4AF37] rounded">
                          Bali | BikeHouse
                        </span>
                        <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200 rounded">
                          GG Motorent - Supersewa
                        </span>
                      </div>
                    </div>

                    {/* Grid Specs */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Engine */}
                      <div className="bg-neutral-50/75 border border-neutral-100 p-3.5 rounded-md flex flex-col justify-between hover:bg-neutral-50 hover:border-neutral-200/80 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 mb-1.5 text-[#D4AF37]">
                          <Cpu size={14} className="stroke-[2.5]" />
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-400">Engine</span>
                        </div>
                        <span className="text-neutral-900 font-bold text-xs md:text-[13px] leading-tight uppercase">{bike.engine}</span>
                      </div>

                      {/* Top Speed */}
                      <div className="bg-neutral-50/75 border border-neutral-100 p-3.5 rounded-md flex flex-col justify-between hover:bg-neutral-50 hover:border-neutral-200/80 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 mb-1.5 text-[#D4AF37]">
                          <Gauge size={14} className="stroke-[2.5]" />
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-400">Top Speed</span>
                        </div>
                        <span className="text-neutral-900 font-bold text-xs md:text-[13px] leading-tight uppercase">{cleanMetric(bike.topSpeed)}</span>
                      </div>

                      {/* Max Power */}
                      <div className="bg-neutral-50/75 border border-neutral-100 p-3.5 rounded-md flex flex-col justify-between hover:bg-neutral-50 hover:border-neutral-200/80 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 mb-1.5 text-[#D4AF37]">
                          <Zap size={14} className="stroke-[2.5]" />
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-400">Max Power</span>
                        </div>
                        <span className="text-neutral-900 font-bold text-xs md:text-[13px] leading-tight uppercase">{bike.power}</span>
                      </div>

                      {/* Torque */}
                      <div className="bg-neutral-50/75 border border-neutral-100 p-3.5 rounded-md flex flex-col justify-between hover:bg-neutral-50 hover:border-neutral-200/80 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 mb-1.5 text-[#D4AF37]">
                          <RotateCw size={14} className="stroke-[2.5]" />
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-400">Torque</span>
                        </div>
                        <span className="text-neutral-900 font-bold text-xs md:text-[13px] leading-tight uppercase">{bike.torque}</span>
                      </div>

                      {/* Weight */}
                      <div className="bg-neutral-50/75 border border-neutral-100 p-3.5 rounded-md flex flex-col justify-between hover:bg-neutral-50 hover:border-neutral-200/80 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 mb-1.5 text-[#D4AF37]">
                          <Scale size={14} className="stroke-[2.5]" />
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-400">Weight</span>
                        </div>
                        <span className="text-neutral-900 font-bold text-xs md:text-[13px] leading-tight uppercase">{cleanMetric(bike.weight)}</span>
                      </div>

                      {/* Suspension */}
                      <div className="bg-neutral-50/75 border border-neutral-100 p-3.5 rounded-md flex flex-col justify-between hover:bg-neutral-50 hover:border-neutral-200/80 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 mb-1.5 text-[#D4AF37]">
                          <Sliders size={14} className="stroke-[2.5]" />
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-400">Suspension</span>
                        </div>
                        <span className="text-neutral-900 font-bold text-[10px] md:text-[11px] leading-snug uppercase">{bike.suspension}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Calendar, Special Offers & Total Calculation */}
                  <div className="flex flex-col justify-between h-full gap-6">
                    <div>
                      <RentalCalendar bikeId={bike.id} onSelectRange={(start, end) => {
                        setStartDate(start);
                        setEndDate(end);
                      }} />
                      
                      <div className="mt-4 p-3 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-sm">
                        <p className="text-[9px] uppercase tracking-widest text-[#050505] opacity-60 mb-2 font-bold">Special Offers</p>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-[#050505]">3 Days Reserve</span>
                          <span className="text-xs font-bold text-[#D4AF37]">Rp {Math.round(bike.price * 3 * 0.9).toLocaleString('id-ID')} <span className="text-[9px] text-[#050505]/40 line-through ml-1 font-normal">Rp {(bike.price * 3).toLocaleString('id-ID')}</span> <span className="text-[9px] ml-1 text-[#050505]/60 bg-black/5 px-1 py-0.5 rounded">-10%</span></span>
                        </div>
                        <div className="flex justify-between items-center bg-[#D4AF37]/10 -mx-2 mb-1 p-2 rounded border border-[#D4AF37]/30">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-[#050505] uppercase tracking-wider">1 Week Reserve</span>
                            <span className="text-[8px] bg-[#050505] text-[#D4AF37] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-widest">Best Value</span>
                          </div>
                          <span className="text-sm font-black text-[#050505]">Rp {Math.round(bike.price * 7 * 0.8).toLocaleString('id-ID')} <span className="text-[9px] text-[#050505]/40 line-through ml-1 font-normal">Rp {(bike.price * 7).toLocaleString('id-ID')}</span> <span className="text-[10px] ml-1 text-[#D4AF37] bg-[#050505] px-1.5 py-0.5 rounded font-bold">-20%</span></span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-neutral-100 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div>
                          {rentalDays > 0 ? (
                            <>
                              <span className="block text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold mb-1">
                                Total ({rentalDays} {rentalDays === 1 ? 'Day' : 'Days'}) 
                                {appliedDiscount > 0 && <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-1 py-0.5 text-[8px] rounded ml-1 border border-[#D4AF37]/20">-{appliedDiscount}% OFF</span>}
                              </span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-[#050505] text-2xl font-black">Rp {totalPrice.toLocaleString('id-ID')}</span>
                                {appliedDiscount > 0 && <span className="text-black/30 text-xs line-through">Rp {(bike.price * rentalDays).toLocaleString('id-ID')}</span>}
                              </div>
                            </>
                          ) : (
                            <>
                              <span className="block text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold mb-1">Daily Rate</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-[#050505] text-2xl font-black">Rp {bike.price.toLocaleString('id-ID')}</span>
                                <span className="text-xs text-neutral-500 font-medium">/ hari</span>
                              </div>
                            </>
                          )}
                        </div>
                        <button 
                          onClick={handleReserve}
                          disabled={bike.status !== 'Available' || isReserving} 
                          className="px-8 py-4 bg-[#050505] text-white rounded-sm font-semibold text-[10px] uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#050505] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/10 flex items-center justify-center gap-2"
                        >
                          {isReserving ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Reserve Now'
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-neutral-500 font-medium mt-1">
                        *Termasuk Helm &amp; Jas Hujan
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
