-- =============================================================================
-- verify-0023.sql — account purge deletes auth.users and skips blocked
-- accounts instead of aborting (0023)
-- -----------------------------------------------------------------------------
-- PORTED TO THE RUNNER 2026-11-26 (code review E3), against TODAY's
-- purge_soft_deleted. Run with
-- `pnpm verify:auth --target live|local --only verify-0023`.
--
-- Posture and grants (the original's A3/A4 and B1) are no longer repeated:
-- verify-0022's A-shape checks them for the same function.
-- RETIRED in the port, each superseded by a later migration:
--   - submissions.student_id = RESTRICT (B2): 0029 dropped the column.
--   - audit_log.actor_id = NO ACTION and "no account can ever purge" (B2, D1):
--     0024 made it SET NULL; verify-0024 proves an unblocked account purges.
--   - "nothing sets users.deleted_at" (D2): a data claim with an expiry date.
--
-- §C runs the REAL purge with every account marked deleted, inside a
-- transaction that always ends in a raise: @local-only (review B5).
-- =============================================================================

-- @section A-shape
-- @expect-rows
-- Deleting public.users stranded the Google identity; deleting auth.users
-- takes public.users and its children with it (users_id_fkey CASCADE).
select 'deletes_auth_row_not_public_users',
       strpos(prosrc, 'delete from auth.users') > 0
       and strpos(prosrc, 'delete from users where deleted_at') = 0,
       'the account step deletes auth.users, not public.users'
from pg_proc where proname = 'purge_soft_deleted';
-- A blocked account is skipped and counted, never fatal.
select 'blocked_accounts_skipped_and_counted',
       strpos(prosrc, 'continue') > 0 and strpos(prosrc, 'accounts blocked') > 0,
       'the per-account loop continues past a blocked account and reports the count'
from pg_proc where proname = 'purge_soft_deleted';
select 'fk_layout',
       (select confdeltype from pg_constraint where conname = 'section_checks_student_id_fkey') = 'c'
       and (select confdeltype from pg_constraint where conname = 'users_id_fkey') = 'c'
       and (select confdeltype from pg_constraint where conname = 'audit_log_actor_id_fkey') = 'n',
       'section_checks.student_id CASCADE; users.id -> auth.users CASCADE; audit_log.actor_id SET NULL (0024)';

-- @section C-every-account-marked
-- @expect-error VERIFY-0023 PASS
-- @local-only
-- Worst case: every account past its window at once. Before 0023 the first
-- blocked account (one that owns an activity) aborted the whole nightly run
-- with 23503 on activities_owner_id_fkey. Now the job must complete. A
-- fixture teacher who owns an activity guarantees at least one blocked
-- account, so the case is never vacuous.
do $vfy$
declare
  v_t uuid := gen_random_uuid();
  v_result text; v_blocked_left int;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_t, 'vfy0023-1@vfy0023.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_t;
  insert into activities (owner_id, title, slug)
  values (v_t, 'vfy 0023', 'vfy-0023-' || substr(gen_random_uuid()::text, 1, 8));
  update users set deleted_at = now() - interval '31 days';

  begin
    perform purge_soft_deleted();
    v_result := 'job SURVIVED (no abort)';
  exception when others then
    v_result := 'job ABORTED -> ' || SQLSTATE || ': ' || SQLERRM;
  end;

  select count(*) into v_blocked_left from users where id = v_t;
  if v_result = 'job SURVIVED (no abort)' and v_blocked_left = 1 then
    raise exception 'VERIFY-0023 PASS (rolled back) >>> % | blocked fixture teacher kept=%', v_result, v_blocked_left;
  end if;
  raise exception 'VERIFY-0023 FAIL (rolled back) >>> % | blocked fixture teacher kept=%', v_result, v_blocked_left;
end $vfy$;

-- @section D-residue
-- @expect-rows
select 'no_fixture_residue',
       (select count(*) from users where email like '%@vfy0023.example') = 0,
       'the every-account run left nothing behind';
