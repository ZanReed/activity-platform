# Graph-kit color pass

Status: **DESIGN — eng-reviewed + decisions RULED (2026-07-18), ready to build.**
No code yet. Item 2 of the deferred design-token backlog, after the chrome+editor
dark-mode arc ([dark-mode.md](dark-mode.md), slices 1–5 shipped). Author rulings
(§D): **D2** DRY-consolidate all 3 layers + make the calculator CSS chrome
dark-*ready* (board JS colors organized, not runtime-themed); **D3** one unified
`graph-colors.ts` source. Naming (`--gk-*` / `graph-colors.ts`) and
DRAWABLE_PALETTE-stays-separate are fixed by constraint.

## Problem

`packages/graph-kit` (the shared, lazy-loaded graphing + calculator widget that
reaches **published student pages**) has **145 raw color literals** across its
source, in three tangled systems with real duplication. Consolidate into a
coherent, self-contained token layer — without adopting the editor/chrome token
names (graph-kit is a different surface) and without bloating the size-budgeted
lazy bundle.

## Current state (surveyed)

145 literals: calculator.ts 75, graph-question.ts 19, board.ts 15,
data-plot-board.ts 9, drawable-palette.ts 8, number-line-question.ts 7,
expression-list.ts 7, number-line-board.ts 5.

```
   THREE COLOR SYSTEMS                       dark-ready cheaply?
   ─────────────────────────────────────     ───────────────────
   1. Calculator/widget CSS chrome        →  YES. Injected once as the KIT_CSS
      (~75 literals, KIT_CSS template)        template string on a .gk-cal DOM
      .gk-cal / .gk-cal-* / .gk-exprrow-*     root; self-contained. --gk-* CSS
      slate/blue/red, hardcoded hex           vars re-point under a dark selector.

   2. Board render consts (JS hex)        →  NO. Drawn into JSXGraph / canvas /
      CURVE #2563eb, ANSWER #7c3aed,          SVG as string values; dark needs
      FIT #16a34a, SCATTER/AXIS/LABEL/INK,    runtime theme plumbing through the
      CURSOR/FILL, SYSTEM_BOUNDARY_COLORS     draw calls = the DEFERRED
      DUPLICATED: ANSWER_COLOR in 3 files,    published-page dark work.
      AXIS_COLOR in 2. No shared module.

   3. DRAWABLE_PALETTE (drawable-palette.ts) → SEPARATE system, already clean.
      8 keys → static hex, single-sourced,      Static hex by necessity
      imported by 3 draw paths.                 (published pages can't read CSS vars).
```

## §D — Decisions (RULED 2026-07-18)

- **D2 Scope + dark posture — DRY-consolidate all 3 + CSS-chrome dark-ready.**
  One shared `graph-colors.ts` dedups the board consts; the calculator chrome
  becomes `--gk-*` CSS vars structured for a cheap later dark re-point. Board JS
  colors are organized but **NOT runtime-dark-themed** (that plumbing is the
  deferred published-page dark project). Addresses ~137 of 145 literals;
  DRAWABLE_PALETTE's 8 stay put.
- **D3 Source — one unified `graph-colors.ts`.** A single module exports the
  named board roles (JS, for draw calls) AND feeds the calculator's `--gk-*` var
  block via interpolation into KIT_CSS. One source of truth for every graph-kit
  UI color.
- **Locked by constraint:** namespace is `--gk-*` (CSS) / `graph-colors.ts`
  (JS) — NOT `--ed-`/`--color-`. DRAWABLE_PALETTE stays a separate system.

## Architecture (as ruled)

```
   packages/graph-kit/src/graph-colors.ts   ← the ONE unified source
   ├─ board render roles (JS hex, for JSXGraph/SVG/canvas draw calls)
   │    CURVE, ANSWER, FIT, SCATTER, AXIS, LABEL, INK, GRID, CURSOR,
   │    ANSWER_FILL, CORRECT, INCORRECT, SHADE_FILL_OPACITY,
   │    SYSTEM_BOUNDARY_COLORS[]
   │      ↑ imported by board.ts, data-plot-board.ts, number-line-board.ts,
   │        graph-question.ts, number-line-question.ts (dedups the 3× / 2× copies)
   └─ chrome palette (feeds the calculator's CSS var block)
        GK_CHROME = { bg, ink, ink2, border, muted, surface, surface2,
                      hover, accent, accentBg, accentBg2, error, overlay, … }
          ↓ interpolated once into KIT_CSS
   calculator.ts KIT_CSS:
     .gk-cal { --gk-bg: <GK_CHROME.bg>; --gk-ink: …; --gk-border: …; … }  ← one block
     .gk-cal-field { border-color: var(--gk-border); … }                  ← refs everywhere
     /* later (published dark, deferred): .gk-cal[data-theme=dark]{ --gk-*: … } */
```

