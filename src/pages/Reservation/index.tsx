import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, AlertCircle } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { useBikes } from '../../contexts/BikeContext';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/layout/Navbar';
import type { ReservationState, ReservationStep, BookingResult, InfoPenjemputan } from './types';
import { TIER_CONFIG } from '../Profile/constants';

// Langkah-langkah komponen (lazy-loaded style)
import StepProgressBar from './components/StepProgressBar';
import StickyBookingSummary from './components/StickyBookingSummary';
import Step1_Schedule from './steps/Step1_Schedule';
import Step2_Pickup from './steps/Step2_Pickup';
import Step3_Verification from './steps/Step3_Verification';
import Step4_Addons from './steps/Step4_Addons';
import Step5_Summary from './steps/Step5_Summary';
import Step6_Payment from './steps/Step6_Payment';
import Step7_Confirmation from './steps/Step7_Confirmation';
import Step8_ActiveDashboard from './steps/Step8_ActiveDashboard';

// ─── Urutan langkah ─────────────────────────────────────────────────────────
const URUTAN_LANGKAH: ReservationStep[] = [
  'jadwal', 'penjemputan', 'verifikasi', 'addon',
  'ringkasan', 'pembayaran', 'konfirmasi'
];

// ─── State awal ─────────────────────────────────────────────────────────────
const infoAwalPenjemputan: InfoPenjemputan = {
  metode: 'showroom',
  alamat: '',
  kota: '',
  catatan: '',
  biayaAntar: 0,
  estimasiWaktu: '',
};

const stateAwal: ReservationState = {
  tanggalMulai: null,
  tanggalSelesai: null,
  jamMulai: '08:00',
  jamSelesai: '08:00',
  infoPenjemputan: infoAwalPenjemputan,
  addonDipilih: [],
  kodePromo: '',
  diskonPromo: 0,
  poinDipakai: 0,
  metodePembayaran: 'kartu_kredit',
  infoKartu: {
    nomorKartu: '',
    namaPemegang: '',
    expiry: '',
    cvv: '',
    simpanKartu: false,
  },
  hariSewa: 0,
  hargaPerHari: 0,
  diskonTier: 0,
  persenDiskonTier: 0,
  diskonDurasi: 0,
  persenDiskonDurasi: 0,
  totalAddon: 0,
  pajak: 0,
  deposit: 0,
  totalAkhir: 0,
};

