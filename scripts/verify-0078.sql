-- verify-0078.sql — who gets a clip's URL (migration 0078, D64 VP-7).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block; everything rolls back (P7).
--
--   §A — the table has no client access, the read is pinned and not anonymous.
--   §B — the owner always gets the URL; a student gets it only when published,
--        cleared and not stale; every refusal is an empty result.
--   §C — D73: the setting is OFF. ⚠ This row is meant to fail if anyone turns it
--        on. Remove it on purpose, when the VP-8 checklist in TODOS is done.

-- @section A-posture
-- @expect-rows
select 'clearance_no_client_access',
       not exists (select 1 from pg_policies where tablename = 'video_clearance'),
       'video_clearance has zero policies, so no client can read or change it'
union all
select 'clearance_rls_forced',
       (select relrowsecurity and relforcerowsecurity from pg_class where oid = 'video_clearance'::regclass),
       'RLS is on and forced'
union all
select 'source_not_anonymous',
       not has_function_privilege('anon', 'video_source(uuid, uuid, uuid)', 'execute')
       and has_function_privilege('authenticated', 'video_source(uuid, uuid, uuid)', 'execute'),
       'video_source is for signed-in users only'
union all
select 'source_pinned',
       (select prosecdef and proconfig @> array['search_path=public'] from pg_proc where proname = 'video_source'),
       'video_source is definer with a pinned search_path';

-- @section B-behavioral
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t uuid := gen_random_uuid();
  v_s uuid := gen_random_uuid();
  v_a uuid;
  v_v uuid;
  v_v2 uuid;
  v_other_a uuid;
  v_b uuid := gen_random_uuid();
  v_x uuid := gen_random_uuid();
  v_url text;

  v_doc jsonb;
begin
  v_doc := jsonb_build_object('sections', jsonb_build_array(jsonb_build_object(
    'id', 's', 'isCheckpoint', true, 'rows', jsonb_build_array(jsonb_build_object(
      'id', 'r', 'columns', jsonb_build_array(jsonb_build_object(
        'id', 'c', 'blocks', jsonb_build_array(
          jsonb_build_object('id', v_b, 'type', 'video', 'title', 'Clip', 'url', 'https://youtu.be/vfy0078',
                             'captions', 'https://example.org/c.vtt', 'pauses', '[{"at":1}]'::jsonb, 'stale', false),
          jsonb_build_object('id', v_x, 'type', 'paragraph', 'content', '[]'::jsonb)
        ))))))));

  insert into auth.users (id, email, raw_user_meta_data) values
    (v_t, 'vfy0078-t@vfy0078.example', '{}'::jsonb),
    (v_s, 'vfy0078-s@vfy0078.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_t;
  update users set role = 'student' where id = v_s;

  insert into activities (owner_id, title, slug, status)
  values (v_t, 'clip', 'vfy-0078', 'published') returning id into v_a;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_a, 1, v_doc, v_t) returning id into v_v;
  update activities set current_version_id = v_v where id = v_a;
  insert into activities (owner_id, title, slug, status)
  values (v_t, 'other', 'vfy-0078-other', 'published') returning id into v_other_a;

  create function pg_temp.url_for(p_user uuid, p_a uuid, p_v uuid, p_b uuid)
  returns text language plpgsql as $f$
  declare r text;
  begin
    perform set_config('request.jwt.claims', jsonb_build_object('sub', p_user, 'role', 'authenticated')::text, true);
    select s.url into r from video_source(p_a, p_v, p_b) s;
    return r;
  end;
  $f$;

  -- B1 setting off: the owner gets it, a student doesn't
  update video_clearance set cleared = false;
  if pg_temp.url_for(v_t, v_a, v_v, v_b) is distinct from 'https://youtu.be/vfy0078' then
    raise exception 'FAIL B1: the owner did not get the URL';
  end if;
  if pg_temp.url_for(v_s, v_a, v_v, v_b) is not null then
    raise exception 'FAIL B1: a student got the URL with the setting off';
  end if;

  -- B2 setting on: a student gets it, with the captions
  update video_clearance set cleared = true;
  if pg_temp.url_for(v_s, v_a, v_v, v_b) is distinct from 'https://youtu.be/vfy0078' then
    raise exception 'FAIL B2: a student did not get the URL with the setting on';
  end if;
  perform set_config('request.jwt.claims', jsonb_build_object('sub', v_s, 'role', 'authenticated')::text, true);
  if (select s.captions from video_source(v_a, v_v, v_b) s) is distinct from 'https://example.org/c.vtt' then
    raise exception 'FAIL B2: the captions did not come back';
  end if;

  -- B3 a wrong block, a non-video block, a wrong parent: nothing, for anyone
  if pg_temp.url_for(v_t, v_a, v_v, gen_random_uuid()) is not null
     or pg_temp.url_for(v_t, v_a, v_v, v_x) is not null
     or pg_temp.url_for(v_t, v_other_a, v_v, v_b) is not null then
    raise exception 'FAIL B3: a mismatched read returned a URL';
  end if;

  -- B3b the version is the one asked for: a later version without the clip has none
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_a, 2, '{"sections":[]}'::jsonb, v_t) returning id into v_v2;
  if pg_temp.url_for(v_t, v_a, v_v2, v_b) is not null then
    raise exception 'FAIL B3b: a version without the clip returned a URL';
  end if;

  -- B4 stale: the owner still gets it, a student doesn't
  update activity_versions
     set content = jsonb_set(content, '{sections,0,rows,0,columns,0,blocks,0,stale}', 'true')
   where id = v_v;
  if pg_temp.url_for(v_s, v_a, v_v, v_b) is not null then
    raise exception 'FAIL B4: a student got a stale clip';
  end if;
  if pg_temp.url_for(v_t, v_a, v_v, v_b) is null then
    raise exception 'FAIL B4: the owner lost a stale clip';
  end if;

  -- B5 a clip with no stale field fails closed
  update activity_versions
     set content = content #- '{sections,0,rows,0,columns,0,blocks,0,stale}'
   where id = v_v;
  if pg_temp.url_for(v_s, v_a, v_v, v_b) is not null then
    raise exception 'FAIL B5: a clip with no stale field reached a student';
  end if;
  update activity_versions
     set content = jsonb_set(content, '{sections,0,rows,0,columns,0,blocks,0,stale}', 'false')
   where id = v_v;

  -- B6 unpublished: the owner only
  update activities set status = 'draft' where id = v_a;
  if pg_temp.url_for(v_s, v_a, v_v, v_b) is not null then
    raise exception 'FAIL B6: a student got a clip on an unpublished activity';
  end if;
  if pg_temp.url_for(v_t, v_a, v_v, v_b) is null then
    raise exception 'FAIL B6: the owner lost the clip on an unpublished activity';
  end if;
  update activities set status = 'published' where id = v_a;

  -- B7 a missing setting row reads as off
  delete from video_clearance;
  if pg_temp.url_for(v_s, v_a, v_v, v_b) is not null then
    raise exception 'FAIL B7: a missing setting row let a student through';
  end if;

  -- B8 deleted: nobody
  update activities set deleted_at = now() where id = v_a;
  if pg_temp.url_for(v_t, v_a, v_v, v_b) is not null then
    raise exception 'FAIL B8: a deleted activity returned a URL';
  end if;

  raise exception 'EXPECTED ROLLBACK (all §B rows passed)';
end
$vfy$;

-- @section C-gate
-- @expect-rows
select 'd73_setting_is_off',
       not coalesce((select cleared from video_clearance), false),
       'Students must not get clips until the VP-8 checklist in TODOS is done';
