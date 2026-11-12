// =============================================================================
// scripts/perf-budgets.mjs — every size budget in this repo, with its reasoning
// -----------------------------------------------------------------------------
// S8 ruling D5 (option C): ONE home for every size number, so a budget bump is
// a one-file diff whose comment explains itself in review. Before this, ceilings
// lived inline in three bundler scripts; they were migrated here WITH their full
// rationale, because a number separated from its story is a number the next
// session either fears or bumps casually. The bundler scripts still print their
// own failure messages — only the numbers and their reasoning moved.
//
// A `node --test` pin (scripts/tests/perf-budgets.test.mjs) asserts the three
// migrated ceilings still equal their pre-migration values. That test exists
// because CI's bundle-drift guards check bundle STALENESS, not ceiling VALUES:
// a typo during this migration would silently loosen a deploy guard, and
// nothing else in the system would notice (S8 ruling D8).
//
// ZERO DEPENDENCIES, deliberately. Root scripts cannot import from packages/*
// under pnpm's strict node_modules (learned the hard way: a root script that
// imported @supabase/supabase-js died on ERR_MODULE_NOT_FOUND at first run).
// This file is plain ESM data with no imports at all.
// =============================================================================

// -----------------------------------------------------------------------------
// PART 1 — Edge Function bundle ceilings (migrated from the bundler scripts)
// -----------------------------------------------------------------------------

/**
 * Published-page runtime, inlined into every published activity.
 *
 * (RUNTIME_SIZE_TARGET / RUNTIME_SIZE_CEILING stood here until S9 Drop 4 —
 * the published-page runtime's 40/60 KiB pair, self-declared to retire "at S9
 * when published pages die". They did. The invariant they encoded lives on in
 * the surviving budgets: heavy capability stays in lazy chunks, never in the
 * always-parsed path.)
 */

/**
 * Read-API (get-activity) server bundle — client-code leak guard.
 *
 * The read API imports the registry for its sanitize specs. When component
 * BINDINGS lived on those registry entries, this bundle silently absorbed the
 * entire component tree: 888 KiB → 2.8 MB once the exemplars were bound, then
 * 21 MB once the graph binding pulled in JSXGraph and MathLive. A read API that
 * renders nothing was about to ship with a graphing engine inside it.
 *
 * Components now bind in registry/bindings.ts, which only client code imports.
 * SIZE is the guard, deliberately: substring-matching for 'react' or 'mathlive'
 * false-positives on the comments this deliberately-unminified bundle keeps,
 * while every real leak is enormous — the two above were 3x and 23x the
 * ceiling. Raise this only alongside a deliberate, explained growth in what the
 * read path legitimately needs.
 */
export const VIEWER_SERVER_MAX_KIB = 1500;

/**
 * Grading (check-activity) server bundle.
 *
 * This bundle legitimately carries the math engine, so it is BIGGER than the
 * read path's by design. The ceiling still matters for two reasons: cold start
 * is on the interactive path (a student is waiting on the Check button), and
 * the failure mode the read bundle already hit once — a client component tree
 * leaking in through a registry import and taking JSXGraph and MathLive with it
 * — applies here identically. That regression went 888 KiB → 2.8 MB → 21 MB
 * before anyone noticed, which is why size is the guard rather than
 * substring-matching: every real leak has been enormous, while substring checks
 * false-positive on the comments this deliberately-unminified bundle keeps.
 *
 * Raise this only alongside a deliberate, explained growth in what grading
 * needs. If it jumps by a multiple, something is importing a component.
 */
export const GRADING_SERVER_MAX_KIB = 4000;

// -----------------------------------------------------------------------------
// PART 2 — Built SPA budgets (new in S8)
// -----------------------------------------------------------------------------
// All values below were CALIBRATED against the first build after the S8 route
// split (2026-08-05), not guessed. Method: `pnpm --filter @activity/app build`,
// then read dist/.vite/manifest.json for the entry and gzip each artifact.
//
// Headroom policy: caps sit ~10% above the measured value. Tight enough that
// the regressions these exist to catch (an eagerly-imported graph kit, a
// widened precache glob, the editor rejoining the shell) fail immediately;
// loose enough that one legitimately-added eager block does not turn CI red on
// an unrelated PR. Re-measure and re-set when a deliberate change moves them —
// do not nudge a cap to make a red build green without saying why in the diff.

/** Where the built SPA lands, relative to the repo root. */
export const APP_DIST_DIR = 'packages/app/dist';

