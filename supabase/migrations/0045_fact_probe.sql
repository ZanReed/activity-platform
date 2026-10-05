-- =============================================================================
-- 0045_fact_probe.sql — the class-entry number-facts check (D43 slice 1)
-- -----------------------------------------------------------------------------
-- docs/design/practice-blocks.md, slice 1: rulings ER-1–26, DR-1–24, CR-1–24
-- and the build rulings S-1–S-7 (author, 2026-10-05). "Probe" is the design's
-- word and this schema's; it never renders in the product (DR-5).
--
--   §A  audit actions
--   §B  class_probes / practice_sessions / fact_attempts — RLS forced, NO
--       policy: every read and write goes through the definer RPCs below (ER-8)
--   §C  fact_probe_allocate — how many items each family gets (their items
--       20, 22)
--   §D  fact_probe_judged / fact_probe_stat — the ONE place judgments are
--       derived (ER-7): stored rows are facts, never judgments
--   §E  finalise_fact_probe — the idempotent close (ER-9)
--   §F  the client RPCs: open_fact_probe, close_fact_probe, fact_probe_entry,
--       save_fact_attempts, fact_probe_results, fact_probe_overview
--   §G  purge_soft_deleted v5 — 0036's body plus a COUNTED delete of practice
--       data (ER-16)
--   §H  grants
--
-- ⚠ THIS MIGRATION ADDS STUDENT-DERIVED PERSONAL DATA: per-student response
-- times, typed answers and typing baselines. docs/compliance/data-map.md and
-- retention-policy.md move in this commit (CLAUDE.md's compliance rule).
--
-- THE TRUST MODEL (premise 3 as narrowed by ER-6). Timing, offset and input
-- modality are client-reported and unverifiable; that is accepted because
-- nothing here is a grade. CORRECTNESS is not taken from the client: the item
-- list, answers included, is materialised on the probe row at open, and
-- save_fact_attempts derives `correct` from it by numeric equality (CR-18). A
-- client sends only an item number, what was typed, a time, an offset and a
-- modality, so a fact outside the probe's list cannot be submitted.
--
-- FACTS ARE STORED, JUDGMENTS ARE DERIVED (ER-7). met / slow / wrong /
-- skipped / timeout / unjudged / interrupted exist only in §D's output. The
-- parameters every judgment reads (criteria, ceiling, thresholds, k and the
-- floor computed from it) are COPIED onto the probe row at open, so a later
-- registry revision never re-judges an old probe.
--
-- NO SCHEDULED JOB (ER-9). A probe past `closes_at` is closed BY RULE in every
-- function; its snapshot is written by whichever comes first of the teacher's
-- close, the teacher's next read (results or overview) or the next open on
-- that class — all through §E.
--
-- CLOSE AND SAVE CANNOT INTERLEAVE WRONGLY. A save holds FOR SHARE on the
-- probe row and reads its state under that lock; a close takes FOR UPDATE. So
-- a close waits for saves in flight and then snapshots them, and a save that
-- starts after a close sees it closed and writes nothing (ER-10).
--
-- DEPENDS ON 0044 (the fact-scope mirror). Apply 0044 and mirror a registry
-- revision first; open_fact_probe raises `fact_scope_not_mirrored` otherwise.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. audit actions (ER-24)
-- -----------------------------------------------------------------------------
alter type audit_action add value if not exists 'fact_probe.open';
alter type audit_action add value if not exists 'fact_probe.close';

-- -----------------------------------------------------------------------------
-- B. tables
-- -----------------------------------------------------------------------------
create table class_probes (
  id                   uuid primary key default gen_random_uuid(),
  class_id             uuid not null references classes(id) on delete cascade,
  -- SET NULL: purging one teacher never deletes a class's probe (ER-16).
  opened_by            uuid references users(id) on delete set null,
  opened_at            timestamptz not null default now(),
  -- Closed by rule from here on (ER-9); 7 days after opening (ER-23).
  closes_at            timestamptz not null,
  closed_at            timestamptz,
  auto_closed          boolean not null default false,
  -- "Facts up to Year N" (ER-14); probes exist for Years 7–10 (their item 28).
  year_level           integer not null check (year_level between 7 and 10),
  registry_rev         text not null,
  fact_grammar_rev     integer not null,
  -- Parameters fixed at open. Curriculum-owned graph keys, mirrored (0044):
  floor_factor_k       numeric not null check (floor_factor_k > 0),
  ceiling_s            numeric not null check (ceiling_s > 0),
  accuracy_threshold   numeric not null,
  facts_met_threshold  numeric not null,
  min_items_per_family integer not null,
  -- The floor, computed at open from THIS probe's item list (CR-5):
  -- k × 60 × Σ n_f ÷ Σ (n_f × t_f), in correct answers per minute.
  floor_per_min        numeric not null check (floor_per_min > 0),
  -- The platform's own minimums (ER-3, ER-23, CR-8):
  min_students         integer not null check (min_students > 0),
  min_attempts         integer not null check (min_attempts > 0),
  min_counted_s        integer not null check (min_counted_s > 0),
  -- [{family_id, name, ord, criterion_s, n_items, min_items}] — the criteria
  -- copied at open, and each family's minimum (5 or its fact count).
  families             jsonb not null check (jsonb_typeof(families) = 'array'),
  -- [{n, fact_id, family_id, shown, display, spoken, answer}] in the order
  -- shown (ER-6). `shown` is 'canonical' or 'swapped' (a turnaround pair).
  items                jsonb not null check (jsonb_typeof(items) = 'array'),
  item_count           integer not null check (item_count > 0),
  -- The class verdict, written once at close and never recomputed. It holds
  -- counts and a median only — NO student identity (ER-18).
  snapshot             jsonb,
  foreign key (registry_rev, fact_grammar_rev)
    references fact_scope_revision (registry_rev, fact_grammar_rev),
  check (closes_at > opened_at),
  check ((closed_at is null) = (snapshot is null))
);

-- At most one probe per class that has not been finalised.
create unique index class_probes_one_open on class_probes (class_id) where closed_at is null;
create index class_probes_class_idx on class_probes (class_id, opened_at desc);

comment on table class_probes is
  'One number-facts check opened for a class (0045, D43 slice 1): the item list, the parameters fixed at open and the class verdict snapshotted at close. Holds no student identity; kept for the life of the class (ER-18). Written only by definer RPCs.';

create table practice_sessions (
  id                   uuid primary key default gen_random_uuid(),
  probe_id             uuid not null references class_probes(id) on delete cascade,
  student_id           uuid not null references users(id) on delete cascade,
  class_id             uuid not null references classes(id) on delete cascade,
  -- Milliseconds per keystroke from the warm-up, one per modality (CR-1, S-6).
  baseline_keyboard_ms integer check (baseline_keyboard_ms between 1 and 60000),
  baseline_keypad_ms   integer check (baseline_keypad_ms between 1 and 60000),
  app_build            text check (length(app_build) <= 64),
  -- The server's time of the first save (the trust model).
  started_at           timestamptz not null default now(),
  last_saved_at        timestamptz not null default now(),
  finished_at          timestamptz,
  -- No client key (ER-11): a reload resumes; two tabs write to one session.
  unique (probe_id, student_id)
);

create index practice_sessions_student_idx on practice_sessions (student_id);

comment on table practice_sessions is
  'One student''s run of one number-facts check (0045): typing baselines, app build, start and finish. STUDENT-DERIVED personal data; pruned with its attempts (ER-18). Written only by save_fact_attempts.';

create table fact_attempts (
  session_id  uuid not null references practice_sessions(id) on delete cascade,
  -- The item number in the probe's list; with session_id, the primary key, so
  -- a session can never hold more rows than the probe has items.
  seq         integer not null check (seq >= 1),
  -- Carried on the row (ER-17) so the data-map guard sees the table that holds
  -- response times, and so the purge can count what it deletes.
  student_id  uuid not null references users(id) on delete cascade,
  -- Filled by the server from the probe's item list, never by the client:
  fact_id     text not null,
  shown       text not null check (shown in ('canonical', 'swapped')),
  correct     boolean not null,
  -- Client-reported facts about the attempt:
  typed       text not null check (length(typed) <= 8 and typed ~ '^-?[0-9]*\.?[0-9]*$'),
  skipped     boolean not null,
  interrupted boolean not null,
  rt_ms       integer not null check (rt_ms between 1 and 3600000),
  offset_ms   integer not null check (offset_ms between 0 and 604800000),
  modality    text check (modality in ('keyboard', 'keypad', 'mixed')),
  saved_at    timestamptz not null default now(),
  primary key (session_id, seq),
  check (not (skipped and interrupted))
);

create index fact_attempts_student_idx on fact_attempts (student_id);

comment on table fact_attempts is
  'One answered, skipped or interrupted fact in a practice session (0045): what was typed, whether it was right, the response time. STUDENT-DERIVED personal data. Facts only — judgments are derived by fact_probe_judged. Written only by save_fact_attempts.';

alter table class_probes      enable row level security;
alter table class_probes      force row level security;
alter table practice_sessions enable row level security;
alter table practice_sessions force row level security;
alter table fact_attempts     enable row level security;
alter table fact_attempts     force row level security;
-- NO policies on any of the three (ER-8): a student reads an open probe only
-- through fact_probe_entry, a teacher only through the results functions.

-- -----------------------------------------------------------------------------
-- C. fact_probe_allocate — the share of items per family
-- -----------------------------------------------------------------------------
-- Their items 20 and 22: the probe's length is the larger of 30 and
-- min_items × the families in scope; it is shared out BY WEIGHT, rounded so
-- the total is exact (largest remainder); a family with fewer facts than its
-- share contributes all of them and the rest is shared among the others by
-- weight; and a family's minimum is min_items or its fact count, whichever is
-- smaller. Ties break by the registry's family order. Deterministic.
--
-- The minimum is applied LAST, taking one item at a time from the family
-- furthest above its own minimum. With today's equal weights every family
-- already sits at or above it and that pass does nothing.
create or replace function fact_probe_allocate(p_rev text, p_grammar integer, p_year integer)
returns table (family_id text, n_items integer)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_ids     text[];
  v_w       numeric[];
  v_cap     integer[];
  v_min     integer[];
  v_n       integer[];
  v_frac    numeric[];
  v_capped  boolean[];
  v_count   integer;
  v_minimum integer;
  v_len     integer;
  v_rest    numeric;
  v_wsum    numeric;
  v_changed boolean;
  v_total   integer := 0;
  v_left    integer;
  v_best    integer;
  i         integer;
  j         integer;
begin
  select array_agg(f.family_id order by f.ord),
         array_agg(f.weight order by f.ord),
         array_agg(f.fact_count order by f.ord),
         max(r.min_items_per_family)
    into v_ids, v_w, v_cap, v_minimum
  from fact_scope_revision r
  join fact_scope_family f
    on f.registry_rev = r.registry_rev and f.fact_grammar_rev = r.fact_grammar_rev
  where r.registry_rev = p_rev and r.fact_grammar_rev = p_grammar
    and (r.year_scope -> p_year::text -> 'cumulative') ? f.family_id;

  v_count := coalesce(array_length(v_ids, 1), 0);
  if v_count = 0 then return; end if;

  -- Never ask for more items than there are facts.
  v_len := least(greatest(30, v_minimum * v_count),
                 (select sum(c)::integer from unnest(v_cap) c));

  for i in 1..v_count loop
    v_n[i] := 0;
    v_frac[i] := -1;
    v_capped[i] := false;
    v_min[i] := least(v_minimum, v_cap[i]);
  end loop;

  -- Cap every family whose share would exceed its facts, and re-share.
  loop
    v_changed := false;
    v_rest := v_len;
    v_wsum := 0;
    for i in 1..v_count loop
      if v_capped[i] then v_rest := v_rest - v_cap[i]; else v_wsum := v_wsum + v_w[i]; end if;
    end loop;
    exit when v_wsum = 0;
    for i in 1..v_count loop
      if not v_capped[i] and v_rest * v_w[i] / v_wsum > v_cap[i] then
        v_capped[i] := true;
        v_changed := true;
      end if;
    end loop;
    exit when not v_changed;
  end loop;

  -- Whole parts, then the largest remainders.
  for i in 1..v_count loop
    if v_capped[i] then
      v_n[i] := v_cap[i];
    else
      v_n[i] := floor(v_rest * v_w[i] / v_wsum);
      v_frac[i] := v_rest * v_w[i] / v_wsum - v_n[i];
    end if;
    v_total := v_total + v_n[i];
  end loop;
  v_left := v_len - v_total;
  while v_left > 0 loop
    v_best := null;
    for i in 1..v_count loop
      if not v_capped[i] and v_n[i] < v_cap[i]
         and (v_best is null or v_frac[i] > v_frac[v_best]) then
        v_best := i;
      end if;
    end loop;
    exit when v_best is null;
    v_n[v_best] := v_n[v_best] + 1;
    v_frac[v_best] := -1;
    v_left := v_left - 1;
  end loop;

  -- The per-family minimum, taken from whoever is furthest above theirs.
  for i in 1..v_count loop
    while v_n[i] < v_min[i] loop
      v_best := null;
      for j in 1..v_count loop
        if j <> i and v_n[j] > v_min[j]
           and (v_best is null or v_n[j] - v_min[j] >= v_n[v_best] - v_min[v_best]) then
          v_best := j;
        end if;
      end loop;
      exit when v_best is null;
      v_n[v_best] := v_n[v_best] - 1;
      v_n[i] := v_n[i] + 1;
    end loop;
  end loop;

  return query select v_ids[g], v_n[g] from generate_subscripts(v_ids, 1) g;
end;
$$;

-- -----------------------------------------------------------------------------
-- D. judgments and the statistic (ER-7)
-- -----------------------------------------------------------------------------
-- One row per stored attempt, with its derived judgment. Definitions, each
-- ruled (practice-blocks.md → "The measurement", "The statistic"):
--
--   keystrokes  = every character of the typed answer, plus one for Enter when
--                 it was submitted (not skipped, not interrupted)     CR-2, CR-19
--   baseline    = the session's baseline for the attempt's modality; else its
--                 OTHER baseline (the attempt is then flagged); a mixed attempt
--                 takes keyboard, else keypad, and is flagged         CR-3
--   net time    = raw time − baseline × keystrokes, never below zero;
--                 with no baseline at all, the raw time               item 14
--   interrupted = left out of every statistic                         DR-10
--   skipped     = counted, never correct                              G2
--   timeout     = net time over the ceiling: counted, NEVER correct,
--                 its time counted at the ceiling                     ER-1, CR-6, CR-10
--   wrong       = not correct
--   met         = correct and net time within the family's criterion
--   unjudged    = correct, over the criterion on RAW time, and the session
--                 has no baseline: cannot be judged; counts as not met CR-3
--   slow        = correct, over the criterion
--
-- "Correct" has ONE meaning everywhere (CR-6): met, slow or unjudged.
create or replace function fact_probe_judged(p_probe_id uuid)
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

-- The class statistic and the per-student rows, from fact_probe_judged. The
-- live view and the snapshot BOTH come from here (ER-7), so "the snapshot is
-- the live statistic at close" holds by construction.
--
--   a student has a RATE with at least min_attempts counted attempts OR
--     min_counted_s of counted (net) time                          ER-3, CR-8
--   rate      = correct ÷ counted net minutes                      item 14
--   accuracy  = correct ÷ counted attempts                         CR-6
--   group (only with a rate; ONE per student, CR-7; their item 13):
--     needs_strategy  accuracy below the accuracy threshold
--     fluent          else at least the facts-met share of counted attempts met
--     slow            otherwise
--   family (their item 23): met at the facts-met share of its counted items;
--     not_judged below the family's minimum; else not_met
--   class: the MEDIAN rate of current members who have a rate, against the
--     floor; below min_students with a rate there is no verdict     ER-23
--   A student removed from the class keeps their row and is left out of the
--   class numbers.
create or replace function fact_probe_stat(p_probe_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_probe    class_probes%rowtype;
  v_students jsonb;
  v_class    jsonb;
begin
  select * into v_probe from class_probes where id = p_probe_id;
  if v_probe.id is null then
    raise exception 'probe_not_found';
  end if;

  with j as (
    select * from fact_probe_judged(p_probe_id)
  ),
  per as (
    select j.session_id,
           count(*)                                                     as saved,
           count(*) filter (where j.judgment <> 'interrupted')          as counted,
           count(*) filter (where j.judgment = 'interrupted')           as not_counted,
           count(*) filter (where j.judgment in ('met', 'slow', 'unjudged')) as right_n,
           count(*) filter (where j.judgment = 'met')                   as met_n,
           count(*) filter (where j.judgment = 'skipped')               as skipped_n,
           coalesce(sum(j.counted_ms) filter (where j.judgment <> 'interrupted'), 0) as counted_ms,
           coalesce(bool_or(j.flagged) filter (where j.judgment <> 'interrupted'), false) as flagged
    from j
    group by j.session_id
  ),
  famrows as (
    select j.session_id, j.family_id,
           count(*) filter (where j.judgment <> 'interrupted') as counted,
           count(*) filter (where j.judgment = 'met')          as met_n
    from j
    group by j.session_id, j.family_id
  ),
  famjson as (
    select s.id as session_id,
           jsonb_agg(
             jsonb_build_object(
               'family_id', f->>'family_id',
               'name',      f->>'name',
               'counted',   coalesce(fr.counted, 0),
               'met',       coalesce(fr.met_n, 0),
               'status',    case
                              when coalesce(fr.counted, 0) < (f->>'min_items')::integer then 'not_judged'
                              when fr.met_n::numeric / fr.counted >= v_probe.facts_met_threshold then 'met'
                              else 'not_met'
                            end)
             order by (f->>'ord')::integer) as families
    from practice_sessions s
    cross join jsonb_array_elements(v_probe.families) f
    left join famrows fr on fr.session_id = s.id and fr.family_id = f->>'family_id'
    where s.probe_id = p_probe_id
    group by s.id
  ),
  people as (
    select coalesce(s.student_id, m.student_id) as student_id,
           s.id as session_id,
           s.finished_at,
           (m.student_id is not null) as is_member
    from (select * from practice_sessions where probe_id = p_probe_id) s
    full join (select cm.student_id from class_members cm
                where cm.class_id = v_probe.class_id and cm.removed_at is null) m
      on m.student_id = s.student_id
  ),
  shaped as (
    select pe.student_id, pe.is_member, pe.session_id, pe.finished_at,
           coalesce(nullif(btrim(u.display_name), ''), u.email, 'Unknown') as name,
           coalesce(per.saved, 0)       as saved,
           coalesce(per.counted, 0)     as counted,
           coalesce(per.not_counted, 0) as not_counted,
           coalesce(per.right_n, 0)     as right_n,
           coalesce(per.met_n, 0)       as met_n,
           coalesce(per.skipped_n, 0)   as skipped_n,
           coalesce(per.counted_ms, 0)  as counted_ms,
           coalesce(per.flagged, false) as flagged,
           fj.families,
           (coalesce(per.counted_ms, 0) > 0
             and (coalesce(per.counted, 0) >= v_probe.min_attempts
                  or coalesce(per.counted_ms, 0) >= v_probe.min_counted_s * 1000)) as has_rate
    from people pe
    left join users u on u.id = pe.student_id
    left join per on per.session_id = pe.session_id
    left join famjson fj on fj.session_id = pe.session_id
  ),
  rated as (
    select sh.*,
           case when sh.has_rate
                then round(sh.right_n / (sh.counted_ms / 60000.0), 2) end as rate,
           case
             when not sh.has_rate then null
             when sh.right_n::numeric / sh.counted < v_probe.accuracy_threshold then 'needs_strategy'
             when sh.met_n::numeric / sh.counted >= v_probe.facts_met_threshold then 'fluent'
             else 'slow'
           end as grp,
           case
             when sh.session_id is null then 'not_started'
             when sh.finished_at is not null or sh.saved >= v_probe.item_count then 'finished'
             else 'in_progress'
           end as status
    from shaped sh
  )
  select coalesce(jsonb_agg(
           jsonb_build_object(
             'student_id',  r.student_id,
             'name',        r.name,
             'is_member',   r.is_member,
             'status',      r.status,
             'done',        r.saved,
             'has_rate',    r.has_rate,
             'rate',        r.rate,
             'right',       r.right_n,
             'met',         r.met_n,
             'skipped',     r.skipped_n,
             'not_counted', r.not_counted,
             'counted',     r.counted,
             'group',       r.grp,
             'typing_flag', r.flagged and r.session_id is not null,
             'families',    coalesce(r.families, '[]'::jsonb))
           order by lower(r.name), r.student_id), '[]'::jsonb)
    into v_students
  from rated r;

  select jsonb_build_object(
           'in_class',  count(*) filter (where s.is_member),
           'started',   count(*) filter (where s.is_member and s.status <> 'not_started'),
           'finished',  count(*) filter (where s.is_member and s.status = 'finished'),
           'with_rate', count(*) filter (where s.is_member and s.has_rate),
           'left_out',  count(*) filter (where s.is_member and s.status <> 'not_started' and not s.has_rate),
           'median_rate',
             round((percentile_cont(0.5) within group (order by s.rate)
                      filter (where s.is_member and s.has_rate))::numeric, 2),
           'floor',     round(v_probe.floor_per_min, 2),
           'min_students', v_probe.min_students,
           'groups', jsonb_build_object(
             'fluent',         count(*) filter (where s.is_member and s."group" = 'fluent'),
             'slow',           count(*) filter (where s.is_member and s."group" = 'slow'),
             'needs_strategy', count(*) filter (where s.is_member and s."group" = 'needs_strategy')))
    into v_class
  from jsonb_to_recordset(v_students) as s(
    is_member boolean, status text, has_rate boolean, rate numeric, "group" text);

  v_class := v_class || jsonb_build_object(
    'verdict',
    case
      when (v_class->>'with_rate')::integer < v_probe.min_students then 'not_enough'
      when (v_class->>'median_rate')::numeric < round(v_probe.floor_per_min, 2) then 'below'
      else 'at_or_above'
    end);

  return jsonb_build_object('class', v_class, 'students', v_students);
end;
$$;

-- -----------------------------------------------------------------------------
-- E. finalise_fact_probe — the one idempotent close (ER-9)
-- -----------------------------------------------------------------------------
-- Takes FOR UPDATE on the probe row, so it waits for every save in flight
-- (they hold FOR SHARE) and then snapshots exactly the attempts saved before
-- the close. A second call returns the stored snapshot and writes nothing. A
-- probe past closes_at is closed AT closes_at and labelled automatic,
-- whoever's call got here first.
create or replace function finalise_fact_probe(p_probe_id uuid, p_auto boolean)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_probe    class_probes%rowtype;
  v_auto     boolean;
  v_snapshot jsonb;
begin
  select * into v_probe from class_probes where id = p_probe_id for update;
  if v_probe.id is null then
    raise exception 'probe_not_found';
  end if;
  if v_probe.closed_at is not null then
    return v_probe.snapshot;
  end if;

  v_auto := coalesce(p_auto, false) or v_probe.closes_at <= now();
  v_snapshot := (fact_probe_stat(p_probe_id)->'class')
    || jsonb_build_object('closed_by', case when v_auto then 'auto' else 'teacher' end);

  update class_probes
     set closed_at   = case when v_auto then closes_at else now() end,
         auto_closed = v_auto,
         snapshot    = v_snapshot
   where id = p_probe_id;

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'fact_probe.close', 'class_probe', p_probe_id,
          jsonb_build_object('class_id', v_probe.class_id, 'auto', v_auto,
                             'verdict', v_snapshot->>'verdict'));

  return v_snapshot;
end;
$$;

-- -----------------------------------------------------------------------------
-- F. the client RPCs
-- -----------------------------------------------------------------------------

-- F1. open_fact_probe — the teacher opens a check for "facts up to Year N".
-- Items are picked DETERMINISTICALLY from the probe's id (S-2): within a
-- family, facts ranked by md5(probe id : fact id); a turnaround pair's order
-- from one hash bit; then the whole list ordered by a second hash, so families
-- are MIXED (in blocks, fatigue would fall on whichever family came last).
-- Errors, by name: not_class_teacher, fact_scope_not_mirrored,
-- year_not_available, probe_already_open.
create or replace function open_fact_probe(p_class_id uuid, p_year_level integer)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_rev      fact_scope_revision%rowtype;
  v_id       uuid := gen_random_uuid();
  v_due      uuid;
  v_families jsonb;
  v_items    jsonb;
  v_count    integer;
  v_floor    numeric;
  v_closes   timestamptz := now() + interval '7 days';
begin
  if auth.uid() is null or p_class_id is null or not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;

  -- S-3: the most recently mirrored revision.
  select * into v_rev from fact_scope_revision
  order by mirrored_at desc, registry_rev desc, fact_grammar_rev desc
  limit 1;
  if v_rev.registry_rev is null then
    raise exception 'fact_scope_not_mirrored';
  end if;
  if p_year_level is null or p_year_level not between 7 and 10
     or not (v_rev.year_scope ? p_year_level::text) then
    raise exception 'year_not_available';
  end if;

  -- A probe past its closes_at is finalised first (ER-9).
  for v_due in
    select id from class_probes
     where class_id = p_class_id and closed_at is null and closes_at <= now()
  loop
    perform finalise_fact_probe(v_due, true);
  end loop;
  if exists (select 1 from class_probes where class_id = p_class_id and closed_at is null) then
    raise exception 'probe_already_open';
  end if;

  select jsonb_agg(
           jsonb_build_object(
             'family_id',   f.family_id,
             'name',        f.name,
             'ord',         f.ord,
             'criterion_s', f.criterion_s,
             'n_items',     a.n_items,
             'min_items',   least(v_rev.min_items_per_family, f.fact_count))
           order by f.ord),
         v_rev.floor_factor_k * 60 * sum(a.n_items) / sum(a.n_items * f.criterion_s)
    into v_families, v_floor
  from fact_probe_allocate(v_rev.registry_rev, v_rev.fact_grammar_rev, p_year_level) a
  join fact_scope_family f
    on f.registry_rev = v_rev.registry_rev and f.fact_grammar_rev = v_rev.fact_grammar_rev
   and f.family_id = a.family_id
  where a.n_items > 0;

  with alloc as (
    select * from fact_probe_allocate(v_rev.registry_rev, v_rev.fact_grammar_rev, p_year_level)
  ),
  ranked as (
    select x.fact_id, x.family_id, x.answer, x.display, x.spoken,
           x.display_swapped, x.spoken_swapped, a.n_items,
           row_number() over (
             partition by x.family_id
             order by md5(v_id::text || ':' || x.fact_id), x.fact_id) as rk
    from fact_scope_fact x
    join alloc a on a.family_id = x.family_id
    where x.registry_rev = v_rev.registry_rev and x.fact_grammar_rev = v_rev.fact_grammar_rev
  ),
  picked as (
    select r.*,
           (r.display_swapped is not null
             and get_byte(decode(md5(v_id::text || ':o:' || r.fact_id), 'hex'), 0) % 2 = 1) as swapped
    from ranked r
    where r.rk <= r.n_items
  ),
  numbered as (
    select pk.*,
           row_number() over (order by md5(v_id::text || ':s:' || pk.fact_id), pk.fact_id) as n
    from picked pk
  )
  select jsonb_agg(
           jsonb_build_object(
             'n',         nb.n,
             'fact_id',   nb.fact_id,
             'family_id', nb.family_id,
             'shown',     case when nb.swapped then 'swapped' else 'canonical' end,
             'display',   case when nb.swapped then nb.display_swapped else nb.display end,
             'spoken',    case when nb.swapped then nb.spoken_swapped else nb.spoken end,
             'answer',    nb.answer)
           order by nb.n),
         count(*)
    into v_items, v_count
  from numbered nb;

  if v_items is null or v_count = 0 then
    raise exception 'year_not_available';
  end if;

  begin
    insert into class_probes (
      id, class_id, opened_by, closes_at, year_level, registry_rev, fact_grammar_rev,
      floor_factor_k, ceiling_s, accuracy_threshold, facts_met_threshold,
      min_items_per_family, floor_per_min, min_students, min_attempts, min_counted_s,
      families, items, item_count)
    values (
      v_id, p_class_id, auth.uid(), v_closes, p_year_level,
      v_rev.registry_rev, v_rev.fact_grammar_rev,
      v_rev.floor_factor_k, v_rev.response_ceiling_s, v_rev.accuracy_threshold,
      v_rev.facts_met_threshold, v_rev.min_items_per_family, v_floor,
      5, 10, 60,
      v_families, v_items, v_count);
  exception when unique_violation then
    -- Two opens raced; the other one won.
    raise exception 'probe_already_open';
  end;

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'fact_probe.open', 'class_probe', v_id,
          jsonb_build_object('class_id', p_class_id, 'year_level', p_year_level,
                             'registry_rev', v_rev.registry_rev, 'item_count', v_count));

  return jsonb_build_object(
    'probe_id', v_id, 'year_level', p_year_level, 'item_count', v_count,
    'closes_at', v_closes, 'floor_per_min', round(v_floor, 2));
