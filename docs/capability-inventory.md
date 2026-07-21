# Authoring capability inventory (code-derived)

Built from code, not docs: the Zod schema (`packages/schema/src`), the markdown
importer (`packages/app/src/lib/markdownToTiptap.ts`), the graph-kit
parser/scorer (`packages/graph-kit/src`), and the published-page runtime
(`packages/renderer/src/runtime`). Every claim below cites file:line. Where the
schema and the importer/renderer disagree, it is called out inline.

This is the source for the capability registry and the twin of the rewritten
authoring prompt.

> **Update (2026-07-21):** several items this inventory named are now resolved:
> - §4.B items 3–5 — blank **hints**, **per-answer (mistake) feedback**, and
>   **math-expression blanks** — are importable via the §2.1 grammar and
>   documented in the live prompt + `docs/markdown-import-format.md` (`ffe7d5f`).
> - §4.B items 1–2 — the graph options **`no-solution-correct`** and
>   **`no-builtin-feedback`** — are now documented in the prompt + doc.
> - §5 — the **registry seam** is BUILT (the B+ variant): `importFormatRegistry.ts`
>   + `importFormatRegistry.test.ts` bind the registry to the parser (a source
>   scan that fails on any undocumented fence/option — it's what caught the two
>   graph options above), the converter, and the prompt/doc.
> - §2.11 — the **callout** block is now authorable in the editor (`b4558b4`).
>
> Still open: choice/matching graph figures, definition-mark *import*, extra
> marks (underline/sub/superscript), in-equation math gaps, and activity-level
> settings — all still editor-only or unbuilt (each touches the parser, deferred
> so they land through the registry).

---

## 0. The one fact that reframes everything

There are **two different surfaces** and the hand-written prompt conflates them:

1. **The platform** — what a published activity can *do* (schema + renderer +
   runtime + editor).
2. **The import format** — the subset of the platform an author can reach by
   *pasting markdown* through `markdownToTiptap.ts`.

The prompt is an **import-format** prompt (it drives what an LLM emits for the
Import dialog — `markdownImportPrompt.ts:5`). So a capability can be:

- **On the platform AND importable** — belongs in the prompt.
- **On the platform but NOT importable** — cannot go in the prompt without
  inventing syntax the parser doesn't accept (that would create fresh
  documented-but-not-implemented drift). These are editor-only.

The two features you already knew were missing (**per-blank hints**,
**per-blank answer feedback**) are in the second bucket: they exist end-to-end
in schema/renderer/runtime/editor but **the markdown importer has no syntax for
them** (`markdownToTiptap.ts:717–760`, `makeBlank` parses only `~`, `=`,
tolerance, and `|` alternates). Meanwhile the *same* capability is importable
for multiple choice (`::`) and graphs (`mistake:`). The import DSL is
**asymmetric**, and that asymmetry — not a forgotten sentence — is the real
finding.

---

## 1. Import pipeline (how a fence becomes a block)

- Entry: `getMarkdownImporter()` → markdown-it (vanilla, `html:false`,
  `linkify:false`) → `tokensToBlocks` (`markdownToTiptap.ts:94–111`, `247`).
- Math is lifted out of the **raw** source before markdown-it runs, via
  `extractMath` / `MATH_SCAN` (`markdownToTiptap.ts:195–212`), so LaTeX
  backslashes survive.
- Two bespoke grammars resolved in the mapper, never by patching markdown-it:
  `{{answer|alt}}` blanks and `{checkpoint}` heading suffix
  (`markdownToTiptap.ts:16–28`).
- Recognized fence tags dispatch in `mapBlock` (`markdownToTiptap.ts:275–359`).
  **The complete set is 13:** `graph`, `mc`, `match`, `order`, `dataplot`,
  `numberline`, `objectives`, `explain`, `worked`, `faded`, `shortanswer`,
  `essay`, `columns`. Every other fence → plain text with a warning.
- Anything unsupported (tables, blockquotes, links, raw HTML, other code
  fences, strikethrough) degrades to text with a human-readable warning; never
  throws (`markdownToTiptap.ts:355–389`, `604–623`).

