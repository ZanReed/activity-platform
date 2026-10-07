// @vitest-environment jsdom
// =============================================================================
// Bank.test.tsx — the Activity Bank page (0054; docs/design/activity-bank.md)
// -----------------------------------------------------------------------------
// Bound to what a teacher SEES: rows in the catalogue's teaching order, grouped
// by unit; search removes rows and never reorders them; "Add to my library"
// copies and opens the teacher's OWN copy in the editor; the guide panel shows
// the guide text; a failed add says so. The data layer is mocked at lib/bank
// (its RPCs are proven against the database by scripts/verify-0054.sql).
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';

const h = vi.hoisted(() => ({
    listBank: vi.fn(),
    copyBankActivity: vi.fn(),
    getBankTeacherGuide: vi.fn(),
}));

vi.mock('../lib/bank', () => ({
    BANK_LICENSE: 'CC BY-NC-SA 4.0',
    listBank: h.listBank,
    copyBankActivity: h.copyBankActivity,
    getBankTeacherGuide: h.getBankTeacherGuide,
}));
// The preview pulls in the whole viewer; it has its own reason to exist (print
// mode) documented in its header. Here it only has to be reachable.
vi.mock('../components/BankPreview', () => ({
    default: ({ activityId }: { activityId: string }) => <p>PREVIEW {activityId}</p>,
}));

const { default: Bank } = await import('../routes/Bank');

const entry = (over: Record<string, unknown>) => ({
    id: 'id',
    title: 't',
    description: null,
    course: 'Y7',
    unit: 'Unit',
    tags: [],
    pedagogical_role: 'lesson',
    activity_type: 'worksheet',
    source_path: null,
    has_guide: true,
    version_num: 1,
    published_at: '2026-10-07T00:00:00Z',
    ...over,
});

const ROWS = [
    entry({ id: 'a1', title: 'Naming Triangles', unit: 'Triangles and Angle Sums', tags: ['geometry'] }),
    entry({ id: 'a2', title: 'Angle Sums', unit: 'Triangles and Angle Sums', has_guide: false }),
    entry({ id: 'b1', title: 'Unit Rates', unit: 'Rates and Proportional Relationships' }),
];

function EditorStub() {
    const loc = useLocation();
    return <p>EDITOR {loc.pathname} {(loc.state as { fromBank?: string } | null)?.fromBank}</p>;
}

function renderBank() {
    return render(
        <MemoryRouter initialEntries={['/bank']}>
            <Routes>
                <Route path="/bank" element={<Bank />} />
                <Route path="/activity/:id" element={<EditorStub />} />
            </Routes>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    h.listBank.mockResolvedValue(ROWS);
    h.copyBankActivity.mockReset();
    h.getBankTeacherGuide.mockReset();
});
afterEach(cleanup);

describe('Activity Bank page', () => {
    it('lists the entries in teaching order, grouped by unit', async () => {
        renderBank();
        await screen.findByText('Naming Triangles');
        const sections = screen.getAllByRole('region');
        expect(sections.map((s) => s.getAttribute('aria-label'))).toEqual([
            'Y7 — Triangles and Angle Sums',
            'Y7 — Rates and Proportional Relationships',
        ]);
        const titles = [...document.querySelectorAll('[data-bank-entry]')].map((li) =>
            li.getAttribute('data-bank-entry'),
        );
        expect(titles).toEqual(['a1', 'a2', 'b1']);
        expect(screen.getByText(/CC BY-NC-SA 4.0/)).toBeInTheDocument();
    });

    it('search removes rows (titles, units, tags) and never reorders them', async () => {
        renderBank();
        await screen.findByText('Naming Triangles');
        const search = screen.getByLabelText('Search the Activity Bank');
        fireEvent.change(search, { target: { value: 'geometry' } });
        expect(screen.getByText('Naming Triangles')).toBeInTheDocument();
        expect(screen.queryByText('Angle Sums')).toBeNull();
        fireEvent.change(search, { target: { value: 'rates' } });
        expect(screen.getByText('Unit Rates')).toBeInTheDocument();
        expect(screen.queryByText('Naming Triangles')).toBeNull();
        fireEvent.change(search, { target: { value: 'zzz' } });
        expect(screen.getByText('No activities match.')).toBeInTheDocument();
    });

    it('"Add to my library" copies and opens the teacher\'s own copy', async () => {
        h.copyBankActivity.mockResolvedValue('new-copy-id');
        renderBank();
        await screen.findByText('Naming Triangles');
        fireEvent.click(screen.getAllByRole('button', { name: 'Add to my library' })[0]!);
        expect(await screen.findByText(/EDITOR \/activity\/new-copy-id Naming Triangles/)).toBeInTheDocument();
        expect(h.copyBankActivity).toHaveBeenCalledWith('a1');
    });

    it('a failed add says so and stays on the page', async () => {
        h.copyBankActivity.mockRejectedValue(new Error('That activity is not in the Activity Bank'));
        renderBank();
        await screen.findByText('Naming Triangles');
        fireEvent.click(screen.getAllByRole('button', { name: 'Add to my library' })[1]!);
        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Couldn’t add “Angle Sums”: That activity is not in the Activity Bank',
        );
    });

    it('offers the guide only where there is one, and shows its text', async () => {
        h.getBankTeacherGuide.mockResolvedValue({
            blocks: [
                {
                    id: '11111111-1111-4111-8111-111111111111',
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'GUIDE_TEXT watch for', marks: [] }],
                },
            ],
        });
        renderBank();
        await screen.findByText('Naming Triangles');
        const guideButtons = screen.getAllByRole('button', { name: 'Teacher guide' });
        expect(guideButtons).toHaveLength(2); // a2 has no guide
        fireEvent.click(guideButtons[0]!);
        await waitFor(() =>
            expect(document.querySelector('[data-bank-guide]')?.textContent).toContain('GUIDE_TEXT'),
        );
        expect(h.getBankTeacherGuide).toHaveBeenCalledWith('a1');
    });

    it('opens the preview for the row asked', async () => {
        renderBank();
        await screen.findByText('Unit Rates');
        fireEvent.click(screen.getAllByRole('button', { name: 'Preview' })[2]!);
        expect(await screen.findByText('PREVIEW b1')).toBeInTheDocument();
    });

    it('shows the server\'s refusal (non-teachers) and the empty Bank plainly', async () => {
        h.listBank.mockRejectedValueOnce(new Error('The Activity Bank is for teachers'));
        renderBank();
        expect(await screen.findByRole('alert')).toHaveTextContent('The Activity Bank is for teachers');
        cleanup();
        h.listBank.mockResolvedValueOnce([]);
        renderBank();
        expect(await screen.findByText('Nothing is in the Activity Bank yet.')).toBeInTheDocument();
    });
});
