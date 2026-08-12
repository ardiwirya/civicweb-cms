import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

async function fetchCounts() {
  const [news, announcements, agenda, messages] = await Promise.all([
    supabase.from("news").select("id", { count: "exact", head: true }),
    supabase.from("announcements").select("id", { count: "exact", head: true }),
    supabase.from("agenda_events").select("id", { count: "exact", head: true }),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
  ]);

  return {
    news: news.count ?? 0,
    announcements: announcements.count ?? 0,
    agenda: agenda.count ?? 0,
    unreadMessages: messages.count ?? 0,
  };
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard-counts"], queryFn: fetchCounts });

  const cards = [
    { label: "Total Berita", value: data?.news },
    { label: "Total Pengumuman", value: data?.announcements },
    { label: "Total Agenda", value: data?.agenda },
    { label: "Pesan Belum Dibaca", value: data?.unreadMessages },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Overview</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {isLoading ? "…" : card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
