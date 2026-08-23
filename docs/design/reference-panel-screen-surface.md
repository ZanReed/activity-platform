# The reference panel comes back to the screen

**Status:** ✅ **BUILT 2026-08-23 — R1–R8 ruled as recommended, all shipped. See AS-BUILT at the end.**

Closes the sixth S9 orphan: `ActivityDocument.referencePanel` is authored,
stored, sanitized, censused — and on screen, seen by nobody. Deferred out of the
calculator slice (D15) because its shared-host justification was false and its
content-shape questions were unanswered. The calculator shipped 2026-08-23; this
is its twin, and it inherits more than the plan expected.

## Ground truth, read before designing

Everything below was read from code or measured against the live database, not
inferred from the prior docs — the last two reference-panel claims in this repo
were both wrong (the print default, and "the two tools share one fix").

**1. The rendering already exists and already works.**
`ViewerContainer.tsx:275` renders `doc.referencePanel.blocks` through
`BlockSlot` — the same registry-driven path the body uses, with `mode` and the
per-block error boundary. It is gated on `print.printReferencePanel` and styled
`display: none` until `@media print`. **So this slice is a CONTAINER, not a
renderer.** Panel blocks already render; they have nowhere on screen to render
*into*.

**2. What teachers actually put in a panel, measured 2026-08-23.**

| | count |
|---|---|
| Published versions carrying a `referencePanel` | **0 of 29** |
| Drafts carrying one | **1 of 14** |
| Blocks in that one panel | **3** — `paragraph`, `bullet_list`, `math_block` |

**The observed shape is a formula list.** The plan's worries — Columns inside a
24rem window, full-size images, a periodic table — are *imagined* content, and
designing the container around them would be designing against nothing. This is
the single most useful input to R2/R3 and it is why they are framed as "build
for the observed shape" rather than "solve the general case".

**3. The conventions are already ruled** (DECISIONS.md:193-195) and are NOT
reopened here: summon hides while its panel is open; × or Escape closes (Escape
respects `defaultPrevented` so an inner definition popover consumes its own);
focus moves panel ↔ button; `role="dialog"` **non-modal**; the panel anchors
bottom-**LEFT** so an open calculator (bottom-right) never collides; z-order
`tools 110 < reference 115 < calculator 120 < popovers 1000`.

**4. What the calculator slice already built that this inherits.**
`.tool-corner` (fixed, `--z-tools`), the summon button styling, the pending and
failed states, the `<480px` sheet precedent, and the print/preview hide rules.
**`--z-reference` (115) is now the ONLY one of the three z-tokens with zero
`var()` consumers** — the other two were wired by the calculator.

