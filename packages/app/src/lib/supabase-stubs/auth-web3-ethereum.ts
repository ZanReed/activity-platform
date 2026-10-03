// =============================================================================
// supabase-stubs/auth-web3-ethereum.ts — what auth-js's `./lib/web3/ethereum`
// RESOLVES TO
// -----------------------------------------------------------------------------
// Wired by the `activity:auth-js-dead-modules` plugin in vite.config.ts; the
// full reasoning is in auth-webauthn.ts beside this file.
//
// AUDITED AGAINST: @supabase/supabase-js 2.105.3
//
// THE CONTRACT (auth-js 2.105.3, dist/module/GoTrueClient.js line 11): four
// names are imported, all used only inside signInWithWeb3's ethereum branch —
// sign-in with a crypto wallet, which this app has no call site for.
// =============================================================================

const UN_STUB =
    'auth-js web3 sign-in is STUBBED OUT of this app (packages/app/src/lib/' +
    'supabase-stubs/auth-web3-ethereum.ts, wired by the ' +
    'activity:auth-js-dead-modules plugin in packages/app/vite.config.ts).';

function dead(name: string): () => never {
    return () => {
        throw new Error(`${name}: ${UN_STUB}`);
    };
}

export const createSiweMessage = dead('createSiweMessage');
export const fromHex = dead('fromHex');
export const getAddress = dead('getAddress');
export const toHex = dead('toHex');
