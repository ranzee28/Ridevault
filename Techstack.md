# Panduan Teknologi Stack (Tech Stack Guide)
## Nama Proyek: RideVault (Platform Sewa Motor Premium)
**Status Dokumen:** Approved / Baselined  
**Versi:** 1.0  
**Tanggal:** 8 Juli 2026  
**Penulis:** Rozin - vibecoding & Antigravity AI  

---

## 1. Gambaran Umum Stack Teknologi

RideVault menggunakan teknologi web modern modern yang berfokus pada kecepatan muat halaman, estetika desain premium dengan animasi halus, ketikan aman (*type-safe*) dengan TypeScript, serta kehandalan penyimpanan awan instan (*real-time serverless backend*) menggunakan Firebase.

---

## 2. Frontend Framework & Bahasa Pemrograman

### 2.1. React 19.0.0 (dengan Vite 6.2.0)
* **Peran:** Library UI utama untuk membangun antarmuka deklaratif berbasis komponen.
* **Alasan Penggunaan:** React 19 menawarkan optimalisasi performa rendering, integrasi TypeScript yang matang, serta ekosistem library pendukung yang luas.
* **Vite 6:** Digunakan sebagai bundler dan server pengembangan lokal supercepat menggunakan ESM native untuk HMR (Hot Module Replacement) instan.

### 2.2. TypeScript (TypeScript ~5.8.2)
* **Peran:** Superset Javascript untuk menambahkan sistem pengetikan statis (*strong static typing*).
* **Alasan Penggunaan:** Mengurangi *bug runtime* saat bertukar data dengan Firebase, menyediakan auto-complete yang cerdas di editor (VS Code), serta menjaga skalabilitas kode dalam jangka panjang.

---

## 3. Desain, Animasi, & Ikonografi

### 3.1. Tailwind CSS v4 (TailwindCSS v4.1.14 & @tailwindcss/vite)
* **Peran:** Kerangka kerja CSS berbasis utilitas (*utility-first*) untuk mempercepat pembuatan styling halaman.
* **Alasan Penggunaan:** Versi 4 menggunakan compiler CSS baru yang jauh lebih cepat, mendukung integrasi langsung di tingkat Vite, dan memiliki setup konfigurasi yang lebih bersih tanpa memerlukan file `tailwind.config.js` yang rumit.

### 3.2. Framer Motion / Motion v12 (motion/react 12.23.24)
* **Peran:** Perpustakaan animasi deklaratif untuk React.
* **Alasan Penggunaan:** Digunakan untuk memicu transisi rute halaman, scroll effects, preloader, interaksi spring modal, serta floating bar comparison agar terlihat hidup dan premium.

### 3.3. Lucide React (lucide-react 0.546.0)
* **Peran:** Set ikon vektor SVG yang modern, ringan, dan konsisten.
* **Alasan Penggunaan:** Mendukung modular tree-shaking (hanya memaketkan ikon yang digunakan saja) untuk meminimalkan ukuran bundle akhir JavaScript.

---

## 4. Sistem Manajemen Rute & State

### 4.1. React Router DOM v7 (react-router-dom 7.15.0)
* **Peran:** Menangani routing di client-side (Single Page Application).
* **Alasan Penggunaan:** Mengelola navigasi mulus antar rute utama (`/` Beranda, `/collection` Koleksi, `/login` Portal Autentikasi, `/admin` Panel Manajemen) dengan dukungan *lazy loading* dan scroll restoration.

### 4.2. React Context API
* **Peran:** Penyimpanan status global (*Global State Management*).
* **Penggunaan:**
  * **AuthContext:** Menyimpan data pengguna login Firebase, profil Firestore, status loading, dan sinkronisasi garasi favorit.
  * **BikeContext:** Menyediakan data statis motor, status ketersediaan, serta penanganan error koneksi.
  * **LanguageContext:** Menyimpan status bahasa saat ini (saat ini ID) untuk rendering string terjemahan secara dinamis.

---

## 5. Backend Serverless (Firebase Services)

### 5.1. Firebase Authentication (Firebase v12.15.0 SDK)
* **Peran:** Sistem otentikasi pengguna secara aman.
* **Metode:** Email/Password serta OAuth Google Sign-In untuk login cepat.

### 5.2. Cloud Firestore
* **Peran:** Database NoSQL berbasis dokumen cloud real-time.
* **Penggunaan:** Menyimpan data `/users` (profil user) dan `/bookings` (transaksi pemesanan).

---

## 6. Ringkasan Versi Dependensi (`package.json`)

| Dependensi Utama | Versi Terpasang |
| :--- | :--- |
| **react** | `^19.0.0` |
| **react-dom** | `^19.0.0` |
| **react-router-dom** | `^7.15.0` |
| **typescript** | `~5.8.2` |
| **vite** | `^6.2.0` |
| **tailwindcss** | `^4.1.14` |
| **motion/react** | `^12.23.24` |
| **firebase** | `^12.15.0` |
| **lucide-react** | `^0.546.0` |
