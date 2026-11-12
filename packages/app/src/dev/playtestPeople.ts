// The people the playtest bar offers, from the one accounts file the seed
// script also reads (P2).
import accounts from './playtestAccounts.json';

export interface PlaytestPerson {
    key: string;
    email: string;
    name: string;
    role: 'teacher' | 'student';
}

export const PLAYTEST_PEOPLE: PlaytestPerson[] = [
    { ...accounts.teacher, role: 'teacher' },
    ...accounts.students.map((s) => ({ ...s, role: 'student' as const })),
];
