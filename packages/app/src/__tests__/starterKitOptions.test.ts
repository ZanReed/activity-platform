// @vitest-environment jsdom
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { Editor, getSchema } from '@tiptap/core';
import { describe, expect, it } from 'vitest';
import { buildEditorExtensions } from '../editor/editorExtensions';

// Strikethrough and links used to be makeable in the editor and were then
// dropped by the next save (serialize.ts keeps only SIMPLE_MARK_TYPES). The
// fix is UNSAVED_STARTER_KIT_MARKS in every StarterKit.configure call.

const SRC = join(__dirname, '..');

function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sourceFiles(path);
        return /\.(ts|tsx)$/.test(name) ? [path] : [];
    });
}

describe('StarterKit marks the schema cannot save', () => {
    it('the main editor schema has no strike or link mark', () => {
        const schema = getSchema(buildEditorExtensions());
        expect(schema.marks.strike).toBeUndefined();
        expect(schema.marks.link).toBeUndefined();
        // Positive control: the marks a teacher can save are still there.
        expect(schema.marks.bold).toBeDefined();
        expect(schema.marks.underline).toBeDefined();
    });

    it('pasted HTML keeps a link\'s text and a struck word, as plain text', () => {
        const editor = new Editor({ extensions: buildEditorExtensions() });
        editor.commands.insertContent('<p>see <a href="https://example.com">the site</a> and <s>this</s></p>');
        const json = JSON.stringify(editor.getJSON());
        expect(json).toContain('the site');
        expect(json).toContain('this');
        expect(json).not.toMatch(/"type":"(link|strike)"/);
        editor.destroy();
    });

    it('every StarterKit.configure call spreads UNSAVED_STARTER_KIT_MARKS', () => {
        const sites = sourceFiles(SRC).flatMap((path) => {
            const text = readFileSync(path, 'utf8');
            const calls = text.split('StarterKit.configure(').slice(1);
            return calls.map((after) => ({
                file: relative(SRC, path),
                spreads: after.slice(0, 200).includes('...UNSAVED_STARTER_KIT_MARKS'),
            }));
        });
        // Five editors configure StarterKit today; a sixth must spread it too.
        expect(sites.length).toBeGreaterThanOrEqual(5);
        expect(sites.filter((s) => !s.spreads)).toEqual([]);
    });
});
