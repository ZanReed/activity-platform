import { useState } from 'react';
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

interface EditorProps {
    initialContent: JSONContent;
    onUpdate?: (json: JSONContent) => void;
}

export default function Editor({ initialContent, onUpdate }: EditorProps) {
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

    return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <Toolbar editor={editor} />
        <div className="p-6">
        <DragHandle editor={editor}>
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
        </div>
        </div>
    );
}
