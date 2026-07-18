# Graph-kit board dark-theming

Status: **DESIGN — eng-reviewed + decisions RULED (2026-07-19), ready to build.**
No code yet. The deferred slice flagged by [graph-kit-color.md](graph-kit-color.md)
and [dark-mode.md](dark-mode.md): make the graph / number-line / data-plot
**boards** render dark so they stop being light-on-dark in the editor. Builds on
[graph-colors.ts](../../packages/graph-kit/src/graph-colors.ts) (the unified color
source). Rulings (§D): **D2** boards self-detect theme (no caller plumbing);
**D3** the calculator opts out (stays a light unit); **D4** re-init on theme change.

## Problem

The graph-kit color pass consolidated CONTENT colors (curve/answer/fit/drawables)
into `graph-colors.ts`, but a graph in the editor still renders on a **white
board** with a light grid and black axes — jarring inside the dark editor. Two
gaps: the board's STRUCTURAL colors (bg, grid, axis, tick labels) are JSXGraph
**defaults** (never configured), and nothing tells a board what theme it's in.

## The mechanism — self-detect (D2), and why the scope fork dissolves

The board reads its own container's effective `color-scheme` (which the app's
`light-dark()` mechanism already sets on `:root`, covering system pref AND the
toggle). No theme param threaded through the ~8 mount fns or their two
integration paths (editor NodeViews + published runtime).

```
   detectBoardTheme(container) -> 'light' | 'dark'
     cs = getComputedStyle(container).colorScheme
     'dark'                    -> dark    (explicit toggle, or published-dark later)
     'light'                   -> light
     'light dark' | 'normal'   -> matchMedia('(prefers-color-scheme: dark)')

   ┌─────────────┬──────────────────────────┬───────────────────────┐
   │ surface     │ color-scheme context     │ board self-detects     │
   ├─────────────┼──────────────────────────┼───────────────────────┤
   │ editor      │ app sets it (light-dark) │ dark now ✓             │
   │ published   │ none yet (dark deferred) │ light (unchanged) ✓    │
   │ published   │ WHEN published-dark ships │ dark, automatically ✓  │
   └─────────────┴──────────────────────────┴───────────────────────┘
```

So "editor-only vs published" isn't a real fork: one self-detecting mechanism
serves both. Editor lights up now; published stays byte-identical in behavior and
lights up for free whenever it gets a dark context. Zero caller changes.

## Light stays pixel-identical BY CONSTRUCTION

Only **override** structural colors when dark is detected. In light, leave
JSXGraph's defaults untouched (`grid #c0c0c0`, `axis/labels #666666`, white bg).
So `if (theme === 'dark') { set dark grid/axis/bg/label }` — light = no explicit
set = default = identical. No need to capture/replicate JSXGraph's default hexes;
value-identity is free.

## Theme-aware vs theme-independent roles

```
   THEME-AWARE (need a dark value)          THEME-INDEPENDENT (stay as-is)
   ─────────────────────────────────        ──────────────────────────────
   boardBg   white  → ~slate-950            CURVE   blue    (reads on dark)
   grid      #c0c0c0→ ~slate-800            ANSWER  violet
   axis      #666666→ ~slate-400            FIT     green
   label     #666666→ ~slate-300/400        ANSWER_FILL light-purple
   SCATTER   #0f172a→ light (near-black,     box-plot FILL light-blue
             invisible on dark)             DRAWABLE_PALETTE (curated)
   INK       #1e293b→ light                 SYSTEM_BOUNDARY_COLORS
   OPEN_FILL white  → the DARK boardBg       EXPRESSION_PALETTE
             (hollow points fill w/ bg)
```

The near-black/white roles (SCATTER, INK, OPEN_FILL) are "content" but must flip:
a near-black scatter dot is invisible on dark, and an open/hollow point fills with
the board bg to read as hollow (so OPEN_FILL = boardBg, theme-dependent). The
vivid content colors read fine on dark and stay put (no restyle).

