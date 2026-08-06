# S6 retrospective — local-first (reviewed 2026-08-06)

**Scope:** slice S6 of the components-as-data rewrite (2026-08-02, V1–V10:
buffer `ca80e74`, queue `e5d2001`, tab lock `e8e212e`, sign-out `039f0ec`,
e2e harness `fe35a8e`, boot paths `9335aed`, failure matrix `a85f914`, service
worker `69fbc01`, preview-build lane `80c76e2`; V1–V9 plus the close-out docs
commit `7d18b87` — the original scope line cited `7d6f59`, which is not a
commit, and invented a V10 rung (own audit, correction 1); plus the post-slice
test-race fix `f0df8b5`), reviewed after S7–S8 and before
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

---

## Independent audit (2026-08-06, second-pass)

Adversarial re-verification by a fresh-context auditor (every commit
re-resolved, every current-state claim re-derived, every cross-slice pointer
opened in the retro it cites), with the orchestrating session re-verifying
material findings.

**Verdict on the retro:** the strongest of the series on narrative accuracy —
the V-ladder account is exact in every particular and no finding is invented.
But it inherits the build narrative's optimism in five places where the code
says otherwise, and its blind spot has a shape: **it grades what S6 built, not
what S6 wired.** Three S6 primitives (`sweepForeignCaches`, the buffer's status
port, `watchIdleSignOut`) have no caller at all; the retro names only the
third, and only by reference to another retro.

### Confirmed

Nine of ten scope hashes resolve and map to V1–V9 + `f0df8b5`. The ladder
narrative exact (V6→V1, V7→V3+V4, V9→worker, V8's ungated reload). The
`test.fixme` present (describe-level); `purgeStudentCaches` genuinely
producerless; e2e counts exact (7/14/5); `f0df8b5` verbatim down to "~1 in 4"
and the 30 runs; the S6-3 overturn recorded in *three* places (DECISIONS, the
type, the store); the `ifAvailable` story and "assert the guarantee" both
sourced. All four cross-slice pointers accurate to the cited retros' body
findings. Watchlist item 2's ~15 min plausible (five sites, no e2e dependency).

### Corrected

1. **`7d6f59` is not a commit** — it exists only as a substring of an unrelated
   schema fix. The real S6 close-out is **`7d18b87`**, and there is no V10
   build step: HISTORY's ladder ends at V9, so the scope line invents a rung on
   the very ladder the verdict praises.
2. **`navigator.onLine` is not "a TRIGGER only" — the queue gates on it**
   (`queue.ts:86`, the first statement of `run()`). A false negative (interface
   flap, VPN, captive portal) strands every queued check, and every later wake
   signal takes the same early return. The gate is a pure optimization — firing
   while offline is harmless, since the store turns an `offline` kind straight
   back into `pending`.
3. **"The honest-limitation register" overstates where the residue lives** —
   the expired-token-plus-offline limitation exists only in the archived
   HISTORY paragraph: not in DECISIONS, not in TODOS, no comment at the
   offline-boot path. Contrast the sw fixme (spec inline + TODOS + STATE gate).
4. **"Three e2e lanes" is stale at review time** — S8 added a fourth (`perf`),
   piggybacking on the sw lane's preview server. That is a *favorable* S6
   consequence worth banking: the build-per-run cost is now amortized across
   two lanes.
5. **The GC-exception tests are in `documentCache.test.ts:91-119`, not the
   buffer tests** — `buffer.test.ts`'s single sweep case stores an unparseable
   literal and never exercises the exception.
6. **Finding 9 understates the caches.ts residue**: `sweepForeignCaches` — the
   boot half of V4's contract — has **no caller anywhere** (the route runs the
   two storage sweeps only), and `purgeStudentCaches`'s sole proof
   *manufactures* the caches it deletes; the sw lane's sign-out row asserts
   localStorage and shell survival only. The defence-in-depth is verified
   exclusively against synthetic inputs.
7. **The fieldset guarantee does not extend to canvas surfaces** — they are
   opt-in via a hand-applied `[data-graph-canvas]` attribute in three
   components, only one of which is test-pinned; nothing derives it from the
   registry, so a future canvas block silently lands in the exact failure the
   CSS comment describes (draggable in a stale tab, writes refused, screen
   showing work that is not being saved).

### Citation and framing fixes

