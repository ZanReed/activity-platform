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
import { cleanup, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { createEmptyDocument, type ActivityMeta } from '@activity/schema';
import {
    ConfigButtons,
    ConfigDrawer,
} from '../components/ActivityConfigDrawer';

// Unmount between tests — leftover trees duplicate element ids across
// renders, and jsdom resolves scoped #id queries document-first.
afterEach(cleanup);

const meta = createEmptyDocument({ title: 'Test' }).meta;

function renderDrawer(
    active: 'settings' | 'reference' | 'calculator' | null,
    onMetaChange: (next: ActivityMeta) => void = () => {},
) {
    return render(
        <MemoryRouter>
            <ConfigDrawer
                active={active}
                onClose={() => {}}
                meta={meta}
                onMetaChange={onMetaChange}
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
        // Drawer chrome hidden, but every section body is in the DOM. (Print
        // layout moved to the Print view route, so it's no longer a section.)
        expect(container.querySelector('[role="dialog"]')?.className).toBe('hidden');
        expect(container.querySelector('#submission-mode')).not.toBeNull();
        expect(container.querySelector('#reference-title')).not.toBeNull();
        // The reference panel's Tiptap editor mounted (its toolbar rendered) —
        // this line is the constrained-schema compilation guard.
        expect(
            container.querySelector('button[title="Insert a block"]'),
        ).not.toBeNull();
    });

    it('shows exactly the active section', () => {
        const { container } = renderDrawer('reference');
        const hidden = (sel: string) =>
            container.querySelector(sel)?.closest('.hidden') !== null;
        expect(hidden('#reference-title')).toBe(false);
        expect(hidden('#submission-mode')).toBe(true);
    });

    it('labels the drawer after the active section', () => {
        const { container } = renderDrawer('calculator');
        expect(
            container.querySelector('[role="dialog"]')?.getAttribute('aria-label'),
        ).toBe('Calculator');
    });
});

describe('Settings — typography (meta.typography)', () => {
    it('renders the font menu and base-size input with the defaults', () => {
        const { container } = renderDrawer('settings');
        const font = container.querySelector<HTMLSelectElement>('#activity-font');
        const size = container.querySelector<HTMLInputElement>(
            '#activity-font-size',
        );
        expect(font?.value).toBe('default');
        expect(size?.value).toBe('16');
        // All five menu fonts offered.
        expect(font?.options.length).toBe(5);
    });

    it('commits a selected font as meta.typography (additive field)', () => {
        let next: ActivityMeta | null = null;
        const { container } = renderDrawer('settings', (m) => (next = m));
        const font = container.querySelector<HTMLSelectElement>('#activity-font')!;
        fireEvent.change(font, { target: { value: 'lexend' } });
        expect(next!.typography).toEqual({ font: 'lexend', fontSize: 16 });
    });

    it('drops the field entirely when both controls are back at the defaults', () => {
        let next: ActivityMeta | null = null;
        render(
            <MemoryRouter>
                <ConfigDrawer
                    active="settings"
                    onClose={() => {}}
                    meta={{
                        ...meta,
                        typography: { font: 'default', fontSize: 18 },
                    }}
                    onMetaChange={(m) => (next = m)}
                    panelEditorKey="test-t"
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
        const size = document.querySelector<HTMLInputElement>(
            '#activity-font-size',
        )!;
        expect(size.value).toBe('18');
        fireEvent.change(size, { target: { value: '16' } });
        // Back to defaults → untouched documents stay structurally identical.
        expect(next!.typography).toBeUndefined();
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
