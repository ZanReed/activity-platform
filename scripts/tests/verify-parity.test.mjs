// =============================================================================
// verify-parity.test.mjs — `pnpm verify` must cover CI's whole check job
// -----------------------------------------------------------------------------
// scripts/verify-local.mjs exists so a contributor can ask "would CI pass?" in
// one command. That promise is only as good as the gate list inside it, and
// that list is HAND-MAINTAINED against .github/workflows/ci.yml — the exact
// shape the DX review flagged one file over (a set you must remember to join
// WILL eventually not be joined; serialize.ts's LABELED_BLOCK_TYPES is the
// sibling case). Shipping the mirror with only a cross-referencing comment
// holding it would have been the same defect, committed knowingly.
//
// So: every step in CI's `check` job that RUNS something is either represented
// in verify-local.mjs's GATES, or named in SETUP_STEPS below with a reason.
// Add a gate to CI and this test goes red until `pnpm verify` learns about it.
//
// THE FAILURE THIS PREVENTS is quiet and expensive: a verify command that
// covers 7 of 8 gates is worse than no verify command, because it is trusted.
// A contributor runs it, sees green, pushes, and hits the one gate it forgot —
// having been told by the tool that they were done.
//
// ZERO DEPENDENCIES (root-script rule): node:fs + node:path only.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p) => readFileSync(join(repo, p), 'utf8');

const CI = '.github/workflows/ci.yml';
const VERIFY = 'scripts/verify-local.mjs';

/**
 * Check-job steps that run something but are INFRASTRUCTURE, not gates — each
 * with the reason it cannot be a local gate. A new step must join GATES or this
 * list; it cannot silently be neither.
 */
const SETUP_STEPS = new Map([
    [
        'Install dependencies',
        'CI provisions a clean tree; locally the contributor already has one',
    ],
    // NOTE: "Upload built app" is deliberately NOT here. It is a `uses:` step
    // (actions/upload-artifact), so it never counts as a running step — and the
    // staleness check below caught this exemption as bogus on its first run,
    // which is the check earning its place.
]);

/** The `check:` job block, from its key to the next job at the same indent. */
function checkJobBlock() {
    const ci = read(CI);
    const start = ci.indexOf('\n  check:\n');
    assert.notEqual(
        start,
        -1,
        `no \`check:\` job in ${CI}. If the job was renamed, update this guard — ` +
            'it is what keeps `pnpm verify` honest about covering it.',
    );
    const rest = ci.slice(start + 1);
    // Next top-level job key (two-space indent, not a comment or a nested key).
    const next = rest.slice(1).search(/\n {2}[a-z][a-z0-9-]*:\n/);
    return next === -1 ? rest : rest.slice(0, next + 1);
}

/** Step names in the check job that carry a `run:` (i.e. execute something). */
function runningStepNames() {
    const block = checkJobBlock();
    const names = [];
    const steps = block.split(/\n {6}- (?=name:|uses:)/);
    for (const step of steps) {
        const name = step.match(/^name:\s*(.+)$/m)?.[1]?.trim();
        if (!name) continue;
        if (!/^\s{8}run:/m.test(step)) continue; // `uses:`-only steps do nothing local
        names.push(name);
    }
    return names;
}

/** The step names verify-local.mjs claims to mirror (its `ci:` fields). */
function verifiedStepNames() {
    const src = read(VERIFY);
    const names = [...src.matchAll(/ci:\s*'"([^"]+)"'/g)].map((m) => m[1]);
    // Anti-vacuity: if the field is renamed or reformatted, fail HERE rather
    // than comparing an empty list against the yaml and passing.
    assert.ok(
        names.length >= 4,
        `found only ${names.length} \`ci: '"…"'\` step names in ${VERIFY}. If the ` +
            'GATES shape changed, update this extraction — an empty match would ' +
            'otherwise make this whole guard vacuous.',
    );
    return names;
}

test('the check job really does run several gates (anti-vacuity)', () => {
    const running = runningStepNames();
    assert.ok(
        running.length >= 6,
        `parsed only ${running.length} running steps out of ${CI}'s check job. ` +
            'The yaml shape probably changed and this guard is now reading ' +
            'nothing — fix the parse before trusting a green run.',
    );
});

test('every check-job gate is covered by `pnpm verify` (or declared setup)', () => {
    const covered = new Set(verifiedStepNames());
    const uncovered = runningStepNames().filter(
        (name) => !covered.has(name) && !SETUP_STEPS.has(name),
    );

    assert.deepEqual(
        uncovered,
        [],
        'CI\'s `check` job has gate(s) that `pnpm verify` does not run:\n  ' +
            uncovered.join('\n  ') +
            `\nAdd them to GATES in ${VERIFY} so "green locally" keeps meaning ` +
            '"green in CI", or — if a step is infrastructure with no local ' +
            'equivalent — add it to SETUP_STEPS in this file WITH its reason. ' +
            'A verify command that silently covers less than CI is worse than ' +
            'none, because it is trusted.',
    );
});

test('`pnpm verify` claims no step the check job does not have', () => {
    const running = new Set(runningStepNames());
    const phantom = verifiedStepNames().filter((name) => !running.has(name));

    assert.deepEqual(
        phantom,
        [],
        `${VERIFY} mirrors step(s) that no longer exist in ${CI}'s check job:\n  ` +
            phantom.join('\n  ') +
            '\nA renamed or deleted CI step leaves the local gate pointing at ' +
            'nothing, and its failure message would name a step a reader cannot ' +
            'find. Update the `ci:` field, or drop the gate.',
    );
});

test('the setup exemptions are real steps, each with a reason', () => {
    // A stale exemption is how a gate gets permanently excused: the step is
    // renamed, the exemption stops matching anything, and nobody notices that
    // the new name is now silently uncovered by the test above.
    const running = new Set(runningStepNames());
    for (const [name, reason] of SETUP_STEPS) {
        assert.ok(
            running.has(name),
            `SETUP_STEPS exempts "${name}", which is not a running step in ` +
                `${CI}'s check job any more. Remove the stale exemption.`,
        );
        assert.ok(
            reason.length > 20,
            `SETUP_STEPS entry "${name}" needs a real reason, not a placeholder.`,
        );
    }
});
