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

---

## Independent audit (2026-08-05, second-pass session)

Adversarial verification of every claim above against the repo (every cited commit
and file re-read, every count recounted), then a hunt for what the retro does not
examine: the S0 surfaces its authoring session treated as settled — package/build
setup, the tokens.ts mechanism, the guard suite's own cost, the checked-state spec.

**Verdict on the retro:** the findings substantially hold — no claim is invented,
and the two "what lives on the same object" lessons (findings 1–2) are exactly
right. But three claims are materially wrong (§7's severity, §9's count, the
`serveShuffled` held-up item), several numbers and cites need correction, and the
blind spots cluster in one place: **the retro audits what S0 declared, not what S0's
own machinery does** — the guard suite, the typed token lists, and the build setup
were never turned over.

### Confirmed

Findings 1, 2, 3, 5, 6 (the rev half), 7 (the line cite), 8 (both counts exact: four
`familyOf(… as never)` sites, 22 `as never` in bindings.ts); watchlist items 1–4's
feasibility estimates; "189 declarations" in finding 9; the 185-commit figure (true
at authoring time); held-up items on `BlockComponentProps` (exactly `{block, mode}`
today, zero widening anywhere) and the census (`census.ts:84-90` explicitly refuses
to restate `censusKeyOf`'s rule). The MATH_PROMPT leak narrative is precise:
S0 shipped `['answer', 'equivalence', 'tolerance']` while `BLANK_SECRET_FIELDS`
*did* include `acceptableAnswers` — a per-list gap, fixed in `8ce27f2` (the missing
evidence pointer for finding 3). Guard integrity: zero assertions weakened or
deleted since S0; the one roster that changed got stricter.

### Corrected

1. **`categoryOf` is dead code, and the live bug is worse than finding 7 says.**
   The resolver has zero runtime callers — `ViewerContainer.tsx:482` emits
   `data-block-category={entry.category}`, the *unresolved* value, despite
   `registry.ts:191`/`:347` claiming "display variant resolves content via
   categoryOf()". So display-mode graphs and data plots emit `question` in the DOM
   today, and watchlist item 1 as written fixes a function nothing calls. The real
   fix is two steps: fix the probe AND wire the resolver into `ViewerContainer`
   (or delete it and say the field is static).
2. **Finding 4's "six of eleven" mixes nesting levels and gets two fields wrong.**
   Only 3 of the 6 are entry fields (`interactivity`, `analyticsKey`, `a11y`);
   `treatment`/`keepWithNext`/`answerKeyVariant` live on the nested `PrintSpec`.
   `analyticsKey` *has* a runtime consumer — `censusKeyOf` reads it on the server
   census path (`registry.ts:511,513`), which is why watchlist item 2 exists; §4
   contradicts the retro's own watchlist. And `treatment`/`keepWithNext` are read by
   `printExpectations.ts:449,473,493` — a public exported API driving the Playwright
   print gate, not test-file vocabulary. The honest cut: `interactivity`, `a11y`,
   `answerKeyVariant` are truly consumer-less; `analyticsKey` is tautological
   (guard-pinned to `type`); `treatment`/`keepWithNext` drive the print gate only.
3. **Finding 9's "40 of 189" — 189 is exact, 40 matches nothing.** The unprefixed
   set is **121 declarations / 55 unique names**, and the retro omits six entire
   families (`--space-*`, `--z-*`, `--gutter-*`, `--focus-*`, `--measure`,
   `--touch-target`). Also: `--leading` escapes the guard on a trailing-hyphen
   technicality (`leading` IS a Tailwind namespace; the token is bare `--leading`),
   not by being outside the namespaces — and the guard only inspects the `:root`
   segment, so a collision declared in a theme block would pass. Watchlist item 10's
   "all consumers live in one viewer.css" is true for `var()` reads but the rename
   is not one-file: tokens.ts, two guard tests' string templates, DESIGN.md, and
   README all carry the names. The app already declares `--callout-accent` in
   editor.css — same `--callout-*` family, no overlap yet, exactly finding 2's
   failure class.
4. **Finding 6 overstates the duplication.** The PRNG is single-sourced
   (`printShuffle.ts:32` imports `seededShuffle`); what's duplicated is the ~45-line
   document *walker* (`applyServeShuffles`/`applyPrintShuffles`, line-for-line
   identical down to the comments — printShuffle even recurses via
   `sanitize.childBlocks`, not a print field). "One shuffle primitive, two
   near-identical walkers."
5. **The held-up list's `serveShuffled` item is wrong as written.** S5.5's paper
   shuffle explicitly *refused* to build on `serveShuffled`
   (`printShuffle.ts:16-21`: extending it would change the wire and move
   `SANITIZER_REV`). What was reused: the `seededShuffle` primitive and the
   declaration *pattern*. The actual bond is a guard test
   (`printShuffle.test.ts:275-299`: every serve-shuffled field is also
   print-shuffled). That's a *good* outcome — but it's the opposite of "built
   straight on it," and it's the same fork finding 6 warns about, already taken.
6. **Finding 8 undercounts the cast tax.** 49 real `as never` casts in
   `packages/viewer/src` (retro accounts for 26). The unmentioned second cluster:
   `server/grading/graphs.ts` (9) and `print/DefinitionGlossary.tsx` (5) — a
   different seam (grading↔graph-kit) with the same disease. And the "duplicated
   lazy resolver" is a **correctness gap, not DRY**: `ViewerContainer` and
   `ChildBlocks` each hold their own module-level `lazyCache` Map, so a lazy type
   rendered both top-level and nested gets two distinct `React.lazy` identities —
   precisely the remount/state-loss failure the cache's own comment says it
   prevents. Watchlist item 6 should be promoted from "opportunistic" to "cheap
   now."
7. **Finding 5's bond is weaker than "tests are the only bond."** The type-side
   check is `sanitized-types.test-d.ts` — not run by vitest (deliberate: vitest's
   typecheck mode silently passed broken assertions; plain `tsc` enforces it), a
   hand-written flat list with **no completeness guard over `registeredBlockTypes`**.
   A new strip path added to a registry entry passes the runtime leak suite and
   leaves the type file untouched — the bond does not detect the drift it exists
   for. (Its header also cites `tests/sanitized-types.test.ts`, a file that doesn't
   exist — it's `.test-d.ts`.)
8. **Citation and framing fixes.** Finding 1: the size figures live at
   `bindings.ts:11-13` (`:4` is the topic sentence); 888 KiB was the clean baseline
   *before* any bindings, not leaked state — the leak is the 2.8 MB and 21 MB
   steps; `a9aca2b` is primarily the interactive_graph component commit (the split
   rode along). Finding 2: the collision surface was **four** Tailwind namespaces
   (`--color/--radius/--font/--shadow`), and "seven shared names" = 5 app-declared
   + 2 Tailwind defaults (`--radius-md/lg`). Finding 3: `inlineBlankSecrets` is not
   purely documentation — `types.ts:87-92` names it the hand-followed
   type-projection signal for `sanitized-types.ts`, and it's test-pinned. Finding
   4's quotes are verbatim but live at `walk.ts:14-15` and
   `printExpectations.ts:13-14` (`:11`/`:10` are paragraph openers). Held-up items:
   "the one addition" is true of the strip *grammar* but the sanitize module also
   gained `sanitizeInlineContent` (S4, `61dae3f`) and a behavior change to
   `seededShuffle` (the never-return-identity rotate, `a3a3ada`);
   "`block.solution` a compile error in all 22" is load-bearing in only the 9 types
   that declare a solution; "zero literal hex in any component CSS" is true of a
   package with exactly one component stylesheet — and the worst real sub-AA value
   (1.80:1) was caught by the app's e2e *after going red on main*, not by the
   design-time harness, whose scope is the state trio + inks + accent on paper.

### Missed — what the retro never examined

9. **The guard suite's own maintenance cost — the retro's method audits every S0
   contract except the enforcement machinery itself.** The evidence is strongly
   favorable and deserved banking: 3 of 186 commits touched the two guard files
   (~86 changed lines total); zero weakened assertions; test count 59 → 79 with
   only 2 new hand-written declarations (the rest parametric). The feared
   add-a-block-type tax was never levied — 22 types at S0, 22 today. But the
   counterfactual bill is real and unpriced: `registry.test.ts` carries **6
   hand-maintained rosters** (48 type literals), 13 more test files hold hardcoded
   type rosters (`leakFixture.ts` lists all 22 with zero derived refs), and the one
   semantic vocabulary change in the window (S5-OV6) rippled across **7 files**
   with the same roster edited twice in 17 minutes — after which the author added a
   rule-derived test whose comment concedes the roster form was the wrong shape.
   The honest generalization of finding 4: rosters that restate declarations are
   shadow bookkeeping; guards derived from rules (`registeredBlockTypes`,
   `treatment === 'writing-box'`) self-adapt. `styles.test.ts:183-185` already says
   this out loud.
10. **The namespace guard is a post-hoc pin, not a catch.** The S0 guard suite did
    *not* catch finding 2's collision — the app's e2e did, red on main. `988e701`
    then added the cheap unit-level pin. The retro credits the guard arc without
    noting its one real-world miss was caught downstream.
11. **tokens.ts's typed-list premise is dead — the token-side twin of finding 4.**
    The stated purpose ("TypeScript consumers can reference tokens without string
    literals") never materialized: `ColorToken`/`StaticToken`/`DesignToken` and the
    two arrays have **zero component consumers** — only the guard tests and the
    barrel re-export. Their real job (guard vocabulary: CSS↔list sync, theme
    completeness, AA harness input) is load-bearing and sufficient; the header
    should say that instead.
12. **Guard rot from the `--vw-` rename itself.** `styles.test.ts`'s box-shadow
    assertion still pins `var(--shadow-` — a family `988e701` renamed away. It is
    vacuous today (zero `box-shadow` declarations in viewer.css) and will
    *spuriously fail* the first correct `var(--vw-shadow-*)` use. The same test's
    "colorish" filter (`/^--(?:color|state|callout)-/`) no longer matches the
    renamed `--vw-color-*` family, silently narrowing the named-colour subset check
    to the unprefixed families (the wider all-namespaces check compensates). Small,
    but it's the finding-9 two-tone cost reaching into guard logic.
13. **The `--vw-shadow-*` trio has zero consumers anywhere** — declared in
    tokens.css/tokens.ts, consumed by nothing. Declaration-only tokens, the exact
    pattern finding 4 flags on the registry side.
14. **Build/tsconfig surfaces were never opened.** (a) Server-bundle purity is
    enforced solely by the size ceiling — deliberate and documented
    ("every real leak has been enormous", `bundle-viewer-server.mjs:66`), but worth
    stating: a small wrong-code leak passes the only guard. (b) The package-wide
    `lib: ["ES2022", "DOM"]` means the Edge-Function-bound `server/` subtree
    typechecks against DOM globals — nothing type-level stops `document`/`window`
    creep into grading code; the current cleanliness is by convention. (c)
    `package.json` `exports` points at `./src/index.ts`, so `build: tsc` emits a
    `dist/` nobody consumes — stale artifacts that already pollute greps (a stale
    `dist/tokens.d.ts` surfaced during this audit). (d) `server/index.ts` isn't in
    the exports map; the bundler deep-imports it — the real server API surface is
    invisible from package.json.
15. **The barrel grew from 42 to 347 lines as an append-only chronolog.** Client
    and server exports interleave in S-number order; the load-bearing negative
    rules ("deliberately absent from server/index.ts — V9 lesson") live in
    comments, enforced only by entry-file reachability plus the size ceiling. The
    "intentional friction" premise held (nothing leaked via the barrel), but the
    file now reads as history, not topology.
16. **The checked-state family spec held up well — one wording note and one
    unbonded restatement.** "Model A prompts" is reconstructible
    (docs/design/math-blanks.md, RUNTIME.md §math-prompts), so no rationale gap.
    But the recorded trio is now stated in three places — the spec's "exactly the
    manually reviewed free-text trio, and nothing else, ever", the registry's three
    `family: 'recorded'` entries (guard-bonded), and grading's hand-coded
    `FREE_TEXT_TYPES` (`walk.ts:60`, bonded to neither) — watchlist item 7 fixes
    the third leg and should cite the spec's "nothing else, ever" line as the
    reason it matters.

### Audit addenda to the watchlist

- **Promote item 6 (deduplicate the lazy resolver) to "cheap now"** — it's a live
  correctness gap (two `React.lazy` identities for nested lazy blocks), not DRY.
- **Rewrite item 1**: fix the `categoryOf` probe *and* wire it into
  `ViewerContainer` (or delete the resolver) — as written it patches dead code
  while the DOM ships unresolved categories.
- **Recompute item 10 on the real numbers** (121 declarations / 55 names, six more
  families) before choosing rename vs pin; either way fix the two rotted
  `styles.test.ts` assertions (box-shadow regex, colorish filter) and decide the
  fate of the unconsumed `--vw-shadow-*` trio.
- **Extend item 4's registry-header rewrite** to tokens.ts (state the guard-
  vocabulary role, drop the dead "typed consumers" premise) and to
  `sanitized-types.test-d.ts` (fix the stale filename cite; consider a completeness
  guard over `registeredBlockTypes`).
- **New, policy**: when adding a guard, prefer rule-derived assertions over
  hand-rosters (the S5-OV6 lesson, item 9 above); when renaming a token family,
  grep the guard *tests* for the old prefix — two assertions rotted in `988e701`'s
  wake.
