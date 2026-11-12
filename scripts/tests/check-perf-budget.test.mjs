// =============================================================================
// scripts/tests/check-perf-budget.test.mjs — the failure paths, actually fired
// -----------------------------------------------------------------------------
// Run: `node --test scripts/tests/`
//
// A budget gate is only worth its CI minutes if its RED path works. Against a
// healthy build every branch here is unreachable: dist exists, the manifest is
// there, every ledger row matches, nothing is over cap. So this suite builds
// synthetic dist trees — deliberately broken in one specific way each — and
// asserts the script exits non-zero with a message that names the problem.
//
// The vacuity cases are the reason this file exists. This repo has shipped
// vacuously-green checks twice (the empty-activity leak scan; verify-0022's C1
// pointing at rows that were later deleted, so its RESTRICT assertion had
// nothing to block). A perf budget is unusually prone to the same failure:
// delete dist/ and the naive implementation reports zero bytes and passes.
// Each `exits non-zero` assertion below is one of those escapes closed.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { randomBytes } from 'node:crypto';
import { SHELL_SPEND_BAND_BYTES, TEACHER_JOURNEYS } from '../perf-budgets.mjs';

/**
 * Filler that gzip genuinely cannot shrink.
 *
 * The obvious `String.fromCharCode(33 + i * k % 90)` trick looks random and is
 * not: it cycles every 90 characters, so gzip compresses 400 KB of it to
 * almost nothing and every "over cap" fixture silently lands UNDER the cap —
 * the test then passes for the wrong reason or fails confusingly. Random bytes
 * in base64 are incompressible by construction.
 *
 * @param {number} approxGzKiB roughly how many KiB the result should gzip to
 */
