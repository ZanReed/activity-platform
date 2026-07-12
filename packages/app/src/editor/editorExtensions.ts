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
import { MathInline } from './extensions/MathInline';
import { MathBlock } from './extensions/MathBlock';
import { SlashMenu } from './extensions/SlashMenu';
import { BlockReorderShortcuts } from './extensions/BlockReorderShortcuts';
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
        StarterKit.configure({
            blockquote: false,
            codeBlock: false,
        }),
        MathInline,
        MathBlock,
        SlashMenu,
        BlockReorderShortcuts,
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
    ];
}
