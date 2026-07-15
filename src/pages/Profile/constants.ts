import {
  LayoutGrid, User, FileText, CreditCard, TrendingUp,
  Clock, Heart, Bell, Shield, Wallet, Gift, Star, Settings, Crown,
  type LucideIcon
} from 'lucide-react';
import { Tab } from './types';

// ─── Tier Config ─────────────────────────────────────────────────────────────
export const TIER_CONFIG = {
  default: {
    label: 'Anggota Standar',
    shortLabel: 'STANDARD',
    color: '#64748b',
    bgGradient: 'from-slate-700 to-slate-900',
    cardGradient: ['#1e293b', '#0f172a', '#0a0f1e'],
    glowColor: 'rgba(100,116,139,0.3)',
    borderColor: 'rgba(100,116,139,0.2)',
    badgeClass: 'text-slate-300 bg-slate-800 border-slate-600',
    textClass: 'text-slate-300',
    discount: '0%',
    chipColor: '#334155',
    pointsToNext: 500,
    nextTier: 'Bronze',
  },
  bronze: {
    label: 'Anggota Perunggu',
    shortLabel: 'BRONZE',
    color: '#CD7F32',
    bgGradient: 'from-amber-900 to-amber-950',
    cardGradient: ['#4A2E1B', '#613D26', '#2B1B10'],
    glowColor: 'rgba(205,127,50,0.3)',
    borderColor: 'rgba(205,127,50,0.3)',
    badgeClass: 'text-amber-300 bg-amber-900/50 border-amber-600/50',
    textClass: 'text-amber-300',
    discount: '5%',
    chipColor: '#92400e',
    pointsToNext: 1000,
    nextTier: 'Silver',
  },
  silver: {
    label: 'Anggota Perak',
    shortLabel: 'SILVER',
    color: '#94a3b8',
    bgGradient: 'from-slate-500 to-slate-700',
    cardGradient: ['#4F5D75', '#687B9C', '#2D3545'],
    glowColor: 'rgba(148,163,184,0.3)',
    borderColor: 'rgba(148,163,184,0.3)',
    badgeClass: 'text-slate-200 bg-slate-700/50 border-slate-400/50',
    textClass: 'text-slate-200',
    discount: '10%',
    chipColor: '#475569',
    pointsToNext: 2000,
    nextTier: 'Gold',
  },
  gold: {
    label: 'Anggota Emas',
    shortLabel: 'GOLD',
    color: '#D4AF37',
    bgGradient: 'from-yellow-700 to-yellow-900',
    cardGradient: ['#8B6914', '#D4AF37', '#5C4010'],
    glowColor: 'rgba(212,175,55,0.35)',
    borderColor: 'rgba(212,175,55,0.4)',
    badgeClass: 'text-yellow-200 bg-yellow-900/50 border-yellow-500/50',
    textClass: 'text-yellow-200',
    discount: '20%',
    chipColor: '#92400e',
    pointsToNext: 0,
    nextTier: null,
  },
  elite: {
    label: 'Anggota Elit Vault',
    shortLabel: 'ELITE',
    color: '#D4AF37',
    bgGradient: 'from-[#D4AF37] to-[#8B6914]',
    cardGradient: ['#F3E5AB', '#D4AF37', '#8B6914'],
    glowColor: 'rgba(212,175,55,0.45)',
    borderColor: 'rgba(212,175,55,0.5)',
    badgeClass: 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/40',
    textClass: 'text-[#D4AF37]',
    discount: '25%',
    chipColor: '#78350f',
    pointsToNext: 0,
    nextTier: null,
  },
};

// ─── Status Config ────────────────────────────────────────────────────────────
export const STATUS_CONFIG = {
  pending: { label: 'Menunggu', class: 'text-yellow-300 bg-yellow-900/40 border-yellow-600/40', dot: '#eab308' },
  confirmed: { label: 'Dikonfirmasi', class: 'text-blue-300 bg-blue-900/40 border-blue-600/40', dot: '#3b82f6' },
  active: { label: 'Aktif', class: 'text-emerald-300 bg-emerald-900/40 border-emerald-600/40', dot: '#10b981' },
  upcoming: { label: 'Mendatang', class: 'text-purple-300 bg-purple-900/40 border-purple-600/40', dot: '#a855f7' },
  completed: { label: 'Selesai', class: 'text-slate-300 bg-slate-800/60 border-slate-600/40', dot: '#94a3b8' },
  cancelled: { label: 'Dibatalkan', class: 'text-red-300 bg-red-900/40 border-red-600/40', dot: '#ef4444' },
  overdue: { label: 'Terlambat', class: 'text-orange-300 bg-orange-900/40 border-orange-600/40', dot: '#f97316' },
};

