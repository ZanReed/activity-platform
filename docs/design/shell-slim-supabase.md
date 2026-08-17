# Shell slimming I — the Supabase sub-clients a student never runs

**Status:** ENG-REVIEWED 2026-08-18 — CLEAR (AMENDED), build next. D2 full slice · D3 fail-loud ·
D4 four accepts · **D5-II raw-fetch rewrite of R2** · D6 the eight-finding honesty bundle. The
outside voice found two severe defects in this plan's own claims (a fictional e2e row cited as
the safety net; `storage` misread as a getter) and the simpler R2 — report at end.
**Owns:** the first slice of the "168 → 150 KiB" TODOS entry, re-derived against a real
attribution (2026-08-18) instead of the folklore number.
**DX questions are FOLDED INTO this review** (alias visibility, upgrade fragility, fail-loud
quality, vitest parity — §5). A separate `/plan-devex-review` is deliberately not run unless the
eng pass surfaces a contested DX fork.

---

## 1. The measured reality (P10 — attribution 2026-08-18, sourcemap-decoded)

Entry chunk 177.2 KiB gz. The relevant lines:

| Component | KiB gz | Student-session executions |
|---|---|---|
| `@supabase/auth-js` | 27.1 | constantly (session restore, refresh) — **stays** |
| `@supabase/realtime-js` + `phoenix` | 15.3 | **zero** — no `.channel()` call site exists in the workspace |
| `@supabase/storage-js` + `iceberg-js` | 7.4 | **zero on the boot path** — storage is used by exactly one file (`uploadImage.ts`), imported only by editor popovers that live in lazy chunks; iceberg-js is storage-js's own dependency |
| `@supabase/postgrest-js` + core | 6.3 | constantly (every authed read) — stays |
| `@supabase/functions-js` | 0.6 | zero, but too small to pay for stub surface — stays (YAGNI) |

**Why the dead weight is in the entry at all:** `SupabaseClient.ts` imports every sub-client
statically and constructs realtime in its constructor. Bundling follows imports, not usage —
construction laziness is irrelevant. So the fix must be at MODULE level: vite `resolve.alias`.

**The internal contract a stub must honor** (read from `supabase-js@2.105.3` source, the
version installed): the client calls `this.realtime.setAuth(token)` on **every auth event**
(sign-in, token refresh, sign-out) — a stub that throws there breaks login. It exposes
`channel` / `getChannels` / `removeChannel` / `removeAllChannels`, all with zero workspace call
sites. `uploadImage.ts` needs exactly `storage.from(bucket).upload(...)` and `.getPublicUrl(...)`,
and already fetches the session itself.

**Prior art this plan stands on:** `supabase.ts` is already a lazy Proxy (the S3 DX review's
outside voice shaped that); the budget already has grep-based absence rows (`shell is free of
katex/mathlive/jsxgraph/prosemirror`); `MATHLIVE_VERSION` is the version-guard precedent (build
fails when the pin drifts from the installed package).

## 2. Proposed rulings (the review's agenda)

**R1 — Stub `@supabase/realtime-js` via `resolve.alias` (−15.3: realtime 8.4 + phoenix 6.9,
which only realtime imports).** The stub's `RealtimeClient`: constructor accepts and ignores
options; `setAuth(_token?)` is a **silent no-op with an OPTIONAL parameter** (called on every
auth event — and OV-11 found the SIGNED_OUT path calls it zero-arg, `SupabaseClient.ts:620`);
the four channel methods **fail loud** with a message naming (a) the alias in `vite.config.ts`,
(b) this doc, and (c) the realtime-push backlog arc as the deliberate path to un-stubbing.
⚠ **The stub's export surface is the PACKAGE INDEX's, not just what SupabaseClient.ts calls**
(OV-3): supabase-js's `dist/index.mjs` does `export * from '@supabase/realtime-js'` and
re-exports named symbols (`StorageApiError` from storage-js, similarly) — rollup HARD-ERRORS on
a missing named export, so both stubs export the full re-exported name surface as inert shells. Audit
`dist/index.mjs`, not only `SupabaseClient.ts`. Nothing in the app can hit the throwing paths
today — proven by grep and pinned by test (R5).

