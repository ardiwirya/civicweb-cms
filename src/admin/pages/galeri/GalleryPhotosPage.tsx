import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { uploadFile } from "@/admin/lib/uploadFile";

export default function GalleryPhotosPage() {
  const { albumId } = useParams<{ albumId: string }>();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: album } = useQuery({
    queryKey: ["admin-gallery-albums", albumId],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_albums").select("title").eq("id", albumId!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: photos, isLoading } = useQuery({
    queryKey: ["admin-gallery-photos", albumId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_photos")
        .select("id, image_url, caption")
        .eq("album_id", albumId!)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const addPhotoMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      const { error } = await supabase.from("gallery_photos").insert({
        album_id: albumId!,
        image_url: imageUrl,
        order_index: photos?.length ?? 0,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-gallery-photos", albumId] }),
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase.from("gallery_photos").delete().eq("id", photoId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-gallery-photos", albumId] }),
  });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadFile(file, "gallery");
      addPhotoMutation.mutate(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <Link to="/galeri" className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar album
      </Link>

      <h1 className="mb-6 text-xl font-semibold text-slate-900">Foto - {album?.title}</h1>

      <div className="mb-6 rounded-lg border border-dashed border-slate-300 bg-white p-4">
        <label className="mb-1 block text-sm text-slate-700">Tambah Foto</label>
        <input type="file" accept="image/*" onChange={handleUpload} className="text-sm" />
        {isUploading && <p className="mt-1 text-xs text-slate-500">Mengunggah...</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading && <p className="text-sm text-slate-400">Memuat...</p>}
        {!isLoading && !photos?.length && <p className="text-sm text-slate-400">Belum ada foto di album ini.</p>}
        {photos?.map((photo) => (
          <div key={photo.id} className="relative overflow-hidden rounded-lg border border-slate-200">
            <img src={photo.image_url} alt={photo.caption ?? ""} className="h-32 w-full object-cover" />
            <button
              onClick={() => confirm("Hapus foto ini?") && deletePhotoMutation.mutate(photo.id)}
              className="absolute right-1 top-1 rounded-md bg-white/90 p-1 text-red-500 hover:bg-white"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
