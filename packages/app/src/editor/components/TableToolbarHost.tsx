import { Suspense, lazy, useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { tableAt } from '../tableAt';

// =============================================================================
// TableToolbarHost — WHEN the table toolbar shows (tables GUI amendment
// 2026-11-12, T-1/T-2; table-block.md). One host at the editor root, like
// BlankPopoverHost. It stays small on purpose: the bar and its commands are a
// lazy chunk (TableToolbar.tsx), loaded the first time a teacher works in a
// table.
//
// Shows only while the teacher is working in the table: the caret is in one,
// and the editor has focus (a table first in the document doesn't raise the
// bar on load) or the bar itself does (keyboard use). Hidden when the table is
// scrolled out of view, so it never floats over other things.
//
// Keyboard way in: Tab moves between cells, so it can't reach a portaled bar.
// Alt+F10 in a table focuses the bar; arrows move along it; Escape goes back.
// =============================================================================

const TableToolbar = lazy(() => import('./TableToolbar'));

export default function TableToolbarHost({ editor }: { editor: Editor | null }) {
    const [, tick] = useState(0);
    const [toolbarFocused, setToolbarFocused] = useState(false);

    useEffect(() => {
        if (!editor) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'F10' && e.altKey && tableAt(editor.state)) {
                e.preventDefault();
                document.querySelector<HTMLButtonElement>('[data-table-toolbar] button:not(:disabled)')?.focus();
            }
        };
        const dom = editor.view.dom;
        dom.addEventListener('keydown', onKey);
        return () => dom.removeEventListener('keydown', onKey);
    }, [editor]);

    useEffect(() => {
        if (!editor) return;
        const bump = () => tick((t) => t + 1);
        editor.on('transaction', bump);
        editor.on('focus', bump);
        editor.on('blur', bump);
        window.addEventListener('scroll', bump, true);
        window.addEventListener('resize', bump);
        return () => {
            editor.off('transaction', bump);
            editor.off('focus', bump);
            editor.off('blur', bump);
            window.removeEventListener('scroll', bump, true);
            window.removeEventListener('resize', bump);
        };
    }, [editor]);

    if (!editor || !editor.isEditable || editor.isDestroyed) return null;
    if (!editor.isFocused && !toolbarFocused) return null;
    const at = tableAt(editor.state);
    if (!at) return null;
    const dom = editor.view.nodeDOM(at.pos) as HTMLElement | null;
    if (!dom || typeof dom.getBoundingClientRect !== 'function') return null;
    const rect = dom.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return null;

    return (
        <Suspense fallback={null}>
            <TableToolbar editor={editor} at={at} rect={rect} onFocusChange={setToolbarFocused} />
        </Suspense>
    );
}
