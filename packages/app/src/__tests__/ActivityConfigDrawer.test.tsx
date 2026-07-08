// @vitest-environment jsdom
// =============================================================================
// ActivityConfigDrawer.test.tsx — drawer mounting + section switching
// -----------------------------------------------------------------------------
// The reference-panel editor lives inside the drawer and must MOUNT cleanly
// and STAY mounted while hidden (its onCreate fires once; edits survive
// open/close). Mounting it also compiles the constrained editor's ProseMirror
// schema — the guard that would have caught the graphs-in-columns content
// expression breaking ReferencePanelEditor (fixed 2026-07-08: the column cell
// names interactiveGraph, so the extension must be registered even though the
// panel never offers it).
// =============================================================================

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { createEmptyDocument } from '@activity/schema';
import {
    ConfigButtons,
    ConfigDrawer,
} from '../components/ActivityConfigDrawer';

// Unmount between tests — leftover trees duplicate element ids across
// renders, and jsdom resolves scoped #id queries document-first.
afterEach(cleanup);

const meta = createEmptyDocument({ title: 'Test' }).meta;

function renderDrawer(active: 'settings' | 'print' | 'reference' | 'calculator' | null) {
    return render(
        <MemoryRouter>
            <ConfigDrawer
                active={active}
                onClose={() => {}}
                meta={meta}
                onMetaChange={() => {}}
                panelEditorKey="test"
                panelInitialContent={{
                    type: 'doc',
                    content: [{ type: 'paragraph' }],
                }}
                panelTitle=""
                onPanelTitleChange={() => {}}
                onPanelEditorUpdate={() => {}}
                calculator={undefined}
                onCalculatorChange={() => {}}
            />
        </MemoryRouter>,
    );
}

describe('ConfigDrawer', () => {
    it('mounts every section body while closed (schema compiles; nothing conditional)', () => {
        const { container } = renderDrawer(null);
        // Drawer chrome hidden, but all four bodies are in the DOM.
        expect(container.querySelector('[role="dialog"]')?.className).toBe('hidden');
        expect(container.querySelector('#submission-mode')).not.toBeNull();
        expect(container.querySelector('#print-paper')).not.toBeNull();
        expect(container.querySelector('#reference-title')).not.toBeNull();
        // The reference panel's Tiptap editor mounted (its toolbar rendered) —
        // this line is the constrained-schema compilation guard.
        expect(
            container.querySelector('button[title="Insert a block"]'),
        ).not.toBeNull();
    });

    it('shows exactly the active section', () => {
        const { container } = renderDrawer('print');
        const hidden = (sel: string) =>
            container.querySelector(sel)?.closest('.hidden') !== null;
        expect(hidden('#print-paper')).toBe(false);
        expect(hidden('#submission-mode')).toBe(true);
        expect(hidden('#reference-title')).toBe(true);
    });

    it('labels the drawer after the active section', () => {
        const { container } = renderDrawer('calculator');
        expect(
            container.querySelector('[role="dialog"]')?.getAttribute('aria-label'),
        ).toBe('Calculator');
    });
});

describe('ConfigButtons', () => {
    it('shows the state-cue dots', () => {
        const { container } = render(
            <ConfigButtons
                active={null}
                onToggle={() => {}}
                calculatorEnabled={true}
                referenceHasContent={true}
                settingsWarning={true}
            />,
        );
        expect(
            container.querySelector('[data-config-button="settings"] .bg-amber-500'),
        ).not.toBeNull();
        expect(
            container.querySelector('[data-config-button="reference"] .bg-emerald-500'),
        ).not.toBeNull();
        expect(
            container.querySelector('[data-config-button="calculator"] .bg-emerald-500'),
        ).not.toBeNull();
    });
});
