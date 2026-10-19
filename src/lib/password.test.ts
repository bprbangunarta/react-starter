import { describe, expect, it } from 'vitest';
import { generatePassword } from '@/lib/password';

describe('generatePassword', () => {
    it('makes a password of the asked length with upper and lower case letters, digits, and symbols', () => {
        for (let i = 0; i < 50; i++) {
            const password = generatePassword();

            expect(password).toHaveLength(16);
            expect(password).toMatch(/[A-Z]/);
            expect(password).toMatch(/[a-z]/);
            expect(password).toMatch(/[0-9]/);
            expect(password).toMatch(/[#$%&*+=?@-]/);
        }
    });

    it('leaves out look-alike characters and does not repeat itself', () => {
        const seen = new Set<string>();

        for (let i = 0; i < 200; i++) {
            const password = generatePassword();
            seen.add(password);

            expect(password).not.toMatch(/[0OlI1]/);
        }

        expect(seen.size).toBe(200);
    });
});
