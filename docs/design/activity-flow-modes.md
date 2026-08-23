# Activity flow modes — wiring the checkpoint orphan class

**Status:** ENG-REVIEWED 2026-08-24 (8 findings + outside voice: 20 findings, 4 tensions all ruled, 0 unresolved) — awaiting design review, then build. **Read "What the eng review changed" before the rulings above it; two of the six author rulings were reversed on evidence.** Filed from TODOS → "S9
left FIVE MORE ORPHAN CLASSES", item 5 (the last content-shaped one).

## Why now

Six authored knobs describe how an activity FLOWS for a student and **not one
is read by the viewer or the server** (verified 2026-08-23: `isCheckpoint` has
zero consumers outside fixtures and serialize tests; `submissionMode`,
`revisionMode`, `gradingMode`, `activityType`, `answerFeedback` appear in zero
files under `packages/viewer/src`). The schema describes all six in the present
tense. The editor's config drawer, the importer's ```meta fence, the
`{checkpoint}` heading marker and the format doc all write them.

The author is about to write ~150 activities and wants the system to carry
every expected feature BEFORE that corpus exists, so it is authored against
real behaviour rather than against fiction. **1 of the 3 pilot files already
uses `{checkpoint}`** (`unit-3/unit-rate.md:20`).

The implementations lived in `packages/renderer`'s runtime
(`runtime/checkpoints.ts`, `runtime/blanks.ts`, `runtime/submission.ts`,
recoverable at `11002cf^`) and died at S9 Drop 4. They are the precedent for
SEMANTICS; they are not portable code, because of the one architectural fact
that shapes everything below.

## The fact that shapes the design: grading moved to the server

The renderer scored **client-side** — answer keys were baked into the
published HTML, so "score this blank on blur" was free and "Submit" was a
POST of already-computed results. The viewer is the opposite by design
(DECISIONS → S4): **answers never reach the client**; every verdict is a
`check-activity` round-trip that writes a `section_checks` row (responses +
verdicts + `attempt_number`), and those rows feed the analytics rollup and
the (disarmed) prune.

Consequences, each of which decides a knob below:

- There is **no "submit"** in the viewer. A check is the only act and the
  only record. "Single submit at the end" can only mean "one check, at the
  end, covering everything".
- "Immediate feedback on blur" means **a server round-trip and a durable row
  per blur**, not a local comparison.
- "Resubmit after final submit" has no referent: without a submit there is
  nothing to re-do except check again, which `submissionMode` already
  governs.

## What the eng review changed (2026-08-24) — read this first

The review's own four findings built MORE server machinery (a wire flag, a
migration, an atomic-span question). The outside voice then showed the
central one was porous and the second was unbuildable as ruled, and the
author accepted both. Net: the slice got SMALLER and more honest.

| # | Before | After | Why |
|---|---|---|---|
| T1 | server refuses a check carrying `lock:true` (1A); migration 0040 stores it (2A); wire bump | **server DERIVES the lock from `meta.submissionMode`** — in `locked`, the first check of a section locks it: any later check for that (student, version, section) is refused. No flag, no column, no wire bump. | a flag the student sends is a flag the student can omit |
| T1 → Q6 | `immediate` + `locked`: auto-check, never auto-freeze | **the combination is REFUSED at authoring** (importer warns, editor greys) | the server cannot tell an auto-check from a press, so Q6 was unenforceable |
| T2 | `immediate` = auto-check on completion (R3), built now | **DEFERRED to its own slice.** The field stays; `on_check` is the only live value; the editor greys `immediate`; the format doc says so. | no commit seam exists (11 components write per keystroke); no client-side "answered" predicate for graphs (sanitizer strips the expected count) or orderings (served order never "has a value"); re-fire semantics reintroduce row-per-edit |
| T3 | (unstated) | **there is no unlock; republish unlocks every student** (new version → new rows). Documented as the v1 fact; a teacher unlock primitive is filed against the teacher-grading slice. | a lock with no unlock is a P1-class gap and must be written down |
| T4 | Q5: "the shortfall path refuses the check" | **that path does not exist** (`ViewerContainer.tsx:224-233` fires unconditionally, then reports). In `locked`, a group containing a crashed gradable block **does not fire** and the button says why. `free`/`single` keep fire-then-report. | freezing around an ungraded block loses an answer |
| 4A | auto-check fires on commit, per input kind | superseded with R3 (deferred); it is the design constraint for that slice | — |
| 7A | integration row proves write-then-refuse | **stands**, now proving the derived lock against a real stack | P3 |

Superseded review rulings, kept so nobody re-derives them: **1A, 2A, 4A**.
Standing: **3A** (client composes N RPCs), **5A** (fold over DocumentIndex),
**6A** (schema comment rewritten), **7A**, **8A** (fan-out accepted; panel
figure renamed "section checks").

## The rulings (as reviewed)

### R1 — A checkpoint is where checking happens; everything since the last one is checked there

Today: a Check button on every section, each checking only itself.

Proposed: `isCheckpoint` gates the button. A checkpoint section's Check
covers **every section since the previous checkpoint, inclusive** — the
"check group". **The end of the activity is always a checkpoint**, so
trailing sections are never orphaned and a document with no `{checkpoint}`
at all degrades to exactly one Check at the end.

```
  [Warm up]            ← no button
  [Reading a rate table {checkpoint}]
  [Your turn]          ← a heading INSIDE the checkpoint section, not a new one
                       ← Check here covers Warm up + Reading + Your turn
  [Practice]
  [Exit]               ← end of activity = implicit checkpoint: Check covers both
