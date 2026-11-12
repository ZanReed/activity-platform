# GUI sweep, items 3–8: rulings wanted

Status: **RULED by the author 2026-11-13.** Every recommendation below is
accepted (3a, 3b, 4a, 4b, 5a, 6a, 7a, 7b, 8a, 9a, T1), with one change:
**8b — the level picker must NOT be fixed to A/M/E** ("that won't be language
teachers outside NZ will be familiar with"). It offers the levels the activity
itself declares (its DoL's `dol_rubric_levels:`), and a teacher can name their
own levels when the activity declares none.

TODOS → "GUI sweep 2026-11-12" lists fields that only a markdown import can
set. The author ruled "do the GUI sweep first". Items 1 (misconception ids) and
2 (tables) are built. This page is the short design pass for each remaining
item. Under the EVERY FEATURE SHIPS WITH A GUI rule, each one is a debt.

Each item names the gap, what the editor already does for a similar field, a
recommendation, and the decisions to rule on (yes/no each). A "yes" lets the
next session build that item; the items are independent.

The recommendations follow one principle: **reuse the control the editor
already has for the same kind of field.** The editor already has a settings
drawer (`blockControls.ts` descriptors) with rich-text, toggle and number
fields, and the four classic question blocks already share a Worked solution
field (`QuestionSettings.tsx`). Most gaps close by giving one more block that
existing field, not by inventing a new panel.

---

## 3. Short answer and essay: model answer and worked solution

**Gap.** Both blocks carry `answer` (the teacher's model answer) and
`solution` (a worked explanation shown after the check). In the editor they
appear only inside a read-only `<details>` (`FreeResponseView.tsx`, marked
READ-ONLY at line 18). A teacher can't add, change or remove either.

**Already there.** Multiple choice, fill-in-blank, matching and ordering edit
`solution` through the drawer's Worked solution field (`QuestionSettings.tsx`).

**Recommendation.** Give short answer and essay the same drawer entry with two
rich-text fields, "Model answer" and "Worked solution". The read-only
`<details>` stays as the in-block summary.

- **3a.** Edit both fields in the settings drawer, using the existing Worked
  solution field and a twin for the model answer? *(recommended: yes)*
- **3b.** Keep the in-block `<details>` as a read-only summary rather than
  making it editable in place? *(recommended: yes: one place to edit, as for
  the other question blocks)*

## 4. Maths gaps: settings on every gap, not only the first

**Gap.** A maths block can hold several gaps (`prompts[]`), but its settings
(acceptable answers, equivalence, tolerance) edit `prompts[0]` only
(`MathPromptControls.tsx:33`, "single-gap v1"). Gaps 2 and up can be set only
by an import.

**Recommendation.** The settings follow the gap the caret is in. Clicking a gap
selects it, and the settings panel says "Gap 2 of 3" with its own values.

- **4a.** Settings follow the selected gap, labelled "Gap n of N"?
  *(recommended: yes)*
- **4b.** Show a small per-gap marker in the formula when a gap has no
  answer, as gap 1 does today ("unanswered" signifier)? *(recommended: yes)*

## 5. Graph accessibility: the description of what a graph shows

**Gap.** `interactive_graph.stimulusAlt` (what the shown figure depicts, for a
screen reader; joined to the graph's accessible name) has no control.

**Recommendation.** One plain-text field in the graph's settings drawer,
"Describe the figure for screen readers", shown only when the graph has
something "Shown with the question". Its help text says it must never give the
answer.

- **5a.** Add the field to `GraphSettings`, shown only when a stimulus
  exists? *(recommended: yes)*

## 6. Correspondence: a settings drawer

**Gap.** The correspondence block has no drawer entry. Its `solution` is
view-only, and numbering and work space have no control. The four classic
question blocks get all three from the shared drawer.

**Recommendation.** Give correspondence the same descriptor as the other
question blocks: Worked solution, numbering and work space.

- **6a.** Same three settings as multiple choice, through the shared
  descriptor? *(recommended: yes)*

## 7. Seeded data plot: choosing the variable it plots

**Gap.** `data_plot.dataVar` (plot a seeded `sample` variable instead of the
literal data) has no control. The seeded-variables panel can declare a dataset
that nothing in the app can plot.

**Recommendation.** In `DataPlotSettings`, a "Data" choice: "These numbers"
(today's literal list) or one of the activity's `sample` variables, listed by
name. Picking a variable keeps the literal list as the preview, as the schema
already intends.

- **7a.** A Data source choice listing the activity's `sample` variables?
  *(recommended: yes)*
- **7b.** If a chosen variable is later deleted from the seeded-variables
  panel, show the plot's settings in a warning state rather than silently
  clearing the choice? *(recommended: yes; the importer refuses that
  mismatch today)*

## 8. DoL rubric levels (A / M / E on rubric lines)

**Gap.** A rubric line can carry the level it evidences (from a DoL's
`dol_rubric_levels:`), but `RubricEditor` has no level control. The level is
what lets the DoL pass tick work, and no catalogue rubric uses levels yet (the
playtest sweep could not reach the pass tick for that reason).

**Recommendation.** Each rubric line gets a small level picker, "—, A, M, E",
shown only on a DoL section's rubric.

- **8a.** A per-line level picker, DoL rubrics only? *(recommended: yes)*
- **8b.** ~~Is A/M/E the vocabulary to show?~~ **RULED: no.** The picker
  reads the levels the activity declares; with none declared, the teacher
  names them. A/M/E is only one school system's words.

## Item 9 (graph figure text fields): a ruling, not a build

Alt text, caption, plane and to-scale for a graph figure are editable only as
fence text in "Figure source".

- **9a.** Does "Figure source" count as the GUI for these fields?
  *(recommended: yes for now: it is in the app and a teacher can edit it.
  Revisit if a teacher stumbles on it.)*

---

## Also wanted: the "Try again" label (playtest sweep, 2026-11-12)

A wrong answer's pill says **"✗ Try again"** everywhere
(`viewer/blocks/StatePill.tsx`, `DEFAULT_LABEL.incorrect`). In one-try places
(a mixed-practice item, a frozen DoL try) there is no again.

- **T1.** Change the default to a neutral **"Not quite"**, with "Try again"
  passed explicitly only where a retry exists? *(recommended: yes)* The student
  shell's JS reads 158.7 KiB against a 158.7 KiB cap (`check-perf-budget`,
  2026-11-13), so even a few bytes may need the next size-ladder rung.
- **T2.** Or keep "Try again" as the default and override it only in the two
  one-try places? *(smaller change, but every new one-try surface must
  remember)*
