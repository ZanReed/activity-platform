import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Read once at module load. Vite inlines these at build time, so changing
// .env.local requires restarting `pnpm dev`. The fail-loud check below catches
// the "you forgot to copy .env.local.example" case with a message that names
// the fix, rather than letting requests fail mysteriously at runtime.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const MISSING_ENV =
  'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
  'Copy packages/app/.env.local.example to packages/app/.env.local and fill in the values.';

// ⚠ TWO OF THIS CLIENT'S SUB-CLIENTS ARE STUBBED OUT (2026-08-18).
// `@supabase/realtime-js` and `@supabase/storage-js` are aliased to inert
// shells by `resolve.alias` in packages/app/vite.config.ts, to keep 22.7 KiB gz
// of never-executed code out of the student's entry chunk. Consequences for
// anyone reading THIS file first:
//   * `supabase.channel()` / `getChannels()` / `removeChannel()` /
//     `removeAllChannels()` THROW, with a message naming the alias.
//   * `supabase.storage.from(...)` THROWS. Image upload goes through
//     lib/uploadImage.ts, which talks to Storage's HTTP API directly.
//   * Auth, PostgREST and Functions are untouched and fully real.
//   * The alias is runtime-only, so TypeScript will happily autocomplete all
//     of the above as if it worked. The runtime throw is your first signal.
// Reasoning, the audited internals contract, and the un-stub path:
// docs/design/shell-slim-supabase.md.
//
// Single client instance for the whole app. Importing this module from
// multiple places gives you the same client (ES module caching), which is what
// we want — Supabase's auth state lives on the client object.
//
// Created LAZILY, on first property access. It used to be created (and the
// env check thrown) at module load, which meant a single missing variable took
// down the ENTIRE app at import time — including routes that touch Supabase
// not at all. That was found the honest way: /dev/viewer, the S3 component
// harness, is deliberately Supabase-free and still rendered a blank page on a
// clean clone, because App.tsx → SessionProvider → this module threw before
// React ever mounted (ruling D10's env-less acceptance criterion; the S3 DX
// review's outside voice called this exact shot).
//
// The fail-loud property is preserved where it matters: the moment anything
// actually USES the client, the same error with the same instructions throws.
// What changed is that not-using-it no longer costs you the app.
let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    if (!url || !anonKey) throw new Error(MISSING_ENV);
    client = createClient(url, anonKey);
  }
  return client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
  set(_target, prop, value, receiver) {
    return Reflect.set(getClient(), prop, value, receiver);
  },
  has(_target, prop) {
    return Reflect.has(getClient(), prop);
  },
});

/** True when the Supabase env is configured — lets a dev route or a guard
 * check without triggering the throw. */
export const supabaseConfigured = Boolean(url && anonKey);

/**
 * The Edge Functions base URL, resolved lazily so an env-less boot fails at
 * the CALL with MISSING_ENV — never at module load, and never as a request to
 * `undefined/functions/v1` (A21; the D10 bug class one route over).
 *
 * Lives HERE, not in the consuming route, so this module stays the single
 * env-read site — which is also what keeps the route's tests env-independent:
 * they mock '../lib/supabase' and supply a stub base URL, instead of the
 * route reading import.meta.env behind the mock's back (the exact
 * masked-locally-red-on-CI failure the first version of A21 shipped).
 */
export function functionsBase(): string {
  if (!url) throw new Error(MISSING_ENV);
  return `${url}/functions/v1`;
}

/**
 * The Storage base URL, resolved lazily for the same reasons `functionsBase`
 * is: an env-less boot must fail at the CALL with MISSING_ENV, never at module
 * load and never as a request to `undefined/storage/v1`.
 *
 * Exists because `@supabase/storage-js` is stubbed out (see the note above) —
 * lib/uploadImage.ts builds its two requests by hand, and this module stays the
 * single env-read site so the caller's tests remain env-independent (A21).
 * Mirrors supabase-js's own derivation: `new URL('storage/v1', supabaseUrl)`.
 */
export function storageBase(): string {
    if (!url) throw new Error(MISSING_ENV);
    return `${url}/storage/v1`;
}

/**
 * The anon (publishable) key, for hand-built requests.
 *
 * supabase-js's `fetchWithAuth` attaches `apikey` INVISIBLY to every sub-client
 * request; a raw fetch that sends only the Bearer token gets a 401 from the API
 * gateway before Storage ever sees it. That was the review's severe finding —
 * so the key is exported here, explicitly, and uploadImage sends both headers.
 */
export function supabaseAnonKey(): string {
    if (!anonKey) throw new Error(MISSING_ENV);
    return anonKey;
}

/**
 * The district's Google Workspace domain, used as the OAuth `hd` hint on
 * STUDENT-facing sign-ins so the account picker prefers school accounts
 * (identity slice E-6; UX only — the admission trigger is the gate). Unset =
 * no hint, gracefully. Lives here because this module is the single
 * env-read site (the A21/functionsBase lesson: an env read behind a vi.mock
 * boundary is env-DEPENDENT without looking it).
 */
export const districtHint: string | undefined =
  (import.meta.env.VITE_DISTRICT_HINT as string | undefined) || undefined;
