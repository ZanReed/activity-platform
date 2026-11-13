// @vitest-environment jsdom
// =============================================================================
// D-7 (ui-review-group-d.md): the Bank preview names a misconception by its
// description, not its raw id; the id stays on hover.
// =============================================================================

import { afterEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MistakeList } from '../components/BankItemPreview';

afterEach(cleanup);

const lines = [
    { answer: '24', mistakes: [{ match: 'add', value: '10', misconception: 'mis.area.adds-sides' }] },
    { answer: '6', mistakes: [{ match: 'x', value: '5', misconception: 'mis.unmirrored' }] },
];

describe('MistakeList', () => {
    it('shows the description, keeps the id on hover, and falls back to the id', () => {
        render(<MistakeList lines={lines} misconceptionText={new Map([['mis.area.adds-sides', 'Adds the side lengths for area']])} />);
        const named = screen.getByText(/Adds the side lengths for area/);
        expect(named).toHaveAttribute('title', 'mis.area.adds-sides');
        expect(screen.queryByText(/mis\.area\.adds-sides/)).toBeNull();
        expect(screen.getByText(/mis\.unmirrored/)).toBeInTheDocument();
    });

    it('renders nothing when the sample has no mistakes', () => {
        const { container } = render(<MistakeList lines={[{ answer: '1', mistakes: [] }]} misconceptionText={new Map()} />);
        expect(container).toBeEmptyDOMElement();
    });
});