**Three artifacts must stay in sync** (per `markdownImportPrompt.ts:8–10`):
the parser (`markdownToTiptap.ts`), the prompt (`markdownImportPrompt.ts`), and
the human doc (`docs/markdown-import-format.md`). There is a guard test
(`packages/app/src/__tests__/markdownImportPrompt.test.ts`) but it checks the
prompt string's shape, not parser parity — which is how the asymmetry above
survived.

---

## 2. Block-by-block inventory

Legend for **Import**: ✅ importable · ⚠️ partially importable · ❌ editor-only.

### 2.1 Fill-in-the-blank (`fill_in_blank`)

- **Invoke (import):** any paragraph or list item containing `{{…}}`
  (`markdownToTiptap.ts:448–452`). A numbered/bulleted list where every item has
  a blank flattens to one block per item (`markdownToTiptap.ts:498–532`). Blanks
  are rejected inside headings (`allowBlanks=false`, `markdownToTiptap.ts:404`).
- **Student does:** types into inline blanks.
- **Graded:** per blank. Strategy chosen by `answerType`
  (`inline.ts:266`): `text` (exact string vs `answer` + `acceptableAnswers`),
  `numeric` (numeric equivalence within `tolerance` — decimals, fractions like
  `3/2`, mixed numbers, comma separators, leading `$`;
  `strategies.ts:9–16`), `math` (expression equivalence `2a ≡ a+a` via the lazy
  graph-kit, `strategies.ts:24–70`). Order-independent groups
  (`interchangeableWithPrevious`) scored consume-once
  (`inline.ts:244–255`, `blanks.ts:143–275`).
- **Feedback + when:** on section check (or submit). Wrong-answer lookup order:
  `mistakeFeedback` exact match → `hint` → generic ✗
  (`inline.ts:214–241`). Hints render as a `?` popover, mistake feedback as a
  `!` popover (`blanks.ts:22–23, 377–389`). `solution` (block-level, one for the
  whole problem) shows post-check regardless of correctness
  (`fill-in-blank.ts:17–19`). If activity `answerFeedback: 'immediate'`, solo
  blanks self-check on blur instead (`blanks.ts:320–325`).
- **Import syntax (`makeBlank`, `markdownToTiptap.ts:717–760`):**
  - `{{Paris}}` — text answer.
  - `{{oxygen|O2}}` — alternates.
  - `{{=12}}` — numeric (`=` prefix).
  - `{{=3.14 +- 0.01}}` / `± 0.01` — numeric with tolerance
    (`TOLERANCE_RE`, `markdownToTiptap.ts:715`).
  - `{{~3}}` — interchangeable with previous blank; combine `{{~=3}}`.
- **Constraints / gaps:**
  - **NOT importable:** `hint`, `mistakeFeedback` (per-answer feedback),
    `answerType:'math'`, `width`, Model-A in-equation math gaps. All are
    real, wired platform features (`inline.ts:64–96, 223–275`; renderer emits
    the math-blank kit URL at `blocks/fill-in-blank.ts:54–58`) with **no import
    surface.**
  - The `{{|}}` grammar forbids `{`, `}`, `|` inside an answer
    (`BLANK_SUB`, `markdownToTiptap.ts:217`).

### 2.2 Multiple choice (`multiple_choice`)

- **Invoke:** ```` ```mc ```` (`markdownToTiptap.ts:930`). ✅
- **Lines:** `prompt:`, choice lines `( ) text` / `(x) correct`, `solution:`,
  `options:` (`markdownToTiptap.ts:950–1021`).
- **Single vs multi-select:** `( )` → radio, `[ ]` → checkbox. **Any** square
  bracket, **or** more than one `(x)`, forces multi-select
  (`markdownToTiptap.ts:1029`; schema `multiSelect`,
  `multiple-choice.ts:76–79`).
- **Graded:** set equality (selected set == correct set), all-or-nothing
  (`multiple-choice.ts:6–9`).
- **Per-choice feedback:** `( ) 3 :: Check your addition.` — shown post-check to
  a student who picked it (`markdownToTiptap.ts:960–966`;
  `multiple-choice.ts:57–59`). ✅ (this is the MC analogue of a blank's
  `mistakeFeedback`).
- **Per-choice image:** `(x) ![alt](url)` anywhere in the choice; choice may be
  image-only (`markdownToTiptap.ts:972–988`). ✅
- **Options:** `confidence` only (`markdownToTiptap.ts:1013–1019`).
- **Constraints / gaps:**
  - **NOT importable:** per-choice **`graph` figure** (`ChoiceGraph`,
    `multiple-choice.ts:45–49`) — the "which graph shows…" case is editor-only.
  - Needs ≥2 choices and ≥1 correct or the block fails to plain text
    (`markdownToTiptap.ts:1024–1027`). Note the schema does **not** enforce
    ≥1-correct (`multiple-choice.ts:25–29`); the importer does.

### 2.3 Matching (`matching`)

- **Invoke:** ```` ```match ```` (`markdownToTiptap.ts:1085`). ✅
- **Pairs:** `item = option`; separator is the **last** unescaped ` = `, or the
  **first** ` -> ` when present (use `->` when both sides contain `=`); `\=` is a
  literal equals (`markdownToTiptap.ts:1150–1172`).
