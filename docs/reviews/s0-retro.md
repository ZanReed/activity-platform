# S0 retrospective — block registry + design tokens (reviewed 2026-08-05)

**Scope:** slice S0 of the components-as-data rewrite (commit `f031486`, 2026-07-28),
reviewed after S1–S8 completed and before S9 cutover. **Evidence base:** the 185
commits since S0, a fresh-context consumer survey of every registry/token consumer,
and friction markers in the code (casts, duplicated mechanisms, concession comments).
Written by the S0-authoring session — an independent audit pass is expected to append
its findings below.

**Method (the template for the S1–S7 retros):** (1) reconstruct what the slice
decided; (2) git archaeology for later commits that had to fix or work around it —
costs already paid, with the commit as evidence; (3) survey how later slices consume
its contracts — load-bearing vs declaration-only vs bypassed; (4) friction evidence at
its seams; (5) classify paid / latent / held-up; (6) prioritized watchlist; (7) flag
rationale gaps (decisions whose "why" is not reconstructible from the repo).

## Verdict in one line

S0's *contracts* mostly held (sanitize grammar, sanitized types, minimal component
props, guard-suite pattern); S0's *consolidation premise* — "one registry replaces the
scattered encodings" — only half-survived contact, and the two decisions that
genuinely hurt were both about **what lives on the same object**, not about any
individual field.

## Costs already paid (lessons banked, no action needed)

1. **`component` on the registry entry — the one load-bearing mistake.** S0 put the
   lazy component binding on the same entry as the sanitize spec. The read API imports
   the registry for sanitize specs, so the Edge Function silently absorbed the
   component tree: 888 KiB → 2.8 MB → **21 MB** before the size print caught it
   (`packages/viewer/src/registry/bindings.ts:4`). The graph-kit barrel lesson
   (CLAUDE.md) replayed: consolidation by *concept* (one block, one entry) when the
   real boundary is *build target* (server data vs client code). Fixed in `a9aca2b`
   (bindings split into `bindings.ts`).
2. **Token namespace collision.** S0 declared `--color-*`/`--radius-*` unlayered on
   the shared `:root`, assuming the viewer would be its own SPA. It became app routes
   instead — and unlayered beats the app's Tailwind `@layer theme` regardless of
   source order, so the viewer silently won all seven shared names app-wide. Opposite
   semantics on `--color-accent-strong` put white text at 1.80:1 on the app's Print
   button. Fixed in `988e701` (`--vw-` prefix + namespace guard).
3. **`MATH_PROMPT_SECRET_FIELDS` shipped incomplete** — `acceptableAnswers` missing: a
   real answer-key leak, caught in S2 (`packages/viewer/src/registry/registry.ts:55`).
   The durable fix was the right shape: the sanitizer's deep walk strips in-band
   secrets *unconditionally*, demoting the `inlineBlankSecrets` flag to documentation.
   Lesson: for secrets, a per-type opt-in list is a deny-list wearing a contract
   costume — the walk that doesn't need the registry to be right is the safe shape.

## Latent costs — what will bite future developers

4. **The registry is a wire contract + guard vocabulary, not the universal metadata
   home its name promises.** Six of eleven S0 fields have **no runtime consumer**:
   `interactivity`, `a11y`, `analyticsKey`, `treatment`, `keepWithNext`,
   `answerKeyVariant` are guard/test vocabulary only. The grading server — the largest
   subsystem built since — *deliberately rejected* the registry
   (`packages/viewer/src/server/grading/walk.ts:11`: a structural deep walk means a new
   blank-embedding type is gradable "with no registry edit"), and print's real rules
   live in `paperAffordances.ts`/`viewer.css`, with
   `packages/viewer/src/registry/printExpectations.ts:10` conceding the `treatment`
   enum sits at the wrong abstraction level ("the real rules are per-BLOCK, not
   per-treatment"). None of those choices were wrong — but a developer who adds a
   registry field *expecting it to drive behavior* will follow the pattern into
   building another declaration-only field. What the registry actually governs:
   **sanitize, shuffle, family, category, census** — everything else is enforced
   vocabulary.
5. **Every strip is hand-encoded twice.** The runtime path list
   (`'choices[].correct'`) and the type-level `Omit` chain in
   `packages/viewer/src/sanitize/sanitized-types.ts` — which S2 rightly declined to
   derive mechanically, and which don't correspond structurally (runtime deletes
   `interaction.tolerance` key-by-key; the type Omits `interaction` wholesale and
   re-adds a sanitized shape). Tests are the only bond. Workable, but the edit-both
   rule is undocumented.
