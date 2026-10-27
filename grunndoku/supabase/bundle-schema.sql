-- Snapshot of the remote bundle-access migration. No real codes or paid content.
create table public.grunndoku_bundles (
 id text primary key check (id ~ '^bundle-[a-z0-9-]{1,80}$'),
 title text not null check (length(title) between 1 and 120),
 description text not null default '' check (length(description)<=1500),
 case_count integer not null default 0 check (case_count between 0 and 100),
 enabled boolean not null default false
);
alter table public.grunndoku_bundles enable row level security;
revoke all on public.grunndoku_bundles from public,anon,authenticated;
grant select on public.grunndoku_bundles to anon,authenticated;
create policy bundle_catalog on public.grunndoku_bundles for select to anon,authenticated using (enabled);

create table public.grunndoku_bundle_access (
 user_id uuid not null references auth.users(id) on delete cascade,
 bundle_id text not null references public.grunndoku_bundles(id),
 activated_at timestamptz not null default now(),
 primary key(user_id,bundle_id)
);
create index grunndoku_bundle_access_bundle_idx on public.grunndoku_bundle_access(bundle_id);
alter table public.grunndoku_bundle_access enable row level security;
revoke all on public.grunndoku_bundle_access from public,anon,authenticated;
grant select on public.grunndoku_bundle_access to authenticated;
create policy own_bundle_access on public.grunndoku_bundle_access for select to authenticated using ((select auth.uid())=user_id);

create table public.grunndoku_bundle_puzzles (
 bundle_id text not null references public.grunndoku_bundles(id),
 puzzle_id text not null unique check (puzzle_id ~ '^bundle-[a-z0-9-]{1,100}$'),
 sort_order integer not null check (sort_order>=0),
 data jsonb not null check (jsonb_typeof(data)='object' and data ?& array['id','seriesId','bundleId'] and octet_length(data::text)<=200000 and data->>'id'=puzzle_id and data->>'seriesId'=bundle_id and data->>'bundleId'=bundle_id),
 primary key(bundle_id,puzzle_id)
);
alter table public.grunndoku_bundle_puzzles enable row level security;
revoke all on public.grunndoku_bundle_puzzles from public,anon,authenticated;
grant select on public.grunndoku_bundle_puzzles to authenticated;
create policy purchased_bundle_puzzles on public.grunndoku_bundle_puzzles for select to authenticated using (
 exists(select 1 from public.grunndoku_bundle_access a where a.user_id=(select auth.uid()) and a.bundle_id=grunndoku_bundle_puzzles.bundle_id)
 and exists(select 1 from public.grunndoku_bundles b where b.id=grunndoku_bundle_puzzles.bundle_id and b.enabled)
);

create table grunndoku_internal.bundle_codes (
 bundle_id text primary key references public.grunndoku_bundles(id),
 code_hash bytea not null unique check (octet_length(code_hash)=32)
);
create table grunndoku_internal.bundle_attempts (
 user_id uuid primary key references auth.users(id) on delete cascade,
 window_start timestamptz not null,
 attempts integer not null
);
alter table grunndoku_internal.bundle_codes enable row level security;
alter table grunndoku_internal.bundle_attempts enable row level security;
revoke all on grunndoku_internal.bundle_codes,grunndoku_internal.bundle_attempts from public,anon,authenticated;

-- Deliberately privileged: this is the only way a browser can grant access.
-- Private schema, fixed search_path, no caller-supplied user ID, explicit auth
-- check, bounded attempts and no code hashes returned to the browser.
create function grunndoku_internal.activate_bundle(access_code text,expected_bundle text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); clean text; found_id text; attempts_now integer;
begin
 if uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
  return jsonb_build_object('ok',false,'reason','signin');
 end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(uid::text,0));
 insert into grunndoku_internal.bundle_attempts(user_id,window_start,attempts)
 values(uid,clock_timestamp(),1)
 on conflict(user_id) do update set
  attempts=case when grunndoku_internal.bundle_attempts.window_start<clock_timestamp()-interval '15 minutes' then 1 else grunndoku_internal.bundle_attempts.attempts+1 end,
  window_start=case when grunndoku_internal.bundle_attempts.window_start<clock_timestamp()-interval '15 minutes' then clock_timestamp() else grunndoku_internal.bundle_attempts.window_start end
 returning attempts into attempts_now;
 if attempts_now>10 then return jsonb_build_object('ok',false,'reason','rate');end if;
 if access_code is null or length(access_code)>120 then return jsonb_build_object('ok',false,'reason','invalid');end if;
 clean:=regexp_replace(upper(access_code),'[^A-Z0-9]','','g');
 if length(clean)<12 or length(clean)>80 then return jsonb_build_object('ok',false,'reason','invalid');end if;
 select c.bundle_id into found_id from grunndoku_internal.bundle_codes c
 join public.grunndoku_bundles b on b.id=c.bundle_id and b.enabled
 where c.code_hash=extensions.digest(clean,'sha256') and (expected_bundle is null or c.bundle_id=expected_bundle);
 if found_id is null then return jsonb_build_object('ok',false,'reason','invalid');end if;
 insert into public.grunndoku_bundle_access(user_id,bundle_id) values(uid,found_id) on conflict do nothing;
 return jsonb_build_object('ok',true,'bundle_id',found_id);
end;
$$;
revoke all on function grunndoku_internal.activate_bundle(text,text) from public,anon,authenticated;
grant usage on schema grunndoku_internal to authenticated;
grant execute on function grunndoku_internal.activate_bundle(text,text) to authenticated;
create function public.activate_grunndoku_bundle(access_code text,expected_bundle text default null)
returns jsonb language sql security invoker set search_path='' as $$ select grunndoku_internal.activate_bundle(access_code,expected_bundle); $$;
revoke all on function public.activate_grunndoku_bundle(text,text) from public,anon,authenticated;
grant execute on function public.activate_grunndoku_bundle(text,text) to authenticated;
