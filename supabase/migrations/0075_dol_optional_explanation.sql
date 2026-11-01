-- 0075_dol_optional_explanation.sql — a DoL's written explanation is optional (D77)
-- TODOS "D77 optional DoL explanation", C-173/B-224 (author-ruled 2026-11-02).
--
-- Rule, derived from the document with no new key: in a DoL section, a
-- short_answer or essay that is NOT the primary item (the first gradable block,
-- DL-2) is optional. It still records and stays markable; it just never counts
-- as owed marking, so class_progress and activity_progress leave it out of
-- to_grade. The rows themselves are unchanged, so Responses still lists it.
--
--   §A  dol_optional_block — the rule. Its gradable list mirrors the schema's
--       isGradeable (packages/schema/src/block-predicates.ts); the two are bound
--       by scripts/tests/dol-optional-gradeable.test.mjs (P4).
--   §B  class_progress + activity_progress — 0064's bodies with one new line.
--
-- The AI worker's queue (0042) is deliberately unchanged: its provider is off,
-- and drafts for optional answers are harmless when it isn't.
--
-- COMPLIANCE: NO personal data; reads only. Data-map draft-41.

-- §A ---------------------------------------------------------------------------
create or replace function dol_optional_block(p_section jsonb, p_block_id text)
returns boolean
language sql
immutable
set search_path = public
as $$
  with blocks as (
    select b, row_number() over (order by r.o, c.o, bl.o) as n
    from jsonb_array_elements(coalesce(p_section->'rows', '[]'::jsonb)) with ordinality r(v, o)
    cross join lateral jsonb_array_elements(coalesce(r.v->'columns', '[]'::jsonb)) with ordinality c(v, o)
    cross join lateral jsonb_array_elements(coalesce(c.v->'blocks', '[]'::jsonb)) with ordinality bl(b, o)
  ), gradable as (
    select b, n from blocks
    where b->>'type' in ('fill_in_blank', 'multiple_choice', 'matching', 'correspondence', 'ordering',
                         'number_line', 'self_explanation', 'short_answer', 'essay', 'faded_worked_example')
       or (b->>'type' in ('interactive_graph', 'data_plot') and b->'interaction'->>'type' <> 'display')
       or (b->>'type' = 'math_block' and jsonb_array_length(coalesce(b->'prompts', '[]'::jsonb)) > 0)
       or (b->>'type' = 'table' and jsonb_path_exists(b, '$.**.type ? (@ == "blank")'))
  )
  select jsonb_typeof(p_section->'dol') = 'object'
     and exists (select 1 from gradable g
                 where g.b->>'id' = p_block_id and g.b->>'type' in ('short_answer', 'essay')
                   and g.n > (select min(n) from gradable));
$$;
revoke execute on function dol_optional_block(jsonb, text) from public, anon, authenticated;

-- §B ---------------------------------------------------------------------------
create or replace function class_progress(p_class_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
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
      and b->>'type' in ('short_answer', 'essay')
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
$$;

create or replace function activity_progress(p_activity_id uuid)
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
      and b->>'type' in ('short_answer', 'essay')
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
$$;
