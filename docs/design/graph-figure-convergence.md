# Graph-figure convergence — `GraphFigure.tsx` → `renderGraphSvg`

**Status:** ENG-REVIEWED + DX-REVIEWED 2026-08-23 (10 eng findings + outside voice + 8 DX decisions, 0 unresolved) — ready to build.

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
        ├── ''  (degenerate window)  ──►  <figure> 'Figure unavailable'      (ruling 6A)
        │                                   data-figure-unavailable=
        │                                     "degenerate-axis"               (DX D7)
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
"Figure unavailable" span the image branch already has (ruling 6A), carrying
`data-figure-unavailable="degenerate-axis"` so devtools and a failing test name
the CAUSE, not just the symptom (DX D7). One cause exists today; a second makes
the attribute an enum. The header
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
2. **`figure/capped` is split** (OV-e / ruling 4A, amended by DX D6): today's
   comma-list target `.viewer-image__img, .viewer-figure__svg` stays green via
   the image half even when the figure half matches nothing. Two single-selector
   rows, each targeting markup the viewer owns (`.viewer-figure > svg` for the
   figure). **No new counting code** — `printChecks.ts:76-83` already returns
   `status: 'absent'` for a zero-match selector and `:256` treats absent as a
   failure, so a single-selector row cannot pass vacuously. Cite that in the row
   comment; a comma-list target is the smell, not a missing assertion.
3. **The viewer fixture's `graph_figure` gains a linear `curve`** beside its
   point, so every fixture-driven lane (print-rules, a11y, dark-contrast,
   baselines) exercises the path that was empty. Bond once that the sanitized
   projection carries `model` through (`sanitize: { strip: [] }`).
4. **`GraphFigure.test.tsx`** (new): linear curve → a stroked `<path>` inside
   `.viewer-figure` and `data-drawables="2"`; **the four losses T0 measured on
   the drawables that already "worked" — a ray's arrowhead `<marker>`, endpoint
   dots, a point's label text, and authored colour** (all absent today); zero drawables → axes only,
   `data-drawables="0"`; degenerate axis → "Figure unavailable" carrying
   `data-figure-unavailable="degenerate-axis"`, no `<svg>`;
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

## Developer perspective (DX review, 2026-08-23)

The developer this plan serves is **the next session picking up T1–T10 cold** —
as likely an AI session as the author (persona D1). Traced against the real repo:

> I read CLAUDE.md → STATE → the plan. The finding is clear. T1 says rewrite
> `GraphFigure.tsx`; I open `ChoiceFigure.tsx` to copy its `drawGraph` cast and
> find an 80-line lazy loader the plan tells me to delete. Fine. T1 says verify
> with "`GraphFigure.test.tsx` rows 1-4" but not WHERE that file goes — I grep,
> find `packages/viewer/tests/components/`, and mirror `choice-figures.test.tsx`.
>
> T4 says "non-vacuity counts"; `print-rules.e2e.ts:133` already counts passes
> per block, so I am not sure whether to add a count per ROW. I guess.
>
> `pnpm verify` is green and prints that print-gates and a11y are NOT covered.
> T7 says add a dark-contrast row — I read `playwright.config.ts` to learn which
> lane runs it. T10 says "workflow_dispatch (V7 runbook)": which workflow, which
> input, where does the artifact go? I grep to `ci.yml:383`.

| Stage | Friction | Ruling |
|---|---|---|
| Orient (CLAUDE.md → STATE → plan) | none — the strongest part of this repo's DX | ok |
| See the bug | nothing in the repo authors a `graph_figure`; the claim was code-read only | **fixed** (D9 — T0 dogfood activity, run first) |
| Implement T1/T2 | test file location unstated; deleted exports uncited | **fixed** (D3 champion paths, D8 claims-grep) |
| Real usage (T4) | plan asked for a guard the harness already provides | **fixed** (D6 — cite `printChecks.ts` `absent`) |
| Debug a blank figure | fallback names the symptom, not the cause | **fixed** (D7 — `data-figure-unavailable`) |
| Verify locally | `pnpm verify` covers it and says what it does not | ok |
| T7 dark lane / T10 baselines | lane + workflow input undocumented in the plan | **fixed** (D3) |
| Hand off | STATE/TODOS discipline established | ok |

**TTHW target: champion (<10 min to first green), ruled D3** — every task below
names its file, its command and its lane so no discovery grep is needed.

