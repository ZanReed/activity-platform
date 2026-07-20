import { describe, it, expect, afterEach, vi } from 'vitest';
import { getSchema } from '@tiptap/core';
import { EditorState } from '@tiptap/pm/state';
import type { NodeType, Node as ProseMirrorNode } from '@tiptap/pm/model';
import { buildEditorExtensions } from '../editor/editorExtensions';
import {
    createSettleMotionPlugin,
    settleMetaKey,
    armSettle,
    resetSettleArm,
    changedRanges,
    settleTargets,
} from '../editor/extensions/SettleMotion';

// ============================================================================
// SettleMotion — state-side coverage (slice-6 stage 6, eng-review T2-1/T2-3).
// The plugin factory runs on a bare EditorState (no DOM), so the meta/arm
// gating → decoration pipeline is testable headlessly. The view side
// (animationend clear, janitor) is covered by snap-motion.e2e.ts.
//
// The load-bearing pins are the FALSE-POSITIVE classes the eng review's
// outside voice caught: plain typing, Enter (splitBlock), and attr writes /
// block-type conversion must NEVER settle — detection is explicit-signal-only.
// ============================================================================

const schema = getSchema(buildEditorExtensions());

function nodeType(name: string): NodeType {
    const t = schema.nodes[name];
    if (!t) throw new Error(`schema is missing node type ${name}`);
    return t;
}

function para(text: string): ProseMirrorNode {
    return nodeType('paragraph').create(null, schema.text(text));
}

// Position of the first block inside the strict-grid stack (into row +1, into
// column +1).
const FIRST_BLOCK_POS = 2;

// A strict-grid doc: one 1-col stack row holding the blocks. The settle plugin
// tags blocks whose PARENT is a `column`, so synthetic docs must nest — bare
// top-level paragraphs (the pre-strict-grid shape) are never tagged.
function makeState(blocks: ProseMirrorNode[] = [para('alpha'), para('beta')]) {
    const plugin = createSettleMotionPlugin();
    const column = nodeType('column').create(null, blocks);
    const row = nodeType('row').create({ id: 'r' }, [column]);
    const doc = nodeType('doc').create(null, [row]);
    const state = EditorState.create({ schema, doc, plugins: [plugin] });
    return { plugin, state };
}

// The position at the end of the first (stack) column's content — where an
// appended block lands INSIDE the column (so the plugin can tag it). Replaces
// the pre-strict-grid `state.doc.content.size` (doc level, now a row boundary).
function colAppendPos(state: EditorState): number {
    const column = state.doc.firstChild!.firstChild!;
    return FIRST_BLOCK_POS + column.content.size;
}

function decosOf(
    plugin: ReturnType<typeof createSettleMotionPlugin>,
    state: EditorState,
) {
    return plugin.getState(state)?.find() ?? [];
}

// Decoration attrs aren't part of the public type surface; the class is what
// the DOM receives, so read it through the underlying spec for assertions.
function decoClass(deco: unknown): string | undefined {
    return (deco as { type?: { attrs?: { class?: string } } }).type?.attrs
        ?.class;
}

afterEach(() => {
    resetSettleArm();
    vi.restoreAllMocks();
});

