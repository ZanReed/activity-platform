// =============================================================================
// e2e/helpers/disposablePreview.ts — a preview server a test can KILL (D-9)
// -----------------------------------------------------------------------------
// Playwright's webServer starts before the run and stops after it — nothing
// in a test can take it down. The offline-reopen rows need exactly that: the
// server must die MID-TEST so the reload can only be answered by the service
// worker. This spawns `vite preview` over the already-built dist/ (the sw
// lane's webServer guarantees the build exists) on a free port, and hands the
// test a kill switch.
//
// SIGKILL on purpose: a graceful shutdown finishes in-flight responses, and
// "the network died" does not.
// =============================================================================

import { spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { resolve } from 'node:path';

export interface DisposablePreview {
  origin: string;
  /** Kill the server dead and wait until the port stops answering. */
  kill(): Promise<void>;
  /** Always call in finally — idempotent with kill(). */
  dispose(): Promise<void>;
}

async function freePort(): Promise<number> {
  return new Promise((resolvePort, reject) => {
    const srv = createServer();
    srv.listen(0, '127.0.0.1', () => {
      const address = srv.address();
      if (address === null || typeof address === 'string') {
        srv.close();
        reject(new Error('no port assigned'));
        return;
      }
      const port = address.port;
      srv.close(() => resolvePort(port));
    });
    srv.on('error', reject);
  });
}

async function answering(origin: string): Promise<boolean> {
  try {
    const res = await fetch(origin, { signal: AbortSignal.timeout(1000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function poll(
  predicate: () => Promise<boolean>,
  timeoutMs: number,
  what: string,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`timed out waiting for ${what}`);
}

export async function startDisposablePreview(): Promise<DisposablePreview> {
  const appDir = resolve(import.meta.dirname ?? __dirname, '../..');
  const viteBin = resolve(appDir, 'node_modules/.bin/vite');
  const port = await freePort();
  const origin = `http://localhost:${port}`;

  const child: ChildProcess = spawn(
    viteBin,
    ['preview', '--port', String(port), '--strictPort'],
    { cwd: appDir, stdio: 'ignore' },
  );

  await poll(() => answering(origin), 15_000, `preview server on ${origin}`);

  let killed = false;
  const kill = async () => {
    if (killed) return;
    killed = true;
    child.kill('SIGKILL');
    await poll(async () => !(await answering(origin)), 5_000, 'server death');
  };

  return {
    origin,
    kill,
    dispose: kill,
  };
}
