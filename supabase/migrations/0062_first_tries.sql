-- =============================================================================
-- 0062_first_tries.sql — what students answered before any feedback
-- (docs/design/first-try-view.md, FT-1..FT-9, ruled 2026-10-18)
-- -----------------------------------------------------------------------------
-- Every class-progress screen (0061) shows a student's LATEST attempt, so a
-- first wrong pick that the authored feedback then fixed leaves no trace. Every
-- attempt is already stored; this migration reads attempt 1.
--
--   §A  activity_first_tries(activity) — per question of the current version:
--       first-try right/wrong, the multiple-choice spread by picked choice, the
--       top 5 first-try wrong answers for other families, how many of the
--       wrong are right now, and who (FT-1..FT-8)
--   §B  class_student_work re-created: each section also carries its FIRST
--       attempt, for the answer panel's First try / Latest switch (FT-8).
--       Same signature, same gates, same refusal; only a key is added.
--   §C  grants
--
-- THE ACCESS RULE is 0061's (D6): live roster of a class the caller teaches
-- that has the activity assigned × that activity; can_read_activity gates the
-- call only and never chooses students.
--
-- ⚠ FT-9: prune_section_checks (unarmed) deletes superseded attempts — every
-- first try that was later re-checked. TODOS records this as an ARMING
-- BLOCKER; nothing here changes the prune.
--
-- NOT PERSONAL DATA STORED: no table or column; a new teacher READ of rostered
-- students' first attempts (data-map draft-29).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- §A — activity_first_tries: what students answered before any feedback
-- -----------------------------------------------------------------------------
-- Returns { activity, older_only, sections[{section_id, students}],
-- items[{section_id, item_id, family, first, right_first, wrong_first,
-- wrong_right_now, picked, groups[]}] }.
--
-- Scope (D6, unchanged from 0061): students on the LIVE roster of a class the
-- caller teaches that has this activity assigned; can_read_activity gates the
-- call only. First try (FT-2) = attempt 1 of a section of the CURRENT version;
-- older_only counts in-scope students whose checks are all on older versions.
-- Recorded items (essays, short answers) are not marked and are left out.
--
--   first            students with a marked verdict on this item at attempt 1
--   right_first      … of them, right
--   wrong_first      … of them, wrong
--   wrong_right_now  … of the wrong ones, right on their LATEST attempt (FT-5)
--   picked           multiple choice: students who ticked at least one choice
--   groups           multiple choice: one per PICKED choice id (FT-3; the
--                    client lays out every choice in authored order, zeros
--                    included, and marks the correct one from the document);
--                    other families: the top 5 WRONG first-try answers, grouped
--                    as 0061's common wrong answers group them (FT-6). Each
--                    group carries its students (FT-8) and right-now count.
create or replace function activity_first_tries(p_activity_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_act activities%rowtype;
  v_out jsonb;
begin
  if auth.uid() is null or p_activity_id is null or not can_read_activity(p_activity_id) then
    raise exception 'not_your_activity' using errcode = '42501';
  end if;
  select * into v_act from activities where id = p_activity_id;

  with my_classes as (
    select c.id as class_id
    from classes c
    join class_activities ca on ca.class_id = c.id and ca.activity_id = p_activity_id
    where c.teacher_id = auth.uid()
      and c.deleted_at is null
      and v_act.status = 'published'
      and v_act.current_version_id is not null
      and v_act.deleted_at is null
  ),
  students as (
    select distinct m.student_id,
           coalesce(nullif(btrim(u.display_name), ''), u.email, 'Unknown') as name
    from class_members m
    join my_classes mc on mc.class_id = m.class_id
    join users u on u.id = m.student_id
    where m.removed_at is null
  ),
  checks as (
    select sc.*
    from section_checks sc
    join students s on s.student_id = sc.student_id
    where sc.activity_id = p_activity_id
  ),
  cur as (
    select * from checks where activity_version_id = v_act.current_version_id
  ),
  firsts as (
    select * from cur where attempt_number = 1
  ),
  latest as (
    select distinct on (c.student_id, c.section_id) c.*
    from cur c
    order by c.student_id, c.section_id, c.attempt_number desc, c.created_at desc
  ),
  now_right as (
    select l.student_id, l.section_id, i.key as item_id
    from latest l
    cross join lateral jsonb_each(
      case when jsonb_typeof(l.verdicts) = 'object' then l.verdicts else '{}'::jsonb end) i
    where i.value->>'verdict' = 'correct'
  ),
  fi as (
    select f.student_id, s.name, f.section_id, f.created_at,
           i.key as item_id, i.value as verdict, fam.family,
           f.responses->fam.family->i.key as answer,
           (nr.item_id is not null) as right_now
    from firsts f
    join students s on s.student_id = f.student_id
    cross join lateral jsonb_each(
      case when jsonb_typeof(f.verdicts) = 'object' then f.verdicts else '{}'::jsonb end) i
    left join lateral (
      select x.fam as family
      from unnest(array['blanks', 'choices', 'matches', 'correspondences',
                        'orderings', 'freeText', 'graphs']) with ordinality as x(fam, ord)
      where jsonb_typeof(f.responses->x.fam) = 'object' and (f.responses->x.fam) ? i.key
      order by x.ord
      limit 1
    ) fam on true
    left join now_right nr
      on nr.student_id = f.student_id and nr.section_id = f.section_id and nr.item_id = i.key
    where i.value->>'verdict' in ('correct', 'incorrect')
  ),
  members as (
    -- One row per (item, group, student).
    select fi.section_id, fi.item_id, fi.family, c.choice as answer_key,
           to_jsonb(c.choice) as answer, fi.student_id, fi.name, fi.right_now,
           fi.verdict, fi.created_at
    from fi
    cross join lateral jsonb_array_elements_text(
      case when fi.family = 'choices' and jsonb_typeof(fi.answer) = 'array'
           then fi.answer else '[]'::jsonb end) c(choice)
    union all
    select fi.section_id, fi.item_id, fi.family,
           case
             when fi.answer is null then '∅'
             when fi.family = 'blanks' and jsonb_typeof(fi.answer) = 'string' then
               case when btrim(fi.answer #>> '{}') ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$'
                    then 'n:' || trim_scale(btrim(fi.answer #>> '{}')::numeric)::text
                    else 's:' || lower(btrim(fi.answer #>> '{}')) end
             else 'j:' || fi.answer::text
           end,
           fi.answer, fi.student_id, fi.name, fi.right_now, fi.verdict, fi.created_at
    from fi
    where fi.family is distinct from 'choices'
      and fi.verdict->>'verdict' = 'incorrect'
  ),
  groups as (
    select m.section_id, m.item_id, m.answer_key,
           (array_agg(m.family order by m.created_at))[1] as family,
           (array_agg(m.answer order by m.created_at))[1] as answer,
           count(distinct m.student_id)::integer as n,
           count(distinct m.student_id) filter (where m.right_now)::integer as right_now,
           coalesce(jsonb_agg(distinct mid.mid) filter (where mid.mid is not null), '[]'::jsonb) as misconception_ids,
           jsonb_agg(distinct jsonb_build_object('student_id', m.student_id, 'name', m.name,
                                                 'right_now', m.right_now)) as students
    from members m
    left join lateral jsonb_array_elements_text(
      case when m.family is distinct from 'choices'
            and jsonb_typeof(m.verdict->'misconceptionIds') = 'array'
           then m.verdict->'misconceptionIds' else '[]'::jsonb end) mid(mid) on true
    group by m.section_id, m.item_id, m.answer_key
  ),
  ranked as (
    select g.*,
           row_number() over (partition by g.section_id, g.item_id
                              order by g.n desc, g.answer_key) as rk
    from groups g
  ),
  per_item as (
    select fi.section_id, fi.item_id,
           (array_agg(fi.family order by fi.created_at))[1] as family,
           count(distinct fi.student_id)::integer as first,
           count(distinct fi.student_id) filter (where fi.verdict->>'verdict' = 'correct')::integer as right_first,
           count(distinct fi.student_id) filter (where fi.verdict->>'verdict' = 'incorrect')::integer as wrong_first,
           count(distinct fi.student_id) filter (where fi.verdict->>'verdict' = 'incorrect'
                                                   and fi.right_now)::integer as wrong_right_now,
           count(distinct fi.student_id) filter (where fi.family = 'choices'
                                                   and jsonb_typeof(fi.answer) = 'array'
                                                   and jsonb_array_length(fi.answer) > 0)::integer as picked
    from fi
    group by fi.section_id, fi.item_id
  )
  select jsonb_build_object(
    'activity', jsonb_build_object('id', v_act.id, 'title', v_act.title,
                                   'current_version_id', v_act.current_version_id),
    'older_only', (select count(distinct c.student_id)::integer from checks c
                    where not exists (select 1 from cur where cur.student_id = c.student_id)),
    'sections', (select coalesce(jsonb_agg(jsonb_build_object('section_id', x.section_id,
                                                             'students', x.n)), '[]'::jsonb)
                   from (select f.section_id, count(distinct f.student_id)::integer as n
                           from firsts f group by f.section_id) x),
    'items', (select coalesce(jsonb_agg(jsonb_build_object(
                       'section_id', pi.section_id,
                       'item_id', pi.item_id,
                       'family', pi.family,
                       'first', pi.first,
                       'right_first', pi.right_first,
                       'wrong_first', pi.wrong_first,
                       'wrong_right_now', pi.wrong_right_now,
                       'picked', pi.picked,
                       'groups', (select coalesce(jsonb_agg(jsonb_build_object(
                                           'answer', r.answer,
                                           'family', r.family,
                                           'count', r.n,
                                           'right_now', r.right_now,
                                           'misconception_ids', r.misconception_ids,
                                           'students', r.students)
                                         order by r.rk), '[]'::jsonb)
                                    from ranked r
                                   where r.section_id = pi.section_id
                                     and r.item_id = pi.item_id
                                     and (pi.family = 'choices' or r.rk <= 5)))
                     order by pi.section_id, pi.item_id), '[]'::jsonb)
                from per_item pi))
  into v_out;

  return v_out;
end;
$$;

-- -----------------------------------------------------------------------------
-- §B — class_student_work, with each section's first attempt (FT-8)
-- -----------------------------------------------------------------------------
-- Byte-for-byte 0061's body (gates, refusal, latest attempt, graded ids) plus
-- a first_try CTE and a 'first' key per section ({responses, verdicts,
-- checked_at}, or NULL when attempt 1 is missing). verify-0061 still applies.
create or replace function class_student_work(
  p_class_id    uuid,
  p_student_id  uuid,
  p_activity_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_act  activities%rowtype;
  v_name text;
  v_out  jsonb;
begin
  if auth.uid() is null or p_student_id is null or p_activity_id is null
     or not exists (
       select 1
       from classes c
       join class_members m     on m.class_id = c.id
       join class_activities ca on ca.class_id = c.id
       join activities a        on a.id = ca.activity_id
       where c.teacher_id = auth.uid()
         and c.deleted_at is null
         and (p_class_id is null or c.id = p_class_id)
         and m.student_id = p_student_id
         and m.removed_at is null
         and ca.activity_id = p_activity_id
         and a.status = 'published'
         and a.current_version_id is not null
         and a.deleted_at is null
     ) then
    raise exception 'not_in_scope' using errcode = '42501';
  end if;

  select * into v_act from activities where id = p_activity_id;
  select coalesce(nullif(btrim(u.display_name), ''), u.email, 'Unknown')
    into v_name from users u where u.id = p_student_id;

  with first_try as (
    -- FT-8: attempt 1 of each section, shown by the panel's First try switch.
    select sc.activity_version_id, sc.section_id, sc.responses, sc.verdicts, sc.created_at
    from section_checks sc
    where sc.student_id = p_student_id
      and sc.activity_id = p_activity_id
      and sc.attempt_number = 1
  ),
  latest as (
    select distinct on (sc.activity_version_id, sc.section_id)
           sc.*,
           count(*) over (partition by sc.activity_version_id, sc.section_id) as attempts
    from section_checks sc
    where sc.student_id = p_student_id
      and sc.activity_id = p_activity_id
    order by sc.activity_version_id, sc.section_id,
             sc.attempt_number desc, sc.created_at desc
  ),
  graded as (
    select sc.activity_version_id, sc.section_id,
           jsonb_agg(distinct cg.block_id) as block_ids
    from check_grades cg
    join section_checks sc on sc.id = cg.check_id
    where sc.student_id = p_student_id
      and sc.activity_id = p_activity_id
    group by sc.activity_version_id, sc.section_id
  ),
  versions as (
    select l.activity_version_id, av.version_num,
           (l.activity_version_id = v_act.current_version_id) as is_current,
           jsonb_agg(jsonb_build_object(
             'section_id', l.section_id,
             'attempts', l.attempts,
             'attempt_number', l.attempt_number,
             'checked_at', l.created_at,
             'responses', l.responses,
             'verdicts', l.verdicts,
             'graded_block_ids', coalesce(g.block_ids, '[]'::jsonb),
             'first', case when f.section_id is null then null
                           else jsonb_build_object('responses', f.responses,
                                                   'verdicts', f.verdicts,
                                                   'checked_at', f.created_at) end)
           order by l.section_id) as sections
    from latest l
    join activity_versions av on av.id = l.activity_version_id
    left join graded g
      on g.activity_version_id = l.activity_version_id
     and g.section_id = l.section_id
    left join first_try f
      on f.activity_version_id = l.activity_version_id
     and f.section_id = l.section_id
    group by l.activity_version_id, av.version_num
  )
  select jsonb_build_object(
    'student', jsonb_build_object('id', p_student_id, 'name', v_name),
    'activity', jsonb_build_object('id', v_act.id, 'title', v_act.title,
                                   'current_version_id', v_act.current_version_id),
    'versions', (select coalesce(jsonb_agg(jsonb_build_object(
                          'version_id', v.activity_version_id,
                          'version_num', v.version_num,
                          'is_current', v.is_current,
                          'sections', v.sections)
                        order by v.is_current desc, v.version_num desc), '[]'::jsonb)
                   from versions v))
  into v_out;

  return v_out;
end;
$$;

-- -----------------------------------------------------------------------------
-- §C — grants (class_student_work keeps 0061's: create or replace keeps ACLs)
-- -----------------------------------------------------------------------------
revoke execute on function activity_first_tries(uuid) from public, anon;
grant  execute on function activity_first_tries(uuid) to authenticated, service_role;

comment on function activity_first_tries(uuid) is
  'First tries on one activity (0062, first-try-view.md): attempt 1 of each section '
  'of the current version, for students on the live roster of the caller''s classes '
  'that have it assigned. can_read_activity gates the call but never chooses students. '
  'Shrinks to nothing if prune_section_checks is ever armed as specified (FT-9).';

-- =============================================================================
-- Verification lives in scripts/verify-0062.sql (registered in the verify
-- runner); re-run verify-0061 too (class_student_work is re-created).
-- =============================================================================
