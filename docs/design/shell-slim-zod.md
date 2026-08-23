# Shell-slim rung 1 — getting zod out of the student shell

**Status:** ✅ **BUILT 2026-08-23 — Z1–Z6 shipped, Z7 filed. Eng-reviewed + outside voice; three of this doc's own claims were corrected. See AS-BUILT.**

The shell-slim ladder's rung 1, unparked 2026-08-23 because both shell budget
rows fell below the ~10% headroom policy at once and the CSS row has no lever
left (DECISIONS.md → "The shell CSS cap").

## ⚠ THE LADDER'S PREMISE FOR THIS RUNG IS WRONG

TODOS has described rung 1 this way since 2026-08-18:

> **The zod audit.** `@activity/schema` parses in the shell, and the
> offline-restore path is parse-bearing — so this needs real thought about what
> may become a trust-the-bytes read and what must stay validated.

**Measured, not argued: there is no parse on the student path at all.**

| student-path site | what it does |
|---|---|
| `client/readClient.ts:188` | `document: data.activity as SanitizedActivityDocument` — a plain **cast** |
| `store/documentCache.ts:238-260` | `JSON.parse` + hand-written checks on the ENVELOPE (`activityId`, `versionId`, `title`), then `document: candidate.document` — the body passes through **unvalidated** |
| everything else in `store/`, `client/`, `container/`, `StudentViewer.tsx` | **zero** `X.parse(` / `X.safeParse(` calls |

Every zod parse in the workspace outside tests is an **editor** path —
`serialize.ts`, `ActivityEditor.tsx`, `usePublish.ts`, `ActivityPrint.tsx`,
`batchImportPipeline.ts` — and those live in lazy chunks.

So this rung is **not** a trust-boundary redesign. The offline-restore path is
already a trust-the-bytes read; there is no validation to trade away. zod is in
the shell as **import cost**, not validation cost. That makes the slice far
smaller and far safer than the ladder implies — and it is why the premise is
corrected here before any decision rests on it (P10: re-derive plans against
shipped reality before building).

## What actually anchors zod, measured

Bundled with esbuild, one helper at a time, from the real sources:

| helper the shell imports | module | gz alone | zod |
|---|---|---:|---|
| `stepLetter` | `step-letter.ts` | **0.14 KiB** | absent |
| `fontFamilyValue` | `fonts.ts` | **0.28 KiB** | absent |
| `pageLabel` (+ `isGradeable`, `isPageNumbered`) | `block-predicates.ts` | **15.8 KiB** | **PRESENT** |
| `tableBlankIds` | `blocks/table.ts` | **15.6 KiB** | **PRESENT** |

`sanitize/sanitized-types.ts` imports schema **type-only** — free. The app shell
(`StudentViewer`, `App`, `main`) imports no schema values at all.

**TWO CONDITIONS, BOTH NECESSARY, NEITHER SUFFICIENT.** ⚠ This paragraph read
"**the whole anchor is ONE EDGE**" until the outside voice built it and found
that sentence contradicts this doc's own table above: the extraction ALONE left
the entry chunk **byte-identical**. The two conditions are (a) the value edge at
`block-predicates.ts:32` — `import { tableBlankIds } from './blocks/table.js';`,
the one non-type import in that file — and (b) the bundler being told the
package is side-effect-free, without which every `z.object({…})` module is
retained as a presumed side effect. Break one and nothing moves.

## The measured fix, and the cheap alternative that does NOT work

Three scratch bundles, repo untouched:

| configuration | gz | zod |
|---|---:|---|
| barrel import, today | 19.2 KiB | PRESENT |
| barrel + `"sideEffects": false` **alone** | 16.5 KiB | **PRESENT** |
| `pageLabel` after extracting `tableBlankIds` | **0.47 KiB** | ABSENT |
| barrel + `"sideEffects": false` + extraction | **0.77 KiB** | **ABSENT** |

**`sideEffects: false` alone is refuted** — it lets a bundler drop *unused*
modules, and `blocks/table.ts` is genuinely *used*, so the chain is live
dependency rather than dead code. The extraction is required. Together they take
the probe from 19.2 KiB to 0.77 KiB.

**No subpath exports are needed** (`@activity/schema` exposes only `"."` today).
Once the edge is broken and the package is declared side-effect-free, the barrel
tree-shakes — so no call site changes. This is the graph-kit barrel rule's
cousin, solved without the graph-kit remedy.

Verified for the `sideEffects` claim: no module-scope mutation, no globals, no
bare/CSS imports anywhere in `packages/schema/src`.

## The decisions

### Z1. Extract `tableBlankIds` out of `blocks/table.ts` into a zod-free module

**Recommend: yes**, and there is a precedent to copy exactly. `step-letter.ts`
was extracted for the same reason under viewer-numbering ruling N9, and its
header records why. `tableBlankIds` is a pure function over a structural shape;
it is in the schema module only because the table block is.

