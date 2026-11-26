// =============================================================================
// editorRoundTrip.test.ts — every block survives a trip through the EDITOR
// (review 2026-11-26, C3)
// -----------------------------------------------------------------------------
// Every editor open is document → activityToTiptap → ProseMirror schema →
// tiptapToActivity → document. The per-field serialize tests each hold one
// field, and none of them passes the REAL ProseMirror schema: an attribute the
// serializer (or the importer) emits that the node's extension does not declare
// is silently DROPPED by `Node.fromJSON`, so it imports and publishes correctly
// and vanishes the first time a teacher opens and saves. This guard runs whole
// documents through the real schema built from `buildEditorExtensions()` and
// asserts the parsed document comes back equal, ids normalised.
//
// Two corpora:
//   1. the viewer's authored fixture document (`@activity/viewer/fixtures`):
//      one realistic, answer-bearing instance per registered block type plus
//      the interaction variants — the shapes the student surface is tested on;
//   2. every importer fence example in `importFormatRegistry.ts`, through the
//      batch importer's own pipeline (markdown → blocks → wrapBlocksStrict →
//      tiptapToActivity → parse) — the shapes the catalogue actually stores.
//
//   3. a test-local LAYOUT document: a titled DoL checkpoint section, a
//      two-column row with grid lines on, column widths and a minimum height,
//      and worked examples whose titles are not the serializer's fallbacks —
//      every place where the corpora above hold only the default (a dropped
//      field that equals its parse default would otherwise compare equal).
//
// Coverage is DERIVED: the block types in the viewer fixture alone must include
// every discriminator in the schema's `Block` union (read at runtime), so a new
// block type with no fixture fails here, by name.
//
// Ids: `tiptapToActivity` mints fresh UUIDs, so the comparison renames every
// UUID-shaped string to its order of first appearance in a fixed walk. That
// keeps cross-references (an id used twice) meaningful while ignoring the
// fresh mint. Never diff raw serialised documents (CLAUDE.md).
// =============================================================================

import { beforeAll, describe, expect, it } from 'vitest';
import { getSchema, type JSONContent } from '@tiptap/core';
import { ActivityDocument, Block as BlockSchema } from '@activity/schema';
import { authoredFixtureDocument } from '@activity/viewer/fixtures';
import { activityToTiptap, tiptapToActivity } from '../lib/serialize';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { getMarkdownImporter, wrapBlocksStrict } from '../lib/batchImportPipeline';
import type { MarkdownImporter } from '../lib/markdownToTiptap';
import { FENCES } from '../lib/importFormatRegistry';

const pmSchema = getSchema(buildEditorExtensions());

// The editor's half: what a teacher's open → save does to a stored document.
function throughEditor(doc: ActivityDocument): ActivityDocument {
    const tiptap = activityToTiptap(doc);
    // nodeFromJSON is where an undeclared attr is dropped and an unknown node
    // throws. toJSON is what the editor hands the save path.
    const json = pmSchema.nodeFromJSON(tiptap).toJSON() as JSONContent;
    return ActivityDocument.parse(
        tiptapToActivity(json, doc.meta, doc.referencePanel, doc.calculator, doc.teacherGuide),
    );
}

// Field-level normalisations, each a documented equivalence, never a loss:
//   • a blank's `equivalence: 'value'` ≡ absent — the editor saves the
//     default as an absent field and the grader reads absent as 'value'
//     (viewer server/grading/blanks.ts, `key.equivalence === 'form' ? …`);
//   • a video's `stale` is computed on every save, never authored
//     (schema blocks/video.ts header), so it is not a round-trip property.
function canonical(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(canonical);
    if (!value || typeof value !== 'object') return value;
    const rec: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) rec[k] = canonical(v);
    if (rec.type === 'blank' && rec.equivalence === 'value') delete rec.equivalence;
    if (rec.type === 'video') delete rec.stale;
    for (const strip of KNOWN_FIELD_LOSSES) strip(rec);
    return rec;
}

// ⚠ TRACKED EXPECTED FAILURES — TODOS.md → "Editor round trip: what the
// editor drops on save (review C3)". Each is a real loss on current code,
// hidden from the main comparison so the rest of the guard stays sharp, and
// proved still-lost by an `it.fails` below: the day the loss is fixed that row
// goes red, and the entry here must be deleted.
const KNOWN_BLOCK_LOSSES = new Set<string>(['problem']);
const KNOWN_FIELD_LOSSES: ((rec: Record<string, unknown>) => void)[] = [
    // A blank's authored `width` (schema inline.ts BlankToken; the viewer's
    // blankSize.ts honours it). The Blank extension declares no width attr.
    (rec) => {
        if (rec.type === 'blank') delete rec.width;
    },
];

