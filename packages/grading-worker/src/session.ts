/**
 * W-1: auth bootstrap. `worker:login` runs a one-time interactive Google
 * sign-in (Supabase PKCE flow through a localhost callback) and writes the
 * session to a 0600 token file. Every other command loads that file,
 * refreshes in-loop, and on refresh failure EXITS non-zero with the fix —
 * never a silent idle loop.
 *
 * No service key anywhere (D3): the worker is a plain authenticated client,
 * and the RPCs it calls are gated on the teacher's own edit relationship.
 */
import { createClient, type Session } from '@supabase/supabase-js';
import type { Database } from '@activity/db-types';
import type { WorkerClient } from './db.ts';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync, existsSync, chmodSync } from 'node:fs';
import { dirname } from 'node:path';
import type { WorkerConfig } from './config.ts';

const CALLBACK_PORT = 54329;

/**
 * Every database and auth call the worker makes has a time limit (review D7,
 * 2026-11-28). The calls are one small RPC or a token refresh each; 30 s is
 * far past a slow answer and turns a hung connection into an ordinary
 * supabase-js error (`TimeoutError: …`) that the run loop already reports.
 * A signal supabase-js passes itself is kept: whichever fires first wins.
 */
export const DB_TIMEOUT_MS = 30_000;

export function fetchWithTimeout(timeoutMs: number = DB_TIMEOUT_MS): typeof fetch {
  return (input, init) => {
    const limit = AbortSignal.timeout(timeoutMs);
    const signal = init?.signal ? AbortSignal.any([init.signal, limit]) : limit;
    return fetch(input, { ...init, signal });
  };
}

function makeClient(config: WorkerConfig): WorkerClient {
  // The ONE cast to the loosened call type (db.ts): supabase-js's own rpc()
  // signature is stricter (no null arguments) and overloaded, so it is not
  // assignable to TypedRpc; the runtime object is the same client.
  return createClient<Database>(config.supabaseUrl, config.supabaseAnonKey, {
    global: { fetch: fetchWithTimeout() },
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      // In-memory storage: the PKCE verifier only needs to survive within
      // this process; the durable artifact is the token file we write.
      storage: memoryStorage(),
    },
  }) as unknown as WorkerClient;
}

function memoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
}

function persistSession(config: WorkerConfig, session: Session): void {
  mkdirSync(dirname(config.sessionPath), { recursive: true, mode: 0o700 });
  writeFileSync(
    config.sessionPath,
    JSON.stringify(
      { access_token: session.access_token, refresh_token: session.refresh_token },
      null,
      2,
    ),
    { mode: 0o600 },
  );
  chmodSync(config.sessionPath, 0o600);
}

/** The interactive login (worker:login). */
export async function login(config: WorkerConfig): Promise<string> {
  const client = makeClient(config);
  const redirectTo = `http://localhost:${CALLBACK_PORT}/callback`;
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data?.url) {
    throw new Error(`Could not start the sign-in flow: ${error?.message ?? 'no URL returned'}`);
  }

  console.log('\nOpen this URL in your browser and sign in as the TEACHER account:\n');
  console.log(`  ${data.url}\n`);
  console.log(
    `Waiting for the callback on ${redirectTo} …\n` +
      `(one-time prerequisite: ${redirectTo} must be on the Supabase\n` +
      ` Redirect URLs allowlist — Dashboard → Authentication → URL Configuration.\n` +
      ` Without it, Google succeeds but you land on the SITE URL and this\n` +
      ` terminal never hears back.)`,
  );

  // W-1: never a silent idle loop. The unlisted-redirect failure mode is a
  // browser that LOOKS signed in while this process hears nothing — so the
  // wait carries a deadline with the exact fix (learned live, 2026-09-26).
  const code = await new Promise<string>((resolvePromise, rejectPromise) => {
    const timeout = setTimeout(() => {
      server.close();
      rejectPromise(
        new Error(
          'no callback after 3 minutes. If the browser sign-in SUCCEEDED but ' +
            'landed you on the app instead of a "return to the terminal" page, ' +
            `the redirect URL is not allowlisted: add ${redirectTo} under ` +
            'Supabase Dashboard → Authentication → URL Configuration → ' +
            'Redirect URLs, then re-run worker:login.',
        ),
      );
    }, 180_000);
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? '/', redirectTo);
      if (url.pathname !== '/callback') {
        res.writeHead(404).end();
        return;
      }
      // GoTrue reports refusals as redirect params — surface them instead of
      // treating an errored callback as no callback.
      const authError = url.searchParams.get('error_description') ?? url.searchParams.get('error');
      const c = url.searchParams.get('code');
      if (!c) {
        res
          .writeHead(400, { 'Content-Type': 'text/plain' })
          .end(`Sign-in failed: ${authError ?? 'no code in the callback'}`);
        clearTimeout(timeout);
        server.close();
        rejectPromise(new Error(`callback carried no code${authError ? `: ${authError}` : ''}`));
        return;
      }
      res
        .writeHead(200, { 'Content-Type': 'text/plain' })
        .end('Signed in — you can close this tab and return to the terminal.');
      clearTimeout(timeout);
      server.close();
      resolvePromise(c);
    });
    server.on('error', (err) => {
      clearTimeout(timeout);
      rejectPromise(err);
    });
    server.listen(CALLBACK_PORT);
  });

  const { data: exchanged, error: exchangeError } =
    await client.auth.exchangeCodeForSession(code);
  if (exchangeError || !exchanged?.session) {
    throw new Error(`Sign-in failed: ${exchangeError?.message ?? 'no session returned'}`);
  }
  persistSession(config, exchanged.session);
  return exchanged.session.user?.email ?? '(unknown account)';
}

export class SessionExpiredError extends Error {
  constructor() {
    super('session expired — re-run worker:login');
  }
}

/**
 * Load the token file into a client. Refresh once up front (tokens on disk
 * are usually stale); callers re-invoke `refresh` between batches.
 */
export async function loadAuthedClient(config: WorkerConfig): Promise<WorkerClient> {
  if (!existsSync(config.sessionPath)) {
    throw new Error(
      `No session at ${config.sessionPath}.\n  Fix: run \`pnpm worker:login\` once.`,
    );
  }
  const stored = JSON.parse(readFileSync(config.sessionPath, 'utf8')) as {
    access_token: string;
    refresh_token: string;
  };
  const client = makeClient(config);
  const { data, error } = await client.auth.setSession(stored);
  if (error || !data.session) throw new SessionExpiredError();
  persistSession(config, data.session);
  return client;
}

/** In-loop refresh (W-1). Persists the rotated token; loud failure. */
export async function refresh(config: WorkerConfig, client: WorkerClient): Promise<void> {
  const { data, error } = await client.auth.refreshSession();
  if (error || !data.session) throw new SessionExpiredError();
  persistSession(config, data.session);
}
