# Matching + ordering question types

**Status: BUILT (2026-07-10, same session) — implemented per the decisions below; browser-verified on a bundle-rendered published page; awaiting the wire-v6 deploy train (STATE.md pending action 1).**

**As-built deltas from this contract:** (1) the ```match separator splits on the
LAST ` = ` (not the first, which broke equation items like `y = 2x + 1 = A`),
with ` -> ` as an always-wins alternative and `\=` as an escape; (2) the
dashboard shows matching pairs by CONTENT TEXT, not letters — letters follow
the publish-time shuffle, and serialize re-mints block ids per save, so the
arrangement is stable within a publish (screen matches paper) but not across
re-publishes; (3) tap gestures were added atop pointer drag for touch parity
(tap lifts a bank card, tap an item places it, tap a docked card returns it);
(4) base runtime landed at 35.8 KiB minified (decision 10's accepted growth —
nearer the 40 KiB ceiling than estimated; dedupe/lazy-chunk levers noted in
STATE.md).

## Decisions (author calls, 2026-07-10)

1. **Ship together** — both types in one build train, ONE wire bump (v5→v6
   adds `matches` + `orderings`), one ingest redeploy.
2. Matching structure: **distractor targets YES** (targets may exceed items);
   **`allowTargetReuse` YES, off by default** (categorization-lite).
3. **Figures YES in v1** — the optional `image`/`graph` figure slot (ChoiceImage/
   ChoiceGraph pattern, kit-free `renderGraphSvg`, shared `DrawableListEditor`)
   on matching items AND targets. "Match the graph to its equation" is the
   marquee case.
4. **Matching UX: pointer drag** (author call — costly but expected). The
   student drags a right-column target card onto a left stem; the card
   **physically docks next to the stem** (the right column slot empties).
   Drag away (or a remove affordance) to undock. A **keyboard select-then-place
   grammar is mandatory underneath** (a11y bar; it's also the drag
   implementation's state model — pointer events are just another way to drive
   the same state transitions through `render()`).
5. **Ordering UX: pointer drag to reorder**, same keyboard fallback rule
   (arrow keys lift/move/drop).
6. **Matching scoring: per-pair earned/total** (fractional CheckpointResult
   precedent from wire v4); block `correct` = all pairs correct.
7. **Ordering scoring: all-or-nothing** exact sequence. Partial-credit metrics
   and interchangeable-adjacent-items both **YAGNI** (additive later, no bump).
8. **Shuffle: publish-time deterministic**, seeded by block id — whole class
   sees the same arrangement (printable; "everyone look at option B" works).
9. **Print: yes to both conventions** — lettered targets + write-the-letter
   `____` (matching); shuffled list + write-in number boxes (ordering).
10. **Runtime budget: accept the growth.** The 20 KiB soft target is
    self-imposed discipline, not market parity — measured 2026-07-10: Desmos
    calculator.js is ~1.0 MB transferred / 4.0 MB raw (≈50–200× this runtime);
    DeltaMath's marketing landing page alone ships ~360 KB of JS. The real
    line is the 40 KiB ceiling + time-to-interactive on school Chromebooks.
    No new build-variant axis.
11. **Parity chrome YES** — `solution` / `hasConfidenceRating` / `skills` /
    `workSpace` on both blocks. Per-pair/per-item feedback deferred.

The last two "common question types beyond fill-in-blank" from ROADMAP Phase 2
(multiple choice shipped 2026-07-10). Both are arrangement-shaped answers:
matching pairs left items with right items; ordering arranges one list into a
sequence. Historically more common than fill-in-blank in non-STEM classrooms;
in math, "match the graph to its equation" is the marquee use.

## The template these ride (settled — not open questions)

The MC ship (2026-07-10) established the parallel-map pattern end to end, and
ROADMAP records the as-built correction: arrangement/selection question types
get their **own runtime module** (like `runtime/mcs.ts`), NOT a strategy in the
`evaluateAnswer` dispatch (that dispatch is for typed-blank answer formats).
Per type, the full surface is:

- **Schema**: block type in the discriminated union + `ColumnCellBlock` + the
  editor column content expression (the 0241689 guard tests fail loudly on
  omission) + factory + index exports.
- **Wire**: a new optional parallel map on `SubmissionResponses` at a
  schemaVersion bump; ingest accepts all prior versions, migrates on write.
  Deploy order: `ingest-submission` (`--no-verify-jwt`) BEFORE any republish.
- **Storage**: `STORAGE_SCHEMA_VERSION` bump (blob gains the new state map).
- **Renderer**: `data-block-category="question"` block shell + type-specific
  data attrs (answer key baked in, like `data-mc-answer` — accepted client-
  scoring posture; Phase 5 server grading strips it). Print CSS in the same
  pass. `pnpm bundle:renderer` + commit bundle.
- **Runtime**: init walk → typed refs → state map → render-owned DOM →
  checkpoint scoring → submit gather. Vanilla TS, no deps, budget-conscious.
- **Editor**: Tiptap node + NodeView (single-host popover rules don't apply —
  MC-style in-place editing), slash-menu entry, serialize round-trip,
  `problemNumberAt` numbering.
- **Import**: a fenced block (like ```mc) + doc + Copy-AI prompt + drift guard.
- **Dashboard**: `buildActivityIndex` map (incl. column-cell recursion) + a
  per-type submissions table.

