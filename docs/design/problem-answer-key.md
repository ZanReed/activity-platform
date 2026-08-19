# Paper problems, the answer key, and free-response blocks — RULED

> **Status:** RULED — full /plan-eng-review 2026-08-19 (scope gate + 4 sections +
> outside voice, 9 interactive decisions E1–E9). **The original design pass's
> central premise was OVERTURNED at the scope gate**: it proposed reviving the
> legacy `problem` block; the review's grounding found the editor cannot hold
> one ([serialize.ts:1487](../../packages/app/src/lib/serialize.ts) drops it —
> an imported problem would be silently DELETED on first autosave), so paper
> problems ship on the LIVING blocks instead. Trigger: printability is a
> long-term core feature (author ruling), with two paper-first workflows —
> paper + computer-as-checker, and scan-and-AI-grade against the teacher's key.

## 1. The rulings (E1–E9)

- **E1 (scope gate) — extend `short_answer`/`essay`; `problem` stays dead.**
  The living blocks already have the editor, the ```shortanswer/```essay
  fences, the viewer, and 0034's grading queue + rubric — the exact
  infrastructure scan-grading needs and `problem` never had. `problem` gets a
  tombstone comment; full removal is a recorded TODO (P5 claims-grep owed).
- **E2 — two new OPTIONAL fields on BOTH blocks** (E4: essay parity — one
  schema round, not two): `answer: InlineNode[]` (canonical answer / marking
  guide — the teacher key's first choice) and `solution: InlineNode[]`
  (post-check explanation — rides walk.ts's existing GENERIC collection,
  zero grading-engine changes). **Per-block `workSpace` was CUT (E6,
  outside-voice YAGNI challenge upheld):** activity-level `print.workSpace`
  already pads every question-category block
  ([viewer.css:1165](../../packages/viewer/src/styles/viewer.css)); a
  per-block override joins a future schema round only if real divergence
  appears — carrying with it the open "lines, not rem" unit question.
- **E3 — the anti-leak chain is ONE INSEPARABLE UNIT:** registry strip
  entries for `answer`+`solution` on both blocks
  ([registry.ts:97](../../packages/viewer/src/registry/registry.ts) idiom) +
  leakFixture sentinel rows for both fields on both blocks + sanitize unit
  tests asserting absence + parity-gate update. A field without its fixture
  row is unobserved (the sw-lane "passing because of what is absent" lesson).
- **E5 — seven verified outside-voice gaps are requirements** (see §3).
- **E7 — `numbered: 'always'` for both blocks** (was `'never'`,
  registry.ts:432/457 — a pre-paper-first choice). Numbers render on screen
  and paper from the one existing numbering walk; the scan arc gets its
  stable paper→block mapping structurally. Blast radius today: 3 test rows.
- **E8 — the scan-arc minimum contract is a CONVENTION, not schema:**
  `answer:` carries WHAT is correct; a `rubric` carries HOW MANY points (its
  per-criterion `maxPoints`) when a question is worth more than 1; no rubric
  = a 1-point question by default at grading time. Recorded in the format doc
  + AI prompt so all 150 files are authored to it. No points field — the full
  contract is [photo-grading.md](photo-grading.md)'s to design.
- **E9 — solutions reveal AT CHECK** (same semantics as every other
  solution-bearing block; the attempt is recorded before the reveal; authors
  omit `solution:` on revision-sensitive questions; locked mode exists).
- **E10 — editor shows the fields READ-ONLY** (collapsed, teacher-only
  styling in FreeResponseView); editing stays in the .md file via the batch
  importer's re-import-updates flow; a full editing UI is a recorded TODO.

## 2. Answer-key semantics

- Coverage: `ANSWER_KEY_COVERAGE` gains `short_answer` + `essay` rows via
  extractor. **This deliberately REDEFINES the roster contract** — the guard
  at [tests/answerKey.test.ts:270](../../packages/viewer/tests/answerKey.test.ts)
  currently bonds coverage to auto-gradable families; the bond becomes
  **keyed ⊇ auto-gradable** (a keyed block need not be auto-gradable), and the
  guard's text + the conformance factory's authored variants change WITH it,
  in the same commit, as a deliberate contract amendment — never as a
  test-appeasement edit.
- The key prints `answer`; **the fallback to `solution` lives in the
  EXTRACTOR** (components render the sanitized doc, where `solution` no
  longer exists); neither field → the block prints as "manually graded — see
  rubric". `BlockAnswerKey` gains an `InlineNode[]`-typed channel + an
  inline renderer with `ANSWER_KEY_INK` treatment.
- `self_explanation` is EXCLUDED, deliberately (E5/finding 11): ungraded
  reflection has no key entry; recorded here so the family audit note
  (S5-OV6) is satisfied by decision, not omission.

## 3. The seven verified gaps (E5 — all requirements, none optional)

1. **Editor round-trip:** ShortAnswer/Essay Tiptap attrs carry
   `answer`/`solution`; [serialize.ts](../../packages/app/src/lib/serialize.ts)
   maps BOTH directions; round-trip tests pin import → editor → save → load.
   (The exact data-loss class that overturned the original premise, one layer
   deeper — fence tests alone cannot see it.)
2. **Coverage-guard contract amendment** (§2).
3. **Key-print channel:** the `InlineNode[]` field on `BlockAnswerKey`, its
   renderer, extractor-side fallback.
4. **Deploy window:** the OLD deployed get-activity does not strip the new
   fields. Ordering constraint: **no answer-bearing activity is published
   before the redeployed get-activity is verified live** — with a P3-style
   liveness proof (publish a sentinel-bearing activity, read /a/:id, assert
   the fields are absent, then delete it). Queued as a pending author action
   beside the redeploy itself.
5. **`self_explanation` exclusion recorded** (§2).
6. **Fence grammar:** `answer:`/`solution:` accept MULTI-LINE values —
   continuation lines join with hard breaks (a new rule, tested), because a
   worked solution is rarely one line. (The `workspace:` key died with E6.)
7. **Batch-importer dependency:** this slice's fields only pay off through
   the file-keyed batch import/update flow (agreed separately, unbuilt);
   cross-referenced so neither ships without the other being scheduled.

## 4. What already exists (reused, not rebuilt)

- 0034 grading queue + rubric (the scan arc's points model, per E8).
- walk.ts generic solution collection; SectionCheckResult.solutions delivery
  (Problem.tsx documents the pattern ShortAnswer/Essay will follow).
- Registry-declared sanitize strip lists; leakFixture; the parity gate.
- The answer-key print route, id-keyed and version-matched to shuffled
  variants; `ANSWER_KEY_INK`.
- Activity-level `print.workSpace` padding every question block on paper.
- The ```shortanswer/```essay fences + the three-artifact sync guard.

## 5. NOT in scope

- **Reviving `problem`** — overturned at the scope gate; removal is a TODO.
- **Per-block `workSpace` on these blocks** — cut (E6); revisit with the
  lines-based unit question attached, only on demonstrated divergence.
- **The scan-grading arc itself** — [photo-grading.md](photo-grading.md);
  this slice only guarantees the key it will consume is complete.
- **Points/marking-tolerance schema** — E8's convention covers v1; the full
  contract belongs to the scan arc's own design pass.
- **Full answer/solution editing UI in the editor** — read-only display ships
  (E10); editing is a TODO. **Answer-key print layout at 30+ problems** — a
  design question for when real keys exist.

## 6. Failure modes (per new codepath)

| Codepath | Realistic failure | Test? | Handled? | Visible? |
|---|---|---|---|---|
| Sanitize strip | new field forgotten on one block | leak fixture row (E3) | strip list | CI red |
| Key extractor | neither field, no rubric | neither-field test | "manually graded" row | key prints it |
| Serialize round-trip | attrs dropped on save | round-trip test (E5.1) | n/a — must not happen | silent → test-only guard |
| Deploy window | old bundle serves fields | liveness proof (E5.4) | ordering constraint | sentinel check |
| Check reveal | solution absent | existing generic path | box simply absent | expected |
| record_check wire | extended doc rejected | CRITICAL regression pin | schema optional fields | 500 → test-only guard |

## 7. Implementation tasks

> **BUILT 2026-08-20 — T1–T6 shipped, T7 deferred.** Two things this plan did not
> anticipate, both found while building: (a) the EDITOR's numbering bridge
> (`PM_NAME_TO_SCHEMA_TYPE`) did not know these blocks, so E7's `numbered:'always'`
> would have shifted every question number after a short_answer down by one — the
> bridge gained both types and the parity test that file had only *claimed* now
> exists (P11); (b) `ANSWER_KEY_INK` is an SVG stroke colour, so §2's "inline
> renderer with ANSWER_KEY_INK treatment" was wrong on both surfaces — the key
> panel inherits `--vw-color-ink` instead (unreadable in dark mode otherwise, and
> the print token layer already forces every ink to pure black).

- [x] **T1 (P1, human: ~3h / CC: ~25min)** — schema+registry — `answer`/`solution` on ShortAnswerBlock+EssayBlock; strip entries; `numbered:'always'`; tombstone on `problem`. Verify: schema tests + sanitize units + leak fixture red-then-green.
- [x] **T2 (P1, human: ~4h / CC: ~30min)** — editor — Tiptap attrs + serialize both directions + read-only display (E10). Verify: round-trip tests.
- [x] **T3 (P1, human: ~4h / CC: ~30min)** — answer key — coverage rows, extractor w/ fallback, `InlineNode[]` channel + renderer, guard-contract amendment. Verify: answerKey tests + key print e2e row.
- [x] **T4 (P1, human: ~2h / CC: ~15min)** — importer — multi-line `answer:`/`solution:` keys on both fences; registry examples; prompt + format doc (incl. E8's convention). Verify: three-artifact guard.
- [x] **T5 (P1, human: ~1h / CC: ~10min)** — viewer — ShortAnswer/Essay render unlocked solutions. Verify: viewer tests.
- [x] **T6 (P1, human: ~1h / CC: ~10min)** — bundles + deploy — regenerate BOTH server bundles same commit; record_check regression pin; STATE pending-action w/ ordering constraint + liveness proof script. Verify: bundle drift green; verify script rows.
- [ ] **T7 (P2)** — sweep: printExpectations row for numbered free-response, a11y numbering check. **Deferred 2026-08-20 with T1–T6 shipped; recorded in [TODOS.md](../../TODOS.md).**

Sequencing: T1 → {T2, T3, T4, T5 in any order} → T6. Single-module seams
dominate — sequential implementation, no worktree parallelization worth its
coordination cost.

## GSTACK REVIEW REPORT

| Runs | Status | Findings |
|---|---|---|
| Step 0 — scope challenge | complete | scope gate OVERTURNED the premise (editor-dead `problem` → extend living blocks); complexity check fired and resolved |
| Section 1 — Architecture | complete | 1 (anti-leak chain → E3, full chain ruled) |
| Section 2 — Code quality | complete | 1 (essay parity → E4, both blocks) |
| Section 3 — Tests | complete | 14-path coverage diagram; all gaps → plan requirements; CRITICAL record_check regression pin; test-plan artifact written |
| Section 4 — Performance | complete | 0 — no issues found |
| Outside voice (Claude subagent; Codex not installed) | complete | 12 findings: 7 verified no-fork gaps incorporated (E5), 5 decision forks ruled (E6–E10); 3 claims independently verified against quoted lines |

CROSS-MODEL: the outside voice's YAGNI challenge (finding 8) was UPHELD in
part — per-block workSpace cut against the review's original recommendation;
its solution-only cut was REJECTED (the key story requires `answer`). Its
serialize-round-trip finding (1) was the session's most severe catch.

VERDICT: CLEARED FOR BUILD — E1–E10, tasks T1–T7, with the deploy ordering
constraint (E5.4) as the one live-risk gate.

NO UNRESOLVED DECISIONS
