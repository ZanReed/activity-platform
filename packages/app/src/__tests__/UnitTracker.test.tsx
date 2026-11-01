// @vitest-environment jsdom
// =============================================================================
// UnitTracker.test.tsx — the tracker, bound to rendered output (D67, 0074)
// -----------------------------------------------------------------------------
// What a student reads for each status and next kind (UT-4, UT-8), the fallback
// and the teacher's wording (UT-7), the teacher page's autosave (UT-6), and that
// the teacher's page shows no statuses.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

const api = vi.hoisted(() => ({
    fetchMyTracker: vi.fn(),
    fetchClassTracker: vi.fn(),
    saveTrackerWording: vi.fn(),
}));
vi.mock('../lib/unitTracker', async (orig) => ({
    ...(await orig<typeof import('../lib/unitTracker')>()),
    ...api,
}));

import { StudentTracker, TeacherTracker, TRACKER_COPY } from '../routes/UnitTracker';
import type { StudentTrackerRow, TrackerNext } from '../lib/unitTracker';

const row = (over: Partial<StudentTrackerRow>): StudentTrackerRow => ({
    skill_id: 's.a',
    label: 'Compute a unit rate',
    wording: null,
    letters: [],
    status: 'learning',
    harder: false,
    ...over,
});

function student(units: unknown) {
    api.fetchMyTracker.mockResolvedValue(units);
    return render(
        <MemoryRouter initialEntries={['/progress/k1']}>
            <Routes>
                <Route path="/progress/:classId" element={<StudentTracker />} />
            </Routes>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    api.fetchMyTracker.mockReset();
    api.fetchClassTracker.mockReset();
    api.saveTrackerWording.mockReset();
});
afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe('the student tracker (UT-3, UT-4, UT-7)', () => {
    it('prints the ruled word for every status', async () => {
        student([{
            unit: 'Rates',
            next: null,
            rows: [
                row({ skill_id: 'a', status: 'not_started' }),
                row({ skill_id: 'b', status: 'learning' }),
                row({ skill_id: 'c', status: 'keep_practising' }),
                row({ skill_id: 'd', status: 'passed' }),
            ],
        }]);
        await screen.findByText('Rates');
        const words = [...document.querySelectorAll('[data-status]')].map((n) => n.textContent);
        expect(words).toEqual(['Not started', 'Learning', 'Keep practising', 'Passed']);
    });

    it('fallback = label + letters; teacher wording stands alone; the unlock note shows only when flagged', async () => {
        student([{
            unit: 'Rates',
            next: null,
            rows: [
                row({ skill_id: 'a', label: 'Label A', letters: ['D', 'C', 'P'], harder: true, status: 'passed' }),
                row({ skill_id: 'b', label: 'Label B', letters: ['D'], wording: 'School words' }),
                row({ skill_id: 'c', label: 'Label C' }),
            ],
        }]);
        expect(await screen.findByText(/Label A · D C P/)).toBeTruthy();
        expect(screen.getByText('School words')).toBeTruthy();
        expect(screen.queryByText(/Label B/)).toBeNull();
        expect(screen.getByText('Label C')).toBeTruthy();
        expect(screen.getAllByText('Harder questions are now in your practice')).toHaveLength(1);
    });

    it('an empty class says so; a refusal never shows the failed copy', async () => {
        student([]);
        expect(await screen.findByText(TRACKER_COPY.studentEmpty)).toBeTruthy();
        cleanup();
        api.fetchMyTracker.mockRejectedValue({ code: '42501' });
        render(
            <MemoryRouter initialEntries={['/progress/k1']}>
                <Routes><Route path="/progress/:classId" element={<StudentTracker />} /></Routes>
            </MemoryRouter>,
        );
        expect(await screen.findByText(TRACKER_COPY.refused)).toBeTruthy();
        expect(screen.queryByRole('alert')).toBeNull();
    });
});

describe('the next line (UT-8, UT-12)', () => {
    const cases: [TrackerNext, string, string | null][] = [
        [{ kind: 'check', skill_id: 's.a', activity_id: 'x', title: 'Unit rate' }, 'Your next check: Unit rate', '/a/x'],
        [{ kind: 'practice', skill_id: 's.a', activity_id: 'x', version_id: 'v' }, 'Practise Compute a unit rate first', '/a/x/practice/v'],
        [{ kind: 'retake', skill_id: 's.a', activity_id: 'x' }, 'Try the check again', '/a/x'],
        [{ kind: 'wait', skill_id: 's.a' }, 'Your new version of the check opens on your next practice day.', null],
        [{ kind: 'all_passed' }, 'Everything you’ve been taught here is passed.', null],
        [{ kind: 'up_next', activity_id: 'y', title: 'Graphs' }, 'Next up: Graphs', '/a/y'],
    ];
    it.each(cases)('%j', async (next, text, href) => {
        student([{ unit: 'Rates', next, rows: [row({})] }]);
        const el = await screen.findByText(text);
        if (href) expect(el.closest('a')?.getAttribute('href')).toBe(href);
        else expect(el.closest('a')).toBeNull();
    });

    it('no next line when the server has none', async () => {
        student([{ unit: 'Rates', next: null, rows: [row({})] }]);
        await screen.findByText('Rates');
        expect(document.querySelector('[data-next]')).toBeNull();
    });
});

describe('the teacher page (UT-6)', () => {
    function teacher() {
        api.fetchClassTracker.mockResolvedValue([{
            unit: 'Rates',
            rows: [{ skill_id: 's.a', label: 'Label A', wording: 'Old', letters: ['D'] }],
        }]);
        return render(
            <MemoryRouter initialEntries={['/classes/k1/tracker']}>
                <Routes><Route path="/classes/:classId/tracker" element={<TeacherTracker />} /></Routes>
            </MemoryRouter>,
        );
    }

    it('shows no status, and saves on blur with a visible state; unchanged text writes nothing', async () => {
        teacher();
        const input = await screen.findByLabelText('Label A · D') as HTMLInputElement;
        expect(document.querySelector('[data-status]')).toBeNull();
        expect(input.value).toBe('Old');
        fireEvent.blur(input);
        expect(api.saveTrackerWording).not.toHaveBeenCalled();
        api.saveTrackerWording.mockResolvedValue(undefined);
        fireEvent.change(input, { target: { value: '  New words ' } });
        await act(async () => { fireEvent.blur(input); });
        expect(api.saveTrackerWording).toHaveBeenCalledWith('s.a', 'New words');
        expect(await screen.findByText('Saved')).toBeTruthy();
    });

    it('a failed save says so', async () => {
        teacher();
        const input = await screen.findByLabelText('Label A · D');
        api.saveTrackerWording.mockRejectedValue(new Error('boom'));
        fireEvent.change(input, { target: { value: 'New' } });
        await act(async () => { fireEvent.blur(input); });
        expect(await screen.findByText('Couldn’t save. Try again.')).toBeTruthy();
    });
});
