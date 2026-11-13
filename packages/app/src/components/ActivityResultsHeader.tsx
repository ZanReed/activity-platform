// =============================================================================
// ActivityResultsHeader.tsx — one header for an activity's results pages
// (UI review C-7, docs/design/ui-review-group-c.md)
// -----------------------------------------------------------------------------
// Progress, Responses and Analytics each had their own "Back to editor" link
// (they are opened from My activities) and none linked to the others. Now one
// header: a way back, the activity's title, and tabs between the three pages
// and the editor.
// =============================================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { fetchActivityTitle } from '../lib/activityTitle';

export type ResultsTab = 'progress' | 'responses' | 'analytics';

const TABS: readonly { key: ResultsTab | 'edit'; label: string; path: (id: string) => string }[] = [
    { key: 'progress', label: 'Progress', path: (id) => `/activity/${id}/progress` },
    { key: 'responses', label: 'Responses', path: (id) => `/activity/${id}/responses` },
    { key: 'analytics', label: 'Analytics', path: (id) => `/activity/${id}/analytics` },
    { key: 'edit', label: 'Edit', path: (id) => `/activity/${id}` },
];

export default function ActivityResultsHeader({
    activityId,
    title,
    current,
    back,
}: {
    activityId: string;
    /** The activity's title. `undefined` = the header reads it itself (the
     *  page has no other reason to); `null` = the page owns it, not known yet. */
    title?: string | null;
    current: ResultsTab;
    /** Where "back" goes; My activities unless the page was opened elsewhere
     *  (e.g. Responses opened from a class's progress grid). */
    back?: { to: string; label: string } | null;
}) {
    const [fetched, setFetched] = useState<string | null>(null);
    const own = title === undefined;
    useEffect(() => {
        setFetched(null); // never show the previous activity's title
        if (!own || !activityId) return;
        let live = true;
        // A missing title only costs the line; the page itself still works.
        void fetchActivityTitle(activityId).then((t) => {
            if (live && t) setFetched(t);
        });
        return () => {
            live = false;
        };
    }, [own, activityId]);
    const shown = own ? fetched : title;
    const to = back?.to ?? '/activities';
    const label = back?.label ?? 'My activities';
    return (
        <header className="mb-4" data-results-header>
            <p className="text-sm text-muted">
                <Link to={to} className="underline underline-offset-2 hover:text-strong">
                    ← {label}
                </Link>
            </p>
            {shown ? <p className="mt-1 text-lg font-semibold text-ink">{shown}</p> : null}
            <nav aria-label="This activity" className="mt-2 flex flex-wrap gap-1 border-b border-line">
                {TABS.map((t) =>
                    t.key === current ? (
                        <span
                            key={t.key}
                            aria-current="page"
                            className="-mb-px border-b-2 border-ink px-3 py-1.5 text-sm font-semibold text-ink"
                        >
                            {t.label}
                        </span>
                    ) : (
                        <Link
                            key={t.key}
                            to={t.path(activityId)}
                            className="px-3 py-1.5 text-sm font-medium text-muted hover:text-strong"
                        >
                            {t.label}
                        </Link>
                    ),
                )}
            </nav>
        </header>
    );
}