## Constraints that shape the UX decisions

1. **Runtime bundle budget.** Base runtime is 21.2 KiB, already over the
   20 KiB soft target (40 KiB hard ceiling). Two new interaction models must
   be lean: no drag library (no JS deps by standing rule), and HTML5
   drag-and-drop is unusable on touch anyway. Pointer-event drag machinery in
   vanilla TS is possible but is the most expensive option in both bytes and
   testing surface.
2. **Touch-first classrooms.** Chromebooks + iPads dominate; every
   interaction must be tap-friendly.
3. **Accessibility bar already set.** Graph blocks do keyboard nav + aria-live
   narration; blanks/MC use native inputs. Matching/ordering must be fully
   keyboard-operable (this is exactly where drag-only UIs fail).
4. **`render(state, refs)` is the only DOM mutator.** Tap-to-select and
   button-based interactions fit this model trivially (handler writes state,
   render repaints). Drag previews/ghosts fight it.
5. **Print story is first-class.** Both types have strong century-old paper
   conventions (write-the-letter matching; number-the-items ordering) the
   print CSS should reproduce, not approximate.

## Block shapes (as decided)

### `matching`

```ts
MatchingItem   { id: uuid, content: InlineNode[], image?, graph? }  // left stem (+ optional figure)
MatchingTarget { id: uuid, content: InlineNode[], image?, graph? }  // right option (+ optional figure)
MatchingBlock {
  id, type: 'matching', number?,
  prompt: InlineNode[],
  items:   MatchingItem[]    (min 2),   // left column, document order
  targets: MatchingTarget[]  (min 2),   // right column; may exceed items (distractors)
  key: Record<itemId, targetId>,        // the correct pairing
  allowTargetReuse: boolean (default false), // many-to-one → categorization-lite
  solution?, hasConfidenceRating?, skills?, workSpace?,       // MC-parity chrome
}
```

- `image`/`graph` reuse ChoiceImage/ChoiceGraph (renamed/shared as needed) —
  kit-free `renderGraphSvg` server-side, `DrawableListEditor` in the editor,
  same `expression`-drawable exclusion.
- Right column renders **lettered (A, B, C…)**, publish-time-shuffled.
- Response map: `matches: Record<blockId, MatchResponse>` where
  `MatchResponse { pairs: Record<itemId, targetId>, correct, earned, total, confidence? }`.
- Scoring: **per-pair** — each pair scored independently (the student's
  pairing IS the assignment; no bipartite machinery needed). `correct` =
  earned === total. Unpaired items score as wrong pairs within an answered
  block; a block with NO pairs made is an omission (absent from the map).

### `ordering`

```ts
OrderingItem { id: uuid, content: InlineNode[] }
OrderingBlock {
  id, type: 'ordering', number?,
  prompt: InlineNode[],
  items: OrderingItem[] (min 2),        // AUTHORED ORDER = CORRECT ORDER
  solution?, hasConfidenceRating?, skills?, workSpace?,
}
```

- Students see the list publish-time-shuffled; they arrange it.
- Response map: `orderings: Record<blockId, OrderResponse>` where
  `OrderResponse { order: itemId[], correct, confidence? }`.
- Scoring: **exact-sequence all-or-nothing.** An untouched list counts as an
  omission (absent from the map) — the runtime tracks "has the student moved
  anything," since a shuffled list is always *some* sequence.
- (Item figures deferred for ordering — no obvious v1 use case; additive.)

## Interaction model (as decided): pointer drag, keyboard grammar underneath

