// Registers @testing-library/jest-dom's matchers (toBeInTheDocument,
// toHaveAccessibleName, ...) on vitest's expect — the assertion vocabulary the
// 6.1A a11y conformance cases are written in. Loaded for every suite via
// vitest.config.ts setupFiles; a no-op burden for the node-env suites.
import '@testing-library/jest-dom/vitest';

// RTL only self-registers its afterEach cleanup when vitest runs with
// globals:true (we don't — suites import describe/it explicitly). Without
// this, every render() leaks its tree into the next test's document and
// role queries start matching stale duplicates — the harness sanity spec
// caught exactly that on its first run. Guarded so the node-env suites
// (no document) skip it.
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  if (typeof document !== 'undefined') cleanup();
});
