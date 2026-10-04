import { beforeEach, describe, expect, it } from 'vitest';
import type { HttpError } from '@/lib/http';
import { handleMock } from '@/mock/server';

const post = (url: string, body: Record<string, unknown> = {}) => handleMock('POST', url, body, {});

async function rejection(promise: Promise<unknown>): Promise<HttpError> {
    try {
        await promise;
    } catch (error) {
        return error as HttpError;
    }

    throw new Error('Expected the request to fail');
}

describe('mock server: sign-in and password rules', () => {
    beforeEach(async () => {
        await post('/logout');
    });

    it('rejects wrong credentials with a 422 on the username field', async () => {
        const error = await rejection(post('/login', { username: 'admin', password: 'salah' }));

        expect(error.status).toBe(422);
        expect(error.errors.username).toBeDefined();
    });

    it('signs in a user whose password is still valid', async () => {
        const response = (await post('/login', { username: 'admin', password: 'password' })) as { two_factor: boolean };

        expect(response.two_factor).toBe(false);
        expect(await handleMock('GET', '/me', undefined, {})).toMatchObject({ user: { username: 'admin' } });
    });

    it('asks for a new password when the old one has expired, without creating a session', async () => {
        const response = await post('/login', { username: 'kadaluarsa', password: 'password' });

        expect(response).toMatchObject({ password_expired: true });
        expect((await rejection(handleMock('GET', '/me', undefined, {}))).status).toBe(401);
    });

    it('refuses a new password equal to the current one, then accepts a different one', async () => {
        await post('/login', { username: 'kadaluarsa', password: 'password' });
        const same = { current_password: 'password', password: 'password', password_confirmation: 'password' };
        const error = await rejection(post('/password-expired', same));

        expect(error.errors.password?.[0]).toMatch(/sama/);

        const done = await post('/password-expired', { ...same, password: 'baru-12345', password_confirmation: 'baru-12345' });
        expect(done).toMatchObject({ user: { username: 'kadaluarsa' } });
    });

    it('refuses to reuse a previous password from the profile screen', async () => {
        await post('/login', { username: 'admin', password: 'password' });
        await handleMock('PUT', '/profile/password', { current_password: 'password', password: 'kedua-12345', password_confirmation: 'kedua-12345' }, {});
        const error = await rejection(
            handleMock('PUT', '/profile/password', { current_password: 'kedua-12345', password: 'password', password_confirmation: 'password' }, {}),
        );

        expect(error.errors.password?.[0]).toMatch(/sebelumnya/);
    });
});
