import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { uploadFile } from "@/admin/lib/uploadFile";

const memberSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  position: z.string().min(2, "Jabatan wajib diisi"),
});

type MemberFormValues = z.infer<typeof memberSchema>;

async function fetchMembers() {
  const { data, error } = await supabase
    .from("organization_members")
    .select("id, name, position, photo_url")
    .order("order_index", { ascending: true });
  if (error) throw error;
  return data;
}

export default function OrganizationListPage() {
  const queryClient = useQueryClient();
  const { data: members, isLoading } = useQuery({ queryKey: ["admin-organization"], queryFn: fetchMembers });
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
  });

  const createMutation = useMutation({
    mutationFn: async (values: MemberFormValues) => {
      const { error } = await supabase.from("organization_members").insert({
        ...values,
        photo_url: photoUrl,
        order_index: members?.length ?? 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organization"] });
      reset();
      setPhotoUrl(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("organization_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-organization"] }),
  });

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      setPhotoUrl(await uploadFile(file, "organization"));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Struktur Organisasi</h1>

      <form
        onSubmit={handleSubmit((values) => createMutation.mutate(values))}
        className="mb-6 max-w-2xl space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <h2 className="font-medium text-slate-900">Tambah Anggota</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-700">Nama</label>
            <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Jabatan</label>
            <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("position")} />
            {errors.position && <p className="mt-1 text-xs text-red-600">{errors.position.message}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Foto (opsional)</label>
          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-sm" />
          {isUploading && <p className="mt-1 text-xs text-slate-500">Mengunggah...</p>}
        </div>

        <button type="submit" disabled={isSubmitting || isUploading} className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          Tambah
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading && <p className="text-sm text-slate-400">Memuat...</p>}
        {!isLoading && !members?.length && <p className="text-sm text-slate-400">Belum ada anggota.</p>}
        {members?.map((member) => (
          <div key={member.id} className="rounded-lg border border-slate-200 bg-white p-4 text-center">
            <img src={member.photo_url ?? "/placeholder-avatar.svg"} alt={member.name} className="mx-auto mb-2 h-16 w-16 rounded-full object-cover" />
            <p className="font-medium text-slate-900">{member.name}</p>
            <p className="text-sm text-slate-500">{member.position}</p>
            <button
              onClick={() => confirm(`Hapus "${member.name}"?`) && deleteMutation.mutate(member.id)}
              className="mt-2 flex items-center gap-1 text-xs text-red-500 mx-auto"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
