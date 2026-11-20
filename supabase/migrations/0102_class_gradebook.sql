-- =============================================================================
-- 0102_class_gradebook.sql — the marks a class's gradebook file adds to the
-- progress grid (docs/design/gradebook-export.md, GB-1..GB-13, ruled
-- 2026-11-20)
-- -----------------------------------------------------------------------------
-- One teacher-only read, class_gradebook(class_id). The page merges it with
-- class_progress (which it already loads) and builds the CSV in the browser.
-- It adds NO table, NO column, and NO personal data the teacher could not
-- already read on screen; it adds totals nobody computed before.
--
-- Scope (the ownership trap, class-progress-view.md): every row is LIVE
-- roster × this class's activities, with exactly class_progress's `acts`
-- filter (published, has a version, not deleted), so the merge lines up
-- (GB-13) and a student in no class of the caller's never appears.
--
-- What it returns:
--   students  the live roster's emails (GB-8: the CSV's email column, a
--             deliberate reversal of E-1's names-only ruling; the teacher
--             already reads them through list_class_members)
--   hand      per student × activity, over the hand-graded blocks of the
--             version the grid SHOWS (current if checked, else the most
--             recently checked; CP-6):
--               points    sum of `earned` over the latest RELEASED grade per
--                         block, across versions (GB-2; exactly the
--                         get_my_released_feedback winner: graded_at, attempt,
--                         id), so a seen mark survives a republish
--               possible  sum of the rubric's maxPoints over EVERY such block,
--                         graded or not (GB-2: one denominator per version)
--               pending   the POINTS of blocks with no released grade yet
--               from_older  released grades carried from an earlier version
--               stale     released grades whose answer has changed since
--                         (the student read's own staleness test)
--             The block set is the version's hand-graded blocks minus a DoL's
--             optional explanation (dol_optional_block) and minus a photo
--             answer while photo answers are off for this activity (outside a
--             DoL), i.e. hand_grade_owed's rule read from the CONTENT, since
--             a denominator cannot depend on what one student uploaded.
--   hand_activities  the activities whose CURRENT version has any such block
--             (they get points columns; GB-2 "any rubric block")
--   dol       per student × DoL activity whose DoL has a skill
--             (dol_pass_skill not null): the pass's source. A pass counts only
--             with a check by that student on THIS activity (GB-4, the
--             dol_pass_status filter).
--   dol_activities   those activities (they get a "DoL passed" column)
--   practice  per student, split by `review`, over GRADED sessions in this
--             class that have CLOSED (GB-5, the Fable finding): finished,
--             pruned (ER-7 keeps the score), or open more than a day
--             (record_mixed_attempt refuses after that, 0091) with at least
--             one answer. Pooled: total right and total planned, plus the
--             latest session's pair.
--   today     the class's own date (GB-13: the file name's day, not UTC)
--   practice_shown   the class's switch is on, or it has any graded session
--             (GB-5 "has ever been on")
--
-- Verification: scripts/verify-0102.sql.
-- =============================================================================

