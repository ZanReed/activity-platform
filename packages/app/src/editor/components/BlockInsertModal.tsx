import { useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { createPortal } from 'react-dom';
import { FocusTrap } from 'focus-trap-react';
import {
    Search,
    X,
    Sigma,
    Columns2,
    GraduationCap,
    Image as ImageIcon,
    SquareDashedBottom,
    ListChecks,
    LineChart,
    MessageSquareText,
    type LucideIcon,
} from 'lucide-react';
import {
    slashMenuItems,
    isPickableBlock,
    type SlashMenuItem,
} from '../slashMenuItems';
import { blockThumbnails } from '../blockThumbnails';

// ============================================================================
// BlockInsertModal — the centered "Add a block" window.
// ----------------------------------------------------------------------------
// Two-pane: a rail of teaching categories on the left, the selected category's
// block CARDS on the right — each card is a static SVG mini-preview of the
// block (blockThumbnails) over its title, so the picker reads visually (slice-6
// stage 5: previews over prose). The one-line descriptions move out of the
// tiles into a quiet caption strip at the pane's bottom, shown for the
// hovered/focused card (and kept for screen readers as visually-hidden text
// inside each card). Opened from the in-canvas insert affordances (the gutter
// "+" and the end square). Insertion itself is owned by the caller (Editor)
// via onInsert, which knows the target position and handles the empty-doc
// cleanup; this component is pure picker UI.
//
// Categories are the `subgroup`s already tagged on slashMenuItems (plus the
// top-level Math group), so the catalogue is the same single source of truth
// the slash menu uses — no drift. Rail is alphabetical; Layout is preselected
// (subject-neutral starting point) unless the opener passes initialCategory
// (the first-run "A question" starter lands on Blanks). A search field
// filters across every block.
// ============================================================================

// A block's category: its subgroup, or the top-level group when it has none
// (Math). 'Choice & drag' is relabelled to the teacher-facing 'Choice &
// matching'; every other subgroup label is already teacher-facing.
function categoryLabel(item: SlashMenuItem): string {
    const raw = item.subgroup ?? item.group;
    return raw === 'Choice & drag' ? 'Choice & matching' : raw;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
    Blanks: SquareDashedBottom,
    'Choice & matching': ListChecks,
    'Free response': MessageSquareText,
    Graphing: LineChart,
    Instructional: GraduationCap,
    Layout: Columns2,
    Math: Sigma,
    'Media & figures': ImageIcon,
};

const DEFAULT_CATEGORY = 'Layout';

function matchesQuery(item: SlashMenuItem, q: string): boolean {
    if (q === '') return true;
    return (
        item.title.toLowerCase().includes(q) ||
        (item.keywords?.some((kw) => kw.includes(q)) ?? false)
    );
}

interface BlockInsertModalProps {
    editor: Editor;
    // Doc position the pick will insert at — used to tell whether we're inside a
    // container (column cell, etc.) so top-level-only blocks can be disabled.
    insertPos: number;
    // Rail category preselected on open (defaults to Layout). Must match a
    // categoryLabel; an unknown value just shows an empty pane, so callers pass
    // known labels only.
    initialCategory?: string;
    onInsert: (item: SlashMenuItem) => void;
    onClose: () => void;
}

export default function BlockInsertModal({
    editor,
    insertPos,
    initialCategory,
    onInsert,
    onClose,
}: BlockInsertModalProps) {
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(
        initialCategory ?? DEFAULT_CATEGORY,
    );
    // The caption strip's text: the hovered/focused card's description (or its
    // disabled hint). null = nothing hovered; the strip keeps its height so the
    // grid doesn't jump.
    const [caption, setCaption] = useState<string | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // Categories (alphabetical) and their items, derived once from the static
    // catalogue.
    const { categories, itemsByCategory } = useMemo(() => {
        const pickable = slashMenuItems.filter(isPickableBlock);
        const byCat = new Map<string, SlashMenuItem[]>();
        for (const item of pickable) {
            const label = categoryLabel(item);
            const bucket = byCat.get(label);
            if (bucket) bucket.push(item);
            else byCat.set(label, [item]);
        }
        const cats = [...byCat.keys()].sort((a, b) => a.localeCompare(b));
        return { categories: cats, itemsByCategory: byCat };
    }, []);

    const q = query.trim().toLowerCase();

    // Right-pane contents: search results across all blocks when querying,
    // otherwise the selected category's blocks.
    const paneItems = useMemo(() => {
        if (q !== '') {
            return slashMenuItems.filter(
                (i) => isPickableBlock(i) && matchesQuery(i, q),
            );
        }
        return itemsByCategory.get(activeCategory) ?? [];
    }, [q, activeCategory, itemsByCategory]);

    // Focus the search field on open.
    useEffect(() => {
        const raf = requestAnimationFrame(() => searchRef.current?.focus());
        return () => cancelAnimationFrame(raf);
    }, []);

    // Escape closes (capture so it beats editor-level handlers).
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                onClose();
            }
        };
        document.addEventListener('keydown', onKeyDown, true);
        return () => document.removeEventListener('keydown', onKeyDown, true);
    }, [onClose]);

    // Inside a column cell (or other container) the insert position sits below
    // the doc top level; top-level-only structural blocks are disabled there.
    const insideContainer =
        editor.state.doc.resolve(
            Math.min(insertPos, editor.state.doc.content.size),
        ).depth > 0;

    const itemStatus = (
        item: SlashMenuItem,
    ): { enabled: boolean; hint: string | undefined } => {
        if (item.topLevelOnly && insideContainer) {
            return {
                enabled: false,
                hint: 'Only available at the top level, not inside a column',
            };
        }
        if (!(item.isEnabled?.(editor) ?? true)) {
            return { enabled: false, hint: item.disabledHint };
        }
        return { enabled: true, hint: undefined };
    };

    const pick = (item: SlashMenuItem) => {
        if (!itemStatus(item).enabled) return;
        onInsert(item);
    };

    return createPortal(
        <FocusTrap
            active
            focusTrapOptions={{
                initialFocus: false,
                escapeDeactivates: false,
                allowOutsideClick: true,
                fallbackFocus: '.block-insert-window',
            }}
        >
            <div
                className="block-insert-overlay"
                onMouseDown={onClose}
                role="presentation"
            >
                <div
                    className="block-insert-window"
                    onMouseDown={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Add a block"
                >
                    <div className="block-insert-window__head">
                        <span className="block-insert-window__title">
                            Add a block
                        </span>
                        <button
                            type="button"
                            className="block-insert-window__close"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <X size={16} aria-hidden="true" />
                        </button>
                    </div>

                    <div className="block-insert-window__search">
                        <Search
                            size={15}
                            className="block-insert-window__search-icon"
                            aria-hidden="true"
                        />
                        <input
                            ref={searchRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search all blocks…"
                            aria-label="Search all blocks"
                        />
                    </div>

                    <div className="block-insert-window__body">
                        <nav
                            className="block-insert-rail"
                            aria-label="Block categories"
                        >
                            {categories.map((cat) => {
                                const Icon = CATEGORY_ICONS[cat];
                                const active = q === '' && cat === activeCategory;
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        aria-current={active || undefined}
                                        className={`block-insert-rail__item${
                                            active
                                                ? ' block-insert-rail__item--active'
                                                : ''
                                        }`}
                                        onClick={() => {
                                            setQuery('');
                                            setActiveCategory(cat);
                                        }}
                                    >
                                        {Icon ? (
                                            <Icon
                                                size={16}
                                                aria-hidden="true"
                                                className="block-insert-rail__icon"
                                            />
                                        ) : null}
                                        {cat}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="block-insert-pane">
                            <div className="block-insert-pane__heading">
                                {q === '' ? activeCategory : 'Results'}
                            </div>
                            <div className="block-insert-pane__grid">
                                {paneItems.length === 0 ? (
                                    <div className="block-insert-pane__empty">
                                        No blocks match “{query.trim()}”
                                    </div>
                                ) : (
                                    paneItems.map((item) => {
                                        const { enabled, hint } =
                                            itemStatus(item);
                                        // What the caption strip shows for this
                                        // card: its description, or why it's
                                        // unavailable.
                                        const detail = enabled
                                            ? item.description
                                            : (hint ?? item.description);
                                        return (
                                            <button
                                                key={item.title}
                                                type="button"
                                                // aria-disabled (not disabled) so
                                                // the card still fires hover/focus
                                                // for the caption strip and shows
                                                // its tooltip; pick() guards the
                                                // click.
                                                aria-disabled={
                                                    enabled ? undefined : true
                                                }
                                                title={
                                                    enabled ? undefined : hint
                                                }
                                                onClick={() => pick(item)}
                                                onMouseEnter={() =>
                                                    setCaption(detail)
                                                }
                                                onMouseLeave={() =>
                                                    setCaption(null)
                                                }
                                                onFocus={() =>
                                                    setCaption(detail)
                                                }
                                                onBlur={() => setCaption(null)}
                                                className={`block-insert-tile${
                                                    enabled
                                                        ? ''
                                                        : ' block-insert-tile--disabled'
                                                }`}
                                            >
                                                <span
                                                    className="block-insert-tile__thumb"
                                                    aria-hidden="true"
                                                >
                                                    {blockThumbnails[
                                                        item.title
                                                    ] ?? null}
                                                </span>
                                                <span className="block-insert-tile__title">
                                                    {item.title}
                                                </span>
                                                <span className="sr-only">
                                                    {item.description}
                                                </span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                            <div
                                className="block-insert-pane__caption"
                                aria-hidden="true"
                            >
                                {caption}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FocusTrap>,
        document.body,
    );
}