/**
 * The student shell — the entry chunk, gzipped.
 *
 * S8 ruling D4 makes the entry chunk exactly what a student downloads before
 * first paint: StudentViewer and Home are statically imported in App.tsx while
 * every teacher and dev route is lazy. So this number IS the student's
 * first-fetch cost on school Wi-Fi, not a proxy for it.
 *
 * CALIBRATION HONESTY (S8, outside-voice finding 7): ruling P1A sketched
 * "~≤150 KiB gz". The measured post-split reality is 168.1 KiB gz, and the
 * gap is not slack — it is react-dom + react-router + supabase-js + the
 * viewer's eager block tier + the two eager routes, which is what a live-API
 * student viewer costs. The cap below is therefore a REGRESSION PIN at the
 * real number, not a claim that the 150 target was met. Getting to 150 would
 * take deliberate work (a lighter auth client is the obvious lever) and is
 * recorded in TODOS.md rather than pretended away here.
 *
 * Measured 2026-08-05: 168.1 KiB gz (cap was 185).
 *
 * TIGHTENED 2026-08-18 — shell-slimming slice 1, ruling R6 (anti-fossil).
 * The lever the paragraph above predicted got pulled: supabase-js's realtime
 * and storage sub-clients are aliased to inert stubs (docs/design/
 * shell-slim-supabase.md), which took the shell from 177.6 to 156.4 KiB gz —
 * 21.2 KiB of code no student session ever executed. Leaving the cap at 185
 * over a 156 shell would have been 18% slack: a budget that has quietly
 * stopped protecting anything, which is precisely the fossil this file's own
 * "a budget that can only ever loosen is a fossil" line warns about. New cap
 * is the same ~10% headroom policy applied to the new measurement:
 * 156.4 × 1.1 ≈ 172.
 *
 * Measured 2026-08-22: 158.5 KiB gz.
 *
 * TIGHTENED AGAIN 2026-08-23 — shell-slimming rung 1 (the zod audit), ruling R6
 * once more. ⚠ **P1A's ~150 KiB target is MET**, so the paragraph above — "not a
 * claim that the 150 target was met", "getting to 150 would take deliberate
 * work" — is now history rather than status. It is left standing because it
 * records what was true when the pin was set, and because the lever it named
 * (a lighter auth client) is still the NEXT one, not this one.
 *
 * What moved: `tableBlankIds` left blocks/table.ts, and @activity/schema
 * declared `sideEffects: false`. Together — and ONLY together, each was
 * measured a no-op alone — zod left the entry chunk entirely:
 * **160.5 → 143.2 KiB gz, −17.3.** zod was never validation cost on the student
 * path (nothing there parses; readClient and documentCache both cast); it was
 * pure import cost. Design + measurements: docs/design/shell-slim-zod.md.
 *
 * New cap = the same ~10% policy on the new measurement: 143.2 × 1.1 ≈ 158.
 *
 * ⚠ AND THAT NUMBER IS A TRAP FOR A SKIMMER, so read it twice: 158 is almost
 * exactly the PRE-slice measurement recorded two lines up (158.5 on 08-22). The
 * cap did move — 172 → 158 — and it moved because the SHELL shrank to 143.2.
 * A cap that equals a former measurement is a coincidence of arithmetic here,
 * not a leftover.
 *
 * RUNG 2, 2026-10-04 — auth-js's never-executed modules (WebAuthn, web3, the
 * admin API) replaced by stubs: 156.48 → 151.82 KiB gz. The geometry slice had
 * spent the headroom above (143.2 → 156.4, figures and the glossary being
 * eager by ruling). ⚠ THE CAP DID NOT MOVE, and that is deliberate rather than
 * forgotten: the ~10% policy on 151.82 gives ≈ 167, which is ABOVE 158, and a
 * cap is never raised to follow a policy. 158 over 151.82 is 4% headroom (measured as built: 151.82) —
 * tighter than the policy, so not a fossil (R6). The working stop line for
 * eager additions stays 156.5 (Y7 ER-9; TODOS → "The student shell's size
 * ladder").
 *
 * RUNG 3, 2026-10-18 — the shell had drifted to 157.9 with no flag, and the
 * viewer render fix (audit #5) needed ~0.3 more. react-router's production
 * build for `vite build` (−0.5) and the signed-out landing + pending
 * onboarding made lazy from Home (−1.1): 157.9 → 156.3 KiB gz. Cap unchanged
 * (158); stop line unchanged (156.5).
 *
 * ⚖ THE STOP LINE IS RETIRED — author ruling 2026-10-18. The reopen reuse
 * (audit #9) took the shell to 156.6, 0.1 over 156.5, with no cheap rung left
 * (TODOS → the size ladder: what remains is React, auth-js's one client
 * class and the router). The author accepted it and moved the working limit
 * TO THE CAP: eager additions are now judged against 158 itself. That means
 * there is no early-warning margin any more — the next addition that crosses
 * 158 fails this budget outright, and the answer then is a rung (or a
 * deliberate cap ruling), never a quiet raise.
 *
 * ⚖ CAP RULING 158 → 158.5 — author, 2026-10-30. D65 slice 2 (targeted
 * practice between DoL tries) measured 158.063: the viewer's offer + DoL
 * state ~0.14 and the lazy /a/:id/practice/:versionId route ~0.12 (its lazy
 * declaration, the Route, and the chunk's preload list). A per-module byte
 * attribution of the entry found no cheap rung — what remains is first-paint
 * code (StudentViewer, ViewerContainer, registry, Home, JoinClass) plus the
 * libraries rung 3 already named. The rule is unchanged: the next addition
 * that crosses 158.5 gets a rung or another explicit ruling.
 *
 * ⚖ CAP RULING 158.5 → 158.6 — author, 2026-11-04. Period assembly's student
 * list (PA-5, PA-7) measured 158.533, 34 bytes over: the viewer's "← Today"
 * link is ~19 of them, and without it the build was still over at 158.514. No
 * rung found at this size; a rebuild's gzip noise is about the same. The rule
 * is unchanged: the next addition that crosses 158.6 gets a rung or a ruling.
 *
 * ⚖ CAP RULING 158.6 → 158.7 — author, 2026-11-12. The released-feedback fix
 * (a re-checked written answer no longer wears "Reviewed by your teacher"; the
 * store re-reads feedback after such a check) measured 158.621 under CI's
 * build env, 22 bytes over; main sat at 158.598, 2 bytes under, so any eager
 * change would have crossed. No rung searched at this size. Measure with CI's
 * env (`pnpm verify`): a build from .env.local reads ~47 bytes heavier. The
 * rule is unchanged: the next addition that crosses 158.7 gets a rung or a
 * ruling.
 *
 * ⚖ A FIXED CEILING — author ruling 2026-11-13 (docs/design/shell-size-review.md
 * D2, policy P-1). The +0.1 rulings above are OVER. Tier A of the review
 * (a11y prose out of the registry, functions-js stubbed, sideEffects on viewer
 * and graph-kit, no modulepreload polyfill) took the shell 162,470 → 159,049
 * bytes gz (158.66 → 155.32 KiB), and the cap stayed at 158.7: the ~3.3 KiB
 * between them is the ALLOWANCE that SHELL_SPEND below draws down. This number
 * no longer moves by ruling. Changing it takes a design pass that names what
 * the bytes buy and which reserve rung would undo it; a slice that would cross
 * it brings a rung from the reserve in the same slice (P-3; the reserve, ranked,
 * is §2 of the review: R6 figure engine, R5 Home + JoinClass, R7 rare blocks).
 * perf-budgets.test.mjs pins the value.
 */