create function class_gradebook(p_class_id uuid)
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
    select m.student_id, u.email
    from class_members m
    join users u on u.id = m.student_id
    where m.class_id = p_class_id
      and m.removed_at is null
  ),
  acts as (
    -- class_progress's filter, verbatim (GB-13).
    select ca.activity_id, a.current_version_id,
           photos_allowed_for(ca.activity_id) as photos_on
    from class_activities ca
    join activities a on a.id = ca.activity_id
    where ca.class_id = p_class_id
      and a.status = 'published'
      and a.current_version_id is not null
      and a.deleted_at is null
  ),
  checks as (
    select sc.id as check_id, sc.student_id, sc.activity_id, sc.activity_version_id,
           sc.section_id, sc.attempt_number, sc.created_at, sc.responses
    from section_checks sc
    join roster r on r.student_id = sc.student_id
    join acts     on acts.activity_id = sc.activity_id
  ),
  shown as (
    -- The version the grid displays (class_progress `shown`).
    select distinct on (c.student_id, c.activity_id)
           c.student_id, c.activity_id, c.activity_version_id
    from (select student_id, activity_id, activity_version_id, max(created_at) as last_at
          from checks group by student_id, activity_id, activity_version_id) c
    join acts on acts.activity_id = c.activity_id
    order by c.student_id, c.activity_id,
             (c.activity_version_id = acts.current_version_id) desc, c.last_at desc
  ),
  version_blocks as (
    -- Every hand-graded block of every version in play, with its rubric max.
    select v.version_id, v.activity_id, s->>'id' as section_id, (b->>'id')::uuid as block_id,
           coalesce((select sum((c->>'maxPoints')::numeric)
                       from jsonb_array_elements(case when jsonb_typeof(b->'rubric'->'criteria') = 'array'
                                                      then b->'rubric'->'criteria' else '[]'::jsonb end) c),
                    0) as max_points
    from (select distinct activity_version_id as version_id, activity_id from shown
          union
          select current_version_id, activity_id from acts) v
    join acts on acts.activity_id = v.activity_id
    join activity_versions av on av.id = v.version_id
    cross join lateral jsonb_array_elements(coalesce(av.content->'sections', '[]'::jsonb)) s
    cross join lateral jsonb_array_elements(coalesce(s->'rows', '[]'::jsonb)) r
    cross join lateral jsonb_array_elements(coalesce(r->'columns', '[]'::jsonb)) col
    cross join lateral jsonb_array_elements(coalesce(col->'blocks', '[]'::jsonb)) b
    where is_manually_graded_type(b->>'type')
      and not (jsonb_typeof(s->'dol') = 'object' and dol_optional_block(s, b->>'id'))
      and (b->>'type' is distinct from 'photo_response'
           or acts.photos_on
           or jsonb_typeof(s->'dol') = 'object')
  ),
  released as (
    -- The latest RELEASED grade per student × activity × block, ACROSS
    -- versions: exactly get_my_released_feedback's winner (0096), so a mark
    -- the student has seen never leaves the file when a republish moves the
    -- shown version on (Fable review of the build). A block id kept across
    -- versions carries its grade; one that is new in the shown version is
    -- pending until graded there.
    select distinct on (c.student_id, c.activity_id, cg.block_id)
           c.student_id, c.activity_id, c.activity_version_id, c.section_id, cg.block_id,
           c.responses as graded_responses,
           (select coalesce(sum((x->>'earned')::numeric), 0)
              from jsonb_array_elements(case when jsonb_typeof(cg.criteria) = 'array'
                                             then cg.criteria else '[]'::jsonb end) x) as earned
    from check_grades cg
    join checks c on c.check_id = cg.check_id
    where cg.released_at is not null
    order by c.student_id, c.activity_id, cg.block_id,
             cg.graded_at desc, c.attempt_number desc, cg.id desc
  ),
  latest as (
    select distinct on (c.student_id, c.activity_version_id, c.section_id)
           c.student_id, c.activity_version_id, c.section_id, c.responses
    from checks c
    order by c.student_id, c.activity_version_id, c.section_id,
             c.attempt_number desc, c.created_at desc
  ),
  hand as (
    select sh.student_id, sh.activity_id,
           coalesce(sum(rel.earned), 0)                                     as points,
           sum(vb.max_points)                                               as possible,
           -- POINTS still to come: the rubric totals of questions with no
           -- released grade (graded-unreleased, ungraded, or not yet
           -- answered). points + pending + points lost = possible.
           coalesce(sum(vb.max_points) filter (where rel.block_id is null), 0) as pending,
           (count(*) filter (where rel.block_id is not null
                              and rel.activity_version_id <> sh.activity_version_id))::int as from_older,
           (count(*) filter (where rel.block_id is not null and coalesce(
              (rel.graded_responses->'freeText'->>rel.block_id::text)
                is distinct from (l.responses->'freeText'->>rel.block_id::text)
              or photo_ids_of(rel.graded_responses, rel.block_id)
                is distinct from photo_ids_of(l.responses, rel.block_id),
              false)))::int                                     as stale
    from shown sh
    join version_blocks vb on vb.version_id = sh.activity_version_id
    left join released rel
      on rel.student_id = sh.student_id
     and rel.activity_id = sh.activity_id
     and rel.block_id = vb.block_id
    -- Staleness against the latest check of the GRADED version and section
    -- (the student read's own test).
    left join latest l
      on l.student_id = sh.student_id
     and l.activity_version_id = rel.activity_version_id
     and l.section_id = rel.section_id
    group by sh.student_id, sh.activity_id
  ),
  dol_acts as (
    select acts.activity_id, dol_pass_skill(acts.activity_id) as skill_id
    from acts
  ),
  dol as (
    select dp.student_id, da.activity_id, dp.source
    from dol_acts da
    join dol_pass dp on dp.skill_id = da.skill_id
    join roster r on r.student_id = dp.student_id
    where da.skill_id is not null
      and exists (select 1 from section_checks sc
                   where sc.student_id = dp.student_id and sc.activity_id = da.activity_id)
  ),
  closed as (
    select s.*
    from mixed_sessions s
    join roster r on r.student_id = s.student_id
    where s.class_id = p_class_id
      and s.graded
      and (s.finished_at is not null
           -- A pruned session keeps its score (ER-7) but not its attempts; one
           -- that was opened and never answered stays out after the prune as
           -- it was before it.
           or (s.pruned_at is not null and s.score_answered > 0)
           or (now() > s.started_at + interval '1 day'
               and exists (select 1 from mixed_attempts a where a.session_id = s.id)))
  ),
  practice as (
    select c.student_id, c.review,
           sum(c.score_right)::int as right_total,
           sum(c.planned)::int     as planned_total,
           count(*)::int           as sessions,
           (array_agg(c.score_right order by c.practice_day desc, c.ordinal desc))[1] as latest_right,
           (array_agg(c.planned     order by c.practice_day desc, c.ordinal desc))[1] as latest_planned
    from closed c
    group by c.student_id, c.review
  )
  select jsonb_build_object(
    'students', (select coalesce(jsonb_agg(jsonb_build_object(
                     'student_id', r.student_id, 'email', r.email)), '[]'::jsonb)
                   from roster r),
    'hand', (select coalesce(jsonb_agg(jsonb_build_object(
                 'student_id', h.student_id, 'activity_id', h.activity_id,
                 'points', h.points, 'possible', h.possible, 'pending', h.pending,
                 'stale', h.stale, 'from_older', h.from_older)), '[]'::jsonb)
               from hand h),
    -- Points columns only where the current version's rubrics total more
    -- than nothing (a rubric-less question would give 0 / 0 columns).
    'hand_activities', (select coalesce(jsonb_agg(x.activity_id), '[]'::jsonb)
                          from (select vb.activity_id
                                  from version_blocks vb
                                  join acts on acts.activity_id = vb.activity_id
                                           and acts.current_version_id = vb.version_id
                                 group by vb.activity_id
                                having sum(vb.max_points) > 0) x),
    'dol', (select coalesce(jsonb_agg(jsonb_build_object(
                'student_id', d.student_id, 'activity_id', d.activity_id, 'source', d.source)), '[]'::jsonb)
              from dol d),
    'dol_activities', (select coalesce(jsonb_agg(da.activity_id), '[]'::jsonb)
                         from dol_acts da where da.skill_id is not null),
    'practice', (select coalesce(jsonb_agg(jsonb_build_object(
                     'student_id', p.student_id, 'review', p.review,
                     'right', p.right_total, 'planned', p.planned_total,
                     'sessions', p.sessions,
                     'latest_right', p.latest_right, 'latest_planned', p.latest_planned)), '[]'::jsonb)
                   from practice p),
    'today', (now() at time zone fact_class_zone(p_class_id))::date,
    'practice_shown', v_class.mixed_graded
                      or exists (select 1 from mixed_sessions s
                                  where s.class_id = p_class_id and s.graded))
  into v_out;

  return v_out;
end;
$$;

comment on function class_gradebook(uuid) is
  'The marks a class''s gradebook CSV adds to class_progress (0102, gradebook-export.md GB-1..GB-13): released hand-grade totals on the shown version, DoL passes with a check on the activity, and pooled graded practice scores over closed sessions. Teacher-only (is_class_teacher), live roster × this class''s activities.';

revoke execute on function class_gradebook(uuid) from public, anon;
grant  execute on function class_gradebook(uuid) to authenticated, service_role;
