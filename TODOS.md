# TODOS

Deferred work items with enough context to pick up cold. Durable backlog lives in
ROADMAP.md; this file is for concrete, near-term follow-ups surfaced during reviews.

_(No open items. The numbering/label decouple — Slices 1 & 2 — and its deferred
follow-ups shipped 2026-07-20. See STATE.md pending-action #000.)_

## (done 2026-07-20) Numbering/label decouple + follow-ups

- Slice 1: per-block `label` (auto/custom/none) across all numbered question types.
- Slice 2: `math_block` equation gaps numbered on the page + indexed for teacher review.
- Sub-part lettering: a numbered multi-blank `fill_in_blank` shows `(a)/(b)` before each gap.
- `math_block` worked `solution`: a post-check worked-explanation reveal (never leaks the
  gap answer), mirroring `fill_in_blank` — reuses the fill-in-blank solution-reveal machinery.

_Still deferred (genuinely out of scope, low value): (a)(b) lettering for a multi-gap
math equation (gaps live inside rendered LaTeX — hard, and equations are usually single-gap);
answer-in-gap reveal (deliberately not built — it would leak the correct answer, which the
runtime never does)._
