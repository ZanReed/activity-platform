-- =============================================================================
-- 0042_grade_suggestions.sql — AI grading assist: the suggestion store + RPCs
-- -----------------------------------------------------------------------------
-- Implements the reviewed architecture in docs/design/ai-grading-assist.md
-- (D1–D14 ratified 2026-09-25; hardening rulings §2b W-1..9, §4b DR-1..12,
-- §3b EH-1..16; full /autoplan gate APPROVED 2026-09-25).
--
--   §A  audit_action gains suggestion.claim / .submit / .reject
--   §B  the three enums (provider, status, source)
--   §C  misconception_registry — the mirrored platform table          (EH-7)
--   §D  grading_settings / platform budget / model prices             (D11–D13)
--   §E  check_grade_suggestions — the table, deny-by-default          (D2)
--   §F  validate_check_grade_criteria — ONE validator, shared         (EH-6)
--   §G  upsert_check_grade v2 — same signature, now calls §F
--   §H  claim_grade_suggestions — the worker pull                     (W-2, EH-1..4,8,12,14)
--   §I  submit_grade_suggestion — the worker write                    (W-2, EH-6,11)
--   §J  confirm / reject — the teacher resolution, ONE transaction    (EH-5, DR-2/3/8)
--   §K  list_grade_suggestions — the queue's sibling read             (DR-6/10, EH-13)
--   §L  grants (0009's standing rule)
--
-- ⚠ AUTH PREDICATE (EH-1, citing 0034 §C): every worker-facing RPC here gates
-- on the EDIT relationship, never can_read_activity. 0034 §C records why:
-- can_read_activity is the Activity-Bank landmine — the co-ownership arc may
-- widen READ, and a widened read helper must never silently confer the right
-- to bulk-extract student responses + answer keys (claim) or draft academic
-- records (submit). Where this file scans across activities it uses the
-- owner_id predicate — can_edit_activity's own body (0009) evaluated for an
-- explicit teacher id — which FAILS CLOSED if edit is ever widened: co-owners
-- would be excluded, not leaked to. The co-ownership arc revisits that scan
-- deliberately, not by inheriting it.
--
-- A SUGGESTION IS NOT A GRADE (D2): rows here never reach students — separate
-- table, zero policies, AND the release gate still sits on check_grades.
-- Conversion happens only through §J, which replays the teacher's values
-- through the EXISTING upsert_check_grade under the teacher's uuid.
--
-- SUPERSESSION KEYS ON TEXT, NEVER ATTEMPT NUMBER (EH-3): the same G2 ruling
-- 0034's header encodes. Re-checking to retry auto-graded blanks is a designed
-- feature; a pending draft on identical text is re-keyed to the latest check,
-- not re-inferred — that rule is also the cost model (GPU time now, metered
-- tokens on platform_api later).
--
-- ORDER CONTRACT: §A's labels are added before any body USES them (the 0033
-- §A / 0034 §A rule), and nothing here writes an audit row at migration time.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. Audit actions
-- -----------------------------------------------------------------------------
-- suggestion.claim  — one row per claim call that actually handed out work
--                     (empty polls are not events; an audit rail that records
--                     non-events lies — 0030's phrasing, applied at machine
--                     cadence).
-- suggestion.submit — one row per stored draft. The suggestion row itself is
--                     the telemetry record (rev-stamped, token-counted); the
--                     audit row is the tamper-evident trail the FERPA posture
--                     wants for "a machine drafted against this student's work".
-- suggestion.reject — the teacher refusal (DR-8); confirm needs no new label
--                     because §J routes through upsert_check_grade, which
--                     already writes grade.upsert.
alter type audit_action add value if not exists 'suggestion.claim';
alter type audit_action add value if not exists 'suggestion.submit';
alter type audit_action add value if not exists 'suggestion.reject';

-- -----------------------------------------------------------------------------
-- B. Enums
-- -----------------------------------------------------------------------------
-- grading_provider (D11): the per-teacher seam. Default 'off'; the pilot wires
-- only local_worker; platform_api stays UI-unreachable until the compliance
-- pack + hosted-model validation both land (D10, §7a — two blocking
-- prerequisites, not deferrals).
create type grading_provider as enum ('off', 'local_worker', 'platform_api');

-- suggestion_status (EH-4 amended §3's list with 'claimed'): claim INSERTS the
-- row as 'claimed' (a lease with no content yet); submit moves it to
-- 'pending' (a draft awaiting the teacher); the teacher resolves it to
-- confirmed/edited/rejected; 'superseded' is stamped opportunistically by the
-- claim-path sweep when the student's TEXT moved on (never by anything on the
-- student submit path).
create type suggestion_status as enum
  ('claimed', 'pending', 'confirmed', 'edited', 'rejected', 'superseded');

-- suggestion_source (EH-10): study rows are marked IN-ROW so the queue read,
-- the DR-10 provenance join, and edit-rate telemetry can all exclude them —
-- otherwise D7's blind-study rows would sit as eternal pendings poisoning the
-- exact denominators the study exists to establish.
create type suggestion_source as enum ('production', 'study');

-- -----------------------------------------------------------------------------
-- C. misconception_registry — the mirrored platform table (EH-7)
-- -----------------------------------------------------------------------------
-- The registry itself lives in the authoring project; before this table the
-- platform could see mis.* ids ONLY as opaque tags inside auto-scored block
-- bindings, so §3's "ids validated against the registry" was unimplementable.
-- This mirror is seeded/refreshed by `pnpm import:batch` (the same run that
-- writes docs/misconception-manifest.md — one refresh path, two artifacts).
-- Content is generated, public documentation — not student data — so the read
-- grant below is deliberately wide: the worker's prompt builder and the app
-- both read it directly.
--
-- skill/description are NULLABLE on purpose: today's registry format
-- (misconception-registry.txt, one id per line) carries only ids — which is
-- all the submit RPC's validation needs. The richer columns fill when the
-- curriculum side extends the registry with skill attachments + descriptors
-- (the D5 prompt inputs) — that ask is filed on the boundary page, and the
-- fill is additive.
create table misconception_registry (
  id          text primary key,
  skill       text,
  description text,
  updated_at  timestamptz not null default now()
);

create index misconception_registry_skill_idx on misconception_registry (skill);

alter table misconception_registry enable row level security;
alter table misconception_registry force row level security;

-- One read policy; writes only through the importer's service connection.
create policy misconception_registry_read on misconception_registry
  for select to authenticated using (true);

comment on table misconception_registry is
  'Platform mirror of the authoring-side misconception registry (0042, EH-7). Seeded/refreshed by pnpm import:batch. Public generated content: readable by any signed-in user; written only via service role.';

-- -----------------------------------------------------------------------------
-- D. Provider settings, platform budget, model prices (D11–D13, EH-8, EH-15)
-- -----------------------------------------------------------------------------
-- A separate settings table, NOT columns on users: users carries table-level
-- client UPDATE (0032) and 0036 already had to bolt a trigger guard onto its
-- machinery columns. Quota is the author's money and provider is a compliance
-- gate — neither may be self-serviceable, so they live behind zero policies.
-- The pilot flip is the documented SQL one-liner (W-8):
--   insert into grading_settings (teacher_id, provider)
--   values ('<author-uuid>', 'local_worker')
--   on conflict (teacher_id) do update set provider = excluded.provider;
create table grading_settings (
  teacher_id         uuid primary key references users(id) on delete cascade,
  provider           grading_provider not null default 'off',
  -- Per-teacher period quota in MICRODOLLARS (EH-15: integer cents floors
  -- sub-cent hosted calls to zero and a sum of zeros never trips the gate).
  -- Calendar-month period, UTC. Only enforced when provider = platform_api.
  quota_microdollars bigint not null default 0 check (quota_microdollars >= 0),
  updated_at         timestamptz not null default now()
);

