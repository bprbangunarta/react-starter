import { X } from 'lucide-react';

/** The small X inside a picker trigger that empties it. The trigger needs right padding (pr-12) while it shows. */
export function ClearButton({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            aria-label={label}
            className="absolute top-1/2 right-7 -translate-y-1/2 rounded p-0.5 text-muted hover:text-ink"
            onClick={onClick}
        >
            <X className="size-3" />
        </button>
    );
}
