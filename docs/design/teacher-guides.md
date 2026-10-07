# Teacher guides — slice 1: the teacher-only field

**Status:** ✅ RULED 2026-10-07 — TG-1…TG-9 all as recommended (author).
Next: the fence format (TG-2) goes to the curriculum side as a proposal (B-100);
code waits for their answer.

**Origin.** Curriculum D50 (ruled by the author 2026-10-07; their PR #47): every
activity gets a short authored teacher guide — sections "the sequence", "watch
for", "if time runs short", plus "marking" when the DoL carries a rubric; first
cap 200 words; all in their graph key `activity_defaults.teacher_guide`. Until
this side ships a home, guides live at `.guides/<chain folder>/<activity key>.md`
in the catalogue, which the importer's walk skips
(`scripts/batch-import.mjs:562`). Liaison: C-79 → B-98, C-81 → B-99. TODOS entry
"Teacher guides: a teacher-only field and generated teacher views".

**This slice is their ask (1) only:** a teacher-only, activity-level field,
written in the activity file, never served to students, readable by a teacher
from the activity (editor) and on the printed teacher copy. Asks (2) and (3) —
generated per-activity and per-chain teacher views — are OUT (§Out of scope).

---

## What exists today (re-derived on main `cb9e6fde`, P10)

| Concern | Today | Consequence for this slice |
|---|---|---|
| Document shape | `ActivityDocument` = `schemaVersion`, `meta`, `sections`, optional `referencePanel`, optional `calculator` (`packages/schema/src/document.ts:363-376`) | A new optional top-level sibling is the established pattern; no `schemaVersion` bump (same forward-compat story as `referencePanel`/`calculator`). |
| Doc-level fence precedent | ` ```reference ` is a side-channel fence: its blocks go to `ctx.refPanelBlocks`, never the body (`markdownToTiptap.ts:1185`) | The guide fence copies this exactly. |
| Unknown fence today | Degrades to VISIBLE text with a warning (`markdownToTiptap.ts:1192`, `docs/markdown-import-format.md:84`) | Why no guide may enter an activity file before this ships. |
| Student read path | `get-activity` → `upgradeActivityDocument` (a zod parse) → `sanitizeActivityDocument` (`packages/viewer/src/sanitize/sanitize.ts:363`) | The sanitizer must delete the field. The zod parse would ALSO drop it on any build whose schema does not know the key — an accidental second line of defence, not one to rely on. |
| Sanitized type | `SanitizedActivityDocument = Omit<ActivityDocument, 'sections'> & …` (`sanitized-types.ts:206`) | Without a change, the field would pass through AT THE TYPE LEVEL. It must be `Omit`ted so viewer code cannot read it. |
| Raw rows | `activity_versions` select = `can_read_activity` (`0002_rls_policies.sql:149`), owner-only; never widened to students (0030's recorded rule) | Students cannot read the stored document directly — the same protection answer keys rely on. Nothing new needed. |
| Editor carry | `calculator` is held in `ActivityEditor` state, folded into `changeKey` + save, passed to `tiptapToActivity` (`serialize.ts:258/283`) | A doc-level field NOT carried this way is silently dropped on the first editor save. The guide must ride the same path. |
| Batch importer | Wires `referencePanel` + `calculator` from the import result into `tiptapToActivity` (`batch-import.mjs:779-786`) | One more argument there. |
| Teacher print | `ActivityPrint.tsx` renders the SANITIZED doc; the answer key arrives via `AnswerKeyProvider` only when `showAnswers` is on (`:415`) | The guide is authored-doc data → it comes from the authored doc on this route, never from the served one. |
| Fence → capability join | `capabilityFacts.test.ts` fails on any importer fence that backs no capability (`capabilityFacts.ts:214`) | The new fence must go in `JOIN` or `EXEMPT_FENCES` — either way `docs/capability-facts.json` changes → **pin-bump PR on the curriculum repo** (CLAUDE.md standing constraint, B14). |
| Authoring prompt | `catalogueAuthoringPrompt.ts` → `pnpm prompt:catalogue` | Teaching the fence there is how their drafting model learns to write guides in-file. |

---

## Decisions for the author

### TG-1. Field shape: a narrow prose-only block list

`teacherGuide?: { blocks: GuideBlock[] }` on `ActivityDocument`, optional with
**no default** (a default would materialize on every parse→save and trip the
importer's hand-edit fingerprint on every file — the R11 rule `seedVars`
already follows). `GuideBlock` = paragraph | heading | bullet list | ordered
list | math — the existing block schemas, no new block types.

- **Why narrow, not the full `Block` union** (which `referencePanel` uses):
  the reference panel's full union let key-bearing blocks into a surface whose
  sanitizer did not cover them (the 2026-08-23 leak, `sanitize.ts:354`). A
  guide holds prose. If the schema cannot hold a blank or a choice, there is no
  nested answer key to reason about — the whole field is the secret and is
  deleted whole.
- **Rejected: a markdown string.** Nothing outside the app's importer renders
  markdown; the print route and editor would need a second renderer. Blocks
  render through components that already exist, `$…$` maths included.
- **Rejected: structured `{ sections: [{ heading, body }] }`.** It would
  hard-code the curriculum's four section names on this side. Those live in
  THEIR graph key and their `check_guides.py` checks them; a copy here is a
  second source that drifts (their D25, our P4). Headings are just heading
  blocks.

### TG-2. The fence: ` ```teacher-guide `, anywhere in the file

````markdown
```teacher-guide
## The sequence
One idea: a unit rate is the amount for exactly one …

## Watch for
- Dividing the wrong way round …

## If time runs short
Cut practice item 3, then item 4. …
```
````

- **Name:** `teacher-guide`. Self-describing to anyone reading a raw file; a
  bare `guide` reads as student guidance. (Hyphenated tags are fine in a fence
  info string.)
- **Placement:** anywhere; collected in the pre-pass like ` ```meta `, so
  position does not matter. Convention (taught in the prompt): last in the
  file, so the student content reads top to bottom first.
- **One per file.** A second fence → warning, and the first wins.
- **Content:** headings, paragraphs, lists, inline maths. Anything else inside
  (a blank, a choice, a figure) → a warning naming it, and it is DROPPED, not
  degraded to text (a degraded `{{…}}` in a teacher field is harmless, but
  there is no reason to keep a construct the field cannot hold).
- **Not validated here:** section names, order, the word cap, the
  marking-only-with-rubric rule. Those are the curriculum's (`check_guides.py`
  reading their graph key). This importer checks only what it alone can see:
  that the fence parsed and what it dropped.

### TG-3. Never served to students — four guards

1. `sanitizeActivityDocument` deletes `teacherGuide` whole.
2. `SanitizedActivityDocument` `Omit`s it — the viewer cannot even type-check a
   read of it.
3. **`SANITIZER_ALGO_REV` 2 → 3**, so every cached read row built before the
   strip is orphaned once the new `get-activity` is live.
4. **The leak fixture** plants a guide carrying a sentinel string and the
   existing wire scan (`check-leak.test.ts`) asserts the sentinel never reaches
   a student payload.

Both committed bundles carry the sanitizer (`SANITIZER_ALGO_REV` appears in
`viewer-server.bundle.js` and `grading-server.bundle.js`), so `pnpm
bundle:viewer-server` + `pnpm bundle:grading-server` are committed in the same
commit, and BOTH redeploys (`deploy:get-activity`, `deploy:check`) are pending
author actions, each proven by bundle hash (CLAUDE.md).

**Ordering rule (same family as migration-before-deploy):** the redeployed
`get-activity` must be live BEFORE the first import of a file carrying a
` ```teacher-guide ` fence. Today's live build would drop the unknown key in its
zod parse, so the reverse order would most likely be safe — but "most likely,
by accident" is not the standard for student-facing secrets.

### TG-4. Editor: a fifth drawer section, editable

A "Teacher guide" button beside Settings / Reference / Calculator / Print in
the config drawer (`ActivityConfigDrawer.tsx`), opening a prose-only Tiptap
editor — the `ReferencePanelBody` pattern with the block menu narrowed to
TG-1's types. Help text: "Only you and other teachers see this. Students never
do." Carried through save like `calculator` (state → `changeKey` → save →
`tiptapToActivity`). A filled dot on the button when a guide exists, as the
reference button has.

