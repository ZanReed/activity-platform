# Choice figures + nested lists — wiring two S9 orphans

**Status:** 🟢 **PLAN — RULED + DESIGN-REVIEWED 2026-08-22 (5/10 → 9/10, 0 unresolved). Ready to build; no code yet.**

Wires two of the five orphan classes the 2026-08-22 drift audit filed
(TODOS.md → "S9 left FIVE MORE ORPHAN CLASSES"). Both are **content loss**: a
teacher authors something, the editor stores it, the importer accepts it, and
the student sees nothing — on screen and on paper.

## Why they broke, and why that shapes the fix

The implementations lived in `packages/renderer` and its published-page runtime,
deleted at S9 Drop 4 (2026-08-14). The schema fields, the editor controls, the
importer syntax and the design docs' "✅ live" statuses all survived. The viewer
was rebuilt from the block **registry**, not from a field-by-field inventory, so
anything whose logic lived only in the renderer fell through.

The old implementations are recoverable at `11002cf^` and are the precedent this
plan follows rather than re-derives.

## Scope — smaller than it looks

**Viewer-only.** The sanitizer is a deny-list
(`strip: ['choices[].correct', 'choices[].feedback', 'solution']`), so choice
figures and list children **already arrive in the student's browser today**. The
editor already round-trips nested lists losslessly, proven by
`serialize.test.ts:1330`.

Therefore: no schema change · no sanitize-spec change · **`SANITIZER_REV` does
not move** · no `bundle:viewer-server` / `bundle:grading-server` · no
`get-activity` redeploy · no read-cache orphaning · no migration · no author
deploy station.

The one non-local cost: touching the MC / matching / list **fixtures** changes
their Linux print baselines, which are CI-authoritative and cannot be
regenerated on macOS (`PRINT_BASELINES=1` on Linux, in a container or a CI
dispatch). Per the table arc's precedent the images are **read** before they are
pinned.

---

## Feature 1 — per-choice figures

A teacher attaches an image or a small static graph to an individual answer
choice. The marquee case is "which graph shows y = 2x?"; matching's is "match
the graph to its equation".

Fields (all optional, all already sanitize-safe):
`MultipleChoiceOption.image {src, alt}` / `.graph {axis, drawables}`;
`MatchingItem` and `MatchingTarget` carry the identical slot.

Graphs render through `renderGraphSvg` from the `@activity/graph-kit/static-svg`
**subpath** — pure, synchronous, kit-free (no JSXGraph, no MathLive), emits an
SVG string with a 400×400 viewBox and **no intrinsic size**, so sizing is
entirely a CSS problem. `InteractiveGraph.tsx` already imports it, and — the
property worth protecting — **the editor's choice-figure preview already calls
it with the same `ChoiceGraph` shape and a `'mcfig-' + choice.id` uid**, so
teacher preview and student render can be byte-identical.

### Rulings

**A1. The figure sits INSIDE the `<label>`**, so clicking the graph selects the
choice. This is the renderer's precedent and it is what a student will do
unprompted on a "which graph" question. Cost: `.viewer-mc__label` is
`display:flex; align-items:center`, so a tall figure centres against the letter
and stretches the row — the label needs wrap or column treatment.

**A2. A size cap is mandatory, not polish.** Nothing caps a choice figure today,
and four uncapped 400px squares inside a `break-inside: avoid` block will not fit
a page. Ruled: **~11rem on screen** (the editor's own `defaultChoiceAxis`
comment already assumes ~11rem for a choice-sized figure) and **1.75in in print**.

**A3. Matching renders figures on both items and targets, accepting the
letter-indirection.** The interaction is a `<select>` whose `<option>` can hold
only the letter, so a graph target means: read the bank, memorise "graph B",
scroll to the item, pick "B" from a dropdown. The honest fix is the
drag / select-then-place interaction the **registry already claims exists**
(`registry.ts:280` describes lift/place/narrate; `Matching.tsx` implements a
`<select>` and says so) — that is its own arc, filed separately, not this slice.

**A4. A figure-only choice must not render an unnamed radio.** The importer
explicitly permits `content: []` plus a figure. Today that would produce a radio
labelled only by an `aria-hidden` letter plus either an `alt=""` image or an
`aria-hidden` SVG — an axe violation, and the a11y lane has caught the sibling
case before. Ruled: **empty content ⇒ promote `alt` to the accessible name**;
**graph-only falls back to the choice letter** ("Choice B"), the `showCellLabels`
resolution. This deliberately departs from `Image.tsx`'s "an empty alt is
DELIBERATE and must stay empty" doctrine, which applies to a *decorative* image
beside text — here the figure IS the choice.

