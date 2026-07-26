import { useEffect, useRef, useState } from 'react';
import { useFloating, autoUpdate, offset, flip, shift } from '@floating-ui/react';
import { createPortal } from 'react-dom';
import InlineRichTextEditor from './InlineRichTextEditor';
import { uploadImage } from '../../lib/uploadImage';
import type { InlineNodes } from '../../lib/serialize';
import type { DefinitionBlock, DefinitionImageBlock } from '@activity/schema';
import {
    simpleDefinitionParts,
    partsToDefinitionContent,
} from './definitionShape';

// ============================================================================
// DefinitionEditPopover — inline edit popover for a SIMPLE definition mark.
// ----------------------------------------------------------------------------
// The fast path (design doc D5): one line of formatted text + inline math via
// the shared InlineRichTextEditor (the control blank hints use), plus one
// optional illustrative image. Nothing is committed until an exit path (Done,
// Escape, outside-click), which commits the draft via onChange — or removes the
// mark via onRemove when the definition is empty, so an abandoned "Define"
// leaves nothing behind. Anchored to the marked span via floating-ui; portaled
// to <body>.
//
// This popover is only ever mounted in EDITABLE mode for content
// isSimpleDefinition accepts — an optional paragraph plus an optional trailing
// image (definitionShape.ts). That is a data-loss guard, not a preference:
// commitAndClose writes the draft over the mark's WHOLE content on every exit
// path, so an inline-only editor opened on a multi-block definition would
// silently drop every block after the first on a stray Escape. Richer content
// gets `readOnly`, which renders a summary and an Edit button and mounts no
// editable field at all — no commit path, nothing to lose.
//
// `onExpand` opens DefinitionEditDialog, the surface that can hold every block.
// It is offered unconditionally so a simple definition can be promoted at will.
// ============================================================================

interface DefinitionEditPopoverProps {
    referenceElement: HTMLElement | null;
    initialContent: DefinitionBlock[];
    // For uploads; undefined in the playground (URL paste only).
    activityId?: string;
    onChange: (content: DefinitionBlock[]) => void;
    onRemove: () => void; // remove the mark entirely
    onClose: () => void; // release selection / dismiss
    onExpand: () => void; // hand off to the full dialog
}

// A one-line summary of a rich definition, for the read-only branch. Names what
// is in there rather than trying to render it — the popover is not the surface
// for that, and the point is to get the author into the dialog.
function describeBlocks(blocks: DefinitionBlock[]): string {
    const LABELS: Record<string, [string, string]> = {
        paragraph: ['paragraph', 'paragraphs'],
        heading: ['heading', 'headings'],
        math_block: ['equation', 'equations'],
        image: ['image', 'images'],
        graph_figure: ['graph', 'graphs'],
        bullet_list: ['list', 'lists'],
        ordered_list: ['list', 'lists'],
    };
    const counts = new Map<string, number>();
    for (const block of blocks) {
        const label = LABELS[block.type];
        if (!label) continue;
        counts.set(label[0], (counts.get(label[0]) ?? 0) + 1);
    }
    const parts = [...counts.entries()].map(([singular, n]) => {
        const entry = Object.values(LABELS).find((l) => l[0] === singular);
        return `${n} ${n === 1 ? singular : (entry?.[1] ?? singular)}`;
    });
    return parts.length > 0 ? parts.join(', ') : 'Empty';
}

function contentIsEmpty(nodes: InlineNodes): boolean {
    for (const n of nodes) {
        if (n.type === 'text' && n.text.trim().length > 0) return false;
        if (n.type === 'math_inline') return false;
    }
    return true;
}

