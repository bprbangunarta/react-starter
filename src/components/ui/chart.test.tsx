import { render, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { BarChart, ColumnChart, DonutChart, share } from '@/components/ui/chart';
import { TooltipProvider } from '@/components/ui/tooltip';

const draw = (ui: ReactElement) => render(<TooltipProvider>{ui}</TooltipProvider>);
const texts = (list: HTMLElement) =>
    within(list)
        .getAllByRole('listitem')
        .map((item) => item.textContent);

describe('share', () => {
    it('rounds the percentage in one place and does not divide by zero', () => {
        expect(share(1, 3)).toBe(33);
        expect(share(2, 3)).toBe(67);
        expect(share(0, 0)).toBe(0);
    });
});

describe('BarChart', () => {
    it('writes the count and percentage of every part, not only the bar', () => {
        draw(
            <BarChart
                label="Kantor"
                items={[
                    { label: 'Pusat', count: 6 },
                    { label: 'Cabang', count: 2 },
                ]}
            />,
        );

        expect(texts(screen.getByRole('list', { name: 'Kantor' }))).toEqual(['Pusat6 (75%)', 'Cabang2 (25%)']);
    });

    it('writes a sentence when there is no data', () => {
        draw(<BarChart label="Kantor" items={[{ label: 'Pusat', count: 0 }]} />);

        expect(screen.getByText('Belum ada data.')).toBeInTheDocument();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
});

describe('ColumnChart', () => {
    it('writes the count above and the label below every column, in the order given', () => {
        draw(
            <ColumnChart
                label="Usia"
                items={[
                    { label: 'Di bawah 25 tahun', count: 4 },
                    { label: '25 sampai 34 tahun', count: 0 },
                ]}
            />,
        );

        expect(texts(screen.getByRole('list', { name: 'Usia' }))).toEqual(['4Di bawah 25 tahun', '025 sampai 34 tahun']);
    });

    it('makes the tallest column fill the area and a zero column have no height', () => {
        const { container } = draw(
            <ColumnChart
                label="Usia"
                items={[
                    { label: 'A', count: 10 },
                    { label: 'B', count: 5 },
                    { label: 'C', count: 0 },
                ]}
            />,
        );
        const heights = [...container.querySelectorAll<HTMLElement>('.bg-chart-1')].map((bar) => bar.style.height);

        expect(heights).toEqual(['6rem', '3rem', '0rem']);
    });
});

describe('DonutChart', () => {
    it('writes a legend with counts and percentages, and the total in the middle of the ring', () => {
        draw(
            <DonutChart
                label="Status"
                centerLabel="karyawan"
                items={[
                    { label: 'Tetap', count: 3 },
                    { label: 'Trainee', count: 1 },
                ]}
            />,
        );

        expect(texts(screen.getByRole('list', { name: 'Status' }))).toEqual(['Tetap3 (75%)', 'Trainee1 (25%)']);
        expect(screen.getByText('karyawan').previousElementSibling).toHaveTextContent('4');
    });

    it('merges the parts after the fourth into "Lainnya", so the ring never has more than five slices', () => {
        const items = ['A', 'B', 'C', 'D', 'E', 'F'].map((label, index) => ({ label, count: 6 - index }));
        draw(<DonutChart label="Banyak" centerLabel="orang" items={items} />);

        expect(texts(screen.getByRole('list', { name: 'Banyak' }))).toEqual(['A6 (29%)', 'B5 (24%)', 'C4 (19%)', 'D3 (14%)', 'Lainnya3 (14%)']);
    });

    it('leaves out empty parts, and writes a sentence when everything is empty', () => {
        const { unmount } = draw(
            <DonutChart
                label="Jenis"
                centerLabel="orang"
                items={[
                    { label: 'Laki-laki', count: 2 },
                    { label: 'Perempuan', count: 0 },
                ]}
            />,
        );
        expect(texts(screen.getByRole('list', { name: 'Jenis' }))).toEqual(['Laki-laki2 (100%)']);
        unmount();

        draw(<DonutChart label="Jenis" centerLabel="orang" items={[]} />);
        expect(screen.getByText('Belum ada data.')).toBeInTheDocument();
    });
});
