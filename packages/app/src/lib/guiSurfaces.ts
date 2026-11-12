// ============================================================================
// guiSurfaces — where a teacher INSERTS, EDITS and REMOVES each capability in
// the app (author ruling 2026-11-12: every feature gets a GUI method; see
// CLAUDE.md → Working style → "EVERY FEATURE SHIPS WITH A GUI").
//
// One row per capability in capabilityFacts' JOIN, and nothing else: a
// capability added there without a row here fails guiSurfaces.test.ts. Each row
// is exactly one of:
//   slash   — the slash-menu / Insert-menu title that adds it (checked against
//             slashMenuItems; the block's own NodeView is its edit + remove).
//   file    — a control reached from an existing block or the toolbar, named by
//             a source file and a string that must appear in it (the control).
//   gap     — NO GUI yet. The value is the capability id, and TODOS.md must
//             carry a heading "GUI gap — `<id>`" with its trigger, so a gap is
//             always tracked, never only known (P8).
//   exempt  — no GUI is the right answer. The reason must be written here.
//
// A read-only display is NOT a GUI under the rule (decision 3). Data the
// curriculum side owns and this repo only mirrors (banks, glossary, hook pools,
// fact settings) is exempt from editing, but not from being visible (decision 1).
//
// This file is deliberately NOT part of docs/capability-facts.json: the GUI is
// a platform fact the curriculum side never gates on, so changing a row here
// must not force a pin bump on their repo.
// ============================================================================

import type { JOIN } from './capabilityFacts';

export type GuiSurface =
    | { slash: string }
    | { file: string; marker: string }
    | { gap: string }
    | { exempt: string };

/** Paths in `file` rows are relative to packages/app/src. */
export const GUI_SURFACES: Record<keyof typeof JOIN, GuiSurface> = {
    fill_blank: { slash: 'Fill in the blank' },
    gap_equation: { file: 'editor/nodeViews/MathPromptControls.tsx', marker: 'in-equation gaps' },
    definition: { file: 'editor/Toolbar.tsx', marker: 'setDefinition()' },
    graph: { slash: 'Interactive graph' },
    draggable_curve: { file: 'editor/nodeViews/InteractiveGraphView.tsx', marker: '<option value="transform_curve">' },
    // A typed answer formula is routed to its family (cubic and quartic included)
    // by graph-kit's formula parser.
    graded_polynomial: { file: 'editor/nodeViews/InteractiveGraphView.tsx', marker: 'routeCurveFormula' },
    draw_vector: { file: 'editor/nodeViews/InteractiveGraphView.tsx', marker: '<option value="plot_vector">' },
    numberline: { slash: 'Number line' },
    dataplot: { slash: 'Data plot' },
    mc: { slash: 'Multiple choice' },
    match: { slash: 'Matching' },
    nway_correspondence: { slash: 'Correspondence' },
    order: { slash: 'Ordering' },
    worked: { slash: 'Worked example' },
    faded: { slash: 'Faded worked example' },
    objectives: { slash: 'Learning objectives' },
    explain: { slash: 'Self-explanation' },
    shortanswer: { slash: 'Short answer' },
    essay: { slash: 'Essay' },
    columns: { slash: '2 columns' },
    table: { slash: 'Table' },
    callout: { slash: 'Callout' },
    reference: { file: 'editor/ReferencePanelEditor.tsx', marker: 'ReferencePanelEditor' },
    figure: { slash: 'Graph figure' },
    chart: { slash: 'Chart' },
    // D64 amendment 2026-11-12 (lifted VP-10): the card's form edits it.
    video: { slash: 'Video' },
    // The settings drawer lists the variables read-only; nothing adds or edits one.
    seeded_data: { gap: 'seeded_data' },
    // SectionBreak carries the `dol` attr but no control sets or clears it.
    dol_retake: { gap: 'dol_retake' },
    practice_bank: {
        exempt: 'a bank is a curriculum-owned file kind mirrored one way (D43, PB-11); teachers see it through the Bank preview, and editing it here would fork the curriculum side\'s source',
    },
};
