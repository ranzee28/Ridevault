import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Gift, Copy, Check, Share2, Users, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { VoucherRow, LoyaltyHistoryRow } from '../../../lib/supabase-types';
import { useAuth } from '../../../contexts/AuthContext';
import { LoyaltyHistoryItem, Voucher, Toast } from '../types';

interface LoyaltyRewardsTabProps {
  user: any;
  bookingCount: number;
  addToast: (toast: Omit<Toast, 'id'>) => void;
}

function CopyButton({ text, addToast }: { text: string; addToast: (t: Omit<Toast, 'id'>) => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    addToast({ type: 'success', message: `"${text}" copied to clipboard!`, duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-all">
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export default function LoyaltyRewardsTab({ user, bookingCount, addToast }: LoyaltyRewardsTabProps) {
  const { userProfile, refreshProfile } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [history, setHistory] = useState<LoyaltyHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const referralCode = `RIDE-${(user?.id || 'DEMO').slice(0, 6).toUpperCase()}`;

  // Map Voucher DB row to frontend interface
  const mapRowToVoucher = (row: VoucherRow): Voucher => ({
    id: row.id,
    code: row.code,
    discount: row.discount,
    description: row.description || '',
    expiresAt: row.expires_at,
    used: row.used,
  });

  // Map Loyalty DB row to frontend interface
  const mapRowToHistory = (row: LoyaltyHistoryRow): LoyaltyHistoryItem => ({
    id: row.id,
    description: row.description,
    points: row.points,
    type: row.type,
    date: row.date,
  });

  // Fetch loyalty data from Supabase
  const loadLoyaltyData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Refresh profile to get latest loyalty points count
      await refreshProfile();

      // Fetch Vouchers
      const { data: vouchersData, error: vouchersError } = await supabase
        .from('vouchers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (vouchersError) throw vouchersError;

      // Fetch Loyalty History
      const { data: historyData, error: historyError } = await supabase
        .from('loyalty_history')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (historyError) throw historyError;

      setVouchers((vouchersData || []).map(mapRowToVoucher));
      setHistory((historyData || []).map(mapRowToHistory));
    } catch (err: any) {
      console.error('[LoyaltyRewards] Fetch error:', err);
      addToast({ type: 'error', message: 'Failed to load loyalty rewards data.' });
    } finally {
      setLoading(false);
    }
  }, [user?.id, refreshProfile, addToast]);

  useEffect(() => {
    loadLoyaltyData();
  }, [loadLoyaltyData]);

  // Derive points summary
  const totalPoints = userProfile?.loyaltyPoints || 0;
  const earnedPoints = history.filter(h => h.type === 'earned').reduce((sum, h) => sum + h.points, 0);
  const redeemedPoints = Math.abs(history.filter(h => h.type === 'redeemed').reduce((sum, h) => sum + h.points, 0));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse">
        <Loader2 size={24} className="text-white/20 animate-spin" />
        <p className="text-white/40 text-sm mt-2">Loading loyalty portal...</p>
      </div>
    );
  }

  return (
    <motion.div
      key="loyalty"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">Loyalty & Rewards</h2>
          <p className="text-white/40 text-sm mt-0.5">Earn points on every rental, unlock rewards and vouchers</p>
        </div>
        <button
          onClick={loadLoyaltyData}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white/60 hover:text-white transition-all"
        >
          Refresh Portal
        </button>
      </div>

      {/* Points Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Points', value: totalPoints.toLocaleString(), color: '#D4AF37' },
          { label: 'Points Earned', value: `+${earnedPoints.toLocaleString()}`, color: '#10b981' },
          { label: 'Points Redeemed', value: `-${redeemedPoints.toLocaleString()}`, color: '#ef4444' },
        ].map(stat => (
          <div key={stat.label} className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-white/35 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Vouchers */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-white/60 text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
            <Gift size={11} className="text-blue-400" /> Your Vouchers
          </h3>
        </div>
        
        {vouchers.length === 0 ? (
          <div className="p-8 text-center text-white/30 text-sm">
            You don't have any vouchers yet. Complete rentals to earn rewards!
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vouchers.map(v => (
              <motion.div
                key={v.id}
                className={`relative rounded-xl border p-4 overflow-hidden ${v.used ? 'opacity-40 border-white/5 bg-white/[0.01]' : 'border-[#D4AF37]/20 bg-[#D4AF37]/5'}`}
              >
                {/* Dashed border simulation */}
                {!v.used && (
                  <div className="absolute top-0 left-0 right-0 bottom-0 rounded-xl border-2 border-dashed border-[#D4AF37]/15 pointer-events-none" />
                )}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{v.discount} Off</p>
                    <p className="text-white/40 text-xs mt-0.5">{v.description}</p>
                  </div>
                  {v.used && (
                    <span className="px-2 py-0.5 bg-white/10 rounded text-white/30 text-[10px]">Used</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <code className="text-[#D4AF37] font-mono text-xs bg-[#D4AF37]/10 px-2 py-1 rounded">{v.code}</code>
                    {!v.used && <CopyButton text={v.code} addToast={addToast} />}
                  </div>
                  <div className="flex items-center gap-1 text-white/25 text-[10px]">
                    <Clock size={9} /> Exp. {new Date(v.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Referral */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
        <h3 className="text-white/60 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 mb-4">
          <Users size={11} className="text-blue-400" /> Refer & Earn
        </h3>
        <p className="text-white/50 text-sm mb-4">
          Share your referral code. Earn <span className="text-[#D4AF37] font-medium">150 points</span> for every friend who rents their first bike.
        </p>
        <div className="flex items-center gap-3 p-4 bg-white/[0.04] border border-white/10 rounded-xl">
          <code className="text-white font-mono text-lg tracking-widest flex-1">{referralCode}</code>
          <CopyButton text={referralCode} addToast={addToast} />
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'RideVault Referral', text: `Use my code ${referralCode} for a discount!`, url: window.location.origin });
              } else {
                addToast({ type: 'info', message: 'Share not supported on this browser.' });
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-all"
          >
            <Share2 size={12} /> Share
          </button>
        </div>
      </div>

      {/* History */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-white/60 text-xs uppercase tracking-widest font-semibold">Reward History</h3>
        </div>
        
        {history.length === 0 ? (
          <div className="p-8 text-center text-white/30 text-sm">
            No loyalty point transaction history yet.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {history.map(item => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'earned' ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
                  <Gift size={13} className={item.type === 'earned' ? 'text-emerald-400' : 'text-red-400'} />
                </div>
                <div className="flex-1">
                  <p className="text-white/80 text-sm">{item.description}</p>
                  <p className="text-white/30 text-xs mt-0.5">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <span className={`font-mono font-bold text-sm shrink-0 ${item.type === 'earned' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
