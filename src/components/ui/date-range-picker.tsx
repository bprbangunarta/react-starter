import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { CalendarRange, X } from 'lucide-react';
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { controlClass } from '@/components/ui/input';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

/** Both ends are ISO `YYYY-MM-DD` strings, or empty when not chosen. */
export type DateSpan = { from: string; to: string };

type Props = {
    value: DateSpan;
    onChange: (value: DateSpan) => void;
    min?: Date;
    max?: Date;
    clearable?: boolean;
    invalid?: boolean;
    id?: string;
    placeholder?: string;
    /** Accessible name when there is no visible `Field` label (e.g. a toolbar filter). */
    'aria-label'?: string;
};

/** One calendar for a from–to period (a filter by date). Click the first day, then the last; the list closes on the second click. */
export function DateRangePicker({
    value,
    onChange,
    min = new Date(1940, 0, 1),
    max = new Date(),
    clearable = false,
    invalid,
    id,
    placeholder = 'Pilih rentang tanggal',
    'aria-label': ariaLabel,
}: Props) {
    const [open, setOpen] = useState(false);
    const from = value.from ? parseISO(value.from) : undefined;
    const to = value.to ? parseISO(value.to) : undefined;
    const label = from ? (to ? `${formatDate(from)} – ${formatDate(to)}` : `${formatDate(from)} – …`) : undefined;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className="relative">
                <PopoverTrigger asChild>
                    <button
                        id={id}
                        type="button"
                        data-invalid={invalid || undefined}
                        aria-label={ariaLabel}
                        title={label}
                        className={cn(
                            controlClass,
                            'flex items-center justify-between gap-1 text-left data-[invalid]:border-danger data-[invalid]:ring-danger/20',
                            clearable && label && 'pr-12',
                        )}
                    >
                        <span className={cn('truncate', !label && 'text-muted/70')}>{label ?? placeholder}</span>
                        <CalendarRange className="size-3.5 shrink-0 text-muted" />
                    </button>
                </PopoverTrigger>
                {clearable && label && (
                    <button
                        type="button"
                        aria-label="Hapus rentang tanggal"
                        className="absolute top-1/2 right-7 -translate-y-1/2 rounded p-0.5 text-muted hover:text-ink"
                        onClick={() => onChange({ from: '', to: '' })}
                    >
                        <X className="size-3" />
                    </button>
                )}
            </div>
            <PopoverContent aria-label={ariaLabel ?? placeholder} className="w-fit p-1.5">
                <DayPicker
                    mode="range"
                    locale={idLocale}
                    captionLayout="dropdown"
                    startMonth={min}
                    endMonth={max}
                    defaultMonth={from ?? max}
                    selected={from ? ({ from, to } satisfies DateRange) : undefined}
                    disabled={{ before: min, after: max }}
                    onSelect={(_range, day) => {
                        const iso = format(day, 'yyyy-MM-dd');

                        // The first click, or a click after a finished period, starts a new one; the next click on or after it ends it
                        // (the same day twice is a one-day period).
                        if (!from || to || day < from) {
                            onChange({ from: iso, to: '' });

                            return;
                        }

                        onChange({ from: value.from, to: iso });
                        setOpen(false);
                    }}
                    className="compact-calendar"
                />
            </PopoverContent>
        </Popover>
    );
}