export const SHELL_JS_GZ_KIB = 158.7;

/**
 * THE SPEND METER (review D3, policy P-2): the shell's EXACT gz bytes under
 * CI's build env, and the ledger that explains every byte since the anchor.
 *
 * check-perf-budget.mjs fails when the measured shell is more than
 * SHELL_SPEND_BAND_BYTES ABOVE the baseline ("record the spend") or more than
 * that BELOW it ("record the saving"; R6's anti-fossil rule, enforced). The fix
 * either way is one commit that adds a SHELL_SPEND row and moves
 * SHELL_JS_BASELINE_BYTES by the same amount. perf-budgets.test.mjs asserts
 * baseline = anchor + Σ spend, so the ledger cannot be skipped.
 *
 * Builds are deterministic per commit, so the band only has to absorb
 * legitimate tiny edits (a renamed variable, a reworded aria-label), not runner
 * noise. Measure under CI's env: `pnpm verify` builds with it. A build from
 * .env.local inlines a different Supabase URL and key, so the meter reports
 * itself n/a there rather than lying.
 *
 * A spend row is { date, change, bytes }: `bytes` is the signed delta in gz
 * bytes, `change` says what bought it (name the slice or design pass).
 */
export const SHELL_JS_ANCHOR = {
    date: '2026-11-13',
    bytes: 159049,
    note: 'shell-size review tier A (R1–R4) landed; ceiling fixed at 158.7',
};
export const SHELL_SPEND = [
    {
        date: '2026-11-13',
        change: 'R5: Home + JoinClass lazy, preloaded by URL from index.html and awaited before first render (reserve rung D7, pulled early by the author)',
        bytes: -4601,
    },
];
export const SHELL_JS_BASELINE_BYTES = 154448;
export const SHELL_SPEND_BAND_BYTES = 256;

/**
 * The student shell's CSS, gzipped — a SEPARATE row on purpose.
 *
 * One combined JS+CSS cap lets CSS growth hide under JS headroom (and the
 * reverse), so a Tailwind regression could double the stylesheet while the
 * combined number still passed. Two rows, two answers.
 *
 * Measured 2026-08-05: 11.3 KiB gz (cap set at 14).
 *
 * RAISED 14 -> 15 on 2026-08-23, at 13.13 KiB measured (6.6% headroom, under
 * the ~10% policy). Set from measurement + policy — slice 1's rule in reverse,
 * which tightened the JS cap 185 -> 172 the day it shrank the shell. 16 was
 * refused: ruling R6 calls 18% slack a fossil.
 *
 * THE FULL REASONING IS IN docs/DECISIONS.md -> "The shell CSS cap", including
 * the two things a future reader will otherwise re-derive: that the stylesheet
 * has no slim left (measured — 743 rules, 12 repeated bodies, zero editor CSS
 * in the student entry), and that lazily loading @media print (~2.05 KiB gz,
 * 15% of this row) was REFUSED because Ctrl+P bypasses PrintButton's readiness
 * barrier by design. Not restated here: one home per fact.
 *
 * RAISED 15 -> 16.5 on 2026-10-14 (author ruling D1), at 15.02 KiB measured
 * (9.9% headroom, inside the ~10% policy). The student review's S4/S6/S7/S8
 * went over by 21 bytes after trimming to the minimum, and the progress work
 * (S2/S5) adds more student-surface CSS. Reasoning in DECISIONS.md, same entry.
 *
 * TIGHTEN THIS AGAIN the moment anything shrinks it, in the same commit, the
 * way slice 1 did.
 */
export const SHELL_CSS_GZ_KIB = 16.5;

/**
 * Service-worker precache budgets (S8 ruling D10; TODO ruling D19).
 *
 * S6 ruling S6-11 restricted the precache to the navigation document and
 * nothing else: every asset filename is content-hashed and therefore immutable,
 * so CacheFirst at runtime gives the same offline result while downloading
 * exactly what the student actually opened. Nothing ENFORCED that ruling — one
 * careless `globPatterns` edit in vite.config.ts silently re-inflates every
 * student's first visit to multi-MB over school Wi-Fi, and nobody notices until
 * a classroom complains.
 *
 * Two rows because they catch different mistakes: the COUNT catches a widened
 * glob (today 1 entry; a recursive js glob would be ~200), and the BYTES catch
 * a few-entries-but-enormous precache (globbing just the entry chunk would be
 * one extra entry and ~600 KB).
 *
 * Bytes are summed from the dist files the manifest lists — never parsed out of
 * Workbox's own generated bookkeeping, which changes shape between versions.
 *
 * Measured 2026-08-05: 1 entry, 984 bytes.
 */
