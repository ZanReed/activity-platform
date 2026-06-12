import { useEffect, useState } from 'react';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import DragHandle from '@tiptap/extension-drag-handle-react';
import Toolbar from './Toolbar';
import { MathInline } from './extensions/MathInline';
import { MathBlock } from './extensions/MathBlock';
import './editor.css';
import { SlashMenu } from './extensions/SlashMenu';
import { BlockReorderShortcuts } from './extensions/BlockReorderShortcuts';
import 'mathlive';
import { SectionBreak } from './extensions/SectionBreak';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { FillInBlank } from './extensions/FillInBlank';
import { Blank } from './extensions/Blank';
import { Columns, Column } from './extensions/Columns';
import { Image } from './extensions/Image';
import { columnsNestedDragOptions } from './dragHandleNested';
import BlankPopoverHost from './components/BlankPopoverHost';
import ImagePopoverHost from './components/ImagePopoverHost';

interface EditorProps {
    initialContent: JSONContent;
    onUpdate?: (json: JSONContent) => void;
    // Activity-wide default a columns block's gridLines:'inherit' resolves to
    // (meta.print.gridLines). Fixed at editor mount — Tiptap configures
    // extensions once, so changing the activity default takes effect on reload;
    // the published output is always authoritative. Defaults to false (the
    // playground passes nothing).
    gridLinesDefault?: boolean;
    // Activity being edited — forwarded to the image popover's Upload tab so it
    // can POST to the upload-image Edge Function. Undefined in the playground,
    // where uploads are disabled (URL paste only).
    activityId?: string;
}

export default function Editor({
    initialContent,
    onUpdate,
    gridLinesDefault = false,
    activityId,
}: EditorProps) {
    // Force re-render on every editor transaction. Tiptap React's built-in
    // re-render hook misses pure storedMarks transactions (e.g., toggling a
    // mark on an empty cursor), so toolbar active states would lag behind
    // editor state without this nudge.
    const [, forceTick] = useState(0);
    const editor = useEditor({
        extensions: [
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
            // root-level ImagePopoverHost below.
            Image,
        ],
        content: initialContent,
        onCreate: ({ editor }) => {
            onUpdate?.(editor.getJSON());
        },
        onUpdate: ({ editor }) => {
            onUpdate?.(editor.getJSON());
        },
        onTransaction: () => {
            forceTick((t) => t + 1);
        },
    });

    // Dev-only escape hatch: expose the live editor so scripted browser
    // checks (and quick console experiments) can set content / inspect state.
    // Stripped from production builds by the DEV guard.
    useEffect(() => {
        if (import.meta.env.DEV) {
            (window as unknown as { __tiptapEditor?: unknown }).__tiptapEditor =
                editor;
        }
    }, [editor]);

    return (
        // No overflow-hidden here: it would establish this card as the
        // toolbar's containing scroll box and silently disable its
        // position:sticky against the window scroll. Corner rounding is
        // handled per-edge instead (toolbar rounds its own top corners).
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <Toolbar editor={editor} />
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
                {/*
                  BlankPopoverHost sits as a sibling of EditorContent. It
                  watches the editor's selection and shows a popover when a
                  blank node is currently selected. Single instance — no
                  per-chip mounting. The popover itself portals to
                  document.body for stacking-context independence.
                */}
                <BlankPopoverHost editor={editor} />
                {/*
                  ImagePopoverHost — sibling host watching the selection for a
                  node-selected image block, showing the anchored edit popover.
                  Single instance, same pattern as BlankPopoverHost.
                */}
                <ImagePopoverHost editor={editor} activityId={activityId} />
            </div>
        </div>
    );
}
