# Columns as the universal container — design

**Status:** 🟢 **SLICES 1–4 SHIPPED + GREEN on branch `rows-refactor` (2026-07-15).** The
schema reshape, renderer, and editor+serialize bridge are all committed and the whole
monorepo is green (1736 tests); browser-verified on `/playground`. Remaining: merge to
`main` + slice 5 deploy (author-run `publish-activity` redeploy), and slice 6 (the separate
Notion-hybrid paradigm). Plan was locked via /plan-eng-review (2026-07-14). Migration
subsystem CUT (no stored data). Review report at the bottom.

## As-built amendment — the editor uses the "pragmatic bridge" (Option A, 2026-07-15)

The plan below described a **strict** editor (`(sectionBreak | row)+`, blocks only in
columns) with a large keymap/insertion rework. During slice 3 that was reconsidered and
the author ruled the **pragmatic bridge** instead: the **stored schema is fully
rows-of-columns either way**, but the *editor's ProseMirror tree* keeps its familiar block
stream — single-column content is bare top-level blocks (native typing), and a `row` node
(the renamed `columns` node, 2–6 cols) is used only for multi-column regions. `serialize`
bridges: on save, consecutive bare blocks collapse into one 1-col Row; on load, a 1-col Row
unwraps back to bare blocks. Consequences:

- The 8 outside-voice editor hazards **largely evaporate** — single-column typing is native
  ProseMirror (no isolating-row cross-row keymap, no merge-back data loss, no empty-state
  backfill). They were artifacts of the *strict* model.
- **Slice 4 collapsed to one verb** (shipped `109338e`): add/remove-column, width presets,
  grid lines, cell-height already work (existing commands on the renamed node); the
  escape-the-row / non-destructive merge-back hazards were strict-model concerns and are
  moot. The one real add is `wrapInColumns` + a "Split into columns" slash/insert item —
  move the current top-level block into column 1 of a new multi-col row (browser-verified).
- The strict "everything visibly in a grid" editor is **slice 6** (Notion-hybrid), where it
  is the actual deliverable — not built twice.

Everything below is the original locked plan; read §Editor / §Slices through this amendment.

Supersedes the memory note `columns-as-universal-container-idea` and the STATE
"Also-queued" stub.

## The idea (author, 2026-07-14)

Make columns the **universal layout container**: every region is a **row** that is a
full-width single column by default, and "add columns" *splits* that row. Blocks always
live inside a column, never at the document top level. The GUI becomes an interface that
composes typed blocks in a grid — the shape quality print engines (InDesign, print CSS)
and web layout tools (Webflow) use, which is why it suits a tool targeting BOTH online and
printable output.

Authoring moves toward a **Notion-hybrid** feel (block structure, flowing caret kept) as a
**separate, later** initiative — see §Authoring paradigm.

## Ratified decisions (author + eng review, 2026-07-14)

1. **Rows-of-columns root, full reshape** (not the additive/strangler path). Author is
   certain the grid model is the durable direction.
2. **Migration subsystem CUT.** All existing activities were throwaway test docs and have
   been **deleted by the author**. So: NO `migrate(1→2)`, NO migrate-on-read. Bump
   `schemaVersion 1→2`; the parser is `z.literal(2)` and **rejects v1** (throws). Published
   R2 pages are static HTML and are unaffected either way. **Reconcile the document.ts:8-13
   comment** ("migrations happen on read, never by rejecting") — it no longer describes
   reality; update it to describe the greenfield hard-cut.
3. **A Column holds `block+` (a STACK of blocks)** — not one-block-per-row. A 1-col row is
   the normal vertical flow; a section is usually ONE 1-col row whose column stacks many
   blocks. (Corrects the doc's earlier R1/Notion-parity lean, which couldn't express a
   column holding a heading + several problems — a thing real worksheets need constantly.)
4. **`row` gets its OWN node group (`row`), NOT `block`.** This is load-bearing: if `row`
   were in the `block` group, `column`'s `block+` content would re-admit `row` and
   reintroduce nesting. Its own group keeps "no row-in-column" a structural fact.
5. **A 1-column row renders FLAT** (no CSS-grid wrapper); only multi-col rows emit the grid
   + `--columns-template`. Keeps the reshape invisible to the per-page DOM/perf budget.
6. **Row editor node ports/generalizes the existing pure helpers** in Columns.ts
   (`presetToWidths`/`detectWidthPreset`/`widthPresetOrder`/`clampCellMinHeight`) — no
   reimplementation. `widthPresetOrder(1)` returns `['even']`.
