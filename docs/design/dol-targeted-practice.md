# D65 slice 2 — targeted practice between DoL attempts (design pass)

**Status:** DESIGN PASS 2026-10-30. NOT RULED; nothing is built. TP-1…TP-9 are waiting on the author's yes or no, one by one.
**Parent:** [dol-retake.md](dol-retake.md), DL-14 ("Second slice, optional", ruled 2026-10-24): after a failed attempt 1, offer "Practise first": up to N items from the primary skill's ratified bank whose `mis.*` intersect the misconceptions attempt 1 showed, falling back to any items of that skill. It is offered, never required. Slice 1 is live (0069/0070, 2026-10-25).
**Evidence (C-163):** Guskey's loop is check → correctives → parallel check. The authored mistake feedback is the corrective today; this slice adds practice on the same skill, chosen by the mistakes the student actually made.

## What exists (re-derived 2026-10-30 against code and migrations; P10)

- **Bank items** (`practice_item`, 0058) carry their `mis.*` bindings only inside `document` jsonb: `blank.mistakeFeedback[].misconceptionId` and mc `choices[].misconceptionId`. There is no column, so "items that bind mis.X" today means a jsonb walk over every item. `tier` exists since 0070.
- **The mixed runner** is class-scoped end to end. These tables all carry a `class_id NOT NULL`:
  - `mixed_sessions` (keep_until, practice_day in the class zone, the settings revision, graded);
  - `mixed_session_items` (the frozen snapshot: document + row);
  - `mixed_attempts` (first try only, `misconception_ids` since 0067).

  The student route is `/practice/:code`; check-activity has `practice-start` and practice-check modes (practice-handler.ts).
- **13 functions read the mixed tables:** the planner (`mixed_plan`, `mixed_steps`), the teacher panel (`mixed_recent`, `mixed_who_first` incl. 0071, `mixed_class_summary`, `mixed_class_students`, `mixed_student_recent`), plus the serve, check, record, finish, prune and purge paths. Every one assumes a row is MIXED practice: it feeds spacing (`mixed_steps`) and "getting stuck" (`mixed_recent`).
- **What attempt 1 showed:** `section_checks.verdicts` carries `misconceptionIds` per item (0061 aggregates them). So the DoL's first-try misconceptions are readable for the student's own row.
- **Only chain 1 (801) has ratified banks.** No Y9 skill has a bank yet, and DoLs reach students before banks do.
- **⚠ Slice 1 GAP, found here:** DE-19 moved B-198's authoring check (every DoL `mis.*` must be bound by at least one ratified template of the primary skill's bank) into slice 1, reading bank documents directly. It was not built: `dolImport.ts` and `batch-import.mjs` contain no such check. TP-8 carries it.

## Decisions (numbered; each with options and a recommendation)

**TP-1 Where it is offered.** It's offered on the DoL section once attempt 1 is recorded, the DoL is not passed and a retake remains. The section shows "Practise this skill (N questions)" next to the frozen-state copy. It stays until the retake is checked or the DoL is passed, and is hidden when the skill has no ratified bank (TP-6).
**Recommend as written.** It is never a gate: the retake opens on its own rule (DL-8, DE-9) whether or not the student practised.

**TP-2 Which tables (the blast radius).** Targeted attempts must not feed mixed practice's spacing or the teacher panel's "getting stuck", because a student who drills six items on one skill in a sitting is not "struggling" in the spaced sense.
- (a) Reuse the mixed tables with a `purpose` column (`mixed` | `dol`) on sessions, items and attempts, and filter `purpose = 'mixed'` in all 13 readers.
- (b) **Separate tables**: `dol_practice_sessions` / `_items` / `_attempts`, with the same shapes, keyed to (student, activity) rather than to a class.

**Recommend (b).** (a) edits 13 live functions, and every future mixed reader would have to remember the filter: the forgettable-step class this repo keeps paying for. (b) touches none of them. The runner's UI and grading code are reused; only the RPCs and tables are new. ⚠ This means a new student-derived table set, so data-map and retention change in the same commit.