### Z2. Add `"sideEffects": false` to `packages/schema/package.json`

**Recommend: yes.** Required — Z1 alone leaves the barrel dragging zod for
anyone who imports it. Verified safe above. The risk to state plainly: it is a
package-WIDE assertion, so a future schema module that registers something at
import time would be silently droppable. Schema is a declarations package; if
that ever stops being true, the assertion has to come out.

### Z3. Where does the extracted function live?

**Recommend `packages/schema/src/table-blank-ids.ts`**, a sibling of
`step-letter.ts`, with a header in the same style saying WHY it is not in
`blocks/table.ts`. Its `TableBlankSource` type moves with it.

### Z4. The guard — how does zod stay out?

**Recommend an absence row in `scripts/check-perf-budget.mjs`:
`shell is free of zod`.** The budget already has exactly four of these
(katex, mathlive, jsxgraph, prosemirror) plus four `build is free of …` rows
from slice 1, and they are the established pattern for "this must never come
back". Without it, the next `import { ActivityDocument }` in a shell file
silently re-adds 15 KiB and the JS row absorbs it until an audit notices.

The marker must be chosen the way the existing rows were — `stripAssetSpecifiers`
is applied first, and the marker has to survive minification. `ZodError` and
`addIssue` both appear in today's entry chunk and are candidates.

### Z5. Tighten `SHELL_JS_GZ_KIB` in the same commit

**Recommend: yes — this is slice 1's own rule** (it tightened 185 → 172 the day
it shrank the shell, on ruling R6 that slack is a fossil), and it is what makes
the win permanent rather than silently re-spent. Set it to the measured
post-slice value + ~10%.

⚠ **The number cannot be picked before the slice runs.** The 15–16 KiB above is
an esbuild probe; Vite builds production with rollup, and the real entry chunk
may differ. Measure with `node scripts/check-perf-budget.mjs` after, then set
the cap. Do not pre-commit to a figure here — this doc would become the fossil.

### Z6. Add subpath exports to `@activity/schema` as well?

**Recommend: no.** Measured unnecessary (the barrel tree-shakes once Z1+Z2 land),
and it would touch every import site across three packages for no measured gain.
Revisit only if a future anchor cannot be broken by extraction.

### Z7. The trust posture this uncovered — file it, do not bundle it

**Recommend: file as its own question, ship nothing about it here.** The finding
stands on its own: **the student path validates neither the served document nor
the cached one.** Both are casts.

That is defensible today — the served bytes come from our own Edge Function over
TLS, and the cached bytes are ones we wrote. It is also not obviously right on a
SHARED CHROMEBOOK, which this platform explicitly targets and already builds
`sweepForeignStorage`, tab locks and a shared-device purge for: `localStorage`
there is not a trusted store, and a corrupted or hand-edited cache entry reaches
the renderer as a typed object nobody checked.

**It must not ride this slice.** Adding validation would put zod back in the
shell and invert the whole result — so the two decisions are genuinely coupled
and deserve separate rulings, in this order: get zod out on the measured facts,
then decide the trust posture on its own merits with a cheap hand-rolled guard
if one is wanted.

## Test plan (to be filled in after the rulings)

The guard bar is the calculator slice's: guards bind to OUTPUT and are
**mutation-tested**. For this slice specifically that means the Z4 absence row
must be shown to go red — add a shell-reachable `import { ActivityDocument }`,
confirm the budget fails, revert. An absence row that has never been seen to
fire is the vacuity this repo keeps finding.

Existing coverage that must not break: `packages/schema`'s own suite (368
tests) exercises `tableBlankIds` and the table schema; the editor's serialize
path is the heaviest consumer of both.

---

# AS-BUILT (2026-08-23)

**Z1–Z6 shipped. Z7 filed.** Reviewed before building: `/plan-eng-review` (four
sections) plus an independent outside voice. **The outside voice was worth more
than the review**, as it was on the calculator slice — it went and BUILT the
change against the real bundler, which resolved the plan's biggest risk and
turned up two things that would have been discovered at build time or in CI.

## The measured result

| configuration | entry chunk gz | zod in shell |
|---|---:|---|
| HEAD | 160.5 | present |
| **Z1 alone** | **160.5 (byte-identical)** | present |
| Z2 alone | 158.0 | present |
| **Z1 + Z2** | **143.2** | **absent** |

**−17.3 KiB gz**, larger than the plan's ~15 KiB estimate. Confirmed
independently in this repo after the build: `shell JS 143.2 (cap 158)`,
`shell is free of zod — absent`, `ledger: zod 16.1 (cap 18)`, 18 budgets pass.

**P1A's ~150 KiB shell target is MET for the first time** (143.2). The paragraph
in `perf-budgets.mjs` that said the target was ~8 KiB away is now history rather
than status, and is annotated as such rather than deleted.

## Three of this doc's claims were wrong, and the review caught them

