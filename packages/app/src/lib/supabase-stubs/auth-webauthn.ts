// =============================================================================
// supabase-stubs/auth-webauthn.ts — what auth-js's `./lib/webauthn` RESOLVES TO
// -----------------------------------------------------------------------------
// THIS FILE IS NOT IMPORTED BY NAME ANYWHERE. The `activity:auth-js-dead-modules`
// plugin in packages/app/vite.config.ts redirects auth-js's own RELATIVE import
// of `./lib/webauthn` here (resolve.alias cannot reach a relative import, which
// is why this one is a plugin and the two sub-client stubs are aliases).
//
// WHY: shell-slimming rung 2 (2026-10-04). GoTrueClient imports the WebAuthn
// (passkey) ceremony statically. This app signs in with Google OAuth only and
// calls four auth methods in total — getSession, onAuthStateChange,
// signInWithOAuth, signOut — so the ceremony code never ran, and it rode in the
// entry chunk every student downloads. With its two siblings (auth-web3-
// ethereum.ts, auth-admin-api.ts) the measured win is 156.48 → 151.82 KiB gz.
//
// AUDITED AGAINST: @supabase/supabase-js 2.105.3
//   ^ read mechanically by scripts/tests/supabase-stub-pin.test.mjs. auth-js
//     ships in lockstep with supabase-js; the same test holds the two versions
//     together.
//
// THE CONTRACT THIS MUST HONOR (auth-js 2.105.3, dist/module/GoTrueClient.js):
//
//   line  12  imports nine names from './lib/webauthn' — every one is exported
//             below; a missing named export is a hard rollup error
//   line 164  `webauthn: new WebAuthnApi(this)` runs in the CONSTRUCTOR, for
//             every client this app creates — so that constructor is throw-free
//   passkey sign-in / registration call browserSupportsWebAuthn() FIRST and
//             return a tidy AuthUnknownError when it is false. It is always
//             false here, so those paths end before any stubbed function runs.
//
// `webauthn.errors.js` is imported only by the real webauthn.js, so it leaves
// the bundle with it.
//
// UN-STUBBING: passkeys or WebAuthn MFA becoming a real feature. Remove this
// file's entry from the plugin's table and from the pin test, and delete the
// matching absence row in scripts/perf-budgets.mjs, in one commit.
// =============================================================================

const UN_STUB =
    'auth-js WebAuthn is STUBBED OUT of this app (packages/app/src/lib/' +
    'supabase-stubs/auth-webauthn.ts, wired by the activity:auth-js-dead-modules ' +
    'plugin in packages/app/vite.config.ts). The app signs in with Google OAuth ' +
    'only. To use passkeys, remove the stub — see its header.';

function dead(name: string): () => never {
    return () => {
        throw new Error(`${name}: ${UN_STUB}`);
    };
}

export const createCredential = dead('createCredential');
export const getCredential = dead('getCredential');
export const deserializeCredentialCreationOptions = dead('deserializeCredentialCreationOptions');
export const deserializeCredentialRequestOptions = dead('deserializeCredentialRequestOptions');
export const serializeCredentialCreationResponse = dead('serializeCredentialCreationResponse');
export const serializeCredentialRequestResponse = dead('serializeCredentialRequestResponse');

/** Always false: GoTrueClient's passkey methods check this first and stop. */
export function browserSupportsWebAuthn(): boolean {
    return false;
}

export const webAuthnAbortService = {
    createNewAbortSignal: dead('webAuthnAbortService.createNewAbortSignal'),
    cancelCeremony(): void {},
};

/** Constructed by every GoTrueClient; holds nothing and does nothing. */
export class WebAuthnApi {
    readonly isStub = true;
}
