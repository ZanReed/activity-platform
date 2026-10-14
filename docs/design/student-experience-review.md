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
