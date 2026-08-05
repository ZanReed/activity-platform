# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it under ~150 lines: move finished-work narratives to [docs/HISTORY.md](docs/HISTORY.md), durable reasoning to [docs/DECISIONS.md](docs/DECISIONS.md). Project rules live in [CLAUDE.md](CLAUDE.md).

## Pending author actions

Things only the author does (pushes, deploys, migrations), queued and waiting.

**📌 NOT reproducible from migrations: all three teacher `display_name`s are NULL by a direct data edit.** 0021's backfill NULLed the two rows that held emails; the author then ruled (2026-08-04) that the third row — a 2026-07-29 account where Google DID supply `full_name`, so it held the real name `"Zan Reed"` — should be NULL too. That row was outside 0021's scope by design (the backfill only touches `display_name = email`, so it never rewrites a chosen name), so it was cleared with a direct one-row UPDATE, **not a migration**. Verified after: all three published activities return `teacher_name:null` over anonymous HTTP. Consequence to remember: a restored-from-migrations database would NOT reproduce this, and **a brand-new teacher signing in with a Google account that has a `full_name` will publish that name** — the trigger stores it, ruling 3.2A says a name is what that screen is for, and that is still correct for other teachers. See the design signal on the name-appearance control in Backlog.

**📌 SCHEDULED JOBS NOW EXIST — first run pending, verify the morning after.** Both registered and confirmed 2026-08-05 (`purge-soft-deleted` `0 3 * * *`, `analytics-maintenance` `30 3 * * *`; both `active`, both `database=postgres username=postgres`, `cron.log_run=on`). **Neither has run yet** — `cron.job_run_details` was empty at 01:22 UTC, ~1h40m before the first fire, which is the innocent reading and the expected one.

**The finding this closed, kept because it is the lesson:** until 2026-08-04, pg_cron had never been installed, so `purge_soft_deleted` had *never once run* — the 0022–0025 arc hardened the purge function and proved it in rolled-back transactions, but nothing ever checked that it was scheduled. That is the same pattern the arc itself found, one level up, and it stayed invisible because the practical impact was nil (no students, no checks). [retention-policy.md](docs/compliance/retention-policy.md) had been naming a "scheduled purge job" as the enforcement mechanism for four data categories the whole time. A first attempt to enable it also silently didn't take (the `cron.schedule` calls errored on the missing schema and the errors went unread) — **so verify the run, not the registration.**

**Predicted first run (2026-08-05, so it is falsifiable — if the morning after disagrees, something is wrong):**
- 03:00 `purge_soft_deleted` — its first execution ever. Expect it to COMPLETE without abort (that is exactly what 0023 fixed) and to purge nothing: nothing is soft-deleted past its window.
- 03:30 `run_analytics_maintenance` — expect a ledger row with **`stale_cache_rows_deleted = 3`**, `section_check_rows = 0`, `census_versions = 0` (or 134 if the backfill ran first). The GC heuristic is verified safe to run: the newest cache row (2026-08-01) carries the genuinely current rev `1-f8328527`, so the sweep targets the three older `1-5dbcb651` orphans and keeps the two good rows — not the inverse.

Verify with:
`select jobname, status, start_time, return_message from cron.job_run_details d join cron.job j using (jobid) order by start_time desc limit 10;`
`select * from analytics_job_runs order by ran_at desc limit 3;`

**📌 S7 — migration APPLIED and VERIFIED LIVE; two steps left (both above/below).**

*Verified 2026-08-04 immediately after `supabase db push`:* migrations now run through **0026**; `get-activity` is at **v8 with `verify_jwt:false`** (flag survived the deploy). The **function-ahead-of-migration window is closed** — while it was open the failure behaved exactly as designed (census error → cache row withheld → student still served a correct 200), and edge logs show no content read even reached it.

**verify-0026 ran green against the live database**, structural and behavioral: A1–A3 (2 CASCADE FKs, 0 ledger FKs, 3 DEFINER functions with pinned `search_path`), B1–B4 (RLS forced + zero policies on all three tables, no anon/PUBLIC grant, write paths unreachable by `authenticated`, **no student-identifier column**), and the whole of C on its own rolled-back fixture: census 2 counts / 3 items, re-run idempotent, **`fill_in_blank` 4/6 across attempts vs 3/4 on latest** (the re-check inflation that got rollups deferred, now demonstrated on real infrastructure), `multiple_choice` 2/3 vs 2/2, one `_unattributed` verdict with a null `block_count`, totals 3 checks / 2 students / censused, stranger AND student both refused with `Not available`, one ledger row written. **Rollback confirmed clean afterward** — no fixture activity, domain, auth user, check, census or ledger row survived, and the sweep's own deletes rolled back with it. One real defect surfaced and was fixed in the committed script: `activities.slug` is NOT NULL and the fixture omitted it (it failed on the first insert).

