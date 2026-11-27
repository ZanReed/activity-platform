// @vitest-environment jsdom
// The teacher-only error log, client half (review C5 slice 4;
// docs/design/shared-data-loading.md decision 8; migration 0107).
// The SQL half — student refused, ids stripped, repeats, the hourly cap, the
// prune — is verify-0107's. This file proves what the APP sends, and that
// every teacher route installs the reporter while no student route does.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

const db = vi.hoisted(() => ({ rpc: vi.fn(async () => ({ data: { logged: true }, error: null })) }));
vi.mock('../lib/db', () => db);
const who = vi.hoisted(() => ({ id: null as string | null, role: 'teacher', readFails: false }));
vi.mock('../lib/currentUser', () => ({ signedInUserId: async () => who.id }));
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: () => ({
            select: () => ({
                eq: () => ({
                    maybeSingle: async () =>
                        who.readFails
                            ? { data: null, error: { message: 'offline' } }
                            : { data: { role: who.role }, error: null },
                }),
            }),
        }),
    },
}));

import {
    MAX_SENDS,
    RENDER_THREW_EVENT,
    reportClientError,
    resetClientErrorThrottle,
    routePattern,
} from '../lib/clientErrors';
import AppErrorBoundary from '../components/AppErrorBoundary';

const flush = () => new Promise((r) => setTimeout(r, 0));
let n = 0;
/** A fresh user per row: the role is cached per user id. */
function signIn(role: string) {
    who.id = `user-${++n}`;
    who.role = role;
}

beforeEach(() => {
    db.rpc.mockClear();
    resetClientErrorThrottle();
    who.readFails = false;
    history.replaceState(null, '', '/classes/0b6c1f7e-2f0c-4b8e-9a3e-5d1f2c3b4a59/progress');
});
afterEach(cleanup);

describe('reportClientError', () => {
    it('1. a teacher: sends the route PATTERN, the build, the kind, the source and a 300-character message', async () => {
        signIn('teacher');
        await reportClientError({ kind: 'load_failed', source: 'classProgress', error: new Error('x'.repeat(400)) });
        expect(db.rpc).toHaveBeenCalledTimes(1);
        const [fn, args] = db.rpc.mock.calls[0] as unknown as [string, Record<string, unknown>];
        expect(fn).toBe('report_client_error');
        expect(args).toMatchObject({
            p_kind: 'load_failed',
            p_route: '/classes/:id/progress',
            p_source: 'classProgress',
        });
        expect(String(args.p_message)).toHaveLength(300);
        expect(typeof args.p_build).toBe('string');
    });

    it('2. a student sends NOTHING (the telemetry gate), and neither does a signed-out page', async () => {
        signIn('student');
        await reportClientError({ kind: 'unhandled', error: new Error('boom') });
        who.id = null;
        await reportClientError({ kind: 'unhandled', error: new Error('boom') });
        expect(db.rpc).not.toHaveBeenCalled();
    });

    it('3. a failed report is swallowed, never thrown or re-reported', async () => {
        signIn('teacher');
        db.rpc.mockRejectedValueOnce(new Error('offline'));
        await expect(reportClientError({ kind: 'unhandled', error: 'x' })).resolves.toBeUndefined();
        expect(db.rpc).toHaveBeenCalledTimes(1);
    });

    it('4. routePattern drops ids, long numbers, queries and hashes', () => {
        expect(routePattern('/activity/0b6c1f7e-2f0c-4b8e-9a3e-5d1f2c3b4a59/responses')).toBe('/activity/:id/responses');
        expect(routePattern('/classes/12345/plan')).toBe('/classes/:id/plan');
        expect(routePattern('')).toBe('/');
    });

    it('4b. an admin counts as a teacher, as the server says (current_user_is_teacher)', async () => {
        signIn('admin');
        await reportClientError({ kind: 'unhandled', error: 'x' });
        expect(db.rpc).toHaveBeenCalledTimes(1);
    });

    it('4c. the same failure is sent once a minute at most, and a page sends MAX_SENDS at most', async () => {
        signIn('teacher');
        await reportClientError({ kind: 'unhandled', error: 'loop' });
        await reportClientError({ kind: 'unhandled', error: 'loop' });
        expect(db.rpc).toHaveBeenCalledTimes(1);
        for (let i = 0; i < MAX_SENDS + 5; i++) await reportClientError({ kind: 'unhandled', error: `e${i}` });
        expect(db.rpc).toHaveBeenCalledTimes(MAX_SENDS);
    });

    it('4d. a failed role read sends nothing, and is asked again next time', async () => {
        signIn('teacher');
        who.readFails = true;
        await reportClientError({ kind: 'unhandled', error: 'first' });
        expect(db.rpc).not.toHaveBeenCalled();
        who.readFails = false;
        await reportClientError({ kind: 'unhandled', error: 'second' });
        expect(db.rpc).toHaveBeenCalledTimes(1);
    });

    it('4e. browser noise is not a broken screen', async () => {
        signIn('teacher');
        await reportClientError({ kind: 'unhandled', error: 'ResizeObserver loop completed with undelivered notifications.' });
        await reportClientError({ kind: 'unhandled', error: 'Script error.' });
        expect(db.rpc).not.toHaveBeenCalled();
    });
});

