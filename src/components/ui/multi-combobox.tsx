import { ChevronsUpDown } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { ClearButton } from '@/components/ui/clear-button';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { OptionPanel, useOptionNav } from '@/components/ui/option-panel';
import type { Option } from '@/components/ui/option-panel';
import { controlClass } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = {
    options: Option[];
    value: (string | number)[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    /** For controls without a visible label. */
    'aria-label'?: string;
    searchable?: boolean;
    clearable?: boolean;
    invalid?: boolean;
    id?: string;
    className?: string;
};

/** Combobox that picks several options. The list stays open while choosing. */
export function MultiCombobox({
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

    const chosen = useMemo(() => new Set(value.map(String)), [value]);
    const selected = options.filter((o) => chosen.has(String(o.value)));
    const summary = selected.length > 2 ? `${selected.length} dipilih` : selected.map((o) => o.label).join(', ');

    const toggle = (option: Option) => {
        const key = String(option.value);

        // The result follows the order of options, not the order of clicks.
        onChange(options.filter((o) => (String(o.value) === key ? !chosen.has(key) : chosen.has(String(o.value)))).map((o) => String(o.value)));
    };
    const nav = useOptionNav(options, open, toggle);

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                nav.setQuery('');
                nav.setActive(0);
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
                        aria-label={ariaLabel}
                        aria-invalid={invalid || undefined}
                        title={selected.map((o) => o.label).join(', ') || undefined}
                        className={cn(controlClass, 'flex items-center justify-between gap-1 text-left', clearable && selected.length > 0 && 'pr-12')}
                    >
                        <span className={cn('truncate', selected.length === 0 && 'text-muted/70')}>{summary || placeholder}</span>
                        <ChevronsUpDown className="size-3.5 shrink-0 text-muted" />
                    </button>
                </PopoverTrigger>
                {clearable && selected.length > 0 && <ClearButton label="Hapus semua pilihan" onClick={() => onChange([])} />}
            </div>
            <OptionPanel
                nav={nav}
                listId={listId}
                label={ariaLabel ?? placeholder}
                searchable={searchable}
                isSelected={(o) => chosen.has(String(o.value))}
                onPick={toggle}
                multiple
            />
        </Popover>
    );
}
