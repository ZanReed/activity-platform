# TEST_SPEC.md

`test-spec v1 · 2026-07-17` · single source of truth for what must be proven. Tests are built
FROM this file; amend per slice, never clobber.

**Graph-extraction slice: RATIFIED + BUILT + GREEN 2026-07-17** (`ffa0116` + `44c7ea3`).
13 e2e in `packages/app/e2e/graph-settings.e2e.ts` (all 5 INV1 per-type + P6/P7/S1/S3/S7/S8/E1);
U1 covered by existing `serialize.test.ts`. Acceptance scenario green across all types. **Owed:
the author's manual QA pass** (per D6). Ratified calls (see RATIFICATION_LOG.md):
D4 → cover all 6 interaction types; D5 → convert axis fields to DraftNumberInput (fix the
fight bug in-flight, +no-NaN test); D6 → skip list confirmed (drawer layout, validator error
copy, board-render effect, index-keyed mistake editor → owner manual pass).

**Group 3 sizing slice: RATIFIED 2026-07-17 — spec only, NOT yet built.** Now includes the
align + reset-to-full authoring surface (author reversal, D5 — shared `BlockSizingField` drawer
control). See the "Slice: Group 3 sizing" section below (SZ-M1..M6 MUST, SZ-J1/J2 MUST, SZ-M7/S1/S2
SHOULD; one owner manual-QA verify act SZ-J1b). Build order + tasks: design doc "Sizing slice — eng review".

---

## Slice: interactive-graph settings → descriptor-drawer extraction

**Under test:** the `interactive_graph` settings migration (editor-refinement-pass Group-2 tail).
**Design reference:** [docs/design/editor-refinement-pass.md](docs/design/editor-refinement-pass.md)
→ "Eng review — interactive-graph settings extraction" (CLEARED 2026-07-17).
**Slice boundary:** covers ONLY the graph settings→drawer extraction. Out of slice: Group 3
(sizing, multi-part answers), the already-shipped data-plot / blank-popover / prompt-on-top work.

**Acceptance statement:** *Trusted to ship when every interaction type's settings still read and
write correctly through the Advanced drawer, the interaction `type` is never mutated by a settings
write, the inline "⚙ Advanced settings" bar is gone, and the worked-solution + mistake-feedback
rich fields write from inside the drawer.*

**Where the risk concentrates:**
1. **Type-narrowed `interaction` writes** — each tolerance row replaces `node.attrs.interaction`
   with a type-specific shape; a botched spread drops answer fields or changes `type`. Highest blast
   (silent mis-grading).
2. **Rich fields relocated into the drawer** — worked solution + mistake feedback use nested Tiptap
   (`InlineRichTextEditor`) rendered in the drawer portal, not the NodeView. The riskiest relocation.
3. **Per-interaction-type divergence** — 5 distinct tolerance rows; a regression can silently hit
   one type only.

### Must-test index