- **Distractors:** a line starting `=` or `->` adds an unmatched target
  (`markdownToTiptap.ts:1142–1148`).
- **Graded:** per pair, one point each; block-correct when all pairs right
  (`matching.ts:17–21`). Targets shuffled + lettered at publish; letters never
  authored (`matching.ts:64–66`).
- **Options:** `confidence`, `reuse` (`allowTargetReuse` → one target serves
  many items; card copies instead of moves) (`markdownToTiptap.ts:1128–1135`;
  `matching.ts:70–72`).
- **Figures:** `![alt](url)` on either side becomes that side's image
  (`extractSideImage`, `markdownToTiptap.ts:1050–1068`). ✅
- **Constraints / gaps:** **NOT importable:** item/target **`graph` figure**
  (`matching.ts:42–43, 50–51`), editor-only. Needs ≥2 pairs
  (`markdownToTiptap.ts:1183`).

### 2.4 Ordering (`ordering`)

- **Invoke:** ```` ```order ````; one item per line, **listed order = correct
  order**, shown shuffled (`markdownToTiptap.ts:1211`; `ordering.ts:5–8`). ✅
- **Leading `1.` / `2)` / `-` markers stripped** as decoration
  (`markdownToTiptap.ts:1248`).
- **Graded:** exact sequence equality, all-or-nothing
  (`ordering.ts:10–13`). Untouched list = omission, not an answer
  (`ordering.ts:15–17`).
- **Options:** `confidence`. Needs ≥2 items.
- **Constraints:** no figure slot on ordering items in the schema
  (`ordering.ts:19–20`).

### 2.5 Interactive graph (`interactive_graph`)

- **Invoke:** ```` ```graph ```` (`markdownToTiptap.ts:1881`). ⚠️ (most graded
  modes importable; see gaps).
- **Lines:** `axes:` (default `-10..10, -10..10`), `prompt:` (`$inline$` math
  ok, no blanks), `answer:`, `show:` (repeatable), `mistake:` (repeatable),
  `options:` (`markdownToTiptap.ts:1900`).
- **`answer:` forms & what grades** — the whole freeform line rides
  `parseGraphFormula` (`formula.ts:197`), which is **numeric, not symbolic**:
  it samples f(x) and fits families simplest-first (`formula.ts:108–184`).

  | `answer:` | Interaction | Graded on | Cite |
  |---|---|---|---|
  | `y = 2x+3`, `2x+3y=6`, `y-5=2(x-1)` | `plot_function` linear | slope+intercept | `graph-score.ts:255,300` |
  | `x^2 - 4` | `plot_function` quadratic | a,b,c | `graph-score.ts:260,306` |
  | `y = 2*3^x` | `plot_function` exponential | a,b | `graph-score.ts:265,311` |
  | `y = 1 + 2ln(x)` | `plot_function` logarithmic | a,b | `graph-score.ts:270,319` |
  | `x = 4` | `plot_function` vertical | x | `graph-score.ts:275,323` |
  | `y > 2x+1` (`<,<=,>,>=`) | `graph_inequality` | boundary + side + strict | `graph-score.ts:383–398` |
  | `(2,3), (4,5)` | `plot_point` | position ± tol (0.1) | `graph-score.ts:45` |
  | `ray (1,2) through (3,4) [open|closed]` | `plot_ray` | endpoint + direction ± 0.25 | `graph-score.ts:673–692` |
  | `segment (1,2) to (3,4) [open|closed]` | `plot_segment` | endpoints ± 0.25 | `graph-score.ts:706–745` |
  | `region (0,0),(4,0),(2,4)` | `shade_region` | area overlap ≥ 0.9 IoU | `graph-score.ts:750–787` |
  | `none` | trick "no solution" | selecting no-solution | `markdownToTiptap.ts:1941–1946` |

  **Hard limit (state as a rule):** those five families —
  **linear, quadratic, exponential, logarithmic, vertical** — are the *only*
  curves a graph `answer:` can grade. Anything else (`sin(x)`, rationals,
  cubics…) returns the `UNSUPPORTED_MSG` error and the block falls to plain text
  (`formula.ts:186–188, 234, 267`). Non-gradable curves can still be **drawn**
  via `show:` (display only).
