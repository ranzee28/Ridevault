import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, MessageCircle, X, Download, AlertCircle, Edit2, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Bike as BikeType } from '../../../contexts/BikeContext';

interface Step8Props {
  bookingId: string;
  bike: BikeType;
  onClose: () => void;
}

export default function Step8_ActiveDashboard({ bookingId, bike, onClose }: Step8Props) {
  const [booking, setBooking] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchBooking = async () => {
      const { data } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
      if (data) setBooking(data);
    };
    fetchBooking();

    // Subscribe to changes
    const sub = supabase.channel(`booking-${bookingId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${bookingId}` }, (payload) => {
        setBooking(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [bookingId]);

  useEffect(() => {
    if (!booking?.start_date) return;
    const target = new Date(`${booking.start_date}T${booking.pickup_time || '08:00'}:00`).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [booking?.start_date, booking?.pickup_time]);

  if (!booking) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleCancel = async () => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan reservasi ini?')) {
      await supabase.from('bookings').update({ status: 'Cancelled' }).eq('id', bookingId);
      onClose();
    }
  };

  const statusMap: Record<string, number> = {
    'Pending': 1,
    'Confirmed': 2,
    'Preparing': 3,
    'Ready': 4,
    'Active': 5,
    'Scheduled Return': 6,
    'Completed': 7,
    'Cancelled': 0
  };

  const currentStep = statusMap[booking.status] || 1;

  const timeline = [
    'Dikonfirmasi',
    'Pembayaran',
    'Disiapkan',
    'Siap Ambil',
    'Aktif',
    'Pengembalian',
    'Selesai'
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-20 pb-24 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Dasbor Reservasi</h1>
          <p className="text-white/50 text-sm mt-1">Kelola dan pantau status penyewaan Anda</p>
        </div>
        <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-6">Status Perjalanan</h3>
            
            <div className="relative">
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-white/5" />
              <div 
                className="absolute top-4 left-4 h-0.5 bg-[#D4AF37] transition-all duration-1000"
                style={{ width: `${Math.min(100, Math.max(0, ((currentStep - 1) / (timeline.length - 1)) * 100))}%` }}
              />
              
              <div className="relative flex justify-between">
                {timeline.map((step, idx) => {
                  const isActive = currentStep === idx + 1;
                  const isPast = currentStep > idx + 1;
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 z-10 transition-colors ${
                        isActive ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' :
                        isPast ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50' :
                        'bg-[#050505] border border-white/10 text-white/30'
                      }`}>
                        {isPast ? <Check size={14} /> : <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-black' : 'bg-white/20'}`} />}
                      </div>
                      <span className={`text-[10px] uppercase font-bold text-center w-16 hidden md:block ${
                        isActive ? 'text-[#D4AF37]' : isPast ? 'text-white/70' : 'text-white/30'
                      }`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Countdown & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-5 text-[#D4AF37]">
                <Clock size={150} />
              </div>
              <h3 className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest mb-4">Hitung Mundur Penjemputan</h3>
              <div className="flex gap-4">
                {[
                  { label: 'Hari', value: timeLeft.days },
                  { label: 'Jam', value: timeLeft.hours },
                  { label: 'Mnt', value: timeLeft.minutes },
                  { label: 'Dtk', value: timeLeft.seconds }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-3xl font-mono font-bold text-white mb-1">{item.value.toString().padStart(2, '0')}</span>
                    <span className="text-[9px] uppercase tracking-wider text-white/50">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl p-6">
              <h3 className="text-xs text-white/50 font-bold uppercase tracking-widest mb-4">Info Penjemputan</h3>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 text-white flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white capitalize">{booking.pickup_method?.replace('_', ' ') || 'Showroom'}</p>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">
                    {booking.pickup_address || 'Bali BikeHouse, Jl. Bypass Ngurah Rai No. 88, Kuta'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center">
            <img src={bike.image?.startsWith('src/') ? '/' + bike.image : bike.image} alt={bike.model} className="w-48 h-32 object-contain mb-4" />
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">{bike.brand} {bike.model}</h3>
            <p className="text-xs text-white/50">{booking.id}</p>
          </div>

          <button onClick={() => window.open('https://wa.me/6281234567890', '_blank')} className="w-full flex items-center justify-between p-4 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] rounded-xl hover:bg-[#25D366]/20 transition-colors">
            <span className="text-sm font-bold uppercase tracking-widest">Chat Dukungan</span>
            <MessageCircle size={18} />
          </button>

          <button onClick={() => alert('Faktur sedang disiapkan...')} className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors">
            <span className="text-sm font-bold uppercase tracking-widest">Unduh Faktur</span>
            <Download size={18} />
          </button>

          <button onClick={() => alert('Hubungi concierge kami untuk modifikasi reservasi.')} className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors">
            <span className="text-sm font-bold uppercase tracking-widest">Modifikasi</span>
            <Edit2 size={18} />
          </button>

          {currentStep < 5 && currentStep > 0 && (
            <button onClick={handleCancel} className="w-full flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors">
              <span className="text-sm font-bold uppercase tracking-widest">Batalkan</span>
              <AlertCircle size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
