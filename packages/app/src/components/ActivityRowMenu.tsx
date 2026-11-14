// =============================================================================
// ActivityRowMenu.tsx — a library row's "⋯" menu (author ruling 2026-11-15)
// -----------------------------------------------------------------------------
// The row already carries its everyday icons (row anatomy R1–R7, 2026-10-14);
// the less frequent actions live behind one button so the row does not grow:
//   * Copy student link — the /a/:id URL students open (published only)
//   * Preview           — the published version as students see it, shown
//                         under the row (published only; a draft is previewed
//                         in the editor)
//   * Print             — the print page (any status; it prints the draft)
// A WAI-ARIA menu button: Enter/Space/ArrowDown open it on the first item,
// arrows move, Escape and Tab close it, focus returns to the button.
// =============================================================================

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router';
import { MoreHorizontal } from 'lucide-react';
import { viewerShareUrl } from '../lib/shareUrl';

export default function ActivityRowMenu({
    activityId,
    title,
    published,
    previewOpen,
    onTogglePreview,
    buttonClassName,
}: {
    activityId: string;
    title: string;
    published: boolean;
    previewOpen: boolean;
    onTogglePreview: () => void;
    buttonClassName: string;
}) {
    const [open, setOpen] = useState(false);
    // 'ok' / 'failed' after a copy, for the toast and the live region.
    const [copied, setCopied] = useState<'ok' | 'failed' | null>(null);
    const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => {
        if (copiedTimer.current) clearTimeout(copiedTimer.current);
    }, []);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const items = () => [...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];

    const close = (refocus: boolean) => {
        setOpen(false);
        if (refocus) buttonRef.current?.focus();
    };

    useEffect(() => {
        if (!open) return;
        items()[0]?.focus();
        const onDown = (e: PointerEvent) => {
            const t = e.target as Node;
            if (!menuRef.current?.contains(t) && !buttonRef.current?.contains(t)) setOpen(false);
        };
        document.addEventListener('pointerdown', onDown);
        return () => document.removeEventListener('pointerdown', onDown);
    }, [open]);

    const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
        const list = items();
        const at = list.indexOf(document.activeElement as HTMLElement);
        if (e.key === 'Escape') {
            e.preventDefault();
            close(true);
        } else if (e.key === 'Tab') {
            // Back to the button first, so the browser's own Tab moves on from
            // there rather than from an item that has just been removed.
            close(true);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const step = e.key === 'ArrowDown' ? 1 : -1;
            list[(at + step + list.length) % list.length]?.focus();
        } else if (e.key === 'Home' || e.key === 'End') {
            e.preventDefault();
            (e.key === 'Home' ? list[0] : list[list.length - 1])?.focus();
        }
    };

    const copyLink = async () => {
        close(true);
        let result: 'ok' | 'failed' = 'ok';
        try {
            await navigator.clipboard.writeText(viewerShareUrl(activityId));
        } catch {
            // Clipboard unavailable: say so; the editor's publish panel shows the link.
            result = 'failed';
        }
        setCopied(result);
        if (copiedTimer.current) clearTimeout(copiedTimer.current);
        copiedTimer.current = setTimeout(() => setCopied(null), result === 'ok' ? 1500 : 4000);
    };

    const ITEM = 'block w-full px-3 py-2 text-left text-sm text-ink hover:bg-surface-2 focus:bg-surface-2 focus:outline-none';

    return (
        <span className="relative">
            <button
                ref={buttonRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={`More for ${title}`}
                title="More"
                onClick={() => setOpen((o) => !o)}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowDown' && !open) {
                        e.preventDefault();
                        setOpen(true);
                    }
                }}
                className={buttonClassName}
            >
                <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
            </button>
            {/* Announced, not just shown: the menu has closed by now. A bare
                aria-live span, not role="status": the page's filter count owns
                that role, and one per row would multiply it. */}
            <span aria-live="polite" className="sr-only">
                {copied === 'ok' ? 'Student link copied' : copied === 'failed' ? 'Could not copy the link' : ''}
            </span>
            {copied && (
                <span aria-hidden="true" className="absolute right-0 top-full z-20 mt-1 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs text-canvas">
                    {copied === 'ok' ? 'Link copied' : 'Could not copy: open the activity to see its link'}
                </span>
            )}
            {open && (
                <div
                    ref={menuRef}
                    role="menu"
                    aria-label={`More for ${title}`}
                    onKeyDown={onMenuKey}
                    className="absolute right-0 top-full z-20 mt-1 min-w-[12rem] overflow-hidden rounded-md border border-line bg-canvas py-1 shadow-lg"
                    data-row-menu
                >
                    {published && (
                        <button type="button" role="menuitem" tabIndex={-1} className={ITEM} onClick={() => void copyLink()}>
                            Copy student link
                        </button>
                    )}
                    {published && (
                        <button
                            type="button"
                            role="menuitem"
                            tabIndex={-1}
                            className={ITEM}
                            onClick={() => {
                                close(true);
                                onTogglePreview();
                            }}
                        >
                            {previewOpen ? 'Hide preview' : 'Preview'}
                        </button>
                    )}
                    <Link
                        role="menuitem"
                        tabIndex={-1}
                        to={`/activity/${activityId}/print`}
                        className={ITEM}
                        // A menuitem answers Space as well as Enter; a link only Enter.
                        onKeyDown={(e) => {
                            if (e.key === ' ') {
                                e.preventDefault();
                                e.currentTarget.click();
                            }
                        }}
                    >
                        Print
                    </Link>
                </div>
            )}
        </span>
    );
}
