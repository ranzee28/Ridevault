# Ringkasan Spesifikasi Produk: RideVault

Dokumen ini berisi rangkuman fitur, spesifikasi teknis, serta kemajuan implementasi dari platform RideVault.

---

## 1. Gambaran Umum & Target Pengguna
**RideVault** adalah platform penyewaan sepeda motor premium dan moge (superbike) eksklusif di Bali. Platform ini dirancang untuk:
* **Pengendara Moge Antusias**: Pengendara berpengalaman yang ingin memacu performa superbike di Bali.
* **Wisatawan VIP**: Turis elit yang menginginkan kenyamanan dan gaya berkendara premium selama liburan.
* **Kreator Konten**: Fotografer atau influencer yang membutuhkan moge estetis untuk properti foto/video.

---

## 2. Fitur yang Telah Diimplementasikan

### 2.1. Beranda (Landing Page) & Showcase
* **Visual Cinematic**: Tampilan gelap mewah (*dark mode*) dengan efek *glassmorphism*.
* **Showcase Slider**: Komponen korsel sinematik interaktif untuk menggeser moge unggulan lengkap dengan status ketersediaan unit.
* **Scroll Indicator**: Animasi memantul (*bounce indicator*) yang memandu pengguna secara visual ke konten bagian bawah.

### 2.2. Modal Spesifikasi Detail
* Klik nama/info motor untuk memicu modal spesifikasi teknis mendalam (*Top Speed*, torsi, mesin, suspensi, berat) serta galeri multi-angle unit motor dari berbagai sudut pandang.

### 2.3. Fitur Komparasi Berdampingan
* Memilih hingga 2 moge dan membandingkan parameter mesin, daya (*power*), torsi, harga, dan ketersediaannya secara langsung berdampingan.

### 2.4. Sistem Garasi Favorit (Favorites)
* Tombol hati merah untuk menyimpan daftar motor favorit secara lokal (`localStorage`) dan disinkronkan ke cloud via Supabase.

### 2.5. Halaman Koleksi Lengkap (`/collection`)
* Halaman pencarian dinamis, menu filter berdasarkan pabrikan (Ducati, BMW, Kawasaki, Triumph, dll), filter status ketersediaan unit, serta pengurutan berdasarkan harga dan performa.

### 2.6. Autentikasi Pengguna & Portal Klien
* Sistem login/daftar email dan Google SSO yang terintegrasi dengan **Supabase Auth**.
* Portal profil pribadi yang menampilkan riwayat sewa (*Rentals*), tingkat keanggotaan (*Membership Tier*), preferensi notifikasi, dan pengelolaan metode pembayaran.

### 2.7. Dasbor Admin (Admin Dashboard)
* Rute aman `/admin` yang hanya bisa diakses oleh akun admin. Berisi statistik ringkasan pendapatan, manajemen persetujuan/penyelesaian booking, dan pengontrolan status armada.

### 2.8. Reservasi Multi-Langkah & Integrasi Xendit
* Wizard pemesanan motor 8 langkah (jadwal sewa via kalender, pilihan pickup/delivery, unggah SIM/KTP, pilihan add-on gear, konfirmasi tarif, integrasi invoice Xendit aman via Supabase Edge Functions, dan layar konfirmasi status).

---

## 3. Spesifikasi Teknis & Stack

* **Frontend**: React 19, Vite 6, TypeScript, Tailwind CSS v4.
* **Animasi & Ikon**: Framer Motion & Lucide Icons.
* **Backend**: Supabase (Database PostgreSQL, Realtime Subscriptions, Edge Functions untuk payment gateway secure).
* **Payment Gateway**: Xendit (Invoicing API).

---

## 4. Kemajuan Implementasi & Roadmap

1. **Fase 1 (Selesai)**: Tampilan visual beranda, pameran moge slider, filter koleksi, dan garasi favorit lokal.
2. **Fase 2 (Selesai)**: Migrasi backend ke Supabase, integrasi login & register user, dasbor admin terproteksi, dan sinkronisasi realtime database.
3. **Fase 3 (Selesai)**: Integrasi pembayaran online Xendit via Edge Functions (bebas kebocoran private key), integrasi kalender sewa interaktif, wizard checkout 8 langkah, dan verifikasi dokumen berkendara.
