# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it under ~150 lines: move finished-work narratives to [docs/HISTORY.md](docs/HISTORY.md), durable reasoning to [docs/DECISIONS.md](docs/DECISIONS.md). Project rules live in [CLAUDE.md](CLAUDE.md).

## Pending author actions

Things only the author does (pushes, deploys, migrations), queued and waiting.

**⏭ NOW: nothing is blocked. The teacher-grading slice is applied, pushed and CI-green; the admission slice is live.** Two doc commits are unpushed (`b346c7e`, `3751de1` — this session's live-verification and CI records). Everything below is a STANDING item with its own trigger, not a queue.

**⚠ THE ONE PROOF NO SESSION CAN MAKE: sign in.** The live admission flow has never been driven by a human through a browser, and an AI session cannot do it (signing in means entering credentials). Proven around it: verify-0033 10/10, the integration lane through the real trigger, RTL, and the **pre-auth half against the LIVE meta endpoint in a real browser** (bad code → the DR-6 warning; `7NE9M2` → "Algebra 1" in the title slot). Still unproven, and each needs a Google account: **the OAuth round trip** (does the dashboard redirect allowlist cover `/join/*` and `/?intent=teacher`), **the trigger admitting a stranger as `pending`**, and **`retryRole` after promotion**. Throwaway account, ~2 minutes: `/` → type `7NE9M2` → Continue with Google → expect "You're in ✓" then Algebra 1 on Home. ⚠ **Expect a brief neutral gate card between "Joining class…" and "You're in ✓"** — `retryRole()` sets `roleStatus='loading'` in the same batch as the success state. Correct, not the board's sequence; recorded so it is not misread as a bug.

**⚠ D24 counsel read — OWED, and the gate it was meant to hold is ALREADY OPEN (author-accepted risk).** R10/OV-8 ruled teacher self-serve must not reach strangers before counsel read the amended pack. It does: 0033 carried BOTH promotion RPCs and `PendingOnboarding` ships BOTH doors, so applying the migration opened Drop 2 alongside Drop 1. **The author reviewed and accepted the exposure** (unadvertised site, caps of 5 classes / 50 members bound any single bad actor). Concretely: any Google account can sign in → "I'm a teacher" → attest → create classes and read roster emails, under a pack every file marks DRAFT. **✅ The packet is written: [counsel-review-packet.md](docs/compliance/counsel-review-packet.md)** — the draft-2 → draft-3 delta, the live position up front, and nine numbered questions each naming the platform's current position. The load-bearing three: Q2 (does an *unverified* educator attestation carry the authorization it asserts), Q4 (is the per-class 13+ assertion defensible when students are never asked their age), Q5 (on what basis is a pending account's data held *before* any teacher vouched). The read itself is the author's; nothing repo-side is owed.

**Gate 4 — seed `student_domain` + live-verify the trigger's student branch** (deliberately LAST; needs a real district domain). Prerequisite MET (0027 live). ⚠ **Never seed a consumer domain like `gmail.com`** — one row would admit every Google account on earth as a student.

**P8 boomerang — still uncollected, deliberately.** The duration datapoints for a multi-station apply day were voided by construction for the 0027 run (two password resets, a pooler lockout, no Docker, an unplanned migration mid-station, a materially faster author across the run). **The slot stays open for the NEXT representative multi-station day.**

**📌 NOT reproducible from migrations: all three teacher `display_name`s are NULL by a direct data edit.** 0021's backfill NULLed the two rows holding emails; the author then ruled (2026-08-04) the third — a 2026-07-29 account where Google DID supply `full_name` — should be NULL too. That row was outside 0021's scope by design, so it was cleared with a one-row UPDATE, **not a migration**. Consequence: a restored-from-migrations database would NOT reproduce this, and **a brand-new teacher signing in with a Google account that has a `full_name` will publish that name**. See the name-appearance design signal in Backlog.

