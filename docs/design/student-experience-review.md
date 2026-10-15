# Student experience: UX-lens review (RULED 2026-10-14)

> **Status:** the author ruled S1–S9 all as recommended (2026-10-14).
> **BUILT:** S4, S6, S7, S8, S9, plus two rulings made during the build:
> D1 (shell CSS cap 15 → 16.5, DECISIONS.md) and D2 (no theme switch inside an
> activity). **NEXT:** S1–S3 + S5 go through `/plan-eng-review` before code.

**Method.** Code read of the student surfaces (`Home.tsx` → `StudentHome`,
`StudentViewer.tsx`, `viewer/src/container/ViewerContainer.tsx`,
`viewer/src/store/*`, `lib/studentAuth.ts`), plus a stubbed browser walk on the
e2e student lane (desktop 1100px and phone 390px). Stubs, not live: no real
student account can be driven from here. Join and number facts were read but
not walked in depth; their flows had their own design boards (R5-DR, D43).

## The journey and the goal

**Student goal:** *"What do I have to do, have I done it, and how did I go?"*
The surfaces today answer only the first part.

1. **Home.** Classes, each with its activities: title + "Added Oct 14". A
   "Number facts practice" link sits in the same list. "Join another class"
   form is always open at the bottom. Header: "Activity Platform" + the raw
   email + Sign out.
2. **Open an activity.** Topbar: title, course meta, a Print button. No way
   back to Home except the browser's Back button. No sense of length or
   progress.
3. **Answer and check.** One "Check" button per check group; after it, inline
   verdicts and a status line ("Checked."). No summary at the end, no "you're
   done", no next step.
4. **Come back later.** If the student signed out (or was signed out after
   idling), the activity reopens BLANK: no answers, no "Checked.", nothing.
   Walked: check → clear the device storage exactly as sign-out does → reopen
   → the Check bar is fresh and the status line is gone.
5. **Home again.** Unchanged: nothing says the activity was done, nor that a
   teacher's feedback is waiting.

## Root cause of the headline finding

Progress lives only on the device. The viewer keeps answers and section status
in the local buffer (`viewer/src/store/buffer.ts`, by design for offline work),
and `signOutEverything` deletes that buffer on every sign-out
(`lib/studentAuth.ts:85`, by design for shared Chromebooks). The server HAS the
truth (every check is a `section_checks` row, readable by its own student under
RLS), but no student surface ever reads it back. The one server read the viewer
makes is released teacher feedback (`get_my_released_feedback`). So the two
safety rulings are each right, and together they erase the student's record of
their own work on any shared or second device.

## Lens scores

1. Task over schema ⚠️. Home shows "Added <date>", which is the teacher's data
   (when it was shared), not the student's ("is this done?").
2. Visibility of action ❌. No visible way back to Home from an activity.
3. Progressive disclosure ⚠️. The join form is permanently open on Home for a
   rare action.
4. Locus of intent ✅. Check sits with the work it checks (D1 names its scope).
5. Two doors ⚠️. Browser Back is the only route home.
6. Default to done ✅. Nothing to configure.
7. Visible system state ❌. The headline: no done/not-done on Home, no progress
   in the activity, and a checked activity looks unstarted after sign-out.
   Feedback arrival is invisible until the activity is opened.
8. Reversibility ✅. Answers can be changed and re-checked (except lock mode,
   which says so before it locks).
9. Recognition over recall ❌. The student must REMEMBER which activities they
   did; on a shared device the system actively forgets for them.
10. Name by the user's concept ⚠️. "Activity Platform" is our name, not theirs;
    "Your classes" is right.

## Other findings from the walk

- **F-a. Topbar layout.** The meta line and Print button sit in a left column
  that does not line up with the title; on a phone the topbar takes ~120px.
- **F-b. Phone overlap.** The floating "Glossary" button sits on top of the
  sticky Check bar at 390px wide, covering part of its tap area.
- **F-c. No end of activity.** A long activity just stops at its last Check.
  The code already anticipates a "completion panel" (comment at
  `StudentViewer.tsx`, ruling 7.3A) that was never built.
- **F-d. Stale test comment.** `e2e/helpers/studentSession.ts` says nothing in
  the viewer calls `fetchReleasedFeedback`; it is wired at
  `StudentViewer.tsx:366`. A comment that asserts a fact the code contradicts
  (policy P11).

## Decisions (author rules each)

