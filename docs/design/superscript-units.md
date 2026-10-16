# Superscript units on blanks — m² ≡ m^2 ≡ m2, and a way to type ²

**Status:** RULED 2026-10-16 (SU-1 to SU-7, all as recommended) → ENG REVIEW
(this file is also the review record; the report is the last section).

## The problem (investigation, 2026-10-16)

A blank is a plain `<input type="text">` ([FillInBlank.tsx](../../packages/viewer/src/blocks/FillInBlank.tsx)).
Nothing on screen lets a student type `²`, and phones and Chromebooks have no
easy way to. Answers that need a unit with an exponent (m², cm³) look
impossible to answer.

What the live system does today (read 2026-10-16, live `activity_versions`):

- Four published 710 activities carry squared or cubed unit blanks
  (`act.measure.area-rect-triangle`, `area-composite`, `volume-cuboid`,
  `perimeter-area-volume`). Their authored alternates already list `m2`,
  `m^2`, `sq m` and so on, so a student who types `28 m2` IS marked correct
  today. That is the curriculum side's hand-listing, not the platform:
  [units.ts](../../packages/viewer/src/server/grading/units.ts) `normalizeUnit`
  only lowercases, collapses spaces and unifies `·`.
- Nothing tells a student they may type `m2`. The `!unit-missing` feedback says
  "write the unit, m²", a glyph they cannot type. The only "typed cm3" hint
  arrives after a wrong answer.
- A mistake entry written with `²` misses the typed spelling: `!22 m² ::` in
  `05-perimeter-area-volume.md:151` does not match a student's `22 m2`, so
  that misconception is not sensed.
- No alternate list carries US spellings (`meters`, `square meters`).
- Print: the blank is a bare underline; the answer key prints the canonical
  unit (`28 m²`), and every 710 file lists the `²` form first.

## Rulings (author, 2026-10-16)

- **SU-1 — Canonicalize in grading.** Unit matching folds `²`→`^2`, `³`→`^3`,
  and a letter followed by `2` or `3` at the end of a unit token to `^n`
  (`m2`, `cm3`, `m/s2`). Applied to BOTH sides, so nothing accepted today
  becomes wrong. Only `²` and `³`; `⁻¹` waits for an activity that needs it.
- **SU-2 — Mistake matching runs two passes:** today's exact normalization
  across all entries first, then the canonical form. Keeps 710's
  spelling-specific feedback ("typed cm3") firing for the spelling typed, and
  starts catching `22 m2` against `!22 m²`.
- **SU-3 — ² and ³ insert buttons on EVERY numeric blank, shown only while the
  blank has focus.** Not only on unit blanks: showing them there would tell the
  student a unit is needed and kill the `unit-missing` diagnostic. Inserts at
  the caret, labelled for screen readers, works offline, hidden on print,
  shell size measured against the 156.5 KiB stop line.
- **SU-4 — The buttons insert the `²` glyph** (matches the prose; grades the
  same as `m2` after SU-1).
- **SU-5 — Keep case-folding.** It merges `mm`/`Mm`, `mg`/`Mg`, `mL`/`ML`; no
  catalogue file distinguishes units by case. TODO with trigger: the first
  authored unit that differs from another only by case.
- **SU-6 — US spellings are filed with the curriculum side, not fixed here**
  (a meter≡metre table is the unit registry the unit-blank design ruled out).
- **SU-7 — Curriculum-facing surfaces:** edit the matching sentence in
  `markdownImportPrompt.ts` and `markdown-import-format.md`, run
  `pnpm prompt:catalogue`, refresh the Notion stamp, send B-184 after the push
  (alternates no longer needed, the three-variant mistake entries can become
  one, US spellings missing). Capability facts do not change.

## Working plan (as ruled, before review)

1. `units.ts`: add the canonical fold (SU-1); `unitAccepted` compares canonical.
2. `blanks.ts` `matchMistakeEntry`: two-pass authored-match loop (SU-2).
3. `FillInBlank.tsx` + `viewer.css`: focus-only ² ³ insert buttons on numeric
   blanks (SU-3, SU-4).
4. Tests: `grading-primitives.test.ts` rows, walk-level `grading-section`
   cases, a viewer component test for the buttons; mutation-test each.
5. `pnpm bundle:grading-server`, committed same-commit. No sanitizer change,
   so the viewer-server bundle does not move.
6. Docs + prompt regeneration (SU-7); TODOS entry (SU-5).
7. Fable review, then the author redeploys `check-activity`
   (`pnpm deploy:check`, never `--no-verify-jwt`); hash-verify the deployed
   bundle; push; B-184.

No migration. No wire change. No sanitizer change.

## Eng review (2026-10-16)

**Target:** this file's working plan (SU-1 to SU-7). **Scope record:** feature
answers: SU-1..SU-7 (author, 2026-10-16, "1–7 all as recommended"); structure:
A Original arrangement (D1, 2026-10-16); accepted scope: the working plan
above; pending remedies: R1–R3, R4 (TODO). **Scope Challenge: scope accepted
as-is.**

### Reality rows

- REALITY: premise-table pass — 6 premises, 0 unverified: plain input (FillInBlank.tsx:96), normalizeUnit lowercases only (units.ts:52-58), live 710 alternates list m2/m^2 (live activity_versions, area-composite), `!22 m²` misses `22 m2` (blanks.ts:366-370 compares normalizeUnit), restore returns stored verdicts (check-activity-handler.ts:428-430), table cells render their own input (Table.tsx:163).
- REALITY: already-done pass — `git log origin/main --since=2026-10-15` on grading/, blocks/, the format doc: no hits; no "superscript" commit touches blanks (79258622/bd7e1c60 are the prose superscript MARK, stage 9e).
- REALITY: surface-check pass — `bundle:grading-server`, `deploy:check`, `prompt:catalogue`, `verify` all in package.json:10-18.
- REALITY: binding-decisions pass — no prior branch decision touches unit matching; unit-bearing-blanks.md D2 (one input, nothing prompts the unit) is honoured by SU-3's every-numeric-blank rule.
- REALITY: numbers finding — shell headroom is [re-measure before gate]: stop line 156.5 KiB (perf-budgets.mjs:151), last measured 151.82 on 2026-10-04 (perf-budgets.mjs:145); growth since is unmeasured. File count ~9 [estimated].
- REALITY: deferred-asks pass — the author's five asks (catalogue, input, grading, print, curriculum surfaces) are all answered in the investigation; text-blank superscripts are deferred as R4 with a reason.
- REALITY: pr-count n/a — this repo commits to main; the author pushes. One commit series.

### Section 1 — Architecture

- [P2] (confidence: 9/10) packages/viewer/src/blocks/Table.tsx:163 — a blank in a table cell renders its OWN `<input className="viewer-blank__input">`, not FillInBlank's. SU-3 names only FillInBlank.tsx, so the ² ³ buttons would be missing from every table-cell blank: the repo's orphan class (a feature wired on one surface and not the other). → R1.
- [—] (confidence: 9/10) packages/viewer/src/server/check-activity-handler.ts:428 — "The stored verdicts are returned as recorded". Restore cannot flip a past verdict when the new matching lands. No finding; recorded so nobody re-checks it.
- [P3] (confidence: 8/10) units.ts:57 `.replace(/\s*([/*^])\s*/g, '$1')` — the superscript fold must run BEFORE this collapse, so `m ²` → `m ^2` → `m^2`. Necessary implementation of SU-1; no question.
- [P3] (confidence: 8/10) blanks.ts:366-370 — SU-2's exact pass needs today's `normalizeUnit` unchanged; the fold goes in a second function (`canonicalUnit`) that `unitAccepted` and the second pass use. Necessary implementation of SU-1/SU-2; no question.

Dispositions: R1 pending (D2); the two P3s are carried as required implementation of SU-1/SU-2.

## Decision ledger

