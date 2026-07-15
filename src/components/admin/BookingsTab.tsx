import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Search, Edit2, Trash2, Save, X, Plus, Loader2 } from 'lucide-react';
import { mockBookings } from './mockData';
import { supabase } from '../../lib/supabase';

export default function BookingsTab() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    user: '', bike: '', startDate: '', endDate: '', status: 'Pending', total: 0, userId: ''
  });

  useEffect(() => {
    async function loadBookings() {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const dbBookings: any[] = data.map((b: any) => ({
          id: b.id,
          user: b.user_name,
          bike: b.bike_name,
          startDate: b.start_date,
          endDate: b.end_date,
          status: b.status,
          total: Number(b.total),
          userId: b.user_id
        }));
        
        if (dbBookings.length === 0) {
          // Sync mockBookings into state on first load if DB is empty
          setBookings(mockBookings);
        } else {
          setBookings(dbBookings);
        }
      } catch (error) {
        console.error("Error loading bookings from Supabase:", error);
        setBookings(mockBookings);
      } finally {
        setIsLoading(false);
      }
    }
    loadBookings();

    const channel = supabase.channel('bookings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredBookings = bookings.filter(b => 
    b.user?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.bike?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const targetId = editingId || `B-${Math.floor(1000 + Math.random() * 9000)}`;
    
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const finalUserId = formData.userId && formData.userId !== 'admin-created' ? formData.userId : (currentUser?.id || null);

      const bookingData = {
        id: targetId,
        user_name: formData.user,
        bike_name: formData.bike,
        start_date: formData.startDate,
        end_date: formData.endDate,
        status: formData.status,
        total: Number(formData.total),
        user_id: finalUserId
      };

      // Check if status is transitioning to Completed
      const previousBooking = bookings.find(b => b.id === targetId);
      const isNewlyCompleted = formData.status === 'Completed' && (!previousBooking || previousBooking.status !== 'Completed');

      const { error } = await supabase
        .from('bookings')
        .upsert(bookingData);
      
      if (error) throw error;

      // Award loyalty points if newly completed
      if (isNewlyCompleted && finalUserId && finalUserId !== 'admin-created') {
        const { awardBookingCompletionPoints } = await import('../../lib/loyalty');
        await awardBookingCompletionPoints(finalUserId, formData.bike, Number(formData.total));
      }
      
      const localBookingData = {
        id: targetId,
        user: formData.user,
        bike: formData.bike,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        total: formData.total,
        userId: finalUserId
      };

      if (editingId) {
        setBookings(prev => prev.map(b => b.id === editingId ? localBookingData : b));
        setEditingId(null);
      } else {
        setBookings([localBookingData, ...bookings]);
      }
      setIsAdding(false);
      resetForm();
    } catch (err) {
      console.error("Error saving booking:", err);
      alert("Error saving booking to Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (booking: any) => {
    setFormData({
      user: booking.user,
      bike: booking.bike,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
      total: booking.total,
      userId: booking.userId || ''
    });
    setEditingId(booking.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        setBookings(prev => prev.filter(b => b.id !== id));
      } catch (err) {
        console.error("Error deleting booking:", err);
        alert("Error deleting booking from Supabase.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({ user: '', bike: '', startDate: '', endDate: '', status: 'Pending', total: 0, userId: '' });
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Booking Schedule</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search bookings..." className="w-full pl-9 pr-4 py-2 bg-black/50 border border-white/10 rounded-md text-sm focus:border-[#D4AF37] focus:outline-none transition-colors text-white" />
          </div>
          <button onClick={() => { resetForm(); setIsAdding(true); }} className="flex items-center justify-center gap-2 bg-[#D4AF37] text-black px-4 py-2 rounded-md text-[10px] uppercase tracking-widest font-bold hover:bg-white hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all whitespace-nowrap">
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-6 rounded-sm mb-8">
              <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit Booking' : 'New Booking'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Client Name</label>
                  <input type="text" required value={formData.user} onChange={e => setFormData({...formData, user: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] outline-none" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Motorcycle</label>
                  <input type="text" required value={formData.bike} onChange={e => setFormData({...formData, bike: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] outline-none" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Total Price (Rp)</label>
                  <input type="number" required value={formData.total} onChange={e => setFormData({...formData, total: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] outline-none" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Start Date</label>
                  <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] outline-none" style={{ colorScheme: 'dark' }} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">End Date</label>
                  <input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] outline-none" style={{ colorScheme: 'dark' }} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Status</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] outline-none">
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={resetForm} className="px-4 py-2 border border-white/10 rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-white/5">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#D4AF37] text-black rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-white flex items-center gap-2">
                  <Save size={14} /> {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold">Booking ID</th>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold">Client</th>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold">Motorcycle</th>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold">Dates</th>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold">Total</th>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold">Status</th>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredBookings.map(booking => (
                <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-xs text-[#D4AF37]">{booking.id}</td>
                  <td className="p-4 font-bold">{booking.user}</td>
                  <td className="p-4">{booking.bike}</td>
                  <td className="p-4 text-white/70">{booking.startDate} <span className="mx-1 text-white/30">→</span> {booking.endDate}</td>
                  <td className="p-4 font-medium">Rp {booking.total?.toLocaleString('id-ID')}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold ${
                      booking.status === 'Confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30 rounded-full' : 
                      booking.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full' : 
                      booking.status === 'Completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full' :
                      'bg-white/10 text-white/60 border border-white/20 rounded-full'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleEdit(booking)} className="text-white/40 hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-sm">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(booking.id)} className="text-white/40 hover:text-red-500 transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-sm">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-white/40">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-[#D4AF37]" />
                      <span>Loading bookings...</span>
                    </div>
                  ) : (
                    'No bookings found.'
                  )}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
