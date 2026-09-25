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
import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync, existsSync, chmodSync } from 'node:fs';
import { dirname } from 'node:path';
import type { WorkerConfig } from './config.ts';

const CALLBACK_PORT = 54329;

function makeClient(config: WorkerConfig): SupabaseClient {
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      // In-memory storage: the PKCE verifier only needs to survive within
      // this process; the durable artifact is the token file we write.
      storage: memoryStorage(),
    },
  });
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
  console.log(`Waiting for the callback on ${redirectTo} …`);

  const code = await new Promise<string>((resolvePromise, rejectPromise) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? '/', redirectTo);
      const c = url.searchParams.get('code');
      if (url.pathname !== '/callback' || !c) {
        res.writeHead(404).end();
        return;
      }
      res
        .writeHead(200, { 'Content-Type': 'text/plain' })
        .end('Signed in — you can close this tab and return to the terminal.');
      server.close();
      resolvePromise(c);
    });
    server.on('error', rejectPromise);
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
export async function loadAuthedClient(config: WorkerConfig): Promise<SupabaseClient> {
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
export async function refresh(config: WorkerConfig, client: SupabaseClient): Promise<void> {
  const { data, error } = await client.auth.refreshSession();
  if (error || !data.session) throw new SessionExpiredError();
  persistSession(config, data.session);
}
