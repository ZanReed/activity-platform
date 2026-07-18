# Dark mode

Status: **COMPLETE (chrome + editor) — all 5 slices SHIPPED + verified
(2026-07-18).** System-pref + explicit toggle both work; editor + chrome fully
themed; AA-verified; print forced light. Built on the `@theme` token
architecture from UX-lens fix 6 (`fd730bb`). Author rulings (see §D): **D1**
chrome + editor only (published pages deferred); **D2** both triggers; **D3**
palette rules locked; **D6** full editor `.tsx` literal sweep; **D7**
`light-dark()` mechanism (one definition per role, no `@media` duplication).
Commits: `d1c2443` (1) · `5aa0a99` (2) · `7e33d47` (3) · `9744215` (4) · slice 5
below. App-only throughout — no bundle, no deploy. **Deferred:** published-page
dark mode (separate design, see bottom).

## Problem

The token migration (fix 6) was justified partly as "dark mode is now *possible*
— re-point the roles under `[data-theme]` / `prefers-color-scheme`." This design
cashes that in. The claim is mostly true for the **chrome + editor**, and mostly
false for the **published student pages**, for reasons §Scope makes concrete.

## Current token architecture (what we build on)

Three color surfaces, NOT one:

```
                    ┌─────────────────────────────────────────────┐
   CHROME  ─────────┤  index.css  @theme { --color-<role> }        │
   (routes/,        │    ~31 roles → Tailwind built-in shade vars   │
    components/)    │    generates bg-surface / text-muted / …      │
                    └───────────────┬─────────────────────────────┘
                                    │ --ed-canvas: var(--color-canvas)
                    ┌───────────────┴─────────────────────────────┐
   EDITOR  ─────────┤  editor.css  :root { --ed-* }                 │
   (editor/)        │    SHARED roles alias @theme (dark for free)  │
                    │    EDITOR-LOCAL: primitives (--ed-slate-*,    │
                    │    --ed-blue-*, indigo/teal/red ramps),       │
                    │    --ed-accent-bg, --ed-self-explain, scrims, │
                    │    overlays, focus-ring — do NOT route @theme  │
                    └─────────────────────────────────────────────┘

   PUBLISHED  ──────┐  packages/renderer/src/runtime/styles.ts
   PAGES            │    baked into the runtime bundle string
   (student-facing) │    :root { --color-text/-bg/-border/... }  (~15 vars)
                    │    + 76 RAW HEX literals still un-tokenized
                    │    + graph-kit fork (~130 literals, lazy-loaded)
                    └─────────────────────────────────────────────
```

Key facts that shape the plan:

1. **Chrome shared tokens get dark "for free" once `@theme` has a dark block.**
   Because `editor.css` aliases the shared roles (`--ed-canvas: var(--color-canvas)`,
   text, borders, status), one dark re-point of `@theme` flows into both surfaces.

2. **Editor-LOCAL tokens do NOT.** `--ed-accent-bg` → `--ed-blue-50`,
   `--ed-accent-alt` (indigo), `--ed-self-explain` (teal), the whole primitive
   ramp, `--ed-focus-ring`, `--ed-scrim`, `--ed-overlay-chip` are hardcoded
   `rgb()` literals local to `editor.css`. Each needs its own dark value.
   So editor dark mode = **two dark blocks** (one in `index.css`, one in
   `editor.css`), not one.

3. **Published pages are a different namespace, only partially tokenized.**
   `styles.ts` already has a `:root` var block (~15 roles, 98 `var()` refs) —
   good — but **76 raw hex refs** remain in block-specific rules (callouts,
   blank correct/incorrect, feedback, note tints, graph-svg). Dark mode there is
   a *tokenization pass first, then a dark palette*, not a re-point.

