-- =============================================================================
-- 0072 — targeted practice between DoL attempts (curriculum D65, slice 2)
-- -----------------------------------------------------------------------------
-- docs/design/dol-targeted-practice.md, TP-1…TP-9 (all ruled 2026-10-30).
--
--   §A  dol_practice_sessions / _items / _attempts — SEPARATE from mixed
--       practice's tables (TP-2): nothing here feeds mixed spacing or the
--       teacher panel, and none of the 13 live mixed readers is touched.
--       Keyed to (student, version), not to a class — a DoL check has no class.
--   §B  dol_practice_session_payload — what a caller may know (ids, its own
--       results; never a document, a row or an answer).
--   §C  start_dol_practice — AS THE CALLER. Only for a student whose first DoL
--       try is recorded on this version, who has not passed, with a retake
--       left (TP-1). Picks 4 ratified templates of the primary skill's bank:
--       those binding a misconception the first try showed first, then the
--       rest, the D66 tier filter applied (TP-3); snapshots them (TP-4).
--   §D  dol_practice_item_for_check (AS THE CALLER) and
--       record_dol_practice_attempt (SERVICE ROLE) — mixed practice's G2/G3,
--       first try only, record before verdict.
--
-- ⚠ PERSONAL DATA: the attempts are student-derived (answers to practice
-- questions). data-map.md and retention-policy.md change in this commit. Kept
-- for the account's lifetime and removed with it (the `users` cascade), like
-- dol_pass; there is no separate prune (TP: the DoL's window is the account
-- path's, as section_checks').
-- =============================================================================

-- -----------------------------------------------------------------------------
-- §A. the tables
-- -----------------------------------------------------------------------------
create table dol_practice_sessions (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references users(id) on delete cascade,
  activity_id  uuid not null references activities(id) on delete cascade,
  version_id   uuid not null references activity_versions(id) on delete cascade,
  skill_id     text not null check (length(skill_id) between 1 and 120),
  planned      integer not null check (planned between 1 and 10),
  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  -- One practice per student per DoL version: a resumed start returns it.
  unique (student_id, version_id)
);

create table dol_practice_items (
  session_id   uuid not null references dol_practice_sessions(id) on delete cascade,
  seq          integer not null check (seq >= 1),
  student_id   uuid not null references users(id) on delete cascade,
  owner_id     uuid not null,
  item_id      text not null,
  fingerprint  text not null,
  row_index    integer not null check (row_index >= 0),
  document     jsonb not null,
  row_values   jsonb not null check (jsonb_typeof(row_values) = 'object'),
  primary key (session_id, seq)
);

create table dol_practice_attempts (
  session_id   uuid not null,
  seq          integer not null,
  student_id   uuid not null references users(id) on delete cascade,
  correct      boolean not null,
  skipped      boolean not null default false,
  responses    jsonb not null default '{}'::jsonb,
  verdicts     jsonb not null default '{}'::jsonb,
  saved_at     timestamptz not null default now(),
  primary key (session_id, seq),
  foreign key (session_id, seq) references dol_practice_items(session_id, seq) on delete cascade,
  check (not (skipped and correct))
);

create index dol_practice_sessions_student_idx on dol_practice_sessions (student_id);
create index dol_practice_items_student_idx on dol_practice_items (student_id);
create index dol_practice_attempts_student_idx on dol_practice_attempts (student_id);

comment on table dol_practice_sessions is
  'Targeted practice between DoL attempts (0072, D65 slice 2): one per student per DoL version. STUDENT-DERIVED. Written only by start_dol_practice / record_dol_practice_attempt; no client read path. Removed with the account (users cascade).';
comment on table dol_practice_items is
  'The 4 bank items a targeted practice serves, SNAPSHOTTED at start (0072, mixed practice ER-4). ANSWER-KEY CLASS: no client read path.';
comment on table dol_practice_attempts is
  'One student''s first try per targeted-practice item (0072). STUDENT-DERIVED. Never scored, never read by mixed practice or the teacher panel (TP-2/TP-7).';

