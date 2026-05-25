-- classify_usage: per-user daily rate limit tracking for the classify-task Edge Function.
-- One row per (user, date). Updated by the Edge Function via upsert.

create table if not exists public.classify_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

alter table public.classify_usage enable row level security;

create policy "classify_usage_own_select"
  on public.classify_usage for select
  using (auth.uid() = user_id);

create policy "classify_usage_own_insert"
  on public.classify_usage for insert
  with check (auth.uid() = user_id);

create policy "classify_usage_own_update"
  on public.classify_usage for update
  using (auth.uid() = user_id);

create index if not exists classify_usage_date_idx
  on public.classify_usage (date);