| # | behavior | traces to | anchor | method | tier |
|---|---|---|---|---|---|
| D1 | inline "⚙ Advanced settings" disclosure gone from the block | design (migration req) | design-anchored | e2e | MUST |
| D2 | settings reachable via quick-bar ⚙ → command bar → Advanced drawer | design (migration req) | design-anchored | e2e | MUST |
| D3 | block keeps a display-only settings summary readout | design (parity w/ other blocks) | design-anchored | e2e | MUST |
| INV1 | a settings write NEVER changes `interaction.type` and preserves the type's other answer fields | design (behavior-unchanged) | design-anchored | e2e/property | MUST |
| P1 | plot_point — Tolerance reads + writes `interaction.tolerance` | code (settings panel) | code-pin | e2e | MUST |
| P2 | plot_function — model tolerance field(s) read + write | code | code-pin | e2e | MUST |
| P3 | plot_ray — Endpoint tolerance reads + writes | code | code-pin | e2e | MUST |
| P4 | plot_segment — Endpoint tolerance reads + writes | code | code-pin | e2e | MUST |
| P5 | shade_region — Min. overlap reads + writes (clamped 0..1) | code | code-pin | MUST |
| P6 | graph_inequality — no tolerance row (correctly absent); shared settings present | code | code-pin | e2e | SHOULD |
| P7 | display — axis present; NO solution/confidence/mistakes | code | code-pin | e2e | MUST |
| S1 | axis config (min/max + grid steps) reads + writes; **converted to DraftNumberInput** (clear+blur restores, no NaN — ratified D5) | code + Group-1 fix parity | code-pin | e2e | MUST |
| S3 | worked-solution rich field writes `solution` from the drawer | code (high-risk relocation) | code-pin | e2e | MUST |
| S4 | confidence toggle reads + writes | code | code-pin | e2e | SHOULD |
| S5 | partial-credit toggle reads + writes | code | code-pin | e2e | SHOULD |
| S6 | allow-no-solution toggle writes; nested noSolutionCorrect reveals + writes | code | code-pin | e2e | SHOULD |
| S7 | auto-feedback (builtinFeedback) toggle present, DEFAULT ON, reads + writes | design (stays default-on) + code | design-anchored | e2e | MUST |
| S8 | mistake feedback — add entry, edit match, edit rich feedback → writes `mistakeFeedback` | code (high-risk) | code-pin | e2e | MUST |
| E1 | switching interaction type (inline picker) while the drawer is OPEN swaps the tolerance row to match the new type | code (adversarial sweep) | code-pin | e2e | SHOULD |
| U1 | serialize round-trip: a fully-configured graph survives tiptap→activity→tiptap unchanged | code (existing serialize) | code-pin | unit | MUST |

### Invariants (property candidates)
- **INV1 (the load-bearing one):** for every interaction type, opening the drawer and writing any
  one setting leaves `interaction.type` unchanged and every non-edited field of the type-narrowed
  shape intact. This is THE refactor invariant — the setNodeAttr('interaction', {...spread}) paths
  are where a regression lives.
- **U1:** serialize round-trip identity for a graph carrying all settings (axis, tolerance, solution,
  confidence, partial-credit, no-solution+correct, builtinFeedback, mistakes). Existing serialize
  tests likely cover the shape; confirm/extend rather than duplicate.

### Failure modes & edge cases — triaged
- **MUST** — tolerance write for type X preserves X's other answer fields (INV1). likelihood mod /
  blast high (grading) / cost low.
- **MUST** — solution + mistake rich fields actually write from the drawer portal (nested Tiptap +
  FieldFocusContext). likelihood mod / blast high (lost authoring) / cost low.
- **SHOULD** — axis numeric field: clearing + blur doesn't commit NaN (only if converted to
  DraftNumberInput — see Judgment J2).
- **SKIP (logged):**
  - drawer pixel layout / spacing → manual-QA, owner eyeball. Cosmetic; blast low.
  - per-type mistake-match VALIDATOR error copy (the "Type coordinates, like (4,3)" strings) →
    cosmetic; relocated verbatim; not worth an assertion.
  - showGrid/snapToGrid EFFECT on the rendered board → that's board rendering, not a settings write;
    unchanged by this refactor.
  - mistake-feedback `InlineRichTextEditor` keyed by index (pre-existing fragility) → not worsened
    here; flagged for a glance during build, not a spec item.

### Out of scope
Group 3 (graph/image sizing, multi-part answer add, default seeds), auto-feedback default-flip
(dropped per author), the graph *scoring* logic itself (unchanged — this is authoring UI only), the
board/answer authoring surface (only the settings move).

### Verification plan
- **Automated (design-anchored, author BLIND to the diff):** D1, D2, D3, INV1, S7 — these encode the
  migration's intended behavior and can honestly fail. Built from design doc + this spec.
- **Automated (code-anchored pins, may read the code):** P1–P7, S1, S3–S6, S8, U1 — regression pins
  on relocated behavior; born green.
- **Human manual-QA pass (owner):** open a graph of each type on /playground, gear→Advanced, eyeball
  the drawer renders the right fields and the rich editors accept input; predict-then-run on one type,
  break-it-on-purpose on the tolerance write (clear it, confirm sane). Logged in RATIFICATION_LOG.
