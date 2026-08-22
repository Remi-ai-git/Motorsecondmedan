# Aplikasi Laporan Keuangan Penjualan Sepeda Motor Bekas

Stack: **Node.js + Express** (backend REST API) · **PostgreSQL + Prisma ORM** (database) · **React** (frontend, tahap berikutnya).

Dokumen ini mencakup tiga hal yang diminta sebagai langkah pertama: skema database (ERD), arsitektur folder, dan kode Model + Migration.

> **Status database**: skema di bawah sudah di-inject langsung ke Supabase project **ArtaMotor** (ref `ugxhbuwgafzdtmhnjguh`), di dalam PostgreSQL schema **`akunting`**. Schema `public` pada project yang sama sengaja tidak disentuh karena sudah dipakai aplikasi lain (katalog motor/chatbot: tabel `motors`, `faqs`, `chat_sessions`, `chat_messages`). Lihat bagian 3 untuk detail.

---

## 1. Skema Database (ERD)

### Entitas dan Relasi

```
users                    motors                       pengeluaran_operasional
(login staff/admin)      (inventaris)                 (biaya showroom, berdiri sendiri)
                             │  1
                             │
                             │ N
                     biaya_perbaikan          motors 1───1 penjualan
                     (rincian servis/cat)     (transaksi jual, opsional selama motor belum laku)
```

- **Motor → BiayaPerbaikan**: one-to-many. Satu motor bisa punya banyak baris biaya perbaikan (servis, cat, ganti part, dll), bukan satu angka gabungan. Ini penting secara akuntansi: setiap pengeluaran punya tanggal dan deskripsi sendiri, sehingga bisa diaudit dan laporan laba/rugi per unit tetap akurat walau biaya perbaikan bertambah dari waktu ke waktu.
- **Motor → Penjualan**: one-to-one. Satu motor hanya laku satu kali. Selama belum ada baris `Penjualan`, motor berstatus `TERSEDIA`.
- **PengeluaranOperasional**: berdiri sendiri, tidak terikat ke motor tertentu — untuk sewa tempat, listrik, gaji, iklan, dll.
- **User**: disiapkan untuk fitur login (belum diimplementasi pada langkah ini).

### Tabel dan Tipe Data

**`motors`** — inventaris motor

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | primary key teknis |
| kode_motor | TEXT, unique | kode bisnis yang tampil ke user, mis. `MTR-2026-0001` |
| merek | TEXT | mis. Honda, Yamaha |
| tipe | TEXT | mis. Beat FI, NMAX |
| tahun_pembuatan | INTEGER | |
| plat_nomor | TEXT, unique | |
| no_rangka / no_mesin | TEXT, unique, nullable | opsional tapi disarankan untuk motor bekas |
| harga_beli | DECIMAL(15,2) | **Decimal, bukan Float** — hindari error pembulatan uang |
| tanggal_masuk | DATE | |
| status | ENUM(`TERSEDIA`,`TERJUAL`) | default `TERSEDIA` |
| keterangan | TEXT, nullable | catatan bebas |
| created_at / updated_at | TIMESTAMP | audit trail |

**`biaya_perbaikan`** — rincian biaya perbaikan per motor

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| motor_id | UUID (FK → motors.id) | `ON DELETE CASCADE` |
| tanggal | DATE | |
| deskripsi | TEXT | mis. "Ganti oli & servis" |
| jumlah_biaya | DECIMAL(15,2) | |

**`penjualan`** — transaksi penjualan

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| motor_id | UUID (FK → motors.id, unique) | `ON DELETE RESTRICT` — motor yang sudah terjual tidak boleh terhapus begitu saja |
| tanggal_penjualan | DATE | |
| harga_jual | DECIMAL(15,2) | |
| nama_pembeli | TEXT | |
| no_telepon_pembeli | TEXT, nullable | |
| metode_pembayaran | ENUM(`CASH`,`KREDIT`) | |
| nama_leasing | TEXT, nullable | diisi jika kredit |
| keterangan | TEXT, nullable | |