function incompressible(approxGzKiB) {
    // base64 inflates by 4/3 and gzip claws back ~25% of that, so the byte
    // count and the gz size end up in the same ballpark.
    return randomBytes(approxGzKiB * 1024).toString('base64');
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = resolve(__dirname, '..', 'check-perf-budget.mjs');

/**
 * Run the budget script against a fixture dist.
 * @returns {{code:number, out:string}}
 */
function runBudget(distPath, extraEnv = {}) {
    try {
        const out = execFileSync('node', [SCRIPT], {
            env: { ...process.env, PERF_BUDGET_DIST: distPath, ...extraEnv },
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        return { code: 0, out };
    } catch (err) {
        return {
            code: err.status ?? 1,
            out: `${err.stdout ?? ''}${err.stderr ?? ''}`,
        };
    }
}

/**
 * Build a minimal dist tree that PASSES every budget, then let each test break
 * exactly one thing. Starting from green is what makes each failure
 * attributable to the single mutation under test.
 */
function makeHealthyDist(overrides = {}) {
    const dir = mkdtempSync(join(tmpdir(), 'perf-budget-'));
    mkdirSync(join(dir, 'assets'), { recursive: true });
    mkdirSync(join(dir, '.vite'), { recursive: true });

    const entryFile = overrides.entryFile ?? 'assets/index-fixture.js';
    const entryBody =
        overrides.entryBody ??
        // Realistic shape: the entry NAMES the lazy chunks (module-preload map
        // + a dynamic import) without containing their code. A correct script
        // must read this as clean.
        '["assets/katex-fixture.js","assets/mathlive-fixture.js"];' +
            'import("./katex-fixture.js");const app=1;';
    writeFileSync(join(dir, entryFile), entryBody);
    writeFileSync(join(dir, 'assets/index-fixture.css'), 'body{color:red}');

    // One chunk per ledger row, each carrying its library's real marker.
    const chunks = overrides.chunks ?? {
        'assets/katex-fixture.js': 'throw new ParseError("KaTeX parse error: x")',
        'assets/mathlive-fixture.js': 'class MathfieldElement extends HTMLElement{}',
        'assets/jsx-fixture.js': 'JXG.Board = function(){}',
        'assets/pm-fixture.js': 'class ReplaceError extends Error{}',
        // One per ledger row — and that is enforced, not merely tidy: a ledger
        // row matching NO chunk is a failure by design (a row exists to cap a
        // payload that is supposed to be there), so adding a row without adding
        // its fixture chunk turns this whole file red. That is the row's
        // self-verification working; it is why zod got a ledger row rather than
        // a bare shell-absence row (docs/design/shell-slim-zod.md).
        // The marker is the minified SHAPE: zod assigns the class name as a
        // string literal, which is what survives minification.
        'assets/zod-fixture.js': 'class E extends Error{constructor(){this.name="ZodError"}}',
        'assets/mathjs-fixture.js': 'throw new TypeError("No signatures provided")',
        // The two screens rung 3 moved out of the shell (SHELL_EVICTED): each
        // must be found in SOME non-entry chunk, or its row reports a rotted marker.
        'assets/SignedOutLanding-fixture.js': 'h("input",{id:"landing-code"})',
        'assets/PendingOnboarding-fixture.js': 'h("div",{"data-onboarding":v})',
        // A journey's lazyOut module (TEACHER_JOURNEYS): present, not imported.
        'assets/ImportMarkdownDialog-fixture.js': 'h("h2",{id:"import-md-title"})',
        // The two routes R5 moved out of the shell (SHELL_EVICTED).
        'assets/Home-evicted-fixture.js': 'h("p",{"data-list-loading":!0})',
        'assets/JoinClass-evicted-fixture.js': 'h("p",null,"You\'re joining a class")',
    };
    for (const [file, body] of Object.entries(chunks)) {
        writeFileSync(join(dir, file), body);
    }

    // One small route chunk per teacher journey, so every journey row has
    // something real to measure (a missing route is a vacuity failure).
    const journeyManifest = {};
    for (const j of TEACHER_JOURNEYS) {
        const file = `assets/journey-${j.name}-fixture.js`;
        if (!(file in chunks)) writeFileSync(join(dir, file), `const ${j.name}Route=1;`);
        journeyManifest[j.route] = { file, isDynamicEntry: true, imports: ['index.html'] };
    }
    writeFileSync(
        join(dir, '.vite/manifest.json'),
        JSON.stringify(
            overrides.manifest ?? {
                'index.html': {
                    file: entryFile,
                    isEntry: true,
                    css: ['assets/index-fixture.css'],
                },
                ...journeyManifest,
                ...(overrides.extraManifest ?? {}),
            },
        ),
    );

    // The R5 preload script names every route chunk the real build would
    // preload by URL: here, each journey fixture file.
    writeFileSync(
        join(dir, 'index.html'),
        overrides.indexHtml ??
            '<!doctype html><title>fixture</title><script data-route-preload>(function(){var m=' +
                JSON.stringify([
                    ['^/$', [`assets/journey-${TEACHER_JOURNEYS.find((j) => j.route === 'src/routes/Home.tsx').name}-fixture.js`]],
                    ['^/join/', [`assets/journey-${TEACHER_JOURNEYS.find((j) => j.route === 'src/routes/JoinClass.tsx').name}-fixture.js`]],
                ]) +
                ';})();</script>',
    );
    writeFileSync(
        join(dir, '_headers'),
        overrides.headers ?? '/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n',
    );
    writeFileSync(
        join(dir, 'sw.js'),
        overrides.sw ??
            'e.precacheAndRoute([{url:"index.html",revision:"abc"}],{}),e.cleanupOutdatedCaches()',
    );
    return dir;
}

const cleanup = (dir) => rmSync(dir, { recursive: true, force: true });

test('a healthy dist passes every budget', () => {
    const dir = makeHealthyDist();
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 0, out);
        assert.match(out, /budgets pass/);
        // The entry names katex/mathlive chunks but contains neither: the
        // stripping is what makes this green. Without it, a correct build fails.
        assert.match(out, /shell is free of katex/);
    } finally {
        cleanup(dir);
    }
});

test('VACUITY: missing dist fails loudly instead of reporting zero bytes', () => {
    const { code, out } = runBudget(join(tmpdir(), 'perf-budget-does-not-exist'));
    assert.equal(code, 1);
    assert.match(out, /VACUITY guard/);
    assert.match(out, /does not exist/);
});

test('VACUITY: missing build manifest fails', () => {
    const dir = makeHealthyDist();
    try {
        rmSync(join(dir, '.vite/manifest.json'));
        const { code, out } = runBudget(dir);
        assert.equal(code, 1);
        assert.match(out, /manifest\.json is missing/);
        assert.match(out, /build\.manifest/);
    } finally {
        cleanup(dir);
    }
});

test('VACUITY: a manifest with no entry chunk fails', () => {
    const dir = makeHealthyDist({
        manifest: { 'index.html': { file: 'assets/index-fixture.js', isEntry: false } },
    });
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 1);
        assert.match(out, /no entry chunk/);
    } finally {
        cleanup(dir);
    }
});

