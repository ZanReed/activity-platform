import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { slashMenuItems, type SlashMenuItem } from '../slashMenuItems';

// ============================================================================
// TextStylePicker — the toolbar's block-style dropdown (Docs' "Normal text").
// ----------------------------------------------------------------------------
// Renders the Text group of slashMenuItems: headings, paragraph, and lists are
// TRANSFORMS of the current block, not insertions, so they live with the
// selection-formatting controls instead of the "+ Insert" dropdown (which
// skips the group). Same single-source rule as InsertMenu: one entry in
// slashMenuItems.ts feeds the slash menu, this picker, and (for other groups)
// the Insert dropdown.
//
// The trigger shows the current block style via each item's isActive; when no
// Text style matches (e.g. the cursor is inside a problem body or a graph
// prompt) it falls back to a neutral "Text" label.
//
// Keyboard: same contract as InsertMenu — trigger opens on click / Enter /
// Space / ArrowDown; arrows cycle (Home/End jump); Enter/Space pick; Escape
// closes and returns focus to the trigger; Tab or an outside click closes.
// ============================================================================

const styleItems = slashMenuItems.filter((item) => item.group === 'Text');

interface TextStylePickerProps {
    editor: Editor;
}

export default function TextStylePicker({ editor }: TextStylePickerProps) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const current = styleItems.find((item) => item.isActive?.(editor));

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

    // Focus the current style (or the first item) when the menu opens.
    useEffect(() => {
        if (!open) return;
        const start = current ? styleItems.indexOf(current) : 0;
        itemRefs.current[start]?.focus();
        // Focus once per open — not on every transaction re-render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const pick = (item: SlashMenuItem) => {
        setOpen(false);
        // The command chain focuses the editor itself, so no trigger refocus.
        item.command({ editor });
    };

    const moveFocus = (step: number | 'first' | 'last') => {
        const active = document.activeElement;
        const pos = itemRefs.current.findIndex((el) => el === active);
        const target =
            step === 'first'
                ? 0
                : step === 'last'
                  ? styleItems.length - 1
                  : pos === -1
                    ? 0
                    : (pos + step + styleItems.length) % styleItems.length;
        itemRefs.current[target]?.focus();
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
            setOpen(false);
            triggerRef.current?.focus();
        } else if (e.key === 'Tab') {
            // Let focus move on naturally, but don't leave the menu open.
            setOpen(false);
        }
    };

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
                title="Text style of the current block"
                aria-haspopup="menu"
                aria-expanded={open}
                className="min-w-[7.5rem] rounded bg-white px-2 py-1 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
                {current?.title ?? 'Text'} ▾
            </button>

            {open ? (
                <div
                    role="menu"
                    aria-label="Text style"
                    onKeyDown={onMenuKeyDown}
                    className="absolute left-0 top-full z-20 mt-1 w-48 rounded-md border border-slate-200 bg-white p-1 shadow-lg"
                >
                    {styleItems.map((item, i) => {
                        const isCurrent = item === current;
                        return (
                            <button
                                key={item.title}
                                ref={(el) => {
                                    itemRefs.current[i] = el;
                                }}
                                type="button"
                                role="menuitemradio"
                                aria-checked={isCurrent}
                                onClick={() => pick(item)}
                                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition focus:outline-none ${
                                    isCurrent
                                        ? 'bg-slate-100 text-slate-900'
                                        : 'text-slate-700 hover:bg-slate-50 focus:bg-slate-50'
                                }`}
                            >
                                <StylePreview title={item.title} />
                                <span className="flex-1">{item.title}</span>
                                {isCurrent ? (
                                    <span aria-hidden="true" className="text-slate-400">
                                        ✓
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}

// A glyph rendered in the style it applies — the visual cue Docs-style
// pickers lead with, so a teacher recognizes the style before reading it.
function StylePreview({ title }: { title: string }) {
    switch (title) {
        case 'Heading 1':
            return <span aria-hidden="true" className="w-6 text-base font-bold">H1</span>;
        case 'Heading 2':
            return <span aria-hidden="true" className="w-6 text-sm font-bold">H2</span>;
        case 'Heading 3':
            return <span aria-hidden="true" className="w-6 text-xs font-bold">H3</span>;
        case 'Bullet list':
            return <span aria-hidden="true" className="w-6 text-slate-500">•</span>;
        case 'Numbered list':
            return <span aria-hidden="true" className="w-6 text-slate-500">1.</span>;
        default:
            return <span aria-hidden="true" className="w-6 text-slate-500">¶</span>;
    }
}
