/**
 * The pretend backend. Each route below is what a real backend has to offer (see docs/API.md); the screens never know the
 * difference. Delete this folder and set USE_MOCK to false in `lib/http.ts` once the real API answers the same URLs.
 */
import { HttpError } from '@/lib/http';
import type { Method, Params } from '@/lib/http';
import { record, seed, verify } from '@/mock/audit';
import type { NewEntry } from '@/mock/audit';
import { otpauthUri, randomBase32, randomCode, recoveryCodes, verifyTotp } from '@/mock/crypto';
import { loadDb, saveDb } from '@/mock/db';
import type { Db, MockNotification, MockUser } from '@/mock/db';

const EMAIL_COOLDOWN_S = 20;
const MAX_ATTEMPTS = 5;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function database(): Promise<Db> {
    const existing = loadDb();

    if (existing) {
        return existing;
    }

    const now = Date.now();
    const notification = (id: number, title: string, body: string, level: MockNotification['level'], hoursAgo: number, read = false): MockNotification => ({
        id, title, body, module: 'Sistem', level, url: null, read, at: new Date(now - hoursAgo * 3600 * 1000).toISOString(),
    });
    const db: Db = {
        users: [{ id: 1, name: 'Administrator', username: 'admin', email: 'admin@example.com', password: 'password', mfa_method: null, mfa_secret: null, recovery_codes: [] }],
        audit: [],
        notifications: [
            notification(1, 'Selamat datang', 'Ini data tiruan: semua perubahan hanya tersimpan di peramban ini.', 'info', 2),
            notification(2, 'Laporan bulanan siap', 'Laporan bulan lalu sudah tersedia.', 'success', 20),
            notification(3, 'Kapasitas penyimpanan 80%', 'Pertimbangkan membersihkan berkas lama.', 'warning', 50, true),
        ],
        session: { userId: null, pendingUserId: null, attempts: 0, emailCode: null, emailSentAt: null },
    };
    await seed(db);
    saveDb(db);

    return db;
}

function currentUser(db: Db): MockUser {
    const user = db.users.find((u) => u.id === db.session.userId);

    if (!user) {
        throw new HttpError(401, 'Silakan masuk.');
    }

    return user;
}

function invalid(field: string, message: string): never {
    throw new HttpError(422, message, { [field]: [message] });
}

async function audit(db: Db, user: MockUser | null, entry: NewEntry): Promise<void> {
    await record(db, { user: user?.name ?? null, username: user?.username ?? null, ...entry });
}

type Body = Record<string, unknown>;

const str = (value: unknown): string => (typeof value === 'string' ? value : '');

function me(db: Db, user: MockUser) {
    return {
        user: { id: user.id, name: user.name, username: user.username, email: user.email },
        security: { enabled: true, method: user.mfa_method },
        notifications: {
            unread: db.notifications.filter((n) => !n.read).length,
            items: [...db.notifications].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 10).map((n) => ({ ...n })),
        },
    };
}

function emailCode(db: Db): { wait: number } {
    db.session.emailCode = randomCode();
    db.session.emailSentAt = Date.now();

    return { wait: EMAIL_COOLDOWN_S };
}

function secondsUntilResend(db: Db): number {
    return db.session.emailSentAt ? Math.max(0, EMAIL_COOLDOWN_S - Math.floor((Date.now() - db.session.emailSentAt) / 1000)) : 0;
}

function csv(rows: string[][]): string {
    const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;

    return rows.map((r) => r.map(cell).join(',')).join('\n');
}

