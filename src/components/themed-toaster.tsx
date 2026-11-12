import { Toaster } from 'sonner';
import { useTheme } from '@/lib/theme';

/** Toasts follow the page theme. */
export function ThemedToaster() {
    const { resolved } = useTheme();

    return <Toaster theme={resolved} position="top-right" richColors closeButton toastOptions={{ style: { fontSize: '0.8125rem' } }} />;
}
