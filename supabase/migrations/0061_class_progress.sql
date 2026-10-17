-- =============================================================================
-- 0061_class_progress.sql — a teacher's view of their students' checked work
-- (docs/design/class-progress-view.md: CP-1..CP-9, eng review D1–D8, design
-- review DR-1..DR-11, all ruled 2026-10-17)
-- -----------------------------------------------------------------------------
-- The finding: a teacher could not see a student's auto-checked work. Analytics
-- counts block kinds class-wide and Responses lists HAND-graded answers only.
-- Every check is already stored in section_checks; nothing read it per student
-- for a teacher.
--
--   §A  class_progress(class)        — the class grid: rostered student ×
--                                      assigned activity (CP-2, CP-6, CP-7)
--   §B  activity_progress(activity)  — one activity across the caller's
--                                      classes, per student × section (D5)
--   §C  class_student_work(class, student, activity) — one student's latest
--                                      attempt per section (CP-3, DR-5)
--   §D  class_misconceptions(class, activity) — misconception tags, ever and
--                                      still (D7, D8), and on the activity
--                                      page the common wrong answers (DR-11)
--   §E  grants
--
-- THE ACCESS RULE (CP-4, D6). The teacher RLS policy on section_checks is
-- can_read_activity — activity OWNERSHIP — which admits every student who ever
-- checked the teacher's activity, including students in no class of theirs.
-- None of these reads use it to choose students. Every one is SECURITY DEFINER
-- and scopes rows to the LIVE ROSTER (class_members.removed_at is null, class
-- not deleted, the caller is its teacher) × the class's ASSIGNED activities
-- (class_activities, activity published and not deleted). can_read_activity is
-- NOT widened, and my_activity_progress (0059) is NOT touched (D3): §A carries
-- its own copy of the "done" rule, kept in step by verify-0061's AGREEMENT row.
--
-- THE DONE RULE, as 0059 defines it: a version is done when the student's
-- distinct checked sections reach its section_total, the newest NON-NULL total
-- among their rows on that version. A NULL total (checks before 0059) is
-- "Started", never "Done". The status a cell shows is the CURRENT version's
-- when the student has checked it; otherwise their most recent older version's,
-- flagged older (CP-6) — the same precedence the student's own Home uses.
--
-- NAMES: coalesce(nullif(btrim(display_name), ''), email, 'Unknown'), the facts
-- pages' expression (0045, 0051). Hide names is a client switch (CP-5).
--
-- NOT PERSONAL DATA STORED: no table, no column. This is a new teacher READ
-- path to rostered students' answers, verdicts and misconception tags; the
-- data map records it (draft-28). Document content (labels) is NOT returned
-- here: the client reads activity_versions under the teacher's own RLS.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- §A — class_progress: the grid
-- -----------------------------------------------------------------------------
-- Returns { class, students[], activities[], cells[], last_check_at }.
-- cells holds only (student, activity) pairs with at least one check; a missing
-- pair is "not started". sections_total / sections_checked / earlier_checked /
-- earlier_done are computed exactly as my_activity_progress computes them (the
-- agreement row compares them); shown_* is the version the cell displays.
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
    select sc.*
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
  cells as (
    select r.student_id, acts.activity_id, acts.current_version_id,
           cur.total                    as sections_total,
           coalesce(cur.checked, 0)     as sections_checked,
           exists (
             select 1 from per_version pv
             where pv.student_id = r.student_id
               and pv.activity_id = acts.activity_id
               and pv.activity_version_id <> acts.current_version_id
           ) as earlier_checked,
           exists (
             select 1 from per_version pv
             where pv.student_id = r.student_id
               and pv.activity_id = acts.activity_id
               and pv.activity_version_id <> acts.current_version_id
               and pv.total is not null
               and pv.checked >= pv.total
           ) as earlier_done,
           shown.activity_version_id    as shown_version_id,
           shown.total                  as shown_total,
           shown.checked                as shown_checked,
           coalesce(sco.correct, 0)     as correct,
           coalesce(sco.marked, 0)      as marked,
           coalesce(h.n, 0)             as to_grade,
           (select max(pv.last_at) from per_version pv
             where pv.student_id = r.student_id
               and pv.activity_id = acts.activity_id) as last_checked_at
    from roster r
    cross join acts
    left join per_version cur
      on cur.student_id = r.student_id
     and cur.activity_id = acts.activity_id
     and cur.activity_version_id = acts.current_version_id
    left join lateral (
      select pv.*
      from per_version pv
      where pv.student_id = r.student_id
        and pv.activity_id = acts.activity_id
      order by (pv.activity_version_id = acts.current_version_id) desc, pv.last_at desc
      limit 1
    ) shown on true
    left join scores sco
      on sco.student_id = r.student_id
     and sco.activity_version_id = shown.activity_version_id
    left join hand h
      on h.student_id = r.student_id
     and h.activity_id = acts.activity_id
    where shown.activity_version_id is not null
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

-- -----------------------------------------------------------------------------
-- §B — activity_progress: one activity, every class of the caller's that has it
-- -----------------------------------------------------------------------------
-- Returns { activity, classes[{class_id, name, students[]}], sections[],
-- last_check_at }. Students are those on the LIVE roster of a class the caller
-- teaches that has this activity assigned (D6) — never "everyone who checked
-- it" (Analytics' anonymous totals still count those). A student in two such
-- classes appears under each. Each student carries the §A cell fields;
-- sections[] is latest-attempt-per-section for every version they checked.
--
-- can_read_activity gates the call (the activity's title and ids are the
-- owner's); it does NOT choose students, so its future widening (the
-- co-ownership arc) cannot widen who appears here.
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
    select sc.*
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
  summary as (
    select s.student_id,
           cur.total                as sections_total,
           coalesce(cur.checked, 0) as sections_checked,
           exists (select 1 from per_version pv
                    where pv.student_id = s.student_id
                      and pv.activity_version_id <> v_act.current_version_id) as earlier_checked,
           exists (select 1 from per_version pv
                    where pv.student_id = s.student_id
                      and pv.activity_version_id <> v_act.current_version_id
                      and pv.total is not null and pv.checked >= pv.total) as earlier_done,
           shown.activity_version_id as shown_version_id,
           shown.total               as shown_total,
           shown.checked             as shown_checked,
           coalesce(h.n, 0)          as to_grade,
           (select max(pv.last_at) from per_version pv
             where pv.student_id = s.student_id) as last_checked_at
    from students s
    left join per_version cur
      on cur.student_id = s.student_id
     and cur.activity_version_id = v_act.current_version_id
    left join lateral (
      select pv.* from per_version pv
      where pv.student_id = s.student_id
      order by (pv.activity_version_id = v_act.current_version_id) desc, pv.last_at desc
      limit 1
    ) shown on true
    left join hand h on h.student_id = s.student_id
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

-- -----------------------------------------------------------------------------
-- §C — class_student_work: one student's answers on one activity
-- -----------------------------------------------------------------------------
-- p_class_id names the class the teacher opened it from; NULL (the activity
-- page, DR-5's /activity/:id/progress/:studentId) means "any class the caller
-- teaches that has this activity assigned". Either way the student must be on
-- that class's LIVE roster and the activity assigned and live. One refusal for
-- every failed gate, so the error says nothing about which one failed.
--
-- Returns { student, activity, versions[{version_id, version_num, is_current,
-- sections[{section_id, attempts, attempt_number, checked_at, responses,
-- verdicts, graded_block_ids}]}] }: the latest attempt per section of every
-- version the student checked, current version first.
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

  with latest as (
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
             'graded_block_ids', coalesce(g.block_ids, '[]'::jsonb))
           order by l.section_id) as sections
    from latest l
    join activity_versions av on av.id = l.activity_version_id
    left join graded g
      on g.activity_version_id = l.activity_version_id
     and g.section_id = l.section_id
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
-- §D — class_misconceptions: the tags the grader attached, and wrong answers
-- -----------------------------------------------------------------------------
-- Scope: p_class_id given → that class's live roster × its assigned activities
-- (narrowed to p_activity_id when given). p_class_id NULL → p_activity_id is
-- required, and the scope is every class the caller teaches that has it
-- assigned (the activity page, D5/D6).
--
-- Per misconception id (D8): `ever` = students who showed it on ANY attempt;
-- `still` = of those, how many show it on their LATEST attempt at that section
-- (per version: block ids are minted fresh per publish, so a later version's
-- latest is a different question). description is NULL when the id is not
-- mirrored in misconception_registry — the page says so instead of hiding it.
--
-- ⚠ prune_section_checks (unarmed, 0035) deletes SUPERSEDED attempts, which is
-- where "ever" lives. Arming it shrinks these counts; TODOS → the ARMING arc
-- carries that line.
--
-- wrong_answers (only with p_activity_id, D7/DR-11): per item, students wrong on
-- their latest attempt; only items with 2 or more; top 5 answers each, grouped
-- by the stored answer trimmed and case-folded (a numeric blank by its value,
-- so 0.75 and .75 are one row; choice ids as a sorted set).
create or replace function class_misconceptions(
  p_class_id    uuid,
  p_activity_id uuid default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_out jsonb;
begin
  if auth.uid() is null
     or (p_class_id is null and p_activity_id is null)
     or (p_class_id is not null and not is_class_teacher(p_class_id)) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;

  with scope_classes as (
    select c.id as class_id
    from classes c
    where c.teacher_id = auth.uid()
      and c.deleted_at is null
      and (p_class_id is null or c.id = p_class_id)
  ),
  acts as (
    select distinct ca.activity_id, a.title
    from class_activities ca
    join scope_classes sc on sc.class_id = ca.class_id
    join activities a on a.id = ca.activity_id
    where a.status = 'published'
      and a.current_version_id is not null
      and a.deleted_at is null
      and (p_activity_id is null or ca.activity_id = p_activity_id)
  ),
  roster as (
    -- A student counts only for activities assigned to a class they are live
    -- in (with p_class_id NULL, a student in class X never brings in work on
    -- an activity only class Y has).
    select distinct m.student_id, ca.activity_id
    from class_members m
    join scope_classes sc     on sc.class_id = m.class_id
    join class_activities ca  on ca.class_id = m.class_id
    join acts                 on acts.activity_id = ca.activity_id
    where m.removed_at is null
  ),
  names as (
    select distinct r.student_id,
           coalesce(nullif(btrim(u.display_name), ''), u.email, 'Unknown') as name
    from roster r join users u on u.id = r.student_id
  ),
  checks as (
    select sc.*,
           (row_number() over (partition by sc.student_id, sc.activity_version_id, sc.section_id
                               order by sc.attempt_number desc, sc.created_at desc) = 1) as is_latest
    from section_checks sc
    join roster r on r.student_id = sc.student_id and r.activity_id = sc.activity_id
  ),
  items as (
    select c.student_id, c.activity_id, c.activity_version_id, c.section_id,
           c.is_latest, c.created_at, c.responses,
           i.key as item_id, i.value as verdict
    from checks c
    cross join lateral jsonb_each(
      case when jsonb_typeof(c.verdicts) = 'object' then c.verdicts else '{}'::jsonb end) i
  ),
  tags as (
    select it.student_id, it.activity_id, it.is_latest, m.mid
    from items it
    cross join lateral jsonb_array_elements_text(
      case when jsonb_typeof(it.verdict->'misconceptionIds') = 'array'
           then it.verdict->'misconceptionIds' else '[]'::jsonb end) m(mid)
  ),
  per_student as (
    select t.mid, t.student_id, t.activity_id, bool_or(t.is_latest) as still
    from tags t
    group by t.mid, t.student_id, t.activity_id
  ),
  mis as (
    select ps.mid,
           count(distinct ps.student_id)::integer as ever,
           count(distinct ps.student_id) filter (where ps.still)::integer as still,
           jsonb_agg(distinct jsonb_build_object('activity_id', ps.activity_id,
                                                 'title', acts.title)) as activities,
           jsonb_agg(jsonb_build_object('student_id', ps.student_id, 'name', n.name,
                                        'activity_id', ps.activity_id, 'still', ps.still)
                     order by lower(n.name), ps.student_id, ps.activity_id) as students
    from per_student ps
    join acts  on acts.activity_id = ps.activity_id
    join names n on n.student_id = ps.student_id
    group by ps.mid
  ),
  wrong as (
    -- The latest attempt's incorrect items, with the stored answer found in
    -- whichever response map holds that item id.
    select it.student_id, it.activity_version_id, it.section_id, it.item_id,
           it.created_at, it.verdict, f.family, it.responses->f.family->it.item_id as answer
    from items it
    left join lateral (
      select fam as family
      from unnest(array['blanks', 'choices', 'matches', 'correspondences',
                        'orderings', 'freeText', 'graphs']) with ordinality as x(fam, ord)
      where jsonb_typeof(it.responses->fam) = 'object' and (it.responses->fam) ? it.item_id
      order by ord
      limit 1
    ) f on true
    where p_activity_id is not null
      and it.is_latest
      and it.verdict->>'verdict' = 'incorrect'
  ),
  keyed as (
    select w.*,
           case
             when w.answer is null then '∅'
             when w.family = 'blanks' and jsonb_typeof(w.answer) = 'string' then
               case when btrim(w.answer #>> '{}') ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$'
                    then 'n:' || trim_scale(btrim(w.answer #>> '{}')::numeric)::text
                    else 's:' || lower(btrim(w.answer #>> '{}')) end
             when w.family = 'freeText' and jsonb_typeof(w.answer) = 'string' then
               's:' || lower(btrim(w.answer #>> '{}'))
             when w.family = 'choices' and jsonb_typeof(w.answer) = 'array' then
               'c:' || coalesce((select string_agg(e, ',' order by e)
                                   from jsonb_array_elements_text(w.answer) e), '')
             else 'j:' || w.answer::text
           end as answer_key
    from wrong w
  ),
  grouped as (
    select k.activity_version_id, k.section_id, k.item_id, k.answer_key,
           count(distinct k.student_id)::integer as n,
           (array_agg(k.family order by k.created_at))[1] as family,
           (array_agg(k.answer order by k.created_at))[1] as answer,
           coalesce((select jsonb_agg(distinct m)
                       from keyed k2
                       cross join lateral jsonb_array_elements_text(
                         case when jsonb_typeof(k2.verdict->'misconceptionIds') = 'array'
                              then k2.verdict->'misconceptionIds' else '[]'::jsonb end) m
                      where k2.activity_version_id = k.activity_version_id
                        and k2.section_id = k.section_id
                        and k2.item_id = k.item_id
                        and k2.answer_key = k.answer_key), '[]'::jsonb) as misconception_ids
    from keyed k
    group by k.activity_version_id, k.section_id, k.item_id, k.answer_key
  ),
  ranked as (
    select g.*,
           row_number() over (partition by g.activity_version_id, g.section_id, g.item_id
                              order by g.n desc, g.answer_key) as rk
    from grouped g
  ),
  per_item as (
    select k.activity_version_id, k.section_id, k.item_id,
           count(distinct k.student_id)::integer as wrong
    from keyed k
    group by k.activity_version_id, k.section_id, k.item_id
    having count(distinct k.student_id) >= 2
  )
  select jsonb_build_object(
    'misconceptions', (select coalesce(jsonb_agg(jsonb_build_object(
                                'id', m.mid,
                                'description', reg.description,
                                'ever', m.ever,
                                'still', m.still,
                                'activities', m.activities,
                                'students', m.students)
                              order by m.ever desc, m.still desc, m.mid), '[]'::jsonb)
                         from mis m
                         left join misconception_registry reg on reg.id = m.mid),
    'wrong_answers', (select coalesce(jsonb_agg(jsonb_build_object(
                               'version_id', pi.activity_version_id,
                               'section_id', pi.section_id,
                               'item_id', pi.item_id,
                               'wrong', pi.wrong,
                               'answers', (select jsonb_agg(jsonb_build_object(
                                                    'family', r.family,
                                                    'answer', r.answer,
                                                    'count', r.n,
                                                    'misconception_ids', r.misconception_ids)
                                                  order by r.rk)
                                             from ranked r
                                            where r.activity_version_id = pi.activity_version_id
                                              and r.section_id = pi.section_id
                                              and r.item_id = pi.item_id
                                              and r.rk <= 5))
                             order by pi.wrong desc, pi.section_id, pi.item_id), '[]'::jsonb)
                        from per_item pi))
  into v_out;

  return v_out;
end;
$$;

-- -----------------------------------------------------------------------------
-- §E — grants (0009's standing rule: every function carries its own stanza)
-- -----------------------------------------------------------------------------
revoke execute on function class_progress(uuid)                   from public, anon;
revoke execute on function activity_progress(uuid)                from public, anon;
revoke execute on function class_student_work(uuid, uuid, uuid)   from public, anon;
revoke execute on function class_misconceptions(uuid, uuid)       from public, anon;
grant  execute on function class_progress(uuid)                   to authenticated, service_role;
grant  execute on function activity_progress(uuid)                to authenticated, service_role;
grant  execute on function class_student_work(uuid, uuid, uuid)   to authenticated, service_role;
grant  execute on function class_misconceptions(uuid, uuid)       to authenticated, service_role;

comment on function class_progress(uuid) is
  'The class progress grid (0061, CP-2): the class''s LIVE roster × its assigned '
  'live activities. Gated on is_class_teacher; never on activity ownership. The '
  'done fields mirror my_activity_progress (verify-0061 agreement row).';
comment on function activity_progress(uuid) is
  'One activity across the caller''s classes that have it assigned (0061, D5/D6): '
  'rostered students only, per section. can_read_activity gates the call but '
  'never chooses students.';
comment on function class_student_work(uuid, uuid, uuid) is
  'One rostered student''s latest attempt per section on one assigned activity '
  '(0061, CP-3). p_class_id NULL = any class of the caller''s with it assigned.';
comment on function class_misconceptions(uuid, uuid) is
  'Misconception tags on rostered students'' checks, ever and still (0061, D7/D8), '
  'and with an activity the common wrong answers (DR-11). Counts shrink if '
  'prune_section_checks is ever armed.';

-- =============================================================================
-- Verification lives in scripts/verify-0061.sql (registered in the verify
-- runner): definer posture and grants; every gate of every function (another
-- teacher, a removed student, an unshared activity, a deleted class, a deleted
-- activity, a student outside the roster who checked the activity); the done
-- rule incl. NULL totals and older versions; scores; to-grade; the AGREEMENT
-- row against my_activity_progress (D3); misconception ever/still; wrong-answer
-- grouping and the 2-student floor.
-- =============================================================================
