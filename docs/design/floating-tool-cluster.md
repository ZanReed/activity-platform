# The floating tool cluster — the calculator and the reference panel come back

**Status:** 🟢 **PLAN — REVISED 2026-08-23 after a completed eng review + outside voice. SCOPE CUT to the calculator; C6 and C12 REVERTED. Cleared to build.**

> ⚠ **READ THIS FIRST — three of this plan's own rulings were wrong, and the
> outside voice caught them.** The first eng review was run from memory and
> skipped its own procedure (Code Quality, Tests, Performance, and the outside
> voice). Re-run properly on 2026-08-23:
>
> - **C6 (one tool open at a time) is REVERTED.** Its headline measurement —
>   "two panels occlude 68%" — measures the CALCULATOR ALONE (640 − 206 = 434 ≈
>   its own 418px + margin). Closing the second panel recovers **zero** readable
>   strip. The other half of the argument used a reference-panel width **I
>   invented for the wireframe**, so the "overlap below 896px" threshold was
>   never real. The convention C6 retired stays.
> - **C12 (the `--gk-*` seam needs no kit change) is REVERTED.** The z-index is
>   a bare literal (`calculator.ts:805`) and the kit's chrome properties are
>   declared ON `.gk-cal` itself, so a viewer ancestor cannot re-point them. My
>   "54 properties" was a line count; it is **27**.
> - **C2 (both tools behind one host) is DROPPED with the scope cut.**
>   DECISIONS.md already forbids the reference panel using the kit for chrome
>   ("would cost hundreds of KiB"); the deleted sidecar reimplemented drag in
>   ~40 lines. The shared surface was a corner div and two buttons.
>
> The lesson is the arc's own: **a measurement is not a finding until the
> inference from it is checked too.**

Wires **the calculator** (orphan #4 of the 2026-08-22 audit), which a student
lost at S9 Drop 4. The reference panel's screen surface (a sixth orphan, filed
2026-08-23) is **DEFERRED to its own slice** — see NOT in scope.

~~They are one slice because they are one component.~~ Both are summonable panels
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
nothing else.** Worst case — calculator on a document with neither — was stated as ~281 KiB gz.
⚠ **That omitted JSXGraph**, which graphing mode needs, and the one motivating
activity is `calculator: graphing`. Measured against the real build: ~8.7
(calculator) + 262.8 (MathLive) + 238 (JSXGraph) + ~7 (board) + ~6 (kit entry)
≈ **515+ KiB gz** on first click, post-click and cached, off the shell
entirely. That also falsifies C7's "this pending state only appears on a bad
connection" — on school wifi it is the normal state. It
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

