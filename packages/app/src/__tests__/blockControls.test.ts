import { describe, it, expect } from 'vitest';
import { getSchema } from '@tiptap/core';
import { buildEditorExtensions } from '../editor/editorExtensions';
import {
    blockControlsRegistry,
    controlsFor,
} from '../editor/blockControls';

// ============================================================================
// blockControls — the slice-6 control-descriptor registry (stage 0).
// Pure-part coverage: the registry's lookup contract and its parity with the
// real ProseMirror schema. The interaction side (bar appears on selection) is
// covered by the Playwright harness (e2e/block-command-bar.spec.ts).
// ============================================================================

const pmSchema = getSchema(buildEditorExtensions());

describe('blockControls registry', () => {
    it('controlsFor returns the descriptor for a registered type', () => {
        expect(controlsFor('mathBlock')).toBe(
            blockControlsRegistry.mathBlock,
        );
        expect(controlsFor('paragraph')).toBe(
            blockControlsRegistry.paragraph,
        );
        expect(controlsFor('heading')).toBe(blockControlsRegistry.heading);
    });

    it('controlsFor returns null for an unregistered type', () => {
        expect(controlsFor('image')).toBeNull();
        expect(controlsFor('definitelyNotABlock')).toBeNull();
    });

    it('every registered descriptor exposes a primary array (may be empty — universal actions cover those)', () => {
        for (const [name, controls] of Object.entries(blockControlsRegistry)) {
            expect(
                Array.isArray(controls.primary),
                `${name} has no primary array`,
            ).toBe(true);
        }
    });

    it('every primary/advanced entry has a label, icon, and handler', () => {
        for (const [name, controls] of Object.entries(blockControlsRegistry)) {
            const entries = [
                ...controls.primary,
                ...(controls.advanced?.flatMap((g) => g.entries) ?? []),
            ];
            for (const entry of entries) {
                expect(entry.label, `${name} entry missing label`).toBeTruthy();
                expect(entry.icon, `${name} entry missing icon`).toBeTruthy();
                expect(
                    typeof entry.onActivate,
                    `${name} entry '${entry.label}' missing onActivate`,
                ).toBe('function');
            }
        }
    });

    // Parity guard: a descriptor keyed to a node type that does not exist in
    // the editor schema is dead code (a typo, or a renamed node). The host's
    // lookup would silently never fire for it.
    it('every registry key is a real editor node type', () => {
        for (const name of Object.keys(blockControlsRegistry)) {
            expect(
                pmSchema.nodes[name],
                `blockControlsRegistry has '${name}' but no such node exists ` +
                    `in the editor schema — fix the key or the extension`,
            ).toBeDefined();
        }
    });
});
