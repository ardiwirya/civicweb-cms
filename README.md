# CivicWeb

Template website instansi (desa, kecamatan, dinas, sekolah, lembaga, dll) yang
reusable. Satu deployment = satu instansi. Semua branding dan konten diatur
lewat database, bukan lewat kode.

## Preview

![Home](/public/home.png)

## Tech Stack

- Astro (public website, SSR)
- React (admin dashboard, mounted di `/admin/*`)
- TypeScript
- Tailwind CSS
- Supabase (Postgres, Auth, Storage)
- React Hook Form + Zod
- TanStack Query

## Struktur Folder

```
src/
  components/public/   komponen halaman publik (Navbar, Footer, dll)
  components/ui/        komponen dasar yang dipakai lintas halaman (Button, Card)
  layouts/               layout Astro (BaseLayout)
  pages/                 halaman publik (routing otomatis dari Astro)
  pages/admin/           satu file catch-all yang mount React admin app
  admin/                 seluruh kode React admin dashboard
    pages/                halaman-halaman dashboard
    components/           komponen dashboard (sidebar, layout)
    lib/                   hook & helper khusus admin (auth, dll)
  lib/supabase/          client Supabase & tipe database
  lib/config/             loader konfigurasi instansi (institution_profile)
  styles/                 global.css

supabase/
  migrations/             schema database (dijalankan urut)
  seed.sql                data dummy Desa Sukamaju, opsional untuk demo
```

## Setup Development

1. Buat project baru di [supabase.com](https://supabase.com)
2. Jalankan migration: `supabase db push` (atau paste isi `supabase/migrations/0001_init_schema.sql` ke SQL Editor)
3. (Opsional, untuk demo) jalankan `supabase/seed.sql` untuk data dummy Desa Sukamaju
4. Copy `.env.example` ke `.env` dan isi sesuai project Supabase Anda
5. `npm install`
6. `npm run dev`

Dashboard admin ada di `/admin`. User admin pertama dibuat lewat Supabase
Dashboard (Authentication > Users > Add User), lalu naikkan role-nya ke
`super_admin` langsung di tabel `profiles` lewat SQL Editor:

```sql
update profiles set role = 'super_admin' where id = '<user-id>';
```

## Cara Reuse untuk Instansi Lain

Template ini TIDAK menyimpan identitas "Desa Sukamaju" di kode manapun.
Untuk deploy ke instansi baru:

1. Buat project Supabase baru, jalankan migration yang sama (skip seed.sql)
2. Login ke `/admin`, isi menu "Kelola Profil Instansi": nama, logo, warna,
   alamat, kontak, sosial media, hero, footer
3. Selesai — seluruh tampilan publik otomatis mengikuti data tersebut

## Status Implementasi

**Selesai:**
- Seluruh 15 halaman public website (Home, Profil, Visi-Misi, Struktur
  Organisasi, Berita list+detail, Pengumuman, Agenda, Potensi Wilayah,
  UMKM, Wisata, Galeri album+detail, Statistik, Dokumen, FAQ, Kontak,
  Search), semuanya baca data dari database, tidak ada konten hardcode
- Dark mode, responsive navigation
- Dynamic sitemap.xml (bukan static, karena seluruh isi web server-rendered)
- Auth admin (login, route guard berbasis role)
- CRUD admin lengkap: Profil Instansi, Berita, Pengumuman, Agenda,
  Galeri (album + foto), Dokumen, Struktur Organisasi, UMKM, Potensi
  Wilayah, Pesan Masuk
- Upload gambar/file ke Supabase Storage dengan RLS
- Preview draft berita oleh admin (memanfaatkan RLS, bukan sistem preview terpisah)
- Sudah divalidasi dengan `astro check` (0 error) dan `astro build` + tes runtime nyata

**Belum ada / sengaja di-skip untuk MVP:**
- Kelola Wisata di admin (public page-nya ada, tapi tidak diminta di
  spec admin dashboard awal — polanya identik dengan UMKM kalau
  dibutuhkan, tinggal copy `src/admin/pages/umkm/`)
- Hierarki struktur organisasi bertingkat (kolom `parent_id` sudah ada
  di database, UI admin masih flat list)
- Pagination di halaman Berita publik (saat ini tampil semua, cukup
  untuk skala konten instansi kecil-menengah)
- Manajemen user admin oleh super_admin lewat UI (saat ini lewat SQL
  Editor Supabase, lihat bagian Setup di atas)
- Rich text editor untuk isi berita (saat ini textarea polos)

Riwayat commit dibuat bertahap per modul/perbaikan agar mudah ditelusuri
kalau ada yang perlu di-review atau di-revert.
