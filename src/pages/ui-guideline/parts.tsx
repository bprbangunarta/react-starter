import type { ReactNode } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/misc';

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
    return (
        <Card>
            <CardHeader title={title} description={description} />
            <CardBody className="flex flex-col gap-3">{children}</CardBody>
        </Card>
    );
}

export function SubTitle({ children }: { children: ReactNode }) {
    return <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">{children}</h3>;
}
