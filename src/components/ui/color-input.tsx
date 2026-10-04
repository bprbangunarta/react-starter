import { MaskedInput } from '@/components/ui/masked-input';
import { cn } from '@/lib/utils';

/** Starting palette; pass `swatches` to replace it, or `false` to hide it. */
const DEFAULT_SWATCHES = ['#33479f', '#0f766e', '#15803d', '#b45309', '#b91c1c', '#7e22ce', '#334155'];

type Props = {
    id?: string;
    /** `#rrggbb` (lowercase), or '' when empty. A partial value (while typing) is kept as typed. */
    value: string;
    onValueChange: (value: string) => void;
    swatches?: readonly string[] | false;
    disabled?: boolean;
    className?: string;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
};

const FULL = /^#[0-9a-f]{6}$/;

/** Colour picker: native picker, hex field (`#rrggbb`, masked), and optional swatches. */
export function ColorInput({ id, value, onValueChange, swatches = DEFAULT_SWATCHES, disabled, className, ...aria }: Props) {
    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    aria-label="Pilih warna"
                    disabled={disabled}
                    value={FULL.test(value) ? value : '#000000'}
                    onChange={(event) => onValueChange(event.target.value.toLowerCase())}
                    className={cn(
                        'size-8 shrink-0 cursor-pointer rounded-md border border-line bg-surface p-0.5 disabled:opacity-50',
                        !FULL.test(value) && 'opacity-40',
                    )}
                />
                <MaskedInput
                    id={id}
                    mask="#hhhhhh"
                    placeholder="#rrggbb"
                    disabled={disabled}
                    className="font-mono uppercase"
                    value={value.replace('#', '')}
                    onValueChange={(raw) => onValueChange(raw === '' ? '' : `#${raw.toLowerCase()}`)}
                    {...aria}
                />
            </div>
            {swatches && (
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Warna siap pakai">
                    {swatches.map((color) => (
                        <button
                            key={color}
                            type="button"
                            disabled={disabled}
                            title={color}
                            aria-label={`Warna ${color}`}
                            aria-pressed={value === color}
                            onClick={() => onValueChange(color)}
                            style={{ backgroundColor: color }}
                            className={cn(
                                'size-5 cursor-pointer rounded border border-line focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none disabled:opacity-50',
                                value === color && 'ring-2 ring-primary ring-offset-1',
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
