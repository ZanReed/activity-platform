import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import DragHandle from '@tiptap/extension-drag-handle-react';
import Toolbar from './Toolbar';
import { MathInline } from './extensions/MathInline';
import { MathBlock } from './extensions/MathBlock';
import './editor.css';
import { SlashMenu } from './extensions/SlashMenu';
import { BlockReorderShortcuts } from './extensions/BlockReorderShortcuts';

interface EditorProps {
    initialContent: JSONContent;
    onUpdate?: (json: JSONContent) => void;
}

export default function Editor({ initialContent, onUpdate }: EditorProps) {
    const editor = useEditor({
        extensions: [StarterKit, MathInline, MathBlock, SlashMenu, BlockReorderShortcuts],
        content: initialContent,
        onCreate: ({ editor }) => {
            onUpdate?.(editor.getJSON());
        },
        onUpdate: ({ editor }) => {
            onUpdate?.(editor.getJSON());
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
