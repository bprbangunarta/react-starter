import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Illustration } from '../src/components/illustrations';
import { ERROR_PAGES } from '../src/lib/error-pages';

/**
 * Static error pages (error-pages/*.html): self-contained HTML for a web server to serve when the app itself cannot (maintenance, 5xx, 401/403/404/419/429).
 * Words and pictures come from the app (src/lib/error-pages.ts, src/components/illustrations.tsx) and colours from src/index.css, so a rebrand recolours them.
 * No script, no asset, no javascript: link (a strict CSP blocks it): "Coba lagi" links to the same address.
 */
const escapeHtml = (text: string): string =>
    text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);

export type Source = { brand: string; theme: string; appName?: string };

export function buildErrorPages({ brand, theme, appName }: Source): { file: string; html: string }[] {
    const rawApp = appName ?? /APP_NAME = '(.*)'/.exec(brand)?.[1] ?? 'Starter Kit';
    const app = escapeHtml(rawApp);
    const initial = escapeHtml(/APP_INITIAL = '(.*)'/.exec(brand)?.[1] ?? rawApp.charAt(0).toUpperCase());
    // Every colour token of the theme becomes a variable of the page, under the same name the illustrations use.
    const tokens = [...theme.matchAll(/--color-([a-z0-9-]+): ([^;]+);/g)].map((match) => `--color-${match[1]}:${match[2]}`).join(';');

    // The illustrations' own motion (between markers in index.css), squeezed onto fewer lines.
    const motion = (/\/\* illustrations:start \*\/([\s\S]*?)\/\* illustrations:end \*\//.exec(theme)?.[1] ?? '').replace(/\s+/g, ' ').trim();

    // Dark tokens (between markers in index.css): the static pages follow the system theme, there is no script to read a saved choice.
    const dark = [...(/\/\* dark:start \*\/([\s\S]*?)\/\* dark:end \*\//.exec(theme)?.[1]?.matchAll(/--color-([a-z0-9-]+): ([^;]+);/g) ?? [])]
        .map((match) => `--color-${match[1]}:${match[2]}`)
        .join(';');

    const css = `
:root{${tokens}}
@media(prefers-color-scheme:dark){:root{color-scheme:dark;${dark}}}
*{box-sizing:border-box}
html{font-size:15px}
body{margin:0;background:var(--color-canvas);color:var(--color-ink);font-family:'Instrument Sans Variable','Instrument Sans',ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.page{min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;padding:1.5rem 1rem 2rem}
.brand{display:flex;align-items:center;justify-content:center;gap:.5rem}
.mark{display:flex;width:2rem;height:2rem;align-items:center;justify-content:center;border-radius:.5rem;background:var(--color-primary);color:var(--color-on-primary);font-size:.8125rem;font-weight:700}
.name{font-size:1rem;font-weight:600}
main{flex:1;width:100%;max-width:28rem;margin:0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.5rem 0;text-align:center}
svg{width:20rem;max-width:100%;height:auto}
@media(min-width:640px){svg{width:24rem}}
.badge{margin:.5rem 0 0;padding:.125rem .625rem;border-radius:999px;background:var(--color-primary-soft);color:var(--color-primary);font-size:.6875rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase}
h1{margin:.75rem 0 0;font-size:1.375rem;font-weight:600}
@media(min-width:640px){h1{font-size:1.625rem}}
p.d{margin:.5rem 0 0;max-width:24rem;font-size:.8125rem;line-height:1.6;color:var(--color-muted)}
a.b{display:inline-flex;height:2rem;align-items:center;justify-content:center;margin-top:1.5rem;padding:0 1rem;border-radius:.375rem;background:var(--color-primary);color:var(--color-on-primary);font-size:.8125rem;font-weight:500;text-decoration:none}
a.b:hover{background:var(--color-primary-hover)}
@media(max-width:639px){a.b{width:100%}}
${motion}
`;

    return ERROR_PAGES.map((spec) => {
        const href = spec.action === 'login' ? '/login' : spec.action === 'home' ? '/' : '';
        const label = spec.action === 'login' ? 'Masuk' : spec.action === 'home' ? 'Ke beranda' : 'Coba lagi';

        return {
            file: `${spec.status}.html`,
            html: `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${spec.title} - ${app}</title>
<style>${css}</style>
</head>
<body>
<div class="page">
<div class="brand"><span class="mark">${initial}</span><span class="name">${app}</span></div>
<main>
${renderToStaticMarkup(createElement(Illustration, { name: spec.illustration }))}
<p class="badge">Kode ${spec.status}</p>
<h1>${spec.title}</h1>
<p class="d">${spec.description}</p>
<a class="b" href="${href}">${label}</a>
</main>
</div>
</body>
</html>
`,
        };
    });
}
