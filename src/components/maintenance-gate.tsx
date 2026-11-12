import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ErrorPage } from '@/components/error-page';
import { MAINTENANCE_EVENT } from '@/lib/http';

/**
 * Shows the maintenance page when the server answers 503 (lib/http.ts), instead of a toast on every screen.
 * "Coba lagi" reloads the page.
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
