# Math blanks — fill-in-the-blank *inside* an equation — design

**Status:** DESIGN ONLY (2026-07-14). No code. Decisions §D await author ruling per item (the "design pass → green light → code drop" gate). Prompted by the author ask: *"math blocks could contain blanks which contain math blocks."*

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