**`pengeluaran_operasional`** — biaya operasional showroom

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| tanggal | DATE | |
| kategori | ENUM(`SEWA_TEMPAT`,`LISTRIK`,`GAJI_PEGAWAI`,`IKLAN`,`PERAWATAN_SHOWROOM`,`LAIN_LAIN`) | |
| deskripsi | TEXT | |
| jumlah | DECIMAL(15,2) | |

**`users`** — akun staff/admin (untuk fitur login berikutnya)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| nama | TEXT | |
| email | TEXT, unique | |
| password_hash | TEXT | **jangan pernah simpan password mentah** |
| role | ENUM(`ADMIN`,`STAFF`) | |

### Rumus Laporan Laba/Rugi (dipakai di service layer nanti)

```
Laba per unit motor  = harga_jual - (harga_beli + SUM(jumlah_biaya perbaikan motor tsb))

Laba/Rugi bulanan    = SUM(laba per unit, untuk motor yg tanggal_penjualan di bulan itu)
                        - SUM(jumlah pengeluaran_operasional di bulan itu)
```

Karena `biaya_perbaikan` disimpan per baris (bukan satu kolom agregat di `motors`), angka `harga_beli + biaya_perbaikan` selalu bisa dihitung ulang secara akurat kapan pun — tidak akan "kadaluarsa" walau ada biaya perbaikan baru ditambahkan setelah motor masuk stok.

---

## 2. Arsitektur Folder/Sistem

Monorepo dengan dua bagian terpisah: `backend/` (REST API) dan `frontend/` (React, disusun di langkah berikutnya).

```
artamotor-app/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          ← definisi model (Langkah 3, sudah dibuat)
│   │   ├── migrations/            ← riwayat perubahan skema DB (Langkah 3, sudah dibuat)
│   │   └── seed.js                ← data contoh untuk development
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js        ← Prisma Client singleton (sudah dibuat)
│   │   ├── routes/                ← definisi endpoint (langkah berikutnya)
│   │   ├── controllers/           ← terima request, panggil service, kirim response
│   │   ├── services/               ← logika bisnis & akuntansi (hitung laba, dsb)
│   │   ├── validators/            ← skema validasi input (Zod)
│   │   ├── middlewares/           ← auth, error handler, dll
│   │   ├── utils/                 ← helper (format currency, generate kode motor, dll)
│   │   └── app.js                 ← perakitan Express app (sudah dibuat)
│   ├── .env.example
│   ├── package.json
│   └── server.js                  ← entry point (sudah dibuat)
└── frontend/
    ├── src/
    │   ├── pages/                 ← Dashboard, Inventaris, Penjualan, Pengeluaran, Laporan
    │   ├── components/            ← komponen UI reusable (tabel, form, card ringkasan)
    │   ├── services/               ← pemanggil API (axios/fetch ke backend)
    │   ├── hooks/                  ← custom hooks
    │   └── context/                ← auth context, dll
    └── package.json
```

**Kenapa dipisah controller/service/route?**
Route hanya memetakan URL ke fungsi. Controller menangani HTTP (parsing request, kirim response). Service berisi logika bisnis murni (perhitungan laba, validasi status motor) yang tidak bergantung pada Express — sehingga bisa dites secara terpisah tanpa perlu HTTP request sungguhan. Ini pola layered architecture standar untuk aplikasi Express skala menengah.

---

## 3. Model & Migration (kode langkah pertama)

File yang sudah dibuat:

- **`backend/prisma/schema.prisma`** — definisi Model (Motor, BiayaPerbaikan, Penjualan, PengeluaranOperasional, User) beserta enum dan relasinya. Menggunakan Prisma `multiSchema` (`@@schema("akunting")` di tiap model/enum) supaya Prisma Client tahu semua tabel ini hidup di schema `akunting`, bukan `public`.
- **`backend/prisma/migrations/20260725120000_init/migration.sql`** — SQL DDL (CREATE SCHEMA, CREATE TYPE, CREATE TABLE, FOREIGN KEY, ENABLE ROW LEVEL SECURITY) yang persis sama dengan yang **sudah dijalankan langsung ke Supabase** (migration `create_akunting_schema`).
- **`backend/prisma/migrations/migration_lock.toml`** — penanda provider database untuk Prisma.
- **`backend/src/config/database.js`** — Prisma Client singleton, dipakai oleh semua service nanti.
- **`backend/prisma/seed.js`** — contoh data (2 motor, 1 sudah terjual, beberapa biaya perbaikan & pengeluaran) untuk development.
- **`backend/src/app.js`** & **`backend/server.js`** — kerangka Express minimal dengan health check endpoint.

