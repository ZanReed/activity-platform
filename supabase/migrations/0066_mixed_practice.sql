-- =============================================================================
-- 0066_mixed_practice.sql — D43 mixed practice: the data and the engine
--                            (build slice 1 of 4)
-- -----------------------------------------------------------------------------
-- docs/design/mixed-practice.md → "Build slices" item 1. The design is RULED
-- (MP-1…MP-15, eng review ER-1…ER-14, design review DM-1…DM-20) as amended by
-- the curriculum letters C-145 and C-146; where those amend an earlier ruling
-- they are the authority. Quote that doc and the curriculum side's files, not
-- this header.
--
--   §A  audit actions
--   §B  activities.primary_skill — the activity's `skill:`, written ONLY by the
--       service-role importer as an IDENTITY write (ER-3); the provenance
--       guard gains it
--   §C  mixed_settings_revision + sync_mixed_settings — the mirror of the
--       seven curriculum keys (insert-only, like fact_scope_revision)
--   §D  classes.mixed_on_at / mixed_items_per_session / mixed_graded — the
--       teacher's switch and settings; set_mixed_practice, set_mixed_settings
--   §E  mixed_sessions, mixed_session_items (the ER-4 SNAPSHOT), mixed_attempts
--       — RLS forced, NO policy (ER-8 of the sprint; ER-4 here)
--   §F  the scheduler (ER-2): mixed_taught, mixed_steps, mixed_plan
--   §G  the student RPCs, AS THE CALLER (ER-1): start_mixed_session,
--       mixed_item_for_check, finish_mixed_session; and record_mixed_attempt
--       (service role: it accepts a verdict, like record_check)
--   §H  the teacher reads: mixed_class_summary, mixed_class_students
--   §I  prune_mixed_practice (DISARMED, unscheduled) and purge_soft_deleted v7
--   §J  grants
--
-- ⚠ STUDENT-DERIVED PERSONAL DATA: what each student answered on each practice
-- item, whether it was right, the session's score. data-map.md and
-- retention-policy.md move in this commit.
--
-- THE RULES THE SCHEDULER ENCODES (as amended by C-145):
--   taught    a skill is taught to a student in a class on the practice day of
--             THAT STUDENT's first check on an activity of the class whose
--             primary skill it is (ER-10 as reversed), read through
--             coalesce(copied_from_activity_id, id) (MP-2). It enters the pool
--             from the NEXT practice day (§17 Q1).
--   pool      ratified, non-retired items of the source activity's OWNER's
--             bank for a taught skill; a discrimination bank when ALL its
--             `discriminates` skills are in the pool (MP-4).
--   step      per (class, student, skill | discrimination bank) (ER-5, ER-11),
--             derived from the attempts by their STORED practice day (ER-12),
--             never stored: a day whose first tries were all right moves it up
--             one; a day with any wrong or skipped first try drops it
--             mixed_wrong_drop steps (C-145 2a); once per practice day.
--   due       step s is due mixed_step_intervals[s] CALENDAR days after the
--             day that set it; the top step recurs at its interval.
--   plan      (C-145 2c) never-practised skills first, under
--             mixed_new_skills_per_session, the most recently taught first,
--             then chain order; then due skills, lowest step first, the most
--             overdue first; then at most mixed_max_discrimination
--             discrimination items. One item per skill (C-145 ask 12); a short
--             session ends early. Confusable skills sit together.
--   seeding   row = hash(practice:<session>:<item>) mod value-table rows (MP-5)
--
-- THE SERVER CHOOSES (ER-1, ER-4). start_mixed_session writes the plan AND a
-- snapshot of every planned item (document, row, fingerprint) before anything
-- is served; grading and the teacher's later view read the snapshot, so a
-- re-import mid-session can never change a student's key.
--
-- NOTHING SERVES OR GRADES YET: slice 2 adds check-activity's `practice-start`
-- and `practice` modes, which call the RPCs here. No scheduled job.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. audit actions
-- -----------------------------------------------------------------------------
alter type audit_action add value if not exists 'mixed_practice.on';
alter type audit_action add value if not exists 'mixed_practice.off';
alter type audit_action add value if not exists 'mixed_practice.settings';
alter type audit_action add value if not exists 'mixed_practice.prune';

-- -----------------------------------------------------------------------------
-- B. activities.primary_skill (MP-2, ER-3)
-- -----------------------------------------------------------------------------
-- The catalogue file's `skill:`. NULL on every activity authored in the app
-- and on a Bank copy (the copy is read through its source). The importer's
-- first run after this migration backfills the catalogue's rows as a PATH-ONLY
-- write: no draft lands on a published activity (ER-3).
alter table activities
  add column primary_skill text
    check (primary_skill is null or (length(primary_skill) between 1 and 120));

comment on column activities.primary_skill is
  'The catalogue file''s primary `skill:` (0066, MP-2). Written ONLY by the service-role batch importer as an identity write (ER-3); a Bank copy carries NULL and is read through coalesce(copied_from_activity_id, id). Feeds mixed practice''s "taught" pool.';

-- 0057's guard, plus primary_skill: before it, a teacher could write any skill
-- onto their own row. Only a non-client role (the importer) sets it.
create or replace function activities_provenance_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      if new.copied_from_activity_id is not null or new.copied_from_version_id is not null then
        raise exception 'copied_from_activity_id / copied_from_version_id are not client-writable';
      end if;
      if new.primary_skill is not null then
        raise exception 'primary_skill is not client-writable';
      end if;
    else
      if new.copied_from_activity_id is distinct from old.copied_from_activity_id
         or new.copied_from_version_id is distinct from old.copied_from_version_id then
        raise exception 'copied_from_activity_id / copied_from_version_id are not client-writable';
      end if;
      if new.primary_skill is distinct from old.primary_skill then
        raise exception 'primary_skill is not client-writable';
      end if;
    end if;
  end if;
  return new;
end;
$$;

-- ER-14: the planner reads a skill's live ratified items by owner.
create index practice_item_owner_skill_ratified on practice_item (owner_id, skill_id)
  where status = 'ratified' and retired_at is null;