```

Why this rule and not the renderer's: the renderer let non-checkpoint
sections wait for the final Submit. There is no Submit, so without this rule
a non-checkpoint section's questions would **never be checked** — the
free-text in them never recorded, the blanks never graded — silently. That
is the defect class this repo keeps paying for. "Everything since the last
checkpoint" is also what a teacher means when they type `{checkpoint}`: "stop
here and check".

Mechanics: the client fires one `checkSection` per covered section
(P2A's one-atomic-RPC-per-section stands; a group is N of them, sequenced,
with one combined status line). `section_checks` is unchanged. Whether the
server should instead accept a span is an eng-review question, not a
blocker.

### R2 — `submissionMode` collapses to two real behaviours

| value | meaning in the viewer | status |
|---|---|---|
| `free` (default) | checkpoints per R1; a group may be re-checked any number of times | today's behaviour, now scoped to checkpoints |
| `locked` | checkpoints per R1; **inputs in a group freeze the moment its check fires** | NEW — author wants it, "used sparingly" |
| `single` | no mid-activity checkpoints; the end-of-activity Check is the only one | = R1 with every `isCheckpoint` ignored |

`locked` mechanics: **freeze at PRESS time** (amended from "fire time" by
OV#19). An offline press is queued, not fired; under the old wording the
student could keep editing and the freeze would land minutes later
mid-keystroke when the queue drained, grading whatever was current (2.2A).
Freezing at press means the queued check grades exactly the frozen values,
and the 2.2A "answers changed while queued" notice can never apply to a
locked group. The viewer already has the idiom — a
`<fieldset disabled>` wrapping the worksheet for `readOnly` — so a frozen
group is a per-section disabled fieldset, no per-input threading.

**Freeze only on a check that actually fired (Q5 ruled).** A shortfall — the
existing "N questions couldn't be checked" path — refuses the check and
freezes nothing; a freeze on a partial check would trap the student with no
way to fix what was skipped. After a real freeze the group's Check button is
gone and the status line says "Checked — locked".

**The button says "Check" everywhere (Q4 ruled)** — mid-activity and at the
end. One verb, one meaning; the status line says what was covered. "Finish"
was rejected because it implies a submit that does not exist.

**`locked` IS enforced, by the server, from the document (T1).** The handler
already loads the raw document; in `locked` mode it refuses a check for a
section that already has a row for this (student, version). The refusal is a
new `CheckErrorKind: 'locked'` with its own copy, and receiving it freezes
the group client-side — which is also how a SECOND DEVICE (or a cleared
buffer) learns about a lock it never saw (OV#8): the student presses Check,
gets "already checked and locked", and the inputs freeze. The refusal lives
INSIDE `record_check`, after the idempotent-replay lookup and in the same
transaction (OV#9): a lost-response retry of the locking check must replay,
not 409.

**There is no unlock (T3).** Not for the student, not for the teacher. A
republish mints a new version and every student starts clean on it — that is
the only unlock in v1, it unlocks everyone, and the copy on a locked group
says "can't be undone". A teacher unlock is filed in TODOS against the
teacher-grading slice.

**Solutions are revealed per GROUP, not per section (OV#14).** Each section's
result carries its own `solutions`; under 3A a half-landed group would show
section 1's worked solutions while section 2 is still editable. The container
gates the reveal on the whole group having landed.

**`single` is redundant under R1 and kept for authoring convenience (OV#12).**
With "everything since the last checkpoint" and "the end is always a
checkpoint", `single` ≡ `free` with every `{checkpoint}` ignored, and the
former "one shot, final is final" cell is spelled `locked` with no markers.
The format doc says exactly that.

### R3 — `answerFeedback: 'immediate'` is DEFERRED to its own slice (T2 reversed Q1)

Q1 ruled "auto-check when the group is complete". The outside voice showed
that cannot be built inside this slice:

- **No commit seam.** All eleven input components write to the store per
  keystroke (`setBlank`, `setFreeText`, … `store.ts:120-127`); there is no
  blur/commit concept to hang "the completing item committed" on. Building it
  is a cross-cutting edit of every block.
- **No client-side "answered".** Only the server scorers know what answered
  means, and they disagree by kind (`grading/graphs.ts:286`: "placed them
  *all*" — the client cannot know "all" because the sanitizer strips the
  expected count). An ordering left in served order never "has a value".
- **Re-fire.** After one auto-check, does the next edit re-fire? Once = no
  feedback on corrections; every commit = the row-per-edit cost R3 existed to
  avoid. Needs a bounded re-arm rule nobody has designed.

**Ruled (T2): the field stays; `on_check` is the ONLY live value.** The editor
greys `immediate`; the format doc marks it "reserved — not yet active"; the
importer accepts it with a warning. Filed in TODOS with the three design
constraints above plus two the review already settled for it: fire on COMMIT,
never on input (4A); and **`immediate` + `locked` is refused at authoring**
(T1) because the server cannot distinguish an auto-check from a press.

The schema comment's claim that "the runtime defaults a missing
answerFeedback to 'immediate'" (`document.ts:82-86`) is ruled DEAD with the
runtime (OV#20); the viewer treats missing as `on_check`.

### R4 — `revisionMode` and `gradingMode` are DELETED in this slice (Q2 ruled)

- `revisionMode` has no referent (no submit; re-checking is already
  `submissionMode`'s job). Deferring keeps a knob whose description can never
  become true.
- `gradingMode` is **derived, not authored**: the server already records
  free-text as "Recorded — your teacher will review" and grades everything
  else, purely from block types. `'manual'` on an all-MC activity would be a
  lie; `'auto'` on an essay would be ignored. The teacher-grading slice will
  need per-BLOCK grading metadata (its own design says so); an activity-level
  enum is the wrong grain and would have to be deleted then anyway.

Deleting is a schema change → both server bundles regenerate in the same
commit, a `get-activity` redeploy is owed (pending author action), and the
importer's ```meta fence, the format doc, the AI prompt, and the config
drawer each lose two keys (`revision:`, and there was never a `grading:` key
— confirm with the importFormatRegistry guard). Old drafts that still carry
the fields parse fine: zod `.object()` strips unknown keys, so they vanish on
next save. `SANITIZER_REV` does not move (it hashes block sanitize specs, not
meta) — verify rather than assume.

