# S8 retrospective — perf-budget CI (reviewed 2026-08-06, PREMATURE)

**Scope:** slice S8 of the components-as-data rewrite (2026-08-05: the shell
split, `scripts/check-perf-budget.mjs` + `perf-budgets.mjs`, the throttled
timing lane, the perf-marks contract, preload-on-detect `0e0c888`, ruling
record `e3fbcf3`), reviewed **one day after it closed, with zero downstream
slices**. This retro is deliberately thin: the method's core evidence — later
commits that fixed or bypassed the slice's decisions — cannot exist yet. What
it can do is bank the in-slice lessons, verify design-vs-shipped, and name what
the *real* S8 retro (after S9) should check. An independent audit pass is
expected to append below; the re-run after S9 matters more.

## Verdict in one line

S8's build honesty is the takeaway — a cap pinned at the *measured* 168.1 KiB
with the 150 target kept alive as a TODO rather than quietly redefined, a
vacuous route smoke caught before it shipped, and a false binary (eager vs
lazy KaTeX) dissolved by measurement — but every one of its gates is one day
old, and whether they hold, rot, or get bypassed is exactly what cannot be
reviewed yet.

## Costs already paid (in-slice; lessons banked)

1. **The route-mount smoke as first ruled was vacuous** — every teacher route
   sits behind `RequireAuth`, so an unauthenticated smoke passes on six broken
   chunks. The outside voice caught it pre-build; the smoke now signs in and
   asserts each lazy chunk was actually fetched. The repo's vacuous-pass
   family (empty-fixture leak scan, verify-0022 C1, the S5 gate hole) gains
   its fourth member — caught earlier in the lifecycle than any predecessor.
2. **CDP throttling silently doesn't apply to service-worker-mediated
   fetches** — and the prod build registers a worker immediately, so the
   timing lane's numbers would have been fiction. It now asserts a fresh
   context and `workerStart === 0` on every measured resource.
3. **Four defects found by running things, all in test code**: the ambiguous
   `Loading…` selector (route loading vs Suspense fallback → `data-route-
   fallback`); the periodic fixture filler gzip crushed so three over-cap
   cases landed under cap (→ `crypto.randomBytes`); off-render-path
   pwa-register chunks breaking an "exactly one chunk" assertion; and the
   Skeleton also rendering `.viewer-section`, letting the timing spec read a
   mark before the worksheet existed.
4. **T7 was a false binary dissolved by measurement**: "eager-load KaTeX if
   cheap" was a chunk-policy question wrapped around a timing question.
   Preload-on-detect halved the LaTeX-fallback window (737 → 382 ms) at ~40 ms
   cost, with eager rejected on numbers (+45% first load per math page).

## What cannot be judged yet — the real retro's checklist (post-S9)

