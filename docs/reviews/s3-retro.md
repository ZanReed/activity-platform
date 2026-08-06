# S3 retrospective — the viewer (reviewed 2026-08-06)

**Scope:** slice S3 of the components-as-data rewrite (2026-07-30/31: harness+fixtures
`70d2640`/`0db0748`, container `41feee7`, exemplars `598f263`, conformance factory
`744e222`, dev harness `ca436d6`, wire v2 `74fe7d2`, ungraded kit mode `61f24b3`,
derive step `0321036`, bindings split `a9aca2b`, StrictMode fix `c635204`, canvas
family `3064ba4`, remaining 16 `30067df`, styling `f305d7e`, route `673c12b`),
reviewed after S4–S8 completed and before S9. **Evidence base:** commit history, a
fresh-context consumer survey of every S3 contract (components, factory, wire, store
seam, blockIndex, BlockBoundary, read client, dev routes, stylesheet, ungraded mode,
bindings, fixtures — 1058 viewer tests run green during the survey), and the
DX-review promise ledger. Method per `s0-retro.md`. An independent audit pass is
expected to append below.

## Verdict in one line

S3's structural bets paid off almost completely — **one component tree serves
screen, teacher print, and foldable** (no parallel print components ever grew), the
conformance factory and frozen wire held without a weakened assertion, and S6
extended the store instead of replacing it; its paid costs were all
discovery-driven (the 21 MB bindings leak, the kit's required answer key, the
StrictMode race, the env-less boot bug); and its latent tax is **things S3 said
that are no longer true** — a "one cast" comment above 24 casts, a "this one is the
source" heuristic with a private server copy, a version constant that gated
nothing, a shortfall channel nothing consumes, and two review-time promises
(the DX boomerang, the real-browser a11y pass) that never fired.

## Costs already paid (lessons banked, no action needed)

1. **The bindings leak was found at 21 MB because the 2.8 MB step only printed.**
   Component bindings on registry entries dragged the component tree into the read
   bundle (888 KiB → 2.8 MB at V5, *missed* → 21 MB at V9, caught). The size print
   existed at V5; nothing asserted it. The fix (`a9aca2b`: `bindings.ts` split) came
   with the ceiling that should have existed first. Lesson: **a printed number
   nobody asserts is not a guard** — the s0-retro owns the consolidation mistake;
   S3 owns the un-gated print.
2. **The kit's question widgets required the answer key S2 strips** — 17 call sites
   scored client-side, so the server-authoritative viewer could not mount any graph
   block. Caught by the deliberately scheduled kit-backed exemplar (V9 milestone,
   an outside-voice finding) *before* graph-family mass production — at block #15
   it would have been expensive. Ruling A produced ungraded mode plus the sharper
   sub-finding: handle count and curve family are question *shape*, not answer, so
   `questionShape` was split out and graded mode ignores it (the two paths cannot
   disagree). Option C — serve a placeholder key — was rejected *and recorded* so
   nobody re-proposes the leak.
3. **The StrictMode shared-container race** blanked graph boards: two overlapping
   async mounts shared the canvas ref and the kit opens with `textContent = ''`,
   so whichever mount cleared last wiped the other's DOM. Fixed with per-mount
   child hosts + synchronous cleanup (`c635204`); learning logged.
4. **The env-less boot criterion (D10) failed its first test and exposed a real
   app bug**: `lib/supabase.ts` threw at module load and `SessionProvider` called
   `getSession()` on mount, so *any* missing env var blanked the entire app —
   including for a clean clone. Fixed (lazy Proxy client + `supabaseConfigured`
   guard). An acceptance criterion written as "boots env-less" earned its keep on
   day one.
5. **The type system caught a design gap cheaply**: `Problem` could not render an
   authored solution because the sanitizer strips it — which surfaced the rule that
   became S4-13 (a checked section returns solutions for *static* blocks too),
   settled before the grading RPC existed.
