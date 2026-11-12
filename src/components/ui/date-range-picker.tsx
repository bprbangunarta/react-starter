import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { CalendarRange } from 'lucide-react';
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';
import { ClearButton } from '@/components/ui/clear-button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { controlClass } from '@/components/ui/input';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

/** ISO dates (YYYY-MM-DD), empty when not set. */
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
    /** For controls without a visible label. */
    'aria-label'?: string;
};

/** One calendar for a date range. Click the start day, then the end day. */
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
    // Day under the pointer, used to shade a preview of the range.
    const [hover, setHover] = useState<Date | undefined>(undefined);
    const from = value.from ? parseISO(value.from) : undefined;
    const to = value.to ? parseISO(value.to) : undefined;
    const label = from ? (to ? `${formatDate(from)} – ${formatDate(to)}` : `${formatDate(from)} – …`) : undefined;

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                setHover(undefined);
            }}
        >
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
                {clearable && label && <ClearButton label="Hapus rentang tanggal" onClick={() => onChange({ from: '', to: '' })} />}
            </div>
            <PopoverContent aria-label={ariaLabel ?? placeholder} className="w-fit p-1.5">
                <DayPicker
                    mode="range"
                    onDayMouseEnter={(day) => setHover(day)}
                    onDayMouseLeave={() => setHover(undefined)}
                    modifiers={from && !to && hover && hover > from ? { preview: { after: from, before: hover }, previewEnd: hover } : undefined}
                    modifiersClassNames={{ preview: 'rdp-preview', previewEnd: 'rdp-preview-end' }}
                    locale={idLocale}
                    captionLayout="dropdown"
                    startMonth={min}
                    endMonth={max}
                    defaultMonth={from ?? max}
                    selected={from ? ({ from, to } satisfies DateRange) : undefined}
                    disabled={{ before: min, after: max }}
                    onSelect={(_range, day) => {
                        const iso = format(day, 'yyyy-MM-dd');

                        // A first click, a click after a finished range, or a click before the start begins a new range.
                        // The same day twice is a one-day range.
                        if (!from || to || day < from) {
                            onChange({ from: iso, to: '' });

                            return;
                        }

                        onChange({ from: value.from, to: iso });
                        setHover(undefined);
                        setOpen(false);
                    }}
                    className="compact-calendar"
                />
            </PopoverContent>
        </Popover>
    );
}
