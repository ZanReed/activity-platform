# @activity/viewer — design tokens (S0, ruling 5.1A)

The token layer every student-facing component consumes. Values live in
[src/tokens/tokens.css](src/tokens/tokens.css); names are typed in
[src/tokens/tokens.ts](src/tokens/tokens.ts); the guard suite
([tests/tokens.test.ts](tests/tokens.test.ts)) keeps the two in sync, keeps the theme
blocks complete and identical, and checks WCAG AA on the state vocabulary. **Components
use tokens only** — a literal color/size/shadow in component CSS is a review-blocker.

## Provenance

- **Light values** are extracted from the published-page stylesheet
  (`packages/renderer/src/runtime/styles.ts`) — the current look teachers and students
  know. That stylesheet had a partial `--color-*` layer plus ~35 stray hex literals;
  the strays are consolidated here.
- **Dark values** follow the app's ratified dark design (`packages/app/src/index.css`,
  RULED D3–D5): elevation not inversion (page darkest → paper → overlay lighter),
  off-white ink, brightened accents, `*-950` dark tints for surfaces. Published pages
  never had dark mode; the viewer does (ruling 5.1A names dark-mode values).
- **Page/paper split**: published pages were white edge to edge; the approved wireframe
  puts a paper card on a page field. `--vw-color-page` (slate-50) comes from the wireframe +
  app convention; everything on the paper is published-page-faithful.

## Deliberate deltas from the published page (all ≤ one shade)

1. **Muted ink consolidation** — `#6b6b6b` and `#64748b` (both "meta text", one step
   apart) merge onto slate-500 `#64748b` (AA on white). On tinted surfaces use
   `--vw-color-ink` (the app's slate-500-on-tint lesson).
2. **`--state-recorded-ink` is slate-600**, not slate-500 — slate-500 on the recorded
   surface (slate-100) is 4.36:1, sub-AA.
3. **`--state-pending-ink` is amber-800** — pending is a NEW state (queued/offline
   checks) with no published precedent; amber-700 on the amber surface is a razor-thin
   4.51:1.

## Structure decisions

- **Classic dark-mode pattern, not `light-dark()`** — deliberately diverging from the
  app. The viewer's support floor is school-managed Chromebooks, where Chrome can
  predate `light-dark()` (123); the classic pattern degrades to light (which is also
  what print forces). The media-dark and forced-dark (`[data-theme="dark"]`) blocks are
  literal duplicates; the guard test enforces value-identity, so they cannot drift.
- **Print flattens in the token layer** — `@media print` re-declares every color role to
  ink-on-white and neutralizes state/callout surfaces, so components inherit the
  baseline print constraints (blank worksheet, grayscale-safe) without per-component
  print color rules. Callout variant identity survives via the
  `--callout-*-print-border` STYLE tokens (solid/dashed/double/dotted).
- **Typography seam** — worksheet content inherits `meta.typography` through the same
  `--activity-font-family` / `--activity-font-size` custom properties published pages
  use (ruling 4.1A); `--vw-font-body`/`--vw-font-math` are the fallbacks. `--vw-font-chrome` is
  the ONE chrome typeface; its concrete face is a T6 design decision — naming it is a
  one-line change here.
- **State vocabulary is closed** — correct / incorrect / pending / recorded, each an
  ink/border/surface trio. The family spec
  ([docs/design/checked-state-families.md](../../docs/design/checked-state-families.md))
  governs who may show what.
- **`--vw-` namespace, enforced** — tokens are plain custom properties on the shared
  document `:root`, and this file is imported by the APP (`routes/StudentViewer` +
  `routes/DevViewer`, both eagerly reached from `App.tsx`), so it loads on **every**
  route. It is also unlayered, while the app's Tailwind `@theme` compiles into
  `@layer theme` — and unlayered beats layered whatever the source order. So any name
  shared with the app is silently won *here*, app-wide. No token may therefore sit in a
  namespace Tailwind's `@theme` owns (`--color-*`, `--radius-*`, `--font-*`,
  `--shadow-*`, …); `tests/tokens.test.ts` pins this.

  This is not theoretical. The layer originally declared plain `--color-*` / `--radius-*`
  and overrode seven app roles. `--color-accent-strong` was the sharp one, because the
  two layers mean **opposite** things by it: here it is accent's *hover* partner, so
  dark brightens it to `#93c5fd` and puts dark ink on top; in the app it backs a solid
  **white**-text button, so dark must stay dark. The app's Print button inherited
  `#93c5fd` and rendered white text at **1.80:1** (`dark-contrast.e2e.ts` caught it);
  `--radius-md/lg` had meanwhile been quietly retuning every `rounded-md`/`rounded-lg`
  in the chrome. If a value genuinely should be shared, alias it explicitly —
  `--vw-color-x: var(--color-x)` — so the coupling is visible.
- **Tailwind bridge later** — if the viewer app adopts Tailwind v4, bridge these in
  `@theme` the way `editor.css` re-points `--ed-*` at the app tokens; don't move the
  source of truth.
