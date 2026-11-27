-- =============================================================================
-- 0110_activities_updated_at_stamp.sql — activities.updated_at on the SERVER's
-- clock (code review 2026-11-26, docs/reviews/2026-11-26-code-review.md C10)
-- -----------------------------------------------------------------------------
-- `activities.updated_at` is the editor's conflict token (G-8: a save only
-- lands over the row this tab last saw) and the order of My activities. Three
-- client writes stamped it from the BROWSER's clock (ActivityEditor's save,
-- ActivityPrint's print-settings write, discardDraft), so a laptop whose clock
-- is a day fast sorted its edits above everyone's for a day, and the token was
-- whatever that clock said. `classes` got a trigger stamp in 0027 for exactly
-- this reason; this is the same fix, with ONE difference:
--
--   0027 stamps EVERY update. Here that would be wrong: some writes leave
--   updated_at alone on purpose — the time estimate (`minutes`, PP-5: "it
--   would move G-8's conflict baseline under an open tab"), the importer's
--   move of a file (a move is not an edit), the provenance columns. So the
--   rule is the WRITER's: an UPDATE that changes updated_at — to any value —
--   gets now(); an UPDATE that leaves it alone keeps it. Every write that
--   bumped it before still bumps it, every write that did not still does not;
--   only the clock changes. An INSERT always gets now().
--
-- Clients keep sending a value (it is how a write asks for the stamp; the
-- value itself is discarded) and use the one `.select('updated_at')` returns.
--
-- NOT PERSONAL DATA: a timestamp on the teacher's own activity row, already
-- mapped (data map unchanged in content; range moves to 0110).
-- Verification: scripts/verify-0110.sql.
-- =============================================================================

create function set_activities_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or new.updated_at is distinct from old.updated_at then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

comment on function set_activities_updated_at() is
  'activities.updated_at on the server clock (0110, review C10): an INSERT, or an UPDATE that changes updated_at, gets now(); an UPDATE that leaves it alone keeps it (minutes, a file move).';

revoke execute on function set_activities_updated_at() from public, anon, authenticated;

create trigger activities_updated_at
  before insert or update on activities
  for each row execute function set_activities_updated_at();
