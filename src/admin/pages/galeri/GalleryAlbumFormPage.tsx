import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { uploadFile } from "@/admin/lib/uploadFile";

const albumSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().optional(),
});

type AlbumFormValues = z.infer<typeof albumSchema>;

export default function GalleryAlbumFormPage() {
  const { id } = useParams<{ id: string }>();
  const albumId = id!;
  const isEditMode = albumId !== "baru";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AlbumFormValues>({
    resolver: zodResolver(albumSchema),
  });

  const { data: existing } = useQuery({
    queryKey: ["admin-gallery-albums", albumId],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_albums").select("*").eq("id", albumId).single();
      if (error) throw error;
      return data;
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (existing) {
      reset({ title: existing.title, description: existing.description ?? "" });
      setCoverUrl(existing.cover_image_url);
    }
  }, [existing, reset]);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      setCoverUrl(await uploadFile(file, "gallery"));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setIsUploading(false);
    }
  }

  const saveMutation = useMutation({
    mutationFn: async (values: AlbumFormValues) => {
      const payload = { ...values, cover_image_url: coverUrl };
      if (isEditMode) {
        const { error } = await supabase.from("gallery_albums").update(payload).eq("id", albumId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("gallery_albums").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery-albums"] });
      navigate("/galeri");
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">{isEditMode ? "Edit Album" : "Tambah Album"}</h1>

      <form onSubmit={handleSubmit((values) => saveMutation.mutate(values))} className="max-w-2xl space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm text-slate-700">Judul Album</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("title")} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Deskripsi (opsional)</label>
          <textarea rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("description")} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Gambar Sampul</label>
          <input type="file" accept="image/*" onChange={handleCoverUpload} className="text-sm" />
          {isUploading && <p className="mt-1 text-xs text-slate-500">Mengunggah...</p>}
          {coverUrl && <img src={coverUrl} alt="Preview" className="mt-2 h-32 rounded-md object-cover" />}
        </div>

        {saveMutation.isError && <p className="text-sm text-red-600">Gagal menyimpan, silakan coba lagi.</p>}

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={isSubmitting || isUploading} className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" onClick={() => navigate("/galeri")} className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
