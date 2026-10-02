import { useCallback, useEffect, useRef, useState } from 'react';
import { http, HttpError } from '@/lib/http';
import type { Params } from '@/lib/http';

/** Load a resource with `GET url?params`, reloading whenever the params change. */
export function useResource<T>(url: string, params?: Params) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const key = JSON.stringify(params ?? {});
    const latest = useRef(0);

    const load = useCallback(async () => {
        const run = ++latest.current;
        setLoading(true);
        setError(null);

        try {
            const result = await http.get<T>(url, JSON.parse(key) as Params);

            if (run === latest.current) {
                setData(result);
            }
        } catch (e) {
            if (run === latest.current) {
                setError(e instanceof HttpError ? e.message : 'Terjadi kesalahan.');
            }
        } finally {
            if (run === latest.current) {
                setLoading(false);
            }
        }
    }, [url, key]);

    useEffect(() => {
        void load();
    }, [load]);

    return { data, loading, error, reload: load, setData };
}
