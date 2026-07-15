import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronUp,
  ChevronDown,
  Shield,
  Truck,
  Tag,
  Receipt,
  Lock,
  Star,
  Sparkles,
} from 'lucide-react';
import type { Bike } from '../../../contexts/BikeContext';
import type { ReservationState } from '../types';

// ─── Helper: format mata uang Rupiah ─────────────────────────────────────────
function formatRupiah(angka: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
}

// ─── Helper: warna & label badge tier ────────────────────────────────────────
function getTierStyle(tier: string): { bg: string; text: string; label: string } {
  switch (tier) {
    case 'bronze':
      return { bg: 'rgba(180,100,30,0.2)', text: '#CD7F32', label: 'Bronze' };
    case 'silver':
      return { bg: 'rgba(192,192,192,0.15)', text: '#C0C0C0', label: 'Silver' };
    case 'gold':
      return { bg: 'rgba(212,175,55,0.2)', text: '#D4AF37', label: 'Gold' };
    case 'elite':
      return { bg: 'rgba(147,112,219,0.2)', text: '#9370DB', label: 'Elite' };
    default:
      return { bg: 'rgba(107,114,128,0.15)', text: '#9CA3AF', label: 'Member' };
  }
}

// ─── Baris kalkulasi ──────────────────────────────────────────────────────────
interface BarisPerhitunganProps {
  ikon: ReactNode;
  label: string;
  nilai: number;
  isNegatif?: boolean;
  isKecil?: boolean;
  badge?: ReactNode;
}

