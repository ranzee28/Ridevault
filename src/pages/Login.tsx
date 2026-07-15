import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronRight, 
  Lock, 
  Mail, 
  Check, 
  User, 
  Shield, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Star, 
  Crown, 
  LogOut, 
  Home, 
  CreditCard,
  Gauge
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Define legendary showcase motorcycles
const SHOWCASE_BIKES = [
  {
    name: 'Kawasaki Ninja H2',
    image: '/src/Images/KawasakiH2.png',
    specs: {
      engine: '998cc Supercharged',
      power: '228 HP',
      speed: '300+ km/h',
      weight: '238 kg',
    },
    tag: 'SUPERCHARGED POWER'
  },
  {
    name: 'Ducati Panigale V4 R',
    image: '/src/Images/Panigale-V4-R.png',
    specs: {
      engine: '998cc Desmosedici',
      power: '218 HP',
      speed: '315 km/h',
      weight: '172 kg',
    },
    tag: 'ITALIAN MASTERPIECE'
  },
  {
    name: 'BMW S1000RR M Sport',
    image: '/src/Images/BMWS1000RR4.png',
    specs: {
      engine: '999cc ShiftCam I4',
      power: '205 HP',
      speed: '303 km/h',
      weight: '193 kg',
    },
    tag: 'TRACK DOMINATOR'
  }
];

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeRole, setActiveRole] = useState<'user' | 'admin'>('user');
  const [activeBikeIndex, setActiveBikeIndex] = useState(0);
  
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, userProfile, signInWithEmail, signUpWithEmail, signInWithGoogle, logOut } = useAuth();

  // Auto-rotate showcase bikes
  useEffect(() => {
    if (!user) {
      const interval = setInterval(() => {
        setActiveBikeIndex((prev) => (prev + 1) % SHOWCASE_BIKES.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
        
        const sessionUser = (await supabase.auth.getUser()).data.user;
        if (sessionUser) {
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', sessionUser.id)
            .single();

          if (activeRole === 'admin') {
            if (profile?.role === 'admin') {
              navigate('/admin');
            } else {
              await supabase.auth.signOut();
              throw new Error('Akun Anda tidak terdaftar sebagai Administrator.');
            }
          } else {
            if (profile?.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/');
            }
          }
        } else {
          navigate('/');
        }
      } else {
        await signUpWithEmail(email, password, name);
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      let message = err.message || 'Authentication failed. Please try again.';
      try {
        const parsed = JSON.parse(err.message);
        if (parsed && parsed.error) message = parsed.error;
      } catch (e) {}
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      console.error(err);
      let message = err.message || 'Google Authentication failed.';
      try {
        const parsed = JSON.parse(err.message);
        if (parsed && parsed.error) message = parsed.error;
      } catch (e) {}
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Get VIP membership card details based on user tier
  const getTierDetails = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'bronze':
        return {
          name: 'Bronze Syndicate',
          cardClass: 'bg-gradient-to-br from-[#3b2314] via-[#5c371d] to-[#1e1107] border border-[#a05a2c]/30 shadow-[0_0_35px_rgba(160,90,44,0.15)]',
          badgeColor: 'text-[#d97736] bg-[#d97736]/10 border-[#d97736]/20',
          textColor: 'text-[#d97736]',
          icon: Star,
          benefits: ['Akses sewa armada standar', 'Diskon 5% setiap reservasi', 'Proteksi asuransi dasar']
        };
      case 'silver':
        return {
          name: 'Silver Syndicate',
          cardClass: 'bg-gradient-to-br from-[#1e293b] via-[#475569] to-[#0f172a] border border-[#94a3b8]/30 shadow-[0_0_35px_rgba(148,163,184,0.15)]',
          badgeColor: 'text-[#94a3b8] bg-[#94a3b8]/10 border-[#94a3b8]/20',
          textColor: 'text-[#94a3b8]',
          icon: Shield,
          benefits: ['Akses sewa motor prioritas', 'Diskon sewa 10% harian', '1x Pengantaran gratis / bln', 'Proteksi asuransi premium']
        };
      case 'gold':
        return {
          name: 'Gold Syndicate',
          cardClass: 'bg-gradient-to-br from-[#2d210a] via-[#7d5e1e] to-[#0d0903] border border-[#D4AF37]/40 shadow-[0_0_40px_rgba(212,175,55,0.25)]',
          badgeColor: 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/30',
          textColor: 'text-[#D4AF37]',
          icon: Crown,
          benefits: ['Akses seluruh armada VIP', 'Diskon sewa 20% harian', 'Bebas biaya deposit sewa', 'Gratis penyerahan unit towing', 'Akses gratis premium riding gear']
        };
      case 'elite':
        return {
          name: 'Elite Syndicate',
          cardClass: 'bg-gradient-to-br from-[#09090b] via-[#1c1924] to-[#030304] border border-[#D4AF37]/60 shadow-[0_0_50px_rgba(212,175,55,0.35)]',
          badgeColor: 'text-[#F3E5AB] bg-[#D4AF37]/15 border-[#D4AF37]/50',
          textColor: 'text-[#F3E5AB]',
          icon: Sparkles,
          benefits: ['Prioritas reservasi superbike', 'Diskon eksklusif sewa 25%', 'Bebas deposit jaminan penuh', 'VIP Towing & Layanan Asisten', 'Akses Lounge Clubhouse 24/7']
        };
      default:
        return {
          name: 'Standard Member',
          cardClass: 'bg-gradient-to-br from-[#121214] via-[#222225] to-[#080809] border border-white/10 shadow-2xl',
          badgeColor: 'text-white/40 bg-white/5 border-white/10',
          textColor: 'text-white/40',
          icon: User,
          benefits: ['Jelajahi galeri motor sport', 'Tambahkan motor ke garasi favorit', 'Pemesanan reguler cepat']
        };
    }
  };

  const activeTier = userProfile?.tier || 'default';
  const tierDetails = getTierDetails(activeTier);
  const TierIcon = tierDetails.icon;

  return (
    <div className="min-h-screen bg-[#050505] flex relative overflow-hidden text-white font-sans selection:bg-[#D4AF37] selection:text-black">
      
      {/* Background ambient light effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] bg-[#D4AF37]/5 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[900px] h-[900px] bg-slate-500/5 rounded-full blur-[180px] pointer-events-none"></div>

      {/* Grid overlay for futuristic vibe */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="w-full min-h-screen flex flex-col lg:flex-row relative z-10">
        
        {/* Left Section - Graphic / Branding (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 p-16 flex-col justify-between relative border-r border-white/5 bg-[#070707]/70 backdrop-blur-3xl overflow-hidden">
          
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.02] z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

          {/* Return showcase link */}
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="z-10"
          >
            <Link to="/" className="inline-flex items-center gap-3 text-white/40 hover:text-[#D4AF37] transition-all uppercase tracking-[0.25em] text-[10px] font-semibold group">
              <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" /> 
              {t('login.return') || 'Kembali ke Pameran'}
            </Link>
          </motion.div>

          {/* Interactive Bike Showcase / Digital Vault HUD */}
          <div className="z-10 flex flex-col items-center justify-center my-auto py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-center w-full max-w-md"
            >
              {/* Gold abstract logo mark */}
              <div className="flex justify-center mb-6">
                <div className="relative w-10 h-10 flex items-center justify-center border border-[#D4AF37]/30 rounded-sm transform rotate-45 group hover:border-[#D4AF37] transition-colors duration-500">
                  <div className="w-6 h-6 border border-[#D4AF37]/60 rounded-xs transform rotate-12 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-[#D4AF37] rounded-xxs transform rotate-12 shadow-[0_0_12px_rgba(212,175,55,0.4)]"></div>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl xl:text-5xl font-black tracking-tight mb-4 uppercase leading-[1.05]">
                {t('login.title1') || 'Akses'}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-[#D4AF37]">{t('login.title2') || 'Terbatas.'}</span>
              </h1>
              
              <p className="text-white/40 text-xs max-w-sm mx-auto font-light leading-relaxed mb-6">
                {t('login.desc') || 'Otentikasi untuk mengelola reservasi armada mewah Anda, pramutamu prioritas, dan undangan acara eksklusif.'}
              </p>
            </motion.div>

            {/* Showcase Display Area */}
            {!user && (
              <div className="w-full max-w-sm flex flex-col items-center relative mt-4">
                <div className="relative w-full h-[210px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeBikeIndex}
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -15 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute w-full h-full flex flex-col items-center justify-center"
                    >
                      {/* Glow Behind the Bike */}
                      <div className="absolute inset-0 bg-gradient-radial from-[#D4AF37]/10 to-transparent blur-3xl w-[260px] h-[260px] mx-auto rounded-full pointer-events-none"></div>
                      
                      {/* Bike Image */}
                      <img
                        src={SHOWCASE_BIKES[activeBikeIndex].image}
                        alt={SHOWCASE_BIKES[activeBikeIndex].name}
                        className="h-[180px] object-contain drop-shadow-[0_20px_40px_rgba(212,175,55,0.15)] select-none pointer-events-none animate-float"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Dots controller */}
                <div className="flex gap-2 justify-center mt-3 z-20">
                  {SHOWCASE_BIKES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveBikeIndex(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${activeBikeIndex === idx ? 'bg-[#D4AF37] w-6' : 'bg-white/20 hover:bg-white/45'}`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Specs HUD Container */}
                <motion.div 
                  layout
                  className="w-full mt-8 border border-white/5 bg-white/[0.01] backdrop-blur-md p-5 rounded-md relative shadow-2xl"
                >
                  <div className="absolute top-0 left-0 w-2.5 h-[1px] bg-[#D4AF37]"></div>
                  <div className="absolute top-0 left-0 w-[1px] h-2.5 bg-[#D4AF37]"></div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-[1px] bg-[#D4AF37]"></div>
                  <div className="absolute bottom-0 right-0 w-[1px] h-2.5 bg-[#D4AF37]"></div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[8px] uppercase tracking-[0.25em] text-[#D4AF37] font-black">{SHOWCASE_BIKES[activeBikeIndex].tag}</span>
                    <span className="text-[10px] text-white/50 font-bold tracking-tight">{SHOWCASE_BIKES[activeBikeIndex].name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <span className="text-[7.5px] text-white/30 uppercase tracking-widest block mb-0.5">Engine Specs</span>
                      <span className="text-[11px] text-white/80 font-medium">{SHOWCASE_BIKES[activeBikeIndex].specs.engine}</span>
                    </div>
                    <div>
                      <span className="text-[7.5px] text-white/30 uppercase tracking-widest block mb-0.5">Peak Output</span>
                      <span className="text-[11px] text-[#D4AF37] font-bold">{SHOWCASE_BIKES[activeBikeIndex].specs.power}</span>
                    </div>
                    <div>
                      <span className="text-[7.5px] text-white/30 uppercase tracking-widest block mb-0.5">Velocity Limit</span>
                      <span className="text-[11px] text-white/80 font-medium">{SHOWCASE_BIKES[activeBikeIndex].specs.speed}</span>
                    </div>
                    <div>
                      <span className="text-[7.5px] text-white/30 uppercase tracking-widest block mb-0.5">Operational Mass</span>
                      <span className="text-[11px] text-white/80 font-medium">{SHOWCASE_BIKES[activeBikeIndex].specs.weight}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Logged in Welcome graphic */}
            {user && (
              <div className="w-full max-w-sm mt-4 text-center">
                <div className="relative w-full h-[220px] flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-radial from-[#D4AF37]/10 to-transparent blur-3xl w-[260px] h-[260px] mx-auto rounded-full pointer-events-none animate-pulse"></div>
                  
                  {/* Glowing vault key frame */}
                  <motion.div 
                    initial={{ rotate: -15, scale: 0.95 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="relative w-44 h-44 border border-[#D4AF37]/20 rounded-full flex items-center justify-center bg-[#070707]/80 shadow-[0_0_50px_rgba(212,175,55,0.08)]"
                  >
                    <div className="absolute inset-2 border border-dashed border-white/5 rounded-full"></div>
                    <div className="w-28 h-28 border border-[#D4AF37]/35 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#050505] to-[#121212]">
                      <Crown size={48} className="text-[#D4AF37] animate-float drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
                    </div>
                  </motion.div>
                </div>
                <h3 className="text-xl font-bold uppercase tracking-[0.15em] text-[#D4AF37] mt-4">Verified Account</h3>
                <p className="text-white/40 text-xs font-light mt-2 max-w-xs mx-auto leading-relaxed">
                  Layanan VIP Anda siap dioperasikan. Kelola unit motor sport, jadwal servis, dan asistensi VIP langsung dari dashboard portal Anda.
                </p>
              </div>
            )}
          </div>

          {/* Secure system badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.6 }}
            className="z-10 flex gap-8 text-[9px] uppercase tracking-[0.2em] font-bold text-white/20 border-t border-white/5 pt-6"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#D4AF37] animate-pulse"></span>
              {t('login.badge1') || 'Koneksi Terenkripsi'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#D4AF37] animate-pulse"></span>
              {t('login.badge2') || 'Protokol Tanpa Percaya'}
            </span>
          </motion.div>
        </div>

        {/* Right Section - Form / Membership card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20 relative">
          
          {/* Back button for mobile view */}
          <Link to="/" className="lg:hidden absolute top-8 left-8 inline-flex items-center gap-2 text-white/40 hover:text-white transition-all uppercase tracking-widest text-[9px] font-bold">
            <ArrowLeft size={12} /> 
          </Link>

          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="w-full max-w-md"
          >
            {user ? (
              /* ========================================================================= */
              /* AUTHENTICATED STATE - VIP MEMBERSHIP CARD                                 */
              /* ========================================================================= */
              <div className="space-y-8">
                
                {/* Main Heading */}
                <div className="text-center">
                  <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] font-black mb-2 block">
                    Identity Verified
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">
                    Portal Keanggotaan
                  </h2>
                </div>

                {/* Premium digital credit-card design */}
                <motion.div 
                  initial={{ rotateY: 15, scale: 0.95 }}
                  animate={{ rotateY: 0, scale: 1 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="perspective-1000"
                >
                  <div className={`relative w-full aspect-[1.586/1] ${tierDetails.cardClass} rounded-xl p-6 md:p-8 flex flex-col justify-between overflow-hidden group`}>
                    
                    {/* Metal Card Shimmer effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-[150%] -skew-x-12 group-hover:animate-shimmer pointer-events-none"></div>

                    {/* Ambient glow in card background */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-white/[0.03] blur-3xl pointer-events-none"></div>
                    
                    {/* Top Row: Brand & Tier Chip */}
                    <div className="flex justify-between items-start z-10">
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.3em] font-black text-white/50 block">RIDEVAULT</span>
                        <span className="text-[7px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">SYN. MEMBERSHIP</span>
                      </div>
                      
                      {/* Premium Card Chip */}
                      <div className="w-10 h-7 bg-gradient-to-br from-[#ffd700]/30 to-[#b8860b]/40 rounded-md border border-[#ffd700]/20 flex flex-col justify-between p-1.5 shadow-inner">
                        <div className="w-2.5 h-1.5 bg-[#ffd700]/25 rounded-xs border-r border-b border-[#ffd700]/10"></div>
                        <div className="flex justify-between">
                          <div className="w-1.5 h-1.5 bg-[#ffd700]/25 rounded-xxs border-r border-[#ffd700]/10"></div>
                          <div className="w-1.5 h-1.5 bg-[#ffd700]/25 rounded-xxs border-l border-[#ffd700]/10"></div>
                        </div>
                      </div>
                    </div>

                    {/* Center Row: Member Name */}
                    <div className="z-10">
                      <span className="text-[8px] uppercase tracking-[0.25em] text-white/40 block mb-1">MEMBER NAME</span>
                      <h4 className="text-lg md:text-xl font-bold tracking-[0.18em] uppercase text-white truncate drop-shadow-md">
                        {userProfile?.name || user.displayName || 'RideVault Member'}
                      </h4>
                    </div>

                    {/* Bottom Row: Member ID, Tier Badge & Signature */}
                    <div className="flex justify-between items-end z-10 border-t border-white/5 pt-4">
                      <div>
                        <span className="text-[7px] uppercase tracking-[0.2em] text-white/40 block">MEMBER ID</span>
                        <span className="font-mono text-[10px] tracking-widest text-white/80">
                          RV-{userProfile?.uid?.substring(0, 5).toUpperCase() || 'XXXX'}-{activeTier.toUpperCase()}
                        </span>
                      </div>

                      {/* Tier Badge Capsule */}
                      <div className={`px-3.5 py-1.5 rounded-full border text-[8px] uppercase tracking-widest font-black flex items-center gap-1.5 ${tierDetails.badgeColor} shadow-md`}>
                        <TierIcon size={10} className="shrink-0" />
                        {tierDetails.name}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Tier Perks Checklist HUD */}
                <div className="border border-white/5 bg-[#0a0a0a]/50 p-6 rounded-md space-y-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#D4AF37]">
                    <Sparkles size={13} />
                    <span>Keuntungan Keanggotaan Anda</span>
                  </div>
                  <ul className="space-y-2.5">
                    {tierDetails.benefits.map((benefit, i) => (
                      <motion.li 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="flex items-start gap-2.5 text-xs text-white/60 font-light"
                      >
                        <Check size={12} className="text-[#D4AF37] mt-0.5 shrink-0" />
                        <span>{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Dashboard Nav Actions */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => navigate('/')}
                    className="flex-1 h-[52px] bg-[#D4AF37] hover:bg-white text-black font-extrabold rounded-sm transition-all duration-300 uppercase text-xs tracking-widest cursor-pointer shadow-[0_4px_20px_rgba(212,175,55,0.15)] flex items-center justify-center gap-2 group"
                  >
                    <Home size={14} />
                    <span>{t('login.btn_home') || 'Kembali ke Beranda'}</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  
                  <button 
                    onClick={() => logOut()}
                    className="h-[52px] px-6 bg-white/[0.02] border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-colors uppercase text-xs tracking-widest text-white/60 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogOut size={14} />
                    <span>{t('login.btn_signout') || 'Keluar Sesi'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ========================================================================= */
              /* UNAUTHENTICATED STATE - AUTH FORM                                         */
              /* ========================================================================= */
              <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 p-8 rounded-lg shadow-[0_0_50px_rgba(212,175,55,0.03)] relative overflow-hidden">
                
                {/* Subtle light leak inside form box */}
                <div className="absolute top-[-30%] right-[-30%] w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* Role Switcher (User / Admin Toggle) */}
                <div className="mb-8 flex justify-end">
                  <div className="bg-[#121212] p-1 rounded-full border border-white/5 flex relative w-48">
                    <motion.div
                      className="absolute top-1 bottom-1 left-1 bg-[#D4AF37] rounded-full z-0"
                      layoutId="roleActive"
                      initial={false}
                      animate={{
                        x: activeRole === 'admin' ? 92 : 0,
                        width: 92
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                    <button
                      type="button"
                      onClick={() => setActiveRole('user')}
                      className={`relative z-10 flex-1 py-1 rounded-full text-[9px] uppercase tracking-widest font-black flex items-center justify-center gap-1.5 transition-colors duration-300 ${activeRole === 'user' ? 'text-black font-extrabold' : 'text-white/40 hover:text-white/80'}`}
                    >
                      <User size={10} /> User
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveRole('admin');
                      }}
                      className={`relative z-10 flex-1 py-1 rounded-full text-[9px] uppercase tracking-widest font-black flex items-center justify-center gap-1.5 transition-colors duration-300 ${activeRole === 'admin' ? 'text-black font-extrabold' : 'text-white/40 hover:text-white/80'}`}
                    >
                      <Shield size={10} /> Admin
                    </button>
                  </div>
                </div>

                {/* Section Title */}
                <div className="mb-8">
                  <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] font-black mb-3 block flex items-center gap-2">
                    <Lock size={11} className="text-[#D4AF37]" /> 
                    {isLogin ? (t('login.req_auth') || 'Otorisasi Diperlukan') : (t('login.req_access') || 'Minta Akses')}
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">
                    {isLogin ? (t('login.portal') || 'Portal Klien') : (t('login.apply') || 'Daftar Akses')}
                  </h2>
                </div>
                
                {/* Form Tabs Selector */}
                <div className="flex gap-6 mb-8 border-b border-white/5 pb-px relative">
                  <button 
                    type="button"
                    onClick={() => { setIsLogin(true); setErrorMsg(null); }}
                    className={`pb-3.5 text-xs uppercase tracking-[0.2em] font-black transition-all cursor-pointer relative ${isLogin ? 'text-[#D4AF37]' : 'text-white/30 hover:text-white/70'}`}
                  >
                    {t('login.tab_signin') || 'Masuk'}
                    {isLogin && (
                      <motion.div 
                        layoutId="activeTabUnderline" 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" 
                      />
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setIsLogin(false); setErrorMsg(null); }}
                    className={`pb-3.5 text-xs uppercase tracking-[0.2em] font-black transition-all cursor-pointer relative ${!isLogin ? 'text-[#D4AF37]' : 'text-white/30 hover:text-white/70'}`}
                  >
                    {t('login.tab_register') || 'Daftar'}
                    {!isLogin && (
                      <motion.div 
                        layoutId="activeTabUnderline" 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" 
                      />
                    )}
                  </button>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-950/30 border border-red-500/20 text-red-200 text-xs rounded-sm flex items-start gap-3 relative"
                  >
                    <div className="absolute top-0 left-0 w-[1px] h-full bg-red-500"></div>
                    <AlertCircle className="shrink-0 mt-0.5 text-red-400" size={14} />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {/* Auth Input Fields */}
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <AnimatePresence mode="popLayout">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="relative group overflow-hidden"
                      >
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#D4AF37] transition-colors z-10">
                          <User size={15} />
                        </div>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-sm py-4 pl-12 pr-4 text-white placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.04] transition-all font-light text-xs"
                          placeholder={t('login.placeholder_name') || "Nama Lengkap"}
                          required={!isLogin}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-5">
                    {/* Email Input */}
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#D4AF37] transition-colors z-10">
                        <Mail size={15} />
                      </div>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-sm py-4 pl-12 pr-4 text-white placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.04] transition-all font-light text-xs"
                        placeholder={t('login.placeholder_email') || "Email Terdaftar"}
                        required
                      />
                    </div>

                    {/* Password Input */}
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#D4AF37] transition-colors z-10">
                        <Lock size={15} />
                      </div>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-sm py-4 pl-12 pr-12 text-white placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.04] transition-all font-light text-xs tracking-widest"
                        placeholder="••••••••"
                        required
                      />
                      
                      {/* Show/Hide password toggle */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-[#D4AF37] transition-colors z-10 cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {isLogin && (
                    <div className="flex justify-between items-center pt-1.5">
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <div className="relative flex items-center justify-center w-3.5 h-3.5">
                          <input type="checkbox" className="peer appearance-none w-3.5 h-3.5 border border-white/20 rounded-[2px] bg-transparent checked:bg-[#D4AF37] checked:border-[#D4AF37] transition-all cursor-pointer" />
                          <Check size={8} className="absolute text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold" />
                        </div>
                        <span className="text-[9px] text-white/40 group-hover:text-white/70 transition-colors uppercase tracking-widest font-medium">{t('login.remember') || 'Ingat Saya'}</span>
                      </label>
                      
                      <a href="#" className="text-[9px] text-white/35 hover:text-[#D4AF37] transition-colors uppercase tracking-widest font-medium">
                        {t('login.recover') || 'Pulihkan Kunci'}
                      </a>
                    </div>
                  )}

                  {/* Submit Button with sliding glare shimmer */}
                  <motion.button 
                    type="submit"
                    disabled={submitting}
                    onHoverStart={() => setIsHoveringSubmit(true)}
                    onHoverEnd={() => setIsHoveringSubmit(false)}
                    className="w-full relative group mt-8 overflow-hidden rounded-sm disabled:opacity-50 h-[56px] cursor-pointer shadow-lg"
                  >
                    {/* Metallic gold base */}
                    <div className="absolute inset-0 bg-[#D4AF37] transition-colors duration-500"></div>

                    {/* Glowing golden halo on hover */}
                    <div className="absolute inset-0 bg-white/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-sm"></div>
                    
                    {/* Sliding shimmer light line */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[150%] -skew-x-12 animate-shimmer pointer-events-none"></div>

                    <div className="relative z-10 h-full px-6 flex items-center justify-between text-[#050505] font-bold">
                      <span className="uppercase tracking-[0.25em] text-[10.5px] font-extrabold text-[#050505]">
                        {submitting 
                          ? (t('login.btn_loading') || 'Memproses...') 
                          : isLogin 
                            ? (t('login.btn_auth') || 'Masuk') 
                            : (t('login.btn_submit') || 'Daftar')
                        }
                      </span>
                      <motion.div
                        animate={{ x: isHoveringSubmit ? 4 : 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      >
                        <ChevronRight size={15} className="text-[#050505]" />
                      </motion.div>
                    </div>
                  </motion.button>
                  
                  {/* Google SSO section */}
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <div className="h-[1px] flex-1 bg-white/5"></div>
                    <span className="text-white/20 text-[9px] uppercase tracking-[0.18em] font-medium">{t('login.or') || 'Atau Lanjutkan Dengan'}</span>
                    <div className="h-[1px] flex-1 bg-white/5"></div>
                  </div>

                  <button 
                    type="button" 
                    disabled={submitting}
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-2.5 bg-white/[0.01] border border-white/10 hover:bg-white/[0.04] hover:border-white/20 transition-all rounded-sm py-4 cursor-pointer disabled:opacity-50 group hover:scale-[1.005] duration-300"
                  >
                    <svg className="w-4.5 h-4.5 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="text-white/70 font-semibold text-[9.5px] tracking-[0.15em] uppercase group-hover:text-white transition-colors">Google SSO</span>
                  </button>
                </form>
              </div>
            )}

            {/* Footer Support Info */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="mt-12 text-center"
            >
              <p className="text-white/30 text-[10px] uppercase tracking-widest font-light">
                {t('login.footer') || 'Untuk pertanyaan mendesak:'} <a href="mailto:concierge@ridevault.com" className="text-white/55 hover:text-[#D4AF37] border-b border-white/20 hover:border-[#D4AF37] transition-all ml-1 pb-0.5">concierge@ridevault.com</a>
              </p>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
