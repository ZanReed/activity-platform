-- =============================================================================
-- 0091_review_period.sql — the review period, the scheduler half
-- (docs/design/review-period.md, RV-0 … RV-14, ruled by the author 2026-11-17;
-- the curriculum side's C-196, ten review_* keys in their PR #98)
-- -----------------------------------------------------------------------------
-- A review period is the mixed scheduler run longer and further back. A teacher
-- places one on a day. On that day the student's ordinary "start practice"
-- plans a REVIEW session instead of the daily block, so a student never gets
-- both, and one entry serves both (the Fable review's RV-3 finding).
--
--   §A  mixed_settings_ok: the ten review_* keys, all or none (C-196 bounds)
--   §B  classes.period_minutes + set_class_period_minutes (RV-2)
--   §C  class_period_reviews + set_class_review (RV-14 (a): one per day)
--   §D  the markers: mixed_sessions.review; items' position + retry_of;
--       attempts' retry
--   §E  review_items_for: the session's size (C-196 §1)
--   §F  review_plan: due, then pulled forward by elapsed share; ≤ 2 a skill,
--       5 apart; discrimination ≤ a third; focus chains ≤ 60% (RV-4, RV-10)
--   §G  mixed_plan: the exhausted-session top-up orders by elapsed share (RV-6)
--   §H  start_mixed_session v3: a review on a review day; "done today" after it
--   §I  record_mixed_attempt v3: the re-try (RV-5); score and finish count
--       planned items only
--   §J  mixed_session_payload v2 (serving order); mixed_recent,
--       mixed_student_recent, mixed_who_first and finish_mixed_session's skip
--       count leave re-tries out (RV-9)
--
-- PULLED-FORWARD items reuse 0081's `early` marker. Right or skipped, it keeps
-- the step and due date (review_pulled_step_up = false, review_pulled_moves_due
-- = false). Wrong, it drops a step and restarts from today. A skill already
-- practised TODAY is never pulled forward: mixed_steps collapses a day to "not
-- wrong" + "has early", so a right due item and an early item on one skill on
-- one day would erase the due item's step-up.
--
-- A RE-TRY is an item appended mid-session after a wrong (not skipped) answer
-- on a planned item: same key, the next template, at least
-- review_same_skill_min_gap items later in serving order. It inherits its
-- original's `early`. It never earns a re-try, never counts in the practice
-- score, and carries no misconception ids (the panel's readers count each
-- attempt as a first try). It can't move the step: its day already holds the
-- wrong answer.
--
-- PERSONAL DATA: no new table of student data. class_period_reviews names no
-- person (who set it is in audit_log). The new columns on mixed_sessions,
-- mixed_session_items and mixed_attempts are flags and an order on rows the
-- data map already covers; their retention and their (disarmed) prune are
-- unchanged.
--
-- ORDER (OV-7): apply this BEFORE the importer change that mirrors the review
-- keys, and before any UI that places a review. Nothing calls it until then:
-- with no review keys mirrored, or no review placed, start_mixed_session
-- behaves as 0081's did.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. The settings check: 0083's, plus the ten review_* keys, all or none.
-- -----------------------------------------------------------------------------
create or replace function mixed_settings_ok(s jsonb)
returns boolean
language sql
immutable
set search_path = public
as $fn$
  select s is not null
    and jsonb_typeof(s) = 'object'
    and (select count(*) from jsonb_object_keys(s))
          = 7 + (s ? 'dol_practice_items')::integer
              + 2 * (s ? 'period_shapes')::integer
              + 10 * (s ? 'review_items_max')::integer
    -- Both or neither (0083): the helper line needs the two together.
    and (s ? 'period_shapes') = (s ? 'mixed_seconds_per_item')
    and (not s ? 'period_shapes'
         or (jsonb_typeof(s->'period_shapes') = 'object'
             -- A missing `lengths` is null here, and a null would pass a CHECK.
             and coalesce(jsonb_typeof(s->'period_shapes'->'lengths'), '') = 'object'
             and jsonb_typeof(s->'mixed_seconds_per_item') = 'array'
             and jsonb_array_length(s->'mixed_seconds_per_item') = 2
             and jsonb_typeof(s->'mixed_seconds_per_item'->0) = 'number'
             and jsonb_typeof(s->'mixed_seconds_per_item'->1) = 'number'
             and (s->'mixed_seconds_per_item'->>0)::numeric >= 1
             and (s->'mixed_seconds_per_item'->>1)::numeric >= (s->'mixed_seconds_per_item'->>0)::numeric))
    and (not s ? 'dol_practice_items'
         or (jsonb_typeof(s->'dol_practice_items') = 'number'
             and (s->>'dol_practice_items')::numeric = trunc((s->>'dol_practice_items')::numeric)
             and (s->>'dol_practice_items')::numeric between 2 and 8))
    -- 0091 (C-196): all ten or none. The count above already refuses a stray
    -- key, so "all ten" is "review_items_max present and the rest too".
    and (not s ? 'review_items_max'
         or (s ?& array['review_items_max', 'review_max_items_per_skill', 'review_same_skill_min_gap',
                        'review_retry_after_wrong', 'review_max_discrimination_share',
                        'review_pull_order', 'review_pulled_step_up', 'review_pulled_moves_due',
                        'review_min_fill', 'review_focus_share']
             and (select bool_and(jsonb_typeof(s->k) = 'number'
                                  and (s->>k)::numeric = trunc((s->>k)::numeric)
                                  and (s->>k)::numeric >= 1)
                    from unnest(array['review_items_max', 'review_max_items_per_skill',
                                      'review_same_skill_min_gap']) k)
             -- The session's `planned` is held to 1–50 (0066).
             and (s->>'review_items_max')::numeric <= 50
             and jsonb_typeof(s->'review_retry_after_wrong') = 'number'
             and (s->>'review_retry_after_wrong')::numeric = trunc((s->>'review_retry_after_wrong')::numeric)
             and (s->>'review_retry_after_wrong')::numeric >= 0
             and (select bool_and(jsonb_typeof(s->k) = 'number'
                                  and (s->>k)::numeric between 0 and 1)
                    from unnest(array['review_max_discrimination_share', 'review_min_fill',
                                      'review_focus_share']) k)
             and s->>'review_pull_order' = 'elapsed_share'
             and jsonb_typeof(s->'review_pulled_step_up') = 'boolean'
             and jsonb_typeof(s->'review_pulled_moves_due') = 'boolean'))
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

-- -----------------------------------------------------------------------------
-- B. The class's period length (RV-2)
-- -----------------------------------------------------------------------------
alter table classes add column period_minutes smallint
  check (period_minutes is null or period_minutes between 1 and 240);

comment on column classes.period_minutes is
  'The class''s ordinary period length in minutes (0091, RV-2): one of the mirrored period_shapes lengths, or NULL = the shortest mirrored length. Sizes a review session (review_items_for). Set through set_class_period_minutes. No personal data.';

create or replace function set_class_period_minutes(p_class_id uuid, p_minutes integer)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_old  smallint;
  v_basis record;
begin
  if not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  if p_minutes is not null then
    select * into v_basis from mixed_basis(p_class_id);
    if v_basis.settings is null
       or not coalesce(v_basis.settings->'period_shapes'->'lengths' ? p_minutes::text, false) then
      raise exception 'not_a_period_length';
    end if;
  end if;
  select period_minutes into v_old from classes where id = p_class_id and deleted_at is null for update;
  if not found then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  if v_old is distinct from p_minutes then
    update classes set period_minutes = p_minutes where id = p_class_id;
    insert into audit_log (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'class.update', 'class', p_class_id,
            jsonb_build_object('op', 'period_minutes', 'minutes', p_minutes, 'was', v_old));
  end if;
  return jsonb_build_object('period_minutes', p_minutes);
end;
$$;

-- -----------------------------------------------------------------------------
-- C. A review on a day (RV-14 (a): its own table; one a day)
-- -----------------------------------------------------------------------------
create table class_period_reviews (
  class_id     uuid not null references classes(id) on delete cascade,
  on_date      date not null,
  -- RV-10: the chains a coming unit test covers. Empty = unweighted.
  focus_chains text[] not null default '{}'
    check (cardinality(focus_chains) <= 40),
  -- RV-2: the odd double period.
  is_double    boolean not null default false,
  primary key (class_id, on_date)
);

alter table class_period_reviews enable row level security;
alter table class_period_reviews force row level security;
-- No policies: read and written only through the definer functions.
revoke all on class_period_reviews from anon, authenticated;

comment on table class_period_reviews is
  'A review period placed on a day (0091, RV-14): the class, the date, the focus chains, a double flag. Teacher-set, class-scoped, NO PERSON NAMED (who set it is in audit_log). One a day; past days are removed by set_class_review. Read by start_mixed_session (today) and the planner.';

-- Place, change or remove a review (p_on = false removes it). Today or later,
-- within the planner's limit; audited like set_class_plan. A focus chain must
-- be a chain id.
create or replace function set_class_review(p_class_id uuid, p_on_date date, p_on boolean,
                                            p_focus_chains text[] default '{}',
                                            p_is_double boolean default false)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_today date;
  v_focus text[] := coalesce(p_focus_chains, '{}');
begin
  v_today := class_plan_begin(p_class_id);              -- teacher check + lock
  perform class_plan_check_day(p_class_id, v_today, p_on_date, coalesce(p_on, false));
  delete from class_period_reviews where class_id = p_class_id and on_date < v_today;

  if coalesce(p_on, false) then
    if exists (select 1 from unnest(v_focus) f where f !~ '^chain\.[a-z0-9][a-z0-9.-]*$')
       or cardinality(v_focus) > 40 then
      raise exception 'bad_focus_chain';
    end if;
    select coalesce(array_agg(distinct f order by f), '{}') into v_focus from unnest(v_focus) f;
    insert into class_period_reviews (class_id, on_date, focus_chains, is_double)
    values (p_class_id, p_on_date, v_focus, coalesce(p_is_double, false))
    on conflict (class_id, on_date) do update
      set focus_chains = excluded.focus_chains, is_double = excluded.is_double;
    insert into audit_log (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'class.update', 'class', p_class_id,
            jsonb_build_object('op', 'review_set', 'on_date', p_on_date,
                               'focus_chains', to_jsonb(v_focus), 'is_double', coalesce(p_is_double, false)));
  else
    delete from class_period_reviews where class_id = p_class_id and on_date = p_on_date;
    if found then
      insert into audit_log (actor_id, action, target_type, target_id, metadata)
      values (auth.uid(), 'class.update', 'class', p_class_id,
              jsonb_build_object('op', 'review_remove', 'on_date', p_on_date));
    end if;
  end if;
  return coalesce((select jsonb_build_object('on_date', r.on_date, 'focus_chains', to_jsonb(r.focus_chains),
                                             'is_double', r.is_double)
                     from class_period_reviews r
                    where r.class_id = p_class_id and r.on_date = p_on_date),
                  jsonb_build_object('on_date', p_on_date, 'removed', true));
end;
$$;

-- -----------------------------------------------------------------------------
-- D. The markers
-- -----------------------------------------------------------------------------
alter table mixed_sessions add column review boolean not null default false;
comment on column mixed_sessions.review is
  'A review-period session (0091): planned by review_plan, sized by review_items_for, may gain re-tries.';

-- Serving order. Planned items: position = seq. A re-try: a half step after
-- the item it lands behind, so it sits between two planned items.
alter table mixed_session_items add column position numeric;
update mixed_session_items set position = seq where position is null;
alter table mixed_session_items alter column position set not null;
-- An insert that names no position (every writer before 0091, and the older
-- verify scripts' fixtures) serves in seq order, as before.
create or replace function mixed_session_items_position()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.position is null then
    new.position := new.seq;
  end if;
  return new;
end;
$$;
create trigger mixed_session_items_position
  before insert on mixed_session_items
  for each row execute function mixed_session_items_position();
alter table mixed_session_items add column retry_of integer
  check (retry_of is null or retry_of >= 1);
comment on column mixed_session_items.position is
  'Serving order (0091). Planned items: = seq. A re-try: fractional, after the item it follows.';
comment on column mixed_session_items.retry_of is
  'For a re-try (0091, RV-5): the seq of the planned item it re-asks. NULL for planned items.';

alter table mixed_attempts add column retry boolean not null default false;
comment on column mixed_attempts.retry is
  'Copied from the item (0091): an attempt on a re-try. Left out of the practice score, the finish count and the panel''s reads.';

-- -----------------------------------------------------------------------------
-- E. The review session's size (C-196 §1): (period − sprint) × 60 ÷ 90 s,
-- capped at review_items_max. NULL when the review keys aren't mirrored.
-- -----------------------------------------------------------------------------
create or replace function review_items_for(p_class_id uuid, p_settings jsonb, p_is_double boolean)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_class   classes%rowtype;
  v_lengths jsonb := p_settings->'period_shapes'->'lengths';
  v_len     text;
  v_minutes numeric;
  v_sprint  numeric := 0;
  v_secs    numeric;
  v_max     integer;
begin
  if p_settings is null or not p_settings ? 'review_items_max' then
    return null;
  end if;
  v_max := (p_settings->>'review_items_max')::integer;
  if v_lengths is null or jsonb_typeof(v_lengths) <> 'object' then
    return v_max;
  end if;
  select * into v_class from classes where id = p_class_id;
  v_len := coalesce(case when v_lengths ? v_class.period_minutes::text then v_class.period_minutes::text end,
                    (select k from jsonb_object_keys(v_lengths) k order by k::numeric limit 1));
  v_minutes := v_len::numeric * case when coalesce(p_is_double, false) then 2 else 1 end;
  -- The sprint stays in the period when it's on (C-196): its block's longer end.
  if v_class.fact_sprint_on_at is not null then
    select coalesce(max((b->'minutes'->>1)::numeric), 0) into v_sprint
      from jsonb_array_elements(v_lengths->v_len) b
     where b->>'kind' = 'fluency' and jsonb_typeof(b->'minutes') = 'array';
  end if;
  -- Sized at the slower end, 90 s (C-196).
  v_secs := greatest((p_settings->'mixed_seconds_per_item'->>1)::numeric, 1);
  return greatest(0, least(v_max, floor((v_minutes - v_sprint) * 60 / v_secs)::integer));
end;
$$;

-- -----------------------------------------------------------------------------
-- F. The review plan (RV-4, RV-10; C-196 §§2–6, 8)
-- -----------------------------------------------------------------------------
-- One row per planned item, in serving order (seq = position). Keys are
-- taken in this order, at most `review_max_items_per_skill` items each:
--   due:    never-practised skills (capped by mixed_new_skills_per_session, as
--           in the daily block), then skills due today, then discrimination
--           banks never practised or due;
--   pulled: not-yet-due skills, then banks, by elapsed share (days since the
--           key was last practised, of any kind ÷ the current interval),
--           highest first. Never one already practised today. Marked early.
--           "Last practised", not "the schedule last moved": a right early
--           item leaves the schedule alone, so a schedule-dated share would
--           pull the same skill forward every day.
-- Pass 1 takes one item a key in that order, pass 2 a second, and so on.
-- Discrimination items are held to floor(share × N). With focus chains,
-- focus keys take at most floor(focus_share × N) and the rest fill from the
-- others. Then a greedy placement keeps each key's items gap apart, relaxing
-- to never adjacent, then to anything, when the pool is too small.
create or replace function review_plan(
  p_class_id uuid, p_student_id uuid, p_session_id uuid, p_today date,
  p_settings jsonb, p_items integer, p_zone text, p_focus_chains text[])
returns table (seq integer, kind text, bank_key text, owner_id uuid, item_id text, early boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_intervals integer[] := array(select (jsonb_array_elements_text(p_settings->'mixed_step_intervals'))::integer);
  v_drop      integer := (p_settings->>'mixed_wrong_drop')::integer;
  v_new_cap   integer := (p_settings->>'mixed_new_skills_per_session')::integer;
  v_per       integer := (p_settings->>'review_max_items_per_skill')::integer;
  v_disc_cap  integer := floor(p_items * (p_settings->>'review_max_discrimination_share')::numeric)::integer;
  v_focus_cap integer;
  v_focus     text[]  := coalesce(p_focus_chains, '{}');
  v_keys      jsonb;   -- [{kind, key, early, focus, items: [{owner_id, item_id}]}] in priority order
  v_sel       jsonb := '[]'::jsonb;   -- chosen items, priority order: {kind, key, early, owner_id, item_id, k}
  v_n         integer := 0;
  v_ndisc     integer := 0;
  v_nfocus    integer := 0;
  v_pass      integer;
  v_part      integer;
  v_k         jsonb;
  v_items     jsonb;
  v_out       jsonb := '[]'::jsonb;
  v_i         integer;
begin
  if p_items is null or p_items < 1 then
    return;
  end if;
  v_focus_cap := case when cardinality(v_focus) = 0 then p_items
                      else floor(p_items * (p_settings->>'review_focus_share')::numeric)::integer end;

  with taught as (
    select t.* from mixed_taught(p_class_id, p_student_id, p_zone) t
    where t.taught_day < p_today
  ),
  -- A taught skill is a FOCUS skill when one of its source activities sits in
  -- a ticked chain's folder ("NNN-chain.x.y/…", RV-10).
  focus_skills as (
    select distinct src.primary_skill as skill_id
    from class_activities ca
    join activities a   on a.id = ca.activity_id
    join activities src on src.id = coalesce(a.copied_from_activity_id, a.id)
    where ca.class_id = p_class_id and src.primary_skill is not null
      and cardinality(v_focus) > 0
      and regexp_replace(split_part(coalesce(src.source_path, ''), '/', 1), '^[0-9]+-', '') = any (v_focus)
  ),
  pool as (
    select t.skill_id, min(t.taught_day) as taught_day, min(t.chain_order) as chain_order,
           array_agg(distinct t.owner_id) as owners
    from taught t
    where exists (select 1 from practice_item p
                   where p.owner_id = t.owner_id and p.skill_id = t.skill_id
                     and p.role = 'skill' and p.status = 'ratified' and p.retired_at is null
                     and mixed_tier_ok(p.tier, p_student_id, p.skill_id))
    group by t.skill_id
  ),
  st as (select * from mixed_steps(p_class_id, p_student_id, v_intervals, v_drop)),
  sk as (
    select pool.*, st.step, st.last_day, st.due_on, st.last_any,
           (pool.skill_id in (select skill_id from focus_skills)) as focus
    from pool left join st on st.kind = 'skill' and st.bank_key = pool.skill_id
  ),
  disc as (
    select p.owner_id as owner, split_part(p.item_id, '#', 1) as stem, min(p.discriminates) as skills
    from practice_item p
    where p.role = 'discrimination' and p.status = 'ratified' and p.retired_at is null
      and exists (select 1 from taught t where t.owner_id = p.owner_id)
    group by p.owner_id, split_part(p.item_id, '#', 1)
  ),
  disc_ok as (
    select d.*, st.step, st.last_day, st.due_on, st.last_any,
           (cardinality(v_focus) > 0
            and d.skills <@ coalesce((select array_agg(skill_id) from focus_skills), '{}')) as focus
    from disc d
    left join st on st.kind = 'discrimination' and st.bank_key = d.stem
    -- C-148: every covered skill TAUGHT to this student.
    where (select coalesce(array_agg(distinct t.skill_id), '{}') from taught t) @> d.skills
  ),
  keyed as (
    -- due: new skills (capped), then due skills
    select 'skill'::text as kind, x.skill_id as key, x.owners, false as early, x.focus,
           1 as tier, x.r::numeric as ord
    from (select y.*, row_number() over (order by (y.taught_day = y.latest) desc,
                                                  y.chain_order, y.taught_day, y.skill_id) as r
            from (select sk.*, max(sk.taught_day) over () as latest
                    from sk where sk.step is null) y) x
    where x.r <= v_new_cap
    union all
    select 'skill', sk.skill_id, sk.owners, false, sk.focus, 2,
           row_number() over (order by sk.step, sk.due_on, sk.chain_order, sk.skill_id)
    from sk where sk.step is not null and sk.due_on <= p_today and sk.last_any < p_today
    union all
    select 'discrimination', d.stem, array[d.owner], false, d.focus, 3,
           row_number() over (order by d.step nulls first, d.due_on, d.stem)
    from disc_ok d
    where d.step is null or (d.due_on <= p_today and d.last_any < p_today)
    union all
    -- pulled forward, by elapsed share
    select 'skill', sk.skill_id, sk.owners, true, sk.focus, 4,
           row_number() over (order by (p_today - sk.last_any)::numeric / v_intervals[sk.step + 1] desc,
                                       sk.chain_order, sk.skill_id)
    from sk where sk.step is not null and sk.due_on > p_today and sk.last_any < p_today
    union all
    select 'discrimination', d.stem, array[d.owner], true, d.focus, 5,
           row_number() over (order by (p_today - d.last_any)::numeric / v_intervals[d.step + 1] desc, d.stem)
    from disc_ok d
    where d.step is not null and d.due_on > p_today and d.last_any < p_today
  ),
  -- Each key's templates, in bank order starting after the last one served.
  last_seen as (
    select distinct on (si.kind, si.bank_key) si.kind, si.bank_key, si.owner_id, si.item_id
    from mixed_session_items si
    join mixed_sessions s on s.id = si.session_id
    where s.class_id = p_class_id and s.student_id = p_student_id
    order by si.kind, si.bank_key, s.started_at desc, si.position desc
  ),
  cand as (
    select k.kind, k.key, p.owner_id, p.item_id,
           row_number() over (
             partition by k.kind, k.key
             order by case when lp.item_id is null then 0
                           when (p.owner_id::text, p.position, p.item_id)
                                > (lp.owner_id::text, lp.position, lp.item_id) then 0
                           else 1 end,
                      p.owner_id::text, p.position, p.item_id) as r
    from keyed k
    join practice_item p
      on p.owner_id = any (k.owners) and p.status = 'ratified' and p.retired_at is null
     and ((k.kind = 'skill' and p.role = 'skill' and p.skill_id = k.key
           and mixed_tier_ok(p.tier, p_student_id, p.skill_id))
       or (k.kind = 'discrimination' and p.role = 'discrimination'
           and split_part(p.item_id, '#', 1) = k.key))
    left join last_seen l on l.kind = k.kind and l.bank_key = k.key
    left join practice_item lp on lp.owner_id = l.owner_id and lp.item_id = l.item_id
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'kind', k.kind, 'key', k.key, 'early', k.early, 'focus', k.focus,
           'items', (select jsonb_agg(jsonb_build_object('owner_id', c.owner_id, 'item_id', c.item_id)
                                      order by c.r)
                       from cand c where c.kind = k.kind and c.key = k.key))
         order by k.tier, k.ord), '[]'::jsonb)
    into v_keys
  from keyed k
  where exists (select 1 from cand c where c.kind = k.kind and c.key = k.key);

  -- Selection: focus part first (when any focus is ticked), then the rest;
  -- within a part, pass 1 = one item a key, pass 2 = a second, …
  -- Part 3 (focus only): when the other keys run out, focus keys fill what's
  -- left, so ticking every chain doesn't stop the session at 60%. The cap
  -- weights the session towards the test; it never leaves it short.
  for v_part in 1..3 loop
    continue when v_part <> 2 and cardinality(v_focus) = 0;
    for v_pass in 1..greatest(v_per, 1) loop
      for v_k in select e from jsonb_array_elements(v_keys) e loop
        exit when v_n >= p_items;
        continue when cardinality(v_focus) > 0 and (v_k->>'focus')::boolean <> (v_part <> 2);
        continue when v_part = 1 and v_nfocus >= v_focus_cap;
        -- Part 3 takes only items part 1 didn't (the same key's next pass).
        continue when v_part = 3 and exists (select 1 from jsonb_array_elements(v_sel) e
                                              where e->>'kind' = v_k->>'kind' and e->>'key' = v_k->>'key'
                                                and (e->>'k')::integer = v_pass);
        continue when v_k->>'kind' = 'discrimination' and v_ndisc >= v_disc_cap;
        v_items := v_k->'items';
        v_i := ((v_pass - 1) % jsonb_array_length(v_items));
        v_sel := v_sel || jsonb_build_array(jsonb_build_object(
                   'kind', v_k->>'kind', 'key', v_k->>'key', 'early', (v_k->>'early')::boolean,
                   'owner_id', v_items->v_i->>'owner_id', 'item_id', v_items->v_i->>'item_id',
                   'k', v_pass,
                   -- a per-session shuffle of first items; seconds follow in the same order
                   'h', md5(p_session_id::text || ':r:' || (v_k->>'kind') || ':' || (v_k->>'key'))));
        v_n := v_n + 1;
        if v_k->>'kind' = 'discrimination' then v_ndisc := v_ndisc + 1; end if;
        if v_part <> 2 then v_nfocus := v_nfocus + 1; end if;
      end loop;
    end loop;
  end loop;

  -- Placement: every key's first item before any key's second (pass order),
  -- repeating keys first within a pass, then a per-session shuffle. A key's
  -- items are then at least as many places apart as there are keys, which
  -- meets review_same_skill_min_gap whenever the pool has that many keys.
  -- With fewer it can't be met by any order, and this is as far apart as the
  -- pool allows: never adjacent unless the pool is a single key (C-196 §3's
  -- relaxation). verify-0091 B6 holds the order to that bound.
  select coalesce(jsonb_agg(x.e || jsonb_build_object('pos', x.pos) order by x.pos), '[]'::jsonb)
    into v_out
    from (select y.e, row_number() over (order by (y.e->>'k')::integer, y.c desc, y.e->>'h') as pos
            from (select e, count(*) over (partition by e->>'kind', e->>'key') as c
                    from jsonb_array_elements(v_sel) e) y) x;

  return query
    select (e->>'pos')::integer, e->>'kind', e->>'key', (e->>'owner_id')::uuid, e->>'item_id',
           (e->>'early')::boolean
      from jsonb_array_elements(v_out) e
     order by (e->>'pos')::integer;
end;
$$;

-- -----------------------------------------------------------------------------
-- G. 0081's plan, with the top-up (t4) ordered by elapsed share (RV-6, C-196 §5)
-- -----------------------------------------------------------------------------
create or replace function mixed_plan(
  p_class_id uuid, p_student_id uuid, p_session_id uuid, p_today date,
  p_ordinal integer, p_settings jsonb, p_items integer, p_zone text)
returns table (seq integer, kind text, bank_key text, owner_id uuid, item_id text, early boolean)
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
                     and p.role = 'skill' and p.status = 'ratified' and p.retired_at is null
                     and mixed_tier_ok(p.tier, p_student_id, p.skill_id))      -- 0070 D66
    group by t.skill_id
  ),
  st as (select * from mixed_steps(p_class_id, p_student_id, v_intervals, v_drop)),
  sk as (
    select pool.*, st.step, st.last_day, st.due_on, st.last_any, st.last_any_early
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
    select d.*, st.step, st.last_day, st.due_on, st.last_any
    from disc d
    left join st on st.kind = 'discrimination' and st.bank_key = d.stem
    -- C-148 (author ruling 2026-10-20): every covered skill TAUGHT, not every
    -- covered skill banked; a skill with no bank of its own still counts.
    where (select coalesce(array_agg(distinct t.skill_id), '{}') from taught t) @> d.skills
  ),
  t1 as (
    select 'skill'::text as kind, sk.skill_id as key, sk.owners, 1 as tier, false as early,
           row_number() over (
             order by (sk.taught_day = sk.latest) desc,
                      sk.chain_order, sk.taught_day, sk.skill_id) as r
    from (select sk.*, max(sk.taught_day) over () as latest
            from sk where sk.step is null) sk
  ),
  t2 as (
    select 'skill'::text as kind, sk.skill_id as key, sk.owners, 2 as tier, false as early,
           row_number() over (order by sk.step, sk.due_on, sk.chain_order, sk.skill_id) as r
    from sk where sk.step is not null and sk.due_on <= p_today and sk.last_any < p_today
  ),
  t3 as (
    select 'discrimination'::text as kind, d.stem as key, array[d.owner] as owners, 3 as tier, false as early,
           row_number() over (order by d.step nulls first, d.due_on, d.stem) as r
    from disc_ok d
    where d.step is null or (d.due_on <= p_today and d.last_any < p_today)
  ),
  picked as (
    select * from (select * from t1 where t1.r <= least(v_new_cap, p_items)) a
    union all
    select * from (select * from t2
                    where t2.r <= p_items - least(v_new_cap, p_items, (select count(*) from t1))) b
  ),
  picked_all as (
    select * from picked
    union all
    select * from t3
     where t3.r <= least(v_disc_cap, p_items - (select count(*) from picked))
  ),
  -- 0091 (RV-6, C-196 §5): the top-up ranks not-yet-due skills by ELAPSED
  -- SHARE (days since last practised, of any kind ÷ the current interval),
  -- highest first, replacing 0081's stalest-first. Same staleness reading as
  -- 0081, now weighed by the interval.
  t4 as (
    select 'skill'::text as kind, sk.skill_id as key, sk.owners, 4 as tier, true as early,
           row_number() over (order by (p_today - sk.last_any)::numeric / v_intervals[sk.step + 1] desc,
                                       sk.chain_order, sk.skill_id) as r
    from sk
    where p_ordinal > 1 and sk.step is not null
      and sk.due_on > p_today and sk.last_any < p_today
  ),
  t5 as (
    select 'skill'::text as kind, sk.skill_id as key, sk.owners, 5 as tier,
           sk.last_any_early as early,
           row_number() over (order by sk.step, sk.chain_order, sk.skill_id) as r
    from sk
    where p_ordinal > 1 and sk.last_any = p_today
  ),
  picked_t4 as (
    select * from t4
     where t4.r <= p_items - (select count(*) from picked_all)
  ),
  chosen as (
    select * from picked_all
    union all
    select * from picked_t4
    union all
    select * from t5
     where t5.r <= p_items - (select count(*) from picked_all) - (select count(*) from picked_t4)
  ),
  last_seen as (
    select distinct on (si.kind, si.bank_key) si.kind, si.bank_key, si.owner_id, si.item_id
    from mixed_session_items si
    join mixed_sessions s on s.id = si.session_id
    where s.class_id = p_class_id and s.student_id = p_student_id
    order by si.kind, si.bank_key, s.started_at desc, si.seq desc
  ),
  cand as (
    select c.kind, c.key, c.early, p.owner_id, p.item_id, p.position
    from chosen c
    join practice_item p
      on p.owner_id = any (c.owners) and p.status = 'ratified' and p.retired_at is null
     and ((c.kind = 'skill' and p.role = 'skill' and p.skill_id = c.key
           and mixed_tier_ok(p.tier, p_student_id, p.skill_id))                -- 0070 D66
       or (c.kind = 'discrimination' and p.role = 'discrimination'
           and split_part(p.item_id, '#', 1) = c.key))
  ),
  item as (
    select distinct on (c.kind, c.key) c.kind, c.key, c.early, c.owner_id, c.item_id
    from cand c
    left join last_seen l on l.kind = c.kind and l.bank_key = c.key
    left join practice_item lp on lp.owner_id = l.owner_id and lp.item_id = l.item_id
    order by c.kind, c.key,
             case when lp.item_id is null then 0
                  when (c.owner_id::text, c.position, c.item_id)
                       > (lp.owner_id::text, lp.position, lp.item_id) then 0
                  else 1 end,
             c.owner_id::text, c.position, c.item_id
  ),
  cluster as (
    select i.kind, i.key, i.early, i.owner_id, i.item_id,
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
         c.kind, c.key, c.owner_id, c.item_id, c.early
  from cluster c;
end;
$$;

-- -----------------------------------------------------------------------------
-- H. start_mixed_session v3
-- -----------------------------------------------------------------------------
-- 0081's, plus: on a day with a review placed (and the review keys mirrored),
-- the next start plans a REVIEW session. After a finished review the day is
-- done ("done_today"): no top-up follows a review. An open session of either
-- kind is resumed as before. The payload's common part gains `review` (this
-- start is a review) and, when it is, `capacity` (the session's size) and
-- `thin` (the plan is below review_min_fill of it, C-196 §6).
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
  v_rev    class_period_reviews%rowtype;
  v_review boolean := false;
  v_reviewed boolean;
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

  select * into v_rev from class_period_reviews where class_id = v_class.id and on_date = v_today;
  if v_rev.class_id is not null and v_basis.settings ? 'review_items_max' then
    v_review := true;
    v_items := review_items_for(v_class.id, v_basis.settings, v_rev.is_double);
  end if;

  -- A review counts as done only when every planned item was answered: a
  -- student who stops early can come back to it (the next start plans the
  -- rest, never re-serving a skill practised today).
  select count(*), (array_agg(s.id order by s.ordinal desc) filter (where s.finished_at is null))[1],
         coalesce(bool_or(s.review and s.finished_at is not null
                          and (select count(*) from mixed_attempts a
                                where a.session_id = s.id and not a.retry) >= s.planned), false)
    into v_count, v_open, v_reviewed
    from mixed_sessions s
   where s.class_id = v_class.id and s.student_id = v_uid and s.practice_day = v_today;
  -- Resuming reports the open session's own kind (and size).
  if v_open is not null then
    select s.review into v_review from mixed_sessions s where s.id = v_open;
    if not v_review then
      v_items := coalesce(v_class.mixed_items_per_session,
                          (v_basis.settings->>'mixed_items_per_session')::integer);
    end if;
  end if;
  v_common := jsonb_build_object('done_today', v_count - (v_open is not null)::integer,
                                 'graded', v_class.mixed_graded,
                                 'items_per_session', v_items,
                                 'review', v_review and not v_reviewed);
  if v_review and not v_reviewed then
    v_common := v_common || jsonb_build_object('capacity', v_items);
  end if;

  if v_open is not null then
    return v_common || jsonb_build_object('state', 'resume', 'session', mixed_session_payload(v_open));
  end if;
  if v_reviewed then
    return v_common || jsonb_build_object('state', 'done_today');
  end if;

  if not exists (
       select 1 from mixed_taught(v_class.id, v_uid, v_zone) t
        where t.taught_day < v_today
          and exists (select 1 from practice_item p
                       where p.owner_id = t.owner_id and p.skill_id = t.skill_id
                         and p.role = 'skill' and p.status = 'ratified' and p.retired_at is null)) then
    return v_common || jsonb_build_object('state', 'nothing_taught');
  end if;

  if v_review then
    select coalesce(jsonb_agg(to_jsonb(p) order by p.seq), '[]'::jsonb) into v_plan
      from review_plan(v_class.id, v_uid, v_id, v_today, v_basis.settings, v_items,
                       v_zone, v_rev.focus_chains) p;
  else
    select coalesce(jsonb_agg(to_jsonb(p) order by p.seq), '[]'::jsonb) into v_plan
      from mixed_plan(v_class.id, v_uid, v_id, v_today, v_count + 1,
                      v_basis.settings, v_items, v_zone) p;
  end if;
  v_n := jsonb_array_length(v_plan);
  if v_review then
    v_common := v_common || jsonb_build_object(
      'thin', v_n < ceil(v_items * (v_basis.settings->>'review_min_fill')::numeric));
  end if;

  if v_n = 0 then
    return v_common || jsonb_build_object(
      'state', case when v_count > 0 then 'done_today' else 'nothing_due' end);
  end if;
  if not coalesce(p_start, false) then
    return v_common || jsonb_build_object('state', 'ready', 'planned', v_n);
  end if;

  begin
    insert into mixed_sessions (id, class_id, student_id, practice_day, ordinal, revision,
                                graded, planned, keep_until, review)
    values (v_id, v_class.id, v_uid, v_today, v_count + 1, v_basis.revision,
            v_class.mixed_graded, v_n,
            least(v_class.school_year_ends_on + 30, current_date + 400), v_review);
  exception when unique_violation then
    select id into v_open from mixed_sessions
     where class_id = v_class.id and student_id = v_uid and practice_day = v_today
       and finished_at is null
     order by ordinal desc limit 1;
    return v_common || jsonb_build_object('state', 'resume', 'session', mixed_session_payload(v_open));
  end;

  -- ER-4: snapshot every planned item now. A review salts the row with the
  -- seq, so a skill's second item on a one-template bank gets another row.
  insert into mixed_session_items (session_id, seq, student_id, kind, bank_key, owner_id,
                                   item_id, fingerprint, row_index, document, row_values, early,
                                   position)
  select v_id, t.seq, v_uid, t.kind, t.bank_key, p.owner_id, p.item_id, p.fingerprint,
         r.idx, p.document,
         coalesce((select jsonb_object_agg(c.name, (p.value_table->'rows'->r.idx)->((c.i - 1)::int))
                     from jsonb_array_elements_text(p.value_table->'columns') with ordinality c(name, i)),
                  '{}'::jsonb),
         t.early, t.seq
  from jsonb_to_recordset(v_plan) as t(seq integer, kind text, bank_key text,
                                       owner_id uuid, item_id text, early boolean)
  join practice_item p on p.owner_id = t.owner_id and p.item_id = t.item_id
  cross join lateral (select mixed_row_index(v_id,
                                             case when v_review then p.item_id || ':' || t.seq
                                                  else p.item_id end,
                                             jsonb_array_length(p.value_table->'rows')) as idx) r;

  return v_common || jsonb_build_object('state', 'started', 'session', mixed_session_payload(v_id));
end;
$$;

-- -----------------------------------------------------------------------------
-- I. record_mixed_attempt v3: the re-try, and planned-only score and finish
-- -----------------------------------------------------------------------------
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
  v_s     mixed_sessions%rowtype;
  v_i     mixed_session_items%rowtype;
  v_a     mixed_attempts%rowtype;
  v_new   boolean := false;
  v_set   jsonb;
  v_retry integer;
  v_pos   numeric;
  v_next  record;
begin
  select * into v_s from mixed_sessions where id = p_session_id for update;
  select * into v_i from mixed_session_items where session_id = p_session_id and seq = p_seq;
  if v_s.id is null or v_i.session_id is null or v_s.student_id is distinct from p_student_id
     or p_correct is null or (coalesce(p_skipped, false) and p_correct) then
    raise exception 'record_mixed_attempt: refused';
  end if;
  if not exists (select 1 from mixed_attempts where session_id = p_session_id and seq = p_seq)
     and (v_s.finished_at is not null or now() > v_s.started_at + interval '1 day') then
    raise exception 'record_mixed_attempt: refused (session closed)';
  end if;

  insert into mixed_attempts (session_id, seq, student_id, class_id, practice_day, kind,
                              bank_key, correct, skipped, responses, verdicts,
                              misconception_ids, early, retry)
  values (p_session_id, p_seq, v_s.student_id, v_s.class_id, v_s.practice_day, v_i.kind,
          v_i.bank_key, p_correct, coalesce(p_skipped, false),
          coalesce(p_responses, '{}'::jsonb), coalesce(p_verdicts, '{}'::jsonb),
          -- W-5, plus 0091: a re-try carries none either (the panel counts
          -- every attempt as a first try).
          case when p_correct or coalesce(p_skipped, false) or v_i.retry_of is not null then '{}'::text[]
               else mixed_misconceptions_of(coalesce(p_verdicts, '{}'::jsonb)) end,
          v_i.early, v_i.retry_of is not null)
  on conflict (session_id, seq) do nothing;
  v_new := found;

  -- RV-5: a wrong (not skipped) answer on a PLANNED review item earns one
  -- re-try, the key's next template, at least `gap` places later.
  if v_new and v_s.review and v_i.retry_of is null and not p_correct
     and not coalesce(p_skipped, false) then
    select settings into v_set from mixed_settings_revision where revision = v_s.revision;
    if coalesce((v_set->>'review_retry_after_wrong')::integer, 0) >= 1 then
      select coalesce(max(seq), 0) + 1 into v_retry from mixed_session_items where session_id = p_session_id;
      -- At least gap places on; never before anything already answered, and
      -- after the key's other items in the session, so it isn't served next
      -- to the key's planned second item.
      select greatest(v_i.position + (v_set->>'review_same_skill_min_gap')::numeric,
                      coalesce((select max(si.position) from mixed_session_items si
                                  join mixed_attempts a on a.session_id = si.session_id and a.seq = si.seq
                                 where si.session_id = p_session_id), 0),
                      coalesce((select max(si.position) + (v_set->>'review_same_skill_min_gap')::numeric
                                  from mixed_session_items si
                                 where si.session_id = p_session_id and si.kind = v_i.kind
                                   and si.bank_key = v_i.bank_key and si.seq <> p_seq), 0)) + 0.5
        into v_pos;
      -- The next template after the original, wrapping (same owner),
      -- preferring one not yet served in this session.
      select p.* into v_next
        from practice_item p
       where p.owner_id = v_i.owner_id and p.status = 'ratified' and p.retired_at is null
         and ((v_i.kind = 'skill' and p.role = 'skill' and p.skill_id = v_i.bank_key
               and mixed_tier_ok(p.tier, v_s.student_id, p.skill_id))
           or (v_i.kind = 'discrimination' and p.role = 'discrimination'
               and split_part(p.item_id, '#', 1) = v_i.bank_key))
       order by exists (select 1 from mixed_session_items si
                         where si.session_id = p_session_id and si.owner_id = p.owner_id
                           and si.item_id = p.item_id),
                case when (p.position, p.item_id) > (select q.position, q.item_id from practice_item q
                                                       where q.owner_id = v_i.owner_id and q.item_id = v_i.item_id)
                     then 0 else 1 end,
                p.position, p.item_id
       limit 1;
      if v_next.item_id is not null then
        insert into mixed_session_items (session_id, seq, student_id, kind, bank_key, owner_id,
                                         item_id, fingerprint, row_index, document, row_values,
                                         early, position, retry_of)
        select p_session_id, v_retry, v_s.student_id, v_i.kind, v_i.bank_key, v_next.owner_id,
               v_next.item_id, v_next.fingerprint, r.idx, v_next.document,
               coalesce((select jsonb_object_agg(c.name, (v_next.value_table->'rows'->r.idx)->((c.i - 1)::int))
                           from jsonb_array_elements_text(v_next.value_table->'columns') with ordinality c(name, i)),
                        '{}'::jsonb),
               v_i.early, v_pos, p_seq
          from (select mixed_row_index(p_session_id, v_next.item_id || ':' || v_retry,
                                       jsonb_array_length(v_next.value_table->'rows')) as idx) r;
      else
        v_retry := null;
      end if;
    else
      v_retry := null;
    end if;
  end if;

  if v_new then
    update mixed_sessions s
       set score_right    = (select count(*) filter (where correct) from mixed_attempts
                              where session_id = s.id and not retry),
           score_answered = (select count(*) filter (where not skipped) from mixed_attempts
                              where session_id = s.id and not retry),
           last_saved_at  = now(),
           -- Finished when every planned item is answered and no re-try waits.
           finished_at    = case when (select count(*) from mixed_attempts
                                        where session_id = s.id and not retry) >= s.planned
                                  and not exists (select 1 from mixed_session_items si
                                                   where si.session_id = s.id and si.retry_of is not null
                                                     and not exists (select 1 from mixed_attempts a
                                                                      where a.session_id = si.session_id
                                                                        and a.seq = si.seq))
                                 then coalesce(s.finished_at, now()) else s.finished_at end
     where s.id = p_session_id;
  end if;

  if not v_new then
    select si.seq into v_retry from mixed_session_items si
     where si.session_id = p_session_id and si.retry_of = p_seq;
  end if;
  select * into v_a from mixed_attempts where session_id = p_session_id and seq = p_seq;
  return jsonb_build_object('replayed', not v_new, 'correct', v_a.correct,
                            'skipped', v_a.skipped, 'verdicts', v_a.verdicts,
                            'misconception_ids', to_jsonb(v_a.misconception_ids),
                            'retry_seq', v_retry);
end;
$$;

-- -----------------------------------------------------------------------------
-- J. The reads
-- -----------------------------------------------------------------------------
-- 0066's payload, in serving order, naming re-tries and the review flag.
create or replace function mixed_session_payload(p_session_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'session_id', s.id, 'practice_day', s.practice_day, 'ordinal', s.ordinal,
    'planned', s.planned, 'graded', s.graded, 'review', s.review,
    'score_right', s.score_right, 'score_answered', s.score_answered,
    'finished', s.finished_at is not null,
    'items', (select coalesce(jsonb_agg(jsonb_build_object(
                'seq', si.seq, 'item_id', si.item_id, 'row_index', si.row_index,
                'retry_of', si.retry_of,
                'answered', a.seq is not null,
                'correct', a.correct, 'skipped', a.skipped)
              order by si.position, si.seq), '[]'::jsonb)
              from mixed_session_items si
              left join mixed_attempts a on a.session_id = si.session_id and a.seq = si.seq
             where si.session_id = s.id))
  from mixed_sessions s where s.id = p_session_id;
$$;

-- 0079's recent first tries, leaving re-tries out (RV-9).
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
    from (
      select ma.student_id, ma.bank_key, ma.correct, ma.skipped, ma.practice_day, ma.saved_at, ma.seq
      from mixed_attempts ma
      where ma.class_id = p_class_id and ma.kind = 'skill' and not ma.retry
      union all
      select t.student_id, t.skill_id, t.correct, false,
             (t.saved_at at time zone fact_class_zone(p_class_id))::date, t.saved_at, 0
      from video_pause_tries t
      join activity_versions v on v.id = t.activity_version_id
      join class_activities ca on ca.activity_id = v.activity_id and ca.class_id = p_class_id
      where t.skill_id is not null
    ) a
    join class_members m on m.class_id = p_class_id and m.student_id = a.student_id
                        and m.removed_at is null
  ) x
  where x.rn <= p_window
  group by x.student_id, x.bank_key;
