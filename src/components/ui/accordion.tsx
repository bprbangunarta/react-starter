import { ChevronDown } from 'lucide-react';
import { Accordion as A } from 'radix-ui';
import { cn } from '@/lib/utils';

/** Foldable sections. type="single" keeps one open, "multiple" allows several. */
export const Accordion = A.Root;

export function AccordionItem({ className, ...props }: React.ComponentProps<typeof A.Item>) {
    return <A.Item className={cn('border-b border-line last:border-b-0', className)} {...props} />;
}

export function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof A.Trigger>) {
    return (
        <A.Header className="flex">
            <A.Trigger
                className={cn(
                    'group flex flex-1 cursor-pointer items-center justify-between gap-2 py-2.5 text-left text-sm font-medium text-ink hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none',
                    className,
                )}
                {...props}
            >
                <span className="min-w-0">{children}</span>
                <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-data-[state=open]:rotate-180" aria-hidden />
            </A.Trigger>
        </A.Header>
    );
}

export function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof A.Content>) {
    return (
        <A.Content className="motion-accordion overflow-hidden text-sm" {...props}>
            <div className={cn('pb-3 text-muted', className)}>{children}</div>
        </A.Content>
    );
}
