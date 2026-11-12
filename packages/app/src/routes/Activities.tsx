import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { TeacherNav } from '../components/TeacherNav';
import { BarChart3, ClipboardCheck, Import, Library, Trash2, Users } from 'lucide-react';
import { AddToClassPanel, classesHolding, unitMembership, useClassMembership } from '../components/AddToClass';
import RecentlyDeleted from '../components/RecentlyDeleted';
import { listDeletedActivities, restoreActivity, type DeletedItem } from '../lib/recentlyDeleted';
import { createEmptyDocument } from '@activity/schema';
import { supabase } from '../lib/supabase';
import { useSession } from '../lib/SessionContext';
import { slugify, slugWithSuffix } from '../lib/slug';
import { FILTER_KEYS, STATUS_OPTIONS, matchesQuery, parseStatus, topicGroups } from '../lib/listFilters';
import { useUrlFilters, useUrlText } from '../lib/useUrlFilters';
import { ChosenTopics, TopicPicker } from '../components/TopicPicker';
import {
    distinctCourses,
    groupByUnit,
    sortForOutline,
    unitOf,
} from '../lib/activityGrouping';
import {
    PEDAGOGICAL_ROLE_LABELS,
    asPedagogicalRole,
} from '../lib/pedagogicalRole';
import { useScrollMemory } from '../lib/useScrollMemory';
import { isBankLister, setActivityListing } from '../lib/bank';
import { chainHooksPath, chainsWithHooks, fetchMyChainHooks, NO_CHAIN_HOOKS, type MyChainHooks } from '../lib/chainHooks';
import { republishCandidates } from '../lib/bulkRepublish';
import { RepublishDialog } from '../components/RepublishDialog';

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
    // The catalogue file this row was imported from (0038), or null for a
    // hand-made activity. This is the outline's ORDERING key — see
    // lib/activityGrouping.ts. It is never rendered.
    source_path: string | null;
    // The Activity Bank (0054): 'public' = listed; a non-null
    // copied_from_activity_id = this row is a copy added FROM the Bank.
    visibility: string;
    copied_from_activity_id: string | null;
    // "Republish changed" (lib/bulkRepublish.ts). Two scalars pulled by json
    // path, never the draft itself: a draft exists exactly when its
    // schemaVersion does, and its activityType names a quiz or exam (D51).
    draft_schema: string | null;
    draft_type: string | null;
}

// A row's icon controls (R4/R5): a 24px hit target around a 16px icon.
const ICON_BUTTON =
    'inline-flex items-center justify-center rounded-md p-1 transition hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink';

// How many activities the "Recently edited" strip carries (D4). Five keeps it
// one row at every viewport; it is a shortcut back into work, not a list.
const RECENT_LIMIT = 5;
/** F-5: how many recent pills show before "+N" (one line at page width). */
const RECENT_SHOWN = 3;

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
    // "Lesson" is the default role, on most rows: a constant is noise (row
    // anatomy R2, 2026-10-14). Review and Practice are the ones worth seeing.
    if (!parsed || parsed === 'lesson') return null;
    return (
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-accent">
        {PEDAGOGICAL_ROLE_LABELS[parsed]}
        </span>
    );
}

/** G-6: what deleting an activity that sits in a class costs. */
/** The My activities list read: the caller's live activities, newest first. */
function fetchActivityRows() {
    return supabase
        .from('activities')
        .select(
            'id, title, status, updated_at, tags, pedagogical_role, course, unit,' +
            'source_path, visibility, copied_from_activity_id,' +
            'draft_course:draft_content->meta->>course,' +
            'draft_unit:draft_content->meta->>unit,' +
            'draft_schema:draft_content->>schemaVersion,' +
            'draft_type:draft_content->meta->>activityType',
        )
        .is('deleted_at', null) // redundant with RLS, but self-documenting
        .order('updated_at', { ascending: false });
}

// G-6's confirm is loaded on first use: the Activities journey has no room
// for it in the first download (perf-budgets: journey activities).
const ConfirmDialog = lazy(() => import('../components/ConfirmDialog'));

const ACTIVITY_DELETE_COPY = {
    title: (t: string) => `Delete ${t}?`,
    body: (classes: readonly string[] | null) =>
        classes === null
            ? 'It comes off the Home of any class it’s on, straight away.'
            : `It comes off ${listNames(classes)} Home now.`,
    confirm: 'Delete activity',
} as const;

