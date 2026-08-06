-- =============================================================================
-- verify-0020.sql — behavioral matrix for the section-check surface (S4)
-- -----------------------------------------------------------------------------
-- Proves 0020's three pieces at the PREDICATE layer, inside one rolled-back
-- transaction: the authorization chain (get_activity_version_for_check), the
-- write path (record_check — rate ceiling, idempotency, attempt race), and
-- section_checks RLS. Nothing persists.
--
-- Run as postgres (SQL editor / MCP) AFTER 0020 is applied. Expect the final
-- notice `=== verify-0020: 23 PASS, 0 FAIL ===` (22 original + B11, the 60/60
-- production-defaults boundary, added 2026-08-06); any FAIL raises, so the
-- transaction can never be mistaken for green. Re-run after ANY future
-- auth/RLS/grant migration (migrations/README.md → "Regression re-runs").
--
-- PROBE-VERIFIED 2026-08-01 before 0020 was ever applied: the migration DDL
-- and this whole matrix were run together inside a rolled-back transaction via
-- MCP (22/22 PASS, zero residue — table, functions, and the synthetic version
-- row all confirmed absent afterwards). So the SQL below is known-good against
-- the real database, not just known-plausible. A2 (foreign-parent refused) and
-- B1 (authenticated cannot call record_check) are the two that must never
-- regress; both are security boundaries, not conveniences.
--
-- SCOPE HONESTY: this proves the DATABASE surface. The layers above it — Zod
-- request validation, the ids ⊆ section check, grading correctness, outbound
-- sanitize — are proven by the viewer package's unit suites and by
-- scripts/verify-check-e2e.js against the deployed function. A green run here
-- is necessary, not sufficient.
--
-- Requires: one published activity with a version, and at least one
-- non-deleted user who does NOT own it (the stand-in student — access is
-- any-authenticated by design, so their role is irrelevant).
--
-- Mechanics worth knowing before editing:
--   * Impersonation = set request.jwt.claims (what auth.uid() reads) + SET
--     LOCAL ROLE. Both are transaction-local and AUTO-REVERT when an exception
--     aborts a BEGIN/EXCEPTION sub-block — which is why the handlers below
--     don't reset the role by hand.
--   * The "other student" is an impersonated random uuid with NO users row.
--     Deliberate: RLS reads never require the caller to exist, so this gives
--     exact stranger semantics without fabricating auth.users rows (which
--     would fire handle_new_auth_user and hit the allowlist gate).
--   * postgres carries BYPASSRLS on hosted Supabase, so fixture writes to the
--     forced-RLS tables work from the outer (non-impersonated) scope.
-- =============================================================================

begin;

create function pg_temp.impersonate(p_sub text, p_role text) returns void as $$
begin
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', p_sub, 'role', p_role)::text,
    true
  );
  execute format('set local role %I', p_role);
end;
$$ language plpgsql;

create function pg_temp.unimpersonate() returns void as $$
begin
  reset role;
  perform set_config('request.jwt.claims', null, true);
end;
$$ language plpgsql;

do $$
declare
  v_activity   uuid;
  v_owner      uuid;
  v_version    uuid;
  v_version2   uuid;
  v_student    uuid;
  v_stranger   uuid := gen_random_uuid();
  v_foreign_v  uuid;
  v_pass       int := 0;
  v_fail       int := 0;
  v_result     jsonb;
  v_result2    jsonb;
  v_check_id   uuid;
  v_n          int;
  v_is_current boolean;
  v_msg        text;