**S1. What "done" means.** *Recommend:* an activity is **done** when every
check group in the version the student opened has been checked at least once.
Correctness is not required (that is the teacher's grade, not completion).
Items graded by hand count when submitted. An activity with nothing to check
has no done state, so Home shows no status for it. Alternatives: "every
section correct" (punishes the student for the teacher's grading), or "opened"
(meaningless).

**S2. Home shows status per activity.** *Recommend:* replace "Added <date>"
with one of **Not started · In progress (2 of 4) · Done ✓**, plus **Feedback
ready** when the teacher has released feedback on it. ("Unread" feedback would
need the platform to record what each student has opened, which is new
personal data and a compliance-pack change, so it is not recommended for
v1.) Keep the order. Needs ONE new student RPC (e.g.
`my_activity_progress()`) so Home stays one round trip; it reads
`section_checks` and the released-grade table for the caller only.

**S3. Restore on reopen.** *Recommend:* when the device has no buffer for this
activity, the viewer loads the student's latest check per section for the
version from the server and shows those answers and their "Checked" status,
as if the buffer had survived. Shared-device safety is unchanged: the read is
scoped to the signed-in student's own rows, and sign-out still wipes the
device. Republish rule (needs ruling): checks on an OLDER version show on Home
as "Done (earlier version)" and the worksheet opens fresh with a one-line note
"Your teacher updated this activity". That matches how attempts are already
numbered per version (S4-B4).

**S4. A way back to Home.** *Recommend:* a "← My classes" link in the activity
topbar. Cheap; no data.

**S5. Progress inside the activity, and an end.** *Recommend:* "2 of 4 sections
checked" in the topbar, and the never-built completion panel after the last
check group: "All sections checked ✓" plus a "Back to my classes" button. Same
data as S3, so it ships with S3.

**S6. Topbar tidy (F-a).** *Recommend:* title and meta in one aligned block,
Print as an icon button, a slimmer phone topbar.

**S7. Glossary/Check overlap on phones (F-b).** *Recommend:* fix now. It's a
layout bug.

**S8. Home tidy.** *Recommend:* header reads the student's name (or "My
classes") instead of "Activity Platform" + raw email; "Join another class"
collapses behind a link once the student has a class; Number facts gets its
own visually distinct row so it doesn't read as one more activity.

**S9. Fix the stale comment (F-d).** *Recommend:* yes, with the S7 fix.

## Build shape if all yes

- **Now, app-only (no ruling dependencies beyond yes):** S4, S6, S7, S8, S9.
- **Next, needs `/plan-eng-review` first:** S1–S3 + S5. A migration for the
  progress RPC, plus a per-version count of check groups. Nothing stores that
  count today: `activity_version_items` lists items, not groups, so it is
  derived at publish or computed from the version's content. Then a
  verify-*.sql, RLS reasoning for the student read path, and the restore path
  in the viewer store. Migration before push (OV-7). Compliance pack: no new
  personal-data column is expected (it reads existing rows), but the eng pass
  confirms that before the doc is called untouched.

---

## Eng review of S1–S3 + S5 (`/plan-eng-review`, 2026-10-15)

**Target:** this document's S1 (what "done" means), S2 (Home status), S3
(restore on reopen) and S5 (in-activity progress + completion panel), all ruled
yes on 2026-10-14. Report file: this document.

**Scope record.** Feature answers: none proposed for cutting (all four ruled).
Structure: **D3 → Smaller arrangement** (answered 2026-10-15). Accepted scope:
S1/S2/S3/S5 as ruled, built so that check-activity writes each check row's
gradable-section total (`section_checks.section_total`) and serves a new
read-only restore mode; no census change, no backfill, no get-activity
redeploy. Accepted consequence: checks made before this ships carry no total,
so Home shows them as "Started" until the student checks again. Pending
remedies: R1–R4 below.

### Findings (Scope Challenge + Sections 1–4)

Evidence kind for all: static read of the named files; no live run.

1. **[P1] (9/10) `viewer/src/server/check-activity-handler.ts` imports
   `serveSeed`, `deriveSeedValues`, `substituteSeedValues`.** Solutions are
   rebuilt per student from the raw document plus that student's serve seed.
   A restore that skipped the seed path would show another student's numbers.
   Necessary implementation of S3: the restore mode runs the same seed path as
   a check. *No decision needed.*
2. **[P1] (9/10) same file, header: "The chain runs BEFORE the document is
   fetched … the difference between a grading service and an answer-key
   API."** The restore mode must run the identical authorization chain before
   reading the raw document, and must return sections ONLY where the caller
   has a `section_checks` row on that version, read with the caller's JWT
   under RLS (`section_checks_select_student`, 0020). Necessary
   implementation of S3. *No decision needed.*
3. **[P1] (9/10) `supabase/migrations/0040_check_lock.sql:50-54` drops and
   re-creates `record_check`.** Adding `p_section_total` the same way opens a
   gap: between applying the migration and redeploying check-activity, the
   live function calls `record_check` without the new argument. The new
   parameter must be **`default null`** so the old caller still resolves,
   with the 0015 revoke/grant stanza. Necessary implementation of D3.
   *No decision needed.*
4. **[P2] (8/10) `section_checks` comment in 0020: "A retry after a slow
   cold start (3-4 s measured)".** A restore call to check-activity can cost
   a cold start on open. How the worksheet behaves while that call is out is
   a real choice → **R1**. Whether to skip the call when the student has no
   checks at all → **R2**.
5. **[P2] (8/10) `viewer/src/store/persistence.ts` `PersistedViewerState`.**
   Restore writes into the same shape the local buffer hydrates (`responses`,
   `checked`). Existing behaviour at risk: buffer-first hydrate, the
   foreign-user refusal, the queued-check replay, the pinned-version path,
   the sign-out purge. Regression contract → **R3** (IRON RULE).
6. **[P2] (7/10) Two definitions of "how many sections can be checked".**
   Server: the gradable-section total check-activity computes from the raw
   document (D3). Client (S5): the sections the viewer renders under a Check
   button. If they disagree, Home says "Done" while the activity says "3 of
   4". Required proof (P4, rosters cross-checked): one test asserting the
   two counts agree on the fixture documents. *No decision needed.*
7. **[P3] (7/10) S3 as ruled restores only when the device has NO buffer.**
   A student who checks on device B, then returns to device A that still
   holds an older buffer, sees A's older state. Ruled scope; filed as a TODO
   choice → **R4**.
8. **Performance: no issues found.** The progress RPC reads `section_checks`
   through `section_checks_attempt_idx (student_id, activity_version_id,
   section_id, attempt_number)` (0020:88) and released feedback through
   `check_grades_released_idx` (0034:98); rows per student are tens to
   hundreds [estimated]. Restore payload is bounded by section size, the same
   bound as a check response (grading/index.ts B9 note).

### Decision ledger

### R1: worksheet behaviour while a restore is loading
Finding: 4, P2, 8/10, 0020 cold-start note, reviewer: Claude (this review)
Plan baseline: S3 ruled "load latest answers and Checked status from the server"; loading behaviour unspecified
Runtime evidence: no restore path exists today (unknown latency; 3-4 s cold start measured for checks)
Comparison grid:
| Choice | Current | A | B |
|---|---|---|---|
| R1 loading behaviour | unspecified, pending | editable at once; restored work fills only sections the student has not touched | inputs frozen with "Loading your earlier answers…" until it returns or fails (8 s bound) |
| R2 skip-when-no-checks | pending | pending | pending |
| R3 regression contract | pending | pending | pending |
Question D4:
D4 — While a student's earlier work is loading from the server, what should the worksheet do?
Project/branch/task: main, S3 restore on reopen (eng review finding 4).
ELI10: On a fresh device the activity opens, then asks the server for the student's earlier answers. That can take a few seconds the first time (the check function's 3-4 s cold start). Either the student can start working straight away and the earlier work slides into the sections they haven't touched, or the page holds still until it arrives.
Stakes if we pick wrong: freezing makes every fresh-device open feel slow; filling without a rule could overwrite what the student just typed.
Recommendation: A because the student never waits, and "only untouched sections" means nothing they typed is ever replaced.
Note: options differ in kind, not coverage — no completeness score.
Pros / cons:
A) Fill untouched sections (recommended)
  ✅ No wait on open, even when the check function is cold
  ✅ A late or retried restore can never overwrite the student's own typing
  ❌ A section typed into before the restore lands keeps the new answer, not the old checked one
