# TODOS

Deferred work items with enough context to pick up cold. Durable backlog lives in
ROADMAP.md; this file is for concrete, near-term follow-ups surfaced during reviews.

## Settle on ⌘⇧↑/↓ keyboard reorder (debounced)

**What:** Tag `BlockReorderShortcuts` (⌘⇧↑/↓) into the stage-6 SettleMotion flow with a
debounce, so a keyboard-moved block settles at its FINAL resting position only.

**Why:** Stage 6's settle is meta-tag opt-in (eng-review ruling T2-1, 2026-07-21), and the
keyboard reorder chord was deliberately left untagged: each keypress is a delete+insert, so
holding the chord to walk a block five slots would fire five back-to-back settles (a
strobe). Untagged is the safe v1 default — but it means keyboard-first users get no
placement confirmation while mouse users (drag) and inserters do. Parity gap.

**The design problem:** "animate only the final position" needs stopped-moving detection —
e.g. a trailing debounce (~250ms after the last reorder transaction for the same block,
apply the settle decoration), or animate on chord keyup. Neither is trivial inside a PM
plugin; that's why it was split out rather than built into stage 6.

**Depends on:** stage 6's SettleMotion extension landing first (the meta contract +
`block-settle-move` keyframe it would reuse).

**Where to start:** `packages/app/src/editor/extensions/BlockReorderShortcuts.ts` (the
chord commands) + the SettleMotion plugin's meta contract. The move keyframe
(`block-settle-move`, bounce-only, no opacity dip) already exists by then.

**Context:** surfaced by /plan-eng-review's outside-voice pass on 2026-07-21 while
reviewing the stage-6 snap-motion plan (finding 4: the reorder chord has the same
transaction signature as a drag move).

## Doc-level seam zones between multi-column rows

**What:** A second insert-zone kind at the DOC level covering the horizontal gap between
two adjacent multi-column rows (or a multi-col row and a sectionBreak), inserting a fresh
1-col row at that position.

**Why:** The shipped insert-zones seam model (eng-review ruling 2A, 2026-07-23) is
column-interior only — a strip above every block inside a column plus one at each column's
end. That covers every gap EXCEPT multi-col-row ↔ multi-col-row adjacency, which stays
grip-menu-only ("Add row below"). Deliberate: one zone kind keeps the mental model pure
("this strip = a block lands here, into this column"); doc-level zones would put a
second, different landing semantic (new row) behind an identical-looking strip.

**Pros:** closes the last insert-affordance coverage hole. **Cons:** dual semantics in
one UI — the exact ambiguity 2A was chosen to avoid; needs a visual differentiator.

**Depends on:** the v1 insert zones shipping first; real dogfooding or teacher feedback
actually hitting the gap (rare layout).

**Where to start:** the InsertZones extension's `insertZonePositions` helper
(`packages/app/src/editor/strictGrid.ts`) — doc-level positions are the ones it
deliberately does not emit; `StrictGridNormalize` re-coalesce rules decide what a
doc-level insert normalizes into.

**Context:** surfaced by /plan-eng-review on 2026-07-23 while reviewing the persistent
insert-zones feature (issue 2 / ruling 2A).

## Batched staleness-status RPC (`get_branch_source_statuses(uuid[])`)

**What:** A batch variant of Drop 2′'s `get_branch_source_status(branch_id)` so the
Activities/library view resolves every branched card's staleness in one round-trip.

**Why:** v1 ships the per-card RPC — a deliberate N+1 accepted because branch counts are
single-digit (eng-review ruling D10, 2026-07-24). The batch variant is additive (no surface
break) and only earns its keep at scale.

**Trigger:** any user's branch count passes ~15, or library render is measurably slow.

**Where to start:** the `get_branch_source_status` definer RPC in the Drop 2′ migration —
same owner-only gating, `= any(p_ids)` + per-row degradation instead of a single lookup.

**Context:** surfaced by /plan-eng-review on 2026-07-24 (Activity Bank arc, performance
review finding 4-1).

## Anonymous assignment-link validation at page load

**What:** A tiny anonymous endpoint (get-feedback's `--no-verify-jwt` pattern, or a new
action on it) that a published page calls at bootstrap when `?a=` is present, so a dead
assignment link surfaces BEFORE the student starts working, not at submit.

