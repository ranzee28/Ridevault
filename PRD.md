# Dokumen Persyaratan Produk (Product Requirement Document - PRD)
## Nama Proyek: RideVault (Platform Sewa Motor Premium)
**Versi:** 1.0  
**Penulis:** Rozin - vibecoding & Antigravity AI  

---

## 1. Ringkasan Eksekutif & Gambaran Produk
**RideVault** adalah platform digital eksklusif penyewaan sepeda motor premium dan mewah (superbike/moge) yang didedikasikan untuk melayani para antusias berkendara, wisatawan elit, dan kreator konten di Bali. Platform ini tidak hanya menyewakan kendaraan, tetapi juga merancang pengalaman petualangan mewah dengan integrasi teknologi modern, kemudahan pencarian armada terkurasi, pemesanan instan, serta program keanggotaan (membership) bertingkat yang menawarkan berbagai keuntungan VIP.

---

## 2. Analisis Target Pengguna & Persona

### 2.1. Target Audiens Utama
1. **Riders & Motor Enthusiasts:** Pengendara berpengalaman yang memiliki lisensi mengemudi motor besar dan ingin merasakan performa superbike terkemuka di rute-rute menantang di Bali.
2. **Wisatawan Elit/VIP:** Individu dengan daya beli tinggi yang mencari pengalaman liburan premium dan ingin mengeksplorasi Bali secara eksklusif dan bergaya.
3. **Kreator Konten & Fotografer:** Profesional yang membutuhkan kendaraan mewah dengan nilai estetika tinggi sebagai properti pemotretan, video sinematik, atau ulasan otomotif.

### 2.2. Persona Pengguna
* **Persona A: "Rider Adrenalin" (Budi, 34 tahun, Pengusaha)**
  * *Tujuan:* Mencari performa terbaik dari Kawasaki H2 atau Ducati Panigale V4 R untuk dikendarai di akhir pekan.
  * *Kebutuhan:* Ketersediaan unit terjamin, perlengkapan keselamatan premium (helm Arai, jaket Dainese), asuransi komprehensif, dan asistensi darurat 24/7.
* **Persona B: "Content Creator" (Sarah, 27 tahun, Influencer)**
  * *Tujuan:* Menyewa motor bergaya klasik/retro seperti Triumph Bonneville T120 untuk kebutuhan photoshoot di daerah Canggu.
  * *Kebutuhan:* Pemesanan instan, opsi pengantaran unit (towing) langsung ke lokasi vila, dan sistem pembayaran yang transparan.

---

## 3. Ruang Lingkup Fungsional & Kebutuhan Fitur

### 3.1. Halaman Utama (Landing Page) & Pameran (Showcase)
* **Hero Section Sinematik:**
  * Menampilkan background berkualitas tinggi dengan animasi visual yang mewah dan premium.
  * Teks utama ("Berkendara Tanpa Batas") yang didukung oleh transisi halus menggunakan Framer Motion (`motion/react`).
  * **Animated Scroll Indicator:** Petunjuk visual memantul (bounce animation) di bagian bawah yang memandu pengguna secara intuitif untuk menggulir halaman ke bawah.
* **Featured Showcase Slider:**
  * Slider interaktif yang menampilkan sepeda motor unggulan (seperti Ducati Panigale V4 R, Kawasaki Ninja H2, dsb.).
  * Mendukung swipe gesture dan navigasi tombol panah kiri/kanan.
  * Dilengkapi tombol "Lihat Semua Koleksi" yang mengarahkan pengguna secara langsung ke halaman `/collection`.

### 3.2. Spesifikasi Detail Motor (Modal Interaktif)
* Pengguna dapat mengklik kartu motor atau ikon "Info" untuk memicu **Modal Detail Motor** dalam mode layar penuh (fullscreen overlay).
* **Konten Modal Detail:**
  * **Informasi Standar:** Merek, Model, Jenis Mesin, Tenaga Maksimum (Horsepower), Harga Sewa per Hari (dalam IDR), dan Status Ketersediaan (`Available` / `Reserved`).
  * **Spesifikasi Teknis Mendalam:** Kecepatan Maksimum (*Top Speed*), Torsi, Sistem Suspensi Depan/Belakang, dan Berat Kendaraan (*Curb/Dry Weight*).
  * **Galeri Gambar Multi-Angle:** Menampilkan korsel mini berisi tiga gambar detail tambahan untuk melihat komponen motor dari dekat (mesin, kokpit, knalpot).
  * **Tombol Tindakan:** Tombol "Pesan Sekarang" (Reserve) dan toggle "Tambah ke Favorit".