B) Freeze until loaded
  ✅ One simple rule: the page is either loading or ready, no partial states
  ✅ The restored work always appears whole, exactly as last checked
  ❌ Every fresh-device open of a checked activity waits up to the cold start
Net: instant use with a section-level merge, versus a short frozen wait with no merge.
Header: Restore wait
Options:
A) Fill untouched sections (recommended)
The worksheet is usable immediately. When the restore arrives it fills only sections with no answers and no check yet; anything the student already typed wins. A banner offers Retry if the restore fails. ~same build effort either way.
B) Freeze until loaded
Inputs stay frozen with a "Loading your earlier answers…" line until the restore returns, fails, or 8 s pass; then the worksheet unfreezes. Simpler rule, but every fresh-device open of a checked activity waits on a cold start.

State: approved
Actual answer: A) Fill untouched sections (D4, author, 2026-10-15)
Accepted scope: the worksheet is editable at once; when the restore returns it fills ONLY sections with no responses and no check result in the store; a failed restore shows a banner with Retry, and a retry obeys the same untouched-only rule. Tests: a late restore never overwrites a typed section; a failure shows Retry; a retry fills only untouched sections.
History: none

### R2: skip the restore call when the student has no checks
Finding: 4, P2, 8/10, reviewer: Claude (this review)
Plan baseline: not in S3; proposed here
Runtime evidence: students can SELECT their own `section_checks` rows directly (0020 `section_checks_select_student`), a PostgREST read with no cold start
Comparison grid:
| Choice | Current | A | B |
|---|---|---|---|
| R1 loading behaviour | approved: A (D4) | A (unchanged) | A (unchanged) |
| R2 skip-when-no-checks | pending | a cheap own-rows existence read first; the check function is called only if a row exists | always call the check function's restore mode on a buffer-less open |
| R3 regression contract | pending | pending | pending |
Question D5:
D5 — Should the viewer first ask "has this student ever checked this?" before calling the slow restore?
Project/branch/task: main, S3 restore on reopen (eng review finding 4).
ELI10: Most opens on a fresh device are activities the student has never touched. A quick database question ("any checks of mine on this version?") answers that in one fast read. Only when the answer is yes does the viewer call the check function, which may be cold and slow.
Stakes if we pick wrong: without it, every first open of every new activity wakes the check function for nothing, adding load and a background request that can fail and show a pointless Retry banner.
Recommendation: A because one fast read removes nearly all restore calls and every failure banner for untouched activities.
Note: options differ in kind, not coverage — no completeness score.
Pros / cons:
A) Check first (recommended)
  ✅ Untouched activities never wake the check function or show a restore banner
  ✅ Uses an existing student read permission (0020 policy); nothing new to secure
  ❌ One more small request on every buffer-less open (one indexed row lookup)
