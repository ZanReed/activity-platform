# S2 Leak Test Fixture

Every block type that carries an answer key, so the wire scan has something to catch.
Paste this whole file into the app's **Import markdown** dialog, then publish, then re-run
verify-content-path.js against the published activity.

## Blanks {checkpoint}

The capital of France is {{Paris|paris}} and two plus two is {{=4}}.

Simplify: {{==2a}} — and here is one with help {{7 | ?Count the sides | !6 :: You missed one.}}

Factor the pair in any order: {{~3}} and {{~5}}.

$$ x = \gap{5} + 2 $$

## Multiple choice

```mc
prompt: What is $2 + 2$?
( ) 3 :: Check your addition.
(x) 4
( ) 22 :: You concatenated instead of adding.
solution: Add the ones column.
```

## Matching

```match
prompt: Match each equation to its slope.
y = 2x -> 2
y = -x -> -1
-> 0
solution: Read the slope off the x coefficient.
```

## Ordering

```order
prompt: Put the steps for solving $2x + 3 = 11$ in order.
1. Subtract 3 from both sides
2. Divide both sides by 2
3. Check the solution
solution: Undo the addition before the multiplication.
```

## Graph

```graph
axes: -10..10, -10..10
prompt: Graph the inequality.
answer: y > 2x + 1
mistake: y = x + 2 :: The number multiplying x is the slope.
options: partial-credit, allow-no-solution
```

## Number line

```numberline
prompt: Graph the solution set.
answer: -2 <= x < 5
solution: Closed dot at -2, open at 5.
```

## Written responses

```shortanswer
prompt: Explain why the sum of two even numbers is even.
starter: The sum is even because…
rubric: Correct reasoning | 3 | Uses that an even number is 2k
rubric: Clear explanation | 2
```

```essay
prompt: Argue whether zoos do more good than harm.
words: 200-300
rubric: Thesis | 3
rubric: Evidence | 5 | Cites at least two examples
```

## Faded example

```faded
title: Guided practice
Start with $3x = 12$.
Divide both sides by {{3}}.
So $x = ${{4}}.
```
