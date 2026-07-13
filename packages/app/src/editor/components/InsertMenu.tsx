import { useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Search } from 'lucide-react';
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
// slashMenuItems.ts and it appears in both. Items render under their shared
// group headings and an optional second-level `subgroup` heading, each with
// its lucide icon in a left gutter. Contextual items (isEnabled) render
// disabled with their hint rather than hiding, so authors can discover them.
//
// Discoverability at scale: a filter field at the top narrows the list by the
// same title+keywords match the slash menu uses, so a growing catalogue stays
// navigable by typing rather than scrolling. It is a combobox — the input
// keeps focus while a highlight moves through the visible enabled items.
//
// Keyboard: the trigger opens on click / Enter / Space / ArrowDown, focusing
// the filter input; typing narrows; ArrowUp/ArrowDown move the highlight
// (Home/End jump); Enter activates the highlighted item; Escape closes and
// returns focus to the trigger; Tab or an outside click closes. Follows the
// sibling dropdowns' outside-click/Escape pattern (ColumnWidthPicker).
// ============================================================================

interface InsertMenuProps {
    editor: Editor;
    variant: 'activity' | 'reference';
}

// Same match the slash menu applies (title substring OR any keyword substring).
function matchesQuery(item: SlashMenuItem, q: string): boolean {
    if (q === '') return true;
    return (
        item.title.toLowerCase().includes(q) ||
        (item.keywords?.some((kw) => kw.includes(q)) ?? false)
    );
}

