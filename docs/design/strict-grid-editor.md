# Strict-grid editor migration — design + plan

**Status:** 🟢 FUNCTIONALLY COMPLETE — SLICE 1 (T1–T6, structural) + SLICE 2 (T7 seam
affordances, T8 import incl. the ` ```columns ``` ` Markdown fence) all SHIPPED to `main`
2026-07-21 — app-only, no deploy; 142 e2e green. Nothing is broken or blocks authoring.
BUT a post-ship review found a handful of gaps where the shipped behaviour deviates from
this narrative — see **"Known gaps / slice-3 candidates"** at the bottom. Those want a
triage + design/eng pass BEFORE more code (some may be YAGNI). Eng review CLEARED 2026-07-21.
**Supersedes** the "Option A pragmatic bridge" ruling (2026-07-15) in
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

- [x] **T1 (P1)** — schema: `doc (row|sectionBreak)+` (row-first so the default fill is a
  clean row, not a bare sectionBreak), `row` group 'row' `column{1,6} isolating`; grip
  decoration only on multi-col rows; sectionBreak dropped from the `block` group. Column keeps
  its explicit leaf-block enumeration (behaviour-identical to `block+`, keeps blockTypeGuards
  green, no horizontalRule surprise). StarterKit `document:false` + `trailingNode:false` (its
  doc-level fallback was a stray sectionBreak). New `Doc.ts`, `StrictGridNormalize.ts`,
  `strictGrid.ts`. **DONE 2026-07-21.**
- [x] **T2 (P1)** — serialize is near-passthrough (deleted the bare-block collapse + the 1-col
  unwrap). Test corpus rewritten: a shared `serializeTestBridge` (toStrict/toBare) adapts the
  legacy bare-stream ATTR corpus; a new `strict-grid structure oracle` describe pins the reshape
  against the RAW serialize (1-col stays a row, N adjacent rows preserved, sectionBreak slicing,
  child converters row-free). **DONE.**
- [x] **T3 (P1)** — `activeBlockAt`/`topLevelRowAt`/`isTopLevelStack(InsertPos)` in strictGrid.ts;
  migrated BlockReorderShortcuts (reorder within column), wrapInColumns/insertColumns/
  insertSectionBreak (insert at top level from a nested caret; wrapInColumns splits
  before|multi|after), SlashMenu + BlockInsertModal topLevelOnly gate, PlaceholderHint (descend
  row>column), Editor.tsx empty-doc/first-run + routes' seed content. SelectBlock/caretBlockPos
  already column-aware (left as-is). **127 e2e driven red→green** (failures were flat-shape
  assumptions in the tests). **DONE.**
