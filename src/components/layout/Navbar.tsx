import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronDown, User, Settings, LogOut, Heart, Sparkles, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const { t } = useLanguage();
  const { user, userProfile, updateUserTier, updateUserProfile, logOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isProfilePage = location.pathname === '/profile';
  const isCollectionPage = location.pathname === '/collection';
  const isLightNavbarPage = isProfilePage || isCollectionPage;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: t('nav.collection'), href: '/#collection' },
    { name: t('nav.experience'), href: '/#experience' },
    { name: t('nav.membership'), href: '/#membership' },
  ];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleDropdownItemClick = (type: string) => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    
    switch (type) {
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/profile?tab=settings');
        break;
      case 'bookings':
        navigate('/profile?tab=bookings');
        break;
      case 'favorites':
        navigate('/profile?tab=favorites');
        break;
      default:
        break;
    }
  };

  // Helper to dynamically color profiles and badges depending on the current user tier
  const getTierDetails = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return {
          label: t('nav.tier_bronze') || 'Bronze Tier',
          colorClass: 'text-amber-500 bg-amber-950/20 border-amber-500/30',
          dotColor: 'bg-amber-500',
          avatarBorder: 'border-amber-500/50 group-hover:border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
          headerBg: 'bg-gradient-to-r from-amber-950/20 via-amber-900/5 to-transparent'
        };
      case 'silver':
        return {
          label: t('nav.tier_silver') || 'Silver Tier',
          colorClass: 'text-slate-300 bg-slate-900/40 border-slate-400/30',
          dotColor: 'bg-slate-300',
          avatarBorder: 'border-slate-400/50 group-hover:border-slate-400 shadow-[0_0_12px_rgba(203,213,225,0.2)]',
          headerBg: 'bg-gradient-to-r from-slate-900/40 via-slate-800/10 to-transparent'
        };
      case 'gold':
        return {
          label: t('nav.tier_gold') || 'Gold Tier',
          colorClass: 'text-yellow-500 bg-yellow-950/20 border-yellow-500/30',
          dotColor: 'bg-yellow-500',
          avatarBorder: 'border-yellow-500/50 group-hover:border-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.25)]',
          headerBg: 'bg-gradient-to-r from-yellow-950/25 via-yellow-900/5 to-transparent'
        };
      case 'elite':
        return {
          label: t('nav.tier_elite') || 'Elite Tier',
          colorClass: 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20',
          dotColor: 'bg-[#D4AF37]',
          avatarBorder: 'border-[#D4AF37]/50 group-hover:border-[#D4AF37] transition-all duration-300 shadow-[0_0_12px_rgba(212,175,55,0.25)]',
          headerBg: 'bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent'
        };
      default:
        return {
          label: t('nav.tier_default') || 'Akun Default (Belum Membership)',
          colorClass: 'text-zinc-400 bg-zinc-900/40 border-zinc-700/30',
          dotColor: 'bg-zinc-500',
          avatarBorder: 'border-zinc-700/40 group-hover:border-zinc-500 shadow-none',
          headerBg: 'bg-white/[0.02]'
        };
    }
  };

  const currentTier = userProfile?.tier || 'default';
  const activeTierDetails = getTierDetails(currentTier);

  // Generate dynamic initials for the user avatar
  const getUserInitials = () => {
    if (!user) return 'RV';
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
    return user.email?.slice(0, 2).toUpperCase() || 'RV';
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isLightNavbarPage
            ? isScrolled
              ? 'bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-zinc-200 py-4 shadow-sm'
              : 'bg-transparent py-6'
            : isScrolled
              ? 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 py-4 shadow-sm'
              : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#94a3b8] to-[#f8fafc] rounded-sm transform rotate-45 group-hover:rotate-90 transition-transform duration-500"></div>
            <span className={`font-bold text-2xl tracking-tighter uppercase ${
              isCollectionPage
                ? 'text-zinc-900'
                : isProfilePage
                  ? (isScrolled ? 'text-zinc-900' : 'text-white')
                  : 'text-white'
            }`}>
              RideVault
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <div className={`flex gap-10 text-[11px] uppercase tracking-[0.2em] font-medium ${
              isCollectionPage
                ? 'text-zinc-500'
                : isProfilePage
                  ? (isScrolled ? 'text-zinc-500' : 'text-white/60')
                  : 'text-white/60'
            }`}>
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`transition-colors ${
                    isCollectionPage
                      ? 'hover:text-zinc-900'
                      : isProfilePage
                        ? (isScrolled ? 'hover:text-zinc-900' : 'hover:text-white')
                        : 'hover:text-white'
                  }`}
                  onClick={() => {
                    if (window.location.pathname === '/') {
                      setTimeout(() => {
                        const el = document.querySelector(link.href.replace('/', ''));
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 0);
                    }
                  }}
                >
                  {link.name}
                </a>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                /* LUXURY DROPDOWN WRAPPER */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 focus:outline-none group cursor-pointer"
                  >
                    {/* Pulsating green online dot on top of dynamic avatar */}
                    <div className="relative">
                      {(userProfile?.photoURL || user.photoURL) ? (
                        <img
                          src={userProfile?.photoURL || user.photoURL}
                          alt="Profile"
                          referrerPolicy="no-referrer"
                          className={`w-9 h-9 rounded-full object-cover border transition-all duration-300 ${activeTierDetails.avatarBorder}`}
                        />
                      ) : (
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 text-white font-bold text-xs flex items-center justify-center border transition-all duration-300 ${activeTierDetails.avatarBorder}`}>
                          {getUserInitials()}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#050505] rounded-full"></span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] uppercase tracking-widest font-medium transition-colors ${
                        isCollectionPage
                          ? 'text-zinc-900 group-hover:text-[#D4AF37]'
                          : isProfilePage
                            ? (isScrolled ? 'text-zinc-900 group-hover:text-[#D4AF37]' : 'text-white group-hover:text-[#D4AF37]')
                            : 'text-white group-hover:text-[#D4AF37]'
                      }`}>
                        {userProfile?.name?.split(' ')[0] || user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                      </span>
                      <ChevronDown size={12} className={`transition-transform duration-300 ${
                        isCollectionPage
                          ? 'text-zinc-400 group-hover:text-[#D4AF37]'
                          : isProfilePage
                            ? (isScrolled ? 'text-zinc-400 group-hover:text-[#D4AF37]' : 'text-white/40 group-hover:text-[#D4AF37]')
                            : 'text-white/40 group-hover:text-[#D4AF37]'
                      } ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Dropdown Menu Container */}
                  <ProfileDropdown 
                    isOpen={isDropdownOpen} 
                    onClose={() => setIsDropdownOpen(false)} 
                    isProfilePage={isProfilePage} 
                  />
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-6 py-2 border border-white/20 rounded-full text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-500 text-white block text-center"
                >
                  {t('nav.signin')}
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`md:hidden cursor-pointer focus:outline-none ${
              isCollectionPage
                ? 'text-zinc-900'
                : isProfilePage
                  ? (isScrolled ? 'text-zinc-900' : 'text-white')
                  : 'text-white'
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 w-full bg-[#050505] border-b border-white/10 shadow-xl py-8 px-6 flex flex-col gap-5 md:hidden max-h-[85vh] overflow-y-auto"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[#F3F4F6] text-xs uppercase tracking-[0.2em] font-medium border-b border-white/5 pb-2 hover:text-[#D4AF37] transition-colors"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (window.location.pathname === '/') {
                    setTimeout(() => {
                      const el = document.querySelector(link.href.replace('/', ''));
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 0);
                  }
                }}
              >
                {link.name}
              </a>
            ))}
            
            {user ? (
              <div className="flex flex-col gap-4 mt-2">
                {/* Mobile Profile Card */}
                <div className={`p-4 border border-white/10 rounded-sm flex items-center gap-4 transition-all duration-500 ${activeTierDetails.headerBg}`}>
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 text-white font-bold text-sm flex items-center justify-center shrink-0 border transition-all duration-500 ${activeTierDetails.avatarBorder}`}>
                    {(userProfile?.photoURL || user.photoURL) ? (
                      <img src={userProfile?.photoURL || user.photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      getUserInitials()
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-sm text-white truncate">{userProfile?.name || user.displayName || user.email?.split('@')[0] || 'RideVault Member'}</h4>
                    <p className="text-[10px] text-white/40 truncate font-light mb-2.5">{user.email}</p>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border transition-all duration-500 ${activeTierDetails.colorClass}`}>
                      <Sparkles size={8} /> {activeTierDetails.label}
                    </span>
                  </div>
                </div>


                {/* Mobile Quick links list */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDropdownItemClick('profile')}
                    className="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 text-left text-[10px] uppercase tracking-wider text-white/70 rounded-sm flex items-center gap-2"
                  >
                    <User size={12} className="text-[#D4AF37]" />
                    <span>{t('nav.profile')}</span>
                  </button>
                  <button
                    onClick={() => handleDropdownItemClick('bookings')}
                    className="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 text-left text-[10px] uppercase tracking-wider text-white/70 rounded-sm flex items-center gap-2"
                  >
                    <Clock size={12} className="text-[#D4AF37]" />
                    <span>{t('nav.bookings')}</span>
                  </button>
                  <button
                    onClick={() => handleDropdownItemClick('favorites')}
                    className="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 text-left text-[10px] uppercase tracking-wider text-white/70 rounded-sm flex items-center gap-2"
                  >
                    <Heart size={12} className="text-[#D4AF37]" />
                    <span>{t('nav.favorites')}</span>
                  </button>
                  <button
                    onClick={() => handleDropdownItemClick('settings')}
                    className="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 text-left text-[10px] uppercase tracking-wider text-white/70 rounded-sm flex items-center gap-2"
                  >
                    <Settings size={12} className="text-[#D4AF37]" />
                    <span>{t('nav.settings')}</span>
                  </button>
                </div>

                {/* Sign Out block */}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); logOut(); }}
                  className="w-full mt-2 border border-red-500/30 bg-red-950/20 text-red-400 py-3 rounded-full text-[10px] uppercase tracking-widest hover:bg-red-950/30 transition-all block text-center cursor-pointer font-bold"
                >
                  {t('nav.signout')}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="border border-white/20 text-[#F3F4F6] px-6 py-3 rounded-full mt-4 text-[10px] uppercase tracking-widest w-full hover:bg-white hover:text-black transition-all block text-center"
              >
                {t('nav.signin')}
              </Link>
            )}
          </motion.div>
        )}
      </nav>

      {/* LUXURY INTERACTIVE TOAST SYSTEM */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-[#0d0d0d] border border-[#D4AF37]/30 text-white py-4 px-5 rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.9)] flex items-start gap-3.5 backdrop-blur-md"
          >
            <div className="text-[#D4AF37] shrink-0 mt-0.5">
              <CheckCircle size={18} />
            </div>
            <div className="flex-1">
              <h5 className="font-bold text-[10px] uppercase tracking-wider text-[#D4AF37] mb-0.5">RideVault Concierge</h5>
              <p className="text-white/80 font-light text-xs leading-relaxed">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PROFILE SETTINGS MODAL */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0c0c0c] border border-white/10 max-w-md w-full p-6 rounded-sm shadow-2xl text-white relative"
            >
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              <h3 className="font-bold text-base uppercase tracking-widest text-[#D4AF37] mb-6">
                Premium Profile Settings
              </h3>

              <div className="space-y-5">
                {/* Avatar selector */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-2 font-medium">
                    Select Elite Avatar
                  </label>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          alt="Preview"
                          className="w-14 h-14 rounded-full object-cover border-2 border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-sm text-zinc-400">
                          {getUserInitials()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 grid grid-cols-4 gap-1.5">
                      {[
                        { name: 'Ducati Red', url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=200&auto=format&fit=crop' },
                        { name: 'Yamaha Blue', url: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=200&auto=format&fit=crop' },
                        { name: 'Gold Speed', url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=200&auto=format&fit=crop' },
                        { name: 'Dark Rider', url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=200&auto=format&fit=crop' }
                      ].map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setProfilePhoto(item.url)}
                          className="text-[8px] uppercase font-bold py-1 px-1 bg-zinc-900 border border-white/5 hover:border-[#D4AF37] rounded-sm truncate transition-all text-white/70 hover:text-white"
                          title={item.name}
                        >
                          {item.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                    placeholder="Or enter custom image URL"
                    className="w-full bg-[#121212] border border-white/10 rounded-sm py-2 px-3 text-xs text-white/80 focus:outline-none focus:border-[#D4AF37] transition-all"
                  />
                </div>

                {/* Name field */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-medium">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#121212] border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                  />
                </div>

                {/* Email (Readonly) */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-medium">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-zinc-900/60 border border-white/5 rounded-sm py-2 px-3 text-xs text-white/40 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 bg-transparent text-white/60 hover:text-white text-[10px] uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!profileName.trim()) {
                      alert('Display name cannot be empty');
                      return;
                    }
                    setIsSavingProfile(true);
                    try {
                      await updateUserProfile(profileName, profilePhoto);
                      setIsProfileModalOpen(false);
                      triggerToast('Profile successfully saved to your cloud secure account.');
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIsSavingProfile(false);
                    }
                  }}
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 bg-[#D4AF37] text-black font-semibold text-[10px] uppercase tracking-widest hover:bg-[#b8942b] transition-all rounded-sm flex items-center gap-2"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 size={10} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
