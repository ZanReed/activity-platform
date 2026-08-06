# S6 retrospective — local-first (reviewed 2026-08-06)

**Scope:** slice S6 of the components-as-data rewrite (2026-08-02, V1–V10:
buffer `ca80e74`, queue `e5d2001`, tab lock `e8e212e`, sign-out `039f0ec`,
e2e harness `fe35a8e`, boot paths `9335aed`, failure matrix `a85f914`, service
worker `69fbc01`, preview-build lane `80c76e2`, close-out `7d6f59`-era docs;
plus the post-slice test-race fix `f0df8b5`), reviewed after S7–S8 and before
S9. **Evidence base:** the V1–V10 build narrative, five DECISIONS entries, the
S1/S3/S4 retro surveys (which each traced S6's seams from their own side), and
current-state spot-checks (the sw fixme, cache producers, e2e counts). An
independent audit pass is expected to append below.

## Verdict in one line

S6 is the slice whose **verification ladder found the slice's own bugs** — V6
caught V1 silently deleting student work, V7 caught V3's losing tab never
learning it lost and V4's hardened sign-out having zero callers, V9 caught the
worker not caching until the third visit — each invisible to the level of
testing that signed the previous step off; its costs were therefore paid
in-slice at unusual rates, and its latent residue is small, visible, and
parked honestly (one `test.fixme` that must close before S9, one purge
primitive with no producer).

## Costs already paid (lessons banked, no action needed)

1. **V1's orphan GC silently deleted unsent work** — it ran unconditionally on
   mount, so a teacher republishing overnight destroyed the buffer of every
   student with unsent work or a queued check; no error, no trace. V6 found it;
   the GC now has exactly one exception (`bufferHasUnsentWork`), tested from
   both sides so it still collects spent buffers. "The slice that built the
   buffer introduced the thing that destroyed it" — and the DECISIONS entry
   (S6-9) generalizes it: what happens to stranded work is the boot path's
   decision, never the GC's.
2. **V3's losing tab was never told it lost.** A queued Web Locks request is
   silent when the lock is taken — "will never be granted" is indistinguishable
   from "not granted yet" — so with the route starting optimistic, the second
   tab stayed editable and could clobber the first: the exact hazard V3 was
   written to prevent, shipped inside V3. jsdom has no `navigator.locks`, so
   **every unit test had been taking the single-tab branch**; only V7's real
   browser could see it. Fixed with the `ifAvailable` probe (the only way to
   learn "someone else holds this" without waiting for a turn that may never
   come).
3. **V4 hardened a function nothing called** — `signOutEverything` had zero
   callers while `Home.tsx` used the raw client method (the S1 wiring debt; V7
   paid it and attached the standing rule: every sign-out control calls this
   one). The companion flake lesson: the V7 clobber row's "stable over 4 runs"
   was measured at lane level and failed 4-in-5 in isolation, because its
   settling poll re-made the assumption the previous row had abandoned — fixed
   by *following* the race (settle, identify the live tab, then assert the
   guarantee), and the testing principle was written down: assert the
   guarantee, never which tab wins.
4. **V9 found the worker installs during the first visit** — that visit's own
   requests never pass through it, so nothing is cached and offline would not
   have worked until a student's *third* visit. `warmAssetCache` seeds the
   runtime cache from `performance.getEntriesByType('resource')` — exactly what
   the page used, no manifest to drift, nearly free because the assets are
   immutable.
5. **V8's lazy-chunk 404 recovery shipped ungated and turned a dev-server
   hiccup into a mid-test reload** ("execution context destroyed") — now
   production-gated, because the failure it fixes is a deploy artifact and
   neither content hashing nor deploys exist in dev.
6. **The slice's own tests raced React's effect flush** (`f0df8b5`, post-slice):
   `findAllByRole` resolves on the commit, not the passive effect, so a test
   could type into a store nobody was subscribed to — ~1 failure in 4 under
   full-suite load, never in isolation. Fixed in the shared helper (flush
   effects so "ready" means mounted AND wired), verified with 30 consecutive
   full-monorepo runs, and named as a class: any test that types before the
   mount effect has run is testing a store with no listeners.
7. **S4's non-persisted idempotency key was overturned** (S6-3) — the
   lost-response-plus-closed-lid case minted a second attempt at exactly the
   moment the network is worst; the key moved into the persisted buffer, the
   old "deliberately NOT persisted" comment replaced in place with the
   reasoning that superseded it, plus the corollary (the queue mints nothing —
   two authorities over one key is two attempts).

## Latent costs — what will bite future developers

8. **The offline-reopen promise is still unproven** — the two sw rows are one
   `test.fixme` (`service-worker.e2e.ts:141`) with the full evidence trail in
   TODOS: under emulated offline the navigation serves 200 while parse-time
   subresources die `net::ERR_FAILED`, with Playwright's routing ruled out.
   Parked *visibly* with the next thing to try (stop the preview server
   instead of emulating) — and STATE names it a **hard pre-S9 gate**, since
   cutover is when students meet the path. The right state for an unproven
   promise; the risk is only that S9 arrives without it.
9. **`purgeStudentCaches` remains defence-in-depth with no producer** — V8
   retired the user-scoped runtime cache design (the API is never
   worker-cached), so the sign-out call purges a cache family nothing writes.
   The judgment call is recorded in the V8 narrative ("worth revisiting if it
   never gains one"); at S9 it should either gain its producer or be trimmed
   to match reality.
10. **The jsdom-blind class is structural, not incidental.** Web Locks,
    service workers, real offline, StrictMode double-mounts — four S6 bugs
    were invisible to unit tests *by category*. The three e2e lanes are the
    standing mitigation, but the lesson generalizes: any new
    browser-API-backed feature should get its e2e row in the same slice, not
    after (V7 existing is why S6's bugs died in-slice; S3's a11y pass not
    existing is why that debt is still open).
11. **Cross-slice residue already filed elsewhere, listed here for the S6
    reader**: the idle watchers S6-6 built remain wired to nothing
    (s1-retro 9); the pinned-version banner S6 added collides with S4's
    stale-version banner in opposite-advice form (s4-retro 8);
    `VIEWER_STORE_SCHEMA_VERSION` stayed at 1 through S6's real shape change
    (s3-retro 9); and mount-time sweeps vs sign-out purge remain two
    independent hygiene paths (s1-retro 14).

## Refactor watchlist

**Cheap now (before S9 locks things in):**

1. Close the sw-offline fixme by the documented next step (real server stop
   instead of `context.setOffline`) — it is the one S9 gate in this slice
   (effort unknown until tried; the investigation is already written up).
2. Decide `purgeStudentCaches`'s fate at the S9 boundary: producer or removal
   (~15 min once decided).

**Opportunistic:**

3. When the idle chrome lands (2.4A, S9), wire it through `watchIdleSignOut`
   and the sign-out rule comment in `Home.tsx` — the pieces exist on both
   sides; only the join is missing.

**Policy (decide deliberately, not by accident):**

4. **Browser-API features get their real-browser e2e row in the same slice** —
   the V7-in-S6 pattern is why S6's four jsdom-blind bugs died in-slice; make
   it the rule rather than the habit.
5. **"Stable at lane level" is not "stable"** — flake claims are measured
   per-spec in isolation (the V8 correction to V7's claim earned this).

## What held up (no apology needed)

**The layered verification ladder itself** — each V-step's review caught the
previous step's invisible bug, which is the strongest possible evidence the
cadence was worth its cost. **Web Locks over the sketched heartbeat**: the lock
releases when the holder dies, deleting the staleness guess Chromebook
throttling would have made wrong in both directions — and the
steal-is-the-notification design (no BroadcastChannel: a second channel
carrying the same fact is a second thing that can disagree). **Read-only as one
`<fieldset disabled>`** rather than a prop threaded through 22 components — a
block type added years from now inherits it without knowing the rule exists.
**The queue that owns no queue**: `pending` derived from the store, rebuilt on
hydrate, one in flight per student, session refreshed *before* firing so an
expired token never burns an attempt, and the coalescing re-run fix (never two
runs, never a missed edge) mutation-pinned. **The e2e harness changing no
shipped code** — a faked session via the storage key plus path-matched route
interception, with the one supabase-js internal it leans on pinned by a unit
test that names the failure it prevents. **The three-lane separation** with
pinned env (the reused-server key-derivation trap reasoned in DECISIONS).
**`documentCache` split from the buffer** so a 40 KB document isn't
re-serialized on a debounce as a student types. **The key-grammar
generalization** (`activity-viewer:<kind>:<user>:<activity>:<version>`) letting
one sweep cover both stores. And **the honest-limitation register**: expired
token + offline shows the pre-auth gate, recorded with the reason the fix was
refused (it would need the test-harness internal in shipped code) — the
residue is known, bounded, and written where the next developer will look.