**R2 — Storage goes RAW FETCH; storage-js is DELETED from the app (−7.4 from the entry, and
the popover chunk shrinks too). REWRITTEN at review (OV-5/D5-II; the original "direct
StorageClient in the lazy chunk" fell to its own delivery mechanism).** `uploadImage.ts` makes
exactly two storage calls: the upload becomes one `fetch` POST to
`storage/v1/object/activity-images/{key}` and `getPublicUrl` becomes the string concatenation
it always was. **Both required headers are explicit: `apikey: <anon key>` AND `Authorization:
Bearer <session token>`** — the original plan sent only the Bearer token, and the missing
`apikey` was the review's severe finding 1 (supabase-js's `fetchWithAuth` adds it invisibly;
raw fetch makes it impossible to lose silently). `friendlyStorageError` keys on status codes.
The global alias stubs `@supabase/storage-js` for supabase-js's own import — and OV-2
(severe finding 2) corrected the mechanism: **`storage` is NOT a getter; SupabaseClient
assigns `new StorageClient(...)` in its constructor**, so the stub is a CLASS whose
constructor is throw-free (it runs at every client creation) and whose `.from()` fails loud.
The rejected alternative (deep-import the real storage-js in uploadImage) is recorded in the
review report: it required an exact-match alias regex, an app-level dependency at a second
independently-resolved version, and types the deep path does not export — the plumbing was
riskier than owning two boring HTTP calls against a versioned public API.

**R3 — functions-js stays.** 0.6 KiB does not pay for another stub's fragility surface.

**R4 — The dependency pin goes EXACT and version-guarded.** `^2.105.3` floats; the stub mirrors
version-specific internals (`setAuth` on auth events is an implementation detail, not API). Pin
`2.105.3` exact, and add a guard test asserting the installed version equals the pin the stub
was audited against, failing with "re-audit the stub surface against SupabaseClient.ts, then
bump both" — the MATHLIVE_VERSION discipline, applied where the same hazard lives.

**R5 — The regression net, HONEST EDITION (the original "mostly free" claim was RETRACTED at
review — OV-6/OV-7, a P9-class vacuity caught before it shipped).**
- ⚠ **The "free net" was fiction:** every existing auth/session test `vi.mock`s
  `../lib/supabase`, so the real client — and therefore the stub — never executes in them.
  Vitest inheriting the alias (automatic — no separate vitest config exists) proves module
  RESOLUTION doesn't break, nothing more.
- **V1 is therefore the sole unit proof of the auth-event path, and it must be real:** construct
  a real `createClient` (fake URL, no network), then `auth.signOut({ scope: 'local' })` — which
  fires SIGNED_OUT through the genuine `_listenForAuthEvents` wiring into the stub's zero-arg
  `setAuth()` (the exact path OV-11 flagged). No mocks anywhere on that line.
- ⚠ **The student e2e lane does NOT prove the auth-event path either** (OV-7): its harness
  deliberately injects far-future-expiry sessions so tokens never refresh mid-spec, and
  session restore emits INITIAL_SESSION, which the client's listener ignores. The lane proves
  stub construction + boot. If no existing spec clicks sign-out in-page, ONE gains that click
  (checked at build time, not assumed).
- Fail-loud rows: `supabase.channel()` and `supabase.storage.from()` (NOT bare `.storage` —
  OV-2: property access returns the stub instance) throw messages containing the R1/R2
  pointers.
- **Budget absence rows need a NEW structure** (OV-8): a `CHUNK_LEDGER` row that matches no
  chunk FAILS by design (the vacuity guard), and realtime/phoenix genuinely leave the bundle —
  so `perf-budgets.mjs` gains an absence-only marker list, with markers drawn from LIBRARY
  INTERNALS (phoenix wire strings, storage-js error strings), never package names: the
  surviving SupabaseClient code legitimately contains `'realtime/v1'`, `.channel(`, and
  `'storage/v1'` as string literals.
