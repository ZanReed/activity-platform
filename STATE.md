# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it under ~150 lines: move finished-work narratives to [docs/HISTORY.md](docs/HISTORY.md), durable reasoning to [docs/DECISIONS.md](docs/DECISIONS.md). Project rules live in [CLAUDE.md](CLAUDE.md).

## Pending author actions

Things only the author does (pushes, deploys, migrations), queued and waiting.

**⏭ NOTHING IS PENDING FROM THE TABLE ARC. One small item is owed from earlier, and one watch item stands below.**

**⏳ `.env.supabase` line 23 holds a PRE-RESET database password.** The author rotated it after it was printed to a session transcript, so `pnpm verify:auth --target live` fails until the new connection string is pasted in. Unrelated to the table arc; still owed.

**✅ THE TABLE ARC IS COMPLETE, SHIPPED AND PROVEN ON REAL CONTENT (2026-08-21 → 22).** All four slices, plus the incident that followed. Migrations **0039** applied and verified live; both Edge Functions redeployed and tool-verified BEFORE any table could reach a draft (`get-activity` v22 `verify_jwt:false`, `check-activity` v18 `verify_jwt:true`) — the capability-before-content gate, discharged rather than assumed. The Linux print baseline is committed after being **read**, not just generated. `unit-rate.md` is republished and serving a real table (version 3, tool-confirmed). Narrative archived in [HISTORY.md](docs/HISTORY.md); the rulings and every AS-BUILT correction live in [table-block.md](docs/design/table-block.md) — **read the AS BUILT notes before citing the plan above them, five rulings changed shape at build time and T4 changed outright.**

**⚠ THE INCIDENT WORTH CARRYING FORWARD (2026-08-22): a teacher saw "malformed" for a perfectly valid activity.** `index.html` is the one PRECACHED file, so a page load served from that precache after a deploy runs an entirely old, self-consistent build — and a build whose schema predates a new BLOCK TYPE rejects every document containing one. The data was never wrong; four independent checks confirmed it. **Fixed both ways:** the message now names the failing field, and both stored-document routes reload ONCE before reporting (`reloadOnceForStaleBuild`, the sibling of the existing stale-chunk recovery, with its own guard key). **The generalisable rule: any deploy that adds a block type puts every open teacher tab one page load behind.** Students are unaffected — the student path never zod-parses the served document.

**⏭ WORTH KNOWING FOR THE ~150: the pilot's tables carry NO blanks in cells** — their questions sit below the table, so "complete the table" (ruling D7, the reason cells hold blanks at all) is not yet exercised by real content. It works: `{{=9.00}}` in a cell is a graded blank, lettered (a)/(b) on paper. The first authored one will be the first real test of it.

**✅ P7 residue DISCHARGED**, and **✅ THE ROLLUP IS RUNNING** (observed 2026-08-21: `analytics_rolled_boundary()` non-NULL and advancing, `rollup_rebuild_needed` self-healed to 0 queued; live corpus is still 0 checks / 0 rollup rows, so it is rolling nothing, correctly).

⚠ **THE CONSEQUENCE IS THE PART TO READ, not the observation.** CLAUDE.md's warning has now fired: 0036 writes the watermark nightly, so **`prune_section_checks`'s schema gate is GONE** and the only things holding it disarmed are that it is **unscheduled** and **dry-run by default**. Arming is the eight-step checklist in [TODOS.md](TODOS.md) (blocking steps include counsel question **Q10** and N green nights of a non-drifting reconciliation pair). Read the checklist, not a summary of it.

