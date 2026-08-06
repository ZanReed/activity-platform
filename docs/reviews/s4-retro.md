# S4 retrospective — server grading (reviewed 2026-08-06)

**Scope:** slice S4 of the components-as-data rewrite (2026-08-01: migration 0020
`8bffd29`, engine `9eb5c9d`/`61dae3f`/`5dc1c53`, corpus `60351ea`, conformance
`69cafd8`, handler+function+bundle `fca653d`, client checking `09c25e4`, check leak
tests `ec4af1a`, live E2E `fd4fde9`/`cc330bd`/`f737461`), reviewed after S5–S8 and
before S9. **Evidence base:** commit history, the S4 eng-review record, a
fresh-context consumer survey of every S4 contract (corpus, section_checks,
idempotency, stale advisory, solutions/feedback, guards, bundle, grades cut,
error taxonomy — with recounted casts and precise zero-claims), and one live-repo
verification of the survey's sharpest finding. Method per `s0-retro.md`. An
independent audit pass is expected to append below.

## Verdict in one line

S4 has the arc's best engineering discipline — measure-first rulings, a corpus
that is *data* with justified coverage buckets, an authorization chain pinned on
*ordering* via port spies — and the arc's most embarrassing latent finding: **the
app was never wired to the function S4 built.** `StudentViewer` posts checks to
`check-section`; the deployed function is `check-activity`; the e2e mocks the same
wrong name, so every lane that could notice is self-consistently green
(verified live in the repo today; fix task filed). The wiring-proof lesson from
S1 and S3, in its fifth and sharpest form.

## Costs already paid (lessons banked, no action needed)

1. **The test double lied, and both sides believed it** (`f737461`). The handler
   test's fake `CorsKit` spread `details` at the top level while the real helper
   nests it — so `httpCheckService` read `body.code` where the server put
   `body.details.code`, `wire_version_mismatch` never matched, and T8's entire
   `stale_client` path could never fire in production. Both sides passed their own
   unit tests *because both were written against the same wrong assumption*; only
   the live E2E caught it. Standing lesson (recorded at the fix site): a double
   that does not match the real implementation is worse than no double — it
   manufactures confidence.
2. **The bundle ceiling caught a 1 MB MathLive leak on its first run.** Importing
   graph-kit's scorers through the package barrel produced an 8 MB grading bundle;
   the fix minted the `/scorers` pure subpath and the CLAUDE.md standing rule
   (server-side imports never touch the barrel). The ceiling paying for itself on
   day one is the argument for every ceiling since.
3. **Three plan-vs-reality gaps the build found that the review did not:**
   `plot_ray`/`plot_segment` were ungradable (the kit produced `shape` + endpoint
   styles; the wire dropped them — added as optional fields, no version bump,
   absent = unanswered); two assumed field names didn't exist (`strategy` is
   `answerType`; there is no `groupId` — a group is a maximal adjacent
   `interchangeableWithPrevious` run); and `ordering`'s omission rule needed a new
   idea — no `moved` flag exists, so the server *recomputes the served
   permutation* and reads "identical to served" as untouched.
4. **Two ratified rulings directly conflicted and the build surfaced it** (G1):
   6.1A requires unicode-minus normalization, 7.1A requires exact runtime parity.
   Ruled: a small closed set of look-alikes normalized on *both* sides — an
   input-method fix, never case folding — with the three divergence cases carried
   in the corpus as `runtimeDiffers`.
5. **Two guard gaps closed in passing:** the token guard only policed three name
   families, so the banner's `var(--font-size-sm)` silently resolved to nothing
   (now every `--*` reference is checked); and the store swallowed untyped check
   errors, making a client `TypeError` indistinguishable from a down server (now
   logged).
6. **S4's non-persisted idempotency key was overturned by S6-3** — a lost
   response plus a closed lid minted a second attempt; the key moved into
   persisted state, with the overturn reasoning written at the type
   (`persistence.ts:89-107`). The original call was wrong; the correction is a
   model of how to record one.

## Latent costs — what will bite future developers

7. **The app posts checks to a function that does not exist.**
   `StudentViewer.tsx:299` → `check-section`; the deployed function is
   `check-activity`. Every real student check 404s → `unavailable` → generic
   "Couldn't check — try again." on a button that can never work. Why nothing
   caught it: `verify-check-e2e.js` builds its own URL (proves the function, not
   the wiring); the Playwright helper intercepts `check-section` too
   (`studentSession.ts:241` — the mock is wrong the same way, so the browser lane
   is green); every unit test injects `CheckService` below the URL. Nothing
   asserts the URL names a real function. **Verified live 2026-08-06; fix task
   filed.** This is the S1/S3 wiring-proof failure again, with a new twist: an
   e2e mock retyped by hand instead of derived from the production constant is
   how a wiring bug becomes *invisible to the exact test built to catch it*.
8. **A pinned student gets two banners with opposite advice.** S6's
   republish-pinning path deliberately keeps checking the superseded version — so
   every such check carries `currentVersionId`, and S4's stale-version banner
   ("Reload to get the new version") renders inside `ViewerContainer` directly
   below S6's pinned banner ("your unsent work is safe here"), where reloading is
   exactly what pinning exists to avoid. The route's "at most ONE banner" dedup
   comment is true only of its own three-way chain; no test covers the
   combination.
9. **Two error kinds fall to copy that invites the wrong action.** `unavailable`
   (non-retryable — "not available to you") renders the generic "Couldn't check —
   try again," the precise retry-loop the taxonomy's header says it exists to
   prevent — and item 7 makes this the copy every student would actually see.
   And `SectionStatus.retryable` is written, typed, and documented as "the UI
   needs it to decide whether to offer Retry" — but nothing reads it; the comment
   describes UI that does not exist.
