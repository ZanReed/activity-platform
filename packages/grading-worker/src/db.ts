/**
 * The worker's Supabase client type (review C1 slice 5): supabase-js typed by
 * the generated schema (@activity/db-types, `pnpm db:types`), with `.rpc()`
 * typed by the shared, loosened call types (@activity/db-types/rpc) — so tsc
 * checks claim_grade_suggestions' and submit_grade_suggestion's names and
 * arguments. Types only.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@activity/db-types';
import type { TypedRpc } from '@activity/db-types/rpc';

export type WorkerClient = Omit<SupabaseClient<Database>, 'rpc'> & TypedRpc;
