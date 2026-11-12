// Record/replay matching (Tier 1 playtest, src/dev/playtestTraffic.ts). The
// runtime wrappers are browser-driven; the decisions that make replay right or
// wrong are pure and pinned here.
import { describe, expect, it } from 'vitest';
import {
    createReplayIndex,
    normalizeBody,
    normalizePath,
    sessionStorageKey,
    whoFromAuthorization,
    type RecordedEntry,
} from '../dev/playtestTraffic';
import { supabaseStorageKey } from '../../e2e/helpers/studentSession';
import { STUB_LANE_SUPABASE_URL } from '../../e2e/helpers/e2eOrigins';
import { LOCAL_SUPABASE_URL } from '../../e2e/integration/contract';

const jwt = (payload: object) =>
    `Bearer h.${btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}.s`;

function entry(over: Partial<RecordedEntry>): RecordedEntry {
    return {
        who: 'ava@playtest.example',
        method: 'POST',
        path: '/functions/v1/check-activity',
        body: null,
        status: 200,
        headers: {},
        response: '{}',
        ...over,
    };
}

describe('playtest traffic: identity', () => {
    it('labels a request by the bearer JWT email, anon otherwise', () => {
        expect(whoFromAuthorization(jwt({ email: 'ava@playtest.example' }))).toBe('ava@playtest.example');
        expect(whoFromAuthorization(jwt({ role: 'anon' }))).toBe('anon');
        expect(whoFromAuthorization('Bearer not-a-jwt')).toBe('anon');
        expect(whoFromAuthorization(null)).toBe('anon');
    });

    it('derives the same session key as the e2e harness (itself pinned to a real client)', () => {
        for (const url of [LOCAL_SUPABASE_URL, STUB_LANE_SUPABASE_URL, 'https://abc.supabase.co']) {
            expect(sessionStorageKey(url)).toBe(supabaseStorageKey(url));
        }
        // Record (the local stack) and replay (the dead stub port) share one key, so a recorded
        // session drops straight in.
        expect(sessionStorageKey(LOCAL_SUPABASE_URL)).toBe(sessionStorageKey(STUB_LANE_SUPABASE_URL));
    });
});

describe('playtest traffic: normalization', () => {
    it('sorts query parameters', () => {
        expect(normalizePath('/rest/v1/x?b=2&a=1')).toBe(normalizePath('/rest/v1/x?a=1&b=2'));
    });

    it('sorts body keys and drops the per-attempt idempotency key', () => {
        expect(normalizeBody('{"b":1,"idempotencyKey":"k1","a":{"d":1,"c":2}}')).toBe(
            normalizeBody('{"a":{"c":2,"d":1},"idempotencyKey":"k2","b":1}'),
        );
        expect(normalizeBody('')).toBeNull();
        expect(normalizeBody('plain')).toBe('plain');
    });
});

describe('playtest traffic: replay index', () => {
    it('replays repeated requests in recorded order, then sticks on the last', () => {
        const idx = createReplayIndex([
            entry({ method: 'GET', path: '/rest/v1/rpc/p', response: 'before' }),
            entry({ method: 'GET', path: '/rest/v1/rpc/p', response: 'after' }),
        ]);
        const req = { who: 'ava@playtest.example', method: 'GET', path: '/rest/v1/rpc/p', body: null };
        expect(idx.lookup(req)).toMatchObject({ kind: 'exact', entry: { response: 'before' } });
        expect(idx.lookup(req)).toMatchObject({ kind: 'exact', entry: { response: 'after' } });
        expect(idx.lookup(req)).toMatchObject({ kind: 'exact', entry: { response: 'after' } });
    });

    it('resumes from a saved position, so a reload does not rewind the journey', () => {
        const entries = [
            entry({ method: 'GET', path: '/rest/v1/rpc/p', response: 'before' }),
            entry({ method: 'GET', path: '/rest/v1/rpc/p', response: 'after' }),
        ];
        const req = { who: 'ava@playtest.example', method: 'GET', path: '/rest/v1/rpc/p', body: null };
        const cursor = new Map<string, number>();
        expect(createReplayIndex(entries, cursor).lookup(req)).toMatchObject({ entry: { response: 'before' } });
        // A "reload": a new index over the same saved positions.
        expect(createReplayIndex(entries, cursor).lookup(req)).toMatchObject({ entry: { response: 'after' } });
    });

    it('matches a re-given answer exactly even though the idempotency key is new', () => {
        const idx = createReplayIndex([
            entry({ body: '{"sectionId":"s1","idempotencyKey":"old","responses":{"b":"2.5"}}', response: 'v1' }),
        ]);
        const out = idx.lookup({
            who: 'ava@playtest.example',
            method: 'POST',
            path: '/functions/v1/check-activity',
            body: '{"responses":{"b":"2.5"},"idempotencyKey":"new","sectionId":"s1"}',
        });
        expect(out).toMatchObject({ kind: 'exact', entry: { response: 'v1' } });
    });

    it('an unrecorded answer falls back to the SAME section, not the latest check', () => {
        const idx = createReplayIndex([
            entry({ body: '{"sectionId":"s1","responses":{"b":"2.5"}}', response: 'section-1' }),
            entry({ body: '{"sectionId":"dol","responses":{"b":"4"},"form":1}', response: 'dol' }),
        ]);
        const out = idx.lookup({
            who: 'ava@playtest.example',
            method: 'POST',
            path: '/functions/v1/check-activity',
            body: '{"sectionId":"s1","responses":{"b":"99"}}',
        });
        expect(out).toMatchObject({ kind: 'approximate', entry: { response: 'section-1' } });
    });

    it('never answers one person with another person’s recording', () => {
        const idx = createReplayIndex([entry({ method: 'GET', path: '/rest/v1/rpc/p' })]);
        expect(
            idx.lookup({ who: 'ben@playtest.example', method: 'GET', path: '/rest/v1/rpc/p', body: null }).kind,
        ).toBe('missing');
    });
});
