// The mixed practice client (D43 slice 3): what the entry reads and how
// check-activity's failures reach the runner.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CHECK_WIRE_VERSION, CheckError, emptySectionResponses } from '@activity/viewer';

const sb = vi.hoisted(() => ({
    rpc: vi.fn(),
    getSession: vi.fn(),
    maybeSingle: vi.fn(),
    from: vi.fn(),
}));
vi.mock('../lib/supabase', () => {
    const chain = {
        select: () => chain,
        eq: () => chain,
        is: () => chain,
        maybeSingle: () => ({ retry: (on: boolean) => sb.maybeSingle(on) }),
    };
    sb.from.mockReturnValue(chain);
    return {
        supabase: { rpc: sb.rpc, from: sb.from, auth: { getSession: sb.getSession } },
        functionsBase: () => 'https://stub.invalid/functions/v1',
    };
});

import {
    MIXED_PRACTICE_RPC,
    NOTHING_ANSWERED,
    checkPracticeItem,
    lookupPracticeClass,
    practiceMinutes,
    previewMixed,
    startDolPractice,
} from '../lib/mixedPractice';

beforeEach(() => {
    sb.rpc.mockReset();
    sb.maybeSingle.mockReset();
    sb.getSession.mockReset().mockResolvedValue({ data: { session: { access_token: 'tok' } } });
});

describe('practiceMinutes — 60–90 s a question (C-146), from the questions planned (ruling 4)', () => {
    it.each([
        [6, '6–9'],
        [3, '3–5'],
        [1, '1–2'],
        [8, '8–12'],
    ])('%i questions → about %s', (n, words) => {
        expect(practiceMinutes(n)).toBe(words);
    });
});

describe('lookupPracticeClass', () => {
    it('reads the class and whether mixed practice is on', async () => {
        sb.maybeSingle.mockResolvedValue({ data: { id: 'c1', mixed_on_at: '2026-10-20T00:00:00Z' }, error: null });
        expect(await lookupPracticeClass('ABC234')).toEqual({ id: 'c1', mixedOn: true });
        expect(sb.from).toHaveBeenCalledWith('classes');
        expect(sb.maybeSingle).toHaveBeenCalledWith(false); // no GET retries on the entry path
        sb.maybeSingle.mockResolvedValue({ data: { id: 'c1', mixed_on_at: null }, error: null });
        expect(await lookupPracticeClass('ABC234')).toEqual({ id: 'c1', mixedOn: false });
        sb.maybeSingle.mockResolvedValue({ data: null, error: null });
        expect(await lookupPracticeClass('ABC234')).toBeNull();
    });
});

describe('previewMixed — start_mixed_session WITHOUT starting', () => {
    it('never asks to start, and maps a ready preview', async () => {
        sb.rpc.mockResolvedValue({
            data: { state: 'ready', done_today: 1, graded: true, items_per_session: 6, planned: 4 },
            error: null,
        });
        expect(await previewMixed('c1')).toEqual({ state: 'ready', doneToday: 1, graded: true, itemsPerSession: 6, planned: 4 });
        expect(sb.rpc).toHaveBeenCalledWith(MIXED_PRACTICE_RPC.start, { p_class_id: 'c1', p_start: false });
    });

    it('resume: the first question not tried, and the open session for Finish here', async () => {
        sb.rpc.mockResolvedValue({
            data: {
                state: 'resume', done_today: 0, graded: false, items_per_session: 6,
                session: {
                    session_id: 's1', planned: 6,
                    items: [1, 2, 3, 4, 5, 6].map((seq) => ({ seq, answered: seq < 4 })),
                },
            },
            error: null,
        });
        expect(await previewMixed('c1')).toMatchObject({ state: 'resume', planned: 6, nextSeq: 4, sessionId: 's1' });
    });

    it('"Not available" is off; any other failure throws', async () => {
        sb.rpc.mockResolvedValue({ data: null, error: { message: 'Not available' } });
        expect(await previewMixed('c1')).toEqual({ state: 'off' });
        sb.rpc.mockResolvedValue({ data: null, error: { message: 'connection reset' } });
        await expect(previewMixed('c1')).rejects.toThrow('connection reset');
    });
});

describe('checkPracticeItem — check-activity `practice`', () => {
    const request = { sessionId: 's1', seq: 2, responses: emptySectionResponses() };

    it('sends the slot (never an item) with the token, at the current wire version', async () => {
        const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ wireVersion: CHECK_WIRE_VERSION, seq: 2 })));
        await checkPracticeItem({ ...request, skip: true }, fetchImpl as unknown as typeof fetch);
        const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
        expect(url).toContain('/functions/v1/check-activity');
        expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok');
        expect(JSON.parse(init.body as string)).toEqual({
            wireVersion: CHECK_WIRE_VERSION, mode: 'practice', sessionId: 's1', seq: 2, responses: emptySectionResponses(), skip: true,
        });
    });

    it.each([
        ['no answer reaches the server', () => Promise.reject(new TypeError('Failed to fetch')), 'offline'],
        ['a 401', () => Promise.resolve(new Response('{}', { status: 401 })), 'unauthenticated'],
        ['a 404 (the practice ended)', () => Promise.resolve(new Response('{"error":"Not available"}', { status: 404 })), 'unavailable'],
        ['a 500', () => Promise.resolve(new Response('{}', { status: 500 })), 'server_error'],
    ])('%s → %s', async (_name, respond, kind) => {
        const error = await checkPracticeItem(request, respond as unknown as typeof fetch).catch((e: unknown) => e);
        expect(error).toBeInstanceOf(CheckError);
        expect((error as CheckError).kind).toBe(kind);
    });

    it('the empty-Check refusal reads as the student sentence', async () => {
        const respond = () =>
            Promise.resolve(new Response(JSON.stringify({ error: 'x', code: 'nothing_answered' }), { status: 400 }));
        const error = await checkPracticeItem(request, respond as unknown as typeof fetch).catch((e: unknown) => e);
        expect((error as CheckError).message).toBe(NOTHING_ANSWERED);
    });

    it('signed out before sending: unauthenticated, and nothing sent', async () => {
        sb.getSession.mockResolvedValue({ data: { session: null } });
        const fetchImpl = vi.fn();
        const error = await checkPracticeItem(request, fetchImpl as unknown as typeof fetch).catch((e: unknown) => e);
        expect((error as CheckError).kind).toBe('unauthenticated');
        expect(fetchImpl).not.toHaveBeenCalled();
    });
});

describe('D65 slice 2 — the DoL practice calls', () => {
    it('startDolPractice names the activity and version, never an item', async () => {
        const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ wireVersion: CHECK_WIRE_VERSION, state: 'nothing_to_practise' })));
        await startDolPractice('act-1', 'ver-1', fetchImpl as unknown as typeof fetch);
        const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
        expect(JSON.parse(init.body as string)).toEqual({
            wireVersion: CHECK_WIRE_VERSION, mode: 'dol-practice-start', activityId: 'act-1', versionId: 'ver-1',
        });
    });

    it('checkPracticeItem with mode dol-practice sends that mode', async () => {
        const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ wireVersion: CHECK_WIRE_VERSION, seq: 1 })));
        await checkPracticeItem({ sessionId: 's1', seq: 1, responses: emptySectionResponses(), mode: 'dol-practice' }, fetchImpl as unknown as typeof fetch);
        const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
        expect(JSON.parse(init.body as string).mode).toBe('dol-practice');
    });
});
