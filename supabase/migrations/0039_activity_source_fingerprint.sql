-- =============================================================================
-- 0039_activity_source_fingerprint.sql — the batch importer's drift guard
-- -----------------------------------------------------------------------------
-- Plan + rulings: docs/design/table-block.md (eng review 2026-08-21, D7.4).
-- ONE nullable column. Nothing else changes.
--
-- WHAT IT IS FOR. The importer's contract is "THE FILE WINS": re-running it
-- overwrites `draft_content` from the .md file. That is the property the whole
-- catalogue workflow rests on, and it has one sharp edge — an activity edited
-- IN THE APP after import is silently clobbered by the next run. Until now the
-- only thing standing between the author and that loss was a sentence in a
-- design doc telling them not to do it. Over a 150-activity catalogue authored
-- across weeks, a prose rule with no mechanism is a rule that gets broken; this
-- repo has a policy about exactly that (P3 — a dormant safeguard needs a
-- liveness proof) and a memory of it happening (guards bound to output).
--
-- HOW IT WORKS. The importer stores a hash of the draft IT WROTE. On the next
-- run it hashes the draft that is THERE NOW: equal means nobody touched it and
-- the file may win; different means someone edited it in the app, and the
-- importer refuses that one file (naming it) unless `--force` is passed.
--
-- WHY THE HASH IS OF THE STORED DRAFT AND NOT OF THE FILE. `tiptapToActivity`
-- mints fresh UUIDs on every call, so the document built from an unchanged file
-- differs from the stored one on every run — CLAUDE.md says it outright ("Don't
-- diff serialized ActivityDocuments... fingerprint Tiptap JSON instead"). This
-- column sidesteps that entirely by never comparing file-derived to stored: it
-- compares stored-now against stored-as-the-importer-left-it, so id churn is
-- invisible to it. The hash is taken over a KEY-SORTED serialization because
-- `jsonb` does not preserve key order — a fingerprint that ignored that would
-- report drift on every row, every run, and be turned off within a day.
--
-- WHY NULLABLE. NULL means "no fingerprint recorded yet": every row that exists
-- today, and every hand-authored activity forever. The importer treats NULL as
-- "cannot tell — allow, and record one now", so the guard arms itself on the
-- first re-import rather than blocking a catalogue that predates it. A row with
-- no `source_path` never gets one at all; it is not the importer's to guard.
--
-- NOT A UNIQUENESS KEY, so no index: nothing looks a row up by fingerprint. It
-- is read only alongside the row the importer already fetched by source_path,
-- which `activities_owner_source_path_key` (0038) already indexes.
--
-- SECURITY: no new read or write surface — same posture as 0038. The existing
-- owner-scoped RLS policies are row-level and cover columns added later; the
-- importer runs author-side on a service-role key.
--
-- COMPLIANCE: none owed at the data-map's bar. A hash of an activity's own
-- content is not person-referencing (it does not match
-- data-map-coverage.test.mjs's PERSON_COLUMN sweep), and `activities` is
-- already in the map via owner_id. The doc's stated range moves to 0039 with an
-- explicit "adds no personal data" note, per the 0027 / 0035 / 0038 precedent.
-- =============================================================================

-- @section A-source-fingerprint

alter table activities
  add column source_fingerprint text;

comment on column activities.source_fingerprint is
  'Batch-importer drift guard (docs/design/table-block.md D7.4): sha256 of the '
  'key-sorted draft_content the importer last WROTE for this row. On the next '
  'run the importer hashes the draft that is there now -- a mismatch means the '
  'activity was edited in the app since the import, so the file no longer wins '
  'without --force. Key-sorted because jsonb does not preserve key order. NULL '
  'means no fingerprint recorded yet (every pre-0039 row, and every activity '
  'authored in the app); the importer allows those and records one, so the '
  'guard arms itself on first re-import. Never read by the app or a student.';
