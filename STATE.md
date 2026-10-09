# STATE.md

A living "where am I" snapshot. Update at the end of each work session —
replace the relevant sections, don't append. Move finished-work narratives to
[docs/HISTORY.md](docs/HISTORY.md), open work with an owner to
[TODOS.md](TODOS.md), durable reasoning to [docs/DECISIONS.md](docs/DECISIONS.md),
standing rules to [CLAUDE.md](CLAUDE.md), and live numbers to **no document at
all** — they are commands.

**Budget: ~1,500 WORDS** (not lines — the old line rule was satisfiable by
writing longer lines, and was 55% breached for weeks). `pnpm test` runs
`scripts/tests/state-budget.test.mjs`, which enforces a ceiling rather than the
target. ⚠ **This file is deliberately ~2.4x over the target right now**: the
re-architecture's bug tail is still closing, and STATE is the holding pen for
constraints that are still MOVING. The over-run gets resolved by PROMOTING the
settled ones into CLAUDE.md/DECISIONS — not by deleting them, and not before
they have stopped moving (CLAUDE.md → Working style, first bullet).

## Pending author actions

Things only the author does (pushes, deploys, migrations), queued and waiting.

**ARROWHEAD DROP 1 BUILT 2026-10-09 (local, unpushed). Owed by the author, in order:** (1) ✅ DONE 2026-10-09: both redeployed; downloaded bundles byte-identical to the repo (viewer `04640c4a…`, grading `b5b68dfb…`), marker present, `verify_jwt` false/true. (2) ✅ pushed (`8c266eb7`). (3) ✅ baseline regenerated (run 37901497558) and ONLY the multiple-choice image committed; six other images (data-plot, essay, faded-worked-example, matching, number-line, short-answer) differ from their committed copies by sub-tolerance drift this change did not cause — left alone, refresh is a separate call. ✅ Notion prompt stamp refreshed to `404ca05`. Owed: B-136 ("Drop 1 live") once CI is green. Ruling-10 count: zero live, zero pilot. **Drop 2 (`plot_vector`) next.** Record: TODOS → "An arrowhead on a segment".

**CHAIN HOOK VIEW is LIVE (2026-10-08):** 0057 applied (verify-0057 12/12 live; 0054/0055/0056/0043 still green), pushed at `c9f9eedc` (CI green), 13 hooks mirrored from the curriculum `71dd581` file and read back live (5 chains; Zan's account sees rate, triangles, parallel-lines). Nothing owed. Re-mirror with `--hook-registry` on any import; from an EMPTY folder it also rewrites the docs manifests — restore them with `git checkout -- docs/*manifest* docs/skill-coverage.json` ([chain-hooks-view.md](docs/design/chain-hooks-view.md)).

**Closed 2026-10-07, nothing owed:** teacher guides (D50), quiz/exam types (D51), the Activity Bank (0054) and its filters + opt-in authors (0055) — all LIVE and verified; records in [HISTORY.md](docs/HISTORY.md) → "Moved out of STATE 2026-10-08". Bank: 8 listed (three units), design in [activity-bank.md](docs/design/activity-bank.md).

**OWED: Gate 4 and the `display_name` one-row fix** (the D24 counsel read was answered 2026-10-06, below). *(Named, not counted — a hand-maintained tally in a section that gets replaced is a number with an expiry date.)*

**Y7 charts, graded stimuli and side-by-side figures are LIVE (2026-10-04)**, each redeployed and verified by hash; nothing owed. The three records moved to [HISTORY.md](docs/HISTORY.md) on 2026-10-06. The standing rule is unchanged: the author runs deploys unless he says otherwise.

**The daily facts practice (D43 slice 2, LIVE 2026-10-06) and the 0048 apply (prune DISARMED)** are closed records, moved to [HISTORY.md](docs/HISTORY.md) on 2026-10-07; what is still owed on the prune is the D24 paragraph below and TODOS → the ARMING checklist.

**PRACTICE BLOCKS (D43) — slice 1, per-family grouping and two-part checks are LIVE (2026-10-05)** and author-confirmed: migrations 0044 to 0047, registry revision `d0144e8d…`. Device checks T11/D6 WAIT for school devices (author has none; TODOS). Owed by the author: counsel's ANSWER to Q11 (sent, the author confirmed 2026-10-06; Q11(b) is step 1 of the prune's arming); the year-level placement by 1 November 2026. [practice-blocks.md](docs/design/practice-blocks.md) has every ruling and "as built" section.

