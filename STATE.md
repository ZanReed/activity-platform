# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it under ~150 lines: move finished-work narratives to [docs/HISTORY.md](docs/HISTORY.md), durable reasoning to [docs/DECISIONS.md](docs/DECISIONS.md). Project rules live in [CLAUDE.md](CLAUDE.md).

## Pending author actions

Things only the author does (pushes, deploys, migrations), queued and waiting.

**FOUR ITEMS ARE OWED.** *(The flow-modes slice's F11 is DONE — see the ✅ below.)*

✅ **F11 IS DONE — the activity flow modes are LIVE (2026-08-24).** The author
applied 0040 and deployed `check-activity`; the verification below was run
against the live project afterwards and is recorded here because the next
session must not re-do it:

- **0040 applied.** `schema_migrations` = **40**, max `0040`. `record_check` is
  `(uuid,uuid,uuid,text,jsonb,jsonb,text,integer,integer,boolean)` — **exactly
  ONE overload**, `p_locked` present.
- **`check-activity` deployed.** `version` 19 → **20** with a CHANGED
  `ezbr_sha256` (`18c59d9…` → `c1f4d77…`), `verify_jwt` still **true**.
  ⚠ The version moving is not the proof (CLAUDE.md); the proof is that the
  **deployed entrypoint is byte-identical to the committed one**, including the
  `p_locked: args.locked` line that did not exist before that session
  (`supabase functions download check-activity --use-api`, diffed against HEAD).
- **verify-0040 live: 7 PASS, 0 FAIL** — including B2, the one that matters
  (a lost-response retry of the LOCKING check replays instead of 409ing).
- **verify-0020's Structure section live: D1, D2, D3 all pass**, plus
  `service_role` is the ONLY non-postgres grantee. That is the half a signature
  change could have broken.
- **P7 residue: NONE.** `section_checks` printed **0 before and 0 after**.

⚠ **TWO THINGS ARE STILL WORTH DOING, neither blocking:**
1. **Run `scripts/verify-0020.sql` VERBATIM** (all 23 assertions, SQL editor).
   Only its structural half was re-checked live; the behavioural half (the
   authorization chain, the rate ceiling) was not re-run after 0040 rewrote the
   function body. verify-0040's B1 covers the closest case (re-checking still
   increments) but is not the same thing.
2. ⚠ **The live verify-0040 run was a faithful TRANSCRIPTION of the file's
   assertions, not the file itself** — the MCP path returns no `RAISE NOTICE`
   output, so the counts were surfaced through a temp table instead. Same
   assertions, same order, same values; but the canonical run is the file, and
   `pnpm verify:auth --target live` is what runs it. Blocked only on the
   password below.

⚠ **A `get-activity` redeploy is arguably owed and deliberately NOT flagged as
urgent.** R4's schema deletion regenerated `viewer-server.bundle.js`, so
deployed ≠ repo for that function — but the change is inert on the read path
(zod strips the two dead keys either way, no student-visible difference) and
`SANITIZER_REV` did not move, so no cache is orphaned. Fold it into the next
`get-activity` deploy rather than doing one for this.

**⏳ `.env.supabase` line 23 holds a PRE-RESET database password.** The author rotated it after it was printed to a session transcript, so `pnpm verify:auth --target live` fails until the new connection string is pasted in. Unrelated to the table arc; still owed.

⚠ **THE CONSEQUENCE IS THE PART TO READ, not the observation.** CLAUDE.md's warning has now fired: 0036 writes the watermark nightly, so **`prune_section_checks`'s schema gate is GONE** and the only things holding it disarmed are that it is **unscheduled** and **dry-run by default**. Arming is the eight-step checklist in [TODOS.md](TODOS.md) (blocking steps include counsel question **Q10** and N green nights of a non-drifting reconciliation pair). Read the checklist, not a summary of it.

**⚠ D24 counsel read — OWED.** The packet is written: [counsel-review-packet.md](docs/compliance/counsel-review-packet.md) — ten numbered questions, each naming the platform's current position. The load-bearing three: **Q2** (does an *unverified* educator attestation carry the authorization it asserts), **Q4** (is the per-class 13+ assertion defensible when students are never asked their age), **Q5** (on what basis is a pending account's data held before any teacher vouched). **Q10** gates ARMING the check-prune and nothing sooner. ⚠ **The gate this was meant to hold is ALREADY OPEN and the author accepted that risk** — any Google account can self-serve to teacher, and a real second account's data now sits in the DB under a pack every file marks DRAFT (the author's own throwaway, so nothing is owed to a third party). The read is the author's; nothing repo-side is owed. *(How it got open: HISTORY.md → D24.)*

