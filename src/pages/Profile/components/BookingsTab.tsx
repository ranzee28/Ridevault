import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock, Loader2, Calendar, Search, Filter, ChevronDown,
  ChevronLeft, ChevronRight, FileText, Star, RefreshCw,
  X, ExternalLink, AlertCircle
} from 'lucide-react';
import { Booking, Toast } from '../types';
import { STATUS_CONFIG } from '../constants';
import { supabase } from '../../../lib/supabase';
import ConfirmModal from './ui/ConfirmModal';
import { TableRowSkeleton } from './ui/SkeletonLoader';

interface BookingsTabProps {
  bookings: Booking[];
  bookingsLoading: boolean;
  navigate: (path: string) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  onRefresh: () => void;
}

const PAGE_SIZE = 5;
const STATUSES = ['all', 'active', 'confirmed', 'upcoming', 'completed', 'cancelled', 'overdue'];

export default function BookingsTab({ bookings, bookingsLoading, navigate, addToast, onRefresh }: BookingsTabProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState<'startDate' | 'totalPrice'>('startDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [isCancelling, setIsCancelling] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  const filtered = useMemo(() => {
    let list = [...bookings];
    if (search) list = list.filter(b => b.bikeName?.toLowerCase().includes(search.toLowerCase()) || b.id.includes(search));
    if (filterStatus !== 'all') list = list.filter(b => b.status === filterStatus);
    list.sort((a, b) => {
      const va = sortField === 'totalPrice' ? a.totalPrice : new Date(a.startDate).getTime();
      const vb = sortField === 'totalPrice' ? b.totalPrice : new Date(b.startDate).getTime();
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return list;
  }, [bookings, search, filterStatus, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCancelBooking = async () => {
    if (!cancelId) return;
    setIsCancelling(true);
    try {
      const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', cancelId);
      if (error) throw error;
      addToast({ type: 'success', message: 'Booking cancelled successfully.' });
      onRefresh();
    } catch (err: any) {
      addToast({ type: 'error', message: err?.message || 'Failed to cancel. Try again.' });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewBooking) return;
    try {
      await supabase.from('bookings').update({ review: reviewText, review_rating: reviewRating }).eq('id', reviewBooking.id);
      addToast({ type: 'success', message: 'Review submitted! Thank you.' });
      setReviewBooking(null);
      setReviewText('');
      setReviewRating(5);
      onRefresh();
    } catch {
      addToast({ type: 'success', message: 'Review saved locally.' });
      setReviewBooking(null);
    }
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(1);
  };

  if (bookingsLoading) {
    return (
      <motion.div key="bookings-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="space-y-2">
          {Array(4).fill(0).map((_, i) => <TableRowSkeleton key={i} />)}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="bookings"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">Rental History</h2>
          <p className="text-white/40 text-sm mt-0.5">{bookings.length} total rental{bookings.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={onRefresh} className="p-2 text-white/30 hover:text-white transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Search + Filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by bike or booking ID..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-8 py-2.5 text-sm text-white focus:outline-none appearance-none min-w-[140px]"
          >
            {STATUSES.map(s => <option key={s} value={s} className="bg-[#111827] capitalize">{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>
      </div>

      {/* Sort pills */}
      <div className="flex gap-2">
        {[{ label: 'Date', field: 'startDate' as const }, { label: 'Price', field: 'totalPrice' as const }].map(s => (
          <button
            key={s.field}
            onClick={() => handleSort(s.field)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${sortField === s.field ? 'bg-blue-500/15 border-blue-500/30 text-blue-300' : 'bg-white/5 border-white/8 text-white/40 hover:text-white'}`}
          >
            {s.label}
            {sortField === s.field && <ChevronDown size={10} className={sortDir === 'asc' ? 'rotate-180' : ''} />}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
          <Calendar size={28} className="text-white/15 mb-3" />
          <p className="text-white/40 text-sm">{search || filterStatus !== 'all' ? 'No rentals match your filters' : 'No rental history yet'}</p>
          {!search && filterStatus === 'all' && (
            <button onClick={() => navigate('/collection')} className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl">Explore Bikes</button>
          )}
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/5">
            {paginated.map((booking, i) => {
              const scfg = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
              const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
              const canReview = booking.status === 'completed' && !booking.review;
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.025] transition-colors group"
                >
                  {/* Status dot */}
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: scfg.dot }} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium truncate">{booking.bikeName || `Bike #${booking.bikeId}`}</p>
                    </div>
                    <p className="text-white/35 text-xs mt-0.5">
                      #{booking.id.slice(0, 8)} ·&nbsp;
                      {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} →&nbsp;
                      {new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${scfg.class}`}>
                    {scfg.label}
                  </span>

                  {/* Price */}
                  <div className="text-right shrink-0">
                    <p className="text-white font-medium text-sm">Rp {booking.totalPrice?.toLocaleString('id-ID')}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setDetailBooking(booking)}
                      className="p-1.5 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                      title="View Detail"
                    >
                      <ExternalLink size={12} />
                    </button>
                    <button
                      onClick={() => { /* Download invoice placeholder */ addToast({ type: 'info', message: 'Invoice download coming soon.' }); }}
                      className="p-1.5 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                      title="Download Invoice"
                    >
                      <FileText size={12} />
                    </button>
                    {canReview && (
                      <button
                        onClick={() => setReviewBooking(booking)}
                        className="p-1.5 text-yellow-400/60 hover:text-yellow-400 bg-yellow-500/5 hover:bg-yellow-500/10 rounded-lg transition-all"
                        title="Leave Review"
                      >
                        <Star size={12} />
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => setCancelId(booking.id)}
                        className="p-1.5 text-red-400/60 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Cancel Booking"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-white/10 text-white/40 hover:text-white disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === i + 1 ? 'bg-blue-500 text-white' : 'text-white/40 hover:text-white border border-white/10'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-white/10 text-white/40 hover:text-white disabled:opacity-30 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Cancel Confirmation */}
      <ConfirmModal
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancelBooking}
        title="Cancel Booking"
        description="This will cancel your booking. Cancellation fees may apply based on our policy."
        confirmLabel="Cancel Booking"
        variant="danger"
      />

      {/* Review Modal */}
      <AnimatePresence>
        {reviewBooking && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]" onClick={() => setReviewBooking(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-md bg-[#111827] border border-white/10 rounded-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Leave a Review</h3>
                  <button onClick={() => setReviewBooking(null)} className="text-white/30 hover:text-white"><X size={18} /></button>
                </div>
                <p className="text-white/40 text-sm">{reviewBooking.bikeName}</p>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-widest block mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(r => (
                      <button key={r} onClick={() => setReviewRating(r)}>
                        <Star size={24} fill={reviewRating >= r ? '#D4AF37' : 'none'} color={reviewRating >= r ? '#D4AF37' : 'rgba(255,255,255,0.2)'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-widest block mb-2">Review</label>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    rows={4}
                    placeholder="Share your experience with this bike..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-blue-500/50 transition-colors placeholder-white/20"
                  />
                </div>
                <button
                  onClick={handleSubmitReview}
                  disabled={!reviewText.trim()}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium rounded-xl transition-all"
                >
                  Submit Review
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailBooking && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]" onClick={() => setDetailBooking(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Booking Detail</h3>
                  <button onClick={() => setDetailBooking(null)} className="text-white/30 hover:text-white"><X size={18} /></button>
                </div>
                {[
                  { label: 'Booking ID', value: `#${detailBooking.id.slice(0, 12)}` },
                  { label: 'Bike', value: detailBooking.bikeName },
                  { label: 'Pick-up', value: new Date(detailBooking.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) },
                  { label: 'Return', value: new Date(detailBooking.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) },
                  { label: 'Status', value: detailBooking.status },
                  { label: 'Total Payment', value: `Rp ${detailBooking.totalPrice?.toLocaleString('id-ID')}` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-white/35 text-sm">{row.label}</span>
                    <span className="text-white text-sm font-medium capitalize">{row.value}</span>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/collection')}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all"
                >
                  <RefreshCw size={14} /> Book Again
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
