# Shared data loading and failure reporting — design pass (review C5)

**Status: DESIGN PASS, 2026-11-27. Nothing built. Waiting on the author's yes/no per decision (§8).**
Source: [code review 2026-11-26](../reviews/2026-11-26-code-review.md) item C5. The error-boundary half
of C5 is BUILT (`AppErrorBoundary`, c9168fdc, pushed 12733c5c). This doc covers the rest: how screens
load data, and how anyone learns that a load broke. Not in the build queue; ranking is the author's
(CLAUDE.md, "a new wish gets a trigger, not a slot").

## 1. The problem in one paragraph

Every signed-in screen loads its own data its own way. There are about seven ways of doing it, written
by hand, each one a little different. That has two costs. First, every screen has to get the same
fiddly things right by itself: ignore an answer that arrives after you have left, never let an old
answer overwrite a newer one, say something useful when the network is slow, keep the last good
numbers when a refresh fails. Some screens do all of that well; some do none of it. Second, when a load
fails, nobody but the person looking at the screen ever knows. There is no log. From February, when
real classes arrive, the only signal that something is broken will be a teacher's message.

## 2. Facts, measured 2026-11-27 (not quoted from the review)

Method: grep and a throwaway node scan (scratchpad, not committed) over the non-test source in
`packages/app/src` (389 `.ts`/`.tsx` files; `__tests__`, `*.test.*` and `lib/supabase-stubs/`
excluded). Where my number differs from the review's, both are given; the difference is in what was
counted, not a change in the code.

**Volume**
- 101 database calls through `rpc()` / `rpcOrThrow()` (`lib/db.ts`) in 31 files, plus 48 direct table
  reads (`.from('…')`). 243 `useEffect` calls.
- 34 screens are routes in `App.tsx`. Only `StudentViewer` is in the student shell (the entry chunk).
  `Home` and `JoinClass` are their own preloaded chunk since R5 (`lib/landingRoutes.ts`). Every teacher
  route is `lazy()` — its code is downloaded only when a teacher opens it.

**The seven patterns in use today**

| # | Pattern | How many | Representative file |
|---|---|---|---|
| P1 | `useEffect` with a local `let cancelled / live / alive` flag, so an answer that lands after you leave is ignored | 50 flags in 34 files (review: 48 in 32; wider match adds `active`, `mounted`, … → 56 in 39) | `routes/Classes.tsx:724`, `routes/Bank.tsx` (5), `routes/StudentViewer.tsx:229` |
| P2 | A counter ref ("generation" / "seq"), so only the newest answer lands | 6 files | `progress/HelpStrip.tsx:27`, `practice/TodayPanel.tsx:51`, `routes/ClassPlan.tsx:89`, `routes/ActivityResponses.tsx:253-266` (four counters on one screen) |
| P3 | The one shared loader, `useProgressLoad` (first-load failed vs refused vs refresh failed; keeps the last good data; "Updated 9:41") | 2 routes | `progress/common.tsx:27`, used by `routes/ClassProgress.tsx:65`, `routes/ActivityProgress.tsx:73` |
| P4 | A module-level promise cache that lives for the page session | 4 | `lib/skillLabels.ts:15`, `lib/misconceptionList.ts:19`, `lib/versionContent.ts:31` (user-keyed), `lib/glossaryService.ts:30` |
| P5 | Polling with `setInterval` | 4 data polls | `progress/HelpStrip.tsx:59` (15 s, pauses when the tab is hidden), `routes/FactsTeacher.tsx:467` (5 s while a snapshot is open, visible tab only), `components/WorkPhotoViewer.tsx:92` (re-signs photo links every 9 min) |
| P6 | Fire-and-forget with the failure thrown away | 38 silent promise catches (`.catch(() => undefined)` and friends); 42 `catch {}` blocks with nothing but a comment inside (review counted 87 with a looser rule) | `routes/Classes.tsx:680` (roster counts), `practice/TodayPanel.tsx:83,86`, `progress/HelpStrip.tsx:40` |
| P7 | The student viewer's own state machine: skeleton, "taking longer" after 8 s, retry on `online` and on tab return, a restore-failed banner | 1 | `routes/StudentViewer.tsx:245-390, 457-490, 670-690` |

Also: three small shared hooks for one dataset each (`useTeacherClassActivities`,
`useClassMembership`, `useWorkPhotos`), and `useSlowFlag` (`lib/slowLoad.ts`, the shared 8-second
"taking longer than usual" timer), which is used only by student-side screens (`Home`, `JoinClass`,
`FactsEntry`) — no teacher screen uses it.

**What is missing everywhere**
- No `AbortController` anywhere (0 hits). An abandoned request runs to the end; P1/P2 just ignore it.
- No `unhandledrejection` or `window.onerror` handler, and no reporter of any kind. 27
  `console.error/warn` calls are the only record, and they live only in the teacher's own browser.