function BarisPerhitungan({
  ikon,
  label,
  nilai,
  isNegatif = false,
  isKecil = false,
  badge,
}: BarisPerhitunganProps) {
  if (nilai === 0 && isNegatif) return null;

  return (
    <div className={`flex items-center justify-between ${isKecil ? 'py-1' : 'py-1.5'}`}>
      <div className="flex items-center gap-2">
        <span style={{ color: '#6B7280' }}>{ikon}</span>
        <span
          className="text-sm"
          style={{ color: isKecil ? '#9CA3AF' : '#D1D5DB' }}
        >
          {label}
        </span>
        {badge && <span>{badge}</span>}
      </div>
      <AnimatePresence mode="wait">
        <motion.span
          key={nilai}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          transition={{ duration: 0.25 }}
          className="text-sm font-medium"
          style={{
            color: isNegatif
              ? nilai > 0
                ? '#34D399'   // hijau untuk diskon
                : '#9CA3AF'
              : '#F3F4F6',
          }}
        >
          {isNegatif && nilai > 0 ? '−\u00A0' : ''}
          {formatRupiah(Math.abs(nilai))}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface StickyBookingSummaryProps {
  bike: Bike;
  state: ReservationState;
  userTier: string;
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function StickyBookingSummary({
  bike,
  state,
  userTier,
}: StickyBookingSummaryProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const tierStyle = getTierStyle(userTier);

  // Estimasi poin loyalty yang akan diperoleh (1 poin per Rp 10.000)
  const poinDiperoleh = Math.floor(state.totalAkhir / 10_000);

  // ── Panel Konten ──────────────────────────────────────────────────────────
  const panelKonten = (
    <div className="p-4 flex flex-col gap-3">
      {/* Header: foto motor + info */}
      <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        {/* Foto motor kecil */}
        <div
          className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0"
          style={{ border: '1px solid rgba(212,175,55,0.2)' }}
        >
          {bike.image ? (
            <img
              src={bike.image.startsWith('src/') ? '/' + bike.image : bike.image}
              alt={`${bike.brand} ${bike.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'rgba(212,175,55,0.05)' }}
            >
              <Star size={20} style={{ color: '#D4AF37' }} />
            </div>
          )}
        </div>

        {/* Nama motor & badge tier */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate" style={{ color: '#9CA3AF' }}>
            {bike.brand}
          </p>
          <p className="text-sm font-bold truncate" style={{ color: '#FAFAFA' }}>
            {bike.model}
          </p>
          {/* Badge tier */}
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-1"
            style={{ background: tierStyle.bg, color: tierStyle.text }}
          >
            <Sparkles size={10} />
            {tierStyle.label}
          </span>
        </div>
      </div>

      {/* ── Baris-baris kalkulasi ── */}
      <div className="flex flex-col gap-0.5">
        {/* Durasi sewa */}
        <BarisPerhitungan
          ikon={<Receipt size={14} />}
          label={`${state.hariSewa} hari × ${formatRupiah(state.hargaPerHari)}`}
          nilai={state.hariSewa * state.hargaPerHari}
        />

        {/* Diskon Durasi Sewa */}
        {state.diskonDurasi > 0 && (
          <BarisPerhitungan
            ikon={<Tag size={14} />}
            label={`Diskon Durasi (${state.persenDiskonDurasi}%)`}
            nilai={state.diskonDurasi}
            isNegatif
            badge={
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}
              >
                {state.persenDiskonDurasi === 20 ? '1 Week' : '3 Days'}
              </span>
            }
          />
        )}

        {/* Diskon keanggotaan tier */}
        {state.diskonTier > 0 && (
          <BarisPerhitungan
            ikon={<Star size={14} />}
            label={`Diskon ${tierStyle.label} (${state.persenDiskonTier}%)`}
            nilai={state.diskonTier}
            isNegatif
            badge={
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: tierStyle.bg, color: tierStyle.text }}
              >
                {tierStyle.label}
              </span>
            }
          />
        )}

        {/* Add-on yang dipilih */}
        {state.totalAddon > 0 && (
          <BarisPerhitungan
            ikon={<Sparkles size={14} />}
            label={`Add-on (${state.addonDipilih.length} item)`}
            nilai={state.totalAddon}
          />
        )}

        {/* Biaya penjemputan */}
        {state.infoPenjemputan.biayaAntar > 0 && (
          <BarisPerhitungan
            ikon={<Truck size={14} />}
            label={`Antar ke ${state.infoPenjemputan.metode === 'rumah' ? 'rumah' : state.infoPenjemputan.metode === 'hotel' ? 'hotel' : 'bandara'}`}
            nilai={state.infoPenjemputan.biayaAntar}
          />
        )}

        {/* Diskon promo */}
        {state.diskonPromo > 0 && (
          <BarisPerhitungan
            ikon={<Tag size={14} />}
            label={`Promo "${state.kodePromo}"`}
            nilai={state.diskonPromo}
            isNegatif
          />
        )}

        {/* Pajak 11% */}
        <BarisPerhitungan
          ikon={<Receipt size={14} />}
          label="Pajak (11%)"
          nilai={state.pajak}
          isKecil
        />

        {/* Deposit (refundable) */}
        <div className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-2">
            <Lock size={14} style={{ color: '#6B7280' }} />
            <span className="text-sm" style={{ color: '#D1D5DB' }}>Deposit</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399' }}
            >
              refundable
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={state.deposit}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.25 }}
              className="text-sm font-medium"
              style={{ color: '#F3F4F6' }}
            >
              {formatRupiah(state.deposit)}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Asuransi gratis dari tier */}
        {(userTier === 'silver' || userTier === 'gold' || userTier === 'elite') && (
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <Shield size={14} style={{ color: '#6B7280' }} />
              <span className="text-sm" style={{ color: '#9CA3AF' }}>
                {userTier === 'silver' ? 'Asuransi penuh' : 'Asuransi premium'}
              </span>
            </div>
            <span className="text-xs font-semibold" style={{ color: '#34D399' }}>
              GRATIS
            </span>
          </div>
        )}
      </div>

      {/* ── Garis pemisah tebal ── */}
      <div style={{ borderTop: '2px solid rgba(212,175,55,0.25)', margin: '4px 0' }} />

      {/* ── Total Akhir ── */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold" style={{ color: '#FAFAFA' }}>
          Total Akhir
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={state.totalAkhir}
            initial={{ opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 6 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="text-xl font-extrabold"
            style={{ color: '#D4AF37' }}
          >
            {formatRupiah(state.totalAkhir)}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* ── Poin yang akan diperoleh ── */}
      {poinDiperoleh > 0 && (
        <div className="flex items-center justify-center mt-1">
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}
            animate={{ boxShadow: ['0 0 0px rgba(52,211,153,0)', '0 0 8px rgba(52,211,153,0.3)', '0 0 0px rgba(52,211,153,0)'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles size={13} style={{ color: '#34D399' }} />
            <span className="text-xs font-bold" style={{ color: '#34D399' }}>
              +{poinDiperoleh.toLocaleString('id-ID')} PTS akan diperoleh
            </span>
          </motion.div>
        </div>
      )}
    </div>
  );

  // ── Mobile collapsed/expanded panel ──────────────────────────────────────
  const mobileSummary = (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{
        background: '#0D0D0D',
        border: '1px solid rgba(212,175,55,0.2)',
        borderBottom: 'none',
        borderRadius: '16px 16px 0 0',
      }}
    >
      {/* Handle bar */}
      <button
        className="w-full flex items-center justify-between px-4 py-3"
        onClick={() => setMobileExpanded(prev => !prev)}
        aria-label={mobileExpanded ? 'Tutup ringkasan' : 'Buka ringkasan'}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: '#D1D5DB' }}>
            Ringkasan Pemesanan
          </span>
          {poinDiperoleh > 0 && (
            <motion.span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399' }}
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              +{poinDiperoleh} PTS
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold" style={{ color: '#D4AF37' }}>
            {formatRupiah(state.totalAkhir)}
          </span>
          {mobileExpanded ? (
            <ChevronDown size={18} style={{ color: '#9CA3AF' }} />
          ) : (
            <ChevronUp size={18} style={{ color: '#9CA3AF' }} />
          )}
        </div>
      </button>

      {/* Konten expand */}
      <AnimatePresence>
        {mobileExpanded && (
          <motion.div
            key="mobile-expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}
            >
              {panelKonten}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ── Desktop sticky sidebar ────────────────────────────────────────────────
  const desktopSidebar = (
    <motion.div
      className="hidden md:block sticky top-6 rounded-2xl overflow-hidden"
      style={{
        background: '#0D0D0D',
        border: '1px solid rgba(212,175,55,0.2)',
        boxShadow: '0 0 40px rgba(0,0,0,0.4)',
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header strip */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.03))',
          borderBottom: '1px solid rgba(212,175,55,0.12)',
        }}
      >
        <Receipt size={15} style={{ color: '#D4AF37' }} />
        <span className="text-sm font-semibold" style={{ color: '#D4AF37' }}>
          Ringkasan Pemesanan
        </span>
      </div>

      {panelKonten}
    </motion.div>
  );

  return (
    <>
      {desktopSidebar}
      {mobileSummary}
    </>
  );
}
