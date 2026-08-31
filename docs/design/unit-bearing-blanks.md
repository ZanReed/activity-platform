# Unit-bearing numeric blanks — `{{=1.5 unit: km/h}}` (wishlist #3)

**Status: GREENLIT (author, 2026-09-01) → OUTSIDE-VOICE REVIEWED → AMENDED →
BUILDING.** The review found eleven defects, verified against code; the
load-bearing ones were re-verified independently before ruling. Amendments
below override the matching decisions; the original text is kept under them
as the record.

## Amendments after the outside-voice review (2026-09-01)

- **A1 (overrides D2's mechanism).** `parseNumericValue` cannot split — all
  three of its forms are full-string anchored, and the file is parity-frozen
  by its own header. The splitter is a NEW module,
  `server/grading/units.ts`: peel the LONGEST LEADING match of the three
  numeric forms (mixed number first — its interior space would otherwise be
  eaten by a token split — then fraction, then decimal with optional `$`,
  commas, e-notation), remainder = the unit candidate. Pinned by tests for
  `1 1/2 km/h`, `1.5km/h`, `$3.50`, `1,234 km`, `1.5e3 m`.
- **A2 (deletes D7's width claim).** The editor's Blank extension declares no
  `width` attr at all — an authored width would not survive an editor round
  trip. v1 changes nothing about blank sizing; the limitation is accepted.
- **A3 (revises D5's mechanism).** `matchMistakeEntry` matches the student's
  raw text and knows nothing about outcomes; verdicts are boolean end to end.
  Reserved matches are implemented INSIDE the matcher by LOCAL recomputation:
  for a unit-bearing key it splits the entry itself, `unit-missing` /
  `unit-wrong` compare against that locally derived outcome, and — the
  review's fourth finding — the numeric fast path uses the VALUE PART (an
  authored `!1500` still fires on "1500 m/h"; a match string carrying its own
  unit is split too). `BlankVerdict` stays boolean; nothing threads.
- **A4 (drops D4's stored outcome class).** The class was redundant with the
  platform's whole misconception design: the sensor datum rides the matched
  reserved entry's `mis.*` binding through `misconceptionIds` on
  `CheckItemResult` — additive-optional, stored verbatim with the verdicts
  row, exactly like every other misconception in the system. No new stored
  field, no per-blank outcome map, no corpus-shape question. (An UNauthored
  unit-miss is not sensed — consistent with wishlist #1, where unauthored
  mistakes are not sensed either.)
- **A5 (new, from the review).** The teacher answer key showed half the
  answer: `answer-key/extract.ts` stores `node.answer` only. It now appends
  the unit (`"1.5 km/h"`).
- **A6 (sharpens D6).** Parse ORDER, not just surface order: the `unit:`
  clause is peeled from the first segment's tail BEFORE `TOLERANCE_RE` runs
  (that regex is end-anchored and would otherwise swallow the clause into the
  answer). The clause is recognized ONLY on `=` (numeric) blanks — on text
  and math blanks `unit:` stays literal text, which dissolves the escape
  question.
- **A7 (corrects D3's aside).** graph-kit imports `mathjs/number`, which
  EXCLUDES the unit subsystem — the dimensional-conversion door means pulling
  more of mathjs into a size-capped bundle. Not cheap; still out of v1.
- **A8 (completes the cost list).** A new blank attr must be enumerated in:
  `Blank.ts` `addAttributes` (+`data-unit` parse/render) and the
  `updateBlankAttrs` type, `blankSyntax.ts` (`BlankNodeAttrs`,
  `blankAttrsFromSpec`, `parseBlankSpec`), `serialize.ts` in BOTH directions,
  `walk.ts` `blankTokenToKey`, and `BLANK_SECRET_FIELDS` in the viewer
  registry (the strip mechanism and the automatic `SANITIZER_REV` move were
  positively verified). Tiptap silently drops undeclared attrs — miss one and
  the unit vanishes on the first editor save, the repo's orphan class.
- **A9 (scopes D10 down).** Interchangeable groups GRADE with units (each
  slot's compare includes its unit), but reserved unit matches are v1-scoped
  to non-group blanks — the group matcher has no per-slot feedback concept to
  hang them on.

**What the builder asked for**: ~10 contextual DoL activities where the answer
is a quantity, not a number — and the *units-dropped misconception family runs
the full spine*. Today units live in prose, so every units-requiring item is
rubric-graded shortanswer and the misconception is only deferred data.

**The shape of the win**: unlike #4, this needs **NO wire bump** — the
student's entry is already a free string in the `blanks` response map
("1.5 km/h" rides today's wire untouched). The change is interpretation:
schema attr, server grading, sanitize strip, import syntax, editor popover.

## Decisions

**D1 — The unit lives on the blank's attrs: `unit?: string` on `BlankToken`,
meaningful only when `answerType: 'numeric'`.** The standing rule
(`BlankResponse.answer` is never widened) is satisfied for free — the response
stays a string. `unit` joins `BLANK_SECRET_FIELDS` (it is half the answer, and
its presence in a served blank would prompt the very recall being tested), so
`SANITIZER_REV` moves and both redeploys are owed.

**D2 — ONE input; the student types the unit** ("1.5 km/h"). A separate unit
dropdown/box would *prompt* the unit and destroy the diagnostic — the
misconception is forgetting it exists. Grading splits the entry into a leading
numeric part (the existing `parseNumericValue` forms: fractions, mixed
numbers, commas, `$`) and a trailing unit token.

**D3 — Unit match is NORMALIZED STRING + authored alternates; dimensional
conversion is OUT of v1.** Normalization: trim, case-fold, collapse spaces,
`·`≡`*`, `per`≡`/` is NOT attempted (write it as an alternate). Alternates
are authored (`unit: km/h, kph`). Conversion credit (1500 m/h for 1.5 km/h)
is deliberately excluded — the blocked activities test *keeping* units, not
converting them — but the door is cheap and noted: mathjs (already in the
grading bundle for math blanks) has a full unit system if a later activity
family needs dimensional equality.

**D4 — Correct = value within tolerance AND unit accepted. No partial credit
at the blank grain** (a blank is one point — house precedent), **but the
graded-response row stores the outcome class**:
`correct | value-wrong | unit-missing | unit-wrong`. That stored class IS the
sensor — "value right, unit dropped" becomes queryable per skill without any
new analytics machinery.

**D5 — Feedback/misconception binding: two reserved mistake matches.** In the
blank's `!`-segment grammar, on a unit-bearing blank only, the reserved
matches `!unit-missing :: …` and `!unit-wrong :: …` bind feedback (and an
optional third `:: mis.*` segment, riding wishlist #1's shipped machinery
verbatim) to those outcome classes. Reserved-word collision is a non-issue:
today those strings could only be literal wrong answers on a TEXT blank, and
a unit-bearing blank is numeric. No new schema fields for feedback — the
existing `mistakeFeedback` array carries it.

**D6 — Markdown syntax: a `unit:` clause in the FIRST segment, comma
alternates.** `{{=1.5 unit: km/h}}`, `{{=1.5 +- 0.1 unit: km/h, kph}}`,
composing with existing segments: `{{=1.5 unit: km/h | ?speed = distance/time
| !unit-missing :: What are you measuring in? :: mis.units.dropped}}`. The
clause sits before the first `|` (segment separators are unchanged), after
any `+- tol`. A `unit:` clause on a non-numeric blank warns and is dropped
(`--strict` fails, same posture as other authoring mistakes).

**D7 — Display: nothing new on screen or print.** The blank renders as today
(the unit is the withheld answer); default blank `width` widens when a unit is
authored (unit text lengthens answers). Print stays a bare underline per the
baseline rules.

**D8 — Editor: one "Unit" text field in `BlankEditPopover`'s numeric mode**
(alternates comma-separated in the same field; single-host popover rules and
`flushAll()` paths untouched).

**D9 — `\gap{…}` (in-math) gets NO unit support in v1.** Math gaps grade by
expression equivalence; units inside LaTeX are a different animal (`\text{}`
wrappers, mathjs unit parsing in the sampling path). Out until an activity
needs it — the prose blank beside the equation covers the blocked ~10.

**D10 — Interchangeable groups: units compose.** A `{{~=…}}` group member
with a unit grades per-slot as usual (the group machinery matches values to
slots; each slot's unit check applies to whatever entry lands on it). No new
grouping rules.

## Cost

Schema attr + secret-field strip (`SANITIZER_REV` moves) + server grading
(split/normalize/compare + outcome class on the stored row) + importer clause
+ format doc + prompt regen + editor popover field + tests (including corpus
rows — blanks are an element-coupled ported scorer) + BOTH bundles +
`get-activity`/`check-activity` redeploys. Meaningfully smaller than #4 (no
wire bump, no new block, no new interaction).

## Non-goals

Dimensional conversion credit (D3), unit dropdowns (D2), `\gap{}` units (D9),
compound sig-fig rules, a unit registry (authored alternates are the registry).
