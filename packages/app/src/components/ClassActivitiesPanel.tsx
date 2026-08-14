// =============================================================================
// ClassActivitiesPanel.tsx — "On students' Home" (S9 Drop 2, board frames 3a/3b)
// -----------------------------------------------------------------------------
// The teacher side of the content surface, built verbatim from the v2 board:
//
//  * ONE verb system (DR-2): Add / Remove; the section header says where the
//    rows GO ("On students' Home") — placement language, never access
//    language (OV-9: share = discovery, published = open).
//  * The list MIRRORS the student list's ordering (DR-1: newest first,
//    tiebreak (added_at, activity_id)) — a deliberate verification
//    affordance: what the teacher sees IS what students see, in order.
//  * Count = COMMITTED rows only (DR-3); every mutation refetches the shared
//    page-level data, so the count and the picker can never drift from the
//    server.
//  * Remove is CONFIRMED, not optimistic (DR-5): the row becomes an undo-row
//    only after the RPC succeeds; undo failure persists the undo-row with
//    honest copy and a stopped timer.
//  * Dead rows (DR-7): a shared-then-unpublished/deleted activity renders
//    muted with "No longer published — students don't see this" + Remove —
//    self-healing, and it explains any count divergence from the student view.
//
// The data is loaded ONCE per Classes-page mount (all classes, one query) and
// shared down; this panel filters its class's rows. The disclosure-open
// loading/error states (DR-9a) render from that shared status.
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    formatListDate,
    isNotPublishedError,
    listPublishedActivities,
    listTeacherClassActivities,
    shareActivityToClass,
    unshareActivityFromClass,
    type PublishedActivityOption,
    type TeacherClassActivity,
} from '../lib/classActivities';

export const UNDO_WINDOW_MS = 6000;

// The DR-9 copy, exported so RTL rows assert the ruled strings, never retyped.
export const ADD_FAILED_COPY = "Couldn't add just now — try again.";
export const ADD_REFUSED_COPY =
    "This activity can't be added — it's no longer published. Check it in your Activities list.";
export const REMOVE_FAILED_COPY = "Couldn't remove just now — try again.";
export const UNDO_FAILED_COPY = "Couldn't restore — add it again below.";
export const DEAD_ROW_COPY = "No longer published — students don't see this";
export const READ_FAILED_COPY = "We couldn't load this just now.";
export const EMPTY_COPY =
    "No activities yet. Add one below and it appears on your students' Home.";
export const ALL_ADDED_COPY =
    'All your published activities are already in this class. Publish another to add it.';
export const NONE_PUBLISHED_COPY =
    "You haven't published any activities yet. Publish one and it'll be ready to add.";

export type TeacherActivitiesStatus = 'loading' | 'ready' | 'error';

export interface TeacherActivitiesData {
    status: TeacherActivitiesStatus;
    rows: TeacherClassActivity[];
    options: PublishedActivityOption[];
    reload: () => Promise<void>;
}

/**
 * The page-level data hook (one pair of queries for ALL classes — counts on
 * every card, rows + picker in every panel). Classes.tsx owns the instance.
 */
