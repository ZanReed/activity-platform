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

**OWED: the D24 counsel read, Gate 4, and the `display_name` one-row fix.** *(Named, not counted — a hand-maintained tally in a section that gets replaced is a number with an expiry date.)*

✅ **`get-activity` IS DEPLOYED AND CODE-VERIFIED (2026-08-25).** The
misconception strip is live, so **activities carrying bindings are safe to
publish**. Verified by grepping the deployed source in BOTH directions (the new
strip declaration present, the three deleted knobs absent) — never the version
field. `SANITIZER_REV` moved, which orphans stale read-cache rows on its own.

✅ **`check-activity` IS DEPLOYED AND CODE-VERIFIED (2026-08-25).** Flag is
correctly `verify_jwt: true`. **The sensor is now live end to end** — an
authored binding records a misconception id on a real student's check.

Proven by **byte-identical sha256** between the deployed bundle and the
committed one, not by marker-grepping — `get_edge_function` cannot read this
function at all. **That technique is now a standing rule in CLAUDE.md** (deploy
verification), because this section gets replaced and the method should not go
with it. Marker greps agreed as a cross-check (`misconceptionIds` ×5,
`answerType === "numeric"` ×2; the three deleted knobs all 0).



🔨 **APPLY MIGRATION 0041 — the curriculum-alignment slice's only author action.**
`supabase db push`, then re-run `pnpm verify:auth --target live` (no
`verify-0041.sql` exists — the proof is the importer's own refusal path, which
names 0041 by number if the column is missing). It adds
`activities.source_key` + a partial unique index and narrows `source_path`'s
comment. **No Edge Function deploy, no bundle regeneration, no republish** —
nothing in `packages/schema`, the viewer's sanitize/registry source, the viewer
server or graph-kit's scorers was touched. ⚠ **Do NOT reorganize the catalogue
folder before the cutover's first import run** — steps 1–3 in
[curriculum-alignment.md](docs/design/curriculum-alignment.md) §5 are what make
the reorganization free, and only in that order.

**⚠ D24 counsel read — OWED.** The packet is written: [counsel-review-packet.md](docs/compliance/counsel-review-packet.md) — ten numbered questions, each naming the platform's current position. The load-bearing three: **Q2** (does an *unverified* educator attestation carry the authorization it asserts), **Q4** (is the per-class 13+ assertion defensible when students are never asked their age), **Q5** (on what basis is a pending account's data held before any teacher vouched). **Q10** gates ARMING the check-prune and nothing sooner. ⚠ **The gate this was meant to hold is ALREADY OPEN and the author accepted that risk** — any Google account can self-serve to teacher, and a real second account's data now sits in the DB under a pack every file marks DRAFT (the author's own throwaway, so nothing is owed to a third party). The read is the author's; nothing repo-side is owed. *(How it got open: HISTORY.md → D24.)*

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

## Current focus — CURRICULUM ALIGNMENT, Lane A built (2026-08-26)

**The catalogue's organization now matches the curriculum model it is authored
against** — [curriculum-alignment.md](docs/design/curriculum-alignment.md),
R1–R18, ruled through an eng review plus a four-letter written exchange with the
curriculum builder (twelve positions moved, four of them ours reversing).

**The defect it closes.** The file PATH was the activity's database identity, so
every editorial act the model calls normal — split, rename, re-file a chain —
orphaned the row and stranded its published history. Identity is now a declared
`key:` in the file; the path became organization, and therefore the teaching
order. ⚠ **The path fallback is not merely the keyless case** — it is how a
keyed file ADOPTS a row that predates the column, which is the entire cutover.

**Also in Lane A:** `skill:`/`supporting_skills:` + `--skills-registry` and a
committed coverage manifest (`.md` for humans, `.json` for the builder), which
turns "47 skills, 0 covered" from structurally unanswerable into a named work
list; `chain-registry.txt` mapping chain folder → unit title; the `x_` reserved
namespace plus the per-run receipt that is its only sensor; and **a detector for
the in-math answer leak** — a `{{…}}` inside `$…$` renders the answer to the
student, and it now warns from the SHARED parser, so the teacher paste path is
covered too.

**Lane B is designed and NOT built:** sorting the activities list's unit groups
by `source_path`, which is what keeps chain ordinals out of student-visible
titles. TODOS carries it.

**Six guards, each mutation-tested the day it was written** — and one of them
was VACUOUS on the first attempt and only mutation found it: a test that
"nothing catalogue-only reaches the document" parsed the importer's own return
value instead of the merge path, so it proved that zod strips unknown keys and
nothing else. Leaking a skill id into `applyImportedMeta` left it green. That is
the repo's most expensive defect class, caught this time in the same hour it was
written rather than months later.

## The flow modes — SHIPPED AND LIVE (2026-08-24); arc closed

[activity-flow-modes.md](docs/design/activity-flow-modes.md) — **read its
AS BUILT section, not just the plan; five things changed shape at build
time.** Check groups, the server-enforced `locked` mode (0040 +
`check-activity` v20), `activityType` as a printed label; `revisionMode`
and `gradingMode` deleted. **`answerFeedback: immediate` is still
deferred** — it needs a commit seam that does not exist, and
`scripts/tests/flow-field-readers.test.mjs` fails if that deferral ever
ends silently. Full narrative: HISTORY.md.

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
| CI (typecheck/lint/test/build + **2** bundle-drift guards + perf budgets + script guards + print gates + perf/sw/student/**a11y** lane job) | ✅ **GREEN — all four jobs, verified on run `32676932651` (2026-08-24), which is the first run to include the regenerated graph_figure print baseline.** **Run counts are NOT pinned here** — they rot every push (drift audit 2026-08-21); `gh run list` is the source, checked at session start because `main` once sat red for days unnoticed. ⚠ **AND A SHARPER VARIANT, 2026-08-24:** the Pending section used to assert "CI is green again" and CITE A RUN NUMBER — and that run had **failed** on the graph-figure baseline. It also predated the commit that fixed it (`e6b8f7f`, 11 minutes later), which was never pushed, so CI had not run on the fix at all. **A claim with a run id attached is still a claim; open the run.** |
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

**Last updated:** 2026-08-26 — **CURRICULUM ALIGNMENT, LANE A BUILT.** Declared
identity (0041, prepared not applied), skill registry + coverage manifests, the
chain registry, the `x_` namespace, the in-math answer-leak detector, and a
generated catalogue-authoring prompt that retires the one hand-carried sync in
the builder's system. `pnpm verify` 8/8.

**The lesson, and it is generation FOUR of the one this repo keeps paying for.**
Generations one to three: a declaration outlives its implementation; a guard
outlives its own validity; the slice written to end that class commits it three
times in its own new code. **Generation four: the guard written by the session
that KNEW all three was vacuous anyway** — and vacuous in the documented way, by
asserting over the wrong artifact one level from the thing it claimed to check.
Mutation found it in minutes. The rule that keeps working is not "write good
guards", it is **watch every new guard fail once, on the day you write it**.

**Also worth carrying:** the builder's reply corrected two of our rulings and
caught an id we had INVENTED — `proportional.graph-through-origin` appeared in
an example we wrote to demonstrate a file format, and had no source. It nearly
got ratified into their registry as a second id for a skill that already had
one. An example is a claim.

_Prior entries archived in [docs/HISTORY.md](docs/HISTORY.md)._
