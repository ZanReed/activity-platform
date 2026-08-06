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
