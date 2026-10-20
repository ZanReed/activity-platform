-- verify-0066.sql — mixed practice's data and engine (migration 0066).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0045/0050 idiom): its own settings
-- revision stamped mirrored_at in 2999, its own bank owner, real functions,
-- everything rolled back (P7).
--
--   §A — catalog posture: the three tables are RLS-forced with no policy and
--        no client grant; the internals, the mirror, the verdict write and the
--        prune are service-role only; the client RPCs are signed-in only; the
--        prune is unscheduled and dry-run by default; the purge counts mixed
--        rows; the planner's index exists.
--   §B — the engine (ER-13): the settings check; the switch; primary_skill is
--        not client-writable; the pool (not the same day ACROSS TIMEZONES,
--        per-student taught, copy lineage, draft / retired / bankless
--        excluded, discrimination needs ALL its skills taught); the fill order and
--        caps; start (snapshot, seeding, idempotent resume, the graded flag);
--        the caller checks (one error); record-before-verdict replays; the
--        day rule and the one-step drop; lowest step first; rotation; the
--        ER-6 later-session fallback; the teacher reads; the prune (keeps a
--        graded score) and the purge.
--
-- The teacher's zone is Pacific/Auckland (UTC+12/+13), so "local midnight
-- plus a minute" is YESTERDAY in UTC: a check then must NOT be in today's
-- pool, and one a minute before local midnight must.

-- @section A-catalog-posture
-- @expect-rows
select 'mixed_tables_rls_forced_no_policy',
       (select bool_and(c.relrowsecurity and c.relforcerowsecurity) and count(*) = 4
          from pg_class c where c.relname in ('mixed_sessions', 'mixed_session_items',
                                              'mixed_attempts', 'mixed_settings_revision')
                            and c.relnamespace = 'public'::regnamespace)
       and not exists (select 1 from pg_policies
                        where tablename in ('mixed_sessions', 'mixed_session_items',
                                            'mixed_attempts', 'mixed_settings_revision')),
       'every read and write goes through the definer RPCs (the snapshot is answer-key class, ER-4)';
select 'mixed_tables_no_client_grant',
       (select bool_and(not has_table_privilege(r, t, p))
          from unnest(array['anon', 'authenticated']) r,
               unnest(array['mixed_sessions', 'mixed_session_items', 'mixed_attempts',
                            'mixed_settings_revision']) t,
               unnest(array['select', 'insert', 'update', 'delete']) p),
       'no client role reads or writes any of the four tables';
select 'mixed_internals_service_only',
       (select bool_and(not has_function_privilege('authenticated', p.oid, 'execute')
                        and not has_function_privilege('anon', p.oid, 'execute'))
               and count(*) = 11
          from pg_proc p
         where p.pronamespace = 'public'::regnamespace
           and p.proname in ('mixed_settings_ok', 'mixed_basis', 'mixed_taught', 'mixed_steps',
                             'mixed_plan', 'mixed_row_index', 'mixed_session_payload',
                             'mixed_recent', 'sync_mixed_settings', 'record_mixed_attempt',
                             'prune_mixed_practice')),
       'internals, the mirror, the verdict write and the deleter are not client-callable';
select 'mixed_rpcs_signed_in_only',
       (select bool_and(has_function_privilege('authenticated', f, 'execute')
                        and not has_function_privilege('anon', f, 'execute'))
          from unnest(array['set_mixed_practice(uuid,boolean)',
                            'set_mixed_settings(uuid,integer,boolean)',
                            'start_mixed_session(uuid,boolean)',
                            'mixed_item_for_check(uuid,integer)',
                            'finish_mixed_session(uuid)',
                            'mixed_class_summary(uuid)',
                            'mixed_class_students(uuid)']) f),
       'the switch, the settings, start, the check authorization, finish, the two teacher reads';
select 'mixed_definers_pinned',
       (select bool_and(prosecdef and proconfig @> array['search_path=public']) and count(*) = 15
          from pg_proc
         where pronamespace = 'public'::regnamespace
           and proname in ('sync_mixed_settings', 'mixed_basis', 'set_mixed_practice',
                           'set_mixed_settings', 'mixed_taught', 'mixed_steps', 'mixed_plan',
                           'mixed_session_payload', 'start_mixed_session', 'mixed_item_for_check',
                           'record_mixed_attempt', 'finish_mixed_session', 'mixed_recent',
                           'mixed_class_summary', 'mixed_class_students')),
       'definer, with a pinned search path';
select 'prune_service_only_dry_run_default',
       not has_function_privilege('authenticated', 'prune_mixed_practice(boolean)', 'execute')
       and (select pg_get_function_arguments(oid) from pg_proc where proname = 'prune_mixed_practice')
             = 'p_dry_run boolean DEFAULT true',
       'the third deleter of student work is dry-run by default and service-only';
