# Arta Motor — Website + AI Sales Assistant

Website dealer motor bekas (Medan) dengan AI Sales Assistant berbasis **Google Gemini**, dibangun dengan Next.js App Router + Supabase + Vercel AI SDK.

## Fitur

- **AI Chatbot** — floating chat di semua halaman (`src/components/ChatWidget.tsx`), streaming, Markdown, ingat konteks percakapan.
- **AI Recommendation & Product Knowledge** — Gemini memanggil tools (`src/lib/ai/tools.ts`) yang query langsung ke Supabase: `searchMotors`, `getMotorDetail`, `compareMotors`, `simulateCredit`, `getFaqs`. Tidak pernah mengarang data (guardrails di `src/lib/ai/system-prompt.ts`).
- **AI Search** — pencarian bahasa alami di home & katalog (`/api/search`): Gemini menerjemahkan query menjadi filter database (structured output).
- **Riwayat percakapan** — tersimpan ke tabel `chat_sessions` / `chat_messages` jika `SUPABASE_SERVICE_ROLE_KEY` di-set (opsional).
- **Katalog + detail motor** — data dari Supabase, tombol WhatsApp sales dengan pesan otomatis.

## Setup

1. `npm install`
2. Isi `.env.local`:
   - `GOOGLE_GENERATIVE_AI_API_KEY` — dari https://aistudio.google.com/apikey (**wajib** untuk fitur AI)
   - `SUPABASE_SERVICE_ROLE_KEY` — dari Supabase Dashboard > Settings > API (opsional, untuk simpan riwayat chat)
   - `NEXT_PUBLIC_WA_NUMBER` — nomor WhatsApp sales, format `62xxx`
   - `NEXT_PUBLIC_SITE_URL` — domain produksi asli (dipakai `robots.txt` & `sitemap.xml`)
   - URL & anon key Supabase sudah terisi (project: ArtaMotor)
3. `npm run dev` → http://localhost:3000

## Checklist sebelum go-live

- [ ] Set `GOOGLE_GENERATIVE_AI_API_KEY` sebagai Cloudflare Worker secret: `npx wrangler secret put GOOGLE_GENERATIVE_AI_API_KEY`
- [ ] Cek RLS policy di Supabase Dashboard > Authentication > Policies — pastikan publik hanya bisa `SELECT` di `motors`/`faqs`, dan `chat_sessions`/`chat_messages` tidak bisa diakses anon sama sekali
- [ ] Ganti data motor contoh dengan data asli
- [ ] Ganti `NEXT_PUBLIC_WA_NUMBER` dengan nomor sales asli
- [ ] Ganti `NEXT_PUBLIC_SITE_URL` di `wrangler.jsonc` dengan domain produksi asli
- [ ] (Opsional, disarankan) Tambahkan Rate Limiting Rule di Cloudflare Dashboard > Security > WAF untuk `/api/chat` dan `/api/search` sebagai proteksi tambahan di level jaringan — rate limit dasar per-IP sudah ada di kode (`src/lib/rate-limit.ts`) tapi itu best-effort per isolate, bukan pengganti proteksi jaringan.

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

Edit lewat Supabase Dashboard (Table Editor > motors) atau SQL. Kolom `tags` dipakai AI untuk mencocokkan kebutuhan (`irit`, `mahasiswa`, `ojol`, `touring`, `km rendah`, `tahun muda`, dst.).
