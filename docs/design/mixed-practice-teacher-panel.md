# Mixed practice slice 4 — the teacher panel, with D68 "who needs me" (design pass)

**Status:** RULED by the author 2026-10-23 (W-1…W-11 as recommended, with C-162's W-3/W-4 revisions; W-9 = "Getting stuck on"). BUILT 2026-10-23 (0068, unpushed) — see mixed-practice.md → "Slice 4 — as built" (S4-1 amends W-2's placement).
Parent: [mixed-practice.md](mixed-practice.md). Slice 4 is "Teacher panel. DM-3, 8, 9, 15, 18, 20".
Wish: curriculum D68 (C-154). In the author's ruled order it is built inside T4 (TODOS, 2026-10-21; re-ruled 2026-10-23).

## The wish (C-154, quoted in substance)

- **When:** during fluency (the sprint) and mixed practice, live while the class works.
- **What:** a list of students who need the teacher now, so the teacher circulates to them first, in this order:
  1. students STRUGGLING on any skill in this session's items (the existing rule: mixed_struggling_window 5, mixed_struggling_min_right 3);
  2. then students showing the SAME misconception id twice or more in the current session, with the misconception's label shown;
  3. everyone else, unlisted or collapsed.
- **Each row:** name, the skill(s), and the misconception label if one fired. One tap opens that student's recent first tries.
- **Not:** a grade, student-facing, or a change to what gets served.

## What exists (re-derived 2026-10-23 against code and the live DB — P10)

- **0066 is live** (applied and pushed b64a19ff, verify 11/11; the backfill import ran the same day).
  - `mixed_class_summary` (H1) gives counts per skill, with no names (DM-18). Fields: students practising, struggling, first tries right, skips.
  - `mixed_class_students` (H2) is the "Show students" list, in name order (DM-20). Fields: days this week, struggling skills, latest graded score.
  - Both read `mixed_recent`: per (student, skill), the last `window` first tries ACROSS DAYS. The struggling rule is `tries − right > window − min_right`.
- **Slices 2 and 3 are NOT built.** Slice 2 is serving and grading (`check-activity` practice modes); slice 3 is the student screens. Until both are live, no student can produce a `mixed_attempts` row, so every teacher-panel number reads zero.
- **Misconceptions in practice: nothing writes them yet.** `mixed_attempts.verdicts` is jsonb that slice 2 will fill. Section checks' verdicts carry `misconceptionIds` (0061 aggregates them), so slice 2 can store the same thing. No column is indexed on them.
- **Skill labels are NOT stored anywhere.** Both reads return skill IDS (`rate.unit-rate`). DM-3's per-skill table would therefore show ids too. The labels exist in the curriculum's `skill-registry.txt` (the `# …` comment after each id) and as `label` in the graph. `--skills-registry` only validates ids.
- **Misconception labels ARE stored:** `misconception_registry(id, skill, description)` (0042), mirrored on every import (115 ids live).
- **The sprint** (FactsTeacher, `fact_sprint_overview`) polls every 5 s while the tab is visible, because realtime is stubbed and throws. Its full-screen view shows only the link and counts (projector, DR-19), and names sit behind "Show who has not started". Sprint answers carry NO skill or misconception id. Its own per-student signal is the family state (strategy / practising / fluent; "needs strategy").

## Decisions (numbered; each with a recommendation)

**W-1 Sequencing.** The panel can be designed now but can't show anything until slices 2 and 3 are live.
**Recommend:** rule this design now, but BUILD in the ruled slice order: 2 (serving + grading) → 3 (student screens) → 4 (this panel). Slice 2 also carries W-5. The author's queue item "D68 within T4" therefore means the next BUILD arc is slice 2. ⚠ The ordering is the author's call.

**W-2 Ranking vs projector safety (DM-18, DM-20 say "nothing ranks students").** D68 asks for a need-ordered list of names, which is a ranking.
**Recommend:** a separate control, "Who to see first", next to "Show students", ruled as follows:
- names are absent from the page until it is opened, and never appear on any full-screen view;
- it shows two GROUPS, "Struggling" and "Same mistake twice", in name order within each group, with no scores, rates, counts per student or colour-only flags;
- everyone else is collapsed as "Everyone else (n)".

Groups, not a rank: one student is never placed above another for a number. This AMENDS DM-18 for this one list only.

**W-3 The sprint.** Sprint answers have no skill or misconception, so D68's rules 1 and 2 can't apply to them as written.
Options:
- (a) mixed practice only in v1, with the sprint keeping its own panel;
- (b) feed the sprint's existing "needs strategy" family state into group 1 as "Number facts: ×7 facts" rows.

