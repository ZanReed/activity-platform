// @vitest-environment jsdom
// =============================================================================
// ActivityPrint.test.tsx — the teacher print route on the viewer tree (S5.5 T4)
// -----------------------------------------------------------------------------
// The route cannot be driven in a browser without a signed-in teacher, so the
// behaviour that matters is pinned here instead. Four things, in the order they
// would hurt:
//
//  1. SAVING A PRINT SETTING MUST NOT EAT EDITOR WORK (ruling D20A). The old
//     route wrote back the whole document THIS tab loaded, so a teacher with
//     the editor open in another tab could lose that work by nudging a margin
//     here — silently, no error, no trace. The regression pin puts newer
//     content in the database between load and save and asserts it survives.
//
//  2. The rendered document is SANITIZED and SHUFFLED. Components get the same
//     shape a student gets (so an answer cannot reach paper by accident), and
//     an ordering question never prints in authored order (D15A) — which for
//     that block type would be the answer key printed as the worksheet.
//
//  3. The answer key appears only when asked, and disappears again. Both
//     directions, because "it turned on" is the half that gets tested and
//     "it turned off" is the half that ships broken.
//
//  4. Content goes through the upgrade seam before validation (D23C), so the
//     first schema migration does not tell teachers their activity "could not
//     be read".
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { ActivityDocument } from '@activity/schema';
import { authoredFixtureDocument } from '@activity/viewer/fixtures';

const ACTIVITY_ID = 'aaaaaaaa-0000-4000-8000-000000000001';

const h = vi.hoisted(() => ({
    /** What `activities` currently holds. Tests mutate it mid-flight to model a
     *  second tab writing while this page is open. */
    row: { current: null as Record<string, unknown> | null },
    /** Non-null models the activities SELECT failing outright (A12). */
    loadError: { current: null as { message: string } | null },
    version: { current: null as Record<string, unknown> | null },
    /** Every update payload the route sent, in order. */
    updates: [] as Array<Record<string, unknown>>,
    /** The document the container was handed (see the viewer mock). */
    servedDoc: { current: null as unknown },
}));

vi.mock('../lib/supabase', () => {
    const activities = () => ({
        select: () => ({
            eq: () => ({
                is: () => ({
                    maybeSingle: async () => ({
                        data: h.loadError.current ? null : h.row.current,
                        error: h.loadError.current,
                    }),
                }),
            }),
        }),
        update: (payload: Record<string, unknown>) => {
            h.updates.push(payload);
            return { eq: async () => ({ error: null }) };
        },
    });
    const versions = () => ({
        select: () => ({
            eq: () => ({
                single: async () => ({ data: h.version.current, error: null }),
            }),
        }),
    });
    return {
        supabase: {
            from: (table: string) =>
                table === 'activities' ? activities() : versions(),
        },
        supabaseConfigured: true,
    };
});

// The foldable is still the renderer's iframe document until T5; building it in
// jsdom would measure nothing useful and is not what these tests are about.
vi.mock('../lib/foldable', () => ({
    buildFoldableDocument: async () => '<html></html>',
}));

// Capture the document the container is actually handed, while still rendering
// the REAL container. Needed because sanitization is not observable in the DOM:
// components read answers from the answer-key context and never from the block
// (which is D3A working), so an unsanitized document would render identically
// and leak only into memory and types. The assertion therefore has to look at
// the data, not the page.
vi.mock('@activity/viewer', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    const Real = actual.ViewerContainer as (props: unknown) => unknown;
    return {
        ...actual,
        ViewerContainer: (props: { document: unknown }) => {
            h.servedDoc.current = props.document;
            return createElement(Real as never, props as never);
        },
    };
});

const { default: ActivityPrint } = await import('../routes/ActivityPrint');

function authored() {
    // A real authored document, through the real schema — the same fixtures the
    // viewer's own suites use, so this route is exercised against realistic
    // content rather than a hand-made stub.
    return ActivityDocument.parse(authoredFixtureDocument());
}

