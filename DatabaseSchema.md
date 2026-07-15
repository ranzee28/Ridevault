# Skema Basis Data (Database Schema) — Supabase PostgreSQL
## Nama Proyek: RideVault (Platform Sewa Motor Premium)

RideVault menggunakan **Supabase PostgreSQL** sebagai sistem manajemen basis data relasional. Keamanan data diatur secara ketat menggunakan **Row Level Security (RLS)** di sisi server database, memastikan pengguna hanya dapat mengakses data hak milik mereka sendiri, sementara Administrator memiliki wewenang penuh.

---

## 1. Relasi Antar Tabel (Entity Relationship Summary)

```
             +-------------------------+
             |       auth.users        | (Supabase Auth)
             +-------------------------+
                          | (1 to 1)
                          v
             +-------------------------+
             |      public.users       | (Profiles & Tiers)
             +-------------------------+
              /     |     |     |     \
       (1 to M)    /      |     \      (1 to M)
          /       /       |      \        \
         v       v        v       v        v
    +----------+ +----------+ +-----------+ +---------------+
    | bookings | |documents | | vouchers  | |notifications  |
    +----------+ +----------+ +-----------+ +---------------+
         |
      (1 to M)
         v
    +----------+
    | transactions |
    +----------+
```

---

## 2. Struktur Tabel Core

### 2.1. Tabel `public.users`
Menyimpan data profil pengguna, tingkat keanggotaan (membership tier), dan data identitas pribadi. Terikat secara relasi 1-ke-1 dengan tabel `auth.users` bawaan Supabase.

| Nama Kolom | Tipe Data | Kriteria / Constraints | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, REFERENCES auth.users(id) | UID unik pengguna dari sistem autentikasi. |
| `name` | TEXT | NOT NULL | Nama lengkap pengguna. |
| `email` | TEXT | NOT NULL | Alamat email terdaftar. |
| `role` | TEXT | DEFAULT 'user' (user, admin) | Peran pengguna untuk otorisasi halaman. |
| `tier` | TEXT | DEFAULT 'default' (default, bronze, silver, gold, elite) | Kategori tingkat keanggotaan pengguna. |
| `username` | TEXT | NULL | Nama pengguna unik. |
| `phone` | TEXT | NULL | Nomor telepon aktif. |
| `date_of_birth`| DATE | NULL | Tanggal lahir untuk verifikasi usia. |
| `gender` | TEXT | NULL | Jenis kelamin. |
| `nationality` | TEXT | DEFAULT 'Indonesia' | Kewarganegaraan. |
| `address` | TEXT | NULL | Alamat tempat tinggal. |
| `emergency_contact`| TEXT | NULL | Nama kontak darurat. |
| `emergency_phone`| TEXT | NULL | Nomor telepon kontak darurat. |
| `loyalty_points`| INTEGER | DEFAULT 0, NOT NULL | Jumlah poin loyalitas terkumpul. |
| `membership_status`| TEXT | DEFAULT 'inactive' (active, inactive) | Status membership premium. |
| `membership_starts_at`| TIMESTAMPTZ| NULL | Waktu mulai membership premium. |
| `membership_expires_at`| TIMESTAMPTZ| NULL | Waktu berakhir membership premium. |
| `membership_id_number`| TEXT | NULL | Nomor kartu keanggotaan digital. |
| `photo_url` | TEXT | NULL | Tautan gambar profil (diunggah ke storage). |
| `favorites` | JSONB / ARRAY| DEFAULT '[]' | Kumpulan ID motor favorit cadangan. |
| `created_at` | TIMESTAMPTZ| DEFAULT NOW() | Waktu pembuatan akun. |
| `updated_at` | TIMESTAMPTZ| DEFAULT NOW() | Waktu modifikasi profil terakhir. |

---

### 2.2. Tabel `public.bookings`
Menyimpan transaksi pemesanan sewa motor.