**5. What it does NOT inherit, and must not try to.**
DECISIONS.md:194 forbids this panel using the graph-kit for chrome ("would cost
hundreds of KiB"). The deleted sidecar reimplemented drag in ~40 lines. The
calculator's chrome is framework-agnostic DOM built *inside* `mountCalculator`,
is not exported, and cannot wrap React block components. This panel's chrome is
a small React component in the viewer.

**6. Two stale claims this slice makes true or must fix.**
`ViewerContainer.tsx:270` already says *"On screen the panel is a summoned
tool"* and `viewer.css:1275` says *"the panel is a tool a student summons"* —
both describe a mechanism that has not existed since S9 Drop 4. This slice makes
them true. If any ruling below lands differently, they must be rewritten
instead.

## The decisions

Numbered for yes/no. R2 and R6 are the two that change what gets built; the rest
follow from them.

### R1. The summon corner — honor bottom-LEFT, or stack both in one corner?

**Recommend: bottom-LEFT, as already ruled.** The convention exists because both
panels are open at once in the worst case, and the calculator's kit hardcodes
`right: 1rem; bottom: 1rem`. Stacking both summons bottom-right would put the
reference summon *underneath* an open calculator, which is exactly the collision
the two-corner rule was written to avoid.

Cost: a second corner element. `.tool-corner` becomes a shared class with a
side modifier rather than a single fixed bottom-right box.

### R2. The panel's form — floating window, docked sheet, or fixed panel?

The load-bearing decision.

| | For | Against |
|---|---|---|
| **(a) Floating window** (calculator-like: draggable, resizable) | Consistent with the tool a student already knows; slides off the work | ~40 lines of drag to reimplement; the panel is *reading* material, and a student reading a formula list rarely needs to reposition it |
| **(b) Docked left sheet** (full height, fixed width, pushes nothing) | Best for tall reference content; no drag machinery; trivially responsive | Occupies viewport width whenever open — the failure of the OLD bottom-bar toolbar that DECISIONS.md:193 retired |
| **(c) Fixed floating panel, NO drag** (v1) | Smallest correct thing; C5's own rule says drag is an ENHANCEMENT and the panel must be fully usable parked | A student cannot move it off a paragraph it covers |

**Recommend (c) for v1, with (a) as the follow-up if a real teacher asks.** The
observed content is three blocks; the drag machinery is the expensive half; and
this repo's standing lesson is that speculative capability becomes an orphan.
(c) is (a) minus the drag, so upgrading later changes nothing already built.

### R3. Default width, and what happens to wide content

**Recommend: 24rem, scrollable, `max-width: min(24rem, calc(100vw - 2rem))`.**
Matches the calculator's family and the observed formula-list shape.

For content wider than that: images clamp to `max-width: 100%`, tables and
figures get their own `overflow-x: auto` so the PANEL never scrolls sideways.
Columns inside the panel collapse to a single column below the panel width —
they already have to, since the panel is narrower than any two-column layout.

**Explicitly NOT solved: the periodic table.** No teacher has authored one. When
one does, the answer is probably a zoom affordance or a print fallback, and that
is a decision to make with the real artifact in hand.

### R4. Is there a teacher toggle for the SCREEN surface?

**Recommend: NO new flag.** Authored panel content exists to be consulted; a
teacher who does not want a panel does not author one. A `screenReferencePanel`
field would be a new declaration whose only reader is one conditional — the
exact shape of the eight orphans this repo keeps paying for, and the flag
discipline ruled on 2026-08-23 says one flag per feature that changes what a
student can DO.

### R5. What `printReferencePanel` means afterwards

Today it defaults **true** and print is the panel's ONLY surface, so turning it
off makes the panel invisible everywhere — a trap the schema comment now
documents. After this slice, off means *screen-only*, which is what the field
always claimed to mean.

**Recommend: leave the default alone and delete the trap language.** No
migration, no behaviour change for stored documents; the field simply becomes
honest.

### R6. `<480px` — the same bottom sheet as the calculator?

**Recommend: yes**, reusing the calculator's precedent (full-width, bottom
anchored, no drag). The one difference: the reference panel is *reading*
material, so it should cap at a lower height (~60vh) than the calculator's 72vh
and stay scrollable, rather than filling the screen over the work the student is
reading it *for*.

### R7. Does the panel open by default on first visit?

**Recommend: NO — summon only.** The first-visit nudge was dropped from the
calculator plan as its most speculative item, and it was the only reason that
plan needed a persisted-state exception. Same answer here, same reason.

### R8. Print behaviour

**Unchanged.** The print box at the top of the sheet stays exactly as it is.

## What this does NOT touch

- **The panel's authoring UI** — unchanged; the constrained second editor stays.
- **The paste-a-question hole.** `ReferencePanelEditor` registers
  MultipleChoice/Matching/Ordering nodes to satisfy the column content schema,
  and `tiptapToReferencePanel` serializes them unfiltered — so a teacher CAN
  paste a question into a panel. Its answer-key leak was fixed on the serve side
  2026-08-23 (`SANITIZER_ALGO_REV` 1→2); what remains is a product question —
  should the editor refuse the paste? — with **zero live instances**, and it is
  not this slice's.
- **Per-section panels**, **panel state persistence**, **the first-visit nudge.**

## Test plan (to be filled in after the rulings)

The guard bar is the calculator slice's, and it earned it: guards bind to
RENDERED OUTPUT and are **mutation-tested** — reverting the wiring must turn
them red. That slice found two vacuous guards that way, one of them pre-existing
and years-stale. Assume this one has one too.

