# Mixed practice — the session, the pool, the scheduler (D43, design pass)

**Status:** **GATE LIFTED by the author 2026-10-20: "I lift the gate (build now,
test on chain 1, launch is my switch)."** The build starts now and is tested
against chain 1's ratified bank; switching mixed practice on for a real class
stays the author's call (MP-14). Design RULED + ENG-REVIEWED 2026-10-19
(MP-1…MP-15, ER-1…ER-14) and DESIGN-REVIEWED 2026-10-20 (DM-1…DM-20), as
amended by C-145 and C-146 (both accepted, both closed). Build in four slices
(see "Build slices"), Opus builds, a Fable review before each slice goes live.

Parents: [practice-blocks.md](practice-blocks.md) (premises 1–8; "Mixed
practice, the diagnostic's skill half, period assembly" — deferred to this pass)
and [practice-banks.md](practice-banks.md) (PB-1…PB-12, BE-1…BE-12; the bank
store this pass serves from).

## The curriculum text this design rests on (quoted at their `main` acab88f)

Re-derived 2026-10-19 from `github.com/ZanReed/curriculum` at
`acab88ff4841b834e82a8e0f95d644aa3a924ed2` (`git show origin/main:<file>`, never
from a letter). Their files are canonical; these are the lines the MP items
cite, quoted short.

**`authoring-principles.md` §17 ("Practice is generated, not authored per
lesson"):**
- Q1 — "No same-day practice block on today's skill. The activity's independent
  beat and DoL are its first exposure; it enters the spacing queue and returns
  the next day."
- Q2 — "A lesson's pairing fixes the *pool* (skills taught to this point in the
  sequence), not the items."
- Q3 — "Skills enter at expanding intervals. Confusable skills (D24, §14) appear
  together so the item forces the choice of method; unrelated skills mixed
  together are spacing, which is fine, but it isn't interleaving."
- Q4 — "Target about 80% success: practice that mostly fails is rehearsing
  errors."
- Q5 — the bank "holds short items, about 60–90 seconds each" and "adds
  discrimination items ("which method fits?") per consolidation, for confusable
  sets."
- Q6 — "Diagnostic gaps in prerequisites seed the mixed-practice queue from day
  one." and "When the sprint is off, its minutes go to mixed practice unless the
  teacher takes them back."
- Q7 — default period shapes: 50 min "fluency 5 · hook 2–3 · activity (cap) ·
  mixed ~8–10"; 60 min "… mixed ~18–20"; 100 min "… mixed ~12 · activity (cap) ·
  mixed ~12".
- Q8 — "Homework is optional extra spacing, drawn from the same scheduler."

**`decision-log-additions.md`, D43 (ratified 2026-10-01):**
- Q9 — "there is one mixed block, scheduled by spacing, that places confusable
  skills next to each other. It uses the same confusability judgement as D24".
- Q10 — "Where the class median is above criterion, students below it still get
  fluency items, inside their own mixed practice."
- Q11 — "The platform builds the scheduler, engine and session types. The
  curriculum specifies the banks, the fact scope and the rules in §17."

**D43 amendment (2026-10-06, second), item 1 — the sprint's step model, the
precedent for MP-3:** a fact's step is "derived from its attempt log and never
stored as a judgement. A met attempt moves it up one step, at most once a
practice day"; step n is due again `sprint_step_intervals`[n] "CALENDAR days
later, in the class teacher's timezone".

**D47, added at the curriculum side's request (C-145 point 1):** "Spacing
needs initial learning first. Spaced and interleaved practice pay off after a
student has reached criterion once (Rawson & Dunlosky, successive relearning)."

**The activity-length ruling (`activity_defaults.duration_min` is now 32, not
24):** "At 35 the 50-minute period leaves about 5 minutes of mixed practice with
the sprint on: 3–5 items at 60–90 seconds each, too few to do the spacing job.
At 32 it leaves about 8–10."

**§18 period kinds (Review / Corrective):** Review "is the existing scheduler
with a longer session, not a new engine" (D-log); Corrective routes a student to
"bank items tagged with that id", else "the chain's discrimination items (§17),
then harder mixed items".

**Grading defaults, ruling 10–11:** "Practice is never graded. That covers
activities, DoLs, banks, mixed practice and homework." Their platform owed-list
item 6: "A per-student practice record for a set of skills, printable beside a
quiz score, plus a class chart of practice against quiz score (ruling 11).
Trigger: mixed practice's gate."

**Paraphrases corrected by these quotes** (the first draft of this doc, and the
parent, said otherwise):
1. "mixed ~15" was the old shape. At `duration_min` 32 the 50-minute period has
   **~8–10** mixed minutes (≈ 6–8 items at 60–90 s); 60 min has ~18–20; the
   100-minute shape has TWO mixed blocks of ~12. (The parent's "capped at
   `activity_defaults.duration_min` (24)" is stale too: it is 32.)
2. Q1 was missing: today's skill is NOT in today's pool. It enters the next day.
3. Q2 says the pool is fixed by the lesson's place in the SEQUENCE; the first
   draft used the teacher's add. MP-2 now carries that choice explicitly.
4. Q4's 80% target was missing; it bears on MP-3/MP-4 (and is the same 80% the
   sprint's check uses).
5. Q8 and §18 (homework, review periods, correctives) all reuse "the same
   scheduler" — so the scheduler must not assume a session is the daily block.

## What exists (re-derived 2026-10-19 against code and live DB — P10)

- **Bank store (0058):** `practice_item`, PK `(owner_id, item_id)`; item id
  `<stem>#<heading>` (PB-3, never reused), `role skill | discrimination`,
  `skill_id` (skill banks) or `discriminates` (≥ 2, discrimination banks),
  `chain_id`, `status draft | ratified`, `document` (ANSWER-KEY class),
  `seed_spec`, **`value_table`** (every valid seed combination, BE-3),
  `fingerprint`, `retired_at`. RLS: **owner-only SELECT**, no client writes —
  a student cannot read a row, so serving must be service-role after an
  authorization step. Rows are owned by the **catalogue importer's account**
  (`--owner`), not by the class teacher. Teacher preview only (PB-11). **No
  student serving exists, and no server-side row picker exists yet** (BE-3 ruled
  "hash(`<seed>:<item id>`) mod rows"; only the preview's sample is built).
- **Seeding:** `serveSeed(versionId, studentId)` (`viewer/src/sanitize/
  serveSeed.ts`) gives a student the same numbers every time on an ACTIVITY.
  For banks, BE-3/BE-4 already fix the mechanism: a seed string picks a ROW of
  the stored value table, and the item's fingerprint pins the revision. Seeded
  MISTAKE matchers are evaluated per student at grade time
  (`server/grading/seededKeys.ts`).
- **Fluency machinery (0045–0051, 0065):** `classes.fact_sprint_on_at` (the
  sprint's on/off), `sprint_sessions` (class, student, `practice_day`,
  `ordinal`, the planned `items` jsonb fixed at start, `keep_until`, …) +
  `sprint_attempts` (`session_id, seq, reask` PK). **No step or box is stored:**
  steps are derived from the attempt log (`fact_sprint_log`), per the curriculum
  ruling quoted above. Practice day = the class teacher's `users.timezone`
  (`fact_class_zone`). `keep_until` + a disarmed prune (0048). Browser-graded
  facts (premise 3 exception); **mixed items stay server-graded.**
- **Taught-so-far — the join the first draft assumed DOES NOT EXIST.**
  `class_activities (class_id, activity_id, added_by, added_at)` exists (0030).
  But an activity's `skill:` is **not persisted anywhere**: the importer reads
  it for the coverage manifest only; `meta.skills` is `[]` on all 52 live
  `activity_versions` (live query, 2026-10-19), and no table has a skill column
  except `practice_item.skill_id` and `misconception_registry.skill`. A teacher's
  Bank copy points at its source by `activities.copied_from_activity_id` (0054,
  `on delete set null`); catalogue rows carry `source_key` (0041).
- **Grading:** `check-activity` (verify_jwt true) grades activity VERSIONS only.
  Its order (`check-activity-handler.ts` header): auth present → **authorization
  chain as the CALLER** (`get_activity_version_for_check`, one no-oracle "Not
  available") → validate → **raw doc read with service role, only now** →
  derive seed → grade → record. It already multiplexes a second request shape
  (`mode: 'restore'`) behind the same chain — the precedent for MP-6(a).
  Region-pinned to `us-east-2` (audit #14).
- **Bundle sizes (2026-10-19, committed files):** `grading-server.bundle.js`
  2,950,597 B = **2,881 KiB vs `GRADING_SERVER_MAX_KIB` 4,000** (1,119 KiB
  headroom). `viewer-server.bundle.js` 1,093,590 B = 1,068 KiB vs 1,500. **The
  sanitizer is NOT in the grading bundle** (`sanitizeBlock` greps 0 there, 7 in
  the read bundle), so MP-7(a) adds it — measure at build, expect well under the
  headroom since schema code is already shared.

## Scope of this pass

IN: the mixed session (what a student does), the pool (which items are
eligible), the per-student record and scheduler, per-session seeding, serving
and grading, the teacher's on/off and first view, retention.
OUT (each its own pass or later): the diagnostic's skill half and "diagnostic
gaps seed the queue" (Q6; needs the Y7 entry bank, answer 8), period assembly
(last in the ruled order), fluency facts interleaved inside mixed (MP-11),
homework (Q8), Review and Corrective periods (§18) — but the scheduler is
designed so all of these are "the same scheduler with a different session" —
the printable practice record beside a quiz score (their owed item 6; its
trigger is this gate, so it gets filed when the gate fires), any Home card.

## Decisions (numbered; each with a recommendation)

**MP-1 — Session record.** (a) new `mixed_sessions` + `mixed_attempts`, shaped
like the sprint's (planned items fixed at start, practice day, ordinal,
checkpoints, `keep_until`); (b) generalise `sprint_sessions` with a `kind`
column.
**Recommend (a).** Sprint rows carry fact-only columns (typing baselines,
modality, registry rev); premise 4 already says a session is not an activity.
Same prune discipline, separate tables.

**MP-2 — The pool ("taught so far").** REVISED after P10 and Q1/Q2. Three parts:
- *Taught signal.* (a) the teacher's add: a skill is taught to a class when an
  activity whose primary skill it is was added to the class
  (`class_activities.added_at`); (b) the sequence position: everything before
  the class's furthest-added activity in chain order (Q2's literal reading).
  **Recommend (a),** the teacher's own signal, which also covers a teacher who
  teaches out of order; ask the curriculum side whether Q2 means more than
  this.
- *Not the same day (Q1).* Eligible only when the add's practice day (teacher
  timezone) is **before** today's.
- *The missing join.* Persist the primary skill: a new `activities.primary_skill`
  column written by the importer from `skill:` (catalogue rows), read through
  `coalesce(copied_from_activity_id, id)` for a Bank copy. The bank whose items
  serve it is the **source activity's owner's** `practice_item` rows. A copy
  whose source was deleted (`set null`) contributes nothing (shown to the
  teacher as "no bank").
An item is eligible when `ratified`, not retired, and its skill (a
discrimination item: ALL its `discriminates`) is in the pool. **Recommend all
three.**

**MP-3 — Scheduler grain and state.** REVISED to the sprint's ruled model.
(a) per (student, SKILL), the step **derived from the attempt log, never
stored**; a session's first-try result on a skill moves its step up at most once
a practice day (all first tries right), a wrong first try sends it to step 0;
step n is due `mixed_step_intervals`[n] CALENDAR days later in the teacher's
timezone; items rotate within a skill with fresh numbers; (b) per (student,
item); (c) a stored box + `due_on`.
**Recommend (a).** Spacing is about skills (Q3); per-session numbers mean an item
is not "the same question" twice; deriving from the log is what the curriculum
already ruled for the sprint and lets a rule change recompute without a
migration. Intervals, and the step rule, as curriculum graph keys. Leitner-style
steps, not FSRS (the sprint's ruling, same reason). Q4's 80% target is a
read-out for the teacher view and a calibration check, not a v1 control loop.

**MP-4 — Interleaving and confusables.** A session draws due skills interleaved
(never two in a row from one skill where avoidable), and includes a
discrimination item whenever ALL its `discriminates` skills are in the
student's pool (Q3/Q9).
**Recommend this;** the exact mix (new vs due vs discrimination) and the order
when more is due than fits are curriculum keys, asked in the letter.

**MP-5 — Per-session seed.** REVISED to BE-3/BE-4. Seed string
`practice:<sessionId>:<itemId>` → row = hash mod `value_table` rows; the attempt
stores the **row index and the item fingerprint** so a teacher or a re-grade
sees the same numbers, and a re-import mid-session cannot change the key under
a student.
**Recommend this.** Same numbers within a session, new ones across sessions;
uses the table BE-3 already stores instead of deriving at serve.

**MP-6 — Grading path.** (a) a `mode: 'practice'` on `check-activity`, its own
caller-scoped authorization RPC — "this session is the caller's, open, and this
item is in its PLANNED list" — then the same ordering (service-role read only
after it); (b) a new `check-practice` function.
**Recommend (a).** One warm isolate for the 2.9 MB grading bundle instead of two
cold ones; `mode: 'restore'` already proves the multiplexing; authorizing
against the session's planned list (not "the pool holds it") makes the item set
the server's choice. Needs a grading-bundle change and `deploy:check` (author).

**MP-7 — Serving.** The student needs items sanitized (no answer keys) with the
session's row substituted. (a) served by `check-activity` (verify_jwt true) as
`mode: 'practice-start'` (plans the session, returns sanitized items); (b) a
`get-activity` branch.
**Recommend (a).** `get-activity` is `--no-verify-jwt` for its anonymous meta
branch; practice is signed-in only, so it belongs behind the platform gate.
Adds the sanitizer to the grading bundle (P10: not there today; 1,119 KiB of
headroom).

**MP-8 — Session shape.** REVISED for Q7. (a) a fixed item count per session,
default from a graph key sized to the 50-minute shape (~6–8 items at 60–90 s),
the teacher may change it per class; (b) a timer.
**Recommend (a),** with partial work counting (the sprint's G1 ruling). A
longer session (60/100-minute shapes, §18 Review) is the same session with a
larger count — no second engine.

**MP-9 — Feedback per item.** One attempt, then the verdict, the authored
mistake feedback and the solution; the first-try result is what moves the step.
**Recommend this** (practice, never graded); a retry would blur what the
scheduler reads.

**MP-10 — How a discrimination answer credits skills.** (a) it moves no skill
step; it is logged and read as a per-(student, consolidation) discrimination
record; (b) correct credits every named skill, wrong debits the one chosen.
**Recommend (a) for v1** and ask the curriculum side; (b) needs to know which
skill a wrong answer "was", which the item format does not say.

**MP-11 — Fluency inside mixed (Q10).** (a) not in v1: the sprint already holds
the fluency minutes; the attempt row carries an item `kind` so facts can join
later; (b) interleave below-criterion facts now.
**Recommend (a).**

**MP-12 — Teacher surface.** A per-class on/off beside the sprint's, and a
first view: per-skill class summary (due / struggling counts, and Q4's success
rate), built on the class-progress patterns (0061).
**Recommend this;** per-student detail, and their printable practice record,
later on their own trigger.

**MP-13 — Retention.** Attempts are student work: `keep_until` + a prune
shipped DISARMED and unscheduled (like 0048); `data-map.md` and
`retention-policy.md` updated in the migration's commit (CLAUDE.md).
**Recommend this.** Arming is a counsel question, as for 0048.

**MP-14 — Gate.** (a) code serves only `ratified` items and has NO "two chains"
check; the launch is the author's switch; (b) code refuses to serve until two
chains are ratified.
**Recommend (a).** "Two chains" is a pedagogy launch rule, not an invariant;
coding it would block a one-chain pilot the author might want.

**MP-15 — Capability row (PB-12).** Added when serving ships → `pnpm
facts:capabilities` → pin-bump PR on the curriculum repo (CLAUDE.md B14 duty).
**Recommend this.**

## Rulings — author, 2026-10-19

Walked one by one (numbered yes/no, recommendation first).

| # | Ruling |
|---|---|
| MP-1 | **(a)** new `mixed_sessions` + `mixed_attempts`. |
| MP-2 | ⚠ **Part 1 AMENDED twice: by ER-10 (class's first check), then by C-145 (2026-10-20): taught = EACH STUDENT'S OWN first check.** As first ruled — **all three:** teacher's add = taught; eligible from the NEXT practice day; persist `activities.primary_skill` (importer-written, read through `copied_from_activity_id`, served from the source owner's bank). Ask the curriculum side whether Q2 means more. |
| MP-3 | **(a)** per (student, skill), step derived from the attempt log, never stored; calendar intervals in the teacher's timezone; intervals + step rule as graph keys; Leitner-style. |
| MP-4 | **As recommended;** mix and overflow order asked as graph keys. |
| MP-5 | **As recommended:** `practice:<sessionId>:<itemId>` → value-table row; attempt stores row index + item fingerprint. ⚠ The doc's claim that this stops a re-import changing the key was FALSE (the fingerprint only detects it; OV-1) — **ER-4 adds a snapshot of each served item**, which is what makes it true. |
| MP-6 | **(a)** `mode: 'practice'` on `check-activity`, authorized against the caller's open session's PLANNED list. |
| MP-7 | **(a)** `mode: 'practice-start'` on `check-activity`; sanitizer joins the grading bundle. |
| MP-8 | **(a)** fixed item count from a graph key (~6–8 for the 50-minute shape), teacher may change per class; partial work counts; longer sessions = larger count. |
| MP-9 | **AMENDED.** Feedback as recommended (one attempt → verdict, mistake feedback, solution; the first try moves the step). PLUS a **per-class "graded" toggle, default OFF**: when on, each session records a **score** (first tries right / items) shown to the teacher per student and to the student, and the score goes to the **gradebook export** (⚠ ER-8: no export exists; v1 RECORDS and SHOWS scores, the export is filed in TODOS with a trigger). The author's words: "allow teachers to toggle on grading if they want it. While I dont agree with the mentality many teachers grade everything to give students feedback." The scheduler ignores the toggle. ⚠ P10: **no gradebook export exists in the app today** (teacher grades live in `check_grades`, 0034, read in the grading queue; nothing exports them) — the export's scope is an eng-review question (ER below). ⚠ Curriculum: their grading default is "Practice is never graded"; it is a DEFAULT ("How a school grades is its own call"), so default-off honours it — told to them in the letter, not asked. |
| MP-10 | **(a)** log only, per (student, consolidation); ask them. |
| MP-11 | **(a)** not in v1; attempts carry an item `kind`. ⚠ **Recorded 2026-10-20 as a NAMED DEPARTURE from D43** (C-145 point 0, author yes): D43 says below-criterion students "still get fluency items, inside their own mixed practice"; until this lands, such a student in a class with the sprint off gets no fluency work. **Trigger:** the first class to switch mixed practice on while its sprint is off (TODOS). |
| MP-12 | **As recommended:** per-class on/off + per-skill class summary (due / struggling / success rate vs 80%); per-student detail and the printable record later on their own trigger. |
| MP-13 | **As recommended:** `keep_until` + disarmed, unscheduled prune; compliance docs in the migration's commit. ⚠ With MP-9's toggle, a graded session's SCORE is a grade record, not raw practice — the prune must keep it (eng review). |
| MP-14 | **(a)** no "two chains" check in code; the launch is the author's switch. |
| MP-15 | **As recommended.** |

## Asks for the curriculum side (one letter, after the rulings — sent as B-185, below)

1. Confirm the quote-back above is the text this design should rest on, and
   that nothing newer on their side supersedes it.
2. Graph keys: step intervals and step rule (MP-3), session size default
   (MP-8), the new / due / discrimination mix and the order when more is due
   than fits (MP-4).
3. Discrimination credit (MP-10).
4. Pool: is the class's first check (ER-10, replacing the teacher's add) the
   "taught" signal Q2 means, and is the activity's primary `skill:` the right
   join (MP-2)? The platform will persist it on the activity row.
5. Which chain is their second ratified bank, and when (the gate).
6. Worked solutions: 4 of 21 live chain 1 items carry one (MP-9).
7. Backlog entry when a bank lands after its chain is taught (new skills per
   session; order).
8. A definition of "struggling" for the teacher view (MP-12), as graph keys.
9. Pool scope: `supporting_skills:`, and earlier-year skills not taught here.
10. Item choice within a skill: plain rotation vs misconception weighting.
11. Confirm one item per skill per session, and ALL-skills for discrimination.

## Eng review — 2026-10-19 (`/plan-eng-review`) — ER-1…ER-14 ALL RULED AS RECOMMENDED by the author 2026-10-19

Target: this doc as ruled (MP-1…MP-15). Design only; nothing is built. Evidence
kinds: static reads of code and migrations, two live read-only SQL queries
(gate + where `skill:` lives), committed bundle sizes. Outside voice: an
in-host subagent (Codex CLI not installed — native coverage, not external).

### What the code says (the facts the findings rest on)

1. `practice_item` is "ANSWER-KEY CLASS (documents carry answers,
   value_table every seeded value)" with owner-only SELECT
   (`0058_practice_item.sql`, table comment + `practice_item_read_own`). A
   student can never be given RLS on it.
2. `practice_item` holds ONE revision per `(owner_id, item_id)`; a re-import
   overwrites `document`/`value_table`/`fingerprint` in place (`sync_practice_items`
   insert … on conflict). A pinned fingerprint cannot be graded after it moves.
3. The importer's "unchanged" classification (`scripts/batch-import.mjs`
   `updatePayload` / `NOT_CONTENT`, ~l.280–384) compares every field the update
   writes; a FULL update writes `draft_content`. Publishing clears the draft, so
   a content-path write to a published activity creates a draft on it.