### R1: shared blank input for FillInBlank and Table cells
Finding: 1, P2, 9/10, packages/viewer/src/blocks/Table.tsx:163, Claude (Section 1)
Plan baseline: SU-3 (author 2026-10-16): buttons on every numeric blank; working plan step 3 names FillInBlank.tsx only
Runtime evidence: FillInBlank.tsx:96-111 and Table.tsx:163-180 each render the same input (same class, readOnly rule, size, verdict attrs, onChange); FillInBlank adds the feedback span
Comparison grid:
| Choice | Current | A | B |
|---|---|---|---|
| R1 where the helper lives | FillInBlank only (plan) | new BlankInput component, used by FillInBlank and Table | the helper code written into both files |
| SU-3 buttons on every numeric blank | approved | kept, incl. table cells | kept, incl. table cells |
| R2 tab stops | pending | pending | pending |
| R3 layout | pending | pending | pending |
Question D2:
D2 — Where should the ² ³ buttons live so table-cell blanks get them too?
Project/branch/task: activity-platform on main, superscript units plan.
ELI10: A blank inside a table cell is drawn by Table.tsx, which has its own copy of the text box. If the buttons go only into FillInBlank.tsx, students answering in a table get no ² key, the same "built in one place, missing in the other" bug this repo has hit eight times. Either one shared box component both use, or the same code pasted into both.
Stakes if we pick wrong: a pasted copy drifts, and the next blank feature lands in one surface only.
Recommendation: A because one component makes "every numeric blank" true by construction and its test covers both surfaces.
Completeness: A=10/10, B=8/10
Pros / cons:
A) Shared BlankInput (recommended)
  ✅ One component, one test: table and sentence blanks cannot drift apart again
  ✅ Removes ~20 duplicated lines of input wiring from Table.tsx
  ❌ Touches Table.tsx, a stable file, and adds one new file (human: ~2h / CC: ~15min)
B) Paste into both files
  ✅ Smallest diff in each file; no new component to name or import
  ❌ Two copies of focus, caret and insert logic that must be kept in step by hand
Net: one shared component costs one file and removes a known drift risk.
Header: Blank input
Options:
A) Shared BlankInput (recommended)
New packages/viewer/src/blocks/BlankInput.tsx renders the input plus the focus-only ² ³ buttons; FillInBlank.tsx and Table.tsx both use it (each keeps its own aria-label, sub-label and feedback). One component test covers both surfaces. Effort human ~2h / CC ~15min.
B) Paste into both files
Write the button, focus and caret code into FillInBlank.tsx and Table.tsx separately, each with its own test. No new file. Effort human ~2h / CC ~15min.

State: approved
Actual answer: A) Shared BlankInput (D2, author, 2026-10-16)
Accepted scope: new packages/viewer/src/blocks/BlankInput.tsx (input + focus-only ² ³ buttons); FillInBlank.tsx and Table.tsx both render it, each keeping its own aria-label, sub-label and feedback; one component test covers both surfaces
History: none

### Section 2 — Code quality

- [P2] (confidence: 8/10) FillInBlank.tsx:96 (proposed BlankInput) — SU-3 says buttons show "while the blank has focus". If visibility follows the INPUT's focus, a keyboard user who presses Tab to reach ² blurs the input and the button vanishes under them. The visibility rule must follow focus anywhere inside the blank's wrapper (focus-within), and an insert must return focus to the input with the caret after the new character. That part is necessary implementation of SU-3's "caret-preserving, labelled". Whether the buttons are Tab stops at all is a separate choice. → R2.
- [P2] (confidence: 7/10) viewer.css:734 `.viewer-blank__input` sits inside a `<p>` — buttons rendered inline would push the rest of the sentence along the line the moment the blank gains focus, on a phone at the same moment the keyboard slides up. → R3.
- [P3] (confidence: 8/10) FillInBlank.tsx:100 `readOnly={mode === 'print' || keyAnswer !== undefined}` — no buttons when the input is read-only (print, answer key). Necessary implementation of SU-3 ("hidden on print"); no question. A locked/frozen section's controls are disabled by their fieldset, which disables the buttons with them.

Dispositions: R2 pending (D3), R3 pending; the P3 is carried as required implementation of SU-3.

### R2: are the ² ³ buttons Tab stops?
Finding: 2, P2, 8/10, FillInBlank.tsx:96 (proposed BlankInput), Claude (Section 2)
Plan baseline: SU-3 (author 2026-10-16): focus-only, caret-preserving, labelled; tab behaviour unspecified
Runtime evidence: none (proposed code). Repo context: TODOS → "Canvas keyboard stops" already flags tab-stop cost on full worksheets
Comparison grid:
| Choice | Current | A | B |
|---|---|---|---|
| R2 tab stops | unspecified, pending | buttons are Tab stops only while focus is inside that blank (input → ² → ³ → next blank) | tabIndex -1 everywhere; keyboard users type ^2 or 2 |
| R1 shared BlankInput | approved (D2) | kept | kept |
| SU-3 focus-within visibility + focus returns to input after insert | approved (SU-3) | kept | kept |
| R3 layout | pending | pending | pending |
Question D3:
D3 — Should keyboard users be able to Tab onto the ² ³ buttons?
Project/branch/task: activity-platform on main, superscript units plan.
ELI10: A student using only a keyboard (or a switch device) presses Tab to move around. If the ² button is a Tab stop, they can reach it like any button; it only exists while they are inside that blank, so it adds two stops per blank they visit, not per blank on the page. If it is not a Tab stop, mouse and touch users get it and keyboard users must know to type m2 or m^2, which SU-1 now accepts.
Stakes if we pick wrong: either keyboard-only students have no visible way to type ², or every blank they pass costs two extra Tab presses.
Recommendation: A because a control a keyboard user cannot reach fails WCAG 2.1.1, and the cost is only paid inside the blank being answered.
Completeness: A=10/10, B=7/10
Pros / cons:
A) Tab stops inside the blank (recommended)
  ✅ Every student can reach the button the same way; meets WCAG 2.1.1 keyboard access
  ✅ Costs nothing on blanks the student is not in, so the full-page tab count barely moves
  ❌ Two extra Tab presses to leave a numeric blank you are typing in (human: ~1h / CC: ~10min)
B) Pointer only
  ✅ No extra Tab presses at all; keyboard flow through a worksheet is unchanged
  ❌ Keyboard-only students see a button they cannot operate and must know to type m2
Net: a little extra tabbing inside one blank buys equal access.
Header: Tab stops
Options:
A) Tab stops inside the blank (recommended)
While focus is inside a numeric blank, Tab goes input → ² → ³ → next control; Shift+Tab reverses. Buttons disappear when focus leaves the blank. Pressing one inserts at the remembered caret and returns focus to the input. Effort human ~1h / CC ~10min.
B) Pointer only
Buttons get tabIndex -1: tap and click insert at the caret, but Tab skips them. Keyboard users type m2 or m^2, which SU-1 accepts. Effort human ~1h / CC ~10min.

State: approved
Actual answer: A) Tab stops inside the blank (D3, author, 2026-10-16)
Accepted scope: while focus is inside a numeric blank, Tab goes input → ² → ³ → next control (Shift+Tab reverses); buttons disappear when focus leaves the blank; an insert uses the remembered caret and returns focus to the input
History: none

### R3: where the buttons draw
Finding: 3, P2, 7/10, packages/viewer/src/styles/viewer.css:734 (input sits inside a <p>), Claude (Section 2)
Plan baseline: SU-3 (author 2026-10-16): focus-only buttons; placement unspecified
Runtime evidence: none (proposed code). FillInBlank.tsx:72 renders blanks inside `<p className="viewer-blanks__body">`
Comparison grid:
| Choice | Current | A | B |
|---|---|---|---|
| R3 layout | unspecified, pending | small tray positioned just below the input, over the next line; the sentence never moves | buttons inline after the input; the rest of the line shifts right while focused |
| R1 shared BlankInput | approved (D2) | kept | kept |
| R2 Tab stops inside the blank | approved (D3) | kept | kept |
Question D4:
D4 — Should the ² ³ buttons float under the blank, or sit inline in the sentence?
Project/branch/task: activity-platform on main, superscript units plan.
ELI10: The blank is a word-sized box in the middle of a sentence. If the buttons appear inline, the words after the blank jump sideways the moment the student taps in, on a phone at the same moment the keyboard slides up, and they can wrap the line. A small tray drawn just under the box leaves the sentence still; it briefly covers part of the line below.
Stakes if we pick wrong: inline makes text jump under the student's finger; the tray covers a few words below while they type.
Recommendation: A because nothing should move under a student who is typing (the same rule as no reload under a working user).
Note: options differ in kind, not coverage — no completeness score.
Pros / cons:
A) Tray under the blank (recommended)
  ✅ The sentence and the page never shift when a student taps into a blank
  ✅ Same position in a paragraph and in a table cell, so one style serves both surfaces
  ❌ Covers a few words of the next line while the blank is focused (human: ~1h / CC: ~10min)
