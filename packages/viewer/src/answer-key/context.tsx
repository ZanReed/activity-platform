// =============================================================================
// answer-key/context.tsx — the teacher-only answer channel (S5.5 T2, D3A)
// -----------------------------------------------------------------------------
// The second channel from ruling D3A. Components read their answers from here
// rather than from the document they render, which is what lets the document
// stay the sanitized one — the shape whose defining property is that answers
// were removed.
//
// THE ABSENCE IS THE SAFETY PROPERTY. There is no `showAnswers` flag to get
// wrong: a tree with no provider hands every component `undefined`, so the
// student route cannot print an answer even if a component asks for one. The
// student route never imports this module, and the teacher route mounts the
// provider only while its Show Answers toggle is on — so "can this surface
// reveal answers?" is a question about the import graph, which a test can
// answer, rather than about a boolean that travelled correctly.
//
// The map is CANONICAL and position-free (see types.ts). Components derive the
// letter or number they print from the order they are rendering, so the same
// key stays correct across every shuffled print version.
// =============================================================================

import { createContext, useContext, type ReactNode } from 'react';
import type { AnswerKeyMap, BlockAnswerKey } from './types.js';

/** null (not {}) is the no-provider default, so "no answer channel at all" and
 *  "an empty answer key" stay distinguishable to anything that cares. */
const AnswerKeyContext = createContext<AnswerKeyMap | null>(null);

export interface AnswerKeyProviderProps {
  readonly answers: AnswerKeyMap;
  readonly children: ReactNode;
}

/**
 * Supplies the answer key to the subtree. Mounted ONLY by the teacher print
 * route, and only when the teacher has asked for answers.
 */
export function AnswerKeyProvider({
  answers,
  children,
}: AnswerKeyProviderProps): ReactNode {
  return (
    <AnswerKeyContext.Provider value={answers}>
      {children}
    </AnswerKeyContext.Provider>
  );
}

/**
 * One block's answers, or undefined when there is no answer channel — which is
 * every student render. Components must treat undefined as their normal path
 * rather than as an error state.
 */
export function useBlockAnswerKey(blockId: string): BlockAnswerKey | undefined {
  return useContext(AnswerKeyContext)?.[blockId];
}
