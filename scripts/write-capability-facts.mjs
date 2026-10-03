#!/usr/bin/env node
// =============================================================================
// write-capability-facts.mjs — publish the capability registry's derived half
// -----------------------------------------------------------------------------
// Writes docs/capability-facts.json from packages/app/src/lib/capabilityFacts.ts
// (read through esbuild so the TS source is the source, the same way
// write-catalogue-prompt.mjs reads its constant).
//
//   pnpm facts:capabilities
//
// The file is committed. The curriculum repo pins a copy of it and gates its
// graph's derived capability fields against the pin (B14). capabilityFacts.test.ts
// fails if the committed file drifts from the module, so a stale file cannot
// reach `main` and be pinned.
//
// When a run CHANGES the file, a capability shipped or changed shape: the
// curriculum side needs a pin-bump PR with a pre-merge notice (CLAUDE.md).
// =============================================================================

import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const CAPABILITY_FACTS_DOC = 'docs/capability-facts.json';

/** The rendered file text, computed by the TS module. */
export async function readCapabilityFacts() {
    const bundled = await build({
        entryPoints: [resolve(repo, 'packages/app/src/lib/capabilityFacts.ts')],
        bundle: true,
        format: 'esm',
        platform: 'node',
        write: false,
        logLevel: 'silent',
    });
    const code = bundled.outputFiles[0].text;
    const mod = await import(
        `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
    );
    const problems = mod.capabilityFactsProblems();
    if (problems.length) {
        for (const problem of problems) console.error(`FATAL  ${problem}`);
        process.exit(2);
    }
    return mod.renderCapabilityFacts();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
    const next = await readCapabilityFacts();
    const path = resolve(repo, CAPABILITY_FACTS_DOC);
    const current = await readFile(path, 'utf8').catch(() => null);
    await writeFile(path, next, 'utf8');
    console.log(
        current === next
            ? `${CAPABILITY_FACTS_DOC} — unchanged`
            : `${CAPABILITY_FACTS_DOC} — written (${next.length} bytes). A changed file means ` +
                  'the curriculum side needs a pin-bump PR with a pre-merge notice.',
    );
}
