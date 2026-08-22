# The floating tool cluster — the calculator and the reference panel come back

**Status:** 🟢 **PLAN — ruled C1–C13, design-reviewed AND eng-reviewed 2026-08-23. CLEARED to build; no code yet.**

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
| Reference panel content | yes | **on paper only** — never on screen |

⚠ **CORRECTED BY ENG REVIEW (2026-08-23).** This table originally claimed the
print gate was off by default and therefore "nobody sees it". **Wrong:
`printReferencePanel` defaults to `true`** (`document.ts:177`), so reference
content DOES reach paper by default. The orphan is real — there is no screen
surface at all — but it is "screen-invisible", not "invisible". That is the
second time this session I asserted something about the reference panel without
checking it; the first was the ROADMAP half-fix. Both were caught by a review
rather than by me, which is the argument for running them.
*(`document.ts:150` also still describes an "on-SCREEN reference toolbar" as
live — another dead-mechanism comment, fix it with the wiring.)*

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

**C3. Mobile is designed, not deferred** *(superseded in detail by C8 below —
the measurement turned this one-liner into a specification)*. A 30rem fixed panel on a 375px phone
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

## Design-review rulings (2026-08-23, D3–D6) — measured, not argued

A wireframe of the cluster at true sizes, using the calculator's own declared
geometry (30rem × 26rem graphing, `min-width: 24rem`) and the viewer's real
tokens. Artifact:
`~/.gstack/projects/ZanReed-activity-platform/designs/tool-cluster-20260823/wireframe.html`

**C6. ONE TOOL OPEN AT A TIME** (D3 — the finding that changed the design).
Measured on a Chromebook-height viewport: both panels open occlude **68% of it**,
leaving a **206px readable strip** of worksheet. And the two panels **overlap
each other below 896px viewport width** — reference 384 + calculator 480 +
32px margins = 896 exactly. **The inherited "reference bottom-left, calculator
bottom-right, so they never collide" rule was written for a bigger screen than
students have.** So the cluster permits a single open panel: opening one closes
the other.

⚠ **This RETIRES the inherited "summon hides while open" convention**
(DECISIONS.md:193-195), and that is the point rather than a side effect: the
rule existed only because both tools shared ONE corner. With one panel possible
at a time, **both summon buttons stay visible always** and the open tool's
button is its own toggle — which is also the more discoverable arrangement.
Accepted cost: a student comparing a formula against a calculation must flip.

**C7. The first click and the first visit are designed states** (D4).
The engine chunk downloads on first click, so the summon shows a **pending
state** — `aria-busy`, a spinner, label unchanged, still clickable-but-inert —
because on school wifi the alternative is a student tapping a button that
appears dead. **This state only ever appears on a bad connection, so it will
never surface in testing; it needs its own test.** Separately, on a student's
first visit to an activity that HAS reference content, the reference summon
carries a brief **one-time highlight**: the panel holds the teacher's own
material, and a student who never notices the button never learns it exists —
which is the same outcome as the bug being fixed, with a button on screen.
(Needs per-activity state; the session-only geometry rule does not cover it, so
this is a deliberate exception, not an oversight.)

