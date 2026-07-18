import { useEffect, useState } from 'react';
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
        draft: 'bg-slate-100 text-slate-600',
        published: 'bg-green-100 text-green-700',
        archived: 'bg-amber-100 text-amber-700',
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

    // Per-row delete: confirmingId is the row showing its inline confirm;
    // deletingId is the row whose soft-delete request is in flight.
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

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
    // (cascading versions/submissions) later. Drop it from the list on success.
    const handleDelete = async (id: string) => {
        setDeletingId(id);
        setDeleteError(null);
        const { error } = await supabase.rpc('soft_delete_activity', {
            p_activity_id: id,
        });
        if (error) {
            setDeleteError(error.message);
            setDeletingId(null);
            return;
        }
        setActivities((prev) => prev.filter((a) => a.id !== id));
        setConfirmingId(null);
        setDeletingId(null);
    };

    return (
        <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">My activities</h1>
        <button
        type="button"
        onClick={handleCreate}
        disabled={creating}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
        {creating ? 'Creating…' : 'New activity'}
        </button>
        </div>

        {createError && (
            <p className="mt-3 text-sm text-red-600">
            Couldn't create activity: {createError}
            </p>
        )}

        <div className="mt-6">
        {listLoading ? (
            <p className="text-slate-500">Loading your activities…</p>
        ) : listError ? (
            <p className="text-red-600">
            Couldn't load activities: {listError}
            </p>
        ) : activities.length === 0 ? (
            <p className="text-slate-500">
            No activities yet. Create your first one to get started.
            </p>
        ) : (
            <ul className="space-y-2">
            {activities.map((a) => (
                <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
                >
                <Link
                to={`/activity/${a.id}`}
                className="min-w-0 flex-1 truncate font-medium text-slate-900 hover:underline"
                >
                {a.title}
                </Link>
                {confirmingId === a.id ? (
                    <span className="flex shrink-0 items-center gap-2">
                    <span className="text-sm text-slate-600">Delete?</span>
                    <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                    {deletingId === a.id ? 'Deleting…' : 'Delete'}
                    </button>
                    <button
                    type="button"
                    onClick={() => setConfirmingId(null)}
                    disabled={deletingId === a.id}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                    Cancel
                    </button>
                    </span>
                ) : (
                    <span className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={a.status} />
                    <span className="hidden text-xs text-slate-500 sm:inline">
                    Edited {formatEdited(a.updated_at)}
                    </span>
                    <Link
                    to={`/activity/${a.id}/submissions`}
                    className="text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
                    >
                    Submissions
                    </Link>
                    <button
                    type="button"
                    onClick={() => {
                        setConfirmingId(a.id);
                        setDeleteError(null);
                    }}
                    aria-label={`Delete ${a.title}`}
                    className="text-sm font-medium text-slate-500 underline underline-offset-2 transition hover:text-red-600"
                    >
                    Delete
                    </button>
                    </span>
                )}
                </li>
            ))}
            </ul>
        )}
        {deleteError && (
            <p className="mt-3 text-sm text-red-600">
            Couldn't delete activity: {deleteError}
            </p>
        )}
        </div>
        </div>
        </main>
    );
}
