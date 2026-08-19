import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { createEmptyDocument } from '@activity/schema';
import { supabase } from '../lib/supabase';
import { useSession } from '../lib/SessionContext';
import { slugify, slugWithSuffix } from '../lib/slug';
import { collectTagVocabulary } from '../lib/normalizeTags';
import {
    courseOf,
    distinctCourses,
    groupByUnit,
} from '../lib/activityGrouping';
import {
    PEDAGOGICAL_ROLE_LABELS,
    asPedagogicalRole,
} from '../lib/pedagogicalRole';
import { useScrollMemory } from '../lib/useScrollMemory';

interface ActivityRow {
    id: string;
    title: string;
    status: 'draft' | 'published' | 'archived';
    updated_at: string;
    // Row-native taxonomy (0037). tags drives the filter below; it is the P1
    // caller for the tags column — the column and its reader ship together.
    tags: string[] | null;
    pedagogical_role: string | null;
    // Publish-truth columns (taxonomy R1) PLUS the draft-side values, extracted
    // server-side by a PostgREST json path so the wire never carries 150 whole
    // documents. The outline groups draft-first — see lib/activityGrouping.ts
    // for why the column alone would file a whole authoring sprint under
    // "No unit".
    course: string | null;
    unit: string | null;
    draft_course: string | null;
    draft_unit: string | null;
}

// How many activities the "Recently edited" strip carries (D4). Five keeps it
// one row at every viewport; it is a shortcut back into work, not a list.
const RECENT_LIMIT = 5;

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
        published: 'bg-success-bg text-success-strong',
        archived: 'bg-warning-bg-2 text-warning-strong',
    };
    return (
        <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
        >
        {status}
        </span>
    );
}

// The Bank role badge (0037 pedagogical_role). Absent when unclassified —
// "no role" is a legitimate state and deserves no placeholder chrome.
function RoleBadge({ role }: { role: string | null }) {
    const parsed = asPedagogicalRole(role);
    if (!parsed) return null;
    return (
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-accent">
        {PEDAGOGICAL_ROLE_LABELS[parsed]}
        </span>
    );
}

