-- verify-0080.sql — the 30-day prune on a clip's first tries (migration 0080).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block; everything rolls back (P7).

-- @section A-posture
-- @expect-rows
select 'prune_dry_run_by_default_and_service_only',
       not has_function_privilege('authenticated', 'prune_video_pause_tries(boolean)', 'execute')
       and not has_function_privilege('anon', 'prune_video_pause_tries(boolean)', 'execute')
       and (select pg_get_function_arguments(oid) from pg_proc where proname = 'prune_video_pause_tries')
             = 'p_dry_run boolean DEFAULT true',
       'this deleter of student work is dry-run by default and service-only';
-- @live-only (cron.job is pg_cron's; the local stack has no pg_cron)
select 'prune_is_unscheduled',
       not exists (select 1 from cron.job where command ilike '%prune_video_pause_tries%'),
       'DISARMED: no cron job runs the prune. Arming flips this row, with the author''s yes';

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t uuid := gen_random_uuid();
  v_s uuid := gen_random_uuid();
  v_a uuid;
  v_v uuid;
  v_old uuid := gen_random_uuid();
  v_edge uuid := gen_random_uuid();
  v_new uuid := gen_random_uuid();
  v_before integer;
  v_r jsonb;
begin
  insert into auth.users (id, email, raw_user_meta_data) values
    (v_t, 'vfy0080-t@vfy0080.example', '{}'::jsonb),
    (v_s, 'vfy0080-s@vfy0080.example', '{}'::jsonb);
  insert into activities (owner_id, title, slug, status)
  values (v_t, 'clip', 'vfy-0080', 'published') returning id into v_a;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_a, 1, '{"sections":[]}'::jsonb, v_t) returning id into v_v;

  insert into video_pause_tries (student_id, activity_version_id, block_id, correct, saved_at) values
    (v_s, v_v, v_old, false, now() - interval '31 days'),
    (v_s, v_v, v_edge, false, now() - interval '29 days 23 hours'),
    (v_s, v_v, v_new, true, now());
  select count(*) into v_before from video_pause_tries where saved_at < now() - interval '30 days';

  -- B1 the default removes nothing and writes no audit row
  v_r := prune_video_pause_tries();
  if (v_r->>'tries')::integer <> v_before or not (v_r->>'dry_run')::boolean then
    raise exception 'FAIL B1: the dry run reported %', v_r;
  end if;
  if not exists (select 1 from video_pause_tries where block_id = v_old)
     or exists (select 1 from audit_log where action = 'video_pause_tries.prune' and target_id = v_a) then
    raise exception 'FAIL B1: the dry run changed something';
  end if;

  -- B2 the real run takes only what is past 30 days, and audits counts
  v_r := prune_video_pause_tries(false);
  if exists (select 1 from video_pause_tries where block_id = v_old) then
    raise exception 'FAIL B2: a try past 30 days survived';
  end if;
  if not exists (select 1 from video_pause_tries where block_id = v_edge)
     or not exists (select 1 from video_pause_tries where block_id = v_new) then
    raise exception 'FAIL B2: a try inside 30 days was removed';
  end if;
  if (select (metadata->>'tries')::integer from audit_log
       where action = 'video_pause_tries.prune' and target_id = v_a) is distinct from 1 then
    raise exception 'FAIL B2: the audit row is wrong';
  end if;
  if (select metadata::text from audit_log
       where action = 'video_pause_tries.prune' and target_id = v_a) ilike '%' || v_s::text || '%' then
    raise exception 'FAIL B2: the audit row names a student';
  end if;

  raise exception 'EXPECTED ROLLBACK (all §B rows passed)';
end
$vfy$;
