import { supabase } from "@/lib/supabase/client";

/**
 * Upload file ke bucket "media" dan kembalikan public URL-nya.
 * folder membedakan asal gambar (mis. "news", "gallery", "umkm") supaya
 * file tidak bercampur di root bucket.
 */
export async function uploadFile(file: File, folder: string): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage.from("media").upload(fileName, file);
  if (error) {
    throw new Error(`Upload gagal: ${error.message}`);
  }

  const { data } = supabase.storage.from("media").getPublicUrl(fileName);
  return data.publicUrl;
}
