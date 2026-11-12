// =============================================================================
// supabase-stubs/functions-js.ts — the module `@supabase/functions-js` RESOLVES TO
// -----------------------------------------------------------------------------
// THIS FILE IS NOT IMPORTED BY NAME ANYWHERE. It is wired in by a
// `resolve.alias` entry in packages/app/vite.config.ts, which redirects every
// import of `@supabase/functions-js`, including supabase-js's own, here.
// Design + ruling: docs/design/shell-size-review.md (R2, D1).
//
// WHY: functions-js was ~1 KiB gz of the student's entry chunk with ZERO call
// sites. The app already calls every Edge Function with plain `fetch` through
// lib/edgeFunctions.ts (`edgeFunctionUrl`), because `functions.invoke` adds an
// `x-region` header that the functions' CORS allow-list does not carry, so a
// real invoke fails its preflight in the browser while route-stubbed e2e lanes
// stay green. `edgeFunctionUrls.test.ts` already refuses `supabase.functions`
// in source; this stub makes the same mistake fail loud at runtime too.
//
// AUDITED AGAINST: @supabase/supabase-js 2.105.3
//   ^ read mechanically by scripts/tests/supabase-stub-pin.test.mjs — see the
//     same note in realtime-js.ts.
//
// THE CONTRACT THIS MUST HONOR (that version's dist/index.mjs):
//
//   line   1  import { FunctionRegion, FunctionsClient, FunctionsError,
//                      FunctionsFetchError, FunctionsHttpError,
//                      FunctionsRelayError } from '@supabase/functions-js'
//   line 412  get functions() { return new FunctionsClient(url, { headers, customFetch }) }
//   line 606  export { FunctionRegion, FunctionsError, ... }   — NAMED re-exports
//
// `functions` IS A GETTER (unlike `storage`, which the constructor assigns), so
// FunctionsClient is constructed only when code reads `supabase.functions`.
// That read is already the mistake, so the wall is the constructor itself.
// The five other names exist as values only because supabase-js re-exports
// them; nothing in the app constructs or catches them.
//
// UN-STUBBING: only alongside a function call that plain fetch cannot serve,
// and only after the function's CORS allow-list carries `x-region`. Delete the
// alias line in vite.config.ts, delete this file, drop it from the pin test's
// STUBS list, and delete its absence row in scripts/perf-budgets.mjs.
//
// ⚠ THE ALIAS LIES TO TYPESCRIPT, as for the other stubs: the compiler still
// types `supabase.functions.invoke(...)` as working.
// =============================================================================

// Unused parameters are the point — see the same note in realtime-js.ts.
/* eslint-disable @typescript-eslint/no-unused-vars */

const UN_STUB =
    'Supabase Functions is STUBBED OUT of this app. `@supabase/functions-js` is ' +
    'aliased to packages/app/src/lib/supabase-stubs/functions-js.ts by ' +
    'resolve.alias in packages/app/vite.config.ts. Call Edge Functions with ' +
    'plain fetch through edgeFunctionUrl() in packages/app/src/lib/edgeFunctions.ts: ' +
    "functions.invoke adds an x-region header the functions' CORS allow-list " +
    'refuses. Why: docs/design/shell-size-review.md (R2).';

/** Constructed by supabase-js's `functions` GETTER, i.e. only when something
 *  reads `supabase.functions`. Nothing should, so construction is the wall. */
export class FunctionsClient {
    constructor(_url?: string, _opts?: unknown) {
        throw new Error(`supabase.functions — ${UN_STUB}`);
    }
}

export class FunctionsError extends Error {
    context: unknown;
    constructor(message: string, name = 'FunctionsError', context?: unknown) {
        super(message);
        this.name = name;
        this.context = context;
    }
}
export class FunctionsFetchError extends FunctionsError {}
export class FunctionsHttpError extends FunctionsError {}
export class FunctionsRelayError extends FunctionsError {}

/** A value re-export of supabase-js; the real enum's members, unchanged. */
export const FunctionRegion = {
    Any: 'any',
    ApNortheast1: 'ap-northeast-1',
    ApNortheast2: 'ap-northeast-2',
    ApSouth1: 'ap-south-1',
    ApSoutheast1: 'ap-southeast-1',
    ApSoutheast2: 'ap-southeast-2',
    CaCentral1: 'ca-central-1',
    EuCentral1: 'eu-central-1',
    EuWest1: 'eu-west-1',
    EuWest2: 'eu-west-2',
    EuWest3: 'eu-west-3',
    SaEast1: 'sa-east-1',
    UsEast1: 'us-east-1',
    UsWest1: 'us-west-1',
    UsWest2: 'us-west-2',
} as const;