**A5. If both `image` and `graph` are set, image wins** (schema says so; the
editor and importer both enforce exclusivity anyway). Pinned by a fixture.

**A6. Arrangement — grid when EVERY choice carries a figure, stacked otherwise**
(design review D3, measured not argued). A wireframe at true 8.5×11in with the
product's `@page { margin: .5in }`: four 1.75in graphs as stacked full-width rows
occupy **7.58in of the 10in printable column (76%)**; the same four in a two-column
grid occupy **3.79in (38%)**. Because the block carries `break-inside: avoid`,
stacked means one question per sheet — for the exact question type the feature
exists to serve. Text-only choices keep the stacked full-width rows: a vertical
list is how people scan options, and a grid of bare text reads as ragged. A
*mixed* question (some choices with figures) stays stacked — its figures sit
under their text.

**A7. The figure sits BELOW the choice text; the letter stays to the LEFT** in
both layouts. The schema comment and the deleted renderer agree on the first;
the second keeps the letter in one place across layouts, which matters because
**on paper the letter IS the answer** (print hides the control and the answer key
marks the letter).

**A8. Image failure and loading are designed states** (D4). The figure box is
reserved via `aspect-ratio` so the choice list does not reflow as images arrive
on slow school wifi. On `error`, the image is replaced by **its `alt` text in
muted type inside a dashed box** — not a browser broken-image glyph, which is
meaningless to a student and, because whatever is on screen at print time is
what prints, gets photocopied thirty times. The print e2e blocks all network, so
**this state is invisible to the print gate and needs its own component test.**

**A9. The matching bank grids and becomes breakable when it holds figures** (D5).
The bank is a bordered box with `break-inside: avoid` — correct for text, fatal
for figures: five 1.75in targets is ~9.5in of content in a 10in column, plus the
prompt and the items below it. When the bank contains figures it uses the same
two-column grid AND drops `break-inside: avoid`. **An unbreakable block that
cannot fit is worse than one that breaks** — the alternative is the browser
flinging the whole bank onto its own page, stranding the items that reference it
on a different sheet.

**A10. The caps are TOKENS, and the grid collapses on mobile** (D6). Add
`--vw-figure-cap: 11rem` and `--vw-figure-cap-print: 1.75in` to
`packages/viewer/src/tokens/tokens.css`; the grid drops to one column at the
breakpoint matching already uses (`viewer.css:945`), because a fixed two-column
grid on a 375px phone yields ~170px cells — a coordinate graph too small to read
a slope from. A token also lets the editor preview read the same value, so
teacher preview and student render agree by construction rather than by
discipline.

### Known traps

- **`[data-print-svg] { display: none }` on screen.** Reusing `PrintTwin` for a
  choice figure ships it print-only — the easiest way to ship this broken. A
  choice figure needs its own class and its own visibility rule, visible in both
  modes with no `mode` branch.
- **The print e2e blocks all network**, so any image fixture uses a `data:` URI,
  like the existing block-level image fixture (a broken-image icon would
  otherwise be what "actually prints").
- **SVG ids are document-global** — the uid must be namespaced per choice or
  several graphs on one question collide on `clipPath`/marker ids.
- `mc/no-tap-floor` and `matching/no-tap-floor` assert `min-height ∈ {0px, auto}`
  on paper; a figure that reserves space with `min-height` turns them red.
- `.viewer-matching__letter-line` uses `align-self: flex-end`; once an item row
  is tall, the write-on line detaches from the words it answers, and the
  existing print check tests the border, not the position — it would regress
  silently.

---

## Feature 2 — nested lists

`ListItem.children` holds whole nested list blocks (`bullet_list` /
`ordered_list`), recursive, unbounded. It is authored, autosaved, published and
reloaded intact; the viewer's `<li>` simply never recurses, so a teacher's
indented sub-bullet vanishes for students.

`DefinitionGlossary.tsx:65-89` already renders exactly this shape recursively —
nested list as a sibling of the inline content inside the same `<li>`. That is
the pattern; `BulletList.tsx` / `OrderedList.tsx` each need the one missing
recursive call.