- **Editable**, because a teacher's own activities deserve a guide too, and
  the drawer body already exists. File-backed activities are covered by the
  existing rule: edit the `.md`, and the 0039 fingerprint refuses a re-import
  over an in-app edit.
- **The cuttable alternative:** read-only display for this slice (smaller,
  no carry-on-save risk… but a field that only the importer can write is
  exactly a second class of activity). Recommend editable.

### TG-5. Print: the first page of the answer-key copy

When `showAnswers` is on AND the authored doc has a guide, `ActivityPrint`
renders it as a "Teacher guide" page before the worksheet, with a page break
after. Never on the student copy, never in the foldable. No new setting — the
answer-key toggle IS the "teacher copy" switch. The on-screen preview shows it
too (it is the same route), so a teacher sees it before printing.

- **Alternative:** its own "Include teacher guide" checkbox. Recommend not
  until someone asks to print the key without the guide.

### TG-6. Moving the existing guides: the curriculum side's act, no platform script

Their D50 ruling 6 says the guides "move into it mechanically". They are the
catalogue's files (the author's folder): the curriculum side appends each
`.guides/<chain>/<key>.md` body as a ` ```teacher-guide ` fence to its activity
file, deletes the `.guides/` file, and repoints `check_guides.py` at the fence.
The next ordinary import run updates those activities (the content changed; the
fingerprint is unaffected because the drafts were not hand-edited). No platform
script — it would be a tool that edits files this side does not own.

### TG-7. Capability facts + authoring prompt — and the pin bump this causes

- **Capability facts:** put `teacher-guide` in **`EXEMPT_FENCES`** ("teacher-only
  activity annotation, not a student capability"), not `JOIN` — it backs
  nothing a student does, and a JOIN entry would make the curriculum side write
  capability prose for it. Either way `docs/capability-facts.json` changes, so
  this slice ENDS with a pin-bump PR on the curriculum repo (push our side first;
  the pin names a commit on our public `main`).
- **Authoring prompt:** teach the fence in `catalogueAuthoringPrompt.ts` (one
  short block: the fence, "teacher-only, never shown to students", the
  convention of placing it last), regenerate with `pnpm prompt:catalogue`, and
  refresh the Notion pointer row's stamp. Do NOT teach the section names or the
  cap there — those are the curriculum's rules and their prompt layer states
  them.
- **Format doc:** a section in `docs/markdown-import-format.md`.

### TG-8. Guards bound to rendered output (the orphan rule)

The field's readers are the editor drawer and the print route; the guards bind
to those, and each is mutation-tested once by unwiring it:

- import round-trip: fence → `teacherGuide.blocks` → serialize → re-import
  equal (the importer fingerprint depends on this being stable);
- editor: open the drawer on a doc with a guide, the text is present; edit +
  save + reload, it survives (the carry-on-save guard);
- print: answer-key copy shows the guide's sentinel; student copy and foldable
  do not;
- leak: TG-3 (4).

### TG-9. Budgets

The student shell is untouched (the field never reaches the student route; the
sanitizer change is a `delete`). The editor chunk gains one drawer body built
from existing pieces; the perf budget script runs as usual in `pnpm verify`.
No migration, no personal data (the compliance pack is unaffected: a guide is
authored teaching content, not student-derived).

---

## Out of scope (asks 2 and 3), and what they will need

Recorded so the later pass starts from facts, not from C-79's summary. The
generated per-activity view was described as built "from data you already
import"; that is partly true:

- **Imported today:** objectives (the objectives block), `skill`, misconception
  bindings and their feedback, the DoL rubric.
- **NOT imported:** review skills (`x_review_skills` is an `x_` key; the
  importer drops every `x_` key by design, `catalogueAuthoringPrompt.ts:113`),
  and the hook (the hook pool lives in their graph; nothing in our schema holds
  a hook).
- **The chain view** needs a chain-level read surface this side does not have,
  plus D49's correctives.

Their own trigger applies (TODOS): design when the author schedules it; build
when the first catalogue activity is taught by a teacher other than the author.

## Rough build order once ruled

1. Schema (`teacherGuide`, `GuideBlock`) + sanitizer strip + type `Omit` +
   ALGO_REV + leak fixture → bundles.
2. Importer fence (pre-pass) + batch-importer wiring + format doc.
3. Editor drawer section + save carry.
4. Print page.
5. Capability-facts exemption + authoring prompt + regenerate.
6. `pnpm verify`; push (author); `get-activity` + `check-activity` redeploys +
   hash proof (author);
   pin-bump PR on the curriculum repo; THEN the curriculum side moves the
   guides in-file (TG-6).
