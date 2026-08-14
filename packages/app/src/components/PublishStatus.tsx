// =============================================================================
// PublishStatus.tsx — the one published-status line under the editor header
// -----------------------------------------------------------------------------
// Renders whenever the activity is live: a "Live" dot + Open + Copy link,
// upgrading to "Published v{N}" for the session that just published (version
// is only known then). Since S9 Drop 1 the "published link" IS the viewer
// route — `${origin}/a/${activityId}` — so the line no longer depends on any
// published-URL env and always renders for a published activity. The viewer
// URL is stable across republishes, so Open/Copy work whether or not this
// session did the publish.
//
// Extracted from ActivityEditor (where it replaced the old standalone
// PublishedLink AND PublishControl's green success pill — two copy-link
// affordances for the same URL).
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { listClasses, type ClassInfo } from '../lib/classes';
import {
    ADD_FAILED_COPY,
    ADD_REFUSED_COPY,
} from './ClassActivitiesPanel';
import {
    isNotPublishedError,
    shareActivityToClass,
} from '../lib/classActivities';
import { supabase } from '../lib/supabase';

/** The canonical share URL for an activity: the viewer route on this origin.
 * This is what teachers hand to students — never a storage or backend URL. */
export function viewerShareUrl(activityId: string): string {
    return `${window.location.origin}/a/${activityId}`;
}

export default function PublishStatus({
    activityId,
    version,
}: {
    activityId: string;
    version: number | null;
}) {
    const url = viewerShareUrl(activityId);
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard write can fail in unsupported contexts; non-fatal */
        }
    };
    return (
        <span className="flex items-center gap-2 text-xs">
        <span className="flex items-center gap-1.5 font-medium text-muted">
        <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-success-accent"
        />
        {version != null ? `Published v${version}` : 'Live'}
        </span>
        <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-0.5 font-medium text-muted underline-offset-2 hover:text-ink hover:underline"
        >
        Open
        <ExternalLink size={12} aria-hidden="true" />
        </a>
        <button
        type="button"
        onClick={copy}
        className="font-medium text-muted underline-offset-2 hover:text-ink hover:underline"
        >
        {copied ? 'Copied!' : 'Copy link'}
        </button>
        <AddToClass activityId={activityId} />
        </span>
    );
}

// =============================================================================
// The post-publish hook (S9 Drop 2, board frame 3c): "Add to a class…" right
// where the publish landed — multi-period is the DOMINANT journey (DR-8), so
// after each success the select STAYS OPEN with the added class gone from the
// options; success lines cap at one per class ("Added to <name> ✓", ink text
// beside the existing success dot — color is never the carrier, DR-12).
// A teacher with no classes sees NO link (absent, not disabled). Esc
// collapses back to the link; opening moves focus to the select (DR-14).
// =============================================================================

type HookPhase =
    | { kind: 'link' }
    | { kind: 'loading' }
    | { kind: 'error' }
    | { kind: 'open' };

function AddToClass({ activityId }: { activityId: string }) {
    const [phase, setPhase] = useState<HookPhase>({ kind: 'link' });
    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
    const [lastAdded, setLastAdded] = useState<string | null>(null);
    const [selected, setSelected] = useState('');
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);
    const [hasClasses, setHasClasses] = useState<boolean | null>(null);
    const selectRef = useRef<HTMLSelectElement | null>(null);

    // The link is ABSENT for a teacher with no classes — which needs one
    // cheap probe up front. A probe failure just leaves the link out; the
    // full load path below has the real error state.
    useEffect(() => {
        let cancelled = false;
        listClasses()
            .then((list) => {
                if (!cancelled) setHasClasses(list.length > 0);
            })
            .catch(() => {
                if (!cancelled) setHasClasses(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (phase.kind !== 'open') return;
        selectRef.current?.focus();
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setPhase({ kind: 'link' });
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [phase.kind]);

    const open = async () => {
        setPhase({ kind: 'loading' });
        try {
            // The disclosure's read path (DR-9a): classes + which of them
            // already carry THIS activity, both before the picker enables.
            const [list, { data, error }] = await Promise.all([
                listClasses(),
                supabase
                    .from('class_activities')
                    .select('class_id')
                    .eq('activity_id', activityId),
            ]);
            if (error) throw new Error(error.message);
            setClasses(list);
            setAddedIds(
                new Set(
                    ((data ?? []) as { class_id: string }[]).map((r) => r.class_id),
                ),
            );
            setPhase({ kind: 'open' });
        } catch {
            setPhase({ kind: 'error' });
        }
    };

    // Takes the id as a PARAMETER: the exactly-one-class pre-select (DR-13)
    // is derived, not state, and reading `selected` here would race setState.
    const handleAdd = async (classId: string) => {
        if (!classId) return;
        setAdding(true);
        setAddError(null);
        try {
            await shareActivityToClass(classId, activityId);
            const name = classes.find((c) => c.id === classId)?.name ?? 'class';
            setAddedIds((prev) => new Set(prev).add(classId));
            setLastAdded(name);
            setSelected('');
            selectRef.current?.focus();
        } catch (err) {
            setAddError(
                isNotPublishedError(err) ? ADD_REFUSED_COPY : ADD_FAILED_COPY,
            );
        } finally {
            setAdding(false);
        }
    };

    if (hasClasses !== true) return null;

    if (phase.kind === 'link') {
        return (
            <button
            type="button"
            onClick={() => void open()}
            aria-expanded={false}
            className="font-semibold text-ink underline-offset-2 hover:underline"
            >
            {lastAdded ? 'Added ✓ — add to another…' : 'Add to a class…'}
            </button>
        );
    }
    if (phase.kind === 'loading') {
        return (
            <span role="status" className="text-muted">
            Loading…
            </span>
        );
    }
    if (phase.kind === 'error') {
        return (
            <span className="text-muted">
            We couldn&apos;t load this just now.{' '}
            <button
            type="button"
            onClick={() => void open()}
            className="font-medium text-ink underline underline-offset-2"
            >
            Try again
            </button>
            </span>
        );
    }

    const options = classes.filter((c) => !addedIds.has(c.id));
    // Exactly-one-class pre-selects (DR-13's written exception — no
    // wrong-class risk); otherwise placeholder + disabled Add.
    const effectiveSelected =
        selected || (options.length === 1 ? options[0]!.id : '');

    if (options.length === 0) {
        return (
            <span className="font-medium text-ink" role="status">
            Added to all your classes ✓
            </span>
        );
    }
    return (
        <span className="flex flex-wrap items-center gap-2">
        {lastAdded && (
            <span className="font-medium text-ink" role="status">
            Added to {lastAdded} ✓
            </span>
        )}
        <select
        ref={selectRef}
        aria-label="Add to class"
        value={effectiveSelected}
        onChange={(e) => setSelected(e.target.value)}
        disabled={adding}
        className="min-h-[44px] max-w-56 truncate rounded-md border border-line-strong bg-canvas px-2 py-1.5 text-sm text-ink"
        >
        <option value="">Choose a class…</option>
        {options.map((c) => (
            <option key={c.id} value={c.id}>
            {c.name}
            </option>
        ))}
        </select>
        <button
        type="button"
        onClick={() => void handleAdd(effectiveSelected)}
        disabled={!effectiveSelected || adding}
        className="min-h-[44px] rounded-md border border-line-strong bg-canvas px-3 text-sm font-medium text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
        >
        {adding ? 'Adding…' : 'Add'}
        </button>
        {addError && <span className="text-sm text-danger">{addError}</span>}
        </span>
    );
}
