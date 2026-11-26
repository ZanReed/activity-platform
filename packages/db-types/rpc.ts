// =============================================================================
// @activity/db-types/rpc — typed arguments and results for a database call
// -----------------------------------------------------------------------------
// HAND-WRITTEN (the generated schema is ./database.types.ts, `pnpm db:types`).
// Review C1 slices 4–5: the app's lib/db.ts and the grading worker share these,
// so one definition says what an RPC call may send and gets back.
//
// Two places the generated argument types are stricter than Postgres, loosened
// on purpose:
//   * any argument may be `null` — the generator types args as non-null, but a
//     SQL function receives NULL for any of them, and callers send null on
//     purpose ("clear the due date", "no token count yet");
//   * a `jsonb` argument takes any object or array — the generator's `Json` has
//     an index signature that an interface like ActivityDocument lacks.
// Types only: nothing here has a runtime value.
// =============================================================================

import type { Database, Json } from './database.types.ts';

type Functions = Database['public']['Functions'];

/** Every function the migrations leave live in `public`. */
export type FnName = keyof Functions;

/** A value a SQL `jsonb` parameter accepts. */
type JsonInput = string | number | boolean | null | object;

// A `jsonb` parameter is typed `Json` (or `Json | undefined` when it has a
// default); `NonNullable` on both sides, because Json itself includes null.
type LooseArg<V> = NonNullable<Json> extends NonNullable<V> ? JsonInput | Extract<V, undefined> : V | null;
type LooseArgs<A> = { [K in keyof A]: LooseArg<A[K]> };

/** The arguments of `F` (a union when it is overloaded; `never` = none). */
export type ArgsOf<F extends FnName> = Functions[F] extends infer O ? (O extends { Args: infer A } ? A : never) : never;

/** What `F` returns according to the schema (`Json` for a jsonb result). */
export type ReturnsOf<F extends FnName> = Functions[F] extends infer O ? (O extends { Returns: infer R } ? R : never) : never;

/** A call's argument list for `F`: none, or its (loosened) argument object. */
export type RpcArgs<F extends FnName> = [ArgsOf<F>] extends [never] ? [] | [Record<string, never>] : [LooseArgs<ArgsOf<F>>];

/** What a call resolves to — supabase-js's `{ data, error }`, structurally. */
export interface RpcResponse<R> {
  data: R | null;
  error: { message: string; code?: string; details?: string | null; hint?: string | null } | null;
}

/**
 * A client whose `.rpc()` is typed by the schema (loosened as above). Give a
 * supabase-js client this type — `Omit<SupabaseClient<Database>, 'rpc'> &
 * TypedRpc` — and its existing `client.rpc('name', { … })` calls are checked
 * with no wrapper and no runtime change.
 */
export interface TypedRpc {
  rpc<F extends FnName>(fn: F, ...args: RpcArgs<F>): PromiseLike<RpcResponse<ReturnsOf<F>>>;
}
