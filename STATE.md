# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it under ~150 lines: move finished-work narratives to [docs/HISTORY.md](docs/HISTORY.md), durable reasoning to [docs/DECISIONS.md](docs/DECISIONS.md). Project rules live in [CLAUDE.md](CLAUDE.md).

## Pending author actions

Things only the author does (pushes, deploys, migrations), queued and waiting.

**⏭ NOW: nothing is blocked — but ONE THING IS STILL IN FLIGHT, by design.** 0036 is applied live, `verify:auth --target live` = **147/0**, and `7e416f3` is pushed (tool-settled: `git ls-remote` = local HEAD). **⏳ The rollup has not run yet.** 0036 was applied 2026-08-17 ~05:49 UTC, *after* that day's 03:30 nightly, so the newest ledger row (id 16) was written by the OLD v1 function and `analytics_rolled_boundary()` is **still NULL**. **The first v2 run is 2026-08-18 03:30 UTC.**

**What to check on that first run — three observables, all tool-readable:** (1) `analytics_rolled_boundary()` becomes non-NULL (the watermark starts advancing; from here the prune's gate is schedule + dry-run only — see the warning below); (2) the author's `users.rollup_rebuild_needed` flips **true → false** (it is true right now: 0036's `Pacific/Auckland` UPDATE legitimately fired the zone-change trigger, so the self-heal is queued — with 0 checks it recomputes nothing and just clears, which is exactly the NULL-guard path the local matrix caught); (3) the row's `notes` should read `…; self-healed 1 owner(s)`. **If the watermark is still NULL after 03:30 on the 18th, the v2 job did not run — read `cron.job_run_details`, not the registration (P3).**

**Live posture confirmed by tool-read 2026-08-17:** 0036 in `schema_migrations`, both rollup tables present, all 6 new functions present, `users.timezone` = `Pacific/Auckland` for the author and NULL (→ Chicago default) for the other three, **0 purge ledger rows, 0 rolled rows, 0 checks**, and **13 analytics ledger rows — exactly the 13 real nightlies, no verify residue** (P7 holds; the live verify's rolled-back transactions consumed sequence ids but left no rows).

⚠ **OPTIONAL, author's call (no recommendation pretends both sides win):** the cron hours. 03:00/03:30 UTC is US Central 21:00 (homework evening) AND NZ 15:00 (school afternoon) — busy for both. Across a 17–18h offset **there is no mutually-quiet hour**; ~09:30/10:00 UTC would favor the US cohort at the cost of NZ-evening rolls. Correctness never depends on the hour (full-day re-rolls are idempotent); the only cost is boundary churn. `cron.alter_job`, author-run SQL if wanted.

⚠ **THE GATE'S CHARACTER CHANGES WHEN 0036 LANDS — the one thing not to misread.** 0035's gate was mechanical: nothing wrote `rolled_through`, so arming was inert. **0036 writes it nightly.** From then on the prune is held disarmed by exactly two things: it is **not scheduled**, and its **dry-run default**. Scheduling `prune_section_checks(false)` would then really delete. The arming checklist in [TODOS.md](TODOS.md) is the only guard from that point, and step 8 (the cron flip) is the first genuinely destructive act in the whole arc.

**✅ THE ONE PROOF NO SESSION CAN MAKE — COLLECTED 2026-08-16 (author, real browser, second Google account).** The join-code half of the live admission flow has now been driven end to end by a human: a pre-existing teacher account used class `7NE9M2` (created 2026-08-14 — no class was made that day), and a second, distinct Google account joined it as a student. **Tool-read confirmation, not a claim-read:** `users` went 3 teachers / **0 students → 3 teachers / 1 student** (row created `2026-08-16 00:28:27+00`), `7NE9M2` shows **1 active member**, and **no `pending` rows remain** (consistent with promotion completing — `pending` is transient). The class's `expected_domain` is **null** and no `student_domain` row exists, so that account matched **no** fast path. That discharges all three items this block used to name: **the OAuth round trip** (the dashboard redirect allowlist covers the flow), **the trigger admitting a stranger**, and **`retryRole` after promotion**.

**What the collected proof does NOT cover — read this before citing it:**
- **Gate 4 is untouched.** What ran was `redeem_join_code`. The **`student_domain` fast path has still never executed live** — no seed, no exercise. It stays deliberately last (see its own item below).
- **`claim_teacher` has never promoted anyone live.** All 3 teacher rows predate the admission slice (newest 2026-07-29), so the "I'm a teacher" self-serve door — the one D24 is actually about — is still unexercised by a stranger.
- **✅ Confirmed by the author on the same run:** the brief neutral gate card DID appear between "Joining class…" and "You're in ✓", and read as normal loading rather than an error. Expected and correct — `retryRole()` sets `roleStatus='loading'` in the same batch as the success state. The question this closes is not "does it render" but "does a real person misread it as a failure"; they did not. Leave the sequence alone.

*(Repro, if it is ever needed again: `/` → type `7NE9M2` → Continue with Google → expect "You're in ✓" then Algebra 1 on Home.)* Proven around it beforehand, and still valid: verify-0033 10/10, the integration lane through the real trigger, RTL, and the pre-auth half against the LIVE meta endpoint in a real browser (bad code → the DR-6 warning; `7NE9M2` → "Algebra 1" in the title slot).

**⚠ D24 counsel read — OWED, and the gate it was meant to hold is ALREADY OPEN (author-accepted risk).** R10/OV-8 ruled teacher self-serve must not reach strangers before counsel read the amended pack. It does: 0033 carried BOTH promotion RPCs and `PendingOnboarding` ships BOTH doors, so applying the migration opened Drop 2 alongside Drop 1. **The author reviewed and accepted the exposure** (unadvertised site, caps of 5 classes / 50 members bound any single bad actor). ⚠ **As of 2026-08-16 the exposure is no longer hypothetical**: a real second account's data now sits in the database under a pack every file marks DRAFT. It is the author's own throwaway account, so nothing is owed to a third party — but the "no real student data" cushion this item leaned on is gone. Concretely: any Google account can sign in → "I'm a teacher" → attest → create classes and read roster emails, under a pack every file marks DRAFT. **✅ The packet is written: [counsel-review-packet.md](docs/compliance/counsel-review-packet.md)** — the draft-2 → draft-3 delta, the live position up front, and ten numbered questions each naming the platform's current position (Q10, added 2026-08-16, asks whether n=1 daily aggregates surviving a purge are retained student data — it gates ARMING the check-prune, nothing sooner). The load-bearing three: Q2 (does an *unverified* educator attestation carry the authorization it asserts), Q4 (is the per-class 13+ assertion defensible when students are never asked their age), Q5 (on what basis is a pending account's data held *before* any teacher vouched). The read itself is the author's; nothing repo-side is owed.

**Gate 4 — seed `student_domain` + live-verify the trigger's student branch** (deliberately LAST; needs a real district domain). Prerequisite MET (0027 live). ⚠ **Never seed a consumer domain like `gmail.com`** — one row would admit every Google account on earth as a student.

**P8 boomerang — still uncollected, deliberately.** The duration datapoints for a multi-station apply day were voided by construction for the 0027 run (two password resets, a pooler lockout, no Docker, an unplanned migration mid-station, a materially faster author across the run). **The slot stays open for the NEXT representative multi-station day.**

**📌 NOT reproducible from migrations: all three teacher `display_name`s are NULL by a direct data edit.** 0021's backfill NULLed the two rows holding emails; the author then ruled (2026-08-04) the third — a 2026-07-29 account where Google DID supply `full_name` — should be NULL too. That row was outside 0021's scope by design, so it was cleared with a one-row UPDATE, **not a migration**. Consequence: a restored-from-migrations database would NOT reproduce this, and **a brand-new teacher signing in with a Google account that has a `full_name` will publish that name**. See the name-appearance design signal in Backlog.

**Baseline facts, tool-read live 2026-08-17 (never claim-read):** migrations applied **through 0036** · exactly **TWO** Edge Functions — `get-activity` **v19** (`verify_jwt:false`, the only one) + `check-activity` **v15** (`true`) · `pnpm verify:auth --target live` = **147 passed / 0 failed across 12 scripts** · both pg_cron jobs active · live rows (re-read 2026-08-17 after the 0036 apply): **3 teachers, 1 student, 0 pending, 0 checks, 0 grades, 1 class (`7NE9M2`, 1 active member), 8 activities** · **0 `analytics_job_runs` rows carry a `rolled_through` yet** — the first v2 run is 2026-08-18 03:30 UTC (see the ⏭ block). ⚠ **"No real student data exists yet" is NO LONGER TRUE** — one real second account is enrolled. It is the author's own throwaway, so the compliance answers stay cheap to change, but the sentence that made them free has expired. **Re-verify flags with `list_edge_functions` after every deploy — read the `version` field, NOT the `entrypoint_path` suffix beside it** (that misread produced a false "verified live" stamp twice; `get-activity`'s path ends `…_11` while its version is 19).

⚠ **One standing watch-note (the retry-log discipline):** the a11y **gap-2 keyboard row** flaked ONCE (run 31852826598) and has not recurred in the **thirteen** green runs since (latest 31999243137, the 0036 slice: 73 passed / **0 flaky**). Instrumented in `e6b2872` so a second sighting names where focus actually is. **A second sighting is conclusive — fix then, not before. Read the flaky COUNT on every run, not the conclusion.**

**Archived to [HISTORY.md](docs/HISTORY.md):** all S9 author stations, the station HEADs (OV-DX-9), the closed gate-9 ledger, and this session's 0034 apply + purge-liveness + CI narrative.

## Standing constraints & watch items (current arc)

- **✅ The R2 graph-kit path is DEAD code-side (S9 Drop 4):** the viewer + editor build the kit from the workspace (app-bundled lazy Vite chunk) — no kit upload is ever needed again. What remains is the teardown station above.
- **Known limitation (stated, not hidden): offline boot needs a token that has not expired.** Expired token + no network ⇒ the pre-auth gate — refreshing needs the network, and reading Supabase's session storage directly in shipped code is a dependency worth refusing. (Offline *reopen* itself is proven as of S9 Drop 5; it had never actually worked before then — `Vary: Origin` defeated `Cache.match`.)
- **Retention is COMPLETE and proven end to end (0022–0025).** The one thing to know when touching it: **`users.deleted_at` means "account disabled", NOT "retention clock running"** — `join_class` refuses accounts that have it set, so student dormancy is DERIVED live from `class_members`/`classes` (400-day window) and the purge job never writes that column. Don't "simplify" it into a stored flag; that reintroduces a between-terms lockout. "Who is dormant right now" has no column to read — the query is `scripts/verify-0025.sql` section D.
- **⚠ `purge_soft_deleted` was re-created by 0029** minus its `submissions.student_id` guards (the nightly cron job would have died otherwise). It is live and running; treat it as the current definition.
- **✅ Teacher grading — SHIPPED 2026-08-16** ([teacher-grading.md](docs/design/teacher-grading.md)). Kept in the backlog only for what it left behind: the **by-student queue view** and **rich-text teacher feedback** (plain text is v1) are named follow-ons. Its pruning/rollup inheritance is now DISCHARGED into 0035 + the arming-arc TODOS entry.
- **⚠ Local verify pair-of-reds is DATA-STATE-DEPENDENT, not a fixed pair.** The recorded "fresh DB = 114/2 (image-storage + 0020)" is one instance of a class: on 2026-08-16's non-fresh local DB the suite scored 125/2 with verify-**0033** `existing_teachers_exempt` (e2e-fixture teachers aren't caps-exempt) + verify-0020 (no published activity) red and image-storage green. Read WHICH rows failed and check they're seeded-data preconditions before treating any local red as a defect; live is the arbiter.
- **⚠ Unexplained one-off:** `sanitize.test.ts` → "differs across students and across versions" failed once (2026-08-01) and did not reproduce in 13 runs. Recorded so a second sighting is treated as a pattern.
- **Verification quirk:** the in-app Browser pane suppresses the position-measured hosts (command bar / quick-bar / drawer) under JS-driven selection — Playwright e2e (real chromium) is authoritative. `/playground` (unauthed) is the dev target; `/playground?empty=1` mounts a blank doc.
- **Two e2e traps worth re-reading before touching the lanes:** verify env-sensitive work with `.env.local` moved aside (`mv` → run → restore, OV-DX-13); and `E2E_SKIP_BUILD` over a dist built from `.env.local` puts every signed-in spec on the sign-in screen — let the lanes build their own dist.

