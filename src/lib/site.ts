/**
 * URL kanonik website — dipakai untuk robots.txt, sitemap.xml, dan metadata.
 * Set NEXT_PUBLIC_SITE_URL di .env / Cloudflare Worker vars ke domain
 * produksi asli (mis. https://artamotormedan.com atau subdomain workers.dev).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://artamotor.example.com";
