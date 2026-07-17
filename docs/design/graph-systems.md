# Graph systems — multi-answer interactive-graph questions (design) — 2026-07-18

`/office-hours` (product framing) + `/plan-eng-review` (architecture) for the
Group-3 follow-up "multi-answer authoring." Lets a teacher author a graph
question the student answers with **more than one** boundary — starting with a
**system of inequalities** (graph 2+ inequalities, shade the intersection).

## Problem

The interactive-graph question types are single-answer: the authoring UI reads
`firstInequality()` / `firstModel()` and writes single-element arrays; the
runtime reads `[0]` ([runtime.ts:185/188](../../packages/graph-kit/src/runtime.ts));
the student board (`mountGraphQuestion`) mounts one boundary. `plot_point`
already supports N correct points (a count control), but you cannot ask a
student to graph a **system**. Systems of inequalities are core Algebra 1/2
content, and the answer is the shaded **intersection** — it cannot be composed
from separate single-answer graph blocks (each has its own board; there is no
shared intersection). That composition gap is why this needs one shared board.

## Rulings

**Product (`/office-hours`, 2026-07-18):**
- **Scope = inequalities + functions**, but **phased: inequality systems FIRST**
  (this doc), functions-systems a fast-follow reusing the same wire + scoring.
  Rays/segments multi-answer is out (rare classroom need).
- **Match rule = match-all, order-independent** (set match): the student must
  plot every authored boundary + the right side; order does not matter. Honors
  the block's existing `partialCredit` flag (off = all-or-nothing, on =
  proportional: 2 of 3 boundaries = 2/3).

**Eng (`/plan-eng-review`, 2026-07-18):**
- **A "system" is a `graph_inequality` with `inequalities.length > 1`.** No new
  interaction type, **no answer-key schema change** — the `inequalities` array is
  already `z.array(...).min(1)` and the schema comment already reads "systems
  ('shade where BOTH hold')". Runtime + boards branch on `.length`.
- **Full-stack build**, not authoring-only: student board + runtime + scoring +
  the **student-response wire** are all single-answer today.

## Scope challenge (eng-review Step 0)

| Layer | State today | This slice |
|---|---|---|
| Answer-key schema | **N-ready** (`inequalities: array.min(1)`) | no change |
| Authoring UI (`InteractiveGraphView`) | `firstInequality` + single-write | **N answer rows** |
| Author board (`mountGraphAuthor`) | one boundary (shading just shipped) | **N boundaries** |
| Student board (`mountGraphQuestion`) | one boundary + one shade | **N boundaries + intersection** |
| Runtime (`runtime.ts`) | reads `inequalities[0]` | **reads all N** |
| Scoring (`graph-score.ts`) | `scoreInequality` (one); `scoreInequalityPartial` exists but dormant | **match-all set-match over N** |
| Student response wire (`submission.ts`) | one `InequalityResponse` per block | **new additive member** (below) |
| Deploy | — | kit upload + **ingest redeploy** + publish redeploy |

~8 files across schema/graph-kit/app. The complexity gate tripped; scope was
reduced to **inequality systems only** (author-ruled) with functions-systems
deferred.

## Data model — the one real wire decision

The **answer key** stays `graph_inequality` with N `inequalities` (no change).
The **student response** must carry N boundaries. Today
`graphResponses[blockId]` is a single `InequalityResponse`
([submission.ts:140](../../packages/schema/src/submission.ts)); one response
can't hold N.

**Chosen: a new additive discriminated-union member** (mirrors how `plot_ray` /
`plot_segment` were added — "adding union members ACCEPTS MORE", submission.ts
comment):

```
SystemInequalityResponse = {
  type: 'graph_inequality_system',
  parts: InequalityResponse[],     // one per boundary the student plotted
  correct: boolean,                // match-all AND
  earned?, total?,                 // partial-credit (matched / N), v4 extras
  confidence?,
}
```

Added to `GraphResponseV4`'s union. **Ingest must be redeployed to accept the new
member BEFORE any page emits it** (CLAUDE.md deploy-order rule). Adding a union
member is additive — no stored row is invalidated; whether it warrants a formal
`schemaVersion` bump is a build-time check (the Ray/Segment precedent added
members without one), but the ingest redeploy is required regardless.

**Rejected:** widening the record value to `GraphResponse | GraphResponse[]`
(ugly discrimination) or making it always an array (churns every existing single
response). The new-member path leaves every current response shape untouched.

## Architecture + data flow