-- @live-only (cron.job is pg_cron's; the local stack has no pg_cron)
select 'prune_is_unscheduled',
       not exists (select 1 from cron.job where command ilike '%prune_mixed_practice%'),
       'DISARMED: no cron job runs the prune. Arming flips this row, with the author''s yes';
select 'purge_counts_mixed_rows',
       (select prosrc ilike '%mixed purged%' and prosrc ilike '%delete from mixed_attempts%'
               and prosrc ilike '%sprint purged%'
          from pg_proc where proname = 'purge_soft_deleted'),
       'purge_soft_deleted v7 deletes mixed rows explicitly and counts them, and keeps v6''s';
select 'planner_index_exists',
       exists (select 1 from pg_indexes where indexname = 'practice_item_owner_skill_ratified')
       and exists (select 1 from pg_indexes where indexname = 'mixed_attempts_step_idx'),
       'ER-14: the planner''s two index reads';
select 'no_mixed_on_without_a_year_end',
       not exists (select 1 from classes where mixed_on_at is not null and school_year_ends_on is null),
       'a class cannot have mixed practice on without a school-year end';

-- @section B-engine
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_rev     text := repeat('e', 64);
  v_set     jsonb := '{"mixed_step_intervals": [1, 3, 7, 14, 28], "mixed_wrong_drop": 1,
                       "mixed_items_per_session": 6, "mixed_max_discrimination": 1,
                       "mixed_new_skills_per_session": 2, "mixed_struggling_window": 5,
                       "mixed_struggling_min_right": 3}'::jsonb;
  v_wide    jsonb;
  v_zone    text := 'Pacific/Auckland';
  v_today   date;
  v_mid     timestamptz;   -- local midnight today
  v_t       uuid := gen_random_uuid();   -- the class teacher
  v_o       uuid := gen_random_uuid();   -- the bank owner (the importer's account)
  v_x       uuid := gen_random_uuid();   -- another teacher
  v_s1      uuid := gen_random_uuid();   -- checked activities two days ago
  v_s2      uuid := gen_random_uuid();   -- checked nothing
  v_s3      uuid := gen_random_uuid();   -- a long history
  v_k       uuid;
  v_k2      uuid;
  v_act     uuid[] := '{}';
  v_ver     uuid[] := '{}';
  v_copy    uuid;
  v_copyver uuid;
  v_id      uuid;
  v_i       integer;
  v_res     jsonb;
  v_sess    uuid;
  v_sess2   uuid;
  v_got     text;
  v_n       integer;
  v_seq_a   integer;
  v_seq_b   integer;
  v_seq_d   integer;
  v_raised  boolean;
  v_doc     jsonb := '{"sections": [], "meta": {}}'::jsonb;
  v_table   jsonb := '{"columns": ["x"], "rows": [[1], [2], [3]], "total": 3}'::jsonb;
  n         integer := 0;
begin
  v_today := (now() at time zone v_zone)::date;
  v_mid   := v_today::timestamp at time zone v_zone;
  v_wide  := v_set || '{"mixed_new_skills_per_session": 6}'::jsonb;

  -- ---- fixtures ---------------------------------------------------------------
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0066-' || o || '@vfy0066.example', '{}'::jsonb
    from unnest(array[v_t, v_o, v_x, v_s1, v_s2, v_s3]) with ordinality x(u, o);
  update users set role = 'teacher' where id in (v_t, v_o, v_x);
  update users set role = 'student' where id in (v_s1, v_s2, v_s3);
  update users set display_name = 'Stu ' || substr(email, 9, 1) where id in (v_s1, v_s2, v_s3);
  update users set timezone = v_zone where id = v_t;

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0066 class', v_t, 'vfy', current_date + 100) returning id into v_k;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0066 no end date', v_t, 'vfy') returning id into v_k2;
  insert into class_members (class_id, student_id) values (v_k, v_s1), (v_k, v_s2), (v_k, v_s3);

  -- Seven catalogue activities owned by the bank owner: skills a..g.
  for v_i in 1..7 loop
    insert into activities (owner_id, title, slug, status, source_path, primary_skill)
    values (v_o, 'vfy ' || v_i, 'vfy-0066-' || v_i, 'published',
            'p/0' || v_i || '.md', 'skill.vfy0066.' || chr(96 + v_i))
    returning id into v_id;
    v_act := v_act || v_id;
    insert into activity_versions (activity_id, version_num, content, created_by)
    values (v_id, 1, v_doc, v_o) returning id into v_id;
    v_ver := v_ver || v_id;
    update activities set current_version_id = v_id where id = v_act[v_i];
  end loop;
  -- c reaches the class ONLY as the teacher's Bank copy (copy lineage).
  insert into activities (owner_id, title, slug, status, copied_from_activity_id)
  values (v_t, 'vfy copy of 3', 'vfy-0066-copy', 'published', v_act[3]) returning id into v_copy;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_copy, 1, v_doc, v_t) returning id into v_copyver;
  insert into class_activities (class_id, activity_id, added_by)
  select v_k, a, v_t from unnest(array[v_act[1], v_act[2], v_copy, v_act[4], v_act[5],
                                       v_act[6], v_act[7]]) a;

  -- The bank: a (2 templates), b, c ratified; d none; e draft only; f retired
  -- only; a discrimination bank on {a, b}; another on {a, z} (z never taught).
  insert into practice_item (owner_id, item_id, bank_path, role, skill_id, chain_id,
                             discriminates, status, position, document, seed_spec,
                             value_table, fingerprint, retired_at)
  values
    (v_o, 'vfy0066-a#one', 'banks/vfy/a.md', 'skill', 'skill.vfy0066.a', 'chain.vfy0066', '{}', 'ratified', 0, '{"t":"a1"}', '{}', v_table, repeat('1', 64), null),
    (v_o, 'vfy0066-a#two', 'banks/vfy/a.md', 'skill', 'skill.vfy0066.a', 'chain.vfy0066', '{}', 'ratified', 2, '{"t":"a2"}', '{}', v_table, repeat('2', 64), null),
    -- Between a's two live templates in bank order: a draft and a retired one.
    -- Rotation must step over both (B14).
    (v_o, 'vfy0066-a#draft', 'banks/vfy/a.md', 'skill', 'skill.vfy0066.a', 'chain.vfy0066', '{}', 'draft', 1, '{"t":"ad"}', '{}', v_table, repeat('a', 64), null),
    (v_o, 'vfy0066-a#old', 'banks/vfy/a.md', 'skill', 'skill.vfy0066.a', 'chain.vfy0066', '{}', 'ratified', 1, '{"t":"ao"}', '{}', v_table, repeat('b', 64), now()),
    (v_o, 'vfy0066-b#one', 'banks/vfy/b.md', 'skill', 'skill.vfy0066.b', 'chain.vfy0066', '{}', 'ratified', 0, '{"t":"b1"}', '{}', v_table, repeat('3', 64), null),
    (v_o, 'vfy0066-c#one', 'banks/vfy/c.md', 'skill', 'skill.vfy0066.c', 'chain.vfy0066', '{}', 'ratified', 0, '{"t":"c1"}', '{}', v_table, repeat('4', 64), null),
    (v_o, 'vfy0066-e#one', 'banks/vfy/e.md', 'skill', 'skill.vfy0066.e', 'chain.vfy0066', '{}', 'draft',    0, '{"t":"e1"}', '{}', v_table, repeat('5', 64), null),
    (v_o, 'vfy0066-f#one', 'banks/vfy/f.md', 'skill', 'skill.vfy0066.f', 'chain.vfy0066', '{}', 'ratified', 0, '{"t":"f1"}', '{}', v_table, repeat('6', 64), now()),
    (v_o, 'vfy0066-g#one', 'banks/vfy/g.md', 'skill', 'skill.vfy0066.g', 'chain.vfy0066', '{}', 'ratified', 0, '{"t":"g1"}', '{}', v_table, repeat('7', 64), null),
    (v_o, 'vfy0066-disc-ab#one', 'banks/vfy/disc-ab.md', 'discrimination', null, 'chain.vfy0066',
       array['skill.vfy0066.a', 'skill.vfy0066.b'], 'ratified', 0, '{"t":"dab"}', '{}', v_table, repeat('8', 64), null),
    (v_o, 'vfy0066-disc-az#one', 'banks/vfy/disc-az.md', 'discrimination', null, 'chain.vfy0066',
       array['skill.vfy0066.a', 'skill.vfy0066.z'], 'ratified', 0, '{"t":"daz"}', '{}', v_table, repeat('9', 64), null);

  -- s1: a, b, the copy (c), d, e, f checked a minute BEFORE local midnight
  -- (yesterday, locally); g checked a minute AFTER (today locally, yesterday
  -- in UTC — the timezone trap).
  insert into section_checks (student_id, activity_id, activity_version_id, section_id,
                              attempt_number, responses, verdicts, created_at)
  select v_s1, a, v, 's1', 1, '{}', '{}', v_mid - interval '1 minute'
    from unnest(array[v_act[1], v_act[2], v_copy, v_act[4], v_act[5], v_act[6]],
                array[v_ver[1], v_ver[2], v_copyver, v_ver[4], v_ver[5], v_ver[6]]) x(a, v);
  insert into section_checks (student_id, activity_id, activity_version_id, section_id,
                              attempt_number, responses, verdicts, created_at)
  values (v_s1, v_act[7], v_ver[7], 's1', 1, '{}', '{}', v_mid + interval '1 minute');
  -- s3: a, b, c taught 30 days ago.
  insert into section_checks (student_id, activity_id, activity_version_id, section_id,
                              attempt_number, responses, verdicts, created_at)
  select v_s3, a, v, 's1', 1, '{}', '{}', now() - interval '30 days'
    from unnest(array[v_act[1], v_act[2], v_copy], array[v_ver[1], v_ver[2], v_copyver]) x(a, v);

  -- B1 the settings check and the mirror ------------------------------------
  if not mixed_settings_ok(v_set)
     or mixed_settings_ok(v_set - 'mixed_wrong_drop')
     or mixed_settings_ok(v_set || '{"mixed_step_intervals": [1, 3, 3]}')
     or mixed_settings_ok(v_set || '{"mixed_wrong_drop": 5}')
     or mixed_settings_ok(v_set || '{"mixed_new_skills_per_session": 7}')
     or mixed_settings_ok(v_set || '{"mixed_struggling_min_right": 6}')
     or mixed_settings_ok(v_set || '{"mixed_extra": 1}') then
    raise exception 'FAIL B1: mixed_settings_ok accepts a bad set or refuses the agreed one';
  end if;
  v_res := sync_mixed_settings(jsonb_build_object('revision', v_rev, 'graph_version', 'vfy',
                                                  'settings', v_set), false);
  if v_res->>'status' <> 'new' or exists (select 1 from mixed_settings_revision where revision = v_rev) then
    raise exception 'FAIL B1: the dry-run mirror %', v_res;
  end if;
  perform sync_mixed_settings(jsonb_build_object('revision', v_rev, 'graph_version', 'vfy',
                                                 'settings', v_set), true);
  update mixed_settings_revision set mirrored_at = '2999-01-01' where revision = v_rev;
  v_res := sync_mixed_settings(jsonb_build_object('revision', v_rev, 'graph_version', 'vfy',
                                                  'settings', v_set), true);
  if v_res->>'status' <> 'unchanged' then raise exception 'FAIL B1: re-mirror %', v_res; end if;
  v_raised := false;
  begin
    perform sync_mixed_settings(jsonb_build_object('revision', v_rev, 'settings',
                                v_set || '{"mixed_wrong_drop": 2}'), true);
  exception when others then v_raised := true;
  end;
  if not v_raised then raise exception 'FAIL B1: a changed set under the same revision was accepted'; end if;
  n := n + 1;

  -- B2 the switch and the settings -------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_x)::text, true);
  v_raised := false;
  begin perform set_mixed_practice(v_k, true); exception when others then v_raised := true; end;
  if not v_raised then raise exception 'FAIL B2: another teacher switched mixed practice on'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  v_got := null;
  begin perform set_mixed_practice(v_k2, true); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'school_year_end_missing' then
    raise exception 'FAIL B2: no end date gave %', v_got;
  end if;
  v_res := set_mixed_practice(v_k, true);
  if (select mixed_on_at from classes where id = v_k) is null then
    raise exception 'FAIL B2: switching on %', v_res;
  end if;
  v_raised := false;
  begin perform set_mixed_settings(v_k, 0, false); exception when others then v_raised := true; end;
  if not v_raised then raise exception 'FAIL B2: 0 items per session accepted'; end if;
  n := n + 1;

  -- B3 primary_skill is not client-writable (the provenance guard) ----------
  v_raised := false;
  begin
    execute 'set local role authenticated';
    update activities set primary_skill = 'skill.vfy0066.a' where id = v_copy;
  exception when others then v_raised := sqlerrm like '%primary_skill is not client-writable%';
  end;
  execute 'reset role';
  if not v_raised then raise exception 'FAIL B3: a teacher wrote primary_skill on their own row'; end if;
  n := n + 1;

  -- B4 the pool (ER-13): s1, every new skill admitted (cap 6) --------------
  select string_agg(p.bank_key, ',' order by p.bank_key) into v_got
    from mixed_plan(v_k, v_s1, gen_random_uuid(), v_today, 1, v_wide, 6, v_zone) p;
  -- a, b, c (through the copy) and the {a,b} discrimination bank. NOT d (no
  -- bank), e (draft only), f (retired only), g (checked today, locally),
  -- disc-az (z is not taught).
  if v_got is distinct from 'skill.vfy0066.a,skill.vfy0066.b,skill.vfy0066.c,vfy0066-disc-ab' then
    raise exception 'FAIL B4: the pool is %', v_got;
  end if;
  -- C-148: a discrimination bank needs its skills TAUGHT, not banked. d is
  -- taught with no bank of its own, so a bank on {a, d} is eligible.
  insert into practice_item (owner_id, item_id, bank_path, role, skill_id, chain_id,
                             discriminates, status, position, document, seed_spec,
                             value_table, fingerprint, retired_at)
  values (v_o, 'vfy0066-disc-ad#one', 'banks/vfy/disc-ad.md', 'discrimination', null, 'chain.vfy0066',
          array['skill.vfy0066.a', 'skill.vfy0066.d'], 'ratified', 0, '{"t":"dad"}', '{}', v_table, repeat('c', 64), null);
  if not exists (select 1 from mixed_plan(v_k, v_s1, gen_random_uuid(), v_today, 1,
                                          v_wide || '{"mixed_max_discrimination": 2}', 6, v_zone)
                  where bank_key = 'vfy0066-disc-ad') then
    raise exception 'FAIL B4: a bank on {a, d} (d taught, unbanked) was not eligible';
  end if;
  delete from practice_item where owner_id = v_o and item_id = 'vfy0066-disc-ad#one';
  -- g IS in tomorrow's pool: the same-day rule only holds it back a day.
  if not exists (select 1 from mixed_plan(v_k, v_s1, gen_random_uuid(), v_today + 1, 1, v_wide, 6, v_zone)
                  where bank_key = 'skill.vfy0066.g') then
    raise exception 'FAIL B4: g never entered the pool';
  end if;
  n := n + 1;

  -- B5 per-student taught: s2 checked nothing ------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_s2)::text, true);
  v_res := start_mixed_session(v_k, false);
  if v_res->>'state' <> 'nothing_taught' then raise exception 'FAIL B5: s2 got %', v_res; end if;
  n := n + 1;

  -- B6 the fill order and caps: two new skills (chain order), one discrimination
  perform set_config('request.jwt.claims', json_build_object('sub', v_s1)::text, true);
  v_res := start_mixed_session(v_k, false);
  if v_res->>'state' <> 'ready' or (v_res->>'planned')::int <> 3
     or exists (select 1 from mixed_sessions where student_id = v_s1) then
    raise exception 'FAIL B6: the preview %', v_res;
  end if;
  -- The CLASS's item count bounds every tier, even below the curriculum caps
  -- (Fable review finding 1): one item, three new skills → one.
  select count(*) into v_n
    from mixed_plan(v_k, v_s1, gen_random_uuid(), v_today, 1, v_set, 1, v_zone);
  if v_n <> 1 then raise exception 'FAIL B6: a 1-item class planned % items', v_n; end if;
  -- C-145 ask 8: the most recent taught day first, then the backlog
  -- OLDEST-taught first in chain order (finding 2). s2 checks a 10 days ago,
  -- b 5 days ago, g today; tomorrow, with the cap of 2: g, then a (not b).
  insert into section_checks (student_id, activity_id, activity_version_id, section_id,
                              attempt_number, responses, verdicts, created_at)
  values (v_s2, v_act[1], v_ver[1], 's1', 1, '{}', '{}', now() - interval '10 days'),
         (v_s2, v_act[2], v_ver[2], 's1', 1, '{}', '{}', now() - interval '5 days'),
         (v_s2, v_act[7], v_ver[7], 's1', 1, '{}', '{}', v_mid + interval '1 minute');
  select string_agg(bank_key, ',' order by bank_key) into v_got
    from mixed_plan(v_k, v_s2, gen_random_uuid(), v_today + 1, 1, v_set, 6, v_zone)
   where kind = 'skill';
  if v_got is distinct from 'skill.vfy0066.a,skill.vfy0066.g' then
    raise exception 'FAIL B6: the backlog order gave % (want a and g)', v_got;
  end if;
  n := n + 1;

  -- B7 start: plan, snapshot, seeding, confusables together ----------------
  v_res := start_mixed_session(v_k, true);
  v_sess := (v_res->'session'->>'session_id')::uuid;
  select string_agg(kind || ':' || bank_key, ',' order by seq) into v_got
    from mixed_session_items where session_id = v_sess;
  if v_res->>'state' <> 'started' or v_got not like '%,discrimination:vfy0066-disc-ab'
     or v_got not like '%skill:skill.vfy0066.a%' or v_got not like '%skill:skill.vfy0066.b%' then
    raise exception 'FAIL B7: started % with %', v_res->>'state', v_got;
  end if;
  if exists (select 1 from mixed_session_items si
              join practice_item p on p.owner_id = si.owner_id and p.item_id = si.item_id
             where si.session_id = v_sess
               and (si.document is distinct from p.document or si.fingerprint <> p.fingerprint
                    or si.row_index <> mixed_row_index(v_sess, si.item_id, 3)
                    or si.row_values is distinct from jsonb_build_object('x', si.row_index + 1)))
     or (select planned from mixed_sessions where id = v_sess) <> 3
     or (select practice_day from mixed_sessions where id = v_sess) <> v_today
     or (select graded from mixed_sessions where id = v_sess)
     or (v_res->'session')::text ~ '"t"|"x"|document|row_values' then
    raise exception 'FAIL B7: the snapshot, the stored day or the payload (%)', v_res;
  end if;
  -- a's first template, never seen before
  if not exists (select 1 from mixed_session_items where session_id = v_sess and item_id = 'vfy0066-a#one') then
    raise exception 'FAIL B7: a did not start at its first template';
  end if;
  n := n + 1;

  -- B8 idempotent start (ER-9) ---------------------------------------------
  v_res := start_mixed_session(v_k, true);
  if v_res->>'state' <> 'resume' or (v_res->'session'->>'session_id')::uuid <> v_sess
     or (select count(*) from mixed_sessions where student_id = v_s1) <> 1 then
    raise exception 'FAIL B8: a second start %', v_res;
  end if;
  n := n + 1;

  -- B9 the caller checks: one error ----------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_s2)::text, true);
  v_got := null;
  begin perform mixed_item_for_check(v_sess, 1); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not available' then raise exception 'FAIL B9: another student got %', v_got; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s1)::text, true);
  v_got := null;
  begin perform mixed_item_for_check(v_sess, 99); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not available' then raise exception 'FAIL B9: an unplanned item gave %', v_got; end if;
  v_got := null;
  begin perform mixed_item_for_check(gen_random_uuid(), 1); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not available' then raise exception 'FAIL B9: an unknown session gave %', v_got; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  v_got := null;
  begin perform mixed_item_for_check(v_sess, 1); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not available' then raise exception 'FAIL B9: the teacher got %', v_got; end if;
  v_got := null;
  begin perform start_mixed_session(v_k, false); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not available' then raise exception 'FAIL B9: a teacher start gave %', v_got; end if;
  -- Off stops NEW sessions only (DM-8): the open one still checks.
  perform set_mixed_practice(v_k, false);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s1)::text, true);
  v_res := mixed_item_for_check(v_sess, 1);
  if (v_res->>'replay')::boolean or v_res->>'item_id' is null then
    raise exception 'FAIL B9: the open session after off %', v_res;
  end if;
  v_got := null;
  begin perform start_mixed_session(v_k, false); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not available' then raise exception 'FAIL B9: start while off gave %', v_got; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  perform set_mixed_practice(v_k, true);
  -- A removed member is refused.
  update class_members set removed_at = now() where class_id = v_k and student_id = v_s1;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s1)::text, true);
  v_got := null;
  begin perform mixed_item_for_check(v_sess, 1); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not available' then raise exception 'FAIL B9: a removed member got %', v_got; end if;
  update class_members set removed_at = null where class_id = v_k and student_id = v_s1;
  n := n + 1;

  -- B10 record before verdict: first write wins; replays never re-grade -----
  select seq into v_seq_a from mixed_session_items where session_id = v_sess and bank_key = 'skill.vfy0066.a';
  select seq into v_seq_b from mixed_session_items where session_id = v_sess and bank_key = 'skill.vfy0066.b';
  select seq into v_seq_d from mixed_session_items where session_id = v_sess and kind = 'discrimination';
  v_res := record_mixed_attempt(v_s1, v_sess, v_seq_a, true, false, '{"blanks":{}}', '{"b":{"verdict":"correct"}}');
  if (v_res->>'replayed')::boolean then raise exception 'FAIL B10: the first write %', v_res; end if;
  v_res := record_mixed_attempt(v_s1, v_sess, v_seq_a, false, false, '{}', '{}');
  if not (v_res->>'replayed')::boolean or not (v_res->>'correct')::boolean then
    raise exception 'FAIL B10: a second write changed the stored try %', v_res;
  end if;
  v_res := mixed_item_for_check(v_sess, v_seq_a);
  if not (v_res->>'replay')::boolean or not (v_res->>'correct')::boolean then
    raise exception 'FAIL B10: the check authorization did not replay %', v_res;
  end if;
  v_raised := false;
  begin perform record_mixed_attempt(v_s2, v_sess, v_seq_b, true, false, '{}', '{}');
  exception when others then v_raised := true; end;
  if not v_raised then raise exception 'FAIL B10: another student''s try was recorded'; end if;
  -- b skipped, the discrimination item right: the session finishes, right 2
  -- of 3, answered 2
  perform record_mixed_attempt(v_s1, v_sess, v_seq_b, false, true, '{}', '{}');
  perform record_mixed_attempt(v_s1, v_sess, v_seq_d, true, false, '{}', '{}');
  if (select finished_at is null or score_right <> 2 or score_answered <> 2
        from mixed_sessions where id = v_sess) then
    raise exception 'FAIL B10: the score or the finish';
  end if;
  n := n + 1;

  -- B11 a later session the same day (ER-6) --------------------------------
  -- a and b were practised today; c is the one new skill left; the
  -- discrimination bank was tried today. So: c alone.
  v_res := start_mixed_session(v_k, true);
  v_sess2 := (v_res->'session'->>'session_id')::uuid;
  select string_agg(bank_key, ',' order by seq) into v_got
    from mixed_session_items where session_id = v_sess2;
  if v_res->>'state' <> 'started' or (v_res->'session'->>'ordinal')::int <> 2
     or v_got is distinct from 'skill.vfy0066.c' then
    raise exception 'FAIL B11: the second session % with %', v_res->>'state', v_got;
  end if;
  perform record_mixed_attempt(v_s1, v_sess2, 1, false, false, '{}', '{}');
  v_res := finish_mixed_session(v_sess2);
  if (v_res->>'right')::int <> 0 or (v_res->>'planned')::int <> 1 then
    raise exception 'FAIL B11: finish %', v_res;
  end if;
  -- Nothing due is left; the third session falls back to today's skills.
  v_res := start_mixed_session(v_k, false);
  if v_res->>'state' <> 'ready' or (v_res->>'planned')::int <> 3 then
    raise exception 'FAIL B11: the fallback %', v_res;
  end if;
  n := n + 1;

  -- B12 the day rule and the one-step drop, from stored practice days -------
  -- s3, five days, two first tries on a each day: (R,R), (R,R), (R,W),
  -- (R,R), (R,R) → 1, 2, 1, 2, 3 — two right tries in a day are still ONE step.
  -- key b: wrong on all five days → 0 (floored).
  -- key c: right, right, right, right, right, right → 4 (the top step).
  for v_i in 1..6 loop
    insert into mixed_sessions (class_id, student_id, practice_day, ordinal, revision, graded,
                                planned, keep_until, started_at, finished_at)
    values (v_k, v_s3, v_today - 40 + v_i * 5, 1, v_rev, false, 5, current_date + 100,
            now() - interval '40 days', now() - interval '40 days')
    returning id into v_id;
    insert into mixed_session_items (session_id, seq, student_id, kind, bank_key, owner_id,
                                     item_id, fingerprint, row_index, document, row_values)
    select v_id, s, v_s3, 'skill', k, v_o, 'vfy0066-x#one', repeat('0', 64), 0, '{}', '{}'
      from (values (1, 'skill.vfy0066.a'), (2, 'skill.vfy0066.a'), (3, 'skill.vfy0066.b'),
                   (4, 'skill.vfy0066.c')) v(s, k);
    insert into mixed_attempts (session_id, seq, student_id, class_id, practice_day, kind,
                                bank_key, correct, skipped)
    select v_id, s, v_s3, v_k, v_today - 40 + v_i * 5, 'skill', k, ok, false
      from (values
        (1, 'skill.vfy0066.a', v_i <= 5),
        (2, 'skill.vfy0066.a', v_i <> 3),
        (3, 'skill.vfy0066.b', false),
        (4, 'skill.vfy0066.c', true)) v(s, k, ok)
     where v_i <= 5 or k = 'skill.vfy0066.c';
    delete from mixed_session_items si where si.session_id = v_id
       and not exists (select 1 from mixed_attempts a where a.session_id = si.session_id and a.seq = si.seq);
  end loop;
  select string_agg(bank_key || '=' || step || '@' || (due_on - last_day), ',' order by bank_key)
    into v_got
    from mixed_steps(v_k, v_s3, array[1, 3, 7, 14, 28], 1);
  -- days 1..5 for a: R, R, W (drop), R, R → 1, 2, 1, 2, 3. b: 0. c (6 days): 4.
  if v_got is distinct from 'skill.vfy0066.a=3@14,skill.vfy0066.b=0@1,skill.vfy0066.c=4@28' then
    raise exception 'FAIL B12: the derived steps are %', v_got;
  end if;
  -- a wrong drop of 2 instead: a = R,R,W,R,R → 1,2,0,1,2
  select step into v_n from mixed_steps(v_k, v_s3, array[1, 3, 7, 14, 28], 2)
   where bank_key = 'skill.vfy0066.a';
  if v_n <> 2 then raise exception 'FAIL B12: the drop is not mixed_wrong_drop (got %)', v_n; end if;
  n := n + 1;

  -- B13 due, lowest step first ---------------------------------------------
  -- s3 today: a last day today-15 at step 3 → due today-1; b today-15 at
  -- step 0 → due today-14; c today-10 at step 4 → due today+18 (not due).
  -- One item only: b (lowest step).
  select string_agg(bank_key, ',' order by seq) into v_got
    from mixed_plan(v_k, v_s3, gen_random_uuid(), v_today, 1, v_set, 1, v_zone);
  if v_got is distinct from 'skill.vfy0066.b' then
    raise exception 'FAIL B13: one item gave % (want b, the lowest step)', v_got;
  end if;
  select string_agg(bank_key, ',' order by bank_key) into v_got
    from mixed_plan(v_k, v_s3, gen_random_uuid(), v_today, 1, v_set, 6, v_zone);
  if v_got is distinct from 'skill.vfy0066.a,skill.vfy0066.b,vfy0066-disc-ab' then
    raise exception 'FAIL B13: the due set is %', v_got;
  end if;
  n := n + 1;

  -- B14 rotation: s1's next session on a serves a's next LIVE RATIFIED
  -- template (over a draft and a retired one); b wraps
  select string_agg(item_id, ',' order by item_id) into v_got
    from mixed_plan(v_k, v_s1, gen_random_uuid(), v_today + 30, 1, v_wide, 6, v_zone)
   where bank_key in ('skill.vfy0066.a', 'skill.vfy0066.b');
  if v_got is distinct from 'vfy0066-a#two,vfy0066-b#one' then
    raise exception 'FAIL B14: rotation gave %', v_got;
  end if;
  n := n + 1;

  -- B15 the graded flag is copied at start (ER-7) ---------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  perform set_mixed_settings(v_k, 4, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s1)::text, true);
  v_res := start_mixed_session(v_k, true);
  if not (v_res->>'graded')::boolean or (v_res->>'items_per_session')::int <> 4
     or not (select graded from mixed_sessions where id = (v_res->'session'->>'session_id')::uuid)
     or (select graded from mixed_sessions where id = v_sess) then
    raise exception 'FAIL B15: the graded flag %', v_res;
  end if;
  -- A finished session takes no NEW try, even from the service role (the
  -- backstop behind slice 2's check authorization; finding 4).
  v_sess2 := (v_res->'session'->>'session_id')::uuid;
  perform finish_mixed_session(v_sess2);
  v_raised := false;
  begin perform record_mixed_attempt(v_s1, v_sess2, 1, true, false, '{}', '{}');
  exception when others then v_raised := sqlerrm like '%session closed%'; end;
  if not v_raised then raise exception 'FAIL B15: a try was recorded into a finished session'; end if;
  n := n + 1;

  -- B16 the teacher reads ---------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_s1)::text, true);
  v_raised := false;
  begin perform mixed_class_summary(v_k); exception when others then v_raised := true; end;
  if not v_raised then raise exception 'FAIL B16: a student read the class summary'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  v_res := mixed_class_summary(v_k);
  -- b: s1 skipped once, s3 wrong five times → s3 alone is struggling
  -- (5 not right > 5 − 3; s1's one skip is not).
  if not (v_res->>'has_bank')::boolean
     or (select (s->>'struggling')::int from jsonb_array_elements(v_res->'skills') s
          where s->>'skill_id' = 'skill.vfy0066.b') <> 1
     or (select (s->>'skips')::int from jsonb_array_elements(v_res->'skills') s
          where s->>'skill_id' = 'skill.vfy0066.b') <> 1
     or (select (s->>'students_practising')::int from jsonb_array_elements(v_res->'skills') s
          where s->>'skill_id' = 'skill.vfy0066.a') <> 2
     or (v_res->>'practised_today')::int <> 1
     or v_res::text like '%vfy0066.example%' or v_res::text like '%Stu %' then
    raise exception 'FAIL B16: the summary %', v_res;
  end if;
  v_res := mixed_class_students(v_k);
  if jsonb_array_length(v_res) <> 3
     or (select r->'struggling' from jsonb_array_elements(v_res) r where (r->>'student_id')::uuid = v_s3)
          <> '["skill.vfy0066.b"]'::jsonb
     or (select (r->'latest_score'->>'planned')::int from jsonb_array_elements(v_res) r
          where (r->>'student_id')::uuid = v_s1) <> 3
     or (select r->'latest_score' from jsonb_array_elements(v_res) r where (r->>'student_id')::uuid = v_s2)
          is distinct from 'null'::jsonb then
    raise exception 'FAIL B16: the student rows %', v_res;
  end if;
  n := n + 1;

  -- B17 the prune: dry run first; an armed run keeps the graded score -------
  update mixed_sessions set keep_until = current_date - 1, started_at = now() - interval '2 days'
   where student_id = v_s1;
  update mixed_sessions set graded = true where id = v_sess;
  select count(*) into v_n from mixed_attempts where student_id = v_s1;
  v_res := prune_mixed_practice();
  -- s1 has three sessions: the first (now graded), the second (ungraded), the
  -- third (graded at start, B15).
  if not (v_res->>'dry_run')::boolean or (v_res->>'graded_kept')::int <> 2
     or (v_res->>'sessions')::int <> 1
     or (select count(*) from mixed_attempts where student_id = v_s1) <> v_n then
    raise exception 'FAIL B17: the dry run %', v_res;
  end if;
  v_res := prune_mixed_practice(false);
  if exists (select 1 from mixed_attempts where student_id = v_s1)
     or exists (select 1 from mixed_session_items where student_id = v_s1)
     or (select count(*) from mixed_sessions where student_id = v_s1) <> 2
     or (select pruned_at is null or score_right <> 2 from mixed_sessions where id = v_sess)
     or not exists (select 1 from mixed_sessions where student_id = v_s3)
     or not exists (select 1 from audit_log where action = 'mixed_practice.prune' and target_id = v_k) then
    raise exception 'FAIL B17: the armed run %', v_res;
  end if;
  n := n + 1;

  -- B18 the purge: a deleted account's mixed rows go, counted ---------------
  select count(*) into v_n from mixed_attempts where student_id = v_s3;
  update users set deleted_at = now() - interval '31 days' where id = v_s3;
  perform purge_soft_deleted();
  if exists (select 1 from mixed_attempts where student_id = v_s3)
     or exists (select 1 from mixed_sessions where student_id = v_s3)
     or (select (regexp_match(notes, 'mixed purged ([0-9]+) attempts'))[1]::int
           from analytics_job_runs where job_name = 'purge' order by id desc limit 1) < v_n then
    raise exception 'FAIL B18: the purge''s counted delete';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-engine: %/18', n;
end
$vfy$;
