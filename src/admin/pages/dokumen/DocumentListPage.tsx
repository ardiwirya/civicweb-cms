import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { uploadFile } from "@/admin/lib/uploadFile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const documentSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().optional(),
  category: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

async function fetchDocuments() {
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, category, file_url, file_size_kb")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export default function DocumentListPage() {
  const queryClient = useQueryClient();
  const { data: documents, isLoading } = useQuery({ queryKey: ["admin-documents"], queryFn: fetchDocuments });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
  });

  const createMutation = useMutation({
    mutationFn: async (values: DocumentFormValues) => {
      if (!file) throw new Error("Pilih file terlebih dahulu");
      setIsUploading(true);
      const fileUrl = await uploadFile(file, "documents");
      setIsUploading(false);
      const { error } = await supabase.from("documents").insert({
        ...values,
        file_url: fileUrl,
        file_size_kb: Math.round(file.size / 1024),
        published_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      reset();
      setFile(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-documents"] }),
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Dokumen</h1>

      <form
        onSubmit={handleSubmit((values) => createMutation.mutate(values))}
        className="mb-6 max-w-2xl space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <h2 className="font-medium text-slate-900">Tambah Dokumen Baru</h2>

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
          <textarea rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("description")} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>

        {createMutation.isError && (
          <p className="text-sm text-red-600">
            {createMutation.error instanceof Error ? createMutation.error.message : "Gagal menyimpan."}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isUploading ? "Mengunggah..." : "Simpan Dokumen"}
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Judul</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Ukuran</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Memuat...</td></tr>}
            {!isLoading && !documents?.length && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Belum ada dokumen.</td></tr>}
            {documents?.map((doc) => (
              <tr key={doc.id}>
                <td className="px-4 py-3 text-slate-900">
                  <a href={doc.file_url} target="_blank" rel="noreferrer" className="hover:underline">{doc.title}</a>
                </td>
                <td className="px-4 py-3 text-slate-600">{doc.category ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{doc.file_size_kb ? `${doc.file_size_kb} KB` : "-"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => confirm(`Hapus "${doc.title}"?`) && deleteMutation.mutate(doc.id)} className="rounded-md p-1.5 text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