B) Always call restore
  ✅ One code path; the restore mode itself answers "nothing to restore"
  ✅ No second query shape to test
  ❌ Every first open of a new activity costs a cold-startable function call
Net: one cheap read on every fresh open, versus a slow call on every fresh open.
Header: Check first
Options:
A) Check first (recommended)
Before calling restore, the viewer reads whether the student has any own `section_checks` row for this version (RLS-scoped, indexed). Restore runs only if one exists. Tests: no row → no restore call; a row → restore call.
B) Always call restore
On every open with no device buffer, call check-activity's restore mode; it returns an empty set when there is nothing to restore. Tests: empty set → no change.

State: approved
Actual answer: A) Check first (D5, author, 2026-10-15)
Accepted scope: before any restore the viewer reads the student's own checked section ids for the served version (RLS-scoped, `select distinct section_id`, indexed); check-activity's restore mode is called only when that read names a section the device lacks (see D7 for the every-open rule). Tests: no rows → no restore call and no banner; rows all present locally → no restore call; a missing section → one restore call.
History: D5 answer (2026-10-15) scoped this to buffer-less opens with a `limit 1` existence read; widened the same day by D7 = C to every open, returning section ids instead of a boolean so the restore still runs only when needed.

### R3: regression contract for the viewer's hydrate path
Finding: 5, P2, 8/10, reviewer: Claude (this review)
Plan baseline: S3 ruled "only when the device has no buffer"
Runtime evidence: persistence.ts + StudentViewer.tsx (buffer hydrate, findUnsentWork pinning, foreign-user refusal), studentAuth.ts purge
Contract (behaviour to preserve): (1) a device buffer for (user, activity, version) always wins and restore never runs when it exists; (2) a foreign user's blob is never hydrated; (3) unsent work on an older version still pins that version, and restore never runs for a pinned open; (4) restore never creates a queued check or an in-flight key; (5) sign-out still purges everything, restored data included, because restore writes only under the signed-in user's buffer key; (6) restore never writes a `section_checks` row and never counts toward the check rate limit. Intentional change: a buffer-less open of a checked activity now shows the earlier answers, Checked status, solutions and lock state.
Comparison grid:
| Choice | Current | A | B |
|---|---|---|---|
| R1 | approved: A (D4) | unchanged | unchanged |
| R2 | approved: A (D5) | unchanged | unchanged |
| R3 contract (1)–(6) | pending | adopted | adopted |
| R3 proof depth | pending | unit + route tests for (1)–(6), plus ONE student-lane e2e: check, clear the device as sign-out does, reopen, see the answers and Checked | unit + route tests for (1)–(6) only |
Question D6:
D6 — How should we prove restore doesn't break the six things the viewer already gets right?
Project/branch/task: main, S3 restore (eng review finding 5, regression rule).
ELI10: Restore writes into the same saved state the viewer already loads from the device. Six existing guarantees must hold: the device copy wins, another student's copy is never loaded, unsent work keeps its version, no fake queued checks, sign-out still wipes everything, and restore never counts as a new attempt. The question is only how deep the proof goes.
Stakes if we pick wrong: a regression here hands one student another's work or loses unsent answers, the two failures this code was built to prevent.
Recommendation: A because the bug you found was only visible end to end (sign out, reopen), so the proof should walk that same path once.
Completeness: A=10/10, B=8/10
Pros / cons:
A) Unit + route + one e2e (recommended)
  ✅ Walks the exact journey that exposed the bug: check, sign-out wipe, reopen
  ✅ Catches wiring gaps unit tests miss (route mounts, real buffer key, real fetch)
  ❌ One more browser test on the student lane (~5 s) (human: ~2h / CC: ~15 min)
