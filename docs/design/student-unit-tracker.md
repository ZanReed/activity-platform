# Student unit tracker (D67) — design pass

**Status:** ALL RULED by the author 2026-11-01: UT-1…UT-11 as recommended, plus UT-12 and the two filed items under UT-10. The curriculum side agreed (C-172). Each item below keeps its recommendation text; read "Recommend" as the ruling.
**Source:** the curriculum side's D67, ratified 2026-10-21 (C-153), as restated in C-171 (2026-10-31). It digitises the school's student overview of a unit.
**Order:** third in the D64–D68 queue, after D68 ✅ and D65 ✅ (re-ruled 2026-10-31, C-171).

## What D67 asks for (their ruling, our paraphrase)

- Rows are keyed by the curriculum's skill ids and grouped by chain within the platform's `activities.unit`.
- The teacher enters the school's wording for a row in the platform, and it stays private. A row with no wording falls back to the skill label plus its tier letters.
- Four statuses: not taught, taught (the D43 pool), DoL passed (best attempt), struggling.
- "What to practise next" comes from D66's tier unlock.
- No school text crosses to the curriculum repo, and no tier field enters their graph (tier letters derive from the template tags, B-198).
- C-171 adds a wording point: the student-facing word for "struggling" is an author decision, not the key name.

## What already exists (re-derived against live, 2026-11-01, P10)

The TODOS entry listed two pieces of new work. Both already exist.

| D67 needs | Live today | Notes |
|---|---|---|
| Skill labels | `skill_label` (0068, W-6) | It is mirrored by every import from the `# …` comment after each id in their `skill-registry.txt`. It is readable by any signed-in user (curriculum text, not school text). The TODOS line "we store no labels today" was written before 0068. |
| Tier letters | `practice_item.tier` (0070 §H) | The tier is D/C/P/E or NULL. NULL means untagged, and an untagged template is never filtered. Chain 1's bank is untagged. |
| D66 unlock | `mixed_plan` serves P/E only after a pass (0070 §I) | The unlock is already live. The tracker only has to *say* it. |
| Taught | `mixed_taught(class, student, zone)` (0066 F1, D71) | A skill is taught once the student has checked an activity in this class whose source has it as `primary_skill`, or has checked a consolidation whose chain's discrimination bank covers it. This is exactly the mixed-practice pool. |
| DoL passed | `dol_pass` (0070) | The table is insert-once. Only a skill's final part grants a pass (C-164). |
| Struggling | 0066's rule over `mixed_recent(class, window)` | The rule fires when fewer than `mixed_struggling_min_right` (3) of the last `mixed_struggling_window` (5) tries are right. It counts mixed practice only, per class. Since D68's amendment the teacher panel calls it "Getting stuck". |
| Units | `activities.unit` (0037, publish-truth) | Live, every catalogue unit is exactly one chain folder today. Grouping by chain inside a unit is therefore a header that never shows yet. |

So the genuinely new pieces are:

- the teacher's private row wording;
- one read that joins the existing facts per (student, class);
- a student page that shows the result;
- the teacher surface for entering wording.

## Decisions for the author

**UT-1 · Where it lives: one page per class, linked from Home.** The page shows the units from that class's activities, one block each. It sits on a lazy route, `/progress/:classId`, so none of it lands in the student shell (158.063 of 158.5 KiB). The only addition to the shell is a "Your progress" link on Home, under each class, next to Practice.
- *Why per class:* "taught" and "struggling" are both class-scoped facts (the pool and the mixed tries are keyed by class). A pass is per student, so it shows in every class that has the skill.
- *Recommend:* yes.

**UT-2 · Which rows appear: the skills of the unit's published activities.** A unit appears once the class has been given at least one activity from it. Its rows are then the distinct `primary_skill`s of every published activity in that unit, taken from the same owner as the class's copy's source, in teaching order (`source_path`). Rows for activities the class hasn't been given yet show as "not taught yet", which is the overview's point.
- Consolidations add no row, because their primary skill is already a row from its part. A teacher's own activity with no `primary_skill` adds no row.
- *Not covered:* skills the curriculum projects but nobody has authored yet. On our side these have no activity and so no unit. Covering them needs the skill → chain map, which today lives only in the comment headers of `skill-registry.txt`. C-171 point 4 offers to generate that field.
- *Recommend:* derive the rows from activities now and send no letter. File "unauthored skills as rows" with a trigger: the school asks for the full grid before the chain is authored.

