```meta
title: Year 8–9 Stress Test: Equations, Area, Ratio, Transformations and Data
course: Year 8–9 Maths
unit: Mixed skills review
tags: linear equations, graphing, area, ratio, transformations, statistics
role: practice
type: worksheet
submission: free
feedback: on_check
calculator: scientific
work: 2 lines
minutes: 40
```

# Stress Test: Equations, Area, Ratio, Transformations and Data

This activity mixes everything from this term. An [[equation :: a statement that two expressions are equal, such as $2x + 3 = 11$]] can be solved by doing the same thing to both sides. You will also meet the [[gradient]] of a line, [[ratio]] problems, the [[image]] of a shape and the [[median]] of a data set.

Work *carefully*, show your working, and use the **Reference** button for formulas. You can check a graph on [Desmos](https://www.desmos.com/calculator) afterwards. When a question says "type `2x`", type it exactly like that.

```objectives
title: Today's goals
- Solve linear equations, including ones with brackets
- Graph lines, inequalities, rays and segments on a coordinate plane
- Find the area of triangles, trapeziums and the volume of a cuboid
- Simplify ratios and share in a ratio
- Carry out reflections, rotations and translations
- Build and read dot plots, histograms, box plots and charts
```

```reference
title: Formula sheet
# Area and volume
Rectangle: $A = lw$
Triangle: $A = \frac{1}{2}bh$
$$A_{\text{trapezium}} = \frac{1}{2}(a + b)h$$
Cuboid: $V = lwh$
## Straight lines
Gradient–intercept form: $y = mx + c$
- $m$ — the gradient (rise over run)
- $c$ — the y-intercept
1. Find $c$ where the line crosses the y-axis
2. Count rise over run to find $m$
Parallel lines have the same gradient:
axes: -5..5, -5..5
graph: line y = 2x + 1
graph: line y = 2x - 3
### Speed
$$\text{speed} = \frac{\text{distance}}{\text{time}}$$
![A ruler marked in centimetres](https://placehold.co/300x80?text=ruler)
```

```definitions
term: Gradient
How steep a line is — the rise divided by the run.
$$m = \frac{y_2 - y_1}{x_2 - x_1}$$
graph: line y = 2x
---
term: Ratio
A comparison of two quantities measured in the same units.
- Written with a colon, like $3 : 2$
- Simplify by dividing both parts by the same number
---
term: Image
The shape you get after a transformation.
![A triangle and its reflection](https://placehold.co/200x120?text=object+and+image)
---
term: Median
The middle value when the data are in order.
# How to find it
1. Put the data in order
2. Find the middle value (or the mean of the middle two)
```

```callout
variant: info
Numbers in this activity may be different from your neighbour's — that is on purpose.
```

```seed
a: int 2..9
p: list 1.50, 1.75, 2.25
scores: sample 8 of 55..99
```

## Part 1: Linear equations

```worked
title: Solving $3(x - 2) = 12$
## Method
Expand the bracket.
$$3x - 6 = 12$$
Add 6 to both sides.
$$3x = 18$$
Divide both sides by 3.
$$x = 6$$
- Check: $3(6 - 2) = 3 \times 4 = 12$
- Always check by substituting back in
![A balance scale with equal weights on each side](https://placehold.co/240x120?text=balance)
```

```faded
title: Your turn: solve $5x + 4 = 29$
Subtract 4 from both sides.
$$5x = 25$$
Divide both sides by 5: x = {{=5}}
1. Check: $5 \times 5 + 4 =$ {{=29}}
```

Complete each step of solving $4x - 7 = 13$.

$$4x = \gap{20}$$

$$x = \gap{5}$$

Factorise fully, writing your answer in factorised form.

$$12x + 18 = \gap[form]{6(2x+3)}$$

Solve each equation.

1. $x + 7 = 15$, so $x =$ {{=8}}
2. $2x - 5 = 9$, so $x =$ {{=7 | ?Start by undoing the $- 5$. | !2 :: You subtracted 5 instead of adding it.}}
3. $\frac{x}{4} = 3$, so $x =$ {{=12 | !0.75 :: Multiply both sides by 4, do not divide.}}
4. $3(x + 2) = 21$, so $x =$ {{=5 | !6.33 :: Expand the bracket first, or divide both sides by 3.}}
5. $7 - x = 10$, so $x =$ {{=-3 | !3 :: Check the sign: 7 minus what gives 10?}}

Answer these in words or symbols.

- The number in front of $x$ in $5x$ is called the {{coefficient | multiplier}}.
- In $y = mx + c$, the lower-case letter used for the gradient is {{^m | ?It comes just before x.}}
- The area of a square with side $x$ is written {{x²}}.
- To 2 decimal places, $\pi \approx$ {{=3.14 +- 0.005}}.
- The punctuation mark used in 5! (five factorial) is the {{exclamation mark | exclamation point | !!}}.

Simplify $3a + 5a - 2a$ = {{==6a}}

Expanding $3(2x + 5)$ gives two terms: {{==6x}} and {{~==15}}.

Two numbers multiply to 12 and add to 7. They are {{=3}} and {{~=4}}.

Factorise: $x^2 + 5x + 6 = (x +$ {{2}}$)(x +$ {{~3}}$)$

Factorise fully (fully factorised form): $18x - 12 =$ {{===6(3x-2) | !2(9x-6) :: That is factorised, but not fully — look for a bigger common factor. | !form-wrong :: That is equal, but the question asks for the fully factorised form.}}

Simplify $3a \times 4b$ (simplest form): {{===12ab | !7ab :: You added the numbers instead of multiplying}}

Expand $4(x - 3)$ and give your answer in expanded form: {{===4x-12}}

You buy {a} pens at ${p} each. The total cost, in dollars, is {{=a*p | !a+p :: Multiply, do not add.}}

```mc
prompt: Which value of $x$ solves $2x + 3 = 11$?
( ) 7 :: You added 3 instead of subtracting it.
(x) 4
( ) 5.5 :: You divided by 2 before subtracting 3.
( ) 16 :: Check you are dividing by 2, not multiplying.
hint: Undo the + 3 first.
solution: Subtract 3 from both sides to get $2x = 8$, then divide by 2 to get $x = 4$.
```

```order
prompt: Put the steps for solving $\frac{x + 3}{2} = 7$ in order.
1. Multiply both sides by 2 to get $x + 3 = 14$
2. Subtract 3 from both sides to get $x = 11$
3. Substitute $x = 11$ back in to check
hint: Undo the last operation that was done to x first.
solution: Dividing by 2 happened last, so undo it first; then undo the + 3.
```

Complete the table for the line $y = 3x + 2$.

```table
header: column
| x | 1 | 2 | 3 | 4 |
| y | 5 | {{=8}} | {{=11}} | {{=14 | !12 :: Multiply x by 3 before adding 2.}} |
```

```columns
options: ruled
### Equation
$$2x + 6 = 20$$
x = {{=7}}
---
### Steps
- Subtract 6 from both sides
- Divide both sides by 2
![A pencil](https://placehold.co/80x80?text=pencil)
```

```explain
Why do we do the same thing to both sides of an equation?
starter: If I only change one side, then…
```

## Part 2: Graphing lines {checkpoint}

```graph
axes: -10..10, -10..10
prompt: Graph $y = 2x - 1$.
answer: y = 2x - 1
mistake: y = x - 2 :: Remember — the number multiplying x is the gradient.
mistake: y = 2x + 1 :: Check where the line crosses the y-axis.
```

```graph
prompt: Graph the inequality $y < -x + 3$.
answer: y < -x + 3
options: allow-no-solution
mistake: y <= -x + 3 :: The sign is strictly less than, so the boundary should be dotted.
mistake: y > -x + 3 :: Shade the side where y is LESS than the line.
```

```graph
axes: -2..10, -2..10
prompt: Plot the points on $y = 2x + 1$ where $x = 1$, $x = 2$ and $x = 3$.
answer: (1, 3), (2, 5), (3, 7)
mistake: (3, 1), (5, 2), (7, 3) :: Coordinates are (x, y) - x comes first.
```

```graph
prompt: Graph $y = 2x + 1$ for $x > 0$ only.
answer: ray (0, 1) through (2, 5) open
mistake: ray (0, 1) through (2, 5) :: x > 0 means x = 0 itself is not included, so the start point should be open.
mistake: y = 2x + 1 :: Only values with x > 0 belong on this graph.
```

```graph
axes: -5..5, -5..5
prompt: Graph $y = x + 1$ for $1 \le x \le 3$.
answer: segment (1, 2) to (3, 4)
mistake: ray (1, 2) through (3, 4) :: Think about whether the graph should stop or keep going.
```

```graph
axes: -1..6, -1..6
prompt: Shade the triangle with vertices $(0, 0)$, $(4, 0)$ and $(0, 3)$.
answer: region (0,0), (4,0), (0,3)
```

The area of that triangle is {{=6 | ?Half of base times height.}} square units.

```graph
prompt: Graph every point that makes BOTH $x + y = 4$ and $x + y = 6$ true.
answer: none
options: allow-no-solution
```

```graph
prompt: Plot the point where $y = 2x + 1$ and $y = 2x - 3$ cross. If they never cross, choose "no solution".
answer: (1, 3)
options: allow-no-solution, no-solution-correct, no-builtin-feedback
```

```graph
axes: -6..6, -6..6
prompt: Study this graph. You will use it in the next questions.
alt: A labelled point, two dashed and dotted lines, a shaded region, a curve, a ray and an arrow
show: point (2, 3) closed "A"
show: line y = x dashed
show: line y = -1 dotted
show: line y > 2x + 1 for x >= 0
show: expression x^2/4 - 3
show: ray (0,0) (2,1) open
show: segment (0,0) (3,2) arrow
```

Point A has coordinates ({{=2}}, {{=3}}).

The dashed line through the origin has gradient {{=1}}.

```mc
prompt: Which graph shows $y = -x + 2$?
(x) graph: line y = -x + 2
( ) graph: line y = x + 2 :: That line rises — check the sign of the gradient.
( ) graph: line y = -x - 2 :: Check where it crosses the y-axis.
```

```match
prompt: Match each line to its gradient.
y = 3x - 1 = 3
$y = -2x + 5$ = $-2$
y = 0.5x + 2 = m \= 0.5
graph: line y = x + 1 -> 1
![A flat horizontal line](https://placehold.co/120x60?text=flat+line) = 0
y = 4 = 0
= 2
-> -3
hint: The gradient is the number multiplying x.
solution: In $y = mx + c$ the gradient is $m$; a horizontal line has gradient 0.
```

```correspond
prompt: Match each equation to its graph and its description.
columns: Graph | Description
y = 2x | graph: line y = 2x | rises through the origin
y = -x + 4 | graph: line y = -x + 4 | falls, crossing the y-axis at 4
y = 3 | graph: line y = 3 | horizontal
$y = |x - 3|$ | graph: curve y = abs(x - 3) | V-shape with its lowest point at (3, 0)
| | falls steeply through the origin
solution: The number multiplying x tells you whether the line rises or falls; the constant tells you where it crosses the y-axis.
```

```numberline
prompt: Solve $2x - 1 \ge 5$ and graph the solution.
answer: x >= 3
axis: -2..8 step 1
solution: Add 1 to get $2x \ge 6$, then divide by 2: $x \ge 3$. Closed dot at 3, ray to the right.
```

```numberline
prompt: Graph all numbers that are at least $-2$ but less than $5$.
answer: -2 <= x < 5
axis: -10..10 step 2
solution: "At least" includes $-2$ (closed dot); "less than" leaves out 5 (open dot).
```

```numberline
prompt: Plot both solutions of $x^2 = 9$.
answer: -3, 3
solution: $3 \times 3 = 9$ and $(-3) \times (-3) = 9$.
```

## Part 3: Area and volume {checkpoint}

```figure
alt: Right-angled triangle ABC with base AB = 8 cm and height BC = 5 cm
caption: Fig 1
point (0,0) "A"
point (8,0) "B"
point (8,5) "C"
polygon A B C
side AB "8 cm"
side BC "5 cm"
angle ABC right
angle BAC "x"
```

The area of triangle ABC is {{=20 unit: cm², sq cm | ?Half of base times height. | !unit-missing :: Right number — now add the unit. | !unit-wrong :: Area is measured in square units. :: mis.area.wrong-unit | !40 :: You forgot to halve.}}

```figure
alt: Trapezium PQRS with parallel sides PQ = 6 cm and SR = 10 cm and a dashed height of 4 cm
point (2,4) "P"
point (8,4) "Q"
point (10,0) "R"
point (0,0) "S"
polygon P Q R S
side PQ "6 cm"
side SR "10 cm"
segment (2,4) (2,0) dashed
text (2.7,2) "4 cm"
parallel PQ SR
angle QRS
```

The area of trapezium PQRS is {{=32 unit: cm² | !unit-missing :: Include the unit. | !64 :: Remember the half in the formula.}}

```figure
alt: Arrowhead ABCD with sides AB and BC marked equal and sides AD and CD marked equal, drawn to scale
point (0,0) "A"
point (4,2) "B"
point (8,0) "C"
point (4,6) "D"
polygon A B C D
ticks AB 1
ticks BC 1
ticks AD 2
ticks CD 2
angle ABC reflex
angle ADC
to scale
```

Estimate the reflex angle at B, to the nearest $10°$: {{=230 +- 10}}°

```figure
alt: A cuboid 4 cm long, 2 cm deep and 3 cm high, divided into unit cubes
cuboid 4 2 3 cm units
hidden: off
```

The volume of the cuboid is {{=24 unit: cm³ | !unit-missing :: Volume needs a unit. | !unit-wrong :: Volume is measured in cubic units.}}

The total surface area of the cuboid is {{=52 unit: cm² | ?Add the areas of all six faces. | !26 :: You only counted three of the six faces.}}

```figure
alt: Rectangle WXYZ on a coordinate grid with corners at (1,1), (5,1), (5,4) and (1,4)
caption: Grid
plane: on
axes: -1..7, -1..6
point (1,1) "W"
point (5,1) "X"
point (5,4) "Y"
point (1,4) "Z"
region W X Y Z
segment W Y dashed arrow
```

The shaded rectangle has area {{=12}} square units.

Complete the table of rectangles.

| Length (cm) | Width (cm) | Area (cm²) |
|---:|---:|---:|
| 6 | 4 | {{=24}} |
| 9 | {{=5 | ?Area divided by length}} | 45 |
| $x$ | 3 | {{==3x | !x3 :: Write the number in front of the letter.}} |
| 2.5 | 4 | {{=10 | !6.5 :: Multiply, do not add.}} |

```columns
figure:
alt: Isosceles triangle PQR with sides PQ and QR marked equal and angle QPR = 53°
point (0,0) "P"
point (3,4) "Q"
point (6,0) "R"
polygon P Q R
ticks PQ 1
ticks QR 1
angle QPR 53°
---
options: unruled
By its sides, PQR is an {{isosceles}} triangle.
Angle QRP is {{=53}}°.
Angle PQR is {{=74 | ?Angles in a triangle add to 180°.}}°.
```

```photo
prompt: A garden is an L-shape made of a 10 m by 4 m rectangle and a 3 m by 3 m square. Find its area. Show every step, then photograph your working.
photos: 2
rubric: Splits the shape correctly | 1
rubric: Correct areas of the parts | 1
rubric: Correct total with units | 1
answer: $10 \times 4 = 40$ and $3 \times 3 = 9$
Total area = 49 m²
solution: Split the L into a rectangle and a square, find each area, then add them.
```

```callout
variant: warning
Double-check your units before you press Check: area is in square units, volume in cubic units.
```

## Part 4: Ratio {checkpoint}

Simplify $12 : 18$ to {{=2}} : {{=3}}.

Share 40 lollies in the ratio $3 : 5$. One person gets {{=15}} and the other gets {{=25 | ?Find one part first: 40 divided by 8.}}

A cyclist rides 45 km in 2.5 hours. Their average speed is {{=18 +- 0.1 unit: km/h, kph | !unit-missing :: Give the unit as well. | !unit-wrong :: Speed here is kilometres per hour. | !112.5 :: Divide distance by time, do not multiply.}}

A map uses the scale $1 : 50\,000$. A 3 cm line on the map is {{=1.5 unit: km, kilometres | !unit-missing :: How far is it in real life? Add the unit.}} in real life.

1.5 km is the same as {{=1500 unit: m, metres}}.

A recipe uses 200 g of flour and 3 eggs per batch. Complete the table.

| Batches | Flour (g) | Eggs |
|---:|---:|---:|
| 1 | 200 | 3 |
| 2 | {{=400}} | {{=6}} |
| 5 | {{=1000 | !205 :: You added instead of multiplying.}} | {{=15}} |
| {{=4 | ?Eggs divided by 3}} | 800 | 12 |

```mc
prompt: Select all the ratios equivalent to $3 : 4$.
[x] 6 : 8
[ ] 4 : 3 :: Order matters in a ratio.
[x] 15 : 20
[ ] 5 : 6 :: Adding the same number to both parts changes the ratio.
```

```mc
prompt: Each grid square is 1 cm². Which shape has an area of 16 cm²?
options: keep-order
(x) ![A 4 by 4 square](https://placehold.co/120x120?text=4+by+4)
( ) ![A 2 by 6 rectangle](https://placehold.co/180x60?text=2+by+6) :: That has an area of 12 cm².
( ) A 3 by 5 rectangle :: That has an area of 15 cm².
( ) None of the above :: One of the shapes does work.
```

```match
prompt: Match each ratio to its simplest form.
6 : 9 = 2 : 3
10 : 4 = 5 : 2
8 : 12 = 2 : 3
15 : 25 -> 3 : 5
= 3 : 2
-> 1 : 2
solution: Divide both parts by their highest common factor. 6 : 9 and 8 : 12 both simplify to 2 : 3.
```

```shortanswer
prompt: Mia says $4 : 6$ and $6 : 9$ are equivalent ratios. Is she right? Explain.
starter: Mia is … because…
rubric: Correct decision | 1 | She is right
rubric: Clear reason | 2 | Both simplify to 2 : 3, or both are multiples of 2 : 3
answer: Yes, Mia is right.
$4 : 6 = 2 : 3$ (divide by 2) and $6 : 9 = 2 : 3$ (divide by 3).
solution: Simplify both ratios. If they reach the same simplest form, they are equivalent.
```

```callout
variant: success
Nice work if you got this far — two parts to go.
```

## Part 5: Transformations {checkpoint}

```graph
axes: -6..6, -6..6
prompt: Reflect triangle ABC in the mirror line $x = 1$. Plot A', B' and C'.
alt: Triangle ABC to the right of a vertical dashed mirror line
show: point (2,1) "A"
show: point (5,1) "B"
show: point (3,4) "C"
show: polygon A B C
show: line x = 1 dashed
answer: (0,1), (-3,1), (-1,4)
mistake: (-3,1), (0,1), (-2,4) :: That is a slide, not a flip. :: mis.reflect.translates
```

```graph
axes: -6..6, -6..6
prompt: Rotate triangle ABC $90°$ anticlockwise about O. Plot A', B' and C'.
alt: Triangle ABC in the first quadrant and a labelled centre point O at the origin
show: point (0,0) "O"
show: point (1,1) "A"
show: point (3,1) "B"
show: point (1,2) "C"
show: polygon A B C
show: text (4,-1) "centre O"
answer: (-1,1), (-1,3), (-2,1)
mistake: (1,-1), (1,-3), (2,-1) :: That is clockwise. Anticlockwise turns the other way.
```

```graph
axes: -6..6, -6..6
prompt: Translate triangle ABC by the vector shown by the arrow. Plot A', B' and C'.
alt: Triangle ABC in the top left and a dashed arrow
show: point (-4,3) "A"
show: point (-2,3) "B"
show: point (-2,5) "C"
show: polygon A B C
show: segment (-5,0) (-1,-2) arrow dashed
answer: (0,1), (2,1), (2,3)
mistake: (-4,1), (-2,1), (-2,3) :: You moved it down but not across.
```

```graph
prompt: Draw the vector that moves a shape 3 right and 2 down.
answer: vector 3, -2
mistake: vector -3, 2 :: Check which way it points.
mistake: vector -2, 3 :: Across first, then up or down.
```

```graph
axes: -6..6, -6..6
prompt: Translate $y = x^2$ 3 units right and 2 units down. Drag the curve, then type the new equation.
start: y = x^2
answer: y = (x - 3)^2 - 2
options: type-equation
mistake: y = (x + 3)^2 - 2 :: A shift right means subtracting inside the bracket.
mistake: drawn-not-written :: Your curve is right — now type its equation.
mistake: written-not-drawn :: Your equation is right — now drag the curve to match it.
```

```columns
figure: A
alt: A shaded triangle above and right of the origin, an unshaded triangle below and left of it, and a dashed vertical line through the origin
plane: on
point (1,1) "A"
point (3,1) "B"
point (1,3) "C"
region A B C
point (-1,-1) "D"
point (-3,-1) "E"
point (-1,-3) "F"
polygon D E F
segment (0,-4) (0,4) dashed
---
figure: B
alt: A shaded triangle right of a dashed vertical line through the origin and an unshaded triangle left of it at the same height
plane: on
point (1,1) "A"
point (3,1) "B"
point (1,3) "C"
region A B C
point (-1,1) "D"
point (-3,1) "E"
point (-1,3) "F"
polygon D E F
segment (0,-4) (0,4) dashed
---
figure: C
alt: A shaded triangle right of a dashed vertical line through the origin and an unshaded triangle further left at the same height
plane: on
point (1,1) "A"
point (3,1) "B"
point (1,3) "C"
region A B C
point (-4,1) "D"
point (-2,1) "E"
point (-4,3) "F"
polygon D E F
segment (0,-4) (0,4) dashed
```

```mc
prompt: Which diagram shows a reflection in the dashed line?
options: keep-order
( ) A :: That is a half turn about the origin, not a flip.
(x) B
( ) C :: That is a slide — the shape has not been flipped.
```

```callout
variant: note
A reflection flips a shape, a rotation turns it, and a translation slides it. Only an enlargement changes its size.
```

## Part 6: Data {checkpoint}

```dataplot
prompt: The goals scored by a netball team in 8 games were recorded. Make a dot plot of the data.
data: 3, 5, 5, 6, 8, 8, 8, 9
answer: dotplot
solution: Put one dot above each value; 8 gets three dots and 5 gets two.
```

```dataplot
prompt: These are your eight test scores. Make a histogram of them.
data: {scores}
axis: 50..100 step 10
answer: histogram
solution: Count how many scores fall in each band of 10, then draw a bar of that height for each band.
```

Your test scores are {scores}. Their mean is {{=mean(scores) +- 0.01}} and their range is {{=max(scores) - min(scores)}}.

```dataplot
prompt: Nine students timed how long, in minutes, they spent on homework. Make a box plot of the data.
data: 12, 15, 17, 18, 20
data: 22, 25, 27, 30
axis: 10..32 step 2
answer: boxplot tolerance 1
solution: The minimum is 12, the median is 20 and the maximum is 30; find the quartiles from each half of the data.
```

The median homework time is {{=20}} minutes and the range is {{=18 | !12 :: That is the minimum, not the range.}} minutes.

```dataplot
prompt: This box plot shows the number of pets owned by students in a class.
data: 4, 6, 7, 7, 9, 10, 12, 15
show: boxplot
```

The range of the pet data is {{=11}}.

```chart
type: bar
title: Favourite sport in class 8B
xlabel: Sport
ylabel: Number of students
categories: Rugby, Football, Netball, Basketball, Cricket
series: 8, 5, 6, 4, 3
y: 0..10 step 2
alt: A bar chart of the favourite sports of 26 students.
```

More students chose rugby than cricket, by {{=5}}.

The fraction of the class who chose netball, in simplest form, is {{===3/13 | !form-wrong :: That is right, but simplify the fraction.}}

```chart
type: clustered
title: How students got to school each day
xlabel: Day
ylabel: Number of students
categories: Mon, Tue, Wed, Thu, Fri
series: Walk = 12, 7, 15, 9, 4
series: Bus = 4, 6, 3, 5, 2
```

On Monday, the ratio of walkers to bus riders in simplest form is {{=3}} : {{=1}}.

```chart
type: stacked
title: Hot and cold lunches sold
xlabel: Day
ylabel: Lunches sold
categories: Mon, Tue, Wed
series: Hot = 20, 15, 25
series: Cold = 10, 20, 5
```

The total number of lunches sold on Tuesday was {{=35}}.

```chart
type: line
title: Average monthly temperature in our town
xlabel: Month
ylabel: Temperature (°C)
categories: Jan, Feb, Mar, Apr, May, Jun
series: 22, 23, 20, 17, 13, 10
```

The temperature fell by {{=13 unit: °C | !unit-missing :: Add the unit, °C.}} from February to June.

## Part 7: Explain your thinking {checkpoint}

```essay
prompt: A friend says, "Mean, median and range all tell you the same thing about a data set." Do you agree? Use the homework data from Part 6 in your answer.
starter: I agree / disagree because…
words: 80-150
rubric: Clear position | 1
rubric: Correct meaning of each measure | 3 | Mean = average, median = middle, range = spread
rubric: Uses the homework data | 2 | Quotes the median of 20 or range of 18
answer: Disagree. The mean and median measure the centre; the range measures spread.
For the homework data the median is 20 minutes but the range is 18 minutes, which tells you something different.
solution: Centre and spread are different ideas: two data sets can share a median but have very different ranges.
```

```shortanswer
prompt: Explain why $2(x + 3)$ and $2x + 6$ always have the same value.
rubric: Uses expanding or the distributive law | 2
answer: Multiplying out the bracket gives $2 \times x + 2 \times 3 = 2x + 6$, so they are the same expression.
```

```teacher-guide
## Purpose
A deliberately broad stress test of the term: equations, graphing, area, ratio, transformations and data. A strong student takes about 40 minutes; most classes will need longer.
## Sequence
- Part 1 starts with a **worked example**, then a faded one, then independent practice — let students study the worked example before starting.
- Parts 2–6 each end with a Check, so students get feedback in chunks.
- Part 7 is teacher-graded; read the essays before the next lesson.
## Watch for
- Dividing before subtracting in two-step equations (e.g. writing $x = 5.5$ for $2x + 3 = 11$).
- Writing coordinates as (y, x).
- Forgetting the half in triangle and trapezium areas, and leaving off units.
- Confusing clockwise and anticlockwise, and treating a translation as a reflection.
- Mixing up range with the minimum or maximum.
## If time is short
- Cut the stacked and line charts in Part 6 and the essay in Part 7.
- The seeded questions (`{a}`, `{p}`, `{scores}`) differ per student, so answers cannot be copied.
```
