# D65 — the DoL retake and the "DoL passed" signal (design pass)

**Status:** DESIGN PASS 2026-10-24, with the curriculum side's C-163 answers folded in (same day). **RULED 2026-10-24: all 17 decisions, every one as recommended** (DL-8 and DL-11 as amended by C-163; see Author rulings). Nothing is built.
**Wish:** curriculum D65 (C-150, C-151; our answer B-198), TODOS → "Curriculum overhaul feature wishes, D64–D68", item 2.
**Order:** D68 → **D65** → D64 player → D67 (author, re-ruled 2026-10-23). D68 is live (0068).
**Trigger:** "the first Y9 DoL drafted with a parallel form". **It has NOT fired**: the curriculum main at 928a24b has no Y9 activity file. The author ruled 2026-10-24 to run the pass anyway, after first asking the curriculum side for a sample (B-208).
**The sample:** the curriculum side has drafted `proposals/d65-sample-dol.md` in their checkout (untracked, "not for import, and not ruled"; 904 activity 06, factorise by the HCF). This doc is checked against it. Their letter answering B-208 is still to arrive, so read their sample as their position, not an agreement.
**Also unlocks:** D66 tier SELECTION (the `tier:` line has been parsed since 0590aa27 and is not stored) and D67's "passed" status.

## Author rulings (2026-10-24)

Given one at a time to the parent session and relayed here. Each is the option he picked, quoted:

| DL | Ruling |
|---|---|
| DL-1 | "Flag + skills line (Recommended)" |
| DL-3 | "Work out at import (Recommended)" |
| DL-6 | "Yes, as written (Recommended)" |
| DL-7 | "Yes, as written (Recommended)", so no teacher retake grant in v1 |
| DL-9 | "Yes, as written (Recommended)" |
| DL-10 | "Yes, as written (Recommended)" |
| DL-12 | "Store passes (Recommended)" |
| DL-13 | "All three (Recommended)" |
| DL-14 | "Second slice, optional (Recommended)" |
| DL-15 | "Yes, one letter (Recommended)", to be sent once every DL is ruled |
| DL-16 | "Yes, as written (Recommended)" |

| DL-2 | "Yes, as written (Recommended)" |
| DL-4 | "Yes, as written (Recommended)" |
| DL-5 | "No retake, one attempt (Recommended)" |
| DL-8 | as amended by C-163: "Yes, next day (Recommended)" |
| DL-11 | as amended by C-163: "Teacher ticks, base-level prefill (Recommended)" |
| DL-17 | "\seed{p} spelling (Recommended)" |
| DL-10 amended | C-164 item 2, ruled 2026-10-24 in this session: "Final part only (Recommended)" |

**ALL 17 DECISIONS RULED 2026-10-24** (DL-18 is a note). Next comes the author's call on the next step, e.g. `/plan-eng-review` before building, and the DL-15 letter, which goes out only with his yes. Nothing is built.

## C-163 (curriculum answers to B-209, 2026-10-24; Zan wrote them)

C-163 frames D65 as Bloom's mastery loop as Guskey describes it: a check, then correctives, then a parallel second check. It sent the sample on record.
- **DL-2 yes.** Their authoring rule: a DoL's primary block carries 2–3 blanks or parts on the skill, so the pass rests on more than one observation.
- **DL-4 yes.** `where dol:` is the only spelling, and they retract C-123's unscoped `where:` for activities. Their rule: `where` must remove the cases that change difficulty, so the two forms are equally hard.
- **DL-5 yes, option (a).** Every Y9 DoL is written seeded. The live Y7–8 DoLs get seeded as each file is next touched, not in a sweep.
- **DL-8 agreed, plus a delay:** the retake opens on the student's NEXT PRACTICE DAY (Soderstrom & Bjork 2015). They would accept same-day with an intervening activity, recorded as a departure, if next-day is much costlier. → DL-8 amended below.
- **DL-11 (c), but prefilled from the BASE-LEVEL lines, not full marks.** The level tags exist: `x_dol_rubric_levels: A, M, E` in rubric-line order. They don't want option (b)'s `pass:` threshold. → DL-11 amended below.
- **gap_equation:** they will correct §7's wording. Until it supports seeded answers, a form-skill primary item is either a seeded fill_blank with exact-match alternates, or a seeded mc. They asked us to confirm both. **Only the mc half holds**, see DL-17. Wish filed: seeded answers + `!mistake` in gap_equation, triggered by 904 activity 01.

