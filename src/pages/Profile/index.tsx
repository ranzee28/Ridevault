import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Camera, LogOut, Sparkles, Shield, Upload, Crown,
  Menu, X, ChevronRight, Verified, Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

// Shared UI
import ToastContainer from './components/ui/Toast';
import ConfirmModal from './components/ui/ConfirmModal';

// Tab Components
import OverviewTab from './components/OverviewTab';
import PersonalInfoTab from './components/PersonalInfoTab';
import DriverLicenseTab from './components/DriverLicenseTab';
import MembershipCard from './components/MembershipCard';
import MembershipProgressTab from './components/MembershipProgressTab';
import BookingsTab from './components/BookingsTab';
import FavoritesTab from './components/FavoritesTab';
import NotificationsTab from './components/NotificationsTab';
import SettingsTab from './components/SettingsTab';
import PaymentMethodsTab from './components/PaymentMethodsTab';
import LoyaltyRewardsTab from './components/LoyaltyRewardsTab';
import ReviewsTab from './components/ReviewsTab';
import PreferencesTab from './components/PreferencesTab';

import { NAV_ITEMS, TIER_CONFIG, NavItem } from './constants';
import { Booking, Tab, Toast } from './types';

let toastCounter = 0;

export default function Profile() {
  const { user, userProfile, updateUserProfile, uploadProfilePhoto, toggleFavoriteBike, logOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultTab = (searchParams.get('tab') as Tab) || 'overview';
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Photo upload
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Redirect unauthenticated
  useEffect(() => {
    if (!user && !userProfile) navigate('/login');
  }, [user, userProfile, navigate]);

  // Sync URL with active tab
  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab]);

  // Fetch bookings on mount
  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    setBookingsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted: Booking[] = (data || []).map((b: any) => ({
        id: b.id,
        bikeId: b.bike_id,
        bikeName: b.bike_name || b.bike,
        startDate: b.start_date,
        endDate: b.end_date,
        status: (b.status || 'pending').toLowerCase(),
        totalPrice: Number(b.total),
        createdAt: b.created_at,
        review: b.review || null,
        reviewRating: b.review_rating || null,
      }));
      setBookings(formatted);
    } catch (e) {
      console.error('Error fetching bookings:', e);
    } finally {
      setBookingsLoading(false);
    }
  }, [user]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast_${++toastCounter}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      await uploadProfilePhoto(file);
      addToast({ type: 'success', message: 'Foto profil berhasil diperbarui.' });
    } catch (err: any) {
      addToast({ type: 'error', message: err?.message || 'Gagal mengunggah foto.' });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  if (!user) return null;

  const currentTier = userProfile?.tier || 'default';
  const tierCfg = TIER_CONFIG[currentTier as keyof typeof TIER_CONFIG] || TIER_CONFIG.default;
  const photoURL = userProfile?.photoURL || '';
  const displayName = userProfile?.name || user.email?.split('@')[0] || 'RideVault Member';
  const loyaltyPoints = bookings.filter(b => b.status === 'completed').length * 100;

  const memberSince = (() => {
    const d = userProfile?.createdAt;
    if (!d) return 'Anggota baru';
    if (d instanceof Date) return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (d?.seconds) return new Date(d.seconds * 1000).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    return 'Anggota baru';
  })();

  const getUserInitials = () => {
    const name = displayName;
    return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'RV';
  };

  // Nav grouped
  const groups = [...new Set(NAV_ITEMS.map(n => n.group))];

  // Sidebar content
  const SidebarNav = () => (
    <div className="flex flex-col h-full">
      {/* Profile section */}
      <div className="p-5 border-b border-white/8">
        {/* Avatar */}
        <div className="relative group mx-auto w-fit mb-4">
          <div
            className="w-20 h-20 rounded-2xl overflow-hidden border-2 relative"
            style={{ borderColor: tierCfg.color, boxShadow: `0 0 20px ${tierCfg.glowColor}` }}
          >
            {photoURL ? (
              <img src={photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/50 to-slate-900 text-white text-xl font-bold">
                {getUserInitials()}
              </div>
            )}
            {/* Online indicator */}
            <span className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0a0a0f] rounded-full" />
          </div>
          {/* Upload overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            {isUploadingPhoto ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera size={18} className="text-white" />
            )}
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

        {/* Name + Tier */}
        <div className="text-center">
          <h2 className="text-white font-semibold text-sm truncate">{displayName}</h2>
          <p className="text-white/35 text-xs mt-0.5 truncate">{user.email}</p>
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${tierCfg.badgeClass}`}
            >
              <Sparkles size={8} /> {tierCfg.shortLabel}
            </span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: 'Sewa', value: bookings.length },
            { label: 'Poin', value: loyaltyPoints },
            { label: 'Favorit', value: userProfile?.favorites?.length || 0 },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 rounded-xl py-2 px-1 text-center">
              <div className="text-white font-bold text-sm">{stat.value}</div>
              <div className="text-white/30 text-[9px] uppercase tracking-wider mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {groups.map(group => (
          <div key={group}>
            <p className="text-white/20 text-[9px] uppercase tracking-[0.2em] font-semibold px-3 mb-1.5">{group}</p>
            <div className="space-y-0.5">
              {NAV_ITEMS.filter(n => n.group === group).map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'membership-dashboard' as any) {
                        navigate('/membership/dashboard');
                      } else {
                        handleTabChange(item.id);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group/nav ${
                      isActive
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                        : 'text-white/45 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <item.icon size={15} className={isActive ? 'text-blue-400' : 'text-white/30 group-hover/nav:text-white/60'} />
                    {item.label}
                    {isActive && <ChevronRight size={12} className="ml-auto text-blue-400/60" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-white/8">
        <button
          onClick={() => setLogoutModalOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-950/30 text-sm transition-all border border-transparent hover:border-red-500/15"
        >
          <LogOut size={15} />
          Keluar
        </button>
      </div>
    </div>
  );

  // Active tab content render
  const renderTab = () => {
    const props = { addToast, navigate, user, userProfile };
    switch (activeTab) {
      case 'overview':
        return <OverviewTab {...props} memberSince={memberSince} currentTier={currentTier} setActiveTab={handleTabChange} bookings={bookings} />;
      case 'personal':
        return <PersonalInfoTab {...props} />;
      case 'license':
        return <DriverLicenseTab {...props} />;
      case 'membership-card':
        return (
          <motion.div key="membership-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-white font-semibold text-lg">Kartu Anggota</h2>
              <p className="text-white/40 text-sm mt-0.5">Kartu keanggotaan digital Anda — bawa ke mana saja</p>
            </div>
            
            <div className="w-full flex justify-center">
              <MembershipCard
                name={displayName}
                uid={user.id}
                tier={currentTier}
                createdAt={userProfile?.createdAt}
                points={loyaltyPoints}
              />
            </div>
            
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-3 w-full">
              <h3 className="text-white/60 text-xs uppercase tracking-widest font-semibold">Detail Kartu</h3>
              {[
                { label: 'ID Anggota', value: `RV-${user.id.slice(0,4).toUpperCase()}-${user.id.slice(-4).toUpperCase()}` },
                { label: 'Tingkat Keanggotaan', value: tierCfg.label },
                { label: 'Saldo Poin', value: loyaltyPoints.toLocaleString() },
                { label: 'Anggota Sejak', value: memberSince },
                { label: 'Status Akun', value: 'Aktif' },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-white/35 text-sm">{row.label}</span>
                  <span className="text-white text-sm font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'membership-progress':
        return <MembershipProgressTab userProfile={userProfile} bookingCount={bookings.filter(b => b.status === 'completed').length} setActiveTab={handleTabChange} />;
      case 'rentals':
        return <BookingsTab bookings={bookings} bookingsLoading={bookingsLoading} navigate={navigate} addToast={addToast} onRefresh={fetchBookings} />;
      case 'favorites':
        return <FavoritesTab userProfile={userProfile} navigate={navigate} toggleFavoriteBike={toggleFavoriteBike} addToast={addToast} />;
      case 'notifications':
        return <NotificationsTab user={user} addToast={addToast} />;
      case 'security':
        return <SettingsTab user={user} userProfile={userProfile} logOut={logOut} addToast={addToast} navigate={navigate} />;
      case 'payment':
        return <PaymentMethodsTab user={user} addToast={addToast} />;
      case 'loyalty':
        return <LoyaltyRewardsTab user={user} bookingCount={bookings.filter(b => b.status === 'completed').length} addToast={addToast} />;
      case 'reviews':
        return <ReviewsTab bookings={bookings} addToast={addToast} onRefresh={fetchBookings} navigate={navigate} />;
      case 'preferences':
        return <PreferencesTab user={user} addToast={addToast} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050509] text-white">
      <Navbar />

      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[140px] opacity-20"
          style={{ background: tierCfg.glowColor }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[160px] opacity-15 bg-blue-600/20" />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full blur-[120px] opacity-8 bg-purple-600/10" />
      </div>

      <div className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Mobile top bar */}
          <div className="flex lg:hidden items-center justify-between mb-6">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest">Portal Anggota</p>
              <h1 className="text-white font-bold text-xl">Profil Saya</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all"
            >
              <Menu size={18} /> Menu
            </button>
          </div>

          <div className="flex gap-6 lg:gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-[280px] shrink-0">
              <div className="sticky top-28 bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden h-[calc(100vh-8rem)]">
                <SidebarNav />
              </div>
            </aside>

            {/* Mobile Sidebar Drawer */}
            <AnimatePresence>
              {sidebarOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                  />
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed inset-y-0 left-0 w-72 bg-[#0a0a0f] border-r border-white/8 z-50 overflow-hidden lg:hidden"
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={() => setSidebarOpen(false)}
                        className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <SidebarNav />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {/* Desktop page header */}
              <div className="hidden lg:flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={12} className="text-blue-400" />
                    <span className="text-white/30 text-xs uppercase tracking-widest">Portal Anggota</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white">
                    {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Dasbor'}
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-white/8 rounded-xl">
                    <Activity size={12} className="text-emerald-400" />
                    <span className="text-white/50 text-xs">Akun Aktif</span>
                  </div>
                  {userProfile?.role === 'admin' && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs hover:bg-amber-500/15 transition-all"
                    >
                      <Crown size={12} /> Admin Panel
                    </button>
                  )}
                </div>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {renderTab()}
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>

      <Footer />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Logout confirmation */}
      <ConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Keluar Akun"
        description="Apakah Anda yakin ingin keluar dari akun RideVault Anda?"
        confirmLabel="Keluar"
        variant="warning"
      />
    </div>
  );
}
