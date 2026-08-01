-- =============================================================================
-- 0020_section_checks.sql — the grading slice's database surface (S4)
-- -----------------------------------------------------------------------------
-- Lane A's second slice (T5). Full rulings: the "S4 eng review" section of
-- ~/.gstack/.../user-main-design-20260728-components-as-data.md. Three pieces:
--
--   1. section_checks — the durable record of every section check. NOT the
--      submissions table (ruling S4-3): submissions belongs to the anonymous
--      link-share world that S9 demolishes, and moving the new world into it
--      first would turn that demolition into surgery. A check row carries the
--      student's responses AND the verdicts they were shown (including the
--      feedback text — S4-B4), so a teacher reviewing a check can see what the
--      student was actually told, not just whether it was marked right.
--
--   2. get_activity_version_for_check — the AUTHORIZATION CHAIN (ruling S4-B1).
--      Runs as the CALLER, so the DB enforces the access rule. Proves three
--      things before the Edge Function touches a document: the caller is
--      authenticated, the activity is published + not deleted, and the
--      requested version BELONGS to that activity. Returns metadata ONLY —
--      never content (see the leak note on that function).
--
--   3. record_check — the write path. SERVICE-ROLE ONLY, deliberately: it
--      accepts verdicts as an argument, so a student who could call it
--      directly would be able to write themselves a row of 'correct'. The
--      Edge Function computes verdicts and is the only caller. Carries the
--      per-student rate ceiling (ruling S4-5), idempotent replay (S4-B2), and
--      attempt derivation with the 0005 race backstop (S4-B4).
--
-- No audit_log row per check, on purpose. Checks are FORMATIVE and high volume
-- (parity ruling 7.1A: re-checking is allowed and re-scores everything), so a
-- per-check audit write would be hot-path bloat; section_checks IS the record.
-- Same reasoning 0017 used to keep reads out of audit_log.
--
-- NOT in this migration (ruling S4-3b, cross-model tension T2): the grades
-- table is NOT widened here. Binding teacher grading to checks — grades.check_id
-- vs a checks-native grading table, and the attempts-vs-latest-response
-- question underneath it — lands with the teacher-grading UI that answers it.
-- Writing unique(check_id, block_id) now would freeze that decision blind.
-- Free text is still CAPTURED below (responses jsonb), so nothing is lost.
-- See TODOS.md → "Teacher grading bound to section_checks".
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. section_checks
-- -----------------------------------------------------------------------------
-- Version pinning is load-bearing, not bookkeeping (ruling S4-2): publishing
-- mints fresh block UUIDs for the whole document, so a check's item ids are
-- meaningful ONLY against the version that produced them. on delete restrict
-- mirrors submissions.activity_version_id for the same reason — dropping a
-- version out from under its checks would orphan every id in them.
--
--   student_id ─► users(id)              cascade: purge deletes the work too
--   activity_id ─► activities(id)        cascade: same
--   activity_version_id ─► versions(id)  RESTRICT: ids are only valid here
--
-- section_id is TEXT, not a FK: sections live inside the document jsonb, not
-- as rows. It is validated against the served document by the Edge Function.
create table section_checks (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references users(id) on delete cascade,
  activity_id         uuid not null references activities(id) on delete cascade,
  activity_version_id uuid not null references activity_versions(id) on delete restrict,
  section_id          text not null,
  attempt_number      integer not null,

  -- The check wire's SectionResponses, verbatim (item-id-keyed parallel maps).
  responses           jsonb not null,
  -- The check wire's CheckItemResult map, INCLUDING the feedback shown to the
  -- student (S4-B4). Solutions are not stored: they are authored content that
  -- already lives in the version, and re-storing them per check would duplicate
  -- the document into every row.
  verdicts            jsonb not null,

  -- Client-generated idempotency key (S4-B2). A retry after a slow cold start
  -- (3-4 s measured) replays this row instead of minting a second attempt.
  -- Nullable: a client that omits it simply gets no replay protection.
  idempotency_key     text,

  created_at          timestamptz not null default now()
);

-- Attempt scope = (student, VERSION, section) — ruling S4-B4. Scoping to the
-- version rather than the activity means a republish naturally restarts
-- numbering, which is the honest reading: the new version is a different
-- worksheet with different block ids, so "attempt 3" against the old one has
-- no continuation. Unique because it is also the 0005-style race backstop:
-- concurrent checks that compute the same max+1 collide here and retry.
create unique index section_checks_attempt_idx
  on section_checks (student_id, activity_version_id, section_id, attempt_number);

-- Idempotency (S4-B2). Partial: rows without a key never collide with each
-- other. Scoped to the student so one client's key cannot shadow another's.
create unique index section_checks_idempotency_idx
  on section_checks (student_id, idempotency_key)
  where idempotency_key is not null;

-- Rate-ceiling source (ruling S4-5): a trailing-window count per student.
create index section_checks_rate_idx
  on section_checks (student_id, created_at desc);

