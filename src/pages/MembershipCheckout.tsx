import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, CreditCard, ChevronRight, ArrowLeft, Tag, Info, AlertCircle, Loader2 } from 'lucide-react';
import { membershipApi } from '../lib/membershipApi';
import { supabase } from '../lib/supabase';

// Synced Data from Membership.tsx
const TIERS: Record<string, any> = {
  bronze: { 
    name: 'Bronze', 
    price: 750000, 
    displayPrice: 'Rp 750 ribu',
    benefits: ['Akses ke armada sport standar', 'Diskon 5% tarif harian', 'Prioritas pemesanan standar', 'Termasuk asuransi dasar'] 
  },
  silver: { 
    name: 'Silver', 
    price: 1500000, 
    displayPrice: 'Rp 1.5 juta',
    benefits: ['Akses Prioritas Pemesanan', 'Diskon eksklusif 10%', 'Dukungan pelanggan prioritas', 'Termasuk asuransi premium', '1 kali pengiriman gratis per bulan'] 
  },
  gold: { 
    name: 'Gold', 
    price: 3000000, 
    displayPrice: 'Rp 3 juta',
    benefits: ['Akses ke armada VIP eksklusif', 'Diskon 20% untuk semua penyewaan', 'Tanpa deposit keamanan', 'Pengiriman gratis tanpa batas', 'Pengalaman Touring VIP', 'Perlindungan Asuransi Prioritas', 'Concierge Khusus 24/7', 'Akses Acara Privat'] 
  }
};

