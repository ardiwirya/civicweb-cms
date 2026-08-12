-- Data dummy untuk demo template ini: "Desa Bangun Rejo".
-- File ini TIDAK dijalankan otomatis saat deploy ke instansi baru.
-- Jalankan manual hanya kalau butuh contoh data untuk development/demo:
--   supabase db execute -f supabase/seed.sql

update institution_profile
set
  name = 'Desa Bangun Rejo',
  type = 'desa',
  primary_color = '22 163 74',
  secondary_color = '15 23 42',
  address = 'Jl. Raya Bangun Rejo No. 1, Kecamatan Terbanggi Besar, Kabupaten Lampung Tengah',
  phone = '(021) 555-0123',
  email = 'info@desabangunrejo.go.id',
  social_media = '{"facebook": "desabangunrejo", "instagram": "desabangunrejo"}'::jsonb,
  vision = 'Mewujudkan Desa Bangun Rejo yang mandiri, sejahtera, dan berbudaya.',
  mission = 'Meningkatkan pelayanan publik yang transparan dan partisipatif.',
  hero_title = 'Selamat Datang di Desa Bangun Rejo',
  hero_subtitle = 'Portal informasi resmi Pemerintah Desa Bangun Rejo',
  footer_text = '© 2026 Pemerintah Desa Bangun Rejo. Seluruh hak cipta dilindungi.'
where id = 1;

insert into news (title, slug, excerpt, content, category, status, published_at) values
  ('Musyawarah Desa Bahas RKP Tahun 2026', 'musyawarah-desa-rkp-2026',
   'Pemerintah Desa Bangun Rejo menggelar musyawarah desa untuk membahas Rencana Kerja Pemerintah tahun 2026.',
   'Isi lengkap berita akan ditulis di sini oleh admin melalui dashboard.',
   'Pemerintahan', 'published', now() - interval '2 days'),
  ('Vaksinasi Massal di Balai Desa', 'vaksinasi-massal-balai-desa',
   'Kegiatan vaksinasi massal diadakan di Balai Desa Bangun Rejo, diikuti oleh ratusan warga.',
   'Isi lengkap berita akan ditulis di sini oleh admin melalui dashboard.',
   'Kesehatan', 'published', now() - interval '5 days');

insert into announcements (title, content, is_pinned, status, published_at) values
  ('Jadwal Pelayanan Administrasi Kependudukan', 'Pelayanan buka Senin-Jumat pukul 08.00-15.00 WIB.', true, 'published', now() - interval '1 day');

insert into agenda_events (title, description, location, start_at, status) values
  ('Rapat Koordinasi RT/RW', 'Rapat koordinasi bulanan seluruh ketua RT dan RW.', 'Balai Desa Bangun Rejo', now() + interval '3 days', 'published');

insert into businesses (name, owner_name, description, category) values
  ('Keripik Singkong Bu Sari', 'Sari Wulandari', 'Produk keripik singkong khas Desa Bangun Rejo dengan berbagai varian rasa.', 'Kuliner');

insert into attractions (name, description, location, category) values
  ('Bukit Bangun Rejo', 'Spot wisata alam dengan pemandangan perbukitan dan area kemah.', 'Dusun Bangun Rejo Atas', 'Wisata Alam');

insert into regional_potentials (title, description, category) values
  ('Pertanian Padi Organik', 'Sebagian besar lahan Desa Bangun Rejo digunakan untuk pertanian padi organik.', 'Pertanian');

insert into statistics (label, value, unit, category, year) values
  ('Jumlah Penduduk', 4820, 'jiwa', 'Kependudukan', 2026),
  ('Jumlah KK', 1340, 'KK', 'Kependudukan', 2026);

insert into faqs (question, answer, order_index) values
  ('Bagaimana cara mengurus KTP baru?', 'Datang langsung ke kantor desa dengan membawa dokumen persyaratan lengkap.', 1);

insert into organization_members (name, position, order_index) values
  ('H. Ahmad Suryana', 'Kepala Desa', 1),
  ('Rina Marlina', 'Sekretaris Desa', 2),
  ('Dedi Kurniawan', 'Kepala Urusan Keuangan', 3);

with new_album as (
  insert into gallery_albums (title, description)
  values ('Kegiatan Gotong Royong 2026', 'Dokumentasi kegiatan gotong royong warga Desa Bangun Rejo')
  returning id
)
insert into gallery_photos (album_id, image_url, caption, order_index)
select id, 'https://placehold.co/600x400', 'Warga membersihkan saluran irigasi', 1 from new_album;

insert into documents (title, description, category, file_url, file_size_kb, published_at) values
  ('Peraturan Desa No. 3 Tahun 2026', 'Peraturan tentang APBDes Tahun Anggaran 2026', 'Peraturan Desa', 'https://example.com/dokumen/perdes-3-2026.pdf', 850, now());
