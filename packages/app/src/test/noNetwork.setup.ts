// =============================================================================
// noNetwork.setup.ts — unit tests NEVER reach a network (vitest setupFiles)
// -----------------------------------------------------------------------------
// Found 2026-10-18: vitest loads packages/app/.env.local like any vite mode, and
// .env.local points VITE_SUPABASE_URL at the LIVE project. So every test that
// rendered a component whose data call was not mocked sent a real (anonymous)
// request to production. Grants refused them, so nothing was exposed — but it
// is also what made `pnpm verify` intermittently red: the network round trip
// outlived a 1 s findBy under load. The audit that day (a recording fetch over
// the whole suite) found two leakers, ClassProgress.test.tsx (fixed in
// bbfda743) and PublishStatus.test.tsx (listClasses on mount).
//
// TWO LAYERS, because each one alone has a hole:
//
//   1. THIS FILE replaces every in-process network door (fetch, XHR,
//      WebSocket, sendBeacon) with one that records the call and refuses it,
//      and FAILS THE TEST that made it, naming the method + URL. A refusal on
//      its own is not enough: app code catches network errors on purpose (a
//      failed probe just hides a link), so a swallowed rejection would leave
//      the test green and the leak invisible — the failure has to be raised
//      here, outside the code under test.
//   2. vite.config.ts's `test.env` pins VITE_SUPABASE_URL to the stub lanes'
//      dead origin (e2e/helpers/e2eOrigins.ts — nothing may listen there), so
//      even a request that escapes this file (node:http, a test that installs
//      its own pass-through fetch) cannot reach live.
//
// A test that needs data mocks the data module (vi.mock('../lib/…')) or
// stubs fetch itself (vi.stubGlobal('fetch', …)); vi.unstubAllGlobals()
// restores THIS guard, not the real fetch.
//
// Mutation-checked 2026-10-18: removing PublishStatus.test.tsx's
// vi.mock('../lib/classes') turns its rows red with the GET /rest/v1/classes
// URL in the message.
// =============================================================================

import { afterAll, afterEach } from 'vitest';

const calls: string[] = [];

function refuse(what: string): Error {
    calls.push(what);
    return new TypeError(
        `unit tests may not use the network — refused ${what}. Mock the data ` +
            "module (vi.mock('../lib/…')) or stub fetch in the test. " +
            'See src/test/noNetwork.setup.ts.',
    );
}

function describeFetch(input: unknown, init?: RequestInit): string {
    if (typeof input === 'string') return `${init?.method ?? 'GET'} ${input}`;
    if (input instanceof URL) return `${init?.method ?? 'GET'} ${input.href}`;
    const req = input as { url?: string; method?: string } | undefined;
    return `${init?.method ?? req?.method ?? 'GET'} ${req?.url ?? String(input)}`;
}

/** Marks the guarded fetch, so noNetworkGuard.test.ts can tell "installed by
 * setupFiles" from "installed because the test imported this module". */
export const GUARD_MARK = Symbol.for('activity.noNetworkGuard');

const guardedFetch = ((input: unknown, init?: RequestInit) =>
    Promise.reject(refuse(`fetch ${describeFetch(input, init)}`))) as typeof fetch;
(guardedFetch as unknown as Record<symbol, boolean>)[GUARD_MARK] = true;
globalThis.fetch = guardedFetch;

// The jsdom-only doors. Node's own environment has none of these globals.
const g = globalThis as unknown as {
    XMLHttpRequest?: { prototype: { open: (...a: unknown[]) => void; send: () => void } };
    WebSocket?: unknown;
    navigator?: { sendBeacon?: (url: string) => boolean };
};
if (g.XMLHttpRequest) {
    const proto = g.XMLHttpRequest.prototype;
    proto.open = function (method: unknown, url: unknown) {
        (this as { __noNetwork?: string }).__noNetwork = `xhr ${String(method)} ${String(url)}`;
    };
    proto.send = function () {
        throw refuse((this as { __noNetwork?: string }).__noNetwork ?? 'xhr (unopened)');
    };
}
if (g.WebSocket) {
    g.WebSocket = function (url: unknown) {
        throw refuse(`websocket ${String(url)}`);
    };
}
if (g.navigator?.sendBeacon) {
    g.navigator.sendBeacon = (url: string) => {
        throw refuse(`sendBeacon ${url}`);
    };
}

/** For src/__tests__/noNetworkGuard.test.ts ONLY: hand over (and clear) the
 * refused calls, so the guard's own liveness row can trip it without failing. */
export function takeRefusedCalls(): string[] {
    return calls.splice(0);
}

function drain(when: string): void {
    if (calls.length === 0) return;
    const list = [...new Set(calls.splice(0))].join('\n  ');
    throw new Error(
        `${when} attempted a network call (refused by src/test/noNetwork.setup.ts):\n  ${list}\n` +
            "Mock the data module the component reads (vi.mock('../lib/…')), or stub " +
            'fetch in the test if the request itself is under test.',
    );
}

afterEach(() => drain('this test'));
// A call fired after the last test's afterEach (a late effect, a timer) still
// fails the FILE rather than vanishing.
afterAll(() => drain('this file (after its last test)'));
