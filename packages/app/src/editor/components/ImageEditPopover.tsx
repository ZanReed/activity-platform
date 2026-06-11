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

// ============================================================================
// ImageEditPopover — anchored popover for editing an image block's fields.
// ----------------------------------------------------------------------------
// Mirrors BlankEditPopover's mechanics (floating-ui placement, focus-trap,
// portal to body, save-on-blur with force-commit-before-close). Fields:
//   - Source: a tab pair (Paste URL / Upload). Drop 1 ships the URL tab; the
//     Upload tab is a stub pending the R2 upload edge function (Drop 2).
//   - Alt text (accessibility).
//   - Caption (optional figcaption).
//
// Editing model — draft-then-flush: each field commits its value via onChange
// on blur (normal path); on close (Escape / outside-click / Enter) flushAll()
// pushes any pending edits in one bundled onChange with preserveSelection:false
// so onClose can move the selection cleanly off the block.
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
    initialAlt: string;
    initialCaption: string;
    onChange: (
        attrs: Partial<{ src: string; alt: string; caption: string }>,
        options?: ChangeOptions,
    ) => void;
    onClose: () => void;
}

const MIN_POPOVER_HEIGHT = 160;
const VIEWPORT_PADDING = 12;

export default function ImageEditPopover({
    referenceElement,
    isOpen,
    imageId,
    initialSrc,
    initialAlt,
    initialCaption,
    onChange,
    onClose,
}: ImageEditPopoverProps) {
    const [tab, setTab] = useState<SourceTab>('url');
    const [src, setSrc] = useState(initialSrc);
    const [alt, setAlt] = useState(initialAlt);
    const [caption, setCaption] = useState(initialCaption);

    const [maxHeight, setMaxHeight] = useState<number | null>(null);

    const srcRef = useRef(initialSrc);
    const altRef = useRef(initialAlt);
    const captionRef = useRef(initialCaption);

    const initialSrcRef = useRef(initialSrc);
    const initialAltRef = useRef(initialAlt);
    const initialCaptionRef = useRef(initialCaption);

    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const srcInputRef = useRef<HTMLInputElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        srcRef.current = src;
    }, [src]);
    useEffect(() => {
        altRef.current = alt;
    }, [alt]);
    useEffect(() => {
        captionRef.current = caption;
    }, [caption]);

    // Reset drafts only when the popover opens or retargets a different image.
    useEffect(() => {
        if (isOpen) {
            setTab('url');
            setSrc(initialSrc);
            setAlt(initialAlt);
            setCaption(initialCaption);
            srcRef.current = initialSrc;
            altRef.current = initialAlt;
            captionRef.current = initialCaption;
            initialSrcRef.current = initialSrc;
            initialAltRef.current = initialAlt;
            initialCaptionRef.current = initialCaption;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, imageId]);

    useEffect(() => {
        if (!isOpen) return;
        const raf = requestAnimationFrame(() => {
            srcInputRef.current?.focus();
            srcInputRef.current?.select();
        });
        return () => cancelAnimationFrame(raf);
    }, [isOpen]);

    const flushAll = () => {
        const updates: Partial<{ src: string; alt: string; caption: string }> =
            {};

        const trimmedSrc = srcRef.current.trim();
        if (trimmedSrc !== initialSrcRef.current) updates.src = trimmedSrc;

        if (altRef.current !== initialAltRef.current) updates.alt = altRef.current;

        const trimmedCaption = captionRef.current.trim();
        if (trimmedCaption !== initialCaptionRef.current) {
            updates.caption = trimmedCaption;
        }

        if (Object.keys(updates).length > 0) {
            onChangeRef.current(updates, { preserveSelection: false });
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, onClose, referenceElement]);

    const { refs, floatingStyles } = useFloating({
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

    if (!isOpen) return null;

    const commitSrc = () => {
        const trimmed = src.trim();
        if (trimmed !== initialSrcRef.current) {
            onChange({ src: trimmed });
            initialSrcRef.current = trimmed;
        }
    };

    const commitAlt = () => {
        if (alt !== initialAltRef.current) {
            onChange({ alt });
            initialAltRef.current = alt;
        }
    };

    const commitCaption = () => {
        const trimmed = caption.trim();
        if (trimmed !== initialCaptionRef.current) {
            onChange({ caption: trimmed });
            initialCaptionRef.current = trimmed;
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
                aria-label="Edit image"
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
                        <div className="image-edit-popover__upload-stub">
                            File upload is coming next. For now, switch to{' '}
                            <button
                                type="button"
                                className="image-edit-popover__inline-link"
                                onClick={() => setTab('url')}
                            >
                                Paste URL
                            </button>
                            .
                        </div>
                    </div>
                )}

                <label className="image-edit-popover__field">
                    <span className="image-edit-popover__label">Alt text</span>
                    <input
                        type="text"
                        className="image-edit-popover__input"
                        value={alt}
                        placeholder="Describe the image for accessibility"
                        onChange={(e) => setAlt(e.target.value)}
                        onBlur={commitAlt}
                        onKeyDown={handleKeyDown}
                    />
                </label>

                <label className="image-edit-popover__field">
                    <span className="image-edit-popover__label">
                        Caption (optional)
                    </span>
                    <input
                        type="text"
                        className="image-edit-popover__input"
                        value={caption}
                        placeholder="Shown beneath the image"
                        onChange={(e) => setCaption(e.target.value)}
                        onBlur={commitCaption}
                        onKeyDown={handleKeyDown}
                    />
                </label>

                <div className="image-edit-popover__hint-text">
                    Press Escape or click outside to close.
                </div>
            </div>
        </FocusTrap>,
        document.body,
    );
}
