// =============================================================================
// supabase-stubs/storage-js.ts — the module `@supabase/storage-js` RESOLVES TO
// -----------------------------------------------------------------------------
// THIS FILE IS NOT IMPORTED BY NAME ANYWHERE. It is wired in by a
// `resolve.alias` entry in packages/app/vite.config.ts, which redirects every
// import of `@supabase/storage-js` — including supabase-js's own, from inside
// node_modules — here. Design + rulings: docs/design/shell-slim-supabase.md (R2).
//
// WHY: storage-js (plus its iceberg-js dependency) was 7.4 KiB gz of the
// student's entry chunk to serve ONE file — lib/uploadImage.ts, which only ever
// made two calls: `.upload()` and `.getPublicUrl()`. uploadImage now makes
// those two calls as raw `fetch` against Storage's versioned public HTTP API,
// so storage-js has no caller left anywhere in the app; this stub exists purely
// so supabase-js's own static import resolves.
//
// AUDITED AGAINST: @supabase/supabase-js 2.105.3
//   ^ read mechanically by scripts/tests/supabase-stub-pin.test.mjs — see the
//     same note in realtime-js.ts.
//
// THE CONTRACT THIS MUST HONOR (that version's dist/index.mjs):
//
//   line   4  import { StorageApiError, StorageClient } from '@supabase/storage-js'
//   line 406  this.storage = new StorageClient(url, headers, fetch, options)
//   line 606  export { ..., StorageApiError, ... }   — a NAMED re-export
//
// ⚠ `storage` IS NOT A GETTER (review finding OV-2, a severe correction to this
// plan's first draft). SupabaseClient ASSIGNS `new StorageClient(...)` in its
// constructor, which runs for every client this app creates — including on the
// student path, which never uploads anything. So the constructor must be
// THROW-FREE and the wall lives on `.from()`. `supabase.storage` returns this
// stub instance harmlessly; `supabase.storage.from('bucket')` is what fails
// loud (ruling D3), which is why the regression test asserts `.from()` and not
// bare property access.
//
// Only the two names supabase-js actually imports are exported: unlike
// realtime-js there is no `export *` from storage-js in supabase-js's index
// (finding OV-3's audit covered both), so the rest of storage-js's surface —
// the vectors/analytics clients and friends — is not part of this contract.
//
// UN-STUBBING: bring back the real client only alongside a storage need that
// raw fetch genuinely cannot serve (resumable/TUS upload is the plausible one,
// and it needs an UPDATE policy on the bucket first — see 0019's "deliberately
// absent" note). Delete the alias line in vite.config.ts, delete this file,
// restore the caret range on @supabase/supabase-js, delete the pin test.
//
// ⚠ THE ALIAS LIES TO TYPESCRIPT (design doc §5bis, ACCEPTED). Aliasing is
// runtime-only: the compiler still types `supabase.storage.from(...)` as fully
// working, so a developer's first signal is the runtime throw, not a squiggle.
// =============================================================================

// Unused parameters are the point — see the same note in realtime-js.ts.
/* eslint-disable @typescript-eslint/no-unused-vars */

const UN_STUB =
    'Supabase Storage is STUBBED OUT of this app. `@supabase/storage-js` is ' +
    'aliased to packages/app/src/lib/supabase-stubs/storage-js.ts by ' +
    'resolve.alias in packages/app/vite.config.ts, to keep 7.4 KiB gz out of ' +
    'the student shell. The app uploads images with two raw fetch calls ' +
    'instead — see packages/app/src/lib/uploadImage.ts, which is the ONE place ' +
    'that talks to Storage and the place to add whatever you were reaching for. ' +
    'Why and how to undo it: docs/design/shell-slim-supabase.md (R2).';

/** supabase-js constructs this in SupabaseClient's constructor, on EVERY client,
 *  student sessions included. The constructor must therefore be silent; the
 *  wall is on `.from()`, the first call that means someone wants Storage. */
export class StorageClient {
    constructor(
        _url?: string,
        _headers?: Record<string, string>,
        _fetch?: unknown,
        _opts?: unknown,
    ) {}

    from(bucket: string): never {
        throw new Error(`supabase.storage.from('${bucket}') — ${UN_STUB}`);
    }
}

/** Imported by name AND re-exported by supabase-js's index (line 606), so it
 *  must exist as a value even though nothing constructs or catches it here. */
export class StorageApiError extends Error {
    readonly __isStorageError = true;
    status: number;
    statusCode: string;

    constructor(message: string, status = 0, statusCode = '') {
        super(message);
        this.name = 'StorageApiError';
        this.status = status;
        this.statusCode = statusCode;
    }
}