**UT-3 · Status precedence: Passed, then struggling, then taught, then not taught.** A pass is never taken away (0070 is insert-once). If a student who passed is struggling with maintenance D–C questions, the row still shows Passed.
- *Alternative:* show Passed with a small struggling note. It is more honest, but it puts a "you're stuck" message on a skill the student has proved.
- *Recommend:* passed wins outright.

**UT-4 · The four on-screen words (C-171's question, and yours).** The words are student-facing, so they should describe where the student is, not label them.

| Key | Recommend | Alternatives |
|---|---|---|
| not taught | **Not started** | Not taught yet · Coming up |
| taught | **Learning** | Taught · In progress |
| struggling | **Keep practising** | Needs practice · Tricky right now · Getting stuck (the teacher's word) |
| passed | **Passed** | Got it · Mastered |

"Keep practising" is an instruction the student can act on. "Getting stuck" fits a teacher scanning a list, but reads as a verdict to a 12-year-old. Colour is never the only signal: each word is printed, and the same contrast tokens apply in dark mode.

**UT-5 · Private row wording: a per-teacher table keyed by skill.** The table is `tracker_wording (teacher_id, skill_id, wording, updated_at)`. It has one row per (teacher, skill), so it survives new classes and new years.
- **Access:** no client grant. A definer `set_tracker_wording` writes it. The student read returns only the *class teacher's* wording, for the skills in that class's units. A teacher never sees another teacher's wording.
- **Limits:** wording is capped at 200 characters, plain text only.
- **Bank copies:** wording never travels with a Bank copy. It is keyed by teacher, not by activity.
- **Compliance:** the table holds teacher-authored text, not student data. Because it references a person (`teacher_id`), it still needs a data-map entry. It is deleted when the teacher account is purged (cascade).
- *Recommend:* yes.

**UT-6 · Where the teacher enters wording: a teacher view of the same page.** The teacher opens `/progress/:classId` for their own class and sees the same units and rows, with no statuses. Each row has an inline wording field with optimistic autosave and a visible saved state. Clearing a field returns that row to the fallback.
- One surface means the teacher sees exactly what students will see.
- It is reached from the class on the Classes page.
- *Recommend:* yes.

**UT-7 · Fallback wording: the label, plus tier letters only in the fallback.** With no teacher wording, a row reads, for example, "Compute a unit rate from a ratio · D C P".
- The letters are the distinct tiers of the skill's *ratified, non-retired* templates in the bank owner's skill bank. An untagged bank shows no letters, so chain 1 shows the label alone.
- Teacher wording stands alone, because the school's own row text already carries its tier.
- *Recommend:* yes, as D67 ruled.

**UT-8 · "What to practise next": one line per unit, and an unlock note on passed rows.**
- **Next line:** the unit's next line names its first row, in teaching order, that is taught and not passed, with the step that fits it:
  - targeted practice is open → "Practise ⟨row⟩ first", linking to `/a/:id/practice/:version` (D65 slice 2);
  - the retake is open → "Try the check again", linking to the activity;
  - otherwise → "Your next check: ⟨activity⟩".
- **Every taught row passed:** the line becomes "Everything you've been taught here is passed."
- **Unlock note:** a passed row whose skill has ratified P or E templates gets "Harder questions are now in your practice" (D66's unlock, which mixed_plan already applies).
- *Recommend:* yes.

**UT-9 · The reads: everything derived, nothing new stored about students.**
- **Student read:** `my_unit_tracker(p_class_id)`. It is a definer function, checks class membership by `auth.uid()`, and returns units → chains → rows with each row's status, wording, letters and next step.
- **Teacher read:** `class_unit_tracker(p_class_id)`. It returns the same shape with no statuses, gated by `is_class_teacher`.
- **Freshness:** the page re-reads when opened. There is no polling, because the facts change at check time, not by the second.
- **Rationale:** a derived read can't drift from the pool, the pass table or the mixed rule, because it *is* them.
- The whole build is one migration and app code. It needs no Edge Function deploy, because the tracker reads PostgREST RPCs, not the viewer's read API.
- *Recommend:* yes.

**UT-10 · Out of scope for this build.** Each item gets a trigger in TODOS:
- **A teacher's per-student tracker grid.** Class progress (0061) and first tries (0062) already cover that view. Trigger: the teacher asks for statuses by student.
- **A printed overview.** The baseline print CSS still applies to the page. Trigger: the school wants the paper version.
- **Unauthored skills as rows.** See UT-2.
- **The unit's multi-skill Exceeding problem set.** It is separate under D66 ruling 4.
- **A link from inside an activity to the tracker.**
- *Recommend:* yes, and cut that last link too.

**UT-11 · No letter now.** B-221 already told the curriculum side that the pass will ask if it needs a key. Under UT-2, it doesn't. Once you rule, one short letter tells them:
- the four words;
- that rows derive from activities;
- that labels keep coming from the registry comments.
- *Recommend:* yes, sent after your rulings.

**UT-12 · Skills with no pass-granting DoL (added 2026-11-01, ruled).** Checked live on 2026-11-01: none of the 21 published activities with a primary skill has a DoL section, so nobody can reach Passed yet. Without this rule, UT-8 would keep pointing students at checks that can't grant a pass.
- A row's skill counts as *passable* when a published activity in the unit carries its final part with a `dol` section. (A teacher's tick on a rubric primary needs that same DoL, so it adds no other route.)
- A skill that isn't passable can still show Not started, Learning or Keep practising. It doesn't count for UT-8's next-row choice, and it doesn't hold back or trigger "Everything you've been taught here is passed". That line needs at least one passable row, with every taught passable row passed.
- With no passable row to name, the next line becomes "Next up: ⟨activity⟩", the first activity given to the class that this student hasn't checked, in teaching order. With none of those either, the unit shows no next line.
- Consequence, accepted: on today's catalogue the tracker shows Not started, Learning and Keep practising only. Passed appears when the first DoL file is published.

## Filed under UT-10 by C-172 (the author's notes, ruled 2026-11-01)

- **School-unit grouping.** In v1 a tracker unit is `activities.unit`, which is one chain. Grouping rows under the school's own wider units is filed, not built. TRIGGER: the school wants rows grouped by its own units.
- **Skills admitted only by a consolidation.** Under D71 a consolidation admits its discrimination bank's skills to the pool. A skill with no activity of its own in the unit (904's consolidation admits `algebra.expressions.like-terms`) appears in mixed practice but gets no tracker row. TRIGGER: 904 drafted. When built, such a row can never reach Passed, so it needs its own review statuses and must not count toward UT-8's next-row choice or the "everything passed" line.

## As built (2026-11-01, migration 0074)

- **Routes.** Student `/progress/:classId`, teacher `/classes/:classId/tracker`, both lazy, one file (`routes/UnitTracker.tsx`). UT-6's "same page" is the same layout and rows on a second address, because the role decides the read. Links: "Your progress" under each class on Home, "Unit tracker" on the Classes row. Shell 158.1 of 158.5 KiB.
- **No chain header.** C-172 note 1 ruled a tracker unit is one chain in v1, so grouping by chain inside a unit isn't built.
- **Next kinds:** `check`, `practice`, `retake`, `wait`, `all_passed`, `up_next`. Two follow from the walk and aren't spelled out in UT-8:
  - `wait` ("Your new version of the check opens on your next practice day."): a first try is in, practice is done or unavailable, and the day hasn't moved on.
  - A row with its tries used up has no step, so the walk moves to the next row, and "all passed" can't fire.
- **Practice comes first:** when targeted practice and the retake are both open, the line offers practice until a practice session is finished.
- **Known imprecision, filed in TODOS:** the retake test can't see a rubric primary, so it can say "Try the check again" before the mark is released. The activity's frozen copy still tells the truth. No live file has a DoL yet.
- **Guards.** `verify-0074` covers posture, every status, precedence, letters, wording privacy, UT-12 and each next kind; mutation-tested 2026-11-01 (swapping precedence went red at B3, restored). `UnitTracker.test.tsx` and `e2e/student/unit-tracker.e2e.ts` bind the words, wording and next lines to rendered output.
