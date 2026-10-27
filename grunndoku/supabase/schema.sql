-- Reviewed schema snapshot. Applied remotely through Supabase MCP as
-- create_grunndoku_progress. This file is not a generated local CLI migration.
create schema if not exists grunndoku_internal;
revoke all on schema grunndoku_internal from public, anon, authenticated;

create table public.grunndoku_progress (
 user_id uuid not null references auth.users(id) on delete cascade,
 puzzle_id text not null check (puzzle_id ~ '^[a-zA-Z0-9_-]{1,120}$'),
 state jsonb not null check (jsonb_typeof(state) = 'object' and octet_length(state::text) <= 262144),
 version bigint not null default 1 check (version > 0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 primary key (user_id, puzzle_id)
);
alter table public.grunndoku_progress enable row level security;
revoke all on public.grunndoku_progress from public, anon, authenticated;
grant select on public.grunndoku_progress to authenticated;
grant insert (user_id, puzzle_id, state) on public.grunndoku_progress to authenticated;
grant update (state) on public.grunndoku_progress to authenticated;

create policy progress_select_own on public.grunndoku_progress for select to authenticated
 using ((select auth.uid()) = user_id);
create policy progress_insert_own on public.grunndoku_progress for insert to authenticated
 with check ((select auth.uid()) = user_id);
create policy progress_update_own on public.grunndoku_progress for update to authenticated
 using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create function grunndoku_internal.touch_progress() returns trigger
 language plpgsql security invoker set search_path = '' as $$
begin
 new.version := old.version + 1;
 new.updated_at := clock_timestamp();
 return new;
end;
$$;
revoke all on function grunndoku_internal.touch_progress() from public, anon, authenticated;
create trigger touch_grunndoku_progress before update on public.grunndoku_progress
 for each row execute function grunndoku_internal.touch_progress();
