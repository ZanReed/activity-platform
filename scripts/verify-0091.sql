-- verify-0091.sql — the review period, scheduler half (migration 0091,
-- docs/design/review-period.md RV-0 … RV-14). Run with
-- `pnpm verify:auth --target live|local`. §A reads the catalog and pure
-- functions only; §B is a self-fixturing EXPECTED-ROLLBACK block (P7).

-- @section A-posture
-- @expect-rows
select 'markers_on_the_three_tables',
       (select count(*) = 1 from information_schema.columns
         where table_schema = 'public' and table_name = 'mixed_sessions' and column_name = 'review'
           and is_nullable = 'NO' and column_default = 'false')
       and (select count(*) = 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'mixed_attempts' and column_name = 'retry'
               and is_nullable = 'NO' and column_default = 'false')
       and (select is_nullable = 'NO' from information_schema.columns
             where table_schema = 'public' and table_name = 'mixed_session_items' and column_name = 'position')
       and (select is_nullable = 'YES' from information_schema.columns
             where table_schema = 'public' and table_name = 'mixed_session_items' and column_name = 'retry_of'),
       'review on sessions, retry on attempts (both not null, default false); position not null, retry_of nullable on items';
select 'reviews_table_closed_to_clients',
       (select relrowsecurity and relforcerowsecurity from pg_class where relname = 'class_period_reviews')
       and not has_table_privilege('authenticated', 'class_period_reviews', 'select')
       and not has_table_privilege('anon', 'class_period_reviews', 'select')
       and not exists (select 1 from information_schema.columns
                        where table_schema = 'public' and table_name = 'class_period_reviews'
                          and data_type = 'uuid' and column_name <> 'class_id'),
       'RLS on and forced, no client grant, and no person-referencing column';
select 'engine_functions_service_only',
       not has_function_privilege('authenticated', 'review_plan(uuid, uuid, uuid, date, jsonb, integer, text, text[])', 'execute')
       and not has_function_privilege('anon', 'review_plan(uuid, uuid, uuid, date, jsonb, integer, text, text[])', 'execute')
       and not has_function_privilege('authenticated', 'review_items_for(uuid, jsonb, boolean)', 'execute')
       and not has_function_privilege('authenticated', 'mixed_plan(uuid, uuid, uuid, date, integer, jsonb, integer, text)', 'execute')
       and not has_function_privilege('authenticated', 'mixed_steps(uuid, uuid, integer[], integer)', 'execute'),
       'the plan, the size and the steps stay service-only';
select 'teacher_rpcs_signed_in_only',
       has_function_privilege('authenticated', 'set_class_review(uuid, date, boolean, text[], boolean)', 'execute')
       and not has_function_privilege('anon', 'set_class_review(uuid, date, boolean, text[], boolean)', 'execute')
       and has_function_privilege('authenticated', 'set_class_period_minutes(uuid, integer)', 'execute')
       and not has_function_privilege('anon', 'set_class_period_minutes(uuid, integer)', 'execute'),
       'set_class_review and set_class_period_minutes: signed in only';
with base as (select '{"mixed_step_intervals": [1, 3, 7, 14, 28], "mixed_wrong_drop": 1,
                       "mixed_items_per_session": 6, "mixed_max_discrimination": 1,
                       "mixed_new_skills_per_session": 2, "mixed_struggling_window": 5,
                       "mixed_struggling_min_right": 3}'::jsonb as b),
     rev as (select '{"review_items_max": 36, "review_max_items_per_skill": 2,
                      "review_same_skill_min_gap": 5, "review_retry_after_wrong": 1,
                      "review_max_discrimination_share": 0.33, "review_pull_order": "elapsed_share",
                      "review_pulled_step_up": false, "review_pulled_moves_due": false,
                      "review_min_fill": 0.67, "review_focus_share": 0.6}'::jsonb as r)
