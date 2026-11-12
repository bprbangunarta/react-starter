import { X } from 'lucide-react';
import { Dialog as D } from 'radix-ui';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { overlayClass, useRestoreFocus } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/**
 * A panel that slides in from the side: details of a row, or a long form that should keep the page visible behind it.
 * Same three parts as a dialog: header (title), body (`DrawerBody`), and an optional footer (`DialogFooter`).
 */
export function Drawer({
    open,
    onOpenChange,
    title,
    description,
    side = 'right',
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    side?: 'left' | 'right';
    children: ReactNode;
}) {
    const restoreFocus = useRestoreFocus(open);

    return (
        <D.Root open={open} onOpenChange={onOpenChange}>
            <D.Portal>
                <D.Overlay className={overlayClass} />
                <D.Content
                    className={cn(
                        'overlay-fade fixed inset-y-0 z-50 flex w-full max-w-md flex-col border-line bg-surface shadow-xl focus:outline-none',
                        side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
                    )}
                    {...restoreFocus}
                >
                    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3">
                        <div className="min-w-0">
                            <D.Title className="text-sm font-semibold">{title}</D.Title>
                            <D.Description className="text-xs text-muted">{description ?? ' '}</D.Description>
                        </div>
                        <D.Close asChild>
                            <Button variant="ghost" size="icon" aria-label="Tutup">
                                <X />
                            </Button>
                        </D.Close>
                    </div>
                    {children}
                </D.Content>
            </D.Portal>
        </D.Root>
    );
}

/** Scrolling content of a `Drawer`. */
export function DrawerBody({ className, ...props }: React.ComponentProps<'div'>) {
    return <div className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain p-4', className)} {...props} />;
}
