// @vitest-environment jsdom
// =============================================================================
// usePublish.test.ts — the publish hook's state machine + error parsing
// -----------------------------------------------------------------------------
// The header's Publish chip and the PublishStatus line read this hook's state,
// so the contract worth pinning is: idle → publishing → success (version +
// url), and the FunctionsHttpError body-parsing that turns an Edge Function's
// { error, details.message } into one teacher-facing message. Supabase is
// mocked via vi.hoisted (same pattern as Activities.test.tsx).
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => {
    const invoke = vi.fn();
    const getSession = vi.fn(
        (): Promise<{ data: { session: { access_token: string } | null } }> =>
            Promise.resolve({ data: { session: { access_token: 'tok' } } }),
    );
    return { invoke, getSession };
});

vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: { getSession: h.getSession },
        functions: { invoke: h.invoke },
    },
}));

import { usePublish } from '../lib/usePublish';

beforeEach(() => {
    h.invoke.mockReset();
    h.getSession.mockResolvedValue({
        data: { session: { access_token: 'tok' } },
    });
});
afterEach(() => {
    vi.clearAllMocks();
});

describe('usePublish', () => {
    it('runs onBeforePublish, then reports success with version + url', async () => {
        const order: string[] = [];
        const onBefore = vi.fn(async () => {
            order.push('flush');
        });
        h.invoke.mockImplementation(() => {
            order.push('invoke');
            return Promise.resolve({
                data: {
                    version_id: 'v',
                    version_num: 3,
                    public_url: 'https://cdn/x/index.html',
                    versioned_url: 'https://cdn/x/v3/index.html',
                },
                error: null,
            });
        });

        const { result } = renderHook(() => usePublish('act-1', onBefore));
        expect(result.current.state.kind).toBe('idle');

        await act(async () => {
            await result.current.publish();
        });

        expect(order).toEqual(['flush', 'invoke']); // draft flushed before publish
        expect(result.current.state).toEqual({
            kind: 'success',
            versionNum: 3,
            publicUrl: 'https://cdn/x/index.html',
        });
        // The activity id + auth header reach the function.
        expect(h.invoke).toHaveBeenCalledWith('publish-activity', {
            body: { activity_id: 'act-1' },
            headers: { Authorization: 'Bearer tok' },
        });
    });

    it('errors when there is no session, without invoking', async () => {
        h.getSession.mockResolvedValue({ data: { session: null } });
        const { result } = renderHook(() => usePublish('act-1'));
        await act(async () => {
            await result.current.publish();
        });
        expect(result.current.state).toEqual({
            kind: 'error',
            message: 'Not signed in',
        });
        expect(h.invoke).not.toHaveBeenCalled();
    });

    it('parses the Edge Function error body into one message', async () => {
        h.invoke.mockResolvedValue({
            data: null,
            error: {
                message: 'Edge Function returned a non-2xx status code',
                context: {
                    json: () =>
                        Promise.resolve({
                            error: 'Upload failed',
                            details: { message: 'R2 PUT 403' },
                        }),
                },
            },
        });
        const { result } = renderHook(() => usePublish('act-1'));
        await act(async () => {
            await result.current.publish();
        });
        expect(result.current.state).toEqual({
            kind: 'error',
            message: 'Upload failed: R2 PUT 403',
        });
    });

    it('passes through to publishing state during the call', async () => {
        let resolveInvoke: (v: unknown) => void = () => {};
        h.invoke.mockImplementation(
            () => new Promise((r) => (resolveInvoke = r)),
        );
        const { result } = renderHook(() => usePublish('act-1'));
        let done: Promise<void>;
        act(() => {
            done = result.current.publish();
        });
        await waitFor(() => expect(result.current.state.kind).toBe('publishing'));
        await act(async () => {
            resolveInvoke({
                data: {
                    version_id: 'v',
                    version_num: 1,
                    public_url: 'u',
                    versioned_url: 'u2',
                },
                error: null,
            });
            await done;
        });
        expect(result.current.state.kind).toBe('success');
    });
});
