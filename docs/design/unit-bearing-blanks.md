# Unit-bearing numeric blanks — `{{=1.5 unit: km/h}}` (wishlist #3)

**Status: DESIGN PASS, awaiting the author's yes/no per decision** (drafted
2026-09-01). Verified against the shipped blank architecture
(`BlankToken` in `schema/src/inline.ts`, the server's `grading/blanks.ts` +
`grading/numeric.ts`, the `{{…}}` segment grammar in
`docs/markdown-import-format.md`).

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
