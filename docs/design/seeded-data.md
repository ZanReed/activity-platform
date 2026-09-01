# seeded_data — parameterised values, per student (wishlist #6)

**Status: GREENLIT (author, 2026-09-01), as amended R1–R12. Build order:
after the #5 chain (parent families → transform_curve).** One ruling carries
a REVIEW TRIGGER rather than a settled yes: the latex exclusion (R2) is
accepted "until it causes issues" — the first authored activity that needs a
seeded value inside rendered math reopens R2 and the marker-command channel,
rather than working around it. The table-cell question (carried open item)
was folded into the same posture: the closed surface list stands until an
activity needs more.

## Amendments after the outside-voice review (2026-09-01)

- **R1 (changes the design — the sharpest find).** The shared-browser HTTP
  cache residual STOPS being cosmetic: the content response is
  `private, immutable` on a user-independent URL, and the accepted residual
  ("student B may see A's cached response — worst case a cosmetic permutation
  swap") becomes SYSTEMATIC MIS-GRADING once numbers differ per student — B
  answers A's numbers, the server grades B's. RULING: a seeded activity's
  content response is served `Cache-Control: no-store` (conditional on
  `seedVars` being non-empty); unseeded activities keep the year-long
  immutable header. Targeted, and it leaves the documented residual argument
  true for everything it was written about.
- **R2 (changes the design — the delimiter).** `{a}` inside `math_inline`
  LATEX is a structural LaTeX literal (`x^{a}`, `\frac{a}{b}`) — substituting
  there corrupts authored math, and skipping silently renders the letter.
  RULING: latex is OUT of v1's substitution surfaces, enforced loudly — the
  importer WARNS (strict fails) when a declared variable's `{name}` appears
  inside any latex, so the author who tries finds out at import, not from a
  silent letter. The later math channel is a latex-side MARKER command (the
  MathPrompt `\placeholder[id]{}` discipline is the precedent), not brace
  overloading. Prose-side `{a}` stands (verified: the importer leaves almost
  nothing brace-shaped in text runs; blanks tokenize at import).
- **R3 (changes the design — the second template channel).** The CHECK
  response carries authored hints, mistake feedback, and SOLUTIONS from the
  raw document — "remember the price was {p}" would reach students as
  template text. RULING: the same substitution walk runs server-side on the
  check response's outbound content (one shared `substitute()` applied beside
  `sanitizeOut`). And numeric `mistake:` MATCHERS on seeded blanks become
  seed-dependent noise as literals — RULING: matcher strings on seeded
  blanks evaluate as expressions with the same bindings (`!a+p ::` fires for
  every student's own add-instead-of-multiply), and the importer warns on a
  literal numeric matcher attached to a seeded blank.
- **R4 (schema + grading for data_plot).** `data: number[]` (min 1) cannot
  hold a reference. RULING: additive-optional `dataVar?: string` beside it;
  when set, `data` holds a representative literal (editor preview + degraded
  paths render something honest) and BOTH serve and grade splice the drawn
  list over it — the grader computes its key from the SUBSTITUTED dataset
  (the review confirmed the key is computed, never authored, so the splice
  must reach `scoreDotplot`/`scoreHistogram`/`scoreBoxplot`).
- **R5 (reserved names).** Bare-name key expressions run through mathjs,
  whose namespace already owns `e`, `pi`, `x`, `mean`, `min`, … RULING: a
  reserved-name list exported from the evaluator module (single source),
  enforced by schema refine AND the importer. D2's "collisions with nothing"
  is retracted.
- **R6 (math-blank keys).** `mathEquivalent` samples every free symbol — a
  seeded `a` in a math key would be sampled, not bound. RULING: seeded
  values BIND before equivalence runs (`compileFunction`'s `vars` scope
  exists; it needs exporting through the scorers subpath), and evaluation
  slots into `blankTokenToKey`, which means seed context threads through
  `inventorySection` — now costed.
- **R7 (authoring shape).** The meta fence is strictly flat `key: value`;
  D2's indented block cannot parse there. RULING: a ```seed fence of flat
  `name: spec` lines, registered in `importFormatRegistry` with the full
  documentation guard chain (the correspondence slice is the fresh model).
- **R8 (serving the specs).** Meta passes through sanitize untouched, so
  `seedVars` — including a `list` variable's candidate answers — would ship
  to students. RULING: `seedVars` strips from served meta; that is a
  transform change outside the declarations, so THIS is where the hand
  `SANITIZER_ALGO_REV` bump lands.
- **R9 (print is a third, CLIENT-side surface).** The print route runs in
  the teacher's browser on the RAW document with an ACTIVITY-keyed seed
  (`print:{activityId}:v{n}`), draft-first — versionId may not exist.
  RULING: print substitution runs client-side from the same leaf derivation
  module, seeded `print:{activityId}:v{n}` (composing with the existing
  printShuffle discipline, which deliberately does not reuse the serve
  seam); the answer-key twin gains client-side derivation + evaluation so
  expression keys print as numbers, not as `a*p` — this pulls the evaluator
  into the app's print route (teacher-side, not the student shell; perf
  budget checked at build).
