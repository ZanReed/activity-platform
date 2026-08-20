#!/usr/bin/env node
// =============================================================================
// verify-local.mjs — "would CI's check job pass?", as one command
// -----------------------------------------------------------------------------
// WHY THIS EXISTS (DX review 2026-08-20, finding D3). CI's `check` job gates on
// EIGHT things. README's "Common commands" documented FOUR of them as runnable
// commands — typecheck, lint, test, build. It lists the two bundle scripts but
// never says CI DIFFS their output, and it does not mention the perf budgets or
// the budget script tests at all. (A ninth gate, the print lane, lives in a
// separate job and had no local script until this change either.) So the honest
// sequence for a contributor was: run the documented commands, see green, push,
// and learn the rest of the definition of done from a red run — i.e. from a
// YAML file. That is the failure this script removes: after it, "green locally"
// and "green in CI's check job" mean the same thing.
//
// THE GATES ARE CI'S, IN CI'S ORDER, and the build env is READ FROM ci.yml
// rather than retyped. That last part is load-bearing. `VITE_SUPABASE_URL` is
// inlined into the bundle at build time and already lives in three places that
// must agree (e2eOrigins.ts, playwright.config.ts, ci.yml), with
// scripts/tests/e2e-origins.test.mjs holding them together. A fourth hand-typed
// copy here would be a new drift source in the very script whose job is parity
// — so this reads ci.yml, which that guard already pins to the constant.
//
// WHAT IT DELIBERATELY DOES NOT COVER: the browser jobs (print-gates,
// perf-gates and the student/sw/a11y lanes) and the integration lane. They need
// Chromium, a built app and — for integration — Docker, so folding them in
// would make the everyday command slow enough to skip, which is how a
// verification command stops being run at all. They are NAMED in the output
// instead of silently omitted: a verify command that quietly covers less than
// CI would recreate exactly the problem it was written to fix.
//
// ZERO DEPENDENCIES (root-script rule): node: builtins only.
// =============================================================================

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const bail = process.argv.includes('--bail');

// ---- The build env, derived from ci.yml (never retyped) ---------------------
// Same extraction e2e-origins.test.mjs uses, for the same reason: the value is
// baked into the bundle at build time and no type checker reads yaml.
function ciBuildEnv() {
    const ci = readFileSync(join(repo, '.github/workflows/ci.yml'), 'utf8');
    const url = ci.match(/VITE_SUPABASE_URL:\s*(\S+)/)?.[1];
    const key = ci.match(/VITE_SUPABASE_ANON_KEY:\s*(\S+)/)?.[1];
    if (!url || !key) {
        console.error(
            '\nCould not read the build env out of .github/workflows/ci.yml.\n' +
                '  Expected `VITE_SUPABASE_URL:` and `VITE_SUPABASE_ANON_KEY:` in the\n' +
                '  Build step. If they moved or were renamed, update this extraction —\n' +
                '  it exists so the value is never retyped here (see the header).\n',
        );
        process.exit(2);
    }
    return { VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: key };
}

// A build that uses YOUR .env.local instead of CI's pinned env is the
// `env-masked-local-verification` pitfall: a code path reading import.meta.env
// directly passes locally (because .env.local supplies the value) and dies in
// CI, which runs env-less. Building against CI's env is what makes this script
// able to see that class at all.
const BUILD_ENV = ciBuildEnv();

/** Mirrors the `check` job in .github/workflows/ci.yml, step for step.
 *  `ci` is the STEP NAME, not a line number — names survive edits above them
 *  and can be grepped straight out of the yaml; line numbers rot the first
 *  time anyone adds a comment. */
