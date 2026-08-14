// @vitest-environment jsdom
// =============================================================================
// usePublish.test.ts — the RPC-direct publish hook (S9 Drop 1)
// -----------------------------------------------------------------------------
// Publish stopped going through the publish-activity Edge Function; the hook
// now calls the `publish_activity` RPC directly. The contracts worth pinning
// (eng review E-1/OV-2 + the Drop 1 test plan):
//   * flush-fails → NO publish (the RPC is never called)
//   * invalid persisted doc → NO publish (the deleted function was the only
//     publish-time shape gate; this is its replacement)
//   * PostgREST raise texts map to teacher-facing copy (not-authorized,
//     no-draft), everything else passes through un-hidden
//   * republish surfaces the incremented version_num
//   * a failed post-publish version_num read degrades to success(null),
//     never to an error — the publish already committed
// Supabase is mocked via vi.hoisted (same pattern as Activities.test.tsx).
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createEmptyDocument } from '@activity/schema';

const h = vi.hoisted(() => {
    const rpc = vi.fn();
    const maybeSingle = vi.fn();
    const from = vi.fn(() => ({
        select: () => ({ eq: () => ({ maybeSingle }) }),
    }));
    const getSession = vi.fn(
        (): Promise<{ data: { session: { access_token: string } | null } }> =>
            Promise.resolve({ data: { session: { access_token: 'tok' } } }),
    );
    return { rpc, maybeSingle, from, getSession };
});

vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: { getSession: h.getSession },
        rpc: h.rpc,
        from: h.from,
    },
}));

import {
    usePublish,
    FLUSH_FAILED_MESSAGE,
    INVALID_DOC_MESSAGE,
    type PrePublishResult,
} from '../lib/usePublish';
import { PUBLISH_ACTIVITY_RPC } from '../lib/edgeFunctions';

const VERSION_ID = 'bbbbbbbb-0000-4000-8000-000000000001';

function okPrepare(draft: unknown = createEmptyDocument()) {
    return vi.fn(
        async (): Promise<PrePublishResult> => ({ ok: true, draft }),
    );
}

beforeEach(() => {
    h.rpc.mockReset();
    h.maybeSingle.mockReset();
    h.getSession.mockResolvedValue({
        data: { session: { access_token: 'tok' } },
    });
    h.rpc.mockResolvedValue({ data: VERSION_ID, error: null });
    h.maybeSingle.mockResolvedValue({
        data: { version_num: 3 },
        error: null,
    });
});
afterEach(() => {
    vi.clearAllMocks();
});