alter table grading_settings enable row level security;
alter table grading_settings force row level security;

comment on table grading_settings is
  'Per-teacher AI-grading provider + platform_api budget quota (0042, D11/D13). Zero policies by design: provider is a compliance gate and quota is budget protection — neither is client-writable. Read inside claim_grade_suggestions only.';

-- The GLOBAL cap (D13): the author's actual monthly budget, the backstop that
-- holds even if per-teacher math is wrong. Singleton row; a MISSING row reads
-- as cap 0 — platform_api claims fail closed until the author sets it.
create table grading_platform_budget (
  id                       boolean primary key default true check (id),
  monthly_cap_microdollars bigint not null check (monthly_cap_microdollars >= 0),
  updated_at               timestamptz not null default now()
);

alter table grading_platform_budget enable row level security;
alter table grading_platform_budget force row level security;

comment on table grading_platform_budget is
  'Singleton global platform_api spend cap in microdollars per calendar month (0042, D13). Missing row = cap 0 = platform_api claims refuse (fail closed).';

-- Cost is computed AT AGGREGATION TIME from token counts × this table (EH-15)
-- — never stored per row, so a mid-period price change cannot rewrite history
-- it never touched. Rows exist only for hosted (platform_api) models; local
-- pilot models are deliberately absent (their rows are non-billable, §E).
create table grading_model_prices (
  model_id                    text primary key,
  input_microdollars_per_mtok  bigint not null check (input_microdollars_per_mtok  >= 0),
  output_microdollars_per_mtok bigint not null check (output_microdollars_per_mtok >= 0),
  updated_at                  timestamptz not null default now()
);

alter table grading_model_prices enable row level security;
alter table grading_model_prices force row level security;

comment on table grading_model_prices is
  'Hosted-model token prices in microdollars per million tokens (0042, EH-15). Joined at claim-time aggregation; a billable row whose model is missing here is counted at the MAX configured price (conservative), and an EMPTY table refuses platform_api claims outright.';

