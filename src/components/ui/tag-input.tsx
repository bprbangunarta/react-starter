import { X } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    maxTags?: number;
    invalid?: boolean;
    id?: string;
    'aria-describedby'?: string;
    /** For controls without a visible label. */
    'aria-label'?: string;
    className?: string;
};

/** Free list of short values. Enter or comma adds, Backspace on an empty input removes the last one. */
export function TagInput({
    value,
    onChange,
    placeholder = 'Ketik lalu Enter',
    maxTags,
    invalid,
    id,
    'aria-describedby': describedBy,
    'aria-label': ariaLabel,
    className,
}: Props) {
    const [draft, setDraft] = useState('');
    const input = useRef<HTMLInputElement>(null);
    const full = maxTags !== undefined && value.length >= maxTags;

    const add = (text: string) => {
        const tag = text.trim();

        if (tag && !full && !value.some((v) => v.toLowerCase() === tag.toLowerCase())) {
            onChange([...value, tag]);
        }

        setDraft('');
    };

    return (
        // The wrapper only forwards clicks; the input is the real control.
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
            data-invalid={invalid || undefined}
            onClick={() => input.current?.focus()}
            className={cn(
                'flex min-h-8 w-full cursor-text flex-wrap items-center gap-1 rounded-md border border-line bg-surface px-1.5 py-1 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 data-[invalid]:border-danger data-[invalid]:ring-danger/20',
                className,
            )}
        >
            {value.map((tag) => (
                <span key={tag} className="inline-flex max-w-full items-center gap-1 rounded bg-canvas py-0.5 pr-0.5 pl-1.5 text-xs text-ink">
                    <span className="truncate">{tag}</span>
                    <button
                        type="button"
                        aria-label={`Hapus ${tag}`}
                        className="rounded p-0.5 text-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange(value.filter((v) => v !== tag));
                        }}
                    >
                        <X className="size-3" />
                    </button>
                </span>
            ))}
            <input
                ref={input}
                id={id}
                value={draft}
                disabled={full}
                aria-label={ariaLabel}
                aria-describedby={describedBy}
                aria-invalid={invalid || undefined}
                placeholder={value.length === 0 ? placeholder : undefined}
                onChange={(e) => {
                    const text = e.target.value;

                    if (text.endsWith(',')) {
                        add(text.slice(0, -1));
                    } else {
                        setDraft(text);
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        // Enter adds a tag instead of submitting the form.
                        e.preventDefault();
                        add(draft);
                    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
                        onChange(value.slice(0, -1));
                    }
                }}
                onBlur={() => add(draft)}
                className="h-6 min-w-24 flex-1 bg-transparent px-1 text-sm text-ink placeholder:text-muted/70 focus:outline-none disabled:cursor-not-allowed"
            />
        </div>
    );
}
