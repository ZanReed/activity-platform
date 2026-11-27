// The session context OBJECT, apart from SessionContext.tsx (review C5 slice 2).
// lib/useLoad.ts reads the signed-in user's id straight from it, so the many
// tests that mock SessionContext.tsx whole still give useLoad a real (empty)
// context instead of a missing export.
import { createContext, useContext } from 'react';
import type { SessionContextValue } from './SessionContext';

export const SessionContext = createContext<SessionContextValue | undefined>(undefined);

/** The signed-in user's id; null signed out and outside a provider (tests,
 *  dev pages), where useSession would throw. useLoad forgets its shared
 *  copies when this changes. */
export function useSessionUserId(): string | null {
    return useContext(SessionContext)?.session?.user.id ?? null;
}