end;
$$;

-- F2. close_fact_probe — the teacher's close. Idempotent.
create or replace function close_fact_probe(p_probe_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_class uuid;
begin
  select class_id into v_class from class_probes where id = p_probe_id;
  if auth.uid() is null or v_class is null or not is_class_teacher(v_class) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  return finalise_fact_probe(p_probe_id, false);
end;
$$;

-- F3. fact_probe_entry — the student's ONE entry read, keyed by the class
-- JOIN CODE (DR-1). Returns a named state (ER-15, DR-15, DR-16):
--   teacher     a teacher or admin account ("This link is for students")
--   not_member  not a current member — also for a code that matches no class,
--               so the class's existence is not revealed before joining
--   none_open   nothing to do yet (the waiting room)
--   ready       an open check, not started: the item list
--   resume      an open check, part done: the item list and where to continue
--   finished    this student has finished it
--   closed      the teacher finished it while this student was part-way
-- It returns the student's OWN counts and never the class verdict (ER-8).
-- The item list carries each answer: a fact holds no secret (premise 3), and
-- the browser's own comparison feeds only its done screen.
create or replace function fact_probe_entry(p_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_user    users%rowtype;
  v_class   classes%rowtype;
  v_probe   class_probes%rowtype;
  v_session practice_sessions%rowtype;
  v_open    boolean;
  v_saved   integer := 0;
  v_next    integer := 1;
  v_counts  jsonb := jsonb_build_object('right', 0, 'skipped', 0, 'not_counted', 0);
  v_done    boolean;
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

  select * into v_probe from class_probes
   where class_id = v_class.id
   order by opened_at desc, id
   limit 1;
  if v_probe.id is null then
    return jsonb_build_object('state', 'none_open');
  end if;
  v_open := v_probe.closed_at is null and v_probe.closes_at > now();

  select * into v_session from practice_sessions
   where probe_id = v_probe.id and student_id = v_uid;
  if not v_open and v_session.id is null then
    return jsonb_build_object('state', 'none_open');
  end if;

  if v_session.id is not null then
    select count(*), coalesce(max(seq), 0) + 1 into v_saved, v_next
      from fact_attempts where session_id = v_session.id;
    select jsonb_build_object(
             'right',       count(*) filter (where j.judgment in ('met', 'slow', 'unjudged')),
             'skipped',     count(*) filter (where j.judgment = 'skipped'),
             'not_counted', count(*) filter (where j.judgment = 'interrupted'))
      into v_counts
      from fact_probe_judged(v_probe.id) j
     where j.session_id = v_session.id;
  end if;
  v_done := v_session.finished_at is not null or v_saved >= v_probe.item_count;

  if v_done or not v_open then
    return jsonb_build_object(
      'state', case when v_done then 'finished' else 'closed' end,
      'saved', v_saved, 'total', v_probe.item_count, 'counts', v_counts);
  end if;

  return jsonb_build_object(
    'state',     case when v_saved > 0 then 'resume' else 'ready' end,
    'probe_id',  v_probe.id,
    'total',     v_probe.item_count,
    'ceiling_s', v_probe.ceiling_s,
    'saved',     v_saved,
    'next_n',    v_next,
    'counts',    v_counts,
    'baselines', jsonb_build_object('keyboard', v_session.baseline_keyboard_ms,
                                    'keypad',   v_session.baseline_keypad_ms),
    'items', (select jsonb_agg(
                       jsonb_build_object('n', (i->>'n')::integer, 'display', i->>'display',
                                          'spoken', i->>'spoken', 'answer', i->>'answer')
                       order by (i->>'n')::integer)
                from jsonb_array_elements(v_probe.items) i));
end;
$$;

-- F4. save_fact_attempts — the idempotent save (G1, ER-19), keyed on
-- (session, item number): the first write for an item wins and a repeat is a
-- no-op, so a retry, a reload or a second tab can never double-count.
--   p_attempts  [{n, typed, skipped, interrupted, rt_ms, offset_ms, modality}]
--   p_baselines {keyboard, keypad} in ms per keystroke; first write wins
-- Returns {state: 'saved' | 'closed', saved, finished}. A save after the close
-- writes NOTHING and returns 'closed' (ER-10). A malformed payload raises
-- (ER-22, CR-17); a slow answer never does — a timeout is judged at read time.
create or replace function save_fact_attempts(
  p_probe_id  uuid,
  p_attempts  jsonb,
  p_baselines jsonb default null,
  p_finished  boolean default false,
  p_app_build text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_probe   class_probes%rowtype;
  v_session uuid;
  v_bk      integer;
  v_bp      integer;
  v_bad     integer;
  v_saved   integer;
  v_done    boolean;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  if p_attempts is null or jsonb_typeof(p_attempts) <> 'array' then
    raise exception 'malformed: attempts must be an array';
  end if;

  -- FOR SHARE: a close (FOR UPDATE) waits for this save, and this save sees a
  -- close that got there first.
  select * into v_probe from class_probes where id = p_probe_id for share;
  if v_probe.id is null or not exists (
       select 1 from class_members m
        where m.class_id = v_probe.class_id and m.student_id = v_uid and m.removed_at is null) then
    raise exception 'not_member' using errcode = '42501';
  end if;

  if v_probe.closed_at is not null or v_probe.closes_at <= now() then
    select count(*) into v_saved
      from fact_attempts a join practice_sessions s on s.id = a.session_id
     where s.probe_id = p_probe_id and s.student_id = v_uid;
    return jsonb_build_object('state', 'closed', 'saved', v_saved, 'finished', false);
  end if;

  if jsonb_array_length(p_attempts) > v_probe.item_count
     or (jsonb_array_length(p_attempts) = 0 and not coalesce(p_finished, false)) then
    raise exception 'malformed: wrong number of attempts';
  end if;

  -- CASE evaluates in order, so no cast runs on a value that failed its shape.
  select count(*) into v_bad
  from jsonb_array_elements(p_attempts) a
  where not (case
    when jsonb_typeof(a) <> 'object' then false
    when jsonb_typeof(a->'n') is distinct from 'number'
         or (a->>'n') !~ '^[0-9]{1,6}$' then false
    when (a->>'n')::integer not between 1 and v_probe.item_count then false
    when jsonb_typeof(a->'typed') is distinct from 'string'
         or length(a->>'typed') > 8
         or (a->>'typed') !~ '^-?[0-9]*\.?[0-9]*$' then false
    when jsonb_typeof(a->'rt_ms') is distinct from 'number'
         or (a->>'rt_ms') !~ '^[0-9]{1,9}$' then false
    when (a->>'rt_ms')::integer not between 1 and 3600000 then false
    when jsonb_typeof(a->'offset_ms') is distinct from 'number'
         or (a->>'offset_ms') !~ '^[0-9]{1,9}$' then false
    when (a->>'offset_ms')::integer > 604800000 then false
    when jsonb_typeof(a->'skipped') is distinct from 'boolean'
         or jsonb_typeof(a->'interrupted') is distinct from 'boolean' then false
    when (a->>'skipped')::boolean and (a->>'interrupted')::boolean then false
    when not (a->'modality' is null or jsonb_typeof(a->'modality') = 'null'
              or (jsonb_typeof(a->'modality') = 'string'
                  and a->>'modality' in ('keyboard', 'keypad', 'mixed'))) then false
    -- An answer submitted with Enter has at least one digit (DR-11).
    when not ((a->>'skipped')::boolean or (a->>'interrupted')::boolean
              or (a->>'typed') ~ '[0-9]') then false
    else true
  end);
  if v_bad > 0 then
    raise exception 'malformed: % attempt(s) refused', v_bad;
  end if;

  if p_baselines is not null and jsonb_typeof(p_baselines) <> 'null' then
    if jsonb_typeof(p_baselines) <> 'object'
       or exists (
         select 1 from jsonb_each(p_baselines) b
          where b.key not in ('keyboard', 'keypad')
             or not (jsonb_typeof(b.value) = 'null'
                     or (jsonb_typeof(b.value) = 'number'
                         and (b.value #>> '{}') ~ '^[0-9]{1,5}$'
                         and (b.value #>> '{}')::integer between 1 and 60000))) then
      raise exception 'malformed: baselines';
    end if;
    v_bk := (p_baselines->>'keyboard')::integer;
    v_bp := (p_baselines->>'keypad')::integer;
  end if;

  insert into practice_sessions (
    probe_id, student_id, class_id, baseline_keyboard_ms, baseline_keypad_ms,
    app_build, finished_at)
  values (
    p_probe_id, v_uid, v_probe.class_id, v_bk, v_bp,
    left(p_app_build, 64), case when coalesce(p_finished, false) then now() end)
  on conflict (probe_id, student_id) do update
    set last_saved_at        = now(),
        baseline_keyboard_ms = coalesce(practice_sessions.baseline_keyboard_ms,
                                        excluded.baseline_keyboard_ms),
        baseline_keypad_ms   = coalesce(practice_sessions.baseline_keypad_ms,
                                        excluded.baseline_keypad_ms),
        finished_at          = coalesce(practice_sessions.finished_at, excluded.finished_at)
  returning id into v_session;

  insert into fact_attempts (
    session_id, seq, student_id, fact_id, shown, correct,
    typed, skipped, interrupted, rt_ms, offset_ms, modality)
  select v_session, (a->>'n')::integer, v_uid, i->>'fact_id', i->>'shown',
         -- Numeric equality (CR-18): ".5", "0.5" and "0.50" all match 0.5.
         case
           when (a->>'skipped')::boolean then false
           when (a->>'typed') ~ '^-?([0-9]+\.?[0-9]*|\.[0-9]+)$'
             then (a->>'typed')::numeric = (i->>'answer')::numeric
           else false
         end,
         a->>'typed', (a->>'skipped')::boolean, (a->>'interrupted')::boolean,
         (a->>'rt_ms')::integer, (a->>'offset_ms')::integer,
         nullif(a->>'modality', '')
  from jsonb_array_elements(p_attempts) a
  join jsonb_array_elements(v_probe.items) i on (i->>'n')::integer = (a->>'n')::integer
  on conflict (session_id, seq) do nothing;

  select count(*) into v_saved from fact_attempts where session_id = v_session;
  select finished_at is not null into v_done from practice_sessions where id = v_session;

  return jsonb_build_object('state', 'saved', 'saved', v_saved,
                            'finished', v_done or v_saved >= v_probe.item_count);
end;
$$;

-- F5. fact_probe_results — the teacher's live view and results, one read
-- (polled every 5 seconds while open). A probe past closes_at is finalised
-- here first. A closed probe returns its STORED class verdict; the student
-- rows are derived from the attempts, which nothing can change after a close.
create or replace function fact_probe_results(p_probe_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_probe class_probes%rowtype;
  v_stat  jsonb;
  v_code  text;
begin
  select * into v_probe from class_probes where id = p_probe_id;
  if auth.uid() is null or v_probe.id is null or not is_class_teacher(v_probe.class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;

  if v_probe.closed_at is null and v_probe.closes_at <= now() then
    perform finalise_fact_probe(p_probe_id, true);
    select * into v_probe from class_probes where id = p_probe_id;
  end if;

  v_stat := fact_probe_stat(p_probe_id);
  select join_code into v_code from classes where id = v_probe.class_id;

  return jsonb_build_object(
    'probe', jsonb_build_object(
      'id',          v_probe.id,
      'class_id',    v_probe.class_id,
      'join_code',   v_code,
      'year_level',  v_probe.year_level,
      'opened_at',   v_probe.opened_at,
      'closes_at',   v_probe.closes_at,
      'closed_at',   v_probe.closed_at,
      'auto_closed', v_probe.auto_closed,
      'state',       case when v_probe.closed_at is null then 'open' else 'closed' end,
      'item_count',  v_probe.item_count,
      'ceiling_s',   v_probe.ceiling_s,
      'families',    v_probe.families),
    'class',    coalesce(v_probe.snapshot, v_stat->'class'),
    'students', v_stat->'students');
end;
$$;

-- F6. fact_probe_overview — what the class card and the open screen need: the
-- years a check can be opened for (S-3: the latest mirrored revision), and
-- this class's checks, newest first. Finalises a probe past closes_at, so a
-- forgotten one is closed the next time its teacher looks (ER-9).
create or replace function fact_probe_overview(p_class_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_rev   fact_scope_revision%rowtype;
  v_due   uuid;
  v_years jsonb := '[]'::jsonb;
  v_code  text;
begin
  if auth.uid() is null or p_class_id is null or not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;

  for v_due in
    select id from class_probes
     where class_id = p_class_id and closed_at is null and closes_at <= now()
  loop
    perform finalise_fact_probe(v_due, true);
  end loop;

  select * into v_rev from fact_scope_revision
  order by mirrored_at desc, registry_rev desc, fact_grammar_rev desc
  limit 1;

  if v_rev.registry_rev is not null then
    select coalesce(jsonb_agg(
             jsonb_build_object(
               'year',        y.year,
               'description', v_rev.year_scope -> y.year::text ->> 'description',
               'adds', (select coalesce(jsonb_agg(f.name order by f.ord), '[]'::jsonb)
                          from fact_scope_family f
                         where f.registry_rev = v_rev.registry_rev
                           and f.fact_grammar_rev = v_rev.fact_grammar_rev
                           and (v_rev.year_scope -> y.year::text -> 'adds') ? f.family_id),
               'families', jsonb_array_length(v_rev.year_scope -> y.year::text -> 'cumulative'),
               'items', (select coalesce(sum(a.n_items), 0)
                           from fact_probe_allocate(v_rev.registry_rev, v_rev.fact_grammar_rev, y.year) a))
             order by y.year), '[]'::jsonb)
      into v_years
    from generate_series(7, 10) as y(year)
    where v_rev.year_scope ? y.year::text;
  end if;

  select join_code into v_code from classes where id = p_class_id;

  return jsonb_build_object(
    'join_code', v_code,
    'mirrored',  v_rev.registry_rev is not null,
    'years',     v_years,
    'probes', (select coalesce(jsonb_agg(
                        jsonb_build_object(
                          'id',          p.id,
                          'year_level',  p.year_level,
                          'opened_at',   p.opened_at,
                          'closes_at',   p.closes_at,
                          'closed_at',   p.closed_at,
                          'auto_closed', p.auto_closed,
                          'state',       case when p.closed_at is null then 'open' else 'closed' end,
                          'item_count',  p.item_count,
                          'verdict',     p.snapshot->>'verdict')
                        order by p.opened_at desc), '[]'::jsonb)
                 from class_probes p where p.class_id = p_class_id));
end;
$$;

-- -----------------------------------------------------------------------------
-- G. purge_soft_deleted v5 — a counted delete of practice data (ER-16)
-- -----------------------------------------------------------------------------
-- 0036 §H byte-preserved (the NOTICE prefix included — verify-0029 §D and
-- verify-0036 grep it) plus: step 6b, the explicit delete of practice data for
-- explicitly-deleted accounts past their window; the same explicit delete for
-- a dormant student inside step 7's loop; and both counts appended to the
-- ledger row's notes and to the NOTICE.
--
-- Practice data does NOT block an account purge the way retained section
-- checks do. A soft-deleted CLASS keeps its probes, sessions and attempts:
-- nothing purges class rows (retention-policy.md), so that is the prune
-- slice's job, not this function's.
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
    format('checks purged %s by activity, %s by student; accounts purged %s, blocked %s; practice purged %s attempts, %s sessions',
           v_checks_activity, v_checks_student, v_accounts, v_blocked,
           v_practice_attempts, v_practice_sessions)
  );

  raise notice
    'purge_soft_deleted: section_checks %+% (activity/student), accounts purged %, accounts blocked %, practice attempts %, practice sessions %',
    v_checks_activity, v_checks_student, v_accounts, v_blocked,
    v_practice_attempts, v_practice_sessions;
end;
$$;
revoke execute on function purge_soft_deleted() from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- H. grants
-- -----------------------------------------------------------------------------
-- Migration-created tables do not inherit dashboard default grants (0032's
-- lesson). No client role reads or writes any of the three; service_role reads
-- for read-backs.
revoke all on table class_probes      from anon, authenticated;
revoke all on table practice_sessions from anon, authenticated;
revoke all on table fact_attempts     from anon, authenticated;
grant  select on table class_probes      to service_role;
grant  select on table practice_sessions to service_role;
grant  select on table fact_attempts     to service_role;

-- Internal: reachable only from the definer RPCs below.
revoke execute on function fact_probe_allocate(text, integer, integer) from public, anon, authenticated;
revoke execute on function fact_probe_judged(uuid)                     from public, anon, authenticated;
revoke execute on function fact_probe_stat(uuid)                       from public, anon, authenticated;
revoke execute on function finalise_fact_probe(uuid, boolean)          from public, anon, authenticated;
grant  execute on function fact_probe_allocate(text, integer, integer) to service_role;
grant  execute on function fact_probe_judged(uuid)                     to service_role;
grant  execute on function fact_probe_stat(uuid)                       to service_role;
grant  execute on function finalise_fact_probe(uuid, boolean)          to service_role;

-- Client-callable, each by a signed-in user (0009's standing rule).
revoke execute on function open_fact_probe(uuid, integer)  from public, anon;
grant  execute on function open_fact_probe(uuid, integer)  to authenticated, service_role;
revoke execute on function close_fact_probe(uuid)          from public, anon;
grant  execute on function close_fact_probe(uuid)          to authenticated, service_role;
revoke execute on function fact_probe_entry(text)          from public, anon;
grant  execute on function fact_probe_entry(text)          to authenticated, service_role;
revoke execute on function save_fact_attempts(uuid, jsonb, jsonb, boolean, text) from public, anon;
grant  execute on function save_fact_attempts(uuid, jsonb, jsonb, boolean, text) to authenticated, service_role;
revoke execute on function fact_probe_results(uuid)        from public, anon;
grant  execute on function fact_probe_results(uuid)        to authenticated, service_role;
revoke execute on function fact_probe_overview(uuid)       from public, anon;
grant  execute on function fact_probe_overview(uuid)       to authenticated, service_role;

-- =============================================================================
-- Verification lives in scripts/verify-0045.sql (registered in the verify
-- runner): catalog posture, the allocation, open (items, floor, one-open,
-- named errors), the entry states, the save (idempotence, malformed payloads,
-- refusal after close, non-members), every judgment and the statistic, the
-- snapshot, audit rows, and the purge's counted delete.
-- =============================================================================
