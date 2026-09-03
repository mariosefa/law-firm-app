-- Dev-only: wire up the documents table and its storage bucket so the
-- app works today without auth, same approach as matters/clients/
-- deadlines.
--
-- The documents table didn't have a created_at column — every other
-- table in this schema (clients, matters) does, and the app's
-- "Uploaded" column needs a real timestamp to show, so this adds one
-- with the same default-now() convention used elsewhere.

alter table public.documents
  add column if not exists created_at timestamptz not null default now();

alter table public.documents enable row level security;

create policy "Allow anon full access to documents"
  on public.documents
  for all
  to anon
  using (true)
  with check (true);

-- Storage: create the bucket documents are uploaded into. Kept private
-- (public = false) — the app doesn't need public URLs, just anon
-- upload access via the policy below.
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Storage object access is governed separately from table RLS above —
-- this policy is what actually allows the anon key to upload/read the
-- file bytes in the "documents" bucket. storage.objects already has
-- RLS enabled by default in every Supabase project.
create policy "Allow anon full access to documents bucket objects"
  on storage.objects
  for all
  to anon
  using (bucket_id = 'documents')
  with check (bucket_id = 'documents');
