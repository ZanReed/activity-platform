// =============================================================================
// check-e2e-wire.test.mjs — the live check script speaks the server's wire
// -----------------------------------------------------------------------------
// scripts/verify-check-e2e.js is pasted into a browser console, so it cannot
// import CHECK_WIRE_VERSION and spells the number itself (policy P2: a copy of
// a production constant needs a bond). It said 2 from wire v3 (2026-09) until
// 2026-11-28, so every row past C1 failed against the deployed function, and
// nothing noticed because nothing runs it on a schedule.
//
// Also pins the key: the server has refused a request without a UUID
// idempotency key since review B4, so the script must mint one per request.
//
// ZERO DEPENDENCIES (root-script rule): node:fs + node:path only.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p) => readFileSync(join(repo, p), 'utf8');

function onlyMatch(src, re, what) {
    const m = [...src.matchAll(re)];
    assert.equal(m.length, 1, `expected exactly one ${what}, found ${m.length}; update this guard if it moved`);
    return m[0][1];
}

test('verify-check-e2e.js sends the wire version the server accepts', () => {
    const server = onlyMatch(
        read('packages/viewer/src/check/wire.ts'),
        /export const CHECK_WIRE_VERSION = (\d+);/g,
        '`export const CHECK_WIRE_VERSION = N;` in wire.ts',
    );
    const script = read('scripts/verify-check-e2e.js');
    const sent = onlyMatch(script, /const WIRE_VERSION = (\d+);/g, '`const WIRE_VERSION = N;` in the script');
    assert.equal(sent, server, 'verify-check-e2e.js WIRE_VERSION must equal CHECK_WIRE_VERSION');
    // The request body must use the constant (C4's deliberate 99 is the one literal).
    assert.match(script, /wireVersion: WIRE_VERSION,/, 'baseBody must send wireVersion: WIRE_VERSION');
});

test('verify-check-e2e.js mints a UUID key for every request', () => {
    const script = read('scripts/verify-check-e2e.js');
    assert.match(script, /idempotencyKey: crypto\.randomUUID\(\),/, 'baseBody must default the key to crypto.randomUUID()');
    assert.doesNotMatch(script, /e2e-idem-/, 'the old non-UUID replay key is refused by the server');
});
