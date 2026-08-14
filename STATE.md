# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it under ~150 lines: move finished-work narratives to [docs/HISTORY.md](docs/HISTORY.md), durable reasoning to [docs/DECISIONS.md](docs/DECISIONS.md). Project rules live in [CLAUDE.md](CLAUDE.md).

## Pending author actions

Things only the author does (pushes, deploys, migrations), queued and waiting.

**⏭ S9 Drop 1 station (publish rewrite — repo-side COMPLETE, committed this session).** In order, per [s9-cutover.md](docs/design/s9-cutover.md) §8:
1. Push the Drop 1 commit; **CI gate**: `gh run list --limit 1` → green (OV-DX-8).
2. ✅ **HEAD recorded 2026-08-14 (OV-DX-9): `27a4a08dd7b58aa460f5c13d9d360d85f0ec13df`** (`27a4a08`, the Drop 1 commit) — the resurrection pointer for the deleted deploy. Note the nuance this repo's own rule anticipated: `supabase/functions/publish-activity/` is still IN the tree at this hash and stays there until the Drop 3/4 sweeps delete it, so the hash is a *deploy-state* marker (last commit whose repo still described a deployed publish-activity), not the last commit containing the source. Re-record at the Drop 4 deletion if a source pointer is wanted then.
3. `supabase functions delete publish-activity` (verify per-invocation syntax with `--help` first). EXPECT: `list_edge_functions` shows 4 remaining (get-activity, check-activity, ingest-submission, get-feedback).
4. Then Drop 3 (demolition) is next in the ruled order 1→3→4→2→5 — hard-gated on the OV-10 zero-traffic evidence; the D-2 design review is already done.

**📌 NOT reproducible from migrations: all three teacher `display_name`s are NULL by a direct data edit.** 0021's backfill NULLed the two rows that held emails; the author then ruled (2026-08-04) that the third row — a 2026-07-29 account where Google DID supply `full_name`, so it held the real name `"Zan Reed"` — should be NULL too. That row was outside 0021's scope by design (the backfill only touches `display_name = email`, so it never rewrites a chosen name), so it was cleared with a direct one-row UPDATE, **not a migration**. Verified after: all three published activities return `teacher_name:null` over anonymous HTTP. Consequence to remember: a restored-from-migrations database would NOT reproduce this, and **a brand-new teacher signing in with a Google account that has a `full_name` will publish that name** — the trigger stores it, ruling 3.2A says a name is what that screen is for, and that is still correct for other teachers. See the design signal on the name-appearance control in Backlog.

**✅ CLOSED (2026-08-06, split verdict — A31): the cron's first fire was observed, and half the prediction was wrong for a reason worth keeping.** Both jobs ran 2026-08-05 03:00/03:30 UTC and SUCCEEDED (verified via `cron.job_run_details` during the s1-retro audit). The purge half matched its falsifiable prediction exactly: completed without abort, purged nothing, `past_window = 0`. The analytics half's prediction (`census_versions = 0`) was STALE BEFORE THE RUN — the census backfill had censused 24 versions the same day — and the "had not yet run when last checked" note above it was committed at 20:40 JST, hours AFTER the 03:00 UTC fire. Two lessons recorded: a committed prediction must be re-derived when the world moves between writing and observing; and "absent evidence = has not run yet", never "is not configured" (the health-surface learning). The verify queries stay in HISTORY with the S7 narrative.

**Why this is worth actually checking, and not assuming:** until 2026-08-04 pg_cron had never been installed, so `purge_soft_deleted` had *never once run* — the 0022–0025 arc hardened the purge function and proved it in rolled-back transactions, but nothing ever checked that it was scheduled, while [retention-policy.md](docs/compliance/retention-policy.md) named a "scheduled purge job" as the enforcement mechanism for four data categories. A first attempt to enable it also silently didn't take (the `cron.schedule` calls errored on the missing schema and the errors went unread). **Verify the run, not the registration.**

**✅ RESOLVED (2026-08-07): the local-first slice's CI run (31149262316 on `3cd4a7e`) came back fully GREEN** — all four jobs succeeded, including both first-time-in-CI V7-matrix rows. Its perf numbers are datapoint 3 in the calibration ledger below (needs 5; has 3).