6. **`SANITIZER_REV` hashes the whole `sanitize` object — the spec's natural home is
   expensive to live in.** Any touch orphans the read cache. This already distorted
   the design once: `print.shuffled` lives *outside* `SanitizeSpec` purely to avoid
   moving the rev (`packages/viewer/src/registry/types.ts:158`), which is why two
   near-identical shuffle mechanisms exist (`sanitize/shuffle.ts`,
   `print/printShuffle.ts`). The next field addition faces the same fork, possibly
   unknowingly.
7. **`categoryOf` conflates two axes** — it uses `numbered === 'when_gradable'` as its
   "conditionally gradable" probe (`packages/viewer/src/registry/registry.ts:500`). A
   future conditionally-gradable-but-unnumbered type silently miscategorizes.
8. **Cast tax at the S0 type seams.** `familyOf`/`categoryOf` take schema `Block`, but
   the viewer holds `SanitizedBlock` — four `familyOf(block as never)` sites; 22
   `as never` bindings; a duplicated lazy resolver (`ViewerContainer` +
   `ChildBlocks`). Each cast is a spot where the compiler was told to stop checking
   exactly where checking matters.
9. **Token naming is two-tone and the guard blesses it.** 40 of 189 declarations
   (`--state-*`, `--callout-*`, `--type-*`, `--leading`) never got the `--vw-` prefix —
   outside Tailwind's namespaces so the collision guard passes them, but still
   unprefixed globals on every app route.

## Refactor watchlist

**Cheap now (before S9 locks things in):**

1. Fix `categoryOf` to probe `isGradeable` directly (~10 min) — removes a
   silent-breakage trap.
2. Delete `analyticsKey` — guard-pinned to equal `type`, pure ceremony; let
   `censusKeyOf` use `type` (~30 min, 22 entries).
3. Dead-code sweep: the `LazyBlockComponent` type + the orphaned doc comment above
   `BlockComponentBinding` (~5 min).
4. Rewrite the registry header per finding 4 — one paragraph on what it governs vs
   what it merely enforces, and the edit-both rule for strips (finding 5).

**Opportunistic (next time someone's in the file):**

5. Retype `familyOf`/`categoryOf` to a structural probe (`{type, interaction?,
   prompts?}`) accepting raw and sanitized blocks — kills the four `as never`s.
6. Deduplicate the lazy resolver into one module.
7. Grading's `FREE_TEXT_TYPES` set duplicates the registry's `recorded` family —
   derive it from the registry (server-safe since the bindings split); keep the
   structural walk for everything else.

**Policy (decide deliberately, not by accident):**

8. `SANITIZER_REV` scope — next time a `SanitizeSpec` field is added, decide whether
   the rev should hash only the wire-affecting subset. Don't let field placement keep
   being decided by cache-stampede avoidance.
9. Never key new behavior on `treatment` — it's a label; per-block print rules are the
   pattern.
10. Token prefix: either mechanically rename the 40 stragglers (all consumers live in
    one `viewer.css`) or extend the guard to pin the exact current unprefixed set so
    it can't grow.

## What held up (no apology needed)

The sanitize path grammar (zero extensions needed at runtime for strip paths; the one
addition, `deriveQuestionShape`, was contract-shaped and fenced). `SanitizedBlock`
making `block.solution` a compile error in all 22 components. `BlockComponentProps`
staying `{block, mode}` with context carrying the rest, exactly as declared.
`serveShuffled` as a contract — S5.5's paper shuffle built straight on it. The census
consuming `censusKeyOf` as designed. Zero literal hex in any component CSS, and the
AA contrast harness catching real sub-AA values at design time.