export default function MembershipCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState(location.state?.tier || 'silver');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const tierInfo = TIERS[selectedTier];
  const taxAmount = tierInfo.price * 0.11; // 11% tax
  const finalTotal = tierInfo.price + taxAmount;

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
      setUserProfile(data);
    };
    fetchUser();
  }, [navigate]);

  const handleNextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 7));
  const handlePrevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const processPayment = async () => {
    setIsProcessing(true);
    handleNextStep(); // Go to step 6 (Processing)
    
    // Simulate API delay
    setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const success = await membershipApi.processMembershipPayment(
          user.id,
          selectedTier,
          finalTotal,
          paymentMethod
        );
        if (success) {
          handleNextStep(); // Go to step 7 (Success)
        } else {
          alert("Payment failed. Please try again.");
          handlePrevStep();
        }
      }
      setIsProcessing(false);
    }, 3000);
  };

  const isProfileComplete = userProfile?.phone && userProfile?.email;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#D4AF37]">Detail Keanggotaan</h2>
            <div className="bg-[#111] p-6 rounded-xl border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold">Tier {tierInfo.name}</h3>
                  <p className="text-gray-400">Tagihan Bulanan</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{tierInfo.displayPrice} <span className="text-sm font-normal text-gray-400">/bln</span></div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="font-semibold text-gray-300">Keuntungan yang Didapat:</p>
                <ul className="space-y-2">
                  {tierInfo.benefits.map((benefit: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-400">
                      <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <button onClick={handleNextStep} className="w-full py-4 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-yellow-500 transition">
              Lanjut ke Verifikasi
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#D4AF37]">Konfirmasi Akun</h2>
            <div className="bg-[#111] p-6 rounded-xl border border-white/10 space-y-4">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-xl font-bold">
                  {userProfile?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{userProfile?.name || 'Loading...'}</h3>
                  <p className="text-gray-400">{userProfile?.email}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="font-semibold">Daftar Periksa Verifikasi Identitas</p>
                <div className="flex items-center gap-3">
                  {userProfile?.email ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                  <span className={userProfile?.email ? 'text-gray-300' : 'text-red-400'}>Email Terverifikasi</span>
                </div>
                <div className="flex items-center gap-3">
                  {userProfile?.phone ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                  <span className={userProfile?.phone ? 'text-gray-300' : 'text-red-400'}>Nomor Telepon Terverifikasi</span>
                </div>
                {/* Simulated Doc check */}
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-gray-300">SIM Terverifikasi</span>
                </div>
              </div>
            </div>
            
            {isProfileComplete ? (
               <button onClick={handleNextStep} className="w-full py-4 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-yellow-500 transition">
                Lanjut ke Metode Pembayaran
              </button>
            ) : (
              <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>Harap lengkapi profil Anda di pengaturan sebelum membeli keanggotaan.</p>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#D4AF37]">Pilih Metode Pembayaran</h2>
            <div className="grid gap-4">
              {['Kartu Kredit', 'Virtual Account (BCA)', 'GoPay', 'Bank Transfer'].map(method => (
                <div 
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${paymentMethod === method ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/10 bg-[#111] hover:border-white/30'}`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className={`w-6 h-6 ${paymentMethod === method ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                    <span className="font-medium">{method}</span>
                  </div>
                  {paymentMethod === method && <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />}
                </div>
              ))}
            </div>
            <button 
              onClick={handleNextStep} 
              disabled={!paymentMethod}
              className={`w-full py-4 font-bold rounded-lg transition ${paymentMethod ? 'bg-[#D4AF37] text-black hover:bg-yellow-500' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
            >
              Lanjut ke Ringkasan
            </button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#D4AF37]">Promo & Voucher</h2>
            <div className="bg-[#111] p-6 rounded-xl border border-white/10">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Masukkan Kode Promo" className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <button className="px-6 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition">Terapkan</button>
              </div>
              <p className="text-sm text-gray-500 mt-3 flex items-center gap-1"><Info className="w-4 h-4"/> Tidak ada voucher yang tersedia untuk akun ini.</p>
            </div>
            <button onClick={handleNextStep} className="w-full py-4 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-yellow-500 transition">
              Tinjau Pesanan
            </button>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#D4AF37]">Tinjauan Pesanan</h2>
            <div className="bg-[#111] p-6 rounded-xl border border-white/10 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-gray-400">Tingkat Keanggotaan</span>
                <span className="font-bold text-white">{tierInfo.name}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-gray-400">Metode Pembayaran</span>
                <span className="font-medium">{paymentMethod}</span>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>Rp {tierInfo.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Pajak (11%)</span>
                  <span>Rp {taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-[#D4AF37] pt-4 border-t border-white/10">
                  <span>Total Akhir</span>
                  <span>Rp {finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" className="mt-1 w-4 h-4 accent-[#D4AF37]" required />
              <span className="text-sm text-gray-400 group-hover:text-gray-300 transition">
                Saya menyetujui <a href="#" className="text-[#D4AF37] hover:underline">Syarat & Ketentuan Keanggotaan</a> dan mengotorisasi pembayaran ini.
              </span>
            </label>
            <button onClick={processPayment} className="w-full py-4 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-yellow-500 transition shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]">
              Selesaikan Pembayaran
            </button>
          </div>
        );
      case 6:
        return (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <div className="w-16 h-16 border-4 border-white/10 border-t-[#D4AF37] rounded-full" />
            </motion.div>
            <h2 className="text-2xl font-bold animate-pulse text-[#D4AF37]">Mengamankan pembayaran...</h2>
            <p className="text-gray-400">Mengaktifkan Keanggotaan RideVault Anda.</p>
          </div>
        );
      case 7:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 py-10"
          >
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Pembayaran Berhasil</h2>
              <p className="text-[#D4AF37] font-medium text-lg">Keanggotaan Telah Aktif</p>
            </div>
            
            <div className="bg-[#111] p-6 rounded-xl border border-white/10 text-left max-w-sm mx-auto space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Tier</span>
                <span className="font-bold">{tierInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ID Keanggotaan</span>
                <span className="font-bold font-mono">RV-{Math.floor(10000 + Math.random() * 90000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Poin Hadiah</span>
                <span className="font-bold text-[#D4AF37]">+{Math.floor(finalTotal / 10000)} pts</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <button onClick={() => navigate('/membership/dashboard')} className="w-full py-4 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-yellow-500 transition">
                Lihat Dasbor Keanggotaan
              </button>
              <button onClick={() => navigate('/collection')} className="w-full py-4 bg-transparent border border-white/20 text-white font-bold rounded-lg hover:bg-white/5 transition">
                Jelajahi Superbike
              </button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-xl mx-auto relative z-10">
        {/* Header & Progress */}
        {currentStep < 6 && (
          <div className="mb-8 flex items-center gap-4">
            <button onClick={() => currentStep > 1 ? handlePrevStep() : navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-[#D4AF37]">Langkah {currentStep} dari 5</span>
                <span className="text-gray-500">{['Detail', 'Akun', 'Pembayaran', 'Promo', 'Ringkasan'][currentStep - 1]}</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#D4AF37]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