10. **The unbonded-roster family grew.** `FREE_TEXT_TYPES` (S0 watchlist item 7 —
    still open, file untouched since birth) duplicates the registry's `recorded`
    family; `PROMPT_CARRIER_TYPES` is declared twice with identical contents
    (`walk.ts:112`, `sanitize.ts:121`); and `matchMistakeFeedback` has two
    implementations (runtime + server) that the corpus does *not* bond — while
    `corpus.ts:31`'s header claims a 2.1A hint-fallback divergence case that
    isn't in the file. The counterexample proving these bondable sits in the same
    slice: `census.ts` refuses a second walk and imports the grader's inventory,
    pinned by an id-set-equality test. Related gap: the check-leak suite poisons
    solutions only — no poisoned-blank-inside-`hint`/`mistakeFeedback` case,
    though the path is the same `sanitizeOut`.
11. **The graph seam is held together by casts that assert the types don't line
    up.** `graphs.ts` carries 26 casts (13 `as never` at the `/scorers` call
    boundary) — the exact family `CORPUS_COVERAGE` classifies as parity
    "by-construction" because the engine imports the scorers. Repo-wide
    `as never` in the viewer is now 53 (the S0 audit's 49 plus within-line
    multiplicity). The by-construction claim and the cast pile cannot both be the
    whole story.
12. **The grading bundle's export surface is one-third fiction.** The Deno file
    imports 3 of `grading-entry.ts`'s 12 exports; the comment claiming the wire
    version is exported "so the Deno file and the client agree by import rather
    than by convention" describes an import that doesn't happen.
    `GradingSectionNotFound`, `GradableInventory`, `EXPRESSION_LIMITS`, and
    `serveSeed` have zero consumers; `attemptNumber` is emitted and typed but
    read by nothing client-side; and `checkSection()` returns a type narrower
    than its value, forcing the store to re-cast for `currentVersionId`.
13. **The one artifact that proves the live path is invocation-by-memory.**
    `verify-check-e2e.js` is in no runbook — the migrations/README regression set
    is SQL-only — so the post-deploy discipline that caught bug 1 exists only as
    precedent. And the expression guards create a documented asymmetry (server
    bounds hostile input, the published-page runtime doesn't) with no corpus case
    — acceptable only because the runtime dies at S9.

## Refactor watchlist

**Cheap now (before S9 locks things in):**

1. **Fix the check URL** (task filed): both sites → `check-activity`, bonded by a
   shared constant the e2e helper imports, plus a test that the URL's path
   segment names an existing `supabase/functions/` directory (~30 min).
2. Give `unavailable` its own non-retry sentence, and either read `retryable` in
   `ViewerContainer` or delete the field and its comment (~30 min).
3. Bond the rosters: derive `FREE_TEXT_TYPES`/`GRAPH_TYPES` from registry
   families, single-source `PROMPT_CARRIER_TYPES` (~30 min — closes S0 item 7).
4. Fix `corpus.ts:31`'s header (drop the 2.1A claim or add the case) and add one
   poisoned-hint leak case (~30 min).
5. Suppress the ViewerContainer stale banner when the route is pinned (or lift
   the advisory into the route's dedup chain), with a combined-state test (~1 h;
   small design call).

**Opportunistic (next time someone's in the file):**

6. Trim `grading-entry.ts` to what the Deno file imports; make the
   agreement-by-import comment true or delete it.
7. Widen `checkSection`'s return type to the response shape; decide
   `attemptNumber`'s consumer or drop it from the client type.
8. Add the runbook line naming `verify-check-e2e.js` as the post-deploy routine
   for any grading change.

**Policy (decide deliberately, not by accident):**

9. **E2E route mocks must be derived from production constants, never retyped** —
   a mock that is wrong the same way as the code makes the wiring bug invisible
   to the exact test built to catch it. This is the wiring-proof rule's fifth
   instance and its most instructive.
10. **A comment that asserts coverage is a claim; guard it or don't make it** —
    `corpus.ts:31` is the vacuous-pass lesson in documentation form.

## What held up (no apology needed)

**The corpus as data**: 46 cases executed by *both* engines in CI (the renderer
side renders through jsdom and scores with the runtime's own scorers), asserting
against the corpus's expected column, never against each other; coverage derived
from the registry with >30-char justifications per bucket, a reverse-drift guard,
and red-green mutation proof. **The authorization chain** is pinned on ordering,
not just status — port spies prove the parentage check runs *before* the document
read, and the foreign-version probe was proven refused on the live deployment.
**The idempotency chain** holds end-to-end (mint → persist → wire → partial
unique index → replay-returns-original-verdicts) with pins at six layers, and S6
strengthened it rather than replacing it. **Measure-first** closed R2 with n=42
deployed-function data, explicit reopen criteria, and a methodology note for the
re-measurer. **The DB-backed rate ceiling** is S2's own prescription applied
properly, and `rate_limited` gets its own student-facing sentence. **The
solutions channel** carries its rulings at the pin sites (S4-13, S4-T3 — "pinned
so changing it is a deliberate pedagogy decision rather than an accident"), and
all outbound `InlineNode[]` — solutions *and* feedback — pass the one
`sanitizeOut`. **`section_checks` became the substrate** for S7's analytics and
the retention arc without schema change. **The S4-3b cut held**: the grades table
is untouched since 0010, the deferral is documented in-file where a future
developer will meet it, and nothing partially built the frozen decision.
**verify-0020 is in the regression re-run set** with its two security boundaries
named. And the slice's hygiene matches S2/S3: zero TODO/FIXME anywhere in the
grading engine, every "deliberately" carrying its reason.
