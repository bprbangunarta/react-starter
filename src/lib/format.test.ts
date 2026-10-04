import { describe, expect, it } from 'vitest';
import { formatDate, rupiah } from '@/lib/format';

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
});
