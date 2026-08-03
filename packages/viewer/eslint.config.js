// Mirrors packages/app/eslint.config.js minus the vite-specific react-refresh
// plugin (this package has no HMR exports). Root `pnpm -r lint` picks this up —
// before S3 the viewer had no lint script and was silently skipped.
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
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
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
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
  // SCOPED TO SOURCE, DELIBERATELY. packages/app/e2e is exempt: the print
  // parity gate, the answer-key gate and the contact-sheet generator import the
  // renderer ON PURPOSE, because comparing the two surfaces is the whole point
  // of them. They retire with the renderer, not before it.
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@activity/renderer',
              message:
                'The renderer is retired from product code (S5.5 T8). Use ' +
                '@activity/viewer for rendering, ' +
                '@activity/graph-kit/static-svg for static figures, and ' +
                '@activity/schema for the font registry and graph types. ' +
                'Test harnesses that compare the two surfaces live in e2e/.',
            },
          ],
          patterns: ['@activity/renderer/*'],
        },
      ],
    },
  },
);
