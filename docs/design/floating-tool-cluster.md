# The floating tool cluster — the calculator and the reference panel come back

**Status:** 🔵 **PLAN — design pass ruled 2026-08-23 (C1–C5). Reviews pending. No code yet.**

Wires the two FLOATING TOOLS a student lost at S9 Drop 4: the calculator
(orphan #4 of the 2026-08-22 audit) and the reference panel's screen surface
(a sixth orphan the audit missed, filed 2026-08-23).

They are one slice because they are one component. Both are summonable panels
in the same bottom cluster, both were specified together in
DECISIONS.md:193-195, and the z-ladder they were designed against —
`--z-tools`, `--z-reference`, `--z-calculator` — has **zero `var()` consumers
anywhere in viewer or app**. Fixing one leaves a one-tool "cluster" and
re-strands the same tokens.

## What a teacher can do today, and what a student gets

| Teacher authors | Stored? | Student sees |
|---|---|---|
| ⚙ → Calculator → "Allow a calculator", graphing mode | yes | **nothing** |
| `calculator: graphing` in a ```meta``` fence | yes | **nothing** |
| Reference panel content, print box UNticked | yes | **nothing, ever** |
| Reference panel content, print box ticked | yes | a static box, on paper only |

The reference-panel row is the harsh one: the print gate is **not on by
default**, so the default outcome for authored reference content is that
nobody sees it.

**This is not hypothetical.** The live database has one activity —
`"test build"`, **published, 4 versions** — with `calculator.enabled = true` in
graphing mode. And `docs/markdown-import-format.md:941` documents
`calculator: off | scientific | graphing` as a working import field, which the
batch importer and the copy-paste AI prompt both write, right as ~150
activities are about to be authored.

## The three things the investigation overturned

**1. Perf does not decide this — the assumption was wrong.** Measured with a
real chunk graph (`esbuild --splitting`, not a naive single-file bundle, which
inlines dynamic imports and reports a misleading 609 KiB gz):

| chunk | gz |
|---|---:|
| **`calculator-*.js` — its own code** | **8.3 KiB** |
| kit entry `index.js` | 18.2 KiB |
| MathLive (shared) | 225 KiB |
| mathjs (shared) | 44 KiB |
| JSXGraph (shared, graphing only) | 243 KiB |

`kitSurfaces.ts` already `await import('@activity/graph-kit')`s in four places,
and `kitPreload` warms it for kit-bearing documents. **On an activity that
already has a graph block or a math gap, a calculator costs 8.3 KiB gz and
nothing else.** Worst case — calculator on a document with neither — is ~281
KiB gz on first click, post-click and cached, off the shell entirely. It
matches the design doc's own 2026-06-21 spike. **No ledger row moves, no shell
row moves, no cap needs raising** (shell JS 159.2/172, mathlive 264/290,
jsxgraph 247.8/265).

**2. The build is small.** The kit owns all its own chrome — drag with clamps,
native resize, Escape-to-close, `role="dialog"`, header, splitter, and
session-memory geometry in a module-level `remembered` object. Both surviving
callers (`DevCalculator.tsx`, the drawer's `CalculatorPreview`) already mount
it with `floating: true` and handle the cancelled-mid-load race. What died was
~60 lines: a button, a mount point, toggle wiring.

**3. The audit half-fixed this and hid the other half.** The 2026-08-22 sweep
found the calculator, then "corrected" ROADMAP's dead *"live on published
pages"* to *"live in the viewer"* without checking whether the viewer had
picked the surface up. It had not. Root cause worth carrying into the skill:
**§9 walked `packages/schema/src/blocks/` only — `ActivityDocument`'s
top-level fields (`referencePanel`, `calculator`) were never in its scope**,
which is exactly why a sweep designed to catch this class missed both floating
tools.

## Rulings

**C1. WIRE, do not delete.** A published activity already enables it; three
authoring surfaces write it; the marginal cost is 8.3 KiB. Deleting is the
*wider* change — schema `CalculatorTool`/`CalculatorRestrictions`, the drawer
section, the importer's `calculatorMode` key, the format doc rows, the AI
prompt, `DevCalculator.tsx` — and saves essentially no bytes, since the kit
ships anyway for graph blocks. The size argument supports neither side; this
is a product call and the product answer is that a digital-SAT-style
calculator is a thing a math teacher expects to be able to switch on.

**C2. Both tools, one host.** A shared cluster component owns the corner,
the z-ladder, the summon buttons and the open/close grammar. Neither tool
re-implements chrome.

**C3. Mobile is designed, not deferred.** A 30rem fixed panel on a 375px phone
was never specified anywhere. Under the viewer's existing 480px breakpoint both
tools become a **full-width bottom sheet** rather than a floating window.
Chromebooks are the stated target, so this is the secondary case — but
"undesigned" is how a panel ends up half off-screen on the one device a
student actually has.

**C4. Bind the z-index to the token.** The kit hardcodes `z-index: 120` in its
own injected stylesheet and `--z-calculator: 120` agrees **by coincidence**.
The kit must read the token (or the viewer must set the kit's variable) so the
next token change cannot silently desync the two.

**C5. Already ruled — not reopened.** Summon on CLICK, never on presence
(graded blocks import on presence; the calculator does not). Scaffold
semantics: never scored, no submission, no answer key, no `schemaVersion` bump.
Per-activity scope; per-section override stays deferred. **Print: the panel is
simply absent** (the reference panel's print box is a separate, existing
mechanism and keeps its current behaviour). Geometry is session memory, never
localStorage. Drag/resize is an ENHANCEMENT — the panel must be fully usable
parked at its default position. Functional twin, visual stranger: no Desmos
name, assets or skin.

## Cluster conventions already specified (DECISIONS.md:193-195)

Inherited, not re-decided: the summon **hides while its panel is open** (they
share the corner); × or Escape closes; focus moves panel ↔ button;
`role="dialog"` is **non-modal**; the reference panel anchors bottom-**LEFT**
so an open calculator (bottom-right) never collides; z-order is
`tools 110 < reference 115 < calculator 120 < popovers 1000`.

## Known traps

- **The kit injects a global `<style id="graph-kit-styles">` into
  `document.head`** — fine in the SPA, but it lands outside the viewer's token
  scope, which is half of why C4 exists.
- **The panel is non-modal `role="dialog"` floating over a
  `<fieldset disabled={readOnly}>`.** Focus interaction with a disabled
  worksheet needs a deliberate check, not an assumption.
- **`ViewerContainer` has no chrome layer at all** — no toolbar, no header, no
  tool corner. The cluster mounts as a new sibling after `.viewer-worksheet`.
- **No viewer fixture carries a calculator or a reference panel**, which is
  precisely why no viewer test could have caught either orphaning.

## The guard bar

Same as the choice-figures slice, and for the same reason: guards bind to
RENDERED OUTPUT and are **mutation-tested** — reverting the wiring must turn
them red. That slice produced two vacuous guards that only mutation caught
(a test with a non-empty `alt` that never exercised its branch; a
`max-width-capped` check that passed with the cap deleted). Assume this one
will too, and go looking.

Specifically not sufficient: asserting the summon button exists. The button
existing is what the old runtime had; what must be asserted is that clicking it
mounts a panel a student can use, and that an activity WITHOUT the flag renders
no button at all.

## Out of scope (filed, not fixed)

- Per-section calculator override (deferred by the original design).
- Reference-panel print behaviour — unchanged; this slice adds the screen half.
- The remaining three orphan classes: the graph feedback knobs,
  `isCheckpoint` + the flow modes, and `hasConfidenceRating`/`allowTargetReuse`.