export const PRECACHE_MAX_ENTRIES = 3;
export const PRECACHE_MAX_BYTES = 100 * 1024;

/**
 * The heavy-chunk ledger — weight that must stay OUT of the student shell and
 * must not balloon where it lives.
 *
 * MATCHED BY CONTENT, NOT FILENAME (S8, outside-voice finding 4). Rollup names
 * chunks after facade modules, so a refactor can rename, merge, or split them;
 * a filename-prefix row would then either match nothing (loud, fine) or — much
 * worse — keep matching a chunk after the weight it was pinning moved somewhere
 * else, silently measuring the wrong thing. Each row instead identifies its
 * payload by a marker only that library's own code contains, and sums EVERY
 * chunk that matches. If ProseMirror weight shifts between two chunks, the sum
 * is unchanged and the row keeps its meaning.
 *
 * Markers are matched against source with asset-path string literals stripped
 * first (see stripAssetSpecifiers) — otherwise every chunk "contains mathlive"
 * because the module-preload map lists `assets/mathlive.min-<hash>.js`.
 *
 * Measured 2026-08-05 (summed gz): katex 75.2 · mathlive 264.0 ·
 * jsxgraph 239.1 · prosemirror 265.2 (two chunks).
 *
 * prosemirror RE-MEASURED 2026-08-21: 265.9 → 281.1 when the table block
 * adopted @tiptap/extension-table (+15.2 for the kit plus this slice's own
 * nodes). The cap did NOT move, and that was a ruling rather than an oversight:
 * docs/design/table-block.md's R6 gated adoption on this measurement and
 * pre-committed what to do with the answer — under ~10 KiB of remaining
 * headroom, either raise the cap deliberately or split tables into a
 * lazily-registered chunk.
 *
 * 10.9 KiB survives, so neither fired — but it is a HAIR over the line, and
 * this row has never run this close before. Two things follow. The @tiptap/*
 * family must be bumped together (CLAUDE.md), so the next family bump is the
 * one to measure BEFORE, not after. And the next editor feature that reaches
 * for a ProseMirror plugin should expect to spend the remaining margin, at
 * which point the lazy-chunk branch of R6 is the answer that was already
 * chosen — it does not need re-deciding, only doing.
 *
 * ⚠ RE-MEASURED 2026-11-12: 291.7 of 292 (0.3 KiB left). The tables GUI
 * amendment's toolbar crossed the cap (292.3) and was moved into its own lazy
 * chunk (TableToolbar.tsx) to come back under — the R6 branch, applied to the
 * new code only. Every editor/* module rides this row (the editor chunk
 * contains the `.ProseMirror` marker), so the NEXT editor feature will cross
 * it. That feature's design pass decides between lazy-loading its own UI the
 * same way and raising this cap with a written reason; it is not a surprise.
 *
 * ⚖ RETIRED AS THE EDITOR'S GROWTH GATE — shell-size review T6, ruled
 * 2026-11-13. The paragraph above is history. This row summed every chunk
 * holding the ProseMirror marker, the editor's own app code included, so
 * every editor feature crossed it. The editor is now gated by
 * TEACHER_JOURNEYS → `journey: editor` (what a teacher downloads to open it,
 * cap ~10% over measurement), and this row goes back to its first job:
 * proving the marker is LIVE, which the shell pin (`shell is free of
 * prosemirror`) and every journey's `forbid: ['prosemirror']` depend on.
 * Measured 2026-11-13 after T2/T3: 253.1 (it was 291.7). The cap is set LOOSE
 * on purpose (320, ~26% over) and is exempt from the ~10% anti-fossil rule,
 * because tightening it would recreate the gate T6 retired. It should fire only
 * on a vendor-sized jump (a second copy of ProseMirror, a Tiptap family bump
 * that doubles it). An editor feature that crosses it while `journey: editor`
 * passes raises this cap; it does not slim the feature.
 */
