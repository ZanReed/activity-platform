// The /facts (= /practice) route's resting card: one title, a few lines, one
// action. Shared by the entry screens and mixed practice's done screen.
// ⚠ Utility classes only from the set FactsEntry already used: Tailwind builds
// ONE stylesheet for the shell, which has almost no room left.
import type { ReactNode } from 'react';

export const CARD = 'mx-auto max-w-sm rounded-lg border border-line bg-canvas p-6 text-center shadow-sm';

export function Card({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className={CARD}>
            <h1 className="text-2xl font-bold text-ink">{title}</h1>
            {children}
        </div>
    );
}
