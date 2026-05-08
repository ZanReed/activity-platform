import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Toolbar from './Toolbar';
import { MathInline } from './extensions/MathInline';
import { MathBlock } from './extensions/MathBlock';
import './editor.css';
import { SlashMenu } from './extensions/SlashMenu';

interface EditorProps {
    initialContent: JSONContent;
}

export default function Editor({ initialContent }: EditorProps) {
    const editor = useEditor({
        extensions: [StarterKit, MathInline, MathBlock, SlashMenu],
        content: initialContent,
    });

    return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <Toolbar editor={editor} />
        <div className="p-6">
        <EditorContent editor={editor} />
        </div>
        </div>
    );
}
