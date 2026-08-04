-- =============================================================================
-- 0024_audit_actor_purge.sql — an audit event outlives the account that made it
-- -----------------------------------------------------------------------------
-- RULING 2026-08-04 (author): when an account is purged, its audit rows STAY
-- for their own 2-year security window, but stop naming a person. The FK
-- becomes ON DELETE SET NULL and the purge job stamps the surviving rows so a
-- purged actor is still distinguishable from one that was never attributed.
--
-- This unblocks account deletion entirely. Before it, NO account could be
-- purged at all: audit_log.actor_id was NO ACTION and the signup trigger
-- writes a `user.create` row for every account, so every account was
-- permanently blocked by its own audit trail (verified live 2026-08-04: 3
-- accounts, 3 blocked). 0023 made that visible and non-fatal; this closes it.
--
-- Why SET NULL rather than the alternatives (full reasoning in DECISIONS.md →
-- "An audit event outlives the account that made it"):
--
--   * CASCADE (audit rows die with the account) would make audit_log's own
--     2-year window untrue for any purged actor, and turn account deletion
--     into an evidence-erasure path — which matters because privacy-policy.md
--     offers deletion on request.
--   * Making the account wait out the 2-year audit window would keep a real
--     name and email ~18 months longer than the work that justified keeping
--     the account at all, purely so the OPERATOR's security log stays
--     attributable. That inverts data minimization. It is also a different
--     case from the 0023 work ruling: there the identity was required by the
--     purpose (attributable school records); here the purpose — security
--     review — is mostly served by the event itself (what, when, to what
--     target, from what ip_hash), and attribution is retained for the entire
--     time the person is connected to the system, degrading only after full
--     purge, which per 0023 is 400+ days after they left.
--
-- The anti-abuse loss is small and bounded: purge requires 30 days past
-- account soft-delete AND no retained work, so an abusive actor cannot erase
-- their attribution quickly, and ip_hash is scrubbed at 30 days regardless.

-- -----------------------------------------------------------------------------
-- 1. The FK: NO ACTION -> SET NULL
-- -----------------------------------------------------------------------------
-- actor_id is ALREADY nullable (verified: information_schema says YES), so no
-- column change is needed — only the delete rule. Idempotent: safe to re-run.
alter table audit_log drop constraint if exists audit_log_actor_id_fkey;
alter table audit_log
  add constraint audit_log_actor_id_fkey
  foreign key (actor_id) references users(id) on delete set null;

-- -----------------------------------------------------------------------------
-- 2. purge_soft_deleted — stamp before deleting, and stop treating audit as a
--    blocker
-- -----------------------------------------------------------------------------
-- Two changes from 0023: audit_log leaves the eligibility guard (it no longer
-- blocks), and the loop stamps the actor's rows BEFORE the delete — after it,
-- SET NULL has already fired and the rows can no longer be found by actor_id.
--
-- WHY THE STAMP: NULL actor_id is ALREADY meaningful — 7 rows carry it today
-- for genuinely unattributed events (anonymous `submission.create` from
-- published pages). Without the stamp, purging would silently merge "no
-- account did this" with "an account did this and was later purged", which are
-- different facts to a security reviewer. metadata is jsonb and nullable, so
-- the stamp needs no schema change.
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

  -- 2. Submissions linked to deleted assignments
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

  -- 6. Section checks belonging to accounts past their window and otherwise
  --    clear. Explicit rather than riding the FK cascade, so destroying student
  --    work is a counted act (2026-08-04 compliance finding).
  delete from section_checks sc
   where sc.student_id in (
     select u.id from users u
      where u.deleted_at < now() - interval '30 days'
        and not exists (select 1 from submissions s where s.student_id = u.id)
   );
  get diagnostics v_checks_student = row_count;

  -- 7. Accounts. The 0023 precedence still governs: eligible only once the
  --    window has elapsed AND no work is retained AND nothing else references
  --    the row. audit_log is NO LONGER in this guard — 0024 made it SET NULL.
  for v_uid in
    select u.id from users u
     where u.deleted_at < now() - interval '30 days'
     order by u.deleted_at
  loop
    if exists (select 1 from submissions      x where x.student_id = v_uid)
    or exists (select 1 from section_checks   x where x.student_id = v_uid)
    or exists (select 1 from activities       x where x.owner_id   = v_uid)
    or exists (select 1 from activity_versions x where x.created_by = v_uid)
    or exists (select 1 from assignments      x where x.teacher_id = v_uid)
    or exists (select 1 from classes          x where x.teacher_id = v_uid
                                                   or x.age_assertion_by = v_uid)
    or exists (select 1 from grades           x where x.graded_by  = v_uid)
    or exists (select 1 from allowlist        x where x.added_by   = v_uid)
    or exists (select 1 from student_domain   x where x.added_by   = v_uid)
    then
      -- Still-referenced accounts wait, and are reported rather than fatal.
      -- (allowlist / student_domain / age_assertion_by are teacher-side
      -- residue and remain NO ACTION deliberately — they record an
      -- administrative act by a named person, not routine activity.)
      v_blocked := v_blocked + 1;
      continue;
    end if;

    -- Mark this actor's audit rows BEFORE the delete. Afterwards SET NULL has
    -- fired and actor_id no longer identifies them.
    update audit_log
       set metadata = coalesce(metadata, '{}'::jsonb)
                      || jsonb_build_object('actor_purged', true)
     where actor_id = v_uid;

    -- Delete the AUTH row: public.users, class_members, and section_checks
    -- fall via CASCADE behind it; audit_log.actor_id goes NULL via 0024.
    delete from auth.users where id = v_uid;
    v_accounts := v_accounts + 1;
  end loop;

  raise notice
    'purge_soft_deleted: section_checks %+% (activity/student), accounts purged %, accounts blocked %',
    v_checks_activity, v_checks_student, v_accounts, v_blocked;
end;
$$;

-- =============================================================================
-- Verification — spot checks (scripts/verify-0024.sql is the full pass)
-- =============================================================================
--
-- -- 1. The delete rule changed. EXPECT: SET NULL
-- select case confdeltype when 'n' then 'SET NULL' when 'a' then 'NO ACTION'
--        when 'c' then 'CASCADE' end
-- from pg_constraint where conname = 'audit_log_actor_id_fkey';
--
-- -- 2. audit_log left the eligibility guard, and the stamp is present.
-- --    EXPECT: f / t
-- select strpos(prosrc, 'from audit_log        x') > 0 as still_blocks,
--        strpos(prosrc, 'actor_purged') > 0            as stamps_purged
-- from pg_proc where proname = 'purge_soft_deleted';
--
-- -- 3. Grants unchanged by REPLACE. EXPECT: service_role (+postgres) only.
-- select coalesce(g.rolname, 'PUBLIC') as grantee
-- from pg_proc p
-- cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
-- left join pg_roles g on g.oid = a.grantee
-- where p.proname = 'purge_soft_deleted';
