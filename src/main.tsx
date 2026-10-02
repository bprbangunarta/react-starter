import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import App from '@/App';
import '@/index.css';

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <App />
        <Toaster position="top-right" richColors closeButton toastOptions={{ style: { fontSize: '0.8125rem' } }} />
    </StrictMode>,
);
