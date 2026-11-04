-- verify-0083.sql — the keys behind the helper line (migration 0083).
--
-- Run with `pnpm verify:auth --target live|local`. Reads only, apart from the
-- rolled-back summary check in §B (P7).

-- @section A-settings-check
-- @expect-rows
select 'older_revisions_stay_valid',
       not exists (select 1 from mixed_settings_revision where not mixed_settings_ok(settings)),
       'every mirrored revision still passes the check';
select 'pair_accepted_and_either_alone_refused',
       (with r as (select '{"mixed_step_intervals": [1, 3], "mixed_wrong_drop": 1, "mixed_items_per_session": 6,
                            "mixed_max_discrimination": 1, "mixed_new_skills_per_session": 2,
                            "mixed_struggling_window": 5, "mixed_struggling_min_right": 3}'::jsonb s)
        select mixed_settings_ok(s || '{"mixed_seconds_per_item":[60,90],"period_shapes":{"lengths":{"50":[]}}}')
               and not mixed_settings_ok(s || '{"mixed_seconds_per_item":[60,90]}')
               and not mixed_settings_ok(s || '{"period_shapes":{"lengths":{"50":[]}}}')
               and not mixed_settings_ok(s || '{"mixed_seconds_per_item":[90,60],"period_shapes":{"lengths":{}}}')
               and not mixed_settings_ok(s || '{"mixed_seconds_per_item":[60,90],"period_shapes":{}}')
               and not mixed_settings_ok(s || '{"mixed_extra":1}')
          from r),
       'both or neither, well formed, and no other new key';

-- @section B-summary
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t  uuid := gen_random_uuid();
  v_k  uuid;
  v_set jsonb;
  v_rev text := repeat('c', 64);
  v_r  jsonb;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_t, 'vfy0083-t@vfy0083.example', '{}'::jsonb);
  update users set role = 'teacher', timezone = 'Pacific/Auckland' where id = v_t;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, school_year_ends_on)
  values (v_t, 'vfy 0083', v_t, 'vfy', current_date + 100) returning id into v_k;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);

  select settings into v_set from mixed_settings_revision order by mirrored_at desc, revision desc limit 1;
  if v_set is null then
    v_set := '{"mixed_step_intervals": [1, 3], "mixed_wrong_drop": 1, "mixed_items_per_session": 6,
               "mixed_max_discrimination": 1, "mixed_new_skills_per_session": 2,
               "mixed_struggling_window": 5, "mixed_struggling_min_right": 3}'::jsonb;
  end if;
  v_set := (v_set - 'period_shapes' - 'mixed_seconds_per_item')
           || '{"mixed_seconds_per_item":[60,90],"period_shapes":{"lengths":{"50":[{"kind":"mixed","minutes":[8,10]}]}}}';
  perform sync_mixed_settings(jsonb_build_object('revision', v_rev, 'graph_version', 'vfy', 'settings', v_set), true);
  update mixed_settings_revision set mirrored_at = '2999-01-01' where revision = v_rev;

  v_r := mixed_class_summary(v_k);
  if v_r->'seconds_per_item' <> '[60,90]'::jsonb or v_r->'period_shapes'->'lengths'->'50' is null then
    raise exception 'FAIL B1: summary gave %', v_r;
  end if;
  raise exception 'EXPECTED ROLLBACK >>> B-summary: 1/1';
end
$vfy$;
