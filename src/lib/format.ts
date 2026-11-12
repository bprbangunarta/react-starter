import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * The one place dates, times and numbers become text for people (Indonesian, e.g. "04 Okt 2026"). Screens call these;
 * what goes over the wire stays ISO and plain numbers.
 */

type Moment = string | Date | null | undefined;

/** The value as a Date, or null if unreadable: a bad value from the server should show a dash, not break the screen. */
function toDate(value: string | Date): Date | null {
    const date = typeof value === 'string' ? parseISO(value) : value;

    return Number.isNaN(date.getTime()) ? null : date;
}

/** "04 Okt 2026", or a dash when empty. */
export function formatDate(value: Moment): string {
    const date = value ? toDate(value) : null;

    return date ? format(date, 'dd MMM yyyy', { locale: id }) : '–';
}

/** "04 Okt 2026 08:45:03", or a dash when empty. A space instead of the "T" is accepted. */
export function formatDateTime(value: Moment): string {
    const date = value ? toDate(typeof value === 'string' ? value.replace(' ', 'T') : value) : null;

    return date ? format(date, 'dd MMM yyyy HH:mm:ss', { locale: id }) : '–';
}

/** "3 menit yang lalu". */
export function formatRelative(value: string | Date): string {
    const date = toDate(value);

    return date ? formatDistanceToNow(date, { addSuffix: true, locale: id }) : '–';
}

const numberFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

/** Whole number with Indonesian separators: "1.500.000". */
export function formatNumber(value: number): string {
    return numberFormat.format(value);
}

const rupiahFormat = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

/** Whole rupiah, e.g. "Rp 1.500.000". */
export function rupiah(value: number | string | null | undefined): string {
    return value === null || value === undefined || value === '' ? '–' : rupiahFormat.format(Number(value));
}

/** File size: "512 B", "48 KB", "2,4 MB" (decimal comma, one decimal from MB). */
export function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} KB`;
    }

    const units = ['MB', 'GB', 'TB'];
    let value = bytes / (1024 * 1024);
    let unit = 0;

    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit += 1;
    }

    return `${value.toFixed(1).replace('.', ',')} ${units[unit]}`;
}
