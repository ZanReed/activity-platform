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
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { randomBytes } from 'node:crypto';

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
function runBudget(distPath) {
    try {
        const out = execFileSync('node', [SCRIPT], {
            env: { ...process.env, PERF_BUDGET_DIST: distPath },
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
    };
    for (const [file, body] of Object.entries(chunks)) {
        writeFileSync(join(dir, file), body);
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
            },
        ),
    );

    writeFileSync(join(dir, 'index.html'), '<!doctype html><title>fixture</title>');
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