$$;

-- 0068's per-student recent list, leaving re-tries out (RV-9).
create or replace function mixed_student_recent(p_class_id uuid, p_student_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or p_class_id is null or p_student_id is null
     or not is_class_teacher(p_class_id)
     or not exists (select 1 from class_members m
                     where m.class_id = p_class_id and m.student_id = p_student_id
                       and m.removed_at is null) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
             'practice_day', x.practice_day,
             'kind', x.kind,
             'skill_id', x.bank_key,
             'skill_label', mixed_key_label(x.kind, x.bank_key),
             'correct', x.correct,
             'skipped', x.skipped,
             'mistakes', (select coalesce(jsonb_agg(jsonb_build_object('id', m.id, 'label', mr.description)
                                                    order by m.id), '[]'::jsonb)
                            from unnest(x.misconception_ids) m(id)
                            left join misconception_registry mr on mr.id = m.id))
           order by x.practice_day desc, x.saved_at desc, x.seq desc), '[]'::jsonb)
    from (select a.*
            from mixed_attempts a
           where a.class_id = p_class_id and a.student_id = p_student_id and not a.retry
           order by a.practice_day desc, a.saved_at desc, a.seq desc
           limit 10) x);
end;
$$;

-- 0071's "who to see first", its same-mistake window leaving re-tries out.
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
  ), hit as (
    select r.student_id, r.bank_key
      from mixed_recent(p_class_id, v_win) r
      join practised p on p.student_id = r.student_id
      join today_served t on t.student_id = r.student_id and t.bank_key = r.bank_key
     where r.tries - r.right_n > v_win - v_min
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
  ), win as (
    select a.student_id, a.kind, a.bank_key, a.misconception_ids,
           row_number() over (partition by a.student_id, a.bank_key
                              order by a.practice_day desc, a.saved_at desc, a.seq desc) as rn
      from mixed_attempts a
      join practised p on p.student_id = a.student_id
     where a.class_id = p_class_id and not a.retry
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

-- 0066's finish, its skip count leaving re-tries out.
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
    'skipped', (select count(*) from mixed_attempts where session_id = p_session_id and skipped and not retry),
    'graded', v_s.graded);
end;
$$;

-- -----------------------------------------------------------------------------
-- Grants. `create or replace` keeps the grants of the functions it replaces.
-- -----------------------------------------------------------------------------
revoke execute on function review_plan(uuid, uuid, uuid, date, jsonb, integer, text, text[]) from public, anon, authenticated;
grant  execute on function review_plan(uuid, uuid, uuid, date, jsonb, integer, text, text[]) to service_role;
revoke execute on function review_items_for(uuid, jsonb, boolean) from public, anon, authenticated;
grant  execute on function review_items_for(uuid, jsonb, boolean) to service_role;
revoke execute on function set_class_review(uuid, date, boolean, text[], boolean) from public, anon;
grant  execute on function set_class_review(uuid, date, boolean, text[], boolean) to authenticated, service_role;
revoke execute on function set_class_period_minutes(uuid, integer) from public, anon;
grant  execute on function set_class_period_minutes(uuid, integer) to authenticated, service_role;