- **`show:` forms (ungraded display Drawables):** `point (x,y) [open|closed]
  ["label"]`, `line`/`curve <equation> [dashed]` (inequalities shade; `for …`
  domains clip), `expression <formula> [dashed]` (any samplable formula),
  `segment (a,b) (c,d)`, `ray (a,b) (c,d) [open|closed]`, `region …`
  (`markdownToTiptap.ts:1989–2035`). `dotted` is a synonym for `dashed`
  (`markdownToTiptap.ts:1990–1998`). No `answer:` line → a static display graph.
- **`mistake:` — anticipated wrong answer + feedback:** `mistake: y = x + 2 ::
  Remember…`; `match` uses the same freeform syntax as `answer:` and is compared
  by the kit with scoring tolerances; authored match beats a built-in
  classifier (`markdownToTiptap.ts:1914–1928`;
  `interactive-graph.ts:413–423`). ✅
- **`options:`** (`markdownToTiptap.ts:1930–1937`):
  - `partial-credit` — fractional per-object scoring (multi-part answers). ✅
    documented.
  - `allow-no-solution` — student gets a "no solution" choice. ✅ documented.
  - `no-solution-correct` — **"no solution" IS the key; the drawn answer is a
    decoy** (implies allow-no-solution). ❗ **importable, undocumented.**
  - `no-builtin-feedback` — turns OFF the kit's built-in mistake classifiers
    (swapped coords, swapped slope/intercept, …; default ON,
    `interactive-graph.ts:407–412`, `mistakes.ts`). ❗ **importable,
    undocumented.**
- **Partial implementation / gap:** `answer:` + `show:` in the same block →
  the show drawables are **not drawn** inside a graded block; the importer emits
  a warning (`markdownToTiptap.ts:2042–2047`). Graded-stimulus-with-drawables is
  unbuilt. Also: `answer: y = 2x for x >= 0` (domain-restricted **function**
  answer) is deliberately **rejected** by the fence, steering to ray/segment
  (`markdownToTiptap.ts:1978–1982`) — the `plot_function.domains[]` field is
  scored for legacy pages only (`interactive-graph.ts:158–164`).

### 2.6 Number line (`number_line`)

- **Invoke:** ```` ```numberline ````. ✅
- **Lines:** `prompt:`, `answer:`, `axis:` (`-10..10 step 2`, optional →
  auto-fit), `solution:`, `options: confidence`
  (`markdownToTiptap.ts:1759–1836`).
- **`answer:` is EITHER** a point list (`-3, 4` → `plot_point`, ± 0.1) **OR** a
  single/compound inequality (`x >= 3`, `x < 5`, `-2 <= x < 5` → `plot_interval`
  ray/interval, ± 0.1). `>=`/`<=` closed endpoints, `>`/`<` open
  (`markdownToTiptap.ts:1807–1834`; `number-line.ts:47–86`).
- **Graded:** geometric, tolerance 0.1 line units (`number-line.ts:56, 82`).
- **Constraint (rule):** **no `show:` / display mode** — every number-line
  interaction is graded (`markdownToTiptap.ts:1755–1758`).

### 2.7 Data plot (`data_plot`)

- **Invoke:** ```` ```dataplot ````. ✅
- **Lines:** `prompt:`, `data:` (commas/spaces, repeatable), `axis:`
  (`0..20 step 5`, optional; step doubles as histogram bin width),
  exactly one of `answer:` / `show:`, `solution:`, `options: confidence`
  (`markdownToTiptap.ts:1609–1739`).
