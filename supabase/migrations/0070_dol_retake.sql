-- =============================================================================
-- 0070 — the DoL retake and the "DoL passed" signal (curriculum D65)
-- -----------------------------------------------------------------------------
-- docs/design/dol-retake.md, DL-1…DL-17 as amended by the eng review DE-1…DE-19
-- (all ruled 2026-10-24; where they differ, the DE item wins).
--
--   §A  audit actions for the teacher's pass tick.
--   §B  skill_part_count — the skill registry's `= n` part counts, mirrored
--       (DE-12: the registry's count decides which part is FINAL).
--   §C  dol_pass — one row per (student, skill), insert-once, never deleted
--       except by account purge or a teacher's untick of THEIR OWN tick.
--       Every reference is `on delete set null` (DE-5): the 0035 prune, once
--       armed, deletes superseded check rows, and a cascade would delete the
--       pass with them — the very harm DL-12 stores passes to prevent.
--   §D  helpers: dol_zone (the activity owner's zone, DL-8 as amended) and
--       dol_pass_skill (the skill a DoL on this activity can pass, or NULL:
--       the final part only, consolidations never, Bank copies through their
--       source — DL-10 amended, DE-11, DE-12).
--   §E  record_check: four new trailing parameters, ALL DEFAULTED (DE-3: the
--       live function calls this by name and is redeployed AFTER this
--       migration, the 0059 precedent). The attempt rules live HERE, after the
--       idempotent replay and inside the insert loop (DE-4): a lost-response
--       retry replays, and two tabs racing cannot spend the retake on form 1.
--   §F  my_dol_state — the read path's per-student state, AS THE CALLER (DE-1:
--       never keyed on the unverified token sub).
--   §G  set_dol_pass / dol_pass_status — the teacher's tick for a rubric
--       primary item (DL-11 as amended) and the progress read (DE-16).
--   §H  practice_item.tier (D66) + sync_practice_items writing it.
--   §I  mixed_tier_ok + mixed_plan: P/E templates only after a pass, and only
--       for a skill that HAS a pass-granting DoL live (DE-10).
--
-- ⚠ PERSONAL DATA: dol_pass is student-derived (a per-skill pass). data-map.md
-- and retention-policy.md change in this migration's commit (CLAUDE.md).
-- Apply BEFORE redeploying get-activity / check-activity (they call §E/§F).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- §A. audit actions
-- -----------------------------------------------------------------------------
alter type audit_action add value if not exists 'dol.pass';
alter type audit_action add value if not exists 'dol.unpass';

-- -----------------------------------------------------------------------------
-- §B. skill_part_count
-- -----------------------------------------------------------------------------
create table skill_part_count (
  id          text primary key check (length(id) between 1 and 200),
  parts       integer not null check (parts between 1 and 20),
  updated_at  timestamptz not null default now()
);

alter table skill_part_count enable row level security;
alter table skill_part_count force row level security;
create policy skill_part_count_read on skill_part_count for select to authenticated using (true);

comment on table skill_part_count is
  'Platform mirror of the skill registry''s part counts (0070, D65 DE-12): `id = n` in their skill-registry.txt, every id mirrored (absence of `= n` is 1). Refreshed by pnpm import:batch --skills-registry (insert-or-update, never deleted). Curriculum content, no personal data.';

revoke all on table skill_part_count from anon;
revoke insert, update, delete, truncate on table skill_part_count from authenticated;
grant  select on table skill_part_count to authenticated;
grant  select, insert, update on table skill_part_count to service_role;

-- -----------------------------------------------------------------------------
-- §C. dol_pass
-- -----------------------------------------------------------------------------
create table dol_pass (
  student_id   uuid not null references users(id) on delete cascade,
  skill_id     text not null check (length(skill_id) between 1 and 120),
  -- The evidence. All `set null` (DE-5): the pass outlives its check row
  -- (prune), its version and a hard-purged activity.
  activity_id  uuid references activities(id) on delete set null,
  version_id   uuid references activity_versions(id) on delete set null,
  check_id     uuid references section_checks(id) on delete set null,
  source       text not null check (source in ('auto', 'teacher')),
  granted_by   uuid references users(id) on delete set null,
  passed_at    timestamptz not null default now(),
  primary key (student_id, skill_id),
  check ((source = 'auto') = (granted_by is null))
);

create index dol_pass_activity on dol_pass (activity_id) where activity_id is not null;

alter table dol_pass enable row level security;
alter table dol_pass force row level security;

-- A student reads their own passes. Teachers read through dol_pass_status
-- (§G); every write is a definer function below.
create policy dol_pass_read_own on dol_pass
  for select to authenticated
  using (student_id = (select auth.uid()));

comment on table dol_pass is
  'A student''s DoL pass per skill (0070, D65 DL-12). STUDENT-DERIVED. Insert-once; written by record_check (auto, primary item right) or set_dol_pass (a teacher''s tick on a rubric primary). Deleted only by account purge (cascade) or a teacher''s untick of a TEACHER pass. Read by mixed_plan (D66 tiers), the student''s DoL, and dol_pass_status.';

revoke all on table dol_pass from anon, authenticated;
grant  select on table dol_pass to authenticated;
grant  all on table dol_pass to service_role;

-- -----------------------------------------------------------------------------
-- §D. helpers
-- -----------------------------------------------------------------------------

-- The activity owner's zone, else the platform default — 0050's fallback. A
-- section check has no class context; the owner is the class teacher in the
-- ordinary case, Bank copies included (DL-8 as amended; C-164 item 4).
create or replace function dol_zone(p_activity_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select u.timezone from activities a join users u on u.id = a.owner_id
      where a.id = p_activity_id and iana_zone_is_valid(u.timezone)),
    analytics_default_zone());
