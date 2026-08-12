import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { uploadFile } from "@/admin/lib/uploadFile";
import type { InstitutionType } from "@/lib/supabase/database.types";

const institutionTypes: { value: InstitutionType; label: string }[] = [
  { value: "desa", label: "Desa" },
  { value: "kecamatan", label: "Kecamatan" },
  { value: "dinas", label: "Dinas" },
  { value: "sekolah", label: "Sekolah" },
  { value: "lembaga", label: "Lembaga" },
  { value: "instansi", label: "Instansi" },
  { value: "organisasi", label: "Organisasi" },
];

const profileSchema = z.object({
  name: z.string().min(3, "Nama instansi minimal 3 karakter"),
  type: z.enum(["desa", "kecamatan", "dinas", "sekolah", "lembaga", "instansi", "organisasi"]),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  vision: z.string().optional(),
  mission: z.string().optional(),
  hero_title: z.string().optional(),
  hero_subtitle: z.string().optional(),
  footer_text: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Format "R G B" (tanpa koma) supaya kompatibel dengan CSS variable Tailwind.
// Input warna di form pakai <input type="color"> yang formatnya hex, jadi
// perlu dikonversi bolak-balik.
function hexToRgbTriplet(hex: string) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

function rgbTripletToHex(triplet: string) {
  const [r, g, b] = triplet.split(" ").map(Number);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export default function InstitutionProfilePage() {
  const queryClient = useQueryClient();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#16a34a");
  const [secondaryColor, setSecondaryColor] = useState("#0f172a");
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["admin-institution-profile"],
    queryFn: async () => {
      const { data, error } = await supabase.from("institution_profile").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        type: profile.type,
        address: profile.address ?? "",
        phone: profile.phone ?? "",
        email: profile.email ?? "",
        facebook: profile.social_media?.facebook ?? "",
        instagram: profile.social_media?.instagram ?? "",
        vision: profile.vision ?? "",
        mission: profile.mission ?? "",
        hero_title: profile.hero_title ?? "",
        hero_subtitle: profile.hero_subtitle ?? "",
        footer_text: profile.footer_text ?? "",
      });
      setLogoUrl(profile.logo_url);
      setPrimaryColor(rgbTripletToHex(profile.primary_color));
      setSecondaryColor(rgbTripletToHex(profile.secondary_color));
    }
  }, [profile, reset]);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      setLogoUrl(await uploadFile(file, "branding"));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setIsUploading(false);
    }
  }

  const saveMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const { facebook, instagram, ...rest } = values;
      const { error } = await supabase
        .from("institution_profile")
        .update({
          ...rest,
          logo_url: logoUrl,
          primary_color: hexToRgbTriplet(primaryColor),
          secondary_color: hexToRgbTriplet(secondaryColor),
          social_media: { facebook: facebook ?? "", instagram: instagram ?? "" },
        })
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-institution-profile"] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  if (isLoading) return <p className="text-sm text-slate-400">Memuat...</p>;

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-slate-900">Profil Instansi</h1>
      <p className="mb-6 text-sm text-slate-500">
        Pengaturan ini menentukan branding di seluruh halaman publik: nama, logo, warna, dan kontak.
      </p>

      <form onSubmit={handleSubmit((values) => saveMutation.mutate(values))} className="max-w-2xl space-y-6 rounded-lg border border-slate-200 bg-white p-6">
        <section className="space-y-4">
          <h2 className="font-medium text-slate-900">Identitas</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-700">Nama Instansi</label>
              <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">Jenis Instansi</label>
              <select className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("type")}>
                {institutionTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">Logo</label>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm" />
            {isUploading && <p className="mt-1 text-xs text-slate-500">Mengunggah...</p>}
            {logoUrl && <img src={logoUrl} alt="Logo" className="mt-2 h-16 object-contain" />}
          </div>
        </section>

        <section className="space-y-4 border-t border-slate-200 pt-4">
          <h2 className="font-medium text-slate-900">Warna Brand</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-700">Warna Utama</label>
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-full rounded-md border border-slate-300" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">Warna Kedua</label>
              <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="h-10 w-full rounded-md border border-slate-300" />
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-slate-200 pt-4">
          <h2 className="font-medium text-slate-900">Kontak</h2>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Alamat</label>
            <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("address")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-700">Telepon</label>
              <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("phone")} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">Email</label>
              <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-700">Facebook (username)</label>
              <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("facebook")} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">Instagram (username)</label>
              <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("instagram")} />
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-slate-200 pt-4">
          <h2 className="font-medium text-slate-900">Visi & Misi</h2>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Visi</label>
            <textarea rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("vision")} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Misi</label>
            <textarea rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("mission")} />
          </div>
        </section>

        <section className="space-y-4 border-t border-slate-200 pt-4">
          <h2 className="font-medium text-slate-900">Halaman Beranda & Footer</h2>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Judul Hero</label>
            <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("hero_title")} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Subjudul Hero</label>
            <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("hero_subtitle")} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Teks Footer</label>
            <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("footer_text")} />
          </div>
        </section>

        {saveMutation.isError && <p className="text-sm text-red-600">Gagal menyimpan, silakan coba lagi.</p>}
        {saveSuccess && <p className="text-sm text-green-600">Perubahan tersimpan.</p>}

        <button type="submit" disabled={isSubmitting || isUploading} className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
