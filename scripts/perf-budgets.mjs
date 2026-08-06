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
 * Runtime size budget (RUNTIME.md "Standing constraints"; amended 2026-07-10,
 * was 20/40 — reasoning in docs/DECISIONS.md "Runtime size budget amendment").
 * The runtime is student-facing and runs on school Chromebooks, where JS
 * parse/execute cost is the binding constraint. Heavy capability goes in lazy
 * kits on R2, never in these inlined bundles — that invariant, not this
 * number, is the non-negotiable part.
 *
 * NB: the renderer (and this pair of numbers) retires at S9 when published
 * pages die. Until then it is live and enforced.
 */
export const RUNTIME_SIZE_TARGET = 40 * 1024; // soft target — warn past this
export const RUNTIME_SIZE_CEILING = 60 * 1024; // hard ceiling — fail past this

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
 * Measured 2026-08-05: 168.1 KiB gz.
 */
export const SHELL_JS_GZ_KIB = 185;

/**
 * The student shell's CSS, gzipped — a SEPARATE row on purpose.
 *
 * One combined JS+CSS cap lets CSS growth hide under JS headroom (and the
 * reverse), so a Tailwind regression could double the stylesheet while the
 * combined number still passed. Two rows, two answers.
 *
 * Measured 2026-08-05: 11.3 KiB gz.
 */
export const SHELL_CSS_GZ_KIB = 14;

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
        maxGzKiB: 292,
        why: 'The editor. A student must never download this; it is the single biggest reason the S8 route split exists.',
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
 * machine). As of 2026-08-06 the perf lane has ZERO green CI runs (CI has been
 * red since the S8 push — see STATE), so all three stay null until five exist.
 * For reference, the lane recorded pre-auth at 862/867/900 ms on the red runs.
 */
export const TIMING_TARGET_MS = {
    [MARKS.preAuthInteractive]: null,
    [MARKS.worksheetInteractive]: null,
    [MARKS.mathRendered]: null,
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
