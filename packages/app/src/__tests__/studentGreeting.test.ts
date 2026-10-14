// studentGreeting — the student Home's heading (student review S8, 2026-10-14).
// A first name from Google's metadata, never the raw email.
import { describe, expect, it } from 'vitest';
import { studentGreeting } from '../routes/Home';

describe('studentGreeting', () => {
    it('greets by first name from full_name, then name', () => {
        expect(studentGreeting({ full_name: 'Alex Tane Smith' })).toBe('Hi, Alex');
        expect(studentGreeting({ name: '  Mere  Paki ' })).toBe('Hi, Mere');
    });
    it('falls back to a plain greeting, never the email', () => {
        expect(studentGreeting({ email: 'a@school.org' })).toBe('Hi there');
        expect(studentGreeting(undefined)).toBe('Hi there');
        expect(studentGreeting({ full_name: '   ' })).toBe('Hi there');
    });
});