```
AUTHOR (InteractiveGraphView)
  answer rows: [ y > x , y < 2x+1 ]   ← a list editor (N inequality rows,
    │                                    each: formula + side + strict)
    │  writes interaction.inequalities = [ {boundary,side,strict}, … ]  (N)
    ▼
mountGraphAuthor  ── per row: boundary handles + shaded half-plane
                     (reuses the shading just shipped, N times; intersection
                      preview = overlap of the N shades)
    │  publish → data-graph-answer-key { inequalities: [...] }  (already N-ready)
    ▼
PUBLISHED PAGE (runtime.ts → mountGraphQuestion)
  reads ALL N inequalities (not [0]) → mounts N boundary widgets,
  student positions each boundary + picks each side → board renders the
  running intersection (overlap of chosen half-planes)
    │  submit → graphResponses[id] = { type:'graph_inequality_system',
    │                                  parts:[ {studentPoints,side,strict}, … ] }
    ▼
INGEST (accepts the new member) → stored
    ▼
SCORING (graph-score.ts)  match-all, order-independent:
  greedy/bipartite set-match each authored inequality to one student part
  (existing single-inequality comparison as the per-pair test); correct = all
  matched; earned/total = matched / N when partialCredit is on.
```

## Key edge cases / failure modes

- **N = 1** must render + score **byte-identically to today** (a plain
  `graph_inequality`, not a system). The system path activates only at
  `inequalities.length > 1`. This is the load-bearing regression guard.
- **Order independence** — student plots the 2 boundaries in either order;
  set-match must not penalize order. Two authored boundaries that are *identical*
  (degenerate authoring) → match-match is still well-defined (greedy is fine).
- **Intersection rendering** — the student board must show the overlap clearly
  (darker where all half-planes agree). Empty intersection (contradictory
  system) is a legal authored answer; render nothing shaded, don't crash.
- **Partial credit off** — any boundary wrong → 0 (all-or-nothing), matching the
  block default.
- **Mixed strict/inclusive boundaries** in one system — each part keeps its own
  dashed/solid + side (already per-inequality).

## Test plan (to /test-spec after this design clears)

- **schema:** the new `graph_inequality_system` member parses; N=1 answer-key
  unchanged; ingest accepts the new member.
- **scoring (pure, graph-score.ts):** match-all set-match — all-correct → correct;
  one wrong → incorrect (partial off) / (N-1)/N (partial on); order-independent;
  N=1 identical to `scoreInequality`.
- **runtime:** reads all N; N=1 path unchanged (identity).
- **board (browser/owner — JSXGraph, no unit seam):** author N rows shade N
  half-planes + the intersection; student plots N + sees the overlap; N=1 looks
  like today.
- **e2e:** author a 2-inequality system → publish-bundle render → student plots
  both → submit → dashboard shows the system response scored.
- **acceptance:** a real 2-inequality system authored, published, answered by a
  student, graded correctly (owner cross-check).

## Deploy sequence (author-run)

1. `pnpm bundle:renderer` (if renderer touched) + commit.
2. `pnpm upload:graph-kit` → new kit hash (student board + runtime changed) →
   commit the manifest.
3. **`pnpm deploy:ingest`** (accept the new response member) — BEFORE republishing.
4. `pnpm deploy:publish` (publish-activity) — new pages emit the system.
   Already-published pages keep the old kit until re-published.

## NOT in scope (this slice)

- **Functions-systems** (multiple curves) — the fast-follow; reuses the wire +
  set-match scoring, adds a multi-curve board interaction.
- Rays/segments multi-answer (rare).
- Composing a system from separate blocks (doesn't express the intersection).
- Ordered / match-any scoring (match-all is the ruled semantics).

## GSTACK REVIEW REPORT

| Run | Status | Findings |
|---|---|---|
| Office-hours (product) | ✅ | Scope = inequalities + functions, **phased inequalities-first**; match-all order-independent, honors `partialCredit`. Startup demand-diagnostic right-sized out (internal feature of a shipped product). |
| Scope challenge (Step 0) | ✅ | Bigger than "authoring UI" — full-stack + a student-response wire member + ingest redeploy. Complexity gate tripped → reduced to **inequality systems only**. Key simplification: a system = `graph_inequality` with `inequalities.length > 1` (no answer-key schema change). |
| Architecture | ✅ | New additive `graph_inequality_system` response member (Ray/Segment precedent), NOT a record-value widening. Runtime/boards branch on `.length`; N=1 stays identical. Scoring = set-match reusing the single-inequality comparison. |
| Reuse | ✅ | Answer-key schema arrays already N-ready; `mountGraphAuthor` shading (just shipped) reused N times; `scoreInequalityPartial` (dormant) folds into the set-match. |
| Tests | ⏭️ | Deferred to `/test-spec`: pure scoring set-match + N=1 identity + runtime + the board owner-eyeball + a system e2e. |
| Deploy | ✅ | kit upload → **ingest redeploy (before republish)** → publish redeploy. Wire member additive; `schemaVersion` bump is a build-time check. |

VERDICT: CLEARED — buildable as Phase 1 (inequality systems). Full-stack: app
authoring (N rows) + graph-kit (N boards + runtime + set-match scoring) + schema
(additive response member) + the deploy train (ingest before republish).
Recommended as its own build session (multi-slice, graded student path).

**UNRESOLVED DECISIONS:**
- Whether the new response member warrants a formal `submission.schemaVersion`
  bump (v9→v10) or rides as an additive union member without one — resolve at
  build time by checking the Ray/Segment precedent against the current ingest
  parser.
