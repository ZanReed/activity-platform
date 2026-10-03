// @vitest-environment jsdom
// =============================================================================
// supabaseStubs.test.ts — the aliased sub-clients, exercised for real (V1–V3)
// -----------------------------------------------------------------------------
// `@supabase/realtime-js` and `@supabase/storage-js` are replaced at bundle
// time by inert stubs (resolve.alias in vite.config.ts; rulings in
// docs/design/shell-slim-supabase.md). This file is the ONLY place their
// behavior is proven.
//
// ⚠ WHY "ONLY", stated plainly, because the plan's first draft got this wrong
// and the review caught it (OV-6/OV-7, a P9-class vacuity — "when a check's
// headline lesson is 'this was vacuous', re-run that lesson over the fix"):
//
//   * The claim that the existing auth/session suites gave this slice a free
//     regression net was FICTION. Every one of them `vi.mock`s '../lib/supabase',
//     so the real client — and therefore the stub — never executes in them.
//     What the rest of the suite passing proves is that module RESOLUTION does
//     not break. Nothing about behavior.
//   * The student e2e lane does not cover the auth-event path either: its
//     harness injects far-future-expiry sessions so tokens never refresh
//     mid-spec, and session restore emits INITIAL_SESSION, which supabase-js's
//     listener ignores. The lane proves stub CONSTRUCTION and boot.
//     (The one e2e moment the stub's auth path really fires is the sign-out
//     click in e2e/student/failure-matrix.e2e.ts — "signing out leaves nothing
//     behind" — which was verified to exist rather than assumed, per V10.)
//
// So the rows below use NO mocks on the lines that matter: a real
// `createClient`, the real `_listenForAuthEvents` wiring, and the app's own
// lazy Proxy. If the alias silently stopped applying in vitest, V1 would be
// exercising the genuine realtime-js instead of the stub and would pass for the
// wrong reason — which is what `the alias is actually in force` guards.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// A syntactically valid URL that resolves to nothing. Nothing here is allowed
// to make a network call; a row that starts one is a row that has stopped
// testing the stub.
const FAKE_URL = 'http://127.0.0.1:9';
const FAKE_KEY = 'fake-anon-key-for-unit-tests';

describe('the alias is actually in force (anti-vacuity for everything below)', () => {
    it('supabase-js constructs against the STUB, not the real realtime client', () => {
        const client = createClient(FAKE_URL, FAKE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
        // The real RealtimeClient exposes connect/disconnect/accessTokenValue and
        // opens a socket; the stub has exactly the six audited members and
        // nothing else. If vitest ever stopped applying vite.config.ts's alias,
        // this is the row that says so instead of every other row quietly
        // testing the vendor library.
        expect(client.realtime.constructor.name).toBe('RealtimeClient');
        expect('connect' in client.realtime).toBe(false);
        expect(client.storage.constructor.name).toBe('StorageClient');
    });
});

describe('V1 — the auth-event path runs through the stub without throwing', () => {
    it('a real SIGNED_OUT reaches the stub’s ZERO-ARG setAuth and survives', async () => {
        // No mocks on this line. createClient wires _listenForAuthEvents to
        // auth.onAuthStateChange for real; signOut({scope:'local'}) clears the
        // local session WITHOUT a network round trip and emits SIGNED_OUT,
        // which supabase-js handles at SupabaseClient.ts:570 by calling
        // `this.realtime.setAuth()` with NO ARGUMENTS. That zero-arg shape is
        // the exact thing OV-11 flagged: a stub whose parameter is required
        // (or whose body throws) breaks sign-out for every user, and the only
        // symptom is a console error nobody sees in review.
        const client = createClient(FAKE_URL, FAKE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
        });

        const setAuth = vi.spyOn(client.realtime, 'setAuth');
        const { error } = await client.auth.signOut({ scope: 'local' });

        expect(error).toBeNull();
        // supabase-js dispatches auth events asynchronously.
        await vi.waitFor(() => expect(setAuth).toHaveBeenCalled());
        expect(setAuth).toHaveBeenCalledWith(); // zero arguments, as shipped
    });

    it('setAuth is a silent no-op with a token too (the SIGNED_IN / refresh shape)', () => {
        const client = createClient(FAKE_URL, FAKE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
        // SupabaseClient.ts:568. Same method, one argument; must be equally silent.
        expect(() => client.realtime.setAuth('a.token.value')).not.toThrow();
        expect(() => client.realtime.setAuth(null)).not.toThrow();
    });
});

// -----------------------------------------------------------------------------
// V2 / V3 — the fail-loud walls, through the app's own lazy Proxy
// -----------------------------------------------------------------------------
// These go through src/lib/supabase.ts rather than a bare client, because the
// Proxy is what every call site actually holds — and a Proxy that swallowed or
// re-wrapped the throw would make the "documented wall" invisible. The env is
// stubbed before the dynamic import because that module reads import.meta.env
// once, at module load.

describe('V2/V3 — the stubbed surfaces fail loud, naming the way back', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_SUPABASE_URL', FAKE_URL);
        vi.stubEnv('VITE_SUPABASE_ANON_KEY', FAKE_KEY);
        vi.resetModules();
    });
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    async function appClient() {
        return (await import('../lib/supabase')).supabase;
    }

    it('V2: supabase.channel() throws, naming vite.config.ts, the doc, and the arc', async () => {
        const supabase = await appClient();
        let message = '';
        try {
            supabase.channel('room-1');
            throw new Error('channel() did not throw — the stub is not fail-loud');
        } catch (err) {
            message = (err as Error).message;
        }
        // The three pointers ruling D4 requires of every throw: WHERE the
        // substitution is defined, WHY (the design doc), and the deliberate
        // path to undoing it.
        expect(message).toContain('vite.config.ts');
        expect(message).toContain('docs/design/shell-slim-supabase.md');
        expect(message).toMatch(/Realtime push arc/i);
    });

    it('V2: the other three channel methods are walled too', async () => {
        const supabase = await appClient();
        expect(() => supabase.getChannels()).toThrow(/vite\.config\.ts/);
        expect(() => supabase.removeChannel({} as never)).toThrow(/vite\.config\.ts/);
        expect(() => supabase.removeAllChannels()).toThrow(/vite\.config\.ts/);
    });

    it('V3: supabase.storage.from() throws — NOT the property access (OV-2)', async () => {
        const supabase = await appClient();

        // `storage` is CONSTRUCTOR-ASSIGNED in SupabaseClient, not a getter, so
        // reading the property must stay harmless: it runs for every client the
        // app creates, student sessions included. The wall is one call deeper.
        // This distinction was a severe review finding; asserting it keeps the
        // fix from being "simplified" back into a throwing constructor.
        expect(() => supabase.storage).not.toThrow();

        let message = '';
        try {
            supabase.storage.from('activity-images');
            throw new Error('storage.from() did not throw — the stub is not fail-loud');
        } catch (err) {
            message = (err as Error).message;
        }
        expect(message).toContain('vite.config.ts');
        expect(message).toContain('docs/design/shell-slim-supabase.md');
        // The wall points at the code that replaced it, not just at a doc.
        expect(message).toContain('uploadImage.ts');
        expect(message).toContain('activity-images');
    });
});

