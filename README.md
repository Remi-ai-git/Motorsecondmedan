# Arta Motor — Website + AI Sales Assistant

Website dealer motor bekas (Medan) dengan AI Sales Assistant berbasis **Google Gemini**, dibangun dengan Next.js App Router + Supabase + Vercel AI SDK.

## Fitur

- **AI Chatbot** — floating chat di semua halaman (`src/components/ChatWidget.tsx`), streaming, Markdown, ingat konteks percakapan.
- **AI Recommendation & Product Knowledge** — Gemini memanggil tools (`src/lib/ai/tools.ts`) yang query langsung ke Supabase: `searchMotors`, `getMotorDetail`, `compareMotors`, `simulateCredit`, `getFaqs`. Tidak pernah mengarang data (guardrails di `src/lib/ai/system-prompt.ts`).
- **AI Search** — pencarian bahasa alami di home & katalog (`/api/search`): Gemini menerjemahkan query menjadi filter database (structured output).
- **Riwayat percakapan** — tersimpan ke tabel `chat_sessions` / `chat_messages` jika `SUPABASE_SERVICE_ROLE_KEY` di-set (opsional).
- **Katalog + detail motor** — data dari Supabase, tombol WhatsApp sales dengan pesan otomatis, galeri foto.
- **Panel admin (`/admin`)** — kelola stok & foto motor tanpa buka Supabase Dashboard: tambah/edit/hapus motor, upload foto ke Supabase Storage. Login pakai satu password bersama (lihat bagian "Setup panel admin").

## Setup

1. `npm install`
2. Isi `.env.local`:
   - `GOOGLE_GENERATIVE_AI_API_KEY` — dari https://aistudio.google.com/apikey (**wajib** untuk fitur AI)
   - `SUPABASE_SERVICE_ROLE_KEY` — dari Supabase Dashboard > Settings > API (opsional, untuk simpan riwayat chat)
   - `NEXT_PUBLIC_WA_NUMBER` — nomor WhatsApp sales, format `62xxx`
   - `NEXT_PUBLIC_SITE_URL` — domain produksi asli (dipakai `robots.txt` & `sitemap.xml`)
   - URL & anon key Supabase sudah terisi (project: ArtaMotor)
3. `npm run dev` → http://localhost:3000

## Setup panel admin (upload foto & kelola stok)

Panel admin di `/admin` butuh 3 hal tambahan:

1. **Buat bucket Storage** — buka Supabase Dashboard > SQL Editor, jalankan isi file `supabase/storage-setup.sql` (bikin bucket publik `motor-images` + policy baca publik). Alternatif tanpa SQL: Dashboard > Storage > New bucket > nama `motor-images`, centang **Public bucket**.
2. **Isi `SUPABASE_SERVICE_ROLE_KEY`** di `.env.local` (dev) — panel admin butuh ini untuk baca/tulis semua data motor & upload foto (bypass RLS). Ambil dari Supabase Dashboard > Settings > API.
3. **Set password admin** di `.env.local`:
   ```
   ADMIN_PASSWORD=isi-password-rahasia-anda
   ADMIN_SESSION_SECRET=isi-string-acak-panjang-untuk-tanda-tangan-sesi
   ```
   `ADMIN_SESSION_SECRET` cukup string acak (mis. hasil `openssl rand -hex 32`), tidak perlu diingat — cuma dipakai untuk memvalidasi cookie login.

Lalu buka `http://localhost:3000/admin/login`, masuk pakai `ADMIN_PASSWORD`. Dari situ bisa tambah motor, upload sampai beberapa foto per motor (JPG/PNG/WebP, maks 5MB/foto), edit, dan hapus.

**Di produksi (Cloudflare Worker)**, set kedua secret ini juga:
```
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SESSION_SECRET
```

## Checklist sebelum go-live

- [ ] Set `GOOGLE_GENERATIVE_AI_API_KEY` sebagai Cloudflare Worker secret: `npx wrangler secret put GOOGLE_GENERATIVE_AI_API_KEY`
- [ ] Jalankan `supabase/storage-setup.sql` untuk bikin bucket `motor-images`, dan set `SUPABASE_SERVICE_ROLE_KEY` + `ADMIN_PASSWORD` + `ADMIN_SESSION_SECRET` (lihat "Setup panel admin" di atas) — tanpa ini panel `/admin` tidak bisa dipakai
- [ ] Cek RLS policy di Supabase Dashboard > Authentication > Policies — pastikan publik hanya bisa `SELECT` di `motors`/`faqs`, dan `chat_sessions`/`chat_messages` tidak bisa diakses anon sama sekali
- [ ] Ganti data motor contoh dengan data asli & upload foto asli lewat `/admin`
- [ ] Ganti `NEXT_PUBLIC_WA_NUMBER` dengan nomor sales asli
- [ ] Ganti `NEXT_PUBLIC_SITE_URL` di `wrangler.jsonc` dengan domain produksi asli
- [ ] (Opsional, disarankan) Tambahkan Rate Limiting Rule di Cloudflare Dashboard > Security > WAF untuk `/api/chat`, `/api/search`, dan `/api/admin/login` sebagai proteksi tambahan di level jaringan — rate limit dasar per-IP sudah ada di kode (`src/lib/rate-limit.ts`) tapi itu best-effort per isolate, bukan pengganti proteksi jaringan.

## Database (Supabase project `ArtaMotor`)

- `motors` — inventori (16 unit contoh sudah ter-seed). RLS: publik hanya bisa baca.
- `faqs` — FAQ resmi (7 entri ter-seed). RLS: publik hanya bisa baca.
- `chat_sessions`, `chat_messages` — riwayat chat. RLS: tanpa akses publik, hanya lewat service role di server.

## Arsitektur & Roadmap

Semua kemampuan AI terpusat di `src/lib/ai/`:

- `tools.ts` — tool definitions (reusable untuk kanal lain)
- `system-prompt.ts` — persona & guardrails

Karena tools dan prompt terpisah dari route handler, fitur roadmap (WhatsApp Assistant, Voice, Admin/Inventory Assistant, dll.) tinggal membuat kanal/endpoint baru yang memakai `aiTools` yang sama dengan system prompt berbeda.

## Ganti data motor

Cara termudah: lewat panel `/admin` (lihat di atas). Bisa juga langsung lewat Supabase Dashboard (Table Editor > motors) atau SQL kalau perlu bulk edit. Kolom `tags` dipakai AI untuk mencocokkan kebutuhan (`irit`, `mahasiswa`, `ojol`, `touring`, `km rendah`, `tahun muda`, dst.), kolom `images` berisi array URL foto (diisi otomatis oleh panel admin saat upload).
