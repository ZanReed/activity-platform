# Number-line block (`number_line`)

**Status:** 🔨 IN PROGRESS (2026-07-12). All §3 decisions resolved by the author = the recommended answers (1b both interactions; 2a own `numberLineResponses` map + wire v6→v7 + storage bump; 3a reuse the kit; 4 print-SVG in slice 1; 5 lean config, integer ticks; 6 all-or-nothing; 7 defer import). **Built + committed so far:** schema + wire v7 + ingest (`b5fe4aa`), the static renderer + print/no-JS SVG (`b5fe4aa`), and the pure kit scorer (`592c15b`). **Remaining:** the interactive JSXGraph board + mount entries, the runtime bridge (+storage bump), the editor NodeView (author board + serialize), and the dashboard table — the browser-verified half. As-built deltas: the block is deliberately leaner than the graph block (no partialCredit / allowNoSolution / mistakeFeedback); an interval omits a bound to become a ray (no separate `plot_ray` variant in slice 1).

A 1-D graded block: the student places point(s) and/or drags interval(s) with open/closed endpoints on a single number line. The K-8 / early-algebra counterpart to the 2-D `interactive_graph` block — "graph the inequality on the number line," "plot 3/4," "show all x where x ≥ −2."

## 1. Why now, and why a separate family

- **The template is proven.** `interactive_graph` established the block→kit→pure-scorer shape end to end: a schema block with a discriminated `interaction` union + its own config; a lazy `@activity/graph-kit` widget that mounts/scores; a pure DOM-free scorer; a parallel submission map; an editor NodeView with a WYSIWYG author board; a print/no-JS SVG fallback; a dashboard table. A number line reuses every one of those seams.
- **It's the missing K-8 surface.** Everything graded today assumes either text (blanks/MC/matching/ordering) or a 2-D plane. Number lines are the single most common early-grades math manipulative — integers, fractions, and inequality graphing all live there.
- **Separate family was already decided** (author call, STATE 2026-07-10): number lines are their own block (`number_line`), NOT forced under `interactive_graph`'s 2-D `AxisConfig`. The schema even reserves `EndpointStyle` "for the future number-line family" ([interactive-graph.ts:40](../../packages/schema/src/blocks/interactive-graph.ts)). This doc honors that: `number_line` is a sibling block, not a `GraphInteraction` variant.

## 2. The template it mirrors (real seams)

| Concern | `interactive_graph` seam | `number_line` parallel |
|---|---|---|
| Block schema | `InteractiveGraphBlock` + `GraphInteraction` union ([blocks/interactive-graph.ts](../../packages/schema/src/blocks/interactive-graph.ts)) | new `NumberLineBlock` + `NumberLineInteraction` union |
| Config | `AxisConfig` (2-D) | new lean `NumberLineConfig` (1-D) — decision 5 |
| Endpoint vocab | `EndpointStyle` (open/closed) — already shared | reuse as-is |
| Block registration | `blocks/index.ts` (Block union + `ColumnCellBlock`), `factories.ts` | same two unions + a factory |
| Widget | `board.ts` `createPointAnswerBoard` (lazy JSXGraph) | new 1-D board in the kit — decision 3 |
| Scorer (pure) | `graph-score.ts` `isPointCorrect` etc. | new pure scorer (values + endpoint styles) |
| Runtime | bridge `runtime/graph-integration.ts` + kit `graph-kit/src/runtime.ts` `attachGraphRuntime`; `graphs` storage map | reuse the bridge/attach seam; response map + storage — decision 2 |
| Submission map | `graphResponses` on `SubmissionResponses` ([submission.ts](../../packages/schema/src/submission.ts)) | new parallel map — decision 2 |
| Print / no-JS | `renderGraphSvg` fallback | new 1-D SVG fallback — decision 4 |
| Editor | `InteractiveGraphView` NodeView + WYSIWYG author board + `DrawableListEditor` | parallel NodeView + author line |
| Dashboard | "Graph questions" table | "Number line" table |
| Import | ```graph``` fence | ```numberline``` fence — decision 7 |

## 3. Decisions needed (please yes/no or pick per item)

**Decision 1 — Slice-1 interaction scope.**
The `interaction` union should be discriminated from day one (like `GraphInteraction`) so later variants are additive. Which ship in slice 1?
- (a) `plot_point` only — the strict mirror of graph slice 2.7a (place one or more points; "plot −2 and 5").
- (b) `plot_point` **and** `plot_interval` — an interval/ray with open/closed endpoints ("graph x ≥ −2", "−3 < x ≤ 4"). This is the highest-value K-8 use and the reason a number line beats a plain numeric blank.
- **Recommendation: (b).** A number line whose headline feature (inequality graphing) is deferred undersells the block; `plot_interval` is where `EndpointStyle` pays off. `plot_ray` folds in as a degenerate unbounded-one-side interval; `display` (static stimulus) is reserved as a later variant either way.

**Decision 2 — Response map + version bumps.**
Standing rule (CLAUDE.md): a new response category gets its **own parallel map** on `SubmissionResponses`, never a widened existing one.
- (a) New `numberLineResponses` map keyed by block.id, its own response type → wire bump (v6→v7, ingest accepts 3–7) + `STORAGE_SCHEMA_VERSION` bump (blob gains a `numberLines` map).
- (b) Reuse `graphResponses` with a 1-D response variant — no wire/storage bump, but conflates two block families in one map and bends the standing rule.
- **Recommendation: (a).** It's the disciplined path and matches every prior question-type. Cost is a deploy-ordering dance: **redeploy `ingest-submission` BEFORE republishing** (wire bump) — the standing rule already in CLAUDE.md.

