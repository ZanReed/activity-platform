-- =============================================================================
-- 0052_align_backfilled_keep_until.sql — checks opened before 0048 take their
--                                         class's school-year end
-- -----------------------------------------------------------------------------
-- The author's ruling of 2026-10-06 ("align them"), at step 4 of the
-- number-facts prune's arming checklist. Migration 0048 gave every check that
-- already existed the 400-day backstop (RP-8), because their classes had no
-- school-year end to copy. Once such a class HAS an end date, its old checks
-- were being kept ten months longer than the practice sessions beside them.
--
-- DATA ONLY, ONE-OFF, AND ONLY EVER SHORTER. A check is touched when:
--   - its keep_until is still exactly 0048's backfill (opened + 400 days), so
--     a check opened after 0048, with a date copied at open, is never touched;
--   - its class now has a school-year end; and
--   - that end + 30 days (RP-3) is EARLIER than what it holds.
-- A class with no end date keeps the backstop. Nothing is deleted: the prune
-- is still dry-run by default and unscheduled. No schema change, no personal
-- data.
-- =============================================================================

update class_probes p
   set keep_until = c.school_year_ends_on + 30
  from classes c
 where c.id = p.class_id
   and c.school_year_ends_on is not null
   and p.pruned_at is null
   and p.keep_until = (p.opened_at at time zone 'UTC')::date + 400
   and c.school_year_ends_on + 30 < p.keep_until;

-- The rule this leaves true (asserted here so a failed apply is loud):
do $$
begin
  if exists (
    select 1 from class_probes p join classes c on c.id = p.class_id
     where c.school_year_ends_on is not null and p.pruned_at is null
       and p.keep_until = (p.opened_at at time zone 'UTC')::date + 400
       and c.school_year_ends_on + 30 < p.keep_until) then
    raise exception '0052: a backfilled check still outlasts its class''s school-year end';
  end if;
end
$$;
