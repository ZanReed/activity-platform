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

// The first `definition` mark anywhere in the imported blocks. The ```definitions
// fence is proved through this — it emits no blocks of its own.
const findDefinitionMark = (
    blocks: JSONContent[],
): { attrs?: Record<string, unknown> } | null => {
    for (const node of flatten(blocks)) {
        for (const mark of (node.marks ?? []) as {
            type?: string;
            attrs?: Record<string, unknown>;
        }[]) {
            if (mark.type === 'definition') return mark;
        }
    }
    return null;
};

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
            // The definitions fence contributes NO blocks anywhere — its
            // content reaches the document only through a [[term]] mark, so
            // probe it by referencing the term from a body paragraph.
            if (f.definitions) {
                const result = convert(
                    fence(f.tag, f.example) + `\n\nThe [[${f.probeTerm}]] here.`,
                );
                const mark = findDefinitionMark(result.blocks);
                expect(
                    mark,
                    `${f.tag} example did not produce a resolvable [[${f.probeTerm}]] mark`,
                ).not.toBeNull();
                expect(
                    hasType(
                        (mark?.attrs?.content ?? []) as JSONContent[],
                        f.blockType,
                    ),
                    `${f.tag} definition content did not include ${f.blockType}`,
                ).toBe(true);
                expect(result.warnings).toEqual([]);
                return;
            }
            // The meta fence contributes NO blocks anywhere — not even inside
            // a mark. Its example must land every key it names in
            // ImportResult.meta, and must leave the body untouched.
            if (f.meta) {
                const result = convert(fence(f.tag, f.example));
                expect(result.blocks).toEqual([]);
                expect(result.referencePanel).toBeUndefined();
                expect(
                    result.meta,
                    `${f.tag} example produced no ImportResult.meta`,
                ).toBeDefined();
                expect(Object.keys(result.meta ?? {}).length).toBeGreaterThan(0);
                expect(result.warnings).toEqual([]);
                return;
            }
            const result = convert(fence(f.tag, f.example));
            // A panel fence routes its blocks to the referencePanel side
            // channel (and contributes nothing to the body).
            const blocks = f.panel
                ? (result.referencePanel?.blocks ?? [])
                : result.blocks;
            if (f.panel) expect(result.blocks).toEqual([]);
            expect(
                hasType(blocks, f.blockType),
                `${f.tag} example did not produce ${f.blockType}`,
            ).toBe(true);
            expect(result.warnings).toEqual([]);
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

// Region slices. A whole-document `toContain` is satisfied by ANY single
// mention, so it cannot see a fence that is taught in its own section while a
// LIST elsewhere still describes the world before it existed — which is exactly
// how ```definitions drifted: the DEFINITIONS section taught it, and the OTHER
// section's allowlist simultaneously forbade it. Scoping each assertion to the
// region that has to stay complete is what makes that class of contradiction
// visible.
//
// Each slice asserts it actually found its region, so rewording an anchor fails
// loudly instead of silently turning the guard vacuous (the same failure mode).
function slice(src: string, startMark: string, endMark: string, label: string): string {
    const start = src.indexOf(startMark);
    const end = src.indexOf(endMark, start + startMark.length);
    if (start === -1 || end === -1) {
        throw new Error(
            `Could not locate the ${label} region (anchors: "${startMark}" … "${endMark}"). ` +
                'If the wording moved, re-point this slice — do not delete the assertion.',
        );
    }
    return src.slice(start, end);
}

// The prompt's OTHER section: "…any code block inside the activity other than
// ```a, ```b, … — only the single outer block … are allowed". This is phrased as
// a PROHIBITION, so a model follows it over a permissive section elsewhere. It
// must name every fence the parser accepts.
const PROMPT_FENCE_ALLOWLIST = slice(
    MARKDOWN_IMPORT_AI_PROMPT,
    'other than ```',
    'are allowed',
    "prompt's allowed-fences list",
);

// The doc's quick-reference table — the "what can I write?" index a teacher
// scans. A fence missing here is invisible to anyone who doesn't read to the end.
const DOC_QUICK_REFERENCE = slice(
    DOC,
    '## Quick reference',
    '## Rules that matter',
    "doc's quick-reference table",
);

describe('registry ↔ prompt + doc (documented)', () => {
    it.each(FENCES)('$tag fence is taught in the prompt and the doc', (f) => {
        const fenced = '```' + f.tag;
        expect(MARKDOWN_IMPORT_AI_PROMPT).toContain(fenced);
        expect(DOC).toContain(fenced);
    });

    // The three region-scoped bindings. Each would have caught the
    // ```definitions drift that the whole-document assertions above could not.
    it.each(FENCES)(
        "$tag is named in the prompt's allowed-fences list",
        (f) => {
            expect(
                PROMPT_FENCE_ALLOWLIST,
                `the prompt teaches \`\`\`${f.tag} somewhere but its allowed-fences list omits it — ` +
                    'the two instructions contradict, and the list is the one phrased as a prohibition',
            ).toContain('```' + f.tag);
        },
    );

    it.each(FENCES)('$tag has a row in the doc quick-reference table', (f) => {
        expect(
            DOC_QUICK_REFERENCE,
            `\`\`\`${f.tag} is missing from the quick-reference table`,
        ).toContain('```' + f.tag);
    });

    it.each(FENCES)('$tag has its own section heading in the doc', (f) => {
        // Headings read "## Callout blocks (```callout fence)" — shortanswer and
        // essay share one ("(```shortanswer / ```essay fences)"), so match the
        // tag inside a heading line rather than a fixed suffix.
        const headings = DOC.split('\n').filter(
            (l) => l.startsWith('## ') && l.includes('fence'),
        );
        expect(
            headings.some((h) => h.includes('```' + f.tag)),
            `no "## … (\`\`\`${f.tag} fence)" section in the doc`,
        ).toBe(true);
    });

    const optionCases = FENCES.flatMap((f) =>
        (f.options ?? []).map((opt) => ({ tag: f.tag, opt })),
    );
    it.each(optionCases)('$tag option "$opt" is named in the prompt', ({ opt }) => {
        expect(MARKDOWN_IMPORT_AI_PROMPT).toContain(opt);
    });
});
