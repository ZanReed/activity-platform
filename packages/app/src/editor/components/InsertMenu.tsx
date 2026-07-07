import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
    slashMenuGroups,
    slashMenuItems,
    type SlashMenuItem,
} from '../slashMenuItems';

// ============================================================================
// InsertMenu — the toolbar's "+ Insert" dropdown for ALL block insertion.
// ----------------------------------------------------------------------------
// Driven by slashMenuItems (the same list the slash menu renders), so the two
// surfaces can never drift: adding a block type is one entry in
// slashMenuItems.ts and it appears in both. Items are grouped under the shared
// group headings; contextual items (isEnabled) render disabled with their
// hint rather than hiding, so authors can discover them.
//
// Keyboard: the trigger opens on click / Enter / Space / ArrowDown; focus
// moves into the menu; ArrowUp/ArrowDown cycle the enabled items (Home/End
// jump); Enter/Space activate; Escape closes and returns focus to the
// trigger; Tab or an outside click closes. Follows the sibling dropdowns'
// outside-click/Escape pattern (ColumnWidthPicker, CellHeightControl).
// ============================================================================

interface InsertMenuProps {
    editor: Editor;
    variant: 'activity' | 'reference';
}

export default function InsertMenu({ editor, variant }: InsertMenuProps) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // The reference-panel editor registers a constrained extension set, so it
    // only offers the reference-safe items. Inline inserts that already have a
    // flat toolbar button (ƒx) are excluded everywhere.
    const items = slashMenuItems.filter(
        (item) =>
            item.insertMenu !== false &&
            (variant === 'activity' || item.referenceSafe),
    );
    const groups = slashMenuGroups
        .map((group) => ({
            group,
            items: items.filter((item) => item.group === group),
        }))
        .filter(({ items }) => items.length > 0);

    // Flat render order, for the roving keyboard focus.
    const flat = groups.flatMap(({ items }) => items);
    const enabledIndexes = flat.flatMap((item, i) =>
        (item.isEnabled?.(editor) ?? true) ? [i] : [],
    );

    // Close on outside click while open (Escape is handled in the menu's own
    // keydown so it can return focus to the trigger).
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [open]);

    // Focus the first enabled item when the menu opens.
    useEffect(() => {
        if (!open) return;
        const first = enabledIndexes[0];
        if (first !== undefined) itemRefs.current[first]?.focus();
        // Focus once per open — not on every transaction re-render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const close = (refocusTrigger: boolean) => {
        setOpen(false);
        if (refocusTrigger) triggerRef.current?.focus();
    };

    const pick = (item: SlashMenuItem) => {
        setOpen(false);
        // The command chain focuses the editor itself, so no trigger refocus.
        item.command({ editor });
    };

    // Roving focus among enabled items, relative to the currently focused one.
    const moveFocus = (step: number | 'first' | 'last') => {
        if (enabledIndexes.length === 0) return;
        let target: number;
        if (step === 'first') {
            target = 0;
        } else if (step === 'last') {
            target = enabledIndexes.length - 1;
        } else {
            const active = document.activeElement;
            const pos = enabledIndexes.findIndex(
                (i) => itemRefs.current[i] === active,
            );
            target =
                pos === -1
                    ? 0
                    : (pos + step + enabledIndexes.length) %
                      enabledIndexes.length;
        }
        const index = enabledIndexes[target];
        if (index !== undefined) itemRefs.current[index]?.focus();
    };

    const onMenuKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            moveFocus(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            moveFocus(-1);
        } else if (e.key === 'Home') {
            e.preventDefault();
            moveFocus('first');
        } else if (e.key === 'End') {
            e.preventDefault();
            moveFocus('last');
        } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            close(true);
        } else if (e.key === 'Tab') {
            // Let focus move on naturally, but don't leave the menu open.
            setOpen(false);
        }
    };

    let flatIndex = -1;

    return (
        <div ref={rootRef} className="relative">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((o) => !o)}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowDown' && !open) {
                        e.preventDefault();
                        setOpen(true);
                    }
                }}
                title="Insert a block"
                aria-haspopup="menu"
                aria-expanded={open}
                className={`min-w-[32px] rounded px-2 py-1 text-sm font-medium transition ${
                    open
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
            >
                + Insert ▾
            </button>

            {open ? (
                <div
                    role="menu"
                    aria-label="Insert a block"
                    onKeyDown={onMenuKeyDown}
                    className="absolute left-0 top-full z-20 mt-1 max-h-96 w-64 overflow-y-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg"
                >
                    {groups.map(({ group, items }) => (
                        <div key={group} role="group" aria-label={group}>
                            <div
                                aria-hidden="true"
                                className="px-2 pb-0.5 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 first:pt-1"
                            >
                                {group}
                            </div>
                            {items.map((item) => {
                                flatIndex += 1;
                                const i = flatIndex;
                                const enabled =
                                    item.isEnabled?.(editor) ?? true;
                                return (
                                    <button
                                        key={item.title}
                                        ref={(el) => {
                                            itemRefs.current[i] = el;
                                        }}
                                        type="button"
                                        role="menuitem"
                                        disabled={!enabled}
                                        title={
                                            enabled
                                                ? undefined
                                                : item.disabledHint
                                        }
                                        onClick={() => pick(item)}
                                        className={`block w-full rounded px-2 py-1.5 text-left transition ${
                                            enabled
                                                ? 'text-slate-700 hover:bg-slate-100 focus:bg-slate-100 focus:outline-none'
                                                : 'cursor-not-allowed text-slate-300'
                                        }`}
                                    >
                                        <span className="block text-sm font-medium">
                                            {item.title}
                                        </span>
                                        <span
                                            className={`block text-xs ${
                                                enabled
                                                    ? 'text-slate-500'
                                                    : 'text-slate-300'
                                            }`}
                                        >
                                            {item.description}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
