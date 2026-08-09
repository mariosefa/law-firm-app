-- Dev-only: add delete support across matters/clients/deadlines/documents.
--
-- matters, deadlines, and documents already have "for all" anon
-- policies from earlier migrations, which already cover delete.
-- clients only ever got select + insert policies, so it needs a
-- delete policy of its own.
create policy "Allow anon delete access to clients"
  on public.clients
  for delete
  to anon
  using (true);

-- Deleting a matter should take its deadlines and documents with it —
-- they're meaningless without their matter. Switch those foreign keys
-- to ON DELETE CASCADE so this holds regardless of how the matter is
-- deleted (app code still deletes each document's file from Storage
-- before removing the matter, since a DB cascade can't reach into
-- Storage).
alter table public.deadlines
  drop constraint deadlines_matter_id_fkey,
  add constraint deadlines_matter_id_fkey
    foreign key (matter_id) references public.matters(id) on delete cascade;

alter table public.documents
  drop constraint documents_matter_id_fkey,
  add constraint documents_matter_id_fkey
    foreign key (matter_id) references public.matters(id) on delete cascade;

-- matters.client_id is NOT NULL, so there's no cascade/set-null option
-- for the client -> matters relationship that isn't destructive.
-- Deletion is blocked in the app when a client still has matters
-- (checked in deleteClientRecord), and the default foreign key
-- behavior (NO ACTION) backs that up at the DB level too — no
-- migration needed for that side.
