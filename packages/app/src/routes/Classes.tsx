import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useSession } from '../lib/SessionContext';
import ClassActivitiesPanel, {
    useTeacherClassActivities,
    type TeacherActivitiesData,
} from '../components/ClassActivitiesPanel';
import {
    ASSERTION_TEXT,
    createClass,
    listClasses,
    listClassMembers,
    regenerateJoinCode,
    removeClassMember,
    softDeleteClass,
    updateClassDomain,
    type ClassInfo,
    type ClassMember,
} from '../lib/classes';

// Teacher-side class management (S1, identity lane). The one non-negotiable
// piece of UX here is the 13+ assertion checkbox (ruling 3.1C): it is
// unchecked by default, required, and its exact wording is ASSERTION_TEXT —
// the class row records when/who/which-version. Everything else is roster
// plumbing for the viewer arc (students join via code; codes are classroom-
// public and regenerable).

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * The join URL for a code. ONE definition, because the teacher-facing copy
 * control, the B14 regenerate after-state, and anything that later emails or
 * prints a link must all produce the same string — a hand-assembled URL in a
 * second place is how a shared link quietly stops matching the route (P2).
 * Origin-relative on purpose: it is correct on localhost and in production
 * without an env var, and it is the same origin the SPA already serves
 * `/join/:code` from (App.tsx).
 */
export function joinUrlFor(code: string): string {
    return `${window.location.origin}/join/${code}`;
}

function JoinCode({ code }: { code: string }) {
    // TWO affordances, deliberately, because teachers distribute a class code
    // two different ways: they READ IT ALOUD (hence the large spaced monospace
    // chip, which copies the bare code) and they POST IT (hence Copy link,
    // which yields the /join/:code deep link B12 ruled and the B14 dialog's
    // "the old link no longer works" copy already presumes exists).
    const [copied, setCopied] = useState<'code' | 'link' | null>(null);
    const flash = (what: 'code' | 'link') => {
        setCopied(what);
        setTimeout(() => setCopied(null), 1500);
    };
    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(code);
            flash('code');
        } catch {
            // Clipboard unavailable — the code is visible; nothing to do.
        }
    };
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(joinUrlFor(code));
            flash('link');
        } catch {
            // Clipboard unavailable — nothing to fall back to; the code is
            // still readable and the link is derivable from it.
        }
    };
    return (
        <>
        <button
        type="button"
        onClick={copyCode}
        title="Copy join code"
        className="rounded-md border border-line bg-surface px-3 py-1 font-mono text-lg font-semibold tracking-[0.2em] text-ink transition hover:border-line-strong"
        >
        {copied === 'code' ? 'Copied' : code}
        </button>
        <button
        type="button"
        onClick={copyLink}
        title={`Copy the join link (${joinUrlFor(code)})`}
        className="text-sm font-medium text-muted underline underline-offset-2 transition hover:text-strong"
        >
        {copied === 'link' ? 'Link copied' : 'Copy link'}
        </button>
        </>
    );
}

function Roster({
    info,
    onCodeChange,
}: {
    info: ClassInfo;
    onCodeChange: (id: string, code: string) => void;
}) {
    const [members, setMembers] = useState<ClassMember[] | null>(null);
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
    if (active.length === 0)
        return (
            <p className="mt-2 text-sm text-muted">
            No students yet. Once student sign-in opens, share the join code —
            students sign in with their school Google account and enter it.
            </p>
        );

    return (
        <>
        <ul className="mt-2 divide-y divide-line">
        {active.map((m) => (
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
            <button
            type="button"
            onClick={() => setRemoving(m)}
            className="shrink-0 px-1 py-2.5 text-sm font-medium text-muted underline underline-offset-2 transition hover:text-danger"
            >
            Remove
            </button>
            </li>
        ))}
        </ul>
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
                }).catch(() => undefined);
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
                }).catch(() => undefined);
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

