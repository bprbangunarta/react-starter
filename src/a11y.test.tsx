import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import App from '@/App';
import { TooltipProvider } from '@/components/ui/tooltip';
import FileManage from '@/pages/file-manage';
import UiGuideline from '@/pages/ui-guideline';

// jsdom has no layout or colour, so these checks cover structure and names (labels, roles, ids); contrast is held by index.contrast.test.ts.
const scan = async (container: HTMLElement) => {
    // axe cannot look inside iframes in jsdom (the UI Guideline previews the static error pages in some).
    container.querySelectorAll('iframe').forEach((frame) => frame.remove());
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });

    return results.violations.map((v) => {
        const found = v.nodes.map((n) => container.querySelector(String(n.target[0]))?.outerHTML.slice(0, 600) ?? n.target.join(' '));

        return `${v.id}: ${found.join(' | ')}`;
    });
};

const inShell = (page: React.ReactNode) => (
    <MemoryRouter>
        <TooltipProvider>{page}</TooltipProvider>
    </MemoryRouter>
);

describe('accessibility', () => {
    beforeAll(() => {
        // Radix measures some controls; jsdom has no ResizeObserver.
        window.ResizeObserver = class {
            observe() {}
            unobserve() {}
            disconnect() {}
        };
    });

    afterEach(() => {
        window.history.pushState({}, '', '/');
    });

    it('sign-in page has no violations', async () => {
        window.history.pushState({}, '', '/login');
        const { container } = render(<App />);

        await screen.findByRole('button', { name: 'Masuk' });
        expect(await scan(container)).toEqual([]);
    });

    it('404 page has no violations', async () => {
        window.history.pushState({}, '', '/tidak-ada');
        const { container } = render(<App />);

        await screen.findByRole('heading', { name: 'Halaman tidak ditemukan' });
        expect(await scan(container)).toEqual([]);
    });

    it('File Manage has no violations', async () => {
        const { container } = render(inShell(<FileManage />));

        expect(await scan(container)).toEqual([]);
    });

    it('UI Guideline has no violations', async () => {
        const { container } = render(inShell(<UiGuideline />));

        expect(await scan(container)).toEqual([]);
    }, 30_000);
});
