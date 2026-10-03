// =============================================================================
// supabase-stubs/auth-admin-api.ts — what auth-js's `./GoTrueAdminApi` RESOLVES TO
// -----------------------------------------------------------------------------
// Wired by the `activity:auth-js-dead-modules` plugin in vite.config.ts; the
// full reasoning is in auth-webauthn.ts beside this file.
//
// AUDITED AGAINST: @supabase/supabase-js 2.105.3
//
// ⚠ THIS STUB IS NOT INERT, AND THAT IS THE WHOLE AUDIT. The admin API is the
// service-role surface (create/delete users, generate links) and no browser
// should ever hold the key it needs — but GoTrueClient routes ORDINARY sign-out
// through it:
//
//   GoTrueClient.js line  128  this.admin = new GoTrueAdminApi({ url, headers, fetch })
//   GoTrueClient.js line 3188  const { error } = await this.admin.signOut(accessToken, scope)
//
// Those are the only two uses of `this.admin` in that file. So `signOut` below
// is the REAL method, copied from GoTrueAdminApi.js lines 65–83 and calling the
// real `_request` and `isAuthError` — the error mapping is security-relevant
// (GoTrueClient decides whether to clear the local session from the error's
// class and status) and is not re-implemented here. Everything else on the
// real class is gone.
//
// The deep imports resolve because `@supabase/auth-js` is a DIRECT dependency
// of the app, pinned to the version supabase-js itself depends on (the pin test
// holds them together).
// =============================================================================

import { _request } from '@supabase/auth-js/dist/module/lib/fetch';
import { isAuthError } from '@supabase/auth-js/dist/module/lib/errors';
import { SIGN_OUT_SCOPES } from '@supabase/auth-js/dist/module/lib/types';
import type { AuthError } from '@supabase/auth-js';

type Fetch = typeof fetch;
type SignOutScope = (typeof SIGN_OUT_SCOPES)[number];

export default class GoTrueAdminApi {
    readonly isStub = true;
    protected url: string;
    protected headers: Record<string, string>;
    protected fetch: Fetch;

    constructor({
        url = '',
        headers = {},
        fetch: customFetch,
    }: {
        url?: string;
        headers?: Record<string, string>;
        fetch?: Fetch;
    }) {
        this.url = url;
        this.headers = headers;
        // The real constructor wraps this in resolveFetch(); GoTrueClient always
        // passes the fetch it already resolved, so the fallback is the global.
        this.fetch = customFetch ?? ((...args) => fetch(...args));
    }

    async signOut(
        jwt: string,
        scope: SignOutScope = SIGN_OUT_SCOPES[0],
    ): Promise<{ data: null; error: AuthError | null }> {
        if (SIGN_OUT_SCOPES.indexOf(scope) < 0) {
            throw new Error(
                `@supabase/auth-js: Parameter scope must be one of ${SIGN_OUT_SCOPES.join(', ')}`,
            );
        }
        try {
            await _request(this.fetch, 'POST', `${this.url}/logout?scope=${scope}`, {
                headers: this.headers,
                jwt,
                noResolveJson: true,
            });
            return { data: null, error: null };
        } catch (error) {
            if (isAuthError(error)) {
                return { data: null, error };
            }
            throw error;
        }
    }
}
