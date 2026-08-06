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
  // SCOPED TO SOURCE, DELIBERATELY — though the original justification has
  // thinned (A27): the cross-surface parity gate and the contact-sheet
  // generator this exemption was written for were DELETED in the S5.5
  // retirement (29ea4f5), and no e2e imports the renderer today. The scope
  // stays src-only because tests/ may still legitimately reach the renderer
  // (the glossary bond in the RENDERER's suite is the pattern — a bond that
  // dies with the package it guards, C8).
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
