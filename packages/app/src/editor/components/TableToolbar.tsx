import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Editor } from '@tiptap/react';
import type { Align } from '../../lib/tableAligns';
import type { TableAt } from '../tableAt';
import { runWithAligns, setAlign } from '../tableCommands';

// =============================================================================
// TableToolbar — the bar itself (tables GUI amendment 2026-11-12, T-1/T-2;
// table-block.md). Its own lazy chunk: TableToolbarHost (eager, small) decides
// WHEN it shows; this file and the commands load the first time a teacher
// works in a table. That keeps the editor's ProseMirror ledger row under its
// cap, which is the lazy-chunk branch table-block.md R6 pre-chose.
//
// The buttons run prosemirror-tables' own commands (inherited by Table.ts), and
// a column insert or delete shifts `columnAligns` in the SAME transaction
// (tableCommands.ts), so a right-aligned number column keeps its alignment and
// one undo reverts both. Merge and split are never offered (D7.1). A table
// never shrinks below 1×1: the delete buttons are disabled then (TableAt says
// so; prosemirror-tables' `can()` check doesn't know).
//
// Buttons take mousedown with preventDefault, so the editor keeps its caret and
// the commands act on the cell the teacher was in.
// =============================================================================

export const TABLE_TOOLBAR_SHORTCUT = 'Alt+F10';

function Button({
    label,
    onPress,
    disabled = false,
    pressed,
    children,
}: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    pressed?: boolean;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            className="table-toolbar__button"
            aria-label={label}
            title={label}
            aria-pressed={pressed}
            disabled={disabled}
            onMouseDown={(e) => {
                e.preventDefault();
                if (!disabled) onPress();
            }}
            onClick={(e) => {
                // Keyboard activation (Enter / Space) arrives as a click with no
                // mousedown; a mouse press has already run.
                if (e.detail === 0 && !disabled) onPress();
            }}
        >
            {children}
        </button>
    );
}

export default function TableToolbar({
    editor,
    at,
    rect,
    onFocusChange,
}: {
    editor: Editor;
    at: TableAt;
    rect: DOMRect;
    onFocusChange: (focused: boolean) => void;
}) {
    const barRef = useRef<HTMLDivElement>(null);
    const SHORTCUT = TABLE_TOOLBAR_SHORTCUT;
    // Pressed only when every selected column has that alignment.
    const colAligns = Array.from({ length: at.right - at.left }, (_, i) => at.aligns?.[at.left + i] ?? 'left');
    const colAlign: Align | null = colAligns.every((a) => a === colAligns[0]) ? (colAligns[0] ?? 'left') : null;

    const onBarKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            editor.view.focus(); // back to the cell; the selection is kept
            return;
        }
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const buttons = Array.from(barRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
        const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const next = buttons[(i + (e.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length];
        if (next) {
            e.preventDefault();
            next.focus();
        }
    };

    return createPortal(
        <div
            className="table-toolbar"
            role="toolbar"
            aria-label="Table"
            aria-keyshortcuts={SHORTCUT}
            title={`Table tools. From a cell, ${SHORTCUT} moves here; Escape goes back.`}
            data-table-toolbar="true"
            ref={barRef}
            onKeyDown={onBarKey}
            onFocus={() => onFocusChange(true)}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onFocusChange(false);
            }}
            // Anchored by its BOTTOM just above the table, so a bar that wraps
            // to two lines grows upward instead of covering the header row.
            // Too close to the top of the window for that: sit below the table.
            style={
                rect.top < 56
                    ? { top: Math.min(window.innerHeight - 48, rect.bottom + 6), left: Math.max(4, rect.left) }
                    : { bottom: window.innerHeight - rect.top + 6, left: Math.max(4, rect.left) }
            }
        >
            <Button label="Add a row above" onPress={() => runWithAligns(editor, 'addRowBefore')}>
                + Row above
            </Button>
            <Button label="Add a row below" onPress={() => runWithAligns(editor, 'addRowAfter')}>
                + Row below
            </Button>
            <Button label="Add a column to the left" onPress={() => runWithAligns(editor, 'addColumnBefore')}>
                + Column left
            </Button>
            <Button label="Add a column to the right" onPress={() => runWithAligns(editor, 'addColumnAfter')}>
                + Column right
            </Button>
            <span className="table-toolbar__sep" aria-hidden="true" />
            <Button label="Align this column left" pressed={colAlign === 'left'} onPress={() => setAlign(editor, 'left')}>
                Left
            </Button>
            <Button label="Centre this column" pressed={colAlign === 'center'} onPress={() => setAlign(editor, 'center')}>
                Centre
            </Button>
            <Button label="Align this column right" pressed={colAlign === 'right'} onPress={() => setAlign(editor, 'right')}>
                Right
            </Button>
            <span className="table-toolbar__sep" aria-hidden="true" />
            <Button label="Delete this row" disabled={at.allRows} onPress={() => runWithAligns(editor, 'deleteRow')}>
                Delete row
            </Button>
            <Button
                label="Delete this column"
                disabled={at.allColumns}
                onPress={() => runWithAligns(editor, 'deleteColumn')}
            >
                Delete column
            </Button>
            <Button label="Delete the table" onPress={() => {
                    editor.chain().deleteTable().run();
                    editor.view.focus();
                }}>
                Delete table
            </Button>
        </div>,
        document.body,
    );
}
