// ─── ReservationStep — untuk progress bar wizard ──────────────────────────────
export type ReservationStep =
  | 'jadwal'
  | 'penjemputan'
  | 'verifikasi'
  | 'addon'
  | 'ringkasan'
  | 'pembayaran'
  | 'konfirmasi'
  | 'aktif';

// ─── AddOn — layanan tambahan ─────────────────────────────────────────────────
export interface AddOn {
  id: string;
  nama: string;
  deskripsi: string;
  harga: number;
  hargaSatuan: 'hari' | 'trip';
  ikon: string;
  isFreeForTier: ('bronze' | 'silver' | 'gold' | 'elite')[];
  diskonForTier: { tier: string; persen: number }[];
}

// ─── MetodePenjemputan ────────────────────────────────────────────────────────
export type MetodePenjemputan = 'showroom' | 'rumah' | 'hotel' | 'bandara';

// ─── InfoPenjemputan ──────────────────────────────────────────────────────────
export interface InfoPenjemputan {
  metode: MetodePenjemputan;
  alamat: string;
  kota: string;
  catatan: string;
  biayaAntar: number;
  estimasiWaktu: string;
}

// ─── MetodePembayaran ─────────────────────────────────────────────────────────
export type MetodePembayaran =
  | 'kartu_kredit'
  | 'kartu_debit'
  | 'qris'
  | 'transfer_bank'
  | 'virtual_account';

// ─── InfoKartu ────────────────────────────────────────────────────────────────
export interface InfoKartu {
  nomorKartu: string;
  namaPemegang: string;
  expiry: string;
  cvv: string;
  simpanKartu: boolean;
}

// ─── StatusBooking ────────────────────────────────────────────────────────────
export type StatusBooking =
  | 'menunggu'
  | 'dikonfirmasi'
  | 'disiapkan'
  | 'siap_ambil'
  | 'aktif'
  | 'selesai'
  | 'dibatalkan';

// ─── ReservationState — state global wizard ───────────────────────────────────
export interface ReservationState {
  // Step 1 — Jadwal
  tanggalMulai: Date | null;
  tanggalSelesai: Date | null;
  jamMulai: string;
  jamSelesai: string;

  // Step 2 — Penjemputan
  infoPenjemputan: InfoPenjemputan;

  // Step 4 — Add-on
  addonDipilih: string[];

  // Step 5 — Ringkasan (promo & poin)
  kodePromo: string;
  diskonPromo: number;
  poinDipakai: number;

  // Step 6 — Pembayaran
  metodePembayaran: MetodePembayaran;
  infoKartu: InfoKartu;

  // Kalkulasi harga
  hariSewa: number;
  hargaPerHari: number;
  diskonTier: number;
  persenDiskonTier: number;
  diskonDurasi: number;
  persenDiskonDurasi: number;
  totalAddon: number;
  pajak: number;
  deposit: number;
  totalAkhir: number;
}

// ─── BookingResult — hasil setelah konfirmasi pembayaran ─────────────────────
export interface BookingResult {
  bookingId: string;
  qrData: string;
  pickupPin: string;
  status: StatusBooking;
}

// ─── PromoResult — hasil validasi kode promo ─────────────────────────────────
export interface PromoResult {
  valid: boolean;
  diskon: number;
  tipeDiskon: 'persen' | 'nominal';
  pesan: string;
}
