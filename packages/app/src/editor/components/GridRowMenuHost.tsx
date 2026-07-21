import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Editor } from '@tiptap/react';
import { Combine, Plus } from 'lucide-react';
import { useRowMenu, closeRowMenu } from './gridRowMenu';

// ============================================================================
// GridRowMenuHost — the multi-col row grip's click-menu (strict-grid slice 3).
// ----------------------------------------------------------------------------
// A single host at the editor root (mirrors BlockQuickBarHost / BlockAddButton-
// Host — never per-row) that renders the recovery menu the grip opens on click.
// Two actions, both reusing existing commands that already accept the row
// NodeSelection the grip sets: dissolveRow (Merge to one column) and addRowBelow
// (Add row below). The grip stays the drag handle; this is a pointer-only
// enhancement — the keyboard-accessible path stays the toolbar's Merge / Row
// below buttons (a real focusable pair). Body-portaled, fixed-positioned under
// the grip, so it is NOT one of the canvas-anchored position-measured hosts.
// ============================================================================

interface GridRowMenuHostProps {
    editor: Editor | null;
}

export default function GridRowMenuHost({ editor }: GridRowMenuHostProps) {
    const anchor = useRowMenu();
    const menuRef = useRef<HTMLDivElement>(null);

    // Dismiss on outside pointer-down or Escape. Deferred one tick so the very
    // click that opened the menu (still bubbling) can't immediately close it.
    useEffect(() => {
        if (!anchor) return;
        const onPointerDown = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                closeRowMenu();
            }
        };
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeRowMenu();
        };
        const armed = window.setTimeout(() => {
            document.addEventListener('mousedown', onPointerDown);
            document.addEventListener('keydown', onKey);
        }, 0);
        return () => {
            window.clearTimeout(armed);
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [anchor]);

    if (!editor || !anchor) return null;

    const run = (command: 'dissolveRow' | 'addRowBelow') => {
        // .focus() restores the row NodeSelection the grip set (ProseMirror keeps
        // it through the blur); the command reads it directly.
        editor.chain().focus()[command]().run();
        closeRowMenu();
    };

    return createPortal(
        <div
            ref={menuRef}
            className="grid-row-menu"
            role="menu"
            aria-label="Row layout actions"
            style={{ top: anchor.bottom + 4, left: anchor.left }}
        >
            <button
                type="button"
                role="menuitem"
                className="grid-row-menu__item"
                onClick={() => run('dissolveRow')}
            >
                <Combine size={14} aria-hidden="true" />
                Merge to one column
            </button>
            <button
                type="button"
                role="menuitem"
                className="grid-row-menu__item"
                onClick={() => run('addRowBelow')}
            >
                <Plus size={14} aria-hidden="true" />
                Add row below
            </button>
        </div>,
        document.body,
    );
}
