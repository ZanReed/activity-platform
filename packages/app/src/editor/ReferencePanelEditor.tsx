import { useState } from 'react';
import {
    useEditor,
    EditorContent,
    type JSONContent,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import DragHandle from '@tiptap/extension-drag-handle-react';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import 'mathlive';
import Toolbar from './Toolbar';
import { MathInline } from './extensions/MathInline';
import { MathBlock } from './extensions/MathBlock';
import { Columns, Column } from './extensions/Columns';
import { Image } from './extensions/Image';
import { FillInBlank } from './extensions/FillInBlank';
import { Blank } from './extensions/Blank';
import { InteractiveGraph } from './extensions/InteractiveGraph';
import { columnsNestedDragOptions } from './dragHandleNested';
import BlankPopoverHost from './components/BlankPopoverHost';
import ImagePopoverHost from './components/ImagePopoverHost';
import './editor.css';

interface ReferencePanelEditorProps {
    initialContent: JSONContent;
    onUpdate: (json: JSONContent) => void;
    // Activity-wide ruled-grid default for a columns block's gridLines:'inherit'
    // (meta.print.gridLines). Fixed at mount, like the main editor.
    gridLinesDefault?: boolean;
    // Forwarded to the image popover's Upload tab so panel images can be
    // uploaded to the same Edge Function as body images.
    activityId?: string;
}

// A constrained sibling of <Editor> for authoring the reference panel. Same
// content alphabet — text + marks, inline/block math, headings, lists, columns,
// image — MINUS the structural/question primitives: no SectionBreak,
// FillInBlank, or Blank extensions are registered, and the toolbar runs in
// variant="reference" (no Problem / Blank / Section buttons). The panel is flat
// scaffold content, so there is no BlankPopoverHost here (only the image
// popover). Kept as its own component (not a parameterized <Editor>) so the main
// editor's extension wiring and NodeView invariants stay untouched.
export default function ReferencePanelEditor({
    initialContent,
    onUpdate,
    gridLinesDefault = false,
    activityId,
}: ReferencePanelEditorProps) {
    // Force a re-render on every transaction so toolbar active-states keep up
    // with stored-mark changes (same reason as the main editor).
    const [, forceTick] = useState(0);
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                blockquote: false,
                codeBlock: false,
            }),
            MathInline,
            MathBlock,
            Subscript,
            Superscript,
            // Underline is bundled by StarterKit v3 — registering it again
            // duplicates the 'underline' mark. The toolbar's U button uses
            // StarterKit's.
            Columns.configure({ gridLinesDefault }),
            Column,
            // FillInBlank + Blank are registered ONLY to satisfy the column
            // cell's content schema (its content expression references
            // fillInBlank, which in turn references blank). The reference
            // toolbar hides the Problem / Blank buttons, so a teacher cannot
            // author a blank in a panel; a pasted one renders inert (the panel
            // sits outside any .activity-section, so the runtime never scores
            // it).
            FillInBlank,
            Blank,
            // InteractiveGraph, like FillInBlank above, is registered ONLY
            // because the column cell's content expression names it (as of the
            // Stage 5 graphs-in-columns drop, which broke this editor's schema
            // compilation until registered here). The reference toolbar's
            // Insert dropdown never offers it, so a teacher can't author one
            // in a panel.
            InteractiveGraph,
            Image,
        ],
        content: initialContent,
        onCreate: ({ editor }) => {
            onUpdate(editor.getJSON());
        },
        onUpdate: ({ editor }) => {
            onUpdate(editor.getJSON());
        },
        onTransaction: () => {
            forceTick((t) => t + 1);
        },
    });

    return (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <Toolbar editor={editor} variant="reference" />
            <div className="p-6">
                <DragHandle editor={editor} nested={columnsNestedDragOptions}>
                    <button
                        type="button"
                        className="drag-handle-button"
                        tabIndex={-1}
                        aria-label="Drag to reorder block"
                        title="Drag to reorder"
                    >
                        <svg
                            width="12"
                            height="20"
                            viewBox="0 0 12 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <circle cx="3" cy="4" r="1.5" />
                            <circle cx="9" cy="4" r="1.5" />
                            <circle cx="3" cy="10" r="1.5" />
                            <circle cx="9" cy="10" r="1.5" />
                            <circle cx="3" cy="16" r="1.5" />
                            <circle cx="9" cy="16" r="1.5" />
                        </svg>
                    </button>
                </DragHandle>
                <EditorContent editor={editor} />
                <BlankPopoverHost editor={editor} />
                <ImagePopoverHost editor={editor} activityId={activityId} />
            </div>
        </div>
    );
}