export const CHUNK_LEDGER = [
    {
        name: 'katex',
        // KaTeX's own error type and DOM builder — never a filename.
        marker: /KaTeX parse error|katexHtmlToDom/,
        maxGzKiB: 85,
        why: 'Math typesetting. Lazy per ruling D14; eager-loading it is the open S8/T7 question.',
    },
    {
        name: 'mathlive',
        marker: /MathfieldElement/,
        maxGzKiB: 290,
        why: 'The math INPUT field. Reaches published pages only inside the lazily-summoned graph kit (never the base runtime), and the grading server must never see it at all.',
        // ⚠ HEADROOM RULED, not overlooked (author, 2026-09-02): the wishlist
        // arc moved this row 231.4 → 282.1 gz (the transform_curve equation
        // field pulled a second MathLive entry path into the kit chunks) and
        // the 2026-09-02 drift audit flagged the ~3% headroom. The author's
        // call: HOLD the cap at 290 — the raise-vs-slim decision is made by
        // the first feature that would actually cross it, with this comment as
        // the tripwire's context. An audit re-reading ~97% here is reading a
        // recorded decision, not discovering a new risk.
    },
    {
        name: 'jsxgraph',
        marker: /JXG\.|JSXGraph/,
        maxGzKiB: 265,
        why: 'The graphing board. Lazy by ruling D16 (eager statics, lazy heavies) — a graph-bearing page pays for it, every other page does not.',
    },
    {
        name: 'prosemirror',
        marker: /ReplaceError|ProseMirror/,
        maxGzKiB: 320,
        why: 'The editor. A student must never download this; it is the single biggest reason the S8 route split exists. NOT the editor growth gate since T6 (journey: editor is); loose on purpose, see the note above.',
    },
    {
        name: 'zod',
        // The CLASS NAME, assigned as a STRING LITERAL (`this.name="ZodError"`),
        // so it survives minification — minifiers rewrite identifiers, never
        // string contents. NOT the package name: a bare /zod/i already matches a
        // chunk with no zod in it, because our own serialize.ts logs "failed Zod
        // validation" and that warning rides ImagePopoverHost. That is the
        // MARKERS-FROM-INTERNALS trap below, armed by our own prose.
        marker: /ZodError/,
        maxGzKiB: 18,
        // ⚠ HOW TO MUTATION-TEST THIS ROW, because the obvious way is VACUOUS
        // and was measured so on 2026-08-23. Adding an UNREFERENCED
        // `import { ActivityDocument } from '@activity/schema'` to a shell file
        // leaves the row GREEN — `sideEffects: false` lets rollup drop the
        // import outright, so nothing enters the bundle and the "mutation"
        // proves nothing. The import must be USED (call `.safeParse` on
        // something) before the row goes red. A guard verified the lazy way
        // here would be a guard that has never been seen to fire.
        why: 'Schema validation. It belongs to the EDITOR — serialize, publish, import and the print preview all parse; the student path parses nothing (readClient and documentCache both cast). It sat in the student shell until 2026-08-23 because one value import in block-predicates.ts reached a module that builds zod schemas at load time. This row caps it where it actually lives and, via SHELL_FORBIDDEN_MARKERS below, asserts it never comes back. See docs/design/shell-slim-zod.md.',
    },
    {
        name: 'mathjs',
        // typed-function's own error strings (mathjs's dispatch layer); no app
        // or package source says either.
        marker: /No signatures provided|Too many arguments in function/,
        // Measured 2026-11-13: 43.3 KiB gz, one chunk (graph-kit's evaluate).
        maxGzKiB: 48,
        why: 'The expression evaluator behind graph-kit scorers and seeded answers. Lazy everywhere a student or dashboard does not evaluate; the teacher dashboards load it only to seed one student (shell-size review T4).',
    },
];

/**
 * Markers that must NOT appear in the student shell.
 *
 * The complement of the ledger: the ledger caps each heavy payload where it
 * lives, and this asserts none of them lives in the entry chunk. Together they
 * are the enforcement of ruling D16 — a block moved from the lazy tier to the
 * eager tier fails HERE, loudly, at the moment it lands.
 */
export const SHELL_FORBIDDEN_MARKERS = CHUNK_LEDGER.map(({ name, marker }) => ({
    name,
    marker,
}));

/**
 * Payloads that must be absent from the ENTIRE BUILD, not merely the shell.
 *
 * A THIRD STRUCTURE, and it needs to be (2026-08-18, shell-slimming slice 1,
 * outside-voice finding OV-8). The two above cannot express this:
 *   * CHUNK_LEDGER FAILS a row that matches no chunk — by design, because a
 *     ledger row exists to cap a payload that is supposed to be there. Adding
 *     "realtime-js" as a ledger row would fail the moment the slice succeeded.
 *   * SHELL_FORBIDDEN_MARKERS only looks at the entry chunk, so it would keep
 *     passing if the stub were dropped and storage-js reappeared inside the
 *     lazy image-popover chunk instead.
 * These libraries are gone from the app ENTIRELY — @supabase/realtime-js and
 * @supabase/storage-js resolve to inert stubs via resolve.alias in
 * packages/app/vite.config.ts, and phoenix and iceberg-js were only ever their
 * transitive dependencies. So the assertion is: zero chunks, anywhere.
 *
 * MARKERS COME FROM LIBRARY INTERNALS, NEVER PACKAGE NAMES — the trap this row
 * set is built to avoid. The SURVIVING supabase-js code legitimately contains
 * the string literals 'realtime/v1', 'storage/v1' and `.channel(`, and the
 * app's own uploadImage.ts sends an 'x-upsert' header; every one of those
 * would make an absence row cry wolf forever. Each marker below was verified
 * PRESENT in a pre-slice build (2026-08-18, alias removed, rebuilt, grepped:
 * every one matched exactly one chunk) and ABSENT after — a row that has never
 * been seen to match is a row that proves nothing.
 *
 * ⚠ AND THE HONEST CAVEAT: an absence row cannot self-verify the way a ledger
 * row can. If the alias silently vanished AND the marker rotted, this would go
 * on passing. The alias's existence is therefore pinned separately, by
 * scripts/tests/supabase-stub-pin.test.mjs — read the two together.
 */
