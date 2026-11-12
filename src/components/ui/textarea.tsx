import { controlClass } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Multi-line text. With `maxLength` and a controlled `value`, the character counter ("0/200") is shown by the surrounding `Field`, at the
 * right of the label, so the space under the control never changes. A description of the field is the `hint` of its `Field`
 * (a tooltip on the label), never text under the control.
 */
export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
    return <textarea className={cn(controlClass, 'h-auto min-h-20 resize-y py-1.5', className)} {...props} />;
}
