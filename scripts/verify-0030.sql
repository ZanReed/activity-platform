-- verify-0030.sql — the student content surface (migration 0030, S9 Drop 2).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0027 §E idiom): real auth.users inserts
-- through the REAL trigger, claims-switched RPC calls, everything rolled back
-- — durable-write-free on every path (P7).
--
-- WHY EACH SECTION EXISTS:
--   §A — the catalog posture: RLS forced, exactly ONE (select) policy, the
--        grant layer denies client writes (0028's default-revoke means the
--        SELECT grant is explicit — assert it took, and nothing wider), the
--        write/list RPCs are not anon-reachable, the meta RPC IS, and its
--        result shape is the wire-leak contract (name and NOTHING else).
--   §B — the behavior matrix from the eng test plan: refusal rows (wrong
--        teacher, student caller, foreign activity, never-published), audit
--        rows carrying the activity id, dedupe no-op (PK, not luck — and no
--        phantom audit row), the E-6 scope proof (a member sees titles; a
--        non-member sees NOTHING; can_read_activity was not widened), the
--        server-side published/deleted filters, unshare + its no-op, and the
--        anon meta lookup's normalization + deleted-class gate.

-- @section A-catalog-posture
-- @expect-rows
select 'rls_forced',
       (select relrowsecurity and relforcerowsecurity
          from pg_class where relname = 'class_activities'), '';
select 'exactly_one_select_policy',
       (select count(*) from pg_policies
         where schemaname = 'public' and tablename = 'class_activities') = 1
       and (select cmd from pg_policies
             where schemaname = 'public' and tablename = 'class_activities') = 'SELECT',
       'reads via policy; writes have no policy at all';
select 'client_grant_is_select_only',
       (select coalesce(array_agg(distinct privilege_type order by privilege_type), '{}')
          from information_schema.table_privileges
         where table_schema = 'public' and table_name = 'class_activities'
           and grantee = 'authenticated')
       = array['SELECT'],
       '0028 default-revoke + explicit SELECT grant: INSERT/DELETE denied at the grant layer';
select 'anon_has_no_table_grant',
       not exists (select 1 from information_schema.table_privileges
                    where table_schema = 'public' and table_name = 'class_activities'
                      and grantee = 'anon'), '';
select 'write_rpcs_not_anon',
       not has_function_privilege('anon', 'share_activity_to_class(uuid,uuid)', 'execute')
       and not has_function_privilege('anon', 'unshare_activity_from_class(uuid,uuid)', 'execute')
       and not has_function_privilege('anon', 'list_class_activities()', 'execute'), '';
select 'meta_rpc_is_anon_reachable',
       has_function_privilege('anon', 'get_class_public_meta(text)', 'execute'),
       'the join gate is pre-auth; served via get-activity meta branch';
select 'meta_rpc_wire_shape_is_name_only',
       (select pg_get_function_result(p.oid) from pg_proc p
         where p.pronamespace = 'public'::regnamespace
           and p.proname = 'get_class_public_meta')
       = 'TABLE(name text)',
       'wire-leak contract: the class NAME and nothing else';

-- @section B-behavior-matrix
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher  uuid := gen_random_uuid();
  v_teacher2 uuid := gen_random_uuid();
  v_student  uuid := gen_random_uuid();
  v_outsider uuid := gen_random_uuid();  -- admitted student who never joins
  v_class    classes%rowtype;
  v_act      uuid;
  v_ver      uuid;
  v_draft    uuid;
  v_act2     uuid;  -- teacher2's published activity
  v_msg      text;
  v_wrong_class boolean := false;
  v_student_blocked boolean := false;
  v_foreign_blocked boolean := false;
  v_draft_blocked boolean := false;
  v_rows int;
  v_audit int;
  v_list_member int;
  v_list_title text;
  v_list_outsider int;
  v_list_after_delete int;
  v_meta_name text;
  v_meta_deleted int;
  v_meta_unknown int;
