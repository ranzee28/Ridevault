import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import type { ReservationStep } from '../types';

// ─── Konfigurasi langkah-langkah wizard ──────────────────────────────────────
interface StepConfig {
  key: ReservationStep;
  label: string;
  nomorUrut: number;
}

const LANGKAH_WIZARD: StepConfig[] = [
  { key: 'jadwal',      label: 'Jadwal',      nomorUrut: 1 },
  { key: 'penjemputan', label: 'Penjemputan', nomorUrut: 2 },
  { key: 'verifikasi',  label: 'Verifikasi',  nomorUrut: 3 },
  { key: 'addon',       label: 'Add-on',      nomorUrut: 4 },
  { key: 'ringkasan',   label: 'Ringkasan',   nomorUrut: 5 },
  { key: 'pembayaran',  label: 'Pembayaran',  nomorUrut: 6 },
  { key: 'konfirmasi',  label: 'Konfirmasi',  nomorUrut: 7 },
];

// ─── Goal-Gradient motivational messages ─────────────────────────────────────
function getPesanMotivasi(currentStep: ReservationStep): string {
  switch (currentStep) {
    case 'jadwal':
    case 'penjemputan':
      return 'Mari mulai perjalanan premium Anda';
    case 'verifikasi':
    case 'addon':
      return 'Hampir setengah jalan — terus lanjutkan!';
    case 'ringkasan':
      return 'Tinggal 2 langkah lagi untuk mengamankan motor impian Anda!';
    case 'pembayaran':
      return 'Satu langkah terakhir — selesaikan pembayaran Anda';
    case 'konfirmasi':
    case 'aktif':
      return 'Selamat! Reservasi Anda berhasil';
    default:
      return 'Mari mulai perjalanan premium Anda';
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface StepProgressBarProps {
  currentStep: ReservationStep;
  completedSteps: ReservationStep[];
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function StepProgressBar({ currentStep, completedSteps }: StepProgressBarProps) {
  const indexAktif = LANGKAH_WIZARD.findIndex(s => s.key === currentStep);
  const pesanMotivasi = getPesanMotivasi(currentStep);

  const isSelesai = (stepKey: ReservationStep) => completedSteps.includes(stepKey);
  const isAktif   = (stepKey: ReservationStep) => stepKey === currentStep;

  return (
    <div
      className="w-full"
      style={{
        background: '#0A0A0F',
        borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
      }}
    >
      {/* ── Desktop: tampilkan semua langkah ── */}
      <div className="hidden md:block px-8 pt-6 pb-2">
        <div className="flex items-center justify-between relative">
          {/* Garis koneksi latar belakang */}
          <div
            className="absolute top-5 left-0 right-0 h-px"
            style={{ background: 'rgba(255,255,255,0.08)', zIndex: 0 }}
          />

          {/* Garis progress aktif */}
          <motion.div
            className="absolute top-5 left-0 h-px"
            style={{
              background: 'linear-gradient(90deg, #D4AF37, rgba(212,175,55,0.4))',
              zIndex: 1,
            }}
            initial={{ width: '0%' }}
            animate={{
              width: indexAktif <= 0
                ? '0%'
                : `${(indexAktif / (LANGKAH_WIZARD.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />

          {LANGKAH_WIZARD.map((langkah) => {
            const selesai = isSelesai(langkah.key);
            const aktif   = isAktif(langkah.key);

            return (
              <div
                key={langkah.key}
                className="flex flex-col items-center gap-2 relative z-10"
              >
                {/* Lingkaran langkah */}
                {selesai ? (
                  // Langkah selesai: ikon centang hijau dengan glow
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      border: '2px solid #22C55E',
                      boxShadow: '0 0 12px rgba(34, 197, 94, 0.4)',
                    }}
                  >
                    <Check size={18} color="#22C55E" strokeWidth={2.5} />
                  </motion.div>
                ) : aktif ? (
                  // Langkah aktif: lingkaran emas dengan animasi pulse
                  <div className="relative">
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'rgba(212, 175, 55, 0.3)' }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 250, damping: 18 }}
                      className="w-10 h-10 rounded-full flex items-center justify-center relative z-10"
                      style={{
                        background: '#D4AF37',
                        border: '2px solid #D4AF37',
                        boxShadow: '0 0 16px rgba(212, 175, 55, 0.5)',
                      }}
                    >
                      <span className="text-sm font-bold" style={{ color: '#050505' }}>
                        {langkah.nomorUrut}
                      </span>
                    </motion.div>
                  </div>
                ) : (
                  // Langkah mendatang: nomor abu-abu
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '2px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <span className="text-sm font-medium" style={{ color: '#6B7280' }}>
                      {langkah.nomorUrut}
                    </span>
                  </div>
                )}

                {/* Label langkah */}
                <span
                  className="text-xs tracking-wide whitespace-nowrap"
                  style={{
                    color: selesai
                      ? '#22C55E'
                      : aktif
                        ? '#D4AF37'
                        : '#6B7280',
                    fontWeight: aktif ? 700 : 400,
                  }}
                >
                  {langkah.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mobile: hanya tampilkan nomor & langkah aktif + total ── */}
      <div className="md:hidden px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Lingkaran aktif mobile */}
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'rgba(212, 175, 55, 0.3)' }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center relative z-10"
                style={{
                  background: '#D4AF37',
                  boxShadow: '0 0 12px rgba(212, 175, 55, 0.5)',
                }}
              >
                <span className="text-sm font-bold" style={{ color: '#050505' }}>
                  {indexAktif + 1}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                Langkah {indexAktif + 1} dari {LANGKAH_WIZARD.length}
              </p>
              <p className="text-sm font-bold" style={{ color: '#D4AF37' }}>
                {LANGKAH_WIZARD[indexAktif]?.label ?? ''}
              </p>
            </div>
          </div>

          {/* Indikator titik mini */}
          <div className="flex items-center gap-1.5">
            {LANGKAH_WIZARD.map((langkah, idx) => {
              const selesai = isSelesai(langkah.key);
              const aktif   = isAktif(langkah.key);
              return (
                <motion.div
                  key={langkah.key}
                  className="rounded-full"
                  animate={{
                    width:  aktif ? 20 : 6,
                    height: 6,
                    background: selesai
                      ? '#22C55E'
                      : aktif
                        ? '#D4AF37'
                        : idx < indexAktif
                          ? 'rgba(212,175,55,0.3)'
                          : 'rgba(255,255,255,0.1)',
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              );
            })}
          </div>
        </div>

        {/* Progress bar mobile */}
        <div
          className="w-full h-1 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #D4AF37, rgba(212,175,55,0.7))',
            }}
            initial={{ width: '0%' }}
            animate={{
              width: `${((indexAktif + 1) / LANGKAH_WIZARD.length) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* ── Pesan motivasi (Goal-Gradient Effect) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pesanMotivasi}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="px-4 md:px-8 pb-4 pt-1 flex items-center justify-center"
        >
          <p
            className="text-xs text-center tracking-wide"
            style={{ color: 'rgba(212,175,55,0.7)' }}
          >
            ✦&nbsp;{pesanMotivasi}&nbsp;✦
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
