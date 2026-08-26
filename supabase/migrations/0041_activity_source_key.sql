-- =============================================================================
-- 0041_activity_source_key.sql — declared identity for catalogue files
-- -----------------------------------------------------------------------------
-- Plan + rulings: docs/design/curriculum-alignment.md (eng review + DX review
-- 2026-08-26, R1/R7-R19; builder-side agreement recorded the same day). This is
-- the whole database half of Lane A: ONE nullable column, ONE partial unique
-- index, and a narrowed comment on the column 0038 added.
--
-- WHY, AND WHY 0038 IS NOT ENOUGH. 0038 made `source_path` the batch importer's
-- identity, which was correct against the alternative it was weighed against
-- (`slug`, title-derived — see that migration's header). It has since met a
-- constraint from OUTSIDE this repo: the curriculum model the catalogue is
-- authored against says activities are DISPOSABLE — they get split, rewritten
-- and re-filed — while the chain that owns them is permanent. Under
-- path-identity every one of those normal editorial acts is destructive: the
-- old row is orphaned (0038 D2: reported, never followed), a new row is
-- created, and the published history is stranded on the row nobody points at
-- any more.
--
-- So the file declares its own identity instead:
--
--     ```meta
--     key: act.rate.unit-rate
--     ```
--
-- Minted once by the author, never changed, never reused after deletion. The
-- importer matches on it FIRST and falls back to `source_path` second.
--
-- ⚠ THE PATH FALLBACK IS NOT MERELY THE KEYLESS CASE, and reading it that way
-- breaks the cutover. It is also how a KEYED file adopts a row that predates
-- this column: the author adds `key:` with every path untouched, one run
-- matches each file by the path it still sits at, and the row records its key
-- by being matched. Only after that is the folder free to be reorganized. A
-- key-only matcher would have turned that first run into N creates and N
-- orphans — which is the exact damage this migration exists to prevent.
--
-- What `--strict` refuses is a file carrying NO key at all, so the catalogue
-- ends up provably keyed rather than habitually keyed.
--
-- ONE COLUMN, ONE MEANING — restated, because this migration adds a second
-- identity-shaped column and that is exactly the smell 0037's header warns
-- about. The two do not share a meaning:
--
--     source_key   IDENTITY.      Which activity this file IS.
--     source_path  ORGANIZATION.  Where the file currently sits, and therefore
--                                 the catalogue's teaching ORDER (the activities
--                                 list sorts unit groups by it). Rewritten on
--                                 every run; never matched on for a keyed file.
--
-- The column comment on `source_path` is narrowed below to say so. Its 0038
-- text — "Renaming the file on disk ORPHANS the row rather than following it" —
-- becomes FALSE for a keyed file the moment the importer ships, and a comment
-- that outlives its truth is this repo's most-documented defect class (P5:
-- retiring a claim means auditing every comment that cites it).
--
-- WHY NULLABLE, WHY THE INDEX IS PARTIAL. Same reasoning as 0038, and the same
-- shape deliberately: every activity authored in the app has no source file at
-- all, NULL is that state, and it is the common one. `deleted_at is null` is in
-- the predicate for 0038's reason — soft-deleting an imported activity and
-- re-importing its file must CREATE a fresh row rather than collide with the
-- tombstone, because that is the author's undo and it has to work.
--
-- ⚠ THAT PREDICATE IS ALSO A TRAP THE IMPORTER MUST COVER, NOT THE DATABASE.
-- Because tombstones are excluded, a key belonging to a DELETED activity does
-- not collide — it silently mints a fresh-looking row. The builder's commitment
-- is "keys are never reused after deletion", and a commitment nothing checks is
-- a commitment that decays. The check lives in the importer (it warns when a
-- key matches a soft-deleted row), NOT in this index: widening the index to
-- cover deleted rows would break the undo above, which is a real workflow, to
-- catch a mistake that is rare. Surface it, do not forbid it.
--
-- SECURITY: no new read or write surface. The owner-scoped RLS policies on
-- `activities` are row-level and cover columns added later; 0032's platform
-- grants are table-level, likewise. The batch importer runs author-side on a
-- service-role key, bypasses RLS entirely, and sets owner_id explicitly.
--
-- COMPLIANCE: none owed at the data-map's bar. `source_key` is an author-minted
-- catalogue id — activity metadata, not person-referencing — so it does not
-- match data-map-coverage.test.mjs's PERSON_COLUMN sweep, and `activities` was
-- already in the map via owner_id. The doc's stated range still moves to 0041
-- with an explicit "adds no personal data" note (the 0027 / 0035 / 0038
-- precedent), which is that test's third assertion.
-- =============================================================================

-- @section A-source-key

alter table activities
  add column source_key text;

comment on column activities.source_key is
  'Declared file identity for the batch importer (docs/design/'
  'curriculum-alignment.md R1): the activity''s permanent key, authored as '
  '`key:` in the file''s ```meta fence, e.g. "act.rate.unit-rate". Minted once, '
  'never changed, never reused after deletion. NULL for every activity not '
  'created from a catalogue file, which is the normal case for anything '
  'authored in the app. Never shown to a student and never part of a URL. '
  'MOVING OR RENAMING A KEYED FILE NO LONGER ORPHANS ITS ROW -- the importer '
  'matches on this column first and rewrites source_path to wherever the file '
  'now sits.';

-- @section B-uniqueness

-- Within one owner, one key is one activity. Partial on BOTH clauses, for the
-- reasons in the header -- and see the trap note there for why the importer,
-- not this index, owns the reused-key-after-delete case.
create unique index activities_owner_source_key_key
  on activities (owner_id, source_key)
  where source_key is not null and deleted_at is null;

-- @section C-narrow-the-source-path-comment

-- Not a schema change: 0038's column stands exactly as it was. Only its stated
-- MEANING narrows, from "identity" to "organization + ordering", because the
-- importer that ships alongside this migration stops matching on it for any
-- file that carries a key. See the header.
comment on column activities.source_path is
  'Catalogue ORGANIZATION for the batch importer, and the source of the '
  'activities list''s teaching order (docs/design/curriculum-alignment.md R7/'
  'R16): the activity''s path RELATIVE to the catalogue folder root, e.g. '
  '"01-chain.rate.proportional/01-unit-rate.md". Rewritten on every import to '
  'wherever the file now sits. NULL for every activity not created from a file. '
  '⚠ THIS COLUMN IS NO LONGER IDENTITY. It was, under 0038, whose comment said '
  'a rename orphans the row; that is true ONLY for a file carrying no `key:` '
  '(see activities.source_key), which --strict refuses. Identity is source_key; '
  'this column says where the file lives and what order it teaches in.';