begin
  -- ---- fixtures: real trigger, real rows, all inside this transaction ----
  insert into student_domain (domain) values ('vfy0030.example');
  insert into allowlist (email) values ('vfy0030-t@vfy0030.example');
  insert into allowlist (email) values ('vfy0030-t2@vfy0030.example');
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher,  'vfy0030-t@vfy0030.example',  '{}'::jsonb),
         (v_teacher2, 'vfy0030-t2@vfy0030.example', '{}'::jsonb),
         (v_student,  'vfy0030-s@vfy0030.example',  '{}'::jsonb),
         (v_outsider, 'vfy0030-o@vfy0030.example',  '{}'::jsonb);

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_teacher, 'vfy 0030 class', v_teacher, 'vfy') returning * into v_class;

  -- teacher's published activity (version minted the 0003 way, by hand)
  insert into activities (owner_id, title, slug)
  values (v_teacher, 'vfy published', 'vfy-0030-pub') returning id into v_act;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_act, 1, '{}'::jsonb, v_teacher) returning id into v_ver;
  update activities set status = 'published', current_version_id = v_ver
   where id = v_act;
  -- teacher's never-published draft
  insert into activities (owner_id, title, slug)
  values (v_teacher, 'vfy draft', 'vfy-0030-draft') returning id into v_draft;
  -- teacher2's published activity (for the foreign-activity refusal)
  insert into activities (owner_id, title, slug)
  values (v_teacher2, 'vfy foreign', 'vfy-0030-foreign') returning id into v_act2;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_act2, 1, '{}'::jsonb, v_teacher2) returning id into v_ver;
  update activities set status = 'published', current_version_id = v_ver
   where id = v_act2;

  -- ---- refusal matrix -----------------------------------------------------
  -- teacher2 on teacher1's class
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_teacher2, 'role', 'authenticated')::text, true);
  begin
    perform share_activity_to_class(v_class.id, v_act2);
  exception when others then
    get stacked diagnostics v_msg = message_text;
    v_wrong_class := v_msg like '%Not your class%';
  end;
  -- a student caller
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_student, 'role', 'authenticated')::text, true);
  begin
    perform share_activity_to_class(v_class.id, v_act);
  exception when others then
    get stacked diagnostics v_msg = message_text;
    v_student_blocked := v_msg like '%Not your class%';
  end;
  -- the class teacher, but someone else's activity
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_teacher, 'role', 'authenticated')::text, true);
  begin
    perform share_activity_to_class(v_class.id, v_act2);
  exception when others then
    get stacked diagnostics v_msg = message_text;
    v_foreign_blocked := v_msg like '%Not your activity%';
  end;
  -- the class teacher, own activity, never published
  begin
    perform share_activity_to_class(v_class.id, v_draft);
  exception when others then
    get stacked diagnostics v_msg = message_text;
    v_draft_blocked := v_msg like '%not published%';
  end;

  -- ---- happy path + audit + dedupe ---------------------------------------
  perform share_activity_to_class(v_class.id, v_act);
  perform share_activity_to_class(v_class.id, v_act);  -- dedupe no-op
  select count(*) into v_rows from class_activities
   where class_id = v_class.id and activity_id = v_act;
  select count(*) into v_audit from audit_log
   where action = 'class.update' and target_id = v_class.id
     and metadata->>'op' = 'share_activity'
     and metadata->>'activity_id' = v_act::text;

  -- ---- the E-6 scope proof ------------------------------------------------
  -- the member sees the title through the DEFINER list...
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_student, 'role', 'authenticated')::text, true);
  perform join_class(v_class.join_code);
  select count(*), max(title) into v_list_member, v_list_title
    from list_class_activities();
  -- ...an admitted NON-member sees nothing (DEFINER did not widen reads)
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_outsider, 'role', 'authenticated')::text, true);
  select count(*) into v_list_outsider from list_class_activities();

  -- ---- server-side filters ------------------------------------------------
  -- soft-delete the activity: the member's list drops it without any unshare
  update activities set deleted_at = now() where id = v_act;
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_student, 'role', 'authenticated')::text, true);
  select count(*) into v_list_after_delete from list_class_activities();
  update activities set deleted_at = null where id = v_act;

  -- ---- unshare + its audit + its no-op ------------------------------------
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_teacher, 'role', 'authenticated')::text, true);
  perform unshare_activity_from_class(v_class.id, v_act);
  perform unshare_activity_from_class(v_class.id, v_act);  -- no-op, no audit
  select count(*) into v_rows from class_activities
   where class_id = v_class.id and activity_id = v_act;
  select v_audit + (select count(*) from audit_log
   where action = 'class.update' and target_id = v_class.id
     and metadata->>'op' = 'unshare_activity') into v_audit;

  -- ---- the anon meta lookup ----------------------------------------------
  select name into v_meta_name
    from get_class_public_meta(lower('  ' || v_class.join_code || '  '));
  select count(*) into v_meta_unknown from get_class_public_meta('ZZZZZZ');
  update classes set deleted_at = now() where id = v_class.id;
  select count(*) into v_meta_deleted
    from get_class_public_meta(v_class.join_code);

  if not (v_wrong_class and v_student_blocked and v_foreign_blocked and v_draft_blocked)
     or v_rows <> 0                    -- unshared at the end
     or v_audit <> 2                   -- ONE share + ONE unshare row, no phantoms
     or v_list_member <> 1 or v_list_title <> 'vfy published'
     or v_list_outsider <> 0
     or v_list_after_delete <> 0
     or v_meta_name <> 'vfy 0030 class'
     or v_meta_unknown <> 0 or v_meta_deleted <> 0
  then
    raise exception 'MATRIX FAILED >>> wrong_class=% student=% foreign=% draft=% rows=% audit=% member=%/% outsider=% after_del=% meta=[%] unknown=% deleted=%',
      v_wrong_class, v_student_blocked, v_foreign_blocked, v_draft_blocked,
      v_rows, v_audit, v_list_member, v_list_title, v_list_outsider,
      v_list_after_delete, v_meta_name, v_meta_unknown, v_meta_deleted;
  end if;

  raise exception 'EXPECTED ROLLBACK >>> refusals=4/4 audit=2 dedupe=noop scope=member-only filters=live meta=normalized+gated';
end
$vfy$;
