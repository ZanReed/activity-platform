# TODOS

Deferred work items with enough context to pick up cold. Durable backlog lives in
ROADMAP.md; this file is for concrete, near-term follow-ups surfaced during reviews.

## The `sw` lane fails while the local Supabase stack is running (2026-08-14)

**What:** With `supabase start` up, the two offline-reopen rows in
`e2e/sw/service-worker.e2e.ts` (`a student who lost the network still gets their
worksheet`, `with no saved copy, offline fails honestly rather than hanging`)
time out waiting for `[data-banner="offline-copy"]` — 20 s, element never found.
Stop the stack and the same lane passes 7/7. Reproduced both ways.

**Why it is recorded, not fixed:** it is a local environment interaction, not a
product defect. CI never runs the local stack (the integration lane is
local-only), and CI ran these two rows green in 31795715961 with identical app
code. The likely mechanism is contention — the rows kill a disposable preview
server and race a service-worker fetch, and the Docker VM makes that timing
much worse — but that was not proven, so treat the mechanism as a hypothesis.

**Practical consequence, worth knowing before it wastes an hour:** after running
`test:e2e:integration`, `supabase stop` before running a plain sweep, or the sw
lane will look broken when it is not.

**Related trap seen the same day:** heavy background load (a game client at ~80 %
CPU, plus Docker) turned a 40-second four-lane run into 14.5 minutes and failed
five `failure-matrix` rows that are green on a quiet machine — including rows
nobody had touched. **Local e2e timing results are not trustworthy under load;
CI is the arbiter.** Check `uptime` before believing a local e2e failure.

## Canvas blocks add ~17 keyboard stops — Check sits 76 tabs in (S9 Drop 5 follow-up)

**What:** On the fixture worksheet (every block type, all lazy blocks mounted), a
student tabbing from the top of the document reaches the first blank at stop 3 and
the section's **Check** button at stop **76**. The canvas blocks contribute ~17 of
those: 12 `viewer-graph__canvas` + 3 `viewer-data-plot__canvas` + 2
`viewer-number-line__canvas`, and JSXGraph adds further focusable descendants.

**Why it is only a finding, not a bug:** every one of those stops has an accessible
name, so it is not a WCAG violation and axe is clean — the a11y lane passes. It is a
UX question, not a conformance one.

**Why it was invisible until now:** the a11y lane's axe scan ran against the
PRE-mount DOM (the lazy tier renders nothing at all until its chunk resolves), so
nobody had ever measured the mounted tab order. Made deterministic 2026-08-14; the
measurement above is from that mounted state.

**The actual question when this is picked up:** how should a canvas block expose its
handles to the keyboard? Options run from a single roving-tabindex entry point per
board (one stop, arrow keys within) to a skip-link past the canvas. That is a design
pass, deliberately NOT smuggled into a CI-green commit (author-ruled 2026-08-14).

**Watch item:** `e2e/a11y/student-surfaces.e2e.ts` derives its Tab budget from the
page's focusable count, so adding block types will not silently re-fail the row —
but a large jump in that count is the signal this got worse.

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

## ⚰ MOOT at S9 (struck 2026-08-13) — Anonymous assignment-link validation at page load

**Why struck:** this entry proposed a new anonymous endpoint so PUBLISHED PAGES
could preflight `?a=` assignment links — the entire world it serves (published
static pages, the anonymous wire, get-feedback as the precedent to copy) is
demolished by the S9 cutover (plan: docs/design/s9-cutover.md, Drops 3/4;
rulings D-5/D-6). Students reach activities through the signed-in viewer at
`/a/:id`; there are no anonymous assignment links left to validate. Kept (not
deleted) because the September-observation trigger below names Kia/Felice
classes — if a *viewer-era* dead-link problem ever appears, it is a NEW design
against `class_activities`, not this endpoint. Original entry follows for the
record:

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

## The check-rollup ARMING arc — build the rollup, then arm the (already-shipped) prune

**What:** Migration 0035 (2026-08-16) shipped the `section_checks` prune DISARMED with a
schema-encoded gate: `prune_section_checks` refuses every row until `analytics_job_runs.rolled_through`
is non-NULL, and NOTHING writes that column until this arc builds the rollup. Arming the prune
early is therefore mechanically inert, not just forbidden (ruling D11). This arc builds the
durable analytics rollup, backfills it, lets the watermark advance for N green nights, and only
then arms the prune (the author flips the cron command to `prune_section_checks(false)`).

