// =============================================================================
// scripts/check-perf-budget.mjs — the built SPA's size gates (S8)
// -----------------------------------------------------------------------------
// Runs after `pnpm build` in CI. Every row here is DETERMINISTIC: the same
// commit produces the same bytes on every machine, so a red build from this
// script is always a real regression and never runner variance. That is the
// whole reason timing lives in the Playwright perf lane instead of here
// (ruling D3) — mixing a flaky gate in with these would cost them their
// authority.
//
// WHAT IT GUARDS
//   1. The student shell — entry chunk JS and CSS, gzipped, separately.
//   2. The shell's PURITY — no KaTeX / MathLive / JSXGraph / ProseMirror code
//      in the entry chunk (the enforcement of ruling D16's lazy-heavies half).
//   3. The heavy-chunk ledger — each payload capped where it actually lives.
//   4. The service-worker precache — entry count and total bytes (ruling D19).
//
// ANTI-VACUITY IS A FIRST-CLASS FEATURE, not defensive coding. This repo has
// been bitten twice by checks that passed while proving nothing (the
// empty-activity leak scan; verify-0022's C1 pointing at ambient rows that were
// later deleted). A budget script is unusually prone to it: delete dist/ and a
// naive implementation reports zero bytes and exits 0. So every structural
// assumption is asserted before any measurement is trusted, and a row that
// matches nothing FAILS rather than silently passing.
//
// ATTRIBUTION ON FAILURE. A red budget must say WHAT grew. "Entry chunk is over
// cap" sends the reader on an archaeology expedition and the usual outcome is
// that someone raises the cap. So a failure prints the offending artifacts and
// the biggest chunks around them.
//
// ZERO DEPENDENCIES: node:fs, node:path, node:zlib only. Root scripts cannot
// import from packages/* under pnpm's strict node_modules.
//
//   dist/ ──▶ manifest.json ──▶ entry chunk ──┬─▶ gz size  ─▶ SHELL_JS row
//                                             └─▶ markers  ─▶ purity pins
//         ──▶ assets/*.js ────▶ content match ──▶ summed gz ─▶ ledger rows
//         ──▶ sw.js ─────────▶ precache URLs ──┬─▶ count    ─▶ PRECACHE row
//                                              └─▶ bytes    ─▶ PRECACHE row
// =============================================================================

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import {
    APP_DIST_DIR,
    SHELL_JS_GZ_KIB,
    SHELL_CSS_GZ_KIB,
    PRECACHE_MAX_ENTRIES,
    PRECACHE_MAX_BYTES,
    CHUNK_LEDGER,
    SHELL_FORBIDDEN_MARKERS,
    ABSENT_FROM_BUILD,
    stripAssetSpecifiers,
} from './perf-budgets.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// PERF_BUDGET_DIST points the check at a different dist tree. Its ONLY consumer
// is scripts/tests/check-perf-budget.test.mjs, which builds fixture dists to
// prove the failure paths actually fail — including the vacuity guards, which
// by definition cannot be exercised against a healthy build. A gate whose
// failure branches have never run is a gate nobody has tested.
const dist = process.env.PERF_BUDGET_DIST
    ? resolve(process.env.PERF_BUDGET_DIST)
    : resolve(root, APP_DIST_DIR);

const failures = [];
const rows = [];

const gzKiB = (buf) => gzipSync(buf).length / 1024;
const fmt = (n) => n.toFixed(1);

/** A structural assumption that must hold before any measurement means anything. */
function require_(condition, message) {
    if (!condition) {
        console.error('');
        console.error('ERROR: perf budget cannot run — ' + message);
        console.error('');
        console.error('This is a VACUITY guard, not a size failure. The check');
        console.error('refuses to report "all budgets pass" when it could not');
        console.error('actually measure what it is supposed to measure.');
        process.exit(1);
    }
}

