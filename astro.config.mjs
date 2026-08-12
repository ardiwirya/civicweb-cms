import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// Ganti "https://example.gov.id" saat deploy ke instansi masing-masing.
// Nilai ini dipakai untuk sitemap & canonical URL, bukan branding tampilan
// (branding tampilan datang dari tabel institution_profile di database).
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "https://example.gov.id",
  output: "server",
  // Adapter Vercel karena project ini di-deploy ke Vercel.
  // Untuk self-host di VPS sendiri, ganti ke @astrojs/node (mode: "standalone").
  adapter: vercel({
    runtime: "nodejs18.x", // explicitly declare the runtime
  }),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    // Sitemap TIDAK pakai @astrojs/sitemap karena integrasi itu didesain
    // untuk halaman yang di-prerender statis. Seluruh isi situs ini
    // server-rendered dari database, jadi sitemap dibuat manual sebagai
    // endpoint dinamis di src/pages/sitemap.xml.ts.
  ],
});
