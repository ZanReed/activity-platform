# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it under ~150 lines: move finished-work narratives to [docs/HISTORY.md](docs/HISTORY.md), durable reasoning to [docs/DECISIONS.md](docs/DECISIONS.md). Project rules live in [CLAUDE.md](CLAUDE.md).

## Pending author actions

Things only the author does (pushes, deploys, migrations), queued and waiting.

**⏭ NOW: the TEACHER-GRADING slice is repo-complete (T1–T6) and DARK until 0034 is applied. The admission slice is COMPLETE and LIVE (T1–T7).**

**⚠ AUTHOR STEP 0 — apply migration 0034, then push.** `supabase db push` (EXPECT exactly ONE pending: **0034**) → `pnpm verify:auth --target live` (EXPECT all PASS; verify-0034 is registered). **No Edge Function deploy** — 0034 is DB-only and the app reaches it through PostgREST. ⚠ **Per OV-7 the UI must NOT reach `main`'s auto-deploy before the migration is live**, and unlike the admission slice this one DOES call new RPCs: pushing first would ship a Responses tab that 404s its own queue. **Apply, then push.** Local rehearsal done: full replay 0001→0034 clean, verify-0034 5/5 sections, integration lane 8/8, all suites green.

**What 0034 changes that is not additive:** it DROPS `grades` + `can_grade_submission` (0029 kept them empty only until this slice re-decided) and re-creates `purge_soft_deleted` without its `grades` blocker. The old blocker existed because 0010 used ON DELETE RESTRICT; `check_grades.graded_by` is SET NULL, so a grade survives its grader anonymized instead of wedging the purge. **The nightly cron would have broken at its next fire had the table been dropped without that rewrite** — verify-0034 §B is the row that proves it did not.

**⚠ AUTHOR STEP 1 — push everything after `68e4d1e` (7 commits).** `2f31d26` + `7e96797` are the admission pre-auth fork and the counsel packet — safe to push any time, since the fork is UI-only against live 0033. The five grading commits (`bf78f8d` → `601df50`) are the ones step 0 gates: **apply 0034 first, then push.**

**⚠ AUTHOR STEP 2 — the one thing no session can do: sign in.** The live admission flow has still never been driven by a human through a browser, and it cannot be driven by an AI session (signing in means entering credentials). Everything around it IS proven: verify-0033 10/10, the integration lane through the real trigger, RTL, and — new 2026-08-15 — the **pre-auth half exercised against the LIVE meta endpoint in a real browser** (bad code → the DR-6 warning + its announcement; `7NE9M2` → "Algebra 1" in the title slot; meta 200 in 763 ms). What is still unproven needs a Google account: **the OAuth round trip** (does the dashboard redirect allowlist cover `/join/*` and now `/?intent=teacher`), **the trigger admitting a stranger as `pending`**, and **`retryRole` after promotion**. Throwaway account, ~2 minutes: `/` → type `7NE9M2` → Continue with Google → expect "You're in ✓" then Algebra 1 on Home. ⚠ **Expect a brief neutral gate card between "Joining class…" and "You're in ✓"** — `retryRole()` sets `roleStatus='loading'` in the same batch as the success state. Correct, but not the board's sequence; recorded so it is not misread as a bug.

**⚠ D24 counsel read — OWED, and the gate it was meant to hold is ALREADY OPEN (author-accepted risk, 2026-08-15).**

R10/OV-8 ruled that teacher self-serve must not reach strangers before counsel read the amended pack. It does now: **0033 carried BOTH promotion RPCs and `PendingOnboarding` ships BOTH doors**, so applying the migration opened Drop 2 alongside Drop 1 in one step. That packaging was the build's error, not a station mistake — the drops were never separable once written that way.

**The author reviewed the exposure and accepted it** rather than gating the UI: the site is unadvertised, the attested-teacher caps (5 classes / 50 members) bound any single bad actor, and the counsel read is intended soon regardless.

