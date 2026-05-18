-- AuthDraft schema
-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/srbshimpvpueesfsxszz/sql/new
-- Or via: SUPABASE_DB_URL='postgresql://postgres:PASSWORD@db.srbshimpvpueesfsxszz.supabase.co:5432/postgres' node setup.js

create table if not exists public.users (
  id text primary key,                     -- Clerk user ID
  email text not null,
  name text,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text check (plan in ('starter','pro')) default null,
  usage_count integer default 0,
  usage_reset_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.users(id) on delete cascade,
  insurer text not null,
  request_type text not null,
  patient_age text,
  diagnosis text not null,
  procedure text not null,
  clinical_notes text,
  letter_text text not null,
  outcome text check (outcome in ('approved','denied')) default null,
  created_at timestamptz default now()
);

create index if not exists letters_user_id_idx on public.letters(user_id);

-- Enable RLS (all writes go through the service role key on the server, which bypasses RLS)
alter table public.users enable row level security;
alter table public.letters enable row level security;

-- Service role key bypasses RLS, so these policies only affect direct anon/authenticated access
-- (which we don't use — all DB calls are server-side with the service role key)
do $$ begin
  if not exists (select 1 from pg_policies where tablename='users' and policyname='service role full access users') then
    create policy "service role full access users" on public.users using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='letters' and policyname='service role full access letters') then
    create policy "service role full access letters" on public.letters using (true) with check (true);
  end if;
end $$;