### 3.3. Sistem Perbandingan Motor (Side-by-Side Comparison)
* **Floating Comparison Bar:**
  * Muncul di bagian bawah layar secara dinamis saat pengguna mulai memilih motor untuk dibandingkan.
  * Menunjukkan indikator jumlah motor yang dipilih (maksimal 2 motor, format: `(1/2)` atau `(2/2)`).
* **Modal Perbandingan Berdampingan:**
  * Dipicu setelah pengguna memilih 2 motor dan menekan tombol "Bandingkan".
  * Menampilkan tabel komparasi parameter teknis secara berdampingan.

### 3.4. Sistem Garasi Favorit (Favorites System)
* Tombol berbentuk hati yang tersedia di setiap kartu motor dan di dalam detail modal.
* **Persistensi Data:** Menggunakan `localStorage` dan tabel database `favorite_bikes` di Supabase untuk menyinkronkan daftar motor favorit pengguna, memastikan data tetap ada meskipun berganti perangkat.

### 3.5. Halaman Koleksi Lengkap (`/collection`)
* Navigasi multi-halaman yang ditangani oleh `react-router-dom` menuju path `/collection`.
* **Grid Responsif:** Menyajikan seluruh armada motor dalam tata letak kartu yang adaptif.
* **Pencarian Dinamis:** Input teks untuk menyaring motor berdasarkan merek atau model secara real-time.
* **Filter & Sorting Lanjutan:**
  * **Filter Merek:** Ducati, Kawasaki, Yamaha, BMW, Triumph, Honda, Harley-Davidson.
  * **Filter Status:** Ketersediaan unit (`Available` vs `Reserved`).
  * **Pengurutan (Sorting):** Berdasarkan Harga Terendah-Tertinggi, Harga Tertinggi-Terendah, dan Tenaga Mesin Terbesar.

### 3.6. Sistem Autentikasi Pengguna & Portal Klien
* Dukungan autentikasi berbasis **Supabase Authentication** (Email & Password, serta Google Sign-In).
* **Portal Klien:**
  * Menu Navigasi Profil yang menampilkan: Profil Saya, Reservasi Saya, Garasi Favorit, Pengaturan, dan Membership.
  * **Tier Membership:** Menampilkan tier keanggotaan pengguna saat ini (`Default`, `Bronze`, `Silver`, `Gold`, `Elite`) lengkap dengan progress bar pencapaian tier selanjutnya.

### 3.7. Dasbor Admin (Admin Dashboard)
* Akses terbatas hanya untuk akun dengan peran `role: 'admin'` melalui route guard `AdminRoute`.
* **Fitur Utama Admin:**
  * Panel ringkasan statistik (Pendapatan Total, Jumlah Transaksi, Total Unit Motor, Pengguna Aktif).
  * Manajemen Transaksi Reservasi: Daftar booking masuk dengan opsi persetujuan/pembatalan status (`Pending`, `Confirmed`, `Completed`, `Cancelled`).
  * Manajemen Ketersediaan Unit: Mengatur status ketersediaan motor secara real-time yang langsung berdampak pada halaman koleksi pengguna.

### 3.8. Lokalisasi Bahasa (Localization Context)
* Mendukung penuh lokalisasi bahasa, saat ini difokuskan pada bahasa Indonesia (**ID**) untuk memenuhi pasar domestik premium Bali, dengan struktur data terjemahan yang siap diekspansi ke multi-bahasa (ID/EN) di masa depan.

---

## 4. Struktur Data & Skema Supabase PostgreSQL

Data disimpan di database Supabase PostgreSQL dengan pengamanan Row Level Security (RLS) di sisi server:

### 4.1. Tabel `public.users`
Menyimpan data profil pengguna dan status keanggotaannya:
```json
{
  "id": "uuid (Primary Key, References auth.users.id)",
  "name": "text",
  "email": "text",
  "role": "text ('user' | 'admin')",
  "tier": "text ('default' | 'bronze' | 'silver' | 'gold' | 'elite')",
  "loyalty_points": "integer",
  "membership_status": "text ('active' | 'inactive')",
  "created_at": "timestamptz",
  "photo_url": "text"
}
```

