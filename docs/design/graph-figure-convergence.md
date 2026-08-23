# Graph-figure convergence — `GraphFigure.tsx` → `renderGraphSvg`

**Status:** ENG-REVIEWED 2026-08-23 (10 findings + outside voice, 0 unresolved) — awaiting devex review, then build.

Closes the TODOS entry "Converge the two SVG engines" (filed by the
choice-figures eng review, E2/CQ-2), which 2026-08-23 scoping turned from
cleanup into a latent content-loss bug.

## The finding that changed the shape

**There is no `line` drawable kind.** A line is
`{ kind: 'curve', model: { family: 'linear', … } }` (`graph-primitives.ts:165`).
Verified by running the importer on the format doc's own headline example for
this block — `graph: line y = 2x + 1` in a ```reference fence — which yields a
`curve` drawable. `GraphFigureView.tsx` offers `curve` too (it filters only
`expression`), and **its preview already renders through `renderGraphSvg`**
("the preview IS the published output", `GraphFigureView.tsx:13`) — so the
teacher sees the line and the student does not.

[GraphFigure.tsx](../../packages/viewer/src/blocks/GraphFigure.tsx) draws
`point`/`segment`/`ray`/`polygon` and returns `null` for `curve` and
`expression`. So **every line** — "these two lines are parallel", the block's
stated reason to exist — renders as an empty grid on screen and on paper. Its
header says the authoring UI "only offers kit-free drawables, so this is a
guard against future drift, not a live gap"; that sentence is false on both
authoring surfaces.

Not yet a live loss: the DB holds **zero `graph_figure` blocks** (29 versions,
7 drafts, `$.**` query 2026-08-23). The trap is armed, not sprung.

**Refusing `curve` at authoring — the interim guard first proposed — is wrong**:
it would refuse every line and leave a figure block that draws only points and
polygons.

## Two more claims with no code beside them (P11)

1. [ChoiceFigure.tsx:48-52](../../packages/viewer/src/blocks/ChoiceFigure.tsx)
   says `choiceFigurePreload` warms the engine chunk and `printReadiness` waits
   on `data-figure-pending`. **Neither exists.** `kitPreload.ts` warms only
   JSXGraph; `printReadiness.ts` polls `[data-math-pending]`, lazy Suspense
   fallbacks and images, never `[data-figure-pending]`. The choice-figures doc
   ticks T0b `[x]` for exactly this work.
2. `GraphFigure.tsx`'s header, quoted above.

## THE RULING THAT RESHAPED THE PLAN — ruling 9 (outside voice, accepted)

The first draft kept the engine lazy (eager component, dynamic import) and
built six mechanisms around that seam: a pending marker, a `printReadiness`
wait, a preload walk (with an offline role, because the service worker caches
`/assets/*` CacheFirst at runtime only), a reset-on-failure retry, an extracted
loader module, an sw-lane offline e2e row, and a perf absence row. All ruled.

The outside voice measured the thing the review had estimated: the built
`graph-svg` chunk is **3,254 B gz** (the 5.07 KiB figure in TODOS was the whole
`static-svg` subpath, whose lazy import actually fetches FIVE chunks ≈ 6.5 KiB),
against a shell at 143.2 KiB under a 158 cap. **A static import costs ~3.4 KiB
of 14.8 KiB headroom and deletes every one of those mechanisms**, plus the T0b
promise itself: nothing to preload, nothing to wait on, offline works because
the engine is in the shell, and paper is correct by construction — a
synchronous figure cannot be captured half-rendered (the foldable's
`capture.ts:174-180` takes `outerHTML` after readiness; a placeholder there
would have been permanent booklet content).

**Ruled 9A: static import from `@activity/graph-kit/static-svg` in BOTH figure
components; the lazy seam is deleted, not fixed.** This consciously reverses
the choice-figures ruling E1/T0 (2026-08-22, "dynamic engine import").
Rulings 1A, 2A, 3A, 7A, 8A and D2/D3 of this review were made on the lazy
premise and are superseded; they are recorded below so the reasoning is not
re-derived. D16 ("eager statics, lazy heavies") was written for 20+ KiB
heavies; a 3 KiB engine is a static.

**Measure at build, do not assume:** `node scripts/check-perf-budget.mjs`
before and after. Expected shell delta ≈ +3.3 KiB gz minus the ~0.9 KiB
hand-rolled engine that leaves. If rollup fails to tree-shake the subpath's
number-line/data-plot siblings (graph-kit has no `sideEffects` flag), add a
`./static-svg/graph-svg` export to `packages/graph-kit/package.json` and import
that instead — do not accept +6.5 KiB silently.

## What ships

**Viewer-only.** No schema change, no sanitize change, `SANITIZER_REV` unmoved,
no server bundle regeneration (verify with `pnpm bundle:viewer-server` showing
zero diff — ruled, not assumed; `registry.ts` is inside that bundle), no deploy.

### D1 — `GraphFigure` renders through `renderGraphSvg`, synchronously

```
  block.axis, block.drawables
        │
        ▼
  renderGraphSvg(axis, drawables, block.id)      ← graph-kit/static-svg, static import
        │
        ├── ''  (degenerate window)  ──►  <figure> 'Figure unavailable' (ruling 6A)
        │
        ▼
  <figure class="viewer-figure" role="img" aria-label="Graph figure">   (ruling 5A)
     <span dangerouslySetInnerHTML={svg}/>      ← the ONE seam; input is always engine output
  </figure>
```

Delete the hand-rolled engine and the false header paragraph. `expression`
drawables stay undrawn — the engine documents that limitation
(`graph-svg.ts:18-21`) and both authoring surfaces refuse them (the importer
warns and skips, `markdownToTiptap.ts:2490`; the editor filters the kind).

### D1′ — `ChoiceFigure` loses its two-state dance

`loadSvgEngine`, `svgEngineResident`, `residentEngine`, the `useEffect`, the
reserved-box placeholder and `data-figure-pending` all go. The graph branch
becomes `drawGraph(graph, uid)` inline; the `''` case takes the same A8-style
"Figure unavailable" span the image branch already has (ruling 6A). The header
paragraph claiming a preload and a readiness wait is deleted, and its ASCII
data-path diagram redrawn without the lazy hop.

### D4 — Sizing, theme, accessibility

- **Own cap token (OV-a):** `--vw-figure-cap` is the 11rem CHOICE thumbnail
  cap; a standalone figure at 11rem is a 45% shrink from today's 20rem. Add
  `--vw-figure-cap-standalone: 20rem` (print: `--vw-figure-cap-standalone-print`,
  page-width-bounded) and a `.viewer-figure svg { max-width: …; display: block }`
  rule — the engine's `<svg>` carries `class="graph-paper"`, which no viewer
  CSS styles today.
- **Dark mode (OV-b):** the engine hardcodes `#cbd5e1`/`#64748b`/`#475569`
  and no `[data-theme]` rule touches it. Verify in the browser on the dark
  theme before trusting it; add a figure row to `dark-contrast.e2e.ts`.
- **Accessible name (ruling 5A):** wrapper `role="img" aria-label="Graph
  figure"`; the engine's `<svg>` is `aria-hidden` by construction. A derived
  label was rejected as inventing meaning the teacher never wrote.
- **Glossary (OV-c):** `DefinitionGlossary.tsx:133` renders `GraphFigure`
  directly with `mode="print"` behind an `as never` cast; the component never
  accepted `mode`. Delete the prop and the cast. Synchronous rendering means
  the glossary (hidden on screen, revealed in print) needs nothing else.

### D5 — Guards bound to RENDERED OUTPUT

1. **`graph_figure` print row gains `drawable-count { zero: false }`** (OV-d):
   the engine emits `data-drawables="N"` and `printExpectations.ts:103` already
   has the expectation kind. That is the contract the other static figures use;
   "a `<path>` exists" is the weaker guard.
2. **`figure/capped` is split** (OV-e / ruling 4A): today's comma-list target
   `.viewer-image__img, .viewer-figure__svg` stays green via the image half
   even when the figure half matches nothing. Two rows, each targeting markup
   the viewer owns (`.viewer-figure > svg` for the figure), each with a
   non-vacuity count in `print-rules.e2e` — the target must match ≥1 element
   on the fixture route.
3. **The viewer fixture's `graph_figure` gains a linear `curve`** beside its
   point, so every fixture-driven lane (print-rules, a11y, dark-contrast,
   baselines) exercises the path that was empty. Bond once that the sanitized
   projection carries `model` through (`sanitize: { strip: [] }`).
4. **`GraphFigure.test.tsx`** (new): linear curve → a stroked `<path>` inside
   `.viewer-figure` and `data-drawables="2"`; zero drawables → axes only,
   `data-drawables="0"`; degenerate axis → "Figure unavailable", no `<svg>`;
   wrapper `role="img"` + label present, inner `<svg>` `aria-hidden`.
   **Mutation-test once:** stub the engine to skip curves and watch the first
   row go red.
5. **`choice-figures.test.tsx`**: existing rows stay green without the
   `await settled` dance (keep the awaits — they are harmless); add the `''`
   fallback row. **Regression rule:** the graph branch's rendering changes for
   existing callers, so the existing "renders an authored choice GRAPH as real
   drawn SVG" row is the regression pin — confirm it still asserts on content.
6. **Perf:** `node scripts/check-perf-budget.mjs` before/after, numbers in the
   commit message. No new ledger row (ruling 8A superseded: the engine is now
   deliberately IN the shell).

### D6 — What moves downstream

- **Print baselines WILL move** for any baselined route carrying the fixture
  `graph_figure` (320 → 400 viewBox, gains a line). Regenerate on the Linux
  station (V7 runbook) — expected red window, noted in STATE.
- The choice-figures doc: T0b's `[x]` corrected to "superseded — engine is
  static since 2026-08-23, see graph-figure-convergence.md"; E1's dynamic
  import recorded as reversed.
- TODOS: the convergence entry closes; a new entry files the degenerate-axis
  refinement (below).
- DECISIONS.md: one entry — "Static-svg engine is eager (reverses E1)".

## NOT in scope

- **Degenerate axis refusal at authoring** (zod refine on `AxisConfig` +
  editor inline error + importer warning) — a schema change, so it pays the
  bundle round this slice avoids. Filed in TODOS against the next schema slice.
- **A `./static-svg/graph-svg` subpath export** — only if the build measurement
  shows the siblings were not tree-shaken.
- **A caption/alt field on `graph_figure`** — deliberately unplanned
  (table-block §10 precedent); the 5A generic label stands until it exists.
- **Moving `graph_figure` to the lazy tier** (ruling 2B rejected; moot under 9A).

## What already exists (reused, not rebuilt)

- `renderGraphSvg` — the one engine; the editor preview, choice figures, print
  twins and the answer key already use it. This slice adds the last caller.
- `data-drawables` + the `drawable-count` expectation kind — the output
  contract the guard binds to.
- `ChoiceFigure`'s A8 "Figure unavailable" span — reused for the `''` case on
  both surfaces.
- `choice-figures.test.tsx`'s real-engine render pattern — `GraphFigure.test.tsx`
  mirrors it.

## Superseded rulings (kept so nobody re-derives them)

| # | Ruling on the lazy premise | Why it died |
|---|---|---|
| 1A | reset cached rejection + fallback + clear marker | no import to fail |
| 2A | eager component, lazy engine | engine is static (9A) |
| 3A | extract `blocks/svgEngine.ts` | nothing to extract |
| D2 | `printReadiness` waits on `[data-figure-pending]` | no pending state |
| D3 | preload walk (offline role) | in the shell, always cached with it |
| 7A | sw-lane offline e2e row | offline path is the shell's own |
| 8A | CHUNK_LEDGER absence row for the engine | presence is now the design |
| OV-3 | preload must set `residentEngine` | no resident state |

Surviving: 4A (split + non-vacuity), 5A (label), 6A (`''` → fallback),
OV-a/b/c/d/e.

## Failure modes (new code paths)

| Path | Realistic failure | Test | Handling | User sees |
|---|---|---|---|---|
| `renderGraphSvg` in `GraphFigure` | degenerate axis → `''` | D5.4 | 6A fallback | "Figure unavailable" |
| same | `expression` drawable | engine's own tests | skipped by design | axes + other drawables |
| `ChoiceFigure` graph branch | `''` | D5.5 | 6A fallback | "Figure unavailable" |
| static import | tree-shake miss | perf budget at build | measured, subpath fallback | nothing (bytes) |
| print | figure cap not applied | split `figure/capped` rows | CSS | figure overruns page |
| dark theme | low contrast | dark-contrast row | verify first | unreadable grid |

No critical gaps: every path has a test and a handler, and no failure is silent.

## Worktree parallelization

Sequential implementation, no parallelization opportunity — every step touches
`packages/viewer/src/blocks/` or the fixtures those blocks are tested against.

## Implementation Tasks

- [ ] **T1 (P1, human: ~3h / CC: ~12 min)** — viewer/blocks — Rewrite `GraphFigure.tsx` on a static `renderGraphSvg` import; wrapper `role=img`; `''` → fallback; delete the false header
  - Surfaced by: Step 0 finding; rulings 9A, 5A, 6A
  - Files: `packages/viewer/src/blocks/GraphFigure.tsx`
  - Verify: `GraphFigure.test.tsx` rows 1-4; mutation-test row 1
- [ ] **T2 (P1, human: ~2h / CC: ~8 min)** — viewer/blocks — `ChoiceFigure.tsx`: delete the lazy loader, effect, placeholder, marker and header claims; redraw the ASCII diagram; `''` → fallback
  - Surfaced by: P11 finding #1; rulings 9A, 6A
  - Files: `packages/viewer/src/blocks/ChoiceFigure.tsx`
  - Verify: `choice-figures.test.tsx` green + new `''` row
- [ ] **T3 (P1, human: ~1h / CC: ~5 min)** — viewer/styles + tokens — standalone cap token; `.viewer-figure svg` rule; print variant
  - Surfaced by: OV-a; quality issue 4
  - Files: `packages/viewer/src/tokens/tokens.css`, `packages/viewer/src/styles/viewer.css`
  - Verify: computed `max-width` in `print-rules.e2e`
- [ ] **T4 (P1, human: ~1.5h / CC: ~6 min)** — viewer/registry — `graph_figure` row gets `drawable-count {zero:false}`; split `figure/capped` into per-selector rows with non-vacuity counts
  - Surfaced by: OV-d, OV-e; ruling 4A
  - Files: `packages/viewer/src/registry/printExpectations.ts`, `packages/app/e2e/print-rules.e2e.ts`
  - Verify: both rows match ≥1 element on the fixture route; `drawable-count` reads 2
- [ ] **T5 (P1, human: ~30min / CC: ~3 min)** — viewer/fixtures — `graph_figure` fixture gains a linear curve
  - Surfaced by: D5.3
  - Files: `packages/viewer/src/fixtures/index.ts`
  - Verify: `blockIndex.test.ts` still green; T4's count reads 2
- [ ] **T6 (P2, human: ~20min / CC: ~2 min)** — viewer/print — delete `mode="print"` + cast at `DefinitionGlossary.tsx:133`
  - Surfaced by: OV-c
  - Files: `packages/viewer/src/print/DefinitionGlossary.tsx`
  - Verify: typecheck
- [ ] **T7 (P2, human: ~1h / CC: ~6 min)** — app/e2e — dark-theme check in the browser + a figure row in `dark-contrast.e2e.ts`
  - Surfaced by: OV-b
  - Files: `packages/app/e2e/dark-contrast.e2e.ts`
  - Verify: row passes AA on both themes
- [ ] **T8 (P1, human: ~30min / CC: ~3 min)** — scripts — perf budget before/after in the commit message; `pnpm bundle:viewer-server` zero-diff check; `pnpm verify`
  - Surfaced by: ruling 9A; OV-11
  - Verify: numbers recorded; drift checks green
- [ ] **T9 (P2, human: ~45min / CC: ~5 min)** — docs — choice-figures T0b + E1 corrected; DECISIONS entry; TODOS close + new degenerate-axis entry; STATE baseline-red note
  - Surfaced by: D6; TODO ruling
- [ ] **T10 (P1, author station)** — print baselines regenerated on Linux via `workflow_dispatch` and committed (V7 runbook)
  - Surfaced by: D6

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR (PLAN) | 10 issues, 0 critical gaps; outside voice (claude) 13 findings → 1 accepted tension (9A), 5 folded, 1 refuted, 6 mooted |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | pending (requested) |

- **CROSS-MODEL:** the outside voice overturned the review's central architectural premise (lazy engine → static import, ruling 9A) on a measurement the review had estimated; the user accepted. Six review rulings superseded as a result.
- **VERDICT:** ENG CLEARED — ready to implement after the DX review.

NO UNRESOLVED DECISIONS