### R5 — `activityType` becomes a LABEL, printed and on screen (Q3 ruled)

The schema says it "drives presentation: an exit_ticket renders as a
single-page focused layout; a worksheet renders with full section
navigation". The viewer has ONE layout and NO section navigation, so there is
nothing for it to drive. It is not the catalog facet either — that is
`pedagogical_role` (0037), and `pedagogicalRole.ts:9` explicitly says they
are different things.

The author's question — "is this just covered by the modes?" — was the right
one. Flow is covered by R1/R2. **Ruled: `activityType` is rendered as a label**
— "Exit ticket" / "Warm-up" / "Review" beside the title where `course`/`unit`
already render, on screen and on paper (`worksheet`, the default, renders
nothing: it is the unmarked case). The schema comment's "drives presentation
… section navigation" sentence is rewritten to say what it now does. Anything
more is a layout design pass that nothing is asking for.

## What stays untouched

- `section_checks`, `check-activity`, the grading walk, the sanitizer:
  **no schema or server change** for R1/R2. R4 is the only schema change and
  it is a deletion.
- The importer's `{checkpoint}` grammar and the ```meta keys for `submission`
  and `feedback` — they already write the right fields.
- Print: checkpoints are a screen concept; the worksheet prints the same.

## Guards (the part that outlives the slice)

