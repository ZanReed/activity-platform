import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { createEmptyDocument } from '@activity/schema';
import { supabase } from '../lib/supabase';
import { useSession } from '../lib/SessionContext';
import { slugify, slugWithSuffix } from '../lib/slug';

interface ActivityRow {
    id: string;
    title: string;
    status: 'draft' | 'published' | 'archived';
    updated_at: string;
}

function formatEdited(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function StatusBadge({ status }: { status: ActivityRow['status'] }) {
    const styles: Record<ActivityRow['status'], string> = {
        draft: 'bg-surface-2 text-muted',
        published: 'bg-success-bg text-success',
        archived: 'bg-warning-bg-2 text-warning-text',
    };
    return (
        <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
        >
        {status}
        </span>
    );
}

export default function Activities() {
    const { session } = useSession();
    const navigate = useNavigate();

    const [activities, setActivities] = useState<ActivityRow[]>([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);

    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    // Delete-with-undo (design-review, 2026-07-18): deleting is optimistic —
    // the row soft-deletes immediately and drops out of the list, and a toast
    // offers a brief window to restore it (reversibility over confirmation).
    // deletingId guards the button while the soft-delete request is in flight;
    // undoStack holds the still-undoable rows (one toast each); actionError
    // surfaces a failed delete or undo. undoTimers keys each toast's
    // auto-dismiss timeout by activity id so Undo can cancel it.
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [undoStack, setUndoStack] = useState<ActivityRow[]>([]);
    const [actionError, setActionError] = useState<string | null>(null);
    const undoTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
        new Map(),
    );

    // How long a deleted activity stays undoable in the UI. The row is already
    // soft-deleted server-side; after this the toast just clears (the 30-day
    // purge_soft_deleted cron eventually hard-deletes it).
    const UNDO_MS = 7000;

    // Clear any outstanding auto-dismiss timers on unmount so they can't fire
    // setState after the component is gone.
    useEffect(() => {
        const timers = undoTimers.current;
        return () => {
            for (const t of timers.values()) clearTimeout(t);
            timers.clear();
        };
    }, []);

    useEffect(() => {
        // `cancelled` guards against StrictMode's double-invoke and against the
        // component unmounting before the request resolves.
        let cancelled = false;
        (async () => {
            const { data, error } = await supabase
            .from('activities')
            .select('id, title, status, updated_at')
            .is('deleted_at', null) // redundant with RLS, but self-documenting
            .order('updated_at', { ascending: false });
            if (cancelled) return;
            if (error) {
                setListError(error.message);
            } else {
                setActivities((data ?? []) as ActivityRow[]);
            }
            setListLoading(false);
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // RequireAuth guarantees a session before this route renders; this guard is
    // here so TypeScript can narrow `session` to non-null below.
    if (!session) return null;

    // Inserts a new activity, retrying on a 23505 unique-violation against
    // `unique (owner_id, slug)` with a suffix (numeric, then random — see
    // slugWithSuffix). The DB constraint is the arbiter, so concurrent creates
    // can't both claim a slug.
    const createActivity = async (title: string): Promise<string> => {
        const base = slugify(title);
        const doc = createEmptyDocument({ title });
        const MAX_ATTEMPTS = 10;

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            const { data, error } = await supabase
            .from('activities')
            .insert({
                owner_id: session.user.id,
                title,
                slug: slugWithSuffix(base, attempt),
                    draft_content: doc,
            })
            .select('id')
            .single();

            if (error) {
                if (error.code === '23505') continue; // slug taken — try next suffix
                throw error;
            }
            if (!data) throw new Error('Insert returned no row.');
            return data.id;
        }
        throw new Error('Could not create the activity. Please try again.');
    };

    // Instant-create (design-review, 2026-07-18): one click inserts an
    // "Untitled activity" and lands in the editor with the title focused +
    // selected (the { fresh: true } nav state drives that). No title form, no
    // slug explanation — naming happens on the object itself, non-blocking.
    // The slug is internal-only, so "untitled-activity-N" slugs are harmless.
    const handleCreate = async () => {
        setCreating(true);
        setCreateError(null);
        try {
            const id = await createActivity('Untitled activity');
            // success: leaving the page, no need to reset `creating`
            navigate(`/activity/${id}`, { state: { fresh: true } });
        } catch (err) {
            setCreateError(
                err instanceof Error ? err.message : 'Could not create activity.',
            );
            setCreating(false);
        }
    };

    // Soft delete: set deleted_at, the documented "deletion" mechanism. This
    // goes through the soft_delete_activity RPC, NOT a direct update. A
    // client-side `update activities set deleted_at` is blocked by RLS:
    // activities_select_own gates on `deleted_at is null`, and Postgres
    // requires the post-update row to still pass the SELECT policy, so setting
    // deleted_at trips "new row violates row-level security policy". The RPC is
    // SECURITY DEFINER and owner-checked (see 0008_soft_delete_activity.sql).
    // The list query and RLS still filter `deleted_at is null`, so the row
    // vanishes from view; the 30-day purge_soft_deleted cron hard-deletes it
    // (cascading versions/submissions) later.
    //
    // The delete is optimistic: on success the row leaves the list and joins
    // undoStack (a toast). The soft-delete has already committed server-side —
    // the toast is the window to call restore_activity (0012), not a pending
    // confirmation. Auto-dismiss after UNDO_MS.
    const handleDelete = async (activity: ActivityRow) => {
        setDeletingId(activity.id);
        setActionError(null);
        const { error } = await supabase.rpc('soft_delete_activity', {
            p_activity_id: activity.id,
        });
        setDeletingId(null);
        if (error) {
            setActionError(`Couldn't delete "${activity.title}": ${error.message}`);
            return;
        }
        setActivities((prev) => prev.filter((a) => a.id !== activity.id));
        setUndoStack((prev) => [...prev, activity]);
        const timer = setTimeout(() => dismissUndo(activity.id), UNDO_MS);
        undoTimers.current.set(activity.id, timer);
    };

    // Remove a toast without restoring — either its window elapsed, or the
    // user restored it and we're clearing the entry. Never calls the server.
    const dismissUndo = (id: string) => {
        const timer = undoTimers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            undoTimers.current.delete(id);
        }
        setUndoStack((prev) => prev.filter((a) => a.id !== id));
    };

    // Undo a delete: cancel the auto-dismiss, clear the toast, and restore the
    // row via the restore_activity RPC (0012). On success the row returns to
    // the top of the list (restore bumps updated_at server-side; we mirror
    // that so the client order matches a reload). On failure the row stays
    // deleted — the soft-delete already stands — and we say so. If the 0012
    // migration isn't deployed yet, this is the failure path (restore RPC
    // 404s); the delete itself is unaffected.
    const handleUndo = async (activity: ActivityRow) => {
        dismissUndo(activity.id);
        setActionError(null);
        const { error } = await supabase.rpc('restore_activity', {
            p_activity_id: activity.id,
        });
        if (error) {
            setActionError(
                `Couldn't undo — "${activity.title}" is still deleted.`,
            );
            return;
        }
        const restored: ActivityRow = {
            ...activity,
            updated_at: new Date().toISOString(),
        };
        setActivities((prev) =>
            [restored, ...prev].sort((a, b) =>
                b.updated_at.localeCompare(a.updated_at),
            ),
        );
    };

    return (
        <main className="min-h-screen bg-surface p-8">
        <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-ink">My activities</h1>
        <button
        type="button"
        onClick={handleCreate}
        disabled={creating}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
        {creating ? 'Creating…' : 'New activity'}
        </button>
        </div>

        {createError && (
            <p className="mt-3 text-sm text-danger">
            Couldn't create activity: {createError}
            </p>
        )}

        <div className="mt-6">
        {listLoading ? (
            <p className="text-muted">Loading your activities…</p>
        ) : listError ? (
            <p className="text-danger">
            Couldn't load activities: {listError}
            </p>
        ) : activities.length === 0 ? (
            <p className="text-muted">
            No activities yet. Create your first one to get started.
            </p>
        ) : (
            <ul className="space-y-2">
            {activities.map((a) => (
                <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-canvas p-4 shadow-sm transition hover:border-line-strong hover:shadow"
                >
                <Link
                to={`/activity/${a.id}`}
                className="min-w-0 flex-1 truncate font-medium text-ink hover:underline"
                >
                {a.title}
                </Link>
                <span className="flex shrink-0 items-center gap-3">
                <StatusBadge status={a.status} />
                <span className="hidden text-xs text-muted sm:inline">
                Edited {formatEdited(a.updated_at)}
                </span>
                <Link
                to={`/activity/${a.id}/submissions`}
                className="text-sm font-medium text-muted underline underline-offset-2 hover:text-strong"
                >
                Submissions
                </Link>
                <button
                type="button"
                onClick={() => handleDelete(a)}
                disabled={deletingId === a.id}
                aria-label={`Delete ${a.title}`}
                className="text-sm font-medium text-muted underline underline-offset-2 transition hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
                >
                {deletingId === a.id ? 'Deleting…' : 'Delete'}
                </button>
                </span>
                </li>
            ))}
            </ul>
        )}
        {actionError && (
            <p className="mt-3 text-sm text-danger">{actionError}</p>
        )}
        </div>
        </div>

        {/* Undo toasts — one per recently-deleted activity, bottom-left in the
            thumb zone. The soft-delete has committed; Undo calls restore. */}
        {undoStack.length > 0 && (
            <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
            {undoStack.map((a) => (
                <div
                key={a.id}
                role="status"
                className="flex items-center gap-3 rounded-lg bg-primary px-4 py-2.5 text-sm text-white shadow-lg"
                >
                <span className="max-w-[16rem] truncate">
                Deleted <span className="font-medium">{a.title}</span>
                </span>
                <button
                type="button"
                onClick={() => handleUndo(a)}
                className="font-medium text-blue-300 underline-offset-2 hover:text-blue-200 hover:underline"
                >
                Undo
                </button>
                <button
                type="button"
                onClick={() => dismissUndo(a.id)}
                aria-label="Dismiss"
                className="text-faint transition hover:text-white"
                >
                ✕
                </button>
                </div>
            ))}
            </div>
        )}
        </main>
    );
}
