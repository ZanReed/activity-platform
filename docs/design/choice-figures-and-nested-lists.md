# Choice figures + nested lists — wiring two S9 orphans

**Status:** ✅ **COMPLETE 2026-08-22 — 16 of 17 tasks done; T0b was ticked and never built.** ⚠ Amended 2026-08-24: T0b (preload + print-readiness marker) was checked off while neither mechanism existed, and is now MOOT — [graph-figure-convergence.md](graph-figure-convergence.md) made the SVG engine a static import, so there is no chunk to preload. T0's dynamic import is partly reversed by the same slice. Baselines pinned, print rules asserted, CI green.** Ruled + design-reviewed (5/10 → 9/10) + eng-reviewed (3 premises corrected), 0 unresolved.

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

⚠ **AMENDED BY ENG REVIEW 2026-08-22 — one branch of the "no bundle" claim was
wrong.** `registry.ts` **IS** inside the committed viewer-server bundle (grep the
bundle: `choice-letters` and `letter-bank`, the MC and matching `print.treatment`
values, are both present; `printExpectations.ts` is correctly excluded and says so
in its own header, the V9 888 KiB → 21 MB lesson). `SANITIZER_REV` hashes only
`registeredBlockTypes` + each entry's **`sanitize`** sub-object
(`computeSanitizerRev`, `sanitize.ts:67-78`), so a `print:` change does **not**
move the rev — no cache orphaning, no `get-activity` redeploy. **But E2 makes a
registry `print:` change necessary, so `pnpm bundle:viewer-server` MUST run and
the regenerated bundle be committed in the same commit, or CI's drift gate
fails.** Everything else in the paragraph above holds.

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

## AS BUILT (2026-08-22)

Shipped in `b8c5fac` (components, CSS, guards) and `900fe51` (fixtures).
**`pnpm verify` 8/8; viewer suite 1241; print e2e 68; student 45; a11y 13.**

**Measured in the running app, not inferred.** The text question computes
`display: block`; the figure question computes `grid` with two 317px columns
and **four drawn SVGs**; each figure is **176px — exactly `--vw-figure-cap`**.
Nested lists compute `disc` then `circle` at depths 1 and 2, the child inside
its parent `<li>`.

**E1 held, and this is the number that proves it.** Shell JS moved
**158.5 → 159.2 KiB gz** (cap 172) — the component, not the engine. The engine
lives in its own `graph-svg-*.js` chunk and appears **zero times** in the shell
entry, checked by grepping the built bundle. A static import would have cost
~5.8 KiB of the 13.5 KiB that was left.

**Shell CSS moved 12.4 → 12.8 KiB against a 14.0 cap** — 1.2 KiB of headroom
now, worth knowing before the next stylesheet-heavy slice.

### What the guards caught that review did not

- **A SECOND vacuous check, found the same way.** T10's paper-cap rule was first
  written as `max-width-capped` — the obvious spelling — and it passed with the
  print cap DELETED, because the screen rule already caps the same element at
  11rem. It proved "a cap exists", not "the paper cap applies". It now asserts
  the computed value (168px = 1.75in) and dies under that mutation. Two
  vacuous guards in one slice, both found by mutation and neither by reading:
  that is the argument for mutation-testing every guard this repo adds.

- **One of my own tests was VACUOUS**, and the mutation run is what found it.
  The alt-promotion test was written with `alt: 'a parabola'`, so it passed
  with the A4 branch reverted — a non-empty alt names the control on its own
  and the branch never ran. `ChoiceImage.alt` defaults to `''`, which is the
  case that actually produces an unnamed radio; that is the case now pinned.
  Policy P9, applied to the fix rather than to the original defect.
- **`kind: 'line'` is not a drawable kind.** Component tests build raw objects
  that never meet the schema, so the engine counted a shape it could not draw
  and the assertion passed. The FIXTURES, which parse, caught it.
- **`put()` replaces rather than appends** — a second `put('multiple_choice')`
  silently deleted the primary fixture.
- **The print answer-key oracle assumed one instance per type.**
- Three project guards fired and were right: tokens vocabulary sync,
  export-reachability refusing a barrel export only tests use, and both
  bundle-drift gates once the registry changed.

### Still owed

