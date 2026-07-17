import { useEffect, useRef, useState } from 'react';
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    size,
} from '@floating-ui/react';
import { createPortal } from 'react-dom';
import { FocusTrap } from 'focus-trap-react';
import { uploadImage, ALLOWED_IMAGE_TYPES } from '../../lib/uploadImage';

// ============================================================================
// ImageEditPopover — the slimmed SOURCE popover for an image block.
// ----------------------------------------------------------------------------
// image-crop.md decomposed the old everything-popover: Alt / Caption moved to
// the Advanced drawer, Width became a drag-handle, Crop became its own mode. So
// this popover is now Source (URL / Upload) + Alignment (kept for now — it has
// no drag-handle and the ruling defers moving it to the drawer). Opened on
// demand by the command bar's Replace primary (never auto on selection).
//
// Mechanics mirror BlankEditPopover: floating-ui placement, focus-trap, portal
// to body, save-on-blur with a force-commit-before-close. The only draft field
// is the URL; on close (Escape / outside-click / Enter) flushAll() pushes a
// pending URL edit in one onChange with preserveSelection:false so onClose can
// move selection cleanly off the block. Alignment commits live (buttons).
// ============================================================================

type SourceTab = 'url' | 'upload';

interface ChangeOptions {
    preserveSelection?: boolean;
}

interface ImageEditPopoverProps {
    referenceElement: HTMLElement | null;
    isOpen: boolean;
    // Identifies the image being edited. Re-syncs draft state when the popover
    // retargets a different block without closing.
    imageId: string;
    initialSrc: string;
    // Sizing — LIVE values, not drafts: alignment commits immediately, and the
    // preview's drag-handles can change width while the popover is open, so the
    // host re-renders us with fresh values. Width gates whether align applies.
    width: number | null;
    align: 'left' | 'right' | null;
    // Activity the image belongs to — required to upload to R2. Undefined in
    // the playground (no persisted activity), where the Upload tab is disabled.
    activityId?: string;
    onChange: (
        attrs: Partial<{
            src: string;
            align: 'left' | 'right' | null;
        }>,
        options?: ChangeOptions,
    ) => void;
    onClose: () => void;
    // Remove the image block entirely. The host clears the selection, which
    // unmounts this popover — no separate onClose call needed afterward.
    onDelete: () => void;
}

type UploadState =
    | { kind: 'idle' }
    | { kind: 'uploading' }
    | { kind: 'error'; message: string };

const MIN_POPOVER_HEIGHT = 160;
const VIEWPORT_PADDING = 12;