describe('explicit-signal gating (T2-1)', () => {
    it('plain typing never settles', () => {
        const { plugin, state } = makeState();
        const next = state.apply(state.tr.insertText('x', 3));
        expect(decosOf(plugin, next)).toHaveLength(0);
    });

    it('Enter (splitBlock) never settles — the open-slice false positive', () => {
        const { plugin, state } = makeState();
        const tr = state.tr.split(5); // pos 5 = inside 'alpha' text (3..8)
        const next = state.apply(tr);
        // The split happened inside the column: it now holds three paragraphs.
        expect(next.doc.firstChild!.firstChild!.childCount).toBe(3);
        expect(decosOf(plugin, next)).toHaveLength(0);
    });

    it('block-type conversion (setNodeMarkup) never settles', () => {
        const { plugin, state } = makeState();
        const tr = state.tr.setNodeMarkup(FIRST_BLOCK_POS, nodeType('heading'), {
            level: 1,
        });
        const next = state.apply(tr);
        expect(next.doc.nodeAt(FIRST_BLOCK_POS)?.type.name).toBe('heading');
        expect(decosOf(plugin, next)).toHaveLength(0);
    });

    it('an armed insert settles the inserted block with block-settle-in', () => {
        const { plugin, state } = makeState();
        armSettle('insert');
        const next = state.apply(
            state.tr.insert(colAppendPos(state), para('new')),
        );
        const decos = decosOf(plugin, next);
        expect(decos).toHaveLength(1);
        expect(decoClass(decos[0])).toBe('block-settle-in');
    });

    it('the arm is consumed by the first doc-changing transaction', () => {
        const { plugin, state } = makeState();
        armSettle('insert');
        const s1 = state.apply(
            state.tr.insert(colAppendPos(state), para('new')),
        );
        expect(decosOf(plugin, s1)).toHaveLength(1);
        // A later unrelated insert must not settle off the stale arm.
        const s2 = s1.apply(s1.tr.insert(colAppendPos(s1), para('more')));
        expect(decosOf(plugin, s2)).toHaveLength(1); // still just the mapped one
    });

    it('an expired arm (TTL) does not settle', () => {
        const now = vi.spyOn(Date, 'now');
        now.mockReturnValue(1_000);
        armSettle('insert');
        now.mockReturnValue(1_000 + 500); // past the 200ms TTL
        const { plugin, state } = makeState();
        const next = state.apply(
            state.tr.insert(colAppendPos(state), para('new')),
        );
        expect(decosOf(plugin, next)).toHaveLength(0);
    });

    it('a direct settle meta settles (the wrapInColumns path)', () => {
        const { plugin, state } = makeState();
        const tr = state.tr.insert(colAppendPos(state), para('new'));
        tr.setMeta(settleMetaKey, 'insert');
        const decos = decosOf(plugin, state.apply(tr));
        expect(decos).toHaveLength(1);
        expect(decoClass(decos[0])).toBe('block-settle-in');
    });

    it("a native drop (uiEvent meta) settles as a move — no opacity dip class", () => {
        const { plugin, state } = makeState();
        // A PM move within the column: delete block 2, insert it above block 1,
        // one transaction. Positions are column-relative in the strict grid.
        const column = state.doc.firstChild!.firstChild!;
        const second = column.child(1);
        const secondFrom = FIRST_BLOCK_POS + column.child(0).nodeSize;
        const tr = state.tr
            .delete(secondFrom, secondFrom + second.nodeSize)
            .insert(FIRST_BLOCK_POS, second);
        tr.setMeta('uiEvent', 'drop');
        const decos = decosOf(plugin, state.apply(tr));
        expect(decos).toHaveLength(1);
        expect(decoClass(decos[0])).toBe('block-settle-move');
    });

    it('a bulk insert past the cap settles nothing (markdown import)', () => {
        const { plugin, state } = makeState();
        armSettle('insert');
        const blocks = ['a', 'b', 'c', 'd', 'e'].map(para);
        const frag = nodeType('column').create(null, blocks).content;
        const next = state.apply(
            state.tr.insert(colAppendPos(state), frag),
        );
        expect(decosOf(plugin, next)).toHaveLength(0);
    });
});

describe('clear metas (T2-3 state side)', () => {
    function settled() {
        const { plugin, state } = makeState();
        armSettle('insert');
        const next = state.apply(
            state.tr.insert(colAppendPos(state), para('new')),
        );
        expect(decosOf(plugin, next)).toHaveLength(1);
        return { plugin, state: next };
    }

    it('clear-around removes the decoration covering that position', () => {
        const { plugin, state } = settled();
        const deco = decosOf(plugin, state)[0] as unknown as {
            from: number;
        };
        const tr = state.tr.setMeta(
            // The plugin key is private; route through a real dispatchable
            // meta by reusing the plugin instance's key via its spec.
            plugin,
            { around: deco.from + 1 },
        );
        expect(decosOf(plugin, state.apply(tr))).toHaveLength(0);
    });

    it('clear-all empties the set', () => {
        const { plugin, state } = settled();
        const tr = state.tr.setMeta(plugin, { all: true });
        expect(decosOf(plugin, state.apply(tr))).toHaveLength(0);
    });
});

describe('placement geometry (pure helpers)', () => {
    it('changedRanges reports an insert and drops a pure delete', () => {
        const { state } = makeState();
        const ins = state.tr.insert(colAppendPos(state), para('new'));
        expect(changedRanges(ins)).toHaveLength(1);
        // A pure delete of the first block inside the column (no insert).
        const firstSize = state.doc.firstChild!.firstChild!.child(0).nodeSize;
        const del = state.tr.delete(FIRST_BLOCK_POS, FIRST_BLOCK_POS + firstSize);
        expect(changedRanges(del)).toHaveLength(0);
    });

    it('settleTargets picks the fully-covered block, not a merely-intersecting container', () => {
        const inner = para('in cell');
        const column = nodeType('column').create(null, [inner]);
        const column2 = nodeType('column').create(null, [para('other')]);
        const row = nodeType('row').create({ id: 'r1' }, [column, column2]);
        const topPara = para('top');
        const doc = nodeType('doc').create(null, [topPara, row]);

        // Range covering ONLY the block inside column 1 → that block, not
        // the row that intersects the range by containing it.
        const innerPos = topPara.nodeSize + 2; // into row (+1), into column (+1)
        const targets = settleTargets(doc, [
            { from: innerPos, to: innerPos + inner.nodeSize },
        ]);
        expect(targets).toHaveLength(1);
        expect(targets[0]?.node.type.name).toBe('paragraph');
        expect(targets[0]?.pos).toBe(innerPos);
    });

    it('settleTargets settles a fully-covered row as ONE row (no nested settles)', () => {
        const row = nodeType('row').create({ id: 'r1' }, [
            nodeType('column').create(null, [para('a')]),
            nodeType('column').create(null, [para('b')]),
        ]);
        const topPara = para('top');
        const doc = nodeType('doc').create(null, [topPara, row]);
        const targets = settleTargets(doc, [
            { from: topPara.nodeSize, to: topPara.nodeSize + row.nodeSize },
        ]);
        expect(targets).toHaveLength(1);
        expect(targets[0]?.node.type.name).toBe('row');
    });
});