4. **The runtime is size-budgeted.** Base bundle sits at **~98% of the 40 KiB
   soft target** (60 KiB ceiling). A dark `@media`/`[data-theme]` block is added
   bytes on **every** published page. Non-trivial; must be weighed, and the
   per-question-type inlining lever may need scheduling first (per the budget
   amendment's "scheduled, not discovered" rule).

5. **Print must stay light.** The baseline print CSS (grayscale-safe, white
   paper) must force light regardless of theme — `@media print` overrides, and
   a `prefers-color-scheme: dark` user must never get a dark worksheet on paper.

## Scope fork (the load-bearing decision) — §D1

Two genuinely separate projects wear one name:

| | Chrome + editor | Published student pages |
|---|---|---|
| Token source | `@theme` + `editor.css` | `styles.ts` baked string |
| Cleanliness | clean roles; ~25 editor-local tokens need dark values | 76 raw hex un-tokenized first |
| Size cost | app CSS, no budget | +bytes on every page (98% of soft target) |
| Graph-kit | n/a | ~130 literals, separate pass (author list item 2) |
| Print | n/a | must force light |
| Audience expectation | it's an app → dark expected | it's a document → dark is nice-to-have; teacher may not want a student's OS flipping their page |
| Verification | computed-color canary (Home) | needs a new harness (no unauthed light-mode canary route today besides published pages themselves) |

**Recommendation: ship chrome + editor now; published pages = a separate,
later slice** gated on (a) the graph-kit color pass, (b) a `styles.ts`
tokenization pass to kill the 76 literals, (c) a size-budget ruling. Reasons:
blast radius (chrome dark can't break a live student page), the published fork
is 3–4x the work and reaches real students, and the audience expectation is
weaker there. This is incremental-over-revolutionary: prove the model on the
low-stakes surface first.

## §D — Decisions (RULED 2026-07-18)

### D1 — Scope — **RULED: chrome + editor only**
Published-page dark mode is deferred to its own slice (see the deferred section).

### D2 — Trigger — **RULED: both, sequenced**
`prefers-color-scheme` only · explicit toggle only · **both [RULED]**.
Both, sequenced — the media query is the free foundation
(no UI, no flash, respects OS); layer an explicit toggle that writes
`[data-theme="dark|light"]` on `<html>` + localStorage, defaulting to "system".
Rationale: a teacher on a dark OS may still want a light UI when projecting to a
class, and vice versa. The toggle needs a tiny pre-paint inline script to set
`data-theme` before first paint (FOUC guard); the SPA already shows a loading
state so the flash window is small.

### D3 — Dark-surface elevation model — **RULED: locked**
**Elevation, not lightness inversion.** Raised
surfaces get LIGHTER in dark. This has a real wrinkle: the roles were named for
light-mode elevation where `--color-canvas: white` is the *raised* card and
`--color-surface: slate-50` is the *recessed* page bg. In dark, "raised" must
still read lighter than "page bg", so:

```
   role            light          dark (elevation-preserving)
   surface   (page bg, recessed)  slate-50   → slate-950  (darkest)
   canvas    (cards, raised)      white      → slate-900  (lighter than page)
   surface-2 (hover/fill)         slate-100  → slate-800  (lighter still)
   surface-3 (stronger fill)      slate-200  → slate-700  (lightest fill)
```

Note the ordinal flip: in light, `surface → -2 → -3` gets *darker* (fills stand
out by darkening); in dark they get *lighter*. Values are assigned by elevation
RANK, not by mechanically flipping the shade number. The token NAMES stay (the
`--color-*` contract + 274 chrome sites); only the dark values are new.

### D4 — Text — **RULED: locked**
**Off-white, not pure white.** `--color-ink` →
~slate-100 (`#f1f5f9`) or a custom `#e6edf3`, never `#fff` (halation on dark).
`strong` → slate-200/300; `muted` → slate-400. **Invariant to re-prove:** the
"muted is AA on every surface" guarantee (fix 2/6) is HARDER in dark because
muted text sits across the whole elevation ladder (canvas/surface/surface-2).
Re-verify AA for muted against each dark surface, not just one.

### D6 — Editor `.tsx` literal sweep — **RULED: full sweep (slice 2)**
Surfaced during slice-2 verification: fix 6 swept `routes/` + `components/` but
**not `editor/`**. ~134 raw Tailwind literals (`bg-white` ×19, `border-slate-200`
×13, `text-slate-700` ×15, …) across 9 editor `.tsx` files left the editor
*shell* (canvas card, toolbar, popovers, insert menu, control widgets)
theme-blind — dark page + WHITE editor card. The NodeViews were already clean
(0 literals; they use `--ed-*`). Ruled: value-identity sweep all 134 to semantic
utilities now (same method as fix 6). Editor-only accents with no `@theme` role
(indigo `--ed-accent-alt`) route via arbitrary-value utilities
(`bg-[color:var(--ed-accent-alt)]`) so slice 2's editor.css dark block drives
them. `bg-slate-900 text-white` active buttons → `bg-primary` (white-text-safe
in dark); the 5 `text-white` stay intentional. Verified: typecheck + 653 app
tests green, editor card renders dark on `/playground`, no console errors.

### D5 — Accent desaturation — **RULED: locked**
**Brighten + slightly desaturate accents in dark.**
`accent` blue-500 → ~blue-400 (`#60a5fa`) for links/focus. **But `accent-strong`
/`-stronger` back solid white-text buttons, so they must NOT brighten** — they
stay blue-600/700 for AA (blue-500 white text is only 3.7:1; the slice-4 harness
caught this). Status `-600` text shades (success emerald-600, warning amber-600,
danger red-600) are too dark to read on dark →
move to `-400/-500`. The tinted `-bg` tokens (`--ed-blue-50`, `--color-warning-bg`
amber-50, `--color-success-bg` green-100) are the trickiest: a "-50" tint reads
as a near-white wash on dark, not a shade — each needs a hand-picked dark
translucent/low-lightness value, not a shade shift.

## Architecture (chrome + editor slice) — AS BUILT (`light-dark()`, D7)

One definition per role via `light-dark(LIGHT, DARK)`; `color-scheme` picks the
side. No `@media` block, no duplication:

```
index.css:
  @theme { --color-<role>: light-dark(<light>, <dark>) }   (BOTH themes, one line)
  :root                 { color-scheme: light dark }        (default: follow OS)
  :root[data-theme=light]{ color-scheme: light }            (toggle: force light)
  :root[data-theme=dark] { color-scheme: dark }             (toggle: force dark)

editor.css:
  shared  --ed-* : var(--color-<role>)                      (inherit light-dark free)
  local   --ed-<x>: light-dark(<light>, <dark>)             (accent-bg, ramps, scrims, --ed-ink)

JS (slice 3): index.html pre-paint guard sets data-theme from localStorage;
  lib/theme.ts store writes data-theme + localStorage; ThemeToggle = the UI.
```

VERIFIED: Tailwind v4 accepts `light-dark()` inside `@theme`; system pref + both
toggle directions resolve correctly on a probe element; DARK values are literal
`rgb()` (Tailwind tree-shakes unused primitive shades). The generated utilities
(`bg-surface`, etc.)
read the live custom property at cascade time, so overriding the property is
enough; no utility regeneration. **VERIFIED (2026-07-18, against a real
`pnpm --filter @activity/app build`):** the compiled CSS emits
`.bg-surface{background-color:var(--color-surface)}` (runtime `var()`, NOT an
inlined shade) and `:root` carries `--color-surface:var(--color-slate-50)`. So a
dark re-point of the role cascades into all ~274 utility sites with zero
regeneration. **Override at the ROLE level** (`--color-surface: <dark>`), never
the primitive (`--color-slate-50: <dark>`) — overriding a primitive would corrupt
any direct `bg-slate-50` use and defeat the elevation remap (which needs
canvas/surface to move independently of their light shade numbers).

## Verification

The fix-6 value-identity canary (0-diff on Home) does NOT transfer directly —
dark is *intentionally* different values, so a 0-diff is meaningless there. Two
new checks:

1. **Light-mode regression guard.** Adding the dark blocks must not change any
   LIGHT computed value. Re-run the Home computed-color canary → still 0 diffs.
2. **Dark-mode assertion + contrast harness (new).** With `data-theme="dark"`
   forced: assert every role resolves to its intended dark value, AND run an AA
   contrast check for ink/strong/muted against each surface in the elevation
   ladder. This is net-new infra (the repo has the computed-color diff method
   but no contrast-ratio assertion). Most chrome routes are behind Google auth,
   so drive this on the Home route + the dev benches (`Dev*.tsx`) + `/playground`
   (editor), all unauthed.

## Slicing (chrome + editor)

1. **`@theme` dark block** (shared roles) + light-regression canary green. **DONE
   (`d1c2443`).** Verified on Home: light 0-diff, dark roles re-point, no errors.
2. **`editor.css` dark block** (editor-local tokens: accent-bg, indigo/teal/red,
   focus-ring, scrims, overlays, the `--ed-ink` command bar inverting to an
   elevated/lighter surface) **+ the D6 editor `.tsx` literal sweep** (134
   literals → semantic utilities). **DONE.** Verified on `/playground`.
3. **Trigger** — media query (system) + explicit toggle (D2 = both). **DONE.**
   Adopted `light-dark()` (D7): every role holds both themes in one line and
   `color-scheme` picks the side, so system pref + toggle share ONE definition
   (no `@media` duplication). Toggle = `lib/theme.ts` store (writes `data-theme`
   + localStorage) + a `ThemeToggle` (System/Light/Dark, floats bottom-left) +
   a pre-paint FOUC guard in `index.html`. Verified: system follows OS, toggle
   forces light on a dark OS + persists across reload, no flash, 656 tests green.
4. **Dark-contrast harness** + AA re-verification across the ladder. **DONE.**
   `e2e/dark-contrast.e2e.ts` reads the real resolved role colors (CSS is the
   source of truth, no duplicated palette) with each theme forced, and asserts
   WCAG AA: the muted-on-canvas+surface invariant, strong/ink on both surfaces,
   the three white-text buttons, and the dark status tint badges. **It caught a
   real bug**: dark `accent-strong` at blue-500 gave white text only 3.7:1 —
   fixed to blue-600 (5.2:1). 5 harness tests green. (Two PRE-EXISTING issues
   surfaced + flagged as separate tasks, NOT dark-mode's: light `text-success`
   is sub-AA at 3.3–3.7:1; and 4 `number-line-formula.e2e.ts` tests fail on
   `main` — both reproduce on the base commit.)
5. Print force-light guard. **DONE.** One `@media print { :root… { color-scheme:
   light } }` in index.css forces every `light-dark()` role to its light value
   (chrome + editor, one rule); the `[data-theme]` selectors are matched so a
   forced-dark user still prints light. Harness test emulates print + dark and
   asserts light paper / dark ink. 6 harness tests green.

## Deferred: published-page dark mode (separate design)

NOT in this slice. Prerequisites, in order: graph-kit color pass (author list
item 2) → `styles.ts` tokenization pass (kill the 76 raw hex) → size-budget
ruling (dark block bytes on every page; may need the per-question-type inlining
lever first) → published dark palette + print-force-light + a per-teacher opt
question (does a published page auto-flip on the student's OS, or does the
teacher choose?). Its own design doc when picked up.
