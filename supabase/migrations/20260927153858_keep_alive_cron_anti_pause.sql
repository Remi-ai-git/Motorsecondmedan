-- Anti-pause otomatis: pg_cron menjadwalkan, pg_net yang benar-benar
-- mengirim HTTP request ke REST API proyek sendiri -- supaya tercatat
-- sebagai aktivitas nyata oleh mekanisme auto-pause Supabase Free tier.
-- (Project ini sekarang masih di paket Pro yang tidak kena auto-pause,
-- tapi job ini disiapkan supaya aman kalau nanti diturunkan ke Free.)

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'keep-alive-ping',
  '0 3 * * *',
  $$
  select net.http_get(
    url := 'https://zipkoxltnwojyphroocj.supabase.co/rest/v1/motors?select=id&limit=1',
    headers := jsonb_build_object('apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcGtveGx0bndvanlwaHJvb2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1ODIyMDcsImV4cCI6MjEwMjE1ODIwN30.OrIGcU3v0Pwmy-4rdz7hl55zZDt0KOYmW61ZoCdpntw')
  ) as request_id;
  $$
);