Both blocks are **pointer-drag** (author call: costly but expected), built as
a thin pointer-event layer over a **select-then-place state grammar** that is
also the keyboard path (Tab/arrows to select, Enter/Space to lift, arrows to
target, Enter to drop, Esc to cancel — same grammar family as the graph
widget's keyboard plotting). Pointer events (`pointerdown`/`move`/`up` +
`setPointerCapture`) drive the same state transitions; HTML5 drag-and-drop is
NOT used (broken on touch). All visual updates go through `render()` — the
drag ghost/placeholder is state (`dragging: {id, overSlot}`), not ad-hoc DOM.

- **Matching**: drag a target card from the right column onto a left stem →
  the card **physically docks next to the stem**; its right-column slot
  empties (leaving the letter as a ghost placeholder so print/discussion
  letters stay stable). Drag a docked card away (or press its remove
  affordance) to return it. With `allowTargetReuse`, docking COPIES the card
  (a count-agnostic chip) instead of moving it.
- **Ordering**: drag an item to reorder; a placeholder gap tracks the drop
  position; the list reflows on drop.

## Print convention (decided — decision 9)

- **Matching**: right column lettered; each left stem gets a `____` write-the-
  letter line (reuses the blank print underline treatment). Two-column print
  layout; `break-inside: avoid`.
- **Ordering**: items print in the SHUFFLED order students see, each with a
  small write-in box (`____`) for its sequence number ("Number the steps 1–5").
  Works because the shuffle is publish-time-deterministic (decision 8).

## Import fences (proposed)

~~~
```match
prompt: Match each equation to its graph.
y = 2x + 1 = A
y = x^2 = B
= C            ← target-only line: a distractor
solution: ...
```
~~~

Left `=` right per line (first unescaped ` = ` splits; both sides inline-rich
like mc choice lines). A line starting with `=` adds an unmatched distractor
target. Letters are assigned by the platform, not authored.

~~~
```order
prompt: Put the steps of solving 2x + 3 = 11 in order.
1. Subtract 3 from both sides
2. Divide both sides by 2
3. Check the solution
solution: ...
```
~~~

Numbered or bare lines; listed order = correct order. (Numbers stripped —
they'd leak the answer if the author pasted them shuffled… no: listed order is
correct by definition; numbers are just tolerated decoration.)

Copy-AI prompt + drift guard updated in lockstep, as with ```mc.

## Dashboard (proposed)

- Matching table: per student, each left stem with the chosen letter vs the
  key letter (✓/✗ per pair, earned/total if partial credit lands).
- Ordering table: the student's sequence rendered as `3, 1, 2, …` positions
  (or the item texts in their order) vs correct, ✓/✗.
- `ActivityIndex` grows `matchings`/`orderings` maps; the parity guard tests
  extend to both.

## Explicitly deferred (recorded so they're not re-litigated)

- Per-choice partial credit on MC — author call 2026-07-10: low value, deferred
  indefinitely.
- Categorization/sorting into buckets (T-charts) as a distinct block family —
  related to matching-with-reuse but a different UI; decide only if
  `allowTargetReuse` proves insufficient.
- SVG line-drawing between matched pairs — view-candy on the same state model.
- Ordering partial credit + interchangeable adjacent items — YAGNI (author
  call); both additive without a wire bump.
- Per-pair / per-item feedback (the mistakeFeedback analogue) — additive
  optional fields later; MC shipped with it because distractors are authored
  as anticipated mistakes, which is less clearly true of pairs/sequences.
- Figures on ordering items — additive when a use case shows up.

## Wire / storage / deploy plan

- `SubmissionResponses` **v5→v6**: adds optional `matches` + `orderings` maps
  (one bump covers both types — shipped together). Ingest accepts v1–v6,
  migrates on read; v5→v6 promotion is the usual "bump version, carry maps."
- `STORAGE_SCHEMA_VERSION` **6→7**: blob gains matching/ordering state.
- Runtime: new `runtime/matches.ts` + `runtime/orderings.ts` (mcs.ts shape) +
  a shared drag/select-place helper. Budget: accept growth (decision 10);
  keep scorers pure + DOM-free for Phase 5 server grading.
- Deploy train: `ingest-submission` (`--no-verify-jwt`) BEFORE republish;
  `publish-activity` after `pnpm bundle:renderer`; app deploy. No kit change
  anticipated (figures use the kit-free SVG engine).
