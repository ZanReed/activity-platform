// =============================================================================
// lib/db.ts — the app's ONE way to call a database function
// -----------------------------------------------------------------------------
// Review C1 slice 4 (docs/design/database-snapshot-and-types.md D3, D6).
//
//   const { data, error } = await rpc('class_progress', { p_class_id: id });
//
// The name must be a function the migrations define; the arguments are typed
// from the generated schema (@activity/db-types, `pnpm db:types`), so a
// renamed or dropped parameter is a tsc error, not a PGRST error in a
// classroom. The result is typed too: a row set or scalar from the schema, and
// a `jsonb` result from JsonShapes (lib/dbShapes.ts) — the one place a
// hand-written shape is attached to a function. Nothing here changes what is
// sent: the call goes straight to supabase.rpc with the same name and object.
//
// The argument types are @activity/db-types/rpc's, shared with the grading
// worker and the viewer's seams: generated, loosened only where Postgres is
// looser (null for any argument; any object for a jsonb one).
//
// scripts/tests/db-rpc.test.mjs forbids `supabase.rpc(` anywhere else in the
// app, and counts the remaining `as` casts of `data` so they only go down.
// =============================================================================

import type { PostgrestError } from '@supabase/supabase-js';
import type { FnName, ReturnsOf, RpcArgs } from '@activity/db-types/rpc';
import { supabase } from './supabase';
import type { JsonShapes } from './dbShapes';

export type { FnName, RpcArgs };

/** What `F` returns: its JsonShapes entry when it has one, else the schema's type. */
export type ResultOf<F extends FnName> = F extends keyof JsonShapes ? JsonShapes[F] : ReturnsOf<F>;

export interface RpcResult<F extends FnName> {
  data: ResultOf<F> | null;
  error: PostgrestError | null;
}

/** Call a database function with typed arguments and a typed result. */
export function rpc<F extends FnName>(fn: F, ...args: RpcArgs<F>): PromiseLike<RpcResult<F>> {
  // The generic client cannot narrow an overloaded or loosened call; the
  // public signature above is the checked one. Called AS A METHOD: rpc reads
  // `this` (the client), so a detached reference would break.
  const client = supabase as unknown as { rpc(f: string, a?: object): PromiseLike<RpcResult<F>> };
  return client.rpc(fn, args[0]);
}

/** rpc(), throwing the PostgREST message on error and returning the data —
 *  what the teacher pages' four local `call()` helpers each did by hand. */
export async function rpcOrThrow<F extends FnName>(fn: F, ...args: RpcArgs<F>): Promise<ResultOf<F>> {
  const { data, error } = await rpc(fn, ...args);
  if (error) throw new Error(error.message);
  return data as ResultOf<F>;
}
