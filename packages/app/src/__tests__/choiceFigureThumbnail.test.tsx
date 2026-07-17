// @vitest-environment jsdom
// =============================================================================
// ChoiceFigureThumbnail — the collapsed resting state of an MC choice / matching
// side's figure. Guards: nothing renders without a figure; a built graph renders
// as the kit-free SVG; a valid image renders as an <img>; clicking calls onEdit.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { ChoiceFigureThumbnail } from '../editor/nodeViews/MultipleChoiceView';

afterEach(cleanup);

const axis = {
    xMin: -5,
    xMax: 5,
    yMin: -5,
    yMax: 5,
    xGridStep: 1,
    yGridStep: 1,
    showGrid: true,
    snapToGrid: true,
};

const noop = () => {};

describe('ChoiceFigureThumbnail', () => {
    it('renders nothing when the choice has no figure', () => {
        const { container } = render(
            <ChoiceFigureThumbnail
                choice={{ id: 'c1' }}
                label="choice A"
                disabled={false}
                onEdit={noop}
            />,
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders the graph as a kit-free SVG thumbnail', () => {
        const { container } = render(
            <ChoiceFigureThumbnail
                choice={{
                    id: 'c1',
                    graph: { axis, drawables: [{ kind: 'point', at: [1, 2] }] },
                }}
                label="choice A"
                disabled={false}
                onEdit={noop}
            />,
        );
        expect(container.querySelector('svg')).not.toBeNull();
    });

    it('renders a valid image as an <img>', () => {
        const { container } = render(
            <ChoiceFigureThumbnail
                choice={{ id: 'c1', image: { src: 'https://x.test/a.png', alt: 'A' } }}
                label="choice A"
                disabled={false}
                onEdit={noop}
            />,
        );
        const img = container.querySelector('img');
        expect(img?.getAttribute('src')).toBe('https://x.test/a.png');
    });

    it('calls onEdit when clicked', () => {
        const onEdit = vi.fn();
        const { getByRole } = render(
            <ChoiceFigureThumbnail
                choice={{ id: 'c1', graph: { axis, drawables: [] } }}
                label="choice A"
                disabled={false}
                onEdit={onEdit}
            />,
        );
        fireEvent.click(getByRole('button'));
        expect(onEdit).toHaveBeenCalledTimes(1);
    });
});