async function route(method: Method, url: string, body: Body, params: Params): Promise<unknown> {
    const db = await database();
    const s = db.session;

    // --- session
    if (method === 'GET' && url === '/me') {
        return me(db, currentUser(db));
    }

    if (method === 'POST' && url === '/login') {
        const username = str(body.username).trim().toLowerCase();
        const user = db.users.find((u) => u.username === username || u.email === username);

        if (!user || user.password !== str(body.password)) {
            await audit(db, null, { module: 'auth', event: 'auth.login_failed', action: 'login_failed', outcome: 'failure', subject: username, context: { reason: 'Data tidak cocok' }, url: '/login' });
            saveDb(db);
            invalid('username', 'Nama pengguna atau kata sandi salah.');
        }

        s.attempts = 0;

        if (user.mfa_method) {
            s.pendingUserId = user.id;
            s.userId = null;

            if (user.mfa_method === 'email') {
                emailCode(db);
            }

            saveDb(db);

            return { two_factor: true, message: user.mfa_method === 'email' ? `Kode verifikasi dikirim (demo: ${s.emailCode}).` : undefined };
        }

        s.userId = user.id;
        await audit(db, user, { module: 'auth', event: 'auth.login', action: 'login', subject_type: 'User', subject_id: user.id, subject: user.username, url: '/login' });
        saveDb(db);

        return { two_factor: false, ...me(db, user) };
    }

    if (method === 'POST' && url === '/logout') {
        const user = db.users.find((u) => u.id === s.userId);

        if (user) {
            await audit(db, user, { module: 'auth', event: 'auth.logout', action: 'logout', subject_type: 'User', subject_id: user.id, subject: user.username, url: '/logout' });
        }

        s.userId = null;
        s.pendingUserId = null;
        saveDb(db);

        return {};
    }

    // --- second factor at sign-in
    if (url.startsWith('/two-factor-challenge')) {
        const user = db.users.find((u) => u.id === s.pendingUserId);

        if (!user) {
            throw new HttpError(401, 'Sesi masuk Anda berakhir. Silakan masuk lagi.');
        }

        if (method === 'GET') {
            return { method: user.mfa_method, name: user.name, email: user.email, wait: user.mfa_method === 'email' ? secondsUntilResend(db) : 0, recovery_available: user.recovery_codes.length > 0 };
        }

        if (url === '/two-factor-challenge/cancel') {
            s.pendingUserId = null;
            saveDb(db);

            return {};
        }

        if (url === '/two-factor-challenge/resend') {
            if (secondsUntilResend(db) > 0) {
                throw new HttpError(422, `Tunggu ${secondsUntilResend(db)} detik sebelum meminta kode lagi.`);
            }

            emailCode(db);
            saveDb(db);

            return { message: `Kode baru sudah dikirim (demo: ${s.emailCode}).`, wait: EMAIL_COOLDOWN_S };
        }

        const code = str(body.code).trim();
        let ok = false;
        let usedRecovery = false;

        if (body.recovery) {
            const index = user.recovery_codes.indexOf(code.toLowerCase());
            ok = index >= 0;

            if (ok) {
                user.recovery_codes.splice(index, 1);
                usedRecovery = true;
            }
        } else if (user.mfa_method === 'totp' && user.mfa_secret) {
            ok = await verifyTotp(user.mfa_secret, code);
        } else {
            ok = s.emailCode !== null && code === s.emailCode;
        }

        if (!ok) {
            s.attempts++;
            await audit(db, user, { module: 'auth', event: 'auth.mfa_failed', action: 'mfa_failed', outcome: 'failure', subject_type: 'User', subject_id: user.id, subject: user.username, url });

            if (s.attempts >= MAX_ATTEMPTS) {
                s.pendingUserId = null;
                saveDb(db);
                throw new HttpError(401, 'Terlalu banyak kode salah. Silakan masuk lagi.');
            }

            saveDb(db);
            invalid('code', 'Kode tidak valid. Periksa lalu coba lagi.');
        }

        s.userId = user.id;
        s.pendingUserId = null;
        s.emailCode = null;
        await audit(db, user, { module: 'auth', event: usedRecovery ? 'auth.mfa_recovery_code_used' : 'auth.mfa_verified', action: usedRecovery ? 'mfa_recovery_code_used' : 'mfa_verified', subject_type: 'User', subject_id: user.id, subject: user.username, url });
        await audit(db, user, { module: 'auth', event: 'auth.login', action: 'login', subject_type: 'User', subject_id: user.id, subject: user.username, url: '/login' });
        saveDb(db);

        return me(db, user);
    }

    // --- everything below needs a signed-in user
    const user = currentUser(db);

    if (method === 'GET' && url === '/profile') {
        return {
            account: { name: user.name, username: user.username, email: user.email },
            twoFactor: { method: user.mfa_method, emailAvailable: true, recoveryRemaining: user.recovery_codes.length },
        };
    }

    if (method === 'POST' && url === '/reauth') {
        if (str(body.password) !== user.password) {
            await audit(db, user, { module: 'auth', event: 'auth.reauth_failed', action: 'reauth_failed', outcome: 'failure', subject_type: 'User', subject_id: user.id, subject: user.username, method: 'POST', url });
            saveDb(db);
            invalid('password', 'Kata sandi salah.');
        }

        await audit(db, user, { module: 'auth', event: 'auth.reauth', action: 'reauth', subject_type: 'User', subject_id: user.id, subject: user.username, method: 'POST', url });
        saveDb(db);

        return { message: 'Kata sandi dikonfirmasi.' };
    }

    if (method === 'PUT' && url === '/profile/password') {
        const rate = db.audit.filter((e) => e.event === 'profile.password_change_failed' && e.username === user.username && Date.now() - Date.parse(e.at) < 60_000).length;

        if (rate >= MAX_ATTEMPTS) {
            invalid('current_password', 'Terlalu banyak percobaan. Coba lagi dalam 1 menit.');
        }

        if (str(body.current_password) !== user.password) {
            await audit(db, user, { module: 'profile', event: 'profile.password_change_failed', action: 'password_change_failed', outcome: 'failure', subject_type: 'User', subject_id: user.id, subject: user.username, method: 'PUT', url });
            saveDb(db);
            invalid('current_password', 'Kata sandi saat ini salah.');
        }

        const password = str(body.password);

        if (password.length < 8) {
            invalid('password', 'Kata sandi baru minimal 8 karakter.');
        }

        if (password !== str(body.password_confirmation)) {
            invalid('password_confirmation', 'Konfirmasi kata sandi tidak cocok.');
        }

        user.password = password;
        await audit(db, user, { module: 'profile', event: 'profile.password_changed', action: 'password_changed', subject_type: 'User', subject_id: user.id, subject: user.username, method: 'PUT', url });
        saveDb(db);

        return { message: 'Kata sandi Anda berhasil diubah.' };
    }

    if (method === 'POST' && url === '/profile/two-factor/totp/start') {
        user.mfa_secret = randomBase32(20); // kept apart from the active method until the first code is confirmed
        saveDb(db);

        return { secret: user.mfa_secret, uri: otpauthUri(user.mfa_secret, user.email) };
    }

    if (method === 'POST' && url === '/profile/two-factor/totp') {
        if (!user.mfa_secret) {
            throw new HttpError(422, 'Mulai ulang pengaturannya.');
        }

        if (!(await verifyTotp(user.mfa_secret, str(body.code).trim()))) {
            invalid('code', 'Kode tidak valid. Pastikan jam ponsel Anda benar lalu coba lagi.');
        }

        user.mfa_method = 'totp';
        user.recovery_codes = recoveryCodes();
        await audit(db, user, { module: 'profile', event: 'profile.mfa_enabled', action: 'mfa_enabled', subject_type: 'User', subject_id: user.id, subject: user.username, context: { method: 'totp' }, url });
        saveDb(db);

        return { message: 'Verifikasi dua langkah dengan aplikasi authenticator sudah aktif. Simpan kode pemulihan Anda.', recovery_codes: user.recovery_codes };
    }

    if (method === 'POST' && url === '/profile/two-factor/email/send') {
        if (secondsUntilResend(db) > 0) {
            throw new HttpError(422, `Tunggu ${secondsUntilResend(db)} detik sebelum meminta kode lagi.`);
        }

        emailCode(db);
        saveDb(db);

        return { message: `Kode sudah dikirim ke ${user.email} (demo: ${s.emailCode}).`, wait: EMAIL_COOLDOWN_S };
    }

    if (method === 'POST' && url === '/profile/two-factor/email') {
        if (!s.emailCode || str(body.code).trim() !== s.emailCode) {
            invalid('code', 'Kode tidak valid. Periksa atau minta kode baru.');
        }

        user.mfa_method = 'email';
        user.mfa_secret = null;
        user.recovery_codes = recoveryCodes();
        s.emailCode = null;
        await audit(db, user, { module: 'profile', event: 'profile.mfa_enabled', action: 'mfa_enabled', subject_type: 'User', subject_id: user.id, subject: user.username, context: { method: 'email' }, url });
        saveDb(db);

        return { message: 'Verifikasi dua langkah lewat email sudah aktif.', recovery_codes: user.recovery_codes };
    }

    if (method === 'DELETE' && url === '/profile/two-factor') {
        const code = str(body.code).trim();
        const ok = user.mfa_method === 'totp' && user.mfa_secret
            ? await verifyTotp(user.mfa_secret, code) || user.recovery_codes.includes(code.toLowerCase())
            : code === s.emailCode || user.recovery_codes.includes(code.toLowerCase());

        if (!ok) {
            invalid('code', 'Kode tidak valid.');
        }

        user.mfa_method = null;
        user.mfa_secret = null;
        user.recovery_codes = [];
        await audit(db, user, { module: 'profile', event: 'profile.mfa_disabled', action: 'mfa_disabled', subject_type: 'User', subject_id: user.id, subject: user.username, method: 'DELETE', url });
        saveDb(db);

        return { message: 'Verifikasi dua langkah sudah dimatikan.' };
    }

    // --- notifications
    if (method === 'POST' && url === '/notifications/read-all') {
        db.notifications.forEach((n) => (n.read = true));
        saveDb(db);

        return me(db, user).notifications;
    }

    const read = /^\/notifications\/(\d+)\/read$/.exec(url);

    if (method === 'POST' && read) {
        const item = db.notifications.find((n) => n.id === Number(read[1]));

        if (item) {
            item.read = true;
            saveDb(db);
        }

        return me(db, user).notifications;
    }

    // --- audit log
    if (url === '/audit-logs' || url === '/audit-logs/export') {
        const term = str(params.search).toLowerCase();
        const from = str(params.from);
        const to = str(params.to);
        const filtered = [...db.audit].reverse().filter((e) =>
            (!params.module || e.module === params.module) &&
            (!params.outcome || e.outcome === params.outcome) &&
            (!from || e.at.slice(0, 10) >= from) &&
            (!to || e.at.slice(0, 10) <= to) &&
            (!term || [e.user, e.username, e.event, e.subject, e.ip].some((v) => v?.toLowerCase().includes(term))),
        );

        if (url === '/audit-logs/export') {
            await audit(db, user, { module: 'audit_logs', event: 'audit_logs.exported', action: 'exported', method: 'GET', url, context: { rows: filtered.length } });
            saveDb(db);

            return {
                filename: `audit-log-${new Date().toISOString().slice(0, 10)}.csv`,
                csv: csv([['Waktu', 'Pengguna', 'Modul', 'Kejadian', 'Data', 'Hasil', 'IP', 'URL'], ...filtered.map((e) => [e.at, e.user ?? '', e.module, e.event, e.subject ?? '', e.outcome, e.ip, e.url])]),
            };
        }

        const perPage = [10, 25, 50].includes(Number(params.per_page)) ? Number(params.per_page) : 25;
        const page = Math.max(1, Number(params.page) || 1);
        const last = Math.max(1, Math.ceil(filtered.length / perPage));

        return {
            data: filtered.slice((page - 1) * perPage, page * perPage),
            meta: { current_page: Math.min(page, last), last_page: last, from: filtered.length === 0 ? 0 : (Math.min(page, last) - 1) * perPage + 1, to: Math.min(filtered.length, Math.min(page, last) * perPage), total: filtered.length, per_page: perPage },
            modules: [...new Set(db.audit.map((e) => e.module))].sort(),
        };
    }

    if (method === 'POST' && url === '/audit-logs/verify') {
        const result = await verify(db);
        await audit(db, user, { module: 'audit_logs', event: 'audit_logs.verified', action: 'verified', outcome: result.ok ? 'success' : 'failure', url, context: { ...result } });
        saveDb(db);

        return result;
    }

    throw new HttpError(404, 'Halaman tidak ditemukan.');
}

/** Answers one request like a server would: after a short delay, with JSON, or an HttpError. */
export async function handleMock(method: Method, url: string, data: unknown, params: Params): Promise<unknown> {
    await wait(180 + Math.random() * 220);

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new HttpError(0, 'Server tidak dapat dihubungi. Periksa koneksi Anda lalu coba lagi.');
    }

    return route(method, url, (data ?? {}) as Body, params);
}
