# UI review group D — accessibility, touch and jargon (design pass, 2026-11-13)

Status: **RULED 2026-11-13 (author: "Yes to all") and BUILT the same day** —
see "As built" at the end. Originally proposed with Source:
TODOS.md → "UI review 2026-11-13", group D (items 22–26). Each fact below was
re-read in the code on 2026-11-13.

## What the code does today

| # | Where | Today |
|---|---|---|
| 22 | Student blank (`viewer/blocks/BlankInput.tsx`, also used by tables) | a plain `type="text"` input: a phone capitalises the first letter, autocorrects ("teh" → "the", "fraction" → "fractions"), and a red spellcheck underline tells the student a spelling answer is wrong before they check. The join-code inputs already turn all three off. |
| 23 | Locked section / DoL "Check" | pressing it swaps the button for a confirm (Cancel · Check and lock). The button that had focus is gone, so keyboard focus falls to the page body; a screen-reader user hears nothing and Tab starts from the top. Cancel does the same. Escape does nothing. |
| 24 | After a check | every result pill is its own `role="status"` live region (ruling 6.1A, from before there was a summary). A 10-blank section speaks 10+ times, on top of the group line, which now says "Checked: 7 of 10 right" (C-3). |
| 25a | Editor toolbar | B, I, U, `<>`, X₂, X² have no accessible name ("button") and no `aria-pressed`; only a colour shows they're on. |
| 25b | Slash menu (`SlashMenuPopover.tsx`) | plain buttons in a div: no listbox/option roles, and the highlighted item isn't announced as you arrow. |
| 25c | Moving a block | drag only, in the UI. ⌘⇧↑ / ⌘⇧↓ work (`BlockReorderShortcuts.ts`) but nothing on screen says so. |
| 25d | Class roster | every row's button is named "Remove": a screen reader lists 30 identical "Remove" buttons. |
| 26 | Teacher wording | "(rem)" on three work-space fields; "Checkpoint" (unexplained); "DoL" explained only in a hover tooltip; "Figure source — the same lines a \`\`\`figure fence takes"; the Bank preview shows raw misconception ids (`mis.nets.any-six-squares`). |

## Decisions

**D-1. A student's typed answer is left as typed.** Recommended:
- Blanks (and table cells, the same input) turn off autocapitalise,
  autocorrect, autocomplete and spellcheck, as the join-code box does.
- Written answers (short answer, essay, self-explanation) keep the browser's
  spellcheck: they go to the teacher, and spelling help there is writing help,
  not a give-away. *Alternative:* off everywhere.

**D-2. The locked/DoL confirm keeps keyboard focus.** Recommended:
- When the confirm opens, focus moves to **Cancel** (the safe choice, the
  usual pattern for a one-way action), and the confirm's question is read
  out (the group is labelled by its own sentence).
- Escape cancels.
- Cancel puts focus back on Check, and after Check and lock focus goes to the
  status line, as it does for an ordinary check today.

**D-3. One spoken summary per check, not one per question.** Recommended:
- The pills stop being live regions. The group's status line (already live,
  and since C-3 a real summary) is the one announcement.
- Each pill still says its state in words, so a screen-reader user hears
  "Correct" / "Try again" when they move to that question.
- This **reverses ruling 6.1A** (every pill announces). That ruling predates
  the summary; it is the cause of the 10+ announcements. Recorded in
  DECISIONS.md if you agree.

**D-4. Editor toolbar and slash menu speak.** Recommended:
- Every format button gets a name with its shortcut ("Bold (⌘B)",
  "Subscript", …), as a tooltip and an accessible name, plus `aria-pressed`
  for on/off.
- The slash menu becomes a proper list: list and option roles, and the
  highlighted item is announced as you arrow through it.

**D-5. A block can be moved without dragging.** Recommended:
- The block's ⋮ command bar gets **Move up** / **Move down** (with ⌘⇧↑ / ⌘⇧↓
  in their tooltips), running the existing shortcut code.
- Not on the small hover quick-bar: it already holds Delete, Duplicate and
  Settings, and a fourth and fifth button crowd every block.
  *Alternative:* on the quick-bar as well.

