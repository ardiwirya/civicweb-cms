import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { uploadFile } from "@/admin/lib/uploadFile";

const newsSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
  slug: z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda -"),
  excerpt: z.string().optional(),
  content: z.string().min(20, "Isi berita minimal 20 karakter"),
  category: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

type NewsFormValues = z.infer<typeof newsSchema>;

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function NewsFormPage() {
  // Route /berita/:id menjamin param ini selalu ada saat komponen dirender;
  // non-null assertion di sini valid karena tidak ada jalur render tanpa id.
  const { id } = useParams<{ id: string }>();
  const newsId = id!;
  const isEditMode = newsId !== "baru";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: { status: "draft" },
  });

  // Ambil data existing kalau mode edit
  const { data: existing } = useQuery({
    queryKey: ["admin-news", newsId],
    queryFn: async () => {
      const { data, error } = await supabase.from("news").select("*").eq("id", newsId).single();
      if (error) throw error;
      return data;
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        slug: existing.slug,
        excerpt: existing.excerpt ?? "",
        content: existing.content,
        category: existing.category ?? "",
        status: existing.status,
      });
      setCoverUrl(existing.cover_image_url);
      setSlugTouched(true);
    }
  }, [existing, reset]);

  // Auto-generate slug dari judul, tapi berhenti kalau user sudah edit slug manual
  const titleValue = watch("title");
  useEffect(() => {
    if (!slugTouched && titleValue) {
      setValue("slug", slugify(titleValue));
    }
  }, [titleValue, slugTouched, setValue]);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadFile(file, "news");
      setCoverUrl(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setIsUploading(false);
    }
  }

  const saveMutation = useMutation({
    mutationFn: async (values: NewsFormValues) => {
      const payload = {
        ...values,
        cover_image_url: coverUrl,
        published_at: values.status === "published" ? new Date().toISOString() : null,
      };

      if (isEditMode) {
        const { error } = await supabase.from("news").update(payload).eq("id", newsId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("news").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      navigate("/berita");
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">
        {isEditMode ? "Edit Berita" : "Tambah Berita"}
      </h1>

      <form
        onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
        className="max-w-2xl space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <div>
          <label className="mb-1 block text-sm text-slate-700">Judul</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("title")} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Slug (URL)</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register("slug", { onChange: () => setSlugTouched(true) })}
          />
          {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Kategori (opsional)</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("category")} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Ringkasan (opsional)</label>
          <textarea rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("excerpt")} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Isi Berita</label>
          <textarea rows={8} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("content")} />
          {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Gambar Sampul</label>
          <input type="file" accept="image/*" onChange={handleCoverUpload} className="text-sm" />
          {isUploading && <p className="mt-1 text-xs text-slate-500">Mengunggah...</p>}
          {coverUrl && <img src={coverUrl} alt="Preview" className="mt-2 h-32 rounded-md object-cover" />}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Status</label>
          <select className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("status")}>
            <option value="draft">Draft</option>
            <option value="published">Terbit</option>
          </select>
        </div>

        {saveMutation.isError && (
          <p className="text-sm text-red-600">Gagal menyimpan, silakan coba lagi.</p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
          {isEditMode && existing?.slug && (
            <a
              href={`/berita/${existing.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700"
            >
              Pratinjau
            </a>
          )}
          <button
            type="button"
            onClick={() => navigate("/berita")}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
