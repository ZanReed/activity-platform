# Handoff — 2026-09-01

Paste the block below `PASTE FROM HERE` into a new chat. Everything above it is
context for a human deciding whether the handoff is accurate.

---

## What happened in the session that wrote this

Three commits: `4f4cb3e` (wishlist #2 — cubic + quartic graded families, the
full slice), `a3910ec` (wishlist #4's design pass, D1–D10, parked at the
greenlight gate), `8ea4e8d` (the contention-red reproduction findings).

The #2 slice ran design → build → mutation-test → bundles → browser verify in
one pass. The one real bug it surfaced is worth remembering: the family
detector residual-checked each candidate fit AT THE FIT'S OWN SAMPLE POINTS,
and a 5-parameter quartic interpolates any 5 finite samples exactly — `ln(x)`
survives at exactly 5 of the default grid, so the quartic branch stole every
logarithm. The EXISTING log tests caught it the moment the branch landed
(fits now verify on the grid plus its midpoints). All six new guards were
mutation-tested the day they were written; every one went red.

## What the next session should know before trusting anything here

- **`HANDOFF.md` is REPLACED, not appended** — a transient baton, not in
  CLAUDE.md's doc map.
- **`origin/main` was at `b1092b8` when this was written; three local commits
  are UNPUSHED.** Verify with `git ls-remote` — the push state has now been
  wrong for four sessions running when inherited.
- **TWO FUNCTION REDEPLOYS ARE OWED, ORDERED BEFORE THE PUSH** (STATE →
  Pending): `pnpm deploy:get-activity` + `pnpm deploy:check`, then push. A
  push deploys the app (Pages), and an app that can author quartics against
  the old `get-activity` serves them family-stripped (broken layout, no leak).
- **CI:** run `33401398052` (the last pushed commit) completed green on all
  four jobs — tool-read, not inherited.

---

# PASTE FROM HERE

I'm picking up the activity-platform repo cold. Read CLAUDE.md, then STATE.md,
then TODOS.md.

## Where things stand (2026-09-01, `main` at `8ea4e8d`, UNPUSHED past `b1092b8`)

**Wishlist #2 is SHIPPED**: `cubic` and `quartic` graded function families,
end to end — schema, shared parser, kit scorers, board + print SVG, sanitizer
whitelist, editor, dev harness, import prompt (+regenerated catalogue prompt).
Both server bundles are committed in the same commit. Design record:
`docs/design/graded-function-families.md` (§top, the 2026-08-31 extension —
five numbered decisions and the interpolation-shadow bug).

**Wishlist #4 (`nway_correspondence`) has a WRITTEN DESIGN PASS awaiting the
author's yes/no per decision**: `docs/design/nway-correspondence.md`, D1–D10
with recommendations. Do NOT start its code before the greenlight — the
working-style gate for new block types is explicit.

**Two redeploys are owed BEFORE the author pushes** (STATE → Pending author
actions has the full ordering rationale): `pnpm deploy:get-activity` and
`pnpm deploy:check` (never `--no-verify-jwt` on check). Verify by bundle
sha256, not version numbers. `SANITIZER_REV` deliberately did not move.

**`pnpm verify` is 8/8 green** at `8ea4e8d`. The perf/print browser lanes run
in CI on push, as usual.

## The ranked remainder, if you are here to do work rather than author

1. **#4 build — BLOCKED on the author's D1–D10 ruling**
   (`docs/design/nway-correspondence.md`).
2. **#3 build — ALSO design-passed and BLOCKED on its own D1–D10 ruling**
   (`docs/design/unit-bearing-blanks.md`). Notably cheaper than #4: no wire
   bump — the typed "1.5 km/h" already rides the blanks map as a string.
3. **#5 (`draggable_curve`) → #6 (`seeded_data`)** — unchanged, in order.
4. The contention-red entry in TODOS is now REPRODUCTION-ANNOTATED: it stayed
   green under 16 burners + a concurrent full suite, so the trigger is
   swap-level thrash. Candidates are named in the entry; do not ship a
   mitigation without catching a live red first.

## The authoring lever is unchanged

~150 markdown files planned in `~/activity-catalogue-pilot/`, 4 written. The
baseline dry-run (command in STATE → Current focus) exited 0 this session with
an EMPTY change preview on all four published activities — that is the healthy
state. **The ~11 derivative-chain activities are now UNBLOCKED by #2**: a
`graph` fence with `answer: y = x^3 - 3x` (or `x^4 …`) imports, grades, and
prints today.

## Traps that cost real time recently (inherited + new)

- **A guard can be true for a reason other than the one it was written for.**
  Three instances in two weeks now. Watch every new guard fail once, the day
  you write it.
- **A fit can be validated only against the points it was fitted from** — the
  #2 slice's variant of the same disease. If you add a detection/classification
  branch, check it against inputs the fit never saw.
- **Verify the push state with `git ls-remote`** — four sessions running.
- **Do not background a vitest run and then start `pnpm verify`** — three
  timing-sensitive files go red under saturation (TODOS has the full entry,
  now with reproduction findings).

## What is owed by whom

| | |
|---|---|
| **Author** | The two redeploys (BEFORE pushing), then the push. Standing three unchanged: D24 counsel read, Gate 4, `display_name` one-row fix. Plus: the two design-pass rulings (`nway-correspondence.md`, `unit-bearing-blanks.md`) when ready. |
| **Platform** | Nothing open besides the gated #4 build. |
| **Curriculum side** | Unchanged from the previous handoff (their restructure, `transform.translate`, alignment arrays, chain 2). |

## House rules that bite hardest here

- Never `git push` — the author pushes. Check `git branch --show-current` is
  `main` before committing.
- `pnpm verify` is the definition of done for CI's check job — 8/8 now.
- A schema/sanitize/grading change means the bundle(s) regenerate in the SAME
  commit and redeploys are owed. This session's example is the model.
- After changing `markdownImportPrompt.ts`, `pnpm prompt:catalogue` — the
  generated doc embeds it and its test fails on drift (hit this session).
- STATE.md is measured in WORDS (~1,500 target, 4,000 ceiling) — it sits 3
  words under the ceiling right now; anything added must displace something.