- [x] **T4 (P1)** — `StrictGridNormalize` appendTransaction: empty-state backfill, a trailing
  paragraph (replaces the disabled TrailingNode), re-coalesce adjacent 1-col stack rows.
  Undo-safe (merges into the triggering edit's history entry; skips history txns; idempotent).
  1-col rows render FLAT in editor.css (`editor-columns--stack`). **DONE.**
- [x] **T5 (P1, CRITICAL)** — `transformPasted` flattens a pasted slice carrying row/sectionBreak
  nodes into its column-legal blocks (no silent data loss); plain slices pass through. New
  `strict-grid.e2e.ts` (7 tests) pins paste (multi-col + section-break), undo-vs-normalization,
  empty-state, split-into-columns, re-coalesce. **DONE.**
- [x] **T6 (P1)** — runtime nested-discovery pin already exists + holds (init.test.ts discovers a
  fill_in_blank in a row cell); renderer/runtime + stored shape UNCHANGED → no ingest/storage
  bump (bundle regen = zero drift). **DONE.**
- [x] **T7 (P2)** — slice 2 seam affordances **DONE 2026-07-21.** `dissolveRow`
  (non-destructive merge-back: multi-col row → one full-width stack, concatenating every
  column's blocks) + `addRowBelow` (escape-the-row) commands in Columns.ts. `RowSeamCaret`
  keymap: boundary Backspace at a stack row's start SELECTS the seam node (never a frozen
  no-op); ArrowDown/ArrowUp step the caret across the row seam (or select a sectionBreak seam)
  — **all Playwright-verified** (the in-app Browser pane delivers key events unreliably, so it
  is NOT authoritative for keys). Toolbar: the column cluster is gated to MULTI-col rows (was
  `isActive('row')`, true for every stack now → regression fixed) + gains **Merge** / **Row
  below** escape hatches. Split degenerate cases (drop empty before/after) done in T3;
  atom-block split (node-selected image/graph → column 1) closed + pinned. 8 e2e in
  strict-grid.e2e.ts.
- [x] **T8 (P2) — DONE, incl. the columns fence.** The importer emits a bare stream, wrapped by
  `strictGrid.wrapBlocksStrict` at the two ActivityEditor import call-sites; a markdown-import
  pin validates the WRAPPED result against the REAL editor schema. **The ` ```columns ``` `
  fence is built** (`parseColumnsFence`): columns divided by a `---` line, one block per line
  per column (paragraph / `$$math$$` / `{{blank}}`, like ```worked), 2–6 columns, emits a
  strict `row` node that wrapBlocksStrict passes through. Format doc (markdown-import-format.md)
  + the copy-paste prompt (markdownImportPrompt.ts) updated in sync (the prompt↔doc equality
  test guards it); 9 unit tests + end-to-end render verified. Rich per-column content
  (lists/headings/nested question fences) stays editor-only.

## Eng review report — slice 1 (structural migration, archived)

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

## Known gaps / slice-3 candidates (post-ship review, 2026-07-21)

The migration is functionally complete and green (142 e2e), but a review comparing this
narrative to the shipped code found deviations. **None is a bug** — everything works — but
they are places where we shipped *less than*, or *different from*, what was specified.
**Recommendation: triage these BEFORE building — some are likely YAGNI, and the toolbar
buttons (below) already cover recovery, which the narrative predated.** Do NOT assume all
of these get built; the narrative was written before the toolbar affordances existed.

### 1. A3 affordances shipped CONTEXTUAL, not "always-visible" (design fork)
A3 specified two as persistent, always-present controls; both shipped as contextual TOOLBAR
buttons (they appear only while the caret/selection is in a multi-col row):
- **"always-visible 'dissolve to full width' on EVERY multi-col row"** → shipped as the
  toolbar **Merge** button. Recovery is always *reachable*, but there is no persistent per-row
  widget (you must click into the row first).
- **"always-present 'add full-width row below' affordance on/after a row"** → shipped as the
  toolbar **Row below** button (multi-col rows only). No affordance after a *stack* row.
- **Fork:** keep the toolbar buttons (cheap, working) or add a small dissolve/▾ widget next to
  the multi-col grip? A `/plan-design-review` question more than an eng one.

### 2. Drag / reorder — under-delivered vs. the narrative (the real eng-review item)
- **`dragHandleNested.ts` was NOT reworked** (its last commit predates the migration). It works
  (blocks inside columns stay draggable), but its `if (depth <= 1) return 0` branch is now DEAD
  code — the design called to rework it.
- **"Whole-stack move" undefined.** A 1-col stack row has no whole-row handle (grip suppressed on
  stacks), so an entire section's stack can't be dragged as a unit — only block-by-block.
- **Keyboard reorder can't cross rows.** `BlockReorderShortcuts` (⌘⇧↑/↓) moves within a column and
  NO-OPS at the column edge; the narrative's "different across columns/rows" isn't built.
- **No cross-section-drag e2e.** The failure-modes table wanted one, but DnD is owner-eyeball per
  project convention (never automated) — so cross-row block drag is NOT automatically verified.
- **This bucket is the one that genuinely needs eng thought** (isolating-boundary interaction
  model) — AND the one most likely to be partly YAGNI. Triage first.

### 3. `activeBlockAt` consolidation incomplete (cleanup, no spec needed)
The shared helper is imported only by `Columns.ts` + `BlockReorderShortcuts.ts`. `SelectBlock`,
`BlockQuickBarHost` (`caretBlockPos`), and `SettleMotion` still carry their OWN inline
column-walk (all correct — they were already column-aware). Duplicated-logic tech debt, not a
bug. **Just do it whenever those files are next touched — no review needed.**

**CORRECTION (eng review 2026-07-21):** reading the code, only ONE of the three was a real
consolidation target. `SelectBlock` is already column-aware (no walk to fold). `SettleMotion`'s
`settleTargets` is a DIFFERENT operation — it walks inserted step-ranges collecting fully-covered
blocks, with `parent === 'doc' || 'column'` as a decoration-eligibility predicate (the `'doc'`
branch is load-bearing: it settles a whole inserted `row` as one unit). It does not resolve
selection identity, so it does not fold onto `activeBlockAt`; forcing it would be a premature
abstraction. The lone genuine duplicate was `BlockQuickBarHost.caretBlockPos` — a verbatim inline
copy of `blockAncestor`. **SHIPPED this review:** `caretBlockPos` now calls `blockAncestor`.

### Triage outcome (eng review, 2026-07-21) — ratified

Triage-first pass over the four buckets. The narrative predated the shipped toolbar
`Merge` / `Row below` buttons, so most of it was YAGNI. Rulings (author-ratified):

- **Bucket 1 (A3 persistent widgets vs. contextual toolbar buttons) → `/plan-design-review` DONE
  2026-07-21 → BUILD the grip click-menu.** Design rated the shipped toolbar-only approach 7/10:
  recovery works and is labeled, but the control lives in the far *sticky top* toolbar (proximity
  break — it acts on "this row" while sitting nowhere near it) and the six-dot grip, the natural
  "operate on this whole row" affordance, is **drag-only** (a plain grip click does nothing). The
  design-right 10/10 is NOT a second persistent widget (rejected: fails subtraction + is the
  "rival-to-grip" `dragHandleNested.ts` warns against) — it is to give the EXISTING grip a
  **click-menu** (click the grip → small popover: "Merge to one column" / "Add row below"; drag
  still drags). Reuses the one blessed container affordance, fixes proximity, matches the
  Notion/Coda ⋮⋮-handle convention. **Ratified: build it.** Spec: a `gridRowMenu` module store +
  single `GridRowMenuHost` at editor root (mirrors `BlockQuickBarHost`/`cropMode`), grip `click`
  selects the row + opens the menu, actions reuse the existing `dissolveRow`/`addRowBelow`
  commands (both already accept a row `NodeSelection`). The toolbar buttons stay (redundant
  reachable path). App-only. **BUILT + green 2026-07-21:** `gridRowMenu.tsx` (store) +
  `GridRowMenuHost.tsx` (body-portaled menu, ESC/outside-click close) + grip `click` handler in
  `Columns.ts` (shares `resolveRowPos` with the drag path) + `.grid-row-menu` CSS + host mount in
  `Editor.tsx`. 3 new e2e (open + Merge, Add row below, Escape); typecheck + 145 e2e green;
  browser-verified (grip click selects the row + opens the menu, no console errors).
- **Bucket 2 (drag / reorder) → BUILD NOTHING.** `dragHandleNested` is a deliberate, documented
  rule (grip owns whole-row moves; hover owns inner-block; the `depth<=1` branch is NOT dead — it
  keeps a top-level `sectionBreak` draggable) → reworking it reopens the handle-flip bug the
  comment exists to prevent. Whole-stack move and cross-row keyboard reorder both cross the
  `isolating` seam = the exact caret/interaction work TENSION-1 deferred to the Notion-hybrid
  paradigm; building now is throwaway. Cross-row-drag e2e stays absent (DnD is owner-eyeball per
  project convention). **Optional P3:** a 1-line comment on `dragHandleNested.ts` noting the
  `depth<=1` branch now also covers `sectionBreak` (doc-accuracy only).
- **Bucket 3 (`activeBlockAt` consolidation) → DONE this review** (the `caretBlockPos` fold above;
  see the CORRECTION for why SettleMotion was not a target). No spec was needed.
- **Bucket 4 (deferred-by-design) → NO ACTION.** Confirmed nothing needs doing. **Optional P3:**
  tighten the cosmetic `/` PlaceholderHint so it doesn't show in empty multi-col cells (one-liner).

App-only; no renderer / publish / wire / storage change. Nothing left blocks a "slice 3".

### 4. Deferred by design (NOT gaps)
- **Transparent cross-row-merge caret** — owned by the future Notion-hybrid paradigm (TENSION-1).
- **Rich per-column Markdown import** (lists / headings / nested question fences inside a
  ` ```columns ``` ` fence) — editor-only; documented in `docs/markdown-import-format.md`.
- **Cosmetic:** the `/` PlaceholderHint now also shows in empty *multi-col cells* (was
  top-level-only) — harmless; a one-liner to tighten if desired.

## GSTACK REVIEW REPORT

Triage-first review of the "Known gaps / slice-3 candidates" section (not the whole doc).

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR (PLAN) | 4 buckets triaged: 1 flagged to design, 1 build-nothing, 1 shipped, 1 no-action |
| Design Review | `/plan-design-review` | UI/UX gaps (bucket 1) | 1 | CLEAR → BUILT | shipped toolbar-only rated 7/10 (proximity break + drag-only grip); ratified + built the grip click-menu |
| Outside Voice | `codex` | Independent 2nd opinion | 0 | SKIPPED | codex not installed; subagent fallback declined (no-spawn convention; low marginal value) |

- **VERDICT:** ENG + DESIGN CLEARED (triage + one build). Ratified: B1 → **BUILT the grip click-menu** (Merge / Add row below on grip click; reuses `dissolveRow`/`addRowBelow`; toolbar buttons retained); B2 → build nothing (drag/reorder gaps are deliberate design or paradigm-deferred per TENSION-1); B3 → shipped (`caretBlockPos` folded onto `blockAncestor`); B4 → no action. App-only. Typecheck clean; 721 unit + **145 e2e** green (3 new grip-menu e2e).
- **Design key finding:** the binary fork (keep toolbar buttons vs. add a persistent widget) missed the design-right third option — give the EXISTING grip a click-menu, avoiding the "rival-to-grip" a second widget would create.
- **Eng key finding:** the doc mislabeled the B3 consolidation target — `SettleMotion` is a range-coverage operation, not a selection-identity walk; the real duplicate was `BlockQuickBarHost.caretBlockPos`. Corrected in-doc and shipped.

NO UNRESOLVED DECISIONS
