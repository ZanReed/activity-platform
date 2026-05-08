// packages/app/src/editor/JsonInspector.tsx
import type { JSONContent } from '@tiptap/react';
import { useState } from 'react';

interface JsonInspectorProps {
    json: JSONContent;
}

/**
 * Dev-only side panel showing live Tiptap document JSON.
 *
 * Used in /playground to build intuition for the shape the serialize
 * layer will eventually translate into ActivityDocument. Not part of the
 * production teacher editor experience.
 */
export default function JsonInspector({ json }: JsonInspectorProps) {
    const [copied, setCopied] = useState(false);
    const formatted = JSON.stringify(json, null, 2);
    const count = countNodes(json);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(formatted);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Clipboard API unavailable (e.g., insecure context). Silent failure
            // is fine for a dev tool — the JSON is still visible to copy by hand.
        }
    };

    return (
        <aside
        className="sticky top-8 flex max-h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
        aria-label="Editor JSON inspector"
        >
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-700">Editor JSON</h2>
        <button
        type="button"
        onClick={handleCopy}
        className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-500"
        >
        {copied ? 'Copied' : 'Copy'}
        </button>
        </header>
        <pre className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-800">
        <code>{formatted}</code>
        </pre>
        <footer className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500">
        {count} {count === 1 ? 'node' : 'nodes'}
        </footer>
        </aside>
    );
}

function countNodes(node: JSONContent): number {
    let count = 1;
    if (node.content) {
        for (const child of node.content) {
            count += countNodes(child);
        }
    }
    return count;
}
