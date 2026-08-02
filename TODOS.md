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

**Where to start:** `supabase/migrations/0010_grades.sql` (the `submission_id`-keyed table +
`can_grade_submission` helper + the dual-path RLS precedent already written for the assignment
world), and the Phase 2.6 teacher grading UI (side-by-side + Needs-grading filter) that will be
re-pointed.

**Context:** surfaced by /plan-eng-review 2026-08-01 (S4 review, outside-voice findings 5+6 →
ruled tension T2, TODO ask 1). Full rulings: the S4 section of
`~/.gstack/projects/ZanReed-activity-platform/user-main-design-20260728-components-as-data.md`.

## `section_checks` retention / GC

**What:** A pruning story for `section_checks`, ridden on the same scheduled job as the
already-earmarked read-cache GC.

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

**Depends on:** S4 shipping `section_checks`; S7's scheduled aggregation existing; ideally the
teacher-grading slice's attempts-vs-latest ruling.

**Where to start:** finding R6(a) in the components-as-data design doc, plus the per-student rate
ceiling S4 puts inside `record_check` (the same indexed count over a trailing window is the
natural place to observe real growth rates).

**Context:** surfaced by /plan-eng-review 2026-08-01 (S4 review, outside-voice finding 2, TODO
ask 2).

## Eager-load KaTeX if S8 measures it cheap (closes the browser-menu print race)

**What:** When S8's perf-budget CI produces real chunk-cost numbers on Chromebook-class
throttling, decide whether math-bearing pages should eager-load the KaTeX chunk instead of
lazy-loading it (a deliberate amendment to DX ruling D16's eager-statics/lazy-heavies split).

**Why:** S5 ruling S5-2 put a readiness barrier on the viewer's own Print action, but the
browser's File→Print / Ctrl+P flow cannot be awaited — a student printing in the first
moments after load can get the readable-LaTeX fallback on paper instead of rendered math.
Accepted as a residual because the fallback is legible and the window is sub-second; eager
loading would erase it entirely if the chunk turns out to be cheap.

**Pros:** kills the last print race for free if the measurement supports it.
**Cons:** grows first-load on math-bearing pages; amends D16, which exists to protect
Chromebook TTI — hence measure-first, never a print-slice side effect.

**Depends on:** S8 (perf-budget CI) landing its measurements.

**Where to start:** the D16 chunk-policy declaration in the viewer registry
(`packages/viewer/src/registry/` binding eager/lazy axis) + S8's numbers; the residual is
recorded in the S5 eng-review section of the components-as-data design doc (ruling S5-2).

**Context:** surfaced by /plan-eng-review 2026-08-01 (S5 review, Issue 2 + outside-voice
finding 6; TODO ask approved).

## SW precache-manifest budget row in S8's perf-budget CI

**What:** When S8 (perf-budget CI) lands, add a row asserting the vite-plugin-pwa
generated precache manifest stays within a byte budget and an entry-count budget.

**Why:** The S6 eng review (2026-08-02, ruling 10A) restricted the service worker's
precache to the core shell only — lazy heavies (KaTeX, graph-kit, editor chunks) are
runtime-cached on first use, preserving the D16 eager-statics/lazy-heavies chunk policy.
Nothing *enforces* that ruling: one careless `globPatterns` edit silently re-inflates
every student's first visit to multi-MB over school Wi-Fi, and nobody notices until a
classroom complains. Same silent-regression class the bundle-size ceilings already guard.

**Where to start:** `.github/workflows/ci.yml` next to the bundle-drift guards; read the
generated `dist/` precache manifest (generateSW embeds it in the built worker; vite-plugin-pwa
also exposes it at build time) and compare against the two budgets.

**Depends on:** S6's SW drop landing first (the manifest must exist to measure). S8 owns
the suite this joins (D16's chunk-regression budgets).

**Context:** surfaced by /plan-eng-review's S6 pass, 2026-08-02 (performance finding 10 +
TODO ruling D19).

## Split the 3 MB app entry chunk before students meet it

**What:** Code-split `packages/app` so the student viewer route does not download
the teacher editor. Today the entry chunk is ~3 MB (plus a 149 KB entry CSS) and
`dist/assets` totals 7.2 MB across 170 files.

**Why:** Measured during S6 V8 while sizing the service-worker precache. A student
on school Wi-Fi currently pays for Tiptap, the editor UI, and every authoring
surface to answer a worksheet. The SW makes the SECOND visit cheap, which is
exactly why the first visit's weight is now the thing that matters — and S9's
cutover puts every student on this bundle. It is also what forced V8's precache
down to the navigation document alone: a "shell" glob is not meaningful while the
shell is the whole app.

**Where to start:** `packages/app/src/App.tsx` — the route table eagerly imports
both `StudentViewer` and the editor routes, so nothing can tree-shake them apart.
`React.lazy` per route group is the obvious first cut; measure with
`vite build` + `dist/assets` sizes before and after. Registry-driven block chunks
(D16 eager-statics/lazy-heavies) are already lazy and are NOT the problem here.

**Depends on:** nothing technically. Naturally belongs with **S8** (perf-budget
CI), which is where a regression guard for it would live — pair it with the
precache-manifest budget row already queued above.

**Context:** surfaced by /plan-eng-review's S6 build, V8 (2026-08-02).

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