Specifically not sufficient: asserting the summon exists. What must be asserted
is that clicking it puts the teacher's authored blocks on screen, that an
activity with no panel renders no button at all, and that the print box is
unaffected either way.

---

# AS-BUILT (2026-08-23)

All eight rulings landed as recommended. The sixth and last S9 orphan is closed.

## What a student gets

An activity with a non-empty `referencePanel` shows a summon in the bottom-LEFT
corner, named after the panel's title (falling back to "Reference"). Clicking it
opens a fixed, non-modal 24rem panel holding the teacher's authored blocks. ×
or Escape closes it and focus returns to the summon. An activity without one
renders nothing.

## Where the pieces live

| Piece | File |
|---|---|
| The panel | `packages/viewer/src/container/ReferencePanelTool.tsx` |
| Its wiring + the `mode === 'screen'` gate | `packages/viewer/src/container/ViewerContainer.tsx` |
| Corner modifier + panel CSS | `packages/viewer/src/styles/viewer.css` |

## Five things the build learned

1. **A render prop, not an import.** `BlockSlot` is private to `ViewerContainer`
   and exporting internal machinery to reach it would have been the wrong trade.
   `ReferencePanelTool` takes `renderBlock` instead: the container keeps its
   resolver, boundary and reset-key wiring in one place, and the panel is
   drivable in a test by a fake renderer that needs no registry at all.

2. **The interactivity question was created BY this slice, and was not in the
   design pass.** Panel blocks already render into the DOM today (CSS-hidden
   until print), so a pasted question already renders its radios — invisibly.
   Making the panel visible would have let a student answer a block that is in
   no section, and therefore never checked and never submitted: work silently
   lost. The body is a permanently `disabled` fieldset, the viewer's own idiom,
   whose rationale carries over exactly ("the browser disables every control
   inside it, including ones a block type that does not exist yet will add").
   Plus a CSS rule keeping the text at full contrast — a disabled fieldset dims
   its contents in some engines, and this is material a student must READ.

3. **Four things were already correct and needed nothing.** Numbering excludes
   the panel *structurally* ("the guarantee is that those ids are simply never
   in the map"); census walks it deliberately; and both lazy-asset preloaders
   (`documentUsesMath`, `documentUsesGraphKit`) deep-walk the whole document, so
   a panel carrying math or a graph already warms its chunk. Checked rather than
   assumed — three of them would have been silent if wrong.

4. **`--z-reference` is consumed at last.** All three z-tokens had zero `var()`
   consumers before the calculator slice; this closes the set. Guarded, along
   with the ordering that makes it right: the calculator (120) wins an overlap
   over the panel (115), because the calculator is being USED and the panel is
   being READ.

5. **A PRE-EXISTING guard was half-built, and mutation found it.** The
   print/preview mirror asserted only that everything hidden in `@media print`
   is hidden in the in-page preview. The reverse was unguarded — and it is the
   WORSE direction: hidden in the preview but not in print means a teacher signs
   off on a clean preview and the chrome lands on thirty photocopies. Dropping
   `.viewer-reference-float` from the print block left the pair asymmetric with
   every existing check green. Now bidirectional.

## The guard bar, discharged

**17 mutations, all red**, across three lanes: 9 against the panel component and
its container wiring, 8 against the stylesheet.

The bar's warning ("assume this one will be vacuous, and go looking") paid off
once, on finding #5 above. Two other first drafts failed usefully rather than
silently: `defaultPrevented: true` in an event init, which React ignores because
it derives that flag from a real `preventDefault()` call — so the shortcut would
have tested nothing; and an unscoped `getByText` that found the panel's blocks
twice, because the print box renders the same blocks into the DOM. Both are
recorded at their assertions.

## Coverage

| Lane | Added |
|---|---|
| viewer jsdom — component | 11 specs (gating, summon, focus, Escape, non-answerable) |
| viewer jsdom — container wiring | 4 specs (renders, gated off print, print box intact) |
| viewer node — stylesheet | 5 specs + the mirror's missing direction |