B) Unit + route only
  ✅ Faster suite; every guarantee still has a targeted test
  ✅ No new e2e stub to maintain
  ❌ The sign-out-then-reopen journey itself is never exercised in a browser
Net: one extra browser test buys proof of the journey that was actually broken.
Header: Proof depth
Options:
A) Unit + route + one e2e (recommended)
Adopt contract (1)–(6). Store/route tests for each, plus one student-lane e2e: check a section, purge `activity-viewer:` keys as sign-out does, reopen, assert the answers and "Checked." return and no new check request was sent.
B) Unit + route only
Adopt contract (1)–(6) with store/route tests for each; no new e2e.

State: approved
Actual answer: A) Unit + route + one e2e (D6, author, 2026-10-15)
Accepted scope: contract (1)–(6) adopted, with (1) AMENDED by D7: the device buffer wins SECTION BY SECTION (any section with local responses or a local check result is never touched by a restore), instead of "restore never runs when a buffer exists". A store or route test for each item; plus one student-lane e2e that checks a section, purges `activity-viewer:` keys as sign-out does, reopens, and asserts the answers and "Checked." return with zero new check requests.
History: D6 answer (2026-10-15) adopted (1) as "a device buffer always wins and restore never runs when it exists"; amended the same day because D7 = C extends restore to opens that have a buffer. The amendment narrows what the buffer protects from "everything" to "every section the student touched", which is what D4's merge rule already guarantees.

### R4: TODO — two devices, stale buffer
Finding: 7, P3, 7/10, reviewer: Claude (this review)
Plan baseline: S3 restores only when there is no buffer (ruled)
TODO draft — What: when a device buffer exists, also fill sections that are untouched-and-unchecked locally but checked on the server. Why: a student who works on device B then returns to device A sees A's older state. Pros: the R1 untouched-only rule already makes the merge safe. Cons: one restore call on EVERY open, not just buffer-less ones (more load, more cold starts). Context: S3 rules buffer-less only; R1 merge rule is the mechanism to reuse. Depends on: S3 shipped. Trigger: a student or teacher reports work "missing" on a device the student had used before.
Comparison grid:
| Choice | Current | A | B | C |
|---|---|---|---|---|
| R4 two-device merge | not planned | filed in TODOS with the trigger above | not filed | built now in this slice |
Question D7:
D7 — Two-device case: file it for later, skip it, or build it now?
Project/branch/task: main, S3 restore (eng review finding 7).
ELI10: Restore runs only when the device has nothing saved. If a student uses school Chromebook A, then a home laptop B, then goes back to A, A still shows its older saved copy and not what they did on B. Fixing it means asking the server on every open, not just fresh ones.
Stakes if we pick wrong: building it now doubles the restore traffic for a case nobody has hit yet; skipping it entirely loses the note for when someone does.
Recommendation: A because it is cheap to file with a clear trigger, and the merge rule from D4 makes it a small change when it is needed.
Note: options differ in kind, not coverage — no completeness score.
Pros / cons:
A) File in TODOS (recommended)
  ✅ Keeps this slice to what you ruled, with a named trigger for later
  ✅ The D4 merge rule means the later change is small
  ❌ A student switching devices sees older work until it ships
B) Skip it
  ✅ Nothing to track
  ✅ Shared Chromebooks are signed out between users anyway, so their buffers rarely survive
  ❌ The case is forgotten if a student does hit it
C) Build it now
  ✅ No device ever shows stale work
  ✅ Reuses the same merge rule and endpoint
  ❌ A restore read on every open of every activity (human: ~1 day / CC: ~30 min more)
