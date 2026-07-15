import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  Smartphone,
  Building2,
  Landmark,
  Hash,
  Lock,
  ShieldCheck,
  CheckCircle,
  Copy,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import type { ReservationState, MetodePembayaran } from '../types';

// ─── Props ────────────────────────────────────────────────────────────────────
interface Step6PaymentProps {
  state: ReservationState;
  onUpdate: (updates: Partial<ReservationState>) => void;
  totalAkhir: number;
  onSubmit: () => Promise<void>;
  isProcessing: boolean;
}

// ─── Tab Metode Pembayaran ─────────────────────────────────────────────────────
interface TabMetode {
  id: MetodePembayaran;
  label: string;
  ikon: React.ReactNode;
}

const TAB_METODE: TabMetode[] = [
  { id: 'kartu_kredit', label: 'Kartu Kredit', ikon: <CreditCard size={18} /> },
  { id: 'kartu_debit', label: 'Kartu Debit', ikon: <CreditCard size={18} /> },
  { id: 'qris', label: 'QRIS', ikon: <Smartphone size={18} /> },
  { id: 'transfer_bank', label: 'Transfer Bank', ikon: <Building2 size={18} /> },
  { id: 'virtual_account', label: 'Virtual Account', ikon: <Landmark size={18} /> },
];

// ─── Helper: format rupiah ────────────────────────────────────────────────────
function formatRp(angka: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
}

// ─── Helper: format nomor kartu ───────────────────────────────────────────────
function formatNomorKartu(nilai: string): string {
  return nilai
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

// ─── Helper: format expiry ────────────────────────────────────────────────────
function formatExpiry(nilai: string): string {
  const cleaned = nilai.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length >= 3) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
  }
  return cleaned;
}

// ─── Helper: deteksi brand kartu ─────────────────────────────────────────────
function deteksiBrandKartu(nomor: string): 'visa' | 'mastercard' | 'jcb' | null {
  const bersih = nomor.replace(/\s/g, '');
  if (/^4/.test(bersih)) return 'visa';
  if (/^5[1-5]/.test(bersih)) return 'mastercard';
  if (/^35/.test(bersih)) return 'jcb';
  return null;
}

// ─── Komponen Kartu Visual ────────────────────────────────────────────────────
interface KartuVisualProps {
  nomorKartu: string;
  namaPemegang: string;
  expiry: string;
  cvv: string;
  isFlipped: boolean;
  brand: 'visa' | 'mastercard' | 'jcb' | null;
}

