# February readiness — what only a school, a device or the live site can check

First classes are about early February 2027. Every item below is outstanding
and cannot be closed from a laptop and the local stack. It was collected on
2026-11-20 from TODOS, STATE and the design docs, and each item's source is
linked so its record gets updated in place. **This file is a checklist, not
the record.** When a check passes, mark it in its source, then delete it here.

## Already checked from here (2026-11-20)

- **Text overflow on Home and My classes** (walkthrough note, 2026-11-08).
  Measured with `pnpm playtest` at 1024 px and 375 px: teacher Home, My
  classes, My activities and student Home. No element runs past its box or
  the viewport. The note no longer reproduces. A school device at its own
  zoom level is still worth a glance (item 6).
- **The other walkthrough notes** (2 activities a day, the hook while
  presenting, time estimates, planning ahead) were folded into period
  assembly 0084 and the period planner (built 2026-11-14).

## One visit to school: devices

Bring a Chromebook (touch if there is one), an iPad, an iPhone and an Android
phone. About an hour.

**Chromebook, tablet, touch Chromebook: the number-facts runner (T11, D6).** Source: [TODOS.md → "Device checks (T11, D6)"](../TODOS.md), [practice-blocks.md](design/practice-blocks.md) (tasks T11, D6).
1. Open a facts probe (`/facts/:CODE`).
   - **Pass:** no on-screen keyboard appears; physical and number-pad keys register; the in-app keypad works.
2. Do one pass with the screen reader (ChromeVox, VoiceOver) and one with switch access.
   - **Pass:** each item is read once, in words ("seven times eight"); typed digits are announced politely; the counts are announced only when "Finished" changes; the whole probe can be finished by switch.

**Phone and Chromebook: the ² ³ tray on blanks (superscript D8).** Source: [TODOS.md → same entry](../TODOS.md), [superscript-units.md](design/superscript-units.md).
3. Tap ² inside a blank.
   - **Pass:** the blank stays focused and the on-screen keyboard stays open.
4. Repeat with VoiceOver (iPhone or iPad), TalkBack (Android) and ChromeVox.
   - **Pass:** each reads "Insert squared" / "Insert cubed", and the blank's note "Squared and cubed keys follow."
5. On a phone, focus a blank in the **last row of a table**.
   - **Pass:** the tray is not cut off or hidden under the keyboard. ([superscript-units.md](design/superscript-units.md) says this is unverified on a real device.)

**Phone: student screens.** Source: [period-assembly.md → "Not checked yet"](design/period-assembly.md).
6. Open a class's Today list as a student, including a class with only some of the Today blocks switched on. Glance at Home and one activity too.
   - **Pass:** nothing is cramped, clipped or running off the edge.

**iPad: the teacher editor.** Source: [TODOS.md → "Editor open remainders" #2](../TODOS.md), [notion-hybrid-editor.md](design/notion-hybrid-editor.md).
7. Tap a block, tap its grip, then long-press the grip.
   - **Pass:** the tap puts the caret in the block; the grip tap selects the block and opens the command bar; the long-press starts a drag; the gutter can be found without hovering.
   - Also owed and doable in any normal browser: one real grip drag (Playwright can't drive it).

## In a classroom

8. **The projector.** Open "Present today" from a class card. Source: [period-planner.md → "Not checked yet"](design/period-planner.md).
   - **Pass:** readable from the back row at that room's contrast.
9. **The printer.** Print a worksheet and its answer key on the school's black-and-white printer. Source: the "paper" gap in [TODOS.md → "Playtest browser sweep"](../TODOS.md); the rule is in [print-and-printables.md](design/print-and-printables.md).
   - **Pass:** callouts and ✓/✗ still mean something without colour (by border style and label).
10. **The first facts probe with a real class.** Source: [practice-blocks.md → Slice 1 checks](design/practice-blocks.md).
    - **Pass:** about 6 minutes for Year 7's 35 items, and the teacher sees the class result and recommendation in the same period.
11. **Watch for, once classes run.** Each already has its own trigger in TODOS:
    - a screen-reader or switch user, which needs the DR-23 "leave out of the class result" control;
    - Chromebooks that can't use either photo path, which needs webcam capture;
    - teachers not noticing that moving a plan doesn't move its due date.

## Live-only, no device needed

- **One real Google sign-in and sign-out on the deployed app.** It has only been proven against stubs.
- **Gate 4: seed `student_domain` with the school's real domain** and live-check a student's first sign-in. Needs the domain from you. Never use a consumer domain (CLAUDE.md).
- **The first real YouTube clip** for video pause points ([video-pause-points.md](design/video-pause-points.md)). The student switch stays off until school clearance.
- **The prunes.** Each has its own arming checklist in TODOS and needs your yes. None is required for February.
- **Pushes during term:** push outside school hours in both NZ and US time; each deploy shows students the update notice (STATE).

## Paperwork

- **A DPA for the first school.** On demand, as counsel's Q7 answer allows. The trigger is the first district conversation, and its jurisdiction is decided then. Until then, a school without its own DPA signs [school-authorization-template.md](compliance/school-authorization-template.md), refreshed 2026-11-20.
- **Counsel Q14 (photos) and Q15 (gradebook download)** are drafted in [counsel-review-packet.md](compliance/counsel-review-packet.md) and unsent. Photos stay off until Q14 is answered.
- **Telling teachers when the privacy policy changes.** Built 2026-11-20 as a notice on each class card (TODOS). Existing classes, yours included, will show it until they are re-confirmed against draft-5.