1. ~~**`pnpm deploy:get-activity`**~~ ✅ v8 live, `verify_jwt:false` confirmed.
2. ~~**Apply migration 0026**~~ ✅ applied + verified green (above).
3. ~~**Enable pg_cron and schedule both jobs**~~ ✅ done + verified registered 2026-08-05; **first run still pending** (see the prediction above — check it the morning after).
4. ~~**Run the census backfill**~~ ✅ **DONE 2026-08-05 — 24 versions censused (259 census rows, 225 item rows), 0 write failures, re-run verified idempotent.** All **3 live published activities** are censused (13 / 17 / 3 keys). **110 versions were SKIPPED as unservable** — every one is `schemaVersion 1` with no upgrade path, i.e. superseded history plus the 13 soft-deleted activities' versions. That is not new breakage: the read API cannot serve those documents either (it 500s `upgrade_failed`), and no live published activity is among them — verified by grouping current versions by schemaVersion. It is the concrete form of TODOS R6(d) (the upgrade chain owes fixtures from its first real migration). Two real script defects were found and fixed by this run: it imported `@supabase/supabase-js`, which pnpm cannot resolve from the workspace root (now plain `fetch`, zero deps, works from a clean checkout), and it counted unservable skips as FAILURES, so a normal run exited 1 and read as an outage.

5. ~~**Live e2e probe**~~ ✅ **DONE 2026-08-05 — `verify-analytics-e2e.js`: 8 PASS, 0 FAIL** in the author's console, signed in. Covers the layer nothing else reaches: resolve + content read still 200 with sections, **no census/analytics field in the served document** (8728 bytes scanned), the owner reads `get_activity_analytics` over real HTTP with the documented shape, a non-owned activity is refused (`P0001 Not available`), anon refused by the grant (401), and the current version reports **censused=true, 13 keys, 0 checks**. Session-free legs were verified separately by curl (META 200 anonymous with `teacher_name:null` — `--no-verify-jwt` live AND 0021 holding; CONTENT 401 without auth), and the deployed Pages bundle carries the panel route.

   **S7 IS COMPLETE.** Only the cron's first fire remains to observe (prediction above).

   *Two copy defects the probe surfaced, both fixed:* the probe said "maintenance job has NEVER run — schedule the cron" and the panel said "the nightly analytics job is not scheduled yet" — **both false the moment the cron was registered**, and both would have sent a reader to re-schedule an already-scheduled job. The ledger knows whether the job RAN; it knows nothing about whether it is SCHEDULED. Both now say only that, and the panel gained a genuine staleness signal instead (a run older than 36h reads "may have stopped"), which is the dead-cron warning this surface existed to provide in the first place.

**Otherwise EMPTY — verified against the live project, not assumed** (2026-08-04, post-0026: `list_migrations` + `list_edge_functions` + a pg_proc/pg_extension pass): **migrations applied through 0026**; `ingest-submission` v42 / `get-feedback` v4 / **`get-activity` v8** all `verify_jwt:false`; `check-activity` v5 + `publish-activity` v122 both `verify_jwt:true`; kit manifest `graph-kit-R5LUPQJS.js` committed. **pg_cron installed 2026-08-05 with both jobs registered; their first run is not yet observed.** Deploy narratives archived in [HISTORY.md](docs/HISTORY.md).

*E2E residue cleared 2026-08-04.* The 44 `section_checks` rows on activity `6a84c8cb` are gone (`section_checks` is now empty); the activity, its 4 versions, users, and audit_log were verified untouched. **That deletion would have quietly broken `verify-0022.sql` C1**, which pointed at those ambient rows — with no check to block, its "purge SUCCEEDED, checks_remaining=0" would have passed while proving nothing about the RESTRICT it exists to test. C1 now builds its own fixture and asserts `checks_before=1`, and the anti-vacuity was proven both ways against the live DB: it passes on the current function, and still reports `23503` when the pre-0022 ordering is reinstalled. This repo had already been bitten once by a vacuously-true check (HISTORY → the empty-activity leak scan).

*0025 verification, run 2026-08-04 after the author applied it — all green, and it closes the retention arc.* Section 0 confirms it live; A1 dormancy present and students-only; **A2 the job does NOT write `users.deleted_at`** and A3 `join_class` still gates on it — together the pair that keeps a between-terms student out of a lockout; A4/B1 posture and grants unchanged. **C1's six-case fixture matrix is exactly right: `active_member=1 ended_401d=0 ended_100d=1 never_401d=0 never_10d=1 teachers_left=3`** — an active membership protects, 401 days dormant purges, 100 days (the summer case) does not, never-joined ages out, a new never-joined account is safe, and teachers are untouched. C2 confirms every fixture rolled back (0 students / classes / memberships / domains; 165 audit rows, 0 stamped). D1 returns 0 rows — no student accounts exist yet, so nothing is dormant.