-- -----------------------------------------------------------------------------
-- E. check_grade_suggestions (D2, §3 as amended by EH-3/4/10/15)
-- -----------------------------------------------------------------------------
-- One row per (check, block) draft. check_id ON DELETE CASCADE keeps the
-- retention interlock whole with zero purge_soft_deleted edits — the 0034 §B
-- precedent (P7): both purge paths delete section_checks, and this cascade
-- rides along exactly as check_grades' does.
create table check_grade_suggestions (
  id                     uuid primary key default gen_random_uuid(),
  check_id               uuid not null references section_checks(id) on delete cascade,
  block_id               uuid not null,
  source                 suggestion_source not null default 'production',
  status                 suggestion_status not null default 'claimed',
  -- Same shape as check_grades.criteria: [{criterionId, earned, maxPoints,
  -- feedback}] — normalized by §F with SERVER-copied maxPoints (EH-6): the
  -- worker's numbers are never trusted for the denominator.
  criteria               jsonb not null default '[]'::jsonb,
  general_feedback_draft text,
  -- [{misId, evidence}] — ids validated against §C at submit ("rejected at
  -- the door, not stored broken").
  misconception_notes    jsonb not null default '[]'::jsonb,
  -- misIds the teacher struck at confirm (DR-4: chip strikes are edits AND
  -- per-tag telemetry — the production continuation of the study's precision
  -- metric).
  struck_mis             jsonb not null default '[]'::jsonb,
  -- The MODEL's signal (D6). Never touches the student's self-reported
  -- confidence — the photo-grading rule. 'low' rows are never pre-filled.
  machine_confidence     text check (machine_confidence in ('high', 'low')),
  -- Rev stamps (the SANITIZER_REV pattern): the three live in-repo as worker
  -- constants; a row without them is refused at submit — a rev that exists
  -- only in a running process is not a rev.
  model_id               text,
  prompt_rev             int,
  schema_rev             int,
  -- Metering (D12/EH-15): tokens are canonical; cost is derived at
  -- aggregation from grading_model_prices. No per-row cost column.
  tokens_in              int check (tokens_in  >= 0),
  tokens_out             int check (tokens_out >= 0),
  -- Stamped at claim from the teacher's provider: TRUE only for platform_api
  -- claims. The quota aggregate (§H) sums billable rows only, so the author's
  -- local pilot can never self-throttle and a later provider flip cannot
  -- retroactively bill history (§7a provider scoping).
  billable               boolean not null default false,
  -- md5 of the response text at claim time — the supersession key (EH-3).
  source_text_hash       text not null,
  claimed_at             timestamptz not null default now(),
  -- Lease (W-3/EH-4): expiry is stamped at claim (duration is worker config,
  -- default 15 min); an expired 'claimed' row is re-claimable and a submit
  -- against it returns lease_expired — a crashed worker strands nothing.
  lease_expires_at       timestamptz not null,
  submitted_at           timestamptz,
  resolved_at            timestamptz,
  -- DR-8's one-tap reject reason, per-rev telemetry.
  reject_reason          text check (reject_reason in
                           ('wrong_points', 'wrong_feedback', 'wrong_misconception')),
  created_at             timestamptz not null default now(),
  -- The optimistic-concurrency rev §J checks (EH-5): a confirm against a row
  -- that moved under the teacher is rejected, never silently mis-attributed.
  updated_at             timestamptz not null default now()
);

-- ONE LIVE DRAFT PER (check, block) — for PRODUCTION rows only (EH-10
-- consequence): study runs may legitimately revisit the same block across
-- prompt/model revs, and study rows are never teacher-actioned, so the
-- one-draft invariant is a production concept. This partial unique is also
-- the race backstop under concurrent claimers (§H locks first, this catches
-- what slips).
create unique index check_grade_suggestions_production_key
  on check_grade_suggestions (check_id, block_id)
  where source = 'production';

-- FK covering index (0009 discipline) — the partial unique above does not
-- cover study rows for cascade scans.
create index check_grade_suggestions_check_idx
  on check_grade_suggestions (check_id);

-- The claim scan (EH-4): live/expired leases.
create index check_grade_suggestions_claimed_idx
  on check_grade_suggestions (status, claimed_at)
  where status = 'claimed';

-- The quota aggregate (EH-8): month-scoped billable spend.
create index check_grade_suggestions_billable_idx
  on check_grade_suggestions (created_at)
  where billable;

alter table check_grade_suggestions enable row level security;
alter table check_grade_suggestions force row level security;

-- NO POLICIES AT ALL — the 0034 §B shape: the absence of a policy is the
-- control. Every read and write goes through the audited/scoped functions
-- below; students have no path here at all, and the release gate on
-- check_grades makes the double-gating structural (D2).

comment on table check_grade_suggestions is
  'AI-drafted rubric grades awaiting teacher resolution (0042, D2). A suggestion is NOT a grade: conversion happens only through confirm_grade_suggestion, which replays through upsert_check_grade under the teacher''s uuid. No RLS policies by design: all access via claim/submit/confirm/reject/list_grade_suggestions.';

-- -----------------------------------------------------------------------------
-- F. validate_check_grade_criteria — one validator, shared (EH-6)
-- -----------------------------------------------------------------------------
-- The exact checks 0034 §C performed inline, extracted so upsert_check_grade
-- (§G) and submit_grade_suggestion (§I) cannot drift at the first
-- rubric-shape change (x_dol_rubric_levels is already scheduled). Pure
-- validation: containment, gradable type, criterion ⊆ pinned rubric,
-- SERVER-copied maxPoints, earned range. Auth stays in each caller.
--
-- Returns {"criteria": [...normalized...], "rubric_count": n}. Raises the
-- SAME messages 0034 §C raised — verify-0042's parity leg pins both callers
-- to one refusal matrix.
--
-- Not client-callable (§L): it runs only inside the DEFINER bodies below,
-- where execution needs no client grant.
create or replace function validate_check_grade_criteria(
  p_check_id uuid,
  p_block_id uuid,
  p_criteria jsonb
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_check    section_checks%rowtype;
  v_content  jsonb;
  v_block    jsonb;
  v_criteria jsonb := '[]'::jsonb;
  v_item     jsonb;
  v_rubric   jsonb;
  v_max      numeric;
  v_earned   numeric;
begin
  select * into v_check from section_checks where id = p_check_id;
  if v_check.id is null then
    raise log 'grade refused (no_check) user=% check=%', auth.uid(), p_check_id;
    raise exception 'No such response to grade';
  end if;

  select content into v_content
  from activity_versions where id = v_check.activity_version_id;

  -- The block must live in THIS check's section, in the version the student
  -- was actually served (schema: Section.rows[].columns[].blocks[]).
  select b into v_block
  from jsonb_array_elements(coalesce(v_content->'sections', '[]'::jsonb)) s
  cross join lateral jsonb_array_elements(coalesce(s->'rows', '[]'::jsonb)) r
  cross join lateral jsonb_array_elements(coalesce(r->'columns', '[]'::jsonb)) c
  cross join lateral jsonb_array_elements(coalesce(c->'blocks', '[]'::jsonb)) b
  where s->>'id' = v_check.section_id
    and b->>'id' = p_block_id::text
  limit 1;

  if v_block is null then
    raise log 'grade refused (block_not_in_section) user=% check=% block=%',
      auth.uid(), p_check_id, p_block_id;
    raise exception 'That question is not in this section';
  end if;

  if v_block->>'type' not in ('short_answer', 'essay') then
    raise log 'grade refused (not_gradable=%) user=% block=%',
      v_block->>'type', auth.uid(), p_block_id;
    raise exception 'Only written-answer questions can be graded';
  end if;

  v_rubric := v_block->'rubric'->'criteria';

  for v_item in select * from jsonb_array_elements(coalesce(p_criteria, '[]'::jsonb))
  loop
    select (c->>'maxPoints')::numeric into v_max
    from jsonb_array_elements(coalesce(v_rubric, '[]'::jsonb)) c
    where c->>'id' = v_item->>'criterionId'
    limit 1;

    if v_max is null then
      raise log 'grade refused (criterion_not_on_rubric) user=% block=% criterion=%',
        auth.uid(), p_block_id, v_item->>'criterionId';
      raise exception 'That criterion is not on this rubric';
    end if;

    v_earned := (v_item->>'earned')::numeric;
    if v_earned is null or v_earned < 0 or v_earned > v_max then
      raise log 'grade refused (points_out_of_range) user=% block=% earned=% max=%',
        auth.uid(), p_block_id, v_earned, v_max;
      raise exception 'Points must be between 0 and the maximum';
    end if;

    v_criteria := v_criteria || jsonb_build_array(jsonb_build_object(
      'criterionId', v_item->>'criterionId',
      'earned',      v_earned,
      'maxPoints',   v_max,
      'feedback',    nullif(trim(coalesce(v_item->>'feedback', '')), '')
    ));
  end loop;

  return jsonb_build_object(
    'criteria',     v_criteria,
    'rubric_count', coalesce(jsonb_array_length(v_rubric), 0)
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- G. upsert_check_grade v2 — same signature, now calls §F
-- -----------------------------------------------------------------------------
-- Behavior-identical to 0034 §C for every caller (same signature, so no 0040
-- drop-first hazard). The only change is that the validation body moved to
-- §F, where §I shares it.
create or replace function upsert_check_grade(
  p_check_id         uuid,
  p_block_id         uuid,
  p_criteria         jsonb,
  p_general_feedback text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_check    section_checks%rowtype;
  v_criteria jsonb;
  v_row      check_grades%rowtype;
begin
  if auth.uid() is null then
    raise log 'grade refused (signed_out)';
    raise exception 'Sign in before grading';
  end if;

  select * into v_check from section_checks where id = p_check_id;
  if v_check.id is null then
    raise log 'grade refused (no_check) user=% check=%', auth.uid(), p_check_id;
    raise exception 'No such response to grade';
  end if;

  if not can_edit_activity(v_check.activity_id) then
    raise log 'grade refused (not_owner) user=% activity=%', auth.uid(), v_check.activity_id;
    raise exception 'Not your activity';
  end if;

  v_criteria := (validate_check_grade_criteria(p_check_id, p_block_id, p_criteria))->'criteria';

  insert into check_grades (check_id, block_id, criteria, general_feedback, graded_by)
  values (
    p_check_id,
    p_block_id,
    v_criteria,
    nullif(trim(coalesce(p_general_feedback, '')), ''),
    auth.uid()
  )
  on conflict (check_id, block_id) do update
    set criteria         = excluded.criteria,
        general_feedback = excluded.general_feedback,
        graded_by        = excluded.graded_by,
        updated_at       = now()
        -- released_at is deliberately NOT touched (0034 §C): release is §D's
        -- job alone.
  returning * into v_row;

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'grade.upsert', 'activity', v_check.activity_id,
          jsonb_build_object('check_id', p_check_id, 'block_id', p_block_id,
                             'student_id', v_check.student_id));

  return jsonb_build_object(
    'id',          v_row.id,
    'check_id',    v_row.check_id,
    'block_id',    v_row.block_id,
    'criteria',    v_row.criteria,
    'released_at', v_row.released_at,
    'graded_at',   v_row.graded_at,
    'updated_at',  v_row.updated_at
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- H. claim_grade_suggestions — the worker pull (W-2; EH-1/2/3/4/8/12/14)
-- -----------------------------------------------------------------------------
-- Returns a TYPED result, never a bare array for a gated refusal (W-2 — also
-- DR-9's single source of truth):
--   {"status": "ok",           "items": [...], "dropped": n?}
--   {"status": "provider_off", "items": []}
--   {"status": "quota_paused", "items": [], "resumes_at": <ts>}
--
-- Claim unit is the CHECK (EH-4): one lease covers all a check's rubric
-- blocks, so a p_limit of 4 covers a few inferences even at 70B speeds (W-3).
--
-- Identity (EH-9): p_teacher_id is honored ONLY for service_role callers —
-- the platform-side worker of the D11 service path. The pilot worker (a plain
-- teacher session, D3) never passes it.
--
-- Item shape (production): {suggestion_id, check_id, block_id, activity_id,
-- activity_version_id, section_id, attempt_number, block, response_text,
-- anchors}. `block` is the whole pinned block node (prompt content, rubric,
-- answer, solution) — the caller owns the activity, so this is the teacher's
-- own document. `anchors` (E1) is up to two teacher-confirmed grades for the
-- same (block, version) with their response texts, ALWAYS excluding the check
-- being graded, and ALWAYS omitted in study mode (the blind study's anchor
-- policy, §5.2).
--
-- Scan cost (EH-16): this is a latest-check × jsonb walk across the teacher's
-- activities per poll — fine at pilot scale, named as the D11-promotion
-- decision (watermark or 0036-pattern signal) in TODOS.
create or replace function claim_grade_suggestions(
  p_limit          int  default 4,
  p_lease_minutes  int  default 15,
  p_prompt_rev     int  default null,
  p_schema_rev     int  default null,
  p_model_id       text default null,
  p_study          boolean default false,
  p_study_check_ids uuid[] default null,
  p_teacher_id     uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher   uuid;
  v_settings  grading_settings%rowtype;
  v_limit     int := least(greatest(coalesce(p_limit, 4), 1), 20);
  v_lease     interval := make_interval(mins => least(greatest(coalesce(p_lease_minutes, 15), 1), 60));
  v_billable      boolean;
  v_platform_spend bigint;
  v_cap           bigint;
  v_teacher_spend bigint;
  v_dropped   int := 0;
  v_items     jsonb;
  v_count     int;
begin
  -- ---- identity (EH-9) ----------------------------------------------------
  if p_teacher_id is not null then
    if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
      raise log 'claim refused (teacher_param_not_service) user=%', auth.uid();
      raise exception 'Claiming for another teacher requires the platform worker';
    end if;
    v_teacher := p_teacher_id;
  else
    v_teacher := auth.uid();
  end if;
  if v_teacher is null then
    raise log 'claim refused (signed_out)';
    raise exception 'Sign in before claiming grading work';
  end if;

  -- ---- provider gate (D11, W-9) -------------------------------------------
  select * into v_settings from grading_settings where teacher_id = v_teacher;
  if v_settings.teacher_id is null or v_settings.provider = 'off' then
    return jsonb_build_object('status', 'provider_off', 'items', '[]'::jsonb);
  end if;
  v_billable := (v_settings.provider = 'platform_api');

  -- ---- quota gate (D13, EH-8): LIVE aggregate, platform_api only ----------
  -- Read fresh at claim time — a nightly-lagged gate leaves up to ~24h of
  -- unmetered spend, the runaway it exists to stop. Claim is an async worker
  -- path, not a hot path, so the house counter rule is intact. The 0036-
  -- pattern rollup remains the REPORTING surface, never enforcement.
  if v_billable then
    if not exists (select 1 from grading_model_prices) then
      raise log 'claim refused (no_model_prices) teacher=%', v_teacher;
      raise exception 'platform_api claims need grading_model_prices configured';
    end if;

    -- Missing price rows count at the MAX configured price (conservative).
    with priced as (
      select s.tokens_in, s.tokens_out,
             coalesce(p.input_microdollars_per_mtok,
                      (select max(input_microdollars_per_mtok)  from grading_model_prices)) as pin,
             coalesce(p.output_microdollars_per_mtok,
                      (select max(output_microdollars_per_mtok) from grading_model_prices)) as pout,
             a.owner_id
      from check_grade_suggestions s
      join section_checks sc on sc.id = s.check_id
      join activities a on a.id = sc.activity_id
      left join grading_model_prices p on p.model_id = s.model_id
      where s.billable
        and s.created_at >= date_trunc('month', now())
    )
    select coalesce(sum((coalesce(tokens_in, 0)::bigint * pin)
                      + (coalesce(tokens_out, 0)::bigint * pout))
             filter (where owner_id = v_teacher), 0) / 1000000,
           coalesce(sum((coalesce(tokens_in, 0)::bigint * pin)
                      + (coalesce(tokens_out, 0)::bigint * pout)), 0) / 1000000
      into v_teacher_spend, v_platform_spend
      from priced;

    v_cap := coalesce((select monthly_cap_microdollars from grading_platform_budget), 0);

    if v_teacher_spend >= v_settings.quota_microdollars or v_platform_spend >= v_cap then
      raise log 'claim gated (quota_paused) teacher=% teacher_spend=% quota=% platform_spend=% cap=%',
        v_teacher, v_teacher_spend, v_settings.quota_microdollars, v_platform_spend, v_cap;
      return jsonb_build_object(
        'status',     'quota_paused',
        'items',      '[]'::jsonb,
        'resumes_at', date_trunc('month', now()) + interval '1 month');
    end if;
  end if;

  if p_study then
    -- ---- study mode (§5.2, EH-2, EH-10) -----------------------------------
    -- An explicit check-id list under the study flag: the standard pull skips
    -- graded checks, and the blind study grades exactly those. EVERY supplied
    -- id passes the same ownership predicate as the normal branch — without
    -- this the study path is any-teacher-reads-any-student by uuid (EH-2).
    -- Non-owned ids are dropped and COUNTED, never silently ignored.
    if p_study_check_ids is null or array_length(p_study_check_ids, 1) is null then
      raise exception 'Study mode needs an explicit check-id list';
    end if;

    with requested as (
      select distinct unnest(p_study_check_ids) as check_id
    ),
    authorized as (
      select sc.*
      from requested rq
      join section_checks sc on sc.id = rq.check_id
      -- can_edit_activity's own predicate for an explicit teacher (see the
      -- header's auth note): fails closed if edit is ever widened.
      join activities a on a.id = sc.activity_id
                       and a.owner_id = v_teacher
                       and a.deleted_at is null
    ),
    counted as (
      select (select count(*) from requested) -
             (select count(*) from authorized) as dropped
    ),
    picked as (
      select * from authorized
      order by created_at
      limit v_limit
    ),
    blocks as (
      select pk.id as check_id, pk.activity_id, pk.activity_version_id,
             pk.section_id, pk.attempt_number,
             (b->>'id')::uuid as block_id,
             b as block,
             pk.responses->'freeText'->>(b->>'id') as response_text
      from picked pk
      join activity_versions av on av.id = pk.activity_version_id
      cross join lateral jsonb_array_elements(coalesce(av.content->'sections', '[]'::jsonb)) s
      cross join lateral jsonb_array_elements(coalesce(s->'rows', '[]'::jsonb)) r
      cross join lateral jsonb_array_elements(coalesce(r->'columns', '[]'::jsonb)) c
      cross join lateral jsonb_array_elements(coalesce(c->'blocks', '[]'::jsonb)) b
      where s->>'id' = pk.section_id
        and b->>'type' in ('short_answer', 'essay')
        -- EH-12 applies in study mode too: nothing to grade is nothing to
        -- draft.
        and nullif(trim(coalesce(pk.responses->'freeText'->>(b->>'id'), '')), '') is not null
        -- EH-14 applies in study mode too (billable study runs would send
        -- student work to the hosted processor).
        and (not v_billable or exists (
          select 1
          from class_members cm
          join classes cl2 on cl2.id = cm.class_id
          where cl2.teacher_id = v_teacher
            and cl2.deleted_at is null
            and cm.removed_at is null
            and cm.student_id = pk.student_id
        ))
    ),
    inserted as (
      insert into check_grade_suggestions
        (check_id, block_id, source, status, source_text_hash,
         claimed_at, lease_expires_at, billable)
      select bl.check_id, bl.block_id, 'study', 'claimed',
             md5(bl.response_text), now(), now() + v_lease, v_billable
      from blocks bl
      returning id, check_id, block_id
    )
    select (select dropped from counted),
           coalesce(jsonb_agg(jsonb_build_object(
             'suggestion_id',       i.id,
             'check_id',            i.check_id,
             'block_id',            i.block_id,
             'activity_id',         bl.activity_id,
             'activity_version_id', bl.activity_version_id,
             'section_id',          bl.section_id,
             'attempt_number',      bl.attempt_number,
             'block',               bl.block,
             'response_text',       bl.response_text,
             -- Anchors are OFF for the study run (§5.2): the step-1 grades
             -- are the only confirmed grades and would leak into the "blind"
             -- numbers.
             'anchors',             '[]'::jsonb
           )), '[]'::jsonb)
      into v_dropped, v_items
      from inserted i
      join blocks bl on bl.check_id = i.check_id and bl.block_id = i.block_id;

    v_count := jsonb_array_length(v_items);
    if v_count > 0 then
      insert into audit_log (actor_id, action, target_type, target_id, metadata)
      values (auth.uid(), 'suggestion.claim', 'user', v_teacher,
              jsonb_build_object('count', v_count, 'study', true,
                                 'dropped', v_dropped));
    end if;

    return jsonb_build_object('status', 'ok', 'items', v_items,
                              'dropped', v_dropped);
  end if;

  -- ---- production: supersede / re-key sweep (EH-3) --------------------------
  -- A pending/claimed draft whose check is no longer the latest for its
  -- (student, version, section):
  --   * latest TEXT identical → re-key the row to the latest check (the draft
  --     is still true; re-inferring it is the cost EH-3 exists to stop);
  --   * latest TEXT changed  → stamp superseded.
  -- Both run on the CLAIM path only — the student submit path never touches
  -- this table (§3's lazy ruling).
  with latest as (
    select distinct on (sc.student_id, sc.activity_version_id, sc.section_id) sc.*
    from section_checks sc
    join activities a on a.id = sc.activity_id
                     and a.owner_id = v_teacher
                     and a.deleted_at is null
    order by sc.student_id, sc.activity_version_id, sc.section_id,
             sc.attempt_number desc, sc.created_at desc
  ),
  displaced as (
    select s.id as suggestion_id, s.block_id, s.source_text_hash,
           l.id as latest_check_id,
           l.responses->'freeText'->>s.block_id::text as latest_text,
           -- When SEVERAL displaced drafts target one latest slot (reachable
           -- across multiple re-check generations), only the newest may
           -- re-key — a second would trip the production unique and abort
           -- the whole claim. The rest supersede below.
           row_number() over (
             partition by l.id, s.block_id
             order by s.created_at desc, s.id desc
           ) as rn
    from check_grade_suggestions s
    join section_checks sc on sc.id = s.check_id
    join latest l on l.student_id = sc.student_id
                 and l.activity_version_id = sc.activity_version_id
                 and l.section_id = sc.section_id
                 and l.id <> sc.id
    where s.source = 'production'
      and s.status in ('claimed', 'pending')
  ),
  rekeyed as (
    update check_grade_suggestions s
       set check_id  = d.latest_check_id,
           updated_at = now()
      from displaced d
     where s.id = d.suggestion_id
       and d.rn = 1
       and md5(coalesce(d.latest_text, '')) = d.source_text_hash
       and not exists (
         select 1 from check_grade_suggestions x
          where x.check_id = d.latest_check_id
            and x.block_id = d.block_id
            and x.source = 'production'
       )
    returning s.id
  )
  update check_grade_suggestions s
     set status     = 'superseded',
         updated_at = now()
    from displaced d
   where s.id = d.suggestion_id
     and s.id not in (select id from rekeyed);

  -- ---- production: pick, lock, claim ---------------------------------------
  -- Claimable block = rubric block in the check's section, with a NONBLANK
  -- response (EH-12: 0034 D13 rules empty rows need the teacher's fullest
  -- attention — a pre-fill invites confirm-and-move-on, so they stay plain
  -- manual rows), no grade yet (EH-5's grade-exists exclusion), and either no
  -- production suggestion, an EXPIRED claimed one, or a pending one whose
  -- (prompt_rev, schema_rev, model_id) differs from this worker's tuple (the
  -- §3 rev-bump re-draft — only when the caller supplied its full tuple).
  with latest as (
    select distinct on (sc.student_id, sc.activity_version_id, sc.section_id) sc.*
    from section_checks sc
    join activities a on a.id = sc.activity_id
                     and a.owner_id = v_teacher
                     and a.deleted_at is null
    order by sc.student_id, sc.activity_version_id, sc.section_id,
             sc.attempt_number desc, sc.created_at desc
  ),
  claimable as (
    select l.id as check_id, l.activity_id, l.activity_version_id,
           l.section_id, l.attempt_number, l.created_at,
           (b->>'id')::uuid as block_id,
           b as block,
           l.responses->'freeText'->>(b->>'id') as response_text,
           s.id as existing_id
    from latest l
    join activity_versions av on av.id = l.activity_version_id
    cross join lateral jsonb_array_elements(coalesce(av.content->'sections', '[]'::jsonb)) sec
    cross join lateral jsonb_array_elements(coalesce(sec->'rows', '[]'::jsonb)) r
    cross join lateral jsonb_array_elements(coalesce(r->'columns', '[]'::jsonb)) c
    cross join lateral jsonb_array_elements(coalesce(c->'blocks', '[]'::jsonb)) b
    left join check_grade_suggestions s
           on s.check_id = l.id
          and s.block_id = (b->>'id')::uuid
          and s.source = 'production'
    where sec->>'id' = l.section_id
      and b->>'type' in ('short_answer', 'essay')
      and nullif(trim(coalesce(l.responses->'freeText'->>(b->>'id'), '')), '') is not null
      and not exists (
        select 1 from check_grades cg
         where cg.check_id = l.id and cg.block_id = (b->>'id')::uuid
      )
      -- EH-14: under platform_api the claim excludes NON-ROSTER students —
      -- link-share discovery (0030 OV-9) puts strangers' checks in a
      -- teacher's queue, 0034 §F already withholds their identity, and the
      -- teacher's opt-in cannot carry consent to send THEIR work to a
      -- third-party processor. Mirrors §F's roster CTE. Local processing
      -- inherits the teacher-can-already-read-it posture and is unaffected.
      and (not v_billable or exists (
        select 1
        from class_members cm
        join classes cl2 on cl2.id = cm.class_id
        where cl2.teacher_id = v_teacher
          and cl2.deleted_at is null
          and cm.removed_at is null
          and cm.student_id = l.student_id
      ))
      and (
        s.id is null
        or (s.status = 'claimed' and s.lease_expires_at <= now())
        or (s.status = 'pending'
            and p_prompt_rev is not null
            and p_schema_rev is not null
            and p_model_id is not null
            and (s.prompt_rev, s.schema_rev, s.model_id)
                  is distinct from (p_prompt_rev, p_schema_rev, p_model_id))
      )
  ),
  -- The claim unit is the CHECK (EH-4). Locking the candidate check rows FOR
  -- UPDATE SKIP LOCKED serializes concurrent claimers (the D11 many-workers
  -- future); the partial unique on production rows is the backstop.
  picked_checks as (
    select sc.id
    from section_checks sc
    where sc.id in (select distinct check_id from claimable)
    order by sc.created_at
    for update skip locked
    limit v_limit
  ),
  fresh as (
    insert into check_grade_suggestions
      (check_id, block_id, source, status, source_text_hash,
       claimed_at, lease_expires_at, billable)
    select cl.check_id, cl.block_id, 'production', 'claimed',
           md5(cl.response_text), now(), now() + v_lease, v_billable
    from claimable cl
    join picked_checks pc on pc.id = cl.check_id
    where cl.existing_id is null
    on conflict (check_id, block_id) where source = 'production' do nothing
    returning id, check_id, block_id
  ),
  reclaimed as (
    update check_grade_suggestions s
       set status           = 'claimed',
           claimed_at       = now(),
           lease_expires_at = now() + v_lease,
           source_text_hash = md5(cl.response_text),
           -- STICKY once true: a hosted inference already spent money, and a
           -- later local re-claim of the same pending row must not erase that
           -- spend from the quota aggregate. The conservative cost: a local
           -- re-submit of a once-billable row prices at the fallback rate —
           -- overcounting protects the budget, undercounting defeats it
           -- (D13 is budget protection, not billing arithmetic).
           billable         = s.billable or v_billable,
           updated_at       = now()
      from claimable cl
      join picked_checks pc on pc.id = cl.check_id
     where s.id = cl.existing_id
    returning s.id, s.check_id, s.block_id
  ),
  claimed_now as (
    select id, check_id, block_id from fresh
    union all
    select id, check_id, block_id from reclaimed
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'suggestion_id',       cn.id,
           'check_id',            cn.check_id,
           'block_id',            cn.block_id,
           'activity_id',         cl.activity_id,
           'activity_version_id', cl.activity_version_id,
           'section_id',          cl.section_id,
           'attempt_number',      cl.attempt_number,
           'block',               cl.block,
           'response_text',       cl.response_text,
           -- Anchor exemplars (E1): up to two teacher-confirmed grades for
           -- the same (block, version), latest first, with their response
           -- texts. The selector UNCONDITIONALLY excludes the check being
           -- graded — in production a graded check is never claimed, but the
           -- rule is unconditional so no path can leak (§4).
           'anchors', coalesce((
             select jsonb_agg(anchor.a)
             from (
               select jsonb_build_object(
                        'criteria',         cg.criteria,
                        'general_feedback', cg.general_feedback,
                        'response_text',    asc2.responses->'freeText'->>cl.block_id::text
                      ) as a
               from check_grades cg
               join section_checks asc2 on asc2.id = cg.check_id
               where asc2.activity_version_id = cl.activity_version_id
                 and cg.block_id = cl.block_id
                 and cg.check_id <> cn.check_id
               order by cg.graded_at desc
               limit 2
             ) anchor
           ), '[]'::jsonb)
         )), '[]'::jsonb)
    into v_items
    from claimed_now cn
    join claimable cl on cl.check_id = cn.check_id and cl.block_id = cn.block_id;

  v_count := jsonb_array_length(v_items);
  if v_count > 0 then
    insert into audit_log (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'suggestion.claim', 'user', v_teacher,
            jsonb_build_object('count', v_count, 'study', false));
  end if;

  return jsonb_build_object('status', 'ok', 'items', v_items);
end;
$$;

-- -----------------------------------------------------------------------------
-- I. submit_grade_suggestion — the worker write (W-2/W-4; EH-6/11)
-- -----------------------------------------------------------------------------
-- Validates at the door (a suggestion that fails validation is rejected, not
-- stored broken — the transaction aborts and the row stays 'claimed' for the
-- worker's log-and-skip taxonomy, W-4). Distinct refusals the worker matches
-- on: 'lease_expired', plus the §F messages shared verbatim with the grade
-- write (the EH-6 parity contract).
--
-- 'high' confidence must score EVERY rubric criterion exactly once: a partial
-- pre-fill is a bad state the queue UI has no rendering for. 'low' rows are
-- never pre-filled (D6), so partial criteria are acceptable telemetry there.
create or replace function submit_grade_suggestion(
  p_suggestion_id          uuid,
  p_machine_confidence     text,
  p_model_id               text,
  p_prompt_rev             int,
  p_schema_rev             int,
  p_criteria               jsonb default '[]'::jsonb,
  p_general_feedback_draft text  default null,
  p_misconceptions         jsonb default '[]'::jsonb,
  p_tokens_in              int   default null,
  p_tokens_out             int   default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row      check_grade_suggestions%rowtype;
  v_check    section_checks%rowtype;
  v_service  boolean := coalesce(auth.jwt()->>'role', '') = 'service_role';
  v_norm     jsonb;
  v_mis      jsonb := '[]'::jsonb;
  v_item     jsonb;
  v_distinct int;
begin
  if auth.uid() is null and not v_service then
    raise log 'suggestion submit refused (signed_out)';
    raise exception 'Sign in before submitting suggestions';
  end if;

  select * into v_row from check_grade_suggestions
   where id = p_suggestion_id for update;
  if v_row.id is null then
    raise log 'suggestion submit refused (no_row) user=% id=%', auth.uid(), p_suggestion_id;
    raise exception 'No such suggestion';
  end if;

  select * into v_check from section_checks where id = v_row.check_id;

  -- EH-1: the edit relationship, never read. The service worker (EH-9) is
  -- authorized by role — it only ever holds suggestion ids it claimed.
  if not v_service and not can_edit_activity(v_check.activity_id) then
    raise log 'suggestion submit refused (not_owner) user=% activity=%',
      auth.uid(), v_check.activity_id;
    raise exception 'Not your activity';
  end if;

  -- Lease (W-3/EH-4): an expired or stolen lease is a named, non-silent skip.
  if v_row.status <> 'claimed' or v_row.lease_expires_at <= now() then
    raise log 'suggestion submit refused (lease_expired) id=% status=% expired=%',
      p_suggestion_id, v_row.status, v_row.lease_expires_at <= now();
    raise exception 'lease_expired';
  end if;

  if p_machine_confidence not in ('high', 'low') then
    raise exception 'machine_confidence must be high or low';
  end if;

  -- Rev stamps are mandatory: a rev that exists only in a running process is
  -- not a rev (§3).
  if p_model_id is null or trim(p_model_id) = ''
     or p_prompt_rev is null or p_schema_rev is null then
    raise log 'suggestion submit refused (missing_rev) id=%', p_suggestion_id;
    raise exception 'Every suggestion must carry model_id, prompt_rev and schema_rev';
  end if;

  -- Criteria through the SHARED validator (EH-6) — server-copied maxPoints,
  -- same refusal matrix as the grade write.
  v_norm := validate_check_grade_criteria(v_row.check_id, v_row.block_id, p_criteria);

  if p_machine_confidence = 'high' then
    select count(distinct c->>'criterionId')
      into v_distinct
      from jsonb_array_elements(v_norm->'criteria') c;
    if v_distinct <> (v_norm->>'rubric_count')::int
       or jsonb_array_length(v_norm->'criteria') <> (v_norm->>'rubric_count')::int then
      raise log 'suggestion submit refused (partial_high_confidence) id=% got=% want=%',
        p_suggestion_id, v_distinct, v_norm->>'rubric_count';
      raise exception 'A high-confidence draft must score every criterion exactly once';
    end if;
  end if;

  -- Misconceptions: ids validated against the registry — never invented
  -- (EH-7 makes §3's contract real). Evidence is a bounded excerpt; it is
  -- rendered as TEXT, never HTML.
  for v_item in select * from jsonb_array_elements(coalesce(p_misconceptions, '[]'::jsonb))
  loop
    if not exists (select 1 from misconception_registry mr
                    where mr.id = v_item->>'misId') then
      raise log 'suggestion submit refused (unknown_misconception=%) id=%',
        v_item->>'misId', p_suggestion_id;
      raise exception 'That misconception id is not in the registry';
    end if;
    v_mis := v_mis || jsonb_build_array(jsonb_build_object(
      'misId',    v_item->>'misId',
      'evidence', left(nullif(trim(coalesce(v_item->>'evidence', '')), ''), 500)
    ));
  end loop;

  update check_grade_suggestions
     set status                 = 'pending',
         criteria               = v_norm->'criteria',
         general_feedback_draft = nullif(trim(coalesce(p_general_feedback_draft, '')), ''),
         misconception_notes    = v_mis,
         machine_confidence     = p_machine_confidence,
         model_id               = p_model_id,
         prompt_rev             = p_prompt_rev,
         schema_rev             = p_schema_rev,
         tokens_in              = p_tokens_in,
         tokens_out             = p_tokens_out,
         submitted_at           = now(),
         updated_at             = now()
   where id = p_suggestion_id;

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'suggestion.submit', 'activity', v_check.activity_id,
          jsonb_build_object('suggestion_id', p_suggestion_id,
                             'check_id', v_row.check_id,
                             'block_id', v_row.block_id,
                             'model_id', p_model_id,
                             'prompt_rev', p_prompt_rev,
                             'schema_rev', p_schema_rev,
                             'confidence', p_machine_confidence,
                             'study', v_row.source = 'study'));

  return jsonb_build_object('id', p_suggestion_id, 'status', 'pending');
end;
$$;

-- -----------------------------------------------------------------------------
-- J. confirm / reject — the teacher resolution, ONE transaction (EH-5)
-- -----------------------------------------------------------------------------
-- Confirm = the existing Save (DR-3): the UI's save path calls THIS instead
-- of upsert_check_grade directly whenever it pre-filled from a draft, passing
-- the suggestion id + the updated_at rev it read. One DEFINER body writes the
-- grade (via upsert_check_grade — same validation, same audit, teacher uuid)
-- and the suggestion status atomically, computing the DR-2 edit diff
-- SERVER-side against the stored draft — this function is the measurement
-- instrument the whole D7 gate reads, so a draft that moved under the teacher
-- is rejected ('suggestion_changed'), never silently mis-attributed.
create or replace function confirm_grade_suggestion(
  p_suggestion_id       uuid,
  p_expected_updated_at timestamptz,
  p_criteria            jsonb,
  p_general_feedback    text,
  p_struck_mis          jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row     check_grade_suggestions%rowtype;
  v_check   section_checks%rowtype;
  v_grade   jsonb;
  v_edited  boolean := false;
  v_item    jsonb;
  v_sug     jsonb;
  v_status  suggestion_status;
begin
  if auth.uid() is null then
    raise exception 'Sign in before grading';
  end if;

  select * into v_row from check_grade_suggestions
   where id = p_suggestion_id for update;
  if v_row.id is null then
    raise exception 'No such suggestion';
  end if;

  select * into v_check from section_checks where id = v_row.check_id;
  if not can_edit_activity(v_check.activity_id) then
    raise log 'suggestion confirm refused (not_owner) user=% activity=%',
      auth.uid(), v_check.activity_id;
    raise exception 'Not your activity';
  end if;

  -- Study rows are never teacher-actioned (EH-10): they exist for the blind
  -- study's numbers, not the queue.
  if v_row.source = 'study' then
    raise exception 'Study rows are never confirmed';
  end if;

  if v_row.status <> 'pending' then
    raise log 'suggestion confirm refused (status=%) id=%', v_row.status, p_suggestion_id;
    raise exception 'Only a pending draft can be confirmed';
  end if;

  -- EH-5: optimistic rev — the draft the teacher read must be the draft that
  -- is resolved.
  if v_row.updated_at is distinct from p_expected_updated_at then
    raise log 'suggestion confirm refused (suggestion_changed) id=%', p_suggestion_id;
    raise exception 'suggestion_changed';
  end if;

  -- Chip strikes may only strike what the draft actually observed (DR-4).
  for v_item in select * from jsonb_array_elements(coalesce(p_struck_mis, '[]'::jsonb))
  loop
    if not exists (
      select 1 from jsonb_array_elements(v_row.misconception_notes) n
       where n->>'misId' = (v_item #>> '{}')
    ) then
      raise exception 'Cannot strike a misconception the draft did not observe';
    end if;
  end loop;

  -- The grade write: the EXISTING audited path, under the teacher's uuid
  -- (D2/D9 — attribution is the teacher's, structurally).
  v_grade := upsert_check_grade(v_row.check_id, v_row.block_id,
                                p_criteria, p_general_feedback);

  -- DR-2, computed server-side (EH-5): edited when any earned value differs,
  -- any feedback text differs whitespace-insensitively, or any chip was
  -- struck; otherwise confirmed-unchanged. One definition — every edit-rate
  -- number in D7 sits on it.
  if jsonb_array_length(coalesce(p_struck_mis, '[]'::jsonb)) > 0 then
    v_edited := true;
  end if;

  if not v_edited then
    select v_grade->'criteria' is distinct from v_row.criteria
       and exists (
         select 1
         from jsonb_array_elements(v_grade->'criteria') g
         full outer join jsonb_array_elements(v_row.criteria) s
           on g->>'criterionId' = s->>'criterionId'
         where g->>'criterionId' is null
            or s->>'criterionId' is null
            or (g->>'earned')::numeric is distinct from (s->>'earned')::numeric
            or regexp_replace(trim(coalesce(g->>'feedback', '')), '\s+', ' ', 'g')
                 is distinct from
               regexp_replace(trim(coalesce(s->>'feedback', '')), '\s+', ' ', 'g')
       )
      into v_edited;
    v_edited := coalesce(v_edited, false);
  end if;

  if not v_edited then
    v_edited := regexp_replace(trim(coalesce(p_general_feedback, '')), '\s+', ' ', 'g')
                  is distinct from
                regexp_replace(trim(coalesce(v_row.general_feedback_draft, '')), '\s+', ' ', 'g');
  end if;

  v_status := case when v_edited then 'edited' else 'confirmed' end;

  update check_grade_suggestions
     set status      = v_status,
         struck_mis  = coalesce(p_struck_mis, '[]'::jsonb),
         resolved_at = now(),
         updated_at  = now()
   where id = p_suggestion_id;

  return jsonb_build_object('status', v_status, 'grade', v_grade);
end;
$$;

-- Reject (DR-8): clears nothing in the database — the draft stays for
-- telemetry — but the row leaves the pre-fill surface and the UI renders a
-- plain manual rubric. The optional one-tap reason is per-rev telemetry.
create or replace function reject_grade_suggestion(
  p_suggestion_id       uuid,
  p_expected_updated_at timestamptz,
  p_reason              text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row   check_grade_suggestions%rowtype;
  v_check section_checks%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Sign in before grading';
  end if;

  select * into v_row from check_grade_suggestions
   where id = p_suggestion_id for update;
  if v_row.id is null then
    raise exception 'No such suggestion';
  end if;

  select * into v_check from section_checks where id = v_row.check_id;
  if not can_edit_activity(v_check.activity_id) then
    raise log 'suggestion reject refused (not_owner) user=% activity=%',
      auth.uid(), v_check.activity_id;
    raise exception 'Not your activity';
  end if;

  if v_row.source = 'study' then
    raise exception 'Study rows are never confirmed';
  end if;

  if v_row.status <> 'pending' then
    raise exception 'Only a pending draft can be rejected';
  end if;

  if v_row.updated_at is distinct from p_expected_updated_at then
    raise exception 'suggestion_changed';
  end if;

  if p_reason is not null
     and p_reason not in ('wrong_points', 'wrong_feedback', 'wrong_misconception') then
    raise exception 'Unknown reject reason';
  end if;

  update check_grade_suggestions
     set status        = 'rejected',
         reject_reason = p_reason,
         resolved_at   = now(),
         updated_at    = now()
   where id = p_suggestion_id;

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'suggestion.reject', 'activity', v_check.activity_id,
          jsonb_build_object('suggestion_id', p_suggestion_id,
                             'check_id', v_row.check_id,
                             'block_id', v_row.block_id,
                             'reason', p_reason,
                             'model_id', v_row.model_id,
                             'prompt_rev', v_row.prompt_rev,
                             'schema_rev', v_row.schema_rev));

  return jsonb_build_object('id', p_suggestion_id, 'status', 'rejected');
end;
$$;

-- -----------------------------------------------------------------------------
-- K. list_grade_suggestions — the queue's sibling read (DR-6/DR-10, EH-13)
-- -----------------------------------------------------------------------------
-- A SIBLING of list_grading_queue rather than a v2 — deliberately: changing
-- that function's signature walks straight into 0040's recorded hazard
-- (CREATE OR REPLACE on a new signature mints a second function with EXECUTE
-- to PUBLIC), and the queue is the surface's hot read. The UI joins
-- client-side on (check_id, block_id).
--
-- Gate matches its sibling (§F gates on can_read_activity): this is the same
-- audience reading the same queue — a party who may see the grades may see
-- the drafts. The worker-facing write surface stays edit-gated (EH-1).
--
-- Visibility encodes the DR-6 state table:
--   * claimed + live lease  → "draft pending"
--   * pending               → the pre-fill (or the D6 abstain badge when
--                             machine_confidence = 'low')
--   * confirmed/edited/rejected → DR-10's provenance trail
--   * claimed-expired, superseded, and ALL study rows → invisible (a
--     never-attempted or worker-off row is a plain manual row; study rows
--     are the blind study's, not the queue's).
-- Lazy supersession, read side: joining through the LATEST check per
-- (student, version, section) is what makes a draft on an outdated check
-- disappear without any student-path write.
create or replace function list_grade_suggestions(p_activity_id uuid)
returns table (
  suggestion_id          uuid,
  check_id               uuid,
  block_id               uuid,
  status                 suggestion_status,
  machine_confidence     text,
  criteria               jsonb,
  general_feedback_draft text,
  misconception_notes    jsonb,
  struck_mis             jsonb,
  model_id               text,
  prompt_rev             int,
  schema_rev             int,
  claimed_at             timestamptz,
  lease_expires_at       timestamptz,
  submitted_at           timestamptz,
  resolved_at            timestamptz,
  reject_reason          text,
  updated_at             timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in before grading';
  end if;
  if not can_read_activity(p_activity_id) then
    raise log 'suggestion list refused (not_owner) user=% activity=%',
      auth.uid(), p_activity_id;
    raise exception 'Not your activity';
  end if;

  return query
  with latest as (
    select distinct on (sc.student_id, sc.activity_version_id, sc.section_id) sc.id
    from section_checks sc
    where sc.activity_id = p_activity_id
    order by sc.student_id, sc.activity_version_id, sc.section_id,
             sc.attempt_number desc, sc.created_at desc
  )
  select s.id, s.check_id, s.block_id, s.status, s.machine_confidence,
         s.criteria, s.general_feedback_draft, s.misconception_notes,
         s.struck_mis, s.model_id, s.prompt_rev, s.schema_rev,
         s.claimed_at, s.lease_expires_at, s.submitted_at, s.resolved_at,
         s.reject_reason, s.updated_at
  from check_grade_suggestions s
  join latest l on l.id = s.check_id
  where s.source = 'production'
    and (
      (s.status = 'claimed' and s.lease_expires_at > now())
      or s.status in ('pending', 'confirmed', 'edited', 'rejected')
    );
end;
$$;

-- -----------------------------------------------------------------------------
-- L. Grants — 0009's standing rule
-- -----------------------------------------------------------------------------
-- Every new function gets its explicit stanza. The worker RPCs and teacher
-- resolutions are signed-in surfaces: authenticated + service_role (the
-- latter is EH-9's platform-worker seam), never anon. The shared validator is
-- NOT client-callable at all — it runs only inside the DEFINER bodies above.
revoke execute on function validate_check_grade_criteria(uuid, uuid, jsonb) from public, anon, authenticated;
grant  execute on function validate_check_grade_criteria(uuid, uuid, jsonb) to service_role;

revoke execute on function claim_grade_suggestions(int, int, int, int, text, boolean, uuid[], uuid) from public, anon;
grant  execute on function claim_grade_suggestions(int, int, int, int, text, boolean, uuid[], uuid) to authenticated, service_role;

revoke execute on function submit_grade_suggestion(uuid, text, text, int, int, jsonb, text, jsonb, int, int) from public, anon;
grant  execute on function submit_grade_suggestion(uuid, text, text, int, int, jsonb, text, jsonb, int, int) to authenticated, service_role;

revoke execute on function confirm_grade_suggestion(uuid, timestamptz, jsonb, text, jsonb) from public, anon;
grant  execute on function confirm_grade_suggestion(uuid, timestamptz, jsonb, text, jsonb) to authenticated, service_role;

revoke execute on function reject_grade_suggestion(uuid, timestamptz, text) from public, anon;
grant  execute on function reject_grade_suggestion(uuid, timestamptz, text) to authenticated, service_role;

revoke execute on function list_grade_suggestions(uuid) from public, anon;
grant  execute on function list_grade_suggestions(uuid) to authenticated, service_role;

-- upsert_check_grade keeps its 0034 §I stanza (same signature; grants
-- survive CREATE OR REPLACE). Restated defensively anyway — a replay after a
-- future drop-first must not depend on ordering luck.
revoke execute on function upsert_check_grade(uuid, uuid, jsonb, text) from public, anon;
grant  execute on function upsert_check_grade(uuid, uuid, jsonb, text) to authenticated, service_role;

-- Tables: no client grants anywhere except the registry's read (its policy
-- §C is the gate; the grant is what lets the policy matter). 0032's lesson:
-- migration-created tables do not inherit dashboard default grants, and these
-- must not gain them.
revoke all on table check_grade_suggestions from anon, authenticated;
revoke all on table grading_settings        from anon, authenticated;
revoke all on table grading_platform_budget from anon, authenticated;
revoke all on table grading_model_prices    from anon, authenticated;
revoke all on table misconception_registry  from anon, authenticated;
grant  select on table misconception_registry to authenticated, service_role;

-- =============================================================================
-- Verification lives in scripts/verify-0042.sql (registered in the verify
-- runner): catalog posture, the shared-validator parity matrix, the claim /
-- submit / confirm / reject state machine, lease + re-key + supersession, the
-- provider and quota gates (including the service_role identity branch and
-- the local-bypass leg), and the retention cascade.
-- =============================================================================
