-- Transactional security regression: no test user or progress survives rollback.
begin;
insert into auth.users (id) values ('8f883fa0-505c-4b35-bba4-700069750103'),('8f883fa0-505c-4b35-bba4-700069750104');
insert into public.grunndoku_progress(user_id,puzzle_id,state) values
 ('8f883fa0-505c-4b35-bba4-700069750103','security-check','{"positions":{}}'),
 ('8f883fa0-505c-4b35-bba4-700069750104','security-check','{"positions":{}}');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"8f883fa0-505c-4b35-bba4-700069750103","role":"authenticated"}',true);
do $$
declare n integer; denied boolean;
begin
 select count(*) into n from public.grunndoku_progress;
 if n <> 1 then raise exception 'RLS leaked another user'; end if;
 update public.grunndoku_progress set state = '{"positions":{"0":1}}' where user_id='8f883fa0-505c-4b35-bba4-700069750103' and puzzle_id='security-check' and version=1;
 get diagnostics n = row_count;
 if n <> 1 then raise exception 'Own update failed'; end if;
 select version into n from public.grunndoku_progress where puzzle_id='security-check';
 if n <> 2 then raise exception 'Version did not advance'; end if;
 update public.grunndoku_progress set state='{}' where puzzle_id='security-check' and version=1;
 get diagnostics n = row_count;
 if n <> 0 then raise exception 'Stale version overwrote progress'; end if;
 update public.grunndoku_progress set state='{}' where user_id='8f883fa0-505c-4b35-bba4-700069750104';
 get diagnostics n = row_count;
 if n <> 0 then raise exception 'Other user updated'; end if;
 denied:=false;
 begin insert into public.grunndoku_progress(user_id,puzzle_id,state) values ('8f883fa0-505c-4b35-bba4-700069750104','forbidden','{}');
 exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'Other user insertion allowed'; end if;
 denied:=false;
 begin update public.grunndoku_progress set user_id='8f883fa0-505c-4b35-bba4-700069750104' where puzzle_id='security-check';
 exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'Ownership reassignment allowed'; end if;
 denied:=false;
 begin update public.grunndoku_progress set version=999 where puzzle_id='security-check';
 exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'Version forgery allowed'; end if;
end;
$$;
reset role;
set local role anon;
do $$
declare denied boolean:=false;
begin
 begin perform count(*) from public.grunndoku_progress;
 exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'Guest access allowed'; end if;
end;
$$;
reset role;
rollback;
select 'RLS, ownership, version checks and guest isolation passed; fixtures rolled back' as result,
 (select count(*) from auth.users where id in ('8f883fa0-505c-4b35-bba4-700069750103','8f883fa0-505c-4b35-bba4-700069750104')) as remaining_test_users;
