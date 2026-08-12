import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

async function fetchMessages() {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, is_read, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export default function MessageListPage() {
  const queryClient = useQueryClient();
  const { data: messages, isLoading } = useQuery({ queryKey: ["admin-messages"], queryFn: fetchMessages });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-messages"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-messages"] }),
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Pesan Masuk</h1>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-slate-400">Memuat...</p>}
        {!isLoading && !messages?.length && <p className="text-sm text-slate-400">Belum ada pesan masuk.</p>}
        {messages?.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-lg border p-4 ${msg.is_read ? "border-slate-200 bg-white" : "border-brand-primary/30 bg-brand-primary/5"}`}
            onClick={() => !msg.is_read && markReadMutation.mutate(msg.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900">{msg.subject}</p>
                <p className="text-xs text-slate-500">{msg.name} · {msg.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {!msg.is_read && (
                  <span className="rounded-full bg-brand-primary px-2 py-0.5 text-xs font-medium text-white">Baru</span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Hapus pesan ini?")) deleteMutation.mutate(msg.id);
                  }}
                  className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600">{msg.message}</p>
            <p className="mt-2 text-xs text-slate-400">
              {new Date(msg.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
