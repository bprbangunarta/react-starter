import { controlClass } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/** Multi-line text. With `maxLength` and a controlled `value`, a character counter shows below. */
export function Textarea({ className, value, maxLength, ...props }: React.ComponentProps<'textarea'>) {
    return (
        <div className="flex flex-col gap-1">
            <textarea className={cn(controlClass, 'h-auto min-h-20 resize-y py-1.5', className)} value={value} maxLength={maxLength} {...props} />
            {maxLength !== undefined && typeof value === 'string' && (
                <p className="text-right text-xs text-muted tabular-nums" aria-hidden="true">
                    {value.length}/{maxLength}
                </p>
            )}
        </div>
    );
}