export const ABSENT_FROM_BUILD = [
    {
        name: '@supabase/realtime-js',
        // Two of realtime-js's own error/log strings. Not 'realtime/v1' — that
        // literal lives in SupabaseClient, which stays.
        marker: /API key is required to connect to Realtime|Newly joined presences/,
        why: 'Websocket client for a feature with zero call sites. Stubbed by resolve.alias; un-stub at the realtime-push backlog arc.',
    },
    {
        name: '@supabase/phoenix',
        // Phoenix wire message names — nothing else in the world says these.
        marker: /phx_ref_prev|phx_join/,
        why: "realtime-js's only dependency. It leaves when realtime-js leaves; this row proves it actually did.",
    },
    {
        name: '@supabase/storage-js',
        // A private method name and an error class name, both preserved
        // through minification (property names are not mangled).
        marker: /_removeEmptyFolders|StorageUnknownError/,
        why: 'The app talks to Storage with two raw fetch calls in lib/uploadImage.ts instead. Stubbed by resolve.alias.',
    },
    {
        name: '@supabase/functions-js',
        // The relay-error header name and its error message; neither is in
        // the stub or in lib/edgeFunctions.ts (which shares forceFunctionRegion,
        // so that string would match a correct build).
        marker: /x-relay-error|Relay Error invoking the Edge Function/,
        why: 'Zero call sites: Edge Functions are called with plain fetch through lib/edgeFunctions.ts (functions.invoke sends x-region, which CORS refuses). Stubbed by resolve.alias (shell-size review R2).',
    },
    {
        name: 'yjs (via @tiptap/y-tiptap)',
        // Two of yjs's own error strings; the stub carries neither.
        marker: /Yjs was already imported|Unexpected content type/,
        why: 'No live co-editing: extension-drag-handle reaches y-tiptap only when a y-sync plugin exists, and none is installed. Stubbed by resolve.alias (shell-size review TR3); ~31 KiB gz of the editor.',
    },
    {
        name: 'iceberg-js',
        marker: /X-Iceberg-Access-Delegation|CommitStateUnknownException/,
        why: "storage-js's dependency — an Apache Iceberg client, on a path that uploads PNGs.",
    },
    // Rung 2 (2026-10-04): auth-js's never-executed modules, replaced by the
    // activity:auth-js-dead-modules plugin. Each marker is a string that lives
    // ONLY in the replaced file — GoTrueClient keeps its own WebAuthn and web3
    // wording ('Browser does not support WebAuthn', 'window.ethereum'), so
    // those would match a correct build.
    {
        name: '@supabase/auth-js lib/webauthn',
        marker: /Cancelling existing WebAuthn API call|rpId is required for WebAuthn/,
        why: 'The passkey ceremony. The app signs in with Google OAuth only.',
    },
    {
        name: '@supabase/auth-js lib/web3/ethereum',
        marker: /Invalid SIWE message field/,
        why: 'Sign-in with a crypto wallet. No call site.',
    },
    {
        name: '@supabase/auth-js GoTrueAdminApi',
        marker: /\/admin\/generate_link|\/admin\/users/,
        why: 'The service-role admin API. A browser must never hold the key it needs; the stub keeps signOut, which ordinary sign-out routes through.',
    },    // Shell-slimming rung 3 (2026-10-18): react-router's DEVELOPMENT build.
    // Its exports send every bundler to dist/development; the
    // activity:react-router-production plugin points `vite build` at the
    // identical dist/production twin (ENABLE_DEV_WARNINGS false). The marker
    // is a dev-only warning string: present in every chunk build of the
    // development build, dead code (and so gone) in the production one.
    // Mutation-tested by making the plugin pass 'react-router' through (a
    // build that still typechecks — deleting the plugin call fails tsc first
    // and measures the OLD dist): the row went red, shell 156.3 → 156.8.
    {
        name: "react-router's development build",
        marker: /You can provide a way better UX than this/,
        why: 'Dev-only warnings and the default error screen hint, ~0.5 KiB gz in the student shell. The activity:react-router-production plugin in vite.config.ts selects the production build.',
    },
];

/**
 * Modules moved OUT of the student shell into lazy chunks (rung 3, 2026-10-18).
 *
 * Two checks per row, both required: the marker is ABSENT from the entry chunk
 * (a stray static import pulled it back), and PRESENT in some other chunk — so
 * a marker that rotted (the string was renamed) fails loudly instead of
 * passing forever. Markers are strings from the component's own markup: the
 * copy it renders lives in lib/authMessages.ts, which stays in the shell.
 */
export const SHELL_EVICTED = [
    {
        name: 'the signed-out landing (SignedOutLanding)',
        marker: /landing-code/,
        why: 'A signed-in student on the way to a worksheet never sees it; Home loads it lazily.',
    },
    {
        name: 'pending-account onboarding (PendingOnboarding)',
        marker: /data-onboarding/,
        why: 'Only a brand-new account with no role sees it; Home loads it lazily.',
    },
    // Shell-size review R5 (2026-11-13): the two routes besides the worksheet
    // that a student lands on. Lazy, and preloaded by URL from index.html
    // (vite.config.ts → activity:route-preload; the preload rows below pin it).
    {
        name: 'the Home route (Home.tsx)',
        marker: /data-list-loading/,
        why: 'A worksheet link never shows Home. A visit to / preloads it beside the entry.',
    },
    {
        name: 'the join route (JoinClass.tsx)',
        marker: /You're joining a class/,
        why: 'Only a join link shows it. A visit to /join/… preloads it beside the entry.',
    },
];