export default function InsertMenu({ editor, variant }: InsertMenuProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    // Index into the flat, render-ordered visible list of the highlighted item.
    const [activeIndex, setActiveIndex] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // The reference-panel editor registers a constrained extension set, so it
    // only offers the reference-safe items. Inline inserts that already have a
    // flat toolbar button (ƒx) are excluded everywhere, and the Text group is
    // the TextStylePicker's — block-style transforms, not insertions.
    const items = useMemo(
        () =>
            slashMenuItems.filter(
                (item) =>
                    item.group !== 'Text' &&
                    item.insertMenu !== false &&
                    (variant === 'activity' || item.referenceSafe),
            ),
        [variant],
    );

    const q = query.trim().toLowerCase();

    // Group → subgroup structure over the query-filtered items. Groups keep
    // their declared order; subgroups cluster in first-seen order within a
    // group. `flat` is the same items in render order, for keyboard nav.
    const { rendered, flat } = useMemo(() => {
        const visible = items.filter((item) => matchesQuery(item, q));
        const rendered = slashMenuGroups
            .map((group) => {
                const groupItems = visible.filter((i) => i.group === group);
                const order: string[] = [];
                const bySub = new Map<string, SlashMenuItem[]>();
                for (const item of groupItems) {
                    const key = item.subgroup ?? '';
                    let bucket = bySub.get(key);
                    if (!bucket) {
                        bucket = [];
                        bySub.set(key, bucket);
                        order.push(key);
                    }
                    bucket.push(item);
                }
                return {
                    group,
                    subgroups: order.map((key) => ({
                        key,
                        items: bySub.get(key)!,
                    })),
                };
            })
            .filter((g) => g.subgroups.length > 0);
        const flat = rendered.flatMap((g) =>
            g.subgroups.flatMap((s) => s.items),
        );
        return { rendered, flat };
    }, [items, q]);

    const isEnabled = (item: SlashMenuItem) => item.isEnabled?.(editor) ?? true;
    const enabledIndexes = flat.flatMap((item, i) =>
        isEnabled(item) ? [i] : [],
    );

    // Close on outside click while open (Escape is handled in the input's own
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

    // Reset the query and highlight each time the menu opens, and focus the
    // filter input so the author can type straight away.
    useEffect(() => {
        if (!open) return;
        setQuery('');
        inputRef.current?.focus();
    }, [open]);

    // Keep the highlight on the first enabled item whenever the filtered list
    // changes (open, or a keystroke narrowing the results).
    useEffect(() => {
        setActiveIndex(enabledIndexes[0] ?? -1);
        // enabledIndexes is derived from flat; keying on flat is sufficient and
        // avoids a new array identity every render re-running this.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flat]);

    // Scroll the highlighted item into view as the highlight moves.
    useEffect(() => {
        if (activeIndex < 0) return;
        itemRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    const close = (refocusTrigger: boolean) => {
        setOpen(false);
        if (refocusTrigger) triggerRef.current?.focus();
    };

    const pick = (item: SlashMenuItem) => {
        if (!isEnabled(item)) return;
        setOpen(false);
        // The command chain focuses the editor itself, so no trigger refocus.
        item.command({ editor });
    };

    // Move the highlight among enabled items, relative to the current one.
    const moveActive = (step: number | 'first' | 'last') => {
        if (enabledIndexes.length === 0) return;
        let target: number;
        if (step === 'first') {
            target = 0;
        } else if (step === 'last') {
            target = enabledIndexes.length - 1;
        } else {
            const pos = enabledIndexes.indexOf(activeIndex);
            target =
                pos === -1
                    ? 0
                    : (pos + step + enabledIndexes.length) %
                      enabledIndexes.length;
        }
        setActiveIndex(enabledIndexes[target] ?? -1);
    };

    const onInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            moveActive(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            moveActive(-1);
        } else if (e.key === 'Home') {
            e.preventDefault();
            moveActive('first');
        } else if (e.key === 'End') {
            e.preventDefault();
            moveActive('last');
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const item = flat[activeIndex];
            if (item) pick(item);
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
                aria-haspopup="dialog"
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
                    role="dialog"
                    aria-label="Insert a block"
                    className="absolute left-0 top-full z-20 mt-1 w-72 rounded-md border border-slate-200 bg-white shadow-lg"
                >
                    {/* Filter field — autofocused; combobox over the list below. */}
                    <div className="border-b border-slate-100 p-1.5">
                        <div className="flex items-center gap-1.5 rounded bg-slate-100 px-2">
                            <Search
                                size={14}
                                className="shrink-0 text-slate-400"
                                aria-hidden="true"
                            />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={onInputKeyDown}
                                placeholder="Filter blocks…"
                                aria-label="Filter blocks"
                                aria-controls="insert-menu-list"
                                aria-activedescendant={
                                    activeIndex >= 0
                                        ? `insert-item-${activeIndex}`
                                        : undefined
                                }
                                className="w-full bg-transparent py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div
                        id="insert-menu-list"
                        role="listbox"
                        aria-label="Insert a block"
                        className="max-h-80 overflow-y-auto p-1"
                    >
                        {flat.length === 0 ? (
                            <div className="px-2 py-3 text-center text-sm text-slate-400">
                                No blocks match “{query.trim()}”
                            </div>
                        ) : (
                            rendered.map(({ group, subgroups }) => (
                                <div key={group}>
                                    <div
                                        aria-hidden="true"
                                        className="px-2 pb-0.5 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 first:pt-1"
                                    >
                                        {group}
                                    </div>
                                    {subgroups.map(({ key, items }) => (
                                        <div
                                            key={key || group}
                                            role="group"
                                            aria-label={
                                                key ? `${group} — ${key}` : group
                                            }
                                        >
                                            {key ? (
                                                <div
                                                    aria-hidden="true"
                                                    className="px-2 pb-0.5 pt-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-300"
                                                >
                                                    {key}
                                                </div>
                                            ) : null}
                                            {items.map((item) => {
                                                flatIndex += 1;
                                                const i = flatIndex;
                                                const enabled = isEnabled(item);
                                                const Icon = item.icon;
                                                const active =
                                                    i === activeIndex;
                                                return (
                                                    <button
                                                        key={item.title}
                                                        id={`insert-item-${i}`}
                                                        ref={(el) => {
                                                            itemRefs.current[i] =
                                                                el;
                                                        }}
                                                        type="button"
                                                        role="option"
                                                        aria-selected={active}
                                                        disabled={!enabled}
                                                        title={
                                                            enabled
                                                                ? undefined
                                                                : item.disabledHint
                                                        }
                                                        // Pointer highlight tracks the same
                                                        // activeIndex the keyboard drives.
                                                        onMouseEnter={() => {
                                                            if (enabled)
                                                                setActiveIndex(
                                                                    i,
                                                                );
                                                        }}
                                                        onClick={() =>
                                                            pick(item)
                                                        }
                                                        className={`flex w-full items-start gap-2.5 rounded px-2 py-1.5 text-left transition ${
                                                            !enabled
                                                                ? 'cursor-not-allowed text-slate-300'
                                                                : active
                                                                  ? 'bg-slate-100 text-slate-700'
                                                                  : 'text-slate-700'
                                                        }`}
                                                    >
                                                        {Icon ? (
                                                            <Icon
                                                                size={16}
                                                                className={`mt-0.5 shrink-0 ${
                                                                    enabled
                                                                        ? 'text-slate-500'
                                                                        : 'text-slate-300'
                                                                }`}
                                                                aria-hidden="true"
                                                            />
                                                        ) : null}
                                                        <span className="min-w-0">
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
                                                                {
                                                                    item.description
                                                                }
                                                            </span>
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
