import { useEffect } from 'react';

const APP = 'Starter Kit';

/** Sets the browser tab title: "Page - Starter Kit". */
export function useTitle(title: string): void {
    useEffect(() => {
        document.title = title ? `${title} - ${APP}` : APP;
    }, [title]);
}
