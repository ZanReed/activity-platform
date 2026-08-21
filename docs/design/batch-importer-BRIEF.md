# Batch importer — handoff brief (not yet designed)

**Status:** ⚰️ **SUPERSEDED 2026-08-20 by [batch-importer.md](batch-importer.md)** — the
slice is BUILT and proven live. This brief is kept for its trap list, which held up.

> ⚠ **ONE OF THIS BRIEF'S "DO NOT RE-DERIVE" CLAIMS WAS FALSE, and it is the one
> below marked verified.** "The pipeline exists and is node-safe (verified)" did
> not survive a real node bundle: `lib/markdownToTiptap.ts` and (via
> `serialize.ts`) `editor/mathPromptSync.ts` both imported the
> `@activity/graph-kit` BARREL, whose transitive
> `import { MathfieldElement } from 'mathlive'` does not exist in mathlive's
> node/SSR build — four hard esbuild errors. The app suite was green about it
> because vitest resolves through Vite, which takes mathlive's *browser*
> condition and externalizes `node_modules`.
>
> Fixed with two graph-kit subpath exports; guarded by
> `scripts/tests/batch-import.test.mjs` §A, which bundles for node and RUNS the
> pipeline rather than grepping for an import string.
>
> **The generalisable lesson, now a memory and a STATE note:** a claim that
> crosses a session boundary has no test attached to it. When a handoff says
> "inherited — do NOT re-derive", the first job is to make each claim
> falsifiable in the environment the new code will actually run in. Two minutes
> of `esbuild --platform=node` would have caught this before anything was built
> on top of it.

> Written 2026-08-20 at the end of the numbering session, as the paste-able
> starting point for the next one. **This is a brief, not a plan.** It carries
> the decisions already made so they are not re-derived, and names the one
> decision that must be ruled before any code is written.

## The task

A node script over a folder of `.md` files → the activities table, so the folder
is the source of truth for the ~150-activity catalogue. Re-running it UPDATES
rather than duplicates. That property is the whole point: it turns a format bug
from a 150-file archaeology session into a re-run.

Plus a second, smaller piece agreed at the same time: **the Import dialog's
summary line must report what the ` ```meta ` fence read.** It currently reports
blocks only, so an author cannot see whether course/unit/tags/role landed.

## Inherited — do NOT re-derive

- **The pipeline exists and is node-safe (verified).**
  `getMarkdownImporter()` (`packages/app/src/lib/markdownToTiptap.ts`) →
  `wrapBlocksStrict()` (`packages/app/src/editor/strictGrid.ts`) →
  `tiptapToActivity()` (`packages/app/src/lib/serialize.ts`) → upsert.
  The conversion path is DOM-free. `applyImportedMeta()`
  (`packages/app/src/lib/applyImportedMeta.ts`) carries the ` ```meta ` fence's
  NEVER-CLOBBER merge rule (ruling D16) — reuse it; do not write a second merge.
- **The import format is the contract**, and it is already three-artifact
  guarded: `docs/markdown-import-format.md`, `MARKDOWN_IMPORT_AI_PROMPT`, and
  `importFormatRegistry.ts`. A new fence key means all three move in one commit.
- **Publishing is a direct `publish_activity` RPC** from `usePublish` — there is
  no publish Edge Function. Decide explicitly whether the batch script publishes
  or only writes drafts.
- **`pnpm verify` is the definition of done** — it runs CI's whole check job.

## ⚠ THE DECISION THAT MUST BE RULED FIRST

**"Upsert keyed on filename" has nowhere to go.** Verified against the live
database 2026-08-20: `activities` has
`id, owner_id, title, slug, course, unit, status, visibility, current_version_id,
draft_content, description, is_for_sale, price_cents, created_at, updated_at,
deleted_at, pedagogical_role, tags`. **There is no filename/source column.** The
only unique key is `unique (owner_id, slug)`.

So the identity of "the same activity, re-imported" is undecided:

- **(a) Reuse `slug`, derived from the filename.** No migration. But `slug` is
  currently title-derived and user-facing, so renaming an activity's title —
  or two files producing the same slug — silently collides or orphans.
- **(b) Add a `source_path` column with its own unique index.** Honest identity,
  survives retitling. **Costs a migration**, which drags in the ordering rules:
  the migration is applied live BEFORE any code that reads the column is pushed
  (CLAUDE.md, and OV-7 — a push to `main` IS a deploy, because Pages
  auto-deploys). Also a compliance-pack question: a new column on a table
  holding teacher-owned rows may touch `docs/compliance/data-map.md`, which has
  its own coverage test.

Do not start coding until this is ruled. It determines whether the slice needs a
migration at all, and therefore its whole deploy shape.

## Traps this repo has already paid for — inherit them

1. **A hand-maintained list will be forgotten.** Twice this month: the
   renderer's per-type numbering grid, and `LABELED_BLOCK_TYPES`. If the
   importer needs a set of anything, DERIVE it from the schema or guard it.
2. **A guard that compares two declarations outlives the implementation.** The
   registry declared `numbered` for four months while nothing rendered it, with
   a green suite. Bind guards to OUTPUT.
3. **The save path is where fields die silently.** Any new field must survive
   import → save → **reload → resave**; a test that stops at the Tiptap doc
   cannot see the failure. This killed the `problem` block and nearly killed
   `answer`.
4. **Two deploy surfaces can disagree.** Edge Functions deploy from local source
   via the CLI; the SPA deploys from `main` via Pages. The answer-key liveness
   proof was untestable for an hour because of exactly this.
5. **Derive "is a migration/bundle owed" from the CLAUDE.md rule list, not from
   how big the change feels.** A one-line zod tweak is a bundle event.

## Open questions the design pass should answer

- Publish, or draft-only? (Publishing 150 activities is a one-way-ish act.)
- What happens to an activity whose `.md` file is DELETED — orphan, archive,
  or ignore? Silence here is how a stale activity survives forever.
- Dry-run mode? For 150 files, a `--dry-run` that reports what WOULD change is
  the difference between a confident run and a hopeful one.
- Failure policy: does one malformed file abort the batch or get skipped and
  reported? (The repo's house style is "surface, never drop".)
- Where does the folder live, and is it in this repo or outside it?

## Suggested first move

`/plan-eng-review` on this brief. The scope gate will force the identity
decision above, which is the one thing that cannot be deferred.
