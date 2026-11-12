import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('sonner', () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }));

function respond(status: number, body: unknown) {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: status < 400, status, json: () => Promise.resolve(body) }));
}

// The real-backend path: with the mock switched off, every call is a `fetch`.
async function load() {
    vi.resetModules();
    vi.stubEnv('VITE_USE_MOCK', 'false');
    const { toast } = await import('sonner');
    const { HttpError, http } = await import('@/lib/http');

    return { toast, HttpError, http };
}

describe('http', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    it('says why when the server ends the session on purpose', async () => {
        const { toast, HttpError, http } = await load();
        respond(401, { message: 'Anda masuk dari perangkat atau browser lain, sehingga sesi ini diakhiri.', code: 'session_ended' });

        await expect(http.get('/me')).rejects.toBeInstanceOf(HttpError);

        expect(toast.info).toHaveBeenCalledWith('Anda masuk dari perangkat atau browser lain, sehingga sesi ini diakhiri.');
    });

    it('stays quiet for an ordinary 401', async () => {
        const { toast, http } = await load();
        respond(401, { message: 'Silakan masuk.' });

        await expect(http.get('/me')).rejects.toMatchObject({ status: 401 });

        expect(toast.info).not.toHaveBeenCalled();
    });

    it('opens the password confirmation on 403 reauth_required', async () => {
        const { http } = await load();
        const seen = vi.fn();
        window.addEventListener('app:reauth-required', seen);
        respond(403, { message: 'Konfirmasi kata sandi.', code: 'reauth_required' });

        await expect(http.post('/profile/two-factor')).rejects.toMatchObject({ status: 403, code: 'reauth_required' });

        expect(seen).toHaveBeenCalled();
        window.removeEventListener('app:reauth-required', seen);
    });

    it('maps a 422 to field errors', async () => {
        const { http } = await load();
        respond(422, { message: 'Tidak valid.', errors: { code: ['Salah.'] } });

        await expect(http.post('/two-factor-challenge', { code: '1' })).rejects.toMatchObject({ status: 422, errors: { code: ['Salah.'] } });
    });
});

describe('http uploads', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    it('sends a FormData body as it is, without forcing a JSON content type', async () => {
        const { http } = await load();
        respond(200, {});
        const form = new FormData();
        form.append('avatar', new File(['x'], 'foto.jpg'));

        await http.post('/profile/avatar', form);

        const call = vi.mocked(fetch).mock.calls[0];
        const headers = call?.[1]?.headers as Record<string, string>;

        expect(call?.[1]?.body).toBe(form);
        expect(headers['Content-Type']).toBeUndefined();
    });

    it('sends other bodies as JSON', async () => {
        const { http } = await load();
        respond(200, {});

        await http.post('/login', { username: 'a' });

        const call = vi.mocked(fetch).mock.calls[0];
        const headers = call?.[1]?.headers as Record<string, string>;

        expect(headers['Content-Type']).toBe('application/json');
        expect(call?.[1]?.body).toBe('{"username":"a"}');
    });
});

describe('http maintenance', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    it('tells the app when the server answers 503, so it can show the maintenance page', async () => {
        const { http } = await load();
        const seen = vi.fn();
        window.addEventListener('app:maintenance', seen);
        respond(503, { message: 'Sedang dalam pemeliharaan.' });

        await expect(http.get('/me')).rejects.toMatchObject({ status: 503 });

        expect(seen).toHaveBeenCalled();
        window.removeEventListener('app:maintenance', seen);
    });
});

