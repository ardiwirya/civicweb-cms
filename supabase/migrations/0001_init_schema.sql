-- ============================================================================
-- CivicWeb CMS - Initial schema
--
-- Catatan desain:
-- - Project ini single-tenant per deployment. Satu instance database =
--   satu instansi. institution_profile sengaja dibuat sebagai tabel dengan
--   1 baris (bukan multi-tenant), supaya RLS tetap sederhana. Instansi lain
--   yang mau pakai template ini deploy project Supabase baru.
-- - Role user disimpan di tabel profiles, bukan di app_metadata Supabase,
--   supaya gampang di-query lewat SQL biasa dan di-manage lewat dashboard.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('super_admin', 'admin');
create type content_status as enum ('draft', 'published');
create type institution_type as enum (
  'desa', 'kecamatan', 'dinas', 'sekolah', 'lembaga', 'instansi', 'organisasi'
);

-- ---------------------------------------------------------------------------
-- profiles
-- Menyimpan role tambahan untuk setiap user auth.users.
-- Dibuat otomatis lewat trigger saat user baru mendaftar (lihat di bawah).
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'admin',
  created_at timestamptz not null default now()
);

-- Helper functions dipakai berulang kali di RLS policy di bawah.
-- security definer supaya bisa baca tabel profiles walau caller belum
-- punya akses langsung ke tabel tersebut.
create function is_admin_or_above(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = uid and role in ('admin', 'super_admin')
  );
$$;

create function is_super_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = uid and role = 'super_admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- institution_profile
-- Satu-satunya baris konfigurasi branding & identitas instansi.
-- id dikunci ke 1 lewat check constraint supaya tidak ada baris kedua.
-- ---------------------------------------------------------------------------
create table institution_profile (
  id integer primary key default 1,
  name text not null,
  type institution_type not null default 'desa',
  logo_url text,
  favicon_url text,
  primary_color text not null default '22 163 74',   -- format "R G B", dipakai sebagai CSS variable
  secondary_color text not null default '15 23 42',
  address text,
  phone text,
  email text,
  social_media jsonb not null default '{}'::jsonb,    -- { "facebook": "...", "instagram": "..." }
  vision text,
  mission text,
  hero_title text,
  hero_subtitle text,
  hero_image_url text,
  footer_text text,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- ---------------------------------------------------------------------------
-- organization_members (struktur organisasi)
-- parent_id memungkinkan struktur bertingkat sederhana (opsional dipakai).
-- ---------------------------------------------------------------------------
create table organization_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null,
  photo_url text,
  parent_id uuid references organization_members(id) on delete set null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- news (berita)
-- ---------------------------------------------------------------------------
create table news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  category text,
  status content_status not null default 'draft',
  author_id uuid references profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index news_status_published_idx on news (status, published_at desc);

-- ---------------------------------------------------------------------------
-- announcements (pengumuman)
-- ---------------------------------------------------------------------------
create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  attachment_url text,
  is_pinned boolean not null default false,
  status content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now()
);
create index announcements_status_idx on announcements (status, is_pinned desc, published_at desc);

-- ---------------------------------------------------------------------------
-- agenda_events (agenda kegiatan)
-- ---------------------------------------------------------------------------
create table agenda_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  start_at timestamptz not null,
  end_at timestamptz,
  status content_status not null default 'draft',
  created_at timestamptz not null default now()
);
create index agenda_events_start_idx on agenda_events (start_at);

-- ---------------------------------------------------------------------------
-- gallery_albums & gallery_photos (galeri)
-- ---------------------------------------------------------------------------
create table gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_image_url text,
  created_at timestamptz not null default now()
);

create table gallery_photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references gallery_albums(id) on delete cascade,
  image_url text not null,
  caption text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
create index gallery_photos_album_idx on gallery_photos (album_id);

-- ---------------------------------------------------------------------------
-- documents (dokumen / download)
-- ---------------------------------------------------------------------------
create table documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  file_url text not null,
  file_size_kb integer,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- businesses (UMKM)
-- ---------------------------------------------------------------------------
create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_name text,
  description text,
  category text,
  image_url text,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- attractions (wisata)
-- ---------------------------------------------------------------------------
create table attractions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  location text,
  category text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- regional_potentials (potensi wilayah, mis. pertanian, perikanan, dst)
