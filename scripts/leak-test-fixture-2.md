# S2 Leak Test Fixture 2 — geometry answer keys + shuffle probe

Companion to `leak-test-fixture.md`. That one covered blanks / MC / matching /
rubrics / `graph_inequality`. This one covers the answer-key shapes it MISSED —
every remaining `interactive_graph` variant, both `number_line` variants, all
four `data_plot` variants — plus an ordering block with distinctive item text so
the per-student serve-shuffle can be checked from the wire.

Import via the app's markdown import, publish, then run verify-content-path.js
against it.

Secret fields this fixture puts on the wire path (none may survive):
`correctPoints` · `tolerance` · `models` · `domains` · `regions` ·
`inequalities` · `rays` · `segments` · `noSolutionCorrect` · `solution` ·
`mistakeFeedback` · `partialCredit` · `builtinFeedback`

## Graph — plot a point {checkpoint}

The gap fixture 1 left open: `plot_point` is the only variant carrying `correctPoints`.

```graph
axes: -10..10, -10..10
prompt: Plot the points $(2, 3)$ and $(-4, 5)$.
answer: (2, 3), (-4, 5)
mistake: (3, 2) :: You swapped the coordinates.
options: partial-credit
```

## Graph — plot a function

```graph
axes: -10..10, -10..10
prompt: Graph $y = 2x + 1$.
answer: y = 2x + 1
mistake: y = x + 1 :: Check the coefficient of $x$.
solution: Slope 2, intercept 1.
```

## Graph — a curve

```graph
axes: -10..10, -10..10
prompt: Graph $y = x^2 - 4$.
answer: x^2 - 4
```

## Graph — shade a region

```graph
axes: -10..10, -10..10
prompt: Shade the triangle with vertices $(0,0)$, $(4,0)$, $(2,4)$.
answer: region (0,0), (4,0), (2,4)
```

## Graph — ray and segment

```graph
axes: -10..10, -10..10
prompt: Draw the ray starting at $(1, 2)$ through $(3, 4)$.
answer: ray (1, 2) through (3, 4) open
```

```graph
axes: -10..10, -10..10
prompt: Draw the segment from $(-2, 1)$ to $(3, -4)$.
answer: segment (-2, 1) to (3, -4) open closed
```

## Graph — trick question

`no-solution-correct` is what makes `noSolutionCorrect` true rather than default-false.

```graph
axes: -10..10, -10..10
prompt: Graph a line through $(1,1)$ that is both vertical and horizontal.
answer: none
options: no-solution-correct, no-builtin-feedback
```

## Number line — plot points

```numberline
prompt: Plot $-3$ and $4$.
answer: -3, 4
solution: Count left from zero for the negative.
```

## Number line — a ray

```numberline
prompt: Graph $x \ge 3$.
answer: x >= 3
```

## Data plot — all four variants

```dataplot
prompt: Make a dot plot of the data.
data: 3, 5, 5, 6, 8
answer: dotplot
```

```dataplot
prompt: Make a histogram of the data.
data: 1, 2, 2, 3, 5, 8, 8, 9, 12, 15
axis: 0..20 step 5
answer: histogram
```

```dataplot
prompt: Make a box plot of the data.
data: 4, 7, 8, 10, 11, 14, 19
answer: boxplot tolerance 1
solution: Use the exclusive-median method.
```

```dataplot
prompt: Read the median off the chart below.
data: 2, 4, 4, 6, 9
show: dotplot
```

## Ordering — the shuffle probe

Authored order is ALPHA, BRAVO, CHARLIE, DELTA, ECHO, FOXTROT. The served order
must differ from this, and must be identical across two fetches by the same
student.

```order
prompt: Put the call signs in order.
1. ALPHA
2. BRAVO
3. CHARLIE
4. DELTA
5. ECHO
6. FOXTROT
solution: Alphabetical by first letter.
```

## Worked example — childBlocks recursion

Fixture 1 had a faded example; this exercises the plain `worked_example` container.

```worked
title: Solving $2x + 3 = 11$
Subtract 3 from both sides.
$$2x = 8$$
Divide by 2.
$$x = 4$$
```

## Self-explanation — the recorded family

```explain
Why did you subtract 3 from both sides first?
starter: I subtracted 3 because…
```
