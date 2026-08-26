#!/usr/bin/env node
// =============================================================================
// write-catalogue-prompt.mjs — publish the catalogue-authoring prompt as a doc
// -----------------------------------------------------------------------------
// The curriculum builder is retiring the copy of the format rules it keeps by
// hand and pointing at a file this repo publishes instead. That copy is the one
// hand-carried sync in its whole system and the failure it names as its known
// weak point: when the platform's format changes, the copy has to be re-pasted
// or every file drafted after that is written to a format that moved.
//
// This script is the retirement. It bundles the prompt module, reads the
// constant, and writes docs/catalogue-authoring-prompt.md. The constant is
// itself a COMPOSITION of the teacher prompt plus the catalogue-only rules, so
// there is exactly one copy of the shared half in the repo and zero outside it.
//
//   pnpm prompt:catalogue
//
// The doc is committed, and packages/app/src/__tests__/catalogueAuthoringPrompt
// .test.ts fails if it drifts from the constant — the same shape as the two
// Edge Function bundle drift guards, and for the same reason: a generated
// artifact nobody checks is an artifact that silently goes stale.
// =============================================================================

import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const CATALOGUE_PROMPT_DOC = 'docs/catalogue-authoring-prompt.md';

/** The prompt constant, read through esbuild so the TS source is the source. */
export async function readPrompt() {
    const bundled = await build({
        entryPoints: [
            resolve(repo, 'packages/app/src/lib/catalogueAuthoringPrompt.ts'),
        ],
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
    return mod.CATALOGUE_AUTHORING_PROMPT;
}

/** The doc's text for a given prompt. Deterministic — no timestamp, so the
 *  diff shows prompt changes and nothing else. */
export function renderPromptDoc(prompt) {
    return [
        '# Catalogue authoring prompt',
        '',
        '<!--',
        '  GENERATED — do not hand-edit. Regenerate with `pnpm prompt:catalogue`.',
        '  Source: packages/app/src/lib/catalogueAuthoringPrompt.ts',
        '',
        '  This file exists so the curriculum builder can point at ONE published',
        '  source instead of keeping its own copy of the format rules. Editing it',
        '  by hand recreates exactly the drift it was published to end;',
        '  catalogueAuthoringPrompt.test.ts fails the build if it does.',
        '-->',
        '',
        'Paste everything inside the block below into the model that drafts',
        'catalogue activities. It contains the shared import format **and** the',
        'catalogue-only rules (`key:`, `skill:`, misconception bindings, the',
        '`x_` namespace, and the two prohibitions that leak answers if broken).',
        '',
        'The teacher-facing prompt in the app is deliberately different: it does',
        'not teach `key:` or any registry-validated id, because an assistant with',
        'no registry invents plausible ids and fragments the data they exist to',
        'aggregate.',
        '',
        '```text',
        prompt,
        '```',
        '',
    ].join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
    const prompt = await readPrompt();
    const path = resolve(repo, CATALOGUE_PROMPT_DOC);
    const next = renderPromptDoc(prompt);
    const current = await readFile(path, 'utf8').catch(() => null);
    await writeFile(path, next, 'utf8');
    console.log(
        current === next
            ? `${CATALOGUE_PROMPT_DOC} — unchanged`
            : `${CATALOGUE_PROMPT_DOC} — written (${next.length} bytes)`,
    );
}
