import { API_BASE, http, USE_MOCK } from '@/lib/http';
import type { Params } from '@/lib/http';

/**
 * Download a CSV. The mock builds the file in the browser from JSON `{ filename, csv }`; a real backend just streams
 * `text/csv` from the same URL and the browser downloads it.
 */
export async function exportCsv(url: string, params: Params = {}): Promise<void> {
    if (!USE_MOCK) {
        const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== '').map(([k, v]) => [k, String(v)]));
        window.location.assign(`${API_BASE}${url}?${query.toString()}`);

        return;
    }

    const { filename, csv } = await http.get<{ filename: string; csv: string }>(url, params);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}
