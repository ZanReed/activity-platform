-- =============================================================================
-- 0029_anonymous_wire_demolition.sql — S9 Drop 3: the anonymous wire dies
-- =============================================================================
-- The components-as-data cutover (docs/design/s9-cutover.md, D-5/D-6 +
-- OV-5/OV-10, all author-ruled 2026-08-09/12) deletes the anonymous
-- submission machinery: published R2 pages were the author's own test
-- artifacts (the no-old-pages ruling), the ingest-submission and get-feedback
-- Edge Functions are queued for platform deletion in the same drop, and the
-- viewer's server-authoritative path (S4 check-activity + section_checks) is
-- the only student write path that survives.
--
-- ZERO-TRAFFIC EVIDENCE (OV-10, captured 2026-08-14 before writing this):
--   * newest submissions row: 2026-07-29 12:34 UTC — nothing in 16 days
--   * 24h unified edge-log window: zero requests to either doomed function
--     (the busiest path was /auth/v1/callback at 8 requests — Station 0's own
--     probes); recorded in STATE with the query shapes
--   * observed pre-wipe counts: submissions 17 (6 with ip_hash, 0 with
--     student_id), grades 0, section_checks 0
--
-- WHAT THIS MIGRATION DOES, in order:
--   1. WIPES submissions + grades (P7: counted, printed). The author ruled
--      the rows test artifacts (D-6); the wipe also closes the disclosed
--      "ip_hash scrub mechanism not yet built" gap by data removal — the
--      compliance pack row flips in the same commit.
--   2. Drops the ingest_submission RPC (its only caller is being deleted).
--   3. Drops the account-backed identity branch from submissions:
--      student_id column, the 3-branch identity CHECK back to 2, and the two
--      partial indexes (submissions_student_idx, submissions_account_attempt_idx).
--   4. Re-creates purge_soft_deleted WITHOUT its two submissions.student_id
--      references — found at build time (P10 recon), NOT in the plan's list:
--      the nightly cron job would otherwise die on "column s.student_id does
--      not exist" at its first post-0029 fire, the exact 0022-class failure
--      the retention arc exists to prevent.
--
-- WHAT DELIBERATELY SURVIVES (D-6): the submissions + grades TABLES (empty,
-- RLS forced, teacher-read policies intact) — dropping them would foreclose
-- the parked teacher-grading slice's schema decision (attempts-vs-latest;
-- whether grades re-keys or a checks-native table replaces it) for zero gain.
-- assignments stays dormant likewise. purge_soft_deleted's step 2 (delete
-- submissions of purged assignments) also survives: it references only
-- assignment_id, is a no-op on an empty table, and its fate belongs to the
-- same parked slice.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. The counted wipe (P7: destroying data is a counted act, printed at apply)
-- -----------------------------------------------------------------------------
-- grades first, explicitly — it would CASCADE from submissions, but a cascade
-- is an uncounted delete and P7 exists because silent residue (and silent
-- destruction) has bitten twice (s4a/s7a).
do $$
declare
  v_grades      int;
  v_submissions int;
begin
  delete from grades;
  get diagnostics v_grades = row_count;
  delete from submissions;
  get diagnostics v_submissions = row_count;
  raise notice '0029 wipe: % grades rows, % submissions rows deleted (expected 0 and 17 live; anything larger means traffic arrived after the zero-traffic check and the apply should be investigated before proceeding)',
    v_grades, v_submissions;
end $$;

-- -----------------------------------------------------------------------------
-- 2. The ingest RPC dies with its only caller
-- -----------------------------------------------------------------------------
-- Signature matches the live catalog (verified via pg_get_function_identity_
-- arguments before writing). Grants die with the function.
drop function if exists ingest_submission(
  uuid, text, text, jsonb, numeric, text, text
);

-- -----------------------------------------------------------------------------
-- 3. The account-backed identity branch (0014 §9) is demolished
-- -----------------------------------------------------------------------------
-- Order matters: the CHECK and the partial indexes reference the column, so
-- they go first — explicitly, not via DROP COLUMN CASCADE, so nothing else
-- can ride along silently.
drop index if exists submissions_student_idx;
drop index if exists submissions_account_attempt_idx;

alter table submissions drop constraint submissions_identity_present;
-- student_id goes with its FK (submissions_student_id_fkey).
alter table submissions drop column student_id;

