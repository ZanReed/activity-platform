// =============================================================================
// submission.test.ts — Unit tests for the network send/retry/classify logic
// -----------------------------------------------------------------------------
// These exercise the pure, DOM-free pieces of submission.ts: classifyFailure
// and sendWithRetry. sendWithRetry takes injectable `fetchFn` and `delay`
// hooks so the backoff loop runs synchronously here (no real timers) and we
// fully control each HTTP outcome.
// =============================================================================

import { describe, it, expect, vi } from 'vitest';
import {
    classifyFailure,
    sendWithRetry,
    computeScore,
} from '../submission.js';

// A no-wait delay so the backoff loop completes instantly under test.
const noDelay = () => Promise.resolve();

// Build a Response-like object good enough for postOnce: .ok, .status,
// .json(), .text(). Only the fields postOnce reads are populated.
function makeResponse(
    status: number,
    body: { json?: unknown; text?: string } = {},
): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => {
            if (body.json === undefined) throw new Error('not json');
            return body.json;
        },
        text: async () => body.text ?? '',
    } as unknown as Response;
}

describe('classifyFailure', () => {
    it('treats 4xx as terminal', () => {
        expect(classifyFailure(400)).toBe('terminal');
        expect(classifyFailure(401)).toBe('terminal');
        expect(classifyFailure(422)).toBe('terminal');
        expect(classifyFailure(499)).toBe('terminal');
    });

    it('treats 5xx and anything outside 4xx as retryable', () => {
        expect(classifyFailure(500)).toBe('retryable');
        expect(classifyFailure(502)).toBe('retryable');
        expect(classifyFailure(503)).toBe('retryable');
        expect(classifyFailure(399)).toBe('retryable');
    });
});

describe('computeScore', () => {
    it('is a fraction in [0,1]', () => {
        expect(computeScore(3, 4)).toBe(0.75);
        expect(computeScore(4, 4)).toBe(1);
    });

    it('returns 0 (not NaN) when nothing was scored', () => {
        expect(computeScore(0, 0)).toBe(0);
    });
});

describe('sendWithRetry', () => {
    it('returns ok with the attempt number on first-try success', async () => {
        const fetchFn = vi.fn(async () =>
            makeResponse(200, { json: { attempt_number: 3 } }),
        );
        const result = await sendWithRetry('https://x/submit', { a: 1 }, {
            fetchFn: fetchFn as unknown as typeof fetch,
            delay: noDelay,
        });
        expect(result.ok).toBe(true);
        expect(result.attemptNumber).toBe(3);
        expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('succeeds with attemptNumber undefined when the body is not JSON', async () => {
        const fetchFn = vi.fn(async () => makeResponse(200));
        const result = await sendWithRetry('https://x/submit', {}, {
            fetchFn: fetchFn as unknown as typeof fetch,
            delay: noDelay,
        });
        expect(result.ok).toBe(true);
        expect(result.attemptNumber).toBeUndefined();
    });

    it('does not retry on a terminal 4xx', async () => {
        const fetchFn = vi.fn(async () =>
            makeResponse(422, { text: 'Validation failed' }),
        );
        const result = await sendWithRetry('https://x/submit', {}, {
            fetchFn: fetchFn as unknown as typeof fetch,
            delay: noDelay,
        });
        expect(result.ok).toBe(false);
        expect(result.terminal).toBe(true);
        expect(result.message).toBe('Validation failed');
        expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('retries a transient 5xx then succeeds', async () => {
        const fetchFn = vi
            .fn()
            .mockResolvedValueOnce(makeResponse(503))
            .mockResolvedValueOnce(
                makeResponse(200, { json: { attempt_number: 1 } }),
            );
        const onRetry = vi.fn();
        const result = await sendWithRetry('https://x/submit', {}, {
            fetchFn: fetchFn as unknown as typeof fetch,
            delay: noDelay,
            onRetry,
        });
        expect(result.ok).toBe(true);
        expect(result.attemptNumber).toBe(1);
        expect(fetchFn).toHaveBeenCalledTimes(2);
        expect(onRetry).toHaveBeenCalledTimes(1);
        expect(onRetry).toHaveBeenCalledWith(2, 1000);
    });

    it('exhausts the retry budget on persistent 5xx (1 + 3 retries)', async () => {
        const fetchFn = vi.fn(async () => makeResponse(500));
        const onRetry = vi.fn();
        const result = await sendWithRetry('https://x/submit', {}, {
            fetchFn: fetchFn as unknown as typeof fetch,
            delay: noDelay,
            onRetry,
        });
        expect(result.ok).toBe(false);
        expect(result.terminal).toBe(false);
        // Initial attempt + 3 backoff retries = 4 POSTs.
        expect(fetchFn).toHaveBeenCalledTimes(4);
        expect(onRetry).toHaveBeenCalledTimes(3);
        expect(onRetry.mock.calls.map((c) => c[1])).toEqual([1000, 4000, 16000]);
    });

    it('treats a network error (fetch reject) as retryable, then recovers', async () => {
        const fetchFn = vi
            .fn()
            .mockRejectedValueOnce(new TypeError('Failed to fetch'))
            .mockResolvedValueOnce(
                makeResponse(200, { json: { attempt_number: 2 } }),
            );
        const result = await sendWithRetry('https://x/submit', {}, {
            fetchFn: fetchFn as unknown as typeof fetch,
            delay: noDelay,
        });
        expect(result.ok).toBe(true);
        expect(result.attemptNumber).toBe(2);
        expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('reports a network error message after exhausting retries while offline', async () => {
        const fetchFn = vi.fn(async () => {
            throw new TypeError('Failed to fetch');
        });
        const result = await sendWithRetry('https://x/submit', {}, {
            fetchFn: fetchFn as unknown as typeof fetch,
            delay: noDelay,
        });
        expect(result.ok).toBe(false);
        expect(result.terminal).toBe(false);
        expect(result.message).toBe('Network error');
        expect(fetchFn).toHaveBeenCalledTimes(4);
    });
});