B) Inline after the blank
  ✅ Nothing is ever covered; the buttons read as part of the line
  ❌ The rest of the line jumps and may wrap each time focus enters or leaves a blank
Net: a tray that covers a little beats a sentence that jumps.
Header: Button place
Options:
A) Tray under the blank (recommended)
The buttons draw in a small tray positioned just below the input (absolute, inside the blank's wrapper), so the sentence and table never reflow. Same in paragraphs and table cells. Effort human ~1h / CC ~10min.
B) Inline after the blank
The buttons render in the line right after the input; the rest of the sentence moves over while the blank has focus. Effort human ~1h / CC ~10min.

State: approved
Actual answer: A) Tray under the blank (D4, author, 2026-10-16)
Accepted scope: the ² ³ buttons draw in a small tray positioned just below the input (absolute, inside the blank's wrapper), so neither a sentence nor a table reflows; same style in paragraphs and table cells
History: none

- [P2] (confidence: 9/10, raised after D4) packages/viewer/src/styles/viewer.css:772-774 `.viewer-table { overflow-x: auto; }` — CSS computes `overflow-y` to `auto` whenever `overflow-x` is not `visible`, so a tray drawn below a blank in a table's LAST row is clipped (or makes the table scroll vertically). On a phone the on-screen keyboard also covers whatever sits just below a focused input near the bottom of the view. D4's tray needs a rule for "no room below". → R4.

### R4: where the tray goes when there is no room below
Finding: 4, P2, 9/10, packages/viewer/src/styles/viewer.css:772-774, Claude (Section 2, after D4)
Plan baseline: D4 approved: tray just below the input, same in paragraphs and table cells, nothing reflows
Runtime evidence: `.viewer-table { overflow-x: auto; }` (viewer.css:773); CSS overflow rule makes the y axis clip too. Keyboard overlap is unverified on a real device (none available; TODOS device checks)
Comparison grid:
| Choice | Current | A | B | C |
|---|---|---|---|---|
| R4 no-room rule | unspecified, pending | on focus, measure room below inside the nearest clipping box and the visual viewport; if short, draw the tray ABOVE the input | always draw the tray above the input | render the tray in a portal on <body> with fixed position, tracking scroll |
| R3 tray, no reflow | approved (D4) | kept | kept (above instead of below) | kept |
| R2 Tab order input → ² → ³ | approved (D3) | kept | kept | kept only with extra focus wiring (portal is outside the blank in the DOM) |
Question D5:
D5 — When there is no room under a blank (last table row, phone keyboard), where does the ² ³ tray go?
Project/branch/task: activity-platform on main, superscript units plan.
ELI10: Tables on narrow screens scroll sideways, and a browser box that scrolls sideways also cuts off anything poking out of its bottom. So a tray under a blank in a table's last row would be chopped off. On a phone the keyboard can also cover the space right under the box you are typing in. The tray needs a fallback: flip above when there is no room, always sit above, or be lifted out to the top of the page.
Stakes if we pick wrong: the buttons are invisible exactly where a student needs them, or the code to place them grows fragile.
Recommendation: A because it keeps the tray below in the common case and only flips when it would be hidden, with no change to Tab order.
Completeness: A=10/10, B=8/10, C=9/10
Pros / cons:
A) Flip above when short (recommended)
  ✅ Common case unchanged; last table row and keyboard-covered blanks still show the tray
  ✅ Tray stays inside the blank's wrapper, so the approved Tab order holds as is
  ❌ One measurement on focus to maintain and test, in both lanes (human: ~2h / CC: ~20min)
B) Always above
  ✅ No measurement code at all; one fixed position everywhere
  ❌ Covers the line above, including a table's header row, and the first row of a header-less table clips the same way
C) Portal on the page
  ✅ Never clipped by any container the blank sits in
  ❌ Must follow scrolling and re-wire Tab order across the DOM, the most code and the most to go wrong
Net: a small measurement buys a tray that is visible everywhere without touching focus order.
Header: No room below
Options:
A) Flip above when short (recommended)
On focus, measure the space below the input inside the nearest clipping container and the visual viewport; if the tray would not fit, draw it above the input instead. The tray stays in the blank's wrapper; Tab order is unchanged. Effort human ~2h / CC ~20min.
B) Always above
Draw the tray above the input in every case; no measurement. Covers the line or header row above; a header-less table's first row clips. Effort human ~1h / CC ~10min.
C) Portal on the page
Render the tray into <body> with fixed position, re-measured on scroll and resize, with focus wiring to keep the input → ² → ³ order. Effort human ~4h / CC ~40min.

State: approved
Actual answer: A) Flip above when short (D5, author, 2026-10-16)
Accepted scope: on focus, measure the room below the input inside the nearest clipping container and the visual viewport; if the tray would not fit, draw it above the input; the tray stays in the blank's wrapper and the D3 Tab order is unchanged
History: none

### Section 3 — Tests

Framework: vitest (unit + component, `packages/viewer/tests/`), Playwright e2e lanes (`packages/app/e2e/student/`), print lane (`printExpectations.ts`). Read: grading-primitives.test.ts:229-266 (split + normalize rows), blanks.ts:336-379, FillInBlank.tsx, Table.tsx:129-190.

```
CODE PATHS                                              USER FLOWS
[+] grading/units.ts                                    [+] Student answers an area blank
  ├── normalizeUnit()  (exact pass, UNCHANGED)            ├── [GAP] types "28 m2" / "28 m^2" / "28 m²" → correct with NO alternates
  │   └── [★★ TESTED] case/space/· rows — :253-257        ├── [GAP] taps in → tray shows → taps ² → "m²", caret after ²
  ├── canonicalUnit()  NEW                                ├── [GAP] [→E2E] last table row: tray flips above, not clipped
  │   ├── [GAP] ² ³ → ^2 ^3 (before space collapse)       ├── [GAP] keyboard: Tab input → ² → ³ → next; Enter on ² inserts
  │   ├── [GAP] letter+2/3 at token end → ^n              └── [GAP] [→E2E] phone viewport: tap input, tap ², focus stays
  │   ├── [GAP] untouched: km/h, 100g, m4, "m 2"
  │   └── [GAP] CRITICAL symmetry: old-equal ⇒ new-equal  [+] Wrong answers
  └── unitAccepted()  → canonical                         ├── [GAP] "125 cm2" → the cm2-specific message (exact pass wins)
      └── [★★ TESTED] alternates rows — :261-266          ├── [GAP] "125 cm^2" with no ^ entry → first cm² entry (canonical pass)
[+] grading/blanks.ts matchMistakeEntry                   ├── [GAP] "22 m2" fires !22 m² and binds its mis.* id
  ├── reserved unit-missing / unit-wrong                  └── [GAP] "28 m" still unit-wrong; "28 m2" no longer unit-wrong
  │   └── [★★ TESTED] grading-section (unit arc)
  ├── authored pass 1 exact  NEW split                  [+] Paper
  ├── authored pass 2 canonical  NEW                      └── [GAP] no tray in print / answer key (read-only input)
  └── interchangeable group slots use canonical
      └── [GAP] one group row with m2 vs m²
[+] blocks/BlankInput.tsx  NEW (FillInBlank + Table)
  ├── tray only on numeric + editable; none on text / readOnly
  ├── focus-within visibility; insert at caret; focus returns
  ├── flip above when short (measured)
  └── [GAP] both surfaces render it (mutation: revert Table)

COVERAGE: 4/24 paths tested (17%) | Code paths: 3/13 | User flows: 1/11
QUALITY: ★★★:0 ★★:4 ★:0 | GAPS: 20 (2 E2E, 0 eval)
```

