// =============================================================================
// e2e-origins.test.mjs — the two e2e Supabase origins must stay two
// -----------------------------------------------------------------------------
// This repo runs two kinds of e2e lane that want OPPOSITE things from the
// address the bundle is built against:
//
//   * the STUB lanes (student · sw · a11y) need it UNREACHABLE — their offline
//     rows prove their behavior by getting a real connection refusal from it;
//   * the INTEGRATION lane needs the REAL local stack at it.
//
// Both were `http://127.0.0.1:54321` until 2026-08-18, so the sw lane's two
// offline rows were green ONLY on machines with no local stack running. CI is
// such a machine; a developer working on the integration lane is not. With
// `supabase start` up, Kong answered the "unreachable" origin with a genuine
// 401 ("Expected 3 parts in JWT; got 1" — the harness's fake access_token is
// deliberately not a JWT), the viewer classified that as `unauthenticated`,
// and both rows failed on a locator timeout that named nothing.
//
// The value is baked into the bundle at BUILD time, so it lives in a place a
// test can only reach as text: .github/workflows/ci.yml. This file is what
// keeps the yaml, the config and the constant from drifting — a
// three-way agreement no type checker can see.
//
// ZERO DEPENDENCIES (root-script rule): node:fs + node:path only.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const app = join(repo, 'packages/app');

/** The one home of each origin. Nothing else may spell either literal. */
const STUB_HOME = 'packages/app/e2e/helpers/e2eOrigins.ts';
const INTEGRATION_HOME = 'packages/app/e2e/integration/contract.ts';

const read = (p) => readFileSync(join(repo, p), 'utf8');

function constantIn(file, name) {
    const src = read(file);
    const matches = [
        ...src.matchAll(
            new RegExp(`export const ${name} =\\s*\\n?\\s*'([^']+)'`, 'g'),
        ),
    ].map((m) => m[1]);
    // Anti-vacuity: a renamed or reformatted constant must fail here, not
    // silently compare undefined against undefined two assertions later.
    assert.equal(
        matches.length,
        1,
        `expected exactly one \`export const ${name} = '…'\` in ${file}, found ` +
            `${matches.length}. If it moved or was reformatted, update this guard — ` +
            'it is the only thing holding the two e2e origins apart.',
    );
    return matches[0];
}

test('the stub-lane origin and the integration origin are DIFFERENT', () => {
    const stub = constantIn(STUB_HOME, 'STUB_LANE_SUPABASE_URL');
    const real = constantIn(INTEGRATION_HOME, 'LOCAL_SUPABASE_URL');
    assert.notEqual(
        stub,
        real,
        `both e2e lanes are pointed at ${stub}. The stub lanes need that origin ` +
            'to be UNREACHABLE (their offline rows are built on a connection ' +
            'refusal) and the integration lane needs a REAL stack there. Sharing ' +
            'one address means the sw lane goes red the moment anyone runs ' +
            '`supabase start` — which is exactly what happened before 2026-08-18. ' +
            `See ${STUB_HOME}.`,
    );
});

test('the stub-lane port is outside the Supabase CLI default range', () => {
    const port = Number(new URL(constantIn(STUB_HOME, 'STUB_LANE_SUPABASE_URL')).port);
    // API 54321 · DB 54322 · Studio 54323 · Inbucket/Mailpit 54324 ·
    // analytics 54327 · pooler 54329. A `supabase start` must never be able to
    // claim the stub lanes' address by default.
    const CLI_DEFAULTS = [54321, 54322, 54323, 54324, 54327, 54329];
    assert.ok(
        !CLI_DEFAULTS.includes(port),
        `the stub lanes are on port ${port}, which the Supabase CLI binds by ` +
            'default. Pick one outside [' + CLI_DEFAULTS.join(', ') + '] so the ' +
            'origin is dead BY CONSTRUCTION rather than by luck.',
    );
});

test("CI's build env matches the stub-lane origin (the bundle bakes it in)", () => {
    const stub = constantIn(STUB_HOME, 'STUB_LANE_SUPABASE_URL');
    const ci = read('.github/workflows/ci.yml');
    const inCi = ci.match(/VITE_SUPABASE_URL:\s*(\S+)/)?.[1];
    assert.ok(
        inCi,
        'no `VITE_SUPABASE_URL:` in .github/workflows/ci.yml. The stub lanes fake ' +
            'a session under the storage key supabase-js derives from that URL; an ' +
            'env-less build derives no key and every signed-in spec lands on the ' +
            'sign-in screen.',
    );
    assert.equal(
        inCi,
        stub,
        `ci.yml builds against ${inCi} but the lanes expect ${stub}. These drift ` +
            'silently — the build is where the value is inlined, and no type ' +
            `checker reads yaml. Update ci.yml, or ${STUB_HOME}, so they agree.`,
    );
});

test('neither origin literal is retyped outside its one home (P2)', () => {
    const stub = constantIn(STUB_HOME, 'STUB_LANE_SUPABASE_URL');
    const real = constantIn(INTEGRATION_HOME, 'LOCAL_SUPABASE_URL');

    /** Every .ts/.tsx under packages/app, minus build output. */
    function walk(dir, out = []) {
        for (const entry of readdirSync(dir)) {
            if (entry === 'node_modules' || entry === 'dist' || entry === 'test-results') {
                continue;
            }
            const full = join(dir, entry);
            if (statSync(full).isDirectory()) walk(full, out);
            else if (/\.tsx?$/.test(entry)) out.push(full);
        }
        return out;
    }

    const homes = new Set([STUB_HOME, INTEGRATION_HOME]);
    const offenders = [];
    for (const file of walk(app)) {
        const rel = relative(repo, file);
        if (homes.has(rel)) continue;
        const src = readFileSync(file, 'utf8');
        // The quoted literal only — a comment mentioning a port number is
        // documentation, not a second source of truth.
        for (const [label, value] of [['stub-lane', stub], ['integration', real]]) {
            if (src.includes(`'${value}'`) || src.includes(`"${value}"`)) {
                offenders.push(`${rel} retypes the ${label} origin ${value}`);
            }
        }
    }

    assert.deepEqual(
        offenders,
        [],
        'e2e origins must have exactly one home each and be IMPORTED everywhere ' +
            'else. A retyped copy is how these two came to collide in the first ' +
            `place:\n  ${offenders.join('\n  ')}\n` +
            `Import STUB_LANE_SUPABASE_URL from ${STUB_HOME} (or E2E_SUPABASE_URL ` +
            `from e2e/helpers/studentSession.ts), or LOCAL_SUPABASE_URL from ` +
            `${INTEGRATION_HOME}.`,
    );
});
