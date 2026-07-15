import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tag,
  Gift,
  Star,
  Info,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Coins,
} from 'lucide-react';
import type { ReservationState, PromoResult } from '../types';

// ─── Tipe Bike lokal ──────────────────────────────────────────────────────────
interface Bike {
  id: number;
  brand: string;
  model: string;
  price: number;
  image: string;
  engine: string;
  power: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Step5SummaryProps {
  state: ReservationState;
  bike: Bike;
  onUpdate: (updates: Partial<ReservationState>) => void;
  userProfile: {
    uid: string;
    name: string;
    tier: 'default' | 'bronze' | 'silver' | 'gold' | 'elite';
    loyaltyPoints: number;
  };
  onNext: () => void;
}

// ─── Helper: label tier ───────────────────────────────────────────────────────
function getLabelTier(tier: string): string {
  const map: Record<string, string> = {
    default: 'Default',
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
    elite: 'Elite',
  };
  return map[tier] ?? 'Default';
}

// ─── Helper: warna badge tier ─────────────────────────────────────────────────
function getWarnaTier(tier: string): string {
  const map: Record<string, string> = {
    default: '#6B7280',
    bronze: '#CD7F32',
    silver: '#9CA3AF',
    gold: '#D4AF37',
    elite: '#9333EA',
  };
  return map[tier] ?? '#6B7280';
}

// ─── Helper: validasi kode promo ──────────────────────────────────────────────
function validasiKodePromo(
  kode: string,
  tier: string,
  hargaDasar: number
): PromoResult {
  const upper = kode.trim().toUpperCase();

  if (upper === 'RIDEVAULT10') {
    return {
      valid: true,
      diskon: 0.1,
      tipeDiskon: 'persen',
      pesan: 'Kode promo berhasil! Diskon 10% diterapkan.',
    };
  }

  if (upper === 'FIRSTRIDE50K') {
    return {
      valid: true,
      diskon: 50000,
      tipeDiskon: 'nominal',
      pesan: 'Kode promo berhasil! Diskon Rp 50.000 diterapkan.',
    };
  }

  if (upper === 'GOLDPASS') {
    if (tier === 'gold' || tier === 'elite') {
      return {
        valid: true,
        diskon: 0.2,
        tipeDiskon: 'persen',
        pesan: 'Kode eksklusif Gold/Elite berhasil! Diskon 20% diterapkan.',
      };
    }
    return {
      valid: false,
      diskon: 0,
      tipeDiskon: 'persen',
      pesan: 'Kode promo GOLDPASS hanya untuk anggota Gold dan Elite.',
    };
  }

  if (upper === '') {
    return {
      valid: false,
      diskon: 0,
      tipeDiskon: 'persen',
      pesan: 'Masukkan kode promo terlebih dahulu.',
    };
  }

  // Suppress unused variable warning
  void hargaDasar;

  return {
    valid: false,
    diskon: 0,
    tipeDiskon: 'persen',
    pesan: 'Kode promo tidak valid atau sudah kedaluwarsa.',
  };
}

// ─── Helper: format rupiah ────────────────────────────────────────────────────
function formatRp(angka: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
}

// ─── Helper: format tanggal ───────────────────────────────────────────────────
function formatTanggal(date: Date | null): string {
  if (!date) return '-';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Komponen Baris Kalkulasi ─────────────────────────────────────────────────
interface BarisKalkulasiProps {
  label: string;
  nilai: string;
  isDiskon?: boolean;
  isTotal?: boolean;
  isTax?: boolean;
  badge?: string;
  sublabel?: string;
}

function BarisKalkulasi({
  label,
  nilai,
  isDiskon,
  isTotal,
  isTax,
  badge,
  sublabel,
}: BarisKalkulasiProps) {
  return (
    <div
      className={`flex items-start justify-between py-2.5 ${
        isTotal ? 'pt-4 mt-1' : ''
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span
            className="text-sm"
            style={{
              color: isTotal ? '#D4AF37' : isDiskon ? '#22C55E' : '#374151',
              fontWeight: isTotal ? 700 : 500,
              fontSize: isTotal ? '16px' : undefined,
            }}
          >
            {label}
          </span>
          {badge && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: '#DCFCE7', color: '#15803D' }}
            >
              {badge}
            </span>
          )}
          {isTax && (
            <Info size={12} style={{ color: '#9CA3AF' }} />
          )}
        </div>
        {sublabel && (
          <span className="text-xs" style={{ color: '#9CA3AF' }}>
            {sublabel}
          </span>
        )}
      </div>
      <span
        className="font-semibold text-right"
        style={{
          color: isTotal ? '#D4AF37' : isDiskon ? '#22C55E' : '#111827',
          fontWeight: isTotal ? 800 : 600,
          fontSize: isTotal ? '18px' : '14px',
          fontFamily: isTotal ? 'monospace' : undefined,
        }}
      >
        {nilai}
      </span>
    </div>
  );
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function Step5Summary({
  state,
  bike,
  onUpdate,
  userProfile,
  onNext,
}: Step5SummaryProps) {
  const [inputPromo, setInputPromo] = useState(state.kodePromo || '');
  const [hasilPromo, setHasilPromo] = useState<PromoResult | null>(null);
  const [loadingPromo, setLoadingPromo] = useState(false);
  const [poinInput, setPoinInput] = useState(state.poinDipakai || 0);
  const [showKebijakan, setShowKebijakan] = useState(false);

  const maxPoin = Math.min(userProfile.loyaltyPoints || 0, 5000);

  // ── Kalkulasi harga ──────────────────────────────────────────────────────
  const kalkulasi = useMemo(() => {
    const hargaPerHari = state.hargaPerHari || bike.price;
    const hari = state.hariSewa || 1;
    const hargaDasar = hargaPerHari * hari;
    
    // Hitung diskon durasi sewa
    const diskonDurasiNominal = state.diskonDurasi || 0;
    const subtotalSetelahDurasi = hargaDasar - diskonDurasiNominal;

    const diskonTierNominal = state.diskonTier || 0;
    const subtotalSetelahTier = subtotalSetelahDurasi - diskonTierNominal;

    // Hitung diskon promo
    let diskonPromoNominal = 0;
    if (state.diskonPromo > 0) {
      if (state.diskonPromo < 1) {
        // persen
        diskonPromoNominal = Math.round(subtotalSetelahTier * state.diskonPromo);
      } else {
        // nominal
        diskonPromoNominal = state.diskonPromo;
      }
    }

    // Diskon poin (1 poin = Rp 100)
    const diskonPoin = poinInput * 100;

    // Addon total
    const addonTotal = state.totalAddon || 0;
    const biayaPenjemputan = state.infoPenjemputan?.biayaAntar || 0;

    const subtotalPraTagihan =
      subtotalSetelahTier +
      addonTotal +
      biayaPenjemputan -
      diskonPromoNominal -
      diskonPoin;

    const pajakNominal = Math.round(Math.max(0, subtotalPraTagihan) * 0.11);
    const deposit = state.deposit || 500000;
    const total = Math.max(0, subtotalPraTagihan) + pajakNominal + deposit;

    // Poin yang diperoleh: 100 base + 1 per 10.000 IDR
    const poinDiperoleh = 100 + Math.floor(total / 10000);

    return {
      hargaPerHari,
      hari,
      hargaDasar,
      diskonDurasiNominal,
      diskonTierNominal,
      subtotalSetelahTier,
      addonTotal,
      biayaPenjemputan,
      diskonPromoNominal,
      diskonPoin,
      pajakNominal,
      deposit,
      total,
      poinDiperoleh,
    };
  }, [state, bike.price, poinInput]);

  // ── Terapkan kode promo ───────────────────────────────────────────────────
  function handleTerapkanPromo() {
    setLoadingPromo(true);
    setTimeout(() => {
      const hasil = validasiKodePromo(
        inputPromo,
        userProfile.tier,
        kalkulasi.hargaDasar
      );
      setHasilPromo(hasil);
      if (hasil.valid) {
        onUpdate({
          kodePromo: inputPromo.trim().toUpperCase(),
          diskonPromo: hasil.diskon,
        });
      } else {
        onUpdate({ kodePromo: '', diskonPromo: 0 });
      }
      setLoadingPromo(false);
    }, 600);
  }

  // ── Update poin ───────────────────────────────────────────────────────────
  function handlePoinChange(nilai: number) {
    const valid = Math.min(Math.max(0, nilai), maxPoin);
    setPoinInput(valid);
    onUpdate({ poinDipakai: valid });
  }

  const warnaTier = getWarnaTier(userProfile.tier);
  const labelTier = getLabelTier(userProfile.tier);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* ── Judul ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-6"
      >
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: '#111827' }}
        >
          Ringkasan Pemesanan
        </h2>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
          Periksa detail pesanan Anda sebelum melanjutkan pembayaran
        </p>
      </motion.div>

      {/* ── Kartu Receipt ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="rounded-2xl overflow-hidden shadow-lg border"
        style={{ background: '#FFFFFF', borderColor: 'rgba(212,175,55,0.25)' }}
      >
        {/* Foto Motor */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={bike.image?.startsWith('src/') ? '/' + bike.image : bike.image}
            alt={`${bike.brand} ${bike.model}`}
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.75) 100%)',
            }}
          />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {bike.brand}
              </p>
              <h3 className="text-xl font-bold text-white">{bike.model}</h3>
            </div>
            <div
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: warnaTier,
                color: userProfile.tier === 'default' ? '#FFFFFF' : '#050505',
              }}
            >
              ✦ {labelTier}
            </div>
          </div>
        </div>

        {/* Garis zig-zag dekoratif */}
        <div
          className="h-3"
          style={{
            background: `repeating-linear-gradient(
              -45deg,
              #FFFFFF 0px,
              #FFFFFF 6px,
              rgba(212,175,55,0.15) 6px,
              rgba(212,175,55,0.15) 12px
            )`,
          }}
        />

        {/* Tabel Kalkulasi */}
        <div className="px-6 py-4">
          {/* Header */}
          <div
            className="flex items-center justify-between pb-3 mb-1"
            style={{ borderBottom: '2px dashed rgba(212,175,55,0.3)' }}
          >
            <div>
              <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                INVOICE SEMENTARA
              </p>
              <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                {formatTanggal(state.tanggalMulai)} —{' '}
                {formatTanggal(state.tanggalSelesai)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                Durasi Sewa
              </p>
              <p className="text-lg font-bold" style={{ color: '#D4AF37' }}>
                {kalkulasi.hari} Hari
              </p>
            </div>
          </div>

          {/* Baris kalkulasi */}
          <div style={{ borderBottom: '1px solid #F3F4F6' }}>
            <BarisKalkulasi
              label="Harga Dasar"
              sublabel={`${formatRp(kalkulasi.hargaPerHari)}/hari × ${kalkulasi.hari} hari`}
              nilai={formatRp(kalkulasi.hargaDasar)}
            />
          </div>

          {kalkulasi.diskonDurasiNominal > 0 && (
            <div style={{ borderBottom: '1px solid #F3F4F6' }}>
              <BarisKalkulasi
                label={`Diskon Durasi (${state.persenDiskonDurasi}%)`}
                sublabel={state.persenDiskonDurasi === 20 ? 'Sewa 1 minggu (7 hari+)' : 'Sewa 3 hari+'}
                nilai={`-${formatRp(kalkulasi.diskonDurasiNominal)}`}
                isDiskon
              />
            </div>
          )}

          {kalkulasi.diskonTierNominal > 0 && (
            <div style={{ borderBottom: '1px solid #F3F4F6' }}>
              <BarisKalkulasi
                label={`Diskon Tier ${labelTier}`}
                sublabel={`-${state.persenDiskonTier}% dari harga sewa`}
                nilai={`-${formatRp(kalkulasi.diskonTierNominal)}`}
                isDiskon
              />
            </div>
          )}

          {kalkulasi.addonTotal > 0 && (
            <div style={{ borderBottom: '1px solid #F3F4F6' }}>
              <BarisKalkulasi
                label="Add-on Terpilih"
                sublabel={`${state.addonDipilih.length} layanan tambahan`}
                nilai={`+${formatRp(kalkulasi.addonTotal)}`}
              />
            </div>
          )}

          {kalkulasi.biayaPenjemputan > 0 && (
            <div style={{ borderBottom: '1px solid #F3F4F6' }}>
              <BarisKalkulasi
                label="Biaya Penjemputan"
                sublabel={`Metode: ${state.infoPenjemputan?.metode ?? '-'}`}
                nilai={`+${formatRp(kalkulasi.biayaPenjemputan)}`}
              />
            </div>
          )}

          {kalkulasi.diskonPromoNominal > 0 && (
            <div style={{ borderBottom: '1px solid #F3F4F6' }}>
              <BarisKalkulasi
                label={`Diskon Promo (${state.kodePromo})`}
                nilai={`-${formatRp(kalkulasi.diskonPromoNominal)}`}
                isDiskon
              />
            </div>
          )}

          {kalkulasi.diskonPoin > 0 && (
            <div style={{ borderBottom: '1px solid #F3F4F6' }}>
              <BarisKalkulasi
                label={`Redeem Poin (${poinInput} PTS)`}
                nilai={`-${formatRp(kalkulasi.diskonPoin)}`}
                isDiskon
              />
            </div>
          )}

          <div style={{ borderBottom: '1px solid #F3F4F6' }}>
            <BarisKalkulasi
              label="Pajak (PPN 11%)"
              nilai={`+${formatRp(kalkulasi.pajakNominal)}`}
              isTax
            />
          </div>

          <div style={{ borderBottom: '1px solid #F3F4F6' }}>
            <BarisKalkulasi
              label="Deposit Refundable"
              sublabel="Dikembalikan dalam 3-5 hari kerja"
              badge="Dikembalikan"
              nilai={`+${formatRp(kalkulasi.deposit)}`}
            />
          </div>

          {/* Garis pemisah total */}
          <div
            className="my-3"
            style={{ borderTop: '2px solid #D4AF37', opacity: 0.4 }}
          />

          <BarisKalkulasi
            label="TOTAL PEMBAYARAN"
            nilai={formatRp(kalkulasi.total)}
            isTotal
          />

          {/* Poin yang diperoleh */}
          <div
            className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(212,175,55,0.08)' }}
          >
            <Coins size={16} style={{ color: '#D4AF37' }} />
            <span className="text-xs" style={{ color: '#92660A' }}>
              Poin yang diperoleh dari sewa ini:{' '}
              <strong>+{kalkulasi.poinDiperoleh} PTS</strong>
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Input Kode Promo ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
        className="mt-5 rounded-2xl p-5 shadow-sm border"
        style={{ background: '#FFFFFF', borderColor: 'rgba(212,175,55,0.2)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Tag size={18} style={{ color: '#D4AF37' }} />
          <h4 className="font-semibold text-sm" style={{ color: '#111827' }}>
            Kode Promo
          </h4>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputPromo}
            onChange={(e) => setInputPromo(e.target.value.toUpperCase())}
            placeholder="Masukkan kode promo (contoh: RIDEVAULT10)"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm border outline-none transition-all"
            style={{
              borderColor:
                hasilPromo?.valid === true
                  ? '#22C55E'
                  : hasilPromo?.valid === false
                    ? '#EF4444'
                    : 'rgba(212,175,55,0.35)',
              color: '#111827',
              background: '#FAFAFA',
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleTerapkanPromo()}
          />
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleTerapkanPromo}
            disabled={loadingPromo}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: loadingPromo
                ? 'rgba(212,175,55,0.4)'
                : '#D4AF37',
              color: '#050505',
              cursor: loadingPromo ? 'not-allowed' : 'pointer',
              minWidth: '96px',
            }}
          >
            {loadingPromo ? '...' : 'Terapkan'}
          </motion.button>
        </div>

        {/* Pesan hasil promo */}
        <AnimatePresence mode="wait">
          {hasilPromo && (
            <motion.div
              key={hasilPromo.pesan}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-2 flex items-center gap-2"
            >
              {hasilPromo.valid ? (
                <CheckCircle size={15} style={{ color: '#22C55E' }} />
              ) : (
                <XCircle size={15} style={{ color: '#EF4444' }} />
              )}
              <span
                className="text-xs font-medium"
                style={{
                  color: hasilPromo.valid ? '#15803D' : '#DC2626',
                }}
              >
                {hasilPromo.pesan}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint kode tersedia */}
        <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
          Coba: RIDEVAULT10 · FIRSTRIDE50K · GOLDPASS (Gold/Elite)
        </p>
      </motion.div>

      {/* ── Panel Poin Reward ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3 }}
        className="mt-5 rounded-2xl p-5 shadow-sm border"
        style={{ background: '#FFFFFF', borderColor: 'rgba(212,175,55,0.2)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star size={18} style={{ color: '#D4AF37' }} />
            <h4 className="font-semibold text-sm" style={{ color: '#111827' }}>
              Gunakan Poin Reward
            </h4>
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: 'rgba(212,175,55,0.12)',
              color: '#92660A',
            }}
          >
            Saldo: {(userProfile.loyaltyPoints || 0).toLocaleString('id-ID')} PTS
          </div>
        </div>

        {(userProfile.loyaltyPoints || 0) > 0 ? (
          <>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="range"
                min={0}
                max={maxPoin}
                step={10}
                value={poinInput}
                onChange={(e) => handlePoinChange(Number(e.target.value))}
                className="flex-1 h-2 rounded-full cursor-pointer"
                style={{ accentColor: '#D4AF37' }}
              />
              <div className="flex items-center gap-1 min-w-[80px]">
                <input
                  type="number"
                  min={0}
                  max={maxPoin}
                  value={poinInput}
                  onChange={(e) => handlePoinChange(Number(e.target.value))}
                  className="w-20 text-right px-2 py-1 rounded-lg border text-sm font-mono"
                  style={{
                    borderColor: 'rgba(212,175,55,0.35)',
                    color: '#111827',
                  }}
                />
                <span className="text-xs" style={{ color: '#6B7280' }}>
                  PTS
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: '#6B7280' }}>
                1 poin = Rp 100 · Nilai:{' '}
                <strong style={{ color: '#22C55E' }}>
                  {formatRp(poinInput * 100)}
                </strong>
              </p>
              {poinInput > 0 && (
                <button
                  onClick={() => handlePoinChange(0)}
                  className="text-xs underline"
                  style={{ color: '#6B7280' }}
                >
                  Reset
                </button>
              )}
            </div>

            <div
              className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(34,197,94,0.08)' }}
            >
              <Gift size={14} style={{ color: '#22C55E' }} />
              <span className="text-xs" style={{ color: '#15803D' }}>
                Poin yang diperoleh dari sewa ini:{' '}
                <strong>+{kalkulasi.poinDiperoleh} PTS</strong>
              </span>
            </div>
          </>
        ) : (
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            Anda belum memiliki poin reward. Selesaikan sewa pertama Anda untuk
            mulai mengumpulkan poin!
          </p>
        )}
      </motion.div>

      {/* ── Catatan Kebijakan ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.4 }}
        className="mt-5 rounded-2xl overflow-hidden border"
        style={{ borderColor: 'rgba(212,175,55,0.2)' }}
      >
        <button
          onClick={() => setShowKebijakan(!showKebijakan)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
          style={{ background: 'rgba(212,175,55,0.06)' }}
        >
          <div className="flex items-center gap-2">
            <Info size={16} style={{ color: '#D4AF37' }} />
            <span className="text-sm font-semibold" style={{ color: '#111827' }}>
              Kebijakan Reservasi
            </span>
          </div>
          {showKebijakan ? (
            <ChevronUp size={16} style={{ color: '#6B7280' }} />
          ) : (
            <ChevronDown size={16} style={{ color: '#6B7280' }} />
          )}
        </button>

        <AnimatePresence>
          {showKebijakan && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ background: '#FFFFFF' }}
            >
              <div className="px-5 py-4 space-y-3">
                {[
                  {
                    ikon: '🕐',
                    judul: 'Pembatalan Gratis',
                    deskripsi:
                      'Pembatalan gratis hingga 24 jam sebelum jadwal penjemputan tanpa biaya apapun.',
                  },
                  {
                    ikon: '💰',
                    judul: 'Pengembalian Deposit',
                    deskripsi:
                      'Deposit refundable akan dikembalikan dalam 3-5 hari kerja setelah kendaraan dikembalikan dalam kondisi baik.',
                  },
                  {
                    ikon: '📋',
                    judul: 'Syarat Penyewaan',
                    deskripsi:
                      'Penyewa wajib memiliki SIM A/C yang masih berlaku dan dokumen identitas yang valid.',
                  },
                  {
                    ikon: '🛡️',
                    judul: 'Jaminan Keamanan',
                    deskripsi:
                      'Semua motor dilengkapi GPS tracker dan asuransi perjalanan dasar sudah termasuk dalam harga.',
                  },
                ].map((item) => (
                  <div key={item.judul} className="flex gap-3">
                    <span className="text-lg flex-shrink-0">{item.ikon}</span>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: '#111827' }}
                      >
                        {item.judul}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                        {item.deskripsi}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Ringkasan Total Bawah ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-5 rounded-2xl px-5 py-4 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #050505, #0A0A0F)',
          border: '1px solid rgba(212,175,55,0.4)',
        }}
      >
        <div>
          <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Total yang perlu dibayar
          </p>
          <p className="text-2xl font-bold font-mono" style={{ color: '#D4AF37' }}>
            {formatRp(kalkulasi.total)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Termasuk deposit
          </p>
          <p className="text-xs font-medium" style={{ color: 'rgba(212,175,55,0.7)' }}>
            +{kalkulasi.poinDiperoleh} PTS reward
          </p>
        </div>

        {/* ─── Tombol Lanjut ─────────────────────────────────────────────── */}
        <div className="flex justify-end pt-6 border-t border-white/10 mt-8">
          <button
            onClick={onNext}
            className="px-8 py-3 bg-[#D4AF37] text-black font-bold rounded-sm text-sm uppercase tracking-widest hover:bg-white transition-colors"
          >
            Lanjutkan ke Pembayaran
          </button>
        </div>
      </motion.div>
    </div>
  );
}
