# Handoff — 2026-09-01 (second of the day)

Paste the block below `PASTE FROM HERE` into a new chat. Everything above it is
context for a human deciding whether the handoff is accurate.

---

## What happened in the session that wrote this

The author greenlit both design passes with one instruction: build #3 first,
outside voice first as a safety check. Both wishlist slices then ran the full
cycle — outside-voice review (11 findings on #3, 8 on #4, every load-bearing
one re-verified against code before ruling) → design amendments committed →
build → mutation pass → bundles → verify. Twenty mutations between the two
slices; every new guard went red exactly once. Two review findings changed
real architecture: #3's stored outcome class was DROPPED (redundant with the
misconceptionIds channel), and #4's wire plan had targeted the DEAD pre-S9
ingest wire — rebuilt against `SectionResponses` + `CHECK_WIRE_VERSION` 2→3.

## What the next session should know before trusting anything here

- **`HANDOFF.md` is REPLACED, not appended** — a transient baton, not in
  CLAUDE.md's doc map.
- **`origin/main` was at `b1092b8` when this was written; everything after it
  is UNPUSHED.** Verify with `git ls-remote` — the push state has been wrong
  four sessions running when inherited.
- **THE REDEPLOY ORDER IS BINDING NOW** (STATE → Pending): the wire bump
  means a push BEFORE `pnpm deploy:check` breaks every student's checks with
  a version mismatch until the deploy lands. Deploy both functions, then push.
- **CI:** run `33401398052` (the last pushed commit) completed green on all
  four jobs — tool-read, not inherited. Nothing after it has run in CI.

---

# PASTE FROM HERE

I'm picking up the activity-platform repo cold. Read CLAUDE.md, then STATE.md,
then TODOS.md.

## Where things stand (2026-09-01, `main`, UNPUSHED past `b1092b8`)

**The author's capability wishlist is FOUR-FOR-FOUR SHIPPED.** #1
(misconception ids, 2026-08-25), #2 (cubic/quartic graded families,
2026-08-31), and today #3 (unit-bearing numeric blanks) and #4 (the
`correspondence` block, N-way match). Each of #2–#4 has its design doc with
outside-voice amendments and an AS BUILT section:
`docs/design/graded-function-families.md`, `unit-bearing-blanks.md` (A1–A9),
`nway-correspondence.md` (R1–R8).

**`pnpm verify` is 8/8 green** at the head commit. The browser lanes run in
CI on push, as usual — nothing unpushed has met CI yet.

**Owed to the author, ORDER BINDING** (full rationale in STATE → Pending):
`pnpm deploy:get-activity` + `pnpm deploy:check` (never `--no-verify-jwt`),
**then** push. `CHECK_WIRE_VERSION` moved 2→3, so a push first refuses every
student check until `check-activity` deploys; the old sanitizer would also
serve a unit-bearing blank with its unit visible. Verify deploys by bundle
sha256. `SANITIZER_REV` is now `2-3d4db5c5`.

## The ranked remainder, if you are here to do work rather than author

1. **#5 (`draggable_curve`)** — the drag-then-type disagreement diagnostic,
   ~11 transformation-band activities. Its mistake-signal dependency (#1's
   machinery) is met. Needs its own design pass first; run the outside voice
   on it — the pattern has paid three builds running.
2. **#6 (`seeded_data`)** — its own arc, ranked last deliberately.
3. The contention-red TODOS entry is reproduction-annotated (trigger is
   swap-level thrash; candidates named). Do not ship a mitigation without
   catching a live red.

## The authoring lever is now fully unblocked

~150 markdown files planned in `~/activity-catalogue-pilot/`, 4 written — and
no wishlist item caps anything any more. New since yesterday, all in
`docs/markdown-import-format.md`: `y = x^3 - 3x` graph answers,
`{{=1.5 unit: km/h, kph}}` blanks with reserved `!unit-missing` /
`!unit-wrong` mistake bindings, and the ` ```correspond ` fence (columns
line + `|`-separated rows; `$|x-3|$` is safe in a cell).

## Traps that cost real time recently

- **A guard can be true for a reason other than the one it was written for.**
  Watch every new guard fail once, the day you write it — the mutation passes
  in these two slices caught nothing BECAUSE everything was mutation-tested;
  the discipline is the point.
- **A design can cite dead machinery as its precedent** — #4's wire plan
  targeted the pre-S9 ingest wire that nothing writes. Re-derive against
  shipped reality (P10); the outside voice caught it before a line was built.
- **The doc-embeds-the-prompt chain**: touching `markdownImportPrompt.ts`
  means mirroring `docs/markdown-import-format.md`'s fenced copy byte-for-byte
  AND `pnpm prompt:catalogue` (its test fails on drift). Hit twice today.
- **Verify the push state with `git ls-remote`** — four sessions running.
- **Do not background a vitest run and then start `pnpm verify`.**

## What is owed by whom

| | |
|---|---|
| **Author** | The two redeploys (STRICTLY before pushing — binding), then the push. Standing three unchanged: D24 counsel read, Gate 4, `display_name` one-row fix. |
| **Platform** | Nothing open. #5/#6 await their design passes. |
| **Curriculum side** | Unchanged: their restructure, `transform.translate`, alignment arrays, chain 2. |

## House rules that bite hardest here

- Never `git push` — the author pushes. Check `git branch --show-current` is
  `main` before committing.
- `pnpm verify` is the definition of done for CI's check job.
- A schema/sanitize/grading change regenerates the bundle(s) in the SAME
  commit and owes redeploys. A registry entry or secret-field change moves
  `SANITIZER_REV` on its own; the printShuffle pin records each move.
- STATE.md is measured in WORDS (~1,500 target, 4,000 ceiling) — it is close
  to the ceiling; anything added must displace something.
