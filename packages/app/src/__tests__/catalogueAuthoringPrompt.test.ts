// =============================================================================
// catalogueAuthoringPrompt.test.ts — anti-drift guard for the catalogue prompt
// -----------------------------------------------------------------------------
// The curriculum builder is retiring its hand-kept copy of the format rules and
// pointing at this prompt instead. That makes the prompt load-bearing in a way
// a prose file is not: if it drifts from the parser, every file drafted against
// it is wrong, and nobody finds out until an import run.
//
// So the prompt is bound three ways, in the shape the teacher prompt's guard
// already established:
//   1. the SHARED half is included verbatim, never restated (no second copy);
//   2. every catalogue key it teaches is accepted by the REAL parser;
//   3. the rules it exists to enforce — no `unit:`, no blank inside maths — are
//      asserted against converter behaviour, not against the prompt's own text.
//
// The third is the one that matters. A prompt that merely SAYS the right thing
// is a declaration; this file checks that what it says is what the code does.
// =============================================================================

import { beforeAll, describe, expect, it } from 'vitest';
import {
    getMarkdownImporter,
    type MarkdownImporter,
} from '../lib/markdownToTiptap';
import { MARKDOWN_IMPORT_AI_PROMPT } from '../lib/markdownImportPrompt';
import { CATALOGUE_AUTHORING_PROMPT } from '../lib/catalogueAuthoringPrompt';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PROMPT_DOC = readFileSync(
    fileURLToPath(
        new URL('../../../../docs/catalogue-authoring-prompt.md', import.meta.url),
    ),
    'utf8',
);

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});

describe('the published doc IS the constant', () => {
    it('docs/catalogue-authoring-prompt.md embeds it byte-for-byte', () => {
        // The promise made to the curriculum builder: one published file it can
        // point at instead of keeping its own copy. A doc that has drifted from
        // the constant is worse than no doc — it is a copy again, wearing the
        // label of the thing that replaced copies.
        const fence = /```text\n([\s\S]*?)\n```/.exec(PROMPT_DOC);
        expect(fence, 'expected a ```text block in the doc').not.toBeNull();
        expect(fence![1]).toBe(CATALOGUE_AUTHORING_PROMPT);
    });

    it('says how to regenerate itself', () => {
        expect(PROMPT_DOC).toMatch(/pnpm prompt:catalogue/);
    });
});

describe('the shared half is included, not copied', () => {
    it('contains the teacher prompt verbatim', () => {
        // The single-source property. If someone "tidies" this into a restated
        // copy, the copy starts drifting the day the format changes — which is
        // the exact failure the builder is retiring its own copy to escape.
        expect(CATALOGUE_AUTHORING_PROMPT).toContain(MARKDOWN_IMPORT_AI_PROMPT);
    });

    it('adds the catalogue rules after it', () => {
        expect(CATALOGUE_AUTHORING_PROMPT.length).toBeGreaterThan(
            MARKDOWN_IMPORT_AI_PROMPT.length,
        );
        expect(CATALOGUE_AUTHORING_PROMPT).toMatch(/CATALOGUE FILES/);
    });
});

describe('every catalogue key it teaches is one the parser accepts', () => {
    // Bound to behaviour: each key is fed through the real converter and must
    // not come back as unrecognized. A prompt teaching a key the parser dropped
    // is worse than no prompt — it produces confidently wrong files.
    const cases: Array<[string, string]> = [
        ['key', 'key: act.rate.unit-rate'],
        ['skill', 'skill: rate.unit-rate'],
        ['supporting_skills', 'supporting_skills: ratio.equivalent-ratios'],
    ];

    for (const [name, line] of cases) {
        it(`\`${name}:\` is accepted`, () => {
            expect(CATALOGUE_AUTHORING_PROMPT).toContain(`${name}:`);
            const { warnings } = convert('```meta\ntitle: T\n' + line + '\n```');
            expect(warnings.join(' ')).not.toMatch(/isn.t a recognized key/i);
        });
    }

    it('teaches the x_ namespace, and the parser really ignores it', () => {
        expect(CATALOGUE_AUTHORING_PROMPT).toMatch(/x_/);
        const { warnings, meta } = convert(
            '```meta\ntitle: T\nx_review_skills: ratio.equivalent\n```',
        );
        expect(warnings.join(' ')).toBe('');
        expect(meta?.reservedKeys).toEqual(['x_review_skills']);
    });

    it('does NOT teach `skills:` — the key that does not exist', () => {
        expect(CATALOGUE_AUTHORING_PROMPT).toMatch(/There is no `skills:` key/);
    });
});

describe('the two rules the prompt exists to enforce', () => {
    it('never teaches `unit:`, so the override report stays meaningful', () => {
        // An assistant emits a meta fence on every reply. If this prompt taught
        // `unit:`, every drafted file would override its chain's registered
        // title and the report would fire on 100% of the catalogue.
        const catalogueOnly = CATALOGUE_AUTHORING_PROMPT.slice(
            MARKDOWN_IMPORT_AI_PROMPT.length,
        );
        expect(catalogueOnly).not.toMatch(/^\s*-?\s*unit:/m);
        expect(catalogueOnly).toMatch(/DO NOT WRITE A unit: KEY/);
    });

    it('warns about blanks inside maths, and the converter really does warn', () => {
        // The prompt's claim and the parser's behaviour, checked together. This
        // is the pair that would otherwise rot: the prompt keeps saying it long
        // after a refactor stopped doing it.
        expect(CATALOGUE_AUTHORING_PROMPT).toMatch(/NEVER PUT A BLANK INSIDE MATHS/);
        const { warnings } = convert('Find $k = {{=8}}$ today.');
        expect(warnings.join(' ')).toMatch(/inside the equation/i);
    });

    it('teaches \\gap{} as the in-maths alternative, and it still works', () => {
        expect(CATALOGUE_AUTHORING_PROMPT).toMatch(/\\gap\{answer\}/);
        const { warnings } = convert('$k = \\gap{8}$');
        expect(warnings.join(' ')).toBe('');
    });
});
