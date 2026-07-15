import type { Editor } from '@tiptap/core';
import type { LucideIcon } from 'lucide-react';
import {
    Pencil,
    Copy,
    Trash2,
    MessageSquareText,
    Tags,
    ListChecks,
    Waypoints,
    ListOrdered,
} from 'lucide-react';
import { openMathFieldMeta } from './extensions/MathFocus';

// ============================================================================
// blockControls — the control-descriptor registry for the docked command bar.
// ----------------------------------------------------------------------------
// The spine of the Notion-hybrid editor (slice 6). Each block type declares its
// selection-state controls AS DATA here; a single root host
// (BlockCommandBarHost) reads the descriptor for the CURRENTLY selected block's
// type and renders the bar. No per-block mounting — that reintroduces the
// Stage-13.5 reconciliation hazard (see BlankPopoverHost's header). Adding a
// block type = add one entry, exactly like slashMenuItems.ts (the same
// "add-a-block-in-one-place" discipline).
//
// A descriptor splits controls two ways, per the design's two-tier model:
//   - primary:  the 1-2 actions a teacher reaches for constantly, shown as
//               accent buttons on the bar.
//   - advanced: everything technical, grouped + ordered most-common-first,
//               opened from a `⌄ Advanced` disclosure (the drawer itself is a
//               later stage — stage 0 only carries the data + a stub trigger).
//
// STAGE 0 SCOPE: this proves the descriptor -> host pipeline on THREE simple
// blocks (paragraph/heading generic, math_block with a real primary). The full
// ~20-block inventory is extracted in stage 3. `advanced` groups are typed here
// but not yet rendered — the field shape is fixed now so stage 4 is pure fill.
// ============================================================================

/** A single actionable control (a bar button, or an Advanced-group entry). */
export interface ControlEntry {
    /** Human label — the button text and the accessible name. */
    label: string;
    /** lucide icon shown alongside the label. */
    icon: LucideIcon;
    /**
     * Run the control. `pos` is the document position of the selected block
     * (the NodeSelection's `from`), so the handler can target it precisely.
     * Handlers call into existing editor commands — they never mutate the DOM.
     */
    onActivate: (editor: Editor, pos: number) => void;
}

/**
 * A named cluster of Advanced controls, ordered most-common-first within the
 * drawer. Stage 0 defines the shape; stage 4 renders it.
 */
export interface AdvancedGroup {
    group: string;
    entries: ControlEntry[];
}

/** The full control surface for one block type. */
export interface BlockControls {
    /**
     * Surfaced actions (accent buttons). The design caps this at 2 by default,
     * but it is a default not a hard rule — a few blocks earn a third. Validate
     * per block with docs/design/ux-lens.md at extraction time.
     */
    primary: ControlEntry[];
    /** Tucked technical controls, grouped. Optional — many blocks have none. */
    advanced?: AdvancedGroup[];
}

// --- Universal actions ----------------------------------------------------
// Every block gets these, rendered by the host AFTER the block-specific
// primaries. They are NOT part of any descriptor's `primary` (a block's primary
// is its own 1-2 actions). Move (the gutter grip) is a later stage.

function duplicateBlock(editor: Editor, pos: number): void {
    const node = editor.state.doc.nodeAt(pos);
    if (!node) return;
    editor
        .chain()
        .insertContentAt(pos + node.nodeSize, node.toJSON())
        .run();
}

function deleteBlock(editor: Editor, pos: number): void {
    const node = editor.state.doc.nodeAt(pos);
    if (!node) return;
    editor
        .chain()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .run();
}

/** Actions the host appends to every block's command bar. */
export const universalActions: ReadonlyArray<ControlEntry> = [
    { label: 'Duplicate', icon: Copy, onActivate: duplicateBlock },
    { label: 'Delete', icon: Trash2, onActivate: deleteBlock },
];

// --- Shared primaries -----------------------------------------------------

/**
 * Enter Edit from the Select state: place the caret inside the block's editable
 * content (the four-state model's Select → Edit transition). ProseMirror snaps
 * `pos + 1` to the nearest valid text position inside the node.
 */
function enterEdit(editor: Editor, pos: number): void {
    editor.chain().focus().setTextSelection(pos + 1).run();
}

/** An "enter the block's content" primary — the common case for content blocks. */
function editPrimary(label = 'Edit', icon: LucideIcon = Pencil): ControlEntry {
    return { label, icon, onActivate: enterEdit };
}

// math_block: "Edit" opens the MathLive field (mode 'all' selects the whole
// formula so the first keystroke replaces) — the same handoff the insert uses.
const mathBlockControls: BlockControls = {
    primary: [
        {
            label: 'Edit',
            icon: Pencil,
            onActivate: (editor, pos) => {
                editor.view.dispatch(
                    editor.state.tr.setMeta(...openMathFieldMeta(pos, 'all')),
                );
            },
        },
    ],
    // width / align exist as attrs but have no UI yet — Advanced, stage 4.
};

// ============================================================================
// The registry, keyed by ProseMirror node-type name. Adding a block type =
// one entry here (+ its NodeView/extension). controlsFor is the host's lookup.
// Plain text blocks (paragraph/heading) have no block-specific primary — their
// bar is just the universal actions.
// ============================================================================

export const blockControlsRegistry: Readonly<Record<string, BlockControls>> = {
    paragraph: { primary: [] },
    heading: { primary: [] },
    mathBlock: mathBlockControls,

    // Batch 1 — instructional + free-text content blocks. Their primary is the
    // Select → Edit transition (enter the editable content). Advanced fields
    // (placeholder, step labels) are the stage-4 drawer's job.
    learningObjectives: { primary: [editPrimary()] },
    workedExample: { primary: [editPrimary()] },
    fadedWorkedExample: {
        primary: [editPrimary()],
        advanced: [
            {
                group: 'Display',
                entries: [
                    {
                        label: 'Toggle step labels',
                        icon: Tags,
                        onActivate: (editor, pos) => {
                            const node = editor.state.doc.nodeAt(pos);
                            if (!node) return;
                            editor
                                .chain()
                                .focus()
                                .command(({ tr }) => {
                                    tr.setNodeAttribute(
                                        pos,
                                        'showStepLabels',
                                        node.attrs.showStepLabels === false,
                                    );
                                    return true;
                                })
                                .run();
                        },
                    },
                ],
            },
        ],
    },
    selfExplanation: { primary: [editPrimary('Prompt', MessageSquareText)] },

    // Batch 2 — the question family. All inline-edited (editable prompt), no
    // popover host, so the primary is enterEdit labelled per the block's nature.
    // The graph trio's second primary (Answer / Data) and every block's rich
    // Advanced (tolerance, confidence, skills, per-choice figures, chart type,
    // axis config, …) are the stage-4 drawer's job.
    multipleChoice: { primary: [editPrimary('Choices', ListChecks)] },
    matching: { primary: [editPrimary('Pairs', Waypoints)] },
    ordering: { primary: [editPrimary('Items', ListOrdered)] },
    interactiveGraph: { primary: [editPrimary()] },
    numberLine: { primary: [editPrimary()] },
    dataPlot: { primary: [editPrimary()] },
};

/** The descriptor for a node type, or null when the type has no controls. */
export function controlsFor(typeName: string): BlockControls | null {
    return blockControlsRegistry[typeName] ?? null;
}
