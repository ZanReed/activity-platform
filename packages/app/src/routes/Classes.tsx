import { useEffect, useState } from 'react';
import { useSession } from '../lib/SessionContext';
import {
    ASSERTION_TEXT,
    createClass,
    listClasses,
    listClassMembers,
    regenerateJoinCode,
    removeClassMember,
    softDeleteClass,
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

function JoinCode({ code }: { code: string }) {
    // Read-aloud artifact: large, spaced, monospace. Click to copy.
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Clipboard unavailable — the code is visible; nothing to do.
        }
    };
    return (
        <button
        type="button"
        onClick={copy}
        title="Copy join code"
        className="rounded-md border border-line bg-surface px-3 py-1 font-mono text-lg font-semibold tracking-[0.2em] text-ink transition hover:border-line-strong"
        >
        {copied ? 'Copied' : code}
        </button>
    );
}

function Roster({ classId }: { classId: string }) {
    const [members, setMembers] = useState<ClassMember[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);

    const load = async () => {
        try {
            setMembers(await listClassMembers(classId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not load roster.');
        }
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const m = await listClassMembers(classId);
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
    }, [classId]);

    const handleRemove = async (m: ClassMember) => {
        setRemovingId(m.studentId);
        setError(null);
        try {
            await removeClassMember(classId, m.studentId);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not remove.');
        } finally {
            setRemovingId(null);
        }
    };

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
            onClick={() => handleRemove(m)}
            disabled={removingId === m.studentId}
            className="shrink-0 text-sm font-medium text-muted underline underline-offset-2 transition hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
            >
            {removingId === m.studentId ? 'Removing…' : 'Remove'}
            </button>
            </li>
        ))}
        </ul>
    );
}

function ClassCard({
    info,
    onCodeChange,
    onDeleted,
    onError,
}: {
    info: ClassInfo;
    onCodeChange: (id: string, code: string) => void;
    onDeleted: (id: string) => void;
    onError: (msg: string) => void;
}) {
    const [showRoster, setShowRoster] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
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
        <span className="min-w-0">
        <span className="block truncate font-medium text-ink">{info.name}</span>
        <span className="block text-xs text-muted">
        Created {formatDate(info.createdAt)}
        {info.expectedDomain && <> · limited to @{info.expectedDomain}</>}
        {' · '}13+ asserted {formatDate(info.ageAssertionAt)}
        </span>
        </span>
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
        {showRoster && <Roster classId={info.id} />}
        </li>
    );
}

export default function Classes() {
    const { session } = useSession();

    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

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
            const info = await createClass({
                name,
                expectedDomain: domain,
                ageAsserted: asserted,
                teacherId: session.user.id,
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
                onCodeChange={(id, code) =>
                    setClasses((prev) =>
                        prev.map((x) => (x.id === id ? { ...x, joinCode: code } : x)),
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
