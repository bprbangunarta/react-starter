type Reporter = (error: unknown, context?: string) => void;

let reporter: Reporter = (error, context) => console.error(context ?? 'Unexpected error', error);

/**
 * Plug a monitoring service in here (Sentry or similar), once, before the app renders:
 * setErrorReporter((error, context) => Sentry.captureException(error, { extra: { context } }));
 * Never send passwords, tokens or OTP codes.
 */
export function setErrorReporter(next: Reporter): void {
    reporter = next;
}

/** The one exit for errors nobody handled. The default writes to the console. */
export function reportError(error: unknown, context?: string): void {
    reporter(error, context);
}

/** Reports errors that escape React: uncaught exceptions and promises rejected without a catch. Cancelled uploads are not errors. */
export function listenForErrors(): void {
    window.addEventListener('error', (event) => reportError(event.error ?? event.message, 'window error'));
    window.addEventListener('unhandledrejection', (event) => {
        if (event.reason instanceof DOMException && event.reason.name === 'AbortError') {
            return;
        }

        reportError(event.reason, 'unhandled rejection');
    });
}

/**
 * After a deploy, an open tab may ask for a chunk that no longer exists. Reload once to get the new build; if the page was
 * already reloaded and it still fails, leave it to the ErrorBoundary (no reload loop).
 */
export function reloadOnStaleChunk(): void {
    window.addEventListener('vite:preloadError', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;

        if (navigation?.type !== 'reload') {
            window.location.reload();
        }
    });
}
