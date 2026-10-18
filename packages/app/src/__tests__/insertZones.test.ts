// @vitest-environment jsdom
import { afterEach, describe, it, expect } from 'vitest';
import { Editor, getSchema } from '@tiptap/core';
import { Node as PMNode } from '@tiptap/pm/model';
import { buildEditorExtensions } from '../editor/editorExtensions';
import {
    insertZonePositions,
    emptyDocJSON,
    stackDocJSON,
    type InsertZone,
} from '../editor/strictGrid';
import type { JSONContent } from '@tiptap/core';

// ============================================================================
// insertZonePositions — the persistent inter-block insert-zone seam model.
// Pure-part coverage: which doc positions get a `before` / `append` zone, and
// the two suppression rules (empty seed doc; trailing auto-paragraph + the last
// stack column's redundant append). The interaction side (click → picker →
// insert, drag-hide, atom-seam placement) is the Playwright harness's job
// (e2e/insert-zones.e2e.ts) — the in-app browser pane can't drive it.
// ============================================================================

const pmSchema = getSchema(buildEditorExtensions());
const doc = (json: JSONContent): PMNode => PMNode.fromJSON(pmSchema, json);

// Convenience: a multi-col row of the given per-column block lists.
function colsRowJSON(...columns: JSONContent[][]): JSONContent {
    return {
        type: 'row',
        attrs: { gridLines: 'inherit' },
        content: columns.map((blocks) => ({ type: 'column', content: blocks })),
    };
}

const para = (text?: string): JSONContent =>
    text
        ? { type: 'paragraph', content: [{ type: 'text', text }] }
        : { type: 'paragraph' };

function kinds(zones: InsertZone[]): string[] {
    return zones.map((z) => z.kind);
}

describe('insertZonePositions', () => {
    it('returns no zones for the empty seed doc', () => {
        expect(insertZonePositions(doc(emptyDocJSON()))).toEqual([]);
    });

    it('a single non-empty stack block gets a before-zone (append suppressed as the trailing stack column)', () => {
        // One stack row, one non-empty paragraph. The append zone at the column
        // end coincides with the end square, so it is dropped; the before-zone
        // (insert ABOVE the block) remains.
        const zones = insertZonePositions(doc(stackDocJSON(para('hello'))));
        expect(kinds(zones)).toEqual(['before']);
        // before-pos = into row (+1) + into column (+1) = 2.
        expect(zones[0]!.pos).toBe(2);
    });

    it('suppresses the before-zone of a trailing EMPTY paragraph', () => {
        // A real block followed by the normalizer's trailing empty line: the
        // real block keeps its before-zone; the trailing empty para gets none,
        // and the append is suppressed (trailing stack column).
        const zones = insertZonePositions(
            doc(stackDocJSON(para('real'), para())),
        );
        expect(kinds(zones)).toEqual(['before']);
        // Only the first (real) block's before-zone, at pos 2.
        expect(zones[0]!.pos).toBe(2);
    });

    it('interior stack blocks each get a before-zone; the last stack column append is dropped', () => {
        const zones = insertZonePositions(
            doc(stackDocJSON(para('a'), para('b'), para('c'))),
        );
        // Three before-zones (above a, b, c); no append (trailing stack column).
        expect(kinds(zones)).toEqual(['before', 'before', 'before']);
    });

    it('a multi-col LAST row keeps every cell append zone (end square appends a new row, not into a cell)', () => {
        const zones = insertZonePositions(
            doc({
                type: 'doc',
                content: [colsRowJSON([para('a')], [para('b')])],
            }),
        );
        // Each of the 2 cells: a before-zone + an append zone. No trailing-stack
        // suppression (the last row is multi-col, not a 1-col stack).
        expect(kinds(zones).sort()).toEqual(
            ['append', 'append', 'before', 'before'].sort(),
        );
        expect(zones.filter((z) => z.kind === 'append')).toHaveLength(2);
    });

    it('never emits a zone inside a nested container (worked-example body)', () => {
        // A worked_example whose body holds paragraphs — those inner paragraphs
        // are children of the container, NOT of a column, so they get no zones.
        const workedExample: JSONContent = {
            type: 'workedExample',
            content: [para('step one'), para('step two')],
        };
        const zones = insertZonePositions(
            doc(stackDocJSON(workedExample, para('after'))),
        );
        // Only the two COLUMN-child blocks (the worked_example itself + the
        // following paragraph) are seam sites: two before-zones, no inner ones.
        expect(kinds(zones)).toEqual(['before', 'before']);
    });

    it('sectionBreaks are not zone sites, but the blocks around them are', () => {
        const zones = insertZonePositions(
            doc({
                type: 'doc',
                content: [
                    { type: 'row', attrs: { gridLines: 'inherit' }, content: [{ type: 'column', content: [para('intro')] }] },
                    { type: 'sectionBreak' },
                    { type: 'row', attrs: { gridLines: 'inherit' }, content: [{ type: 'column', content: [para('next')] }] },
                ],
            }),
        );
        // intro's before-zone + intro-column append (not the last row) +
        // next's before-zone (next is the trailing stack column: append dropped).
        expect(kinds(zones)).toEqual(['before', 'append', 'before']);
    });

    it('every returned position resolves inside a column in the real schema', () => {
        const d = doc(
            stackDocJSON(para('a'), { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'H' }] }, para('b')),
        );
        for (const zone of insertZonePositions(d)) {
            const $pos = d.resolve(zone.pos);
            // The insertion anchor sits directly inside a column (its parent, or
            // the node just before it at column end, is column-scoped).
            const parentIsColumn = $pos.parent.type.name === 'column';
            expect(parentIsColumn, `pos ${zone.pos} (${zone.kind}) not in a column`).toBe(true);
        }
    });
});

