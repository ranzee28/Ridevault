# Dokumentasi Struktur File & Tata Letak Komponen RideVault

Dokumen ini mendokumentasikan struktur folder dan file proyek RideVault setelah dilakukan reorganisasi dan pembersihan komponen. Reorganisasi ini bertujuan untuk merapikan kode, memisahkan logika layout global dari komponen UI/Modal spesifik, dan mempermudah pemeliharaan sistem.

---

## 📂 Peta Direktori Utama

```
ridevault/
├── dist/                          # Hasil build produksi statis (HTML/JS/CSS)
├── node_modules/                  # Dependensi modul npm
├── supabase/                      # Konfigurasi dan kode Edge Functions
│   └── functions/
│       └── create-xendit-invoice/ # Serverless function pemroses invoice Xendit (Deno)
│           └── index.ts
├── src/                           # Source code utama aplikasi
│   ├── components/                # Komponen antarmuka yang dapat digunakan kembali
│   │   ├── admin/                 # Sub-komponen khusus panel admin (Fleet, Bookings, Users, dll)
│   │   ├── collection/            # Komponen halaman Koleksi (Grid, BikeCard, dll)
│   │   ├── home/                  # Komponen halaman Landing/Home (Hero, ShowcaseSlider, dll)
│   │   ├── layout/                # Komponen layout global dan navigasi
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProfileDropdown.tsx
│   │   │   ├── ScrollToTop.tsx
│   │   │   ├── ScrollToTopButton.tsx
│   │   │   └── layout-preloader.tsx
│   │   └── ui/                    # Komponen visual dasar dan dialog modal interaktif
│   │       ├── BikeDetailsModal.tsx
│   │       ├── CompareModal.tsx
│   │       └── lamp.tsx
│   ├── contexts/                  # React Context untuk pengelolaan Global State
│   │   ├── AuthContext.tsx        # Otentikasi Supabase, sinkronisasi profil, foto, & favorit
│   │   ├── BikeContext.tsx        # Manajer inventaris motor dan sinkronisasi database
│   │   ├── LanguageContext.tsx    # Manajemen terjemahan (ID/EN)
│   │   └── translations.ts        # Kamus terjemahan bahasa
│   ├── data/                      # Data statis cadangan (armada motor default)
│   │   └── bikes.ts
│   ├── hooks/                     # Custom React Hooks
│   ├── lib/                       # Integrasi SDK pihak ketiga (Supabase, API Membership)
│   │   ├── loyalty.ts
│   │   ├── membershipApi.ts
│   │   ├── supabase-types.ts
│   │   └── supabase.ts
│   ├── pages/                     # Komponen halaman utama (Routed Pages)
│   │   ├── Profile/               # Portal keanggotaan terkelompok
│   │   ├── Reservation/           # Wizard pemesanan motor multi-langkah
│   │   ├── AdminDashboard.tsx     # Dashboard panel admin
│   │   ├── Collection.tsx         # Halaman pencarian & filter armada lengkap
│   │   ├── Home.tsx               # Landing Page utama
│   │   └── Login.tsx              # Portal masuk/daftar user & admin
│   ├── App.tsx                    # Rute navigasi utama dan inisialisasi layout
│   ├── index.css                  # Gaya CSS global (Tailwind v4 theme & animation)
│   └── main.tsx                   # Entry point inisialisasi React
├── .env                           # File konfigurasi lokal environment
├── DatabaseSchema.md              # Dokumentasi skema tabel database PostgreSQL
├── PRD.md                         # Product Requirement Document
├── README.md                      # Panduan instalasi dan deployment proyek
├── vercel.json                    # Konfigurasi SPA rewrite rule untuk Vercel
├── supabase-migrations.sql        # Migrasi penuh database dan aturan RLS
├── tsconfig.json                  # Konfigurasi compiler TypeScript
└── vite.config.ts                 # Konfigurasi bundler Vite
```

---

## 🛠️ Aturan Penempatan Komponen Baru

Untuk menjaga struktur file tetap rapi saat menambahkan fitur baru, ikuti pedoman berikut:

1. **Halaman Baru**: Tempatkan di bawah `src/pages/`. Jika halaman tersebut kompleks dan memiliki banyak sub-komponen internal (seperti Reservation atau Profile), buatkan sub-direktori khusus di bawah `src/pages/[NamaFitur]/` dengan file utama bernama `index.tsx`.
2. **Layout Global**: Komponen seperti navigasi, sidebar global, preloader, atau footer yang dirender di seluruh aplikasi wajib diletakkan di `src/components/layout/`.
3. **Modal & Dialog**: Seluruh dialog modal interaktif, tooltip besar, atau pop-up (seperti detail motor atau pembanding) wajib diletakkan di `src/components/ui/`.
4. **Komponen Halaman Spesifik**: Jika sebuah komponen hanya digunakan pada satu halaman tertentu (misalnya slide pameran di beranda atau kartu motor di koleksi), letakkan di folder komponen berdasar halaman tersebut (misal `src/components/home/` atau `src/components/collection/`).
