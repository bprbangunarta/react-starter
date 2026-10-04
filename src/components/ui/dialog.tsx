import { X } from 'lucide-react';
import { Dialog as D, AlertDialog as AD } from 'radix-ui';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

const overlay = 'fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-in data-[state=open]:fade-in-0';
const content =
    'fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-line bg-surface shadow-xl focus:outline-none';

export function Modal({
    open,
    onOpenChange,
    title,
    description,
    children,
    wide,
}: {
    wide?: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <D.Root open={open} onOpenChange={onOpenChange}>
            <D.Portal>
                <D.Overlay className={overlay} />
                <D.Content className={wide ? content.replace('max-w-sm', 'max-w-2xl') : content}>
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
    return (
        <AD.Root open={open} onOpenChange={onOpenChange}>
            <AD.Portal>
                <AD.Overlay className={overlay} />
                <AD.Content className={content}>
                    <div className="px-4 pt-4 pb-3">
                        <AD.Title className="text-sm font-semibold">{title}</AD.Title>
                        <AD.Description className="mt-1 text-sm text-muted">{description}</AD.Description>
                    </div>
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
 * Footer of every dialog: the dismissing button (Batal / Back) is the first child and sits at the left,
 * the confirming button (Save / Create / Delete) is the last child and sits at the right.
 */
export function DialogFooter({ children }: { children: ReactNode }) {
    return <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3">{children}</div>;
}
