// @vitest-environment jsdom
// =============================================================================
// DrawableListEditor.segment.test.tsx — the segment row's ARROW checkbox
// (arrowhead Drop 1, ruling 7). A teacher copying a Bank activity must be able
// to see and change a vector's head; and an arrowed segment draws no endpoint
// dots (ruling 3), so the open/closed choices are hidden while it is on.
// =============================================================================

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DrawableListEditor from '../editor/components/DrawableListEditor';
import type { DrawableAttr } from '../editor/extensions/InteractiveGraph';

afterEach(cleanup);

function open(drawables: DrawableAttr[]) {
    const onChange = vi.fn();
    render(<DrawableListEditor drawables={drawables} disabled={false} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Options'));
    return onChange;
}

describe('the segment row', () => {
    it('turns the arrow ON, keeping the rest of the segment', () => {
        const onChange = open([{ kind: 'segment', from: [0, 0], to: [3, 2], style: 'dashed' }]);
        fireEvent.click(screen.getByLabelText('arrow'));
        expect(onChange).toHaveBeenCalledWith([
            { kind: 'segment', from: [0, 0], to: [3, 2], style: 'dashed', arrow: true },
        ]);
    });

    it('turns it OFF by removing the field, and hides open/closed while it is on', () => {
        const onChange = open([{ kind: 'segment', from: [0, 0], to: [3, 2], arrow: true }]);
        expect(screen.queryByLabelText('open start')).toBeNull();
        expect(screen.queryByLabelText('open end')).toBeNull();
        fireEvent.click(screen.getByLabelText('arrow'));
        expect(onChange.mock.calls[0]![0][0]).not.toHaveProperty('arrow', true);
    });

    it('a plain segment still offers open start / open end', () => {
        open([{ kind: 'segment', from: [0, 0], to: [3, 2] }]);
        expect((screen.getByLabelText('arrow') as HTMLInputElement).checked).toBe(false);
        expect(screen.getByLabelText('open start')).toBeTruthy();
        expect(screen.getByLabelText('open end')).toBeTruthy();
    });
});
