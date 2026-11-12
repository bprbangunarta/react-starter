import { afterEach, describe, expect, it, vi } from 'vitest';
import { listenForErrors, reportError, setErrorReporter } from '@/lib/report';

describe('report', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('hands errors to the plugged-in reporter', () => {
        const seen = vi.fn();
        setErrorReporter(seen);

        reportError(new Error('boom'), 'somewhere');

        expect(seen).toHaveBeenCalledWith(expect.objectContaining({ message: 'boom' }), 'somewhere');
    });

    it('reports unhandled rejections but not cancelled uploads', () => {
        const seen = vi.fn();
        setErrorReporter(seen);
        listenForErrors();

        window.dispatchEvent(Object.assign(new Event('unhandledrejection'), { reason: new DOMException('stop', 'AbortError') }));
        expect(seen).not.toHaveBeenCalled();

        window.dispatchEvent(Object.assign(new Event('unhandledrejection'), { reason: new Error('real') }));
        expect(seen).toHaveBeenCalledTimes(1);
    });
});