Every one bound to RENDERED OUTPUT or to a real RPC, never to a declaration:

1. **Check buttons exist only where R1 says** — component test over a
   fixture document with `[plain, checkpoint, plain, plain]` sections asserts
   exactly two buttons (the checkpoint, the end), and that the checkpoint's
   click fires `checkSection` for sections 1 AND 2.
2. **`single` hides every mid button** — same fixture, `submissionMode:
   'single'`, one button.
3. **`locked` freezes** — after a fired check, every input in the group is
   inside a disabled fieldset and the button is gone; after a refused check
   (shortfall), nothing is frozen. Mutation-test: remove the freeze, watch it
   go red.
4. **`free` does not freeze** — the regression pin for today's behaviour.
5. **No section is ever un-checkable — bound to RENDERED OUTPUT, not the
   fold** (OV#16: a property test over a fold that assigns by construction
   proves nothing). The guard renders the fixture document and asserts that
   the set of Check buttons in the DOM, × the section ids each one fires for,
   covers `doc.sections` exactly. Mutation: drop the implicit end checkpoint
   and watch the trailing sections go uncovered.
6. **a11y** — a frozen group announces its state once; the a11y lane's
   post-check scan already runs, extend it to a locked document.
7. **Flow-field reachability** (P1 family) — scoped to the FLOW fields
   (`isCheckpoint`, `submissionMode`, `answerFeedback`, `activityType`), each
   asserted to have a reader under `viewer/src`. NOT every `meta` field
   (OV#17): `skills` is legitimately editor/catalog-only and would go red on
   day one; a skip list is forbidden by the data-map precedent, so the scope
   is named instead.
8. **Server lock, live** (7A) — an integration-lane row: check a section in a
   `locked` document, check it again, assert the 409 and that NO second row
   was written; then assert a lost-response replay of the first check (same
   idempotency key) does NOT 409.
9. **Partial group** — one member RPC fails; assert the status names the
   pending section, solutions are NOT revealed, Retry fires only that section.
10. **Locked + crashed block** — the button is disabled with the explanation;
    no RPC fires; nothing freezes (T4).

## Rulings record (author, 2026-08-23)

| Q | Ruling | Folded into |
|---|---|---|
| Q1 | `immediate` = auto-check when the group is complete | R3 |
| Q2 | delete `revisionMode` + `gradingMode` now | R4 |
| Q3 | `activityType` is a printed + on-screen label | R5 |
| Q4 | the button reads "Check" everywhere | R2 |
| Q5 | `locked` never freezes on a refused check | R2 |
| Q6 | `immediate` + `locked`: auto-check, never auto-freeze | R3 |

**Eng review 2026-08-24** (8 findings; outside voice 20): T1 reversed Q6 and
1A/2A; T2 reversed Q1 (R3 deferred); T3 named the unlock gap; T4 amended Q5.
3A, 5A, 6A, 7A, 8A stand. Every OV finding is either folded into a ruling
above or into the task list below (OV#13 editor warning, OV#14 solutions
gating, OV#15 rate ceiling, OV#18 deletion blast radius, OV#19 freeze at
press, OV#20 dead fallback).

Earlier, in conversation: checkpoint semantics are not precious (the three
pilot files exist only to test features); `locked` is wanted "sparingly";
everything the system will support must exist before the ~150-file corpus
is authored, so it is written against real behaviour.

## Implementation Tasks

Sequenced. T1–T3 are pure and testable before anything renders; T7 must be
applied live before T6 deploys.

- [ ] **F1 (P1, human: ~2h / CC: ~10 min)** — viewer/container — `checkGroups(index, submissionMode)`: a pure fold over `DocumentIndex.sections` (5A). End of document is always a checkpoint; `single` ignores every flag.
  - Files: `packages/viewer/src/container/blockIndex.ts` (or a sibling in `container/`)
  - Verify: `pnpm --filter @activity/viewer exec vitest run tests/blockIndex.test.ts`
- [ ] **F2 (P1, human: ~1 day / CC: ~30 min)** — viewer/store — `checkGroup`: fires member sections in parallel, aggregates phase (`checking` / `checked` / `partial`), Retry re-fires only unlanded members (3A). Freeze at PRESS in `locked` (OV#19). Group-scoped solution reveal (OV#14).
  - Files: `packages/viewer/src/store/store.ts`, `queue.ts`, `persistence.ts`
  - Verify: `tests/store.test.ts` — partial failure, retry, offline queue, regression pin for `free` re-check
- [ ] **F3 (P1, human: ~1 day / CC: ~30 min)** — viewer/container — render Check per GROUP; locked freeze via a per-group `<fieldset disabled>`; the `locked` refusal freezes on arrival; locked+crashed disables the button with copy (T4)
  - Files: `packages/viewer/src/container/ViewerContainer.tsx`, `styles/viewer.css`
  - Verify: component tests + `pnpm --filter @activity/app exec playwright test --project=student`
- [ ] **F4 (P1, human: ~half day / CC: ~20 min)** — viewer/server — derive the lock from `meta.submissionMode`; refuse a second check inside `record_check`, after the replay lookup, same transaction (T1, OV#9). New `CheckErrorKind: 'locked'`.
  - Files: `packages/viewer/src/server/check-activity-handler.ts`, `wire.ts`, `httpCheckService.ts`
  - Verify: `tests/check-activity-handler.test.ts`; **no** `CHECK_WIRE_VERSION` bump (OV#11 — nothing new is sent)
- [ ] **F5 (P1, human: ~half day / CC: ~20 min)** — supabase — migration **0040**: `record_check` grows the refusal. ⚠ `CREATE OR REPLACE` with a changed signature creates a SECOND overload with default PUBLIC EXECUTE — drop the old signature, re-`revoke`/`grant` (0020:336-339), and re-run verify-0020's grant assertion (OV#10).
  - Files: `supabase/migrations/0040_*.sql`, `scripts/verify-0040.sql`
  - Verify: `pnpm --filter @activity/app test:e2e:integration` (7A) — write, refuse, replay-does-not-refuse
- [ ] **F6 (P1, human: ~half day / CC: ~20 min)** — schema — delete `revisionMode` + `gradingMode`; rewrite the flow-mode comment block to this contract (6A); kill the `immediate` default-fallback claim (OV#20)
  - Files: `packages/schema/src/document.ts`
  - **Blast radius beyond the obvious four (OV#18):** `scripts/batch-import.mjs:321` (untyped merge — typecheck will NOT catch it), `scripts/seed-e2e-locked.sql`, `seed-test-data.sql`, `applyImportedMeta.ts`, `importMetaSummary.ts`, `factories.ts`, `SectionBreak.ts:10-11`, `docs/design/manual-grading.md`, `capability-inventory.md`
  - Verify: `pnpm bundle:viewer-server && pnpm bundle:grading-server` committed same commit; assert `SANITIZER_REV` unmoved
- [ ] **F7 (P1, human: ~2h / CC: ~10 min)** — authoring — importer: drop `revision:`/`grading:`; warn on `feedback: immediate` (reserved) and REFUSE `immediate` + `locked` (T1). Editor: remove the two controls, grey `immediate`, and **fix the now-false locked warning** at `ActivityEditor.tsx:838-844` (OV#13 — R1 makes every section checkable, and the leading implicit section can never be a checkpoint, so it would fire on most documents).
  - Files: `packages/app/src/lib/markdownToTiptap.ts`, `components/ActivityConfigDrawer.tsx`, `routes/ActivityEditor.tsx`, `lib/importFormatRegistry.ts`
  - Verify: `pnpm --filter @activity/app test` incl. the importFormatRegistry lockstep guard
- [ ] **F8 (P2, human: ~2h / CC: ~10 min)** — viewer — `activityType` as a label beside the title, screen + print; `worksheet` renders nothing (R5)
  - Files: `ViewerContainer.tsx`, `styles/viewer.css`, `registry/printExpectations.ts`
  - Verify: a print row + `playwright test print-rules`
- [ ] **F9 (P1, human: ~1 day / CC: ~40 min)** — tests — guards 1–10, each mutation-proven; the rendered-output coverage guard (5) is the load-bearing one
- [ ] **F10 (P2, human: ~2h / CC: ~10 min)** — docs — format doc (`single` ≡ `free`+no markers; `locked`+no markers = one-shot; `immediate` reserved), analytics panel figure → "section checks" (8A), data-map if 0040 touches columns, DECISIONS entry, TODOS: file `immediate` + the teacher unlock (T3)
- [ ] **F11 (P1, AUTHOR)** — apply **0040 live**, THEN `pnpm deploy:check`. Ordering is the standing rule; the SPA push follows (OV#10's sequence — no wire bump means no forced reload)

## Failure modes

| Path | Failure | Test | Handling | Student sees |
|---|---|---|---|---|
| group check | one member RPC fails | F2 | partial phase; Retry | "2 of 3 checked" + Retry; no solutions revealed |
| locked | second check attempt | F4/F5 | 409 `locked` | "Already checked — this section is locked" + freeze |
| locked | lost-response retry | F5 | replay, no 409 | verdicts, as if first time |
| locked | second device | F4 | 409 on first press | freeze + explanation (the only discovery path) |
| locked | crashed gradable block | F3 | button disabled | "One question can't be checked yet" |
| locked | offline press | F2 | freeze at press, queue fires | frozen immediately; verdicts on reconnect |
| fan-out | 60-row/60s ceiling (OV#15) | F2 | existing 429 path | ⚠ a 429 mid-group is a partial lock — F2 must surface it as partial, not as failure |
| R4 | old doc carries dead fields | F6 | zod strips | nothing |

No critical gaps: every path has a test and a handler; none is silent.

## NOT in scope

- Section NAVIGATION (a per-section sidebar/stepper) — `activityType`'s
  original promise; nothing asks for it.
- Per-blank server checks — R3's reason.
- Teacher grading, released feedback, attempts UI — the parked slice.
- Print changes — none; checkpoints are screen-only by construction.

## What already exists (reused, not rebuilt)

- **`DocumentIndex`** (`blockIndex.ts:187`) — ordered sections with their
  checkable item ids. F1 folds it; no new walk (5A).
- **Per-section idempotency + the offline queue** (`store.ts:275-300`,
  `queue.ts`) — makes 3A's retry safe without a transaction boundary.
- **`<fieldset disabled>`** (`ViewerContainer.tsx:349-355`) — the freeze
  mechanism already exists for `readOnly`; F3 applies it per group.
- **`record_check`'s replay lookup** (0020:239-253) — F4's refusal sits
  behind it, so a retry replays rather than 409s.
- **The `{checkpoint}` grammar and the ```meta keys** — already write the
  right fields; only `revision:`/`grading:` are removed.

## Worktree parallelization

| Step | Modules | Depends on |
|---|---|---|
| F1 | `viewer/src/container/` | — |
| F2 | `viewer/src/store/` | F1 |
| F3 | `viewer/src/container/`, `styles/` | F2 |
| F4 | `viewer/src/server/` | — |
| F5 | `supabase/` | F4 |
| F6 | `packages/schema/` | — |
| F7 | `packages/app/src/` | F6 |
| F8 | `viewer/src/container/`, `registry/` | F6 |

**Lane A:** F1 → F2 → F3 (sequential; shared viewer render path)
**Lane B:** F4 → F5 (independent — server + supabase)
**Lane C:** F6 → F7 (independent — schema + app authoring)

**Execution:** launch A, B, C in parallel; converge on F9 (tests), then F10.
**Conflict flag:** F3 and F8 both touch `ViewerContainer.tsx` and
`viewer.css` — same lane or sequence them, do not run in parallel worktrees.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR (PLAN) | 8 review findings + 20 outside-voice; 0 critical gaps; 4 cross-model tensions, all ruled |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | pending (requested) |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **CROSS-MODEL:** the outside voice overturned the review's own central finding (1A "server enforces a client-sent lock flag" → T1 "derive the lock from the document"), which deleted a wire bump, migration 0040's column and a persistence-schema problem; and showed R3 (`immediate`) had no commit seam to build on, deferring it to its own slice. Two of the six original author rulings (Q1, Q6) were reversed on that evidence. The slice got smaller.
- **VERDICT:** ENG CLEARED — ready for the design review, then implement.

NO UNRESOLVED DECISIONS
