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
        className="sticky top-8 flex max-h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-lg border border-line bg-canvas shadow-sm"
        aria-label="Editor JSON inspector"
        >
        <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-strong">Editor JSON</h2>
        <button
        type="button"
        onClick={handleCopy}
        className="rounded-md border border-line px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-accent"
        >
        {copied ? 'Copied' : 'Copy'}
        </button>
        </header>
        <pre className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-strong">
        <code>{formatted}</code>
        </pre>
        <footer className="border-t border-line px-4 py-2 text-xs text-muted">
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