4. The sprint's state is per CLASS: `fact_sprint_log(p_class_id, p_student_id)`
   (`0050`), keyed sessions `unique (class_id, student_id, practice_day,
   ordinal)`, and the prune's `keep_until` comes from the class's
   `school_year_ends_on` + 30 days (practice-blocks RP-1/RP-3).
5. Slice 1's eng ruling (decision log): "Item list materialised on the probe
   row with server-derived correctness; RPC-only access".
6. No gradebook or grades export exists in the app (grep of `packages/app/src`
   for csv/gradebook: none). Teacher grades live in `check_grades` (0034) and are
   read in the grading queue.

### Findings (calibrated; ledger below records each choice)

- ME-1 [P1] (9/10) `0058` table comment — serving answer-key rows to students.
- ME-2 [P1] (8/10) `0058` one revision per item — re-import mid-session.
- ME-3 [P1] (8/10) `batch-import.mjs` `updatePayload` — the `primary_skill`
  backfill would write drafts onto every published activity if it rides the
  content path.
- ME-4 [P2] (8/10) where the scheduler lives (structure question).
- ME-5 [P2] (7/10) step grain across classes (fact 4).
- ME-6 [P2] (8/10) two mixed blocks in one practice day (§17 Q7's 100-minute
  shape; §18 Review) vs "at most once a practice day".