export function useTeacherClassActivities(): TeacherActivitiesData {
    const [status, setStatus] = useState<TeacherActivitiesStatus>('loading');
    const [rows, setRows] = useState<TeacherClassActivity[]>([]);
    const [options, setOptions] = useState<PublishedActivityOption[]>([]);

    const reload = useCallback(async () => {
        try {
            const [nextRows, nextOptions] = await Promise.all([
                listTeacherClassActivities(),
                listPublishedActivities(),
            ]);
            setRows(nextRows);
            setOptions(nextOptions);
            setStatus('ready');
        } catch {
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        void reload();
    }, [reload]);

    return { status, rows, options, reload };
}

interface UndoEntry {
    activityId: string;
    title: string;
    phase: 'counting' | 'failed';
}

export default function ClassActivitiesPanel({
    classId,
    data,
}: {
    classId: string;
    data: TeacherActivitiesData;
}) {
    const rows = data.rows.filter((r) => r.classId === classId);
    const addedIds = new Set(rows.map((r) => r.activityId));
    const options = data.options.filter((o) => !addedIds.has(o.id));

    const [selected, setSelected] = useState('');
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);
    const [removeError, setRemoveError] = useState<string | null>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [undos, setUndos] = useState<UndoEntry[]>([]);
    const [announce, setAnnounce] = useState('');
    const selectRef = useRef<HTMLSelectElement | null>(null);
    // The undo timers, keyed by activityId. Paused = timer cleared but the
    // entry stays; resumed = a fresh full window (simpler than tracking
    // remaining ms, and strictly more forgiving — never less).
    const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
    const hovered = useRef(new Set<string>());

    useEffect(() => {
        const all = timers.current;
        return () => {
            for (const t of all.values()) clearTimeout(t);
        };
    }, []);

    const expireUndo = useCallback((activityId: string, hadFocus: boolean) => {
        timers.current.delete(activityId);
        setUndos((prev) => prev.filter((u) => u.activityId !== activityId));
        // DR-14: on expiry with focus inside the undo-row, hand focus to the
        // Add select rather than dropping it on the floor.
        if (hadFocus) selectRef.current?.focus();
    }, []);

    const armUndoTimer = useCallback(
        (activityId: string) => {
            const existing = timers.current.get(activityId);
            if (existing) clearTimeout(existing);
            timers.current.set(
                activityId,
                setTimeout(() => expireUndo(activityId, false), UNDO_WINDOW_MS),
            );
        },
        [expireUndo],
    );

    const pauseUndoTimer = useCallback((activityId: string) => {
        const t = timers.current.get(activityId);
        if (t) clearTimeout(t);
        timers.current.delete(activityId);
    }, []);

    const handleAdd = async () => {
        if (!selected) return;
        setAdding(true);
        setAddError(null);
        try {
            await shareActivityToClass(classId, selected);
            await data.reload();
            setSelected('');
            setAnnounce('Added.');
            selectRef.current?.focus();
        } catch (err) {
            // Selection preserved on failure (DR-9c) so retry is one click.
            setAddError(isNotPublishedError(err) ? ADD_REFUSED_COPY : ADD_FAILED_COPY);
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (row: TeacherClassActivity) => {
        setRemovingId(row.activityId);
        setRemoveError(null);
        try {
            await unshareActivityFromClass(classId, row.activityId);
            await data.reload();
            // CONFIRMED remove (DR-5): the undo-row appears only now.
            setUndos((prev) => [
                ...prev.filter((u) => u.activityId !== row.activityId),
                { activityId: row.activityId, title: row.title, phase: 'counting' },
            ]);
            armUndoTimer(row.activityId);
            setAnnounce(`“${row.title}” removed. Undo available.`);
        } catch {
            setRemoveError(REMOVE_FAILED_COPY);
        } finally {
            setRemovingId(null);
        }
    };

    const handleUndo = async (undo: UndoEntry) => {
        pauseUndoTimer(undo.activityId);
        try {
            await shareActivityToClass(classId, undo.activityId);
            await data.reload();
            setUndos((prev) => prev.filter((u) => u.activityId !== undo.activityId));
        } catch {
            // Honest undo failure (DR-5): the row persists, timer stays
            // stopped — covers the unpublished-during-window race too.
            setUndos((prev) =>
                prev.map((u) =>
                    u.activityId === undo.activityId ? { ...u, phase: 'failed' } : u,
                ),
            );
        }
    };

    if (data.status === 'loading') {
        return (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted" role="status" data-panel-loading>
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-line-strong border-t-ink" aria-hidden="true" />
            Loading…
            </p>
        );
    }
    if (data.status === 'error') {
        return (
            <p className="mt-3 text-sm text-muted">
            {READ_FAILED_COPY}{' '}
            <button
            type="button"
            onClick={() => void data.reload()}
            className="font-medium text-ink underline underline-offset-2"
            >
            Try again
            </button>
            </p>
        );
    }

    return (
        <div className="mt-3">
        <span aria-live="polite" role="status" className="sr-only">
        {announce}
        </span>
        <h3 className="text-sm font-semibold text-ink">On students&apos; Home</h3>
        {rows.length === 0 && undos.length === 0 ? (
            options.length === 0 && data.options.length === 0 ? null : (
                <p className="mt-1 text-sm text-muted">{EMPTY_COPY}</p>
            )
        ) : (
            <ul className="mt-1">
            {rows.map((row) => (
                <li
                key={row.activityId}
                className="ml-3 flex min-h-[44px] items-center justify-between gap-3 border-l-2 border-line py-1.5 pl-3"
                >
                <span
                title={row.title}
                className={`min-w-0 truncate text-sm font-medium ${
                    row.published ? 'text-ink' : 'text-muted line-through'
                }`}
                >
                {row.title}
                </span>
                <span className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-muted">
                {row.published ? `Added ${formatListDate(row.addedAt)}` : DEAD_ROW_COPY}
                </span>
                <button
                type="button"
                onClick={() => void handleRemove(row)}
                disabled={removingId === row.activityId}
                className="text-sm font-medium text-muted underline underline-offset-2 transition hover:text-strong disabled:cursor-not-allowed disabled:opacity-50"
                >
                Remove
                </button>
                </span>
                </li>
            ))}
            </ul>
        )}
        {removeError && <p className="mt-1 text-sm text-danger">{removeError}</p>}
        {undos.map((undo) => (
            <div
            key={undo.activityId}
            role="status"
            data-undo-row
            onMouseEnter={() => {
                hovered.current.add(undo.activityId);
                if (undo.phase === 'counting') pauseUndoTimer(undo.activityId);
            }}
            onMouseLeave={() => {
                hovered.current.delete(undo.activityId);
                if (undo.phase === 'counting') armUndoTimer(undo.activityId);
            }}
            onFocus={() => {
                if (undo.phase === 'counting') pauseUndoTimer(undo.activityId);
            }}
            onBlur={(e) => {
                // focus-within: only resume when focus truly left the row.
                if (
                    undo.phase === 'counting' &&
                    !e.currentTarget.contains(e.relatedTarget as Node | null)
                ) {
                    armUndoTimer(undo.activityId);
                }
            }}
            className="ml-3 mt-1 flex min-h-[44px] items-center justify-between gap-3 border-l-2 border-line bg-surface py-1.5 pl-3 pr-2 text-sm text-muted"
            >
            {undo.phase === 'counting' ? (
                <>
                <span>&ldquo;{undo.title}&rdquo; removed.</span>
                <span className="sr-only">Undo available.</span>
                <button
                type="button"
                onClick={() => void handleUndo(undo)}
                className="font-medium text-ink underline underline-offset-2"
                >
                Undo
                </button>
                </>
            ) : (
                <span>{UNDO_FAILED_COPY}</span>
            )}
            </div>
        ))}
        <h3 className="mt-4 text-sm font-semibold text-ink">Add an activity</h3>
        {data.options.length === 0 ? (
            <p className="mt-1 text-sm text-muted">{NONE_PUBLISHED_COPY}</p>
        ) : options.length === 0 ? (
            <p className="mt-1 text-sm text-muted">{ALL_ADDED_COPY}</p>
        ) : (
            <div className="mt-1 flex flex-wrap items-center gap-2.5">
            <select
            ref={selectRef}
            aria-label="Choose a published activity"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            disabled={adding}
            className="min-h-[44px] max-w-full rounded-md border border-line-strong bg-canvas px-2.5 py-2 text-sm text-ink"
            >
            <option value="">Choose a published activity…</option>
            {options.map((o) => (
                <option key={o.id} value={o.id}>
                {o.title}
                {o.publishedAt ? ` — published ${formatListDate(o.publishedAt)}` : ''}
                </option>
            ))}
            </select>
            <button
            type="button"
            onClick={() => void handleAdd()}
            disabled={!selected || adding}
            className="min-h-[44px] rounded-md border border-line-strong bg-canvas px-4 text-sm font-medium text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
            {adding ? 'Adding…' : 'Add'}
            </button>
            </div>
        )}
        {addError && <p className="mt-1 text-sm text-danger">{addError}</p>}
        <p className="mt-2 text-xs text-muted">
        Added activities appear on your students&apos; Home. Anyone with the link
        can also open a published activity.
        </p>
        </div>
    );
}
