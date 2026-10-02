/** The pretend database: one JSON document in localStorage, so a reload keeps what was done. Clear it from the browser to start over. */
export type MockUser = {
    id: number;
    name: string;
    username: string;
    email: string;
    password: string;
    mfa_method: 'totp' | 'email' | null;
    mfa_secret: string | null;
    recovery_codes: string[];
};

export type AuditEntry = {
    id: number;
    at: string; // ISO
    user: string | null;
    username: string | null;
    module: string;
    event: string;
    action: string;
    subject_type: string | null;
    subject_id: number | null;
    subject: string | null;
    outcome: 'success' | 'failure' | 'denied';
    ip: string;
    method: string;
    url: string;
    user_agent: string;
    request_id: string;
    old: Record<string, unknown> | null;
    new: Record<string, unknown> | null;
    context: Record<string, unknown> | null;
    previous_hash: string;
    hash: string;
};

export type MockNotification = {
    id: number;
    title: string;
    body: string;
    module: string;
    level: 'info' | 'success' | 'warning';
    url: string | null;
    read: boolean;
    at: string;
};

export type Session = {
    userId: number | null;
    /** Signed in with the password, waiting for the second factor. */
    pendingUserId: number | null;
    attempts: number;
    emailCode: string | null;
    emailSentAt: number | null;
};

export type Db = {
    users: MockUser[];
    audit: AuditEntry[];
    notifications: MockNotification[];
    session: Session;
};

const KEY = 'starterkit.db.v1';

let cache: Db | null = null;

export function loadDb(): Db | null {
    if (cache) {
        return cache;
    }

    try {
        const raw = localStorage.getItem(KEY);
        cache = raw ? (JSON.parse(raw) as Db) : null;
    } catch {
        cache = null;
    }

    return cache;
}

export function saveDb(db: Db): void {
    cache = db;

    try {
        localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
        // Storage full or blocked: the session still works from memory.
    }
}

export function resetDb(): void {
    cache = null;
    localStorage.removeItem(KEY);
}