- ~~**T11 — the Linux print baselines.**~~ ✅ **DONE 2026-08-22** (run
  32578933002, `gh workflow run ci.yml -f update_print_baselines=true`).
  **3 of 23 changed**, and they were READ before they were pinned:
  `multiple_choice` 407→879px (the new four-graph question),
  `bullet_list` and `ordered_list` 250→278px (the sub-bullet line).
  `matching` was byte-identical, which independently confirms the
  `__target-content` wrapper shifted nothing.

  What the images show, and the reason reading them mattered: the printed
  question is genuinely answerable — four distinct graphs in a 2×2 grid,
  lettered A–D in the same position Q1's letters sit in — and the list
  cascade renders `•` then indented `◦` on paper, including a bullet child
  under a numbered parent. Also visible: the questions are now numbered 1./2.
  where the single-question page was unnumbered. That is correct sequential
  numbering appearing because the harness document now holds two questions,
  not a regression.

  ⚠ **Never run the update command locally on macOS** — see the note this
  replaced: Playwright suffixes snapshots by platform, so it writes a
  gitignored `-darwin` set, reports green, and updates nothing CI reads.

- **T12 — the doc corrections** (`markdown-import-format.md:607`/`:630`, the
  dead-renderer comment in `multiple-choice.ts`).

## Eng-review amendments (2026-08-22, 4 decisions)

Every one came from checking a claim against code rather than trusting it.

**E1. The engine loads ON DEMAND, not statically** (D10; corrects the plan's
premise). `bindings.ts` has **19 eager bindings and 4 lazy** — `multiple_choice`
and `matching` are BOTH `loading: 'eager'`, so a static import of
`graph-kit/static-svg` lands in the **student shell**, not a block chunk.
Measured: the engine is **5.07 KiB gz** (13,965 B minified) against `shell JS`
at **158.5 / 172.0 KiB** — **38% of the remaining headroom**, while the
shell-slim ladder is parked. So: dynamic `import()` inside the figure component,
mirroring `kitSurfaces.ts:91`; a document walk that preloads when any choice
carries a graph; and a pending marker `printReadiness.ts` can wait on.
**A8's reserved box already removes the layout-shift objection** — the two
rulings compose.

⚠ **The preload trigger must be DERIVED, not hand-listed** (policy P4).
`kitPreload.ts` derives its set from `sanitize.deriveQuestionShape`, bonded by
`rosterBonds.test.ts`. MC/matching must NOT set that flag (they need no shape
from the key), so the choice-figure trigger is a **document walk**, not a
registry flag and not a second hand-maintained roster.

**E2. `GraphFigure.tsx` is NOT a substitute, and the fork stays** (D10). It is
only 883 B gz because it **returns `null` for `curve` and `expression`
drawables** (`GraphFigure.tsx:110-111`). Reusing it would render an empty box
for "which graph shows y = x²" — silent content loss, the exact class this slice
fixes. Convergence (make `GraphFigure` render via `renderGraphSvg`) is the right
long-term move and is filed in TODOS; it is **not** free (+4.3 KiB gz net) and
is out of scope here. **A fork with a documented reason to exist is worse than
an accidental one if the reason is never written down** — hence this paragraph.

**E3. The registry's print declaration becomes conditional, and both branches
are asserted** (D11). A9 makes matching's `breakInside` depend on content while
`registry.ts:283` declares `'avoid'` unconditionally. Left alone that is a
declaration outliving its implementation — **this repo's signature bug class,
one level up from the fields being fixed**, and the print check would keep
asserting the declared rule and passing. So the print vocabulary learns
content-conditional `breakInside`, the checks cover with-figures AND
without-figures, and the viewer-server bundle is regenerated in the same commit.