export default function ImageEditPopover({
    referenceElement,
    isOpen,
    imageId,
    initialSrc,
    width,
    align,
    activityId,
    onChange,
    onClose,
    onDelete,
}: ImageEditPopoverProps) {
    const [tab, setTab] = useState<SourceTab>('url');
    const [src, setSrc] = useState(initialSrc);
    const [uploadState, setUploadState] = useState<UploadState>({ kind: 'idle' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Popover's own max-height (from floating-ui's size middleware).
    const [maxHeight, setMaxHeight] = useState<number | null>(null);

    const srcRef = useRef(initialSrc);
    const initialSrcRef = useRef(initialSrc);

    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const srcInputRef = useRef<HTMLInputElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        srcRef.current = src;
    }, [src]);

    // Reset drafts only when the popover opens or retargets a different image.
    useEffect(() => {
        if (isOpen) {
            setTab('url');
            setSrc(initialSrc);
            setUploadState({ kind: 'idle' });
            srcRef.current = initialSrc;
            initialSrcRef.current = initialSrc;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, imageId]);

    const { refs, floatingStyles, isPositioned } = useFloating({
        elements: { reference: referenceElement },
        placement: 'bottom-start',
        middleware: [
            offset(4),
            flip(),
            shift({ padding: 8 }),
            size({
                padding: VIEWPORT_PADDING,
                apply({ availableHeight }) {
                    setMaxHeight(
                        Math.max(MIN_POPOVER_HEIGHT, Math.floor(availableHeight)),
                    );
                },
            }),
        ],
        whileElementsMounted: autoUpdate,
        open: isOpen,
    });

    // Focus only after floating-ui has anchored the popover, and never let the
    // focus itself scroll. Before isPositioned, the portaled popover sits at
    // the body's top-left — focusing an input there yanked the window to the
    // top of the page whenever an image low in the document was selected.
    useEffect(() => {
        if (!isOpen || !isPositioned) return;
        const raf = requestAnimationFrame(() => {
            srcInputRef.current?.focus({ preventScroll: true });
            srcInputRef.current?.select();
        });
        return () => cancelAnimationFrame(raf);
    }, [isOpen, isPositioned]);

    const flushAll = () => {
        const trimmedSrc = srcRef.current.trim();
        if (trimmedSrc !== initialSrcRef.current) {
            onChangeRef.current({ src: trimmedSrc }, { preserveSelection: false });
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                flushAll();
                onClose();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as Node | null;
            if (!target) return;
            if (popoverRef.current && popoverRef.current.contains(target)) {
                return;
            }
            if (referenceElement && referenceElement.contains(target)) {
                return;
            }
            flushAll();
            onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, onClose, referenceElement]);

    if (!isOpen) return null;

    const commitSrc = () => {
        const trimmed = src.trim();
        if (trimmed !== initialSrcRef.current) {
            onChange({ src: trimmed });
            initialSrcRef.current = trimmed;
        }
    };

    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        // Reset the input so re-selecting the same file fires onChange again.
        e.target.value = '';
        if (!file || !activityId) return;

        setUploadState({ kind: 'uploading' });
        try {
            const url = await uploadImage(activityId, file);
            // Commit the new src (preserveSelection keeps the popover open) and
            // sync drafts/refs so a later flushAll doesn't re-emit a stale src.
            setSrc(url);
            srcRef.current = url;
            onChange({ src: url });
            initialSrcRef.current = url;
            setUploadState({ kind: 'idle' });
        } catch (err) {
            setUploadState({
                kind: 'error',
                message: err instanceof Error ? err.message : 'Upload failed',
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            flushAll();
            onClose();
        }
    };

    const setRefs = (node: HTMLDivElement | null) => {
        refs.setFloating(node);
        popoverRef.current = node;
    };

    const popoverStyle: React.CSSProperties = {
        ...floatingStyles,
        ...(maxHeight !== null ? { maxHeight: `${maxHeight}px` } : {}),
        // Invisible (but measurable) until anchored — never paint at (0,0).
        ...(isPositioned ? {} : { visibility: 'hidden' as const }),
    };

    return createPortal(
        <FocusTrap
            active={isOpen}
            focusTrapOptions={{
                initialFocus: false,
                returnFocusOnDeactivate: true,
                allowOutsideClick: true,
                escapeDeactivates: false,
                fallbackFocus: () => popoverRef.current ?? document.body,
            }}
        >
            <div
                ref={setRefs}
                className="image-edit-popover"
                style={popoverStyle}
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-label="Edit image source"
            >
                <div className="image-edit-popover__tabs" role="tablist">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={tab === 'url'}
                        className={`image-edit-popover__tab${
                            tab === 'url' ? ' is-active' : ''
                        }`}
                        onClick={() => setTab('url')}
                    >
                        Paste URL
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={tab === 'upload'}
                        className={`image-edit-popover__tab${
                            tab === 'upload' ? ' is-active' : ''
                        }`}
                        onClick={() => setTab('upload')}
                    >
                        Upload
                    </button>
                </div>

                {tab === 'url' ? (
                    <label className="image-edit-popover__field">
                        <span className="image-edit-popover__label">
                            Image URL
                        </span>
                        <input
                            ref={srcInputRef}
                            type="text"
                            className="image-edit-popover__input"
                            value={src}
                            placeholder="https://example.com/image.png"
                            onChange={(e) => setSrc(e.target.value)}
                            onBlur={commitSrc}
                            onKeyDown={handleKeyDown}
                        />
                    </label>
                ) : (
                    <div className="image-edit-popover__field">
                        <span className="image-edit-popover__label">Upload</span>
                        {activityId ? (
                            <>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={ALLOWED_IMAGE_TYPES.join(',')}
                                    className="image-edit-popover__file-input"
                                    onChange={handleFileChange}
                                    disabled={uploadState.kind === 'uploading'}
                                />
                                <button
                                    type="button"
                                    className="image-edit-popover__upload-button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadState.kind === 'uploading'}
                                >
                                    {uploadState.kind === 'uploading'
                                        ? 'Uploading…'
                                        : 'Choose an image…'}
                                </button>
                                {uploadState.kind === 'error' && (
                                    <div className="image-edit-popover__upload-error">
                                        {uploadState.message}
                                    </div>
                                )}
                                <div className="image-edit-popover__hint-text">
                                    PNG, JPEG, GIF, WebP, or AVIF · up to 10 MB.
                                </div>
                            </>
                        ) : (
                            <div className="image-edit-popover__upload-stub">
                                Saving uploads needs a saved activity. For now,
                                switch to{' '}
                                <button
                                    type="button"
                                    className="image-edit-popover__inline-link"
                                    onClick={() => setTab('url')}
                                >
                                    Paste URL
                                </button>
                                .
                            </div>
                        )}
                    </div>
                )}

                <div className="image-edit-popover__field">
                    <span className="image-edit-popover__label">Alignment</span>
                    <div
                        className="image-edit-popover__chips"
                        role="group"
                        aria-label="Image alignment"
                    >
                        {(
                            [
                                ['left', 'Left'],
                                [null, 'Center'],
                                ['right', 'Right'],
                            ] as const
                        ).map(([value, label]) => {
                            const active = align === value;
                            return (
                                <button
                                    key={label}
                                    type="button"
                                    className={`image-edit-popover__chip${
                                        active ? ' is-active' : ''
                                    }`}
                                    aria-pressed={active}
                                    disabled={width === null}
                                    onClick={() => onChange({ align: value })}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                    {width === null && (
                        <div className="image-edit-popover__note">
                            Set a width (drag the side handles) to align the image.
                        </div>
                    )}
                </div>

                <div className="image-edit-popover__hint-text">
                    Alt text and caption live in the block’s Advanced settings.
                    Press Escape or click outside to close.
                </div>

                <button
                    type="button"
                    className="image-edit-popover__delete"
                    onClick={onDelete}
                >
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M3 6h18" />
                        <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                    </svg>
                    Delete image
                </button>
            </div>
        </FocusTrap>,
        document.body,
    );
}
