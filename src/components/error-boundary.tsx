import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ErrorState } from '@/components/ui/misc';

type Props = { children: ReactNode };
type State = { failed: boolean };

/** Catches render errors so one broken screen does not blank the whole app. */
export class ErrorBoundary extends Component<Props, State> {
    state: State = { failed: false };

    static getDerivedStateFromError(): State {
        return { failed: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error(error, info.componentStack);
    }

    render() {
        if (this.state.failed) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-canvas">
                    <ErrorState message="Halaman tidak dapat ditampilkan. Muat ulang untuk mencoba lagi." onRetry={() => window.location.reload()} />
                </div>
            );
        }

        return this.props.children;
    }
}
