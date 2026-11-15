# Schema shortlist — design pass (2026-11-15)

The nine items left on the 2026-11-13 low-hanging-feature hunt that need a
schema field, a migration or a new server path. Each was re-checked against
the code on 2026-11-15 (evidence below is file:line at that date).

**RULED 2026-11-15 (author):** S1-b (i) — ignore case by default, with the
catalogue scan before deploy; S8-a (i) — the preview really checks, nothing
saved; S7-a — https only. **Scope of this arc: S1–S5.** S6–S8 are designed
and waiting (S7/S8 already ruled); S9 gets its own design pass. The other
sub-decisions below stand as recommended unless the author changes one.

Every item ships with a GUI (CLAUDE.md → Working style). Cross-cutting costs
the author should know before ruling:

- **A new field the importer learns** joins `capabilityFacts.ts`'s `JOIN`, so
  `docs/capability-facts.json` changes and a **pin-bump PR on the curriculum
  repo** follows (CLAUDE.md → Standing constraints). Items 1, 2, 3, 4, 5.
- **A grading change** needs `pnpm bundle:grading-server` and a
  **`check-activity` redeploy** (author). Items 1, 5.
- **A sanitize/registry change** needs `pnpm bundle:viewer-server` and a
  **`get-activity` redeploy** (author). Items 2, 3, 4, 5.
- **A migration** is applied by the author before any UI that calls it is
  pushed (OV-7). Items 6, 7, 8.
- **New student-derived data** updates `docs/compliance/data-map.md` and
  `retention-policy.md` in the same commit. Item 6.

## The items, in the recommended order

### S1. Case-insensitive text blanks — small/medium

**Today:** scoring is case-sensitive (`viewer/src/server/grading/blanks.ts:94`,
"case and spacing stay exact"); mistake feedback is already case-blind
(`blanks.ts:353`). "Paris" vs "paris" is marked wrong. No per-blank option
(`schema/src/inline.ts:491`).

- **S1-a** A per-blank `caseSensitive` flag on text blanks (numeric, math and
  form blanks are unaffected — case means nothing or something else there).
- **S1-b — the real decision: the DEFAULT.** (i) absent = case-INSENSITIVE
  (the change teachers expect; existing published text blanks start accepting
  "paris" on their next check), with `caseSensitive: true` to opt back in; or
  (ii) absent = sensitive as today, new blanks get insensitive from the
  editor. **Recommended (i)**, plus a one-off scan of the catalogue for text
  answers where case could matter (chemical symbols, proper nouns that clash
  with common words) before the deploy, reported to the author.
- **S1-c** GUI: "Match case" checkbox in the blank popover; importer key
  `{{Paris | case}}` (exact syntax to settle with the curriculum side).

### S2. Print space for short answer and essay — small/medium

**Today:** no field; paper boxes are a fixed `6em` / `12em` (viewer.css
~2480). Every other question has `workSpace` (`fill-in-blank.ts:37` …) wired
through `--print-work-space` and guarded in `printExpectations.ts:944`.

- **S2-a** Reuse `workSpace` (same unit, same drawer control "Work space
  (lines)", same activity-wide default) — not a new concept. Absent = today's
  box heights. **Recommended.**

### S3. A hint on multiple choice, matching and ordering — medium

**Today:** only blanks have hints, shown after a wrong check
(`blanks.ts:538/588/608`); MC has per-choice feedback; matching and ordering
have a worked `solution` only.

- **S3-a** A block-level `hint` (inline rich text), returned by the server
  ONLY on a wrong verdict, exactly like a blank's hint — stripped by sanitize,
  never served before Check. **Recommended.**
- **S3-b** For MC, the per-choice feedback (when the wrong choice has some)
  wins over the block hint, mirroring mistakeFeedback-before-hint on blanks.

### S4. Filter the grading queue by class — small/medium

**Today:** `list_grading_queue` returns `in_your_class` (any class) but no
class id (`0034_check_grades.sql:445`); changing its signature is ruled out
(`0042:1292`).

- **S4-a** A sibling read (RPC) returning student → class ids for the
  caller's classes holding this activity; the Responses page adds a "Class"
  picker next to Student and joins client-side. **Recommended.**

### S5. Move a student to another class — small/medium

**Today:** remove (teacher RLS update on `removed_at`) and rejoin with a code
(`0014_classes.sql:84/182/238`). Checks carry no class (`0020:58`), so a move
never touches a student's work.

- **S5-a** One audited DEFINER RPC `move_class_member(student, from, to)`:
  both classes must be the caller's; removes and adds atomically (reactivating
  an old row when one exists). **Recommended.**
- **S5-b** Only between the same teacher's classes. Cross-teacher moves stay
  remove + rejoin with the other teacher's code.
- **S5-c** GUI: "Move to…" on a roster row (`ClassRoster.tsx`), confirm names
  both classes and says the student's work stays.

### S6. Text alignment and a highlight colour — medium each

**Today:** neither exists anywhere; tables have per-column alignment only.

- **S6-a** Alignment (left / centre / right) on paragraphs and headings, as a
  block attr. **Recommended.**
- **S6-b** Highlight: ONE colour (a highlighter yellow), as a mark. On paper
  and in forced colours it must still read, so it prints as a grey fill plus
  an underline. Several colours are a later wish. **Recommended: one.**

### S7. Links — medium

**Today:** no link mark; StarterKit's is switched off so it can't be made
and lost (`starterKitOptions.ts`); the importer drops URLs with a warning
(`markdownToTiptap.ts:1673`).

