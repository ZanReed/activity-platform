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
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import {
    APP_DIST_DIR,
    SHELL_JS_GZ_KIB,
    SHELL_JS_BASELINE_BYTES,
    SHELL_SPEND_BAND_BYTES,
    SHELL_CSS_GZ_KIB,
    PRECACHE_MAX_ENTRIES,
    PRECACHE_MAX_BYTES,
    CHUNK_LEDGER,
    SHELL_FORBIDDEN_MARKERS,
    ABSENT_FROM_BUILD,
    SHELL_EVICTED,
    TEACHER_JOURNEYS,
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

// ---- The spend meter (shell-size review D3, policy P-2) ----------------------
// Exact gz bytes against SHELL_JS_BASELINE_BYTES, red OUTSIDE ±band either way.
// Meaningful only for a build made with CI's env: the Supabase URL and anon key
// are inlined into the entry, so a .env.local build reads different bytes (and
// an env-less build drops whole code paths). The origin is READ from ci.yml,
// never retyped, the way verify-local.mjs reads the build env.
const ciYml = readFileSync(join(root, '.github/workflows/ci.yml'), 'utf8');
const ciOrigin = ciYml.match(/VITE_SUPABASE_URL:\s*(\S+)/)?.[1];
require_(ciOrigin, 'could not read VITE_SUPABASE_URL out of .github/workflows/ci.yml.');
const entryGzBytes = gzipSync(entryBuf).length;
// Fixture dists (PERF_BUDGET_DIST) may pin their own baseline: the only way to
// fire this row's red branches without a real build. Ignored otherwise.
const baseline = process.env.PERF_BUDGET_DIST && process.env.PERF_BUDGET_BASELINE
    ? Number(process.env.PERF_BUDGET_BASELINE)
    : SHELL_JS_BASELINE_BYTES;
if (entryBuf.includes(ciOrigin)) {
    const delta = entryGzBytes - baseline;
    const ok = Math.abs(delta) <= SHELL_SPEND_BAND_BYTES;
    const sign = delta >= 0 ? '+' : '';
    rows.push({
        name: 'shell spend vs baseline (gz bytes)',
        actual: `${sign}${delta}`,
        cap: `±${SHELL_SPEND_BAND_BYTES}`,
        unit: 'B',
        ok,
    });
    if (!ok) {
        failures.push({
            name: 'shell spend vs baseline',
            actual: `${sign}${delta}`,
            cap: `±${SHELL_SPEND_BAND_BYTES}`,
            unit: 'B',
            detail:
                (delta > 0
                    ? `the shell grew ${delta} B gz past SHELL_JS_BASELINE_BYTES (${baseline}). `
                    : `the shell SHRANK ${-delta} B gz below SHELL_JS_BASELINE_BYTES (${baseline}): bank it. `) +
                `Measured ${entryGzBytes} B. In scripts/perf-budgets.mjs, add a SHELL_SPEND row ` +
                `{ date, change, bytes: ${delta} } naming what moved it, and set ` +
                `SHELL_JS_BASELINE_BYTES to ${entryGzBytes}, in this commit. This is a ` +
                'ledger entry, not a cap: the ceiling (SHELL_JS_GZ_KIB) is fixed, and a ' +
                'spend that would cross it brings a reserve rung (shell-size review P-3).',
        });
    }
} else {
    // In CI (and under `pnpm verify`, which sets PERF_REQUIRE_SPEND_METER) the
    // dist IS a CI-env build, so a miss here means the check is blind.
    require_(
        !(process.env.CI || process.env.PERF_REQUIRE_SPEND_METER) || process.env.PERF_BUDGET_DIST,
        `the entry chunk does not contain CI's Supabase origin (${ciOrigin}), so ` +
            'the spend meter cannot run. In CI that means the build env and ci.yml ' +
            'disagree, or the app stopped inlining VITE_SUPABASE_URL into the entry.',
    );
    rows.push({
        name: 'shell spend vs baseline (gz bytes)',
        actual: 'n/a',
        cap: 'CI env',
        unit: '',
        ok: true,
    });
    rows.push({
        name: '  (not a CI-env build: run `pnpm verify`)',
        actual: '',
        cap: '',
        unit: '',
        ok: true,
    });
}

// Brotli is what Cloudflare actually serves (P-6). Information only: gzip stays
// the gate because the cap history is written in it.
rows.push({
    name: 'shell JS (entry chunk, brotli)',
    actual: brotliCompressSync(entryBuf).length / 1024,
    cap: 'info',
    unit: 'KiB',
    ok: true,
});

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
// Rows — teacher journeys (shell-size review T5)
// -----------------------------------------------------------------------------
// Route chunk + its static-import closure from the manifest, minus the shell's
// own closure. The manifest's `imports` lists are exactly what the browser
// fetches before the route can render (Vite preloads them with the chunk).
const manifestKeyOf = (file) => Object.keys(manifest).find((k) => manifest[k].file === file);
function staticClosure(key, seen = new Set()) {
    if (seen.has(key) || !manifest[key]) return seen;
    seen.add(key);
    for (const dep of manifest[key].imports ?? []) staticClosure(dep, seen);
    return seen;
}
const shellClosure = staticClosure(manifestKeyOf(entry.file));
const ledgerMarker = Object.fromEntries(CHUNK_LEDGER.map((r) => [r.name, r.marker]));
for (const j of TEACHER_JOURNEYS) {
    require_(
        manifest[j.route]?.file,
        `teacher journey "${j.name}": ${j.route} is not in the build manifest. The ` +
            'route was renamed or stopped being a chunk; update TEACHER_JOURNEYS in ' +
            'scripts/perf-budgets.mjs rather than letting the row vanish.',
    );
    require_(
        !shellClosure.has(j.route),
        `teacher journey "${j.name}": ${j.route} is in the shell's static closure, ` +
            'so its journey would measure 0 KiB and every "free of" row would pass ' +
            'vacuously. A teacher route joined the student shell: that is the bug.',
    );
    const chunks = [...staticClosure(j.route)]
        .filter((k) => !shellClosure.has(k))
        .map((k) => {
            const path = join(dist, manifest[k].file);
            const buf = readFileSync(path);
            return { file: manifest[k].file, gz: gzKiB(buf), source: buf.toString('utf8') };
        });
    const total = chunks.reduce((sum, c) => sum + c.gz, 0);
    record(
        `journey: ${j.name}`,
        total,
        j.maxGzKiB,
        'KiB',
        `${j.route} downloads ${chunks.length} chunk(s) beyond the shell: ` +
            [...chunks].sort((a, b) => b.gz - a.gz).slice(0, 6)
                .map((c) => `${c.file} (${fmt(c.gz)} KiB)`).join(', ') +
            `. ${j.why} A jump of a whole library usually means a static import ` +
            'crossed a feature line (serialize.ts, the config drawer, a package barrel).',
    );
    for (const spec of j.lazyOut ?? []) {
        const inJourney = chunks.some((c) => spec.marker.test(stripAssetSpecifiers(c.source)));
        const elsewhere = jsChunks.some(
            (chunk) => spec.marker.test(stripAssetSpecifiers(readFileSync(chunk.path, 'utf8'))),
        );
        const ok = !inJourney && elsewhere;
        const actual = inJourney ? 'IN JOURNEY' : elsewhere ? 'lazy' : 'MARKER NOT FOUND';
        rows.push({ name: `journey: ${j.name} leaves out ${spec.name}`, actual, cap: 'lazy', unit: '', ok });
        if (!ok) {
            failures.push({
                name: `journey: ${j.name} leaves out ${spec.name}`,
                actual,
                cap: 'lazy',
                unit: '',
                detail: inJourney
                    ? `${spec.name} is back in the ${j.name} journey's static imports. ${spec.why} ` +
                      'A static import of it crept back; restore the lazy() import.'
                    : `the marker ${spec.marker} matches no chunk at all, so this row cannot ` +
                      'tell lazy from deleted. The markup changed: pick a new marker from it.',
            });
        }
    }
    for (const lib of j.forbid) {
        const marker = ledgerMarker[lib];
        require_(marker, `teacher journey "${j.name}" forbids "${lib}", which is not a CHUNK_LEDGER row.`);
        const hits = chunks.filter((c) => marker.test(stripAssetSpecifiers(c.source)));
        rows.push({
            name: `journey: ${j.name} is free of ${lib}`,
            actual: hits.length ? 'PRESENT' : 'absent',
            cap: 'absent',
            unit: '',
            ok: hits.length === 0,
        });
        if (hits.length) {
            failures.push({
                name: `journey: ${j.name} is free of ${lib}`,
                actual: 'PRESENT',
                cap: 'absent',
                unit: '',
                detail:
                    `${lib} code is in the ${j.name} journey (${j.route}) via ` +
                    hits.map((c) => `${c.file} (${fmt(c.gz)} KiB)`).join(', ') +
                    `. ${j.why} Find the static import that crossed over ` +
                    '(the review\'s three were lib/serialize.ts, ' +
                    'components/ActivityConfigDrawer.tsx and the @activity/graph-kit ' +
                    'barrel) and make it lazy or move what the route needs into a ' +
                    'module of its own. Background: docs/design/shell-size-review.md §8.',
            });
        }
    }
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

// -----------------------------------------------------------------------------
// Rows — modules moved out of the shell into lazy chunks (rung 3)
// -----------------------------------------------------------------------------
// Absent from the entry AND present elsewhere: the second half is the liveness
// proof, so a renamed marker fails instead of reporting "absent" forever.
// ---- Route preload by URL (shell-size review R5) ------------------------------
// Home and JoinClass are lazy; index.html must preload each one's chunk for
// its URL, or a visit to / pays a second round trip before first paint. The
// list is READ from packages/app/src/lib/landingPaths.ts (never retyped), and
// the inline data-route-preload script's map is PARSED: each route's built
// file must sit under ITS OWN pattern, not merely appear somewhere.
{
    const listSrc = readFileSync(join(root, 'packages/app/src/lib/landingPaths.ts'), 'utf8');
    const wanted = [...listSrc.matchAll(/route:\s*['"]([^'"]+)['"],\s*path:\s*['"]([^'"]+)['"]/g)].map(
        (m) => ({ route: m[1], path: m[2] }),
    );
    require_(
        wanted.length > 0 && wanted.length === (listSrc.match(/route:/g) ?? []).length,
        'could not read every { route, path } row of LANDING_ROUTES in ' +
            'packages/app/src/lib/landingPaths.ts; the route-preload rows would under-check.',
    );
    const html = existsSync(join(dist, 'index.html')) ? readFileSync(join(dist, 'index.html'), 'utf8') : '';
    const script = html.match(/<script data-route-preload[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? '';
    let built = [];
    try {
        built = JSON.parse(script.match(/m=(\[[\s\S]*?\]\]\]);/)?.[1] ?? '[]');
    } catch {
        built = [];
    }
    for (const { route, path: pattern } of wanted) {
        const file = manifest[route]?.file;
        const entryForPattern = built.find((row) => row[0] === pattern);
        const ok = Boolean(file) && Boolean(entryForPattern) && entryForPattern[1][0] === file;
        const name = `index.html preloads ${route.replace(/^src\/routes\//, '')}`;
        rows.push({ name, actual: ok ? 'yes' : 'NO', cap: 'yes', unit: '', ok });
        if (!ok) {
            failures.push({
                name,
                actual: 'NO',
                cap: 'yes',
                unit: '',
                detail: !file
                    ? `${route} has no chunk in the build manifest: it was renamed or made a static import. Update packages/app/src/lib/landingPaths.ts.`
                    : `dist/index.html's preload map does not put ${file} first under "${pattern}". The activity:route-preload plugin in vite.config.ts stopped running or stopped matching; without it a visit to that URL waits a second round trip for its route.`,
            });
        }
    }
}

for (const spec of SHELL_EVICTED) {
    const inEntry = spec.marker.test(entrySource);
    const elsewhere = jsChunks.some(
        (chunk) =>
            chunk.path !== entryPath &&
            spec.marker.test(stripAssetSpecifiers(readFileSync(chunk.path, 'utf8'))),
    );
    const ok = !inEntry && elsewhere;
    const actual = inEntry ? 'IN SHELL' : elsewhere ? 'lazy' : 'MARKER NOT FOUND';
    rows.push({ name: `shell leaves out ${spec.name}`, actual, cap: 'lazy', unit: '', ok });
    if (!ok) {
        failures.push({
            name: `shell leaves out ${spec.name}`,
            actual,
            cap: 'lazy',
            unit: '',
            detail: inEntry
                ? `${spec.name} is back in the entry chunk (${entry.file}). ${spec.why} Look for a static import of it.`
                : `the marker ${spec.marker} matched no chunk at all — it has rotted. Pick a string that is still in the component's own markup (scripts/perf-budgets.mjs, SHELL_EVICTED).`,
        });
    }
}

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
                `. ${spec.why} The usual cause is its wiring in ` +
                'packages/app/vite.config.ts (a resolve.alias entry for the three ' +
                'sub-clients, the activity:auth-js-dead-modules plugin for auth-js) ' +
                'being removed or stopping short of a new import path. This is not ' +
                'a cap to raise — either restore the wiring, or retire the stub ' +
                'deliberately (delete this row, the stub, and its entry in ' +
                'scripts/tests/supabase-stub-pin.test.mjs together, and say so ' +
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

// ---- Asset caching header (efficiency audit 2026-10 #15) ---------------------
// Cloudflare Pages serves static files `max-age=0, must-revalidate` unless
// dist/_headers says otherwise, so every worker-less visit revalidated each
// hashed chunk. The rule ships from packages/app/public/_headers; this checks
// the BUILT tree, so a build change that stops copying public/ fails here.
const headersPath = join(dist, '_headers');
require_(
    existsSync(headersPath) &&
        /^\/assets\/\*\s*\n\s+Cache-Control:\s*public, max-age=31536000, immutable\s*$/m.test(
            readFileSync(headersPath, 'utf8'),
        ),
    'dist/_headers is missing its `/assets/*  Cache-Control: public, max-age=31536000, ' +
        'immutable` rule. It is copied from packages/app/public/_headers; without it ' +
        'every hashed chunk is revalidated on each visit the service worker does not serve.',
);

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
    const capText = r.cap === 'info' ? '(info)' : r.cap === '' ? '' : `(cap ${cap} ${r.unit})`;
    console.log(
        `  ${r.ok ? 'ok  ' : 'FAIL'}  ${r.name.padEnd(34)} ${String(actual).padStart(9)} ${r.unit}` +
            `  ${capText}`,
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