**Gate 4 — seed `student_domain` + live-verify the trigger's student branch** (deliberately LAST; needs a real district domain). Prerequisite MET (0027 live). ⚠ Never seed a consumer domain — the rule now lives in CLAUDE.md → Things NOT to do.

**P8 boomerang — still uncollected, deliberately.** The duration datapoints for a multi-station apply day were voided by construction for the 0027 run (two password resets, a pooler lockout, no Docker, an unplanned migration mid-station, a materially faster author across the run). **The slot stays open for the NEXT representative multi-station day.**

**📌 NOT reproducible from migrations: three teacher `display_name`s are NULL by direct data edits** (confirmed 2026-08-22). **Live consequence:** the two accounts created 2026-08-19 through the self-serve door DO carry Google's `full_name`, so anything they publish serves that name to anonymous visitors via `get_activity_public_meta`. Both are the author's test accounts, so nothing is exposed — but this is the first live instance of default-on name attribution, and the fix is a one-row `update … set display_name = null`, **not a migration**. The opt-in control is in Backlog. *(Full history: HISTORY.md → display_name.)*

**Baseline facts — RE-READ LIVE 2026-08-24, never trusted.** Migrations applied **through 0040** (40 rows, `max(version)` = `0040`, re-read live 2026-08-24 after the apply) · exactly **TWO** Edge Functions, `get-activity` (`verify_jwt:false`, the only one) + `check-activity` (`true`) — ⚠ **FUNCTION VERSIONS ARE DELIBERATELY NOT PINNED HERE any more.** This row said `v22`/`v18` and went stale for the THIRD time (live was v24 when the 2026-08-23 close-out read it), while instructing readers to never claim-read. Worse, this session proved a version number is not evidence of anything: a real, successful `deploy:get-activity` left `version`, `updated_at` and `ezbr_sha256` all **unchanged**. **Read flags with `list_edge_functions`; prove CODE by grepping the deployed source (`get_edge_function`) for a marker unique to the change** — the rule in CLAUDE.md. · live rows: **6 users** (**5 teachers + 1 student**), **14 activity rows — of which 8 are LIVE and 6 are soft-deleted** (⚠ this row said a bare "14 activities" until 2026-08-24 and read as fourteen usable activities; `deleted_at` splits it 8/6, and 9 rows are `status = 'published'`), 1 class (`7NE9M2`), **0 checks, 0 submissions** (⚠ this row counted `0 grades` until 2026-08-24 — the `grades` TABLE was DROPPED by 0034, which the Status-by-area row below has said all along; a count for a dropped table is not a fact), and the dormant assignment tables still **0/0** · both pg_cron jobs active; `analytics_rolled_boundary()` non-NULL and advancing.

⚠ **A dated snapshot rots exactly as fast as an undated one** — this row went three migrations and two function versions stale before the 2026-08-22 audit, while telling readers never to claim-read. The commands are in CLAUDE.md's close-out question 2; run them, don't trust the line above.

⚠ **"No real student data exists yet" is NO LONGER TRUE** — one real second account is enrolled. It is the author's own throwaway, so the compliance answers stay cheap to change, but the sentence that made them free has expired.

⚠ **The a11y GAP-2 row has flaked TWICE (runs 31852826598 and 2026-08-22 local) and is a fix-it item, not a watch item — but it needs ONE CAPTURED FAILURE to be fixable.** The instrumented output (`e6b2872`) has never been read: both times it went green again before anyone looked. **Capture it before re-running on the next sighting.** Green since: seventeen runs to 32048169054, plus **3/3 local this session** (baseline, with the new locked-freeze row, and under a deliberate mutation). **Read the flaky COUNT on every run, not this conclusion.**

**Archived to [HISTORY.md](docs/HISTORY.md):** all S9 author stations, the station HEADs (OV-DX-9), the closed gate-9 ledger, and this session's 0034 apply + purge-liveness + CI narrative.

## Standing constraints & watch items (current arc)

