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
import { toast } from 'sonner';
import { handleMock } from '@/mock/server';

/** On by default. Set `VITE_USE_MOCK=false` (env or .env) to send the same calls to a real backend without touching the code. */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

/** Fired when the server asks for a fresh password confirmation (403 `reauth_required`). */
export const REAUTH_EVENT = 'app:reauth-required';

/** Fired when the server answers 503 (maintenance): `MaintenanceGate` then shows the full-screen maintenance page. */
export const MAINTENANCE_EVENT = 'app:maintenance';
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

type ErrorBody = { message?: string; errors?: Record<string, string[]>; code?: string };

/** Turns an error response into the app-wide reactions (toast, maintenance, re-authentication) and an `HttpError`. */
function raise(status: number, body: ErrorBody): never {
    // The session was ended on purpose (signed in elsewhere, credentials changed): say why before the sign-in page appears.
    if (status === 401 && body.code === 'session_ended' && body.message) {
        toast.info(body.message);
    }

    if (status === 503) {
        window.dispatchEvent(new Event(MAINTENANCE_EVENT));
    }

    if (status === 403 && body.code === 'reauth_required') {
        window.dispatchEvent(new Event(REAUTH_EVENT));
    }

    throw new HttpError(status, body.message ?? 'Terjadi kesalahan.', body.errors ?? {}, body.code);
}

async function send<T>(method: Method, url: string, data?: unknown, params?: Params): Promise<T> {
    if (USE_MOCK) {
        return (await handleMock(method, url, data, params ?? {})) as T;
    }

    // A FormData body (file upload) keeps its own multipart type, which the browser sets together with the boundary.
    const multipart = data instanceof FormData;
    let response: Response;

    try {
        response = await fetch(`${API_BASE}${url}${query(params)}`, {
            method,
            credentials: 'include',
            headers: { Accept: 'application/json', ...(data === undefined || multipart ? {} : { 'Content-Type': 'application/json' }) },
            body: data === undefined ? undefined : multipart ? data : JSON.stringify(data),
        });
    } catch {
        throw new HttpError(0, 'Server tidak dapat dihubungi. Periksa koneksi Anda lalu coba lagi.');
    }

    const body = (await response.json().catch(() => ({}))) as ErrorBody;

    if (!response.ok) {
        raise(response.status, body);
    }

    return body as T;
}

export type UploadOptions = {
    /** Name of the multipart field the file goes in (default `file`). */
    field?: string;
    /** Extra text fields sent with the file. */
    data?: Record<string, string>;
    /** Called with 0–100 while the file goes up. */
    onProgress?: (percent: number) => void;
    /** Aborting rejects with an `AbortError`. */
    signal?: AbortSignal;
};

const abortError = () => new DOMException('Unggahan dibatalkan.', 'AbortError');

/** The mock has no endpoint to receive files: it only plays the progress (a bigger file takes a bit longer) so screens can be built and tried. */
function simulateUpload(file: File, { onProgress, signal }: UploadOptions): Promise<unknown> {
    const steps = 10;
    const duration = Math.min(2400, 700 + (file.size / (1024 * 1024)) * 500);

    return new Promise((resolve, reject) => {
        let step = 0;
        const stop = () => {
            window.clearInterval(timer);
            reject(abortError());
        };
        const timer = window.setInterval(() => {
            step += 1;
            onProgress?.(Math.round((step / steps) * 100));

            if (step >= steps) {
                window.clearInterval(timer);
                signal?.removeEventListener('abort', stop);
                resolve({ message: 'Berkas diunggah' });
            }
        }, duration / steps);

        if (signal?.aborted) {
            stop();
        } else {
            signal?.addEventListener('abort', stop, { once: true });
        }
    });
}

/**
 * Sends one file as `multipart/form-data` and reports progress (`fetch` cannot, so this is the one place that uses `XMLHttpRequest`).
 * Errors come out the same as for every other call: `HttpError` with the server's message and, for 422, the messages per field.
 */
function upload<T = unknown>(url: string, file: File, options: UploadOptions = {}): Promise<T> {
    if (USE_MOCK) {
        return simulateUpload(file, options) as Promise<T>;
    }

    return new Promise<T>((resolve, reject) => {
        const request = new XMLHttpRequest();
        const body = new FormData();

        Object.entries(options.data ?? {}).forEach(([key, value]) => body.append(key, value));
        body.append(options.field ?? 'file', file);

        request.open('POST', `${API_BASE}${url}`);
        request.withCredentials = true;
        request.setRequestHeader('Accept', 'application/json');
        request.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                options.onProgress?.(Math.round((event.loaded / event.total) * 100));
            }
        };
        request.onerror = () => reject(new HttpError(0, 'Server tidak dapat dihubungi. Periksa koneksi Anda lalu coba lagi.'));
        request.onabort = () => reject(abortError());
        request.onload = () => {
            let parsed: ErrorBody = {};

            try {
                parsed = JSON.parse(request.responseText) as ErrorBody;
            } catch {
                parsed = {};
            }

            if (request.status >= 200 && request.status < 300) {
                resolve(parsed as T);

                return;
            }

            try {
                raise(request.status, parsed);
            } catch (error) {
                reject(error instanceof HttpError ? error : new HttpError(request.status, 'Terjadi kesalahan.'));
            }
        };

        if (options.signal?.aborted) {
            reject(abortError());

            return;
        }

        options.signal?.addEventListener('abort', () => request.abort(), { once: true });
        request.send(body);
    });
}

export const http = {
    upload,
    get: <T>(url: string, params?: Params) => send<T>('GET', url, undefined, params),
    post: <T>(url: string, data?: unknown) => send<T>('POST', url, data ?? {}),
    put: <T>(url: string, data?: unknown) => send<T>('PUT', url, data ?? {}),
    delete: <T>(url: string, data?: unknown) => send<T>('DELETE', url, data ?? {}),
};