export default function Activities() {
    const { session } = useSession();
    const navigate = useNavigate();
    const location = useLocation();

    const [activities, setActivities] = useState<ActivityRow[]>([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);

    // Scroll restoration on return from the editor (D7). Gated on the list
    // having loaded — before that the page has no height to scroll to.
    useScrollMemory(location.key, !listLoading);

    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    // Delete-with-undo (design-review, 2026-07-18): deleting is optimistic —
    // the row soft-deletes immediately and drops out of the list, and a toast
    // offers a brief window to restore it (reversibility over confirmation).
    // deletingId guards the button while the soft-delete request is in flight;
    // undoStack holds the still-undoable rows (one toast each); actionError
    // surfaces a failed delete or undo. undoTimers keys each toast's
    // auto-dismiss timeout by activity id so Undo can cancel it.
    // Tag filter (taxonomy R6 — the P1 caller for the tags column). Multi-select
    // and AND-combining: picking "factoring" then "word problems" narrows to
    // activities carrying BOTH, which is how a teacher actually hunts. Purely
    // client-side over the rows already fetched — the list is one author's own
    // activities, so there is no query to add and no index to depend on.
    const [activeTags, setActiveTags] = useState<string[]>([]);

    // Search (D9) and the drafts quick-filter (D11). Both AND with the tag
    // chips: filters narrow, never widen. `drafts` is deliberately NOT a status
    // facet — "finish my unfinished work" is a task; published/archived have no
    // task behind them, so they get no control.
    const [search, setSearch] = useState('');
    const [draftsOnly, setDraftsOnly] = useState(false);
    const searchRef = useRef<HTMLInputElement | null>(null);

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

    // `/` focuses search (D9), with the standard guard: ignored while an
    // input/textarea/contenteditable already has focus, so typing a slash into
    // the search box (or any future field) still types a slash. The editor's
    // own slash menu lives on a different route entirely.
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
            const el = document.activeElement as HTMLElement | null;
            if (
                el &&
                (el.tagName === 'INPUT' ||
                    el.tagName === 'TEXTAREA' ||
                    el.isContentEditable)
            ) {
                return;
            }
            e.preventDefault();
            searchRef.current?.focus();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    useEffect(() => {
        // `cancelled` guards against StrictMode's double-invoke and against the
        // component unmounting before the request resolves.
        let cancelled = false;
        (async () => {
            const { data, error } = await supabase
            .from('activities')
            .select(
                'id, title, status, updated_at, tags, pedagogical_role, course, unit,' +
                'draft_course:draft_content->meta->>course,' +
                'draft_unit:draft_content->meta->>unit',
            )
            .is('deleted_at', null) // redundant with RLS, but self-documenting
            .order('updated_at', { ascending: false });
            if (cancelled) return;
            if (error) {
                setListError(error.message);
            } else {
                // `as unknown as` is load-bearing, not laziness: supabase-js
                // infers row types by PARSING the select string, and its parser
                // does not understand PostgREST's `->` json-path syntax, so it
                // degrades the whole row to GenericStringError[]. The runtime
                // shape is correct (verified against the live API); the cast
                // restores what the parser could not derive.
                setActivities(data as unknown as ActivityRow[]);
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

    // Every tag in use, deduped and sorted — the chip row. Derived from the
    // loaded rows rather than queried separately: the list already holds every
    // activity this author owns, so a second round trip would only add a way
    // for the chips and the rows to disagree.
    const tagVocabulary = collectTagVocabulary(activities);

    const toggleTag = (tag: string) => {
        setActiveTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
        );
    };

    const clearFilters = () => {
        setActiveTags([]);
        setDraftsOnly(false);
        setSearch('');
    };

    // The recent strip (D4): most-recently-edited first, ALWAYS from the full
    // set — it is a shortcut back into work, so a filter must not empty it.
    // `activities` already arrives ordered by updated_at desc.
    const recent = activities.slice(0, RECENT_LIMIT);

    // Every filter ANDs. Search is a case-insensitive substring over the title,
    // which is what "I know its name" retrieval actually needs.
    const query = search.trim().toLowerCase();
    const anyFilter =
        activeTags.length > 0 || draftsOnly || query.length > 0;

    // Plain computation, NOT useMemo: these sit below the `if (!session)`
    // early return, where a hook would be a rules-of-hooks violation (lint
    // caught exactly that). Filtering + grouping a few hundred rows is
    // microseconds, so memoizing would buy nothing and cost a real hazard.
    const visibleActivities = activities.filter((a) => {
        if (draftsOnly && a.status !== 'draft') return false;
        if (query && !a.title.toLowerCase().includes(query)) return false;
        return activeTags.every((t) => (a.tags ?? []).includes(t));
    });

    // The outline itself (D3): units natural-sorted, "No unit" last, row order
    // (recency) preserved inside each group. Groups with no surviving rows
    // simply do not appear — D6: a filtered view shows hits, not absences.
    const groups = groupByUnit(visibleActivities);

    // Name the course in group headers only when there is more than one to
    // distinguish. Repeating "Algebra II" above every unit is a constant, and
    // constants are noise.
    const showCourseInHeaders = distinctCourses(activities).length > 1;

    // The drafts chip earns its place only when there ARE drafts — same
    // no-empty-chrome rule the tag row already follows. An all-published
    // library shows no filter chrome at all.
    const hasDrafts = activities.some((a) => a.status === 'draft');

    // A filtered-to-nothing list is a different state from an empty library,
    // and it needs a different message plus a way back out.
    const filteredToNothing =
        activities.length > 0 && visibleActivities.length === 0;

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

        {/* Recently edited (D4): the resume-work shortcut, above everything.
            Always drawn from the FULL set — a filter must never empty it — and
            absent entirely when there is nothing yet, so it costs no layout. */}
        {recent.length > 0 && (
            /* A navigation landmark, not decoration: it is a set of links out
               of this page. The per-link aria-label carries the context the
               heading gives sighted readers — without it these are duplicate
               accessible names for the outline rows below, which is both
               noisier for a screen reader and genuinely ambiguous. */
            <nav
            aria-label="Recently edited"
            className="mt-5 flex flex-wrap items-center gap-1.5"
            >
            <span aria-hidden="true" className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            Recently edited
            </span>
            {recent.map((a) => (
                <Link
                key={a.id}
                to={`/activity/${a.id}`}
                aria-label={`${a.title} — recently edited`}
                className="max-w-[14rem] truncate rounded-full border border-line bg-canvas px-2.5 py-1 text-xs font-medium text-muted transition hover:border-line-strong hover:text-ink"
                >
                {a.title}
                </Link>
            ))}
            </nav>
        )}

        {/* Search (D9). The placeholder advertises the shortcut — that is how
            a keyboard affordance becomes discoverable without a legend. */}
        <div className="mt-3">
        <input
        ref={searchRef}
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
            if (e.key === 'Escape') {
                setSearch('');
                e.currentTarget.blur();
            }
        }}
        aria-label="Search activities"
        placeholder="Search activities…    /"
        className="w-full rounded-md border border-line-strong bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        </div>

        {/* Filter chips: the drafts task-filter (D11) leads, then the tag
            vocabulary. The drafts chip is dashed so it reads as a different
            KIND of filter than a topic tag. */}
        {(hasDrafts || tagVocabulary.length > 0) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {hasDrafts && (
        <button
        type="button"
        aria-pressed={draftsOnly}
        onClick={() => setDraftsOnly((v) => !v)}
        className={`rounded-full border border-dashed px-2.5 py-1 text-xs font-medium transition ${
            draftsOnly
            ? 'border-ink bg-primary text-white'
            : 'border-line-strong bg-canvas text-muted hover:text-ink'
        }`}
        >
        drafts
        </button>
        )}
        {tagVocabulary.map((tag) => {
            const on = activeTags.includes(tag);
            return (
                <button
                key={tag}
                type="button"
                aria-pressed={on}
                onClick={() => toggleTag(tag)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                    on
                    ? 'border-ink bg-primary text-white'
                    : 'border-line bg-canvas text-muted hover:border-line-strong hover:text-ink'
                }`}
                >
                {tag}
                </button>
            );
        })}
        </div>
        )}

        {/* Count line — aria-live so a filter's effect is ANNOUNCED, not just
            shown. Only rendered while a filter is active; an unfiltered list
            needs no running total. */}
        {anyFilter && !listLoading && !listError && (
            <p className="mt-2 text-xs text-muted" role="status" aria-live="polite">
            {visibleActivities.length} of {activities.length} shown
            {' · '}
            <button
            type="button"
            onClick={clearFilters}
            className="font-medium underline underline-offset-2 transition hover:text-ink"
            >
            clear
            </button>
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
        ) : filteredToNothing ? (
            <p className="text-muted">
            No activities match the current filter.{' '}
            <button
            type="button"
            onClick={clearFilters}
            className="font-medium underline underline-offset-2 transition hover:text-ink"
            >
            Clear the filter
            </button>
            </p>
        ) : (
            /* The outline (D3). One <section> per unit with an <h2> header, so
               the page outline IS the document outline — a screen reader gets
               the year as a table of contents for free. Groups with no
               surviving rows are simply absent (D6). */
            <div className="space-y-6">
            {groups.map((group) => {
                const headingId = `unit-${group.key}`;
                const drafts = group.rows.filter(
                    (r) => r.status === 'draft',
                ).length;
                const course = group.rows[0]
                    ? courseOf(group.rows[0])
                    : null;
                return (
                    <section key={group.key} aria-labelledby={headingId}>
                    <div className="sticky top-0 z-10 flex items-baseline gap-2 border-b border-line bg-surface pb-1.5 pt-2">
                    <h2
                    id={headingId}
                    className="text-sm font-semibold text-ink"
                    >
                    {showCourseInHeaders && course
                        ? `${course} — ${group.unit ?? 'No unit'}`
                        : (group.unit ?? 'No unit')}
                    </h2>
                    <span className="text-xs text-muted">
                    {group.rows.length}
                    {group.rows.length === 1 ? ' activity' : ' activities'}
                    {drafts > 0 && ` · ${drafts} draft${drafts === 1 ? '' : 's'}`}
                    </span>
                    </div>

                    {/* Flat rows, hairline separators (D8). The card-per-row
                        treatment fails the hard rules at 150 rows: the
                        decoration IS the noise. Structure comes from the
                        header above; the row carries only content. */}
                    <ul className="mt-1.5 overflow-hidden rounded-lg border border-line bg-canvas">
                    {group.rows.map((a, i) => (
                        <li
                        key={a.id}
                        className={`flex items-center gap-3 px-3.5 py-2 transition hover:bg-surface-2 ${
                            i > 0 ? 'border-t border-line' : ''
                        }`}
                        >
                        <Link
                        to={`/activity/${a.id}`}
                        className="min-w-0 flex-1 truncate text-sm font-medium text-ink hover:underline"
                        >
                        {a.title}
                        </Link>
                        <span className="flex shrink-0 items-center gap-2.5">
                        <RoleBadge role={a.pedagogical_role} />
                        <StatusBadge status={a.status} />
                        <span className="hidden text-xs text-muted sm:inline">
                        {formatEdited(a.updated_at)}
                        </span>
                        <Link
                        to={`/activity/${a.id}/analytics`}
                        className="hidden text-xs font-medium text-muted underline underline-offset-2 hover:text-strong sm:inline"
                        >
                        Analytics
                        </Link>
                        <button
                        type="button"
                        onClick={() => handleDelete(a)}
                        disabled={deletingId === a.id}
                        aria-label={`Delete ${a.title}`}
                        className="text-xs font-medium text-muted underline underline-offset-2 transition hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
                        >
                        {deletingId === a.id ? 'Deleting…' : 'Delete'}
                        </button>
                        </span>
                        </li>
                    ))}
                    </ul>
                    </section>
                );
            })}
            </div>
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
