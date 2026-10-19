import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MaintenanceGate } from '@/components/maintenance-gate';
import { MAINTENANCE_EVENT } from '@/lib/http';

describe('MaintenanceGate', () => {
    it('shows the app until the server says it is in maintenance', () => {
        render(
            <MaintenanceGate>
                <p>aplikasi</p>
            </MaintenanceGate>,
        );

        expect(screen.getByText('aplikasi')).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Sedang dalam pemeliharaan' })).not.toBeInTheDocument();
    });

    it('replaces the app with the full-screen maintenance page on the maintenance event', () => {
        render(
            <MaintenanceGate>
                <p>aplikasi</p>
            </MaintenanceGate>,
        );

        act(() => void window.dispatchEvent(new Event(MAINTENANCE_EVENT)));

        expect(screen.getByRole('heading', { name: 'Sedang dalam pemeliharaan' })).toBeInTheDocument();
        expect(screen.queryByText('aplikasi')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Coba lagi' })).toBeInTheDocument();
    });
});
