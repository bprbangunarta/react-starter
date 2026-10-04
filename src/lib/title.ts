import { useEffect } from 'react';
import { APP_NAME } from '@/lib/brand';

/** Sets the browser tab title: "Page - <app name>". */
export function useTitle(title: string): void {
    useEffect(() => {
        document.title = title ? `${title} - ${APP_NAME}` : APP_NAME;
    }, [title]);
}
