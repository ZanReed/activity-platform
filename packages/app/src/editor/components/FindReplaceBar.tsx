// =============================================================================
// FindReplaceBar.tsx — find and replace in the activity editor (2026-11-15)
// -----------------------------------------------------------------------------
// Opened by ⌘F while the cursor is in the activity, or the toolbar's Find
// button; loaded on first use (Editor.tsx). Matching and replacing live in
// ../findReplace.ts, the highlights in ../extensions/FindHighlight.ts.
//
// Enter = next match, Shift+Enter = previous, Escape closes and puts the
// cursor back in the activity. "Replace" changes the current match in the
// main text; "Replace all" also reaches the answer fields, in one undo step.
// =============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { TextSelection } from '@tiptap/pm/state';
import { countInFields, replaceAll } from '../findReplace';
import { findHighlightKey, type FindMeta, type FindState } from '../extensions/FindHighlight';

const BTN =
    'rounded border border-line-strong px-2 py-1 text-xs font-medium text-strong hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50';
const INPUT =
    'min-w-0 flex-1 rounded border border-line-strong bg-canvas px-2 py-1 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';

export default function FindReplaceBar({ editor, onClose }: { editor: Editor; onClose: () => void }) {
    const [query, setQuery] = useState(() => {
        // Open with the selected words, as editors usually do.
        const { from, to, empty } = editor.state.selection;
        return empty ? '' : editor.state.doc.textBetween(from, to, ' ').slice(0, 200);
    });
    const [replacement, setReplacement] = useState('');
    const [matchCase, setMatchCase] = useState(false);
    const [status, setStatus] = useState('');
    const findRef = useRef<HTMLInputElement>(null);
    const [, rerender] = useState(0);

    const send = (meta: FindMeta) => editor.view.dispatch(editor.state.tr.setMeta(findHighlightKey, meta));
    const state = (): FindState | undefined => findHighlightKey.getState(editor.state);

    useEffect(() => {
        findRef.current?.focus();
        findRef.current?.select();
    }, []);

    // Re-find whenever the query or case changes; clear on close.
    useEffect(() => {
        send({ query, opts: { matchCase }, current: 0 });
        setStatus('');
    }, [query, matchCase]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => () => {
        if (!editor.isDestroyed) send({ query: '' });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // The counts follow the document as it changes under the open bar.
    useEffect(() => {
        const tick = () => rerender((n) => n + 1);
        editor.on('transaction', tick);
        return () => {
            editor.off('transaction', tick);
        };
    }, [editor]);

    const s = state();
    const matches = s?.matches ?? [];
    const current = s?.current ?? -1;
    // Recounted when the document changes, not on every caret move.
    const doc = editor.state.doc;
    const inFields = useMemo(
        () => (query === '' ? 0 : countInFields(doc, query, { matchCase })),
        [doc, query, matchCase],
    );

    // Show a match without taking focus from the bar: scroll it into view.
    const goTo = (index: number) => {
        const n = matches.length;
        if (n === 0) return;
        const i = ((index % n) + n) % n;
        send({ current: i });
        const m = matches[i]!;
        const dom = editor.view.domAtPos(m.from).node;
        (dom instanceof Element ? dom : dom.parentElement)?.scrollIntoView({ block: 'center' });
    };

    const replaceOne = () => {
        const m = matches[current];
        if (!m) return;
        const tr = editor.state.tr;
        if (replacement === '') tr.delete(m.from, m.to);
        else tr.insertText(replacement, m.from, m.to);
        // On to the next match AFTER the new text — which may itself contain
        // the query (Sam → Samuel), and must not be found again.
        tr.setMeta(findHighlightKey, { currentFrom: m.from + replacement.length } satisfies FindMeta);
        editor.view.dispatch(tr);
        setStatus('Replaced 1.');
    };

    const doReplaceAll = () => {
        const tr = editor.state.tr;
        const n = replaceAll(tr, query, replacement, { matchCase });
        if (n === 0) return;
        editor.view.dispatch(tr);
        setStatus(`Replaced ${n}. Undo (⌘Z) puts them all back.`);
    };

    const close = () => {
        const m = matches[current];
        onClose();
        // Back to the activity, at the match the teacher was looking at.
        const chain = editor.chain().focus();
        if (m) chain.command(({ tr }) => {
            tr.setSelection(TextSelection.create(tr.doc, m.from, m.to));
            return true;
        });
        chain.run();
    };

    const total = matches.length + inFields;
    const countText =
        query === ''
            ? ''
            : total === 0
              ? 'No matches'
              : `${matches.length === 0 ? 'None' : `${current + 1} of ${matches.length}`} in the text` +
                (inFields > 0 ? ` · ${inFields} in answer fields and titles` : '');

    return (
        <div
            role="search"
            aria-label="Find and replace"
            data-find-bar
            className="sticky top-12 z-20 mb-3 rounded-md border border-line bg-surface p-2 shadow-sm"
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    close();
                }
            }}
        >
            <div className="flex flex-wrap items-center gap-2">
                <input
                    ref={findRef}
                    type="text"
                    data-find-input
                    aria-label="Find"
                    placeholder="Find"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            goTo(current + (e.shiftKey ? -1 : 1));
                        }
                    }}
                    className={INPUT}
                />
                <span className="text-xs text-muted" aria-live="polite" data-find-count>
                    {countText}
                </span>
                <button type="button" className={BTN} disabled={matches.length === 0} onClick={() => goTo(current - 1)} aria-label="Previous match">
                    ↑
                </button>
                <button type="button" className={BTN} disabled={matches.length === 0} onClick={() => goTo(current + 1)} aria-label="Next match">
                    ↓
                </button>
                <label className="flex items-center gap-1 text-xs text-muted">
                    <input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} />
                    Match case
                </label>
                <button type="button" className={BTN} onClick={close}>
                    Close
                </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                    type="text"
                    aria-label="Replace with"
                    placeholder="Replace with"
                    value={replacement}
                    onChange={(e) => setReplacement(e.target.value)}
                    className={INPUT}
                />
                <button type="button" className={BTN} disabled={current < 0} onClick={replaceOne}>
                    Replace
                </button>
                <button type="button" className={BTN} disabled={total === 0} onClick={doReplaceAll}>
                    Replace all
                </button>
            </div>
            <p className="mt-1.5 text-xs text-muted">
                Replace all also changes answer choices, feedback, hints, titles and alt text. It doesn’t change
                the correct answers you’ve set, the activity’s name or vocabulary definitions.
            </p>
            {status && (
                <p className="mt-1.5 text-xs text-muted" role="status">
                    {status}
                </p>
            )}
        </div>
    );
}
