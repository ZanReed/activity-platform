// =============================================================================
// misconceptionEndToEnd.test.ts — an authored binding survives the whole chain
// -----------------------------------------------------------------------------
// Every other test in this arc pins one seam: the importer parses `:: mis.*`,
// serialize round-trips it, the grader returns it. Each can pass while the
// CHAIN is broken, because a seam test supplies its own input — which is
// exactly how this repo shipped a schema field whose serializer silently
// dropped it.
//
// So this file walks the real path a catalogue file takes:
//
//   markdown ──importer──► Tiptap ──serialize──► ActivityDocument
//        │                                              │
//        │                                        (schema parse)
//        │                                              ▼
//        └──────────────── the author writes ──► gradeSection() ──► verdict
//                          one `:: mis.x`         (viewer server)     carries
//                                                                     the id
//
// It is deliberately cross-package (app importer + viewer grading) because the
// gap it guards is BETWEEN packages, where neither package's own suite looks.
// =============================================================================

import { beforeAll, describe, expect, it } from 'vitest';
import { ActivityDocument, ActivityMeta } from '@activity/schema';
// Deep relative import on purpose: `gradeSection` is not on the viewer's
// public surface (the grading bundle reaches it by file path, and widening the
// exports map for one test would put a server entry point into the package's
// API). This is the only consumer outside the viewer.
import { gradeSection } from '../../../viewer/src/server/grading/index.js';
import { emptySectionResponses } from '@activity/viewer';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import { tiptapToActivity } from '../lib/serialize';
import { wrapBlocksStrict } from '../editor/strictGrid';

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});

/** markdown → the stored, schema-valid document a student would be served. */
function authorActivity(markdown: string) {
    // wrapBlocksStrict is the same row/column wrapping `import:batch` applies
    // before serializing — skipping it yields a document with zero rows, which
    // would make every assertion below vacuous.
    const { blocks, warnings } = convert(markdown);
    const doc = tiptapToActivity(
        wrapBlocksStrict(blocks),
        ActivityMeta.parse({ title: 'End-to-end', course: 'Algebra I' }),
    );
    const parsed = ActivityDocument.safeParse(doc);
    expect(parsed.success, JSON.stringify(parsed.error?.issues?.slice(0, 3))).toBe(
        true,
    );
    return { doc: parsed.success ? parsed.data : doc, warnings };
}

describe('an authored misconception binding reaches the graded verdict', () => {
    it('carries a blank binding from markdown all the way to the check result', () => {
        const { doc, warnings } = authorActivity(
            'What is the unit rate? {{=1.5 | !0.5 :: You divided the wrong way. :: mis.roc.inverts-ratio}} km/h',
        );
        expect(warnings).toHaveLength(0);

        const section = (doc as { sections: Array<{ id: string }> }).sections[0]!;
        const blankId = JSON.stringify(doc).match(
            /"type":"blank","id":"([0-9a-f-]{36})"/,
        )?.[1];
        expect(blankId, 'the document should carry a blank').toBeTruthy();

        // The student types the anticipated wrong answer — in a DIFFERENT
        // spelling than the author wrote, which only counts because numeric
        // blanks match by value.
        const result = gradeSection({
            document: doc as never,
            sectionId: section.id,
            responses: {
                ...emptySectionResponses(),
                blanks: { [blankId!]: '1/2' },
            },
        });

        expect(result.items[blankId!]?.verdict).toBe('incorrect');
        expect(result.items[blankId!]?.misconceptionIds).toEqual([
            'mis.roc.inverts-ratio',
        ]);
        expect(JSON.stringify(result.items[blankId!]?.feedback)).toContain(
            'You divided the wrong way.',
        );
    });

    it('carries an id-ONLY binding (no feedback prose) all the way through', () => {
        // The form X1 made legal. It round-trips through a different branch of
        // the serializer than the with-prose form, and it was silently dropped
        // there — the with-prose test above stayed green throughout, which is
        // why this case needs its own walk of the chain.
        const { doc, warnings } = authorActivity(
            'The unit rate is {{=1.5 | !0.5 :: mis.roc.inverts-ratio}} km/h',
        );
        expect(warnings).toHaveLength(0);

        const stored = JSON.stringify(doc);
        expect(stored, 'the binding must survive serialization').toContain(
            'mis.roc.inverts-ratio',
        );

        const section = (doc as { sections: Array<{ id: string }> }).sections[0]!;
        const blankId = stored.match(/"type":"blank","id":"([0-9a-f-]{36})"/)?.[1];
        const result = gradeSection({
            document: doc as never,
            sectionId: section.id,
            responses: {
                ...emptySectionResponses(),
                blanks: { [blankId!]: '0.5' },
            },
        });
        expect(result.items[blankId!]?.verdict).toBe('incorrect');
        expect(result.items[blankId!]?.misconceptionIds).toEqual([
            'mis.roc.inverts-ratio',
        ]);
        // No prose was authored, so the student gets the plain mark.
        expect(result.items[blankId!]?.feedback).toBeUndefined();
    });

    it('carries an mc binding, and emits nothing for the unmapped distractor', () => {
        const { doc, warnings } = authorActivity(
            [
                '```mc',
                'prompt: Which is the unit rate?',
                '( ) $12 :: That is the total, not the rate. :: mis.roc.uses-endpoint-value',
                '(x) $3 per kg',
                '( ) $4',
                '```',
            ].join('\n'),
        );
        expect(warnings).toHaveLength(0);

        const section = (doc as {
            sections: Array<{
                id: string;
                rows: Array<{
                    columns: Array<{
                        blocks: Array<{
                            id: string;
                            type: string;
                            choices?: Array<{ id: string; correct: boolean }>;
                        }>;
                    }>;
                }>;
            }>;
        }).sections[0]!;
        const mc = section.rows[0]!.columns[0]!.blocks.find(
            (b) => b.type === 'multiple_choice',
        )!;
        const bound = mc.choices![0]!;
        const unmapped = mc.choices![2]!;

        const boundResult = gradeSection({
            document: doc as never,
            sectionId: section.id,
            responses: {
                ...emptySectionResponses(),
                choices: { [mc.id]: [bound.id] },
            },
        });
        expect(boundResult.items[mc.id]?.misconceptionIds).toEqual([
            'mis.roc.uses-endpoint-value',
        ]);

        const unmappedResult = gradeSection({
            document: doc as never,
            sectionId: section.id,
            responses: {
                ...emptySectionResponses(),
                choices: { [mc.id]: [unmapped.id] },
            },
        });
        expect(unmappedResult.items[mc.id]?.verdict).toBe('incorrect');
        expect(unmappedResult.items[mc.id]?.misconceptionIds).toBeUndefined();
    });
});