/**
 * TEACHER JOURNEYS — what each teacher route downloads beyond the shell
 * (shell-size review §8, rulings T1 + T5, 2026-11-13).
 *
 * The teacher problem is not creep but LEAKS: one static import across a
 * feature line drags a heavy library into a route that never runs it. The
 * review found every big teacher cost had that shape: the Bank imported
 * lib/serialize.ts for one guide helper (MathLive and mathjs came with it,
 * 301 KiB gz) and the print page imported its settings form from
 * ActivityConfigDrawer.tsx (the drawer's editors came with it, 684 KiB gz).
 *
 * A journey = the route's chunk plus its STATIC import closure from
 * dist/.vite/manifest.json, minus the chunks the shell already loaded. Each
 * row has two guards:
 *   - `maxGzKiB`, deliberately COARSE (~10% over the 2026-11-13 measurement):
 *     teachers are on staff devices with a warm cache, and the editor moves
 *     most days, so this is no byte meter (ruling T9). It catches a library
 *     joining a route, not a feature growing.
 *   - `forbid`, the rows doing the real work: CHUNK_LEDGER names whose code
 *     must not be anywhere in the journey. A ledger marker is live by
 *     construction (its ledger row fails when the marker matches nothing), so
 *     an absence here cannot rot into a vacuous pass.
 *   - `lazyOut` (optional): app modules made lazy for this journey, each
 *     checked like SHELL_EVICTED: ABSENT from the journey and PRESENT in some
 *     other chunk, so a renamed marker fails instead of passing forever. For
 *     cuts too small for the coarse cap to notice (the import dialog's 40 KiB
 *     is inside the editor's 10%).
 * `route` is the manifest key (relative to packages/app); a renamed route
 * fails as a vacuity error rather than silently dropping its row.
 *
 * Measured 2026-11-13, CI env, after T1: editor 761.8, print 78.0,
 * progress 80.0, responses 79.0, activities 43.9, classes 8.2, bank 5.3.
 * T2 (y-tiptap stubbed) + T3 (import dialog lazy), same day: editor
 * 761.8 → 690.4, and its cap tightened 840 → 760 in that commit.
 * T4 (seeding loaded on demand), same day: responses 79.0 → 33.8, progress
 * 80.0 → 34.9 (caps 87/88 → 37/38), answer panel row added.
 */
export const TEACHER_JOURNEYS = [
    // Two STUDENT rows ride this list since R5 (2026-11-13): Home and JoinClass
    // left the shell, so what a visit to / or /join/… costs beyond the entry is
    // now a journey like any other. Measured 6.5 and 5.2 KiB gz.
    {
        name: 'home (student landing)',
        route: 'src/routes/Home.tsx',
        maxGzKiB: 8,
        forbid: ['prosemirror', 'mathlive', 'mathjs', 'katex'],
        why: 'The signed-in landing for students and teachers. Preloaded by URL from index.html; must stay a list, never a heavy library.',
    },
    {
        name: 'join (student)',
        route: 'src/routes/JoinClass.tsx',
        maxGzKiB: 7,
        forbid: ['prosemirror', 'mathlive', 'mathjs', 'katex'],
        why: 'A join link: one form. Preloaded by URL from index.html.',
    },
    {
        name: 'editor',
        route: 'src/routes/ActivityEditor.tsx',
        maxGzKiB: 760,
        forbid: [],
        lazyOut: [
            {
                name: 'the markdown import dialog',
                // Its title id; the dialog's own markup, nowhere else.
                marker: /import-md-title/,
                why: 'TR4: the importer + AI prompt text load when the dialog opens (the Import button warms them on hover/focus).',
            },
        ],
        why: 'The editor legitimately carries Tiptap, MathLive, KaTeX and mathjs. Its cap catches a NEW library, not a new feature.',
    },
    {
        name: 'print',
        route: 'src/routes/ActivityPrint.tsx',
        maxGzKiB: 86,
        forbid: ['prosemirror', 'mathlive'],
        why: 'Print renders through the viewer. Its settings form lives in components/PrintSettingsBody.tsx so the drawer (and its editors) stays out (TR2).',
    },
    {
        name: 'bank',
        route: 'src/routes/Bank.tsx',
        maxGzKiB: 7,
        forbid: ['prosemirror', 'mathlive'],
        why: 'The Bank list is cards and filters. The guide panel loads serialize.ts and the guide editor lazily (TR1).',
    },
    {
        name: 'activities',
        route: 'src/routes/Activities.tsx',
        maxGzKiB: 48,
        forbid: ['prosemirror', 'mathlive'],
        why: 'A teacher landing page: a list, no editor.',
    },
    {
        name: 'classes',
        route: 'src/routes/Classes.tsx',
        // 10 → 12.5 on 2026-11-13 (R5): TeacherNav and the class helpers it
        // shares with Home left the shell when Home went lazy, so Classes now
        // fetches them itself (8.2 → 11.1). A cost moved, not a leak.
        maxGzKiB: 12.5,
        forbid: ['prosemirror', 'mathlive'],
        why: 'A list of classes, no editor.',
    },
    {
        name: 'responses',
        route: 'src/routes/ActivityResponses.tsx',
        maxGzKiB: 37,
        forbid: ['prosemirror', 'mathlive', 'mathjs'],
        why: 'A dashboard of the whole class: it never seeds (studentId null), so it must not reach the evaluator (T4) or the editor.',
    },
    {
        name: 'progress',
        route: 'src/routes/ActivityProgress.tsx',
        maxGzKiB: 38,
        forbid: ['prosemirror', 'mathlive', 'mathjs'],
        why: 'A dashboard, as for responses.',
    },
    {
        name: 'answer panel',
        route: 'src/progress/AnswerPanel.tsx',
        maxGzKiB: 33,
        forbid: ['prosemirror', 'mathlive', 'mathjs'],
        why: "One student's answers. It seeds, but loads the seeding code (and mathjs) only when the activity has seed variables or a DoL section (T4-2), via loadSeeding() in lib/answerText.ts.",
    },
];