// ============================================================================
// The widget DOM across typing (efficiency audit 2026-10 #7). A position key
// made every zone below the caret rebuild on each keystroke; the kind+order key
// lets ProseMirror reuse it. The trap the audit named: a REUSED zone sits at a
// new position, so its click must report where it is now, not where it was
// built. Both halves are pinned here against a real (headless) editor.
// ============================================================================


describe('InsertZones widget DOM', () => {
    const live: Editor[] = [];
    afterEach(() => {
        while (live.length) live.pop()?.destroy();
    });

    function mount(n: number): Editor {
        const element = document.createElement('div');
        document.body.append(element);
        const editor = new Editor({
            element,
            extensions: buildEditorExtensions(),
            content: stackDocJSON(...Array.from({ length: n }, (_, i) => para(`Block ${i + 1}`))),
        });
        live.push(editor);
        return editor;
    }
    /** A position INSIDE the first block's text — typing, not a new block. */
    const insideFirstText = (editor: Editor): number => {
        let at = -1;
        editor.state.doc.descendants((node, pos) => {
            if (at < 0 && node.isText) at = pos + 1;
            return at < 0;
        });
        return at;
    };
    const zoneEls = (editor: Editor) =>
        [...editor.view.dom.querySelectorAll<HTMLElement>('[data-insert-zone]')];

    it('typing at the top reuses every zone element instead of rebuilding them', () => {
        const editor = mount(6);
        const before = zoneEls(editor);
        expect(before.length).toBeGreaterThan(3);
        editor.commands.insertContentAt(insideFirstText(editor), 'xyz');
        const after = zoneEls(editor);
        expect(after).toHaveLength(before.length);
        after.forEach((el, i) => expect(el).toBe(before[i]));
    });

    it('a reused zone reports its live position when clicked', () => {
        const editor = mount(6);
        const clicks: { pos: number; kind: string }[] = [];
        (editor.storage as unknown as { insertZones: { onZoneClick: unknown } }).insertZones.onZoneClick = (
            pos: number,
            kind: string,
        ) => clicks.push({ pos, kind });
        const last = zoneEls(editor).at(-1)!;
        editor.commands.insertContentAt(insideFirstText(editor), 'xyz'); // shifts every later seam by 3
        expect(zoneEls(editor).at(-1)).toBe(last); // the same element...
        last.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const expected = insertZonePositions(editor.state.doc).at(-1)!;
        expect(clicks).toEqual([{ pos: expected.pos, kind: expected.kind }]); // ...at its new seam
    });
});
