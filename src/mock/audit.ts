import { sha256 } from '@/mock/crypto';
import type { AuditEntry, Db } from '@/mock/db';

/** The fields an entry's hash covers, in a fixed order. The hash also covers the hash of the entry before it: a chain. */
function payload(e: Omit<AuditEntry, 'hash'>): string {
    return JSON.stringify([e.id, e.at, e.user, e.username, e.module, e.event, e.action, e.subject_type, e.subject_id, e.subject, e.outcome, e.old, e.new, e.context, e.previous_hash]);
}

export const GENESIS = '0'.repeat(64);

export type NewEntry = {
    at?: string;
    user?: string | null;
    username?: string | null;
    module: string;
    event: string;
    action: string;
    subject_type?: string | null;
    subject_id?: number | null;
    subject?: string | null;
    outcome?: AuditEntry['outcome'];
    old?: Record<string, unknown> | null;
    new?: Record<string, unknown> | null;
    context?: Record<string, unknown> | null;
    method?: string;
    url?: string;
};

/** Append an entry to the chain (the log is append-only: nothing in the app edits or deletes an entry). */
export async function record(db: Db, entry: NewEntry): Promise<AuditEntry> {
    const last = db.audit[db.audit.length - 1];
    const base: Omit<AuditEntry, 'hash'> = {
        id: (last?.id ?? 0) + 1,
        at: entry.at ?? new Date().toISOString(),
        user: entry.user ?? null,
        username: entry.username ?? null,
        module: entry.module,
        event: entry.event,
        action: entry.action,
        subject_type: entry.subject_type ?? null,
        subject_id: entry.subject_id ?? null,
        subject: entry.subject ?? null,
        outcome: entry.outcome ?? 'success',
        ip: '127.0.0.1',
        method: entry.method ?? 'POST',
        url: entry.url ?? '/',
        user_agent: navigator.userAgent,
        request_id: crypto.randomUUID(),
        old: entry.old ?? null,
        new: entry.new ?? null,
        context: entry.context ?? null,
        previous_hash: last?.hash ?? GENESIS,
    };
    const stored: AuditEntry = { ...base, hash: await sha256(payload(base)) };
    db.audit.push(stored);

    return stored;
}

/** Re-computes the whole chain; the first entry that does not match is where it was altered. */
export async function verify(db: Db): Promise<{ ok: boolean; checked: number; broken_at: number | null; reason: string | null }> {
    let previous = GENESIS;
    let checked = 0;

    for (const entry of db.audit) {
        const { hash, ...rest } = entry;

        if (entry.previous_hash !== previous) {
            return { ok: false, checked, broken_at: entry.id, reason: 'Tautan ke entri sebelumnya tidak cocok (ada entri sebelumnya yang dihapus atau diubah).' };
        }

        if ((await sha256(payload(rest))) !== hash) {
            return { ok: false, checked, broken_at: entry.id, reason: 'Isi entri ini diubah setelah ditulis.' };
        }

        previous = hash;
        checked++;
    }

    return { ok: true, checked, broken_at: null, reason: null };
}

/** A believable history for the demo: a month of sign-ins, edits and a few refusals by four people. */
export async function seed(db: Db): Promise<void> {
    let n = 7;
    const rand = () => {
        n = (n * 1103515245 + 12345) % 2147483648;

        return n / 2147483648;
    };
    const pick = <T,>(list: T[]): T => list[Math.floor(rand() * list.length)];

    const people = [
        { user: 'Administrator', username: 'admin' },
        { user: 'Rina Wulandari', username: 'rina' },
        { user: 'Budi Santoso', username: 'budi' },
        { user: 'Sari Dewi', username: 'sari' },
    ];
    const subjects = ['Proyek Alfa', 'Proyek Beta', 'Dokumen 2026-014', 'Laporan Bulanan', 'Pengaturan Notifikasi'];
    const now = Date.now();
    const entries: NewEntry[] = [];

    for (let i = 0; i < 160; i++) {
        const at = new Date(now - (160 - i) * (30 * 24 * 3600 * 1000) / 160 + Math.floor(rand() * 3600 * 1000)).toISOString();
        const person = pick(people);
        const roll = rand();

        if (roll < 0.28) {
            entries.push({ at, ...person, module: 'auth', event: 'auth.login', action: 'login', subject_type: 'User', subject: person.username, url: '/login' });
        } else if (roll < 0.36) {
            entries.push({ at, ...person, module: 'auth', event: 'auth.logout', action: 'logout', subject_type: 'User', subject: person.username, url: '/logout' });
        } else if (roll < 0.42) {
            entries.push({ at, user: null, username: person.username, module: 'auth', event: 'auth.login_failed', action: 'login_failed', outcome: 'failure', subject: person.username, context: { reason: 'Kata sandi salah' }, url: '/login' });
        } else if (roll < 0.74) {
            const subject = pick(subjects);
            const id = Math.floor(rand() * 90) + 10;
            const updated = rand() < 0.7;
            entries.push({
                at, ...person, module: 'records', event: updated ? 'records.updated' : 'records.created', action: updated ? 'updated' : 'created',
                subject_type: 'Record', subject_id: id, subject, method: updated ? 'PUT' : 'POST', url: `/records/${id}`,
                old: updated ? { status: 'draft', owner: pick(people).user } : null,
                new: { status: updated ? 'published' : 'draft', owner: pick(people).user },
            });
        } else if (roll < 0.84) {
            entries.push({ at, ...person, module: 'settings', event: 'settings.updated', action: 'updated', subject_type: 'Setting', subject_id: 1, subject: 'Batas unggah', method: 'PUT', url: '/settings', old: { upload_limit_mb: 10 }, new: { upload_limit_mb: pick([10, 25, 50]) } });
        } else if (roll < 0.92) {
            entries.push({ at, ...person, module: 'profile', event: 'profile.password_changed', action: 'password_changed', subject_type: 'User', subject: person.username, method: 'PUT', url: '/profile/password' });
        } else {
            entries.push({ at, ...person, module: 'access', event: 'access.denied', action: 'denied', outcome: 'denied', subject: `GET /admin/${pick(['users', 'roles', 'billing'])}`, method: 'GET', url: '/admin', context: { reason: 'Tidak punya akses' } });
        }
    }

    for (const entry of entries) {
        await record(db, entry);
    }
}
