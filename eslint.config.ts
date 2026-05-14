import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // PizzaSequencer instances live in refs and are intentionally read during render
      // to drive visuals (guarded by the pizzasReady flag). Downgrade from error to warn.
      'react-hooks/refs': 'warn',
      // setPizzasReady(true) is a one-time init flag, not a cascading state loop.
      'react-hooks/set-state-in-effect': 'warn',
    },
  }
);
