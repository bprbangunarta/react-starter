import { Clock } from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { controlClass } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = {
    /** HH:mm, 24 hours. Empty when not set. */
    value: string;
    onChange: (value: string) => void;
    /** Step between minutes, default 5. */
    minuteStep?: number;
    invalid?: boolean;
    id?: string;
    placeholder?: string;
    /** For controls without a visible label. */
    'aria-label'?: string;
};

const pad = (n: number) => String(n).padStart(2, '0');

function Column({ label, items, current, onPick }: { label: string; items: number[]; current: number | null; onPick: (n: number) => void }) {
    return (
        <ul aria-label={label} className="flex max-h-48 w-12 flex-col gap-0.5 overflow-auto overscroll-contain">
            {items.map((n) => (
                <li key={n}>
                    <button
                        type="button"
                        aria-pressed={n === current}
                        onClick={() => onPick(n)}
                        className={cn(
                            'h-7 w-full cursor-pointer rounded text-sm hover:bg-canvas focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none',
                            n === current && 'bg-primary text-on-primary hover:bg-primary',
                        )}
                    >
                        {pad(n)}
                    </button>
                </li>
            ))}
        </ul>
    );
}

/** Hour and minute picker. The value is HH:mm. */
export function TimePicker({ value, onChange, minuteStep = 5, invalid, id, placeholder = 'Pilih jam', 'aria-label': ariaLabel }: Props) {
    const [open, setOpen] = useState(false);
    const match = /^(\d{2}):(\d{2})$/.exec(value);
    const hour = match ? Number(match[1]) : null;
    const minute = match ? Number(match[2]) : null;
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    id={id}
                    type="button"
                    data-invalid={invalid || undefined}
                    aria-label={ariaLabel}
                    className={cn(controlClass, 'flex items-center justify-between text-left data-[invalid]:border-danger data-[invalid]:ring-danger/20')}
                >
                    <span className={cn(!match && 'text-muted/70')}>{match ? value : placeholder}</span>
                    <Clock className="size-3.5 text-muted" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                aria-label={ariaLabel ?? placeholder}
                className="w-fit p-1.5"
                // Inside a dialog the scroll lock blocks wheel/touch on portaled content.
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
            >
                <div className="flex gap-1">
                    <Column label="Jam" items={hours} current={hour} onPick={(h) => onChange(`${pad(h)}:${pad(minute ?? 0)}`)} />
                    <Column
                        label="Menit"
                        items={minutes}
                        current={minute}
                        onPick={(m) => {
                            onChange(`${pad(hour ?? 0)}:${pad(m)}`);
                            setOpen(false);
                        }}
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}
