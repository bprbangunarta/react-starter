import { controlClass } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Multi-line text. With `maxLength` and a controlled `value`, a character counter shows below, at the right. A description of the
 * field is the `hint` of its `Field` (a tooltip on the label), never text under the control.
 */
export function Textarea({ className, value, maxLength, ...props }: React.ComponentProps<'textarea'>) {
    const counted = maxLength !== undefined && typeof value === 'string';

    return (
        <div className="flex flex-col gap-1">
            <textarea className={cn(controlClass, 'h-auto min-h-20 resize-y py-1.5', className)} value={value} maxLength={maxLength} {...props} />
            {counted && (
                <p className="self-end text-xs text-muted tabular-nums" aria-hidden="true">
                    {value.length}/{maxLength}
                </p>
            )}
        </div>
    );
}
