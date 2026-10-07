-- verify-0056.sql — the Activity Bank lists units in teaching order
-- (migration 0056).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block (P7).
--
--   §A — posture: list_bank still signed-in only, definer, pinned.
--   §B — two catalogue units whose NAMES sort opposite to their chain folders:
--        the Bank returns them in folder (teaching) order, and a hand-made
--        listed activity (no source_path) comes after the catalogue rows.

-- @section A-catalog-posture
-- @expect-rows
select 'list_bank_signed_in_only_definer',
       (select has_function_privilege('authenticated', p.oid, 'execute')
               and not has_function_privilege('anon', p.oid, 'execute')
               and p.prosecdef and p.proconfig @> array['search_path=public']
          from pg_proc p where p.proname = 'list_bank'),
       'grants survived the CREATE OR REPLACE';

-- @section B-teaching-order
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_author uuid := gen_random_uuid();
  v_doc    jsonb := '{"schemaVersion":2,"meta":{"title":"vfy","course":"VFY Course","activityType":"worksheet"},"sections":[]}'::jsonb;
  v_ids    uuid[] := array[]::uuid[];
  v_id     uuid;
  v_order  text[];
  r        record;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_author, 'vfy0056-1@vfy0056.example', '{}'::jsonb);
  update users set role = 'teacher', teacher_caps_exempt = true where id = v_author;
  perform set_config('request.jwt.claims', json_build_object('sub', v_author)::text, true);

  -- folder 712 = "Z unit" and folder 713 = "A unit": alphabetical order would
  -- put 713 first; teaching order puts 712 first. Plus one hand-made row.
  for r in select * from (values
      ('vfy-712-01', '712-vfy.z/01.md', 'Z unit'),
      ('vfy-712-02', '712-vfy.z/02.md', 'Z unit'),
      ('vfy-713-01', '713-vfy.a/01.md', 'A unit'),
      ('vfy-hand',   null,              'B unit')) t(slug, path, unit)
  loop
    insert into activities (owner_id, title, slug, course, draft_content, source_path)
    values (v_author, r.slug, r.slug, 'VFY Course',
            jsonb_set(v_doc, '{meta,unit}', to_jsonb(r.unit)), r.path)
    returning id into v_id;
    perform publish_activity(v_id);
    perform set_activity_listing(v_id, true);
  end loop;

  select array_agg(b.title order by ord) into v_order
  from list_bank() with ordinality as b(id, title, description, course, unit, tags,
       pedagogical_role, activity_type, source_path, has_guide, version_num,
       published_at, author_name, ord)
  where b.course = 'VFY Course';

  if v_order is distinct from array['vfy-712-01', 'vfy-712-02', 'vfy-713-01', 'vfy-hand'] then
    raise exception 'FAIL B1: Bank order %', v_order;
  end if;

  raise exception 'EXPECTED ROLLBACK >>> B-teaching-order: 1/1';
end
$vfy$;
