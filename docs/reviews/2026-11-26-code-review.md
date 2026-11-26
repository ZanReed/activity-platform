# Whole-repo code review — 2026-11-26

Asked for by the author: find inefficiency, design decisions that will cost
later, and platform updates we missed. Nothing was changed; this is the log.

**How it was done.** Five read-only reviewers took one area each (database,
server and Edge Functions, app routes and data, authoring pipeline, viewer and
graph-kit). Dependencies, CI, live database advisors and repo hygiene were
checked directly. Every finding was grepped against `TODOS.md` and
`docs/DECISIONS.md` first, so what is here is **not already tracked** unless a
line says so. The items marked ✔ were re-read in the code after the reviewer
reported them; the others stand on the reviewer's reading. Nothing was measured in
a browser or against a database, so costs are argued from code.

At HEAD `96584ece`, CI green. Sizes: app 152k lines, viewer 63k, SQL 35k,
scripts 37k, graph-kit 24k, schema 12k.

Effort: S = under a day, M = a few days, L = a week or more.

---

## A. Defects found (these are bugs, not debt)

> **Fixed 2026-11-26, same day (author: "Yes, fix them"):** A0 (new, below), A1,
> A3, A4, A6 and A7 except the touch-scroll item. Also fixed on the way: the
> data-plot half of A2 (restore was a no-op). **The rest of A2 was fixed the
> same day** (graph, number line, maths gaps; see A2 below). **A5 was fixed
> the same day and is LIVE:** 0104 applied and verified on live, pushed at
> `90bee0eb`; the seven reads that grow the same way followed in 0106
> (`757a98a1`, LIVE). See A5 below.
> **Still open:** A7's touch scrolling (needs an iPad). Both Edge Functions need
> a redeploy for the server-side fixes to reach students (STATE → Pending
> author actions). **Not checked in a browser:** the graph freeze was tested against
> fake boards and the kit's own lock, not by dragging a real handle; and the
> maths retry is proven in unit tests only, where the failure is injected after
> the module loads. Chromium has at times remembered a failed `import()` for the
> life of a page, in which case the retry would do nothing there. Worth one
> check on a Chromebook with request blocking before crediting it (P3).

### A0 Histogram and box-plot questions have never recorded an answer
Found while writing A1's test, and worse than A1. In
`graph-kit/src/data-plot-question.ts` each chart's branch declared its own
`function build` inside an `if` block. In a module those are block-scoped, so
the change hook resolved to the dot plot's `build`, whose board is never
initialised on the other two paths: **every change to a histogram or a box plot
threw a ReferenceError inside the board's event handler.** The bars and handles
moved on screen and nothing was stored. Nothing in the repo mounted this
function in a test. Dot plots were unaffected. Fixed with one `build` binding
assigned per branch; `viewer/tests/components/canvas-seam-real-kit.test.tsx`
now runs all three charts through the real kit, the seam and the grader.

### A1 ✔ A "build a box plot" question can never be marked
The kit reports the five handles as an object
(`graph-kit/src/data-plot-board.ts:711`), the viewer's seam only reads arrays
(`viewer/src/blocks/kitSurfaces.ts:311-318`), so the stored answer is `[]` and
the grader returns "unanswered" for fewer than five values
(`viewer/src/server/grading/graphs.ts:511-515`). No test drives a box plot
through this seam. Authorable and importable today.
**Fix:** map `studentFive` to `[min,q1,median,q3,max]`; type the seam against
the kit's response type instead of `as unknown as`; one test per `data_plot`
variant that runs real kit output through `gradeSection`. **S.**

### A2 ✔ Graph, number-line and data-plot answers are not restored faithfully
- The canvas blocks read the store once at first render and never subscribe
  (`InteractiveGraph.tsx:69`, `NumberLine.tsx:50`, `DataPlot.tsx:63`,
  `MathBlock.tsx:94`), so a server restore, a tab hand-back or a DoL form start
  that lands after mount is shown by text blanks and not by boards.
- The seam's `restore(points)` drops shape, endpoint style, side, "no
  solution", domain and interval; the kit then fires `onChange` and the
  defaults are written back over the saved work.
- ✔ Data-plot restore is a no-op: `handle.restore(values as never)`
  (`kitSurfaces.ts:304`) passes a number list where the kit expects an object.
  After a reload the plot is empty while Check still grades the old answer.

**Fix:** `restore(work)` carrying the whole saved work, a silent restore in the
kit that does not emit, blocks subscribe and re-apply. Remove the `as never`.
**M.** (The "warm re-entry may start empty" part is unverified.)