- **Integration-lane row for the upload** (OV-1, severe): no e2e storage row exists today —
  the original plan's "existing editor e2e upload row" was asserted without checking. The real
  proof is a new `e2e/integration/` row against the real local stack: raw-fetch upload with
  both headers → 200 → public URL fetchable. This is the row that would have caught the
  missing-apikey bug.
- **Dev-mode parity** (OV-9): Vite prebundles supabase-js with esbuild in dev, where
  transitive-dependency aliasing is a known gotcha — if dev doesn't apply the alias, the whole
  "first signal is the runtime throw in dev" story silently evaporates while prod stays
  stubbed. `optimizeDeps` handling + one dev-server verification step, recorded not assumed.

**R6 — The cap TIGHTENS in the same slice (anti-fossil).** Expected landing ≈ 154–155 KiB gz.
The 185 cap was set as "measured 168 + ~10%"; leaving it at 185 over a ~155 shell is 19% slack —
a budget that has quietly stopped protecting. New cap = measured post-slice + the same ~10%
(≈ 170, exact number from the tool at build time), with the gate-9 ledger note updated. The
150-KiB TODOS target is then within one further slice (the zod audit), or close enough to
re-judge whether it still matters.

**R7 — What this slice deliberately does NOT do:** no zod/schema work (own audit, own slice —
the parse-bearing offline-restore path needs real thought); no router swap; no Preact; no
touching auth-js. Each is recorded in the TODOS entry as the ladder's next rungs, cheapest
first.

## 3. Failure modes

| Codepath | Failure | Handling / visibility |
|---|---|---|
| Sign-in/refresh/sign-out | supabase-js calls a realtime method the stub lacks | R4's exact pin makes the surface auditable; R5(a) exercises the real auth path against the stub in unit; the student e2e lane proves it end to end |
| Future feature calls `.channel()` | Silent nothing (worst case) | Fail-loud throw naming the alias, this doc, and the un-stub path — asserted by R5(b) |
| Image upload | Direct StorageClient misses a header/option `supabase.storage` used to add | The editor e2e lane's upload row; friendlyStorageError already wraps failures user-visibly |
| supabase-js upgrade | Internals shift under the stub | R4's version-guard test fails the build with re-audit instructions before any runtime break |
| A dev greps for "why is realtime broken" | Alias invisible in source | The stub file's header + the throw message both name `vite.config.ts`; CLAUDE.md gets one line under standing constraints (the alias exists, where, why) |

## 4. Verification matrix (authored with the build, the standing method)

| Row | Proves |
|---|---|
| V1 | **The sole real unit proof of the auth-event path (OV-6):** real `createClient`, real `auth.signOut({scope:'local'})` → SIGNED_OUT through genuine listener wiring → the stub's zero-arg `setAuth()` — no throw, no mocks on that line |
| V2 | `supabase.channel('x')` throws; message names vite.config.ts AND this doc AND the backlog arc |
| V3 | `supabase.storage.from('x')` throws (`.from()`, not property access — OV-2: `storage` is constructor-assigned, so the property returns the stub instance); message names uploadImage's raw-fetch path |
| V4 | **Integration-lane upload row (OV-1 — new, against the real local stack):** raw-fetch upload with `apikey` + `Bearer` headers → 200 → public URL fetchable. Plus the unit seam on uploadImage's header construction |
| V5 | Version guard: installed supabase-js === the audited pin; failure message instructs re-audit of `SupabaseClient.ts` AND `dist/index.mjs` (OV-3's blind spot, closed permanently) |
| V6 | Budget: entry gz under the TIGHTENED cap; **absence-only marker rows** (new structure — OV-8) for realtime/phoenix/storage-js/iceberg, markers drawn from library internals, never package names |
| V7 | The full existing app unit suite green under the inherited alias — honestly framed as proving module resolution, not stub behavior (OV-6) |
| V8 | ~~storage-js placement in the popover chunk~~ **DIED with D5-II** — raw fetch deletes storage-js from every chunk, so the both-sides assertion collapses into V6's absence row |
| V9 | **Dev-mode parity (OV-9):** the dev server serves the stub, not the prebundled real module — verified once with the dev server running, recorded in the slice's evidence |
| V10 | If no e2e spec clicks sign-out in-page, one student-lane spec gains the click (OV-7) — the only e2e moment the stub's auth path actually fires |

## 5. The folded DX questions — ALL ANSWERED IN REVIEW (2026-08-18, D2–D4)

1. **Alias visibility — RULED (D4): four pointers, one truth.** Stub file headers, the throw
   messages, one CLAUDE.md standing-constraints line, AND a pointer comment in `supabase.ts`
   (the file a developer opens first). All four point AT the single definition in
   `vite.config.ts`, so they cannot drift apart in substance — only in existence, which V2/V3
   partially pin (the throw messages are asserted).
2. **Upgrade ergonomics — ACCEPTED (D4):** "re-audit two files, bump two constants" is the
   priced tax for −23 KiB. The version guard makes forgetting impossible rather than the tax
   optional.
3. **Fail-loud vs fail-lazy — RULED fail-loud (D3).** The sync `channel()` API makes
   transparent laziness impossible without a queueing fake whose first user would be its first
   tester. A documented wall for a caller that does not exist; the realtime-push backlog arc is
   the designed un-stubbing moment.
4. **Vitest parity — DISSOLVED by inspection:** the app has no separate vitest config, so
   vitest reads `vite.config.ts` by default. The alias's single home IS `vite.config.ts`;
   test parity is automatic, not configured.

**5bis — the review pass's own finding (D4.3), named honestly: the alias lies to TypeScript.**
Aliasing is runtime-only; the compiler still types `supabase.channel()` and `supabase.storage`
as fully working. A developer's first signal is the runtime throw (in dev, on first render of
the offending path), not a red squiggle. ACCEPTED rather than fought — a `.d.ts` override
battling supabase-js's own types is disproportionate to the risk. This is the one caveat every
pointer in item 1 must state.

