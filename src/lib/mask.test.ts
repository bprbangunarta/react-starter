import { describe, expect, it } from 'vitest';
import { applyMask, caretAfter, dataBefore, MASKS } from '@/lib/mask';

describe('applyMask', () => {
    it('formats a phone number and returns the raw digits', () => {
        expect(applyMask('081234567890', MASKS.phone)).toEqual({ raw: '081234567890', masked: '0812-3456-7890' });
    });

    it('drops characters that do not fit the token and ignores typed literals', () => {
        expect(applyMask('0812-34ab56', MASKS.phone).masked).toBe('0812-3456');
    });

    it('stops at the end of the mask', () => {
        expect(applyMask('31710123456789010000', MASKS.nik)).toEqual({ raw: '3171012345678901', masked: '3171 0123 4567 8901' });
    });

    it('does not leave a dangling literal while the user deletes', () => {
        expect(applyMask('0812', MASKS.phone).masked).toBe('0812');
        expect(applyMask('08123', MASKS.phone).masked).toBe('0812-3');
    });

    it('formats an NPWP', () => {
        expect(applyMask('012345678901234', MASKS.npwp).masked).toBe('01.234.567.8-901.234');
    });

    it('accepts hex digits only with the h token', () => {
        expect(applyMask('0F76zz6E', '#hhhhhh')).toEqual({ raw: '0F766E', masked: '#0F766E' });
    });
});

describe('caret helpers', () => {
    const isDigit = (c: string) => /\d/.test(c);

    it('counts data characters before the caret', () => {
        expect(dataBefore('1.000.0', 7, isDigit)).toBe(5);
    });

    it('finds the caret after the n-th data character', () => {
        expect(caretAfter('1.000.000', 4, isDigit)).toBe(5);
        expect(caretAfter('1.000.000', 0, isDigit)).toBe(0);
        expect(caretAfter('1.000.000', 99, isDigit)).toBe(9);
    });
});