> **✔ Fixed 2026-11-26 (second pass).** Each claim was reproduced against the
> REAL kit first: JSXGraph mounts in jsdom, so
> `viewer/tests/components/canvas-restore-real-kit.test.tsx` drives the real
> graph and number-line boards through the block, the seam and the store, and
> every guard was mutation-tested (revert → red → restore).
> - **Worse than claimed, and the root:** the kit's ungraded mode (the only
>   mode the viewer mounts) never REPORTED a ray's or segment's shape and
>   endpoint styles, or an inequality's line style and side: that code sat
>   inside `if (key)` branches in `graph-question.ts`. So the server has been
>   calling every `plot_ray`/`plot_segment` answer unanswered and every
>   `graph_inequality` wrong, before any reload. A vertical boundary also
>   offered "Shade above/below". Fixed in the kit; scoring stays key-only
>   (`graph-kit/tests/ungraded-choices.test.ts`).
> - **Restore drops the extras:** confirmed. The seam now restores the whole
>   `GraphWork` (`toGraphRestore`, `toNumberLineRestore`, typed against the
>   kit's own restore parameters). A number-line interval was never restored
>   at all: it is stored with no points and the block keyed the restore on
>   points.
> - **The restore echo overwrote saved work:** confirmed (the echo carried the
>   board's defaults). Dropped in the seam, not the kit: the restored work is
>   already in the store, one flag covers all three kits, and the kit's other
>   callers keep their contract.
> - **Blocks never followed a later store change:** confirmed for graph,
>   number line, data plot, `MathBlock` and `InlineMathGaps`.
>   `blocks/useFollowStored.ts` remounts the widget when the stored value stops
>   matching what it shows (a restore can only add state, so a remount is the
>   only way to show exactly the stored work). Pinned with fake surfaces in
>   `canvas-follow-store.test.tsx`; render-scope is unchanged.
> - **Tab before any answer was stored as one** (graph and number line, as for
>   data plots): fixed; once work is stored, an unanswered report is a real
>   retraction (a cleared transform equation) and is still recorded.
>
> No server bundle moved, so no Edge Function redeploy: this reaches students
> on the next SPA push. **Not checked in a real browser:** jsdom has no layout,
> so no drag was tested, only the boards' own pills and keyboard.
>
> **✔ Two neighbouring gaps found during that pass, fixed the same day
> (author: "Fix it" on both).** Neither was live (0 such questions in the 10
> live activities), and both were authorable in the editor:
> - **A curve with a range** ("y = x² for x ≥ 0"): the endpoint handles and
>   style toggles hung off the key, so the viewer never showed them, and the
>   grader ignored the range. The sanitizer now serves WHICH ends are bounded
>   (`questionShape.domain`, booleans only; the bound and its style stay
>   stripped), the kit draws the ends from it, and the grader scores the range
>   with the kit's `scoreDomain`.
> - **Systems** ("graph both lines", a system of inequalities): both system
>   boards required the key, so the viewer mounted the one-part board and
>   every system was marked wrong. The sanitizer serves each part's family
>   (`questionShape.partFamilies`), both system boards gained an ungraded
>   mode, and the seam routes to them, carries their parts out and restores
>   them. An unpicked side is now reported as unpicked, not as 'above'.
>
> Pinned end to end (authored block → sanitizer → real board → store →
> grader → reload) in `canvas-systems-domain-real-kit.test.tsx`; eight guards
> mutation-tested. `SANITIZER_ALGO_REV` 7 → 8; both bundles regenerated, so
> `get-activity` and `check-activity` were redeployed 2026-11-26; both
> deployed bundles hash-match the repo.

### A3 ✔ A locked or frozen section does not freeze its graphs
The freeze is `<fieldset disabled>`; its CSS covers only
`input, textarea, select, button` (`viewer.css:329-337`). `setLocked` exists on
the seam and nothing calls it. After "Check and lock" a student can still drag
handles; the server refuses the re-check so marks hold, but the screen, the
saved buffer and the "N answered" count drift from what was graded.
**Fix:** a `useSectionFrozen` hook that calls `setLocked`, plus the pointer
rule for `[data-graph-canvas]`. **S–M.**

### A4 ✔ A thrown error in the two hot functions reaches the browser with no CORS headers
`Deno.serve(handler)` is bare in `check-activity/index.ts:281` and
`get-activity/index.ts:153` (photo-handoff does wrap). Reachable today: a
video-pause body carrying a `photos` entry throws `PhotosMismatchError`
uncaught (`video-pause-handler.ts:161`). The browser reports a network failure,
so the client cannot tell a server bug from being offline.
**Fix:** catch inside the handler factory, return the typed 500, log. **S.**

### A5 ✔ The grading queue is silently cut at 1,000 rows
`list_grading_queue` (latest: `0099_photo_pilot.sql:601`) returns one row per
student × version × section × hand-graded block, all versions, released rows
included. `supabase/config.toml` sets no `max_rows` and the app has no
`.limit`/`.range` anywhere. 150 students × 4 free responses × 2 versions is
1,200 rows; the rows dropped are older-version students, with no error. The
same trap was fixed one at a time in 0043 and 0060. `listTeacherClassActivities`
has the same shape (5 sections × 200 activities).
**Fix:** return one jsonb or scope by class/version; add a script test that
lists every row-set RPC the app calls and requires a stated row bound. **S–M.**

**Fixed and LIVE 2026-11-26** (0104 applied, verify-0104 5/5 on live, re-runs
of verify-0034, -0042, -0096, -0097, -0099 green on live; pushed `90bee0eb`).
Reproduced on the local stack first:
150 students × 4 written answers × 2 versions gave 1,200 rows in SQL and HTTP
200 with 1,000 rows over PostgREST (`Content-Range: 0-999/*`, no error). The
cap is reachable without exempt teachers: 5 classes × 50 students × 4 answers
is 1,000 on one version.
- `grading_queue(activity)` returns `list_grading_queue`'s rows as ONE jsonb
  array, in its order (WITH ORDINALITY). One jsonb rather than paging, because
  the screen needs the whole queue at once (grouping, counts, a re-read after
  every save) and paging would rebuild the same array in N round trips. A
  wrapper rather than a restatement: 0099's body is untouched, so its 33
  verify-script call sites stay valid. SECURITY INVOKER, so the gates and
  error strings stay the inner function's. Same values, same order as the old
  response, checked on the 1,200-row fixture.
- **Two neighbours of the same defect, found by the new guard:**
  `list_grade_suggestions` (the same screen; one row per queue row) has a
  second wrapper, `grade_suggestions`. `work_photo_states` (one row per id
  passed in; the screen passed every photo id in the queue) is now asked in
  chunks of 500.
- `listTeacherClassActivities` is a TABLE read, not an RPC, with the same
  cut. It now pages 1,000 at a time in a total order (`class_id` completes the
  key). No migration.
- Guard: `scripts/tests/rowset-rpc-bounds.test.mjs` derives the row-set RPCs
  from the migrations (latest definition wins) and the called names from
  source (app, viewer, worker, Edge Functions). Each called one needs a stated
  bound, and the queue's two row sets may never be named again.
  Mutation-tested: deleting `list_bank`'s entry and calling
  `list_grading_queue` from `grading.ts` both go red.
- **No client fallback to the old RPC.** It would keep a truncating call in
  the app and need removing later; the apply-then-push order is the standing
  rule (OV-7).

**Follow-ups (not done):**
- *The re-read after every save is NARROWED (author: "fix the re-read now").*
  A Save or Confirm patches its one row from upsert_check_grade's reply
  (`lib/queuePatch.ts`); a Reject patches the draft's status; a DoL tick
  re-reads only the passes. A full re-read still happens for a Release, a
  draft that moved, a row that showed a newer grade from an older attempt
  (a re-save never moves `graded_at`), a Save while a load is in flight, and
  whenever nothing is left to grade in the view (author-chosen, so new answers
  still appear). The integration lane compares the patch to the real server's
  re-read field for field (mutation-tested). Responses cap 38 → 38.6 (author:
  "Yes, raise it").
- *The WATCH entries are FIXED and LIVE (0106, `757a98a1`; author: "fix all the
  watch entries now").* `list_bank`, `my_activity_progress`,
  `list_class_activities`, `list_class_members`, `dol_pass_status`,
  `list_deleted_classes`, and a seventh the review of 0106 found
  (`list_deleted_activities`, bounded only by the 30-day purge), each return
  one jsonb through a `*_json` wrapper. The guard has no WATCH category: a
  read that grows with use returns jsonb, and its row-set name is forbidden.
- *Offset paging can repeat a row* when a share lands between two page reads
  of a teacher with more than 1,000 class-activity rows. Rare; dedupe by
  (class, activity) if it ever shows.
- *verify-0035 §C is red on live, and not because of 0104.* Its clause 3/4
  counts `prune_section_checks()` candidates across the WHOLE database and
  expects exactly its fixture's 3; live holds 19 real candidates of its own (a
  rolled-back dry run with no fixture returned 19; 19 + 3 = the 22 it saw). The
  same over-scoping verify-0033's caps row had. **Fixed 2026-11-26:** §C now
  measures the real candidates under the same two watermarks before its
  fixture exists and asserts baseline + its own 2 / 3 / 3; 11/11 on local and
  live; mutation-tested (a wrong expected count goes red). On live the armed
  leg still deletes the real candidates inside its rolled-back transaction,
  which is B5's open question, not this row's. The prune is unarmed.
- *Playtest replay has no answer for the teacher's class-activity read.* That
  was already true before this change (the recording predates `due_on`); the
  new order and paging params move it further. Re-record `class-walkthrough`.
- *Table reads are not swept.* The guard covers RPCs only; other `.from()`
  reads that grow with use would need their own sweep.

### A6 "N answered" disagrees with the grader for graphs
`container/answered.ts:28-35` checks only `noSolution` and `points.length`;
the server's `isUntouched` and the buffer's `graphWorkTouched` agree with each
other and are test-bonded. This count feeds the "N questions are still blank"
confirm before a one-way lock. **Fix:** call `graphWorkTouched`. **S.**

### A7 Smaller
- `autoGradedIds` (`server/dol.ts:66`) and `gradedIdsOf`
  (`practice-handler.ts:368`) are two hand lists of "what is auto-graded" that
  already disagree on graphs. A family missed in the first is silently not
  required for a DoL pass. One function derived from the inventory. **S.**
- A failed lazy load of KaTeX is cached as a rejected promise for the session
  (`viewer/src/inline/math.ts:64`), and the comment in `mathPreload.ts:119`
  says components retry. One dropped request on school Wi-Fi leaves raw LaTeX
  until a manual reload. **S.**
- The `unsupported` roster in `container/blockIndex.ts` is declared, tested as
  `[]`, and nothing can ever push to it; the `default:` branch drops an unknown
  gradable type silently. A safeguard with no liveness (P3). **S.**
- A finger on a graph cannot scroll the page: JSXGraph sets
  `touch-action: none` unless `browserPan` is on, and it is set nowhere. Needs
  a real iPad to confirm. **S.**

---

## B. Security and hygiene

### B1 ✔ The public repo carries the R2 backup
`r2-final-backup-20260815/` is **tracked**: 283 files, 68 MB, including
`uploads/…webp`, added inside feature commit `f7aefee3` (2026-08-21).
CLAUDE.md says it is untracked. The repo is public. The pack is 74 MB, most of
it this folder.
**Recommend:** decide whether anything in it is sensitive (the pages are test
artifacts by the 2026-07-28 ruling; the one upload should be looked at). Then
`git rm -r --cached` and ignore it, keep the copy outside the repo. Removing it
from history needs a rewrite and a force-push, which is the author's call.
Also at the root: `s5.5-contact-sheet.zip` (692 KB, tracked), `HANDOFF.md`
(retirement already owed), and an empty `tail/` directory.

**Untracked 2026-11-26** (pushed `12733c5c`): `git rm -r --cached` plus a
`r2-final-backup-*/` line in `.gitignore`; the 283 files stay on disk.
**What it holds:** 131 HTML pages from the retired published-page era (nearly
all titled as tests, e.g. "[TEST] Print Stress Test — Algebra II", "test build";
the rest "Untitled activity" / "New Activity!"),
the old graph-kit and font builds under `shared/`, and the one upload. No
email address, no token or key, no student work, and no student or teacher
name except the author's first name once, typed as test text. The pages carry
the project ref (public in the app bundle anyway) and the URLs of two deleted
functions (`ingest-submission`, `get-feedback`), which answer nothing now. **The upload**
(`uploads/290f0951…/d0d2817d….webp`, 710×1000) is a novelty picture: a sloth
riding a pizza slice through space among tacos, with rainbow beams from its
eyes. It is not a person and not a student's image. It looks like commercial
third-party art, so redistributing it from a public repo is a copyright
question, not a privacy one.

**The history is unchanged; that is the author's call.** The files stay
readable at `f7aefee3`. *Correction (measured the same day):* they cost only
**7.7 MB of the pack**, because the HTML compresses heavily. The pack's bulk
is the committed Edge Function bundles' history (56 MB). The "68 MB" and "the
pack is 74 MB, most of it this folder" figures above are raw sizes, not what a
clone downloads. Purging them
means `git filter-repo --path r2-final-backup-20260815 --invert-paths` on a
fresh clone (filter-repo drops the `origin` remote; re-add it), then a
force-push of every branch and tag, not only `main`. The cost: every commit since 2026-08-21
gets a new hash, so the hashes cited in STATE, HISTORY, DECISIONS, the review
logs and the curriculum boundary page's stamps stop resolving. Every other
checkout and cloud branch has to re-clone. GitHub keeps the old objects
reachable from forks, cached views and old pull-request refs (`refs/pull/*`)
until support purges them. The repo
shrinks by about 8 MB. Leaving it costs little beyond the image question above.
Runbook and recommendation (leave it, unless the image's copyright matters):
[2026-11-26-b1-history-purge-plan.md](2026-11-26-b1-history-purge-plan.md).
**Decided 2026-11-26: history left as it is** (the author delegated the call;
the runbook stays for the case where the image's copyright matters). `s5.5-contact-sheet.zip` (tracked) and
`HANDOFF.md` are left as they were; `tail/` is an empty untracked folder.

### B2 ✔ Dependency advisories (`pnpm audit`: 3 critical, 46 high, 39 moderate)
Most sit in dev chains. The ones that reach shipped code:

| Package (locked) | Advisory | Patched in | Where it runs |
|---|---|---|---|
| prosemirror-view 1.41.8 | XSS in paste handling | 1.42.3 | the editor (teachers paste) |
| @tiptap/core 3.23.1 | ReDoS in markdown attribute parsing | 3.30.5 | the editor |
| markdown-it 14.2.0, linkify-it 5.0.1 | quadratic-time parsing | 14.3.3 / 5.0.2 | paste-markdown import, batch importer |
| react-router 7.15.0 | route-matching DoS, CSRF in RSC mode | 7.18.2 | SPA; the server-side ones likely do not apply |
| ws 8.20.0 (via realtime-js) | memory disclosure / DoS | 8.21.0 | stubbed in the app; real in `grading-worker` |
| zod 3.25.76 | memory exhaustion on oversized collections | listed as `<4.6.6` | both Edge Functions parse documents with it |

The three criticals are vitest 1.6.1 and its tinypool (dev only: the UI server
and worker options). Whether each advisory is exploitable here was **not**
assessed beyond where the package runs. The Tiptap family bump is the one to do
first (it also carries prosemirror-view), all `@tiptap/*` together per the
house rule.

There is no Dependabot or Renovate config and no `pnpm audit` step, so nothing
surfaces these. **Recommend** a weekly audit in the existing Monday routine
that reports only advisories on non-dev paths.

**Tiptap half fixed 2026-11-26** (pushed `12733c5c`): every `@tiptap/*` at
**3.31.4**, pinned exact (the family had drifted to 3.23.1 + 3.23.4). One copy
each of prosemirror-view (**1.42.9**, pinned to a settled patched release, not
1.44.0 from two days earlier) and prosemirror-model; the stale `y-tiptap` 3.0.3
peer that held the old copies is now declared at 3.1.0 (still aliased to the
stub, re-audited against drag-handle 3.31.4). Only `linkifyjs` moved outside
the family. One test changed: 3.31 builds React node views in a headless
editor, so a find-highlight test now reads the DecorationSet instead of the
DOM. Verified: `pnpm verify`; Playwright editor 287 passed / 27 skipped, a11y
25, student 136 + 1 video timing flake that passed 3/3 alone (`.env.local`
aside). **Still open:** the other advisories, and the weekly non-dev audit —
the Monday routine is a cloud trigger outside the repo, so adding a step
edits a standing schedule, which is the author's call.

### B3 ✔ Database error text is echoed to students, and 401 is decided by regex
Five sites test `/JWT|token|auth/i` on the error message to choose 401
(`get-activity-handler.ts:385`, `check-activity-handler.ts:579, 784`,
`practice-handler.ts:426`, `video-pause-handler.ts:118`). Any Postgres error
mentioning `authenticated`, `author_id` or the `auth` schema becomes "sign in
again" and is not logged. Real 500s return the raw message; a test pins that
`permission denied for table foo` is echoed.
**Fix:** carry PostgREST's `code` and status through the port, one shared
`rpcStatus()`, a fixed string for 500, log every non-404. **S.**

**Fixed 2026-11-26** (pushed `12733c5c`). `packages/viewer/src/server/rpcStatus.ts`
holds the one mapping: 'Not available' → 404 first (it arrives as 42501 /
HTTP 403), then HTTP 401, a PGRST301–303 code or our SQL's exact
`'Not authorized'` → 401, anything else → 500 with a fixed message. All five
sites use it; `DbResult` now carries `status` and `error.code` (the Deno
entry points already returned supabase-js results whole). 401s log at warn,
500s at error. The test that pinned the echoed `permission denied` now
asserts it is NOT echoed. Both bundles rebuilt. **LIVE 2026-11-26:** both functions
deployed and hash-identical to the repo (viewer `ee636a71…`, grading
`34457e4c…`); a garbage-token GET to get-activity returns 401 with the fixed
message.

### B4 A check row's size is bounded only by a header the client controls
`check-activity-handler.ts:713` trusts `content-length`; a chunked body has
none. photo-handoff already fixed this ("the declared length is a hint, not a
bound"). Response keys not in the section are stored verbatim, blank strings
have no per-value cap, a malformed graph payload becomes a 500 logged as a
grader bug, and the idempotency key is any string including `''` with replay
keyed on (student, key) alone. Rows are kept ~400 days and no prune is armed.
**Fix:** the capped reader from photo-handoff, drop unknown keys before
recording, a minimal graph shape check returning 400, require a UUID key.
**S–M.**

### B5 ✔ The verify suite runs the real purge on the live database
`pnpm verify:auth --target live` runs `purge_soft_deleted()` in five registered
scripts (`verify-0033:330`, `0036:528`, `0045:875`, `0050:573`, `0066:662`,
plus `verify-0029:106`), each inside a transaction ended by a deliberate
`raise` or `rollback`. 65 of 79 scripts insert their own `auth.users` rows. It
is safe as written. From February the purge will find real eligible accounts on
every run, hold locks on their rows, and depend on one trailing statement to
undo it. The runner has `@live-only` and no `@local-only`.
**Recommend:** add `@local-only`, mark fixture-building and purge-calling
sections with it, keep catalog/grant/cron rows on live. A judgement call, and
yours. **S–M.**

**Mechanism built 2026-11-26** (the author chose it): `-- @local-only` right
after `@section` makes `--target live` skip the whole section. verify-0021…0026
use it. A test in `verify-runner.test.mjs` fails if a NEW section runs
`purge_soft_deleted()` without it. **Still open:** moving the older purge and sweep
sections (verify-0029, 0033, 0035, 0036, 0045, 0050, 0066) to it. The test names
them (seven, with verify-0035), and that list may only shrink.

### B6 Live database advisors (read 2026-11-26)
- **4 functions with a mutable `search_path`:** `analytics_day`,
  `analytics_default_zone`, `analytics_rolled_boundary`, `users_timezone_guard`.
  All 194 SECURITY DEFINER functions do set it; these four are the invoker ones.
  One small migration.
- **Policies on `class_members`, `classes`, `section_checks`, `submissions`
  apply to every role** including `anon` (two permissive SELECT policies each,
  not scoped `to authenticated`). Harmless with `auth.uid()` null, but each is
  evaluated per query. Scope them when next touched.
- **Leaked-password protection is off.** Sign-in is Google only, so this
  matters only if the email provider is still enabled in the dashboard. Worth
  one look.
- 41 tables with RLS on and no policy, and 115 definer RPCs callable by signed-in
  users: this is the design (RPC-only access), not a finding.

---

## C. Design decisions that will cost later

### C1 Nothing in the repo states what the database currently is
342 function definitions for 220 names; 71 functions are defined more than
once. The live body of `class_progress`, `activity_progress`,
`list_grading_queue` and `class_student_work` is in `0099_photo_pilot.sql`
(each restated in 0096, 0097 and 0099 within two days); `record_check` is in
`0070_dol_retake.sql`; `purge_soft_deleted` has 11 definitions. There is no
schema snapshot and no generated types. On the other side of the wire:

- ✔ the app's client is untyped (`lib/supabase.ts:50`): 35 hand-written row
  types, 84 casts of `data`, about 60 RPCs called by string with untyped
  arguments;
- the Edge Functions' ~200 lines of RPC name and argument mapping
  (`check-activity/index.ts:71-279`) are untyped and exercised only by the
  local integration lane.

A renamed column or parameter compiles clean and passes unit tests, because the
tests mock the client. This is the single largest structural gap: three
reviewers reached it independently.

**Recommend, in this order:**
1. Generate `database.types.ts` from the local stack, commit it, add a drift
   check (the same discipline as the two bundles), type the app client. **M.**
2. A node test that extracts every `.rpc('name', { p_… })` from the app and the
   function files and asserts the name and arguments exist in the latest
   migration defining it. **S.** This is P2 applied to the wire.
3. A generated `function → latest file:line` index, or one file per function
   from `pg_get_functiondef`. Do not squash the migrations; their headers are
   the decision record. **M.**

**Design pass 2026-11-26, all eight decisions RULED yes by the author**
([database-snapshot-and-types.md](../design/database-snapshot-and-types.md)).
**Recommendation 2 BUILT the same day as slice 1:** `scripts/tests/rpc-arguments.test.mjs`
reads all 157 call sites (126 functions; app, viewer, worker, Edge Functions,
and — after the slice-2 review — the batch importer and the playtest/e2e
seeders in `scripts/`) and fails on a missing function, an unknown or missing
argument, or a call two overloads fit. A completeness check fails if the code
quotes a function name the scan never saw as a call (that found the photo
sweep's call, hidden by a nested generic). Zero drift today; mutation-tested.
**Recommendation 3 BUILT the same day as slice 2:** the generated
[docs/function-index.md](../function-index.md) (`pnpm db:index`, CI drift test),
on one shared parser (`scripts/lib/migrations.mjs`) that all four migration
readers now use. **Recommendation 1's first half BUILT as slice 3:**
`pnpm db:types` (from the local stack, committed with a sha256 stamp of the
migrations, CI-checked) and `pnpm db:types:live-diff` (live matched main at
0106). **Slice 4 BUILT the same day:** the app client is typed from the generated
schema and every call goes through `lib/db.ts`; jsonb shapes in one map with
`@shape-as-of` stamps; casts 94 → 77, ratcheted. **Slice 5 BUILT the same day:** the worker
and the viewer's seams are typed through shared call types, and the server
ports' row types are checked against the schema at compile time. The Edge
Functions followed the same day: CI runs `deno check` on all four with a
check-only config, and their clients are typed by the schema.

### C2 Adding one block type touches about 34 places, and the app half is unguarded
The viewer keys everything off one registry and fails to compile when a type is
missing. The app has about 14 separate hand-kept rosters under two spellings of
each name, six of which can drift silently:

- editor → document in `serialize.ts:437` (`default:` warns and returns null:
  the block vanishes on save);
- `answerText.ts:228` (`BLOCK_FAMILY`), no guard;
- `bankImport.ts:101,112`, no guard;
- `blockControls.ts`, keys checked but not coverage;
- editor CSS;
- three SQL arrays of response families (see C6).

README's "deliberately exhaustive" checklist (`README.md:161-175`) names none
of `blockControls`, `blockThumbnails`, `analyticsLabels`, `answerText`,
`bankImport`, `capabilityFacts`, `guiSurfaces`, the SQL twins or the curriculum
pin bump. The reviewer's full table is reproduced at the end of this file.

**Recommend:** the cheap version first. Three guard tests (every block node in
the editor schema has an editor → document case; `BLOCK_FAMILY` agrees with the
viewer's `indexDocument`; the bank lists cover the block union) and a README
refresh. **S.** A real `editorBlockRegistry: Record<BlockType, …>` is the
durable fix. **M.**

**Guards built 2026-11-26** (`app/src/__tests__/blockTypeGuards.test.ts`,
`panelGuideRosters.test.tsx`; README's checklist refreshed): every node a
column, the reference panel or the teacher guide can make has a
`tiptapBlockToActivity` case (the panel and guide are read from the mounted
editors' own schemas); worked and guided examples keep every child their node
accepts; `answerText`'s index files the same items under the same families, in
order, as the viewer's `indexDocument`; `bankImport`'s lists are classified
against the registry's `family`, and its scored-response count equals the
viewer's item count block by block; insertable nodes with no command bar are a
pinned list. Mutation-tested: dropped serializer case, worked-example child
filter, maths-gap count, essay family / refusal, ordering in the graded list,
a new viewer category, a `blockControls` entry, the two fixes reverted. **Found
and fixed (one line each):** a display-only graph or data plot was a question
line in the teacher's answer panel for every student (`answerText.ts`); the
reference panel let a typed `---` make a rule that vanished on save
(`ReferencePanelEditor.tsx`, `horizontalRule: false` as in the guide editor).
**Open question** (TODOS): five blocks show no command bar. Not done: the
`editorBlockRegistry` (the **M** durable fix) and the editor CSS (no unit guard).

### C3 No test round-trips a document through the editor's schema
Every editor open is document → editor → ProseMirror schema → document, and
each field is held by its own test. The batch importer goes importer →
serialize without passing the ProseMirror schema, so an attribute the importer
emits and the extension does not declare imports and publishes correctly and is
dropped the first time a teacher opens and saves. The reviewer compared attrs
to fields by eye and found no live case. This is the orphan-field class in a
place the close-out sweep does not look.
**Recommend:** one test over every viewer fixture and every fence example:
`activityToTiptap` → `PMNode.fromJSON(schema).toJSON()` → `tiptapToActivity` →
deep-equal after id normalisation. **S–M.** High value for its size.

**Guard built 2026-11-26** (`packages/app/src/__tests__/editorRoundTrip.test.ts`):
the viewer's authored fixture document (every registered type and variant),
every importer body-fence example through the batch pipeline, and a layout
document (titled DoL section, grid lines on, column widths and a min height,
non-fallback worked-example titles), each through the real ProseMirror schema
and back, ids renamed by first appearance. Block-type coverage is read from the
schema's `Block` union. Mutation-tested: renaming four extension attrs
(`hint`, `rubric`, `maxPhotos`), deleting a fixture, and dropping a section's
title or DoL, a row's grid lines, a column's width or min height, or a worked
example's title each went red. **Two real losses found**, held as tracked
expected failures (TODOS → "Editor round trip"): a `problem` block is deleted by
the first open → save, and a blank's authored `width` is dropped (no extension
attr). Neither is reachable from the app or importer today.

### C4 The viewer ↔ graph-kit seam is untyped and tested only against fakes
A1, A2 and A3 all live in `kitSurfaces.ts`, behind `as never` and
`as unknown as`. The viewer's canvas tests use fake surfaces; the one
real-board student spec checks only that a stimulus draws; no browser test
moves a handle; every Playwright project is Desktop Chrome, with no WebKit and
no touch, while students are on iPads and Chromebooks.
**Recommend:** type the seam against the kit's own types (the compiler then
finds A1 and the data-plot restore), one student-lane spec per canvas family
that keyboard-moves a handle, asserts the payload on the check request, reloads
and asserts the board, and a small WebKit + touch smoke project. **M.**

### C5 The app has no shared way to load data, and no way to know it broke
- 48 hand-rolled `cancelled/live/alive` flags across 32 files, 6 separate
  sequence refs, 4 unrelated module caches, no `AbortController`. One reusable
  loader exists (`progress/common.tsx:27`, `useProgressLoad`) and 2 routes use
  it. Several loads have no guard at all (`FactsTeacher.tsx:443-458`,
  `ActivityResponses.tsx:287`, `Classes.tsx:680,705`).
- ✔ No app-level error boundary: the only one is per block in the viewer. A
  render throw in any teacher route, Home or FactsEntry leaves a blank page.
- 87 empty `catch {}`, no `unhandledrejection` hook, no reporter. From February
  the only signal that something is broken is a teacher's message.

**Recommend:** a route-level boundary with a "Something went wrong — Refresh"
button (a button, never an automatic reload). **S.** Promote `useProgressLoad`
to a general `useLoad` with an optional keyed cache and adopt it as routes are
touched; no data library in the student shell. **M, incremental.** A minimal
teacher-side error log (message, route, build) needs your ruling; the student
side is already gated by the telemetry item in TODOS.

**Error boundary fixed 2026-11-26** (pushed `12733c5c`): `AppErrorBoundary`
wraps every route in `App.tsx`, keyed by pathname. A render throw shows
"Something went wrong on this page." and a focused Refresh button; it never
reloads by itself. +311 B gz on the shell, recorded in `SHELL_SPEND` (158.3 of
158.7 KiB; ~436 B of allowance left). Not covered: `SessionProvider`,
`ThemeToggle` and `UpdateNotice` sit outside it (the notice deliberately). The
loader, empty catches and error log are still open.

### C6 The same fact written in several places with no bond
- ✔ **Response families:** three migrations carry a seven-item array
  (`0061:619`, `0062:124`, `0064:680`); the viewer's `RESPONSE_CATEGORIES` has
  eight (`photos` is missing in SQL). The house rule says each new category gets
  its own map, so this list will grow. A node test in the style of
  `manually-graded-types.test.mjs`. **S.**

  **Response-family bond built 2026-11-26**
  (`scripts/tests/response-families.test.mjs`): the viewer's `RESPONSE_CATEGORIES`
  is canonical. The app's `ANSWER_FAMILIES` must equal it in order;
  check-activity's item ceiling (`countItems`) must count every family; the two
  marked-id lists (`markedIdsSent`, the mock's `gradableItemIds`) must be every
  family but the recorded `freeText` and `photos`; and every family array in a
  LIVE function body (read through C1's `scripts/lib/migrations.mjs`, so
  superseded bodies are ignored) must equal it in order, less a pinned known
  gap. The two holders are pinned by name (`activity_first_tries`, 0062;
  `class_misconceptions`, 0064, which superseded 0061's copy); a tripwire fails
  any other live body naming three or more families in another spelling, and
  another fails a function outside `public` (the parser reads `public` only).
  **Finding:** both holders lack `photos`, inert because they only read judged
  verdicts; tracked in TODOS. Mutation-tested: a new family, reordered app list,
  reordered 0064 array, the gap cleared, a `'{…}'::text[]` and an `IN` list in a
  probe migration, a non-public probe function, `photos` out of the ceiling, a
  family out of each marked-id list; editing superseded 0061 stayed green. Not
  done: one SQL helper returning the list (the copies would end).
- **The check preamble** (authorize, identify, load, upgrade) exists three
  times with drift (`check-activity-handler.ts:570-634`, `773-826`,
  `video-pause-handler.ts:116-141`). Seven request modes ride one endpoint. One
  `authorizeAndLoad()` that is the only caller of `readVersion`, with a guard
  test. **M.**
- **Defaults in up to four layers:** `showStepLabels` is in the schema, the
  factory, the extension and `serialize.ts`; `gridLines: 'inherit'` in seven
  places. `NumberLine.ts:63` already takes its defaults from the schema
  factory; adopt that as extensions are touched. **S each.**
- **Editor attribute types** are a hand-kept parallel of the schema (56
  exported types, 89 casts in `serialize.ts`). Replace with `z.infer` types as
  files are touched.
- **Document walks:** the tracked "five times" is now about 20 sites in 18
  files. The schema already holds a private `blocksOf(section)`
  (`video-beat.ts:25`); export it and migrate the non-sanitizer callers.
  **S.** (Delta on TODOS "The document walk is duplicated FIVE times".)
- **Three evaluators for one function model** in graph-kit: `board.ts:1818`
  is untyped with `default: return null`, the other two are exhaustive. A new
  curve family would print and score and silently not draw live. **S–M.**

### C7 A save that fails validation says nothing about where
✔ `ActivityEditor.tsx:773-776` discards the zod error and throws "Document
failed validation; not saved." Autosave stops for the whole document. The load
path already has `describeParseFailure`. Pass the first issue path through.
**S.**

### C8 Nothing checks that today's schema still parses yesterday's published rows
`schemaVersion` has been 2 since the hard cut, the upgrade table is empty, and
the ruled policy is additive in-version change. 46 commits have touched the
schema since August. A change meant as additive that tightens a refine becomes
an `UpgradeError` on a live activity, found by a student.
**Recommend:** commit a handful of real published `content` rows from
different dates as frozen fixtures that must parse; optionally a `report:parse`
script run before `deploy:get-activity`. **S.**

**Guard built 2026-11-26** (`packages/schema/tests/published-shapes.test.ts`):
seven frozen documents under `tests/fixtures/published/`, written by the repo's
own code at five dates (2026-08-16 → 11-26) from a `git archive` of each named
commit: the viewer's authored fixture document at four dates, the stress-test
activity through the 11-21 batch pipeline, and a seeded and an unseeded DoL
through today's. Live `activity_versions` rows were not copied: they are the
real catalogue with its answer keys, and the repo is public. Each must pass
`upgradeActivityDocument` (the server's read) keeping every block and every
stored value; defaults may add keys, and a field retired on purpose is listed
per fixture with its commit. sha256 pins and a directory/manifest check make an
edit or deletion red; together the fixtures must hold every block type in the
union. A deliberate change is fixed in `upgrade.ts` (the frozen bytes then pass
untouched), or, if a data migration rewrites live rows, the same rewrite is
applied to the fixture with a `migratedBy` entry. Mutation-tested: a blank
`width` max, a strict meta (only the August fixture caught it), a renamed MC
`correct` with its default, DoL `skills` min 3, `retake` pinned to either
value, a fixture byte edit, a deleted fixture, an unfrozen type. Nothing found
on current code. The optional `report:parse` over live rows is not built.

### C9 The importer's fence dispatch
`mapBlock` is 281 lines with 27 tag checks, reconciled with its registry by a
test that regex-scrapes the source file. Directive keys (`prompt:`, `hint:`,
`axis:`, …) are in neither the registry nor the guard. 21 hand-written line
loops, 8 hand-typed directive regexes. Each fence is already self-contained, so
a split is mechanical, except that moving a literal out of the scraped file
vacates half the guard.
**Recommend:** a `FENCE_PARSERS` table plus one `readDirectives()`; derive the
registry from it; delete the source scan; then split. **M.** Do this before the
file grows past where it is (5,433 lines). `batch-import.mjs`'s `main()` is
1,770 lines with 83 bindings in one scope; continue its `plan*` extraction when
next in there.

### C10 Smaller, same theme
- ✔ `activities.updated_at` is written from the browser clock
  (`ActivityEditor.tsx:791`, `ActivityPrint.tsx:322`, `discardDraft.ts:57`). It
  is the conflict token and the list order. `classes` got a trigger stamp in
  0027 for exactly this reason. `ActivityPrint`'s read-merge-write is also not
  guarded by the token. One migration. **S.**
- 11 modal surfaces with 4 focus/Escape implementations; 13 separate Escape
  handlers. One `<Dialog>` shell on `useDialogFocus`. **M.**
- ~14 date formatters with two locale rules (`en-NZ` hard-coded in two files,
  browser locale in ten). A US teacher sees "28 Nov" and "Nov 28" on one page.
  One `lib/dates.ts`. **S.**
- Three hand-rolled pollers with different visibility rules. One `usePoll`
  now means one shape to convert at the realtime arc. **S.**
- 32 `[error, setError]` + 30 busy booleans + three undo toasts with two
  different windows. A `useAction()` and a `useUndoToast()`. **M, low urgency.**
- Persisted viewer state: `hydrate` installs old blobs wholesale, so 17 read
  sites guard fields the types call required. Normalise once at hydrate and
  add a migrate step so a version bump need not discard unsent work. **S.**

---

## D. Efficiency

### D1 Any activity with a graph, number line or data plot downloads MathLive and mathjs
✔ All five seams and the preload import the graph-kit **barrel**
(`kitSurfaces.ts:107, 216, 285, 354, 407`; `kitPreload.ts:76`), which
re-exports the math-prompt mount, the scorers and ✔ the legacy runtime
(`graph-kit/src/index.ts:47, 272`). In the local build that chunk statically
pulls MathLive (228 KiB gz) and mathjs (45 KiB gz). A data plot needs neither.
The subpath rule in CLAUDE.md is written for code outside a browser; the same
problem exists inside one. `perf-budgets.mjs` has no student journey, so CI
cannot see it. Byte figures are from a local dist; re-measure.
**Fix:** `exports` subpaths per question type, import those, move
`assertHostAttached` to a leaf, add student journeys that forbid `mathlive` for
number-line and data-plot activities. **M.** Likely the largest student-facing
win in this review. (TODOS says the legacy runtime is unreachable; it ships.)

> **✔ Fixed 2026-11-26 (measured first, CI env build).** The claim held. What
> mounting each widget downloads beyond the shell (gz KiB, its static closure
> plus the board it fetches at once), before → after:
> graph **550.6 → 309.5**, number line **544.0 → 244.9**, data plot
> **307.0 → 6.4**, maths answer box **303.3 → 225.7**. What each one truly
> needs: the graph keeps mathjs (its board draws curves with it) and JSXGraph,
> and loads MathLive only when a transform_curve equation field renders; the
> number line and the data plot need neither; a maths answer box needs MathLive
> only. The number line was also reaching mathjs on its own, through one helper
> it imported from `graph-question.ts`; that helper moved to the leaf
> `host-attached.ts`. Graph-kit gained five subpaths (graph-question,
> number-line-question, data-plot-question, math-prompt-mount, calculator); the
> seams and the preload use them, and the preload now warms only the widgets a
> document holds. Guards: `packages/viewer/tests/kitBarrel.test.ts` (no barrel
> specifier under `packages/viewer/src`) and `STUDENT_KIT_JOURNEYS` in
> `scripts/perf-budgets.mjs` (caps plus "free of" rows on the built chunks, and
> a vacuity stop if the shell stops dynamically importing a widget's module).
> Both mutation-tested. The shell paid +148 B gz for it (SHELL_SPEND row). No
> scorer or server file changed, so neither Edge Function bundle moved and no
> deploy is owed. The legacy runtime is off the student path; teacher code
> that imports the barrel (the editor's config drawer, the dev routes) still
> carries it, untouched here.

### D2 The class grids call a definer function per block per student
`class_progress` and `activity_progress` (`0099:501-526`) unnest the whole
document once per latest check and pass `photos_allowed_for(...)`, a definer
query on three tables, for every block. The 0.54 s measured at 30 × 100 in 0064
predates this. `class_gradebook` (`0102:84, 107-128`) already does it the cheap
way: once per activity, blocks walked once per version.
**Fix:** port that shape; longer term a per-version derived table of
hand-graded blocks. **M.** Unmeasured; measure before and after.

### D3 "Who to see first" re-reads the class's whole practice history every 5 seconds
`mixed_who_first` (`0091:1112`) runs two window functions over every
`mixed_attempts` row the class has, per poll, per open teacher tab. The table
grows with students × items × days and no prune is armed. The 5 s cadence is
ruled; the cost per poll is not tracked.
**Fix:** a date floor on both windows, or compute the window once. **M.**

### D4 Every served practice item stores a full copy of its document
`mixed_session_items.document` and `dol_practice_items` copy the template on
every serve, though the row already carries a fingerprint that changes exactly
when the document does. Likely the fastest-growing table.
**Fix:** store once keyed `(owner, item, fingerprint)`; items reference it.
Keeps the snapshot guarantee. **M.** Size unmeasured.

### D5 Each Edge Function request builds one to three supabase-js clients
✔ `createClient` per call in `get-activity/index.ts:58, 70, 81, 140` and
`check-activity/index.ts:65, 75, 166`, with no `autoRefreshToken: false`. In
the pinned auth-js, each client starts a 30-second interval that is never
cleared. It also puts all of supabase-js, fetched from esm.sh, on the cold
start of the two hot functions for about six PostgREST calls.
**Fix:** the two flags now (**S**); later the plain-fetch helper photo-handoff
and the sweep already use (**M**). Impact is bounded by isolate lifetime, which
is the open question at TODOS efficiency item 8.

### D6 Foreign keys with no index, on the delete paths
The live advisor lists 22. The ones that matter are where a bulk delete will
scan: `dol_pass.check_id` and `.version_id` (every deleted check scans
`dol_pass`), `mixed_session_items.student_id` (the purge deletes by it per
account; 0072 indexed the same column on its own tables), then
`class_activities.activity_id`, `practice_sessions.class_id`,
`dol_practice_sessions.activity_id/version_id`, `help_requests.activity_id`,
`work_photos.activity_id`. One migration. **S.** Nothing today; it lands the
first night the purge has real work.

**Fixed 2026-11-26, LIVE** (0105 applied the same day; verify-0105 4/4 and
verify-cron-jobs 5/5 on live): migration **0105** adds 21 indexes: all 19 unindexed single-column foreign
keys in `public` (the review's nine plus ten user/version references the same
purges scan) and 2 covered only by a partial index a delete cannot use
(`class_members.student_id`, `classes.teacher_id`). `verify-0105` states the rule rather than a list, so a later
unindexed FK goes red there. Tested on the local stack inside a rolled-back
transaction: 4/4 green with 0105, 3 of 4 red without it. The dead `assignments` table's
two are exempted by name (retirement filed).

### D7 Smaller
- Each graph drag event clones the store and recomputes an unmemoised print
  SVG (`InteractiveGraph.tsx:248`), and every board mounts at load with no
  intersection check. Fine at 2–3 graphs, not at 10 on a Chromebook. **M.**
- `listClasses()` is fetched whole at 9 call sites to answer one-class
  questions, three times on the editor page alone;
  `listTeacherClassActivities()` joins every class and filters in the client.
  Add `getClass(id)` and `listClassActivities(classId)`. **S.**
- A check re-fetches and re-parses an immutable version every time; restore
  runs a whole-document substitution inside its per-section loop. Hoist the
  second now; the first waits on the isolate-reuse answer. **S.**
- `checkPhotos` is a fourth round trip `record_check` could return. **S.**
- No fetch has a timeout (`photo-handoff/index.ts:30, 44`,
  `sweep-work-photos/index.ts:90, 105`, the grading worker). A hung Storage PUT
  holds a reserved photo slot. `AbortSignal.timeout`. **S.**

### D8 CI: the print lane is the usual red
Of the last 40 runs on `main`, 9 failed: **6 in the print gates**, 2 in unit
tests, 1 in the budget script tests. Print baselines are authoritative only on
Linux, so a print change cannot be checked before push and costs a red run plus
a manual baseline round trip.
**Recommend:** a `pnpm print:linux` that runs the print lane inside the
Playwright Linux container locally, so `pnpm verify` can name it as covered.
**S–M.** The inline source maps in both committed bundles (77% of 3.3 MB and
1.2 MB, 77 and 67 commits) are already tracked at TODOS efficiency item 8;
they are also the second-largest contributor to repo size after B1.

---

## E. Platform and housekeeping updates we missed

### E1 Versions
Latest as the registry reports today. Majors were **not** evaluated; each needs
its own look at the changelog.

| Package | Locked | Latest | Note |
|---|---|---|---|
| @tiptap/* | 3.23.1 / 3.23.4 (mixed) | 3.35.0 | security (B2); the family is already on two patch levels, against the house rule |
| @supabase/supabase-js, auth-js | 2.105.3 | 2.119.2 | exact pin by design; the bump means re-auditing the six stubs and the esm.sh pin in both functions |
| react-router | 7.15.0 | 7.18.2 within major | security (B2) |
| markdown-it | 14.2.0 | 14.3.3 within major | security (B2) |
| vitest | 1.6.1 | 5.1.1 | four majors behind; brings a second Vite (5.4.21) into the tree beside 6.4.2 |
| vite | 6.4.2 | 8.3.8 | with `@vitejs/plugin-react` 4 → 6 and `vite-plugin-pwa` 1 → 2 |
| typescript | 5.7.3 and 5.9.3 | 7.0.2 | two versions installed: packages pin `~5.7.2`, root has `^5.4.5` |
| esbuild | 0.21.5 and 0.25.12 | 0.28.2 | the root 0.21 builds both committed Edge Function bundles |
| zod | 3.25.76 | 4.6.7 | contained: imported only inside `packages/schema`, no `.transform`/`.passthrough`; 122 `.default` and 90 `.uuid` are the parts to test |
| eslint | 9.39.4 | 10.15.0 | with react-hooks 5 → 7 |
| katex | 0.16.45 | 0.19.1 | print baselines will move |
| jsxgraph | 1.12.2 | 1.14.3 | check the `touch-action` behaviour (A7) while there |
| @types/node | 20 (root), 22 (packages) | 26 | CI and local run Node 24 |

No `engines` field and no `.nvmrc`: Node 24 is stated only in the workflow.

### E2 Edge Functions
- supabase-js comes from `https://esm.sh/…@2.105.3` with no `deno.lock` and no
  import map; `get-activity/deno.json` holds only lint/fmt settings. A lockfile
  would pin the transitive graph the same way the bundles are pinned.
- Live state read today: `get-activity` and `photo-handoff` `verify_jwt:false`,
  `check-activity` and `sweep-work-photos` `true`, matching `config.toml`.
  103 migrations applied, max `0103`, matching the repo. Postgres 17.6.

### E3 Database
- **Two cron jobs exist only by README prose:** `purge-soft-deleted` and
  `analytics-maintenance` are commented SQL in 0003 and 0026 with no verify row
  pinning name, hour or command. `prune-help-requests` and
  `prune-photo-handoffs` are pinned and the latter schedules itself. A rebuilt
  or branched project silently has no retention job. One migration in the 0095
  style plus two `@live-only` rows. **S.**
- **Six verify scripts are outside the runner** (`verify-0021` … `0026`),
  including the blocked-account, audit-stamp and six-case dormancy proofs for a
  purge that has been rewritten five times since. Register them (local-only,
  per B5). **S.**
- **The check-prune arming checklist is missing two readers** of superseded
  attempts: `mixed_taught` (`0066:477-487`, a prune would move a skill's taught
  day) and `my_dol_state` (`0072:320`, counts attempts where `record_check`
  uses the max). Add both to the checklist in TODOS. Not a suggestion to arm.
- 10 unused indexes, 7 of them on the dead `assignments`/`submissions` tables
  whose retirement is already in TODOS.

**Cron pinning and the two readers fixed 2026-11-26** (local commit, unpushed;
nothing scheduled, unscheduled or re-timed). `scripts/verify-cron-jobs.sql`
(registered in the runner) pins `purge-soft-deleted` (03:00) and
`analytics-maintenance` (03:30) by name, hour, command and active flag, and a
roster row fails on any cron job the repo does not name; the three cron rows
are `@live-only` and ran green on live as read-only SQL. This used verify
rows rather than the 0095-style self-scheduling migration the item
suggested, because a migration that schedules would be scheduling. The README
now carries the analytics job's recipe. TODOS → the check-rollup arming
checklist names both readers, as step 4b plus a blocker paragraph. A refinement
of the claim above: `record_check`'s insert loop numbers by `max` and refuses
past the cap, so the server stays correct. The defect is `my_dol_state`, which
would show one attempt and offer a retake the server then refuses.

**verify-0021…0026 registered 2026-11-26.** Each prose EXPECT is now a check
row, judged against today's functions. Claims later migrations superseded are
retired with a note naming the migration (the `submissions` rows, 0029;
"no account can purge", 0024; dated data claims). Each purge proof builds its
own fixtures (0024's original named a live account by uuid) and runs under
`@local-only`. 0026's grant and de-identification checks (B1–B4) also became
rows that live runs. Local: 7/7/5/6/5/8 pass. Live: every read-only row passes
and the five local-only sections are skipped. The guard also covers
`run_analytics_maintenance()`, so verify-0035's matrix joins the legacy list.

### E4 Documents that no longer match the code
- CLAUDE.md: the R2 backup is "untracked" (B1).
- `README.md:161-175`: the block-type checklist (C2); `~148` lists two
  functions of four.
- `packages/viewer/README.md:6-9, 177`: says the renderer exists and tells
  authors to bind `'eager'`.
- Comments that read as live: `_shared/cors.ts:4-8` ("published activities"),
  `server/uuid.ts:12-16` (two deleted functions), `grading/graphs.ts:121-124`
  ("the handler rejects it", which it does not, B4),
  `schema/src/blocks/index.ts:4-7`, `block-predicates.ts:26` ("baked into
  published HTML"), `serialize.ts:4-6` ("the editor never imports from
  @activity/schema"; 7 extensions do), `blockTypeGuards.test.ts:18` (cites a
  test file that does not exist).
- 14 dead selectors in `editor.css`, 1 in `viewer.css`.
- **`TODOS.md` is 49,000 words** with 29 headings already marked done. Every
  session that searches it pays for that, and so does every reviewer here. STATE
  got a word budget for the same reason. Moving closed sections to HISTORY and
  giving TODOS a ceiling is the cheapest efficiency change in this review.

---

## F. Looked at and found sound

Stated so nobody re-audits them soon:
- `record_check`: server-derived attempt number, idempotent replay, lock and
  DoL re-checked in the retry loop, rate ceiling in SQL, service-role only.
- Authorization order in every server mode: nothing reads the raw document
  before the caller-scoped RPC succeeds.
- All 194 definer functions set `search_path`; every function has a revoke
  stanza; only the two ruled functions are granted to `anon`; all 59 tables
  have RLS enabled and forced; policies use `(select auth.uid())`.
- Viewer store: a keystroke re-renders only the block that reads it
  (test-pinned); buffer debounce and flush; board lifecycle frees on destroy.
- Code splitting, the service worker's update path, editor autosave
  (coalescing, backoff, conflict, flush), `select('*')` nowhere, no dead
  exports found, the Supabase stubs pinned as documented.
- mathjs is a custom `mathjs/number` build under its ceiling; colour tokens are
  test-enforced; `editor.css` and `viewer.css` share no selectors.
- zod is contained in one package; the batch importer's copies of app logic are
  deliberate and guarded.

---

## G. Suggested order

1. **The defects:** A1, A3, A4, A6, A7 are each small. A2 with C4 is one piece
   of work on the graph seam, and A5 is one migration.
2. **Before February, cheap and protective:** B1 (decide on the backup), the
   Tiptap bump (B2), B3, the error boundary (C5), the FK indexes (D6), the
   cron pinning (E3), the two missing checklist readers (E3).
3. **The structural one worth a design pass:** C1 (generated types, the RPC
   argument test, the function index). It removes a whole class of
   live-only failures and makes every later migration cheaper.
4. **Guards that are small for what they catch:** C3 (round trip), C8 (frozen
   fixtures), the C2 guard tests, the C6 response-family bond.
5. **Efficiency, measured first:** D1 (graph-kit subpaths), then D2–D4 once
   there are real class-sized numbers.
6. **As files are touched:** everything in C10, the defaults and attr types in
   C6, C9.

None of this is in the build queue. Per the 2026-10-02 ruling, ranking is the
author's.

---

## Appendix: the "add one block type" touch list

| Place | File | Kept how | Guard |
|---|---|---|---|
| Block schema + union | `schema/src/blocks/<x>.ts`, `blocks/index.ts:35` | hand (the root) | everything hangs off it |
| Barrel re-export | `schema/src/index.ts` | hand | none |
| Factory | `schema/src/factories.ts` | hand | indirect (`blockTypeGuards.test.ts`) |
| Numbered / gradeable / hand-graded sets | `schema/src/block-predicates.ts:41,72,159` | hand | viewer `registry.test.ts`; SQL twin tests |
| Tiptap extension + list | `editor/extensions/<X>.ts`, `editorExtensions.ts` | hand | `blockTypeGuards.test.ts` |
| Column content expression | `editor/extensions/Columns.ts:917` | hand | `blockTypeGuards.test.ts:234` |
| Panel / guide / worked-example lists | `ReferencePanelEditor.tsx`, `WorkedExample.ts:29`, `markdownToTiptap.ts:3905` | hand | partly |
| Node view | `editor/nodeViews/<X>View.tsx` | hand | n/a |
| Serialize, document → editor | `lib/serialize.ts:1709` | hand | compile-time `never` |
| Serialize, editor → document | `lib/serialize.ts:437` | hand | **none** |
| Slash / Insert entry | `editor/slashMenuItems.ts` | hand | `guiSurfaces.test.ts`, partly |
| Thumbnail | `editor/blockThumbnails.tsx` | hand | parity test |
| Command-bar controls | `editor/blockControls.ts` | hand | keys only |
| Editor numbering bridge | `editor/problemNumbering.ts:38` | hand | bound to schema set |
| Editor block CSS | `editor/editor.css` | hand | **none** |
| Importer fence parser + dispatch | `lib/markdownToTiptap.ts` | hand | source scan |
| Fence registry | `lib/importFormatRegistry.ts` | hand | same test |
| Teacher prompt + format doc | `lib/markdownImportPrompt.ts`, `docs/markdown-import-format.md` | hand prose | presence + embed tests |
| Catalogue prompt + doc | `lib/catalogueAuthoringPrompt.ts` | generated | drift test |
| Capability facts | `lib/capabilityFacts.ts:114` | hand join | drift test, then a manual pin bump |
| GUI roster | `lib/guiSurfaces.ts` | hand | compile-keyed + test |
| Analytics label | `lib/analyticsLabels.ts:17` | hand | vs registry keys |
| Teacher answer index | `lib/answerText.ts:228` | hand | **none** |
| Bank admission | `lib/bankImport.ts:101,112` | hand | **none** |
| Viewer registry entry | `viewer/src/registry/registry.ts` | hand | compile-keyed + test |
| Component binding | `registry/bindings.ts:58` | hand | compile-keyed |
| Student component | `viewer/src/blocks/<X>.tsx` | hand | conformance suite |
| Fixtures / leak fixture | `fixtures/index.ts`, `leakFixture.ts` | hand | fixture + leak suites |
| A11y story, eager list | `viewer/tests/a11yStories.ts`, `eagerBlocks.ts` | hand | `registry.test.ts:133` |
| Print | `registry/printExpectations.ts`, `viewer.css` | hand | browser lane only |
| Answer key | `answer-key/types.ts:160`, `extract.ts` | hand | `answerKey.test.ts:375` |
| Section item index | `container/blockIndex.ts:167` | hand switch | `default:` skips silently |
| Grader | `server/grading/walk.ts`, `corpus.ts:1017` | hand | conformance |
| SQL twins | `is_manually_graded_type`, `dol_optional_block` | hand | two node tests |
| SQL response-family arrays | `0061:619`, `0062:124`, `0064:680` | hand ×3 | **none** |
| Census; both server bundles | — | generated | CI drift |
