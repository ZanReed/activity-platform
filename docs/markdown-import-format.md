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
| `{{==expr}}` | a **math** blank — graded by expression equivalence (`2a` ≡ `a+a` ≡ `a*2`) |
| `{{answer \| ?hint text}}` | a blank with a **hint** the student can open when stuck |
| `{{answer \| !wrong :: message}}` | targeted **feedback** shown when the student answers `wrong` |
| a paragraph containing `{{…}}` | a **fill-in-the-blank problem block** |
| a list whose items contain `{{…}}` | **one problem block per item** |
| `## Topic {checkpoint}` | a **checkpoint section break** titled "Topic" |
| a ` ```graph ` fenced block | a **coordinate-plane question** — plot a point, graph a line or inequality, shade a region (see below) |
| a ` ```figure ` fenced block | a **labelled geometry figure**: named points, polygons, angle marks, equal-side ticks, parallel arrows, side labels; "Not to scale" by default (see below) |
| a ` ```chart ` fenced block | a **statistics chart** of category data: a bar chart, clustered or stacked bars, or a time-series line. Display only; a hidden data table carries the numbers for screen readers |
| a ` ```numberline ` fenced block | a **1-D number-line question** — plot points, or graph an inequality (see below) |
| a ` ```dataplot ` fenced block | a **statistics-chart question** — dot plot, histogram, box plot (see below) |
| a ` ```mc ` fenced block | a **multiple-choice question** (see below) |
| a ` ```match ` fenced block | a **matching question** (see below) |
| a ` ```correspond ` fenced block | an **N-way match** — each item pairs with one card per column (see below) |
| a ` ```order ` fenced block | an **ordering question** (see below) |
| a ` ```objectives ` fenced block | a **learning-objectives list** (see below) |
| a ` ```worked ` fenced block | a **worked example** to study (see below) |
| a ` ```faded ` fenced block | a **faded worked example** — shown steps + fill-in steps (see below) |
| a ` ```explain ` fenced block | an **ungraded self-explanation** prompt (see below) |
| a ` ```shortanswer ` fenced block | a **graded short-answer** question (rubric optional; see below) |
| a ` ```essay ` fenced block | a **graded essay** question (word-count target + rubric optional; see below) |
| a **pipe table** (`\| x \| y \|` + `\|---\|---\|`) | a **table** — cells may hold `{{blanks}}` (see below) |
| a ` ```table ` fenced block | a table whose **headers run down the left** (`header: column`) — see below |
| a ` ```columns ` fenced block | a **multi-column (side-by-side) row**, columns divided by `---` (see below) |
| a ` ```callout ` fenced block | a **tinted note box** — info / warning / success / note (see below) |
| a ` ```meta ` fenced block | the activity's **metadata and settings** — title, course, unit, tags, Bank role, type, submission mode, feedback, calculator — not a body block (see below) |
| a ` ```seed ` fenced block | **seeded per-student variables** — each student is served (and graded on) their own numbers; reference as `{name}` in prose, expressions in blank answers — not a body block (see below) |
| a ` ```reference ` fenced block | the activity's **reference panel** (formula sheet students summon; prints at the top) — not a body block (see below) |
| a ` ```teacher-guide ` fenced block | the activity's **teacher guide** — teacher-only notes, **never shown to students**; shown in the editor and on the printed answer key — not a body block (see below) |
| `$x^2$` | inline math |
| `$$ … $$` on its own paragraph | a display math block |
| `![alt](https://url)` | an image block |
| `[[term :: definition]]` | a **vocabulary definition** — the term with a pop-up explanation |
| `[[term]]` + a ```definitions fence | a **rich vocabulary definition** — one that needs an equation, a list, or a figure |
| `[[term]]` alone, in a catalogue file | a word from the **course glossary** (batch import only — see [Course glossary](#course-glossary-batch-import---glossary)) |
| `\[[…]]` | literal brackets — never a definition |
| `$$… \gap{answer} …$$` | a gradeable **in-equation gap** the student fills (Model A) |

## Rules that matter

- **Separate every problem (and every block) with a blank line.** Consecutive non-blank lines are one paragraph in Markdown, so they merge into a single block. One blank line = a new block.
- **Blanks only work in paragraphs and list items.** A `{{…}}` inside a heading stays literal text (headings can't hold blanks).
- **A blank needs at least one character.** `{{}}` is treated as literal text, not a blank. Put a real answer in the braces.
- **Order-independent blanks (`~`).** A leading tilde on a blank — `{{~3}}` — marks it interchangeable with the blank just before it in the same problem. For factoring, `(x + {{2}})(x + {{~3}})` accepts 2 and 3 in either order but rejects 2 and 2, because each correct answer can satisfy only one blank. The `~` belongs on the second (and later) blanks of a group; on a problem's first blank it has no effect.
- **Numeric blanks (`=`).** A leading equals sign — `{{=12}}` — makes the blank numeric: the student's entry is parsed as a number and every equivalent form counts (`0.5`, `1/2`, `.50`, `1 1/2`, `1,234`, `$3.50`). An optional trailing `+- tol` (or `± tol`) accepts anything within that absolute tolerance: `{{=3.14 +- 0.01}}`. Combine with the tilde as `{{~=3}}` (tilde first). Prefer numeric blanks for any purely numeric answer — with a plain `{{0.5}}` a student typing `1/2` is marked wrong.
- **Unit-bearing numeric blanks (`unit:`).** A trailing `unit:` clause on a NUMERIC blank — `{{=1.5 unit: km/h}}` — requires the student to type value AND unit in the one input; a bare `1.5` is wrong (forgetting the unit is the misconception the blank exists to catch, so nothing on screen prompts for it). Comma-separated alternates accept other spellings (`unit: km/h, kph`); matching normalizes case and spacing but never converts between units (`1500 m/h` is wrong for `1.5 km/h` — list it as an alternate only if you mean to accept it). Composes with tolerance (`{{=1.5 +- 0.1 unit: km/h}}`) and the tilde. Two RESERVED mistake matches fire on unit outcomes instead of typed text: `!unit-missing :: feedback` (value right, no unit typed) and `!unit-wrong :: feedback` (value right, unit not accepted) — each takes the optional trailing `:: mis.*` binding like any other mistake segment. On text and math blanks `unit:` stays literal text.
- **Math blanks (`==`).** Two leading equals signs — `{{==2a}}` — grade the entry as a math *expression*: any input that is algebraically equivalent counts (`2a`, `a+a`, and `a*2` all match). Distinct from a numeric blank (which compares a single value); use `==` when several written forms should be accepted. Combine with the tilde as `{{~==2a}}`.
- **Hints and per-answer feedback (`?` / `!`).** Inside the braces, after the answer, add extra `|`-separated segments: a segment starting `?` is a **hint** the student can open when stuck (one per blank — `{{Paris | ?It starts with P}}`); a segment written `!wrong :: message` attaches **feedback to a specific wrong answer** and is repeatable (`{{Paris | !Lyon :: that's the third-largest city}}`). The `::` delimiter matches the `mc`/`graph` fences, so a wrong answer may contain `=`. A `!` segment with no `::` is ignored with a warning (it never becomes an accepted answer). Hint and feedback text can't contain `|`, `{`, or `}` (`$math$` is fine). For an accepted answer that itself begins with `?` or `!`, double the mark: `{{a | ??x}}` accepts the literal `?x`.
- **A list of problems flattens.** If each item of a numbered or bulleted list contains a blank, the list becomes one problem block per item (the editor re-numbers them). A list with no blanks stays an ordinary list.
- **Display math must stand alone.** `$$…$$` becomes a block-level equation only when it is its own paragraph (blank line above and below). Inline `$…$` can appear anywhere in a line.
- **Inline math has a guard.** A lone `$` or currency like `$5 and $10` is *not* treated as math — only a properly closed `$…$` with no space just inside the delimiters. An **escaped dollar `\$` is never a math delimiter** (it renders as a literal `$`), so `\$4.50` is always safe — including two on one line, where bare dollars could otherwise pair into accidental math (`It costs \$4.50. Change from \$5?`).
- **Write real LaTeX in math.** Backslash commands (`\frac`, `\sum`, `\int`, `\,`) are preserved exactly.
- **Vocabulary definitions (`[[…::…]]`).** `[[term :: definition]]` marks the term so a student can tap it for a pop-up showing the definition (plain text + `$inline$` math). Works anywhere inline — prose, headings, prompts. The `::` splits term from definition (first one wins); neither side may contain square brackets, and a `[[bracketed phrase]]` with no `::` stays literal text. For anything richer than a sentence — a displayed equation, a list, a figure — use the [```definitions fence](#rich-definitions-definitions-fence) and reference it with `[[term]]`.
- 🚨 **Never put a `{{…}}` blank inside `$…$` or `$$…$$`.** A blank inside maths is not a blank: it is absorbed whole into the equation, so **the answer is rendered to the student**, the question is not marked, and any `:: mis.*` binding disappears — which makes the sensor data say nobody made that mistake. Use `\gap{…}` (below) inside an equation, or move the blank into the surrounding prose. The importer now **warns** on this and `--strict` fails the run, but the warning is the safety net, not the rule.
- **In-equation gaps (`\gap{…}`, Model A).** Inside `$…$` or `$$…$$`, `\gap{answer}` becomes a gradeable gap *inside* the rendered equation — the natural "complete the step" authoring for a faded worked example or a math-completion problem (`$$2x = \gap{8}$$`). The answer is graded by math equivalence (any equivalent form counts, so `8` / `8.0` / `4+4` all pass); the stored equation empties the gap so the answer never leaks to the student. Balanced braces work (`\gap{\frac{1}{2}}`). `|`-alternates aren't parsed (a `|` is a real LaTeX token); acceptable-answer lists, exact-form matching, and tolerances are added in the editor.
- **Image URLs must be absolute** (`https://…`). A relative or empty URL is skipped with a warning.
- **Wrapping the model's reply in a code fence is fine — recommended, even.** Asking the model to put its whole response inside a fenced code block is how you get a **Copy** button and the *raw* (unrendered) Markdown instead of a formatted preview you can't paste. The Copy button hands you the contents *without* the ```` ``` ```` lines, so the importer never sees the fence. As a safety net, a paste that is entirely wrapped in a ```` ```markdown ```` fence is unwrapped automatically on import. (A plain ```` ``` ```` code block in the *middle* of your content is still treated as a code block and flattened — only outer fences are stripped.)

## Not supported (degrades to plain text, with a warning)

Fenced/indented code blocks, blockquotes, raw HTML, links (the link text is kept, the URL dropped), and strikethrough. These import as plain paragraphs/text and surface a note in the dialog so you can fix them by hand. **A `{{…}}` blank inside a degraded construct is masked to `______`**, so a degraded paragraph can be published without leaking a blank's key. ⚠ The masking covers `{{…}}` specs ONLY — an unrecognized FENCE (e.g. a fence tag this app version doesn't know yet) degrades with its raw content verbatim, and for fences whose line layout IS the answer key (` ```match ` pairs, and any future fence with the same property) that means the key imports as visible text. Check the degrade notes in the dialog before publishing a paste that used a fence.
 (Callouts import via the ` ```callout ` fence and columns via ` ```columns ` — see below. Lists, headings and images *inside* a worked/faded example or a column **do** import as of 2026-08-21 — see the fence sections.)

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
- To require a UNIT with the number, add a trailing unit: clause (numeric
  blanks only):  the speed is {{=1.5 unit: km/h}}. The student must type
  BOTH — a bare 1.5 is wrong, which is the point. Extra accepted spellings
  are comma-separated ({{=1.5 unit: km/h, kph}}); matching ignores case and
  spacing but never converts (1500 m/h is wrong for 1.5 km/h). Composes
  with tolerance:  {{=1.5 +- 0.1 unit: km/h}}. Two reserved mistake
  matches fire on unit OUTCOMES rather than typed text:  !unit-missing ::
  fires when the value is right but no unit was typed, and !unit-wrong ::
  when the value is right but the unit is not accepted — both take the
  optional trailing :: mis.* binding like any other mistake segment.
- For a MATH answer graded by expression equivalence (2a, a+a and a*2 all
  count as equal), use two equals signs:  simplify to {{==2a}}. Combine with
  the tilde as {{~==2a}}.
- Add an optional HINT a student can open when stuck by starting a bar-segment
  with ?:  {{Paris | ?It starts with P}}. One hint per blank.
- Give targeted feedback for a specific wrong answer with a bar-segment written
  !wrong :: message (repeatable):
    {{Paris | !Lyon :: That is the third-largest city, not the capital}}
- Inside the braces the order is: the answer, then any mix of |alternate
  answers, one ?hint, and !wrong :: feedback pairs. Hint and feedback text
  cannot contain |, {, or }. For an accepted answer that itself starts with
  ? or !, double the mark:  {{a | ??x}} also accepts the literal "?x".
- Blanks work only in normal paragraphs and list items — never inside a heading.
- A numbered or bulleted list whose items each contain a blank becomes one
  problem per item — a clean way to write a problem set.

MATH (write real LaTeX)
- Inline math between single dollar signs:  the area is $\frac{1}{2}bh$
- A displayed equation on its own line, with a blank line above and below:

  $$\int_0^1 x\,dx = \frac{1}{2}$$

- A gradeable GAP inside an equation — \gap{answer} — lets the student fill in
  the missing part (ideal for a faded example's "complete the step"):
    $$2x = \gap{8}$$   then   $$x = \gap{4}$$
  The answer is graded by math equivalence, so 8, 8.0, and 4+4 all count.

DEFINITIONS (a tappable vocabulary term with a pop-up explanation)
- Wrap a term and its meaning in double square brackets, split by ::
    The [[mitochondria :: the powerhouse of the cell]] makes energy.
- The term stays in the sentence; the definition shows in a pop-up (it may
  include $inline$ math). Term and definition can’t contain square brackets.
- For a RICHER definition — a displayed equation, a list, a picture — put it
  in a ```definitions fence and reference it from the text with [[term]]
  (no ::). Entries are separated by --- and headed by a term: line:
    ```definitions
    term: Slope
    Steepness of a line — rise over run.
    $$m = \frac{y_2 - y_1}{x_2 - x_1}$$
    graph: line y = 2x
    ---
    term: Intercept
    Where the line crosses an axis.
    ```
    Find the [[Slope]] of the line, then its [[intercept]].
- Entry bodies use the SAME line rules as the reference sheet below ($$…$$,
  - / 1. lists, # headings, ![alt](url) images, graph: / axes: figures).
- Matching is case-insensitive, and the fence can sit anywhere in the
  document. Define each term once; a [[bracketed phrase]] that is neither
  a :: definition nor a fence entry stays literal text.

GRAPHS (a fenced block with the `graph` tag becomes a coordinate-plane question)
- ```graph … ``` with one statement per line:
    axes: -10..10, -10..10        (optional; this is the default window)
    prompt: Graph the inequality.
    answer: y > 2x + 1
    options: allow-no-solution
- The answer line takes ANY equation format (y = 2x + 3, 2x + 3y = 6,
  y - 5 = 2(x - 1), x^2 - 4, x = 4), an inequality (the <, <=, >, >= sign
  sets the dotted/solid boundary and the shaded side), a point list like
  (2, 3), (4, 5), a ray or segment like ray (1, 2) through (3, 4) open or
  segment (1, 2) to (3, 4) (open/closed set each endpoint style, default
  closed), a region like region (0,0), (4,0), (2,4), or the word none for
  a "cannot be graphed" trick question. Supported answer curves: linear,
  quadratic, cubic, quartic, absolute value (y = 2|x - 3| + 1), square
  root (y = 2*sqrt(x - 3) + 1), exponential, logarithmic, and vertical
  lines.
- The prompt line may include inline math: prompt: Graph $y = 2x + 3$.
- Optional targeted feedback for an anticipated wrong answer (repeatable):
    mistake: y = x + 2 :: Remember - the number multiplying x is the slope.
    mistake: (4, 3) :: Coordinates are (x, y) - x comes first.
    mistake: segment (1, 2) to (3, 4) :: Think about whether the graph should stop or keep going.
- A TRANSFORM question shows a start curve the student drags onto a target:
    start: y = x^2                (the shown parent curve; needs an equation answer:)
    answer: y = (x - 2)^2 + 1     (the target the student must reach)
    options: type-equation        (also require typing the target equation)
  Without type-equation the student only drags. The two mistake: tokens
  drawn-not-written and written-not-drawn match when only one channel is right.
- options: (comma-separated) turn on grading behaviours:
    allow-no-solution     give the student a "no solution" choice
    no-solution-correct   make "no solution" THE correct answer and any drawn answer a decoy (a trick question)
    no-builtin-feedback   turn OFF the automatic mistake hints (swapped coordinates, swapped slope/intercept, …), which are on by default
    type-equation         with start:, also require the typed target equation
- A SHOWN SHAPE BESIDE THE QUESTION: show: lines written WITH an answer: are
  fixed on the student's graph (and on the printed sheet) for them to work
  from - the shape to reflect, the mirror line, points a line must pass
  through. They are never marked. After show: use the figure lines (named
  points, polygon, segment, side, angle, ticks, parallel, text) or a line:
    axes: -6..6, -6..6
    prompt: Reflect triangle ABC in the mirror line. Plot A', B' and C'.
    alt: Triangle ABC and a vertical dashed mirror line
    show: point (1,1) "A"
    show: point (4,1) "B"
    show: point (2,4) "C"
    show: polygon A B C
    show: line x = 0 dashed
    answer: (-1,1), (-4,1), (-2,4)
    mistake: (-5,1), (-2,1), (-4,4) :: That is a slide, not a flip. :: mis.reflect.translates
  Write a MIRROR LINE as show: line ... dashed (x = 2, y = -1, y = x): it
  runs across the whole graph. A centre of rotation is a named point. The
  plotted points are marked as a set, in any order; letters are not marked.
  Write each mistake: as the WHOLE wrong image (every point), so it only
  matches that error. alt: (optional) says what is shown, for screen
  readers; never put the answer in it. Never show the answer itself.
  Not beside an answer: show: expression, cuboid.
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
- Optional line:  solution: <worked explanation>

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
- Optional line:  solution: <worked explanation>

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
- Optional line:  solution: <worked explanation>
- options: keep-order keeps the choices in the order written (they shuffle
  otherwise). Use it when the order carries meaning: the letters of figures
  above the question, or "all of the above".
- Choice text and the prompt may include $inline$ math.
- A choice may carry an image, shown below its text:  (x) ![a square](https://…)
  — the choice text may be the image alone.
- A choice can be a static graph instead of text — "which graph shows…":
    (x) graph: line y = 2x   (uses the show: forms: point/line/curve/segment/ray/region)

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
- Optional line:  solution: <worked explanation>. Several items may share one
  option (categorization-style) — always allowed.
- Either side may include $inline$ math or an image ![alt](https://…).
- A side can be a static graph — "match the graph to its equation". Use -> as
  the separator (the graph formula contains =):  graph: line y = 2x -> slope 2

- ```correspond … ``` is the N-WAY match — each item pairs with one card
  from EVERY column ("the same function as equation, graph, and
  description"). A columns: line names two or three card columns, then one
  row per item, cells |-separated: first the item, then its correct card
  for each column in order:
    prompt: Match each function to its graph and its description.
    columns: Graph | Description
    y = 2x | rises through the origin | doubles each step
    y = -x + 4 | falls, crossing y at 4 | drops by 1 each step
- A row STARTING with | adds distractor cards (extra wrong cards, no item):
  leave a cell empty to skip that column ( | | steeper than both ).
- A | inside $math$ is safe ($|x - 3|$ does not split a cell); a cell may
  also be an image or graph: card, exactly as in ```match.
- Each column is shuffled and marked independently (A/B/C, i/ii/iii, α/β/γ)
  — never write the markers yourself. Optional solution: line as always.
- Use ```correspond only for three or more sides — a two-column match is a
  ```match fence.

ORDERING (a fenced block with the `order` tag becomes a put-in-order question)
- ```order … ``` with one item per line, LISTED IN THE CORRECT ORDER
  (students see them shuffled and drag them back into sequence):
    prompt: Put the steps for solving $2x + 3 = 11$ in order.
    1. Subtract 3 from both sides
    2. Divide both sides by 2
    3. Check the solution
- Leading numbers like "1." are optional decoration — the listed order is
  what counts.
- Optional line:  solution: <worked explanation>

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
  equation, every other line becomes a paragraph. You can also use
  consecutive - or 1. lines (they group into ONE list), #/##/### headings,
  and ![alt](https://…) images on their own line.

FADED WORKED EXAMPLE (a `faded` fenced block is a guided example the student completes)
- ```faded … ``` is written just like ```worked, but any line containing a
  {{blank}} becomes a step the STUDENT fills in:
    title: Guided practice        (optional)
    Subtract 3 from both sides.
    $$2x = 8$$
    x = {{4}}
- Show the first steps, then fade (blank) the later ones. Blanks use the same
  {{answer|alt}} / {{=numeric}} grammar as fill-in-the-blank.
- Lists, headings and images work here too, exactly as in ```worked — but a
  line carrying a {{blank}} is always a STEP, never a list item, so write
  "1. Divide: {{4}}" only when you want a fill-in step (you almost always do).

SELF-EXPLANATION (an `explain` fenced block is an ungraded free-text reflection)
- ```explain … ``` — the prompt text, plus an optional sentence starter:
    Why did you subtract 3 from both sides?
    starter: I subtracted 3 because…
- Ungraded: the student writes an answer for you to read; there is no key.

SHORT ANSWER / ESSAY (a `shortanswer` or `essay` fence is a graded free-text question)
- Both take a prompt line, an optional starter: placeholder, and an optional
  grading rubric — one criterion per rubric: line, written
  rubric: Label | points | optional note
    ```shortanswer
    prompt: Explain why the sum of two even numbers is even.
    starter: The sum is even because…
    rubric: Correct reasoning | 3 | Uses that an even number is 2k
    rubric: Clear explanation | 2
    ```
- An essay adds a words: min-max length target (either side optional —
  words: 200-300, words: 200-, words: -300); it shows the student a live
  word counter:
    ```essay
    prompt: Argue whether zoos do more good than harm.
    words: 200-300
    rubric: Thesis | 3
    rubric: Evidence | 5 | Cites at least two examples
    ```
- Both accept two teacher-only keys the student NEVER sees:
    answer:   what a correct response says — this is what prints on your
              answer key, so write it the way you would mark against it
    solution: the worked explanation shown to the student AFTER they check
              the section (omit it on a question you want to reuse)
  Both may run over SEVERAL LINES — keep writing on the lines beneath, and
  each line becomes its own line in the key:
    ```shortanswer
    prompt: Solve $2x + 3 = 11$ and explain each step.
    answer: x = 4
    Subtract 3 from both sides, then divide by 2.
    solution: Undo the operations in the reverse order they were applied.
    ```
  A continuation line belongs to whichever of prompt:, answer: or solution:
  came last, so write the prompt first and the keys after it.
- Points come from the rubric, never from the answer: one criterion per
  rubric: line with its own points; a question with NO rubric is worth 1
  point. Write answer: for WHAT is correct and rubric: for HOW MANY points.
- Both are teacher-graded — there is no auto-scored key.
  Use ```explain instead when the reflection should be ungraded.

TABLES (a pipe table; cells can hold blanks)
- Write an ordinary GitHub pipe table. The first row is the header row:
    | Kilograms | Cost ($) |
    |---|---:|
    | 1 | 4.50 |
    | 2 | {{=9.00}} |
- Blanks work in a cell exactly as in prose, with every sigil ({{=…}} numeric,
  {{==…}} math, ?hint, !wrong :: message). The whole table is ONE numbered
  problem whose blank cells are lettered (a), (b), … — do not number them.
- Colons in the delimiter row set alignment: |---:| right, |:---:| centred.
  Right-align numeric columns.
- Use a ```table fence ONLY when the headers are not across the top:
    ```table
    header: column
    | x | 1 | 2 | 3 |
    | y | 5 | {{8}} | {{11}} |
    ```
  header: takes row (the default), column, both, or none. A plain pipe table
  is the normal way to write a table — reach for the fence only to move the
  header axis.
- Order-independent blanks ({{~…}}) pair by READING ORDER (left to right, then
  down), so two blanks stacked in the same column are NOT a pair.
- No merged cells; every row has the same number of cells. A cell holds one
  line — no lists, no images. A caption is a paragraph above the table.

COLUMNS (a `columns` fence lays blocks out side by side)
- ```columns … ``` with columns divided by a line that is only ---, then one
  block per line inside each column:
    Left column, first line
    Left column, second line
    ---
    Right column
- 2 to 6 columns. Each non-blank line is its own block: a $$…$$ line becomes a
  displayed equation, a {{blank}} line becomes a fill-in-the-blank, every other
  line becomes a paragraph. Consecutive - or 1. lines group into ONE list, and
  #/##/### headings and ![alt](https://…) images work inside a column too.
- An options: line anywhere in the fence sets the WHOLE row:
    options: ruled          draw a box with dividers between the columns
    options: unruled        never draw it, even if the activity rules rows
  Say nothing and the activity-wide setting decides. Reach for ruled when the
  student writes INSIDE the columns (a T-chart, a two-column proof, a
  cut-out) — it is boxed regions to write in, not lines to write on.
- A FIGURE BESIDE ITS QUESTION: a column whose first line is figure: is one
  ```figure (same lines, no inner fence):
    figure:
    alt: Triangle PQR with sides PQ and QR marked equal
    point (0,0) "P"
    point (3,1.73) "Q"
    point (6,0) "R"
    polygon P Q R
    ticks PQ 1
    ticks QR 1
    ---
    By its sides, PQR is {{isosceles}}.
  The whole column is the figure (text goes in the other column); put any
  options: line in the TEXT column. A row with a figure column has 2, 3 or
  4 columns; 5 or more is refused.
- FIGURES AS CHOICES ("which diagram shows...?"): give each figure column
  a letter after the colon, 2 to 4 in one row, then ask with an mc whose
  choices are those letters, kept in order:
    figure: A
    alt: A shaded triangle left of a dashed line and an unshaded one right of it
    plane: on
    ...
    ---
    figure: B
    alt: ...
  then, after the columns block:
    prompt: Which diagram shows a reflection in the dashed line?
    options: keep-order
    ( ) A :: That is a half turn, not a flip.
    (x) B
  The text after figure: is a short caption drawn above the figure (a
  letter, or a word such as Before; at most 12 characters). Every figure in
  a row needs a DIFFERENT caption. In a choice figure, alt: describes what is
  DRAWN (the shapes, where they sit, the dashed line) and never names the
  transformation or property the question asks about - that would give the
  answer to a student using a screen reader. Small figures are drawn with
  larger labels automatically; with plane: on, three or four to a row show
  the grid without numbers on the axes.

NUMBERING — do not write your own question numbers
- The platform numbers questions for you, on screen and on paper. A line you
  write as "1. Solve for x: {{4}}" becomes a numbered problem and YOUR "1." is
  stripped, so hand-numbering a question is harmless.
- A numbered line that is NOT a question (no {{blank}}, no fence) does one of
  two things, neither of them what you meant: sitting directly among your
  questions it is demoted to plain prose and loses its number; separated from
  them by anything else (a fence, a paragraph) it becomes its own numbered
  LIST, which restarts at 1 and collides with the problem numbers — a sheet
  reading 1. 1. 2.
- So: write instructions as plain sentences, and let every numbered item be a
  real question. Numbered lists are still right for steps INSIDE a worked
  example or a reference sheet, where no problem numbering is in play.

CALLOUT (a `callout` fence is a tinted note box)
- ```callout … ``` with an optional variant: line, then the note text:
    variant: warning        (info | warning | success | note; default info)
    Double-check your units before submitting.
- The body is one line of text ($inline$ math ok); extra lines join together.

GEOMETRY FIGURE (a `figure` fence draws a labelled shape in the worksheet)
- ```figure … ``` draws ONE static picture (never interactive): triangles,
  polygons, angles, parallel lines. Name each point, then refer to it by its
  name. Lines may come in any order; blank lines are ignored:
    alt: Triangle ABC with AB = 8 cm and angle A = 68°
    point (0,0) "A"
    point (8,0) "B"
    point (2,5) "C"
    polygon A B C
    side AB "8 cm"
    angle BAC 68°
    angle ABC "x"
    angle ACB right
    ticks BC 2
- alt: is REQUIRED: one sentence saying what the figure shows, for screen
  readers. Never put the answer to a question in it.
- caption: A (optional) draws a short label in bold above the figure, for
  a question that names it ("which diagram...?"). At most 12 characters.
- point (x, y) "A" names a point (its letter is drawn beside it);
  polygon A B C draws the outline (region A B C draws it shaded);
  segment A C draws a line between two points (segment A C dashed for dashes).
- side AB "8 cm" labels a side; the label goes outside the shape.
- angle BAC marks the angle AT THE MIDDLE letter (here A). Its label is a
  degree value (68°), right (draws the small square), or text in quotes
  ("x"). Leave the label off to draw the arc alone; add reflex for the angle
  bigger than 180°. Never an unquoted text label, never an empty "".
- ticks BC 2 marks equal sides (1, 2 or 3 ticks; the same count = equal);
  parallel AB DC marks two parallel sides with arrows (add 2 for double).
- text (4,-1.5) "base" puts free text at a point: only for a label the
  automatic placement gets wrong. A coordinate (x, y) can stand in for any
  name anywhere.
- A CUBOID: cuboid 4 2 3 cm units draws a box of length 4, width (depth) 2
  and height 3 in the usual slanted textbook view, labelled 4 cm / 2 cm /
  3 cm (leave the unit word off for no labels; units adds the unit-cube
  grid for counting layers, whole numbers up to 12 each). Hidden edges are
  dashed; a line hidden: off leaves them out.
- Every figure prints "Not to scale" by itself. Write to scale on its own
  line only when the drawing is accurate (e.g. an angle to estimate).
  plane: on shows the grid and axes (for coordinate work); axes: -2..10,
  -2..7 sets the window, but leave it out: the figure fits itself.
- A mistyped figure line is not a small thing: the batch importer refuses
  the whole file until it is fixed.

CHART (a `chart` fence draws a bar chart or a time-series line)
- ```chart … ``` draws ONE statistics chart of category data. It is a
  picture to read from (never interactive): put the questions about it in
  the blocks after it.
    type: bar
    title: Books borrowed each day
    xlabel: Day
    ylabel: Number of books
    categories: Mon, Tue, Wed, Thu, Fri
    series: 12, 7, 15, 9, 4
- title: is REQUIRED: say what the chart shows. Never put the answer to a
  question in it. xlabel: and ylabel: name the two axes.
- categories: is the comma-separated list along the bottom, at most 12;
  keep each name short (under 20 characters).
- series: gives one number per category, in the same order. For more than
  one series write a name before an equals sign on each, at most 4:
    series: Walk = 12, 7, 15, 9, 4
    series: Bus = 4, 6, 3, 5, 2
  The names become the legend. Numbers are 0 or more.
- type: is bar (one series), clustered (series side by side), stacked
  (series on top of each other) or line (a time series: points joined in
  order, for categories that are times such as days or months).
- The value axis always starts at 0 and picks its own top. y: 0..20 step 5
  sets the top and the step; leave it out unless the question needs
  particular gridlines.
- alt: (optional) adds one sentence for screen readers; the chart's numbers
  are already available to them as a table.
- A mistyped chart line is not a small thing: the batch importer refuses
  the whole file until it is fixed.

REFERENCE SHEET (a `reference` fence fills the activity's reference panel)
- Content in this fence does NOT appear in the worksheet body: it becomes
  the reference panel — a formula sheet / vocab list students open from a
  button while working (it also prints as a box at the top of the page).
  Purely something to read: it can never contain questions or blanks.
- ```reference … ``` with an optional title: line, then one block per line:
    title: Linear equations cheat sheet
    Slope-intercept form: $y = mx + b$
    $$m = \frac{y_2 - y_1}{x_2 - x_1}$$
    - $m$ — the slope (rise over run)
    - $b$ — the y-intercept
- Line rules: a sole $$…$$ line is a displayed equation; consecutive lines
  starting with - (or 1.) group into one list; # / ## / ### make headings;
  ![alt](https://…) on its own line is an image; anything else is a
  paragraph ($inline$ math ok).
- A GRAPH on the sheet: graph: lines using the same forms as show:
  (point/line/curve/segment/ray/region). Back-to-back graph: lines draw on
  ONE shared grid — perfect for comparison pictures — and any other line
  ends the figure:
    Parallel lines have the same slope:
    graph: line y = 2x + 1
    graph: line y = 2x - 3
- axes: -5..5, -5..5 before a figure sets its window (default -10..10).
- Use at most one reference fence per activity; a second one adds onto the
  same sheet.

TEACHER GUIDE (optional — a `teacher-guide` fence; TEACHERS ONLY)
- A short note for the colleague teaching the activity: what the example
  sequence is for, what to watch for, what to cut if time runs short. It is
  NEVER shown to students; teachers see it in the editor and on the printed
  answer key. Put it LAST in your reply.
- Ordinary markdown inside: ## headings, paragraphs, - bullet lists,
  **bold**, `code`, $inline$ math. Nothing else (no blanks, tables, images or
  figures — they are dropped). One teacher-guide fence per activity:
    ```teacher-guide
    ## Watch for
    - Dividing the wrong way round. Ask, "What do we want one of?"
    ```

SEEDED VARIABLES (optional — numbers that differ per student)
- A ```seed fence declares named variables; each student is served their own
  values, and grading uses that student’s values. Flat `name: spec` lines:
    ```seed
    a: int 2..9                (one whole number, 2–9 inclusive)
    p: list 1.50, 1.75, 2.25   (one value drawn from the list)
    scores: sample 8 of 55..99 (8 DIFFERENT whole numbers — a dataset)
    ```
- Reference a value in prose as {a}: "You buy {a} pens at ${p}." A sample
  variable renders as a comma-separated list: "Your scores: {scores}."
- A blank’s answer may be an EXPRESSION over the variables: {{=a*p}} or
  {{=mean(scores)}} — graded against each student’s own values. Mistake
  matchers should be expressions too ({{=a*p|!a+p :: Multiply, don’t add.}}).
- A ```dataplot fence can draw its dataset from a sample variable:
  data: {scores}
- Do NOT put {a} inside math dollars — $x^{a}$ is a LaTeX brace group, not a
  reference; keep references in plain text.
- Names are lowercase (letters/digits/underscores); short math words like pi,
  e, x, y, mean, min are reserved.

ACTIVITY METADATA (optional, once, anywhere in the reply)
- A ```meta fence names and files the activity. Plain `key: value` lines:
    ```meta
    title: Factoring Trinomials
    course: Algebra I
    unit: Quadratics
    tags: factoring, vertex form, word problems
    role: lesson
    type: exit_ticket
    submission: locked
    feedback: on_check
    calculator: graphing
    ```
- title NAMES the activity. Always include it — without it the activity
  imports as "Untitled activity" and has to be renamed by hand.
- course/unit: where this sits in the year. tags: comma-separated topic
  labels used to find activities across units — lowercase them or don't,
  they are normalized either way.
- role is exactly one of lesson, review, or practice:
    lesson   = core teaching content
    review   = spaced retrieval, not day-of-teaching content
    practice = an as-needed resource shelf
- Do NOT put role words (lesson/review/practice) in tags — they belong in
  role. Omit any key you are unsure about; a wrong guess is worse than a
  missing one, because metadata already set by hand is never overwritten.

ACTIVITY SETTINGS (optional, same ```meta fence)
- These decide how the activity BEHAVES for the student. Set them when the
  kind of activity implies them; omit them to take the defaults.
- type: worksheet | exit_ticket | warm_up | review | quiz | exam   (default worksheet)
    This is the activity's FORMAT. It is separate from role, which is where
    the activity sits in your sequence — both offer a "review".
- submission: single | locked | free   (default free)
    A Check appears at every section you marked {checkpoint}, and it
    covers everything since the PREVIOUS checkpoint. The end of the
    activity is always a checkpoint, so nothing is ever left unchecked.
    free   = as above; students may re-check as often as they like.
    locked = as above, but answers FREEZE when a group is checked.
             There is no undo — for the student or the teacher.
    single = ignore every {checkpoint}; one Check at the very end.
- feedback: on_check   (default, and the only value that does anything)
    on_check  = correctness stays hidden until the student presses Check.
    immediate is RESERVED and not active yet; do not set it.
- calculator: off | scientific | graphing   (default off)
- work: 3 lines        blank writing room under EVERY problem (default none).
    Also takes 1in / 2.5cm / a plain number of rem. Use it on any sheet the
    student writes on by hand — without it a printed worksheet has no room
    to work in. One line is about 8mm.
- Typical pairings: a quiz or exit ticket is submission: locked +
  feedback: on_check; a practice sheet is submission: free +
  feedback: immediate.

OTHER
- Bold **like this**, italic *like this*, inline code `like this`.
- Images:  ![a short description](https://full-image-url)
- Don't use tables, blockquotes, links, or any code block inside the activity
  other than ```graph, ```numberline, ```dataplot, ```mc, ```match,
  ```correspond, ```order,
  ```objectives, ```worked, ```faded, ```explain, ```shortanswer, ```essay,
  ```columns, ```callout, ```definitions, ```meta, ```seed, ```table, ```figure, ```chart, ```reference, and ```teacher-guide — only the
  single
  outer block that wraps the whole reply and those fences are allowed;
  anything unsupported imports as plain text.

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
options: allow-no-solution
```⠀
```

- `axes: xMin..xMax, yMin..yMax` (optional; defaults -10..10 each way).
- `prompt:` the question text (optional). Accepts `$inline$` math with the same currency guard as body text; `{{…}}` blanks stay literal here.
- `mistake:` (repeatable) an anticipated wrong answer + targeted feedback, separated by `::` — e.g. `mistake: y = x + 2 :: Remember - the number multiplying x is the slope.` The wrong answer uses the same syntax as `answer:`; on a ray/segment question either figure matches (the classic ray mistake is its segment version).
- `answer:` ONE of — an equation (`y = 2x + 3`, `2x + 3y = 6`, `x^2 - 4`, `x = 4`); an inequality (`y > 2x + 1`, `x <= 3` — the sign sets dotted/solid + shaded side); a point list (`(2, 3), (4, 5)`); a ray or segment (`ray (1, 2) through (3, 4) open`, `segment (1, 2) to (3, 4) open closed` — `open`/`closed` set endpoint styles, default closed); `region (0,0), (4,0), (2,4)`; or `none` (a "cannot be graphed" trick question). Domain clauses (`… for x >= 0`) are no longer accepted — write a ray or segment instead.
- `show:` display drawables (no answer lines → a static display graph): `point (x, y) [open|closed] ["label"]`, `line <equation or inequality> [dashed|dotted]`, `expression <any formula> [dashed|dotted]`, `segment (a,b) (c,d)`, `ray (a,b) (c,d) [open|closed]`, `region (x,y), …`.
- **`show:` lines beside an `answer:` are the question's stimulus**: fixed shapes drawn on the student's graph under their own points, and on the printed student sheet, for them to work from. They are never marked. The lines after `show:` use the [figure grammar](#geometry-figures-figure-fence) (named points, `polygon`, `region`, `segment`, `side`, `angle`, `ticks`, `parallel`, `text`) as well as the forms above, and names resolve across all of the fence's `show:` lines in any order. Example: `show: point (1,1) "A"` · `show: point (4,1) "B"` · `show: point (2,4) "C"` · `show: polygon A B C` · `show: line x = 0 dashed` · `answer: (-1,1), (-4,1), (-2,4)`.
  - **A mirror line** is `show: line … dashed` (`x = 2`, `y = -1`, `y = x`): an infinite line across the window. A centre of rotation is a named point.
  - **Colour:** an uncoloured stimulus shape is drawn slate, so it cannot be mistaken for the student's own (blue) work.
  - **Marking is unchanged.** A point-list answer is marked as a set, in any order; labels are never marked. A `mistake:` line matches the same way, so write it as the whole wrong image (every point), with its `:: mis.*` binding if it has one.
  - **`alt:`** (optional) describes what is shown, for screen readers. It never holds the answer.
  - **Not beside an answer:** `show: expression …` and `cuboid`. Each is refused with a warning.
  - **Problems:** a `show:` line that cannot be read is skipped and reported, and the question still imports; the batch importer skips the whole file, exactly as for a `figure` problem.
- `start:` a shown parent curve, making the block a TRANSFORM question (design #5): the student drags the dashed start curve onto the target given by `answer:` (which must then be an equation — not points, not a ray, not `none`). No verticals and no domain clauses on `start:`.
- `options:` `allow-no-solution` (give a "no solution" choice), `no-solution-correct` ("no solution" is THE answer — a trick question; implies `allow-no-solution`), `no-builtin-feedback` (turn off the automatic swapped-coordinate / swapped-slope mistake hints, which are on by default), `type-equation` (with `start:`, the student must ALSO type the target's equation — both channels must be correct).
- On a transform question, `mistake:` also accepts two reserved tokens — `drawn-not-written` (the drag is right but the typed equation isn't) and `written-not-drawn` (the reverse) — alongside ordinary wrong-equation matches, which match against EITHER channel.

A malformed graph block imports as plain text with a warning, never silently guessing — including `type-equation` without `start:`, and `start:` with a non-equation answer.

## Number-line blocks (```numberline fence)

A fenced code block with the `numberline` language tag becomes a number-line (1-D) block — the student plots points, or graphs an inequality as an interval/ray. One statement per line:

```
```numberline
prompt: Graph the solution set.
answer: -2 <= x < 5
```⠀
```

- `answer:` **required**, and is ONE of:
  - **Points** — bare numbers, comma- or space-separated: `answer: -3, 4` (the student plots each). Scored consume-once, all-or-nothing.
  - **An inequality** → an interval or ray. A single inequality gives a ray: `x >= 3` (min 3, closed, extends right), `x < 5` (max 5, open, extends left). A compound inequality gives a bounded interval: `-2 <= x < 5`. `>=`/`<=` draw a **closed** (filled) endpoint, `>`/`<` an **open** one. The variable may be on either side (`3 < x` ≡ `x > 3`).
- `axis: -10..10 step 2` (optional) — the window and tick step (step optional, default 1). Left out, the window auto-fits the answer values (padded a step each side so points and endpoints aren't jammed at the edge, and a ray visibly extends). An answer value outside an *explicit* window imports with a warning (the student couldn't place it there).
- `prompt:` the question text (optional). Accepts `$inline$` math; `{{…}}` blanks stay literal here.
- `solution:` optional worked explanation.
- There is **no `show:` line** — unlike the graph and data-plot fences, the number-line block has no static display mode; both interactions are graded.

A malformed number-line block imports as plain text with a warning.

## Data-plot blocks (```dataplot fence)

A fenced code block with the `dataplot` language tag becomes a data-plot (statistics chart) block — a dot plot, histogram, or box plot. One statement per line:

```
```dataplot
prompt: Make a dot plot of the data.
data: 3, 5, 5, 6, 8
answer: dotplot
```⠀
```

- `data:` the dataset — numbers separated by commas or spaces. **Required.** Repeat the line to continue a long dataset (the values append). The correct chart is **computed from the data** (the block's single source of truth) — there is no hand-authored answer chart.
- `answer:` ONE of `dotplot`, `histogram`, `boxplot` — a **graded build**: the student constructs that chart of the data ("dot plot" / "box-plot" spellings are tolerated). A box-plot answer takes an optional trailing tolerance — `answer: boxplot tolerance 1` — how close each five-number-summary handle must be, in line units (default 0.5; the key uses the TI-84 exclusive-median method).
- `show:` the same three chart names — a **static, ungraded chart** the student reads (pair it with a sibling question). Exactly one of `answer:`/`show:` per block.
- `axis: 0..20 step 5` (optional) — the number-line window and tick step (step optional, default 1). Left out, the window auto-fits the data, rounded out to the step. For a histogram the step doubles as the bar (bin) width. Data outside an explicit window imports with a warning (it wouldn't appear on the chart).
- `prompt:` the question text (optional). Accepts `$inline$` math; `{{…}}` blanks stay literal here.
- `solution:` optional worked explanation.

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
```⠀
```

- **Choice lines**: `( )` is a wrong choice, `(x)` a correct one. Square brackets — `[ ]` / `[x]` — author a **select-all-that-apply** (multi-select) question; any square bracket, or more than one `(x)`, switches the block to multi-select (a single-answer question with two right answers would be unanswerable on radios).
- **Per-choice feedback**: append `:: feedback text` to a choice line; a student who picks that choice sees it after checking. Distractors are usually authored *because* they're anticipated mistakes — this is where the explanation goes.
- `prompt:` the question text. Both it and choice text accept `$inline$` math.
- **Per-choice images**: a markdown image — `![alt](https://…)` — anywhere in a choice's text becomes the choice's figure, rendered below the text ("which diagram shows…"). The image markdown is stripped from the text; an image-only choice is legal. An unparseable URL stays as literal text so the author notices. **Per-choice graphs**: `graph: <show-spec>` on a choice line — e.g. `(x) graph: line y = 2x` — using the same `show:` forms as elsewhere (point/line/curve/segment/ray/region). One drawable per choice, and `expression` is refused (it needs the calculator's parser, which the static renderer does not carry). `graph:` and `![](…)` are mutually exclusive on one choice; a graph-only choice is legal. *(This sentence used to say per-choice graphs had no fence syntax and were editor-only. That was wrong from the day the importer learned to parse them — corrected 2026-08-22, and the corresponding renderer now exists, so the figure a teacher authors actually reaches the student.)*
- `solution:` optional worked explanation revealed post-check.
- `options: keep-order` keeps the choices in the order written, on screen and in printed versions (they shuffle otherwise). Use it when the order carries meaning: the letters of figures above the question, or "all of the above". Per-choice feedback and `:: mis.*` bindings work as usual.
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
```⠀
```

- **Pair lines** — `item = correct option`. The **last** ` = ` on the line is the separator, so equation-shaped items keep their internal equals signs (`y = 2x + 1 = A` pairs `y = 2x + 1` with `A`). Escape a literal equals as `\=`, or sidestep entirely with the ` -> ` separator, which always wins when present.
- **Distractor lines** — a line starting with `=` (or `->`) adds an option that matches nothing (defeats process-of-elimination).
- **Letters are never authored.** The published page shuffles the options deterministically and letters them by position; the editor's key picker refers to options by their text for the same reason.
- **Per-side images**: `![alt](https://…)` on either side becomes that side's figure (the MC choice-image contract: stripped from the text, image-only sides legal, bad URLs stay literal). **Per-side graphs**: `graph: <show-spec>` works on either side too — prefer the `->` separator on a graph line, since the formula usually contains `=`. *(Also previously documented as editor-only; corrected 2026-08-22.)*
- Several items may share one option (categorization-style) — always allowed; each option card copies on dock when reused.
- `solution:` is the optional worked explanation.
- At least two pair lines are required. Scoring is **per pair** (each item is one point).

## Correspondence blocks (```correspond fence)

A fenced code block with the `correspond` language tag becomes an **N-way match**: anchor items on the left, two or three card columns beside them, and the student picks one card from every column for every item — "the same function as equation, graph, and description" is the marquee use.

```
```correspond
prompt: Match each function to its graph and its description.
columns: Graph | Description
y = 2x | rises through the origin | doubles each step
y = -x + 4 | falls, crossing y at 4 | drops by 1 each step
| steeper than both | |
solution: Read the slope: positive rises, negative falls.
```⠀
```

- **`columns:` first** — two or three `|`-separated column headers. (A two-column match — one item, one card — is a ` ```match ` fence, not this.)
- **Item rows** — `item | card | card…`, one cell per column after the item. Every cell must be filled; the row's cards are that item's correct answers.
- **Distractor rows** — a row **starting** with `|` adds extra wrong cards; leave a cell empty to skip that column.
- **A `|` inside `$math$` is safe** — `$|x - 3|$` does not split a cell. There is no escape for a literal `|` outside math; rephrase the cell.
- **Markers are never authored.** Each column shuffles independently and marks its cards in its own sequence (A/B/C, i/ii/iii, α/β/γ) so a written answer line reads unambiguously.
- Cards and items take `$inline$` math, images, and `graph:` figures exactly as in ` ```match `.
- Scoring is **per cell** — each (item, column) pairing is one point; the block is correct when every cell is right. `solution:` is the optional worked explanation.

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
- `solution:` as in the other fences.
- At least two item lines are required.

## Misconception bindings (`:: mis.*`)

**Batch-workflow feature.** This is deliberately NOT taught by the Copy-AI
prompt above: an assistant with no copy of your registry would invent
plausible-looking ids and fragment the data. Author bindings in files you
import with `pnpm import:batch`, which validates them against your registry.

A wrong answer can name the misconception it senses. The binding is an opaque
tag from **your** registry (the platform never owns the taxonomy) and it is
what turns targeted feedback into aggregate data: the id rides the check
verdict and is stored with the student's attempt.

**The id.** `mis.` followed by dot-separated kebab-case segments —
`mis.roc.uses-endpoint-value`, `mis.place-value.digit-reversal`. Anything else
is not a binding.

**The syntax, at all three sites: append `:: <id>`.** The id is recognized by
its SHAPE, wherever it sits, so the feedback text is optional:

```
{{12 | !21 :: You reversed the digits. :: mis.place-value.digit-reversal}}
{{12 | !21 :: mis.place-value.digit-reversal}}
```
```
( ) $4 per kg :: Check which quantity you divided by. :: mis.roc.uses-endpoint-value
( ) $4 per kg :: mis.roc.uses-endpoint-value
```
```
mistake: y = x + 2 :: The coefficient is the slope. :: mis.slope.reads-intercept
mistake: y = x + 2 :: mis.slope.reads-intercept
```

**What has to MATCH for a binding to fire** — a binding that can never match is
worse than none, because the data then says "students didn't make this mistake":

| Site | The `match` is compared… |
| --- | --- |
| Blank, plain | exact text (trim + case-insensitive) |
| Blank, numeric (`{{=…}}`) | **as a NUMBER**, within the blank's tolerance — write `!0.5` once and `.5`, `1/2`, `0.50` all match |
| Multiple choice | the choice itself — no matching involved |
| Graph `mistake:` | the same freeform answer grammar as `answer:`, compared with the same tolerances |

Two consequences worth knowing: a graph `mistake:` whose text the parser cannot
read compiles to a matcher that never fires (write it the way you would write
`answer:`), and a blank mistake that equals the correct answer can never fire
either, because correctness is decided first.

**When something looks wrong, you get a warning, never a hard failure** — but
the warning is the whole safety net, so read it. An id-shaped token that is not
a valid id (`msi.roc.…`, a prefix typo) warns and stays visible as feedback
text; ordinary prose containing dots (`e.g.`, `3.14`) never trips it. Ids
outside your registry warn. `--strict` turns these into a failed run.

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

A fenced code block with the `worked` language tag becomes a worked example (a boxed, fully-worked solution to study). An optional `title:` line; every other line is one body block — a line that is **only** `$$…$$` becomes a display-math block, consecutive `-`/`*` (or `1.`) lines group into **one** list, `#`/`##`/`###` make headings, `![alt](https://…)` on its own line is an image, and every other line becomes a paragraph. A blank line ends a list run.

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
- **Lists, headings and images** work here exactly as in `worked` — but a line carrying a `{{blank}}` is **always a step, never a list item**. So `1. Divide: {{4}}` stays a fill-in step (which is almost always what you mean); it does not become a numbered list. In a `worked` fence, where `{{…}}` is literal text, there is no step to protect and such a line groups like any other.

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

## Short-answer and essay blocks (```shortanswer / ```essay fences)

The graded free-text siblings of `explain`. A ` ```shortanswer ` fence is a brief written response; a ` ```essay ` fence is a longer one that adds an optional word-count target. Both are **manually graded** by the teacher against an optional rubric — no machine scores them. Both can still carry an `answer:` (what prints on your answer key) and a `solution:` (the worked explanation the student sees after checking). (Reach for `explain` instead when the reflection should be ungraded.)

```
```shortanswer
prompt: Explain why the sum of two even numbers is even.
starter: The sum is even because…
rubric: Correct reasoning | 3 | Uses that an even number is 2k
rubric: Clear explanation | 2
answer: Two evens are 2m and 2n, so their sum is 2(m + n) — a multiple of 2.
solution: Write each even number as 2 times something, then factor the 2 out.
```⠀
```

```
```essay
prompt: Argue whether zoos do more good than harm.
words: 200-300
starter: In my view…
rubric: Thesis | 3
rubric: Evidence | 5 | Cites at least two examples
rubric: Mechanics | 2
```⠀
```

- **Prompt** — a `prompt:` line, or any non-directive line (multiple lines join with a space). **Required**; a fence with no prompt imports as plain text with a warning.
- `starter:` — optional placeholder text shown in the empty answer box (same as `explain`).
- `rubric:` — optional and **repeatable**; each line is one criterion, `Label | points | optional note`. The `|` splits the three parts (label required; points a positive number; the note optional). A rubric line that can't be read (no label, or non-numeric points) is skipped with a warning and the rest of the block still imports — one bad criterion never sinks the question. The rubric is teacher-side data: it's carried into the grading UI, never emitted into the student page.
- `words:` (**essay only**) — an optional length target, `min-max`, with either side optional: `words: 200-300`, `words: 200-` (minimum only), `words: -300` (maximum only). The dash is required (a bare number is ambiguous); word counts are positive whole numbers, and an inverted `min-max` is dropped with a warning. The student sees a live word counter against the target. A `words:` line inside a `shortanswer` fence is ignored with a warning.
- `answer:` — optional. **What a correct response says.** This is what prints on your answer key, so write it the way you'd mark against it. Teacher-only: it is stripped from everything the student is served, on every channel.
- `solution:` — optional. The worked explanation, shown to the student **after** they check the section (never before — the attempt is recorded first). Omit it on a question you want to reuse or that a student could revise their answer from.
- **Both may run over several lines.** Keep writing on the lines beneath the key and each line becomes its own line in the key:

```
```shortanswer
prompt: Solve $2x + 3 = 11$ and explain each step.
answer: x = 4
Subtract 3 from both sides, then divide by 2.
solution: Undo the operations in the reverse order they were applied.
```⠀
```

  A continuation line belongs to whichever of `prompt:`, `answer:` or `solution:` came last, so **write the prompt first and the keys after it**. (`starter:`, `words:` and `rubric:` are single-line and don't capture the lines beneath them.)
- **Points come from the rubric, never from `answer:`.** `answer:` says *what* is correct; each `rubric:` line says *how many points* its criterion is worth. A question with no rubric is worth **1 point**.
- Neither block is auto-scored; both show up under "Written responses" in the submissions dashboard for grading. Both are **numbered** on screen and on paper, like every other question a teacher marks.

## Tables (```table fence)

### The ordinary case — a pipe table

Write a GitHub-style pipe table. The first row is the header row.

```markdown
| Kilograms | Cost ($) |
|---|---|
| 1 | 4.50 |
| 2 | {{=9.00}} |
| 3 | {{=13.50}} |
```

Becomes one **table** — a single numbered problem whose blank cells are lettered
(a), (b), … rather than each consuming a problem number.

**Blanks work in cells exactly as they do in prose** — every sigil applies
(`{{=…}}` numeric, `{{==…}}` math, `?hint`, `!wrong :: message`). Prefer a
numeric blank for a numeric cell, same as anywhere else.

### Headers down the left — the ```table fence

A pipe table always puts its headers across the top. Many algebra tables are
transposed (`x` down the left, `y` across), and some have no headers at all.
Wrap the same pipe rows in a ` ```table ` fence and say which axis carries them:

```markdown
```table
header: column
| x | 1 | 2 | 3 |
| y | 5 | {{8}} | {{11}} |
```
```

`header:` takes `row` (the default — same as a bare pipe table), `column`,
`both`, or `none`.

Use the fence **only** when you need a non-default header axis; a plain pipe
table is the normal way to write one.

### Column alignment

The delimiter row's colons carry through to the printed page — `|---:|` is a
right-aligned column, `|:---:|` centred, `|:---|` or `|---|` left.

```markdown
| Step | Value |
|:---|---:|
| Start | 12.50 |
```

Right-align numeric columns; it is what makes a table of figures readable on
paper.

### Watch for

- **Order-independent blanks (`~`) group by READING ORDER**, left to right then
  top to bottom — the same rule as anywhere else, but worth stating because a
  table makes columns look like groups. Two blanks that sit one above the other
  in the same column are **not** adjacent, so `{{~…}}` will not pair them. It
  pairs cells that are side by side in the same row, or the last cell of a row
  with the first cell of the next.
- **Merged cells are not supported** and are not planned. Every row has the same
  number of cells.
- **Cells hold a single line** of text, math, and blanks — no lists, no images,
  no paragraph breaks inside a cell.
- **A caption** is just a paragraph above the table.

## Columns blocks (```columns fence)

A fenced code block with the `columns` language tag becomes a **multi-column (side-by-side) row** — the same layout you get from the editor's "Split into columns" / "2 columns". Columns are divided by a line that is **only** `---`; each column then holds one block per non-blank line, with the same list/heading/image grammar the example fences use.

```
```columns
Definition
A prime has exactly two factors.
---
Example
$$7 = 1 \times 7$$
The blank: {{2}} is the smallest prime.
```⠀
```

- **Columns** — 2 to 6, separated by a `---` line on its own. Fewer than two columns imports as plain text with a warning; more than six is clamped to six (the extras are dropped, with a warning).
- **Content** — one block per non-blank line inside each column, the same line grammar as `worked`/`faded`: a line that is only `$$…$$` becomes a displayed equation, a line containing a `{{blank}}` becomes a fill-in-the-blank, consecutive `-`/`*` (or `1.`) lines group into **one** list, `#`/`##`/`###` make headings, `![alt](https://…)` on its own line is an image, and every other line becomes a paragraph (with `**bold**`, `*italic*`, `` `code` ``, and `$inline$` math). A blank line ends a list run. An empty column gets a single empty paragraph.
- **`options:`** — a line anywhere in the fence, setting the **whole row** (it describes the row, so its position inside the fence does not matter):
  - `options: ruled` — draw the ruled grid: a box around the row, a vertical rule between columns, and a horizontal rule between stacked blocks in a column. **Boxed regions to write in or cut out** — not ruled lines to write *on*, which the platform does not have.
  - `options: unruled` — never draw it, even when the activity-wide setting rules every row. This is how one row opts out.
  - Say nothing and the row stays `inherit`: **⚙ → Print → grid lines** decides. Ruling is off by default, so an activity that never mentions it is unruled everywhere.
- **A figure beside its question** — a column whose **first line is `figure:`** is read, whole, as one [```figure](#geometry-figures-figure-fence) (the same lines, no inner fence; the curriculum side confirmed this syntax in C-36):

  ```
  ```columns
  figure:
  alt: Triangle PQR with sides PQ and QR marked equal
  point (0,0) "P"
  point (3,1.73) "Q"
  point (6,0) "R"
  polygon P Q R
  ticks PQ 1
  ticks QR 1
  ---
  By its sides, PQR is {{isosceles}}.
  ```⠀
  ```

  The whole column is the figure: text goes in the other column, and blank lines inside it split nothing (only `---` ends it). It keeps its own `alt:`, its own "Not to scale" caption, `to scale` and `plane: on`, and every figure check. **Limits, each a figure problem** (a batch import skips the file; the paste dialog warns): a row with a figure column has **2, 3 or 4 columns**; two figures in one row may not share a caption; an `options:` line belongs in the **text** column, never the figure column.

  **Figures as choices.** `figure: A` gives the figure a **caption** — the text after the colon, at most 12 characters, drawn in bold above the figure and read first by a screen reader ("Figure A: …"). It is authored, never derived from position, so it can be a letter or a word (`figure: Before`). Put 2–4 captioned figures in one row, then ask with a plain `mc` whose choices are the letters and `options: keep-order`. A standalone `figure` fence takes the same thing as a `caption: A` line. **In a choice figure, `alt:` describes what is drawn and never names the transformation or property the question asks about.** Small figures keep readable labels automatically: at three per row labels and marks are drawn 1.3× larger, at four per row 1.75×, and a `plane: on` figure at three or four per row shows its grid with no numbers on the axes. Below about 960px a four-figure row becomes two rows of two. On a screen narrower than about 656px a row holding a figure stacks, so the figure keeps its full size.
- **Not here** — nested question fences (`mc`, `match`, `graph`, …) inside a column have no Markdown round-trip; author those in the editor after import. Column widths and reserved work space also default (adjust them in the editor's column toolbar).

## Callout blocks (```callout fence)

A fenced code block with the `callout` language tag becomes a **tinted note box** — the same block as the editor's "Callout". Use it for a tip, warning, or aside.

```
```callout
variant: warning
Double-check your units before submitting.
```⠀
```

- **Variant** — an optional `variant:` line picks the style: `info` (default), `warning`, `success`, or `note`. `tip` aliases `success` and `warn` aliases `warning`; an unrecognized variant warns and falls back to `info`.
- **Body** — every non-`variant:` line is the note text, joined into one inline run (`**bold**`, `*italic*`, `` `code` ``, and `$inline$` math). A callout with no body imports as plain text with a warning.
- **Not here** — a callout body is a single rich-text line; multi-block content (lists, several paragraphs) inside a callout is editor-only.

## Rich definitions (```definitions fence)

`[[term :: definition]]` covers a one-line gloss. When a definition needs a **displayed equation, a list, an image, or a coordinate-plane figure**, put it in a fenced block with the `definitions` language tag and reference it from the text with `[[term]]` — no `::`.

```
```definitions
term: Slope
Steepness of a line — rise over run.
$$m = \frac{y_2 - y_1}{x_2 - x_1}$$
### Watch for
- A horizontal line has slope $0$
- A vertical line has no slope
graph: line y = 2x
---
term: Intercept
Where the line crosses an axis.
```⠀

Find the **[[Slope]]** of the line, then check its [[intercept]].
```

- **Entries** — separated by a line containing only `---`, each headed by a `term:` line. Everything after it is that term's definition.
- **Entry bodies use the same line rules as the [reference sheet](#reference-sheet-reference-fence)** — `$$…$$` displayed equations, `-`/`1.` list runs, `#`–`###` headings, `![alt](url)` images, `graph:` runs sharing one grid, and `axes:` windows. It is one shared grammar, not two.
- **Referencing** — `[[term]]` with no `::` looks the term up, **case-insensitively**. The fence may sit anywhere in the document (top or bottom); references resolve either way. A `[[bracketed phrase]]` that is neither a `::` definition nor a fence entry stays literal text. (In a catalogue file imported with a course glossary, it is looked up there next — see [Course glossary](#course-glossary-batch-import---glossary).)
- **Literal brackets** — write `\[[like this]]` and the brackets print as they are: never a definition, never looked up, never warned about. Inside a code span the backslash is kept, because in code it is a real character.
- **Side channel** — like `reference`, this fence contributes **nothing** to the worksheet body; its content travels inside the marks that reference it. A term defined but never referenced simply goes unused.
- **One entry per term** — a duplicate `term:` warns and keeps the first.
- **Not here** — columns and callouts are not valid definition content, and a definition can never contain another definition or a question (`{{…}}` stays literal). Blocks outside the allowed set are dropped with a warning.
- **Printing** — definition pop-ups don't exist on paper. Turn on **⚙ → Print → "Include a glossary of defined words when printing"** to add every defined term as a glossary at the end of the worksheet.

## Course glossary (batch import, `--glossary`)

A course keeps its vocabulary in ONE glossary file, and a catalogue activity
can name a word from it with a plain `[[term]]` — no fence in the activity.
This is **batch import only** (`pnpm import:batch`); a paste into the app has
no glossary and resolves only the activity's own definitions.

### How a `[[term]]` resolves

1. **The activity's own definition wins** — a ```definitions entry or an
   inline `[[term :: …]]` anywhere in the file. It wins under ANY name of the
   glossary entry it matches: an activity that defines *gradient* itself turns
   `[[slope]]` into its own definition too, when `slope` is gradient's US name.
2. **Otherwise the course glossary**, matched on the term or its US variant,
   case- and accent-insensitively. The mark keeps the text you wrote and
   carries the entry's id plus a copy of its definition, so print and a
   first tap offline still have something to show; on screen the student sees
   the glossary's current wording once it loads.
3. **Otherwise it stays literal**, and the import names it:
   `unit/a.md:12 [[gradiant]] — not in the course glossary or this activity, left as plain text; did you mean “gradient”?`
   Under `--strict` that fails the run. A word the glossary has RETIRED counts
   as not found — retirement stops new references without breaking old ones.

Which glossary: with `--glossary <file>`, that file (it is about to be
mirrored). Without it, the glossary the store already holds for `--owner`. If
the database has no glossary table yet (migration 0043), the run says so in one
line and checks only the activity's own definitions.

### The glossary file — PROPOSED v1 format

The curriculum side owns this file and its format; this is the platform's
proposal (docs/design/glossary.md W-2), and only the loader changes if they
choose otherwise. It is the ```definitions grammar above plus header lines at
the top of each entry:

```
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
```⠀
```

- **`id:` is required and permanent.** It is the entry's identity in the store
  and in every published mark that points at it. It is never derived from the
  term, so fixing a spelling in `term:` is not a rename. Lower-case letters,
  digits, `.`, `_`, `-`. (Not `key:` — that already means an activity's
  identity in the meta fence.)
- **`us:`** is the one variant key v1 knows: the US word for the same idea.
  Students see it as a second line under the term, and it matches `[[slope]]`
  exactly like the term does. Any other two-letter key is reported (a typo
  until someone decides it is a new locale).
- **Header lines come first**, before any definition text. The header ends at
  the first line that is not `id:`, `term:` or a two-letter key.
- **Cross-links are automatic.** When one definition mentions another entry's
  word, the student can tap through to it; do not write `[[…]]` inside a
  glossary definition.
- Every problem is reported as `<file>:<line> <id> — <problem>; <fix>`, and
  every one fails `--strict`: a missing or malformed `id:`, a duplicate id or
  term (the first is kept), a variant that is already another entry's word
  (dropped), an answer gap `\gap{…}` in a definition, an entry over 16 KB,
  more than 2,000 entries, or more than 1 MB of definitions in total (a live
  run then refuses to mirror until it is smaller).

### What a run does with it

- **Mirrors the file into the store**, in one database transaction before any
  activity is written: new and changed entries are written; an entry that is no
  longer in the file is **retired, never deleted** (published worksheets keep
  showing it); an id that comes back is un-retired.
- **Refuses a mass retire** — more than 25 entries, or more than 20% of the
  active ones (and more than 5) — before writing anything, printing the list.
  That shape is usually the wrong file. `--allow-mass-retire` lets it through.
- **Prints a glossary report** every run: entries, variants and cross-links in
  the file; what the store would gain or lose; how references resolved; and
  every activity definition that SHADOWS a glossary entry — DIVERGENT ones in
  full (an override, or drift?), identical ones as a count (the local copy can
  go; listed in full on a dry run).
- **`--dry-run --glossary <file>`** resolves every reference against the file
  and reports exactly what a live run would write — the database computes the
  plan — and writes nothing.
- A failed mirror is loud and the import carries on (references still resolve
  against the file); under `--strict` it fails the run.

### Hello world

```bash
BATCH_IMPORT_OUTPUT_ROOT=$(mktemp -d) pnpm import:batch scripts/fixtures/glossary/demo \
  --owner <a local teacher> --glossary scripts/fixtures/glossary/glossary.fixture.md --dry-run
```

The demo activity references `gradient`, `slope` (gradient's US name) and
`y-intercept`; the report shows all three resolving from the glossary.
`BATCH_IMPORT_OUTPUT_ROOT` keeps the run from rewriting the repo's generated
manifests with the demo's. The store's read side has its own hello world:
`scripts/verify-0043.sql` seeds entries and reads them back as a student.

## Seeded variables (```seed fence)

A fenced code block with the `seed` language tag declares **per-student seeded
variables** (wishlist #6). Like ```meta it is a side channel — it contributes no
body blocks; the declarations land on the activity's meta (`seedVars`). Each
student is SERVED their own values (derived deterministically from the
published version + the student, so a reload never re-rolls) and GRADED against
those same values. The specs, one flat `name: spec` line per variable:

```
```seed
a: int 2..9                (one whole number, 2–9 inclusive)
p: list 1.50, 1.75, 2.25   (one value drawn from the authored list)
scores: sample 8 of 55..99 (8 DISTINCT whole numbers — a dataset)
```⠀
```

- **Prose references**: `{a}` anywhere in plain text renders the student's
  value ("You buy {a} pens at ${p}."). A `sample` variable renders as a
  comma-separated list.
- **Blank answers as expressions**: `{{=a*p}}`, `{{=mean(scores)}}` — evaluated
  per student at grade time. Math blanks bind too: `{{==a*x + p}}`.
- **Mistake matchers as expressions**: `{{=a*p|!a+p :: Multiply, don't add.}}`
  fires on each student's own add-instead-of-multiply value. A literal numeric
  matcher on a seeded blank warns — it would fire for one seed only.
- **Datasets**: a ```dataplot fence may write `data: {scores}` to draw each
  student's dataset from a declared `sample` variable (the stored literal is a
  representative stand-in for previews).
- **Not in math**: `{a}` inside `$…$` is a LaTeX brace group, not a reference —
  the importer warns. Keep references in plain text.
- **Names**: lowercase `[a-z][a-z0-9_]*`; reserved words (math constants and
  functions — `pi`, `e`, `mean`, `min`, … — plus `x`/`y`) are refused.
- **Validation**: an undeclared `{name}`, a declaration nothing references, a
  brace reference with no fence at all, and the latex/matcher cases above all
  warn (`--strict` fails).

Teachers should know: **print uses its own seed per version** (Version A/B
papers), and the editor shows the declared variables read-only — the `.md`
file is the authoring surface.

## Activity metadata (```meta fence)

A fenced code block with the `meta` language tag **files** the activity — it says
what course and unit the activity belongs to, what topics it covers, and what
role it plays in your sequence. Like ` ```reference `, it contributes **nothing**
to the worksheet body; unlike every other fence it carries no content at all,
only labels.

Plain `key: value` lines, one per line:

    ```meta
    title: Factoring Trinomials
    course: Algebra I
    unit: Quadratics
    tags: factoring, vertex form, word problems
    role: lesson
    ```

| Key | Meaning |
|---|---|
| `title` | the activity's name. **Include it in every activity** — without it the import lands as "Untitled activity" and you rename it by hand, which is the single biggest cost when importing a catalogue. |
| `course` | the course this belongs to (e.g. `Algebra I`). Shown to students. |
| `unit` | where it sits in the year (e.g. `Quadratics`). Optional. |
| `tags` | comma-separated topic labels, used to find activities **across** units. Normalized on the way in: lower-cased, trimmed, inner spaces collapsed, duplicates dropped. Accents and macrons are preserved. |
| `role` | exactly one of `lesson`, `review`, or `practice` — how the activity is used in the sequence. Anything else warns and is skipped. |

### Catalogue keys — only for files imported by `pnpm import:batch`

Three keys exist for the **curriculum catalogue** — the folder of `.md` files the
batch importer reads. They are **carried, never applied**: nothing in the
document, nothing a student is served, nothing the editor shows. A paste into
the app may contain them and they are inert there.

| Key | Meaning |
|---|---|
| `key` | The activity's **permanent identity**, e.g. `act.rate.unit-rate`. This is what lets you move, rename or re-file the `.md` without orphaning its activity — the importer matches on this first and treats the path as "where the file currently sits". **Minted once, never changed, never reused after an activity is deleted.** Changing it in place is retiring one activity and minting another, and the importer refuses it with that explanation rather than doing it silently. Required under `--strict`. |
| `skill` | The **one** primary skill this activity targets, e.g. `rate.unit-rate`. Validated against `--skills-registry`. Exactly one — a comma here warns and is ignored, because "targets exactly one primary skill" is the rule this key exists to make checkable. Required under `--strict`. |
| `supporting_skills` | Other skills the activity touches, comma-separated. Same validation. **Spelled in full rather than `skills`** deliberately: `skill` and `skills` differ by one character and mean different things, and the plural is the likelier typo — it would leave the activity with no primary skill at all. A file that says `skills:` gets a warning naming both keys. |

**`unit` usually comes from the chain, not from the file.** A chain registry
maps each chain folder to the unit title, so renaming a chain is one line rather
than an edit to every activity in it. The run reads it from
`--chain-registry <file>`, or without that flag from `chain-registry.txt` in the
catalogue root. With the flag, a copy left in the root is **not** read, and the
run prints a line saying so. A file
may still state its own `unit:` and it wins — and the run reports that as an
override, but only where it **differs** from the chain's registered title.

#### `x_` — the reserved namespace

Any key beginning `x_` is **skipped silently**: no warning, no storage, no
validation. It exists so the curriculum builder's own bookkeeping (which skills
each review item retrieves, and so on) can live in the activity file instead of
a parallel document that would drift from it.

    x_review_skills: ratio.equivalent-ratios, rate.unit-rate
    x_dol_skills: rate.unit-rate, ratio.equivalent-ratios

Because nothing validates the namespace, a typo in one of these names is
invisible — so every run prints a **receipt** naming the `x_` keys it ignored
and how many files carry each. That line is the namespace's only sensor; read it
the way you read the binding manifest.

### Settings — how the activity behaves

The same fence carries the activity's **settings**. Set them when the kind of
activity implies them; omit them to take the defaults. Values are matched
case-insensitively with spaces and hyphens folded to underscores, so
`Exit Ticket` and `exit-ticket` both reach `exit_ticket`.

| Key | Values (default first) | What it decides |
|---|---|---|
| `type` | `worksheet`, `exit_ticket`, `warm_up`, `review`, `quiz`, `exam` | The activity's **format**. `quiz` and `exam` mark a printed, supervised assessment (print it from the draft; never publish or share it). Separate from `role`, which is where it sits in your sequence — both vocabularies offer a "review". |
| `submission` | `free`, `locked`, `single` | Where the **Check** buttons go and what each one covers. A Check appears at every `{checkpoint}` section and covers **everything since the previous checkpoint** — and the end of the activity is always a checkpoint, so no section is ever left unchecked. `free` = students may re-check as often as they like. `locked` = the same buttons, but answers **freeze** when a group is checked, and there is **no undo** — not for the student, not for you; re-publishing is the only reset and it resets the whole class. `single` = ignore every `{checkpoint}`; one Check at the very end. (`single` is exactly `free` with no markers — it is kept because it states the intent plainly.) |
| `feedback` | `on_check` | `on_check` hides correctness until the student presses Check. **`immediate` is reserved and not active yet** — the importer accepts it with a warning and the activity behaves as `on_check`. It cannot be combined with `submission: locked` at all: automatic checking would lock each section the moment it was answered. |
| `calculator` | `off`, `scientific`, `graphing` | Whether the calculator tool is available, and which kind. Finer restrictions (trig, logs, regression models, expression caps) stay in ⚙ → Calculator. |
| `work` | `3 lines` (default none) | **Blank writing room under every problem on paper.** Also accepts `1in`, `2.5cm`, `4mm` or a plain number (rem). One line is about 8mm — between college- and wide-ruled. Without it a printed worksheet gives the student nowhere to work. |

Typical pairings: an exit ticket or quiz is `submission: locked` (use it
sparingly — it cannot be undone); a practice sheet is `submission: free`,
which is the default and needs no key at all.

⚰ **`revision:` and `grading:` were removed 2026-08-24.** `revision` asked
whether students could resubmit after a final submit, and there is no submit —
re-checking is what `submission` governs. `grading` claimed to choose who
scores the activity, which is decided per question by what kind of question it
is. A file still carrying either gets a warning naming it, and imports fine
otherwise.

**Still editor-only** (no import syntax, set in ⚙): the rest of print layout
(paper size, margins, columns, font size, problem spacing, the printed header),
typography, and the calculator's detailed restrictions. **`work` is the one
print field the fence reaches**, because a printable catalogue that imports with
no writing room needs a ⚙ visit per activity — the same per-activity tax the
`title` key exists to remove.

**Per-PROBLEM work space stays editor-only too** (each problem's own settings in
the editor). Ruled 2026-08-21: most problems on a sheet want the same room, and
the one block type that would most need a per-problem key — an inline
`{{blank}}` — has no fence to hang one on. Revisit if uniform spacing starts
costing more than it saves.

- **Nothing is ever overwritten.** A key applies **only where the activity has
  no value yet**: a title still reading "Untitled activity", an unset unit, an
  unclassified role, a course still on the default, a setting still on its
  default, no calculator configured. If the paste disagrees with something you already set, your value
  wins and the import warning tells you what was ignored. This matters because
  an AI writing to this format will tend to emit a `meta` fence on *every*
  reply, including when you are only pasting one extra section into a finished
  activity — that paste must not silently rename your course.
- **Tags are the exception, and they union.** Imported tags are added to
  whatever the activity already has; adding a tag can't destroy one, so there is
  nothing to protect. Nothing is ever removed by an import.
- **Role words don't belong in tags.** `lesson` / `review` / `practice` go in
  `role`. A tag named "review" is a different (and worse) thing than the role.
- **Side channel** — the fence produces no body block, no panel content, and no
  glossary entry. It may sit anywhere in the document.
- **Unknown keys warn rather than fail.** A typo'd key is skipped with a
  message; it never costs you the body content in the same paste.
- **`role` and `type` are different settings, and BOTH are importable.**
  `role` is how the activity is used in your sequence (the Bank role: lesson /
  review / practice); `type` is the activity's *format* (worksheet /
  exit_ticket / warm_up / review / quiz / exam) — see the settings table above. Both
  vocabularies offer a "review" and they mean different things, which is the
  whole reason they are named apart. *(This bullet said `type` was "not
  importable" until 2026-08-20 — true before the settings slice, false after
  it, and it contradicted the table 30 lines above. Corrected.)*

## Numbering: don't write your own question numbers

Found in the pilot (2026-08-21), and it is the trap most likely to bite a
catalogue written in bulk.

**The platform numbers questions itself**, on screen and on paper, from one walk
over the document. Writing `1.` in front of a question is *harmless* — the line
becomes a numbered problem and your marker is stripped, so what prints is the
platform's number, once.

**The failure is a numbered line that is not a question**, and it has two
shapes — measured 2026-08-21, because the first version of this note guessed and
got it wrong:

| where the numbered non-question sits | what you get |
|---|---|
| directly among your questions (same run of lines) | demoted to plain prose, its number dropped — harmless, but not what you wrote |
| separated from them by anything else — a fence, a paragraph | its own `ordered_list`, **restarting at 1** |

The second is the one that reaches paper wrong. `OrderedListBlock` carries no
start offset and the viewer renders a bare `<ol>`, so a stray numbered
instruction after a `columns` fence prints like this:

```
1.   What is the rate of change? ____        ← problem 1
     [a ruled table]
1.   Explain what it means in context.       ← the list, restarting at 1
2.   (short answer)                          ← problem 2
```

Two items labelled `1`, and an answer key that matches neither.

**So:** write instructions as plain sentences, and let every numbered item be a
real question. A numbered list is still the right tool for *steps inside* a
worked example or a reference sheet, where no problem numbering is in play.

## Geometry figures (```figure fence)

A fenced code block with the `figure` language tag draws **one labelled geometry figure** in the worksheet body: triangles, polygons, angles, parallel lines. It is a static picture (never interactive), drawn by the same engine as every other figure, so it looks identical on screen and on paper. Points are placed by coordinates and labelled independently, so a figure is **not to scale** unless you say so, the way NZ textbook and assessment figures are. Design: [y7-figures-and-charts.md](design/y7-figures-and-charts.md).

```
```figure
alt: Triangle ABC with AB = 8 cm, AC = 6 cm and angle A = 68°
point (0,0) "A"
point (8,0) "B"
point (2,5) "C"
polygon A B C
side AB "8 cm"
side AC "6 cm"
angle BAC 68°
angle ABC "x"
angle ACB right
ticks BC 2
segment A C dashed
text (4,-1.5) "base"
```⠀
```

| line | draws |
|---|---|
| `alt: …` | the figure's accessible name: what a screen reader says. **Required** (see "Problems" below). |
| `caption: A` | a short label (at most 12 characters) drawn in bold above the figure and read first by a screen reader. Optional. In a `columns` figure column the same thing is written `figure: A`. |
| `point (x, y) "A"` | a named point. The name is what every other line refers to; its letter is drawn outside the shape. `point (x, y)` with no name draws a dot. |
| `polygon A B C …` | the outline through the named points. `region A B C …` draws it shaded. |
| `segment A C` | a line between two points; add `dashed` for a height, a hidden edge or a construction line. |
| `side AB "8 cm"` | a side label, placed outside the shape beside that side (further out when the side also has ticks or arrows). |
| `angle BAC 68°` | the angle **at the middle letter** (A), from AB round to AC: under 180° unless you add `reflex`. The label is a degree value (`68°`), `right` (the small square only, never square + arc), or quoted text (`"x"`). **No label** draws the arc alone. |
| `ticks BC 2` | equal-length marks on a side: 1, 2 or 3 (default 1). Sides with the same count are equal. |
| `parallel AB DC` | arrow marks on two sides, pointing the way each side is written; add `2` for double arrows. |
| `text (x, y) "base"` | free text at a point: the escape hatch when the automatic placement puts a label somewhere unhelpful. |
| `line y = 2x` / `ray (a,b) (c,d)` | the `show:` forms of the `graph` fence, unchanged. (`expression` is never drawn in a figure.) |
| `cuboid 4 2 3 cm units` | a cuboid of length 4, width (depth) 2 and height 3 in cabinet oblique (45°, depth at half scale, receding up and right). The unit word is optional: with it the three dimensions are labelled outside the solid (length below, height on the left, depth beside the receding edge); without it, no labels. `units` draws the unit-cube grid on the three visible faces (whole-number dimensions, at most 12 each). The three hidden edges are dashed. |
| `hidden: off` | leaves out every cuboid's dashed hidden edges. |
| `to scale` | removes the automatic **"Not to scale"** caption, for a drawing that is accurate (an angle to estimate). |
| `plane: on` | shows the coordinate grid, axes and tick labels (coordinate work, transformations). Without it a figure is **plane-less**: no grid, and x and y share one scale so angles look true. |
| `axes: -2..10, -2..7` | the window. Normally leave it out: the figure fits itself to everything it draws, labels included. |

- **Names** resolve after the whole fence is read, so lines can come in any order. Names written together (`AB`, `BAC`) or apart (`A B`) both work, and multi-letter names (`A'`, `P1`) are matched longest first. A coordinate `(x, y)` can stand in for any name.
- **One fence is one figure.** Blank lines are ignored (unlike `reference`, where a blank line ends a figure).
- **Labels** are a degree value, `right`, or text in quotes. Never unquoted text (`angle ABC x` is a problem), never an empty `""`.
- **"Not to scale"** prints under every plane-less figure as a real caption, read by screen readers after the `alt:` text. A `plane: on` figure never has one.
- **Placement is automatic.** There are no offset settings: vertex letters sit outside each corner, side labels outside each side, angle labels inside each angle on its bisector. If one lands badly, use a `text` line.

**Problems.** A line that cannot be read (an unknown point name, an unquoted label, a tick count of 4) is **skipped**, and a line that describes impossible geometry (a 0° or 180° angle, a polygon with no area, a side from a point to itself) is **refused**. Each problem names its line, and a figure missing its `alt:` line, or with nothing drawable at all, is a problem too. What happens next depends on how you import:

- **Paste dialog:** the problems are listed as warnings, and the figure imports with the lines that worked, so you can see it and fix it in the editor. A fence with nothing drawable adds no block (never the raw fence as text).
- **Batch import (`pnpm import:batch`):** the file is **skipped**, in every run, with or without `--strict`. It is not written, it is named in the report, and the run exits 1. In a geometry activity the marks are the answer: a tick dropped on a typo turns an isosceles triangle scalene while the answer key still says isosceles.

**Not here (v1):** dimension lines and arrowheads on segments, seeded values in labels, and figure names inside multiple-choice or matching choice figures (each choice carries one drawable, so there is nothing for a name to refer to). Choice figures and `reference` figures keep the `show:` forms.

## Statistics charts (```chart fence)

A fenced code block with the `chart` language tag draws **one statistics chart of category data** in the worksheet body: a bar chart, clustered or stacked bars, or a time-series line. It is a picture to read from (never interactive), so the questions about it go in the blocks that follow. The `dataplot` fence is the other statistics block: it draws ONE numeric data set on a number axis (dot plot, histogram, box plot) and can be a graded "build the chart" question.

```
```chart
type: clustered
title: How we get to school
xlabel: Day
ylabel: Number of students
categories: Mon, Tue, Wed, Thu, Fri
series: Walk = 12, 7, 15, 9, 4
series: Bus = 4, 6, 3, 5, 2
y: 0..20 step 5
```⠀
```

| line | does |
|---|---|
| `type: bar` | `bar` (one series), `clustered` (series side by side), `stacked` (series on top of each other) or `line` (a time series). Left out, it is `bar`; a `bar` with more than one series is stored and drawn as `clustered`. |
| `title: …` | drawn above the chart, and the chart's accessible name. **Required** (see "Problems"). |
| `xlabel: …` / `ylabel: …` | the axis names. The y label is written horizontally above the axis, never rotated. |
| `categories: Mon, Tue, …` | the labels along the bottom, comma-separated, **at most 12**, drawn in the order written. A label wraps to two lines at about 10 characters; one over 20 characters is reported. |
| `series: 12, 7, 15` | one number per category, in the same order. Numbers are 0 or more. |
| `series: Bus = 4, 6, 3` | a **named** series: the name (everything before the first `=`) becomes a legend entry. **At most 4** series. |
| `y: 0..20 step 5` | the value axis's top and step (`step` optional). It must start at 0 and reach the data. Left out, the top is the next 1, 2 or 5 × 10ⁿ step at or above the largest value (for `stacked`, the largest total). |
| `alt: …` | optional: one sentence for screen readers, used as the chart's name in place of the title. |

- **The value axis always starts at zero.** There is no way to truncate it.
- **Lines may come in any order**, and blank lines are ignored. One fence is one chart.
- **Series 2, 3 and 4 carry a hatch pattern** (diagonal, cross, dots) as well as a colour, and the legend shows it, so stacked and clustered bars still read on a grayscale printout. On a `line` chart each series has its own dash pattern and marker shape for the same reason.
- **A `line` chart is a time series on evenly spaced categories**: the points are joined in the order written. There is no real time scale, so write the categories as the times (`Mon, Tue, …`, `Jan, Feb, …`).
- **Screen readers** get the chart's numbers as a table (caption = title, one column per category, one row per series), built from the same data and always present.
- **Numbers of five or more digits** are written with a thin space (`12 000`).
- **In the editor** the block shows the chart with a **Chart source** button: the same lines as the fence, re-read by the same parser when you press Apply.

**Problems.** A line that cannot be read (an unknown key, a series with a value that is not a number, a series with the wrong number of values, a `y:` that does not start at 0 or does not reach the data) is **skipped**. Data the chart cannot hold (more than 12 categories, a fifth series, a negative value, an empty category name) is **refused**. A chart with no `title:`, and a chart with several series where one has no name, are reported too.

- **Paste dialog:** the problems are listed as warnings, and the chart imports with the lines that worked. A fence with no `categories:` or no usable `series:` adds no block (never the raw fence as text).
- **Batch import (`pnpm import:batch`):** the file is **skipped**, in every run, with or without `--strict`, exactly as for a `figure` problem. A dropped series is a chart showing the wrong data, and every question about it is then a wrong question.

**Not here (v1):** a chart inside a `columns` column, a chart in the reference sheet, a width setting in the fence (set the width in the editor), per-series colours, rotated labels, a real time scale, and any student interaction (drawing the bars is a later, separate block).

## Reference sheet (```reference fence)

A fenced code block with the `reference` language tag fills the activity's **reference panel** — the summonable formula-sheet / vocab window students open from a button while working (it also prints as a box at the top of the worksheet). Unlike every other fence, its content does **not** land in the worksheet body: it is routed to the panel (the same content the editor's ⚙ → Reference panel surface authors). Panel content is purely something to *read* — it can never contain questions or blanks (a `{{…}}` stays literal text).

```
```reference
title: Linear equations cheat sheet
Slope-intercept form: $y = mx + b$
$$m = \frac{y_2 - y_1}{x_2 - x_1}$$
- $m$ — the slope (rise over run)
- $b$ — the y-intercept

Parallel lines have the same slope:
axes: -5..5, -5..5
graph: line y = 2x + 1
graph: line y = 2x - 3
```⠀
```

- **Title** — an optional `title:` line names the panel (the button students see). On import it fills an *untitled* panel; an existing panel title is never overwritten.
- **Line rules** — one block per non-blank line: a sole `$$…$$` line is a displayed equation; consecutive `-`/`*` (or `1.`) lines group into one bullet (or numbered) list; `#` / `##` / `###` make headings; `![alt](https://…)` on its own line is an image; every other line is a paragraph (`**bold**`, `*italic*`, `` `code` ``, `$inline$` math).
- **Graphs** — `graph:` lines add a **static graph figure** (a kit-free SVG picture, never interactive), using the same drawable forms as the `graph` fence's `show:` lines: `point (x, y) [open|closed] ["label"]`, `line`/`curve <equation or inequality> [dashed]`, `segment (a,b) (c,d)`, `ray (a,b) (c,d) [open]`, `region (x,y), …`. **Back-to-back `graph:` lines draw on one shared grid** ("these two lines are parallel" needs both on the same figure); any other line — including a blank one — ends the figure, and a later `graph:` run starts a new one. `expression` is not available here (it needs the calculator kit; the line is skipped with a warning).
- **Axes** — an `axes: -5..5, -5..5` line sets the window for the **next** figure (default −10..10, grid step 1). Fine-tune grid steps in the editor.
- **Append semantics** — importing adds to the end of whatever the panel already holds; it never replaces hand-authored panel content. A second `reference` fence in the same paste continues the same sheet.
- **Not here** — columns inside the panel and per-figure grid steps are editor-only after import. **Vocabulary definitions are not** in that list: `[[term :: text]]` and `[[term]]` (against a [```definitions fence](#rich-definitions-definitions-fence)) both resolve inside panel lines, so a formula sheet can carry tappable terms.

## Teacher guide (```teacher-guide fence)

A fenced block with the `teacher-guide` tag is the activity's **teacher guide**: a short note for the colleague teaching it — what the example sequence is for, what to watch for in the room, what to cut when time runs short, how to mark a rubric (curriculum D50; [teacher-guides.md](design/teacher-guides.md)). It is **teacher-only**: the read API deletes it from everything a student receives. Teachers see it in the editor (⚙ → Teacher guide) and as the **first page of the printed answer-key copy**.

````
```teacher-guide
## The sequence
One idea: a unit rate is the amount for exactly one, found by dividing the
total by how many.

## Watch for
- Dividing the wrong way round (`mis.rate.ratio-inverted`). Ask, "What do we
  want one of?"
- **Origin test (M):** says y = 8x gives \$0 at 0 GB.

## If time runs short
Cut practice item 3, then item 4.
```
````

- **Ordinary markdown** — unlike the `reference` fence's one-block-per-line grammar, the body is parsed as normal markdown, so wrapped lines join into one paragraph and a list item may continue on an indented line. Kept: `#`/`##`/`###` headings, paragraphs, bullet and numbered lists, `**bold**`, `*italic*`, `` `code` ``, `$inline$` and `$$display$$` maths.
- **Prose only** — anything else (a table, an image, a figure, a nested fence) is **dropped** with a warning naming it. A `{{…}}` stays literal text: a guide is never gradeable. Currency follows the body's rule: `\$` is always safe.
- **Placement** — anywhere in the file (it is read before the body, like `meta`); by convention, **last**. **One per activity**: a second fence is ignored with a warning.
- **Not checked here** — section names, their order, and the word cap are the curriculum's rules (their `check_guides.py`); this importer checks only what it alone can see.

