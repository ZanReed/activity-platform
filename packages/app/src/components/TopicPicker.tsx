// =============================================================================
// TopicPicker.tsx — "Topics (N) ▾" and the chosen-topic chips (F-1, F-2)
// -----------------------------------------------------------------------------
// At rest the whole topic vocabulary is one button whose count tells the
// teacher the options exist. Open, it is a panel with its own search and the
// topics grouped by unit, each with how many activities carry it. Chosen
// topics show as removable chips on one line under the bar.
// =============================================================================

import { useEffect, useRef, useState } from 'react';
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
    const [find, setFind] = useState('');
    const rootRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [open]);

    const total = topicCount(groups);
    if (total === 0) return null;
    const q = find.trim().toLowerCase();
    const shown = groups
        .map((g) => ({ ...g, topics: g.topics.filter((t) => !q || t.tag.toLowerCase().includes(q)) }))
        .filter((g) => g.topics.length > 0);

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
                <div
                    role="dialog"
                    aria-label="Filter by topic"
                    className="absolute right-0 z-30 mt-1 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-line bg-canvas p-3 shadow-lg"
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            e.stopPropagation();
                            close();
                        }
                    }}
                >
                    <input
                        type="search"
                        autoFocus
                        value={find}
                        onChange={(e) => setFind(e.target.value)}
                        placeholder="Find a topic"
                        aria-label="Find a topic"
                        className="w-full rounded-md border border-line-strong bg-canvas px-2.5 py-1.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
                    />
                    <div className="mt-2 max-h-80 overflow-y-auto pr-1">
                        {shown.length === 0 && <p className="py-2 text-sm text-muted">No topic matches.</p>}
                        {shown.map((g) => (
                            <fieldset key={g.unit ?? '__none'} className="mt-2 first:mt-0">
                                <legend className="text-xs font-semibold text-muted">{g.unit ?? 'No unit'}</legend>
                                {g.topics.map((t) => (
                                    <label key={t.tag} className="flex min-h-8 cursor-pointer items-center gap-2 text-sm text-ink">
                                        <input
                                            type="checkbox"
                                            checked={chosen.includes(t.tag)}
                                            onChange={() => onToggle(t.tag)}
                                            aria-label={`${t.tag} (${t.count})`}
                                        />
                                        <span className="min-w-0 flex-1 truncate" aria-hidden="true">{t.tag}</span>
                                        <span className="text-xs text-muted" aria-hidden="true">{t.count}</span>
                                    </label>
                                ))}
                            </fieldset>
                        ))}
                    </div>
                </div>
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