-- ---------------------------------------------------------------------------
create table regional_potentials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  image_url text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- statistics (statistik, mis. jumlah penduduk per tahun)
-- ---------------------------------------------------------------------------
create table statistics (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value numeric not null,
  unit text,
  category text,
  year integer,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- faqs
-- ---------------------------------------------------------------------------
create table faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- contact_messages (pesan dari form kontak publik)
-- ---------------------------------------------------------------------------
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table profiles enable row level security;
alter table institution_profile enable row level security;
alter table organization_members enable row level security;
alter table news enable row level security;
alter table announcements enable row level security;
alter table agenda_events enable row level security;
alter table gallery_albums enable row level security;
alter table gallery_photos enable row level security;
alter table documents enable row level security;
alter table businesses enable row level security;
alter table attractions enable row level security;
alter table regional_potentials enable row level security;
alter table statistics enable row level security;
alter table faqs enable row level security;
alter table contact_messages enable row level security;

-- profiles: user lihat profil sendiri, super_admin lihat & kelola semua
create policy "profiles_select_own_or_super_admin"
  on profiles for select
  using (id = auth.uid() or is_super_admin(auth.uid()));

create policy "profiles_manage_super_admin_only"
  on profiles for all
  using (is_super_admin(auth.uid()))
  with check (is_super_admin(auth.uid()));

-- institution_profile: siapa saja boleh baca (dipakai public website),
-- hanya admin/super_admin yang boleh ubah
create policy "institution_profile_public_read"
  on institution_profile for select
  using (true);

create policy "institution_profile_admin_write"
  on institution_profile for update
  using (is_admin_or_above(auth.uid()))
  with check (is_admin_or_above(auth.uid()));

-- Pola yang sama diulang untuk semua tabel konten publik:
-- - SELECT terbuka untuk publik (anon + authenticated)
-- - INSERT/UPDATE/DELETE hanya untuk admin_or_above
-- Untuk tabel yang punya kolom status, publik hanya boleh lihat yang
-- "published"; admin tetap bisa lihat draft.

create policy "organization_members_public_read" on organization_members for select using (true);
create policy "organization_members_admin_write" on organization_members for all
  using (is_admin_or_above(auth.uid())) with check (is_admin_or_above(auth.uid()));

create policy "news_public_read" on news for select
  using (status = 'published' or is_admin_or_above(auth.uid()));
create policy "news_admin_write" on news for all
  using (is_admin_or_above(auth.uid())) with check (is_admin_or_above(auth.uid()));

create policy "announcements_public_read" on announcements for select
  using (status = 'published' or is_admin_or_above(auth.uid()));
create policy "announcements_admin_write" on announcements for all
  using (is_admin_or_above(auth.uid())) with check (is_admin_or_above(auth.uid()));

create policy "agenda_events_public_read" on agenda_events for select
  using (status = 'published' or is_admin_or_above(auth.uid()));
create policy "agenda_events_admin_write" on agenda_events for all
  using (is_admin_or_above(auth.uid())) with check (is_admin_or_above(auth.uid()));

create policy "gallery_albums_public_read" on gallery_albums for select using (true);
create policy "gallery_albums_admin_write" on gallery_albums for all
  using (is_admin_or_above(auth.uid())) with check (is_admin_or_above(auth.uid()));

create policy "gallery_photos_public_read" on gallery_photos for select using (true);
create policy "gallery_photos_admin_write" on gallery_photos for all
  using (is_admin_or_above(auth.uid())) with check (is_admin_or_above(auth.uid()));

create policy "documents_public_read" on documents for select using (true);
create policy "documents_admin_write" on documents for all
  using (is_admin_or_above(auth.uid())) with check (is_admin_or_above(auth.uid()));

create policy "businesses_public_read" on businesses for select using (true);
create policy "businesses_admin_write" on businesses for all
  using (is_admin_or_above(auth.uid())) with check (is_admin_or_above(auth.uid()));

create policy "attractions_public_read" on attractions for select using (true);
create policy "attractions_admin_write" on attractions for all
  using (is_admin_or_above(auth.uid())) with check (is_admin_or_above(auth.uid()));

create policy "regional_potentials_public_read" on regional_potentials for select using (true);
create policy "regional_potentials_admin_write" on regional_potentials for all
  using (is_admin_or_above(auth.uid())) with check (is_admin_or_above(auth.uid()));

create policy "statistics_public_read" on statistics for select using (true);
create policy "statistics_admin_write" on statistics for all
  using (is_admin_or_above(auth.uid())) with check (is_admin_or_above(auth.uid()));

create policy "faqs_public_read" on faqs for select using (true);
create policy "faqs_admin_write" on faqs for all
  using (is_admin_or_above(auth.uid())) with check (is_admin_or_above(auth.uid()));

-- contact_messages: siapa saja (termasuk anon) boleh kirim pesan,
-- tapi hanya admin yang boleh membaca dan mengubah status baca
create policy "contact_messages_public_insert"
  on contact_messages for insert
  with check (true);

create policy "contact_messages_admin_read"
  on contact_messages for select
  using (is_admin_or_above(auth.uid()));

create policy "contact_messages_admin_update"
  on contact_messages for update
  using (is_admin_or_above(auth.uid()))
  with check (is_admin_or_above(auth.uid()));

-- ---------------------------------------------------------------------------
-- Trigger: buat baris profiles otomatis saat user baru dibuat di auth.users.
-- Role default 'admin' — perubahan ke 'super_admin' harus dilakukan manual
-- oleh super_admin lain lewat dashboard, tidak bisa self-assign.
-- ---------------------------------------------------------------------------
create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email), 'admin');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- baris konfigurasi awal, diisi ulang oleh admin lewat dashboard
insert into institution_profile (id, name, type)
values (1, 'Nama Instansi', 'desa');
