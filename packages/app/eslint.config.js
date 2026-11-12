import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // ---------------------------------------------------------------------------
  // S5.5 T8 — the renderer is evicted from product code (ruling D10A).
  //
  // The slice's exit criterion is that no shipped code imports
  // @activity/renderer. The package itself lives on until S9 because
  // publish-activity still serves published pages from it — which is exactly
  // why this guard exists: nothing stops autocomplete offering the barrel
  // again, and a re-import would go unnoticed until S9 deletes the package and
  // the app breaks for reasons nobody connects to this change.
  //
  // NOW WHOLE-PACKAGE. It was scoped to src/ while the cross-surface gates
  // legitimately imported the renderer to compare the two surfaces; those
  // retired once the comparison was proven and signed off (S5-abs), so nothing
  // in this package may import it any more — including e2e.
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@activity/renderer',
              message:
                'The renderer is retired (S5.5). Use @activity/viewer for ' +
                'rendering, @activity/graph-kit/static-svg for static figures, ' +
                'and @activity/schema for the font registry and graph types. ' +
                'The cross-surface harnesses that used to import it retired ' +
                'with it once the port was proven and signed off (S5-abs).',
            },
          ],
          patterns: ['@activity/renderer/*'],
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Shell-size review T8 (TP-5, 2026-11-13) — no heavy import across a feature
  // line from a lightweight route.
  //
  // Every large teacher-side cost the review found was ONE static import of
  // this shape: the Bank imported lib/serialize.ts for a guide helper
  // (+296 KiB gz of MathLive and mathjs), the print page imported its form
  // from ActivityConfigDrawer.tsx (+590 KiB of editors). The budget rows in
  // scripts/perf-budgets.mjs (TEACHER_JOURNEYS) catch it after a build; this
  // catches it while the line is being typed. Type-only imports are fine:
  // they vanish at build time — but only as `import type { X }`: with
  // verbatimModuleSyntax an inline `import { type X }` still emits a bare
  // import of the module, so no-import-type-side-effects refuses that form
  // here. The editor routes are exempt because they ARE the editor; dev routes
  // are exempt because they are dev tools. src/progress/ is in scope because
  // AnswerPanel is a lazy route too.
  {
    files: ['src/routes/**/*.{ts,tsx}', 'src/progress/**/*.{ts,tsx}'],
    ignores: [
      'src/routes/ActivityEditor.tsx',
      'src/routes/Playground.tsx',
      'src/routes/Dev*.tsx',
    ],
    rules: {
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/lib/serialize', '**/lib/serialize.ts'],
              allowTypeImports: true,
              message:
                'serialize.ts reaches MathLive and mathjs (~300 KiB gz). A route ' +
                'outside the editor loads it with import() where it is used (see ' +
                'GuidePanel in routes/Bank.tsx). Shell-size review TR1.',
            },
            {
              group: ['**/components/ActivityConfigDrawer', '**/components/ActivityConfigDrawer.tsx'],
              allowTypeImports: true,
              message:
                'The config drawer mounts two Tiptap editors and the calculator. ' +
                'Move what this route needs into a module of its own (as ' +
                'components/PrintSettingsBody.tsx did). Shell-size review TR2.',
            },
          ],
          paths: [
            {
              name: '@activity/graph-kit',
              allowTypeImports: true,
              message:
                "The graph-kit barrel re-exports the mount functions, which pull " +
                'JSXGraph and MathLive. Import a subpath from its package.json ' +
                '`exports` map instead (CLAUDE.md: subpaths, never the barrel).',
            },
          ],
        },
      ],
    },
  },
);