**Y7 geometry figures and the 2026-10-04 build run are CLOSED** (record moved to [HISTORY.md](docs/HISTORY.md) 2026-10-06; leftovers in [TODOS.md](TODOS.md) → "Y7 geometry slice — CLOSED").

**AI-grading pilot: infrastructure LIVE-VERIFIED, model half PARKED
(author ruling 2026-09-26 — GPU box months away).** Proven against live:
0042 applied (verify-0042 30/30), registry mirrored (35 ids +
descriptions), worker login → claim round-trip as the author. Fixed
same-day: the mirror's empty-201 crash (b5de25c), the login allowlist
hang (b4a85db). **`grading_provider` back to `off`.**
PARKED until the box (README, in order): vLLM → `worker:check` OK → E2b
golden run → provider flip → `worker:run`; D7 step 2 + batch-confirm
behind those. **NOT parked:** D7 step 1 hand-grading — needs only student
checks (today 0, roster 1; §5.1's volume rule governs).

**Glossary LIVE (2026-09-28)** — nothing owed; v2 asks 2–3 in TODOS.

**D24 counsel read — ANSWERED (reported by the author 2026-10-06): "current measures are sufficient", covering the whole packet, Q1 to Q11.** No written opinion is in the repo; the record is the note at the top of [counsel-review-packet.md](docs/compliance/counsel-review-packet.md). What it changes: the counsel step of BOTH arming checklists is answered (Q10 for `prune_section_checks`, Q11(b) for `prune_fact_practice`); neither is armed. The author ruled to START the number-facts prune's arming checklist: first dry-run report read 2026-10-06 (nothing to remove); **the second is due on or after 2026-10-13**; no schedule is created without his explicit yes ([TODOS.md](TODOS.md) → the ARMING checklist). The author also reported, asked directly, that **counsel cleared under-13 use**; he ruled U-1 to U-4 and approved the wording, and it is BUILT (migration 0053, the two-choice class form, the re-confirm control, the privacy page and pack; DECISIONS → "Under-13 use, by school authorization"). 0053 was applied by the author and verified live (273 rows, 26 scripts); the page is pushed and the author confirmed it on live ("1-5 all good"). Step 4 of the checklist is done: migration 0052 aligned the two pre-0048 checks to the class's end date + 30 days.

**Gate 4 — seed `student_domain` + live-verify the trigger's student branch** (deliberately LAST; needs a real district domain). Prerequisite MET (0027 live). ⚠ Never seed a consumer domain — the rule now lives in CLAUDE.md → Things NOT to do.

**📌 NOT reproducible from migrations: three teacher `display_name`s are NULL by direct data edits** (confirmed 2026-08-22). **Live consequence:** the two accounts created 2026-08-19 through the self-serve door DO carry Google's `full_name`, so anything they publish serves that name to anonymous visitors via `get_activity_public_meta`. Both are the author's test accounts, so nothing is exposed — but this is the first live instance of default-on name attribution, and the fix is a one-row `update … set display_name = null`, **not a migration**. The opt-in control is in Backlog. *(Full history: HISTORY.md → display_name.)*

**Baseline facts — THERE IS NO SNAPSHOT HERE ANY MORE, DELIBERATELY.** This
row pinned migration ranges, function versions and live row counts, and went
stale three times while instructing readers never to claim-read — the last
time reporting "14 activities" when 6 of the 14 were soft-deleted. It is the
last row in this file to have carried live numbers, and the repo already
settled what to do about that three times over (bundle sizes, test counts,
function versions all became commands). **Read it live, every time:**

| what | how |
|---|---|
| migration range | `select count(*), max(version) from supabase_migrations.schema_migrations` |
| function flags | `list_edge_functions` — the `verify_jwt` field |
| function CODE | `get_edge_function` + grep for a marker unique to the change. **A version number is not evidence** — a real deploy once left `version`, `updated_at` and `ezbr_sha256` all unchanged |
| live rows | `execute_sql` — and split `activities` by `deleted_at`, or the count lies |
| cron + watermark | `select * from cron.job`; `analytics_rolled_boundary()` |

⚠ **"No real student data exists yet" is NO LONGER TRUE** — one real second
account is enrolled (the author's own throwaway, so the compliance answers stay
cheap to change, but the sentence that made them free has expired).

**Archived to [HISTORY.md](docs/HISTORY.md):** all S9 author stations, the station HEADs (OV-DX-9), the closed gate-9 ledger, and this session's 0034 apply + purge-liveness + CI narrative.

## Standing constraints & watch items (current arc)

- **✅ R2 is dead and the D-13 teardown RAN** — the full account (what survives, what the author still owes on the dashboard, where the 283-object archive is) is a STANDING rule and lives in **CLAUDE.md**, not here: this section gets replaced every session and that is not a fact that should expire with it.
- **Known limitation (stated, not hidden): offline boot needs a token that has not expired.** Expired token + no network ⇒ the pre-auth gate — refreshing needs the network, and reading Supabase's session storage directly in shipped code is a dependency worth refusing. (Offline *reopen* itself is proven as of S9 Drop 5; it had never actually worked before then — `Vary: Origin` defeated `Cache.match`.)
- **⚠ `purge_soft_deleted` was re-created by 0029** minus its `submissions.student_id` guards (the nightly cron job would have died otherwise). It is live and running; treat it as the current definition.
- **✅ Teacher grading — SHIPPED 2026-08-16** ([teacher-grading.md](docs/design/teacher-grading.md)). Kept in the backlog only for what it left behind: the **by-student queue view** and **rich-text teacher feedback** (plain text is v1) are named follow-ons. Its pruning/rollup inheritance is now DISCHARGED into 0035 + the arming-arc TODOS entry.
- **Promoted OUT of this file 2026-08-26** (they had stopped moving, and this section is replaced every session): the three **e2e origin traps** and the **red-verify-row rule** are in [CLAUDE.md](CLAUDE.md); the **retention `users.deleted_at`** constraint is in [DECISIONS.md](docs/DECISIONS.md).
- **⚠ Unexplained one-off:** `sanitize.test.ts` → "differs across students and across versions" failed once (2026-08-01) and did not reproduce in 13 runs. Recorded so a second sighting is treated as a pattern.
- **Verification quirk:** the in-app Browser pane suppresses the position-measured hosts (command bar / quick-bar / drawer) under JS-driven selection — Playwright e2e (real chromium) is authoritative. `/playground` (unauthed) is the dev target; `/playground?empty=1` mounts a blank doc.

## Current focus — CURRICULUM ALIGNMENT: cut over, live, `--strict` green

**The catalogue's organization now matches the curriculum model it is authored
against, and the cutover ran** —
[curriculum-alignment.md](docs/design/curriculum-alignment.md) (R1–R19 + §5b–§5d).

**What the platform gained.** Identity is a declared `key:` in the file (0041),
so a move no longer orphans a row — proved by moving all four activities to a
new folder AND new filenames and getting `0 create · 4 update · 0 orphans`.
Skill ids, part counts (`id = n` in the skill registry), `chain_role:
part|consolidation`, a chain registry mapping folder → unit title, the `x_`
reserved namespace with its per-run receipt, and **a detector for the in-math
answer leak** in the SHARED parser. Plus a generated catalogue-authoring prompt
that retires the one hand-carried sync in the curriculum side's system.

**The live numbers are commands, not facts here:** `pnpm import:batch
~/activity-catalogue-pilot --owner <email> --dry-run --strict --misconception-registry
…/misconception-registry.txt --skills-registry …/skill-registry.txt
--chain-registry …/chain-registry.txt`. It exits
0. Coverage is read from the run (or the generated
[docs/skill-coverage-manifest.md](docs/skill-coverage-manifest.md)), never
pinned here — this line carried a coverage figure two registry generations
behind the one in "Last updated" (drift audit 2026-10-07).

✅ **Lane B is BUILT (2026-08-31)** — the activities list orders by catalogue
path, keeping chain ordinals out of student-visible titles. App-only. The
outside-voice review found five plan defects first; two changed the build
(D6 KEPT via an explicit unfiltered order source). TODOS has the record.

**Every guard this arc shipped was mutation-tested the day it was written, and
TWO were VACUOUS on the first attempt — both found only by mutation, neither
findable by review.** (1) A test that "nothing catalogue-only reaches the
document" parsed the importer's own return value instead of the merge path, so
it proved zod strips unknown keys and nothing else. (2) Lane B's
case-distinctness assertion stayed green when the comparator's sensitivity was
reverted, because a different half of the fix already carried that property.
**The pattern in both: the assertion was true for a reason other than the one
it was written for.** That is what mutation finds and reading does not.

## The flow modes — SHIPPED AND LIVE (2026-08-24); arc closed

[activity-flow-modes.md](docs/design/activity-flow-modes.md) → read its AS BUILT section. `answerFeedback: immediate` stays deferred, guarded by `scripts/tests/flow-field-readers.test.mjs`. The rest of this section moved to [HISTORY.md](docs/HISTORY.md) on 2026-10-06.

## The S9 orphan arc — closed; narrative in HISTORY

Six content orphans shipped 2026-08-22/23; the flow modes closed a seventh
class 2026-08-24. What stays LIVE:

- **The calculator's FEATURE SCOPE is ruled** — DECISIONS.md → "Calculator
  feature scope". Intersections/intercepts are OUT on pedagogy grounds; do not
  re-pitch them as cheap.
- **All three z-tokens have real `var()` consumers**: tools 110 < reference 115
  < calculator 120 < popovers 1000.
- **The NAMED orphan classes are closed; three MINOR ones are still open** and
  were never closed by anything (TODOS → "S9 left FIVE MORE" → *Minor, same
  class*): `ShortAnswerBlock.placeholder` (Essay honours its own, ShortAnswer
  does not), `RubricCriterion.description`, `inlineBlankSecrets`. Plus the
  stale comment claims beside them — `blank.hint` "survives sanitization as a
  pre-check affordance" is still fiction; nothing reads it.

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
**Suite — no counts here, by rule.** Run `pnpm test` (unit), `node --test
scripts/tests/*.test.mjs` (script guards), `node scripts/check-perf-budget.mjs`
(budgets + their caps). What is durable is WHICH lanes exist: the print lane,
and the editor / student / sw / perf / a11y lanes, plus the local-only
integration lane. Every one was green locally 2026-08-24 with the local
Supabase stack running — the configuration that used to be red (see the
e2e-origins trap under Standing constraints). *(Three separate rows here once
pinned counts or sizes and all three rotted; the removals are recorded in
HISTORY, not re-argued here.)*

**Editor open remainders** (focus mode, the touch/a11y pass, smart-defaults, the keyboard-reorder settle, and two papercuts) **moved to [TODOS.md](TODOS.md) on 2026-08-22** — they lived only in this section, which is replaced every session.


## The shell budget — the ~150 KiB target is MET

**`SHELL_JS_GZ_KIB` 172 → 158 and `SHELL_CSS_GZ_KIB` 14 → 15 (2026-08-23).**
P1A's target is met for the first time. **Passed again since (glossary arc,
measured 2026-09-30), and rung 2 ran 2026-10-04 (auth-js's never-executed
modules stubbed); the stop line for eager additions stays 156.5.** (This line pinned "about 4.7 KiB free" — the shell has grown since, and the 2026-10-07 audit read about half that.) **Read the real numbers from
`node scripts/check-perf-budget.mjs`, never from here** — this line has carried
a stale JS figure twice. Derivations live in `scripts/perf-budgets.mjs` and
DECISIONS.md → "The shell CSS cap". ⏭ The remaining ladder (router,
preact/compat, auth-js) is listed in TODOS, is not urgent, and is not a plan.

