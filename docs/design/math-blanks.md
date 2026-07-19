# Math blanks — fill-in-the-blank *inside* an equation — design

**Status:** BUILT + GREEN, DEPLOY QUEUED (Model B, 2026-07-19). T1–T7 shipped on `main` (not pushed); only T8 (author-run `upload:graph-kit` → `deploy:publish`) + the owner J1b eyeball remain — see "Eng review resolution" → T8. (Was ENG-CLEARED buildable 2026-07-19 via `/plan-eng-review` + Claude outside-voice; DESIGN ONLY 2026-07-14.) Scope: **Model B (`answerType:'math'`) + the blank-discoverability signifier this arc; Model A (in-equation MathLive prompts) DEFERRED to its own review** (re-sequenced after the outside voice caught a real grading-model hole; matches design D1). Decisions + task list in "Eng review resolution" at the bottom. No code yet. Prompted by the author ask: *"math blocks could contain blanks which contain math blocks."*

## The ask, reframed

The literal request — a `math_block` node containing a `fill_in_blank` node containing another `math_block` — does **not** fit the architecture, and shouldn't:

- Math nodes are `atom: true` ([DECISIONS](DECISIONS.md) "Math nodes are atoms"). Their interior is a MathLive `<math-field>` web component, **not** ProseMirror content, so a ProseMirror blank node physically cannot live inside one. Blanks live *only* inside `fill_in_blank` blocks (the PM schema's `FillInBlankInline` union enforces it).
- Unbounded block-in-block nesting also collides with the codebase's deliberate recursion-termination discipline (definitions forbid nested definitions to break `X→content→X`; `WorkedExampleChild` excludes questions/columns "so nesting terminates"; the dashboard index recursion assumes finite depth). It isn't a harmless quirk — it would break real invariants.

What the author actually wants pedagogically is legitimate and common: **a gap inside a rendered equation that the student fills with a math expression.** Example:

> x = \frac{-b \pm \sqrt{b^2 - 4ac}}{\boxed{\phantom{2a}}}   → student fills `2a`

The right mechanism is **MathLive's native prompt / `\placeholder` feature**: one math node whose LaTeX contains editable, independently-gradeable gaps, each with a math-expression answer. So you get "a blank that contains math" as **one flat math node with prompt regions** — no nested ProseMirror nodes, no recursion.

## Two candidate models

**Model A — in-equation MathLive prompts (the true match).** A `math_inline` / `math_block` node carries one or more `\placeholder[promptId]{}` gaps in its LaTeX plus per-prompt answer metadata. On the published page the equation renders read-only with editable gaps the student types into. This is what the author drew.

**Model B — math-graded ordinary blank (the cheap 80%).** Extend the existing `BlankToken` with `answerType: 'math'`: the student types into a normal blank chip in a sentence (a plain `<input>`), and the answer is graded by math-equivalence instead of string match. Delivers "the answer is math" (e.g. *"Simplify: the denominator is ___"* → `2a`) **without** the in-equation visual and **without MathLive on the page for input**.

They are not mutually exclusive — B is a strict subset of the grading machinery A needs, and it ships first with far less risk. Recommendation in §D1.

## The load-bearing constraints (why this is a feature, not a tweak)

1. **MathLive on published pages.** The base runtime ships **no MathLive** by design — it reaches pages *only* inside the lazy, content-hashed graph-kit bundle, fetched on calculator open ([CLAUDE.md](../../CLAUDE.md); DECISIONS "Phase 2.7"). Base runtime is ~39.2 KiB against a 40 KiB soft target / 60 KiB ceiling. Model A needs a MathLive field embedded in the equation for *input*; Model B needs the math *engine* only for *grading*. Either way the capability already exists in the kit (`packages/graph-kit`: `calculator.ts`/`expression-list.ts` import `MathfieldElement`; `evaluate.ts` is the math.js seam). So the pattern is settled: **lazy-load the kit on pages that use math blanks**, exactly like the calculator — base runtime and plain worksheets are untouched.

2. **Math-equivalence grading needs the engine.** `2a` ≡ `2·a` ≡ `a·2` ≡ `a+a`. The kit's engine is **math.js number-only** (`mathjs/number`), not symbolic ([DECISIONS](DECISIONS.md) "The engine boundary is the batchability line"). So equivalence is decided by **numeric sampling** — evaluate the student's expression and the key at several random assignments of the free variables and compare within tolerance — the *same* technique `plot_function` already uses to match curves. Symbolic CAS ("is this factored?", "is this fully simplified?") is Tier B behind the still-unmade Compute Engine decision and is **out of scope** here.

3. **Wire format — likely NO bump (corrects the first-pass estimate).** A prompt/math-blank answer is still *a string* (the student's LaTeX or ASCII-math) plus a client-computed `correct` boolean — byte-identical to today's `BlankResponse {answer: string, correct: boolean, confidence?}`. If each prompt is keyed by its own uuid in the **existing `blanks` map**, `SubmissionResponses` stays **v9**: no new parallel map, no `schemaVersion` bump, **no `ingest-submission` redeploy**. This obeys the "don't widen `BlankResponse`, add parallel maps for new *shapes*" rule precisely — the shape is unchanged, so reuse (not a new map) is the correct call. (A new map would only be needed if we chose to persist structured math — a parsed AST — which we don't; YAGNI.) The `correct` boolean stays client-side/advisory, same security ceiling as every other blank.

## Decisions for author ruling (§D)

**D1 — Scope / sequencing.** Recommend **Model B first, then Model A** as two slices of one arc: B builds and proves the grading engine (math.js sampling equivalence, tolerance/form options, dashboard display) against a trivial UI (an existing blank chip); A then adds only the in-equation authoring + rendering on top. Alternative: skip straight to A (the author's literal ask) and accept the bigger single drop. *Recommendation: B → A.*

**D2 — Grading semantics.** Numeric **sampling equivalence** as the default (`2a`, `a·2`, `a+a` all pass), with an author toggle per blank:
- `equivalence: 'value'` (default) — any expression that evaluates equal.
- `equivalence: 'exact-form'` — normalized-string match (for "write it in this form" / "don't simplify" items), reusing the AsciiMath normalizer.
- plus the existing `tolerance` for numeric wobble on sampled values.
Free variables are inferred from the key (e.g. `a`, `b`, `c`); domain of sampling avoids singularities (skip samples where the key is undefined/∞, like the curve matcher does). *Ruling needed: is `value`-equivalence the right default, and do we ship `exact-form` in v1 or defer it?*

**D3 — Runtime delivery.** Pages containing a math blank lazy-load the graph-kit **on demand** (Model A: when the equation first gains focus / on init if present; Model B: at check time), mirroring the calculator-summon path. Base runtime gains only a tiny detector + mount hook (target < +0.5 KiB, stay under 40). *Ruling: accept the kit dependency on these pages (consistent with calculator/graph blocks), yes/no.*

**D4 — Where the answer data lives (Model A).** Store prompt answers **on the math node**, not as separate `BlankToken`s: a new optional `prompts: [{ id, answer, acceptableAnswers?, equivalence?, tolerance?, hint?, mistakeFeedback? }]` field on `InlineMathNode` / `math_block`, with `id`s that match the `\placeholder[id]{}` markers in the `latex`. Rationale: the gap is *in* the LaTeX, so its metadata belongs to the node that owns the LaTeX; separate tokens would need a second placement contract. Document-schema change only (additive, optional ⇒ **no `ActivityDocument.schemaVersion` bump**, like every other additive block field). *Ruling: on-node `prompts` vs. reusing `BlankToken` some other way.*

**D5 — Nesting depth (the "blocks in blocks" worry).** A prompt's answer is a **plain math expression** — it may contain structure (fractions, roots), but **not another gradeable prompt**. One level of gap, full stop. This terminates recursion, matches the codebase discipline, and covers ~every real classroom case. *Ruling: forbid nested prompts (recommended), yes.*

**D6 — Submission wire.** Reuse the **`blanks` map** with per-prompt uuids ⇒ **no wire bump, no ingest redeploy** (see §constraint 3). *Ruling: confirm reuse over a new `mathPrompts` map. Recommended: reuse.*

**D7 — Print.** A prompt renders on paper as a boxed gap in the equation (baseline print CSS: interactive controls hidden, gap → bordered box). Model B math blanks print exactly like today's blanks (bare underline). No new decisions expected; flagged for completeness.

## Proposed slices (pending §D)

### Slice 1 — Model B: `answerType: 'math'` (grading engine, no in-equation UI)
- **Schema:** add `'math'` to `BlankToken.answerType`; add optional `equivalence: 'value' | 'exact-form'` (absent = `'value'`). Additive ⇒ no doc `schemaVersion` bump. Wire unchanged (v9).
- **Kit:** a pure `mathEquivalent(studentAscii, keyAscii, opts) → boolean` in `packages/graph-kit` reusing `normalizeAsciiMath` + `evaluate` (number-only) with multi-point sampling over inferred free variables. Unit-testable in isolation (the batchable, high-value core).
- **Runtime:** the blank scoring strategy for a `'math'` blank dynamically imports the kit and calls `mathEquivalent` (client-side `correct`, advisory as today). Base runtime gains only the dispatch + lazy import.
- **Editor:** answer-type selector in the blank popover gains a "Math" option (sits beside Text/Numeric); the answer field accepts LaTeX/ASCII. Reuses the existing FormulaField.
- **Verify:** author on `/playground`; a `2a`-style answer accepts `2a`/`a*2`/`a+a`, rejects `2b`; `exact-form` rejects unsimplified when set.

### Slice 2 — Model A: in-equation prompts
- **Schema:** on-node `prompts` field (§D4) + `\placeholder[id]{}` convention in `latex`.
- **Editor:** insert-a-prompt affordance in the math NodeView (MathLive supports authoring placeholders); a side panel to set each prompt's answer/equivalence/tolerance/hint. Rides the Stage-1 blank-answer machinery.
- **Renderer:** emit the equation with data-attributes marking each prompt gap (additive to the RUNTIME.md data-attribute contract — never rename/remove).
- **Runtime:** on a page with math prompts, lazy-load the kit; render the equation as a MathLive **read-only field with editable prompts**, capture each prompt's value, score via `mathEquivalent`, persist keyed by prompt id in the `blanks` map. Reveal/lock/confidence reuse the existing blank machinery.
- **Storage:** if per-prompt state fits the existing `BlankState` (a string value + correct), **no `STORAGE_SCHEMA_VERSION` bump**; confirm during build and bump only if the shape must widen.
- **Verify:** end-to-end on a published page — fill a quadratic-denominator gap, check, reveal, reload-restore.

## Deploy implications (summary)

- **Kit change** ⇒ `pnpm upload:graph-kit` **before** `publish-activity` redeploy, commit the regenerated `graph-kit-manifest.ts` (CLAUDE.md kit-invariant order).
- **Renderer/runtime change (Slice 2)** ⇒ `pnpm bundle:renderer`, commit the bundle in-commit; `publish-activity` redeploy queued as a pending author action.
- **Wire unchanged (v9)** under §D6 ⇒ **no `ingest-submission` redeploy** (the reverse order is never needed anyway). This is the corrected, happier deploy story vs. the first-pass estimate.

## Non-goals / explicitly out of scope

- Symbolic CAS grading ("is it factored / fully simplified?") — Tier B, Compute Engine escape hatch, not this arc.
- Nested prompts (§D5) — forbidden by design.
- MathLive in the base runtime — it stays kit-only.
- Cross-blank interchangeable *math* groups — the existing `interchangeableWithPrevious` sugar is text-oriented; revisit only if a real case appears (YAGNI).

## Open questions for kickoff

1. §D1 sequencing (B→A vs. straight to A).
2. §D2 default equivalence + whether `exact-form` is in v1.
3. Sampling policy details: how many sample points, variable domain, and how "undefined at a sample" is handled (reuse the curve-matcher's skip-and-resample?).
4. Does Model A need **multiple** prompts per equation in v1 (e.g. fill numerator *and* denominator), or is single-gap enough to start?

---

## Eng review resolution (2026-07-19, `/plan-eng-review`)

Status upgraded: **DESIGN → ENG-CLEARED (Model B), buildable.** Scope was re-sequenced during review. First ruling was full B+A; after the outside-voice pass (which caught a real hole in the grading model) the author re-ruled to **Model B this arc + the blank-discoverability signifier; Model A deferred to its own review once B's sampling engine is proven on real answers** (matches the original design D1 and de-risks the irreversible Model-A surface). Decisions below; the outside-voice corrections are folded in (A1 is the corrected version).

**A1 — Grading seam (the crux — CORRECTED after outside voice).** The original "compute-live/read-sync like graphs" framing was **wrong for blanks**: unlike graphs (scored by a separate read-only function), blanks are **re-scored synchronously on every check AND every submit** — `scoreBlanksInScope` ([blanks.ts:218](../../packages/renderer/src/runtime/blanks.ts)) reads `input.value` → sync `evaluateAnswer` → overwrites `state.blanks[id].result`, and it's called by BOTH `checkSection` ([checkpoints.ts:58](../../packages/renderer/src/runtime/checkpoints.ts)) AND `gatherResponses` ([submission.ts:298](../../packages/renderer/src/runtime/submission.ts)). A live-computed result would be clobbered to a string-match `false` at submit. **Corrected model:** eager-load the kit; once resolved, hold a **module-level SYNCHRONOUS `mathEquivalent` reference**; add a real `'math'` entry to `strategies.ts` that calls that held reference **synchronously** — so the existing sync re-score path works unchanged in both check and gather (no async anywhere in the check/gather path). A math blank is "unscored" **only** during the brief pre-load window (A2). Math blanks must NOT be silently dropped from `scoreBlanksInScope`; the `'math'` strategy IS the integration point, so the consume-once group core is untouched. `strategies.ts:22`'s sync `(input, typed) => boolean` signature is preserved.

**A2 — Kit-load-failure fallback.** Fire the kit `import()` eagerly (fire-and-forget) at init on any page containing a math blank, so it's almost always ready by check time. If the kit still isn't loaded at check, mark that blank **UNSCORED (not wrong) but still submit the raw typed value** — the teacher sees the answer, submission never blocks. **Caveat (outside voice):** an unscored blank still counts in the section-score denominator (`total = blankIds.length`) with a null result, so it renders like a miss ("2/5"). Decide at build: either exclude unscored math blanks from the tally, or accept the transient display until the kit lands (recommend exclude-from-tally so the fallback intent survives the section aggregate).

**A1b — Stale-result detection → NOT NEEDED (resolved during build, no storage change).** The outside voice raised this under the *pre-correction* compute-live model. With the corrected held-sync-reference A1, math blanks **re-score at check** through the same sync path as text/numeric (they self-heal), and `saveActivityState`/`applyStoredState` store+restore the typed value and the result **in one blob atomically** ([storage.ts](../../packages/renderer/src/runtime/storage.ts):170,317), so a restored result always matches its restored value (they can't desync; edits clear the result via `clearBlankState`). No graded-value field, **no `STORAGE_SCHEMA_VERSION` bump** — bumping would wipe every student's saved progress for no benefit. Proved with a save/restore round-trip test (`math-blanks.test.ts`).

**A3 — Model A prompts per equation → DEFERRED with Model A.** (When A is built: v1 supports **multiple** independent prompts per equation via the on-node `prompts: [{id, answer, …}]` array (§D4), keyed by id into the `blanks` map identically for N=1..N. Model A makes MathLive an **input** surface on published pages for the first time — its own review will size the CDN-font / mobile-VK / a11y / print costs the outside voice flagged.)

**Q4 — `mathEquivalent()` (DRY).** Build it on `normalizeAsciiMath` + `compileFunction` ([evaluate.ts:289](../../packages/graph-kit/src/evaluate.ts) already compiles AsciiMath into `(x, vars?) => number` with a multi-var scope): infer free vars via math.js `parse`, sample over random assignments, compare within tolerance. One pure exported fn in `packages/graph-kit`, imported by BOTH the runtime and the editor preview (the graph-kit-leaf single-source pattern — see learning `drawable-color-palette-graphkit-leaf`). Reuses the proven evaluator; no second parser.

**Q5 — Latex/prompt sync → DEFERRED with Model A.** (When A is built, the `\placeholder[id]{}`-in-latex + `prompts[]`-on-node duplication is the reincarnation of `drawable-inline-edit-roundtrip-dataloss`; resolve with **latex-as-truth + reconcile** in a pure `mathPromptSync.ts`, mirroring `drawableFormulaLogic`. Not needed for Model B.)

**Q6 — Grading semantics (resolved — was open q #3, sharpened by outside voice; BUILT in T1).** Sample over the **union of the key's and the student's free variables** (else a correct-but-verbose `a+a+0*b` leaves `b` unbound → NaN → wrongly wrong). Default `equivalence: 'value'`; ship `'exact-form'` (normalized-string) in v1 as a per-blank author toggle. Sampling policy: ~12 points; the domain must **include negatives where the expression is defined** so `sqrt(x^2) ≡ x` is correctly a **false** (positive-only sampling makes it a false positive); skip-and-resample on NaN/undefined/∞ (the curve-matcher's discipline); compare with the existing absolute `tolerance`. These traps are the real work in T1 and each needs a unit test.

**Q7 — Dashboard rendering (new, from outside voice).** A math blank's answer reaches the teacher as a math string in `responses.blanks[id].answer`. Simple answers (`2a`) read fine; fractions/roots look raw. **KaTeX-render math-blank answers in the Submissions view** (the app already inlines KaTeX) so the teacher reads the equation, not the source.

**T6 — Test strategy.** Pure `mathEquivalent` **unit tests** in graph-kit (the batchable core, incl. every Q6 trap); **jsdom runtime tests** for the held-reference score/persist/restore path (the `init.test.ts`/`free-text.test.ts` pattern — the mock resolves instantly, so ALSO test the pre-load "unscored" window and the A1b stale-value re-grade, which the instant mock would otherwise hide); **owner manual J1b** on a real published page. No new real-browser published-page e2e harness (the kit loads from R2, can't be served in CI; no prior kit-graded feature built one).

**P7 — Grading cadence.** With the held-sync-reference model, the existing sync re-score on **check** grades correctly; additionally recompute on **blur** so a restored/edited value is fresh. **Never per-keystroke** (avoids N-point sampling per character; keeps correctness hidden until Check like every other blank — no live green/red, no soft answer-leak).

**CRITICAL regression pin (IRON RULE — no approval needed):**
- Adding `'math'` to `BlankToken.answerType` must leave existing `text`/`numeric` blanks **byte-identical** on re-serialize.

### NOT in scope (deferred, with rationale)
- **Model A (in-equation MathLive prompts) — deferred to its own review** once Model B's sampling engine is proven on real answers (re-ruled after outside voice; matches design D1). Its irreversible surface (additive-only RUNTIME.md contract, MathLive-as-input, mobile-VK/a11y/print/CDN-fonts) gets sized honestly there, not front-loaded.
- **Symbolic CAS grading** ("is it factored / fully simplified?") — Tier B, Compute Engine escape hatch; numeric sampling only.
- **Real-browser published-page e2e harness** — jsdom + owner-manual covers it (T6).
- **Wire / `ingest-submission` redeploy** — none (Model B reuses the `blanks` map; wire stays v9). **No `STORAGE_SCHEMA_VERSION` bump either** — math blanks reuse the existing `BlankState` shape unchanged (A1b resolved without a new field; a bump would needlessly wipe student progress).

### What already exists (reuse, don't rebuild)
- `normalizeAsciiMath` + `evaluate` + `compileFunction` (multi-var scope) — the evaluator core of `mathEquivalent`.
- `scoreBlanksInScope` / `strategies.ts` dispatch — the sync re-score path the `'math'` strategy plugs into (A1).
- Blank popover Text/Numeric answer-type selector + `FormulaField` — the editor surface for the Math option.
- Submissions view KaTeX inlining — reuse for Q7 (render math answers).
- `PlaceholderHint` / `PromptField` ghost-text patterns — the signifier's building blocks.
- `calculator-summon.ts` / `graph-integration.ts` lazy `import(kitSrc)` — the eager-preload plumbing (A2).

### Implementation Tasks — Model B + signifier (this arc)
Synthesized from the findings; each derives from a locked decision. `pnpm test` / `pnpm --filter @activity/app test:e2e` to verify.

- [ ] **T1 (P1)** — graph-kit — `mathEquivalent()` pure fn on `normalizeAsciiMath`+`compileFunction`; free-var **union** inference; ~12-pt sampling with a signed domain + skip-and-resample; `value`/`exact-form` modes; tolerance. Files: `packages/graph-kit/src/`. Verify: unit ★★★ incl. every Q6 trap (`a+a≡2a`, `sqrt(x^2)≢x`, `a+a+0*b≡2a`).
- [ ] **T2 (P1)** — schema — `BlankToken.answerType +'math'` + `equivalence` enum; **byte-identity regression pin** for text/numeric. Files: `packages/schema/src/inline.ts`. Verify: unit CRITICAL.
- [ ] **T3 (P1)** — runtime — `'math'` strategy calling the **held sync `mathEquivalent` reference**; eager kit preload at init when a math blank is present; kit-fail → unscored-but-submitted + **exclude unscored from the section tally** (A2 caveat); blur+check cadence. Files: `packages/renderer/src/runtime/{strategies,blanks,init,checkpoints}.ts`. Verify: jsdom ★★★ (A1, A2, P7).
- [x] **T4 (P1)** — runtime/storage — A1b **resolved with NO storage change** (held-sync-reference re-scores at check; value+result stored atomically → can't desync). Delivered instead as a jsdom runtime integration test (`math-blanks.test.ts`, 7 tests): real-`mathEquivalent` grading via `scoreBlanksInScope`, the not-loaded→null / A2 path, and a save/restore round-trip proving no staleness. No `STORAGE_SCHEMA_VERSION` bump.
- [ ] **T5 (P2)** — editor — blank popover Math option + FormulaField answer field + per-blank `equivalence`/`tolerance` controls. Verify: e2e ★★.
- [ ] **T6 (P2)** — app — Q7: KaTeX-render math-blank answers in the Submissions dashboard. Files: `packages/app/src/routes/Submissions.tsx`. Verify: component ★★.
- [ ] **T7 (P2)** — editor — blank discoverability signifier. **Form RESOLVED via `/plan-design-review` 2026-07-19: FORM A (ghost text only)** — author's final call: the mouse/keyboard second leg (a quick-bar "Insert blank" action) is dropped as unnecessary. Extend the fill-in-blank `PromptField`: empty body reads "Type the sentence…  ( `__` makes a blank )"; once there's text but **zero blanks**, show trailing faint "type `__` to make a blank"; fades permanently once the block has ≥1 blank (show-when-no-blank, hide-forever-after). Pure `.prompt-field`/`--ed-faint` reuse, no new component, no new a11y surface. Rejected: standalone `+`-underline in-text widget (off-idiom — collides with gutter insert-`+` and a real blank's underline). Verify: e2e ★★ (hint appears with text+no-blank, gone after a blank).
- [ ] **T8 (P1) — DEPLOY, author-run (the ONLY thing left).** Order matters (kit before function): **(1) `pnpm upload:graph-kit`** — re-hashes + uploads the kit that now exports `mathEquivalent`; commit the regenerated `graph-kit-manifest.ts`. **(2) `pnpm deploy:publish`** — `publish-activity` redeploy so newly-published pages carry the math-blank runtime (strategy + preloader + kit-src emit + tally) and the `data-answer-type="math"` emit. **NO `ingest-submission` redeploy** (wire stays v9 — math answers reuse the string `blanks` map). **NO `STORAGE_SCHEMA_VERSION` bump.** The renderer bundle is already committed (T3). Until deployed, a published math blank stays ungraded-but-submittable (A2). Owner J1b after deploy: author a math blank live, answer `a+a` for key `2a` as a student, confirm correct + dashboard renders the math.

**BUILD COMPLETE 2026-07-19 — T1–T7 shipped + committed on `main` (not pushed), fully green.** Suite: schema 302 / graph-kit 362 / renderer 610 / app 659 unit + 108 e2e (incl. `math-blank.e2e.ts` + `blank-signifier.e2e.ts`); full monorepo typecheck + lint clean. Only T8 (author-run deploy) + the owner J1b eyeball remain.

**Deferred to the Model A review:** on-node `prompts[]` + `\placeholder` renderer contract; `mathPromptSync.ts` (latex-as-truth reconcile, Q5); `init.ts` math-gap walker + MathLive read-only-with-prompts runtime field; Model A authoring UI; the MathLive-as-input cost spike (CDN fonts / mobile VK / a11y / print).

**Owed design call (not eng):** the signifier's visual form (T7) — `/plan-design-review` or author taste.

### Parallelization
Lane A (Model B core, sequential — shared graph-kit + runtime blank path): T1 → T2 → T3 → T4 → T5 → T6. Lane B (independent): T7 signifier. **Launch A and B in parallel; T8 deploy-prep after A lands.** Model A is a separate future arc, not a lane here.
