-- =============================================================================
-- 0012_restore_activity.sql — undo for a soft-deleted activity
-- -----------------------------------------------------------------------------
-- Pairs with soft_delete_activity (0008). The Activities list deletes
-- optimistically and offers a brief "Undo" — that Undo calls this RPC to clear
-- deleted_at, bringing the row back into view.
--
-- Why an RPC (same reasoning as soft_delete_activity, mirrored): a client-side
-- `update activities set deleted_at = null` is blocked by RLS from the other
-- direction. can_edit_activity — the helper soft_delete/publish authorize with
-- — gates on `deleted_at is null`, so it returns FALSE for the very rows we
-- need to restore. And activities_select_own hides soft-deleted rows from the
-- client entirely, so the UPDATE has no visible row to target. A SECURITY
-- DEFINER function with its own owner check is the only path.
--
-- Restorability window: purge_soft_deleted (0003) hard-deletes tombstones
-- older than 30 days. Past that the row is gone, so the owner check finds
-- nothing and the call raises cleanly — the UI's undo window is seconds, so
-- this is only ever hit by a stale client. No slug conflict is possible: the
-- `unique (owner_id, slug)` constraint is NOT partial, so a soft-deleted row
-- keeps its slug the whole time; clearing deleted_at reclaims a slug the row
-- never gave up.
-- =============================================================================

-- The audit vocabulary gains a restore action. ADD VALUE is transaction-safe
-- on PG 12+; the new value is only referenced inside the function body below
-- (stored, not executed at migration time), so the same-transaction-use
-- restriction does not apply — same structure as 0010's 'grade.upsert'.
alter type audit_action add value if not exists 'activity.restore';

create or replace function restore_activity(p_activity_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Owner check against a SOFT-DELETED row. can_edit_activity is unusable here
  -- (it requires deleted_at is null), so the ownership + tombstone test is
  -- inline. A non-owner, a missing/purged row, or a live (already-restored)
  -- row all fall through to the exception, so a double-undo or a stale client
  -- surfaces a clean error instead of silently touching the wrong row.
  if not exists (
    select 1 from activities
    where id = p_activity_id
      and owner_id = auth.uid()
      and deleted_at is not null
  ) then
    raise exception 'Activity is not restorable';
  end if;

  update activities
  set deleted_at = null,
      updated_at = now()
  where id = p_activity_id;

  insert into audit_log (actor_id, action, target_type, target_id)
  values (auth.uid(), 'activity.restore', 'activity', p_activity_id);
end;
$$;

-- Authenticated users may call it; the function performs the ownership check
-- internally (mirrors the soft_delete_activity grant).
grant execute on function restore_activity(uuid) to authenticated;
