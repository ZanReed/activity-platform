# Batch importer — a folder of `.md` files as the catalogue's source of truth

**Status:** ✅ **BUILT 2026-08-20** — Eng review the same day (D1–D5). Supersedes
[batch-importer-BRIEF.md](batch-importer-BRIEF.md), which was the handoff note
this slice started from — read the AS BUILT section below before trusting any
claim in it.

The author pre-authors the ~150-activity catalogue as markdown files in a folder
outside this repo. This slice makes that folder the source of truth: a node
script walks it, converts each file through the app's own importer pipeline, and
upserts into `activities`. Re-running UPDATES rather than duplicates — which is
the entire point, because it turns a format bug from a 150-file archaeology
session into a re-run.

Second, smaller deliverable, agreed at the same time: the Import dialog's summary
line now reports what the ` ```meta ` fence read.

---

## The pipeline

```
folder/**/*.md
   │  relative POSIX path  ─────────────────────────────┐  the identity (D1)
   ▼                                                    │
getMarkdownImporter()  →  ImportResult                  │
   │   { blocks, referencePanel?, meta?, warnings }      │
   │                                                    │
   ├─ .meta ──▶ CREATE: applyImportedMeta  (never-clobber, D16 — reused)
   │            UPDATE: the file wins, every change printed  (D5)
   ▼                                                    │
wrapBlocksStrict(blocks)                                │
   │      blocks → rows/columns doc                     │
   ▼                                                    │
tiptapToActivity(doc, meta, referencePanel?, calculator?)│
   │                                                    │
   ▼  ActivityDocument.safeParse()   ◀── the gate       │
   │                                                    │
   ▼                                                    │