test('VACUITY: a ledger row matching zero chunks fails', () => {
    // The subtle one. Drop the ProseMirror chunk: every remaining row still
    // passes, total size goes DOWN, and a naive script would happily report
    // "all budgets pass" while one row silently guards nothing.
    const dir = makeHealthyDist({
        chunks: {
            'assets/katex-fixture.js': 'throw new ParseError("KaTeX parse error: x")',
            'assets/mathlive-fixture.js': 'class MathfieldElement extends HTMLElement{}',
            'assets/jsx-fixture.js': 'JXG.Board = function(){}',
        },
    });
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 1);
        assert.match(out, /prosemirror/);
        assert.match(out, /NO MATCHING CHUNK|matches nothing/);
    } finally {
        cleanup(dir);
    }
});

test('VACUITY: an unparseable service worker fails', () => {
    const dir = makeHealthyDist({ sw: 'self.addEventListener("fetch",()=>{})' });
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 1);
        assert.match(out, /precacheAndRoute/);
    } finally {
        cleanup(dir);
    }
});

test('an oversized shell fails and names the entry chunk', () => {
    const dir = makeHealthyDist({ entryBody: incompressible(260) });
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 1);
        assert.match(out, /shell JS/);
        assert.match(out, /index-fixture\.js/, 'failure must name the artifact');
        assert.match(out, /Largest chunks/, 'failure must include attribution');
    } finally {
        cleanup(dir);
    }
});

test('heavy library code IN the shell fails as a purity breach, not a size cap', () => {
    // The regression ruling D16 exists to prevent: a block moved to the eager
    // tier drags a heavy library into the entry chunk. It must fail even when
    // the fixture is small enough to sit under every size cap — the message
    // should tell the reader this is not a cap to raise.
    const dir = makeHealthyDist({
        entryBody: 'class MathfieldElement extends HTMLElement{}',
    });
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 1);
        assert.match(out, /shell is free of mathlive/);
        assert.match(out, /not a cap to raise/);
    } finally {
        cleanup(dir);
    }
});

test('a widened precache glob fails the entry-count row', () => {
    const many = Array.from(
        { length: 40 },
        (_, i) => `{url:"assets/chunk-${i}.js",revision:"r${i}"}`,
    ).join(',');
    const dir = makeHealthyDist({
        sw: `e.precacheAndRoute([${many}],{})`,
    });
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 1);
        assert.match(out, /precache entries/);
    } finally {
        cleanup(dir);
    }
});

test('a few-but-enormous precache fails the byte row', () => {
    // Entry count stays legal (2 ≤ 3) while the payload explodes — the case
    // the count row alone is blind to, which is why D10 kept both rows.
    const dir = makeHealthyDist();
    try {
        writeFileSync(join(dir, 'assets/huge.js'), 'x'.repeat(200 * 1024));
        writeFileSync(
            join(dir, 'sw.js'),
            'e.precacheAndRoute([{url:"index.html",revision:"a"},' +
                '{url:"assets/huge.js",revision:"b"}],{})',
        );
        const { code, out } = runBudget(dir);
        assert.equal(code, 1);
        assert.match(out, /precache bytes/);
    } finally {
        cleanup(dir);
    }
});

test('an over-cap ledger payload fails and names its chunks', () => {
    const big = incompressible(400);
    const dir = makeHealthyDist({
        chunks: {
            'assets/katex-fixture.js': 'throw new ParseError("KaTeX parse error: x")',
            'assets/mathlive-fixture.js':
                'class MathfieldElement extends HTMLElement{}' + big,
            'assets/jsx-fixture.js': 'JXG.Board = function(){}',
            'assets/pm-fixture.js': 'class ReplaceError extends Error{}',
        },
    });
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 1);
        assert.match(out, /ledger: mathlive/);
        assert.match(out, /mathlive-fixture\.js/);
    } finally {
        cleanup(dir);
    }
});