**Facts checked for the reply (B-210):**
- **Seeded mc: YES.** The substitution walk covers every prose text run, choices included (`sanitize/substitute.ts:9-12`). `misconceptionId` binds per choice.
- **Seeded fill_blank with an exact-FORM text answer: NO.** A text answer is bound to parenthesised literals and then EVALUATED (`seeded/resolveEntry.ts`). `g(ax-b)` with g=6, a=2, b=5 becomes `(6)((2)x-(5))` and then a number. A math blank `{{==…}}` stays an expression but grades by EQUIVALENCE, not form. What does work is their sample's own shape: NUMERIC blanks for each coefficient, placed inside the target form.
- **`{name}` inside `$…$` is NOT substituted** (`substitute.ts:18-20`; the importer warns, and `--strict` fails, at `markdownToTiptap.ts:3808`). The sample's prompts `${p}x - {q}$` and `${c}m + {d}n - {r}m$` would show students the letters. → DL-17.
- **DL-2 dry run, heuristic** (a script over the DoL sections, not the importer): **all 21 live DoLs have exactly 2 gradable blocks.** 712/02 and 713/01 have a third block, a `columns` fence, but it holds only choice figures. So the importer must count a `columns` block as gradable only when it holds a gradable child.
- **Rubric levels:** 6 of the 7 rubric DoLs carry `x_dol_rubric_levels: A, M, E`, one level per line. **801/04 carries none.** The importer drops the key today (`x_*`).

## The wish (C-150 / C-151 and the curriculum D65 record, in substance)

