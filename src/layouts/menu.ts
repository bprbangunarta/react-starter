import { FolderOpen, LayoutDashboard, Palette, ScrollText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type MenuLinkItem = {
    label: string;
    to: string;
    /** Submenu entries have no icon; they get a dot. */
    icon?: LucideIcon;
    end?: boolean;
};

/** A link, or a parent with submenu links. */
export type MenuItem = MenuLinkItem | { label: string; icon: LucideIcon; children: MenuLinkItem[] };

/**
 * The sidebar. Add an entry for every page. layouts/menu-names.test.ts and npm run standards check these rules:
 * - One name per feature: the address is the English form of the label (/audit-logs for "Audit Logs"), and the page file,
 *   route in App.tsx and test use the same word.
 * - Labels are one or two words, 15 characters at most, no slashes. The longer name goes in the page title.
 * - Order follows the order work is done in: what other data depends on comes first. Related pages share a parent
 *   ({ label, icon, children }), closed until opened and open while one of its pages is shown.
 */
export const MENU: { label?: string; items: MenuItem[] }[] = [
    { items: [{ label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true }] },
    {
        label: 'Sistem',
        items: [
            { label: 'Audit Logs', to: '/audit-logs', icon: ScrollText },
            { label: 'UI Guideline', to: '/ui-guideline', icon: Palette },
            { label: 'File Manage', to: '/file-manage', icon: FolderOpen },
        ],
    },
];
