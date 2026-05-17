create table public.users (
  id text primary key, -- Clerk user ID
  email text not null,
  name text,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text check (plan in ('starter','pro')) default null,
  usage_count integer default 0,
  usage_reset_at timestamptz default now(),
  created_at timestamptz default now()
);

create table public.letters (
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

create index letters_user_id_idx on public.letters(user_id);
alter table public.users enable row level security;
alter table public.letters enable row level security;

create policy "Users can read own data" on public.users for select using (id = requesting_user_id());
create policy "Users can read own letters" on public.letters for select using (user_id = requesting_user_id());
create policy "Users can insert own letters" on public.letters for insert with check (user_id = requesting_user_id());
create policy "Users can update own letters" on public.letters for update using (user_id = requesting_user_id());