Proposed tests (all required proof of SU-1..SU-4 and R1–R4; none adds a production seam):

1. **Extend `grading-primitives.test.ts` → `canonicalUnit` table** (unit). m² ≡ m^2 ≡ m2 ≡ M2 ≡ "m ²" ≡ "m ^ 2"; cm³ ≡ cm3 ≡ cm^3; m/s² ≡ m/s2 ≡ m/s^2; unchanged: km/h, 100g, m4, and "m 2" stays ≠ m².
   Value: protects=SU-1 spellings grade equal; fails_when=a fold is dropped or runs after the space collapse; why_new=only case/space rows exist; seam=none; no_claim=none beyond protects
2. **CRITICAL regression — symmetry row in the same file** (unit). For a fixed corpus (every unit + alternate in the four live 710 activities, plus the existing rows), `normalizeUnit(a) === normalizeUnit(b)` implies `canonicalUnit(a) === canonicalUnit(b)`, and every authored alternate still accepts itself.
   Value: protects=nothing accepted today becomes wrong; fails_when=the fold is applied to one side only or is not idempotent; why_new=no symmetry pin exists; seam=none; no_claim=units outside the corpus
3. **Extend `grading-section.test.ts` unit arc** (walk level): `unit: m²` with no alternates accepts "28 m2" / "28 m^2" / "28m²"; two-pass rows (cm2-specific message wins for "125 cm2" and "125 CM2"; "125 cm^2" with no ^ entry gets the first cm² entry); "22 m2" fires `!22 m²` with its `mis.*` id; "28 m" still `unit-wrong`, "28 m2" not; one interchangeable-group row.
   Value: protects=SU-1/SU-2 end to end through gradeSection; fails_when=the pass order flips or unitAccepted keeps exact matching; why_new=current unit arc has no superscript rows; seam=none; no_claim=deployed bundle (covered by drift check + hash)
4. **New `tests/components/BlankInput.test.tsx`** (component): tray on numeric+editable only; none on text, print, answer key; ² inserts at caret / replaces a selection, calls `store.setBlank`, focus returns with caret after ²; Tab order input → ² → ³; focus leaving the wrapper hides the tray; mocked rects put `data-placement="above"` when short; BOTH FillInBlank and a table cell render it (mutation: revert Table.tsx to its own input → red).
   Value: protects=R1–R4 behaviour on both surfaces; fails_when=Table stops using BlankInput, or focus/caret logic regresses; why_new=no component test covers blank inputs today; seam=none; no_claim=real layout and touch (jsdom; rects mocked)
5. **Student e2e row [→E2E]** in a new `packages/app/e2e/student/blank-superscript.e2e.ts`: a fixture with a sentence blank and a last-row table blank; desktop: Tab to ², Enter inserts, value "28 m²"; last-row table blank: tray placement is above and the button is hit-testable (`elementFromPoint` at its centre returns it); 375 px viewport: tap input, tap ², input keeps focus.
   Value: protects=R3/R4 in real layout; fails_when=table overflow clips the tray or a tap steals focus; why_new=jsdom has no layout; seam=none; no_claim=real iOS/Android keyboards (Playwright emulation)
6. **Extend `printExpectations.ts`**: no `.viewer-blank__tray` in print or answer-key render.
   Value: protects=SU-3 hidden on print; fails_when=tray renders for read-only inputs; why_new=print expectations predate the tray; seam=none; no_claim=none beyond protects

Tests to retire: none. Mutation-test 1–4 the day they are written (CLAUDE.md, guards bound to output).

Dispositions: 20 gaps → tests 1–6 (required proof of approved rulings; no new choice). Real-device keyboard behaviour → R6 (TODO).

### Section 4 — Performance

- [P3] (confidence: 8/10) units.ts:20 `MAX_SPLIT_LENGTH = 200` bounds the input; the fold is two linear regex passes per unit compare, a handful per check. No issue.
- [P2] (confidence: 7/10) packages/viewer/src/registry/bindings.ts:66 `fill_in_blank: { loading: 'eager' … }` — BlankInput ships in the student shell. Stop line 156.5 KiB gz (perf-budgets.mjs:151), last measured 151.82 (2026-10-04); growth since unmeasured. Required step of SU-3 ("measured against the stop line"): `node scripts/check-perf-budget.mjs` before and after, both numbers in the commit message; CSS cap 16.5 likewise. No question.

Dispositions: both carried as required implementation of SU-3.

Note (Section 4, factual correction, no question): TODOS.md:18 "Shell CSS is at its cap (measured 2026-10-14)" is stale. The cap moved 15 → 16.5 on 2026-10-15 (perf-budgets.mjs:185, ruling D1). The tray's CSS is measured against 16.5.

### Outside voice

Codex CLI not installed (`codex_reviews` unset); the native fallback needs TaskOutput, which this session does not have. **Outside voice unavailable.** Logged as `unavailable`. The repo's own pre-deploy Fable review (step 7) still runs on the built code.

### TODO choices

- SU-5's case-collision TODO is approved by ruling; added at build without a question.

### R5: TODO for superscripts in TEXT blanks
Finding: 5, P3, 8/10, FillInBlank.tsx:96 + SU-3 ("every numeric blank"), Claude (TODO review)
Plan baseline: SU-3 scopes the tray to numeric blanks; text blanks get nothing
Runtime evidence: no catalogue text blank or live activity needs a superscript today (grep of `~/activity-catalogue-pilot` `{{…}}` bodies for ²/³/^2/^3: only unit blanks; `03-area-composite.md:233` keeps cm² outside the blank)
Comparison grid:
| Choice | Current | A | B | C |
|---|---|---|---|---|
| R5 text-blank superscripts | nothing | TODO in TODOS.md with trigger "first authored text blank whose answer contains ² or ³ (e.g. x²)" | no TODO | build: tray on text blanks too, in this change |
| SU-3 numeric-only tray | approved | kept | kept | widened to text blanks |
Question D6:
D6 — Should text blanks (answers like x²) get a TODO for the same ² ³ tray?
Project/branch/task: activity-platform on main, superscript units plan.
ELI10: The tray only appears on number blanks. A text blank asking for an algebra answer like x² has the same typing problem, but no activity asks for one yet. A TODO with a trigger means it gets built the day an authored file needs it, not before.
Stakes if we pick wrong: building now spends shell size on nothing; no TODO means the first x² blank ships unanswerable.
Recommendation: A because a new wish gets a trigger, not a slot (author ruling 2026-10-02).
Note: options differ in kind, not coverage — no completeness score.
Pros / cons:
A) Add TODO with trigger (recommended)
  ✅ The gap is written down with the exact event that makes it next
  ✅ Spends no shell bytes until an authored blank needs it
  ❌ One more TODOS entry to keep honest (human: ~5min / CC: ~1min)
B) Skip
  ✅ Keeps TODOS shorter by one entry
  ❌ The first x² text blank would ship with no way to type the answer
C) Build it now
  ✅ Text and number blanks behave the same from day one
  ❌ Grading for text blanks is exact-match, so ² vs ^2 needs its own ruling; scope grows with no authored need
Net: write the trigger down; build when a file needs it.
Header: Text blanks
Options:
A) Add TODO with trigger (recommended)
TODOS.md entry: What/Why/Context; trigger = the first authored text blank whose answer contains ² or ³. Notes that text grading is exact-match, so it needs its own ruling on ² vs ^2. Effort ~5min.
B) Skip
No TODO; text blanks stay without a tray and the gap is not recorded.
C) Build it now
Widen the tray to text blanks in this change; needs a separate ruling on text-blank matching of ² vs ^2. Effort human ~3h / CC ~30min.

