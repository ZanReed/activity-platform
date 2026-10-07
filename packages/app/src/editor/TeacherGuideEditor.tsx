// =============================================================================
// TeacherGuideEditor.tsx — the teacher guide's prose-only editor
// -----------------------------------------------------------------------------
// curriculum D50; docs/design/teacher-guides.md TG-4. A constrained sibling of
// ReferencePanelEditor whose alphabet is EXACTLY the schema's GuideBlock set:
// paragraphs, headings, bullet/numbered lists, display maths, plus the simple
// marks and inline maths. Nothing else is registered, so nothing else can be
// typed or pasted in (ProseMirror drops what the schema cannot hold), and
// tiptapToTeacherGuide filters again at save as the backstop.
//
// Teacher-only content: what is authored here is deleted from every student
// payload by the read API (sanitize.ts).
// =============================================================================

import { useState } from 'react';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import 'mathlive';
import Toolbar from './Toolbar';
import { MathInline } from './extensions/MathInline';
import { MathBlock } from './extensions/MathBlock';
import './editor.css';

interface TeacherGuideEditorProps {
    initialContent: JSONContent;
    onUpdate: (json: JSONContent) => void;
}

export default function TeacherGuideEditor({
    initialContent,
    onUpdate,
}: TeacherGuideEditorProps) {
    // Re-render on every transaction so toolbar active-states keep up (same
    // reason as the other editors).
    const [, forceTick] = useState(0);
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                blockquote: false,
                codeBlock: false,
                horizontalRule: false,
            }),
            MathInline,
            MathBlock,
            Subscript,
            Superscript,
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
        <div className="rounded-lg border border-line bg-canvas shadow-sm" data-teacher-guide-editor>
            <Toolbar editor={editor} variant="guide" />
            <div className="p-6">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
