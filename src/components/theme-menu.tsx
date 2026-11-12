import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownContent, DropdownItem, DropdownLabel, DropdownMenu, DropdownTrigger } from '@/components/ui/dropdown';
import { Tip } from '@/components/ui/tooltip';
import { setTheme, useTheme } from '@/lib/theme';
import type { ThemeChoice } from '@/lib/theme';

const OPTIONS: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Terang', icon: Sun },
    { value: 'dark', label: 'Gelap', icon: Moon },
    { value: 'system', label: 'Ikuti sistem', icon: Monitor },
];

/** Header button to pick light, dark or the system theme. */
export function ThemeMenu() {
    const { choice, resolved } = useTheme();

    return (
        <DropdownMenu>
            <Tip label="Tema">
                <DropdownTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Tema">
                        {resolved === 'dark' ? <Moon /> : <Sun />}
                    </Button>
                </DropdownTrigger>
            </Tip>
            <DropdownContent>
                <DropdownLabel>Tema</DropdownLabel>
                {OPTIONS.map(({ value, label, icon: Icon }) => (
                    <DropdownItem key={value} icon={<Icon />} onSelect={() => setTheme(value)} aria-current={choice === value}>
                        {label}
                        {choice === value && <Check className="ml-auto text-primary" />}
                    </DropdownItem>
                ))}
            </DropdownContent>
        </DropdownMenu>
    );
}
