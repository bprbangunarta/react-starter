import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { http, HttpError } from '@/lib/http';

export type AuthUser = { id: number; name: string; username: string; email: string };

export type Notification = {
    id: number;
    title: string;
    body: string;
    module: string;
    level: 'info' | 'success' | 'warning';
    url: string | null;
    read: boolean;
    at: string;
};

export type Notifications = { unread: number; items: Notification[] };

export type Me = {
    user: AuthUser;
    security: { enabled: boolean; method: 'totp' | 'email' | null };
    notifications: Notifications;
};

type SessionValue = {
    me: Me | null;
    /** True until the first answer about who is signed in. */
    loading: boolean;
    /** Ask the server again who is signed in (after signing in, changing the security settings, ...). */
    refresh: () => Promise<Me | null>;
    setNotifications: (notifications: Notifications) => void;
    signOut: () => Promise<void>;
};

const Session = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
    const [me, setMe] = useState<Me | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const result = await http.get<Me>('/me');
            setMe(result);

            return result;
        } catch (e) {
            if (e instanceof HttpError && e.status !== 401) {
                console.error(e);
            }

            setMe(null);

            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const value = useMemo<SessionValue>(
        () => ({
            me,
            loading,
            refresh,
            setNotifications: (notifications) => setMe((current) => (current ? { ...current, notifications } : current)),
            signOut: async () => {
                await http.post('/logout');
                setMe(null);
            },
        }),
        [me, loading, refresh],
    );

    return <Session.Provider value={value}>{children}</Session.Provider>;
}

export function useSession(): SessionValue {
    const value = useContext(Session);

    if (!value) {
        throw new Error('useSession must be used inside SessionProvider');
    }

    return value;
}
