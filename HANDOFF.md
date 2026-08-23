# Handoff — 2026-08-24

Paste the block at the bottom into a new chat. Everything above it is context
for a human deciding whether the handoff is accurate.

---

## What happened in the session that wrote this

Two things shipped and one is planned.

1. **The graph-figure convergence SHIPPED** (`docs/design/graph-figure-convergence.md`,
   COMPLETE, CI green). It began as a TODOS cleanup item ("two SVG engines,
   converge them") and turned out to be content loss: **there is no `line`
   drawable kind** — a line is `{kind:'curve', model:{family:'linear'}}` — and
   `GraphFigure.tsx` skipped curves, so every line a teacher drew on a formula
   sheet rendered as an empty grid for the student while the editor's own
   preview showed it correctly. Zero live instances, so nothing was lost.
2. **TODOS housekeeping**: ten resolved entries archived to HISTORY, a duplicate
   merged, `printShuffle`'s coin-flip assertion replaced with a seed-space
   property.
3. **The activity flow modes are PLANNED, NOT BUILT**
   (`docs/design/activity-flow-modes.md`) — eng-reviewed and design-reviewed,
   0 unresolved, ~15 tasks. This is the next thing to build.

## What the next session should know before touching anything

- **`main` has unpushed commits.** The author pushes; never `git push`.
- **`pnpm verify` is the definition of done** for the check job. Print, perf,
  a11y and integration lanes are separate and it prints which.
- The plan doc's **AS BUILT / "What the eng review changed" sections outrank the
  plan text above them.** Both docs have one, and in both cases things changed
  shape at review or build time.

---

# PASTE FROM HERE

I'm picking up the activity-platform repo cold. Read `CLAUDE.md`, then
`STATE.md`, then `docs/design/activity-flow-modes.md` — including its
**"What the eng review changed"** section and the **"The student-facing design"**
section, both of which outrank the plan text above them.

## The task

Build the activity flow modes slice. It is fully ruled: 6 author rulings, an
eng review (8 findings + a 20-finding outside voice, 4 tensions), and a design
review (3/10 → 9/10, 8 decisions). Zero unresolved decisions. Do not re-open
settled questions; the doc records why each landed where it did.

Work the task list in the doc (F1–F11 + D1–D8 folded in). Suggested order is in
its "Worktree parallelization" section: **Lane A (F1 → F2 → F3) first**, since
the group fold and store composition are what everything else renders on.

## What the slice does, in one paragraph

Six authored knobs describe how an activity flows for a student
(`isCheckpoint`, `submissionMode`, `revisionMode`, `gradingMode`,
`activityType`, `answerFeedback`) and **not one is read by anything** — their
implementations died with `packages/renderer` at S9 and the declarations
survived. The slice makes `{checkpoint}` real (a checkpoint's Check covers
every section since the previous one; the end of the activity is always a
checkpoint, so no section is ever silently un-checked), adds `locked` (freeze
at press, server-enforced), deletes `revisionMode` + `gradingMode`, makes
`activityType` a printed label, and defers `answerFeedback: 'immediate'` to its
own slice. The author is about to write ~150 activities and wants the system to
carry every expected feature first, so the corpus is authored against real
behaviour.

## Five things that will bite you if you skip them

1. **The server derives the lock from `meta.submissionMode`, NOT from a flag the
   client sends.** The eng review originally ruled the opposite; the outside
   voice pointed out a student's browser can simply omit a flag. The refusal
   lives INSIDE `record_check`, after the idempotent-replay lookup, in the same
   transaction — otherwise a lost-response retry 409s on a check that landed.
2. **Migration 0040 must be applied live BEFORE `check-activity` deploys**
   (standing rule). And `CREATE OR REPLACE` with a changed signature creates a
   SECOND overload with default PUBLIC EXECUTE — drop the old signature and
   re-`revoke`/`grant` (the pattern is at `0020:336-339`).
3. **In `locked` mode the button reads "Check and lock" and confirms first.**
   This deliberately breaks the "Check everywhere" ruling, because there is **no
   unlock** — not for the student, not for the teacher; a republish is the only
   one and it resets every student.
4. **A check group is a VISIBLE region** (rule + grouped background, explicitly
   NOT a card). R1 removes most Check buttons, and without the region a
   buttonless section reads to a student as "my work here isn't counted".
5. **The five new state strings are specified in the doc.** Use them verbatim —
   they extend `statusLabel`'s existing doctrine (`ViewerContainer.tsx:116-140`:
   the failure KIND decides the sentence, and never say "try again" when
   retrying cannot work).

## House rules that matter most here

- **Guards bind to RENDERED OUTPUT, never to another declaration.** This repo's
  most expensive defect class is a declaration outliving its implementation —
  ten instances. The doc's guard 5 (the set of Check buttons in the DOM × the
  section ids each fires covers `doc.sections` exactly) is the load-bearing one.
- **Mutation-test every new guard once** and record the failing output in the
  commit message. Precedent: `numbering-output.test.tsx`, and this session's
  graph-figure work (revert the fix → 3 of 11 rows fail, named).
- **Never `git push`.** Commit locally; the author pushes.
- **Check `git branch --show-current` is `main` before committing.**
- A schema change means both bundles regenerate in the same commit
  (`pnpm bundle:viewer-server`, `pnpm bundle:grading-server`) and a
  `get-activity` redeploy is owed as a pending author action.
- Run `pnpm verify` before handing back. It prints the browser lanes it does
  NOT cover; this slice needs `--project=student`, `--project=a11y`,
  and `playwright test print-rules` too.

## State of the repo

- `main`, clean tree, **unpushed commits** the author will push.
- CI green as of the last push.
- Live: 6 users (5 teachers, 1 student), 14 activities, 1 class, 0 checks,
  0 submissions, 39 migrations applied. Re-read live, never trust a doc.
- A drift audit ran 2026-08-24 (4 findings, all fixed). Don't re-run it; the
  trigger list is in `.claude/skills/drift-audit/SKILL.md`.
- Four author actions are pending in STATE; none blocks this slice.

## Where to start

Read the doc, confirm you agree with F1's shape (`checkGroups` as a pure fold
over `DocumentIndex.sections` — not a sixth copy of the document walk), then
build Lane A. Ask before deviating from a ruling; each one has a recorded
reason.
