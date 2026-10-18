-- =============================================================================
-- 0064_read_path_costs.sql — five database costs from the 2026-10 efficiency
-- audit (docs/reviews/2026-10-efficiency-audit.md #1, #2, #3, #10, #11;
-- decisions 1–8 ruled by the author 2026-10-18)
-- -----------------------------------------------------------------------------
-- Every function here returns what it returned before; only the work changes.
-- Bodies are copied from their latest definitions (0050, 0061, 0036 — live
-- prosrc hash-checked equal 2026-10-18) with only the marked edits.
--
--   §A  fact_sprint_best + fact_sprint_entry (#1). The student's best score
--       was max over finished sessions of fact_sprint_score(s), and each call
--       re-scores every session: sessions² × attempts. Seeded 180 sessions:
--       8.4 s → 48 ms. fact_sprint_score itself is unchanged (the per-save
--       call is one pass, linear).
--   §B  class_progress (#2) and §C activity_progress (decision 3): the cell /
--       summary CTE grouped once instead of correlated subqueries per cell.
--       Seeded 30 students × 100 activities: 2.55 s before.
--   §D  class_misconceptions (#10): answers no longer copied through the sorts.
--   §E  get_activity_analytics (#3): the latest-attempt set scoped to the
--       activity before the distinct. The view stays (the prune's bond, 0035).
--   §F  two section_checks indexes (#11): BRIN on created_at (the table is
--       append-only — nothing in the repo UPDATEs it) for the nightly window,
--       and btree on activity_version_id (the per-version filters, the purge's
--       RESTRICT check, the advisor's unindexed FK). Plain CREATE INDEX: the
--       migration runs in a transaction and the live table is small.
--
-- NOT CHANGED: the nightly 30-day recompute's width (its own arc), #6's
-- number-facts judging, and every client.
--
-- NOT PERSONAL DATA: no table or column; two indexes (data-map draft-31).
-- =============================================================================

-- §A — the best score in one pass

create or replace function fact_sprint_best(p_class_id uuid, p_student_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  -- ⚠ The judgment expression is fact_sprint_score's (0050), verbatim: the
  -- two must agree, and verify-0064 B1 compares them session by session.
  select max(x.n)::integer
  from (
    select s.id,
           count(a.seq) filter (where fact_attempt_judgment(
             a.rt_ms, a.typed, a.skipped, a.interrupted, a.correct, a.modality,
             s.baseline_keyboard_ms, s.baseline_keypad_ms,
             (select (f->>'criterion_s')::numeric * 1000
                from jsonb_array_elements(s.families) f
               where f->>'family_id' = a.family_id),
             s.ceiling_s * 1000) = 'met') as n
    from sprint_sessions s
    left join sprint_attempts a on a.session_id = s.id and not a.reask
    where s.class_id = p_class_id
      and s.student_id = p_student_id
      and s.finished_at is not null
    group by s.id
  ) x;
$$;


create or replace function fact_sprint_entry(p_code text, p_start boolean default false)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_user    users%rowtype;
  v_class   classes%rowtype;
  v_basis   record;
  v_rev     fact_scope_revision%rowtype;
  v_today   date;
  v_open    uuid;
  v_done    integer;
  v_best    integer;
  v_id      uuid := gen_random_uuid();
  v_items   jsonb;
  v_fams    jsonb;
  v_count   integer;
  v_bk      integer;
  v_bp      integer;
  v_common  jsonb;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  select * into v_user from users where id = v_uid;
  if v_user.id is null or v_user.deleted_at is not null then
    raise exception 'This account is disabled' using errcode = '42501';
  end if;
  if v_user.role in ('teacher', 'admin') then
    return jsonb_build_object('state', 'teacher');
  end if;

  select * into v_class from classes
   where join_code = upper(trim(coalesce(p_code, ''))) and deleted_at is null;
  if v_class.id is null or not exists (
       select 1 from class_members m
        where m.class_id = v_class.id and m.student_id = v_uid and m.removed_at is null) then
    return jsonb_build_object('state', 'not_member');
  end if;
  if v_class.fact_sprint_on_at is null then
    return jsonb_build_object('state', 'off');
  end if;
  select * into v_basis from fact_sprint_basis(v_class.id);
  if v_basis.reason is not null then
    return jsonb_build_object('state', 'off');
  end if;

  v_today := (now() at time zone fact_class_zone(v_class.id))::date;

  select count(*) filter (where finished_at is not null),
         (array_agg(id order by ordinal desc) filter (where finished_at is null))[1]
    into v_done, v_open
    from sprint_sessions
   where class_id = v_class.id and student_id = v_uid and practice_day = v_today;
  v_best := fact_sprint_best(v_class.id, v_uid);  -- 0064: one scored pass
  v_common := jsonb_build_object('done_today', v_done, 'best', v_best,
                                 'class_name', v_class.name);

  if v_open is not null then
    return v_common || jsonb_build_object('state', 'resume',
                                          'session', fact_sprint_payload(v_open));
  end if;

  select * into v_rev from fact_scope_revision
   where registry_rev = v_basis.registry_rev and fact_grammar_rev = v_basis.fact_grammar_rev;

  -- Today's list, numbered in a mixed order that is fixed by the session's
  -- id; a turnaround pair's order from one hash bit (the check's S-2 idiom).
  with built as (
    select * from fact_sprint_build(v_class.id, v_uid, v_rev.registry_rev,
                                    v_rev.fact_grammar_rev, v_basis.year_level, v_today)
  ),
  numbered as (
    select b.fact_id, b.family_id, b.kind, x.answer, x.display, x.spoken,
           x.display_swapped, x.spoken_swapped,
           (x.display_swapped is not null
             and get_byte(decode(md5(v_id::text || ':o:' || b.fact_id), 'hex'), 0) % 2 = 1) as swapped,
           row_number() over (order by md5(v_id::text || ':s:' || b.fact_id), b.fact_id) as n
    from built b
    join fact_scope_fact x
      on x.registry_rev = v_rev.registry_rev and x.fact_grammar_rev = v_rev.fact_grammar_rev
     and x.fact_id = b.fact_id
  )
  select jsonb_agg(jsonb_build_object(
           'n', nb.n, 'fact_id', nb.fact_id, 'family_id', nb.family_id, 'kind', nb.kind,
           'shown',   case when nb.swapped then 'swapped' else 'canonical' end,
           'display', case when nb.swapped then nb.display_swapped else nb.display end,
           'spoken',  case when nb.swapped then nb.spoken_swapped else nb.spoken end,
           'answer',  nb.answer)
         order by nb.n),
         count(*)
    into v_items, v_count
  from numbered nb;

  if v_items is null or v_count = 0 then
    return v_common || jsonb_build_object('state', 'nothing_due');
  end if;
  if not coalesce(p_start, false) then
    return v_common || jsonb_build_object(
      'state', 'ready', 'due', v_count,
      'minutes', (v_rev.sprint->>'sprint_minutes')::numeric);
  end if;

  -- The families in this session. A strategy is shown before the facts when
  -- the family is in strategy mode (every session), or once — in the first
  -- session that includes it — for a family in practice (SP-8).
  select jsonb_agg(jsonb_build_object(
           'family_id', f.family_id, 'name', f.name, 'ord', f.ord,
           'criterion_s', f.criterion_s, 'label', f.label, 'mode', f.mode,
           'strategy', f.strategy,
           'show_strategy',
             f.strategy is not null and (
               f.mode = 'strategy'
               or (f.mode = 'practice' and not exists (
                     select 1 from sprint_sessions old,
                                   jsonb_array_elements(old.families) of
                      where old.class_id = v_class.id and old.student_id = v_uid
                        and of->>'family_id' = f.family_id
                        and (of->>'show_strategy')::boolean))))
         order by f.ord)
    into v_fams
  from fact_sprint_families(v_class.id, v_uid, v_rev.registry_rev,
                            v_rev.fact_grammar_rev, v_basis.year_level) f
  where exists (select 1 from jsonb_array_elements(v_items) i
                 where i->>'family_id' = f.family_id);

  -- The student's most recent baselines in this class, per input method.
  select b.k, b.p into v_bk, v_bp from (
    select (array_agg(t.k order by t.at desc) filter (where t.k is not null))[1] as k,
           (array_agg(t.p order by t.at desc) filter (where t.p is not null))[1] as p
    from (
      select baseline_keyboard_ms k, baseline_keypad_ms p, started_at at
        from sprint_sessions where class_id = v_class.id and student_id = v_uid
      union all
      select baseline_keyboard_ms, baseline_keypad_ms, started_at
        from practice_sessions where class_id = v_class.id and student_id = v_uid
    ) t
  ) b;

  begin
    insert into sprint_sessions (
      id, class_id, student_id, practice_day, ordinal, year_level, registry_rev,
      fact_grammar_rev, ceiling_s, practice_window, sprint, families, items, item_count,
      baseline_keyboard_ms, baseline_keypad_ms, keep_until)
    values (
      v_id, v_class.id, v_uid, v_today, v_done + 1, v_basis.year_level,
      v_rev.registry_rev, v_rev.fact_grammar_rev, v_rev.response_ceiling_s,
      v_rev.practice_window, v_rev.sprint, v_fams, v_items, v_count,
      v_bk, v_bp, least(v_class.school_year_ends_on + 30, current_date + 400));
  exception when unique_violation then
    -- Two tabs started at once; the other one won. Hand back its session.
    select id into v_open from sprint_sessions
     where class_id = v_class.id and student_id = v_uid and practice_day = v_today
       and finished_at is null
     order by ordinal desc limit 1;
    return v_common || jsonb_build_object('state', 'resume',
                                          'session', fact_sprint_payload(v_open));
  end;

  return v_common || jsonb_build_object('state', 'ready', 'due', v_count,
                                        'session', fact_sprint_payload(v_id));
end;
$$;


-- §B — class_progress

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


-- §C — activity_progress

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


-- §D — class_misconceptions

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
    -- 0064: answers (`responses`) are no longer carried through the two window
    -- sorts and the materialised items CTE; `wrong` reads them back by id.
    select sc.id, sc.student_id, sc.activity_id, sc.activity_version_id, sc.section_id,
           sc.attempt_number, sc.created_at, sc.verdicts,
           (row_number() over (partition by sc.student_id, sc.activity_version_id, sc.section_id
                               order by sc.attempt_number desc, sc.created_at desc) = 1) as is_latest,
           -- The version the student most recently checked on this activity.
           -- "Still" is judged there only: after a republish, the old
           -- version's latest attempt is history, and counting it would keep
           -- a fixed misconception "still" forever (Fable review, 2026-10-17).
           (sc.activity_version_id = first_value(sc.activity_version_id) over (
              partition by sc.student_id, sc.activity_id
              order by sc.created_at desc, sc.attempt_number desc)) as on_recent_version
    from section_checks sc
    join roster r on r.student_id = sc.student_id and r.activity_id = sc.activity_id
  ),
  items as (
    select c.student_id, c.activity_id, c.activity_version_id, c.section_id,
           c.is_latest, c.on_recent_version, c.created_at, c.id as check_id,
           i.key as item_id, i.value as verdict
    from checks c
    cross join lateral jsonb_each(
      case when jsonb_typeof(c.verdicts) = 'object' then c.verdicts else '{}'::jsonb end) i
  ),
  tags as (
    select it.student_id, it.activity_id, (it.is_latest and it.on_recent_version) as is_current_latest, m.mid
    from items it
    cross join lateral jsonb_array_elements_text(
      case when jsonb_typeof(it.verdict->'misconceptionIds') = 'array'
           then it.verdict->'misconceptionIds' else '[]'::jsonb end) m(mid)
  ),
  per_student as (
    select t.mid, t.student_id, t.activity_id, bool_or(t.is_current_latest) as still
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
           it.created_at, it.verdict, f.family, rs.responses->f.family->it.item_id as answer
    from items it
    join section_checks rs on rs.id = it.check_id
    left join lateral (
      select fam as family
      from unnest(array['blanks', 'choices', 'matches', 'correspondences',
                        'orderings', 'freeText', 'graphs']) with ordinality as x(fam, ord)
      where jsonb_typeof(rs.responses->fam) = 'object' and (rs.responses->fam) ? it.item_id
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


-- §E — get_activity_analytics

create or replace function get_activity_analytics(p_activity_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_current_version uuid;
  v_boundary        timestamptz;
  v_result          jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not authorized';
  end if;
  if not can_read_activity(p_activity_id) then
    raise exception 'Not available';
  end if;

  select current_version_id into v_current_version
  from activities where id = p_activity_id;
  v_boundary := coalesce(analytics_rolled_boundary(), '-infinity'::timestamptz);

  with latest as (
    -- 0064: section_checks_latest (0035) scoped to this activity BEFORE the
    -- distinct. The view's DISTINCT ON cannot take an activity_id filter, so
    -- each of its three reads sorted every check on the platform. Same key and
    -- the same order as the view; verify-0064 C3 holds the two together.
    select distinct on (sc.student_id, sc.activity_version_id, sc.section_id)
           sc.student_id, sc.activity_version_id, sc.verdicts, sc.created_at
    from section_checks sc
    where sc.activity_id = p_activity_id
    order by sc.student_id, sc.activity_version_id, sc.section_id,
             sc.attempt_number desc, sc.created_at desc
  ),
  raw_above as (
    select sc.id, sc.student_id, sc.activity_version_id, sc.verdicts, sc.created_at
    from section_checks sc
    where sc.activity_id = p_activity_id
      and sc.created_at >= v_boundary
  ),
  raw_exploded as (
    select r.activity_version_id, e.key as item_id, e.value->>'verdict' as verdict
    from raw_above r cross join lateral jsonb_each(r.verdicts) e
  ),
  all_stats as (
    -- The *_all flow: rolled + raw-above-boundary, keyed at read time (R2).
    select coalesce(i.census_key, '_unattributed') as census_key,
           sum(s.verdicts_all)  as verdicts_all,
           sum(s.correct_all)   as correct_all,
           sum(s.incorrect_all) as incorrect_all,
           sum(s.recorded_all)  as recorded_all
    from (
      select activity_version_id, item_id, verdicts_all, correct_all,
             incorrect_all, recorded_all
      from check_item_rollup_daily where activity_id = p_activity_id
      union all
      select activity_version_id, item_id,
             1, (verdict = 'correct')::int, (verdict = 'incorrect')::int,
             (verdict = 'recorded')::int
      from raw_exploded
    ) s
    left join activity_version_items i
      on i.version_id = s.activity_version_id and i.item_id = s.item_id
    group by 1
  ),
  latest_exploded as (
    select l.student_id, l.activity_version_id,
           e.key as item_id, e.value->>'verdict' as verdict
    from latest l
    cross join lateral jsonb_each(l.verdicts) e
  ),
  latest_stats as (
    select coalesce(i.census_key, '_unattributed') as census_key,
           count(*)                                          as verdicts_latest,
           count(*) filter (where x.verdict = 'correct')     as correct_latest,
           count(*) filter (where x.verdict = 'incorrect')   as incorrect_latest,
           count(*) filter (where x.verdict = 'recorded')    as recorded_latest,
           count(distinct x.student_id)                      as students
    from latest_exploded x
    left join activity_version_items i
      on i.version_id = x.activity_version_id and i.item_id = x.item_id
    group by 1
  ),
  structure as (
    select c.census_key, c.block_count
    from activity_version_census c
    where c.version_id = v_current_version
  )
  select jsonb_build_object(
    'activity_id',        p_activity_id,
    'current_version_id', v_current_version,
    'censused',           exists (select 1 from structure),
    'keys',               coalesce(
      (
        select jsonb_agg(row_to_json(k) order by k.census_key)
        from (
          select coalesce(a.census_key, l.census_key, st.census_key) as census_key,
                 st.block_count,
                 coalesce(a.verdicts_all, 0)       as verdicts_all,
                 coalesce(a.correct_all, 0)        as correct_all,
                 coalesce(a.incorrect_all, 0)      as incorrect_all,
                 coalesce(a.recorded_all, 0)       as recorded_all,
                 coalesce(l.verdicts_latest, 0)    as verdicts_latest,
                 coalesce(l.correct_latest, 0)     as correct_latest,
                 coalesce(l.incorrect_latest, 0)   as incorrect_latest,
                 coalesce(l.recorded_latest, 0)    as recorded_latest,
                 coalesce(l.students, 0)           as students
          from all_stats a
          full outer join latest_stats l on l.census_key = a.census_key
          full outer join structure st
            on st.census_key = coalesce(a.census_key, l.census_key)
        ) k
      ),
      '[]'::jsonb
    ),
    'totals', (
      select jsonb_build_object(
        'checks',
          coalesce((select sum(checks) from check_rollup_daily
                     where activity_id = p_activity_id), 0)
          + (select count(*) from raw_above),
        'students',
          (select count(distinct student_id) from latest),
        'last_check_at',
          (select max(created_at) from latest)
      )
    ),
    'job', (
      select case when r.id is null then null else jsonb_build_object(
        'last_run_at',              r.ran_at,
        'stale_cache_rows_deleted', r.stale_cache_rows_deleted,
        'section_check_rows',       r.section_check_rows
      ) end
      from (select * from analytics_job_runs
             where job_name = 'analytics'
             order by ran_at desc, id desc limit 1) r
    )
  ) into v_result;

  return v_result;
end;
$$;


-- §F — indexes
create index section_checks_created_brin on section_checks using brin (created_at);
create index section_checks_version_idx  on section_checks (activity_version_id);

-- Grants. create or replace keeps the five re-created functions' grants; the
-- helper is internal, like fact_sprint_score.
revoke execute on function fact_sprint_best(uuid, uuid) from public, anon, authenticated;
grant  execute on function fact_sprint_best(uuid, uuid) to service_role;
