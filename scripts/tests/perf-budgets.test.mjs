// =============================================================================
// scripts/tests/perf-budgets.test.mjs — the migration pin + config invariants
// -----------------------------------------------------------------------------
// Run: `node --test scripts/tests/` (wired into CI as its own step).
//
// THE POINT OF THE FIRST BLOCK (S8 ruling D8). S8 moved three Edge Function
// size ceilings out of their bundler scripts and into perf-budgets.mjs. Those
// ceilings are deploy-critical — the grading one exists because 1 MB of
// MathLive once reached the grading function through a barrel import — and
// nothing else in the system would notice if the migration fat-fingered a
// digit. CI's bundle-drift guards compare bundle CONTENT, not ceiling VALUES,
// so a ceiling silently raised from 1500 to 15000 would pass every existing
// check. These asserts are the only thing standing between a typo and a
// quietly-disabled deploy guard.
//
// Update a number here ONLY together with a deliberate, explained change to the
// budget itself. If this test fails, the question is never "what value makes it
// green" — it is "who changed the ceiling and why isn't it in the diff".
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    VIEWER_SERVER_MAX_KIB,
    GRADING_SERVER_MAX_KIB,
    CHUNK_LEDGER,
    SHELL_FORBIDDEN_MARKERS,
    ABSENT_FROM_BUILD,
    MARKS,
    TIMING_TARGET_MS,
    TIMING_CEILING_MULTIPLE,
    timingCeilingMs,
    stripAssetSpecifiers,
} from '../perf-budgets.mjs';

test('migrated ceilings still hold their pre-migration values (D8 pin)', () => {
    // Pre-migration source of truth, verbatim:
    //   bundle-viewer-server.mjs MAX_KIB              = 1500
    //   bundle-grading-server.mjs MAX_KIB             = 4000
    // (The renderer runtime's 40/60 KiB pair left this pin at S9 Drop 4 with
    // the renderer package — its bundle no longer exists to measure.)
    assert.equal(VIEWER_SERVER_MAX_KIB, 1500, 'read-API server bundle ceiling');
    assert.equal(GRADING_SERVER_MAX_KIB, 4000, 'grading server bundle ceiling');
});

test('every ledger row is complete and its marker is a real regex', () => {
    assert.ok(CHUNK_LEDGER.length > 0, 'an empty ledger guards nothing');
    for (const row of CHUNK_LEDGER) {
        assert.ok(row.name, 'ledger row needs a name');
        assert.ok(row.marker instanceof RegExp, `${row.name}: marker must be a RegExp`);
        assert.ok(
            typeof row.maxGzKiB === 'number' && row.maxGzKiB > 0,
            `${row.name}: needs a positive cap`,
        );
        // The "why" is not decoration: a cap without a reason is a cap the next
        // session raises casually. D5 chose one commented home precisely so
        // this stays true.
        assert.ok(row.why && row.why.length > 20, `${row.name}: needs a stated reason`);
    }
});

test('every absence row is complete, and its marker cannot cry wolf', () => {
    assert.ok(ABSENT_FROM_BUILD.length > 0, 'an empty absence list guards nothing');

    // The trap OV-8 named: the SURVIVING supabase-js still contains these
    // literals, and the app's own uploadImage sends an x-upsert header. An
    // absence marker that matches any of them fails on every correct build —
    // and the second time that happens, someone deletes the row instead of
    // reading it. So the rule ("markers come from library internals, never
    // package names") is enforced rather than merely written down.
    const SURVIVING_CODE = [
        `this.realtimeUrl = new URL("realtime/v1", baseUrl);`,
        `this.storageUrl = new URL("storage/v1", baseUrl);`,
        `channel(name, opts) { return this.realtime.channel(name, opts); }`,
        `headers: { apikey: k, 'x-upsert': 'false' }`,
        `import { StorageApiError, StorageClient } from "@supabase/storage-js";`,
        `export * from "@supabase/realtime-js"`,
    ].join('\n');

    for (const row of ABSENT_FROM_BUILD) {
        assert.ok(row.name, 'absence row needs a name');
        assert.ok(row.marker instanceof RegExp, `${row.name}: marker must be a RegExp`);
        assert.ok(row.why && row.why.length > 20, `${row.name}: needs a stated reason`);
        assert.equal(
            row.marker.test(SURVIVING_CODE),
            false,
            `${row.name}: the marker ${row.marker} matches code that legitimately ` +
                'SURVIVES the stubbing (supabase-js internals or the app itself), so ' +
                'the row would fail on a correct build. Pick a marker from the ' +
                "stubbed library's own internals instead.",
        );
    }
});