- Every DoL gets a **parallel form, seeded**. A retake is a **fresh draw** of the same items, not a second hand-written form (Zan, 2026-10-21; their sample's answer 2 confirms it).
- **One retake.** Two attempts in total.
- **"Passed"** for a skill is decided by the **primary-skill item alone**, counting the **best attempt**. The review-pool item counts for its own skill's data and never blocks the pass (C-151 a).
- On a retake, a **rubric-graded item is re-asked** with the same prompt, the **first answer hidden**, and marked by the teacher as before (C-151 b).
- **Targeted practice** from the skill's bank, filtered by the misconceptions the DoL showed (B-198 floated it).
- **Authoring requirement (B-198):** every `mis.*` a DoL can show must be bound by at least one template in that skill's bank. Their sample says §17 already requires this ("a bank must cover every misconception attached to its skill").

## What exists (re-derived 2026-10-24 against code, migrations and the live catalogue; P10)

**Checking**
- `submissionMode` (`free` | `locked` | `single`) is an ACTIVITY-wide meta field (`packages/schema/src/document.ts:279`), not per section.
  - `locked` = one check, ever, per (student, version, section). It is enforced in `record_check`, which `check-activity-handler.ts:784` calls with `p_locked` read from the stored document (0040; re-created in 0059).
  - There is no unlock other than a republish, which starts every student clean (flow-modes T3).
- `Section` has only `id, title, isCheckpoint, rows` (`document.ts:51-56`). **No section role exists: no DoL, no exit ticket.**
- `section_checks` stores one row per attempt: `responses`, `verdicts` (per item: `correct|incorrect|recorded`, `misconceptionIds?`), `attempt_number = max+1` per (student, version, section), and `section_total` (0059). There is no score column and no solutions.
- **"Best attempt" exists nowhere.** Every reader uses the LATEST attempt (0060, 0061/0064, 0034 grading queue, 0036). 0062 also reads attempt 1. 0066 `mixed_taught` reads the first check's date.
- **There is no primary item and no item weighting.** A rubric's `maxPoints` per criterion is the only points concept (`free-response.ts:44-63`).
- **Solutions are returned on every check**, right or wrong, and gated only client-side per group (flow-modes D8, OV#14).
- **Manual grades** (`check_grades`, 0034) attach to ONE check row. A re-check records the free text again as `recorded`. "Stale" means the text differs from the latest check's text.
- **Restore** (`my_latest_checks`) prefills an untouched section with the LATEST attempt's responses (`store.ts:564-605`).

**Seeds**
- `seedVars` is ACTIVITY-wide meta (`document.ts:288`). The seed is `serveSeed(versionId, studentId)` (`sanitize/serveSeed.ts:22`) and is never stored. Both handlers recompute it: get-activity substitutes, check-activity grades against the same draw (`check-activity-handler.ts:529-541`). Choice shuffles and ordering use the same seed (`servedOrder.ts:48`).
- **Re-drawing is explicitly out of v1:** seeded-data D9 says "a new draw needs a new attempt model". That model is what D65 builds.
- **BE-2** (practice-banks.md:297): derived `name: = expr` and `where` are BANKS-ONLY, and a HARD ERROR in an activity. The trigger is "the first authored activity that needs either one", with the curriculum side's yes (B-162). **Their sample needs both** (`p: = g * a`, `where dol: gcd(a, b) == 1 and mod(g, 2) == 0`), so the trigger has fired on paper.
- **Why BE-2 deferred:** an evaluator in the READ bundle costs ~338 KiB. The bundle is 1,093,590 B today against a 1500 KiB ceiling (perf-budgets.mjs:53). **But banks already avoid it:** BE-3 enumerates each template's valid combinations AT IMPORT and stores the table, so serving picks a row by hash and evaluates nothing (`bankSeed.ts:204`, cap `BANK_COMBINATION_CAP` = 10,000). Both bundles carry `RESERVED_SEED_NAMES`, so any change to the activity seed schema means re-bundling plus two redeploys.

**Catalogue and banks**
- Today 21 live catalogue activities carry `x_dol_skills: <primary>, <review>`. The importer drops it as an `x_*` key (`markdownToTiptap.ts:3852`). Every one is two skills. Their DoL is a `## Check for understanding {checkpoint}` section.
  - **7 of the 21 DoLs contain a rubric (teacher-marked) item**, and in the ones checked it is the FIRST item, so it is the primary (e.g. 714/04, 801/04, 701/03).
  - **Only 3 pilot files have a ```seed fence at all.** Today's live DoLs are UNSEEDED, so a "fresh draw" of them would be the identical questions.
- `activities.primary_skill` is stored (0066). `practice_item` (0058) holds `mis.*` only INSIDE `document` jsonb (`mistakeFeedback[].misconceptionId`, mc `choices[].misconceptionId`). **There is no mis column**, so filtering items by mis today means a jsonb walk. There is no tier column either.
- Mixed practice already has per-attempt draws (`mixed_row_index` = sha256(`practice:<session>:<item>`) mod rows, 0066:708) and records `misconception_ids` per first try (0067). **No targeted practice exists.** "Misconception weighting" was routed to §18 Corrective, which is not built (mixed-practice.md:578).
- `capabilityFacts.ts` joins only FENCES and INLINE grammars. Meta keys and heading markers like `{checkpoint}` and `submission:` are not capabilities (0 hits for "lock" in capability-facts.json). `seeded_data` is joined to the seed fence.

**Compliance**
- `section_checks` are kept 400 days on the dormancy path or 30 days after deletion. `prune_section_checks` (0035) is disarmed, and **when armed it keeps the LATEST attempt plus any graded one**. So an ungraded passing attempt 1 followed by a failing attempt 2 would be PRUNED. That is the one place "best attempt counts" collides with existing machinery (see DL-9).

## Decisions (numbered; each with options and a recommendation)

### Authoring

**DL-1 The DoL marker.** Two authored keys, as their sample proposes:
- the heading flag `{checkpoint dol}`;
- a meta key `dol_skills: <primary>, <review…>` that promotes today's dropped `x_dol_skills`. Its order maps item to skill.

Options: (a) both, as sampled; (b) the heading flag only, with skills inferred (primary = `skill:`); (c) a section-level `key: value` line (none exists today).
**Recommend (a).** The flag says WHERE the DoL is. `dol_skills:` says which item is which skill, and today's 21 files already carry it under `x_`. Importer rules:
- at most one `dol` section per activity;
- `dol` implies `{checkpoint}`, so the DoL is ALWAYS its own check group and never shares a check with the lesson;
- `dol_skills[0]` must equal `skill:` (hard error);
- `dol` without `dol_skills:` is an error under `--strict`.

The schema gains `Section.dol?: { skills: string[] }`. Per the CLAUDE.md orphan rule it is read by the viewer (the retake UI) and by both handlers, with a rendered-output guard.
⚠ This is a new authored grammar, so it needs a capability row and the B14 pin bump (DL-15).

**DL-2 What an "item" is, for the pass rule.** Their answer 3: the primary item is the first; a multi-blank item is right only when ALL its blanks are right.
**Recommend: item = a gradable BLOCK in the DoL section, in document order** (a paragraph with its blanks, an mc, a shortanswer, a graph), skipping figures and prose with nothing to grade. The importer requires **exactly `len(dol_skills)` gradable blocks** in the DoL (hard error), so the mapping can't silently shift. Their sample (2 blocks, 2 skills) and 714/04 (shortanswer + blank paragraph) both fit. ⚠ The 21 live files must be dry-run against this before it ships. Any file that fails is a curriculum fix, filed by letter.

**DL-3 Lifting BE-2 for activities, and how.**
Options:
- (a) Lift it by **enumerating at import**, BE-3's method. The importer evaluates derived values and `where` over the DoL's seed variables, stores the valid-row table in the document, and serving picks a row by hash. **No evaluator enters the read bundle**, so the ~300 KiB objection to lifting goes away.
- (b) Lift it with an evaluator at serve time (+~338 KiB per open; rejected in BE-2 for good reason).
- (c) A separate DoL bank file that the activity points to, served from `practice_item` (B-198's alternative). The DoL's content leaves the activity file, its version history splits from publish, and print has nowhere to draw from.

**Recommend (a).** Details:
- **Enumerate per INDEPENDENT GROUP of variables** (variables linked through derived values or `where`), not as one cross product. Their sample is 6×6×7×5×3×8 = 30,240 combinations jointly, which is over the 10,000 cap. As two groups it is 252 + 120 rows before the filter.
- One row is drawn per group. `BANK_COMBINATION_CAP` applies per group.
- Both bundles change, which means re-bundling, then two redeploys (get-activity, check-activity), with the migration applied first.
- BE-2's hard error is lifted ONLY inside a DoL section's seed fence (DL-4). Everywhere else in an activity it stays.

**DL-4 Seed scope: a ```seed fence INSIDE the DoL section.** Today `seedVars` is activity-wide, and a seed fence inside a section is accepted only as activity meta. A retake must redraw the DoL's numbers WITHOUT changing the lesson's.
**Recommend:** a seed fence inside a `dol` section declares **section-scoped** variables (`Section.dol.seed`). Rules:
- they are redrawn per attempt (DL-6);
- they may be used only inside that section;
- an activity-level variable used inside the DoL is a hard error, because it would not redraw and so wouldn't be a parallel form.

`where dol:` (their spelling) and a bare `where:` both mean "this section" there. **Recommend accepting only `where dol:`**, so one spelling exists. ⚠ This needs a letter: C-123 lists the UNSCOPED `where:` as the activity form.

**DL-5 An unseeded DoL (all 21 live ones today).** A "fresh draw" of an unseeded DoL is the identical questions, re-asked after the student has seen the verdicts.
Options:
- (a) The pass signal works, but there is **no retake**: one attempt, as if locked. The importer warns "DoL has no seed: no retake".
- (b) A retake of the same items.
- (c) Unseeded DoLs keep today's `free` behaviour (unlimited re-checks) and only the pass signal is added.

**Recommend (a).** A retake with no parallel form measures memory of the first attempt, and (c) makes "best attempt" meaningless. ⚠ This CHANGES live behaviour for the 21 activities on their next republish: their DoL becomes single-attempt where today it is free. That needs the author's yes, and a letter so the curriculum side seeds the DoLs it wants retakeable.

### The retake

**DL-6 Per-attempt seed.** The DoL section's draw is `serveSeed(version, student)` for attempt 1, so a student's existing values never change, and `…:dol:2` for the retake. Shuffles inside the DoL use the same per-attempt seed. The rest of the activity keeps its seed untouched.
- **Which form to serve:** get-activity serves form n = (that student's checks on the DoL section in this version) + 1, capped at 2. That is one indexed lookup, made ONLY when the document has a DoL.
- **Which form to grade:** check-activity derives the form the same way, and the client sends the form it was served. A mismatch (two devices, a stale tab) is a 409 `dol_form_stale`, and the client refetches. A server never grades form 2 values against form 1.
**Recommend as written.** The seed and form index are not stored: form = attempt_number for a DoL section, so they are derivable.

**DL-7 The attempt cap and the mode.** `submissionMode` is activity-wide, but the retake belongs to one section.
**Recommend:**
- the `dol` flag ITSELF sets that section's allowance: 2 attempts if seeded (DL-5), 1 if not;
- the rest of the activity follows its own `submissionMode`;
- no new `submissionMode` value;
- `record_check`'s `p_locked boolean` becomes `p_max_attempts int` (null = unlimited, 1 = today's lock, 2 = DoL). The same refusal applies after the replay lookup, and the existing `section_locked` 409 code is reused.

**Republish** starts every student clean, as the lock does today: a new version brings two new attempts. An earned pass survives (DL-9). **No teacher "grant another retake" in v1.** It joins the existing teacher-unlock TODO.

**DL-8 What the student sees between attempts.**
After attempt 1, the student sees:
- per-item verdicts and the authored mistake feedback;
- **NOT the worked solutions**. Attempt 2 is the same items with new numbers, so form A's worked solution IS the answer method for form B, and showing it first turns the retake into copying;
- a "Try a new version (1 left)" button, hidden once the primary item has passed (best counts, so a retake can't hurt, but it has no purpose either).

After attempt 2, or once the DoL is passed: solutions as today (D8).

**AMENDED by C-163: the retake opens on the student's NEXT PRACTICE DAY**, not straight away.
- The day is computed in the **activity owner's timezone** (`users.timezone`, else the platform default, the same fallback as `fact_class_zone`, 0050). A section check has no class context, and the owner is the class teacher in the ordinary case, including Bank copies.
- The server enforces it: check-activity refuses form 2 before that day (409 `dol_retake_not_yet`), and get-activity serves the button state as "available tomorrow".
- Next-day is NOT much costlier than same-day: one date comparison on `section_checks.created_at`. So no departure is needed.
- It carries the same latent risk as ER-12: a teacher's timezone change can move the boundary.

**Recommend as amended.** ⚠ This amends flow-modes D8 ("a locked group DOES reveal its solutions") for DoL sections only. Today the server returns `solutions` on every check, so this is **server-side withholding** (the handler omits them while attempts remain and the DoL is not passed), not a client-side hide.

**DL-9 Rubric items on a retake (C-151 b).**
- On form 2 the shortanswer is re-asked unchanged, with empty inputs. Restore must NOT prefill a DoL from the latest attempt while a retake is in progress, so `my_latest_checks` restore skips a DoL that has a form-2 row pending.
- The teacher queue gets a second row (a new check_id, so 0034's staleness logic is unaffected).
- The teacher's grading view shows both attempts, labelled "First try" and "Retake".

**Recommend as written.**

**DL-17 Seeded values inside maths (their sample depends on it).** `{name}` inside `$…$` is not substituted today, because in LaTeX `x^{a}` is a brace group (R2). A Y9 algebra DoL writes its numbers in maths (`${p}x - {q}$`).
Options:
- (a) the curriculum side keeps references in plain text: "Factorise fully: {p}x − {q}". This works today, but the algebra is typeset as prose;
- (b) a maths-only reference spelling, e.g. `\seed{p}`, which nobody would write by accident. It is substituted into `latex` at serve time (get-activity), and the importer accepts it only for a declared variable. The print answer key and the editor preview substitute the same way;
- (c) substitute a bare `{name}` inside maths when `name` is declared. This is ambiguous with `x^{a}` when `a` is declared, and that ambiguity is the reason R2 exists.

**Recommend (b), in slice 1.** Every algebra DoL needs it, and the curriculum side's sample already assumes it. It touches the read path, so the get-activity bundle changes anyway under DL-3. ⚠ It needs a letter: one more spelling for them to learn and lint.

**DL-18 Order of D60-shaped items.** No decision: the seeded-answer `gap_equation` wish is filed in TODOS with the trigger "904 activity 01 drafted", next to D60's held "equivalent and in a stated form" letter.

### The pass signal

**DL-10 The pass rule for an AUTO-graded primary item.** Primary block correct, meaning every blank in it is `correct`, on ANY attempt in any version of an activity whose `primary_skill` = the skill. **Recommend as written.** A pass is a fact about the student, not the version, so a republish never takes it back.
**AMENDED by C-164 item 2 (ruled 2026-10-24): only the skill's FINAL part grants the pass.** A non-final part's DoL covers only the ideas taught so far (D48 ruling 6), so a pass there would open D66's P–E templates early. Four skills have more than one part today: linear.slope.two-points (2), linear.model.contextual (3), function.repr.correspondence (3), number.divisibility.rules (2).
- The platform stores neither part counts (skill registry `id = n`, import-time only) nor `chain_role`. So the importer computes it and writes a service-role flag `activities.dol_grants_pass boolean`, guarded against client writes like `primary_skill` (0066), in 0069.
- The flag is true for the last `chain_role: part` activity of its `primary_skill` in teaching order (`source_path`), and for a one-part skill's only part.
- It is false for a consolidation.
- It is true for a teacher-made activity with no chain info, which is treated as one part.
- If the registry declares more parts than are imported, the importer warns, and no activity of that skill grants a pass until the final part exists.
- `record_check` writes `dol_pass` only when the flag is true. The flag is identity data (`NOT_CONTENT`), so moving files rewrites it path-only.

**DL-11 The pass rule for a RUBRIC primary item (7 of the 21 live DoLs).** The handler can't decide it; a teacher must grade first.
Options:
- (a) full marks on every criterion, decided when the grade is RELEASED;
- (b) an authored threshold (`pass: 4` of 6), which is a new key for the curriculum side;
- (c) the teacher ticks "DoL passed" explicitly in the grading view, prefilled from (a).

**Recommend (c).** The teacher is already making a judgement there, the prefill keeps the common case to one click, and no new authored key is needed.
**AMENDED by C-163: prefill from the BASE-LEVEL lines.** "Passed" is prefilled when every rubric line tagged at the locale's base level (`A` for nz-ncea) is at full marks. Full marks would set the pass bar at Excellence.
- The level tags are authored today as `x_dol_rubric_levels: A, M, E` (rubric-line order), and the importer drops them. So this needs `dol_rubric_levels:` promoted, and an optional `RubricCriterion.level` written by the importer.
- The importer refuses a count that differs from the rubric's line count.
- The orphan rule applies: the field's reader is the grading view's prefill, guarded on its rendered output.
- With no tags (801/04 today), there is no prefill and the teacher ticks unaided.
- One more authored key, so it joins DL-15's capability row.

**DL-12 Where the pass is stored.**
Options:
- (a) derived on read from `section_checks` verdicts plus the primary-block id;
- (b) **materialized**: `dol_pass(student_id, skill_id, activity_id, version_id, check_id, passed_at, source 'auto'|'teacher')`, insert-once per (student, skill, activity).

**Recommend (b).** Three reasons:
1. `prune_section_checks`, once armed, deletes an ungraded passing attempt 1 when attempt 2 is the latest (see What exists), so (a) would silently UN-pass students.
2. D66 selection and D67 read "has this student passed skill S" on every plan or page. One indexed lookup beats a verdict walk.
3. The rubric pass (DL-11 c) is a teacher write, which needs a home anyway.

Writers: `record_check` for auto passes (in the same transaction, from the verdicts plus the document's primary block), and the grading RPC for teacher passes. **A pass is never deleted except by account purge.** It is STUDENT-DERIVED, so data-map + retention-policy are updated in the migration's commit (BE-8 / CLAUDE.md).

**DL-13 Who reads the pass in this arc (P1: a primitive needs a caller).**
**Recommend:**
- (1) **D66 tier selection** in mixed practice, which Zan ruled into "ONE slice with the DoL-passed signal". Before a pass, `mixed_plan` serves D–C templates of that skill. After it, P–E are added and D–C stay as maintenance (their D66 ruling 3). Untagged templates are never filtered, so chain 1 is unchanged.
- (2) the student's own DoL state on the activity ("Passed" on the section).
- (3) a "DoL passed" mark in the teacher's class progress view (one column; no new page).

D67's tracker is the next consumer and stays its own arc.
D66 storage: a `practice_item.tier char(1)` column, written by the importer. `fingerprintBankItem` includes `tier` ONLY when present, so untagged items keep their fingerprints and a re-import of chain 1 writes nothing.

### Targeted practice

**DL-14 Targeted practice between attempts.**
Options:
- (a) build it in this arc: after a failed attempt 1, offer "Practise first", up to N items from the primary skill's ratified bank whose `mis.*` intersect the ones attempt 1 showed, falling back to any items of that skill. This needs a `practice_item.misconception_ids text[]` column extracted at import (GIN index) and a `kind = 'targeted'` session on the mixed runner;
- (b) **a SECOND slice of this arc**, after the retake and the pass are live;
- (c) file it with a trigger.

**Recommend (b), and offered, never a gate.** A required detour before the retake would block a student whose skill has no ratified bank (today only chain 1 has one). The `misconception_ids` column ships in slice 1's migration anyway, because the authoring check below needs it.
**Authoring check (B-198), slice 1:** the importer warns, and fails under `--strict`, when a DoL binds a `mis.*` that no ratified template of the primary skill's bank binds. It applies only when that bank exists, since banks lag activities.

### The boundary, migrations and compliance

**DL-15 Letters to the curriculum side (one letter, after the rulings). B-209 and C-163 already settled items 1, 3 and 4 below in substance; item 5 is amended.**
1. Receipt of the sample. Agreement on `{checkpoint dol}` + `dol_skills:` (DL-1) and on block = item with the count rule (DL-2).
2. BE-2 lifted for DoL seed fences only, enumerated at import, with per-group caps (DL-3).
3. `where dol:` as the only spelling in an activity (DL-4), retracting C-123's unscoped form for activities.
4. An unseeded DoL gets no retake (DL-5), so the DoLs they want retakeable need a seed fence. Plus the dry-run result for the 21 live files under DL-2.
5. The rubric pass (DL-11) and whether they want an authored threshold later.
6. The capability row: `dol_retake` (`reached_by: heading marker`; capabilityFacts gains a heading-marker join because it joins only fences and inline grammars today) and the `seeded_data` facts change (derived/where in activities). Their pin bump follows after we push (CLAUDE.md B14).

Their sample also asks whether a `gap_equation` gap accepts a seeded `{{=expr}}` answer with `!mistake` bindings. That is a fact to check and answer in the same letter, not a decision.

**DL-16 Migration and deploy shape.** One migration (0069) carrying:
- `record_check` with `p_max_attempts`;
- `dol_pass` + its RLS (owner-student read, teacher read via the class helpers);
- `practice_item.tier` + `misconception_ids`;
- the `mixed_plan` tier filter;
- **the `mixed_item_for_check` return shrink carried in TODOS** (its trigger fired at 0068 and was missed; this IS the next mixed-practice migration).

Then re-bundle both servers and redeploy get-activity + check-activity, migration FIRST (CLAUDE.md ordering rule). The SPA push comes only after the migration is live (OV-7). verify-0069, plus re-run verify-0066 (TODOS asks for it after the shrink).
Compliance: `dol_pass` is a new student-derived table, so data-map + retention-policy go in the same commit. A retake is a second `section_checks` row, the same data class `free` mode already stores without limit, so it adds no new category. The 0035 prune-arming checklist gains a line: "dol_pass makes pruning attempt rows safe for the pass signal; re-check FT-9."
**Recommend as written.**

## Slices (if ruled)

1. **Retake + pass + D66 selection:** DL-1…13, DL-15…17. One migration, two redeploys, the importer, the viewer.
2. **Targeted practice** (DL-14 b), on the mixed runner.

## Not in scope

- A teacher "grant another retake".
- Printing form 2.
- Per-locale DoL variants (TODOS C-82).
- The D67 tracker.
- Video (D64).
- Any change to `free`/`locked` outside a DoL section.