describe('the page listeners', () => {
    it('5. a render throw caught by AppErrorBoundary reaches the log as render_threw', async () => {
        signIn('teacher');
        const Boom = () => {
            throw new Error('render broke');
        };
        const quiet = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        render(
            <AppErrorBoundary resetKey="/x">
                <Boom />
            </AppErrorBoundary>,
        );
        await flush();
        quiet.mockRestore();
        expect(db.rpc).toHaveBeenCalledWith(
            'report_client_error',
            expect.objectContaining({ p_kind: 'render_threw', p_message: 'render broke' }),
        );
    });

    it('6. an unhandled rejection reaches the log as unhandled', async () => {
        signIn('teacher');
        window.dispatchEvent(Object.assign(new Event('unhandledrejection'), { reason: new Error('lost promise') }));
        await flush();
        expect(db.rpc).toHaveBeenCalledWith(
            'report_client_error',
            expect.objectContaining({ p_kind: 'unhandled', p_message: 'lost promise' }),
        );
    });

    it("7. the boundary's event name is RENDER_THREW_EVENT (it is retyped there to stay out of the shell)", () => {
        const src = readFileSync(join(__dirname, '../components/AppErrorBoundary.tsx'), 'utf8');
        expect(src).toContain(`new CustomEvent('${RENDER_THREW_EVENT}'`);
        expect(src).not.toMatch(/from '\.\.\/lib\/clientErrors'/);
    });
});

// Every route module is classified: a teacher route installs the reporter (a
// `void import('../lib/clientErrors')`, lazy so the journey caps hold);
// anything else says why it does not. A new route file is red until it is
// placed (P4: a roster is cross-checked, not merely written).
const NOT_TEACHER: Record<string, string> = {
    StudentViewer: 'student shell (decision 3); its own loader and no reporting',
    Home: 'both roles land here; the student shell route (R5 preloaded)',
    JoinClass: 'a student joining a class',
    FactsEntry: 'student practice',
    FactsDemo: 'signed-out demo',
    FactsDemoTeacher: 'signed-out demo of the teacher page; no account to log against',
    DolPractice: 'student practice between DoL tries',
    PhotoHandoff: 'a phone that is not signed in',
    Privacy: 'a static page',
    NotFound: 'a static page',
    Playground: 'dev only',
    DevCalculator: 'dev only',
    DevConfigDrawer: 'dev only',
    DevDataPlot: 'dev only',
    DevFoldableColumns: 'dev only',
    DevGraphQuestion: 'dev only',
    DevNumberLine: 'dev only',
    DevViewer: 'dev only',
};

describe('the route roster', () => {
    const dir = join(__dirname, '../routes');
    const routes = readdirSync(dir)
        .filter((f) => f.endsWith('.tsx'))
        .map((f) => f.replace(/\.tsx$/, ''));

    it.each(routes)('8. %s is classified', (name) => {
        const installs = /^void import\('\.\.\/lib\/clientErrors'\);/m.test(readFileSync(join(dir, `${name}.tsx`), 'utf8'));
        if (name in NOT_TEACHER) expect(installs, `${name} is listed as not a teacher route but installs the reporter`).toBe(false);
        else expect(installs, `${name}: a teacher route must load '../lib/clientErrors' (void import(…)), or be listed in NOT_TEACHER with a reason`).toBe(true);
    });

    it('9. the exempt list names only routes that exist', () => {
        for (const name of Object.keys(NOT_TEACHER)) expect(routes).toContain(name);
    });

    it("10. the answer panel (a teacher route element outside routes/) installs it too", () => {
        expect(readFileSync(join(__dirname, '../progress/AnswerPanel.tsx'), 'utf8')).toMatch(
            /^void import\('\.\.\/lib\/clientErrors'\);/m,
        );
    });
});
