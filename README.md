# RideVault 🏍️ — Premium Motorcycle Rental Platform

RideVault adalah platform penyewaan sepeda motor premium (superbike/moge) eksklusif yang dirancang untuk melayani para penggemar berkendara, wisatawan elit, dan kreator konten. Dibangun dengan desain premium gelap (*sleek dark mode*), micro-animation interaktif, dan integrasi backend modern.

---

## 🚀 Fitur Utama

1. **Cinematic Showcase Slider**: Galeri visual interaktif motor sport premium (seperti Ducati Panigale V4 R, Kawasaki H2, dll) dengan gesture geser (*swipe*) dan animasi mengambang.
2. **Detail Spesifikasi Mendalam**: Modal informasi spesifikasi lengkap sepeda motor (mesin, *power*, *top speed*, suspensi, torsi, berat) dan galeri multi-angle.
3. **Sistem Perbandingan Berdampingan**: Fitur membandingkan spesifikasi teknis dan harga sewa harian hingga 2 motor secara berdampingan.
4. **Garasi Favorit (Favorites)**: Menyimpan daftar motor favorit secara persisten di browser (`localStorage`) dan akun pengguna.
5. **Portal Klien & Tier Membership**: Program keanggotaan bertingkat (*Default*, *Bronze*, *Silver*, *Gold*, *Elite*) dengan benefit khusus, poin loyalitas, kupon, dan dasbor reservasi.
6. **Alur Reservasi Premium (Multi-Step Wizard)**: Pemilihan jadwal sewa via kalender interaktif, pemilihan metode penjemputan/pengantaran unit, verifikasi berkas (SIM & KTP), dan add-on berkendara premium.
7. **Integrasi Pembayaran Aman**: Integrasi invoicing online Xendit melalui Supabase Edge Functions untuk mencegah kebocoran *private key* di sisi klien.
8. **Portal Admin**: Dasbor eksklusif administrator untuk memantau ringkasan pendapatan, mengonfirmasi/menyelesaikan booking secara real-time, dan mengontrol ketersediaan armada.

---

## 🛠️ Tech Stack & Spesifikasi

* **Frontend**: React 19, TypeScript, Vite 6
* **Styling**: Tailwind CSS v4 (utilitas baru `@import "tailwindcss"` dan skema `@theme`)
* **Animasi**: Framer Motion (`motion/react`) & Lucide Icons
* **Backend & Auth**: Supabase (PostgreSQL, Realtime, Storage, Edge Functions)
* **Payment Gateway**: Xendit (Invoicing API)

---

## ⚙️ Persiapan Lingkungan & Konfigurasi

Buat file `.env` di direktori utama proyek Anda dan masukkan konfigurasi berikut:

```env
# Supabase Credentials
VITE_SUPABASE_URL=https://<id-project-supabase>.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Xendit API Public Key (digunakan di frontend sebagai referensi jika diperlukan)
VITE_XENDIT_PUBLIC_KEY=your_xendit_public_key
```

Di sisi server Supabase, pastikan Anda menyetel secret key Xendit Anda:
```bash
npx supabase secrets set XENDIT_SECRET_KEY=xnd_development_...
```

---

## 💻 Cara Menjalankan secara Lokal

1. **Instalasi Dependensi**:
   ```bash
   npm install
   ```

2. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

3. **Periksa Kesalahan Tipe data (Type-check)**:
   ```bash
   npm run lint
   ```

4. **Build untuk Produksi**:
   ```bash
   npm run build
   ```

---

## 🌐 Panduan Deploy Edge Functions (Supabase)

Fungsi pembayaran Xendit diproses secara aman di sisi server menggunakan Supabase Edge Functions.

1. **Login ke Akun Supabase Anda**:
   ```bash
   npx supabase login
   ```

2. **Hubungkan Folder Lokal ke Project Supabase**:
   ```bash
   npx supabase link --project-ref <id-project-supabase>
   ```

3. **Deploy Edge Function**:
   ```bash
   npx supabase functions deploy create-xendit-invoice --no-verify-jwt
   ```