*0022 / 0023 / 0024 verification narratives (all green, run the same day) archived in [HISTORY.md](docs/HISTORY.md).*

*0021 verification, run 2026-08-04 after the author applied it — all green.* `verify-0021.sql` A1–A3 / B1 / C1–C2 pass (trigger carries no email fallback, RPC guard present, grants survived REPLACE, 0 fallback artifacts, 0 leaking activities). Regression re-runs clean: `verify-0017.sql` A1–A3 / B1–B2 / D1 (D1 still returns exactly the one documented anon row), `verify-0013-0014.sql` A1–A7 / B1–B6. **Live end-to-end over HTTP, no `Authorization` header:** the two email-backed activities now return `teacher_name:null` with titles intact. Security advisor shows no NEW findings — every lint is the documented intentional residue (0009/0015/0016/0017 footers); `auth_leaked_password_protection` is unrelated (OAuth-only project, no passwords). One script fix fell out: `verify-0013-0014.sql` B5 said "EXPECT 5" while querying both migrations' policies — 0014's own `classes_insert_teacher` makes it 6. Corrected in the script.

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

**Slice ledger — S0 through S6 are ALL COMPLETE** (narratives in [HISTORY.md](docs/HISTORY.md); rulings in the gstack design doc):

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
| S7 analytics census | derived census + item map on the read path, read-cache GC, maintenance ledger, on-demand teacher panel, migration 0026 | ✅ 2026-08-04, built — **awaiting author apply/deploy** |

