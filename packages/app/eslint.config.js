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
);
