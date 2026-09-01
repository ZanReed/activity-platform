# seeded_data — parameterised values, per student (wishlist #6)

**Status: DESIGN PASS, awaiting outside-voice review, then the author's yes/no
per decision** (drafted 2026-09-01). The deepest cut on the wishlist —
TODOS ranked it last deliberately because it breaks the
every-value-is-a-literal assumption across import, serve, and grading. This
pass exists to show the break is SMALLER than it looks, because the
architecture it needs already ships.

**What the builder asked for**: datasets and quantities that differ per
student — the statistics-sampling lever ("compute the mean of YOUR eight
scores"), print integrity (neighbours can't copy answers), and A/B versions.

**The architectural crux, already answered by `ordering`.** Per-student
served variation exists today: the read cache stores the sanitized document
per (version, `SANITIZER_REV`), and `applyServeShuffles` reorders it
PER-REQUEST with `serveSeed(versionId, studentId)` — while the grader
recomputes the same arrangement from the SAME symbol (`sanitize/serveSeed.ts`,
its header records the two-spellings-drifting bug that made this a single
seam). Seeded data rides that seam exactly: the TEMPLATE is cached; serve
substitutes values derived from the serve seed; grading re-derives them.
Nothing about the cache, the deploy story, or the anonymous path changes
shape (an anonymous read seeds as `'anonymous'` — one fixed variant, which is
correct for the pre-auth meta view).

## Decisions

**D1 — v1 scope: named NUMERIC variables, activity-scoped.** An activity
declares variables; prompts interpolate them; numeric/math blank answers may
be EXPRESSIONS over them; `data_plot.data` may list them. NOT in v1: string
variables, per-block scopes, cross-variable constraint solving ("pick a, b so
the roots are integers") — authored value LISTS cover the nice-numbers need
(D3).

**D2 — The template lives in `ActivityMeta`; consumers reference by name.**
```
seed:
  a: int 2..9
  p: list 1.50, 1.75, 2.25, 2.50
  data: sample 8 of 55..99
```
Schema: `meta.seedVars: Array<{ name, spec }>` where spec is a small
discriminated union — `int(min,max)`, `list(values)`, `sample(n, min, max)`
(distinct draws, the statistics case). Names are `[a-z][a-z0-9_]*`;
collisions with nothing (they live in their own namespace, referenced only
through the delimiters in D4).

**D3 — Value derivation: a tiny seeded PRNG over
`serveSeed(versionId, studentId) + ':' + name`.** Same FNV/mulberry-class
primitive the seeded shuffle uses, one draw per variable, order-independent
(each variable hashes its own name, so adding a variable never re-rolls the
others — publishing an edit doesn't scramble every student's numbers unless
the versionId moved, which it did, which is correct). Deterministic, pure,
dependency-free — it must live beside `serveSeed` in the leaf module family
because BOTH bundles import it (the ordering precedent, verbatim).

**D4 — Substitution is SERVER-SIDE at serve time; the client never sees the
template.** In `get-activity`, after `applyServeShuffles`: walk the served
document's text/data nodes and replace `{a}`-style references (delimiter
decided at build against the existing inline grammar — `{a}` collides with
nothing the importer emits, but the fence audit must confirm) with the
derived values. Blank ANSWERS are not served anyway (stripped), so their
expressions never reach a client. `check-activity` derives the same values
and EVALUATES key expressions before grading: a `{{=a*p}}` key becomes
`parseNumericValue`-comparable at grade time via mathjs/number (already in
the grading bundle). The unit-blank and tolerance machinery compose
unchanged — the expression evaluates to the value the existing compare uses.

**D5 — Which fields accept references (the closed list, guarded):**
prompt/paragraph TEXT runs (`{a}` interpolation), numeric/math blank
`answer`/`acceptableAnswers` (expressions), `data_plot.data` entries (a
`data`-typed variable splices its drawn list), and graph key PARAMETERS are
OUT of v1 (a seeded `slope` is desirable but drags the whole
FunctionModel/tolerance surface in — additive later). The list is enforced
by a guard test, not prose (P11).

**D6 — Print + A/B versions: an explicit seed OVERRIDE on the print surface.**
The teacher print view takes a named seed ("Version A" → seed string
`versionId:print:A`), so one activity prints N distinct papers and the
answer-key twin prints the matching keys. The STUDENT path never accepts a
seed parameter (a client-supplied seed would let a student re-roll to a
neighbour's numbers) — enforced server-side, not by UI absence.

**D7 — The importer validates references at import time.** A `{name}`
reference with no declaration, a declaration nothing references, and an
answer expression using an undeclared name are all WARNINGS (`--strict`
fails) — the misconception-registry posture: catch the typo in the same
dry-run that would publish it.

**D8 — Grading determinism guard.** One walk-level test grades the same
document as two students and asserts (a) their served values differ, (b) each
grades correct against ITS OWN values and wrong against the other's — the
two-spellings-drift bug class, pinned from day one, plus a mutation of the
derivation seam.

**D9 — Deliberately OUT of v1:** re-roll/practice-again (a new draw needs a
new attempt model), seeded values inside `mistake:` matchers (matchers stay
literal; the sensor's value-part matching still fires when the seeded answer
value matches), seeded graph keys (D5), string/name variables, and any
client-visible template syntax.

**D10 — Rollout order.** This slice touches serve AND grade, so the
migration-before-deploy family rule applies doubly: `get-activity` and
`check-activity` must deploy TOGETHER before the app push that lets anyone
author a seeded activity — a seeded activity served by an old function would
show literal `{a}` text; graded by an old function it would mark everything
wrong. The importer refuses `seed:` (warn + strict-fail) until both are
live? — NO: simpler and honest, the deploy-before-push rule already covers
it; the fence audit at build decides whether an extra guard is warranted.

## Cost

Schema (`seedVars` + reference grammar) + derivation leaf module +
get-activity substitution walk + check-activity derivation/evaluation +
importer (`seed:` block, reference validation) + format doc + prompt regen +
print seed override + editor surface (read-only display of declared vars in
the config drawer is enough for v1 — file-based authoring is the source) +
guard tests incl. D8 + BOTH bundles + both redeploys. Likely a
`SANITIZER_REV`-relevant change (the serve transform changes) — expect a
hand `SANITIZER_ALGO_REV` bump since declarations may not capture it; the
printShuffle pin will say.

## Non-goals

Constraint solving, per-section reseeding, client-side re-rolls, seeded
non-numeric content, retrofitting existing literal activities.