test('shell-forbidden markers mirror the ledger', () => {
    // The two halves are complements: the ledger caps each heavy payload where
    // it lives, the shell pin asserts none of them lives in the entry chunk. If
    // a payload is added to one and not the other, a library could be capped
    // while sitting inside the shell — passing both rows, guarding nothing.
    assert.deepEqual(
        SHELL_FORBIDDEN_MARKERS.map((m) => m.name).sort(),
        CHUNK_LEDGER.map((r) => r.name).sort(),
    );
});

test('timing ceiling is derived, not a second hand-written number (R1)', () => {
    assert.ok(TIMING_CEILING_MULTIPLE > 1, 'a ceiling at or below target would always fail');
    // Uncalibrated marks report null rather than a fabricated ceiling — the
    // perf lane must be able to tell "no baseline yet" from "baseline of 0".
    for (const mark of Object.values(MARKS)) {
        if (!(mark in TIMING_TARGET_MS)) continue;
        const target = TIMING_TARGET_MS[mark];
        if (target == null) {
            assert.equal(timingCeilingMs(mark), null, `${mark}: uncalibrated must be null`);
        } else {
            assert.equal(timingCeilingMs(mark), target * TIMING_CEILING_MULTIPLE);
        }
    }
});

test('mark names are namespaced and unique (R2 contract)', () => {
    const names = Object.values(MARKS);
    assert.equal(new Set(names).size, names.length, 'duplicate mark names');
    for (const n of names) {
        assert.match(n, /^student-interactive:/, `${n}: marks share one namespace`);
    }
});

// -----------------------------------------------------------------------------
// stripAssetSpecifiers — the helper the whole content-matching scheme rests on
// -----------------------------------------------------------------------------
// Verified against the real 2026-08-05 build: EVERY "mathlive"/"katex" hit in a
// clean entry chunk came from one of these two shapes. Without stripping, the
// shell purity pin fails on a correct build — and a pin that cries wolf is a
// pin someone deletes.

test('strips the module-preload map that names other chunks', () => {
    const src = '["assets/index-7OFlPHsg.js","assets/mathlive.min-C-PTW5EO.js"]';
    const out = stripAssetSpecifiers(src);
    assert.ok(!/MathfieldElement/.test(out));
    assert.ok(!/mathlive\.min/.test(out), 'chunk filename should be stripped');
});

test('strips dynamic import specifiers', () => {
    const src = 'return import("./katex-DkKDou_j.js").then(a=>a.default)';
    const out = stripAssetSpecifiers(src);
    assert.ok(!/katex-DkKDou_j/.test(out), 'import specifier should be stripped');
});

test('does NOT strip real library code', () => {
    // The other half of the contract: stripping must not be so aggressive that
    // it hides the very code the markers exist to find.
    const real = 'class MathfieldElement extends HTMLElement{}';
    assert.ok(/MathfieldElement/.test(stripAssetSpecifiers(real)));

    const katexReal = 'throw new ParseError("KaTeX parse error: "+msg)';
    assert.ok(/KaTeX parse error/.test(stripAssetSpecifiers(katexReal)));
});

test('a chunk that both names AND contains a library is still detected', () => {
    // The dangerous direction: if stripping removed too much, a chunk that
    // genuinely bundles MathLive AND references sibling chunks would read as
    // clean. Ledger caps would then measure nothing.
    const src =
        '["assets/mathlive.min-C-PTW5EO.js"];class MathfieldElement extends HTMLElement{}';
    assert.ok(/MathfieldElement/.test(stripAssetSpecifiers(src)));
});
