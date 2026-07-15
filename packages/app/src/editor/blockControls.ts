import type { ReactNode } from 'react';
import type { Editor } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import type { LucideIcon } from 'lucide-react';
import { renderRubricField } from './components/RubricEditor';
import {
    Pencil,
    Copy,
    Trash2,
    MessageSquareText,
    ListChecks,
    Waypoints,
    ListOrdered,
    Image as ImageIcon,
    Captions,
} from 'lucide-react';
import { openMathFieldMeta } from './extensions/MathFocus';
import { OPEN_IMAGE_POPOVER, type ImagePopoverFocus } from './extensions/Image';

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

// --- Advanced fields (stage 4 drawer) -------------------------------------
// A typed setting the drawer renders as a form control. Each field is pure
// data: it reads its current value from the selected node and writes back via
// an editor command (never a direct DOM mutation). Simple field kinds only —
// complex sub-editors (rubric, per-choice figures, axis config) and image
// sizing are their own custom UIs, migrated in a later pass.

interface AdvancedFieldBase {
    /** Field label shown in the drawer. */
    label: string;
    /** Optional one-line helper text under the control. */
    help?: string;
}

export type AdvancedField =
    | (AdvancedFieldBase & {
          kind: 'toggle';
          get: (node: PMNode) => boolean;
          set: (editor: Editor, pos: number, value: boolean) => void;
      })
    | (AdvancedFieldBase & {
          kind: 'number';
          min?: number;
          max?: number;
          step?: number;
          placeholder?: string;
          get: (node: PMNode) => number | null;
          set: (editor: Editor, pos: number, value: number | null) => void;
      })
    | (AdvancedFieldBase & {
          kind: 'text';
          placeholder?: string;
          get: (node: PMNode) => string;
          set: (editor: Editor, pos: number, value: string) => void;
      })
    | (AdvancedFieldBase & {
          kind: 'select';
          options: ReadonlyArray<{ label: string; value: string }>;
          get: (node: PMNode) => string;
          set: (editor: Editor, pos: number, value: string) => void;
      })
    // A complex sub-editor the simple field kinds can't express (rubric builder,
    // per-choice figures, axis config …). Renders its own React UI from the live
    // node; `label` heads the section. The drawer only lays it out.
    | (AdvancedFieldBase & {
          kind: 'custom';
          render: (ctx: {
              editor: Editor;
              node: PMNode;
              pos: number;
          }) => ReactNode;
      });

/**
 * A named cluster of Advanced fields, ordered most-common-first within the
 * drawer (so opening Advanced feels like "a little more", not a wall).
 */
export interface AdvancedGroup {
    group: string;
    fields: AdvancedField[];
}

// Transaction-meta signal: the quick-bar's ⚙ selects the block AND asks the
// command-bar host to open straight into settings mode (one click to settings,
// not "select then click the gear"). Read in the host's transaction listener.
export const OPEN_BLOCK_SETTINGS = 'openBlockSettings';

/** Write a node attribute at `pos` — the common setter for attr-backed fields. */
export function setNodeAttr(
    editor: Editor,
    pos: number,
    key: string,
    value: unknown,
): void {
    editor
        .chain()
        .command(({ tr }) => {
            tr.setNodeAttribute(pos, key, value);
            return true;
        })
        .run();
}