begin
  -- ======================= Fixtures =========================================
  select a.id, a.owner_id, a.current_version_id
    into v_activity, v_owner, v_version
  from public.activities a
  where a.deleted_at is null
    and a.status = 'published'
    and a.current_version_id is not null
  order by a.created_at desc
  limit 1;
  if v_activity is null then
    raise exception 'No published activity with a current version — publish one, then re-run.';
  end if;

  select u.id into v_student
  from public.users u
  where u.deleted_at is null and u.id <> v_owner
  limit 1;
  if v_student is null then
    raise exception 'No non-owner user found — need a second account to stand in as the student.';
  end if;

  -- A version of a DIFFERENT activity: the foreign-parent probe (B2).
  select v.id into v_foreign_v
  from public.activity_versions v
  where v.activity_id <> v_activity
  limit 1;

  -- A synthetic second version of the SAME activity, for the attempt-scope
  -- test (B15). Plain data insert; the rollback removes it.
  insert into public.activity_versions (activity_id, version_num, content, created_by)
  select v_activity, coalesce(max(version_num), 0) + 1, '{"probe":true}'::jsonb, v_owner
  from public.activity_versions where activity_id = v_activity
  returning id into v_version2;

  raise notice 'Fixture: activity %, owner %, version %, student %',
    v_activity, v_owner, v_version, v_student;

  -- ================= A. Authorization chain (ruling S4-B1) ==================

  -- A1. Student resolves the CORRECT (activity, version) pair → 1 row, current.
  begin
    perform pg_temp.impersonate(v_student::text, 'authenticated');
    select is_current into v_is_current
    from get_activity_version_for_check(v_activity, v_version);
    perform pg_temp.unimpersonate();
    if v_is_current then
      v_pass := v_pass + 1; raise notice 'PASS A1: student resolves own served version (is_current)';
    else
      v_fail := v_fail + 1; raise warning 'FAIL A1: expected is_current=true';
    end if;
  exception when others then
    perform pg_temp.unimpersonate();
    v_fail := v_fail + 1; raise warning 'FAIL A1: unexpected error %', sqlerrm;
  end;

  -- A2. ⚠ THE SECURITY PROBE. A version belonging to ANOTHER activity must be
  --     refused. Without the parentage join, an empty-responses request with a
  --     foreign versionId returns that activity's whole solution set.
  if v_foreign_v is null then
    raise notice 'SKIP A2: only one activity has versions — foreign-parent probe not exercised';
  else
    begin
      perform pg_temp.impersonate(v_student::text, 'authenticated');
      perform * from get_activity_version_for_check(v_activity, v_foreign_v);
      perform pg_temp.unimpersonate();
      v_fail := v_fail + 1;
      raise warning 'FAIL A2: FOREIGN version resolved — parentage check is not holding';
    exception when others then
      perform pg_temp.unimpersonate();
      if sqlerrm like '%Not available%' then
        v_pass := v_pass + 1; raise notice 'PASS A2: foreign-parent version refused (Not available)';
      else
        v_fail := v_fail + 1; raise warning 'FAIL A2: wrong error %', sqlerrm;
      end if;
    end;
  end if;

  -- A3. A nonexistent version id is refused with the SAME message (no oracle).
  begin
    perform pg_temp.impersonate(v_student::text, 'authenticated');
    perform * from get_activity_version_for_check(v_activity, gen_random_uuid());
    perform pg_temp.unimpersonate();
    v_fail := v_fail + 1; raise warning 'FAIL A3: nonexistent version resolved';
  exception when others then
    perform pg_temp.unimpersonate();
    if sqlerrm like '%Not available%' then
      v_pass := v_pass + 1; raise notice 'PASS A3: nonexistent version refused, same message';
    else
      v_fail := v_fail + 1; raise warning 'FAIL A3: wrong error %', sqlerrm;
    end if;
  end;

  -- A4. Anonymous callers are refused (EXECUTE revoked from anon).
  begin
    perform pg_temp.impersonate(v_stranger::text, 'anon');
    perform * from get_activity_version_for_check(v_activity, v_version);
    perform pg_temp.unimpersonate();
    v_fail := v_fail + 1; raise warning 'FAIL A4: anon resolved a version';
  exception when others then
    perform pg_temp.unimpersonate();
    v_pass := v_pass + 1; raise notice 'PASS A4: anon refused (%)', left(sqlerrm, 40);
  end;

  -- A5. The function must NEVER expose content. Structural assertion: no
  --     column of its return type is named/typed like the document.
  select count(*) into v_n
  from information_schema.routines r
  join information_schema.parameters p
    on p.specific_name = r.specific_name
  where r.routine_name = 'get_activity_version_for_check'
    and (p.parameter_name = 'content' or p.data_type = 'jsonb');
  if v_n = 0 then
    v_pass := v_pass + 1; raise notice 'PASS A5: authorization RPC returns no jsonb/content column';
  else
    v_fail := v_fail + 1; raise warning 'FAIL A5: RPC exposes % jsonb/content column(s) — RAW ANSWER KEYS', v_n;
  end if;

  -- ================= B. Write path (record_check) ===========================

  -- B1. ⚠ SECURITY BOUNDARY. authenticated must NOT be able to call
  --     record_check: it takes verdicts as an argument, so a student calling
  --     it directly could write themselves a row of 'correct'.
  begin
    perform pg_temp.impersonate(v_student::text, 'authenticated');
    perform record_check(v_student, v_activity, v_version, 's1',
      '{}'::jsonb, '{}'::jsonb, null, 60, 60);
    perform pg_temp.unimpersonate();
    v_fail := v_fail + 1;
    raise warning 'FAIL B1: authenticated CALLED record_check — students can forge verdicts';
  exception when others then
    perform pg_temp.unimpersonate();
    if sqlerrm like '%permission denied%' then
      v_pass := v_pass + 1; raise notice 'PASS B1: authenticated refused record_check (permission denied)';
    else
      v_fail := v_fail + 1; raise warning 'FAIL B1: wrong error %', sqlerrm;
    end if;
  end;

  -- B2. Service-role path inserts and returns attempt 1.
  v_result := record_check(v_student, v_activity, v_version, 'sec-A',
    '{"blanks":{"b1":"7"}}'::jsonb,
    '{"b1":{"verdict":"correct"}}'::jsonb, null, 60, 60);
  if (v_result->>'attempt_number')::int = 1 and (v_result->>'replayed')::boolean = false then
    v_pass := v_pass + 1; raise notice 'PASS B2: first check recorded as attempt 1';
  else
    v_fail := v_fail + 1; raise warning 'FAIL B2: got %', v_result;
  end if;
  v_check_id := (v_result->>'check_id')::uuid;

  -- B3. Re-check of the SAME section increments (parity: re-checking allowed).
  v_result := record_check(v_student, v_activity, v_version, 'sec-A',
    '{"blanks":{"b1":"8"}}'::jsonb,
    '{"b1":{"verdict":"incorrect"}}'::jsonb, null, 60, 60);
  if (v_result->>'attempt_number')::int = 2 then
    v_pass := v_pass + 1; raise notice 'PASS B3: re-check increments to attempt 2';
  else
    v_fail := v_fail + 1; raise warning 'FAIL B3: got %', v_result;
  end if;

  -- B4. Attempt numbering is scoped PER SECTION.
  v_result := record_check(v_student, v_activity, v_version, 'sec-B',
    '{}'::jsonb, '{}'::jsonb, null, 60, 60);
  if (v_result->>'attempt_number')::int = 1 then
    v_pass := v_pass + 1; raise notice 'PASS B4: a different section starts at attempt 1';
  else
    v_fail := v_fail + 1; raise warning 'FAIL B4: got %', v_result;
  end if;

  -- B5. Attempt numbering is scoped PER VERSION — a republish restarts it.
  v_result := record_check(v_student, v_activity, v_version2, 'sec-A',
    '{}'::jsonb, '{}'::jsonb, null, 60, 60);
  if (v_result->>'attempt_number')::int = 1 then
    v_pass := v_pass + 1; raise notice 'PASS B5: a different version restarts attempt numbering';
  else
    v_fail := v_fail + 1; raise warning 'FAIL B5: got %', v_result;
  end if;

  -- B6. Idempotent replay returns the ORIGINAL row, not a new attempt.
  v_result := record_check(v_student, v_activity, v_version, 'sec-C',
    '{"blanks":{"x":"1"}}'::jsonb,
    '{"x":{"verdict":"correct"}}'::jsonb, 'idem-key-1', 60, 60);
  v_result2 := record_check(v_student, v_activity, v_version, 'sec-C',
    '{"blanks":{"x":"CHANGED"}}'::jsonb,
    '{"x":{"verdict":"incorrect"}}'::jsonb, 'idem-key-1', 60, 60);
  if v_result->>'check_id' = v_result2->>'check_id'
     and (v_result2->>'replayed')::boolean = true
     and v_result2->'verdicts'->'x'->>'verdict' = 'correct' then
    v_pass := v_pass + 1;
    raise notice 'PASS B6: replay returns the original check_id AND the original verdicts';
  else
    v_fail := v_fail + 1; raise warning 'FAIL B6: first=% second=%', v_result, v_result2;
  end if;

  -- B7. The replay did not mint a second row.
  select count(*) into v_n from section_checks
  where student_id = v_student and idempotency_key = 'idem-key-1';
  if v_n = 1 then
    v_pass := v_pass + 1; raise notice 'PASS B7: replay wrote no second row';
  else
    v_fail := v_fail + 1; raise warning 'FAIL B7: % rows for one idempotency key', v_n;
  end if;

  -- B8. Rate ceiling fires (limit forced to 1 for the probe).
  begin
    perform record_check(v_student, v_activity, v_version, 'sec-D',
      '{}'::jsonb, '{}'::jsonb, null, 1, 60);
    v_fail := v_fail + 1; raise warning 'FAIL B8: rate ceiling did not fire at limit 1';
  exception when others then
    if sqlerrm like '%rate_limited%' then
      v_pass := v_pass + 1; raise notice 'PASS B8: rate ceiling raises rate_limited';
    else
      v_fail := v_fail + 1; raise warning 'FAIL B8: wrong error %', sqlerrm;
    end if;
  end;

  -- B9. A replay is NOT rate-limited: retrying an accepted request must not
  --     punish the student for our slow cold start.
  begin
    v_result2 := record_check(v_student, v_activity, v_version, 'sec-C',
      '{}'::jsonb, '{}'::jsonb, 'idem-key-1', 1, 60);
    if (v_result2->>'replayed')::boolean = true then
      v_pass := v_pass + 1; raise notice 'PASS B9: replay succeeds even at the rate ceiling';
    else
      v_fail := v_fail + 1; raise warning 'FAIL B9: expected a replay, got %', v_result2;
    end if;
  exception when others then
    v_fail := v_fail + 1; raise warning 'FAIL B9: replay was rate-limited (%)', sqlerrm;
  end;

  -- B10. The stored row carries the feedback the student was shown (S4-B4).
  perform record_check(v_student, v_activity, v_version, 'sec-E',
    '{"blanks":{"y":"2"}}'::jsonb,
    '{"y":{"verdict":"incorrect","feedback":[{"type":"text","text":"check your sign"}]}}'::jsonb,
    null, 60, 60);
  select count(*) into v_n from section_checks
  where student_id = v_student and section_id = 'sec-E'
    and verdicts->'y'->'feedback'->0->>'text' = 'check your sign';
  if v_n = 1 then
    v_pass := v_pass + 1; raise notice 'PASS B10: feedback shown to the student is stored with the verdict';
  else
    v_fail := v_fail + 1; raise warning 'FAIL B10: feedback not persisted';
  end if;

  -- B11. The PRODUCTION ceiling: the 60/60 DEFAULTS, at their real boundary
  --      (eng-review A6, 2026-08-06 — the dormant-safeguard rule P3). B8 proves
  --      the MECHANISM at a forced limit of 1; nothing anywhere exercised the
  --      pair production actually runs — the Edge Function passes neither rate
  --      parameter, so the defaults below ARE the live ceiling. The calls here
  --      deliberately OMIT both parameters: if a migration ever drops the
  --      defaults, this case fails to execute at all, which is the point.
  --
  --      Every row inserted in this transaction shares created_at = now()
  --      (now() is frozen per transaction), so the window count sees all of
  --      them; fill from the CURRENT count up to exactly 60, then the 61st
  --      must raise.
  select count(*) into v_n from section_checks
  where student_id = v_student
    and created_at > now() - make_interval(secs => 60);
  while v_n < 60 loop
    perform record_check(v_student, v_activity, v_version, 'sec-RATE',
      '{}'::jsonb, '{}'::jsonb);
    v_n := v_n + 1;
  end loop;
  begin
    perform record_check(v_student, v_activity, v_version, 'sec-RATE',
      '{}'::jsonb, '{}'::jsonb);
    v_fail := v_fail + 1;
    raise warning 'FAIL B11: the 61st check inside the window was accepted — the 60/60 defaults are not gating';
  exception when others then
    if sqlerrm like '%rate_limited%' then
      v_pass := v_pass + 1;
      raise notice 'PASS B11: the production 60/60 defaults gate at exactly 60';
    else
      v_fail := v_fail + 1; raise warning 'FAIL B11: wrong error %', sqlerrm;
    end if;
  end;

  -- ======================= C. RLS on section_checks =========================

  -- C1. The student reads their own checks.
  begin
    perform pg_temp.impersonate(v_student::text, 'authenticated');
    select count(*) into v_n from section_checks where student_id = v_student;
    perform pg_temp.unimpersonate();
    if v_n > 0 then
      v_pass := v_pass + 1; raise notice 'PASS C1: student reads own checks (% rows)', v_n;
    else
      v_fail := v_fail + 1; raise warning 'FAIL C1: student sees 0 of their own checks';
    end if;
  exception when others then
    perform pg_temp.unimpersonate();
    v_fail := v_fail + 1; raise warning 'FAIL C1: %', sqlerrm;
  end;

  -- C2. A STRANGER (any other signed-in account) sees nothing.
  begin
    perform pg_temp.impersonate(v_stranger::text, 'authenticated');
    select count(*) into v_n from section_checks;
    perform pg_temp.unimpersonate();
    if v_n = 0 then
      v_pass := v_pass + 1; raise notice 'PASS C2: a stranger sees 0 checks';
    else
      v_fail := v_fail + 1; raise warning 'FAIL C2: stranger sees % checks — LEAK', v_n;
    end if;
  exception when others then
    perform pg_temp.unimpersonate();
    v_fail := v_fail + 1; raise warning 'FAIL C2: %', sqlerrm;
  end;

  -- C3. The activity's TEACHER reads its checks (via can_read_activity).
  begin
    perform pg_temp.impersonate(v_owner::text, 'authenticated');
    select count(*) into v_n from section_checks where activity_id = v_activity;
    perform pg_temp.unimpersonate();
    if v_n > 0 then
      v_pass := v_pass + 1; raise notice 'PASS C3: activity owner reads its checks (% rows)', v_n;
    else
      v_fail := v_fail + 1; raise warning 'FAIL C3: owner sees 0 checks on their own activity';
    end if;
  exception when others then
    perform pg_temp.unimpersonate();
    v_fail := v_fail + 1; raise warning 'FAIL C3: %', sqlerrm;
  end;

  -- C4. NO write policy exists: a student cannot insert their own verdicts
  --     even bypassing the RPC.
  begin
    perform pg_temp.impersonate(v_student::text, 'authenticated');
    insert into section_checks (student_id, activity_id, activity_version_id,
                                section_id, attempt_number, responses, verdicts)
    values (v_student, v_activity, v_version, 'forged', 99,
            '{}'::jsonb, '{"all":{"verdict":"correct"}}'::jsonb);
    perform pg_temp.unimpersonate();
    v_fail := v_fail + 1;
    raise warning 'FAIL C4: student INSERTED a forged check row';
  exception when others then
    perform pg_temp.unimpersonate();
    v_pass := v_pass + 1; raise notice 'PASS C4: direct insert refused (%)', left(sqlerrm, 40);
  end;

  -- ======================= D. Structure =====================================

  -- D1. record_check is NOT executable by authenticated (grant discipline).
  select count(*) into v_n
  from pg_proc p
  cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
  left join pg_roles g on g.oid = a.grantee
  where p.proname = 'record_check'
    and coalesce(g.rolname, 'PUBLIC') in ('authenticated', 'anon', 'PUBLIC');
  if v_n = 0 then
    v_pass := v_pass + 1; raise notice 'PASS D1: record_check grants exclude authenticated/anon/PUBLIC';
  else
    v_fail := v_fail + 1; raise warning 'FAIL D1: record_check reachable by % non-service role(s)', v_n;
  end if;

  -- D2. Both functions pin search_path and are DEFINER.
  select count(*) into v_n
  from pg_proc
  where proname in ('get_activity_version_for_check', 'record_check')
    and prosecdef
    and array_to_string(coalesce(proconfig, '{}'), ',') like '%search_path=public%';
  if v_n = 2 then
    v_pass := v_pass + 1; raise notice 'PASS D2: both functions are DEFINER with pinned search_path';
  else
    v_fail := v_fail + 1; raise warning 'FAIL D2: only % of 2 functions are hardened', v_n;
  end if;

  -- D3. RLS forced, exactly two policies, BOTH select (no write policy).
  select count(*) into v_n from pg_policies
  where tablename = 'section_checks' and cmd = 'SELECT';
  if v_n = 2 and (select count(*) from pg_policies where tablename = 'section_checks') = 2
     and (select relforcerowsecurity from pg_class where relname = 'section_checks') then
    v_pass := v_pass + 1; raise notice 'PASS D3: RLS forced, exactly 2 SELECT policies, no write policy';
  else
    v_fail := v_fail + 1; raise warning 'FAIL D3: policy shape wrong on section_checks';
  end if;

  -- ======================= Verdict ==========================================
  raise notice '=== verify-0020: % PASS, % FAIL ===', v_pass, v_fail;
  if v_fail > 0 then
    raise exception 'verify-0020 FAILED with % failures — see warnings above', v_fail;
  end if;
end;
$$;

rollback;