**Session ledger 2026-08-06→07 (all pushed unless noted):** eng review (28 rulings, 0 unresolved) → 41-item batch (9 commits) → CI un-redded (env-baked dist + math shutter + polled @page + 2× baseline regens) → B5 print heights → D2/D3 compliance rewrite + first POLICY_VERSION bump (author-approved) → local-first slice `3cd4a7e` (CI green) → **B8 malformed-document slice (2026-08-07, pushed, CI green — run 31151334014)**: walk integrity gate landed red-green (30 red → 40 green in `walk-integrity.test.ts`, cases in corpus.ts's `INTEGRITY_CASES`) — the rule: a grader-read field PRESENT with a shape the schema cannot author throws `MalformedDocumentError` → 500 + `malformed_document`; absent/authored-empty grades as before. Client maps the code to its own non-retryable kind + copy (D29 — it would otherwise land in retryable `server_error`). Census opts out via `{integrity:'coerce'}` (read path = withhold-and-serve, behavior-neutral). Both server bundles regenerated. Known nuance, documented in walk.ts + the handler: upgrade-time Zod means no STORABLE document trips the gate today — it is the engine's own contract (defense in depth behind the `as never` cast), so the handler branch's liveness proof uses the test file's one pass-through mock (P3). **✅ BUILT 2026-08-09: the S9-prep identity slice — all 13 tasks, repo-side complete** (plan + full ruling record: [docs/design/s9-prep-identity-slice.md](docs/design/s9-prep-identity-slice.md); distillation in DECISIONS → "The admission boundary hardens before it opens"). **⏳ YOUR apply-day runbook is the plan's §5, in order:** (0) one-time setup — `brew install libpq && brew link --force libpq`, the DB password → pooler DSN as `SUPABASE_DB_URL` in `.env.supabase`, Docker for the one-off rehearsal; (1) rehearse 0027 locally (`supabase start` → `pnpm verify:auth --target local`); (2) `supabase db push` (0027 — BEFORE any student_domain seeding); (3) `pnpm verify:auth --target live`; (4) dashboard: Additional Redirect URLs gains `http://localhost:5173/join/*` + the production-origin variant; (5) Probe 1 (your teacher account through a real `/join/<CODE>` link → the E-9 screen) and Probe 2 (throwaway personal Gmail → RECORD the callback params); (6) the two boomerang datapoints. **No Edge Function deploys; no bundle regens** (DB + app only). **Then: S9 gets its own /plan-eng-review before build.** Unblocked opportunistic: the D23 privacy-hash TODO.

**Queued by the 2026-08-06 eng-review batch (rulings: docs/reviews/findings-backlog.md → RULINGS):**

1. ~~Push the batch commits, then watch CI~~ **✅ DONE 2026-08-07: run 31144354624 fully GREEN on `626fb8f` — the first green CI since S8's push.** It took three follow-ups beyond the batch: the four math baselines regenerated via the manual CI job (`476b1ec` — the committed images had been captured in the losing race state; the other 18 regenerated byte-identical), a `functionsBase` fix (`626fb8f` — A21's first version read `import.meta.env` behind the test mocks; env-masked locally, red on CI's env-less test step), and riding out one GitHub "Service Unavailable" infra flake plus a few cancelled runs.
2. **✅ CLOSED (2026-08-07): A2 — live `verify_jwt` flags verified via `list_edge_functions` after the B8 `deploy:check`.** All five agree with `supabase/config.toml`: check-activity v6 + publish-activity v122 `true`; ingest-submission v42 + get-feedback v4 + get-activity v9 `false`. P6 proven end to end: `deploy:check` is a PLAIN `supabase functions deploy` (no flag in the script) and the platform still kept `verify_jwt:true` — config.toml did its job.

2a. **✅ DONE (2026-08-07): B8 deploy — `check-activity` v6 live** via `pnpm deploy:check`; the malformed-document gate + `malformed_document` wire code are live. *(Still true: get-activity's next deploy carries the census `{integrity:'coerce'}` edit — behavior-neutral, no ordering constraint.)*
3. **✅ DONE (2026-08-13): B15 — the contact-sheet evidence is durable.** Tag `s5.5-print-signoff` pushed + GitHub release with `s5.5-contact-sheet.zip` (44 PNGs + index.html); tag message notes the B5 height fix postdates the sign-off; HISTORY:30's dead regen command struck with the archive pointer (`5ebf866`). The repo's first tag. Cutover gate C14 CLOSED.
4. **D2/D3 pack rewrite: COMMITTED (`73ab7bc`, `POLICY_VERSION 2026-08-07-draft-2`) — your legal read of the changed sentences is still owed** (the assertion's dropped under-13 clause, the departed-student ~400d disclosure, name→name+school-email, the Mechanics purge-job correction, the three A11 gaps reconciled prose-side). *(A prior version of this entry said "uncommitted working-tree diff" — stale; verified landed 2026-08-08.)* **Standing gate recorded (D24): counsel/district reads the pack before the first real classroom** — the pack has never had legal review and every file says DRAFT. C13's ordering gate (bump before B13's immutability migration) is SATISFIED.
5. *(No action needed but know it: get-activity's next deploy also brings the G2 strict UUID shape and A15/A22 copy changes live — no ordering constraint.)*

Baseline facts, verified live 2026-08-07 (post-B8 deploy): migrations applied **through 0026**; `ingest-submission` v42 / `get-feedback` v4 / `get-activity` v9 all `verify_jwt:false`; `check-activity` v6 + `publish-activity` v122 both `verify_jwt:true`; kit manifest `graph-kit-R5LUPQJS.js` committed. **S7 is COMPLETE**; verification narratives archived in [HISTORY.md](docs/HISTORY.md).

## Standing constraints & watch items (current arc)

- **The R2 graph-kit has exactly ONE consumer left: the published-page path** (`renderer/src/document.ts` + `publish-activity` reading the manifest). It dies with publishing at **S9** and cannot be removed earlier — until cutover, published pages are the only student path that can be graded end to end at scale. Do NOT "finish the Cloudflare exit" by ripping the kit out early. The viewer + editor build the kit from the workspace (app-bundled lazy Vite chunk — never the R2 summon path), so **no kit upload is needed for viewer-side kit changes** (the 2026-07-31 ungraded-mode upload was verified moot; see HISTORY).
- **⚠ ONE PROMISE UNPROVEN, deliberately visible:** offline reopen against the built service worker is `test.fixme` in `e2e/sw/service-worker.e2e.ts`, evidence inline + in [TODOS.md](TODOS.md). **Close before S9 cutover** — that's when students meet the path.
- **Known limitation (stated, not hidden):** offline boot needs a token that has not expired. Expired token + no network ⇒ the pre-auth gate — refreshing needs the network, and reading supabase's session storage directly in shipped code is a dependency worth refusing.
- **Retention is COMPLETE and proven end to end (0022–0025, all ruled + verified 2026-08-04).** The arc found that the machinery had never worked: the nightly purge would have died once checks aged in, it deleted `public.users` while leaving the Google identity behind forever, no account could be purged at all, and nothing started the account clock. All four are fixed. **The one thing to know when touching this: `users.deleted_at` means "account disabled", NOT "retention clock running"** — `join_class` refuses accounts that have it set, so student dormancy is DERIVED live from `class_members`/`classes` (400-day window) and the purge job never writes that column. Don't "simplify" it into a stored flag; that reintroduces a between-terms lockout. Windows and rationale in [retention-policy.md](docs/compliance/retention-policy.md) → Mechanics (counsel must read it alongside the table); "who is dormant right now" has no column to read — the query is `scripts/verify-0025.sql` section D.
- **⏸ PARKED, with the author's reason (2026-08-01): the teacher-grading slice.** Free text is captured by every check but nothing can grade it yet. Not pressing — no teachers using the system right now; urgent the moment one does. Context in [TODOS.md](TODOS.md) → "Teacher grading bound to `section_checks`".
- **⚠ Unexplained one-off:** `sanitize.test.ts` → "differs across students and across versions" failed once (2026-08-01) and did not reproduce in 13 runs. The test's own comment claims the fixed PRNG "can never flake". Recorded so a second sighting is treated as a pattern, not a surprise — the seeded shuffle is load-bearing for S4's ordering omission rule.
- **Verification quirk:** the in-app Browser pane suppresses the position-measured hosts (command bar / quick-bar / drawer) under JS-driven selection — Playwright e2e (real chromium) is authoritative; drive the drawer via node-selection + gear + Advanced. `/playground` (unauthed) is the dev target; `/playground?empty=1` mounts a blank doc.

## Current focus — components-as-data re-architecture

**THE ACTIVE ARC (RULED 2026-07-28; eng + design reviews CLEARED, 0 unresolved).** Full re-architecture of the student path: live-API viewer SPA + student accounts (district Google SSO) + React component per block (single registry) + server-authoritative grading (answers never reach clients) + upgrade-on-read + hard cutover. **Sequencing (author's explicit call): rewrite first; the August Algebra I release is deliberately delayed** ("good architecture is worth the wait"). **Scope amendment (author, 2026-07-28): "there are no old pages to maintain"** — live R2 pages are the author's own tests, so S9 cutover DELETES the anonymous identity/wire machinery instead of preserving it. **Hosting ruling (2026-07-31): Supabase-only backend; the SPA stays on Cloudflare Pages as a deliberately swappable static host** (no Workers/KV/`_redirects`); R2 publishing, the R2 kit path, and R2 fonts all die at S9. All rulings, wireframe, tasks: `~/.gstack/projects/ZanReed-activity-platform/user-main-design-20260728-components-as-data.md`; reasoning in [DECISIONS.md](docs/DECISIONS.md) (→ "Student identity S1", "Read API S2", the S4–S6 entries) and the ROADMAP correction banner.

**Slice ledger — S0 through S8 are ALL COMPLETE** (narratives in [HISTORY.md](docs/HISTORY.md); rulings in the gstack design doc):

| Slice | What | Closed |
|---|---|---|
| S0 registry + tokens | `packages/viewer` block registry (22 entries, guard-enforced) + design-token layer | ✅ 2026-07-28 |
| S1 student identity | district Google SSO, `student` role, compliance pack | ✅ 2026-07-28 |
| S2 read API | `get-activity` (anon meta / authed sanitized content), answer-key sanitizer + `SANITIZER_REV` cache, migration 0017 | ✅ 2026-07-28, deployed |
| S3 viewer | 22 block components + conformance factory + live route `/a/:activityId` | ✅ 2026-07-31 |
| S4 grading | `check-activity` RPC + engine + golden corpus parity gate + migration 0020 | ✅ 2026-08-01, live E2E 13/13 |
| S5 student print | print layer + rules gate + screenshot baselines + pagination pass | ✅ 2026-08-01 (legs closed in S5.5) |
| S6 local-first | buffer, queued checks, tab lock, sign-out hardening, service worker | ✅ 2026-08-02 |
| S5.5 teacher print | ActivityPrint + answer key + versions + foldable on the viewer tree; renderer out of app product code | ✅ 2026-08-03, CLOSED |
| S7 analytics census | derived census + item map on the read path, read-cache GC, maintenance ledger, on-demand teacher panel, migration 0026 | ✅ 2026-08-04, applied + verified live |
| S8 perf-budget CI | route split (entry = student shell), 12 CI size budgets + 23 script tests, throttled perf lane, sw/student lanes into CI, unified budget config, math preload-on-detect | ✅ 2026-08-05 — T7 resolved; only timing calibration open (above) |
| S9-prep identity | migration 0027 (case-normalized allowlist, deny-by-default classes writes, 3 audited RPCs, join_class error split + RAISE LOG), role-gated student shell, /join/:code, sign-in-failure frames, B14 dialog, verify runner (`pnpm verify:auth`), 15 identity e2e rows | ✅ **COMPLETE 2026-08-14 — applied + live-verified**: 0027 (+0028 grant hygiene) live, `verify:auth --target live` **65/0 green**, both probes passed. Gates **C2+C3+C11 CLOSED** |

**S8's one carry-over: calibrate the timing targets — CALIBRATION LEDGER OPEN (median of ≥5 green CI runs per the A3 amendment; artifacts expire, so record each datapoint here as it lands):**

| # | run | pre-auth | worksheet | math-rendered |
|---|---|---|---|---|
| 1 | 31144354624 (2026-08-07) | 948 ms | 1118 ms | 1828 ms |
| 2 | 31145342108 (2026-08-07) | 946 ms | 1106 ms | 1805 ms |
| 3 | 31149262316 (2026-08-07) | 969 ms | 1100 ms | 1814 ms |
| 4 | 31151334014 (2026-08-07) | 969 ms | 1195 ms | 1877 ms |
| 5 | 31315856831 (2026-08-09) | 1009 ms | 1156 ms | 1831 ms |

 **✅ ARMED 2026-08-09 (the ledger closed at 5 — the A3 carry-over is DONE):** `TIMING_TARGET_MS` = the medians (pre-auth **969**, worksheet **1118**, math-rendered **1828**); the 2× ceiling and delta warning are live from the next CI run. The S8 slice has no open items left. Recalibrate only by the same rule (median of ≥5 green runs — never local darwin, never a single run).

**⏭ NEXT: S9 cutover — the gate list (consolidated at the 2026-08-06 eng review, C1–C15; rulings + detail in [findings-backlog.md](docs/reviews/findings-backlog.md) → RULINGS).** Plan + all three reviews CLEAR: [s9-cutover.md](docs/design/s9-cutover.md) (D-1…D-14 + eng §7 + DX §8/§9 + design §10). **D-2 design artifact (OV-DX-11 slot): `~/.gstack/projects/ZanReed-activity-platform/designs/s9-drop2-content-surface-20260813/wireframes.html`** — v2 board, 6 frames; the DR-1…DR-16 rulings live in plan §10; board annotations carry the ruled copy. Needs both parity gates green (grading corpus + print, both in CI) plus every gate below:

1. sw-offline `test.fixme` closed — next step documented: real server stop, not `setOffline` (s6:8)
2. ✅ **DONE 2026-08-09** — `watchIdleSignOut` + student sign-out chrome wired (2.4A) on the student Home AND StudentViewer (banner-chain arm 0), with the s1:9 e2e proving prompt→escalation at production values via Playwright's clock
3. ✅ **DONE 2026-08-09** — Role fetch + student shell branch (B12): join-by-code UI + shareable `/join/:code` link; role in SessionContext (fetch-per-user-id, neutral gate, E-11 zero-rows state)
4. Seed `student_domain` + live-verify the trigger's student branch before the first class (s1:7) — **prerequisite MET 2026-08-14** (0027 live, so the mis-cased-teacher defect is disarmed and seeding is now safe to do); still deliberately last, and needs a real district domain. ⚠ **Never seed a consumer domain like `gmail.com`** — one row would admit every Google account on earth as a student (the boundary-loosening hazard `update_class_domain`'s audit exists for)
5. Demolish `submissions.student_id` branch + `submissions_account_attempt_idx` with the anonymous wire (s1:8)
6. `purgeStudentCaches` + `sweepForeignCaches`: producer or removal — they live or die together; the reachability-lint allowlist entry goes with them (s6:9)
7. Real-browser a11y pass: announcements, keyboard path, visible focus, reduced-motion — the four 6.1A gaps (s3:12)
8. Delete the renderer-side `collectDefinitions` copy WITH the renderer — the A9 bond in the renderer suite dies in the same breath (s5.5:8)
9. S8 recalibration re-measure + re-run the S8 retro against its posted checklist (s8)
10. Do **NOT** unify renderer/viewer shuffle hashes pre-S9 (changes published arrangements for nothing); `Matching.tsx`'s block-id seeding *survives* S9 (s2:w10)
11. ✅ **BUILT 2026-08-09** (apply pending — see Pending author actions) — S9-prep identity slice: role/shell/join UI + gate hardening (allowlist case-normalization, `hd`, `expected_domain` edit path, assertion immutability via column grants, `class.create`/`class.update` audit writers, two-action remove dialog). Migration 0027 applies **BEFORE gate 4's seeding**
12. ✅ **DONE 2026-08-07** — Local-first safety set (D4/D5/D6/D9/D27/D28 + A15 copy + D13's shortfall consumer, which was ruled but package-less): single six-arm banner chain in the route, quota banner wired, byte-budgeted LRU (2 MiB, unsent-work exempt), handback re-hydrate + steal-window write gate with both V7-matrix e2e rows
13. `POLICY_VERSION` bump (D2/D3: clause-drop + pack rewrite) — before the first real class row AND before gate 11's assertion-immutability migration
14. Contact-sheet evidence captured (D15: tag + release asset) — before the renderer dies
15. DELETE `ingest-submission` + `get-feedback` after a zero-traffic check in edge logs (D26; get-activity's anonymous META branch survives — it serves the viewer's own pre-auth screen)

Task detail in the gstack design doc. **Cutover cleanup checklist (2026-07-31 ruling, kept here so it isn't lost to HISTORY):** delete publish-activity's R2 upload path, the R2 secrets on the functions, `VITE_PUBLISHED_URL_BASE`, the R2 origin in `ALLOWED_ORIGINS`, then the bucket itself; the R2 kit machinery (`upload:graph-kit`, the manifest, `.env.r2`) and `build:fonts`/`build:mathlive-fonts` die with it; existing test-activity image `src`es on R2 keep resolving until the bucket dies, no rewrite needed. **⚠ AMENDED 2026-08-04 (S7): "the census folds into the S9 publish rewrite (R6)" is DEAD — S9 has no census work at all.** The census is derived from stored version snapshots by `get-activity`'s cache-fill path and never touches `publish-activity`. Do not re-add a census write to the new publish path; it would be a second writer racing the read path on the same keys.

**Suite (verified against tool output 2026-08-09, post-identity-slice):** schema 340 / graph-kit 384 / viewer 1078 / renderer 726 / **app 1067** unit, plus **39 budget-script tests** (incl. 6 verify-runner), **61 print e2e**, and the editor/student/sw/**perf** e2e lanes (**student+sw 41 pass / 2 parked** — 15 identity rows new). Typecheck + lint clean (0 errors); all 12 perf budgets pass (entry 173.5/185 KiB gz — the whole student shell + join flow cost 5.1 KiB). Treat the tools' printed numbers as truth, not this line.

**Editor open remainders (deferred, pre-rewrite arcs; roughly priority-ordered):**
1. **Focus mode** — needs a caret-tracking ProseMirror plugin (CSS can't identify the caret block); off-by-default, wants its own design+eng pass.
2. **Input-parity / a11y touch pass** — touch needs a real device; `/` covers the keyboard floor.
3. **Slice 6.5 smart-defaults** — net-new unvalidated heuristics; own spike, gates nothing.
4. **⌘⇧↑/↓ keyboard-reorder settle** — snap-motion follow-up (debounce design).
5. **Chip open:** the slash menu dies under synthetic keyboard input once a query char follows `/` (humans unaffected). **Papercut:** the gutter "+" can overlap the drag grip's lower half on a short block.

## Backlog / candidate arcs

- **▶ SCHEDULED — runtime budget-ladder: per-question-type inlining variants (do BEFORE the next question-type generation).** The base runtime is **41.8 KiB, over its 40 KiB soft target** (the math-blank runtime pushed it over); the 2026-07-10 amendment ([DECISIONS.md](docs/DECISIONS.md) → "Runtime size budget amendment") says pull a structural lever when a variant nears the ceiling, "scheduled, not discovered." This is that lever. **Mechanism already exists:** [document.ts](packages/renderer/src/document.ts) picks the runtime by scanning the rendered `body` for marker attributes. **Approach:** carve the less-common question machinery (free-text, `matching`, `ordering`, math-blank glue) out of the always-on base into conditionally-inlined chunks, leaving a minimal core. **Constraints (eng-review at pickup):** the runtime invariants must survive the split — `init.ts` the only DOM walker, `render()` the only mutator, vanilla-TS chunks, no `@activity/schema`; re-measure every variant after. Not blocking today (no new question type queued), but must land before one does. NB the renderer retires at S9 — weigh whether this lever is still worth pulling as S9 approaches.
- **Re-architecture follow-ons (accepted 2026-07-28):** (1) Clever/ClassLink district SSO — demand-triggered. **IdP map recorded 2026-08-09** (detail in the identity-slice plan §2): LMSes (Canvas/Blackboard) are not IdPs; expansion order when a non-Google district appears is Azure/Entra (cheap — domain-keyed trigger is IdP-agnostic) → Clever/ClassLink (adds rostering) → LTI 1.3 (in-LMS embedding). (2) Realtime push arc — trigger = first named live feature. (3) Sampled behavioral telemetry — only after the census can't answer a concrete question AND the compliance pack is amended. (4) Print variants (print-with-my-work) — print parity is green; pick up when asked. (5) Solution-unlock pedagogy pass — informed by census data on check patterns. (6) /design-consultation brand pass — when the identity question goes live.
- **Free activity catalog / "Activity Bank"** (Phase 2 cold-start lever; [free-activity-catalog.md](docs/design/free-activity-catalog.md); Bank design + rulings `~/.gstack/projects/ZanReed-activity-platform/user-main-design-20260724-010349.md`). Timing superseded 2026-07-28 — moved behind the rewrite; Drop 0 hosting prep done ([runbook](docs/drop0-hosting-runbook.md)). One open item: #6 taxonomy/tags — author wants a tags discussion at kickoff. Post-S9 note: the catalog's discovery surface becomes a viewer route, not the R2 URL (see ROADMAP banner).
- **Vocabulary glossary — Phase 4** (tenant-scoped store + `glossaryKey` resolution; additive to the shipped mark; [vocabulary-definitions.md](docs/design/vocabulary-definitions.md)).
- **Long-term OCR/AI (designs captured 2026-06-16):** [pdf-import.md](docs/design/pdf-import.md) + [photo-grading.md](docs/design/photo-grading.md). Photo-grading needs one refactor: server-shareable answer evaluation — largely arrived with S4's grading engine; re-check at kickoff.
- **Teacher "how your name appears to students" control** (deferred 2026-08-04 with the 0021 privacy fix): a small edit writing `users.display_name` under the existing self-only RLS — no settings surface exists yet, and every current teacher row is NULL. Pick up when a second teacher onboards (or fold into the S9-era account surface). Until then the pre-auth screen says "your teacher". **Design signal from the author's own two rulings that day** (NULL for the email rows, then NULL for the real-name row as well): the control should NOT silently adopt Google's `full_name` as the published attribution. Default to showing nothing and let the teacher opt IN to a name they choose — publishing a legal name to a page anyone with the link can open is a decision the teacher should make, not a default they inherit from their SSO profile.
- **Other Phase 2 "decide at phase start":** image-hosting quota, `skills` editing UI.

## Status by area

| Area | Status |
|---|---|
| Stages 9–16 (schema, renderer, runtime, editor, publish flow, submissions dashboard) | ✅ Complete; live-verified |
| Database migrations 0001–0025 | ✅ Applied; RLS verified (per-migration records in HISTORY; re-run `verify-0013-0014.sql` + `verify-0017.sql` after any auth/RLS/grant migration) |
| Migration 0026 (analytics census) | ✅ Applied 2026-08-04; verify-0026 green live (structural + behavioral, clean rollback) |
| Scheduled jobs (pg_cron) | ✅ Installed 2026-08-05; both jobs registered + active; **first fire observed + verified 2026-08-06** (split verdict A31 — purge half matched its prediction; analytics half's prediction was stale before the run) |
| Components-as-data slices S0–S8 + S5.5 | ✅ Complete — see the slice ledger above; S9 cutover is next |
| Print (baseline CSS → authored feature → viewer print + gate) | ✅ Complete through S5.5; print gates run in CI |
| Structural columns + strict-grid editor + Notion-hybrid editor (stages 0–7) | ✅ Complete; app-only |
| Variable block sizing + image crop + dark mode (chrome/editor/boards) | ✅ Complete; deployed |
| Markdown paste import (format spec + Copy-AI prompt + registry drift-guards; importer parity arc CLOSED) | ✅ Complete; every editor-authored capability has a markdown path |
| Question types: fill-in-blank (text/numeric/math), MC, matching, ordering, interactive graph (+ systems), number line, data plot | ✅ All live; wire v9, storage v12 (source of truth: `runtime/submission.ts` / `runtime/storage.ts`) |
| Pedagogical blocks (objectives, worked/faded examples, self-explanation) + callout | ✅ Deployed 2026-07-12 / 07-21 |
| Phase 2.6 manual grading (short_answer + essay + rubrics + teacher UI + get-feedback) | ✅ Deployed + live-verified 2026-07-13 |
| Calculator tool (Phase 2.7 stages 1–4 + graphing UX overhaul) | ✅ Live |
| Reference panel + graph_figure + inline/block-level definitions + print glossary | ✅ Deployed 2026-07-27 (publish-activity v120) |
| Activity typography (`meta.typography`; registry now shared in `@activity/schema/fonts`) | ✅ Deployed; viewer wired in S5 |
| Edge Functions (5) + deploy flags | ✅ All live, flags verified 2026-08-03 (see Pending author actions) |
| Cloudflare R2 hosting (published HTML + kit + fonts) | ✅ Live — retires at S9 (see Standing constraints) |
| Auth (Google OAuth teacher allowlist + student SSO) / React app / editor stack | ✅ In place |
| CI (typecheck/lint/test/build + 3 bundle-drift guards + **12 perf budgets + 23 budget-script tests** + print gates job + **perf/sw/student lane job**) | ✅ Green |
| Student bundle (S8) | ✅ Entry chunk = the student shell, 168.4 KiB gz (cap 185); heavy libs lazy and content-pinned out of the shell |

*(Per-feature detail that used to live in this table — deploy trains, kit hashes, verification narratives — is archived in [HISTORY.md](docs/HISTORY.md); the suite-growth ledger is there too.)*

## Repo layout

```
activity-platform/
├── docs/
│   ├── design/        — feature designs captured ahead of implementation
│   ├── DECISIONS.md   — architecture decisions + reasoning
│   ├── HISTORY.md     — archived completed-work logs
│   └── COLLABORATION.md — working-with-the-author notes
├── packages/
│   ├── schema/        — Zod types, document model, factories, fonts registry
│   ├── viewer/        — @activity/viewer: block registry + components + sanitize/server + grading engine + fixtures + print layer
│   ├── renderer/      — pure JSON → HTML string; KaTeX inlined; no DOM (published pages only; retires at S9)
│   │   ├── RUNTIME.md — runtime architecture + data-attribute contract
│   │   └── src/runtime/ — published-page runtime (DOM TS, own tsconfig)
│   ├── graph-kit/     — @activity/graph-kit: shared graphing kit + /scorers + /static-svg pure subpaths
│   └── app/           — Vite + React 19 + TS + Tailwind v4 + React Router v7 (editor, dashboard, viewer routes, print)
├── supabase/
│   ├── migrations/    — numbered SQL migrations (applied set = `supabase migration list`; see migrations/README.md)
│   └── functions/     — publish-activity, ingest-submission, get-feedback, get-activity, check-activity, _shared/ (cors.ts + the generated renderer/viewer-server/grading-server bundles + graph-kit-manifest.ts)
├── scripts/           — bundlers (renderer/viewer-server/grading-server/graph-kit), deploy-train, verify-* SQL/JS
└── ...root configs
```

## Key constants

- **GitHub repo:** `ZanReed/activity-platform`
- **Supabase project ref:** `dtqutpdplefmufrrakxs`
- **Auth:** Google OAuth via Supabase. Site URL `http://localhost:5173` for dev. Teacher allowlist + student SSO (S1).
- **Client env:** `VITE_PUBLISHED_URL_BASE` is DEAD (deleted at S9 Drop 1) — the share link is the viewer URL `${origin}/a/${activityId}`, built by `PublishStatus`, env-free. `.env.local` still carries the Supabase pair (+ optional `VITE_DISTRICT_HINT`).

## Open questions / deferred decisions

- **Empty fill_in_blank drag handle attachment** — whether `definingForContent: true` changed the handles-only-on-non-empty behavior is unverified; re-test during a drag-reorder pass. Minor.
- **Blank popover: one-click switch between chips** — deferred design decision, no data loss; reasoning in [DECISIONS.md](docs/DECISIONS.md) → "Fill-in-blank authoring (Stage 13.5)". Needs a dedicated design pass (FocusTrap/selection entanglement).
- **Section metadata panel** — SectionBreakView's inline title/checkpoint UI is adequate; an editor-level panel remains optional.
- **Responsive `--blank-width` sizing** — deferred from Stage 11.
- **`skills` editing UI** — the field round-trips everywhere, only the editing control is missing. Don't add piecemeal without the per-skill-analytics scope.
- **UX validation with 2–3 other teachers** on the editor patterns before classroom adoption — cost rises sharply once students use activities.
- **Post-success edit edge case** — locked/single paths briefly write-then-remove the persistence blob (wasteful but correct). Low priority.
- **CDN-hosted shared runtime** (Phase 3+) — likely mooted by S9 (published pages retire); re-evaluate only if publishing survives in some form.
- **Multi-tenancy / governance when a teacher leaves a district** — Phase 4; helpers are designed for it.
- **Media storage/privacy posture** (Phase 2.8), **annotation coordinate space** (Phase 2.9) — each decided at its phase start.

---

**Last updated:** 2026-08-14 — **S9 Drop 1 (publish rewrite, T1) BUILT and verified; repo-side complete.** Publish is now a direct `publish_activity` RPC from `usePublish` — no Edge Function: the autosave flush ABORTS publish on failure (`useAutosave.flush` now reports success honestly, OV-2), `ActivityDocument.safeParse` runs pre-publish on the exact persisted payload via the editor's `lastPersistedDraft` mirror (E-1), PostgREST raises map to teacher copy (`mapPublishRpcError`), and `PublishStatus` (extracted to `components/PublishStatus.tsx`) builds the share link as the viewer URL. Deleted: `VITE_PUBLISHED_URL_BASE` (+ example env + vite-env typing), `publishedUrl()`, the unconsumed `versioned_url`, `deploy:publish` (OV-DX-2; deploy-train's publish steps tombstoned too). CLAUDE.md/functions-README bullets Drop 1 falsifies are tombstoned (OV-DX-3). `PUBLISH_ACTIVITY_RPC` lives in `lib/edgeFunctions.ts` with a migrations-grep pin; e2e stubs derive from it (P2). Tests: 12 usePublish unit rows (flush-abort, invalid-doc, error mapping, no-draft, republish v++, degraded version read), 4 PublishStatus RTL, 3 e2e rows in the student lane (publish→viewer-link-opens, republish v2, prior-publish renders env-free). Verified: typecheck+lint clean, app suite 1084 green **with `.env.local` moved aside** (OV-DX-13), full student lane 39/39, all 12 budgets pass (entry 173.5/185 unchanged), 39 budget-script tests. **No census write anywhere in the new path** (S7 amendment holds by construction). Author station queued at top. *(Prior entry, 2026-08-08/09:)* **the S9-prep identity slice: planned, triple-reviewed, and BUILT in one arc.** The plan was re-derived against shipped reality (P10 — the live trigger is 0021 not 0013; `assignments` has no `class_id`; Home is the perf-budgeted entry chunk), then cleared by eng review (10 findings ruled + 12-finding outside voice: two P1s reworked E-7/E-8 — GoTrue swallows trigger raise text; raises can't persist failure traces), DX review (EXPANSION: the `pnpm verify:auth` runner, all four mandated regression scripts migrated; 14-finding outside voice caught the EXPECTED-ROLLBACK idiom collision and the pooler-DSN prerequisite), and design review (4→9 with a 12-frame wireframe board; 20-finding outside voice — absent states, the regenerate after-state, `prompt=select_account` on refusal retries). Build landed in four commits (`ecf8fb5` migration+runner, `86a13ce` student shell, `b4df9b0` tests, plus docs): migration 0027, the role-gated shell, `/join/:code`, the B14 dialog, 15 identity e2e rows (which caught two real bugs: the idle banner's mount-time flag read, and the role-error state trapping shared-device sessions). Cutover gates C2+C3 CLOSED; C11 closes at your apply. **All pushed** *(reconciled 2026-08-13, T14/OV-DX-6 — this line said "none of it is pushed" for four days after the push).* **S9 planning arc since (2026-08-09→13): the cutover plan [s9-cutover.md](docs/design/s9-cutover.md) written and triple-review-CLEAR (eng §7 · DX §8/§9 · design §10 + v2 board); A1 landed (check URL → shared constant + pin test); Station 0 is next and is entirely author-side.**

**The headline discovery of the code drop: CI on main had been RED since S8's push** (six runs) and nobody had flagged it. Three root causes, none a browser bump: the CI dist was built with NO Vite env (so the faked-session key never matched — every signed-in perf/sw spec sat on the sign-in screen), the print-baseline shutter never waited on `[data-math-pending]` (the four drifting images are exactly the four math-bearing fixtures), and the one bare `page.evaluate` in print-rules raced the S8-lazy `/dev/viewer` chunk (6/6 repro). All three fixed; **A3's timing calibration stays open until five green CI runs of the perf lane exist** (the median-of-≥5 rule — the lane has never once run green in CI).

**What the batch itself found while landing:** the A11 retention pin surfaced THREE live policy↔mechanics gaps (checks purge 30d after ACTIVITY deletion while the policy discloses only 400d after CLASS deletion; no class-row purge exists at all; no ip_hash scrub exists) — recorded as todo-cases owned by the D2/D3 pack rewrite. The P1 reachability lint's first run surfaced 34 pre-existing unreachable barrel exports, each now allowlisted with its reason (test seams and gate vocabulary are legitimate; `sweepForeignCaches` carries its C6 owner). G2's strict UUID shape correctly rejected handler-test fixture ids no real database could mint.

**Suite after the batch (tool-verified this session):** schema 340 / graph-kit 384 / viewer 1078 / renderer 726 / app 1043 / budget-scripts 33 (30 pass + 3 recorded policy-gap todos); typecheck + lint clean; all 12 perf budgets pass; all three bundles regenerated and committed. Next work packages, in ruled order: B5 print-height commit (AFTER the author's B15 tag), the D2/D3 pack rewrite (author reads), the local-first slice (D4/D5/D6/D9/D28), the B8 malformed-document slice, the S9-prep identity slice — then S9 gets its own design + eng review.

_Prior entries archived in [docs/HISTORY.md](docs/HISTORY.md)._
