-- =============================================================================
-- 0081_mixed_exhausted_sessions.sql — a second session the same day tops up
-- (curriculum C-182 + C-183, author rulings 2026-11-04;
-- docs/design/period-assembly.md → "The rulings")
-- -----------------------------------------------------------------------------
-- Second and later sessions the same day fill to the session's size, one item
-- per skill: due skills, then not-yet-due skills stalest first, then skills
-- already practised today. The first session of the day can still end early.
--
-- An EARLY item is one served before its skill was due. Right or skipped, it
-- leaves the step and the due date alone. Wrong, it drops a step and the
-- schedule restarts from that day. Every item counts for staleness.
--
-- The marker is stored on the session's item and copied to the attempt, like
-- `kind` and `bank_key`, so the step derivation stays one index read (ER-14).
-- Existing rows default to false, which is right: no early item exists yet.
-- =============================================================================

alter table mixed_session_items add column early boolean not null default false;
alter table mixed_attempts      add column early boolean not null default false;

comment on column mixed_session_items.early is
  'Served before its skill was due (0081): a top-up in a second or later session the same day.';
comment on column mixed_attempts.early is
  'Copied from the item (0081). A right or skipped early try leaves the step and due date alone.';

-- The return types change, so both are dropped and recreated. mixed_plan is
-- the only function that calls mixed_steps; start_mixed_session is the only
-- one that calls mixed_plan.
drop function mixed_plan(uuid, uuid, uuid, date, integer, jsonb, integer, text);
drop function mixed_steps(uuid, uuid, integer[], integer);

-- A day's result is every first try on the key that day:
--   a wrong try, or a skip on a scheduled item -> down p_drop (floored at 0),
--     and the schedule restarts from that day;
--   otherwise, any early item that day -> step and schedule carried unchanged;
--   otherwise all right -> up one (capped at the top step), from that day.
-- `last_day` is the day that last set the schedule, and `due_on` is that day
-- plus the step's interval. `last_any` is the last practice of any kind (the
-- staleness reading), and `last_any_early` says an early item was in it.
create function mixed_steps(p_class_id uuid, p_student_id uuid,
                            p_intervals integer[], p_drop integer)
returns table (kind text, bank_key text, step integer, last_day date, due_on date, days integer,
               last_any date, last_any_early boolean)
language sql
stable
security definer
set search_path = public
as $$
  with recursive d as (
    select a.kind, a.bank_key, a.practice_day,
           bool_and(a.correct or (a.early and a.skipped)) as not_wrong,
           bool_or(a.early) as has_early,
           row_number() over (partition by a.kind, a.bank_key order by a.practice_day) as rn
    from mixed_attempts a
    where a.class_id = p_class_id and a.student_id = p_student_id
    group by a.kind, a.bank_key, a.practice_day
  ), r as (
    select d.kind, d.bank_key, d.rn, d.practice_day, d.has_early,
           d.practice_day as anchor,
           case when d.not_wrong and not d.has_early then least(1, cardinality(p_intervals) - 1)
                else 0 end as step
    from d where d.rn = 1
    union all
    select d.kind, d.bank_key, d.rn, d.practice_day, d.has_early,
           case when d.not_wrong and d.has_early then r.anchor else d.practice_day end,
           case when not d.not_wrong then greatest(r.step - p_drop, 0)
                when d.has_early then r.step
                else least(r.step + 1, cardinality(p_intervals) - 1) end
    from r join d on d.kind = r.kind and d.bank_key = r.bank_key and d.rn = r.rn + 1
  )
  select distinct on (r.kind, r.bank_key)
         r.kind, r.bank_key, r.step, r.anchor, r.anchor + p_intervals[r.step + 1], r.rn::integer,
         r.practice_day, r.has_early
  from r
  order by r.kind, r.bank_key, r.rn desc;
$$;

