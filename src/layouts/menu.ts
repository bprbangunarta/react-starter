import { LayoutDashboard, Palette, ScrollText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type MenuLinkItem = {
    label: string;
    to: string;
    /** Submenu entries have no icon: they get a plain dot. */
    icon?: LucideIcon;
    end?: boolean;
};

/** A menu entry is a link, or a parent with submenu links (opened and closed by a button). */
export type MenuItem = MenuLinkItem | { label: string; icon: LucideIcon; children: MenuLinkItem[] };

/**
 * The sidebar. Add an entry here for every page the product gets, and follow these rules (`layouts/menu-names.test.ts` and
 * `npm run standards` hold them):
 * - One feature has one name from the label to the code: the address is the English form of the label (`/audit-logs` for "Audit Logs"),
 *   and the page file `pages/audit-logs.tsx`, its route in `App.tsx`, and its test use the same word.
 * - A label is one word, two at most, and at most 15 characters, with no slashes; the longer name belongs in the page title.
 * - The order follows the order work is done in: what other data depends on comes first. Related pages under one parent become a submenu
 *   (`{ label, icon, children: [...] }`): closed until opened, and open by itself while one of its pages is shown.
 */
export const MENU: { label?: string; items: MenuItem[] }[] = [
    { items: [{ label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true }] },
    {
        label: 'Sistem',
        items: [
            { label: 'Audit Logs', to: '/audit-logs', icon: ScrollText },
            { label: 'UI Guideline', to: '/ui-guideline', icon: Palette },
        ],
    },
];

/** Every page link of the menu, parents flattened. */
export function menuLinks(items: MenuItem[]): MenuLinkItem[] {
    return items.flatMap((item) => ('children' in item ? item.children : [item]));
}