*(Discharged and archived to [HISTORY.md](docs/HISTORY.md) on 2026-08-21: the answer-key deploy gate + its liveness proof, V7's print-baseline regeneration, the 0037 ordering gate, the bundle-drift fix, and the 0036 apply narrative.)*

**✅ THE ONE PROOF NO SESSION CAN MAKE — COLLECTED 2026-08-16** (author, real browser, second Google account; tool-confirmed, narrative archived in [HISTORY.md](docs/HISTORY.md)). A stranger's Google account joined class `7NE9M2` end to end: `users` went 3 teachers/0 students → 3 teachers/**1 student**, no `pending` rows remain, and the class's `expected_domain` is null with no `student_domain` row — so that account matched **no** fast path. That discharges the OAuth round trip, the trigger admitting a stranger, and `retryRole` after promotion. *(Repro: `/` → `7NE9M2` → Continue with Google → "You're in ✓".)*

**What the collected proof does NOT cover — read this before citing it:**
- **Gate 4 is untouched.** What ran was `redeem_join_code`. The **`student_domain` fast path has still never executed live** — no seed, no exercise. It stays deliberately last (see its own item below).
- **`claim_teacher` has never promoted anyone live.** All 3 teacher rows predate the admission slice (newest 2026-07-29), so the "I'm a teacher" self-serve door — the one D24 is actually about — is still unexercised by a stranger.
- **✅ Confirmed by the author on the same run:** the brief neutral gate card DID appear between "Joining class…" and "You're in ✓", and read as normal loading rather than an error. Expected and correct — `retryRole()` sets `roleStatus='loading'` in the same batch as the success state. The question this closes is not "does it render" but "does a real person misread it as a failure"; they did not. Leave the sequence alone.

**⚠ D24 counsel read — OWED, and the gate it was meant to hold is ALREADY OPEN (author-accepted risk).** R10/OV-8 ruled teacher self-serve must not reach strangers before counsel read the amended pack. It does: 0033 carried BOTH promotion RPCs and `PendingOnboarding` ships BOTH doors, so applying the migration opened Drop 2 alongside Drop 1. **The author reviewed and accepted the exposure** (unadvertised site, caps of 5 classes / 50 members bound any single bad actor). ⚠ **As of 2026-08-16 the exposure is no longer hypothetical**: a real second account's data now sits in the database under a pack every file marks DRAFT. It is the author's own throwaway account, so nothing is owed to a third party — but the "no real student data" cushion this item leaned on is gone. Concretely: any Google account can sign in → "I'm a teacher" → attest → create classes and read roster emails, under a pack every file marks DRAFT. **✅ The packet is written: [counsel-review-packet.md](docs/compliance/counsel-review-packet.md)** — the draft-2 → draft-3 delta, the live position up front, and ten numbered questions each naming the platform's current position (Q10, added 2026-08-16, asks whether n=1 daily aggregates surviving a purge are retained student data — it gates ARMING the check-prune, nothing sooner). The load-bearing three: Q2 (does an *unverified* educator attestation carry the authorization it asserts), Q4 (is the per-class 13+ assertion defensible when students are never asked their age), Q5 (on what basis is a pending account's data held *before* any teacher vouched). The read itself is the author's; nothing repo-side is owed.

**Gate 4 — seed `student_domain` + live-verify the trigger's student branch** (deliberately LAST; needs a real district domain). Prerequisite MET (0027 live). ⚠ **Never seed a consumer domain like `gmail.com`** — one row would admit every Google account on earth as a student.

**P8 boomerang — still uncollected, deliberately.** The duration datapoints for a multi-station apply day were voided by construction for the 0027 run (two password resets, a pooler lockout, no Docker, an unplanned migration mid-station, a materially faster author across the run). **The slot stays open for the NEXT representative multi-station day.**

**📌 NOT reproducible from migrations: all three teacher `display_name`s are NULL by a direct data edit.** 0021's backfill NULLed the two rows holding emails; the author then ruled (2026-08-04) the third — a 2026-07-29 account where Google DID supply `full_name` — should be NULL too. That row was outside 0021's scope by design, so it was cleared with a one-row UPDATE, **not a migration**. Consequence: a restored-from-migrations database would NOT reproduce this, and **a brand-new teacher signing in with a Google account that has a `full_name` will publish that name**. See the name-appearance design signal in Backlog.