## Current focus — the check-prune slice (0035) is BUILT; the rollup deliberately WAITS

**Plan + the full ruling trail: [check-retention-and-rollup.md](docs/design/check-retention-and-rollup.md)** (eng review 2026-08-16, D2–D12). The months-parked pruning/rollup entry closed in one day — but NOT as drafted: **the review's outside voice overturned the draft's build-the-rollup-now frame (D10)**. What shipped is the prune, DISARMED, with a schema-encoded arming gate: `prune_section_checks` refuses every row until `analytics_job_runs.rolled_through` is non-NULL, and nothing writes that column until the future rollup does — so arming early is mechanically inert, not merely forbidden (D11). The rollup's design is fully RULED (item grain, per-teacher timezone with `America/Chicago` default + the author's row → `Pacific/Auckland`, 5-min MVCC lag, coalesce-forward watermark, latest-grounded students) and recorded in the plan §5 + the TODOS arming-arc entry — **inherit, don't re-derive**. Trigger for building it: real check growth on the ledger (still 0).

**Three things worth knowing before touching it:** (1) the `section_checks_latest` view is THE definition of "current attempt" — the prune deletes only its complement, and verify-0035 §C(H) pins the queue's equivalence; (2) G12 is clause 2 — a graded check is never a candidate, proven with a real deletion in §C; (3) verify-0035 §A's `rolled_through_never_written` row is DESIGNED to go red when the arming arc lands — flip it there, don't delete it.

