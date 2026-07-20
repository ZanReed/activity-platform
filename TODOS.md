# TODOS

Deferred work items with enough context to pick up cold. Durable backlog lives in
ROADMAP.md; this file is for concrete, near-term follow-ups surfaced during reviews.

## (done 2026-07-20) Slice 2 — math_block equation-gap numbering + review

Shipped. Model A in-equation gaps (`math_block.prompts`) are now numbered on the page
(a gap-bearing equation is a numbered problem; display equations stay unnumbered) and
indexed in `buildActivityIndex`, so they appear in the teacher results view instead of
being orphaned. `math_block` also gained the per-block `label` (auto/custom/none) for
parity with the other question types. See STATE.md pending-action #000.

_Deferred follow-ups (not blocking): N-gap-per-equation sub-part lettering (a/b) for a
math_block with multiple prompts — currently the equation gets one number and its gaps
share it, which matches the single-gap Model A v1; and reveal-the-answer-in-gap for
math_block (no solution-reveal trigger)._
