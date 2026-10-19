import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ErrorPage } from '@/components/error-page';

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
            return <ErrorPage status={500} />;
        }

        return this.props.children;
    }
}
