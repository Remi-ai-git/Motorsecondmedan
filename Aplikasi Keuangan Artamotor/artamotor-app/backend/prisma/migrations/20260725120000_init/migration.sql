-- =========================================================================
-- Migration: init
-- Dihasilkan agar sesuai persis dengan backend/prisma/schema.prisma
-- Target: Supabase project "ArtaMotor" (PostgreSQL 17)
--
-- Semua tabel dibuat di schema "akunting" (bukan "public"), karena schema
-- "public" pada project Supabase ini sudah dipakai aplikasi lain (katalog
-- motor / chatbot: tabel motors, faqs, chat_sessions, chat_messages).
-- Sudah diterapkan langsung ke Supabase pada 2026-07-25 via migration
-- bernama "create_akunting_schema".
-- =========================================================================

CREATE SCHEMA IF NOT EXISTS akunting;

-- -------------------------------------------------------------------------
-- ENUM TYPES
-- -------------------------------------------------------------------------
CREATE TYPE akunting."StatusMotor" AS ENUM ('TERSEDIA', 'TERJUAL');

CREATE TYPE akunting."MetodePembayaran" AS ENUM ('CASH', 'KREDIT');

CREATE TYPE akunting."KategoriPengeluaran" AS ENUM (
  'SEWA_TEMPAT',
  'LISTRIK',
  'GAJI_PEGAWAI',
  'IKLAN',
  'PERAWATAN_SHOWROOM',
  'LAIN_LAIN'
);

CREATE TYPE akunting."RolePengguna" AS ENUM ('ADMIN', 'STAFF');

-- -------------------------------------------------------------------------
-- TABLE: akunting.motors
-- -------------------------------------------------------------------------
CREATE TABLE akunting.motors (
    "id"              UUID NOT NULL DEFAULT gen_random_uuid(),
    "kode_motor"      TEXT NOT NULL,
    "merek"           TEXT NOT NULL,
    "tipe"            TEXT NOT NULL,
    "tahun_pembuatan" INTEGER NOT NULL,
    "plat_nomor"      TEXT NOT NULL,
    "no_rangka"       TEXT,
    "no_mesin"        TEXT,
    "warna"           TEXT,
    "harga_beli"      DECIMAL(15,2) NOT NULL,
    "tanggal_masuk"   DATE NOT NULL DEFAULT CURRENT_DATE,
    "status"          akunting."StatusMotor" NOT NULL DEFAULT 'TERSEDIA',
    "keterangan"      TEXT,
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "motors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "motors_kode_motor_key" ON akunting.motors("kode_motor");
CREATE UNIQUE INDEX "motors_plat_nomor_key" ON akunting.motors("plat_nomor");
CREATE UNIQUE INDEX "motors_no_rangka_key" ON akunting.motors("no_rangka");
CREATE UNIQUE INDEX "motors_no_mesin_key" ON akunting.motors("no_mesin");
CREATE INDEX "motors_status_idx" ON akunting.motors("status");

ALTER TABLE akunting.motors ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- TABLE: akunting.biaya_perbaikan
-- -------------------------------------------------------------------------
CREATE TABLE akunting.biaya_perbaikan (
    "id"           UUID NOT NULL DEFAULT gen_random_uuid(),
    "motor_id"     UUID NOT NULL,
    "tanggal"      DATE NOT NULL,
    "deskripsi"    TEXT NOT NULL,
    "jumlah_biaya" DECIMAL(15,2) NOT NULL,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biaya_perbaikan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "biaya_perbaikan_motor_id_idx" ON akunting.biaya_perbaikan("motor_id");

ALTER TABLE akunting.biaya_perbaikan
  ADD CONSTRAINT "biaya_perbaikan_motor_id_fkey"
  FOREIGN KEY ("motor_id") REFERENCES akunting.motors("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE akunting.biaya_perbaikan ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- TABLE: akunting.penjualan
-- -------------------------------------------------------------------------
CREATE TABLE akunting.penjualan (
    "id"                  UUID NOT NULL DEFAULT gen_random_uuid(),
    "motor_id"            UUID NOT NULL,
    "tanggal_penjualan"   DATE NOT NULL,
    "harga_jual"          DECIMAL(15,2) NOT NULL,
    "nama_pembeli"        TEXT NOT NULL,
    "no_telepon_pembeli"  TEXT,
    "metode_pembayaran"   akunting."MetodePembayaran" NOT NULL,
    "nama_leasing"        TEXT,
    "keterangan"          TEXT,
    "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "penjualan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "penjualan_motor_id_key" ON akunting.penjualan("motor_id");
CREATE INDEX "penjualan_tanggal_penjualan_idx" ON akunting.penjualan("tanggal_penjualan");

ALTER TABLE akunting.penjualan
  ADD CONSTRAINT "penjualan_motor_id_fkey"
  FOREIGN KEY ("motor_id") REFERENCES akunting.motors("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE akunting.penjualan ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- TABLE: akunting.pengeluaran_operasional
-- -------------------------------------------------------------------------
CREATE TABLE akunting.pengeluaran_operasional (
    "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
    "tanggal"    DATE NOT NULL,
    "kategori"   akunting."KategoriPengeluaran" NOT NULL,
    "deskripsi"  TEXT NOT NULL,
    "jumlah"     DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengeluaran_operasional_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pengeluaran_operasional_tanggal_idx" ON akunting.pengeluaran_operasional("tanggal");

ALTER TABLE akunting.pengeluaran_operasional ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- TABLE: akunting.users
-- -------------------------------------------------------------------------
CREATE TABLE akunting.users (
    "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
    "nama"          TEXT NOT NULL,
    "email"         TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role"          akunting."RolePengguna" NOT NULL DEFAULT 'STAFF',
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON akunting.users("email");

ALTER TABLE akunting.users ENABLE ROW LEVEL SECURITY;