function record(name, actual, cap, unit, detail) {
    const ok = actual <= cap;
    rows.push({ name, actual, cap, unit, ok });
    if (!ok) failures.push({ name, actual, cap, unit, detail });
}

// -----------------------------------------------------------------------------
// Structural preconditions
// -----------------------------------------------------------------------------

require_(
    existsSync(dist),
    `${APP_DIST_DIR} does not exist. Run \`pnpm --filter @activity/app build\` first.`,
);

const manifestPath = join(dist, '.vite', 'manifest.json');
require_(
    existsSync(manifestPath),
    `${APP_DIST_DIR}/.vite/manifest.json is missing. The budget identifies the ` +
        'entry chunk from the build manifest; vite.config.ts must keep ' +
        'build.manifest enabled.',
);

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const entry = Object.values(manifest).find((e) => e.isEntry);
require_(
    entry && entry.file,
    'no entry chunk in the build manifest (nothing marked isEntry). The shell ' +
        'budget has nothing to measure.',
);

const entryPath = join(dist, entry.file);
require_(existsSync(entryPath), `entry chunk ${entry.file} is listed in the manifest but missing from dist.`);

const assetsDir = join(dist, 'assets');
require_(existsSync(assetsDir), 'dist/assets is missing — the build did not emit chunks.');

const jsChunks = readdirSync(assetsDir)
    .filter((f) => f.endsWith('.js'))
    .map((f) => ({ file: f, path: join(assetsDir, f) }));
require_(jsChunks.length > 0, 'dist/assets contains no .js chunks.');

// -----------------------------------------------------------------------------
// Row 1+2 — the student shell (JS and CSS, separately)
// -----------------------------------------------------------------------------

const entryBuf = readFileSync(entryPath);
record(
    'shell JS (entry chunk, gz)',
    gzKiB(entryBuf),
    SHELL_JS_GZ_KIB,
    'KiB',
    `entry chunk: ${entry.file}`,
);

const entryCss = entry.css ?? [];
const cssBytes = entryCss.reduce((sum, c) => {
    const p = join(dist, c);
    return existsSync(p) ? sum + gzipSync(readFileSync(p)).length : sum;
}, 0);
record(
    'shell CSS (entry, gz)',
    cssBytes / 1024,
    SHELL_CSS_GZ_KIB,
    'KiB',
    `entry CSS: ${entryCss.join(', ') || '(none)'}`,
);

// -----------------------------------------------------------------------------
// Row 3 — shell purity: no heavy library CODE in the entry chunk
// -----------------------------------------------------------------------------
// Asset-path literals are stripped first. The entry chunk legitimately NAMES
// every lazy chunk (module-preload map + dynamic import specifiers), so a naive
// substring search reports MathLive and KaTeX in a perfectly clean shell.

const entrySource = stripAssetSpecifiers(readFileSync(entryPath, 'utf8'));
for (const { name, marker } of SHELL_FORBIDDEN_MARKERS) {
    const present = marker.test(entrySource);
    rows.push({
        name: `shell is free of ${name}`,
        actual: present ? 'PRESENT' : 'absent',
        cap: 'absent',
        unit: '',
        ok: !present,
    });
    if (present) {
        failures.push({
            name: `shell is free of ${name}`,
            actual: 'PRESENT',
            cap: 'absent',
            unit: '',
            detail:
                `${name} code is now inside the entry chunk (${entry.file}). Ruling ` +
                'D16 keeps heavy libraries in lazy chunks; something on the ' +
                'student path (App.tsx static import, or a registry entry moved ' +
                "to the eager tier) now pulls it in. This is not a cap to raise.",
        });
    }
}

// -----------------------------------------------------------------------------
// Row 4..n — the heavy-chunk ledger, matched by CONTENT and summed
// -----------------------------------------------------------------------------

