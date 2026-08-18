-- verify-0037.sql — the activity taxonomy slice: tags, pedagogical_role, and
-- publish-truth course/unit stamping (migration 0037; plan + rulings in
-- docs/design/activity-taxonomy.md).
--
-- Run with `pnpm verify:auth --target live|local`. §C is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0034/0035 idiom): real rows through the
-- real publish_activity RPC, everything rolled back — durable-write-free on
-- every path (P7).
--
-- WHY EACH SECTION EXISTS:
--   §A — catalog posture: both columns exist with the exact shape the rulings
--        specify (tags NOT NULL default '{}', pedagogical_role NULLABLE), the
--        enum carries exactly the three P3 values, publish_activity's body
--        actually references the stamped columns, and — the row that exists to
--        stop a helpful future session — there is deliberately NO index on
--        tags yet (D12: the index ships with the Bank's first server-side tag
--        query, not before it has a caller).
--   §C — the behavioral matrix, one fixture, in order:
--        S  publish STAMPS course + unit from the snapshot (R1);
--        N  a document with NO unit nulls the column — the stamp MIRRORS the
--           published document, it does not accumulate history;
--        C  a document with no meta.course KEEPS the prior column value (the
--           `not null` constraint is never violated by a partial document);
--        R  publish does NOT touch tags or pedagogical_role — they are
--           row-native listing metadata, and the whole provenance ruling is
--           that exactly one writer owns each column;
--        V  the stamped columns equal what was frozen into activity_versions,
--           which is the P4 invariant the app-side sweep test also pins:
--           row == published snapshot, never "row was merely written".

-- @section A-catalog-posture
-- @expect-rows
select 'tags_column_exists',
       (select data_type = 'ARRAY' from information_schema.columns
         where table_schema = 'public' and table_name = 'activities'
           and column_name = 'tags'),
       'R4: row-native discovery vocabulary, text[]';
select 'tags_not_null_defaulted',
       (select is_nullable = 'NO' and column_default like '%{}%'
          from information_schema.columns
         where table_schema = 'public' and table_name = 'activities'
           and column_name = 'tags'),
       'an untagged activity carries an empty array, never NULL — readers never branch on nullness';
select 'pedagogical_role_column_nullable',
       (select is_nullable = 'YES' from information_schema.columns
         where table_schema = 'public' and table_name = 'activities'
           and column_name = 'pedagogical_role'),
       'R7: unclassified is a legitimate state; the column is captured at authoring time, not forced';
select 'pedagogical_role_enum_values',
       (select array_agg(enumlabel::text order by enumsortorder)
          from pg_enum where enumtypid = 'pedagogical_role'::regtype)
       = array['lesson', 'review', 'practice'],
       'exactly the three red-teamed P3 values (2026-07-24 Activity Bank design) — no more, no fewer';
select 'no_activity_type_column',
       not exists (select 1 from information_schema.columns
                    where table_schema = 'public' and table_name = 'activities'
                      and column_name = 'activity_type'),
       'R2: the Bank enum ships as pedagogical_role precisely so it never collides with the DOCUMENT field meta.activityType (presentation format). If this row ever goes red, the collision this migration exists to prevent has shipped';
select 'publish_stamps_course_and_unit',
       (select strpos(prosrc, 'course') > 0 and strpos(prosrc, 'unit') > 0
          from pg_proc where proname = 'publish_activity'),
       'R1: the publish-truth stamp lives inside the RPC — one writer, server-side, in the version-minting transaction';
select 'publish_does_not_stamp_tags',
       (select strpos(prosrc, 'tags') = 0 and strpos(prosrc, 'pedagogical_role') = 0
          from pg_proc where proname = 'publish_activity'),
       'the OTHER half of the provenance ruling: tags/role are row-native and live. A second writer here would make the column mean two things depending on publish state';
select 'tags_has_no_index_yet',
       not exists (select 1 from pg_indexes
                    where schemaname = 'public' and tablename = 'activities'
                      and indexdef ilike '%gin%' and indexdef ilike '%tags%'),
       'D12/P1, and this row is a TRIPWIRE not a preference: the GIN index belongs in the Bank catalog-RPC migration beside its first server-side tag query. Flip this row there — do not delete it, and do not satisfy it by adding the index early';
-- The P4 sweep. §C proves the stamp fires for ONE activity through the RPC;
-- this proves the invariant holds across the whole live corpus, which is the
-- difference between "derived" and "merely written". Any published activity
-- whose columns disagree with its own current version means a second writer
-- has appeared, or someone wrote the columns directly — the exact drift the
-- one-writer ruling exists to prevent.
--
-- Scoped to published rows with a current version: a draft-only activity has
-- never been stamped, and its columns legitimately hold defaults.
select 'course_unit_match_published_snapshot',
       not exists (
         select 1
         from activities a
         join activity_versions v on v.id = a.current_version_id
         where a.deleted_at is null
           and (a.course is distinct from coalesce(v.content -> 'meta' ->> 'course', a.course)
             or a.unit   is distinct from  v.content -> 'meta' ->> 'unit')
       ),
       'P4: every published row''s course/unit equals its own current version''s meta — derived, not merely written';
select 'activities_table_grants_cover_new_columns',
       has_column_privilege('authenticated', 'public.activities', 'tags', 'update')
       and has_column_privilege('authenticated', 'public.activities', 'pedagogical_role', 'update'),
       '0032 grants at TABLE level, so columns added later are covered without a new grant stanza — asserted rather than assumed';

