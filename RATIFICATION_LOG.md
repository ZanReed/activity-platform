# RATIFICATION_LOG.md

Prediction-before-reveal outcomes for ratified specs/decisions. Beside TEST_SPEC.md.

## Graph settings extraction — test-spec slice (2026-07-17)

| id | decision | outcome | note |
|---|---|---|---|
| D4 | per-interaction-type coverage depth | predicted | Author agreed with rec: cover all 6 types (distinct save paths, ~7 cheap e2e). |
| D5 | fix axis fight bug (DraftNumberInput) during extraction | predicted | Author agreed: same bug class already flagged for data-plot; fix in-flight rather than touch the file again. Widens "pure refactor" slightly to "refactor + parity fix". |
| D6 | SKIP list (drawer layout, validator copy, board-render, index-keyed mistake editor) | predicted | Author agreed all four → owner manual pass, not automated. |

Also ratified upstream (/plan-eng-review, 2026-07-17, logged in the design doc): D2 shared helpers →
new `graphAnswerHelpers.ts` leaf module; D3 run test-spec before build. No surprises — all
recommendations matched author expectation.

Reading pointers (surprised / no-opinion items): none this round.