### Kenapa schema terpisah, dan apa artinya untuk keamanan

Kelima tabel dibuat dengan `ENABLE ROW LEVEL SECURITY` tapi **tanpa policy** apa pun. Artinya: hanya koneksi yang pakai `service_role` key (atau connection string database langsung, seperti yang dipakai backend Express/Prisma ini) yang bisa membaca/menulis data — klien browser yang memakai `anon` key lewat Supabase API **tidak bisa** menyentuh tabel-tabel ini sama sekali, walaupun tidak ada policy eksplisit. Ini best practice untuk data finansial: akses hanya lewat backend Anda sendiri, bukan langsung dari frontend.

Schema `akunting` juga **tidak otomatis ter-expose** lewat Supabase REST API (PostgREST) — hanya schema yang didaftarkan di *Project Settings > API > Exposed schemas* yang bisa diakses lewat `supabase-js`. Karena backend Node.js/Prisma di project ini konek langsung via connection string Postgres, hal ini tidak masalah; tapi kalau nanti Anda ingin akses tabel `akunting.*` lewat Supabase client library, tambahkan `akunting` ke Exposed schemas dulu.

### Cara menjalankan (langkah demi langkah)

1. Masuk ke folder backend dan install dependency:
   ```bash
   cd backend
   npm install
   ```
2. Salin `.env.example` menjadi `.env`. Isi `DATABASE_URL` dan `DIRECT_URL` dengan password database Supabase project **ArtaMotor** (Supabase Dashboard → Project Settings → Database → Connection string; passwordnya tidak bisa diambil lewat MCP karena alasan keamanan).
3. Generate Prisma Client (skema tabel sudah ada di Supabase, jadi cukup generate client-nya, **tidak perlu** `prisma migrate dev` lagi):
   ```bash
   npm run prisma:generate
   ```
   Kalau suatu saat Anda mengubah `schema.prisma` dan ingin sinkron ulang ke Supabase, baru jalankan `npx prisma migrate dev` — Prisma akan bikin migration baru untuk perubahan tsb.
4. (Opsional) Isi data contoh ke Supabase:
   ```bash
   npm run prisma:seed
   ```
5. Jalankan server development:
   ```bash
   npm run dev
   ```
   Cek `http://localhost:4000/api/health` — harus mengembalikan `{"status":"ok"}`.

---

## 4. CRUD Backend (Service + Controller + Route)

Layer lengkap sudah dibuat untuk 3 entitas utama:

```
backend/src/
├── utils/
│   ├── AppError.js              ← error terkontrol (statusCode + pesan)
│   └── generateKodeMotor.js     ← auto-generate kode "MTR-2026-0001"
├── middlewares/
│   ├── validate.js              ← validasi body pakai Zod, throw AppError(400) kalau invalid
│   └── errorHandler.js          ← terjemahkan AppError & error Prisma jadi response JSON konsisten
├── validators/                  ← Zod schema per entitas (create & update)
├── services/                    ← logika bisnis murni (motor, penjualan, pengeluaran)
└── controllers/ + routes/       ← HTTP layer, tipis, hanya panggil service
```

**Poin desain penting:**
- **Transaksi penjualan otomatis mengubah status motor.** `penjualan.service.createPenjualan()` membuat baris `Penjualan` dan meng-update `Motor.status` jadi `TERJUAL` dalam **satu transaksi database** (`prisma.$transaction`) — kalau salah satu gagal, keduanya di-rollback. Motor yang sudah `TERJUAL` tidak bisa dijual lagi (dicek di service, ditambah unique constraint `motor_id` di tabel `penjualan` sebagai jaring pengaman kedua di level DB).
- **Hapus transaksi penjualan** otomatis mengembalikan status motor ke `TERSEDIA` (juga dalam transaksi).
- **Motor yang sudah terjual** tidak bisa dihapus dari inventaris atau ditambah biaya perbaikan baru — dicegah di service layer dengan pesan error yang jelas.
- **`kode_motor`** di-generate otomatis saat create (format `MTR-{tahun}-{urut}`), dengan retry kalau ada race condition.

