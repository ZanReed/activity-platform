-- =============================================================================
-- 0065_fact_judged_per_student.sql — judge ONE student's number-facts answers
-- when only one student is wanted (efficiency audit 2026-10 #6; TODOS item 2,
-- option (a′) ruled 2026-10-18)
-- -----------------------------------------------------------------------------
-- fact_probe_judged(probe) judged every student in a check; the student's own
-- practice reads (fact_sprint_log, fact_sprint_families) then kept one. Each
-- practice entry called it 3–4 times per closed check, and the teacher's
-- overview runs fact_sprint_families once per student, so its cost grew with
-- students². Measured on seeded data (60 students × 15 checks): judging one
-- student across all checks 50 ms → 4 ms, the same rows.
--
-- WHY A PARAMETER, NOT INLINING (the first approach, measured and dropped):
-- an invoker copy IS inlined, but the "this student" condition reaches it as a
-- JOIN qual, which Postgres does not push into a subquery with its own CTEs —
-- it still judged the whole class (≈20% saved). The filter has to be inside.
--
--   §A  fact_probe_judged(probe, student default null). The body is 0045's,
--       character for character, plus ONE condition on practice_sessions.
--       NULL = the whole check, exactly as before, so every teacher-side
--       caller (0045 results/overview, 0046, 0047) is untouched and calls the
--       one-argument form through the default. ONE body still — the judgment
--       bond verify-0050 §B2 holds (a per-student COPY was option (b),
--       rejected for exactly that reason).
--   §B  fact_sprint_log + fact_sprint_families (0050) pass the student. Only
--       that argument changes.
--   §C  grants for the new signature (service_role only, as before).
--
-- The old one-argument function is DROPPED first: a CREATE with a second,
-- defaulted argument beside it would make every one-argument call ambiguous.
-- SQL function bodies do not record dependencies, so the drop is clean.
--
-- NOT PERSONAL DATA: no table or column (data-map draft-32).
-- =============================================================================

-- §A — the one judging function, now optionally per student
drop function fact_probe_judged(uuid);

