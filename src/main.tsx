import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import { ErrorBoundary } from '@/components/error-boundary';
import { MaintenanceGate } from '@/components/maintenance-gate';
import { ThemedToaster } from '@/components/themed-toaster';
import { listenForErrors, reloadOnStaleChunk } from '@/lib/report';
import '@/index.css';

listenForErrors();
reloadOnStaleChunk();

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <ErrorBoundary>
            <MaintenanceGate>
                <App />
            </MaintenanceGate>
        </ErrorBoundary>
        <ThemedToaster />
    </StrictMode>,
);
