-- =============================================================================
-- verify-image-storage.sql — behavioral matrix for 0019's INSERT policy
-- -----------------------------------------------------------------------------
-- Proves the activity-images write gate at the PREDICATE layer: impersonated
-- roles attempt direct INSERTs into storage.objects inside one rolled-back
-- transaction. Nothing persists (the pg_temp helper is dropped by the rollback
-- too).
--
-- SCOPE HONESTY (eng review, outside-voice finding 4): direct INSERT bypasses
-- the Storage API, so this script proves the RLS predicate only. The API layer
-- in front of it — bucket mime/size limits, owner stamping, the upsert header —
-- is proven by the live E2E checklist at the bottom. A green run here is
-- necessary, not sufficient.
--
-- Run as postgres (SQL editor / MCP) AFTER 0019 is applied. Expect the final
-- notice `=== verify-image-storage: 8 PASS, 0 FAIL ===`; any FAIL raises, so
-- the transaction can never be mistaken for green. Re-run after ANY future
-- auth/RLS/grant migration (migrations/README.md → "Regression re-runs").
--
-- Requires at least one non-deleted activity to exist.
--
-- Mechanics worth knowing before editing:
--   * Impersonation = set request.jwt.claims (what auth.uid() reads) + SET
--     LOCAL ROLE. Both are transaction-local, and both AUTO-REVERT when an
--     exception aborts a BEGIN/EXCEPTION sub-block — which is why the
--     exception handlers below don't reset the role by hand.
--   * PL/pgSQL has no nested procedures; the impersonate helper is a pg_temp
--     function instead.
--   * postgres carries BYPASSRLS on hosted Supabase, so the fixture UPDATE on
--     the forced-RLS activities table works from the outer (non-impersonated)
--     scope.
-- =============================================================================

-- Runner-compatible since the identity slice (DX F1/X2): `pnpm verify:auth`
-- runs the block below as one section and PASSES only on the exact
-- "8 PASS, 0 FAIL" notice — any failing case changes the counts (and raises),
-- so the match is the assertion. Still paste-runnable as before.

-- @section rls-predicate-matrix
-- @expect-log === verify-image-storage: 8 PASS, 0 FAIL ===
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

do $$
declare
  v_activity uuid;
  v_owner    uuid;
  v_pass     int := 0;
  v_fail     int := 0;
  v_ok       boolean;
