import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Clock, ChevronRight, Download, Star, History, CalendarDays, Bike, Gift, CreditCard, Bell, Maximize, Ticket, ArrowRight, Settings, Info, BellRing, Heart, CheckCircle2, ArrowLeft } from 'lucide-react';
import { membershipApi, MembershipDetails } from '../lib/membershipApi';
import { supabase } from '../lib/supabase';
import { useBikes } from '../contexts/BikeContext';
import BikeCard from '../components/collection/BikeCard';
import { TIER_CONFIG } from './Profile/constants';

// Helper for formatting
const formatRupiah = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

export default function MembershipDashboard() {
  const navigate = useNavigate();
  const [membership, setMembership] = useState<MembershipDetails | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullCard, setShowFullCard] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { bikes } = useBikes();
  const topBikes = bikes.slice(0, 2);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const [memData, histData, bookingsData, favsData, eventsData, notifData, vouchersData] = await Promise.all([
        membershipApi.getMembershipDashboard(user.id),
        membershipApi.getMembershipHistory(user.id),
        membershipApi.getActiveBookings(user.id),
        membershipApi.getFavoriteBikes(user.id),
        membershipApi.getUpcomingEvents(),
        membershipApi.getNotifications(user.id),
        membershipApi.getActiveVouchers(user.id)
      ]);

      setMembership(memData);
      setHistory(histData || []);
      setActiveBookings(bookingsData || []);
      setFavorites(favsData || []);
      setEvents(eventsData || []);
      setNotifications(notifData || []);
      setVouchers(vouchersData || []);
      setLoading(false);
    };
    loadData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-white/10 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  if (!membership || membership.membership_status !== 'active') {
    return (
      <div className="min-h-screen pt-32 px-4 text-center space-y-6 bg-black text-white">
        <Shield className="w-24 h-24 mx-auto text-gray-800" />
        <h1 className="text-4xl font-bold text-white">Tidak Ada Keanggotaan Aktif</h1>
        <p className="text-gray-400 max-w-md mx-auto text-lg">Tingkatkan tier Anda hari ini untuk membuka keuntungan eksklusif dan pengalaman berkendara mewah.</p>
        <button onClick={() => navigate('/#membership')} className="px-10 py-4 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-yellow-500 transition text-lg shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          Pilih Tier Keanggotaan
        </button>
      </div>
    );
  }

  const expiresAt = new Date(membership.membership_expires_at);
  const now = new Date();
  const diffTime = Math.max(0, expiresAt.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Dynamic next tier calculations
  const userTierKey = membership.tier.toLowerCase() as keyof typeof TIER_CONFIG;
  const currentTierCfg = TIER_CONFIG[userTierKey] || TIER_CONFIG.default;
  const nextTierName = currentTierCfg.nextTier ? TIER_CONFIG[currentTierCfg.nextTier.toLowerCase() as keyof typeof TIER_CONFIG]?.label || currentTierCfg.nextTier : null;
  const pointsNeeded = currentTierCfg.pointsToNext;
  const tierProgress = pointsNeeded > 0 ? Math.min((membership.loyalty_points / pointsNeeded) * 100, 100) : 100;
  const isElite = membership.tier.toLowerCase() === 'gold';

  // Floating Actions Component
  const FloatingActions = () => (
    <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
      <button onClick={() => navigate('/collection')} className="w-14 h-14 bg-[#D4AF37] text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition group relative">
        <Bike className="w-6 h-6" />
        <span className="absolute right-full mr-4 bg-black/90 text-[#D4AF37] text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-[#D4AF37]/30">Reservasi Motor</span>
      </button>
      <button onClick={() => setShowFullCard(true)} className="w-14 h-14 bg-gray-900 border border-white/20 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 hover:scale-110 transition group relative">
        <CreditCard className="w-6 h-6" />
        <span className="absolute right-full mr-4 bg-black/90 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-white/20">Kartu Member</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 relative">
      <FloatingActions />

      {/* 1. Success Welcome Hero */}
      <section className="relative w-full max-w-7xl mx-auto px-4 mb-12">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/50 hover:text-white mb-6 font-medium transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>

        {/* 1. Dynamic Welcome Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-10 bg-gradient-to-r from-gray-900 to-black border border-[#D4AF37]/20 shadow-[0_0_50px_rgba(212,175,55,0.05)]"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20">
                <CheckCircle2 className="w-4 h-4" /> Keanggotaan Aktif
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Selamat Datang di <span className="text-[#D4AF37]">RideVault {membership.tier}</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-xl">
                Hak istimewa berkendara Anda kini telah aktif. Nikmati akses eksklusif, prioritas utama, dan layanan premium tanpa batas.
              </p>

              <div className="flex flex-wrap gap-6 pt-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Tanggal Aktif</p>
                  <p className="font-medium text-white">{new Date(membership.membership_starts_at).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Berlaku Hingga</p>
                  <p className="font-medium text-white">{expiresAt.toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">ID Keanggotaan</p>
                  <p className="font-mono font-medium text-[#D4AF37]">{membership.membership_id_number}</p>
                </div>
              </div>
            </div>

            {/* Quick Digital Card Preview */}
            <div onClick={() => setShowFullCard(true)} className="cursor-pointer group relative w-72 h-44 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] p-5 shadow-2xl transition-transform hover:scale-105 border border-white/20">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              <div className="relative z-10 h-full flex flex-col justify-between text-black">
                <div className="flex justify-between items-start">
                  <span className="font-black tracking-widest">RIDEVAULT</span>
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold opacity-70">MEMBER ID</p>
                  <p className="font-mono text-sm">{membership.membership_id_number}</p>
                </div>
                <div className="flex justify-between items-end">
                  <p className="font-bold">{membership.tier} MEMBER</p>
                  <p className="text-xs font-medium">{expiresAt.toLocaleDateString('id-ID', { month: '2-digit', year: '2-digit' })}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. Primary Call To Action */}
      <section className="max-w-7xl mx-auto px-4 mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => navigate('/collection')} className="p-6 rounded-2xl bg-[#D4AF37] text-black hover:bg-yellow-500 transition group text-left relative overflow-hidden">
          <Bike className="w-8 h-8 mb-4" />
          <h3 className="font-bold text-xl mb-1">Jelajahi Superbike</h3>
          <p className="text-sm opacity-80">Reservasi motor premium Anda sekarang.</p>
          <ArrowRight className="absolute bottom-6 right-6 w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
        </button>
        <button onClick={() => navigate('/reservations')} className="p-6 rounded-2xl bg-[#111] border border-white/10 hover:bg-[#1a1a1a] transition group text-left relative">
          <CalendarDays className="w-8 h-8 mb-4 text-[#D4AF37]" />
          <h3 className="font-bold text-xl mb-1 text-white">Reservasi Pertama</h3>
          <p className="text-sm text-gray-400">Manfaatkan keuntungan Anda.</p>
        </button>
        <button onClick={() => setActiveTab('benefits')} className="p-6 rounded-2xl bg-[#111] border border-white/10 hover:bg-[#1a1a1a] transition group text-left relative">
          <Gift className="w-8 h-8 mb-4 text-[#D4AF37]" />
          <h3 className="font-bold text-xl mb-1 text-white">Eksplorasi Benefit</h3>
          <p className="text-sm text-gray-400">Lihat semua hak istimewa.</p>
        </button>
        <button onClick={() => setShowFullCard(true)} className="p-6 rounded-2xl bg-[#111] border border-white/10 hover:bg-[#1a1a1a] transition group text-left relative">
          <CreditCard className="w-8 h-8 mb-4 text-[#D4AF37]" />
          <h3 className="font-bold text-xl mb-1 text-white">Kartu Digital</h3>
          <p className="text-sm text-gray-400">Buka kartu keanggotaan penuh.</p>
        </button>
      </section>

      {/* Main Dashboard Layout */}
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-3 gap-8">

        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-8">

          {/* 3. Membership Progress */}
          <div className="bg-[#111] rounded-2xl p-6 border border-white/10 relative overflow-hidden">
            <h3 className="font-bold text-lg mb-6">Progres Keanggotaan</h3>

            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white font-medium">{currentTierCfg.label}</span>
                <span className="text-gray-500">{nextTierName ? `${nextTierName} (Mendatang)` : 'Tingkat Maksimum'}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${tierProgress}%` }} className="h-full bg-[#D4AF37]" />
              </div>
              {pointsNeeded > 0 ? (
                <p className="text-xs text-gray-500 mt-2 text-right">
                  {Math.max(0, pointsNeeded - membership.loyalty_points).toLocaleString('id-ID')} pts dibutuhkan
                </p>
              ) : (
                <p className="text-xs text-[#D4AF37] mt-2 text-right">
                  Tingkat Tertinggi Terbuka 🏆
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5">
                <p className="text-gray-400 text-xs mb-1">Poin Saat Ini</p>
                <p className="text-xl font-bold text-[#D4AF37]">{membership.loyalty_points.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5">
                <p className="text-gray-400 text-xs mb-1">Sisa Waktu</p>
                <p className="text-xl font-bold text-white">{diffDays} <span className="text-sm font-normal text-gray-500">hari</span></p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Estimasi Penghematan Bulan Ini</p>
                <p className="font-bold text-green-400">Rp 1.250.000</p>
              </div>
            </div>
          </div>

          {/* 11. Notification Center */}
          <div className="bg-[#111] rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2"><BellRing className="w-5 h-5 text-[#D4AF37]" /> Notifikasi</h3>
              <button className="text-xs text-gray-500 hover:text-white">Tandai Dibaca</button>
            </div>

            <div className="space-y-4">
              {notifications.length > 0 ? notifications.map(notif => (
                <div key={notif.id} className="flex gap-3 items-start pb-4 border-b border-white/5 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.is_read ? 'bg-gray-600' : 'bg-[#D4AF37]'}`} />
                  <div>
                    <p className="text-sm text-gray-200 font-medium">{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6">
                  <Bell className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Tidak ada notifikasi baru.</p>
                </div>
              )}
            </div>
          </div>

          {/* 5. Recommended Next Actions */}
          <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] rounded-2xl p-6 border border-[#D4AF37]/20">
            <h3 className="font-bold text-lg mb-4 text-[#D4AF37]">Rekomendasi Untuk Anda</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-xl bg-black/50 border border-white/5 hover:border-[#D4AF37]/50 transition group flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-[#D4AF37] transition">Lengkapi Profil Verifikasi</p>
                  <p className="text-xs text-gray-500">Dapatkan ekstra 500 Poin</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#D4AF37]" />
              </button>
              <button className="w-full text-left p-3 rounded-xl bg-black/50 border border-white/5 hover:border-[#D4AF37]/50 transition group flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-[#D4AF37] transition">Undang Teman Berkendara</p>
                  <p className="text-xs text-gray-500">Refer & Earn 1.000 Poin</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#D4AF37]" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-2 space-y-8">

          {/* Navigation Tabs */}
          <div className="flex gap-6 border-b border-white/10 pb-4 overflow-x-auto hide-scrollbar">
            {['overview', 'benefits', 'history', 'management'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === tab ? 'text-[#D4AF37]' : 'text-gray-500 hover:text-white'}`}
              >
                {tab === 'overview' ? 'Ringkasan' : tab === 'benefits' ? 'Keuntungan' : tab === 'history' ? 'Riwayat' : 'Manajemen'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">

                {/* 6. Exclusive Fleet Preview */}
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Terbuka Untuk Anda</h2>
                    <button onClick={() => navigate('/collection')} className="text-sm text-[#D4AF37] hover:underline font-medium flex items-center">Lihat Semua <ChevronRight className="w-4 h-4" /></button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {topBikes.map(bike => (
                      <div key={bike.id} className="relative group/bike text-black">
                        {/* Wrapper to handle dark theme override since BikeCard might be designed for light theme */}
                        <div className="bg-[#111] rounded-xl overflow-hidden border border-white/10 p-2">
                          <BikeCard
                            bike={bike}
                            isFavorite={favorites.includes(bike.id)}
                            onToggleFavorite={() => { }}
                            onClick={() => navigate('/collection')}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 8. Upcoming Events */}
                <section>
                  <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">Acara Eksklusif Mendatang</h2>
                  {events.length > 0 ? (
                    <div className="grid gap-4">
                      {events.map(event => (
                        <div key={event.id} className="bg-[#111] p-4 rounded-xl border border-white/10 flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gray-800 rounded-lg flex flex-col items-center justify-center text-[#D4AF37]">
                              <span className="text-xs font-bold uppercase">{new Date(event.date).toLocaleString('id-ID', { month: 'short' })}</span>
                              <span className="text-xl font-bold leading-none">{new Date(event.date).getDate()}</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-200 group-hover:text-[#D4AF37] transition">{event.title}</h3>
                              <p className="text-sm text-gray-500">{event.location}</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black rounded-lg text-sm font-medium transition">Daftar</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#111] p-8 rounded-xl border border-white/10 text-center">
                      <Ticket className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-400">Belum ada acara mendatang untuk tier Anda.</p>
                    </div>
                  )}
                </section>

              </motion.div>
            )}

            {activeTab === 'benefits' && (
              <motion.div key="benefits" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <h2 className="text-xl font-bold border-b border-white/10 pb-2">Keuntungan Interaktif</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* 4. Quick Benefits Interactive Cards */}
                  <div className="bg-[#111] p-5 rounded-xl border border-white/10 flex flex-col justify-between min-h-[160px]">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="bg-[#D4AF37]/20 p-2 rounded-lg"><Clock className="w-5 h-5 text-[#D4AF37]" /></div>
                        <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-md">Aktif</span>
                      </div>
                      <h3 className="font-bold text-lg">Prioritas Pemesanan</h3>
                      <p className="text-sm text-gray-500 mt-1">Lewati antrean, jaminan ketersediaan.</p>
                    </div>
                    <button onClick={() => navigate('/collection')} className="mt-4 text-sm text-[#D4AF37] font-medium text-left hover:underline">Pesan Sekarang →</button>
                  </div>
                  <div className="bg-[#111] p-5 rounded-xl border border-white/10 flex flex-col justify-between min-h-[160px]">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="bg-[#D4AF37]/20 p-2 rounded-lg"><Shield className="w-5 h-5 text-[#D4AF37]" /></div>
                        <span className="text-xs font-medium text-gray-400 bg-gray-800 px-2 py-1 rounded-md">Otomatis</span>
                      </div>
                      <h3 className="font-bold text-lg">Asuransi Premium</h3>
                      <p className="text-sm text-gray-500 mt-1">Perlindungan komprehensif tanpa biaya ekstra.</p>
                    </div>
                    <button className="mt-4 text-sm text-gray-400 font-medium text-left hover:text-white">Lihat Cakupan →</button>
                  </div>
                  <div className="bg-[#111] p-5 rounded-xl border border-white/10 flex flex-col justify-between min-h-[160px]">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="bg-[#D4AF37]/20 p-2 rounded-lg"><Ticket className="w-5 h-5 text-[#D4AF37]" /></div>
                        <span className="text-xs font-medium text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded-md">Tersedia</span>
                      </div>
                      <h3 className="font-bold text-lg">Akses Acara Privat</h3>
                      <p className="text-sm text-gray-500 mt-1">Undangan ke peluncuran & track days.</p>
                    </div>
                    <button onClick={() => setActiveTab('overview')} className="mt-4 text-sm text-[#D4AF37] font-medium text-left hover:underline">Lihat Acara →</button>
                  </div>
                  <div className="bg-[#111] p-5 rounded-xl border border-white/10 flex flex-col justify-between min-h-[160px]">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="bg-[#D4AF37]/20 p-2 rounded-lg"><Gift className="w-5 h-5 text-[#D4AF37]" /></div>
                        <span className="text-xs font-medium text-gray-400 bg-gray-800 px-2 py-1 rounded-md">Otomatis</span>
                      </div>
                      <h3 className="font-bold text-lg">Pengiriman Gratis</h3>
                      <p className="text-sm text-gray-500 mt-1">Antar-jemput unit gratis ke lokasi Anda.</p>
                    </div>
                    <button className="mt-4 text-sm text-gray-400 font-medium text-left">Berlaku saat checkout</button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {/* 10. Transaction History */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Riwayat Transaksi & Tagihan</h2>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Cari ID..." className="bg-[#111] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#D4AF37]" />
                  </div>
                </div>

                <div className="bg-[#111] rounded-xl border border-white/10 overflow-hidden">
                  {history.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-sm text-gray-400">
                          <th className="p-4 font-medium">Faktur / ID</th>
                          <th className="p-4 font-medium">Deskripsi</th>
                          <th className="p-4 font-medium">Status</th>
                          <th className="p-4 font-medium text-right">Jumlah</th>
                          <th className="p-4 font-medium text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10 text-sm">
                        {history.map((record) => (
                          <tr key={record.id} className="hover:bg-white/5 transition group">
                            <td className="p-4">
                              <p className="font-medium text-white">INV-{record.id.substring(0, 8).toUpperCase()}</p>
                              <p className="text-xs text-gray-500">{new Date(record.created_at).toLocaleDateString('id-ID')}</p>
                            </td>
                            <td className="p-4 text-gray-300">
                              Pembelian Keanggotaan {record.tier}
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Dibayar
                              </span>
                            </td>
                            <td className="p-4 text-right font-bold text-white">
                              {formatRupiah(record.amount_paid)}
                            </td>
                            <td className="p-4 text-center">
                              <button className="p-2 text-gray-500 hover:text-[#D4AF37] transition" title="Unduh PDF">
                                <Download className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-12 text-center">
                      <History className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                      <p className="text-gray-400">Tidak ada riwayat transaksi ditemukan.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'management' && (
              <motion.div key="management" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {/* 9. Membership Management */}
                <h2 className="text-xl font-bold border-b border-white/10 pb-2">Manajemen Keanggotaan</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-[#111] p-6 rounded-xl border border-white/10">
                    <h3 className="font-bold text-lg mb-2">Perpanjang Keanggotaan</h3>
                    <p className="text-sm text-gray-400 mb-6">Perpanjang masa aktif untuk menghindari gangguan layanan.</p>
                    <button className="w-full py-3 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-yellow-500 transition">Perpanjang Sekarang</button>
                  </div>
                  <div className="bg-[#111] p-6 rounded-xl border border-white/10">
                    <h3 className="font-bold text-lg mb-2">Otomatis Perpanjang</h3>
                    <p className="text-sm text-gray-400 mb-6">Penagihan otomatis pada tanggal jatuh tempo.</p>
                    <div className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg border border-white/5">
                      <span className="text-sm font-medium">Status</span>
                      <span className="text-sm font-bold text-green-400">Aktif</span>
                    </div>
                    <button className="w-full py-2 mt-4 text-sm text-gray-400 hover:text-white underline">Kelola Pengaturan</button>
                  </div>
                  <div className="bg-[#111] p-6 rounded-xl border border-white/10">
                    <h3 className="font-bold text-lg mb-2">Upgrade Tier</h3>
                    <p className="text-sm text-gray-400 mb-6">Tingkatkan keanggotaan untuk fitur maksimal.</p>
                    <button className="w-full py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition">Lihat Opsi Upgrade</button>
                  </div>
                  <div className="bg-[#111] p-6 rounded-xl border border-white/10">
                    <h3 className="font-bold text-lg mb-2">Metode Pembayaran</h3>
                    <p className="text-sm text-gray-400 mb-6">Kelola kartu kredit atau e-wallet yang tersimpan.</p>
                    <button className="w-full py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition">Kelola Metode</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 12. Full Digital Membership Card Modal */}
      <AnimatePresence>
        {showFullCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <div className="absolute inset-0" onClick={() => setShowFullCard(false)}></div>
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative z-10 max-w-md w-full bg-[#111] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              {/* Card Rendering */}
              <div className={`p-8 bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-black h-64 flex flex-col justify-between relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="relative z-10 flex justify-between items-start">
                  <span className="font-black text-xl tracking-widest">RIDEVAULT</span>
                  <Shield className="w-8 h-8" />
                </div>
                <div className="relative z-10 text-center py-4">
                  <div className="w-3/4 h-16 bg-black/10 mx-auto rounded flex items-center justify-center">
                    <span className="font-mono text-xs opacity-50 tracking-[0.5em]">[ BARCODE MOCKUP ]</span>
                  </div>
                  <p className="font-mono text-lg mt-2 tracking-widest font-bold">{membership.membership_id_number}</p>
                </div>
                <div className="relative z-10 flex justify-between items-end">
                  <p className="font-bold uppercase tracking-wider">{membership.tier} MEMBER</p>
                  <p className="text-sm font-medium">{expiresAt.toLocaleDateString('id-ID', { month: '2-digit', year: '2-digit' })}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
                  <Download className="w-6 h-6 mb-2 text-[#D4AF37]" />
                  <span className="text-xs font-medium">Unduh PNG</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
                  <Maximize className="w-6 h-6 mb-2 text-[#D4AF37]" />
                  <span className="text-xs font-medium">Apple Wallet</span>
                </button>
                <button className="col-span-2 py-3 bg-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition" onClick={() => setShowFullCard(false)}>
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