-- Teacher-side reads (the future grading dashboard) and the student's own
-- history, both filtered by activity.
create index section_checks_activity_idx
  on section_checks (activity_id, student_id, created_at desc);

alter table section_checks enable row level security;
alter table section_checks force row level security;

-- Read: a student reads their own checks. Not used by the viewer today (check
-- results come back in the RPC response), but it is the correct posture and
-- the future "your work" surface needs it.
create policy section_checks_select_student on section_checks
  for select using (student_id = (select auth.uid()));

-- Read: the activity's teacher reads checks on it. Calls the helper rather
-- than inlining the ownership check (CLAUDE.md standing rule) so a future
-- co-teacher/collaborator path is inherited automatically.
create policy section_checks_select_teacher on section_checks
  for select using (can_read_activity(activity_id));

-- NO insert/update/delete policies, deliberately. Writes go through
-- record_check (service-role only) — the same shape as the image bucket's
-- single-INSERT-policy design: the absence of a policy IS the control. A
-- student cannot author their own verdicts, and nobody can rewrite history.

-- -----------------------------------------------------------------------------
-- 2. get_activity_version_for_check — the authorization chain (ruling S4-B1)
-- -----------------------------------------------------------------------------
-- ⚠ THIS FUNCTION MUST NEVER RETURN DOCUMENT CONTENT. It is callable by every
-- authenticated user, and activity_versions.content is the RAW document —
-- answer keys included. The raw document is read by the Edge Function with the
-- SERVICE-ROLE client, only after this function has proven the caller may
-- check this activity. Returning content here would hand every student the
-- answer key the entire S2 sanitizer exists to withhold.
--
-- The parentage check is the point. Without it, an empty-responses request
-- carrying a foreign versionId would pass every other validation (the
-- "ids ⊆ section" check is vacuously true when there are no ids) and the
-- handler would happily return that version's whole solution set.
--
-- is_current drives the stale-version advisory (ruling S4-T5): the student
-- keeps working and checking against the version they were served, and the
-- client offers a non-destructive "your teacher updated this" banner.
create function get_activity_version_for_check(
  p_activity_id uuid,
  p_version_id  uuid
)
returns table (
  version_id         uuid,
  version_num        integer,
  is_current         boolean,
  current_version_id uuid
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- Belt-and-suspenders: EXECUTE is revoked from anon below, so an anonymous
  -- caller is refused before this runs. Guards a future grant mistake.
  if auth.uid() is null then
    raise exception 'Not authorized';
  end if;

  return query
  select v.id, v.version_num, (v.id = a.current_version_id), a.current_version_id
  from activities a
  join activity_versions v
    on v.activity_id = a.id          -- ◄── the parentage check
  where a.id = p_activity_id
    and v.id = p_version_id
    and a.deleted_at is null
    and a.status = 'published';

  if not found then
    -- ONE message for missing / unpublished / deleted / wrong-parent. An
    -- authenticated stranger learns nothing about which it was — same
    -- no-oracle discipline as get_published_activity (0017).
    raise exception 'Not available';
  end if;
end;
$$;

revoke execute on function get_activity_version_for_check(uuid, uuid) from public, anon;
grant execute on function get_activity_version_for_check(uuid, uuid)
  to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 3. record_check — the write path (service-role only)
-- -----------------------------------------------------------------------------
-- Order of operations matters and is deliberate:
--
--   idempotent replay ──► rate ceiling ──► attempt derivation ──► insert
--        │                     │                  │                  │
--        │                     │                  │                  └─ unique
--        │                     │                  │                     index
--        │                     │                  └─ max+1 in a retry     catches
--        │                     │                     loop (0005 pattern)  the race
--        │                     └─ trailing-window count per STUDENT.
--        │                        NOT the per-isolate limiter: that one is
--        │                        measured nearly inert (isolate recycling)
--        │                        and per-IP is wrong here anyway — a
--        │                        classroom is one NAT. See
--        │                        get-activity-handler.ts:140.
--        └─ FIRST, and deliberately BEFORE the rate check: a replay is a retry
--           of an already-accepted request. Rate-limiting it would punish a
--           student for our own slow cold start.
--
-- p_rate_limit / p_rate_window_seconds are parameters, not constants, so the
-- ceiling can be tuned from the Edge Function (and pinned per-test) without a
-- migration. The default is deliberately generous: a human re-checking their
-- work cannot approach it, so a 429 means a script.
create function record_check(
  p_student_id          uuid,
  p_activity_id         uuid,
  p_activity_version_id uuid,
  p_section_id          text,
  p_responses           jsonb,
  p_verdicts            jsonb,
  p_idempotency_key     text default null,
  p_rate_limit          integer default 60,
  p_rate_window_seconds integer default 60
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
begin
  -- 0. Idempotent replay (S4-B2). Returns the ORIGINAL verdicts so a retried
  --    request produces a byte-identical response to the one that was lost.
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
        'replayed',       true
      );
    end if;
  end if;

  -- 1. Rate ceiling (S4-5). Enforced HERE rather than in the Edge Function
  --    because this is durable per-student state: it survives isolate
  --    recycling, which is exactly what the read path's limiter does not.
  select count(*) into v_recent
  from section_checks
  where student_id = p_student_id
    and created_at > now() - make_interval(secs => p_rate_window_seconds);

  if v_recent >= p_rate_limit then
    -- Distinguishable by the handler (mapped to 429), not a generic failure.
    raise exception 'rate_limited'
      using errcode = 'P0001', hint = 'check rate ceiling reached';
  end if;

  -- 2 + 3. Attempt derivation and insert, in the 0005 retry loop. The unique
  --        index turns the SELECT-max → INSERT race into a unique_violation we
  --        recompute on, rather than two students' tabs both claiming attempt 3.
  loop
    select coalesce(max(attempt_number), 0) + 1
      into v_attempt_number
      from section_checks
      where student_id = p_student_id
        and activity_version_id = p_activity_version_id
        and section_id = p_section_id;

    begin
      insert into section_checks (
        student_id, activity_id, activity_version_id, section_id,
        attempt_number, responses, verdicts, idempotency_key
      )
      values (
        p_student_id, p_activity_id, p_activity_version_id, p_section_id,
        v_attempt_number, p_responses, p_verdicts, p_idempotency_key
      )
      returning id into v_check_id;

      exit;  -- success
    exception
      when unique_violation then
        -- Two shapes reach here. The attempt index means a concurrent check
        -- took our number: recompute. The idempotency index means a concurrent
        -- request with the SAME key won the race: replay its row rather than
        -- failing the student's retry.
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
              'replayed',       true
            );
          end if;
        end if;

        v_retries := v_retries + 1;
        if v_retries > 3 then
          raise;  -- give up; very unlikely to reach here
        end if;
        -- loop and recompute with a fresh max
    end;
  end loop;

  return jsonb_build_object(
    'check_id',       v_check_id,
    'attempt_number', v_attempt_number,
    'verdicts',       p_verdicts,
    'replayed',       false
  );
