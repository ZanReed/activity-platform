// =============================================================================
// ImportMarkdownDialog.tsx — paste-markdown import modal
// -----------------------------------------------------------------------------
// An activity-level action (lives in the page header next to PublishControl,
// per the "activity-level actions go in the header" rule), not an editor-
// toolbar control. The teacher pastes markdown; a live summary reports what
// will import and flags anything that degrades; Import hands the converted
// Tiptap blocks back to the parent, which inserts them into the editor.
//
// The converter (markdownToTiptap) lazy-loads markdown-it on open, so the
// parser never touches the initial editor bundle.
// =============================================================================

import { useEffect, useMemo, useState } from 'react';
import { FocusTrap } from 'focus-trap-react';
import type { JSONContent } from '@tiptap/react';
import {
    getMarkdownImporter,
    type ImportResult,
    type MarkdownImporter,
} from '../lib/markdownToTiptap';
import { MARKDOWN_IMPORT_AI_PROMPT } from '../lib/markdownImportPrompt';

const EXAMPLE = `# Warm up

Solve for x:  $2x + 3 = 11$,  x = {{4}}

## Practice {checkpoint}

1. The powerhouse of the cell is the {{mitochondria}}.
2. Water is hydrogen and {{oxygen|O2}}.

![diagram](https://example.com/cell.png)`;

const PRIMARY_BTN =
    'rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50';
const SECONDARY_BTN =
    'rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100';

interface ImportMarkdownDialogProps {
    onClose: () => void;
    onImport: (blocks: JSONContent[]) => void;
}

export default function ImportMarkdownDialog({
    onClose,
    onImport,
}: ImportMarkdownDialogProps) {
    const [text, setText] = useState('');
    const [importer, setImporter] = useState<MarkdownImporter | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const [promptCopied, setPromptCopied] = useState(false);

    // Copy the canonical "format for the importer" instruction so a teacher can
    // paste it into an AI assistant and get importable Markdown back.
    const copyAiPrompt = async () => {
        try {
            await navigator.clipboard.writeText(MARKDOWN_IMPORT_AI_PROMPT);
            setPromptCopied(true);
            setTimeout(() => setPromptCopied(false), 1500);
        } catch {
            /* clipboard write can fail in unsupported contexts; non-fatal */
        }
    };

    // Lazy-load the converter once when the dialog opens.
    useEffect(() => {
        let cancelled = false;
        getMarkdownImporter()
            .then((fn) => !cancelled && setImporter(() => fn))
            .catch(() => !cancelled && setLoadFailed(true));
        return () => {
            cancelled = true;
        };
    }, []);

    // Re-parse on every change once the importer is ready. markdown-it parsing
    // is cheap for paste-sized input; useMemo keeps it off unrelated re-renders.
    const result: ImportResult | null = useMemo(
        () => (importer ? importer(text) : null),
        [importer, text],
    );

    const blockCount = result?.blocks.length ?? 0;
    const problemCount =
        result?.blocks.filter((b) => b.type === 'fillInBlank').length ?? 0;
    const canImport = blockCount > 0;

    const handleImport = () => {
        if (!result || result.blocks.length === 0) return;
        onImport(result.blocks);
        onClose();
    };

    return (
        <FocusTrap
            focusTrapOptions={{
                // Close is driven by our own handlers (Escape keydown + backdrop
                // mousedown), NEVER by focus-trap's onDeactivate. Tying close to
                // onDeactivate breaks under React StrictMode: the dev double-mount
                // unmounts the trap, which fires onDeactivate → closes the dialog,
                // so it vanishes the instant it opens. escapeDeactivates is off for
                // the same reason — Escape is handled below.
                escapeDeactivates: false,
                returnFocusOnDeactivate: true,
                allowOutsideClick: true,
            }}
        >
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
                onMouseDown={(e) => {
                    // Backdrop click closes; clicks inside the panel don't bubble.
                    if (e.target === e.currentTarget) onClose();
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') onClose();
                }}
            >
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="import-md-title"
                    className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl"
                >
                    <div className="border-b border-slate-200 px-5 py-3">
                        <div className="flex items-start justify-between gap-3">
                            <h2
                                id="import-md-title"
                                className="text-base font-semibold text-slate-900"
                            >
                                Import from markdown
                            </h2>
                            <button
                                type="button"
                                onClick={copyAiPrompt}
                                title="Copy a prompt you can paste into ChatGPT or Claude to generate importable markdown"
                                className="shrink-0 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                                {promptCopied ? 'Copied!' : 'Copy AI prompt'}
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Paste markdown below. Use{' '}
                            <code className="rounded bg-slate-100 px-1">
                                {'{{answer|alt}}'}
                            </code>{' '}
                            for fill-in-the-blank answers,{' '}
                            <code className="rounded bg-slate-100 px-1">
                                {'{checkpoint}'}
                            </code>{' '}
                            on a heading to start a checkpoint section, and{' '}
                            <code className="rounded bg-slate-100 px-1">$…$</code>{' '}
                            for math. Or use <strong>Copy AI prompt</strong> to have an
                            assistant write it for you. Imported blocks are added to your
                            activity — nothing is published.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-4">
                        <textarea
                            autoFocus
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={EXAMPLE}
                            spellCheck={false}
                            className="h-64 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />

                        {result && result.warnings.length > 0 && (
                            <ul className="mt-3 space-y-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                {result.warnings.map((w) => (
                                    <li key={w}>• {w}</li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                        <span className="text-xs text-slate-500">
                            {loadFailed
                                ? "Couldn't load the importer — try again."
                                : !importer
                                  ? 'Loading…'
                                  : blockCount === 0
                                    ? 'Nothing to import yet.'
                                    : `Will import ${blockCount} block${blockCount === 1 ? '' : 's'}` +
                                      (problemCount > 0
                                          ? ` · ${problemCount} problem${problemCount === 1 ? '' : 's'}`
                                          : '')}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className={SECONDARY_BTN}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleImport}
                                disabled={!canImport}
                                className={PRIMARY_BTN}
                            >
                                Import
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </FocusTrap>
    );
}
