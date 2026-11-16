-- verify-0090.sql — "Ask my teacher" (migration 0090, docs/design/ask-my-teacher.md,
-- S9). Run with `pnpm verify:auth --target live|local`. §A reads the catalog
-- only; §B is a self-fixturing EXPECTED-ROLLBACK block, so nothing persists (P7).

-- @section A-posture
-- @expect-rows
select 'client_rpcs_definer_signed_in_only',
       count(*) = 6
       and bool_and(p.prosecdef)
       and bool_and(has_function_privilege('authenticated', p.oid, 'execute'))
       and not bool_or(has_function_privilege('anon', p.oid, 'execute'))
       and bool_and(exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')),
       'set_class_help, my_help_state, ask_teacher, withdraw_help, class_help_open, end_help: DEFINER, search_path pinned, signed-in only'
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
where p.proname in ('set_class_help', 'my_help_state', 'ask_teacher', 'withdraw_help',
                    'class_help_open', 'end_help');
select 'table_closed_to_clients',
       (select relrowsecurity and relforcerowsecurity from pg_class where relname = 'help_requests')
       and not has_table_privilege('authenticated', 'help_requests', 'select')
       and not has_table_privilege('authenticated', 'help_requests', 'insert')
       and not has_table_privilege('anon', 'help_requests', 'select')
       and not has_function_privilege('authenticated', 'help_target_classes(uuid)', 'execute')
       and not has_function_privilege('authenticated', 'help_open_rows(uuid)', 'execute'),
       'help_requests: RLS forced, no client grant; the class resolver and open-row read are internal';
select 'prune_dry_run_by_default_and_service_only',
       not has_function_privilege('authenticated', 'prune_help_requests(boolean)', 'execute')
       and not has_function_privilege('anon', 'prune_help_requests(boolean)', 'execute')
       and (select pg_get_function_arguments(oid) from pg_proc where proname = 'prune_help_requests')
             = 'p_dry_run boolean DEFAULT true',
       'the 30-day prune is dry-run by default and service-only';
-- @live-only (cron.job is pg_cron's; the local stack has no pg_cron)
select 'prune_is_unscheduled',
       not exists (select 1 from cron.job where command ilike '%prune_help_requests%'),
       'DISARMED: no cron job runs the prune. Arming flips this row, with the author''s yes';

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t   uuid := gen_random_uuid();   -- teacher of A and Off
  v_t2  uuid := gen_random_uuid();   -- teacher of B
  v_s   uuid := gen_random_uuid();   -- the student (in A and B)
  v_s2  uuid := gen_random_uuid();   -- a student in no class holding the activity
  v_act uuid;
  v_old uuid;                        -- an older version
  v_ver uuid;                        -- the current version
  v_a   uuid;
  v_b   uuid;
  v_off uuid;
  v_r   jsonb;
  v_got text;
  v_req uuid;
  v_lap timestamptz;
  v_c   uuid;                        -- a class the student moves into
  v_d   uuid;                        -- a class the student joins later
  v_new uuid;                        -- a republished version
  n     integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0090-' || o || '@vfy0090.example', '{}'::jsonb
    from unnest(array[v_t, v_t2, v_s, v_s2]) with ordinality x(u, o);
  update users set role = 'teacher' where id in (v_t, v_t2);
  update users set role = 'student' where id in (v_s, v_s2);
  update users set display_name = 'Vfy Student' where id = v_s;

  insert into activities (owner_id, title, slug, status)
  values (v_t, 'vfy 0090', 'vfy-0090', 'published') returning id into v_act;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_act, 1, '{"sections":[{"id":"s1"}]}'::jsonb, v_t) returning id into v_old;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_act, 2, '{"sections":[{"id":"s1","title":"Warm up"},{"id":"s2"},{"id":"s3","rows":[{"columns":[{"blocks":[{"type":"heading","level":1,"content":[{"type":"text","text":"The activity"}]},{"type":"paragraph","content":[]},{"type":"heading","level":2,"content":[{"type":"text","text":"Re"},{"type":"text","text":"view"}]}]}]}]}]}'::jsonb, v_t)
  returning id into v_ver;
  update activities set current_version_id = v_ver where id = v_act;

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0090 A', v_t, 'vfy') returning id into v_a;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t2, 'vfy 0090 B', v_t2, 'vfy') returning id into v_b;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, help_requests_on)
  values (v_t, 'vfy 0090 Off', v_t, 'vfy', false) returning id into v_off;
  insert into class_activities (class_id, activity_id, added_by) values
    (v_a, v_act, v_t), (v_b, v_act, v_t2), (v_off, v_act, v_t);
  insert into class_members (class_id, student_id) values
    (v_a, v_s), (v_b, v_s), (v_off, v_s2);

  -- B1 an ask reaches every class holding the activity (two teachers), and
  -- lapses at the next midnight in each class's zone
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_r := my_help_state(v_ver);
  if not (v_r->>'can_ask')::boolean then raise exception 'FAIL B1: cannot ask before asking'; end if;
  v_r := ask_teacher(v_ver, 's2');
  if (select count(*) from help_requests where student_id = v_s) <> 2
     or not exists (select 1 from help_requests where class_id = v_a and section_id = 's2')
     or not exists (select 1 from help_requests where class_id = v_b and section_id = 's2') then
    raise exception 'FAIL B1: not one row per class';
  end if;
  if not (v_r->'open') ? 's2' then raise exception 'FAIL B1: state does not show it open: %', v_r; end if;
  select lapses_at into v_lap from help_requests where class_id = v_a;
  if v_lap <= now() or v_lap > now() + interval '1 day'
     or (v_lap at time zone fact_class_zone(v_a))::time <> '00:00' then
    raise exception 'FAIL B1: lapses_at % is not the next local midnight', v_lap;
  end if;
  n := n + 1;

  -- B2 asking again changes nothing (ST-2)
  v_r := ask_teacher(v_ver, 's2');
  if (select count(*) from help_requests where student_id = v_s) <> 2 then
    raise exception 'FAIL B2: a second ask made a row';
  end if;
  n := n + 1;

  -- B3 refusals: a section not in the version, an old version, a teacher, a
  -- student whose only class has the switch off
  v_got := null;
  begin perform ask_teacher(v_ver, 'nope'); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_available' then raise exception 'FAIL B3 section: %', v_got; end if;
  v_got := null;
  begin perform ask_teacher(v_old, 's1'); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_available' then raise exception 'FAIL B3 old version: %', v_got; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  v_got := null;
  begin perform ask_teacher(v_ver, 's1'); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Only students can ask' then raise exception 'FAIL B3 teacher: %', v_got; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s2)::text, true);
  if (my_help_state(v_ver)->>'can_ask')::boolean then raise exception 'FAIL B3: switch off but can_ask'; end if;
  v_got := null;
  begin perform ask_teacher(v_ver, 's1'); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'no_class' then raise exception 'FAIL B3 off: %', v_got; end if;
  n := n + 1;

  -- B4 each teacher sees only their class; Done is that teacher's own; the
  -- student still sees "asked" while any class is open
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  v_r := class_help_open(v_a);
  if jsonb_array_length(v_r->'requests') <> 1
     or v_r->'requests'->0->>'section_label' <> 'Section 2'
     or v_r->'requests'->0->>'name' <> 'Vfy Student' then
    raise exception 'FAIL B4: teacher read %', v_r;
  end if;
  v_got := null;
  begin perform class_help_open(v_b); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_class_teacher' then raise exception 'FAIL B4 other class: %', v_got; end if;
  select id into v_req from help_requests where class_id = v_b;
  v_got := null;
  begin perform end_help(v_req); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_class_teacher' then raise exception 'FAIL B4 other Done: %', v_got; end if;
  select id into v_req from help_requests where class_id = v_a;
  v_r := end_help(v_req);
  if jsonb_array_length(v_r->'requests') <> 0
     or not exists (select 1 from help_requests where id = v_req and ended_by = 'teacher'
                     and ended_by_teacher = v_t and ended_at is not null) then
    raise exception 'FAIL B4: Done did not end A''s row';
  end if;
  if exists (select 1 from help_requests where class_id = v_b and ended_at is not null) then
    raise exception 'FAIL B4: Done in A ended B''s row';
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_r := my_help_state(v_ver);
  if not (v_r->'open') ? 's2' or (v_r->'done') ? 's2' then
    raise exception 'FAIL B4: student state while B is open: %', v_r;
  end if;
  n := n + 1;

  -- B4b a section with no title is named by its first heading below level 1
  v_r := ask_teacher(v_ver, 's3');
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  if not exists (select 1 from jsonb_array_elements(class_help_open(v_a)->'requests') q
                  where q->>'section_label' = 'Review') then
    raise exception 'FAIL B4b: heading label %', class_help_open(v_a);
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_r := withdraw_help(v_ver, 's3');

  -- B5 withdraw ends what is left; Done-today shows once nothing is open
  v_r := withdraw_help(v_ver, 's2');
  if (v_r->'open') ? 's2' or not (v_r->'done') ? 's2'
     or not exists (select 1 from help_requests where class_id = v_b and ended_by = 'student') then
    raise exception 'FAIL B5: after withdraw %', v_r;
  end if;
  n := n + 1;

  -- B6 a lapsed request is gone from both reads, and the student can ask again
  v_r := ask_teacher(v_ver, 's1');
  update help_requests set lapses_at = now() - interval '1 minute'
   where student_id = v_s and section_id = 's1';
  if (my_help_state(v_ver)->'open') ? 's1' then raise exception 'FAIL B6: lapsed still open'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  if jsonb_array_length(class_help_open(v_a)->'requests') <> 0 then
    raise exception 'FAIL B6: lapsed shown to the teacher';
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_r := ask_teacher(v_ver, 's1');
  if not (v_r->'open') ? 's1' then raise exception 'FAIL B6: could not ask after a lapse'; end if;
  n := n + 1;

  -- B7 a student removed from the class drops off that class's list
  update class_members set removed_at = now() where class_id = v_a and student_id = v_s;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  if jsonb_array_length(class_help_open(v_a)->'requests') <> 0 then
    raise exception 'FAIL B7: a removed student is still listed';
  end if;
  update class_members set removed_at = null where class_id = v_a and student_id = v_s;
  n := n + 1;

  -- B8 the class switch: owner only, audited, and off means no asking
  perform set_config('request.jwt.claims', json_build_object('sub', v_t2)::text, true);
  v_got := null;
  begin perform set_class_help(v_a, false); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your class' then raise exception 'FAIL B8 other teacher: %', v_got; end if;
  perform set_class_help(v_b, false);
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  perform set_class_help(v_a, false);
  if not exists (select 1 from audit_log where action = 'class.update' and target_id = v_a
                  and metadata->>'op' = 'set_help' and metadata->>'on' = 'false') then
    raise exception 'FAIL B8: no audit row';
  end if;
  if (class_help_open(v_a)->>'on')::boolean then raise exception 'FAIL B8: still on'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  if (my_help_state(v_ver)->>'can_ask')::boolean then raise exception 'FAIL B8: can ask with both off'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  perform set_class_help(v_a, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_t2)::text, true);
  perform set_class_help(v_b, true);
  n := n + 1;

  -- B9 at most 20 asks in a day (ST-11), counted as asks, not rows
  delete from help_requests where student_id = v_s;
  insert into help_requests (student_id, class_id, activity_id, activity_version_id, section_id,
                             created_at, lapses_at, ended_at, ended_by)
  select v_s, c, v_act, v_ver, 's1', now() - (i || ' minutes')::interval, now() + interval '1 hour',
         now(), 'student'
    from generate_series(1, 20) i, unnest(array[v_a, v_b]) c;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_got := null;
  begin perform ask_teacher(v_ver, 's1'); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'rate_limited' then raise exception 'FAIL B9 at 20: %', v_got; end if;
  delete from help_requests where student_id = v_s
     and created_at = (select min(created_at) from help_requests where student_id = v_s);
  v_r := ask_teacher(v_ver, 's1');
  if not (v_r->'open') ? 's1' then raise exception 'FAIL B9: 19 asks refused'; end if;
  n := n + 1;

  -- B10 the prune: dry run removes nothing; a real run takes only what is
  -- past 30 days and audits counts without naming a student
  update help_requests set created_at = now() - interval '31 days'
   where student_id = v_s and class_id = v_b and ended_at is not null;
  v_r := prune_help_requests();
  if (v_r->>'requests')::integer <> 19 or not (v_r->>'dry_run')::boolean
     or (select count(*) from help_requests where student_id = v_s) <> 40 then
    raise exception 'FAIL B10 dry run: %', v_r;
  end if;
  v_r := prune_help_requests(false);
  if (select count(*) from help_requests where student_id = v_s) <> 21
     or exists (select 1 from help_requests where created_at < now() - interval '30 days') then
    raise exception 'FAIL B10: real run took the wrong rows';
  end if;
  if (select (metadata->>'requests')::integer from audit_log
       where action = 'help_requests.prune' and target_id = v_b) is distinct from 19
     or exists (select 1 from audit_log where action = 'help_requests.prune'
                 and metadata::text ilike '%' || v_s::text || '%') then
    raise exception 'FAIL B10: the audit row is wrong';
  end if;
  n := n + 1;

  -- B11 a hand nobody can see is not "Asked": the student moves from A to C
  -- after asking; the state stops saying asked, and asking again reaches C
  delete from help_requests where student_id = v_s;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t2)::text, true);
  perform set_class_help(v_b, false);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_r := ask_teacher(v_ver, 's2');
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0090 C', v_t, 'vfy') returning id into v_c;
  insert into class_activities (class_id, activity_id, added_by) values (v_c, v_act, v_t);
  update class_members set removed_at = now() where class_id = v_a and student_id = v_s;
  insert into class_members (class_id, student_id) values (v_c, v_s);
  if (my_help_state(v_ver)->'open') ? 's2' then
    raise exception 'FAIL B11: an invisible request still reads as asked';
  end if;
  v_r := ask_teacher(v_ver, 's2');
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  if jsonb_array_length(class_help_open(v_c)->'requests') <> 1 then
    raise exception 'FAIL B11: the new class never got the hand';
  end if;
  -- …and a class joined while the hand is already up in C gets it on the
  -- next press, without a second row in C
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0090 D', v_t, 'vfy') returning id into v_d;
  insert into class_activities (class_id, activity_id, added_by) values (v_d, v_act, v_t);
  insert into class_members (class_id, student_id) values (v_d, v_s);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_r := ask_teacher(v_ver, 's2');
  if (select count(*) from help_requests where student_id = v_s and class_id = v_d and ended_at is null) <> 1
     or (select count(*) from help_requests where student_id = v_s and class_id = v_c and ended_at is null) <> 1 then
    raise exception 'FAIL B11: a newly joined class did not get the hand, or C got two';
  end if;
  n := n + 1;

  -- B12 a republish: the request follows the ACTIVITY, so the student on the
  -- new version still sees it and can withdraw it; the old version refuses
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_act, 3, '{"sections":[{"id":"s1"},{"id":"s2"}]}'::jsonb, v_t) returning id into v_new;
  update activities set current_version_id = v_new where id = v_act;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  if not (my_help_state(v_new)->'open') ? 's2' then
    raise exception 'FAIL B12: the request vanished on republish';
  end if;
  v_r := withdraw_help(v_new, 's2');
  if exists (select 1 from help_requests where student_id = v_s and ended_at is null) then
    raise exception 'FAIL B12: withdraw on the new version left a row open';
  end if;
  v_got := null;
  begin perform ask_teacher(v_ver, 's2'); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_available' then raise exception 'FAIL B12 old version: %', v_got; end if;
  n := n + 1;

  -- B13 Done is shown only while it is the student's latest word: after a
  -- later ask and withdraw it is gone
  v_r := ask_teacher(v_new, 's1');
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  -- (the student is in C and D now, both v_t's: Done in both)
  perform end_help(h.id) from help_requests h
   where h.student_id = v_s and h.section_id = 's1' and h.ended_at is null;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  if not (my_help_state(v_new)->'done') ? 's1' then raise exception 'FAIL B13: Done not shown'; end if;
  -- a fresh transaction-time stamp is needed for "later": move the Done row back
  update help_requests set created_at = created_at - interval '1 minute'
   where student_id = v_s and section_id = 's1';
  v_r := ask_teacher(v_new, 's1');
  v_r := withdraw_help(v_new, 's1');
  if (v_r->'done') ? 's1' then raise exception 'FAIL B13: Done came back after a later ask'; end if;
  n := n + 1;

  -- B14 no asking during an assessment (author ruling 2026-11-16): a DoL
  -- section is refused; a locked activity, an exam and a quiz refuse and say
  -- can_ask false; any other type still asks
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_act, 4, '{"sections":[{"id":"s1"},{"id":"dol","dol":{"skills":["x"]}}]}'::jsonb, v_t)
  returning id into v_new;
  update activities set current_version_id = v_new where id = v_act;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s)::text, true);
  v_got := null;
  begin perform ask_teacher(v_new, 'dol'); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_during_assessment' then raise exception 'FAIL B14 dol: %', v_got; end if;
  if not (my_help_state(v_new)->>'can_ask')::boolean then raise exception 'FAIL B14: a DoL activity hid asking everywhere'; end if;
  update activity_versions set content = jsonb_set(content, '{meta}', '{"submissionMode":"locked"}') where id = v_new;
  v_got := null;
  begin perform ask_teacher(v_new, 's1'); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_during_assessment' then raise exception 'FAIL B14 locked: %', v_got; end if;
  if (my_help_state(v_new)->>'can_ask')::boolean then raise exception 'FAIL B14: locked still can_ask'; end if;
  update activity_versions set content = jsonb_set(content, '{meta}', '{"activityType":"exam"}') where id = v_new;
  v_got := null;
  begin perform ask_teacher(v_new, 's1'); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_during_assessment' then raise exception 'FAIL B14 exam: %', v_got; end if;
  if (my_help_state(v_new)->>'can_ask')::boolean then raise exception 'FAIL B14: exam still can_ask'; end if;
  update activity_versions set content = jsonb_set(content, '{meta}', '{"activityType":"quiz"}') where id = v_new;
  v_got := null;
  begin perform ask_teacher(v_new, 's1'); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'not_during_assessment' then raise exception 'FAIL B14 quiz: %', v_got; end if;
  if (my_help_state(v_new)->>'can_ask')::boolean then raise exception 'FAIL B14: quiz still can_ask'; end if;
  update activity_versions set content = jsonb_set(content, '{meta}', '{"activityType":"review"}') where id = v_new;
  if not (my_help_state(v_new)->>'can_ask')::boolean then raise exception 'FAIL B14: a review hid asking'; end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-help: %/14', n;
end
$vfy$;
