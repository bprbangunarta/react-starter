/**
 * The only place the screens talk to a server. Everything goes through `http.get/post/put/delete(url, data)` with
 * JSON in and out, in the shape of a Laravel-style API:
 *
 *  - success: any JSON body; an optional `message` is shown as a toast;
 *  - validation failure: status 422 with `{ message, errors: { field: ['text'] } }`;
 *  - other failure: status 4xx/5xx with `{ message }`.
 *
 * Right now the requests are answered by `src/mock/server.ts` (no network). To use a real backend, set `USE_MOCK` to
 * false and every call becomes a `fetch` to `API_BASE + url` with cookies/session; nothing else needs to change.
 * See docs/API.md for the endpoints.
 */
import { handleMock } from '@/mock/server';

export const USE_MOCK = true;

/** Fired when the server asks for a fresh password confirmation (403 `reauth_required`). */
export const REAUTH_EVENT = 'app:reauth-required';
export const API_BASE = '/api';

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type Params = Record<string, string | number | boolean | null | undefined>;

export class HttpError extends Error {
    constructor(
        public status: number,
        message: string,
        public errors: Record<string, string[]> = {},
        public code?: string,
    ) {
        super(message);
    }
}

function query(params?: Params): string {
    const entries = Object.entries(params ?? {}).filter(([, v]) => v !== null && v !== undefined && v !== '');

    return entries.length === 0 ? '' : `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()}`;
}

async function send<T>(method: Method, url: string, data?: unknown, params?: Params): Promise<T> {
    if (USE_MOCK) {
        return (await handleMock(method, url, data, params ?? {})) as T;
    }

    let response: Response;

    try {
        response = await fetch(`${API_BASE}${url}${query(params)}`, {
            method,
            credentials: 'include',
            headers: { Accept: 'application/json', ...(data === undefined ? {} : { 'Content-Type': 'application/json' }) },
            body: data === undefined ? undefined : JSON.stringify(data),
        });
    } catch {
        throw new HttpError(0, 'Server tidak dapat dihubungi. Periksa koneksi Anda lalu coba lagi.');
    }

    const body = (await response.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string[]>; code?: string };

    if (!response.ok) {
        if (response.status === 403 && body.code === 'reauth_required') {
            window.dispatchEvent(new Event(REAUTH_EVENT));
        }

        throw new HttpError(response.status, body.message ?? 'Terjadi kesalahan.', body.errors ?? {}, body.code);
    }

    return body as T;
}

export const http = {
    get: <T>(url: string, params?: Params) => send<T>('GET', url, undefined, params),
    post: <T>(url: string, data?: unknown) => send<T>('POST', url, data ?? {}),
    put: <T>(url: string, data?: unknown) => send<T>('PUT', url, data ?? {}),
    delete: <T>(url: string, data?: unknown) => send<T>('DELETE', url, data ?? {}),
};