select 'settings_check_takes_all_ten_or_none',
       mixed_settings_ok(b) and mixed_settings_ok(b || r)
       and not mixed_settings_ok(b || (r - 'review_min_fill'))
       and not mixed_settings_ok(b || r || '{"review_extra": 1}')
       and not mixed_settings_ok(b || r || '{"review_pull_order": "stalest"}')
       and not mixed_settings_ok(b || r || '{"review_items_max": 51}')
       and not mixed_settings_ok(b || r || '{"review_focus_share": 1.2}')
       and not mixed_settings_ok(b || r || '{"review_pulled_step_up": 0}')
       and mixed_settings_ok(b || r || '{"review_retry_after_wrong": 0}'),
       'C-196''s bounds: ten or none, no stray key, elapsed_share only, items ≤ 50, shares in [0,1], flags boolean'
from base, rev;

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_rev    text := repeat('e', 64);
  v_set    jsonb := '{"mixed_step_intervals": [1, 3, 7, 14, 28], "mixed_wrong_drop": 1,
                      "mixed_items_per_session": 6, "mixed_max_discrimination": 1,
                      "mixed_new_skills_per_session": 1, "mixed_struggling_window": 5,
                      "mixed_struggling_min_right": 3,
                      "mixed_seconds_per_item": [60, 90],
                      "period_shapes": {"lengths": {
                        "50": [{"kind": "fluency", "minutes": [5, 5]}, {"kind": "hook", "minutes": [2, 3]},
                               {"kind": "activity", "minutes": "duration_min"}, {"kind": "mixed", "minutes": [8, 10]}],
                        "60": [{"kind": "fluency", "minutes": [5, 5]}, {"kind": "hook", "minutes": [2, 3]},
                               {"kind": "activity", "minutes": "duration_min"}, {"kind": "mixed", "minutes": [18, 20]}]}},
                      "review_items_max": 36, "review_max_items_per_skill": 2,
                      "review_same_skill_min_gap": 5, "review_retry_after_wrong": 1,
                      "review_max_discrimination_share": 0.33, "review_pull_order": "elapsed_share",
                      "review_pulled_step_up": false, "review_pulled_moves_due": false,
                      "review_min_fill": 0.67, "review_focus_share": 0.6}'::jsonb;
  v_zone   text := 'Pacific/Auckland';
  v_today  date;
  v_t      uuid := gen_random_uuid();
  v_o      uuid := gen_random_uuid();
  v_s1     uuid := gen_random_uuid();   -- the plan rules
  v_s2     uuid := gen_random_uuid();   -- a two-skill pool (the relaxed gap)
  v_s3     uuid := gen_random_uuid();   -- end to end: start, re-try, finish
  v_k      uuid;
  v_id     uuid;
  v_ver    uuid;
  v_i      integer;
  v_j      integer;
  v_key    text;
  v_got    text;
  v_res    jsonb;
  v_sess   uuid;
  v_seq    integer;
  v_r1     integer;
  v_r2     integer;
  v_pos    numeric;
  v_opos   numeric;
  v_n      integer;
  v_raised boolean;
  v_table  jsonb := '{"columns": ["x"], "rows": [[1], [2], [3]], "total": 3}'::jsonb;
  n        integer := 0;
