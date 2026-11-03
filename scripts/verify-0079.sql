-- verify-0079.sql — a clip's first tries and the struggling rule (migration 0079,
-- D64 VP-3, VP-4).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block; everything rolls back (P7).
--
--   §A — no client can read or write a try; the writer takes a verdict, so it is
--        service-role only.
--   §B — the first answer never changes; a teacher and a checked section record
--        nothing; the try ceiling fires; mixed_recent counts a try per class.

-- @section A-posture
-- @expect-rows
select 'tries_no_client_access',
       not exists (select 1 from pg_policies where tablename = 'video_pause_tries'),
       'video_pause_tries has zero policies'
union all
select 'tries_rls_forced',
       (select relrowsecurity and relforcerowsecurity from pg_class where oid = 'video_pause_tries'::regclass),
       'RLS is on and forced'
union all
select 'writer_service_role_only',
       not has_function_privilege('authenticated', 'record_video_pause_try(uuid, uuid, uuid, text, uuid, boolean, integer)', 'execute')
       and not has_function_privilege('anon', 'record_video_pause_try(uuid, uuid, uuid, text, uuid, boolean, integer)', 'execute')
       and has_function_privilege('service_role', 'record_video_pause_try(uuid, uuid, uuid, text, uuid, boolean, integer)', 'execute'),
       'only the service role can pass a verdict'
union all
select 'recent_still_not_client_callable',
       not has_function_privilege('authenticated', 'mixed_recent(uuid, integer)', 'execute'),
       'mixed_recent kept its grants through the replace';

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t uuid := gen_random_uuid();
  v_s uuid := gen_random_uuid();
  v_o uuid := gen_random_uuid();
  v_c uuid;
  v_other uuid;
  v_a uuid;
  v_copy uuid;
  v_v uuid;
  v_copy_v uuid;
  v_b1 uuid := gen_random_uuid();
  v_b2 uuid := gen_random_uuid();
  v_r jsonb;
  v_row video_pause_tries%rowtype;
  v_tries integer;
  v_right integer;
