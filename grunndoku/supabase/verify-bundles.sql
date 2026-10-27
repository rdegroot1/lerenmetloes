-- Run in one transaction. Fixture users, codes and content must roll back.
insert into auth.users(id) values('8f883fa0-505c-4b35-bba4-700069750203'),('8f883fa0-505c-4b35-bba4-700069750204');
insert into public.grunndoku_bundles(id,title,enabled,case_count) values('bundle-security-test','Test only',true,1),('bundle-disabled-test','Not published',false,0);
insert into grunndoku_internal.bundle_codes(bundle_id,code_hash) values('bundle-security-test',extensions.digest('TESTONLYSHAREDCODE123','sha256'));
insert into public.grunndoku_bundle_puzzles(bundle_id,puzzle_id,sort_order,data) values('bundle-security-test','bundle-security-puzzle',1,'{"id":"bundle-security-puzzle","seriesId":"bundle-security-test","bundleId":"bundle-security-test"}');
set local role anon;
do $$ declare denied boolean:=false; n integer; begin
 select count(*) into n from public.grunndoku_bundles where id='bundle-disabled-test';if n<>0 then raise exception 'Unpublished bundle visible';end if;
 begin perform public.activate_grunndoku_bundle('TESTONLYSHAREDCODE123');exception when insufficient_privilege then denied:=true;end;
 if not denied then raise exception 'Guest redemption allowed';end if;
 denied:=false;begin perform count(*) from public.grunndoku_bundle_puzzles;exception when insufficient_privilege then denied:=true;end;if not denied then raise exception 'Guest reads paid puzzles';end if;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"8f883fa0-505c-4b35-bba4-700069750203","role":"authenticated"}',true);
do $$ declare r jsonb;n integer;denied boolean:=false; begin
 select count(*) into n from public.grunndoku_bundle_puzzles;if n<>0 then raise exception 'Unpaid reads puzzle';end if;
 r:=public.activate_grunndoku_bundle('TESTONLYSHAREDCODE123','bundle-disabled-test');if r->>'ok'<>'false' then raise exception 'Wrong bundle accepted';end if;
 r:=public.activate_grunndoku_bundle(' test-only-shared-code-123 ');if r->>'ok'<>'true' then raise exception 'Shared code rejected';end if;
 r:=public.activate_grunndoku_bundle('TESTONLYSHAREDCODE123');
 select count(*) into n from public.grunndoku_bundle_access;if n<>1 then raise exception 'Duplicate access or cross-user leakage';end if;
 select count(*) into n from public.grunndoku_bundle_puzzles;if n<>1 then raise exception 'Purchased content unavailable';end if;
 begin insert into public.grunndoku_bundle_access(user_id,bundle_id) values('8f883fa0-505c-4b35-bba4-700069750204','bundle-security-test');exception when insufficient_privilege then denied:=true;end;if not denied then raise exception 'Direct grant allowed';end if;
 denied:=false;begin perform count(*) from grunndoku_internal.bundle_codes;exception when insufficient_privilege then denied:=true;end;if not denied then raise exception 'Code hash exposed';end if;
 for i in 1..8 loop r:=public.activate_grunndoku_bundle('WRONGCODE123456');end loop;if r->>'reason'<>'rate' then raise exception 'Rate limit missing';end if;
end $$;
select set_config('request.jwt.claims','{"sub":"8f883fa0-505c-4b35-bba4-700069750204","role":"authenticated"}',true);
do $$ declare r jsonb;n integer; begin
 select count(*) into n from public.grunndoku_bundle_access;if n<>0 then raise exception 'Other account access leaked';end if;
 r:=public.activate_grunndoku_bundle('TESTONLYSHAREDCODE123');if r->>'ok'<>'true' then raise exception 'Shared code not reusable by second account';end if;
end $$;
reset role;
-- Rotating a theme code keeps existing grants.
update grunndoku_internal.bundle_codes set code_hash=extensions.digest('REPLACEMENTCODE123','sha256') where bundle_id='bundle-security-test';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"8f883fa0-505c-4b35-bba4-700069750204","role":"authenticated"}',true);
do $$ declare r jsonb;n integer;begin
 r:=public.activate_grunndoku_bundle('TESTONLYSHAREDCODE123');if r->>'ok'<>'false' then raise exception 'Old code accepted';end if;
 select count(*) into n from public.grunndoku_bundle_puzzles;if n<>1 then raise exception 'Rotation removed earned access';end if;
end $$;
reset role;
