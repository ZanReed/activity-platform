import { useState } from 'react';
import type { JSONContent } from '@tiptap/react';
import type { ActivityFont, Typography } from '@activity/schema';
import { FONT_MENU, FONT_REGISTRY } from '@activity/renderer';
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
    // Dev stand-in for meta.typography (the real editor gets it from the
    // activity's meta via the config drawer) — lets the canvas's WYSIWYG font
    // path be exercised here without an activity/session.
    const [typography, setTypography] = useState<Typography>({
        font: 'default',
        fontSize: 16,
    });

    return (
        <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-900">Playground</h1>
        <p className="mt-2 mb-4 text-slate-600">
        Tiptap editor sandbox — dev only.
        </p>
        <div className="mb-4 flex items-center gap-4 text-sm text-slate-700">
        <label className="flex items-center gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Font
        </span>
        <select
        data-playground-font
        className="rounded-md border border-slate-300 bg-white px-2 py-1"
        value={typography.font}
        onChange={(e) =>
            setTypography((t) => ({
                ...t,
                font: e.target.value as ActivityFont,
            }))
        }
        >
        {FONT_MENU.map((f) => (
            <option key={f} value={f}>
            {FONT_REGISTRY[f].label}
            </option>
        ))}
        </select>
        </label>
        <label className="flex items-center gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Base size
        </span>
        <input
        data-playground-font-size
        type="number"
        min={12}
        max={24}
        className="w-16 rounded-md border border-slate-300 bg-white px-2 py-1"
        value={typography.fontSize}
        onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n) && n >= 12 && n <= 24)
                setTypography((t) => ({ ...t, fontSize: n }));
        }}
        />
        </label>
        </div>
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <Editor
        initialContent={helloDoc}
        onUpdate={setJson}
        typography={typography}
        />
        <JsonInspector json={json} />
        </div>
        </div>
        </main>
    );
}
