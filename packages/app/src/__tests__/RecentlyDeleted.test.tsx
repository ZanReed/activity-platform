// @vitest-environment jsdom
// =============================================================================
// RecentlyDeleted.test.tsx — the shared "what you deleted" list (G-5 / G-6)
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import RecentlyDeleted from '../components/RecentlyDeleted';

afterEach(cleanup);

const item = (id: string, purgeAfter: string | null) => ({
    id,
    label: `Item ${id}`,
    deletedAt: '2026-11-10T00:00:00Z',
    purgeAfter,
});

describe('RecentlyDeleted', () => {
    it('is absent when nothing was deleted', () => {
        const { container } = render(<RecentlyDeleted items={[]} onRestore={async () => {}} noun="class" />);
        expect(container).toBeEmptyDOMElement();
    });

    it('lists each item with its purge day when there is one, and Restore calls back', async () => {
        const onRestore = vi.fn(async () => {});
        render(<RecentlyDeleted items={[item('a', '2026-12-10T00:00:00Z'), item('b', null)]} onRestore={onRestore} noun="activity" />);
        expect(screen.getByText('Recently deleted (2)')).toBeInTheDocument();
        expect(screen.getByText(/removed for good on/)).toBeInTheDocument();
        expect(screen.getAllByText(/removed for good on/)).toHaveLength(1);
        fireEvent.click(screen.getByRole('button', { name: 'Restore activity Item b' }));
        await waitFor(() => expect(onRestore).toHaveBeenCalledWith('b'));
    });

    it('a failed restore says so on its row and keeps it', async () => {
        render(
            <RecentlyDeleted
                items={[item('a', null)]}
                onRestore={async () => {
                    throw new Error('Class is not restorable');
                }}
                noun="class"
            />,
        );
        fireEvent.click(screen.getByRole('button', { name: 'Restore class Item a' }));
        await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Couldn’t restore: Class is not restorable'));
        expect(screen.getByText('Item a')).toBeInTheDocument();
    });
});
