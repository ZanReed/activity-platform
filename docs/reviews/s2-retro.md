# S2 retrospective — read API (reviewed 2026-08-06)

**Scope:** slice S2 of the components-as-data rewrite (commit `8ce27f2`, 2026-07-28:
get-activity Edge Function, migration 0017, `packages/viewer/src/sanitize/`,
`packages/schema/src/upgrade.ts`, the viewer-server bundle; plus the same-week
follow-ups `0a07281` handler extraction, `5f41401`/`ac452b0` rate-limit fixes,
`caee7ba`/`909c583` verification fixes), reviewed after S3–S8 completed and before S9
cutover. **Evidence base:** the commit history since S2, a fresh-context consumer
survey of every S2 contract (all three API modes, cache table, `SANITIZER_REV`,
sanitize module, upgrade seam, shuffle, handler template, rate limiter, leak-test
infra, bundle), and friction markers at the seams. Method per `s0-retro.md`. Written
by the reviewing session — an independent audit pass is expected to append below.

## Verdict in one line

S2's *architectural bets* held up better than any slice so far — the computed
`SANITIZER_REV`, the fail-safe cache-fill, the frozen check wire, and the single
sanitize walk all became load-bearing exactly as declared, and S4/S7 built on them
rather than around them; its *paid costs* were operational (a decorative safeguard
masking a classroom-lockout miscalibration; verification that couldn't fail reading
as verification that passed); and its *latent tax* is seam duplication — parallel
error taxonomies, duplicated helpers with diverging behavior, three shuffle-seeding
schemes, and test-only exports riding the production bundles.

## Costs already paid (lessons banked, no action needed)

1. **The rate limiter was decoration, and its inertness masked the bug that
   mattered.** Live deploy verification (95 sequential anonymous requests, zero
   429s) proved the per-isolate Map is empty on most requests — no in-memory scheme
   works on Edge Functions. Worse: the inert limiter was keyed per-IP at 30/min, and
   **a classroom is one IP** — had it worked, the pre-auth interstitial would have
   429'd a class at "open this link now," and the first written advice ("port it to
   a DB counter") would have shipped the outage in working form. Fixed same-day
   (`5f41401`, 600/min with the topology reasoning above the constant). Durable
   rules banked in DECISIONS: per-IP is the wrong primitive for a product whose
   users arrive thirty-at-a-time from one address, and **a dormant safeguard hides
   its own miscalibration** — "it never fires" reads as "it's fine." S4-5 later
   applied the prescription properly: check-activity's only ceiling is DB-backed
   per-student, reusing none of the isolate limiter.
2. **Verification that cannot fail, twice.** The first content-path run passed all
   10 wire probes against an *empty* activity — recorded as a vacuous pass, not
   evidence (a leak scan over a fixture with no secrets cannot distinguish "stripped"
   from "never present"). Then fixture 2's first run reported **13 leaked fields** —
   all false positives: the fixture documented its own probe list in backticked
   prose, and substring probes matched the string *values* as readily as JSON keys
   (`909c583`: probes now match `"field":` with the colon; the fixture keeps one
   deliberate sentence as a precision control). Both lessons are in DECISIONS: check
   what the fixture contained before believing a green run, and prefer scanning the
   stored artifact server-side.
3. **0017 was recorded-but-never-run** — the author's push failed at 0013, yet
   migration history ended up listing 0017 as applied while its DDL never executed:
   strictly worse than unapplied, because it is skipped forever and surfaces as a
   runtime 500. Refined S1's "repair, then push" into repair + push + **positive
   existence check** of the objects the migration creates.
4. **The handler shipped inline and untested; the fix became the template.** S2's
   Deno function carried its logic un-unit-tested until the next-day test-setup
   review extracted it into the tested server bundle behind DI ports with 29 branch
   pins (`0a07281`). The extraction, not the original, is what S4 copied.
