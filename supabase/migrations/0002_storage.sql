-- ============================================================================
-- Storage bucket untuk media (cover berita, foto galeri, logo instansi, dll)
--
-- Satu bucket "media" dipakai untuk semua jenis gambar supaya admin tidak
-- perlu mikir bucket mana untuk upload apa. Pemisahan dilakukan lewat
-- folder di dalam path (news/, gallery/, umkm/, branding/, dst), bukan
-- lewat bucket terpisah - lebih sederhana untuk kebutuhan saat ini.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Siapa saja boleh melihat file (gambar publik seperti cover berita, logo, dst)
create policy "media_public_read"
  on storage.objects for select
  using (bucket_id = 'media');

-- Hanya admin/super_admin yang boleh upload, replace, atau hapus file
create policy "media_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'media' and is_admin_or_above(auth.uid()));

create policy "media_admin_update"
  on storage.objects for update
  using (bucket_id = 'media' and is_admin_or_above(auth.uid()));

create policy "media_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'media' and is_admin_or_above(auth.uid()));