### 4.2. Tabel `public.bookings`
Menyimpan log transaksi pemesanan sewa motor:
```json
{
  "id": "text (Primary Key)",
  "user_id": "uuid (References auth.users.id)",
  "user_name": "text (Denormalized)",
  "bike_id": "integer",
  "bike_name": "text (Denormalized)",
  "start_date": "text (YYYY-MM-DD)",
  "end_date": "text (YYYY-MM-DD)",
  "status": "text ('Pending' | 'Confirmed' | 'Completed' | 'Cancelled')",
  "total": "numeric",
  "payment_status": "text ('pending' | 'paid' | 'expired')",
  "pickup_method": "text ('showroom' | 'delivery')",
  "pickup_address": "text",
  "pickup_pin": "text",
  "created_at": "timestamptz"
}
```

---

## 5. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Desain Visual & Estetika Premium:**
   * Wajib menerapkan skema warna gelap (*sleek dark mode*) dengan aksen warna HSL yang harmonis (seperti emas metalik, merah Ducati, dan abu-abu arang).
   * Menghindari komponen bawaan HTML polos; seluruh tombol, input, dan modal harus dirancang khusus dengan efek *glassmorphism*.
   * Tipografi premium menggunakan font modern (*Outfit* dan *Plus Jakarta Sans* dari Google Fonts).
2. **Kinerja & Responsivitas:**
   * Kecepatan muat halaman awal di bawah 2 detik pada koneksi 4G standar.
   * Frame rate animasi minimal 60fps untuk seluruh transisi halaman.
   * Responsif penuh dari resolusi mobile 320px hingga desktop ultra-wide 1920px+.
3. **Keamanan Data:**
   * Aturan RLS diaktifkan secara ketat:
     * Pengguna hanya bisa membaca dan menulis data reservasi milik mereka sendiri.
     * Admin memiliki hak penuh untuk membaca dan memperbarui data seluruh pengguna.
     * API Key Xendit (Secret Key) tidak boleh terekspos di frontend, melainkan dieksekusi melalui Supabase Edge Functions.

---

## 6. Kriteria Penerimaan (Acceptance Criteria)

### Fitur Perbandingan Motor (Side-by-Side Comparison)
* **Skenario:** Menambahkan motor ke perbandingan
  * **Given** Pengguna berada di halaman Koleksi `/collection`.
  * **When** Pengguna mengklik tombol "Bandingkan" pada kartu motor pertama.
  * **Then** Floating bar di bagian bawah muncul dengan status `Bandingkan (1/2)`.
  * **When** Pengguna mengklik tombol "Bandingkan" pada kartu motor kedua.
  * **Then** Floating bar berubah status menjadi `Lihat Perbandingan (2/2)`.

### Fitur Autentikasi & Reservasi
* **Skenario:** Pengguna melakukan pemesanan tanpa login
  * **Given** Pengguna belum masuk ke akunnya.
  * **When** Pengguna mengklik tombol "Pesan" (Reserve) pada detail motor.
  * **Then** Sistem secara otomatis mengarahkan pengguna ke halaman `/login` dengan pemberitahuan bahwa otorisasi diperlukan.

---

## 7. Rencana Peningkatan Masa Depan (Product Roadmap)

1. **Fase 1 (Selesai):** Pembuatan UI/UX Pameran Motor, Sistem Favorit Lokal, Filter & Sortir Koleksi.
2. **Fase 2 (Selesai):** Migrasi Backend ke Supabase (Database PostgreSQL, Realtime Subscriptions, Supabase Auth), Dashboard Admin untuk manajemen reservasi.
3. **Fase 3 (Selesai):**
   * **Xendit Payment Gateway**: Integrasi invoice Xendit yang aman di sisi server menggunakan Supabase Edge Functions.
   * **Kalender Reservasi Interaktif**: Pemilihan tanggal dinamis dan penghitungan tarif sewa otomatis di dalam wizard reservasi 8 langkah.
   * **Multi-Step Checkout Flow**: Integrasi add-on berkendara, pemilihan lokasi penjemputan, dan verifikasi dokumen legal (KTP/SIM) sebelum checkout.
