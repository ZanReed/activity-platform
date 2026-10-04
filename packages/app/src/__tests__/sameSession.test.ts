// The session object React holds changes identity only when the user or the
// token does (SessionContext.tsx). auth-js re-announces the stored session on
// every return to the tab; treating that as a new session reloaded the student
// viewer under a working student (author finding 2026-10-04). The browser row
// is e2e/student/tab-return.e2e.ts; this pins the comparison itself.
import { describe, expect, it } from 'vitest';
import type { Session } from '@supabase/supabase-js';
import { sameSession } from '../lib/SessionContext';

const s = (userId: string, token: string): Session =>
    ({ access_token: token, user: { id: userId } }) as unknown as Session;

describe('sameSession', () => {
    it('a re-announced session (same user, same token, new object) is the same', () => {
        expect(sameSession(s('u1', 't1'), s('u1', 't1'))).toBe(true);
    });
    it('a refreshed token is a different session', () => {
        expect(sameSession(s('u1', 't1'), s('u1', 't2'))).toBe(false);
    });
    it('a different user is a different session', () => {
        expect(sameSession(s('u1', 't1'), s('u2', 't1'))).toBe(false);
    });
    it('signed out versus signed in differ; signed out twice is the same', () => {
        expect(sameSession(null, s('u1', 't1'))).toBe(false);
        expect(sameSession(s('u1', 't1'), null)).toBe(false);
        expect(sameSession(null, null)).toBe(true);
    });
});
