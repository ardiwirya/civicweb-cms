import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

async function fetchNews() {
  const { data, error } = await supabase
    .from("news")
    .select("id, title, category, status, published_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export default function NewsListPage() {
  const queryClient = useQueryClient();
  const { data: news, isLoading } = useQuery({ queryKey: ["admin-news"], queryFn: fetchNews });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-news"] }),
  });

  function handleDelete(id: string, title: string) {
    if (confirm(`Hapus berita "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Berita</h1>
        <Link
          to="/berita/baru"
          className="flex items-center gap-1 rounded-md bg-brand-primary px-3 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Tambah Berita
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Judul</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">Memuat...</td>
              </tr>
            )}
            {!isLoading && !news?.length && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">Belum ada berita.</td>
              </tr>
            )}
            {news?.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-slate-900">{item.title}</td>
                <td className="px-4 py-3 text-slate-600">{item.category ?? "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.status === "published" ? "Terbit" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link to={`/berita/${item.id}`} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
