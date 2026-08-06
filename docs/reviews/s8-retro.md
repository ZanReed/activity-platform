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