**Recommend (b).** The signal already exists and the curriculum side named the sprint explicitly. ⚠ Confirm with the curriculum side that "needs strategy" is the sprint's "struggling" (one line in the letter).

**W-4 What "this session" means.** Students can run more than one session a day (ER-6), and the struggling window spans days.
**Recommend:**
- group 1 = a student who practised TODAY (class zone) AND is struggling (the existing rule, unchanged) on a skill among today's served items;
- group 2 = the same misconception id on two or more of TODAY's first tries, across that student's sessions today.

"Live" means today's practice day, and the list empties overnight.

**W-5 Recording misconceptions (slice 2).** Group 2 needs them per first try.
**Recommend:** a `misconception_ids text[]` column on `mixed_attempts`, written by `record_mixed_attempt` from the verdicts the grader returns. Use the same ids the section-check verdicts already carry, with no new grading. Index it under (class_id, practice_day). It is STUDENT-DERIVED, so the data-map and retention-policy entries go in the same commit. Labels come from `misconception_registry.description`.

**W-6 Skill labels.** Both the per-skill table (DM-3) and D68's rows need a readable skill, and we store none.
**Recommend:** mirror the labels in this slice. `--skills-registry` writes a small `skill_label(id, label, mirrored_at)` table from the registry's `# …` comments, insert-or-update, never deleted. The panel shows the label and falls back to the id. D67's tracker reuses it later (C-153 asked for exactly this). ⚠ This is a new mirror: the curriculum side owns the wording. Long labels truncate in the table, with the full text in a tooltip and in the accessible name.

**W-7 Refresh.** **Recommend:** poll every 5 s while the tab is visible AND "Who to see first" is open, like the sprint. A failed poll keeps the last list and says "Not updated since 10:42". When the list is closed, the panel itself refreshes on load only. There is no realtime, because the realtime client is stubbed.

**W-8 The row.**
- **Recommend:** name · skill label(s) (at most 2, then "+n") · for group 2 the misconception label ("Same mistake: adds instead of scaling"). The misconception text is the registry description, which is teacher-facing wording.
- One tap opens a drawer showing the student's last 10 first tries IN THIS CLASS: skill, ✓ / ✕ / skipped, the misconception label if any, and the day.
- No question rendering in v1, because the snapshot exists (ER-4) and can come later.
- This needs one new teacher-only read, `mixed_student_recent(class, student)`, guarded by `is_class_teacher`.

**W-9 Words (DM-13 teacher list).** **Recommend:**
- heading "Who to see first";
- groups "Struggling" and "Same mistake twice";
- "Everyone else (n)";
- the empty state "No one needs you right now";
- before anyone has practised today, "Students haven't started today's practice."

Never use "needs help", "behind", "weak" or "at risk".

**W-10 Not student-facing, and serving is unchanged.** Confirmed by construction: W-2's list is a teacher-only read, and the planner is untouched.
**Recommend:** a test that the student routes never call the new reads, plus a verify row that a student calling `mixed_who_first` gets `not_class_teacher`.

**W-11 One read for the list.** **Recommend:** a single RPC, `mixed_who_first(class)`, returning both groups and the "everyone else" count, so one poll costs one round trip. It joins `mixed_recent` (for struggling) with today's attempts (for skills and misconceptions). It is guarded by `is_class_teacher`. A verify row forces each group to fire at production values (P3), and another proves a student who is struggling but did not practise today is NOT listed.

## C-162 — the curriculum side's answers (2026-10-23, written by the author), folded in

Each answer came with its evidence and how strong it is (Rosenshine 2012; Black & Wiliam 1998; Butler 1987/88; Woodward 2006; Shute 2008; van der Kleij et al. 2015; Jussim & Harber 2005). Items marked "engineering" are ours to decide, and they have no pedagogical objection to them.

