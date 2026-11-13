# UI review group E — features teachers and students would expect (design pass, 2026-11-13)

Status: **RULED 2026-11-13 (author: "Yes to all"); E-1 + E-8 BUILT the same day** —
see "As built" at the end; E-2…E-7 have triggers in TODOS. Originally proposed with Source:
TODOS.md → "UI review 2026-11-13", group E. Each fact below was re-read in the
code on 2026-11-13.

Groups A–D were fixes. Group E is **new features**, eight of them, and they
are very different sizes. CLAUDE.md's rule for new wishes is "a trigger, not a
slot: one build arc at a time". So this pass does two things: it sorts the
features by what they cost, and it proposes building only the cheap,
app-only ones now. The rest each get a trigger, or a design pass of their own.

## What the code has today

| Feature | What exists | What building it needs |
|---|---|---|
| Rename a class | `classes.name` is already updatable by its teacher (0027 grants `update (name)`); no button | app only |
| Duplicate my own activity | nothing (the Bank's copy is for listed activities) | app only, using the Bank's copy path or a plain insert of the draft |
| Already-copied marker in the Bank | 0054 records `copied_from_activity_id` on every copy; the Bank doesn't read it | app only |
| Paste or drop an image into the editor | no paste or drop handler; images only via the file picker (`uploadImage`) | app only |
| Export progress to CSV | no export anywhere; class progress already loads the whole grid | app only (built from data already on the page) |
| Hide / unpublish without deleting | the `archived` status exists in the enum (0001) and is never set; no RPC | a migration (an RPC, and what students and class rows see) |
| Archive a class at year end | no column, no RPC | a migration |
| One "to grade" inbox across activities | `list_grading_queue` is per activity (0034) | a migration (a cross-activity RPC) |
| Student: past attempts and score per activity; a "what next" panel | the server has every check; the student Home shows none of it | a migration (a student-scoped read), and design |
| Unchecked work following the student across devices | answers live in the browser until checked (S6) | its own arc: a server table of in-progress answers is new student data (compliance pack, retention, counsel) |
| Due dates | filed with its own list of questions (TODOS → "Due dates") | its own design pass |

## Decisions

**E-1. Build now: five app-only features (one build arc).** Recommended, each
small:
- **Rename a class.** A "Rename" control on the class card, inline, same as
  the title editing elsewhere. Its name follows D-6 ("Rename: Algebra I").
- **Duplicate my activity.** "Make a copy" on My activities. It copies the
  draft (or the published version if there is no draft) into a new draft
  titled "… (copy)", which opens in the editor. Not published, not in any
  class. *Question for you:* should a file-backed (catalogue) activity's copy
  be a normal editable activity (recommended: yes, it stops being
  file-backed), or should Make a copy be hidden for those?
- **Already copied, in the Bank.** An entry you've already copied says
  "In your library" with a link to your copy. Adding again still works (a
  second copy is sometimes what you want) but asks first: "You already have
  a copy. Add another?"
- **Paste or drop an image.** Pasting a screenshot, or dropping an image file
  onto the editor, uploads it exactly as the file picker does and inserts an
  image block at the drop point (or the caret). Same size limit and the same
  error message as the picker.
- **Export class progress to CSV.** A "Download CSV" on the class progress
  page: one row per student, one column per activity section, as the grid
  shows it (checked / percent / DoL passed), with the student's name. Built
  from what the page already loaded; nothing new is fetched. (The grid has no
  emails; adding them means one more read of the roster. Say if you want it.)
  *Not* grades from the grading panel in v1 (that's E-4's data).

**E-2. Hide an activity without deleting it: next, with a migration.**
Recommended shape, for its own short pass when E-1 is done:
- "Unpublish" sets the unused `archived` status. Students see the
  "not available" page they see today for a deleted activity; their checked
  work stays; class rows show the existing "No longer published" dead row.
- "Publish again" brings it back on its last version.
- Needs an RPC (status is not client-writable), a verify script, and the
  viewer's read path checked.

**E-3. Archive a class at year end: with E-2.** Recommended: an `archived_at`
column; an archived class leaves the main list (an "Archived classes" view,
like Recently deleted), its join code stops working, and students no longer
see it on Home. Their work stays. Same migration as E-2.

**E-4. One grading inbox across activities: trigger, not now.** It needs a
cross-activity RPC over every class's checks. **Trigger:** a teacher with
written answers waiting in more than one activity at once (today the per-cell
chips and each activity's Responses page cover it).

**E-5. Student past attempts, score and "what next": its own design pass.**
What a student should see about their own results is a pedagogy call (scores
on Home, or only "checked"?), and it touches the DoL and mixed-practice
wording. **Trigger:** after due dates (E-7), since "what next" and "what's
due" are the same Home row.

**E-6. Unchecked work across devices: file it, with a trigger.** A server copy
of in-progress answers is new student data: a table, a retention period, the
compliance pack, and counsel. **Trigger:** students using more than one
device for the same activity (school Chromebooks are usually one per
student). The S6 local-first store stays as it is.

**E-7. Due dates: the next design pass after E-1.** Its questions are already
in TODOS ("Due dates"); recommended order: E-1 build, then the due-dates
pass, then E-2/E-3.

**E-8. The submission-mode names.** Still open from group D: "Locked
checkpoints" / "Free checkpoints" in the activity settings, while the section
box now says "Check here". Recommended: **"Check each section, then lock"** and
**"Check each section, re-check freely"**, so the mode names say what happens.
Labels only: the stored values don't change. (Or leave them.)

**E-9. Test discipline, as before.** Each change mutation-tested; the paste/
drop path and the CSV in the browser lanes (the CSV checked for a name with a
comma and a quote in it); a Fable review per step.

## Build shape (if E-1 yes)

- **Step 1:** rename a class, duplicate an activity, already-copied marker.
- **Step 2:** paste/drop image, CSV export (+ E-8 if yes).
- No migration, no schema change, no deploy. Teacher-side only; the student
  shell is untouched.

## As built (2026-11-13)

Commits on `main`: 03270c31 + 455317af (step 1), 826a9489 (step 2, E-8, step
1 review fixes), plus the close-out commit. A Fable review per step; each
change mutation-tested. No migration, schema change or deploy. Rulings on the
two questions: a catalogue activity's copy is a normal editable activity, and
the CSV carries names only (no emails). Differences from the plan:

- **Make a copy is not offered on a Bank copy** (step 1 review). A client
  insert can't carry `copied_from_*` (the provenance guard), so a copy of a
  copy would lose its DoL pass, targeted practice, unit-tracker and glossary
  links to the original, and could be listed in the Bank as the teacher's own
  work. A provenance-carrying copy needs a DEFINER RPC: filed with a trigger.
  A catalogue activity's copy has no skills (`primary_skill` isn't copied),
  so its DoL checks as an ordinary section — filed too.
- **Paste / drop rebuilt after the step 2 review** (three HIGH findings,
  each measured against the real schema): the first version replaced the
  selection, so it could delete a selected neighbour (an image, a maths
  block — `Selection.near` lands on exactly such a node), split a choice
  question / fill-in line / table into two blocks with ONE id when the caret
  was mid-text, and took over an Office paste (Office puts a picture of the
  copied text beside it). Now the image goes at a computed position between a
  column's blocks (`imageInsertPos`: after the block the caret or drop point
  is in), never replacing anything; and a paste is taken over only when it is
  just an image (files and no text, or a lone `<img>`). Tests reproduce each
  case. The image-URL popover no longer opens on an already-filled image.
- **The CSV follows the grid, not sections.** The class grid holds one cell
  per student per activity, so the file has two columns per activity:
  sections checked ("3 of 5", "3 of 5 (older version)", "started (total not
  recorded)") and % right — read through the grid's own `cellStatus`, so a
  percent appears only on a done cell, as in the grid. DoL passes aren't in
  the class grid, so not in the file.
  Names are included even with "hide names" on (that switch is for a
  projector). Every field quoted; a name a spreadsheet would run as a formula
  gets a leading apostrophe; BOM + CRLF for Excel.
- **Paste / drop:** only image FILES are taken over; text and HTML pastes
  (even HTML holding an `<img>`) go to ProseMirror as before. Uploads go
  through `uploadImage` (same types, size limit and words as the picker); a
  status toast says "Uploading image…" or why it failed. A multi-image drop
  keeps every image — `insertImage` node-selects what it inserts, so without a
  step past it the next insert replaced it (caught by its test). In the
  playground (no activity) it says images can be added once the activity is
  saved.
- **Bank:** "In your library" links to the newest copy; "Add another?" is an
  inline ask; the Bank journey cap went 7.25 → 7.5 KiB (reason in the file).
- **E-8:** "Check each section, then lock" / "Check each section, re-check
  freely" — labels only.
