// =============================================================================
// supabase-stub-pin.test.mjs — the sub-client stubs and the library they
// impersonate must stay in step (V5; design doc R4)
// -----------------------------------------------------------------------------
// packages/app/src/lib/supabase-stubs/ replaces @supabase/realtime-js and
// @supabase/storage-js at bundle time (resolve.alias in vite.config.ts), to keep
// ~23 KiB gz of never-executed code out of the student's entry chunk.
//
// Those stubs mirror INTERNALS, not public API. "SupabaseClient calls
// realtime.setAuth() with zero arguments on SIGNED_OUT" and "the storage
// sub-client is constructor-assigned rather than a getter" are implementation
// details of one release; both were established by reading dist/index.mjs, and
// both are free to change in a patch bump. A floating `^2.105.3` would let that
// happen silently — the first symptom being a student who cannot sign in.
//
// So the version is pinned EXACTLY, and this test makes forgetting impossible
// rather than making the re-audit optional. It is the MATHLIVE_VERSION
// discipline (vite.config.ts's fonts plugin), applied where the same hazard
// lives. Three things must agree:
//
//   1. the exact pin in packages/app/package.json,
//   2. the `AUDITED AGAINST:` line in EACH stub's header,
//   3. the version actually installed in node_modules.
//
// ZERO DEPENDENCIES (root-script rule): node:fs + node:path only.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const appDir = join(repo, 'packages/app');
const stubDir = join(appDir, 'src/lib/supabase-stubs');

const STUBS = ['realtime-js.ts', 'storage-js.ts'];

const REAUDIT =
    '\n\nTO FIX — re-audit, do not just edit the number:\n' +
    '  1. Read node_modules/@supabase/supabase-js/dist/index.mjs.\n' +
    '     Check every `this.realtime.*` call site (the login path calls setAuth\n' +
    '     with ZERO arguments on SIGNED_OUT) and how `this.storage` is produced\n' +
    '     (it is constructor-ASSIGNED today, not a getter — a stub whose\n' +
    '     constructor throws would break every client construction).\n' +
    '  2. Read dist/index.mjs\'s own export list too, not only SupabaseClient:\n' +
    '     it does `export * from "@supabase/realtime-js"` and re-exports\n' +
    '     StorageApiError by name. A missing named export is a hard rollup error.\n' +
    '  3. Update the stubs in packages/app/src/lib/supabase-stubs/ to match,\n' +
    '     then bump BOTH the exact pin in packages/app/package.json and the\n' +
    '     `AUDITED AGAINST:` line in each stub header.\n' +
    'Background: docs/design/shell-slim-supabase.md (R4).';

/** The pin, read from the app's package.json. */
function declaredPin() {
    const pkg = JSON.parse(readFileSync(join(appDir, 'package.json'), 'utf8'));
    return pkg.dependencies?.['@supabase/supabase-js'];
}

test('the supabase-js dependency is pinned EXACTLY (no caret, no tilde)', () => {
    const pin = declaredPin();
    assert.ok(pin, '@supabase/supabase-js is missing from packages/app/package.json');
    assert.match(
        pin,
        /^\d+\.\d+\.\d+$/,
        `@supabase/supabase-js is declared as "${pin}", which floats. The stubs in ` +
            'packages/app/src/lib/supabase-stubs/ mirror version-specific internals, ' +
            'so a range lets a patch bump break sign-in silently. Pin it exactly.' +
            REAUDIT,
    );
});

test('every stub names the version it was audited against, and they agree', () => {
    const pin = declaredPin();
    for (const file of STUBS) {
        const path = join(stubDir, file);
        assert.ok(
            existsSync(path),
            `${file} is missing from ${stubDir}. If the stubs were deliberately ` +
                'removed, delete the alias entries in packages/app/vite.config.ts and ' +
                'this test in the same commit — a half-removed stub is a landmine.',
        );
        const audited = readFileSync(path, 'utf8').match(
            /AUDITED AGAINST:\s*@supabase\/supabase-js\s+(\d+\.\d+\.\d+)/,
        )?.[1];
        assert.ok(
            audited,
            `${file} has no machine-readable "AUDITED AGAINST: @supabase/supabase-js ` +
                '<version>" line in its header. That line is this test\'s only way to ' +
                'know what the stub was written against; restore it.' +
                REAUDIT,
        );
        assert.equal(
            audited,
            pin,
            `${file} says it was audited against supabase-js ${audited}, but ` +
                `packages/app/package.json pins ${pin}.` +
                REAUDIT,
        );
    }
});

test('the INSTALLED supabase-js is the version the stubs were audited against', () => {
    const pin = declaredPin();
    // pnpm symlinks the real package under the consuming workspace package.
    const installedPkg = join(
        appDir,
        'node_modules/@supabase/supabase-js/package.json',
    );
    assert.ok(
        existsSync(installedPkg),
        `@supabase/supabase-js is not installed under packages/app/node_modules. ` +
            'Run `pnpm install`.',
    );
    const installed = JSON.parse(readFileSync(installedPkg, 'utf8')).version;
    assert.equal(
        installed,
        pin,
        `packages/app/package.json pins supabase-js ${pin} but ${installed} is ` +
            'installed — the lockfile and the pin have diverged, so the stubs are ' +
            'impersonating a library nobody audited.' +
            REAUDIT,
    );
});

// -----------------------------------------------------------------------------
// ANTI-VACUITY. The three rows above all pass if the alias silently stops
// existing — at which point the real packages come back, the shell regrows, and
// nothing here notices. This row pins the wiring itself.
// -----------------------------------------------------------------------------

test('vite.config.ts still aliases BOTH sub-clients at the stubs', () => {
    const config = readFileSync(join(appDir, 'vite.config.ts'), 'utf8');
    for (const [specifier, file] of [
        ['@supabase/realtime-js', 'realtime-js.ts'],
        ['@supabase/storage-js', 'storage-js.ts'],
    ]) {
        assert.match(
            config,
            new RegExp(`'${specifier}':[\\s\\S]{0,200}?supabase-stubs/${file}`),
            `packages/app/vite.config.ts no longer aliases ${specifier} to ` +
                `src/lib/supabase-stubs/${file}. Without the alias the real package ` +
                'returns to the student shell and every guard in this file passes ' +
                'while guarding nothing. If the stub was retired on purpose, remove ' +
                'the stub file, this test, and the absence rows in ' +
                'scripts/perf-budgets.mjs together.',
        );
    }
});
