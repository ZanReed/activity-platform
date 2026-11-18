-- =============================================================================
-- 0096 — teacher grading of photos of working (media submissions slice 3)
-- -----------------------------------------------------------------------------
-- docs/design/media-submissions.md §7, §6.5, R-2, MS-10, MS-18. A photo answer
-- is a rubric-graded block like short_answer; 0034's rails carry it once the
-- SET of hand-graded types stops being spelled out inline.
--
--   A. is_manually_graded_type(text) — THE set: short_answer, essay,
--      photo_response. IMMUTABLE. Bound to the TypeScript constant
--      MANUALLY_GRADED_TYPES by scripts/tests/manually-graded-types.test.mjs.
--   B. photo_ids_of(responses, block) — the ORDERED photo ids a check holds
--      for a block, without the removed flag: what staleness compares (MS-18).
--   C. Re-created to call A instead of the literal pair (the live bodies, so
--      nothing else changes): validate_check_grade_criteria (0034 → 0042),
--      activity_progress and class_progress (0075's "to grade"),
--      dol_optional_block (0094).
--   D. list_grading_queue gains `response_photos` (a new column, so DROP +
--      CREATE and its grants again) and photo staleness;
--      get_my_released_feedback gains photo staleness.
--   E. release_check_grades sets each released photo's keep_until to at most
--      release + 30 days (MS-10).
--   F. work_photo_states(activity, ids) — the teacher's read of WHY a photo
--      cannot be shown: removed by retention, or changed after hand-in (the
--      G18 case: the bytes no longer match the version a check recorded).
--
-- ⚠ NOT CHANGED, ON PURPOSE: claim_grade_suggestions (0042) keeps its literal
-- ('short_answer', 'essay'). The AI grading worker is a TEXT model; a photo
-- must never be claimed for it (§7, "v1 excludes photos by name").
-- verify-0096's `claim_excludes_photos` pins that, and its
-- `no_inline_pair_left` row allows exactly that one function and
-- dol_optional_block's gradable list (bound to isGradeable).
--
-- First tries and common wrong answers (0062, 0064) need nothing: they read
-- only items with a correct/incorrect verdict, and a photo's verdict is
-- 'recorded'.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. The set
-- -----------------------------------------------------------------------------
create function is_manually_graded_type(p_type text)
returns boolean
language sql
immutable
set search_path = public
as $$
  select coalesce(p_type in ('short_answer', 'essay', 'photo_response'), false);
$$;

comment on function is_manually_graded_type(text) is
  'The hand-graded block types (0096): short_answer, essay, photo_response. Every grading, progress and DoL function asks this instead of spelling a list. Mirrors MANUALLY_GRADED_TYPES in @activity/schema.';

revoke execute on function is_manually_graded_type(text) from public, anon;
grant  execute on function is_manually_graded_type(text) to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- B. Photo ids, for staleness
-- -----------------------------------------------------------------------------
create function photo_ids_of(p_responses jsonb, p_block_id uuid)
returns jsonb
language sql
immutable
set search_path = public
as $$
  -- An absent key and an empty list are the same answer (no photo), and a
  -- `removed` flag is not a change the student made (0094 rewrites {id} to
  -- {id, removed} on any re-check after the sweep): only the ids, in order.
  select case
    when jsonb_typeof(p_responses->'photos'->(p_block_id::text)) = 'array'
    then (select coalesce(jsonb_agg(e->'id' order by o), '[]'::jsonb)
            from jsonb_array_elements(p_responses->'photos'->(p_block_id::text)) with ordinality x(e, o))
    else '[]'::jsonb
  end;
$$;

revoke execute on function photo_ids_of(jsonb, uuid) from public, anon, authenticated;
grant  execute on function photo_ids_of(jsonb, uuid) to service_role;

-- -----------------------------------------------------------------------------
-- C. The functions that named the pair
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_check_grade_criteria(p_check_id uuid, p_block_id uuid, p_criteria jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_check    section_checks%rowtype;
  v_content  jsonb;
  v_block    jsonb;
  v_criteria jsonb := '[]'::jsonb;
  v_item     jsonb;
  v_rubric   jsonb;
  v_max      numeric;
  v_earned   numeric;
begin
  select * into v_check from section_checks where id = p_check_id;
  if v_check.id is null then
    raise log 'grade refused (no_check) user=% check=%', auth.uid(), p_check_id;
    raise exception 'No such response to grade';
  end if;

  select content into v_content
  from activity_versions where id = v_check.activity_version_id;

  -- The block must live in THIS check's section, in the version the student
  -- was actually served (schema: Section.rows[].columns[].blocks[]).
  select b into v_block
  from jsonb_array_elements(coalesce(v_content->'sections', '[]'::jsonb)) s
  cross join lateral jsonb_array_elements(coalesce(s->'rows', '[]'::jsonb)) r
  cross join lateral jsonb_array_elements(coalesce(r->'columns', '[]'::jsonb)) c
  cross join lateral jsonb_array_elements(coalesce(c->'blocks', '[]'::jsonb)) b
  where s->>'id' = v_check.section_id
    and b->>'id' = p_block_id::text
  limit 1;

  if v_block is null then
    raise log 'grade refused (block_not_in_section) user=% check=% block=%',
      auth.uid(), p_check_id, p_block_id;
    raise exception 'That question is not in this section';
  end if;

  if not is_manually_graded_type(v_block->>'type') then
    raise log 'grade refused (not_gradable=%) user=% block=%',
      v_block->>'type', auth.uid(), p_block_id;
    raise exception 'Only hand-graded questions can be graded';
  end if;

  v_rubric := v_block->'rubric'->'criteria';

  for v_item in select * from jsonb_array_elements(coalesce(p_criteria, '[]'::jsonb))
  loop
    select (c->>'maxPoints')::numeric into v_max
    from jsonb_array_elements(coalesce(v_rubric, '[]'::jsonb)) c
    where c->>'id' = v_item->>'criterionId'
    limit 1;

    if v_max is null then
      raise log 'grade refused (criterion_not_on_rubric) user=% block=% criterion=%',
        auth.uid(), p_block_id, v_item->>'criterionId';
      raise exception 'That criterion is not on this rubric';
    end if;

    v_earned := (v_item->>'earned')::numeric;
    if v_earned is null or v_earned < 0 or v_earned > v_max then
      raise log 'grade refused (points_out_of_range) user=% block=% earned=% max=%',
        auth.uid(), p_block_id, v_earned, v_max;
      raise exception 'Points must be between 0 and the maximum';
    end if;

    v_criteria := v_criteria || jsonb_build_array(jsonb_build_object(
      'criterionId', v_item->>'criterionId',
      'earned',      v_earned,
      'maxPoints',   v_max,
      'feedback',    nullif(trim(coalesce(v_item->>'feedback', '')), '')
    ));
  end loop;

  return jsonb_build_object(
    'criteria',     v_criteria,
    'rubric_count', coalesce(jsonb_array_length(v_rubric), 0)
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.activity_progress(p_activity_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_act activities%rowtype;
  v_out jsonb;
begin
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
    select sc.student_id, sc.activity_id, sc.activity_version_id, sc.section_id,
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
      and is_manually_graded_type(b->>'type')
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
begin
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
    select sc.student_id, sc.activity_id, sc.activity_version_id, sc.section_id,
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
      and is_manually_graded_type(b->>'type')
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

CREATE OR REPLACE FUNCTION public.dol_optional_block(p_section jsonb, p_block_id text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  with blocks as (
    select b, row_number() over (order by r.o, c.o, bl.o) as n
    from jsonb_array_elements(coalesce(p_section->'rows', '[]'::jsonb)) with ordinality r(v, o)
    cross join lateral jsonb_array_elements(coalesce(r.v->'columns', '[]'::jsonb)) with ordinality c(v, o)
    cross join lateral jsonb_array_elements(coalesce(c.v->'blocks', '[]'::jsonb)) with ordinality bl(b, o)
  ), gradable as (
    select b, n from blocks
    where b->>'type' in ('fill_in_blank', 'multiple_choice', 'matching', 'correspondence', 'ordering',
                         'number_line', 'self_explanation', 'short_answer', 'essay', 'photo_response',
                         'faded_worked_example')
       or (b->>'type' in ('interactive_graph', 'data_plot') and b->'interaction'->>'type' <> 'display')
       or (b->>'type' = 'math_block' and jsonb_array_length(coalesce(b->'prompts', '[]'::jsonb)) > 0)
       or (b->>'type' = 'table' and jsonb_path_exists(b, '$.**.type ? (@ == "blank")'))
  )
  select coalesce(jsonb_typeof(p_section->'dol') = 'object', false)
     and exists (select 1 from gradable g
                 where g.b->>'id' = p_block_id and is_manually_graded_type(g.b->>'type')
                   and g.n > (select min(n) from gradable));
$function$;

-- -----------------------------------------------------------------------------
-- D. The queue and the student's released feedback
-- -----------------------------------------------------------------------------
-- A new OUT column changes the return type, which CREATE OR REPLACE cannot do.
drop function list_grading_queue(uuid);
CREATE FUNCTION public.list_grading_queue(p_activity_id uuid)
 RETURNS TABLE(check_id uuid, student_id uuid, student_label text, in_your_class boolean, activity_version_id uuid, version_num integer, is_current boolean, section_id text, block_id uuid, block_type text, response_text text, response_photos jsonb, attempt_number integer, checked_at timestamp with time zone, graded boolean, criteria jsonb, general_feedback text, graded_at timestamp with time zone, released_at timestamp with time zone, has_grader boolean, stale boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
           b->>'type'       as block_type
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
  order by av.version_num desc, bl.section_id, bl.block_id, u.email;
end;
$function$;

revoke execute on function list_grading_queue(uuid) from public, anon;
grant  execute on function list_grading_queue(uuid) to authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_my_released_feedback(p_activity_id uuid)
 RETURNS TABLE(block_id uuid, criteria jsonb, general_feedback text, graded_at timestamp with time zone, attempt_number integer, activity_version_id uuid, has_grader boolean, stale boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with mine as (
    select sc.*, cg.block_id as g_block, cg.criteria, cg.general_feedback,
           cg.graded_at, cg.graded_by, cg.released_at
    from check_grades cg
    join section_checks sc on sc.id = cg.check_id
    where sc.student_id = auth.uid()
      and sc.activity_id = p_activity_id
      and cg.released_at is not null
  ),
  -- Latest released grade per block (G2: latest by graded_at wins). Two
  -- released grades on one block are reachable — grade attempt 2, student
  -- re-checks, grade attempt 4 — and the wire is a block-keyed map, so a
  -- winner rule is not optional.
  --
  -- ⚠ attempt_number is the SECOND key, not decoration: graded_at defaults to
  -- now(), which is the TRANSACTION timestamp, so two grades written in one
  -- transaction tie exactly. verify-0034 §D caught this by failing its
  -- identical-text row — with only `id desc` behind graded_at the winner was a
  -- random uuid comparison, and the staleness answer flipped run to run. When
  -- the clock cannot separate two grades, the one on the LATER attempt is the
  -- one the teacher meant.
  winner as (
    select distinct on (g_block) *
    from mine
    order by g_block, graded_at desc, attempt_number desc, id desc
  ),
  latest as (
    select distinct on (sc.student_id, sc.activity_version_id, sc.section_id) sc.*
    from section_checks sc
    where sc.student_id = auth.uid()
      and sc.activity_id = p_activity_id
    order by sc.student_id, sc.activity_version_id, sc.section_id,
             sc.attempt_number desc, sc.created_at desc
  )
  select w.g_block,
         w.criteria,
         w.general_feedback,
         w.graded_at,
         w.attempt_number,
         w.activity_version_id,
         (w.graded_by is not null),
         coalesce(
           (w.responses->'freeText'->>w.g_block::text)
             is distinct from
           (l.responses->'freeText'->>w.g_block::text)
           -- MS-18: new photos since the graded check (0096).
           or photo_ids_of(w.responses, w.g_block)
                is distinct from photo_ids_of(l.responses, w.g_block),
           false
         )
  from winner w
  left join latest l
    on l.activity_version_id = w.activity_version_id
   and l.section_id = w.section_id;
$function$;

-- -----------------------------------------------------------------------------
-- E. Release starts the 30-day photo clock
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.release_check_grades(p_activity_id uuid, p_student_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_count int;
begin
  if auth.uid() is null then
    raise log 'release refused (signed_out)';
    raise exception 'Sign in before releasing feedback';
  end if;

  if not can_edit_activity(p_activity_id) then
    raise log 'release refused (not_owner) user=% activity=%', auth.uid(), p_activity_id;
    raise exception 'Not your activity';
  end if;

  update check_grades cg
     set released_at = now()
    from section_checks sc
   where sc.id = cg.check_id
     and sc.activity_id = p_activity_id
     and sc.student_id  = p_student_id
     and cg.released_at is null;
  get diagnostics v_count = row_count;

  -- MS-10 (0096): a photo is kept at most 30 days after its grade is released.
  -- EVERY handed-in photo of this student on a question that now has a
  -- released grade gets keep_until = least(keep_until, release + 30 days) —
  -- not only the photos on the graded check (Fable review): a photo the
  -- student replaced before the teacher graded the later check is evidence
  -- for the same question, shown nowhere, and must not keep the school-year
  -- clock. least() means a re-release or a re-grade never extends a clock, and
  -- a photo already due sooner keeps its earlier date. A photo handed in AFTER
  -- the release is capped at the next release (retention-policy.md says so).
  -- Each photo is capped by the FIRST release at or after its own hand-in: a
  -- photo handed in after a release is never capped by that earlier release
  -- (its clock would already have run out, and the sweep would take it before
  -- the teacher saw it).
  update work_photos w
     set keep_until = least(w.keep_until, first_release.at + interval '30 days')
    from (
      select w2.id,
             (select min(cg.released_at)
                from check_grades cg
                join section_checks sc on sc.id = cg.check_id
               where sc.activity_id = p_activity_id
                 and sc.student_id  = p_student_id
                 and cg.block_id    = w2.block_id
                 and cg.released_at is not null
                 and cg.released_at >= w2.attached_at) as at
        from work_photos w2
       where w2.activity_id = p_activity_id
         and w2.student_id  = p_student_id
         and w2.attached_at is not null
    ) first_release
   where w.id = first_release.id
     and first_release.at is not null;

  -- Idempotent by construction: a second release with nothing pending updates
  -- zero rows. It still writes an audit row ONLY when something actually
  -- changed — an audit rail that records non-events lies (0030's phrasing).
  if v_count > 0 then
    insert into audit_log (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'grade.release', 'activity', p_activity_id,
            jsonb_build_object('student_id', p_student_id, 'released', v_count));
  end if;

  return jsonb_build_object('released', v_count);
end;
$function$;

-- -----------------------------------------------------------------------------
-- F. Why a photo cannot be shown (teacher)
-- -----------------------------------------------------------------------------
-- 'ok'      — handed in, and Storage still holds the bytes the check recorded
-- 'changed' — handed in, but the object's version is not the recorded one
--             (replaced through an upsert-signed URL after hand-in, e2e G18);
--             the Storage policy already refuses the teacher's read
-- 'removed' — no row any more (retention, the sweep), or no object
-- Only photos of THIS activity, for its editor (the same gate as the Storage
-- read, can_edit_activity). An id from another activity is simply absent.
create function work_photo_states(p_activity_id uuid, p_photo_ids uuid[])
returns table (photo_id uuid, state text)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not can_edit_activity(p_activity_id) then
    raise exception 'Not your activity';
  end if;
  return query
  select i.id,
         case
           when w.id is null or w.attached_at is null or o.id is null then 'removed'
           when o.version is distinct from w.attached_object_version then 'changed'
           else 'ok'
         end
    from unnest(coalesce(p_photo_ids, '{}')) i(id)
    left join work_photos w on w.id = i.id and w.activity_id = p_activity_id
    left join storage.objects o on o.bucket_id = 'student-work' and o.name = w.object_name;
end;
$$;

revoke execute on function work_photo_states(uuid, uuid[]) from public, anon;
grant  execute on function work_photo_states(uuid, uuid[]) to authenticated, service_role;
