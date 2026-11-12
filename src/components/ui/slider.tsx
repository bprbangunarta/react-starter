import { Slider as S } from 'radix-ui';
import { cn } from '@/lib/utils';

type Props = {
    /** One value, or two for a range. */
    value: number[];
    onValueChange: (value: number[]) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    /** Name of a single slider. */
    'aria-label'?: string;
    /** One name per thumb for a range, e.g. ['Dari', 'Sampai']. */
    labels?: string[];
    id?: string;
    className?: string;
};

/** Number or range by dragging, for rough values. Use CurrencyInput for exact amounts. */
export function Slider({ value, onValueChange, min = 0, max = 100, step = 1, disabled, 'aria-label': ariaLabel, labels, id, className }: Props) {
    const names = labels ?? value.map(() => ariaLabel);

    return (
        <S.Root
            id={id}
            value={value}
            onValueChange={onValueChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={cn('relative flex h-5 w-full touch-none items-center select-none data-[disabled]:opacity-50', className)}
        >
            <S.Track className="relative h-1.5 grow rounded-full bg-canvas">
                <S.Range className="absolute h-full rounded-full bg-primary" />
            </S.Track>
            {value.map((_, index) => (
                <S.Thumb
                    key={`thumb-${index}`}
                    aria-label={names[index]}
                    className="block size-4 cursor-pointer rounded-full border-2 border-primary bg-surface shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                />
            ))}
        </S.Root>
    );
}