## graph-colors.ts shape

These are JS hex for JSXGraph (no CSS `light-dark()`), so a resolver, not a var:

```
   detectBoardTheme(container): 'light' | 'dark'        // the reader

   // structural + the near-black/white content roles, keyed by theme.
   // light values match today's (JSXGraph defaults / current consts) so light
   // is untouched; only dark is new.
   boardColors(theme): { bg, grid, axis, label, scatter, ink, openFill }
```

The vivid content roles (CURVE/ANSWER/FIT/…) stay as the existing plain exports.

## Calculator opts out (D3)

The calculator's chrome is deliberately light-only (`--gk-*` light; calculator-
dark deferred). Its internal graphing board must NOT self-detect dark, or you get
a dark board in a light panel. `createBoard(container, { forceTheme?: 'light' })`
— the calculator passes `forceTheme: 'light'`; everything else self-detects. The
whole calculator stays a coherent light unit until the calculator-dark slice.

## Reactivity (D4) — re-init on theme change

JSXGraph bakes colors at init. On a live toggle, re-init (reuses the NodeViews'
existing remount path). Split of responsibility keeps graph-kit param-free:
- **graph-kit**: self-detect at init (static render). No listeners inside the kit.
- **editor**: a small app-side `useThemeEpoch()` (subscribes to `lib/theme.ts` +
  matchMedia) bumps a remount key on theme change, folded into the 3 board
  NodeViews' existing `formulaEpoch`/config remount. Published needs none (no
  toggle). Cost: a toggle mid-interaction resets that board's transient state —
  rare, editor-only, acceptable.

## Slices

1. **`graph-colors.ts`** — `detectBoardTheme()` + `boardColors(theme)` (dark
   structural + scatter/ink/openFill; light values == today). Unit tests: the
   detector's branch table + light values unchanged.
2. **JSXGraph boards** (board.ts, number-line-board.ts) — resolve theme at init;
   when dark, set explicit grid/axis/bg/label attrs + use `boardColors` for
   scatter/ink/openFill. `createBoard` gains `forceTheme`; the calculator passes
   `'light'`.
3. **data-plot boards** (data-plot-board.ts) — same theme resolution for the
   SVG structural colors (grid/axis/label/bg).
4. **Editor reactivity** — `useThemeEpoch()` hook; wire into InteractiveGraphView
   / NumberLineView / DataPlotView remount keys.
5. **Verify + deploy.** Browser-check every board type in dark + light on
   `/dev/*` + `/playground`; light pixel-identical (only dark overrides). Deploy
   train (author): `upload:graph-kit` → `deploy:publish` — the kit re-hashes, but
   **published rendering is unchanged** (published self-detects light). NO wire /
   ingest / schemaVersion change.

## Verification

- **Light untouched**: light-mode boards render identical (no explicit structural
  set in light) — eyeball + the graph-kit suite stays green.
- **Dark**: each board type (interactive graph, point/system answer, display,
  number-line, dot/histogram/box plots) renders dark with a readable grid/axis,
  light labels, vivid content, hollow points reading hollow. `/dev/*` benches
  (now theme-aware after item 3) + `/playground`.
- **Detector unit test**: the color-scheme → theme branch table (dark / light /
  'light dark'+matchMedia / normal).
- **Calculator**: stays fully light (chrome + board) in dark editor.
- **Reactivity**: toggle light↔dark with a graph mounted → board re-colors.
- Boards render into JSXGraph/SVG (no snapshot tooling) → browser eyeball is
  authoritative; the in-app pane's 0×0 quirk means use real Chrome / Playwright.

## Deferred (still)

- **Calculator dark** (chrome `--gk-*` dark re-point + its board opt back in).
- **Published-page dark mode** (renderer runtime + styles.ts) — but board dark is
  now *ready* for it (self-detect fires automatically once published sets a dark
  color-scheme).
