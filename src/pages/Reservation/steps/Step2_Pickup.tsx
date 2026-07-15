import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, Home, Hotel, Plane, CheckCircle2,
  MapPin, Clock, Navigation, FileText,
} from 'lucide-react';
import { ReservationState, MetodePenjemputan } from '../types';

// ─── Tipe Opsi Penjemputan ────────────────────────────────────────────────────
interface OpsiPenjemputan {
  id: MetodePenjemputan;
  label: string;
  deskripsi: string;
  ikon: React.ElementType;
  biaya: number;
  gratisUntuk: string[];
  estimasi: string;
}

// ─── Data Opsi ────────────────────────────────────────────────────────────────
const OPSI_PENJEMPUTAN: OpsiPenjemputan[] = [
  {
    id: 'showroom',
    label: 'Ambil di Showroom',
    deskripsi: 'Jl. Bypass Ngurah Rai No. 88, Kuta, Bali',
    ikon: Building2,
    biaya: 0,
    gratisUntuk: [],
    estimasi: 'Langsung tersedia saat Anda tiba',
  },
  {
    id: 'rumah',
    label: 'Antar ke Rumah',
    deskripsi: 'Motor diantar langsung ke alamat Anda',
    ikon: Home,
    biaya: 100000,
    gratisUntuk: ['gold', 'elite'],
    estimasi: '1–2 jam (area Kuta/Seminyak) · 2–3 jam (area lainnya)',
  },
  {
    id: 'hotel',
    label: 'Antar ke Hotel',
    deskripsi: 'Pengiriman ke lobi atau area parkir hotel Anda',
    ikon: Hotel,
    biaya: 150000,
    gratisUntuk: ['gold', 'elite'],
    estimasi: '1–2 jam (Kuta/Seminyak) · 2–3 jam (lainnya)',
  },
  {
    id: 'bandara',
    label: 'Antar ke Bandara',
    deskripsi: 'Pengiriman ke Bandara Ngurah Rai, Bali',
    ikon: Plane,
    biaya: 200000,
    gratisUntuk: ['gold', 'elite'],
    estimasi: '1–2 jam dari waktu pemesanan',
  },
];

