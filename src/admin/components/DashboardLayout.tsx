import {
  LayoutDashboard,
  Building2,
  Newspaper,
  Megaphone,
  CalendarDays,
  Image,
  FileText,
  Users,
  Store,
  MapPin,
  Mail,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const menuItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Profil Instansi", href: "/admin/profil-instansi", icon: Building2 },
  { label: "Berita", href: "/admin/berita", icon: Newspaper },
  { label: "Pengumuman", href: "/admin/pengumuman", icon: Megaphone },
  { label: "Agenda", href: "/admin/agenda", icon: CalendarDays },
  { label: "Galeri", href: "/admin/galeri", icon: Image },
  { label: "Dokumen", href: "/admin/dokumen", icon: FileText },
  { label: "Struktur Organisasi", href: "/admin/struktur-organisasi", icon: Users },
  { label: "UMKM", href: "/admin/umkm", icon: Store },
  { label: "Potensi Wilayah", href: "/admin/potensi-wilayah", icon: MapPin },
  { label: "Pesan Masuk", href: "/admin/pesan", icon: Mail },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-4 font-semibold text-slate-900">
          CivicWeb CMS
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </a>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mx-3 mt-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