begin
  -- Fixture: newest non-deleted activity + its owner.
  select id, owner_id into v_activity, v_owner
  from public.activities
  where deleted_at is null
  order by created_at desc
  limit 1;
  if v_activity is null then
    raise exception 'No non-deleted activity found — create one, then re-run.';
  end if;
  raise notice 'Fixture: activity %, owner %', v_activity, v_owner;

  -- Case A: the OWNER inserts under their activity id → ALLOWED.
  begin
    perform pg_temp.impersonate(v_owner::text, 'authenticated');
    insert into storage.objects (bucket_id, name)
    values ('activity-images', v_activity || '/aaaaaaaa-0000-0000-0000-000000000001.png');
    reset role;
    v_pass := v_pass + 1; raise notice 'PASS — A: owner insert allowed';
  exception when others then
    v_fail := v_fail + 1; raise notice 'FAIL — A: owner insert rejected (%: %)', sqlstate, sqlerrm;
  end;

  -- Case B: a NON-OWNER authenticated user (random sub — need not exist in
  -- users; can_edit_activity only compares owner_id to auth.uid()) → DENIED.
  begin
    perform pg_temp.impersonate(gen_random_uuid()::text, 'authenticated');
    insert into storage.objects (bucket_id, name)
    values ('activity-images', v_activity || '/aaaaaaaa-0000-0000-0000-000000000002.png');
    reset role;
    v_fail := v_fail + 1; raise notice 'FAIL — B: non-owner insert was ALLOWED';
  exception when insufficient_privilege then
    v_pass := v_pass + 1; raise notice 'PASS — B: non-owner denied (42501)';
  when others then
    v_fail := v_fail + 1; raise notice 'FAIL — B: non-owner denied with WRONG error (%)', sqlstate;
  end;

  -- Case C: anon → DENIED (policy is TO authenticated; a table-privilege
  -- denial is an equally valid wall, hence the broader catch).
  begin
    perform pg_temp.impersonate('', 'anon');
    insert into storage.objects (bucket_id, name)
    values ('activity-images', v_activity || '/aaaaaaaa-0000-0000-0000-000000000003.png');
    reset role;
    v_fail := v_fail + 1; raise notice 'FAIL — C: anon insert was ALLOWED';
  exception when others then
    v_pass := v_pass + 1; raise notice 'PASS — C: anon denied (%)', sqlstate;
  end;

  -- Case D (THE D1 PIN): non-uuid first segment must be a CLEAN policy denial
  -- (42501), never a cast error (22P02) — proves the CASE guard holds under
  -- whatever order the planner evaluates the predicate.
  begin
    perform pg_temp.impersonate(v_owner::text, 'authenticated');
    insert into storage.objects (bucket_id, name)
    values ('activity-images', 'garbage-not-a-uuid/x.png');
    reset role;
    v_fail := v_fail + 1; raise notice 'FAIL — D: non-uuid segment was ALLOWED';
  exception when insufficient_privilege then
    v_pass := v_pass + 1; raise notice 'PASS — D: non-uuid segment → clean 42501, cast never ran';
  when invalid_text_representation then
    v_fail := v_fail + 1; raise notice 'FAIL — D: 22P02 CAST ERROR leaked — the CASE guard is broken';
  when others then
    v_fail := v_fail + 1; raise notice 'FAIL — D: unexpected error (%)', sqlstate;
  end;

  -- Case E: root-level key (no folder → array_length(foldername) is NULL) → DENIED.
  begin
    perform pg_temp.impersonate(v_owner::text, 'authenticated');
    insert into storage.objects (bucket_id, name)
    values ('activity-images', 'rootlevel.png');
    reset role;
    v_fail := v_fail + 1; raise notice 'FAIL — E: root-level key was ALLOWED';
  exception when insufficient_privilege then
    v_pass := v_pass + 1; raise notice 'PASS — E: root-level key denied (42501)';
  when others then
    v_fail := v_fail + 1; raise notice 'FAIL — E: unexpected error (%)', sqlstate;
  end;

  -- Case F: nested key (depth 2) → DENIED even under the owner's real activity id.
  begin
    perform pg_temp.impersonate(v_owner::text, 'authenticated');
    insert into storage.objects (bucket_id, name)
    values ('activity-images', v_activity || '/nested/x.png');
    reset role;
    v_fail := v_fail + 1; raise notice 'FAIL — F: nested key was ALLOWED';
  exception when insufficient_privilege then
    v_pass := v_pass + 1; raise notice 'PASS — F: nested key denied (42501)';
  when others then
    v_fail := v_fail + 1; raise notice 'FAIL — F: unexpected error (%)', sqlstate;
  end;

  -- Case G: soft-deleted activity → DENIED (rides can_edit_activity's
  -- deleted_at check). Soft-delete the fixture (BYPASSRLS scope), try as owner.
  update public.activities set deleted_at = now() where id = v_activity;
  begin
    perform pg_temp.impersonate(v_owner::text, 'authenticated');
    insert into storage.objects (bucket_id, name)
    values ('activity-images', v_activity || '/aaaaaaaa-0000-0000-0000-000000000004.png');
    reset role;
    v_fail := v_fail + 1; raise notice 'FAIL — G: soft-deleted activity was ALLOWED';
  exception when insufficient_privilege then
    v_pass := v_pass + 1; raise notice 'PASS — G: soft-deleted activity denied (42501)';
  when others then
    v_fail := v_fail + 1; raise notice 'FAIL — G: unexpected error (%)', sqlstate;
  end;
  update public.activities set deleted_at = null where id = v_activity;

  -- Case H: UPDATE (the upsert/overwrite path). No UPDATE policy exists, so
  -- RLS hides every row from the owner's UPDATE: 0 rows touched is the pass.
  -- (A table-privilege error is an equally valid wall.)
  begin
    perform pg_temp.impersonate(v_owner::text, 'authenticated');
    update storage.objects
    set name = name
    where bucket_id = 'activity-images';
    v_ok := not found;
    reset role;
    if v_ok then
      v_pass := v_pass + 1; raise notice 'PASS — H: overwrite path touches 0 rows (no UPDATE policy)';
    else
      v_fail := v_fail + 1; raise notice 'FAIL — H: an UPDATE went through — an UPDATE policy exists?!';
    end if;
  exception when others then
    v_pass := v_pass + 1; raise notice 'PASS — H: overwrite denied by error (%)', sqlstate;
  end;

  raise notice '=== verify-image-storage: % PASS, % FAIL ===', v_pass, v_fail;
  if v_fail > 0 then
    raise exception 'verify-image-storage FAILED (% failing cases)', v_fail;
  end if;
end;
$$;

rollback;

-- =============================================================================
-- Live E2E — AUTOMATED: paste scripts/verify-image-storage-e2e.js into the
-- browser console at https://activity-platform.pages.dev while signed in as a
-- teacher. It runs T1–T8 below (session-JWT reach, tokenless public read,
-- duplicate refusal, upsert/overwrite denial, bucket mime + size limits,
-- non-owned activity denial, malformed-key clean denial) and prints PASS/FAIL.
-- The manual equivalent, for reference:
--
--   1. FIRST (proves storage-js forwards the session JWT — the class of
--      assumption that already failed once for functions.invoke, see the old
--      uploadImage.ts header in git history): sign in as a teacher who owns an
--      activity, upload an image in the editor → the image renders; URL is
--      …/storage/v1/object/public/activity-images/{activityId}/….
--   2. Reload the page → the image still renders (public URL, no token).
--   3. As a NON-editor (student account or second teacher), browser console:
--        await supabase.storage.from('activity-images')
--          .upload('<that same activity id>/probe.png',
--                  new Blob(['x'], {type: 'image/png'}))
--      → must fail with a 403/RLS error.
--   4. As the owner, upload to an EXISTING object's key with { upsert: true }
--      → must fail (no UPDATE policy).
--   5. As the owner, via console (bypassing the client checks): a >10MB body
--      and a text/plain body → bucket limits must reject both (413/415-class).
-- =============================================================================