**⏭ NEXT: S8 perf-budget CI · S9 cutover** (S9 needs both parity gates green — the grading corpus gate and the print gate both already run in CI — plus the sw-offline fixme above). Task detail lives in the gstack design doc; nothing in S0–S7/S5.5 is outstanding. **S9 cutover cleanup checklist (2026-07-31 ruling, kept here so it isn't lost to HISTORY):** delete publish-activity's R2 upload path, the R2 secrets on the functions, `VITE_PUBLISHED_URL_BASE`, the R2 origin in `ALLOWED_ORIGINS`, then the bucket itself; the R2 kit machinery (`upload:graph-kit`, the manifest, `.env.r2`) and `build:fonts`/`build:mathlive-fonts` die with it; existing test-activity image `src`es on R2 keep resolving until the bucket dies, no rewrite needed. **⚠ AMENDED 2026-08-04 (S7): "the census folds into the S9 publish rewrite (R6)" is DEAD — S9 has no census work at all.** The census is derived from stored version snapshots by `get-activity`'s cache-fill path and never touches `publish-activity`, so the publish rewrite carries nothing analytics-related. Do not re-add a census write to the new publish path; it would be a second writer racing the read path on the same keys.

**Suite (verified against `pnpm test` output 2026-08-04, post-S7):** schema 340 / graph-kit 384 / viewer 1039 / renderer 724 / app 1033 unit, **61 print e2e**, plus the editor/student/sw e2e lanes (227 pass, 2 parked). Typecheck + lint clean; all three bundles regenerate clean. Treat the tools' printed numbers as truth, not this line.

**Editor open remainders (deferred, pre-rewrite arcs; roughly priority-ordered):**
1. **Focus mode** — needs a caret-tracking ProseMirror plugin (CSS can't identify the caret block); off-by-default, wants its own design+eng pass.
2. **Input-parity / a11y touch pass** — touch needs a real device; `/` covers the keyboard floor.
3. **Slice 6.5 smart-defaults** — net-new unvalidated heuristics; own spike, gates nothing.
4. **⌘⇧↑/↓ keyboard-reorder settle** — snap-motion follow-up (debounce design).
5. **Chip open:** the slash menu dies under synthetic keyboard input once a query char follows `/` (humans unaffected). **Papercut:** the gutter "+" can overlap the drag grip's lower half on a short block.

## Backlog / candidate arcs

- **▶ SCHEDULED — runtime budget-ladder: per-question-type inlining variants (do BEFORE the next question-type generation).** The base runtime is **41.8 KiB, over its 40 KiB soft target** (the math-blank runtime pushed it over); the 2026-07-10 amendment ([DECISIONS.md](docs/DECISIONS.md) → "Runtime size budget amendment") says pull a structural lever when a variant nears the ceiling, "scheduled, not discovered." This is that lever. **Mechanism already exists:** [document.ts](packages/renderer/src/document.ts) picks the runtime by scanning the rendered `body` for marker attributes. **Approach:** carve the less-common question machinery (free-text, `matching`, `ordering`, math-blank glue) out of the always-on base into conditionally-inlined chunks, leaving a minimal core. **Constraints (eng-review at pickup):** the runtime invariants must survive the split — `init.ts` the only DOM walker, `render()` the only mutator, vanilla-TS chunks, no `@activity/schema`; re-measure every variant after. Not blocking today (no new question type queued), but must land before one does. NB the renderer retires at S9 — weigh whether this lever is still worth pulling as S9 approaches.
- **Re-architecture follow-ons (accepted 2026-07-28):** (1) Clever/ClassLink district SSO — demand-triggered. (2) Realtime push arc — trigger = first named live feature. (3) Sampled behavioral telemetry — only after the census can't answer a concrete question AND the compliance pack is amended. (4) Print variants (print-with-my-work) — print parity is green; pick up when asked. (5) Solution-unlock pedagogy pass — informed by census data on check patterns. (6) /design-consultation brand pass — when the identity question goes live.
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
| Scheduled jobs (pg_cron) | ✅ Installed 2026-08-05; both jobs registered + active. **First run not yet observed** — verify per the prediction in Pending author actions |
| Components-as-data slices S0–S7 + S5.5 | ✅ Complete — see the slice ledger above |
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
| CI (typecheck/lint/test/build + 3 bundle-drift guards + print gates job) | ✅ Green |

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
- **Client env:** `VITE_PUBLISHED_URL_BASE` in `.env.local` (gitignored) mirrors the write-only `R2_PUBLIC_URL_BASE` secret; unset → published-page links hide. Dies at S9.

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

**Last updated:** 2026-08-04 (later session) — **S7 analytics census BUILT, awaiting apply/deploy.** The slice changed shape twice under review before a line was written, both times for the same reason: the 2026-07-28 plan predates what S2 and S4 actually shipped. (1) A "publish-time census" is obsolete — every published version's document is already stored forever, so the census is DERIVED on the read path and `publish-activity` is untouched, which dissolves finding R6(b) instead of scheduling the double-write it warned about. STATE's own S9 checklist line about folding the census into the publish rewrite is amended above; it is now dead scope. (2) Durable rollups were designed, then deliberately NOT built: re-checking is a designed feature, so a naive per-day count tallies one student's mastered item once per attempt, and the correct shape depends on the same parked attempts-vs-latest ruling that already gates check pruning. Freezing the wrong aggregate in the one artifact meant to outlive its source rows is unrecoverable, so aggregation is computed live from raw checks and reports both readings; the rollup design inputs are recorded in TODOS. One real defect was caught in the ruled design and fixed before shipping: census-write-then-cache-write ordering, because a cache row written after a failed census makes every later read a HIT that skips analytics — silently and permanently. Red-green verified (removing the guard turns exactly those two pins red). Also shipped: both halves of the R6(a) read-cache GC, an `analytics_job_runs` ledger surfaced on the panel so a dead cron is visible where someone looks, and a rerunnable backfill that doubles as the repair tool. Suite +28 (viewer 1039, app 1033); all three bundles regenerate clean.

**Prior entry, 2026-08-04:** **five migrations, all applied and verified: 0021 (display_name privacy), 0022 (purge-job section_checks fix), 0023 (account retention clock), 0024 (audit actor on purge), 0025 (derived student dormancy).** A privacy fix opened the thread; refreshing the compliance pack to match it exposed that the retention machinery underneath had never worked — the nightly purge would have died once checks aged in, it deleted `public.users` while leaving the Google identity behind, and no account could be purged at all. All three are fixed, and account deletion now demonstrably completes end to end (proven against the live DB in rolled-back transactions, the discipline used for every fix in this arc). 0025 closes the arc by starting the clock, and changed its substance as well as its mechanism: the account window went from 30 days to 400, because 30 is shorter than a summer break and would have purged students over the holidays. Retention now stands complete; the standing note under Standing constraints records the one invariant not to break. Trigger stops storing emails, anon meta RPC refuses to return them, 2 rows backfilled to NULL; name-appearance control backlogged. Full verification pass green including a live anonymous HTTP fetch (detail under Pending author actions). One decision left open there: a third account still publishes the real name "Zan Reed" — intended behavior, but worth an explicit call. Earlier same day: drift audit + STATE restructure (9 mechanical findings fixed, finished narratives to [HISTORY.md](docs/HISTORY.md)); suite verified green (counts above).

_Prior entries archived in [docs/HISTORY.md](docs/HISTORY.md)._
