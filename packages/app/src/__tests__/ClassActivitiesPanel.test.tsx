// @vitest-environment jsdom
// =============================================================================
// ClassActivitiesPanel.test.tsx — the teacher "On students' Home" section
// (S9 Drop 2, board frames 3a/3b)
// -----------------------------------------------------------------------------
// The rows the design review made MANDATORY (DR-5: both remove-failure
// paths get RTL rows), plus the refusal copy (DR-9f), the muted dead row
// (DR-7), and the three distinct picker-empty states (DR-9b/d). Copy is
// asserted via the exported constants — the ruled strings, never retyped.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';

const h = vi.hoisted(() => ({
    share: vi.fn(),
    unshare: vi.fn(),
    addMany: vi.fn(),
}));

vi.mock('../lib/classActivities', async (importOriginal) => {
    const real = await importOriginal<typeof import('../lib/classActivities')>();
    return {
        ...real,
        shareActivityToClass: h.share,
        unshareActivityFromClass: h.unshare,
        addActivitiesToClass: h.addMany,
    };
});

import ClassActivitiesPanel, {
    ADD_REFUSED_COPY,
    ALL_ADDED_COPY,
    DEAD_ROW_COPY,
    NONE_PUBLISHED_COPY,
    REMOVE_FAILED_COPY,
    UNDO_FAILED_COPY,
    type TeacherActivitiesData,
} from '../components/ClassActivitiesPanel';

// The outline keys every picker option now carries (assign-to-class A5).
const OPT_KEYS = { course: null, unit: null, source_path: null, updated_at: '2026-10-01T00:00:00Z' };
const CLASS_ID = 'cccccccc-0000-4000-8000-000000000001';
const ACT_ID = 'aaaaaaaa-0000-4000-8000-000000000001';

function data(overrides: Partial<TeacherActivitiesData> = {}): TeacherActivitiesData {
    return {
        status: 'ready',
        rows: [
            {
                classId: CLASS_ID,
                activityId: ACT_ID,
                title: 'Linear equations practice',
                addedAt: new Date().toISOString(),
                published: true,
            },
        ],
        options: [],
        reload: vi.fn(async () => {}),
        ...overrides,
    };
}