// ─── Helper Format Rupiah ─────────────────────────────────────────────────────
function formatRupiah(angka: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Step2Props {
  state: ReservationState;
  onUpdate: (updates: Partial<ReservationState>) => void;
  userTier: string;
  onNext: () => void;
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function Step2_Pickup({ state, onUpdate, userTier, onNext }: Step2Props) {
  const [metodeDipilih, setMetodeDipilih] = useState<MetodePenjemputan>(
    state.infoPenjemputan.metode
  );

  const opsiTerpilih = OPSI_PENJEMPUTAN.find(o => o.id === metodeDipilih)!;
  const tierGratis = opsiTerpilih.gratisUntuk.includes(userTier);
  const biayaEfektif = tierGratis ? 0 : opsiTerpilih.biaya;
  const butuhAlamat = metodeDipilih !== 'showroom';

  const handlePilihMetode = (metode: MetodePenjemputan) => {
    setMetodeDipilih(metode);
    const opsi = OPSI_PENJEMPUTAN.find(o => o.id === metode)!;
    const gratis = opsi.gratisUntuk.includes(userTier);
    onUpdate({
      infoPenjemputan: {
        ...state.infoPenjemputan,
        metode,
        biayaAntar: gratis ? 0 : opsi.biaya,
        estimasiWaktu: opsi.estimasi,
        alamat: metode === 'showroom' ? '' : state.infoPenjemputan.alamat,
        kota: metode === 'showroom' ? '' : state.infoPenjemputan.kota,
        catatan: metode === 'showroom' ? '' : state.infoPenjemputan.catatan,
      },
    });
  };

  const handleUpdateInfo = (field: 'alamat' | 'kota' | 'catatan', nilai: string) => {
    onUpdate({
      infoPenjemputan: {
        ...state.infoPenjemputan,
        [field]: nilai,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* ─── Judul ─────────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Pilih Metode Penjemputan</h3>
        <p className="text-sm text-white/50">
          Tentukan bagaimana Anda ingin mendapatkan motor Anda
        </p>
      </div>

      {/* ─── Grid Kartu Opsi ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OPSI_PENJEMPUTAN.map(opsi => {
          const Ikon = opsi.ikon;
          const dipilih = metodeDipilih === opsi.id;
          const gratis = opsi.gratisUntuk.includes(userTier);
          const isGratisDitampilkan = gratis && opsi.biaya > 0;

          return (
            <motion.button
              key={opsi.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePilihMetode(opsi.id)}
              className="relative text-left rounded-2xl p-4 transition-all"
              style={{
                background: dipilih ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
                border: dipilih
                  ? '1.5px solid #D4AF37'
                  : '1.5px solid rgba(255,255,255,0.08)',
                boxShadow: dipilih ? '0 0 20px rgba(212,175,55,0.12)' : 'none',
              }}
            >
              {/* Badge Terpilih */}
              <AnimatePresence>
                {dipilih && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: '#D4AF37', color: '#050505' }}
                  >
                    <CheckCircle2 size={10} />
                    Terpilih
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Badge GRATIS untuk tier */}
              {isGratisDitampilkan && (
                <div
                  className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}
                >
                  ✦ GRATIS untuk Anggota Anda
                </div>
              )}

              <div className={`flex items-start gap-3 ${isGratisDitampilkan ? 'mt-7' : 'mt-1'}`}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: dipilih ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.06)' }}
                >
                  <Ikon size={20} style={{ color: dipilih ? '#D4AF37' : 'rgba(255,255,255,0.5)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-white text-sm">{opsi.label}</span>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{opsi.deskripsi}</p>
                  <div className="mt-2">
                    {opsi.biaya === 0 ? (
                      <span className="text-xs font-semibold text-emerald-400">Gratis</span>
                    ) : isGratisDitampilkan ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/30 line-through">{formatRupiah(opsi.biaya)}</span>
                        <span className="text-xs font-semibold text-emerald-400">Gratis</span>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold" style={{ color: '#D4AF37' }}>
                        {formatRupiah(opsi.biaya)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ─── Detail Metode Terpilih ────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {metodeDipilih === 'showroom' ? (
          <motion.div
            key="showroom-info"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl p-5 space-y-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.15)' }}>
                <Building2 size={20} style={{ color: '#D4AF37' }} />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Bali BikeHouse — Showroom Utama</p>
                <p className="text-xs text-white/50">Jl. Bypass Ngurah Rai No. 88, Kuta, Bali 80361</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <Clock size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
                <div>
                  <p className="text-xs font-medium text-white/80">Jam Operasional</p>
                  <p className="text-xs text-white/50">08:00 – 20:00 WIB</p>
                  <p className="text-xs text-white/40">Setiap hari, termasuk hari libur</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Navigation size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
                <div>
                  <p className="text-xs font-medium text-white/80">Akses</p>
                  <p className="text-xs text-white/50">5 menit dari Bandara</p>
                  <p className="text-xs text-white/40">Parkir tersedia</p>
                </div>
              </div>
            </div>

            {/* Peta Statis Placeholder */}
            <div
              className="relative rounded-xl overflow-hidden h-32"
              style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
            >
              {/* Grid garis peta */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: 'linear-gradient(rgba(212,175,55,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.06) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />
              {/* Jalan horizontal */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2" style={{ background: 'rgba(212,175,55,0.25)' }} />
              <div className="absolute top-1/3 left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="absolute top-2/3 left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              {/* Jalan vertikal */}
              <div className="absolute left-1/3 top-0 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="absolute left-2/3 top-0 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

              {/* Pin Lokasi */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: '#D4AF37' }}
                >
                  <MapPin size={16} className="text-black" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#D4AF37' }} />
              </div>

              {/* Label */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(0,0,0,0.6)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
                Bali BikeHouse — Showroom
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="delivery-form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl p-5 space-y-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Info Estimasi Waktu */}
            <div
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <Clock size={16} style={{ color: '#D4AF37' }} />
              <div>
                <p className="text-xs font-semibold text-white/80">Estimasi Waktu Tiba</p>
                <p className="text-xs text-white/50">{opsiTerpilih.estimasi}</p>
              </div>
            </div>

            {/* Peta Statis Pengantaran */}
            <div
              className="relative rounded-xl overflow-hidden h-28"
              style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)' }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              {/* Jalan-jalan */}
              {[1/4, 1/2, 3/4].map((pos, i) => (
                <div key={i} className="absolute left-0 right-0 h-px" style={{ top: `${pos * 100}%`, background: 'rgba(255,255,255,0.1)' }} />
              ))}
              {[1/3, 2/3].map((pos, i) => (
                <div key={i} className="absolute top-0 bottom-0 w-px" style={{ left: `${pos * 100}%`, background: 'rgba(255,255,255,0.1)' }} />
              ))}

              {/* Pin Pengantaran */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#D4AF37' }}>
                  <Navigation size={14} className="text-black" />
                </div>
                <div className="w-1 h-1 rounded-full" style={{ background: '#D4AF37' }} />
              </div>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(0,0,0,0.6)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
                Area Pengantaran: Bali Selatan
              </div>
            </div>

            {/* Form Alamat */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-white/70">
                  <MapPin size={13} style={{ color: '#D4AF37' }} />
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Legian No. 45, Gang Melati, No. 3"
                  value={state.infoPenjemputan.alamat}
                  onChange={e => handleUpdateInfo('alamat', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
                  style={{
                    background: '#0A0A0F',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-white/70">
                  <Navigation size={13} style={{ color: '#D4AF37' }} />
                  Kota / Area
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kuta, Seminyak, Ubud"
                  value={state.infoPenjemputan.kota}
                  onChange={e => handleUpdateInfo('kota', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
                  style={{
                    background: '#0A0A0F',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-white/70">
                  <FileText size={13} style={{ color: '#D4AF37' }} />
                  Catatan Tambahan
                  <span className="text-white/30 font-normal">(opsional)</span>
                </label>
                <textarea
                  placeholder="Contoh: Titipkan di resepsionis hotel, hubungi saya terlebih dahulu..."
                  value={state.infoPenjemputan.catatan}
                  onChange={e => handleUpdateInfo('catatan', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all resize-none"
                  style={{
                    background: '#0A0A0F',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
            </div>

            {/* Biaya Pengiriman */}
            <div
              className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-sm text-white/70">Biaya Pengiriman</span>
              {biayaEfektif === 0 ? (
                <div className="flex items-center gap-2">
                  {opsiTerpilih.biaya > 0 && (
                    <span className="text-xs text-white/30 line-through">{formatRupiah(opsiTerpilih.biaya)}</span>
                  )}
                  <span className="text-sm font-semibold text-emerald-400">Gratis</span>
                </div>
              ) : (
                <span className="text-sm font-semibold" style={{ color: '#D4AF37' }}>{formatRupiah(biayaEfektif)}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Tombol Lanjut ─────────────────────────────────────────────── */}
      <div className="flex justify-end pt-6 border-t border-white/10 mt-8">
        <button
          onClick={onNext}
          disabled={state.infoPenjemputan.metode !== 'showroom' && (!state.infoPenjemputan.alamat || !state.infoPenjemputan.kota)}
          className="px-8 py-3 bg-[#D4AF37] text-black font-bold rounded-sm text-sm uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Lanjutkan
        </button>
      </div>
    </div>
  );
}
