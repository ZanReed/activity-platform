import { useContext, useEffect, useRef } from 'react';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { MathInline } from '../extensions/MathInline';
import { FieldFocusContext } from './fieldFocus';
import {
    activityInlineToTiptap,
    tiptapInlineToActivity,
    type InlineNodes,
} from '../../lib/serialize';

// ============================================================================
// InlineRichTextEditor — a small nested Tiptap editor for the rich sub-fields
// (blank hint, mistake feedback, problem solution, MC choice text, matching
// items …).
// ----------------------------------------------------------------------------
// Same inline alphabet the renderer pre-renders into <template> nodes: text
// with marks (bold/italic/code/sub/sup/underline) + inline math. No block
// structure — headings, lists, blockquotes, and code blocks are disabled so a
// hint can't accidentally grow a heading. The value is canonical InlineNode[]
// (the schema's inline type); we treat it opaquely here and let serialize own
// the shape via its two exported converters.
//
// Formatting comes from the TOP toolbar, not a per-field mini toolbar: the
// field reports its focus through FieldFocusContext and Toolbar routes the
// mark/math buttons to it (the toolbar's buttons preventDefault on mousedown,
// so clicking them never blurs the field). The old 6-button mini toolbar per
// field was the main source of visual noise in the choice/feedback rows.
//
// Multi-paragraph flattening:
//   The doc may technically hold more than one paragraph (Enter splits one).
//   InlineNode[] has no paragraph concept, so on serialize we flatten every
//   paragraph's inline content into a single stream, inserting a hard_break
//   between paragraphs. Round-trips collapse multi-paragraph input into one
//   line with <br>s — semantically equivalent, which is all the schema models.
//
// Live commit:
//   onChange fires on every transaction. Callers commit straight to the host
//   node's attrs. The editor is uncontrolled after mount (content is set once),
//   so committing back never resets the caret. To retarget a different node,
//   remount with a changing React `key`.
//
// Nesting:
//   In the FillInBlank solution case this editor lives inside the main
//   ProseMirror editor's NodeView. onKeyDown is stopped at the wrapper so the
//   parent editor never sees our keystrokes (Backspace, Enter, etc.).
// ============================================================================

interface InlineRichTextEditorProps {
    value: InlineNodes;
    onChange: (nodes: InlineNodes) => void;
    onBlur?: () => void;
    ariaLabel?: string;
}

function docToInline(json: JSONContent): InlineNodes {
    const paragraphs = json.content ?? [];
    const flat: JSONContent[] = [];
    paragraphs.forEach((paragraph, index) => {
        if (index > 0) flat.push({ type: 'hardBreak' });
        for (const child of paragraph.content ?? []) flat.push(child);
    });
    return tiptapInlineToActivity(flat);
}

export default function InlineRichTextEditor({
    value,
    onChange,
    onBlur,
    ariaLabel,
}: InlineRichTextEditorProps) {
    const reportFocus = useContext(FieldFocusContext);
    // The handlers below close over mount-time props; refs keep them current
    // without rebuilding the editor.
    const reportRef = useRef(reportFocus);
    reportRef.current = reportFocus;
    const onBlurRef = useRef(onBlur);
    onBlurRef.current = onBlur;

    const editor = useEditor({
        extensions: [
            // StarterKit v3 bundles the underline mark, so the top toolbar's
            // full mark set (B/I/U/<>/sub/sup) works on nested fields too.
            StarterKit.configure({
                heading: false,
                bulletList: false,
                orderedList: false,
                listItem: false,
                blockquote: false,
                codeBlock: false,
                horizontalRule: false,
            }),
            Subscript,
            Superscript,
            MathInline,
        ],
        content: {
            type: 'doc',
            content: [
                { type: 'paragraph', content: activityInlineToTiptap(value) },
            ],
        },
        onUpdate: ({ editor }) => onChange(docToInline(editor.getJSON())),
        onFocus: ({ editor }) => reportRef.current(editor, true),
        onBlur: ({ editor }) => {
            reportRef.current(editor, false);
            onBlurRef.current?.();
        },
    });

    // Unmounting while focused (e.g. the feedback disclosure collapses) must
    // release the toolbar back to the main editor.
    useEffect(() => {
        if (!editor) return;
        return () => reportRef.current(editor, false);
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="inline-rte" onKeyDown={(e) => e.stopPropagation()}>
            <EditorContent
                editor={editor}
                className="inline-rte__content"
                aria-label={ariaLabel}
            />
        </div>
    );
}