State: approved
Actual answer: C) Build it now (D6, author, 2026-10-16)
Accepted scope: widen the ² ³ tray to text blanks in this change (SU-3's numeric-only scope is widened; read-only inputs still get none); text-blank matching of ² vs ^2 needs its own ruling → R6
History: none

### R6: how TEXT blanks grade ² against ^2
Finding: 6, P2, 9/10, packages/viewer/src/server/grading/normalize.ts:30-31 ("NFKC … folds superscripts into digits (`x²` → `x2`) … any of which can flip a math answer"), Claude (after D6)
Plan baseline: D6 approved the tray on text blanks and named this ruling as owed; text blanks today compare exactly after the lookalike fold (normalize.ts:107-118), case-sensitive
Runtime evidence: normalize.ts excludes superscript folding on purpose; no live or catalogue text blank holds ² or ^2 today
Comparison grid:
| Choice | Current | A | B | C |
|---|---|---|---|---|
| R6 text-blank ² matching | exact: x² ≠ x^2 | fold ² ³ ↔ ^2 ^3 on both sides (x² ≡ x^2); a trailing digit is NOT folded (x2 stays x2) | no fold: exact as today; authors list x^2 as an alternate | fold like units, trailing digit included (x2 ≡ x²) |
| SU-1 unit fold (incl. trailing digit) | approved | kept, unit blanks only | kept | kept |
| D6 tray on text blanks | approved | kept | kept | kept |
Question D7:
D7 — On a TEXT blank, should a typed x² match an answer key of x^2 (and the reverse)?
Project/branch/task: activity-platform on main, superscript units plan.
ELI10: Text blanks are graded exactly, and the grader deliberately never turns ² into 2, because "x2" can mean something else (2x, or x with a small 2 below). Now that text blanks get a ² key, a student who taps ² when the key says x^2 would be marked wrong. Option A treats ² and ^2 as the same notation, but never a bare trailing 2. Both sides get the same treatment, so nothing marked right today becomes wrong.
Stakes if we pick wrong: either the new ² key produces wrong marks on correct answers, or x2 starts matching x².
Recommendation: A because the tray must not make a right answer wrong, and ^2 and ² are one notation while x2 is not.
Completeness: A=10/10, B=6/10, C=7/10
Pros / cons:
A) Fold ² ↔ ^2 only (recommended)
  ✅ A student who uses the new ² key on x^2 is marked right; ^2 typers still are
  ✅ Leaves "x2" alone, keeping the normalize.ts rule that a bare digit is never a superscript
  ❌ Adds a superscript pair to the normalization module that today is a closed lookalike set (human: ~1h / CC: ~10min)
B) No fold
  ✅ Text grading stays byte-exact apart from lookalikes, exactly as today
  ❌ Every author must list both spellings, and the new ² key can mark a correct answer wrong
C) Fold like units
  ✅ One rule for unit and text blanks; x2, x^2 and x² all match
  ❌ x2 is ambiguous in algebra (2x, or x with a small 2 below), so a wrong answer can be marked right
Net: fold the two spellings of one notation, never the digit.
Header: Text ² match
Options:
A) Fold ² ↔ ^2 only (recommended)
In text-blank grading, ² ³ and ^2 ^3 compare equal on both sides (also spaces around ^ are not ignored: "x ^2" stays as typed). A bare trailing digit is never folded. Mistake matches use the same rule. Tests pin x² ≡ x^2 and x2 ≠ x². Effort human ~1h / CC ~10min.
B) No fold
Text blanks keep exact matching; the format doc tells authors to list x^2 and x² as alternates. Effort ~15min (docs).
C) Fold like units
Text blanks fold ² ³, ^2 ^3 AND a letter followed by 2 or 3, the same rule SU-1 gives unit blanks. Effort human ~1h / CC ~10min.

State: approved
Actual answer: A) Fold ² ↔ ^2 only (D7, author, 2026-10-16)
Accepted scope: in TEXT-blank grading, ² ³ and ^2 ^3 compare equal on both sides; spaces around ^ are not ignored; a bare trailing digit is never folded; case sensitivity unchanged; mistake matches use the same rule. Implemented in the text comparator, NOT in normalize.ts's closed lookalike map (that map stays a set of single-glyph lookalikes). Tests pin x² ≡ x^2, x2 ≠ x², X² ≠ x^2. Docs (SU-7) gain one sentence for text blanks
History: none

### R7: device-check row for the ² ³ tray
Finding: 7, P3, 7/10, TODOS.md:238 ("Device checks (T11, D6) — the author's … WAITING … he has no school devices"), Claude (TODO review)
Plan baseline: tests 4–5 cover the tray in jsdom and Playwright emulation; real iOS/Android/ChromeOS keyboards and screen-reader names are unverified
Runtime evidence: no real device available (TODOS.md:238-242)
Comparison grid:
| Choice | Current | A | B |
|---|---|---|---|
| R7 device check | none | add a line to the existing Device checks TODO: tap ² on a phone and a Chromebook keeps focus and the keyboard; VoiceOver/TalkBack/ChromeVox read the button names | no device row |
| Tests 1–6 | required | kept | kept |
Question D8:
D8 — Add the ² ³ tray to the existing real-device check TODO?
Project/branch/task: activity-platform on main, superscript units plan.
ELI10: The tests run in a simulated browser. Real phone keyboards sometimes close when you tap a button next to a text box, and real screen readers may read ² as "superscript two" or skip it. There is already a TODO for checks on school devices, waiting for the first school you can reach. One more line there makes the tray part of that pass.
Stakes if we pick wrong: no row means the first real-keyboard bug is found by a student.
Recommendation: A because the check rides an existing trigger and costs one line.
Note: options differ in kind, not coverage — no completeness score.
Pros / cons:
A) Add device row (recommended)
  ✅ The real-keyboard and screen-reader behaviour gets checked on the first school device pass
  ✅ No new TODO and no new trigger; one line in an entry that already exists
  ❌ Makes that waiting device pass a little longer for the author (human: ~5min / CC: ~1min)
B) No device row
  ✅ The device pass stays as it is
  ❌ Keyboard closing or a silent screen-reader name would first be found in a classroom
Net: one line on an existing trigger.
Header: Device row
Options:
A) Add device row (recommended)
Append to TODOS.md "Device checks (T11, D6)": on a phone and a Chromebook, tapping ² keeps the blank focused and the keyboard open; VoiceOver, TalkBack and ChromeVox read both button names. Effort ~5min.
B) No device row
Leave the device checks entry unchanged.

State: approved
Actual answer: A) Add device row (D8, author, 2026-10-16)
Accepted scope: append to TODOS.md "Device checks (T11, D6)": on a phone and a Chromebook, tapping ² keeps the blank focused and the keyboard open; VoiceOver, TalkBack and ChromeVox read both button names
History: none

Approval readiness: PASS — R1 (D2), R2 (D3), R3 (D4), R4 (D5), R5 (D6), R6 (D7), R7 (D8); SU-1..SU-7 (author 2026-10-16); structure (D1); SU-5 TODO by ruling. Regression contract (nothing accepted today becomes wrong) carried from SU-1's "without breaking existing answers".

## Working plan (as reviewed)

1. `units.ts`: keep `normalizeUnit` byte-for-byte (the exact pass); add `canonicalUnit` = normalizeUnit, then ² ³ → ^2 ^3 BEFORE the operator-space collapse, then a letter followed by 2/3 at a token end → ^n; `unitAccepted` compares canonical (SU-1).
2. `blanks.ts` `matchMistakeEntry`: the authored-match loop runs twice, exact then canonical (SU-2); reserved matches unchanged.
3. Text-blank comparator: ² ³ ≡ ^2 ^3 on both sides, no trailing-digit fold, case and spacing unchanged (D7). Not in normalize.ts's lookalike map.
4. New `blocks/BlankInput.tsx`, used by FillInBlank.tsx and Table.tsx (D2): the input plus a ² ³ tray on every EDITABLE blank, numeric and text (SU-3 widened by D6); none on print or the answer key; visible while focus is inside the blank's wrapper; Tab order input → ² → ³ (D3); insert at the remembered caret and return focus; tray placed per the design review (DR-1, DR-6: beside → below → above, avoiding other blanks; supersedes D4), pointer taps keep focus (DR-2), quiet token spec (DR-3), `--z-inline-tray` (DR-4), screen-reader note (DR-5). Buttons insert the ² glyph (SU-4), named "Insert squared" / "Insert cubed".
5. `viewer.css`: tray styles; hidden in print.
6. Tests 1–6 (Section 3) plus text rows: x² ≡ x^2 both ways, x2 ≠ x², X² ≠ x^2, a text-blank tray in the component test. Mutation-test each guard.
7. Perf: `node scripts/check-perf-budget.mjs` before and after; shell JS stop line 156.5, CSS cap 16.5.
8. `pnpm bundle:grading-server`, committed same-commit; `pnpm verify` green.
9. Docs (SU-7 + D7): unit fold and text fold sentences in `markdownImportPrompt.ts` and `markdown-import-format.md`; `pnpm prompt:catalogue`. TODOS: SU-5 case TODO, D8 device row, and correct the stale "Shell CSS is at its cap" entry (cap is 16.5).
10. Release order: Fable review → the author runs `pnpm deploy:check` (no `--no-verify-jwt`) → hash-verify the deployed `_shared/*.bundle.js` against the repo → THEN push (Cloudflare deploys the SPA from main; the ² key must not reach students before grading accepts it) → refresh the Notion stamp → B-184.

