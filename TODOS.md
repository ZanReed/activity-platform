# TODOS

Deferred work items with enough context to pick up cold. Durable backlog lives in
ROADMAP.md; this file is for concrete, near-term follow-ups surfaced during reviews.

## ✅ Native TABLE block — BUILT 2026-08-21 (all four slices)

Schema, viewer, server, editor and import all shipped; see
[docs/design/table-block.md](docs/design/table-block.md) and read each slice's
**AS BUILT** note, not the plan above it — five rulings changed shape at build
time and T4 changed outright (it could not call `publish_activity`, which
authorizes on `auth.uid()`; it reports instead, via `pnpm report:stale`).

**What is left is author-side and routine**, recorded in STATE.md: re-run
`import:batch` to upgrade the catalogue's tables in place, then `report:stale`
to find the published ones worth refreshing.

**Deliberately NOT built, and still not planned:** merged cells (colspan/rowspan
are pinned to 1 and stripped on paste), nested blocks in cells, a `caption`
field, and column-scoped `~` grouping. The reasoning is in the design doc's
§10 — check there before adding any of them.

## ✅ The editor e2e lane is IN CI (2026-08-22)

`editor-gates` runs `--project=chromium` on every push and PR, reusing the
`check` job's `app-dist` so the preview server in playwright's webServer array
does not rebuild the app for a lane that never touches it.

Two flake classes were fixed first, and they were different:

- **`blank-signifier.e2e.ts` sampled asynchronous state.** `expect(await
  blankCount(page))` and a `document.activeElement` probe read once, against a
  key chord that has to reach the browser, be handled by ProseMirror, re-render,
  and then have a React effect move focus. Replaced with auto-retrying
  assertions (`expect.poll`, `toBeFocused`) — the fix is waiting for the state
  rather than sampling it.
- **Two `print-rules` specs timed out at the 5s default** waiting on a
  `/dev/viewer` route the vite DEV server had not compiled yet. Not a spec bug:
  the editor lane is the only one served by `pnpm dev`, and it is the biggest
  suite here. The chromium project now sets `expect: { timeout: 15_000 }`, with
  the reasoning in playwright.config.ts.

Verified by three consecutive clean full-lane runs: 224 passed each. (A fourth,
earlier run showed six failures and was a harness artifact — consecutive runs
collided on `--strictPort` before the previous server had released it. Worth
knowing if you ever loop the lane: free 5174/5175 between runs.)

## Does MathLive's post-mount focus grab affect a real student? (2026-08-22)

**What was observed:** on a worksheet carrying a gap-bearing `math_block`,
MathLive takes focus once while its element upgrades — nothing in this repo asks
it to (`mountMathPrompts` sets value/readOnly/prompts and never calls `focus()`).
Confirmed by the a11y lane's own instrumentation in CI run 32500013923: a Tab
walk reached the Check control and, by the time Enter landed, focus had moved to
`math-field`.

**Why it is probably NOT a user-facing bug:** the grab happens during the mount
settle, milliseconds after the block appears. A student's first Tab comes later.
The test only collided with it because it starts a ~76-stop walk the instant the
page is usable.

**Why it is still worth a look:** "probably" is doing work in that paragraph, and
focus theft is a serious a11y defect when it is real. A keyboard user who lands
on a slow connection, or who tabs immediately, could plausibly be inside the
window. The cheap check is to watch `document.activeElement` across a real
worksheet load on a throttled profile and see whether it ever moves without
input.

**⚠ The a11y row that used to sit over this no longer would.** `gap 2 — the full
keyboard path` now presses Enter on the Check LOCATOR (which focuses first), so
it proves reachability and activation but not focus stability. That was the right
call for the row — focus stability across a 76-stop walk is not an a11y property
— but it means nothing in the suite would notice this regressing.

**Depends on:** nothing.

## Converge the two SVG engines — `GraphFigure.tsx` -> `renderGraphSvg` (2026-08-22)

Filed by the choice-figures ENG review (E2/CQ-2), which deliberately did NOT do
it in that slice.

**The repo has two kit-free SVG engines for one job**, and they have already
diverged: `renderGraphSvg` (`graph-kit/src/static-svg/graph-svg.ts`, 400 viewBox,
fixed grayscale-safe palette, arrow markers, draws curves at 96 samples,
**5.07 KiB gz**) and `GraphFigure.tsx` (`packages/viewer/src/blocks/`, 320
viewBox + 8 pad, `currentColor` with opacity, **returns `null` for `curve` AND
`expression`**, 883 B gz).

**The size gap is not efficiency, it is missing capability** — which is why the
eng review refused to reuse the small one for choice figures. Anything rendered
through `GraphFigure` today silently loses curve drawables. **Nobody has checked
whether a real `graph_figure` block has ever authored a curve**; that check is
the first task here, and if the answer is yes, this stops being cleanup and
becomes a live content-loss bug of exactly the class the orphan sweep found.

**Convergence is +4.3 KiB gz net in the EAGER shell** (`graph_figure` is
`loading:'eager'`), so it is gated on the shell-slim ladder resuming, or on
`graph_figure` moving to a lazy binding. Do not treat it as free cleanup.

**Depends on:** the choice-figures slice landing (it introduces the dynamic-import
pattern convergence would reuse).

## printShuffle's non-identity assertion is a coin flip (2026-08-22)

`printShuffle.test.ts` → "a version rearranges MC choices; version 1 already
differs from authored" asserts that a SEEDED shuffle is never the identity
permutation. That is not a property of the code; it is luck, and the odds are a
function of how many choices the fixtures happen to have.

**It fired for real.** Adding the figure-bearing multiple_choice fixture
changed the deterministic `fid()` sequence, hence every downstream block id,
hence every seed — and with a 3-choice and a 2-choice block the chance that
BOTH shuffle to identity is 1 in 12. It came up. Giving the new fixture four
choices (which ruling A6 wanted anyway) moved it to roughly 1 in 144 and the
row is green, but **nothing was fixed** — the next fixture that shifts the id
sequence rolls the dice again, and the failure reads as "shuffling is broken"
rather than "we were unlucky".

**The fix is to assert the property that is actually true**: over the seed
space, a shuffle is not the identity *for most seeds* — or pick the assertion
seed deliberately rather than inheriting whatever the fixture ids produce. Do
NOT "fix" it by adding choices to fixtures; that is what is holding it up now
and it is the same coin, weighted.

**Depends on:** nothing.

## The matching interaction the registry already claims — drag / select-then-place (2026-08-22)

Filed by the choice-figures design review (D5/A3) as the honest fix it decided
NOT to ship in that slice.

**Two divergences, one arc.** (1) `registry.ts:280` declares matching's a11y
story as *"Pointer drag with a keyboard select-then-place grammar underneath:
target cards are focusable, Space/Enter lifts, arrows choose a dock, Space/Enter
places, Escape cancels. Every move narrates to a visually-hidden aria-live
region."* `Matching.tsx` implements a plain `<select>` and says so in its own
header. **The registry describes an interaction that does not exist** — the same
declaration-without-implementation class as the orphan fields, one level up.
(2) Once per-choice figures ship, the `<select>` becomes actively bad for the
question type matching exists for: a graph target means read the bank, memorise
"graph B", scroll to the item, open a dropdown, pick "B".

**Worth knowing before starting:** the paper experience is already fine (write
the letter on the line), so this is a SCREEN-only fix — do not let it grow into
a print change. Targets are shuffled client-side with a block-id seed
(`Matching.tsx:56`) and letters derive from rendered position, so any new
interaction must keep both properties or the letters stop matching the bank.

**Depends on:** the choice-figures slice landing first (it makes the case
concrete and adds the fixtures a drag interaction would need to test against).

## The reference-panel SANITIZER GAP is live today (2026-08-23) — P1

**Not dormant. Not theoretical. Open right now.**

`ReferencePanelEditor.tsx:96-110` deliberately registers `MultipleChoice`,
`Matching`, `Ordering` and `InteractiveGraph` so pasted content parses. And
`sanitize.ts:355-370` runs the per-block strips ONLY over
`sections → rows → columns → blocks` — `referencePanel.blocks` gets the in-band
deep walk and nothing else. So **a multiple-choice question pasted into a
reference panel ships `choices[].correct` to every student's devtools today.**

⚠ **The eng review first ruled this away** by deciding the new screen surface
would render static families only. That is a blindfold, not a fix: the payload
is identical either way. It was ruled that way partly to protect an unrelated
slice's "no redeploy needed" claim, which is the tail wagging the dog. Caught
by the outside voice.

⚠ **`ReferencePanelEditor.tsx:86` justifies the registration with "a pasted one
renders inert… the runtime never scores it" — citing the DELETED runtime.**
Policy P5, and it is the exact assumption the blindfold leaned on.

**The fix:** run `sanitizeBlockMut` over `referencePanel.blocks`. It moves
`SANITIZER_REV`, orphans the read cache and owes a `get-activity` redeploy —
pay that on its merits.

**Depends on:** nothing. Independent of the calculator slice.

## Measure the calculator's default size against a real viewport (2026-08-23)

The successor to a ruling that was wrong. The design review measured "two open
panels occlude 68% of a Chromebook viewport" and concluded only one tool may be
open at a time. **The 68% is the calculator ALONE** (640 − 206 = 434 ≈ its own
418px + margin) — closing a second panel recovers nothing. The lever is SIZE,
not count.

The kit declares 30rem × 26rem for graphing (min 24rem × 20rem). On a 640px
viewport that is roughly two thirds of the screen. Worth knowing: the kit
already carries `@container gkcal (max-width: 23rem)` (`calculator.ts:944`)
which **can never fire** while `min-width: 24rem` stands — compaction machinery
that exists and is unreachable.

**Depends on:** nothing any more — ✅ **UNBLOCKED 2026-08-23**, the calculator
slice landed, so there is a real student surface to measure against. (Guessing
before it existed is what produced the wrong ruling.) Note the sheet work
already handled the <480px case; what is left is the DESKTOP default height on
a short laptop viewport.

## A SIXTH ORPHAN THE AUDIT MISSED — the reference panel has no SCREEN surface (2026-08-23)

Found while investigating the calculator, which is its twin.

`ViewerContainer.tsx:275` renders `doc.referencePanel` **only** when
`print.printReferencePanel` is set, into a static `.viewer-reference-print`
box. There is no screen surface at all. The collapsible drag-resizable
bottom-bar toolbar ROADMAP describes was the published-page runtime's and died
at S9 Drop 4 with everything else.

**Consequence for a teacher today:** author a formula chart in the reference
panel, leave the print checkbox unticked (it is not on by default), and the
content is authored, stored, sanitized, censused — and seen by nobody, ever.

⚠ **The 2026-08-22 audit's §9 sweep MISSED this**, and then made it worse: it
"corrected" ROADMAP's dead "live on published pages" to "live in the viewer"
without checking whether the viewer had picked the surface up. It had not.
That is a half-fix, and the drift-audit skill's own §9 note says a half-fix
comes back — this one came back in a day. **The sweep only walked
`packages/schema/src/blocks/`; `ActivityDocument`'s top-level fields
(`referencePanel`, `calculator`) were never in its scope.** Widen it.

**It shares the cluster with the calculator, but NOT a host component** (see
the deferral note below). ⚠ **The z-ladder claim in this entry is now out of
date, by this entry's own twin:** the calculator slice consumes `--z-tools`
(`.tool-corner`) and `--z-calculator` (`.tool-mount`, which hands it to the kit
through `--gk-z-panel`). **`--z-reference` is the one still with zero `var()`
consumers** — this slice inherits the corner and the ladder, not a rebuild.
DECISIONS.md:193-195 still specifies the cluster: summon hides while open,
Esc/× closes, focus returns to the button, `role="dialog"` non-modal,
reference anchors bottom-LEFT so an open calculator (bottom-right) never
collides.

**Depends on:** nothing. ⚠ **DEFERRED from the calculator slice on 2026-08-23**
(eng review D15): the "they share a host component" argument was FALSE.
DECISIONS.md forbids the reference panel using the graph-kit for chrome
("would cost hundreds of KiB") and the deleted sidecar reimplemented drag in
~40 lines. The genuinely shared surface is a corner div and two buttons.

⚠ **Do not re-litigate the screen FORM without reading DECISIONS.md:193** — it
already rules "Screen = summonable floating window (calculator pattern)",
author-requested 2026-07-08, superseding the bottom bar. A design review
"reversed" that in the same direction a month later, having misread it.