- **S7-a** A `link` mark carrying `href`, **https only** (and `mailto:`?),
  checked by the schema and again by sanitize; opens in a new tab with
  `rel="noopener noreferrer"`. **Recommended: https only.**
- **S7-b** Print shows the link text followed by the address in small type,
  so paper keeps it.
- **S7-c** Students leave the activity when they click one (new tab). A
  teacher-facing note says so; no allowlist of sites in v1.

### S8. Preview the whole draft as a student — medium

**Today:** previews are per block (editor) or print-mode (Bank, My
activities). `DevViewer` renders documents with a mock checker, dev only.

- **S8-a** "Preview as student" in the editor header opens the DRAFT in the
  real viewer, screen mode. **Checking:** (i) runs the real grading engine in
  the browser, lazily, so Check shows real ✓/✗ — nothing is recorded; or
  (ii) Check is switched off with a note. **Recommended (i)** — the point of a
  preview is seeing feedback; the engine loads only when a teacher opens the
  preview, never in the student shell.

### S9. "I'm stuck" — a student flags their teacher — medium/large

**Today:** nothing. The nearest is the teacher's derived "Who to see first"
list (0068).

- **S9-a** New student-derived data (who, which activity/section, when,
  optional note?), so it needs its own design pass: the data map, retention,
  whether a free-text note is allowed (moderation, under-13s), and where the
  teacher sees it (Responses? Progress? Today?). **Recommended: its own design
  pass after S1–S8, not built in this arc.**

## As built (S1–S5, 2026-11-15)

- **S1** `BlankToken.caseSensitive` (true or absent). Grader `scoreText` folds case unless set; a numeric blank's word answers fold too. Authoring: **`{{^Mg}}`** — a leading sigil like `~` and `=`, chosen over the `{{Paris | case}}` this doc floated, because a `|` segment is an alternate answer. Popover "Match case" (text blanks only; switching type clears it). Rides BLANK_SECRET_FIELDS. **Catalogue scan before deploy: 13 candidates** (two `{{A}}` letter answers, eleven word answers such as "no", "up"), **none needs `^`** — ignoring case helps all of them. DECISIONS → "Text blanks ignore case unless Match case".
- **S2** `workSpace` on short_answer and essay sizes the printed BOX (`--print-answer-space`, min 1 line in the drawer "Answer space (lines)"). **Departure from S2-a, to confirm with the author:** the activity-wide `print.workSpace` still means space BELOW a question and does not size these boxes; only the per-block value does, so an unsized box keeps its 6em / 12em. Print lane: `structure/answer-box-space`.
- **S3** `hint` on multiple_choice, matching, ordering: stripped from the served document (registry + leak fixture), returned only on a wrong check. MC: a WRONG chosen option's own feedback replaces the hint; a right option's feedback is shown with it. Authoring: `hint:` line in the mc / match / order fences, drawer "Hint". Correspondence and fill-in-the-blank are not included (blanks hint per blank).
- **S4** No migration: Responses reads the teacher's class rosters (`listClassRosters`, existing RLS) and adds a "Class" picker from two classes; a student in two classes shows under both.
- **S5** Migration **0089** `move_class_member` + `verify-0089` (5 rows, mutation-tested), audited as `class.update` op `move_member`; roster "Move" dialog.
- **Deploy order** (STATE → Pending): 0089 live → get-activity + check-activity redeployed and hash-verified → push. SANITIZER_REV moved.

## As built (S6–S8, 2026-11-15)

- **S6-a** `align: 'center' | 'right'` on paragraph and heading blocks (left = absent); the TextAlign extension in the main, reference-panel and teacher-guide editors (so none drops it); toolbar Align left / Centre / Align right. Viewer sets `text-align` and `data-align`.
- **S6-b** `highlight` joins SIMPLE_MARK_TYPES; the Highlight mark in all five editors (main, nested fields, reference panel, guide, definition dialog), toolbar button + ⌘⇧H. Viewer `<mark class="viewer-highlight">`: a fill (`--vw-highlight`, grey on paper) PLUS an underline, and `Mark`/`MarkText` in forced colours, so it reads without colour.
- **S7** `link` mark `{ href }`, https only (S7-a ruling), checked four times: the schema (refine), StarterKit's link options (`isAllowedUri` — a pasted javascript: link is never made), the save (serialize), and the sanitizer's in-band walk (SANITIZER_ALGO_REV 3 → 4, so cached rows written before the rule die). Opens in a new tab, `rel="noopener noreferrer"`; print writes the address after the text. Toolbar Link box (a bare `example.com` becomes https; http/javascript refused with a reason). The importer keeps `[text](https://…)` and drops other schemes with a warning. No editor-click opens a link.
- **S8** "Preview" in the editor header (lazy; the grader loads only then): viewer `preview/draftPreview.ts` serves the draft as a student gets it (sanitized, seeded numbers drawn, orderings shuffled, seed specs removed) and checks it in the browser with `gradeSection` against the same numbers. Nothing is recorded. "Another student" redraws a seeded draft. Known limit, said in the banner: a DoL section is checked as an ordinary section.
- **Deploy order** (STATE → Pending): get-activity + check-activity redeployed and hash-verified BEFORE the push — a link or highlight published under the old functions would reach students unchecked by the new sanitizer rule.

## Recommended build order

S1 → S2 → S3 (one viewer/grading drop: one grading redeploy, one viewer
redeploy, one pin bump) → S4 → S5 (one migration drop) → S6 → S7 → S8, and
S9 as a separate design pass.