- No cache between visits for any list. Leaving Activities and coming back reloads the whole list and
  shows "Loading your activities…" again (`routes/Activities.tsx:739`).
- No refresh on tab return for teacher screens, except the help strip (`HelpStrip.tsx:72`).
- Teacher screens show "Loading…" with no time limit. On hung school wifi it stays forever.

**What already works, and should be kept**
- The student viewer (P7) is the most careful loader in the repo and is already tuned to the shell
  budget. It is not a candidate for change.
- `useProgressLoad` (P3) already has the right shape for teacher screens. It is the seed of the
  shared hook, as the review said.
- The four module caches (P4) already forget a failed read, so a failure is not cached forever
  (`skillLabels.ts:21`, `versionContent.ts:72-76`).

**The shell budget** (`scripts/perf-budgets.mjs`)
- Ceiling `SHELL_JS_GZ_KIB = 158.7` KiB gz (162,509 bytes). Current baseline
  `SHELL_JS_BASELINE_BYTES = 162,327`. That leaves **about 180 bytes**. The ceiling "no longer moves by
  ruling"; crossing it needs a reserve rung in the same slice.
- So: anything that lands in the entry chunk is nearly impossible. Anything only teacher routes import
  costs the shell **nothing**, because those routes are lazy chunks.

**Already ruled elsewhere**
- `docs/DECISIONS.md` has no ruling on a client data library or client-side caching. Its only cache
  rulings are server-side (the read cache, `activity_version_reads`) and the service worker ("the API
  is never cached by the worker", DECISIONS → "What the service worker may cache").
- The review itself recommends "no data library in the student shell".
- Student telemetry is gated: no collection from students until the census cannot answer a question
  AND the compliance pack is amended (TODOS, "Field measurement of student-interactive"; STATE
  re-architecture follow-on 3). Any error log in this doc is therefore **teacher sessions only**.
- Author ruling 2026-10-04: never reload a page under a working user (memory, "no reload under a
  working user"). A background re-read of a list is not a reload, but it must never touch a form or
  an editor.

## 3. What a teacher or student can actually hit

Each one checked against today's code, so the list says what is real, not what is possible in theory.

1. **Hung wifi, teacher side.** Activities, Classes, Bank, Analytics and the rest show "Loading…" with
   no end and no button. The student side already says "taking longer than usual" after 8 s; the
   teacher side never does.
2. **Raw server text on screen.** Several teacher screens print the database's own error message:
   `Activities.tsx:743` ("Couldn't load activities: {listError}"), `Classes.tsx:894`,
   `BankPreview.tsx:101`, `BankItemPreview.tsx:192`, `ClassRoster.tsx:57`. A teacher sees something
   like `JWT expired` or `permission denied for function …` and has no next step. Most of them have no
   "Try again" button either; the fix is a full page refresh.
3. **Something quietly missing.** P6 failures leave a part of a screen blank with no word: the roster
   counts on Classes cards, the deleted-classes section, the hook link and the mixed-practice line on
   Today, new "Ask my teacher" requests in the help strip (a failed poll keeps the old list and says
   nothing, `HelpStrip.tsx:36-41`). Each one is a reasonable choice on its own. Together they mean a
   broken feature looks exactly like an empty one.
4. **Slow navigation.** Every return to a list reloads it from nothing, with a loading line in
   between. Not a failure, but it is the flowing-water UX the repo cares about.
5. **A broken release nobody hears about.** If a deploy breaks one teacher RPC (a renamed argument the
   type check could not see, a missing grant, a migration applied in the wrong order), every teacher
   on that screen sees an error, and the author finds out only when one of them writes in. This is the
   headline of C5.

What I checked and found **not** reachable today: the three "unguarded loads" the review named.
`FactsTeacher.tsx:443` sits inside a `Snapshot` that is keyed by probe (`FactsTeacher.tsx:185`), so a
switch remounts it and an old answer cannot land on a new probe. `Classes.tsx:680,705` run once with no
inputs, so nothing can race them. They are safe — but only because I read them by hand. That is the
real cost: every one of the 50 P1 flags needs the same hand reading, and the next one written may not
be safe.

## 4. Options

### Option A — a small in-house hook, `useLoad`, promoted from `useProgressLoad` (recommended)

One hook in `lib/useLoad.ts`, plus one small view (`<LoadState>`) that draws its states the same way
on every teacher screen:
- **latest-wins** built in (the P2 counter, once, tested once);
- **first load failed** → a plain sentence and a "Try again" button; the server's raw text only under a
  "Details" toggle;
- **refused** (not your class / activity) → its own sentence, as `useProgressLoad` already does;
- **refresh failed** → keep the last good data and say "Couldn't refresh — showing 9:41";
- **slow** → "Taking longer than usual" after the shared 8 s (`SLOW_LOAD_MS`);
- **optional keyed cache**: show the last answer for this key at once, re-read behind it;
- **optional re-read when the tab comes back** (throttled), for screens with a cache;
- every failure goes to one `reportLoadFailure()` function, which is where Option C's log plugs in.

Size: roughly 0.6–1 KiB gz of code, in a shared chunk that only teacher routes load. **0 bytes on the
student shell**, held there by a forbidden-marker guard like the ones in `perf-budgets.mjs`.
Migration cost: medium, spread out. Each screen moves when it is next touched; a ratchet test keeps the
hand-rolled count from going back up. No new dependency, nothing to pin, nothing to audit for size.
What it guards: failure cases 1, 2, 4, and the race-safety of every screen that moves; it gives case 5
a single place to report from.
Weakness: it is our code, so its tests are ours. It will not grow into mutations, pagination or
deduping across screens unless we build those, and we should not.

### Option B — adopt a query library on the teacher side (TanStack Query or SWR)

These libraries do everything in Option A and more (deduping, retries with backoff, cache sharing
between screens, devtools). Sizes are approximate and would need measuring here: SWR about 4–5 KiB gz;
TanStack Query (core + React) about 12–14 KiB gz.
- Shell cost is 0 **only if** nothing in the entry chunk imports it. TanStack Query wants a provider at
  the top of the app, which is in the shell; working around that (a provider inside each lazy route
  sharing one client) is possible but fights the library. SWR needs no provider, so it is easier to
  keep out.
- Migration cost: the same screen-by-screen work as Option A, plus learning the library's rules, plus
  a new pinned dependency to keep updated. Its default retries (TanStack retries 3 times) and its
  refetch-on-focus would need turning down to match the "never reload under a working user" ruling.
- What it guards: the same as A. It adds things we do not need yet: shared cache across screens, and
  mutation helpers (our saves already have their own careful paths — `useAutosave`, `saveQueue`).
- Weakness: a dependency the student side must never touch, guarded forever; and the parts we would
  use are the ~100 lines Option A would write.

### Option C — leave loading alone; only add failure reporting

Keep every screen as it is. Add a `window` hook for unhandled errors and rejections and a small
teacher-only error log (below), and route the existing `catch` blocks to it over time.
- Size: under 0.5 KiB gz, teacher chunks only (the hook could sit in the shell, but it must not run for
  students, so it belongs with the teacher code).
- Migration cost: small.
- What it guards: case 5 only. Cases 1–4 stay as they are.

**The error log itself** (needed by A and by C; it is its own decision, §8 item 8):
- A table `client_errors` written by one RPC `report_client_error`, callable by **teachers only**
  (signed in, teacher role). Students write nothing, so the telemetry gate is untouched.
- Each row: the teacher's user id, the route **pattern** (`/classes/:classId/progress`, never the real
  ids or query string), the build's commit, a short error kind (`load_failed`, `refused`,
  `render_threw`, `unhandled`), the RPC name when there is one, and the message cut to 300 characters.
  No page content, no student names.
