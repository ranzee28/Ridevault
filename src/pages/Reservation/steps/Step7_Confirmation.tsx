import { motion } from 'motion/react';
import { Check, Calendar, Download, Eye, Bike, QrCode } from 'lucide-react';
import type { BookingResult, ReservationState } from '../types';
import type { Bike as BikeType } from '../../../contexts/BikeContext';

interface Step7Props {
  bookingResult: BookingResult;
  bike: BikeType;
  state: ReservationState;
  onViewReservation: () => void;
  onBrowseMore: () => void;
}

export default function Step7_Confirmation({ bookingResult, bike, state, onViewReservation, onBrowseMore }: Step7Props) {
  const { bookingId, qrData, pickupPin } = bookingResult;
  const { tanggalMulai, tanggalSelesai, infoPenjemputan, totalAkhir } = state;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8 text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="w-24 h-24 mx-auto rounded-full bg-[#D4AF37]/20 flex items-center justify-center relative"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-full border border-[#D4AF37]"
        />
        <Check size={48} className="text-[#D4AF37]" />
      </motion.div>

      <div>
        <h2 className="text-3xl font-bold text-white uppercase tracking-tight mb-2">Reservasi Berhasil</h2>
        <p className="text-white/60">Motor {bike.brand} {bike.model} telah berhasil diamankan untuk Anda.</p>
      </div>

      <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 text-left">
        <div className="flex justify-between items-center pb-6 border-b border-white/5">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">ID Reservasi</p>
            <p className="text-2xl font-mono text-white font-bold">{bookingId}</p>
          </div>
          <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] uppercase font-bold rounded-sm border border-[#D4AF37]/20">
            Menunggu Konfirmasi
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Jadwal Sewa</p>
              <p className="text-sm text-white font-medium">
                {tanggalMulai?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} - {tanggalSelesai?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Penjemputan</p>
              <p className="text-sm text-white font-medium capitalize">{infoPenjemputan.metode.replace('_', ' ')}</p>
              {infoPenjemputan.alamat && <p className="text-xs text-white/60 mt-1">{infoPenjemputan.alamat}</p>}
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Total Dibayar</p>
              <p className="text-lg text-[#D4AF37] font-bold">Rp {totalAkhir.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="w-32 h-32 bg-white flex items-center justify-center p-2 rounded-lg mb-3">
              <QrCode size={112} className="text-black" />
            </div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">PIN Penjemputan</p>
            <div className="flex gap-1">
              {pickupPin.split('').map((digit, i) => (
                <div key={i} className="w-6 h-8 bg-black border border-[#D4AF37]/30 flex items-center justify-center text-white font-mono font-bold rounded-sm">
                  {digit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0A0A0F] border border-white/10 text-white text-sm uppercase tracking-widest font-bold rounded-sm hover:bg-white/5 transition-colors">
          <Download size={16} /> Unduh Faktur
        </button>
        <button onClick={() => window.open('https://calendar.google.com', '_blank')} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0A0A0F] border border-white/10 text-white text-sm uppercase tracking-widest font-bold rounded-sm hover:bg-white/5 transition-colors">
          <Calendar size={16} /> Tambah ke Kalender
        </button>
        <button onClick={onViewReservation} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#D4AF37] text-black text-sm uppercase tracking-widest font-bold rounded-sm hover:bg-white transition-colors">
          <Eye size={16} /> Lihat Dasbor
        </button>
        <button onClick={onBrowseMore} className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black text-sm uppercase tracking-widest font-bold rounded-sm hover:bg-white/90 transition-colors">
          <Bike size={16} /> Eksplor Lagi
        </button>
      </div>
      
      <p className="text-xs text-white/40 font-light mt-8">Tim concierge kami akan menghubungi Anda via WhatsApp dalam 15 menit untuk konfirmasi.</p>
    </div>
  );
}