$$;

-- The skill a DoL on this activity can pass, or NULL. A Bank copy resolves
-- through the activity it was copied from (DE-11). Only the FINAL part grants
-- (DL-10 amended, DE-12): among the source owner's live catalogue parts of
-- that skill (a consolidation has consolidates_chain set and never counts),
-- in teaching order (source_path), exactly as many as the registry declares
-- (skill_part_count, default 1), and this is the last. Fewer or more parts
-- than declared grants nothing — a missing final part must not let an earlier
-- one stand in for it.
create or replace function dol_pass_skill(p_activity_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  with self as (
    select coalesce(a.copied_from_activity_id, a.id) as source_id
    from activities a where a.id = p_activity_id
  ),
  src as (
    select a.* from activities a join self on a.id = self.source_id
    where a.primary_skill is not null and a.consolidates_chain is null
      and a.deleted_at is null and a.source_path is not null
  ),
  parts as (
    select b.id, row_number() over (order by b.source_path) as pos,
           count(*) over () as n
    from activities b join src on b.owner_id = src.owner_id
                              and b.primary_skill = src.primary_skill
    where b.consolidates_chain is null and b.deleted_at is null
      and b.source_path is not null
  )
  select src.primary_skill
  from src
  join parts on parts.id = src.id
  where parts.n = coalesce((select c.parts from skill_part_count c where c.id = src.primary_skill), 1)
    and parts.pos = parts.n;
$$;

-- -----------------------------------------------------------------------------
-- §E. record_check — the DoL attempt rules and the auto pass
-- -----------------------------------------------------------------------------
-- New parameters (all defaulted; DE-3):
--   p_max_attempts        NULL = unlimited (today's free), else the section's
--                         allowance: 2 for a DoL with a retake, 1 without
--                         (DL-7). p_locked keeps meaning 1 for one release.
--   p_expected_attempt    the attempt (= form) the handler GRADED. A mismatch
--                         is `dol_form_stale` — checked after the replay and
--                         again inside the insert loop (DE-4).
--   p_rubric_primary      the DoL's primary item is teacher-marked: the retake
--                         also waits for a RELEASED grade on attempt 1 (DE-9).
--   p_dol_primary_correct the handler's verdict on the primary block (DE-7).
--                         TRUE writes the pass when dol_pass_skill grants one.
-- The return gains `dol_passed`: whether the student now holds a pass for the
-- skill this DoL can pass (the handler withholds solutions until then, DL-8).
drop function if exists record_check(
  uuid, uuid, uuid, text, jsonb, jsonb, text, integer, integer, boolean, integer
);

create function record_check(
  p_student_id          uuid,
  p_activity_id         uuid,
  p_activity_version_id uuid,
  p_section_id          text,
  p_responses           jsonb,
  p_verdicts            jsonb,
  p_idempotency_key     text default null,
  p_rate_limit          integer default 60,
  p_rate_window_seconds integer default 60,
  p_locked              boolean default false,
  p_section_total       integer default null,
  p_max_attempts        integer default null,
  p_expected_attempt    integer default null,
  p_rubric_primary      boolean default false,
  p_dol_primary_correct boolean default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing        section_checks%rowtype;
  v_check_id        uuid;
  v_attempt_number  integer;
  v_recent          integer;
  v_retries         integer := 0;
  v_locked_hit      boolean;
  v_max             integer := case when p_locked then 1 else p_max_attempts end;
  v_prior           integer;
  v_first           section_checks%rowtype;
  v_zone            text;
  v_skill           text;
  v_passed          boolean := false;
begin
  -- 0. Idempotent replay (S4-B2), unchanged and FIRST (DE-4).
  if p_idempotency_key is not null then
    select * into v_existing
    from section_checks
    where student_id = p_student_id
      and idempotency_key = p_idempotency_key;

    if found then
      return jsonb_build_object(
        'check_id',       v_existing.id,
        'attempt_number', v_existing.attempt_number,
        'verdicts',       v_existing.verdicts,
        'replayed',       true,
        'dol_passed',     exists (select 1 from dol_pass dp
                                   where dp.student_id = p_student_id
                                     and dp.skill_id = dol_pass_skill(p_activity_id))
      );
    end if;
  end if;

  -- 0b. THE ALLOWANCE (0040's lock, generalized): after the replay, before the
  --     rate ceiling.
  if v_max is not null then
    select count(*) into v_prior
    from section_checks
    where student_id = p_student_id
      and activity_version_id = p_activity_version_id
      and section_id = p_section_id;

    if v_prior >= v_max then
      raise exception 'section_locked'
        using errcode = 'P0001',
              hint = 'this section is already checked and locked';
    end if;

    if p_expected_attempt is not null and p_expected_attempt <> v_prior + 1 then
      raise exception 'dol_form_stale'
        using errcode = 'P0001',
              hint = 'this version of the check is out of date; reload it';
    end if;

    -- A retake (DL-8 as amended, DE-9): not before the next practice day in
    -- the owner's zone, and for a rubric primary not before attempt 1's
    -- grade is released.
    if v_prior >= 1 and p_max_attempts is not null then
      select * into v_first
      from section_checks
      where student_id = p_student_id
        and activity_version_id = p_activity_version_id
        and section_id = p_section_id
      order by attempt_number
      limit 1;
      v_zone := dol_zone(p_activity_id);
      if (v_first.created_at at time zone v_zone)::date >= (now() at time zone v_zone)::date then
        raise exception 'dol_retake_not_yet'
          using errcode = 'P0001', hint = 'the retake opens on the next practice day';
      end if;
      if p_rubric_primary and not exists (
           select 1 from check_grades g
           where g.check_id = v_first.id and g.released_at is not null) then
        raise exception 'dol_retake_not_yet'
          using errcode = 'P0001', hint = 'the retake opens once the first try is marked';
      end if;
    end if;
  end if;

  -- 1. Rate ceiling (S4-5), unchanged.
  select count(*) into v_recent
  from section_checks
  where student_id = p_student_id
    and created_at > now() - make_interval(secs => p_rate_window_seconds);

  if v_recent >= p_rate_limit then
    raise exception 'rate_limited'
      using errcode = 'P0001', hint = 'check rate ceiling reached';
  end if;

  -- 2 + 3. Attempt derivation and insert, in the 0005 retry loop. The expected
  --        attempt is re-checked on every pass: a racing insert that took
  --        this number makes the next pass derive a different one (DE-4).
  loop
    select coalesce(max(attempt_number), 0) + 1
      into v_attempt_number
      from section_checks
      where student_id = p_student_id
        and activity_version_id = p_activity_version_id
        and section_id = p_section_id;

    if p_expected_attempt is not null and v_attempt_number <> p_expected_attempt then
      raise exception 'dol_form_stale'
        using errcode = 'P0001',
              hint = 'this version of the check is out of date; reload it';
    end if;
    if v_max is not null and v_attempt_number > v_max then
      raise exception 'section_locked'
        using errcode = 'P0001',
              hint = 'this section is already checked and locked';
    end if;

    begin
      insert into section_checks (
        student_id, activity_id, activity_version_id, section_id,
        attempt_number, responses, verdicts, idempotency_key, section_total
      )
      values (
        p_student_id, p_activity_id, p_activity_version_id, p_section_id,
        v_attempt_number, p_responses, p_verdicts, p_idempotency_key,
        p_section_total
      )
      returning id into v_check_id;

      exit;  -- success
    exception
      when unique_violation then
        if p_idempotency_key is not null then
          select * into v_existing
          from section_checks
          where student_id = p_student_id
            and idempotency_key = p_idempotency_key;

          if found then
            return jsonb_build_object(
              'check_id',       v_existing.id,
              'attempt_number', v_existing.attempt_number,
              'verdicts',       v_existing.verdicts,
              'replayed',       true,
              'dol_passed',     exists (select 1 from dol_pass dp
                                         where dp.student_id = p_student_id
                                           and dp.skill_id = dol_pass_skill(p_activity_id))
            );
          end if;
        end if;

        if p_locked then
          raise exception 'section_locked'
            using errcode = 'P0001',
                  hint = 'this section is already checked and locked';
        end if;

        v_retries := v_retries + 1;
        if v_retries > 3 then
          raise;
        end if;
    end;
  end loop;

  -- 4. The auto pass (DL-10 as amended, DE-7): insert-once.
  if p_max_attempts is not null then
    v_skill := dol_pass_skill(p_activity_id);
    if v_skill is not null then
      if p_dol_primary_correct then
        insert into dol_pass (student_id, skill_id, activity_id, version_id, check_id, source)
        values (p_student_id, v_skill, p_activity_id, p_activity_version_id, v_check_id, 'auto')
        on conflict (student_id, skill_id) do nothing;
      end if;
      v_passed := exists (select 1 from dol_pass dp
                           where dp.student_id = p_student_id and dp.skill_id = v_skill);
    end if;
  end if;

  return jsonb_build_object(
    'check_id',       v_check_id,
    'attempt_number', v_attempt_number,
    'verdicts',       p_verdicts,
    'replayed',       false,
    'dol_passed',     v_passed
  );
end;
$$;

-- ⚠ record_check stays SERVICE-ROLE ONLY: it accepts verdicts (0020, 0040).
revoke execute on function record_check(uuid, uuid, uuid, text, jsonb, jsonb, text, integer, integer, boolean, integer, integer, integer, boolean, boolean)
  from public, anon, authenticated;
grant execute on function record_check(uuid, uuid, uuid, text, jsonb, jsonb, text, integer, integer, boolean, integer, integer, integer, boolean, boolean)
  to service_role;

comment on function record_check(uuid, uuid, uuid, text, jsonb, jsonb, text, integer, integer, boolean, integer, integer, integer, boolean, boolean) is
  'Records one section check. Service-role only (it accepts verdicts). Every flag is DERIVED BY THE SERVER from the stored document, never sent by the client: p_locked (0040), p_section_total (0059), and 0070''s DoL rules — p_max_attempts, p_expected_attempt (dol_form_stale), p_rubric_primary (the retake waits for a released grade), p_dol_primary_correct (writes dol_pass). The allowance and the retake day (dol_retake_not_yet) are enforced after the idempotent replay. All 0070 parameters default so a pre-0070 caller still records. See docs/design/dol-retake.md.';

-- -----------------------------------------------------------------------------
-- §F. my_dol_state — the read path's per-student DoL state (DE-1)
-- -----------------------------------------------------------------------------
-- AS THE CALLER: get-activity calls this with the student's own token, so the
-- state is keyed on auth.uid(), never on the unverified sub (server/jwt.ts G2).
-- retake_open = a first attempt exists, the owner-zone day has moved on, and
-- (rubric primary) attempt 1's grade is released. The handler picks the form.
create or replace function my_dol_state(
  p_activity_id    uuid,
  p_version_id     uuid,
  p_section_id     text,
  p_rubric_primary boolean default false
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_attempts integer;
  v_first    section_checks%rowtype;
  v_zone     text;
  v_skill    text;
  v_open     boolean := false;
begin
  if auth.uid() is null then
    raise exception 'Sign in first' using errcode = '42501';
  end if;
  select count(*) into v_attempts
  from section_checks
  where student_id = auth.uid() and activity_version_id = p_version_id
    and section_id = p_section_id;
  if v_attempts >= 1 then
    select * into v_first
    from section_checks
    where student_id = auth.uid() and activity_version_id = p_version_id
      and section_id = p_section_id
    order by attempt_number limit 1;
    v_zone := dol_zone(p_activity_id);
    v_open := (v_first.created_at at time zone v_zone)::date < (now() at time zone v_zone)::date
      and (not p_rubric_primary or exists (
             select 1 from check_grades g
             where g.check_id = v_first.id and g.released_at is not null));
  end if;
  v_skill := dol_pass_skill(p_activity_id);
  return jsonb_build_object(
    'attempts',    v_attempts,
    'retake_open', v_open,
    'passed',      v_skill is not null and exists (
                     select 1 from dol_pass dp
                     where dp.student_id = auth.uid() and dp.skill_id = v_skill));
end;
$$;

revoke execute on function my_dol_state(uuid, uuid, text, boolean) from public, anon;
grant  execute on function my_dol_state(uuid, uuid, text, boolean) to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- §G. the teacher's tick and the progress read
-- -----------------------------------------------------------------------------
-- set_dol_pass: a rubric primary's pass is the teacher's call (DL-11 as
-- amended; the grading view prefills it from the base-level lines). Gated on
-- can_edit_activity like upsert_check_grade (0034's reasoning: never the read
-- helper). The check must be on the DoL section of its version, and the
-- activity must grant a pass. An untick removes only a TEACHER pass (DE-15);
-- an auto pass stands.
create or replace function set_dol_pass(p_check_id uuid, p_passed boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_check  section_checks%rowtype;
  v_skill  text;
  v_n      integer;
begin
  if auth.uid() is null then
    raise exception 'Sign in first';
  end if;
  select * into v_check from section_checks where id = p_check_id;
  if v_check.id is null then
    raise exception 'No such response';
  end if;
  if not can_edit_activity(v_check.activity_id) then
    raise exception 'Not your activity';
  end if;
  if not exists (
       select 1 from activity_versions v
       cross join lateral jsonb_array_elements(coalesce(v.content->'sections', '[]'::jsonb)) s
       where v.id = v_check.activity_version_id
         and s->>'id' = v_check.section_id
         and jsonb_typeof(s->'dol') = 'object') then
    raise exception 'That response is not a DoL';
  end if;
  v_skill := dol_pass_skill(v_check.activity_id);
  if v_skill is null then
    raise exception 'This DoL does not record a pass';
  end if;

  if p_passed then
    insert into dol_pass (student_id, skill_id, activity_id, version_id, check_id, source, granted_by)
    values (v_check.student_id, v_skill, v_check.activity_id, v_check.activity_version_id,
            v_check.id, 'teacher', auth.uid())
    on conflict (student_id, skill_id) do nothing;
    get diagnostics v_n = row_count;
  else
    delete from dol_pass
     where student_id = v_check.student_id and skill_id = v_skill and source = 'teacher';
    get diagnostics v_n = row_count;
  end if;

  if v_n > 0 then
    insert into audit_log (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), case when p_passed then 'dol.pass' else 'dol.unpass' end::audit_action,
            'activity', v_check.activity_id,
            jsonb_build_object('check_id', p_check_id, 'student_id', v_check.student_id,
                               'skill_id', v_skill));
  end if;

  return jsonb_build_object(
    'changed', v_n > 0,
    'passed',  exists (select 1 from dol_pass dp
                        where dp.student_id = v_check.student_id and dp.skill_id = v_skill),
    'source',  (select dp.source from dol_pass dp
                 where dp.student_id = v_check.student_id and dp.skill_id = v_skill));
end;
$$;

revoke execute on function set_dol_pass(uuid, boolean) from public, anon;
grant  execute on function set_dol_pass(uuid, boolean) to authenticated, service_role;

-- dol_pass_status: for the activity's teacher, every student who holds a pass
-- for the skill this activity's DoL can pass (DE-16 — a pass reads "Passed"
-- whatever the latest attempt says). Empty when the activity grants nothing.
create or replace function dol_pass_status(p_activity_id uuid)
returns table (student_id uuid, source text, passed_at timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_skill text;
begin
  if not can_edit_activity(p_activity_id) then
    raise exception 'Not your activity' using errcode = '42501';
  end if;
  v_skill := dol_pass_skill(p_activity_id);
  if v_skill is null then
    return;
  end if;
  return query
    select dp.student_id, dp.source, dp.passed_at
    from dol_pass dp
    where dp.skill_id = v_skill
      and exists (select 1 from section_checks sc
                   where sc.student_id = dp.student_id and sc.activity_id = p_activity_id);
end;
$$;

revoke execute on function dol_pass_status(uuid) from public, anon;
grant  execute on function dol_pass_status(uuid) to authenticated, service_role;

revoke execute on function dol_zone(uuid) from public, anon, authenticated;
grant  execute on function dol_zone(uuid) to service_role;
revoke execute on function dol_pass_skill(uuid) from public, anon, authenticated;
grant  execute on function dol_pass_skill(uuid) to service_role;

-- -----------------------------------------------------------------------------
-- §H. practice_item.tier (D66) + the mirror
-- -----------------------------------------------------------------------------
alter table practice_item
  add column tier text check (tier is null or tier in ('D', 'C', 'P', 'E'));

comment on column practice_item.tier is
  'The template''s `tier: D|C|P|E` line (D66, C-149), NULL when untagged (an untagged template is never filtered). mixed_plan serves P/E only after the student''s DoL pass for the skill (0070, DE-10).';

create or replace function sync_practice_items(
  p_owner uuid,
  p_items jsonb,
  p_apply boolean default false,
  p_allow_unretire boolean default false
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_active_before integer;
  v_new           text[];
  v_changed       text[];
  v_retired       text[];
  v_returning     text[];
begin
  if p_owner is null or not exists (select 1 from users where id = p_owner) then
    raise exception 'sync_practice_items: unknown owner %', p_owner;
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'sync_practice_items: p_items must be a jsonb array';
  end if;
  if jsonb_array_length(p_items) > 5000 then
    raise exception 'sync_practice_items: % items exceeds the 5000-item cap',
      jsonb_array_length(p_items);
  end if;
  if (select count(*) <> count(distinct i->>'item_id')
        from jsonb_array_elements(p_items) i) then
    raise exception 'sync_practice_items: duplicate item_id in p_items';
  end if;

  select count(*) into v_active_before
  from practice_item where owner_id = p_owner and retired_at is null;

  select coalesce(array_agg(i->>'item_id' order by i->>'item_id'), '{}')
    into v_new
  from jsonb_array_elements(p_items) i
  where not exists (
    select 1 from practice_item p
    where p.owner_id = p_owner and p.item_id = i->>'item_id');

  -- The fingerprint covers the tier when one is set (the importer adds it to
  -- the fingerprinted fields only when present, so untagged items keep theirs).
  select coalesce(array_agg(p.item_id order by p.item_id), '{}')
    into v_changed
  from jsonb_array_elements(p_items) i
  join practice_item p on p.owner_id = p_owner and p.item_id = i->>'item_id'
  where p.retired_at is null
    and (p.fingerprint, p.bank_path, p.position)
        is distinct from
        (i->>'fingerprint', i->>'bank_path', (i->>'position')::integer);

  select coalesce(array_agg(p.item_id order by p.item_id), '{}')
    into v_retired
  from practice_item p
  where p.owner_id = p_owner and p.retired_at is null
    and not exists (
      select 1 from jsonb_array_elements(p_items) i
      where i->>'item_id' = p.item_id);

  select coalesce(array_agg(p.item_id order by p.item_id), '{}')
    into v_returning
  from practice_item p
  where p.owner_id = p_owner and p.retired_at is not null
    and exists (
      select 1 from jsonb_array_elements(p_items) i
      where i->>'item_id' = p.item_id);

  if p_apply then
    if cardinality(v_returning) > 0 and not p_allow_unretire then
      raise exception 'sync_practice_items: retired item ids returned (%), refused — bank item ids are never reused (PB-3)',
        array_to_string(v_returning, ', ');
    end if;

    insert into practice_item
      (owner_id, item_id, bank_path, role, skill_id, chain_id, discriminates,
       status, position, document, seed_spec, value_table, fingerprint, tier,
       retired_at, updated_at)
    select p_owner,
           i->>'item_id',
           i->>'bank_path',
           i->>'role',
           nullif(i->>'skill_id', ''),
           i->>'chain_id',
           coalesce(array(select jsonb_array_elements_text(coalesce(i->'discriminates', '[]'::jsonb))), '{}'),
           i->>'status',
           (i->>'position')::integer,
           i->'document',
           i->'seed_spec',
           i->'value_table',
           i->>'fingerprint',
           nullif(i->>'tier', ''),
           null,
           now()
    from jsonb_array_elements(p_items) i
    on conflict (owner_id, item_id) do update
      set bank_path     = excluded.bank_path,
          role          = excluded.role,
          skill_id      = excluded.skill_id,
          chain_id      = excluded.chain_id,
          discriminates = excluded.discriminates,
          status        = excluded.status,
          position      = excluded.position,
          document      = excluded.document,
          seed_spec     = excluded.seed_spec,
          value_table   = excluded.value_table,
          fingerprint   = excluded.fingerprint,
          tier          = excluded.tier,
          retired_at    = null,
          updated_at    = case
            when (practice_item.fingerprint, practice_item.bank_path, practice_item.position)
                 is distinct from
                 (excluded.fingerprint, excluded.bank_path, excluded.position)
              or practice_item.retired_at is not null
            then now()
            else practice_item.updated_at
          end;

    update practice_item
       set retired_at = now(), updated_at = now()
     where owner_id = p_owner and item_id = any(v_retired);
  end if;

  return jsonb_build_object(
    'applied',       p_apply,
    'active_before', v_active_before,
    'new',           to_jsonb(v_new),
    'changed',       to_jsonb(v_changed),
    'retired',       to_jsonb(v_retired),
    'refused',       to_jsonb(case when p_allow_unretire then '{}'::text[] else v_returning end),
    'unretired',     to_jsonb(case when p_allow_unretire then v_returning else '{}'::text[] end));
end;
$$;

-- -----------------------------------------------------------------------------
-- §I. the D66 tier filter
-- -----------------------------------------------------------------------------
-- A skill template is served when it is untagged or D/C, or — P/E — when the
-- student has passed the skill's DoL, or when NO pass-granting DoL for the
-- skill is live at all (DE-10: otherwise a tagged skill would serve only D–C
-- to every student until a DoL is rewritten and republished).
create or replace function mixed_tier_ok(p_tier text, p_student_id uuid, p_skill_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_tier is null or p_tier in ('D', 'C')
      or exists (select 1 from dol_pass dp
                  where dp.student_id = p_student_id and dp.skill_id = p_skill_id)
      or not exists (
           select 1 from activities a
           where a.primary_skill = p_skill_id and a.deleted_at is null
             and a.current_version_id is not null
             and dol_pass_skill(a.id) = p_skill_id
             and exists (select 1 from activity_versions v
                         cross join lateral jsonb_array_elements(coalesce(v.content->'sections', '[]'::jsonb)) s
                         where v.id = a.current_version_id
                           and jsonb_typeof(s->'dol') = 'object'));
$$;

revoke execute on function mixed_tier_ok(text, uuid, text) from public, anon, authenticated;
grant  execute on function mixed_tier_ok(text, uuid, text) to service_role;


-- mixed_plan: 0066's body with the D66 tier filter at its TWO template reads —
-- the pool (a skill with only P/E templates and no pass is not in it) and the
-- item choice. Discrimination items are never tier-filtered: they assess a
-- choice between skills, not one skill's criterion. Nothing else changed.
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
                     and p.role = 'skill' and p.status = 'ratified' and p.retired_at is null
                     and mixed_tier_ok(p.tier, p_student_id, p.skill_id))      -- 0070 D66
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
    -- C-148 (author ruling 2026-10-20): every covered skill TAUGHT, not every
    -- covered skill banked; a skill with no bank of its own still counts.
    where (select coalesce(array_agg(distinct t.skill_id), '{}') from taught t) @> d.skills
  ),
  -- C-145 ask 8: the most recent taught day's skills first (the first spaced
  -- retrieval), then the backlog oldest-taught first in chain order, so a
  -- skill's prerequisites come back before it does.
  t1 as (
    select 'skill'::text as kind, sk.skill_id as key, sk.owners, 1 as tier,
           row_number() over (
             order by (sk.taught_day = sk.latest) desc,
                      sk.chain_order, sk.taught_day, sk.skill_id) as r
    from (select sk.*, max(sk.taught_day) over () as latest
            from sk where sk.step is null) sk
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
     and ((c.kind = 'skill' and p.role = 'skill' and p.skill_id = c.key
           and mixed_tier_ok(p.tier, p_student_id, p.skill_id))                -- 0070 D66
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