Net: a filed trigger versus extra load now for an unreported case.
Header: Two devices
Options:
A) File in TODOS (recommended)
Add the TODO draft above to TODOS.md with its trigger; no code in this slice.
B) Skip it
No TODO and no code.
C) Build it now
Run the D5 existence read and the D4 untouched-only restore on every open, buffer or not.

State: approved
Actual answer: C) Build it now (D7, author, 2026-10-15)
Accepted scope: the D5 read runs on EVERY open (buffer or not) and returns the section ids the student has checked on the served version; check-activity's restore mode is called only when at least one of those sections is untouched-and-unchecked in the local store, and it fills only such sections (D4 rule). Pinned opens (unsent work on an older version) still never restore. Tests: a buffer with every server-checked section already present → no restore call; a buffer missing one server-checked, untouched section → one restore call that fills only that section; a typed-but-unchecked local section is never overwritten. No TODO filed (built instead).
History: none

Approval readiness: PASS — R1 (D4=A), R2 (D5=A, widened by D7), R3 (D6=A, (1) amended by D7), R4 (D7=C). No remedy without its own answer.

### Architecture (as approved)

```
OPEN /a/:id ─► get-activity (unchanged) ─► served version V
   │
   ├─ pinned? (unsent work on an older version) ──► render pinned, NO restore   [contract 3]
   │
   ├─ local buffer for (user, activity, V) ──► hydrate as today                [contract 1, per section]
   │
   └─ own checked section ids on V  ◄── PostgREST: section_checks, RLS own rows  [D5, every open: D7]
          │ none, or all present locally ─► done (no call, no banner)
          │ some section untouched+unchecked locally
          ▼
      check-activity  mode=restore  (caller JWT)
          ├─ same authorization chain as a check (published, version parentage)   [finding 2]
          ├─ latest own row per section on V  (caller JWT, RLS)
          ├─ solutions for THOSE sections only, via the caller's serve seed         [finding 1]
          └─ never record_check, never rate-limited                                 [contract 6]
          ▼
      store.mergeRestored(): fill ONLY untouched+unchecked sections               [D4]
          └─ failure ─► banner + Retry (same rule)

CHECK ─► check-activity ─► record_check(..., p_section_total default null)        [D3, finding 3]

HOME ─► list_class_activities (unchanged) ─┐
     └► my_activity_progress() (new, own rows, live classes only) ─► status per row
          per activity: current version total (latest own row's section_total),
          distinct checked sections on current version, older-version checks,
          released feedback exists
          null total ─► "Started"; older version only ─► "Done (earlier version)"
```

### What already exists (reused)

- The local-first buffer and its shape (`persistence.ts`); restore writes the same `responses` + `checked` maps.
- The check handler's authorization chain, raw-document load and seed path (`check-activity-handler.ts`), and the grader's solution assembly (`grading/index.ts`).
- The student's own-row read permission on `section_checks` (0020) and its `(student, version, section, attempt)` index.
- Released feedback (`check_grades.released_at`, 0034) for "Feedback ready".
- The class/membership join of `list_class_activities` (0030), copied, never widened (`can_read_activity` stays owner-only).

### NOT in scope

- Recording unchecked (typed, never checked) work on the server. Restore can only bring back what was checked; anything typed and never checked on another device is gone, as today.
- "Unread" feedback (needs per-student seen-state, which is new personal data).
- Backfilling `section_total` for checks made before release (D3 accepted "Started" for those).
- Grouping students' Home by unit (A4(b) in TODOS).

### Test coverage map

```
CODE PATHS                                              USER FLOWS
[+] 0059 record_check(p_section_total default null)     [+] Fresh device, checked activity
  ├── [GAP] old caller without the arg still records      ├── [GAP] [→E2E] check → sign-out purge → reopen (D6)
  └── [GAP] new caller stores the total                   └── [GAP] typing before restore lands is kept (D4)
[+] 0059 my_activity_progress()                         [+] Home status
  ├── [GAP] only live-class, own rows (verify-0059)       ├── [GAP] Not started / In progress (k of n) / Done
  ├── [GAP] null total → Started                          ├── [GAP] Done (earlier version)
  └── [GAP] older version only → earlier-version flag     └── [GAP] Feedback ready
[+] check-activity restore mode                         [+] Error states
  ├── [GAP] chain before raw read; foreign version → 404  ├── [GAP] restore fails → banner + Retry
  ├── [GAP] only sections with own rows get solutions     └── [GAP] progress fetch fails → list still shows
  ├── [GAP] seed path identical to a check
  └── [GAP] no record_check, no rate count
[+] viewer store merge + every-open rule (D5/D7)        [+] In-activity
  ├── [GAP] no rows → no call                             ├── [GAP] "k of n sections checked" updates on check
  ├── [GAP] all present → no call                         └── [GAP] completion panel after the last group
  ├── [GAP] missing untouched → fills only it
  ├── [GAP] pinned open → no restore            (contract 3)
  └── [GAP] foreign blob never hydrated         (contract 2, existing test extended)
[+] count agreement (finding 6)
  └── [GAP] client k-of-n total == server section_total on fixtures

COVERAGE: 0/25 paths tested (all paths are unbuilt code; every gap above is a required test of approved scope)
QUALITY: n/a until built  |  GAPS: 25 (1 E2E)
```