The `s1-retro 9`/`14` cites are ambiguous (that file's audit restarts
numbering; the retro means the body findings). The scope line omits `988e701`
(landed inside S6's window) and the flake close-out. Finding 8 should state the
fixme is describe-level — a third row added to that block parks silently.

### Missed — what the retro never examined

8. **The buffer's status port is fully tested and completely unwired.**
   `buffer.ts:35-37` promises the UI "can be honest that work is not being
   saved"; the three transitions are proven in tests; and the route constructs
   the buffer **without `onStatusChange`**, reading `buffer.status()` nowhere.
   At real quota on a Chromebook the student sees nothing: writes fail, work
   lives only in memory, and the first signal is a reload that comes back
   empty. The same class as V4's zero-caller sign-out — in the slice whose
   defining lesson was that class.
9. **`documentCache` has no cross-activity eviction** — one ~40 KB blob per
   activity ever opened, forever, against a ~5 MB origin quota, with both
   failure branches swallowing their own evidence. The terminal state is
   missed-8's silent one: the quota ceiling S6-9's GC was written to prevent,
   reintroduced by the store S6-5 added.
10. **The lock handback re-grants write authority without re-hydrating** — a
    re-held tab serializes the in-memory state it has held since boot over
    everything the thief wrote (on the next keystroke, or with none: `dirty`
    survives refused writes and dispose/hide flushes it). The V7 row asserts
    exactly-one-editable, which this does not violate; but "closing the thief
    hands the activity back with no reload" is stated as a feature in HISTORY
    and DECISIONS, and it is the unsafe half.
11. **V9's `warmAssetCache` made V8's runtime-cache e2e vacuous** — page script
    now writes the same URLs into the same cache on every production load, so
    the assertion can no longer distinguish worker-populated from
    page-populated (and the drift guard `main.tsx` claims is thereby voided).
    Two riders: nothing raises the 250-entry resource-buffer default, so a
    heavy page silently under-warms; and `cache.add()` entries are invisible to
    workbox's `ExpirationPlugin`, so `maxEntries: 200` governs only the
    worker's own writes.
12. **The sweep's parser is the key grammar's silent enforcer** —
    `parseScopedKey` deletes anything under the prefix it cannot parse, so a
    future store adding a `kind` without editing the union is swept from under
    itself at mount. Two other dialects already share the prefix (the
    sessionStorage reload flag, safe only by living in a different storage; the
    Web Locks name).
13. **The autoUpdate + skipWaiting/clientsClaim choice is untested for the
    mid-worksheet deploy** — a deploy during a class period activates and
    claims the open tab; whether the auto-reload and the buffer's hide-flush
    compose is proven nowhere. And if the DB rate ceiling ever *were* hit,
    `rate_limited` is not `offline`: the store deletes the pending entry,
    converting a queued check into a manual-Retry error — one storm would strip
    the whole queue.
14. `packages/viewer/dist/` remains stale (S0-audit item 14c), now with S6
    files in it, polluting exactly the greps this audit ran.

### Audit addenda to the watchlist

- **New, cheap now (~30 min)**: wire `onStatusChange` into the route's banner
  chain, or delete the port and the header sentence that promises it — silent
  quota is the one S6 failure mode with no visible symptom.
- **New, cheap now**: bound `documentCache` (LRU or a cross-activity sweep
  pass), paired with the above so the failure is visible even after the bound.
- **New, before S9**: re-hydrate on lock handback (reload the buffer when
  `held` flips false→true), or refuse the handback — today's no-reload
  ergonomics are bought with the clobber the lock exists to prevent.
- **Rewrite item 2 to cover both halves** — `sweepForeignCaches` (no caller)
  and `purgeStudentCaches` (no producer) live or die together.
- **Fix the scope line**: `7d18b87`; V1–V9 plus a close-out docs commit.
- **New, policy (the generalization the retro stops one step short of): a
  primitive is not delivered until something calls it.** S6 shipped three more
  instances after V7 caught the first, and the failure matrix could not see
  them because e2e proves what the app does, never what it declines to do.
  Mechanical form: an export-reachability check from the entry files, or a
  zero-non-test-importer lint on package exports.
- **New, policy**: when a later V-step adds a second writer to a resource an
  earlier step's test asserts on, re-derive that test's discriminating power
  (`warmAssetCache` vs V8's cache assertion is the worked example).
