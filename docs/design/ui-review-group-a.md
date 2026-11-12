# UI review group A — work lost without warning (design pass, 2026-11-13)

Status: **PROPOSED, awaiting the author's rulings (G-1 … G-8).** Source:
TODOS.md → "UI review 2026-11-13", group A (items 1–7). Every fact below was
re-read in the code on 2026-11-13; file references are to that reading.

The common thread: a teacher or student does one ordinary thing and loses work
or locks students out, and nothing on screen says so first. The fixes split into
**say it before it happens** (a confirm that names the cost), **let it be taken
back** (undo / restore), and **stop losing it** (keep what was made).

## What the code does today

| # | Action | What is lost | Today's guard |
|---|---|---|---|
| 1 | Student signs out, or is signed out after 30 min idle + 2 min grace | every unchecked answer on the device and any queued offline check (`signOutEverything` purges `activity-viewer:*` from local + session storage) | idle prompt "You'll be signed out soon to keep this device safe", not sticky, no button; Home "Sign out" has no warning |
| 2 | Teacher inserts a blank and leaves it empty | the blank, on the next reload (`serialize.ts` `tiptapBlankToActivity` drops `answer: ''`; schema `BlankToken.answer` is `min(1)`) | none — the chip stays on screen until reload |
| 3 | Teacher republishes | ~~a student who reloads loses unchecked answers~~ **CORRECTED 2026-11-13 while building:** unchecked answers are protected — a student with unsent work on the old version is kept on it (S6-9, `findUnsentWork` + the pinned document in `StudentViewer.tsx`). What a republish does cost: checks and their restore are keyed by version (0040, 0060), so on the new version every section starts unchecked, locked and DoL included | none — `onClick={publish}` |
| 4 | Teacher clicks "Release all graded" | nothing lost, but it can't be taken back (no un-release exists); a mid-loop failure replaces the queue with the load error | none |
| 5 | Teacher deletes a class | the class leaves every student's Home. It is a SOFT delete (`soft_delete_class`), but no restore RPC exists and no purge exists either (TODOS "A class purge does not exist") | a text link that reads "Really delete?" for 4 s |
| 6 | Teacher deletes an activity | it leaves every class Home at once | 7-second undo toast; `restore_activity` (0012) works for 30 days but nothing in the UI reaches it after the toast |
| 7 | Teacher clicks "New code" | the posted / written-up join code stops working | a tooltip |
| 8 | Teacher edits in two tabs, or a save fails | the other tab's edits (last write wins, no version check); a failed save is not retried until the next keystroke | red text below the header, no retry, not announced |

## Decisions

**G-1. Student sign-out tells the student what it clears.** Recommended:
- Home's "Sign out", when this device holds unchecked answers, asks first:
  "You have answers you haven't checked in *N activities*. Signing out clears
  them from this device." → **Go back** / **Sign out anyway**.