**Unsolved before building:** content shapes. The panel editor allows Columns
(a 2-column chart inside a ~24rem window) and full-size images, and a periodic
table is genuinely happier wide. The outside voice argues a plain `<details>`
disclosure in the worksheet flow may beat a floating window on a Chromebook —
worth pricing before assuming the window.

## S9 left FIVE MORE ORPHAN CLASSES — **THREE FIXED, TWO OPEN** (drift audit §9)

The 2026-08-22 full audit swept **every** field in `packages/schema/src` (~180)
against the viewer's rendering set and the grading server. Everything below has
an editor control, an importer key, or a present-tense schema comment — and NO
student-facing consumer. **One cause for all five: the implementation lived in
`packages/renderer` / the published-page runtime and died at S9 Drop 4
(2026-08-14), while the declarations, the editor knobs and the design docs'
"✅ live" statuses survived.** The S9 claims-grep (P5) walked the renderer's
guards; it never walked the schema's comments or the editor's controls.

**Each needs a ruling — wire it (with a guard bound to rendered output) or
delete it end to end (schema + editor control + importer key + doc).** Ranked by
what reaches paper/screen as CONTENT LOSS first:

1. ~~**Choice and item figures never render**~~ — ✅ **FIXED 2026-08-22** (`b8c5fac` + `900fe51`): [choice-figures-and-nested-lists.md](docs/design/choice-figures-and-nested-lists.md) — `MultipleChoiceOption.image`/`.graph`,
   `MatchingItem.image`/`.graph`, `MatchingTarget.image`/`.graph`
   (`multiple-choice.ts:63-64`, `matching.ts:42-51`). The editor authors them
   (`MultipleChoiceView.tsx`), the importer accepts `graph: <spec>` and a
   per-choice `![alt](url)` (`markdownToTiptap.ts` ~1542), and
   `MultipleChoice.tsx`/`Matching.tsx` render only `.content`. A "which graph
   shows…" question publishes with blank choices, on screen AND on paper. No
   viewer fixture carries one, so no test could notice. **Print-affecting.**
2. ~~**Nested lists drop their children**~~ — ✅ **FIXED 2026-08-22**, same doc — `ListItem.children` (`list.ts:25`;
   also `DefinitionListItem.children`). `serialize.ts` emits them from Tiptap's
   native nesting; `BulletList.tsx`/`OrderedList.tsx` map `items[].content`
   only. Any indented sub-list a teacher types is flattened for students.
   **Print-affecting.**
3. **The interactive-graph feedback knobs are inert end to end** —
   `partialCredit`, `builtinFeedback`, graph-level `mistakeFeedback`
   (`interactive-graph.ts:237-260`, all described in the present tense). The
   registry strips them for students, `server/grading/graphs.ts` reads neither,
   and `scoreGraphBlock` returns a boolean. The only readers are graph-kit's
   `runtime.ts` (the dead data-attribute contract — `attachGraphRuntime` has no
   caller outside graph-kit) and a client-side check path the viewer never
   invokes, which makes `graph-kit/src/mistakes.ts` (the classifier catalogue)
   production-unreachable. `GraphSettings.tsx` still exposes all of it.
   Contrast: BLANK-level `mistakeFeedback` IS live (`grading/blanks.ts`).
4. ~~**The student calculator no longer exists**~~ — ✅ **FIXED 2026-08-23**:
   [floating-tool-cluster.md](docs/design/floating-tool-cluster.md) (plan +
   AS-BUILT). `ActivityDocument.calculator` (`document.ts:305-347`) is read by
   `ToolCluster` in the viewer, mounted from `StudentViewer` (never from
   `ViewerContainer`, so it cannot leak into the print preview). The perf
   question this entry flagged resolved as a non-issue: summon is on CLICK, so
   a student who never opens it pays 0 bytes, and no budget row moved. The
   FEATURE SCOPE behind the wiring was ruled first — DECISIONS.md → "Calculator
   feature scope" (intersections/intercepts OUT; cross-row definitions MINIMUM
   only, shipped as T11).
5. **Section checkpoints and the activity flow modes** — `Section.isCheckpoint`,
   `meta.submissionMode`, `meta.revisionMode`, `meta.answerFeedback`,
   `meta.gradingMode`, `meta.activityType` (`document.ts:38,44-86,234-238`; the
   comment block describes all five modes in the present tense). Zero hits in
   `viewer/src` or the server: the viewer renders a Check button on EVERY
   section (`ViewerContainer.tsx` ~390) and never freezes inputs.
   `ActivityConfigDrawer.tsx`, `SectionBreakView.tsx`'s checkpoint toggle and
   the importer's `{checkpoint}` marker all write knobs that do nothing.
   `gradingMode` has no consumer in ANY package. *(`activityType` is also the
   field the import-format doc said was "not importable" — the 2026-08-21 fix
   made it importable into a field nothing reads.)*

**Minor, same class:** `ShortAnswerBlock.placeholder` (`free-response.ts:101` —
`Essay.tsx` and `SelfExplanation.tsx` honour theirs, `ShortAnswer.tsx` does not);
`RubricCriterion.description` (written by `RubricEditor.tsx`, read by neither
`ReleasedFeedbackCard.tsx` nor the teacher grading surface);
`inlineBlankSecrets` registry key (declared on 4 entries, `sanitize.ts` strips
blank secrets recursively regardless — over-strip, safe direction, guarded only
declaration-to-declaration in `registry.test.ts`).

**Comment claims with no code beside them** (fix with the ruling they belong
to): `registry.ts:37-38` + `FillInBlank.tsx:11` say `hint` survives
sanitization as "a pre-check affordance the student may open" — nothing in the
viewer reads `blank.hint` pre-check (not a leak; the stated reason is fiction);
`document.ts:81-85` "the runtime defaults a missing answerFeedback to
'immediate'"; `graph-kit/src/index.ts:7,75,98,126,261` and `inline.ts:328`
cite published pages / the runtime sidecar / `RUNTIME.md`.

**The guard to write once the rulings land:** a test that walks every schema
field and asserts it is read somewhere under `viewer/src/{blocks,container,
styles,server}` or `graph-kit/src` — a reachability test in the
`export-reachability.test.mjs` family (P1), bound to source rather than to a
hand-maintained list. Until then this list IS the list.

**Depends on:** author rulings per item (wire / delete). Item 1 and 2 are the
ones a teacher will hit first; item 4 is the one STATE claimed was live.

## TWO MORE ORPHAN FIELDS — `hasConfidenceRating` and `allowTargetReuse` (2026-08-22)

Found by the drift audit's §9 sweep run across **every** schema field rather
than only the new ones. Same class as the `number` override below, and the same
question: **wire it or delete it.**