function ClassCard({
    info,
    activities,
    onCodeChange,
    onDomainChange,
    onDeleted,
    onError,
}: {
    info: ClassInfo;
    activities: TeacherActivitiesData;
    onCodeChange: (id: string, code: string) => void;
    onDomainChange: (id: string, domain: string | null) => void;
    onDeleted: (id: string) => void;
    onError: (msg: string) => void;
}) {
    const [showRoster, setShowRoster] = useState(false);
    // The "On students' Home" disclosure (board 3a). The count is COMMITTED
    // rows only (DR-3) — it derives from the shared page-level data, which
    // every mutation refetches, so it can never drift from the server.
    const [showActivities, setShowActivities] = useState(false);
    const activityCount = activities.rows.filter(
        (r) => r.classId === info.id,
    ).length;
    const [regenerating, setRegenerating] = useState(false);
    // Domain edit (T4/D-4): a typo'd domain bricks joining, so it is
    // editable in place — through the audited RPC, since widening/clearing
    // the pin loosens the admission boundary.
    const [editingDomain, setEditingDomain] = useState(false);
    const [domainDraft, setDomainDraft] = useState('');
    const [savingDomain, setSavingDomain] = useState(false);

    const saveDomain = async () => {
        setSavingDomain(true);
        try {
            const applied = await updateClassDomain(info.id, domainDraft);
            onDomainChange(info.id, applied);
            setEditingDomain(false);
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Could not update domain.');
        } finally {
            setSavingDomain(false);
        }
    };
    // Two-step delete (no restore RPC for classes yet, so no undo toast):
    // first click arms, second click within the window commits.
    const [armedDelete, setArmedDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!armedDelete) return;
        const t = setTimeout(() => setArmedDelete(false), 4000);
        return () => clearTimeout(t);
    }, [armedDelete]);

    const handleRegenerate = async () => {
        setRegenerating(true);
        try {
            const code = await regenerateJoinCode(info.id);
            onCodeChange(info.id, code);
        } catch (err) {
            onError(
                err instanceof Error ? err.message : 'Could not regenerate code.',
            );
        } finally {
            setRegenerating(false);
        }
    };

    const handleDelete = async () => {
        if (!armedDelete) {
            setArmedDelete(true);
            return;
        }
        setDeleting(true);
        try {
            await softDeleteClass(info.id);
            onDeleted(info.id);
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Could not delete class.');
            setDeleting(false);
            setArmedDelete(false);
        }
    };

    return (
        <li className="rounded-lg border border-line bg-canvas p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
        <span className="block truncate font-medium text-ink">{info.name}</span>
        <span className="block text-xs text-muted">
        Created {formatDate(info.createdAt)}
        {info.expectedDomain && <> · limited to @{info.expectedDomain}</>}
        {' · '}13+ asserted {formatDate(info.ageAssertionAt)}
        {' · '}
        <button
        type="button"
        onClick={() => {
            setDomainDraft(info.expectedDomain ?? '');
            setEditingDomain((s) => !s);
        }}
        className="underline underline-offset-2 transition hover:text-strong"
        >
        {info.expectedDomain ? 'Edit domain' : 'Set domain'}
        </button>
        </span>
        {editingDomain && (
            <form
            className="mt-2 flex items-center gap-2"
            onSubmit={(e) => {
                e.preventDefault();
                void saveDomain();
            }}
            >
            <input
            value={domainDraft}
            onChange={(e) => setDomainDraft(e.target.value)}
            placeholder="students.district.org (empty = no limit)"
            aria-label="School domain"
            className="w-64 rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink placeholder:text-faint focus:border-line-strong focus:outline-none"
            />
            <button
            type="submit"
            disabled={savingDomain}
            className="text-xs font-medium text-muted underline underline-offset-2 transition hover:text-strong disabled:opacity-50"
            >
            {savingDomain ? 'Saving…' : 'Save'}
            </button>
            </form>
        )}
        </div>
        <span className="flex shrink-0 items-center gap-3">
        <JoinCode code={info.joinCode} />
        <button
        type="button"
        onClick={handleRegenerate}
        disabled={regenerating}
        title="Invalidate this code and draw a new one"
        className="text-sm font-medium text-muted underline underline-offset-2 transition hover:text-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
        {regenerating ? 'Drawing…' : 'New code'}
        </button>
        <button
        type="button"
        onClick={() => setShowRoster((s) => !s)}
        className="text-sm font-medium text-muted underline underline-offset-2 transition hover:text-strong"
        >
        {showRoster ? 'Hide roster' : 'Roster'}
        </button>
        <button
        type="button"
        onClick={() => setShowActivities((s) => !s)}
        aria-expanded={showActivities}
        className={`text-sm font-medium underline underline-offset-2 transition ${
            showActivities ? 'text-ink' : 'text-muted hover:text-strong'
        }`}
        >
        Activities ({activityCount})
        </button>
        <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className={`text-sm font-medium underline underline-offset-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
            armedDelete ? 'text-danger' : 'text-muted hover:text-danger'
        }`}
        >
        {deleting ? 'Deleting…' : armedDelete ? 'Really delete?' : 'Delete'}
        </button>
        </span>
        </div>
        {showRoster && <Roster info={info} onCodeChange={onCodeChange} />}
        {showActivities && (
            <ClassActivitiesPanel classId={info.id} data={activities} />
        )}
        </li>
    );
}

