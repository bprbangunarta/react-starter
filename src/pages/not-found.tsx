import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { APP_INITIAL, APP_NAME } from '@/lib/brand';
import { useTitle } from '@/lib/title';

/** Full-screen error page: always offers a way out. */
export default function NotFound({ status = 404, title = 'Halaman tidak ditemukan', description = 'Halaman yang Anda cari tidak ada atau sudah dipindahkan.' }: { status?: number; title?: string; description?: string }) {
    useTitle(`${status} ${title}`);
    const navigate = useNavigate();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-10 text-center">
            <div className="mb-8 flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">{APP_INITIAL}</span>
                <span className="text-base font-semibold">{APP_NAME}</span>
            </div>
            <p className="text-8xl leading-none font-bold tracking-tight text-primary/20 select-none sm:text-9xl">{status}</p>
            <h1 className="mt-4 text-2xl font-semibold">{title}</h1>
            <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Button variant="outline" onClick={() => window.history.back()}>
                    <ArrowLeft /> Kembali
                </Button>
                <Button onClick={() => navigate('/')}>
                    <Home /> Ke beranda
                </Button>
            </div>
        </main>
    );
}
