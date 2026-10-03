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

## 2 — A plane-less geometry figure in the body (Y7, ```figure) {checkpoint}

Added 2026-10-03 with the Y7 geometry slice ([y7-figures-and-charts.md](../docs/design/y7-figures-and-charts.md)).
**How to read it:** no grid or axes; true angles (one scale); the letters A, B, C
outside each corner; "8 cm" below AB; the 68° arc at A; double arcs at B; the two
ticks on BC; the arrow on AB; a dashed height from C; "base" under AB; and a
"Not to scale" caption under the figure. Print it: the caption prints too.

```figure
alt: Triangle ABC with AB = 8 cm, angle A = 68° and a dashed height from C
point (0,0) "A"
point (8,0) "B"
point (2,5) "C"
polygon A B C
side AB "8 cm"
angle BAC 68°
angle ABC "x"
ticks BC 2
parallel AB (1,6) (9,6)
segment C (2,0) dashed
text (4,-1.8) "base"
```

Angle A is marked. How many degrees is it? {{=68}}
