// =============================================================================
// mountPlaytest — boots the no-sign-in playtest before the app renders
// -----------------------------------------------------------------------------
// Reached ONLY through main.tsx's `import.meta.env.DEV && (MODE === 'playtest'
// || MODE === 'replay')` dynamic import, which a production build folds to
// `false` and drops with this whole module graph
// (scripts/tests/playtest-guards.test.mjs pins the gate and the built chunks).
//
//   --mode playtest (`pnpm playtest`, Tier 2): the real local stack. The bar
//     signs in as the seeded accounts and can RECORD the run.
//   --mode replay (`pnpm playtest:replay`, Tier 1): no backend at all. The app
//     points at an address nothing listens on and a saved scenario answers.
//
// main.tsx awaits bootPlaytest() before rendering, so the fetch wrapper is in
// place before the app's first request.
//
// Both modes refuse to act unless the app's Supabase URL is local: a mis-set
// env must never turn this into a sign-in form, or a recorder, for live.
// =============================================================================

import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from '../lib/supabase';
import { signOutEverything } from '../lib/studentAuth';
import accounts from './playtestAccounts.json';
import { PlaytestBar, type PlaytestBackend } from './PlaytestBar';
import { PLAYTEST_PEOPLE, type PlaytestPerson } from './playtestPeople';
import {
    installRecorder,
    installReplayer,
    replayCursorKey,
    sessionStorageKey,
    type ReplayStats,
    type Scenario,
} from './playtestTraffic';

export function isLocalSupabaseUrl(url: string | undefined): boolean {
    if (!url) return false;
    try {
        const { hostname } = new URL(url);
        return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '[::1]';
    } catch {
        return false;
    }
}

const SCENARIO_PICK = 'playtest-replay-scenario';

async function devApi<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`/__playtest/${path}`, {
        method: body === undefined ? 'GET' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = (await res.json()) as T & { message?: string };
    if (!res.ok) throw new Error(data.message ?? `HTTP ${res.status}`);
    return data;
}

function storedSession(url: string): Record<string, unknown> | null {
    try {
        const raw = window.localStorage.getItem(sessionStorageKey(url));
        return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
    } catch {
        return null;
    }
}

function mount(node: React.ReactNode) {
    const host = document.createElement('div');
    host.id = 'playtest-bar-root';
    document.body.appendChild(host);
    createRoot(host).render(node);
}

const currentEmail = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.email ?? null;
};

// ---- Tier 2: the local stack, with recording ------------------------------

const localStack: PlaytestBackend = {
    label: 'local stack',
    currentEmail,
    async signInAs(person) {
        await signOutEverything().catch(() => undefined);
        const { error } = await supabase.auth.signInWithPassword({
            email: person.email,
            password: accounts.password,
        });
        if (error) {
            throw new Error(
                `${error.message} — is the local stack seeded? Run \`pnpm playtest\` (or \`pnpm playtest:seed\`).`,
            );
        }
    },
    async signOut() {
        await signOutEverything();
    },
};

interface RecordStatus {
    recording: boolean;
    entries: number;
    people: string[];
}