Test plan artifact: `~/.gstack/projects/ZanReed-activity-platform/user-main-eng-review-test-plan-20261015-141017.md`.

### Failure modes

| Path | Realistic failure | Covered by | User sees |
|---|---|---|---|
| Restore call | cold start or 5xx | D4 banner + Retry test | "Couldn't load your earlier answers" + Retry |
| Restore merge | restore lands after typing | D4 merge test | their typing kept |
| Deploy window | migration applied, old check-activity live | finding 3 default-null test | nothing (checks keep recording) |
| Progress RPC | RPC fails | separate-fetch test | activity list without status |
| Count drift | client and server totals differ | finding 6 cross-check test | (prevented) |
| Republish | old checks counted as new | progress RPC test | "Done (earlier version)" |

Critical gaps (untested AND unhandled AND silent): **0**.

### Worktree parallelization

| Step | Modules touched | Depends on |
|---|---|---|
| T1 migration 0059 | supabase/migrations, scripts, docs/compliance | — |
| T2 check-activity total + restore | packages/viewer/src/server | T1 (signature) |
| T3 viewer restore | packages/viewer/src/store, app/routes | T2 (wire shape) |
| T4 progress + completion panel | packages/viewer/src/container, styles | — |
| T5 Home status | packages/app/src/routes, lib | T1 (RPC) |
| T6 e2e | packages/app/e2e | T3 |

Lane A: T1 → T2 → T3 → T6. Lane B: T4 (independent). Lane C: T5 after T1. Execution: T1 first; then T2 + T4 + T5 in parallel; then T3; then T6. Deploy order (repo rules): apply 0059 live → redeploy check-activity (`pnpm deploy:check`, grading bundle committed) → push the SPA.

## Implementation Tasks
Synthesized from this review's findings. Each task derives from a specific
finding above. Run with Claude Code or Codex; checkbox as you ship.

- [x] **T1 (P1, human: ~4h / CC: ~20min)** — db — Migration 0059: `section_checks.section_total`, `record_check(... p_section_total integer default null)` with the revoke/grant stanza, `my_activity_progress()` (definer, own rows, live classes), verify-0059.sql, data-map range bump
  - Surfaced by: Scope Challenge — D3; finding 3
  - Files: supabase/migrations/0059_*.sql, scripts/verify-0059.sql, docs/compliance/data-map.md
  - Verify: local `supabase db reset` + verify-0059 rows; `pnpm verify`
