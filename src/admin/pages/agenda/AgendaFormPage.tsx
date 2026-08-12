import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

const agendaSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
  description: z.string().optional(),
  location: z.string().optional(),
  start_at: z.string().min(1, "Waktu mulai wajib diisi"),
  status: z.enum(["draft", "published"]),
});

type AgendaFormValues = z.infer<typeof agendaSchema>;

// input type="datetime-local" butuh format "YYYY-MM-DDTHH:mm" (tanpa timezone/detik)
function toDatetimeLocalValue(isoString: string) {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function AgendaFormPage() {
  const { id } = useParams<{ id: string }>();
  const agendaId = id!;
  const isEditMode = agendaId !== "baru";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AgendaFormValues>({
    resolver: zodResolver(agendaSchema),
    defaultValues: { status: "draft" },
  });

  const { data: existing } = useQuery({
    queryKey: ["admin-agenda", agendaId],
    queryFn: async () => {
      const { data, error } = await supabase.from("agenda_events").select("*").eq("id", agendaId).single();
      if (error) throw error;
      return data;
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        description: existing.description ?? "",
        location: existing.location ?? "",
        start_at: toDatetimeLocalValue(existing.start_at),
        status: existing.status,
      });
    }
  }, [existing, reset]);

  const saveMutation = useMutation({
    mutationFn: async (values: AgendaFormValues) => {
      const payload = {
        ...values,
        start_at: new Date(values.start_at).toISOString(),
      };
      if (isEditMode) {
        const { error } = await supabase.from("agenda_events").update(payload).eq("id", agendaId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("agenda_events").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-agenda"] });
      navigate("/agenda");
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">{isEditMode ? "Edit Agenda" : "Tambah Agenda"}</h1>

      <form onSubmit={handleSubmit((values) => saveMutation.mutate(values))} className="max-w-2xl space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm text-slate-700">Judul Kegiatan</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("title")} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Waktu Mulai</label>
          <input type="datetime-local" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("start_at")} />
          {errors.start_at && <p className="mt-1 text-xs text-red-600">{errors.start_at.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Lokasi (opsional)</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("location")} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Deskripsi (opsional)</label>
          <textarea rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("description")} />
        </div>

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
          <button type="button" onClick={() => navigate("/agenda")} className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