**What that means concretely, so nobody rediscovers it as a surprise:** any Google account can currently sign in → "I'm a teacher" → attest → create classes and read roster emails, operating under a pack every file still marks DRAFT. **The counsel read is now a follow-up on live behavior, not a gate on shipping it** — and it is the last thing standing between this and a real external teacher.

**✅ The packet counsel needs is written and committed: [counsel-review-packet.md](docs/compliance/counsel-review-packet.md).** The draft-2 → draft-3 delta in plain language, the live position stated up front (teacher self-serve already open, 3 teachers / 0 students / nothing advertised), and **nine numbered questions**, each naming the platform's current position so counsel confirms or corrects rather than starting cold. The load-bearing ones: Q2 (does an *unverified* educator attestation carry the authorization it asserts — the caps are the only mitigation), Q4 (is the per-class 13+ assertion a defensible basis when students are never asked their age), and Q5 (on what basis is a pending account's data held *before* any teacher has vouched). **Writing it surfaced real drift:** `data-map.md` claimed to mirror migrations 0001–**0027** while its own table documented 0033's columns — corrected, with the doc-local-version vs `POLICY_VERSION` ambiguity promoted to Q8 instead of left for a reader to notice. The read itself is the author's; nothing repo-side is owed on it.

**✅ ALL S9 AUTHOR STATIONS CLOSED 2026-08-15** — narratives in [HISTORY.md](docs/HISTORY.md). In brief: the integration lane's first green run (which found three real defects incl. a migration chain that could not be replayed at all); 0031 + 0032 applied live as verified no-ops; the R2 teardown end to end (secrets, origins, bucket — R2 is now absent from the product: no code path, no script, no secret, no bucket); and the MathLive fonts fix deployed and curl-confirmed on the Pages origin.

⚠ **One standing watch-note (the retry-log discipline):** the a11y **gap-2 keyboard row** flaked ONCE (run 31852826598) and has not recurred in the **six** green runs since — flaky counts read individually, not inferred from the conclusions: 31854357064, 31856546774, 31861477000, 31876300109, 31877274945 and 31877664530 are all **71 passed / 0 flaky**, and the row also passed locally 2026-08-15. Instrumented in `e6b2872` so a second sighting names where focus actually is. **A second sighting is conclusive — fix then, not before. Read the flaky COUNT on every run, not the conclusion.** The tab-lock family is closed at six clean runs.

**Gate 4 — seed `student_domain` + live-verify the trigger's student branch** (deliberately LAST; needs a real district domain). Prerequisite MET (0027 live, so the mis-cased-teacher defect is disarmed). ⚠ **Never seed a consumer domain like `gmail.com`** — one row would admit every Google account on earth as a student. *(Unchanged by 0033: the domain fast path is untouched, and a seeded district simply keeps using door 1.)*

**P8 boomerang — still uncollected, deliberately.** The duration datapoints for a multi-station apply day were voided by construction for the 0027 run (two password resets, a pooler lockout, no Docker, an unplanned migration mid-station, and a materially faster author across the run — the numbers would encode a learning curve). **The slot stays open for the NEXT representative multi-station day.**

**Station HEADs (OV-DX-9) and the closed gate-9 ledger are archived in [HISTORY.md](docs/HISTORY.md)** — deploy-state markers for the S9 drops, kept out of STATE now that every station is closed.

**📌 NOT reproducible from migrations: all three teacher `display_name`s are NULL by a direct data edit.** 0021's backfill NULLed the two rows that held emails; the author then ruled (2026-08-04) that the third — a 2026-07-29 account where Google DID supply `full_name`, so it held the real name — should be NULL too. That row was outside 0021's scope by design (the backfill only touches `display_name = email`, so it never rewrites a chosen name), so it was cleared with a direct one-row UPDATE, **not a migration**. Consequence: a restored-from-migrations database would NOT reproduce this, and **a brand-new teacher signing in with a Google account that has a `full_name` will publish that name**. See the name-appearance design signal in Backlog.

