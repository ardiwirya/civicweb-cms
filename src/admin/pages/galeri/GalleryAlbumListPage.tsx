import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Images, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

async function fetchAlbums() {
  const { data, error } = await supabase
    .from("gallery_albums")
    .select("id, title, cover_image_url")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export default function GalleryAlbumListPage() {
  const queryClient = useQueryClient();
  const { data: albums, isLoading } = useQuery({ queryKey: ["admin-gallery-albums"], queryFn: fetchAlbums });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // gallery_photos ikut terhapus otomatis lewat "on delete cascade" di schema
      const { error } = await supabase.from("gallery_albums").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-gallery-albums"] }),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Galeri</h1>
        <Link to="/galeri/baru" className="flex items-center gap-1 rounded-md bg-brand-primary px-3 py-2 text-sm font-medium text-white">
          <Plus className="h-4 w-4" />
          Tambah Album
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-sm text-slate-400">Memuat...</p>}
        {!isLoading && !albums?.length && <p className="text-sm text-slate-400">Belum ada album.</p>}
        {albums?.map((album) => (
          <div key={album.id} className="rounded-lg border border-slate-200 bg-white p-4">
            {album.cover_image_url && (
              <img src={album.cover_image_url} alt={album.title} className="mb-3 h-32 w-full rounded-md object-cover" />
            )}
            <h2 className="font-medium text-slate-900">{album.title}</h2>
            <div className="mt-3 flex gap-2">
              <Link to={`/galeri/${album.id}/foto`} className="flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700">
                <Images className="h-3.5 w-3.5" />
                Kelola Foto
              </Link>
              <Link to={`/galeri/${album.id}`} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
                <Pencil className="h-4 w-4" />
              </Link>
              <button onClick={() => confirm(`Hapus album "${album.title}" beserta semua fotonya?`) && deleteMutation.mutate(album.id)} className="rounded-md p-1.5 text-red-500 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