/**
 * Strip string literals that merely NAME another chunk, so content matching
 * cannot false-positive on them.
 *
 * Vite writes a module-preload map and dynamic `import("./katex-<hash>.js")`
 * calls into the entry chunk. A naive substring search for "katex" or
 * "mathlive" therefore reports a hit on a chunk that contains no such code —
 * which would make the shell pin fail on a correct build and, worse, teach
 * everyone that the pin cries wolf. Verified against the real 2026-08-05 build:
 * every "PRESENT" marker in the entry chunk was one of these specifiers.
 */
export function stripAssetSpecifiers(source) {
    return source
        .replace(
            /["'`][^"'`]{0,120}?assets\/[A-Za-z0-9._-]+\.(?:js|css)[^"'`]{0,20}?["'`]/g,
            '""',
        )
        .replace(/["'`]\.{0,2}\/[A-Za-z0-9._-]+\.(?:js|css)["'`]/g, '""');
}

// -----------------------------------------------------------------------------
// PART 3 — Throttled lab-run timing (S8 rulings D2 / D3 / R1 / R3)
// -----------------------------------------------------------------------------

/**
 * The performance marks the viewer stamps. THIS IS A CONTRACT (ruling R2).
 *
 * These names are keyed on by the perf lane, by the committed measurement
 * history, and (post-S9) by any field measurement on real Chromebooks. Treat
 * them exactly like the runtime's data-attribute contract: ADD new marks
 * freely, never rename or remove an existing one. A rename silently breaks
 * every historical comparison — the numbers keep flowing, they just stop
 * meaning the same thing, which is worse than an outage.
 */
export const MARKS = {
    /** A signed-out student can act on the pre-auth screen (ruling 3.2A). */
    preAuthInteractive: 'student-interactive:pre-auth',
    /** A signed-in student can answer the first section of the worksheet. */
    worksheetInteractive: 'student-interactive:worksheet',
    /** Math in the served document has finished typesetting (feeds T7). */
    mathRendered: 'student-interactive:math-rendered',
};

/**
 * Chromebook-class throttling for the lab run.
 *
 * A school Chromebook is CPU-bound far more than it is bandwidth-bound, which
 * is why the CPU multiplier matters more than the megabits here. These are a
 * deliberate, documented approximation — the point is a STABLE relative
 * baseline that catches regressions, not a claim to reproduce any specific
 * device. Real-device numbers are a separate, compliance-gated exercise
 * (TODOS.md → field measurement).
 */
export const THROTTLE = {
    cpuSlowdownMultiplier: 4,
    downloadKbps: 5 * 1024,
    uploadKbps: 1.5 * 1024,
    latencyMs: 150,
};

/**
 * The calibrated timing target, in milliseconds, per mark.
 *
 * null = NOT YET CALIBRATED. The perf lane records the number every run
 * regardless; these get set from a real run and then serve as the baseline the
 * delta warning compares against (ruling R3 — deltas compare against THIS
 * committed number, never against a previous CI artifact, because artifacts
 * expire and a comparison that silently stops working is worse than none).
 */
/*
 * CALIBRATION RULE (eng-review 2026-08-06, amending "from a real run"): each
 * target is the MEDIAN OF ≥5 green CI runs of the perf lane — never a single
 * run (one shared-runner sample inside known runner variance would make the
 * derived 2x ceiling flaky), and never a local darwin number (different
 * machine). ARMED 2026-08-09 per the A3 amendment; RECALIBRATED 2026-08-14
 * per the gate-9/D-12 post-cutover re-measure the rule itself names: medians
 * of the five green post-cutover CI runs in STATE's ledger (31791526509,
 * 31795715961, 31796358508, 31803968894, 31805589675 — pre-auth
 * 1024/944/1009/992/969, worksheet 1163/1089/1144/1135/1096, math
 * 1844/1807/1812/1844/1792). The shift from the armed values (969/1118/1828)
 * is under ±2.5% on every mark — scatter, not a regression; the S9 content
 * surface's 1.0 KiB entry cost did not move the timing floor. Prior ledger
 * (2026-08-07/09 runs) archived in HISTORY. Local darwin numbers were never
 * used (a Mac number in a Linux gate would be dishonest). Recalibrate by the
 * same rule: median of ≥5 green runs.
 */
export const TIMING_TARGET_MS = {
    [MARKS.preAuthInteractive]: 992,
    [MARKS.worksheetInteractive]: 1135,
    [MARKS.mathRendered]: 1812,
};

/**
 * How much slower than target is a HARD failure (ruling D3 + R1).
 *
 * Sizes are the iron gates: identical on every machine, so a red is always
 * real. Timing wobbles with shared-runner load, and a gate that cries wolf
 * gets re-run until green — which trains everyone to ignore the gate that
 * matters. So timing hard-fails only at this generous multiple, which runner
 * variance cannot plausibly reach but the catastrophic case (someone makes the
 * graph kit eager) blows straight through.
 *
 * The ceiling is DERIVED, never written down as a second number (ruling R1):
 * recalibrating means editing the target above, and the ceiling follows.
 * RECALIBRATE: after the S9 cutover, after any deliberate shell perf work, and
 * at drift-audit cadence. A budget that can only ever loosen is a fossil.
 */
export const TIMING_CEILING_MULTIPLE = 2;

/** Derived hard ceiling for a mark, or null when the mark is uncalibrated. */
export function timingCeilingMs(mark) {
    const target = TIMING_TARGET_MS[mark];
    return target == null ? null : target * TIMING_CEILING_MULTIPLE;
}
