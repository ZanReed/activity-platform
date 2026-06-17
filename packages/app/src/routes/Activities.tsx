import { useEffect, useState, type FormEvent } from 'react';
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

    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
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
    // `unique (owner_id, slug)` with an incrementing numeric suffix. The DB
    // constraint is the arbiter, so concurrent creates can't both claim a slug.
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
        throw new Error('Could not find a free slug. Try a different title.');
    };

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        const title = newTitle.trim();
        if (!title) return;
        setCreating(true);
        setCreateError(null);
        try {
            const id = await createActivity(title);
            navigate(`/activity/${id}`); // success: leaving the page, no need to reset
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
        {!showForm && (
            <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
            New activity
            </button>
        )}
        </div>

        {showForm && (
            <form
            onSubmit={handleCreate}
            className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
            <label
            htmlFor="new-activity-title"
            className="block text-sm font-medium text-slate-700"
            >
            Activity title
            </label>
            <p className="mt-1 text-xs text-slate-500">
            The title sets the activity's URL slug, which is fixed after
            creation. You can rename the activity later, but the slug won't
            change.
            </p>
            <input
            id="new-activity-title"
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            placeholder="e.g. Factoring Quadratics"
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            />
            {createError && (
                <p className="mt-2 text-sm text-red-600">{createError}</p>
            )}
            <div className="mt-3 flex items-center gap-2">
            <button
            type="submit"
            disabled={creating || newTitle.trim().length === 0}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
            {creating ? 'Creating…' : 'Create'}
            </button>
            <button
            type="button"
            onClick={() => {
                setShowForm(false);
                setNewTitle('');
                setCreateError(null);
            }}
            disabled={creating}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
            Cancel
            </button>
            </div>
            </form>
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
                    className="text-sm font-medium text-slate-400 underline underline-offset-2 transition hover:text-red-600"
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
