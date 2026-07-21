// =============================================================================
// importFormatRegistry.test.ts — anti-drift guard binding the registry to reality
// -----------------------------------------------------------------------------
// importFormatRegistry.ts is the machine-readable index of the import surface.
// This test makes it TRUE by binding it four ways so it can't silently drift
// from the code or the docs:
//
//   registry ↔ parser (source scan) — every fence the parser DISPATCHES and
//       every `options:` literal it accepts is declared in the registry, and
//       vice-versa. This is the B+ guard: an option added to the parser but not
//       the registry (the exact `no-solution-correct` / `no-builtin-feedback`
//       case the capability inventory found) turns this red.
//   registry ↔ converter (behavioral) — each fence's minimal `example` actually
//       imports to its `blockType` with no warning; each declared option is
//       accepted (no "unknown option"); each blank modifier's example imports a
//       `blank` node.
//   registry ↔ prompt + doc — every fence tag and option appears in the AI
//       prompt and the human doc, so a real capability can't go untaught.
//
// Blank-modifier PROMPT coverage (the distinct sigils) is bound separately by
// markdownImportPrompt.test.ts's CLAIMS; here blanks get behavioural coverage.
// =============================================================================

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import type { JSONContent } from '@tiptap/react';
import {
    getMarkdownImporter,
    type MarkdownImporter,
} from '../lib/markdownToTiptap';
import { MARKDOWN_IMPORT_AI_PROMPT } from '../lib/markdownImportPrompt';
import { FENCES, BLANK_MODIFIERS } from '../lib/importFormatRegistry';

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});

const DOC = readFileSync(
    fileURLToPath(
        new URL('../../../../docs/markdown-import-format.md', import.meta.url),
    ),
    'utf8',
);
const PARSER_SRC = readFileSync(
    fileURLToPath(new URL('../lib/markdownToTiptap.ts', import.meta.url)),
    'utf8',
);

function flatten(blocks: JSONContent[]): JSONContent[] {
    const out: JSONContent[] = [];
    const walk = (n: JSONContent) => {
        out.push(n);
        (n.content ?? []).forEach(walk);
    };
    blocks.forEach(walk);
    return out;
}
const hasType = (blocks: JSONContent[], type: string): boolean =>
    flatten(blocks).some((n) => n.type === type);

const fence = (tag: string, body: string): string =>
    '```' + tag + '\n' + body + '\n```';

// What the parser ACTUALLY recognizes, scraped from its source. Fence dispatch
// is `(node.token.info ?? '').trim() === '<tag>'`; each option is `opt === '<x>'`.
const parserFenceTags = [
    ...PARSER_SRC.matchAll(/node\.token\.info.*?=== '(\w+)'/g),
].map((m) => m[1]!);
const parserOptionLiterals = [
    ...PARSER_SRC.matchAll(/\bopt === '([a-z-]+)'/g),
].map((m) => m[1]!);

const registryOptions = new Set(FENCES.flatMap((f) => f.options ?? []));

// =============================================================================
// registry ↔ parser (source scan) — the B+ undocumented-capability guard
// =============================================================================

describe('registry ↔ parser (source scan)', () => {
    it('the registry lists exactly the fences the parser dispatches', () => {
        expect(new Set(parserFenceTags)).toEqual(new Set(FENCES.map((f) => f.tag)));
    });

    it('no option the parser accepts is missing from the registry', () => {
        const missing = [...new Set(parserOptionLiterals)].filter(
            (o) => !registryOptions.has(o),
        );
        expect(
            missing,
            `parser accepts these options but the registry omits them: ${missing.join(', ')}`,
        ).toEqual([]);
    });

    it('every registry option is one the parser actually accepts', () => {
        const parserOpts = new Set(parserOptionLiterals);
        const notReal = [...registryOptions].filter((o) => !parserOpts.has(o));
        expect(
            notReal,
            `registry lists options the parser rejects: ${notReal.join(', ')}`,
        ).toEqual([]);
    });
});

// =============================================================================
// registry ↔ converter (behavioral)
// =============================================================================

describe('registry ↔ converter (behavioral)', () => {
    it.each(FENCES)(
        '$tag: the example imports to $blockType with no warnings',
        (f) => {
            const { blocks, warnings } = convert(fence(f.tag, f.example));
            expect(
                hasType(blocks, f.blockType),
                `${f.tag} example did not produce ${f.blockType}`,
            ).toBe(true);
            expect(warnings).toEqual([]);
        },
    );

    const optionCases = FENCES.flatMap((f) =>
        (f.options ?? []).map((opt) => ({ tag: f.tag, example: f.example, opt })),
    );
    it.each(optionCases)(
        '$tag accepts option "$opt" (no unknown-option warning)',
        ({ tag, example, opt }) => {
            const { warnings } = convert(
                fence(tag, example + '\noptions: ' + opt),
            );
            expect(warnings.some((w) => /unknown option/i.test(w))).toBe(false);
        },
    );

    it.each(BLANK_MODIFIERS)('blank modifier $syntax imports a blank node', (m) => {
        expect(hasType(convert(m.example).blocks, 'blank')).toBe(true);
    });
});

// =============================================================================
// registry ↔ prompt + doc (documented)
// =============================================================================

describe('registry ↔ prompt + doc (documented)', () => {
    it.each(FENCES)('$tag fence is taught in the prompt and the doc', (f) => {
        const fenced = '```' + f.tag;
        expect(MARKDOWN_IMPORT_AI_PROMPT).toContain(fenced);
        expect(DOC).toContain(fenced);
    });

    const optionCases = FENCES.flatMap((f) =>
        (f.options ?? []).map((opt) => ({ tag: f.tag, opt })),
    );
    it.each(optionCases)('$tag option "$opt" is named in the prompt', ({ opt }) => {
        expect(MARKDOWN_IMPORT_AI_PROMPT).toContain(opt);
    });
});
