// @vitest-environment jsdom
// =============================================================================
// cardButtons.test.tsx — a card's own buttons, where its editor has no bar
// (author ruling 2026-11-27: chart, video and figure are "bar only")
// -----------------------------------------------------------------------------
// In the main editor these cards show no buttons: BlockCommandBarHost registers
// its editor (cardRequests.ts) and the bar carries them (block-command-bar.e2e).
// The reference-panel editor and the definition dialog have NO bar, so a figure
// there would be uneditable if it hid its buttons too. This mounts the real
// reference-panel editor and checks both halves of the switch.
// =============================================================================

import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import type { Editor } from '@tiptap/core';
import ReferencePanelEditor from '../editor/ReferencePanelEditor';
import { registerCommandBar, resetCardRequests } from '../editor/components/cardRequests';
import { createGraphFigureBlock } from '@activity/schema';
import { defaultChartData } from '../editor/extensions/Chart';

afterEach(() => {
    cleanup();
    resetCardRequests();
});

function withFigure() {
    const fresh = createGraphFigureBlock();
    return {
        type: 'doc',
        content: [{ type: 'graphFigure', attrs: { id: fresh.id, axis: fresh.axis, drawables: fresh.drawables } }],
    };
}

describe('a figure card in the reference panel (an editor with no bar)', () => {
    it('shows its own Edit figure and Figure source buttons', async () => {
        const { container, findByRole } = render(<ReferencePanelEditor initialContent={withFigure()} onUpdate={() => {}} />);
        expect(await findByRole('button', { name: 'Edit figure' })).toBeTruthy();
        expect(await findByRole('button', { name: 'Figure source' })).toBeTruthy();
        expect(container.querySelector('.graph-figure-view')).not.toBeNull();
    });

    it('hides them once a bar registers that editor, and shows them again when it goes', async () => {
        const { container, findByRole, queryByRole } = render(
            <ReferencePanelEditor initialContent={withFigure()} onUpdate={() => {}} />,
        );
        await findByRole('button', { name: 'Edit figure' });
        const editor = (container.querySelector('.ProseMirror') as HTMLElement & { editor?: Editor }).editor!;
        let undo = (): void => undefined;
        act(() => {
            undo = registerCommandBar(editor);
        });
        expect(queryByRole('button', { name: 'Edit figure' })).toBeNull();
        expect(queryByRole('button', { name: 'Figure source' })).toBeNull();
        act(() => undo());
        expect(await findByRole('button', { name: 'Edit figure' })).toBeTruthy();
    });
});

describe('chart and video cards in the reference panel keep their own buttons', () => {
    it('a chart (a lazy card) shows Edit chart and Chart source', async () => {
        const doc = { type: 'doc', content: [{ type: 'chart', attrs: { id: 'c1', data: defaultChartData() } }] };
        const { findByRole } = render(<ReferencePanelEditor initialContent={doc} onUpdate={() => {}} />);
        expect(await findByRole('button', { name: 'Edit chart' })).toBeTruthy();
        expect(await findByRole('button', { name: 'Chart source' })).toBeTruthy();
    });

    it('a video whose form was closed shows Edit video', async () => {
        const doc = { type: 'doc', content: [{ type: 'video', attrs: { id: 'v1', data: null } }] };
        const { findByRole } = render(<ReferencePanelEditor initialContent={doc} onUpdate={() => {}} />);
        // A new video (a lazy card) opens into its form; leave it, then the
        // card's own button shows.
        const discard = await findByRole('button', { name: 'Discard unsaved changes' });
        act(() => discard.click());
        expect(await findByRole('button', { name: 'Edit video' })).toBeTruthy();
    });
});