**Value-identity discipline** (from fix 6): each consolidated const/var ==
the exact literal it replaces. The pass changes *where* colors live, not their
values (a later dark pass changes values). Proven by pinning the role hexes and
a computed-color check on the calculator.

**DRAWABLE_PALETTE overlap, accepted not merged:** `CURVE`/`ANSWER`/`FIT` share
hex values with DRAWABLE_PALETTE `blue`/`violet`/`green`. They stay *separately
defined* — a board render role and an authored drawable color are different
semantic axes; changing one must not ripple to the other. The coincidental hex
match is fine.

**Dark-readiness is asymmetric (the load-bearing call):** layer 1 (CSS chrome)
becomes a cheap re-point; layer 2 (board JS) does not, and this pass deliberately
stops there. Published-page dark mode (both layers themed at runtime) is its own
deferred design.

## Size budget

graph-kit's graphs bundle is ~46 KiB (over the 40 KiB soft target, under the 60
ceiling). Net effect of this pass: board-const dedup *saves* bytes; the
calculator `--gk-*` vars cost a little (var refs are longer than hex and the
minifier can't shrink names inside the KIT_CSS string) — roughly neutral,
worst-case a few hundred bytes. Re-measure with `pnpm bundle:renderer` and treat
the printed number as truth; if it pushes the ceiling, that's a signal, not
expected.

## Slicing

1. **`graph-colors.ts`** — the unified module: board roles (value-identical to
   today's consts) + the chrome palette. Unit-pin the role hexes.
2. **Board dedup** — point board.ts / data-plot-board.ts / number-line-board.ts
   / graph-question.ts / number-line-question.ts / expression-list.ts at the
   shared roles; delete the duplicated local consts. graph-kit suite stays green.
3. **Calculator `--gk-*`** — interpolate the chrome palette into a `.gk-cal`
   var block at the top of KIT_CSS; sweep the ~75 literals to `var(--gk-*)`.
4. **Verify** — `/dev/calculator` + `/playground` graph eyeball; computed-color
   check the calculator resolves the same colors as before; bundle re-measured.

## Verification

- **Value-identity**: unit test pins each board role hex to its pre-pass value;
  a computed-color check on `/dev/calculator` confirms the `--gk-*` vars resolve
  to the same colors the literals produced (mirrors the dark-mode canary method).
- graph-kit's existing unit suite (331+) stays green.
- Board colors render into JSXGraph/SVG (no snapshot tooling) → eyeball
  `/playground` (graphs) + `/dev/calculator` + `/dev/data-plot` + `/dev/number-line`.
- **Deploy (author actions, after slice 3):** value-identity means no VISUAL /
  wire change, but wiring consumers changes the graph-kit BUNDLE BYTES, which
  re-hashes the kit — so per CLAUDE.md the pass still needs `pnpm upload:graph-kit`
  (new hash + committed manifest) → `publish-activity` redeploy so new publishes
  point at it. Already-published pages keep working on the old hash (no
  re-publish forced). NO ingest / wire / schemaVersion change. Also
  `pnpm bundle:renderer` IF the renderer's graph-svg path starts importing
  graph-colors (only if slice 2 touches it). Slice 1 alone (an unused module)
  is tree-shaken → zero bundle change, no deploy.

## Deferred: published-page dark mode

NOT in this pass. Needs BOTH: the calculator `--gk-*` dark re-point (cheap, set
up here) AND runtime theme plumbing threaded through the board draw calls
(mountCalculator + board.ts + the SVG path) so JSXGraph/SVG render dark. Plus the
`styles.ts` published-page `:root` dark palette (see dark-mode.md's deferred
section). Its own design when picked up.
