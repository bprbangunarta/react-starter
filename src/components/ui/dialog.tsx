import { X } from 'lucide-react';
import { Dialog as D, AlertDialog as AD } from 'radix-ui';
import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Dialogs here are opened by state, not by a Radix `Trigger`, so Radix has nothing to give focus back to when they close and
 * keyboard users would land at the top of the page. This remembers the element that had focus when the dialog opened and
 * returns focus to it on close. Spread the result on the dialog content.
 */
export function useRestoreFocus(open: boolean) {
    const opener = useRef<HTMLElement | null>(null);

    // A layout effect runs before Radix moves focus into the dialog, so `activeElement` is still the opener.
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
// A dialog taller than the screen scrolls as a whole (small phones, landscape) instead of being cut off.
const content =
    'overlay-fade fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-lg border border-line bg-surface shadow-xl focus:outline-none';

export function Modal({
    open,
    onOpenChange,
    title,
    description,
    children,
    wide,
    persistent,
}: {
    wide?: boolean;
    /** For dialogs with fields: a click outside does not close it (Esc and the close button still do), so typed input is not lost by accident. */
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
                    className={wide ? content.replace('max-w-sm', 'max-w-2xl') : content}
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

/**
 * Every dialog has three parts: a header (title, and for form dialogs a short subtitle), a body (the content: form fields,
 * or the message of a confirmation), and a footer with the buttons. `Modal` and `ConfirmDialog` draw the header; screens
 * supply `DialogBody` and `DialogFooter`.
 */
export function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
    return <div className={cn('p-4', className)} {...props} />;
}

/**
 * Footer of every dialog: the dismissing button (Batal / Back) is the first child and sits at the left,
 * the confirming button (Save / Create / Delete) is the last child and sits at the right.
 */
export function DialogFooter({ children }: { children: ReactNode }) {
    return <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3">{children}</div>;
}
