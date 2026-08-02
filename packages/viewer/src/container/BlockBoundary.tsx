// =============================================================================
// container/BlockBoundary.tsx — per-block error boundary (S3 ruling D12)
// -----------------------------------------------------------------------------
// React unmounts the whole tree above an uncaught render error, so without a
// boundary PER BLOCK a bug in one of ~25 components blanks a student's entire
// worksheet mid-class — the white screen the arc's failure-modes table
// explicitly forbids. This wraps every block: the broken one degrades to a
// labeled placeholder, every sibling keeps working, and the student keeps their
// other answers.
//
// Two rules this encodes, both from the D12 ruling:
//
//  1. THE FALLBACK IS NOT A CHECKED STATE. The family spec reserves the
//     --state-* trios for correct / incorrect / pending / recorded, and calls a
//     component inventing a fifth state a review-blocker. A crash is not a
//     verdict on the student's work, so the fallback draws from the NEUTRAL
//     palette (--vw-color-line / --vw-color-ink-muted) and says nothing about
//     correctness. It is deliberately quiet: the student did nothing wrong, and
//     alarming them mid-worksheet helps no one.
//
//  2. A CRASHED GRADABLE BLOCK IS VISIBLE IN THE CHECK PATH. `onCrash` fires
//     with the block id and whether it was gradable; the container refuses to
//     let a gradable crash pass silently as "all checked" (see
//     ViewerContainer). A student's answer going ungraded with no signal to
//     anyone is worse than the crash itself.
//
// Recovery: `resetKey` (the container passes the served version id) clears the
// error, so a re-fetch or version change gets a clean mount rather than a
// permanently poisoned slot.
// =============================================================================

import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface BlockCrash {
  blockId: string;
  blockType: string;
  /** True when this block accepts graded input — drives the check-path notice. */
  gradable: boolean;
  error: Error;
  componentStack?: string;
}

export interface BlockBoundaryProps {
  blockId: string;
  blockType: string;
  gradable: boolean;
  /** Changing this value re-mounts the subtree and clears any captured error. */
  resetKey?: string;
  onCrash?: (crash: BlockCrash) => void;
  children: ReactNode;
}

interface BlockBoundaryState {
  error: Error | null;
  resetKey?: string;
}

export class BlockBoundary extends Component<
  BlockBoundaryProps,
  BlockBoundaryState
> {
  constructor(props: BlockBoundaryProps) {
    super(props);
    this.state = { error: null, resetKey: props.resetKey };
  }

  static getDerivedStateFromError(error: Error): Partial<BlockBoundaryState> {
    return { error };
  }

  static getDerivedStateFromProps(
    props: BlockBoundaryProps,
    state: BlockBoundaryState,
  ): Partial<BlockBoundaryState> | null {
    if (props.resetKey !== state.resetKey) {
      return { error: null, resetKey: props.resetKey };
    }
    return null;
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onCrash?.({
      blockId: this.props.blockId,
      blockType: this.props.blockType,
      gradable: this.props.gradable,
      error,
      ...(info.componentStack ? { componentStack: info.componentStack } : {}),
    });
  }

  override render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <div
        className="viewer-block-error"
        data-block-error="true"
        data-block-id={this.props.blockId}
        data-block-type={this.props.blockType}
        data-gradable={this.props.gradable ? 'true' : 'false'}
        role="note"
      >
        <p className="viewer-block-error__message">
          This part of the worksheet didn’t load. The rest of your work is safe.
        </p>
        {this.props.gradable ? (
          <p className="viewer-block-error__detail">
            It won’t be checked — let your teacher know.
          </p>
        ) : null}
      </div>
    );
  }
}
