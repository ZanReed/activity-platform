// =============================================================================
// playtestTraffic — record a Tier 2 playtest, replay it with no backend
// -----------------------------------------------------------------------------
// DEV-ONLY (reached through dev/mountPlaytest, behind main.tsx's compile-time
// gate). Tier 1 of the no-sign-in playtest, ruled 2026-11-12 as RECORD AND
// REPLAY rather than hand-written fixtures: a scenario is what the real local
// stack answered while someone played, so it cannot drift from the real
// response shapes the way hand-typed data does.
//
//   RECORD (`pnpm playtest`, the bar's ● Record): every request to the
//   Supabase origin is passed through untouched and its response is streamed
//   to the dev server (vite.playtest.ts), which saves the run as
//   packages/app/playtest-scenarios/<name>.json.
//
//   REPLAY (`pnpm playtest:replay`): the app is built against an address
//   nothing listens on (.env.replay), and every request to it is answered from
//   the scenario. Nothing can reach a real backend even if this file has a bug:
//   an unanswered request is a connection refusal, not a live call.
//
// What replay can and cannot do — said here because it is the first question:
//   * Requests are matched on person + method + path + query + body. A request
//     seen several times replays its answers IN ORDER (then sticks on the
//     last), so "progress before the check, progress after it" replays right.
//     The position in that order is kept in sessionStorage across reloads and
//     person switches (the bar's Restart, or picking a scenario, rewinds it).
//     It counts visits, so opening a screen MORE often than the recording did
//     moves on to its later answers early — replay the journey you recorded.
//   * A request with a body never recorded (an answer you did not give while
//     recording) falls back to the closest recorded body on the same path (most
//     shared fields — the same section, say) and is
//     counted as APPROXIMATE on the bar — a check shows the recorded verdict,
//     not a grade of what you typed.
//   * Writes change nothing: there is no database behind replay.
//   * Sign-in/out is the bar's person switch; passwords are never recorded
//     (the token and signup endpoints are excluded from recordings outright).
// =============================================================================

import type { RecordedEntry, Scenario } from './playtestScenario';
export type { RecordedEntry, Scenario, ScenarioPerson } from './playtestScenario';
export { SCENARIO_NAME_RE } from './playtestScenario';

/** Request paths never recorded: their bodies carry passwords or mint tokens. */
export const NEVER_RECORDED = ['/auth/v1/token', '/auth/v1/signup', '/auth/v1/recover', '/auth/v1/otp'];

/** Response headers worth replaying (PostgREST reads counts from content-range). */
export const KEPT_HEADERS = ['content-type', 'content-range', 'preference-applied'];

/** supabase-js's storage key for a project URL: `sb-<first host label>-auth-token`.
 *  The same rule as the e2e harness's supabaseStorageKey (itself pinned
 *  against a real client); playtestTraffic.test.ts holds the two together. */
export function sessionStorageKey(supabaseUrl: string): string {
    const host = new URL(supabaseUrl).hostname;
    return `sb-${host.split('.')[0] ?? host}-auth-token`;
}

/** The email claim of a bearer JWT, or 'anon'. Never verifies — it only
 *  labels whose recording a request belongs to. */
export function whoFromAuthorization(header: string | null | undefined): string {
    const token = header?.match(/^Bearer\s+(.+)$/i)?.[1];
    const payload = token?.split('.')[1];
    if (!payload) return 'anon';
    try {
        const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { email?: unknown };
        return typeof json.email === 'string' && json.email ? json.email : 'anon';
    } catch {
        return 'anon';
    }
}

/** Path + query with the query sorted, so parameter order never splits a match. */
export function normalizePath(pathAndQuery: string): string {
    const url = new URL(pathAndQuery, 'http://x');
    const params = [...url.searchParams.entries()].sort(([a, av], [b, bv]) =>
        a === b ? av.localeCompare(bv) : a.localeCompare(b),
    );
    const q = new URLSearchParams(params).toString();
    return q ? `${url.pathname}?${q}` : url.pathname;
}

/** Body fields that differ on every request by design and so must not split
 *  a match. `idempotencyKey` is the check wire's per-attempt key (minted by the
 *  viewer); without dropping it, re-giving a recorded answer never matched. */
export const VOLATILE_BODY_KEYS = new Set(['idempotencyKey']);

