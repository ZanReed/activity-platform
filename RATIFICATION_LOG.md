# RATIFICATION_LOG.md

Prediction-before-reveal outcomes for ratified specs/decisions. Beside TEST_SPEC.md.

## Graph settings extraction — test-spec slice (2026-07-17)

| id | decision | outcome | note |
|---|---|---|---|
| D4 | per-interaction-type coverage depth | predicted | Author agreed with rec: cover all 6 types (distinct save paths, ~7 cheap e2e). |
| D5 | fix axis fight bug (DraftNumberInput) during extraction | predicted | Author agreed: same bug class already flagged for data-plot; fix in-flight rather than touch the file again. Widens "pure refactor" slightly to "refactor + parity fix". |
| D6 | SKIP list (drawer layout, validator copy, board-render, index-keyed mistake editor) | predicted | Author agreed all four → owner manual pass, not automated. |

Also ratified upstream (/plan-eng-review, 2026-07-17, logged in the design doc): D2 shared helpers →
new `graphAnswerHelpers.ts` leaf module; D3 run test-spec before build. No surprises — all
recommendations matched author expectation.

Reading pointers (surprised / no-opinion items): none this round.

## Group 3 sizing slice — test-spec slice (2026-07-17)

| id | decision | outcome | note |
|---|---|---|---|
| SZ-mech | lock M1–M4 (schema / renderer emission ×3 / serialize round-trip / cross-type consistency) as MUST | predicted | Author locked the mechanical set in one pass. |
| SZ-J1 | D3 board re-fit verification layer | predicted | Split: e2e the deterministic DOM cascade (width→.graph-canvas, observer wired), owner manual-QA for the board visual re-fit. Verify at the right layer. |
| SZ-J2 | ImageView regression (growthFactor + gesture) | predicted | Extract growth math as a pure fn + unit-test the 1-vs-2 branches; e2e the gesture lifecycle across all 3 blocks. Flows a small addition into build-task T1 (hook exposes a pure width-calc helper). |
| SZ-skip-print | promote print-scaling snapshot to SHOULD | predicted | 'Print footprint is the driver' per the plan → a print-scaling regression defeats the feature; one cheap print.test.ts snapshot. |
| SZ-skip-column | promote nested-in-column figure to SHOULD | **surprised** | I recommended keeping it SKIP (shared container-measure fn ported from ImageView already exercises nesting). Author values nested figures as a common author pattern worth a pin. |
| SZ-align | align + reset-to-full authoring surface | predicted → **SUPERSEDED** | Originally: width-drag-only, align deferred. **Reversed same session** (author: "I'll want it anyway, might as well have it now") → see SZ-align-r1. |
| SZ-align-r1 | align + reset-to-full BACK IN the slice (reverses SZ-align) | author-directed | Delivered as ONE shared `BlockSizingField` drawer control (D5) across GraphSettings / DataPlotSettings / NumberLineSettings — DRY twin of the shared hook. Reset-to-full CLEARS `width`+`align` to the unsized identity (not `width:1`). Spec updated: SZ-M5/M6 MUST (align write, reset-clears), SZ-M7 SHOULD (shared field renders in all 3 drawers). Two eng calls made & flagged reversible: the shared-component shape, and reset-clears-attrs semantics — neither vetoed. |

| SZ-D6 | drag handles on the 3 authoring NodeViews | author-directed (build-time) | Surfaced during the build: their root wrapper is the whole authoring UI, so a width-drag crushes the editing surface. Reversed the "handles on 3 NodeViews" plan → drawer-only (BlockSizingField) for graph/data-plot/number-line; handles stay image-only. Shared hook still serves image (D1) + reserved for eye-toggle preview mode. Spec: SZ-J2b now image-only. |

| SZ-D7 | editor visual feedback when sizing a figure | author-directed (post-build) | Author caught that D6 (drawer-only) left NO visual change in the editor — feels broken. Added shared `figureSizingStyle` to each view's board/figure region (not the controls); the board re-fits via the D3 JSXGraph resize. Browser-verified: 50% graph renders narrower + centered. Spec: SZ-M9. |

## Image crop mode — test-spec slice (2026-07-17)

| id | decision | outcome | note |
|---|---|---|---|
| CR-mech | lock CR-M1..M5 (schema / renderer emission / serialize round-trip / print snapshot / gesture lifecycle) as MUST | predicted | Author locked the mechanical set in one pass. |
| CR-J1 | render-math verification layer | predicted | Split: unit the emitted CSS string (aspect-ratio + 4 offsets), owner manual-QA the actual visual crop cross-browser (CR-J1b). Verify at the right layer, same as SZ-J1b. |
| CR-skip-guard | promote min-crop-size guard to MUST | predicted | render is width:(100/w)% — w or h → 0 emits Infinity%. Gesture clamps w,h>0 AND render stays finite. Correctness, not fringe (CR-M6). |
| CR-skip-compose | promote crop + width-sizing compose to SHOULD | predicted | Both live on the same .block-image wrapper (--block-width + aspect-ratio); real common combo (CR-S1). |
| CR-srcaspect | srcAspect storage scope | predicted | Both-or-neither: srcAspect stored ONLY alongside crop; uncropped images carry neither → byte-identical to today (preserves the identity invariant). Surfaced by the adversarial completeness read; folded back and ratified. Design doc amended. |

**Fresh-context completeness sweep (independent general-purpose agent, blind to the dialogue) — 8 gaps ratified:**

| id | decision | outcome | note |
|---|---|---|---|
| CR-sweep-must | add 5 MUST gaps | author-directed | CR-M7 gesture coord-mapping (the untested INPUT side — biggest hole), CR-M8 zero/NaN srcAspect guard (REVERSES the SVG skip — sizeless SVG/data-URI fires load, passes CR-INV1, then breaks the render; falsifies the "never Infinity%" promise), CR-M9 cropped-img retains alt/src/loading/decoding (a11y), CR-M10 re-enter-crop preserves the existing rect (data loss), CR-INV3 gesture output always in-bounds (clamp, not schema-reject). |
| CR-sweep-should | add all 3 SHOULD gaps | author-directed | CR-S2 caption+crop (figcaption not clipped), CR-S3 editor↔render parity, CR-S4 crop/width independently removable. |

Sweep verdict: the spec's OUTPUT (render) was well-pinned but the INPUT (gesture) was not, and the just-ratified SVG skip punched through a MUST safety invariant. Both fixed. Reading pointers: the SVG/zero-srcAspect path (CR-M8) and the gesture-basis Open Q#2 in the design doc (CR-M7) are the two build-time watch items.

Reading pointers (surprised / no-opinion items): none in the main dialogue — all five predicted; the sweep additions were author-directed (not prediction items).

## Group 3 sizing slice — additional reading pointers

Reading pointers (surprised / no-opinion items):
- **SZ-skip-column (surprised):** container-width resolution lives in the shared hook's measure fn,
  ported from `ImageView.tsx:50-59` (`containerContentWidth`, walks `parentElement` minus padding);
  the nested case exercises it against a column-cell parent (the columns layout renderer / `layout.ts`
  container). Read these before building SZ-S2 to confirm the column cell is the measured parent.