**E4. Tests build their own documents; shared fixtures change LAST** (D12).
E1 makes the figure asynchronous, so every figure test needs an explicit wait —
and critically, **an absence assertion can pass merely by looking too early**,
which is a test passing for the wrong reason (policy P9, and the sw-lane lesson:
"a lane that passes because of what is ABSENT from the machine is not passing,
it is unobserved"). Only the print e2e reads `fixtures/index.ts`, so component
tests use inline documents and the shared fixtures land in **one final commit
with a single Linux baseline regeneration** instead of four.

### One more vacuity trap, named so it cannot be walked into

`querySelector('.viewer-mc__figure') !== null` **passes against an empty
`<div>`.** The guard asserts CONTENT: the `img[src]` resolves, and the SVG
carries `data-drawables="N"` — the assertion `print-twins.test.tsx:14-17`
already makes. Then mutation-test it: revert the wiring, record which cases go
red.

### Figure data path

```
  ChoiceGraph {axis, drawables}          ChoiceImage {src, alt}
        │                                       │
        │  (already past the sanitizer:         │
        │   deny-list strips correct/           │
        │   feedback/solution only)             │
        ▼                                       ▼
  ┌───────────────────────── <ChoiceFigure> ─────────────────────────┐
  │  ONE component, used by MultipleChoice, Matching item AND target │
  │  (mirrors the editor's shared FigureHolder / ChoiceFigureEditor) │
  │  · the single dangerouslySetInnerHTML audit point                │
  │  · box reserved via aspect-ratio (A8) before anything arrives    │
  └───────┬──────────────────────────────────────────┬───────────────┘
          │ graph                                    │ image
          ▼                                          ▼
   await import('@activity/graph-kit/static-svg')   <img loading=lazy>
   renderGraphSvg(axis, drawables,                   │ onError
     blockId + '-' + choiceId)  ← ids are            ▼
     document-global; namespace or                  alt text in a
     clipPath/marker ids collide                    dashed box (A8)
          │
          ▼
   preload walk: document contains a choice graph?
     → warm the chunk + set a pending marker printReadiness waits on
       (otherwise paper records the moment before it arrived)
```

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

- [x] **T0 (P1)** — viewer/blocks — **`<ChoiceFigure>`: ONE shared component** (image + graph, ~~dynamic engine import, reserved box~~, error state, accessible naming)
  - ⚠ **PARTLY REVERSED 2026-08-23.** The dynamic engine import and its reserved
    box are GONE — the engine is a static import (graph-figure-convergence.md
    ruling 9A). The measurement that reversed it: the built `graph-svg` chunk is
    3.3 KiB gz, not the 5.07 KiB this slice costed it with (that figure was the
    whole `static-svg` subpath, which a dynamic import pulls as five chunks).
    The shared-component decision itself (CQ-1) stands and was never in question.
  - Surfaced by: CQ-1 (DRY — the editor already shares `FigureHolder`/`ChoiceFigureEditor`); E1; A4; A8
  - Files: new `packages/viewer/src/blocks/ChoiceFigure.tsx`
  - **The single `dangerouslySetInnerHTML` audit point.** Carries the ASCII data-path diagram in its header
  - Verify: content assertions (`img[src]`, `svg[data-drawables]`), not existence
- [~] **T0b (P1)** — ⚠ **TICKED HERE, NEVER BUILT — and now MOOT (2026-08-23).**
  - This box was checked while `choiceFigurePreload` and the `printReadiness`
    wait on `[data-figure-pending]` did not exist in any form: `kitPreload.ts`
    warmed only JSXGraph, and `printReadiness.ts` polled math, lazy Suspense
    fallbacks and images. `ChoiceFigure.tsx`'s header asserted both mechanisms
    for eight days, which is how it was found — by reading the header while
    scoping a different slice, not by any test.
  - **It is moot rather than owed.** [graph-figure-convergence.md](graph-figure-convergence.md)
    made the SVG engine a static import (ruling 9A, reversing E1/T0 below), so
    there is no chunk to preload and no pending state to wait for. The work
    this box described cannot be done because its subject is gone.
  - **The lesson is the durable part:** a ticked box is a claim, and this repo
    now has two instances of a claim outliving its implementation in the same
    component. Verify against RENDERED OUTPUT, never against a checkbox.
- [x] **T1 (P1)** — viewer/blocks — Mount `<ChoiceFigure>` in `MultipleChoice.tsx`
  - Surfaced by: the orphan itself; A1/A5/A7
  - Files: `packages/viewer/src/blocks/MultipleChoice.tsx`
  - Verify: component test asserts figure CONTENT, absent when unauthored (**await a settled signal — an absence assertion can pass by looking too early**, E4)
- [x] **T2 (P1)** — viewer/blocks — Render item + target figures in `Matching.tsx`
  - Surfaced by: A3; note the target has no wrapper element today (`Matching.tsx:90`)
  - Files: `packages/viewer/src/blocks/Matching.tsx`
- [x] **T3 (P1)** — viewer/styles — Figure CSS: caps as tokens, the conditional grid, the label's flex-to-column change, mobile collapse
  - Surfaced by: A2/A6/A10; the `align-items:center` collision
  - Files: `packages/viewer/src/tokens/tokens.css`, `packages/viewer/src/styles/viewer.css`
  - Verify: `print-rules.e2e.ts` computed-style rows; must not trip `mc/no-tap-floor`
- [x] **T4 (P1)** — viewer/blocks — Loading + error states (folded into T0's component)
  - Surfaced by: A8. **Invisible to the print gate (network blocked) — needs its own component test**
- [x] **T5 (P1)** — viewer/blocks — Accessible naming for figure-only choices
  - Surfaced by: A4. Verify with an axe assertion, not by inspection
- [x] **T6 (P1)** — viewer/styles + registry — Matching bank: grid + conditional break, **declaration made conditional**
  - Surfaced by: A9 + E3. Extend the print vocabulary so `breakInside` can be content-conditional; assert BOTH branches
  - Files: `packages/viewer/src/styles/viewer.css`, `packages/viewer/src/registry/registry.ts`, `printExpectations.ts`
  - ⚠ **Registry change ⇒ `pnpm bundle:viewer-server` + commit the bundle in the SAME commit** (E3; CI drift gate). `SANITIZER_REV` does not move, so no redeploy
- [x] **T7 (P1)** — viewer/blocks — Recurse `item.children` in `BulletList.tsx` / `OrderedList.tsx`
  - Surfaced by: feature 2. Copy `DefinitionGlossary.tsx:65-89`
- [x] **T8 (P1)** — viewer/styles — Nested list CSS: marker cascade, nested top spacing, indent cap past level 3
  - Surfaced by: B1/B3, and the two spacing gaps (no top margin on a nested list; sibling margin does not cross the nesting boundary)
- [x] **T9 (P1)** — viewer/tests — Guards bound to output, **mutation-tested**, on INLINE documents
  - Cases: figure+text, figure-only, image+graph (image wins), broken image, nested bullet, nested ordered, depth 4
  - **Assert content, never existence** (`.viewer-mc__figure !== null` passes against an empty div — T-1)
  - Mutation test: revert the wiring, record which cases flip red (the `4a50b00` bar)
- [x] **T9b (P1, LAST)** — viewer/fixtures — Add the shared fixtures, in ONE commit
  - Surfaced by: E4/P-2. Only the print e2e reads `fixtures/index.ts`, so this lands last and churns the baselines once
  - Images use `data:` URIs (print e2e blocks network)
- [x] **T10 (P2)** — print — ✅ done: instance-scoped `figure/prints` + `figure/capped` checks, addressed via a `figures: true` roster row. **`figure/capped` asserts the VALUE (168px), not `max-width-capped`** — that spelling was vacuous, proven by mutation
- [x] **T11 (P2)** — print baselines — ✅ done via the manual CI job (run 32578933002); 3 of 23 changed, read before pinning. **Not doable on macOS** — see the T11 note above
- [x] **T12 (P2)** — docs — ✅ done in `79e6f13` (import-format `:607`/`:630` corrected, dead-renderer comment replaced)
- [x] **T13 (P3)** — TODOS — ✅ filed (A3's honest fix, and it retires the registry's false a11y claim)
- [x] **T14 (P3)** — TODOS — ✅ filed (`GraphFigure.tsx` → `renderGraphSvg`)
  - Surfaced by: E2/CQ-2. Two engines, one job; the smaller silently drops curves. Net +4.3 KiB gz, out of scope here — **but a fork with a documented reason to exist becomes folklore unless the reason is filed**

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | not applicable — no product-direction question |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | not run for this plan |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | **clean (2026-08-22)** | 6 architecture + 3 code-quality + 3 test + 2 perf findings; 4 decisions; **3 plan premises corrected** |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | clean (2026-08-22) | score 5/10 → 9/10, 9 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 1 | clean (2026-08-20, prior plan) | stale for this plan |

**VERDICT:** ENG + DESIGN CLEARED — ready to implement.

The eng review earned its place by falsifying three claims the plan asserted:
(1) block components are lazy — **false**, 19 of 23 bindings are eager including
both blocks being changed, which turned a free import into 38% of the shell's
remaining headroom; (2) the small in-shell SVG engine is a drop-in substitute —
**false**, it returns `null` for curve drawables, so it would have reintroduced
silent content loss inside the slice fixing silent content loss; (3) no bundle
regeneration is needed — **false in one branch**, `registry.ts` ships inside the
committed viewer-server bundle, though `SANITIZER_REV` genuinely does not move
so no redeploy is owed.

NO UNRESOLVED DECISIONS