function stable(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(stable);
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.keys(value as Record<string, unknown>)
                .filter((k) => !VOLATILE_BODY_KEYS.has(k))
                .sort()
                .map((k) => [k, stable((value as Record<string, unknown>)[k])]),
        );
    }
    return value;
}

/** A JSON body with its keys sorted and volatile keys dropped; any other body as-is. */
export function normalizeBody(body: string | null): string | null {
    if (body === null || body === '') return null;
    try {
        return JSON.stringify(stable(JSON.parse(body)));
    } catch {
        return body;
    }
}

/** Every leaf of a JSON body as "path=value", for the approximate match. */
function leaves(body: string | null): Set<string> {
    const out = new Set<string>();
    if (body === null) return out;
    let root: unknown;
    try {
        root = JSON.parse(body);
    } catch {
        out.add(`=${body}`);
        return out;
    }
    const walk = (v: unknown, path: string) => {
        if (v && typeof v === 'object') {
            for (const [k, child] of Object.entries(v as Record<string, unknown>)) {
                if (!VOLATILE_BODY_KEYS.has(k)) walk(child, `${path}.${k}`);
            }
        } else out.add(`${path}=${JSON.stringify(v)}`);
    };
    walk(root, '');
    return out;
}

export function exactKey(e: Pick<RecordedEntry, 'who' | 'method' | 'path' | 'body'>): string {
    return `${e.who} ${e.method.toUpperCase()} ${normalizePath(e.path)} ${normalizeBody(e.body) ?? ''}`;
}

export function pathKey(e: Pick<RecordedEntry, 'who' | 'method' | 'path'>): string {
    return `${e.who} ${e.method.toUpperCase()} ${normalizePath(e.path)}`;
}

export type ReplayOutcome =
    | { kind: 'exact'; entry: RecordedEntry }
    | { kind: 'approximate'; entry: RecordedEntry }
    | { kind: 'missing' };

/** The replay lookup, pure. Answers repeat in recorded order, then stick on the last. */
export function createReplayIndex(
    entries: readonly RecordedEntry[],
    /** Positions to resume from (key → answers already served); mutated in place. */
    cursor: Map<string, number> = new Map(),
) {
    const exact = new Map<string, RecordedEntry[]>();
    const byPath = new Map<string, RecordedEntry[]>();
    for (const e of entries) {
        const k = exactKey(e);
        exact.set(k, [...(exact.get(k) ?? []), e]);
        const p = pathKey(e);
        byPath.set(p, [...(byPath.get(p) ?? []), e]);
    }
    return {
        lookup(req: Pick<RecordedEntry, 'who' | 'method' | 'path' | 'body'>): ReplayOutcome {
            const k = exactKey(req);
            const hits = exact.get(k);
            if (hits && hits.length > 0) {
                const i = cursor.get(k) ?? 0;
                cursor.set(k, i + 1);
                return { kind: 'exact', entry: hits[Math.min(i, hits.length - 1)]! };
            }
            // No exact match: the recorded request on this path that shares the
            // most body leaves (the same section id, the same activity…), the
            // latest on a tie — never simply the latest, which once answered
            // a section's check with the DoL's verdict.
            const near = byPath.get(pathKey(req));
            if (near && near.length > 0) {
                const want = leaves(req.body);
                let best = near[near.length - 1]!;
                let bestScore = -1;
                for (const e of near) {
                    let score = 0;
                    for (const l of leaves(e.body)) if (want.has(l)) score += 1;
                    if (score >= bestScore) {
                        best = e;
                        bestScore = score;
                    }
                }
                return { kind: 'approximate', entry: best };
            }
            return { kind: 'missing' };
        },
    };
}

// ---- runtime: recorder -------------------------------------------------------

type Fetch = typeof fetch;

function requestParts(input: RequestInfo | URL, init?: RequestInit) {
    const req = input instanceof Request ? input : null;
    const url = req ? req.url : input instanceof URL ? input.href : String(input);
    const method = (init?.method ?? req?.method ?? 'GET').toUpperCase();
    const headers = new Headers(init?.headers ?? req?.headers);
    return { url, method, headers };
}

async function bodyText(input: RequestInfo | URL, init?: RequestInit): Promise<string | null> {
    if (init?.body !== undefined && init.body !== null) {
        return typeof init.body === 'string' ? init.body : null;
    }
    if (input instanceof Request && input.body) return input.clone().text();
    return null;
}