### Rulings

**B1. Explicit marker cascade:** `disc → circle → square` for bullets,
`decimal → lower-alpha → lower-roman` for ordered. Rejected reusing the
`(a)`/`(b)` sub-part alphabet from `FillInBlank`/`Table`: in this product `(a)`
already means *a gradeable sub-part slot*, and a decorative sub-bullet is not
that. Note `viewer.css:372` carries a standing rule that markers are stated
explicitly and never inherited from the host page, so "let the browser default
happen" is a choice that must be written down, not an absence of one.

**B2. No depth cap.** Schema, editor, importer and serializer are all unbounded;
the marker cascade repeats after level 3.

**B3. The indent stops compounding past level 3** (design review D7). Each level
indents by `--space-6` (1.5rem ≈ 0.25in). Depth is unbounded by design, and
teachers paste four- and five-deep outlines out of lesson plans; left
uncapped, a level-6 item starts ~1.5in in and its text column keeps shrinking
toward a one-word-per-line ribbon on paper. Levels 4+ reuse level 3's indent —
the same place the marker cascade resets, so it is one rule with one reset
point. Depth past 3 is then signalled by the marker alone, which is the
acceptable half of the trade: **the editor never shows this failure**, because it
does not use the print column width.

### Also needed

There is **no nested-list CSS at all** today, and two gaps beyond markers: a
nested list appended inside an `<li>` gets no top spacing, and
`.viewer-list__item + .viewer-list__item` does not apply across a nesting
boundary. Lists also have **zero print checks** (`prose` treatment is an empty
array), so the paper half is currently ungated.

---

## The guard bar

Both features get guards **bound to rendered output at both poles, plus print,
plus a11y, and mutation-tested** — the `table.test.tsx` bar set by `4a50b00`:
reverting the wiring must turn the guards red. A test comparing a schema field
to an editor attribute would have passed the entire time these fields did
nothing, which is exactly how the previous orphans survived. Conformance does
not cover this: it asserts checked-state family behaviour and is blind to
whether an authored field renders.

## Doc corrections owed with the wiring

- `docs/markdown-import-format.md:607` and `:630` state per-choice graphs are
  "editor-only, no fence syntax" — **factually wrong**; `markdownToTiptap.ts`
  parses `graph:` at two sites with a passing test.
- `multiple-choice.ts:40-44` says figures are "rendered server-side as inline SVG
  by the renderer's graph-svg engine" — a deleted package.
- The importer's "nested list items under a problem were dropped" warning exists
  only in code, in no doc.

## Deliberately out of scope (filed, not fixed)

- The matching drag / select-then-place interaction (A3's honest fix) — own arc.
- Multi-paragraph list items: `serialize.ts:1160` keeps only the first paragraph.
- `DefinitionListItem.children` on the **on-screen** definition path (the print
  glossary renders it; the popover path needs its own check).

## What already exists — reuse, don't reinvent

| Existing | Use it for |
|---|---|
| `DefinitionGlossary.tsx:65-89` | The recursive nested-list render. Identical shape (nested list as a sibling of inline content inside the same `<li>`), already shipped and tested. |
| `renderGraphSvg` via `@activity/graph-kit/static-svg` | Choice graphs. Pure, synchronous, kit-free. **The editor's choice-figure preview already calls it with the same `ChoiceGraph` shape and a `'mcfig-' + choice.id` uid** — matching that makes preview and student render byte-identical. |
| `Image.tsx` | `aspect-ratio` box-reservation, `loading="lazy"`, and the `figure`/`figcaption` vocabulary. |
| `packages/viewer/src/tokens/tokens.css` | `--space-*`, `--vw-radius-lg`, `--touch-target`, `--vw-color-line`. The two new caps join it (A10) rather than being inlined. |
| `printExpectations.ts` treatment table | Where the new print checks are declared, asserted by `print-rules.e2e.ts` against **computed style**. |
| `tests/components/table.test.tsx` (`4a50b00`) | The guard pattern and the acceptance bar. |
| `11002cf^` | The deleted renderer's `renderChoiceFigure` / `renderMatchFigure` / recursive `renderListItem`. Precedent, recoverable, already reviewed once. |

## Design wireframe

`~/.gstack/projects/ZanReed-activity-platform/designs/choice-figures-20260822/wireframe.html`
— built from the real tokens at a true 8.5×11in page box with the product's own
`@page` margin, which is what makes A6's 76%-vs-38% a measurement rather than an
opinion. It also renders B1's marker cascade (disc → circle → square, decimal →
lower-alpha → lower-roman) for visual confirmation. Not a mockup of a proposed
aesthetic; a measuring instrument. Regenerate it if the caps change.