const same = (doc: ActivityDocument): [unknown, unknown] => [
    normaliseIds(canonical(throughEditor(doc))),
    normaliseIds(canonical(doc)),
];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Rename every UUID to `#n` by first appearance, walking keys in sorted order
// so key-insertion order cannot change the numbering.
function normaliseIds(value: unknown): unknown {
    const seen = new Map<string, string>();
    const walk = (v: unknown): unknown => {
        if (typeof v === 'string' && UUID.test(v)) {
            if (!seen.has(v)) seen.set(v, `#${seen.size}`);
            return seen.get(v);
        }
        if (Array.isArray(v)) return v.map(walk);
        if (v && typeof v === 'object') {
            const out: Record<string, unknown> = {};
            for (const key of Object.keys(v).sort()) {
                out[key] = walk((v as Record<string, unknown>)[key]);
            }
            return out;
        }
        return v;
    };
    return walk(value);
}

function blockTypesIn(doc: ActivityDocument): Set<string> {
    const types = new Set<string>();
    const visit = (v: unknown): void => {
        if (Array.isArray(v)) return v.forEach(visit);
        if (!v || typeof v !== 'object') return;
        const rec = v as Record<string, unknown>;
        if (typeof rec.type === 'string' && typeof rec.id === 'string') types.add(rec.type);
        Object.values(rec).forEach(visit);
    };
    doc.sections.forEach(visit);
    return types;
}

// One document per top-level block: a failure names the block that lost
// something, rather than one diff over the whole fixture.
function perBlockDocs(doc: ActivityDocument): [string, ActivityDocument][] {
    const out: [string, ActivityDocument][] = [];
    for (const section of doc.sections) {
        for (const row of section.rows) {
            for (const column of row.columns) {
                for (const block of column.blocks) {
                    out.push([
                        `${block.type} (${block.id.slice(-4)})`,
                        ActivityDocument.parse({
                            ...doc,
                            sections: [
                                {
                                    ...section,
                                    rows: [{ ...row, columns: [{ ...column, blocks: [block] }] }],
                                },
                            ],
                        }),
                    ]);
                }
            }
        }
    }
    return out;
}

const SCHEMA_BLOCK_TYPES = BlockSchema.options.map((o) => o.shape.type.value as string);


// The viewer fixture models a video as SERVED (no url: sanitize strips it).
// A stored document always has one, and serialize drops a url-less card as
// unfinished (schema blocks/video.ts), so give it the url a teacher saved.
const fixture = ActivityDocument.parse(
    JSON.parse(
        JSON.stringify(authoredFixtureDocument()),
        (_k, v: unknown) =>
            v && typeof v === 'object' && (v as { type?: unknown }).type === 'video' && !('url' in v)
                ? { ...v, url: 'https://youtu.be/abc123' }
                : v,
    ),
);
const fixtureCases = perBlockDocs(fixture);

function fixtureBlock<T extends string>(type: T): Extract<ActivityDocument['sections'][number]['rows'][number]['columns'][number]['blocks'][number], { type: T }> {
    for (const section of fixture.sections)
        for (const row of section.rows)
            for (const column of row.columns)
                for (const block of column.blocks)
                    if (block.type === type) return structuredClone(block) as never;
    throw new Error(`no fixture block of type ${type}`);
}

const layoutDoc = (() => {
    const worked = { ...fixtureBlock('worked_example'), title: 'Halve it first' };
    const faded = { ...fixtureBlock('faded_worked_example'), title: 'Now you try' };
    return ActivityDocument.parse({
        schemaVersion: 2,
        meta: fixture.meta,
        sections: [
            {
                id: crypto.randomUUID(),
                isCheckpoint: false,
                rows: [{ id: crypto.randomUUID(), gridLines: 'off', columns: [{ id: crypto.randomUUID(), blocks: [fixtureBlock('paragraph')] }] }],
            },
            {
                id: crypto.randomUUID(),
                title: 'Practice',
                isCheckpoint: true,
                dol: { skills: ['skill.layout-probe'], retake: false },
                rows: [
                    {
                        id: crypto.randomUUID(),
                        gridLines: 'on',
                        columns: [
                            { id: crypto.randomUUID(), width: 2, blocks: [worked] },
                            { id: crypto.randomUUID(), width: 1, minHeight: 4, blocks: [faded] },
                        ],
                    },
                ],
            },
        ],
    });
})();

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});

