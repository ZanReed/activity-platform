-- =============================================================================
-- 0097 — an empty photo answer is not "to grade" while photo answers are off
-- -----------------------------------------------------------------------------
-- Author ruling 2026-11-19 (docs/design/media-submissions.md, "Slices 4 and 6
-- as built"): while `photo_clearance` is off, no student can add a photo, so a
-- photo question their check left empty is not work owed to the teacher. It
-- leaves the progress counts and the Responses queue. A photo answer that
-- HOLDS photos (handed in while answers were on) is still owed, and an empty
-- one counts again, like a blank essay, once answers are on.
--
--   A. hand_grade_owed(type, check, block, photos_on, in_dol) — THE rule: a
--      hand-graded type, except an empty photo answer while answers are off
--      OUTSIDE a DoL section. In a DoL section it stays owed: a rubric-primary
--      retake opens only once attempt 1's grade is released (0070, 0072), so
--      dropping it would strand the student's retake (Fable review). The check's
--      responses are read only in that one case, so the 0064 read-path saving
--      (no `responses` on the progress sort) stands.
--   B. activity_progress, class_progress (0096 bodies): the "to grade" walk
--      asks A. Their checks CTE carries the check id for it.
--   C. list_grading_queue (0096 body, same return type): rows A says are not
--      owed are left out, unless already graded.
--   D. class_student_work (0062 body) gains `photos_on`, for the student
--      panel's own count (AnswerPanel.tsx), which applies the same rule.
--
-- Known edge, accepted: an empty photo answer checked while answers were OFF
-- counts again once they go ON. No live activity has a photo question.
-- Verification: scripts/verify-0097.sql; re-run verify-0096, -0075, -0061.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. The rule
-- -----------------------------------------------------------------------------
create function hand_grade_owed(p_type text, p_check_id uuid, p_block_id uuid, p_photos_on boolean, p_in_dol boolean)
returns boolean
language sql
stable
set search_path = public
as $$
  select is_manually_graded_type(p_type)
     and case
           when p_type is distinct from 'photo_response' or coalesce(p_photos_on, false)
                or coalesce(p_in_dol, false) then true
           else jsonb_array_length(photo_ids_of(
                  (select sc.responses from section_checks sc where sc.id = p_check_id),
                  p_block_id)) > 0
         end;
$$;

comment on function hand_grade_owed(text, uuid, uuid, boolean, boolean) is
  'Whether a hand grade is owed for one block of one check (0097): a hand-graded type, except a photo answer holding no photo while photo answers are off, outside a DoL section (whose retake waits on the grade). Read by the progress counts and the grading queue.';

revoke execute on function hand_grade_owed(text, uuid, uuid, boolean, boolean) from public, anon, authenticated;
grant  execute on function hand_grade_owed(text, uuid, uuid, boolean, boolean) to service_role;

-- -----------------------------------------------------------------------------
-- B. The progress counts
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.activity_progress(p_activity_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_act activities%rowtype;
  v_out jsonb;
  v_photos_on boolean;
begin
  v_photos_on := photo_answers_on();
  if auth.uid() is null or p_activity_id is null or not can_read_activity(p_activity_id) then
    raise exception 'not_your_activity' using errcode = '42501';
  end if;
  select * into v_act from activities where id = p_activity_id;

  with my_classes as (
    select c.id as class_id, c.name
    from classes c
    join class_activities ca on ca.class_id = c.id and ca.activity_id = p_activity_id
    where c.teacher_id = auth.uid()
      and c.deleted_at is null
      and v_act.status = 'published'
      and v_act.current_version_id is not null
      and v_act.deleted_at is null
  ),
  roster as (
    select m.class_id, m.student_id,
           coalesce(nullif(btrim(u.display_name), ''), u.email, 'Unknown') as name
    from class_members m
    join my_classes mc on mc.class_id = m.class_id
    join users u on u.id = m.student_id
    where m.removed_at is null
  ),
  students as (
    select distinct student_id from roster
  ),
  checks as (
    -- 0064: only the columns read below.
    select sc.id as check_id, sc.student_id, sc.activity_id, sc.activity_version_id, sc.section_id,
           sc.attempt_number, sc.created_at, sc.section_total, sc.verdicts
    from section_checks sc
    join students s on s.student_id = sc.student_id
    where sc.activity_id = p_activity_id
  ),
  per_version as (
    select c.student_id, c.activity_version_id,
           count(distinct c.section_id)::integer as checked,
           (array_agg(c.section_total order by c.created_at desc)
              filter (where c.section_total is not null))[1] as total,
           max(c.created_at) as last_at
    from checks c
    group by c.student_id, c.activity_version_id
  ),
  latest as (
    select distinct on (c.student_id, c.activity_version_id, c.section_id)
           c.*,
           count(*) over (partition by c.student_id, c.activity_version_id, c.section_id) as attempts
    from checks c
    order by c.student_id, c.activity_version_id, c.section_id,
             c.attempt_number desc, c.created_at desc
  ),
  section_scores as (
    select l.student_id, l.activity_version_id, l.section_id, l.attempts,
           l.created_at,
           count(v.key) filter (where v.value->>'verdict' = 'correct')::integer as correct,
           count(v.key) filter (where v.value->>'verdict' in ('correct', 'incorrect'))::integer as marked
    from latest l
    left join lateral jsonb_each(
      case when jsonb_typeof(l.verdicts) = 'object' then l.verdicts else '{}'::jsonb end) v on true
    group by l.student_id, l.activity_version_id, l.section_id, l.attempts, l.created_at
  ),
  hand as (
    select l.student_id, count(*)::integer as n
    from latest l
    join activity_versions av on av.id = l.activity_version_id
    cross join lateral jsonb_array_elements(coalesce(av.content->'sections', '[]'::jsonb)) s
    cross join lateral jsonb_array_elements(coalesce(s->'rows', '[]'::jsonb)) r
    cross join lateral jsonb_array_elements(coalesce(r->'columns', '[]'::jsonb)) col
    cross join lateral jsonb_array_elements(coalesce(col->'blocks', '[]'::jsonb)) b
    where s->>'id' = l.section_id
      and hand_grade_owed(b->>'type', l.check_id, (b->>'id')::uuid, v_photos_on,
                          jsonb_typeof(s->'dol') = 'object')
      and not (jsonb_typeof(s->'dol') = 'object' and dol_optional_block(s, b->>'id'))
      and not exists (
        select 1
        from check_grades cg
        join section_checks g on g.id = cg.check_id
        where g.student_id = l.student_id
          and g.activity_version_id = l.activity_version_id
          and g.section_id = l.section_id
          and cg.block_id = (b->>'id')::uuid
      )
    group by l.student_id
  ),
  per_student as (
    -- 0064: grouped once instead of three correlated subqueries per student.
    select pv.student_id,
           bool_or(pv.activity_version_id <> v_act.current_version_id) as earlier_checked,
           bool_or(pv.activity_version_id <> v_act.current_version_id
                   and pv.total is not null
                   and pv.checked >= pv.total) as earlier_done,
           max(pv.last_at) as last_checked_at
    from per_version pv
    group by pv.student_id
  ),
  shown as (
    select distinct on (pv.student_id) pv.*
    from per_version pv
    order by pv.student_id,
             (pv.activity_version_id = v_act.current_version_id) desc, pv.last_at desc
  ),
  summary as (
    select s.student_id,
           cur.total                              as sections_total,
           coalesce(cur.checked, 0)               as sections_checked,
           coalesce(ps.earlier_checked, false)    as earlier_checked,
           coalesce(ps.earlier_done, false)       as earlier_done,
           shown.activity_version_id              as shown_version_id,
           shown.total                            as shown_total,
           shown.checked                          as shown_checked,
           coalesce(h.n, 0)                       as to_grade,
           ps.last_checked_at
    from students s
    left join per_version cur
      on cur.student_id = s.student_id
     and cur.activity_version_id = v_act.current_version_id
    left join shown       on shown.student_id = s.student_id
    left join per_student ps on ps.student_id = s.student_id
    left join hand h      on h.student_id = s.student_id
  )
  select jsonb_build_object(
    'activity', jsonb_build_object('id', v_act.id, 'title', v_act.title,
                                   'current_version_id', v_act.current_version_id),
    'classes', (select coalesce(jsonb_agg(jsonb_build_object(
                         'class_id', mc.class_id, 'name', mc.name,
                         'students', (select coalesce(jsonb_agg(
                                         jsonb_build_object('student_id', r.student_id, 'name', r.name)
                                           || (to_jsonb(sm) - 'student_id')
                                         order by lower(r.name), r.student_id), '[]'::jsonb)
                                        from roster r
                                        join summary sm on sm.student_id = r.student_id
                                       where r.class_id = mc.class_id))
                       order by lower(mc.name), mc.class_id), '[]'::jsonb)
                  from my_classes mc),
    'sections', (select coalesce(jsonb_agg(jsonb_build_object(
                          'student_id', ss.student_id,
                          'version_id', ss.activity_version_id,
                          'section_id', ss.section_id,
                          'attempts', ss.attempts,
                          'correct', ss.correct,
                          'marked', ss.marked,
                          'checked_at', ss.created_at)), '[]'::jsonb)
                   from section_scores ss),
    'last_check_at', (select max(pv.last_at) from per_version pv))
  into v_out;

  return v_out;
end;
$function$;

CREATE OR REPLACE FUNCTION public.class_progress(p_class_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_class classes%rowtype;
  v_out   jsonb;
  v_photos_on boolean;
begin
  v_photos_on := photo_answers_on();
  if auth.uid() is null or p_class_id is null or not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  select * into v_class from classes where id = p_class_id;

  with roster as (
    select m.student_id,
           coalesce(nullif(btrim(u.display_name), ''), u.email, 'Unknown') as name
    from class_members m
    join users u on u.id = m.student_id
    where m.class_id = p_class_id
      and m.removed_at is null
  ),
  acts as (
    select ca.activity_id, a.title, a.current_version_id, ca.added_at
    from class_activities ca
    join activities a on a.id = ca.activity_id
    where ca.class_id = p_class_id
      and a.status = 'published'
      and a.current_version_id is not null
      and a.deleted_at is null
  ),
  checks as (
    -- 0064: only the columns read below; `responses` no longer rides the sort.
    select sc.id as check_id, sc.student_id, sc.activity_id, sc.activity_version_id, sc.section_id,
           sc.attempt_number, sc.created_at, sc.section_total, sc.verdicts
    from section_checks sc
    join roster r on r.student_id = sc.student_id
    join acts   on acts.activity_id = sc.activity_id
  ),
  per_version as (
    select c.student_id, c.activity_id, c.activity_version_id,
           count(distinct c.section_id)::integer as checked,
           (array_agg(c.section_total order by c.created_at desc)
              filter (where c.section_total is not null))[1] as total,
           max(c.created_at) as last_at
    from checks c
    group by c.student_id, c.activity_id, c.activity_version_id
  ),
  latest as (
    -- One row per student × version × section: the latest attempt (the
    -- list_grading_queue order: attempt, then time).
    select distinct on (c.student_id, c.activity_version_id, c.section_id) c.*
    from checks c
    order by c.student_id, c.activity_version_id, c.section_id,
             c.attempt_number desc, c.created_at desc
  ),
  scores as (
    -- correct ÷ marked over each section's latest attempt; 'recorded' items
    -- (essays, short answers) are not marked (CP-2).
    select l.student_id, l.activity_version_id,
           count(*) filter (where v.value->>'verdict' = 'correct')::integer as correct,
           count(*) filter (where v.value->>'verdict' in ('correct', 'incorrect'))::integer as marked
    from latest l
    cross join lateral jsonb_each(
      case when jsonb_typeof(l.verdicts) = 'object' then l.verdicts else '{}'::jsonb end) v
    group by l.student_id, l.activity_version_id
  ),
  hand as (
    -- CP-7: hand-graded blocks on each latest check with no grade yet. The
    -- same block walk and "graded" test as list_grading_queue (0034), so the
    -- number matches the ungraded rows Responses shows for this student.
    select l.student_id, l.activity_id, count(*)::integer as n
    from latest l
    join activity_versions av on av.id = l.activity_version_id
    cross join lateral jsonb_array_elements(coalesce(av.content->'sections', '[]'::jsonb)) s
    cross join lateral jsonb_array_elements(coalesce(s->'rows', '[]'::jsonb)) r
    cross join lateral jsonb_array_elements(coalesce(r->'columns', '[]'::jsonb)) col
    cross join lateral jsonb_array_elements(coalesce(col->'blocks', '[]'::jsonb)) b
    where s->>'id' = l.section_id
      and hand_grade_owed(b->>'type', l.check_id, (b->>'id')::uuid, v_photos_on,
                          jsonb_typeof(s->'dol') = 'object')
      and not (jsonb_typeof(s->'dol') = 'object' and dol_optional_block(s, b->>'id'))
      and not exists (
        select 1
        from check_grades cg
        join section_checks g on g.id = cg.check_id
        where g.student_id = l.student_id
          and g.activity_version_id = l.activity_version_id
          and g.section_id = l.section_id
          and cg.block_id = (b->>'id')::uuid
      )
    group by l.student_id, l.activity_id
  ),
  per_activity as (
    -- 0064: the old cell CTE ran three correlated subqueries per roster ×
    -- activity cell, each scanning all of per_version (quadratic in students ×
    -- activities). Grouped once instead; the values are the same.
    select pv.student_id, pv.activity_id,
           bool_or(pv.activity_version_id <> acts.current_version_id) as earlier_checked,
           bool_or(pv.activity_version_id <> acts.current_version_id
                   and pv.total is not null
                   and pv.checked >= pv.total) as earlier_done,
           max(pv.last_at) as last_checked_at
    from per_version pv
    join acts on acts.activity_id = pv.activity_id
    group by pv.student_id, pv.activity_id
  ),
  shown as (
    -- The version a cell displays: the current one if checked, else the most
    -- recently checked (the old lateral's order).
    select distinct on (pv.student_id, pv.activity_id) pv.*
    from per_version pv
    join acts on acts.activity_id = pv.activity_id
    order by pv.student_id, pv.activity_id,
             (pv.activity_version_id = acts.current_version_id) desc, pv.last_at desc
  ),
  cells as (
    select r.student_id, acts.activity_id, acts.current_version_id,
           cur.total                    as sections_total,
           coalesce(cur.checked, 0)     as sections_checked,
           pa.earlier_checked,
           pa.earlier_done,
           shown.activity_version_id    as shown_version_id,
           shown.total                  as shown_total,
           shown.checked                as shown_checked,
           coalesce(sco.correct, 0)     as correct,
           coalesce(sco.marked, 0)      as marked,
           coalesce(h.n, 0)             as to_grade,
           pa.last_checked_at
    from roster r
    join shown        on shown.student_id = r.student_id
    join acts         on acts.activity_id = shown.activity_id
    join per_activity pa
      on pa.student_id = r.student_id
     and pa.activity_id = acts.activity_id
    left join per_version cur
      on cur.student_id = r.student_id
     and cur.activity_id = acts.activity_id
     and cur.activity_version_id = acts.current_version_id
    left join scores sco
      on sco.student_id = r.student_id
     and sco.activity_version_id = shown.activity_version_id
    left join hand h
      on h.student_id = r.student_id
     and h.activity_id = acts.activity_id
  )
  select jsonb_build_object(
    'class', jsonb_build_object('id', v_class.id, 'name', v_class.name,
                                'join_code', v_class.join_code),
    'students', (select coalesce(jsonb_agg(jsonb_build_object(
                          'student_id', r.student_id, 'name', r.name)
                        order by lower(r.name), r.student_id), '[]'::jsonb)
                   from roster r),
    'activities', (select coalesce(jsonb_agg(jsonb_build_object(
                            'activity_id', a.activity_id, 'title', a.title,
                            'current_version_id', a.current_version_id,
                            'added_at', a.added_at)
                          order by a.added_at desc, a.activity_id desc), '[]'::jsonb)
                     from acts a),
    'cells', (select coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb) from cells c),
    'last_check_at', (select max(c.last_checked_at) from cells c))
  into v_out;

  return v_out;
end;
$function$;

-- -----------------------------------------------------------------------------
-- C. The queue (CREATE OR REPLACE keeps 0096's grants)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.list_grading_queue(p_activity_id uuid)
 RETURNS TABLE(check_id uuid, student_id uuid, student_label text, in_your_class boolean, activity_version_id uuid, version_num integer, is_current boolean, section_id text, block_id uuid, block_type text, response_text text, response_photos jsonb, attempt_number integer, checked_at timestamp with time zone, graded boolean, criteria jsonb, general_feedback text, graded_at timestamp with time zone, released_at timestamp with time zone, has_grader boolean, stale boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_photos_on boolean := photo_answers_on();
begin
  if auth.uid() is null then
    raise exception 'Sign in before grading';
  end if;
  if not can_read_activity(p_activity_id) then
    raise log 'grading queue refused (not_owner) user=% activity=%', auth.uid(), p_activity_id;
    raise exception 'Not your activity';
  end if;

  return query
  with latest as (
    -- The queue's unit of "current work": one check per student, per section,
    -- per version (G2). Version scoping is not cosmetic — block and section
    -- ids are minted fresh on every publish, so a cross-version "latest" is
    -- comparing identifiers that were never the same question.
    select distinct on (sc.student_id, sc.activity_version_id, sc.section_id) sc.*
    from section_checks sc
    where sc.activity_id = p_activity_id
    order by sc.student_id, sc.activity_version_id, sc.section_id,
             sc.attempt_number desc, sc.created_at desc
  ),
  blocks as (
    -- Every hand-graded block of each section (is_manually_graded_type, 0096),
    -- from the pinned document.
    select l.id as check_id, l.student_id, l.activity_version_id, l.section_id,
           l.attempt_number, l.created_at, l.responses,
           (b->>'id')::uuid as block_id,
           b->>'type'       as block_type,
           (jsonb_typeof(s->'dol') = 'object') as in_dol
    from latest l
    join activity_versions av on av.id = l.activity_version_id
    cross join lateral jsonb_array_elements(coalesce(av.content->'sections', '[]'::jsonb)) s
    cross join lateral jsonb_array_elements(coalesce(s->'rows', '[]'::jsonb)) r
    cross join lateral jsonb_array_elements(coalesce(r->'columns', '[]'::jsonb)) c
    cross join lateral jsonb_array_elements(coalesce(c->'blocks', '[]'::jsonb)) b
    where s->>'id' = l.section_id
      and is_manually_graded_type(b->>'type')
  ),
  graded as (
    -- The winning grade per (student, version, section, block): latest by
    -- graded_at, and NOT necessarily attached to the latest check — that gap
    -- is precisely what `stale` reports.
    select distinct on (sc.student_id, sc.activity_version_id, sc.section_id, cg.block_id)
           sc.student_id, sc.activity_version_id, sc.section_id, cg.block_id,
           cg.criteria, cg.general_feedback, cg.graded_at, cg.released_at,
           cg.graded_by,
           sc.responses as graded_responses
    from check_grades cg
    join section_checks sc on sc.id = cg.check_id
    where sc.activity_id = p_activity_id
    -- Same tiebreak as §E's winner, and for the same reason: graded_at is a
    -- transaction timestamp, so it ties whenever two grades were written
    -- together. Later attempt wins; the uuid is only a last-resort determinism
    -- backstop.
    order by sc.student_id, sc.activity_version_id, sc.section_id, cg.block_id,
             cg.graded_at desc, sc.attempt_number desc, cg.id desc
  ),
  roster as (
    -- The caller's live roster: the students whose identity they may see.
    select distinct cm.student_id
    from class_members cm
    join classes cl on cl.id = cm.class_id
    where cl.teacher_id = auth.uid()
      and cl.deleted_at is null
      and cm.removed_at is null
  )
  select bl.check_id,
         bl.student_id,
         case when ro.student_id is not null then u.email else null end,
         (ro.student_id is not null),
         bl.activity_version_id,
         av.version_num,
         (av.id = a.current_version_id),
         bl.section_id,
         bl.block_id,
         bl.block_type,
         bl.responses->'freeText'->>bl.block_id::text,
         -- 0096: the photo ids the check handed in, in order ({id} or
         -- {id, removed}); NULL for a text block or a photo block left empty.
         bl.responses->'photos'->bl.block_id::text,
         bl.attempt_number,
         bl.created_at,
         (g.block_id is not null),
         g.criteria,
         g.general_feedback,
         g.graded_at,
         g.released_at,
         (g.graded_by is not null),
         coalesce(
           g.block_id is not null
           and ((g.graded_responses->'freeText'->>bl.block_id::text)
                  is distinct from
                (bl.responses->'freeText'->>bl.block_id::text)
                -- MS-18: a photo answer is stale when the ORDERED list of
                -- photo ids differs (ids are immutable; a removed flag is not
                -- a change the student made).
                or photo_ids_of(g.graded_responses, bl.block_id)
                     is distinct from photo_ids_of(bl.responses, bl.block_id)),
           false
         )
  from blocks bl
  join activity_versions av on av.id = bl.activity_version_id
  join activities a on a.id = p_activity_id
  join users u on u.id = bl.student_id
  left join roster ro on ro.student_id = bl.student_id
  left join graded g
    on g.student_id = bl.student_id
   and g.activity_version_id = bl.activity_version_id
   and g.section_id = bl.section_id
   and g.block_id = bl.block_id
  -- 0097: a photo question left empty while photo answers are off is not
  -- owed (no student could answer it); one already graded stays listed.
  where g.block_id is not null
     or hand_grade_owed(bl.block_type, bl.check_id, bl.block_id, v_photos_on, bl.in_dol)
  order by av.version_num desc, bl.section_id, bl.block_id, u.email;
end;
$function$;

-- -----------------------------------------------------------------------------
-- D. The student panel's flag (CREATE OR REPLACE keeps 0061's grants)
-- -----------------------------------------------------------------------------
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
    -- 0097: the panel's "N to grade" skips an empty photo answer while this
    -- is false, the same rule as hand_grade_owed.
    'photos_on', photo_answers_on(),
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
