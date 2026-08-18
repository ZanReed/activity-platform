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
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

// The row-native taxonomy props (0037). Inert defaults: these existing tests
// are about meta, so the taxonomy block is scaffolding here — the taxonomy's
// own behavior is covered in the taxonomy describe block below.
const inertTaxonomy = {
    tags: [],
    onTagsChange: () => {},
    pedagogicalRole: null,
    onPedagogicalRoleChange: () => {},
    tagVocabulary: [],
};

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
                taxonomy={inertTaxonomy}
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
                    taxonomy={inertTaxonomy}
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
            container.querySelector('[data-config-button="settings"] .bg-warning-accent'),
        ).not.toBeNull();
        expect(
            container.querySelector('[data-config-button="reference"] .bg-success-accent'),
        ).not.toBeNull();
        expect(
            container.querySelector('[data-config-button="calculator"] .bg-success-accent'),
        ).not.toBeNull();
    });
});

// =============================================================================
// Row-native taxonomy (0037 / taxonomy R1, R4, R7)
// -----------------------------------------------------------------------------
// course/unit are DOCUMENT fields (they reach the row at publish, stamped by
// publish_activity); tags + pedagogical_role are ROW-native and reach the row
// through the autosave UPDATE. The drawer is where both are authored, so these
// pin that each control writes to the right channel.
// =============================================================================

describe('activity taxonomy controls', () => {
    function renderTaxonomy(
        overrides: Partial<{
            metaOverride: ActivityMeta;
            tags: string[];
            pedagogicalRole: 'lesson' | 'review' | 'practice' | null;
            onMetaChange: (m: ActivityMeta) => void;
            onTagsChange: (t: string[]) => void;
            onPedagogicalRoleChange: (
                r: 'lesson' | 'review' | 'practice' | null,
            ) => void;
        }> = {},
    ) {
        return render(
            <MemoryRouter>
                <ConfigDrawer
                    active="settings"
                    onClose={() => {}}
                    meta={overrides.metaOverride ?? meta}
                    onMetaChange={overrides.onMetaChange ?? (() => {})}
                    panelEditorKey="test-tax"
                    panelInitialContent={{
                        type: 'doc',
                        content: [{ type: 'paragraph' }],
                    }}
                    panelTitle=""
                    onPanelTitleChange={() => {}}
                    onPanelEditorUpdate={() => {}}
                    calculator={undefined}
                    onCalculatorChange={() => {}}
                    taxonomy={{
                        tags: overrides.tags ?? [],
                        onTagsChange: overrides.onTagsChange ?? (() => {}),
                        pedagogicalRole: overrides.pedagogicalRole ?? null,
                        onPedagogicalRoleChange:
                            overrides.onPedagogicalRoleChange ?? (() => {}),
                        tagVocabulary: ['factoring', 'graphing'],
                    }}
                />
            </MemoryRouter>,
        );
    }

    it('edits course through meta, not the row', () => {
        let next: ActivityMeta | null = null;
        const { container } = renderTaxonomy({ onMetaChange: (m) => (next = m) });
        const course =
            container.querySelector<HTMLInputElement>('#activity-course')!;
        expect(course.value).toBe('Algebra II');
        fireEvent.change(course, { target: { value: 'Geometry' } });
        expect(next!.course).toBe('Geometry');
    });

    it('sets unit through meta', () => {
        let next: ActivityMeta | null = null;
        const { container } = renderTaxonomy({ onMetaChange: (m) => (next = m) });
        fireEvent.change(
            container.querySelector<HTMLInputElement>('#activity-unit')!,
            { target: { value: 'Quadratics' } },
        );
        expect(next!.unit).toBe('Quadratics');
    });

    // '' is not "no unit" — the key must be ABSENT, or publish stamps an
    // empty-string facet into the catalog where NULL belongs.
    it('DROPS the unit key entirely when the field is cleared', () => {
        let next: ActivityMeta | null = null;
        const { container } = renderTaxonomy({
            metaOverride: { ...meta, unit: 'Quadratics' },
            onMetaChange: (m) => (next = m),
        });
        fireEvent.change(
            container.querySelector<HTMLInputElement>('#activity-unit')!,
            { target: { value: '   ' } },
        );
        expect(next).not.toBeNull();
        expect('unit' in next!).toBe(false);
    });

    it('selects a pedagogical role through the row channel', () => {
        let next: string | null | undefined;
        const { container } = renderTaxonomy({
            onPedagogicalRoleChange: (r) => (next = r),
        });
        fireEvent.change(
            container.querySelector<HTMLSelectElement>('#pedagogical-role')!,
            { target: { value: 'review' } },
        );
        expect(next).toBe('review');
    });

    it('maps the blank role option back to null (unclassified is legitimate)', () => {
        let next: string | null | undefined = 'lesson';
        const { container } = renderTaxonomy({
            pedagogicalRole: 'lesson',
            onPedagogicalRoleChange: (r) => (next = r),
        });
        fireEvent.change(
            container.querySelector<HTMLSelectElement>('#pedagogical-role')!,
            { target: { value: '' } },
        );
        expect(next).toBeNull();
    });

    it('offers exactly the three red-teamed roles plus Unclassified', () => {
        const { container } = renderTaxonomy();
        const values = Array.from(
            container.querySelectorAll<HTMLOptionElement>(
                '#pedagogical-role option',
            ),
        ).map((o) => o.value);
        expect(values).toEqual(['', 'lesson', 'review', 'practice']);
    });

    it('renders the role legend so a bare badge never carries the taxonomy alone', () => {
        renderTaxonomy({ pedagogicalRole: 'review' });
        expect(screen.getByText(/spaced retrieval/i)).toBeTruthy();
    });

    it('routes tag edits to the row channel, never into meta', () => {
        let tagsNext: string[] | null = null;
        let metaNext: ActivityMeta | null = null;
        renderTaxonomy({
            onTagsChange: (t) => (tagsNext = t),
            onMetaChange: (m) => (metaNext = m),
        });
        const input = screen.getByPlaceholderText('Add a tag…');
        fireEvent.change(input, { target: { value: 'Factoring' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(tagsNext).toEqual(['factoring']);
        expect(metaNext).toBeNull();
    });
});
