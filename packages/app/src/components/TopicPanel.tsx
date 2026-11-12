// =============================================================================
// TopicPanel.tsx — the open Topics panel (F-1), a lazy chunk of TopicPicker.
// =============================================================================

import type { RefObject } from 'react';
import type { TopicGroup } from '../lib/listFilters';

export default function TopicPanel({
    groups,
    chosen,
    onToggle,
    find,
    setFind,
    place,
    rootRef,
    onClose,
    onTabOut,
}: {
    groups: readonly TopicGroup[];
    chosen: readonly string[];
    onToggle: (tag: string) => void;
    find: string;
    setFind: (v: string) => void;
    place: { top: number; left: number; width: number } | null;
    rootRef: RefObject<HTMLDivElement | null>;
    onClose: () => void;
    onTabOut: () => void;
}) {
    const q = find.trim().toLowerCase();
    const shown = groups
        .map((g) => ({ ...g, topics: g.topics.filter((t) => !q || t.tag.toLowerCase().includes(q)) }))
        .filter((g) => g.topics.length > 0);
    return (
                <div
                    role="dialog"
                    aria-label="Filter by topic"
                    className="fixed z-30 rounded-lg border border-line bg-canvas p-3 shadow-lg"
                    style={place ? { top: place.top, left: place.left, width: place.width } : { visibility: 'hidden' }}
                    onBlur={(e) => {
                        // Tabbing out of the panel closes it (keyboard users
                        // never fire the outside-mousedown close).
                        const to = e.relatedTarget as Node | null;
                        if (to && !rootRef.current?.contains(to)) onTabOut();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            e.stopPropagation();
                            onClose();
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
    );
}
