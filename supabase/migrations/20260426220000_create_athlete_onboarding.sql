-- AthletiQ: one row per authenticated user with onboarding answers for scheduling.
-- Apply with: `supabase db push` (CLI) or paste into Supabase Dashboard → SQL Editor.

create table if not exists public.athlete_onboarding (
  user_id uuid not null primary key references auth.users (id) on delete cascade,
  major text,
  year text,
  class_schedule text[] not null default '{}',
  sport text,
  position_or_event text,
  practice_schedule text,
  academic_priority integer not null default 50,
  athletic_priority integer not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint athlete_onboarding_priority_range
    check (
      academic_priority between 0 and 100
      and athletic_priority between 0 and 100
    )
);

comment on table public.athlete_onboarding is 'Onboarding profile data used by AthletiQ scheduling (one row per user).';

create index if not exists athlete_onboarding_updated_at_idx
  on public.athlete_onboarding (updated_at desc);

-- Keep updated_at in sync on every update
create or replace function public.set_athlete_onboarding_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists athlete_onboarding_set_updated_at on public.athlete_onboarding;

create trigger athlete_onboarding_set_updated_at
  before update on public.athlete_onboarding
  for each row
  execute function public.set_athlete_onboarding_updated_at();

alter table public.athlete_onboarding enable row level security;

-- Idempotent policies (safe to re-run)
drop policy if exists "athlete_onboarding_select_own" on public.athlete_onboarding;
drop policy if exists "athlete_onboarding_insert_own" on public.athlete_onboarding;
drop policy if exists "athlete_onboarding_update_own" on public.athlete_onboarding;
drop policy if exists "athlete_onboarding_delete_own" on public.athlete_onboarding;

create policy "athlete_onboarding_select_own"
  on public.athlete_onboarding
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "athlete_onboarding_insert_own"
  on public.athlete_onboarding
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "athlete_onboarding_update_own"
  on public.athlete_onboarding
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "athlete_onboarding_delete_own"
  on public.athlete_onboarding
  for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete on table public.athlete_onboarding to authenticated;