┌───────────────────────────────────────────┐           │
│ existing row with this source_path?  ◀────┼───────────┘
│    yes → PATCH        no → POST + slug    │
└───────────────────────────────────────────┘
rows whose source_path is no longer on disk → REPORTED, never touched  (D2)
```

---

## The five rulings

### D1 — identity is `source_path`, not `slug`

Migration **0038** adds `activities.source_path` (text, nullable) and a partial
unique index `(owner_id, source_path) where source_path is not null and
deleted_at is null`.

The alternative — deriving a slug from the filename and keying on the existing
`unique (owner_id, slug)` — needs no migration and is wrong. `slug` is
**title**-derived and frozen at create ([slug.ts](../../packages/app/src/lib/slug.ts),
minted by `Activities.tsx:203`). Deriving it from a filename gives one column two
meanings in one namespace, which 0037's own header rules out in as many words:
*one column, one meaning; do not add a second writer.* The failure is not
theoretical and it is silent: a hand-authored activity titled "Factoring
Quadratics" already owns the slug `factoring-quadratics`, so importing
`factoring-quadratics.md` would overwrite **its** `draft_content` with no
warning and no way to tell afterwards.

The column being nullable is what makes the whole scheme safe. A row with a NULL
`source_path` was authored in the app, and `planIdentity` treats it as invisible
in **both** directions — never updated by a file, never reported as an orphan.
The importer can only touch rows it created.

`deleted_at is null` in the index predicate is the one place this departs from
the slug constraint, which is deliberately *not* partial so 0012's
`restore_activity` stays conflict-free. The opposite is right here: soft-deleting
an imported activity has to free its path, because "delete it in the app and
re-run" is the author's undo.

### D2 — a deleted `.md` file is reported, never acted on

Orphans are listed; nothing changes. "Surface, never drop" is the house style,
and a script that deletes teacher work on a filesystem inference is not something
this repo should own. Soft-deleting them was offered and declined.

### D3 — one bad file is skipped, not fatal

Every good file lands; bad ones are named with their error; the exit code is 1 so
a wrapper still knows the run was not clean. Aborting the batch would mean one
typo costs a re-run of 150.

### D4 — the pipeline is bundled on run, not committed

`scripts/batch-import.mjs` esbuild-bundles
[batchImportPipeline.ts](../../packages/app/src/lib/batchImportPipeline.ts) in
memory at startup (~1s) and imports the bytes.

The two committed bundles (`viewer-server`, `grading-server`) exist because Edge
Functions deploy *those exact bytes* and CI must stop a stale deploy from
shipping. This script has no deploy surface — it runs from a checkout — so a
third committed bundle plus a third CI drift guard would buy staleness protection
nothing here needs, and would add a step to every contributor's `pnpm verify`.

The seam lives in `packages/app/src/lib/` and not in `scripts/` for a boring but
load-bearing reason: there is no root tsconfig and no root eslint config —
`pnpm typecheck` and `pnpm lint` are both `pnpm -r` — so a `.ts` file under
`scripts/` is checked by nothing.

### D5 — on a re-import the file wins, and every change is printed

`applyImportedMeta`'s never-clobber rule (D16) is used for **creates only**,
which is exactly the case it was written for: every field is unset, so every
fence key lands, and the script and the editor's Import dialog agree about what a
fence means.

On an **update** the file wins. Never-clobber there would make the slice's
headline promise false: an author who fixes a title in the `.md` and re-runs
would have the fix refused forever, with only a warning nobody reads at line 140
of a 150-file run. The folder is the source of truth or it is not.

Three things bound what that costs:

1. Only rows with a non-NULL `source_path` are ever updated, and those exist
   because this script created them.
2. Every field the file changed is **printed**, per file, old value → new. An
   overwrite the author cannot see is the failure the printing exists to prevent.
3. A key **absent** from the fence leaves its field alone. "The file says
   otherwise" and "the file says nothing" are different, and only the first one
   writes.

Tags are the one field whose semantics flip between the two modes: they *union*
on create (D16's rule, since adding a tag cannot destroy one) and *replace* on
update, because removing a tag from the file has to remove it from the row.

---

## What it writes, and what it deliberately does not

The write payload **mirrors the app's own autosave**
(`ActivityEditor.tsx:542`) — `draft_content`, `title`, `tags`,
`pedagogical_role`, `updated_at` — plus `source_path` on create.

It does **not** write `course` / `unit`. Those columns are publish-truth (0037
ruling R1), stamped only by `publish_activity` from the published snapshot; a
second writer would let the catalog advertise a course name no student has been
served. The course and unit an author puts in a fence still land — in the
**document's** meta, where the editor reads them and where publish will stamp
them from.

A title-less file takes its name from the **filename**
(`unit-3/factoring-quadratics.md` → "Factoring Quadratics") rather than the
"Untitled activity" placeholder, which across 150 files would mean 150
identically-named rows and a slug ladder of `untitled-activity-2, -3, -4 …`. On
update a missing fence title keeps the row's title instead — re-deriving there
would rename an activity the moment someone deleted the title key.

## Publishing: not possible from here, and that is a fact, not a preference

`publish_activity` authorizes through `can_edit_activity`, which is
`owner_id = auth.uid()`. A service-role key has **no** `auth.uid()`, so the RPC
raises "Not authorized to publish this activity" — and `activity_versions
.created_by` is `not null` (0001:129), so even bypassing the check the insert
would fail. There is no email+password auth in this project, so a
non-interactive user JWT is not available either.

**The script writes drafts.** The author publishes from the app, which is also
the right home for a one-way-ish act on 150 activities.

---

## AS BUILT — what the brief got wrong

> **The brief's central "inherited, do NOT re-derive" claim was false.**
> "The pipeline exists and is node-safe (verified)" did not survive a real node
> bundle.

`lib/markdownToTiptap.ts` imported the `@activity/graph-kit` **barrel**, which
statically re-exports four modules that import `MathfieldElement` from mathlive —
a symbol mathlive's node/SSR build does not export. A second edge reached the
same place: `serialize.ts:106` → `editor/mathPromptSync.ts:21` → the barrel.

```
markdownToTiptap.ts:44  ──▶ '@activity/graph-kit' (BARREL) ──▶ mathlive ✗
serialize.ts:106 ──▶ mathPromptSync.ts:21 ──▶ '@activity/graph-kit' ──▶ mathlive ✗

esbuild --platform=node:
  packages/graph-kit/src/calculator.ts:19       ERROR: No matching export in
  packages/graph-kit/src/expression-list.ts:19  "mathlive/mathlive-ssr.min.mjs"
  packages/graph-kit/src/math-prompt-mount.ts:20 for import "MathfieldElement"
  packages/graph-kit/src/mathlive-setup.ts:31
