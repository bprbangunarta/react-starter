import { ArrowLeft, Home, LogIn, RotateCw } from 'lucide-react';
import { BrandMark } from '@/components/brand-mark';
import { Illustration } from '@/components/illustrations';
import { buttonVariants } from '@/components/ui/button';
import { errorPage } from '@/lib/error-pages';
import { useTitle } from '@/lib/title';
import { cn } from '@/lib/utils';

/**
 * A full-screen error page, outside the app shell (no sidebar, no header): an illustration, what happened in words, and a way out.
 * It uses plain links and `location`, never the router, because it also shows when the router itself failed (ErrorBoundary).
 */
export function ErrorPage({ status, back = false }: { status: number; back?: boolean }) {
    const spec = errorPage(status);
    useTitle(spec.title);

    return (
        <div className="flex min-h-dvh flex-col bg-canvas px-4 pt-6 pb-8">
            <BrandMark className="justify-center" />
            <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-6 text-center">
                <Illustration name={spec.illustration} className="w-80 max-w-full sm:w-96" />
                <p className="mt-2 rounded-full bg-primary-soft px-2.5 py-0.5 text-2xs font-semibold tracking-wide text-primary uppercase">
                    Kode {spec.status}
                </p>
                <h1 className="mt-3 text-xl font-semibold sm:text-2xl">{spec.title}</h1>
                <p className="mt-2 max-w-sm text-sm text-muted">{spec.description}</p>
                <div className="mt-6 grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-flow-col sm:auto-cols-fr">
                    {back && (
                        <button type="button" onClick={() => window.history.back()} className={cn(buttonVariants({ variant: 'outline' }))}>
                            <ArrowLeft /> Kembali
                        </button>
                    )}
                    {spec.action === 'retry' ? (
                        <button type="button" onClick={() => window.location.reload()} className={cn(buttonVariants())}>
                            <RotateCw /> Coba lagi
                        </button>
                    ) : (
                        <a href={spec.action === 'login' ? '/login' : '/'} className={cn(buttonVariants())}>
                            {spec.action === 'login' ? <LogIn /> : <Home />}
                            {spec.action === 'login' ? 'Masuk' : 'Ke beranda'}
                        </a>
                    )}
                </div>
            </main>
        </div>
    );
}
