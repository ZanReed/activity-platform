# Mixed practice — the session, the pool, the scheduler (D43, design pass)

**Status:** DESIGN PASS OPENED 2026-10-19 — **nothing ruled yet.** The author
ruled to start the pass early, **design only**: the build still waits for its
gate (two chains with RATIFIED banks; premise 8). Live on 2026-10-19: ONE chain
ratified (`chain.rate.proportional`, 21 items). Reason for starting early: first
classes are ~early February 2027 and this is a joint contract with the
curriculum side, the case CLAUDE.md's intake rule names ("a wish with a
long-lead joint contract gets its DESIGN pass early and nothing else").

Parents: [practice-blocks.md](practice-blocks.md) (premises 1–8; "Mixed
practice, the diagnostic's skill half, period assembly" — deferred to this pass)
and [practice-banks.md](practice-banks.md) (PB-1…PB-12, BE-1…BE-12; the bank
store this pass serves from).

## What exists (re-derived 2026-10-19 — re-derive again before ruling, P10)

- **Bank store (0058):** `practice_item`, one row per template: owner, item id
  `<skill>#<heading>` (PB-3, never reused), `role skill | discrimination`,
  `skill_id` (skill banks) or `discriminates` (≥ 2 skills, discrimination
  banks), `chain_id`, `status draft | ratified`, converted content, seed spec,
  fingerprint, `retired_at`. Teacher preview only (PB-11). **No student
  serving exists.**
- **Seeding:** `serveSeed(versionId, studentId)` gives a student the same
  numbers every time. Practice needs a per-SESSION seed (premise 6); PB-5 left
  it to this pass. Derived variables and `where:` constraints exist (PB-6,
  BE-1's seed-expr walk). Seeded MISTAKE matchers are evaluated per student at
  grade time (`server/grading/seededKeys.ts`).
- **Fluency machinery (0045–0051, 0065):** `class_probes`, `practice_sessions`
  + `fact_attempts` (probe), `sprint_sessions` + `sprint_attempts` (daily
  sprint), Leitner-style state judged from attempts, practice day by the
  teacher's `users.timezone`, `keep_until` + a disarmed prune (0048). Browser-
  graded facts (premise 3 exception); **mixed items stay server-graded.**
- **Taught-so-far:** `class_activities (class_id, activity_id, added_at)`;
  activity-grain `skill:` meta is live via the importer.
- **Grading:** `check-activity` (verify_jwt true) grades activity VERSIONS only;
  its security ordering (authorize as caller → read raw content → grade →
  record) is the pattern any practice check must keep. Region-pinned to
  `us-east-2` (audit #14).
- **Curriculum side:** their D43 text and §17 ("fluency 5 · hook 2–3 · activity
  · mixed ~15"; spacing; confusable skills together; diagnostic gaps seed the
  queue) live in THEIR repo. **Quote them from their `main` before ruling;
  this doc paraphrases.**

## Scope of this pass

IN: the mixed session (what a student does), the pool (which items are
eligible), the per-student record and scheduler, per-session seeding, serving
and grading, the teacher's on/off and first view, retention.
OUT (each its own pass or later): the diagnostic's skill half (needs the Y7
entry bank, answer 8), period assembly (last in the ruled order), fluency facts
interleaved inside mixed (see MP-11), any Home card.

## Decisions (numbered; each with a recommendation — NOT RULED)

**MP-1 — Session record.** (a) new `mixed_sessions` + `mixed_attempts`, shaped
like the sprint's (checkpoints, practice day, `keep_until`); (b) generalise
`sprint_sessions` with a `kind` column.
**Recommend (a).** Sprint rows carry fact-only columns (typing baselines,
modality); premise 4 already says a session is not an activity. Same prune
discipline, separate tables.

**MP-2 — The pool ("taught so far").** An item is eligible for a student when
it is `ratified`, not retired, and its skill (a discrimination item: ALL its
`discriminates` skills) is the `skill:` of an activity added to one of the
student's live classes on or before the practice day.
**Recommend this (teacher's add = taught),** not "the student checked it": an
absent student still needs the practice, and the add is the teacher's own
signal. Confirm with the curriculum side that `skill:` at activity grain is
the right join (item-grain skills are still `[]`, alignment gap 1).

**MP-3 — Scheduler grain.** (a) state per (student, SKILL): Leitner box +
`due_on`; items rotate within a skill, fresh numbers each session; (b) per
(student, item).
**Recommend (a).** Spacing is about skills; with per-session seeds an item is
not "the same question" twice. Box intervals as curriculum graph keys (as the
sprint's thresholds are). Leitner, not FSRS (the sprint's ruling, same reason).

**MP-4 — Interleaving and confusables.** A session draws due skills
interleaved (never two in a row from one skill where avoidable), and includes a
discrimination item whenever ≥ 2 of its `discriminates` skills are in the
student's pool.
**Recommend this;** the exact mix (how many new vs due vs discrimination) is a
curriculum key, asked in the letter.

**MP-5 — Per-session seed.** `seed = hash(itemId, studentId, sessionId)`,
stored on the attempt so a teacher or a re-grade sees the same numbers.
**Recommend this.** Keeps `serveSeed`'s determinism within a session and
varies across sessions.

**MP-6 — Grading path.** (a) a `practice` mode on `check-activity`, with its own
caller-scoped authorization RPC (student is in a class whose pool holds the
item, session open) and the same ordering; (b) a new `check-practice`
function.
**Recommend (a).** One warm isolate for the 2.95 MB grading bundle instead of
two cold ones; the ordering rule carries over unchanged. Needs a grading-bundle
change and a `deploy:check` (author).

**MP-7 — Serving.** The student needs items sanitized (no answer keys) with
the session's numbers substituted. (a) served by `check-activity` (verify_jwt
true) as part of "start/next"; (b) a `get-activity` branch.
**Recommend (a).** `get-activity` is `--no-verify-jwt` for its anonymous meta
branch; practice is signed-in only, so it belongs behind the platform gate.
Needs the sanitizer in the grading bundle (size check against its cap).

**MP-8 — Session shape.** (a) a fixed item count (default from a graph key,
e.g. ~10 for "mixed ~15"); (b) a timer.
**Recommend (a),** with partial work counting (the sprint's G1 ruling). Ask the
curriculum side for the default.

**MP-9 — Feedback per item.** One attempt, then the verdict, the authored
mistake feedback and the solution; the attempt's first-try result is what moves
the box.
**Recommend this** (practice, not assessment); a retry would blur what the
scheduler reads.

**MP-10 — How a discrimination answer credits skills.** (a) it moves no skill
box; it updates a separate per-(student, chain) discrimination record;
(b) correct credits every named skill, wrong debits the one chosen.
**Recommend (a) for v1** and ask the curriculum side; (b) needs to know which
skill a wrong answer "was", which the item format does not say.

**MP-11 — Fluency inside mixed (premise 2).** (a) not in v1: the sprint
already holds the fluency minutes; the session record carries an item `kind`
so facts can join later; (b) interleave below-criterion facts now.
**Recommend (a).**

**MP-12 — Teacher surface.** A per-class on/off beside the sprint's, and a
first view: per-skill class summary (due / struggling counts), built on the
class-progress patterns (0061).
**Recommend this;** per-student detail later, on a trigger.

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

## Asks for the curriculum side (one letter, after the rulings)

1. Quote-back of their D43 / §17 mixed-practice text this design rests on.
2. Box intervals, session size, and the new / due / discrimination mix as
   graph keys (MP-3, MP-4, MP-8).
3. Discrimination credit (MP-10).
4. Pool join: activity-grain `skill:` as "taught" (MP-2).
5. Which chain is their second ratified bank, and when (the gate).

## Hand-off — what the next chat does, in order

1. Read this doc, its two parents, and the curriculum side's D43 / §17 text on
   their `main` (github.com/ZanReed/curriculum; re-derive by commit sha, never
   from a letter). Correct any paraphrase above against the quotes.
2. P10: re-derive "What exists" against the code (0050/0058 shapes, the
   check-activity ordering, grading-bundle size vs its cap).
3. Walk MP-1…MP-15 with the author as yes/no; record rulings here.
4. Send the letter (liaison channel per memory; letters run B-184 HELD → this
   is B-185 or later — check the numbering first).
5. `/plan-eng-review` of the ruled design; record its rulings here.
6. **Build nothing.** The build starts when a second chain's bank is ratified
   (live check: `select chain_id, count(*) from practice_item where status =
   'ratified' and retired_at is null group by 1`).
