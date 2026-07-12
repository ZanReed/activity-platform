# Markdown import format

The reference for the **Import from markdown** feature: paste Markdown into the editor (the **Import markdown** button in an activity's header) and it becomes editable activity blocks. This page is written for two audiences:

1. **Teachers** writing or pasting Markdown by hand.
2. **AI assistants** — the importer is built to consume model-generated Markdown, so this format is the contract a model writes to. The same format is the planned transcription target for [PDF import](design/pdf-import.md); investing in a clear spec here pays off there too.

The importer is deterministic, additive, and never destructive: anything it doesn't understand is flattened to plain text with a visible warning, never dropped silently and never able to corrupt the document. The authoritative behavior lives in [`packages/app/src/lib/markdownToTiptap.ts`](../packages/app/src/lib/markdownToTiptap.ts); this page mirrors it.

> **Shortcut:** the Import dialog has a **Copy AI prompt** button that copies the [prompt block below](#prompt-to-paste-into-an-ai-assistant) to your clipboard. Paste it into ChatGPT or Claude, then describe the activity you want.

## Quick reference

| You write | You get |
|---|---|
| `#`, `##`, `###` | Heading levels 1–3 (`####`+ clamp to 3) |
| a blank line between blocks | separate blocks — this is how you separate problems |
| `**bold**`, `*italic*`, `` `code` `` | text formatting |
| `-` / `*` / `+` lists, `1.` lists, indent to nest | bullet / ordered lists |
| `{{answer}}` | a fill-in-the-blank with that answer |
| `{{answer\|alt1\|alt2}}` | a blank whose alternates after `\|` are also accepted |
| `{{~answer}}` | a blank interchangeable with the one before it — answers count in any order |
| `{{=answer}}` | a **numeric** blank — equivalent forms (`0.5`, `1/2`, `.50`) all count |
| `{{=answer +- tol}}` | a numeric blank accepting answers within ± `tol` |
| a paragraph containing `{{…}}` | a **fill-in-the-blank problem block** |
| a list whose items contain `{{…}}` | **one problem block per item** |
| `## Topic {checkpoint}` | a **checkpoint section break** titled "Topic" |
| a ` ```numberline ` fenced block | a **1-D number-line question** — plot points, or graph an inequality (see below) |
| a ` ```dataplot ` fenced block | a **statistics-chart question** — dot plot, histogram, box plot (see below) |
| a ` ```mc ` fenced block | a **multiple-choice question** (see below) |
| a ` ```match ` fenced block | a **matching question** (see below) |
| a ` ```order ` fenced block | an **ordering question** (see below) |
| a ` ```objectives ` fenced block | a **learning-objectives list** (see below) |
| a ` ```worked ` fenced block | a **worked example** to study (see below) |
| a ` ```faded ` fenced block | a **faded worked example** — shown steps + fill-in steps (see below) |
| a ` ```explain ` fenced block | an **ungraded self-explanation** prompt (see below) |
| `$x^2$` | inline math |
| `$$ … $$` on its own paragraph | a display math block |
| `![alt](https://url)` | an image block |

## Rules that matter

- **Separate every problem (and every block) with a blank line.** Consecutive non-blank lines are one paragraph in Markdown, so they merge into a single block. One blank line = a new block.
- **Blanks only work in paragraphs and list items.** A `{{…}}` inside a heading stays literal text (headings can't hold blanks).
- **A blank needs at least one character.** `{{}}` is treated as literal text, not a blank. Put a real answer in the braces.
- **Order-independent blanks (`~`).** A leading tilde on a blank — `{{~3}}` — marks it interchangeable with the blank just before it in the same problem. For factoring, `(x + {{2}})(x + {{~3}})` accepts 2 and 3 in either order but rejects 2 and 2, because each correct answer can satisfy only one blank. The `~` belongs on the second (and later) blanks of a group; on a problem's first blank it has no effect.
- **Numeric blanks (`=`).** A leading equals sign — `{{=12}}` — makes the blank numeric: the student's entry is parsed as a number and every equivalent form counts (`0.5`, `1/2`, `.50`, `1 1/2`, `1,234`, `$3.50`). An optional trailing `+- tol` (or `± tol`) accepts anything within that absolute tolerance: `{{=3.14 +- 0.01}}`. Combine with the tilde as `{{~=3}}` (tilde first). Prefer numeric blanks for any purely numeric answer — with a plain `{{0.5}}` a student typing `1/2` is marked wrong.
- **A list of problems flattens.** If each item of a numbered or bulleted list contains a blank, the list becomes one problem block per item (the editor re-numbers them). A list with no blanks stays an ordinary list.
- **Display math must stand alone.** `$$…$$` becomes a block-level equation only when it is its own paragraph (blank line above and below). Inline `$…$` can appear anywhere in a line.
- **Inline math has a guard.** A lone `$` or currency like `$5 and $10` is *not* treated as math — only a properly closed `$…$` with no space just inside the delimiters.
- **Write real LaTeX in math.** Backslash commands (`\frac`, `\sum`, `\int`, `\,`) are preserved exactly.
- **Image URLs must be absolute** (`https://…`). A relative or empty URL is skipped with a warning.
- **Wrapping the model's reply in a code fence is fine — recommended, even.** Asking the model to put its whole response inside a fenced code block is how you get a **Copy** button and the *raw* (unrendered) Markdown instead of a formatted preview you can't paste. The Copy button hands you the contents *without* the ```` ``` ```` lines, so the importer never sees the fence. As a safety net, a paste that is entirely wrapped in a ```` ```markdown ```` fence is unwrapped automatically on import. (A plain ```` ``` ```` code block in the *middle* of your content is still treated as a code block and flattened — only outer fences are stripped.)

## Not supported (degrades to plain text, with a warning)

Tables, fenced/indented code blocks, blockquotes, raw HTML, links (the link text is kept, the URL dropped), and strikethrough. These import as plain paragraphs/text and surface a note in the dialog so you can fix them by hand. (Callouts, columns, and images-or-lists *inside* a worked/faded example have no Markdown round-trip yet — author those in the editor.)

## Worked example

Input:

```markdown
# Cell Biology {checkpoint}

The powerhouse of the cell is the {{mitochondria}}.

1. Water is made of hydrogen and {{oxygen|O2}}.
2. The area of a triangle is $\frac{1}{2}bh$, so for b = 6, h = 4 the area is {{12}}.

$$E = mc^2$$

![a labelled cell diagram](https://example.com/cell.png)
```

Becomes: a **checkpoint section** titled "Cell Biology", a **fill-in-the-blank** problem (answer `mitochondria`), **two more problems** from the numbered list (one accepting `oxygen` or `O2`, one with inline math and answer `12`), a **display equation**, and an **image block**.

## Prompt to paste into an AI assistant

This is the exact text behind the dialog's **Copy AI prompt** button. Paste it into ChatGPT/Claude, then describe the activity you want:

```text
You are writing a classroom activity that I will import by pasting Markdown.
Put your ENTIRE reply inside a single fenced code block — begin and end it
with a line of three backtick characters — and write nothing outside it. That
makes this chat show a Copy button, so I get the raw Markdown instead of a
rendered preview. Inside that block, follow these rules exactly.

STRUCTURE
- Headings use #, ##, ### (three levels only).
- Put a blank line between every block. Each problem must be its own
  paragraph separated by a blank line — lines that touch merge into one block.
- To start a new checkpoint section, end a heading with {checkpoint}:
  ## Part 2 {checkpoint}

FILL-IN-THE-BLANK
- Wrap each answer in double curly braces:  The capital of France is {{Paris}}.
- Offer alternate accepted answers with vertical bars:  made of hydrogen and {{oxygen|O2}}.
- When two blanks may be answered in either order (e.g. factoring), mark the
  second one with a leading tilde:  (x + {{2}})(x + {{~3}}). Each answer still
  counts once, so 2 and 3 in either order is right but 2 and 2 is not.
- Always put a real answer inside the braces (an empty {{}} is ignored).
- For a NUMERIC answer, put = right after the braces:  the area is {{=12}}.
  Numeric blanks accept every equivalent form — 0.5, 1/2, .50, and 1,234
  all count — so prefer them for any purely numeric answer. Add a tolerance
  with +- at the end:  pi is about {{=3.14 +- 0.01}}. Combine with the
  tilde as {{~=3}}.
- Blanks work only in normal paragraphs and list items — never inside a heading.
- A numbered or bulleted list whose items each contain a blank becomes one
  problem per item — a clean way to write a problem set.

MATH (write real LaTeX)
- Inline math between single dollar signs:  the area is $\frac{1}{2}bh$
- A displayed equation on its own line, with a blank line above and below:

  $$\int_0^1 x\,dx = \frac{1}{2}$$

GRAPHS (a fenced block with the `graph` tag becomes a coordinate-plane question)
- ```graph … ``` with one statement per line:
    axes: -10..10, -10..10        (optional; this is the default window)
    prompt: Graph the inequality.
    answer: y > 2x + 1
    options: partial-credit, allow-no-solution
- The answer line takes ANY equation format (y = 2x + 3, 2x + 3y = 6,
  y - 5 = 2(x - 1), x^2 - 4, x = 4), an inequality (the <, <=, >, >= sign
  sets the dotted/solid boundary and the shaded side), a point list like
  (2, 3), (4, 5), a ray or segment like ray (1, 2) through (3, 4) open or
  segment (1, 2) to (3, 4) (open/closed set each endpoint style, default
  closed), a region like region (0,0), (4,0), (2,4), or the word none for
  a "cannot be graphed" trick question. Supported answer curves: linear,
  quadratic, exponential, logarithmic, and vertical lines.
- The prompt line may include inline math: prompt: Graph $y = 2x + 3$.
- Optional targeted feedback for an anticipated wrong answer (repeatable):
    mistake: y = x + 2 :: Remember - the number multiplying x is the slope.
    mistake: (4, 3) :: Coordinates are (x, y) - x comes first.
    mistake: segment (1, 2) to (3, 4) :: Think about whether the graph should stop or keep going.
- For an ungraded figure, use show: lines instead of an answer:
    show: point (2, 3) closed "A"
    show: line y = x dashed      (dotted works too)
    show: line y > 2x + 1 for x >= 0   (inequalities shade; domains clip)
    show: expression sin(x)      (plots any formula)
    show: ray (0,0) (2,1) open

NUMBER LINES (a fenced block with the `numberline` tag becomes a 1-D number-line question)
- ```numberline … ``` with one statement per line:
    prompt: Graph $x \ge -2$.
    answer: x >= -2
- answer: is EITHER a point (or comma-separated points) the student plots —
  answer: -3, 4 — OR an inequality the student graphs as an interval/ray:
    answer: x >= 3        (a ray from 3 to the right, closed dot)
    answer: x < 5         (a ray to the left, open dot)
    answer: -2 <= x < 5   (a bounded interval)
  >= and <= draw a closed (filled) endpoint; > and < draw an open one.
- axis: -10..10 step 2 (optional) sets the window and tick step; left out,
  the axis fits the answer automatically.
- Optional lines:  solution: <worked explanation>   and   options: confidence

DATA PLOTS (a fenced block with the `dataplot` tag becomes a statistics-chart question)
- ```dataplot … ``` with one statement per line:
    prompt: Make a dot plot of the data.
    data: 3, 5, 5, 6, 8
    answer: dotplot
- data: lists the dataset (commas or spaces; repeat the line to continue a
  long dataset). The correct chart is COMPUTED from the data — never try
  to describe the chart itself.
- answer: dotplot, histogram, or boxplot makes a graded build (the student
  constructs that chart of the data). Use show: instead of answer: for a
  static ungraded chart the student just reads:  show: boxplot
- axis: 0..20 step 5 (optional) sets the number-line window and tick step;
  left out, the axis fits the data automatically. For a histogram the step
  is also the bar (bin) width.
- A boxplot answer may add how close each of the five handles must be:
  answer: boxplot tolerance 1   (default 0.5).
- Optional lines:  solution: <worked explanation>   and   options: confidence

MULTIPLE CHOICE (a fenced block with the `mc` tag becomes a multiple-choice question)
- ```mc … ``` with one statement per line:
    prompt: What is $2 + 2$?
    ( ) 3 :: Check your addition.
    (x) 4
    ( ) 22
- Mark the correct choice with (x); a plain ( ) is a wrong choice. Use
  square brackets [x] / [ ] instead for a "select all that apply" question
  (marking more than one (x) also makes it multi-select automatically).
- Optional feedback after :: on any choice is shown to a student who picks it.
- Optional lines:  solution: <worked explanation>   and   options: confidence
- Choice text and the prompt may include $inline$ math.
- A choice may carry an image, shown below its text:  (x) ![a square](https://…)
  — the choice text may be the image alone.

MATCHING (a fenced block with the `match` tag becomes a matching question)
- ```match … ``` with one pair per line, written item = correct option:
    prompt: Match each equation to its slope.
    y = 2x = 2
    y = -x = -1
    = 0
- The LAST " = " on the line splits the pair, so equation items keep their
  equals signs (write \= for a literal equals, or use " -> " as the
  separator instead:  y = 2x -> 2).
- A line starting with = (or ->) adds an extra wrong option (a distractor).
- Students see the options shuffled and lettered automatically — never write
  the letters yourself.
- Optional lines:  solution: <worked explanation>   and   options: confidence
  (add options: reuse when several items share one option, e.g. classifying).
- Either side may include $inline$ math or an image ![alt](https://…).

ORDERING (a fenced block with the `order` tag becomes a put-in-order question)
- ```order … ``` with one item per line, LISTED IN THE CORRECT ORDER
  (students see them shuffled and drag them back into sequence):
    prompt: Put the steps for solving $2x + 3 = 11$ in order.
    1. Subtract 3 from both sides
    2. Divide both sides by 2
    3. Check the solution
- Leading numbers like "1." are optional decoration — the listed order is
  what counts.
- Optional lines:  solution: <worked explanation>   and   options: confidence

LEARNING OBJECTIVES (a fenced block with the `objectives` tag becomes a goals list)
- ```objectives … ``` with one objective per line:
    title: Today's goals        (optional; defaults to "Learning objectives")
    Solve two-step linear equations
    Graph a line from its equation
- A leading list marker (-, *, 1.) is fine — it is stripped. $inline$ math ok.

WORKED EXAMPLE (a fenced block with the `worked` tag becomes a boxed example to study)
- ```worked … ``` with an optional title: line, then one block per line:
    title: Solving $2x + 3 = 11$   (optional)
    Subtract 3 from both sides.
    $$2x = 8$$
    Divide by 2.
    $$x = 4$$
- Each line is its own block: a line that is only $$…$$ becomes a displayed
  equation, every other line becomes a paragraph. Lists and images inside an
  example are not supported here — add those in the editor.

FADED WORKED EXAMPLE (a `faded` fenced block is a guided example the student completes)
- ```faded … ``` is written just like ```worked, but any line containing a
  {{blank}} becomes a step the STUDENT fills in:
    title: Guided practice        (optional)
    Subtract 3 from both sides.
    $$2x = 8$$
    x = {{4}}
- Show the first steps, then fade (blank) the later ones. Blanks use the same
  {{answer|alt}} / {{=numeric}} grammar as fill-in-the-blank.

SELF-EXPLANATION (an `explain` fenced block is an ungraded free-text reflection)
- ```explain … ``` — the prompt text, plus an optional sentence starter:
    Why did you subtract 3 from both sides?
    starter: I subtracted 3 because…
- Ungraded: the student writes an answer for you to read; there is no key.

OTHER
- Bold **like this**, italic *like this*, inline code `like this`.
- Images:  ![a short description](https://full-image-url)
- Don't use tables, blockquotes, links, or any code block inside the activity
  other than ```graph, ```numberline, ```dataplot, ```mc, ```match, ```order,
  ```objectives, ```worked, ```faded, and ```explain — only the single outer
  block that wraps the whole reply and those fences are allowed; anything
  unsupported imports as plain text.

When I describe the activity I want, reply with only that single code block.
```

> Keep this block in sync with `MARKDOWN_IMPORT_AI_PROMPT` in [`packages/app/src/lib/markdownImportPrompt.ts`](../packages/app/src/lib/markdownImportPrompt.ts) and the converter rules in `markdownToTiptap.ts`.

## Graph blocks (```graph fence)

A fenced code block with the `graph` language tag becomes an interactive-graph block. One statement per line; equations accept ANY format (the same freeform parser as the editor's Answer field).

```
```graph
axes: -10..10, -10..10
prompt: Graph the inequality.
answer: y > 2x + 1
options: partial-credit, allow-no-solution
```⠀
```

- `axes: xMin..xMax, yMin..yMax` (optional; defaults -10..10 each way).
- `prompt:` the question text (optional). Accepts `$inline$` math with the same currency guard as body text; `{{…}}` blanks stay literal here.
- `mistake:` (repeatable) an anticipated wrong answer + targeted feedback, separated by `::` — e.g. `mistake: y = x + 2 :: Remember - the number multiplying x is the slope.` The wrong answer uses the same syntax as `answer:`; on a ray/segment question either figure matches (the classic ray mistake is its segment version).
- `answer:` ONE of — an equation (`y = 2x + 3`, `2x + 3y = 6`, `x^2 - 4`, `x = 4`); an inequality (`y > 2x + 1`, `x <= 3` — the sign sets dotted/solid + shaded side); a point list (`(2, 3), (4, 5)`); a ray or segment (`ray (1, 2) through (3, 4) open`, `segment (1, 2) to (3, 4) open closed` — `open`/`closed` set endpoint styles, default closed); `region (0,0), (4,0), (2,4)`; or `none` (a "cannot be graphed" trick question). Domain clauses (`… for x >= 0`) are no longer accepted — write a ray or segment instead.
- `show:` display drawables (no answer lines → a static display graph): `point (x, y) [open|closed] ["label"]`, `line <equation or inequality> [dashed|dotted]`, `expression <any formula> [dashed|dotted]`, `segment (a,b) (c,d)`, `ray (a,b) (c,d) [open|closed]`, `region (x,y), …`.
- `options:` `partial-credit`, `allow-no-solution`, `no-solution-correct`.

A malformed graph block imports as plain text with a warning, never silently guessing.

## Number-line blocks (```numberline fence)

A fenced code block with the `numberline` language tag becomes a number-line (1-D) block — the student plots points, or graphs an inequality as an interval/ray. One statement per line:

```
```numberline
prompt: Graph the solution set.
answer: -2 <= x < 5
options: confidence
```⠀
```

- `answer:` **required**, and is ONE of:
  - **Points** — bare numbers, comma- or space-separated: `answer: -3, 4` (the student plots each). Scored consume-once, all-or-nothing.
  - **An inequality** → an interval or ray. A single inequality gives a ray: `x >= 3` (min 3, closed, extends right), `x < 5` (max 5, open, extends left). A compound inequality gives a bounded interval: `-2 <= x < 5`. `>=`/`<=` draw a **closed** (filled) endpoint, `>`/`<` an **open** one. The variable may be on either side (`3 < x` ≡ `x > 3`).
- `axis: -10..10 step 2` (optional) — the window and tick step (step optional, default 1). Left out, the window auto-fits the answer values (padded a step each side so points and endpoints aren't jammed at the edge, and a ray visibly extends). An answer value outside an *explicit* window imports with a warning (the student couldn't place it there).
- `prompt:` the question text (optional). Accepts `$inline$` math; `{{…}}` blanks stay literal here.
- `solution:` optional worked explanation; `options: confidence` asks for a confidence rating.
- There is **no `show:` line** — unlike the graph and data-plot fences, the number-line block has no static display mode; both interactions are graded.

A malformed number-line block imports as plain text with a warning.

## Data-plot blocks (```dataplot fence)

A fenced code block with the `dataplot` language tag becomes a data-plot (statistics chart) block — a dot plot, histogram, or box plot. One statement per line:

```
```dataplot
prompt: Make a dot plot of the data.
data: 3, 5, 5, 6, 8
answer: dotplot
options: confidence
```⠀
```

- `data:` the dataset — numbers separated by commas or spaces. **Required.** Repeat the line to continue a long dataset (the values append). The correct chart is **computed from the data** (the block's single source of truth) — there is no hand-authored answer chart.
- `answer:` ONE of `dotplot`, `histogram`, `boxplot` — a **graded build**: the student constructs that chart of the data ("dot plot" / "box-plot" spellings are tolerated). A box-plot answer takes an optional trailing tolerance — `answer: boxplot tolerance 1` — how close each five-number-summary handle must be, in line units (default 0.5; the key uses the TI-84 exclusive-median method).
- `show:` the same three chart names — a **static, ungraded chart** the student reads (pair it with a sibling question). Exactly one of `answer:`/`show:` per block.
- `axis: 0..20 step 5` (optional) — the number-line window and tick step (step optional, default 1). Left out, the window auto-fits the data, rounded out to the step. For a histogram the step doubles as the bar (bin) width. Data outside an explicit window imports with a warning (it wouldn't appear on the chart).
- `prompt:` the question text (optional). Accepts `$inline$` math; `{{…}}` blanks stay literal here.
- `solution:` optional worked explanation; `options: confidence` asks for a confidence rating.

Scoring is all-or-nothing per chart (exact frequencies for dot plot/histogram; all five handles within tolerance for box plot). A malformed dataplot block imports as plain text with a warning.

## Multiple-choice blocks (```mc fence)

A fenced code block with the `mc` language tag becomes a multiple-choice question. One statement per line:

```
```mc
prompt: What is $2 + 2$?
( ) 3 :: Check your addition.
(x) 4
( ) 22
solution: Add the ones column.
options: confidence
```⠀
```

- **Choice lines**: `( )` is a wrong choice, `(x)` a correct one. Square brackets — `[ ]` / `[x]` — author a **select-all-that-apply** (multi-select) question; any square bracket, or more than one `(x)`, switches the block to multi-select (a single-answer question with two right answers would be unanswerable on radios).
- **Per-choice feedback**: append `:: feedback text` to a choice line; a student who picks that choice sees it after checking. Distractors are usually authored *because* they're anticipated mistakes — this is where the explanation goes.
- `prompt:` the question text. Both it and choice text accept `$inline$` math.
- **Per-choice images**: a markdown image — `![alt](https://…)` — anywhere in a choice's text becomes the choice's figure, rendered below the text ("which diagram shows…"). The image markdown is stripped from the text; an image-only choice is legal. An unparseable URL stays as literal text so the author notices. Per-choice *graphs* have no fence syntax — author them in the editor's choice-figure panel (nesting a graph DSL inside the mc fence isn't supported).
- `solution:` optional worked explanation revealed post-check.
- `options: confidence` asks students for a confidence rating.
- At least two choices and at least one `(x)` are required — a fence without a marked correct answer imports as plain text with a warning.

## Matching blocks (```match fence)

A fenced code block with the `match` language tag becomes a matching question. One pair per line:

```
```match
prompt: Match each equation to its slope.
y = 2x = 2
y = -x -> -1
= 0
solution: Read the slope off the x coefficient.
options: confidence
```⠀
```

- **Pair lines** — `item = correct option`. The **last** ` = ` on the line is the separator, so equation-shaped items keep their internal equals signs (`y = 2x + 1 = A` pairs `y = 2x + 1` with `A`). Escape a literal equals as `\=`, or sidestep entirely with the ` -> ` separator, which always wins when present.
- **Distractor lines** — a line starting with `=` (or `->`) adds an option that matches nothing (defeats process-of-elimination).
- **Letters are never authored.** The published page shuffles the options deterministically and letters them by position; the editor's key picker refers to options by their text for the same reason.
- **Per-side images**: `![alt](https://…)` on either side becomes that side's figure (the MC choice-image contract: stripped from the text, image-only sides legal, bad URLs stay literal). Per-side *graphs* are editor-only, like MC choice graphs.
- `options: reuse` allows several items to share one option (categorization-style); without it each option docks on at most one item.
- `options: confidence` asks students for a confidence rating; `solution:` is the optional worked explanation.
- At least two pair lines are required. Scoring is **per pair** (each item is one point).

## Ordering blocks (```order fence)

A fenced code block with the `order` language tag becomes an ordering (sequencing) question. One item per line, **listed order = correct order**:

```
```order
prompt: Put the steps for solving $2x + 3 = 11$ in order.
1. Subtract 3 from both sides
2. Divide both sides by 2
3. Check the solution
```⠀
```

- Leading list markers (`1.`, `2)`, `-`) are tolerated decoration and stripped — the listed order is the answer either way.
- Students see the items shuffled (publish-time deterministic, never the correct order) and drag them back into sequence. Scoring is **all-or-nothing** on the exact sequence.
- `solution:` and `options: confidence` as in the other fences.
- At least two item lines are required.

## Learning-objectives blocks (```objectives fence)

A fenced code block with the `objectives` language tag becomes a learning-objectives list. An optional `title:` line names it; every other non-empty line is one objective (inline `$math$` ok, leading list markers stripped).

```
```objectives
title: Today's goals
Solve two-step linear equations
Graph a line from its equation
```⠀
```

- `title:` is optional and defaults to "Learning objectives".
- At least one objective line is required; an empty fence imports as plain text.
- Pure content — no answer, never scored.

## Worked-example blocks (```worked fence)

A fenced code block with the `worked` language tag becomes a worked example (a boxed, fully-worked solution to study). An optional `title:` line; every other line is one body block — a line that is **only** `$$…$$` becomes a display-math block, every other line becomes a paragraph.

```
```worked
title: Solving $2x + 3 = 11$
Subtract 3 from both sides.
$$2x = 8$$
Divide by 2.
$$x = 4$$
```⠀
```

- `title:` optional (defaults to "Worked example").
- One block per line; **lists, images, and headings inside an example are not supported** in the fence — add those in the editor. Everything else degrades to a paragraph.
- Pure content — no answer, never scored.

## Faded-worked-example blocks (```faded fence)

A fenced code block with the `faded` language tag becomes a *faded* worked example — shown steps plus fill-in steps the student completes. Written exactly like `worked`, except any line containing a `{{blank}}` becomes a faded (fill-in-the-blank) step.

```
```faded
title: Guided practice
Subtract 3 from both sides.
$$2x = 8$$
x = {{4}}
```⠀
```

- `title:` optional (defaults to "Guided practice").
- A `{{answer}}` line becomes a graded fill-in step (same `{{answer|alt}}` / `{{=numeric}}` grammar as fill-in-the-blank); a plain line is a shown step; a `$$…$$` line is shown display math.
- The faded steps number as ordinary problems and are scored like any fill-in-the-blank; the frame itself is ungraded scaffolding.

## Self-explanation blocks (```explain fence)

A fenced code block with the `explain` language tag becomes an ungraded self-explanation prompt (a free-text reflection). Non-directive lines form the prompt; an optional `starter:` line seeds the textarea placeholder.

```
```explain
Why did you subtract 3 from both sides?
starter: I subtracted 3 because…
```⠀
```

- `starter:` is optional (a sentence-starter shown in the empty answer box).
- **Ungraded** — the student writes a response for you to read; there is no answer key, no problem number, and it never affects the score. Its text lands in the submissions dashboard.