/** The full control surface for one block type. */
export interface BlockControls {
    /**
     * Surfaced actions (accent buttons). The design caps this at 2 by default,
     * but it is a default not a hard rule — a few blocks earn a third. Validate
     * per block with docs/design/ux-lens.md at extraction time.
     */
    primary: ControlEntry[];
    /**
     * The common 1-2 settings, shown as BUTTONS in the bar's settings mode
     * (⚙ Settings). A toggle flips in place; a text/number/select button opens
     * its single field in the drawer below. Everything multi-field or complex
     * goes in `advanced` instead.
     */
    simple?: AdvancedField[];
    /** Tucked technical controls, grouped — the "Advanced" drawer. Optional. */
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

/** The student-answer placeholder, shared by the free-text blocks' Advanced. */
const placeholderField: AdvancedField = {
    kind: 'text',
    label: 'Placeholder',
    placeholder: 'e.g. Write 2–3 sentences…',
    get: (node) => (node.attrs.placeholder as string) ?? '',
    set: (editor, pos, value) => setNodeAttr(editor, pos, 'placeholder', value),
};

/** The rubric builder (custom sub-editor), shared by the graded free-text blocks. */
const rubricField: AdvancedField = {
    kind: 'custom',
    label: 'Rubric',
    render: renderRubricField,
};

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
        // A single toggle — flips in place from the bar; no Advanced drawer.
        simple: [
            {
                kind: 'toggle',
                label: 'Show step labels',
                help: 'Letter each faded step (a), (b), … for reference.',
                get: (node) => node.attrs.showStepLabels !== false,
                set: (editor, pos, value) =>
                    setNodeAttr(editor, pos, 'showStepLabels', value),
            },
        ],
    },
    selfExplanation: {
        primary: [editPrimary('Prompt', MessageSquareText)],
        // Placeholder is the only setting → a simple button, no Advanced drawer.
        simple: [placeholderField],
    },
    // short_answer + essay share FreeResponseView. Placeholder is simple; the
    // rubric builder (a complex sub-editor) lives in Advanced.
    shortAnswer: {
        primary: [editPrimary('Prompt', MessageSquareText)],
        simple: [placeholderField],
        advanced: [{ group: 'Grading', fields: [rubricField] }],
    },
    essay: {
        primary: [editPrimary('Prompt', MessageSquareText)],
        simple: [placeholderField],
        advanced: [
            {
                group: 'Response',
                fields: [
                    {
                        kind: 'number',
                        label: 'Min words',
                        min: 1,
                        placeholder: '—',
                        get: (node) =>
                            typeof node.attrs.wordMin === 'number'
                                ? (node.attrs.wordMin as number)
                                : null,
                        set: (editor, pos, value) =>
                            setNodeAttr(editor, pos, 'wordMin', value),
                    },
                    {
                        kind: 'number',
                        label: 'Max words',
                        min: 1,
                        placeholder: '—',
                        get: (node) =>
                            typeof node.attrs.wordMax === 'number'
                                ? (node.attrs.wordMax as number)
                                : null,
                        set: (editor, pos, value) =>
                            setNodeAttr(editor, pos, 'wordMax', value),
                    },
                ],
            },
            { group: 'Grading', fields: [rubricField] },
        ],
    },

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

    // Batch 3 — the blocks with an existing selection-driven popover host.
    // fill_in_blank has no conflict (its BlankPopoverHost is CHIP-level, a
    // different selection than the block), so it just enters edit to author
    // {{blanks}}. image DOES conflict (atom → same selection fires both), so
    // the bar becomes the single affordance: ImagePopoverHost no longer
    // auto-opens on selection; these primaries request it via a transaction
    // meta, focused on the field each names.
    fillInBlank: { primary: [editPrimary('Edit')] },
    image: {
        primary: [
            {
                label: 'Replace',
                icon: ImageIcon,
                onActivate: (editor) => requestImagePopover(editor, 'source'),
            },
            {
                label: 'Caption',
                icon: Captions,
                onActivate: (editor) => requestImagePopover(editor, 'caption'),
            },
        ],
    },
};

/** Ask ImagePopoverHost to open the image edit popover, focused on `focus`. */
function requestImagePopover(editor: Editor, focus: ImagePopoverFocus): void {
    editor.view.dispatch(
        editor.state.tr.setMeta(OPEN_IMAGE_POPOVER, { focus }),
    );
}

/** The descriptor for a node type, or null when the type has no controls. */
export function controlsFor(typeName: string): BlockControls | null {
    return blockControlsRegistry[typeName] ?? null;
}