```

This is the rule CLAUDE.md **already carries** for graph-kit's scorers,
generalised: *import graph-kit subpaths, never the barrel, in anything that runs
outside a browser.* The fix is two new subpath exports (`./formula`,
`./math-prompt-convert`) and two import lines.

**Why the suite was green about something that could not work.** The app's
vitest config sets no `environment`, so it runs in node — but resolves through
**Vite**, which takes mathlive's *browser* condition and externalizes
`node_modules`. Bare node takes the SSR condition. That is the sw-lane lesson
from STATE.md a second time: *a lane that passes because of what is absent from
the machine is not passing, it is unobserved.*

**The guard is bound to output, not to a declaration.**
`scripts/tests/batch-import.test.mjs` §A does not grep for the barrel string — a
guard comparing two declarations outlives the implementation, which is how the
registry declared `numbered` for four months while nothing rendered it. §A
esbuild-bundles the pipeline for node, imports the bytes, and converts real
markdown into a document that must pass zod. Any future import that re-breaks
node goes red for the right reason.

---

## NOT in scope

- **Publishing.** Mechanically blocked (see above); the author publishes from the
  app.
- **Deleting or archiving orphans.** D2 — reported only.
- **Following a renamed file.** A rename orphans the old row and creates a new
  one. Detecting it would mean content-hash matching, which is a guess; the
  orphan report makes the situation visible and the author resolves it. Revisit
  only if it actually bites.
- **A committed bundle + CI drift guard for the importer.** D4.
- **Watch mode / CI-driven import.** The author runs this deliberately; a
  scheduled importer would be a write path nobody is watching.
- **Bulk-upsert in one request.** Per-row decisions are required anyway (the
  merge needs each row's current state), and 150 rows is not a performance
  problem. `POST` with `merge-duplicates` would also clobber titles.

## What already exists, and is reused rather than rebuilt

| Piece | Where | Reused how |
|---|---|---|
| markdown → Tiptap | `lib/markdownToTiptap.ts` | called directly through the seam |
| ` ```meta ` merge | `lib/applyImportedMeta.ts` | used verbatim for creates; **no second merge was written** |
| blocks → grid doc | `editor/strictGrid.ts` | called directly |
| Tiptap → document | `lib/serialize.ts` | called directly, incl. `tiptapToReferencePanel` |
| slug minting + collision ladder | `lib/slug.ts` | same functions, same 23505 retry as `Activities.tsx` |
| tag normalisation | `lib/normalizeTags.ts` | called directly |
| document validation | `@activity/schema` `ActivityDocument` | the pre-write gate |
| service-role script conventions | `scripts/backfill-census.js` | `.env.supabase`, PostgREST over fetch, dry-run flag |

## Deploy shape

1. **Author applies 0038** (`supabase db push`), then
   `pnpm verify:auth --target live --only verify-0038`.
2. Pushing to `main` is safe in either order: **no SPA code reads
   `source_path`**, so OV-7's "a push is a deploy" does not bite here. Run
   before the migration and the script fails loudly on a missing column.
3. **No Edge Function deploy, no bundle regeneration.** Nothing in the schema
   package, the viewer's sanitize/registry source, the viewer server or
   graph-kit's scorers changed — checked against CLAUDE.md's rule list, not
   against how big the change felt. Both drift guards pass.
4. **Compliance:** `data-map.md` moves to `2026-08-20-draft-5` / range 0038 with
   an explicit "adds no personal data" note (the 0027/0035 precedent).
   `retention-policy.md` needs nothing — no new table, no student-derived rows.

## Test coverage

`scripts/tests/batch-import.test.mjs` — 15 rows, node:test, no database:

| § | What it pins |
|---|---|
| A | the pipeline bundles for node and converts end to end · **import → save → reload → resave** (the brief's trap 3) · an empty file throws rather than writing |
| B | create takes the fence · update lets the file win **and names every change** · an absent key changes nothing · **editor-only settings (print/typography) survive a re-import** · filename title fallback, both directions |
| C | create/update/orphan split · **a hand-authored row is invisible in both directions** · POSIX paths, sorted, dot-dirs skipped |
| D | the change report renders |

`packages/app/src/__tests__/importMetaSummary.test.ts` — 8 rows. The load-bearing
one passes a fence key the module has never heard of and asserts it still
appears: the field set is derived from `Object.keys()` precisely so a future
fence key shows up the day it parses, and that row fails if anyone "tidies" the
derivation into a fixed array.

`scripts/verify-0038.sql` — 7 posture rows + a 5-case behavioral matrix
(duplicate path raises · many NULLs fine · owner-scoped · soft-delete frees the
path · the slug constraint still bites), self-fixturing and rolled back (P7).
