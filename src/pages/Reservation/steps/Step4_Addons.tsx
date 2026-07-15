import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, MapPin, Zap, Headphones, ShieldCheck,
  Check, ChevronUp, Info,
} from 'lucide-react';
import { ReservationState } from '../types';

// ─── Data Add-on ─────────────────────────────────────────────────────────────
interface AddOnData {
  id: string;
  nama: string;
  deskripsi: string;
  ikon: React.ElementType;
  harga: number;
  satuan: 'hari' | 'trip';
  gambar: string;
  isFreeForTier: string[];
  diskonForTier: { tier: string; persen: number }[];
}

const DATA_ADDON: AddOnData[] = [
  {
    id: 'riding-gear',
    nama: 'Perlengkapan Riding Premium',
    deskripsi: 'Helm full-face, jaket kulit, sarung tangan, dan pelindung lutut premium tersertifikasi',
    ikon: Shield,
    harga: 150000,
    satuan: 'hari',
    gambar: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=80',
    isFreeForTier: ['gold', 'elite'],
    diskonForTier: [],
  },
  {
    id: 'guided-tour',
    nama: 'Tur Terpandu Jalur Premium',
    deskripsi: 'Dipimpin pemandu berpengalaman melalui jalur terbaik Bali — pantai selatan hingga pegunungan Kintamani',
    ikon: MapPin,
    harga: 500000,
    satuan: 'hari',
    gambar: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format&fit=crop&q=80',
    isFreeForTier: [],
    diskonForTier: [{ tier: 'elite', persen: 20 }],
  },
  {
    id: 'butler-delivery',
    nama: 'Pengiriman Pramutamu',
    deskripsi: 'Layanan concierge eksklusif — pengemudi profesional mengantarkan motor ke titik Anda',
    ikon: Zap,
    harga: 250000,
    satuan: 'trip',
    gambar: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&auto=format&fit=crop&q=80',
    isFreeForTier: ['gold', 'elite'],
    diskonForTier: [],
  },
  {
    id: 'emergency-assist',
    nama: 'Asistensi Darurat 24/7',
    deskripsi: 'Tim darurat siaga 24 jam — ban kempes, kehabisan bahan bakar, atau insiden di jalan kami tangani',
    ikon: Headphones,
    harga: 75000,
    satuan: 'hari',
    gambar: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&auto=format&fit=crop&q=80',
    isFreeForTier: ['elite'],
    diskonForTier: [],
  },
  {
    id: 'premium-insurance',
    nama: 'Asuransi Premium',
    deskripsi: 'Perlindungan total: kerusakan, kehilangan, kecelakaan, dan tanggung jawab pihak ketiga',
    ikon: ShieldCheck,
    harga: 100000,
    satuan: 'hari',
    gambar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&auto=format&fit=crop&q=80',
    isFreeForTier: ['silver', 'gold', 'elite'],
    diskonForTier: [],
  },
];

