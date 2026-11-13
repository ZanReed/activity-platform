// @vitest-environment jsdom
// =============================================================================
// C-7: one header across Progress / Responses / Analytics — a way back, and
// tabs between the three and the editor.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

const h = vi.hoisted(() => {
    const maybeSingle = vi.fn(() => Promise.resolve({ data: { title: 'Fractions 2' }, error: null }));
    const from = vi.fn(() => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }));
    return { from };
});
vi.mock('../lib/supabase', () => ({ supabase: { from: h.from } }));

import ActivityResultsHeader from '../components/ActivityResultsHeader';

afterEach(() => {
    cleanup();
    h.from.mockClear();
});

describe('ActivityResultsHeader', () => {
    it('goes back to My activities, names the activity, and links the other three', () => {
        render(
            <MemoryRouter>
                <ActivityResultsHeader activityId="a1" title="Decimals" current="analytics" />
            </MemoryRouter>,
        );
        expect(screen.getByRole('link', { name: '← My activities' })).toHaveAttribute('href', '/activities');
        expect(screen.getByText('Decimals')).toBeInTheDocument();
        const nav = screen.getByRole('navigation', { name: 'This activity' });
        expect(within(nav).getByRole('link', { name: 'Progress' })).toHaveAttribute('href', '/activity/a1/progress');
        expect(within(nav).getByRole('link', { name: 'Responses' })).toHaveAttribute('href', '/activity/a1/responses');
        expect(within(nav).getByRole('link', { name: 'Edit' })).toHaveAttribute('href', '/activity/a1');
        expect(within(nav).queryByRole('link', { name: 'Analytics' })).toBeNull();
        expect(within(nav).getByText('Analytics')).toHaveAttribute('aria-current', 'page');
    });

    it('goes back where it was opened from, when that was a class', () => {
        render(
            <MemoryRouter>
                <ActivityResultsHeader activityId="a1" current="responses" back={{ to: '/classes/c1/progress', label: 'Class progress' }} />
            </MemoryRouter>,
        );
        expect(screen.getByRole('link', { name: '← Class progress' })).toHaveAttribute('href', '/classes/c1/progress');
    });

    it('reads the title itself when the page has none to pass (Responses, Analytics)', async () => {
        render(
            <MemoryRouter>
                <ActivityResultsHeader activityId="a1" current="analytics" />
            </MemoryRouter>,
        );
        expect(await screen.findByText('Fractions 2')).toBeInTheDocument();
        expect(h.from).toHaveBeenCalledWith('activities');
    });

    it('does not fetch when the page owns the title, even while it is loading', () => {
        render(
            <MemoryRouter>
                <ActivityResultsHeader activityId="a1" title={null} current="progress" />
            </MemoryRouter>,
        );
        expect(h.from).not.toHaveBeenCalled();
    });
});
