import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Read once at module load. Vite inlines these at build time, so changing
// .env.local requires restarting `pnpm dev`. The fail-loud check below catches
// the "you forgot to copy .env.local.example" case with a message that names
// the fix, rather than letting requests fail mysteriously at runtime.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const MISSING_ENV =
  'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
  'Copy packages/app/.env.local.example to packages/app/.env.local and fill in the values.';

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