**Baseline facts, re-verified live 2026-08-15 (late, tool-read not claim-read):** migrations applied **through 0033**; exactly **TWO** Edge Functions — `get-activity` **v19** (`verify_jwt:false`, the only one) + `check-activity` **v15** (`verify_jwt:true`); `publish-activity` / `ingest-submission` / `get-feedback` all DELETED from the platform. `pnpm verify:auth --target live` = **95 passed / 0 failed across 9 scripts**. Live rows: **3 teachers, 0 students, 0 pending, 1 class (`7NE9M2`, no `expected_domain`), 0 memberships** — no real student data exists yet, which is what makes every open compliance answer still cheap to change. **Re-verify flags with `list_edge_functions` after every deploy** — and read the `version` field, not the `entrypoint_path` suffix beside it (that misread produced a false "verified live" stamp twice; see HISTORY).

> **⚠ P11 CORRECTION, SECOND INSTANCE (2026-08-15 gate sweep).** This line read "v11 / v7, live as of 2026-08-14" and BOTH were wrong — live is v19 / v15. `get-activity`'s `entrypoint_path` ends `…_11`, exactly the number recorded: **the same misread the arc already corrected once** (HISTORY, Drop 1 station: "a plausible-looking field one line from the right one"). Writing the lesson down did not prevent the repeat, because nothing re-checked the number. **The durable fix is procedural: read the `version` field, and re-verify at every sweep — a version claim in STATE decays silently between deploys.** The flags, which are the part that decides whether a student reaches their first screen, were correct both times.

**Owed, not blocking cutover:** the author's legal read of the D2/D3 pack's changed sentences (committed `73ab7bc`, `POLICY_VERSION 2026-08-07-draft-2`), plus the Drop 3 compliance edits. **Standing gate D24: counsel/district reads the pack before the first real classroom** — it has never had legal review and every file says DRAFT.

## Standing constraints & watch items (current arc)

