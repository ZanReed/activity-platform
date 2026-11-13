# UI review group B — teachers publish broken questions without knowing (design pass, 2026-11-13)

Status: **RULED 2026-11-13 (author: "Yes to all") and BUILT the same day** —
see "As built" at the end. Originally proposed with Source:
TODOS.md → "UI review 2026-11-13", group B (items 8, 9, 11, 12; item 10 was
built with group A). Builds on G-2's `lib/prePublishCheck.ts`, which already
runs on both publish paths (the editor's Publish/Republish and "Republish
changed") with one rule: empty blanks.

## What the code does today

| # | Problem | Where it shows today | At publish |
|---|---|---|---|
| 8a | Multiple choice with no correct choice | red line inside the block ("every answer would score wrong") | publishes |
| 8b | Matching item with no match | red line inside the block | publishes |
| 8c | Correspondence cell with no card | red line inside the block | publishes |
| 8d | Maths gap with no answer | "Blank needs an answer" inside the block | publishes |
| 8e | DoL section whose skills don't fit (none, wrong first skill, count ≠ items) | list in the DoL panel | publishes |
| 9 | New graph / number line starts with a made-up answer (point at (0, 0), 5 on the line, a default region, ray, vector…) | nothing | publishes — every student is marked against (0, 0) |
| 11 | Imported meta notes ("your value was kept") | hidden until the activity has been published | — |
| 12 | Drawer value that fails validation (min words > max, negative work space) | the drawer keeps showing it | silently dropped on save |

A teacher meets the in-block warnings only if they scroll past the block.
Publishing never gathers them.

## Decisions

**B-1. The pre-publish check refuses the "every student scores wrong" cases.**
Recommended:
- New rules in `prePublishCheck.ts`: 8a, 8b, 8c, 8d. Each is a question no
  student can get right, so publishing refuses, exactly as an empty blank does.
- DoL problems (8e) also refuse: the DoL panel already flags them as wrong, so
  a DoL never goes live in a shape its own editor calls broken. (If you'd
  rather these only warn, B-3's "check" tier fits them too.)
- Same rules on both publish paths, as G-2 set up.

**B-2. The refusal lists the problems, each with "Show me".** Recommended:
- Instead of today's one-line count, a short list under the Publish button,
  each row naming the question and the problem. For example:
  "Q4 · no choice is marked correct — Show me", or
  "Section 3 DoL · 2 items but 3 skills — Show me".
- Show me selects the block (or the blank) and scrolls to it.
- At most 5 rows, then "and 3 more".
- An edit clears the list, as G-2 does today. The next Publish checks again.

**B-3. Graph starting answers become a CHECK, not a refusal.** Recommended:
- A graph or number line whose answer still equals the default it was inserted
  with is listed at publish under "Check before publishing". For example:
  "Q7 graph · the answer is still the starting point (0, 0)".
- Two buttons: **Publish anyway** and **Go to it**.
- Not a refusal: (0, 0) or 5 can be the real answer.
- No schema field: "still the default" means the block's interaction
  deep-equals the factory default for its type. So an answer the teacher set
  back to the default also asks. That's rare and harmless, since it's one click.
- *Alternative not recommended:* an `answerSet` schema flag. It's exact, but
  it's a new field (bundles, sanitize, a reader in the viewer to avoid the
  orphan rule) for a one-click question.

**B-4. In the editor, a graph still on its starting answer says so.**
Recommended:
- A small "Starting answer — set the real one" note on the block. Same rule as
  B-3, and the same warning style as the existing in-block lines.
- Gone once the answer changes.

**B-5. Imported meta notes show whether or not the activity is published.**
Recommended: move the notes box out of the `isPublished || success` branch
(`ActivityEditor.tsx`), so a first import, which is the common case, shows
them. A one-line move with a test.

**B-6. Drawer values that can't be saved are refused where they're typed.**
Recommended:
- Min words above max words: both fields go red with "Min can't be more than
  max". The pair is saved only once it's valid. Today it's dropped silently on
  every save.
- Work space below 0: the input's minimum is 0 and a typed negative is
  refused (it snaps back to 0).
- A sweep of the drawer's other numeric fields for the same pattern (fields
  the serializer drops when invalid), done in the same pass. Each one gets the
  inline treatment rather than a publish rule.

**B-7. Test and review discipline, as group A.**
- Each rule mutation-tested.
- The two-tier publish UI checked in a real browser (the student lane's
  publish spec grows a refusal case and a "Publish anyway" case).
- A Fable review per step.

## Build shape (if all yes)

- **Step 1, app-only:** B-1 + B-2, the rules and the list UI.
- **Step 2, app-only:** B-3 + B-4, graph starting answers.
- **Step 3, app-only:** B-5 + B-6, small fixes.
- No migration, no schema change, no deploy. Teacher-side only, so the student
  shell is untouched; the editor journey budget is checked each step.

## As built (2026-11-13)

Commits on `main`: 60be5f00 + b5e0f86e (B-1/B-2), 791a6054 (B-3/B-4),
bfdda5cd + 64888df9 (B-5/B-6 and review fixes). A Fable review per step.
Differences from the rulings above, and what the reviews changed:

- **Locating (B-2):** serialize re-mints block and section ids on every save,
  so problems are located by POSITION (the nth block of its type in a column,
  the nth section), blanks by id. Only a column's direct children count on
  both sides; the reference panel and teacher guide (separate editors) are not
  counted. A block set to "no number" or a custom label gets no "Qn".
- **DoL "no skills" (B-1):** a DoL ticked with no skills used to be dropped
  on save (`SectionDol.skills` needed one), so the section published as a
  plain checkpoint. **Ruled 2026-11-13 ("Keep it, refuse publish"):** a draft
  may hold `skills: []`; publishing refuses it with "the DoL has no skills
  chosen — Show me". Schema change, both server bundles rebuilt; no deploy
  needed (a published version never holds an empty list).
- **B-3 order:** Publish saves once, then refusals first, then the
  starting-answer check, then the G-3 republish confirm — the panels never
  show together. A graph whose answer is "No solution" is never flagged.
  Known limit: the comparison is whole-interaction (changing only a tolerance
  clears it), and a file whose real answer is the default asks every publish.
- **B-6:** a refused value is marked on the field that was typed (not both),
  and a negative work space is refused with a message rather than snapped to
  0. A refused value held in the field is saved as soon as it becomes valid
  (e.g. Max raised). Min/Max words also refuse part-word counts.