**D-6. Roster buttons name the student.** Recommended: "Remove" reads as
"Remove Ana Lopez" to a screen reader (the visible word stays "Remove").
Same sweep for any other repeated row button found while building
(class cards, activity rows), listed in the as-built notes.

**D-7. Plain words for teacher jargon.** Recommended:
- **Work space in lines.** The three "(rem)" fields show and take lines
  ("Work space: 3 lines"), the unit the import format already leads with.
  Stored as rem as today (no schema change). One line = `REM_PER_LINE`, the
  converter the importer already uses.
- **"Checkpoint" → "Check here".** The box reads "Students check this
  section (Check here)"; a one-line note under it says what it does.
- **DoL explained on screen,** not only on hover: a short line under the box
  when it's ticked ("Demonstration of learning: the check that shows the
  skill. One per activity."). The term DoL stays: it's the curriculum's word.
- **Figure source** reads "This figure as text — the lines a markdown import
  takes", without the fence syntax.
- **Misconceptions by description.** The Bank preview shows the misconception's
  description from the mirrored registry; the id moves to a tooltip.

**D-8. Test discipline, as before.** Each change mutation-tested. The a11y lane
grows: the confirm's focus (D-2), one announcement per check (D-3, counting
live regions after a check), the toolbar names (D-4). A Fable review per step.

## Build shape (if all yes)

- **Step 1, student side:** D-1, D-2, D-3. The student shell is measured
  (spend meter).
- **Step 2, editor and teacher:** D-4, D-5, D-6.
- **Step 3, wording:** D-7.
- No migration, no schema change, no deploy (work space stays stored as rem).

## As built (2026-11-13)

Commits on `main`: 9ece98d7 + f5521e1b (step 1, D-1…D-3), 89d58c45 (step 2,
D-4…D-6), 03d23eee (step 3, D-7, and step 2's review fixes), plus the
close-out commit. A Fable review per step; each change mutation-tested.
No migration or deploy. Differences from the rulings above:

- **D-3 + the DoL:** a DoL's status line never carried the C-3 tally, so with
  the pills silent a screen reader heard only "Passed." It now reads
  "Passed: 5 of 6 right." / "Checked: …. You can try a new version …".
  Ruling 6.1A's reversal is recorded in DECISIONS.md.
- **D-2:** after Cancel or Escape, if Check is gone or disabled (a block
  crashed, the group froze), focus goes to the status line, not the body.
- **D-4:** the slash menu is a listbox; the editor (role textbox) carries
  `aria-controls` + `aria-activedescendant` while it is open. Screen-reader
  support for activedescendant on a contenteditable is uneven (VoiceOver
  especially); not checked with a real screen reader. Define also got
  `aria-pressed`. Shortcut tooltips say ⌘, as every existing one does.
- **D-5:** Move up/down are in the ⋮ bar, and keep the block selected. They
  use `aria-disabled` at a column's edge, so a keyboard user keeps focus;
  the bar had no greyed style at all, now it does. A block inside a
  container (an image in a worked example) shows both greyed; the ⌘⇧ shortcut
  there moves the whole container.
- **D-6:** the sweep covered roster Remove, class-activity Remove, every
  class-card control and every Bank entry's buttons. Names start with the
  visible words ("Roster: Algebra I", "Add to my library: Fractions 2"), so
  voice control still matches what's on screen.
- **D-7 "Check here":** the box has a one-line note under it when ticked
  ("Students check their answers at the end of this section"), and the other
  places that said "checkpoint" to a teacher (submission-mode help, the slash
  menu, the import dialog) now say "Check here". The submission-mode option
  names ("Locked checkpoints" / "Free checkpoints") were left as they are:
  renaming the modes was not part of the ruling. The `{checkpoint}` import
  marker is syntax and stays.
- **D-7:** work space shows and takes lines in the block drawer, the block's
  summary line and print settings (space between problems too). The column
  cell-height control still says rem: it wasn't one of the three, filed in
  TODOS. Chart source got the same wording fix as figure source.