| Nama Kolom | Tipe Data | Constraints | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | ID Booking unik (format: `RV-XXXXXX`). |
| `user_id` | UUID | REFERENCES auth.users(id) | UID penyewa. |
| `user_name` | TEXT | NOT NULL | Nama penyewa saat booking dibuat (denormalized). |
| `bike_id` | INTEGER | NOT NULL | Kunci asing ke ID motor di `bikes.ts`. |
| `bike_name` | TEXT | NOT NULL | Nama model motor (denormalized). |
| `start_date` | TEXT | NOT NULL (format: YYYY-MM-DD) | Tanggal awal sewa. |
| `end_date` | TEXT | NOT NULL (format: YYYY-MM-DD) | Tanggal pengembalian motor. |
| `status` | TEXT | DEFAULT 'Pending' (Pending, Confirmed, Completed, Cancelled) | Status perjalanan rental. |
| `total` | NUMERIC | NOT NULL | Total tarif rental setelah diskon dan pajak (IDR). |
| `pickup_method`| TEXT | DEFAULT 'showroom' (showroom, delivery) | Metode pengambilan unit motor. |
| `pickup_address`| TEXT | NULL | Alamat antar jika memilih metode delivery. |
| `pickup_time` | TEXT | DEFAULT '08:00' | Jam pengambilan motor. |
| `return_time` | TEXT | DEFAULT '08:00' | Jam pengembalian motor. |
| `addons` | JSONB | DEFAULT '[]' | Daftar perlengkapan tambahan yang dipesan. |
| `addon_total` | NUMERIC | DEFAULT 0 | Total tarif sewa perlengkapan tambahan. |
| `promo_code` | TEXT | NULL | Kode promo yang digunakan. |
| `promo_discount`| NUMERIC | DEFAULT 0 | Nominal potongan harga dari voucher. |
| `points_used` | INTEGER | DEFAULT 0 | Jumlah koin/poin loyalitas yang ditukar. |
| `points_earned`| INTEGER | DEFAULT 0 | Jumlah poin yang didapat dari rental ini. |
| `payment_method`| TEXT | DEFAULT 'kartu_kredit' | Pilihan metode bayar. |
| `payment_status`| TEXT | DEFAULT 'pending' (pending, paid, expired) | Status invoice pembayaran Xendit. |
| `pickup_pin` | TEXT | NOT NULL | PIN 6 digit unik untuk verifikasi penjemputan unit. |
| `deposit` | NUMERIC | DEFAULT 500000 | Deposit jaminan rental (IDR). |
| `pajak` | NUMERIC | DEFAULT 0 | Pajak PPN sewa (11%). |
| `tier_discount`| NUMERIC | DEFAULT 0 | Potongan harga berdasarkan tier membership (IDR). |
| `created_at` | TIMESTAMPTZ| DEFAULT NOW() | Waktu pembuatan transaksi. |

---

### 2.3. Tabel Pendukung Lainnya

1. **`public.documents`**: Menyimpan berkas persyaratan sewa (SIM C, KTP, foto selfie). Berkas fisik diunggah ke storage private `user-documents`.
2. **`public.promo_codes`**: Tabel master voucher diskon yang valid (misal `RIDEVAULT10`, `GOLDPASS`, dll).
3. **`public.payment_methods`**: Menyimpan tokenisasi kartu pembayaran user yang disimpan secara lokal.
4. **`public.notifications`**: Notifikasi sistem real-time (notif booking, promo, *reward*, dll).
5. **`public.vouchers`**: Kupon diskon personal milik user (misalnya voucher sambutan `WELCOME10%`).
6. **`public.loyalty_history`**: Log riwayat penambahan atau penukaran poin loyalitas user.
7. **`public.transactions`**: Log riwayat transaksi pembayaran tagihan (membership atau sewa).
8. **`public.membership_history`**: Log riwayat aktivasi dan perpanjangan keanggotaan premium.
9. **`public.favorite_bikes`**: Menyimpan motor-motor favorit yang ditandai user (alternatif sinkronisasi localStorage).

---

## 3. Aturan Keamanan (Row Level Security - RLS)

Aturan RLS diaktifkan pada semua tabel di Supabase untuk mengisolasi data:

* **Tabel `users`**:
  * Pengguna hanya bisa melihat, memperbarui, dan menghapus profil miliknya sendiri (`auth.uid() = id`).
  * Administrator dapat melihat profil seluruh pengguna (`public.is_admin(auth.uid())` bernilai `true`).
* **Tabel `bookings`**:
  * Pengguna hanya bisa mengakses transaksi rental miliknya sendiri (`auth.uid() = user_id`).
  * Admin memiliki akses baca/tulis penuh ke semua transaksi sewa (`public.is_admin(auth.uid())`).
* **Tabel `documents`**:
  * Bersifat privat penuh. Hanya pemilik dokumen yang dapat membaca/mengunggah berkasnya sendiri.