## Implementation Tasks

Synthesized from the review's findings. P1 blocks ship; P2 lands same branch;
P3 is a follow-up.

- [ ] **T1 (P1)** — viewer/blocks — Render the choice figure in `MultipleChoice.tsx`
  - Surfaced by: the orphan itself; A1/A5/A7
  - Files: `packages/viewer/src/blocks/MultipleChoice.tsx`
  - Verify: new component test asserts the `<img>`/`<svg>` in the DOM, absent when unauthored
- [ ] **T2 (P1)** — viewer/blocks — Render item + target figures in `Matching.tsx`
  - Surfaced by: A3; note the target has no wrapper element today (`Matching.tsx:90`)
  - Files: `packages/viewer/src/blocks/Matching.tsx`
- [ ] **T3 (P1)** — viewer/styles — Figure CSS: caps as tokens, the conditional grid, the label's flex-to-column change, mobile collapse
  - Surfaced by: A2/A6/A10; the `align-items:center` collision
  - Files: `packages/viewer/src/tokens/tokens.css`, `packages/viewer/src/styles/viewer.css`
  - Verify: `print-rules.e2e.ts` computed-style rows; must not trip `mc/no-tap-floor`
- [ ] **T4 (P1)** — viewer/blocks — Loading + error states for choice images
  - Surfaced by: A8. **Invisible to the print gate (network blocked) — needs its own component test**
- [ ] **T5 (P1)** — viewer/blocks — Accessible naming for figure-only choices
  - Surfaced by: A4. Verify with an axe assertion, not by inspection
- [ ] **T6 (P1)** — viewer/styles — Matching bank: grid + breakable when it holds figures
  - Surfaced by: A9
- [ ] **T7 (P1)** — viewer/blocks — Recurse `item.children` in `BulletList.tsx` / `OrderedList.tsx`
  - Surfaced by: feature 2. Copy `DefinitionGlossary.tsx:65-89`
- [ ] **T8 (P1)** — viewer/styles — Nested list CSS: marker cascade, nested top spacing, indent cap past level 3
  - Surfaced by: B1/B3, and the two spacing gaps (no top margin on a nested list; sibling margin does not cross the nesting boundary)
- [ ] **T9 (P1)** — viewer/fixtures + tests — Fixtures for every new case, guards bound to output, **mutation-tested**
  - Cases: figure+text, figure-only, image+graph (image wins), broken image, nested bullet, nested ordered, depth 4
  - Images use `data:` URIs (print e2e blocks network)
- [ ] **T10 (P2)** — print — Add list + choice-figure checks to `printExpectations.ts`; `prose` currently asserts **nothing**
- [ ] **T11 (P2)** — print baselines — Regenerate the Linux baselines for `multiple-choice`, `matching`, `bullet-list`, `ordered-list`. **Read before pinning** (table-arc precedent). Cannot be done on macOS
- [ ] **T12 (P2)** — docs — Fix `markdown-import-format.md:607`/`:630` (per-choice graphs ARE importable), the dead-renderer comment at `multiple-choice.ts:40-44`, and document the importer's nested-under-a-problem drop
- [ ] **T13 (P3)** — TODOS — File the matching drag/select-then-place arc (A3's honest fix, and it retires the registry's false a11y claim)

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 1 | issues_found (2026-08-21, prior plan) | stale for this plan |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | clean (2026-08-21, prior plan) | 15 issues, 0 critical — **predates this plan** |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | **clean (2026-08-22)** | score 5/10 → 9/10, 9 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 1 | clean (2026-08-20, prior plan) | stale for this plan |

**VERDICT:** DESIGN CLEARED. The eng-review row is CLEAR but was logged against
`166cfe2` (the table arc) — it predates this plan and does not cover it. This
change is viewer-only with no schema, sanitize, bundle or deploy surface, so the
architectural exposure is small; run `/plan-eng-review` before building if you
want the required gate to actually cover this work.

NO UNRESOLVED DECISIONS
