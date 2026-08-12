import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

export type InstitutionProfile =
  Database["public"]["Tables"]["institution_profile"]["Row"];

/**
 * Mengambil konfigurasi instansi (nama, logo, warna, kontak, dll) dari database.
 * Ini dipanggil di BaseLayout.astro sehingga SETIAP halaman otomatis
 * mengikuti branding instansi yang aktif, tanpa perlu diubah manual per halaman.
 *
 * Kalau baris belum ada (instalasi baru yang belum di-setup), kembalikan
 * fallback supaya halaman tetap render, bukan crash.
 */
export async function getInstitutionProfile(): Promise<InstitutionProfile> {
  const { data, error } = await supabase
    .from("institution_profile")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return {
      id: 1,
      name: "Nama Instansi Belum Diatur",
      type: "instansi",
      logo_url: null,
      favicon_url: null,
      primary_color: "22 163 74",
      secondary_color: "15 23 42",
      address: null,
      phone: null,
      email: null,
      social_media: {},
      vision: null,
      mission: null,
      hero_title: "Selamat Datang",
      hero_subtitle: null,
      hero_image_url: null,
      footer_text: null,
      updated_at: new Date().toISOString(),
    };
  }

  return data;
}
