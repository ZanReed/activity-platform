import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import type { DefinitionBlock } from '@activity/schema';
import Toolbar from '../Toolbar';
import { MathInline } from '../extensions/MathInline';
import { MathBlock } from '../extensions/MathBlock';
import { Image } from '../extensions/Image';
import { GraphFigure } from '../extensions/GraphFigure';
import ImagePopoverHost from './ImagePopoverHost';
import {
    definitionContentToTiptap,
    tiptapToDefinitionContent,
} from '../../lib/serialize';
import '../editor.css';

// ============================================================================
// DefinitionEditDialog — the rich authoring surface for a definition.
// ----------------------------------------------------------------------------
// A modal dialog, NOT a bigger popover, for two reasons (design doc D5):
//
//  1. A ~20rem popover anchored to a word cannot host a block toolbar.
//  2. An anchored popover hosting a nested ProseMirror instance is this repo's
//     documented landmine — per-chip BlankEditPopover mounting broke widespread
//     editor behavior in Drop 1 of Stage 13.5 (a standing "don't" in CLAUDE.md),
//     and the deferred "one-click switch between chips" item is deferred over
//     exactly the FocusTrap/selection entanglement a nested editor inherits. A
//     modal is unanchored, owns its own focus, and is torn down on close, so it
//     inherits none of it.
//
// Commits on explicit Save only; Cancel discards. That is the other half of the
// popover's data-loss guard (definitionShape.ts): the surface that CAN hold
// every block is also the only one with an explicit commit.
//
// Extension set is the DefinitionBlock union and nothing else. Definition is
// deliberately NOT registered, so the non-recursion invariant is enforced at the
// editor level too — a teacher cannot define a word inside a definition.
// Columns and Callout are absent per D2/D3.
// ============================================================================

interface DefinitionEditDialogProps {
    term: string;
    initialContent: DefinitionBlock[];
    // For uploads; undefined in the playground (URL paste only).
    activityId?: string;
    onSave: (content: DefinitionBlock[]) => void;
    onCancel: () => void;
}

export default function DefinitionEditDialog({
    term,
    initialContent,
    activityId,
    onSave,
    onCancel,
}: DefinitionEditDialogProps) {
    // Force a re-render on every transaction so toolbar active-states keep up
    // (same reason as the main and reference editors).
    const [, forceTick] = useState(0);
    const [draft, setDraft] = useState<JSONContent>(() =>
        definitionContentToTiptap(initialContent),
    );

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ blockquote: false, codeBlock: false }),
            MathInline,
            MathBlock,
            Subscript,
            Superscript,
            Image,
            GraphFigure,
        ],
        content: draft,
        onUpdate: ({ editor }) => {
            setDraft(editor.getJSON());
        },
        onTransaction: () => {
            forceTick((t) => t + 1);
        },
    });

    const save = () => {
        onSave(tiptapToDefinitionContent(editor ? editor.getJSON() : draft));
    };

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-6"
            role="presentation"
            onMouseDown={(e) => {
                // Backdrop click cancels. Unlike the popover, the dialog does
                // NOT commit on an ambient dismissal — a rich definition is too
                // much work to lose to a misclick, and Save is right there.
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div
                className="mt-12 w-full max-w-2xl rounded-lg border border-line bg-canvas shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-label={`Edit the definition of ${term}`}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        e.stopPropagation();
                        onCancel();
                    }
                }}
            >
                <div className="border-b border-line px-4 py-2.5">
                    <h2 className="text-sm font-medium text-strong">
                        Definition of “{term}”
                    </h2>
                    <p className="mt-0.5 text-xs text-muted">
                        Students see this when they tap the word.
                    </p>
                </div>

                <Toolbar editor={editor} variant="definition" />

                <div className="max-h-[55vh] overflow-y-auto p-5">
                    <EditorContent editor={editor} />
                    <ImagePopoverHost editor={editor} activityId={activityId} />
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-line px-4 py-2.5">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded border border-line-strong px-2.5 py-1 text-xs font-medium text-strong hover:bg-surface-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={save}
                        className="rounded bg-primary px-2.5 py-1 text-xs font-medium text-white hover:bg-primary-hover"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