**Decision 3 — Widget: reuse the kit's JSXGraph board, or a light hand-rolled SVG widget?**
- (a) Reuse `@activity/graph-kit` (one lazy kit; a 1-D JSXGraph board = a single axis with draggable glider(s)). Compounds the kit-reuse story; keyboard/SR narration and snap logic come along.
- (b) Hand-roll a small dedicated 1-D SVG+pointer widget so a K-8 page with only number lines doesn't pull the whole graph kit.
- **Recommendation: (a).** The kit is already lazy (only fetched on a page that has a widget), the scoring/keyboard/restore machinery is battle-tested, and a second interaction paradigm is a maintenance tax. Revisit (b) only if kit weight on number-line-only pages ever bites.

**Decision 4 — Print / no-JS static SVG fallback in slice 1?**
K-8 worksheets are print-heavy, so a number line that only exists in JS is half a feature on paper.
- **Recommendation: YES, in slice 1** — a `renderNumberLineSvg` parallel to `renderGraphSvg` (draw the axis, ticks, points, and interval bars with open/closed endcaps; answer-key variant fills them in). Non-negotiable for this audience; not a follow-up.

**Decision 5 — `NumberLineConfig` shape + labeling scope.**
Proposed lean config: `{ min, max, tickStep, minorTicksPerStep?, snapToTick (default true) }`. Open sub-questions:
- (a) Slice-1 labels: **integer ticks only**, fraction/decimal tick labels deferred? (Recommend yes — integer ticks first.)
- (b) Fraction/decimal *answers* still allowed even with integer labels (a student can place a point at 0.5 between ticks when snap is off)? (Recommend yes — value-based scoring, see decision 6.)
- (c) Custom per-tick labels (e.g., label ticks as ¼, ½, ¾) — defer to a follow-up? (Recommend defer.)

**Decision 6 — Scoring model.**
- Points: correct iff `|studentX − keyX| ≤ tolerance` (tolerance in line units, default suits snap-to-tick). Value comparison reuses the numeric-blank parsing spirit (½ == 0.5) — **decision 6a: do we reuse the runtime's numeric parser for the answer-key authoring field, or keep keys as plain numbers?** (Recommend plain numbers in the key; fraction *display* is a labeling concern.)
- Intervals: correct iff endpoints match within tolerance **and** each endpoint's open/closed style matches exactly **and** direction matches. **Decision 6b: endpoint-style mismatch = fully wrong, or partial credit?** (Recommend all-or-nothing per interval, mirroring MC/matching's set-equality; partial credit is a documented later lever, not slice 1.)

**Decision 7 — Markdown ```numberline``` import in slice 1, or defer?**
The ```graph``` fence shipped *after* the graph block, once the shape settled.
- **Recommendation: defer.** Build the block + editor first; add the fence (and the Copy-AI prompt line + drift-guard test) as a fast follow once the authored shape is proven — same sequence graph followed.

## 4. Proposed slice plan (once decisions land)

Assuming the recommended answers (1b, 2a, 3a, 4-yes, 5 lean, 6 all-or-nothing, 7 defer):

1. **Schema** — `NumberLineBlock` + `NumberLineConfig` + `NumberLineInteraction` union (`plot_point`, `plot_interval`); register in the Block + `ColumnCellBlock` unions and `factories.ts`; new `NumberLineResponse` union + `numberLineResponses` map (wire v6→v7); `STORAGE_SCHEMA_VERSION` bump. Guard tests per the README add-a-block-type checklist.
2. **Renderer** — block shell (prompt, focusable `role=application` line, aria-live) + data-attrs threaded like the graph block; `renderNumberLineSvg` print/no-JS fallback; screen + print CSS.
3. **Kit** — 1-D board (`createNumberLineBoard`: draggable point glider(s) + interval handles with open/closed caps, snap, keyboard nudge/Shift-fine) + pure scorer (`scoreNumberLine`) + a `mountNumberLineQuestion` entry that lazy-imports the board. Browser-verify at a new `/dev/number-line` harness.
4. **Runtime** — walk the block in the bridge, mount/score/restore through `attachGraphRuntime`'s seam, fold into checkpoint + submit payload (`numberLineResponses`), persist in the `numberLines` storage map. Redeploy `ingest-submission` before republishing (wire bump).
5. **Editor** — NodeView with a WYSIWYG author board (teacher places the key) + a numeric list editor (mirror `DrawableListEditor`); slash-menu + Insert entry; serialize round-trip; columns content expr.
6. **Dashboard** — `numberLines` index map + a "Number line" table (plotted value/interval vs key).

Follow-ups (post-slice-1): ```numberline``` import fence, `plot_ray`/`display` variants, fraction tick labels, interval partial credit.

## 5. Cost / risk notes

- **Wire + storage bump** is the only "careful" part (deploy ordering). Everything else is additive and touches no existing block.
- **Bundle:** the widget rides the kit (lazy), so the base/ graphs runtime bundles are unaffected; the graphs variant is currently 38.0 KiB against a 40 KiB soft target, so keep the *bridge* side thin (init walk + score fold only), exactly as the graph bridge does.
- **Reuse compounds:** `EndpointStyle`, the lazy-kit pattern, `attachGraphRuntime`, the print-SVG approach, and the author-board WYSIWYG idea all transfer with near-zero new concepts — which is the whole argument for doing `number_line` before `data_plot`.