## NOT in scope

- `⁻¹` and other superscripts (m·s⁻¹): no activity needs them (SU-1).
- meter ≡ metre and other unit synonyms: that is a unit registry (SU-6); filed with the curriculum side.
- Case-sensitive units (mm vs Mm): TODO with trigger (SU-5).
- `\gap{}` math blanks: MathLive already types superscripts there.
- A per-activity or per-blank switch to hide the tray on non-math text blanks: no schema field without an authored need (CLAUDE.md, no speculative fields). The tray shows on vocabulary blanks too; accepted with D6.

## What already exists

- `splitUnitEntry` / `normalizeUnit` / `unitAccepted` (units.ts) — reused; `normalizeUnit` kept as the exact pass.
- `matchMistakeEntry` reserved-match logic (blanks.ts:340-379) — reused; only the authored loop gains a second pass.
- `normalizeLookalikes` (normalize.ts) — reused as is; deliberately NOT extended (its header rules out superscript folding).
- The blank input in FillInBlank.tsx:96 and Table.tsx:163 — two copies today, merged into BlankInput (D2). Rubric: two verified callers; removes ~20 duplicated lines from Table.tsx, adds ~80 for the component (tray, focus, flip); net growth is the feature itself.
- Restore returns stored verdicts (check-activity-handler.ts:428): no re-grade flip.
- Answer key appends the canonical unit (answer-key/extract.ts:67-72): unchanged.

## Failure modes

| Path | Realistic failure | Covered by | User sees |
|---|---|---|---|
| canonicalUnit | fold applied to one side only | test 2 (symmetry, CRITICAL) | wrong mark on a right answer; caught pre-merge |
| two-pass matching | order flipped, spelling hint lost | test 3 | generic message instead of "typed cm3"; caught pre-merge |
| text fold | x2 folded by mistake | text rows (x2 ≠ x²) | wrong answer marked right; caught pre-merge |
| BlankInput insert | caret never set (first tap is on ²) | test 4 (append at end) | ² lands at end, visible |
| tray placement | clipped in last table row | test 5 e2e + D5 flip | buttons missing; caught pre-merge |
| release order | SPA pushed before check-activity deploy | plan step 10 ordering | x² via the new key marked wrong until deploy |
| docs order | B-184 sent before deploy; authors drop alternates | step 10: letter last | m2 marked wrong on new activities |
| real keyboards | tap on ² closes the phone keyboard | D8 device row (deferred) | keyboard closes; student taps the blank again |

Critical gaps (no test AND no handling AND silent): 0. The release- and docs-order rows are handled by sequencing, not tests.

## Worktree parallelization strategy

| Step | Modules touched | Depends on |
|---|---|---|
| Grading (1–3) | viewer/src/server/grading, viewer/tests | — |
| UI (4–5) | viewer/src/blocks, viewer/src/styles, viewer/tests/components, app/e2e | — |
| Docs + bundle + perf (7–9) | app/src/lib, docs, supabase/functions/_shared | Grading, UI |

Lane A: grading. Lane B: UI. Disjoint modules, but one session builds both on main; sequential implementation is the plan (grading first, so the UI's text-blank tests can rely on the fold). No conflict flags.

## Implementation Tasks
Synthesized from this review's findings. Each task derives from a specific
finding above. Run with Claude Code or Codex; checkbox as you ship.

- [ ] **T1 (P1, human: ~3h / CC: ~20min)** — grading — canonicalUnit + unitAccepted on canonical
  - Surfaced by: SU-1; Section 1 P3 (fold before space collapse, units.ts:57)
  - Files: packages/viewer/src/server/grading/units.ts, packages/viewer/tests/grading-primitives.test.ts
  - Verify: `pnpm --filter @activity/viewer test`; mutate each fold, watch tests 1–2 go red
- [ ] **T2 (P1, human: ~2h / CC: ~15min)** — grading — two-pass authored mistake matching
  - Surfaced by: SU-2; Section 1 P3 (blanks.ts:366-370)
  - Files: packages/viewer/src/server/grading/blanks.ts, packages/viewer/tests/grading-section.test.ts
  - Verify: test 3 rows; mutation: single pass reds the cm2-specific row
- [ ] **T3 (P1, human: ~1h / CC: ~10min)** — grading — text-blank ² ↔ ^2 fold
  - Surfaced by: R6 (D7), normalize.ts:30-31
  - Files: packages/viewer/src/server/grading/blanks.ts (text comparator), packages/viewer/tests/grading-section.test.ts
  - Verify: x² ≡ x^2, x2 ≠ x², X² ≠ x^2
- [ ] **T4 (P1, human: ~4h / CC: ~40min)** — viewer — BlankInput with ² ³ tray on FillInBlank and Table
  - Surfaced by: R1 (D2), R2 (D3), R3 (D4), R4 (D5), R5 (D6); Section 2 P3 (read-only)
  - Files: packages/viewer/src/blocks/BlankInput.tsx (new), FillInBlank.tsx, Table.tsx, packages/viewer/src/styles/viewer.css, packages/viewer/tests/components/BlankInput.test.tsx (new)
  - Verify: test 4; mutation: revert Table.tsx to its own input → red
- [ ] **T5 (P1, human: ~2h / CC: ~20min)** — e2e + print — tray in real layout, absent on paper
  - Surfaced by: Section 3 tests 5–6
  - Files: packages/app/e2e/student/blank-superscript.e2e.ts (new), packages/viewer/src/registry/printExpectations.ts
  - Verify: student lane + print lane green
- [ ] **T6 (P1, human: ~30min / CC: ~5min)** — perf — measure shell before/after
  - Surfaced by: Section 4 P2 (bindings.ts:66 eager)
  - Files: none (measurement); numbers in the commit message
  - Verify: `node scripts/check-perf-budget.mjs` under 156.5 JS / 16.5 CSS
- [ ] **T7 (P1, human: ~30min / CC: ~5min)** — bundle — grading bundle + full verify
  - Surfaced by: CLAUDE.md grading-bundle rule
  - Files: supabase/functions/_shared/grading bundle (generated)
  - Verify: `pnpm bundle:grading-server`; `pnpm verify`
- [ ] **T8 (P2, human: ~1h / CC: ~10min)** — docs — prompt, format doc, TODOS
  - Surfaced by: SU-7, D7, SU-5, R7 (D8), Section 4 note (stale CSS-cap TODO)
  - Files: packages/app/src/lib/markdownImportPrompt.ts, docs/markdown-import-format.md, docs/catalogue-authoring-prompt.md (generated), TODOS.md
  - Verify: `pnpm prompt:catalogue`; catalogueAuthoringPrompt.test.ts green
- [ ] **T9 (P1, author-gated)** — release — Fable review, deploy, hash, push, stamp, B-184
  - Surfaced by: plan step 10; failure-mode rows "release order", "docs order"
  - Files: none
  - Verify: downloaded `check-activity` bundle sha256 equals the repo's; then push; then letter

## Unresolved decisions

None.

## Completion summary

- Step 0: Scope Challenge — scope accepted as-is (D1 Original arrangement)
- Reality rows: 7/7 applicable rows emitted, 0 unverified premises
- Architecture Review: 1 issue found (R1), plus 2 P3 implementation notes
- Code Quality Review: 3 issues found (R2, R3, R4)
- Test Review: diagram produced, 20 gaps identified
- Performance Review: 1 issue found (shell measure), 1 factual correction (stale CSS TODO)
- NOT in scope: written
- What already exists: written
- TODOS.md updates: 2 items proposed to user (R5 → built now, R7 → added); SU-5 by ruling
- Failure modes: 0 critical gaps flagged
- Unresolved decisions: 0 in this review
- Outside voice: codex, unavailable (CLI not installed; native fallback needs TaskOutput)
- Parallelization: 2 lanes, 0 parallel / 2 sequential
- Lake Score: 4/4 = answers picking a 10/10 option / answers scored for Completeness (D2, D3, D5, D7)

## Suppressed findings

- (confidence 4/10) Restore re-runs `gradeSection` for solutions (check-activity-handler.ts:529); solutions are per checked section, not per verdict, so the fold should not change what unlocks. Not verified against a seeded document.

## Design review (2026-10-16)

**Target:** the ² ³ tray (BlankInput) as ruled in the eng review. **Focus:** all 7 dimensions (D1). **Initial rating: 5/10**: behaviour fully specified, visual treatment and collisions unspecified. No DESIGN.md; calibrated against `packages/viewer/src/tokens/tokens.css`. Mockups: not generated (designer has no OpenAI key). Outside voice: Fable subagent (author's choice, D2), cold read of this file plus FillInBlank.tsx, Table.tsx, viewer.css, tokens.css.

Verified Fable claims (static read): no CSS rule exists for `.viewer-blank` (a plain inline span); `.viewer-blank__feedback` is `display:block` directly under the input (FillInBlank.tsx:120-127, viewer.css:763); a locked section is one `<fieldset disabled>` (ViewerContainer.tsx:489); `--vw-shadow-drag`, `--vw-radius-lg`, `--focus-offset`, `--touch-target` exist (tokens.css:215-227, 191).

### Pass 1 — Information architecture: 4/10

What the student sees on tap-in: (1) the focus ring, (2) the tray, (3) the sentence. The D4 tray sits UNDER the input, which is exactly where two other things live: the blank's own feedback line after a check ("write the unit, m²", the retry moment this feature exists for), and on stacked layouts the next blank (a table column of answers, "(a) ___ / (b) ___" on consecutive lines), so tapping the next blank hits ³ and writes it into the wrong answer. Reopens D4 on new evidence. → DR-1.

### DR-1: where the tray sits relative to the blank
Plan baseline: D4 (tray just below the input) + D5 (flip above when no room below)
Evidence: FillInBlank.tsx:120-127 feedback block under the input; stacked blanks in Table cells and lettered parts
Options: A) beside: to the right of the input on the same line, vertically centred on it, clamped to the clipping box; falls back below, then above, only when the line has no room to the right (recommended) · B) below everything: under the pill and the feedback line · C) keep D4, but flip above whenever a verdict or feedback is showing
State: approved — 1A Beside the blank (author, 2026-10-16). SUPERSEDES D4's "just below". The tray sits to the right of the input on the same line, vertically centred on it, clamped inside the nearest clipping box (table scroll box, paper edge); only when the line has no room to the right does it fall back below, then above (D5's measurement, now on both axes). The feedback line and a stacked blank below are never covered. It covers the words after the blank on that line while focused.

