-- =============================================================================
-- 0038_activity_source_path.sql — file identity for the batch importer
-- -----------------------------------------------------------------------------
-- Plan + rulings: docs/design/batch-importer.md (eng review 2026-08-20, D1-D4).
-- This is the whole database half of the batch-importer slice: ONE nullable
-- column and ONE partial unique index. Nothing else changes.
--
-- WHY A COLUMN AT ALL (ruling D1). The importer's defining property is that
-- re-running it UPDATES rather than duplicates — that is what turns a format
-- bug from a 150-file archaeology session into a re-run. That property needs a
-- stable identity for "the same activity, re-imported", and before this
-- migration the table had nowhere to put one: the only unique key is
-- `unique (owner_id, slug)`.
--
-- THE ALTERNATIVE THAT WAS REJECTED, and the failure that killed it: reusing
-- `slug`, derived from the filename. It needs no migration, and it is wrong for
-- a reason this repo has already written down. 0037's own header says it:
-- "One column, one meaning. Do not add a second writer." `slug` is TITLE-derived
-- (packages/app/src/lib/slug.ts, minted once at create by Activities.tsx and
-- frozen thereafter). Deriving it from a FILENAME instead gives the column two
-- meanings and one namespace, and the collision is silent data loss on the
-- author's own work: a hand-authored activity titled "Factoring Quadratics"
-- already owns the slug `factoring-quadratics`, so importing
-- `factoring-quadratics.md` would overwrite ITS draft_content with no warning
-- and no way to tell afterwards. A file-identity column cannot do that, because
-- a hand-made activity has no source_path at all.
--
-- WHY NULLABLE, AND WHY THE INDEX IS PARTIAL. Every activity that already
-- exists — and every one made by hand from now on — has no source file. NULL is
-- that state, and it is the common one. A partial unique index lets any number
-- of rows hold NULL while still guaranteeing that within one owner, one file
-- path maps to at most one activity. (A plain unique index would also permit
-- many NULLs in Postgres, but saying `where source_path is not null` makes the
-- intent readable and keeps the index off the rows that will never use it.)
--
-- `deleted_at is null` is in the predicate DELIBERATELY, and it is the one
-- place this index departs from `unique (owner_id, slug)` — which is NOT
-- partial, so a soft-deleted row keeps its slug the whole time (0012 relies on
-- exactly that to make restore_activity conflict-free). The opposite is right
-- here: soft-deleting an imported activity and then re-importing its file must
-- CREATE a fresh row, not collide with the tombstone. Deleting in the app and
-- re-running the importer is the author's undo, and it has to work.
--
-- SECURITY: no new read or write surface. The existing owner-scoped RLS
-- policies on activities are row-level and cover columns added later; 0032's
-- platform-default grants are table-level, likewise. The batch importer itself
-- runs author-side on a service-role key, which bypasses RLS entirely and must
-- therefore set owner_id explicitly — it does (see scripts/batch-import.mjs).
--
-- COMPLIANCE: none owed at the data-map's own bar. `source_path` is a relative
-- FILE PATH inside the author's own catalogue folder — activity metadata, not
-- person-referencing — so it does not match data-map-coverage.test.mjs's
-- PERSON_COLUMN sweep, and `activities` was already in the map via owner_id.
-- The doc's stated migration range still moves to 0038 with a note saying this
-- migration touched no personal-data column (the 0027 / 0035 precedent), which
-- is what that test's third assertion is actually checking.
-- =============================================================================

-- @section A-source-path

alter table activities
  add column source_path text;

comment on column activities.source_path is
  'File identity for the batch importer (docs/design/batch-importer.md D1): the '
  'activity''s path RELATIVE to the catalogue folder root, e.g. '
  '"unit-3/factoring-quadratics.md". NULL for every activity not created from a '
  'file, which is the normal case for anything authored in the app. Never shown '
  'to a student and never part of a URL -- the share link is the viewer URL '
  'built from the activity id. Renaming the file on disk ORPHANS the row rather '
  'than following it; the importer reports orphans and changes nothing (D2).';

-- @section B-uniqueness

-- The whole point of the column: within one owner, one file path is one
-- activity, so a re-run updates. Partial on BOTH clauses -- see the header for
-- why `deleted_at is null` is right here and wrong for the slug constraint.
create unique index activities_owner_source_path_key
  on activities (owner_id, source_path)
  where source_path is not null and deleted_at is null;

comment on index activities_owner_source_path_key is
  'Makes the batch importer''s upsert an UPSERT. Partial so the (many) rows with '
  'no source file are unconstrained, and so soft-deleting an imported activity '
  'frees its path for a clean re-import (the author''s undo).';
