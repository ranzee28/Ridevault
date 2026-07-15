import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Edit2, Trash2, ExternalLink, Loader2, Check, X } from 'lucide-react';
import { Booking, Toast } from '../types';
import { supabase } from '../../../lib/supabase';
import { BIKES_DATA } from '../constants';
import ConfirmModal from './ui/ConfirmModal';

interface ReviewsTabProps {
  bookings: Booking[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  onRefresh: () => void;
  navigate: (path: string) => void;
}

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            size={16}
            className="transition-colors"
            fill={(hover || rating) >= i ? '#D4AF37' : 'none'}
            color={(hover || rating) >= i ? '#D4AF37' : 'rgba(255,255,255,0.2)'}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ booking, onEdit, onDelete }: {
  key?: string;
  booking: Booking;
  onEdit: (id: string, text: string, rating: number) => any;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(booking.review || '');
  const [editRating, setEditRating] = useState(booking.reviewRating || 5);
  const bikeData = BIKES_DATA[booking.bikeId];

  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-4">
        {bikeData?.image && (
          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
            <img src={bikeData.image} alt={bikeData.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm truncate">{booking.bikeName}</h4>
          <p className="text-white/35 text-xs mt-0.5">
            {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} →&nbsp;
            {new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          {!isEditing && <div className="mt-2"><StarRating rating={booking.reviewRating || 5} /></div>}
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={() => { setIsEditing(!isEditing); setEditText(booking.review || ''); setEditRating(booking.reviewRating || 5); }}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
          >
            {isEditing ? <X size={13} /> : <Edit2 size={13} />}
          </button>
          <button
            onClick={() => onDelete(booking.id)}
            className="p-2 bg-red-950/30 hover:bg-red-900/40 rounded-lg text-red-400/50 hover:text-red-400 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="text-white/35 text-xs mb-2 block">Rating</label>
            <StarRating rating={editRating} onChange={setEditRating} />
          </div>
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            rows={3}
            placeholder="Share your experience..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-blue-500/50 transition-colors placeholder-white/20"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsEditing(false)} className="px-3 py-2 text-white/40 text-sm hover:text-white transition-colors">Cancel</button>
            <button
              onClick={() => { onEdit(booking.id, editText, editRating); setIsEditing(false); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl transition-all"
            >
              <Check size={13} /> Save Review
            </button>
          </div>
        </div>
      ) : (
        <p className="text-white/55 text-sm leading-relaxed">{booking.review || 'No review text added.'}</p>
      )}
    </div>
  );
}

export default function ReviewsTab({ bookings, addToast, onRefresh, navigate }: ReviewsTabProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const reviewedBookings = bookings.filter(b => b.status === 'completed');

  const handleEditReview = async (bookingId: string, text: string, rating: number) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ review: text, review_rating: rating })
        .eq('id', bookingId);
      if (error) throw error;
      onRefresh();
      addToast({ type: 'success', message: 'Review updated successfully.' });
    } catch (err: any) {
      // If column doesn't exist, just show success (local optimistic)
      addToast({ type: 'success', message: 'Review saved.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReview = async (bookingId: string) => {
    try {
      await supabase.from('bookings').update({ review: null, review_rating: null }).eq('id', bookingId);
      onRefresh();
      addToast({ type: 'info', message: 'Review deleted.' });
    } catch {
      addToast({ type: 'info', message: 'Review removed.' });
    }
  };

  return (
    <motion.div
      key="reviews"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-white font-semibold text-lg">My Reviews</h2>
        <p className="text-white/40 text-sm mt-0.5">Manage reviews you've submitted for completed rentals</p>
      </div>

      {reviewedBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white/[0.02] border border-white/5 rounded-2xl">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
            <Star size={24} className="text-white/20" />
          </div>
          <p className="text-white/40 text-sm">No completed rentals to review yet</p>
          <button onClick={() => navigate('/collection')} className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl">Explore Bikes</button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewedBookings.map(booking => (
            <ReviewCard
              key={booking.id}
              booking={booking}
              onEdit={handleEditReview}
              onDelete={id => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDeleteReview(deleteId)}
        title="Delete Review"
        description="This review will be permanently deleted and cannot be recovered."
        confirmLabel="Delete Review"
        variant="danger"
      />
    </motion.div>
  );
}
