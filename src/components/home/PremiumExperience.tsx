import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Map, Camera, Key, Clock, Shield, Check, Wrench, Crown, Trash2, ArrowRight, Truck } from 'lucide-react';
import { LampContainer } from '../ui/lamp';

export default function PremiumExperience() {
  const navigate = useNavigate();

  // State to store selected add-on services
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  // State for simulating Elite Member discount benefits
  const [isSimulatingMember, setIsSimulatingMember] = useState<boolean>(false);

  // Load initial selection from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ridevault_selected_services');
      if (saved) {
        setSelectedServices(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load selected services', e);
    }
  }, []);

  // Save selected services to localStorage whenever they change
  const saveToStorage = (updated: string[]) => {
    setSelectedServices(updated);
    try {
      localStorage.setItem('ridevault_selected_services', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save selected services', e);
    }
  };

  // Toggle selection handler
  const toggleService = (id: string) => {
    const isSelected = selectedServices.includes(id);
    const updated = isSelected 
      ? selectedServices.filter(s => s !== id) 
      : [...selectedServices, id];
    saveToStorage(updated);
  };

  // Clear all selections
  const clearAllServices = () => {
    saveToStorage([]);
  };

  // Service details for pricing calculations
  const servicesData = [
    {
      id: 'riding-gear',
      title: 'Perlengkapan Riding Premium',
      price: 150000,
      isDaily: true,
    },
    {
      id: 'guided-tour',
      title: 'Tur Terpandu Jalur Premium',
      price: 500000,
      isDaily: true,
    },
    {
      id: 'concierge-delivery',
      title: 'Pengiriman Pramutamu',
      price: 250000,
      isDaily: false, // flat rate per trip
    },
    {
      id: 'emergency-assistance',
      title: 'Asistensi Darurat 24/7',
      price: 75000,
      isDaily: true,
    }
  ];

  // Detailed list of features included in each service
  const inclusions: Record<string, string[]> = {
    'riding-gear': [
      'Helm Premium Standard ECE/DOT (Shoei / AGV Full-face)',
      'Jaket Protektor Komine (Fitur Aliran Udara / Mesh)',
      'Sarung Tangan Alpinestars dengan Perlindungan Carbon',
      'Action Cam GoPro Hero 11 Black + Memory Card & Mount'
    ],
    'guided-tour': [
      'Pemandu Tur (Road Captain) Profesional & Berlisensi',
      'Intercom Sena Pre-paired untuk Komunikasi Grup',
      'Dokumentasi Premium (Foto Profesional & Drone Footage)',
      'Rute Custom Eksotis (Pesisir Pantai & Pegunungan)'
    ],
    'concierge-delivery': [
      'Truk Towing Hidrolik Tertutup Khusus Moge',
      'Driver Berpengalaman & Tepat Waktu',
      'Pengantaran Langsung ke Bandara, Vila, atau Hotel',
      'Pemeriksaan Unit & BBM Full Tank Saat Serah Terima'
    ],
    'emergency-assistance': [
      'Mekanik Siaga Darurat 24 Jam di Seluruh Wilayah',
      'Layanan Tambal Ban Tubeless & Jumper Aki Instan',
      'Derek / Towing Gratis ke Bengkel jika Kendala Berat',
      'Penyediaan Unit Motor Pengganti Instan di Lokasi'
    ]
  };

  // Calculate totals
  const dailyAddonsTotal = servicesData
    .filter(s => selectedServices.includes(s.id) && s.isDaily)
    .reduce((sum, s) => sum + s.price, 0);

  const flatAddonsTotal = servicesData
    .filter(s => selectedServices.includes(s.id) && !s.isDaily)
    .reduce((sum, s) => sum + s.price, 0);

  // Elite Member pricing calculations
  const memberDailyAddonsTotal = servicesData
    .filter(s => selectedServices.includes(s.id) && s.isDaily)
    .reduce((sum, s) => {
      if (s.id === 'riding-gear' || s.id === 'emergency-assistance') return sum; // FREE
      if (s.id === 'guided-tour') return sum + (s.price * 0.8); // 20% off
      return sum + s.price;
    }, 0);

  const memberFlatAddonsTotal = servicesData
    .filter(s => selectedServices.includes(s.id) && !s.isDaily)
    .reduce((sum, s) => {
      if (s.id === 'concierge-delivery') return sum; // FREE
      return sum + s.price;
    }, 0);

  const standardTotal = dailyAddonsTotal + flatAddonsTotal;
  const memberTotal = memberDailyAddonsTotal + memberFlatAddonsTotal;
  const totalSavings = standardTotal - memberTotal;

  return (
    <section id="experience" className="bg-[#050505] border-t border-white/5 relative overflow-hidden py-1">
      <LampContainer>
        <motion.span
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="text-[#D4AF37] text-[10px] uppercase tracking-[0.4em] font-semibold mb-2 block text-center mt-20"
        >
          RideVault Experience
        </motion.span>
        <motion.h2
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.1,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="mt-4 bg-gradient-to-br from-[#F3E5AB] to-[#D4AF37] py-4 bg-clip-text text-center text-4xl font-bold tracking-tighter text-transparent md:text-6xl leading-[1.1]"
        >
          Layanan Terbaik <br /> Untuk Perjalanan Anda
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.2,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="text-white/40 text-sm md:text-base leading-relaxed font-light text-center max-w-2xl mt-4"
        >
          Maksimalkan petualangan berkendara premium Anda dengan pilihan layanan pramutamu eksklusif dan fasilitas tambahan yang dirancang khusus untuk keselamatan, kenyamanan, dan kepuasan optimal.
        </motion.p>
      </LampContainer>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 pb-20 -mt-40">
        
        {/* Helper Tip */}
        <div className="flex justify-center mb-8">
          <p className="text-[11px] text-[#D4AF37]/80 bg-[#D4AF37]/5 px-4 py-1.5 rounded-full border border-[#D4AF37]/20 flex items-center gap-2 uppercase tracking-wider font-semibold animate-pulse">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Tip: Klik kartu di bawah untuk memilih layanan & simulasikan add-on Anda
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          
          {/* Kartu 1: Perlengkapan Riding Premium (Kiri - Ukuran Besar) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.99 }}
            onClick={() => toggleService('riding-gear')}
            className={`md:col-span-2 md:row-span-2 relative rounded-sm overflow-hidden bg-[#0A0A0A] border transition-all duration-300 group cursor-pointer min-h-[500px] md:min-h-[580px] h-auto shadow-2xl flex flex-col justify-end ${
              selectedServices.includes('riding-gear')
                ? 'border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/50'
                : 'border-white/5 hover:border-white/10'
            }`}
          >
            {/* Image Background */}
            <div className="absolute inset-0 z-0">
              <div className={`absolute inset-0 bg-black/50 transition-colors duration-500 z-10 ${selectedServices.includes('riding-gear') ? 'bg-black/30' : 'group-hover:bg-black/30'}`}></div>
              <img 
                src="https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=80" 
                alt="Perlengkapan Riding Premium" 
                className="w-full h-full object-cover grayscale mix-blend-lighten group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out" 
              />
            </div>

            {/* Selection Status Badge */}
            <div className="absolute top-6 right-6 z-30">
              <AnimatePresence mode="wait">
                {selectedServices.includes('riding-gear') ? (
                  <motion.span 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37] text-black text-[9px] uppercase tracking-wider font-extrabold rounded-full shadow-lg"
                  >
                    <Check size={10} strokeWidth={3} /> Ditambahkan
                  </motion.span>
                ) : (
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white/50 border border-white/10 text-[9px] uppercase tracking-wider font-bold rounded-full group-hover:text-white transition-colors">
                    + Tambahkan
                  </span>
                )}
              </AnimatePresence>
            </div>

            {/* Content Section */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent z-20 p-8 md:p-10 flex flex-col justify-end">
              <div className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center mb-5 border transition-all duration-500 ${
                selectedServices.includes('riding-gear')
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                  : 'bg-white/5 text-white border-white/10 group-hover:bg-[#D4AF37] group-hover:text-black group-hover:border-[#D4AF37]'
              }`}>
                <Shield size={20} />
              </div>
              
              <div className="flex items-baseline gap-2 mb-2">
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight uppercase">Perlengkapan Riding Premium</h3>
              </div>

              <p className="text-white/60 font-light text-xs md:text-sm mb-4 max-w-sm leading-relaxed group-hover:text-white/80 transition-colors">
                Sewa helm standar internasional, jaket protektor, sarung tangan, hingga action cam untuk mendokumentasikan perjalanan Anda dengan aman.
              </p>

              {/* Inclusions Detail Panel */}
              <AnimatePresence>
                {selectedServices.includes('riding-gear') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="border-t border-white/10 pt-4 overflow-hidden"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold mb-2">Fasilitas Termasuk:</p>
                    <ul className="space-y-1.5">
                      {inclusions['riding-gear'].map((item, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="text-[11px] text-white/75 flex items-center gap-2"
                        >
                          <span className="text-[#D4AF37] text-xs">✓</span> {item}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex items-center justify-between">
                <span className="text-[#D4AF37] font-mono text-xs font-semibold">
                  Rp 150.000 <span className="text-white/40 text-[10px]">/ hari</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#D4AF37]/80 group-hover:text-[#D4AF37] transition-colors flex items-center gap-1">
                  {selectedServices.includes('riding-gear') ? 'Klik untuk Hapus' : 'Klik untuk Pilih'} <ArrowRight size={10} />
                </span>
              </div>
            </div>
          </motion.div>

          {/* Kartu 2: Tur Terpandu Jalur Premium (Rana Atas - col-span-2) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.99 }}
            onClick={() => toggleService('guided-tour')}
            className={`md:col-span-2 relative rounded-sm overflow-hidden bg-[#0A0A0A] border transition-all duration-300 group cursor-pointer min-h-[280px] md:min-h-[320px] h-auto flex flex-col justify-end ${
              selectedServices.includes('guided-tour')
                ? 'border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/50'
                : 'border-white/5 hover:border-white/10'
            }`}
          >
            {/* Image Background */}
            <div className="absolute inset-0 z-0">
              <div className={`absolute inset-0 bg-black/60 transition-colors duration-500 z-10 ${selectedServices.includes('guided-tour') ? 'bg-black/40' : 'group-hover:bg-black/40'}`}></div>
              <img 
                src="https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?auto=format&fit=crop&w=1200&q=80" 
                alt="Tur Terpandu Jalur Premium" 
                className="w-full h-full object-cover grayscale opacity-55 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out" 
              />
            </div>

            {/* Selection Status Badge */}
            <div className="absolute top-5 right-5 z-30">
              <AnimatePresence mode="wait">
                {selectedServices.includes('guided-tour') ? (
                  <motion.span 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37] text-black text-[9px] uppercase tracking-wider font-extrabold rounded-full shadow-lg"
                  >
                    <Check size={10} strokeWidth={3} /> Ditambahkan
                  </motion.span>
                ) : (
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white/50 border border-white/10 text-[9px] uppercase tracking-wider font-bold rounded-full group-hover:text-white transition-colors">
                    + Tambahkan
                  </span>
                )}
              </AnimatePresence>
            </div>

            {/* Content Section */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent z-20 p-6 md:p-8">
              <div className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center mb-3 border transition-all duration-300 ${
                selectedServices.includes('guided-tour')
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                  : 'bg-white/5 text-white border-white/10 group-hover:bg-white group-hover:text-black group-hover:border-white'
              }`}>
                <Map size={16} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Tur Terpandu Jalur Premium</h3>
              <p className="text-white/50 text-xs font-light mb-4 max-w-lg leading-relaxed group-hover:text-white/70 transition-colors">
                Nikmati rute perjalanan terbaik yang telah dikurasi oleh pemandu profesional, mulai dari jalur pesisir pantai hingga pegunungan spektakuler.
              </p>

              {/* Inclusions Detail Panel */}
              <AnimatePresence>
                {selectedServices.includes('guided-tour') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="border-t border-white/10 pt-4 overflow-hidden mb-4"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold mb-2">Fasilitas Termasuk:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                      {inclusions['guided-tour'].map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="text-[11px] text-white/75 flex items-center gap-2"
                        >
                          <span className="text-[#D4AF37] text-xs">✓</span> {item}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex items-center justify-between">
                <span className="text-[#D4AF37] font-mono text-xs font-semibold">
                  Rp 500.000 <span className="text-white/40 text-[10px]">/ hari</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-white/40 group-hover:text-[#D4AF37] transition-colors">
                  {selectedServices.includes('guided-tour') ? 'Hapus Pilihan' : 'Pilih Layanan'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Kartu 3: Pengiriman Pramutamu (Kanan Bawah Kiri - col-span-1) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.99 }}
            onClick={() => toggleService('concierge-delivery')}
            className={`relative rounded-sm overflow-hidden bg-[#0e0e0e] border transition-all duration-300 group cursor-pointer min-h-[300px] md:min-h-[340px] h-auto flex flex-col p-6 md:p-8 justify-between ${
              selectedServices.includes('concierge-delivery')
                ? 'border-[#D4AF37] bg-[#12100a] shadow-[0_0_30px_rgba(212,175,55,0.12)] ring-1 ring-[#D4AF37]/40'
                : 'border-white/5 hover:bg-[#121212] hover:border-white/10'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 shadow-inner ${
                selectedServices.includes('concierge-delivery')
                  ? 'bg-[#D4AF37]/25 text-[#D4AF37] border-[#D4AF37]/50'
                  : 'bg-black/50 text-white/50 border-white/5 group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/30'
              }`}>
                <Truck size={18} />
              </div>
              
              <AnimatePresence mode="wait">
                {selectedServices.includes('concierge-delivery') ? (
                  <motion.span 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="text-[8px] uppercase tracking-wider text-black font-extrabold bg-[#D4AF37] px-2 py-0.5 rounded-sm shadow-sm"
                  >
                    Terpilih
                  </motion.span>
                ) : (
                  <span className="text-[8px] uppercase tracking-widest text-[#D4AF37] font-bold bg-[#D4AF37]/10 px-2 py-0.5 rounded-sm">
                    Premium
                  </span>
                )}
              </AnimatePresence>
            </div>
             
            <div className="mt-4 flex-1 flex flex-col justify-end">
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">Pengiriman Pramutamu</h3>
              <p className="text-white/40 text-[11px] font-light mb-4 leading-relaxed group-hover:text-white/60 transition-colors">
                Layanan antar-jemput motor menggunakan towing khusus langsung ke vila, hotel, atau bandara. Motor tiba dalam kondisi siap gas.
              </p>

              {/* Inclusions Detail Panel */}
              <AnimatePresence>
                {selectedServices.includes('concierge-delivery') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="border-t border-white/10 pt-4 overflow-hidden mb-4"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold mb-2">Fasilitas Termasuk:</p>
                    <ul className="space-y-1.5">
                      {inclusions['concierge-delivery'].map((item, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="text-[10px] text-white/75 flex items-start gap-1.5 leading-tight"
                        >
                          <span className="text-[#D4AF37] text-xs shrink-0">✓</span>
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[#D4AF37] font-mono text-[11px] font-semibold">
                  Rp 250.000 <span className="text-white/40 text-[9px]">/ trip</span>
                </span>
                <span className="text-[9px] font-bold text-white/50 group-hover:text-white transition-colors">
                  {selectedServices.includes('concierge-delivery') ? '✓' : '+'}
                </span>
              </div>
            </div>
          </motion.div>
          
          {/* Kartu 4: Asistensi Darurat 24/7 (Kanan Bawah Kanan - col-span-1) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.99 }}
            onClick={() => toggleService('emergency-assistance')}
            className={`relative rounded-sm overflow-hidden bg-[#0e0e0e] border transition-all duration-300 group cursor-pointer min-h-[300px] md:min-h-[340px] h-auto flex flex-col p-6 md:p-8 justify-between ${
              selectedServices.includes('emergency-assistance')
                ? 'border-[#D4AF37] bg-[#12100a] shadow-[0_0_30px_rgba(212,175,55,0.12)] ring-1 ring-[#D4AF37]/40'
                : 'border-white/5 hover:bg-[#121212] hover:border-white/10'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 shadow-inner ${
                selectedServices.includes('emergency-assistance')
                  ? 'bg-[#D4AF37]/25 text-[#D4AF37] border-[#D4AF37]/50'
                  : 'bg-black/50 text-white/50 border-white/5 group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/30'
              }`}>
                <Wrench size={18} />
              </div>
              
              <AnimatePresence mode="wait">
                {selectedServices.includes('emergency-assistance') ? (
                  <motion.span 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="text-[8px] uppercase tracking-wider text-black font-extrabold bg-[#D4AF37] px-2 py-0.5 rounded-sm shadow-sm"
                  >
                    Terpilih
                  </motion.span>
                ) : (
                  <span className="text-[8px] uppercase tracking-widest text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-sm">
                    24/7 Siaga
                  </span>
                )}
              </AnimatePresence>
            </div>
             
            <div className="mt-4 flex-1 flex flex-col justify-end">
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">Asistensi Darurat 24/7</h3>
              <p className="text-white/40 text-[11px] font-light mb-4 leading-relaxed group-hover:text-white/60 transition-colors">
                Perlindungan penuh di jalan terbuka. Tim mekanik darurat kami siap meluncur ke lokasi Anda kapan saja jika terjadi kendala teknis.
              </p>

              {/* Inclusions Detail Panel */}
              <AnimatePresence>
                {selectedServices.includes('emergency-assistance') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="border-t border-white/10 pt-4 overflow-hidden mb-4"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold mb-2">Fasilitas Termasuk:</p>
                    <ul className="space-y-1.5">
                      {inclusions['emergency-assistance'].map((item, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="text-[10px] text-white/75 flex items-start gap-1.5 leading-tight"
                        >
                          <span className="text-[#D4AF37] text-xs shrink-0">✓</span>
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[#D4AF37] font-mono text-[11px] font-semibold">
                  Rp 75.000 <span className="text-white/40 text-[9px]">/ hari</span>
                </span>
                <span className="text-[9px] font-bold text-white/50 group-hover:text-white transition-colors">
                  {selectedServices.includes('emergency-assistance') ? '✓' : '+'}
                </span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Real-time Dynamic Cost Simulator Panel with Elite Member Benefits Simulation */}
        <AnimatePresence>
          {selectedServices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="mt-8 p-6 bg-[#0E0E0E] border border-[#D4AF37]/20 rounded-sm relative overflow-hidden flex flex-col lg:flex-row justify-between items-stretch gap-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
              
              {/* Left Column: List of chosen services */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
                    <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#D4AF37]">
                      Kalkulator Add-on Layanan Tambahan Terpilih
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedServices.map(serviceId => {
                      const serv = servicesData.find(s => s.id === serviceId);
                      let privilegeText = '';
                      if (serviceId === 'riding-gear') privilegeText = 'GRATIS';
                      if (serviceId === 'guided-tour') privilegeText = 'DISKON 20%';
                      if (serviceId === 'concierge-delivery') privilegeText = 'GRATIS';
                      if (serviceId === 'emergency-assistance') privilegeText = 'GRATIS';

                      return (
                        <span 
                          key={serviceId} 
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs transition-colors ${
                            isSimulatingMember 
                              ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-white' 
                              : 'bg-[#161616] border border-white/5 text-white/90'
                          }`}
                        >
                          <Check size={11} className="text-[#D4AF37]" />
                          <span>{serv?.title}</span>
                          {isSimulatingMember && (
                            <span className="ml-1 text-[9px] bg-[#D4AF37] text-black px-1.5 py-0.5 rounded-sm font-black tracking-wide">
                              {privilegeText}
                            </span>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleService(serviceId);
                            }} 
                            className="ml-2 text-white/40 hover:text-[#D4AF37] transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Member Simulation Prompt & Explainer */}
                <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-white/60">
                    {isSimulatingMember ? (
                      <p className="flex items-center gap-2 text-emerald-400 font-medium">
                        <Crown size={14} /> Simulasi Elite Member Aktif: Anda menikmati fasilitas gratis & diskon khusus!
                      </p>
                    ) : (
                      <p className="text-white/40 font-light">
                        Ingin tahu seberapa hemat jika menjadi Elite Member? Aktifkan simulasi di samping.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Mode & Cost Comparison */}
              <div className="flex flex-col sm:flex-row lg:flex-col justify-between items-end gap-6 shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8 w-full lg:w-auto">
                {/* Simulation Toggle Switch */}
                <button
                  onClick={() => setIsSimulatingMember(!isSimulatingMember)}
                  className={`px-4 py-2.5 rounded-sm text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-2 transition-all duration-300 w-full sm:w-auto justify-center ${
                    isSimulatingMember
                      ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                      : 'bg-white/5 text-white/70 border border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                  }`}
                >
                  <Crown size={12} className={isSimulatingMember ? 'animate-bounce' : ''} />
                  {isSimulatingMember ? 'Matikan Simulasi Member' : 'Simulasi Diskon Elite Member'}
                </button>

                {/* Price Display */}
                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                      {isSimulatingMember ? 'Biaya Setelah Diskon Member' : 'Estimasi Total Biaya Tambahan'}
                    </p>
                    
                    {isSimulatingMember ? (
                      <div className="flex flex-col items-end">
                        {/* Old price crossed out */}
                        <div className="flex items-center gap-1.5 text-white/30 text-xs line-through font-mono">
                          {dailyAddonsTotal > 0 && <span>Rp {dailyAddonsTotal.toLocaleString('id-ID')}/hari</span>}
                          {flatAddonsTotal > 0 && <span>+ Rp {flatAddonsTotal.toLocaleString('id-ID')}</span>}
                        </div>
                        {/* New VIP price */}
                        <div className="flex flex-col text-right">
                          {memberDailyAddonsTotal > 0 ? (
                            <span className="font-mono text-xl font-bold text-emerald-400">
                              Rp {memberDailyAddonsTotal.toLocaleString('id-ID')} <span className="text-white/40 text-[10px] font-sans">/ hari</span>
                            </span>
                          ) : (
                            selectedServices.some(id => servicesData.find(s => s.id === id)?.isDaily) && (
                              <span className="font-mono text-xl font-black text-emerald-400 uppercase tracking-wider">
                                GRATIS <span className="text-[10px] font-normal text-white/40 font-sans">/ hari</span>
                              </span>
                            )
                          )}
                          
                          {memberFlatAddonsTotal > 0 ? (
                            <span className="font-mono text-xs text-emerald-400/80">
                              + Rp {memberFlatAddonsTotal.toLocaleString('id-ID')} <span className="text-white/40 text-[9px] font-sans">(sekali sewa)</span>
                            </span>
                          ) : (
                            selectedServices.some(id => !servicesData.find(s => s.id === id)?.isDaily) && (
                              <span className="font-mono text-xs text-emerald-400/80 uppercase tracking-widest font-black">
                                + GRATIS <span className="text-white/40 text-[9px] font-sans font-normal">(sekali sewa)</span>
                              </span>
                            )
                          )}
                        </div>
                        {/* Savings Badge */}
                        <span className="mt-1.5 inline-block text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-sm font-bold border border-emerald-500/20 uppercase tracking-wider">
                          Hemat Rp {totalSavings.toLocaleString('id-ID')}! 👑
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col text-[#D4AF37]">
                        {dailyAddonsTotal > 0 && (
                          <span className="font-mono text-lg font-bold">
                            Rp {dailyAddonsTotal.toLocaleString('id-ID')} <span className="text-white/40 text-[10px] font-sans">/ hari</span>
                          </span>
                        )}
                        {flatAddonsTotal > 0 && (
                          <span className="font-mono text-[11px] text-white/60">
                            + Rp {flatAddonsTotal.toLocaleString('id-ID')} <span className="text-white/40 text-[9px] font-sans">(sekali sewa)</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={clearAllServices}
                    className="p-3 bg-white/5 border border-white/10 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/30 text-white/60 hover:text-[#D4AF37] rounded-sm transition-all duration-300 h-11 w-11 flex items-center justify-center shrink-0"
                    title="Hapus Semua Pilihan"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kartu 5: Elite Membership (Landscape Banner di bagian paling bawah) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="md:col-span-4 relative rounded-sm overflow-hidden border border-[#D4AF37]/20 bg-[#D4AF37]/5 flex flex-col md:flex-row items-center p-8 md:p-12 hover:bg-[#D4AF37]/10 transition-all duration-500 mt-8 shadow-xl"
        >
          <div className="absolute top-1/2 -translate-y-1/2 right-10 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-1000">
            <Crown size={240} className="text-[#D4AF37]" />
          </div>
          
          <div className="relative z-10 flex-1 md:pr-12 mb-8 md:mb-0">
             <div className="flex gap-4 items-center mb-4 text-[#D4AF37]">
               <Crown size={20} className="animate-bounce" />
               <span className="text-[10px] uppercase tracking-[0.4em] font-extrabold block">Elite Membership</span>
             </div>
             <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4 tracking-tight uppercase">
               Bergabung dengan Klub RideVault Exclusive
             </h3>
             <p className="text-white/60 font-light max-w-2xl text-xs md:text-sm leading-relaxed">
               Dapatkan potongan harga sewa hingga 20%, akses prioritas motor terbaru, serta undangan eksklusif ke acara private riding bulanan. Rasakan privilege berkendara sesungguhnya.
             </p>
          </div>
          
          <div className="relative z-10 shrink-0 w-full md:w-auto">
             <button 
               onClick={() => navigate('/login')}
               className="w-full md:w-auto px-10 py-4 bg-[#D4AF37] text-black font-black text-[10px] uppercase tracking-widest rounded-sm hover:bg-white transition-colors duration-300 shadow-[0_0_25px_rgba(212,175,55,0.25)] hover:shadow-[0_0_35px_rgba(255,255,255,0.35)] flex items-center justify-center gap-2"
             >
               Gabung Sekarang <ArrowRight size={12} />
             </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