**1. `hasConfidenceRating` — on SEVEN block types, with nothing anywhere that
renders it.** The schema describes it in the present tense ("students see a
3-point confidence selector (unsure / think_so / certain) … before checking"),
and `submission.ts`'s wire still carries a per-blank confidence. The
implementation was the RENDERER's and died at S9 Drop 4.

⚠ **The repo already half-knows this.** `printExpectations.ts:728` records that
eng review A10 (2026-08-06) deleted the `structure/section-confidence` print row
because "the viewer has no section-confidence feature — the string 'confidence'
appears nowhere in viewer source outside this file". That review removed the
print assertion and left the seven schema fields, the editor's settings control,
and the wire standing. Whichever way this goes, it should go all the way this
time.

**2. `allowTargetReuse` (matching) — inert in both directions.** The viewer's
Matching component never restricts docking a target twice, and the grader never
reads the flag (the key is `itemId → targetId`, so many-to-one already scores
correctly). So `true` enables nothing and `false` forbids nothing. Off by
default and the permissive behaviour is the safe one, which is why it has cost
nothing — but it is an authored knob that does not do what it says.

**Not orphans, checked and cleared in the same sweep:** `tickStep`, `binWidth`,
`minorTicksPerStep`, `snapToTick`, `maxFrequency`, `correctVertices`,
`minOverlap` (all consumed by graph-kit and/or the grading server — my first
pass flagged them only because the sweep's directory list omitted those
packages), and block-level `skills`, whose schema comment declares the deferral
honestly rather than implying a consumer.

## ✅ FIXED 2026-08-22 — the drift-audit skill's `Status:` grep

It matched two of the four spellings in `docs/design/`, so the 2026-08-22 audit
reported `activities-list-surface.md` as status-less when its line sits inside a
blockquote — the same false-positive class the skill already carried a warning
about from 2026-08-17, in a new spelling. Widened to one expression covering all
four (`^>? *\*{0,2}Status:`), with the two-audits-same-mistake note attached so
the next gap gets a wider expression rather than a fifth special case. Recovered
4 of 7 reported false positives; the 3 real ones are `graph-systems.md` and
`ux-lens.md` (instruments, not feature designs — no status wanted) and
`print-and-printables.md`, which was a SHIPPED feature with no status line and
now has one.

## Editor open remainders (moved out of STATE 2026-08-22)

Pre-rewrite deferrals that lived only in STATE's "completed arc" section —
which is replaced every session, so they were one rewrite from vanishing.
Roughly priority-ordered; none gates anything.

1. **Focus mode** — needs a caret-tracking ProseMirror plugin; off-by-default,
   wants its own design + eng pass.
2. **Input-parity / a11y touch pass** — touch needs a real device; `/` covers
   the keyboard floor today. (Related: the canvas-blocks tab-stop entry below.)
3. **Slice 6.5 smart-defaults** — net-new unvalidated heuristics; own spike.
4. **⌘⇧↑/↓ keyboard-reorder settle** — snap-motion follow-up (debounce design).
   Also filed separately below as its own entry.
5. **Chip open:** the slash menu dies under synthetic keyboard input once a
   query char follows `/` — humans unaffected, so this is a test-harness
   hazard rather than a user bug. **Papercut:** the gutter "+" can overlap the
   drag grip's lower half on a short block.

## A general walk-descent guard for nested-content blocks

**What:** A fixture-driven guard asserting that every registered block type's authored in-band ids
(blank tokens, math gaps) equal what the four walks actually return — the general form of the
table-specific quartet in [table-block.md](docs/design/table-block.md) §7 (Q1–Q3).

**Why:** `looksLikeBlockArray` ([blockIndex.ts:107](packages/viewer/src/container/blockIndex.ts))
descends into nested content only while the nested records DON'T carry both an `id` and a `type`.
Give a future block's sub-records a `type` and three of the four walks silently skip it: the
sanitizer still strips (it never stops), so nothing leaks — the answer is simply **never graded**.
`walk.ts`'s header calls that "the worst kind" of failure. The table arc pins its own case; nothing
pins the next one, and PDF import plus any grouped-question type will both meet this.

**Pros:** turns a silent tripwire into a build failure, once, for every future type.
**Cons:** the general version needs a real fixture-roster harness — more than a one-line assertion.

**Where to start:** the table quartet, once Slice 1 lands — it is this guard's worked example.
Then generalize over `registeredBlockTypes` × the authored fixtures.

**Depends on:** the table block's Slice 1.

## ✅ RENDER DONE 2026-08-21 — the two dead print fields now reach paper; the IMPORT SYNTAX is what remains

**✅ The render half shipped.** `blockStyle` emits `--print-work-space` on the block wrapper, and
`ViewerContainer` emits `data-grid-lines="true"` on a row whose tri-state resolves on. Four e2e specs
run green in a real browser (per-problem override with its non-vacuity pair, ruled `on`, ruled
`inherit`, and the unruled negative). **No print baselines moved** — verified rather than assumed: no
fixture authors either field, so both features are inert on every baseline.

**⏭ WHAT REMAINS: the import syntax, and it has an open design fork.** `work:` is a clean fence key
for ```mc / ```match / ```order — but **`fill_in_blank` has no fence.** It is produced by a `{{…}}`
inside a paragraph, so there is nowhere to hang a key, and it is the most common numbered problem on
a worksheet. Shipping `work:` on three of the four types would give the format a confusing contract
("works everywhere except the one you use most"). Candidate shapes, none chosen:
(a) a trailing `work: 4` line that attaches to the PREVIOUS block — a new grammar concept the format
does not have; (b) an inline suffix in the blank spec — wrong scope, since workSpace is a block
property and a paragraph can hold several blanks; (c) leave fill_in_blank to the activity-level ⚙
default and document the asymmetry. **Decide before building.**

The ```columns `ruled` option is independent and has no fork — it can ship on its own.

**⚠ AND A NAMING TRAP WORTH READING BEFORE PROMISING THIS TO ANYONE: `gridLines` is not ruled
writing lines.** It draws a BOX with dividers between cells — "boxed regions to write in or cut out
on paper", in the retired renderer's own words. Notebook-style horizontal lines to write ON do not
exist anywhere in this codebase. If that is what someone asked for, it is a separate (small) print
treatment — most likely a repeating gradient over the reserved work space — and it needs its own
authored option, which means a schema change and the usual bundle regeneration.

**The evidence, all verified 2026-08-21 by reading the render path:**
- **`workSpace` per block** — declared on `fill-in-blank.ts:43`, `ordering.ts:44`, `matching.ts:77`
  and `multiple-choice.ts`. The print CSS at
  [viewer.css:1234](packages/viewer/src/styles/viewer.css) *says* "A single problem can override the
  work space with its own value; that is ordinary custom-property inheritance, not a special case."
  **Nothing in `blocks/` or `registry/` ever sets `--print-work-space` on a block.** The comment
  describes behaviour that does not exist (policy P11 — a comment asserting coverage is a claim).
  What DOES render: the activity-level `print.workSpace` default, and `Column.minHeight`.
- **`gridLines` per row** — `Row.gridLines` (layout.ts:64), read by the editor Toolbar and
  round-tripped by serialize. `ViewerContainer.tsx:346` emits `data-row-id`, `data-column-count` and
  a grid style **and no grid-lines attribute**; no CSS anywhere resolves it. The importer hardcodes
  `'inherit'` at four sites, so nothing could set it anyway.

**Why this keeps happening — the generalisable part.** Both implementations were the renderer's, and
died with `packages/renderer` at S9 Drop 4. The schema field and the editor control survived, so the
contract still reads as honoured. This is the **third** instance this month: `numbered` (fixed by the
viewer-numbering slice), `LABELED_BLOCK_TYPES`, and now these two. **When a package is deleted, its
surviving DECLARATIONS need a consumer audit** — and the guard must bind to OUTPUT, because a guard
comparing two declarations outlives the implementation.

**What it needs (why it is a slice, not a task):**
1. Viewer: set `--print-work-space` on the block wrapper when a block authors `workSpace` — the same
   shared wrapper the numbering slice used, so it is declared once rather than per type.
2. Viewer: emit a row grid-lines attribute + print CSS resolving `'inherit'` against
   `meta.print.gridLines`, `'on'`/`'off'` overriding.
3. `printExpectations` rows bound to computed style for both. Note `structure/reserved-work-space`
   already EXISTS as a bare `{id, rule}` with no `expect` — it is a rule with no test, which is how
   this stayed invisible.
4. **Print baselines will move** — a Linux regeneration author station (the V7 precedent).
5. THEN the import syntax (a `work:` key on the problem fences, a `ruled` option on ```columns).

**Do not ship the import syntax first.** A fence key feeding a field nothing renders is exactly the
trap this entry documents.

**Cost note:** no schema change (both fields exist), so **no bundle regeneration and no Edge Function
deploy** — sanitize is a strip-list, not an allowlist, so both fields already survive to the student
surface untouched. It ships via Pages like any SPA change.

**Depends on:** nothing. Surfaced while scoping the print-gap feedback (2026-08-21); the import-syntax
half was the original ask and is blocked on steps 1–3.

## Page breaks and keep-together (author feedback #2, 2026-08-21)

**What:** No import syntax and no per-instance control to force a page break or
hold a block together. You cannot put the exit ticket / DoL on its own printed
page, or stop a worked example splitting across a fold. `{checkpoint}` is a
SECTION break, not a page break.

**Already investigated (2026-08-21) so the next session does not re-derive it:**
- `Section` is `{ id, title, isCheckpoint, rows }` (`schema/src/document.ts:35`).
  **`pageBreak: boolean` is a natural sibling to `isCheckpoint`.**
- `.viewer-section` already carries an explicit `break-before: auto` with the
  comment *"explicit: flow naturally, never force a page"* (`viewer.css`) — the
  one line to flip.
- The import syntax extends an EXISTING parser feature: the `{checkpoint}`
  heading tag becomes `## Title {checkpoint, pagebreak}`.
- **Keep-together is mostly already there** — `break-inside: avoid` is declared
  per block type on the registry's PrintSpec and asserted by
  `printExpectations`'s `spec/break-inside` row. What is missing is a
  per-INSTANCE override, which may not be wanted at all.

**Cost:** a schema change, so **both server bundles regenerate and a
`get-activity` redeploy is owed** — and note the subtle one: zod `.object()`
STRIPS unknown keys, so a published document carrying `pageBreak` would LOSE it
on the read path until the new function is live. That is the migration-before-
deploy rule wearing a different hat.

**Also needs:** a `structure/page-break` roster entry + e2e (the roster
cross-check refuses a declared id with no spec), and print baselines may move.

## Per-term definition printing (author feedback #6, 2026-08-21)

**What:** The only print path for `[[term]]` pop-ups is the ACTIVITY-WIDE
`printDefinitionGlossary` toggle — an end-of-worksheet appendix, all or nothing.
There is no way to author one term to print inline, or as a margin note. Since
the vocabulary work has the author marking every term, a per-term or margin
option would matter.

**Already investigated (2026-08-21):** `print.printDefinitionGlossary` is a bare
boolean on `PrintConfig`, rendered by `viewer/src/print/DefinitionGlossary.tsx`
and gated in `ViewerContainer.tsx:416`. Definition popovers are `display:none`
in print, which is why the appendix exists at all.

**Why this one wants a DESIGN PASS before an eng review, unlike page breaks:**
"margin note" is a real layout question on a two-column-capable worksheet, not a
boolean. Where does the margin come from — the `@page` margin (currently
0.5in and author-configurable), a reserved gutter, or a footnote-style block at
the section end? Each answers a different pedagogical need, and the cheapest
version (inline expansion on first use) may cover most of it.

**Depends on:** nothing. Both of these were ranked Tier 2 in the 2026-08-21
print-gap triage — a small schema field plus CSS plus import syntax.

## The print baselines' 1% tolerance may be absorbing real layout changes (2026-08-20)

**What:** `print-baselines.e2e.ts` compares with `maxDiffPixelRatio: 0.01`. On a 992-px-wide
snapshot that is roughly ten thousand pixels of slack — enough, apparently, to absorb a 40px number
gutter on a sparse block.

**The evidence:** the viewer-numbering slice put a number on twelve block types. Regenerating the
baselines changed **three** images (`fill_in_blank`, `problem`, `ordering`). The other nine came back
byte-identical, twice, from two independent CI runs. Yet the number demonstrably renders on that
exact route: the DOM assertion added to that suite passes 22/22 in CI, and `numbering/prints` passes
on the variant route. So the render is right and the images did not move.

**Why that matters:** a baseline is supposed to catch what the written rules do not name — "a
collapsed margin, an overlapping figure, a heading that lost its weight" (the suite's own words). If
a 40px structural change can pass under the threshold, the suite is less sensitive than it reads,
and the failure mode is silent: it goes on passing while the page drifts.

**Worth checking first (cheap, and it may dissolve the item):** run the generate job with
`--update-snapshots=all` so the artifact contains CI's ACTUAL render for every type, rather than the
checked-out file for the ones judged unchanged. That is the one observation this investigation never
managed to make — every artifact so far returns the committed image for unchanged files, so nobody
has actually SEEN what Linux draws for `multiple_choice`. If those renders do contain numbers, the
tolerance is the culprit and lowering it (or asserting per-block geometry) is the fix.

**Depends on:** nothing. Not urgent — numbering itself is guarded by two DOM assertions that no
tolerance can absorb, which is why the slice shipped without resolving this.

## `data-block-type` is emitted TWICE per block, and it keeps costing time (2026-08-20)

**What:** the container's wrapper ([ViewerContainer.tsx:456](packages/viewer/src/container/ViewerContainer.tsx))
and most block components' own roots BOTH carry `data-block-type`. `[data-block-type="X"]` therefore
matches two nested elements, and "the block" is ambiguous in every selector built on it.

**Why record it rather than tolerate it:** it cost time four separate times in one session. The print
harness already carries a paragraph explaining that BLOCK_ROOT is ambiguous "by construction" and
tries every candidate; a live browser check for a nested-gutter leak matched the wrapper and briefly
looked like a real bug; and the new `numbering/prints` rule failed on its first run purely because
variant scoping targets the component root (which carries `data-variant`) while the number lives on
the wrapper. Each was resolved in minutes — which is the point. It is a recurring tax, not a one-off.

**Options:** (a) drop the attribute from component roots and let the wrapper own it — smallest
change, but touches every component and the many selectors assuming the inner one; (b) give the
wrapper a distinct `data-block-wrapper` and narrow existing selectors deliberately; (c) leave it and
keep paying, which is defensible since the harness already compensates and nothing is broken.

**Depends on:** nothing, but it wants a quiet slice — the print gate, the a11y lane and several
component tests all select on this attribute, so the blast radius is wide even though the change is
shallow.

## The `number` override is an ORPHAN FIELD — wire it or delete it (eng review D9, 2026-08-20)

**What:** `number: z.number().int().positive().optional()` sits on 8 block schemas
([fill-in-blank.ts:38](packages/schema/src/blocks/fill-in-blank.ts) + 7 others) and **nothing writes it.**
Decide whether to wire it end to end or remove it.

**The evidence, all verified 2026-08-20:**
- The dead renderer honoured it — `const num = block.number ?? ctx.problemNumber;`
- **The editor's walk ignores it** — `problemNumberAt` returns a running count and never reads
  `node.attrs.number`. So the two surviving surfaces already disagreed.
- `serialize.ts` emits it in neither direction; there is no editor control and no importer key.
  **No document currently in the database can carry it.**

**The unresolved sub-question, which is the reason this is not a five-minute job:** what does a manual
number do to the questions AFTER it? The renderer relabelled one question and let the count carry on
underneath (`number: 12` on question 1 yields a sheet reading 12, 2, 3, 4 — self-contradicting). The
alternative is that it restarts the count (12, 13, 14), which is the only semantics that serves the
real use case: **continuity across the ~150-activity catalogue**, where activity 2 should carry on
from where activity 1 stopped. Deleting the field instead is a schema change with the usual
unconditional bundle regeneration.

**Depends on:** nothing. Cut from the viewer numbering slice at D5 so the slice could ship without
adopting an authoring feature nobody had asked for.

## The document walk is duplicated FIVE times — extract `forEachTopLevelBlock` (eng review D10, 2026-08-20)

**What:** The same 4-deep `sections → rows → columns → blocks` loop is written by hand in:
[blockIndex.ts:189](packages/viewer/src/container/blockIndex.ts),
[answer-key/extract.ts:198](packages/viewer/src/answer-key/extract.ts),
[print/printShuffle.ts:90](packages/viewer/src/print/printShuffle.ts),
[sanitize/sanitize.ts:356](packages/viewer/src/sanitize/sanitize.ts), and now
`numbering/numbering.ts`. `census.ts`, `server/grading/walk.ts` and `servedOrder.ts` touch `.rows` too.

**Why it waited:** one of those call sites is **the sanitizer** — the module that keeps answer keys
away from students. Extracting a shared iterator drags the leak suites and both server bundles into
whatever slice does it, which is a poor trade for saving four lines of `for`. The numbering slice
deliberately wrote the fifth copy rather than take that blast radius (D6).

**How to do it when it is worth doing:** its own structural commit with nothing else in flight —
never structural and behavioural change in the same breath. Extract, migrate all callers, re-run the
leak suites, regenerate both bundles, verify `SANITIZER_REV` is unmoved.

**Depends on:** a quiet moment with no schema change in flight.

## The answer-key slice's three recorded follow-ups (T7 + two rulings, 2026-08-20)

Left open deliberately by [problem-answer-key.md](docs/design/problem-answer-key.md); T1–T6 shipped.

**1. ✅ T7 — FULLY DONE** (the blocked half is unblocked; see 1b).
Shipped 2026-08-20: a `printExpectations.ts` universal row (the written answer key never prints on a
student worksheet, with its non-vacuity pair named in `print-answer-key.e2e.ts`), and an a11y row
that scans the **post-check** worksheet — a state this lane had never scanned at all, and which is
where the answer-key slice's new solution-disclosure DOM lives. Both verified in a real browser.

**1b. ✅ RESOLVED 2026-08-20 — the viewer renders no problem number for any block type.**
*(Kept in full because the finding is the useful part; the fix is recorded at the end.)*

*The finding, verified in the dev harness:* `fill_in_blank`, `multiple_choice`, `matching`,
`ordering`, `number_line` and `faded_worked_example` all declare `numbered: 'always'` in the
registry, and **not one of them renders a number** on screen or on paper. `ViewerContainer`'s block
slot emits `data-block-id/-type/-category/-family/-align` and nothing about numbering; no CSS
counter exists; `pageLabel()` has no consumer outside the schema's own tests.

*How it happened:* the surface that rendered numbering was the renderer's `isNumberedBlock`, which
wrote "Problem N" into published HTML. It died with `packages/renderer` at **S9 Drop 4**, and the
viewer — now the only student surface — never inherited the job. The registry declaration and its
guard test survived the deletion, so the contract still *looks* honoured.

*Why it matters more now:* ruling E7 (answer-key slice) made `short_answer` and `essay` numbered on
the stated premise that "numbers render on screen and on paper from the one existing numbering
walk". That premise is false for this surface. Paper-first workflows are the reason the slice
exists — a printed worksheet whose questions have no numbers cannot be marked against a key, and
the scan-grading arc's paper→block mapping has nothing to key on.

**✅ BUILT — [viewer-numbering.md](docs/design/viewer-numbering.md), eng-reviewed (D2–D10) and
DX-reviewed, shipped as V1–V6 + V9 on 2026-08-20.** A pure `buildNumbering` walk producing an
id-keyed map, rendered by the SHARED block wrapper so the grid is declared once and every numbered
type inherits it — including types that do not exist yet. All three label modes honoured, sub-part
lettering back, the number announced once from a labelled group.

**The part that matters most is the guard.** `numbering-output.test.tsx` binds `numbered:'always'`
to RENDERED OUTPUT instead of to another declaration. Proven against the original bug: with the
render path removed, `registry.test.ts` reports 43 passed — green, exactly as it was for four
months — while the new guard reports 3 failed, naming all eight types.

**The generalisable lesson, recorded because it outlives this item:** when a package is deleted, its
surviving DECLARATIONS need a consumer audit. A guard comparing two declarations outlives the
implementation that made them true, and is then worse than no guard, because it reads as coverage.

**Still owed — V7:** regenerate the 22 Linux print baselines (~10 change) via `workflow_dispatch`
and commit the artifact. CI's print-gates job is red until it lands, and that red is EXPECTED.

*What the work is (its own slice, not a sweep):* give the viewer a numbering pass over the served
document — sequence walk, the three `label` modes (`number` / `custom` / `none`, already in the
schema), the on-screen and print renderings, and the a11y association between the number and its
question. **Then** the two rules T7 could not declare become declarable: a `printExpectations.ts`
row for the number on paper, and the a11y check that it is announced with the question rather than
read as loose text. Do it for every numbered type at once — a numbering surface that serves two
block types is worse than none, because the sheet's numbers would then skip.

*Cross-reference:* the note at the top of `printExpectations.ts`'s universal block records the same
finding where the future implementer will be standing.

**2. A full answer/solution EDITING UI in the editor (ruling E10 deferred it).** What ships today is
read-only display in `FreeResponseView` — a collapsed, teacher-only panel showing whatever the
importer brought in. The authoring surface is the .md file plus the batch importer's
re-import-updates flow. Build this only when a teacher actually needs to edit a key without touching
the file; the round-trip it would have to preserve is already pinned (`serialize.test.ts`).

**3. Remove the `problem` block type (ruling E1).** It carries a tombstone comment
([packages/schema/src/blocks/problem.ts](packages/schema/src/blocks/problem.ts)) and nothing but the
schema and the viewer's read-only `Problem.tsx` still touches it. Removal is a **migration**
question, not a deletion — documents in `activity_versions` may contain one and the schema is what
must keep reading them. **Policy P5 applies: the removal audits every comment that cites `problem`**
(a claims-grep), because several files explain their own behaviour by contrast with it.

## ✅ RESOLVED 2026-08-18 — the `sw` lane fails while the local Supabase stack is running (recorded 2026-08-14)

**Fixed in `cc24700`.** The two offline-reopen rows in `e2e/sw/service-worker.e2e.ts` now pass
with `supabase start` UP; proven both directions (73/73 across the four CI lanes with the stack
running, and on clean `main` moving only the port turned the same two rows green).

**⚠ THE RECORDED MECHANISM WAS WRONG, and the entry said so — which is the lesson.** This entry
hypothesised *contention*: "the rows kill a disposable preview server and race a service-worker
fetch, and the Docker VM makes that timing much worse — but that was not proven, so treat the
mechanism as a hypothesis." Honest, and correctly hedged. **But the RULING it carried —
"a local environment interaction, not a product defect... recorded, not fixed" — rested on that
unproven hypothesis anyway, and stood for four days.**

**The real mechanism, tool-proven:** the stub lanes and the integration lane shared one address,
`127.0.0.1:54321`, that they needed to mean OPPOSITE things — the stub lanes need it
**unreachable** (their offline rows are built on a real connection refusal), the integration lane
needs the **real stack** there. With a stack up, Kong answered with a genuine
`401 {"error":"Expected 3 parts in JWT; got 1"}` (the harness's fake `access_token` is
deliberately not a JWT), `readClient` mapped 401 → `unauthenticated`, and the page showed "Please
sign in again" instead of the offline banner. Not timing at all; nothing to do with Docker load.

**So it WAS a defect — in the harness, and fixable.** Stub lanes moved to `127.0.0.1:54399`
(outside the CLI's whole default range, so the origin is dead by construction), one home per
origin with everything else importing it, a preflight that fails with a named fix, and
`scripts/tests/e2e-origins.test.mjs` pinning the constant ↔ `playwright.config.ts` ↔ `ci.yml`
three-way agreement. Full story: `packages/app/e2e/helpers/e2eOrigins.ts`.

**The advice this entry used to give is now obsolete** — you no longer need `supabase stop` before
a plain sweep. Both lanes run with the stack up.

**Two things to carry forward:**
1. **A hypothesis flagged as unproven should not carry a ruling.** "Treat the mechanism as a
   hypothesis" and "not a product defect, record don't fix" cannot both be honest in one entry —
   the second is a conclusion the first says you have not earned.
2. **A lane that passes because of what is ABSENT from the machine is not passing, it is
   unobserved.** CI was green on these rows only because CI has no local stack.

**Related trap, STILL LIVE and unrelated to the above:** heavy background load (a game client at
~80 % CPU, plus Docker) turned a 40-second four-lane run into 14.5 minutes and failed five
`failure-matrix` rows that are green on a quiet machine — including rows nobody had touched.
**Local e2e timing results are not trustworthy under load; CI is the arbiter.** Check `uptime`
before believing a local e2e failure.

## ✅ NOT A GAP — viewer data plots in dark mode (raised and DISPROVED 2026-08-18)

**Recorded so nobody re-finds it.** A drift-audit pass claimed the viewer renders data plots
with light structural colors in dark mode, reasoning that `--gk-board-axis/label/ink` are
defined only in `packages/app/src/editor/editor.css` while the viewer imports
`renderDataPlotSvg`. **The claim was wrong, and the design is correct.** Disproved in a real
browser at `/dev/viewer?type=data_plot` with `theme=dark` set BEFORE mount:

| Observed | Value |
|---|---|
| board axis stroke | `#94a3b8` — the **BOARD_DARK** value, not light `#64748b` |
| board label fill | `#cbd5e1` — the dark value |
| viewer page background | `#020617` |
| `[data-print-svg]` display | **`none`** |

**Two mechanisms, and the audit conflated them:**
1. **On screen, the live board draws** — `detectBoardTheme(container)` reads the computed
   `color-scheme`, which `packages/app/src/index.css` sets at `:root` (`light dark` /
   `light` / `dark`), and `boardColors('dark')` supplies a real dark palette. Nothing to do
   with CSS custom properties. Graphs, number lines and data-plot boards all work this way.
2. **`renderDataPlotSvg` is the PRINT TWIN** (`blocks/printTwin.tsx`), `display: none` on
   screen (`viewer.css:914`), revealed only under `@media print` / `[data-viewer-mode='print']`
   — and print forces `color-scheme: light` (`index.css`, pinned by the "print forces light
   even for a dark-theme user" row in `dark-contrast.e2e.ts`). So the LIGHT fallback hexes are
   the *correct* values on the only viewer surface that renders that SVG: paper.

The editor defines the tokens because the editor shows that same static SVG **on screen** as
the DataPlotView preview — exactly the case `graph-kit-board-dark.md` describes. Two surfaces,
two mechanisms, both right.

**⚠ The trap that produced the false finding, worth knowing before touching this:** grepping
"viewer imports renderDataPlotSvg" + "viewer does not define the tokens" looks conclusive and
is not. **Check whether the element is visible on the surface you are reasoning about.** The
`data-plot-svg.ts` header comment actively misled here — it still described *published pages*
(dead since S9) as the surface that leaves the tokens undefined; corrected 2026-08-18 to name
the viewer's print path instead.

**One thing genuinely NOT verified** (small, teacher-only): the teacher print ROUTE renders the
twin on screen via `[data-viewer-mode='print']`. Whether that route forces a light surface on
screen for a dark-theme teacher was not tested — only `@media print` was. If someone touches
the print route, check it; it is a preview-fidelity question, not a student-facing one.

## Canvas blocks add ~17 keyboard stops — Check sits 76 tabs in (S9 Drop 5 follow-up)

**What:** On the fixture worksheet (every block type, all lazy blocks mounted), a
student tabbing from the top of the document reaches the first blank at stop 3 and
the section's **Check** button at stop **76**. The canvas blocks contribute ~17 of
those: 12 `viewer-graph__canvas` + 3 `viewer-data-plot__canvas` + 2
`viewer-number-line__canvas`, and JSXGraph adds further focusable descendants.

**Why it is only a finding, not a bug:** every one of those stops has an accessible
name, so it is not a WCAG violation and axe is clean — the a11y lane passes. It is a
UX question, not a conformance one.

**Why it was invisible until now:** the a11y lane's axe scan ran against the
PRE-mount DOM (the lazy tier renders nothing at all until its chunk resolves), so
nobody had ever measured the mounted tab order. Made deterministic 2026-08-14; the
measurement above is from that mounted state.

**The actual question when this is picked up:** how should a canvas block expose its
handles to the keyboard? Options run from a single roving-tabindex entry point per
board (one stop, arrow keys within) to a skip-link past the canvas. That is a design
pass, deliberately NOT smuggled into a CI-green commit (author-ruled 2026-08-14).

**Watch item:** `e2e/a11y/student-surfaces.e2e.ts` derives its Tab budget from the
page's focusable count, so adding block types will not silently re-fail the row —
but a large jump in that count is the signal this got worse.

## Settle on ⌘⇧↑/↓ keyboard reorder (debounced)

**What:** Tag `BlockReorderShortcuts` (⌘⇧↑/↓) into the stage-6 SettleMotion flow with a
debounce, so a keyboard-moved block settles at its FINAL resting position only.

**Why:** Stage 6's settle is meta-tag opt-in (eng-review ruling T2-1, 2026-07-21), and the
keyboard reorder chord was deliberately left untagged: each keypress is a delete+insert, so
holding the chord to walk a block five slots would fire five back-to-back settles (a
strobe). Untagged is the safe v1 default — but it means keyboard-first users get no
placement confirmation while mouse users (drag) and inserters do. Parity gap.

**The design problem:** "animate only the final position" needs stopped-moving detection —
e.g. a trailing debounce (~250ms after the last reorder transaction for the same block,
apply the settle decoration), or animate on chord keyup. Neither is trivial inside a PM
plugin; that's why it was split out rather than built into stage 6.

**Depends on:** stage 6's SettleMotion extension landing first (the meta contract +
`block-settle-move` keyframe it would reuse).

**Where to start:** `packages/app/src/editor/extensions/BlockReorderShortcuts.ts` (the
chord commands) + the SettleMotion plugin's meta contract. The move keyframe
(`block-settle-move`, bounce-only, no opacity dip) already exists by then.

**Context:** surfaced by /plan-eng-review's outside-voice pass on 2026-07-21 while
reviewing the stage-6 snap-motion plan (finding 4: the reorder chord has the same
transaction signature as a drag move).

## Doc-level seam zones between multi-column rows

**What:** A second insert-zone kind at the DOC level covering the horizontal gap between
two adjacent multi-column rows (or a multi-col row and a sectionBreak), inserting a fresh
1-col row at that position.

**Why:** The shipped insert-zones seam model (eng-review ruling 2A, 2026-07-23) is
column-interior only — a strip above every block inside a column plus one at each column's
end. That covers every gap EXCEPT multi-col-row ↔ multi-col-row adjacency, which stays
grip-menu-only ("Add row below"). Deliberate: one zone kind keeps the mental model pure
("this strip = a block lands here, into this column"); doc-level zones would put a
second, different landing semantic (new row) behind an identical-looking strip.

**Pros:** closes the last insert-affordance coverage hole. **Cons:** dual semantics in
one UI — the exact ambiguity 2A was chosen to avoid; needs a visual differentiator.

**Depends on:** the v1 insert zones shipping first; real dogfooding or teacher feedback
actually hitting the gap (rare layout).

**Where to start:** the InsertZones extension's `insertZonePositions` helper
(`packages/app/src/editor/strictGrid.ts`) — doc-level positions are the ones it
deliberately does not emit; `StrictGridNormalize` re-coalesce rules decide what a
doc-level insert normalizes into.

**Context:** surfaced by /plan-eng-review on 2026-07-23 while reviewing the persistent
insert-zones feature (issue 2 / ruling 2A).

## Batched staleness-status RPC (`get_branch_source_statuses(uuid[])`)

**What:** A batch variant of Drop 2′'s `get_branch_source_status(branch_id)` so the
Activities/library view resolves every branched card's staleness in one round-trip.

**Why:** v1 ships the per-card RPC — a deliberate N+1 accepted because branch counts are
single-digit (eng-review ruling D10, 2026-07-24). The batch variant is additive (no surface
break) and only earns its keep at scale.

**Trigger:** any user's branch count passes ~15, or library render is measurably slow.

**Where to start:** the `get_branch_source_status` definer RPC in the Drop 2′ migration —
same owner-only gating, `= any(p_ids)` + per-row degradation instead of a single lookup.

**Context:** surfaced by /plan-eng-review on 2026-07-24 (Activity Bank arc, performance
review finding 4-1).

## ⚰ MOOT at S9 (struck 2026-08-13) — Anonymous assignment-link validation at page load

**Why struck:** this entry proposed a new anonymous endpoint so PUBLISHED PAGES
could preflight `?a=` assignment links — the entire world it serves (published
static pages, the anonymous wire, get-feedback as the precedent to copy) is
demolished by the S9 cutover (plan: docs/design/s9-cutover.md, Drops 3/4;
rulings D-5/D-6). Students reach activities through the signed-in viewer at
`/a/:id`; there are no anonymous assignment links left to validate. Kept (not
deleted) because the September-observation trigger below names Kia/Felice
classes — if a *viewer-era* dead-link problem ever appears, it is a NEW design
against `class_activities`, not this endpoint. Original entry follows for the
record:

**What:** A tiny anonymous endpoint (get-feedback's `--no-verify-jwt` pattern, or a new
action on it) that a published page calls at bootstrap when `?a=` is present, so a dead
assignment link surfaces BEFORE the student starts working, not at submit.

**Why:** The scoping train's ruling D14 (2026-07-24) made token death non-destructive —
on 401 the work is preserved in the pending blob and retries with a fresh link — so the
remaining harm is only "student learns late." That downgraded the preflight check from
requirement to polish, and it was deferred because it adds a real anonymous surface
(deploy flag, CORS, enumeration thinking — tokens are ~72-bit so enumeration is cold, but
it's still a new no-JWT function to maintain).

**Trigger:** the September observation (Kia/Felice classes) shows students actually
hitting dead links.

**Pros:** dead link discovered in second 1, not minute 40. **Cons:** one more anonymous
Edge Function surface to secure and redeploy correctly (`--no-verify-jwt` footgun applies).

**Where to start:** `supabase/functions/get-feedback` (the anonymous-endpoint precedent);
the runtime bootstrap in `packages/renderer/src/runtime/init.ts` for the call site.

**Context:** surfaced by the outside-voice pass of /plan-eng-review on 2026-07-24
(finding OV-4, option B content, deferred by ruling D14/D19).

## Orphaned-image garbage collection (activity-images bucket)

**What:** A cleanup job that diffs `activity-images` Storage objects against the image `src`s
actually referenced in activity documents and deletes the unreferenced ones.

**Why:** The bucket has no DELETE path by design (0019: INSERT-only policy), so every replaced or
abandoned upload lives in a public bucket forever. Same residue the R2 era had — but Storage
counts against Supabase's 1GB free-tier quota, which R2's 10GB never made anyone think about.
A slow clock, but a real one.

**Cons / why not now:** Needs real design — image refs live inside JSONB in BOTH
`activities.draft_content` AND `activity_versions.content`, and until the S9 cutover, old
published R2 pages also reference uploads. A naive GC deletes images that published pages still
show.

**Depends on:** S9 cutover (single source of truth for references). Service-role side (the only
role that can delete).

**Context:** surfaced by /plan-eng-review 2026-07-31 (direct-to-Storage upload review, TODO ask 1).

## Upload progress indicator (blocked on a policy-design amendment)

**What:** A progress bar during image upload in the editor popovers (ImageEditPopover,
DefinitionEditPopover).

**Why:** Visible-state UX for large images (repo UX priority: visible state indicators). The
10MB cap keeps uploads short on school networks, so this is polish, not pain.

**⚠️ The trap this entry exists to disarm:** this is NOT a UI-only task. supabase-js's standard
`upload()` has no progress callback; progress requires the TUS resumable protocol, and TUS needs
UPDATE (and possibly SELECT) policies on `activity-images` that 0019 deliberately omits — the
absence of an UPDATE policy is what makes objects overwrite-proof today (DECISIONS.md →
"Direct-to-Storage image upload"). Whoever picks this up is amending the bucket's security
posture first and adding a progress bar second.

**Context:** surfaced by /plan-eng-review 2026-07-31 (outside-voice finding 7, TODO ask 2).

## Teacher grading bound to `section_checks` (the S4 deferral's owner)

**What:** Make student free-text captured by the viewer's check flow gradable by a teacher, and
readable back by the student. Four pieces: (1) how `grades` keys onto checks — a nullable
`check_id` with an exactly-one-of constraint against the existing `submission_id`, or a
checks-native grading table; (2) the **attempts-vs-latest-response decision**; (3)
`get_my_released_feedback(activity_id)`; (4) the dashboard UI binding.

**Why:** S4 records every check into `section_checks` (responses + verdicts + feedback shown),
so free-text answers are CAPTURED — but nothing can grade them and
`CheckService.fetchReleasedFeedback` honestly returns `graded:false` until this lands. The
student-facing "Recorded ✓ — your teacher will review" copy stays true only because this slice
is scheduled. It must land before any real classroom use of the viewer.

**⚠️ Why it was deliberately CUT from S4** (eng review 2026-08-01, cross-model tension T2): a
`unique(check_id, block_id)` written during S4 would have frozen the attempts-vs-latest question
BEFORE the UX that answers it. Under a formative check loop a student produces MANY
`section_checks` rows per section, each re-snapshotting their free text. Does the teacher grade
an attempt, or the latest response per block? That is a grading-UX question, and deciding it
with the UI in front of you is the whole point of the deferral. Freezing the FK first buys a
second migration.

**Second open question the deferral inherits:** released feedback is keyed by BLOCK id, but a
republish mints all-new block ids (the same premise that made S4 grade the served version).
Feedback graded against version N is unrenderable by a client viewing version N+1. The
version-pinning insight was applied to grading and not yet to readback.

**Depends on:** S4 shipping `section_checks` (migration 0020) — DONE 2026-08-01, so this is unblocked.

**⏸ Deliberately parked (author, 2026-08-01): NOT pressing, because there are no
teachers using the system yet.** That is the whole reason it can wait — the
captured free text is accumulating safely in `section_checks.responses` and
nothing is being lost. What changes the urgency is the first real teacher: at
that moment "Recorded ✓ — your teacher will review" becomes a promise the
product cannot keep, and this slice is what keeps it.

**⚠ S9 amendment (2026-08-12, eng review OV-5/OV-6):** the S9 cutover plan
([s9-cutover.md](docs/design/s9-cutover.md) D-6) RETIRES the Phase 2.6 surface this
entry would have re-pointed: the Submissions dashboard route is deleted, `grades`
rows are wiped with the anonymous-wire test data, and `get-feedback` is deleted —
**and was discovered to have NEVER worked** (every success return passed its
arguments to `jsonResponse` swapped, so the body served was the literal `200`;
released feedback never reached a published page). Consequence for pickup: this
slice rebuilds against `section_checks` with NO working reference implementation —
do not port `get-feedback`'s "behavior"; there is none. The Phase 2.6 rubric UI
components remain in git history for salvage.

**Where to start:** `supabase/migrations/0010_grades.sql` (the `submission_id`-keyed table +
`can_grade_submission` helper + the dual-path RLS precedent already written for the assignment
world), and the Phase 2.6 teacher grading UI (side-by-side + Needs-grading filter) that will be
re-pointed.

**Context:** surfaced by /plan-eng-review 2026-08-01 (S4 review, outside-voice findings 5+6 →
ruled tension T2, TODO ask 1). Full rulings: the S4 section of
`~/.gstack/projects/ZanReed-activity-platform/user-main-design-20260728-components-as-data.md`.

## The check-rollup ARMING arc — ✅ ROLLUP BUILT (0036); only the ARMING FLIP remains

**⚡ STATUS 2026-08-16 (late): the build half is DONE and committed.** Migration **0036** ships the
two rollup tables, `users.timezone` + the IANA-validating guard trigger, `run_analytics_maintenance`
v2 (sweep → self-heal → roll → stamp + reconciliation pair), `rebuild_check_rollup`,
`purge_soft_deleted` v4, and `get_activity_analytics` v2. verify-0036 is **20/20**; the full local
suite is **145/2** (the 2 are the documented fresh-DB seeded-data preconditions). **Everything
below the checklist is now HISTORY of how it was ruled — the live work is the checklist alone.**

⚠ **THE GATE'S CHARACTER CHANGED, and this is the one thing a future session must not misread.**
0035's gate was mechanical: nothing wrote `rolled_through`, so arming was inert. **0036 writes it
nightly.** The prune is now held disarmed by exactly two things — **it is not scheduled**, and its
**`p_dry_run` default is true**. Scheduling `prune_section_checks(false)` now DELETES ROWS. The
inert-by-construction era is over; from here the checklist is the only guard.

**What remains:** apply 0036 live → watch the ledger for N green nights → work the arming
checklist below → the author flips the cron command to `prune_section_checks(false)`.

**Trigger for ARMING:** real check growth on the `analytics_job_runs.section_check_rows` ledger
(still 0 as of 2026-08-16 — 11 runs, all zero). No date; read the ledger. Building the rollup
early was the author's deliberate call (momentum + every ruling fresh); arming has no such
argument and waits for real data.

**Two tracked follow-ons this arc deliberately did NOT build (P1 tracked-debt form, OV-5/OV-7):**
- **The daily-trend surface** is the production reader for `check_rollup_daily.students` and
  `check_item_rollup_daily.students_all`. Those columns ship with no reader today and are kept
  anyway because per-day distinct students is the ONE figure that cannot be recomputed
  retroactively once pruning runs. **No RPC may ever offer their SUM** (uniques don't compose;
  `hll` is unavailable on Supabase, checked 2026-08-16).
- **A teacher timezone control.** `users.timezone` has no editing surface, so every teacher but
  the author (set by 0036's email-keyed UPDATE) gets the `America/Chicago` default baked into
  their rolled day keys. Bundle it with the deferred **"how your name appears to students"**
  control — same `users` self-edit family, same tiny RLS-covered write. ⚠ Ordering matters: a
  zone correction after arming can only re-day the in-horizon window (older days are frozen),
  so the control is worth more BEFORE a second teacher accumulates history.

**THE RULINGS BELOW ARE ALL BUILT INTO 0036** (eng review 2026-08-16 Part I D2–D12, Part II
D2-II–D7-II + OV-1..9; full trail in
[check-retention-and-rollup.md](docs/design/check-retention-and-rollup.md) §5 + §II). Kept as the
record of WHY the schema looks like it does — read them before changing it, not before building it:
- **Item grain, two single-grain tables** (`check_rollup_daily` per version/day: checks, students;
  `check_item_rollup_daily` per version/day/item: verdict counts, students). `census_key` resolved
  at READ time via `activity_version_items` so a re-census re-attributes rolled history. FKs
  CASCADE from activities AND versions; 0026 §B's no-student-identifier assertion extends to both;
  zero RLS, DEFINER reads, **activity-scoped ownership gates only** (0035's header states this as
  a checkable claim).
- **The rollup rides `run_analytics_maintenance()`** (no third cron job): sweep → roll → advance
  watermark, `rolled_through` written coalesce-forward on EVERY ledger row.
- **MVCC watermark lag ≥ 5 min**, honestly framed: it shrinks (not closes) the in-flight-transaction
  hole; state the bound and consider `idle_in_transaction_session_timeout`.
- **Per-teacher timezone:** `users.timezone` (IANA text), default `America/Chicago`, the author's
  row set to `Pacific/Auckland`; `analytics_day(ts, zone)` keyed on the activity OWNER's zone (the
  platform spans the US and New Zealand — no single constant works). ⚠ **Validate the zone**: it is
  user-editable text in the nightly job's path — check against `pg_timezone_names` at write AND
  exception-guard to the default in the job (one bad row must not kill the nightly run — the 0022
  failure class), with an invalid-zone verify row.
- **Split-day re-rolls:** every owner-zone day spans ≥2 nightly runs (03:30 UTC is mid-afternoon
  NZ); delete-then-insert per (version, day) must recompute the FULL day from raw rows, so
  `PRUNE_HORIZON` (30d, floor 7d — the bond in 0035) must stay ≫ the day-completion lag. Verify
  row: a day split across two runs. Re-derive the cron hour while here.
- **Purge v4:** `purge_soft_deleted` is NEVER blocked by the watermark (retention outranks
  analytics); it reports unrolled-destroyed counts **on a ledger row**, never the NOTICE (0026
  established notices are unreadable).
- **`rebuild_check_rollup(p_from date)`:** rebuild ≡ incremental, including after a re-census;
  every shape decision stays reversible until arming.
- **Per-key `students` becomes latest-grounded at arming** (no code change — the live query over
  surviving rows already computes it); the deliverable is the panel-copy disclosure. Daily
  `students` columns are per-day trend figures; **no RPC may offer their sum** (uniques don't
  compose; `hll` is unavailable on Supabase, checked 2026-08-16).
- **`*_latest` is NEVER rolled** — it stays live-computable forever (F2); the rollup carries the
  flow family only, and `get_activity_analytics` v2 reads rolled + raw across a single-sourced
  `>=`/`<` boundary.

**THE ARMING CHECKLIST — the live work** (also in 0035's header):
1. ✅ rollup built (0036, committed 2026-08-16) · 2. ⏭ **0036 applied live** (pending author) ·
3. ⏭ backfill — no separate step: **the first nightly run after 0036 IS the backfill** (it rolls
everything below the watermark; trivially empty at 0 checks) · 4. ⏭ watermark advancing for **≥ N
green nights, read off `analytics_job_runs` rows, not the cron registration (P3)**, with the
**reconciliation pair not drifting between runs** (`checks_below_watermark` vs
`rolled_checks_total` — movement is the signal, not the absolute) · 5. ⏭ verify-0035 + verify-0036
re-run live · 6. ⏭ **counsel packet Q10 answered** (n=1 aggregates surviving a purge; asked
2026-08-16) · 7. ⏭ `PRUNE_HORIZON` re-checked against real split-day lag · 8. ⏭ **cron flipped to
`prune_section_checks(false)`** — the first genuinely destructive act in this whole arc.

**✅ P5 debt — DISCHARGED by 0036**, where each retired guard said to discharge it: 0036's header
names and supersedes 0026:106 and 0022's header (applied migrations are immutable, so the
supersession is recorded rather than edited); verify-0035 §A's `rolled_through_never_written`
became a **scoping** assertion (`rolled_through` on `job_name='analytics'` rows only); and
verify-0035 §I **inverted** — the fixture is now rolled before the prune, so `*_all` is UNCHANGED
across it. That delta of zero, asserted where the honest loss used to be, is the arc's promise.

**Depends on (for ARMING):** 0036 applied live; real classroom traffic — the one thing neither
2026-08-16 review could have, and the reason step 8 waits.

**Where to start:** [check-retention-and-rollup.md](docs/design/check-retention-and-rollup.md)
(§4 checklist, §5 + §II rulings), then **0036's header** (its "design tension carried visibly"
block explains the horizon clamp — the single most important invariant to not break), then
`scripts/verify-0036.sql` §C for the fixture idiom.

**Context:** the original entry (2026-08-01, S4 review) waited months on the attempts-vs-latest
ruling; teacher-grading G2 ruled it 2026-08-15, the 2026-08-16 eng review ruled the rollup's shape,
and its outside voice overturned "build the rollup now" into "prune disarmed now, rollup at arming"
(D10) — the frame this entry now records.

## The remaining ~380 ms LaTeX-fallback window (S5-2 residual, halved not closed)

**What:** A student still sees readable-LaTeX fallback for roughly **380 ms** after the
worksheet becomes interactive, and a browser-menu Ctrl+P inside that window prints the
fallback rather than typeset math.

**What already happened (do not redo it):** S8 T7 shipped preload-on-math-detect — the
KaTeX fetch now starts the instant the served document is known to contain math instead of
waiting for a math component to mount. That took the window from ~737 ms to ~382 ms and
cost nothing in shell size. Full reasoning and the before/after table: DECISIONS.md →
"Preload math on detect, rather than eager-loading it".

**The only lever left is eager loading, and it is expensive.** KaTeX is 75.2 KiB gz against
a 168.1 KiB gz shell — about **+45% first load** on every math-bearing page — and it would
amend ruling D16, which exists to protect Chromebook load time. Deliberately NOT taken: a
sub-half-second window that only bites if a student reaches for Ctrl+P in the first moment
is not worth that, especially on the school hardware D16 protects.

**Trigger to revisit:** a teacher or student actually reports printing raw LaTeX, OR the
shell gets enough lighter (see the 168→150 KiB entry below) that 75 KiB stops being a
meaningful share of first load.

**Where to start:** `packages/viewer/src/inline/mathPreload.ts` (detection + preload) and
the `loading` tier in `packages/viewer/src/registry/bindings.ts`. Re-measure with
`pnpm --filter @activity/app exec playwright test --project=perf` — the spec prints the
fallback-window number directly.

**Context:** original residual from /plan-eng-review 2026-08-01 (S5 ruling S5-2); reframed
from a binary into three options by the S8 outside voice (2026-08-05, ruling D7); option 3
built and measured the same day.

## Get the student shell toward the 150 KiB gz target — SLICE 1 SHIPPED, then PARKED

**⚖ RULED 2026-08-18 (author, same day slice 1 landed): STOP THE LADDER HERE.** One rung
climbed, and the ladder is parked again — not because the remaining rungs are hard, but
because nothing currently justifies their cost. Do not start rung 2 without the trigger
below. This entry is a ledger again, as it was between 2026-08-15 and slice 1.

**The four reasons, recorded so the next session does not re-litigate them:**
1. **150 was never measured.** Ruling P1A *sketched* "~≤150 KiB gz"; `perf-budgets.mjs`
   says so in its own comment. Chasing the last ~6 KiB is chasing a number nobody
   derived from a device.
2. **Timing already beats its targets with room.** The throttled Chromebook-class lane
   at the time of the ruling: pre-auth 785 ms vs the 992 ms committed target (−21%),
   worksheet 870 vs 1135 (−23%), math-rendered 1604 vs 1812. The shell is not the
   bottleneck, so 6 KiB buys nothing a student would feel.
3. **The pressure that started slice 1 is gone.** It ran because the shell sat at ~96%
   of cap and the next shell-touching feature would have hit it. It now sits at ~91% of
   a *tighter* cap. Headroom is real again AND the budget is honest again — which was
   the actual win, more than the bytes.
4. **Slice 1 was uniquely cheap; the remaining rungs are not.** It deleted code that
   never executed: zero behavior change, zero risk to the student path. Every rung left
   trades correctness or blast radius for bytes — see the list below.

**⚑ THE TRIGGER TO RESUME — one thing, and it is not a byte count.** A real measurement
on real school hardware showing the SHELL is the bottleneck (the field-measurement entry
in this file). That is what should decide whether 150 means anything. Absent it, the
honest close is "re-baseline deliberately", not "chase the last rung".

**⚑ AND IF YOU DO RESUME: do not pick rung 2 off the list below.** Slice 1 changed the
composition of the entry chunk, so P10 applies — run a FRESH sourcemap attribution of the
current 156.4 KiB first and let it name the next lever. The list below was derived
against the 177.6 KiB shell and is already one slice stale. (Slice 1's own attribution is
what replaced the folklore 168 number; do it the same way.)

**SHIPPED — slice 1, the Supabase sub-clients (2026-08-18):**
[shell-slim-supabase.md](docs/design/shell-slim-supabase.md). `@supabase/realtime-js`
(+ phoenix) and `@supabase/storage-js` (+ iceberg-js) are aliased to inert stubs; the
one storage caller, `lib/uploadImage.ts`, makes its two calls as raw `fetch`.
**177.6 → 156.4 KiB gz (−21.2), and the cap tightened 185 → 172 in the same slice**
(ruling R6 — a cap left at 185 over a 156 shell is 18% slack, i.e. the fossil this
file's own budget policy warns about). Guarded by four absence rows in
`scripts/check-perf-budget.mjs` and by `scripts/tests/supabase-stub-pin.test.mjs`.

**THE LADDER'S REMAINING RUNGS — ALL PARKED** (ruling R7 — each is its own slice,
deliberately NOT folded into slice 1; and see the stale-list warning above):
1. **The zod audit.** `@activity/schema` parses in the shell, and the offline-restore
   path is parse-bearing — so this needs real thought about what may become a
   trust-the-bytes read and what must stay validated. Biggest remaining candidate.
2. **The router.** react-router v7's data APIs cost more than this app's route table
   needs; a swap is mechanical but touches every route file.
3. **Preact/compat.** Largest single win and largest blast radius (Tiptap, floating-ui
   and the whole editor ride on React); measure before believing.
4. **auth-js itself** (27.1 KiB gz, the biggest single line in the attribution). NOT a
   candidate the way realtime was: it runs constantly — session restore, refresh, the
   OAuth round trip. Hand-rolling it would be re-implementing security-relevant code
   the platform maintains. Listed for completeness, not as a plan.

**The measured position at the park (2026-08-18, both axes, re-measured against
`647fb8b~1` rather than quoted):** entry chunk **626.4 → 547.1 KiB raw** and
**177.6 → 156.4 KiB gz** — −79.3 raw, −21.2 gz. Raw is recorded on purpose: gz is what
the school Wi-Fi carries, raw is what a CPU-bound Chromebook has to parse, and this
project's throttling model says the second one is the half that hurts. ~6.4 KiB gz
separates the shell from the P1A sketch.

**Why the remainder is not slack:** the entry chunk is react-dom + react-router +
auth-js/postgrest + the viewer's eager block tier + StudentViewer + Home. The 3 MB of
editor weight already left in the S8 split.

**How to know if it worked:** `node scripts/check-perf-budget.mjs` prints the number
every run; lower `SHELL_JS_GZ_KIB` in `scripts/perf-budgets.mjs` deliberately when it
drops, so the win is locked in rather than silently re-spent. Slice 1 did exactly that
— do the same, in the same commit as the shrink.

**Context:** surfaced during the S8 build (2026-08-05) when calibration met the P1A
sketch; outside-voice finding 7 predicted the gap before it was measured. Slice 1's
attribution (2026-08-18, sourcemap-decoded) replaced the folklore 168 number with a
real per-library table — re-derive the same way before picking rung 2.

## Integration lane in CI (S9 Drop 5 deferral, DX ruling P6)

**What:** The `integration` Playwright lane (real `supabase start` stack, real
trigger/RLS/RPCs/Edge Functions — `packages/app/e2e/integration/`) is
LOCAL-ONLY by ruling: CI would need Docker-in-Actions + a supabase stack per
run, which the verify-runner's no-live-DB-in-CI posture deliberately avoided.

**Trigger to adopt:** the first regression that the integration lane catches
locally but CI missed — at that point the lane has proven it earns its CI
minutes; wire it as a separate workflow job with `supabase/setup-cli` +
`supabase start`, keyed E2E_INTEGRATION=1.

**Until then:** run `pnpm --filter @activity/app test:e2e:integration` before
cutover-adjacent pushes; the preflight prints named fixes on a cold machine
(verified 2026-08-14 — Docker-less run produced the exact fix text).

## ✅ RESOLVED 2026-08-14 (S9 Drop 5, D-9): offline reopen PROVEN — and the worker WAS broken

**The "Where to start" hunch below was right, twice over.** The server-stop
harness (an in-test child-process preview server killed mid-test —
`e2e/helpers/disposablePreview.ts`) reproduced the failure against a genuinely
dead server, and the diagnosis found a REAL product bug: static hosts send
`Vary: Origin` on assets (vite preview does; CDNs can) and `Cache.match`
HONORS Vary — parse-time `<script type=module>`/`<link>` requests carry a
different Origin-header shape than the stored key, MISS the cache, and hit
the dead network. That was the whole "fetch() 200s while parse-time dies"
mystery: page-script fetch happens to match the stored shape. Fix:
`matchOptions: { ignoreVary: true }` on the CacheFirst route (the assets are
content-hashed — the hash IS the identity), proven red→green. Two more
harness findings, both encoded in the un-parked rows' comments: a page that
ever carried `page.route` handlers blocks the worker from serving a
NAVIGATION even after `unrouteAll` (the reopen runs in a FRESH page — which
is also the honest student story), and a `fill()` racing a navigation loses
the debounced buffer write (the kill now waits until the buffer provably
holds the work). Both rows green 5/5 solo + 3/3 full-lane. The un-parked
rows in `sw/service-worker.e2e.ts` are the living record; the original
parking note survives in git history. Original entry kept below for the
reasoning trail.

**What (original):** Get the two parked rows in `packages/app/e2e/sw/service-worker.e2e.ts`
(`offline reopen`, currently `test.fixme`) running green, or establish that the
worker genuinely cannot serve a navigation offline and fix the worker.

**Why:** Offline reopen is ruling TV2-A's user-visible promise — a student who
opened an activity in class can open it again at home with no signal. Everything
around it is verified: the worker installs, claims the page, and handles both the
navigation and subresources online (`workerStart` non-zero for the entry chunk),
the precache holds index.html, assets land in `activity-viewer:cache:shell`, and
V6's per-user document cache holds the content. The promise itself is the one
part still unproven.

**What was already ruled out:** Playwright request routing (fails identically
with no interception at all), and the runtime route not matching (it matches
online). Under `context.setOffline(true)` the navigation returns 200 and the page
stays controlled, but parse-time subresource requests die with `net::ERR_FAILED`
while a `fetch()` for the same URL from page script resolves 200 moments later.
Aborting every route instead of emulating offline behaves the same.

**Where to start:** try stopping the preview server instead of emulating offline
(a real unreachable origin rather than an emulated one) — the emulation is the
prime suspect. If that reproduces the failure, the worker is at fault and
`packages/app/vite.config.ts`'s runtimeCaching is where to look; if it passes,
the harness needs the server-stop approach and the rows can be un-parked.

**Depends on:** nothing. Should land **before S9 cutover**, which is when
students actually meet this path.

**Context:** surfaced by /plan-eng-review's S6 build, V9 (2026-08-02).

## Question parameterization — different numbers per printed version

**What:** Templated question variants: the same authored question with per-version
parameter values ("solve 3x + 5 = 20" vs "solve 4x + 7 = 31"), so randomized print
versions (S5.5) differ in CONTENT, not just arrangement.

**Why:** S5.5's version feature shuffles arrangement only (MC choice order, matching
bank, ordering items). A teacher fighting copying gets far more from different numbers.
The author asked for this during the S5.5 eng review and explicitly deferred it as its
own arc (ruling D5, 2026-08-03).

**What it needs (why it's an arc, not a task):** schema for parameter definitions and
constraints; per-instance answer computation (the answer key must be derived, not
authored, for parameterized blanks/MC); editor UI for authoring templates; grading
implications if parameterized activities ever meet the live check path; print-version
seeds extended to select parameter instantiations deterministically.

**Depends on:** S5.5 shipped (version selector + deterministic seeds are the natural
substrate). Wants its own design pass + eng review.

**Context:** surfaced in the S5.5 /plan-eng-review (2026-08-03) when the author asked
whether "versions" meant different questions; ruled out-of-slice, captured here.

## Batch print: all versions + answer keys in one job

**What:** A "Print all versions" action producing ONE print job containing Version
1..N sheets (optionally each version's answer key appended), instead of N separate
print-dialog runs.

**Why:** A teacher printing 3 versions for a class runs 3–6 print dialogs today
(version × key). Real time-saver once versions see classroom use.

**How (sketch):** sequential `window.print()` calls are browser-blocked; the workable
shape is a composed multi-version document — render each version's worksheet
(offscreen, same capture path the foldable uses post-S5.5), concatenate into one
printable document with per-version page breaks. The foldable's compose/iframe
machinery is the pattern.

**Depends on:** S5.5's version feature shipping AND seeing real use — demand-triggered.

**Context:** surfaced in the S5.5 /plan-eng-review (2026-08-03, decision D22).

## Editor load path and the schema upgrade seam

**What:** When the first real schema migration lands in `packages/schema/src/upgrade.ts`,
check the EDITOR's activity-load path runs the upgrade seam before parsing drafts.

**Why:** S5.5 wires the seam into the teacher print route (ruling D23, 2026-08-03), but
the editor loads drafts the same direct way. Zero impact today (zero migrations exist);
the day migration #1 lands, an un-upgraded old draft would fail the editor's parse.

**Where to start:** the editor's load in `packages/app/src/routes/ActivityEditor.tsx`
(or wherever draft_content is parsed) — mirror what the S5.5 print route does.

**Depends on:** the first schema migration existing. Until then this is a no-op.

**Context:** surfaced in the S5.5 /plan-eng-review (2026-08-03, decision D23).

## Field measurement of student-interactive on real Chromebooks (post-S9, compliance-gated)

**What:** Collect real-user timings of the `performance.mark('student-interactive')`
mark (landing with S8) from actual student devices, once the compliance posture
allows it.

**Why:** S8's throttled lab lane is a proxy; the mark was deliberately designed so
lab and field speak the same vocabulary (S8 ruling D2/R2 — the mark contract is
additive-only precisely so historical comparison survives). Real Chromebook numbers
are the ground truth the lab run approximates.

**Hard gate:** this is data collection from students. The backlog already rules that
behavioral telemetry waits until (a) the census cannot answer a concrete question AND
(b) the compliance pack is amended. Performance timing is thinner than behavioral
telemetry but it is still collection — the same two-part gate applies. Do NOT ship
quiet student telemetry as a perf-slice side effect.

**Where to start:** the mark already exists (S8, viewer instrumentation); collection
would be a small beacon + an amendment to docs/compliance/. Scope the retention and
aggregation before any write path exists.

**Depends on:** S9 cutover (students on the viewer at scale) + the compliance-pack
amendment.

**Context:** surfaced in the S8 /plan-eng-review long-term audit (2026-08-05, T1
ruling; rulings in the gstack design doc → S8 section).

## Privacy-guard content hash (after the compliance-pack rewrite)

**What:** Strengthen the compliance-pack guard from string-presence (`toContain`) to a
content hash over the student-facing pack files + the rendered `Privacy.tsx` text,
pinned beside `POLICY_VERSION` — so wording and version can only move together.

**Why:** The current guard asserts presence only, and the S1 audit found the
assertion-text tests are tautologies (they compare the constant to itself) — a material
wording edit without a version bump passes everywhere, which defeats
`assertion_text_version`'s entire purpose (distinguishing wording generations on the
legal record). The 2026-08-06 eng review ruled the first real POLICY_VERSION bump
(B10/B11); after that rewrite the wording is finally load-bearing enough to deserve a
real guard.

**⚠ Sequencing (the reason this is a TODO and not part of the rewrite):** land it
AFTER the D2/D3 pack rewrite — hashing the current text would pin the drift the rewrite
exists to fix. Kept out of the rewrite commit itself so the legal-wording diff stays
reviewable by the author without mechanical guard noise (eng review D23).

**Bonus in the same visit:** delete the tautology tests (`classes.test.ts:108` and
friends) the hash guard supersedes; add a one-line howto in the test for re-pinning the
hash on a deliberate wording change (the friction is the feature).

**Where to start:** the presence-only guard the privacy-version test already runs;
`packages/app/src/lib/policyVersion.ts`; `docs/compliance/*.md`.

**Context:** eng review 2026-08-06 (D23), from s1-retro audit findings 9/12.

## Integration e2e lane into CI (post-S9)

**What:** Run the S9 integration Playwright lane (real local Supabase via
`supabase start`, password-users-through-the-real-trigger sessions) in GitHub
Actions — docker service + stack boot + `supabase db reset` + the lane.

**Why:** The lane is the only automated proof of the app↔function↔RLS wire
contract (the A1 check-URL bug class). Local-only means it proves things only
when someone remembers to run it.

**Why not at S9 (DX ruling P6, 2026-08-12):** CI adoption adds the arc's
flakiest new surface (2min stack boot, docker-in-CI) during the exact weeks the
cutover needs CI trustworthy — the same accepted posture as the verify runner's
no-live-DB-in-CI.

**Trigger:** first time the lane catches a regression locally that CI missed,
OR the first post-cutover slice that touches auth/RLS/RPC surfaces.

**Where to start:** `.github/workflows/ci.yml` (the e2e job's shape),
`packages/app/playwright.config.ts` (the integration project),
`supabase/config.toml` (local stack config). The lane's preflight already
prints its own prerequisites.

**Context:** S9 DX review 2026-08-12 (Pass 6 ruling P6); eng review T1 ruled
the session mechanism; docs/design/s9-cutover.md §9.

## Drop the dormant `assignments` table (Classroom-integration arc)

**What:** Drop `assignments` (and its indexes/policies) when the Phase 3
Google-Classroom arc re-derives assignment shapes.

**Why:** The table has ZERO app consumers (grep-verified 2026-08-09: nothing in
packages/app or packages/viewer references it), carries Google-Classroom text-id
columns from a never-built integration sketch, and after S9 Drop 3 its last SQL
consumer (the ingest RPC's token→assignment lookup) dies too. Dead schema misleads
every future reader — but dropping it touches `submissions` FKs, which the parked
teacher-grading slice hasn't ruled on, so S9 deliberately leaves it dormant
(s9-cutover.md D-2: "leave assignments dormant").

**Pros:** removes a whole dead subsystem from the schema. **Cons:** FK surgery on
`submissions`; pointless to do before the Classroom arc decides what replaces it.

**Depends on:** S9 Drop 3 landed; owned by the Phase 3 Classroom-integration arc.

**Where to start:** `supabase/migrations/0001_initial_schema.sql:150-169` (the
table), `0009:255` (index), `0002:169-176`/`0013:166-172` (policies);
`submissions.assignment_id` FK.

**Context:** S9 eng review 2026-08-12 (recon + D-2 ruling; TODO ask 2).

## Student Home cross-class recency cue ("New this week")

**What:** A recency indicator on the student Home activities list — e.g. a quiet
"New" marker on rows added in the last ~7 days — so a student in many classes can
find today's work without scanning every class section.

**Why:** The S9 Drop 2 design ruled per-class newest-first as the complete v1
answer (DR-11, 2026-08-13): students launch with 1–2 classes, and an unvalidated
recency heuristic would be decoration. Past ~3 classes the scan cost becomes
real; this entry is the named lever so the gap is a decision, not a bug report.

**Trigger:** real multi-class usage exists (students in 3+ classes with active
sharing), or a student/teacher asks how to find "what's new".

**Pros:** one glance answers "what's new"; no layout change (a marker on
existing rows). **Cons:** "new since when?" needs a definition (added-at age vs
last-visit tracking — the latter is new per-student state); an age-based marker
lies to a student who already did the work.

**Where to start:** `packages/app/src/routes/Home.tsx` (StudentHome list rows);
`list_class_activities` already returns `added_at`, so an age-based v1 needs no
schema change. The design record is docs/design/s9-cutover.md §10 (DR-11) + the
v2 board annotations.

**Context:** S9 Drop 2 design review 2026-08-13 (issue 11 / OV-23b; ruled 11A —
record v1 as deliberate + name the lever).

## Cap-lifting admin surface for attested teachers (0033 R3 follow-on)

**What:** A way to raise or clear the self-serve teacher caps without hand-written
SQL. Migration 0033 caps an attested (non-allowlist) teacher at **5 classes and
50 members per class**; `users.teacher_caps_exempt` lifts both. Today the author
lifts it with a one-row UPDATE.

**Why it is here and not still in §7:** the caps are LIVE and they bind a real
person the first time an outside teacher hits one. §7 deferred the UI on "waits
for the second real teacher", which is correct — what that reasoning does not
cover is the moment BEFORE the UI exists, when a legitimate teacher is blocked
mid-lesson and the only remedy is the author at a SQL prompt. That is a support
path, not a feature, and it should be a known one.

**Trigger:** the first attested teacher who is not the author — i.e. the first
time `teacher_caps_exempt` matters to somebody who cannot edit the database.

**Where to start:** the caps are enforced in 0033's audited create/join paths;
`scripts/verify-0033.sql` has the liveness rows that fire both caps at production
values, so any change has a working proof harness already. The interim runbook is
one UPDATE on `users.teacher_caps_exempt` — worth writing into the support notes
before it is needed rather than during.

**Watch:** lifting a cap is the one action that converts a self-attested stranger
into an unbounded teacher. Whatever the surface becomes, it should stay an author
action with an audit row, not a self-service button.

**Context:** docs/design/admission-model.md §5b R3 + §7; eng review OV-9.

## Under-13 support — the age gate and school-consent enrollment (D7)

**What:** The arc that would let a class with students under 13 use the platform:
a student-facing age gate (the Khan-style birthdate-before-anything pattern) plus
a school-consent enrollment mechanism that actually carries COPPA's school-consent
exception, rather than excluding under-13s outright.

**Why it is here:** v1 excludes under-13 use entirely, and the ONLY thing carrying
that exclusion is the teacher's per-class "every student in this class is 13 or
older" assertion. Students are never asked their age. That is a real dependency on
a teacher's accuracy, disclosed in the pack, and it is the single most likely thing
for counsel to push back on (it is Q4 of the counsel packet). If the answer comes
back "teacher assertion is not enough", this stops being a deferred arc and becomes
required work — so it needs an entry that a session can pick up cold.

**Trigger:** the D24 counsel read answering Q4 against the current design, OR a
teacher asking for a 6th/7th-grade class.

**Scope sketch (not a design):** birthdate gate before auth; a parent-consent
branch for independent learners; school-consent enrollment for school users; the
compliance pack rewritten around consent rather than exclusion; the
`school-authorization-template.md` checkbox that currently reads "not available in
v1" becomes live. Gimkit's and Khan's published wording are the closest models —
both were read and quoted in the design doc.

**Do NOT half-build it.** The current posture is coherent (exclude, say so
plainly). A birthdate gate WITHOUT the consent mechanism behind it would collect
ages from children while still refusing them, which is worse than either end state.

**Context:** docs/design/admission-model.md §5a D7 + §7; docs/compliance/
counsel-review-packet.md Q4.

## Signable DPA template for the first district

**What:** A data-processing agreement the author can actually put in front of a
district, rather than assembling one under time pressure during a first adoption
conversation.

**Why it is here:** Illinois SOPPA, NY Ed Law 2-d and their siblings require
signed per-district agreements for school-directed services — this is statutory,
not a nicety, and no gate design avoids it. §7 defers the template to "the first
district that asks (with counsel)", which is the right sequencing but a bad
surprise: the first district that asks will be mid-conversation, and the delay is
visible to them. The cheap version of this is to know, before that call, which
regime applies and what the template must contain.

**Trigger:** the D24 counsel read (Q7 asks exactly this — should a template exist
BEFORE the first outside teacher, or is on-demand right?), or the first district
conversation, whichever comes first.

**Where to start:** `docs/compliance/school-authorization-template.md` is the
teacher-facing half and already exists; the DPA is the district-facing half and
does not. The SDPC registry is the usual source of standard forms. This one is
genuinely counsel-led — the repo-side contribution is the data map, which is
current as of 0033 and is what a DPA's schedule is built from.

**Context:** docs/design/admission-model.md §5 item 5 + §7; docs/compliance/
counsel-review-packet.md Q7.

## Student feedback discoverability (the promise's second half)

**What:** A quiet indicator on the student Home / activity list when released teacher feedback
exists that the student hasn't seen — e.g. a "Feedback" marker on the activity row.

**Why:** The teacher-grading slice's readback is pull-only: a student only finds released
feedback by spontaneously reopening a finished worksheet. The outside voice's sharpest strategic
point (2026-08-15): "Recorded — your teacher will review" completes in PRACTICE only when the
review's OUTPUT is findable. Without this, released feedback mostly goes unread.

**Design-together constraint:** "unread" needs either a seen-marker (new per-student state) or an
age heuristic — the same fork as the "Student Home cross-class recency cue" entry above (DR-11).
Design the two indicators together; two separate marker systems on the same list rows is the
twin-drift class.

**Trigger:** the first real released feedback (i.e. the teacher-grading slice live with a real
class), or the recency-cue entry's own trigger firing — whichever first.

**Where to start:** `list_class_activities` (0030) already returns the student's rows; a derived
"has unread released feedback" flag is a join against `check_grades.released_at`. The no-new-state
v1 is age-based ("released since your last check"), which lies less than it sounds because
re-checking is the natural reaction to reading feedback.

**Context:** docs/design/teacher-grading.md (Why-now + G5); outside-voice finding #14, ruled
2026-08-15 (TODO, not slice scope).

## Retire the `submissions` table (the last 0029 survivor)

**What:** A housekeeping migration dropping `submissions` (and its 0005/0007 attempt machinery),
removing purge_soft_deleted's step 2, and running the P5 citation audit over everything that
names the table.

**Why:** 0029 kept `submissions` + `grades` empty "for the parked teacher-grading slice to
re-decide." That slice re-decided 2026-08-15: grading is checks-native, `grades` +
`can_grade_submission` die in 0034 — which leaves `submissions` with NO future consumer: an
empty table with live RLS whose only remaining reader is the purge function.

**Why NOT bundled into 0034 (author-ruled 2026-08-15):** dropping it means rewriting
`purge_soft_deleted` a third time — blast radius on the nightly cron — and it sits nowhere on
the grading slice's path. The purge function deserves its own careful commit.

**Trigger:** 0034 applied live + one green nightly purge run after it (proving nothing re-keyed
onto submissions).

**Where to start:** 0029's header (what deliberately survived and why), 0022+0029 for the purge
function's history, `scripts/verify-*` for every row that asserts the table exists. Remember the
0009 discipline: the FK-covering indexes die with it.

**Context:** teacher-grading eng review 2026-08-15 (G1 scoping + TODO ruling); 0029's D-6 note.

## Activities list surface — search/sort/grouping (the taxonomy slice's sibling)

**What:** The real list navigation for `/activities`: search-by-title, sort control, grouping/faceting on course/unit/`pedagogical_role`, pagination or virtualization if needed. The taxonomy slice ships only minimal tag-filter chips (eng review 2026-08-18, R6/D8 — the P1 caller, deliberately small).

**Why:** [Activities.tsx](packages/app/src/routes/Activities.tsx) is a flat unsorted `<ul>` — fine at 8 activities, unusable at the ~150 the catalogue push will create. Every authoring hour flows through this surface.

**Context:** ✅ **DESIGN RULED 2026-08-18** — full /plan-design-review (7 passes, wireframes, D3–D11): grouped-by-unit outline, recent strip, flat separated rows, drafts chip, `/`-search, scroll restoration, a11y spec. **[activities-list-surface.md](docs/design/activities-list-surface.md) is the build input — inherit, don't re-derive**; its §7 tasks T1–T6 are the slice. All facet inputs already live (taxonomy arc).

**Effort:** M (design settled — build only)
**Priority:** P2
**Depends on:** the taxonomy slice (Drop 1) landing.

## Refresh capability-inventory.md against the post-registry importer (ride Drop 2)

**What:** Update [docs/capability-inventory.md](docs/capability-inventory.md): §1's fence count (says 13, is 16 — `callout`/`reference`/`definitions` landed), §2.11 (`callout` is no longer editor-only), §4.B's importable-gaps list, and — once the taxonomy arc's Drop 2 lands — the new `meta` fence (which §3 currently declares impossible: "no activity-level settings are expressible in pasted markdown").

**Why:** The doc presents itself as code-derived truth with file:line citations; the 2026-08-18 taxonomy eng review had to re-verify its claims against code because several had silently gone stale. Stale citations are worse than no doc (the repo's own stale-diagram principle; P11 for coverage claims).

**Context:** Pin the refresh to the taxonomy arc's Drop 2 commit (the `meta` import fence), which touches the same three artifacts (parser/prompt/format doc) — refreshing before that commit would need doing twice. See [activity-taxonomy.md](docs/design/activity-taxonomy.md) §3.

**Effort:** S
**Priority:** P3
**Depends on:** taxonomy arc Drop 2 (the `meta` fence).

## React "state update on a not-yet-mounted component" from both editors' onCreate

**What:** Both Tiptap editors call a React state setter from `onCreate`, which Tiptap fires during the render phase — before React has committed the mount. Every first mount of an editor route logs `Can't perform a React state update on a component that hasn't mounted yet. This indicates that you have a side-effect in your render function…`. Decide whether to fix it or to record it as accepted, but stop leaving it unexplained.

**Why:** It is a real React warning on the primary authoring surface, and right now nobody knows whether it is benign. That ambiguity is the cost: the next person to see it in the console has to re-derive the whole thing before they can rule out that it is the cause of whatever they are actually debugging. (Found 2026-08-18 during the taxonomy slice's browser verification; **confirmed pre-existing** by checking out the pre-slice files and reproducing the identical warning, so it is not taxonomy fallout.)

**Context — the exact source, already traced, do not re-derive:**
- Stack bottoms out at `packages/app/src/editor/ReferencePanelEditor.tsx:128-130` — `onCreate: ({ editor }) => { onUpdate(editor.getJSON()); }` → `handlePanelUpdate` in ActivityEditor → `setPanelJson`.
- `packages/app/src/editor/Editor.tsx:107-109` has the **identical shape** (`onCreate` → `onUpdate?.` → `setTiptapJson`), so this is not dev-bench-only — it fires on the real `/activity/:id` route too. Reproduce on `/dev/config-drawer`, which is the cheapest surface (no auth, no Supabase).
- It warns **once per lazy chunk's first mount**: revisiting the route after the chunk is warm logs nothing, which is why it is easy to miss and why a naive "reload and check" shows a clean console.

**⚠ The trap — this is NOT a free "move it to useEffect":** that `onCreate` call is load-bearing for the autosave baseline. `changeKey` gates on `panelJson` precisely so the fingerprint settles only once BOTH editors have reported their loaded content (see the comment on `handlePanelUpdate`). Deferring the first report to an effect changes WHEN the baseline settles, and getting it wrong produces either a spurious load-time save or a missed first edit. Any fix needs the autosave baseline tests (and `activityChangeKey.test.ts`) to stay green, plus a check that opening an activity and immediately closing it still writes nothing.

**Pros:** Removes a real warning from the primary authoring surface; makes the console trustworthy again for debugging real defects.
**Cons:** Touches the autosave baseline settle, which is delicate and has bitten before; the warning appears to be cosmetic today, so the fix carries more risk than the symptom.

**Effort:** S (investigate + decide) / M (if the fix touches the baseline)
**Priority:** P3
**Depends on:** None.

## Remove the dead `problem` block (ride the next schema-changing slice)

**What:** Delete `problem` from schema, viewer (Problem.tsx, registry, bindings), sanitizer types, and the grading corpus row — with a P5 claims-grep for every comment citing it before deletion.

**Why:** E1 of the answer-key eng review (2026-08-19, [problem-answer-key.md](docs/design/problem-answer-key.md)) ruled the block stays dead: the editor has NEVER been able to hold one ([serialize.ts](packages/app/src/lib/serialize.ts) drops it with a warning), no fence produces one, and its paper-problem job now belongs to the extended `short_answer`/`essay`. What remains is a zombie that renders in the viewer and looks alive to any future session — the resurrection-path hazard OV-DX-2 names.

**Pros:** One less block type in schema/sanitizer/registry/grading to reason about; the E1 tombstone becomes temporary.
**Cons:** A `packages/schema` change, so it pays the bundle-regeneration round — which is why it should RIDE a slice already paying it, never stand alone.

**Context:** Registry calls it "numbered legacy prose problem" (registry.ts:133). The corpus is empty of them (nothing could ever author one). The answer-key review deliberately did NOT fold this into its own slice — deletions deserve their own focus (the S9 lesson).

**Effort:** S · **Priority:** P3 · **Depends on:** the next slice that regenerates the server bundles anyway.

## Answer/solution editing UI in FreeResponseView

**What:** Inline-content editors for the `answer`/`solution` fields on short_answer/essay blocks (E10 of the answer-key review ships READ-ONLY display only).

**Why:** Until it exists, fixing an answer typo = edit the .md file → re-import. Correct while the markdown corpus is the source of truth; a wall the moment an activity is authored editor-natively with no backing file (a future co-teacher without a markdown workflow — the Activity Bank's multi-author future).

**Pros:** Self-contained in-app authoring of answer keys.
**Cons:** An InlineNode editing surface — real editor work — building a second authoring path while the file-based one is primary.

**Context:** The fields ride Tiptap attrs (the rubric pattern); T2 of the review's task list adds the attrs + read-only display. **Trigger to build:** editor-native authoring of free-response answers becomes a real path.

**Effort:** M · **Priority:** P3 · **Depends on:** answer-key slice T2 (attrs + serialize round-trip).
