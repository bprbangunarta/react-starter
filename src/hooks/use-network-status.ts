import { useCallback, useEffect, useRef, useState } from 'react';

export type NetworkStatus = 'online' | 'offline' | 'restored';

const PING_TIMEOUT_MS = 5000;
const RETRY_EVERY_MS = 5000;
const RESTORED_SHOWN_MS = 3000;

/** True when the app's own host answers (any HTTP status counts: the network itself works). */
async function reachable(): Promise<boolean> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

    try {
        await fetch('/health.txt', { cache: 'no-store', credentials: 'omit', signal: controller.signal });

        return true;
    } catch {
        return false;
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Detects a lost connection and its return. The browser's offline event is taken at its word, but coming back is
 * confirmed by reaching the host (`navigator.onLine` alone says "online" on a Wi-Fi without internet). While offline the
 * host is retried every few seconds; `restored` lasts a moment after the connection returns so the UI can say so.
 */
export function useNetworkStatus(): NetworkStatus {
    const [status, setStatus] = useState<NetworkStatus>('online');
    const offline = useRef(false);
    const restoredTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const goOffline = useCallback(() => {
        clearTimeout(restoredTimer.current);
        offline.current = true;
        setStatus('offline');
    }, []);

    const check = useCallback(async () => {
        if (await reachable()) {
            if (offline.current) {
                offline.current = false;
                setStatus('restored');
                restoredTimer.current = setTimeout(() => setStatus('online'), RESTORED_SHOWN_MS);
            }
        } else {
            goOffline();
        }
    }, [goOffline]);

    useEffect(() => {
        const onVisible = () => document.visibilityState === 'visible' && void check();
        const onOnline = () => void check();

        window.addEventListener('offline', goOffline);
        window.addEventListener('online', onOnline);
        document.addEventListener('visibilitychange', onVisible);

        if (!navigator.onLine) {
            goOffline();
        }

        return () => {
            window.removeEventListener('offline', goOffline);
            window.removeEventListener('online', onOnline);
            document.removeEventListener('visibilitychange', onVisible);
            clearTimeout(restoredTimer.current);
        };
    }, [check, goOffline]);

    useEffect(() => {
        if (status !== 'offline') {
            return;
        }

        const timer = setInterval(() => void check(), RETRY_EVERY_MS);

        return () => clearInterval(timer);
    }, [status, check]);

    return status;
}