export default function Classes() {
    const { session } = useSession();

    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    // ONE fetch pair for every card's "On students' Home" section (rows +
    // picker options); mutations inside any panel refetch it (DR-3).
    const classActivities = useTeacherClassActivities();

    // Create form state. The assertion checkbox intentionally has NO
    // remembered default — it resets per class (each class is its own
    // assertion record).
    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [asserted, setAsserted] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const list = await listClasses();
                if (!cancelled) setClasses(list);
            } catch (err) {
                if (!cancelled) {
                    setListError(
                        err instanceof Error ? err.message : 'Could not load classes.',
                    );
                }
            } finally {
                if (!cancelled) setListLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    if (!session) return null;

    const handleCreate = async () => {
        setCreating(true);
        setCreateError(null);
        try {
            // create_class RPC (0027, E-2): teacher identity comes from
            // auth.uid() server-side — the audited door needs no client id.
            const info = await createClass({
                name,
                expectedDomain: domain,
                ageAsserted: asserted,
            });
            setClasses((prev) => [info, ...prev]);
            setShowCreate(false);
            setName('');
            setDomain('');
            setAsserted(false);
        } catch (err) {
            setCreateError(
                err instanceof Error ? err.message : 'Could not create class.',
            );
        } finally {
            setCreating(false);
        }
    };

    return (
        <main className="min-h-screen bg-surface p-8">
        <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-ink">My classes</h1>
        <button
        type="button"
        onClick={() => setShowCreate((s) => !s)}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
        {showCreate ? 'Cancel' : 'New class'}
        </button>
        </div>

        {showCreate && (
            <form
            className="mt-6 space-y-4 rounded-lg border border-line bg-canvas p-6 shadow-sm"
            onSubmit={(e) => {
                e.preventDefault();
                void handleCreate();
            }}
            >
            <div>
            <label
            htmlFor="class-name"
            className="block text-sm font-medium text-strong"
            >
            Class name
            </label>
            <input
            id="class-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Algebra I — Period 2"
            className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-line-strong focus:outline-none"
            />
            </div>
            <div>
            <label
            htmlFor="class-domain"
            className="block text-sm font-medium text-strong"
            >
            Limit to school domain{' '}
            <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
            id="class-domain"
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="students.district.org"
            className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-line-strong focus:outline-none"
            />
            <p className="mt-1 text-xs text-muted">
            When set, only accounts on this domain can join — protection if the
            code leaks beyond your classroom.
            </p>
            </div>
            <label className="flex items-start gap-3">
            <input
            type="checkbox"
            checked={asserted}
            onChange={(e) => setAsserted(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-line"
            />
            <span className="text-sm text-strong">{ASSERTION_TEXT}</span>
            </label>
            <div className="flex items-center gap-3">
            <button
            type="submit"
            disabled={creating || !asserted || name.trim().length === 0}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
            {creating ? 'Creating…' : 'Create class'}
            </button>
            {!asserted && (
                <span className="text-xs text-muted">
                The age confirmation is required.
                </span>
            )}
            </div>
            {createError && (
                <p className="text-sm text-danger">{createError}</p>
            )}
            </form>
        )}

        <div className="mt-6">
        {listLoading ? (
            <p className="text-muted">Loading your classes…</p>
        ) : listError ? (
            <p className="text-danger">Couldn't load classes: {listError}</p>
        ) : classes.length === 0 && !showCreate ? (
            <p className="text-muted">
            No classes yet. Create one to get a join code your students can
            use once student sign-in launches.
            </p>
        ) : (
            <ul className="space-y-2">
            {classes.map((c) => (
                <ClassCard
                key={c.id}
                info={c}
                activities={classActivities}
                onCodeChange={(id, code) =>
                    setClasses((prev) =>
                        prev.map((x) => (x.id === id ? { ...x, joinCode: code } : x)),
                    )
                }
                onDomainChange={(id, expectedDomain) =>
                    setClasses((prev) =>
                        prev.map((x) => (x.id === id ? { ...x, expectedDomain } : x)),
                    )
                }
                onDeleted={(id) =>
                    setClasses((prev) => prev.filter((x) => x.id !== id))
                }
                onError={setActionError}
                />
            ))}
            </ul>
        )}
        {actionError && (
            <p className="mt-3 text-sm text-danger">{actionError}</p>
        )}
        </div>
        </div>
        </main>
    );
}