Pass 1 re-rated: 8/10 (hierarchy: ring → tray beside → sentence; the remaining 2 are visual weight, Pass 4).

### Pass 2 — Interaction states: 6/10 → 9/10 (no new decision)

States follow from rulings already made; recorded so the builder does not guess:

```
  STATE                         | TRAY
  ------------------------------|------------------------------------------------
  idle (not focused)            | none
  focused, editable             | beside the input (DR-1)
  focus moves input → ² → ³     | stays (focus-within, D3)
  focus leaves the blank        | gone, no transition
  after a check, correct        | input still editable → tray on refocus, beside
  after a check, incorrect      | beside; feedback line below stays visible (DR-1)
  checking… (in flight)         | as focused (input is not locked mid-check)
  locked / frozen section       | none: <fieldset disabled> makes the input unfocusable
  print, answer key (read-only) | none (SU-3)
  no room right                 | below; no room below → above (D5, both axes)
  phone keyboard opens late     | re-measure on visualViewport resize/scroll while open (D5 needs it: the keyboard opens AFTER focus)
```

The visualViewport re-measure is necessary implementation of D5, not a new choice.

### Pass 3 — User journey: 5/10

```
  STEP | STUDENT DOES                    | FEELS              | PLAN SPECIFIES?
  -----|---------------------------------|--------------------|----------------------------------
  1    | reads "area … m²"               | knows the answer   | yes: nothing prompts the unit (SU-3)
  2    | taps the blank, types "28 m"    | where is ²?        | yes: tray appears beside (DR-1)
  3    | taps ²                          | relief / or jolt   | GAP: phone keyboard closes and reopens
  4    | checks; "28 m²" correct         | done               | yes (SU-1)
  5    | wrong unit → reads feedback     | can fix it         | yes: feedback visible (DR-1)
```

Step 3: as written (D3 scope), an insert "uses the remembered caret and returns focus to the input". On a phone a tap on ² first BLURS the input, which closes the on-screen keyboard; returning focus reopens it, a visible bounce per tap. → DR-2.

### DR-2: pointer taps on ² ³ never take focus from the input
Plan baseline: D3 approved scope (remembered caret, focus returns)
Evidence: standard browser behaviour: pointerdown on a button moves focus to it before click
Options: A) pointer: preventDefault on pointerdown so the input keeps focus and its live caret, no keyboard bounce; keyboard (Tab → ² → Enter) keeps D3's remembered caret + return (recommended) · B) keep D3's single path for both: every insert blurs and refocuses
State: approved — 2A Keep focus on tap (author, 2026-10-16). Buttons call preventDefault on pointerdown: a tap or click never moves focus off the input and the insert uses the live caret. Keyboard activation (Tab → ² → Enter/Space) keeps D3: remembered caret, focus returns to the input. Both paths tested.

Pass 3 re-rated: 9/10 (the remaining point is real-device proof, already the D8 device row).

### Pass 4 — AI slop risk / visual specificity: 3/10

Mode: OPERATE (app UI inside a READ surface). No hard rejection hit: no cards, no decoration. But the plan names zero visual values: surface, border, radius, shadow, key size, glyph size, hover/active/focus states, motion. Two traps if left to the builder: (1) `--vw-shadow-popover` (0 10px 40px, modal weight) makes a two-key helper the loudest thing on the page, worse now that every text blank gets it (D6); (2) a bare `²` renders at about 60% of x-height, too small to read on a 44px key. → DR-3.

### DR-3: the tray's visual spec
Plan baseline: none (behaviour only)
Options: A) quiet spec from existing tokens (below) (recommended) · B) accent-tinted keys (`--vw-color-accent-wash` fill, accent glyph) so the tray reads as a call to action
Spec under A: surface `--vw-color-overlay`; border `1px solid var(--vw-color-line-strong)`; radius `--vw-radius-lg` (6px); shadow `--vw-shadow-drag` (not popover); padding and gap `--space-1`; keys `min-width`/`min-height: var(--touch-target)` (44px) at every pointer type; key face transparent, `1px solid var(--vw-color-line)`, radius `--vw-radius-lg`; glyph `aria-hidden`, 1.4em, `--vw-color-ink`; hover/active `--vw-color-hover`; focus-visible = the global `.viewer :focus-visible` ring; no entrance or exit transition; `type="button"`. Dark mode by the same tokens (ink #f1f5f9 on overlay #1e293b), pinned by adding the tray pair to the token contrast test.
State: approved — 3A Quiet, existing tokens (author, 2026-10-16). The spec above is the build spec; the tray's ink-on-overlay pair joins the token contrast test.

Pass 4 re-rated: 9/10.

### Pass 5 — Design system alignment: 6/10

No DESIGN.md (gap; /design-consultation stays in the backlog as STATE's brand pass). Against tokens.css the tray now uses only existing tokens (DR-3) except stacking. The z scale is tools 110 < reference 115 < calculator 120 < topbar 200 < banner 300 < popover 1000 (tokens.css:230-235). `--z-popover` would draw the tray OVER the sticky topbar and the floating calculator when a focused blank scrolls under them; any bare number is the kind of literal the repo already replaced once (viewer.css:2487-2491). → DR-4.

### DR-4: the tray's stacking level
Options: A) new token `--z-inline-tray: 50` (below every floating tool and the topbar), declared in tokens.css and listed in tokens.ts (recommended) · B) reuse `--z-popover` (1000)
State: approved — 4A New layer token at 50 (author, 2026-10-16). `--z-inline-tray: 50` in tokens.css, listed in tokens.ts; the tray is its consumer.

