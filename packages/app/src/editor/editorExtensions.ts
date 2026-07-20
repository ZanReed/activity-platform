// =============================================================================
// editorExtensions.ts — the main editor's Tiptap extension list
// -----------------------------------------------------------------------------
// Behavior-preserving lift out of Editor.tsx (the blankPopoverLogic pattern):
// the list lives here so tests can build the REAL ProseMirror schema via
// @tiptap/core's getSchema() — see __tests__/blockTypeGuards.test.ts, which
// guards that every schema-legal column-cell block is actually insertable in a
// column cell. Editor.tsx remains the only mounter; nothing here touches React.
//
// This is the MAIN editor's list. ReferencePanelEditor keeps its own
// deliberately constrained list (no sections, no blank authoring) — don't merge
// them.
// =============================================================================

import type { Extensions } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Doc } from './extensions/Doc';
import { MathInline } from './extensions/MathInline';
import { MathBlock } from './extensions/MathBlock';
import { MathFocus } from './extensions/MathFocus';
import { SlashMenu } from './extensions/SlashMenu';
import { PlaceholderHint } from './extensions/PlaceholderHint';
import { BlockReorderShortcuts } from './extensions/BlockReorderShortcuts';
import { SelectBlock } from './extensions/SelectBlock';
import { SettleMotion } from './extensions/SettleMotion';
import { SectionBreak } from './extensions/SectionBreak';
import { FillInBlank } from './extensions/FillInBlank';
import { Blank } from './extensions/Blank';
import { Columns, Column } from './extensions/Columns';
import { Image } from './extensions/Image';
import { InteractiveGraph } from './extensions/InteractiveGraph';
import { NumberLine } from './extensions/NumberLine';
import { DataPlot } from './extensions/DataPlot';
import { MultipleChoice } from './extensions/MultipleChoice';
import { Matching } from './extensions/Matching';
import { Ordering } from './extensions/Ordering';
import { LearningObjectives } from './extensions/LearningObjectives';
import { WorkedExample } from './extensions/WorkedExample';
import { FadedWorkedExample } from './extensions/FadedWorkedExample';
import { SelfExplanation } from './extensions/SelfExplanation';
import { ShortAnswer } from './extensions/ShortAnswer';
import { Essay } from './extensions/Essay';
import { Definition } from './extensions/Definition';

export interface EditorExtensionOptions {
    // Activity-wide default a columns block's gridLines:'inherit' resolves to
    // (meta.print.gridLines). Fixed at editor mount.
    gridLinesDefault?: boolean;
}

export function buildEditorExtensions({
    gridLinesDefault = false,
}: EditorExtensionOptions = {}): Extensions {
    return [
        // Strict-grid top node: doc = (sectionBreak | row)+ (see Doc.ts).
        // Replaces StarterKit's Document (content `block+`).
        Doc,
        StarterKit.configure({
            // Our strict-grid Doc (above) owns the top node.
            document: false,
            // TrailingNode ensures the doc ends with a paragraph — invalid at the
            // strict-grid doc level (only sectionBreak | row), where it wrongly
            // appends the fallback default type (a bare sectionBreak) after every
            // edit. A doc always ends with a row, so no trailing node is needed.
            trailingNode: false,
            blockquote: false,
            codeBlock: false,
            // The drag drop-line as the accent "insert-line" (stage 6). The
            // built-in already snaps it to the nearest valid gap — position
            // is PM's; only the paint is ours (radius in editor.css).
            dropcursor: {
                color: 'var(--ed-accent)',
                width: 3,
                class: 'editor-dropcursor',
            },
        }),
        MathInline,
        MathBlock,
        // Caret handoff between the doc and the MathLive fields: auto-open on
        // insert, keyboard re-entry (Enter / arrow-in), and move-out exit.
        MathFocus,
        SlashMenu,
        // Grey "/" hint on empty top-level lines — the slash menu's signifier.
        PlaceholderHint,
        BlockReorderShortcuts,
        // Esc lifts a text caret to a block NodeSelection (the four-state
        // model's secondary Select state; click stays edit).
        SelectBlock,
        // "Snaps into place" settle on explicitly tagged placements (insert /
        // drag-drop / column-split) — slice-6 stage 6.
        SettleMotion,
        SectionBreak,
        Subscript,
        Superscript,
        // Underline is bundled by StarterKit v3 — registering it again
        // duplicates the 'underline' mark. The toolbar's U button uses
        // StarterKit's.
        // Inline vocabulary-definition mark. Authored via the toolbar
        // "Define" button + the root-level DefinitionPopoverHost.
        Definition,
        // Stage 13.5 — question-block extensions. FillInBlank is the
        // block container; Blank is the inline atom that lives inside
        // its body (and only inside its body, per the schema's
        // FillInBlankInline union). Both must be registered for the
        // input rule + content spec to function.
        FillInBlank,
        Blank,
        // Structural columns container (group 'block') + its cell node.
        // Both must be registered for the `column{2,6}` content spec and
        // the insertColumns command to function. configure threads the
        // activity-wide grid-lines default so an 'inherit' block previews
        // ruled when the activity opts in.
        Columns.configure({ gridLinesDefault }),
        Column,
        // Structural image block (group 'block'). Renders as a compact
        // placeholder card (ImageView) in the editor; the actual figure/img
        // only appears in the published/print output. Editing is via the
        // root-level ImagePopoverHost.
        Image,
        // Graded interactive-graph block (Stage 5). Block node with an
        // editable prompt (NodeViewContent) + a live author board reusing
        // the graph kit.
        InteractiveGraph,
        // Graded number-line block (1-D, K-8). The lean sibling of the graph
        // block: editable prompt + a live author board reusing the same kit.
        NumberLine,
        DataPlot,
        // Multiple-choice question block: editable prompt + structured
        // choice list (single or multi-select), authored in-place.
        MultipleChoice,
        // Matching + ordering question blocks (2026-07-10): editable prompt +
        // structured item/target lists, authored in-place like MC.
        Matching,
        Ordering,
        // Pedagogical content blocks (Phase 2): a titled objectives list and a
        // boxed worked example whose body holds nested content blocks. Pure
        // content — no runtime, no scoring.
        LearningObjectives,
        WorkedExample,
        // Faded worked example — the interactive sibling: shown steps + faded
        // fill_in_blank steps. Scoring rides the nested fill_in_blank blocks
        // (already registered above), so no runtime wiring of its own.
        FadedWorkedExample,
        // Self-explanation — an ungraded free-text reflection prompt.
        SelfExplanation,
        // Manually-graded free text (Phase 2.6): short_answer + essay. Same
        // capture as self-explanation; graded later against a rubric.
        ShortAnswer,
        Essay,
    ];
}
