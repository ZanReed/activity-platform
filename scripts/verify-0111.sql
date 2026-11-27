-- verify-0111.sql — the last eleven `to public` policies scoped to signed-in
-- users (migration 0111, review 2026-11-26 B6's remainder). Run with
-- `pnpm verify:auth --target live|local`. §A reads the catalog only; §B is a
-- self-fixturing EXPECTED-ROLLBACK block, so nothing persists (P7).

-- @section A-posture
-- @expect-rows
select 'no_public_policy_applies_to_public',
       not exists (select 1 from pg_policies
                    where schemaname = 'public' and 'public' = any (roles)),
       'every policy in public names its roles (0109 + 0111); a new `to public` policy goes red here';
select 'eleven_policies_scoped_to_authenticated',
       (select count(*) from pg_policies p
          join (values ('activities', 'activities_insert_own'), ('activities', 'activities_select_own'),
                       ('activities', 'activities_update_own'), ('activity_versions', 'activity_versions_insert_own'),
                       ('activity_versions', 'activity_versions_select_own'),
                       ('assignment_students', 'assignment_students_select_teacher'),
                       ('assignments', 'assignments_insert_own'), ('assignments', 'assignments_select_own'),
                       ('assignments', 'assignments_update_own'), ('class_activities', 'class_activities_select'),
                       ('users', 'users_select_self')) e(t, n)
            on p.schemaname = 'public' and p.tablename = e.t and p.policyname = e.n
         where p.roles = '{authenticated}') = 11,
       'the eleven policies 0109 left are to authenticated';
select 'predicates_unchanged',
       (select count(*) = 11 and bool_and(coalesce(p.qual, '-') = e.q and coalesce(p.with_check, '-') = e.w)
          from (values
            ('activities_insert_own', '-', '((owner_id = ( SELECT auth.uid() AS uid)) AND ( SELECT current_user_is_teacher() AS current_user_is_teacher))'),
            ('activities_select_own', '((owner_id = ( SELECT auth.uid() AS uid)) AND (deleted_at IS NULL))', '-'),
            ('activities_update_own', '((owner_id = ( SELECT auth.uid() AS uid)) AND (deleted_at IS NULL))', '((owner_id = ( SELECT auth.uid() AS uid)) AND ( SELECT current_user_is_teacher() AS current_user_is_teacher))'),
            ('activity_versions_insert_own', '-', '((created_by = ( SELECT auth.uid() AS uid)) AND can_edit_activity(activity_id) AND ( SELECT current_user_is_teacher() AS current_user_is_teacher))'),
            ('activity_versions_select_own', 'can_read_activity(activity_id)', '-'),
            ('assignment_students_select_teacher', 'can_access_assignment(assignment_id)', '-'),
            ('assignments_insert_own', '-', '((teacher_id = ( SELECT auth.uid() AS uid)) AND ( SELECT current_user_is_teacher() AS current_user_is_teacher))'),
            ('assignments_select_own', '((teacher_id = ( SELECT auth.uid() AS uid)) AND (deleted_at IS NULL))', '-'),
            ('assignments_update_own', '((teacher_id = ( SELECT auth.uid() AS uid)) AND (deleted_at IS NULL))', '((teacher_id = ( SELECT auth.uid() AS uid)) AND ( SELECT current_user_is_teacher() AS current_user_is_teacher))'),
            ('class_activities_select', '(is_class_member(class_id) OR is_class_teacher(class_id))', '-'),
            ('users_select_self', '((id = ( SELECT auth.uid() AS uid)) OR current_user_is_admin())', '-')
          ) e(n, q, w)
          join pg_policies p on p.schemaname = 'public' and p.policyname = e.n),
       'ALTER POLICY ... TO changed the roles only: every USING and WITH CHECK is what it was';

-- @section B-behavioral
-- @local-only (builds a teacher, a student, a class and an activity)
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t uuid := gen_random_uuid();
  v_s uuid := gen_random_uuid();
  v_k uuid; v_a uuid;
  n   integer := 0;
  c   integer;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0111-' || o || '@vfy0111.example', '{}'::jsonb
    from unnest(array[v_t, v_s]) with ordinality x(u, o);
  update users set role = 'teacher' where id = v_t;
  update users set role = 'student' where id = v_s;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0111', v_t, 'vfy') returning id into v_k;
  insert into class_members (class_id, student_id) values (v_k, v_s);
  insert into activities (owner_id, title, slug, status) values (v_t, 'A', 'vfy-0111-a', 'published') returning id into v_a;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_a, 1, '{"schemaVersion": 2, "meta": {"title": "A"}, "sections": []}', v_t);
  insert into class_activities (class_id, activity_id, added_by) values (v_k, v_a, v_t);

  -- B1 the teacher still reads and writes their own activity, its version,
  --    the class's share and their own user row
  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select (select count(*) from activities where id = v_a)
       + (select count(*) from activity_versions where activity_id = v_a)
       + (select count(*) from class_activities where activity_id = v_a)
       + (select count(*) from users where id = v_t) into c;
  if c <> 4 then raise exception 'FAIL B1: teacher sees % of 4', c; end if;
  update activities set title = 'A2' where id = v_a;
  get diagnostics c = row_count;
  if c <> 1 then raise exception 'FAIL B1: teacher''s own update wrote % rows', c; end if;
  n := n + 1;

  -- B2 the student still reads the class's share and their own user row
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', v_s, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select (select count(*) from class_activities where activity_id = v_a)
       + (select count(*) from users where id = v_s) into c;
  if c <> 2 then raise exception 'FAIL B2: student sees % of 2', c; end if;
  n := n + 1;

  -- B3 anon sees none of it (no policy applies to anon now; a grant error
  --    where the table is not granted to anon counts as none)
  execute 'reset role';
  perform set_config('request.jwt.claims', '{"role": "anon"}', true);
  execute 'set local role anon';
  c := 0;
  begin
    select (select count(*) from activities where id = v_a)
         + (select count(*) from activity_versions where activity_id = v_a)
         + (select count(*) from class_activities where activity_id = v_a)
         + (select count(*) from users where id in (v_t, v_s)) into c;
  exception when insufficient_privilege then c := 0;
  end;
  if c <> 0 then raise exception 'FAIL B3: anon sees %', c; end if;
  execute 'reset role';
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-policies-to-authenticated: %/3', n;
end
$vfy$;