- **✅ The R2 graph-kit path is DEAD code-side (S9 Drop 4):** the viewer + editor build the kit from the workspace (app-bundled lazy Vite chunk) — no kit upload is ever needed again. What remains is the teardown station above.
- **Known limitation (stated, not hidden): offline boot needs a token that has not expired.** Expired token + no network ⇒ the pre-auth gate — refreshing needs the network, and reading Supabase's session storage directly in shipped code is a dependency worth refusing. (Offline *reopen* itself is proven as of S9 Drop 5; it had never actually worked before then — `Vary: Origin` defeated `Cache.match`.)
- **Retention is COMPLETE and proven end to end (0022–0025).** The one thing to know when touching it: **`users.deleted_at` means "account disabled", NOT "retention clock running"** — `join_class` refuses accounts that have it set, so student dormancy is DERIVED live from `class_members`/`classes` (400-day window) and the purge job never writes that column. Don't "simplify" it into a stored flag; that reintroduces a between-terms lockout. "Who is dormant right now" has no column to read — the query is `scripts/verify-0025.sql` section D.
- **⚠ `purge_soft_deleted` was re-created by 0029** minus its `submissions.student_id` guards (the nightly cron job would have died otherwise). It is live and running; treat it as the current definition.
- **▶ UNPARKED — the teacher-grading slice is the NEXT ARC (author-ruled 2026-08-15).** Parked 2026-08-01 on "no teachers using the system right now; urgent the moment one does" — **the admission slice just made that moment reachable by a stranger**, so the condition the parking rested on has expired. Free text is captured by every check and nothing can grade it. ⚠ **`get-feedback` is NOT a reference implementation** — it served bodiless 200s its entire life (P9 audit, HISTORY), and the Phase-2.6 dashboard that would have been the other reference was DELETED at S9 Drop 3; blocks + rubric authoring survive in editor/schema/viewer, `grades` is live and empty. Start from [TODOS.md](TODOS.md) → "Teacher grading bound to `section_checks`" (the S4 deferral's owner). **Re-derive against shipped reality before building (P10)** — this slice's context predates both S9 and 0033.
- **⚠ Unexplained one-off:** `sanitize.test.ts` → "differs across students and across versions" failed once (2026-08-01) and did not reproduce in 13 runs. Recorded so a second sighting is treated as a pattern.
- **Verification quirk:** the in-app Browser pane suppresses the position-measured hosts (command bar / quick-bar / drawer) under JS-driven selection — Playwright e2e (real chromium) is authoritative. `/playground` (unauthed) is the dev target; `/playground?empty=1` mounts a blank doc.
- **Two e2e traps worth re-reading before touching the lanes:** verify env-sensitive work with `.env.local` moved aside (`mv` → run → restore, OV-DX-13); and `E2E_SKIP_BUILD` over a dist built from `.env.local` puts every signed-in spec on the sign-in screen — let the lanes build their own dist.

## Current focus — the teacher-grading slice (BUILT 2026-08-15, awaiting 0034)

**Plan + rulings: [teacher-grading.md](docs/design/teacher-grading.md)** — eng review CLEAR (G1–G14), design review CLEAR (§2b/G8-DR, 4/10 → 9/10). All six tasks shipped in one session; the surface is dark until the author applies 0034.

**The four doors (0034):** `upsert_check_grade` · `release_check_grades` · `get_my_released_feedback` · `list_grading_queue`. Grades key on a SPECIFIC check row (immutable "what was graded"); the queue shows the latest per (student, section) within a version; **stale means the TEXT changed**, never "a newer check exists" — re-checking to retry auto-graded blanks is a designed feature and an attempt-number rule would cry wolf on every one.

**Three things worth knowing before touching it:**
1. **`check_grades` has ZERO RLS policies, deliberately** — the four functions are the entire access surface (0020's record_check posture). A "just let the teacher select it" policy would widen what they exist to keep narrow.
2. **maxPoints is denormalized into `criteria` by the SERVER** so the student-callable readback never opens `activity_versions.content` (the raw document, answer keys included) and a client cannot inflate a denominator.
3. **Writes gate on `can_edit_activity`, reads on `can_read_activity`** — byte-identical today, but the recorded Activity-Bank landmine is a widening of the READ helper, which must never confer write access to academic records.

**Still open, by design:** the by-student queue view, bulk cap-lifting, and rich-text feedback (plain text is v1). The pruning/rollup follow-on inherits G2's ruling plus the constraint that **pruning must never delete a check row referenced by `check_grades`** (recorded in its TODOS entry — the CASCADE that makes retention free makes pruning destructive).

## The completed arc — components-as-data re-architecture

**THE ACTIVE ARC (RULED 2026-07-28; eng + design reviews CLEARED).** Full re-architecture of the student path: live-API viewer SPA + student accounts (district Google SSO) + React component per block (single registry) + server-authoritative grading (answers never reach clients) + hard cutover. **Sequencing (author's explicit call): rewrite first; the August Algebra I release is deliberately delayed.** **Scope amendment (2026-07-28): "there are no old pages to maintain"** — live R2 pages are the author's own tests, so S9 DELETES the anonymous identity/wire machinery instead of preserving it. **Hosting (2026-07-31): Supabase-only backend; the SPA stays on Cloudflare Pages as a deliberately swappable static host.** All rulings: `~/.gstack/projects/ZanReed-activity-platform/user-main-design-20260728-components-as-data.md`; reasoning in [DECISIONS.md](docs/DECISIONS.md).

**Slice ledger — S0 through S9 are ALL COMPLETE** (narratives in [HISTORY.md](docs/HISTORY.md)):

| Slice | What | Closed |
|---|---|---|
| S0 registry + tokens | `packages/viewer` block registry (22 entries, guard-enforced) + design tokens | ✅ 2026-07-28 |
| S1 student identity | district Google SSO, `student` role, compliance pack | ✅ 2026-07-28 |
| S2 read API | `get-activity` (anon meta / authed sanitized content), sanitizer + `SANITIZER_REV` cache, 0017 | ✅ 2026-07-28 |
| S3 viewer | 22 block components + conformance factory + live route `/a/:activityId` | ✅ 2026-07-31 |
| S4 grading | `check-activity` RPC + engine + golden corpus parity gate + 0020 | ✅ 2026-08-01 |
| S5 student print | print layer + rules gate + screenshot baselines + pagination pass | ✅ 2026-08-01 |
| S6 local-first | buffer, queued checks, tab lock, sign-out hardening, service worker | ✅ 2026-08-02 |
| S5.5 teacher print | ActivityPrint + answer key + versions + foldable on the viewer tree | ✅ 2026-08-03 |
| S7 analytics census | derived census + item map on the read path, read-cache GC, teacher panel, 0026 | ✅ 2026-08-04 |
| S8 perf-budget CI | route split, 12 CI size budgets + 38 script tests, throttled perf lane, math preload | ✅ 2026-08-05 |
| S9-prep identity | 0027 (+0028), role-gated student shell, `/join/:code`, `pnpm verify:auth`, 15 identity e2e rows | ✅ 2026-08-14 |
| **S9 cutover** | **5 drops: publish rewrite · demolition · renderer death · content surface · proof lanes** | ✅ **COMPLETE 2026-08-15** — all five drops + every author station (incl. the R2 teardown); final gate sweep run. Gate 4 deferred by design (first classroom) |
| **Admission** | **T1–T7: 0033 (`pending` role + 2 audited RPCs + caps) · verify-0033 · onboarding surface · integration rows · compliance draft-3 · docs · the PRE-AUTH fork** | ✅ **COMPLETE + LIVE 2026-08-15.** T7 was found late: R5-DR's ruled primary surface had never been built, only its safety net. Two commits unpushed; the browser sign-in proof is the author's step |

**Cutover gates C1–C15 — FINAL SWEEP RUN 2026-08-15: 14 CLOSED + 1 STANDING, with gate 4 deliberately deferred.** Each gate was re-verified against shipped reality (code greps, live catalog queries, live function list) rather than against this file's own checkmarks — a sweep that reads its own claims proves nothing. Evidence: C1 zero `test.fixme` in the sw spec · C2 `watchIdleSignOut` at 2 sites · C3 role in SessionContext + `/join/:code` routed · C5 `submissions.student_id` **gone live** (the 3 repo hits are `class_members.student_id`, a different table — still live, correctly) · C6 cache pair gone, 2 remaining hits are tombstone comments (P5-correct) · C7 `--project=a11y` in the CI workflow · C8 `packages/renderer` absent · C9 targets recalibrated (992/1135/1812) + retro re-run appended · C10 STANDING, `Matching.tsx` block-id seeding intact · C11 `join_class` live · C12/C13 satisfied (`POLICY_VERSION 2026-08-07-draft-2`) · C14 tag `s5.5-print-signoff` present · C15 `ingest_submission` RPC gone, exactly 2 Edge Functions live with correct flags. **The sweep also caught a real defect** — STATE's Edge Function versions were the `entrypoint_path` misread a second time (corrected above). **Open by design: gate 4** (seed `student_domain` + live student-branch verify) — it gates the FIRST CLASSROOM, not the cutover, and needs a real district domain. Gate 9 fully closed 2026-08-15 (recalibration + retro re-run 08-14; the 150 KiB track-only ruling 08-15). Gate 13's cutover half is satisfied; its counsel read (D24) gates classrooms, not cutover. Rulings + detail in [findings-backlog.md](docs/reviews/findings-backlog.md) → RULINGS; plan in [s9-cutover.md](docs/design/s9-cutover.md) (D-1…D-14 + eng §7 + DX §8/§9 + design §10).

**Timing calibration — RECALIBRATED 2026-08-14 (the gate-9 re-measure, done by the rule).** `TIMING_TARGET_MS` = medians of the 5 post-cutover green runs (pre-auth **992**, worksheet **1135**, math-rendered **1812**; `9b78496`); the 2× ceiling and delta warning derive from these. Recalibrate only by the same rule — median of ≥5 green runs, never local darwin, never a single run. (Both ledgers archived: 08-07/09 in HISTORY, post-cutover above.)

**Suite (tool-verified 2026-08-15, after the grading slice):** schema 340 / graph-kit 384 / **viewer 1139** / **app 1077** unit, plus **38 budget-script tests**, the print e2e lane, and the editor/student/sw/perf/**a11y** e2e lanes (a11y is now 11 with the Responses-tab axe row; the integration lane is 8). Typecheck + lint clean (0 errors); all 12 perf budgets pass (entry **177.6**/185 KiB gz — +1.3 for the released-feedback card, priced per the gate-9 ledger rule). Treat the tools' printed numbers as truth, not this line.

**Editor open remainders (deferred, pre-rewrite arcs; roughly priority-ordered):**
1. **Focus mode** — needs a caret-tracking ProseMirror plugin; off-by-default, wants its own design+eng pass.
2. **Input-parity / a11y touch pass** — touch needs a real device; `/` covers the keyboard floor.
3. **Slice 6.5 smart-defaults** — net-new unvalidated heuristics; own spike, gates nothing.
4. **⌘⇧↑/↓ keyboard-reorder settle** — snap-motion follow-up (debounce design).
5. **Chip open:** the slash menu dies under synthetic keyboard input once a query char follows `/` (humans unaffected). **Papercut:** the gutter "+" can overlap the drag grip's lower half on a short block.

## Backlog / candidate arcs

- **Re-architecture follow-ons (accepted 2026-07-28):** (1) Clever/ClassLink district SSO — demand-triggered; **IdP map recorded 2026-08-09** — LMSes are not IdPs; expansion order is Azure/Entra → Clever/ClassLink → LTI 1.3. (2) Realtime push arc — trigger = first named live feature. (3) Sampled behavioral telemetry — only after the census can't answer a concrete question AND the compliance pack is amended. (4) Print variants. (5) Solution-unlock pedagogy pass. (6) /design-consultation brand pass.
- **✅ Admission model — RULED, BUILT AND LIVE 2026-08-15** ([admission-model.md](docs/design/admission-model.md) §5b R1–R11 + T1–T7). Kept in the backlog only for what it left behind: the durable **Edmodo lesson** (the violation was outsourcing consent duties without operator-side notice/minimization — **copy Gimkit's enrollment-=-consent mechanism, not Blooket's "school is responsible" clause**), and the follow-ons now split by design — **under-13 (D7), the DPA template, and the cap-lifting surface live in [TODOS.md](TODOS.md)**; email+password, extra OAuth providers, the guest tier and CAPTCHA stay in §7. Gate 4 proceeds unchanged (the domain fast path is untouched).
- **Free activity catalog / "Activity Bank"** (Phase 2 cold-start lever; [free-activity-catalog.md](docs/design/free-activity-catalog.md)). Moved behind the rewrite 2026-07-28; Drop 0 hosting prep done. One open item: taxonomy/tags — author wants a tags discussion at kickoff. Post-S9: the discovery surface is a viewer route, not an R2 URL. **The admission signal above is now a kickoff input.**
- **Vocabulary glossary — Phase 4** (tenant-scoped store + `glossaryKey` resolution; additive to the shipped mark).
- **Long-term OCR/AI:** [pdf-import.md](docs/design/pdf-import.md) + [photo-grading.md](docs/design/photo-grading.md). Photo-grading needs server-shareable answer evaluation — largely arrived with S4's grading engine; re-check at kickoff.
- **Teacher "how your name appears to students" control** (deferred 2026-08-04): a small edit writing `users.display_name` under existing self-only RLS. **Design signal from the author's own two rulings that day:** the control should NOT silently adopt Google's `full_name` as the published attribution — default to showing nothing and let the teacher opt IN. Until then the pre-auth screen says "your teacher".
- **Canvas keyboard stops** — Check sits 76 tab stops in on a full worksheet, ~17 of them canvas handles (all named, so not a violation). Measurement + the design question in [TODOS.md](TODOS.md).
- **Other Phase 2 "decide at phase start":** image-hosting quota, `skills` editing UI.

## Status by area

| Area | Status |
|---|---|
| Stages 9–16 (schema, renderer, runtime, editor, publish flow, submissions dashboard) | Historical — Phase 1 shipped and served its era; the renderer/runtime/publish-HTML/dashboard halves were deliberately DELETED at S9. Schema + editor live on |
| Database migrations 0001–0034 | ⚠ **0034 written + locally rehearsed, NOT applied** (author step 0). 0001–0033 **applied + verified live** (list_migrations, 2026-08-15 late). 0031+0032 were REPRODUCIBILITY migrations, no-ops on live; **0033 is the admission slice** (`pending` role, `redeem_join_code`, `claim_teacher` + caps). Re-run `verify-0013-0014.sql` + `verify-0017.sql` after any auth/RLS/grant migration |
| Scheduled jobs (pg_cron) | ✅ Installed 2026-08-05; both jobs active; first fire observed + verified 2026-08-06. **Verify the run, not the registration** |
| Components-as-data slices S0–S9 | ✅ Complete — see the slice ledger; only author stations remain |
| Print (baseline CSS → authored feature → viewer print + gate) | ✅ Complete through S5.5; print gates run in CI; sign-off evidence durable at tag `s5.5-print-signoff` |
| Question types + pedagogical blocks + calculator + reference panel + typography | ✅ All live |
| Phase 2.6 manual grading | ⚰️ **RETIRED at S9 Drop 3.** Blocks + rubric authoring survive in editor/schema/viewer; the dashboard + `lib/submissions`/`lib/grades` are deleted; `grades` kept empty. Successor = the parked teacher-grading slice |
| Edge Functions (**2**) + deploy flags | ✅ get-activity **v19** (`false`) + check-activity **v15** (`true`); re-verified live 2026-08-15 at the gate sweep (the prior v11/v7 were the `entrypoint_path`-suffix misread AGAIN — see the correction under Baseline facts) |
| Cloudflare R2 hosting | ⚰️ Code-side DEAD; bucket + upload scripts await the teardown station |
| Auth (Google OAuth teacher allowlist + student SSO) / React app / editor stack | ✅ In place |
| CI (typecheck/lint/test/build + **2** bundle-drift guards + **12 perf budgets + 38 script tests** + print gates + perf/sw/student/**a11y** lane job) | ✅ **GREEN and CLEAN — run 31877664530, 71 passed / 0 flaky.** **13** consecutive green runs (last failure 31787010974), the last four with zero flaky (OV-DX-8 closed at 31791526509). ⚠ T7's commits are UNPUSHED, so the newest CI run predates them |
| Student bundle (S8) | ✅ Entry chunk = the student shell, **176.3 KiB gz** (cap 185; +0.6 for T7's pre-auth landing, priced per the gate-9 ledger rule); heavy libs lazy and content-pinned out of the shell |

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
│   ├── graph-kit/     — @activity/graph-kit: shared graphing kit + /scorers + /static-svg pure subpaths
│   └── app/           — Vite + React 19 + TS + Tailwind v4 + React Router v7 (editor, dashboard, viewer routes, print)
├── supabase/
│   ├── migrations/    — numbered SQL migrations (applied set = `supabase migration list`)
│   └── functions/     — get-activity, check-activity, _shared/ (cors.ts + the generated viewer-server/grading-server bundles)
├── scripts/           — bundlers (viewer-server/grading-server/graph-kit), verify-* SQL/JS + the verify runner
└── ...root configs
```

## Key constants

- **GitHub repo:** `ZanReed/activity-platform` · **Supabase project ref:** `dtqutpdplefmufrrakxs`
- **Auth:** Google OAuth via Supabase. Site URL `http://localhost:5173` for dev. Teacher allowlist + student SSO (S1).
- **Client env:** `VITE_PUBLISHED_URL_BASE` is DEAD (deleted at S9 Drop 1) — the share link is the viewer URL `${origin}/a/${activityId}`, env-free. `.env.local` still carries the Supabase pair (+ optional `VITE_DISTRICT_HINT`).

## Open questions / deferred decisions

- **Empty fill_in_blank drag handle attachment** — whether `definingForContent: true` changed the handles-only-on-non-empty behavior is unverified; re-test during a drag-reorder pass. Minor.
- **Blank popover: one-click switch between chips** — deferred design decision, no data loss. Needs a dedicated design pass (FocusTrap/selection entanglement).
- **Section metadata panel** — SectionBreakView's inline title/checkpoint UI is adequate; an editor-level panel remains optional.
- **Responsive `--blank-width` sizing** — deferred from Stage 11.
- **`skills` editing UI** — the field round-trips everywhere, only the editing control is missing. Don't add piecemeal without the per-skill-analytics scope.
- **UX validation with 2–3 other teachers** on the editor patterns before classroom adoption.
- **Post-success edit edge case** — locked/single paths briefly write-then-remove the persistence blob (wasteful but correct). Low priority.
- **Multi-tenancy / governance when a teacher leaves a district** — Phase 4; helpers are designed for it.
- **Media storage/privacy posture** (Phase 2.8), **annotation coordinate space** (Phase 2.9) — each decided at its phase start.

---

**Last updated:** 2026-08-15 (late, third session) — **The teacher-grading slice was designed, reviewed twice, and built end to end in one session (T1–T6).** It is repo-complete and DARK: migration 0034 is written and locally rehearsed but not applied, so the Responses tab and the student's feedback card exist and do nothing until the author's step 0.

**What the reviews changed, which is the argument for running them.** The eng review's outside voice raised 14 findings; four became rulings that are now load-bearing code — writes gate on `can_edit_activity` (immune to the recorded Activity-Bank read-widening landmine), maxPoints is denormalized server-side so the student read never opens the raw document, `graded_by` is SET NULL rather than RESTRICT, and the pruning follow-on inherited an explicit "never delete a graded check row" constraint. The design review's outside voice then **overturned an eng layout call**: version headers were the wrong level-1 for a grading queue, so workload leads and version became a row tag. Its two critical findings — a released grade must SAY it is live-edited, and release needed some student-perceivable signal — both shipped.

**Four defects the tests caught before shipping, each a different class:**
1. **Dependency order** — dropping `can_grade_submission` before `grades` fails, because the table's policies depend on it (SQLSTATE 2BP01). Table first, no CASCADE.
2. **A live cron that would have died at its next fire, not at migration time** — `purge_soft_deleted` cites `grades` in its account-eligibility chain. §G re-creates it without the blocker, which is a semantic change (SET NULL supersedes the RESTRICT that required it), not a port.
3. **Nondeterminism in the staleness winner** — verify-0034 §D failed on the identical-text row, the one the whole G2 ruling exists for. `graded_at` defaults to `now()`, the TRANSACTION timestamp, so two grades written together tie and the `id desc` tiebreaker compared random uuids. Both functions now break ties on attempt_number.
4. **Vacuous coverage, caught in the act** — the three new integration rows SKIPPED on first run because the lane's fixture worksheet had no written-answer block. Fixed the fixture, not the assertion; the student now answers a real short_answer through the real check, and the grading rows grade what the app itself captured.

**Verified:** replay 0001→0034 clean · verify-0034 5/5 sections · `verify:auth --target local` 114/2 (the 2 are two other scripts' seeded-data preconditions on a fresh DB) · integration lane **8/8** · viewer 1139 · app 1077 · a11y 11/11 with a new axe row · sw lane 7/7 (the G14 offline-reopen guarantee survives the new network call) · typecheck + lint + 38 script tests clean · 12/12 budgets, shell 177.6/185 KiB.

*(Prior entry:)* **The admission side quest closed by finding what the slice had missed** — R5-DR's ruled PRE-AUTH fork existed only as its post-auth safety net, while `Home.tsx` carried a comment asserting the fork routed users. Shipped as T7 with the P5 flip on the e2e row that pinned the replaced heading. The counsel packet ([counsel-review-packet.md](docs/compliance/counsel-review-packet.md)) states the draft-2 → draft-3 delta and asks nine questions; writing it caught `data-map.md` claiming migrations 0001–0027 while documenting 0033's columns. The pre-auth half of admission is proven against the LIVE endpoint in a real browser; the sign-in half needs the author's hands.

_Prior entries archived in [docs/HISTORY.md](docs/HISTORY.md)._
