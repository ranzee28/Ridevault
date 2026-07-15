import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Settings, LogOut, Heart, Clock, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isProfilePage: boolean;
}

export default function ProfileDropdown({ isOpen, onClose, isProfilePage }: ProfileDropdownProps) {
  const { t } = useLanguage();
  const { user, userProfile, logOut } = useAuth();
  const navigate = useNavigate();

  const handleDropdownItemClick = (type: string) => {
    onClose();
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

  const getTierDetails = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return {
          label: t('nav.tier_bronze') || 'Bronze',
          color: 'text-amber-500',
          bg: 'bg-amber-950/20',
          border: 'border-amber-500/30',
          gradient: 'from-amber-900/40 to-transparent',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
          nextTier: 'Silver',
          pointsReq: 500
        };
      case 'silver':
        return {
          label: t('nav.tier_silver') || 'Silver',
          color: 'text-slate-300',
          bg: 'bg-slate-900/40',
          border: 'border-slate-400/30',
          gradient: 'from-slate-800/40 to-transparent',
          glow: 'shadow-[0_0_15px_rgba(203,213,225,0.15)]',
          nextTier: 'Gold',
          pointsReq: 1500
        };
      case 'gold':
        return {
          label: t('nav.tier_gold') || 'Gold',
          color: 'text-yellow-500',
          bg: 'bg-yellow-950/20',
          border: 'border-yellow-500/30',
          gradient: 'from-yellow-900/30 to-transparent',
          glow: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]',
          nextTier: 'Max Tier',
          pointsReq: Math.max(1, points)
        };
      default:
        return {
          label: t('nav.tier_default') || 'Member',
          color: 'text-zinc-400',
          bg: 'bg-zinc-900/40',
          border: 'border-zinc-700/30',
          gradient: 'from-zinc-800/30 to-transparent',
          glow: 'shadow-none',
          nextTier: 'Bronze',
          pointsReq: 100
        };
    }
  };

  const currentTier = userProfile?.tier || 'default';
  const points = userProfile?.loyaltyPoints || 0;
  const tierDetails = getTierDetails(currentTier);
  
  // Calculate progress to next tier
  const progressPercent = Math.min(100, Math.max(0, (points / tierDetails.pointsReq) * 100));

  const getUserInitials = () => {
    if (!user) return 'RV';
    if (user.displayName) {
      return user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    }
    return user.email?.slice(0, 2).toUpperCase() || 'RV';
  };

  if (!user) return null;

  // Determine styling based on context (Profile page vs Dark pages)
  const isDark = !isProfilePage;
  const containerBg = isDark ? 'bg-[#0a0a0a]/95' : 'bg-white/95';
  const containerBorder = isDark ? 'border-white/10' : 'border-zinc-200';
  const textColor = isDark ? 'text-white' : 'text-zinc-900';
  const textMuted = isDark ? 'text-white/50' : 'text-zinc-500';
  const itemHover = isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-100/80';
  const divider = isDark ? 'border-white/10' : 'border-zinc-100';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(5px)' }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute right-0 mt-4 w-[340px] rounded-2xl overflow-hidden z-50 backdrop-blur-2xl border ${containerBorder} ${containerBg} shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]`}
        >
          {/* Top Header Section */}
          <div className={`p-5 pb-4 border-b ${divider} bg-gradient-to-b ${tierDetails.gradient}`}>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0 group">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden border-2 ${tierDetails.border} ${tierDetails.glow} transition-all duration-300 group-hover:scale-105 group-hover:border-[#D4AF37]`}>
                  {(userProfile?.photoURL || user.photoURL) ? (
                    <img src={userProfile?.photoURL || user.photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    <span className={isDark ? 'text-white/80' : 'text-zinc-700'}>{getUserInitials()}</span>
                  )}
                </div>
                {/* Verification Badge */}
                <div className="absolute -bottom-1 -right-1 bg-[#0a0a0a] rounded-full p-0.5" title="Verified Member">
                  <ShieldCheck size={14} className="text-emerald-500" fill="currentColor" stroke="black" strokeWidth={1} />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`font-bold text-base truncate ${textColor} tracking-tight`}>
                  {userProfile?.name || user.displayName || user.email?.split('@')[0] || 'RideVault Member'}
                </h4>
                <p className={`text-xs truncate font-light mb-1.5 ${textMuted}`}>
                  {user.email}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${tierDetails.color} ${tierDetails.bg} ${tierDetails.border}`}>
                    <Sparkles size={10} /> {tierDetails.label}
                  </span>
                  <span className={`text-[10px] font-medium ${isDark ? 'text-white/60' : 'text-zinc-600'}`}>
                    {points.toLocaleString()} PTS
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Membership Preview Card */}
          <div className={`p-4 border-b ${divider}`}>
            <div className={`rounded-xl p-3 relative overflow-hidden border ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-zinc-200 bg-zinc-50'}`}>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <div className={`text-[10px] uppercase tracking-wider font-semibold ${textMuted} mb-1`}>Next Tier</div>
                  <div className={`text-sm font-bold ${textColor}`}>{tierDetails.nextTier}</div>
                </div>
                <div className={`text-[10px] font-mono ${textMuted}`}>
                  {points.toLocaleString()} / {tierDetails.pointsReq.toLocaleString()}
                </div>
              </div>
              {/* Progress Bar */}
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  className={`h-full rounded-full ${tierDetails.color.replace('text-', 'bg-')}`}
                />
              </div>
            </div>
          </div>

          {/* Quick Action Grid */}
          <div className="p-2 grid grid-cols-2 gap-1">
            <button
              onClick={() => handleDropdownItemClick('profile')}
              className={`p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group ${itemHover}`}
            >
              <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5 group-hover:bg-[#D4AF37]/10' : 'bg-zinc-100 group-hover:bg-[#D4AF37]/10'} transition-colors`}>
                <User size={18} className={`transition-colors ${isDark ? 'text-white/60 group-hover:text-[#D4AF37]' : 'text-zinc-600 group-hover:text-[#D4AF37]'}`} />
              </div>
              <span className={`text-[11px] font-medium ${isDark ? 'text-white/70 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-900'}`}>{t('nav.profile')}</span>
            </button>

            <button
              onClick={() => handleDropdownItemClick('bookings')}
              className={`p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group ${itemHover}`}
            >
              <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5 group-hover:bg-[#D4AF37]/10' : 'bg-zinc-100 group-hover:bg-[#D4AF37]/10'} transition-colors`}>
                <Clock size={18} className={`transition-colors ${isDark ? 'text-white/60 group-hover:text-[#D4AF37]' : 'text-zinc-600 group-hover:text-[#D4AF37]'}`} />
              </div>
              <span className={`text-[11px] font-medium ${isDark ? 'text-white/70 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-900'}`}>{t('nav.bookings')}</span>
            </button>

            <button
              onClick={() => handleDropdownItemClick('favorites')}
              className={`p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group ${itemHover}`}
            >
              <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5 group-hover:bg-[#D4AF37]/10' : 'bg-zinc-100 group-hover:bg-[#D4AF37]/10'} transition-colors`}>
                <Heart size={18} className={`transition-colors ${isDark ? 'text-white/60 group-hover:text-[#D4AF37]' : 'text-zinc-600 group-hover:text-[#D4AF37]'}`} />
              </div>
              <span className={`text-[11px] font-medium ${isDark ? 'text-white/70 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-900'}`}>{t('nav.favorites')}</span>
            </button>

            <button
              onClick={() => handleDropdownItemClick('settings')}
              className={`p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group ${itemHover}`}
            >
              <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5 group-hover:bg-[#D4AF37]/10' : 'bg-zinc-100 group-hover:bg-[#D4AF37]/10'} transition-colors`}>
                <Settings size={18} className={`transition-colors ${isDark ? 'text-white/60 group-hover:text-[#D4AF37]' : 'text-zinc-600 group-hover:text-[#D4AF37]'}`} />
              </div>
              <span className={`text-[11px] font-medium ${isDark ? 'text-white/70 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-900'}`}>{t('nav.settings')}</span>
            </button>
          </div>

          {/* Smart Status Strip */}
          <div className={`px-5 py-3 border-t border-b flex items-center justify-between ${isDark ? 'bg-[#111] border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
            <span className={`text-[9px] uppercase tracking-[0.2em] font-semibold flex items-center gap-2 ${textMuted}`}>
              System Status
            </span>
            <span className={`flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> 
              Online & Secure
            </span>
          </div>

          {/* Sign Out Button */}
          <div className="p-2">
            <button
              onClick={() => { onClose(); logOut(); }}
              className={`w-full px-4 py-3 rounded-xl text-left text-xs flex items-center justify-between transition-all font-semibold cursor-pointer group ${isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-950/30' : 'text-red-600 hover:bg-red-50'}`}
            >
              <div className="flex items-center gap-3">
                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="uppercase tracking-wider text-[10px]">{t('nav.signout')}</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
