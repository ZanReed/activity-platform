// =============================================================================
// TopicPicker.tsx — "Topics (N) ▾" and the chosen-topic chips (F-1, F-2)
// -----------------------------------------------------------------------------
// At rest the whole topic vocabulary is one button whose count tells the
// teacher the options exist. Open, it is a panel with its own search and the
// topics grouped by unit, each with how many activities carry it. Chosen
// topics show as removable chips on one line under the bar.
// =============================================================================

import { Suspense, lazy, useEffect, useRef, useState } from 'react';

// The open panel is its own chunk: the list pages' first download has no room
// for it (perf-budgets journeys), and it is only needed once opened.
const TopicPanel = lazy(() => import('./TopicPanel'));
import { topicCount, type TopicGroup } from '../lib/listFilters';

export function TopicPicker({
    groups,
    chosen,
    onToggle,
}: {
    groups: readonly TopicGroup[];
    chosen: readonly string[];
    onToggle: (tag: string) => void;
}) {
    const [open, setOpen] = useState(false);
    // Where the panel sits: measured from the button on open and clamped to
    // the screen, so it never opens off either edge (Fable review: a button
    // that wraps to the start of a line at phone width pushed it off the left).
    const [place, setPlace] = useState<{ top: number; left: number; width: number } | null>(null);
    const [find, setFind] = useState('');
    const rootRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;
        const measure = () => {
            const r = buttonRef.current?.getBoundingClientRect();
            if (!r) return;
            const margin = 16;
            const width = Math.min(352, window.innerWidth - 2 * margin);
            const left = Math.max(margin, Math.min(r.right - width, window.innerWidth - width - margin));
            setPlace({ top: r.bottom + 4, left, width });
        };
        measure();
        const onDown = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        window.addEventListener('resize', measure);
        window.addEventListener('scroll', measure, true);
        return () => {
            document.removeEventListener('mousedown', onDown);
            window.removeEventListener('resize', measure);
            window.removeEventListener('scroll', measure, true);
        };
    }, [open]);

    const total = topicCount(groups);
    if (total === 0) return null;
    const close = () => {
        setOpen(false);
        setFind('');
        buttonRef.current?.focus();
    };

    return (
        <div className="relative" ref={rootRef}>
            <button
                ref={buttonRef}
                type="button"
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={() => (open ? close() : setOpen(true))}
                className={`min-h-9 whitespace-nowrap rounded-md border px-3 text-sm font-medium transition ${
                    chosen.length > 0 ? 'border-ink bg-surface text-ink' : 'border-line-strong bg-canvas text-strong hover:bg-surface'
                }`}
            >
                {chosen.length > 0 ? `Topics · ${chosen.length} chosen` : `Topics (${total})`} ▾
            </button>
            {open && (
                <Suspense fallback={null}>
                    <TopicPanel
                        groups={groups}
                        chosen={chosen}
                        onToggle={onToggle}
                        find={find}
                        setFind={setFind}
                        place={place}
                        rootRef={rootRef}
                        onClose={close}
                        onTabOut={() => setOpen(false)}
                    />
                </Suspense>
            )}
        </div>
    );
}

/** F-2: the chosen topics, one line, each removable, then Clear. */
export function ChosenTopics({
    chosen,
    onRemove,
    onClear,
}: {
    chosen: readonly string[];
    onRemove: (tag: string) => void;
    onClear: () => void;
}) {
    if (chosen.length === 0) return null;
    return (
        <div className="mt-2 flex flex-wrap items-center gap-1.5" aria-label="Chosen topics" role="group">
            {chosen.map((t) => (
                <button
                    key={t}
                    type="button"
                    onClick={() => onRemove(t)}
                    aria-label={`Remove topic ${t}`}
                    className="inline-flex items-center gap-1 rounded-full border border-ink bg-primary px-2.5 py-1 text-xs font-medium text-white"
                >
                    {t} <span aria-hidden="true">×</span>
                </button>
            ))}
            <button type="button" onClick={onClear} className="text-xs font-medium text-muted underline underline-offset-2 hover:text-strong">
                Clear topics
            </button>
        </div>
    );
}
