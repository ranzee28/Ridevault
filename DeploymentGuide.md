# Panduan Deployment Lengkap: RideVault 🚀

Dokumen ini menjelaskan langkah-langkah detail untuk melakukan *deployment* platform RideVault ke lingkungan produksi. Proyek ini terdiri dari dua bagian utama yang harus dideploy:
1. **Backend & Database**: Menggunakan **Supabase** (PostgreSQL, Storage, & Edge Functions).
2. **Frontend Web App**: Menggunakan **Vercel** (Hosting React SPA).

---

## Bagian 1: Deployment Backend (Supabase)

Sebelum frontend dideploy, Anda harus memastikan basis data dan serverless functions di Supabase sudah siap dan aktif.

### 1. Inisialisasi Database (PostgreSQL)
1. Masuk ke **Supabase Dashboard** Anda.
2. Pilih project Anda (`gfgkgrkadlhevuqqdnkt`).
3. Buka menu **SQL Editor** di panel sebelah kiri.
4. Klik **New query** (Query baru).
5. Buka file lokal [supabase-migrations.sql](file:///c:/_Collage/Rozin/SMT04/IMK/ridevault/supabase-migrations.sql) di text editor Anda, salin (*copy*) seluruh isinya, lalu tempel (*paste*) ke SQL Editor Supabase.
6. Klik tombol **Run** (Jalankan). Langkah ini akan membuat seluruh tabel, pemicu (*triggers*), fungsi, dan kebijakan keamanan RLS.

### 2. Setel Secret API Key Xendit
Supabase Edge Function memerlukan API Key rahasia Xendit untuk membuat invoice.
1. Jalankan perintah berikut di terminal komputer lokal Anda (pastikan Anda sudah login ke Supabase CLI via `npx supabase login`):
   ```bash
   npx supabase secrets set XENDIT_SECRET_KEY=isi_secret_key_xendit_asli
   ```
2. *Alternatif*: Anda juga dapat memasukkannya langsung via Dashboard Supabase di menu **Project Settings** > **Edge Functions** > **Secrets** > klik **Add Secret** (Nama: `XENDIT_SECRET_KEY`, Value: API Secret Key Xendit Anda).

### 3. Deploy Edge Function (`create-xendit-invoice`)
Jalankan perintah berikut di terminal root proyek Anda untuk mengunggah fungsi backend:
```bash
npx supabase functions deploy create-xendit-invoice --no-verify-jwt
```
Setelah berhasil, fungsi tersebut akan muncul di menu **Edge Functions** pada dashboard Supabase Anda dengan status aktif.

### 4. Setup Storage Bucket (Foto Profil & Dokumen)
Skema migrasi sudah otomatis mengaktifkan bucket `profile-photos` (publik) dan `user-documents` (privat). Jika file tidak dapat diunggah:
1. Buka menu **Storage** di dashboard Supabase.
2. Pastikan terdapat bucket bernama `profile-photos` dengan setelan **Public** diaktifkan.
3. Pastikan terdapat bucket bernama `user-documents` dengan setelan **Private** (Public dinonaktifkan).

---

## Bagian 2: Deployment Frontend (Vercel)

### 1. Push Kode ke GitHub
Pastikan semua perubahan terbaru (termasuk berkas `vercel.json` dan folder `supabase`) sudah di-commit dan di-push ke repositori GitHub Anda:
```bash
git add .
git commit -m "feat: pre-deployment security updates and reorganizing"
git push origin main
```

### 2. Hubungkan Repositori ke Vercel
1. Masuk ke **Vercel Dashboard** (https://vercel.com) menggunakan akun GitHub Anda.
2. Klik **Add New** > **Project**.
3. Pilih repositori GitHub `ridevault` Anda, lalu klik **Import**.

### 3. Konfigurasi Environment Variables di Vercel
Pada bagian **Environment Variables** sebelum menekan tombol Deploy, masukkan variabel berikut:

| Key | Value | Keterangan |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://gfgkgrkadlhevuqqdnkt.supabase.co` | URL API Supabase Anda |
| `VITE_SUPABASE_ANON_KEY` | *isi_anon_key_supabase_anda* | Anon Key proyek Supabase Anda |
| `VITE_XENDIT_PUBLIC_KEY` | *isi_public_key_xendit_anda* | Public Key Xendit (dimulai dengan `xnd_public_...`) |

> [!WARNING]
> Jangan masukkan `XENDIT_SECRET_KEY` di Vercel! Key rahasia tersebut hanya boleh disimpan di Supabase Edge Functions demi keamanan.

### 4. Deploy!
1. Klik tombol **Deploy** di Vercel.
2. Tunggu proses build selesai (biasanya sekitar 1-2 menit).
3. Vercel akan memberikan Anda URL domain produksi (misal `https://ridevault.vercel.app`).

---

## Bagian 3: Pengujian Pasca Deploy (Go-Live)

1. **Uji Akses Halaman**: 
   * Buka website Anda yang sudah dideploy di Vercel. 
   * Coba buka halaman `/collection` lalu **refresh browser**. Pastikan halaman tidak error 404 (sudah ditangani oleh `vercel.json`).
2. **Uji Login & Proteksi Admin**:
   * Coba masuk ke rute `/admin` secara langsung. Sistem harus melempar Anda kembali ke halaman `/login`.
   * Daftarkan akun baru, tingkatkan rolenya menjadi `'admin'` via SQL Editor Supabase, lalu coba login dari tab **ADMIN** pada website. Pastikan Anda berhasil masuk ke Dashboard Admin.
3. **Uji Transaksi Sewa (Pembayaran)**:
   * Pilih unit motor, lengkapi formulir reservasi, lalu konfirmasi pembayaran.
   * Pastikan Anda berhasil diarahkan secara otomatis ke halaman invoice Xendit resmi dan dialihkan kembali ke layar konfirmasi sukses setelah simulasi bayar dilakukan.