- **✅ R2 is dead and the D-13 teardown RAN** — the full account (what survives, what the author still owes on the dashboard, where the 283-object archive is) is a STANDING rule and lives in **CLAUDE.md**, not here: this section gets replaced every session and that is not a fact that should expire with it.
- **Known limitation (stated, not hidden): offline boot needs a token that has not expired.** Expired token + no network ⇒ the pre-auth gate — refreshing needs the network, and reading Supabase's session storage directly in shipped code is a dependency worth refusing. (Offline *reopen* itself is proven as of S9 Drop 5; it had never actually worked before then — `Vary: Origin` defeated `Cache.match`.)
- **Retention is COMPLETE and proven end to end (0022–0025).** The one thing to know when touching it: **`users.deleted_at` means "account disabled", NOT "retention clock running"** — `join_class` refuses accounts that have it set, so student dormancy is DERIVED live from `class_members`/`classes` (400-day window) and the purge job never writes that column. Don't "simplify" it into a stored flag; that reintroduces a between-terms lockout. "Who is dormant right now" has no column to read — the query is `scripts/verify-0025.sql` section D.
- **⚠ `purge_soft_deleted` was re-created by 0029** minus its `submissions.student_id` guards (the nightly cron job would have died otherwise). It is live and running; treat it as the current definition.
- **✅ Teacher grading — SHIPPED 2026-08-16** ([teacher-grading.md](docs/design/teacher-grading.md)). Kept in the backlog only for what it left behind: the **by-student queue view** and **rich-text teacher feedback** (plain text is v1) are named follow-ons. Its pruning/rollup inheritance is now DISCHARGED into 0035 + the arming-arc TODOS entry.
- **⚠ "Local verify reds are just seeded-data preconditions" WAS WRONG ABOUT AT LEAST ONE ROW, for eight days.** This bullet used to file verify-**0033** `existing_teachers_exempt` under that heading ("e2e-fixture teachers aren't caps-exempt"). It was never a data-state issue: the assertion said NO teacher may be capped, while capping self-serve teachers is 0033 §G's entire purpose. Measured on BOTH databases 2026-08-24 — it failed on both, for the same correct reason — and **fixed**, with its complement (`self_serve_teachers_capped`) added. The heading still holds as advice (read WHICH rows failed; live is the arbiter) — but "it's just the fixtures" is a hypothesis to TEST, not a category to file things in. Live now: **167 passed, 1 failed**, and the one is verify-0036, filed in TODOS as an arming-arc blocker.
- **⚠ Unexplained one-off:** `sanitize.test.ts` → "differs across students and across versions" failed once (2026-08-01) and did not reproduce in 13 runs. Recorded so a second sighting is treated as a pattern.
- **Verification quirk:** the in-app Browser pane suppresses the position-measured hosts (command bar / quick-bar / drawer) under JS-driven selection — Playwright e2e (real chromium) is authoritative. `/playground` (unauthed) is the dev target; `/playground?empty=1` mounts a blank doc.
- **Three e2e traps worth re-reading before touching the lanes:** verify env-sensitive work with `.env.local` moved aside (`mv` → run → restore, OV-DX-13); `E2E_SKIP_BUILD` over a dist built from `.env.local` puts every signed-in spec on the sign-in screen — let the lanes build their own dist; and **the STUB lanes' Supabase origin must be an address NOTHING listens on** (`packages/app/e2e/helpers/e2eOrigins.ts` — the offline rows prove themselves with a real connection refusal). The third one was a live defect until 2026-08-18: the stub lanes and the integration lane shared `127.0.0.1:54321`, so `supabase start` made the sw lane's two offline rows red with a symptom that named nothing ("Please sign in again", from Kong's real `401 Expected 3 parts in JWT; got 1`). Stub lanes now sit on **54399**, outside the CLI's whole default range; `scripts/tests/e2e-origins.test.mjs` pins the separation + CI's build env, and the rows preflight the origin with a named fix.

## Current focus — the flow modes are BUILT; one author action ships them

**✅ THE ACTIVITY FLOW MODES SLICE IS BUILT 2026-08-24** —
[activity-flow-modes.md](docs/design/activity-flow-modes.md). **Read its AS
BUILT section, not just the plan: five things changed shape at build time.**
Eight commits, `596e36b`..`43d7c05`. **F11 is DONE — the slice is LIVE** (0040
applied, `check-activity` at v20, verify-0040 7/0; see Pending for the two
non-blocking follow-ups).

**What a student gets that they did not have yesterday.** A `{checkpoint}`
heading now DOES something: its Check covers every section since the previous
checkpoint, and **the end of the activity is always a checkpoint**, so no
section is silently un-checkable. The group is a visible region, because
otherwise a buttonless section reads as "my work here isn't counted".
`locked` freezes what it checked — at PRESS, per section — and the server
refuses the second check from a document-derived flag the browser cannot omit.
`revisionMode` and `gradingMode` are deleted; `activityType` prints as a label.

**Three findings worth carrying forward** (the full ledger is in AS BUILT):
- **TWO NEW GUARDS WERE VACUOUS ON THEIR FIRST DRAFT** — caught by mutation,
  not by a passing suite. See the closing note at the bottom of this file;
  it is the lesson of the session.
- **A plan's task text can contradict its own rulings, and the rulings win.**
  F3 said "a per-group `<fieldset disabled>`", but OV#15 calls a 429 mid-group
  "a PARTIAL LOCK" and guard 9 wants Retry to fire only the unlanded member.
  Freeze is per SECTION. **Read AS BUILT before trusting a task line.**
- **D4 assumed a screen surface that did not exist** ("the course/unit line
  that already renders there" — the top bar rendered the title only).

## The S9 orphan arc — closed; narrative in HISTORY

Six content orphans shipped 2026-08-22/23; the flow modes closed a seventh
class 2026-08-24. What stays LIVE:

- **The calculator's FEATURE SCOPE is ruled** — DECISIONS.md → "Calculator
  feature scope". Intersections/intercepts are OUT on pedagogy grounds; do not
  re-pitch them as cheap.
- **All three z-tokens have real `var()` consumers**: tools 110 < reference 115
  < calculator 120 < popovers 1000.
- **TWO orphan classes remain**, both knobs rather than content loss (graph
  feedback, `hasConfidenceRating`/`allowTargetReuse`) — TODOS carries them;
  each needs a wire-or-delete ruling. ⚠ **The flow-modes fix wrote the
  reachability guard those entries asked for, but scoped to the flow fields by
  name** (`scripts/tests/flow-field-readers.test.mjs`) — so these two are still
  guarded by nothing but that list.

**⏭ THE NEXT REAL INFORMATION COMES FROM WRITING ACTIVITIES, not more code.**
~150 markdown files planned in `~/activity-catalogue-pilot/`, currently 3.
`pnpm import:batch <folder> --owner <email>` (always `--dry-run` first), then
`pnpm report:stale --owner <email>`. Two capabilities no real activity
exercises yet: a blank INSIDE a table cell (ruling D7's whole reason), and —
as of 2026-08-23 — a `graph_figure`, whose first author was a test file that
immediately found a four-month-old content-loss bug. **That is the pattern to
expect: the corpus finds what the fixtures cannot.**

## The completed arc — what stays live from it

**S0–S9 plus Admission and Teacher-grading are CLOSED.** Framing, the slice
ledger and the C1–C15 cutover gates are in [HISTORY.md](docs/HISTORY.md);
rulings in [DECISIONS.md](docs/DECISIONS.md). Nothing in that table is a live
decision. What stays live:

**Timing calibration** — `TIMING_TARGET_MS` = medians of 5 post-cutover green runs (`9b78496`). Recalibrate only by that rule: median of ≥5 green runs, never local darwin, never one run.
**Suite — NUMBERS DELIBERATELY NOT PINNED HERE (drift audit 2026-08-21).** This row used to list five per-package counts in the same sentence that told readers to run `pnpm test` instead; four of the five had rotted. **Run `pnpm test` for unit counts and `node --test scripts/tests/*.test.mjs` for the script guards.** What is durable: the print e2e lane, and the editor/student/sw/perf/**a11y** e2e lanes (the four CI lanes run **73** rows — a11y is 11 with the Responses-tab axe row; the local-only integration lane is **9**). Typecheck + lint clean (0 errors); all **16 perf budgets pass**. ✅ **The four CI lanes are 73/73 LOCALLY with the local Supabase stack running** — the configuration that used to be red (see the e2e-origins trap under Standing constraints above). ⚠ **This line does NOT pin the bundle sizes any more** (drift audit 2026-08-17: three different entry-chunk numbers were in circulation across two STATE rows). **`node scripts/check-perf-budget.mjs` prints the real numbers and its caps live in `scripts/perf-budgets.mjs` with their reasoning** — read those, never a doc's copy. Same for test counts: `pnpm test`.
**Editor open remainders** (focus mode, the touch/a11y pass, smart-defaults, the keyboard-reorder settle, and two papercuts) **moved to [TODOS.md](TODOS.md) on 2026-08-22** — they lived only in this section, which is replaced every session.


## The shell budget — the ~150 KiB target is MET

**`SHELL_JS_GZ_KIB` 172 → 158 and `SHELL_CSS_GZ_KIB` 14 → 15 (2026-08-23).**
P1A's target is met for the first time. **Read the real numbers from
`node scripts/check-perf-budget.mjs`, never from here** — this line has carried
a stale JS figure twice. Derivations live in `scripts/perf-budgets.mjs` and
DECISIONS.md → "The shell CSS cap". ⏭ The remaining ladder (router,
preact/compat, auth-js) is listed in TODOS, is not urgent, and is not a plan.

## Backlog / candidate arcs

- **Re-architecture follow-ons (accepted 2026-07-28):** (1) Clever/ClassLink district SSO — demand-triggered; **IdP map recorded 2026-08-09** — LMSes are not IdPs; expansion order is Azure/Entra → Clever/ClassLink → LTI 1.3. (2) Realtime push arc — trigger = first named live feature. (3) Sampled behavioral telemetry — only after the census can't answer a concrete question AND the compliance pack is amended. (4) Print variants. (5) Solution-unlock pedagogy pass. (6) /design-consultation brand pass — includes replacing the system-ui chrome font stack (design-review ding, 2026-08-18).
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
| Database migrations 0001–0040 | ✅ **0040 applied + verified live 2026-08-24** (the check lock; verify-0040 = 7/0, and verify-0020's D1–D3 re-run — see Pending for what was NOT re-run). ✅ **0039 applied 2026-08-21** (the importer's fingerprint drift guard; **no `verify-0039.sql` exists** — its proof is the live refusal path the importer exercised on 2026-08-22; tool-read at the 08-22 audit: `schema_migrations` = 39, max `0039`). **0038 applied + verified live 2026-08-20** (batch importer's `source_path`; verify-0038 = 8/0, column + both index predicate clauses tool-read). 0001–0037: **applied + verified live via `verify:auth --target live`** (the registered set is `AUTH_VERIFY_SET` in `scripts/verify-runner.mjs` — this row pinned "12 scripts" against a 14-entry roster until the 2026-08-22 audit, and the roster is **15** since verify-0040 joined — which is exactly why no count is asserted here any more: read the array; 0036 applied 2026-08-17). 0031+0032 were REPRODUCIBILITY migrations; **0033 is the admission slice**; **0034 is checks-native grading**; **0035 is the disarmed check-prune + arming gate**; **0036 writes the watermark that gate reads**. Re-run `verify-0013-0014.sql` + `verify-0017.sql` after any auth/RLS/grant migration |
| Scheduled jobs (pg_cron) | ✅ Installed 2026-08-05; both jobs active; first fire observed + verified 2026-08-06. **Verify the run, not the registration** |
| Components-as-data slices S0–S9 | ✅ Complete — see the slice ledger; only author stations remain |
| Print (baseline CSS → authored feature → viewer print + gate) | ✅ Complete through S5.5; print gates run in CI; sign-off evidence durable at tag `s5.5-print-signoff` |
| Question types + pedagogical blocks + calculator + reference panel + typography | ✅ **All live in the viewer as of 2026-08-23** — the two FLOATING TOOLS were wired this session and were the last student-facing gaps. Calculator: summon cluster in `StudentViewer`, dark chrome + <480px sheet in the kit. Reference panel: bottom-LEFT summon in `ViewerContainer`, gated `mode === 'screen'` so it stays off the print preview, body a permanently disabled fieldset. The print box is unchanged and independent |
| Phase 2.6 manual grading | ⚰️ **RETIRED at S9 Drop 3.** Blocks + rubric authoring survive in editor/schema/viewer; the dashboard + `lib/submissions`/`lib/grades` are deleted; `grades` kept empty. Successor SHIPPED 2026-08-16 as the checks-native grading slice (0034); `grades` + `can_grade_submission` dropped there |
| Edge Functions (**2**) + deploy flags | ✅ **exactly two**, `get-activity` (`verify_jwt:false`, the only one) + `check-activity` (`true`). **Versions are NOT pinned here** — they moved three times in six days and this row carried a different pair from the Pending section (drift audit 2026-08-21). Read them with `list_edge_functions`, from the **`version`** field and never the `entrypoint_path` suffix beside it; `supabase/config.toml` is the authoritative flag record |
| Cloudflare R2 hosting | ⚰️ **DEAD.** Code-side at S9 Drop 4; the D-13 teardown ran 2026-08-15 (upload scripts + `.env.r2` deleted). Only the dashboard steps remain — see the standing constraints |
| Auth (Google OAuth teacher allowlist + student SSO) / React app / editor stack | ✅ In place |
| CI (typecheck/lint/test/build + **2** bundle-drift guards + perf budgets + script guards + print gates + perf/sw/student/**a11y** lane job) | ✅ **GREEN.** **Run count and last-failure numbers are NOT pinned here** — they rot every push (drift audit 2026-08-21). `gh run list` is the source; check it at session start, because `main` once sat red for days unnoticed |
| Student bundle (S8) | ✅ Entry chunk = the student shell; heavy libs lazy and content-pinned out of the shell. **Size is NOT pinned here — run `node scripts/check-perf-budget.mjs`** (caps + reasoning in `scripts/perf-budgets.mjs`). **Slimming slice 1 ran 2026-08-18: −21.2 KiB gz (the Supabase sub-client stubs), and the cap TIGHTENED 185 → 172 in the same commit.** Headroom is honest again; the remaining ladder is in TODOS |

## Key constants

- **GitHub repo:** `ZanReed/activity-platform` · **Supabase project ref:** `dtqutpdplefmufrrakxs`
- **Auth:** Google OAuth via Supabase. Site URL `http://localhost:5173` for dev. Teacher allowlist + student SSO (S1).
- **Client env:** `VITE_PUBLISHED_URL_BASE` is DEAD (deleted at S9 Drop 1) — the share link is the viewer URL `${origin}/a/${activityId}`, env-free. `.env.local` still carries the Supabase pair (+ optional `VITE_DISTRICT_HINT`).

## Open questions / deferred decisions

- **UX validation with 2–3 other teachers** on the editor patterns before
  classroom adoption. The one that gates classroom use; the rest are dormant.
- **`skills` editing UI** — the field round-trips everywhere, only the editing
  control is missing. Don't add piecemeal without the per-skill-analytics scope.
- **Decided at their phase start, not now:** media storage/privacy posture (2.8),
  annotation coordinate space (2.9), multi-tenancy when a teacher leaves a
  district (Phase 4 — the helpers are already designed for it).
- **Five dormant editor papercuts** moved to [TODOS.md](TODOS.md) 2026-08-23 — none blocks anything.

---

**Last updated:** 2026-08-24 (**THE ACTIVITY FLOW MODES ARE BUILT** — check
groups, the server-enforced lock, two deleted knobs, one printed label; six
commits, every guard mutation-proven, one author action left. The 2026-08-23
entry — all six S9 orphans, the live answer-key leak, the calculator scope
ruling — is archived in HISTORY.)

**The lesson of the session is the THIRD generation of the one this repo keeps
paying for, and it is the most uncomfortable yet.** Generation one: a
DECLARATION outlives its implementation and the suite stays green because the
guard compares two declarations (eight instances). Generation two, 2026-08-23:
A GUARD OUTLIVES ITS OWN VALIDITY THE SAME WAY — three found vacuous, every one
by MUTATION and none by a passing suite. **Generation three, this session: THE
SLICE WRITTEN TO END THAT DEFECT CLASS COMMITTED IT TWICE, IN ITS OWN NEW
GUARDS.** The OV#14 solution gate scripted a service that returned no
solutions, so "nothing is revealed" was true whether the gate existed or not.
Guard 7 — the reachability net for the orphaned flow fields — matched a bare
token, so unwiring `doc.meta.submissionMode` left it green, because a
PARAMETER of that name still appeared. Both were caught by mutation-testing the
guard on the day it was written, which is the only reason they are a footnote
rather than the next audit's finding.

**The corollary to carry:** "bind the guard to rendered output" is not a
property you can check by reading your own test. The test that scripted an
empty `solutions: {}` LOOKED bound to output — it queried the DOM. What made it
vacuous was the FIXTURE, one level away. Mutation is the only thing that sees
that, and it costs about ninety seconds per guard.

_Prior entries archived in [docs/HISTORY.md](docs/HISTORY.md)._