## 6. Tasks

**W1** stubs + alias + uploadImage direct client · **W2** exact pin + version-guard test ·
**W3** V1–V7 (V6 = budget rows + cap tighten + ledger note) · **W4** docs: CLAUDE.md line,
TODOS ladder update, STATE, this doc's as-built deltas · **W5** full local suite + e2e lanes ·
**W6** commit; no migration, no deploy, no bundle regeneration (app-only — Cloudflare Pages
auto-deploys on the author's push).

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| Eng Review | `/plan-eng-review` | Auth-adjacent stub + vendored-internals alias (required) | 1 | CLEAR (AMENDED) | D1 target · D2 full slice · D3 fail-loud · D4 four accepts (incl. the type-level lie) · **outside voice: 11 findings, 2 SEVERE** — OV-1 (the plan's cited e2e upload row does not exist; the missing `apikey` header would have 401'd uploads) and OV-2 (`storage` is constructor-assigned, not a getter) → D5-II rewrote R2 to raw fetch (storage-js deleted from the app), D6 folded the eight-finding honesty bundle (V1 real-client proof, absence-only budget structure, dev-parity check, export-surface audit, e2e honesty). OV-10/11 verified the non-issues (Edge bundles immune, types erased, SW inert). |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | Not warranted | Zero pixels; stated per the standing rule |
| DX Review | `/plan-devex-review` | Developer experience | 0 | **Folded into eng** (§5, by design) | All four DX questions answered in-review: visibility (four pointers, one truth), upgrade tax (priced + guarded), fail-loud (D3), vitest parity (dissolved — inherits vite.config). Held in reserve; no contested DX fork emerged |
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | Scope was the user's explicit lever-1 selection |

- **CROSS-MODEL:** The outside voice (fresh subagent) again overturned same-day work — this time
  the review's OWN plan-side claims rather than a ruling: the R2 safety net was fiction (P11),
  the R5 free net was vacuous (P9 — every auth test mocks the client), and the simpler R2 (raw
  fetch) beat the reviewed one on every axis. Fifth consecutive review where the outside voice
  changed the shipped shape.
- **VERDICT:** ENG CLEARED (amended in place) — ready to implement W1–W6 as amended (R2 = raw
  fetch; V-matrix V1–V10 with V8 dead). Expected landing ≈ 154 KiB gz; cap tightens to
  measured + ~10% in the same slice.

NO UNRESOLVED DECISIONS