### Daftar Endpoint API

Semua path diawali `/api`. Body request divalidasi Zod; response error konsisten `{ success: false, message, details? }`.

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/motors?status=&search=&page=&limit=` | List inventaris, filter status/pencarian, pagination |
| GET | `/motors/:id` | Detail motor + biaya perbaikan + data penjualan (kalau ada) |
| POST | `/motors` | Tambah motor baru (kode_motor auto-generate) |
| PUT | `/motors/:id` | Update data motor |
| DELETE | `/motors/:id` | Hapus motor (ditolak kalau sudah terjual) |
| GET | `/motors/:id/biaya-perbaikan` | List rincian biaya perbaikan motor tsb |
| POST | `/motors/:id/biaya-perbaikan` | Tambah biaya perbaikan (ditolak kalau motor sudah terjual) |
| DELETE | `/motors/:id/biaya-perbaikan/:biayaId` | Hapus satu baris biaya perbaikan |
| GET | `/penjualan?startDate=&endDate=&metodePembayaran=&page=&limit=` | List transaksi penjualan |
| GET | `/penjualan/:id` | Detail transaksi + data motor & biaya perbaikannya |
| POST | `/penjualan` | Catat penjualan baru (auto set motor jadi TERJUAL) |
| PUT | `/penjualan/:id` | Update detail transaksi (tidak mengubah status motor) |
| DELETE | `/penjualan/:id` | Batalkan transaksi (auto set motor kembali TERSEDIA) |
| GET | `/pengeluaran?startDate=&endDate=&kategori=&page=&limit=` | List pengeluaran operasional |
| GET | `/pengeluaran/:id` | Detail satu pengeluaran |
| POST | `/pengeluaran` | Catat pengeluaran baru |
| PUT | `/pengeluaran/:id` | Update pengeluaran |
| DELETE | `/pengeluaran/:id` | Hapus pengeluaran |

### Catatan verifikasi

File-file di atas sudah lolos `node --check` (validasi sintaks) dan `npm install` berhasil. Uji jalan penuh (`npm run dev` + request sungguhan ke Supabase) belum sempat dilakukan dari sandbox pengembangan karena keterbatasan jaringan saat mengunduh Prisma engine binary — jalankan `npx prisma generate` lalu `npm run dev` di komputer Anda untuk uji end-to-end sebelum dipakai produksi.

---

## 5. Laporan Keuangan + Export PDF/Excel

`backend/src/services/laporan.service.js` mengimplementasikan persis rumus di bagian 1:

```
Laba per unit  = harga_jual - (harga_beli + SUM(biaya_perbaikan))
Laba bulanan   = SUM(laba per unit motor yang terjual bulan itu) - SUM(pengeluaran_operasional bulan itu)
```

Semua penjumlahan biaya pakai `Prisma.Decimal` (bukan `Number` biasa) sampai tahap akhir, supaya tidak ada error pembulatan floating point saat menjumlahkan banyak baris.

`backend/src/utils/exporters.js` merender hasil laporan itu jadi file **Excel** (`exceljs`) atau **PDF** (`pdfkit`), langsung di-stream ke response — tidak menyimpan file sementara di server. Sudah diuji secara terisolasi (tanpa koneksi DB, pakai data dummy) dan berhasil menghasilkan file `.xlsx`/`.pdf` yang valid.

### Daftar Endpoint Laporan

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/laporan/dashboard` | Ringkasan Dashboard: total motor tersedia, total motor terjual bulan ini, total pendapatan bulan ini, estimasi laba bersih bulan ini |
| GET | `/api/laporan/motor/:id` | Laba/rugi satu unit motor (harus sudah terjual) |
| GET | `/api/laporan/laba-per-unit?startDate=&endDate=` | Laba/rugi semua unit yang terjual dalam rentang tanggal |
| GET | `/api/laporan/bulanan?year=&month=` | Laba/rugi bulanan lengkap (laba kotor, pengeluaran, laba bersih, rincian) |
| GET | `/api/laporan/export/laba-per-unit/excel?startDate=&endDate=` | Download `.xlsx` laba per unit |
| GET | `/api/laporan/export/laba-per-unit/pdf?startDate=&endDate=` | Download `.pdf` laba per unit |
| GET | `/api/laporan/export/bulanan/excel?year=&month=` | Download `.xlsx` laba/rugi bulanan |
| GET | `/api/laporan/export/bulanan/pdf?year=&month=` | Download `.pdf` laba/rugi bulanan |