- Playwright is authoritative (the in-app browser pane suppresses the position-measured drawer under
  JS-driven selection); drive via node-selection + gear + Advanced, mirroring the DataPlotSettings e2e.

### Acceptance scenario (ship gate)
One e2e journey per interaction type (data-driven): insert the type → node-select → quick-bar ⚙ →
Advanced → assert the type-appropriate tolerance row is present and writing it updates the
`interaction` attr WITHOUT changing `type` → for a graded type, write the worked solution and confirm
`solution` is set. Plus: the inline "⚙ Advanced settings" bar is absent on all types. Green across all
types + the owner manual pass = shippable.

### Trust check
INV1 and S8 are load-bearing. Verify the tests actually detect faults: for INV1, the assertion must
read back the FULL interaction object and check `type` + a sibling field, not just the edited value
(a test that only asserts the edited value would pass even if the write clobbered `type`). Mutation
sanity: a build that changes `type` on write, or drops the mistake array, must turn these red.

---

## Slice: Group 3 sizing — graph/data-plot/number-line width + shared resize hook

`test-spec v1 · 2026-07-17` · RATIFIED (dialogue outcomes in RATIFICATION_LOG.md).

**Under test:** the Group 3 sizing slice — `...sizingFields` on `interactive_graph` / `data_plot` /
`number_line`; `sizingClass()`+`sizingAttrs()` emission in their 3 renderers; NEW shared
`useBlockWidthResize` hook (extracted from ImageView); width drag-handles on the 3 NodeViews;
**ImageView refactored onto the hook (regression surface)**; interactive-graph board
`--block-width`→`.graph-canvas` + `ResizeObserver→board.resize()` (D3).
**Design reference:** [docs/design/editor-refinement-pass.md](docs/design/editor-refinement-pass.md)
→ "Group 3 → Sizing slice — eng review" (CLEARED 2026-07-17, D1–D4).
**Slice boundary:** covers width sizing for the 3 figure blocks + the hook extraction + the board
re-fit + the **align + reset-to-full authoring surface** (author reversal 2026-07-17, D5 — a shared
`BlockSizingField` drawer control in GraphSettings / DataPlotSettings / NumberLineSettings).
**Out of slice:** image crop (own design pass); folding the image popover onto `BlockSizingField`
(later follow-up); multi-part answer add + default seeds (→ Desmos rebuild); answers-collapsible
(→ eye toggle).
**No `schemaVersion` / no `STORAGE_SCHEMA_VERSION` bump** — sizing is authoring-time, baked into
published HTML at publish; additive optional `width`/`align`; no ingest redeploy.

**Acceptance statement:** *Trusted to ship when a width authored on a graph / data-plot / number-line
round-trips and renders as `.block-sized` + `--block-width` identically across all three types; the
shared hook preserves every ImageView drag behavior (the image-resize regression pins stay green);
and a sized interactive graph mounts its board at the narrowed box and re-fits on container resize
with no clip (owner-confirmed).*

**Where the risk concentrates:**
1. **The ImageView hook extraction** — the `growthFactor` 1-vs-2 branch and the gesture lifecycle
   have ZERO tests today; the refactor can silently drop a behavior. Highest-likelihood regression.
2. **The mounted interactive board re-fit (D3)** — the one genuinely-new behavior; the DOM cascade
   is cheap to assert but the board's visual re-fit needs the human pass. High blast (a phone-width
   graph renders at desktop width and clips).

### Must-test index

