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
