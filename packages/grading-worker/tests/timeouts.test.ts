// Review D7 (2026-11-28): the worker's fetches have time limits. Proved
// against a REAL local server that accepts the request and never answers,
// so the limit is shown to fire, not just to be declared.
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { callModel, INFERENCE_TIMEOUT_MS } from '../src/inference.ts';
import { DB_TIMEOUT_MS, fetchWithTimeout } from '../src/session.ts';

let server: Server;
let url = '';

beforeAll(async () => {
  // Reads the request, then holds the response open forever.
  server = createServer((req) => {
    req.resume();
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((r) => server.close(() => r()));
});

describe('time limits (D7)', () => {
  it('a model server that never answers is a named timeout, not a hang', async () => {
    const result = await callModel(
      { system: 's', user: 'u', schema: {}, modelId: 'm', inferenceUrl: url },
      '/nonexistent-never-written',
      50,
    );
    expect(result).toMatchObject({ ok: false, reason: 'timeout' });
    expect(!result.ok && result.detail).toMatch(/did not answer within 0\.05 s/);
  });

  it('a database call that never answers rejects with a TimeoutError', async () => {
    await expect(fetchWithTimeout(50)(`${url}/rest/v1/rpc/x`)).rejects.toMatchObject({ name: 'TimeoutError' });
  });

  it('a caller’s own abort still wins over the limit', async () => {
    const own = new AbortController();
    const pending = fetchWithTimeout(10_000)(`${url}/rest/v1/rpc/x`, { signal: own.signal });
    own.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('the production limits are the commented ones', () => {
    expect(INFERENCE_TIMEOUT_MS).toBe(180_000);
    expect(DB_TIMEOUT_MS).toBe(30_000);
  });
});