## Implementation Tasks

- [x] **T0 (P1) — DONE 2026-08-23. The bug is confirmed against real authored content.**
  - `scripts/graph-figure-test.md` written: a ```reference fence with four figures — two parallel lines on one grid, a parabola, a shaded half-plane, and the point/segment/ray/region set that never depended on the curve renderer.
  - **The real importer produces exactly what the finding predicted.** `getMarkdownImporter()` on that file returns four `graphFigure` panel blocks: `[curve, curve]`, `[curve]`, `[curve]`, `[point, segment, ray, polygon]`. Only warning is an unrelated one about a markdown link in the prose.
  - **The real `GraphFigure` renders NOTHING for the first three.** Rendering each block through the actual component and counting drawn marks (`<path|<polyline|<circle|<polygon>`): figure 1 = **0 marks**, figure 2 = **0 marks**, figure 4 = 2 marks. Two parallel lines and a parabola are empty grids; the point/segment/ray/region figure draws.
  - **The chain is proven end to end without a DB write.** `pnpm import:batch --dry-run` accepts the file (1 to create, 0 skipped) and `sanitizeBlock` passes the `{family:'linear'}` model through untouched — so nothing between the teacher's markdown and the student's screen loses the curve. The renderer is the only broken link, which is what makes the one-component fix sufficient.
  - **⚠ BONUS FINDING, folded into T1: even the "always worked" kinds are DEGRADED.** Side-by-side against `renderGraphSvg` on identical blocks, `GraphFigure`'s figure 4 loses the ray's **arrowhead**, the segment's and ray's **endpoint dots**, the point's **label ("A")**, and all **colour** (everything is `currentColor`). So convergence is not only "curves start working" — it fixes four silent losses in the drawables that supposedly worked. Assert the arrowhead `<marker>` and the point label in T1's test.
  - **⚠ Trap for whoever re-runs the import:** `import:batch` reports every DB row whose `source_path` is absent from the folder you point it at, so importing a one-file folder lists the author's real catalogue as orphans. That is D2 working (report, never act — nothing was changed), not a problem. Point it at the real catalogue folder, or ignore the orphan list on a scratch run.
  - Not done, deliberately: **no DB row was written and nothing was published.** The dry run plus the render proof answered the question without leaving residue (policy P7). Import for real only if the browser-level print check is wanted after T1.

- [ ] **T1 (P1, human: ~3h / CC: ~12 min)** — viewer/blocks — Rewrite `GraphFigure.tsx` on a static `renderGraphSvg` import; wrapper `role=img`; `''` → fallback with `data-figure-unavailable`; delete the false header
  - Surfaced by: Step 0 finding; rulings 9A, 5A, 6A, DX D7
  - Files: `packages/viewer/src/blocks/GraphFigure.tsx`
  - Verify: `pnpm --filter @activity/viewer exec vitest run tests/components/GraphFigure.test.tsx`
- [ ] **T2 (P1, human: ~2h / CC: ~8 min)** — viewer/blocks — `ChoiceFigure.tsx`: delete the lazy loader, effect, placeholder, marker and header claims; redraw the ASCII diagram; `''` → fallback
  - Surfaced by: P11 finding #1; rulings 9A, 6A, DX D8
  - Files: `packages/viewer/src/blocks/ChoiceFigure.tsx`
  - **Claims-grep before committing (policy P5, DX D8):** `grep -rn "loadSvgEngine\|svgEngineResident\|data-figure-pending\|choiceFigurePreload" packages docs --include='*.ts' --include='*.tsx' --include='*.md' | grep -v node_modules | grep -v /dist/` must return only the choice-figures design doc's corrected T0b line.
  - Verify: `node --test scripts/tests/export-reachability.test.mjs` + `pnpm --filter @activity/viewer exec vitest run tests/components/choice-figures.test.tsx`
- [ ] **T3 (P1, human: ~1h / CC: ~5 min)** — viewer/styles — `--vw-figure-cap-standalone` (20rem) + print variant; `.viewer-figure svg` rule
  - Surfaced by: OV-a
  - Files: `packages/viewer/src/tokens/tokens.css`, `packages/viewer/src/styles/viewer.css`
  - Verify: `pnpm --filter @activity/app exec playwright test print-rules`
- [ ] **T4 (P1, human: ~1.5h / CC: ~6 min)** — viewer/registry — `graph_figure` row gets `drawable-count {zero:false}`; split `figure/capped` into two single-selector rows (no new counting code — cite `printChecks.ts:76-83`/`:256`)
  - Surfaced by: OV-d, OV-e; rulings 4A, DX D6
  - Files: `packages/viewer/src/registry/printExpectations.ts`
  - Verify: `pnpm --filter @activity/app exec playwright test print-rules` — an `absent` outcome fails the row
- [ ] **T5 (P1, human: ~30min / CC: ~3 min)** — viewer/fixtures — `graph_figure` fixture gains a linear `curve` beside its point
  - Surfaced by: D5.3
  - Files: `packages/viewer/src/fixtures/index.ts`
  - Verify: `pnpm --filter @activity/viewer test` (blockIndex + T4's count reads 2)
- [ ] **T6 (P2, human: ~20min / CC: ~2 min)** — viewer/print — delete `mode="print"` + the `as never` cast at `DefinitionGlossary.tsx:133`
  - Surfaced by: OV-c
  - Files: `packages/viewer/src/print/DefinitionGlossary.tsx`
  - Verify: `pnpm typecheck`
- [ ] **T7 (P2, human: ~1h / CC: ~6 min)** — app/e2e — verify the engine palette on the dark theme in a real browser, then add a figure row to `dark-contrast.e2e.ts`
  - Surfaced by: OV-b
  - Files: `packages/app/e2e/dark-contrast.e2e.ts`
  - **Lane:** `dark-contrast.e2e.ts` runs in the **chromium** project (`playwright.config.ts:106`, `testIgnore` excludes only student/sw/perf/a11y/integration), i.e. the `editor-gates` CI job on every push.
  - Verify: `pnpm --filter @activity/app exec playwright test dark-contrast --project=chromium`
- [ ] **T8 (P1, human: ~30min / CC: ~3 min)** — scripts — record the perf delta and the mutation proof; prove no bundle drift
  - Surfaced by: ruling 9A; OV-11; DX D4
  - Verify: `node scripts/check-perf-budget.mjs` before/after (numbers in the commit message) · `pnpm bundle:viewer-server` then `git diff --stat` shows zero · `pnpm verify`
  - **Mutation proof, recorded not just run (DX D4):** revert the curve case in `GraphFigure.tsx`, run T1's command, and paste the failing line into the commit message and the AS-BUILT note — the shape `numbering-output.test.tsx` established.
  - **Dogfood proof (DX D9):** re-open T0's activity and confirm the two parallel lines now draw on one grid, on screen and in the print preview. The before/after pair goes in the AS-BUILT note. This is the only proof that crosses the importer → viewer boundary.
- [ ] **T9 (P2, human: ~45min / CC: ~5 min)** — docs — choice-figures T0b + E1 corrected; DECISIONS entry; TODOS close; STATE baseline-red note; AS-BUILT section here
  - Surfaced by: D6; TODO ruling
  - Files: `docs/design/choice-figures-and-nested-lists.md`, `docs/DECISIONS.md`, `TODOS.md`, `STATE.md`, this doc
- [ ] **T10 (P1, author station)** — print baselines regenerated on Linux and committed
  - Surfaced by: D6
  - **Runbook (DX D3):** GitHub Actions → **CI** workflow → *Run workflow* with the **`update_print_baselines`** input ticked (`.github/workflows/ci.yml:381-410`). The job runs `playwright test print-baselines --update-snapshots` and uploads a **`print-baselines`** artifact; unzip it over `packages/app/e2e/print-baselines.e2e.ts-snapshots/` and commit. CI's print-gates job is RED until it lands — that red is expected, and STATE says so.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR (PLAN) | 10 issues, 0 critical gaps; outside voice (claude) 13 findings → 1 accepted tension (9A), 5 folded, 1 refuted, 6 mooted |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 1 | CLEAR | score 6/10 → 9/10, 9 decisions, TTHW target champion (<10 min), mode DX POLISH |

- **CROSS-MODEL:** the outside voice overturned the review's central architectural premise (lazy engine → static import, ruling 9A) on a measurement the review had estimated; the user accepted. Six review rulings superseded as a result.
- **VERDICT:** ENG + DX CLEARED — ready to implement, starting with T0.

NO UNRESOLVED DECISIONS
