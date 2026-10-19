import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * The only place a date, a time, or a number is turned into text for a person (Indonesian, e.g. "04 Okt 2026"). Screens call these and
 * never format on their own; what goes over the wire stays ISO and plain numbers.
 */

type Moment = string | Date | null | undefined;

/** The moment as a `Date`, or null when it cannot be read: a value from the server that is not a date must show a dash, not break the screen. */
function toDate(value: string | Date): Date | null {
    const date = typeof value === 'string' ? parseISO(value) : value;

    return Number.isNaN(date.getTime()) ? null : date;
}

/** "04 Okt 2026", or a dash when empty. */
export function formatDate(value: Moment): string {
    const date = value ? toDate(value) : null;

    return date ? format(date, 'dd MMM yyyy', { locale: id }) : '–';
}

/** "04 Okt 2026 08:45:03", or a dash when empty. A space instead of the "T" between date and time is accepted. */
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

/** A whole number with Indonesian thousands separators: "1.500.000". */
export function formatNumber(value: number): string {
    return numberFormat.format(value);
}

const rupiahFormat = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

/** Whole-rupiah amount, e.g. "Rp 1.500.000". */
export function rupiah(value: number | string | null | undefined): string {
    return value === null || value === undefined || value === '' ? '–' : rupiahFormat.format(Number(value));
}
