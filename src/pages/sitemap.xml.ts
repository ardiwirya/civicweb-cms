import type { APIRoute } from "astro";
import { supabase } from "@/lib/supabase/client";

// Halaman yang strukturnya tetap (bukan hasil query database)
const staticPaths = [
  "/",
  "/profil",
  "/visi-misi",
  "/struktur-organisasi",
  "/berita",
  "/pengumuman",
  "/agenda",
  "/potensi-wilayah",
  "/umkm",
  "/wisata",
  "/galeri",
  "/statistik",
  "/dokumen",
  "/faq",
  "/kontak",
];

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.toString().replace(/\/$/, "") ?? "";

  const [{ data: news }, { data: albums }] = await Promise.all([
    supabase.from("news").select("slug").eq("status", "published"),
    supabase.from("gallery_albums").select("id"),
  ]);

  const dynamicPaths = [
    ...(news ?? []).map((item) => `/berita/${item.slug}`),
    ...(albums ?? []).map((item) => `/galeri/${item.id}`),
  ];

  const allPaths = [...staticPaths, ...dynamicPaths];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPaths.map((path) => `  <url><loc>${baseUrl}${path}</loc></url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
};