begin
  v_today := (now() at time zone v_zone)::date;

  create function pg_temp.vfy_try(p_k uuid, p_s uuid, p_o uuid, p_day date, p_key text,
                                  p_ok boolean, p_early boolean, p_rev text)
  returns void language plpgsql as $f$
  declare v uuid;
  begin
    insert into mixed_sessions (class_id, student_id, practice_day, ordinal, revision, graded,
                                planned, keep_until, started_at, finished_at)
    select p_k, p_s, p_day,
           coalesce((select max(ordinal) from mixed_sessions
                      where class_id = p_k and student_id = p_s and practice_day = p_day), 0) + 1,
           p_rev, false, 1, current_date + 100, now() - interval '1 hour', now() - interval '1 hour'
    returning id into v;
    insert into mixed_session_items (session_id, seq, student_id, kind, bank_key, owner_id,
                                     item_id, fingerprint, row_index, document, row_values, early)
    values (v, 1, p_s, 'skill', p_key, p_o, 'vfy0091-' || right(p_key, 1) || '#one',
            repeat('0', 64), 0, '{}', '{}', p_early);
    insert into mixed_attempts (session_id, seq, student_id, class_id, practice_day, kind,
                                bank_key, correct, skipped, early)
    values (v, 1, p_s, p_k, p_day, 'skill', p_key, p_ok, false, p_early);
  end $f$;

  -- The plan, as "key:count" per key in key order, and its early keys.
  create function pg_temp.vfy_shape(p_k uuid, p_s uuid, p_set jsonb, p_n integer,
                                    p_zone text, p_focus text[])
  returns text language sql as $f$
    select string_agg(k || ':' || c, ',' order by k)
      from (select right(p.bank_key, 4) as k, count(*) as c
              from review_plan(p_k, p_s, gen_random_uuid(), (now() at time zone p_zone)::date,
                               p_set, p_n, p_zone, p_focus) p
             group by p.bank_key) x
  $f$;

  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0091-' || o || '@vfy0091.example', '{}'::jsonb
    from unnest(array[v_t, v_o, v_s1, v_s2, v_s3]) with ordinality x(u, o);
  update users set role = 'teacher' where id in (v_t, v_o);
  update users set role = 'student' where id in (v_s1, v_s2, v_s3);
  update users set timezone = v_zone where id = v_t;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0091', v_t, 'vfy', current_date + 100) returning id into v_k;
  insert into class_members (class_id, student_id) values (v_k, v_s1), (v_k, v_s2), (v_k, v_s3);

  -- Eight skills a … h, two templates each. a and b sit in the focus chain's
  -- folder. s1 and s3 checked all eight 60 days ago; s2 only a and b.
  for v_i in 1..8 loop
    v_key := 'skill.vfy0091.' || chr(96 + v_i);
    insert into activities (owner_id, title, slug, status, source_path, primary_skill)
    values (v_o, 'vfy ' || v_i, 'vfy-0091-' || v_i, 'published',
            case when v_i <= 2 then '901-chain.vfy.focus/0' || v_i || '.md' else 'p/0' || v_i || '.md' end,
            v_key)
    returning id into v_id;
    insert into activity_versions (activity_id, version_num, content, created_by)
    values (v_id, 1, '{"sections": [], "meta": {}}'::jsonb, v_o) returning id into v_ver;
    update activities set current_version_id = v_ver where id = v_id;
    insert into class_activities (class_id, activity_id, added_by) values (v_k, v_id, v_t);
    insert into section_checks (student_id, activity_id, activity_version_id, section_id,
                                attempt_number, responses, verdicts, created_at)
    select s, v_id, v_ver, 's1', 1, '{}', '{}', now() - interval '60 days'
      from unnest(case when v_i <= 2 then array[v_s1, v_s2, v_s3] else array[v_s1, v_s3] end) s;
    insert into practice_item (owner_id, item_id, bank_path, role, skill_id, chain_id,
                               discriminates, status, position, document, seed_spec,
                               value_table, fingerprint, retired_at)
    select v_o, 'vfy0091-' || chr(96 + v_i) || '#' || t, 'banks/vfy/x.md', 'skill', v_key,
           'chain.vfy0091', '{}', 'ratified', o::integer, '{"t":"x"}', '{}', v_table, repeat('7', 64), null
      from unnest(array['one', 'two']) with ordinality x(t, o);
  end loop;
  -- One discrimination bank over a and b.
  insert into practice_item (owner_id, item_id, bank_path, role, skill_id, chain_id,
                             discriminates, status, position, document, seed_spec,
                             value_table, fingerprint, retired_at)
  values (v_o, 'vfy0091-disc#one', 'banks/vfy/d.md', 'discrimination', null, 'chain.vfy.focus',
          array['skill.vfy0091.a', 'skill.vfy0091.b'], 'ratified', 0, '{"t":"d"}', '{}', v_table,
          repeat('7', 64), null);

  perform sync_mixed_settings(jsonb_build_object('revision', v_rev, 'graph_version', 'vfy',
                                                 'settings', v_set), true);
  update mixed_settings_revision set mirrored_at = '2999-01-01' where revision = v_rev;

  -- s1 and s3 share this history (intervals 1, 3, 7, 14, 28):
  --   a, b: right -10, -9 → step 2, due -2        → DUE
  --   c:    right -10, -9, -6 → step 3, due +8    → pulled, elapsed 6/14 = 0.43
  --   d:    right -5, -4 → step 2, due +3         → pulled, elapsed 4/7  = 0.57
  --   e:    right -2 → step 1, due +1             → pulled, elapsed 2/3  = 0.67
  --   f:    right -5, -4, then early today        → practised today: never pulled
  --   g, h: never practised                       → new (cap 1: g, chain order)
  foreach v_id in array array[v_s1, v_s3] loop
    foreach v_key in array array['a', 'b'] loop
      perform pg_temp.vfy_try(v_k, v_id, v_o, v_today - 10, 'skill.vfy0091.' || v_key, true, false, v_rev);
      perform pg_temp.vfy_try(v_k, v_id, v_o, v_today - 9,  'skill.vfy0091.' || v_key, true, false, v_rev);
    end loop;
    perform pg_temp.vfy_try(v_k, v_id, v_o, v_today - 10, 'skill.vfy0091.c', true, false, v_rev);
    perform pg_temp.vfy_try(v_k, v_id, v_o, v_today - 9,  'skill.vfy0091.c', true, false, v_rev);
    perform pg_temp.vfy_try(v_k, v_id, v_o, v_today - 6,  'skill.vfy0091.c', true, false, v_rev);
    perform pg_temp.vfy_try(v_k, v_id, v_o, v_today - 5,  'skill.vfy0091.d', true, false, v_rev);
    perform pg_temp.vfy_try(v_k, v_id, v_o, v_today - 4,  'skill.vfy0091.d', true, false, v_rev);
    perform pg_temp.vfy_try(v_k, v_id, v_o, v_today - 2,  'skill.vfy0091.e', true, false, v_rev);
    perform pg_temp.vfy_try(v_k, v_id, v_o, v_today - 5,  'skill.vfy0091.f', true, false, v_rev);
    perform pg_temp.vfy_try(v_k, v_id, v_o, v_today - 4,  'skill.vfy0091.f', true, false, v_rev);
    perform pg_temp.vfy_try(v_k, v_id, v_o, v_today,      'skill.vfy0091.f', true, true,  v_rev);
  end loop;

  -- B1 the size: (period − sprint) × 60 ÷ 90, capped at 36
  if review_items_for(v_k, v_set, false) <> 33 then
    raise exception 'FAIL B1: 50 min, sprint off gave %', review_items_for(v_k, v_set, false);
  end if;
  update classes set fact_sprint_on_at = now() where id = v_k;
  if review_items_for(v_k, v_set, false) <> 30 or review_items_for(v_k, v_set, true) <> 36 then
    raise exception 'FAIL B1: sprint on gave %, double %',
      review_items_for(v_k, v_set, false), review_items_for(v_k, v_set, true);
  end if;
  update classes set period_minutes = 60 where id = v_k;
  if review_items_for(v_k, v_set, false) <> 36 then
    raise exception 'FAIL B1: 60 min with the sprint gave %', review_items_for(v_k, v_set, false);
  end if;
  if review_items_for(v_k, v_set - 'review_items_max', false) is not null then
    raise exception 'FAIL B1: no review keys should give no size';
  end if;
  update classes set period_minutes = null, fact_sprint_on_at = null where id = v_k;
  n := n + 1;

  -- B2 the order: new g, due a and b, the bank, then pulled e > d > c by
  -- elapsed share; f (practised today) and h (over the new-skill cap) never.
  -- Seven keys: pass 1 takes all seven, pass 2 the first five (g, a, b, the
  -- bank, e); the bank's cap, floor(0.33 × 12) = 3, doesn't bind.
  v_got := pg_temp.vfy_shape(v_k, v_s1, v_set, 12, v_zone, '{}');
  if v_got is distinct from '91.a:2,91.b:2,91.c:1,91.d:1,91.e:2,91.g:2,disc:2' then
    raise exception 'FAIL B2: 12 items gave %', v_got;
  end if;
  n := n + 1;

  -- B3 fewer items: priority order holds; pulled skills come after due ones
  v_got := pg_temp.vfy_shape(v_k, v_s1, v_set, 5, v_zone, '{}');
  if v_got is distinct from '91.a:1,91.b:1,91.e:1,91.g:1,disc:1' then
    raise exception 'FAIL B3: 5 items gave % (want g, a, b, the bank, e)', v_got;
  end if;
  select string_agg(right(p.bank_key, 1), '' order by p.bank_key) into v_got
    from review_plan(v_k, v_s1, gen_random_uuid(), v_today, v_set, 6, v_zone, '{}') p
   where p.early;
  if v_got is distinct from 'de' then
    raise exception 'FAIL B3: at 6 items the early keys were % (want d, e: the two highest elapsed shares)', v_got;
  end if;
  n := n + 1;

  -- B4 the discrimination share: at share 0.1, 5 items hold no bank item
  v_got := pg_temp.vfy_shape(v_k, v_s1, v_set || '{"review_max_discrimination_share": 0.1}', 5, v_zone, '{}');
  if v_got is distinct from '91.a:1,91.b:1,91.d:1,91.e:1,91.g:1' then
    raise exception 'FAIL B4: share 0.1 gave %', v_got;
  end if;
  n := n + 1;

  -- B5 focus: at 5 items, a, b and the bank (all in the focus chain) take
  -- floor(0.6 × 5) = 3, and the rest fill from the others (g, then e)
  v_got := pg_temp.vfy_shape(v_k, v_s1, v_set, 5, v_zone, array['chain.vfy.focus']);
  if v_got is distinct from '91.a:1,91.b:1,91.e:1,91.g:1,disc:1' then
    raise exception 'FAIL B5: focus at 5 gave %', v_got;
  end if;
  -- at 10, the focus part is capped at 6: a, b twice and the bank twice = 6
  -- (bank cap floor(0.33 × 10) = 3 doesn't bind); others fill 4: g, e, d, c
  v_got := pg_temp.vfy_shape(v_k, v_s1, v_set, 10, v_zone, array['chain.vfy.focus']);
  if v_got is distinct from '91.a:2,91.b:2,91.c:1,91.d:1,91.e:1,91.g:1,disc:2' then
    raise exception 'FAIL B5: focus at 10 gave %', v_got;
  end if;
  n := n + 1;

  -- B6 the gap: a key's items are at least as far apart as there are keys,
  -- so with seven keys at least 5 (the gap); at 8 items, with two repeats,
  -- still at least 7
  select min(d) into v_i from (
    select p.seq - lag(p.seq) over (partition by p.bank_key order by p.seq) as d
      from review_plan(v_k, v_s1, gen_random_uuid(), v_today, v_set, 12, v_zone, '{}') p) x;
  if v_i is null or v_i < 7 then raise exception 'FAIL B6: at 12, closest repeat was % apart (want ≥ 7)', v_i; end if;
  select min(d) into v_i from (
    select p.seq - lag(p.seq) over (partition by p.bank_key order by p.seq) as d
      from review_plan(v_k, v_s1, gen_random_uuid(), v_today, v_set, 8, v_zone, '{}') p) x;
  if v_i is null or v_i < 7 then raise exception 'FAIL B6: at 8, closest repeat was % apart (want ≥ 7)', v_i; end if;
  -- a three-key pool (s2: a, b and the bank, all due) gives six items, which
  -- can't be 5 apart: it relaxes to never adjacent.
  foreach v_key in array array['a', 'b'] loop
    perform pg_temp.vfy_try(v_k, v_s2, v_o, v_today - 10, 'skill.vfy0091.' || v_key, true, false, v_rev);
  end loop;
  select string_agg(right(p.bank_key, 4), '|' order by p.seq) into v_got
    from review_plan(v_k, v_s2, gen_random_uuid(), v_today, v_set, 12, v_zone, '{}') p;
  if v_got !~ '^(91\.a|91\.b|disc)(\|(91\.a|91\.b|disc)){5}$'
     or exists (select 1 from regexp_split_to_table(v_got, '\|') with ordinality x(k, i)
                  join regexp_split_to_table(v_got, '\|') with ordinality y(k, j)
                    on y.j = x.i + 1 and y.k = x.k) then
    raise exception 'FAIL B6: the two-skill pool gave % (want six, none adjacent)', v_got;
  end if;
  n := n + 1;

  -- B7 a second template is used for a key's second item, and the row is
  -- salted with the seq
  select count(distinct p.item_id) into v_i
    from review_plan(v_k, v_s1, gen_random_uuid(), v_today, v_set, 12, v_zone, '{}') p
   where p.bank_key = 'skill.vfy0091.a';
  if v_i <> 2 then raise exception 'FAIL B7: a''s two items used % templates', v_i; end if;
  n := n + 1;

  -- B8 set_class_review: teacher only, today or later, chain ids only
  perform set_config('request.jwt.claims', json_build_object('sub', v_s1)::text, true);
  v_raised := false;
  begin perform set_class_review(v_k, v_today, true); exception when others then v_raised := true; end;
  if not v_raised then raise exception 'FAIL B8: a student placed a review'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  v_raised := false;
  begin perform set_class_review(v_k, v_today - 1, true); exception when others then v_raised := sqlerrm = 'past_day'; end;
  if not v_raised then raise exception 'FAIL B8: a past day was accepted'; end if;
  v_raised := false;
  begin perform set_class_review(v_k, v_today, true, array['not a chain']); exception when others then v_raised := sqlerrm = 'bad_focus_chain'; end;
  if not v_raised then raise exception 'FAIL B8: a bad focus chain was accepted'; end if;
  perform set_class_review(v_k, v_today + 3, true);
  perform set_class_review(v_k, v_today + 3, false);
  if exists (select 1 from class_period_reviews where class_id = v_k and on_date = v_today + 3) then
    raise exception 'FAIL B8: removing a review left it';
  end if;
  v_raised := false;
  begin perform set_class_period_minutes(v_k, 45); exception when others then v_raised := sqlerrm = 'not_a_period_length'; end;
  if not v_raised then raise exception 'FAIL B8: 45 min (not a mirrored length) was accepted'; end if;
  perform set_class_period_minutes(v_k, 50);
  if (select period_minutes from classes where id = v_k) <> 50 then raise exception 'FAIL B8: period not set'; end if;
  n := n + 1;

  -- B9 end to end (s3): on a review day, the ordinary start plans a review
  perform set_mixed_practice(v_k, true);
  perform set_mixed_settings(v_k, 6, true);
  perform set_class_review(v_k, v_today, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s3)::text, true);
  v_res := start_mixed_session(v_k, true);
  if v_res->>'state' <> 'started' or not (v_res->>'review')::boolean
     or (v_res->>'capacity')::integer <> 33 or not (v_res->>'thin')::boolean then
    raise exception 'FAIL B9: start gave %', v_res - 'session';
  end if;
  v_sess := (v_res->'session'->>'session_id')::uuid;
  if not (select review from mixed_sessions where id = v_sess)
     or (select planned from mixed_sessions where id = v_sess) <> 14 then
    raise exception 'FAIL B9: the session was review %, planned %',
      (select review from mixed_sessions where id = v_sess), (select planned from mixed_sessions where id = v_sess);
  end if;
  if exists (select 1 from mixed_session_items where session_id = v_sess and position <> seq) then
    raise exception 'FAIL B9: a planned item''s position is not its seq';
  end if;
  n := n + 1;

  -- B10 the re-try: wrong on a planned (early) item appends one, the next
  -- template, ≥ 5 places on, inheriting `early`
  select seq, position into v_seq, v_opos from mixed_session_items
   where session_id = v_sess and early order by seq limit 1;
  v_res := record_mixed_attempt(v_s3, v_sess, v_seq, false, false, '{}', '{}');
  v_r1 := (v_res->>'retry_seq')::integer;
  if v_r1 is null then raise exception 'FAIL B10: no re-try after a wrong answer: %', v_res; end if;
  select position into v_pos from mixed_session_items where session_id = v_sess and seq = v_r1;
  if v_pos < v_opos + 5
     or not (select early from mixed_session_items where session_id = v_sess and seq = v_r1)
     or (select retry_of from mixed_session_items where session_id = v_sess and seq = v_r1) <> v_seq
     or (select item_id from mixed_session_items where session_id = v_sess and seq = v_r1)
        = (select item_id from mixed_session_items where session_id = v_sess and seq = v_seq) then
    raise exception 'FAIL B10: the re-try sat at % (from %), or lost its marker, link or next template', v_pos, v_opos;
  end if;
  -- a replayed answer adds no second re-try and hands back the first
  v_res := record_mixed_attempt(v_s3, v_sess, v_seq, false, false, '{}', '{}');
  if not (v_res->>'replayed')::boolean or (v_res->>'retry_seq')::integer is distinct from v_r1
     or (select count(*) from mixed_session_items where session_id = v_sess and retry_of = v_seq) <> 1 then
    raise exception 'FAIL B10: a replay gave % (want replayed, retry_seq %)', v_res, v_r1;
  end if;
  -- it lands after the key's other items, plus the gap
  if v_pos < (select max(position) from mixed_session_items
               where session_id = v_sess and seq not in (v_seq, v_r1)
                 and bank_key = (select bank_key from mixed_session_items where session_id = v_sess and seq = v_seq)) + 5 then
    raise exception 'FAIL B10: the re-try sits within the gap of its key''s other item';
  end if;
  -- a wrong re-try earns none; a skip earns none
  v_res := record_mixed_attempt(v_s3, v_sess, v_r1, false, false, '{}', '{}');
  if v_res->>'retry_seq' is not null then raise exception 'FAIL B10: a re-try earned a re-try'; end if;
  select seq into v_i from mixed_session_items
   where session_id = v_sess and retry_of is null and seq <> v_seq order by seq limit 1;
  v_res := record_mixed_attempt(v_s3, v_sess, v_i, false, true, '{}', '{}');
  if v_res->>'retry_seq' is not null then raise exception 'FAIL B10: a skip earned a re-try'; end if;
  if not (select retry from mixed_attempts where session_id = v_sess and seq = v_r1) then
    raise exception 'FAIL B10: the re-try''s attempt is not marked';
  end if;
  n := n + 1;

  -- B11 score and finish count planned items only; a waiting re-try holds the
  -- finish open. Answer every planned item right but one, wrong on that one.
  for v_j in select seq from mixed_session_items
              where session_id = v_sess and retry_of is null
                and not exists (select 1 from mixed_attempts a where a.session_id = v_sess and a.seq = mixed_session_items.seq)
              order by seq loop
    v_res := record_mixed_attempt(v_s3, v_sess, v_j, v_j <> (select max(seq) from mixed_session_items
                                                              where session_id = v_sess and retry_of is null),
                                  false, '{}', '{}');
  end loop;
  v_r2 := (v_res->>'retry_seq')::integer;
  if v_r2 is null then raise exception 'FAIL B11: the last wrong answer earned no re-try'; end if;
  if (select finished_at from mixed_sessions where id = v_sess) is not null then
    raise exception 'FAIL B11: finished with a re-try still waiting';
  end if;
  select score_right, score_answered into v_i, v_n from mixed_sessions where id = v_sess;
  -- planned 14: wrong on v_seq, skipped one, wrong on the last → 11 right, 13 answered
  if v_i <> 11 or v_n <> 13 then raise exception 'FAIL B11: score %/% (want 11/13)', v_i, v_n; end if;
  perform record_mixed_attempt(v_s3, v_sess, v_r2, true, false, '{}', '{}');
  if (select finished_at from mixed_sessions where id = v_sess) is null then
    raise exception 'FAIL B11: not finished once the re-try was answered';
  end if;
  if (select score_right from mixed_sessions where id = v_sess) <> 11 then
    raise exception 'FAIL B11: a right re-try changed the score';
  end if;
  n := n + 1;

  -- B12 after a finished review, the day is done (no top-up), and the
  -- payload serves in position order with the re-tries named
  v_res := start_mixed_session(v_k, false);
  if v_res->>'state' <> 'done_today' then raise exception 'FAIL B12: after the review: %', v_res; end if;
  select count(*) into v_i
    from jsonb_array_elements(mixed_session_payload(v_sess)->'items') e
   where e->>'retry_of' is not null;
  if v_i <> 2 then raise exception 'FAIL B12: the payload named % re-tries', v_i; end if;
  n := n + 1;

  -- B13 the panel's reads leave re-tries out
  select tries into v_i from mixed_recent(v_k, 50)
   where student_id = v_s3 and bank_key = (select bank_key from mixed_session_items
                                            where session_id = v_sess and seq = v_seq);
  select count(*) into v_n from mixed_attempts a
   where a.class_id = v_k and a.student_id = v_s3 and not a.retry
     and a.bank_key = (select bank_key from mixed_session_items where session_id = v_sess and seq = v_seq);
  if v_i <> v_n then raise exception 'FAIL B13: mixed_recent counted % tries, % without re-tries', v_i, v_n; end if;
  n := n + 1;

  -- B15 the teacher's recent list leaves re-tries out: s3's last answer of
  -- all was a RIGHT re-try; the list's newest entry is the WRONG planned item
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  if not (select a.retry and a.correct from mixed_attempts a
           where a.session_id = v_sess order by a.saved_at desc, a.seq desc limit 1) then
    raise exception 'FAIL B15 precondition: the last answer was not a right re-try';
  end if;
  if (mixed_student_recent(v_k, v_s3)->0->>'correct')::boolean then
    raise exception 'FAIL B15: the recent list led with the re-try';
  end if;
  n := n + 1;

  -- B14 RV-6: a second daily session's top-up ranks by elapsed share. With
  -- the class's review removed, s1 at 5 items:
  -- g (new), a, b (due), the bank (cap 1) → 4; the one top-up is e (0.67),
  -- not c, which stalest-first would pick.
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  perform set_class_review(v_k, v_today, false);
  select string_agg(right(p.bank_key, 1), '' order by p.bank_key) into v_got
    from mixed_plan(v_k, v_s1, gen_random_uuid(), v_today, 2, v_set, 5, v_zone) p
   where p.early;
  if v_got is distinct from 'e' then raise exception 'FAIL B14: the top-up was % (want e)', v_got; end if;
  n := n + 1;

  -- B16 stopping a review early doesn't end the day: s1 answers one item,
  -- stops, and the next start plans the rest as another review
  perform set_class_review(v_k, v_today, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_s1)::text, true);
  v_res := start_mixed_session(v_k, true);
  if v_res->>'state' <> 'started' or not (v_res->>'review')::boolean then
    raise exception 'FAIL B16: s1''s start gave %', v_res - 'session';
  end if;
  v_sess := (v_res->'session'->>'session_id')::uuid;
  perform record_mixed_attempt(v_s1, v_sess, 1, true, false, '{}', '{}');
  perform finish_mixed_session(v_sess);
  v_res := start_mixed_session(v_k, false);
  if v_res->>'state' <> 'ready' or not (v_res->>'review')::boolean then
    raise exception 'FAIL B16: after stopping early: %', v_res;
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-behavioral: %/16', n;
end
$vfy$;
