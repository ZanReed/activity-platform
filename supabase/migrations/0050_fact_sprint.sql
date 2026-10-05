-- =============================================================================
-- 0050_fact_sprint.sql — the daily number-facts practice ("the sprint"): the
--                        engine (D43 slice 2, build slice 2 of 4)
-- -----------------------------------------------------------------------------
-- docs/design/practice-blocks.md → "Slice 2, the sprint: design pass" (the
-- author's rulings SP-1 to SP-14, 2026-10-06; the pedagogy half is recorded on
-- the curriculum side — quote their decision log, not this). "Sprint" is the
-- design's word and this schema's.
--
--   §A  audit actions
--   §B  classes.fact_sprint_on_at; sprint_sessions / sprint_attempts — RLS
--       forced, NO policy: every read and write goes through definer RPCs
--   §C  fact_attempt_judgment — the judgment of ONE attempt, as a pure
--       function (bonded to fact_probe_judged by verify-0050)
--   §D  fact_sprint_log — the student's attempt log in a class: the checks'
--       attempts, then the sprint's first asks
--   §E  fact_sprint_families / fact_sprint_state — every DERIVED thing: the
--       family's label, mode and bars; each fact's step and due day
--   §F  fact_sprint_build — today's list
--   §G  the client RPCs: set_fact_sprint, fact_sprint_entry,
--       save_sprint_attempts
--   §H  prune_fact_practice and purge_soft_deleted gain the sprint's tables
--   §I  grants
--
-- ⚠ THIS MIGRATION ADDS STUDENT-DERIVED PERSONAL DATA of the kind 0045 added
-- (per-fact response times, typed answers, typing baselines), collected
-- DAILY rather than once. data-map.md and retention-policy.md move in this
-- commit.
--
-- THE SERVER CHOOSES AND JUDGES (ER-6 kept). A session's list, answers
-- included, is built by §F and stored on the session row; the save derives
-- `correct` from that row. A client sends an item number, whether it is the
-- re-ask, what was typed, a time, an offset and a modality.
--
-- FACTS ARE STORED, STATE IS DERIVED (ER-7 kept). There is no mastery table.
-- A fact's step, a family's mode, the two bars and the personal best are
-- computed from attempts by §E every time. Every judgment of an attempt uses
-- the parameters copied onto ITS OWN row's parent (the check or the session)
-- at the time, so a later registry revision never re-judges old work.
--
-- THE RULES §E ENCODES (SP-5 to SP-10, SP-13):
--   step      number of distinct practice days with a `met` first ask since
--             the fact's last miss (and not on that miss's own day), capped
--             at the number of intervals. A miss is wrong, skipped or
--             timeout. `slow`, `unjudged` and `interrupted` change nothing.
--             Re-asks are recorded and derive nothing.
--   due       step 0: every session. Step s: its last step-up day plus
--             sprint_step_intervals[s] CALENDAR days in the class teacher's
--             timezone.
--   label     the family's label on the student's latest check in the class
--             (0046's rule); no reading there is NOT JUDGED.
--   bars      over the last practice_window first asks on a family that were
--             not interrupted: accuracy = at most sprint_max_misses not
--             correct; fluency = at most that many not quick and right. A
--             bar needs a FULL window, and once met it stays met.
--   mode      FLUENT label, or the fluency bar met → review (its facts keep
--             their own schedule). NEEDS STRATEGY → strategy until the
--             accuracy bar is met, then practice. SLOW → practice. NOT JUDGED
--             → practice; if its FIRST full window fails the accuracy bar,
--             strategy until a later window meets it.
--   working   the first sprint_working_families families not in review:
--             strategy mode or a NEEDS STRATEGY label first, then
--             family_groups order, then the group's family order.
--   a FLUENT family's facts that were never missed start at
--             sprint_mastered_step and are spot-checked under the new-fact
--             cap, in a stable per-student order; only the sprint's own
--             `met` days raise them.
--
-- NO SCHEDULED JOB. Nothing here runs on a timer.
--
-- DEPENDS ON 0049 (the mirror's sprint column). A class's sprint cannot be
-- switched on until a registry revision carrying the seven keys is mirrored.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. audit actions
-- -----------------------------------------------------------------------------
alter type audit_action add value if not exists 'fact_sprint.on';
alter type audit_action add value if not exists 'fact_sprint.off';

-- -----------------------------------------------------------------------------
-- B. tables
-- -----------------------------------------------------------------------------
-- SP-2: the teacher's switch. NULL is off.
alter table classes add column fact_sprint_on_at timestamptz;

comment on column classes.fact_sprint_on_at is
  'When the class''s daily number-facts practice was switched on (0050, SP-2); NULL is off. Written only by set_fact_sprint.';

create table sprint_sessions (
  id                   uuid primary key default gen_random_uuid(),
  class_id             uuid not null references classes(id) on delete cascade,
  student_id           uuid not null references users(id) on delete cascade,
  -- The day in the class teacher's timezone, and which session of that day.
  practice_day         date not null,
  ordinal              integer not null check (ordinal >= 1),
  -- Fixed at start, like a check's parameters:
  year_level           integer not null check (year_level between 7 and 10),
  registry_rev         text not null,
  fact_grammar_rev     integer not null,
  ceiling_s            numeric not null check (ceiling_s > 0),
  practice_window      integer not null check (practice_window > 0),
  sprint               jsonb not null check (fact_scope_sprint_ok(sprint)),
  -- [{family_id, name, ord, criterion_s, label, mode, show_strategy, strategy}]
  -- — every family with a fact in this session.
  families             jsonb not null check (jsonb_typeof(families) = 'array'),
  -- [{n, fact_id, family_id, kind, shown, display, spoken, answer}] in the
  -- order asked. `kind` is review | learning | new | spot.
  items                jsonb not null check (jsonb_typeof(items) = 'array'),
  item_count           integer not null check (item_count > 0),
  -- Milliseconds per keystroke: reused from the student's latest baseline in
  -- this class when there is one, else from this session's warm-up.
  baseline_keyboard_ms integer check (baseline_keyboard_ms between 1 and 60000),
  baseline_keypad_ms   integer check (baseline_keypad_ms between 1 and 60000),
  app_build            text check (length(app_build) <= 64),
  started_at           timestamptz not null default now(),
  last_saved_at        timestamptz not null default now(),
  finished_at          timestamptz,
  -- SP-3 with RP-1/RP-3/RP-8: the class's school-year end + 30 days, at most
  -- 400 days after the session.
  keep_until           date not null,
  foreign key (registry_rev, fact_grammar_rev)
    references fact_scope_revision (registry_rev, fact_grammar_rev),
  unique (class_id, student_id, practice_day, ordinal)
);

create index sprint_sessions_student_idx on sprint_sessions (student_id);

comment on table sprint_sessions is
  'One student''s daily number-facts practice session in a class (0050): the list the server chose, the settings fixed at start, typing baselines. STUDENT-DERIVED personal data; removed with the school year (SP-3). Written only by fact_sprint_entry and save_sprint_attempts.';

create table sprint_attempts (
  session_id  uuid not null references sprint_sessions(id) on delete cascade,
  -- The item number in the session's list. A missed item may be asked ONCE
  -- more in the same session (SP-11): that row has reask = true.
  seq         integer not null check (seq >= 1),
  reask       boolean not null default false,
  -- Carried on the row so the data-map guard sees the table that holds
  -- response times, and so the purge can count what it deletes (ER-17).
  student_id  uuid not null references users(id) on delete cascade,
  -- Filled by the server from the session's list, never by the client:
  fact_id     text not null,
  family_id   text not null,
  shown       text not null check (shown in ('canonical', 'swapped')),
  correct     boolean not null,
  -- Client-reported facts about the attempt:
  typed       text not null check (length(typed) <= 8 and typed ~ '^-?[0-9]*\.?[0-9]*$'),
  skipped     boolean not null,
  interrupted boolean not null,
  rt_ms       integer not null check (rt_ms between 1 and 3600000),
  offset_ms   integer not null check (offset_ms between 0 and 86400000),
  modality    text check (modality in ('keyboard', 'keypad', 'mixed')),
  saved_at    timestamptz not null default now(),
  primary key (session_id, seq, reask),
  check (not (skipped and interrupted))
);

create index sprint_attempts_student_idx on sprint_attempts (student_id);

comment on table sprint_attempts is
  'One answered, skipped or interrupted fact in a daily practice session (0050): what was typed, whether it was right, the response time. STUDENT-DERIVED personal data. Facts only — steps, modes and bars are derived by fact_sprint_state and fact_sprint_families. Written only by save_sprint_attempts.';

alter table sprint_sessions enable row level security;
alter table sprint_sessions force row level security;
alter table sprint_attempts enable row level security;
alter table sprint_attempts force row level security;
-- NO policies on either (ER-8).

-- -----------------------------------------------------------------------------
-- C. fact_attempt_judgment — one attempt, judged
-- -----------------------------------------------------------------------------
-- ⚠ BOND: this is fact_probe_judged's CASE (0045 §D) as a pure function, with
-- the same net-time rule: raw time minus the baseline per keystroke × the
-- keystrokes (every character typed, plus Enter unless skipped or
-- interrupted); the baseline is the attempt's own input method's, else the
-- other one's. 0045 is applied and immutable, so the bond is held by
-- verify-0050 §B, which judges the same rows through both and compares. If
-- either changes, the other changes in the same migration.
create or replace function fact_attempt_judgment(
  p_rt_ms integer, p_typed text, p_skipped boolean, p_interrupted boolean,
  p_correct boolean, p_modality text, p_baseline_keyboard integer,
  p_baseline_keypad integer, p_criterion_ms numeric, p_ceiling_ms numeric)
returns text
language sql
immutable
set search_path = public
as $$
  select case
           when p_interrupted           then 'interrupted'
           when p_skipped               then 'skipped'
           when x.net_ms > p_ceiling_ms then 'timeout'
           when not p_correct           then 'wrong'
           when x.net_ms <= p_criterion_ms then 'met'
           when x.b is null             then 'unjudged'
           else 'slow'
         end
  from (
    select b.b,
           greatest(0, p_rt_ms - coalesce(b.b, 0)
             * (length(p_typed) + case when p_skipped or p_interrupted then 0 else 1 end))::numeric
             as net_ms
    from (select case p_modality
                   when 'keypad' then coalesce(p_baseline_keypad, p_baseline_keyboard)
                   else               coalesce(p_baseline_keyboard, p_baseline_keypad)
                 end as b) b
  ) x;
$$;

-- The class's practice day: the teacher's timezone (0036), else the platform
-- default. An unknown zone name falls back rather than failing a student.
create or replace function fact_class_zone(p_class_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select u.timezone from classes c join users u on u.id = c.teacher_id
      where c.id = p_class_id
        and exists (select 1 from pg_timezone_names z where z.name = u.timezone)),
    analytics_default_zone());
$$;

-- -----------------------------------------------------------------------------
-- D. fact_sprint_log — the student's attempts in a class, judged
-- -----------------------------------------------------------------------------
-- The checks' attempts (SP-6: they seed the log) and the sprint's FIRST asks.
-- Re-asks are stored and never appear here. Each row is judged under its own
-- parent's parameters.
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
  join lateral fact_probe_judged(p.id) j on j.session_id = s.id
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

-- -----------------------------------------------------------------------------
-- E. the derived state
-- -----------------------------------------------------------------------------
-- E1. fact_sprint_families — one row per family in the year's scope: its
-- label from the latest check, the two bars, its mode, and whether it is one
-- of the working families today.
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
    left join lateral fact_probe_judged(l.probe_id) j
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

-- E2. fact_sprint_state — one row per fact in the year's scope: whether it has
-- been seen, its step, and the day it is next due (NULL = not on a schedule:
-- step 0, or never asked).
create or replace function fact_sprint_state(
  p_class_id uuid, p_student_id uuid, p_rev text, p_grammar integer, p_year integer)
returns table (
  fact_id      text,
  family_id    text,
  fact_ord     integer,
  seen         boolean,   -- any counted attempt, check or sprint
  asked        boolean,   -- any counted attempt in the SPRINT
  missed       boolean,   -- ever missed
  step         integer,
  due_day      date
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
  setting as (
    select (r.sprint->>'sprint_mastered_step')::integer as mastered,
           jsonb_array_length(r.sprint->'sprint_step_intervals') as top,
           r.sprint->'sprint_step_intervals' as intervals
    from rev r
  ),
  fam as (
    select * from fact_sprint_families(p_class_id, p_student_id, p_rev, p_grammar, p_year)
  ),
  facts as (
    select x.fact_id, x.family_id, x.ord as fact_ord, f.label
    from fam f
    join fact_scope_fact x
      on x.registry_rev = p_rev and x.fact_grammar_rev = p_grammar and x.family_id = f.family_id
  ),
  log as (
    select * from fact_sprint_log(p_class_id, p_student_id) g where g.judgment <> 'interrupted'
  ),
  miss as (
    select l.fact_id, max(l.at) as last_miss_at
    from log l
    where l.judgment in ('wrong', 'skipped', 'timeout')
    group by l.fact_id
  ),
  -- The last miss's own day never raises the fact (SP-11: the re-ask "can
  -- raise nothing that day"; and a first ask later that day cannot either).
  missday as (
    select m.fact_id, m.last_miss_at, (select l.day from log l
                                        where l.fact_id = m.fact_id and l.at = m.last_miss_at
                                        limit 1) as last_miss_day
    from miss m
  ),
  ups as (
    select l.fact_id,
           -- every `met` day since the last miss
           count(distinct l.day) as up_days,
           -- the same, from the sprint only (a FLUENT family's rule)
           count(distinct l.day) filter (where l.source = 'sprint') as sprint_up_days,
           max(l.day) as last_up_day,
           max(l.day) filter (where l.source = 'sprint') as last_sprint_up_day
    from log l
    left join missday m on m.fact_id = l.fact_id
    where l.judgment = 'met'
      and (m.fact_id is null or (l.at > m.last_miss_at and l.day <> m.last_miss_day))
    group by l.fact_id
  ),
  seenrows as (
    select l.fact_id, true as seen, bool_or(l.source = 'sprint') as asked,
           min(l.day) filter (where l.source = 'sprint') as first_asked_day
    from log l group by l.fact_id
  ),
  stepped as (
    select fx.fact_id, fx.family_id, fx.fact_ord,
           coalesce(sr.seen, false) as seen,
           coalesce(sr.asked, false) as asked,
           (m.fact_id is not null) as missed,
           case
             -- a FLUENT family's never-missed facts start at the mastered step
             when fx.label = 'fluent' and m.fact_id is null
               then least(st.top, st.mastered + coalesce(u.sprint_up_days, 0))
             else least(st.top, coalesce(u.up_days, 0))
           end::integer as step,
           -- A FLUENT family's fact that has been asked but not yet answered
           -- quick and right is on the schedule from the day it was first
           -- asked, so it comes back; one never asked is a spot-check (§F).
           case
             when fx.label = 'fluent' and m.fact_id is null
               then coalesce(u.last_sprint_up_day, sr.first_asked_day)
             else u.last_up_day
           end as up_day,
           st.intervals
    from facts fx
    cross join setting st
    left join seenrows sr on sr.fact_id = fx.fact_id
    left join missday m on m.fact_id = fx.fact_id
    left join ups u on u.fact_id = fx.fact_id
  )
  select s.fact_id, s.family_id, s.fact_ord, s.seen, s.asked, s.missed, s.step,
         case when s.step >= 1 and s.up_day is not null
              then s.up_day + ((s.intervals ->> (s.step - 1))::integer)
         end
  from stepped s;
$$;

-- -----------------------------------------------------------------------------
-- F. fact_sprint_build — today's list, before it is numbered
-- -----------------------------------------------------------------------------
-- In order of claim on the session (SP-13, SP-7):
--   review    a fact on a schedule whose due day has come
--   learning  a seen fact at step 0, in a working family or in a review
--             family (a review that went wrong comes back)
--   new       never seen, in a working family: the first
--             sprint_new_facts_per_session by working order then the
--             registry's fact order
--   spot      a FLUENT family's never-asked, never-missed fact, taking what
--             is left of the new-fact cap, in a stable per-student order
-- At most c_max_items facts (a platform safety cap, not a teaching value: the
-- time box ends a session long before it).
create or replace function fact_sprint_build(
  p_class_id uuid, p_student_id uuid, p_rev text, p_grammar integer, p_year integer,
  p_today date)
returns table (fact_id text, family_id text, kind text, pick integer)
language sql
stable
security definer
set search_path = public
as $$
  with fam as (
    select * from fact_sprint_families(p_class_id, p_student_id, p_rev, p_grammar, p_year)
  ),
  st as (
    select * from fact_sprint_state(p_class_id, p_student_id, p_rev, p_grammar, p_year)
  ),
  cap as (
    select (sprint->>'sprint_new_facts_per_session')::integer as new_n
    from fact_scope_revision where registry_rev = p_rev and fact_grammar_rev = p_grammar
  ),
  review as (
    select s.fact_id, s.family_id, 'review'::text as kind,
           row_number() over (order by s.due_day, md5(p_student_id::text || ':' || s.fact_id)) as k
    from st s
    where s.due_day is not null and s.due_day <= p_today
  ),
  learning as (
    select s.fact_id, s.family_id, 'learning'::text as kind,
           row_number() over (order by f.work_rank, s.fact_ord) as k
    from st s join fam f on f.family_id = s.family_id
    where s.seen and s.step = 0 and (f.working or f.mode = 'review')
  ),
  fresh as (
    select s.fact_id, s.family_id, 'new'::text as kind,
           row_number() over (order by f.work_rank, s.fact_ord) as k
    from st s join fam f on f.family_id = s.family_id
    where not s.seen and f.working
  ),
  fresh_cut as (
    select * from fresh where k <= (select new_n from cap)
  ),
  spot as (
    select s.fact_id, s.family_id, 'spot'::text as kind,
           row_number() over (order by md5(p_student_id::text || ':' || s.fact_id)) as k
    from st s join fam f on f.family_id = s.family_id
    where f.label = 'fluent' and not s.asked and not s.missed
  ),
  spot_cut as (
    select * from spot
    where k <= greatest(0, (select new_n from cap) - (select count(*) from fresh_cut))
  ),
  allrows as (
    select 1 as tier, * from review
    union all select 2, * from learning
    union all select 3, * from fresh_cut
    union all select 4, * from spot_cut
  )
  select a.fact_id, a.family_id, a.kind,
         (row_number() over (order by a.tier, a.k))::integer
  from allrows a
  order by a.tier, a.k
  limit 200;
$$;

-- -----------------------------------------------------------------------------
-- G. the client RPCs
-- -----------------------------------------------------------------------------

-- G0. What a class's sprint would run on, or why it cannot: the latest
-- mirrored revision (it must carry the sprint's keys) and the year level of
-- the class's latest closed check (SP-2).
create or replace function fact_sprint_basis(p_class_id uuid)
returns table (reason text, registry_rev text, fact_grammar_rev integer, year_level integer)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_rev   fact_scope_revision%rowtype;
  v_year  integer;
  v_ends  date;
begin
  select school_year_ends_on into v_ends from classes where id = p_class_id;
  select * into v_rev from fact_scope_revision
  order by mirrored_at desc, registry_rev desc, fact_grammar_rev desc
  limit 1;
  select p.year_level into v_year from class_probes p
   where p.class_id = p_class_id and p.closed_at is not null
   order by p.opened_at desc, p.id
   limit 1;

  return query select
    case
      when v_year is null                        then 'no_closed_check'
      when v_rev.registry_rev is null or v_rev.sprint is null
                                                 then 'sprint_settings_not_mirrored'
      when not (v_rev.year_scope ? v_year::text) then 'year_not_available'
      when v_ends is null                        then 'school_year_end_missing'
      when v_ends < current_date                 then 'school_year_ended'
    end,
    v_rev.registry_rev, v_rev.fact_grammar_rev, v_year;
end;
$$;

-- G1. set_fact_sprint — the teacher's switch (SP-2). On needs one closed
-- check, a registry revision with the sprint's settings, and a school-year
-- end that has not passed; off needs nothing. Errors, by name:
-- not_class_teacher, and fact_sprint_basis's reasons.
create or replace function set_fact_sprint(p_class_id uuid, p_on boolean)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_reason text;
  v_was    timestamptz;
begin
  if auth.uid() is null or p_class_id is null or p_on is null
     or not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;

  select fact_sprint_on_at into v_was from classes where id = p_class_id for update;

  if p_on then
    select b.reason into v_reason from fact_sprint_basis(p_class_id) b;
    if v_reason is not null then
      raise exception '%', v_reason;
    end if;
    if v_was is null then
      update classes set fact_sprint_on_at = now(), updated_at = now() where id = p_class_id;
      insert into audit_log (actor_id, action, target_type, target_id, metadata)
      values (auth.uid(), 'fact_sprint.on', 'class', p_class_id, '{}'::jsonb);
    end if;
  elsif v_was is not null then
    update classes set fact_sprint_on_at = null, updated_at = now() where id = p_class_id;
    insert into audit_log (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'fact_sprint.off', 'class', p_class_id,
            jsonb_build_object('on_since', v_was));
  end if;

  return jsonb_build_object(
    'on', p_on,
    'on_at', (select fact_sprint_on_at from classes where id = p_class_id));
end;
$$;

-- The quick-and-right count of one session (its first asks), and the
-- student's best over their OTHER finished sessions in the class (SP-14).
create or replace function fact_sprint_score(p_session_id uuid)
returns table (quick_right integer, best_before integer)
language sql
stable
security definer
set search_path = public
as $$
  with scored as (
    select s.id, s.finished_at,
           count(a.seq) filter (where fact_attempt_judgment(
             a.rt_ms, a.typed, a.skipped, a.interrupted, a.correct, a.modality,
             s.baseline_keyboard_ms, s.baseline_keypad_ms,
             (select (f->>'criterion_s')::numeric * 1000
                from jsonb_array_elements(s.families) f
               where f->>'family_id' = a.family_id),
             s.ceiling_s * 1000) = 'met') as n
    from sprint_sessions me
    join sprint_sessions s on s.class_id = me.class_id and s.student_id = me.student_id
    left join sprint_attempts a on a.session_id = s.id and not a.reask
    where me.id = p_session_id
    group by s.id, s.finished_at
  )
  select (select n from scored where id = p_session_id)::integer,
         (select max(n) from scored where id <> p_session_id and finished_at is not null)::integer;
$$;

-- What a client needs to run a session: the list, the strategies to show, the
-- settings, the baselines, and what is already saved.
create or replace function fact_sprint_payload(p_session_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'session_id',  s.id,
    'minutes',     (s.sprint->>'sprint_minutes')::numeric,
    'reask_gap',   (s.sprint->>'sprint_reask_gap')::integer,
    'ceiling_s',   s.ceiling_s,
    'total',       s.item_count,
    'baselines',   jsonb_build_object('keyboard', s.baseline_keyboard_ms,
                                      'keypad',   s.baseline_keypad_ms),
    'families', (select coalesce(jsonb_agg(jsonb_build_object(
                          'family_id', f->>'family_id', 'name', f->>'name',
                          'mode', f->>'mode', 'show_strategy', (f->>'show_strategy')::boolean,
                          'strategy', f->'strategy')
                        order by (f->>'ord')::integer), '[]'::jsonb)
                   from jsonb_array_elements(s.families) f),
    'items', (select jsonb_agg(jsonb_build_object(
                       'n', (i->>'n')::integer, 'family_id', i->>'family_id',
                       'display', i->>'display', 'spoken', i->>'spoken', 'answer', i->>'answer')
                     order by (i->>'n')::integer)
                from jsonb_array_elements(s.items) i),
    'saved', (select coalesce(jsonb_agg(jsonb_build_object(
                       'n', a.seq, 'reask', a.reask,
                       'missed', (not a.correct and not a.interrupted))
                     order by a.seq, a.reask), '[]'::jsonb)
                from sprint_attempts a where a.session_id = s.id),
    'best_before', (select best_before from fact_sprint_score(s.id)))
  from sprint_sessions s where s.id = p_session_id;
$$;

-- G2. fact_sprint_entry — the student's way in (SP-1). With p_start false it
-- reports; with p_start true it also STARTS today's session when there is
-- something to practise. States:
--   teacher       the caller is a teacher
--   not_member    no such class, or not in it
--   off           the class's practice is off (or cannot run: no closed
--                 check, no settings mirrored, the school year has ended)
--   resume        today's unfinished session (always returned, started or not)
--   nothing_due   nothing to practise now
--   ready         something to practise; `due` says how many facts. With
--                 p_start true the session is created and returned.
-- `done_today` is the number of sessions finished today; `best` the student's
-- best quick-and-right count so far.
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
  select max(q.quick_right) into v_best
    from sprint_sessions s cross join lateral fact_sprint_score(s.id) q
   where s.class_id = v_class.id and s.student_id = v_uid and s.finished_at is not null;
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

-- G3. save_sprint_attempts — idempotent on (session, item number, re-ask);
-- the first write wins. Correctness is derived from the session's list by
-- numeric equality (CR-18). A re-ask is accepted only for an item whose
-- first ask was missed (not correct, not interrupted) — SP-11. A session
-- takes saves for a day after it started; after that it answers `closed` and
-- writes nothing. Errors, by name: not_signed_in, not_your_session, malformed.
create or replace function save_sprint_attempts(
  p_session_id uuid, p_attempts jsonb, p_baselines jsonb default null,
  p_finished boolean default false, p_app_build text default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_s       sprint_sessions%rowtype;
  v_n       integer;
  v_saved   integer;
  v_score   record;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  select * into v_s from sprint_sessions where id = p_session_id for update;
  if v_s.id is null or v_s.student_id <> v_uid then
    raise exception 'not_your_session' using errcode = '42501';
  end if;

  if now() > v_s.started_at + interval '1 day' then
    select count(*) into v_saved from sprint_attempts where session_id = v_s.id;
    return jsonb_build_object('state', 'closed', 'saved', v_saved);
  end if;

  if p_attempts is null then p_attempts := '[]'::jsonb; end if;
  if jsonb_typeof(p_attempts) <> 'array'
     or jsonb_array_length(p_attempts) > v_s.item_count * 2
     or (jsonb_array_length(p_attempts) = 0 and not coalesce(p_finished, false)) then
    raise exception 'malformed';
  end if;

  select count(*) into v_n
  from jsonb_array_elements(p_attempts) a
  where not coalesce((
    case when jsonb_typeof(a) = 'object'
          and jsonb_typeof(a->'n') = 'number'
          and (a->>'n')::numeric = trunc((a->>'n')::numeric)
          and (a->>'n')::numeric between 1 and v_s.item_count
          and jsonb_typeof(a->'reask') = 'boolean'
          and jsonb_typeof(a->'typed') = 'string'
          and length(a->>'typed') <= 8
          and (a->>'typed') ~ '^-?[0-9]*\.?[0-9]*$'
          and jsonb_typeof(a->'skipped') = 'boolean'
          and jsonb_typeof(a->'interrupted') = 'boolean'
          and not ((a->>'skipped')::boolean and (a->>'interrupted')::boolean)
          and jsonb_typeof(a->'rt_ms') = 'number'
          and (a->>'rt_ms')::numeric = trunc((a->>'rt_ms')::numeric)
          and (a->>'rt_ms')::numeric between 1 and 3600000
          and jsonb_typeof(a->'offset_ms') = 'number'
          and (a->>'offset_ms')::numeric = trunc((a->>'offset_ms')::numeric)
          and (a->>'offset_ms')::numeric between 0 and 86400000
          and (a->'modality' is null or jsonb_typeof(a->'modality') = 'null'
               or a->>'modality' in ('keyboard', 'keypad', 'mixed'))
          and ((a->>'skipped')::boolean or (a->>'interrupted')::boolean
               or (a->>'typed') ~ '[0-9]')
         then true else false end), false);
  if v_n > 0 then
    raise exception 'malformed';
  end if;

  if p_baselines is not null and jsonb_typeof(p_baselines) <> 'null' then
    if jsonb_typeof(p_baselines) <> 'object'
       or exists (select 1 from jsonb_object_keys(p_baselines) k where k not in ('keyboard', 'keypad'))
       or exists (select 1 from jsonb_each(p_baselines) e
                   where jsonb_typeof(e.value) not in ('number', 'null')
                      or (jsonb_typeof(e.value) = 'number'
                          and ((e.value #>> '{}')::numeric <> trunc((e.value #>> '{}')::numeric)
                               or (e.value #>> '{}')::numeric not between 1 and 60000))) then
      raise exception 'malformed';
    end if;
  end if;

  with incoming as (
    select (a->>'n')::integer as n, (a->>'reask')::boolean as reask, a->>'typed' as typed,
           (a->>'skipped')::boolean as skipped, (a->>'interrupted')::boolean as interrupted,
           (a->>'rt_ms')::integer as rt_ms, (a->>'offset_ms')::integer as offset_ms,
           nullif(a->>'modality', '') as modality,
           i.item
    from jsonb_array_elements(p_attempts) a
    join lateral (select it as item from jsonb_array_elements(v_s.items) it
                   where (it->>'n')::integer = (a->>'n')::integer) i on true
  ),
  judged as (
    select inc.*,
           case
             when inc.skipped then false
             when inc.typed ~ '^-?([0-9]+\.?[0-9]*|\.[0-9]+)$'
               then inc.typed::numeric = (inc.item->>'answer')::numeric
             else false
           end as correct
    from incoming inc
  )
  insert into sprint_attempts (
    session_id, seq, reask, student_id, fact_id, family_id, shown, correct,
    typed, skipped, interrupted, rt_ms, offset_ms, modality)
  select v_s.id, j.n, j.reask, v_uid, j.item->>'fact_id', j.item->>'family_id',
         j.item->>'shown', j.correct, j.typed, j.skipped, j.interrupted,
         j.rt_ms, j.offset_ms, j.modality
  from judged j
  -- First asks before re-asks, so a re-ask in the same batch finds its miss.
  where not j.reask
  order by j.n
  on conflict (session_id, seq, reask) do nothing;

  with incoming as (
    select (a->>'n')::integer as n, a->>'typed' as typed,
           (a->>'skipped')::boolean as skipped, (a->>'interrupted')::boolean as interrupted,
           (a->>'rt_ms')::integer as rt_ms, (a->>'offset_ms')::integer as offset_ms,
           nullif(a->>'modality', '') as modality,
           i.item
    from jsonb_array_elements(p_attempts) a
    join lateral (select it as item from jsonb_array_elements(v_s.items) it
                   where (it->>'n')::integer = (a->>'n')::integer) i on true
    where (a->>'reask')::boolean
  )
  insert into sprint_attempts (
    session_id, seq, reask, student_id, fact_id, family_id, shown, correct,
    typed, skipped, interrupted, rt_ms, offset_ms, modality)
  select v_s.id, inc.n, true, v_uid, inc.item->>'fact_id', inc.item->>'family_id',
         inc.item->>'shown',
         case
           when inc.skipped then false
           when inc.typed ~ '^-?([0-9]+\.?[0-9]*|\.[0-9]+)$'
             then inc.typed::numeric = (inc.item->>'answer')::numeric
           else false
         end,
         inc.typed, inc.skipped, inc.interrupted, inc.rt_ms, inc.offset_ms, inc.modality
  from incoming inc
  -- SP-11: only a MISSED item is asked again; anything else is dropped.
  where exists (select 1 from sprint_attempts first
                 where first.session_id = v_s.id and first.seq = inc.n
                   and not first.reask and not first.correct and not first.interrupted)
  on conflict (session_id, seq, reask) do nothing;

  update sprint_sessions
     set last_saved_at = now(),
         finished_at = case when coalesce(p_finished, false)
                            then coalesce(finished_at, now()) else finished_at end,
         -- First write wins, per input method.
         baseline_keyboard_ms = coalesce(baseline_keyboard_ms, (p_baselines->>'keyboard')::integer),
         baseline_keypad_ms   = coalesce(baseline_keypad_ms, (p_baselines->>'keypad')::integer),
         app_build = coalesce(app_build, left(p_app_build, 64))
   where id = v_s.id;

  select count(*) into v_saved from sprint_attempts where session_id = v_s.id;
  select * into v_score from fact_sprint_score(v_s.id);

  return jsonb_build_object(
    'state', 'saved', 'saved', v_saved,
    'finished', (select finished_at is not null from sprint_sessions where id = v_s.id),
    'quick_right', v_score.quick_right,
    'best_before', v_score.best_before);
end;
$$;

-- -----------------------------------------------------------------------------
-- H. the two deleters gain the sprint's tables
-- -----------------------------------------------------------------------------
-- H1. prune_fact_practice — 0048's body plus the sprint's sessions (SP-3).
-- STILL dry-run by default, service-role only and UNSCHEDULED; arming is the
-- same checklist (TODOS). The report gains sprint_sessions and
-- sprint_attempts; its other keys mean what they meant. An armed run writes
-- one fact_practice.prune audit row per class for the sprint's rows.
create or replace function prune_fact_practice(p_dry_run boolean default true)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_probe     record;
  v_ids       uuid[];
  v_by_year   integer := 0;
  v_by_class  integer := 0;
  v_sessions  integer := 0;
  v_attempts  integer := 0;
  v_s         integer;
  v_a         integer;
  v_class     record;
  v_sp_ids    uuid[];
  v_sp_s      integer := 0;
  v_sp_a      integer := 0;
begin
  -- (0050) The sprint's sessions past their own keep_until, or in a class
  -- deleted more than 30 days ago. A session has no class result to keep, so
  -- the whole row goes with its attempts. One taking saves is never touched.
  select array_agg(s.id) into v_sp_ids
    from sprint_sessions s
    join classes c on c.id = s.class_id
   where s.started_at < now() - interval '1 day'
     and (s.keep_until < current_date or c.deleted_at < now() - interval '30 days');
  if v_sp_ids is not null then
    select count(*) into v_sp_a from sprint_attempts where session_id = any (v_sp_ids);
    v_sp_s := cardinality(v_sp_ids);
  end if;

  select array_agg(p.id order by p.opened_at, p.id),
         count(*) filter (where p.keep_until < current_date),
         count(*) filter (where not (p.keep_until < current_date))
    into v_ids, v_by_year, v_by_class
    from class_probes p
    join classes c on c.id = p.class_id
   where p.pruned_at is null                                             -- 1
     and (p.closed_at is not null or p.closes_at <= now())               -- 2
     and (p.keep_until < current_date                                    -- 3
          or c.deleted_at < now() - interval '30 days');

  if not p_dry_run and v_sp_ids is not null then
    for v_class in
      select s.class_id, count(*) as n,
             (select count(*) from sprint_attempts a
               where a.session_id in (select id from sprint_sessions x
                                       where x.class_id = s.class_id and x.id = any (v_sp_ids))) as att
        from sprint_sessions s where s.id = any (v_sp_ids)
       group by s.class_id
    loop
      insert into audit_log (actor_id, action, target_type, target_id, metadata)
      values (null, 'fact_practice.prune', 'class', v_class.class_id,
              jsonb_build_object('kind', 'sprint', 'sessions', v_class.n, 'attempts', v_class.att));
    end loop;
    delete from sprint_attempts where session_id = any (v_sp_ids);
    delete from sprint_sessions where id = any (v_sp_ids);
  end if;

  if v_ids is null then
    return jsonb_build_object('dry_run', p_dry_run, 'checks', 0, 'by_year_end', 0,
                              'by_class_deleted', 0, 'sessions', 0, 'attempts', 0,
                              'sprint_sessions', v_sp_s, 'sprint_attempts', v_sp_a);
  end if;

  if p_dry_run then
    select count(distinct s.id), count(a.seq)
      into v_sessions, v_attempts
      from practice_sessions s
      left join fact_attempts a on a.session_id = s.id
     where s.probe_id = any (v_ids);
    return jsonb_build_object('dry_run', true, 'checks', cardinality(v_ids),
                              'by_year_end', v_by_year, 'by_class_deleted', v_by_class,
                              'sessions', v_sessions, 'attempts', v_attempts,
                              'sprint_sessions', v_sp_s, 'sprint_attempts', v_sp_a);
  end if;

  for v_probe in
    select p.id, p.class_id, p.closed_at, p.keep_until
      from class_probes p where p.id = any (v_ids)
     order by p.opened_at, p.id
       for update
  loop
    if v_probe.closed_at is null then
      perform finalise_fact_probe(v_probe.id, true);
    end if;

    delete from fact_attempts a
     using practice_sessions s
     where a.session_id = s.id and s.probe_id = v_probe.id;
    get diagnostics v_a = row_count;
    delete from practice_sessions where probe_id = v_probe.id;
    get diagnostics v_s = row_count;

    update class_probes set pruned_at = now() where id = v_probe.id;

    insert into audit_log (actor_id, action, target_type, target_id, metadata)
    values (null, 'fact_practice.prune', 'class_probe', v_probe.id,
            jsonb_build_object('class_id', v_probe.class_id, 'keep_until', v_probe.keep_until,
                               'reason', case when v_probe.keep_until < current_date
                                              then 'year_end' else 'class_deleted' end,
                               'sessions', v_s, 'attempts', v_a));
    v_sessions := v_sessions + v_s;
    v_attempts := v_attempts + v_a;
  end loop;

  return jsonb_build_object('dry_run', false, 'checks', cardinality(v_ids),
                            'by_year_end', v_by_year, 'by_class_deleted', v_by_class,
                            'sessions', v_sessions, 'attempts', v_attempts,
                            'sprint_sessions', v_sp_s, 'sprint_attempts', v_sp_a);
end;
$$;

-- H2. purge_soft_deleted v6 — 0045's body plus a COUNTED delete of the
-- sprint's rows, for an explicitly-deleted account past its window and for a
-- dormant student (ER-16). The ledger note and the NOTICE gain the two counts.
create or replace function purge_soft_deleted()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_checks_activity int;
  v_checks_student  int;
  v_accounts        int := 0;
  v_blocked         int := 0;
  v_uid             uuid;
  v_boundary        timestamptz := analytics_rolled_boundary();
  v_unrolled        int := 0;
  v_practice_attempts int := 0;
  v_practice_sessions int := 0;
  v_sprint_attempts   int := 0;
  v_sprint_sessions   int := 0;
  v_n               int;
begin
  -- Count the unrolled rows this run is about to destroy, BEFORE destroying
  -- them (finding 4 / OV-6): both delete predicates below, restricted to rows
  -- the rollup has not recorded.
  select count(*) into v_unrolled
    from section_checks sc
   where sc.created_at >= coalesce(v_boundary, '-infinity'::timestamptz)
     and (sc.activity_id in (select id from activities
                              where deleted_at < now() - interval '30 days')
       or sc.activity_version_id in (select av.id from activity_versions av
                                       join activities a on a.id = av.activity_id
                                      where a.deleted_at < now() - interval '30 days')
       or sc.student_id in (select id from users
                             where deleted_at < now() - interval '30 days'));

  -- 1. Section checks belonging to purge-eligible ACTIVITIES.
  --    MUST precede the activity_versions delete: activity_version_id is
  --    ON DELETE RESTRICT and would otherwise abort the entire run (0022).
  delete from section_checks
   where activity_id in (
           select id from activities
            where deleted_at < now() - interval '30 days'
         )
      or activity_version_id in (
           select av.id from activity_versions av
             join activities a on a.id = av.activity_id
            where a.deleted_at < now() - interval '30 days'
         );
  get diagnostics v_checks_activity = row_count;

  -- 2. Submissions linked to deleted assignments (frozen table, empty since
  --    0029; kept as-is — see 0029's "what deliberately survives").
  delete from submissions
    where assignment_id in (
      select id from assignments where deleted_at < now() - interval '30 days'
    );

  -- 3. Assignments themselves
  delete from assignments where deleted_at < now() - interval '30 days';

  -- 4. Activity versions of deleted activities
  delete from activity_versions
    where activity_id in (
      select id from activities where deleted_at < now() - interval '30 days'
    );

  -- 5. Activities themselves (check_rollup_daily / check_item_rollup_daily
  --    CASCADE from here — R1: the aggregates die with the activity).
  delete from activities where deleted_at < now() - interval '30 days';

  -- 6. Section checks belonging to explicitly-deleted accounts past their
  --    window. Explicit rather than riding the FK cascade, so destroying
  --    student work is a counted act (2026-08-04 finding).
  delete from section_checks sc
   where sc.student_id in (
     select u.id from users u
      where u.deleted_at < now() - interval '30 days'
   );
  get diagnostics v_checks_student = row_count;

  -- 6b. (0045, ER-16) Practice data of explicitly-deleted accounts past their
  --     window: fact attempts, then the sessions that hold the typing
  --     baselines. Explicit and COUNTED for the same reason as step 6 — it
  --     would otherwise ride the FK cascade unseen. Unlike retained section
  --     checks, practice data never BLOCKS an account purge (step 7).
  delete from fact_attempts fa
   where fa.student_id in (
     select u.id from users u
      where u.deleted_at < now() - interval '30 days'
   );
  get diagnostics v_practice_attempts = row_count;
  delete from practice_sessions ps
   where ps.student_id in (
     select u.id from users u
      where u.deleted_at < now() - interval '30 days'
   );
  get diagnostics v_practice_sessions = row_count;

  -- 6c. (0050) The same for the daily practice's rows.
  delete from sprint_attempts sa
   where sa.student_id in (
     select u.id from users u
      where u.deleted_at < now() - interval '30 days'
   );
  get diagnostics v_sprint_attempts = row_count;
  delete from sprint_sessions ss
   where ss.student_id in (
     select u.id from users u
      where u.deleted_at < now() - interval '30 days'
   );
  get diagnostics v_sprint_sessions = row_count;

  -- 7. Accounts. TWO independent ways in, then the 0023 precedence applies to
  --    both: eligible only once no work is retained and nothing else
  --    references the row.
  for v_uid in
    select u.id
      from users u
     where (u.deleted_at < now() - interval '30 days')
        or (
             u.role = 'student'
             and not exists (
               select 1
                 from class_members cm
                 join classes c on c.id = cm.class_id
                where cm.student_id = u.id
                  and cm.removed_at is null
                  and c.deleted_at is null
             )
             and coalesce(
                   (select max(greatest(cm.removed_at, c.deleted_at))
                      from class_members cm
                      join classes c on c.id = cm.class_id
                     where cm.student_id = u.id),
                   u.created_at
                 ) < now() - interval '400 days'
           )
     order by u.created_at
  loop
    -- 0034: the `grades` blocker is GONE with the table. check_grades does not
    -- replace it — graded_by is SET NULL, so a grader's purge anonymizes the
    -- grade instead of being blocked by it.
    if exists (select 1 from section_checks   x where x.student_id = v_uid)
    or exists (select 1 from activities       x where x.owner_id   = v_uid)
    or exists (select 1 from activity_versions x where x.created_by = v_uid)
    or exists (select 1 from assignments      x where x.teacher_id = v_uid)
    or exists (select 1 from classes          x where x.teacher_id = v_uid
                                                   or x.age_assertion_by = v_uid)
    or exists (select 1 from allowlist        x where x.added_by   = v_uid)
    or exists (select 1 from student_domain   x where x.added_by   = v_uid)
    then
      v_blocked := v_blocked + 1;
      continue;
    end if;

    -- (0045) A DORMANT student reaches here with practice data still held
    -- (step 6b covers only explicitly-deleted accounts). Delete it
    -- explicitly so it is counted, not swept by the cascade below.
    delete from fact_attempts where student_id = v_uid;
    get diagnostics v_n = row_count;
    v_practice_attempts := v_practice_attempts + v_n;
    delete from practice_sessions where student_id = v_uid;
    get diagnostics v_n = row_count;
    v_practice_sessions := v_practice_sessions + v_n;
    delete from sprint_attempts where student_id = v_uid;
    get diagnostics v_n = row_count;
    v_sprint_attempts := v_sprint_attempts + v_n;
    delete from sprint_sessions where student_id = v_uid;
    get diagnostics v_n = row_count;
    v_sprint_sessions := v_sprint_sessions + v_n;

    -- Mark this actor's audit rows BEFORE the delete (0024): afterwards
    -- SET NULL has fired and actor_id no longer identifies them.
    update audit_log
       set metadata = coalesce(metadata, '{}'::jsonb)
                      || jsonb_build_object('actor_purged', true)
     where actor_id = v_uid;

    delete from auth.users where id = v_uid;
    v_accounts := v_accounts + 1;
  end loop;

  -- The durable half of finding 4: a job_name='purge' ledger row. The NOTICE
  -- below stays for the cron log; this row is what a screen can read.
  insert into analytics_job_runs (
    job_name, section_check_rows, purge_unrolled_destroyed, notes
  )
  values (
    'purge',
    (select count(*) from section_checks),
    v_unrolled,
    format('checks purged %s by activity, %s by student; accounts purged %s, blocked %s; practice purged %s attempts, %s sessions; sprint purged %s attempts, %s sessions',
           v_checks_activity, v_checks_student, v_accounts, v_blocked,
           v_practice_attempts, v_practice_sessions,
           v_sprint_attempts, v_sprint_sessions)
  );

  raise notice
    'purge_soft_deleted: section_checks %+% (activity/student), accounts purged %, accounts blocked %, practice attempts %, practice sessions %, sprint attempts %, sprint sessions %',
    v_checks_activity, v_checks_student, v_accounts, v_blocked,
    v_practice_attempts, v_practice_sessions, v_sprint_attempts, v_sprint_sessions;
end;
$$;
revoke execute on function purge_soft_deleted() from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- I. grants
-- -----------------------------------------------------------------------------
revoke all on table sprint_sessions from anon, authenticated;
revoke all on table sprint_attempts from anon, authenticated;
grant  select on table sprint_sessions to service_role;
grant  select on table sprint_attempts to service_role;

-- Internal: reachable only from the definer RPCs.
revoke execute on function fact_attempt_judgment(integer, text, boolean, boolean, boolean, text, integer, integer, numeric, numeric) from public, anon, authenticated;
revoke execute on function fact_class_zone(uuid)                                  from public, anon, authenticated;
revoke execute on function fact_sprint_log(uuid, uuid)                            from public, anon, authenticated;
revoke execute on function fact_sprint_families(uuid, uuid, text, integer, integer) from public, anon, authenticated;
revoke execute on function fact_sprint_state(uuid, uuid, text, integer, integer)  from public, anon, authenticated;
revoke execute on function fact_sprint_build(uuid, uuid, text, integer, integer, date) from public, anon, authenticated;
revoke execute on function fact_sprint_basis(uuid)                                from public, anon, authenticated;
revoke execute on function fact_sprint_score(uuid)                                from public, anon, authenticated;
revoke execute on function fact_sprint_payload(uuid)                              from public, anon, authenticated;
grant  execute on function fact_attempt_judgment(integer, text, boolean, boolean, boolean, text, integer, integer, numeric, numeric) to service_role;
grant  execute on function fact_class_zone(uuid)                                  to service_role;
grant  execute on function fact_sprint_log(uuid, uuid)                            to service_role;
grant  execute on function fact_sprint_families(uuid, uuid, text, integer, integer) to service_role;
grant  execute on function fact_sprint_state(uuid, uuid, text, integer, integer)  to service_role;
grant  execute on function fact_sprint_build(uuid, uuid, text, integer, integer, date) to service_role;
grant  execute on function fact_sprint_basis(uuid)                                to service_role;
grant  execute on function fact_sprint_score(uuid)                                to service_role;
grant  execute on function fact_sprint_payload(uuid)                              to service_role;

-- A deletion primitive over student work is never client-callable (0009).
revoke execute on function prune_fact_practice(boolean) from public, anon, authenticated;
grant  execute on function prune_fact_practice(boolean) to service_role;

-- Client-callable, each by a signed-in user.
revoke execute on function set_fact_sprint(uuid, boolean)   from public, anon;
grant  execute on function set_fact_sprint(uuid, boolean)   to authenticated, service_role;
revoke execute on function fact_sprint_entry(text, boolean) from public, anon;
grant  execute on function fact_sprint_entry(text, boolean) to authenticated, service_role;
revoke execute on function save_sprint_attempts(uuid, jsonb, jsonb, boolean, text) from public, anon;
grant  execute on function save_sprint_attempts(uuid, jsonb, jsonb, boolean, text) to authenticated, service_role;

-- =============================================================================
-- Verification lives in scripts/verify-0050.sql (registered in the verify
-- runner): catalog posture; the judgment bond with fact_probe_judged; the
-- switch's refusals; labels and modes; steps, due days and the one-step-a-day
-- and miss rules; the list (reviews, learning, the new-fact cap, spot-checks,
-- the working pair); start, resume and a second session; the save
-- (idempotence, malformed payloads, the re-ask rule, another student's
-- session); the bars; the strategy shown once; the score; and the prune's and
-- the purge's counted deletes.
-- =============================================================================