-- Back to 0001's two identity forms. The wire that wrote them is gone, so no
-- row can ever be inserted again — the CHECK is retained as documentation of
-- what the frozen rows' shape was, and as a tripwire should anything try.
alter table submissions
  add constraint submissions_identity_present
  check (
    opaque_token is not null
    or (display_name is not null and length(trim(display_name)) > 0)
  );

-- -----------------------------------------------------------------------------
-- 4. purge_soft_deleted loses its submissions.student_id references
-- -----------------------------------------------------------------------------
-- Transcribed from the LIVE definition (pg_get_functiondef, 2026-08-14 —
-- shipped reality per P10, not the 0025 file), with exactly two edits:
--
--   * step 6's guard `and not exists (select 1 from submissions s where
--     s.student_id = u.id)` is REMOVED — it kept a deleted account's checks
--     alive while the account still had submissions blocking its purge; no
--     account can have submissions rows anymore, so the guard was vacuous.
--   * step 7's blocker `exists (select 1 from submissions x where
--     x.student_id = v_uid)` is REMOVED from the or-chain — same reasoning.
--
-- Everything else is byte-for-byte, including the counted NOTICE line the
-- cron-run verification greps for. CREATE OR REPLACE preserves the existing
-- owner + ACL, so no grant work is needed here.
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
begin
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
  --    0029; kept as-is — see the header's "what deliberately survives").
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

  -- 5. Activities themselves
  delete from activities where deleted_at < now() - interval '30 days';

  -- 6. Section checks belonging to explicitly-deleted accounts past their
  --    window. Explicit rather than riding the FK cascade, so destroying
  --    student work is a counted act (2026-08-04 finding). (0029 removed the
  --    submissions guard that stood here: no account can have submissions.)
  delete from section_checks sc
   where sc.student_id in (
     select u.id from users u
      where u.deleted_at < now() - interval '30 days'
   );
  get diagnostics v_checks_student = row_count;

  -- 7. Accounts. TWO independent ways in, then the 0023 precedence applies to
  --    both: eligible only once no work is retained and nothing else
  --    references the row.
  --
  --      (a) EXPLICIT deletion — admin action or an on-request deletion set
  --          users.deleted_at. 30-day grace. Any role.
  --      (b) DORMANCY — a student with no active class membership for 400
  --          days. DERIVED, never written down (see the header). The clock
  --          starts at the latest moment one of their memberships ended, or
  --          at created_at for a student who never joined one.
  for v_uid in
    select u.id
      from users u
     where (u.deleted_at < now() - interval '30 days')
        or (
             u.role = 'student'
             -- no membership that is still live on a live class
             and not exists (
               select 1
                 from class_members cm
                 join classes c on c.id = cm.class_id
                where cm.student_id = u.id
                  and cm.removed_at is null
                  and c.deleted_at is null
             )
             -- ...and the most recent ending is past the window. GREATEST
             -- ignores NULLs, and every membership of a dormant student has at
             -- least one of removed_at / class.deleted_at set, so this is
             -- never NULL for a row that reached here.
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
    or exists (select 1 from grades           x where x.graded_by  = v_uid)
    or exists (select 1 from allowlist        x where x.added_by   = v_uid)
    or exists (select 1 from student_domain   x where x.added_by   = v_uid)
    then
      v_blocked := v_blocked + 1;
      continue;
    end if;

    -- Mark this actor's audit rows BEFORE the delete (0024): afterwards
    -- SET NULL has fired and actor_id no longer identifies them.
    update audit_log
       set metadata = coalesce(metadata, '{}'::jsonb)
                      || jsonb_build_object('actor_purged', true)
     where actor_id = v_uid;

    delete from auth.users where id = v_uid;
    v_accounts := v_accounts + 1;
  end loop;

  raise notice
    'purge_soft_deleted: section_checks %+% (activity/student), accounts purged %, accounts blocked %',
    v_checks_activity, v_checks_student, v_accounts, v_blocked;
end;
$$;

-- =============================================================================
-- Verification: scripts/verify-0029.sql (registered in the verify-runner set;
-- run `pnpm verify:auth --target live` after applying). verify-0013-0014's
-- identity expectations were updated in the same commit (OV-DX-1).
-- =============================================================================
