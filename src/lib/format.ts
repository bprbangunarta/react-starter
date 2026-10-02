import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatDate(iso: string | null | undefined): string {
    return iso ? format(parseISO(iso), 'dd MMM yyyy', { locale: id }) : '–';
}

const rupiahFormat = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

/** Whole-rupiah amount, e.g. "Rp 1.500.000". */
export function rupiah(value: number | string | null | undefined): string {
    return value === null || value === undefined || value === ''
        ? '–'
        : rupiahFormat.format(Number(value));
}