alter table dol_practice_sessions enable row level security;
alter table dol_practice_sessions force row level security;
alter table dol_practice_items enable row level security;
alter table dol_practice_items force row level security;
alter table dol_practice_attempts enable row level security;
alter table dol_practice_attempts force row level security;
-- NO POLICIES, deliberately (the mixed tables' posture): every access is a
-- definer function below.
revoke all on table dol_practice_sessions, dol_practice_items, dol_practice_attempts
  from anon, authenticated;
grant all on table dol_practice_sessions, dol_practice_items, dol_practice_attempts
  to service_role;

-- -----------------------------------------------------------------------------
-- §B. the payload
-- -----------------------------------------------------------------------------
create or replace function dol_practice_session_payload(p_session_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'session_id', s.id, 'planned', s.planned,
    'finished', s.finished_at is not null,
    'items', (select coalesce(jsonb_agg(jsonb_build_object(
                'seq', i.seq, 'answered', a.seq is not null)
              order by i.seq), '[]'::jsonb)
              from dol_practice_items i
              left join dol_practice_attempts a on a.session_id = i.session_id and a.seq = i.seq
             where i.session_id = s.id))
  from dol_practice_sessions s where s.id = p_session_id;
$$;

-- -----------------------------------------------------------------------------
-- §C. start_dol_practice — AS THE CALLER
-- -----------------------------------------------------------------------------
-- States: `resume` (their session, open or finished), `started` (new),
-- `nothing_to_practise` (no ratified template of the skill passes the tier
-- filter, TP-6). Every refusal is ONE "Not available" (no oracle): not
-- signed in, not a published version of a live activity, no DoL section, no
-- first try recorded, already passed, or no retake left.
create or replace function start_dol_practice(p_activity_id uuid, p_version_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid      uuid := auth.uid();
  v_content  jsonb;
  v_dol      jsonb;
  v_src      activities%rowtype;
  v_attempts integer;
  v_latest   section_checks%rowtype;
  v_mis      text[];
  v_id       uuid;
  v_n        integer;
  v_plan     jsonb;
begin
  if v_uid is null then
    raise exception 'Not available' using errcode = '42501';
  end if;
  select v.content into v_content
  from activities a join activity_versions v on v.activity_id = a.id
  where a.id = p_activity_id and v.id = p_version_id
    and a.deleted_at is null and a.status = 'published';
  select s into v_dol
  from jsonb_array_elements(coalesce(v_content->'sections', '[]'::jsonb)) s
  where jsonb_typeof(s->'dol') = 'object'
  limit 1;
  if v_content is null or v_dol is null or coalesce((v_dol->'dol'->>'retake')::boolean, false) is not true then
    raise exception 'Not available' using errcode = '42501';
  end if;

  -- The skill and the bank owner come from the SOURCE activity (a Bank copy
  -- resolves through what it was copied from, DE-11).
  select src.* into v_src
  from activities a join activities src on src.id = coalesce(a.copied_from_activity_id, a.id)
  where a.id = p_activity_id;
  if v_src.primary_skill is null then
    raise exception 'Not available' using errcode = '42501';
  end if;

  select count(*) into v_attempts from section_checks
   where student_id = v_uid and activity_version_id = p_version_id and section_id = v_dol->>'id';
  if v_attempts <> 1 or exists (
       select 1 from dol_pass dp where dp.student_id = v_uid and dp.skill_id = v_src.primary_skill) then
    raise exception 'Not available' using errcode = '42501';
  end if;

  select id into v_id from dol_practice_sessions where student_id = v_uid and version_id = p_version_id;
  if v_id is not null then
    return jsonb_build_object('state', 'resume', 'session', dol_practice_session_payload(v_id));
  end if;

  -- What the first try showed (0061 reads the same verdict field).
  select * into v_latest from section_checks
   where student_id = v_uid and activity_version_id = p_version_id and section_id = v_dol->>'id'
   order by attempt_number desc limit 1;
  select coalesce(array_agg(distinct m), '{}') into v_mis
  from jsonb_each(coalesce(v_latest.verdicts, '{}'::jsonb)) e(k, v)
  cross join lateral jsonb_array_elements_text(coalesce(e.v->'misconceptionIds', '[]'::jsonb)) m;

  -- TP-3: 4 ratified templates, the ones binding a shown misconception first.
  select coalesce(jsonb_agg(jsonb_build_object('seq', c.rn, 'owner_id', c.owner_id, 'item_id', c.item_id)
                            order by c.rn), '[]'::jsonb)
    into v_plan
  from (
    select p.owner_id, p.item_id,
           row_number() over (order by h.hits desc, p.position, p.item_id) as rn
    from practice_item p
    cross join lateral (
      select count(*) as hits
      from jsonb_path_query(p.document, 'strict $.**.misconceptionId') x
      where x #>> '{}' = any (v_mis)) h
    where p.owner_id = v_src.owner_id and p.role = 'skill' and p.skill_id = v_src.primary_skill
      and p.status = 'ratified' and p.retired_at is null
      and mixed_tier_ok(p.tier, v_uid, p.skill_id)
  ) c
  where c.rn <= 4;
  v_n := jsonb_array_length(v_plan);
  if v_n = 0 then
    return jsonb_build_object('state', 'nothing_to_practise');
  end if;

  begin
    insert into dol_practice_sessions (student_id, activity_id, version_id, skill_id, planned)
    values (v_uid, p_activity_id, p_version_id, v_src.primary_skill, v_n)
    returning id into v_id;
  exception when unique_violation then
    -- Two tabs started at once; the other one won. Hand back its session.
    select id into v_id from dol_practice_sessions where student_id = v_uid and version_id = p_version_id;
    return jsonb_build_object('state', 'resume', 'session', dol_practice_session_payload(v_id));
  end;

  -- ER-4 / TP-4: snapshot each item with its drawn row (mixed practice's hash).
  insert into dol_practice_items (session_id, seq, student_id, owner_id, item_id, fingerprint,
                                  row_index, document, row_values)
  select v_id, t.seq, v_uid, p.owner_id, p.item_id, p.fingerprint, r.idx, p.document,
         coalesce((select jsonb_object_agg(c.name, (p.value_table->'rows'->r.idx)->((c.i - 1)::int))
                     from jsonb_array_elements_text(p.value_table->'columns') with ordinality c(name, i)),
                  '{}'::jsonb)
  from jsonb_to_recordset(v_plan) as t(seq integer, owner_id uuid, item_id text)
  join practice_item p on p.owner_id = t.owner_id and p.item_id = t.item_id
  cross join lateral (select mixed_row_index(v_id, p.item_id,
                                             jsonb_array_length(p.value_table->'rows')) as idx) r;

  return jsonb_build_object('state', 'started', 'session', dol_practice_session_payload(v_id));
end;
$$;

-- -----------------------------------------------------------------------------
-- §D. the check pair
-- -----------------------------------------------------------------------------
-- AS THE CALLER: the session is theirs and the slot is in it. A slot already
-- tried returns its stored try (replay); a new try needs the session
-- unfinished. Returns only what the handler reads (0069's lesson).
create or replace function dol_practice_item_for_check(p_session_id uuid, p_seq integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_s dol_practice_sessions%rowtype;
  v_a dol_practice_attempts%rowtype;
begin
  select * into v_s from dol_practice_sessions where id = p_session_id;
  if auth.uid() is null or v_s.id is null or v_s.student_id <> auth.uid()
     or not exists (select 1 from dol_practice_items where session_id = p_session_id and seq = p_seq) then
    raise exception 'Not available' using errcode = '42501';
  end if;
  select * into v_a from dol_practice_attempts where session_id = p_session_id and seq = p_seq;
  if v_a.session_id is not null then
    return jsonb_build_object('replay', true, 'student_id', v_s.student_id,
                              'correct', v_a.correct, 'skipped', v_a.skipped, 'verdicts', v_a.verdicts);
  end if;
  if v_s.finished_at is not null then
    raise exception 'Not available' using errcode = '42501';
  end if;
  return jsonb_build_object('replay', false, 'student_id', v_s.student_id);
end;
$$;

-- SERVICE ROLE (it accepts a verdict). First write wins; a replay changes
-- nothing; the session finishes when every slot has a try.
create or replace function record_dol_practice_attempt(
  p_student_id uuid, p_session_id uuid, p_seq integer, p_correct boolean,
  p_skipped boolean, p_responses jsonb, p_verdicts jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_s   dol_practice_sessions%rowtype;
  v_a   dol_practice_attempts%rowtype;
  v_new boolean := false;
begin
  select * into v_s from dol_practice_sessions where id = p_session_id for update;
  if v_s.id is null or v_s.student_id is distinct from p_student_id or p_correct is null
     or (coalesce(p_skipped, false) and p_correct)
     or not exists (select 1 from dol_practice_items where session_id = p_session_id and seq = p_seq) then
    raise exception 'record_dol_practice_attempt: refused';
  end if;
  if not exists (select 1 from dol_practice_attempts where session_id = p_session_id and seq = p_seq)
     and v_s.finished_at is not null then
    raise exception 'record_dol_practice_attempt: refused (session closed)';
  end if;

  insert into dol_practice_attempts (session_id, seq, student_id, correct, skipped, responses, verdicts)
  values (p_session_id, p_seq, v_s.student_id, p_correct, coalesce(p_skipped, false),
          coalesce(p_responses, '{}'::jsonb), coalesce(p_verdicts, '{}'::jsonb))
  on conflict (session_id, seq) do nothing;
  v_new := found;
  if v_new then
    update dol_practice_sessions s
       set finished_at = case when (select count(*) from dol_practice_attempts where session_id = s.id) >= s.planned
                              then coalesce(s.finished_at, now()) else s.finished_at end
     where s.id = p_session_id;
  end if;
  select * into v_a from dol_practice_attempts where session_id = p_session_id and seq = p_seq;
  return jsonb_build_object('replayed', not v_new, 'correct', v_a.correct,
                            'skipped', v_a.skipped, 'verdicts', v_a.verdicts);
end;
$$;

-- -----------------------------------------------------------------------------
-- grants
-- -----------------------------------------------------------------------------
revoke execute on function start_dol_practice(uuid, uuid) from public, anon;
grant  execute on function start_dol_practice(uuid, uuid) to authenticated, service_role;
revoke execute on function dol_practice_item_for_check(uuid, integer) from public, anon;
grant  execute on function dol_practice_item_for_check(uuid, integer) to authenticated, service_role;
revoke execute on function dol_practice_session_payload(uuid) from public, anon, authenticated;
grant  execute on function dol_practice_session_payload(uuid) to service_role;
revoke execute on function record_dol_practice_attempt(uuid, uuid, integer, boolean, boolean, jsonb, jsonb)
  from public, anon, authenticated;
grant  execute on function record_dol_practice_attempt(uuid, uuid, integer, boolean, boolean, jsonb, jsonb)
  to service_role;