for (const rowSpec of CHUNK_LEDGER) {
    const matched = [];
    for (const chunk of jsChunks) {
        const source = stripAssetSpecifiers(readFileSync(chunk.path, 'utf8'));
        if (rowSpec.marker.test(source)) {
            matched.push({ file: chunk.file, gz: gzKiB(readFileSync(chunk.path)) });
        }
    }

    // A ledger row that matches nothing is the vacuity case: the payload was
    // renamed, removed, or the marker rotted. Either way the row has stopped
    // guarding anything, and saying so loudly is the whole point.
    if (matched.length === 0) {
        failures.push({
            name: `ledger: ${rowSpec.name}`,
            actual: 'NO MATCHING CHUNK',
            cap: `${rowSpec.maxGzKiB} KiB`,
            unit: '',
            detail:
                `No built chunk contains the ${rowSpec.name} marker ` +
                `(${rowSpec.marker}). Either the payload genuinely left the ` +
                'bundle (delete this row and say so in the diff) or the marker ' +
                'no longer matches its library (update the marker). A row that ' +
                'matches nothing silently guards nothing.',
        });
        rows.push({
            name: `ledger: ${rowSpec.name}`,
            actual: 'no match',
            cap: rowSpec.maxGzKiB,
            unit: 'KiB',
            ok: false,
        });
        continue;
    }

    const total = matched.reduce((sum, m) => sum + m.gz, 0);
    record(
        `ledger: ${rowSpec.name}`,
        total,
        rowSpec.maxGzKiB,
        'KiB',
        `${matched.length} chunk(s): ` +
            matched.map((m) => `${m.file} (${fmt(m.gz)} KiB)`).join(', '),
    );
}

// -----------------------------------------------------------------------------
// Rows — payloads that must be absent from the WHOLE build, not just the shell
// -----------------------------------------------------------------------------
// The inverse of the ledger (see ABSENT_FROM_BUILD's comment for why it cannot
// be expressed by either structure above). A ledger row fails when it matches
// NOTHING; these fail when they match ANYTHING, and they scan every chunk
// rather than the entry alone — so a stubbed-out library reappearing inside a
// lazy chunk is caught too.
//
// A matching chunk is NAMED in the failure. "storage-js is back" without
// saying which chunk pulled it in is the archaeology expedition this script's
// attribution rule exists to prevent.

for (const spec of ABSENT_FROM_BUILD) {
    const matched = [];
    for (const chunk of jsChunks) {
        const source = stripAssetSpecifiers(readFileSync(chunk.path, 'utf8'));
        if (spec.marker.test(source)) {
            matched.push({ file: chunk.file, gz: gzKiB(readFileSync(chunk.path)) });
        }
    }
    rows.push({
        name: `build is free of ${spec.name}`,
        actual: matched.length ? `${matched.length} chunk(s)` : 'absent',
        cap: 'absent',
        unit: '',
        ok: matched.length === 0,
    });
    if (matched.length) {
        failures.push({
            name: `build is free of ${spec.name}`,
            actual: `${matched.length} chunk(s)`,
            cap: 'absent',
            unit: '',
            detail:
                `${spec.name} is back in the bundle: ` +
                matched.map((m) => `${m.file} (${fmt(m.gz)} KiB)`).join(', ') +
                `. ${spec.why} The usual cause is the resolve.alias entry in ` +
                'packages/app/vite.config.ts being removed or stopping short of a ' +
                'new import path. This is not a cap to raise — either restore the ' +
                'alias, or retire the stub deliberately (delete this row, the stub, ' +
                'and scripts/tests/supabase-stub-pin.test.mjs together, and say so ' +
                'in the diff). Background: docs/design/shell-slim-supabase.md.',
        });
    }
}

// -----------------------------------------------------------------------------
// Row n+1, n+2 — the service-worker precache (ruling D19 / D10)
// -----------------------------------------------------------------------------
// Parsed from the generated worker's precacheAndRoute([...]) call. Workbox
// minifies it, so keys are unquoted: {url:"index.html",revision:"..."}. Only
// the URL LIST is read from the worker; the byte total is summed from the real
// dist files those URLs point at, so this never depends on Workbox's internal
// bookkeeping staying shaped the way it is today.