5. **The deno.json directory alias uploaded ~6.9 MB of bundles get-activity never
   imports** (renderer + grading) on every deploy, unnoticed until a 413
   (`33916c1`). The alias was never used by any import — pure upload weight from a
   config line nothing consumed.

## Latent costs — what will bite future developers

6. **Two error taxonomies share four spellings and no code.** S4 built
   `CheckErrorKind` (`httpCheckService.ts`) parallel to S2's `ViewerErrorKind`
   (`readClient.ts`) instead of extending it: `unservable` became `server_error`,
   `stale_client`/`rate_limited` exist only check-side, and the `retryable` flag
   exists only there too. Each is internally sound (both switch exhaustively), but a
   developer adding an error kind must know there are two lists and which surface
   reads which.
7. **The serve-shuffle seed agrees by convention, not by symbol.** The read path
   composes `` `${versionId}:${userId}` `` inline
   (`get-activity-handler.ts:450`) while `serveSeed` lives in `grading/servedOrder.ts`
   — two spellings of the contract that keeps grading honest about what each student
   saw, bonded by nothing. And there are **three shuffle-seeding schemes on two
   implementations**: viewer FNV-1a (`sanitize/shuffle.ts`), renderer xmur3
   (`renderer/src/blocks/shuffle.ts` — different hash, different permutations, so a
   published page and the viewer never agree on an arrangement; retires at S9), and
   `Matching.tsx`'s block-id-only seeding.
8. **Duplicated helpers have already diverged in behavior.** `jwtSub` /
   `jwtSubject` are the same function pasted into both handlers (which already
   import `CorsKit`/`DbResult` from each other), and `UUID_RE` exists twice **with
   different strictness** — the read API accepts activity ids the check API rejects
   (get-activity takes any hex nibbles; check-activity requires a real version
   nibble and RFC variant).
9. **Test-only exports ride the production bundles.** `server/index.ts` re-exports
   `META_MAX_PER_WINDOW`, `META_WINDOW_MS`, `createMetaRateLimiter`, `jwtSub`, and
   `API_VERSION` into the Edge Function bundle whose Deno file imports only
   `createGetActivityHandler` + one type; `SANITIZER_ALGO_REV` is exported from
   three modules and read by nothing but its own hash input (never bumped since
   birth — the logic-only escape hatch has never been exercised); `serveSeed` ships
   in the grading bundle unexercised by function or test.
10. **The sanitizer's type story is assertion, not proof.** The transform is a
    `Record<string, unknown>` mutator that *asserts* `SanitizedActivityDocument`
    (eight `as unknown as` sites across `sanitize.ts`/`shuffle.ts`/
    `printShuffle.ts`); the proof lives in the wire scan plus
    `sanitized-types.test-d.ts` — which the S0 audit already flagged as having no
    completeness guard. Sharpest cast: `servedOrder.ts:48-50` feeds a *raw* document
    through `applyServeShuffles` cast to sanitized and back (justified in-file);
    `readClient.ts:130` bolts an undeclared `body` field onto a declared error class
    via structural cast.
11. **`activity_version_reads` quietly gained a second writer.** 0026's nightly
    `run_analytics_maintenance` GC deletes stale-rev rows keyed off the *newest
    row's* rev — with a documented heuristic hazard (right after a deploy the newest
    row still carries the old rev; failure mode is a cache miss, not bad data). The
    table's writer set is no longer "the function only," and the next reader of the
    S2 design docs won't learn that there.
12. **The committed leak fixtures are operator-run only.** `leak-test-fixture.md`
    and `-2.md` have zero code references — they are hand-imported and probed via
    `scripts/verify-content-path.js` in a browser console. The wire-level live scan
    that caught the vacuous pass is a discipline, not a harness; nothing re-runs it
    after a sanitize change. (The unit-level scans are automated and strong — this
    is only about the live end-to-end leg.) Relatedly, there are now **three leak-
    scan rules across three channels**: read = blanket sentinel scan, check =
    value-based with a releasable list, print = none (print's safety is consuming
    the sanitizer; no independent wire proof exists — `print-twins.test.tsx` checks
    one graph case).