| # | behavior | traces to | anchor | method | tier |
|---|---|---|---|---|---|
| SZ-M1 | 3 block schemas accept optional `width`∈(0,1] + `align`; reject width≤0 or >1 | design (sizing contract) | design-anchored | unit | MUST |
| SZ-M2 | renderer: sized → `.block-sized` + `--block-width:<pct>%`; `align` left/right → `data-block-align`; unsized → NEITHER (identity) | design (generic sizing path) | design-anchored | unit | MUST |
| SZ-M3 | serialize round-trip: a sized block's `width`/`align` survive tiptap→activity→tiptap; unsized stays omitted | code (serialize.test.ts) | code-pin | unit | MUST |
| SZ-M4 | one authored width → identical `--block-width` pct across all 3 block types | design (D4 consistency) | design-anchored | unit | MUST |
| SZ-M5 | `BlockSizingField` in each drawer: setting align left/center/right writes `align` (and center = clears/omits) → renders `data-block-align`; end-to-end on all 3 blocks | design (D5) | design-anchored | e2e | MUST |
| SZ-M6 | reset-to-full CLEARS `width`+`align` → block returns to the unsized omit-when-default identity (NOT `width:1`) | design (D5) | design-anchored | e2e | MUST |
| SZ-M7 | one shared `BlockSizingField` renders in all 3 drawers (DRY — not 3 divergent copies); width readout reflects the current attr | design (D5) | design-anchored | e2e | SHOULD |
| SZ-M9 | editor preview (D7): setting a width applies `figureSizingStyle` (width:X% + max-width:none) to the block's figure/board region so the author sees the change | design (D7) | design-anchored | e2e | MUST |
| SZ-J1a | renderer emits `.block-sized` + `--block-width` on the graph block with `.graph-canvas` inside (the CSS cascade path) | design (D3) | design-anchored | unit (via SZ-M2) | MUST |
| SZ-J1b | mounted board visually re-fits when its container narrows (author width + viewport relax), no clip/overflow — JSXGraph built-in `resize` | design (D3) | design-anchored | **manual-QA (owner verify act)** | MUST |
| SZ-J2a | growth math: drag→width honors `growthFactor` 1 (aligned) vs 2 (centered) | design (behavior-preserved) + code | design-anchored | unit (pure fn) | MUST |
| SZ-J2b | gesture lifecycle: commits ONCE on release; Escape / pointercancel abort with NO commit (IMAGE only — D6: graph/data-plot/number-line are drawer-sized, no handles) | design (behavior-preserved) | design-anchored | e2e | MUST |
| SZ-M8 | serialize round-trip: a sized+aligned graph/data-plot/number-line survives tiptap→activity→tiptap; unsized omits width/align | code (serialize.ts) | code-pin | unit | MUST |
| SZ-J2c | `image-sizing.test.ts` stays green through the ImageView refactor | code (regression) | code-pin | unit | MUST |
| SZ-S1 | print: sized static SVG scales to `--block-width` in `@media print` (3 blocks) | design ("print footprint is the driver") | design-anchored | unit snapshot | SHOULD |
| SZ-S2 | sized figure nested in a column cell resolves width vs the COLUMN, not the page | code (shared container-measure fn) | code-pin | e2e | SHOULD |

### Invariants (property candidates)
- **SZ-INV1 (identity):** renderer emission for an UNSIZED block is byte-identical to today — no
  `.block-sized`, no `--block-width`, no `data-block-align`. The omit-when-default rule; a property
  test over `{width: undefined, align: any}` should never emit sizing markup. **Reset-to-full must
  land back on this identity** (SZ-M6): after reset, the block's attrs and emission equal the
  never-sized case exactly.
- **SZ-INV2 (consistency):** one authored width fraction produces the same `--block-width` pct on all
  three block types (SZ-M4 as an invariant — the shared render path guarantees it).
- **SZ-INV3 (commit bounds):** the hook's committed width is always `clamp+snap(rawFraction)` — in
  `[MIN_WIDTH_FRACTION, 1]`, snapped when snap is on. Mostly covered by the existing `imageSizing`
  math tests; SZ-J2a exercises it through the extracted helper.

### Failure modes & edge cases — triaged
- **MUST** — ImageView refactor drops `growthFactor:2` → centered images resize at half speed.
  likelihood mod / blast mod (silent UX) / cost low → SZ-J2a + SZ-J2c.
- **MUST** — sized interactive graph renders desktop-width on a narrow phone (D3 not wired) →
  overflow/clip. likelihood mod / blast high (unusable graph) / cost mixed → SZ-J1a (DOM, cheap) +
  SZ-J1b (board, manual).
