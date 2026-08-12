import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

const announcementSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
  content: z.string().min(10, "Isi pengumuman minimal 10 karakter"),
  is_pinned: z.boolean(),
  status: z.enum(["draft", "published"]),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export default function AnnouncementFormPage() {
  const { id } = useParams<{ id: string }>();
  const announcementId = id!;
  const isEditMode = announcementId !== "baru";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { status: "draft", is_pinned: false },
  });

  const { data: existing } = useQuery({
    queryKey: ["admin-announcements", announcementId],
    queryFn: async () => {
      const { data, error } = await supabase.from("announcements").select("*").eq("id", announcementId).single();
      if (error) throw error;
      return data;
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        content: existing.content,
        is_pinned: existing.is_pinned,
        status: existing.status,
      });
    }
  }, [existing, reset]);

  const saveMutation = useMutation({
    mutationFn: async (values: AnnouncementFormValues) => {
      const payload = {
        ...values,
        published_at: values.status === "published" ? new Date().toISOString() : null,
      };
      if (isEditMode) {
        const { error } = await supabase.from("announcements").update(payload).eq("id", announcementId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("announcements").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      navigate("/pengumuman");
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">{isEditMode ? "Edit Pengumuman" : "Tambah Pengumuman"}</h1>

      <form onSubmit={handleSubmit((values) => saveMutation.mutate(values))} className="max-w-2xl space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm text-slate-700">Judul</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("title")} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Isi Pengumuman</label>
          <textarea rows={5} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("content")} />
          {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" {...register("is_pinned")} />
          Sematkan di atas daftar pengumuman
        </label>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Status</label>
          <select className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("status")}>
            <option value="draft">Draft</option>
            <option value="published">Terbit</option>
          </select>
        </div>

        {saveMutation.isError && <p className="text-sm text-red-600">Gagal menyimpan, silakan coba lagi.</p>}

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={isSubmitting} className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" onClick={() => navigate("/pengumuman")} className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