**Baseline facts, tool-read live 2026-08-16 (never claim-read):** migrations applied **through 0034** · exactly **TWO** Edge Functions — `get-activity` **v19** (`verify_jwt:false`, the only one) + `check-activity` **v15** (`true`) · `pnpm verify:auth --target live` = **116 passed / 0 failed across 10 scripts** · both pg_cron jobs active · live rows: **3 teachers, 0 students, 0 pending, 0 checks, 0 grades, 1 class (`7NE9M2`), 8 activities**. No real student data exists yet, which is what keeps every open compliance answer cheap to change. **Re-verify flags with `list_edge_functions` after every deploy — read the `version` field, NOT the `entrypoint_path` suffix beside it** (that misread produced a false "verified live" stamp twice; `get-activity`'s path ends `…_11` while its version is 19).

⚠ **One standing watch-note (the retry-log discipline):** the a11y **gap-2 keyboard row** flaked ONCE (run 31852826598) and has not recurred in the **eight** green runs since (latest 31893704928: 73 passed / **0 flaky**). Instrumented in `e6b2872` so a second sighting names where focus actually is. **A second sighting is conclusive — fix then, not before. Read the flaky COUNT on every run, not the conclusion.**

**Archived to [HISTORY.md](docs/HISTORY.md):** all S9 author stations, the station HEADs (OV-DX-9), the closed gate-9 ledger, and this session's 0034 apply + purge-liveness + CI narrative.

## Standing constraints & watch items (current arc)

- **✅ The R2 graph-kit path is DEAD code-side (S9 Drop 4):** the viewer + editor build the kit from the workspace (app-bundled lazy Vite chunk) — no kit upload is ever needed again. What remains is the teardown station above.
- **Known limitation (stated, not hidden): offline boot needs a token that has not expired.** Expired token + no network ⇒ the pre-auth gate — refreshing needs the network, and reading Supabase's session storage directly in shipped code is a dependency worth refusing. (Offline *reopen* itself is proven as of S9 Drop 5; it had never actually worked before then — `Vary: Origin` defeated `Cache.match`.)
- **Retention is COMPLETE and proven end to end (0022–0025).** The one thing to know when touching it: **`users.deleted_at` means "account disabled", NOT "retention clock running"** — `join_class` refuses accounts that have it set, so student dormancy is DERIVED live from `class_members`/`classes` (400-day window) and the purge job never writes that column. Don't "simplify" it into a stored flag; that reintroduces a between-terms lockout. "Who is dormant right now" has no column to read — the query is `scripts/verify-0025.sql` section D.
- **⚠ `purge_soft_deleted` was re-created by 0029** minus its `submissions.student_id` guards (the nightly cron job would have died otherwise). It is live and running; treat it as the current definition.
- **✅ Teacher grading — SHIPPED 2026-08-16** ([teacher-grading.md](docs/design/teacher-grading.md)). Kept in the backlog only for what it left behind: the **by-student queue view** and **rich-text teacher feedback** (plain text is v1) are named follow-ons, and the **pruning/rollup** entry in TODOS now carries G2's ruling plus the constraint that pruning must never delete a check row referenced by `check_grades`.
- **⚠ Unexplained one-off:** `sanitize.test.ts` → "differs across students and across versions" failed once (2026-08-01) and did not reproduce in 13 runs. Recorded so a second sighting is treated as a pattern.
- **Verification quirk:** the in-app Browser pane suppresses the position-measured hosts (command bar / quick-bar / drawer) under JS-driven selection — Playwright e2e (real chromium) is authoritative. `/playground` (unauthed) is the dev target; `/playground?empty=1` mounts a blank doc.
- **Two e2e traps worth re-reading before touching the lanes:** verify env-sensitive work with `.env.local` moved aside (`mv` → run → restore, OV-DX-13); and `E2E_SKIP_BUILD` over a dist built from `.env.local` puts every signed-in spec on the sign-in screen — let the lanes build their own dist.

## Current focus — teacher grading is SHIPPED; the next arc is unchosen

**Plan + rulings: [teacher-grading.md](docs/design/teacher-grading.md)** — eng review CLEAR (G1–G14), design review CLEAR (§2b/G8-DR, 4/10 → 9/10). T1–T6 built, 0034 applied, pushed, CI-green. **The surface is live and correct-and-EMPTY**: 0 students and 0 checks means nothing has ever been graded on it, so the first real classroom is also its first real exercise.

**The four doors (0034):** `upsert_check_grade` · `release_check_grades` · `get_my_released_feedback` · `list_grading_queue`. Grades key on a SPECIFIC check row (immutable "what was graded"); the queue shows the latest per (student, section) within a version; **stale means the TEXT changed**, never "a newer check exists" — re-checking to retry auto-graded blanks is a designed feature and an attempt-number rule would cry wolf on every one.

**Three things worth knowing before touching it:**
1. **`check_grades` has ZERO RLS policies, deliberately** — the four functions are the entire access surface (0020's record_check posture). A "just let the teacher select it" policy would widen what they exist to keep narrow.
2. **maxPoints is denormalized into `criteria` by the SERVER** so the student-callable readback never opens `activity_versions.content` (the raw document, answer keys included) and a client cannot inflate a denominator.
3. **Writes gate on `can_edit_activity`, reads on `can_read_activity`** — byte-identical today, but the recorded Activity-Bank landmine is a widening of the READ helper, which must never confer write access to academic records.

**Still open, by design:** the by-student queue view, bulk cap-lifting, and rich-text feedback (plain text is v1). The pruning/rollup follow-on inherits G2's ruling plus the constraint that **pruning must never delete a check row referenced by `check_grades`** (recorded in its TODOS entry — the CASCADE that makes retention free makes pruning destructive).

## The completed arc — components-as-data re-architecture

**THE ACTIVE ARC (RULED 2026-07-28; eng + design reviews CLEARED).** Full re-architecture of the student path: live-API viewer SPA + student accounts (district Google SSO) + React component per block (single registry) + server-authoritative grading (answers never reach clients) + hard cutover. **Sequencing (author's explicit call): rewrite first; the August Algebra I release is deliberately delayed.** **Scope amendment (2026-07-28): "there are no old pages to maintain"** — live R2 pages are the author's own tests, so S9 DELETES the anonymous identity/wire machinery instead of preserving it. **Hosting (2026-07-31): Supabase-only backend; the SPA stays on Cloudflare Pages as a deliberately swappable static host.** All rulings: `~/.gstack/projects/ZanReed-activity-platform/user-main-design-20260728-components-as-data.md`; reasoning in [DECISIONS.md](docs/DECISIONS.md).

**Slice ledger + the C1–C15 cutover gates are ARCHIVED in [HISTORY.md](docs/HISTORY.md)** — S0 through S9 plus the Admission and Teacher-grading slices are all closed, and the final gate sweep ran 2026-08-15 against shipped reality (14 closed, 1 standing, gate 4 deliberately deferred to the first classroom). Nothing in that table is a live decision anymore.

**Timing calibration — RECALIBRATED 2026-08-14 (the gate-9 re-measure, done by the rule).** `TIMING_TARGET_MS` = medians of the 5 post-cutover green runs (pre-auth **992**, worksheet **1135**, math-rendered **1812**; `9b78496`); the 2× ceiling and delta warning derive from these. Recalibrate only by the same rule — median of ≥5 green runs, never local darwin, never a single run. (Both ledgers archived: 08-07/09 in HISTORY, post-cutover above.)

**Suite (tool-verified 2026-08-15, after the grading slice):** schema 340 / graph-kit 384 / **viewer 1139** / **app 1077** unit, plus **38 budget-script tests**, the print e2e lane, and the editor/student/sw/perf/**a11y** e2e lanes (the four CI lanes run **73** rows — a11y is 11 with the Responses-tab axe row; the local-only integration lane is 8). Typecheck + lint clean (0 errors); all 12 perf budgets pass (entry **177.6**/185 KiB gz — +1.3 for the released-feedback card, priced per the gate-9 ledger rule). Treat the tools' printed numbers as truth, not this line.

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
| Database migrations 0001–0034 | ✅ **All applied + verified live** (0034 applied 2026-08-16; `verify:auth --target live` 116/0, plus an independent posture re-check and a rolled-back purge liveness proof) (list_migrations, 2026-08-15 late). 0031+0032 were REPRODUCIBILITY migrations, no-ops on live; **0033 is the admission slice** (`pending` role, `redeem_join_code`, `claim_teacher` + caps). Re-run `verify-0013-0014.sql` + `verify-0017.sql` after any auth/RLS/grant migration |
| Scheduled jobs (pg_cron) | ✅ Installed 2026-08-05; both jobs active; first fire observed + verified 2026-08-06. **Verify the run, not the registration** |
| Components-as-data slices S0–S9 | ✅ Complete — see the slice ledger; only author stations remain |
| Print (baseline CSS → authored feature → viewer print + gate) | ✅ Complete through S5.5; print gates run in CI; sign-off evidence durable at tag `s5.5-print-signoff` |
| Question types + pedagogical blocks + calculator + reference panel + typography | ✅ All live |
| Phase 2.6 manual grading | ⚰️ **RETIRED at S9 Drop 3.** Blocks + rubric authoring survive in editor/schema/viewer; the dashboard + `lib/submissions`/`lib/grades` are deleted; `grades` kept empty. Successor SHIPPED 2026-08-16 as the checks-native grading slice (0034); `grades` + `can_grade_submission` dropped there |
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

**Last updated:** 2026-08-16 — **The teacher-grading slice went from an unparked backlog entry to live, deployed and CI-green in one arc.** Design pass → eng review → design review → T1–T6 → applied → pushed → green. The slice's own narrative is archived in [HISTORY.md](docs/HISTORY.md); what belongs here is what a future session needs.

**The reviews changed the architecture, which is the argument for running them before building.** The eng outside voice's 14 findings produced four rulings that are now load-bearing code: writes gate on `can_edit_activity` (immune to the recorded Activity-Bank read-widening landmine), maxPoints is denormalized server-side so the student read never opens the raw document, `graded_by` is SET NULL rather than RESTRICT, and the pruning follow-on inherited an explicit "never delete a graded check row" constraint. The design outside voice then **overturned an eng layout call** — version headers were the wrong level-1 for a grading queue — and its two critical findings (a released grade must SAY it is live-edited; release needed a student-perceivable signal) both shipped.

**Four defects the tests caught before shipping, each a different class, and the reason to keep writing the matrix first:**
1. **Dependency order** — dropping `can_grade_submission` before `grades` fails; the table's policies depend on it (SQLSTATE 2BP01).
2. **A live cron that would have died at its next fire, not at migration time** — `purge_soft_deleted` cites `grades`. Rewritten without the blocker, which is a semantic change (SET NULL supersedes the RESTRICT that required it), not a port.
3. **Nondeterminism in the staleness winner** — verify-0034 §D failed on the identical-text row, the one the whole G2 ruling exists for. `graded_at` defaults to `now()`, the TRANSACTION timestamp, so two grades written together tie and the `id desc` tiebreaker compared random uuids. Both functions now break ties on attempt_number.
4. **Vacuous coverage, caught in the act** — the three new integration rows SKIPPED on first run because the lane's fixture had no written-answer block. Fixed the fixture, not the assertion.

**Two operational facts worth carrying forward.** `verify:auth --target local` scores **114/2 on a fresh DB while live scores 116/0** — the two are verify-image-storage's and verify-0020's own seeded-data preconditions, not defects; a reset local DB will always look red there. And **a push can silently not land**: the first attempt left `origin/main` at `68e4d1e` while everything else looked correct, because the only stale thing was the deployed app. `git ls-remote origin refs/heads/main` distinguishes it; `git status` says "ahead N" either way.

*(Prior entry:)* **The admission side quest closed by finding what the slice had missed** — R5-DR's ruled PRE-AUTH fork existed only as its post-auth safety net, while `Home.tsx` carried a comment asserting the fork routed users. Shipped as T7 with the P5 flip on the e2e row that pinned the replaced heading. The counsel packet states the draft-2 → draft-3 delta and asks nine questions; writing it caught `data-map.md` claiming migrations 0001–0027 while documenting 0033's columns.

_Prior entries archived in [docs/HISTORY.md](docs/HISTORY.md)._