- [x] **T2 (P1, human: ~6h / CC: ~30min)** — server — check-activity writes the version's gradable-section total; new read-only `restore` mode behind the same chain and seed path; grading bundle regenerated
  - Surfaced by: Architecture — findings 1, 2; D3
  - Files: packages/viewer/src/server/check-activity-handler.ts, grading/, check/wire.ts, supabase/functions/_shared/*.bundle.js
  - Verify: handler unit tests (chain-before-read, own-sections-only, seed parity, no record_check); `pnpm bundle:grading-server`
- [x] **T3 (P1, human: ~6h / CC: ~30min)** — viewer — own-section-ids read on every open, untouched-only merge, banner + Retry, pinned opens skip
  - Surfaced by: Decisions D4, D5, D6, D7
  - Files: packages/viewer/src/store/*, packages/app/src/routes/StudentViewer.tsx, client/httpCheckService.ts
  - Verify: store + route tests for contract (1)–(6) and the D7 rows
- [x] **T4 (P1, human: ~3h / CC: ~20min)** — viewer — "k of n sections checked" + completion panel; client/server count cross-check
  - Surfaced by: S5; finding 6
  - Files: packages/viewer/src/container/ViewerContainer.tsx, styles/viewer.css
  - Verify: container tests; cross-check test on fixture documents
- [x] **T5 (P1, human: ~3h / CC: ~20min)** — app — Home status from `my_activity_progress`, separate fetch
  - Surfaced by: S2
  - Files: packages/app/src/routes/Home.tsx, packages/app/src/lib/classActivities.ts
  - Verify: Home tests for each status; list survives a failed progress fetch
- [x] **T6 (P1, human: ~2h / CC: ~15min)** — e2e — check, purge as sign-out, reopen, answers + Checked return, zero new checks
  - Surfaced by: D6
  - Files: packages/app/e2e/student/restore.e2e.ts
  - Verify: `pnpm --filter @activity/app test:e2e:student`

### Outside voice

Codex is not installed and this session has no TaskOutput tool for the native
fallback, so no outside review ran. Recorded `outside_status: unavailable`;
missing coverage, not a clean review.

### Completion summary

- Step 0: Scope Challenge — scope accepted as-is (smaller arrangement, same features)
- Reality rows: 8/8 applicable rows emitted; 0 unverified premises in findings (every finding cites a file:line)
- Architecture Review: 4 issues found (findings 1, 2, 4, 7)
- Code Quality Review: 2 issues found (findings 3, 6)
- Test Review: diagram produced, 25 gaps identified (all unbuilt code)
- Performance Review: 0 issues found
- NOT in scope: written
- What already exists: written
- TODOS.md updates: 1 item proposed (R4), answered C (built instead)
- Failure modes: 0 critical gaps flagged
- Unresolved decisions: 0 in this review
- Outside voice: codex, unavailable (not installed; no native fallback tool)
- Parallelization: 3 lanes, 3 parallel / 3 sequential
- Lake Score: 1/1 (D6 picked the 10/10 option)

REALITY: premise-table pass findings 1-8 each quote a source; e.g. packages/viewer/src/server/check-activity-handler.ts:14-27 (chain before read), supabase/migrations/0020_section_checks.sql:88-89 (index)
REALITY: already-done pass `git log origin/main --since=2026-10-13` over census/server/migrations/Home returned nothing; base commit b60bd1ce
REALITY: surface-check pass supabase/migrations/0040_check_lock.sql:54 (record_check), supabase/migrations/0020_section_checks.sql:58 (section_checks), supabase/migrations/0034_check_grades.sql:86 (released_at), supabase/migrations/0030_class_activities.sql:177 (list_class_activities)
REALITY: binding-decisions pass "locked reveals solutions" from the flow-modes design decision is carried into the test plan; can_read_activity untouched per supabase/migrations/0030_class_activities.sql:17-20
REALITY: numbers pass cold start 3-4 s [measured: supabase/migrations/0020_section_checks.sql:74-75]
REALITY: numbers pass file counts and per-student row volumes [estimated: docs/design/student-experience-review.md:207-211]
REALITY: deferred-asks pass S1/S2/S3/S5 all in scope per docs/design/student-experience-review.md:147-161; nothing left out
REALITY: pr-count pass one batch of local commits on main (CLAUDE.md:27 "Never git push"; the author pushes)
REALITY: transaction-semantics n/a no driver, pool or protocol change (docs/design/student-experience-review.md:147)

### As built (2026-10-15, on Opus; local commits, NOT live)

T1 `5c8d50af` · T2 `421844e4` · T3 `fce03464` · T4 `a428680f` · T5 `50274110` · T6 `d4b0c319`.

- **"Done" simplified during the build:** every section sits in a check group
  and a pressed group records EVERY member section (store.ts `checkGroup`), so
  `section_total` is the version's section count, not a "gradable" count. The
  client counts the same thing; `viewer/tests/section-total-agreement.test.ts`
  pins served == raw through the real sanitizer.
- **Restore reads only the caller's rows by id**, not by RLS alone: the class
  teacher policy on `section_checks` would also return their students' rows.
- **Mutation-tested:** verify-0059 own-rows filter, the restore section filter,
  the merge-time untouched guard, the pinned-open guard, the completion panel
  condition; the e2e fails with a forgetful stub.
- **Release order (author):** apply 0059 live → run verify-0059 + verify-0020 +
  verify-0040 live → (recommended) a Fable review of the restore path →
  `pnpm deploy:check` and hash-verify the grading bundle → push. Pushing first
  would break Home's status (no RPC) and show every student the restore-failed
  banner (the old function rejects `mode: 'restore'` with a 400).

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Outside Review | codex (plan-review) | Independent 2nd opinion | 1 | unavailable | not installed; no native fallback tool |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | issues_open | 6 issues (25 test gaps are unbuilt code), 0 critical gaps |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — (UX-lens review above stands in) |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **OUTSIDE COVERAGE:** codex, plan-review phase, unavailable (not installed). No outside findings.
- **VERDICT:** Eng review ruled — D3–D7 answered, 0 unresolved; issues_open denotes mapped build work (T1–T6), not open questions. Ready to implement.

NO UNRESOLVED DECISIONS