---

## 6. Autentikasi (JWT)

Semua endpoint di bagian 4 & 5 (`/api/motors`, `/api/penjualan`, `/api/pengeluaran`, `/api/laporan`) sekarang **wajib login** — dipasang lewat `router.use(authenticate)` di `backend/src/routes/index.js` sebelum route-route tersebut di-mount. Hanya `/api/auth/register` dan `/api/auth/login` yang publik.

**Alur:**
1. `POST /api/auth/login` dengan `{ email, password }` → dapat `token` (JWT, default berlaku 8 jam, diatur lewat `JWT_EXPIRES_IN` di `.env`).
2. Kirim token itu di setiap request berikutnya lewat header `Authorization: Bearer <token>`.
3. Kalau token tidak ada / salah / kedaluwarsa → `401 Unauthorized`.

**Role & pembatasan akses:** ada dua role, `ADMIN` dan `STAFF`. Aksi **hapus data** (`DELETE /motors/:id`, `DELETE /motors/:id/biaya-perbaikan/:biayaId`, `DELETE /penjualan/:id`, `DELETE /pengeluaran/:id`) dibatasi hanya untuk role `ADMIN` lewat `requireRole('ADMIN')` — staf biasa tetap bisa create/read/update data harian, tapi tidak bisa menghapus riwayat transaksi/inventaris. Aksi lain (create/update/read) terbuka untuk kedua role selama sudah login.

**Password** di-hash dengan `bcryptjs` (10 salt rounds) sebelum disimpan ke `users.password_hash` — tidak pernah disimpan atau dikembalikan dalam bentuk asli.

