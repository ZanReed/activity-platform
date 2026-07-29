// =============================================================================
// harness.test.tsx — the component-harness sanity spec (S3 ruling D6)
// -----------------------------------------------------------------------------
// Proves the harness itself: jsdom environment active for tests/components/,
// React 19 renders, Testing Library queries + user interaction work, and the
// jest-dom matchers from tests/setup.ts are registered. If this suite fails,
// fix the harness before touching any component suite — every conformance and
// component test sits on exactly this stack.
//
// Kept deliberately tiny and dependency-free of viewer source: it must stay
// green even when a component is mid-refactor.
// =============================================================================

import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

function HarnessProbe() {
  const [checked, setChecked] = useState(false);
  return (
    <section aria-label="harness probe">
      <p>viewer harness</p>
      <button type="button" onClick={() => setChecked(true)}>
        Check
      </button>
      <output aria-live="polite">{checked ? 'correct' : 'unchecked'}</output>
    </section>
  );
}

describe('component harness sanity', () => {
  it('runs under jsdom with a real document', () => {
    expect(typeof document).toBe('object');
    expect(document.body).toBeInstanceOf(HTMLElement);
  });

  it('renders React 19 and queries via Testing Library roles', () => {
    render(<HarnessProbe />);
    expect(screen.getByRole('region', { name: 'harness probe' })).toBeInTheDocument();
    expect(screen.getByText('viewer harness')).toBeVisible();
  });

  it('drives interaction and observes state through the accessibility tree', () => {
    render(<HarnessProbe />);
    expect(screen.getByRole('status')).toHaveTextContent('unchecked');
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByRole('status')).toHaveTextContent('correct');
  });
});