function renderRoute() {
    return render(
        <MemoryRouter initialEntries={[`/activity/${ACTIVITY_ID}/print`]}>
            <Routes>
                <Route path="/activity/:id/print" element={<ActivityPrint />} />
            </Routes>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    h.updates.length = 0;
    h.row.current = { id: ACTIVITY_ID, title: 'T', draft_content: authored(), current_version_id: null };
    h.loadError.current = null;
    h.version.current = null;
});
afterEach(cleanup);

describe('loading', () => {
    it('renders the worksheet from the draft', async () => {
        renderRoute();
        await waitFor(() =>
            expect(document.querySelector('.viewer')).not.toBeNull(),
        );
        expect(document.querySelector('.viewer')?.getAttribute('data-viewer-mode'))
            .toBe('print');
    });

    it('falls back to the published version when there is no draft', async () => {
        h.row.current = {
            id: ACTIVITY_ID, title: 'T', draft_content: null,
            current_version_id: 'vvvvvvvv-0000-4000-8000-000000000001',
        };
        h.version.current = { content: authored() };

        renderRoute();
        await waitFor(() =>
            expect(document.querySelector('.viewer')).not.toBeNull(),
        );
    });

    it('says not found when the row is invisible (a foreign id reads the same)', async () => {
        h.row.current = null;
        renderRoute();
        expect(await screen.findByText('Activity not found')).toBeInTheDocument();
    });

    it('reports unreadable content instead of rendering a broken sheet', async () => {
        h.row.current = {
            id: ACTIVITY_ID, title: 'T',
            draft_content: { schemaVersion: 1, nope: true },
            current_version_id: null,
        };
        renderRoute();
        expect(
            await screen.findByText("This activity's content could not be read."),
        ).toBeInTheDocument();
    });

    it('goes through the upgrade seam, so unversioned content fails honestly (D23C)', async () => {
        // No schemaVersion at all: the seam rejects it by name rather than the
        // parser rejecting it for some deeper reason.
        h.row.current = {
            id: ACTIVITY_ID, title: 'T',
            draft_content: { meta: {}, sections: [] },
            current_version_id: null,
        };
        renderRoute();
        expect(
            await screen.findByText("This activity's content could not be read."),
        ).toBeInTheDocument();
    });
});

describe('what the components are handed', () => {
    it('hands the container a SANITIZED document, with no answer fields in it', async () => {
        renderRoute();
        await waitFor(() => expect(h.servedDoc.current).not.toBeNull());

        // Data, not DOM. A first version of this test checked the rendered page
        // and could not fail: components read answers from the answer-key
        // context and never from the block, so an unsanitized document renders
        // identically. That is D3A working — and exactly why the leak has to be
        // caught here, before some future component reads a field that should
        // never have been in its props.
        const secrets: string[] = [];
        const scan = (value: unknown, path: string): void => {
            if (Array.isArray(value)) {
                value.forEach((item, i) => scan(item, `${path}[${i}]`));
                return;
            }
            if (value === null || typeof value !== 'object') return;
            for (const [key, child] of Object.entries(value)) {
                // The answer-bearing field names the sanitizer strips: a blank's
                // answer, a choice's correctness, a matching key.
                if (
                    key === 'answer' ||
                    key === 'acceptableAnswers' ||
                    key === 'correct' ||
                    (key === 'key' && typeof child === 'object')
                ) {
                    secrets.push(`${path}.${key}`);
                }
                scan(child, `${path}.${key}`);
            }
        };
        scan(h.servedDoc.current, 'doc');

        expect(
            secrets,
            'answer fields reached the rendered document — the route must ' +
                'sanitize before handing it to the container',
        ).toEqual([]);

        // And nothing is marked, since no answer key was requested.
        expect(document.querySelectorAll('[data-answer-key]')).toHaveLength(0);
    });

    it('never prints an ordering question in its authored order (D15A)', async () => {
        renderRoute();
        await waitFor(() =>
            expect(document.querySelector('.viewer-ordering__list')).not.toBeNull(),
        );

        const printed = Array.from(
            document.querySelectorAll('.viewer-ordering__item'),
        ).map((li) => li.getAttribute('data-item-id'));
        const authoredOrder = (() => {
            const doc = authored();
            for (const section of doc.sections)
                for (const row of section.rows)
                    for (const column of row.columns)
                        for (const block of column.blocks)
                            if (block.type === 'ordering')
                                return block.items.map((item) => item.id);
            return [];
        })();

        expect(printed.length).toBe(authoredOrder.length);
        expect(printed).not.toEqual(authoredOrder);
    });
});