**C2 — DROPPED with the scope cut.** ~~Both tools, one host.~~ The premise was
false: DECISIONS.md already rules that the reference panel must NOT use the kit
for chrome ("Pulling the graph-kit for window chrome would cost hundreds of
KiB"), and the deleted sidecar reimplemented drag in ~40 lines. `mountCalculator`
builds its chrome as framework-agnostic DOM inside itself; it is not exported
and cannot wrap React block components. The genuinely shared surface was a
corner div, two buttons and a z-index.

**C3. Mobile is designed, not deferred** *(superseded in detail by C8 below —
the measurement turned this one-liner into a specification)*. A 30rem fixed panel on a 375px phone
was never specified anywhere. Under the viewer's existing 480px breakpoint both
tools become a **full-width bottom sheet** rather than a floating window.
Chromebooks are the stated target, so this is the secondary case — but
"undesigned" is how a panel ends up half off-screen on the one device a
student actually has.

**C4. Bind the z-index to the token** — the intent stands; the mechanism was
wrong and is corrected in C12 below. The kit hardcodes `z-index: 120` and
`--z-calculator: 120` agrees **by coincidence**.

**C5. Already ruled — not reopened.** Summon on CLICK, never on presence
(graded blocks import on presence; the calculator does not). Scaffold
semantics: never scored, no submission, no answer key, no `schemaVersion` bump.
Per-activity scope; per-section override stays deferred. **Print: the panel is
simply absent** (the reference panel's print box is a separate, existing
mechanism and keeps its current behaviour). Geometry is session memory, never
localStorage. Drag/resize is an ENHANCEMENT — the panel must be fully usable
parked at its default position. Functional twin, visual stranger: no Desmos
name, assets or skin.

## Revised rulings after the completed eng review (2026-08-23)

**C6 — REVERTED.** See the banner. One-tool-at-a-time is dropped; the
`summon hides while open` convention in DECISIONS.md:195 **stands unchanged**
and is load-bearing: both summon buttons share the bottom-right `.tool-corner`,
and the kit hardcodes `right:1rem; bottom:1rem`, so an open calculator covers
its own button regardless. The real occlusion lever is the calculator's 26rem
default height on a 640px viewport — **unmeasured, and the honest next
question** (filed, not guessed at here).

**C7 — KEPT, with its premise corrected.** The pending state stays. But
"appears only on a bad connection" is false at ~515 KiB first-click for
graphing mode, so it is a **normal-path state**, not an edge case, and it gets
a real test rather than a lane that can never see it.

**C7b / D10 — the FAILED load is a designed state too.** `mountCalculator` is
awaited with **no `.catch()`** in either existing caller
(`ActivityConfigDrawer.tsx:1055`, `DevCalculator.tsx`), the service worker
precaches exactly one file (`globPatterns: ['index.html']`, 979 B), and
**offline reopen is a shipped, proven capability**. So an offline tap rejects
unhandled and the pending spinner runs forever. Ruled: catch, clear pending,
restore the button, show "Calculator unavailable offline", stay retryable.

**C8 — KEPT, and probably cheaper than assumed.** The 375px overflow is real
(482px panel, 123px off-screen; `min-width:24rem` beats `max-width:95vw`). Note
for the builder: the kit already contains
`@container gkcal (max-width: 23rem)` (`calculator.ts:944`) which **can never
fire** while `min-width:24rem` stands — the compaction machinery may already
exist, and the sheet could be close to a single `min-width` override.

**C12 — REVERTED and replaced (D18).** The kit gains
`z-index: var(--gk-z-panel, 120)`, matching the `var(x, fallback)` shape it
already uses for board colours that `editor.css:161` sets today. **This is a
graph-kit change**, and it is the same edit that unlocks C14.

**C14 — DARK MODE IS IN SCOPE, not a follow-up** (D17). The viewer ships a full
dark theme and the app follows the OS by default, while the kit's chrome is
hard-coded light literals declared on `.gk-cal`. A dark-mode student summons a
white panel over a dark worksheet. Same kit edit as C12, so it is done once.

**C15. `close()`, never `destroy()`, when putting the tool away** (D13).
The handle exposes both; `destroy()` (`calculator.ts:733`) saves only geometry
and tears down the MathLive fields. Closing keeps the student's in-progress
expression, which is the whole point of the tool. Destroy only on activity
unmount.

**C16. Mount in the student surface, not in `ViewerContainer`.** My claim that
"`ViewerContainer` has no chrome layer at all" was misleading:
`StudentViewer.tsx:557` renders `<header className="viewer-topbar">`
(`viewer.css:952`) and already hosts a Print button. Mounting as a sibling of
`.viewer-worksheet` in `ViewerContainer` would also put a floating calculator
into `ActivityPrint` (a SCREEN render of the teacher's print preview) and
`DevViewer`. **Mount in `StudentViewer`, or gate on `mode === 'screen'`.**

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

## Test coverage (eng review §3)

Framework: vitest (`packages/viewer/vitest.config.ts`) units, Playwright
(`packages/app/playwright.config.ts`) lanes; `pnpm verify` is the gate.
**Split ruled at D12:** jsdom owns the cluster's logic and failure paths; the
browser lanes own geometry and the real mount; graph-kit's internals stay
graph-kit's.

```
CODE PATHS                                        USER FLOWS
[+] ToolCluster (new)                             [+] Summon
 ├── no calculator  → renders NOTHING     [GAP]    ├── [GAP] click, panel appears
 └── calculator on  → one button          [GAP]    ├── [GAP] close via x / Escape
                                                   └── [GAP] focus returns to button
[+] Mount lifecycle                                │        (toBeFocused, NOT a
 ├── import OK → mount → handle           [GAP]    │         one-shot activeElement
 ├── import FAILS → catch + restore       [GAP]★   │         probe — recorded flake)
 ├── cancelled mid-load → destroy         [GAP]
 ├── close (C15) keeps expression         [GAP]   [+] Failure + edge
 └── unmount → destroy                    [GAP]    ├── [GAP]★ offline: chunk fails,
                                                   │        button restored + message
[+] Chrome (kit change)                            ├── [GAP] slow: aria-busy pending
 ├── z-index var w/ fallback (C12)        [GAP]    │        (NORMAL path at ~515 KiB)
 └── dark-mode chrome (C14)               [GAP]    └── [GAP] [→E2E] <480px sheet

[+] Surface gating (C16)                          [+] Regression surface (MUST NOT BREAK)
 └── absent in ActivityPrint / DevViewer  [GAP]    ├── [★★] editor drawer preview
                                                   ├── [★★] print box on/off —
[+] Schema/config (pre-existing)                   │    print-document-layer.test.tsx:172
 ├── [★★] parse + defaults — schema/tests/calculator.test.ts
 ├── [★ ] fingerprint — activityChangeKey.test.ts:32
 └── [★★] importer writes it — applyImportedMeta.test.ts:35

COVERAGE: 5/17 (29%)  |  New paths: 0/12 (0%)  |  Flows: 3/8 (38%)
QUALITY: ★★:4 ★:1  |  GAPS: 12 (1 →E2E, 2 critical ★)
```

**No regressions** (all new code), but the four ★★ rows are the surface it must
not break — especially the editor drawer preview, which mounts the same widget
and will see the C12/C14 kit change.

## Failure modes (eng review, required output)

| Codepath | Realistic production failure | Test? | Error handling? | Silent? |
|---|---|---|---|---|
| Chunk import | Offline / chunk 404 after deploy | **NO → T4** | **NO today** (C7b fixes) | **YES → critical gap** |
| Mount | Kit throws mid-mount | NO → T4 | same catch | would be silent |
| Cancelled load | Student navigates away mid-load | NO → T2 | `cancelled` flag exists in the drawer; copy it | leak, not visible |
| Close vs destroy | Expression lost on tool switch | NO → T5 | C15 | **silent data loss** |
| Dark mode | White panel on dark worksheet | NO → T7 | none | visible, looks broken |
| Print surface | Calculator appears in print preview | NO → T3 | none (C16 fixes) | visible to teacher |

Two entries are **critical gaps** by the skill's definition (no test AND no
error handling AND silent): the chunk import failure, and close-vs-destroy.
Both are now ruled (C7b, C15) and tasked.

## Implementation Tasks (revised — calculator only)

- [ ] **T1 (P1)** — viewer — `<ToolCluster>`: the corner, the summon button,
  open/close state. **Mounted in `StudentViewer`, or gated `mode === 'screen'`
  (C16).** Renders nothing when no calculator is configured.
- [ ] **T2 (P1)** — viewer — Mount/unmount lifecycle: dynamic import,
  `floating: true`, cancelled-mid-load guard (copy `CalculatorPreview`),
  destroy on unmount.
- [ ] **T3 (P1)** — viewer — Summon states: pending (`aria-busy`,
  inert-not-disabled) and **failed** (catch → restore → "unavailable offline",
  retryable) per C7/C7b.
- [ ] **T4 (P1)** — **graph-kit** — `z-index: var(--gk-z-panel, 120)` (C12) and
  overridable chrome colours for dark mode (C14). **One kit edit serves both.**
  Check the editor drawer preview still renders correctly.
- [ ] **T5 (P1)** — viewer — `close()` not `destroy()` on put-away (C15);
  destroy only on activity unmount.
- [ ] **T6 (P1)** — viewer/styles — The <480px sheet (C8). **Check the existing
  `@container gkcal (max-width:23rem)` first** — it is dead code today and may
  do most of the work behind a `min-width` override.
- [ ] **T7 (P1)** — tests (jsdom) — Cluster logic + both failure paths, with a
  stubbed rejecting import. **Mutation-tested.** Not sufficient: asserting a
  wrapper exists.
- [ ] **T8 (P2)** — tests (e2e) — Sheet geometry <480px, real mount, focus
  return via `toBeFocused`.
- [ ] **T9 (P2)** — docs — Fix `document.ts:150` ("on-SCREEN reference toolbar"
  as live) and `printExpectations.ts:843` ("the screen tool never prints").
  ⚠ **Do NOT rewrite DECISIONS.md:193-195** — the earlier plan would have, on a
  misreading. The convention stands.
- [ ] **T10 (P3)** — measure the calculator's default 26rem height against a
  640px viewport and rule on a smaller default. This is the actual occlusion
  lever C6 mistook for a panel-count problem.

## NOT in scope (considered and explicitly deferred)

- **The reference panel's screen surface** — deferred to its own slice (D15).
  Its shared-host justification was false, and its content-shape questions
  (Columns inside a 24rem window, full-size images, a periodic table) are
  unanswered. The orphan stays open and filed.
- **The reference-panel sanitizer gap** — `referencePanel.blocks` accepts the
  full block union and the per-block strips never run there, so a pasted
  multiple-choice already ships its key today. **Live now, independent of this
  slice**, and filed as its own fix (D16) because it moves `SANITIZER_REV` and
  owes a redeploy — a cost that should be paid on its merits, not dodged.
- **The first-visit nudge** — dropped with the reference half; it was the most
  speculative item and the only reason the plan needed a persisted-state
  exception.
- **Per-section calculator override** — deferred by the original design.
- **Reference-panel print behaviour** — unchanged.
- **The remaining orphan classes** — graph feedback knobs, `isCheckpoint` + the
  flow modes, `hasConfidenceRating` / `allowTargetReuse`.

## Worktree parallelization

Two independent lanes, then a join:

| Step | Modules touched | Depends on |
|---|---|---|
| T4 (kit chrome: z-index + dark) | `packages/graph-kit/` | — |
| T1–T3, T5 (cluster + lifecycle) | `packages/viewer/`, `packages/app/src/routes/` | — |
| T6 (sheet CSS) | `packages/viewer/src/styles/` | T4 |
| T7–T8 (tests) | `packages/viewer/tests/`, `packages/app/e2e/` | T1–T6 |

`Lane A: T4 (graph-kit, independent)` · `Lane B: T1 → T2 → T3 → T5 (shared viewer modules, sequential)`
Launch A and B in parallel worktrees; merge both; then T6, then T7–T8.
**Conflict flag:** none — A touches only `graph-kit/`, B only `viewer/` + `app/routes/`.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | **not run** | the outside voice flagged this: "wire vs delete" was never adversarially tested |
| Outside Voice | Claude subagent (Codex not installed) | Independent challenge | 1 | **issues_found (2026-08-23)** | 6 verified-false or overstated claims; 2 rulings reverted; scope cut |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 2 | **clean (2026-08-23, re-run)** | §1–4 + outside voice; 12 findings, 8 rulings, coverage diagram, test plan artifact |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | **issues_found — its headline ruling was REVERTED** | 4/10 → 9/10, but C6's inference did not follow from its measurement |
| DX Review | `/plan-devex-review` | Developer experience gaps | 1 | clean (2026-08-20, prior plan) | stale for this plan |

**CODEX:** not installed; an independent Claude subagent ran the outside voice.

**CROSS-MODEL:** the outside voice overturned more than the review did. Verified
against code: the z-index is a bare literal (C12 wrong); the kit's chrome
properties are declared on `.gk-cal` so a viewer ancestor cannot re-point them;
`StudentViewer` DOES have a chrome layer; DECISIONS.md:193 already ruled the
reference panel's screen form a floating window a month before a design review
"reversed" it; the perf worst case omitted JSXGraph (~515 KiB, not 281); and
shell CSS has 1.2 KiB of headroom. Most importantly it checked the arithmetic
behind C6 and found the 68% occlusion was the calculator alone.

**VERDICT:** ENG CLEARED (re-run) — ready to implement, calculator only.

⚠ **The first eng-review pass reported "clean" while having skipped Code
Quality, Tests, Performance, the outside voice, the prior-learnings search and
the TODOS pass.** It was Architecture-complete, not review-complete. This report
replaces it. The lesson is the one the whole arc keeps producing: **a green
result from a check that did not run is worse than no check.**

NO UNRESOLVED DECISIONS