- **R10 (corrects the doc's own REV reasoning).** The substitution WALK runs
  per-request after cache retrieval — like the serve shuffle, deliberately
  outside `SANITIZER_REV`; cached template rows stay byte-compatible and no
  orphaning is needed for the walk. The bump is owed only by R8's meta
  strip. (The old-function failure modes stand as written.)
- **R11 (schema discipline).** `seedVars` is optional with NO default — a
  `.default([])` would materialize on every parse→save and trip the batch
  importer's hand-edit fingerprint on every file.
- **R12 (deleted).** The "anonymous seeds as 'anonymous'" sentence described
  a branch that never serves a document body (the anonymous branch is the
  meta endpoint; content 401s) — deleted rather than defended.

**Carried from the review's open questions:** prose interpolation of a
`sample` variable renders the comma-separated list (`{data}` → "55, 61, …" —
the statistics case needs it; in scope); e2e route mocks derive seeded
fixtures from the real derivation module, never retyped (P2, on the guard
list with D8); teacher surfaces reviewing a `locked` check derive with the
ROW's version_id, never the current one (a doc-note for the analytics
surface, no mechanism change); an unresolvable reference at serve time stays
LITERAL and logs — the read path fails safe, the importer's strict gate is
the real fence. The deepest cut on the wishlist —
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

## Build record (2026-09-01 — SHIPPED, with three as-built corrections)

**R8′ (corrects R8/R10 — verified against the shipped cache-hit flow).** The
meta strip runs at SERVE time, not inside sanitize: on a cache HIT the handler
holds only the cached artifact, and meta passes through sanitize untouched
today — so the specs land in the cache for free (the cache is service-role
only) and the strip sits beside the shuffle as a per-request transform. That
is R10's own reasoning applied to R8, and it cancels the predicted
`SANITIZER_ALGO_REV` bump: no sanitize transform changed, `SANITIZER_REV` did
not move, and no cache orphaning was needed. Guarded response-bound (the
served meta never carries `seedVars`; mutation-tested).

**D5′ (widens D5's text surface, deliberately).** The prose walk substitutes
EVERY text run — choices, matching items, all of it — not only
prompt/paragraph runs: restricting it would have made the walk structural for
no student-visible gain. The closed list as built: all prose text runs +
`data_plot.data` via `dataVar`; latex structurally unreachable (the walk keys
on text-node shape); answer keys never walked (grading/print EVALUATE them as
expressions via the shared `resolveSeededEntry`).

**D6 as built.** The print surface's EXISTING Version A–D selector is the
seed override (`printSeed(activityId, version)` already carried it); no new
control. The student path never accepts a seed parameter, as ruled.

**What shipped.** Schema (`SeedVar`/`SeedVars` + reserved-name refine +
`data_plot.dataVar`); the `prng.ts` + `seedValues.ts` + `substitute.ts` leaf
family (derivation per `${seed}:${name}`, D3); serve substitution + strip +
R1's conditional `no-store`; grading (document substituted before
`gradeSection`, key expressions resolved via `evaluateSeededKeys`, R6 math
binding, R3 matcher expressions); the D8 walk-level determinism guard + both
handler-glue pins; importer (```seed fence, D7/R2/R3 validation, `data:
{name}`, registry + prompt + format doc chain); print (client-side derivation
+ answer-key resolution through `substituteSeededAnswers`); read-only drawer
panel. Batch importer: seedVars REPLACE on update (tags' rule), never-clobber
on paste.

**Mutation ledger (this slice): 11** — 3 serve glue (substitute / strip /
no-store), 3 grading (seed spelling / key evaluation / math binding), 1 check
handler (derive skipped), 3 print (substitute / key resolution / version
seed), 1 importer-adjacent (bare-fence rule exercised via registry guard) —
and one of them caught a VACUOUS assertion in its own test (the print key
check read textContent while the key fills input values; the mutation
survived, the assertion was rebound to the inputs, the mutation then
reddened). The pattern the repo keeps paying for, caught at authoring time.