- Rate limit: at most 20 rows per teacher per hour, enforced in the RPC; the same error from the same
  page within a minute is counted, not repeated.
- Kept 30 days, removed by a nightly prune that is **armed from day one** (unlike the four student-work
  prunes: this table holds no student work, and a log nobody prunes is a log that grows forever).
- The author reads it with one saved query (or a small panel later). No alerting in v1.
- It is a migration, so: the author applies it; the UI that calls it is pushed only after
  (CLAUDE.md, migration-before-push); `docs/compliance/data-map.md` and `retention-policy.md` change in
  the same commit.

## 5. Recommendation

**Option A plus the teacher-only error log.** It fixes what teachers can actually hit, costs the
student shell nothing, adds no dependency, and grows out of a hook the repo already trusts. A library
is not ruled out for ever; its trigger is the realtime-push arc (STATE follow-on 2) or a screen that
needs data shared live between screens — at that point the extra parts start to pay.

What stays exactly as it is: the student viewer (P7), the student practice screens (`FactsEntry`,
`MixedRunner`, `FactRunner`), the saves (`useAutosave`, `saveQueue`, `pendingRowWrites`), and the four
module caches (P4), which can later sit under `useLoad`'s cache but do not need to.

## 6. Slicing plan (each slice ships on its own)

**Slice 1 — the hook, on its two existing users.** Add `lib/useLoad.ts` and `<LoadState>` (promoted
from `useProgressLoad`, plus the slow flag, the "Details" toggle and `reportLoadFailure()`, which in
this slice only writes to the console). Move `ClassProgress` and `ActivityProgress` onto it and delete
`useProgressLoad`. Guards: rendered-output tests for every state (first-load failed with Try again,
refused, refresh-failed keeps the old grid, slow after 8 s, latest-wins with two answers out of order),
each mutation-tested once by breaking the hook and watching it go red; a shell forbidden-marker so
`useLoad` can never enter the entry chunk. No migration, no deploy.