describe('the answer key, both directions', () => {
    it('appears when asked and disappears when unasked', async () => {
        const { container } = renderRoute();
        await waitFor(() =>
            expect(document.querySelector('.viewer')).not.toBeNull(),
        );

        const toggle = screen.getByLabelText(/show answers/i);
        expect(container.querySelectorAll('[data-answer-key]')).toHaveLength(0);

        toggle.click();
        await waitFor(() =>
            expect(
                container.querySelectorAll('[data-answer-key]').length,
            ).toBeGreaterThan(0),
        );

        // The direction that ships broken: turning it back OFF.
        toggle.click();
        await waitFor(() =>
            expect(container.querySelectorAll('[data-answer-key]')).toHaveLength(0),
        );
    });
});

describe('saving a print setting (ruling D20A)', () => {
    it('writes ONLY meta.print, so a concurrent editor edit survives', async () => {
        renderRoute();
        await waitFor(() =>
            expect(document.querySelector('.viewer')).not.toBeNull(),
        );

        // A second tab saves real editor work AFTER this page loaded.
        const edited = authored();
        edited.meta.title = 'Edited in another tab';
        h.row.current = {
            id: ACTIVITY_ID, title: 'T', draft_content: edited, current_version_id: null,
        };

        // Change a print setting here. fireEvent.change rather than a raw
        // dispatch: React tracks a controlled input's value on the node, and a
        // hand-built event slips past its onChange entirely.
        const fontSize = screen.getByLabelText(/body text/i);
        fireEvent.change(fontSize, { target: { value: '13' } });

        await waitFor(() => expect(h.updates.length).toBeGreaterThan(0), {
            timeout: 4000,
        });

        const written = h.updates.at(-1)!.draft_content as {
            meta: { title: string };
        };
        // The other tab's work is still there. Before D20A this assertion
        // failed: the route wrote back the stale document it had loaded.
        expect(written.meta.title).toBe('Edited in another tab');
    });
});

// -----------------------------------------------------------------------------
// A12 (eng-review 2026-08-06): a non-owner NEVER reaches a rendered key.
// -----------------------------------------------------------------------------
// Route-level protection for the answer key is one RLS policy deep
// (s5.5-audit missed-6): RequireAuth checks session only, so a signed-in
// STUDENT can navigate here — what stops them is activities_select_own
// returning no row, after which extractAnswerKey must never have anything to
// run on. Correct design, previously untested at every level: nothing
// asserted the empty/error branches land on their screens rather than a
// rendered key.
describe('non-owner / failed load never renders a key (A12)', () => {
    it('RLS-empty load (the not-my-activity case) → not-found screen, zero key nodes', async () => {
        h.row.current = null; // RLS filters foreign rows: no row, no error
        renderRoute();
        await waitFor(() =>
            expect(screen.getByText('Activity not found')).toBeInTheDocument(),
        );
        expect(document.querySelector('.viewer')).toBeNull();
        expect(document.querySelectorAll('[data-answer-key]')).toHaveLength(0);
    });

    it('failed fetch → error screen, zero key nodes', async () => {
        h.loadError.current = { message: 'permission denied for table activities' };
        renderRoute();
        await waitFor(() =>
            expect(
                screen.getByText(/permission denied for table activities/),
            ).toBeInTheDocument(),
        );
        expect(document.querySelector('.viewer')).toBeNull();
        expect(document.querySelectorAll('[data-answer-key]')).toHaveLength(0);
    });
});
