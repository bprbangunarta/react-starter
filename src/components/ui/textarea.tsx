import { controlClass } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/** Multi-line text. The character counter is drawn by Field, next to the label. */
export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
    return <textarea className={cn(controlClass, 'h-auto min-h-20 resize-y py-1.5', className)} {...props} />;
}