**Trigger:** real check growth on the `analytics_job_runs.section_check_rows` ledger (still 0 as
of 2026-08-16 — 11 runs, all zero). No date; read the ledger.

**THE RULINGS ARE MADE — inherit, do not re-derive** (eng review 2026-08-16, D2–D12 + an outside
voice that overturned the build-now frame; full trail in
[check-retention-and-rollup.md](docs/design/check-retention-and-rollup.md) §5):
- **Item grain, two single-grain tables** (`check_rollup_daily` per version/day: checks, students;
  `check_item_rollup_daily` per version/day/item: verdict counts, students). `census_key` resolved
  at READ time via `activity_version_items` so a re-census re-attributes rolled history. FKs
  CASCADE from activities AND versions; 0026 §B's no-student-identifier assertion extends to both;
  zero RLS, DEFINER reads, **activity-scoped ownership gates only** (0035's header states this as
  a checkable claim).
- **The rollup rides `run_analytics_maintenance()`** (no third cron job): sweep → roll → advance
  watermark, `rolled_through` written coalesce-forward on EVERY ledger row.
- **MVCC watermark lag ≥ 5 min**, honestly framed: it shrinks (not closes) the in-flight-transaction
  hole; state the bound and consider `idle_in_transaction_session_timeout`.
- **Per-teacher timezone:** `users.timezone` (IANA text), default `America/Chicago`, the author's
  row set to `Pacific/Auckland`; `analytics_day(ts, zone)` keyed on the activity OWNER's zone (the
  platform spans the US and New Zealand — no single constant works). ⚠ **Validate the zone**: it is
  user-editable text in the nightly job's path — check against `pg_timezone_names` at write AND
  exception-guard to the default in the job (one bad row must not kill the nightly run — the 0022
  failure class), with an invalid-zone verify row.
- **Split-day re-rolls:** every owner-zone day spans ≥2 nightly runs (03:30 UTC is mid-afternoon
  NZ); delete-then-insert per (version, day) must recompute the FULL day from raw rows, so
  `PRUNE_HORIZON` (30d, floor 7d — the bond in 0035) must stay ≫ the day-completion lag. Verify
  row: a day split across two runs. Re-derive the cron hour while here.
- **Purge v4:** `purge_soft_deleted` is NEVER blocked by the watermark (retention outranks
  analytics); it reports unrolled-destroyed counts **on a ledger row**, never the NOTICE (0026
  established notices are unreadable).
- **`rebuild_check_rollup(p_from date)`:** rebuild ≡ incremental, including after a re-census;
  every shape decision stays reversible until arming.
- **Per-key `students` becomes latest-grounded at arming** (no code change — the live query over
  surviving rows already computes it); the deliverable is the panel-copy disclosure. Daily
  `students` columns are per-day trend figures; **no RPC may offer their sum** (uniques don't
  compose; `hll` is unavailable on Supabase, checked 2026-08-16).
- **`*_latest` is NEVER rolled** — it stays live-computable forever (F2); the rollup carries the
  flow family only, and `get_activity_analytics` v2 reads rolled + raw across a single-sourced
  `>=`/`<` boundary.

**The arming checklist** (also in 0035's header): rollup built per the above → backfilled →
watermark advancing for ≥ N green nights (read the ledger, not the registration — P3) → verify-0035
re-run plus this arc's own matrix → **counsel packet Q10 answered** (n=1 aggregates; asked
2026-08-16) → horizon re-checked → cron flipped.

**P5 debt this arc owes:** 0026:106 ("nothing prunes section_checks today") and 0022's header
become FALSE at arming — applied migrations are immutable, so this arc's migration header must
name and supersede both claims. Also flip verify-0035 §A's `rolled_through_never_written` row to
this arc's own expectations (the row is designed to go red when the rollup lands).

**Depends on:** 0035 applied (shipped, pending author apply as of 2026-08-16); real classroom
traffic to validate the shape against — the one thing the 2026-08-16 review could not have.

**Where to start:** [check-retention-and-rollup.md](docs/design/check-retention-and-rollup.md)
(§4 checklist, §5 rulings), then 0035's header, then `scripts/verify-0035.sql` §C for the fixture
idiom this arc's matrix extends.

