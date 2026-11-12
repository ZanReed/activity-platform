// =============================================================================
// playtest-guards.test.mjs — the local-stack playtest cannot reach production
// -----------------------------------------------------------------------------
// `pnpm playtest` signs in with passwords and seeds a database. Four things
// keep that harmless, and each is pinned here:
//
//   1. THE GATE: main.tsx loads the bar only behind
//      `import.meta.env.DEV && import.meta.env.MODE === 'playtest'`, and
//      nothing else in src/ imports the dev/ playtest modules.
//   2. THE BUILD: no production chunk carries the bar or the password. Reads
//      packages/app/dist, which `pnpm verify` and CI build before this file
//      runs; a missing dist FAILS (a skipped check would read as a pass, P3).
//   3. THE TARGET: the seed script refuses every non-local Supabase URL, and
//      .env.playtest names the local stack with the CLI's demo anon key — the
//      same key the integration lane's contract.ts pins (P4 cross-check).
//   4. THE ACCOUNTS: every playtest identity is on an RFC 2606 .example domain.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isLocalUrl, parseArgs, REPLAY_SUPABASE_URL } from '../playtest.mjs';

const ROOT = resolve(fileURLToPath(import.meta.url), '../../..');
const APP = join(ROOT, 'packages/app');
const ACCOUNTS = JSON.parse(readFileSync(join(APP, 'src/dev/playtestAccounts.json'), 'utf8'));

function walk(dir, out = []) {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) walk(p, out);
        else out.push(p);
    }
    return out;
}

test('1. main.tsx loads the playtest only behind the compile-time DEV && (playtest|replay) gate', () => {
    const main = readFileSync(join(APP, 'src/main.tsx'), 'utf8');
    const gate =
        /if \(import\.meta\.env\.DEV && \(import\.meta\.env\.MODE === 'playtest' \|\| import\.meta\.env\.MODE === 'replay'\)\) \{\s*void import\('\.\/dev\/mountPlaytest'\)/;
    assert.match(main, gate, 'the gate around the dynamic import changed shape — keep every term a compile-time constant');
    assert.equal(main.match(/dev\/mountPlaytest/g)?.length, 1, 'main.tsx must import the playtest exactly once, inside the gate');
});

test('1b. nothing outside src/dev imports the playtest modules', () => {
    const offenders = walk(join(APP, 'src'))
        .filter((f) => /\.(ts|tsx)$/.test(f))
        .filter((f) => !f.includes(`${join('src', 'dev')}/`) && !f.includes('__tests__') && !f.endsWith('main.tsx'))
        .filter((f) => /dev\/(mountPlaytest|PlaytestBar|playtestAccounts|playtestTraffic|playtestPeople|playtestScenario)/.test(readFileSync(f, 'utf8')))
        .map((f) => relative(APP, f));
    assert.deepEqual(offenders, []);
});

test('2. no production chunk carries the playtest bar or its password', () => {
    const assets = join(APP, 'dist/assets');
    assert.ok(existsSync(assets), 'packages/app/dist is missing — run `pnpm build` first (pnpm verify does)');
    // Mutation-tested 2026-11-12 (gate rewritten to always-true, production
    // build): playtest-bar-root, __playtest and the domain all fired. The
    // replay-only code cannot appear even then — bootPlaytest's own MODE check
    // drops it — so no replay string is listed here: it could never go red (P9).
    const markers = ['playtest-bar-root', ACCOUNTS.password, 'mountPlaytest', ACCOUNTS.domain, '__playtest'];
    const hits = [];
    for (const f of walk(assets).filter((p) => p.endsWith('.js'))) {
        const text = readFileSync(f, 'utf8');
        for (const m of markers) if (text.includes(m)) hits.push(`${relative(APP, f)}: ${m}`);
    }
    assert.deepEqual(hits, [], 'a production chunk names the playtest bar — the DEV/MODE gate stopped folding away');
});

test('3. the seed script refuses every non-local Supabase URL', () => {
    for (const ok of ['http://127.0.0.1:54321', 'http://localhost:54321', 'http://[::1]:54321']) {
        assert.equal(isLocalUrl(ok), true, ok);
    }
    for (const bad of [
        'https://abcdefghijkl.supabase.co',
        'http://127.0.0.1.evil.example:54321',
        'http://localhost.evil.example',
        '',
        'not a url',
    ]) {
        assert.equal(isLocalUrl(bad), false, bad);
    }
});

test('3b. .env.playtest is the local stack with the demo anon key the integration lane pins', () => {
    const env = readFileSync(join(APP, '.env.playtest'), 'utf8');
    const url = env.match(/^VITE_SUPABASE_URL=(.*)$/m)?.[1];
    const key = env.match(/^VITE_SUPABASE_ANON_KEY=(.*)$/m)?.[1];
    assert.ok(url && isLocalUrl(url), `.env.playtest URL must be local, got ${url}`);
    const contract = readFileSync(join(APP, 'e2e/integration/contract.ts'), 'utf8');
    const laneUrl = contract.match(/LOCAL_SUPABASE_URL\s*=\s*'([^']+)'/)?.[1];
    const laneKey = contract.match(/LOCAL_ANON_KEY\s*=\s*'([^']+)'/)?.[1];
    assert.ok(laneUrl && laneKey && key, 'a pattern missed — two undefineds must not compare equal (P3)');
    assert.equal(url, laneUrl);
    assert.equal(key, laneKey);
});

