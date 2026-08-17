// =============================================================================
// supabase-stubs/realtime-js.ts — the module `@supabase/realtime-js` RESOLVES TO
// -----------------------------------------------------------------------------
// THIS FILE IS NOT IMPORTED BY NAME ANYWHERE. It is wired in by a
// `resolve.alias` entry in packages/app/vite.config.ts, which redirects every
// import of `@supabase/realtime-js` — including supabase-js's own, from inside
// node_modules — here. Design + rulings: docs/design/shell-slim-supabase.md (R1).
//
// WHY: supabase-js's SupabaseClient imports every sub-client STATICALLY and
// constructs realtime in its constructor, so bundling follows imports, not
// usage. realtime-js + its @supabase/phoenix dependency were 15.3 KiB gz of the
// student's entry chunk for a feature the workspace has zero call sites for
// (no `.channel()` anywhere — grepped, and pinned by an absence row in
// scripts/perf-budgets.mjs). Construction laziness cannot fix that; only
// module-level substitution can.
//
// AUDITED AGAINST: @supabase/supabase-js 2.105.3
//   ^ that line is READ MECHANICALLY by scripts/tests/supabase-stub-pin.test.mjs,
//     which fails the build when it drifts from the exact pin in
//     packages/app/package.json or from the version actually installed. Do not
//     reword it, and do not bump it without re-reading the contract below.
//
// THE CONTRACT THIS MUST HONOR (read from that version's dist/index.mjs):
//
//   line 393  new RealtimeClient(url, options)        — constructor, every client
//   line 568  this.realtime.setAuth(token)            — SIGNED_IN / TOKEN_REFRESHED
//   line 570  this.realtime.setAuth()                 — SIGNED_OUT, ZERO ARGS
//   line 475  this.realtime.channel(name, opts)
//   line 488  this.realtime.getChannels()
//   line 507  this.realtime.removeChannel(channel)
//   line 523  this.realtime.removeAllChannels()
//
// The constructor and `setAuth` run on the LOGIN PATH — they must be silent
// no-ops, and `setAuth`'s parameter must be OPTIONAL (the SIGNED_OUT call
// passes nothing). The four channel methods have no caller today, so they FAIL
// LOUD (ruling D3): a queueing fake's first user would also be its first
// tester, and a silent no-op would make a future realtime feature look broken
// rather than unbuilt.
//
// THE EXPORT SURFACE IS THE PACKAGE INDEX'S, not just what SupabaseClient calls
// (review finding OV-3): supabase-js does `export * from '@supabase/realtime-js'`
// at dist/index.mjs:7, so every name realtime-js's own index exports is part of
// this module's contract. All nine are below. The enum values are the REAL
// ones, copied from the package — an empty object would be a silent lie for a
// few bytes, and these are five short strings.
//
// UN-STUBBING: the "Realtime push arc" in STATE.md's backlog (Re-architecture
// follow-ons #2, trigger = the first named live feature). Delete the two alias
// lines in vite.config.ts, delete this directory, restore the caret range on
// @supabase/supabase-js, and delete the pin test.
//
// ⚠ THE ALIAS LIES TO TYPESCRIPT (design doc §5bis, ACCEPTED). Aliasing is
// runtime-only: the compiler still types `supabase.channel()` as fully working,
// so a developer's first signal is the runtime throw, not a red squiggle.
// =============================================================================

// Every parameter in this file is unused ON PURPOSE — that is what an inert
// shell is. The rule stays on everywhere else; disabling it per-method turned
// the file into more pragma than code.
/* eslint-disable @typescript-eslint/no-unused-vars */

const UN_STUB =
    'Realtime is STUBBED OUT of this app. `@supabase/realtime-js` is aliased to ' +
    'packages/app/src/lib/supabase-stubs/realtime-js.ts by resolve.alias in ' +
    'packages/app/vite.config.ts, to keep 15.3 KiB gz of unused websocket code ' +
    'out of the student shell. Why and how to undo it: ' +
    'docs/design/shell-slim-supabase.md (R1). Building a live feature? That is ' +
    'the "Realtime push arc" in STATE.md\'s backlog — un-stub there, deliberately, ' +
    'rather than deleting the alias to make this throw go away.';

function refuse(method: string): never {
    throw new Error(`supabase.${method}() — ${UN_STUB}`);
}

/** The only class supabase-js constructs. Constructor + setAuth are on the
 *  login path and must never throw; everything else is a documented wall. */
export class RealtimeClient {
    constructor(_endPoint?: string, _options?: unknown) {}

    /** Called on EVERY auth event, and zero-arg on SIGNED_OUT. Silent by design. */
    setAuth(_token?: string | null): void {}

    channel(_name: string, _opts?: unknown): never {
        return refuse('channel');
    }
    getChannels(): never {
        return refuse('getChannels');
    }
    removeChannel(_channel: unknown): never {
        return refuse('removeChannel');
    }
    removeAllChannels(): never {
        return refuse('removeAllChannels');
    }
}

/** Re-exported through supabase-js's `export *`; no workspace call site. */
export class RealtimeChannel {
    constructor() {
        refuse('channel');
    }
}

/** Re-exported through supabase-js's `export *`; no workspace call site. */
export class RealtimePresence {
    constructor() {
        refuse('channel');
    }
}

/** Re-exported through supabase-js's `export *`; no workspace call site. */
export const WebSocketFactory = {
    createWebSocket(): never {
        return refuse('channel');
    },
};

// The enums, with their real values (see the header note on honesty).
export const REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = {
    ALL: '*',
    INSERT: 'INSERT',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
} as const;

export const REALTIME_LISTEN_TYPES = {
    BROADCAST: 'broadcast',
    PRESENCE: 'presence',
    POSTGRES_CHANGES: 'postgres_changes',
    SYSTEM: 'system',
} as const;

export const REALTIME_SUBSCRIBE_STATES = {
    SUBSCRIBED: 'SUBSCRIBED',
    TIMED_OUT: 'TIMED_OUT',
    CLOSED: 'CLOSED',
    CHANNEL_ERROR: 'CHANNEL_ERROR',
} as const;

export const REALTIME_PRESENCE_LISTEN_EVENTS = {
    SYNC: 'sync',
    JOIN: 'join',
    LEAVE: 'leave',
} as const;

export const REALTIME_CHANNEL_STATES = {
    closed: 'closed',
    errored: 'errored',
    joined: 'joined',
    joining: 'joining',
    leaving: 'leaving',
} as const;