// =============================================================================
// Rung 2 (2026-10-04) — auth-js's dead modules: WebAuthn, web3, the admin API.
// Wired by the activity:auth-js-dead-modules plugin, not resolve.alias; the
// reasoning is in vite.config.ts and the stubs' headers.
// =============================================================================

describe('the auth-js plugin is actually in force (anti-vacuity for the rows below)', () => {
    it('GoTrueClient constructs against the admin and WebAuthn STUBS', () => {
        const client = createClient(FAKE_URL, FAKE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
        // The real GoTrueAdminApi carries listUsers/createUser/deleteUser; the
        // stub carries signOut and a marker, nothing else. If vitest stopped
        // running auth-js through Vite's pipeline, this is the row that says so.
        const admin = client.auth.admin as unknown as Record<string, unknown>;
        expect(admin.isStub).toBe(true);
        expect('listUsers' in admin).toBe(false);
        const webauthn = client.auth.mfa.webauthn as unknown as Record<string, unknown>;
        expect(webauthn.isStub).toBe(true);
    });
});

describe('sign-out still reaches the server through the admin stub', () => {
    function clientWith(fetchImpl: typeof fetch) {
        return createClient(FAKE_URL, FAKE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
            global: { fetch: fetchImpl },
        });
    }

    it('POSTs /logout with the scope and the session token', async () => {
        // GoTrueClient.signOut calls this.admin.signOut(accessToken, scope) —
        // the one admin method a browser session uses, and the reason the admin
        // stub is not inert. Called directly so the row needs no stored session.
        const calls: Array<{ url: string; init: RequestInit | undefined }> = [];
        const fetchSpy = (async (input: RequestInfo | URL, init?: RequestInit) => {
            calls.push({ url: String(input), init });
            return new Response(null, { status: 204 });
        }) as typeof fetch;
        const client = clientWith(fetchSpy);

        const { error } = await client.auth.admin.signOut('token-under-test', 'global');

        expect(error).toBeNull();
        expect(calls).toHaveLength(1);
        expect(calls[0]?.url).toBe(`${FAKE_URL}/auth/v1/logout?scope=global`);
        expect(calls[0]?.init?.method).toBe('POST');
        const headers = new Headers(calls[0]?.init?.headers);
        expect(headers.get('Authorization')).toBe('Bearer token-under-test');
    });

    it('a rejected token comes back as an AuthError VALUE, not a throw', async () => {
        // GoTrueClient reads the returned error's class and status to decide
        // whether a 401/403/404 still clears the local session. A stub that
        // threw here, or returned a bare object, would strand a signed-in
        // student on a shared Chromebook.
        const fetch401 = (async () =>
            new Response(JSON.stringify({ code: 401, msg: 'invalid JWT' }), {
                status: 401,
                headers: { 'content-type': 'application/json' },
            })) as typeof fetch;
        const client = clientWith(fetch401);

        const { error } = await client.auth.admin.signOut('expired', 'global');

        expect(error).not.toBeNull();
        expect(error?.name).toBe('AuthApiError');
        expect(error?.status).toBe(401);
    });
});

describe('the stubbed-out auth paths fail by name, never silently', () => {
    it('web3 sign-in names the stub', async () => {
        const client = createClient(FAKE_URL, FAKE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
        await expect(
            client.auth.signInWithWeb3({
                chain: 'ethereum',
                wallet: {
                    request: async () => ['0x0000000000000000000000000000000000000000'],
                } as never,
            }),
        ).rejects.toThrow(/STUBBED OUT/);
    });
});