**Baseline facts, tool-read live 2026-08-17 (never claim-read):** migrations applied **through 0036** · exactly **TWO** Edge Functions — `get-activity` **v19** (`verify_jwt:false`, the only one) + `check-activity` **v15** (`true`) · `pnpm verify:auth --target live` = **147 passed / 0 failed across 12 scripts** · both pg_cron jobs active · live rows (re-read 2026-08-17 after the 0036 apply): **3 teachers, 1 student, 0 pending, 0 checks, 0 grades, 1 class (`7NE9M2`, 1 active member), 8 activities** · **0 `analytics_job_runs` rows carry a `rolled_through` yet** — the first v2 run is 2026-08-18 03:30 UTC (see the ⏭ block). ⚠ **"No real student data exists yet" is NO LONGER TRUE** — one real second account is enrolled. It is the author's own throwaway, so the compliance answers stay cheap to change, but the sentence that made them free has expired. **Re-verify flags with `list_edge_functions` after every deploy — read the `version` field, NOT the `entrypoint_path` suffix beside it** (that misread produced a false "verified live" stamp twice; `get-activity`'s path ends `…_11` while its version is 19).

⚠ **One standing watch-note (the retry-log discipline):** the a11y **gap-2 keyboard row** flaked ONCE (run 31852826598) and has not recurred in the **seventeen** green runs since (latest 32048169054, the shell-slim slice). Instrumented in `e6b2872` so a second sighting names where focus actually is. **A second sighting is conclusive — fix then, not before. Read the flaky COUNT on every run, not the conclusion.**

**Archived to [HISTORY.md](docs/HISTORY.md):** all S9 author stations, the station HEADs (OV-DX-9), the closed gate-9 ledger, and this session's 0034 apply + purge-liveness + CI narrative.

## Standing constraints & watch items (current arc)