1. **"The whole anchor is ONE EDGE" — OVERSTATED, and it contradicted this
   doc's own table.** The extraction alone leaves the entry chunk *byte-identical*.
   Two conditions, both necessary, neither sufficient. A reader following the old
   headline would have shipped a provable no-op. Corrected in place above.

2. **Z4 was NOT IMPLEMENTABLE as written — it would have turned CI red.** The
   four `shell is free of …` rows are not a hand-written list; they are
   `.map()`ed from `CHUNK_LEDGER`, and `scripts/tests/perf-budgets.test.mjs:95`
   asserts the two name-sets are `deepEqual`. A shell-only zod row fails that
   test under `pnpm verify`. **The correct shape is strictly better:** a
   `CHUNK_LEDGER` row caps zod where it actually lives (16.1 KiB in
   `document-*.js`, cap 18), the shell absence row is then generated for free,
   and — unlike a bare absence row — a ledger row **self-verifies**, because
   `check-perf-budget.mjs` fails a row that matches nothing.

3. **The marker had a live false-positive.** A bare `/zod/i` matches a second
   chunk containing no zod at all: our own `serialize.ts` logs *"failed Zod
   validation"*, and that string rides `ImagePopoverHost`. The row uses
   `/ZodError/`, which survives minification because it is a **string literal**
   (`this.name="ZodError"`), not an identifier. This is the
   markers-from-internals-never-package-names trap the budget file already
   documents — armed, this time, by our own prose.

## What the plan missed entirely

**Both committed Edge Function bundles shrink by 84,307 bytes each.** Declaring
the package side-effect-free lets the bundler drop `packages/schema/src/submission.ts`
— the only module that differs, 29 → 28. CI fails on bundle drift, so this was a
guaranteed red build that the plan never mentioned. Both are regenerated and
committed here.

**Ruled explicitly, because an 82 KiB shrink in a client-shell PR otherwise
reads as an accident: NO REDEPLOY IS OWED.** The evidence, verified rather than
assumed — the dropped module is dead code in both functions (neither
`get-activity` nor `check-activity` references `submissions` or
`SubmissionResponses`; their only schema imports are `UpgradeError` and
`upgradeActivityDocument`), `tableBlankIds` appears zero times in either bundle
before or after, no sanitize declaration changed so `SANITIZER_REV` is untouched,
and the other 28 schema modules are byte-identical.

## The guard, and the vacuity trap it nearly shipped with

The plan's mutation test was: "add a shell-reachable `import { ActivityDocument }`,
confirm the budget fails." **That would have passed vacuously.** With
`sideEffects: false` in force, an UNREFERENCED value import is dropped by rollup,
so the budget stays green and the mutation proves nothing — the exact P9 failure
this repo keeps re-finding, and it would have been a guard that had never been
seen to fire. The mutation must USE the import (call `.safeParse` on something)
to produce a real red.

## Also fixed in this slice

- `packages/schema/dist/` — a stale `.d.ts` tree from an old `tsc` run, still
  declaring `tableBlankIds` from `./blocks/table.js`. Inert (nothing resolves to
  it; `main`/`exports` point at `./src/index.ts`) but it is a declaration
  surviving a move, which is this repo's named defect class. Removed.
- `blocks/index.ts` re-exported the function too — a third edge the plan named
  only two of.

## Checked and clear

- **Offline / service worker: no impact.** The precache is `index.html` only
  (1 entry, 979 B), and the offline-restore path validates nothing, so there is
  nothing for the removal to break.
- **`TableBlankSource` was always a hand-written STRUCTURAL interface**, never
  derived from the zod schema, so the extraction costs no type checking. The
  review's worry that the move would sever the type link dissolved on reading it.
- **`sideEffects: false` safety** — independently re-verified: zero
  `globalThis`/`window`/`process.env`/`.register(`/`Object.freeze` hits, zero
  side-effect-only imports of the package anywhere, and zod v3 has no global
  registry to mutate.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | not run | Not a product change — an import-hygiene slice with no user-visible surface |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | **issues_found (2026-08-23)** | 5 issues across 4 sections; scope accepted as-is (4 files, 0 new services) |
| Outside Voice | Claude subagent (Codex not installed) | Independent challenge | 1 | **issues_found (2026-08-23)** | 4 material problems + 6 missed items; **built the change against the real bundler** |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | **deliberately skipped** | No UI surface: a function moves between modules, a package.json field, a budget row. Nothing rendered changes |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | not run | — |

**CROSS-MODEL:** No tension — the outside voice confirmed, corrected and
extended rather than disagreeing. It resolved the review's top finding
(esbuild-vs-rollup) empirically in the plan's favour, and independently
confirmed the anchor analysis by a stronger method than the plan used: with
Z1+Z2 applied, all five zod markers are absent from the entry chunk, which is
exhaustive — no missed value-import can exist.

**VERDICT:** ENG CLEARED + OUTSIDE VOICE ABSORBED — built, 18 budgets pass.

NO UNRESOLVED DECISIONS