**Why:** The scoping train's ruling D14 (2026-07-24) made token death non-destructive —
on 401 the work is preserved in the pending blob and retries with a fresh link — so the
remaining harm is only "student learns late." That downgraded the preflight check from
requirement to polish, and it was deferred because it adds a real anonymous surface
(deploy flag, CORS, enumeration thinking — tokens are ~72-bit so enumeration is cold, but
it's still a new no-JWT function to maintain).

**Trigger:** the September observation (Kia/Felice classes) shows students actually
hitting dead links.

**Pros:** dead link discovered in second 1, not minute 40. **Cons:** one more anonymous
Edge Function surface to secure and redeploy correctly (`--no-verify-jwt` footgun applies).

**Where to start:** `supabase/functions/get-feedback` (the anonymous-endpoint precedent);
the runtime bootstrap in `packages/renderer/src/runtime/init.ts` for the call site.

**Context:** surfaced by the outside-voice pass of /plan-eng-review on 2026-07-24
(finding OV-4, option B content, deferred by ruling D14/D19).

## Orphaned-image garbage collection (activity-images bucket)

**What:** A cleanup job that diffs `activity-images` Storage objects against the image `src`s
actually referenced in activity documents and deletes the unreferenced ones.

**Why:** The bucket has no DELETE path by design (0019: INSERT-only policy), so every replaced or
abandoned upload lives in a public bucket forever. Same residue the R2 era had — but Storage
counts against Supabase's 1GB free-tier quota, which R2's 10GB never made anyone think about.
A slow clock, but a real one.

**Cons / why not now:** Needs real design — image refs live inside JSONB in BOTH
`activities.draft_content` AND `activity_versions.content`, and until the S9 cutover, old
published R2 pages also reference uploads. A naive GC deletes images that published pages still
show.

**Depends on:** S9 cutover (single source of truth for references). Service-role side (the only
role that can delete).

**Context:** surfaced by /plan-eng-review 2026-07-31 (direct-to-Storage upload review, TODO ask 1).

## Upload progress indicator (blocked on a policy-design amendment)

**What:** A progress bar during image upload in the editor popovers (ImageEditPopover,
DefinitionEditPopover).

**Why:** Visible-state UX for large images (repo UX priority: visible state indicators). The
10MB cap keeps uploads short on school networks, so this is polish, not pain.

**⚠️ The trap this entry exists to disarm:** this is NOT a UI-only task. supabase-js's standard
`upload()` has no progress callback; progress requires the TUS resumable protocol, and TUS needs
UPDATE (and possibly SELECT) policies on `activity-images` that 0019 deliberately omits — the
absence of an UPDATE policy is what makes objects overwrite-proof today (DECISIONS.md →
"Direct-to-Storage image upload"). Whoever picks this up is amending the bucket's security
posture first and adding a progress bar second.

**Context:** surfaced by /plan-eng-review 2026-07-31 (outside-voice finding 7, TODO ask 2).

## Teacher grading bound to `section_checks` (the S4 deferral's owner)

**What:** Make student free-text captured by the viewer's check flow gradable by a teacher, and
readable back by the student. Four pieces: (1) how `grades` keys onto checks — a nullable
`check_id` with an exactly-one-of constraint against the existing `submission_id`, or a
checks-native grading table; (2) the **attempts-vs-latest-response decision**; (3)
`get_my_released_feedback(activity_id)`; (4) the dashboard UI binding.

**Why:** S4 records every check into `section_checks` (responses + verdicts + feedback shown),
so free-text answers are CAPTURED — but nothing can grade them and
`CheckService.fetchReleasedFeedback` honestly returns `graded:false` until this lands. The
student-facing "Recorded ✓ — your teacher will review" copy stays true only because this slice
is scheduled. It must land before any real classroom use of the viewer.

**⚠️ Why it was deliberately CUT from S4** (eng review 2026-08-01, cross-model tension T2): a
`unique(check_id, block_id)` written during S4 would have frozen the attempts-vs-latest question
BEFORE the UX that answers it. Under a formative check loop a student produces MANY
`section_checks` rows per section, each re-snapshotting their free text. Does the teacher grade
an attempt, or the latest response per block? That is a grading-UX question, and deciding it
with the UI in front of you is the whole point of the deferral. Freezing the FK first buys a
second migration.

**Second open question the deferral inherits:** released feedback is keyed by BLOCK id, but a
republish mints all-new block ids (the same premise that made S4 grade the served version).
Feedback graded against version N is unrenderable by a client viewing version N+1. The
version-pinning insight was applied to grading and not yet to readback.

**Depends on:** S4 shipping `section_checks` (migration 0020) — DONE 2026-08-01, so this is unblocked.

**⏸ Deliberately parked (author, 2026-08-01): NOT pressing, because there are no
teachers using the system yet.** That is the whole reason it can wait — the
captured free text is accumulating safely in `section_checks.responses` and
nothing is being lost. What changes the urgency is the first real teacher: at
that moment "Recorded ✓ — your teacher will review" becomes a promise the
product cannot keep, and this slice is what keeps it.

**⚠ S9 amendment (2026-08-12, eng review OV-5/OV-6):** the S9 cutover plan
([s9-cutover.md](docs/design/s9-cutover.md) D-6) RETIRES the Phase 2.6 surface this
entry would have re-pointed: the Submissions dashboard route is deleted, `grades`
rows are wiped with the anonymous-wire test data, and `get-feedback` is deleted —
**and was discovered to have NEVER worked** (every success return passed its
arguments to `jsonResponse` swapped, so the body served was the literal `200`;
released feedback never reached a published page). Consequence for pickup: this
slice rebuilds against `section_checks` with NO working reference implementation —
do not port `get-feedback`'s "behavior"; there is none. The Phase 2.6 rubric UI
components remain in git history for salvage.

**Where to start:** `supabase/migrations/0010_grades.sql` (the `submission_id`-keyed table +
`can_grade_submission` helper + the dual-path RLS precedent already written for the assignment
world), and the Phase 2.6 teacher grading UI (side-by-side + Needs-grading filter) that will be
re-pointed.

**Context:** surfaced by /plan-eng-review 2026-08-01 (S4 review, outside-voice findings 5+6 →
ruled tension T2, TODO ask 1). Full rulings: the S4 section of
`~/.gstack/projects/ZanReed-activity-platform/user-main-design-20260728-components-as-data.md`.

## `section_checks` retention / GC — AND the durable analytics rollup

**What:** A pruning story for `section_checks`, ridden on the same scheduled job as the
already-earmarked read-cache GC. **Amended 2026-08-04 (S7): this entry now also owns the durable
analytics rollup**, because both wait on the same ruling. Do them together.

**Status update from S7 (shipped 2026-08-04, migration 0026):** the read-cache half of R6(a) is
DONE — `get-activity` deletes stale-rev rows for any version it re-caches, and
`run_analytics_maintenance()` sweeps the tail nightly. What that job does NOT do is prune
`section_checks` or pre-aggregate anything, for the reason below.

**Why:** Every check writes a durable row carrying the full responses jsonb, and the check loop
is formative — students re-check freely, by design (parity ruling 7.1A). Nothing deletes a check
today. Free-tier Postgres is 500 MB. Finding R6(a) already earmarked a GC pass on S7's scheduled
aggregation for `activity_version_reads` rows orphaned by a `SANITIZER_REV` change; one job
should cover both.

**The open question:** keep every attempt (attempt history is genuine teacher insight — how many
tries did this student need?) or prune to last-N per (student, section)? This is partly answered
by the teacher-grading slice above: if grading targets the latest response per block, old
attempts are cheaper to drop; if it targets attempts, they are the record itself. Don't tune
retention before that decision.

**The SAME question decides the rollup's shape, which is why S7 refused to build one.** A
pre-aggregated per-day count is the one artifact designed to outlive its source rows, so getting
its shape wrong is unrecoverable. And a naive shape IS wrong here: re-checking is a designed
feature, so counting every verdict tallies one student's one mastered item once per attempt
(`verify-0026.sql` C3 shows the fixture reading 4 correct across attempts vs 3 on latest).
Until then `get_activity_analytics` computes both readings live from raw checks — correct, and
frozen into nothing.

**Design inputs to carry into that slice** (recorded by the S7 outside voice so they aren't
re-derived):
- Attempt-aware shape: first-attempt correctness, latest-per-student, or both.
- Small-cohort exposure: a rolled-up row with `students = 1` is that student's daily performance
  record. Decide suppression or coarser granularity, and amend
  `docs/compliance/retention-policy.md` — 0026's tables deliberately hold no student identifiers,
  and a rollup is where that stops being automatic.
- Rollup timezone: "calendar day" in UTC splits a US school evening across two days.
- Durable watermark + a purge-side assertion that nothing unrolled is being deleted (a rollup job
  dead for 30 days would otherwise let 0022's purge delete never-rolled checks silently).
- Composable counts: daily distinct-students cannot be summed into weekly or all-time uniques,
  which is the first question any real consumer asks.

**Depends on:** S4 shipping `section_checks` (done); S7's census + item map + maintenance job
(done, 0026 — the rollup's join is already built); the teacher-grading slice's attempts-vs-latest
ruling (the actual blocker).

**Where to start:** finding R6(a) in the components-as-data design doc, plus the per-student rate
ceiling S4 puts inside `record_check` (the same indexed count over a trailing window is the
natural place to observe real growth rates).

**Context:** surfaced by /plan-eng-review 2026-08-01 (S4 review, outside-voice finding 2, TODO
ask 2).

## The remaining ~380 ms LaTeX-fallback window (S5-2 residual, halved not closed)

**What:** A student still sees readable-LaTeX fallback for roughly **380 ms** after the
worksheet becomes interactive, and a browser-menu Ctrl+P inside that window prints the
fallback rather than typeset math.

**What already happened (do not redo it):** S8 T7 shipped preload-on-math-detect — the
KaTeX fetch now starts the instant the served document is known to contain math instead of
waiting for a math component to mount. That took the window from ~737 ms to ~382 ms and
cost nothing in shell size. Full reasoning and the before/after table: DECISIONS.md →
"Preload math on detect, rather than eager-loading it".

**The only lever left is eager loading, and it is expensive.** KaTeX is 75.2 KiB gz against
a 168.1 KiB gz shell — about **+45% first load** on every math-bearing page — and it would
amend ruling D16, which exists to protect Chromebook load time. Deliberately NOT taken: a
sub-half-second window that only bites if a student reaches for Ctrl+P in the first moment
is not worth that, especially on the school hardware D16 protects.

**Trigger to revisit:** a teacher or student actually reports printing raw LaTeX, OR the
shell gets enough lighter (see the 168→150 KiB entry below) that 75 KiB stops being a
meaningful share of first load.

**Where to start:** `packages/viewer/src/inline/mathPreload.ts` (detection + preload) and
the `loading` tier in `packages/viewer/src/registry/bindings.ts`. Re-measure with
`pnpm --filter @activity/app exec playwright test --project=perf` — the spec prints the
fallback-window number directly.

**Context:** original residual from /plan-eng-review 2026-08-01 (S5 ruling S5-2); reframed
from a binary into three options by the S8 outside voice (2026-08-05, ruling D7); option 3
built and measured the same day.

## Get the student shell from 168 KiB gz toward the 150 KiB target

**What:** Deliberate work to shrink the entry chunk. Ruling P1A sketched a ~150 KiB gz
shell cap; the measured post-split reality is **168.1 KiB gz**, and the committed budget is
a regression pin at that number rather than a claim the target was met.

**Why it is not slack:** the entry chunk is react-dom + react-router + supabase-js + the
viewer's eager block tier + StudentViewer + Home. Nothing in it is obviously wasteful — the
3 MB of editor weight already left in the S8 split. Closing the last ~18 KiB needs a real
lever, not tidying.

**The obvious lever:** supabase-js is a substantial share of what remains, and the student
path uses a narrow slice of it (session read, one or two function calls). A hand-rolled
fetch client for the viewer — or importing a narrower entry point — is the candidate worth
measuring first. Weigh it against the maintenance cost of not using the vendor client.

**How to know if it worked:** `node scripts/check-perf-budget.mjs` prints the number every
run; lower `SHELL_JS_GZ_KIB` in `scripts/perf-budgets.mjs` deliberately when it drops, so
the win is locked in rather than silently re-spent.

**Context:** surfaced during the S8 build (2026-08-05) when calibration met the P1A sketch;
outside-voice finding 7 predicted the gap before it was measured.

## Prove offline reopen against the built service worker (S6 V9 gap)

**What:** Get the two parked rows in `packages/app/e2e/sw/service-worker.e2e.ts`
(`offline reopen`, currently `test.fixme`) running green, or establish that the
worker genuinely cannot serve a navigation offline and fix the worker.

**Why:** Offline reopen is ruling TV2-A's user-visible promise — a student who
opened an activity in class can open it again at home with no signal. Everything
around it is verified: the worker installs, claims the page, and handles both the
navigation and subresources online (`workerStart` non-zero for the entry chunk),
the precache holds index.html, assets land in `activity-viewer:cache:shell`, and
V6's per-user document cache holds the content. The promise itself is the one
part still unproven.

**What was already ruled out:** Playwright request routing (fails identically
with no interception at all), and the runtime route not matching (it matches
online). Under `context.setOffline(true)` the navigation returns 200 and the page
stays controlled, but parse-time subresource requests die with `net::ERR_FAILED`
while a `fetch()` for the same URL from page script resolves 200 moments later.
Aborting every route instead of emulating offline behaves the same.

**Where to start:** try stopping the preview server instead of emulating offline
(a real unreachable origin rather than an emulated one) — the emulation is the
prime suspect. If that reproduces the failure, the worker is at fault and
`packages/app/vite.config.ts`'s runtimeCaching is where to look; if it passes,
the harness needs the server-stop approach and the rows can be un-parked.

**Depends on:** nothing. Should land **before S9 cutover**, which is when
students actually meet this path.

**Context:** surfaced by /plan-eng-review's S6 build, V9 (2026-08-02).

## Question parameterization — different numbers per printed version

**What:** Templated question variants: the same authored question with per-version
parameter values ("solve 3x + 5 = 20" vs "solve 4x + 7 = 31"), so randomized print
versions (S5.5) differ in CONTENT, not just arrangement.

**Why:** S5.5's version feature shuffles arrangement only (MC choice order, matching
bank, ordering items). A teacher fighting copying gets far more from different numbers.
The author asked for this during the S5.5 eng review and explicitly deferred it as its
own arc (ruling D5, 2026-08-03).

**What it needs (why it's an arc, not a task):** schema for parameter definitions and
constraints; per-instance answer computation (the answer key must be derived, not
authored, for parameterized blanks/MC); editor UI for authoring templates; grading
implications if parameterized activities ever meet the live check path; print-version
seeds extended to select parameter instantiations deterministically.

**Depends on:** S5.5 shipped (version selector + deterministic seeds are the natural
substrate). Wants its own design pass + eng review.

**Context:** surfaced in the S5.5 /plan-eng-review (2026-08-03) when the author asked
whether "versions" meant different questions; ruled out-of-slice, captured here.

## Batch print: all versions + answer keys in one job

**What:** A "Print all versions" action producing ONE print job containing Version
1..N sheets (optionally each version's answer key appended), instead of N separate
print-dialog runs.

**Why:** A teacher printing 3 versions for a class runs 3–6 print dialogs today
(version × key). Real time-saver once versions see classroom use.

**How (sketch):** sequential `window.print()` calls are browser-blocked; the workable
shape is a composed multi-version document — render each version's worksheet
(offscreen, same capture path the foldable uses post-S5.5), concatenate into one
printable document with per-version page breaks. The foldable's compose/iframe
machinery is the pattern.

**Depends on:** S5.5's version feature shipping AND seeing real use — demand-triggered.

**Context:** surfaced in the S5.5 /plan-eng-review (2026-08-03, decision D22).

## Editor load path and the schema upgrade seam

**What:** When the first real schema migration lands in `packages/schema/src/upgrade.ts`,
check the EDITOR's activity-load path runs the upgrade seam before parsing drafts.

**Why:** S5.5 wires the seam into the teacher print route (ruling D23, 2026-08-03), but
the editor loads drafts the same direct way. Zero impact today (zero migrations exist);
the day migration #1 lands, an un-upgraded old draft would fail the editor's parse.

**Where to start:** the editor's load in `packages/app/src/routes/ActivityEditor.tsx`
(or wherever draft_content is parsed) — mirror what the S5.5 print route does.

**Depends on:** the first schema migration existing. Until then this is a no-op.

**Context:** surfaced in the S5.5 /plan-eng-review (2026-08-03, decision D23).

## Field measurement of student-interactive on real Chromebooks (post-S9, compliance-gated)

**What:** Collect real-user timings of the `performance.mark('student-interactive')`
mark (landing with S8) from actual student devices, once the compliance posture
allows it.

**Why:** S8's throttled lab lane is a proxy; the mark was deliberately designed so
lab and field speak the same vocabulary (S8 ruling D2/R2 — the mark contract is
additive-only precisely so historical comparison survives). Real Chromebook numbers
are the ground truth the lab run approximates.

**Hard gate:** this is data collection from students. The backlog already rules that
behavioral telemetry waits until (a) the census cannot answer a concrete question AND
(b) the compliance pack is amended. Performance timing is thinner than behavioral
telemetry but it is still collection — the same two-part gate applies. Do NOT ship
quiet student telemetry as a perf-slice side effect.

**Where to start:** the mark already exists (S8, viewer instrumentation); collection
would be a small beacon + an amendment to docs/compliance/. Scope the retention and
aggregation before any write path exists.

**Depends on:** S9 cutover (students on the viewer at scale) + the compliance-pack
amendment.

**Context:** surfaced in the S8 /plan-eng-review long-term audit (2026-08-05, T1
ruling; rulings in the gstack design doc → S8 section).

## Privacy-guard content hash (after the compliance-pack rewrite)

**What:** Strengthen the compliance-pack guard from string-presence (`toContain`) to a
content hash over the student-facing pack files + the rendered `Privacy.tsx` text,
pinned beside `POLICY_VERSION` — so wording and version can only move together.

**Why:** The current guard asserts presence only, and the S1 audit found the
assertion-text tests are tautologies (they compare the constant to itself) — a material
wording edit without a version bump passes everywhere, which defeats
`assertion_text_version`'s entire purpose (distinguishing wording generations on the
legal record). The 2026-08-06 eng review ruled the first real POLICY_VERSION bump
(B10/B11); after that rewrite the wording is finally load-bearing enough to deserve a
real guard.

**⚠ Sequencing (the reason this is a TODO and not part of the rewrite):** land it
AFTER the D2/D3 pack rewrite — hashing the current text would pin the drift the rewrite
exists to fix. Kept out of the rewrite commit itself so the legal-wording diff stays
reviewable by the author without mechanical guard noise (eng review D23).

**Bonus in the same visit:** delete the tautology tests (`classes.test.ts:108` and
friends) the hash guard supersedes; add a one-line howto in the test for re-pinning the
hash on a deliberate wording change (the friction is the feature).

**Where to start:** the presence-only guard the privacy-version test already runs;
`packages/app/src/lib/policyVersion.ts`; `docs/compliance/*.md`.

**Context:** eng review 2026-08-06 (D23), from s1-retro audit findings 9/12.

## Drop the dormant `assignments` table (Classroom-integration arc)

**What:** Drop `assignments` (and its indexes/policies) when the Phase 3
Google-Classroom arc re-derives assignment shapes.

**Why:** The table has ZERO app consumers (grep-verified 2026-08-09: nothing in
packages/app or packages/viewer references it), carries Google-Classroom text-id
columns from a never-built integration sketch, and after S9 Drop 3 its last SQL
consumer (the ingest RPC's token→assignment lookup) dies too. Dead schema misleads
every future reader — but dropping it touches `submissions` FKs, which the parked
teacher-grading slice hasn't ruled on, so S9 deliberately leaves it dormant
(s9-cutover.md D-2: "leave assignments dormant").

**Pros:** removes a whole dead subsystem from the schema. **Cons:** FK surgery on
`submissions`; pointless to do before the Classroom arc decides what replaces it.

**Depends on:** S9 Drop 3 landed; owned by the Phase 3 Classroom-integration arc.

**Where to start:** `supabase/migrations/0001_initial_schema.sql:150-169` (the
table), `0009:255` (index), `0002:169-176`/`0013:166-172` (policies);
`submissions.assignment_id` FK.

**Context:** S9 eng review 2026-08-12 (recon + D-2 ruling; TODO ask 2).
