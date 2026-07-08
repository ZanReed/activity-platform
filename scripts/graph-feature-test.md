# Graph feature test

This activity exercises every interactive-graph feature. Work through each checkpoint: answer, Check, confirm the feedback matches the prompt's expectation, then Submit at the end and verify the dashboard row's graph detail.

## 1 — Plot points {checkpoint}

```graph
prompt: Plot the point $(3, 4)$. One draggable handle; arrow keys nudge, Shift for fine steps.
answer: (3, 4)
```

```graph
prompt: Plot all three vertices: $(-2, 1)$, $(0, 5)$, and $(4, -3)$. Three handles; Tab cycles them. Any handle may take any vertex (consume-once matching).
answer: (-2, 1), (0, 5), (4, -3)
```

```graph
prompt: Partial credit: plot the three x-intercepts of $y = x(x - 2)(x + 3)$. Placing two of the three correctly should score 2/3, not 0.
answer: (0, 0), (2, 0), (-3, 0)
options: partial-credit
```

## 2 — Function families {checkpoint}

Each equation below was written in a different freeform format; every one should have imported as the right curve family.

```graph
prompt: Slope-intercept: graph $y = 2x + 3$.
answer: y = 2x + 3
```

```graph
prompt: Standard form: graph $2x + 3y = 6$. (Same as $y = -\frac{2}{3}x + 2$.)
answer: 2x + 3y = 6
```

```graph
prompt: Point-slope: graph $y - 5 = 2(x - 1)$. (Same as $y = 2x + 3$.)
answer: y - 5 = 2(x - 1)
```

```graph
prompt: Quadratic, bare expression: graph $x^2 - 4$. Handles should bend the curve, not a line.
answer: x^2 - 4
```

```graph
axes: -5..5, -2..18
prompt: Exponential (note the custom window): graph $y = 2 \cdot 3^x$.
answer: y = 2*3^x
```

```graph
axes: -2..10, -6..6
prompt: Logarithmic: graph $y = 1 + 2\ln x$.
answer: y = 1 + 2ln(x)
```

```graph
prompt: Vertical line: graph $x = 4$. The board should allow a line through vertically stacked handles.
answer: x = 4
```

## 3 — Rays and segments (domain gliders) {checkpoint}

Each question here should grow amber glider endpoint handles riding the curve, plus Start/End open/closed pills.

```graph
prompt: Graph the ray $y = x + 1$ for $x \ge 0$. Start endpoint CLOSED.
answer: y = x + 1 for x >= 0
```

```graph
prompt: Graph $y = -2x + 6$ for $x > 1$. Start endpoint OPEN.
answer: y = -2x + 6 for x > 1
```

```graph
prompt: Graph the segment $y = 0.5x + 2$ from $x = -2$ to $x = 4$, both endpoints closed. Two gliders.
answer: y = 0.5x + 2 for -2 <= x <= 4
```

## 4 — Inequalities {checkpoint}

Each widget should show solid/dotted pills and shade-side pills, and clicking a side of the board should shade that half-plane.

```graph
prompt: Strict: graph $y > 2x + 1$. Dotted boundary, shade above.
answer: y > 2x + 1
```

```graph
prompt: Non-strict: graph $y \le -x + 3$. Solid boundary, shade below.
answer: y <= -x + 3
```

```graph
prompt: Vertical strict: graph $x < 3$. Dotted vertical boundary, shade LEFT.
answer: x < 3
```

```graph
prompt: Vertical non-strict: graph $x \ge -2$. Solid vertical boundary, shade RIGHT.
answer: x >= -2
```

```graph
prompt: Quadratic boundary: graph $y \ge x^2 - 4$. Solid parabola, shade above.
answer: y >= x^2 - 4
```

```graph
prompt: Trick question: graph all points where $x^2 < -1$. The "no solution" button IS the correct answer here.
answer: none
```

```graph
prompt: The "no solution" button should APPEAR here but be WRONG — the correct answer is to graph $y > x$.
answer: y > x
options: allow-no-solution
```

## 5 — Shade a region {checkpoint}

```graph
prompt: Drag the four vertices to shade the square with corners $(0,0)$, $(4,0)$, $(4,4)$, $(0,4)$. Scored by overlap (IoU ≥ 0.9).
answer: region (0,0), (4,0), (4,4), (0,4)
```

```graph
prompt: Shade the triangle with vertices $(-3, 0)$, $(3, 0)$, $(0, 5)$. This one carries the partial-credit flag.
answer: region (-3, 0), (3, 0), (0, 5)
options: partial-credit
```

## 6 — Mixed scoring {checkpoint}

This checkpoint mixes a fill-in-the-blank with a graph — the section score should fold both together.

The slope of the line $y = 2x + 3$ is {{2}} and its y-intercept is {{3}}.

```graph
prompt: Now graph that same line, $y = 2x + 3$.
answer: y = 2x + 3
```

## 7 — Static display figures (ungraded)

Nothing below should be numbered, scored, or appear in the submission payload. Each figure is read-only: no handles, no drag, no pan.

```graph
prompt: Every drawable kind in one figure: closed point A, open point B, a dashed line, a solid parabola, a segment along the bottom, a ray with an open start, and a shaded region in the upper left.
show: point (2, 3) closed "A"
show: point (-4, 1) open "B"
show: line y = x dashed
show: line y = -x^2 + 6
show: segment (-6, -6) (-2, -6)
show: ray (0, -8) (3, -5) open
show: region (-8, 4), (-5, 4), (-5, 7), (-8, 7)
```

```graph
prompt: A pictured inequality — dotted boundary with the region above it shaded.
show: line y > 0.5x - 2
```

```graph
axes: -7..7, -2..2
prompt: An arbitrary sampled expression in a wide window: $\sin(x)$.
show: expression sin(x)
```

```graph
prompt: A domain-restricted display curve: $y = x^2$ for $x \ge 0$ only, drawn dashed.
show: line y = x^2 for x >= 0 dashed
```