Pass 5 re-rated: 8/10 (no DESIGN.md remains a repo-level gap, not this plan's).

### Pass 6 — Responsive & accessibility: 6/10

Responsive, from rulings already made (no new choice): ≥768 px and phones use the same rule; at 375 px a blank near the right edge has no room beside it, so the tray falls back below/above (DR-1), clamped to the paper edge; in a table cell it is clamped to `.viewer-table`'s scroll box. Keys stay 44px at every pointer type (Chromebooks are touch + fine pointer). Keyboard: D3. Contrast: DR-3 test pair.

Gap: a screen-reader user focusing a blank hears "Blank 2 of 3, edit text" and nothing tells them two insert buttons follow; they only find them by tabbing on. Names are ruled ("Insert squared", "Insert cubed"); discoverability is not. → DR-5.

### DR-5: tell screen-reader users the keys exist
Options: A) a visually hidden note, referenced by `aria-describedby` on every editable blank: "Squared and cubed keys follow." (recommended) · B) no description; the buttons are found by Tab
State: approved — 5A Announce the keys (author, 2026-10-16). Every EDITABLE blank carries `aria-describedby` → one visually hidden node per block: "Squared and cubed keys follow." Read-only blanks get none. Pinned in the component test.

Pass 6 re-rated: 9/10 (real assistive-tech proof is the D8 device row).

### Pass 7 — Unresolved decisions: 6/10

Implementation mechanics that follow from rulings (no question): the tray is positioned against a new `.viewer-blank__field` wrapper (`display:inline-block; position:relative`) around the input only, because `.viewer-blank` is a plain inline span with no CSS rule that fragments across lines once the pill and feedback join it (absolute positioning inside a fragmented inline is engine-dependent); both FillInBlank and Table use it through BlankInput.

Concrete conflict from DR-1: "beside" covers the words after the blank, and 42 lines of the catalogue put a SECOND blank within 12 characters of the first (`~/activity-catalogue-pilot`, e.g. 714 `02-reflect.md:135` "R′ is at ({{=-3}}, {{=4}})"). The tray beside the x-coordinate sits on the y-coordinate's input, and a tap there types ³ into x. → DR-6.

### DR-6: a tray must never cover another blank
Options: A) the placement measurement also checks the other blank inputs in the block: if "beside" would overlap one, use the next position (below, then above) that overlaps none (recommended) · B) accept the overlap; the student taps outside first
State: approved — 6A Avoid other blanks (author, 2026-10-16). The placement pass also measures the other editable blank inputs in the block; if "beside" overlaps one, try below, then above, and use the first that overlaps none (none clear → below). E2E row: a coordinate pair; the tray on x never covers y.

Pass 7 re-rated: 9/10.

### Design review outputs

**Rating: 5/10 → 9/10.** The last point is real-device proof (D8 device row) and the absent DESIGN.md (repo-level, STATE backlog: /design-consultation brand pass).

**Placement, as ruled (supersedes D4; extends D5):**

```
  focus enters a blank
        │
        ▼
  measure: clipping box (paper / .viewer-table scroll box), visualViewport,
           other editable blank inputs in the block
        │
        ├─ room to the RIGHT and no blank there ──► BESIDE (centred on the input)
        ├─ else room BELOW and no blank there ────► BELOW
        ├─ else room ABOVE and no blank there ────► ABOVE
        └─ else ──────────────────────────────────► BELOW
  re-measure on visualViewport resize/scroll while open (phone keyboard)
```

**NOT in scope (design):** mockups (designer has no OpenAI key; the e2e screenshots at build time are the visual record); a DESIGN.md (repo-level; /design-consultation in STATE's backlog); a per-blank opt-out to hide the tray on word blanks (no schema field without an authored need; DR-3's quiet look is what makes D6 survivable).

**What already exists (reused):** tokens.css: `--vw-color-overlay`, `--vw-color-line-strong`, `--vw-color-line`, `--vw-color-hover`, `--vw-radius-lg`, `--vw-shadow-drag`, `--space-1`, `--touch-target`, the global `.viewer :focus-visible` ring, the global reduced-motion block (viewer.css:1324); the `<fieldset disabled>` lock idiom (ViewerContainer.tsx:489); the token contrast test. New: `--z-inline-tray` (DR-4), `.viewer-blank__field` (Pass 7).

**TODOS:** no new design TODO; real-device and assistive-tech proof rides D8's row.

**Design tasks (amend eng T4/T5):**

- [ ] **T4a (P1, human: ~3h / CC: ~30min)** — viewer — placement per DR-1 + DR-6 (beside → below → above, clamped, avoids other blanks, re-measures on visualViewport) on a `.viewer-blank__field` wrapper
  - Files: packages/viewer/src/blocks/BlankInput.tsx, packages/viewer/src/styles/viewer.css
  - Verify: component test with mocked rects for each branch of the diagram
- [ ] **T4b (P1, human: ~1h / CC: ~10min)** — viewer — pointer path keeps focus (DR-2); keyboard path per D3
  - Verify: component test: pointerdown default prevented, input stays document.activeElement; Enter on ² returns focus
- [ ] **T4c (P1, human: ~1h / CC: ~10min)** — tokens + CSS — DR-3 visual spec, `--z-inline-tray: 50` (DR-4) in tokens.css + tokens.ts, contrast pair in the token test
  - Verify: token test green; mutation: swap ink for ink-faint → red
- [ ] **T4d (P1, human: ~30min / CC: ~5min)** — a11y — aria-describedby note on editable blanks (DR-5)
  - Verify: component test: editable blank described, read-only not
- [ ] **T5a (P1, human: ~1h / CC: ~15min)** — e2e — rows: feedback line visible while the tray is open after an incorrect check (DR-1); coordinate pair, tray on x never covers y (DR-6); last-row table blank flips and stays clickable; 375 px tap keeps focus (DR-2); screenshot each for the record
  - Files: packages/app/e2e/student/blank-superscript.e2e.ts

**Completion summary (design):** Step 0 rated 5/10, focus all 7 (D1); mockups not generated (no OpenAI key); outside voice: Fable subagent (D2, author's choice), 1 critical + 6 high + 6 medium findings, all verified or mapped; passes: IA 4→8, states 6→9, journey 5→9, slop 3→9, system 6→8, a11y 6→9, unresolved 6→9; decisions made: 6 (DR-1..DR-6); unresolved: 0; TODOs proposed: 0.


## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 3 | not run for this plan | — |
| Outside Review | codex via `/plan-eng-review`; Fable subagent via `/plan-design-review` | Independent 2nd opinion | 39 | eng: unavailable; design: Fable (in-host, different model) completed | design: 1 critical, 6 high, 6 medium, all resolved in DR-1..DR-6 or mapped |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 52 | ISSUES OPEN (all mapped to tasks) | 25 issues, 0 critical gaps |
| Design Review | `/plan-design-review` | UI/UX gaps | 20 | ISSUES OPEN (all mapped to tasks) | score: 5/10 → 9/10, 6 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 9 | not run for this plan | — |

- **OUTSIDE COVERAGE:** eng phase: codex unavailable (CLI not installed), 2026-10-16. Design phase: codex unavailable; Fable subagent completed at the author's request (in-host, model claude-fable-5-1, not a codex record).
- **CROSS-MODEL:** Fable's design findings and the eng review overlap on table clipping and the keyboard focus model; Fable added the feedback-line overlap, the stacked-blank tap theft, the keyboard timing and the z-index conflict, all verified against code before ruling.
- **VERDICT:** no review CLEAR (issues_open = mapped work, 0 open decisions). eng review required. Plan is ready to implement: T1–T9 with T4a–T4d and T5a.

NO UNRESOLVED DECISIONS