/** Wrap window.fetch so Supabase traffic is copied to `sink` as it happens. */
export function installRecorder(supabaseUrl: string, sink: (entry: RecordedEntry) => void): void {
    const origin = new URL(supabaseUrl).origin;
    const real: Fetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
        const { url, method, headers } = requestParts(input, init);
        const path = url.startsWith(origin) ? url.slice(origin.length) : null;
        const wanted = path !== null && method !== 'OPTIONS' && !NEVER_RECORDED.some((p) => path.startsWith(p));
        // Read the request body BEFORE sending: a Request object's body is
        // consumed by the send, and cloning it afterwards throws.
        const body = wanted ? await bodyText(input, init).catch(() => null) : null;
        const res = await real(input, init);
        if (!wanted || path === null) return res;
        try {
            const kept: Record<string, string> = {};
            for (const h of KEPT_HEADERS) {
                const v = res.headers.get(h);
                if (v !== null) kept[h] = v;
            }
            sink({
                who: whoFromAuthorization(headers.get('authorization')),
                method,
                path,
                body,
                status: res.status,
                headers: kept,
                response: await res.clone().text(),
            });
        } catch (err) {
            console.warn('[playtest] could not record a response', err);
        }
        return res;
    };
}

// ---- runtime: replayer -------------------------------------------------------

/** sessionStorage key holding a scenario's replay position. */
export function replayCursorKey(name: string): string {
    return `playtest-replay-cursor:${name}`;
}

export interface ReplayStats {
    exact: number;
    approximate: string[];
    missing: string[];
}

/** Answer every request to the (dead) Supabase origin from the scenario. */
export function installReplayer(
    supabaseUrl: string,
    scenario: Scenario,
    onStats: (stats: ReplayStats) => void,
): void {
    const origin = new URL(supabaseUrl).origin;
    const cursorKey = replayCursorKey(scenario.name);
    const cursor = new Map<string, number>();
    try {
        const saved = JSON.parse(window.sessionStorage.getItem(cursorKey) ?? '{}') as Record<string, number>;
        for (const [k, v] of Object.entries(saved)) cursor.set(k, v);
    } catch {
        /* a fresh start */
    }
    const index = createReplayIndex(scenario.entries, cursor);
    const saveCursor = () => {
        try {
            window.sessionStorage.setItem(cursorKey, JSON.stringify(Object.fromEntries(cursor)));
        } catch {
            /* storage unavailable: replay still works, from the start each load */
        }
    };
    const stats: ReplayStats = { exact: 0, approximate: [], missing: [] };
    const real: Fetch = window.fetch.bind(window);
    const json = (status: number, body: unknown) =>
        new Response(status === 204 ? null : JSON.stringify(body), {
            status,
            headers: { 'content-type': 'application/json' },
        });

    window.fetch = async (input, init) => {
        const { url, method, headers } = requestParts(input, init);
        if (!url.startsWith(origin)) return real(input, init);
        const path = url.slice(origin.length);
        const who = whoFromAuthorization(headers.get('authorization'));
        if (method === 'OPTIONS') return new Response(null, { status: 204 });

        // Auth is the bar's job in replay: sessions are written straight into
        // storage, so the only auth calls left are "who am I" and sign-out.
        if (path.startsWith('/auth/v1/logout')) return json(204, null);
        if (path.startsWith('/auth/v1/user') && method === 'GET') {
            const person = scenario.people.find((p) => p.email === who);
            if (person) return json(200, (person.session as { user?: unknown }).user ?? null);
        }
        if (NEVER_RECORDED.some((p) => path.startsWith(p))) {
            return json(400, { message: 'Replay has no sign-in — switch people with the playtest bar.' });
        }

        const outcome = index.lookup({ who, method, path, body: await bodyText(input, init) });
        if (outcome.kind === 'exact') saveCursor();
        const label = `${who} ${method} ${normalizePath(path)}`;
        if (outcome.kind === 'missing') {
            stats.missing.push(label);
            onStats({ ...stats });
            console.warn(`[replay] not in this scenario: ${label}`);
            return json(501, { message: `Replay: "${label}" was not recorded in this scenario.` });
        }
        if (outcome.kind === 'approximate') {
            stats.approximate.push(label);
            console.warn(`[replay] approximate (this body was never recorded; the closest recorded one answered): ${label}`);
        } else stats.exact += 1;
        onStats({ ...stats });
        const e = outcome.entry;
        return new Response(e.status === 204 || e.status === 304 ? null : e.response, {
            status: e.status,
            headers: e.headers,
        });
    };
}
