// =============================================================================
// ClassRoster.tsx — a class card's roster panel (lazy, from routes/Classes)
// -----------------------------------------------------------------------------
// The student list (search past ROSTER_SEARCH_FROM, removed students under a
// disclosure) and B14's two-action remove dialog. Split from the Classes page
// so the page's journey budget pays for it only when Roster is opened.
// =============================================================================

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useDialogFocus } from '../lib/useDialogFocus';
import {
    formatDate,
    joinUrlFor,
    listClassMembers,
    moveClassMember,
    regenerateJoinCode,
    removeClassMember,
    type ClassInfo,
    type ClassMember,
} from '../lib/classes';

/** Past this many students the roster gets a search box. */
const ROSTER_SEARCH_FROM = 10;

export default function Roster({
    info,
    onCodeChange,
    onCount,
    moveTargets = [],
    onMoved,
}: {
    info: ClassInfo;
    onCodeChange: (id: string, code: string) => void;
    /** The current-student count, each time the roster is read. */
    onCount: (n: number) => void;
    /** The teacher's OTHER classes, for "Move to…" (0089, S5). */
    moveTargets?: ReadonlyArray<{ id: string; name: string }>;
    /** After a move: the page re-reads its class counts. */
    onMoved?: () => void;
}) {
    const [moving, setMoving] = useState<ClassMember | null>(null);
    const [members, setMembers] = useState<ClassMember[] | null>(null);
    const [query, setQuery] = useState('');
    useEffect(() => {
        if (members) onCount(members.filter((m) => m.removedAt === null).length);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [members]);
    const [error, setError] = useState<string | null>(null);
    // B14: removal is a DIALOG with two explicit actions, never a one-click
    // (the lockout half — regenerate — must be offered where remove happens).
    const [removing, setRemoving] = useState<ClassMember | null>(null);

    const load = async () => {
        try {
            setMembers(await listClassMembers(info.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not load roster.');
        }
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const m = await listClassMembers(info.id);
                if (!cancelled) setMembers(m);
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error ? err.message : 'Could not load roster.',
                    );
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [info.id]);

    if (error) return <p className="mt-2 text-sm text-danger">{error}</p>;
    if (members === null)
        return <p className="mt-2 text-sm text-muted">Loading roster…</p>;

    const active = members.filter((m) => m.removedAt === null);
    const removed = members.filter((m) => m.removedAt !== null);
    // Removed students, out of the way: a teacher checking who left, or why
    // a name is missing, can see them without them crowding the list.
    const removedList = removed.length > 0 && (
        <details className="mt-2 text-sm" data-roster-removed>
        <summary className="cursor-pointer text-muted">Removed ({removed.length})</summary>
        <ul className="mt-1 divide-y divide-line">
        {removed.map((m) => (
            <li key={m.studentId} className="py-1.5 text-muted">
            <span className="block truncate">{m.displayName ?? m.email}</span>
            <span className="block truncate text-xs">
            {m.email} · removed {formatDate(m.removedAt as string)}
            </span>
            </li>
        ))}
        </ul>
        </details>
    );
    if (active.length === 0)
        return (
            <>
            <p className="mt-2 text-sm text-muted">
            No students yet. Share the join code —
            students sign in with their school Google account and enter it.
            </p>
            {removedList}
            </>
        );

    const q = query.trim().toLowerCase();
    const shown = q
        ? active.filter((m) => `${m.displayName ?? ''} ${m.email}`.toLowerCase().includes(q))
        : active;

    return (
        <>
        {active.length > ROSTER_SEARCH_FROM && (
            <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${active.length} students`}
            aria-label={`Search the roster: ${info.name}`}
            className="mt-2 w-full max-w-xs rounded-md border border-line bg-surface px-2 py-1 text-sm text-ink placeholder:text-faint focus:border-line-strong focus:outline-none"
            />
        )}
        {q && shown.length === 0 && (
            <p className="mt-2 text-sm text-muted">No student matches “{query.trim()}”.</p>
        )}
        <ul className="mt-2 divide-y divide-line">
        {shown.map((m) => (
            <li
            key={m.studentId}
            className="flex items-center justify-between gap-3 py-2"
            >
            <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-strong">
            {m.displayName ?? m.email}
            </span>
            <span className="block truncate text-xs text-muted">
            {m.email} · joined {formatDate(m.joinedAt)}
            </span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
            {moveTargets.length > 0 && (
                <button
                type="button"
                onClick={() => setMoving(m)}
                aria-label={`Move ${m.displayName ?? m.email} to another class`}
                className="px-1 py-2.5 text-sm font-medium text-muted underline underline-offset-2 transition hover:text-strong"
                >
                Move
                </button>
            )}
            <button
            type="button"
            onClick={() => setRemoving(m)}
            // D-6: 30 rows of "Remove" are 30 identical buttons to a screen
            // reader; the name says whose. The visible word stays "Remove".
            aria-label={`Remove ${m.displayName ?? m.email}`}
            className="shrink-0 px-1 py-2.5 text-sm font-medium text-muted underline underline-offset-2 transition hover:text-danger"
            >
            Remove
            </button>
            </span>
            </li>
        ))}
        </ul>
        {removedList}
        {moving && (
            <MoveStudentDialog
            member={moving}
            from={info}
            targets={moveTargets}
            onClose={() => setMoving(null)}
            onMoved={() => {
                setMoving(null);
                void load();
                onMoved?.();
            }}
            />
        )}
        {removing && (
            <RemoveStudentDialog
            member={removing}
            info={info}
            onClose={() => setRemoving(null)}
            onRemoved={(newCode) => {
                setRemoving(null);
                if (newCode) onCodeChange(info.id, newCode);
                void load();
            }}
            />
        )}
        </>
    );
}

/**
 * "Move to…" (0089, schema-shortlist.md S5): one of the teacher's other
 * classes, then one confirm that names both classes and says the work stays.
 * Errors (a full class, a class limited to another domain) show IN the dialog.
 */
function MoveStudentDialog({
    member,
    from,
    targets,
    onClose,
    onMoved,
}: {
    member: ClassMember;
    from: ClassInfo;
    targets: ReadonlyArray<{ id: string; name: string }>;
    onClose: () => void;
    onMoved: () => void;
}) {
    const [to, setTo] = useState(targets[0]?.id ?? '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const onKeyDown = useDialogFocus(dialogRef, () => !busy && onClose(), 'select');
    const label = member.displayName ?? member.email;
    const toName = targets.find((t) => t.id === to)?.name ?? '';
    const move = async () => {
        setBusy(true);
        setError(null);
        try {
            await moveClassMember(member.studentId, from.id, to);
            onMoved();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not move the student.');
            setBusy(false);
        }
    };
    return (
        <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-6"
        role="presentation"
        onMouseDown={(e) => {
            if (e.target === e.currentTarget && !busy) onClose();
        }}
        onKeyDown={onKeyDown}
        >
        <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="move-student-title"
        data-move-dialog
        className="w-full max-w-md rounded-lg border border-line bg-canvas p-6 shadow-lg outline-none"
        >
        <h2 id="move-student-title" className="text-lg font-bold text-ink">
        Move {label}
        </h2>
        <label className="mt-3 block text-sm text-muted">
        From {from.name} to
        <select
        value={to}
        onChange={(e) => setTo(e.target.value)}
        disabled={busy}
        className="mt-1 block w-full rounded-md border border-line-strong bg-canvas px-2 py-1.5 text-sm text-ink"
        >
        {targets.map((t) => (
            <option key={t.id} value={t.id}>
            {t.name}
            </option>
        ))}
        </select>
        </label>
        <p className="mt-3 text-sm text-muted">
        They leave {from.name} and join {toName}. Their checked work stays with them; this
        class&rsquo;s practice history stays here.
        </p>
        {error && (
            <p className="mt-3 text-sm text-danger" role="alert">
            {error}
            </p>
        )}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
        type="button"
        onClick={onClose}
        disabled={busy}
        className="min-h-11 rounded-md border border-line-strong bg-canvas px-4 py-2.5 text-sm font-medium text-strong shadow-sm hover:bg-surface"
        >
        Cancel
        </button>
        <button
        type="button"
        onClick={() => void move()}
        disabled={busy || !to}
        className="min-h-11 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-hover disabled:opacity-50"
        >
        {busy ? 'Moving…' : `Move to ${toName}`}
        </button>
        </div>
        </div>
        </div>
    );
}

/**
 * B14's two-action removal (design board 5a/5b): "Remove" and "Remove & get
 * a new class code" as EXPLICIT stacked choices — no default, plain vs
 * danger encodes the severity, consequence sublines make the choice legible.
 * Focus: opens on the safe action, trapped, Esc cancels, returns to the
 * invoking control (the browser restores it when the dialog unmounts is NOT
 * guaranteed — we do it by hand). Errors render IN the dialog: a page-level
 * message is invisible behind a modal backdrop (design OV#12).
 */
function RemoveStudentDialog({
    member,
    info,
    onClose,
    onRemoved,
}: {
    member: ClassMember;
    info: ClassInfo;
    onClose: () => void;
    onRemoved: (newCode: string | null) => void;
}) {
    const [busy, setBusy] = useState<'remove' | 'lockout' | null>(null);
    const [error, setError] = useState<string | null>(null);
    // Board 5b: the after-state. The flow's whole point is invalidating the
    // posted link, so it ends by handing the teacher BOTH re-postable forms of
    // the new code — the code to read aloud and the link to paste.
    const [newCode, setNewCode] = useState<string | null>(null);
    const [copied, setCopied] = useState<'code' | 'link' | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const firstActionRef = useRef<HTMLButtonElement>(null);
    const invokerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        invokerRef.current = document.activeElement as HTMLElement | null;
        firstActionRef.current?.focus();
        return () => invokerRef.current?.focus();
    }, []);

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            if (!busy) {
                if (newCode) onRemoved(newCode);
                else onClose();
            }
            return;
        }
        if (e.key !== 'Tab') return;
        // Minimal trap: cycle within the dialog's focusable controls.
        const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled])',
        );
        if (!nodes || nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };

    const removeOnly = async () => {
        setBusy('remove');
        setError(null);
        try {
            await removeClassMember(info.id, member.studentId);
            onRemoved(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not remove — check your connection and try again.');
            setBusy(null);
        }
    };

    const removeAndRegenerate = async () => {
        setBusy('lockout');
        setError(null);
        try {
            await removeClassMember(info.id, member.studentId);
            const code = await regenerateJoinCode(info.id);
            setNewCode(code);
            setBusy(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not remove — check your connection and try again.');
            setBusy(null);
        }
    };

    const studentLabel = member.displayName ?? member.email;

    return (
        <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-6"
        role="presentation"
        >
        <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={newCode ? `${studentLabel} removed` : `Remove ${studentLabel} from ${info.name}?`}
        onKeyDown={onKeyDown}
        className="w-full max-w-md rounded-lg border border-line bg-canvas p-6 shadow-lg"
        >
        {newCode ? (
            <>
            <h2 className="text-lg font-bold text-ink">{studentLabel} removed</h2>
            <p className="mt-2 text-sm text-muted">
            The old link no longer works. Share this new code — or the new link —
            with your class:
            </p>
            <div className="mt-3 flex items-center gap-3">
            <span className="rounded-md border border-line bg-surface px-3 py-1.5 font-mono text-lg font-semibold tracking-[0.2em] text-ink">
            {newCode}
            </span>
            <button
            ref={firstActionRef}
            type="button"
            onClick={() => {
                void navigator.clipboard?.writeText(newCode).then(() => {
                    setCopied('code');
                    setTimeout(() => setCopied(null), 1500);
                }).catch(() => undefined); // no clipboard: the code is on screen to read
            }}
            className="rounded-md border border-line-strong bg-canvas px-4 py-2.5 text-sm font-medium text-strong shadow-sm transition hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink min-h-11"
            >
            {copied === 'code' ? 'Copied' : 'Copy code'}
            </button>
            <button
            type="button"
            onClick={() => {
                // Same helper the class card uses — the regenerated link must
                // be byte-identical to the one the teacher copies elsewhere.
                void navigator.clipboard?.writeText(joinUrlFor(newCode)).then(() => {
                    setCopied('link');
                    setTimeout(() => setCopied(null), 1500);
                }).catch(() => undefined); // no clipboard: the code is on screen to read
            }}
            className="rounded-md border border-line-strong bg-canvas px-4 py-2.5 text-sm font-medium text-strong shadow-sm transition hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink min-h-11"
            >
            {copied === 'link' ? 'Copied' : 'Copy link'}
            </button>
            <button
            type="button"
            onClick={() => onRemoved(newCode)}
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink min-h-11"
            >
            Done
            </button>
            </div>
            </>
        ) : (
            <>
            <h2 className="text-lg font-bold text-ink">
            Remove {studentLabel} from {info.name}?
            </h2>
            <p className="mt-2 text-sm text-muted">
            They keep their past work. With the current code{' '}
            <span className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs tracking-[0.15em]">
            {info.joinCode}
            </span>{' '}
            they could rejoin later.
            </p>
            <div className="mt-4 flex flex-col gap-2">
            <button
            ref={firstActionRef}
            type="button"
            disabled={busy !== null}
            onClick={() => void removeOnly()}
            aria-label="Remove"
            className="rounded-md border border-line-strong bg-canvas px-4 py-2.5 text-left text-sm font-medium text-strong shadow-sm transition hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50 min-h-11"
            >
            {busy === 'remove' ? 'Removing…' : 'Remove'}
            {/* aria-label keeps the accessible NAME the action; the
                consequence subline reads as content, not name. */}
            <span className="block text-xs font-normal text-muted">
            Can rejoin with the current code
            </span>
            </button>
            <button
            type="button"
            disabled={busy !== null}
            onClick={() => void removeAndRegenerate()}
            aria-label="Remove and get a new class code"
            className="rounded-md bg-danger px-4 py-2.5 text-left text-sm font-medium text-white shadow-sm transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50 min-h-11"
            >
            {busy === 'lockout' ? 'Removing…' : 'Remove & get a new class code'}
            <span className="block text-xs font-normal opacity-85">
            Prevents rejoin — the posted link stops working for future joins
            </span>
            </button>
            <button
            type="button"
            disabled={busy !== null}
            onClick={onClose}
            className="rounded-md border border-line-strong bg-canvas px-4 py-2.5 text-sm font-medium text-strong shadow-sm transition hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50 min-h-11"
            >
            Cancel
            </button>
            </div>
            {error && (
                <p role="alert" className="mt-3 text-sm text-danger">
                {error}
                </p>
            )}
            </>
        )}
        </div>
        </div>
    );
}