// ─── Navigation ───────────────────────────────────────────────────────────────
export interface NavItem {
  id: Tab;
  label: string;
  icon: LucideIcon;
  group: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Ringkasan', icon: LayoutGrid, group: 'Dasbor' },
  { id: 'personal', label: 'Informasi Pribadi', icon: User, group: 'Profil' },
  { id: 'license', label: 'SIM & Identitas', icon: FileText, group: 'Profil' },
  { id: 'membership-dashboard' as any, label: 'Control Center', icon: Crown, group: 'Keanggotaan' },
  { id: 'membership-card', label: 'Kartu Anggota', icon: CreditCard, group: 'Keanggotaan' },
  { id: 'membership-progress', label: 'Kemajuan & Benefit', icon: TrendingUp, group: 'Keanggotaan' },
  { id: 'rentals', label: 'Riwayat Sewa', icon: Clock, group: 'Aktivitas' },
  { id: 'favorites', label: 'Motor Favorit', icon: Heart, group: 'Aktivitas' },
  { id: 'reviews', label: 'Ulasan Saya', icon: Star, group: 'Aktivitas' },
  { id: 'notifications', label: 'Notifikasi', icon: Bell, group: 'Pengaturan' },
  { id: 'security', label: 'Keamanan', icon: Shield, group: 'Pengaturan' },
  { id: 'payment', label: 'Metode Pembayaran', icon: Wallet, group: 'Pengaturan' },
  { id: 'loyalty', label: 'Loyalitas & Poin', icon: Gift, group: 'Pengaturan' },
  { id: 'preferences', label: 'Preferensi', icon: Settings, group: 'Pengaturan' },
];

// ─── Membership Benefits ──────────────────────────────────────────────────────
export const TIER_BENEFITS = {
  default: [
    { label: 'Akses pemesanan standar', unlocked: true },
    { label: 'Diskon sewa 0%', unlocked: true },
    { label: 'Dukungan email', unlocked: true },
    { label: 'Prioritas pemesanan', unlocked: false },
    { label: 'Diskon sewa (5%+)', unlocked: false },
    { label: 'Gratis pengiriman', unlocked: false },
    { label: 'Jaminan asuransi', unlocked: false },
    { label: 'Akses superbike eksklusif', unlocked: false },
  ],
  bronze: [
    { label: 'Akses pemesanan standar', unlocked: true },
    { label: 'Diskon sewa 5%', unlocked: true },
    { label: 'Dukungan email & chat', unlocked: true },
    { label: 'Prioritas pemesanan', unlocked: true },
    { label: 'Jaminan asuransi dasar', unlocked: true },
    { label: 'Gratis pengiriman', unlocked: false },
    { label: 'Asuransi premium', unlocked: false },
    { label: 'Akses superbike eksklusif', unlocked: false },
  ],
  silver: [
    { label: 'Akses pemesanan standar', unlocked: true },
    { label: 'Diskon sewa 10%', unlocked: true },
    { label: 'Dukungan prioritas 24/7', unlocked: true },
    { label: 'Prioritas pemesanan', unlocked: true },
    { label: 'Jaminan asuransi penuh', unlocked: true },
    { label: '1x gratis pengiriman/bulan', unlocked: true },
    { label: 'Akses superbike eksklusif', unlocked: false },
    { label: 'Undangan acara VIP', unlocked: false },
  ],
  gold: [
    { label: 'Akses pemesanan standar', unlocked: true },
    { label: 'Diskon sewa 20%', unlocked: true },
    { label: 'Layanan concierge khusus', unlocked: true },
    { label: 'Prioritas pemesanan', unlocked: true },
    { label: 'Jaminan asuransi premium', unlocked: true },
    { label: 'Gratis pengiriman tanpa batas', unlocked: true },
    { label: 'Akses superbike eksklusif', unlocked: true },
    { label: 'Undangan acara VIP', unlocked: true },
  ],
  elite: [
    { label: 'Semua keuntungan Gold', unlocked: true },
    { label: 'Diskon sewa 25%', unlocked: true },
    { label: 'Layanan concierge pribadi', unlocked: true },
    { label: 'Akses pertama untuk motor baru', unlocked: true },
    { label: 'Perlengkapan berkendara gratis', unlocked: true },
    { label: 'Gratis pengiriman tanpa batas', unlocked: true },
    { label: 'Akses superbike eksklusif', unlocked: true },
    { label: 'Akses hari trek pribadi', unlocked: true },
  ],
};

// ─── Bikes Data ───────────────────────────────────────────────────────────────
export const BIKES_DATA: Record<number, { name: string; brand: string; price: number; image: string; rating: number }> = {
  1: { name: 'Ducati Panigale V4S', brand: 'Ducati', price: 1850000, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop', rating: 4.9 },
  2: { name: 'BMW S1000RR', brand: 'BMW', price: 1650000, image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&auto=format&fit=crop', rating: 4.8 },
  3: { name: 'Kawasaki Ninja H2', brand: 'Kawasaki', price: 2200000, image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&auto=format&fit=crop', rating: 4.9 },
  4: { name: 'Yamaha R1M', brand: 'Yamaha', price: 1750000, image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400&auto=format&fit=crop', rating: 4.7 },
  5: { name: 'Honda CBR1000RR-R', brand: 'Honda', price: 1500000, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop', rating: 4.6 },
  6: { name: 'Aprilia RSV4', brand: 'Aprilia', price: 1900000, image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&auto=format&fit=crop', rating: 4.8 },
};

// ─── Mock Vouchers ────────────────────────────────────────────────────────────
export const MOCK_VOUCHERS = [
  { id: 'v1', code: 'RIDEVAULT10', discount: '10%', description: 'Diskon berkendara akhir pekan', expiresAt: '2026-08-31', used: false },
  { id: 'v2', code: 'FIRSTRIDE50K', discount: 'Rp 50.000', description: 'Cashback pemesanan pertama', expiresAt: '2026-07-31', used: false },
  { id: 'v3', code: 'LOYALRIDER', discount: '15%', description: 'Eksklusif anggota loyalitas', expiresAt: '2026-09-15', used: true },
];
