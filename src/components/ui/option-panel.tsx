import { Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type Option = {
    value: string | number;
    label: string;
    /** Second line under the label. Searchable too. */
    description?: string;
};

/** Search text, highlighted row and keyboard handling shared by Combobox and MultiCombobox. */
export function useOptionNav(options: Option[], open: boolean, onPick: (option: Option) => void) {
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const list = useRef<HTMLUListElement>(null);
    const filtered = useMemo(
        () => options.filter((o) => `${o.label} ${o.description ?? ''}`.toLowerCase().includes(query.trim().toLowerCase())),
        [options, query],
    );

    // Keep the highlighted option in view.
    useEffect(() => {
        if (open) {
            (list.current?.children[active] as HTMLElement | undefined)?.scrollIntoView({ block: 'nearest' });
        }
    }, [active, open, filtered]);

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && filtered[active]) {
            e.preventDefault();
            onPick(filtered[active]);
        }
    };

    return { query, setQuery, active, setActive, filtered, list, onKeyDown };
}

type PanelProps = {
    nav: ReturnType<typeof useOptionNav>;
    listId: string;
    label: string;
    searchable: boolean;
    isSelected: (option: Option) => boolean;
    onPick: (option: Option) => void;
    /** Several options can be chosen: rows show a checkbox instead of a check mark. */
    multiple?: boolean;
};

/** The popover content of a combobox: optional search box and the list of options. */
export function OptionPanel({ nav, listId, label, searchable, isSelected, onPick, multiple }: PanelProps) {
    const { query, setQuery, active, setActive, filtered, list, onKeyDown } = nav;

    return (
        <PopoverContent
            aria-label={label}
            className="w-max max-w-[min(36rem,calc(100vw-2rem))] min-w-(--radix-popover-trigger-width) p-1"
            // Inside a dialog the scroll lock blocks wheel/touch on portaled content.
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onOpenAutoFocus={(e) => {
                if (!searchable) {
                    return;
                }
                e.preventDefault();
                (e.currentTarget as HTMLElement).querySelector('input')?.focus();
            }}
        >
            {searchable && (
                <input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setActive(0);
                    }}
                    onKeyDown={onKeyDown}
                    placeholder="Cari…"
                    className="mb-1 h-7 w-full rounded border border-line px-2 text-sm focus:border-primary focus:outline-none"
                />
            )}
            <ul
                ref={list}
                id={listId}
                role="listbox"
                aria-multiselectable={multiple || undefined}
                className="max-h-56 overflow-auto overscroll-contain"
                onKeyDown={onKeyDown}
                tabIndex={-1}
            >
                {filtered.length === 0 && <li className="px-2 py-2 text-center text-xs text-muted">Tidak ada hasil</li>}
                {filtered.map((option, index) => {
                    const selected = isSelected(option);

                    return (
                        // Keyboard goes through onKeyDown on the list; this is the pointer path.
                        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                        <li
                            key={option.value}
                            role="option"
                            aria-selected={selected}
                            onMouseEnter={() => setActive(index)}
                            onClick={() => onPick(option)}
                            className={cn(
                                'flex cursor-pointer gap-2 rounded px-2 py-1.5 text-sm',
                                multiple ? 'items-start' : 'items-start justify-between',
                                index === active && 'bg-canvas',
                            )}
                        >
                            {multiple && (
                                <span
                                    className={cn(
                                        'mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded border',
                                        selected ? 'border-primary bg-primary text-white' : 'border-line',
                                    )}
                                >
                                    {selected && <Check className="size-3" />}
                                </span>
                            )}
                            <span className="min-w-0 break-words">
                                {option.label}
                                {option.description && <span className="block text-xs text-muted">{option.description}</span>}
                            </span>
                            {!multiple && selected && <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />}
                        </li>
                    );
                })}
            </ul>
        </PopoverContent>
    );
}