- **The answer is COMPUTED from `data:`** — there is no separately authored key
  (`data-plot.ts:21–26`). `answer: dotplot|histogram|boxplot` → graded build;
  `show: …` → static ungraded chart.
- **Graded:** dotplot/histogram = exact frequency-map equality, no tolerance;
  boxplot = five handles within `tolerance` (default 0.5; `answer: boxplot
  tolerance 1`), TI-84 exclusive-median key (`data-plot.ts:76–117`).
- **Constraints:** tolerance applies only to boxplot
  (`markdownToTiptap.ts:1681–1683`). Data outside the axis window is dropped
  from the chart and silently changes the computed answer → the importer warns
  (`markdownToTiptap.ts:1716–1720`). `maxFrequency` config
  (`data-plot.ts:50–53`) is **not importable**.

### 2.8 Free-text: self-explanation, short answer, essay

- **`explain`** → `self_explanation` (`markdownToTiptap.ts:1306`): prompt +
  optional `starter:` placeholder. **Ungraded**, no key
  (`self-explanation.ts:6–11`). ✅
- **`shortanswer`** → `short_answer` (`markdownToTiptap.ts:1505`): prompt,
  optional `starter:`, optional repeatable `rubric: Label | points | note`.
  **Manually graded** against the rubric; no auto key
  (`free-response.ts:8–16`). ✅
- **`essay`** → `essay`: as short answer plus `words: min-max` (either side
  optional: `200-300`, `200-`, `-300`) shown as a live counter
  (`markdownToTiptap.ts:1483–1496`; `free-response.ts:18–20, 55–66`). ✅
- **Rubric parse:** `Label | points | note`; a non-positive/unparseable points
  drops just that line with a warning (`markdownToTiptap.ts:1462–1476`).
- **Note:** grades live in a separate `grades` table, never in the submission
  (`free-response.ts:14–15`); the renderer never emits the rubric to student
  HTML (`free-response.ts:36–38`).

### 2.9 Content blocks: objectives, worked, faded, columns

- **`objectives`** → `learning_objectives` (`markdownToTiptap.ts:1273`): optional
  `title:` (default "Learning objectives"), one objective per line, leading list
  markers stripped, `$math$` ok. ✅
- **`worked`** → `worked_example` (`markdownToTiptap.ts:1374`): optional
  `title:`, one **block per line** — a `$$…$$` line → math block, else a
  paragraph. Blanks stay literal (it shows the answer). Lists/images inside are
  editor-only (`worked-example.ts:16–24`). ✅
- **`faded`** → `faded_worked_example` (`markdownToTiptap.ts:1385`): like
  `worked`, but a line with a `{{blank}}` becomes a student fill-in step
  (`allowBlanks=true`, `markdownToTiptap.ts:1336–1339`). The whole box is one
  numbered problem; steps are lettered (a)(b)… (`faded-worked-example.ts:24–31`).
  `showStepLabels` (`faded-worked-example.ts:56–61`) is **not importable**. ✅
- **`columns`** → a strict-grid `row` of `column`s
  (`markdownToTiptap.ts:1405`): columns split on a lone `---`; one block per line
  (paragraph / `$$…$$` math / `{{blank}}` fill-in). **2–6 columns** (extras
  dropped with a warning). Rich per-column content (lists, headings, questions)
  is editor-only (`markdownToTiptap.ts:1396–1447`). ✅

### 2.10 Prose, math, structure, marks

- **Headings:** `#`/`##`/`###`; h4–h6 clamp to 3 (`markdownToTiptap.ts:783–788`).
- **Checkpoint section:** heading ending `{checkpoint}` →
  `sectionBreak isCheckpoint` (`markdownToTiptap.ts:392–399`). A checkpoint
  section gets a "Check this section" button in `locked`/`free` submission modes
  (`document.ts:31–34`).
