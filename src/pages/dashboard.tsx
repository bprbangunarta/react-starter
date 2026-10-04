import { LayoutDashboard } from 'lucide-react';
import { Card, EmptyState, PageHeader } from '@/components/ui/misc';
import { useTitle } from '@/lib/title';

/** The home page. Replace the card with the first real content of the product. */
export default function Dashboard() {
    useTitle('Dashboard');

    return (
        <>
            <PageHeader title="Dashboard" description="Ringkasan produk Anda akan tampil di sini" />
            <Card>
                <EmptyState
                    icon={<LayoutDashboard />}
                    title="Placeholder"
                    description="Halaman ini sengaja kosong. Tambahkan menu di layouts/app-layout.tsx dan halaman di src/pages."
                />
            </Card>
        </>
    );
}