**Context:** the original entry (2026-08-01, S4 review) waited months on the attempts-vs-latest
ruling; teacher-grading G2 ruled it 2026-08-15, the 2026-08-16 eng review ruled the rollup's shape,
and its outside voice overturned "build the rollup now" into "prune disarmed now, rollup at arming"
(D10) — the frame this entry now records.

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

**⚖ RULED 2026-08-15 (author, closing gate 9's last open item): TRACK ONLY for now.**
No shrink work; the number gets recorded whenever it moves (it is priced per-addition
already: 168.4 → 173.0 → 173.5 → 174.0/185 through the S9 drops), and **the decision on
what is realistically achievable — if anything — happens at the end of the refactor**,
once the arc's remaining teardown settles. Until then this entry is a ledger, not a task.
The s8-retro's item-8 warning stands recorded: the audit's drift-to-185 scenario is the
thing the per-addition pricing exists to prevent.

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

## Integration lane in CI (S9 Drop 5 deferral, DX ruling P6)

**What:** The `integration` Playwright lane (real `supabase start` stack, real
trigger/RLS/RPCs/Edge Functions — `packages/app/e2e/integration/`) is
LOCAL-ONLY by ruling: CI would need Docker-in-Actions + a supabase stack per
run, which the verify-runner's no-live-DB-in-CI posture deliberately avoided.

**Trigger to adopt:** the first regression that the integration lane catches
locally but CI missed — at that point the lane has proven it earns its CI
minutes; wire it as a separate workflow job with `supabase/setup-cli` +
`supabase start`, keyed E2E_INTEGRATION=1.

**Until then:** run `pnpm --filter @activity/app test:e2e:integration` before
cutover-adjacent pushes; the preflight prints named fixes on a cold machine
(verified 2026-08-14 — Docker-less run produced the exact fix text).

## ✅ RESOLVED 2026-08-14 (S9 Drop 5, D-9): offline reopen PROVEN — and the worker WAS broken

**The "Where to start" hunch below was right, twice over.** The server-stop
harness (an in-test child-process preview server killed mid-test —
`e2e/helpers/disposablePreview.ts`) reproduced the failure against a genuinely
dead server, and the diagnosis found a REAL product bug: static hosts send
`Vary: Origin` on assets (vite preview does; CDNs can) and `Cache.match`
HONORS Vary — parse-time `<script type=module>`/`<link>` requests carry a
different Origin-header shape than the stored key, MISS the cache, and hit
the dead network. That was the whole "fetch() 200s while parse-time dies"
mystery: page-script fetch happens to match the stored shape. Fix:
`matchOptions: { ignoreVary: true }` on the CacheFirst route (the assets are
content-hashed — the hash IS the identity), proven red→green. Two more
harness findings, both encoded in the un-parked rows' comments: a page that
ever carried `page.route` handlers blocks the worker from serving a
NAVIGATION even after `unrouteAll` (the reopen runs in a FRESH page — which
is also the honest student story), and a `fill()` racing a navigation loses
the debounced buffer write (the kill now waits until the buffer provably
holds the work). Both rows green 5/5 solo + 3/3 full-lane. The un-parked
rows in `sw/service-worker.e2e.ts` are the living record; the original
parking note survives in git history. Original entry kept below for the
reasoning trail.

**What (original):** Get the two parked rows in `packages/app/e2e/sw/service-worker.e2e.ts`
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

## Integration e2e lane into CI (post-S9)

**What:** Run the S9 integration Playwright lane (real local Supabase via
`supabase start`, password-users-through-the-real-trigger sessions) in GitHub
Actions — docker service + stack boot + `supabase db reset` + the lane.

**Why:** The lane is the only automated proof of the app↔function↔RLS wire
contract (the A1 check-URL bug class). Local-only means it proves things only
when someone remembers to run it.

**Why not at S9 (DX ruling P6, 2026-08-12):** CI adoption adds the arc's
flakiest new surface (2min stack boot, docker-in-CI) during the exact weeks the
cutover needs CI trustworthy — the same accepted posture as the verify runner's
no-live-DB-in-CI.

**Trigger:** first time the lane catches a regression locally that CI missed,
OR the first post-cutover slice that touches auth/RLS/RPC surfaces.

**Where to start:** `.github/workflows/ci.yml` (the e2e job's shape),
`packages/app/playwright.config.ts` (the integration project),
`supabase/config.toml` (local stack config). The lane's preflight already
prints its own prerequisites.

**Context:** S9 DX review 2026-08-12 (Pass 6 ruling P6); eng review T1 ruled
the session mechanism; docs/design/s9-cutover.md §9.

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

## Student Home cross-class recency cue ("New this week")

**What:** A recency indicator on the student Home activities list — e.g. a quiet
"New" marker on rows added in the last ~7 days — so a student in many classes can
find today's work without scanning every class section.

**Why:** The S9 Drop 2 design ruled per-class newest-first as the complete v1
answer (DR-11, 2026-08-13): students launch with 1–2 classes, and an unvalidated
recency heuristic would be decoration. Past ~3 classes the scan cost becomes
real; this entry is the named lever so the gap is a decision, not a bug report.

**Trigger:** real multi-class usage exists (students in 3+ classes with active
sharing), or a student/teacher asks how to find "what's new".

**Pros:** one glance answers "what's new"; no layout change (a marker on
existing rows). **Cons:** "new since when?" needs a definition (added-at age vs
last-visit tracking — the latter is new per-student state); an age-based marker
lies to a student who already did the work.

**Where to start:** `packages/app/src/routes/Home.tsx` (StudentHome list rows);
`list_class_activities` already returns `added_at`, so an age-based v1 needs no
schema change. The design record is docs/design/s9-cutover.md §10 (DR-11) + the
v2 board annotations.

**Context:** S9 Drop 2 design review 2026-08-13 (issue 11 / OV-23b; ruled 11A —
record v1 as deliberate + name the lever).

## Cap-lifting admin surface for attested teachers (0033 R3 follow-on)

**What:** A way to raise or clear the self-serve teacher caps without hand-written
SQL. Migration 0033 caps an attested (non-allowlist) teacher at **5 classes and
50 members per class**; `users.teacher_caps_exempt` lifts both. Today the author
lifts it with a one-row UPDATE.

**Why it is here and not still in §7:** the caps are LIVE and they bind a real
person the first time an outside teacher hits one. §7 deferred the UI on "waits
for the second real teacher", which is correct — what that reasoning does not
cover is the moment BEFORE the UI exists, when a legitimate teacher is blocked
mid-lesson and the only remedy is the author at a SQL prompt. That is a support
path, not a feature, and it should be a known one.

**Trigger:** the first attested teacher who is not the author — i.e. the first
time `teacher_caps_exempt` matters to somebody who cannot edit the database.

**Where to start:** the caps are enforced in 0033's audited create/join paths;
`scripts/verify-0033.sql` has the liveness rows that fire both caps at production
values, so any change has a working proof harness already. The interim runbook is
one UPDATE on `users.teacher_caps_exempt` — worth writing into the support notes
before it is needed rather than during.

**Watch:** lifting a cap is the one action that converts a self-attested stranger
into an unbounded teacher. Whatever the surface becomes, it should stay an author
action with an audit row, not a self-service button.

**Context:** docs/design/admission-model.md §5b R3 + §7; eng review OV-9.

## Under-13 support — the age gate and school-consent enrollment (D7)

**What:** The arc that would let a class with students under 13 use the platform:
a student-facing age gate (the Khan-style birthdate-before-anything pattern) plus
a school-consent enrollment mechanism that actually carries COPPA's school-consent
exception, rather than excluding under-13s outright.

**Why it is here:** v1 excludes under-13 use entirely, and the ONLY thing carrying
that exclusion is the teacher's per-class "every student in this class is 13 or
older" assertion. Students are never asked their age. That is a real dependency on
a teacher's accuracy, disclosed in the pack, and it is the single most likely thing
for counsel to push back on (it is Q4 of the counsel packet). If the answer comes
back "teacher assertion is not enough", this stops being a deferred arc and becomes
required work — so it needs an entry that a session can pick up cold.

**Trigger:** the D24 counsel read answering Q4 against the current design, OR a
teacher asking for a 6th/7th-grade class.

**Scope sketch (not a design):** birthdate gate before auth; a parent-consent
branch for independent learners; school-consent enrollment for school users; the
compliance pack rewritten around consent rather than exclusion; the
`school-authorization-template.md` checkbox that currently reads "not available in
v1" becomes live. Gimkit's and Khan's published wording are the closest models —
both were read and quoted in the design doc.

**Do NOT half-build it.** The current posture is coherent (exclude, say so
plainly). A birthdate gate WITHOUT the consent mechanism behind it would collect
ages from children while still refusing them, which is worse than either end state.

**Context:** docs/design/admission-model.md §5a D7 + §7; docs/compliance/
counsel-review-packet.md Q4.

## Signable DPA template for the first district

**What:** A data-processing agreement the author can actually put in front of a
district, rather than assembling one under time pressure during a first adoption
conversation.

**Why it is here:** Illinois SOPPA, NY Ed Law 2-d and their siblings require
signed per-district agreements for school-directed services — this is statutory,
not a nicety, and no gate design avoids it. §7 defers the template to "the first
district that asks (with counsel)", which is the right sequencing but a bad
surprise: the first district that asks will be mid-conversation, and the delay is
visible to them. The cheap version of this is to know, before that call, which
regime applies and what the template must contain.

**Trigger:** the D24 counsel read (Q7 asks exactly this — should a template exist
BEFORE the first outside teacher, or is on-demand right?), or the first district
conversation, whichever comes first.

**Where to start:** `docs/compliance/school-authorization-template.md` is the
teacher-facing half and already exists; the DPA is the district-facing half and
does not. The SDPC registry is the usual source of standard forms. This one is
genuinely counsel-led — the repo-side contribution is the data map, which is
current as of 0033 and is what a DPA's schedule is built from.

**Context:** docs/design/admission-model.md §5 item 5 + §7; docs/compliance/
counsel-review-packet.md Q7.

## Student feedback discoverability (the promise's second half)

**What:** A quiet indicator on the student Home / activity list when released teacher feedback
exists that the student hasn't seen — e.g. a "Feedback" marker on the activity row.

**Why:** The teacher-grading slice's readback is pull-only: a student only finds released
feedback by spontaneously reopening a finished worksheet. The outside voice's sharpest strategic
point (2026-08-15): "Recorded — your teacher will review" completes in PRACTICE only when the
review's OUTPUT is findable. Without this, released feedback mostly goes unread.

**Design-together constraint:** "unread" needs either a seen-marker (new per-student state) or an
age heuristic — the same fork as the "Student Home cross-class recency cue" entry above (DR-11).
Design the two indicators together; two separate marker systems on the same list rows is the
twin-drift class.

**Trigger:** the first real released feedback (i.e. the teacher-grading slice live with a real
class), or the recency-cue entry's own trigger firing — whichever first.

**Where to start:** `list_class_activities` (0030) already returns the student's rows; a derived
"has unread released feedback" flag is a join against `check_grades.released_at`. The no-new-state
v1 is age-based ("released since your last check"), which lies less than it sounds because
re-checking is the natural reaction to reading feedback.

**Context:** docs/design/teacher-grading.md (Why-now + G5); outside-voice finding #14, ruled
2026-08-15 (TODO, not slice scope).

## Retire the `submissions` table (the last 0029 survivor)

**What:** A housekeeping migration dropping `submissions` (and its 0005/0007 attempt machinery),
removing purge_soft_deleted's step 2, and running the P5 citation audit over everything that
names the table.

**Why:** 0029 kept `submissions` + `grades` empty "for the parked teacher-grading slice to
re-decide." That slice re-decided 2026-08-15: grading is checks-native, `grades` +
`can_grade_submission` die in 0034 — which leaves `submissions` with NO future consumer: an
empty table with live RLS whose only remaining reader is the purge function.

**Why NOT bundled into 0034 (author-ruled 2026-08-15):** dropping it means rewriting
`purge_soft_deleted` a third time — blast radius on the nightly cron — and it sits nowhere on
the grading slice's path. The purge function deserves its own careful commit.

**Trigger:** 0034 applied live + one green nightly purge run after it (proving nothing re-keyed
onto submissions).

**Where to start:** 0029's header (what deliberately survived and why), 0022+0029 for the purge
function's history, `scripts/verify-*` for every row that asserts the table exists. Remember the
0009 discipline: the FK-covering indexes die with it.

**Context:** teacher-grading eng review 2026-08-15 (G1 scoping + TODO ruling); 0029's D-6 note.