- **Math:** `$inline$` and `$$display$$`; a lone-`$$` paragraph → block math;
  Pandoc-style currency guard so `$5 and $10` isn't math
  (`markdownToTiptap.ts:190–212, 417–422`).
- **Images:** `![alt](url)` lifted out of a paragraph into its own image block
  (`markdownToTiptap.ts:454–465`). Images inside headings/list items are dropped
  with a warning (`markdownToTiptap.ts:624–631`).
- **Marks — importable:** `**bold**`, `*italic*`, `` `code` ``
  (`markdownToTiptap.ts:589–602`).
- **Marks — NOT importable:** `underline`, `subscript`, `superscript`
  (`inline.ts:26–33`) and the **`definition`** vocabulary-popover mark
  (`inline.ts:140–146`). Strikethrough is explicitly dropped with a warning
  (`markdownToTiptap.ts:604–606`).

### 2.11 Block types with NO import surface at all

- **`callout`** (info/warning/success/note) — `callout.ts:1–15`. Editor-only;
  no fence.
- **`problem`** — a plain numbered problem with a `solution`, no blanks
  (`problem.ts:19–26`). Reachable via markdown only incidentally (a
  blank-less paragraph is a `paragraph`, not a `problem`); the `problem` block
  itself has no import syntax.

---

## 3. Activity-level settings (no import surface — editor/publish only)

None of these are expressible in pasted markdown; they live in
`ActivityMeta` (`document.ts:212–224`) and are set in the editor:

- `submissionMode` (`single` / `locked` / `free`), `revisionMode`,
  `gradingMode` (`auto`/`manual`/`mixed`, inert in Phase 1), `activityType`.
- **`answerFeedback`** (`immediate` / `on_check`) — schema default `on_check`;
  **runtime back-compat default for a missing field is `immediate`**
  (`document.ts:82–86`; `blanks.ts:320–325`). Intentional asymmetry, documented
  in the schema — **not a bug**, but worth knowing it exists.
- `skills`, `typography` (font + base size), full **print** layer
  (`PrintConfig`, `document.ts:160–171`: paper size, margins, work-space,
  columns [dormant], header fields), **reference panel** (`document.ts:245–249`),
  and the **calculator tool** (`document.ts:305–309`: scientific/graphing,
  regression models, expression caps).

---

## 4. Three diff lists (prompt vs code)

