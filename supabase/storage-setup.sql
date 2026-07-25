-- Setup Supabase Storage untuk foto motor (fitur admin upload).
-- Jalankan sekali di Supabase Dashboard > SQL Editor (project ArtaMotor).
--
-- Catatan: upload gambar di aplikasi selalu lewat server (service role key,
-- lihat src/app/api/admin/upload/route.ts), dan service role SELALU bypass
-- RLS/storage policy. Jadi policy di bawah ini cuma untuk akses BACA publik
-- (supaya foto bisa ditampilkan di website tanpa autentikasi) — bukan untuk
-- mengizinkan upload dari browser pengunjung.

-- 1. Buat bucket publik untuk foto motor (idempotent — aman dijalankan ulang).
insert into storage.buckets (id, name, public)
values ('motor-images', 'motor-images', true)
on conflict (id) do nothing;

-- 2. Izinkan siapa saja MEMBACA (SELECT) file di bucket ini — perlu supaya
--    foto tampil di website publik. Karena bucket sudah public=true, ini
--    sebenarnya redundant untuk CDN URL, tapi tetap dibuat eksplisit.
drop policy if exists "Public read motor-images" on storage.objects;
create policy "Public read motor-images"
  on storage.objects for select
  using (bucket_id = 'motor-images');

-- Tidak perlu policy INSERT/UPDATE/DELETE untuk anon/authenticated —
-- default-nya ditolak, dan server admin selalu pakai service role key
-- yang otomatis bypass RLS ini.