**Slice 2 — the lists, with the cache.** Move `Activities`, `Classes` and `Bank` onto `useLoad` with a
keyed cache and re-read on tab return (throttled to once per 30 s; never on a screen with an open form
or dialog). Back-navigation then shows the list at once. Cache cleared on sign-out and on a user switch
(the pattern `versionContent.ts:47-51` already uses). Add the **ratchet test**: count the hand-rolled
`cancelled/live/alive` flags in `packages/app/src` and fail if it rises (the same shape as
`db-rpc.test.mjs`'s `CAST_CEILING`).

**Slice 3 — the silent catches.** Go through the ~80 silent catches (42 empty blocks, 38 silent promise
catches). Each one ends up as either (a) kept silent with a one-line reason a reader can check, or (b)
sent to `reportLoadFailure()`, or (c) shown to the teacher. A second ratchet counts empty catches with
no reason line. Student-side files are classified but only (a) or (c) — never (b) — while the
telemetry gate holds.

**Slice 4 — the error log** (only if decision 8 is yes). Migration: `client_errors`, `report_client_error`
(teacher-only, rate-limited), the 30-day prune scheduled nightly, a `verify-01xx.sql` that proves a
student call is refused, the 21st row in an hour is refused, and the prune job exists. Compliance docs
in the same commit. Then `reportLoadFailure()`, `AppErrorBoundary` and a `window` error /
`unhandledrejection` hook (teacher sessions only) call it. Order: author applies the migration →
live-check (`pnpm db:types:live-diff`) → push the UI.

**After that:** remaining teacher screens move to `useLoad` when they are next touched — no big-bang
rewrite. The ratchet shows progress.

## 7. What this does NOT do

- No change to any student surface, and no student data collected.
- No automatic page reload, ever; no retry loops (one "Try again" button; the re-read on tab return is
  the only automatic re-read, and only on list screens).
- No `AbortController`. Ignoring a late answer (latest-wins) is enough here; cancelling the request
  saves a little bandwidth and adds a code path every call site must thread through. Revisit if a load
  turns out to be big enough to matter on school wifi.
- No change to saves or mutations.
- No alerting or emails from the error log in v1.

## 8. Decisions for the author (yes / no each)

1. **Build our own small loading hook (`useLoad`) instead of adopting a library.** It grows out of
   `useProgressLoad`, which the progress pages already use. *Recommend: yes.*
2. **No data library anywhere for now, teacher side included.** Revisit when the realtime-push arc
   starts or a screen needs data shared live between screens. *Recommend: yes.*
3. **The student side is left alone.** The student viewer and the practice screens keep their own
   loaders, and a guard stops `useLoad` from ever entering the student shell. *Recommend: yes.*
4. **One standard look for loading trouble on teacher screens:** a plain sentence and a "Try again"
   button when the first load fails; the server's raw text only behind "Details"; "Taking longer than
   usual" after 8 seconds (the same timer students get); and when a refresh fails, keep showing the
   last good data with "Couldn't refresh — showing 9:41". *Recommend: yes.*
5. **Lists remember their last answer for the rest of the visit** (Activities, Classes, Bank): coming
   back shows the list at once while a fresh copy loads behind it. Forgotten on sign-out. *Recommend:
   yes.*
6. **Those lists re-read by themselves when the teacher comes back to the tab**, at most once every
   30 seconds, and never while a form or dialog is open. Not a page reload — the list just updates.
   *Recommend: yes.*
7. **Move screens over as they are touched, not all at once**, with a test that fails if the number of
   hand-written loaders goes up. *Recommend: yes.*
8. **A teacher-only error log.** When a teacher's screen fails to load or crashes, the app records what
   broke (page pattern, build, error kind, a short message — no student names, no content) in a table
   the author can read. Teachers only; students send nothing. Kept 30 days, pruned nightly from day
   one. Needs a migration and an update to the compliance pack. *Recommend: yes.*
9. **Every silent failure gets a reason or a report.** Each of the ~80 places that throw a failure away
   either keeps doing so with a written reason, or reports it (teacher side), or tells the person.
   *Recommend: yes.*
10. **The error log's prune is armed from the start** (nightly, real run), unlike the student-work
    prunes, because it holds no student work. *Recommend: yes* — only matters if 8 is yes.
11. **Build order is slices 1 → 2 → 3 → 4 as above**, and the whole thing goes into TODOS with a trigger
    ("before the first February class") rather than straight into the build queue. Ranking is yours.
    *Recommend: yes.*
