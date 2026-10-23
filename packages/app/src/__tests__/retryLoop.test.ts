// DM-5's hold-and-retry: only `offline` retries; the rest are answers.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckError } from '@activity/viewer';
import { RetryLoop } from '../practice/retryLoop';

beforeEach(() => {
    vi.useFakeTimers();
});
afterEach(() => {
    vi.useRealTimers();
});

const offline = () => new CheckError('offline', 'Could not reach the server.');

describe('RetryLoop', () => {
    it('retries an offline failure until it lands, and records when it began failing', async () => {
        const loop = new RetryLoop(() => {}, () => 1000);
        let calls = 0;
        const run = loop.run(async () => {
            calls += 1;
            if (calls < 3) throw offline();
            return 'stored';
        });
        await vi.advanceTimersByTimeAsync(0);
        expect(loop.failingSince).toBe(1000);
        await vi.advanceTimersByTimeAsync(3_000);
        await expect(run).resolves.toBe('stored');
        expect(calls).toBe(3);
        expect(loop.failingSince).toBeNull();
    });

    it('any other failure is thrown at once, untried again', async () => {
        const loop = new RetryLoop();
        const attempt = vi.fn(async () => {
            throw new CheckError('unauthenticated', 'x');
        });
        await expect(loop.run(attempt)).rejects.toMatchObject({ kind: 'unauthenticated' });
        expect(attempt).toHaveBeenCalledTimes(1);
    });

    it('poke() sends now instead of at the next tick', async () => {
        const loop = new RetryLoop();
        const attempt = vi.fn().mockRejectedValueOnce(offline()).mockResolvedValueOnce('ok');
        const run = loop.run(attempt);
        await vi.advanceTimersByTimeAsync(10);
        expect(attempt).toHaveBeenCalledTimes(1);
        loop.poke();
        await vi.advanceTimersByTimeAsync(0);
        await expect(run).resolves.toBe('ok');
        expect(attempt).toHaveBeenCalledTimes(2);
    });

    it('stop() ends the waiting: the next offline failure throws', async () => {
        const loop = new RetryLoop();
        const run = loop.run(async () => {
            throw offline();
        });
        const settled = run.catch((e: unknown) => e);
        await vi.advanceTimersByTimeAsync(10);
        loop.stop();
        await vi.advanceTimersByTimeAsync(0);
        expect(await settled).toMatchObject({ kind: 'offline' });
    });
});
