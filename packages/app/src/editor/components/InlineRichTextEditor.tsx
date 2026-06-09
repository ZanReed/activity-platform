import { useState } from 'react';
import {
    useEditor,
    EditorContent,
    type JSONContent,
    type Editor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { MathInline } from '../extensions/MathInline';
import {
    activityInlineToTiptap,
    tiptapInlineToActivity,
    type InlineNodes,
} from '../../lib/serialize';

// ============================================================================
// InlineRichTextEditor — a small nested Tiptap editor for the rich popover
// fields (blank hint, mistake feedback, problem solution).
// ----------------------------------------------------------------------------
// Same inline alphabet the renderer pre-renders into <template> nodes: text
// with marks (bold/italic/code/sub/sup/underline) + inline math. No block
// structure — headings, lists, blockquotes, and code blocks are disabled so a
// hint can't accidentally grow a heading. The value is canonical InlineNode[]
// (the schema's inline type); we treat it opaquely here and let serialize own
// the shape via its two exported converters.
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
    // Force a re-render on every transaction so the toolbar's active states
    // track stored marks on a collapsed cursor (same nudge the main editor
    // needs — see Editor.tsx).
    const [, forceTick] = useState(0);

    const editor = useEditor({
        extensions: [
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
        onBlur: () => onBlur?.(),
        onTransaction: () => forceTick((t) => t + 1),
    });

    if (!editor) return null;

    return (
        <div className="inline-rte" onKeyDown={(e) => e.stopPropagation()}>
            <div className="inline-rte__toolbar">
                <MarkButton editor={editor} mark="bold" label={<strong>B</strong>} />
                <MarkButton editor={editor} mark="italic" label={<em>I</em>} />
                <MarkButton editor={editor} mark="code" label={<code>{'<>'}</code>} />
                <MarkButton
                    editor={editor}
                    mark="subscript"
                    label={
                        <>
                            X<sub>2</sub>
                        </>
                    }
                />
                <MarkButton
                    editor={editor}
                    mark="superscript"
                    label={
                        <>
                            X<sup>2</sup>
                        </>
                    }
                />
                <button
                    type="button"
                    className="inline-rte__btn"
                    title="Insert inline math"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() =>
                        editor.chain().focus().insertMathInline('').run()
                    }
                >
                    ƒx
                </button>
            </div>
            <EditorContent
                editor={editor}
                className="inline-rte__content"
                aria-label={ariaLabel}
            />
        </div>
    );
}

function isMarkActive(editor: Editor, mark: string): boolean {
    if (editor.isActive(mark)) return true;
    return (
        editor.state.storedMarks?.some((m) => m.type.name === mark) ?? false
    );
}

interface MarkButtonProps {
    editor: Editor;
    mark: 'bold' | 'italic' | 'code' | 'subscript' | 'superscript';
    label: React.ReactNode;
}

function MarkButton({ editor, mark, label }: MarkButtonProps) {
    const active = isMarkActive(editor, mark);
    const run = () => {
        const chain = editor.chain().focus();
        switch (mark) {
            case 'bold':
                chain.toggleBold().run();
                break;
            case 'italic':
                chain.toggleItalic().run();
                break;
            case 'code':
                chain.toggleCode().run();
                break;
            case 'subscript':
                chain.toggleSubscript().run();
                break;
            case 'superscript':
                chain.toggleSuperscript().run();
                break;
        }
    };
    return (
        <button
            type="button"
            className={`inline-rte__btn${active ? ' is-active' : ''}`}
            // preventDefault keeps the editor's selection/focus from being
            // stolen by the button mousedown, so the toggle applies to the
            // current selection rather than a blurred one.
            onMouseDown={(e) => e.preventDefault()}
            onClick={run}
        >
            {label}
        </button>
    );
}