test('ledger sums ALL matching chunks, so weight cannot escape by splitting', () => {
    // Outside-voice finding 4: a filename-keyed row keeps matching one chunk
    // after the payload moves. Content matching + summing means splitting a
    // library across two chunks changes nothing about what is enforced.
    // Each half is comfortably under the 290 KiB cap on its own; only the SUM
    // exceeds it. That is precisely the escape a filename-keyed row would miss.
    const half = incompressible(180);
    const dir = makeHealthyDist({
        chunks: {
            'assets/katex-fixture.js': 'throw new ParseError("KaTeX parse error: x")',
            'assets/mathlive-a.js': 'class MathfieldElement extends HTMLElement{}' + half,
            'assets/mathlive-b.js': 'class MathfieldElement extends HTMLElement{}' + half,
            'assets/jsx-fixture.js': 'JXG.Board = function(){}',
            'assets/pm-fixture.js': 'class ReplaceError extends Error{}',
        },
    });
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 1, 'split payload must still exceed the summed cap');
        assert.match(out, /ledger: mathlive/);
        assert.match(out, /2 chunk\(s\)/);
    } finally {
        cleanup(dir);
    }
});

// -----------------------------------------------------------------------------
// The absence rows (2026-08-18, shell-slimming slice 1) — P3 liveness
// -----------------------------------------------------------------------------
// An absence row is the one row type that passes by default: against a healthy
// build it matches nothing, forever, whether or not it works. That is exactly
// the dormant-safeguard shape policy P3 exists for ("force every gate to fire
// once before crediting it"), so both rows below make it fire.
//
// The second one is the whole reason ABSENT_FROM_BUILD is a separate structure
// from SHELL_FORBIDDEN_MARKERS: a library that comes back inside a LAZY chunk
// is invisible to an entry-chunk-only check, and "storage-js is back, but only
// in the image-popover chunk" is the realistic regression — it is where
// storage-js would have lived if the original (rejected) plan had shipped.

test('a stubbed-out library returning to the ENTRY chunk fails the absence row', () => {
    const dir = makeHealthyDist({
        entryBody:
            '["assets/katex-fixture.js"];const app=1;' +
            'const e="API key is required to connect to Realtime";',
    });
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 1, 'realtime-js code anywhere in the build must fail');
        assert.match(out, /build is free of @supabase\/realtime-js/);
        assert.match(out, /resolve\.alias/, 'the failure must name the cause');
    } finally {
        cleanup(dir);
    }
});

test('a stubbed-out library returning to a LAZY chunk fails too, and names it', () => {
    const dir = makeHealthyDist({
        chunks: {
            'assets/katex-fixture.js': 'throw new ParseError("KaTeX parse error: x")',
            'assets/mathlive-fixture.js': 'class MathfieldElement extends HTMLElement{}',
            'assets/jsx-fixture.js': 'JXG.Board = function(){}',
            'assets/pm-fixture.js': 'class ReplaceError extends Error{}',
            // The image popover: a lazy chunk the shell purity rows never read.
            'assets/popover-fixture.js':
                'class StorageUnknownError extends Error{};const p=(k)=>k;',
        },
    });
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 1, 'a lazy chunk is still part of the build');
        assert.match(out, /build is free of @supabase\/storage-js/);
        assert.match(out, /popover-fixture\.js/, 'the offending chunk must be named');
    } finally {
        cleanup(dir);
    }
});

test('gzip is what is measured, not raw bytes', () => {
    // Guards against someone "simplifying" the script to statSync sizes: a
    // highly-compressible chunk that is huge on disk is cheap on the wire, and
    // the wire is what a Chromebook waits for.
    const compressible = 'a'.repeat(2_000_000);
    assert.ok(gzipSync(Buffer.from(compressible)).length < 10_000);
    const dir = makeHealthyDist({ entryBody: compressible });
    try {
        const { code } = runBudget(dir);
        assert.equal(code, 0, 'a 2 MB but highly-compressible entry is under the gz cap');
    } finally {
        cleanup(dir);
    }
});

test('a dist without the immutable /assets/ header rule fails (audit #15)', () => {
    for (const headers of ['', '/assets/*\n  Cache-Control: public, max-age=0\n']) {
        const dir = makeHealthyDist({ headers });
        try {
            const { code, out } = runBudget(dir);
            assert.notEqual(code, 0, 'a missing or weakened caching rule must fail the budget');
            assert.match(out, /dist\/_headers/);
        } finally {
            cleanup(dir);
        }
    }
});

