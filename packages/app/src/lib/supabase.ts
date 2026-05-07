import { createClient } from '@supabase/supabase-js';

// Read once at module load. Vite inlines these at build time, so changing
// .env.local requires restarting `pnpm dev`. The fail-loud check below
// catches the "you forgot to copy .env.local.example" case immediately
// rather than letting requests fail mysteriously at runtime.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'Copy packages/app/.env.local.example to packages/app/.env.local and fill in the values.',
  );
}

// Single client instance for the whole app. Importing this module from
// multiple places gives you the same client (ES module caching), which is
// what we want — Supabase's auth state lives on the client object.
export const supabase = createClient(url, anonKey);
