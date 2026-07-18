import { useEffect, useRef, useState } from 'react';
import { useFloating, autoUpdate, offset, flip, shift } from '@floating-ui/react';
import { createPortal } from 'react-dom';
import InlineRichTextEditor from './InlineRichTextEditor';
import { uploadImage } from '../../lib/uploadImage';
import type { InlineNodes } from '../../lib/serialize';
import type { DefinitionImageAttr } from '../extensions/Definition';

// ============================================================================
// DefinitionEditPopover — edit popover for a definition mark.
// ----------------------------------------------------------------------------
// Rich content (formatted text + inline math) authored via the shared
// InlineRichTextEditor — the same control blank hints use — plus one optional
// illustrative image (URL paste or upload). Nothing is committed to the
// document until an exit path (Done, Escape, outside-click), which commits the
// draft via onChange — or removes the mark via onRemove when the definition is
// empty (no text/math AND no image), so an abandoned "Define" leaves nothing
// behind. Anchored to the marked span via floating-ui; portaled to <body>.
// ============================================================================

interface DefinitionEditPopoverProps {
    referenceElement: HTMLElement | null;
    initialContent: InlineNodes;
    initialImage: DefinitionImageAttr | null;
    // For uploads; undefined in the playground (URL paste only).
    activityId?: string;
    onChange: (content: InlineNodes, image: DefinitionImageAttr | null) => void;
    onRemove: () => void; // remove the mark entirely
    onClose: () => void; // release selection / dismiss
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
    initialImage,
    activityId,
    onChange,
    onRemove,
    onClose,
}: DefinitionEditPopoverProps) {
    // Content draft lives in a ref (InlineRichTextEditor is uncontrolled and
    // commits on every transaction) — committed once on close, not per keystroke
    // (a per-keystroke mark update would churn extendMarkRange + the undo stack).
    const contentRef = useRef<InlineNodes>(initialContent);
    const [image, setImage] = useState<DefinitionImageAttr | null>(initialImage);
    const imageRef = useRef<DefinitionImageAttr | null>(initialImage);
    const setImageBoth = (next: DefinitionImageAttr | null) => {
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

    // Commit the draft (or remove the mark when empty), then release.
    const commitAndClose = () => {
        const content = contentRef.current;
        const img = imageRef.current;
        if (contentIsEmpty(content) && !img) {
            onRemove();
        } else {
            onChange(content, img);
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
        setImageBoth({ src, alt: imageRef.current?.alt ?? '' });
        setUrlInput('');
        setUploadError(null);
    };

    const handleFile = async (file: File) => {
        if (!activityId) return;
        setUploading(true);
        setUploadError(null);
        try {
            const url = await uploadImage(activityId, file);
            setImageBoth({ src: url, alt: imageRef.current?.alt ?? '' });
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

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
                    value={initialContent}
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
                                        src: image.src,
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
                <button
                    type="button"
                    onClick={commitAndClose}
                    className="rounded bg-primary px-2.5 py-1 text-xs font-medium text-white hover:bg-primary-hover"
                >
                    Done
                </button>
            </div>
        </div>,
        document.body,
    );
}