function RecordPanel() {
    const [status, setStatus] = useState<RecordStatus | null>(null);
    const [name, setName] = useState('');
    const [note, setNote] = useState<string | null>(null);

    const refresh = () => void devApi<RecordStatus>('record/status').then(setStatus).catch(() => setStatus(null));
    useEffect(() => {
        refresh();
        const t = window.setInterval(refresh, 2000);
        return () => window.clearInterval(t);
    }, []);

    const act = async (fn: () => Promise<unknown>, reload: boolean) => {
        setNote(null);
        try {
            const out = await fn();
            if (reload) window.location.reload();
            else if (out && typeof out === 'object' && 'name' in out) {
                const s = out as { name: string; entries: number; people: number };
                setNote(`Saved "${s.name}" (${s.entries} responses, ${s.people} people). Replay it with pnpm playtest:replay.`);
            }
            refresh();
        } catch (err) {
            setNote(err instanceof Error ? err.message : String(err));
        }
    };

    if (!status) return null;
    return (
        <div className="mt-3 border-t border-amber-300 pt-2 text-xs">
            {status.recording ? (
                <>
                    <p className="font-medium">
                        ● Recording — {status.entries} responses, {status.people.length} people
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value.toLowerCase())}
                            placeholder="scenario-name"
                            aria-label="Scenario name"
                            className="w-36 rounded border border-amber-400 bg-white px-1.5 py-1 dark:bg-amber-900"
                        />
                        <button
                            type="button"
                            onClick={() => void act(() => devApi('record/save', { name }), false)}
                            className="rounded border border-amber-400 bg-white px-2 py-1 hover:bg-amber-100 dark:bg-amber-900"
                        >
                            Save scenario
                        </button>
                        <button
                            type="button"
                            onClick={() => void act(() => devApi('record/stop', {}), true)}
                            className="rounded border border-amber-400 px-2 py-1 hover:bg-amber-100 dark:hover:bg-amber-800"
                        >
                            Discard
                        </button>
                    </div>
                </>
            ) : (
                <button
                    type="button"
                    onClick={() => void act(() => devApi('record/start', {}), true)}
                    className="rounded border border-amber-400 bg-white px-2 py-1 hover:bg-amber-100 dark:bg-amber-900"
                >
                    ● Record a scenario
                </button>
            )}
            {note && <p className="mt-1.5">{note}</p>}
        </div>
    );
}

async function bootLocalStack(url: string) {
    let recording = false;
    try {
        recording = (await devApi<RecordStatus>('record/status')).recording;
    } catch {
        /* the dev endpoints are optional for the bar itself */
    }
    if (recording) {
        installRecorder(url, (entry) => {
            void devApi('record/entry', entry).catch(() => undefined);
        });
        const session = storedSession(url);
        const email = (session?.user as { email?: string } | undefined)?.email;
        if (session && email) void devApi('record/person', { email, session }).catch(() => undefined);
    }
    mount(<PlaytestBar backend={localStack} people={PLAYTEST_PEOPLE} extra={<RecordPanel />} />);
}

// ---- Tier 1: replay a saved scenario -----------------------------------------

let replayStats: ReplayStats = { exact: 0, approximate: [], missing: [] };
const statsListeners = new Set<(s: ReplayStats) => void>();

function ReplayPanel({ names, current }: { names: string[]; current: string | null }) {
    const [stats, setStats] = useState(replayStats);
    useEffect(() => {
        statsListeners.add(setStats);
        return () => void statsListeners.delete(setStats);
    }, []);
    return (
        <div className="mt-3 border-t border-amber-300 pt-2 text-xs">
            <label className="flex items-center gap-1.5">
                Scenario
                <select
                    value={current ?? ''}
                    onChange={(e) => {
                        window.sessionStorage.setItem(SCENARIO_PICK, e.target.value);
                        window.sessionStorage.removeItem(replayCursorKey(e.target.value));
                        void signOutEverything()
                            .catch(() => undefined)
                            .then(() => window.location.assign('/'));
                    }}
                    className="rounded border border-amber-400 bg-white px-1 py-0.5 dark:bg-amber-900"
                >
                    {names.map((n) => (
                        <option key={n} value={n}>
                            {n}
                        </option>
                    ))}
                </select>
            </label>
            {current && (
                <button
                    type="button"
                    onClick={() => {
                        window.sessionStorage.removeItem(replayCursorKey(current));
                        window.location.assign('/');
                    }}
                    className="mt-1.5 rounded border border-amber-400 px-2 py-1 hover:bg-amber-100 dark:hover:bg-amber-800"
                >
                    Restart scenario from the beginning
                </button>
            )}
            <p className="mt-1.5">
                {stats.exact} replayed
                {stats.approximate.length > 0 && ` · ${stats.approximate.length} approximate`}
                {stats.missing.length > 0 && ` · ${stats.missing.length} not recorded`}
                {(stats.approximate.length > 0 || stats.missing.length > 0) && ' (details in the console)'}
            </p>
        </div>
    );
}

