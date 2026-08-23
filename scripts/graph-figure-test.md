# Graph figure test

Dogfood for the **`graph_figure`** block — the kit-free static picture that lives
on the reference panel (the summonable formula sheet). Written 2026-08-23 as T0
of [graph-figure-convergence.md](../docs/design/graph-figure-convergence.md), to
make a code-read claim observable: **before that slice, every `line` a teacher
draws here renders as an empty grid for the student**, because a line is a
`curve` drawable and `GraphFigure.tsx` skipped curves.

Its sibling `graph-feature-test.md` covers the INTERACTIVE graph question type.
It has no ```reference fence, which is why nothing in this repo had ever
authored a `graph_figure` until this file.

**How to read it:** open the reference panel. Figure 1 must show two parallel
lines on one grid; figure 2 a parabola; figure 3 a shaded half-plane; figure 4
the kinds that always worked (point / segment / ray / region). Before the
convergence slice, figures 1–3 are empty grids and figure 4 is correct — that
contrast is the bug.

## 1 — The block's reason to exist {checkpoint}

Read the formula sheet, then answer from it.

The two lines on the sheet are parallel. What do parallel lines share? {{slope|the slope|same slope}}

The parabola's vertex sits at the origin, so its equation is $y = x^2$. What is $y$ when $x = 3$? {{=9}}

```reference
title: Formula sheet
Parallel lines have the same slope. These two never meet:
axes: -5..5, -5..5
graph: line y = 2x + 1
graph: line y = 2x - 3

A parabola through the origin:
axes: -5..5, -1..9
graph: curve y = x^2

The region above a dashed boundary:
axes: -5..5, -5..5
graph: curve y > 2x - 1

Kinds that never depended on the curve renderer:
axes: -5..5, -5..5
graph: point (2, 3) closed "A"
graph: segment (-4, -2) (0, 2)
graph: ray (1, -3) (3, -1)
graph: region (-4, 4), (-2, 4), (-3, 2)
```
