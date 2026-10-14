// =============================================================================
// AddToClass.tsx — putting activities on a class's Home from My activities
// -----------------------------------------------------------------------------
// docs/design/assign-to-class.md, ruled 2026-10-14 (A1–A6, all as recommended):
//
//  * A1: one door per unit header (the bulk door) and one per row (the single
//    door). Both open THIS panel, inline under what was clicked (a floating
//    popover would be clipped by the row list's rounded overflow).
//  * A2: one checkbox per class showing its CURRENT state for the targets
//    (checked, unchecked, or mixed "3 of 5"). Ticking adds at once; unticking
//    removes, with an undo window (the class panel's DR-5 semantics: the undo
//    appears only after the remove succeeded).
//  * A3: drafts are never sent (the server refuses them); the panel says how
//    many were skipped and why.
//  * A4(a): adds go through addActivitiesToClass, which sends them last-first
//    so the unit reads in teaching order on the student's Home.
//  * A6: `classesHolding` / `unitMembership` feed the quiet "7A · 7B" line on
//    rows and the "In 7B (5/6)" line on unit headers.
//
// Data: ONE pair of queries for the whole page (classes + class rows), loaded
// after first paint and refetched after every write, so every row's line and
// every checkbox read the same server truth.
// =============================================================================

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { listClasses, type ClassInfo } from '../lib/classes';
import {
    addActivitiesToClass,
    listTeacherClassActivities,
    unshareActivityFromClass,
    type TeacherClassActivity,
} from '../lib/classActivities';
import { UNDO_WINDOW_MS } from './ClassActivitiesPanel';

export interface ClassMembership {
    status: 'loading' | 'ready' | 'error';
    classes: ClassInfo[];
    rows: TeacherClassActivity[];
    reload: () => Promise<void>;
}

/** The page-level membership data (A6). Errors leave status 'error'; the
 *  page renders without membership lines and the panel says it could not load. */
export function useClassMembership(): ClassMembership {
    const [status, setStatus] = useState<ClassMembership['status']>('loading');
    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [rows, setRows] = useState<TeacherClassActivity[]>([]);

    const reload = useCallback(async () => {
        try {
            const [nextClasses, nextRows] = await Promise.all([
                listClasses(),
                listTeacherClassActivities(),
            ]);
            // Name order: a teacher finds "7B" by reading, not by creation date.
            setClasses(
                [...nextClasses].sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }),
                ),
            );
            setRows(nextRows);
            setStatus('ready');
        } catch {
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        void reload();
    }, [reload]);

    return { status, classes, rows, reload };
}

/** The classes (by name order) that have this activity on their Home. */
export function classesHolding(m: ClassMembership, activityId: string): ClassInfo[] {
    const ids = new Set(m.rows.filter((r) => r.activityId === activityId).map((r) => r.classId));
    return m.classes.filter((c) => ids.has(c.id));
}

/** For a unit: each class holding at least one of `ids`, with how many. */
export function unitMembership(
    m: ClassMembership,
    ids: readonly string[],
): { cls: ClassInfo; count: number }[] {
    const wanted = new Set(ids);
    return m.classes
        .map((cls) => ({
            cls,
            count: m.rows.filter((r) => r.classId === cls.id && wanted.has(r.activityId)).length,
        }))
        .filter((x) => x.count > 0);
}

export interface AddTarget {
    id: string;
    title: string;
    status: 'draft' | 'published' | 'archived';
}

export const ADD_PANEL_COPY = {
    heading: "On students' Home",
    noClasses: 'You have no classes yet.',
    loadFailed: "We couldn't load your classes just now.",
    allDrafts: 'Publish an activity before adding it to a class.',
} as const;

export function skippedDraftsCopy(n: number): string {
    return `${n} draft${n === 1 ? '' : 's'} skipped (publish ${n === 1 ? 'it' : 'them'} first)`;
}

interface Undo {
    classId: string;
    className: string;
    ids: string[];
}

/**
 * The panel. `targets` are in TEACHING order (the outline's order); the
 * caller passes one row for the single door, a unit's rows for the bulk door.
 */