- The idle prompt becomes a fixed bar (seen wherever the student has scrolled,
  which also fixes UI review item 16's idle-banner half), names the same cost
  when there is one, and gets an **I'm still here** button.
- Shared-device wiping stays exactly as it is (S6-6). Only the telling changes.
- *As built:* "unchecked" = an answered item no checked section's results
  cover, or a queued / in-flight check (`bufferHasUncheckedWork`); graph work
  counts the way the grader counts it (`graphWorkTouched`, drift-tested against
  `isUntouched`). **Known limit (Fable review):** an answer changed after its
  section was checked still counts as checked — the buffer keeps no copy of
  what was sent. Closing it needs an "edited since check" flag in the buffer;
  not built.
- *Not in this pass:* saving unchecked answers to the server so nothing is lost
  and work follows a student to another Chromebook. That is the real cure, but
  it is a new table of student-derived rows (data-map, retention policy, likely
  a counsel question) and gets its own design pass. Filed in TODOS with that
  trigger.

**G-2. An empty blank is kept, marked, and refused only at publish.**
Recommended:
- `BlankToken.answer` loosens to allow `''`, so a draft round-trips the blank
  the teacher made.
- The chip shows **needs an answer** (as maths gaps already do).
- Publishing refuses while any blank is empty, and names them with a "Show me"
  link that selects the first one. This is the first rule of the pre-publish
  check (group B item 8), built so B can add rules to it.
- Cost: a schema change, so both server bundles are rebuilt and committed. The
  servers never see an empty answer (publish refuses it), so no redeploy is
  needed for this alone.
- Images: an empty image placeholder still drops (low harm, nothing typed is
  lost). Say so in the doc, not in the UI.

**G-3. Republish asks first when students would feel it.** Recommended:
- When the activity is in a class and at least one student has started it, the
  Republish button opens a confirm. *As built (wording corrected to match S6-9,
  see the table):* "*N students have started this.* On the new version their
  sections start unchecked. Answers they haven't checked stay with the version
  they started until they check them."
- If the activity has locked or DoL sections, the confirm adds: "Locked and DoL
  sections start again for everyone."
- **Republish** / **Keep editing**.
- No students started → no confirm (nothing to lose).
- If the count can't be read → the confirm shows without the number.
- *Rider:* when nothing changed since the live version, the button says
  "No changes" and is disabled, instead of today's red "Publish failed:
  Nothing to publish" (group B item 10's second half — it is the same button).

**G-4. "Release all graded" confirms, and a partial failure keeps the queue.**
Recommended:
- Confirm: "Release grades to *N students*? They'll see their marks and your
  comments. You can't take a release back."
- If a release fails part-way, the queue stays, with "Released 4 of 6. 2
  didn't go through." and **Try again**. Today the error replaces the whole queue.
- Un-release is not offered: a student may already have read it.

**G-5. Deleting a class: a real confirm, an undo, and a way back.**
Recommended:
- A dialog names the class, its student count and its activity count.
- After deleting: an undo toast, as activities have.
- **Recently deleted** on My classes lists deleted classes with **Restore**.
- New migration 0086: `restore_class` (owner-only, mirrors `restore_activity`),
  with a verify script.
- No purge is added. Deleted classes stay restorable until a purge is ruled, and
  the list says "kept until you remove it" only if a purge exists.

**G-6. Deleting an activity that is in a class asks first; Recently deleted
for activities too.** Recommended:
- An activity in no class keeps today's one click + undo.
- One in a class asks: "Delete *title*? It comes off *7A's* and *7B's* Home
  now." The row already computes `classesHolding`.
- **Recently deleted** on My activities lists soft-deleted activities with
  **Restore** and "removed for good on *date*" (the 30-day purge), using the
  existing `restore_activity`.

**G-7. "New code" confirms.** Recommended: "Replace code 4JUNKC? The old code
stops working; students already in the class stay in." → **Replace** /
**Cancel**.

**G-8. Autosave says where it stands, retries, and won't overwrite another tab.**
Recommended:
- A small status by the title: *Saving…* → *Saved*. On failure: *Not saved —
  Retry*, announced (`role="alert"`).
- A failed save retries on a back-off (2 s, 5 s, 15 s, then every 30 s) and
  immediately when the browser comes back online.
- Each save sends the `updated_at` it last read. If the row moved (another tab
  or device), saving stops and says "This activity changed in another tab or
  device. **Reload** to see the latest". This tab's unsaved edits are kept in
  memory and offered for copy. Last-write-wins no longer happens silently.
- The leave-page guard already covers a closed tab. An in-app link away now
  waits for the save, or warns if it failed, instead of firing and forgetting.

## Build shape (if all yes)

- Four commits, each with its own tests and a Fable review:
  - **app-only:** G-1, G-4, G-6, G-7
  - **schema + bundles:** G-2
  - **publish confirm:** G-3
  - **migration 0086 + Recently deleted + autosave:** G-5, G-8
- Author steps: apply 0086 live and run `verify-0086` before the push that
  ships G-5's Restore (a push is a deploy, OV-7).
- Shell size: everything here is teacher-side, except G-1's Home dialog and
  the idle bar. Those are small, but they spend from the student spend meter
  (shell-size review D-policy). The meter's number goes in the commit.
