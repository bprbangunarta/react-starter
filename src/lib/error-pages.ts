import type { IllustrationName } from '@/components/illustrations';

/** What a person can do next on an error screen: go to the start page, sign in, or try again (reload). */
export type ErrorAction = 'home' | 'login' | 'retry';

export type ErrorPageSpec = {
    status: number;
    /** The headline: says what happened in words (never the bare number, "Service Unavailable", or a code). */
    title: string;
    description: string;
    illustration: IllustrationName;
    action: ErrorAction;
};

/**
 * The one place for the words and pictures of the error screens. The app (`ErrorPage`) and the static pages in `error-pages/`
 * (`npm run error-pages`) both read this list, so they always say the same thing. A status with its own wording is added here.
 */
export const ERROR_PAGES: readonly ErrorPageSpec[] = [
    {
        status: 401,
        title: 'Perlu masuk',
        description: 'Sesi Anda belum atau sudah tidak aktif. Silakan masuk untuk melanjutkan.',
        illustration: 'unauthorized',
        action: 'login',
    },
    {
        status: 403,
        title: 'Akses ditolak',
        description: 'Anda tidak diizinkan membuka halaman ini. Bila ini keliru, minta administrator memberikan aksesnya.',
        illustration: 'forbidden',
        action: 'home',
    },
    {
        status: 404,
        title: 'Halaman tidak ditemukan',
        description: 'Halaman yang Anda cari tidak ada atau sudah dipindahkan.',
        illustration: 'not-found',
        action: 'home',
    },
    {
        status: 419,
        title: 'Halaman kedaluwarsa',
        description: 'Sesi Anda berakhir karena terlalu lama tidak aktif. Muat ulang halaman lalu coba lagi.',
        illustration: 'expired',
        action: 'retry',
    },
    {
        status: 429,
        title: 'Terlalu banyak permintaan',
        description: 'Anda mengirim permintaan terlalu cepat. Tunggu sebentar lalu coba lagi.',
        illustration: 'too-many',
        action: 'retry',
    },
    {
        status: 500,
        title: 'Terjadi kesalahan',
        description: 'Terjadi kesalahan tak terduga di sisi kami. Coba lagi sebentar lagi; bila terus berulang, hubungi administrator.',
        illustration: 'error',
        action: 'retry',
    },
    {
        status: 503,
        title: 'Sedang dalam pemeliharaan',
        description: 'Sistem sedang diperbarui dan akan segera kembali. Data Anda aman. Coba lagi dalam beberapa menit.',
        illustration: 'maintenance',
        action: 'retry',
    },
];

export function errorPage(status: number): ErrorPageSpec {
    const spec = ERROR_PAGES.find((page) => page.status === status) ?? ERROR_PAGES.find((page) => page.status === 500);

    if (!spec) {
        throw new Error('ERROR_PAGES must contain a 500 entry.');
    }

    return spec;
}
