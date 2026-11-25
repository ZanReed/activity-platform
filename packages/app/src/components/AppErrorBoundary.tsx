// =============================================================================
// AppErrorBoundary — the route-level net (review 2026-11-26, C5)
// -----------------------------------------------------------------------------
// The only boundary used to be per block, inside the viewer (BlockBoundary).
// A render throw anywhere else — a teacher route, Home, FactsEntry — unmounted
// the whole tree and left a blank page with nothing to press.
//
// This catches it, says so, and offers a Refresh BUTTON. It never reloads on
// its own (author ruling 2026-10-04: never reload under a working user — they
// may have unsaved work in another part of the page, or be mid-thought).
// `resetKey` is the pathname, so navigating elsewhere clears the error
// instead of leaving every later page poisoned.
//
// It sits in the student shell, so it is deliberately tiny: no icons, no
// copy module, no reporting call (a teacher-side error log needs a ruling;
// review C5).
// =============================================================================

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  resetKey: string;
  children: ReactNode;
}

interface State {
  failed: boolean;
  resetKey: string;
}

export default class AppErrorBoundary extends Component<Props, State> {
  override state: State = { failed: false, resetKey: this.props.resetKey };

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey === state.resetKey ? null : { failed: false, resetKey: props.resetKey };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[app] a page failed to render:', error, info.componentStack);
  }

  override render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="p-8" role="alert" data-app-error="">
        <p className="mb-4">Something went wrong on this page.</p>
        {/* Focus moves here: the page a keyboard user was on just vanished. */}
        <button type="button" className="rounded border px-3 py-1 font-semibold" autoFocus onClick={() => location.reload()}>
          Refresh
        </button>
      </div>
    );
  }
}