-- 0070's mixed_plan with the top-up. Tier 1 to 3 are unchanged, apart from
-- reading staleness from `last_any`.
create function mixed_plan(
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
  -- C-145 ask 8: the most recent taught day's skills first (the first spaced
  -- retrieval), then the backlog oldest-taught first in chain order, so a
  -- skill's prerequisites come back before it does.
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
    -- Every cap is also held under the CLASS's item count, which may be
    -- smaller than the curriculum caps were bounded against.
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
  -- 0081 (C-182, C-183): second and later sessions top up to the session's
  -- size. Not-yet-due skills first, stalest first (the last practice of ANY
  -- kind, so a skill pulled forward earlier today drops to last resort).
  t4 as (
    select 'skill'::text as kind, sk.skill_id as key, sk.owners, 4 as tier, true as early,
           row_number() over (order by sk.last_any, sk.chain_order, sk.skill_id) as r
    from sk
    where p_ordinal > 1 and sk.step is not null
      and sk.due_on > p_today and sk.last_any < p_today
  ),
  -- Last resort: skills already practised today. One pulled forward today
  -- stays early, so a repeat of it can't step it up or drop it on a skip.
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
  -- The item for each key: the next in bank order after the last one served.
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
             -- after the last-seen one first, then wrap around
             case when lp.item_id is null then 0
                  when (c.owner_id::text, c.position, c.item_id)
                       > (lp.owner_id::text, lp.position, lp.item_id) then 0
                  else 1 end,
             c.owner_id::text, c.position, c.item_id
  ),
  -- Confusable sets present in the pool cluster their skills together.
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

-- 0066's start, snapshotting the marker.
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
                                   item_id, fingerprint, row_index, document, row_values, early)
  select v_id, t.seq, v_uid, t.kind, t.bank_key, p.owner_id, p.item_id, p.fingerprint,
         r.idx, p.document,
         coalesce((select jsonb_object_agg(c.name, (p.value_table->'rows'->r.idx)->((c.i - 1)::int))
                     from jsonb_array_elements_text(p.value_table->'columns') with ordinality c(name, i)),
                  '{}'::jsonb),
         t.early
  from jsonb_to_recordset(v_plan) as t(seq integer, kind text, bank_key text,
                                       owner_id uuid, item_id text, early boolean)
  join practice_item p on p.owner_id = t.owner_id and p.item_id = t.item_id
  cross join lateral (select mixed_row_index(v_id, p.item_id,
                                             jsonb_array_length(p.value_table->'rows')) as idx) r;

  return v_common || jsonb_build_object('state', 'started', 'session', mixed_session_payload(v_id));
end;
$$;

-- 0067's record, copying the marker.
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
  if not exists (select 1 from mixed_attempts where session_id = p_session_id and seq = p_seq)
     and (v_s.finished_at is not null or now() > v_s.started_at + interval '1 day') then
    raise exception 'record_mixed_attempt: refused (session closed)';
  end if;

  insert into mixed_attempts (session_id, seq, student_id, class_id, practice_day, kind,
                              bank_key, correct, skipped, responses, verdicts,
                              misconception_ids, early)
  values (p_session_id, p_seq, v_s.student_id, v_s.class_id, v_s.practice_day, v_i.kind,
          v_i.bank_key, p_correct, coalesce(p_skipped, false),
          coalesce(p_responses, '{}'::jsonb), coalesce(p_verdicts, '{}'::jsonb),
          -- W-5. A right try or a skip carries none whatever the verdicts
          -- say: the step and the panel must agree on what "showed a
          -- misconception" means, and a skip showed nothing.
          case when p_correct or coalesce(p_skipped, false) then '{}'::text[]
               else mixed_misconceptions_of(coalesce(p_verdicts, '{}'::jsonb)) end,
          v_i.early)
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
                            'skipped', v_a.skipped, 'verdicts', v_a.verdicts,
                            'misconception_ids', to_jsonb(v_a.misconception_ids));
end;
$$;

revoke execute on function mixed_steps(uuid, uuid, integer[], integer) from public, anon, authenticated;
revoke execute on function mixed_plan(uuid, uuid, uuid, date, integer, jsonb, integer, text) from public, anon, authenticated;
grant  execute on function mixed_steps(uuid, uuid, integer[], integer) to service_role;
grant  execute on function mixed_plan(uuid, uuid, uuid, date, integer, jsonb, integer, text) to service_role;