describe('usePublish', () => {
    it('flushes first, calls the RPC, and reports success with version_num', async () => {
        const order: string[] = [];
        const prepare = vi.fn(async (): Promise<PrePublishResult> => {
            order.push('prepare');
            return { ok: true, draft: createEmptyDocument() };
        });
        h.rpc.mockImplementation(() => {
            order.push('rpc');
            return Promise.resolve({ data: VERSION_ID, error: null });
        });

        const { result } = renderHook(() => usePublish('act-1', prepare));
        expect(result.current.state.kind).toBe('idle');

        await act(async () => {
            await result.current.publish();
        });

        expect(order).toEqual(['prepare', 'rpc']); // draft flushed before the RPC
        expect(h.rpc).toHaveBeenCalledWith(PUBLISH_ACTIVITY_RPC, {
            p_activity_id: 'act-1',
        });
        // The version_num line reads the row the RPC minted.
        expect(h.from).toHaveBeenCalledWith('activity_versions');
        expect(result.current.state).toEqual({
            kind: 'success',
            versionNum: 3,
        });
    });

    it('ABORTS when the flush reports failure — nothing is published (OV-2)', async () => {
        const prepare = vi.fn(
            async (): Promise<PrePublishResult> => ({ ok: false }),
        );
        const { result } = renderHook(() => usePublish('act-1', prepare));
        await act(async () => {
            await result.current.publish();
        });
        expect(result.current.state).toEqual({
            kind: 'error',
            message: FLUSH_FAILED_MESSAGE,
        });
        expect(h.rpc).not.toHaveBeenCalled();
    });

    it('treats a THROWING prepare step as a flush failure — nothing is published', async () => {
        const prepare = vi.fn(async (): Promise<PrePublishResult> => {
            throw new Error('network died mid-flush');
        });
        const { result } = renderHook(() => usePublish('act-1', prepare));
        await act(async () => {
            await result.current.publish();
        });
        expect(result.current.state).toEqual({
            kind: 'error',
            message: FLUSH_FAILED_MESSAGE,
        });
        expect(h.rpc).not.toHaveBeenCalled();
    });

    it('refuses an invalid persisted doc — the publish-time shape gate (E-1)', async () => {
        const prepare = okPrepare({ schemaVersion: 999, nonsense: true });
        const { result } = renderHook(() => usePublish('act-1', prepare));
        await act(async () => {
            await result.current.publish();
        });
        expect(result.current.state).toEqual({
            kind: 'error',
            message: INVALID_DOC_MESSAGE,
        });
        expect(h.rpc).not.toHaveBeenCalled();
    });

    it('skips validation when no draft is known (post-publish) and lets the RPC answer', async () => {
        // The RPC is authoritative for "is there a draft": null draft = the
        // client knows of none (publish cleared it), so the no-draft raise
        // comes back mapped, not pre-empted by a client guess.
        const prepare = vi.fn(
            async (): Promise<PrePublishResult> => ({ ok: true, draft: null }),
        );
        h.rpc.mockResolvedValue({
            data: null,
            error: { message: 'No draft content to publish' },
        });
        const { result } = renderHook(() => usePublish('act-1', prepare));
        await act(async () => {
            await result.current.publish();
        });
        expect(h.rpc).toHaveBeenCalledTimes(1);
        expect(result.current.state).toEqual({
            kind: 'error',
            message:
                'Nothing to publish — this activity has no unpublished changes.',
        });
    });

    it("maps the RPC's not-authorized raise to permission copy", async () => {
        h.rpc.mockResolvedValue({
            data: null,
            error: { message: 'Not authorized to publish this activity' },
        });
        const { result } = renderHook(() => usePublish('act-1', okPrepare()));
        await act(async () => {
            await result.current.publish();
        });
        expect(result.current.state).toEqual({
            kind: 'error',
            message: "You don't have permission to publish this activity.",
        });
    });

    it('passes an unknown PostgREST error message through un-hidden', async () => {
        h.rpc.mockResolvedValue({
            data: null,
            error: { message: 'deadlock detected' },
        });
        const { result } = renderHook(() => usePublish('act-1', okPrepare()));
        await act(async () => {
            await result.current.publish();
        });
        expect(result.current.state).toEqual({
            kind: 'error',
            message: 'deadlock detected',
        });
    });

    it('REPUBLISH: a second publish surfaces the incremented version_num', async () => {
        h.maybeSingle
            .mockResolvedValueOnce({ data: { version_num: 3 }, error: null })
            .mockResolvedValueOnce({ data: { version_num: 4 }, error: null });
        const { result } = renderHook(() => usePublish('act-1', okPrepare()));
        await act(async () => {
            await result.current.publish();
        });
        expect(result.current.state).toEqual({
            kind: 'success',
            versionNum: 3,
        });
        await act(async () => {
            await result.current.publish();
        });
        expect(result.current.state).toEqual({
            kind: 'success',
            versionNum: 4,
        });
        expect(h.rpc).toHaveBeenCalledTimes(2);
    });

    it('degrades to success(null) when the version_num read fails — publish committed', async () => {
        h.maybeSingle.mockResolvedValue({
            data: null,
            error: { message: 'transient' },
        });
        const { result } = renderHook(() => usePublish('act-1', okPrepare()));
        await act(async () => {
            await result.current.publish();
        });
        expect(result.current.state).toEqual({
            kind: 'success',
            versionNum: null,
        });
    });

    it('errors when there is no session, without calling the RPC', async () => {
        h.getSession.mockResolvedValue({ data: { session: null } });
        const { result } = renderHook(() => usePublish('act-1'));
        await act(async () => {
            await result.current.publish();
        });
        expect(result.current.state).toEqual({
            kind: 'error',
            message: 'Not signed in',
        });
        expect(h.rpc).not.toHaveBeenCalled();
    });

    it('errors when the RPC returns a non-uuid value', async () => {
        h.rpc.mockResolvedValue({ data: 42, error: null });
        const { result } = renderHook(() => usePublish('act-1', okPrepare()));
        await act(async () => {
            await result.current.publish();
        });
        expect(result.current.state).toEqual({
            kind: 'error',
            message: 'Publish returned an unexpected value',
        });
    });

    it('passes through the publishing state during the call', async () => {
        let resolveRpc: (v: unknown) => void = () => {};
        h.rpc.mockImplementation(() => new Promise((r) => (resolveRpc = r)));
        const { result } = renderHook(() => usePublish('act-1', okPrepare()));
        let done: Promise<void>;
        act(() => {
            done = result.current.publish();
        });
        await waitFor(() =>
            expect(result.current.state.kind).toBe('publishing'),
        );
        await act(async () => {
            resolveRpc({ data: VERSION_ID, error: null });
            await done;
        });
        expect(result.current.state).toEqual({
            kind: 'success',
            versionNum: 3,
        });
    });
});
