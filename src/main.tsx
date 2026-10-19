import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import App from '@/App';
import { ErrorBoundary } from '@/components/error-boundary';
import { MaintenanceGate } from '@/components/maintenance-gate';
import '@/index.css';

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <ErrorBoundary>
            <MaintenanceGate>
                <App />
            </MaintenanceGate>
        </ErrorBoundary>
        <Toaster position="top-right" richColors closeButton toastOptions={{ style: { fontSize: '0.8125rem' } }} />
    </StrictMode>,
);