describe('http.upload (mock)', () => {
    // The tests above leave the mock switched off in the module cache; this suite wants it on.
    beforeEach(() => {
        vi.resetModules();
        vi.stubEnv('VITE_USE_MOCK', 'true');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('plays progress up to 100 and resolves', async () => {
        vi.useFakeTimers();
        const { http } = await import('@/lib/http');
        const seen: number[] = [];
        const done = http.upload('/files', new File(['x'], 'a.txt'), { onProgress: (p) => seen.push(p) });

        await vi.advanceTimersByTimeAsync(3000);
        await expect(done).resolves.toBeDefined();
        expect(seen.at(-1)).toBe(100);
        expect(seen).toEqual([...seen].sort((a, b) => a - b));
        vi.useRealTimers();
    });

    it('rejects with an AbortError when aborted', async () => {
        vi.useFakeTimers();
        const { http } = await import('@/lib/http');
        const controller = new AbortController();
        const pending = http.upload('/files', new File(['x'], 'a.txt'), { signal: controller.signal });

        controller.abort();
        await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
        vi.useRealTimers();
    });
});

/** A stand-in for XMLHttpRequest the test drives by hand. */
class FakeRequest {
    static last: FakeRequest;
    upload: { onprogress?: (event: { lengthComputable: boolean; loaded: number; total: number }) => void } = {};
    onload?: () => void;
    onerror?: () => void;
    onabort?: () => void;
    status = 0;
    responseText = '';
    withCredentials = false;
    headers: Record<string, string> = {};
    opened: [string, string] | null = null;
    sent: FormData | null = null;
    aborted = false;

    constructor() {
        FakeRequest.last = this;
    }

    open(method: string, url: string) {
        this.opened = [method, url];
    }

    setRequestHeader(name: string, value: string) {
        this.headers[name] = value;
    }

    send(body: FormData) {
        this.sent = body;
    }

    abort() {
        this.aborted = true;
        this.onabort?.();
    }

    reply(status: number, body: unknown) {
        this.status = status;
        this.responseText = JSON.stringify(body);
        this.onload?.();
    }
}

describe('http.upload (real backend)', () => {
    async function load() {
        vi.resetModules();
        vi.stubEnv('VITE_USE_MOCK', 'false');
        vi.stubGlobal('XMLHttpRequest', FakeRequest);
        const { HttpError, http, MAINTENANCE_EVENT } = await import('@/lib/http');

        return { HttpError, http, MAINTENANCE_EVENT };
    }

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    it('posts the file as multipart with cookies, reports progress and resolves with the body', async () => {
        const { http } = await load();
        const seen: number[] = [];
        const done = http.upload('/files', new File(['abc'], 'a.txt'), { field: 'document', data: { folder: '7' }, onProgress: (p) => seen.push(p) });
        const request = FakeRequest.last;

        request.upload.onprogress?.({ lengthComputable: true, loaded: 1, total: 4 });
        request.upload.onprogress?.({ lengthComputable: true, loaded: 4, total: 4 });
        request.reply(200, { message: 'ok' });

        await expect(done).resolves.toEqual({ message: 'ok' });
        expect(request.opened).toEqual(['POST', '/api/files']);
        expect(request.withCredentials).toBe(true);
        expect(request.sent?.get('folder')).toBe('7');
        expect(request.sent?.get('document')).toBeInstanceOf(File);
        expect(seen).toEqual([25, 100]);
    });

    it('turns a 422 into an HttpError with the messages per field', async () => {
        const { HttpError, http } = await load();
        const done = http.upload('/files', new File(['x'], 'a.txt'));

        FakeRequest.last.reply(422, { message: 'Berkas ditolak.', errors: { file: ['Terlalu besar.'] } });

        const error: unknown = await done.catch((e: unknown) => e);

        expect(error).toBeInstanceOf(HttpError);
        expect(error).toMatchObject({ status: 422, message: 'Berkas ditolak.', errors: { file: ['Terlalu besar.'] } });
    });

    it('announces maintenance on a 503', async () => {
        const { http, MAINTENANCE_EVENT } = await load();
        const heard = vi.fn();
        window.addEventListener(MAINTENANCE_EVENT, heard);
        const done = http.upload('/files', new File(['x'], 'a.txt'));

        FakeRequest.last.reply(503, { message: 'Pemeliharaan.' });
        await done.catch(() => undefined);

        expect(heard).toHaveBeenCalledTimes(1);
        window.removeEventListener(MAINTENANCE_EVENT, heard);
    });

    it('reports a lost connection as status 0', async () => {
        const { http } = await load();
        const done = http.upload('/files', new File(['x'], 'a.txt'));

        FakeRequest.last.onerror?.();

        await expect(done).rejects.toMatchObject({ status: 0 });
    });

    it('aborts the request when the signal fires', async () => {
        const { http } = await load();
        const controller = new AbortController();
        const done = http.upload('/files', new File(['x'], 'a.txt'), { signal: controller.signal });

        controller.abort();

        await expect(done).rejects.toMatchObject({ name: 'AbortError' });
        expect(FakeRequest.last.aborted).toBe(true);
    });
});
