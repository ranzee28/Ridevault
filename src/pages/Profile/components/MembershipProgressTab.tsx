import { motion } from 'motion/react';
import { TrendingUp, Check, Lock, Gift, Zap, Shield, Star, Crown } from 'lucide-react';
import { TIER_CONFIG, TIER_BENEFITS } from '../constants';

interface MembershipProgressTabProps {
  userProfile: any;
  bookingCount: number;
  setActiveTab: (tab: any) => void;
}

const TIER_ORDER = ['bronze', 'silver', 'gold'] as const;

export default function MembershipProgressTab({ userProfile, bookingCount, setActiveTab }: MembershipProgressTabProps) {
  const currentTier = (userProfile?.tier || 'default') as keyof typeof TIER_CONFIG;
  const tierCfg = TIER_CONFIG[currentTier];
  const benefits = TIER_BENEFITS[currentTier] || TIER_BENEFITS.default;
  
  // Only bronze, silver, gold in the ladder
  const tierIndex = TIER_ORDER.indexOf(currentTier as any);
  const nextTierKey = currentTier === 'default' 
    ? 'bronze' 
    : (tierIndex >= 0 && tierIndex < TIER_ORDER.length - 1 ? TIER_ORDER[tierIndex + 1] : null);
  const nextTierCfg = nextTierKey ? TIER_CONFIG[nextTierKey as keyof typeof TIER_CONFIG] : null;

  // Points: 100 per booking (mock calculation)
  const totalPoints = bookingCount * 100;
  const pointsForNextTier = nextTierCfg ? nextTierCfg.pointsToNext : 0;
  const progress = pointsForNextTier > 0 ? Math.min((totalPoints / pointsForNextTier) * 100, 100) : 100;

  const upcomingRewards = [
    { icon: Zap, label: `${tierCfg.discount} Rental Discount`, desc: 'Applied automatically to all bookings', unlocked: true },
    { icon: Shield, label: 'Comprehensive Insurance', desc: currentTier !== 'default' ? 'Included in your membership' : 'Upgrade to Bronze to unlock', unlocked: currentTier !== 'default' },
    { icon: Star, label: 'Priority Booking', desc: currentTier !== 'default' ? 'Skip the queue on popular bikes' : 'Upgrade to access', unlocked: currentTier !== 'default' },
    { icon: Crown, label: 'Exclusive Superbike Access', desc: currentTier === 'gold' || currentTier === 'elite' ? 'All bikes available to you' : 'Available from Gold tier', unlocked: currentTier === 'gold' || currentTier === 'elite' },
    { icon: Gift, label: 'Loyalty Rewards', desc: 'Earn points on every rental', unlocked: true },
  ];

  return (
    <motion.div
      key="membership-progress"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-white font-semibold text-lg">Membership Progress</h2>
        <p className="text-white/40 text-sm mt-0.5">Track your progress and unlock exclusive benefits</p>
      </div>

      {/* Current Tier Card */}
      <div
        className="relative rounded-2xl p-6 overflow-hidden border"
        style={{ borderColor: tierCfg.borderColor, boxShadow: `0 0 40px ${tierCfg.glowColor}` }}
      >
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${tierCfg.cardGradient[0]}80, ${tierCfg.cardGradient[2]}80)` }}
        />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-widest ${tierCfg.badgeClass}`}>
                <Crown size={10} /> {tierCfg.shortLabel}
              </span>
              <h3 className="text-white font-bold text-xl mt-2">{tierCfg.label}</h3>
              <p className="text-white/50 text-sm">{tierCfg.discount} discount on all rentals</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: tierCfg.color }}>
                {totalPoints.toLocaleString()}
              </div>
              <div className="text-white/40 text-xs">Total Points</div>
            </div>
          </div>

          {/* Progress to next tier */}
          {nextTierCfg && nextTierKey ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/50 text-xs">Progress to {nextTierCfg.label}</span>
                <span className="text-white/70 text-xs font-mono">
                  {Math.max(0, pointsForNextTier - totalPoints).toLocaleString()} pts remaining
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${tierCfg.color}, ${nextTierCfg.color})` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs" style={{ color: tierCfg.color }}>{tierCfg.shortLabel}</span>
                <span className="text-xs" style={{ color: nextTierCfg.color }}>{nextTierCfg.shortLabel}</span>
              </div>
            </>
          ) : (
              <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl">
                <Crown size={14} className="text-[#D4AF37]" />
                <span className="text-[#D4AF37] text-sm font-medium">Anda telah mencapai tingkat tertinggi! 🏆</span>
              </div>
          )}
        </div>
      </div>

      {/* Tier Ladder */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
        <h3 className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-4">Membership Tiers</h3>
        <div className="flex items-center gap-1">
          {TIER_ORDER.map((tier, i) => {
            const cfg = TIER_CONFIG[tier];
            const isActive = tier === currentTier;
            const isPast = TIER_ORDER.indexOf(tier) < tierIndex;
            return (
              <div key={tier} className="flex items-center flex-1">
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                      isActive ? 'scale-110 shadow-lg' : ''
                    }`}
                    style={{
                      background: isActive || isPast ? cfg.color : 'rgba(255,255,255,0.05)',
                      borderColor: isActive || isPast ? cfg.color : 'rgba(255,255,255,0.1)',
                      boxShadow: isActive ? `0 0 16px ${cfg.glowColor}` : '',
                    }}
                  >
                    {isPast ? <Check size={12} className="text-black" /> : isActive ? <Crown size={12} className="text-black" /> : null}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: isActive ? cfg.color : 'rgba(255,255,255,0.25)' }}>
                    {cfg.shortLabel}
                  </span>
                </div>
                {i < TIER_ORDER.length - 1 && (
                  <div className="flex-1 h-0.5 mb-5 rounded-full" style={{ background: isPast ? cfg.color : 'rgba(255,255,255,0.08)' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
        <h3 className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-4">Your Current Benefits</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                benefit.unlocked
                  ? 'bg-white/[0.03] border-white/8'
                  : 'bg-transparent border-white/5 opacity-40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  benefit.unlocked ? '' : 'bg-white/5'
                }`}
                style={benefit.unlocked ? { background: `${tierCfg.color}20`, border: `1px solid ${tierCfg.color}30` } : {}}
              >
                {benefit.unlocked
                  ? <Check size={12} style={{ color: tierCfg.color }} />
                  : <Lock size={12} className="text-white/20" />
                }
              </div>
              <span className={`text-sm ${benefit.unlocked ? 'text-white/70' : 'text-white/25'}`}>
                {benefit.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upcoming Rewards */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
        <h3 className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-4 flex items-center gap-2">
          <Gift size={12} className="text-[#D4AF37]" /> Hadiah Mendatang
        </h3>
        <div className="space-y-3">
          {upcomingRewards.map((reward, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                reward.unlocked ? 'bg-white/[0.04] border border-white/8' : 'opacity-40'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${reward.unlocked ? 'bg-blue-500/15 border border-blue-500/20' : 'bg-white/5'}`}>
                <reward.icon size={16} className={reward.unlocked ? 'text-blue-400' : 'text-white/20'} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${reward.unlocked ? 'text-white' : 'text-white/30'}`}>{reward.label}</p>
                <p className={`text-xs ${reward.unlocked ? 'text-white/40' : 'text-white/20'}`}>{reward.desc}</p>
              </div>
              {reward.unlocked && (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Check size={10} className="text-emerald-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {currentTier === 'default' && (
          <button
            onClick={() => setActiveTab('security')}
            className="mt-4 w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-medium rounded-xl transition-all"
          >
            Upgrade Membership to Unlock Rewards
          </button>
        )}
      </div>
    </motion.div>
  );
}
