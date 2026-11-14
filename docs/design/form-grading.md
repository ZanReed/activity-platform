# Form grading: "equivalent AND in the stated form" (design pass, 2026-11-14)

Status: **RULED 2026-11-14 (author: "Yes to all FG items"): FG-1 to FG-14 as
recommended.** **BUILT 2026-11-14, steps 1–5, unpushed** ("As built" below;
pending author actions in STATE.md). Letter
B-251 SENT 2026-11-14; C-192 answered it, and the author RULED its amendments
A1–A5 the same day ("Amendments from C-192" below, which OUTRANK FG-1, FG-2
and FG-3 where they differ). B-252 sent with the answers.
A Fable review of the draft (2026-11-14) confirmed the code facts and found two
more live parse defects (`x(x+2)` read as a function call; MathLive's
`\frac{2}{3}x` read as `2/(3x)`), an overclaim in seeded form (constants were
never folded), missing expression bounds on the new paths, and a wrong deploy
order (the first failure is the schema parse in BOTH functions). All are folded
in below; FG-14 is new.
Source: TODOS.md → "BUILD ORDER", the 2026-11-05 "NEXT" entry, item (1),
ruled by the author ahead of the skills diagnostic. The curriculum side's rule
is D60 (ratified 2026-10-21), amended 2026-10-24 ("the carriers … corrected to
the platform's facts", after our B-210), now their `authoring-principles.md`
§7. Their to-do list (`proposals/overhaul-decision-items.md`, "Platform wish")
gives the acceptance examples used throughout this doc. Neighbours:
[math-blanks.md](math-blanks.md) (Model A gaps, Model B `==` blanks),
[unit-bearing-blanks.md](unit-bearing-blanks.md) (the reserved-match pattern
reused here), [seeded-data.md](seeded-data.md), [dol-retake.md](dol-retake.md)
(DL-17 `\seed{}`, DL-18), [mixed-practice-teacher-panel.md](mixed-practice-teacher-panel.md)
(W-5's note: "a blank in a form-skill item carries no misconception id by
design").

Each fact below was re-read in the code, the live database, or the curriculum
repo on 2026-11-14 (P10). The engine behaviour quoted in the first section was
**run**, not read: `mathEquivalent` was called on each example in a scratch
vitest file (deleted afterwards).

## The problem, in their words

Where a skill's point is the form of its answer, an equivalence blank accepts
the question itself and every equivalent wrong form, so a misconception binding
on the wrong form can never fire. Their four acceptance examples:

| Question | Accept | Reject | Bind |
|---|---|---|---|
| Factorise 18x − 12 | 6(3x − 2) | 18x − 12, 2(9x − 6) | `mis.factorise.not-highest` on 2(9x − 6) |
| Simplify 4a × 3b | 12ab | 4a×3b, 7ab | `mis.terms.coefficients-added` on 7ab |
| Expand −2(3x − 5) | −6x + 10 | −6x − 10 | `mis.expand.negative-sign-dropped` |
| Simplest form of 4/6 | 2/3 | 4/6 | — |

And: "equivalent but the wrong form must be distinguishable from not
equivalent, so that `mis.factorise.not-highest` can fire."

## What the code has today

**Three blank answer types** (`answerType`, [blanks.ts](../../packages/viewer/src/server/grading/blanks.ts)):
- `text`: exact string after the G1 look-alike fold, trim on the student side,
  `²`↔`^2` fold. Case and interior spacing are significant.
- `numeric` (`{{=…}}`): `parseNumericValue` + tolerance
  ([numeric.ts](../../packages/viewer/src/server/grading/numeric.ts)). `4/6`
  and `2/3` are different numbers only to the tolerance's sixth place, so a
  numeric blank **cannot** hold "simplest form": `{{=2/3}}` accepts `4/6`.
- `math` (`{{==…}}`): `mathEquivalent` in
  [math-equivalent.ts](../../packages/graph-kit/src/math-equivalent.ts),
  math.js number-only, **numeric sampling** at 12 points. Not symbolic.

**`equivalence: 'value' | 'exact-form'` already exists** on a math blank and a
math gap (schema `inline.ts:84` and `:554`). `exact-form` is "the normalized
strings match, whitespace-insensitive". It is **editor-only**: no markdown
spelling, and the gap importer's comment says so (`markdownToTiptap.ts:712`).
The editor offers it as "Exact form only" in the blank popover
([BlankEditPopover.tsx:773](../../packages/app/src/editor/components/BlankEditPopover.tsx)),
which the gap's settings button reuses. **Live use: none** (2026-11-14: 0 of 23
activities' latest versions, 0 drafts, 0 of 22 practice items).
`exact-form` is too blunt for D60: it rejects `(3x − 2)·6` and `10 − 6x`.

**Run results** (value mode / exact-form mode):

| student | key | value | exact-form |
|---|---|---|---|
| `6(3x-2)` | `18x-12` | true | false |
| `2(9x-6)` | `6(3x-2)` | **true** | false |
| `(3x-2)6` | `6(3x-2)` | true | **false** |
| `10-6x` | `-6x+10` | true | **false** |
| `4/6` | `2/3` | **true** | false |
| `a^2` | `a*a` | true | false |
| `12ba` | `12ab` | **false** | false |
| `12*a*b` | `12ab` | **false** | false |
| `4a*3b` | `12ab` | false | false |
| `12a b` | `12ab` | true | true |

⚠ **A live defect, found here (not a D60 item, but form grading cannot be built
on top of it).** math.js reads a run of letters as ONE symbol: `ab` is a
variable named `ab` (`freeVariables('12ab')` = `['ab']`). So `{{==12ab}}`
today marks `12ba` and `12*a*b` **wrong**, and passes `12a b` only through the
"identical after stripping spaces" shortcut. Every Y9 terms item would hit it.
No live activity is affected today: the five live math-blank keys are `3/2`,
`2x`, `5x`, `4x`, `k`, all single-letter.

⚠ **Two more live parse defects of the same family (found by the review, run
against the engine):**
- **A letter before a bracket is a function call.** `x(x+2)` parses as a call
  of a function `x`: `mathEquivalent('x(x+2)', 'x^2+2x')` and
  `('3x(x+2)', '3x^2+6x')` are false, and so is `('x*(x+2)', 'x(x+2)')`.
  Only the identical-string shortcut passes. Every common factor that contains
  a pronumeral hits it, in value mode, today.
- **MathLive's fraction coefficient.** In a gap, `\frac{2}{3}x` arrives as
  `(2)/(3)x`, which parses as `2/(3x)`; `('(2)/(3)x', '2x/3')` is false. A
  mixed number `2\frac{1}{3}` arrives as `2(1)/(3)`, which is 2/3. Typed
  `2/3x` is fine; `x/2y` is `x/(2y)` (math.js's rule, kept).
- Also: `x2` and `2x3` parse as symbols `x2`, `x3` (letters followed by digits).

**Mistake matching on a math blank is string-exact** (`matchMistakeEntry`):
trim + lowercase + the `²` fold, interior spacing kept. So `!2(9x-6)` does not
catch a typed `2(9x - 6)`, and on a **seeded** math blank the matcher resolves
to the bound string (`(6)*((3)*x-(2))`, `resolveSeededEntry`), which no student
types: **seeded math-blank mistake bindings are effectively dark today.** Two
live activities carry both a math blank and a `mis.*`; whether their bindings
sit on the math blanks is re-counted at build (FG-4).

**Gaps** (`\gap{…}`, the `gap_equation` capability): `mathPromptToKey` in
[walk.ts](../../packages/viewer/src/server/grading/walk.ts) projects a gap to
`answerType: 'math'` with `mistakeFeedback: []` always, no hint, no seed
evaluation of its key beyond `evaluateSeededKeys` (which resolves `answers`, so
a gap key is not seeded by authoring because the importer takes a literal
only). Gap responses arrive as MathLive ascii via `latexToAscii`
([math-prompt-convert.ts](../../packages/graph-kit/src/math-prompt-convert.ts)).
Seeded answers and `!mistake` in gaps is the **separate C-163 wish** (TODOS,
trigger "904 activity 01 drafted"); this pass does not take it (FG-9).

**Seeded math blanks keep their expression.** `resolveSeededEntry` binds
declared names to literals and, for `math`, stops there (numeric/text entries
go on to evaluate to a number). So `{{==g*(p*x - q)}}` reaches the grader as
`(6)*((3)*x-(2))`, a tree with the form intact. **Their B-210 reading ("a
seeded blank can't hold a form, because its answer is evaluated to a number")
is true of numeric blanks only.** It is the fact that makes a seeded form blank
cheap (FG-6).

**One scorer for every surface.** `scoreBlank` is reached through
`gradeSection` from check-activity, the practice handler (banks, mixed
practice, DoL targeted practice) and the video pause handler. Nothing grades on
the client (the editor imports no scorer). So one change in `blanks.ts` + a
graph-kit leaf reaches every surface, and the DoL pass (DL-10: every blank in
the primary block `correct`) follows automatically.

**The check wire** carries `verdict: 'correct' | 'incorrect' | 'recorded'`,
optional `feedback`, optional `misconceptionIds`. `misconceptionIds` already
flow into `section_checks`, first tries (0062) and `mixed_attempts` (0067). A
wrong-form answer that carries a `mis.*` therefore reaches every existing
teacher view with no storage change.

**The parser we would build on is already in the bundle.** `evaluate.ts`
imports `parseDependencies` from `mathjs/number`; `freeVariables` already walks
`math.parse` trees. A structural comparison needs no new dependency.

**Curriculum carriers today (§7, as amended):** numeric blanks inside the
target form (`{{=g | !h :: … :: mis…}}( {{=a}}x − {{=b}} )`), an mc whose
distractors are the wrong forms, or (unseeded only) exact `|` alternates.
`gap_equation` for unbound faded steps only. §7 says it "holds until the
platform grades 'equivalent and in the stated form' (D60), or gaps take seeded
answers and bindings".

## Decisions

**FG-1 · What "in the stated form" means. Recommended: the KEY states the
form.** A form blank is correct when the student's answer is (a) value-
equivalent to a key entry (today's sampling) AND (b) has the **same shape** as
that entry, where shape is the parsed tree up to a closed list of harmless
rewrites (FG-2). The author writes the answer in the form wanted, which is what
they already do (`6(3x-2)`, `12ab`, `-6x+10`, `2/3`), and the grader holds the
student to it. One predicate covers every family D60 names:

| family (skills) | key | accepts | rejects as wrong form |
|---|---|---|---|
| terms collected (`algebra.expressions.like-terms`) | `3x+2y` | `2y+3x` | `5x-2x+2y`, `x+x+x+2y` |
| simplified product / quotient, index laws (`algebra.terms.multiply`, `.divide`) | `12ab`, `a^5` | `12ba`, `12*a*b`, `a^5` | `4a*3b`, `a^2*a^3`, `a*a*a*a*a` |
| expanded (`algebra.expand.single`, `.negative`) | `-6x+10` | `10-6x`, `-6x+10` | `-2(3x-5)` |
| factorised (`algebra.factorise.common-factor`) | `6(3x-2)` | `(3x-2)6`, `6(-2+3x)` | `18x-12`, `2(9x-6)` |
| simplest form (`number.fractions.equivalent`) | `2/3` | `2/3`, `(2)/(3)` | `4/6`, `0.6667` is not equivalent |

- *Alternative (b): named forms* (`form: factorised | expanded | simplified |
  collected | simplest`), each a predicate on the student's tree alone (e.g.
  "factorised fully" = a product whose bracketed factor has coefficient content
  1). More semantic: it would accept `-6(2-3x)` without an alternate. But it is
  five algorithms, each with its own definition to get wrong and to agree with
  the curriculum side ("is `x/2` simplified? is `½x`?"), and the key already
  says which one the author meant. **Recommend filing (b) with a trigger:** an
  authored item where the key-shape rule needs more than two alternates.
- *Alternative (c): widen `exact-form` with `|` alternates.* What §7 does by
  hand today; every ordering listed by the author, and still no seeded form.
- ⚠ **What the key-shape rule rejects that a teacher might accept**, so the
  letter can ask: `-6(2-3x)` for `6(3x-2)` (a different leaf set), `x/2` for
  `½x` and the reverse, `0.5x` for `x/2`. Each is an `|` alternate on the
  blank; nothing is guessed.

**FG-2 · The shape rule's closed list of rewrites.** Recommended, applied to
both sides after the look-alike fold and the `²` fold, as an explicit list (the
`normalize.ts` discipline: every addition is a reviewed line):
1. **Parentheses, spacing and multiplication spelling are not shape:**
   `6(3x-2)` ≡ `6*(3x-2)` ≡ `6 (3x - 2)`; `\times`, `\cdot` (MathLive's ` * `)
   the same.
2. **`+` and `×` are flattened and their operands sorted** (commutative,
   associative): `(3x-2)6` ≡ `6(3x-2)`, `12ba` ≡ `12ab`, `2y+3x` ≡ `3x+2y`.
3. **Subtraction is adding a negative, and a sign on a NUMBER is the number's
   sign:** `10-6x` ≡ `-6x+10` ≡ `10+(-6)x`; `-(6x)` ≡ `(-6)x`; `x-(-2)` ≡
   `x+2`. A minus in front of a BRACKET stays (`-(3x-2)` is not expanded).
4. **Number leaves compare by value** (`0.5` ≡ `.50`), never folded together:
   `2*3x` stays two numbers, so it is not `6x`.
5. **Division stays division** (`4/6` is not `4*(1/6)`), so simplest form
   holds; a sign moves to the front (`(-2)/3` ≡ `-(2/3)` ≡ `2/(-3)`).
6. **Powers are not products:** `a^2` is not `a*a`; `x^1` and `x` differ on the
   student side (see FG-6 for the key side).
7. **Precedence is math.js's, and signs never cross it:** `-2^2` is
   `-(2^2)`, so sign absorption (rule 3) applies to a number LEAF, never to the
   base of a power. `-x` ≡ `(-1)x`'s shape only on the key side (FG-6); a
   student's `-1x` is wrong form. `(-2)/(-3)` is not `2/3` (two signs is not
   simplest). `a/b/c` is `(a/b)/c`, not `a/(bc)`.
8. **MathLive's fraction coefficient is one factor** (FG-3 rewrites
   `(n)/(m)x` to `((n)/(m))*x` before parsing), so `\frac{2}{3}x` ≡ `2x/3`'s
   VALUE, but the two are different shapes (`(2/3)·x` vs `(2x)/3`). Both are
   "simplified"; rule 5 keeps them apart, so the letter asks which to accept
   (default: list the other as an alternate). A **mixed number** in a gap
   (`2(1)/(3)`, i.e. `2\frac{1}{3}`) is read as `2 + 1/3` when an integer is
   followed directly by a `(n)/(m)` group with no operator; it is its own shape
   (not `7/3`).
- **Accepted, and the letter says so:** `a*12*b` for `12ab` (order of factors is
  not form), and `2÷3` for `2/3` (MathLive's `\div` is `/`).
- *Not* on the list, deliberately: distributing, collecting, cancelling,
  constant folding. Each one is exactly a form some skill grades. (`x/2` ≡ `½x`
  WAS on this line; amendment A2 moved it onto the list.)

**FG-3 · Single-letter variables (fixes the live defect). Recommended: in
EVERY math blank and gap, value mode included, a run of letters that is not a
known function name or constant is a product of single letters.** `12ab` →
`12*a*b`. Done in one tokenizer step before `math.parse`, after seed names are
bound (`bindSeedNames` runs first, so a declared name, single-letter or not, is
a literal by then). The same step also:
- inserts `*` between a non-function letter and `(`: `x(x+2)` → `x*(x+2)`,
  `ab(c+d)` → `a*b*(c+d)` (the function-call defect above);
- splits a letter from the digits after it: `x2` → `x*2` (so `x2` is not
  silently the symbol `x2`; it is wrong form for `2x` and equivalent to it);
- groups MathLive's `(n)/(m)` that is followed by a letter or bracket into one
  factor, and reads integer + `(n)/(m)` as a mixed number (FG-2 rule 8).
- **Where it lives:** in the new `math-form.ts` and called from
  `mathEquivalent`, NOT inside `normalizeAsciiMath` or `compileFunction`, which
  the calculator and the graph rows share (their multi-letter names, slider
  names, must not change).
- ⚠ `x` and `y` are refused as seed names, so they are always pronumerals. Any
  other single letter can be both (a declared `a` in a key meant to keep the
  letter `a`) and is bound silently. The importer warns when a declared
  single-letter seed name appears in a form key and also as a bare letter in
  the item's maths (not `\seed{a}`). The protected words are the ones `normalizeAsciiMath`
already knows (`sin`, `sqrt`, `log`, `abs`, `mean`, …) plus `pi`, matched
longest-first so `pir^2` → `pi*r^2`.
- Widening-only in value mode: a key and an answer that matched before still
  match, because both sides split alike; `12ba` and `12*a*b` stop being wrong.
  Zero live keys change (all five are single-letter).
- `e` stays Euler's number, as today (`freeVariables` already treats it so).
  An algebra item that uses `e` as a pronumeral is the one casualty; the
  importer warns on a math key that contains a bare `e` next to a letter.
- *Alternative:* split only in form mode. Leaves the value-mode bug live for
  every `{{==12ab}}` an author writes before using form mode. Not recommended.

**FG-4 · Mistake matching on math blanks by meaning, not spelling.
Recommended:** on a **form** blank, a `!` entry matches when the answer is
value-equivalent to it AND has its shape (the FG-1 predicate, pointed at the
mistake): `!2(9x-6)` catches `2(9x - 6)` and `(9x-6)*2`; `!7ab` catches `7ba`.
On a **value** math blank (`==`), a `!` entry matches by value equivalence
alone (the verdict is already `false`, so anything equivalent to the mistake IS
the mistake). First match wins, as today; the plain string pass stays as the
fallback for a non-parseable match (`!no solution`).
- This also lights up **seeded math mistakes**, dark today (the bound-string
  problem above), at no extra cost.
- It can only widen matching, **because the string pass stays as a fallback**:
  matching lowercases, the engine doesn't (`X` vs `x` is not equivalent), so a
  case-only match must still be found by the string pass; a test pins it. Two
  `!` entries that are value-equal to each other now both resolve to the first
  (the importer warns). Sensor counts on the two live activities can only rise;
  the build re-counts them and says by how much before the deploy.
- **`~` groups:** the consume-once matching (`scoreBlankGroup`) runs on the form
  predicate per slot. A value left unmatched gets its OWN slot's `!` and
  `!form-wrong` lookup, as today's feedback does, except that `!form-wrong`
  fires if the value is value-equal to ANY slot's key in the group (a student
  who wrote `x+1+1` in a pair keyed `x+2`, `x+3` learns it is a form matter,
  not a value one, whichever slot it was typed in).
- *Alternative:* form blanks only. Leaves the seeded-math darkness in place.

**FG-5 · What a student sees for "equal but not in the form". Recommended:**
the verdict is `incorrect` (no new verdict, no wire bump, the DoL pass and every
count unchanged in meaning). Feedback precedence:
1. a matching `!` entry (FG-4), with its message and `mis.*`;
2. else the reserved **`!form-wrong :: message :: mis.*`** entry, which fires
   only when the answer IS value-equivalent to a key entry but in none of the
   keys' shapes, the pattern of unit-bearing blanks' `!unit-missing` /
   `!unit-wrong` (reserved tokens, so a student who types the word "form-wrong"
   never summons it);
3. else the blank's `?hint`;
4. else **a built-in line: "That's equal to the answer, but it isn't in the
   form the question asks for."**
- Step 4 departs from ruling 2.1A ("hintless ✗ = mark-only"), deliberately and
  for form blanks only: without it a student with the right value sees a bare ✗
  and concludes the grader is broken, which is the main risk this feature
  carries. *Alternative:* mark-only (2.1A as is); the author can rule either.
- "Not equivalent" (step 1 failing on value) gets today's behaviour exactly.
- **Where the line shows.** It is feedback, so it follows the context's own
  feedback rule: wherever an authored `!` message would reach the student on a
  check, the line does too, and where feedback is withheld, it is withheld. It
  does reveal that the value is right, which in a DoL is the honest thing to say
  (the retake re-draws the numbers). A gap has no `?hint` and no `!` entries,
  so a gap always gets the line (or nothing, if the author rules mark-only).
- Near-decimals: `0.666667` is value-equal to `2/3` within the engine's 1e-6
  slack, so it gets "equal but wrong form", which is a fair reading.

**FG-6 · Seeded form blanks. Recommended: they work, with key-side folding
and clean-up.** `{{===g*(p*x - q)}}` binds to `(6)*((3)*x-(2))`, whose shape is
the form. But a key that COMPUTES a coefficient from seeds would bind to
arithmetic the student never writes: simplify `{{===(c*d)ab}}` binds to
`((4)*(3))ab`, and expand `{{===(-g*p)x + g*q}}` likewise, which is two of
D60's four families (review finding). So the **key** (and its `!` entries) get,
before the shape is taken:
- **constant folding of every all-number `+`, `×` and negation subtree** (→
  `12ab`, `-18x + 12`), but **never `/`**, so a seeded simplest-form key
  `p/q` stays a fraction (its `where` makes it lowest terms);
- the clean-up list: `1*t` → `t`, `(-1)*t` → `-t`, `t^1` → `t`, `t^0` → `1`,
  `t + 0` and `0 + t` → `t`, a `0*t` term dropped, `-(-k)` → `k` (`t + (-k)`
  is already rule 3).
The **student** side gets none of these (a student who writes `1x`, `+ 0` or
`4*3ab` has not finished simplifying: wrong form, `!form-wrong` applies).
⚠ Without the folding, seeded form would work for factorised and simplest form
only; the letter says which is built.
- The importer, under `--strict`, enumerates the seed rows it already
  enumerates (`rows_stored_per_group` 500, cap 10 000 combinations) and
  **refuses** a file where any row's form key fails to parse, and **warns**
  where a row's key needs the clean-up to collapse a whole bracket (e.g.
  `q = 0` turns `6(3x-0)` into `6(3x)`, which is no longer a factorisation). The
  `where` line is the author's fix, and the warning names the row. It also
  warns where a row's key is **not the form the item claims**: a factorise key
  whose outer factor folds to 1 (`g = 1`), or whose bracket's coefficients
  still share a factor (gcd(p, q) > 1, so the key itself is "not highest").
  These are the two rows `where gcd(a, b) == 1` exists to prevent in their
  d65 sample; the check says so when the `where` is missing.
- **Every surface that shows the key gets the folded form:** the print answer
  key, the editor preview, AND **practice's released answer** (`answersOf` in
  [practice-handler.ts](../../packages/viewer/src/server/practice-handler.ts)
  sends `key.answers[0]` after a recorded try, which would otherwise show the
  student `(6)*((3)*x-(2))`). One function, shared, so the three can't differ.
  (`resolveSeededEntry` is already shared by grading and print; today's print
  shows the bound string for a seeded math blank, so this fixes it too.)

**FG-7 · Authoring syntax. Recommended:**
- **Blank: `{{===6(3x-2)}}`**, three equals signs: "equal, and in this form".
  `===` is tested before `==` in `parseBlankSpec`. Composes with `~`
  (`{{~===x+3}}` for an order-free pair of factors), with `|` alternates
  (`{{===6(3x-2) | -6(2-3x)}}`, each alternate its own shape), `?hint`, `!` and
  `!form-wrong`. Refuses `unit:` and `+-` tolerance (meaningless on a form) with
  a named warning.
- **Gap: `\gap[form]{12ab}`**, LaTeX's own optional-argument spelling, so it
  never collides with an answer. Sets the gap's `equivalence` to `form`. No `!`
  and no seeds in gaps (that is C-163, FG-9).
- **No `meta` key.** Form is per blank, not per activity: a factorise activity
  still has value blanks (the `g` coefficient) next to its form blanks.
- *Alternatives considered:* a trailing clause `{{==6(3x-2) form}}` (reads as
  part of the answer); `{{==6(3x-2) | !=form}}` (overloads `!`). `===` is one
  sigil in a family of sigils.

**FG-8 · Schema and the old `exact-form`. Recommended: add `'form'` to the
`equivalence` enum (blank and gap), and RETIRE `'exact-form'` by upgrade:**
`upgradeActivityDocument` ([upgrade.ts](../../packages/schema/src/upgrade.ts)) maps a stored `exact-form` to `form` on read. That is
widening-only (anything that string-matched also shape-matches), and there are
zero stored uses anywhere (above), so no mark changes. The editor stops
offering "Exact form only" (FG-10). The schema keeps accepting the old value so
an old export still imports.
- *Alternative:* keep three modes. A teacher choosing between "Exact form only"
  and "Equal, in this form" is a distinction nobody asked for.

**FG-9 · What this pass does NOT take.** Recommended, each staying filed with
its trigger:
- `!mistake` and seeded answers inside `\gap{}` (C-163; trigger 904 activity 01
  drafted). With FG-6 the seeded, bound carrier exists as a blank, so the
  curriculum side is not blocked on it.
- Named-form predicates (FG-1 alternative (b); trigger above).
- A stored "right value, wrong form" flag for teacher views (FG-11).
- Numeric blanks stay value-only: "simplest form" is authored as `{{===2/3}}`.
- Equation and inequation answers (`x = 4`, `x < 8`) need no form; D60 says so.

**FG-10 · The GUI. Recommended:** see "The GUI" below; the decision is that the
existing popover carries it, no new block or slash item.

**FG-11 · Teacher views. Recommended: no new field in v1.** A wrong-form answer
is `incorrect` with an optional `mis.*`, which Responses, first tries, class
progress, the tracker and D68 already show. A `!form-wrong :: … ::
mis.<id>` binding is how an author counts "right value, wrong form" today.
*Filed, with a trigger* (a teacher asks to see how many students had the value
but not the form): a `reason: 'form'` on the verdict, which is a wire field and
a stored-verdict change, so its own pass.

**FG-12 · How it reaches the curriculum side. Recommended: a new capability
`form_answer`** in `capabilityFacts.ts`'s `JOIN` (`inline: 'form'`, scoring
auto, `BlankResponse`, boolean), plus **`prose_facts.form_grammar`**
`{ blank_sigil: '===', gap_spelling: '\\gap[form]{…}', reserved_match:
'!form-wrong' }`, read by their `tools/lint_draft.py` the way `dol_grammar` is.
`docs/capability-facts.json` changes, so **B14 applies: push our side first,
then open the pin-bump PR on the curriculum repo** (re-copy the file, new commit
+ sha256 in `capability-facts.pin.json`, derived fields, graph version bump).
Until it lands their `capability-drift.yml` is red and `form_answer` is not
authorable (their §9).
- A capability, not only prose, because §7's own text makes its rule
  conditional on this feature, and a `shipped` status is the one signal their
  tooling can test.
