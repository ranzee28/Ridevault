import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Clock, Users, AlertTriangle, Calendar, Tag } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { ReservationState } from '../types';
import { Bike } from '../../../contexts/BikeContext';
import { TIER_CONFIG } from '../../Profile/constants';

// ─── Konstanta Waktu ─────────────────────────────────────────────────────────
const JAM_TERSEDIA = Array.from({ length: 15 }, (_, i) => {
  const jam = i + 6;
  return `${String(jam).padStart(2, '0')}:00`;
});

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const NAMA_HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// ─── Helper ──────────────────────────────────────────────────────────────────
function formatRupiah(angka: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isDateInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  return date > start && date < end;
}

function normalizeDate(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// ─── Props ───────────────────────────────────────────────────────────────────
export interface Step1Props {
  state: ReservationState;
  onUpdate: (updates: Partial<ReservationState>) => void;
  bike: Bike;
  onNext: () => void;
}

// ─── Tanggal Terblokir dari Booking ──────────────────────────────────────────
function getTanggalTerblokir(bookings: { start_date: string; end_date: string }[]): Date[] {
  const tanggal: Date[] = [];
  for (const b of bookings) {
    const mulai = new Date(b.start_date);
    const selesai = new Date(b.end_date);
    let current = normalizeDate(mulai);
    while (current <= normalizeDate(selesai)) {
      tanggal.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  }
  return tanggal;
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function Step1_Schedule({ state, onUpdate, bike, onNext }: Step1Props) {
  const today = normalizeDate(new Date());

  const [tampilBulan, setTampilBulan] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [tanggalTerblokir, setTanggalTerblokir] = useState<Date[]>([]);
  const [jumlahPemesanBulanIni, setJumlahPemesanBulanIni] = useState<number>(12);
  const [slotTersisaMingguIni, setSlotTersisaMingguIni] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Tahap seleksi: 'mulai' | 'selesai'
  const [tahapSeleksi, setTahapSeleksi] = useState<'mulai' | 'selesai'>(
    state.tanggalMulai ? 'selesai' : 'mulai'
  );

  // ── Fetch Data Booking dari Supabase ────────────────────────────────────────
  const fetchDataBooking = useCallback(async () => {
    setLoadingData(true);
    try {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('start_date, end_date')
        .eq('bike_id', bike.id)
        .neq('status', 'dibatalkan');

      if (bookings) {
        setTanggalTerblokir(getTanggalTerblokir(bookings));
      }

      // Hitung jumlah pemesanan bulan ini
      const awalBulan = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const akhirBulan = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('bike_id', bike.id)
        .gte('start_date', awalBulan)
        .lte('start_date', akhirBulan);

      setJumlahPemesanBulanIni(count ?? 12);

      // Hitung slot tersisa minggu ini
      const akhirMinggu = new Date(today);
      akhirMinggu.setDate(today.getDate() + (6 - today.getDay()));

      let hariTersedia = 0;
      let cursor = new Date(today);
      while (cursor <= akhirMinggu) {
        const norm = normalizeDate(cursor);
        const terblokir = (bookings ?? []).some(b => {
          const mulai = normalizeDate(new Date(b.start_date));
          const selesai = normalizeDate(new Date(b.end_date));
          return norm >= mulai && norm <= selesai;
        });
        if (!terblokir) hariTersedia++;
        cursor.setDate(cursor.getDate() + 1);
      }

      setSlotTersisaMingguIni(hariTersedia <= 3 ? hariTersedia : null);
    } catch (err) {
      console.error('Gagal memuat data booking:', err);
    } finally {
      setLoadingData(false);
    }
  }, [bike.id]);

  useEffect(() => {
    fetchDataBooking();
  }, [fetchDataBooking]);

  // ── Kalkulasi Harga ─────────────────────────────────────────────────────────
  const hariSewa = (() => {
    if (!state.tanggalMulai || !state.tanggalSelesai) return 0;
    const selisih = normalizeDate(state.tanggalSelesai).getTime() - normalizeDate(state.tanggalMulai).getTime();
    return Math.max(1, Math.ceil(selisih / (1000 * 60 * 60 * 24)) + 1);
  })();

  const hargaTotal = bike.price * hariSewa;
  const tier = (state as any)._userTier as keyof typeof TIER_CONFIG | undefined;
  const tierKey = tier && TIER_CONFIG[tier] ? tier : 'default';
  const persenDiskon = parseFloat(TIER_CONFIG[tierKey].discount) / 100;
  const nominalDiskon = Math.round(hargaTotal * persenDiskon);
  const estimasiTotal = hargaTotal - nominalDiskon;

  // ── Generate Sel Kalender ───────────────────────────────────────────────────
  const generateSelKalender = () => {
    const tahun = tampilBulan.getFullYear();
    const bulan = tampilBulan.getMonth();
    const hariPertama = new Date(tahun, bulan, 1).getDay();
    const totalHari = new Date(tahun, bulan + 1, 0).getDate();

    const sel: (Date | null)[] = [];
    for (let i = 0; i < hariPertama; i++) sel.push(null);
    for (let d = 1; d <= totalHari; d++) sel.push(new Date(tahun, bulan, d));
    return sel;
  };

  // ── Handler Klik Tanggal ────────────────────────────────────────────────────
  const handleKlikTanggal = (tanggal: Date) => {
    const norm = normalizeDate(tanggal);

    // Cek apakah tanggal terblokir
    const terblokir = tanggalTerblokir.some(t => isSameDay(t, norm));
    if (terblokir || norm < today) return;

    if (tahapSeleksi === 'mulai') {
      const diskon = Math.round(bike.price * persenDiskon);
      onUpdate({
        tanggalMulai: norm,
        tanggalSelesai: norm, // default to 1 day sewa
        hariSewa: 1,
        hargaPerHari: bike.price,
        diskonTier: diskon,
        persenDiskonTier: persenDiskon * 100,
        totalAkhir: bike.price - diskon,
      });
      setTahapSeleksi('selesai');
    } else {
      if (norm < (state.tanggalMulai ? normalizeDate(state.tanggalMulai) : today)) {
        // Reset dan set sebagai tanggal mulai baru
        const diskon = Math.round(bike.price * persenDiskon);
        onUpdate({
          tanggalMulai: norm,
          tanggalSelesai: norm, // default to 1 day sewa
          hariSewa: 1,
          hargaPerHari: bike.price,
          diskonTier: diskon,
          persenDiskonTier: persenDiskon * 100,
          totalAkhir: bike.price - diskon,
        });
        setTahapSeleksi('selesai');
        return;
      }
      // Cek apakah ada tanggal terblokir dalam range
      const adaTerblokirDalamRange = tanggalTerblokir.some(t => {
        const tn = normalizeDate(t);
        return tn > normalizeDate(state.tanggalMulai!) && tn < norm;
      });
      if (adaTerblokirDalamRange) return;

      const hari = Math.max(1, Math.ceil((norm.getTime() - normalizeDate(state.tanggalMulai!).getTime()) / (1000 * 60 * 60 * 24)) + 1);
      const total = bike.price * hari;
      const diskon = Math.round(total * persenDiskon);
      onUpdate({
        tanggalSelesai: norm,
        hariSewa: hari,
        hargaPerHari: bike.price,
        diskonTier: diskon,
        persenDiskonTier: persenDiskon * 100,
        totalAkhir: total - diskon,
      });
      setTahapSeleksi('mulai');
    }
  };

  // ── Status Sel Tanggal ──────────────────────────────────────────────────────
  const getStatusSel = (tanggal: Date) => {
    const norm = normalizeDate(tanggal);
    const terblokir = tanggalTerblokir.some(t => isSameDay(t, norm));
    const lampau = norm < today;
    const adalahHariIni = isSameDay(norm, today);
    const adalahMulai = state.tanggalMulai && isSameDay(norm, state.tanggalMulai);
    const adalahSelesai = state.tanggalSelesai && isSameDay(norm, state.tanggalSelesai);
    const dalamRange = isDateInRange(norm, state.tanggalMulai, state.tanggalSelesai);

    return { terblokir, lampau, adalahHariIni, adalahMulai, adalahSelesai, dalamRange };
  };

  const selKalender = generateSelKalender();

  return (
    <div className="space-y-6">
      {/* ─── Badge Psikologis ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
          style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}
        >
          <Users size={14} />
          <span>
            {loadingData ? '...' : jumlahPemesanBulanIni} anggota memesan motor ini bulan ini
          </span>
        </motion.div>

        <AnimatePresence>
          {slotTersisaMingguIni !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-900/40 border border-red-500/40 text-red-300"
            >
              <AlertTriangle size={14} />
              <span>Hanya tersisa {slotTersisaMingguIni} hari tersedia minggu ini!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Kalender ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: '#0A0A0F', border: '1px solid rgba(212,175,55,0.15)' }}
      >
        {/* Header Navigasi Bulan */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <button
            onClick={() => setTampilBulan(new Date(tampilBulan.getFullYear(), tampilBulan.getMonth() - 1, 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 text-white/60 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-semibold text-white tracking-wide">
            {NAMA_BULAN[tampilBulan.getMonth()]} {tampilBulan.getFullYear()}
          </span>
          <button
            onClick={() => setTampilBulan(new Date(tampilBulan.getFullYear(), tampilBulan.getMonth() + 1, 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 text-white/60 hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Nama Hari */}
        <div className="grid grid-cols-7 border-b border-white/5">
          {NAMA_HARI.map(h => (
            <div key={h} className="py-2 text-center text-xs font-medium text-white/40 uppercase tracking-wider">
              {h}
            </div>
          ))}
        </div>

        {/* Sel Tanggal */}
        <div className="grid grid-cols-7 gap-px p-1">
          {selKalender.map((tanggal, idx) => {
            if (!tanggal) return <div key={`kosong-${idx}`} className="aspect-square" />;

            const { terblokir, lampau, adalahHariIni, adalahMulai, adalahSelesai, dalamRange } = getStatusSel(tanggal);
            const disabled = terblokir || lampau;

            let bgClass = 'hover:bg-white/5';
            let textClass = 'text-white/80';
            let borderStyle: React.CSSProperties = {};
            let extraClass = '';

            if (disabled) {
              textClass = 'text-white/15 cursor-not-allowed';
              bgClass = '';
              if (terblokir) extraClass = 'line-through';
            } else if (adalahMulai || adalahSelesai) {
              bgClass = '';
              borderStyle = { background: '#D4AF37' };
              textClass = 'text-black font-bold';
            } else if (dalamRange) {
              borderStyle = { background: 'rgba(212,175,55,0.18)' };
              textClass = 'text-[#D4AF37]';
            }

            if (adalahHariIni && !adalahMulai && !adalahSelesai) {
              borderStyle = { ...borderStyle, boxShadow: 'inset 0 0 0 1.5px #D4AF37' };
            }

            return (
              <motion.button
                key={tanggal.toISOString()}
                whileHover={!disabled ? { scale: 1.08 } : {}}
                whileTap={!disabled ? { scale: 0.95 } : {}}
                onClick={() => !disabled && handleKlikTanggal(tanggal)}
                disabled={disabled}
                style={borderStyle}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-colors relative select-none ${bgClass} ${textClass} ${extraClass}`}
              >
                {tanggal.getDate()}
                {terblokir && !lampau && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-500/60" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-5 py-3 border-t border-white/5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <div className="w-3 h-3 rounded-sm bg-[#D4AF37]" /> Tanggal dipilih
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(212,175,55,0.18)' }} /> Durasi sewa
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <div className="w-3 h-3 rounded-sm border border-[#D4AF37]" /> Hari ini
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <div className="w-3 h-3 rounded-sm bg-white/10" style={{ color: 'rgba(255,255,255,0.15)' }}>
              <span className="block text-center text-[8px] leading-3 line-through text-white/20">X</span>
            </div>
            Tidak tersedia
          </div>
        </div>
      </motion.div>

      {/* ─── Instruksi Seleksi ────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tahapSeleksi}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          <Calendar size={16} style={{ color: '#D4AF37' }} />
          <span className="text-sm text-white/70">
            {tahapSeleksi === 'mulai'
              ? '👆 Klik untuk memilih tanggal mulai sewa'
              : '👆 Klik untuk memilih tanggal selesai sewa'}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* ─── Selector Waktu ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-white/70">
            <Clock size={14} style={{ color: '#D4AF37' }} />
            Jam Penjemputan
          </label>
          <select
            value={state.jamMulai}
            onChange={e => onUpdate({ jamMulai: e.target.value })}
            className="w-full rounded-xl px-4 py-3 text-sm text-white appearance-none outline-none transition-all cursor-pointer"
            style={{
              background: '#0A0A0F',
              border: '1px solid rgba(212,175,55,0.2)',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23D4AF37' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px',
            }}
          >
            {JAM_TERSEDIA.map(j => (
              <option key={j} value={j} style={{ background: '#0A0A0F' }}>{j} WIB</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-white/70">
            <Clock size={14} style={{ color: '#D4AF37' }} />
            Jam Pengembalian
          </label>
          <select
            value={state.jamSelesai}
            onChange={e => onUpdate({ jamSelesai: e.target.value })}
            className="w-full rounded-xl px-4 py-3 text-sm text-white appearance-none outline-none transition-all cursor-pointer"
            style={{
              background: '#0A0A0F',
              border: '1px solid rgba(212,175,55,0.2)',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23D4AF37' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px',
            }}
          >
            {JAM_TERSEDIA.map(j => (
              <option key={j} value={j} style={{ background: '#0A0A0F' }}>{j} WIB</option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Kalkulasi Harga ──────────────────────────────────────────── */}
      <AnimatePresence>
        {hariSewa > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-2xl p-5 space-y-3"
            style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Tag size={16} style={{ color: '#D4AF37' }} />
              <span className="font-semibold text-white">Estimasi Biaya</span>
            </div>

            {/* Durasi */}
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Durasi Sewa</span>
              <span className="text-white font-medium">{hariSewa} hari</span>
            </div>

            {/* Harga Dasar */}
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Harga Dasar</span>
              <span className="text-white">
                {formatRupiah(bike.price)} × {hariSewa} hari
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60" />
              <span className="text-white font-medium">{formatRupiah(hargaTotal)}</span>
            </div>

            {/* Diskon Tier */}
            {nominalDiskon > 0 && (
              <div className="flex justify-between text-sm">
                <span style={{ color: '#D4AF37' }}>
                  Diskon {TIER_CONFIG[tierKey].label} ({TIER_CONFIG[tierKey].discount})
                </span>
                <span style={{ color: '#D4AF37' }}>-{formatRupiah(nominalDiskon)}</span>
              </div>
            )}

            <div className="border-t border-white/10 pt-3 flex justify-between">
              <span className="text-white/80 font-semibold">Estimasi Total</span>
              <span className="font-bold text-lg" style={{ color: '#D4AF37' }}>
                {formatRupiah(estimasiTotal)}
              </span>
            </div>

            <p className="text-xs text-white/30">* Belum termasuk add-on dan pajak. Total final di langkah Ringkasan.</p>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ─── Tombol Lanjut ─────────────────────────────────────────────── */}
      <div className="flex justify-end mt-8">
        <button
          onClick={onNext}
          disabled={!state.tanggalMulai || !state.tanggalSelesai}
          className="px-8 py-3 bg-[#D4AF37] text-black font-bold rounded-sm text-sm uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Lanjutkan
        </button>
      </div>
    </div>
  );
}
