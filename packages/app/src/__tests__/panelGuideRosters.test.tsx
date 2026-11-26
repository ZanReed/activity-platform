// @vitest-environment jsdom
// =============================================================================
// panelGuideRosters.test.tsx — the reference-panel and teacher-guide editors
// can only make blocks the save path reads back (review 2026-11-26, C2)
// -----------------------------------------------------------------------------
// The main editor's roster is guarded in blockTypeGuards.test.ts (every node a
// column accepts has a tiptapBlockToActivity case). The panel and guide editors
// build their OWN schemas (ReferencePanelEditor.tsx, TeacherGuideEditor.tsx),
// and their top-level `doc` accepts more than a column does: StarterKit's
// horizontalRule was on in the panel, so a typed `---` made a rule that
// tiptapBlockToActivity dropped on save. This mounts each real editor and reads
// the schema it actually built — no copied extension list to drift.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import type { Editor } from '@tiptap/core';
import ReferencePanelEditor from '../editor/ReferencePanelEditor';
import TeacherGuideEditor from '../editor/TeacherGuideEditor';
import { tiptapBlockToActivity } from '../lib/serialize';

afterEach(cleanup);

const EMPTY = { type: 'doc', content: [{ type: 'paragraph' }] };

// Tiptap hangs the editor on its view's DOM node.
function mountedEditor(container: HTMLElement): Editor {
    const dom = container.querySelector('.ProseMirror') as (HTMLElement & { editor?: Editor }) | null;
    expect(dom?.editor, 'the editor mounted').toBeDefined();
    return dom!.editor!;
}

function topLevelNodes(editor: Editor) {
    const doc = editor.schema.topNodeType;
    return Object.values(editor.schema.nodes).filter((t) => doc.contentMatch.matchType(t) !== null);
}

const EDITORS = [
    ['reference panel', () => render(<ReferencePanelEditor initialContent={EMPTY} onUpdate={() => {}} />)],
    ['teacher guide', () => render(<TeacherGuideEditor initialContent={EMPTY} onUpdate={() => {}} />)],
] as const;

describe.each(EDITORS)('the %s editor', (_name, mount) => {
    it('accepts some top-level blocks (the roster is not empty)', () => {
        const { container } = mount();
        expect(topLevelNodes(mountedEditor(container)).length).toBeGreaterThan(3);
    });

    it('every top-level node it can make has a tiptapBlockToActivity case', () => {
        const { container } = mount();
        const editor = mountedEditor(container);
        const missing: string[] = [];
        for (const type of topLevelNodes(editor)) {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            try {
                tiptapBlockToActivity((type.createAndFill() ?? type.create()).toJSON());
                if (warn.mock.calls.some((c) => String(c[0]).includes('Skipping unsupported Tiptap block'))) {
                    missing.push(type.name);
                }
            } finally {
                warn.mockRestore();
            }
        }
        expect(missing, 'these would vanish on save').toEqual([]);
    });
});
