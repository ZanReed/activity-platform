# nway_correspondence — the 4-way match (wishlist #4)

**Status:** ✅ **SHIPPED 2026-09-01 as the `correspondence` block — see AS
BUILT at the bottom (`CHECK_WIRE_VERSION` 2→3 rode this slice).** *(Was:
GREENLIT → OUTSIDE-VOICE REVIEWED → AMENDED, build order after wishlist #3.)* The review found eight defects with
file:line evidence; four change the design. Amendments override the matching
decisions below; the original text is kept as the record.

## Amendments after the outside-voice review (2026-09-01)

- **R1 (overrides D1's premise).** The shipped matching interaction is NOT
  drag-to-dock — `Matching.tsx` renders one native `<select>` per item (the
  drag language lives only in a schema comment and the registry's a11y note,
  neither of which the viewer ever shipped). The honest generalization is
  **one native select per (item, column) cell** — cheaper than a 3-pool
  docking surface, and the a11y story is the select's own. The anchor-rows
  shape of D1 stands; the affordance changes.
- **R2 (corrects D2/D7's mechanism).** Matching targets are shuffled
  CLIENT-SIDE at render, seeded by block id — same for every student; there
  is no publish- or serve-time shuffle (`serveShuffled` belongs to ordering
  alone, and `check/wire.ts`'s "served permuted" comment is stale — filed
  with this doc). Correspondence columns shuffle the same way, seeded
  `blockId + columnId`. Letters are DERIVED at render from shuffle order and
  exposed via `data-letter`/`data-target-id` (the shared `choiceLetter`
  discipline; roman/greek are new sibling helpers). Print inherits matching's
  status quo (no `print.shuffled`; print order = screen order).
- **R3 (replaces D4 — it designed against a dead wire).** The v6 `matches`
  bump lives on the pre-S9 ingest wire that nothing writes any more. The live
  wire is `SectionResponses` + `CHECK_WIRE_VERSION` (exact-match, no
  version tolerance), and the client sends WORK ONLY — never earned/total.
  So: `correspondences: Record<blockId, Record<itemId, Record<columnId,
  targetId>>>` on `SectionResponses`, `CHECK_WIRE_VERSION` 2→3, with the
  full bump fan-out (handler validator + `countItems`, `emptySectionResponses`,
  walk inventory, grading dispatch, `check/mock.ts`, corpus coverage row,
  e2e helpers).
- **R4 (settles D3's surfacing, which the doc left implicit).** Per-edge
  earned/total does NOT flow to the student or the verdicts row in v1 — the
  block verdict is boolean, like matching (whose own scorer's earned/total is
  already discarded by `gradeSection`). The per-edge DIAGNOSTIC is served by
  the stored raw `correspondences` cells in the responses jsonb, joined
  against the document key at query time. If that join proves painful, a
  per-cell verdict map is additive on `CheckItemResult` later.
- **R5 (accepted risk + doc fix).** An unrecognized fence degrades to RAW
  TEXT — only `{{…}}` specs are masked — so a ```correspond paste into an
  older app version imports with the key visible. Already true of ```match
  pair lines; the format doc's blanket "any answer is masked" sentence is
  over-broad TODAY and must be corrected when this fence lands.
- **R6 (grammar rule for the fence).** Cells split on ` | ` only OUTSIDE
  `$…$` spans, so `$|x - 3|$` survives in a cell.
- **R7 (persistence).** The viewer store's persisted shape gains the map
  tolerate-absent (`?? {}` guards on hydration), NO
  `VIEWER_STORE_SCHEMA_VERSION` bump — a bump discards buffered student work.
- **R8 (cost tail, from the review's enumeration).** Beyond the original cost
  line: Block union + `block-predicates.ts` (`ALWAYS_NUMBERED_TYPES`,
  `isGradeable`) + the editor's `problemNumbering.ts` mirror;
  `editorExtensions`/`slashMenuItems`/`blockThumbnails`/`editor.css`;
  `serialize.ts` both directions; viewer `blockIndex` category, store item
  ids + fired-responses pick, answer-key `extract.ts` +
  `ANSWER_KEY_COVERAGE`, per-type authored fixture, the sanitize leak
  fixture; `importFormatRegistry` registration. (The popover sentence in D9
  is deleted — matching's NodeView uses no popover.)

**What the builder asked for** (2026-08-24, relayed): a 4-way match with
per-edge partial credit, for the ~5 *same-function-across-representations*
activities — one function seen as equation, graph, table, and verbal
description; the student assembles the correspondence. The per-edge signal is
the point: WHICH representation a student fails to connect is the diagnostic
(the fallback — chained two-column matches — loses exactly that).

**What exists to build on.** `matching` is two-column, anchor-based: items in
document order, shuffled lettered targets, drag a target card onto an item,
`key: itemId → targetId`, scored per pair with no bipartite machinery (the
student's docking IS the assignment). Items and targets both carry the MC
figure slot (`ChoiceImage`/`ChoiceGraph` — the kit-free SVG engine, so graphs
print for free). The server scorer is one of the four element-coupled ports
pinned by the golden corpus. Matching shipped its own wire bump (v6:
`matches` map, per-pair earned/total).

## Decisions (numbered; recommendation + rationale each)

**D1 — Interaction model: anchor rows + one dock PER COLUMN (recommend), not
free grouping.** Column 1 is the anchor (document order, like matching items);
each remaining column is a shuffled card pool; the student docks one card from
each pool onto each anchor row. Generalizes the shipped drag-to-dock UX a
student already knows, keeps "the docking IS the assignment" (no bipartite
machinery), and matches the use case — the equation anchors its graph, table,
and description. Free grouping (a pool where students form bundles) is a new
interaction paradigm with a much harder a11y/print story, for no additional
signal.

**D2 — Schema: `items` + `targetColumns[2..3]` + per-column key.** New block
type `correspondence` with `items: MatchingItem[]` (reused shape),
`targetColumns: [{ id, header: InlineNode[], targets: MatchingTarget[] }]`
(min 2, max 3 — with the anchor that is 3- or 4-way), and
`key: itemId → { columnId → targetId }`. Distractor cards per column and
many-to-one reuse behave exactly as matching (allowed, no gate — the
`allowTargetReuse` tombstone applies). A 2-way correspondence is `matching`;
the importer/editor steer there rather than duplicating it.

**D3 — Scoring: an EDGE is one (item, column) cell.** `earned` = correctly
docked cells, `total` = items × columns. Block `correct` = all cells right.
This is the builder's per-edge credit, and the stored per-cell response
aggregates by column — "misses the table column on every function" is a query,
not a new sensor. No cross-column consistency bonus (a student who groups
entity-2's cards on entity-1's row is wrong per cell, which is the honest
count).

**D4 — Wire: one new parallel map, one wire bump.** `SubmissionResponses`
grows `correspondences: blockId → { cells: itemId → { columnId → targetId },
earned, total }` (the standing rule: never widen an existing response type; a
new category gets its own map — matching's v6 is the precedent to copy,
including the pre-v version tolerance).

**D5 — Naming: block type `correspondence`.** Name-by-shape rule; "nway" is
the columns array's length, not vocabulary. The wishlist's
`nway_correspondence` stays the discussion alias.

**D6 — Markdown fence: ` ```correspond `, one row per line, ` | `-separated
cells, column headers on a `columns:` line.**

    ```correspond
    prompt: Match each function's representations.
    columns: Graph | Table | Description
    y = 2x + 3  |  G1  |  T2  |  grows by 2 each step
    y = x^2     |  G3  |  T1  |  a parabola through the origin
    | G2 | | steep and falling
    ```

  The first cell is the anchor; a line starting with `|` contributes
  distractors (empty cell = none for that column). Cards are plain
  text/inline math or figure refs the same way match items are; the ` = `
  ambiguity that match solves with last-separator-wins doesn't arise because
  the separator is `|`. (Exact figure syntax rides whatever ` ```match `
  does today — no new figure grammar.)

**D7 — Print: per-column letter sequences, distinct styles.** Anchor rows
numbered as items; column 1 targets lettered A/B/C, column 2 i/ii/iii,
column 3 α/β/γ (or a/b/c-prime — final pick at build). Print body: the anchor
list plus each column's shuffled cards as its own lettered bank; answer line
per row: `2. C · ii · α`. Blanks neutralize to bare underlines per the print
baseline rules.

**D8 — Misconception ids: DEFERRED.** Distractor cards do not carry `mis.*`
ids in v1 — the per-edge cell data is itself the diagnostic and is stored
(aggregable later); per-card ids are additive when the builder authors them.

**D9 — Editor: generalize the Matching NodeView to N columns** (single-host
popover rules unchanged; column add/remove capped at 3 target columns). The
per-column tolerance of mid-edit incomplete keys mirrors matching (schema
never enforces key completeness; the editor warns).

**D10 — Server scorer: element-coupled port + golden corpus rows.** The
scorer lands beside matching in `grading/choices.ts` with corpus cases (this
is one of the four ported families, NOT graph-style parity-by-construction —
the corpus is the pin). Unanswered = no cell docked at all, mirroring
matching's "no pairs placed" rule.

## AS BUILT (2026-09-01, same day as the amendments)

Shipped as amended (R1–R8). Deltas and confirmations worth recording:

- **The registry guard suite drove the build**, as designed: adding the schema
  member made the viewer registry fail to COMPILE, and each test run then
  enumerated the next missing surface (fixtures, census, corpus coverage,
  conformance, print-CSS parity, the importer's documentation guard — which
  refused the fence until the prompt AND the doc taught it). Nothing on R8's
  cost list was discovered late; two things it missed were found by guards:
  the REFERENCE-PANEL editor's own extension list (its Column node shares the
  content expression that now names `correspondence`) and the
  `blockTypeGuards` representative-block map.
- **The per-column shuffle seeds by `blockId:columnId`** — same-seed columns
  would stay aligned with the authored order and leak every row (the authored
  n-th cards are each other's answers). Pinned by a deterministic 6-card
  component test; mutation to a shared seed reds exactly that case.
- **The conformance suite auto-covered the family contract** the moment the
  component was bound (the D4 mechanism working as designed).
- **Corpus coverage is declared `shared-scorer`**: scoreCorrespondence is
  matching's rule one axis deeper, born server-side — there is no runtime
  twin to pin parity against; semantics are pinned (mutation-tested) in
  grading-primitives + grading-section instead.
- **Nine mutations, every one red once**: omission gate, walk key projection,
  handler validator depth, shuffle seed, marker sequences, store's nested
  write, serializer, math-pipe splitting, blockIndex category.
- `SANITIZER_REV` moved again (`2-ea886923` → `2-3d4db5c5`, the new registry
  entry); `CHECK_WIRE_VERSION` 2 → 3. Both bundles regenerated same-commit;
  both redeploys pending — and the wire bump makes the ORDER binding: a push
  before `check-activity` deploys leaves every student's checks refusing with
  a version mismatch until the deploy lands.

## Cost (so the greenlight is informed)

Schema + registry + sanitize entry (computed `SANITIZER_REV` moves) + wire
bump + editor NodeView + viewer block + print CSS + server scorer + corpus +
` ```correspond ` importer + format doc + prompt regen + BOTH bundles +
`get-activity`/`check-activity` redeploys. This is the largest remaining
wishlist item after #5/#6 — a full slice, not an afternoon.

## Non-goals

- Free-grouping interaction (D1), >4-way (D2), per-card misconception ids
  (D8), migrating `matching` onto this block (it stays the 2-column case).