const GATES = [
    { name: 'typecheck', cmd: 'pnpm typecheck', ci: '"Typecheck"' },
    { name: 'lint', cmd: 'pnpm lint', ci: '"Lint"' },
    { name: 'test', cmd: 'pnpm test', ci: '"Test"' },
    { name: 'build', cmd: 'pnpm build', env: BUILD_ENV, ci: '"Build"' },
    {
        name: 'perf budgets',
        cmd: 'node scripts/check-perf-budget.mjs',
        ci: '"Performance budgets"',
    },
    {
        name: 'budget script tests',
        cmd: 'node --test scripts/tests/*.test.mjs',
        ci: '"Budget script tests"',
    },
    {
        name: 'viewer bundle drift',
        cmd:
            'pnpm bundle:viewer-server >/dev/null && ' +
            'git diff --exit-code -- supabase/functions/_shared/viewer-server.bundle.js',
        ci: '"Viewer server bundle is up to date"',
        drift: true,
    },
    {
        name: 'grading bundle drift',
        cmd:
            'pnpm bundle:grading-server >/dev/null && ' +
            'git diff --exit-code -- supabase/functions/_shared/grading-server.bundle.js',
        ci: '"Grading server bundle is up to date"',
        drift: true,
    },
];

const secs = (ms) => `${(ms / 1000).toFixed(1)}s`;

console.log('');
console.log("Verifying against CI's `check` job");
console.log('-'.repeat(72));

const results = [];
for (const gate of GATES) {
    const started = Date.now();
    process.stdout.write(`  ${gate.name.padEnd(22)} … `);
    const run = spawnSync(gate.cmd, {
        cwd: repo,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, ...(gate.env ?? {}) },
    });
    const ms = Date.now() - started;
    const ok = run.status === 0;
    results.push({ ...gate, ok, ms, output: `${run.stdout ?? ''}${run.stderr ?? ''}` });
    console.log(`${ok ? 'ok  ' : 'FAIL'}  ${secs(ms).padStart(7)}`);
    if (!ok && bail) break;
}

const failures = results.filter((r) => !r.ok);
const total = results.reduce((sum, r) => sum + r.ms, 0);

console.log('-'.repeat(72));

if (failures.length === 0) {
    const skipped = GATES.length - results.length;
    console.log(
        `All ${results.length} check-job gates pass${skipped ? ` (${skipped} not run)` : ''} in ${secs(total)}.`,
    );
    console.log('');
    // Named, not silently omitted — see the header.
    console.log('NOT covered here (separate CI jobs, they need a browser):');
    console.log('  print-gates   pnpm --filter @activity/app test:e2e:print');
    console.log('  perf-gates    test:e2e:perf · test:e2e:sw · test:e2e:student · test:e2e:a11y');
    console.log('  integration   test:e2e:integration (needs Docker + a local Supabase stack)');
    console.log('');
    process.exit(0);
}

console.error('');
console.error(`${failures.length} of ${results.length} gate(s) FAILED:`);
console.error('');
for (const f of failures) {
    console.error(`  ${f.name}  (ci.yml check job, step ${f.ci})`);
    console.error(`      re-run just this one:  ${f.cmd.split(' >/dev/null')[0]}`);
    if (f.drift) {
        // The drift gates REGENERATE before diffing, so a failure has already
        // written the correct bytes into the working tree. Say so — otherwise
        // the obvious next move looks like "figure out how to regenerate".
        console.error(
            '      NOTE: the bundle has already been regenerated in your working tree.',
        );
        console.error(
            '            The fix is to COMMIT it, in the same commit as the change that',
        );
        console.error(
            '            moved it (CLAUDE.md: schema/sanitize/grading edits owe a bundle).',
        );
    }
    // A drift gate's output is `git diff` over a GENERATED bundle — thousands of
    // columns of base64 sourcemap and not one actionable line. The NOTE above
    // already says the whole fix. (Found by forcing this failure once rather
    // than trusting the formatting: the first run printed 81KB of base64.)
    if (!f.drift) {
        const tail = f.output
            .trimEnd()
            .split('\n')
            .slice(-12)
            // Cap width too — no gate's output is worth a wrapped blob.
            .map((line) => (line.length > 200 ? `${line.slice(0, 200)}…` : line));
        if (tail.length > 0 && tail[0] !== '') {
            console.error('      last output:');
            for (const line of tail) console.error(`        ${line}`);
        }
    }
    console.error('');
}
console.error('The gate list mirrors .github/workflows/ci.yml\'s `check` job.');
console.error('If a gate is added there, add it here too — this script is the');
console.error('only place the definition of done is runnable in one command.');
console.error('');
process.exit(1);
