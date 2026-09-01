# Catalogue authoring prompt

<!--
  GENERATED — do not hand-edit. Regenerate with `pnpm prompt:catalogue`.
  Source: packages/app/src/lib/catalogueAuthoringPrompt.ts

  This file exists so the curriculum builder can point at ONE published
  source instead of keeping its own copy of the format rules. Editing it
  by hand recreates exactly the drift it was published to end;
  catalogueAuthoringPrompt.test.ts fails the build if it does.
-->

Paste everything inside the block below into the model that drafts
catalogue activities. It contains the shared import format **and** the
catalogue-only rules (`key:`, `skill:`, misconception bindings, the
`x_` namespace, and the two prohibitions that leak answers if broken).

The teacher-facing prompt in the app is deliberately different: it does
not teach `key:` or any registry-validated id, because an assistant with
no registry invents plausible ids and fragments the data they exist to
aggregate.

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
- options: (comma-separated) turn on grading behaviours:
    allow-no-solution     give the student a "no solution" choice
    no-solution-correct   make "no solution" THE correct answer and any drawn answer a decoy (a trick question)
    no-builtin-feedback   turn OFF the automatic mistake hints (swapped coordinates, swapped slope/intercept, …), which are on by default
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
- type: worksheet | exit_ticket | warm_up | review   (default worksheet)
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
  ```columns, ```callout, ```definitions, ```meta, ```table, and ```reference — only the
  single
  outer block that wraps the whole reply and those fences are allowed;
  anything unsupported imports as plain text.

When I describe the activity I want, reply with only that single code block.

CATALOGUE FILES — additional rules for the batch importer
Everything above still applies. These rules apply ONLY to .md files in the
curriculum catalogue, which are imported with `pnpm import:batch`.

THE META FENCE CARRIES THREE EXTRA KEYS
- key: act.<domain>.<name>
  The activity's PERMANENT identity, e.g. `key: act.rate.unit-rate`. Mint it
  once. Never change it, and never reuse the key of an activity that was
  deleted. It is what lets a file be moved, renamed or re-filed without the
  activity losing its history — the importer matches on this, not on the
  file path. Every catalogue file must have one.
- skill: <domain>.<name>
  The ONE primary skill the activity targets, e.g. `skill: rate.unit-rate`.
  Exactly one. It is checked against the skill registry, and an id that is
  not registered is an error, not a new skill — an unregistered id makes the
  activity count towards nothing.
- supporting_skills: <id>, <id>
  Optional. Other skills the activity touches. Same registry, same check.
  Note the spelling: `skill` is the primary, `supporting_skills` is the rest.
  There is no `skills:` key.

- chain_role: consolidation
  ONLY on a chain's closing activity — the one that teaches no new skill,
  interleaves the chain's skills so the student must decide which applies,
  and carries the chain's exit check. Its `skill:` is the chain's TERMINAL
  skill, which an earlier activity already taught in full. Omit the key
  entirely on every other activity; absent means `part`.

DO NOT WRITE A unit: KEY
- The unit an activity is filed under comes from its chain, through the
  catalogue's chain registry. Writing `unit:` in a file overrides that, and
  the import reports every file that does so. Leave it out.

MISCONCEPTION BINDINGS
- A wrong answer worth anticipating can name the misconception it senses, by
  appending a third segment: {{12 | !21 :: digits reversed :: mis.place-value.digit-reversal}}
  and, on a multiple-choice distractor: ( ) $4 per kg :: mis.roc.uses-endpoint-value
- Ids come from the misconception registry. NEVER invent one. If a wrong
  answer is worth anticipating and has no id, write the feedback text and
  leave a note for a human to add the id — an unregistered id fragments the
  data it exists to aggregate.
- A binding that can never fire is worse than none, because the data then
  reports that no student made the mistake. Two traps:
  * a `!` wrong answer that is actually equal to the correct answer never
    fires, because correctness is decided first;
  * pick numbers so the anticipated wrong answer is EXACT. If the mistake is
    "divided the wrong way", choose values whose inverse terminates (3/5,
    4/20). A non-terminating inverse fires for some students and not others,
    so the count is biased while looking healthy.

NEVER PUT A BLANK INSIDE MATHS
- A {{...}} blank inside $...$ or $$...$$ is not a blank. It is absorbed into
  the equation, so the ANSWER is shown to the student, the question is not
  marked, and any misconception binding is lost.
- Write the blank in the prose around the equation, or use \gap{answer}
  INSIDE the equation. \gap grades correctly and does not leak the answer,
  but it cannot carry a misconception binding — so if the item needs a
  sensor, the blank belongs outside the maths.

KEYS BEGINNING x_ ARE YOURS
- Any meta key starting `x_` is ignored by the importer: not stored, not
  validated, not warned about. Use them for your own bookkeeping, e.g.
  `x_review_skills:` and `x_dol_skills:`. Because nothing validates them, a
  typo in one of these names is silent — the import prints a receipt naming
  every x_ key it ignored, and that line is the only place a typo shows up.
```
