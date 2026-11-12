// =============================================================================
// PlaytestBar — "Playtest as …" switcher for the no-sign-in playtest
// -----------------------------------------------------------------------------
// DEV-ONLY. Mounted by dev/mountPlaytest.tsx into its OWN React root (not
// inside <App/>), so the app under test is byte-for-byte the app students get:
// no prop, context or branch in shipped code knows the bar exists.
//
// Switching people is a REAL sign-out + sign-in against whatever backend the
// mode points at (the local stack for `pnpm playtest`), followed by a reload to
// "/" — the same clean start a real person on a shared device gets. A reload
// here is the user's own click on a dev tool, not a reload under a working
// user (the 2026-10-04 ruling is about shipped screens).
// =============================================================================

import { useEffect, useState } from 'react';
import accounts from './playtestAccounts.json';

export interface PlaytestPerson {
    key: string;
    email: string;
    name: string;
    role: 'teacher' | 'student';
}

const PLAYTEST_PEOPLE: PlaytestPerson[] = [
    { ...accounts.teacher, role: 'teacher' },
    ...accounts.students.map((s) => ({ ...s, role: 'student' as const })),
];

export interface PlaytestBackend {
    /** Short label for the backend, shown on the bar ("local stack"). */
    label: string;
    currentEmail(): Promise<string | null>;
    signInAs(person: PlaytestPerson): Promise<void>;
    signOut(): Promise<void>;
}

export function PlaytestBar({ backend }: { backend: PlaytestBackend }) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState<string | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void backend.currentEmail().then(setEmail);
    }, [backend]);

    const current = PLAYTEST_PEOPLE.find((p) => p.email === email);

    async function run(key: string, action: () => Promise<void>) {
        setBusy(key);
        setError(null);
        try {
            await action();
            window.location.assign('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setBusy(null);
        }
    }

    return (
        <div
            data-playtest-bar
            className="fixed bottom-3 left-3 z-[2147483000] max-w-[calc(100vw-1.5rem)] rounded-lg border-2 border-dashed border-amber-500 bg-amber-50 text-sm text-amber-950 shadow-lg print:hidden dark:bg-amber-950 dark:text-amber-50"
        >
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left font-medium"
            >
                <span aria-hidden>🧪</span>
                <span>
                    Playtest ({backend.label}) ·{' '}
                    {current ? `${current.name} (${current.role})` : email ? email : 'signed out'}
                </span>
                <span aria-hidden className="ml-auto">{open ? '▾' : '▸'}</span>
            </button>
            {open && (
                <div className="border-t border-amber-300 px-3 pb-3 pt-2">
                    <p className="mb-2 text-xs opacity-80">Playtest as:</p>
                    <div className="flex flex-wrap gap-1.5">
                        {PLAYTEST_PEOPLE.map((p) => (
                            <button
                                key={p.key}
                                type="button"
                                disabled={busy !== null}
                                aria-pressed={p.email === email}
                                onClick={() => void run(p.key, () => backend.signInAs(p))}
                                className="rounded border border-amber-400 bg-white px-2 py-1 text-xs hover:bg-amber-100 disabled:opacity-50 aria-pressed:bg-amber-200 aria-pressed:font-semibold dark:bg-amber-900 dark:hover:bg-amber-800"
                            >
                                {busy === p.key ? '…' : p.role === 'teacher' ? `👩‍🏫 ${p.name}` : p.name}
                            </button>
                        ))}
                        <button
                            type="button"
                            disabled={busy !== null || !email}
                            onClick={() => void run('signout', () => backend.signOut())}
                            className="rounded border border-amber-400 px-2 py-1 text-xs hover:bg-amber-100 disabled:opacity-50 dark:hover:bg-amber-800"
                        >
                            Sign out
                        </button>
                    </div>
                    {error && (
                        <p role="alert" className="mt-2 text-xs text-red-700 dark:text-red-300">
                            {error}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
