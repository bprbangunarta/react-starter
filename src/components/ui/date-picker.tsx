import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { controlClass } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = {
    value: string;
    onChange: (value: string) => void;
    min?: Date;
    max?: Date;
    defaultMonth?: Date;
    invalid?: boolean;
    id?: string;
    placeholder?: string;
};

/**
 * The month the calendar opens on when nothing is chosen: the current month, or the nearest month of the allowed range
 * when today falls outside it. (Opening on the range's last month made a wide range open far in the future.)
 */
function openingMonth(min: Date, max: Date): Date {
    const today = new Date();

    return today < min ? min : today > max ? max : today;
}

/** Value is an ISO `YYYY-MM-DD` string, matching what the backend stores. */
export function DatePicker({
    value,
    onChange,
    min = new Date(1940, 0, 1),
    max = new Date(),
    defaultMonth,
    invalid,
    id,
    placeholder = 'Pilih tanggal',
}: Props) {
    const [open, setOpen] = useState(false);
    const selected = value ? parseISO(value) : undefined;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    id={id}
                    type="button"
                    aria-invalid={invalid || undefined}
                    className={cn(controlClass, 'flex items-center justify-between text-left')}
                >
                    <span className={cn(!selected && 'text-muted/70')}>
                        {selected ? format(selected, 'dd MMM yyyy', { locale: idLocale }) : placeholder}
                    </span>
                    <CalendarDays className="size-3.5 text-muted" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-1.5">
                <DayPicker
                    mode="single"
                    locale={idLocale}
                    captionLayout="dropdown"
                    startMonth={min}
                    endMonth={max}
                    defaultMonth={selected ?? defaultMonth ?? openingMonth(min, max)}
                    selected={selected}
                    disabled={{ before: min, after: max }}
                    onSelect={(date) => {
                        if (date) {
                            onChange(format(date, 'yyyy-MM-dd'));
                            setOpen(false);
                        }
                    }}
                    className="compact-calendar"
                />
            </PopoverContent>
        </Popover>
    );
}
