import { useState } from 'react';
import type { JSONContent } from '@tiptap/react';
import Editor from '../editor/Editor';
import JsonInspector from '../editor/JsonInspector';

const helloDoc: JSONContent = {
    type: 'doc',
    content: [
        {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Tiptap playground' }],
        },
        {
            type: 'paragraph',
            content: [
                { type: 'text', text: 'Inline math example: the quadratic formula is ' },
                {
                    type: 'mathInline',
                    attrs: { latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
                },
                { type: 'text', text: '. Click the math to edit it.' },
            ],
        },
        {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Block math example below:' }],
        },
        {
            type: 'mathBlock',
            attrs: { latex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}' },
        },
        {
            type: 'paragraph',
            content: [
                { type: 'text', text: 'Toolbar: ' },
                { type: 'text', text: 'ƒx', marks: [{ type: 'code' }] },
                { type: 'text', text: ' for inline, ' },
                { type: 'text', text: 'Σ', marks: [{ type: 'code' }] },
                { type: 'text', text: ' for block.' },
            ],
        },
    ],
};

export default function Playground() {
    const [json, setJson] = useState<JSONContent>(helloDoc);

    return (
        <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-900">Playground</h1>
        <p className="mt-2 mb-8 text-slate-600">
        Tiptap editor sandbox — dev only.
        </p>
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <Editor initialContent={helloDoc} onUpdate={setJson} />
        <JsonInspector json={json} />
        </div>
        </div>
        </main>
    );
}