test('a screen moved out of the shell fails when it is back in the entry, or its marker is gone (rung 3)', () => {
    const back = makeHealthyDist({
        entryBody: 'import("./katex-fixture.js");h("input",{id:"landing-code"});const app=1;',
    });
    try {
        const { code, out } = runBudget(back);
        assert.notEqual(code, 0);
        assert.match(out, /signed-out landing/);
    } finally {
        cleanup(back);
    }
    const rotted = makeHealthyDist();
    rmSync(join(rotted, 'assets/PendingOnboarding-fixture.js'));
    try {
        const { code, out } = runBudget(rotted);
        assert.notEqual(code, 0);
        assert.match(out, /MARKER NOT FOUND|rotted/);
    } finally {
        cleanup(rotted);
    }
});

// -----------------------------------------------------------------------------
// The spend meter (shell-size review D3 / P-2). The fixture entry carries CI's
// Supabase origin, read from ci.yml the way the script reads it, and the test
// pins the baseline to the fixture's own gz size, then moves it past the band.
// -----------------------------------------------------------------------------

const CI_ORIGIN = readFileSync(resolve(__dirname, '..', '..', '.github/workflows/ci.yml'), 'utf8')
    .match(/VITE_SUPABASE_URL:\s*(\S+)/)[1];
const ciEntry = `const url="${CI_ORIGIN}";` + '["assets/katex-fixture.js"];const app=1;';
const ciEntryGz = gzipSync(Buffer.from(ciEntry)).length;

test('spend meter: a CI-env shell inside the band passes and prints its delta', () => {
    const dir = makeHealthyDist({ entryBody: ciEntry });
    try {
        const { code, out } = runBudget(dir, { PERF_BUDGET_BASELINE: String(ciEntryGz - 10) });
        assert.equal(code, 0, out);
        assert.match(out, /shell spend vs baseline.*\+10 B/);
    } finally {
        cleanup(dir);
    }
});

test('spend meter: growth past the band fails and says how to record it', () => {
    const dir = makeHealthyDist({ entryBody: ciEntry });
    try {
        const over = SHELL_SPEND_BAND_BYTES + 1;
        const { code, out } = runBudget(dir, { PERF_BUDGET_BASELINE: String(ciEntryGz - over) });
        assert.equal(code, 1, out);
        assert.match(out, new RegExp(`grew ${over} B`));
        assert.match(out, /SHELL_SPEND row/);
        assert.match(out, new RegExp(`SHELL_JS_BASELINE_BYTES to ${ciEntryGz}`));
    } finally {
        cleanup(dir);
    }
});

test('spend meter: shrinking past the band fails too (bank the saving, R6)', () => {
    const dir = makeHealthyDist({ entryBody: ciEntry });
    try {
        const under = SHELL_SPEND_BAND_BYTES + 1;
        const { code, out } = runBudget(dir, { PERF_BUDGET_BASELINE: String(ciEntryGz + under) });
        assert.equal(code, 1, out);
        assert.match(out, new RegExp(`SHRANK ${under} B`));
    } finally {
        cleanup(dir);
    }
});

test('spend meter: a non-CI-env build reports n/a rather than a false delta', () => {
    const dir = makeHealthyDist();
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 0, out);
        assert.match(out, /shell spend vs baseline.*n\/a/);
        assert.match(out, /pnpm verify/);
    } finally {
        cleanup(dir);
    }
});

// -----------------------------------------------------------------------------
// Teacher journeys (shell-size review T5)
// -----------------------------------------------------------------------------

test('journey: a forbidden library reached through a static import fails and names the chunk', () => {
    // The print route statically imports a chunk that carries MathLive: the
    // exact shape of the drawer leak TR2 removed.
    const print = TEACHER_JOURNEYS.find((j) => j.name === 'print');
    const dir = makeHealthyDist({
        extraManifest: {
            [print.route]: { file: 'assets/journey-print-fixture.js', imports: ['src/leak.ts'] },
            'src/leak.ts': { file: 'assets/mathlive-fixture.js' },
        },
    });
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 1, out);
        assert.match(out, /journey: print is free of mathlive/);
        assert.match(out, /mathlive-fixture\.js/, 'failure must name the chunk');
    } finally {
        cleanup(dir);
    }
});

test('journey: chunks the shell already loaded do not count against a route', () => {
    // The katex fixture chunk is imported by BOTH the entry and the bank
    // route: the student already has it, so the bank journey stays clean.
    const bank = TEACHER_JOURNEYS.find((j) => j.name === 'bank');
    const dir = makeHealthyDist({
        extraManifest: {
            'index.html': { file: 'assets/index-fixture.js', isEntry: true, imports: ['src/shared.ts'] },
            'src/shared.ts': { file: 'assets/mathlive-fixture.js' },
            [bank.route]: { file: 'assets/journey-bank-fixture.js', imports: ['src/shared.ts'] },
        },
    });
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 0, out);
        assert.match(out, /journey: bank is free of mathlive\s+absent/);
    } finally {
        cleanup(dir);
    }
});

