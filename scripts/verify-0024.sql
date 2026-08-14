-- =============================================================================
-- verify-0024.sql — author walkthrough for the audit-actor purge rule
-- -----------------------------------------------------------------------------
-- ⚠ SCHEMA-ERA NOTE (S9 Drop 3, 2026-08-14): this walkthrough predates
-- migration 0029, which dropped submissions.student_id (column, FK, indexes)
-- and rewrote purge_soft_deleted without its submissions guards. Sections
-- here that read submissions.student_id will now ERROR — that is schema-era
-- mismatch, not a regression. This script is a dated one-time verification
-- (not in the verify-runner regression set); the living demolition proof is
-- scripts/verify-0029.sql.
-- Run AFTER applying 0024_audit_actor_purge.sql (SQL editor, service role).
--
-- ⚠ RUN SECTION 0 FIRST — it answers "is the migration actually live?".
-- ⚠ Section C reports success as a Postgres ERROR (`P0001`): the trailing
--   `raise exception` is what forces the rollback that protects live data.
--   Judge C by the TEXT of its message, never by the editor calling it an
--   error. A P0001 opening with EXPECTED ROLLBACK is always a pass.
--
-- No redeploy involved — pg_cron calls purge_soft_deleted inside the database.
-- =============================================================================

-- ===================== 0. PRECONDITION — run this FIRST ======================
-- EXPECT: applied = t. If f, run `supabase db push` and start over from here.
select (select case confdeltype when 'n' then true else false end
          from pg_constraint where conname = 'audit_log_actor_id_fkey') as applied,
       case when (select confdeltype from pg_constraint
                   where conname = 'audit_log_actor_id_fkey') = 'n'
            then 'OK — 0024 is live, continue to section A'
            else 'STOP — 0024 NOT APPLIED. Run: supabase db push'
       end as verdict;

-- ========================= A. Schema + function ==============================

-- A1. The delete rule changed. EXPECT: SET NULL
select case confdeltype when 'n' then 'SET NULL' when 'a' then 'NO ACTION'
       when 'c' then 'CASCADE' when 'r' then 'RESTRICT' end as on_delete
from pg_constraint where conname = 'audit_log_actor_id_fkey';

-- A2. actor_id is still nullable (0024 relies on it; no column change was
--     needed). EXPECT: YES
select is_nullable from information_schema.columns
where table_schema = 'public' and table_name = 'audit_log' and column_name = 'actor_id';

-- A3. audit_log left the eligibility guard, and the stamp is in place.
--     EXPECT: f / t
select strpos(prosrc, 'from audit_log        x') > 0 as still_blocks_accounts,
       strpos(prosrc, 'actor_purged') > 0            as stamps_purged_actor
from pg_proc where proname = 'purge_soft_deleted';

-- A4. Posture unchanged by REPLACE. EXPECT: t / search_path=public
select prosecdef, proconfig from pg_proc where proname = 'purge_soft_deleted';

-- ============================== B. Grants ====================================

-- B1. EXPECT: service_role (+postgres) ONLY.
select coalesce(g.rolname, 'PUBLIC') as grantee
from pg_proc p
cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
left join pg_roles g on g.oid = a.grantee
where p.proname = 'purge_soft_deleted'
order by 1;

-- ===================== C. Behavior — the actual proof =========================

-- C1. THE ONE THAT MATTERS: an account with no retained work must now actually
--     purge. Before 0024 this was impossible for every account — the signup
--     trigger's `user.create` row blocked it via NO ACTION.
--
--     Pick an account that owns nothing. As of 2026-08-04 that is
--     5a4a251b-…7ec01c (0 activities / classes / submissions / checks, 1 audit
--     row). Confirm your choice first:
--       select u.id,
--              (select count(*) from activities a where a.owner_id = u.id) as activities,
--              (select count(*) from submissions s where s.student_id = u.id) as submissions,
--              (select count(*) from section_checks c where c.student_id = u.id) as checks,
--              (select count(*) from audit_log al where al.actor_id = u.id) as audit_rows
--       from users u;
--
--     EXPECT: job ran | user_rows_left=0 | stamped=1 | null_actors_now=8
--       user_rows_left=0  → the account was genuinely deleted
--       stamped=1         → its audit row survived AND is marked actor_purged
--       null_actors_now   → one MORE than your current null-actor count, i.e.
--                           the purged actor's row nulled out as designed
--
--     The trailing RAISE guarantees the rollback. Do not remove it.
do $outer$
declare
  v_uid uuid := '5a4a251b-c39b-4980-b24d-9eb68f7ec01c';
  v_result text; v_before int; v_left int; v_stamped int; v_nulls int;
begin
  select count(*) into v_before from audit_log where actor_id = v_uid;
  update users set deleted_at = now() - interval '31 days' where id = v_uid;

  begin
    perform purge_soft_deleted();
    v_result := 'job ran';
  exception when others then
    v_result := 'ABORTED -> ' || SQLSTATE || ': ' || SQLERRM;
  end;

  select count(*) into v_left    from users     where id = v_uid;
  select count(*) into v_stamped from audit_log where metadata->>'actor_purged' = 'true';
  select count(*) into v_nulls   from audit_log where actor_id is null;

  raise exception
    'EXPECTED ROLLBACK >>> % | audit_rows_before=% | user_rows_left=% | stamped=% | null_actors_now=%',
    v_result, v_before, v_left, v_stamped, v_nulls;
end $outer$;

-- C2. Confirm C1 left nothing behind. EXPECT: your starting counts, and
--     stamped = 0 (the stamp only exists inside C1's rolled-back transaction).
select (select count(*) from users) as users,
       (select count(*) from users where deleted_at is not null) as soft_deleted,
       (select count(*) from audit_log) as audit_rows,
       (select count(*) from audit_log where actor_id is null) as null_actors,
       (select count(*) from audit_log where metadata->>'actor_purged' = 'true') as stamped;

-- ===================== D. Known-remaining, deliberately ======================

-- D1. Nothing sets users.deleted_at — there is still no soft-delete-student
--     flow, so the account clock never starts on its own and the purge stays
--     inert in practice. This is now the LAST gap between the retention policy
--     and reality; it lands with the S4/S7 purge-job work. EXPECT: 0
select count(*) as soft_deleted_accounts from users where deleted_at is not null;

-- D2. Three teacher-side FKs stay NO ACTION on purpose — they record an
--     administrative act by a named person, not routine activity, so an
--     account holding them is reported as blocked rather than silently
--     stripped. EXPECT: 3 rows, all NO ACTION.
select conname, case confdeltype when 'a' then 'NO ACTION' end as on_delete
from pg_constraint
where conname in ('allowlist_added_by_fkey', 'student_domain_added_by_fkey',
                  'classes_age_assertion_by_fkey')
order by conname;