13. **`SANITIZER_REV` hashes the whole `SanitizeSpec`** — the S0 retro's finding 6,
    owned mechanically by S2: the fork ("add the field where it belongs and orphan
    the cache, or place it outside the spec") was already taken once
    (`print.shuffled` lives outside; the near-identical second walker exists because
    of it). The literal-value pin (`printShuffle.test.ts` pins `'1-f8328527'`) is
    what keeps print changes from silently moving the rev — a good guard whose
    existence a future field-adder needs to know about.

## Refactor watchlist

**Cheap now (before S9 locks things in):**

1. Extract the serve-seed to one shared symbol imported by both the read handler
   and `servedOrder` (~15 min) — the grading-honesty contract shouldn't be two
   strings agreeing by luck.
2. Unify `jwtSub`/`jwtSubject` and pick one `UUID_RE` (decide: strict everywhere,
   or document why read is looser) (~20 min).
3. Trim the test-only re-exports from `server/index.ts` (tests can import module
   files directly) and drop `SANITIZER_ALGO_REV`'s two dead re-exports, keeping the
   constant with a comment naming it the never-yet-used logic-only escape hatch
   (~20 min).
4. Give print the sentinel wire-proof it lacks: render `leakFixture`'s document
   through the print path and scan — the fixture already exists (~45 min).

**Opportunistic (next time someone's in the file):**

5. When touching the check client or viewer errors, fold the two taxonomies into
   one module (or at least document the `unservable`→`server_error` rename and the
   one-sided `retryable`).
6. Wire the fixture-1/2 live scan into a repeatable post-deploy script entry (a
   runbook line naming `verify-content-path.js` as the routine), or automate it in
   the e2e harness.
7. Note the 0026 GC as a second writer in the S2 section of DECISIONS (one
   sentence, next time it's edited).

**Policy (decide deliberately, not by accident):**

8. **A protective mechanism that never fires is untested, not fine** — dormant
   safeguards get a liveness check (force it to trigger once, in a test or against
   the live platform) before being credited in any design description. The limiter
   earned this rule; it applies to every future throttle, quota, and fallback.
9. A green verification run counts only after checking what the fixture actually
   contained (the vacuous-pass rule — already in DECISIONS; elevate it to standing
   practice for every new channel's first leak scan).
10. Do **not** unify the renderer/viewer shuffle implementations before S9 — the
    renderer's copy dies at cutover, and "fixing" the divergence would change
    published-page arrangements for no benefit.

## What held up (no apology needed)

The **computed `SANITIZER_REV`** designed out the forgettable hand-bump exactly as
intended — spec changes orphan cache rows automatically, print-spec changes
provably don't. The **fail-safe cache-fill** contained S7's function-ahead-of-
migration window precisely as designed: census error → cache row withheld → student
still served a correct 200, self-healing once 0026 landed. The **DB-table cache
home** (a public R2 object would have bypassed the auth rule entirely) took S7's
census and GC as two new ports with the response envelope untouched. The
**DI-ports handler template** became the S4 pattern by citation, not accident —
check-activity's header names get-activity as the model, imports `CorsKit`/
`DbResult` rather than redeclaring, and the branch pins grew 29 → 37 (S7's block)
with a 39-pin sibling suite; zero pins weakened. The **single deep walk**: S4-4's
outbound sanitize is the same `stripInBandSecrets` by design, so one new secret
field protects both channels. **`servedOrder` re-derives the shuffle by calling the
same `applyServeShuffles` with the same seed** — the one place where duplication
was refused because divergence would silently mis-grade a subset of students. The
**frozen check wire + `createHttpCheckService` written before S4 existed** gave S4
a concrete consumer to implement against. The **upgrade seam** holds four callers
(read, check, census backfill, teacher print) with the chain still empty and
v1-fails-loudly pinned. The **anti-drift guards** (every strip path must resolve;
every suspicious key must be declared; `data_plot.data` asserted *present* so the
whitelist can't become a silent skip) are the reason the sanitize module could be
consumed by four downstream surfaces without a leak class recurring. And S2's
DECISIONS entries are the repo's best rationale record — every residual (shared-
profile cache, unverified JWT decode, non-crypto PRNG, the inert limiter) is
documented *in the file where the next reader will meet it*; this retro found no
rationale gaps at all.

---

## Independent audit (2026-08-06, second-pass)

Adversarial re-derivation by a fresh-context auditor (all eight commits re-read,
every count recounted, every cite line-checked), with the orchestrating session
re-verifying material findings.

**Verdict on the retro:** unusually accurate on numbers — 29→37 and the 39-pin
sibling are exact, as are all eight commit characterizations, the eight cast
sites, and the four shared error spellings. Two findings are wrong in a familiar
way (a "dead" symbol that runs in production; an undercount hiding a live
divergence), one absolute is self-contradicted by the retro's own finding 8, and
the blind spots repeat the S0/S1 shape: **the retro audits what S2 declared, not
the machinery S2 built to enforce it** — the CORS port, the deploy flag, the CI
drift guard, and the cache key's blindness to the schema version were never
opened.

### Confirmed

All commits verbatim. The rate-limiter narrative (95/zero-429s, 30→600,
classroom-is-one-IP), the 13 false positives with the exact-13 correlation and
the surviving precision-control sentence, 0017 recorded-but-never-run. Pins
29→37 exact; sibling 39 exact; **zero pins weakened** (the only later edit is
S7's +164/−15 setup refactor; sanitize.test's −357 is the fixture extraction,
tests 21→22). `jwtSub`/`jwtSubject` byte-identical. `SANITIZER_ALGO_REV` never
bumped, zero importers of either re-export. Eight `as unknown as` sites exact.
The 0026 second writer + hazard verbatim. Fixtures 1/2 zero code references.
Three leak-scan rules; print has no sentinel scan. Upgrade seam exactly four
callers. The `1-f8328527` pin. S4-by-citation confirmed in the sibling
handler's own header.

### Corrected

1. **`serveSeed` is not "unexercised by function"** — `computeServedOrderings`
   calls it and the live Deno wiring calls that on every check request. Only the
   *export* is dead. The sharper missed finding: **`computeServedOrderings` has
   zero test coverage at any level** — every handler test stubs the port — so
   the function the held-up section praises as "where duplication was refused"
   is untested production code reachable only through untested Deno wiring.
2. **"~6.9 MB of bundles get-activity never imports" repeats the commit's loose
   arithmetic** — renderer + grading = 6.24 MB; the ~6.9 figure is the whole
   `_shared` directory including the bundle it *does* import.
3. **`UUID_RE` exists four times, not two** (loose in get-activity,
   ingest-submission, get-feedback; strict only in check-activity) — the strict
   copy is the outlier, and watchlist item 2 is a four-site decision.
4. **"Three seeding schemes on two implementations" undercounts and misplaces
   `Matching.tsx`.** Four schemes (the retro omits `printSeed` entirely), and
   `Matching.tsx` is in the *viewer* using the viewer's FNV-1a — so the same
   `block.id` deals a different arrangement than the published page did, and
   that divergence does **not** retire at S9; it is the successor surface.
   (`mulberry32` is byte-identical in both files; only the string hash differs.)
5. **"No rationale gaps at all" is contradicted by the retro's own finding 8**
   (the `UUID_RE` divergence has no recorded why), and by a second independent
   gap: nothing records why the read-cache key omits the schema version
   (missed-3 below).
6. **Watchlist item 1's estimate ignores a bundle boundary** — the shared seed
   symbol must land where the read bundle can import it without dragging
   grading past the 1500 KiB ceiling; item 3 must budget both bundle
   regenerations or CI's drift guard reds.

### Citation and framing fixes

"Both switch exhaustively" — only the read side does (a total `Record`); the
check side reads `kind` structurally. `httpCheckService.ts` is in `client/`, not
the server tree. The Deno file also imports four helpers from `_shared/cors.ts`.
Item 4's print scan must pin `showAnswers=false` (the answer-key channel is a
second, deliberate secret path beside the sanitized doc). The scope line never
states the bundle number: 966.69 KiB against 1500 (64% consumed).

### Missed — what the retro never examined

7. **`_shared/cors.ts` is the CorsKit's entire real implementation and nothing
   tests it** — shared by every function, untouched since the repo's initial
   commit, stubbed by every handler suite. `ALLOWED_ORIGINS` defaults to `'*'`
   and a non-matching origin is answered with `allowed[0]`. The port is proven;
   the thing behind it never was.
8. **There is no `supabase/config.toml` — the `--no-verify-jwt` flag exists
   only in an npm script.** Any deploy by another route silently re-enables the
   JWT gate and 401s the anonymous META branch, which the client maps to the
   sign-in screen — a failure that looks like normal behavior. The CLI supports
   a declarative pin; it is unused, and nothing verifies the live flag.
9. **The read cache is blind to the schema version.** `SANITIZER_REV` hashes
   `{algo, secret-field lists, specs}` — no `ACTIVITY_SCHEMA_VERSION`, no
   upgrade-chain fingerprint. The first v2→v3 upgrade step leaves every cache
   row valid and serving *pre-upgrade* artifacts until GC'd, and
   `SANITIZER_ALGO_REV`'s comment scopes the manual hatch to "the transform
   logic itself." Finding 13's fork on the axis nobody looked at, inside the
   mechanism the retro credits as S2's best design.
10. **The upgrade 500 ships document internals to the student** — the handler
    puts `UpgradeError.message` (up to three zod paths + messages from the
    stored document) into the response `detail`, sixty lines below the code
    that suppresses RPC errors precisely so "no internals leak." Deliberate in
    tests, undocumented in decisions.
11. **Favorable set**: the stale-version retry cannot loop (one follow, then
    rethrow); `verify-0017.sql` has *not* rotted structurally — but §C1's
    expectation is stale (post-0021, every live teacher's display_name is NULL,
    so the correct expectation is a NULL `teacher_name` row) — the S1-audit's
    hand-copied-expectations lesson landing again; `upgrade.ts`'s design holds
    (typed error taxonomy, real YAGNI win; one S0-pattern residue:
    `fromSchemaVersion` has no consumer). Also unmentioned from `8ce27f2`'s own
    diff: the CI bundle-drift guard — arguably S2's most-copied machinery.
12. **A fourth sanitizer channel**: the foldable runs the same
    sanitize+print-shuffle posture headlessly with its own `showAnswers` path
    and no wire proof — the "three channels" framing omits it. And the pre-auth
    hot path constructs a fresh Supabase client per META request while `admin`
    is module-scoped — undocumented, on exactly the branch the 600/min ceiling
    protects.

### Audit addenda to the watchlist

- **New, cheap-now**: pin `verify_jwt = false` in a `supabase/config.toml`
  (missed-8) — the flag is one npm-script away from silently 401'ing every
  student's first screen.
- **New, cheap-now**: a direct test for `computeServedOrderings`
  (correction 1) — the retro's own thesis (divergence silently mis-grades) is
  the argument.
- **New, before any schemaVersion 3**: fold the schema version (or an
  upgrade-chain fingerprint) into `SANITIZER_REV`'s material, or name the
  upgrade chain as a bump trigger in `SANITIZER_ALGO_REV`'s comment (missed-9).
- Rewrite items 1–2 per corrections 3, 4, 6; extend item 4 to
  `showAnswers=false` + the foldable; fix `verify-0017.sql` §C1's expectation.
- **New, policy**: a decision recorded only in a `package.json` script is not
  recorded — deploy-time flags belong in declarative config with a verification
  step, next to the dormant-safeguard rule the limiter earned.