create function fact_probe_judged(p_probe_id uuid, p_student_id uuid default null)
returns table (
  session_id uuid,
  student_id uuid,
  seq        integer,
  family_id  text,
  judgment   text,
  counted_ms numeric,
  flagged    boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with p as (
    select * from class_probes where id = p_probe_id
  ),
  item as (
    select (i->>'n')::integer as n, i->>'family_id' as family_id
    from p, jsonb_array_elements(p.items) i
  ),
  fam as (
    select f->>'family_id' as family_id, (f->>'criterion_s')::numeric * 1000 as criterion_ms
    from p, jsonb_array_elements(p.families) f
  ),
  a as (
    select at.session_id, at.student_id, at.seq, item.family_id,
           at.correct, at.skipped, at.interrupted, at.rt_ms,
           case at.modality
             when 'keyboard' then coalesce(s.baseline_keyboard_ms, s.baseline_keypad_ms)
             when 'keypad'   then coalesce(s.baseline_keypad_ms, s.baseline_keyboard_ms)
             else                 coalesce(s.baseline_keyboard_ms, s.baseline_keypad_ms)
           end as b,
           case at.modality
             when 'keyboard' then s.baseline_keyboard_ms is null
             when 'keypad'   then s.baseline_keypad_ms is null
             when 'mixed'    then true
             else false
           end as borrowed,
           length(at.typed)
             + case when at.skipped or at.interrupted then 0 else 1 end as keys,
           fam.criterion_ms,
           p.ceiling_s * 1000 as ceiling_ms
    from p
    join practice_sessions s on s.probe_id = p.id
     -- 0065: one student's sessions only, when asked (NULL = the whole class).
     and (p_student_id is null or s.student_id = p_student_id)
    join fact_attempts at on at.session_id = s.id
    join item on item.n = at.seq
    join fam on fam.family_id = item.family_id
  ),
  n as (
    select a.*, greatest(0, a.rt_ms - coalesce(a.b, 0) * a.keys)::numeric as net_ms
    from a
  )
  select n.session_id, n.student_id, n.seq, n.family_id,
         case
           when n.interrupted           then 'interrupted'
           when n.skipped               then 'skipped'
           when n.net_ms > n.ceiling_ms then 'timeout'
           when not n.correct           then 'wrong'
           when n.net_ms <= n.criterion_ms then 'met'
           when n.b is null             then 'unjudged'
           else 'slow'
         end,
         least(n.net_ms, n.ceiling_ms),
         (n.b is null) or (n.borrowed and n.keys > 0)
  from n;
$$;

-- §B — the two per-student readers pass the student
create or replace function fact_sprint_log(p_class_id uuid, p_student_id uuid)
returns table (
  fact_id   text,
  family_id text,
  at        timestamptz,
  seq       integer,   -- its place within its own session (a batch shares `at`)
  day       date,
  judgment  text,
  source    text
)
language sql
stable
security definer
set search_path = public
as $$
  with z as (select fact_class_zone(p_class_id) as zone)
  select fa.fact_id, j.family_id, fa.saved_at, fa.seq,
         (fa.saved_at at time zone z.zone)::date, j.judgment, 'check'
  from z
  join class_probes p on p.class_id = p_class_id
  join practice_sessions s on s.probe_id = p.id and s.student_id = p_student_id
  join lateral fact_probe_judged(p.id, p_student_id) j on j.session_id = s.id
  join fact_attempts fa on fa.session_id = j.session_id and fa.seq = j.seq
  union all
  select a.fact_id, a.family_id, a.saved_at, a.seq,
         (a.saved_at at time zone z.zone)::date,
         fact_attempt_judgment(
           a.rt_ms, a.typed, a.skipped, a.interrupted, a.correct, a.modality,
           s.baseline_keyboard_ms, s.baseline_keypad_ms,
           (select (f->>'criterion_s')::numeric * 1000
              from jsonb_array_elements(s.families) f
             where f->>'family_id' = a.family_id),
           s.ceiling_s * 1000),
         'sprint'
  from z
  join sprint_sessions s on s.class_id = p_class_id and s.student_id = p_student_id
  join sprint_attempts a on a.session_id = s.id and not a.reask;
$$;

create or replace function fact_sprint_families(
  p_class_id uuid, p_student_id uuid, p_rev text, p_grammar integer, p_year integer)
returns table (
  family_id          text,
  name               text,
  ord                integer,
  criterion_s        numeric,
  strategy           jsonb,
  label              text,     -- fluent | slow | needs_strategy | not_judged
  accuracy_bar       boolean,  -- ever met
  fluency_bar        boolean,  -- ever met
  mode               text,     -- review | practice | strategy
  work_rank          integer,  -- the order families are worked in
  working            boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with rev as (
    select * from fact_scope_revision
     where registry_rev = p_rev and fact_grammar_rev = p_grammar
  ),
  scope as (
    select f.family_id, f.name, f.ord, f.criterion_s, f.strategy,
           -- family_groups order, then the group's own family order; a
           -- revision without groups falls back to the registry order.
           coalesce(
             (select (g.gi * 1000 + m.mi)::integer
                from rev r,
                     jsonb_array_elements(r.family_groups) with ordinality g(grp, gi),
                     jsonb_array_elements_text(g.grp->'families') with ordinality m(fid, mi)
               where m.fid = f.family_id
               limit 1),
             1000000 + f.ord) as group_pos
    from rev r
    join fact_scope_family f
      on f.registry_rev = r.registry_rev and f.fact_grammar_rev = r.fact_grammar_rev
    where (r.year_scope -> p_year::text -> 'cumulative') ? f.family_id
  ),
  -- The student's latest check in this class that they took part in.
  latest as (
    select p.id as probe_id, s.id as session_id, p.accuracy_threshold, p.facts_met_threshold,
           p.families
    from class_probes p
    join practice_sessions s on s.probe_id = p.id and s.student_id = p_student_id
    where p.class_id = p_class_id and p.closed_at is not null
    order by p.opened_at desc, p.id
    limit 1
  ),
  checked as (
    -- 0046's per-family label, for this one student.
    select pf.f->>'family_id' as family_id,
           case
             when count(j.seq) filter (where j.judgment <> 'interrupted')
                    < (pf.f->>'min_items')::integer then 'not_judged'
             when (count(j.seq) filter (where j.judgment in ('met', 'slow', 'unjudged')))::numeric
                    / count(j.seq) filter (where j.judgment <> 'interrupted')
                    < l.accuracy_threshold then 'needs_strategy'
             when (count(j.seq) filter (where j.judgment = 'met'))::numeric
                    / count(j.seq) filter (where j.judgment <> 'interrupted')
                    >= l.facts_met_threshold then 'fluent'
             else 'slow'
           end as label
    from latest l
    cross join lateral jsonb_array_elements(l.families) pf(f)
    left join lateral fact_probe_judged(l.probe_id, p_student_id) j
      on j.session_id = l.session_id and j.family_id = pf.f->>'family_id'
    group by pf.f, l.accuracy_threshold, l.facts_met_threshold
  ),
  setting as (
    select (r.sprint->>'sprint_max_misses')::integer as max_misses,
           (r.sprint->>'sprint_working_families')::integer as working_n,
           r.practice_window as win
    from rev r
  ),
  -- The sprint's first asks per family, in order, with rolling windows.
  -- A window function's frame cannot take its size from a column, so the
  -- rolling counts are taken as differences of running totals instead.
  running as (
    select g.family_id,
           row_number() over w as rn,
           sum((g.judgment not in ('met', 'slow', 'unjudged'))::integer) over w as cum_not_correct,
           sum((g.judgment <> 'met')::integer) over w as cum_not_met
    from fact_sprint_log(p_class_id, p_student_id) g
    where g.source = 'sprint' and g.judgment <> 'interrupted'
    window w as (partition by g.family_id order by g.at, g.seq, g.fact_id)
  ),
  windows as (
    select a.family_id, a.rn,
           a.cum_not_correct - coalesce(b.cum_not_correct, 0) as not_correct,
           a.cum_not_met - coalesce(b.cum_not_met, 0) as not_met
    from running a
    cross join setting st
    left join running b on b.family_id = a.family_id and b.rn = a.rn - st.win
    where a.rn >= st.win
  ),
  bars as (
    select w.family_id,
           bool_or(w.not_correct <= st.max_misses) as accuracy_bar,
           bool_or(w.not_met <= st.max_misses) as fluency_bar,
           -- the FIRST full window, for a NOT JUDGED family (SP-8)
           bool_or(w.rn = st.win and w.not_correct > st.max_misses) as first_failed,
           bool_or(w.rn > st.win and w.not_correct <= st.max_misses) as passed_later
    from windows w cross join setting st
    group by w.family_id
  ),
  moded as (
    select sc.*,
           coalesce(c.label, 'not_judged') as label,
           coalesce(b.accuracy_bar, false) as accuracy_bar,
           coalesce(b.fluency_bar, false) as fluency_bar,
           case
             when coalesce(c.label, 'not_judged') = 'fluent' or coalesce(b.fluency_bar, false)
               then 'review'
             when c.label = 'needs_strategy' and not coalesce(b.accuracy_bar, false)
               then 'strategy'
             when coalesce(c.label, 'not_judged') = 'not_judged'
                  and coalesce(b.first_failed, false) and not coalesce(b.passed_later, false)
               then 'strategy'
             else 'practice'
           end as mode
    from scope sc
    left join checked c on c.family_id = sc.family_id
    left join bars b on b.family_id = sc.family_id
  ),
  ranked as (
    select m.*,
           (row_number() over (
              order by (m.mode = 'review'),
                       (not (m.mode = 'strategy' or m.label = 'needs_strategy')),
                       m.group_pos, m.ord))::integer as work_rank
    from moded m
  )
  select r.family_id, r.name, r.ord, r.criterion_s, r.strategy, r.label,
         r.accuracy_bar, r.fluency_bar, r.mode, r.work_rank,
         (r.mode <> 'review' and r.work_rank <= (select working_n from setting)) as working
  from ranked r;
$$;

-- §C — grants (create or replace kept §B's; §A is a new signature)
revoke execute on function fact_probe_judged(uuid, uuid) from public, anon, authenticated;
grant  execute on function fact_probe_judged(uuid, uuid) to service_role;