function KartuVisual({
  nomorKartu,
  namaPemegang,
  expiry,
  cvv,
  isFlipped,
  brand,
}: KartuVisualProps) {
  const nomorDisplay = nomorKartu || '•••• •••• •••• ••••';
  const namaDisplay = namaPemegang || 'NAMA PEMEGANG KARTU';
  const expiryDisplay = expiry || 'MM/YY';

  return (
    <div
      className="relative mx-auto mb-6"
      style={{ width: '100%', maxWidth: '340px', height: '200px', perspective: '1000px' }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
        style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', position: 'relative' }}
      >
        {/* Depan kartu */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.3)',
          }}
        >
          {/* Efek cahaya */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background:
                'radial-gradient(ellipse at 20% 20%, rgba(212,175,55,0.1) 0%, transparent 60%)',
            }}
          />

          {/* Header kartu */}
          <div className="flex items-start justify-between relative z-10">
            <div
              className="w-10 h-10 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(212,175,55,0.8), rgba(212,175,55,0.3))',
                boxShadow: '0 0 12px rgba(212,175,55,0.4)',
              }}
            />
            <div className="text-right">
              {brand === 'visa' && (
                <span
                  className="text-xl font-bold italic"
                  style={{ color: '#FFFFFF', fontFamily: 'serif' }}
                >
                  VISA
                </span>
              )}
              {brand === 'mastercard' && (
                <div className="flex items-center gap-1">
                  <div
                    className="w-7 h-7 rounded-full"
                    style={{ background: '#EB001B', opacity: 0.9 }}
                  />
                  <div
                    className="w-7 h-7 rounded-full -ml-3"
                    style={{ background: '#F79E1B', opacity: 0.9 }}
                  />
                </div>
              )}
              {brand === 'jcb' && (
                <span
                  className="text-lg font-bold"
                  style={{ color: '#2563EB' }}
                >
                  JCB
                </span>
              )}
              {!brand && (
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Kartu
                </span>
              )}
            </div>
          </div>

          {/* Nomor kartu */}
          <div className="relative z-10">
            <p
              className="text-lg tracking-widest font-mono"
              style={{ color: '#FFFFFF', letterSpacing: '0.2em' }}
            >
              {nomorDisplay}
            </p>
          </div>

          {/* Footer kartu */}
          <div className="flex items-end justify-between relative z-10">
            <div>
              <p className="text-xs uppercase mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Pemegang Kartu
              </p>
              <p
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: '#FFFFFF', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {namaDisplay}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Berlaku
              </p>
              <p className="text-sm font-mono" style={{ color: '#FFFFFF' }}>
                {expiryDisplay}
              </p>
            </div>
          </div>
        </div>

        {/* Belakang kartu */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Strip magnetik */}
          <div
            className="w-full h-12 mb-4"
            style={{ background: '#111827', marginTop: '24px' }}
          />

          {/* Panel CVV */}
          <div className="px-5">
            <div
              className="flex items-center justify-end rounded-lg overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.9)', height: '40px' }}
            >
              <div
                className="px-4 h-full flex items-center"
                style={{ background: 'rgba(0,0,0,0.05)', borderLeft: '1px solid rgba(0,0,0,0.1)' }}
              >
                <p
                  className="text-sm font-mono font-bold tracking-widest"
                  style={{ color: '#111827' }}
                >
                  {cvv ? cvv.replace(/./g, '•') : '•••'}
                </p>
              </div>
            </div>
            <p className="text-xs mt-1 text-right" style={{ color: 'rgba(255,255,255,0.5)' }}>
              CVV
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Komponen QR Code Statis ──────────────────────────────────────────────────
function QRCodeStatis({ totalAkhir }: { totalAkhir: number }) {
  const [waktuSisa, setWaktuSisa] = useState(15 * 60); // 15 menit

  useEffect(() => {
    const interval = setInterval(() => {
      setWaktuSisa((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const menit = Math.floor(waktuSisa / 60).toString().padStart(2, '0');
  const detik = (waktuSisa % 60).toString().padStart(2, '0');

  // Pattern QR sederhana 10x10
  const pola = [
    [1,1,1,1,1,1,1,0,0,1],
    [1,0,0,0,0,0,1,0,1,0],
    [1,0,1,1,1,0,1,0,0,1],
    [1,0,1,1,1,0,1,0,1,1],
    [1,0,1,1,1,0,1,0,0,0],
    [1,0,0,0,0,0,1,0,1,0],
    [1,1,1,1,1,1,1,0,0,1],
    [0,0,0,0,1,0,0,0,1,0],
    [1,0,1,0,0,1,1,0,0,1],
    [0,1,0,1,0,0,1,0,1,1],
  ];

  return (
    <div className="flex flex-col items-center">
      <div
        className="p-4 rounded-2xl mb-4"
        style={{
          background: '#FFFFFF',
          border: '2px solid #D4AF37',
          boxShadow: '0 0 20px rgba(212,175,55,0.2)',
        }}
      >
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(10, 1fr)', width: '160px' }}>
          {pola.flat().map((sel, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                width: '14px',
                height: '14px',
                background: sel === 1 ? '#050505' : '#FFFFFF',
              }}
            />
          ))}
        </div>
      </div>

      {/* Timer */}
      <div className="text-center mb-4">
        <p className="text-xs mb-1" style={{ color: '#6B7280' }}>
          QR Code kedaluwarsa dalam
        </p>
        <div
          className="text-2xl font-bold font-mono"
          style={{ color: waktuSisa < 60 ? '#EF4444' : '#D4AF37' }}
        >
          {menit}:{detik}
        </div>
      </div>

      {/* Instruksi */}
      <div className="w-full space-y-2">
        {[
          'Buka aplikasi bank atau e-wallet Anda',
          "Pilih 'Bayar' atau 'Scan QR'",
          'Scan kode QR di atas',
          `Konfirmasi pembayaran sebesar ${formatRp(totalAkhir)}`,
        ].map((instruksi, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: '#D4AF37' }}
            >
              <span className="text-xs font-bold" style={{ color: '#050505' }}>
                {i + 1}
              </span>
            </div>
            <p className="text-sm" style={{ color: '#374151' }}>
              {instruksi}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Komponen Transfer Bank ───────────────────────────────────────────────────
function TransferBank() {
  const [disalin, setDisalin] = useState<string | null>(null);

  const rekeningList = [
    { bank: 'BCA', nomor: '1234567890', nama: 'PT RideVault Indonesia', logo: '🏦' },
    { bank: 'Mandiri', nomor: '9876543210', nama: 'PT RideVault Indonesia', logo: '🔵' },
    { bank: 'BNI', nomor: '5678901234', nama: 'PT RideVault Indonesia', logo: '🟠' },
  ];

  function salinNomor(nomor: string) {
    navigator.clipboard.writeText(nomor).catch(() => {});
    setDisalin(nomor);
    setTimeout(() => setDisalin(null), 2000);
  }

  return (
    <div className="space-y-3">
      {rekeningList.map((rek) => (
        <div
          key={rek.bank}
          className="flex items-center justify-between p-4 rounded-xl border"
          style={{ borderColor: 'rgba(212,175,55,0.25)', background: '#FAFAFA' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{rek.logo}</span>
            <div>
              <p className="font-bold text-sm" style={{ color: '#111827' }}>
                Bank {rek.bank}
              </p>
              <p className="text-lg font-mono font-semibold" style={{ color: '#D4AF37' }}>
                {rek.nomor}
              </p>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                {rek.nama}
              </p>
            </div>
          </div>
          <button
            onClick={() => salinNomor(rek.nomor)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background:
                disalin === rek.nomor
                  ? 'rgba(34,197,94,0.12)'
                  : 'rgba(212,175,55,0.12)',
              color: disalin === rek.nomor ? '#15803D' : '#92660A',
            }}
          >
            {disalin === rek.nomor ? (
              <>
                <CheckCircle size={12} />
                Tersalin
              </>
            ) : (
              <>
                <Copy size={12} />
                Salin
              </>
            )}
          </button>
        </div>
      ))}
      <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
        Harap transfer dalam 1×24 jam setelah pemesanan
      </p>
    </div>
  );
}

// ─── Komponen Virtual Account ─────────────────────────────────────────────────
function VirtualAccount({ totalAkhir }: { totalAkhir: number }) {
  const [vaMap, setVaMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [disalin, setDisalin] = useState<string | null>(null);

  const bankList = [
    { id: 'bca', nama: 'BCA Virtual Account', logo: '🏦', prefix: '70012' },
    { id: 'mandiri', nama: 'Mandiri Virtual Account', logo: '🔵', prefix: '88808' },
    { id: 'bni', nama: 'BNI Virtual Account', logo: '🟠', prefix: '98889' },
    { id: 'bri', nama: 'BRI Virtual Account', logo: '🟢', prefix: '26215' },
  ];

  function generateVA(bankId: string, prefix: string) {
    setLoading(bankId);
    setTimeout(() => {
      const acak = Math.floor(Math.random() * 9000000000) + 1000000000;
      setVaMap((prev) => ({ ...prev, [bankId]: `${prefix}${acak}` }));
      setLoading(null);
    }, 1200);
  }

  function salinVA(bankId: string) {
    const nomor = vaMap[bankId];
    if (!nomor) return;
    navigator.clipboard.writeText(nomor).catch(() => {});
    setDisalin(bankId);
    setTimeout(() => setDisalin(null), 2000);
  }

  return (
    <div className="space-y-3">
      <div
        className="flex items-center gap-2 p-3 rounded-xl mb-2"
        style={{ background: 'rgba(212,175,55,0.08)' }}
      >
        <span className="text-sm">💡</span>
        <p className="text-xs" style={{ color: '#92660A' }}>
          Pilih bank dan klik tombol 'Buat VA' untuk mendapatkan nomor Virtual Account
        </p>
      </div>

      {bankList.map((bank) => (
        <div
          key={bank.id}
          className="p-4 rounded-xl border"
          style={{ borderColor: 'rgba(212,175,55,0.25)', background: '#FAFAFA' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{bank.logo}</span>
              <div>
                <p className="font-bold text-sm" style={{ color: '#111827' }}>
                  {bank.nama}
                </p>
                {vaMap[bank.id] ? (
                  <p className="text-base font-mono font-semibold" style={{ color: '#D4AF37' }}>
                    {vaMap[bank.id]}
                  </p>
                ) : (
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>
                    Belum digenerate
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {vaMap[bank.id] && (
                <button
                  onClick={() => salinVA(bank.id)}
                  className="px-2 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    background:
                      disalin === bank.id
                        ? 'rgba(34,197,94,0.12)'
                        : 'rgba(212,175,55,0.12)',
                    color: disalin === bank.id ? '#15803D' : '#92660A',
                  }}
                >
                  {disalin === bank.id ? <CheckCircle size={12} /> : <Copy size={12} />}
                </button>
              )}
              <button
                onClick={() => generateVA(bank.id, bank.prefix)}
                disabled={loading === bank.id}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: loading === bank.id ? 'rgba(212,175,55,0.4)' : '#D4AF37',
                  color: '#050505',
                  cursor: loading === bank.id ? 'not-allowed' : 'pointer',
                }}
              >
                {loading === bank.id ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : vaMap[bank.id] ? (
                  <RefreshCw size={12} />
                ) : null}
                {loading === bank.id ? 'Proses...' : vaMap[bank.id] ? 'Perbarui' : 'Buat VA'}
              </button>
            </div>
          </div>
          {vaMap[bank.id] && (
            <div
              className="mt-2 pt-2 flex items-center justify-between"
              style={{ borderTop: '1px dashed rgba(212,175,55,0.3)' }}
            >
              <p className="text-xs" style={{ color: '#6B7280' }}>
                Jumlah tepat:
              </p>
              <p className="text-xs font-bold font-mono" style={{ color: '#D4AF37' }}>
                {formatRp(totalAkhir)}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function Step6Payment({
  state,
  onUpdate,
  totalAkhir,
  onSubmit,
  isProcessing,
}: Step6PaymentProps) {
  const [tabAktif, setTabAktif] = useState<MetodePembayaran>(
    state.metodePembayaran || 'kartu_kredit'
  );
  const [showCVVBack, setShowCVVBack] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State kartu
  const [nomorKartu, setNomorKartu] = useState(state.infoKartu?.nomorKartu || '');
  const [namaPemegang, setNamaPemegang] = useState(state.infoKartu?.namaPemegang || '');
  const [expiry, setExpiry] = useState(state.infoKartu?.expiry || '');
  const [cvv, setCvv] = useState(state.infoKartu?.cvv || '');
  const [simpanKartu, setSimpanKartu] = useState(state.infoKartu?.simpanKartu || false);

  const cvvRef = useRef<HTMLInputElement>(null);
  const brand = deteksiBrandKartu(nomorKartu);

  // Update state induk saat tab berubah
  function handleGantiTab(tab: MetodePembayaran) {
    setTabAktif(tab);
    onUpdate({ metodePembayaran: tab });
  }

  // Sinkronisasi info kartu ke state induk
  function syncKartu() {
    onUpdate({
      infoKartu: {
        nomorKartu,
        namaPemegang,
        expiry,
        cvv,
        simpanKartu,
      },
    });
  }

  // Handle submit pembayaran (simulasi Xendit)
  async function handleBayar() {
    setIsSubmitting(true);
    syncKartu();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await onSubmit();
    setIsSubmitting(false);
  }

  const isLoading = isProcessing || isSubmitting;

  const isKartu = tabAktif === 'kartu_kredit' || tabAktif === 'kartu_debit';

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* ── Judul ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#111827' }}>
          Pilih Metode Pembayaran
        </h2>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
          Total:{' '}
          <strong style={{ color: '#D4AF37', fontSize: '16px' }}>
            {formatRp(totalAkhir)}
          </strong>
        </p>
      </motion.div>

      {/* ── Tab Metode ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-5 gap-1 mb-6 p-1 rounded-2xl"
        style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
      >
        {TAB_METODE.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleGantiTab(tab.id)}
            className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-center transition-all"
            style={{
              background: tabAktif === tab.id ? '#D4AF37' : 'transparent',
              color: tabAktif === tab.id ? '#050505' : '#6B7280',
            }}
          >
            <span style={{ color: tabAktif === tab.id ? '#050505' : '#9CA3AF' }}>
              {tab.ikon}
            </span>
            <span
              className="leading-tight font-medium"
              style={{ fontSize: '9px', lineHeight: '1.2' }}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </motion.div>

      {/* ── Konten Tab ────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tabAktif}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl p-5 mb-5 border"
          style={{ background: '#FFFFFF', borderColor: 'rgba(212,175,55,0.2)' }}
        >
          {/* Tab Kartu Kredit/Debit */}
          {isKartu && (
            <div>
              <KartuVisual
                nomorKartu={nomorKartu}
                namaPemegang={namaPemegang}
                expiry={expiry}
                cvv={cvv}
                isFlipped={showCVVBack}
                brand={brand}
              />

              <div className="space-y-3">
                {/* Nomor Kartu */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                    Nomor Kartu
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nomorKartu}
                      onChange={(e) => setNomorKartu(formatNomorKartu(e.target.value))}
                      onBlur={syncKartu}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none transition-all"
                      style={{
                        borderColor: 'rgba(212,175,55,0.35)',
                        color: '#111827',
                        letterSpacing: '0.08em',
                      }}
                      maxLength={19}
                      inputMode="numeric"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CreditCard size={18} style={{ color: '#D4AF37' }} />
                    </div>
                  </div>
                </div>

                {/* Nama Pemegang */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                    Nama Pemegang Kartu
                  </label>
                  <input
                    type="text"
                    value={namaPemegang}
                    onChange={(e) => setNamaPemegang(e.target.value.toUpperCase())}
                    onBlur={syncKartu}
                    placeholder="NAMA SESUAI KARTU"
                    className="w-full px-4 py-3 rounded-xl border text-sm uppercase outline-none"
                    style={{
                      borderColor: 'rgba(212,175,55,0.35)',
                      color: '#111827',
                      letterSpacing: '0.05em',
                    }}
                  />
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                      Tanggal Kedaluwarsa
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      onBlur={syncKartu}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none"
                      style={{
                        borderColor: 'rgba(212,175,55,0.35)',
                        color: '#111827',
                      }}
                      maxLength={5}
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                      CVV
                    </label>
                    <div className="relative">
                      <input
                        ref={cvvRef}
                        type="password"
                        value={cvv}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setCvv(val);
                        }}
                        onFocus={() => setShowCVVBack(true)}
                        onBlur={() => {
                          setShowCVVBack(false);
                          syncKartu();
                        }}
                        placeholder="•••"
                        className="w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none"
                        style={{
                          borderColor: showCVVBack ? '#D4AF37' : 'rgba(212,175,55,0.35)',
                          color: '#111827',
                        }}
                        maxLength={4}
                        inputMode="numeric"
                      />
                      <Hash size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                    </div>
                  </div>
                </div>

                {/* Toggle simpan kartu */}
                <button
                  onClick={() => {
                    setSimpanKartu(!simpanKartu);
                    onUpdate({ infoKartu: { nomorKartu, namaPemegang, expiry, cvv, simpanKartu: !simpanKartu } });
                  }}
                  className="flex items-center gap-3 w-full text-left py-2"
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: simpanKartu ? '#D4AF37' : 'transparent',
                      border: `2px solid ${simpanKartu ? '#D4AF37' : 'rgba(212,175,55,0.5)'}`,
                    }}
                  >
                    {simpanKartu && <CheckCircle size={12} style={{ color: '#050505' }} />}
                  </div>
                  <span className="text-sm" style={{ color: '#374151' }}>
                    Simpan kartu untuk pembayaran berikutnya
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Tab QRIS */}
          {tabAktif === 'qris' && <QRCodeStatis totalAkhir={totalAkhir} />}

          {/* Tab Transfer Bank */}
          {tabAktif === 'transfer_bank' && <TransferBank />}

          {/* Tab Virtual Account */}
          {tabAktif === 'virtual_account' && <VirtualAccount totalAkhir={totalAkhir} />}
        </motion.div>
      </AnimatePresence>

      {/* ── Lencana Keamanan ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-4 mb-5 flex-wrap">
        {[
          { ikon: <Lock size={13} />, label: 'SSL 256-bit Encrypted' },
          { ikon: <ShieldCheck size={13} />, label: 'Xendit Secured Payment' },
          { ikon: <CheckCircle size={13} />, label: 'Verified by Visa/MC' },
        ].map((badge) => (
          <div
            key={badge.label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <span style={{ color: '#16A34A' }}>{badge.ikon}</span>
            <span className="text-xs font-medium" style={{ color: '#15803D' }}>
              {badge.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Tombol Bayar ─────────────────────────────────────────────────── */}
      <motion.button
        whileTap={{ scale: isLoading ? 1 : 0.97 }}
        onClick={handleBayar}
        disabled={isLoading}
        className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all"
        style={{
          background: isLoading
            ? 'rgba(212,175,55,0.5)'
            : 'linear-gradient(135deg, #D4AF37, #c4982a)',
          color: '#050505',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          boxShadow: isLoading ? 'none' : '0 8px 24px rgba(212,175,55,0.35)',
          fontSize: '16px',
        }}
      >
        {isLoading ? (
          <>
            <RefreshCw size={20} className="animate-spin" />
            Memproses Pembayaran...
          </>
        ) : (
          <>
            <Lock size={18} />
            Bayar Sekarang — {formatRp(totalAkhir)}
            <ChevronRight size={18} />
          </>
        )}
      </motion.button>

      <p className="text-center text-xs mt-3" style={{ color: '#9CA3AF' }}>
        Dengan melanjutkan, Anda menyetujui{' '}
        <span style={{ color: '#D4AF37', cursor: 'pointer' }}>Syarat & Ketentuan</span>{' '}
        RideVault
      </p>
    </div>
  );
}
