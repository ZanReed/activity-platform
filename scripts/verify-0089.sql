-- verify-0089.sql — moving a student between a teacher's classes (migration
-- 0089, docs/design/schema-shortlist.md S5). Run with
-- `pnpm verify:auth --target live|local`. §A reads the catalog only; §B is a
-- self-fixturing EXPECTED-ROLLBACK block, so nothing persists (P7).

-- @section A-catalog-posture
-- @expect-rows
select 'move_definer_signed_in_only',
       bool_and(p.prosecdef)
       and bool_and(has_function_privilege('authenticated', p.oid, 'execute'))
       and not bool_or(has_function_privilege('anon', p.oid, 'execute'))
       and bool_and(exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')),
       'move_class_member: DEFINER, search_path pinned, signed-in only'
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
where p.proname = 'move_class_member'
having count(*) = 1;

-- @section B-move
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t   uuid := gen_random_uuid();   -- the teacher (caps-exempt off: capped)
  v_o   uuid := gen_random_uuid();   -- another teacher
  v_s   uuid := gen_random_uuid();   -- the student
  v_a   uuid;                        -- the teacher's class A (student in it)
  v_b   uuid;                        -- the teacher's class B
  v_d   uuid;                        -- the teacher's class limited to a domain
  v_x   uuid;                        -- the OTHER teacher's class
  v_got text;
  v_i   integer;
  n     integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0089-' || o || '@vfy0089.example', '{}'::jsonb
    from unnest(array[v_t, v_o, v_s]) with ordinality x(u, o);
  update users set role = 'teacher', teacher_caps_exempt = false where id in (v_t, v_o);
  update users set role = 'student' where id = v_s;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0089 A', v_t, 'vfy') returning id into v_a;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0089 B', v_t, 'vfy') returning id into v_b;
  insert into classes (teacher_id, name, expected_domain, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0089 D', 'district.example', v_t, 'vfy') returning id into v_d;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_o, 'vfy 0089 X', v_o, 'vfy') returning id into v_x;
  insert into class_members (class_id, student_id) values (v_a, v_s);

  -- B1 the teacher moves A → B: out of A, into B, audited
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  perform move_class_member(v_s, v_a, v_b);
  if exists (select 1 from class_members where class_id = v_a and student_id = v_s and removed_at is null) then
    raise exception 'FAIL B1: still active in A';
  end if;
  if not exists (select 1 from class_members where class_id = v_b and student_id = v_s and removed_at is null) then
    raise exception 'FAIL B1: not active in B';
  end if;
  if not exists (select 1 from audit_log where action = 'class.update' and actor_id = v_t
                 and metadata->>'op' = 'move_member'
                 and metadata->>'from_class' = v_a::text and metadata->>'to_class' = v_b::text) then
    raise exception 'FAIL B1: no audit row';
  end if;
  n := n + 1;

  -- B2 and back B → A reactivates A's old row (no duplicate)
  perform move_class_member(v_s, v_b, v_a);
  if (select count(*) from class_members where class_id = v_a and student_id = v_s) <> 1
     or not exists (select 1 from class_members where class_id = v_a and student_id = v_s and removed_at is null) then
    raise exception 'FAIL B2: A not reactivated as one row';
  end if;
  n := n + 1;

  -- B3 refusals: same class, not in the class, a domain-limited class
  v_got := null;
  begin perform move_class_member(v_s, v_a, v_a); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Pick a different class' then raise exception 'FAIL B3 same: %', v_got; end if;
  v_got := null;
  begin perform move_class_member(v_s, v_b, v_a); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'That student is not in this class' then raise exception 'FAIL B3 absent: %', v_got; end if;
  v_got := null;
  begin perform move_class_member(v_s, v_a, v_d); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'That class is limited to district.example accounts' then raise exception 'FAIL B3 domain: %', v_got; end if;
  n := n + 1;

  -- B4 no cross-teacher move, either direction; a student cannot move anyone
  v_got := null;
  begin perform move_class_member(v_s, v_a, v_x); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your class' then raise exception 'FAIL B4 into other: %', v_got; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_o)::text, true);
  v_got := null;
  begin perform move_class_member(v_s, v_a, v_x); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your class' then raise exception 'FAIL B4 other teacher: %', v_got; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_got := null;
  begin perform move_class_member(v_s, v_a, v_b); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your class' then raise exception 'FAIL B4 student: %', v_got; end if;
  if not exists (select 1 from class_members where class_id = v_a and student_id = v_s and removed_at is null) then
    raise exception 'FAIL B4: a refused move changed membership';
  end if;
  n := n + 1;

  -- B5 the member cap (0033 §G) holds on the target class
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  for v_i in 1..50 loop
    insert into auth.users (id, email, raw_user_meta_data)
    values (gen_random_uuid(), 'vfy0089-fill' || v_i || '@vfy0089.example', '{}'::jsonb);
  end loop;
  insert into class_members (class_id, student_id)
  select v_b, u.id from users u where u.email like 'vfy0089-fill%@vfy0089.example';
  v_got := null;
  begin perform move_class_member(v_s, v_a, v_b); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'That class is full' then raise exception 'FAIL B5: %', v_got; end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-move: %/5', n;
end
$vfy$;