6. **A browser-only bug class, five instances in one slice**: vanished list markers
   (the app's CSS reset), the callout print-border guard firing on a real gap, the
   gap-bearing math block double-rendering (KaTeX cannot parse `\placeholder`), the
   `minHeight`-only canvas giving the kit no definite height, and a swallowed mount
   rejection. None visible to jsdom; all found in the scheduled browser passes.
   The pattern repeated in S6 (V7's two defects) — browser passes are where S3-class
   UI work gets verified, and the slices that scheduled them caught their bugs
   in-slice.

## Latent costs — what will bite future developers

7. **The duplicated lazy resolver is still live** — confirmed unfixed as of today
   despite the S0 audit promoting it to cheap-now on 2026-08-05: `ViewerContainer`
   and `ChildBlocks` each hold a module-level `lazyCache` Map with byte-equivalent
   resolve bodies, so a lazy type rendered both top-level and nested gets **two
   React.lazy identities** (a nested `math_block` mounts a different wrapper than a
   top-level one — the remount/state-loss case the cache comment says it prevents).
   Relatedly, `ViewerContainer.tsx:120`'s "The one cast" sits above a pattern
   repeated **22×** in `bindings.ts` plus twice more in the resolvers.
8. **The crashed-gradable shortfall channel is display-only.** D12's companion rule
   ("a crashed gradable block must be visible in the check path") is satisfied in
   the DOM banner — but `onCheckShortfall` has zero production consumers:
   `StudentViewer` passes neither `onCrash` nor `onCheckShortfall`, nothing logs a
   shortfall, and the S6 queue derives its items from `blockIndex` alone, so it
   cannot know a section was under-covered. The seam exists; the wire to anywhere
   does not.
9. **`VIEWER_STORE_SCHEMA_VERSION` gated nothing when it mattered.** S6 made a real
   breaking shape change (`pending`/`inFlight` added to the persisted blob) and the
   constant stayed at 1 — safety came from `hydrateViewerState`'s structural field
   checks instead. The version's only exercisers are two tests that synthesize a
   *future* version. D9 accepted this as "borderline YAGNI, kept with eyes open";
   the YAGNI half won, and the next developer will trust a constant that has never
   discriminated a real change.
10. **`blockIndex.ts:100`'s "two copies of a subtle heuristic drift; this one is
    the source" is false today.** S4's grading walk privately re-implements
    `looksLikeBlockArray`/`childBlocksOf` (`server/grading/walk.ts:154-179`,
    hedged "mirroring blockIndex's") — logically identical now, bonded by nothing.
    The S5.5 answer-key and S7 census walks *do* import the source; the grading
    walk is the copy that would silently drift.
11. **Two smaller drift traps**: the student e2e helper hard-codes
    `wireVersion: 2` (`studentSession.ts:269`) so a wire bump fails e2e with a
    confusing symptom instead of a clear one; and `fetchReleasedFeedback` is a
    placed seam with no consumer — every production implementation rejects or
    returns empty pending the teacher-grading follow-up (S4-3b cut). Correct, but
    a reader must learn it from `ShortAnswer.tsx`'s comment.
12. **Two review-time promises never fired — the S1 pattern's third and fourth
    instances.** The DX scorecard's boomerang ("run `/devex-review` after the
    first ~5 components") has no record of running; and the a11y carve-out ("jsdom
    attribute assertions only; real announcement/focus testing lands with the
    Playwright route pass, **pre-S8**") never landed — the student e2e specs use
    roles functionally but assert zero aria-live announcements, keyboard paths, or
    focus visibility. 6.1A's "CI-checked a11y baseline" is currently its jsdom
    half only, and S8 has come and gone.
13. **S3 is the only slice with no DECISIONS.md entry.** Its seventeen D-rulings,
    the ungraded-mode ruling, and the scorecard live solely in the gstack design
    doc outside the repo; the repo-resident rationale is the HISTORY narrative
    plus in-file comments. A future developer auditing "why is the store seam
    shaped like this" has nothing to check before re-deciding.
14. **The token guard has one unguarded neighbor**: `foldable/styles.ts` is a
    second, generated stylesheet with raw hex literals — deliberate (measure≡print
    needs one shared sheet) and scoped to panel chrome, but nothing enforces or
    even documents the exemption where the guard lives. And five of the seven dev
    routes (`DevCalculator`, `DevDataPlot`, `DevNumberLine`, `DevGraphQuestion`,
    `DevFoldableColumns`) have no e2e or smoke coverage — documented tools that
    can rot silently.

## Refactor watchlist

**Cheap now (before S9 locks things in):**

1. Deduplicate the lazy resolver into one module — carried forward from the S0
   audit's cheap-now list, still a live correctness gap (~30 min).
2. Give the shortfall channel one real consumer: `StudentViewer` passes
   `onCheckShortfall` into at least an error log + store flag, so an under-covered
   check is recordable, not just visible (~30 min).
3. Replace the e2e helper's `wireVersion: 2` literal with the `CHECK_WIRE_VERSION`
   import (~5 min).
4. Reconcile the walk-heuristic duplication: import
   `looksLikeBlockArray`/`childBlocksOf` from `blockIndex` in `grading/walk.ts`
   (same package, no bundle concern) or amend both comments to admit the copy
   (~20 min).
5. Write the missing DECISIONS.md S3 entry — a paragraph distilling D4/D9/D11/D12/
   D14/D16 + ruling A into the repo (~45 min).

**Opportunistic (next time someone's in the file):**

6. Make `VIEWER_STORE_SCHEMA_VERSION` honest: bump it on the next persisted-shape
   change, or demote its comment to name the structural checks as the real gate.
7. Extend the token guard to `foldable/styles.ts` or annotate the exemption in
   `styles.test.ts`.
8. Add a boot smoke for the five unverified dev routes, or cull stale ones at S9.

**Policy (decide deliberately, not by accident):**

9. **The a11y debt is standing, not deferred-by-default**: schedule the
   real-browser announcement/keyboard/focus pass before S9 — that is when students
   meet the surface, and 6.1A's "CI-checked" claim is half-true until then.
10. Review-time promises (boomerang reviews, deferred test passes) go on a tracked
    checklist with an owner-slice, not in prose — S1's wiring lesson has now
    recurred four times across two slices.
11. When a cast or exemption pattern repeats, the comment must say how many — "the
    one cast" above 24 normalizes unbounded growth.

## What held up (no apology needed)

**One component tree, three surfaces.** Teacher print, the student screen, and the
foldable all render the same 22 components through `ViewerContainer mode="print"`
— no parallel print component ever grew; the only print-specific rendering is a
61-line `printTwin` sub-element mounted by the three canvas blocks. Thirteen of 22
components are untouched since birth; every post-S3 modification was additive
print/grading need, not rework. **The conformance factory** generates 164 tests
today from a roster asserted to *be* the bound set, covers both binding tiers
(lazy components can't dodge their family contract), and has zero skipped or
weakened rules. **The frozen wire** was bumped exactly once — within S3 itself —
and S4 implemented against it with no changes; the mock stayed conformance-bonded
to the real engine (8-test suite pinning four invariants and the one deliberate
divergence). **The store seam** was extended, never replaced: S6's queue "OWNS NO
QUEUE" by design, and the 2.2A fire-time snapshot survived with a deliberate,
documented narrowing (it now powers the drift notice while queued checks grade
current values — the ruling, not an accident). **The read client** absorbed S6's
offline-boot and republish-pinning as branches of the same `load()` promise; the
stale-version retry stayed invisible to the route. **The token-only stylesheet**
is still the only viewer stylesheet, and its guard *grew* 11 → 22 assertions —
including the preview-mirrors-print pins added after a real bug, the guard-after-
burn pattern working as intended. **Dev-route gating** (per-route
`import.meta.env.DEV`) kept seven dev surfaces out of production. **`blockIndex`'s
exported heuristics** became load-bearing for S5.5's answer key and S7's census —
consumers S3 never anticipated. And the slice's hygiene is the repo's best: zero
TODO/HACK/FIXME across `blocks/`, `container/`, `check/`, `client/`, with every
"deliberately" attached to a reason.
