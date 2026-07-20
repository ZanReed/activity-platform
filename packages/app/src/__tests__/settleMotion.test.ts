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

function makeState(blocks: ProseMirrorNode[] = [para('alpha'), para('beta')]) {
    const plugin = createSettleMotionPlugin();
    const doc = nodeType('doc').create(null, blocks);
    const state = EditorState.create({ schema, doc, plugins: [plugin] });
    return { plugin, state };
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
        const tr = state.tr.split(3);
        const next = state.apply(tr);
        expect(next.doc.childCount).toBe(3); // the split really happened
        expect(decosOf(plugin, next)).toHaveLength(0);
    });

    it('block-type conversion (setNodeMarkup) never settles', () => {
        const { plugin, state } = makeState();
        const tr = state.tr.setNodeMarkup(0, nodeType('heading'), {
            level: 1,
        });
        const next = state.apply(tr);
        expect(next.doc.firstChild?.type.name).toBe('heading');
        expect(decosOf(plugin, next)).toHaveLength(0);
    });

    it('an armed insert settles the inserted block with block-settle-in', () => {
        const { plugin, state } = makeState();
        armSettle('insert');
        const next = state.apply(
            state.tr.insert(state.doc.content.size, para('new')),
        );
        const decos = decosOf(plugin, next);
        expect(decos).toHaveLength(1);
        expect(decoClass(decos[0])).toBe('block-settle-in');
    });

    it('the arm is consumed by the first doc-changing transaction', () => {
        const { plugin, state } = makeState();
        armSettle('insert');
        const s1 = state.apply(
            state.tr.insert(state.doc.content.size, para('new')),
        );
        expect(decosOf(plugin, s1)).toHaveLength(1);
        // A later unrelated insert must not settle off the stale arm.
        const s2 = s1.apply(s1.tr.insert(s1.doc.content.size, para('more')));
        expect(decosOf(plugin, s2)).toHaveLength(1); // still just the mapped one
    });

    it('an expired arm (TTL) does not settle', () => {
        const now = vi.spyOn(Date, 'now');
        now.mockReturnValue(1_000);
        armSettle('insert');
        now.mockReturnValue(1_000 + 500); // past the 200ms TTL
        const { plugin, state } = makeState();
        const next = state.apply(
            state.tr.insert(state.doc.content.size, para('new')),
        );
        expect(decosOf(plugin, next)).toHaveLength(0);
    });

    it('a direct settle meta settles (the wrapInColumns path)', () => {
        const { plugin, state } = makeState();
        const tr = state.tr.insert(state.doc.content.size, para('new'));
        tr.setMeta(settleMetaKey, 'insert');
        const decos = decosOf(plugin, state.apply(tr));
        expect(decos).toHaveLength(1);
        expect(decoClass(decos[0])).toBe('block-settle-in');
    });

    it("a native drop (uiEvent meta) settles as a move — no opacity dip class", () => {
        const { plugin, state } = makeState();
        // A PM move: delete block 2, insert it above block 1, one transaction.
        const second = state.doc.child(1);
        const tr = state.tr
            .delete(7, 7 + second.nodeSize)
            .insert(0, second);
        tr.setMeta('uiEvent', 'drop');
        const decos = decosOf(plugin, state.apply(tr));
        expect(decos).toHaveLength(1);
        expect(decoClass(decos[0])).toBe('block-settle-move');
    });

    it('a bulk insert past the cap settles nothing (markdown import)', () => {
        const { plugin, state } = makeState();
        armSettle('insert');
        const blocks = ['a', 'b', 'c', 'd', 'e'].map(para);
        const frag = nodeType('doc').create(null, blocks).content;
        const next = state.apply(
            state.tr.insert(state.doc.content.size, frag),
        );
        expect(decosOf(plugin, next)).toHaveLength(0);
    });
});

describe('clear metas (T2-3 state side)', () => {
    function settled() {
        const { plugin, state } = makeState();
        armSettle('insert');
        const next = state.apply(
            state.tr.insert(state.doc.content.size, para('new')),
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
        const ins = state.tr.insert(state.doc.content.size, para('new'));
        expect(changedRanges(ins)).toHaveLength(1);
        const del = state.tr.delete(0, 7);
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
