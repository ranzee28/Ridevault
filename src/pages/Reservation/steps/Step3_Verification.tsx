import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Mail, Phone, FileText, Camera, CheckCircle2,
  AlertCircle, Loader2, ExternalLink, CheckCheck,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { UserProfile } from '../../../contexts/AuthContext';

// ─── Interface Dokumen ─────────────────────────────────────────────────────────
interface Dokumen {
  id: string;
  user_id: string;
  type: 'driver_license' | 'national_id' | 'selfie_id';
  url: string;
  status: 'pending' | 'approved' | 'rejected';
}

// ─── Interface Item Checklist ──────────────────────────────────────────────────
interface ItemChecklist {
  id: string;
  label: string;
  deskripsi: string;
  ikon: React.ElementType;
  selesai: boolean;
  tabTarget: 'personal' | 'license' | null;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Step3Props {
  userProfile: UserProfile | null;
  documents: Dokumen[];
  onNext: () => void;
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function Step3_Verification({ userProfile, documents: docsProp, onNext }: Step3Props) {
  const [dokumen, setDokumen] = useState<Dokumen[]>(docsProp);
  const [loading, setLoading] = useState(false);
  const [sudahProceed, setSudahProceed] = useState(false);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch Dokumen dari Supabase ──────────────────────────────────────────────
  useEffect(() => {
    const fetchDokumen = async () => {
      if (!userProfile?.uid) return;
      setLoading(true);
      try {
        const { data } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', userProfile.uid);
        if (data) setDokumen(data as Dokumen[]);
      } catch (err) {
        console.error('Gagal memuat dokumen:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDokumen();
  }, [userProfile?.uid]);

  // ── Buat Daftar Checklist ────────────────────────────────────────────────────
  const simdok = dokumen.find(d => d.type === 'driver_license' && d.status !== 'rejected');
  const ktpdok = dokumen.find(d => d.type === 'national_id' && d.status !== 'rejected');
  const selfiedok = dokumen.find(d => d.type === 'selfie_id' && d.status !== 'rejected');

  const daftarChecklist: ItemChecklist[] = [
    {
      id: 'profil',
      label: 'Profil Lengkap',
      deskripsi: 'Nama, tanggal lahir, dan alamat terisi',
      ikon: User,
      selesai: !!(userProfile?.name && userProfile?.dateOfBirth && userProfile?.address),
      tabTarget: 'personal',
    },
    {
      id: 'email',
      label: 'Email Terverifikasi',
      deskripsi: 'Email sudah terdaftar di sistem',
      ikon: Mail,
      selesai: !!userProfile?.email,
      tabTarget: null,
    },
    {
      id: 'telepon',
      label: 'Telepon Terdaftar',
      deskripsi: 'Nomor telepon aktif untuk konfirmasi',
      ikon: Phone,
      selesai: !!userProfile?.phone,
      tabTarget: 'personal',
    },
    {
      id: 'sim',
      label: 'SIM C Diunggah',
      deskripsi: 'Surat Izin Mengemudi kategori C',
      ikon: FileText,
      selesai: !!simdok,
      tabTarget: 'license',
    },
    {
      id: 'ktp',
      label: 'KTP Diunggah',
      deskripsi: 'Kartu Tanda Penduduk atau Paspor',
      ikon: FileText,
      selesai: !!ktpdok,
      tabTarget: 'license',
    },
    {
      id: 'selfie',
      label: 'Foto Selfie dengan KTP',
      deskripsi: 'Foto wajah sambil memegang dokumen identitas',
      ikon: Camera,
      selesai: !!selfiedok,
      tabTarget: 'license',
    },
  ];

  const semuaSelesai = daftarChecklist.every(item => item.selesai);

  // ── Auto Proceed Jika Semua Selesai ─────────────────────────────────────────
  useEffect(() => {
    if (semuaSelesai && !sudahProceed && !loading) {
      autoTimer.current = setTimeout(() => {
        setSudahProceed(true);
        onNext();
      }, 1500);
    }
    return () => {
      if (autoTimer.current) clearTimeout(autoTimer.current);
    };
  }, [semuaSelesai, sudahProceed, loading, onNext]);

  // ── Loading Skeleton ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Loader2 size={20} className="animate-spin" style={{ color: '#D4AF37' }} />
          <span className="text-white/60 text-sm">Memuat status dokumen...</span>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl animate-pulse"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          />
        ))}
      </div>
    );
  }