// The batch importer's storing path, for one fence example. Body fences only:
// side-channel fences (panel, guide, definitions, meta) carry no body blocks.
const BODY_FENCES = FENCES.filter(
    (f) => !f.panel && !f.guide && !f.definitions && !f.meta,
);
function importedDoc(tag: string, example: string, catalogue: boolean): ActivityDocument {
    const md = catalogue
        ? `## Lesson {checkpoint}\n\n\`\`\`${tag}\n${example}\n\`\`\`\n\n\`\`\`faded\ntitle: One\nx = {{4}}\n\`\`\``
        : `\`\`\`${tag}\n${example}\n\`\`\``;
    const result = convert(md, catalogue ? { catalogue: true } : undefined);
    const meta = ActivityDocument.parse({
        schemaVersion: 2,
        meta: { title: 'Round trip' },
        sections: [{ id: crypto.randomUUID(), isCheckpoint: false, rows: [] }],
    }).meta;
    return ActivityDocument.parse(
        tiptapToActivity(wrapBlocksStrict(result.blocks as JSONContent[]), meta),
    );
}

describe('editor round trip (C3)', () => {
    it('the corpora cover every block type in the schema union', () => {
        const covered = blockTypesIn(fixture);
        const missing = SCHEMA_BLOCK_TYPES.filter((t) => !covered.has(t));
        expect(
            missing,
            `block types with no round-trip fixture — add one to @activity/viewer/fixtures: ${missing.join(', ')}`,
        ).toEqual([]);
    });

    it('every KNOWN_BLOCK_LOSSES entry is a real schema block type', () => {
        for (const t of KNOWN_BLOCK_LOSSES) expect(SCHEMA_BLOCK_TYPES).toContain(t);
    });

    describe('viewer fixture blocks', () => {
        for (const [name, doc] of fixtureCases) {
            const type = name.split(' ')[0]!;
            const run = KNOWN_BLOCK_LOSSES.has(type) ? it.fails : it;
            run(`${name} survives open → save`, () => {
                const [after, before] = same(doc);
                expect(after).toEqual(before);
            });
        }
    });

    it('the whole fixture document survives (sections, rows, columns together)', () => {
        const withoutLosses = ActivityDocument.parse({
            ...fixture,
            sections: fixture.sections.map((s) => ({
                ...s,
                rows: s.rows
                    .map((r) => ({
                        ...r,
                        columns: r.columns.map((c) => ({
                            ...c,
                            blocks: c.blocks.filter((b) => !KNOWN_BLOCK_LOSSES.has(b.type)),
                        })),
                    }))
                    // A row left with an empty column held only a known loss.
                    .filter((r) => r.columns.every((c) => c.blocks.length > 0)),
            })),
        });
        const [after, before] = same(withoutLosses);
        expect(after).toEqual(before);
    });

    // Split from the it.fails below so a fixture that stops carrying a width
    // goes red here instead of letting the it.fails "pass" vacuously.
    const blankWidths = (d: ActivityDocument): string[] =>
        JSON.stringify(d).match(/"type":"blank"[^{}]*"width":\d+|"width":\d+[^{}]*"type":"blank"/g) ?? [];
    const widthDoc = fixtureCases.find(([n]) => n.startsWith('fill_in_blank'))![1];
    it('precondition: the fill_in_blank fixture carries an authored blank width', () => {
        expect(blankWidths(widthDoc).length).toBeGreaterThan(0);
    });
    it.fails('KNOWN LOSS: a blank keeps its authored width', () => {
        expect(blankWidths(throughEditor(widthDoc))).toEqual(blankWidths(widthDoc));
    });

    it('the layout document survives (section title + DoL, grid lines, widths, titles)', () => {
        const [after, before] = same(layoutDoc);
        expect(after).toEqual(before);
    });

    // A guard on the guard: the layout document must actually hold the
    // non-defaults it exists for, or the row above is vacuous.
    it('precondition: the layout document holds its non-default values', () => {
        const section = layoutDoc.sections[1]!;
        expect(section.title).toBe('Practice');
        expect(section.dol?.skills.length).toBeGreaterThan(0);
        const row = section.rows[0]!;
        expect(row.gridLines).toBe('on');
        expect(row.columns.map((c) => c.width)).toEqual([2, 1]);
        expect(row.columns[1]!.minHeight).toBe(4);
        const titles = row.columns.flatMap((c) => c.blocks).map((b) => ('title' in b ? b.title : null));
        expect(titles).toEqual(['Halve it first', 'Now you try']);
    });

    describe('importer fence examples', () => {
        it.each(BODY_FENCES.map((f) => [f.tag, f] as const))(
            '```%s survives import → open → save',
            (_tag, f) => {
                const stored = importedDoc(f.tag, f.example, Boolean(f.catalogueOnly));
                expect(blockTypesIn(stored).size).toBeGreaterThan(0);
                const [after, before] = same(stored);
                expect(after).toEqual(before);
            },
        );
    });
});