export default function ReservationPage() {
  const { bikeId } = useParams<{ bikeId: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { bikes } = useBikes();

  const [langkahAktif, setLangkahAktif] = useState<ReservationStep>('jadwal');
  const [langkahSelesai, setLangkahSelesai] = useState<ReservationStep[]>([]);
  const [state, setState] = useState<ReservationState>(stateAwal);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [sedangProses, setSedangProses] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [tampilkanDasbor, setTampilkanDasbor] = useState(false);

  // Temukan data motor
  const motor = bikes.find(b => b.id === Number(bikeId));
  const tier = (userProfile?.tier || 'default') as keyof typeof TIER_CONFIG;
  const tierCfg = TIER_CONFIG[tier] || TIER_CONFIG.default;
  const persenDiskon = parseInt(tierCfg.discount) || 0;

  // Redirect jika belum login
  useEffect(() => {
    if (user === null && !userProfile) return; // masih loading
    if (!user) {
      navigate('/login', { state: { from: `/reserve/${bikeId}` } });
    }
  }, [user, userProfile, navigate, bikeId]);

  // Fetch dokumen pengguna
  useEffect(() => {
    if (!user) return;
    const fetchDokumen = async () => {
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id);
      setDocuments(data || []);
    };
    fetchDokumen();
  }, [user]);

  // Hitung ulang total setiap kali state berubah
  useEffect(() => {
    if (!motor) return;
    const hari = state.tanggalMulai && state.tanggalSelesai
      ? Math.max(1, Math.ceil(
          (state.tanggalSelesai.getTime() - state.tanggalMulai.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1)
      : 0;

    const hargaPerHari = motor.price;
    const subtotal = hargaPerHari * hari;

    // Hitung diskon durasi sewa (3 hari -> 10%, 1 minggu/7 hari -> 20%)
    let persenDiskonDurasi = 0;
    if (hari >= 7) {
      persenDiskonDurasi = 20;
    } else if (hari >= 3) {
      persenDiskonDurasi = 10;
    }
    const diskonDurasi = Math.round(subtotal * persenDiskonDurasi / 100);
    const setelahDiskonDurasi = subtotal - diskonDurasi;

    const nominalDiskon = Math.round(setelahDiskonDurasi * persenDiskon / 100);
    const setelahDiskonTier = setelahDiskonDurasi - nominalDiskon;
    const biayaPenjemputan = state.infoPenjemputan.biayaAntar;
    const setelahAddon = setelahDiskonTier + state.totalAddon + biayaPenjemputan;
    const setelahPromo = Math.max(0, setelahAddon - state.diskonPromo);
    const setelahPoin = Math.max(0, setelahPromo - state.poinDipakai * 100);
    const pajak = Math.round(setelahPoin * 0.11);
    const deposit = 500000; // Deposit standar
    const total = setelahPoin + pajak + deposit;

    setState(prev => ({
      ...prev,
      hariSewa: hari,
      hargaPerHari,
      diskonTier: nominalDiskon,
      persenDiskonTier: persenDiskon,
      diskonDurasi,
      persenDiskonDurasi,
      pajak,
      deposit,
      totalAkhir: total,
    }));
  }, [
    motor, state.tanggalMulai, state.tanggalSelesai,
    state.totalAddon, state.diskonPromo, state.poinDipakai,
    state.infoPenjemputan.biayaAntar, persenDiskon
  ]);

  // Cek redirect dari Xendit
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const bId = params.get('bookingId');
    const pin = params.get('pickupPin');

    if (status === 'success' && bId) {
      const updateBooking = async () => {
        setSedangProses(true);
        try {
          // Update status booking di Supabase menjadi divalidasi/dikonfirmasi
          await supabase
            .from('bookings')
            .update({ status: 'Confirmed', payment_status: 'paid' })
            .eq('id', bId);

          // Pulihkan state reservasi untuk layar konfirmasi
          let finalState = state;
          const savedStateStr = sessionStorage.getItem('ridevault_reservation_state');
          if (savedStateStr) {
            try {
              const saved = JSON.parse(savedStateStr);
              finalState = {
                ...saved,
                tanggalMulai: saved.tanggalMulai ? new Date(saved.tanggalMulai) : null,
                tanggalSelesai: saved.tanggalSelesai ? new Date(saved.tanggalSelesai) : null
              };
              setState(finalState);
            } catch (e) {
              console.error('Failed to parse saved state:', e);
            }
            sessionStorage.removeItem('ridevault_reservation_state');
          } else {
            // Fallback: ambil data dari database jika sessionStorage kosong
            const { data: booking } = await supabase
              .from('bookings')
              .select('*')
              .eq('id', bId)
              .single();

            if (booking) {
              const start = booking.start_date ? new Date(booking.start_date) : null;
              const end = booking.end_date ? new Date(booking.end_date) : null;
              const hari = start && end ? Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1) : 0;
              let persenDur = 0;
              if (hari >= 7) persenDur = 20;
              else if (hari >= 3) persenDur = 10;
              const pricePerDay = motor?.price || 0;
              const diskonDur = Math.round(pricePerDay * hari * persenDur / 100);

              finalState = {
                ...state,
                tanggalMulai: start,
                tanggalSelesai: end,
                totalAkhir: Number(booking.total) || 0,
                deposit: Number(booking.deposit) || 500000,
                pajak: Number(booking.pajak) || 0,
                diskonTier: Number(booking.tier_discount) || 0,
                diskonDurasi: diskonDur,
                persenDiskonDurasi: persenDur,
                totalAddon: Number(booking.addon_total) || 0,
                diskonPromo: Number(booking.promo_discount) || 0,
                poinDipakai: Number(booking.points_used) || 0,
                infoPenjemputan: {
                  metode: (booking.pickup_method as any) || 'showroom',
                  alamat: booking.pickup_address || '',
                  kota: '',
                  catatan: '',
                  biayaAntar: 0,
                  estimasiWaktu: ''
                }
              };
              setState(finalState);
            }
          }

          setBookingResult({
            bookingId: bId,
            qrData: `RIDEVAULT:${bId}:${bikeId}:${finalState.tanggalMulai?.toISOString().split('T')[0] || ''}`,
            pickupPin: pin || '',
            status: 'dikonfirmasi',
          });

          // Pindahkan wizard ke langkah konfirmasi
          setLangkahAktif('konfirmasi');
          setLangkahSelesai(['jadwal', 'penjemputan', 'verifikasi', 'addon', 'ringkasan', 'pembayaran']);

          // Bersihkan URL query parameter agar tidak memicu kembali ketika reload
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error('Error updating booking status:', err);
        } finally {
          setSedangProses(false);
        }
      };
      updateBooking();
    } else if (status === 'failure') {
      setErrorGlobal('Pembayaran Xendit dibatalkan atau gagal diproses. Silakan coba lagi.');
      // Bersihkan URL query parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [bikeId]);

  const updateState = useCallback((updates: Partial<ReservationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Navigasi antar langkah
  const indeksAktif = URUTAN_LANGKAH.indexOf(langkahAktif);

  const lanjutLangkah = () => {
    setLangkahSelesai(prev => [...prev.filter(l => l !== langkahAktif), langkahAktif]);
    const next = URUTAN_LANGKAH[indeksAktif + 1];
    if (next) setLangkahAktif(next);
  };

  const kembaliLangkah = () => {
    const prev = URUTAN_LANGKAH[indeksAktif - 1];
    if (prev) setLangkahAktif(prev);
    else navigate(-1);
  };

  // Submit pembayaran & buat booking
  const handleSubmitPembayaran = async () => {
    if (!user || !motor || !userProfile) return;
    setSedangProses(true);
    setErrorGlobal(null);

    try {
      const bookingId = `RV-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      const pickupPin = Math.floor(100000 + Math.random() * 900000).toString();

      // Simpan state reservasi ke sessionStorage sebelum redirect
      sessionStorage.setItem('ridevault_reservation_state', JSON.stringify({
        ...state,
        tanggalMulai: state.tanggalMulai?.toISOString(),
        tanggalSelesai: state.tanggalSelesai?.toISOString()
      }));

      // 1. Buat booking dengan status pending di database
      const { error } = await supabase.from('bookings').insert({
        id: bookingId,
        user_id: user.id,
        user_name: userProfile.name || user.email || 'Anggota RideVault',
        bike_id: motor.id,
        bike_name: `${motor.brand} ${motor.model}`.toUpperCase(),
        start_date: state.tanggalMulai?.toISOString().split('T')[0],
        end_date: state.tanggalSelesai?.toISOString().split('T')[0],
        status: 'Pending',
        total: state.totalAkhir,
        pickup_method: state.infoPenjemputan.metode,
        pickup_address: state.infoPenjemputan.alamat,
        pickup_time: state.jamMulai,
        return_time: state.jamSelesai,
        addons: state.addonDipilih,
        addon_total: state.totalAddon,
        promo_code: state.kodePromo,
        promo_discount: state.diskonPromo,
        points_used: state.poinDipakai,
        points_earned: state.hariSewa * 100,
        payment_method: state.metodePembayaran,
        payment_status: 'pending',
        pickup_pin: pickupPin,
        deposit: state.deposit,
        pajak: state.pajak,
        tier_discount: state.diskonTier
      });

      if (error) throw error;

      // 2. Hubungi Supabase Edge Function untuk membuat Invoice Xendit secara aman
      const { data, error: functionErr } = await supabase.functions.invoke('create-xendit-invoice', {
        body: {
          bookingId,
          amount: Math.round(state.totalAkhir),
          email: user.email,
          bikeName: `${motor.brand} ${motor.model}`.toUpperCase(),
          successUrl: `${window.location.origin}/reserve/${bikeId}?status=success&bookingId=${bookingId}&pickupPin=${pickupPin}`,
          failureUrl: `${window.location.origin}/reserve/${bikeId}?status=failure&bookingId=${bookingId}`,
        }
      });

      if (functionErr) {
        throw new Error(functionErr.message || 'Gagal memanggil fungsi pembayaran.');
      }

      if (!data || !data.invoice_url) {
        throw new Error('Respons fungsi pembayaran tidak valid.');
      }

      const invoiceUrl = data.invoice_url;

      // Tambahkan notifikasi in-app
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Reservasi Dibuat, Menunggu Pembayaran',
        message: `Reservasi ${motor.brand} ${motor.model} Anda dengan ID ${bookingId} telah dibuat. Selesaikan pembayaran Anda di Xendit.`,
        type: 'system',
        is_read: false,
      });

      // Tambahkan poin loyalitas
      const poinDiperoleh = state.hariSewa * 100;
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: `+${poinDiperoleh} Poin Loyalitas Diperoleh`,
        message: `Selamat! Anda mendapatkan ${poinDiperoleh} poin dari reservasi ${motor.brand} ${motor.model}.`,
        type: 'reward',
        is_read: false,
      });

      // 3. Redirect ke Xendit Invoice URL
      window.location.href = invoiceUrl;
      
    } catch (err: any) {
      setErrorGlobal('Pembayaran gagal diproses: ' + (err.message || 'Kesalahan tidak diketahui'));
      setSedangProses(false);
    }
  };

  // Motor tidak ditemukan
  if (!motor) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle size={48} className="text-[#D4AF37] mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Motor Tidak Ditemukan</h2>
          <p className="text-white/50 mb-6">Motor yang Anda cari tidak tersedia.</p>
          <button
            onClick={() => navigate('/collection')}
            className="px-6 py-3 bg-[#D4AF37] text-black font-bold rounded-sm text-sm uppercase tracking-widest"
          >
            Kembali ke Koleksi
          </button>
        </div>
      </div>
    );
  }

  // Tampilkan dasbor aktif
  if (tampilkanDasbor && bookingResult) {
    return (
      <Step8_ActiveDashboard
        bookingId={bookingResult.bookingId}
        bike={motor}
        onClose={() => navigate('/profile?tab=rentals')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />

      {/* Progress Bar */}
      {langkahAktif !== 'konfirmasi' && (
        <div className="pt-20">
          <StepProgressBar
            currentStep={langkahAktif}
            completedSteps={langkahSelesai}
          />
        </div>
      )}

      <div className={`max-w-7xl mx-auto px-4 md:px-8 pb-24 ${langkahAktif !== 'konfirmasi' ? 'pt-6' : 'pt-20'}`}>
        
        {/* Tombol Kembali */}
        {langkahAktif !== 'konfirmasi' && (
          <button
            onClick={kembaliLangkah}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm mb-6 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {indeksAktif === 0 ? 'Kembali ke Koleksi' : 'Langkah Sebelumnya'}
          </button>
        )}

        {/* Error Global */}
        {errorGlobal && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-950/50 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-300 text-sm"
          >
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            {errorGlobal}
          </motion.div>
        )}

        {/* Layout Grid: Konten Utama + Sticky Summary */}
        <div className={`flex gap-8 ${langkahAktif === 'konfirmasi' ? 'justify-center' : ''}`}>
          
          {/* Konten Langkah Utama */}
          <div className={`flex-1 min-w-0 ${langkahAktif === 'konfirmasi' ? 'max-w-3xl w-full' : ''}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={langkahAktif}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Langkah 1: Jadwal */}
                {langkahAktif === 'jadwal' && (
                  <Step1_Schedule
                    state={state}
                    onUpdate={updateState}
                    bike={motor}
                    onNext={() => {
                      if (!state.tanggalMulai || !state.tanggalSelesai) {
                        setErrorGlobal('Silakan pilih tanggal mulai dan selesai sewa terlebih dahulu.');
                        return;
                      }
                      setErrorGlobal(null);
                      lanjutLangkah();
                    }}
                  />
                )}

                {/* Langkah 2: Penjemputan */}
                {langkahAktif === 'penjemputan' && (
                  <Step2_Pickup
                    state={state}
                    onUpdate={updateState}
                    userTier={tier}
                    onNext={lanjutLangkah}
                  />
                )}

                {/* Langkah 3: Verifikasi */}
                {langkahAktif === 'verifikasi' && (
                  <Step3_Verification
                    userProfile={userProfile}
                    documents={documents}
                    onNext={lanjutLangkah}
                  />
                )}

                {/* Langkah 4: Add-on */}
                {langkahAktif === 'addon' && (
                  <Step4_Addons
                    state={state}
                    onUpdate={updateState}
                    userTier={tier}
                    hariSewa={state.hariSewa}
                    onNext={lanjutLangkah}
                  />
                )}

                {/* Langkah 5: Ringkasan */}
                {langkahAktif === 'ringkasan' && (
                  <Step5_Summary
                    state={state}
                    bike={motor}
                    onUpdate={updateState}
                    userProfile={userProfile}
                    onNext={lanjutLangkah}
                  />
                )}

                {/* Langkah 6: Pembayaran */}
                {langkahAktif === 'pembayaran' && (
                  <Step6_Payment
                    state={state}
                    onUpdate={updateState}
                    totalAkhir={state.totalAkhir}
                    onSubmit={handleSubmitPembayaran}
                    isProcessing={sedangProses}
                  />
                )}

                {/* Langkah 7: Konfirmasi */}
                {langkahAktif === 'konfirmasi' && bookingResult && (
                  <Step7_Confirmation
                    bookingResult={bookingResult}
                    bike={motor}
                    state={state}
                    onViewReservation={() => {
                      setTampilkanDasbor(true);
                    }}
                    onBrowseMore={() => navigate('/collection')}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sticky Booking Summary (hanya tampil di langkah 1-6) */}
          {langkahAktif !== 'konfirmasi' && (
            <div className="hidden lg:block w-[340px] shrink-0">
              <div className="sticky top-28">
                <StickyBookingSummary
                  bike={motor}
                  state={state}
                  userTier={tier}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
