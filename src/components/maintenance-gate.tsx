import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ErrorPage } from '@/components/error-page';
import { MAINTENANCE_EVENT } from '@/lib/http';

/**
 * Shows the full-screen maintenance page when the server says it is in maintenance (`503`, see `lib/http.ts`), instead of a toast on every
 * screen. "Coba lagi" reloads the page, which is the whole app again once the server is back.
 */
export function MaintenanceGate({ children }: { children: ReactNode }) {
    const [down, setDown] = useState(false);

    useEffect(() => {
        const show = () => setDown(true);
        window.addEventListener(MAINTENANCE_EVENT, show);

        return () => window.removeEventListener(MAINTENANCE_EVENT, show);
    }, []);

    return down ? <ErrorPage status={503} /> : children;
}
