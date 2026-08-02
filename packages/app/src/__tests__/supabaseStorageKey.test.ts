// @vitest-environment jsdom
// =============================================================================
// supabaseStorageKey.test.ts — the one supabase-js internal the e2e harness
// depends on (S6 V5)
// -----------------------------------------------------------------------------
// The signed-in student harness fakes a sign-in by writing a session into the
// storage key supabase-js reads at startup. That key is derived, not
// documented, so this pins it the only way that actually proves anything: write
// a session under the derived key, hand a REAL client the same URL, and check
// it reads the session back.
//
// Why bother, when the e2e would fail anyway? Because of HOW it would fail.
// A changed key scheme makes every student spec land on the sign-in screen —
// a symptom with a dozen plausible causes (auth, routing, env, timing), and
// the harness is the last place anyone would look. This test names the cause
// in one line instead.
// =============================================================================

import { describe, expect, it, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import {
    supabaseStorageKey,
    fakeSession,
} from '../../e2e/helpers/studentSession';

const URL_UNDER_TEST = 'http://127.0.0.1:54321';
const USER_ID = 'dddddddd-0000-4000-8000-00000000e2e1';

describe('supabaseStorageKey', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('derives the key from the first label of the API host', () => {
        expect(supabaseStorageKey('https://abcdefg.supabase.co')).toBe(
            'sb-abcdefg-auth-token',
        );
        expect(supabaseStorageKey(URL_UNDER_TEST)).toBe('sb-127-auth-token');
    });

    // One client, because two in the same context share the storage key and
    // GoTrueClient warns about it — noise that would sit in the suite forever.
    it('a session written under that key is the session the client reports', async () => {
        localStorage.setItem(
            supabaseStorageKey(URL_UNDER_TEST),
            JSON.stringify(fakeSession(USER_ID)),
        );

        const client = createClient(URL_UNDER_TEST, 'e2e-anon-key');
        const { data } = await client.auth.getSession();

        // THIS is the assertion the harness rests on: the app's own client,
        // constructed exactly as the app constructs it, believes a student is
        // signed in — with no test-only branch anywhere in shipped code.
        expect(data.session?.user.id).toBe(USER_ID);
        expect(data.session?.access_token).toBe(`e2e-access-${USER_ID}`);
        // And it is not already expired: an expired session sends supabase-js
        // to the network to refresh, which in a spec means a hang or a
        // surprise sign-out mid-assertion.
        expect(data.session!.expires_at! * 1000).toBeGreaterThan(Date.now());
    });
});
