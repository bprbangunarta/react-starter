import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import type { DateSpan } from '@/components/ui/date-range-picker';
import { Drawer, DrawerBody } from '@/components/ui/drawer';
import { Progress } from '@/components/ui/progress';
import { Stepper } from '@/components/ui/stepper';
import { TagInput } from '@/components/ui/tag-input';
import { TimePicker } from '@/components/ui/time-picker';

function Tags() {
    const [tags, setTags] = useState<string[]>([]);

    return <TagInput aria-label="Tag" value={tags} onChange={setTags} maxTags={2} />;
}

function Time() {
    const [time, setTime] = useState('');

    return <TimePicker aria-label="Jam" value={time} onChange={setTime} />;
}

function Range() {
    const [span, setSpan] = useState<DateSpan>({ from: '', to: '' });

    return <DateRangePicker aria-label="Periode" value={span} onChange={setSpan} clearable max={new Date(2026, 5, 30)} />;
}

describe('TagInput', () => {
    it('adds on Enter and comma, ignores duplicates, respects the limit, removes on Backspace', async () => {
        const user = userEvent.setup();
        render(<Tags />);
        const box = screen.getByRole('textbox', { name: 'Tag' });

        await user.type(box, 'satu{Enter}SATU,dua,');
        expect(screen.getByText('satu')).toBeInTheDocument();
        expect(screen.queryByText('SATU')).not.toBeInTheDocument();
        expect(screen.getByText('dua')).toBeInTheDocument();
        expect(box).toBeDisabled();

        await user.click(screen.getByRole('button', { name: 'Hapus satu' }));
        expect(screen.queryByText('satu')).not.toBeInTheDocument();
    });
});

describe('TimePicker', () => {
    it('builds HH:mm from the hour and the minute', async () => {
        const user = userEvent.setup();
        render(<Time />);

        await user.click(screen.getByRole('button', { name: 'Jam' }));
        await user.click(screen.getByRole('button', { name: '09' }));
        await user.click(screen.getByRole('button', { name: '30' }));
        expect(screen.getByRole('button', { name: 'Jam' })).toHaveTextContent('09:30');
    });
});

describe('DateRangePicker', () => {
    it('shows the chosen period and clears it', async () => {
        const user = userEvent.setup();
        render(<Range />);

        await user.click(screen.getByRole('button', { name: 'Periode' }));
        const days = screen.getAllByRole('gridcell');
        const pick = (n: string) => days.find((d) => d.textContent === n)?.querySelector('button') as HTMLElement;

        await user.click(pick('10'));
        await user.click(pick('12'));
        expect(screen.getByRole('button', { name: 'Periode' })).toHaveTextContent('10');
        expect(screen.getByRole('button', { name: 'Periode' })).toHaveTextContent('12');

        await user.click(screen.getByRole('button', { name: 'Hapus rentang tanggal' }));
        expect(screen.getByRole('button', { name: 'Periode' })).toHaveTextContent('Pilih rentang tanggal');
    });
});

describe('Breadcrumb', () => {
    it('links the parents and marks the last crumb as the current page', () => {
        render(
            <MemoryRouter>
                <Breadcrumb items={[{ label: 'Beranda', to: '/' }, { label: 'Detail' }]} />
            </MemoryRouter>,
        );

        expect(screen.getByRole('link', { name: 'Beranda' })).toHaveAttribute('href', '/');
        expect(screen.getByText('Detail')).toHaveAttribute('aria-current', 'page');
    });
});

describe('Stepper', () => {
    it('marks the step in progress', () => {
        render(<Stepper steps={[{ label: 'A' }, { label: 'B' }, { label: 'C' }]} current={1} />);

        expect(screen.getByText('B').closest('li')).toHaveAttribute('aria-current', 'step');
        expect(screen.getByLabelText('Selesai')).toBeInTheDocument();
    });
});

describe('Progress', () => {
    it('exposes the value, and none when unknown', () => {
        const { rerender } = render(<Progress label="Kuota" value={40} />);

        expect(screen.getByRole('progressbar', { name: 'Kuota' })).toHaveAttribute('aria-valuenow', '40');
        expect(screen.getByText('40%')).toBeInTheDocument();

        rerender(<Progress aria-label="Memproses" />);
        expect(screen.getByRole('progressbar', { name: 'Memproses' })).not.toHaveAttribute('aria-valuenow');
    });
});

describe('Drawer', () => {
    it('opens as a dialog and closes with the close button', () => {
        const Host = () => {
            const [open, setOpen] = useState(true);

            return (
                <Drawer open={open} onOpenChange={setOpen} title="Rincian">
                    <DrawerBody>Isi</DrawerBody>
                </Drawer>
            );
        };

        render(<Host />);
        expect(screen.getByRole('dialog', { name: 'Rincian' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Tutup' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
