// @vitest-environment jsdom
// =============================================================================
// HomeProgress.test.tsx — the student Home says what is done (S1/S2, 0059)
// -----------------------------------------------------------------------------
// The walkthrough finding: a student could not tell what they had finished.
// Home now reads my_activity_progress and shows one status per activity. The
// label rule is a table (progressLabel); the Home rows pin the wiring, and the
// degraded path: a failed progress read keeps every activity, with its date.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { progressLabel, type ActivityProgress } from '../lib/classActivities';

const h = vi.hoisted(() => ({
    progress: { current: [] as unknown[] | Error },
}));

vi.mock('../lib/SessionContext', () => ({
    useSession: () => ({
        session: { user: { id: 'stu-1', email: 'stu@school.org', user_metadata: { full_name: 'Mere Paki' } } },
        loading: false,
        role: 'student',
        roleStatus: 'ready',
        retryRole: vi.fn(),
    }),
}));
vi.mock('../lib/studentAuth', () => ({
    signOutEverything: vi.fn(),
    watchIdleSignOut: () => ({ stop: () => {} }),
}));
vi.mock('../lib/classes', () => ({
    listMyClasses: async () => [{ classId: 'c1', name: '7B', joinedAt: '2026-09-01T00:00:00Z', factsCode: null }],
}));
vi.mock('../lib/classActivities', async (importActual) => ({
    ...(await importActual<typeof import('../lib/classActivities')>()),
    listClassActivities: async () => [
        { classId: 'c1', activityId: 'a-done', title: 'Integers 1', addedAt: '2026-10-10T00:00:00Z' },
        { classId: 'c1', activityId: 'a-half', title: 'Integers 2', addedAt: '2026-10-11T00:00:00Z' },
        { classId: 'c1', activityId: 'a-none', title: 'Integers 3', addedAt: '2026-10-12T00:00:00Z' },
    ],
    listMyActivityProgress: async () => {
        if (h.progress.current instanceof Error) throw h.progress.current;
        return h.progress.current;
    },
}));

const { default: Home } = await import('../routes/Home');

const p = (over: Partial<ActivityProgress>): ActivityProgress => ({
    activityId: 'x',
    sectionsTotal: null,
    sectionsChecked: 0,
    earlierChecked: false,
    earlierDone: false,
    feedbackReleased: false,
    ...over,
});

describe('progressLabel — what a student reads (S1, D3, S3)', () => {
    it.each([
        ['nothing checked', p({}), 'Not started'],
        ['some of the current version', p({ sectionsTotal: 4, sectionsChecked: 2 }), 'In progress (2 of 4)'],
        ['all of the current version', p({ sectionsTotal: 4, sectionsChecked: 4 }), 'Done ✓'],
        ['checks with no total (before 0059): never guessed done', p({ sectionsChecked: 4 }), 'Started'],
        ['only an older, finished version', p({ earlierChecked: true, earlierDone: true }), 'Done (earlier version)'],
        ['only an older, unfinished version', p({ earlierChecked: true }), 'Started (earlier version)'],
        ['the current version outranks the older one', p({ sectionsTotal: 3, sectionsChecked: 1, earlierDone: true, earlierChecked: true }), 'In progress (1 of 3)'],
    ])('%s', (_name, input, label) => {
        expect(progressLabel(input)).toBe(label);
    });
});

function renderHome() {
    return render(
        <MemoryRouter>
            <Home />
        </MemoryRouter>,
    );
}

beforeEach(() => {
    h.progress.current = [];
});
afterEach(cleanup);

describe('Home shows a status per activity (S2)', () => {
    it('Done, in progress, not started — and Feedback ready', async () => {
        h.progress.current = [
            { activityId: 'a-done', sectionsTotal: 2, sectionsChecked: 2, earlierChecked: false, earlierDone: false, feedbackReleased: true },
            { activityId: 'a-half', sectionsTotal: 3, sectionsChecked: 1, earlierChecked: false, earlierDone: false, feedbackReleased: false },
            { activityId: 'a-none', sectionsTotal: null, sectionsChecked: 0, earlierChecked: false, earlierDone: false, feedbackReleased: false },
        ];
        renderHome();
        const row = async (title: string) => (await screen.findByRole('link', { name: new RegExp(title) }));
        expect(within(await row('Integers 1')).getByText('Done ✓ · Feedback ready')).toBeInTheDocument();
        expect(within(await row('Integers 2')).getByText('In progress (1 of 3)')).toBeInTheDocument();
        expect(within(await row('Integers 3')).getByText('Not started')).toBeInTheDocument();
    });

    it('a failed progress read keeps every activity, with its date', async () => {
        h.progress.current = new Error('offline');
        renderHome();
        const link = await screen.findByRole('link', { name: /Integers 2/ });
        expect(within(link).getByText(/^Added /)).toBeInTheDocument();
        expect(screen.queryByText('Not started')).toBeNull();
    });
});