- *Alternative:* prose facts only (no pin-bump PR, but §9 can't gate on it).

**FG-13 · Order relative to the period-planner tail and C-163.** Recommended:
build this next as one arc (the author's 2026-11-05 ruling), and leave C-163 to
its own trigger. ⚠ The re-ranking is the author's call.

**FG-14 · Expression bounds on every new parse (new, from the review).
Recommended: one guard, run first.** Today `checkExpressionSafety` runs only
inside `scoreMath` (`blanks.ts:163`); an expression it rejects scores `false`
and then goes on to `matchMistakeEntry`, which under FG-4 would parse it and
sample it against every `!` entry. And the letter split runs after the
operator count, so 256 letters become 255 multiplications unseen. So: the
student's value is tokenised (FG-3) ONCE, the bound is checked on the
tokenised string (operators counted after the split), and a rejected value is
`incorrect` with **no** mistake, shape or `!form-wrong` work at all. The shape
canonicaliser also caps tree size and depth (a node-count limit next to the
existing ones in [guards.ts](../../packages/viewer/src/server/grading/guards.ts)).
- *Alternative:* none worth listing; this is the S4-B3 rule applied to the new
  paths, and the review's point is that the draft left them open.

## Amendments from C-192 (RULED by the author 2026-11-14, "Yes to all")

The curriculum side's answer to B-251. Their reason, which the rulings adopt:
the two errors are not equally costly. A forgotten alternate tells a correct
student, authoritatively, that the answer "isn't in the form the question asks
for", and the teacher's count shows an authoring gap as a student error; an
over-generous rule at worst marks an unusual but complete answer right.

- **A1 · Default stance (amends FG-1).** The key still states the form, but the
  shape rule carries EVERY variant the skill does not grade as form. An author
  who wants one form only narrows the item by its LAYOUT (numeric blanks inside
  the structure, §7's first carrier, `{{=-4}}(x + {{=2}})`) or by exact
  alternates. No new syntax. Every prompt on a form blank names the form in
  words; their draft lint checks it.
- **A2 · Fraction coefficients (new FG-2 rule 9).** A product over a NUMERIC
  denominator is that fraction as a coefficient: `x/2` ≡ `½x` ≡ `(1/2)x`,
  `2x/3` ≡ `⅔x` ≡ `(2/3)x`. Leaves are never folded, so `4x/6` is `(4/6)x`
  and stays wrong form for `⅔x` (simplest form holds). A LETTER denominator
  (`4b/a`, algebra.terms.divide) is unchanged.
- **A3 · Sign through a bracket (new FG-2 rule 10).** Negating two factors of
  a product is the same shape: `−6(2−3x)` ≡ `6(3x−2)`, `−x(2−xy³)` ≡
  `x(xy³−2)`, and `−6(3x−2)` ≡ `6(2−3x)`. Implemented as a canonical sign per
  sum factor (after FG-2 rule 2's sort; leading term positive, the sign moved to
  the product's front) with the parity of negations kept. It applies on both
  sides and to `!` bindings (FG-4), so `!2(9x-6)` also catches `−2(6−9x)`.
- **A4 · Mixed numbers (widens FG-2 rule 8 and FG-3).** A mixed number of
  integers is the same shape as its improper fraction: `1⅓` ≡ `4/3`, while
  `1 2/6` ≡ `8/6` stays wrong form for `4/3`. The tokenizer reads three new
  spellings as a mixed number, in every math blank (widening-only, because
  each is a parse failure today, which marks a correct answer WRONG, not wrong
  form): an integer, a space, then `n/m` (`1 1/3`); an integer followed by a
  vulgar-fraction glyph (`1⅓`; the glyphs `½ ⅓ ⅔ ¼ ¾ ⅕…⅞` map to `(n)/(m)`
  in `math-form.ts` only, never in `normalize.ts`, whose NFKC exclusion
  stands); and MathLive's `2(1)/(3)` as before. A lone glyph (`⅓`) is `1/3`.
  Bound check: a mixed number counts as two leaves for FG-14.
- **A5 · "Right value, wrong form" as its own outcome: FG-11 STANDS.** It stays
  `incorrect`; an authored `!form-wrong … mis.*` counts it per item. ⚠ Known
  tension, accepted: their rule is that `!form-wrong` is written only when the
  skill has something more specific to say, so most wrong-form answers are NOT
  counted separately in v1. `reason: 'form'` stays filed, its trigger widened
  to "a teacher OR the curriculum side asks for the count where no
  `!form-wrong` is authored".
- **Accepted as is:** the built-in line (FG-5 step 4) is the default and
  `!form-wrong` is optional; named wrong forms keep their own bindings.

## The GUI (every feature ships with one)

A teacher must insert, edit and remove a form check in their own activities and
Bank copies.
- **Insert / edit:** the blank popover's **Equivalence** select (math blanks,
  and the gap settings button, which reuses the same popover) offers **"Any
  equal form"** (value) and **"Equal, and in this form"** (form). "Exact form
  only" goes (FG-8). Under "in this form", a helper line: "The answer and each
  acceptable answer are the forms you'll accept. `2(9x-6)` is wrong for
  `6(3x-2)`." The existing acceptable-answers list is where `-6(2-3x)` goes.
- **The wrong-form message:** a field "If it's equal but in the wrong form"
  under the mistakes list, writing the `!form-wrong` entry, with the same
  misconception picker the mistake rows already have. Empty = the built-in line
  (FG-5).
- **Mistakes:** the existing mistakes list, unchanged in look; its helper line
  under "in this form" says a mistake matches in any order, not only as typed.
- **Remove:** set the select back to "Any equal form" (the form flag and the
  wrong-form entry are dropped), or delete the blank.
- **Visible state:** a form blank's chip in the editor shows a small "form"
  badge, so a teacher scanning an activity can see which blanks hold the form.
- **Roster:** `lib/guiSurfaces.ts` gets a `form_answer` row (file
  `BlankEditPopover.tsx`, marker the new option's label), or
  `guiSurfaces.test.ts` goes red.
- A file-backed activity is still edited in its `.md` (the importer's
  hand-edit refusal stands).

## Data, compliance, migration

- **No migration.** No table, column, RPC or stored-verdict shape changes; the
  wire version stays. `equivalence` lives inside activity content JSON.
- **No new personal data.** Answers are stored exactly as now; `mis.*` ids flow
  through the existing columns. `data-map.md` and `retention-policy.md` are
  unchanged (the data-map coverage test has nothing new to find).
- **Marks on live work:** FG-3 and FG-4 widen value-mode grading and matching
  (`12ba`, `x(x+2)`, `(2)/(3)x` stop being wrong); FG-8 widens a mode nobody
  uses. The one reading that can move the other way is the **mixed number in a
  gap** (`2\frac{1}{3}` was 2/3, becomes 7/3): it can only matter where a gap's
  key is 2/3-like and a student typed a mixed number, which was a wrong-right
  mark. The build runs every live gap key (4 activities) through old and new
  and lists any difference before the deploy. A
  stored verdict is never re-graded (ER-9), so past checks keep their marks.
- **Bundles and deploys:** the scorer and the schema enum are in BOTH committed
  bundles (`exact-form` appears in each today). So `pnpm bundle:grading-server`
  and `pnpm bundle:viewer-server` are rebuilt and committed in the same commits
  as the source (CI fails on drift), and the author runs **`pnpm deploy:check`**
  (never `--no-verify-jwt`) and **`pnpm deploy:get-activity`**, each proved by
  downloading the deployed source and hashing `_shared/*.bundle.js` against the
  repo.
- **Order (corrected by the review): BOTH functions live before any `form` is
  stored anywhere.** The first thing to fail on an old function is not the
  walk's `EQUIVALENCES` gate but the schema parse: `upgradeActivityDocument`
  zod-parses every document (`upgrade.ts:101`), so an old **get-activity**
  answers 500 "Activity content cannot be served" and **the activity will not
  open**, and an old check-activity fails at the same parse before grading. So
  the importer's `===`, `\gap[form]` and the editor option are pushed only
  after `deploy:check` and `deploy:get-activity` are both live and
  hash-verified (OV-7: a push is a deploy).
- **Stale editor tabs.** `serialize.ts:2301` stores only `'exact-form'`; an old
  editor build would drop `form` on load and autosave a value blank, silently
  widening the marks. The serializer change ships in the same push as the
  option, and the editor's existing refresh notice (no reload under a working
  user) is what moves an open tab on; a test pins that `form` round-trips.
- **Beat fingerprints:** `video-beat.ts:64` hashes `equivalence`, so FG-8's
  upgrade would change a fingerprint; with zero stored `exact-form`, nothing
  moves. Noted, not a step.
- **Bundle size:** no new dependency (`math.parse` is already bundled); the
  grading bundle is measured against its ceiling in `pnpm verify`.

## Test discipline

- **The four D60 examples, verbatim, as a table test** (accept / wrong form /
  not equivalent / which `mis.*` fires), plus every row of FG-1's family table.
- **Invariant, property-tested:** form-match ⇒ value-match, over the corpus and
  random keys; and any reordering of a key's `+`/`×` operands matches the key.
- **Mutation tests, once each, watched red:** drop rewrite 3 (`10-6x` must go
  red), drop the letter split (`12ba` red), drop the reserved-token guard (a
  typed `form-wrong` must not summon the entry).
- **Golden corpus** ([corpus.ts](../../packages/viewer/src/server/grading/corpus.ts)):
  new cases for form mode, the letter split in value mode, value-equivalent
  mistake matching, seeded form keys over every row of a fixture.
- **Seeded:** a fixture with `q` able to be 0 and 1, `p = -1`, `g = 1`,
  gcd(p, q) > 1, and a computed coefficient (`(c*d)ab`, `(-g*p)x + g*q`) that
  must fold; the importer's refuse and warn lines asserted by name; the
  practice `answersOf` release string asserted as the folded form.
- **The review's parse rows, pinned:** `x(x+2)`, `3x(x+2)`, `ab(c+d)`,
  `(2)/(3)x`, `2(1)/(3)`, `x2`, `-2^2`, `-x` / `-1x` / `(-1)x`, `(-2)/(-3)`,
  `a/b/c`, `a*12*b`, case-only `!X` on a key `x`.
- **Bounds (FG-14):** a value that trips the guard does no mistake or shape
  work (spy on the matcher); 256 letters are counted after the split.
- **A `~` group** with a wrong-form member (which `!form-wrong` fires).
- **The schema refuses an unknown `equivalence`** (a test with a made-up
  value), which is the property that makes an OLD function refuse a `form`
  document and so makes the deploy order a rule rather than a hope.
- **Importer:** `===` parsed, `\gap[form]{}` parsed, `unit:` / tolerance on
  `===` warned, `exact-form` upgraded on read.
- **GUI:** `guiSurfaces.test.ts` row; a popover test for the select, the
  wrong-form field and remove.
- **One browser lane** (stub lanes, `.env.local` aside): a wrong-form answer
  shows ✗ and the built-in line, bound to rendered output, mutation-tested.
- **Bundles:** drift checks; after deploy, the download-and-hash proof for both
  functions, with a marker grep (a new identifier such as `FORM_REWRITES_REV`)
  as the cross-check.
- `capabilityFacts.test.ts` (the join, the regenerated JSON) and
  `catalogueAuthoringPrompt.test.ts` (the regenerated prompt) green.
- Cold typecheck (delete `.tsbuildinfo`) before the final `pnpm verify`.
- A Fable review per build step.

## Build shape (ruled 2026-11-14)

1. **Engine** (graph-kit leaf `math-form.ts`, exported through the
   `@activity/graph-kit/scorers` subpath, never the barrel): the tokenizer
   (FG-3: letters, letter-before-bracket, letter-digit, MathLive fractions and
   mixed numbers), the bound (FG-14), shape canonicaliser (FG-2), key-side
   folding and clean-up (FG-6), the predicate. Pure, unit- and property-tested.
2. **Grader** (`blanks.ts`, `walk.ts`, schema enum, `upgradeActivityDocument`): form
   mode, FG-4 matching, FG-5 precedence and built-in line; corpus cases; both
   bundles rebuilt and committed. **Pending author: `deploy:check` +
   `deploy:get-activity`, hash-verified.**
3. **Importer + prompts + docs:** `===`, `\gap[form]{}`, `!form-wrong`, the
   seeded refuse/warn; `markdownImportPrompt.ts` (the shared half, so it reaches
   both prompts), `pnpm prompt:catalogue`, `docs/markdown-import-format.md`,
   `importFormatRegistry`. Pushed after step 2 is live.
4. **Editor GUI** (the popover, the badge, the roster row).
5. **Capability + facts** (`form_answer`, `prose_facts.form_grammar`,
   `pnpm facts:capabilities`); pushed; **then** the pin-bump PR on the
   curriculum repo and the Notion stamp row refresh.
6. **The letter** (below), if the author sends it, after step 5's push.

## As built (2026-11-14)

Steps 1–5 committed on `main`, unpushed; each had a Fable review, and every
major finding was fixed in a follow-up commit (`fix(grading)`, `fix(import)`).

**DEPLOYED and hash-verified 2026-11-14:** each function downloaded alone into
its own temp dir; `grading-server.bundle.js` (check-activity) and
`viewer-server.bundle.js` (get-activity) are byte-identical to the repo at
`e34521e5` (sha256 `dab75852…` / `504f23ea…`), both markers present,
`verify_jwt` true / false. Push is now safe.

**Pending author, in order (deploys done):** `pnpm deploy:check` and `pnpm deploy:get-activity`,
both hash-verified (download into a temp dir, `shasum -a 256
_shared/*.bundle.js` against the repo). Marker cross-checks: the built-in line
"isn't in the form the question asks for" in the grading bundle, `"value",
"form", "exact-form"` in both. Only then push. After the push: the B14 pin-bump
PR (`form_answer`, `prose_facts.form_grammar`) — opened as
[ZanReed/curriculum#94](https://github.com/ZanReed/curriculum/pull/94) — and the Notion stamp for the
regenerated `docs/catalogue-authoring-prompt.md`. **B-253 SENT 2026-11-14**; **C-193:** #94 MERGED
(`a4f2831`, graph v0.19.9, their prose), repo stamp refreshed. Theirs still: `lint_draft.py`
reading `form_grammar`, a lint that every `===` prompt names its form, and the §7 rewrite
(C-194). Catalogue-prompt pointer stamp refreshed to `99ccd4c3`
(sha256 `090a4f31…9338`). Platform side: nothing owed. Next C-194 / B-254.

**Pre-deploy re-counts (run on live 2026-11-14):** live math blanks: 5 (keys
`3/2`, `k`, `4x`, `5x`, `2x`), none with a `!` entry, so FG-4 moves **zero**
sensor counts on live work. Live gap keys: 5 (`4`, `0`, `4x`, `0`, `0`), so the
mixed-number re-reading (`2(1)/(3)` was 2/3, is 7/3) changes no live mark.
Practice and DoL items: no math blanks or gaps.

**Where the build departs from, or settles, the text above:**
- **Letters join by implicit multiplication, not `*`** (step-1 review): `1/ab`
  stays 1/(ab) and `x^ab` stays x^(ab), as when `ab` was one symbol. A letter
  before a bracket does become `x*(…)` (it was a broken call before).
- **Key-side folding (FG-6) needs a SEED number**: a bracketed literal, the
  spelling `bindSeedNames` gives every bound value. An authored literal key
  (`3*4`, `1x`) keeps its form as written. A bracketed literal in an unseeded
  key (`2*(-3)`) is folded like a seed — known, low.
- **FG-14:** the raw value is held to length and bracket balance; the tower,
  operator (implicit products counted) and depth caps run on the tokenized
  string, so `x^2y^3` is not a tower. The tree caps are in `math-form.ts`
  (`MAX_SHAPE_NODES` 256, `MAX_SHAPE_DEPTH` 96), not `guards.ts`.
- **FG-5:** a prose-less matched `!` entry keeps its `mis.*` and takes
  `!form-wrong`'s message; a `~` duplicate already in another slot's form gets
  neither `!form-wrong` nor the line.
- **Gaps show feedback now** (display and inline maths) — before, nothing
  rendered a gap's feedback, so the built-in line would never have reached one.
  Shell spend +270 B recorded in `scripts/perf-budgets.mjs`.
- **Accepted by rule 2's sort, against FG-3's wording:** `x2` ≡ `2x` (factor
  order is never form). `-(-x)` ≡ `x` on the student side (sign algebra).
- **FG-6 importer checks** run over bank and DoL seed rows. An unparseable row
  is a hard problem in both (the bank's fail under `--strict` only; a DoL's
  skip the file in every run). The `e` warning skips declared seed names, and
  runs on the bound key for banks and DoLs. `seedReferences` (graph-kit) makes
  `g(p*x - q)` count as a use of `g`.
- **GUI:** the roster row landed with the capability in step 5 (the roster is
  keyed by `JOIN`). The "form" badge is on blank chips; a form GAP has no
  badge (the ruling says chips) — its state shows in Answer settings.
- **The browser lane** (`e2e/student/form-grading.e2e.ts`) derives its stub
  reply from the real grader and was mutation-tested red.
- **For the pin-bump PR / letter:** `form_grammar.gap_spelling` uses a literal
  U+2026 `…` as its placeholder (as FG-12 wrote it), where `dol_grammar`'s
  `\seed{name}` uses ASCII — their `lint_draft.py` must read it as UTF-8.
- `FORM_REWRITES_REV` is tree-shaken out of the bundles, so it is not a deploy
  marker; use the strings above.

## Not checked yet

- MathLive's ascii for `\frac`, mixed numbers and `\div` was run by the
  review (FG-2 rule 8); other spellings (`\cdot` between two brackets, a
  superscript on a bracket) are run in step 1, not assumed.
- Whether the two live activities' `mis.*` entries sit on math blanks (FG-4's
  re-count).

## The letter: B-251, SENT 2026-11-14 to the live
curriculum channel

> B-251 · Form grading (D60), our design pass.
>
> We have designed "equivalent AND in the stated form" ahead of your B-242
> letters, which haven't arrived; if they're drafted, send them and we'll fold
> them in before any code.
>
> 1. **The form is the answer as written.** A new blank `{{===6(3x-2)}}`
>    accepts an answer equal to the key AND of the same shape, up to order of
>    terms and factors, spacing, brackets around a single term, and where a
>    minus sign sits on a number. Your four examples: `6(3x−2)` ✓, `(3x−2)6` ✓,
>    `18x−12` and `2(9x−6)` wrong form; `12ab` and `12ba` ✓, `4a×3b` wrong
>    form, `7ab` wrong; `−6x+10` and `10−6x` ✓, `−6x−10` wrong; `2/3` ✓, `4/6`
>    wrong form.
> 2. **Bindings fire on the wrong form.** `{{===6(3x-2) | !2(9x-6) :: … ::
>    mis.factorise.not-highest}}` catches `2(9x − 6)` in any order. A reserved
>    `!form-wrong :: … :: mis.*` catches any other equal-but-wrong-form answer.
>    With no message authored the student sees "That's equal to the answer, but
>    it isn't in the form the question asks for."
> 3. **Seeded works.** `{{===g*(p*x - q)}}` keeps its form after the seed is
>    bound (correcting our B-210 for math blanks: only numeric blanks evaluate
>    to a number). A computed coefficient is folded on the key side, so
>    `{{===(c*d)ab}}` expects `12ab` and `{{===(-g*p)x + g*q}}` expects
>    `−18x + 12`; a division is never folded, so a seeded `p/q` stays a
>    fraction. The importer refuses a row whose key won't parse and warns where
>    a row collapses the form (`q = 0`), or isn't the form claimed (`g = 1`, or
>    gcd(p, q) > 1 with no `where`).
> 4. **Gaps:** `\gap[form]{12ab}` holds a form; still no `!` or seeds in gaps
>    (your C-163 wish, its trigger unchanged).
> 5. **Fixes you'll see, in every math blank:** `{{==12ab}}` used to mark
>    `12ba` wrong (the engine read `ab` as one name); `x(x+2)` was read as a
>    function call, so `3x(x+2)` failed against `3x² + 6x`; and a gap's
>    `\frac{2}{3}x` was read as `2/(3x)`. Letters are now read singly, a
>    letter before a bracket multiplies, and a fraction coefficient is one
>    factor. `e` stays Euler's number. Order of factors is never form, so
>    `a·12·b` counts for `12ab`, and `2÷3` counts for `2/3`.
> 6. **Questions:**
>    (a) Should `−6(2−3x)` count for "factorise 18x − 12"? Our rule says wrong
>    form unless listed as an alternate. Same for `x/2` vs `½x` in simplify,
>    and `⅔x` vs `2x/3`.
>    (b) Is the built-in wrong-form line acceptable as is, or do you want it
>    worded per skill (then the author writes `!form-wrong`)?
>    (c) §7 can then name `===` as the form carrier (seeded or not, bound or
>    not) and drop "unseeded only" from the exact-alternates line. Your rewrite.
>
> It ships as a capability `form_answer` and `prose_facts.form_grammar`; the
> pin-bump PR follows our push.

Questions (a) and (b) change FG-1 and FG-5 only at the edges; the design does
not wait on them. Sending is the author's call.