end;
$$;

-- ⚠ SERVICE-ROLE ONLY — this is a security boundary, not housekeeping.
-- record_check takes VERDICTS as an argument. A student able to call it
-- directly could write themselves a row of 'correct' answers, and (once the
-- teacher-grading slice lands) that row is what a teacher reads. The Edge
-- Function computes verdicts from the raw document and is the only caller.
revoke execute on function record_check(uuid, uuid, uuid, text, jsonb, jsonb, text, integer, integer)
  from public, anon, authenticated;
grant execute on function record_check(uuid, uuid, uuid, text, jsonb, jsonb, text, integer, integer)
  to service_role;

-- =============================================================================
-- Intentional advisor residue after this migration (do NOT "fix" these)
-- -----------------------------------------------------------------------------
--   * authenticated_security_definer_function_executable (WARN) on
--     get_activity_version_for_check — DEFINER with an inline gate (auth.uid()
--     + published-only + parentage WHERE) is the accepted pattern this repo
--     already runs for get_published_activity / publish_activity et al. (0015
--     footer lists the set; this joins it).
--   * record_check is DEFINER but grantable to service_role ONLY, so it should
--     NOT appear under the authenticated-executable lint at all. If it does,
--     that is a real finding — the grant went wrong.
--   * multiple_permissive_policies (INFO) on section_checks — the student-own
--     and teacher-owns-activity SELECT policies are both permissive by design
--     (a row matches at most one of them in practice). Same acceptance
--     reasoning as the submissions and classes pairs.
-- =============================================================================

-- =============================================================================
-- Verification — spot checks (run scripts/verify-0020.sql for the full pass)
-- =============================================================================
--
-- -- 1. Grants. EXPECT get_activity_version_for_check: {authenticated,
-- --    service_role} (+postgres); record_check: {service_role} (+postgres)
-- --    and NO authenticated row; NO PUBLIC row for either.
-- select p.proname, coalesce(g.rolname, 'PUBLIC') as grantee
-- from pg_proc p
-- cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
-- left join pg_roles g on g.oid = a.grantee
-- where p.proname in ('get_activity_version_for_check', 'record_check')
-- order by 1, 2;
--
-- -- 2. Table locked down. EXPECT rowsecurity=t, forcerowsecurity=t, and
-- --    exactly 2 policies, BOTH for select (no write policy exists).
-- select relrowsecurity, relforcerowsecurity from pg_class
-- where relname = 'section_checks';
-- select policyname, cmd from pg_policies where tablename = 'section_checks' order by 1;
--
-- -- 3. The post-DDL ACL completeness routine (0016 footer): EXPECT 0 rows
-- --    OTHER than get_activity_public_meta (the documented anon exception).
-- select p.proname, coalesce(g.rolname, 'PUBLIC') as grantee
-- from pg_proc p
-- join pg_namespace n on n.oid = p.pronamespace
-- cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
-- left join pg_roles g on g.oid = a.grantee
-- where n.nspname = 'public'
--   and (g.rolname = 'anon' or a.grantee = 0)
-- order by 1, 2;