function listNames(names: readonly string[]): string {
    const owned = names.map((n) => `${n}’s`);
    if (owned.length <= 1) return owned[0] ?? '';
    return `${owned.slice(0, -1).join(', ')} and ${owned[owned.length - 1]}`;
}

export default function Activities() {
    const { session } = useSession();
    const navigate = useNavigate();
    // Class membership for the add-to-class doors (assign-to-class A1/A6).
    const membership = useClassMembership();
    // Which add-to-class panel is open: `unit:<key>`, a row id, or none. One
    // at a time, so the page never grows a column of open panels.
    const [classPanel, setClassPanel] = useState<string | null>(null);
    const location = useLocation();

    const [activities, setActivities] = useState<ActivityRow[]>([]);
    const [republishOpen, setRepublishOpen] = useState(false);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);

    // The Activity Bank curator controls (BK-3/BK-4): shown only to a lister
    // (caps-exempt teacher or admin). The server refuses anyone else anyway.
    const [bankLister, setBankLister] = useState(false);
    const [listingBusy, setListingBusy] = useState<string | null>(null);
    const [listingError, setListingError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        void isBankLister().then((ok) => {
            if (!cancelled) setBankLister(ok);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    // The unit headers' "Hooks (n)" links (0057, CH-7). Fetched beside the list,
    // never before it, and a failed or missing read is simply no links (D3):
    // this page must render exactly as it did before hooks existed.
    const [chainHooks, setChainHooks] = useState<MyChainHooks>(NO_CHAIN_HOOKS);
    useEffect(() => {
        let cancelled = false;
        fetchMyChainHooks()
            .then((data) => {
                if (!cancelled) setChainHooks(data);
            })
            .catch(() => {
                /* no links, no notice (D3) */
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // List or unlist one or more PUBLISHED rows; drafts are skipped (listing
    // requires a published version). One busy key covers a whole unit.
    const applyListing = async (rows: ActivityRow[], listed: boolean, busyKey: string) => {
        // Only rows not already in the wanted state: a unit action never
        // re-writes (or re-audits) a row it would leave unchanged.
        const wanted = listed ? 'public' : 'private';
        // A Bank copy is never listed (0055, BK-12); the server refuses it too.
        const targets = rows.filter(
            (r) =>
                r.status === 'published' &&
                r.visibility !== wanted &&
                !(listed && r.copied_from_activity_id),
        );
        if (targets.length === 0) return;
        setListingError(null);
        setListingBusy(busyKey);
        const done: string[] = [];
        try {
            for (const r of targets) {
                await setActivityListing(r.id, listed);
                done.push(r.id);
            }
        } catch (err) {
            setListingError(err instanceof Error ? err.message : 'Could not change the listing.');
        } finally {
            setActivities((cur) =>
                cur.map((a) =>
                    done.includes(a.id) ? { ...a, visibility: listed ? 'public' : 'private' } : a,
                ),
            );
            setListingBusy(null);
        }
    };

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
    // F-1…F-6 (activity-list-filters.md): every filter lives in the URL, so
    // Back, refresh and a shared link keep it. All AND: filters narrow.
    const filters = useUrlFilters();
    const activeTags = filters.getAll(FILTER_KEYS.topic);
    const [search, setSearchText] = useUrlText(filters, FILTER_KEYS.query);
    const statusFilter = parseStatus(filters.get(FILTER_KEYS.status) || null);
    const setSearch = setSearchText;
    // F-5: the strip shows three; "+N" opens the rest.
    const [showAllRecent, setShowAllRecent] = useState(false);
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
    // G-6: the activity waiting on the delete confirm, with the classes it's in
    // (null: membership not loaded, so the dialog speaks generally).
    const [confirmDelete, setConfirmDelete] = useState<{ activity: ActivityRow; classes: string[] | null } | null>(null);

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
            const { data, error } = await fetchActivityRows();
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

    // G-6: soft-deleted activities, restorable until the 30-day purge. A failed
    // read (or 0086 not applied yet) just hides the section.
    const [deleted, setDeleted] = useState<DeletedItem[]>([]);
    const refreshDeleted = useCallback(() => {
        listDeletedActivities().then(setDeleted, () => setDeleted([]));
    }, []);
    useEffect(() => {
        refreshDeleted();
    }, [refreshDeleted]);
    const restoreFromDeleted = async (activityId: string) => {
        await restoreActivity(activityId);
        dismissUndo(activityId);
        const { data, error } = await fetchActivityRows();
        if (!error) setActivities(data as unknown as ActivityRow[]);
        refreshDeleted();
    };

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
        refreshDeleted();
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
        refreshDeleted();
    };

    // F-1: the topics in use, grouped by unit — derived from the loaded rows
    // rather than queried, so the panel and the rows can't disagree.
    const topics = topicGroups(activities, (a) => a.tags, (a) => unitOf(a));

    const toggleTag = (tag: string) => filters.toggle(FILTER_KEYS.topic, tag);

    const clearFilters = () => {
        filters.set({ [FILTER_KEYS.topic]: null, [FILTER_KEYS.status]: null, [FILTER_KEYS.query]: null });
    };

    // The recent strip (D4): most-recently-edited first, ALWAYS from the full
    // set — it is a shortcut back into work, so a filter must not empty it.
    //
    // ⚠ SORTED HERE, not inherited from the query. This used to read
    // `activities.slice(0, RECENT_LIMIT)`, which depended on the list arriving
    // updated_at-ordered — a contract asserted only in a comment and
    // re-established by hand in handleUndo. Lane B reorders rows for the
    // outline, so the strip now sorts for the property it actually needs and
    // the query is free to order by anything.
    const recent = [...activities]
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
        .slice(0, RECENT_LIMIT);

    // Every filter ANDs. Search is a case-insensitive substring over the title,
    // which is what "I know its name" retrieval actually needs.
    const query = search.trim().toLowerCase();
    const anyFilter =
        activeTags.length > 0 || statusFilter !== 'all' || query.length > 0;

    // Plain computation, NOT useMemo: these sit below the `if (!session)`
    // early return, where a hook would be a rules-of-hooks violation (lint
    // caught exactly that). Filtering + grouping a few hundred rows is
    // microseconds, so memoizing would buy nothing and cost a real hazard.
    const changedIds = new Set(republishCandidates(activities).map((c) => c.row.id));
    const visibleActivities = activities.filter((a) => {
        if (statusFilter === 'drafts' && a.status !== 'draft') return false;
        if (statusFilter === 'published' && a.status !== 'published') return false;
        if (statusFilter === 'changed' && !changedIds.has(a.id)) return false;
        if (!matchesQuery(a.title, a.tags, query)) return false;
        return activeTags.every((t) => (a.tags ?? []).includes(t));
    });

    // The outline itself (D3): rows in catalogue-path order within each group,
    // groups ordered by their lowest catalogue path, "No unit" last. Groups
    // with no surviving rows simply do not appear — D6: a filtered view shows
    // hits, not absences.
    //
    // ⚠ `orderFrom` is the whole of D6 in one argument. Group order is derived
    // from row data, and this call passes the FILTERED array, so without it a
    // search that removes a group's lowest-path row would relocate that group
    // mid-keystroke. Ordering from the unfiltered set means a filter can only
    // remove groups, never move them — which is D6's own rationale, that the
    // unfiltered outline is the stable spatial map.
    const groups = groupByUnit(sortForOutline(visibleActivities), {
        orderFrom: activities,
    });
    // The WHOLE unit, in teaching order, for the add-to-class door: a search
    // narrows what the list shows, never what "add this unit" adds.
    const fullUnits = new Map(
        groupByUnit(sortForOutline(activities)).map((g) => [g.key, g.rows]),
    );

    // Name the course in group headers only when there is more than one to
    // distinguish. Repeating "Algebra II" above every unit is a constant, and
    // constants are noise.
    const showCourseInHeaders = distinctCourses(activities).length > 1;

    // "Republish changed" (R-1..R-7): shown only when something is waiting,
    // and its count is what the dialog would republish (quizzes and exams
    // are listed there as skipped, not counted).
    const changed = republishCandidates(activities);
    const changedCount = changed.filter((c) => c.skip === null).length;

    // A filtered-to-nothing list is a different state from an empty library,
    // and it needs a different message plus a way back out.
    const filteredToNothing =
        activities.length > 0 && visibleActivities.length === 0;

    return (
        <main className="min-h-screen bg-surface p-8">
        <div className="mx-auto max-w-2xl">
        <TeacherNav />
        <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-ink">My activities</h1>
        <div className="flex items-center gap-3">
        {changedCount > 0 && (
            <button
            type="button"
            onClick={() => setRepublishOpen(true)}
            className="rounded-md border border-line-strong px-4 py-2 text-sm font-medium text-ink shadow-sm transition hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
            Republish changed ({changedCount})
            </button>
        )}
        <button
        type="button"
        onClick={handleCreate}
        disabled={creating}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
        {creating ? 'Creating…' : 'New activity'}
        </button>
        </div>
        </div>

        {republishOpen && (
            <RepublishDialog
            candidates={changed}
            onClose={(republished) => {
                setRepublishOpen(false);
                // publish_activity clears the draft, so these leave the count.
                if (republished.length > 0) {
                    const done = new Set(republished);
                    setActivities((prev) =>
                        prev.map((a) => (done.has(a.id) ? { ...a, draft_schema: null, draft_type: null } : a)),
                    );
                }
            }}
            />
        )}

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
            data-recent-strip
            >
            <span aria-hidden="true" className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            Recently edited
            </span>
            {(showAllRecent ? recent : recent.slice(0, RECENT_SHOWN)).map((a) => (
                <Link
                key={a.id}
                to={`/activity/${a.id}`}
                aria-label={`${a.title} — recently edited`}
                className="max-w-[11rem] truncate rounded-full border border-line bg-canvas px-2.5 py-1 text-xs font-medium text-muted transition hover:border-line-strong hover:text-ink"
                >
                {a.title}
                </Link>
            ))}
            {recent.length > RECENT_SHOWN && (
                <button
                type="button"
                aria-expanded={showAllRecent}
                onClick={() => setShowAllRecent((v) => !v)}
                className="text-xs font-medium text-muted underline underline-offset-2 hover:text-strong"
                >
                {showAllRecent ? 'Fewer' : `+${recent.length - RECENT_SHOWN}`}
                </button>
            )}
            </nav>
        )}

        {/* The filter bar (F-1…F-4): search (titles AND topics), Topics, and
            Status on one line; chosen topics on one line below, only while
            some are chosen. The placeholder advertises the "/" shortcut. */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
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
        aria-label="Search activities and topics"
        placeholder="Search activities and topics…    /"
        className="min-w-[12rem] flex-1 rounded-md border border-line-strong bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <TopicPicker groups={topics} chosen={activeTags} onToggle={toggleTag} />
        {activities.length > 0 && (
            <select
            aria-label="Status"
            value={statusFilter}
            onChange={(e) => filters.set({ [FILTER_KEYS.status]: e.target.value === 'all' ? null : e.target.value })}
            className="min-h-9 rounded-md border border-line-strong bg-canvas px-2 text-sm text-ink"
            >
            {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                {o.label}
                </option>
            ))}
            </select>
        )}
        </div>
        <ChosenTopics
        chosen={activeTags}
        onRemove={toggleTag}
        onClear={() => filters.set({ [FILTER_KEYS.topic]: null })}
        />

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
                // Sort-INDEPENDENT. This used to read courseOf(group.rows[0]),
                // which named whichever course the sort happened to put first
                // — so changing the sort silently relabelled a mixed group. A
                // group whose rows carry several courses has no one course to
                // advertise, and saying nothing is the honest answer.
                const groupCourses = distinctCourses(group.rows);
                const course =
                    groupCourses.length === 1 ? groupCourses[0] : null;
                return (
                    <section key={group.key} aria-labelledby={headingId}>
                    <div className="sticky top-0 z-10 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line bg-surface pb-1.5 pt-2">
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
                    <span className="ml-auto flex flex-wrap items-baseline justify-end gap-x-3 gap-y-1 whitespace-nowrap">
                    {(() => {
                        // A6: which classes hold this unit, and how much of it.
                        const ids = (fullUnits.get(group.key) ?? group.rows)
                            .filter((r) => r.status === 'published')
                            .map((r) => r.id);
                        const held = unitMembership(membership, ids);
                        if (held.length === 0) return null;
                        return (
                            <span className="text-xs text-muted" data-unit-membership>
                            In{' '}
                            {held
                                .map(({ cls, count }) =>
                                    count === ids.length ? cls.name : `${cls.name} (${count}/${ids.length})`,
                                )
                                .join(' · ')}
                            </span>
                        );
                    })()}
                    {group.rows.some((r) => r.status === 'published') && (
                        <button
                        type="button"
                        aria-expanded={classPanel === `unit:${group.key}`}
                        aria-label={`Add unit ${group.unit ?? 'No unit'} to a class`}
                        onClick={() =>
                            setClassPanel((cur) => (cur === `unit:${group.key}` ? null : `unit:${group.key}`))
                        }
                        className="text-xs font-medium text-ink underline underline-offset-2 hover:text-strong"
                        >
                        Add to class…
                        </button>
                    )}
                    {chainsWithHooks(chainHooks, group.rows.map((r) => r.id)).map((chain) => (
                        <Link
                        key={chain}
                        to={chainHooksPath(chain)}
                        className="text-xs font-medium text-muted underline underline-offset-2 hover:text-strong"
                        >
                        Hooks ({chainHooks.chains[chain]?.length ?? 0})
                        </Link>
                    ))}
                    {bankLister && group.rows.some((r) => r.status === 'published' && !r.copied_from_activity_id) && (() => {
                        const published = group.rows.filter(
                            (r) => r.status === 'published' && !r.copied_from_activity_id,
                        );
                        const allListed = published.every((r) => r.visibility === 'public');
                        return (
                            <button
                            type="button"
                            disabled={listingBusy !== null}
                            onClick={() => void applyListing(published, !allListed, `unit:${group.key}`)}
                            className="text-xs font-medium text-muted underline underline-offset-2 hover:text-strong disabled:opacity-50"
                            >
                            {listingBusy === `unit:${group.key}`
                                ? 'Updating…'
                                : allListed
                                  ? 'Remove unit from the Bank'
                                  : 'List unit in the Bank'}
                            </button>
                        );
                    })()}
                    </span>
                    </div>

                    {classPanel === `unit:${group.key}` && (
                        <AddToClassPanel
                        targets={fullUnits.get(group.key) ?? group.rows}
                        membership={membership}
                        label={group.unit ?? 'No unit'}
                        onClose={() => setClassPanel(null)}
                        />
                    )}

                    {/* Flat rows, hairline separators (D8). The card-per-row
                        treatment fails the hard rules at 150 rows: the
                        decoration IS the noise. Structure comes from the
                        header above; the row carries only content. */}
                    <ul className="mt-1.5 overflow-hidden rounded-lg border border-line bg-canvas">
                    {group.rows.map((a, i) => (
                        <li
                        key={a.id}
                        className={`flex flex-wrap items-center gap-x-3 px-3.5 py-2 transition hover:bg-surface-2 ${
                            i > 0 ? 'border-t border-line' : ''
                        }`}
                        >
                        {/* Row anatomy amended 2026-10-14 (R1–R7, amends D8):
                            the title owns the row; only EXCEPTIONS get a badge
                            (draft, a non-lesson role); the edited date moved to
                            the title's tooltip; Analytics, Delete and the Bank
                            markers are icons with names. */}
                        <Link
                        to={`/activity/${a.id}`}
                        title={`${a.title}\nEdited ${formatEdited(a.updated_at)}`}
                        className="min-w-0 flex-1 basis-full truncate text-sm font-medium text-ink hover:underline sm:basis-0"
                        >
                        {a.title}
                        </Link>
                        <span className="ml-auto flex shrink-0 items-center gap-2">
                        {a.copied_from_activity_id && (
                            <Import
                            role="img"
                            aria-label="From the Activity Bank: this copy is yours"
                            className="h-3.5 w-3.5 text-faint"
                            >
                            <title>From the Activity Bank: this copy is yours</title>
                            </Import>
                        )}
                        <RoleBadge role={a.pedagogical_role} />
                        {a.status !== 'published' && <StatusBadge status={a.status} />}
                        {a.status === 'published' && (() => {
                            // A1 single door + A6 membership in one control:
                            // it names the classes holding this activity, or
                            // offers to add it to one.
                            const held = classesHolding(membership, a.id);
                            return (
                                <button
                                type="button"
                                aria-expanded={classPanel === a.id}
                                aria-label={
                                    held.length > 0
                                        ? `${a.title}: on Home in ${held.map((c) => c.name).join(', ')}. Change classes`
                                        : `Add ${a.title} to a class`
                                }
                                onClick={() => setClassPanel((cur) => (cur === a.id ? null : a.id))}
                                className="text-xs font-medium text-muted underline underline-offset-2 hover:text-strong"
                                >
                                {held.length > 0 ? held.map((c) => c.name).join(' · ') : 'Add to class'}
                                </button>
                            );
                        })()}
                        {bankLister && a.status === 'published' && !a.copied_from_activity_id ? (
                            // R5: the marker IS the control. Filled = listed.
                            <button
                            type="button"
                            disabled={listingBusy !== null}
                            onClick={() => void applyListing([a], a.visibility !== 'public', a.id)}
                            aria-label={a.visibility === 'public' ? `Remove ${a.title} from the Activity Bank` : `List ${a.title} in the Activity Bank`}
                            aria-pressed={a.visibility === 'public'}
                            title={a.visibility === 'public' ? 'In the Activity Bank. Click to remove' : 'Not in the Activity Bank. Click to list'}
                            className={`${ICON_BUTTON} ${
                                a.visibility === 'public'
                                    ? 'bg-success-bg text-success-strong'
                                    : 'text-faint hover:text-strong'
                            } disabled:opacity-50`}
                            >
                            <Library aria-hidden="true" className="h-4 w-4" />
                            </button>
                        ) : a.visibility === 'public' ? (
                            <span title="In the Activity Bank" className="rounded-md bg-success-bg p-1 text-success-strong">
                            <Library role="img" aria-label="In the Activity Bank" className="h-4 w-4" />
                            </span>
                        ) : null}
                        {/* Each rostered student's checked work, by class (0061,
                            class-progress-view.md D5): beside Analytics and Responses. */}
                        <Link
                        to={`/activity/${a.id}/progress`}
                        aria-label={`Progress for ${a.title}`}
                        title="Progress"
                        className={`${ICON_BUTTON} text-muted hover:text-strong`}
                        >
                        <Users aria-hidden="true" className="h-4 w-4" />
                        </Link>
                        <Link
                        to={`/activity/${a.id}/analytics`}
                        aria-label={`Analytics for ${a.title}`}
                        title="Analytics"
                        className={`${ICON_BUTTON} text-muted hover:text-strong`}
                        >
                        <BarChart3 aria-hidden="true" className="h-4 w-4" />
                        </Link>
                        {/* The grading queue (hand-graded answers, by question). It had no
                            link anywhere until 2026-10-17: the author found the gap looking
                            for a test student's work. */}
                        <Link
                        to={`/activity/${a.id}/responses`}
                        aria-label={`Responses for ${a.title}`}
                        title="Responses"
                        className={`${ICON_BUTTON} text-muted hover:text-strong`}
                        >
                        <ClipboardCheck aria-hidden="true" className="h-4 w-4" />
                        </Link>
                        <button
                        type="button"
                        onClick={() => {
                            // G-6: one in a class asks first and names the
                            // classes; one in no class keeps one click + undo.
                            // Until membership has loaded (or if it failed) we
                            // can't know, so it asks with general wording.
                            if (membership.status !== 'ready') {
                                setConfirmDelete({ activity: a, classes: null });
                                return;
                            }
                            const held = classesHolding(membership, a.id);
                            if (held.length > 0) setConfirmDelete({ activity: a, classes: held.map((c) => c.name) });
                            else void handleDelete(a);
                        }}
                        disabled={deletingId === a.id}
                        aria-label={`Delete ${a.title}`}
                        title="Delete"
                        className={`${ICON_BUTTON} text-muted hover:text-danger disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        </button>
                        </span>
                        {classPanel === a.id && (
                            <AddToClassPanel
                            targets={[a]}
                            membership={membership}
                            label={a.title}
                            onClose={() => setClassPanel(null)}
                            />
                        )}
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
        {listingError && (
            <p className="mt-3 text-sm text-danger" role="alert">{listingError}</p>
        )}
        <RecentlyDeleted items={deleted} onRestore={restoreFromDeleted} noun="activity" />
        </div>
        </div>

        {confirmDelete && (
            <Suspense fallback={null}>
            <ConfirmDialog
            title={ACTIVITY_DELETE_COPY.title(confirmDelete.activity.title)}
            confirmLabel={ACTIVITY_DELETE_COPY.confirm}
            danger
            onCancel={() => setConfirmDelete(null)}
            onConfirm={async () => {
                const target = confirmDelete.activity;
                setConfirmDelete(null);
                await handleDelete(target);
            }}
            >
            <p>{ACTIVITY_DELETE_COPY.body(confirmDelete.classes)}</p>
            </ConfirmDialog>
            </Suspense>
        )}

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
