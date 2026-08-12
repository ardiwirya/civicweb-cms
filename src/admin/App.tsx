import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/admin/lib/useAuth";
import LoginPage from "@/admin/pages/LoginPage";
import DashboardPage from "@/admin/pages/DashboardPage";
import DashboardLayout from "@/admin/components/DashboardLayout";
import NewsListPage from "@/admin/pages/berita/NewsListPage";
import NewsFormPage from "@/admin/pages/berita/NewsFormPage";
import AnnouncementListPage from "@/admin/pages/pengumuman/AnnouncementListPage";
import AnnouncementFormPage from "@/admin/pages/pengumuman/AnnouncementFormPage";
import AgendaListPage from "@/admin/pages/agenda/AgendaListPage";
import AgendaFormPage from "@/admin/pages/agenda/AgendaFormPage";
import GalleryAlbumListPage from "@/admin/pages/galeri/GalleryAlbumListPage";
import GalleryAlbumFormPage from "@/admin/pages/galeri/GalleryAlbumFormPage";
import GalleryPhotosPage from "@/admin/pages/galeri/GalleryPhotosPage";
import DocumentListPage from "@/admin/pages/dokumen/DocumentListPage";
import OrganizationListPage from "@/admin/pages/struktur-organisasi/OrganizationListPage";
import BusinessListPage from "@/admin/pages/umkm/BusinessListPage";
import BusinessFormPage from "@/admin/pages/umkm/BusinessFormPage";
import PotentialListPage from "@/admin/pages/potensi-wilayah/PotentialListPage";
import PotentialFormPage from "@/admin/pages/potensi-wilayah/PotentialFormPage";
import InstitutionProfilePage from "@/admin/pages/profil/InstitutionProfilePage";
import MessageListPage from "@/admin/pages/pesan/MessageListPage";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoading, userId } = useAuth();

  if (isLoading) return <div className="p-6 text-sm text-slate-500">Memuat...</div>;
  if (!userId) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/admin">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/profil-instansi" element={<InstitutionProfilePage />} />
                    <Route path="/berita" element={<NewsListPage />} />
                    <Route path="/berita/:id" element={<NewsFormPage />} />
                    <Route path="/pengumuman" element={<AnnouncementListPage />} />
                    <Route path="/pengumuman/:id" element={<AnnouncementFormPage />} />
                    <Route path="/agenda" element={<AgendaListPage />} />
                    <Route path="/agenda/:id" element={<AgendaFormPage />} />
                    <Route path="/galeri" element={<GalleryAlbumListPage />} />
                    <Route path="/galeri/:id" element={<GalleryAlbumFormPage />} />
                    <Route path="/galeri/:albumId/foto" element={<GalleryPhotosPage />} />
                    <Route path="/dokumen" element={<DocumentListPage />} />
                    <Route path="/struktur-organisasi" element={<OrganizationListPage />} />
                    <Route path="/umkm" element={<BusinessListPage />} />
                    <Route path="/umkm/:id" element={<BusinessFormPage />} />
                    <Route path="/potensi-wilayah" element={<PotentialListPage />} />
                    <Route path="/potensi-wilayah/:id" element={<PotentialFormPage />} />
                    <Route path="/pesan" element={<MessageListPage />} />
                  </Routes>
                </DashboardLayout>
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
