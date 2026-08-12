import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { uploadFile } from "@/admin/lib/uploadFile";

const potentialSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  category: z.string().optional(),
  description: z.string().optional(),
});

type PotentialFormValues = z.infer<typeof potentialSchema>;

export default function PotentialFormPage() {
  const { id } = useParams<{ id: string }>();
  const potentialId = id!;
  const isEditMode = potentialId !== "baru";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PotentialFormValues>({
    resolver: zodResolver(potentialSchema),
  });

  const { data: existing } = useQuery({
    queryKey: ["admin-potentials", potentialId],
    queryFn: async () => {
      const { data, error } = await supabase.from("regional_potentials").select("*").eq("id", potentialId).single();
      if (error) throw error;
      return data;
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        category: existing.category ?? "",
        description: existing.description ?? "",
      });
      setImageUrl(existing.image_url);
    }
  }, [existing, reset]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      setImageUrl(await uploadFile(file, "potensi-wilayah"));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setIsUploading(false);
    }
  }

  const saveMutation = useMutation({
    mutationFn: async (values: PotentialFormValues) => {
      const payload = { ...values, image_url: imageUrl };
      if (isEditMode) {
        const { error } = await supabase.from("regional_potentials").update(payload).eq("id", potentialId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("regional_potentials").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-potentials"] });
      navigate("/potensi-wilayah");
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">{isEditMode ? "Edit Potensi Wilayah" : "Tambah Potensi Wilayah"}</h1>

      <form onSubmit={handleSubmit((values) => saveMutation.mutate(values))} className="max-w-2xl space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm text-slate-700">Judul</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("title")} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Kategori (opsional)</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("category")} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Deskripsi (opsional)</label>
          <textarea rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("description")} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Gambar (opsional)</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
          {isUploading && <p className="mt-1 text-xs text-slate-500">Mengunggah...</p>}
          {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 h-32 rounded-md object-cover" />}
        </div>

        {saveMutation.isError && <p className="text-sm text-red-600">Gagal menyimpan, silakan coba lagi.</p>}

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={isSubmitting || isUploading} className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" onClick={() => navigate("/potensi-wilayah")} className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
