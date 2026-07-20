# Strict-grid editor migration — design + plan

**Status:** 🟡 PLANNED — `/plan-eng-review` CLEARED 2026-07-21 (outside-voice pass folded
in; 3 architecture forks + 2 cross-model tensions ratified). Not yet built. Target branch
`strict-grid`. **Supersedes** the "Option A pragmatic bridge" ruling (2026-07-15) in
[columns-universal-container.md](columns-universal-container.md) — deliberately, to kill the
editor-vs-storage tech debt.

## Problem

The editor uses the **pragmatic bridge** (Option A): the ProseMirror tree is a flat block
stream (bare top-level blocks) + `sectionBreak` markers; a `row` node (`column{2,6}`) is
used ONLY for authored multi-column regions. [serialize.ts](../../packages/app/src/lib/serialize.ts)
wraps consecutive bare blocks into a 1-col Row on save and unwraps on load. The STORED
schema is fully rows-of-columns (`schemaVersion:2`).

Consequence (the author's driver): **every feature special-cases the editor-vs-storage
mismatch.** Gutter, drag-handle, command-bar, quick-bar, select-state, settle motion, and
numbering all reason about "top-level blocks" that don't exist in storage. The bridge is
accruing distributed friction. Goal: make the editor tree **be** the stored rows-of-columns
model (strict grid), so editor == storage and the mismatch tax disappears.

## Scope split (TENSION-1, ratified)

The outside voice disaggregated the migration. We ship the **structural** half now and keep
the **caret** half minimal:

- **STRUCTURAL (this migration):** editor tree = stored rows-of-columns; delete serialize's
  collapse/unwrap; migrate every host + extension off the depth-1 assumption; re-coalesce
  normalization. This is the debt win (editor == storage). Low product risk.
- **CARET (deferred to the Notion-hybrid paradigm):** the transparent cross-row-merge caret
  (Backspace-at-row-start silently merges into the previous row's last column) is **exactly
  the paradigm's target caret** ("flowing caret, Enter→next block, Backspace merges"). Building
  a fragile isolating-seam version now would be throwaway / double-build. v1 ships a
  **minimal, explicit** seam caret and lets the paradigm own the flowing one.

## Ratified decisions

- **A1 — Document shape = stack-row per section.** A section is normally ONE `row` whose ONE
  `column` stacks all its blocks; "add columns" splits a run into a separate multi-col row
  (up to `before | multi | after`). Native Enter/Backspace live INSIDE a column's `block+`;
  the `isolating` boundary only bites at row↔row seams (rare). Matches what serialize already
  emits → round-trip is near-passthrough.
- **A2 — Sections stay `sectionBreak` MARKERS** (`doc = (sectionBreak | row)+`), not a real
  `section` container node. Avoids a second isolating boundary + cross-section keymap.
- **A3 — v1 caret = native-within-row + EXPLICIT seams, no transparent merge.** Required v1
  mechanics: empty-state backfill; an always-present **"add full-width row below"** affordance
  on/after a row; **arrow-key nav** across seams; a boundary Backspace that **SELECTS the
  boundary node (visible feedback) — never a bare no-op** (outside-voice #7); an
  **always-visible "dissolve to full width" control on every multi-col row** so an author who
  over-shot into columns can always recover (outside-voice #7). Transparent cross-row merge is
  OUT (paradigm owns it).
- **Sequencing (D2 + TENSION-2) — dedicated `strict-grid` branch; ONE atomic structural
  slice.** No host-by-host "incremental green" (the schema flip breaks all hosts at once —
  outside-voice #3). Gate: schema + serialize round-trip UNIT tests green **in isolation
  first**, then drive the 127 e2e from red → green as the structural fixes land. No transient
  dual-shape shim (that re-creates the bridge we're deleting).

## Node model

```
doc            content (sectionBreak | row)+        (was: block+  [StarterKit default])
row            content column{1,6}, isolating       (was: column{2,6})  group 'row'
column         content block+, isolating, selectable:false   (NEW real node)
sectionBreak   marker (unchanged)
block          the ~20 existing block nodes (unchanged) — now live at depth 3
```

- **Grip suppression:** the whole-row grip decoration renders ONLY on multi-col rows; 1-col
  stack-rows render flat with no container grip (outside-voice #7 in the original doc).
- **Empty-state:** an empty doc = one `row` > one `column` > one empty `paragraph`. A
  normalizing `appendTransaction` backfills this and guards against a cursor-homeless
  `sectionBreak sectionBreak` (outside-voice #11) — and MUST be undo-safe (see Failure modes).

## What already exists (reuse, don't rebuild)

- `row` node ([Columns.ts:399](../../packages/app/src/editor/extensions/Columns.ts)) — widen
  `column{2,6}` → `column{1,6}`, add `isolating`, keep the ported width/grid/min-height helpers,
  the 6-max cap, the `2→1` re-floor.
- **Renderer is DONE + needs no change** — it already emits `renderRow` with 1-col-flat (slice
  2, deployed). The stored `ActivityDocument` is unchanged, so **published output is
  byte-identical**. ⇒ **App-only. NO renderer change, NO `publish-activity` redeploy, NO
  wire/ingest/storage bump** (outside-voice #5/#6 confirmed: `draft_content` +
  `activity_versions.content` already store v2 rows-of-columns; runtime storage is
  block-id-keyed / doc-shape-agnostic).
- `SettleMotion` already targets `parentName === 'column'` — forward-compatible; generalize its
  predicate into the shared helper.
- The original strict plan in [columns-universal-container.md](columns-universal-container.md)
  (§Editor/§Serialize) already specced the node model + the hard commands — a strong base.

## The migration surface (outside-voice #1/#2 — it's EXTENSIONS, not just the 7 React hosts)

A shared `activeBlockAt(state)` helper resolves block **identity** (walk up to the block whose
parent is a `column`). But **structural** logic must change per-site — the helper is necessary,
not sufficient:

| Site | depth-1 assumption | Structural fix |
|---|---|---|
| `BlockReorderShortcuts.ts:39` | `$from.depth!==1`, `before(1)`/`after(1)`, node swap | move within a column; different across columns/rows |
| `SelectBlock.ts` | lifts caret→block at depth 1 | escalate two tiers, SKIP the `selectable:false` column |
| `Columns.ts:502-509` (`wrapInColumns`) | `depth===1`, `node(1)` | resolve the block inside its column |
| `SlashMenu.ts:27` | `depth>1` = "nested" → hides `topLevelOnly` | **REGRESSION**: every caret is now depth≥3; recompute "is this the single-col flow?" from row/column context, not raw depth |
| `blockControls.ts` `nodeAt(pos)` (161/170/281/335/377/614) | expects a block | now returns a `row` — resolve to the contained block |
| `problemNumbering.ts:100` | walks top-level | recurse row → column → blocks, column-major |
| `PlaceholderHint.ts:43` | `depth===0/1` empty-line hint | recompute for a block inside a column |
| `dragHandleNested.ts:72` | `if (depth<=1) return 0` | the whole distinction collapses (no block is depth≤1) — rework; cross-section drag crosses isolating boundaries + the suppressed grip means a stack has no whole-row handle |
| Editor.tsx gutter / DragHandle `onNodeChange` pos | top-left of a top-level block | anchor to the column-nested block |
| the 3 hosts (command-bar/quick-bar/add-button) | `activeBlockAt` | consume the shared helper |

## Serialize (outside-voice #4 — replacing the oracle, not proving it)

- **DELETE** the "collapse consecutive bare blocks → 1-col Row" logic (~serialize.ts:250-288);
  the editor tree already carries rows, so serialize is **near-passthrough**.
- The existing `serialize.test.ts` / `markdownToTiptap.test.ts` encode the BRIDGE's normal form
  (bare-block output, collapse). They are **REWRITTEN to the new oracle**, not preserved — so
  "green" post-reshape certifies the NEW contract. Do not treat the pre-existing green as
  carried-over proof.
- Keep child converters (`activityBlockToTiptap`/`tiptapBlockToActivity`, reused for
  worked-example / faded / reference-panel `block+` children) **row-free** — leaking the wrap
  double-wraps (original outside-voice #6). Explicit pin.
- **Importer:** `markdownToTiptap.ts` must emit the strict tree; the ` ```columns ``` ` fence →
  multi-col row. (Un-migrated stored data = none; the importer + test corpus are the real
  "un-migrated" things — outside-voice #6.)

## Normalization — the re-coalesce gap (outside-voice #8, NEW requirement)

Splitting a run into `before | multi | after` and later dissolving the multi-col row back to
full width leaves **adjacent 1-col stack-rows that nothing recombines** — A1's "a section is ONE
stack-row" rots into N fragments, and the next split's "find the host 1-col row" must then handle
a pre-fragmented section. Add a normalizing `appendTransaction` that **coalesces adjacent 1-col
rows within a section** (the mirror of merge-back). Degenerate splits (at a section's first/last
block) must **drop** the empty `before`/`after` row, not emit an empty 1-col row. Atom blocks
(interactive/image `NodeSelection`) in a "selected run" split need defined behavior (original doc
gap, still open — close it in slice 2).

## Slices

1. **STRUCTURAL (atomic).** Schema (doc/row/column/isolating) + serialize near-passthrough
   (delete collapse; rewrite test corpus to the new oracle) + the whole migration-surface table
   above + `activeBlockAt` helper + re-coalesce + empty-state backfill (undo-safe) + paste
   handling (see Failure modes) + importer + the runtime nested-discovery pin.
   **Gate:** schema + round-trip UNIT green in isolation FIRST; then 127 e2e red → green.
2. **MINIMAL CARET / UX.** Explicit seam affordances (add-full-width-row-below,
   always-visible dissolve on multi-col rows, arrow-nav, select-not-noop boundary Backspace);
   split-into-columns `before|multi|after` with degenerate + atom cases closed. NO transparent
   merge.
3. **Merge + ship.** Fast-forward to `main`. App-only — no deploy.

## Failure modes (per new codepath)

| Path | Failure | Test? | Handled? | Visible? |
|---|---|---|---|---|
| Paste multi-block clipboard into a column under `isolating` (outside-voice #9) | content w/ `sectionBreak`/`row` not in `block` group → silently dropped / mis-split | **CRITICAL e2e** | needs a `transformPasted`/`clipboardParser` that lands blocks into the column (and splits the host row when pasting a multi-col region) | silent data loss if unhandled |
| `appendTransaction` normalization vs undo (outside-voice #11) | undo lands on a normalized intermediate → "undo does nothing / twice" | **CRITICAL e2e** | normalize only on real content change, use `addToHistory:false` correctly, guard idempotence | broken undo |
| Empty-state / `sectionBreak sectionBreak` | cursor-homeless section | e2e | backfill row>col>para | frozen-feeling caret |
| Cross-section drag across isolating + suppressed grip (outside-voice #10) | no handle / drag rejected | e2e | rework dragHandleNested; define whole-stack move | can't reorder |
| Boundary Backspace | bare no-op reads as frozen editor | e2e | SELECT the boundary node, never no-op | #1 "editor broken" complaint |

Any failure mode that is silent + untested + unhandled = critical gap. Paste + undo are the two
that would be **silent data loss** — both are CRITICAL e2e, must land in slice 1.

## NOT in scope

- **Transparent cross-row-merge caret** — deferred to the Notion-hybrid paradigm (TENSION-1);
  building it now is throwaway/double-build.
- **Real `section` container node** — kept `sectionBreak` markers (A2).
- **Row-per-block model** — rejected (A1); maximizes the fragile keymap.
- **Renderer / runtime / publish changes** — none; published output byte-identical.
- **Focus mode** (separate deferred mini-arc), smart-defaults (slice 6.5).

## Worktree parallelization

Mostly **sequential** — slice 1 is one atomic structural unit sharing the schema; the
per-extension fixes can't land green independently (that's the whole point of TENSION-2).
Slice 2 (caret/UX) is additive after slice 1 is green. No parallel lanes worth the coordination.

## Implementation Tasks
Synthesized from this review. Checkbox as you ship (on the `strict-grid` branch).

- [ ] **T1 (P1)** — schema: `doc (sectionBreak|row)+`, `row column{1,6} isolating`, new
  `column block+ isolating selectable:false`; grip suppressed on 1-col rows.
  - Verify: schema unit tests (node content + isolating).
- [ ] **T2 (P1)** — serialize → near-passthrough: delete the bare-block collapse; **rewrite**
  serialize/markdown test corpus to the new oracle; keep child converters row-free (pin).
  - Verify: round-trip UNIT green in isolation (stack-row + multi-col + empty-doc identity).
- [ ] **T3 (P1)** — `activeBlockAt` shared helper + migrate every migration-surface site
  (reorder swap, SelectBlock escalation, wrapInColumns, SlashMenu depth regression,
  blockControls nodeAt, problemNumbering recursion, PlaceholderHint, dragHandleNested, gutter
  anchor, 3 hosts).
  - Verify: 127 e2e driven red → green.
- [ ] **T4 (P1)** — re-coalesce + empty-state normalizing appendTransaction (undo-safe);
  drop degenerate empty before/after rows.
  - Verify: split-then-dissolve leaves ONE stack-row; undo works; new coalesce e2e.
- [ ] **T5 (P1, CRITICAL)** — paste into columns (`transformPasted`) + undo-vs-normalization.
  - Verify: paste multi-block + multi-col clipboard e2e; undo e2e.
- [ ] **T6 (P1)** — runtime nested-discovery pin (init.ts finds interactive blocks in
  row>column) → confirms no ingest/storage change.
- [ ] **T7 (P2)** — slice 2: seam affordances (add-row-below, always-visible dissolve,
  arrow-nav, select-not-noop Backspace); split degenerate + atom cases.
- [ ] **T8 (P2)** — importer emits strict tree; ` ```columns ``` ` fence → multi-col row.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR (PLAN) | 3 arch forks + 2 cross-model tensions ratified; 13 outside-voice findings folded |
| Outside Voice | Claude subagent | Independent 2nd opinion | 1 | issues_found→folded | 13 findings; 2 confirmed the plan (no storage/ingest bump), 8 folded as requirements, 3 raised as tensions |

- **CROSS-MODEL:** The outside voice CONFIRMED (c) no storage/ingest bump and (e) existing v2
  drafts reopen cleanly. It challenged the plan on 3 points, all resolved WITH the user:
  TENSION-1 (caret is a throwaway double-build / debt redistributed) → **split structural-now /
  caret-deferred-to-paradigm**; TENSION-2 (host-by-host is big-bang in disguise) → **one atomic
  structural slice + isolated round-trip gate**; #7 (no-op vs select) → **always select**. The
  missed hazards (#8 re-coalesce, #9 paste, #11 undo, #1/#2 extension-depth blast radius) are
  folded into T3–T5 as P1 requirements, with paste + undo flagged CRITICAL.
- **VERDICT:** ENG CLEARED — buildable on the `strict-grid` branch. App-only (no
  renderer/publish/wire/storage change). Decisions logged; `gstack-review-read` run.

NO UNRESOLVED DECISIONS
