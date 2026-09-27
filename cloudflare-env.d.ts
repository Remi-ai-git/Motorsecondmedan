// Tambahan binding Cloudflare khusus project ini, di luar yang sudah
// dideklarasikan oleh @opennextjs/cloudflare sendiri (lihat
// node_modules/@opennextjs/cloudflare/dist/api/cloudflare-context.d.ts).
// Declaration merging ke interface global `CloudflareEnv` supaya
// `getCloudflareContext().env.MOTOR_IMAGES` punya tipe yang benar.
declare global {
  interface CloudflareEnv {
    /** R2 bucket "motor-images" — dipakai upload foto motor (ganti Supabase Storage). */
    MOTOR_IMAGES?: R2Bucket;
  }
}

export {};