**TP-3 How many items, and which.**
- N = 4, a fixed constant. Slices are short by design, and the class's mixed `items per session` belongs to mixed practice.
- Order of choice:
  1. ratified skill-bank templates of the primary skill that bind a `mis.*` attempt 1 showed (ranked by how many of those they bind);
  2. then the skill's other ratified templates, in bank order.
- One item per template.
- Tier filter: the same `mixed_tier_ok` as mixed practice. Before a pass that means D–C plus untagged.

**Recommend as written.** ⚠ The curriculum side may want N as a graph key. Ask in the letter (TP-9).

**TP-4 Its numbers.** Each item draws its row as mixed practice does: hash(session, item) mod rows, snapshotted at start (ER-4). A DoL form's numbers never appear: the bank's tables are separate from the DoL's.
**Recommend as written.**

**TP-5 What the student sees.**
- The mixed runner's screens, minus the score line: this practice is never scored or graded.
- Solutions show after each first try (mixed practice's behaviour).
- On the last item: "Done. Your new version opens on your next practice day", or "…opens now" when it is open. It links back to the activity.

**Recommend as written.** Showing worked solutions on BANK items does not leak the DoL: their numbers and templates are different (C-163 said exactly this).

**TP-6 No bank, or nothing to practise.** If the primary skill has no ratified skill-bank template that passes the tier filter, the offer is not shown. Nothing else changes: the retake still opens on its own rule.
**Recommend as written.** Today that hides it on every DoL except chain 1's.

**TP-7 What the teacher sees.** v1: nothing new. The teacher already sees the DoL attempts and the pass. A "practised before the retake (n/4 right)" line in the answer panel is a TODOS row, triggered by a teacher asking.
**Recommend as written** (YAGNI).

**TP-8 The authoring check B-198 promised (the slice 1 gap).** At import, every `mis.*` a DoL binds must be bound by at least one RATIFIED template of the primary skill's bank. When that bank exists it's a warning, and `--strict` fails the run. It's silent when the skill has no bank yet, since banks lag activities. It reads the bank documents the same run imports, with no new column.
**Recommend as written.** The `practice_item.misconception_ids` column (DL-14's GIN index) is then needed only for TP-3's choice. TP-3 can walk the jsonb of ONE skill's ratified items (dozens, never thousands), so **recommend no column**: one fewer derived field to keep in step.

**TP-9 The letter.** One letter after the rulings, covering:
- TP-3's N (whether they want it as a graph key);
- TP-8, which they already agreed in B-198/C-163 (§17);
- the fact that targeted practice appears only where a ratified bank exists, so a DoL's skill needs its bank before the offer shows.

**Recommend as written.**

## Migration, deploys, compliance

- **One migration** (0072):
  - the three `dol_practice_*` tables (RLS forced, no client grants, like mixed's);
  - `start_dol_practice(activity, version)`, AS THE CALLER, checking the student's own DoL state: attempt 1 recorded, not passed, a retake left;
  - `dol_practice_item_for_check` and `record_dol_practice_attempt` (service role);
  - the prune and purge rows.
- **check-activity** gains two modes, `dol-practice-start` and `dol-practice-check`, so it needs a re-bundle, then the migration, then the redeploy, then the push.
- **Compliance:** STUDENT-DERIVED (answers to practice items). Retention is the DoL's activity window: the account path, as `section_checks`. Prune built, disarmed, mixed practice's posture. data-map + retention-policy change in the same commit.
- **Shell budget:** the student route reuses the lazy practice runner chunk, so nothing is added eagerly (157.8/158 KiB).

## Not in scope

- Practice for the review item's skill.
- Teacher-assigned targeted practice.
- Feeding these attempts into mixed spacing.
- A score.
- The teacher-facing line (TP-7).
