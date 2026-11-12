-- verify-0086.sql — a deleted class can be restored, and a teacher can list
-- what they deleted (migration 0086). Run with `pnpm verify:auth --target
-- live|local`. §A reads the catalog only; §B is a self-fixturing
-- EXPECTED-ROLLBACK block, so nothing persists (P7).

-- @section A-catalog-posture
-- @expect-rows
select 'definer_and_grants',
       bool_and(p.prosecdef)
       and bool_and(has_function_privilege('authenticated', p.oid, 'execute'))
       and not bool_or(has_function_privilege('anon', p.oid, 'execute')),
       '0086: the three RPCs are SECURITY DEFINER, callable by signed-in users, never by anon'
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
where p.proname in ('restore_class', 'list_deleted_classes', 'list_deleted_activities');
select 'search_path_pinned',
       bool_and(exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')),
       'every DEFINER function pins its search_path'
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
where p.proname in ('restore_class', 'list_deleted_classes', 'list_deleted_activities');
select 'purge_window_matches',
       pg_get_functiondef('purge_soft_deleted()'::regprocedure) like '%activities where deleted_at < now() - interval ''30 days''%'
       and pg_get_functiondef('list_deleted_activities()'::regprocedure) like '%interval ''30 days''%',
       'the purge day shown to teachers is the one purge_soft_deleted (0003) actually uses';
select 'three_functions_present',
       (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
        where p.proname in ('restore_class', 'list_deleted_classes', 'list_deleted_activities')) = 3,
       'restore_class, list_deleted_classes, list_deleted_activities';

-- @section B-restore-and-list
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t  uuid := gen_random_uuid();
  v_o  uuid := gen_random_uuid();
  v_k  uuid;
  v_ko uuid;
  v_a  uuid;
  v_code text;
  v_got text;
  v_n  integer;
  v_ao uuid;
  v_s  uuid := gen_random_uuid();
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_t, 'vfy0086-t@vfy0086.example', '{}'::jsonb),
         (v_o, 'vfy0086-o@vfy0086.example', '{}'::jsonb);
  update users set role = 'teacher' where id in (v_t, v_o);
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0086', v_t, 'vfy') returning id, join_code into v_k, v_code;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_o, 'vfy 0086 other', v_o, 'vfy') returning id into v_ko;
  insert into activities (owner_id, title, slug, status)
  values (v_t, 'vfy 0086 activity', 'vfy-0086-a', 'draft') returning id into v_a;
  insert into activities (owner_id, title, slug, status, deleted_at)
  values (v_o, 'vfy 0086 other activity', 'vfy-0086-o', 'draft', now()) returning id into v_ao;
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_s, 'vfy0086-s@vfy0086.example', '{}'::jsonb);
  insert into class_members (class_id, student_id) values (v_k, v_s);

  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);

  -- A live class is not restorable (a double-undo or stale client raises).
  v_got := null;
  begin perform restore_class(v_k); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Class is not restorable' then raise exception 'FAIL B1: live class gave %', v_got; end if;

  perform soft_delete_class(v_k);
  perform soft_delete_activity(v_a);
  select count(*) into v_n from list_deleted_classes() where id = v_k;
  if v_n <> 1 then raise exception 'FAIL B2: deleted class not listed'; end if;
  select count(*) into v_n from list_deleted_activities() where id = v_a and purge_after > deleted_at;
  if v_n <> 1 then raise exception 'FAIL B3: deleted activity not listed with a purge day (§A pins the 30 days to purge_soft_deleted)'; end if;

  -- Another teacher's deleted class is neither listed nor restorable.
  update classes set deleted_at = now() where id = v_ko;
  select count(*) into v_n from list_deleted_classes() where id = v_ko;
  if v_n <> 0 then raise exception 'FAIL B4: another teacher''s class listed'; end if;
  v_got := null;
  begin perform restore_class(v_ko); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Class is not restorable' then raise exception 'FAIL B5: foreign restore gave %', v_got; end if;

  select count(*) into v_n from list_deleted_activities() where id = v_ao;
  if v_n <> 0 then raise exception 'FAIL B10: another teacher''s activity listed'; end if;

  -- A teacher demoted since cannot restore or list (0027 §D parity).
  update users set role = 'student' where id = v_t;
  v_got := null;
  begin perform restore_class(v_k); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Class is not restorable' then raise exception 'FAIL B11: demoted restore gave %', v_got; end if;
  select count(*) into v_n from list_deleted_classes();
  if v_n <> 0 then raise exception 'FAIL B12: demoted teacher listed classes'; end if;
  update users set role = 'teacher' where id = v_t;

  -- Restore brings it back with the same code, audited, and off the list.
  perform restore_class(v_k);
  if exists (select 1 from classes where id = v_k and deleted_at is not null) then raise exception 'FAIL B6: still deleted'; end if;
  if (select join_code from classes where id = v_k) <> v_code then raise exception 'FAIL B7: code changed'; end if;
  if not exists (select 1 from audit_log where action = 'class.restore' and target_id = v_k and actor_id = v_t) then
    raise exception 'FAIL B8: no audit row';
  end if;
  select count(*) into v_n from list_deleted_classes() where id = v_k;
  if v_n <> 0 then raise exception 'FAIL B9: restored class still listed'; end if;
  if not exists (select 1 from class_members where class_id = v_k and student_id = v_s and removed_at is null) then
    raise exception 'FAIL B13: the roster did not survive the round trip';
  end if;

  raise exception 'EXPECTED ROLLBACK >>> B-restore-and-list: 13/13';
end
$vfy$;
