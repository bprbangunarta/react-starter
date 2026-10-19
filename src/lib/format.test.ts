import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime, formatNumber, formatRelative, rupiah } from '@/lib/format';

describe('format', () => {
    it('formats whole rupiah with Indonesian separators', () => {
        expect(rupiah(1500000).replace(/\s/g, ' ')).toBe('Rp 1.500.000');
        expect(rupiah('2500').replace(/\s/g, ' ')).toBe('Rp 2.500');
    });

    it('shows a dash for empty values', () => {
        expect(rupiah(null)).toBe('–');
        expect(rupiah('')).toBe('–');
        expect(formatDate(null)).toBe('–');
    });

    it('formats an ISO date in Indonesian', () => {
        expect(formatDate('2026-10-04T10:00:00.000Z')).toBe('04 Okt 2026');
    });

    it('writes date and time with seconds, and accepts a space as the separator the server sends', () => {
        expect(formatDateTime('2026-10-07 08:45:03')).toBe('07 Okt 2026 08:45:03');
        expect(formatDateTime(new Date(2026, 9, 7, 8, 45, 3))).toBe('07 Okt 2026 08:45:03');
        expect(formatDateTime(undefined)).toBe('–');
    });

    it('writes a whole number with Indonesian thousands separators', () => {
        expect(formatNumber(1500000)).toBe('1.500.000');
    });

    it('writes relative time in Indonesian', () => {
        expect(formatRelative(new Date(Date.now() - 3 * 60 * 1000))).toBe('3 menit yang lalu');
    });

    it('shows a dash, not an error, for a value that is not a date', () => {
        expect(formatDate('salah')).toBe('–');
        expect(formatDateTime('salah')).toBe('–');
        expect(formatDate(new Date('tidak jelas'))).toBe('–');
        expect(formatRelative('salah')).toBe('–');
    });
});
