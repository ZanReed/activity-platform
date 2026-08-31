# nway_correspondence — the 4-way match (wishlist #4)

**Status: DESIGN PASS, awaiting the author's yes/no per decision** (the
working-style gate for a new block type; drafted 2026-09-01). Verified against
the shipped matching architecture, not the design docs alone.

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

## Cost (so the greenlight is informed)

Schema + registry + sanitize entry (computed `SANITIZER_REV` moves) + wire
bump + editor NodeView + viewer block + print CSS + server scorer + corpus +
` ```correspond ` importer + format doc + prompt regen + BOTH bundles +
`get-activity`/`check-activity` redeploys. This is the largest remaining
wishlist item after #5/#6 — a full slice, not an afternoon.

## Non-goals

- Free-grouping interaction (D1), >4-way (D2), per-card misconception ids
  (D8), migrating `matching` onto this block (it stays the 2-column case).