export function AddToClassPanel({
    targets,
    membership,
    label,
    onClose,
}: {
    targets: readonly AddTarget[];
    membership: ClassMembership;
    /** What the panel is about, for its accessible name ("Integers", a title). */
    label: string;
    onClose: () => void;
}) {
    const published = targets.filter((t) => t.status === 'published');
    const drafts = targets.length - published.length;
    const ids = published.map((t) => t.id);
    const many = targets.length > 1;

    const [busy, setBusy] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
    const [undo, setUndo] = useState<Undo | null>(null);
    const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => () => {
        if (undoTimer.current) clearTimeout(undoTimer.current);
    }, []);

    // Escape closes, like the editor's "Add to a class…" select.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    useEffect(() => {
        panelRef.current?.querySelector<HTMLElement>('input, button')?.focus();
    }, []);

    const countIn = (classId: string) => {
        const wanted = new Set(ids);
        return membership.rows.filter((r) => r.classId === classId && wanted.has(r.activityId)).length;
    };

    const add = async (cls: ClassInfo) => {
        const already = new Set(
            membership.rows.filter((r) => r.classId === cls.id).map((r) => r.activityId),
        );
        const missing = ids.filter((id) => !already.has(id));
        setBusy(cls.id);
        setMessage(null);
        setUndo(null);
        try {
            const result = await addActivitiesToClass(cls.id, missing);
            await membership.reload();
            if (result.failed.length > 0) {
                setMessage({
                    text: result.refused
                        ? `Couldn't add ${result.failed.length} to ${cls.name}: no longer published.`
                        : `Couldn't add ${result.failed.length} of ${missing.length} to ${cls.name} just now. Tick it again to retry.`,
                    error: true,
                });
                return;
            }
            const what = many ? `Added ${result.added.length} to ${cls.name}` : `Added to ${cls.name}`;
            setMessage({
                text: drafts > 0 ? `${what} ✓ · ${skippedDraftsCopy(drafts)}` : `${what} ✓`,
                error: false,
            });
        } finally {
            setBusy(null);
        }
    };

    const remove = async (cls: ClassInfo) => {
        const present = ids.filter((id) =>
            membership.rows.some((r) => r.classId === cls.id && r.activityId === id),
        );
        setBusy(cls.id);
        setMessage(null);
        setUndo(null);
        const removed: string[] = [];
        try {
            for (const id of present) {
                try {
                    await unshareActivityFromClass(cls.id, id);
                    removed.push(id);
                } catch {
                    // Named below; the rest still go.
                }
            }
            await membership.reload();
            if (removed.length < present.length) {
                setMessage({
                    text: `Couldn't remove ${present.length - removed.length} from ${cls.name} just now. Try again.`,
                    error: true,
                });
            }
            if (removed.length > 0) {
                // CONFIRMED remove (DR-5): the undo exists only once it happened.
                // Undo re-adds in teaching order, so the restore reads right too.
                const inOrder = ids.filter((id) => removed.includes(id));
                setUndo({ classId: cls.id, className: cls.name, ids: inOrder });
                if (undoTimer.current) clearTimeout(undoTimer.current);
                undoTimer.current = setTimeout(() => setUndo(null), UNDO_WINDOW_MS);
            }
        } finally {
            setBusy(null);
        }
    };

    const runUndo = async (u: Undo) => {
        if (undoTimer.current) clearTimeout(undoTimer.current);
        setUndo(null);
        setBusy(u.classId);
        try {
            const result = await addActivitiesToClass(u.classId, u.ids);
            await membership.reload();
            setMessage(
                result.failed.length > 0
                    ? { text: `Couldn't restore ${result.failed.length} to ${u.className}. Tick it to add again.`, error: true }
                    : { text: `Restored to ${u.className} ✓`, error: false },
            );
        } finally {
            setBusy(null);
        }
    };

    let body: ReactNode;
    if (published.length === 0) {
        body = <p className="text-sm text-muted">{ADD_PANEL_COPY.allDrafts}</p>;
    } else if (membership.status === 'loading') {
        body = <p className="text-sm text-muted">Loading your classes…</p>;
    } else if (membership.status === 'error') {
        body = (
            <p className="text-sm text-muted">
            {ADD_PANEL_COPY.loadFailed}{' '}
            <button
            type="button"
            onClick={() => void membership.reload()}
            className="font-medium text-ink underline underline-offset-2"
            >
            Try again
            </button>
            </p>
        );
    } else if (membership.classes.length === 0) {
        body = (
            <p className="text-sm text-muted">
            {ADD_PANEL_COPY.noClasses}{' '}
            <Link to="/classes" className="font-medium text-ink underline underline-offset-2">
            Create one in My classes
            </Link>
            </p>
        );
    } else {
        body = (
            <ul className="space-y-1">
            {membership.classes.map((cls) => {
                const k = countIn(cls.id);
                const all = k === ids.length;
                const mixed = k > 0 && !all;
                return (
                    <li key={cls.id}>
                    <label className="flex min-h-[36px] cursor-pointer items-center gap-2.5 text-sm text-ink">
                    <input
                    type="checkbox"
                    checked={all}
                    ref={(el) => {
                        if (el) el.indeterminate = mixed;
                    }}
                    aria-checked={mixed ? 'mixed' : all}
                    disabled={busy !== null}
                    onChange={() => void (all ? remove(cls) : add(cls))}
                    className="h-4 w-4 accent-primary"
                    />
                    <span className="font-medium">{cls.name}</span>
                    {mixed && (
                        <span className="text-xs text-muted">
                        {k} of {ids.length}
                        </span>
                    )}
                    {busy === cls.id && <span className="text-xs text-muted">Saving…</span>}
                    </label>
                    </li>
                );
            })}
            </ul>
        );
    }

    return (
        <div
        ref={panelRef}
        role="group"
        aria-label={`Add ${label} to a class`}
        className="mt-1.5 basis-full rounded-md border border-line-strong bg-canvas p-3 shadow-sm"
        >
        <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
        {ADD_PANEL_COPY.heading}
        </h3>
        <button
        type="button"
        onClick={onClose}
        className="text-xs font-medium text-muted underline underline-offset-2 hover:text-strong"
        >
        Done
        </button>
        </div>
        {body}
        {published.length > 0 && drafts > 0 && !message && (
            <p className="mt-2 text-xs text-muted">{skippedDraftsCopy(drafts)}.</p>
        )}
        <div role="status" aria-live="polite">
        {message && (
            <p className={`mt-2 text-sm ${message.error ? 'text-danger' : 'text-ink'}`}>
            {message.text}
            </p>
        )}
        {undo && (
            <p className="mt-2 text-sm text-ink">
            Removed {undo.ids.length > 1 ? `${undo.ids.length} ` : ''}from {undo.className}.{' '}
            <button
            type="button"
            onClick={() => void runUndo(undo)}
            className="font-medium underline underline-offset-2"
            >
            Undo
            </button>
            </p>
        )}
        </div>
        <p className="mt-2 text-xs text-muted">
        Added activities appear on your students&apos; Home. A whole unit is added so it reads in teaching order.
        </p>
        </div>
    );
}
