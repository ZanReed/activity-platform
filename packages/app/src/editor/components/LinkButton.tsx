// =============================================================================
// LinkButton.tsx — the toolbar's Link control (schema-shortlist.md S7)
// -----------------------------------------------------------------------------
// Select text, press Link, type or paste an address. https only (author
// ruling 2026-11-15): a bare "example.com" is read as https://example.com, and
// anything that still isn't https is refused with a reason. On a link already,
// the box shows its address and offers Remove. Students open links in a new
// tab; paper prints the address after the text.
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Link2 } from 'lucide-react';
import { canonicalHttpsUrl } from '../starterKitOptions';

export function normalizeLinkInput(raw: string): string {
    const v = raw.trim();
    if (v === '') return v;
    // A bare host ("example.com/page", "example.com:8080/x") becomes https; an
    // explicit scheme ("http://", "javascript:", "mailto:") is left as typed so
    // it is refused, not rewritten.
    const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(v);
    const explicit = scheme !== null && (v.slice(scheme[0].length).startsWith('//') || /^(javascript|data|vbscript|mailto|tel|file|blob)$/i.test(scheme[1]!));
    return explicit ? v : `https://${v}`;
}

export default function LinkButton({ target, disabled }: { target: Editor; disabled?: boolean }) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    // The editor the box was opened FOR. Typing in the box blurs a nested
    // field (a hint, a choice), and the toolbar's target then falls back to
    // the main document; the link must still land on the field's text.
    const bound = useRef<Editor>(target);
    const active = target.isActive('link');

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    const begin = () => {
        bound.current = target;
        setValue(active ? String(target.getAttributes('link').href ?? '') : '');
        setError(null);
        setOpen(true);
    };
    const apply = () => {
        const href = canonicalHttpsUrl(normalizeLinkInput(value));
        if (!href) {
            setError('Use a web address that starts with https://');
            return;
        }
        const ed = bound.current;
        if (ed.state.selection.empty && !ed.isActive('link')) {
            setError('Select the words to link first.');
            return;
        }
        ed.chain().focus().extendMarkRange('link').setLink({ href }).run();
        setOpen(false);
    };
    const remove = () => {
        bound.current.chain().focus().extendMarkRange('link').unsetLink().run();
        setOpen(false);
    };

    return (
        <span className="relative inline-flex">
            <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => (open ? setOpen(false) : begin())}
                disabled={disabled}
                title="Link (https only)"
                aria-label="Link"
                aria-pressed={active}
                aria-expanded={open}
                className={`min-w-[32px] rounded px-2 py-1 text-sm font-medium transition ${
                    disabled
                        ? 'cursor-not-allowed bg-canvas text-disabled'
                        : active
                          ? 'bg-primary text-white'
                          : 'bg-canvas text-strong hover:bg-surface-3'
                }`}
            >
                <Link2 size={14} aria-hidden="true" />
            </button>
            {open && (
                <span
                    role="group"
                    aria-label="Link address"
                    data-link-box
                    className="absolute left-0 top-full z-50 mt-1 flex w-72 flex-col gap-1.5 rounded-md border border-line bg-canvas p-2 shadow-lg"
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            setOpen(false);
                            target.commands.focus();
                        }
                    }}
                >
                    <input
                        ref={inputRef}
                        type="url"
                        value={value}
                        placeholder="https://…"
                        aria-label="Web address"
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                apply();
                            }
                        }}
                        className="rounded border border-line-strong bg-canvas px-2 py-1 text-sm text-ink"
                    />
                    {error && (
                        <span className="text-xs text-danger" role="alert">
                            {error}
                        </span>
                    )}
                    <span className="flex justify-end gap-2">
                        {active && (
                            <button type="button" onClick={remove} className="text-xs font-medium text-muted underline">
                                Remove link
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={apply}
                            className="rounded bg-primary px-2 py-1 text-xs font-semibold text-white"
                        >
                            {active ? 'Update' : 'Add link'}
                        </button>
                    </span>
                </span>
            )}
        </span>
    );
}