## Build order — RULED by the author 2026-10-02

1. ~~**B14**~~ DONE 2026-10-03 (their PR #26 at `279a5a4`; pin-bump duty in CLAUDE.md). 2. ~~**Y7 geometry figures**~~
DONE 2026-10-04. 3. ~~**D43 practice blocks — DESIGN ONLY**~~ design APPROVED
2026-10-02. 4. ~~SW stale-shell recovery~~ BUILT 2026-10-04 (TODOS → "Service
worker: recover from a stale shell"). 5. ~~**Y7 charts**~~ BUILT and live
2026-10-04 (pulled into the author's 2026-10-04 build run). 6. **D43 builds:**
fluency + diagnostics LIVE (slice 1, the check, 2026-10-05; slice 2, the daily
practice, 2026-10-06) → mixed practice (gated on two chains with ratified
banks) → period assembly. **First classes: ~early Feb 2027** (author,
"4 months"). The intake rule that goes with this is in [CLAUDE.md](CLAUDE.md) →
Working style; reasons and triggers in [TODOS.md](TODOS.md) → "BUILD ORDER".

## Backlog / candidate arcs

- **Re-architecture follow-ons (accepted 2026-07-28):** (1) Clever/ClassLink district SSO — demand-triggered; **IdP map recorded 2026-08-09** — LMSes are not IdPs; expansion order is Azure/Entra → Clever/ClassLink → LTI 1.3. (2) Realtime push arc — trigger = first named live feature. (3) Sampled behavioral telemetry — only after the census can't answer a concrete question AND the compliance pack is amended. (4) Print variants. (5) Solution-unlock pedagogy pass. (6) /design-consultation brand pass — includes replacing the system-ui chrome font stack (design-review ding, 2026-08-18).
- **✅ Admission model — RULED, BUILT AND LIVE 2026-08-15** ([admission-model.md](docs/design/admission-model.md) §5b R1–R11 + T1–T7). Kept in the backlog only for what it left behind: the durable **Edmodo lesson** (the violation was outsourcing consent duties without operator-side notice/minimization — **copy Gimkit's enrollment-=-consent mechanism, not Blooket's "school is responsible" clause**), and the follow-ons now split by design — **under-13 (D7), the DPA template, and the cap-lifting surface live in [TODOS.md](TODOS.md)**; email+password, extra OAuth providers, the guest tier and CAPTCHA stay in §7. Gate 4 proceeds unchanged (the domain fast path is untouched).
- **Activity Bank — RULED + BUILT 2026-10-07 (apply + push owed, see Pending author actions): [activity-bank.md](docs/design/activity-bank.md)** (author: any teacher who makes an account can copy and use the library, "like the importer"; copy-on-use supersedes run-in-place). Older record: **Free activity catalog / "Activity Bank"** (Phase 2 cold-start lever; [free-activity-catalog.md](docs/design/free-activity-catalog.md)). Moved behind the rewrite 2026-07-28; Drop 0 hosting prep done. One open item: taxonomy/tags — author wants a tags discussion at kickoff. Post-S9: the discovery surface is a viewer route, not an R2 URL. **The admission signal above is now a kickoff input.**
- **Long-term OCR/AI:** [pdf-import.md](docs/design/pdf-import.md) + [photo-grading.md](docs/design/photo-grading.md). Photo-grading needs server-shareable answer evaluation — largely arrived with S4's grading engine; re-check at kickoff.
- **Teacher "how your name appears to students" control** (deferred 2026-08-04): a small edit writing `users.display_name` under existing self-only RLS. **Design signal from the author's own two rulings that day:** the control should NOT silently adopt Google's `full_name` as the published attribution — default to showing nothing and let the teacher opt IN. Until then the pre-auth screen says "your teacher".
- **Canvas keyboard stops** — Check sits 76 tab stops in on a full worksheet, ~17 of them canvas handles (all named, so not a violation). Measurement + the design question in [TODOS.md](TODOS.md).
- **Other Phase 2 "decide at phase start":** image-hosting quota, `skills` editing UI.

## Status by area

| Area | Status |
|---|---|
| Stages 9–16 (schema, renderer, runtime, editor, publish flow, submissions dashboard) | Historical — Phase 1 shipped and served its era; the renderer/runtime/publish-HTML/dashboard halves were deliberately DELETED at S9. Schema + editor live on |
| Database migrations | ✅ **Read the range live, never from here** — `select count(*), max(version) from supabase_migrations.schema_migrations` (Pending → Baseline facts). This row pinned "0001–0040" and a verify-roster count through thirteen more migrations (drift audit 2026-10-07; the old row is in HISTORY). What each migration does: [supabase/migrations/README.md](supabase/migrations/README.md), whose index `scripts/tests/migrations-index.test.mjs` holds complete. The verify roster is `AUTH_VERIFY_SET` in `scripts/verify-runner.mjs` — read the array. Re-run `verify-0013-0014.sql` + `verify-0017.sql` after any auth/RLS/grant migration |
| Scheduled jobs (pg_cron) | ✅ Installed 2026-08-05; both jobs active; first fire observed + verified 2026-08-06. **Verify the run, not the registration** |
| Components-as-data slices S0–S9 | ✅ Complete — see the slice ledger; only author stations remain |
| Print (baseline CSS → authored feature → viewer print + gate) | ✅ Complete through S5.5; print gates run in CI; sign-off evidence durable at tag `s5.5-print-signoff` |
| Question types + pedagogical blocks + calculator + reference panel + typography | ✅ **All live in the viewer as of 2026-08-23** — the two FLOATING TOOLS were wired this session and were the last student-facing gaps. Calculator: summon cluster in `StudentViewer`, dark chrome + <480px sheet in the kit. Reference panel: bottom-LEFT summon in `ViewerContainer`, gated `mode === 'screen'` so it stays off the print preview, body a permanently disabled fieldset. The print box is unchanged and independent |
| Phase 2.6 manual grading | ⚰️ **RETIRED at S9 Drop 3.** Blocks + rubric authoring survive in editor/schema/viewer; the dashboard + `lib/submissions`/`lib/grades` are deleted; `grades` kept empty. Successor SHIPPED 2026-08-16 as the checks-native grading slice (0034); `grades` + `can_grade_submission` dropped there |
| Edge Functions (**2**) + deploy flags | ✅ **exactly two**, `get-activity` (`verify_jwt:false`, the only one) + `check-activity` (`true`). **Versions are NOT pinned here** — they moved three times in six days and this row carried a different pair from the Pending section (drift audit 2026-08-21). Read them with `list_edge_functions`, from the **`version`** field and never the `entrypoint_path` suffix beside it; `supabase/config.toml` is the authoritative flag record |
| Cloudflare R2 hosting | ⚰️ **DEAD.** Code-side at S9 Drop 4; the D-13 teardown ran 2026-08-15 (upload scripts + `.env.r2` deleted). Only the dashboard steps remain — see the standing constraints |
| Auth (Google OAuth teacher allowlist + student SSO) / React app / editor stack | ✅ In place |
| CI (typecheck/lint/test/build + **2** bundle-drift guards + perf budgets + script guards + print gates + perf/sw/student/**a11y** lane job) | **Status is NOT recorded here — open the latest run on `main`** (Actions tab / `gh run list`), checked at session start because `main` once sat red for days unnoticed. This row cited a 2026-08-24 run id as "GREEN" for six weeks (drift audit 2026-10-07); **a claim with a run id attached is still a claim; open the run.** `pnpm verify` is CI's whole `check` job locally |
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

**Last updated:** 2026-10-06 (second session) — the VERIFY RUNNER now judges row sections strictly (a row that errors, returns NULL, prints a stray line or never comes back is a FAIL; pg_cron rows carry `-- @live-only` and SKIP locally). Its first run revived verify-0030's `client_grant_is_select_only`, silently absent since 2026-08-14; green on live. Full live verify 274 rows, 0 fail (TODOS → the runner entry). Earlier that day, live and author-confirmed: 0048 (prune DISARMED, arming STARTED), the daily facts practice (0049–0051), the sign-in button, 0052, under-13 use (0053). NEXT: (1) on or after 2026-10-13 read the prune's SECOND dry-run report on live (`select prune_fact_practice();`), then bring the author both reports and ask for his explicit yes before any schedule exists; (2) number-facts integration row and the import report's settings lines BUILT (TODOS); no unranked items left. Builder's under-13 project files UPDATED (C-73 closed). End-date test done; device checks wait for school devices. Build queue: nothing ungated (mixed practice gated). Liaison: `0d42274` stamped (B-96), imported (3/102 parts). Next C-79 / B-97. Behind its gate: mixed practice.

The curriculum-alignment arc's correspondence lesson (the two most expensive mistakes were each caught by the OTHER side, plus three corollaries) moved to [docs/HISTORY.md](docs/HISTORY.md) on 2026-10-04.

_Prior entries archived in [docs/HISTORY.md](docs/HISTORY.md)._
