import { X } from 'lucide-react';
import { Dialog as D, AlertDialog as AD } from 'radix-ui';
import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Dialogs opened from state have no Radix Trigger to give focus back to, so keyboard users would land at the top of the page.
 * This remembers the focused element on open and refocuses it on close. Spread the result on the dialog content.
 */
export function useRestoreFocus(open: boolean) {
    const opener = useRef<HTMLElement | null>(null);

    // A layout effect runs before Radix moves focus, so activeElement is still the opener.
    useLayoutEffect(() => {
        if (open) {
            opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        }
    }, [open]);

    return {
        onCloseAutoFocus: () => {
            opener.current?.focus();
        },
    };
}

export const overlayClass = 'overlay-fade fixed inset-0 z-50 bg-ink/40';
// A dialog taller than the screen scrolls as a whole.
const content =
    'motion-pop fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-lg border border-line bg-surface shadow-xl focus:outline-none';

export function Modal({
    open,
    onOpenChange,
    title,
    description,
    children,
    wide,
    persistent,
}: {
    /** true is a wide form dialog, 'xl' fits several sections side by side. */
    wide?: boolean | 'xl';
    /** For dialogs with fields: clicking outside doesn't close it, so typed input isn't lost. Esc and the close button still work. */
    persistent?: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
}) {
    const restoreFocus = useRestoreFocus(open);

    return (
        <D.Root open={open} onOpenChange={onOpenChange}>
            <D.Portal>
                <D.Overlay className={overlayClass} />
                <D.Content
                    className={wide === 'xl' ? content.replace('max-w-sm', 'max-w-4xl') : wide ? content.replace('max-w-sm', 'max-w-2xl') : content}
                    onInteractOutside={persistent ? (event) => event.preventDefault() : undefined}
                    {...restoreFocus}
                >
                    <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
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

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Hapus',
    loading,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: ReactNode;
    confirmLabel?: string;
    loading?: boolean;
    onConfirm: () => void;
}) {
    const restoreFocus = useRestoreFocus(open);

    return (
        <AD.Root open={open} onOpenChange={onOpenChange}>
            <AD.Portal>
                <AD.Overlay className={overlayClass} />
                <AD.Content className={content} {...restoreFocus}>
                    <div className="border-b border-line px-4 py-3">
                        <AD.Title className="text-sm font-semibold">{title}</AD.Title>
                    </div>
                    <DialogBody>
                        <AD.Description className="text-sm">{description}</AD.Description>
                    </DialogBody>
                    <DialogFooter>
                        <AD.Cancel asChild>
                            <Button variant="outline">Batal</Button>
                        </AD.Cancel>
                        <Button variant="danger" loading={loading} onClick={onConfirm}>
                            {confirmLabel}
                        </Button>
                    </DialogFooter>
                </AD.Content>
            </AD.Portal>
        </AD.Root>
    );
}

/** Dialog parts: the header (drawn by Modal and ConfirmDialog), DialogBody and DialogFooter. */
export function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
    return <div className={cn('p-4', className)} {...props} />;
}

/** Dialog footer: the dismiss button comes first (left), the confirm button last (right). */
export function DialogFooter({ children }: { children: ReactNode }) {
    return <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3">{children}</div>;
}