- ME-7 [P2] (8/10) MP-9's graded toggle: snapshot, stored score, denominator,
  retention.
- ME-8 [P2] (7/10) MP-9's export: none exists (fact 6) (feature-scope question).
- ME-9 [P2] (7/10) double start / re-submit idempotency.
- ME-10 [P2] (8/10) tests bound to output (the plan names none).
- ME-11 [P3] (7/10) indexes for planning + the teacher view; cold start.
- ME-12 [P3] (9/10) deploy order (CLAUDE.md OV-7 + migration-before-deploy).
- ME-14 [P2] (6/10) the taught signal (OV-5) — reopens MP-2 part 1.
- ME-15 [P2] (8/10) discrimination items need their own spacing (OV-7).
- ME-13 [P3] (9/10) practice day recomputed in the CURRENT zone:
  `fact_sprint_log` derives `(saved_at at time zone z.zone)::date` (`0050`
  ~l.248/256), so a teacher's timezone change moves history.

### Rulings (author, 2026-10-19; question D-numbers in brackets)

| ER | Ruling |
|---|---|
| ER-1 [D3] | **Caller RPCs gate every read.** `start_mixed_session(class)` runs as the student: current membership, class not deleted, mixed practice on; it plans the session, writes the planned list, and returns only ids/rows. `mixed_item_for_check(session, seq)` proves the session is the caller's and open and the item is in its plan. Only then the service-role read; sanitize before anything leaves. One no-oracle "Not available". |
| ER-2 [D2] | **The scheduler lives in SQL**, sprint-style: one step derivation read by the planner AND the teacher's class summary. (Structure question of the complexity gate; scope accepted as-is.) |
| ER-3 [D5] | **`primary_skill` is an identity write**: `classifyUpdates` sends a row whose `primary_skill` differs from the file's `skill:` to `pathOnly` (a "needs identity" like `adoptsKey`), which writes it with `source_path`/`source_key` and never a draft. The first run after the migration backfills the 52 live rows (dry run shows them); a later `skill:` edit is caught the same way. |
| ER-4 [D4] | **Snapshot served items**: `mixed_session_items (session, seq, owner_id, item_id, fingerprint, row index, document, row values)`, RLS on with NO policies (answer-key class; read only by the RPCs and the Edge service role). Grading and the teacher's later view read the snapshot. Data-map entry. |
| ER-5 [D6] | **History is per (class, student, skill)**, as the sprint. A student who changes class starts fresh; carry-forward across classes/years joins the sprint's existing year-end design pass. With `keep_until` = class end + 30 days, the prune never resets steps mid-year. |
| ER-6 [D7] | ⚠ **AMENDED 2026-10-20 (C-145 2a, author yes): a wrong day drops ONE step (`mixed_wrong_drop` = 1), not to 0; intervals `mixed_step_intervals` = [1, 3, 7, 14, 28]; the top step recurs every 28 days to year end.** As first ruled — **the step rule judges the whole practice day**: per (class, student, skill, practice day), any wrong first try → step 0, else all right → up one. A second session the same day prefers skills not yet practised today unless nothing else is due. |
| ER-7 [D8] | ⚠ **AMENDED 2026-10-20 (C-145 point 6, author yes): score = right ÷ PLANNED, still showing "answered n of N", labelled "practice score" and kept apart from attainment grades (including in ER-8's future export).** As first ruled — **Graded integrity:** the class's graded flag is copied onto the session at start; `score_right`, `score_answered`, `planned` are stored on the session at every save; score = right ÷ answered, shown as "answered n of N" (no zeros averaged in). Scores follow check grades' retention, NOT the practice prune; data-map + retention-policy updated. |
| ER-8 [D1] | **Export later, on a trigger.** v1 records and shows scores; the gradebook export (activity grades + practice scores together) is filed in TODOS with trigger "the first grades export is designed". (Feature-scope question of the complexity gate; no scope reduction of the ruled behaviour beyond deferring the export.) |
| ER-9 [D9] | **Record first, then answer**: the attempt row (unique per session, seq) is inserted before the verdict leaves; a replay returns the stored verdict, never a re-grade. Start returns the open session if one exists (unique class, student, practice day, ordinal). |
| ER-10 [D10] | ⚠ **REVERSED 2026-10-20 (C-145 point 4, author yes): taught = EACH STUDENT'S OWN first check on the activity, eligible from that student's next practice day. An absent student gets no practice on it until they catch up; existing progress views already show the missed activity (a dedicated catch-up surface is filed in TODOS). A future "mark as taught" applies to students present, never the whole roll.** As first ruled — **Taught = the class's first check** (amends MP-2 part 1): a skill is taught on the practice day any student of the class first checks the activity (any version). Not-same-day still applies; absent students still get it; adding activities ahead cannot pollute the pool. A paper-only lesson never counts until a "mark as taught" control exists (filed with a trigger). Asked of the curriculum side in B-185. |
| ER-11 [D11] | **Discrimination banks get their own derived step** per (class, student, discrimination bank), same intervals and day rule unless the curriculum sets separate keys; this is also MP-10's per-consolidation record. |
| ER-12 [D12] | **`practice_day` is fixed on the session at start**, and every derivation reads it. The sprint's derive-from-`saved_at`-in-the-current-zone has the same latent issue: filed in TODOS. |
| ER-13 [D13] | **Full guard set**, each mutation-tested once: a `verify-00xx.sql` (pool: not-same-day across zones, first-check taught, copy lineage, draft/retired excluded, discrimination needs all skills; day rule; idempotent start; prune unscheduled), handler tests (foreign/closed session and item-not-in-plan → the one 404; no document read before authorization, by spy; served payload carries no answers/mistakes/value table; replay returns the stored verdict), importer test (pathOnly backfill writes no draft), step-rule vectors. |
| ER-14 [D14] | **Indexes + release order**: `practice_item (owner_id, skill_id) where status = 'ratified' and retired_at is null`; attempts on (class_id, student_id, skill-or-bank, practice_day). Order: migration applied + verify → importer backfill run → `bundle:grading-server` + `deploy:check` + hash-verify → push the SPA (OV-7) → the author's switch on a class (MP-14). |

### The ruled flow

```
student taps "Mixed practice"            (class has mixed on; MP-12)
  └─► check-activity  mode:'practice-start'          [verify_jwt]
        └─► rpc start_mixed_session(class)  AS CALLER     (ER-1)
              membership · class live · mixed on
              open session today? → return it               (ER-9)
              pool = ratified items whose skill(s) THIS student
                     first checked BEFORE today             (MP-2, ER-10 as reversed)
              steps = derived per (class,student,skill|bank)
                      from attempts by stored practice_day  (ER-2/5/6/11/12)
              plan N items, interleaved, rows by
                     hash(practice:<session>:<item>)        (MP-4/5/8)
              write session + planned list; snapshot items  (ER-4)
              return ids/rows only
        └─► service role reads the SNAPSHOTS → sanitize → send
student answers item k
  └─► check-activity  mode:'practice'
        └─► rpc mixed_item_for_check(session,k) AS CALLER  (ER-1)
        └─► grade from the snapshot; INSERT attempt first;  (ER-9)
            update score if graded                          (ER-7)
        └─► verdict + mistake feedback + solution           (MP-9)
```

### NOT in scope (this review)
Gradebook export (ER-8, TODO); "mark as taught" for paper-only lessons (TODO);
cross-class / cross-year carry-forward (the sprint's year-end pass);
fluency facts inside mixed (MP-11); diagnostic gaps seeding the queue,
homework, Review/Corrective periods (scope above); per-student teacher detail
and the printable practice record (MP-12).

### Failure modes the rulings cover
Answer-key leak through practice serving (ER-1, ER-13) · re-import mid-session
(ER-4) · 52 published activities sprouting drafts (ER-3) · replayed submits
(ER-9) · term-ahead adds (ER-10) · two blocks a day (ER-6) · timezone change
(ER-12) · scores lost to the prune or flipped by the toggle (ER-7) · the same
discrimination items daily (ER-11) · push before apply (ER-14).

### Outside voice (in-host subagent, 2026-10-19) — dispositions

| OV | Claim | Verified? | Lands in |
|---|---|---|---|
| 1 | Fingerprint only DETECTS a re-import; it cannot grade the old key | yes (`0058` upsert in place) | ME-2 |
| 2 | One-attempt not server-enforced; parallel requests fish the solution | yes (doc silent) | ME-9 |
| 3 | `classifyUpdates` builds `now` from 4 fields only, so `primary_skill` in the payload → `full` forever; in `NOT_CONTENT` → never written | yes (`batch-import.mjs` ~l.371–376) | ME-3 |
| 4 | Pruning attempts resets derived steps | partly: `keep_until` = class end + 30 days (RP-1/RP-3), so only after the class's year — fine IF the grain is per class | ME-5, ME-7 |
| 5 | Teachers add a term of activities on day one → the pool fills with untaught skills | plausible, not measured; reopens MP-2 part 1 | ME-14 |
| 6 | Scope across classes undefined | yes | ME-5 |
| 7 | Discrimination items have no spacing state → same ones every session | yes (MP-10(a) + MP-4) | ME-15 |
| 8 | Timezone change rewrites history | yes | ME-13 |
| 9 | A copy of a copy has no bank | **FALSE**: a copy cannot be listed (`0055` l.114 "A copy from the Activity Bank cannot be listed"; listing read requires `copied_from_activity_id is null`, l.197), so lineage is one level | dismissed |
| 10 | Start must check membership, class not deleted, mixed on | yes | ME-1 |
| nit | `sanitizeBlock` matches 7 in the read bundle, not 3 | accepted; conclusion (0 in grading) stands | fact corrected |

## Letter B-185 — SENT 2026-10-20 (after B-184), with the author's yes

**Sent** to the curriculum session "C-145 curriculum reply to B-185" (their
`main` still `acab88f`), as below. Their answer is C-145.

### As drafted 2026-10-19

Numbering: B-184 (superscript units) is HELD by the author until a curriculum
session runs, and is sent FIRST; this is B-185. No curriculum session was in
ListAgents on 2026-10-19, so this is drafted, not sent. **Send only on the
author's explicit yes**, re-check their `main` sha first (if it moved past
acab88f, re-read the quoted files and amend the letter, never send it stale).

> **B-185 — Platform → Curriculum: D43 mixed practice, design pass opened
> (design only, no build).**
>
> The author opened our mixed-practice design pass early (first classes
> ~Feb 2027; this is a joint contract). The build still waits for the gate: two
> chains with ratified banks. Live today: one (`chain.rate.proportional`, 21
> items). Our record: `docs/design/mixed-practice.md` at platform `86ca2f6c`
> (local; it reaches our public `main` when the author next pushes).
>
> **1. Quote-back.** The design rests on these, read at your `main` acab88f:
> §17 (no same-day practice on today's skill; the pool = skills taught to this
> point; spaced first, confusables together; ~80% success; 60–90 s items;
> discrimination items per consolidation; diagnostic gaps seed the queue;
> period shapes 50 → mixed ~8–10, 60 → ~18–20, 100 → 2 × ~12; homework from the
> same scheduler); D43 (one mixed block; below-criterion students get fluency
> items inside mixed; platform builds the scheduler); your 2026-10-06 sprint
> step model (steps derived from the log, at most one step per practice day,
> calendar intervals, teacher's timezone); §18 Review = the same scheduler with
> a longer session. Anything newer that supersedes these?
>
> **2. What the author ruled (MP-1…MP-15 and the eng review's ER-1…ER-14,
> 2026-10-19), in brief.** A mixed session draws ratified bank items for skills
> taught to the class: a skill counts as taught on the day any student in the
> class first checks an activity whose `skill:` is that skill (ER-10, replacing
> the teacher's add), and is eligible from the next practice day. Scheduling is
> per (class, student, skill), modelled on the sprint: the step is derived from
> first-try results over the whole practice day, never stored. Fresh
> numbers each session (a value-table row per session). One attempt per item,
> then the verdict, the mistake feedback and the solution. A discrimination item
> appears when all its skills are in the student's pool. Fixed item count per
> session. Fluency facts inside mixed: not in v1. Server-graded behind the
> signed-in check function.
> *For your information, not a question:* the author ruled a per-class
> "graded" toggle, **default off**: when a teacher switches it on, a session
> records a score (first tries right out of items answered) the teacher and
> student can see. Your
> grading default ("practice is never graded") stays the default; your ruling
> 10 leaves how a school grades to the school.
>
> **3. Asks — graph keys (D25: what we compute from lives in the graph):**
> (a) step intervals for skills and the step rule (we propose the sprint's:
> all first tries on the skill right that day → up one step, at most once a
> practice day; any wrong first try → step 0); and whether discrimination banks
> share those intervals (we space them the same way unless you set their own); (b) the default item count for
> the 50-minute shape (we read ~8–10 min at 60–90 s as 6–8 items); (c) the mix:
> how many new / due / discrimination per session, and which skills win when
> more are due than fit.
>
> **4. Ask — discrimination credit.** We propose v1 moves NO skill step on a
> discrimination answer and keeps it as a per-(class, student, discrimination
> bank) record, spaced by its own step (ER-11),
> because a wrong answer does not say which skill it "was". Agree, or do you
> want to say which skill each wrong choice stands for (a format change)?
>
> **5. Ask — the pool.** We plan to count a skill as taught on the day any
> student in the class first checks an activity whose primary `skill:` is that
> skill (not when the teacher adds it, since teachers add ahead). Is that what
> §17's "skills taught to this point in the sequence" means, or should the pool
> also include skills earlier in the sequence the class skipped? We will
> persist `skill:` on the activity row for this join (today the importer reads
> it only for the coverage report).
>
> **6. Ask — the gate.** Which chain will be the second ratified bank, and
> roughly when?
>
> **7. Ask — worked solutions.** After each answer we show the verdict, the
> mistake feedback and the solution. In chain 1's ratified bank, 4 of 21 items
> carry a `solution`, 14 carry `feedback` and 10 carry mistake feedback (live
> read 2026-10-19). Does every bank item owe a short worked solution, or is
> showing the correct answer enough after a wrong first try?
>
> **8. Ask — a backlog when a bank lands late.** If a chain is taught before its
> bank is ratified, every taught skill becomes due on the same day. The sprint
> caps this with `sprint_new_facts_per_session`. Do you want a "new skills per
> session" key, and in what order should backlogged skills enter?
>
> **9. Ask — "struggling".** The teacher's class view shows a struggling count
> against §17's 80% target. We propose: first-try success below a threshold
> over a skill's last N attempts, with N and the threshold as graph keys. Agree,
> or define it differently?
>
> **10. Ask — which skills join the pool.** We use only the activity's primary
> `skill:`. Should `supporting_skills:` join the pool too? And should a class
> practise earlier-year skills it was never taught here (e.g. Y7/8 skills for a
> Y9 class), or is that the diagnostic's job (out of our v1)?
>
> **11. Ask — picking items within a skill.** We plan to rotate a skill's 4–6
> templates in order, skipping any the student saw last time. Do you want
> weighting, e.g. towards items tagged with a misconception the student has
> shown, or is that only for the Corrective period (§18)?
>
> **12. Two confirmations.** (a) One item per skill per session, or can a due
> skill appear twice? (b) A discrimination item appears only when ALL its
> `discriminates` skills are in the student's pool (our ruling), not any two?
>
> Nothing is owed by either side from this letter except answers; no pin
> bump (the capability row lands only when serving ships, PB-12).

## C-145 — Curriculum → Platform, received 2026-10-20 (answers to B-185) — ALL ACCEPTED by the author 2026-10-20

Read from `/Users/user/Project folder/curriculum/letters/C-145.md`, sha256
`bf466c2913fa400761ef8f88b51def2007f042d9ebde6a8cf30ac1ed871e0401` (verified on
receipt). Shas at sending: curriculum `main` acab88f, platform `main` 86ca2f6c.
They say every point was ruled by the author on 2026-10-19. The file is
authoritative; quoted short here, per point.

| # | Their answer | Effect here |
|---|---|---|
| 0 | MP-11 accepted for v1, but must be "recorded as a named departure from D43, with a trigger"; suggested trigger "the first class to switch mixed practice on while its sprint is off". | ACCEPTED 2026-10-20: MP-11 row. |
| 1 | Quote-back confirmed; add D47: "Spacing needs initial learning first. Spaced and interleaved practice pay off after a student has reached criterion once (Rawson & Dunlosky, successive relearning)." | Added to the quoted text. |
| 2a | `mixed_step_intervals` = [1, 3, 7, 14, 28] calendar days; top step is maintenance (recurs every 28 days to year end). Day rule as ER-6, but a wrong day drops ONE step (`mixed_wrong_drop` = 1), not to 0. Discrimination banks share intervals and rule. | ACCEPTED 2026-10-20: ER-6 amended. |
| 2b | `mixed_items_per_session` = 6 (50-minute shape); longer shapes raise it via MP-8's per-class setting. | Fills MP-8. |
| 2c | Fill order: (1) skills on their first spaced retrieval (taught the previous practice day) and new skills under the cap, previous day's first; (2) due skills, lowest step first, ties to most overdue; (3) at most one discrimination item (`mixed_max_discrimination` = 1) when eligible and due. Then order so confusable skills sit together, never two in a row from one skill where avoidable. | Fills MP-4. |
| 3 | MP-10(a) agreed; no format change. Make the per-(class, student, discrimination bank) record queryable for §18's Corrective pass. | Confirms ER-11. |
| 4 | **Reverses ER-10:** taught = EACH STUDENT'S OWN first check, eligible the next practice day. One student working ahead must not open a skill for the class. Absent students get no practice on it; the missed activity is shown to student and teacher as catch-up. A future "mark as taught" applies per student present, never the roll. Q2 means skills actually taught; skipped skills do not enter. Primary `skill:` is the right join; ER-3 fine. | ACCEPTED 2026-10-20: ER-10 reversed. |
| 5 | Gate deferred: the author's classes are Y9+, 55-minute periods; the second bank will be a Y9-or-above chain, named later. Chain 1 (Y8) still counts toward the gate, as prerequisite review. 55 minutes ≈ 13–15 mixed minutes ≈ 9–10 items, via MP-8's per-class count; no new key. | Context; gate unchanged. |
| 6 | Toggle noted. Label it "practice score", apart from attainment grades (matters for ER-8's export). **Request: ER-7 scores against items PLANNED**, with "answered n of N" still shown, because right ÷ answered "rewards leaving hard items unanswered". | ACCEPTED 2026-10-20: ER-7 amended. |
| 7 | MP-9 and MP-14 endorsed. | — |
| 8 | Ask 7: every procedural item owes a 2–4-line worked solution with seeded values, fixed items the answer + one line; they retrofit chain 1's 17 before the gate. Ask 8: `mixed_new_skills_per_session` = 2, backlog enters at step 0 in chain order. Ask 9: struggling = fewer than 3 of the last 5 first tries right (`mixed_struggling_window` = 5, `mixed_struggling_min_right` = 3). Ask 10: primary `skill:` only; no earlier-year skills in v1. Ask 11: plain rotation skipping the last-seen template; misconception weighting is for §18 Corrective. Ask 12: one item per skill per session (a short session ends early, as the sprint's); ALL `discriminates` skills required. | Fills MP-12's "struggling", MP-4, MP-8. |

**Owed by them:** a registry PR with the seven keys AFTER our go-ahead letter;
the §17 worked-solution rule + chain 1's 17-item retrofit; the second chain's
bank.

## Letter B-186 — SENT 2026-10-20 with the author's yes (logged on the boundary page)

> **B-186 — Platform → Curriculum: C-145 received and accepted; go-ahead for
> the seven-key registry PR.**
>
> C-145 read from `letters/C-145.md`, sha256 `bf466c29…0401`, verified. The
> author accepted every point on 2026-10-20. On our side:
> - ER-10 reversed: taught = each student's own first check, eligible the next
>   practice day; absent students get no practice on it until they catch up (our
>   progress views already show the missed activity; a dedicated catch-up
>   surface is filed with a trigger). A future "mark as taught" applies per
>   student present.
> - ER-7 amended: a graded session's score is right ÷ planned, shown with
>   "answered n of N", labelled "practice score", kept apart from attainment
>   grades (including in the future export).
> - Step rule: a wrong day drops one step; intervals [1, 3, 7, 14, 28]; 6 items
>   per session; your fill order (first spaced retrieval and new skills under the
>   cap, then due by lowest step, then at most one discrimination item); new
>   skills cap 2, backlog at step 0 in chain order; struggling = fewer than 3 of
>   the last 5 first tries right; primary `skill:` only; plain rotation; one
>   item per skill per session; ALL `discriminates` skills.
> - MP-11 recorded as a named departure from D43, trigger: the first class to
>   switch mixed practice on while its sprint is off.
> - D47's line added to our quote-back.
> - The per-(class, student, discrimination bank) record will be queryable for
>   §18 Corrective.
>
> **Go-ahead:** please open the registry PR with the seven keys as named
> (`mixed_step_intervals`, `mixed_wrong_drop`, `mixed_items_per_session`,
> `mixed_max_discrimination`, `mixed_new_skills_per_session`,
> `mixed_struggling_window`, `mixed_struggling_min_right`) in
> `activity_defaults`. We verify it against C-145 before you merge, as for the
> sprint's keys. Nothing is built here until the gate (a second ratified
> bank, Y9 or above); noted that chain 1 counts toward it as prerequisite
> review. Our record: `docs/design/mixed-practice.md` at platform `83868206`
> (local until the author's next push).

## Letter B-190 — SENT 2026-10-20 with the author's yes (logged on the boundary page); answer awaited as C-146

> **B-190 — Platform → Curriculum: a pedagogy read of mixed practice's
> student-facing words (design only; no build).**
>
> Our design review (DM-1…DM-20, 2026-10-20) fixed what students and teachers
> see. The screens are ours; we would like your read on whether the WORDS fit
> §17, D43 and your grading defaults. Our record: `docs/design/mixed-practice.md`
> → "Design review", at platform `a0e774f8` (public after the author's next
> push).
>
> **What a student sees, in order:**
> 1. *The class link* (unchanged) shows, when both are on: "Number facts · about
>    5 min" then "Practice · about 10 min".
> 2. *Start:* "Practice · 6 questions · about 10 minutes. One try each; you'll
>    see the working after every answer." In a graded class, also: "Your teacher
>    is recording a practice score today."
> 3. *Each question* renders as in an activity; no score, timer or counter.
>    Buttons: Check, then Next; "Skip" and "Stop for now" are always there.
> 4. *After a wrong first try:* "✕ Not this time. The answer is 5 cups." then the
>    matched mistake note, then the worked solution, open. *After a right one:*
>    "✓ Right." with the working behind "See the working". *After a skip:*
>    "Skipped. The answer is 5 cups." A skip counts as a wrong first try.
> 5. *Done:* "You got 4 right." (+ "You skipped 1.") + "See you next lesson." No
>    "out of N". Graded classes add one line: "Practice score: 4 of 6 (you
>    answered 5 of 6)."
> 6. *Nothing to do:* "Nothing to practise yet. It starts the day after you
>    check your first activity." / "Nothing is due today. Come back next lesson."
>    / "You've done today's practice." (+ "Practise again" only when there is
>    work).
>
> **Words students never see:** mixed, session, discrimination, step, due,
> planned, graded.
>
> **The teacher sees** "Mixed practice", "Items per session", "Record a practice
> score" (off), and per skill: "Students practising · Struggling · First tries
> right (last 5)", with names behind "Show students".
>
> **Our questions:**
> 1. Is "Not this time." the right register after a wrong first try for a
>    14-year-old, or do you want different words?
> 2. A right answer hides the working behind "See the working". Does §17's
>    worked-solution rule want it open after right answers too?
> 3. Skip is allowed and counts as a wrong first try. Fine, or should practice
>    require an attempt?
> 4. The ungraded done screen counts only what went right, with no "out of N"
>    (our number-facts precedent). Agree for skill practice?
> 5. Anything in the copy that conflicts with your grading defaults (ruling 10)
>    or the link between practice and quiz results (ruling 11)?
>
> Nothing is owed by either side except answers; nothing is built before the
> gate.

## C-146 — Curriculum → Platform, received 2026-10-20 (answers to B-190) — ACCEPTED by the author 2026-10-20 — B-191 SENT the same day (receipt + acceptance; logged on the boundary page)

Read from `/Users/user/Project folder/curriculum/letters/C-146.md`, sha256
`bd6b3bb65deb765f971505d08284447a235fb34a635fca50bdd0cf876fa36529` (verified).
Shas at sending: curriculum `main` 4f8f08c, platform `main` b5060a09.

| # | Their answer | Effect here |
|---|---|---|
| 1 | Keep "Not this time." (about the answer, not the student). | DM-10 unchanged. |
| 2 | Keep the working collapsed behind "See the working" after a right answer; they make §17's wording explicit in their next principles change. | DM-10 unchanged. |
| 3 | Skip allowed, counts as a wrong first try. Add to the start card: "Have a go even if you're unsure. A wrong try still helps you remember." Add a skips column per skill for the teacher. | DM-12 and DM-3 amended. |
| 4 | Ungraded done screen shows the total: "You got 4 of 6 right." (+ "You skipped 1."). | DM-11 amended. |
| 5 | No conflicts in substance. Minutes from the class's item count, not a fixed "about 10"; "You can see the working" instead of "you'll see"; keep per-skill first-try data for their owed item 6 (the practice record); "Stop for now" fine. The seven never-seen words agreed. | DM-1, DM-12 amended; first tries are stored per attempt (ER-9), so the record's data exists. |

Owed by them: §17's explicit wording for point 2. **DONE** at their `1ff3217` (PR #75, graph v0.17.27): "The solution is shown after the first try: open after a wrong or skipped try, one tap away after a right one (C-146)." Matches DM-10; stamp refreshed (B-192). C-146 closed both sides.

## Build slices — ruled 2026-10-20 (gate lifted)

Each slice is its own session; each is live before the next one calls it
(CLAUDE.md: migration before function, function before SPA push). Every slice
starts with a P10 re-derive against the code and ends with a Fable review
before its live step.

1. **Data + engine.** One migration: `activities.primary_skill`;
   `mixed_sessions`, `mixed_attempts`, `mixed_session_items` (ER-4); the
   class switch + settings (items per session, graded); a mirror of the seven
   `mixed_*` keys; the SQL scheduler (ER-2/5/6/11/12, C-145 fill order,
   wrong-day drop 1, new-skills cap 2); `start_mixed_session` and
   `mixed_item_for_check` as the caller (ER-1, ER-9); the teacher's class
   summary read (incl. skips, DM-3/C-146); the disarmed, unscheduled prune
   (MP-13) + `data-map.md` / `retention-policy.md` in the same commit.
   Importer: `primary_skill` as an identity write (ER-3), the `mixed_*` keys
   mirrored, non-auto-scored blocks refused in bank items (DM-19). A
   `verify-00xx.sql` (ER-13). Live step (author): apply, verify, import
   backfill.
2. **Serving + grading.** `check-activity` modes `practice-start` and
   `practice` (MP-6/7), the sanitizer into the grading bundle, handler security
   tests (ER-13), bundle. Live step: `deploy:check`, hash-verify.
3. **Student screens.** DM-1, 2, 4–7, 10–14, 16, 17, 19 (as amended by C-146).
   Live step: push.
4. **Teacher panel.** DM-3, 8, 9, 15, 18, 20. Live step: push; then the
   capability row + pin bump (MP-15) and `/design-review` on the built screens.

## Hand-off — what the next chat does, in order

Steps 1–5 of the original hand-off are DONE (2026-10-19): curriculum text
quoted at acab88f, P10 re-derived, MP-1…MP-15 ruled, B-185 drafted (HELD),
ER-1…ER-14 ruled. What remains:

1. ~~Send B-184 then B-185~~ SENT 2026-10-20. C-145 RECEIVED and ACCEPTED
   2026-10-20 (section above). B-186 SENT 2026-10-20 (receipt + go-ahead).
   Their registry PR #74 (head `fcdf68d`, graph v0.17.26) VERIFIED and passed
   2026-10-20 (B-187): the seven keys match C-145; check L bounds them (all or
   none; intervals strictly increasing; wrong drop ≤ steps; caps ≤ items per
   session; min right ≤ window). A second commit `4e7ae50` (their D43
   amendment 2026-10-20 + §17 edits; keys and check L byte-identical) checked
   against this record, no corrections (B-188). MERGED at their `4f8f08c`
   (graph v0.17.26, sha256 `47d1a884…ad7c`, re-derived); boundary stamp
   refreshed 2026-10-20 (B-189). The keys are mirrored when serving is built.
   Next letters C-146 / B-190.
2. **Fold their answers** (graph keys, discrimination credit, the taught
   signal) into MP-3/MP-4/MP-8/MP-10/ER-10/ER-11 here.
3. **Watch the gate:** `select chain_id, count(*) from practice_item where
   status = 'ratified' and retired_at is null group by 1` — two chains.
4. **When the gate fires:** P10 again (this doc's "What exists" will be stale),
   then build in ER-14's release order, with the design rulings DM-1…DM-20
   (design review DONE 2026-10-20; tasks T1–T7 in that section). **Build
   nothing before that.**

## Design review — 2026-10-20 (`/plan-design-review`) — DM-1…DM-20 ALL RULED AS RECOMMENDED by the author

Target: this doc's two screens: the student's practice session and the
teacher's class panel. Evidence: static reads of the plan, the sprint's design
rulings (practice-blocks.md DR-1…DR-24, SP-1…SP-14), `SprintPanel.tsx`,
`FactRunner.tsx`, `FactsEntry.tsx`, `ClassProgress.tsx`, and
`viewer/src/container/checkGroups.ts`. No mockups: the designer has no OpenAI
key on this machine (text-only review). Outside voice: a Fable subagent (11
findings, all folded into the rulings below). No DESIGN.md exists; the system
is the existing CSS (DM-15).

### Rulings (author, 2026-10-20; one question each)

| DM | Ruling |
|---|---|
| DM-1 | **One link.** The class link `/facts/:CODE` stays the student's only practice link (SP-1/DR-1). When both the sprint and mixed practice are on, it shows a chooser: "Number facts · about 5 min" then "Practice · about 6–9 min" (⚠ C-146: the minutes come from the class's item count, items × 60–90 s rounded to whole minutes, not a fixed "about 10"); when one is on it goes straight there. A neutral alias `/practice/:CODE` resolves the same, and Home's class link points at it. |
| DM-2 | **Item hierarchy.** (1) the question and its answer box, (2) Check, (3) a thin unlabelled progress bar and a quiet "Stop for now" at the top. After Check: verdict, mistake note, worked solution, Next. No score, timer or counter on screen. |
| DM-3 | **Teacher panel in the sprint's shape**, as a second panel on the class's practice page (heading becomes "Practice"): (1) On/Off + since, or why not, in words; (2) settings: items per session, "Record a practice score" (off); (3) practised today / this week; (4) per-skill table: Students practising · Struggling · First tries right (last 5) · Skips (⚠ added by C-146: a skip and a wrong answer need different teacher responses); (5) names behind "Show students". |
| DM-4 | **Empty states (student).** Nothing taught: "Nothing to practise yet. It starts the day after you check your first activity." Nothing due: "Nothing is due today. Come back next lesson." Done today: "You've done today's practice." (+ DM-7). Off: never shown (the chooser hides it). A link back to the class's activities; never a blank page; never names a missed activity. |
| DM-5 | **A Check that can't reach the server** keeps the item and the typed answer; the button reads "Checking…"; after 10 s a quiet line "Not connected. Keep this page open; we'll keep trying." and "Try again"; signed out → "Sign in again", returning to the same item. A typed answer is never lost. |
| DM-6 | **Resume.** Reopening the same practice day shows "You stopped at question 4 of 6" with "Carry on" / "Finish here"; a checked item returns with its stored verdict, never re-gradable (ER-9). A new practice day starts fresh. |
| DM-7 | **"Practise again"** shows on the done screen and the done-today state only when the server can plan at least one item; else "That's everything for today." It runs a normal session; students are never told about schedules. |
| DM-8 | **Teacher switches off mid-session:** open sessions can finish and count; Off stops new sessions only; the panel says "Students already practising can finish." |
| DM-9 | **Teacher states in words.** No school-year end date → asked for in the panel. No ratified bank for any checked skill → "None of the skills your class has worked on has a practice bank yet." (the switch still works, MP-14). On, no one yet → "No one has practised yet. Students start from the class link." + the link. Loading / failed → the panel's quiet spinner and "Try again". |
| DM-10 | **Feedback.** Wrong: "✕ Not this time. The answer is 5 cups." (icon + words, never colour alone), the mistake note if one matched, the worked solution open. Right: "✓ Right." with the working behind "See the working". A Skip button exists; a skip counts as a wrong first try and reads "Skipped. The answer is 5 cups." The student always presses Next (no auto-advance). |
| DM-11 | ⚠ **AMENDED by C-146 (author yes, 2026-10-20): ungraded shows the total too, "You got 4 of 6 right."** As first ruled — **Done screen.** Ungraded: "You got 4 right." (+ "You skipped 1." when any) + "See you next lesson." — no "out of N" (DR-3). Graded adds one line: "Practice score: 4 of 6 (you answered 5 of 6)." The score appears only here. |
| DM-12 | ⚠ **AMENDED by C-146 (author yes, 2026-10-20): "Practice · 6 questions · about 6–9 minutes. One try each. Have a go even if you're unsure. A wrong try still helps you remember. You can see the working after every answer."** (minutes from the item count). As first ruled — **Start card.** "Practice · 6 questions · about 10 minutes. One try each; you'll see the working after every answer." + "Your teacher is recording a practice score today." when graded + Start. Nothing is painted until Start (DR-10). |
| DM-13 | **Words.** Students: "Practice", "question", "Check", "Next", "Stop for now", "practice score"; never "mixed", "session", "discrimination", "step", "due", "planned", "graded". Teachers: "Mixed practice", "items per session", "Record a practice score", "struggling", "first tries right"; never "step" or "discrimination". A test greps the student routes for the banned words (as DR-5's does). |
| DM-14 | **Visual.** Items render with the viewer's own block components and styles, as in an activity, in the viewer's reading column, with no card chrome. Feedback is one plain inline panel under the answer (icon + verdict in body type, mistake note, working): no coloured left border, no confetti, no motion beyond the viewer's existing reveal. Runner chrome reuses `practice.css`. |
| DM-15 | **Design system.** No new tokens or components beyond the runner shell; the system is `viewer.css`, `practice.css`, `factsTeacher.css`, `progress.css`; the per-skill table reuses ClassProgress's table styles. A DESIGN.md is filed in TODOS with a trigger. |
| DM-16 | **Phones and Chromebooks.** One item per screen at every width; on narrow screens Check/Next is pinned to the bottom above the keyboard and the input scrolls into view on focus; figures and tables keep the viewer's narrow-screen behaviour (tables scroll in their own frame); 44 px targets; "Stop for now" at the top bar's right. At 1366×768 a typical item fits above the fold. |
| DM-17 | **Keyboard and screen reader.** Keyboard-only throughout (Tab to the answer, Enter checks, Enter on Next; math input keeps the viewer's support); the verdict is announced in a polite live region and focus moves to the verdict heading, then Next; the bar carries "Question 3 of 6" for screen readers only (DR-9); "See the working" is a button with `aria-expanded`; teacher table is a real `<table>` with header cells. |
| DM-18 | **Projector safety.** The per-skill table shows counts only; names, and in graded classes each student's scores, are behind "Show students" and absent from the page until opened; nothing ranks students (DR-19/DR-22). |
| DM-19 | **One question at a time** (verified: the viewer's Check covers every section since the previous checkpoint, `checkGroups.ts`): the runner hands the viewer a one-section document per item with a checkpoint, so the existing Check checks exactly one item, wired to `mode: 'practice'`. Bank items hold only PB-9's auto-scored blocks; essay, free drawing and self-rated blocks are refused at import with a named error. |
| DM-20 | **Student rows** behind "Show students": name order only; days practised this week, struggling skills by name (the 3-of-5 rule), and in graded classes the latest practice score as "n of N". No rates, times, ranking or colour-only flags. |

### Screen structure

```
STUDENT  /practice/:CODE  (= /facts/:CODE)
  chooser (both on) ─► Practice ─► start card ─► item 1..N ─► done
                                      │            │  Check → feedback panel → Next
                                      │            └ Stop for now ─► done (partial)
                                      └ resume card (same day) / empty states (DM-4)

  ┌ Practice ▬▬▬▬▬▬░░░░░░░░░░░░                  Stop for now ┐
  │                                                            │
  │  [question, rendered by the viewer's own blocks]           │
  │  [answer box]                                              │
  │                                                 [ Check ]  │
  │  ─ after Check ──────────────────────────────────────────  │
  │  ✕ Not this time. The answer is 5 cups.                    │
  │  It looks like you added 8 instead of scaling.  (mistake)  │
  │  1 muffin: 3 ÷ 12 = 0.25 cups … (working, 2–4 lines)       │
  │                                                 [ Next ]   │
  └────────────────────────────────────────────────────────────┘

TEACHER  class › Practice page
  Daily facts practice   (existing SprintPanel)
  Mixed practice
    On · since 12 Feb            [Turn off]        (or why not, in words)
    Items per session [6]   Record a practice score [off]
    Practised today 18 · this week 24
    Skill | Students practising | Struggling | First tries right (last 5) | Skips
    Show students ▸   (names, days, struggling skills, score if graded)
```

### State table

| Feature | Loading | Empty | Error | Success | Partial |
|---|---|---|---|---|---|
| Entry / chooser | spinner on the class link | DM-4's three messages; off hidden | not a member → "Join the class and start" (DR-1); teacher → "This link is for students" (DR-16) | chooser or start card | resume card (DM-6) |
| Item | item painted after Start/Next only | — | DM-5 (hold, retry, sign in again) | DM-10 feedback panel | Stop for now → done for answered items |
| Done | — | — | save of the finish retried silently; one line after 10 s (DR-14) | DM-11 | partial counts (MP-8); DM-7 |
| Teacher panel | quiet spinner | DM-9 | "Try again" | DM-3 | switch-off with open sessions (DM-8) |

### Storyboard (student, first two wrong)

| Step | Student does | Feels | Specified by |
|---|---|---|---|
| 1 | Taps the class link at the end of the lesson | "how long is this?" | DM-1 chooser times, DM-12 start card |
| 2 | Starts | oriented | DM-12, DM-2 |
| 3 | Gets Q1 wrong | stung | DM-10: answer first, mistake note, working, Next at own pace |
| 4 | Gets Q2 wrong | discouraged | no running score (DM-2), no colour-only red, Skip available |
| 5 | Gets Q3 right | relief | "✓ Right." fast; working one tap away |
| 6 | Bell rings at Q4 | worried it's lost | Stop for now; partial counts; DM-6 resume |
| 7 | Done | "I got 3 of 6 right" | DM-11 as amended by C-146: the total is shown, graded or not |

### Copy table

| Where | Student sees | Never |
|---|---|---|
| Chooser | "Number facts · about 5 min", "Practice · about 6–9 min" (from the item count) | "mixed", "session" |
| Start | "Practice · 6 questions · about 6–9 minutes. One try each. Have a go even if you're unsure. A wrong try still helps you remember. You can see the working after every answer." | "step", "due" |
| Feedback | "✓ Right." / "✕ Not this time. The answer is …" / "Skipped. The answer is …" | "wrong!", colour alone |
| Done | "You got 4 of 6 right." "You skipped 1." "Practice score: 4 of 6 (you answered 5 of 6)." | "planned", "graded" |
| Empty | DM-4's three lines | the name of a missed activity |

### What already exists (reuse)
`/facts/:code` route and `FactsEntry`'s view states; `FactRunner`'s start
card, painted-by-action and silent-save patterns; `practice.css` (runner
chrome, thin bar); `SprintPanel` (switch, why-not words, end-date ask, "Show
students"); `ClassProgress` / `progress.css` (tables); the viewer's block
components, checkpoint sections and Check button.

### NOT in scope (design)
Mockups (no designer key; revisit with `/design-shotgun` once a key exists);
a DESIGN.md (TODO, DM-15); the catch-up surface and "mark as taught" (filed
TODOs); per-student detail beyond DM-20; any Home card beyond the existing
class link.

### Implementation tasks (for the build, after the gate)

- [ ] **T1 (P1, human ~1 d / CC ~1 h)** — entry — `/practice/:CODE` alias, chooser, Home link target (DM-1). Verify: route tests for both-on / one-on / none-on.
- [ ] **T2 (P1, human ~3 d / CC ~3 h)** — runner — start card, one-section-per-item viewer docs, feedback panel, Skip, Stop for now, resume card, done screen, practise again (DM-2, 6, 7, 10, 11, 12, 14, 19). Verify: component tests per state; a rendered-output guard that an item doc has exactly one checkpoint.
- [ ] **T3 (P1, human ~1 d / CC ~1 h)** — runner — offline/sign-out hold-and-retry (DM-5). Verify: e2e stub lane with the connection refused (the offline rows' pattern).
- [ ] **T4 (P1, human ~2 d / CC ~2 h)** — teacher — Mixed practice panel, states, settings, per-skill table, Show students rows (DM-3, 8, 9, 18, 20). Verify: panel tests; names absent from the DOM until opened.
- [ ] **T5 (P1, human ~1 d / CC ~1 h)** — a11y + phones — keyboard path, live region, focus moves, pinned action on narrow screens (DM-16, 17). Verify: keyboard-only e2e; 375 px viewport check.
- [ ] **T6 (P2, human ~2 h / CC ~10 min)** — copy — banned-word test over the student routes (DM-13).
- [ ] **T7 (P2, human ~2 h / CC ~15 min)** — importer — refuse non-auto-scored blocks in bank items with a named error (DM-19).

## Design Review Completion Summary

```
  +====================================================================+
  |         DESIGN PLAN REVIEW — COMPLETION SUMMARY                    |
  +====================================================================+
  | System Audit         | no DESIGN.md; UI scope: 2 screens           |
  | Step 0               | 2/10; focus: all 7, both screens            |
  | Pass 1  (Info Arch)  | 2/10 → 9/10 after fixes                     |
  | Pass 2  (States)     | 1/10 → 9/10 after fixes                     |
  | Pass 3  (Journey)    | 3/10 → 9/10 after fixes                     |
  | Pass 4  (AI Slop)    | 4/10 → 8/10 after fixes                     |
  | Pass 5  (Design Sys) | 5/10 → 8/10 after fixes                     |
  | Pass 6  (Responsive) | 1/10 → 9/10 after fixes                     |
  | Pass 7  (Decisions)  | 2 resolved, 0 deferred                      |
  +--------------------------------------------------------------------+
  | NOT in scope         | written (5 items)                           |
  | What already exists  | written                                     |
  | TODOS.md updates     | 1 item (DESIGN.md, approved in DM-15)       |
  | Approved Mockups     | 0 generated (no designer key)               |
  | Decisions made       | 20 added to plan                            |
  | Decisions deferred   | 0                                           |
  | Overall design score | 1/10 → 8/10                                 |
  +====================================================================+
```

Passes 4 and 5 stop at 8 because the remaining risk is in rendered pixels:
run `/design-review` on the built screens. No unresolved decisions.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | not run (scope set by D43) |
| Outside Review | in-host subagents (Codex CLI not installed) | Independent 2nd opinion | 2 | issues_found (native, not external) | eng: 10 claims (8 ruled, 1 partial, 1 false); design (Fable): 11 findings, all folded into DM-1…DM-20 |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR | 15 issues, 0 critical gaps; ER-1…ER-14 ruled (ER-6, ER-7, ER-10 since amended by C-145) |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR | score: 1/10 → 8/10, 20 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | n/a |

- **OUTSIDE COVERAGE:** Codex unavailable for both phases (CLI not installed); native in-host subagents ran instead (eng: general-purpose; design: Fable). No external coverage.
- **VERDICT:** ENG + DESIGN CLEARED for the design. The build stays GATED on a second ratified chain bank (Y9 or above, to be named by the curriculum side); run `/design-review` on the built screens.

NO UNRESOLVED DECISIONS