7. **Sections stay a `sectionBreak` MARKER model** (Tiptap doc content
   `(sectionBreak? row+)`, sliced at serialize), not a real section container node.

**Hard guardrail:** vertical **flow of rows**, never a free-drag absolute canvas (print
reflow, narrow-screen collapse, foldable measurement, a11y order all need flow).

## Target data model (schema)

Four-level nesting. The old `columns` block type is **removed** from the `Block` union
(subsumed by `Row`). `Block` is now the leaf-block union only; `row`/`column` live above it.

```typescript
ActivityDocument { schemaVersion: 2, meta, sections: Section[], referencePanel?, calculator? }

Section { id, title?, isCheckpoint, rows: Row[] }   // was: blocks: Block[]
Row     { id, columns: Column[] }                   // columns.min(1).max(6); 1 = full width
Column  { id, width?, minHeight?, blocks: Block[] } // block+ STACK; width/minHeight as today
// Block = leaf blocks only (no row, no column, no old `columns`)
```

- `Row.columns.min(1).max(6)`. **1 column is the identity/default** — remove-column at 1 is
  a no-op.
- `referencePanel` stays flat `blocks: Block[]` — the panel needs no rows.
- **Empty-state guard (outside-voice #5):** the grammar alone permits a rowless / all-breaks
  document with no cursor home. An `appendTransaction` (or NodeView backfill) must guarantee
  every section has ≥1 row with ≥1 paragraph, and a fresh doc opens as one 1-col row with a
  paragraph. Reuse the empty-doc handling from the 2026-07-14 add-block rebuild.

## Editor (Tiptap) — the real risk lives here

New/changed nodes:

- **`row`** — group **`row`** (its own group, NOT `block`), content `column{1,6}`,
  `isolating`, drag as a unit. Reuses the ported pure width/grid/min-height helpers, the
  6-max cap, min re-floored `2→1`.
- **`column`** — content `block+`, `isolating`, `selectable:false`.
- **doc content** → `(sectionBreak? row+)`.

Bespoke work the doc previously under-specified (all in the DATA-MODEL slices, **not** the
deferred paradigm slice — this is the correction of the biggest risk):

- **Cross-row caret keymap (outside-voice #1).** Within a 1-col row's column stack,
  Enter/Backspace are native and fine (the single-column 80% case). But `isolating` rows
  mean **transitions between rows** need bespoke commands: Backspace at a row's first-block
  start merges upward into the previous row (concatenating into its last column's stack);
  Enter/Down past a row's end moves into the next row. Any columned worksheet has ≥2 rows,
  so this is required for slices 3–4, not optional.
- **Non-destructive merge-back (outside-voice #3).** Dissolving a 2-col row to full width
  must **concatenate** the columns' block stacks into one column, NOT `tr.delete` a cell
  (the ported `removeColumn` is destructive by design — keep it for "remove one of >2
  columns", but the go-to-1 path is a distinct `mergeRowToSingleColumn` that preserves
  content). Removing a non-empty column of a >2-col row stays destructive but must be
  undoable / confirmed.
- **Split-into-columns + escape-the-row (outside-voice #8).** Splitting a contiguous run in
  a column into an N-col row splits the host 1-col row into up to three rows
  (`before | split-region | after`). "Start a full-width row after a columned row" needs an
  explicit escape affordance (Enter now stays inside the column). Specify where the split
  happens (cursor vs selected run) and how interactive/image blocks behave.
- **Grip suppression (outside-voice #7).** The columns grip decoration must NOT render on
  1-col rows (they render flat, no container to grab); only multi-col rows get it — else a
  grip lands on every block, duplicating `dragHandleNested`.

Removed: the `columns` insert-window/`/`-menu entry + `topLevelOnly` gating.

## Serialize

- **Confine row/column wrapping to the top-level section-body pass (outside-voice #6).** The
  shared child converters `activityBlockToTiptap`/`tiptapBlockToActivity` (reused for
  worked-example / faded / reference-panel children, which are `block+`, NOT rows —
  serialize.ts:1296,1625) must stay row-free. Leaking the wrap into them double-wraps
  children or the top level. Test this explicitly.
- Section slicing runs over **rows** on `sectionBreak` boundaries (was blocks).

## Renderer / runtime / print / importer / dashboard

- **Renderer:** `renderColumns` → `renderRow`. **1-col row renders flat** (its column's
  blocks directly, or one lightweight wrapper) — the grid + `--columns-template` only for
  multi-col. Numbering stays column-major within a row.
- **Runtime — low risk, but a mandatory test.** `init.ts` finds interactive blocks by
  depth-agnostic `querySelectorAll`; the row/column wrappers don't change
  `data-block-type`/`data-block-id`. `SubmissionResponses` and `STORAGE_SCHEMA_VERSION` are
  keyed by block id, not document shape → **no ingest redeploy, no storage bump.** Prove it
  with a nested-discovery test (mirror the faded-example one).
- **Print CSS:** multi-col row collapse/`break-inside` generalize from columns; 1-col row is
  a no-op.
- **Importer:** wraps each imported block in a 1-col row; ` ```columns ` fence → multi-col row.
- **Dashboard `buildActivityIndex`:** recurse row → column → blocks.

## Migration — CUT (greenfield hard-cut)

No `migrate(1→2)`, no versioned parse dispatch, no migration test corpus. The parser is
`z.literal(2)`; a v1 doc throws (correct — none exist). Author deletes any residual v1 rows
(done). Reconcile the document.ts:8-13 "migrate-on-read" comment to describe this hard-cut
so the next dev isn't misled.

## Authoring paradigm (Notion-hybrid) — separate initiative, sequenced AFTER the data model

Block structure with a **flowing caret kept** (Enter → next block, Backspace merges). The
cut for the normal user is affordance density + mode ambiguity, NOT the cursor (Notion is
block-based *and* has a caret; a no-cursor model means leaving ProseMirror = losing IME /
undo / paste / the `{{blank}}`·`$math$` input rules). Scope: selected-block idle state,
progressive disclosure of controls, one click-grammar. Prototype-first; run against
`docs/design/ux-lens.md`. **NOTE:** the cross-row caret keymap (above) is data-model work,
NOT part of this deferred initiative — do not let it slip here.

## Slices (ratified)

1. **Schema reshape** — `Row`/`Column` schema, `Column.blocks: block+`, `row` own group,
   `Block \ columns`, `schemaVersion: 2` (reject v1), empty-state guard, reconcile
   document.ts comment. Tests: parse bounds, v1-rejected pin.
2. **Renderer + runtime + print** — `renderRow` (flat 1-col), section-iterates-rows, print
   rules, dashboard recursion; bundle regen. Tests: 1-col-flat, multi-col grid, nested
   interactive discovery, storage-unchanged assert.
3. **Editor structural** — `row`/`column` nodes + own group, doc content `(sectionBreak? row+)`,
   ported helpers, **cross-row caret keymap**, grip suppression on 1-col. Serialize both
   directions + confined-wrapping test + round-trip pin.
4. **Editor verbs** — add-column, **non-destructive merge-back**, split-into-columns +
   escape-the-row, insert-window/`/`-menu cleanup.
5. **Deploy train** — bundle + `publish-activity` redeploy (renderer reaches pages); NO
   ingest redeploy (wire unchanged — re-verify). Author-run.
6. **Paradigm follow-on** *(separate design pass)* — Notion-hybrid UX. Prototype-first.

## Risks (re-derived post-migration-cut)

- **#1 (was "first migration") is VOID.** The real critical path is the **editor keymap +
  node model** (cross-row merge, isolating boundaries, empty-state, split/escape gesture).
  Land these WITH the data-model slices or basic row-boundary typing ships broken.
- **Recursion via `column` content** — mitigated by `row` having its own group (decision 4);
  add a structural guard test.
- **Silent data loss on merge-back** — mitigated by the distinct non-destructive command
  (decision/§Editor); test that dissolving a 2-col row preserves both stacks.
- **Serialize double-wrap** of nested children — mitigated by confining the wrap to the
  top-level pass; test.
- `noUncheckedIndexedAccess` across the new nesting — `?.`/`?? default` throughout.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | issues_open | 5 review + 8 outside-voice, all folded |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **OUTSIDE VOICE (Claude subagent, Codex not installed):** 8 findings, all CONFIRMED
  against code, all folded as hard requirements (recursion hole, merge-back data loss,
  cross-row keymap, empty-state, serialize double-wrap, grip-on-every-block, split/escape
  spec, migrate-comment contradiction).
- **CROSS-MODEL:** no tension — outside voice extended the review (additions, not
  disagreements); both agree on direction.
- **VERDICT:** ENG CLEARED — ready to implement. Scope reduced (migration subsystem cut).
  The editor keymap/node-model work is the real critical path; slices 3–4 own it.

NO UNRESOLVED DECISIONS