- **✅ The R2 graph-kit path is DEAD code-side (S9 Drop 4), and the D-13 teardown RAN 2026-08-15:** the viewer + editor build the kit from the workspace (app-bundled lazy Vite chunk), and the upload scripts + `.env.r2` are deleted — no kit upload is ever needed again, and no script survives to resurrect one. What remains is author-side only: unset the dashboard secrets, shrink `ALLOWED_ORIGINS`, delete the bucket. The 283-object archive is `r2-final-backup-20260815/` (untracked, repo root).
- **Known limitation (stated, not hidden): offline boot needs a token that has not expired.** Expired token + no network ⇒ the pre-auth gate — refreshing needs the network, and reading Supabase's session storage directly in shipped code is a dependency worth refusing. (Offline *reopen* itself is proven as of S9 Drop 5; it had never actually worked before then — `Vary: Origin` defeated `Cache.match`.)
- **Retention is COMPLETE and proven end to end (0022–0025).** The one thing to know when touching it: **`users.deleted_at` means "account disabled", NOT "retention clock running"** — `join_class` refuses accounts that have it set, so student dormancy is DERIVED live from `class_members`/`classes` (400-day window) and the purge job never writes that column. Don't "simplify" it into a stored flag; that reintroduces a between-terms lockout. "Who is dormant right now" has no column to read — the query is `scripts/verify-0025.sql` section D.
- **⚠ `purge_soft_deleted` was re-created by 0029** minus its `submissions.student_id` guards (the nightly cron job would have died otherwise). It is live and running; treat it as the current definition.
- **✅ Teacher grading — SHIPPED 2026-08-16** ([teacher-grading.md](docs/design/teacher-grading.md)). Kept in the backlog only for what it left behind: the **by-student queue view** and **rich-text teacher feedback** (plain text is v1) are named follow-ons. Its pruning/rollup inheritance is now DISCHARGED into 0035 + the arming-arc TODOS entry.
- **⚠ Local verify pair-of-reds is DATA-STATE-DEPENDENT, not a fixed pair.** The recorded "fresh DB = 114/2 (image-storage + 0020)" is one instance of a class: on 2026-08-16's non-fresh local DB the suite scored 125/2 with verify-**0033** `existing_teachers_exempt` (e2e-fixture teachers aren't caps-exempt) + verify-0020 (no published activity) red and image-storage green. Read WHICH rows failed and check they're seeded-data preconditions before treating any local red as a defect; live is the arbiter.
- **⚠ Unexplained one-off:** `sanitize.test.ts` → "differs across students and across versions" failed once (2026-08-01) and did not reproduce in 13 runs. Recorded so a second sighting is treated as a pattern.
- **Verification quirk:** the in-app Browser pane suppresses the position-measured hosts (command bar / quick-bar / drawer) under JS-driven selection — Playwright e2e (real chromium) is authoritative. `/playground` (unauthed) is the dev target; `/playground?empty=1` mounts a blank doc.
- **Three e2e traps worth re-reading before touching the lanes:** verify env-sensitive work with `.env.local` moved aside (`mv` → run → restore, OV-DX-13); `E2E_SKIP_BUILD` over a dist built from `.env.local` puts every signed-in spec on the sign-in screen — let the lanes build their own dist; and **the STUB lanes' Supabase origin must be an address NOTHING listens on** (`packages/app/e2e/helpers/e2eOrigins.ts` — the offline rows prove themselves with a real connection refusal). The third one was a live defect until 2026-08-18: the stub lanes and the integration lane shared `127.0.0.1:54321`, so `supabase start` made the sw lane's two offline rows red with a symptom that named nothing ("Please sign in again", from Kong's real `401 Expected 3 parts in JWT; got 1`). Stub lanes now sit on **54399**, outside the CLI's whole default range; `scripts/tests/e2e-origins.test.mjs` pins the separation + CI's build env, and the rows preflight the origin with a named fix.

## Current focus — the TABLE BLOCK IS DONE; next is authoring the catalogue

**Everything that was blocking bulk authoring has shipped.** The batch importer
(0038, `source_path` identity, file-wins re-runs), the drift guard (0039), the
frozen markdown contract, and the native table block across schema · viewer ·
server · editor · import. `pnpm import:batch <folder> --owner <email>` — always
`--dry-run` first — and `pnpm report:stale --owner <email>` afterwards to find
published activities whose page is older than their file.

**⏭ THE NEXT REAL INFORMATION COMES FROM WRITING ACTIVITIES, not from more code.**
~150 markdown files in `~/activity-catalogue-pilot/`, currently 3. The format is
proven against real content and its traps are documented in
[markdown-import-format.md](docs/markdown-import-format.md) — hand-numbering,
the `mc`/`match` syntax, and now tables. The one capability no real activity
exercises yet is a blank INSIDE a cell (see Pending author actions).

**Two things a session picking this up should not re-derive:**

- **The importer refuses a file whose draft was hand-edited in the app** since
  its last import (the 0039 fingerprint), naming it. `--force` overrides
  deliberately. So: edit the `.md`, not the app, for anything file-backed.
- **Publishing clears the draft** (`publish_activity` sets `draft_content =
  null`), which is why a published activity with no draft is up to date rather
  than stale — the thing that made the first `report:stale` implementation wrong.

**The backlog is large and none of it is table-related** — 20+ items in
[TODOS.md](TODOS.md). The ones that look most load-bearing from here: the
document walk duplicated five times, the orphaned `number` override field, the
check-rollup arming arc, and the parked shell-slimming. All of them will be
easier to prioritise after 20 activities have said what actually gets in the way.

## Earlier focus — the check-prune slice (0035) is BUILT; the rollup is now RUNNING

**Plan + the full ruling trail: [check-retention-and-rollup.md](docs/design/check-retention-and-rollup.md)** (eng review 2026-08-16, D2–D12). The prune shipped DISARMED; 0036 shipped the rollup that writes the watermark, and **that watermark is now advancing** (see Pending author actions). **The arming checklist in [TODOS.md](TODOS.md) is the only thing holding the prune back — read it, not a summary.**

**Three things to know before touching it:** (1) `section_checks_latest` is THE definition of "current attempt" — the prune deletes only its complement, and verify-0035 §C(H) pins the queue's equivalence; (2) G12 is clause 2 — a graded check is never a candidate, proven with a real deletion in §C; (3) verify-0035 §A's `rolled_through_never_written` row is DESIGNED to go red when the arming arc lands — flip it there, don't delete it.

*(The 0035/0036 build narrative and the teacher-grading (0034) detail archived to [HISTORY.md](docs/HISTORY.md) 2026-08-21; DECISIONS.md holds the rulings.)*

## The completed arc — what stays live from it

**The arc is CLOSED — S0 through S9 plus the Admission and Teacher-grading slices.** Framing paragraphs, the slice ledger and the C1–C15 cutover gates are archived in [HISTORY.md](docs/HISTORY.md) (final gate sweep 2026-08-15: 14 closed, 1 standing, gate 4 deferred to the first classroom); rulings in [DECISIONS.md](docs/DECISIONS.md). Nothing in that table is a live decision. What stays live from it:

**Timing calibration — RECALIBRATED 2026-08-14 (the gate-9 re-measure, done by the rule).** `TIMING_TARGET_MS` = medians of the 5 post-cutover green runs (pre-auth **992**, worksheet **1135**, math-rendered **1812**; `9b78496`); the 2× ceiling and delta warning derive from these. Recalibrate only by the same rule — median of ≥5 green runs, never local darwin, never a single run. (Both ledgers archived: 08-07/09 in HISTORY, post-cutover above.)

**Suite — NUMBERS DELIBERATELY NOT PINNED HERE (drift audit 2026-08-21).** This row used to list five per-package counts in the same sentence that told readers to run `pnpm test` instead; four of the five had rotted. **Run `pnpm test` for unit counts and `node --test scripts/tests/*.test.mjs` for the script guards.** What is durable: the print e2e lane, and the editor/student/sw/perf/**a11y** e2e lanes (the four CI lanes run **73** rows — a11y is 11 with the Responses-tab axe row; the local-only integration lane is **9**). Typecheck + lint clean (0 errors); all **16 perf budgets pass**. ✅ **The four CI lanes are 73/73 LOCALLY with the local Supabase stack running** — the configuration that used to be red (see the e2e-origins trap under Standing constraints above). ⚠ **This line does NOT pin the bundle sizes any more** (drift audit 2026-08-17: three different entry-chunk numbers were in circulation across two STATE rows). **`node scripts/check-perf-budget.mjs` prints the real numbers and its caps live in `scripts/perf-budgets.mjs` with their reasoning** — read those, never a doc's copy. Same for test counts: `pnpm test`.

**Editor open remainders (deferred, pre-rewrite arcs; roughly priority-ordered):**
1. **Focus mode** — needs a caret-tracking ProseMirror plugin; off-by-default, wants its own design+eng pass.
2. **Input-parity / a11y touch pass** — touch needs a real device; `/` covers the keyboard floor.
3. **Slice 6.5 smart-defaults** — net-new unvalidated heuristics; own spike, gates nothing.
4. **⌘⇧↑/↓ keyboard-reorder settle** — snap-motion follow-up (debounce design).
5. **Chip open:** the slash menu dies under synthetic keyboard input once a query char follows `/` (humans unaffected). **Papercut:** the gutter "+" can overlap the drag grip's lower half on a short block.

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
| Database migrations 0001–0038 | ✅ **0038 applied + verified live 2026-08-20** (batch importer's `source_path`; verify-0038 = 8/0, column + both index predicate clauses tool-read). 0001–0037: **applied + verified live — `verify:auth --target live` = 147/0 across 12 scripts** (0036 applied 2026-08-17). 0031+0032 were REPRODUCIBILITY migrations; **0033 is the admission slice**; **0034 is checks-native grading**; **0035 is the disarmed check-prune + arming gate**; **0036 writes the watermark that gate reads**. Re-run `verify-0013-0014.sql` + `verify-0017.sql` after any auth/RLS/grant migration |
| Scheduled jobs (pg_cron) | ✅ Installed 2026-08-05; both jobs active; first fire observed + verified 2026-08-06. **Verify the run, not the registration** |
| Components-as-data slices S0–S9 | ✅ Complete — see the slice ledger; only author stations remain |
| Print (baseline CSS → authored feature → viewer print + gate) | ✅ Complete through S5.5; print gates run in CI; sign-off evidence durable at tag `s5.5-print-signoff` |
| Question types + pedagogical blocks + calculator + reference panel + typography | ✅ All live |
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

**Last updated:** 2026-08-21 (the pilot RAN — importer proven live end to end; print-gap triage; two dead print declarations found and fixed; rich fence bodies, `work:`, `options: ruled`, and the fence-marks fix shipped; the table block designed and filed).

**The lesson of the day, and it is the same one twice.** Every defect this session found was a CLAIM nobody had tested: the brief's "node-safe (verified)", the print CSS's "a single problem can override the work space", the row `gridLines` the editor still honoured, the doc's promise of `**bold**` in fences, and the format doc's "*Activity type* is not importable". **Five separate places where a declaration outlived — or never had — an implementation, and the suite was green about all of them.** The two that reached PAPER were found by printing a page, not by reading code. Guards bound to OUTPUT are the only ones that survive a package deletion; `scripts/tests/batch-import.test.mjs` §A and the `structure/*` print rows are the pattern to copy. *(Prior entry:)* 2026-08-20 (the batch importer built end to end — migration 0038, `scripts/batch-import.mjs`, the node seam, the meta summary line, 15 script-test rows + 8 app rows; `pnpm verify` = all 8 gates green, script tests 54 → 73). **0038 applied + verified live the same day (8/0) — no author station outstanding; the importer is ready for its first real run.**

**The lesson worth keeping from this slice: when a handoff brief says "inherited — do NOT re-derive", the first job is to make each of its claims falsifiable, not to trust them.** The brief's load-bearing claim was verified-sounding and wrong, and the thing that proved it was a two-minute esbuild run — cheaper than any of the work that would have been built on top of it. Same pattern the shell-slim plan hit on 2026-08-18 with two of its own claims. A claim inherited across a session boundary has no test attached to it; that is exactly what makes it worth testing first.

*(Prior entry:)* 2026-08-18 (shell slimming slice 1 built, pushed, CI-green at 32048169054; then its one leftover red — the sw offline rows — chased to root cause, fixed, pushed and CI-green at 32081815982. The rollup's first v2 run at 03:30 UTC is still the thing to check.)

**Two lessons from the day, both about tests that were passing for the wrong reason.** (1) **The sw offline rows were green in CI because CI has no local Supabase stack** — the stub lanes and the integration lane shared one address they needed to mean opposite things. A lane that passes because of what is ABSENT from the machine is not passing, it is unobserved. Mechanism + the guard now holding it: `packages/app/e2e/helpers/e2eOrigins.ts`. (2) **Two of the shell-slim plan's own claims were wrong, and the tests written to honor them are what found it** — "vitest parity, dissolved by inspection" (vitest externalizes `node_modules`, so the alias never applied) and severe-finding-1's premise (an apikey-less upload does not 401); both written up in that plan's AS BUILT section. **The pattern to keep: when a review's own claims are the input, the build's first job is to make each one falsifiable.**

_Prior entries archived in [docs/HISTORY.md](docs/HISTORY.md)._
