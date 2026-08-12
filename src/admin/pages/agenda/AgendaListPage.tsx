import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

async function fetchEvents() {
  const { data, error } = await supabase
    .from("agenda_events")
    .select("id, title, location, start_at, status")
    .order("start_at", { ascending: false });
  if (error) throw error;
  return data;
}

export default function AgendaListPage() {
  const queryClient = useQueryClient();
  const { data: events, isLoading } = useQuery({ queryKey: ["admin-agenda"], queryFn: fetchEvents });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agenda_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-agenda"] }),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Agenda</h1>
        <Link to="/agenda/baru" className="flex items-center gap-1 rounded-md bg-brand-primary px-3 py-2 text-sm font-medium text-white">
          <Plus className="h-4 w-4" />
          Tambah Agenda
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Kegiatan</th>
              <th className="px-4 py-3 font-medium">Lokasi</th>
              <th className="px-4 py-3 font-medium">Waktu</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Memuat...</td></tr>}
            {!isLoading && !events?.length && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Belum ada agenda.</td></tr>}
            {events?.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-slate-900">{item.title}</td>
                <td className="px-4 py-3 text-slate-600">{item.location ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(item.start_at).toLocaleDateString("id-ID")}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link to={`/agenda/${item.id}`} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button onClick={() => confirm(`Hapus "${item.title}"?`) && deleteMutation.mutate(item.id)} className="rounded-md p-1.5 text-red-500 hover:bg-red-50">
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