beforeEach(() => {
    h.share.mockReset().mockResolvedValue(undefined);
    h.unshare.mockReset().mockResolvedValue(undefined);
});
afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe('remove (DR-5: confirmed, never optimistic)', () => {
    it('FAILURE: the row STAYS and the honest copy renders', async () => {
        h.unshare.mockRejectedValue(new Error('network down'));
        render(<ClassActivitiesPanel classId={CLASS_ID} data={data()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
        await waitFor(() => {
            expect(screen.getByText(REMOVE_FAILED_COPY)).toBeTruthy();
        });
        // The row did NOT swap to an undo-row — remove is confirmed-only.
        expect(screen.getByText('Linear equations practice')).toBeTruthy();
        expect(screen.queryByText(/removed\./)).toBeNull();
    });

    it('SUCCESS: the undo-row appears (role=status) and announces undo availability', async () => {
        const d = data();
        render(<ClassActivitiesPanel classId={CLASS_ID} data={d} />);
        fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
        await waitFor(() => {
            expect(screen.getByText('“Linear equations practice” removed.')).toBeTruthy();
        });
        expect(d.reload).toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Undo' })).toBeTruthy();
        expect(screen.getByText('Undo available.')).toBeTruthy(); // sr-only half
    });

    it('UNDO FAILURE (incl. the unpublished-during-window race): the undo-row persists with honest copy, timer stopped', async () => {
        h.share.mockRejectedValue(new Error('Activity is not published'));
        render(<ClassActivitiesPanel classId={CLASS_ID} data={data()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
        await waitFor(() => screen.getByRole('button', { name: 'Undo' }));
        fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
        await waitFor(() => {
            expect(screen.getByText(UNDO_FAILED_COPY)).toBeTruthy();
        });
        // Never a silent restore failure: the row is still there, Undo gone.
        expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull();
    });
});

describe('add (DR-9)', () => {
    it('REFUSAL (the unpublished race): the honest copy, selection preserved', async () => {
        h.share.mockRejectedValue(new Error('Activity is not published'));
        const d = data({
            rows: [],
            options: [{ id: ACT_ID, title: 'Quiz review', publishedAt: null, ...OPT_KEYS }],
        });
        render(<ClassActivitiesPanel classId={CLASS_ID} data={d} />);
        fireEvent.change(screen.getByRole('combobox'), {
            target: { value: ACT_ID },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Add' }));
        await waitFor(() => {
            expect(screen.getByText(ADD_REFUSED_COPY)).toBeTruthy();
        });
        expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe(ACT_ID);
    });
});

describe('states (DR-7 / DR-9b,d)', () => {
    it('a dead row renders muted with the honest label + Remove (DR-7)', () => {
        const d = data({
            rows: [
                {
                    classId: CLASS_ID,
                    activityId: ACT_ID,
                    title: 'Slope from two points',
                    addedAt: new Date().toISOString(),
                    published: false,
                },
            ],
        });
        render(<ClassActivitiesPanel classId={CLASS_ID} data={d} />);
        expect(screen.getByText(DEAD_ROW_COPY)).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Remove' })).toBeTruthy();
    });

    it('nothing-published and all-added are DISTINCT states', () => {
        const none = render(
            <ClassActivitiesPanel classId={CLASS_ID} data={data({ rows: [], options: [] })} />,
        );
        expect(screen.getByText(NONE_PUBLISHED_COPY)).toBeTruthy();
        none.unmount();
        // all-added: options exist globally but every one is in this class
        render(
            <ClassActivitiesPanel
                classId={CLASS_ID}
                data={data({
                    options: [{ id: ACT_ID, title: 'Linear equations practice', publishedAt: null, ...OPT_KEYS }],
                })}
            />,
        );
        expect(screen.getByText(ALL_ADDED_COPY)).toBeTruthy();
    });

    it('loading carries its OWN selector, never the ready-state markup', () => {
        render(
            <ClassActivitiesPanel
                classId={CLASS_ID}
                data={data({ status: 'loading', rows: [], options: [] })}
            />,
        );
        expect(document.querySelector('[data-panel-loading]')).toBeTruthy();
        expect(screen.queryByText(/On students/)).toBeNull();
    });
});

describe('undo timer (DR-14)', () => {
    it('expires after the window; pausing on hover holds it open', async () => {
        render(<ClassActivitiesPanel classId={CLASS_ID} data={data()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
        await waitFor(() => screen.getByRole('button', { name: 'Undo' }));

        vi.useFakeTimers();
        const row = document.querySelector('[data-undo-row]')!;
        fireEvent.mouseEnter(row);
        act(() => {
            vi.advanceTimersByTime(20_000);
        });
        // Held open well past the window while hovered.
        expect(screen.getByRole('button', { name: 'Undo' })).toBeTruthy();
        fireEvent.mouseLeave(row);
        act(() => {
            vi.advanceTimersByTime(20_000);
        });
        expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull();
    });
});

describe('the picker groups by unit, with "Add whole unit" (assign-to-class A5)', () => {
    const opt = (id: string, title: string, unit: string | null, path: string | null) => ({
        id,
        title,
        publishedAt: null,
        ...OPT_KEYS,
        unit,
        source_path: path,
    });
    // Newest-published-first, as the data layer returns them: the opposite of
    // teaching order, so a picker that kept the fetch order fails here.
    const OPTIONS = [
        opt('i2', 'Integers 2', 'Integers', 'y7/int/02.md'),
        opt('i1', 'Integers 1', 'Integers', 'y7/int/01.md'),
        opt('p1', 'Place value 1', 'Place value', 'y7/pv/01.md'),
        opt('x1', 'Loose sheet', null, null),
    ];

    it('shows units in teaching order, a whole-unit choice for 2+, none for No unit', () => {
        render(<ClassActivitiesPanel classId={CLASS_ID} data={data({ rows: [], options: OPTIONS })} />);
        const groups = [...document.querySelectorAll('optgroup')];
        expect(groups.map((g) => g.label)).toEqual(['Integers', 'Place value', 'No unit']);
        expect([...groups[0]!.querySelectorAll('option')].map((o) => o.textContent)).toEqual([
            'Add whole unit (2)',
            'Integers 1',
            'Integers 2',
        ]);
        expect(groups[1]!.textContent).not.toMatch(/whole unit/);
        expect(groups[2]!.textContent).not.toMatch(/whole unit/);
    });

    it('"Add whole unit" adds the unit in teaching order', async () => {
        h.addMany.mockResolvedValue({ added: ['i2', 'i1'], failed: [], refused: false });
        const d = data({ rows: [], options: OPTIONS });
        render(<ClassActivitiesPanel classId={CLASS_ID} data={d} />);
        const wholeUnit = screen.getByRole('option', { name: 'Add whole unit (2)' }) as HTMLOptionElement;
        fireEvent.change(screen.getByRole('combobox'), { target: { value: wholeUnit.value } });
        fireEvent.click(screen.getByRole('button', { name: 'Add' }));
        await waitFor(() => expect(h.addMany).toHaveBeenCalledWith(CLASS_ID, ['i1', 'i2']));
        expect(d.reload).toHaveBeenCalled();
    });
});
