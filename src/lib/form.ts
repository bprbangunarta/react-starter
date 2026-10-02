import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { http, HttpError } from '@/lib/http';

type FormData = Record<string, unknown>;

type Options<R> = {
    onSuccess?: (response: R) => void;
    onError?: (errors: Record<string, string>) => void;
    onFinish?: () => void;
    preserveScroll?: boolean;
    /** Show the `message` of the response as a toast (default true). */
    toast?: boolean;
};

/**
 * A form bound to the API: `data`, `setData`, `errors` (first message per field), `processing`, `isDirty`, and
 * `post/put/delete(url)` which send the data as JSON and fill `errors` from a 422 response. Same shape as the form helper
 * the screens were written for, so the screens read like the original application.
 */
export function useForm<T extends FormData>(initial: T) {
    const defaults = useRef<T>(initial);
    const [data, setDataState] = useState<T>(initial);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const setData = useCallback((key: keyof T | Partial<T>, value?: unknown) => {
        setDataState((current) => (typeof key === 'object' ? { ...current, ...key } : { ...current, [key]: value }));
    }, []);

    const submit = async <R>(method: 'post' | 'put' | 'delete', url: string, options: Options<R> = {}) => {
        setProcessing(true);
        setErrors({});

        try {
            const response = await http[method]<R & { message?: string }>(url, data);

            if (options.toast !== false && response && typeof response === 'object' && 'message' in response && response.message) {
                toast.success(response.message);
            }

            options.onSuccess?.(response);
        } catch (e) {
            if (e instanceof HttpError && e.status === 422) {
                const mapped = Object.fromEntries(Object.entries(e.errors).map(([k, v]) => [k, v[0]]));
                setErrors(mapped);
                options.onError?.(mapped);
            } else {
                toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan.');
                options.onError?.({});
            }
        } finally {
            setProcessing(false);
            options.onFinish?.();
        }
    };

    return {
        data,
        setData,
        errors,
        processing,
        isDirty: JSON.stringify(data) !== JSON.stringify(defaults.current),
        setError: (key: string, message: string) => setErrors((current) => ({ ...current, [key]: message })),
        clearErrors: () => setErrors({}),
        reset: (...keys: (keyof T)[]) => {
            setDataState((current) => (keys.length === 0 ? defaults.current : { ...current, ...Object.fromEntries(keys.map((k) => [k, defaults.current[k]])) }));
            setErrors({});
        },
        setDefaults: () => {
            defaults.current = data;
        },
        post: <R = unknown>(url: string, options?: Options<R>) => submit('post', url, options),
        put: <R = unknown>(url: string, options?: Options<R>) => submit('put', url, options),
        delete: <R = unknown>(url: string, options?: Options<R>) => submit('delete', url, options),
    };
}