**C8. The mobile sheet, specified** (D5, replacing C3's one-liner).
Measured at 375px: the panel renders **482px wide and hangs 123px off the left
edge**, because its own `min-width: 24rem` (384px) exceeds the viewport and in
CSS `min-width` beats `max-width`. It does not shrink; it overflows. Below the
existing 480px breakpoint the panel therefore pins **left/right/bottom**, takes
~64% of viewport height, gets a rounded top with a grab handle, and **stacks the
graphing body vertically** (plot above, keypad below) instead of side by side —
a 14rem expression column beside a plotting grid leaves each ~160px otherwise.
Dismiss: close button, Escape, or swipe-down on the handle. **This requires
overriding the kit's own `min-width` and its two-column body from outside the
kit**, which is the real work in this ruling.

**C9. The reference panel matches the calculator's shape** (D6). Same chrome,
same close grammar, anchored bottom-left, with height growing to fit content up
to a cap — one formula gets a small panel, a periodic table gets a tall
scrollable one. This **reverses the original bottom-bar decision**, and the
reason it can: that shape was chosen when the bar owned the bottom edge alone,
and C6 has just made a full-width bar unnecessary. Accepted cost: genuinely wide
content (a periodic table) is happier in a bar than a panel.

## Eng-review rulings (2026-08-23, D8–D9 + ARCH findings)

**C10. The screen surface renders STATIC block families only** (D8 — a dormant
gap C9 would have made live). `ReferencePanel.blocks` is `z.array(Block)`, the
**full block union**, and `sanitizeActivityDocument` runs `sanitizeBlockMut`
**only** over `sections → rows → columns → blocks`. Reference-panel blocks get
only the in-band deep walk, on the strength of a comment asserting those
surfaces "carry no declared answer keys" — **an assumption, not an
enforcement**. Harmless while nothing rendered them; C9 renders them. So the
screen surface renders paragraph / heading / list / image / table / math /
callout and **skips gradable blocks**, warning at dev time rather than silently
dropping. Rejected the alternative (extend the sanitizer) because it moves
`SANITIZER_REV`, orphans the read cache and owes a redeploy — and still leaves
a graded question sitting in a reference panel, which is a strange thing for a
student to meet.

⚠ **This is what keeps the "no bundle, no redeploy" claim true.** Fixing the gap
the other way would have falsified it.

**C11. The nudge is SESSION-scoped, never persisted** (D9). Once per page load
for an activity carrying reference content. The viewer already persists
responses to localStorage, so the machinery exists — but a behavioural flag is
a different KIND of thing from a student's answers, the compliance data map
documents everything stored about a student, and that map is read by counsel
rather than by tests. Session scope gets nearly all the discovery benefit and
adds nothing to the pack. Accepted cost: a student who reloads sees it again.

**C12. The kit seam already exists — use it, do not invent one.** The
calculator reads **54 `var(--gk-*)` custom properties** and `editor.css:161`
already sets them from outside. So **C4 (z-index) needs NO graph-kit change**:
the viewer sets `--gk-*` exactly as the editor does. **C8's two-column restack
DOES need a kit change**, because layout structure is not expressible as a
variable — it lands as a documented `sheet`/`compact` mode on the kit, NOT as
the viewer fighting the kit's injected stylesheet with specificity. Specificity
wars against a stylesheet the kit injects into `document.head` are the failure
mode to avoid; it is not the viewer's stylesheet to win against.

**C13. `remembered` is module-level and shared.** The kit's geometry memory
(`calculator.ts:196-203`) is a module singleton: every mount shares it and
nothing resets it. Two panels would share one memory, and it **leaks between
tests**. The cluster must not assume per-panel geometry, and viewer tests that
mount the calculator need an explicit reset or they will pass or fail based on
what ran before them.

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

## Implementation Tasks

- [ ] **T1 (P1)** — viewer — `<ToolCluster>` host: the corner, both summon
  buttons, single-open state machine (C6), z-ladder bound to the tokens (C4) —
  **by setting `--gk-*`, which needs no kit change (C12)**.
  Mounts as a sibling after `.viewer-worksheet`; `ViewerContainer` has no chrome
  layer today, so this creates one.
- [ ] **T2 (P1)** — viewer — Calculator summon + mount. Dynamic import,
  `floating: true`, destroy on unmount, cancelled-mid-load race handled (copy
  `CalculatorPreview`, which already does).
- [ ] **T3 (P1)** — viewer — Reference panel screen surface (C9), sharing the
  panel chrome; content-sized height with a cap. **Static families only (C10)**,
  gradable blocks skipped with a dev-time warning.
- [ ] **T4 (P1)** — viewer — Pending state on the summon (C7): `aria-busy`,
  spinner, inert-but-not-disabled. **Only appears on a slow connection, so it
  gets its own test rather than relying on a lane to surface it.**
- [ ] **T5 (P1)** — viewer/styles **+ graph-kit** — The mobile sheet (C8): pin
  three edges, grab handle, ~64% height. Geometry via `--gk-*` (C12); the
  two-column restack lands as a documented `sheet` mode ON THE KIT, not as a
  specificity war against the stylesheet it injects into `document.head`.
  **The one graph-kit change in the slice.**
- [ ] **T6 (P2)** — viewer — First-visit nudge on the reference summon (C7),
  **session-scoped, nothing persisted (C11)**.
- [ ] **T7 (P1)** — tests — Output-bound, mutation-tested guards. Not
  sufficient: "the button exists". Must assert that clicking mounts a usable
  panel, that an activity WITHOUT the flag renders no button, that opening one
  closes the other, and the 480px sheet geometry.
- [ ] **T8 (P2)** — a11y — Two non-modal dialogs: focus moves panel ↔ button,
  Escape closes, tab order sane, and the panel over a `<fieldset disabled>`
  worksheet behaves.
- [ ] **T9 (P2)** — docs — **DECISIONS.md:193-195 retires its "summon hides
  while open" convention** (C6). Policy P5: retiring a rule means auditing every
  comment that cites it. Also update ROADMAP 2.7's done-when and the reference
  panel entry, both currently corrected-but-stale.
- [ ] **T10 (P2)** — viewer — Reset the kit's module-level `remembered` between
  viewer tests (C13), or they pass/fail on what ran before them.
- [ ] **T11 (P3)** — viewer — Dark mode: the kit injects a global stylesheet
  outside the viewer's token scope, so panel chrome will not follow the theme.

## Out of scope (filed, not fixed)

- Per-section calculator override (deferred by the original design).
- Reference-panel print behaviour — unchanged; this slice adds the screen half.
- The remaining three orphan classes: the graph feedback knobs,
  `isCheckpoint` + the flow modes, and `hasConfidenceRating`/`allowTargetReuse`.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | wire-vs-delete settled by evidence |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | not run |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | **clean (2026-08-23)** | 5 architecture findings, 4 rulings (C10–C13); **1 plan premise corrected** |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | clean (2026-08-23) | 4/10 → 9/10, 4 decisions, 1 inherited convention retired |
| DX Review | `/plan-devex-review` | Developer experience gaps | 1 | clean (2026-08-20, prior plan) | stale for this plan |

**VERDICT:** ENG + DESIGN CLEARED — ready to implement.

Both reviews earned their place by falsifying something. The design review
measured that two open panels occlude **68%** of a Chromebook viewport and
overlap below 896px, which retired an inherited convention. The eng review
found that **`printReferencePanel` defaults to `true`**, so the plan's claim
that reference content reaches nobody was wrong (it reaches paper, never
screen); that **`ReferencePanel.blocks` accepts the full block union while the
sanitizer's per-block strips skip that surface**, a dormant gap C9 would have
made live; and that the **`--gk-*` seam already exists**, so C4 needs no
graph-kit change at all.

NO UNRESOLVED DECISIONS
