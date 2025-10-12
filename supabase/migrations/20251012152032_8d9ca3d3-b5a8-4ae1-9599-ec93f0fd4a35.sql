-- Create public bucket for school logos (idempotent)
insert into storage.buckets (id, name, public)
values ('school-logos', 'school-logos', true)
on conflict (id) do update set public = true;

-- Drop existing policies if they exist (to ensure clean state)
drop policy if exists "Public read school logos" on storage.objects;
drop policy if exists "Users can upload logos to their school folder" on storage.objects;
drop policy if exists "Users can update logos in their school folder" on storage.objects;
drop policy if exists "Users can delete logos in their school folder" on storage.objects;

-- Allow public read access to logos
create policy "Public read school logos"
  on storage.objects
  for select
  using (bucket_id = 'school-logos');

-- Helper condition: current user can manage files only in their school's folder
-- The top-level folder of the object key must match the user's school_id
-- Example key: <school_id>/logo.png

create policy "Users can upload logos to their school folder"
  on storage.objects
  for insert
  with check (
    bucket_id = 'school-logos'
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
        and (storage.foldername(name))[1] = p.school_id::text
    )
  );

create policy "Users can update logos in their school folder"
  on storage.objects
  for update
  using (
    bucket_id = 'school-logos'
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
        and (storage.foldername(name))[1] = p.school_id::text
    )
  )
  with check (
    bucket_id = 'school-logos'
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
        and (storage.foldername(name))[1] = p.school_id::text
    )
  );

create policy "Users can delete logos in their school folder"
  on storage.objects
  for delete
  using (
    bucket_id = 'school-logos'
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
        and (storage.foldername(name))[1] = p.school_id::text
    )
  );