5. Do the budgets **fail** anyone before S9? A gate that has never fired is
   the dormant-safeguard class (S2's limiter lesson) — the failure-path tests
   exist (`check-perf-budget.test.mjs` builds broken dists), which is the
   designed answer; watch whether a real regression is caught or argued
   around.
6. Does the **2× timing ceiling** survive contact with runner variance, or
   start getting re-run-until-green (the exact failure D3 predicts for tight
   gates)?
7. Does the **marks contract** stay additive-only through S9's route changes —
   and does the pinned-literal test catch the first rename attempt?
8. The **150 KiB TODO**: does the auth-client lever get pulled, or does 168
   quietly become the number? The DECISIONS entry says a budget that
   redefines its target teaches nobody — hold it to that.
9. **Recalibration triggers** name "after the S9 cutover" explicitly — verify
   the re-measure actually happens (the S3 boomerang and pre-S8 a11y pass are
   the cautionary precedents for named-but-unowned follow-ups).

## Watchlist

1. **Cheap now:** nothing — the slice is a day old and its own close-out was
   clean; manufacturing items would be noise.
2. **Policy (already earned):** measure before choosing between a binary's
   arms — three S8 rulings (D4's split boundary, T7, the 2× ceiling) were
   settled by numbers where the plan had arguments, and each landed somewhere
   neither argument predicted.
3. **Process:** re-run this retro after S9, against the checklist above.

## What held up (design-vs-shipped verification, one day in)

The shell split shipped exactly as ruled (entry chunk = student shell,
statically imported, 2.86 MB → 592 KB raw); the three Edge-Function ceilings
moved to one commented home with their values pinned by test against
transcription error; deterministic bytes gate while milliseconds record; the
gate asserts its own preconditions before trusting any measurement (missing
dist, unparseable worker, zero-match ledger rows — each red branch exercised
against a deliberately broken fixture); and the marks contract lives in the
viewer as a dependency-free leaf both stampers share. All verified present at
HEAD. Whether they *hold* is the next retro's question.

---

## Independent audit (2026-08-06, second-pass)

Adversarial re-verification by a fresh-context auditor, with the orchestrating
session re-verifying material findings.

**Verdict on the retro:** every number, defect narrative, and artifact claim is
exact — the design-vs-shipped verification genuinely holds, the thinness is
honest, and the checklist is well-aimed. Two things are wrong: **168.1 KiB is
not the committed cap** (185 is, with ~10% headroom — the retro drops the slack
DECISIONS states plainly), and **"no cheap-now items" does not survive
contact**: the timing gate is unarmed, the route smoke's headline assertion is
partly vacuous by the very defect S8 discovered, and CI already auto-retries
the lane whose re-run-until-green failure mode checklist item 6 watches for.

### Confirmed

All split numbers exact across HISTORY, DECISIONS, and the commit body. The
150→168 honesty carried in three independent places. The vacuous route smoke
documented in the spec's own header; the CDP/SW finding implemented as claimed
(`workerStart > 0` filter, fresh context, serial worker). All four test-code
defects real, each with a comment at its fix site. T7's numbers verbatim. All
claimed artifacts at HEAD: the five preconditions incl. the zero-match ledger
case, the 40/60/1500/4000 pins with the "why isn't it in the diff" framing,
the literal mark strings pinned *and* cross-checked against the config copy,
13 broken-fixture cases (5 VACUITY-prefixed). **Bonus, unclaimed and true:**
the perf marks are stamped on the pinned and offline boot paths too (all three
`preloadMathIfNeeded` sites), so the instrumentation is not happy-path-only —
only the *measurement* is.

### Corrected

1. **"A cap pinned at the measured 168.1 KiB" is wrong — `SHELL_JS_GZ_KIB =
   185`.** 168.1 lives only in prose; DECISIONS says "a regression pin at the
   real number **with ~10% headroom**." The distinction matters for checklist
   item 8: 168 can drift to 185 without a single red build (same shape: CSS
   11.3 measured / 14 cap; katex 75.2 / 85).
2. **`e3fbcf3` is not a "ruling record"** — it is the main S8 build commit;
   HISTORY says S8 landed in two commits and the scope line mislabels one.
3. **Checklist item 6 is unanswerable as written: the 2× ceiling cannot
   currently fire.** `TIMING_TARGET_MS` is null for both calibrated marks, the
   ceiling derives to null, and the assert returns early on null —
   `mathRendered` has no entry at all, so the one mark S8 spent its measurement
   budget on has no baseline and no pin. "Milliseconds record" is accurate; the
   checklist implies an armed gate that does not exist.

### Missed — what the retro never examined

4. **The route smoke's headline assertion is partly vacuous — by the exact
   defect S8 discovered.** The "split works" leg counts every `/assets/*.js`
   response with no dedup and **no `NON_RENDER_CHUNKS` filter**, and the SW
   registration pulls two chunks on every prod load — so entry + 2 SW chunks
   clears `toBeGreaterThan(1)` before the route chunk is considered. The
   sibling test in the same file applies the filter. The fourth member of the
   vacuous-pass family, landing inside the fix for the third.
5. **CI auto-retries the perf lane** (`retries: process.env.CI ? 1 : 0`,
   inherited) — the re-run-until-green mechanism checklist item 6 watches for
   is already automated, once, before a human sees it.
6. **D5's "one home" holds for code, not prose** — the 40/60 numbers are still
   restated in RUNTIME.md (×2) and CLAUDE.md, the exact "two places to find"
   failure D5's rationale names.
7. **Nobody owns the content markers.** A dependency bump that changes a
   library-internal marker string fails loud (well designed, tested) — but no
   doc says who re-derives a marker, and the failure message's cheaper branch
   is "delete this row." The next upgrade's path of least resistance deletes a
   guard. Also unpriced: the perf job's minutes-per-PR (no `timeout-minutes`),
   which makes the checklist's cost side unfalsifiable; and the route smoke's
   "signs in" is the fabricated-localStorage student session reused for
   teacher routes — any future role-gated route passes this lane while broken.

### Audit addenda to the watchlist

- **Rewrite item 1 — three cheap items exist**: (a) set `TIMING_TARGET_MS`
  from the recorded runs and add a `mathRendered` entry, arming the ceiling
  (~15 min); (b) apply `NON_RENDER_CHUNKS` + dedup to the route-mount chunk
  assertion (~10 min); (c) correct the 168.1-as-cap sentence — item 8's real
  question is "does the number quietly drift to 185."
- **Add to the post-S9 checklist**: whether the CI retry got exercised, and
  the lane's minutes-per-PR.
- **New, opportunistic**: finish D5 on the doc side (RUNTIME.md ×2,
  CLAUDE.md).
- **New, policy (earned by missed-4)**: when a slice's headline lesson is
  "this check was vacuous," re-run that lesson over the *fix* before banking
  it.
