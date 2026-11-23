-- MatPlan shared workspace schema.
-- Run this once in the Supabase dashboard: Project -> SQL Editor -> New query -> Run.

-- ---------- Invite-only allowlist ----------
-- Sign-up is rejected for any email not listed here, even if someone calls
-- the auth API directly (the check runs as a trigger on auth.users, not in
-- app code, so there's no way to route around it from the client).
create table if not exists public.allowed_coach_emails (
  email text primary key
);

alter table public.allowed_coach_emails enable row level security;
-- No policies are added on purpose: nothing needs client-side access to this
-- table. The trigger below reads it as `security definer`, which bypasses RLS.

create or replace function public.enforce_coach_allowlist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.allowed_coach_emails
    where lower(email) = lower(new.email)
  ) then
    raise exception 'Sign-up is invite-only. % is not on the allowed list.', new.email;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_coach_allowlist_trigger on auth.users;
create trigger enforce_coach_allowlist_trigger
  before insert on auth.users
  for each row execute function public.enforce_coach_allowlist();

-- Add your coaches before inviting them (Authentication -> Users -> Invite
-- user, in the dashboard). Run this for each one, editing the email:
--   insert into public.allowed_coach_emails (email) values ('coach@example.com');

-- ---------- Shared app state ----------
-- The whole app's data (teams, roster, practices, syllabus, weigh-ins,
-- history, theme) lives in one JSONB blob shared by every signed-in coach —
-- the same shape MatPlan already keeps in memory client-side, just persisted
-- centrally instead of per-browser.
create table if not exists public.app_state (
  id text primary key default 'singleton',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table public.app_state enable row level security;

create policy "coaches can read app_state" on public.app_state
  for select to authenticated using (true);
create policy "coaches can insert app_state" on public.app_state
  for insert to authenticated with check (true);
create policy "coaches can update app_state" on public.app_state
  for update to authenticated using (true) with check (true);

-- Realtime, so an open tab picks up another coach's changes without a reload.
alter publication supabase_realtime add table public.app_state;

-- ---------- Document library ----------
-- A shared bucket for reusable files (handbooks, forms, waivers, rosters,
-- ...) coaches upload once and download repeatedly. Only the raw file bytes
-- live here — each file's name, size, and who/when it was uploaded is
-- metadata that lives in app_state.data.documents instead, right alongside
-- the rest of the shared state, so the state blob itself stays tiny no
-- matter how many or how large the files in this bucket get.
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "coaches can read documents" on storage.objects
  for select to authenticated using (bucket_id = 'documents');
create policy "coaches can upload documents" on storage.objects
  for insert to authenticated with check (bucket_id = 'documents');
create policy "coaches can delete documents" on storage.objects
  for delete to authenticated using (bucket_id = 'documents');