export default function DefinitionEditPopover({
    referenceElement,
    initialContent,
    activityId,
    onChange,
    onRemove,
    onClose,
    onExpand,
}: DefinitionEditPopoverProps) {
    // null => richer than this popover can edit; render read-only (see header).
    const parts = simpleDefinitionParts(initialContent);
    const readOnly = parts === null;
    const initialInline = (parts?.paragraph?.content ?? []) as InlineNodes;
    const initialImage = parts?.image ?? null;
    // Content draft lives in a ref (InlineRichTextEditor is uncontrolled and
    // commits on every transaction) — committed once on close, not per keystroke
    // (a per-keystroke mark update would churn extendMarkRange + the undo stack).
    const contentRef = useRef<InlineNodes>(initialInline);
    const [image, setImage] = useState<DefinitionImageBlock | null>(initialImage);
    const imageRef = useRef<DefinitionImageBlock | null>(initialImage);
    const setImageBoth = (next: DefinitionImageBlock | null) => {
        imageRef.current = next;
        setImage(next);
    };

    const [urlInput, setUrlInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const { refs, floatingStyles } = useFloating({
        placement: 'bottom-start',
        middleware: [offset(6), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    });

    useEffect(() => {
        refs.setReference(referenceElement);
    }, [referenceElement, refs]);

    // Commit the draft (or remove the mark when empty), then release. In
    // read-only mode there IS no draft — dismissing must leave the stored
    // content exactly as it was, which is the whole point of the gate.
    const commitAndClose = () => {
        if (readOnly) {
            onClose();
            return;
        }
        const inline = contentRef.current;
        const img = imageRef.current;
        if (contentIsEmpty(inline) && !img) {
            onRemove();
        } else {
            onChange(
                partsToDefinitionContent({
                    paragraph:
                        inline.length > 0
                            ? { type: 'paragraph', content: inline as never }
                            : null,
                    image: img,
                }),
            );
        }
        onClose();
    };

    // Escape + outside-click both commit then close. A click on the popover
    // itself (its nested editor, controls) or the marked term is not "outside".
    useEffect(() => {
        const onDocMouseDown = (e: MouseEvent) => {
            const target = e.target as Node;
            const floatingEl = refs.floating.current;
            if (floatingEl && floatingEl.contains(target)) return;
            if (referenceElement && referenceElement.contains(target)) return;
            // The top toolbar formats the popover's rich definition field —
            // clicking its (focus-preserving) buttons must not close us.
            if (
                target instanceof Element &&
                target.closest('.editor-toolbar')
            ) {
                return;
            }
            commitAndClose();
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                commitAndClose();
            }
        };
        document.addEventListener('mousedown', onDocMouseDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onDocMouseDown);
            document.removeEventListener('keydown', onKeyDown);
        };
        // referenceElement is the only external input the handlers read.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [referenceElement]);

    const addUrl = () => {
        const src = urlInput.trim();
        if (!src) return;
        setImageBoth({ type: 'image', src, alt: imageRef.current?.alt ?? '' });
        setUrlInput('');
        setUploadError(null);
    };

    const handleFile = async (file: File) => {
        if (!activityId) return;
        setUploading(true);
        setUploadError(null);
        try {
            const url = await uploadImage(activityId, file);
            setImageBoth({
                type: 'image',
                src: url,
                alt: imageRef.current?.alt ?? '',
            });
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    // Read-only branch: a definition richer than the two fields below can hold.
    // Deliberately mounts NO editable control — there is no draft, so no exit
    // path can overwrite the stored blocks. Summarizes what is in there and
    // hands off to the dialog.
    if (readOnly) {
        return createPortal(
            <div
                ref={refs.setFloating}
                style={floatingStyles}
                className="z-50 w-80 rounded-lg border border-line bg-canvas p-3 shadow-xl"
                role="dialog"
                aria-label="Definition"
            >
                <p className="text-xs font-medium text-muted">Definition</p>
                <p className="mt-1 text-sm text-strong">
                    {describeBlocks(initialContent)}
                </p>
                <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                    <button
                        type="button"
                        onClick={() => {
                            onRemove();
                            onClose();
                        }}
                        className="text-xs font-medium text-danger hover:text-danger-strong"
                    >
                        Remove definition
                    </button>
                    <button
                        type="button"
                        onClick={onExpand}
                        className="rounded bg-primary px-2.5 py-1 text-xs font-medium text-white hover:bg-primary-hover"
                    >
                        Edit…
                    </button>
                </div>
            </div>,
            document.body,
        );
    }

    return createPortal(
        <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="z-50 w-80 rounded-lg border border-line bg-canvas p-3 shadow-xl"
            role="dialog"
            aria-label="Edit definition"
        >
            <label className="mb-1 block text-xs font-medium text-muted">
                Definition
            </label>
            <div className="rounded border border-line-strong px-2 py-1 text-sm focus-within:border-muted">
                <InlineRichTextEditor
                    value={initialInline}
                    onChange={(nodes) => {
                        contentRef.current = nodes;
                    }}
                    ariaLabel="Definition text"
                />
            </div>

            {/* Optional illustrative image */}
            <div className="mt-2">
                {image ? (
                    <div className="flex items-start gap-2">
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="h-14 w-14 flex-none rounded border border-line object-cover"
                        />
                        <div className="min-w-0 flex-1">
                            <input
                                type="text"
                                value={image.alt}
                                onChange={(e) =>
                                    setImageBoth({
                                        ...image,
                                        alt: e.target.value,
                                    })
                                }
                                placeholder="Describe the image (alt text)"
                                className="w-full rounded border border-line-strong px-2 py-1 text-xs focus:border-muted focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setImageBoth(null)}
                                className="mt-1 text-xs font-medium text-danger hover:text-danger-strong"
                            >
                                Remove image
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addUrl();
                                }
                            }}
                            placeholder="Image URL"
                            className="min-w-0 flex-1 rounded border border-line-strong px-2 py-1 text-xs focus:border-muted focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={addUrl}
                            className="flex-none rounded border border-line-strong px-2 py-1 text-xs font-medium text-strong hover:bg-surface-2"
                        >
                            Add
                        </button>
                        {activityId && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="flex-none rounded border border-line-strong px-2 py-1 text-xs font-medium text-strong hover:bg-surface-2 disabled:opacity-50"
                            >
                                {uploading ? 'Uploading…' : 'Upload'}
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void handleFile(file);
                                e.target.value = '';
                            }}
                        />
                    </div>
                )}
                {uploadError && (
                    <p className="mt-1 text-xs text-danger">{uploadError}</p>
                )}
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                <button
                    type="button"
                    onClick={() => {
                        onRemove();
                        onClose();
                    }}
                    className="text-xs font-medium text-danger hover:text-danger-strong"
                >
                    Remove definition
                </button>
                <div className="flex items-center gap-2">
                    {/* Promote to the full dialog — headings, lists, display
                        math, a graph figure. Commits the current draft first so
                        the dialog opens on what the author can see. */}
                    <button
                        type="button"
                        onClick={() => {
                            onChange(
                                partsToDefinitionContent({
                                    paragraph:
                                        contentRef.current.length > 0
                                            ? {
                                                  type: 'paragraph',
                                                  content: contentRef.current as never,
                                              }
                                            : null,
                                    image: imageRef.current,
                                }),
                            );
                            onExpand();
                        }}
                        className="rounded border border-line-strong px-2.5 py-1 text-xs font-medium text-strong hover:bg-surface-2"
                    >
                        Add more…
                    </button>
                    <button
                        type="button"
                        onClick={commitAndClose}
                        className="rounded bg-primary px-2.5 py-1 text-xs font-medium text-white hover:bg-primary-hover"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