- **W-1, W-5, W-7, W-10, W-11:** agreed, engineering. W-11: KEEP the verify row "struggling but did not practise today is not listed". W-5 note: under §7's form rule (D60), a blank in a form-skill item carries no misconception id by design, and that is not a grading gap.
- **W-2:** agreed. Monitoring students and reaching the ones failing early is strong evidence. Hiding names from students is moderate to strong. Groups rather than a rank in a teacher-only view has no evidence either way; it is the right default as a privacy and projector safeguard.
- **W-3, REVISED:** option (b), but **only "needs strategy"**, never "slow", and never merged with mixed practice's "struggling", because the teacher's action differs (teach a derived-fact strategy, not reteach a skill). Row: **"Number facts: needs a strategy (×7)"**, naming the family.
- **W-4, REVISED for group 2.** Mixed practice serves one item per skill per session, and a misconception id attaches per skill, so "twice today" would rarely fire. **Group 2 = the same misconception id on two or more of the student's last `mixed_struggling_window` (5) first tries ACROSS DAYS, listed only for students who practised today.** Groups 1 and 2 then share one window, with no new key. "Twice" is a heuristic (weak evidence), to be recalibrated on classroom data. Group 1 is unchanged (today).
- **W-6:** agreed. The registry `# …` comment is the source and the wording is theirs. Some Y9 labels run to about 170 characters: truncate in the table, but **the drawer and the accessible name carry the whole label.** A label change reaches teachers at the next import (D61's like-terms wording is the first due).
- **W-8:** agreed for v1. The misconception label is the most important field. When question rendering comes later, show **the student's wrong answer beside the item**, not the item alone.
- **W-9, a preference, not a blocker:** "Struggling" names the student; **"Getting stuck on" / "Several wrong on a skill"** names the evidence, which is all the panel holds. They accept "Struggling" if it is kept to match DM-13 and the class view. ⚠ DM-3's per-skill table column is already ruled "Struggling". Changing the word means changing it there too, for consistency. **The author decides.**

## Rulings — author, 2026-10-23

| W | Ruling |
|---|---|
| W-1 | **Yes.** Build in slice order 2 → 3 → 4. The next BUILD arc is slice 2 (serving + grading, which carries W-5). |
| W-2 | **Yes.** "Who to see first" is a separate, deliberately opened list: two groups in name order, everyone else collapsed, names absent until opened, never on a full-screen view. Amends DM-18 for this list only. |
| W-3 | **Yes, as revised by C-162.** Only the sprint's "needs strategy" joins group 1, as "Number facts: needs a strategy (×7)". Never "slow", and never merged with the mixed-practice signal. |
| W-4 | **Yes, as revised by C-162.** Group 1 = practised today and getting stuck (the unchanged rule) on a skill among today's items. Group 2 = the same misconception id on ≥ 2 of the last `mixed_struggling_window` first tries across days, listed only if the student practised today. |
| W-5 | **Yes.** `mixed_attempts.misconception_ids text[]`, in slice 2, with the data-map and retention entries in the same commit. |
| W-6 | **Yes.** A skill-label mirror from the registry's `# …` text. Truncated in the table; the FULL label in the drawer and the accessible name. |
| W-7 | **Yes.** Poll every 5 s while visible and the list is open; a failed poll keeps the list and says when it was last updated. |
| W-8 | **Yes.** Row and drawer as proposed. Future question rendering shows the student's wrong answer beside the item. |
| W-9 | **"Getting stuck on"** (the author's choice, C-162's preference). Group heading "Getting stuck on a skill"; the per-skill table column becomes **"Getting stuck"**, AMENDING DM-3 and DM-13's teacher word list, and DM-20's "struggling skills" reads "getting stuck on". Internal names (`struggling`, `mixed_struggling_*`) stay. Never "behind", "weak", "at risk" or "struggling" on screen. |
| W-10 | **Yes.** A student calling the read gets `not_class_teacher`, and a test checks the student routes never call it. |
| W-11 | **Yes.** One RPC, `mixed_who_first(class)`. Verify rows force each group to fire at production values, and prove that a student who is getting stuck but did not practise today is NOT listed (C-162 asked to keep this row). |

## Not in this pass

- Question rendering in the drawer.
- A per-student history page.
- Exporting the list.
- Alerts or notifications.
- Anything shown to students.
- The D67 tracker (it reuses W-6's labels and possibly W-11's joins later).

## Fable

**Recommend:** no Fable for the design pass itself; the decisions above are product rulings for the author. Use Fable where the standing practice already puts it: the end-of-slice review before the live step, for slice 2 (W-5's column and the grading path) and for slice 4 (W-2's privacy boundary and W-11's guard). If the author wants an outside voice on W-2 specifically (names, ranking, projector), that is the one place a pre-build Fable read would earn its cost.

## Amended 2026-10-25: group 2 counts across skills (C-164 item 3, migration 0071)

As built in 0068, group 2 counted a repeated misconception within ONE skill, so a misconception attached to several skills (C-162's reason for W-4, e.g. mis.expand.first-term-only on three skills) never combined. The author ruled the fix on 2026-10-25. `mixed_who_first` now counts the same id across ALL of a student's skills and discrimination banks. Each try must still fall inside its own skill's last `mixed_struggling_window` first tries, and the student must have practised today. The row lists every skill the id fired on. verify-0071 is mutation-tested: it fails on 0068's function. verify-0068 still passes 4/4.
