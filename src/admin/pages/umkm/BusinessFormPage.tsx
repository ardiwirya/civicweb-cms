import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { uploadFile } from "@/admin/lib/uploadFile";

const businessSchema = z.object({
  name: z.string().min(3, "Nama usaha minimal 3 karakter"),
  owner_name: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

export default function BusinessFormPage() {
  const { id } = useParams<{ id: string }>();
  const businessId = id!;
  const isEditMode = businessId !== "baru";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
  });

  const { data: existing } = useQuery({
    queryKey: ["admin-businesses", businessId],
    queryFn: async () => {
      const { data, error } = await supabase.from("businesses").select("*").eq("id", businessId).single();
      if (error) throw error;
      return data;
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        owner_name: existing.owner_name ?? "",
        category: existing.category ?? "",
        description: existing.description ?? "",
        phone: existing.phone ?? "",
        address: existing.address ?? "",
      });
      setImageUrl(existing.image_url);
    }
  }, [existing, reset]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      setImageUrl(await uploadFile(file, "umkm"));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setIsUploading(false);
    }
  }

  const saveMutation = useMutation({
    mutationFn: async (values: BusinessFormValues) => {
      const payload = { ...values, image_url: imageUrl };
      if (isEditMode) {
        const { error } = await supabase.from("businesses").update(payload).eq("id", businessId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("businesses").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      navigate("/umkm");
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">{isEditMode ? "Edit UMKM" : "Tambah UMKM"}</h1>

      <form onSubmit={handleSubmit((values) => saveMutation.mutate(values))} className="max-w-2xl space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm text-slate-700">Nama Usaha</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-700">Nama Pemilik (opsional)</label>
            <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("owner_name")} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Kategori (opsional)</label>
            <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("category")} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Deskripsi (opsional)</label>
          <textarea rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("description")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-700">No. Telepon (opsional)</label>
            <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("phone")} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Alamat (opsional)</label>
            <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("address")} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Foto Produk/Usaha</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
          {isUploading && <p className="mt-1 text-xs text-slate-500">Mengunggah...</p>}
          {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 h-32 rounded-md object-cover" />}
        </div>

        {saveMutation.isError && <p className="text-sm text-red-600">Gagal menyimpan, silakan coba lagi.</p>}

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={isSubmitting || isUploading} className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" onClick={() => navigate("/umkm")} className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
