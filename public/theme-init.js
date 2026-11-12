// Applies the saved theme before the page paints, so a dark choice never flashes white. Loaded from index.html as a classic script
// (a strict CSP allows 'self' scripts only). The key matches THEME_KEY in src/lib/theme.ts.
try {
    var saved = localStorage.getItem('theme');

    if (saved === 'light' || saved === 'dark') {
        document.documentElement.setAttribute('data-theme', saved);
    }
} catch (error) {
    // Storage blocked: the system setting decides.
}
