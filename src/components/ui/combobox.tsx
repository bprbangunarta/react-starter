import { ChevronsUpDown } from 'lucide-react';
import { useId, useState } from 'react';
import { ClearButton } from '@/components/ui/clear-button';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { controlClass } from '@/components/ui/input';
import { OptionPanel, useOptionNav } from '@/components/ui/option-panel';
import type { Option } from '@/components/ui/option-panel';

type Props = {
    options: Option[];
    value: string | number | null | undefined;
    onChange: (value: string | null) => void;
    placeholder?: string;
    /** For controls without a visible label. */
    'aria-label'?: string;
    searchable?: boolean;
    clearable?: boolean;
    invalid?: boolean;
    id?: string;
    className?: string;
};

/** Select with an optional search box. */
export function Combobox({
    options,
    value,
    onChange,
    placeholder = 'Pilih…',
    'aria-label': ariaLabel,
    searchable = true,
    clearable = false,
    invalid,
    id,
    className,
}: Props) {
    const [open, setOpen] = useState(false);
    const listId = useId();
    const selected = options.find((o) => String(o.value) === String(value ?? ''));

    const choose = (option: Option) => {
        onChange(String(option.value));
        setOpen(false);
    };
    const nav = useOptionNav(options, open, choose);

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                nav.setQuery('');
                nav.setActive(
                    Math.max(
                        0,
                        options.findIndex((o) => String(o.value) === String(value ?? '')),
                    ),
                );
            }}
        >
            <div className={cn('relative', className)}>
                <PopoverTrigger asChild>
                    <button
                        id={id}
                        type="button"
                        role="combobox"
                        aria-expanded={open}
                        aria-controls={listId}
                        // a combobox takes its name from a label or aria-label, not from its text; fall back to the placeholder
                        aria-label={ariaLabel ?? (id ? undefined : placeholder)}
                        aria-invalid={invalid || undefined}
                        title={selected?.label}
                        className={cn(controlClass, 'flex items-center justify-between gap-1 text-left', clearable && selected && 'pr-12')}
                    >
                        <span className={cn('truncate', !selected && 'text-muted/70')}>{selected?.label ?? placeholder}</span>
                        <ChevronsUpDown className="size-3.5 shrink-0 text-muted" />
                    </button>
                </PopoverTrigger>
                {clearable && selected && <ClearButton label="Hapus pilihan" onClick={() => onChange(null)} />}
            </div>
            <OptionPanel
                nav={nav}
                listId={listId}
                label={ariaLabel ?? placeholder}
                searchable={searchable}
                isSelected={(o) => String(o.value) === String(value ?? '')}
                onPick={choose}
            />
        </Popover>
    );
}