### A. Documented but wrong or stale
The prompt is kept close to the parser (there's a guard test), so this list is
**short** — no outright false syntax was found. The nuances:

1. **`options: partial-credit` is oversold for single-object graph answers.**
   Partial credit only does anything for multi-part answers (systems, multiple
   points/regions); on a single curve it's a no-op
   (`interactive-graph.ts:392–397`). The prompt presents it as a general option.
2. **"domains clip" under graph `show:`** is fine, but the prompt's earlier
   graph section never says domain-restricted *answers* are rejected — an author
   who writes `answer: y = 2x for x >= 0` gets a plain-text fallback
   (`markdownToTiptap.ts:1978–1982`). Not stated.

### B. Implemented but undocumented (the expensive kind)

*Importable today, absent from the prompt:*
1. **`options: no-solution-correct`** on graphs — trick "no solution is the
   correct answer" (`markdownToTiptap.ts:1934`).
2. **`options: no-builtin-feedback`** on graphs — disable the kit's automatic
   mistake classifiers (`markdownToTiptap.ts:1935`).

*On the platform, wired end-to-end, but with NO import syntax (asymmetric DSL —
you built it, nothing in the import path invokes it):*
3. **Per-blank `hint`** — `?` popover nudge (`inline.ts:230–232`;
   `blanks.ts:377–389`). *(one you already knew)*
4. **Per-blank `mistakeFeedback`** — anticipated-wrong-answer feedback, the
   fill-in-blank twin of MC `::` and graph `mistake:` (`inline.ts:234–241`).
   *(the other one you knew)*
5. **Math-expression blanks** (`answerType:'math'`, equivalence grading)
   (`inline.ts:263–274`; `strategies.ts:24–70`).
6. **In-equation math gaps** (Model A `\placeholder[id]{}` inside `$…$`)
   (`inline.ts:55–96`).
7. **Per-choice / per-item `graph` figures** on MC and matching
   (`multiple-choice.ts:45–49`; `matching.ts:42–43`).
8. **`underline` / `subscript` / `superscript` marks** (`inline.ts:26–33`).
9. **Vocabulary `definition` mark** (popover definitions) (`inline.ts:140–146`).
10. **`callout` block** (info/warning/success/note) (`callout.ts`).
11. Per-block knobs: blank `width`, faded `showStepLabels`, data-plot
    `maxFrequency`, custom block **labels** (`labelFields`).
12. All **activity-level settings** in §3 (submission/feedback mode, calculator,
    reference panel, print, typography).

Items 3–12 cannot go in the *import* prompt without new parser syntax; they
belong in the capability registry and in a decision about whether the importer
should grow syntax for the high-value ones (hints + blank feedback especially,
since the asymmetry with MC/graph is arbitrary).

### C. Documented but not implemented
**None found.** Every construct the prompt describes maps to a live parser
branch. The prompt errs entirely on the side of omission, not fabrication.

---

## 5. Generating the prompt from the schema at build time (estimate + seam)

**Can you generate it purely from the Zod schema? No — and this is the key
insight.** The Zod schema (`packages/schema`) describes the **stored document
shape**, not the **markdown surface syntax**. The fence keywords (`mc`,
`match`, …), the line grammars (`prompt:`, `(x)`, `::`, `=`, `->`, `~`), the
option names, and the family limits all live **only in `markdownToTiptap.ts`**,
imperatively. Nothing in the schema knows that `{{=…}}` means a numeric blank.
So a schema-only generator would document a shape no author types.

**The real drift is between three artifacts, and only two share a source:**
- `markdownToTiptap.ts` — the parser (authoritative for syntax).
- `markdownImportPrompt.ts` — the prompt (hand-written).
- `docs/markdown-import-format.md` — the doc (hand-written).

**The seam to cut first: a declarative fence registry** that the parser and the
prompt generator both consume. Concretely:

1. **Extract one `FenceSpec` per tag** (`{ tag, blockType, summary, lines:
   [{key, syntax, meaning, importable}], options: […], examples: […] }`) into a
   new `packages/app/src/lib/importFormat/registry.ts`.
2. **Refactor `markdownToTiptap.ts` to read line keys/options from the
   registry** rather than inline string literals — the parser stays hand-written
   (the family-detection and grammar logic can't be data-driven cheaply), but
   its *vocabulary* (recognized keys, option names) comes from the registry, so
   a parser that accepts an option the registry doesn't list fails a test.
3. **Generate `markdownImportPrompt.ts` from the registry** at build time (a
   codegen step beside `bundle:renderer`), and **generate/verify
   `markdown-import-format.md`** the same way.
4. **Cross-check the registry against the schema** in a test: every `blockType`
   in the registry must exist in the `Block` union, and every gradable field the
   registry claims importable must exist on that block's Zod object. This is
   what catches "someone added `answerType:'math'` to the schema but no fence
   line offers it" — it would surface as an *intentional* registry gap you
   annotate (`importable:false`) rather than silent drift.

**Cost estimate:**
- Registry extraction + parser refactor to consume it: **~1–1.5 days.** The
  parser is 2,000 lines; the mechanical part (option/key lists) is small, but
  the per-fence `parse*` functions each need their literals threaded through the
  spec without behavior change — every one has a test, so it's safe but tedious.
- Prompt + doc codegen: **~0.5 day** (the prompt is already an array of lines;
  turning FenceSpecs into that shape is a template).
- Schema cross-check test: **~0.5 day.**
- **Total ≈ 2.5–3 days.** The payoff: the prompt and the doc can no longer drift
  from the parser, and the schema↔registry test converts today's silent
  asymmetries (hints, math blanks) into a visible, annotated `importable:false`
  ledger — which is exactly the capability registry you want anyway.

**Cheapest first cut if you want value in an afternoon:** skip the parser
refactor; write the registry as a *standalone* description, generate the prompt
+ doc from it, and add only the schema cross-check test. That kills prompt/doc
drift and gives you the registry immediately; the parser stays a separately
hand-verified artifact (guarded by its existing unit tests) until you're ready
to make it consume the registry too. **~1 day.**
