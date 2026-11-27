-- =============================================================================
-- 0108_grid_and_panel_costs.sql — two teacher reads that slowed as a class grew
-- (code review 2026-11-26, docs/reviews/2026-11-26-code-review.md D2 and D3)
-- -----------------------------------------------------------------------------
-- Every function here returns what it returned before; only the work changes.
-- Bodies are copied from their latest definitions (class_progress and
-- activity_progress: 0099; mixed_who_first: 0091) with only the marked edits.
-- Measured on the local stack, old and new in one rolled-back transaction,
-- each result compared equal (jsonb =) to the old body's:
--
--   §A  class_progress (D2). The "to grade" count walked every block of every
--       section once per latest check and called photos_allowed_for — a
--       definer read of three tables — for every block row. Now each version's
--       hand-graded blocks are walked ONCE (class_gradebook's shape, 0102) and
--       the photo rule is read once per activity. 30 students × 20 activities
--       × 100 blocks (3,000 latest checks): median 1,536 ms → 426 ms.
--   §B  activity_progress (D2). The same walk change (its photo rule was
--       already read once). 30 students × one 100-block activity:
--       median 66 ms → 23 ms.
--   §C  mixed_who_first (D3), polled every 5 s by an open teacher panel (the
--       cadence is ruled and unchanged). Both windows ranked the class's
--       WHOLE mixed-practice history on every poll. Now: group 1 reads only
--       the pairs practised and served today, and group 2 only the keys of
--       students practised today, each key's last `window` first tries read
--       in index order (mixed_attempts_step_idx). NO date floor: a floor
--       would drop a long-unpractised skill's old tries from its window and
--       change who is listed. 30 students, 20 first tries a day: 60 days of
--       history (36,000 rows) median 71 ms → 35 ms; 180 days (108,000 rows)
--       213 ms → 40 ms — the new read no longer grows with the history.
--
-- NOT CHANGED: mixed_recent (its other callers read whole windows), the
-- class_gradebook read, every client, every result shape (keys re-read;
-- lib/dbShapes.ts's three @shape-as-of stamps move to 0108).
--
-- NOT PERSONAL DATA: no table or column (data map unchanged).
-- Verification: scripts/verify-0108.sql; re-run verify-0061, -0064, -0068,
-- -0071, -0097, -0099.
-- =============================================================================

-- §A ---------------------------------------------------------------------------
create or replace function public.class_progress(p_class_id uuid)
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
    -- 0108 (D2): the photo rule once per activity, not once per block row.
    select ca.activity_id, a.title, a.current_version_id, ca.added_at,
           photos_allowed_for(ca.activity_id) as photos_on
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
  version_blocks as (
    -- 0108 (D2): each version's hand-graded blocks, walked ONCE per version
    -- (class_gradebook's shape, 0102), not once per latest check. The walk,
    -- the type test and the DoL-optional rule are the old hand CTE's own.
    select v.version_id, s->>'id' as section_id, (b->>'id')::uuid as block_id,
           b->>'type' as block_type, v.photos_on,
           (jsonb_typeof(s->'dol') = 'object') as in_dol
    from (select distinct l.activity_version_id as version_id, acts.photos_on
            from latest l join acts on acts.activity_id = l.activity_id) v
    join activity_versions av on av.id = v.version_id
    cross join lateral jsonb_array_elements(coalesce(av.content->'sections', '[]'::jsonb)) s
    cross join lateral jsonb_array_elements(coalesce(s->'rows', '[]'::jsonb)) r
    cross join lateral jsonb_array_elements(coalesce(r->'columns', '[]'::jsonb)) col
    cross join lateral jsonb_array_elements(coalesce(col->'blocks', '[]'::jsonb)) b
    where is_manually_graded_type(b->>'type')
      and not (jsonb_typeof(s->'dol') = 'object' and dol_optional_block(s, b->>'id'))
  ),
  hand as (
    -- CP-7: hand-graded blocks on each latest check with no grade yet. The
    -- same "owed" rule (hand_grade_owed) and "graded" test as
    -- list_grading_queue, so the number matches the ungraded rows Responses
    -- shows for this student.
    select l.student_id, l.activity_id, count(*)::integer as n
    from latest l
    join version_blocks vb
      on vb.version_id = l.activity_version_id and vb.section_id = l.section_id
    where hand_grade_owed(vb.block_type, l.check_id, vb.block_id, vb.photos_on, vb.in_dol)
      and not exists (
        select 1
        from check_grades cg
        join section_checks g on g.id = cg.check_id
        where g.student_id = l.student_id
          and g.activity_version_id = l.activity_version_id
          and g.section_id = l.section_id
          and cg.block_id = vb.block_id
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

-- §B ---------------------------------------------------------------------------
create or replace function public.activity_progress(p_activity_id uuid)
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
  v_photos_on := photos_allowed_for(p_activity_id);
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
  version_blocks as (
    -- 0108 (D2): each version's hand-graded blocks, walked ONCE per version,
    -- not once per latest check (class_progress's same change).
    select v.version_id, s->>'id' as section_id, (b->>'id')::uuid as block_id,
           b->>'type' as block_type,
           (jsonb_typeof(s->'dol') = 'object') as in_dol
    from (select distinct l.activity_version_id as version_id from latest l) v
    join activity_versions av on av.id = v.version_id
    cross join lateral jsonb_array_elements(coalesce(av.content->'sections', '[]'::jsonb)) s
    cross join lateral jsonb_array_elements(coalesce(s->'rows', '[]'::jsonb)) r
    cross join lateral jsonb_array_elements(coalesce(r->'columns', '[]'::jsonb)) col
    cross join lateral jsonb_array_elements(coalesce(col->'blocks', '[]'::jsonb)) b
    where is_manually_graded_type(b->>'type')
      and not (jsonb_typeof(s->'dol') = 'object' and dol_optional_block(s, b->>'id'))
  ),
  hand as (
    select l.student_id, count(*)::integer as n
    from latest l
    join version_blocks vb
      on vb.version_id = l.activity_version_id and vb.section_id = l.section_id
    where hand_grade_owed(vb.block_type, l.check_id, vb.block_id, v_photos_on, vb.in_dol)
      and not exists (
        select 1
        from check_grades cg
        join section_checks g on g.id = cg.check_id
        where g.student_id = l.student_id
          and g.activity_version_id = l.activity_version_id
          and g.section_id = l.section_id
          and cg.block_id = vb.block_id
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


-- §C ---------------------------------------------------------------------------
-- 0071's "who to see first" (0091: re-tries left out of the same-mistake window).
create or replace function mixed_who_first(p_class_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_class   classes%rowtype;
  v_basis   record;
  v_sprint  record;
  v_win     integer;
  v_min     integer;
  v_today   date;
  v_stuck   jsonb := '[]'::jsonb;
  v_facts   jsonb := '[]'::jsonb;
  v_same    jsonb := '[]'::jsonb;
  v_listed  uuid[] := '{}';
  v_started integer;
  v_roster  integer;
begin
  if auth.uid() is null or p_class_id is null or not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  select * into v_class from classes where id = p_class_id;
  select * into v_basis from mixed_basis(p_class_id);
  v_win   := coalesce((v_basis.settings->>'mixed_struggling_window')::integer, 5);
  v_min   := coalesce((v_basis.settings->>'mixed_struggling_min_right')::integer, 3);
  v_today := (now() at time zone fact_class_zone(p_class_id))::date;

  select count(*) into v_roster from mixed_roster(p_class_id);

  -- Group 1, mixed: practised today, getting stuck (0066's rule, unchanged)
  -- on a skill served to them today.
  with today_served as (
    select distinct si.student_id, si.bank_key
      from mixed_sessions s
      join mixed_session_items si on si.session_id = s.id
     where s.class_id = p_class_id and s.practice_day = v_today and si.kind = 'skill'
  ), practised as (
    select distinct a.student_id from mixed_attempts a
     where a.class_id = p_class_id and a.practice_day = v_today
  ), pairs as (
    -- 0108 (D3): only the (student, skill) pairs the rule can fire on —
    -- practised today, served today, still in the class (mixed_recent's own
    -- membership join). The old read ranked the class's WHOLE history
    -- through mixed_recent on every 5-second poll.
    select distinct t.student_id, t.bank_key
      from today_served t
      join practised p on p.student_id = t.student_id
      join class_members m on m.class_id = p_class_id and m.student_id = t.student_id
                          and m.removed_at is null
  ), recent as (
    -- mixed_recent's window for one pair: its last v_win first tries, mixed
    -- practice (not re-tries) and clip pauses together, newest first. Each
    -- arm is read in index order; a pair's top v_win is within the arms' own.
    select pr.student_id, pr.bank_key, x.correct
      from pairs pr
      cross join lateral (
        select y.correct
          from ((select ma.correct, ma.practice_day, ma.saved_at, ma.seq
                   from mixed_attempts ma
                  where ma.class_id = p_class_id and ma.student_id = pr.student_id
                    and ma.kind = 'skill' and ma.bank_key = pr.bank_key and not ma.retry
                  order by ma.practice_day desc, ma.saved_at desc, ma.seq desc
                  limit v_win)
                union all
                (select t.correct, (t.saved_at at time zone fact_class_zone(p_class_id))::date,
                        t.saved_at, 0
                   from video_pause_tries t
                   join activity_versions v on v.id = t.activity_version_id
                   join class_activities ca on ca.activity_id = v.activity_id
                                           and ca.class_id = p_class_id
                  where t.student_id = pr.student_id and t.skill_id = pr.bank_key)) y
         order by y.practice_day desc, y.saved_at desc, y.seq desc
         limit v_win) x
  ), hit as (
    select r.student_id, r.bank_key
      from recent r
     group by r.student_id, r.bank_key
    having count(*) - count(*) filter (where r.correct) > v_win - v_min
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'student_id', w.student_id, 'name', w.name,
           'skills', (select jsonb_agg(jsonb_build_object('id', h.bank_key, 'label', l.label)
                                       order by h.bank_key)
                        from hit h left join skill_label l on l.id = h.bank_key
                       where h.student_id = w.student_id))
         order by lower(w.name), w.student_id), '[]'::jsonb)
    into v_stuck
    from mixed_roster(p_class_id) w
   where exists (select 1 from hit h where h.student_id = w.student_id);

  -- Group 1, number facts (S4-3): only when the sprint is on and readable.
  if v_class.fact_sprint_on_at is not null then
    select * into v_sprint from fact_sprint_basis(p_class_id);
    if v_sprint.reason is null then
      with practised as (
        select distinct s.student_id from sprint_sessions s
         where s.class_id = p_class_id and s.practice_day = v_today
           and exists (select 1 from sprint_attempts a where a.session_id = s.id)
      ), fam as (
        select w.student_id, w.name, f.name as family, f.ord
          from mixed_roster(p_class_id) w
          join practised p on p.student_id = w.student_id
          cross join lateral fact_sprint_families(p_class_id, w.student_id, v_sprint.registry_rev,
                                                  v_sprint.fact_grammar_rev, v_sprint.year_level) f
         where f.label = 'needs_strategy' and f.mode = 'strategy'
      )
      select coalesce(jsonb_agg(jsonb_build_object('student_id', x.student_id, 'name', x.name,
                                                   'families', x.families)
                                order by lower(x.name), x.student_id), '[]'::jsonb)
        into v_facts
        from (select student_id, name, jsonb_agg(family order by ord) as families
                from fam group by student_id, name) x;
    end if;
  end if;

  -- Group 2 (0071, C-164 item 3): the same misconception on ≥ 2 first tries
  -- ACROSS ALL the student's skills (and discrimination banks), each try
  -- inside its own skill's last `window` first tries, across days; practised
  -- today. A misconception attached to several skills (pair attachments,
  -- e.g. mis.expand.first-term-only) now combines; the row lists every skill
  -- it fired on.
  with practised as (
    select distinct a.student_id from mixed_attempts a
     where a.class_id = p_class_id and a.practice_day = v_today
  ), keys as (
    -- 0108 (D3): each practised student's distinct (kind, bank) keys, by a
    -- loose scan of mixed_attempts_step_idx — one index probe per key, not a
    -- read of the student's whole history.
    select p.student_id, k.kind, k.bank_key
      from practised p
      cross join lateral (
        with recursive k as (
          (select a.kind, a.bank_key from mixed_attempts a
            where a.class_id = p_class_id and a.student_id = p.student_id
            order by a.kind, a.bank_key
            limit 1)
          union all
          select n.kind, n.bank_key
            from k
            cross join lateral (
              select a.kind, a.bank_key from mixed_attempts a
               where a.class_id = p_class_id and a.student_id = p.student_id
                 and (a.kind, a.bank_key) > (k.kind, k.bank_key)
               order by a.kind, a.bank_key
               limit 1) n
        )
        select k.kind, k.bank_key from k) k
  ), tops as (
    -- Each key's last v_win first tries (not re-tries), in index order. The
    -- window below is per (student, bank) ACROSS kinds, as before; its top
    -- v_win is always inside the union of each kind's top v_win.
    select k.student_id, k.bank_key, t.kind, t.misconception_ids,
           t.practice_day, t.saved_at, t.seq
      from keys k
      cross join lateral (
        select a.kind, a.misconception_ids, a.practice_day, a.saved_at, a.seq
          from mixed_attempts a
         where a.class_id = p_class_id and a.student_id = k.student_id
           and a.kind = k.kind and a.bank_key = k.bank_key and not a.retry
         order by a.practice_day desc, a.saved_at desc, a.seq desc
         limit v_win) t
  ), win as (
    select a.student_id, a.kind, a.bank_key, a.misconception_ids,
           row_number() over (partition by a.student_id, a.bank_key
                              order by a.practice_day desc, a.saved_at desc, a.seq desc) as rn
      from tops a
  ), hits as (
    select w.student_id, m.id as mis, w.kind, w.bank_key
      from win w cross join lateral unnest(w.misconception_ids) m(id)
     where w.rn <= v_win
  ), rep as (
    select h.student_id, h.mis
      from hits h
     group by h.student_id, h.mis
    having count(*) >= 2
  ), per_mis as (
    select r.student_id, r.mis,
           (select jsonb_agg(jsonb_build_object('id', k.bank_key, 'label', mixed_key_label(k.kind, k.bank_key))
                     order by k.bank_key)
              from (select distinct h.kind, h.bank_key from hits h
                     where h.student_id = r.student_id and h.mis = r.mis) k) as skills
      from rep r
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'student_id', w.student_id, 'name', w.name,
           'mistakes', (select jsonb_agg(jsonb_build_object('id', pm.mis, 'label', mr.description,
                                                            'skills', pm.skills) order by pm.mis)
                          from per_mis pm left join misconception_registry mr on mr.id = pm.mis
                         where pm.student_id = w.student_id))
         order by lower(w.name), w.student_id), '[]'::jsonb)
    into v_same
    from mixed_roster(p_class_id) w
   where exists (select 1 from per_mis pm where pm.student_id = w.student_id);

  select coalesce(array_agg(distinct (e->>'student_id')::uuid), '{}') into v_listed
    from jsonb_array_elements(v_stuck || v_facts || v_same) e;

  select count(*) into v_started from mixed_roster(p_class_id) w
   where exists (select 1 from mixed_attempts a
                  where a.class_id = p_class_id and a.student_id = w.student_id
                    and a.practice_day = v_today)
      or exists (select 1 from sprint_sessions s
                  where s.class_id = p_class_id and s.student_id = w.student_id
                    and s.practice_day = v_today
                    and exists (select 1 from sprint_attempts a where a.session_id = s.id));

  return jsonb_build_object(
    'mixed_on',      v_class.mixed_on_at is not null,
    'facts_on',      v_class.fact_sprint_on_at is not null,
    'started_today', v_started,
    'stuck',         v_stuck,
    'facts',         v_facts,
    'same_mistake',  v_same,
    'everyone_else', v_roster - coalesce(array_length(v_listed, 1), 0));
end;
$$;