function replayBackend(url: string, scenario: Scenario): PlaytestBackend {
    return {
        label: `replay: ${scenario.name}`,
        currentEmail,
        async signInAs(person) {
            const recorded = scenario.people.find((p) => p.email === person.email);
            if (!recorded) throw new Error(`${person.name} was not signed in while "${scenario.name}" was recorded.`);
            await signOutEverything().catch(() => undefined);
            // Far-future expiry: supabase-js never tries to refresh, so replay
            // never needs the token endpoint (which it deliberately lacks).
            const yearsAhead = 10 * 365 * 86_400;
            window.localStorage.setItem(
                sessionStorageKey(url),
                JSON.stringify({
                    ...recorded.session,
                    expires_in: yearsAhead,
                    expires_at: Math.floor(Date.now() / 1000) + yearsAhead,
                }),
            );
        },
        async signOut() {
            await signOutEverything();
        },
    };
}

function NoScenarios() {
    return (
        <div className="px-3 pb-3 pt-2 text-xs">
            No scenarios yet. Record one: run <code>pnpm playtest</code>, open this bar, ● Record a scenario,
            play, then Save. Scenarios land in <code>packages/app/playtest-scenarios/</code>.
        </div>
    );
}

async function bootReplay(url: string) {
    let names: string[] = [];
    try {
        names = await devApi<string[]>('scenarios');
    } catch (err) {
        console.error('[replay] could not list scenarios', err);
    }
    const picked = window.sessionStorage.getItem(SCENARIO_PICK);
    const current = picked && names.includes(picked) ? picked : (names[0] ?? null);
    if (!current) {
        mount(
            <PlaytestBar backend={{ label: 'replay', currentEmail, signInAs: async () => {}, signOut: async () => {} }} people={[]} extra={<NoScenarios />} />,
        );
        return;
    }
    let scenario: Scenario;
    try {
        scenario = await devApi<Scenario>(`scenarios/${encodeURIComponent(current)}`);
    } catch (err) {
        const message = `Could not load scenario "${current}": ${err instanceof Error ? err.message : String(err)}`;
        console.error(`[replay] ${message}`);
        mount(
            <PlaytestBar
                backend={{ label: 'replay', currentEmail, signInAs: async () => {}, signOut: async () => {} }}
                people={[]}
                extra={<div className="px-3 pb-3 pt-2 text-xs">{message}</div>}
            />,
        );
        return;
    }
    installReplayer(url, scenario, (s) => {
        replayStats = s;
        for (const l of statsListeners) l(s);
    });
    const recordedEmails = new Set(scenario.people.map((p) => p.email));
    const people: PlaytestPerson[] = PLAYTEST_PEOPLE.filter((p) => recordedEmails.has(p.email));
    mount(
        <PlaytestBar
            backend={replayBackend(url, scenario)}
            people={people}
            extra={<ReplayPanel names={names} current={current} />}
        />,
    );
}

// ---- entry ---------------------------------------------------------------------

export async function bootPlaytest(): Promise<void> {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    if (!isLocalSupabaseUrl(url) || !url) {
        console.error(
            `[playtest] refusing to start: VITE_SUPABASE_URL (${url ?? '<unset>'}) is not local. ` +
                'Use `pnpm playtest` or `pnpm playtest:replay`, which set it.',
        );
        return;
    }
    try {
        if (import.meta.env.MODE === 'replay') await bootReplay(url);
        else await bootLocalStack(url);
    } catch (err) {
        console.error('[playtest] could not start', err);
    }
}