  // ── Layar Sukses ─────────────────────────────────────────────────────────────
  if (semuaSelesai) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center space-y-6"
        >
          {/* Animasi Centang */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="relative"
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(212,175,55,0.15)', border: '2px solid #D4AF37' }}
            >
              <CheckCheck size={44} style={{ color: '#D4AF37' }} />
            </div>
            {/* Lingkaran glow animasi */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(212,175,55,0.1)' }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h3 className="text-2xl font-bold text-white">Verifikasi Berhasil!</h3>
            <p className="text-white/60 max-w-sm leading-relaxed">
              Identitas Anda telah dikonfirmasi. Lanjutkan ke tahap berikutnya untuk memilih layanan tambahan.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 text-sm text-white/40"
          >
            <Loader2 size={14} className="animate-spin" />
            <span>Melanjutkan secara otomatis...</span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Tampilan Checklist ────────────────────────────────────────────────────────
  const itemSelesai = daftarChecklist.filter(i => i.selesai).length;

  return (
    <div className="space-y-5">
      {/* ─── Header Progress ──────────────────────────────────────────── */}
      <div
        className="p-4 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} style={{ color: '#D4AF37' }} />
            <span className="font-semibold text-white text-sm">Status Verifikasi</span>
          </div>
          <span className="text-sm font-semibold" style={{ color: '#D4AF37' }}>
            {itemSelesai}/{daftarChecklist.length} Selesai
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(itemSelesai / daftarChecklist.length) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #D4AF37, #F5D77A)' }}
          />
        </div>
      </div>

      {/* ─── Daftar Item ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        {daftarChecklist.map((item, idx) => {
          const Ikon = item.ikon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{
                background: item.selesai ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.03)',
                border: item.selesai
                  ? '1px solid rgba(34,197,94,0.2)'
                  : '1px solid rgba(255,165,0,0.2)',
              }}
            >
              {/* Ikon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: item.selesai ? 'rgba(34,197,94,0.15)' : 'rgba(255,165,0,0.1)',
                }}
              >
                <Ikon size={18} style={{ color: item.selesai ? '#4ade80' : '#fbbf24' }} />
              </div>

              {/* Teks */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{item.label}</span>
                  {/* Status Badge */}
                  {item.selesai ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80' }}
                    >
                      <CheckCircle2 size={10} />
                      Selesai
                    </motion.span>
                  ) : (
                    <span
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}
                    >
                      <AlertCircle size={10} />
                      Belum Lengkap
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/45 mt-0.5">{item.deskripsi}</p>
              </div>

              {/* Tombol Aksi */}
              {!item.selesai && item.tabTarget && (
                <a
                  href={`/profile?tab=${item.tabTarget}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all hover:opacity-80"
                  style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}
                >
                  Lengkapi
                  <ExternalLink size={11} />
                </a>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ─── Tombol Lanjutkan Meski Belum Lengkap ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="pt-2 space-y-3"
      >
        <button
          onClick={onNext}
          className="w-full py-3 rounded-xl text-sm font-medium text-white/60 transition-all hover:text-white/80"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Lanjutkan Meski Belum Lengkap →
        </button>
        <p className="text-center text-xs text-white/30 leading-relaxed">
          Admin akan menghubungi Anda untuk melengkapi dokumen yang diperlukan sebelum motor diserahkan.
        </p>
      </motion.div>
    </div>
  );
}
