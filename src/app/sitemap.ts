import type { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/motor`, changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("motors")
      .select("slug, updated_at")
      .eq("status", "tersedia");

    const motorRoutes: MetadataRoute.Sitemap = (data ?? []).map((m) => ({
      url: `${SITE_URL}/motor/${m.slug}`,
      lastModified: m.updated_at ?? undefined,
      changeFrequency: "daily",
      priority: 0.7,
    }));

    return [...staticRoutes, ...motorRoutes];
  } catch {
    // Kalau Supabase tidak bisa dijangkau saat build/runtime, tetap kembalikan rute statis.
    return staticRoutes;
  }
}