const swPath = join(dist, 'sw.js');
require_(
    existsSync(swPath),
    'dist/sw.js is missing — vite-plugin-pwa did not emit a worker, so the ' +
        'precache budget has nothing to measure.',
);

const swSource = readFileSync(swPath, 'utf8');
const call = swSource.match(/precacheAndRoute\(\s*\[([\s\S]*?)\]/);
require_(
    call,
    'could not find precacheAndRoute([...]) in dist/sw.js. The precache budget ' +
        'cannot confirm what the worker precaches; if vite-plugin-pwa changed ' +
        'its output shape, this parser must be updated rather than skipped.',
);

const precacheUrls = [...call[1].matchAll(/url\s*:\s*["']([^"']+)["']/g)].map((m) => m[1]);
require_(
    precacheUrls.length > 0,
    'the precache list in dist/sw.js parsed to zero URLs. Either the worker ' +
        'precaches nothing (a real change worth failing on) or the parser broke.',
);

let precacheBytes = 0;
const missingPrecacheFiles = [];
for (const url of precacheUrls) {
    const clean = url.replace(/^\//, '').split('?')[0];
    const p = join(dist, clean);
    if (existsSync(p)) precacheBytes += statSync(p).size;
    else missingPrecacheFiles.push(url);
}

record(
    'precache entries',
    precacheUrls.length,
    PRECACHE_MAX_ENTRIES,
    '',
    `precached: ${precacheUrls.join(', ')}`,
);
record(
    'precache bytes',
    precacheBytes,
    PRECACHE_MAX_BYTES,
    'B',
    `${precacheUrls.length} file(s)` +
        (missingPrecacheFiles.length
            ? ` — NOT FOUND in dist: ${missingPrecacheFiles.join(', ')}`
            : ''),
);

// -----------------------------------------------------------------------------
// Report
// -----------------------------------------------------------------------------

console.log('');
console.log('Performance budgets (built SPA)');
console.log('-'.repeat(72));
for (const r of rows) {
    const actual = typeof r.actual === 'number' ? fmt(r.actual) : r.actual;
    const cap = typeof r.cap === 'number' ? fmt(r.cap) : r.cap;
    console.log(
        `  ${r.ok ? 'ok  ' : 'FAIL'}  ${r.name.padEnd(34)} ${String(actual).padStart(9)} ${r.unit}` +
            `  (cap ${cap} ${r.unit})`,
    );
}
console.log('-'.repeat(72));

if (failures.length === 0) {
    console.log(`All ${rows.length} budgets pass.`);
    console.log('');
    process.exit(0);
}

console.error('');
console.error(`${failures.length} performance budget(s) EXCEEDED:`);
console.error('');
for (const f of failures) {
    const actual = typeof f.actual === 'number' ? fmt(f.actual) : f.actual;
    const cap = typeof f.cap === 'number' ? fmt(f.cap) : f.cap;
    console.error(`  ${f.name}: ${actual} ${f.unit} (cap ${cap} ${f.unit})`);
    console.error(`      ${f.detail}`);
    console.error('');
}

// Attribution: the ten biggest chunks, so the reader can see what moved without
// re-running a bundle analyzer by hand.
console.error('Largest chunks in this build (gz):');
const biggest = jsChunks
    .map((c) => ({ file: c.file, gz: gzKiB(readFileSync(c.path)) }))
    .sort((a, b) => b.gz - a.gz)
    .slice(0, 10);
for (const b of biggest) {
    console.error(`  ${fmt(b.gz).padStart(9)} KiB  ${b.file}`);
}
console.error('');
console.error('Budgets and their reasoning: scripts/perf-budgets.mjs');
console.error('Raising a cap is a deliberate decision that belongs in the diff,');
console.error('with the reason written next to the number.');
process.exit(1);