test('3c. parseArgs: --no-reset never seeds, --seed-only never serves, unknown flags throw', () => {
    assert.deepEqual(
        (({ reset, seed, serve }) => ({ reset, seed, serve }))(parseArgs([])),
        { reset: true, seed: true, serve: true },
    );
    assert.equal(parseArgs(['--no-reset']).seed, false);
    assert.equal(parseArgs(['--seed-only']).serve, false);
    assert.throws(() => parseArgs(['--prod']), /Unknown argument/);
});

test('4. every playtest identity is on an RFC 2606 .example domain', () => {
    assert.match(ACCOUNTS.domain, /\.example$/);
    const people = [ACCOUNTS.teacher, ...ACCOUNTS.students];
    assert.ok(people.length >= 2);
    for (const p of people) assert.ok(p.email.endsWith(`@${ACCOUNTS.domain}`), p.email);
    assert.equal(new Set(people.map((p) => p.key)).size, people.length, 'keys must be unique');
});

test('5. replay points at an address nothing listens on — the e2e stub lanes\' dead port', () => {
    const env = readFileSync(join(APP, '.env.replay'), 'utf8');
    const url = env.match(/^VITE_SUPABASE_URL=(.*)$/m)?.[1];
    const origins = readFileSync(join(APP, 'e2e/helpers/e2eOrigins.ts'), 'utf8');
    const dead = origins.match(/STUB_LANE_SUPABASE_URL\s*=\s*'([^']+)'/)?.[1];
    assert.ok(url && dead, 'a pattern missed (P3)');
    assert.equal(url, dead);
    assert.equal(REPLAY_SUPABASE_URL, dead, 'scripts/playtest.mjs --replay must set the same dead address');
    assert.equal(parseArgs(['--replay']).seed, false, '--replay must never seed');
});

test('6. no saved scenario carries a password or a sign-in exchange', () => {
    const dir = join(APP, 'playtest-scenarios');
    if (!existsSync(dir)) return;
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.json'))) {
        const text = readFileSync(join(dir, f), 'utf8');
        assert.ok(!text.includes(ACCOUNTS.password), `${f} contains the playtest password`);
        const scenario = JSON.parse(text);
        for (const p of scenario.people) {
            assert.ok(p.email.endsWith(`@${ACCOUNTS.domain}`), `${f}: ${p.email} is not a playtest account`);
            assert.equal(p.session.refresh_token ?? null, null, `${f}: ${p.email} carries a refresh token`);
            const claims = JSON.parse(Buffer.from(String(p.session.access_token).split('.')[1], 'base64url').toString());
            assert.ok(isLocalUrl(claims.iss), `${f}: ${p.email}'s token was issued by ${claims.iss}, not the local stack`);
        }
        for (const e of scenario.entries) {
            assert.ok(!/^\/auth\/v1\/(token|signup|recover|otp)/.test(e.path), `${f} recorded ${e.path}`);
        }
    }
});
