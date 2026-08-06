# S5 retrospective — student print + the parity gate (reviewed 2026-08-06)

**Scope:** slice S5 of the components-as-data rewrite (2026-08-01/02: T1a `06681df`,
T1b `1f650d6`, T1c `bf2fc44`, glossary `650b823`, static-SVG twins `eb30d5f`,
readiness `7ccf2e5`, typography `6afa398`, printExpectations `1acfb04`, gate
`b6c1809`, fixture classes `b564269`, CI job `3fd891c`, pagination `dbfc151`,
contact sheet `d7c4832`, DECISIONS `8ac8cd9`), reviewed after S5.5–S8 and before
S9. **Evidence base:** commit history, the S5 eng-review record, and a
fresh-context survey of the print system's current state (83 print e2e across four
files, all counted; every guard re-verified green). S5.5 gets its own retro —
findings that belong to the migration (the gate's retirement, the eviction) live
there. An independent audit pass is expected to append below.

## Verdict in one line

S5 is the slice where **the gate did its job before it guarded anything** — its
first runs found seven real defects in the table, the gate, and the fixtures, plus
a vacuous-pass hole in itself — and where the repo's verification discipline
(red-green mutation, spec-referenced rules, honest NOT-lists with named
dischargers) reached its mature form; its latent costs are small and mostly
prose-shaped, with one structural exception: the fixture rosters that aren't
derived are already drifting in both directions.

## Costs already paid (lessons banked, no action needed)

1. **The print stylesheet had been silently contradicting the registry** — T1a
   found `break-inside: avoid` applied to `.viewer-block` wholesale, overriding
   the seven `auto` types (paragraphs held whole across page breaks). The fix
   came with the drift guard that parses the break list back out of the CSS —
   CSS can't import TS, so the guard *is* the bond.
2. **A review claim was wrong and the correction produced the right artifact.**
   S5-9 claimed dark→light print flattening was missing; it already existed in
   `tokens.css`. What was actually owed was the *guard*, added red-green — the
   next print rule reaching for an unflattened color token fails a test instead
   of failing on paper.
3. **The readiness barrier's first draft had two real bugs the tests forced
   out**: racing fonts/images against `sleep(remaining)` meant the losing arm
   consumed the whole budget; and load/error listeners miss events that already
   fired (polling `img.complete` is the whole check — and it goes true on
   failure, so a 404 settles rather than hanging). The image test double had the
   same disease and was fixed to model real browser behavior — the S4
   test-double lesson, caught in-slice this time.
4. **The gate's first runs found seven defects before it guarded anything**:
   `drawable-count` read the container not the SVG; viewer-only improvements
   were being asserted on the renderer that deliberately lacks them (fixed by
   *naming* them per-surface — what makes the gate spec-referenced rather than
   output-referenced); `bare-underline` measured border style Tailwind's
   preflight sets everywhere; the lazy-component wait was satisfied by other
   blocks' wrappers; callout had one fixture where the grayscale rule needs four;
   variant checks ran against whichever instance came first; and two more
   viewer-only improvements surfaced. **Plus a vacuous-pass hole in the gate
   itself**: deleting the "solutions never print" rule stayed green because
   solutions only exist after a check — the rules were asserted about elements
   never on the page. Fixed by scripting a check first; the same mutation now
   fails.
5. **The pagination test caught itself being useless**: "break rules change the
   layout" got 9 pages with rules on or off (blocks too small to straddle) and
   passed on `toBeGreaterThanOrEqual`. Rewritten with blocks taller than half a
   page: 32 vs 24 pages, strict inequality. The empty-fixture lesson (S2's
   vacuous pass) in paged-media form.
6. **The browser-only bug class continued** (five instances in S3, more here):
   `@page` cannot read custom properties (a `var()` attempt silently falls back
   to letter on every A4 printer); KaTeX centers at two levels so a computed-
   style assertion is not a rendering assertion when a vendored stylesheet is in
   play. Both documented at the fix sites.

## Latent costs — what will bite future developers

7. **The non-derived rosters are already drifting in both directions.**
   `structuralPrintRoster` declares `structure/section-confidence` — no e2e
   asserts it; `structure/reserved-work-space` has a test — it's not in the
   roster. Nothing cross-checks roster ids against test titles: the gate's
   self-check covers only the *block* roster (derived from the registry, cannot
   drift), and the unit guard asserts non-emptiness plus a hardcoded subset. The
   document roster is fully covered today **by luck, not construction**. This is
   the S0-audit's roster lesson (hand-lists rot; derived lists self-adapt)
   landing in the slice that got it right for blocks and wrong for structure.
8. **`PrintTreatment` remains gate vocabulary, not behavior** — consumed by
   exactly one place (`TREATMENT_CHECKS`), realized entirely by CSS. The S0
   retro's warning (never key new behavior on `treatment`) still holds; the enum
   names things for the gate and nothing else.
9. **The F12 reprint warning is under-scoped**: "reprint answer keys after
   editing" renders only inside `{version > 1}`, but version 1 *is* shuffled
   (pinned by test) — the teacher printing the default sheet with answers never
   sees the one warning that applies to them too.
10. **`paperAffordances.ts` is a 33-line module whose plural name and "these
    helpers" header describe a module that never materialized** — it exports one
    3-line function. Trivial, but it's the "comment describes intent, not code"
    class that S3's retro flagged, in miniature.
11. **The Ctrl+P residual is in its best possible open state — know it rather
    than fix it.** S8's preload-on-detect halved the LaTeX-fallback window
    (737 → 382 ms) without touching the barrier; TODOS carries the remainder
    with a named trigger (a real report of printed raw LaTeX) and an explicit
    "do not redo it" section. Eager-loading was rejected on measured grounds
    (KaTeX is 75 KiB gz against a 168 KiB shell).

## Refactor watchlist

**Cheap now:**

1. Cross-check the structural/document roster ids against e2e test titles (one
   unit test mapping ids → spec names), and add the missing
   `section-confidence` spec or delete the roster entry (~45 min) — closes
   finding 7 both directions.
2. Move the F12 reprint note outside the `version > 1` conditional (~10 min).

**Opportunistic:**

3. Rename/reheader `paperAffordances.ts` to match its one export, or grow it
   honestly next time an affordance helper appears.

**Policy:**

4. **Rosters are derived or cross-checked — never merely written.** The block
   roster cannot drift because it derives from the registry; the structural
   roster drifted within three days because it couldn't. Any future roster gets
   one of the two bonds at birth.

## What held up (no apology needed)

**The gate design itself** — spec-referenced assertions on printExpectations
rather than cross-surface pixel diff (rejected with reasons that stayed true:
two font pipelines make any threshold permanently red or vacuously loose), which
is what made "viewer-only improvement, named" an expressible concept instead of
a parity violation. **Red-green mutation discipline on every guard** — six
guards each proven to go red on the defect they exist for, including the gate's
own vacuous-pass hole once found. **The per-type break guard** holding CSS to
the registry across a boundary types can't cross. **The static-SVG extraction**
(`@activity/graph-kit/static-svg`, the `/scorers` discipline applied again) with
724 renderer tests passing unchanged as the proof the move preserved behavior —
and the OV4 rule type-enforced (only display variants *have* a `drawables`
field). **The readiness barrier** consumed today by three surfaces (student
button, foldable capture, foldable measure) with its accepted residual stated in
the code. **Typography D18A**: one font registry on all three surfaces, fallback
stacks deliberately per-surface, gate asserting by name. **The CI job** running
all 83 print specs on every PR with baselines in compare mode. **And the 7.3A
deferral is the repo's model promise**: the completion-panel/chip print
placements were put on the NOT-list, the interim placement shipped, and both the
component and the call site carry a note naming the owning slices — the exact
opposite of the S1/S3 promise rot, worth citing as the pattern.

---

## Independent audit (2026-08-06, second-pass)

Adversarial re-verification by a fresh-context auditor (all 14 commits re-read,
all counts recomputed, the print/registry guard files re-run green — 122 tests),
with the orchestrating session re-verifying the material new findings.

**Verdict on the retro:** the findings hold unusually well — all commit
characterizations exact, the 83 count corroborated, the roster drift real in
both directions as described. Two claims need tightening, and the blind spot is
the S0/S1 shape again: **the retro audits what S5 declared about print, not
what the shared token layer does to paper.**

### Confirmed

Findings 1–6 verbatim against their commits (T1a's wholesale-avoid wording,
S5-9's "the claim it was missing was wrong," T3's two bugs including the
test-double disease, the seven-defect enumeration bullet-for-bullet, the
vacuous-pass hole and its fix, T9's 32-vs-24 origin). 83 = 50+22+3+8 exact.
Both roster-drift directions confirmed (`printExpectations.ts:591` declared
unasserted; `print-rules.e2e.ts:310` asserted undeclared), and the unit guard's
hardcoded subset passes both. F12's `{version > 1}` gate vs
`printShuffle.test.ts:180-190`'s "every printed sheet shuffles — including the
default one." The Ctrl+P residual state, the readiness barrier's three
consumers, and the 7.3A deferral notes all verified.

### Corrected

1. **Finding 8's "exactly one place" is one too tight** — `PrintTreatment` has
   a second live read (`printExpectations.ts:473`, the `static-svg` branch)
   plus a coverage guard. Accurate phrasing: consumed only inside the gate's
   own module and its guard; zero product code. Substance survives.
2. **Citations**: F12 at `ActivityPrint.tsx:477-484`; the shuffle-v1 pin at
   `printShuffle.test.ts:189` (test opens `:180`); the 7.3A note at
   `StudentViewer.tsx:455-457`.
3. **"All 83 on every PR" needs a clause**: true in CI (the job sets
   `PRINT_BASELINES=1`); a local `playwright test print-` runs 61.
4. **83 is a *today* number, not S5's output** — 8 of it is S5.5's answer-key
   suite; S5's own slice-end figure was 51. The scope line makes this honest;
   a reader will still misattribute.

### Missed — what the retro never examined

5. **`--touch-target: 44px` survives into print, and nothing in the gate can
   see it** [orchestrator-verified: declared once, zero re-declarations in the
   print block]. Ten `min-height: var(--touch-target)` floors sit on printable
   rows (MC choices, matching items, ordering rows, short-answer control);
   tokens.css's print block flattens *color only*, and viewer.css's print rules
   reset background/border on exactly those selectors while leaving the height
   floor alone — so a four-option printed question carries ~1.85in of minimum
   height. No `printExpectations` rule mentions height; `PrintTreatment` has no
   vocabulary for it; the pagination test measures deliberately tall custom
   blocks. The gate is complete about what *exists* on paper and silent about
   how much paper it takes.
6. **The 6.1A pins are presence-only, and one control already escapes them** —
   `styles.test.ts` asserts `toContain('var(--touch-target)')` etc. (the
   weakest guard form), and `viewer.css:857` hardcodes `min-height: 44px` on
   the banner action with a comment claiming it's "the same floor the styles
   suite pins"; the suite cannot see it.
7. **The font registry catches names, not loading — and the only loading guard
   dies at S9.** A sixth font id is a compile error in `FONT_REGISTRY`, but
   `FONT_MENU` has no completeness check and the viewer's loader `switch` has
   no exhaustiveness assertion — a new font would appear in the menu and load
   nothing. The viewer has no font test file; the only
   menu↔registry↔fontsource-filename guard lives in the renderer's suite,
   which retires with it.
8. **`PAPER_COLOURS` is finding 8's unnamed twin** — one gate consumer, zero
   product code.
9. **The glossary integration test is the strongest thing in T1 and goes
   unmentioned** — it runs the real sanitizer and re-collects, on the stated
   reasoning that a definition mark is structurally what the secret-stripper
   hunts. One caveat: it *injects* the defined term, so "the fixture proves the
   sanitizer is safe" is not a property anything holds.
10. **The print header's aria-hidden decision is reasoned and unrecorded** —
    the fill-in header is hidden ("blank lines"), the version label
    deliberately not ("this is information"). A clean two-sided call absent
    from the retro and DECISIONS.

### Audit addenda to the watchlist

- Item 1: feasible; add the third leg — derive the unit guard's id subset from
  the roster instead of a parallel hardcoded list.
- **New, cheap (~20 min, and the only one that changes what a teacher gets on
  paper)**: pin `--touch-target` handling in the print block (missed-5).
- **New, opportunistic (~10 min)**: exhaustiveness-check the viewer's font
  loader before S9 removes the renderer's guard (missed-7).