**Teacher grading ([teacher-grading.md](docs/design/teacher-grading.md), shipped 2026-08-16)** stays live and correct-and-EMPTY: 0 checks, 0 grades — the first real classroom is still its first real exercise.

**The four doors (0034):** `upsert_check_grade` · `release_check_grades` · `get_my_released_feedback` · `list_grading_queue`. Grades key on a SPECIFIC check row (immutable "what was graded"); the queue shows the latest per (student, section) within a version; **stale means the TEXT changed**, never "a newer check exists" — re-checking to retry auto-graded blanks is a designed feature and an attempt-number rule would cry wolf on every one.

**Three things worth knowing before touching it:**
1. **`check_grades` has ZERO RLS policies, deliberately** — the four functions are the entire access surface (0020's record_check posture). A "just let the teacher select it" policy would widen what they exist to keep narrow.
2. **maxPoints is denormalized into `criteria` by the SERVER** so the student-callable readback never opens `activity_versions.content` (the raw document, answer keys included) and a client cannot inflate a denominator.
3. **Writes gate on `can_edit_activity`, reads on `can_read_activity`** — byte-identical today, but the recorded Activity-Bank landmine is a widening of the READ helper, which must never confer write access to academic records.

**Still open, by design:** the by-student queue view, bulk cap-lifting, and rich-text feedback (plain text is v1). The pruning/rollup follow-on became **migration 0035 + the arming arc** — see Current focus.

## The completed arc — components-as-data re-architecture

**THE ACTIVE ARC (RULED 2026-07-28; eng + design reviews CLEARED).** Full re-architecture of the student path: live-API viewer SPA + student accounts (district Google SSO) + React component per block (single registry) + server-authoritative grading (answers never reach clients) + hard cutover. **Sequencing (author's explicit call): rewrite first; the August Algebra I release is deliberately delayed.** **Scope amendment (2026-07-28): "there are no old pages to maintain"** — live R2 pages are the author's own tests, so S9 DELETES the anonymous identity/wire machinery instead of preserving it. **Hosting (2026-07-31): Supabase-only backend; the SPA stays on Cloudflare Pages as a deliberately swappable static host.** All rulings: `~/.gstack/projects/ZanReed-activity-platform/user-main-design-20260728-components-as-data.md`; reasoning in [DECISIONS.md](docs/DECISIONS.md).

**Slice ledger + the C1–C15 cutover gates are ARCHIVED in [HISTORY.md](docs/HISTORY.md)** — S0 through S9 plus the Admission and Teacher-grading slices are all closed, and the final gate sweep ran 2026-08-15 against shipped reality (14 closed, 1 standing, gate 4 deliberately deferred to the first classroom). Nothing in that table is a live decision anymore.

**Timing calibration — RECALIBRATED 2026-08-14 (the gate-9 re-measure, done by the rule).** `TIMING_TARGET_MS` = medians of the 5 post-cutover green runs (pre-auth **992**, worksheet **1135**, math-rendered **1812**; `9b78496`); the 2× ceiling and delta warning derive from these. Recalibrate only by the same rule — median of ≥5 green runs, never local darwin, never a single run. (Both ledgers archived: 08-07/09 in HISTORY, post-cutover above.)

**Suite (tool-verified 2026-08-17, after 0036):** schema 340 / graph-kit 384 / **viewer 1139** / **app 1078** unit, plus **43 script tests**, the print e2e lane, and the editor/student/sw/perf/**a11y** e2e lanes (the four CI lanes run **73** rows — a11y is 11 with the Responses-tab axe row; the local-only integration lane is 8). Typecheck + lint clean (0 errors); all **12 perf budgets pass**. ⚠ **This line does NOT pin the bundle sizes any more** (drift audit 2026-08-17: three different entry-chunk numbers were in circulation across two STATE rows). **`node scripts/check-perf-budget.mjs` prints the real numbers and its caps live in `scripts/perf-budgets.mjs` with their reasoning** — read those, never a doc's copy. Same for test counts: `pnpm test`.

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
| Database migrations 0001–0036 | ✅ **All applied + verified live — `verify:auth --target live` = 147/0 across 12 scripts** (0036 applied 2026-08-17). 0031+0032 were REPRODUCIBILITY migrations; **0033 is the admission slice**; **0034 is checks-native grading**; **0035 is the disarmed check-prune + arming gate**; **0036 writes the watermark that gate reads**. Re-run `verify-0013-0014.sql` + `verify-0017.sql` after any auth/RLS/grant migration |
| Scheduled jobs (pg_cron) | ✅ Installed 2026-08-05; both jobs active; first fire observed + verified 2026-08-06. **Verify the run, not the registration** |
| Components-as-data slices S0–S9 | ✅ Complete — see the slice ledger; only author stations remain |
| Print (baseline CSS → authored feature → viewer print + gate) | ✅ Complete through S5.5; print gates run in CI; sign-off evidence durable at tag `s5.5-print-signoff` |
| Question types + pedagogical blocks + calculator + reference panel + typography | ✅ All live |
| Phase 2.6 manual grading | ⚰️ **RETIRED at S9 Drop 3.** Blocks + rubric authoring survive in editor/schema/viewer; the dashboard + `lib/submissions`/`lib/grades` are deleted; `grades` kept empty. Successor SHIPPED 2026-08-16 as the checks-native grading slice (0034); `grades` + `can_grade_submission` dropped there |
| Edge Functions (**2**) + deploy flags | ✅ get-activity **v19** (`false`) + check-activity **v15** (`true`); re-verified live 2026-08-15 at the gate sweep (the prior v11/v7 were the `entrypoint_path`-suffix misread AGAIN — see the correction under Baseline facts) |
| Cloudflare R2 hosting | ⚰️ Code-side DEAD; bucket + upload scripts await the teardown station |
| Auth (Google OAuth teacher allowlist + student SSO) / React app / editor stack | ✅ In place |
| CI (typecheck/lint/test/build + **2** bundle-drift guards + **12 perf budgets + 43 script tests** + print gates + perf/sw/student/**a11y** lane job) | ✅ **GREEN and CLEAN — run 31999243137 (the 0036 slice), 73 passed / 0 flaky.** **20** consecutive green runs, tool-counted (last failure 31787010974). Nothing is unpushed; the newest run covers HEAD |
| Student bundle (S8) | ✅ Entry chunk = the student shell; heavy libs lazy and content-pinned out of the shell. **Size is NOT pinned here — run `node scripts/check-perf-budget.mjs`** (caps + reasoning in `scripts/perf-budgets.mjs`). ⚠ **Headroom is thin: ~96% of the 185 KiB gz cap as of 2026-08-17.** The next shell-touching feature hits it — either schedule the 168→150 work (TODOS) or re-baseline deliberately, per DECISIONS' "a budget that can only ever loosen is a fossil" |

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

**Last updated:** 2026-08-17 (0036 applied live, 147/0, pushed, CI-green at 31999243137 — the rollup's first v2 run is 2026-08-18 03:30 UTC) — **The months-parked pruning/rollup entry went from parked to fully built in one day, across two arcs and two eng reviews.** Morning: re-derivation (P10) → plan → review → **the outside voice overturned the ratified frame** ("build the rollup now" fell to "prune disarmed now, rollup at arming") → 0035 shipped and applied. Evening: the author pulled the arming arc forward, and Part II went plan → review → build → 0036.

**The Part II review caught its OWN new ruling — the pattern worth keeping.** The eng pass ruled a zone-change self-heal (a rolled day's key is frozen, so changing zones double-counts boundary hours). The outside voice then found that the self-heal's rebuild recomputes from RAW rows, which the armed prune deletes: an unclamped rebuild would silently collapse months of `*_all` history. Fix: every recompute path is horizon-clamped to days the prune guarantees raw-complete, older days freeze under their recorded zone, and a deep rebuild is honored with a warning. **Two reviews, two same-day rulings overturned by the outside voice** — it keeps paying for itself.

**Four defects the matrix caught before 0036 could apply, and only one was in the test.** (1) A live bug: the roll passed a bare `array_agg` to a helper where NULL means "all versions", so a quiet night silently recomputed every version in the database — **and that accidental recompute was masking the very drift the reconciliation row exists to observe**. (2) A compile error: `v_versions` already names 0026's census count in the same function. (3+4) Two of my own assertions were wrong rather than the code (`correct_all` arithmetic; a global ledger sum compared against a fixture P2 had deliberately polluted) — the reconciliation row was rewritten to assert a DELTA against a baseline, which is also the honest post-arming reading.

**The P5 flips landed where the retired guards said they would.** verify-0035's `rolled_through_never_written` became a scoping assertion, and its §I **inverted**: the fixture is rolled before the prune, so `*_all` is UNCHANGED across it. That delta of zero, asserted exactly where the honest loss used to be, is the arc's promise made checkable.

**What a future session needs from this arc:** (1) the rollup's design is fully ruled and recorded (plan §5 + the TODOS arming-arc entry) — inherit, don't re-derive; among the rulings is a per-teacher timezone because **the platform now spans the US and New Zealand** (author's own answer — a fact no doc previously recorded). (2) verify-0035 §A's `rolled_through_never_written` row is designed to go red when the arming arc lands — flip it there (P5). (3) The review found two pre-existing drift errors in retention-policy.md (deletion order citing dropped `grades`; stale version header) — both fixed at draft-5. (4) The build's one new mechanical lesson: two ledger rows written in one transaction tie on `ran_at` (transaction-constant `now()` — 0034's graded_at lesson, third sighting), so the watermark read orders by `id desc`.

*(Prior entry — the teacher-grading close — is archived in [HISTORY.md](docs/HISTORY.md).)*

_Prior entries archived in [docs/HISTORY.md](docs/HISTORY.md)._