### Daftar Endpoint Auth

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/auth/register` | Daftar user baru (`nama`, `email`, `password` min. 8 karakter, `role` opsional default STAFF) |
| POST | `/api/auth/login` | Login, mengembalikan `{ user, token }` |
| GET | `/api/auth/me` | Profil user yang sedang login (butuh token) |

### Akun admin awal

`prisma/seed.js` sekarang juga membuat satu akun admin lewat `prisma.user.upsert` (aman dijalankan berkali-kali):

```
email:    admin@artamotor.test
password: Admin123!
```

Jalankan `npm run prisma:seed`, lalu **segera ganti password ini** (lewat endpoint yang akan dibuat di langkah berikutnya, atau langsung lewat Prisma Studio / SQL) sebelum dipakai produksi sungguhan.

### Catatan verifikasi

Logika inti (`bcrypt.hash`/`bcrypt.compare`, `jwt.sign`/`jwt.verify`, penolakan token dengan secret yang salah) sudah diuji langsung di sandbox dan berjalan benar. Bagian yang butuh koneksi Supabase (register/login sungguhan lewat endpoint) belum bisa diuji dari sandbox pengembangan karena keterbatasan jaringan saat mengunduh Prisma engine binary — jalankan `npx prisma generate && npm run dev` di komputer Anda untuk uji end-to-end.

---

## 7. Frontend React

`frontend/` — React 18 + Vite + React Router 6 + Axios, tanpa framework UI eksternal (CSS ditulis tangan di `src/App.css`, pakai CSS variables supaya gampang diganti warna/branding).

```
frontend/src/
├── api/           ← satu file per resource (client.js = axios instance + interceptor auth)
├── context/       ← AuthContext: simpan user & token, auto-restore sesi dari localStorage
├── components/    ← ProtectedRoute, Layout (sidebar+topbar), StatusBadge, Modal
├── pages/         ← LoginPage, DashboardPage, MotorsPage, MotorDetailPage,
│                    PenjualanPage, PengeluaranPage, LaporanPage
├── utils/         ← formatRupiah.js
└── App.jsx        ← routing
```

**Alur autentikasi di frontend:** login menyimpan `token` & `user` ke `localStorage`; `api/client.js` menambahkan header `Authorization: Bearer <token>` ke setiap request otomatis lewat axios interceptor, dan mengarahkan balik ke `/login` kalau server membalas 401. `ProtectedRoute` menahan akses ke semua halaman selain `/login` sampai sesi terverifikasi.

**Halaman yang dibuat:**
- **Login** — form email/password.
- **Dashboard** — 4 kartu ringkasan dari `GET /laporan/dashboard`.
- **Inventaris Motor** — tabel dengan filter status/pencarian, modal tambah/edit, hapus (khusus ADMIN), link ke detail.
- **Detail Motor** — info motor, daftar & tambah biaya perbaikan, dan form "Catat Penjualan" kalau motor masih `TERSEDIA` (ini titik masuk untuk membuat transaksi penjualan baru).
- **Transaksi Penjualan** — tabel dengan filter tanggal/metode bayar, tombol batalkan transaksi (khusus ADMIN, otomatis mengembalikan motor ke Tersedia).
- **Pengeluaran Operasional** — CRUD penuh dengan modal.
- **Laporan** — 2 tab (Laba per Unit dengan filter rentang tanggal; Laba/Rugi Bulanan dengan pilih bulan/tahun), masing-masing punya tombol **Export Excel** dan **Export PDF** yang mengunduh file langsung dari backend (pakai `responseType: 'blob'` supaya header Authorization ikut terkirim, karena link `<a href>` biasa tidak bisa membawa header).

### Cara menjalankan

```bash
cd frontend
npm install
cp .env.example .env   # sesuaikan VITE_API_URL kalau backend tidak di localhost:4000
npm run dev
```

Buka `http://localhost:5173`. Backend harus sudah jalan (lihat bagian 3) dan sudah di-seed (`npm run prisma:seed` di folder backend) supaya ada akun admin awal untuk login pertama kali.

### Catatan verifikasi

`npm install` dan `npm run build` (Vite) sudah dijalankan di sandbox pengembangan dan **berhasil tanpa error** — 105 module berhasil di-bundle, menghasilkan `dist/` yang valid. Ini memverifikasi seluruh JSX, import antar-file, dan routing sudah benar secara struktural. Yang belum diuji dari sandbox ini adalah pemanggilan API sungguhan ke backend (karena backend juga belum bisa dites penuh di sini — lihat catatan di bagian 3 & 6) — jalankan `npm run dev` di kedua folder (`backend` dan `frontend`) di komputer Anda untuk uji end-to-end penuh: login → lihat dashboard → tambah motor → catat penjualan → lihat laporan → export Excel/PDF.

## Ringkasan status aplikasi

Kelima fitur utama dari spesifikasi awal sudah diimplementasikan penuh — Dashboard, Manajemen Inventaris, Transaksi Penjualan, Pengeluaran Operasional, dan Laporan Keuangan (termasuk export PDF/Excel) — lengkap dengan autentikasi, terhubung ke Supabase project **ArtaMotor** (schema `akunting`), dan frontend React yang memanggil semuanya.

**Yang masih bisa dikembangkan lebih lanjut** (di luar scope permintaan awal, opsional):
1. Endpoint untuk user ganti password sendiri / admin kelola user lain (saat ini hanya register, login, lihat profil sendiri).
2. Automated testing (unit test service layer, integration test endpoint).
3. Deployment (mis. backend ke Railway/Render, frontend ke Vercel/Netlify).

Beri tahu saya kalau ada yang mau disempurnakan atau ada bagian yang mau diuji bersama.