- **SHOULD** — print static SVG doesn't scale to the authored width. likelihood low / blast mod
  (the feature's stated driver) / cost low → SZ-S1.
- **SHOULD** — nested-in-column figure resolves width against the page not the column. likelihood
  low / blast mod / cost low → SZ-S2. *(Promoted from SKIP by author — RATIFICATION_LOG SZ-skip-column, surprised.)*
- **MUST** — reset-to-full leaves `width:1` (or a stale `align`) instead of clearing → the block
  never returns to the unsized identity, serialize round-trip breaks, and stored docs bloat with a
  redundant attr. likelihood mod / blast mod / cost low → SZ-M6 (+ guards SZ-INV1/SZ-M3).
- **SHOULD** — `align` written but `width` absent → must be a no-op (align without width has nothing
  to align; the schema/renderer already treat it as inert). Confirm `BlockSizingField` disables/omits
  align when the block is full-width. → part of SZ-M5.
- **SKIP (logged):**
  - `board.resize()` throttle/debounce under a rapid-resize storm → perf-only; add a throttle only
    if QA shows jank (NOT-in-scope). blast low, cost high.
  - `align` pixel-perfect visual placement (the left/center/right margin is generic `.block-sized`
    CSS already proven for images) → emission is tested (SZ-M2/M5); the on-screen placement is an
    owner eyeball folded into the SZ-J1b manual pass. cosmetic, blast low.

### Out of scope
Image crop mode; folding the image popover onto the shared `BlockSizingField` (later follow-up); the
graph *scoring*/authoring surfaces; the Desmos expression-list rebuild; the "preview as student" eye toggle.

### Verification plan
- **Automated (design-anchored, author BLIND to the diff):** SZ-M1, SZ-M2, SZ-M4, SZ-M5, SZ-M6,
  SZ-M7, SZ-J1a, SZ-J2a, SZ-J2b, SZ-S1 — encode the design's intended sizing + align/reset behavior;
  can honestly fail. Built from the design doc + this spec, not the diff.
- **Automated (code-anchored pins, may read the code):** SZ-M3, SZ-J2c, SZ-S2 — regression pins;
  born green.
- **Human manual-QA pass (owner) — SZ-J1b:** open a sized interactive graph on a published/preview
  page; **predict-then-run** — resize the window narrow, watch the board reflow to fit; **break-it**
  — set a narrow width and confirm no clip/overflow at the board edge. Logged in RATIFICATION_LOG.
- **Build note (from SZ-J2a):** the hook must expose the drag→width calc as a **pure helper**
  (`startPx, outwardPx, growthFactor, containerPx → fraction`) so the `growthFactor` branch is
  unit-testable without a live pointer. Feed this into build-task T1.

### Acceptance scenario (ship gate)
Author drags a graph, a data-plot, and a number_line each to ~50% → all three render `.block-sized`
+ `--block-width:50%` (SZ-M2/M4) → in each block's drawer, `BlockSizingField` sets align → right →
renders `data-block-align="right"` (SZ-M5) → hitting reset-to-full clears the attrs and the block
returns to full-width identity (SZ-M6) → serialize round-trip preserves the sized+aligned state and
omits the reset one (SZ-M3) → published page: the sized interactive graph mounts its board at the
narrowed box, and resizing the viewport < 640px re-fits the board with no clip (SZ-J1a automated +
SZ-J1b owner-confirmed) → print preview shows all three scaled (SZ-S1) → an image resize still
behaves identically (SZ-J2c green). Green automated layer + owner manual pass = shippable.

### Trust check
Load-bearing: SZ-J2a (growth math) and SZ-J1a (DOM cascade). SZ-J2a must assert BOTH branches — a
test that only checks the aligned (`growthFactor:1`) case would stay green even if centered growth
broke; assert a centered drag yields `2×` the width delta. SZ-J1a must read the ACTUAL
`.graph-canvas` computed width + confirm the observer callback fired, not just that the outer block
has `--block-width`. Mutation sanity: a build that hardcodes `growthFactor:1`, or stops cascading
width to `.graph-canvas`, must turn these red.