test('journey: an oversized route fails its cap and names its biggest chunks', () => {
    const classes = TEACHER_JOURNEYS.find((j) => j.name === 'classes');
    const dir = makeHealthyDist({
        chunks: undefined,
        extraManifest: {
            [classes.route]: { file: 'assets/journey-classes-fixture.js', imports: ['src/big.ts'] },
            'src/big.ts': { file: 'assets/big-fixture.js' },
        },
    });
    writeFileSync(join(dir, 'assets/big-fixture.js'), incompressible(classes.maxGzKiB + 5));
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 1, out);
        assert.match(out, /journey: classes/);
        assert.match(out, /big-fixture\.js/);
    } finally {
        cleanup(dir);
    }
});

test('VACUITY: a journey route inside the shell closure fails instead of measuring 0', () => {
    const editor = TEACHER_JOURNEYS[0];
    const dir = makeHealthyDist({
        extraManifest: {
            'index.html': { file: 'assets/index-fixture.js', isEntry: true, imports: [editor.route] },
        },
    });
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 1, out);
        assert.match(out, /in the shell's static closure/);
    } finally {
        cleanup(dir);
    }
});

test('VACUITY: a journey route missing from the manifest fails instead of vanishing', () => {
    const dir = makeHealthyDist();
    const manifestPath = join(dir, '.vite/manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    delete manifest[TEACHER_JOURNEYS[0].route];
    writeFileSync(manifestPath, JSON.stringify(manifest));
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 1, out);
        assert.match(out, /VACUITY guard/);
        assert.match(out, /not in the build manifest/);
    } finally {
        cleanup(dir);
    }
});

test('journey: a lazyOut module statically imported by its route fails (TR4 shape)', () => {
    const editor = TEACHER_JOURNEYS.find((j) => j.name === 'editor');
    const dir = makeHealthyDist({
        extraManifest: {
            [editor.route]: { file: 'assets/journey-editor-fixture.js', imports: ['src/dialog.tsx'] },
            'src/dialog.tsx': { file: 'assets/ImportMarkdownDialog-fixture.js' },
        },
    });
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 1, out);
        assert.match(out, /journey: editor leaves out the markdown import dialog\s+IN JOURNEY/);
    } finally {
        cleanup(dir);
    }
});

test('VACUITY: a lazyOut marker that matches no chunk fails instead of reading "lazy"', () => {
    const dir = makeHealthyDist();
    writeFileSync(join(dir, 'assets/ImportMarkdownDialog-fixture.js'), 'h("h2",{id:"renamed-title"})');
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 1, out);
        assert.match(out, /leaves out the markdown import dialog\s+MARKER NOT FOUND/);
    } finally {
        cleanup(dir);
    }
});

test('route preload: an index.html that does not preload a lazy landing route fails (R5)', () => {
    const dir = makeHealthyDist({ indexHtml: '<!doctype html><title>no preload</title>' });
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 1, out);
        assert.match(out, /index\.html preloads Home\.tsx\s+NO/);
    } finally {
        cleanup(dir);
    }
});

test('route preload: a chunk filed under the WRONG URL pattern fails (R5)', () => {
    const home = TEACHER_JOURNEYS.find((j) => j.route === 'src/routes/Home.tsx');
    const join = TEACHER_JOURNEYS.find((j) => j.route === 'src/routes/JoinClass.tsx');
    const swapped = JSON.stringify([
        ['^/$', [`assets/journey-${join.name}-fixture.js`]],
        ['^/join/', [`assets/journey-${home.name}-fixture.js`]],
    ]);
    const dir = makeHealthyDist({
        indexHtml: `<!doctype html><script data-route-preload>(function(){var m=${swapped};})();</script>`,
    });
    try {
        const { code, out } = runBudget(dir);
        assert.equal(code, 1, out);
        assert.match(out, /index\.html preloads Home\.tsx\s+NO/);
        assert.match(out, /index\.html preloads JoinClass\.tsx\s+NO/);
    } finally {
        cleanup(dir);
    }
});