-- @section C-behavioral-matrix
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher   uuid := gen_random_uuid();
  v_activity  uuid;
  v_version   uuid;
  v_course    text;
  v_unit      text;
  v_tags      text[];
  v_role      pedagogical_role;
  v_snapshot  jsonb;
begin
  -- ---- fixtures ----------------------------------------------------------
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0037-t@vfy0037.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_teacher;

  -- The RPC authorizes through can_edit_activity → auth.uid(); impersonate the
  -- owner for the whole block (the verify-0034 claims-switch idiom).
  perform set_config('request.jwt.claims',
                     json_build_object('sub', v_teacher::text)::text, true);

  -- Row starts with the schema defaults (course 'Algebra II', unit NULL) and
  -- author-set listing metadata, so the stamp has something to overwrite and
  -- the tags/role assertions have something to preserve.
  insert into activities (owner_id, title, slug, status, tags, pedagogical_role)
  values (v_teacher, 'vfy 0037', 'vfy-0037', 'draft',
          array['factoring', 'word problems'], 'practice')
  returning id into v_activity;

  -- ---- (S) publish stamps course + unit from the snapshot ----------------
  -- JSON literal, not nested builders (the verify-0034 readability lesson).
  update activities set draft_content = $doc$
    {"schemaVersion": 2,
     "meta": {"title": "vfy 0037", "course": "Algebra I", "unit": "Quadratics"},
     "sections": [{"id": "sec-1", "rows": []}]}
  $doc$::jsonb
  where id = v_activity;

  v_version := publish_activity(v_activity);

  select course, unit, tags, pedagogical_role
    into v_course, v_unit, v_tags, v_role
  from activities where id = v_activity;

  if v_course is distinct from 'Algebra I' then
    raise exception 'FAIL (S) course: column is % after publish (want "Algebra I") — the publish-truth stamp did not fire',
      coalesce(v_course, '<null>');
  end if;
  if v_unit is distinct from 'Quadratics' then
    raise exception 'FAIL (S) unit: column is % after publish (want "Quadratics")',
      coalesce(v_unit, '<null>');
  end if;

  -- ---- (R) publish left the row-native listing metadata alone ------------
  if v_tags is distinct from array['factoring', 'word problems'] then
    raise exception 'FAIL (R) tags: publish mutated tags to % — tags are row-native, publish must never write them',
      coalesce(v_tags::text, '<null>');
  end if;
  if v_role is distinct from 'practice'::pedagogical_role then
    raise exception 'FAIL (R) pedagogical_role: publish mutated role to % — row-native, publish must never write it',
      coalesce(v_role::text, '<null>');
  end if;

  -- ---- (V) the stamp equals what was frozen into the version -------------
  -- The P4 invariant: derived FROM the snapshot, not merely written alongside
  -- it. Read the version row back and compare against the columns.
  select content into v_snapshot
  from activity_versions where id = v_version;

  if v_snapshot -> 'meta' ->> 'course' is distinct from v_course
     or v_snapshot -> 'meta' ->> 'unit' is distinct from v_unit then
    raise exception 'FAIL (V) row/snapshot divergence: columns are (%, %) but the published version says (%, %)',
      coalesce(v_course, '<null>'), coalesce(v_unit, '<null>'),
      coalesce(v_snapshot -> 'meta' ->> 'course', '<null>'),
      coalesce(v_snapshot -> 'meta' ->> 'unit', '<null>');
  end if;

  -- ---- (N) a document with NO unit nulls the column ----------------------
  -- Mirroring, not accumulating: republishing without a unit must not leave
  -- the previous unit stranded on the row, where the catalog would list a
  -- facet the published activity no longer carries.
  update activities set draft_content = $doc2$
    {"schemaVersion": 2,
     "meta": {"title": "vfy 0037", "course": "Geometry"},
     "sections": [{"id": "sec-1", "rows": []}]}
  $doc2$::jsonb
  where id = v_activity;

  perform publish_activity(v_activity);

  select course, unit into v_course, v_unit
  from activities where id = v_activity;

  if v_unit is not null then
    raise exception 'FAIL (N) unit: republishing a unit-less document left unit = % on the row (want NULL)',
      v_unit;
  end if;
  if v_course is distinct from 'Geometry' then
    raise exception 'FAIL (N) course: re-stamp did not fire (column is %)',
      coalesce(v_course, '<null>');
  end if;

  -- ---- (C) a document with no meta.course KEEPS the prior value ----------
  -- activities.course is `not null`; a partial document must never violate
  -- that. coalesce(…, course) is the guard being proven here.
  update activities set draft_content = $doc3$
    {"schemaVersion": 2,
     "meta": {"title": "vfy 0037"},
     "sections": [{"id": "sec-1", "rows": []}]}
  $doc3$::jsonb
  where id = v_activity;

  perform publish_activity(v_activity);

  select course into v_course from activities where id = v_activity;

  if v_course is distinct from 'Geometry' then
    raise exception 'FAIL (C) course: a course-less document changed the column to % (want the prior "Geometry" retained)',
      coalesce(v_course, '<null>');
  end if;

  raise exception 'EXPECTED ROLLBACK >>> verify-0037 §C all rows passed';
end $vfy$;
