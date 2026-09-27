# Course glossary — fixture (docs/design/glossary.md W-1, W-2)

The checked-in stand-in for the curriculum side's glossary file, in the
PROPOSED v1 format. Its first three entries are the format doc's example,
verbatim. Hello world (no database write):

    pnpm import:batch scripts/fixtures/glossary/demo --owner <local teacher> \
      --glossary scripts/fixtures/glossary/glossary.fixture.md --dry-run

```definitions
id: gradient
term: gradient
us: slope
How steep a line is: the rise divided by the run.
---
id: y-intercept
term: y-intercept
Where a graph crosses the $y$-axis, at $x = 0$.
---
id: rate
term: rate
A comparison of two quantities with different units, such as
$\frac{\text{km}}{\text{h}}$.
---
id: rate-of-change
term: rate of change
How fast one quantity changes compared with another. On a straight-line
graph it is the gradient.
---
id: linear-relationship
term: linear relationship
A relationship whose graph is a straight line. It has a constant rate of
change and a single y-intercept.
```
