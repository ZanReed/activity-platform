-- =============================================================================
-- verify-0024.sql — an account's audit trail no longer blocks its purge (0024)
-- -----------------------------------------------------------------------------
-- PORTED TO THE RUNNER 2026-11-26 (code review E3), against TODAY's
-- purge_soft_deleted. Run with
-- `pnpm verify:auth --target live|local --only verify-0024`.
--
-- Posture and grants (the original's A3/A4 and B1) are no longer repeated:
-- verify-0022's A-shape checks them for the same function.
-- RETIRED in the port: D1 ("nothing sets users.deleted_at"), a data claim
-- with an expiry date. The original §C named one live account by uuid; the
-- port builds its own instead.
--
-- §C runs the REAL purge inside a transaction that always ends in a raise:
-- marked @local-only (review B5).
-- =============================================================================

-- @section A-schema
-- @expect-rows
select 'actor_fk_sets_null',
       (select confdeltype from pg_constraint where conname = 'audit_log_actor_id_fkey') = 'n',
       'audit_log.actor_id is ON DELETE SET NULL';
select 'actor_id_nullable',
       (select is_nullable from information_schema.columns
         where table_schema = 'public' and table_name = 'audit_log'
           and column_name = 'actor_id') = 'YES',
       'audit_log.actor_id is nullable, which SET NULL needs';
select 'audit_left_the_guard_and_stamps',
       strpos(prosrc, 'from audit_log        x') = 0 and strpos(prosrc, 'actor_purged') > 0,
       'audit rows no longer block an account; the purged actor''s rows are stamped actor_purged'
from pg_proc where proname = 'purge_soft_deleted';
-- Three teacher-side FKs stay NO ACTION on purpose: they record an
-- administrative act by a named person, so holding one blocks the purge.
select 'admin_fks_no_action',
       (select count(*) from pg_constraint
         where conname in ('allowlist_added_by_fkey', 'student_domain_added_by_fkey',
                           'classes_age_assertion_by_fkey')
           and confdeltype = 'a') = 3,
       'allowlist.added_by, student_domain.added_by, classes.age_assertion_by are NO ACTION';

-- @section C-unblocked-account-purges
-- @expect-error VERIFY-0024 PASS
-- @local-only
-- An account that owns nothing but has an audit row must now really purge,
-- and its audit row must survive, nulled and stamped.
do $vfy$
declare
  v_u uuid := gen_random_uuid();
  v_audit bigint;
  v_result text; v_left int; v_actor uuid; v_stamp text; v_audit_left int;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_u, 'vfy0024-1@vfy0024.example', '{}'::jsonb);
  update users set role = 'student' where id = v_u;
  insert into audit_log (actor_id, action, metadata)
  values (v_u, 'user.create', '{"vfy0024": true}'::jsonb) returning id into v_audit;
  update users set deleted_at = now() - interval '31 days' where id = v_u;

  begin
    perform purge_soft_deleted();
    v_result := 'job ran';
  exception when others then
    v_result := 'ABORTED -> ' || SQLSTATE || ': ' || SQLERRM;
  end;

  select count(*) into v_left from users where id = v_u;
  select count(*), max(actor_id::text)::uuid, max(metadata->>'actor_purged')
    into v_audit_left, v_actor, v_stamp
    from audit_log where id = v_audit;
  if v_result = 'job ran' and v_left = 0 and v_audit_left = 1 and v_actor is null and v_stamp = 'true' then
    raise exception 'VERIFY-0024 PASS (rolled back) >>> % | user_rows_left=% | audit_row_kept=% | actor_nulled=% | stamped=%',
      v_result, v_left, v_audit_left, v_actor is null, v_stamp;
  end if;
  raise exception 'VERIFY-0024 FAIL (rolled back) >>> % | user_rows_left=% | audit_row_kept=% | actor_nulled=% | stamped=%',
    v_result, v_left, v_audit_left, v_actor is null, v_stamp;
end $vfy$;

-- @section D-residue
-- @expect-rows
select 'no_fixture_residue',
       (select count(*) from users where email like '%@vfy0024.example') = 0
       and (select count(*) from audit_log where metadata ? 'vfy0024') = 0,
       'the purge proof left nothing behind';
