// The Edge Functions' Supabase client type (review C1, the deno-check step):
// supabase-js typed by the generated schema (./database.types.ts), with
// `.rpc()` typed by the shared, loosened call types (./database.rpc.ts, a copy
// of packages/db-types/rpc.ts) — so `deno check` (CI: scripts/deno-check/)
// checks every RPC name and argument and every table/column these functions
// read. Types only: nothing here runs.
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.105.3';
import type { Database } from './database.types.ts';
import type { TypedRpc } from './database.rpc.ts';

export type { Database };
export type EdgeClient = Omit<SupabaseClient<Database>, 'rpc'> & TypedRpc;
