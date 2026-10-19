import type { ReactNode } from 'react';
import { BrandMark } from '@/components/brand-mark';
import { Illustration } from '@/components/illustrations';
import type { IllustrationName } from '@/components/illustrations';
import { NetworkStatus } from '@/components/network-status';
import { useTitle } from '@/lib/title';

/**
 * The frame of the screens a person sees before the app shell (sign-in, second factor, expired password), built phone first:
 * on a phone a tinted header with the brand and an illustration, and the form on a rounded "sheet" that rises over it; from `lg` two
 * columns, the illustration on the left and the form centred on the right. The heading and the words are the screen's own.
 */
export function AuthLayout({
    title,
    description,
    illustration,
    pageTitle,
    children,
}: {
    title: string;
    description: ReactNode;
    illustration: IllustrationName;
    /** The browser tab title when it differs from the heading. */
    pageTitle?: string;
    children: ReactNode;
}) {
    useTitle(pageTitle ?? title);

    return (
        <div className="flex min-h-dvh flex-col bg-primary-soft lg:grid lg:grid-cols-2">
            <NetworkStatus />
            <aside className="flex flex-col items-center pb-10 lg:justify-between lg:px-12 lg:py-10">
                <header className="flex h-14 w-full items-center justify-center bg-canvas shadow-sm lg:h-auto lg:justify-start lg:bg-transparent lg:shadow-none">
                    <BrandMark />
                </header>
                <Illustration name={illustration} className="mt-6 w-48 sm:w-60 lg:mt-0 lg:w-full lg:max-w-md" />
                <p className="hidden max-w-sm text-center text-sm text-muted lg:block">Dasbor admin internal. Semua aktivitas tercatat di audit log.</p>
            </aside>
            <main className="relative -mt-5 flex flex-1 flex-col items-center rounded-t-3xl bg-canvas px-4 pt-7 pb-8 lg:mt-0 lg:justify-center lg:rounded-none lg:px-12">
                <div className="w-full max-w-sm">
                    <h1 className="text-lg font-semibold">{title}</h1>
                    <p className="mt-1 mb-5 text-sm text-muted">{description}</p>
                    {children}
                </div>
            </main>
        </div>
    );
}
