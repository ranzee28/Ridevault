import { motion } from 'motion/react';
import { Heart, Calendar, Award, Zap, Crown, Check, ChevronRight, Star, Clock, BarChart3, User } from 'lucide-react';
import StatCard from './StatCard';
import { TIER_CONFIG } from '../constants';
import { Tab, Booking } from '../types';

interface OverviewTabProps {
  userProfile: any;
  memberSince: string;
  currentTier: string;
  setActiveTab: (tab: Tab) => void;
  bookings: Booking[];
}

export default function OverviewTab({ userProfile, memberSince, currentTier, setActiveTab, bookings }: OverviewTabProps) {
  const tierCfg = TIER_CONFIG[currentTier as keyof typeof TIER_CONFIG] || TIER_CONFIG.default;

  const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'confirmed').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const loyaltyPoints = completedBookings * 100;

  const recentBookings = [...bookings].slice(0, 3);

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-6"
    >
      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Total Rentals" value={bookings.length} color="#3B82F6" />
        <StatCard icon={Zap} label="Active" value={activeBookings} color="#10b981" />
        <StatCard icon={Check} label="Completed" value={completedBookings} color="#8b5cf6" />
        <StatCard icon={Star} label="Loyalty Points" value={loyaltyPoints.toLocaleString()} color="#D4AF37" />
      </div>

      {/* Tier Benefits summary */}
      <div
        className="relative rounded-2xl p-5 overflow-hidden border"
        style={{ borderColor: tierCfg.borderColor, background: `linear-gradient(135deg, ${tierCfg.cardGradient[0]}50, ${tierCfg.cardGradient[2]}50)` }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 opacity-10 pointer-events-none">
          <Crown size={160} style={{ color: tierCfg.color }} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Crown size={15} style={{ color: tierCfg.color }} />
              <h3 className="font-semibold text-white text-sm">{tierCfg.label} — Your Privileges</h3>
            </div>
            <button
              onClick={() => setActiveTab('membership-progress')}
              className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors"
            >
              View Progress <ChevronRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              `${tierCfg.discount} rental discount`,
              currentTier !== 'default' ? 'Priority booking' : 'Standard booking',
              currentTier === 'gold' || currentTier === 'elite' ? 'Free valet delivery' : 'Standard delivery',
              currentTier === 'gold' || currentTier === 'elite' ? 'VIP event access' : 'No event access',
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${tierCfg.color}20`, border: `1px solid ${tierCfg.color}30` }}
                >
                  <Check size={8} style={{ color: tierCfg.color }} />
                </div>
                {benefit}
              </div>
            ))}
          </div>
          {currentTier === 'default' && (
            <button
              onClick={() => setActiveTab('membership-progress')}
              className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37] text-black text-xs font-bold rounded-xl hover:bg-yellow-300 transition-all"
            >
              Upgrade Now <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 space-y-3">
          <h3 className="text-white/40 text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
            <BarChart3 size={11} className="text-blue-400" /> Spending
          </h3>
          <div className="text-2xl font-bold text-white">
            Rp {totalSpent.toLocaleString('id-ID')}
          </div>
          <div className="text-white/30 text-xs">Total spent on rentals</div>
        </div>
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 space-y-3">
          <h3 className="text-white/40 text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
            <Heart size={11} className="text-rose-400" /> Favorites
          </h3>
          <div className="text-2xl font-bold text-white">
            {userProfile?.favorites?.length || 0}
          </div>
          <div className="text-white/30 text-xs">Saved superbikes</div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white/60 text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
            <Clock size={11} className="text-blue-400" /> Recent Rentals
          </h3>
          <button
            onClick={() => setActiveTab('rentals')}
            className="text-xs text-white/30 hover:text-white flex items-center gap-1 transition-colors"
          >
            View All <ChevronRight size={11} />
          </button>
        </div>
        {recentBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Calendar size={24} className="text-white/15 mb-3" />
            <p className="text-white/30 text-sm">No rental history yet</p>
            <button
              onClick={() => window.location.href = '/collection'}
              className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs rounded-xl"
            >
              Book Your First Ride
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentBookings.map((booking, i) => {
              const statusColors: Record<string, string> = {
                active: '#10b981', confirmed: '#3b82f6', completed: '#8b5cf6', cancelled: '#ef4444', pending: '#f59e0b'
              };
              const color = statusColors[booking.status] || '#94a3b8';
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{booking.bikeName}</p>
                    <p className="text-white/35 text-xs mt-0.5">
                      {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white/70 text-sm font-medium">Rp {booking.totalPrice?.toLocaleString('id-ID')}</p>
                    <p className="text-xs capitalize mt-0.5" style={{ color }}>{booking.status}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
        <h3 className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-4 flex items-center gap-2">
          <Star size={11} className="text-blue-400" /> Recent Activity
        </h3>
        <div className="space-y-0">
          {[
            { text: 'Profile created on RideVault', time: memberSince, icon: User, color: '#3b82f6' },
            { text: `Membership Tier: ${tierCfg.label}`, time: 'Current', icon: Crown, color: tierCfg.color },
            { text: `${userProfile?.favorites?.length || 0} bikes saved to garage`, time: 'Last updated', icon: Heart, color: '#f43f5e' },
            { text: `${completedBookings} rentals completed`, time: 'Total', icon: Award, color: '#8b5cf6' },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 pb-4 relative">
              {i < 3 && (
                <div className="absolute left-[15px] top-7 bottom-0 w-px bg-white/5" />
              )}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10"
                style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}
              >
                <item.icon size={13} style={{ color: item.color }} />
              </div>
              <div className="pt-1.5">
                <p className="text-white/70 text-sm">{item.text}</p>
                <p className="text-white/30 text-xs mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