-- -----------------------------------------------------------------------------
-- C. the seven curriculum keys (C-145; their main 1ff3217, graph v0.17.27)
-- -----------------------------------------------------------------------------
--   mixed_step_intervals          [1,3,7,14,28]  integers >= 1, strictly increasing
--   mixed_wrong_drop              1              0 .. steps - 1
--   mixed_items_per_session       6              integer >= 1
--   mixed_max_discrimination      1              0 .. items per session
--   mixed_new_skills_per_session  2              0 .. items per session
--   mixed_struggling_window       5              integer >= 1
--   mixed_struggling_min_right    3              0 .. window
-- ALL OR NONE, the bounds of their check L (B-187).
create or replace function mixed_settings_ok(s jsonb)
returns boolean
language sql
immutable
set search_path = public
as $fn$
  select s is not null
    and jsonb_typeof(s) = 'object'
    and (select count(*) from jsonb_object_keys(s)) = 7
    and s ?& array['mixed_step_intervals', 'mixed_wrong_drop', 'mixed_items_per_session',
                   'mixed_max_discrimination', 'mixed_new_skills_per_session',
                   'mixed_struggling_window', 'mixed_struggling_min_right']
    and (select bool_and(jsonb_typeof(s->k) = 'number'
                         and (s->>k)::numeric = trunc((s->>k)::numeric)
                         and (s->>k)::numeric >= 0)
           from unnest(array['mixed_wrong_drop', 'mixed_items_per_session',
                             'mixed_max_discrimination', 'mixed_new_skills_per_session',
                             'mixed_struggling_window', 'mixed_struggling_min_right']) k)
    and jsonb_typeof(s->'mixed_step_intervals') = 'array'
    and jsonb_array_length(s->'mixed_step_intervals') between 1 and 50
    and (select bool_and(jsonb_typeof(e.v) = 'number'
                         and (e.v #>> '{}')::numeric >= 1
                         and (e.v #>> '{}')::numeric = trunc((e.v #>> '{}')::numeric)
                         and (e.i = 1 or (e.v #>> '{}')::numeric
                                > ((s->'mixed_step_intervals'->((e.i - 2)::int)) #>> '{}')::numeric))
           from jsonb_array_elements(s->'mixed_step_intervals') with ordinality e(v, i))
    and (s->>'mixed_wrong_drop')::numeric < jsonb_array_length(s->'mixed_step_intervals')
    and (s->>'mixed_items_per_session')::numeric between 1 and 50
    and (s->>'mixed_max_discrimination')::numeric <= (s->>'mixed_items_per_session')::numeric
    and (s->>'mixed_new_skills_per_session')::numeric <= (s->>'mixed_items_per_session')::numeric
    and (s->>'mixed_struggling_window')::numeric >= 1
    and (s->>'mixed_struggling_min_right')::numeric <= (s->>'mixed_struggling_window')::numeric
$fn$;

-- INSERT-ONLY, like fact_scope_revision: a session names the revision it was
-- planned under, so a later revision never re-judges old work.
create table mixed_settings_revision (
  revision      text primary key check (revision ~ '^[0-9a-f]{64}$'),
  graph_version text check (length(graph_version) <= 40),
  settings      jsonb not null check (mixed_settings_ok(settings)),
  mirrored_at   timestamptz not null default now()
);

comment on table mixed_settings_revision is
  'The seven curriculum-owned mixed-practice keys (0066; C-145), mirrored by pnpm import:batch through sync_mixed_settings. Insert-only; a mixed session names the revision it was planned under. Curriculum settings, no personal data.';

alter table mixed_settings_revision enable row level security;
alter table mixed_settings_revision force row level security;

-- p_mirror: {revision, graph_version, settings: {the seven keys}}.
-- p_apply = false reports and writes nothing. A known revision with DIFFERENT
-- settings is refused (the revision is meant to be a hash of its content).
create or replace function sync_mixed_settings(p_mirror jsonb, p_apply boolean default false)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_rev    text := p_mirror->>'revision';
  v_stored jsonb;
  v_latest jsonb;
begin
  if p_mirror is null or jsonb_typeof(p_mirror) <> 'object' or v_rev is null
     or not mixed_settings_ok(p_mirror->'settings') then
    raise exception 'sync_mixed_settings: malformed mirror (the seven keys, all of them, in range)';
  end if;
  perform pg_advisory_xact_lock(hashtext('sync_mixed_settings'));

  select jsonb_build_object('revision', revision, 'graph_version', graph_version,
                            'mirrored_at', mirrored_at)
    into v_latest
  from mixed_settings_revision order by mirrored_at desc, revision desc limit 1;

  select settings into v_stored from mixed_settings_revision where revision = v_rev;
  if v_stored is not null then
    if v_stored is distinct from p_mirror->'settings' then
      raise exception 'sync_mixed_settings: revision % is already mirrored with DIFFERENT settings',
        left(v_rev, 8);
    end if;
    return jsonb_build_object('status', 'unchanged', 'applied', false, 'latest_before', v_latest);
  end if;

  if p_apply then
    insert into mixed_settings_revision (revision, graph_version, settings)
    values (v_rev, p_mirror->>'graph_version', p_mirror->'settings');
  end if;
  return jsonb_build_object('status', case when p_apply then 'mirrored' else 'new' end,
                            'applied', p_apply, 'latest_before', v_latest);
end;
$$;

-- -----------------------------------------------------------------------------
-- D. the class's switch and settings (MP-8, MP-9, MP-12; mirrors fact_sprint_on_at)
-- -----------------------------------------------------------------------------
alter table classes
  add column mixed_on_at timestamptz,
  add column mixed_items_per_session integer
    check (mixed_items_per_session is null or mixed_items_per_session between 1 and 50),
  add column mixed_graded boolean not null default false;

comment on column classes.mixed_on_at is
  'When the class''s mixed practice was switched on (0066, MP-12); NULL is off. Off stops NEW sessions only (DM-8). Written only by set_mixed_practice.';
comment on column classes.mixed_items_per_session is
  'The class''s items per mixed session (0066, MP-8); NULL = the curriculum default (mixed_items_per_session). Written only by set_mixed_settings.';
comment on column classes.mixed_graded is
  'The class''s "Record a practice score" toggle (0066, MP-9 as amended), default OFF. Copied onto each session at start (ER-7); the scheduler ignores it. Written only by set_mixed_settings.';

-- What a class's mixed practice would run on, or why it cannot. MP-14: there
-- is NO bank check here — a class with no bank yet can be switched on, and the
-- teacher is told so in words (DM-9).
create or replace function mixed_basis(p_class_id uuid)
returns table (reason text, revision text, settings jsonb)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_rev  mixed_settings_revision%rowtype;
  v_ends date;
begin
  select school_year_ends_on into v_ends from classes where id = p_class_id;
  select * into v_rev from mixed_settings_revision order by mirrored_at desc, revision desc limit 1;
  return query select
    case
      when v_rev.revision is null then 'mixed_settings_not_mirrored'
      when v_ends is null         then 'school_year_end_missing'
      when v_ends < current_date  then 'school_year_ended'
    end,
    v_rev.revision, v_rev.settings;
end;
$$;

-- The teacher's switch. Errors, by name: not_class_teacher, and mixed_basis's
-- reasons (on only).
create or replace function set_mixed_practice(p_class_id uuid, p_on boolean)
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
  select mixed_on_at into v_was from classes where id = p_class_id for update;

  if p_on then
    select b.reason into v_reason from mixed_basis(p_class_id) b;
    if v_reason is not null then
      raise exception '%', v_reason;
    end if;
    if v_was is null then
      update classes set mixed_on_at = now(), updated_at = now() where id = p_class_id;
      insert into audit_log (actor_id, action, target_type, target_id, metadata)
      values (auth.uid(), 'mixed_practice.on', 'class', p_class_id, '{}'::jsonb);
    end if;
  elsif v_was is not null then
    update classes set mixed_on_at = null, updated_at = now() where id = p_class_id;
    insert into audit_log (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'mixed_practice.off', 'class', p_class_id,
            jsonb_build_object('on_since', v_was));
  end if;

  return jsonb_build_object('on', p_on,
                            'on_at', (select mixed_on_at from classes where id = p_class_id));
end;
$$;

-- Items per session (NULL = the curriculum default) and the graded toggle.
-- A change affects sessions started AFTER it (ER-7: the flag is copied at start).
create or replace function set_mixed_settings(p_class_id uuid, p_items integer, p_graded boolean)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_old classes%rowtype;
begin
  if auth.uid() is null or p_class_id is null or p_graded is null
     or not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  if p_items is not null and (p_items < 1 or p_items > 50) then
    raise exception 'items_out_of_range';
  end if;
  select * into v_old from classes where id = p_class_id for update;
  if v_old.mixed_items_per_session is distinct from p_items or v_old.mixed_graded <> p_graded then
    update classes
       set mixed_items_per_session = p_items, mixed_graded = p_graded, updated_at = now()
     where id = p_class_id;
    insert into audit_log (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'mixed_practice.settings', 'class', p_class_id,
            jsonb_build_object('items', p_items, 'graded', p_graded,
                               'was_items', v_old.mixed_items_per_session,
                               'was_graded', v_old.mixed_graded));
  end if;
  return jsonb_build_object('items', p_items, 'graded', p_graded);
end;
$$;

-- -----------------------------------------------------------------------------
-- E. tables
-- -----------------------------------------------------------------------------
create table mixed_sessions (
  id              uuid primary key default gen_random_uuid(),
  class_id        uuid not null references classes(id) on delete cascade,
  student_id      uuid not null references users(id) on delete cascade,
  -- ER-12: fixed at start in the class teacher's timezone; every derivation
  -- reads THIS, never saved_at in the current zone.
  practice_day    date not null,
  ordinal         integer not null check (ordinal >= 1),
  -- Fixed at start (ER-7): the settings revision, the class's graded flag.
  revision        text not null references mixed_settings_revision(revision),
  graded          boolean not null,
  planned         integer not null check (planned between 1 and 50),
  -- ER-7 as amended by C-145 point 6: score = right / PLANNED, with "answered
  -- n of N" (a skip is not answered). Written at every save; stored for every
  -- session, SHOWN only when graded.
  score_right     integer not null default 0 check (score_right >= 0),
  score_answered  integer not null default 0 check (score_answered >= 0),
  started_at      timestamptz not null default now(),
  last_saved_at   timestamptz not null default now(),
  finished_at     timestamptz,
  -- MP-13: the class's school-year end + 30 days, at most 400 days on.
  keep_until      date not null,
  -- Set when the prune removed a GRADED session's items and attempts and kept
  -- its score (ER-7: a score follows the grade's retention, not the prune's).
  pruned_at       timestamptz,
  unique (class_id, student_id, practice_day, ordinal),
  check (score_right <= score_answered and score_answered <= planned)
);

create index mixed_sessions_student_idx on mixed_sessions (student_id);

comment on table mixed_sessions is
  'One student''s mixed practice session in a class (0066, MP-1): practice day and settings fixed at start, the graded flag, the practice score. STUDENT-DERIVED personal data. Written only by start_mixed_session, record_mixed_attempt and finish_mixed_session.';

-- ER-4: the served item, frozen. ANSWER-KEY CLASS (document carries answers).
create table mixed_session_items (
  session_id    uuid not null references mixed_sessions(id) on delete cascade,
  seq           integer not null check (seq >= 1),
  -- Carried so the purge can count, and the data-map guard sees, whose row it is.
  student_id    uuid not null references users(id) on delete cascade,
  -- MP-11: `skill` or `discrimination` (facts may join later).
  kind          text not null check (kind in ('skill', 'discrimination')),
  -- The step's key: the skill id, or the discrimination bank (the item id's
  -- `<stem>`, ER-11).
  bank_key      text not null check (length(bank_key) between 1 and 200),
  owner_id      uuid not null,
  item_id       text not null,
  fingerprint   text not null,
  row_index     integer not null check (row_index >= 0),
  document      jsonb not null,
  row_values    jsonb not null check (jsonb_typeof(row_values) = 'object'),
  primary key (session_id, seq)
);

comment on table mixed_session_items is
  'The planned items of a mixed session, SNAPSHOTTED at start (0066, ER-4): bank item id, fingerprint, value-table row, the item document and its row values. ANSWER-KEY CLASS: no client read path; read by the RPCs and the check function''s service role. Removed with its session''s attempts.';

create table mixed_attempts (
  session_id  uuid not null,
  seq         integer not null,
  student_id  uuid not null references users(id) on delete cascade,
  -- Copied from the session and its item, so the step derivation is one index
  -- read (ER-14) and never re-derives a day (ER-12).
  class_id    uuid not null references classes(id) on delete cascade,
  practice_day date not null,
  kind        text not null check (kind in ('skill', 'discrimination')),
  bank_key    text not null,
  -- The FIRST try is the only try (MP-9). A skip is a wrong first try (DM-10).
  correct     boolean not null,
  skipped     boolean not null default false,
  responses   jsonb not null default '{}'::jsonb,
  verdicts    jsonb not null default '{}'::jsonb,
  saved_at    timestamptz not null default now(),
  primary key (session_id, seq),
  foreign key (session_id, seq) references mixed_session_items(session_id, seq) on delete cascade,
  check (not (skipped and correct))
);

create index mixed_attempts_step_idx
  on mixed_attempts (class_id, student_id, kind, bank_key, practice_day);
create index mixed_attempts_student_idx on mixed_attempts (student_id);

comment on table mixed_attempts is
  'A student''s first (only) try at one planned mixed-practice item (0066): right or not, skipped or not, the responses and verdicts. STUDENT-DERIVED personal data. Steps are derived from these by mixed_steps; nothing stores a step. Written only by record_mixed_attempt, recorded BEFORE the verdict is returned (ER-9).';

alter table mixed_sessions      enable row level security;
alter table mixed_sessions      force row level security;
alter table mixed_session_items enable row level security;
alter table mixed_session_items force row level security;
alter table mixed_attempts      enable row level security;
alter table mixed_attempts      force row level security;
-- NO policies on any of the three.

-- -----------------------------------------------------------------------------
-- F. the scheduler (ER-2)
-- -----------------------------------------------------------------------------

-- F1. What THIS student has been taught in this class, by skill and bank
-- owner, with the practice day of their first check (ER-10 as reversed).
-- The day is the check's created_at in the class zone: a check row stores no
-- practice day (the latent ER-12 issue, filed in TODOS for the sprint too).
create or replace function mixed_taught(p_class_id uuid, p_student_id uuid, p_zone text)
returns table (skill_id text, owner_id uuid, taught_day date, chain_order text)
language sql
stable
security definer
set search_path = public
as $$
  select src.primary_skill, src.owner_id,
         min((sc.created_at at time zone p_zone)::date),
         min(coalesce(src.source_path, src.title))
  from class_activities ca
  join activities a   on a.id = ca.activity_id
  join activities src on src.id = coalesce(a.copied_from_activity_id, a.id)
  join section_checks sc on sc.activity_id = a.id and sc.student_id = p_student_id
  where ca.class_id = p_class_id
    and src.primary_skill is not null
  group by src.primary_skill, src.owner_id;
$$;

-- F2. Each key's step, derived (ER-2/5/6/11/12 + C-145 2a). One row per
-- (kind, bank_key) the student has ever tried in this class. A day's result
-- is every first try on the key that day: all right → up one (capped at the
-- top step), any wrong or skipped → down p_drop (floored at 0). `due_on` is
-- the day that set the step plus that step's interval.
create or replace function mixed_steps(p_class_id uuid, p_student_id uuid,
                                       p_intervals integer[], p_drop integer)
returns table (kind text, bank_key text, step integer, last_day date, due_on date, days integer)
language sql
stable
security definer
set search_path = public
as $$
  with recursive d as (
    select a.kind, a.bank_key, a.practice_day, bool_and(a.correct) as ok,
           row_number() over (partition by a.kind, a.bank_key order by a.practice_day) as rn
    from mixed_attempts a
    where a.class_id = p_class_id and a.student_id = p_student_id
    group by a.kind, a.bank_key, a.practice_day
  ), r as (
    select d.kind, d.bank_key, d.rn, d.practice_day,
           case when d.ok then least(1, cardinality(p_intervals) - 1) else 0 end as step
    from d where d.rn = 1
    union all
    select d.kind, d.bank_key, d.rn, d.practice_day,
           case when d.ok then least(r.step + 1, cardinality(p_intervals) - 1)
                else greatest(r.step - p_drop, 0) end
    from r join d on d.kind = r.kind and d.bank_key = r.bank_key and d.rn = r.rn + 1
  )
  select distinct on (r.kind, r.bank_key)
         r.kind, r.bank_key, r.step, r.practice_day,
         r.practice_day + p_intervals[r.step + 1], r.rn::integer
  from r
  order by r.kind, r.bank_key, r.rn desc;
$$;

-- F3. The plan for one session: (seq, kind, bank_key, owner_id, item_id),
-- numbered in served order. Pure read; the caller writes it.
--
-- Fill (C-145 2c): tier 1 = never-practised skills, at most
-- mixed_new_skills_per_session, the most recently taught first then chain
-- order (a late bank's backlog enters at step 0 in chain order, C-145 ask 8);
-- tier 2 = due skills not practised today, lowest step first then most
-- overdue; tier 3 = at most mixed_max_discrimination discrimination banks
-- whose skills are ALL in the pool, never tried or due. ER-6: a LATER session
-- the same day that finds nothing in the three tiers falls back to skills
-- already practised today. One item per key; a short session ends early.
--
-- Item within a key (C-145 ask 11): plain rotation in bank order, the next
-- after the last one this student was served in this class.
--
-- Order: confusable skills sit together (a skill in a pool-eligible
-- discrimination bank's set clusters with that set; the bank's item, if
-- planned, ends its cluster); clusters and skills are otherwise interleaved
-- by a hash of the session id.
create or replace function mixed_plan(
  p_class_id uuid, p_student_id uuid, p_session_id uuid, p_today date,
  p_ordinal integer, p_settings jsonb, p_items integer, p_zone text)
returns table (seq integer, kind text, bank_key text, owner_id uuid, item_id text)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_intervals integer[] := array(select (jsonb_array_elements_text(p_settings->'mixed_step_intervals'))::integer);
  v_drop      integer := (p_settings->>'mixed_wrong_drop')::integer;
  v_new_cap   integer := (p_settings->>'mixed_new_skills_per_session')::integer;
  v_disc_cap  integer := (p_settings->>'mixed_max_discrimination')::integer;
begin
  return query
  with taught as (
    select t.* from mixed_taught(p_class_id, p_student_id, p_zone) t
    where t.taught_day < p_today                                       -- §17 Q1
  ),
  pool as (
    select t.skill_id, min(t.taught_day) as taught_day, min(t.chain_order) as chain_order,
           array_agg(distinct t.owner_id) as owners
    from taught t
    where exists (select 1 from practice_item p
                   where p.owner_id = t.owner_id and p.skill_id = t.skill_id
                     and p.role = 'skill' and p.status = 'ratified' and p.retired_at is null)
    group by t.skill_id
  ),
  st as (select * from mixed_steps(p_class_id, p_student_id, v_intervals, v_drop)),
  sk as (
    select pool.*, st.step, st.last_day, st.due_on
    from pool left join st on st.kind = 'skill' and st.bank_key = pool.skill_id
  ),
  disc as (
    select p.owner_id as owner, split_part(p.item_id, '#', 1) as stem,
           min(p.discriminates) as skills
    from practice_item p
    where p.role = 'discrimination' and p.status = 'ratified' and p.retired_at is null
      and exists (select 1 from taught t where t.owner_id = p.owner_id)
    group by p.owner_id, split_part(p.item_id, '#', 1)
  ),
  disc_ok as (
    select d.*, st.step, st.last_day, st.due_on
    from disc d
    left join st on st.kind = 'discrimination' and st.bank_key = d.stem
    where (select coalesce(array_agg(skill_id), '{}') from pool) @> d.skills
  ),
  t1 as (
    select 'skill'::text as kind, sk.skill_id as key, sk.owners, 1 as tier,
           row_number() over (order by sk.taught_day desc, sk.chain_order, sk.skill_id) as r
    from sk where sk.step is null
  ),
  t2 as (
    select 'skill'::text as kind, sk.skill_id as key, sk.owners, 2 as tier,
           row_number() over (order by sk.step, sk.due_on, sk.chain_order, sk.skill_id) as r
    from sk where sk.step is not null and sk.due_on <= p_today and sk.last_day < p_today
  ),
  t3 as (
    select 'discrimination'::text as kind, d.stem as key, array[d.owner] as owners, 3 as tier,
           row_number() over (order by d.step nulls first, d.due_on, d.stem) as r
    from disc_ok d
    where d.step is null or (d.due_on <= p_today and d.last_day < p_today)
  ),
  picked as (
    select * from (select * from t1 where t1.r <= v_new_cap) a
    union all
    select * from (select * from t2
                    where t2.r <= p_items - least(v_new_cap, (select count(*) from t1))) b
  ),
  picked_all as (
    select * from picked
    union all
    select * from t3
     where t3.r <= least(v_disc_cap, p_items - (select count(*) from picked))
  ),
  fallback as (
    select 'skill'::text as kind, sk.skill_id as key, sk.owners, 4 as tier,
           row_number() over (order by sk.step, sk.chain_order, sk.skill_id) as r
    from sk
    where p_ordinal > 1 and sk.last_day = p_today
      and not exists (select 1 from picked_all)
  ),
  chosen as (
    select * from picked_all
    union all
    select * from fallback where fallback.r <= p_items
  ),
  -- The item for each key: the next in bank order after the last one served.
  last_seen as (
    select distinct on (si.kind, si.bank_key) si.kind, si.bank_key, si.owner_id, si.item_id
    from mixed_session_items si
    join mixed_sessions s on s.id = si.session_id
    where s.class_id = p_class_id and s.student_id = p_student_id
    order by si.kind, si.bank_key, s.started_at desc, si.seq desc
  ),
  cand as (
    select c.kind, c.key, p.owner_id, p.item_id, p.position
    from chosen c
    join practice_item p
      on p.owner_id = any (c.owners) and p.status = 'ratified' and p.retired_at is null
     and ((c.kind = 'skill' and p.role = 'skill' and p.skill_id = c.key)
       or (c.kind = 'discrimination' and p.role = 'discrimination'
           and split_part(p.item_id, '#', 1) = c.key))
  ),
  item as (
    select distinct on (c.kind, c.key) c.kind, c.key, c.owner_id, c.item_id
    from cand c
    left join last_seen l on l.kind = c.kind and l.bank_key = c.key
    left join practice_item lp on lp.owner_id = l.owner_id and lp.item_id = l.item_id
    order by c.kind, c.key,
             -- after the last-seen one first, then wrap around
             case when lp.item_id is null then 0
                  when (c.owner_id::text, c.position, c.item_id)
                       > (lp.owner_id::text, lp.position, lp.item_id) then 0
                  else 1 end,
             c.owner_id::text, c.position, c.item_id
  ),
  -- Confusable sets present in the pool cluster their skills together.
  cluster as (
    select i.kind, i.key, i.owner_id, i.item_id,
           coalesce(
             case when i.kind = 'discrimination' then 'd:' || i.key end,
             (select 'd:' || min(d.stem) from disc_ok d
               where i.key = any (d.skills)
                 and exists (select 1 from item j where j.kind = 'discrimination' and j.key = d.stem)),
             (select 'd:' || min(d.stem) from disc_ok d where i.key = any (d.skills)),
             's:' || i.key) as grp
    from item i
  )
  select (row_number() over (
            order by md5(p_session_id::text || ':c:' || c.grp),
                     (c.kind = 'discrimination'),
                     md5(p_session_id::text || ':s:' || c.key)))::integer,
         c.kind, c.key, c.owner_id, c.item_id
  from cluster c;
end;
$$;

-- F4. The value-table row for one item in one session (MP-5):
-- hash(practice:<session>:<item>) mod rows — the first 60 bits of a sha256.
create or replace function mixed_row_index(p_session_id uuid, p_item_id text, p_rows integer)
returns integer
language sql
immutable
set search_path = public
as $$
  select (('x' || left(encode(sha256(convert_to(
            'practice:' || p_session_id::text || ':' || p_item_id, 'UTF8')), 'hex'), 15))
          ::bit(60)::bigint % greatest(p_rows, 1))::integer;
$$;

-- -----------------------------------------------------------------------------
-- G. the student RPCs (ER-1, ER-9)
-- -----------------------------------------------------------------------------

-- What a session's caller may know: ids, rows and its own stored results.
-- Never a document, a row's values or an answer (those leave only through
-- slice 2's sanitizer).
create or replace function mixed_session_payload(p_session_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'session_id', s.id, 'practice_day', s.practice_day, 'ordinal', s.ordinal,
    'planned', s.planned, 'graded', s.graded,
    'score_right', s.score_right, 'score_answered', s.score_answered,
    'finished', s.finished_at is not null,
    'items', (select coalesce(jsonb_agg(jsonb_build_object(
                'seq', si.seq, 'item_id', si.item_id, 'row_index', si.row_index,
                'answered', a.seq is not null,
                'correct', a.correct, 'skipped', a.skipped)
              order by si.seq), '[]'::jsonb)
              from mixed_session_items si
              left join mixed_attempts a on a.session_id = si.session_id and a.seq = si.seq
             where si.session_id = s.id))
  from mixed_sessions s where s.id = p_session_id;
$$;

-- G1. start_mixed_session — AS THE CALLER. Refuses anyone who is not a current
-- member of a live class with mixed practice on, with ONE error ("Not
-- available", no oracle). For a member it answers a state:
--   resume          today's open session (ER-9: a second start returns it)
--   ready           p_start = false: how many items a session would hold
--   started         p_start = true: the new session (plan + snapshots written)
--   nothing_taught  no taught skill with a ratified bank before today (DM-4)
--   nothing_due     nothing to plan and no session yet today
--   done_today      nothing to plan, a session already finished today
create or replace function start_mixed_session(p_class_id uuid, p_start boolean default false)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_class  classes%rowtype;
  v_basis  record;
  v_zone   text;
  v_today  date;
  v_count  integer;
  v_open   uuid;
  v_items  integer;
  v_id     uuid := gen_random_uuid();
  v_n      integer;
  v_common jsonb;
  v_plan   jsonb;
begin
  select * into v_class from classes where id = p_class_id and deleted_at is null;
  if v_uid is null or v_class.id is null or v_class.mixed_on_at is null
     or not exists (select 1 from users u where u.id = v_uid and u.deleted_at is null
                                              and u.role not in ('teacher', 'admin'))
     or not exists (select 1 from class_members m
                     where m.class_id = v_class.id and m.student_id = v_uid
                       and m.removed_at is null) then
    raise exception 'Not available' using errcode = '42501';
  end if;
  select * into v_basis from mixed_basis(v_class.id);
  if v_basis.reason is not null then
    raise exception 'Not available' using errcode = '42501';
  end if;

  v_zone  := fact_class_zone(v_class.id);
  v_today := (now() at time zone v_zone)::date;
  v_items := coalesce(v_class.mixed_items_per_session,
                      (v_basis.settings->>'mixed_items_per_session')::integer);

  select count(*), (array_agg(id order by ordinal desc) filter (where finished_at is null))[1]
    into v_count, v_open
    from mixed_sessions
   where class_id = v_class.id and student_id = v_uid and practice_day = v_today;
  v_common := jsonb_build_object('done_today', v_count - (v_open is not null)::integer,
                                 'graded', v_class.mixed_graded,
                                 'items_per_session', v_items);

  if v_open is not null then
    return v_common || jsonb_build_object('state', 'resume', 'session', mixed_session_payload(v_open));
  end if;

  if not exists (
       select 1 from mixed_taught(v_class.id, v_uid, v_zone) t
        where t.taught_day < v_today
          and exists (select 1 from practice_item p
                       where p.owner_id = t.owner_id and p.skill_id = t.skill_id
                         and p.role = 'skill' and p.status = 'ratified' and p.retired_at is null)) then
    return v_common || jsonb_build_object('state', 'nothing_taught');
  end if;

  -- The plan, keyed by the session id it will carry (order and rows hash it).
  select coalesce(jsonb_agg(to_jsonb(p) order by p.seq), '[]'::jsonb) into v_plan
    from mixed_plan(v_class.id, v_uid, v_id, v_today, v_count + 1,
                    v_basis.settings, v_items, v_zone) p;
  v_n := jsonb_array_length(v_plan);

  if v_n = 0 then
    return v_common || jsonb_build_object(
      'state', case when v_count > 0 then 'done_today' else 'nothing_due' end);
  end if;
  if not coalesce(p_start, false) then
    return v_common || jsonb_build_object('state', 'ready', 'planned', v_n);
  end if;

  begin
    insert into mixed_sessions (id, class_id, student_id, practice_day, ordinal, revision,
                                graded, planned, keep_until)
    values (v_id, v_class.id, v_uid, v_today, v_count + 1, v_basis.revision,
            v_class.mixed_graded, v_n,
            least(v_class.school_year_ends_on + 30, current_date + 400));
  exception when unique_violation then
    -- Two tabs started at once; the other one won. Hand back its session.
    select id into v_open from mixed_sessions
     where class_id = v_class.id and student_id = v_uid and practice_day = v_today
       and finished_at is null
     order by ordinal desc limit 1;
    return v_common || jsonb_build_object('state', 'resume', 'session', mixed_session_payload(v_open));
  end;

  -- ER-4: snapshot every planned item now.
  insert into mixed_session_items (session_id, seq, student_id, kind, bank_key, owner_id,
                                   item_id, fingerprint, row_index, document, row_values)
  select v_id, t.seq, v_uid, t.kind, t.bank_key, p.owner_id, p.item_id, p.fingerprint,
         r.idx, p.document,
         coalesce((select jsonb_object_agg(c.name, (p.value_table->'rows'->r.idx)->((c.i - 1)::int))
                     from jsonb_array_elements_text(p.value_table->'columns') with ordinality c(name, i)),
                  '{}'::jsonb)
  from jsonb_to_recordset(v_plan) as t(seq integer, kind text, bank_key text,
                                       owner_id uuid, item_id text)
  join practice_item p on p.owner_id = t.owner_id and p.item_id = t.item_id
  cross join lateral (select mixed_row_index(v_id, p.item_id,
                                             jsonb_array_length(p.value_table->'rows')) as idx) r;

  return v_common || jsonb_build_object('state', 'started', 'session', mixed_session_payload(v_id));
end;
$$;

-- G2. mixed_item_for_check — AS THE CALLER (ER-1). Proves the session is the
-- caller's, the caller is still a member of the live class, and the item is
-- in the session's PLAN. An item already tried returns its stored result
-- (`replay`, ER-9) — the handler returns that, never a re-grade. A new try
-- needs the session OPEN (unfinished, started within a day; the sprint's
-- window). Mixed practice being switched OFF does not close an open session
-- (DM-8). Anything else: ONE error, "Not available".
create or replace function mixed_item_for_check(p_session_id uuid, p_seq integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_s  mixed_sessions%rowtype;
  v_i  mixed_session_items%rowtype;
  v_a  mixed_attempts%rowtype;
begin
  select * into v_s from mixed_sessions where id = p_session_id;
  select * into v_i from mixed_session_items where session_id = p_session_id and seq = p_seq;
  if auth.uid() is null or v_s.id is null or v_i.session_id is null
     or v_s.student_id <> auth.uid()
     or not exists (select 1 from classes c where c.id = v_s.class_id and c.deleted_at is null)
     or not exists (select 1 from class_members m
                     where m.class_id = v_s.class_id and m.student_id = auth.uid()
                       and m.removed_at is null) then
    raise exception 'Not available' using errcode = '42501';
  end if;

  select * into v_a from mixed_attempts where session_id = p_session_id and seq = p_seq;
  if v_a.session_id is not null then
    return jsonb_build_object('replay', true, 'student_id', v_s.student_id,
                              'correct', v_a.correct, 'skipped', v_a.skipped,
                              'verdicts', v_a.verdicts);
  end if;
  if v_s.finished_at is not null or now() > v_s.started_at + interval '1 day' then
    raise exception 'Not available' using errcode = '42501';
  end if;
  return jsonb_build_object('replay', false, 'student_id', v_s.student_id,
                            'session_id', v_s.id, 'seq', v_i.seq,
                            'owner_id', v_i.owner_id, 'item_id', v_i.item_id,
                            'fingerprint', v_i.fingerprint, 'row_index', v_i.row_index);
end;
$$;

-- G3. record_mixed_attempt — SERVICE ROLE ONLY (it accepts a verdict, like
-- record_check). Called by slice 2's handler AFTER mixed_item_for_check and
-- grading, BEFORE the verdict leaves (ER-9). First write wins: a replay
-- returns the stored row with replayed = true and changes nothing. Refuses a
-- student who is not the session's, or a seq not in the plan.
create or replace function record_mixed_attempt(
  p_student_id uuid, p_session_id uuid, p_seq integer, p_correct boolean,
  p_skipped boolean, p_responses jsonb, p_verdicts jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_s   mixed_sessions%rowtype;
  v_i   mixed_session_items%rowtype;
  v_a   mixed_attempts%rowtype;
  v_new boolean := false;
begin
  select * into v_s from mixed_sessions where id = p_session_id for update;
  select * into v_i from mixed_session_items where session_id = p_session_id and seq = p_seq;
  if v_s.id is null or v_i.session_id is null or v_s.student_id is distinct from p_student_id
     or p_correct is null or (coalesce(p_skipped, false) and p_correct) then
    raise exception 'record_mixed_attempt: refused';
  end if;

  insert into mixed_attempts (session_id, seq, student_id, class_id, practice_day, kind,
                              bank_key, correct, skipped, responses, verdicts)
  values (p_session_id, p_seq, v_s.student_id, v_s.class_id, v_s.practice_day, v_i.kind,
          v_i.bank_key, p_correct, coalesce(p_skipped, false),
          coalesce(p_responses, '{}'::jsonb), coalesce(p_verdicts, '{}'::jsonb))
  on conflict (session_id, seq) do nothing;
  v_new := found;

  if v_new then
    update mixed_sessions s
       set score_right    = (select count(*) filter (where correct) from mixed_attempts where session_id = s.id),
           score_answered = (select count(*) filter (where not skipped) from mixed_attempts where session_id = s.id),
           last_saved_at  = now(),
           finished_at    = case when (select count(*) from mixed_attempts where session_id = s.id) >= s.planned
                                 then coalesce(s.finished_at, now()) else s.finished_at end
     where s.id = p_session_id;
  end if;

  select * into v_a from mixed_attempts where session_id = p_session_id and seq = p_seq;
  return jsonb_build_object('replayed', not v_new, 'correct', v_a.correct,
                            'skipped', v_a.skipped, 'verdicts', v_a.verdicts);
end;
$$;

-- G4. finish_mixed_session — AS THE CALLER ("Stop for now", or done). Partial
-- work counts (MP-8). Returns the done screen's numbers (DM-11).
create or replace function finish_mixed_session(p_session_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_s mixed_sessions%rowtype;
begin
  select * into v_s from mixed_sessions where id = p_session_id for update;
  if auth.uid() is null or v_s.id is null or v_s.student_id <> auth.uid() then
    raise exception 'Not available' using errcode = '42501';
  end if;
  if v_s.finished_at is null then
    update mixed_sessions set finished_at = now(), last_saved_at = now() where id = p_session_id;
  end if;
  return jsonb_build_object(
    'planned', v_s.planned, 'right', v_s.score_right, 'answered', v_s.score_answered,
    'skipped', (select count(*) from mixed_attempts where session_id = p_session_id and skipped),
    'graded', v_s.graded);
end;
$$;

-- -----------------------------------------------------------------------------
-- H. the teacher reads (MP-12, DM-3, DM-20; C-146 point 3)
-- -----------------------------------------------------------------------------

-- Each live-roster student's last `window` first tries per skill, in the class.
-- Struggling (C-145 ask 9: fewer than min_right of the last window right) is
-- read as "cannot reach min_right in the window": more than window − min_right
-- of those tries were not right. With a full window that IS "fewer than
-- min_right right"; with fewer tries it flags only a student already past
-- the line, so one wrong first try never reads as struggling.
create or replace function mixed_recent(p_class_id uuid, p_window integer)
returns table (student_id uuid, bank_key text, tries integer, right_n integer, skipped_n integer)
language sql
stable
security definer
set search_path = public
as $$
  select x.student_id, x.bank_key, count(*)::integer,
         count(*) filter (where x.correct)::integer,
         count(*) filter (where x.skipped)::integer
  from (
    select a.*, row_number() over (partition by a.student_id, a.bank_key
                                   order by a.practice_day desc, a.saved_at desc, a.seq desc) as rn
    from mixed_attempts a
    join class_members m on m.class_id = a.class_id and m.student_id = a.student_id
                        and m.removed_at is null
    where a.class_id = p_class_id and a.kind = 'skill'
  ) x
  where x.rn <= p_window
  group by x.student_id, x.bank_key;
$$;

-- H1. The per-skill class summary — counts only, no names (DM-18).
create or replace function mixed_class_summary(p_class_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_class classes%rowtype;
  v_basis record;
  v_win   integer;
  v_min   integer;
  v_today date;
begin
  if auth.uid() is null or p_class_id is null or not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  select * into v_class from classes where id = p_class_id;
  select * into v_basis from mixed_basis(p_class_id);
  v_win   := coalesce((v_basis.settings->>'mixed_struggling_window')::integer, 5);
  v_min   := coalesce((v_basis.settings->>'mixed_struggling_min_right')::integer, 3);
  v_today := (now() at time zone fact_class_zone(p_class_id))::date;

  return jsonb_build_object(
    'on_at', v_class.mixed_on_at,
    'reason', v_basis.reason,
    'items_per_session', v_class.mixed_items_per_session,
    'default_items', (v_basis.settings->>'mixed_items_per_session')::integer,
    'graded', v_class.mixed_graded,
    'school_year_ends_on', v_class.school_year_ends_on,
    -- DM-9: does ANY skill a student of this class has checked have a bank?
    'has_bank', exists (
      select 1 from class_members m
      cross join lateral mixed_taught(p_class_id, m.student_id, fact_class_zone(p_class_id)) t
      where m.class_id = p_class_id and m.removed_at is null
        and exists (select 1 from practice_item p
                     where p.owner_id = t.owner_id and p.skill_id = t.skill_id
                       and p.role = 'skill' and p.status = 'ratified' and p.retired_at is null)),
    'practised_today', (select count(distinct a.student_id) from mixed_attempts a
                         join class_members m on m.class_id = a.class_id and m.student_id = a.student_id
                                             and m.removed_at is null
                        where a.class_id = p_class_id and a.practice_day = v_today),
    'practised_week', (select count(distinct a.student_id) from mixed_attempts a
                        join class_members m on m.class_id = a.class_id and m.student_id = a.student_id
                                            and m.removed_at is null
                       where a.class_id = p_class_id and a.practice_day > v_today - 7),
    'skills', (select coalesce(jsonb_agg(jsonb_build_object(
                 'skill_id', r.bank_key,
                 'students_practising', r.students,
                 'struggling', r.struggling,
                 'first_tries_right', r.right_n,
                 'first_tries', r.tries,
                 'skips', r.skips) order by r.bank_key), '[]'::jsonb)
               from (select bank_key, count(*) as students,
                            count(*) filter (where tries - right_n > v_win - v_min) as struggling,
                            sum(right_n) as right_n, sum(tries) as tries, sum(skipped_n) as skips
                       from mixed_recent(p_class_id, v_win) group by bank_key) r));
end;
$$;

-- H2. Behind "Show students" (DM-20): name order; days practised this week;
-- struggling skills; in a GRADED class the latest graded session's score.
create or replace function mixed_class_students(p_class_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_basis record;
  v_win   integer;
  v_min   integer;
  v_today date;
begin
  if auth.uid() is null or p_class_id is null or not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  select * into v_basis from mixed_basis(p_class_id);
  v_win   := coalesce((v_basis.settings->>'mixed_struggling_window')::integer, 5);
  v_min   := coalesce((v_basis.settings->>'mixed_struggling_min_right')::integer, 3);
  v_today := (now() at time zone fact_class_zone(p_class_id))::date;

  return (
    with roster as (
      select m.student_id,
             coalesce(nullif(btrim(u.display_name), ''), u.email, 'Unknown') as name
      from class_members m join users u on u.id = m.student_id
      where m.class_id = p_class_id and m.removed_at is null
    ), rec as (select * from mixed_recent(p_class_id, v_win))
    select coalesce(jsonb_agg(jsonb_build_object(
             'student_id', r.student_id,
             'name', r.name,
             'days_this_week', (select count(distinct a.practice_day) from mixed_attempts a
                                 where a.class_id = p_class_id and a.student_id = r.student_id
                                   and a.practice_day > v_today - 7),
             'struggling', (select coalesce(jsonb_agg(x.bank_key order by x.bank_key), '[]'::jsonb)
                              from rec x where x.student_id = r.student_id
                               and x.tries - x.right_n > v_win - v_min),
             'latest_score', (select jsonb_build_object('right', s.score_right,
                                                        'answered', s.score_answered,
                                                        'planned', s.planned,
                                                        'practice_day', s.practice_day)
                                from mixed_sessions s
                               where s.class_id = p_class_id and s.student_id = r.student_id
                                 and s.graded
                               order by s.practice_day desc, s.ordinal desc limit 1))
           order by lower(r.name), r.student_id), '[]'::jsonb)
    from roster r);
end;
$$;

-- -----------------------------------------------------------------------------
-- I. the deleters
-- -----------------------------------------------------------------------------
-- I1. prune_mixed_practice — the THIRD function in this repo that deletes
-- student work. DISARMED like 0048: dry-run by default, service-role only,
-- UNSCHEDULED (verify-0066 fails if a cron job ever names it). Arming is a
-- checklist in TODOS with a counsel question and the author's yes.
--
-- Removes sessions past their keep_until, or in a class deleted more than 30
-- days ago, never one started within the last day. An UNGRADED session goes
-- whole; a GRADED one loses its items and attempts but keeps its row and
-- score (ER-7: a practice score follows the grades' retention — it leaves
-- with the account, through purge_soft_deleted). One audit row per class.
create or replace function prune_mixed_practice(p_dry_run boolean default true)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_ids    uuid[];
  v_s      integer := 0;
  v_kept   integer := 0;
  v_i      integer := 0;
  v_a      integer := 0;
  v_class  record;
begin
  select array_agg(s.id) into v_ids
    from mixed_sessions s
    join classes c on c.id = s.class_id
   where s.pruned_at is null
     and s.started_at < now() - interval '1 day'
     and (s.keep_until < current_date or c.deleted_at < now() - interval '30 days');
  if v_ids is null then
    return jsonb_build_object('dry_run', p_dry_run, 'sessions', 0, 'graded_kept', 0,
                              'items', 0, 'attempts', 0);
  end if;

  select count(*) filter (where not graded), count(*) filter (where graded)
    into v_s, v_kept from mixed_sessions where id = any (v_ids);
  select count(*) into v_i from mixed_session_items where session_id = any (v_ids);
  select count(*) into v_a from mixed_attempts where session_id = any (v_ids);

  if not p_dry_run then
    for v_class in
      select s.class_id, count(*) as n,
             count(*) filter (where s.graded) as kept,
             (select count(*) from mixed_attempts a
               where a.session_id = any (array_agg(s.id))) as att
        from mixed_sessions s where s.id = any (v_ids)
       group by s.class_id
    loop
      insert into audit_log (actor_id, action, target_type, target_id, metadata)
      values (null, 'mixed_practice.prune', 'class', v_class.class_id,
              jsonb_build_object('sessions', v_class.n, 'graded_kept', v_class.kept,
                                 'attempts', v_class.att));
    end loop;
    delete from mixed_attempts where session_id = any (v_ids);
    delete from mixed_session_items where session_id = any (v_ids);
    delete from mixed_sessions where id = any (v_ids) and not graded;
    update mixed_sessions set pruned_at = now() where id = any (v_ids) and graded;
  end if;

  return jsonb_build_object('dry_run', p_dry_run, 'sessions', v_s, 'graded_kept', v_kept,
                            'items', v_i, 'attempts', v_a);
end;
$$;

-- I2. purge_soft_deleted v7 — 0050's body plus a COUNTED delete of the mixed
-- rows (attempts, item snapshots, sessions — scores included) for an
-- explicitly-deleted account past its window and for a dormant student. Like
-- practice data, they never BLOCK an account purge.
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
  v_mixed_attempts    int := 0;
  v_mixed_sessions    int := 0;
  v_n               int;
begin
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

  -- 1. Section checks belonging to purge-eligible ACTIVITIES (before the
  --    versions: activity_version_id is ON DELETE RESTRICT, 0022).
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

  -- 2. Submissions linked to deleted assignments (frozen table, 0029).
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

  -- 5. Activities themselves (the rollups CASCADE from here — R1).
  delete from activities where deleted_at < now() - interval '30 days';

  -- 6. Section checks of explicitly-deleted accounts past their window.
  delete from section_checks sc
   where sc.student_id in (
     select u.id from users u
      where u.deleted_at < now() - interval '30 days'
   );
  get diagnostics v_checks_student = row_count;

  -- 6b. (0045, ER-16) Practice data of explicitly-deleted accounts.
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

  -- 6d. (0066) The same for mixed practice's rows. The item snapshots go with
  --     their sessions (they are answer keys, not the student's work).
  delete from mixed_attempts ma
   where ma.student_id in (
     select u.id from users u
      where u.deleted_at < now() - interval '30 days'
   );
  get diagnostics v_mixed_attempts = row_count;
  delete from mixed_session_items mi
   where mi.student_id in (
     select u.id from users u
      where u.deleted_at < now() - interval '30 days'
   );
  delete from mixed_sessions ms
   where ms.student_id in (
     select u.id from users u
      where u.deleted_at < now() - interval '30 days'
   );
  get diagnostics v_mixed_sessions = row_count;

  -- 7. Accounts (0023 precedence: eligible only once no work is retained and
  --    nothing else references the row).
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

    -- (0045/0050/0066) A DORMANT student reaches here with practice data still
    -- held; delete it explicitly so it is counted.
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
    delete from mixed_attempts where student_id = v_uid;
    get diagnostics v_n = row_count;
    v_mixed_attempts := v_mixed_attempts + v_n;
    delete from mixed_session_items where student_id = v_uid;
    delete from mixed_sessions where student_id = v_uid;
    get diagnostics v_n = row_count;
    v_mixed_sessions := v_mixed_sessions + v_n;

    -- Mark this actor's audit rows BEFORE the delete (0024).
    update audit_log
       set metadata = coalesce(metadata, '{}'::jsonb)
                      || jsonb_build_object('actor_purged', true)
     where actor_id = v_uid;

    delete from auth.users where id = v_uid;
    v_accounts := v_accounts + 1;
  end loop;

  insert into analytics_job_runs (
    job_name, section_check_rows, purge_unrolled_destroyed, notes
  )
  values (
    'purge',
    (select count(*) from section_checks),
    v_unrolled,
    format('checks purged %s by activity, %s by student; accounts purged %s, blocked %s; practice purged %s attempts, %s sessions; sprint purged %s attempts, %s sessions; mixed purged %s attempts, %s sessions',
           v_checks_activity, v_checks_student, v_accounts, v_blocked,
           v_practice_attempts, v_practice_sessions,
           v_sprint_attempts, v_sprint_sessions,
           v_mixed_attempts, v_mixed_sessions)
  );

  raise notice
    'purge_soft_deleted: section_checks %+% (activity/student), accounts purged %, accounts blocked %, practice attempts %, practice sessions %, sprint attempts %, sprint sessions %, mixed attempts %, mixed sessions %',
    v_checks_activity, v_checks_student, v_accounts, v_blocked,
    v_practice_attempts, v_practice_sessions, v_sprint_attempts, v_sprint_sessions,
    v_mixed_attempts, v_mixed_sessions;
end;
$$;
revoke execute on function purge_soft_deleted() from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- J. grants
-- -----------------------------------------------------------------------------
-- Migration-created tables do not inherit dashboard default grants (0032).
revoke all on table mixed_settings_revision from anon, authenticated;
revoke all on table mixed_sessions          from anon, authenticated;
revoke all on table mixed_session_items     from anon, authenticated;
revoke all on table mixed_attempts          from anon, authenticated;
grant  select on table mixed_settings_revision to service_role;
grant  select on table mixed_sessions          to service_role;
-- The check function's service role reads the snapshot to sanitize and grade.
grant  select on table mixed_session_items     to service_role;
grant  select on table mixed_attempts          to service_role;

-- Internal: reachable only from the definer RPCs (and the service role).
revoke execute on function mixed_settings_ok(jsonb)                                  from public, anon, authenticated;
revoke execute on function mixed_basis(uuid)                                         from public, anon, authenticated;
revoke execute on function mixed_taught(uuid, uuid, text)                            from public, anon, authenticated;
revoke execute on function mixed_steps(uuid, uuid, integer[], integer)               from public, anon, authenticated;
revoke execute on function mixed_plan(uuid, uuid, uuid, date, integer, jsonb, integer, text) from public, anon, authenticated;
revoke execute on function mixed_row_index(uuid, text, integer)                      from public, anon, authenticated;
revoke execute on function mixed_session_payload(uuid)                               from public, anon, authenticated;
revoke execute on function mixed_recent(uuid, integer)                               from public, anon, authenticated;
grant  execute on function mixed_settings_ok(jsonb)                                  to service_role;
grant  execute on function mixed_basis(uuid)                                         to service_role;
grant  execute on function mixed_taught(uuid, uuid, text)                            to service_role;
grant  execute on function mixed_steps(uuid, uuid, integer[], integer)               to service_role;
grant  execute on function mixed_plan(uuid, uuid, uuid, date, integer, jsonb, integer, text) to service_role;
grant  execute on function mixed_row_index(uuid, text, integer)                      to service_role;
grant  execute on function mixed_session_payload(uuid)                               to service_role;
grant  execute on function mixed_recent(uuid, integer)                               to service_role;

-- Service role only: the mirror, the verdict write, the deleter (0009).
revoke execute on function sync_mixed_settings(jsonb, boolean)                       from public, anon, authenticated;
grant  execute on function sync_mixed_settings(jsonb, boolean)                       to service_role;
revoke execute on function record_mixed_attempt(uuid, uuid, integer, boolean, boolean, jsonb, jsonb) from public, anon, authenticated;
grant  execute on function record_mixed_attempt(uuid, uuid, integer, boolean, boolean, jsonb, jsonb) to service_role;
revoke execute on function prune_mixed_practice(boolean)                             from public, anon, authenticated;
grant  execute on function prune_mixed_practice(boolean)                             to service_role;

-- Client-callable, each by a signed-in user; each checks the caller itself.
revoke execute on function set_mixed_practice(uuid, boolean)                from public, anon;
grant  execute on function set_mixed_practice(uuid, boolean)                to authenticated, service_role;
revoke execute on function set_mixed_settings(uuid, integer, boolean)       from public, anon;
grant  execute on function set_mixed_settings(uuid, integer, boolean)       to authenticated, service_role;
revoke execute on function start_mixed_session(uuid, boolean)               from public, anon;
grant  execute on function start_mixed_session(uuid, boolean)               to authenticated, service_role;
revoke execute on function mixed_item_for_check(uuid, integer)              from public, anon;
grant  execute on function mixed_item_for_check(uuid, integer)              to authenticated, service_role;
revoke execute on function finish_mixed_session(uuid)                       from public, anon;
grant  execute on function finish_mixed_session(uuid)                       to authenticated, service_role;
revoke execute on function mixed_class_summary(uuid)                        from public, anon;
grant  execute on function mixed_class_summary(uuid)                        to authenticated, service_role;
revoke execute on function mixed_class_students(uuid)                       from public, anon;
grant  execute on function mixed_class_students(uuid)                       to authenticated, service_role;

-- =============================================================================
-- Verification lives in scripts/verify-0066.sql (registered in the verify
-- runner): catalog posture; the settings mirror; the switch; the pool (not the
-- same day, across timezones; per-student taught; copy lineage; draft and
-- retired items excluded; discrimination needs ALL its skills); the day rule
-- and the one-step drop; the fill order and caps; the seeding; idempotent
-- start; the caller checks; record-before-verdict replays; the teacher reads;
-- the prune (disarmed, unscheduled, keeps graded scores) and the purge.
-- =============================================================================
