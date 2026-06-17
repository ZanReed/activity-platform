-- =============================================================================
-- 0008_soft_delete_activity.sql — soft-delete RPC for activities
-- -----------------------------------------------------------------------------
-- Why this exists: "deleting" an activity is a soft delete (set deleted_at).
-- A client-side `update activities set deleted_at = now()` CANNOT work under
-- RLS, even though the activities_update_own policy looks like it permits it.
-- PostgreSQL requires the *post-update* row to still satisfy the table's
-- SELECT policy, and activities_select_own gates on `deleted_at is null`.
-- Setting deleted_at makes the new row invisible to SELECT, so Postgres
-- rejects the whole UPDATE with "new row violates row-level security policy".
-- (publish_activity is unaffected because it never touches deleted_at — the
-- column the SELECT policy keys on.)
--
-- The fix mirrors publish_activity: a SECURITY DEFINER RPC, owned by a role
-- that bypasses RLS, authorized via can_edit_activity (owner of a live
-- activity). The strict SELECT policy stays intact, so soft-deleted rows
-- remain hidden from clients exactly as before.
create or replace function soft_delete_activity(p_activity_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Authorization — the same helper publish_activity uses. Returns false for
  -- non-owners, missing activities, and already-soft-deleted ones, so a
  -- double-delete surfaces as a clean error rather than a silent re-tombstone.
  if not can_edit_activity(p_activity_id) then
    raise exception 'Not authorized to delete this activity';
  end if;

  update activities
  set deleted_at = now(),
      updated_at = now()
  where id = p_activity_id;

  insert into audit_log (actor_id, action, target_type, target_id)
  values (auth.uid(), 'activity.delete', 'activity', p_activity_id);
end;
$$;

-- Authenticated users may call it; the function performs the ownership check
-- internally (mirrors the publish_activity grant).
grant execute on function soft_delete_activity(uuid) to authenticated;