begin
  insert into auth.users (id, email, raw_user_meta_data) values
    (v_t, 'vfy0079-t@vfy0079.example', '{}'::jsonb),
    (v_s, 'vfy0079-s@vfy0079.example', '{}'::jsonb),
    (v_o, 'vfy0079-o@vfy0079.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_t;
  update users set role = 'student' where id in (v_s, v_o);

  insert into activities (owner_id, title, slug, status, primary_skill)
  values (v_t, 'clip', 'vfy-0079', 'published', 'vfy.0079.skill') returning id into v_a;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_a, 1, '{"sections":[]}'::jsonb, v_t) returning id into v_v;

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy', v_t, 'vfy', current_date + 200) returning id into v_c;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy2', v_t, 'vfy', current_date + 200) returning id into v_other;
  -- v_s is in both classes, so only the activity can tell them apart (B2).
  insert into class_members (class_id, student_id) values (v_c, v_s), (v_c, v_o), (v_other, v_s);
  insert into class_activities (class_id, activity_id, added_by) values (v_c, v_a, v_t);

  -- B1 the first answer stays; later tries only count up
  v_r := record_video_pause_try(v_s, v_a, v_v, 's', v_b1, false);
  if not (v_r->>'recorded')::boolean or (v_r->>'tries')::integer <> 1 then
    raise exception 'FAIL B1: the first try did not record: %', v_r;
  end if;
  v_r := record_video_pause_try(v_s, v_a, v_v, 's', v_b1, true);
  select * into v_row from video_pause_tries where student_id = v_s and block_id = v_b1;
  if v_row.correct or v_row.tries <> 2 then
    raise exception 'FAIL B1: a retry changed the first answer (correct %, tries %)', v_row.correct, v_row.tries;
  end if;
  if v_row.skill_id is distinct from 'vfy.0079.skill' then
    raise exception 'FAIL B1: the skill was %', v_row.skill_id;
  end if;

  -- B2 the rule sees it, in this class and not another
  select r.tries, r.right_n into v_tries, v_right from mixed_recent(v_c, 5) r
   where r.student_id = v_s and r.bank_key = 'vfy.0079.skill';
  if v_tries is distinct from 1 or v_right is distinct from 0 then
    raise exception 'FAIL B2: mixed_recent read % tries, % right', v_tries, v_right;
  end if;
  if exists (select 1 from mixed_recent(v_other, 5) r where r.student_id = v_s) then
    raise exception 'FAIL B2: a try leaked into a class without the activity';
  end if;
  if exists (select 1 from mixed_recent(v_c, 5) r where r.student_id = v_o) then
    raise exception 'FAIL B2: another student got this try';
  end if;

  -- B3 a right first try counts as right, on the same skill
  perform record_video_pause_try(v_s, v_a, v_v, 's', v_b2, true);
  select r.tries, r.right_n into v_tries, v_right from mixed_recent(v_c, 5) r
   where r.student_id = v_s and r.bank_key = 'vfy.0079.skill';
  if v_tries is distinct from 2 or v_right is distinct from 1 then
    raise exception 'FAIL B3: mixed_recent read % tries, % right', v_tries, v_right;
  end if;

  -- B4 the window: only the newest count
  update video_pause_tries set saved_at = now() - interval '2 days' where block_id = v_b1;
  select r.tries, r.right_n into v_tries, v_right from mixed_recent(v_c, 1) r
   where r.student_id = v_s and r.bank_key = 'vfy.0079.skill';
  if v_tries is distinct from 1 or v_right is distinct from 1 then
    raise exception 'FAIL B4: a window of one read % tries, % right', v_tries, v_right;
  end if;

  -- B5 a removed member stops counting
  update class_members set removed_at = now() where class_id = v_c and student_id = v_s;
  if exists (select 1 from mixed_recent(v_c, 5) r where r.student_id = v_s) then
    raise exception 'FAIL B5: a removed member still counted';
  end if;
  update class_members set removed_at = null where class_id = v_c and student_id = v_s;

  -- B5b the two readers the ruling names: three wrong pauses out of the window
  -- make "Keep practising" on the tracker and "Getting stuck" on the teacher's list.
  update activities set unit = 'vfy-0079-unit', source_path = 'vfy/0079' where id = v_a;
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_s, v_a, v_v, 'taught', 1, '{}'::jsonb, '{}'::jsonb);
  perform record_video_pause_try(v_s, v_a, v_v, 's', gen_random_uuid(), false);
  perform record_video_pause_try(v_s, v_a, v_v, 's', gen_random_uuid(), false);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', v_s, 'role', 'authenticated')::text, true);
  if my_unit_tracker(v_c)::text not like '%keep_practising%' then
    raise exception 'FAIL B5b: the tracker did not read the pause tries: %', my_unit_tracker(v_c);
  end if;
  perform set_config('request.jwt.claims', jsonb_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  if mixed_class_students(v_c)::text not like '%vfy.0079.skill%' then
    raise exception 'FAIL B5b: the teacher list did not read the pause tries: %', mixed_class_students(v_c);
  end if;
  delete from section_checks where student_id = v_s;
  delete from video_pause_tries where student_id = v_s and block_id not in (v_b1, v_b2);

  -- B6 the owner trying their own clip records nothing
  v_r := record_video_pause_try(v_t, v_a, v_v, 's', v_b1, true);
  if (v_r->>'recorded')::boolean or exists (select 1 from video_pause_tries where student_id = v_t) then
    raise exception 'FAIL B6: the owner recorded a try';
  end if;

  -- B7 after the section's check: nothing recorded, and the handler is told
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_o, v_a, v_v, 's', 1, '{}'::jsonb, '{}'::jsonb);
  v_r := record_video_pause_try(v_o, v_a, v_v, 's', v_b1, true);
  if not coalesce((v_r->>'already_checked')::boolean, false)
     or exists (select 1 from video_pause_tries where student_id = v_o) then
    raise exception 'FAIL B7: a checked section still recorded: %', v_r;
  end if;
  -- ...and a different section's check doesn't stop it
  v_r := record_video_pause_try(v_o, v_a, v_v, 'other', v_b2, true);
  if not (v_r->>'recorded')::boolean then
    raise exception 'FAIL B7: another section''s check blocked a try: %', v_r;
  end if;

  -- B8 a section check alone never feeds the rule (no double count)
  if (select count(*) from mixed_recent(v_c, 5) r where r.student_id = v_o) <> 1
     or (select r.tries from mixed_recent(v_c, 5) r where r.student_id = v_o) <> 1 then
    raise exception 'FAIL B8: a section check reached mixed_recent';
  end if;

  -- B9 a Bank copy's try carries the source's skill and counts in the copy's class
  insert into activities (owner_id, title, slug, status, copied_from_activity_id)
  values (v_t, 'copy', 'vfy-0079-copy', 'published', v_a) returning id into v_copy;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_copy, 1, '{"sections":[]}'::jsonb, v_t) returning id into v_copy_v;
  insert into class_activities (class_id, activity_id, added_by) values (v_other, v_copy, v_t);
  perform record_video_pause_try(v_s, v_copy, v_copy_v, 's', gen_random_uuid(), true);
  if (select r.bank_key from mixed_recent(v_other, 5) r where r.student_id = v_s) is distinct from 'vfy.0079.skill' then
    raise exception 'FAIL B9: a copy did not count against its source''s skill';
  end if;

  -- B10 the ceiling fires, at the production default (P3)
  update video_pause_tries set tries = 30 where student_id = v_s and block_id = v_b1;
  begin
    perform record_video_pause_try(v_s, v_a, v_v, 's', v_b1, true);
    raise exception 'FAIL B10: the try ceiling did not fire';
  exception when others then
    if sqlerrm <> 'rate_limited' then raise; end if;
  end;

  -- B11 a version that isn't this activity's: refused
  begin
    perform record_video_pause_try(v_s, v_copy, v_v, 's', v_b1, true);
    raise exception 'FAIL B11: a foreign version recorded';
  exception when insufficient_privilege then null;
  end;

  -- B12 the account's deletion takes the tries with it
  delete from auth.users where id = v_o;
  if exists (select 1 from video_pause_tries where student_id = v_o) then
    raise exception 'FAIL B12: a deleted account left a try behind';
  end if;

  raise exception 'EXPECTED ROLLBACK (all §B rows passed)';
end
$vfy$;