// ─── Helper Format Rupiah ─────────────────────────────────────────────────────
function formatRupiah(angka: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Step4Props {
  state: ReservationState;
  onUpdate: (updates: Partial<ReservationState>) => void;
  userTier: string;
  hariSewa: number;
  onNext: () => void;
}

// ─── Tier Order untuk perbandingan upgrade ───────────────────────────────────
const TIER_ORDER = ['default', 'bronze', 'silver', 'gold', 'elite'];

// ─── Komponen Kartu Add-on ────────────────────────────────────────────────────
interface KartuAddonProps {
  key?: React.Key;
  addon: AddOnData;
  dipilih: boolean;
  userTier: string;
  hariSewa: number;
  onToggle: () => void;
}

function KartuAddon({ addon, dipilih, userTier, hariSewa, onToggle }: KartuAddonProps) {
  const Ikon = addon.ikon;
  const gratis = addon.isFreeForTier.includes(userTier);
  const diskonItem = addon.diskonForTier.find(d => d.tier === userTier);
  const hargaEfektif = gratis ? 0 : diskonItem ? Math.round(addon.harga * (1 - diskonItem.persen / 100)) : addon.harga;
  const totalItem = addon.satuan === 'hari' ? hargaEfektif * hariSewa : hargaEfektif;

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className="relative rounded-2xl overflow-hidden cursor-pointer transition-all"
      style={{
        border: dipilih ? '2px solid #D4AF37' : '2px solid rgba(255,255,255,0.08)',
        boxShadow: dipilih ? '0 0 24px rgba(212,175,55,0.15)' : 'none',
      }}
      onClick={onToggle}
    >
      {/* Gambar Background */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={addon.gambar}
          alt={addon.nama}
          className="w-full h-full object-cover"
          style={{ filter: dipilih ? 'brightness(0.7)' : 'brightness(0.4)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,5,5,0.95) 30%, transparent 100%)' }} />

        {/* Badge Status Tier */}
        <div className="absolute top-3 left-3">
          {gratis ? (
            <span
              className="px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: 'rgba(34,197,94,0.9)', color: '#fff' }}
            >
              ✦ GRATIS untuk Anda
            </span>
          ) : diskonItem ? (
            <span
              className="px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: 'rgba(212,175,55,0.9)', color: '#050505' }}
            >
              Diskon {diskonItem.persen}% Elite
            </span>
          ) : null}
        </div>

        {/* Centang Dipilih */}
        <AnimatePresence>
          {dipilih && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: '#D4AF37' }}
            >
              <Check size={14} className="text-black font-bold" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ikon */}
        <div className="absolute bottom-3 left-4">
          <Ikon size={22} style={{ color: '#D4AF37' }} />
        </div>
      </div>

      {/* Konten */}
      <div className="p-4 space-y-2" style={{ background: '#0A0A0F' }}>
        <h4 className="font-semibold text-white text-sm leading-tight">{addon.nama}</h4>
        <p className="text-xs text-white/50 leading-relaxed">{addon.deskripsi}</p>

        {/* Harga */}
        <div className="flex items-end justify-between pt-1">
          <div>
            {gratis ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/30 line-through">{formatRupiah(addon.harga)}/{addon.satuan}</span>
                <span className="text-sm font-bold text-emerald-400">Gratis</span>
              </div>
            ) : diskonItem ? (
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30 line-through">{formatRupiah(addon.harga)}</span>
                  <span className="text-sm font-bold" style={{ color: '#D4AF37' }}>
                    {formatRupiah(hargaEfektif)}/{addon.satuan}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-sm font-bold" style={{ color: '#D4AF37' }}>
                {formatRupiah(addon.harga)}/{addon.satuan}
              </span>
            )}
          </div>

          {/* Total */}
          {addon.satuan === 'hari' && hariSewa > 1 && (
            <span className="text-xs text-white/40">
              = {formatRupiah(totalItem)} / {hariSewa} hari
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function Step4_Addons({ state, onUpdate, userTier, hariSewa, onNext }: Step4Props) {
  const [tampilKalkulator, setTampilKalkulator] = useState(true);

  const handleToggleAddon = (addonId: string) => {
    const addon = DATA_ADDON.find(a => a.id === addonId)!;
    const gratis = addon.isFreeForTier.includes(userTier);
    const diskonItem = addon.diskonForTier.find(d => d.tier === userTier);
    const hargaEfektif = gratis ? 0 : diskonItem ? Math.round(addon.harga * (1 - diskonItem.persen / 100)) : addon.harga;

    const sudahDipilih = state.addonDipilih.includes(addonId);
    let addonBaru: string[];

    if (sudahDipilih) {
      addonBaru = state.addonDipilih.filter(id => id !== addonId);
    } else {
      addonBaru = [...state.addonDipilih, addonId];
    }

    // Hitung ulang total add-on
    const totalAddon = addonBaru.reduce((acc, id) => {
      const a = DATA_ADDON.find(x => x.id === id)!;
      const g = a.isFreeForTier.includes(userTier);
      const d = a.diskonForTier.find(x => x.tier === userTier);
      const hEfektif = g ? 0 : d ? Math.round(a.harga * (1 - d.persen / 100)) : a.harga;
      return acc + (a.satuan === 'hari' ? hEfektif * hariSewa : hEfektif);
    }, 0);

    onUpdate({ addonDipilih: addonBaru, totalAddon });
  };

  // ── Kalkulasi Total Add-on ─────────────────────────────────────────────────
  const rincianAddon = useMemo(() => {
    return state.addonDipilih.map(id => {
      const a = DATA_ADDON.find(x => x.id === id)!;
      const g = a.isFreeForTier.includes(userTier);
      const d = a.diskonForTier.find(x => x.tier === userTier);
      const hEfektif = g ? 0 : d ? Math.round(a.harga * (1 - d.persen / 100)) : a.harga;
      const total = a.satuan === 'hari' ? hEfektif * hariSewa : hEfektif;
      return { ...a, hargaEfektif: hEfektif, total };
    });
  }, [state.addonDipilih, userTier, hariSewa]);

  const totalAddon = rincianAddon.reduce((acc, a) => acc + a.total, 0);

  // ── Banner Upgrade Tier ────────────────────────────────────────────────────
  const tierIdx = TIER_ORDER.indexOf(userTier);
  const nextTier = tierIdx < TIER_ORDER.length - 1 ? TIER_ORDER[tierIdx + 1] : null;

  const penghematanUpgrade = useMemo(() => {
    if (!nextTier) return 0;
    return DATA_ADDON.reduce((acc, addon) => {
      const currentFree = addon.isFreeForTier.includes(userTier);
      const nextFree = addon.isFreeForTier.includes(nextTier);
      const currentDiskon = addon.diskonForTier.find(d => d.tier === userTier);
      const nextDiskon = addon.diskonForTier.find(d => d.tier === nextTier);

      if (nextFree && !currentFree) {
        const hSaya = currentDiskon ? Math.round(addon.harga * (1 - currentDiskon.persen / 100)) : addon.harga;
        const totalSaya = addon.satuan === 'hari' ? hSaya * hariSewa : hSaya;
        return acc + totalSaya;
      }
      if (nextDiskon && !currentDiskon && !currentFree) {
        const hSaya = addon.harga;
        const hNext = Math.round(addon.harga * (1 - nextDiskon.persen / 100));
        const totalSelisih = addon.satuan === 'hari' ? (hSaya - hNext) * hariSewa : (hSaya - hNext);
        return acc + totalSelisih;
      }
      return acc;
    }, 0);
  }, [nextTier, userTier, hariSewa]);

  const TIER_LABEL: Record<string, string> = {
    bronze: 'Bronze', silver: 'Silver', gold: 'Gold', elite: 'Elite'
  };

  return (
    <div className="space-y-5">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Layanan Tambahan</h3>
        <p className="text-sm text-white/50">
          Tingkatkan pengalaman berkendara Anda dengan layanan premium kami
        </p>
      </div>

      {/* ─── Badge Asuransi Dasar ──────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 p-3 rounded-xl"
        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
      >
        <ShieldCheck size={18} className="flex-shrink-0 text-emerald-400" />
        <div>
          <p className="text-sm font-semibold text-emerald-400">Asuransi Dasar Termasuk</p>
          <p className="text-xs text-white/50">Semua booking sudah dilindungi asuransi dasar tanpa biaya tambahan</p>
        </div>
      </div>

      {/* ─── Banner Upgrade ────────────────────────────────────────────── */}
      <AnimatePresence>
        {nextTier && penghematanUpgrade > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}
          >
            <Info size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#D4AF37' }} />
            <p className="text-sm text-white/70 leading-relaxed">
              Upgrade ke{' '}
              <span className="font-bold" style={{ color: '#D4AF37' }}>
                {TIER_LABEL[nextTier] ?? nextTier}
              </span>{' '}
              untuk menghemat hingga{' '}
              <span className="font-bold" style={{ color: '#D4AF37' }}>
                {formatRupiah(penghematanUpgrade)}
              </span>{' '}
              dari add-on ini (berdasarkan {hariSewa} hari sewa).
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Grid Kartu Add-on ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DATA_ADDON.map(addon => (
          <KartuAddon
            key={addon.id}
            addon={addon}
            dipilih={state.addonDipilih.includes(addon.id)}
            userTier={userTier}
            hariSewa={hariSewa}
            onToggle={() => handleToggleAddon(addon.id)}
          />
        ))}
      </div>

      {/* ─── Panel Kalkulator ──────────────────────────────────────────── */}
      <AnimatePresence>
        {state.addonDipilih.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(212,175,55,0.25)' }}
          >
            {/* Header Kalkulator */}
            <button
              onClick={() => setTampilKalkulator(!tampilKalkulator)}
              className="w-full flex items-center justify-between px-5 py-3 transition-colors hover:bg-white/5"
              style={{ background: 'rgba(212,175,55,0.08)' }}
            >
              <span className="font-semibold text-white text-sm">
                Rincian Add-on ({state.addonDipilih.length} dipilih)
              </span>
              <motion.div animate={{ rotate: tampilKalkulator ? 0 : 180 }}>
                <ChevronUp size={16} style={{ color: '#D4AF37' }} />
              </motion.div>
            </button>

            <AnimatePresence>
              {tampilKalkulator && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 py-4 space-y-3" style={{ background: '#0A0A0F' }}>
                    {rincianAddon.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <item.ikon size={14} style={{ color: '#D4AF37' }} />
                          <span className="text-white/70">{item.nama}</span>
                          {item.hargaEfektif === 0 && (
                            <span className="text-xs text-emerald-400">(Gratis)</span>
                          )}
                        </div>
                        <span className="font-medium text-white">
                          {item.hargaEfektif === 0 ? (
                            <span className="text-emerald-400">Rp 0</span>
                          ) : (
                            formatRupiah(item.total)
                          )}
                        </span>
                      </div>
                    ))}

                    <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                      <span className="font-semibold text-white/80 text-sm">Total Add-on</span>
                      <span className="font-bold text-base" style={{ color: '#D4AF37' }}>
                        {formatRupiah(totalAddon)}
                      </span>
                    </div>

                    {hariSewa > 1 && (
                      <p className="text-xs text-white/30">
                        * Untuk {hariSewa} hari sewa. Add-on per trip dihitung sekali.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jika tidak ada yang dipilih */}
      {state.addonDipilih.length === 0 && (
        <p className="text-center text-sm text-white/30 py-2">
          Tidak ada add-on dipilih — asuransi dasar tetap aktif
        </p>
      )}

      {/* ─── Tombol Lanjut ─────────────────────────────────────────────── */}
      <div className="flex justify-end pt-6 border-t border-white/10 mt-6">
        <button
          onClick={onNext}
          className="px-8 py-3 bg-[#D4AF37] text-black font-bold rounded-sm text-sm uppercase tracking-widest hover:bg-white transition-colors"
        >
          Lanjutkan
        </button>
      </div>
    </div>
  );
}
