import type { ReactNode } from 'react';

/**
 * The illustrations of the sign-in and error screens: flat shapes in the theme's own colours, drawn once and used both by the app and by the
 * static error pages (`npm run error-pages` renders these same components). Colours are CSS variables of the tokens in `src/index.css`
 * (`var(--color-primary)`, ...), so a rebrand recolours them. They are decorative: the text beside them says everything, so they are hidden
 * from screen readers. No imports besides React, so a script can render them.
 */
const C = {
    primary: 'var(--color-primary)',
    soft: 'var(--color-primary-soft)',
    line: 'var(--color-line)',
    canvas: 'var(--color-canvas)',
    surface: 'var(--color-surface)',
    ink: 'var(--color-ink)',
    muted: 'var(--color-muted)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    warningSoft: 'var(--color-warning-soft)',
    danger: 'var(--color-danger)',
    dangerSoft: 'var(--color-danger-soft)',
} as const;

/** The same backdrop for all of them: a soft disc, a ground shadow, and a few quiet marks. */
function Stage({ children, tint = C.soft }: { children: ReactNode; tint?: string }) {
    return (
        <>
            <circle cx="120" cy="92" r="72" fill={tint} />
            <ellipse cx="120" cy="164" rx="64" ry="7" fill={C.line} opacity="0.7" />
            <circle cx="34" cy="52" r="4" fill={C.line} />
            <circle cx="210" cy="36" r="3" fill={C.line} />
            <path d="M206 120h10M211 115v10" stroke={C.line} strokeWidth="3" strokeLinecap="round" />
            <path d="M28 112h8M32 108v8" stroke={C.line} strokeWidth="3" strokeLinecap="round" />
            {children}
        </>
    );
}

const Login = () => (
    <Stage>
        <rect x="30" y="42" width="102" height="70" rx="9" fill={C.surface} stroke={C.line} strokeWidth="3" />
        <circle cx="52" cy="62" r="9" fill={C.soft} />
        <rect x="68" y="56" width="46" height="5" rx="2.5" fill={C.line} />
        <rect x="68" y="66" width="30" height="5" rx="2.5" fill={C.line} />
        <rect x="44" y="86" width="74" height="9" rx="4.5" fill={C.soft} />
        <path d="M152 50l37 12v33c0 23-16 36-37 44-21-8-37-21-37-44V62z" fill={C.primary} />
        <path d="M152 50l-37 12v33c0 23 16 36 37 44z" fill={C.surface} opacity="0.12" />
        <rect x="139" y="92" width="26" height="22" rx="5" fill={C.surface} />
        <path d="M144 92v-6a8 8 0 0 1 16 0v6" fill="none" stroke={C.surface} strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="152" cy="101" r="3.2" fill={C.primary} />
        <rect x="150.8" y="102" width="2.4" height="7" rx="1.2" fill={C.primary} />
    </Stage>
);

const Verify = () => (
    <Stage>
        <rect x="82" y="26" width="76" height="132" rx="13" fill={C.surface} stroke={C.ink} strokeWidth="3" />
        <rect x="108" y="32" width="24" height="4" rx="2" fill={C.line} />
        <rect x="90" y="44" width="60" height="98" rx="7" fill={C.canvas} />
        <rect x="100" y="54" width="40" height="5" rx="2.5" fill={C.line} />
        {[94, 103, 112, 121, 130, 139].map((x, i) => (
            <g key={x}>
                <rect x={x} y="76" width="8" height="12" rx="2.5" fill={C.surface} stroke={C.line} strokeWidth="1.5" />
                {i < 4 && <circle cx={x + 4} cy="82" r="2" fill={C.primary} />}
            </g>
        ))}
        <rect x="98" y="108" width="44" height="13" rx="6.5" fill={C.primary} />
        <circle cx="172" cy="54" r="19" fill={C.success} />
        <path d="M163 54l6 6 12-13" fill="none" stroke={C.surface} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M60 78a22 22 0 0 0 0 28M52 70a32 32 0 0 0 0 44" fill="none" stroke={C.primary} strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
    </Stage>
);

const PasswordExpired = () => (
    <Stage>
        <circle cx="148" cy="82" r="46" fill={C.surface} stroke={C.line} strokeWidth="3" />
        <circle cx="148" cy="82" r="36" fill="none" stroke={C.soft} strokeWidth="8" />
        <path d="M148 52v6M148 106v6M118 82h6M172 82h6" stroke={C.muted} strokeWidth="3" strokeLinecap="round" />
        <path d="M148 82V62" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
        <path d="M148 82l14 9" stroke={C.primary} strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="148" cy="82" r="4.5" fill={C.ink} />
        <circle cx="188" cy="44" r="14" fill={C.warning} />
        <rect x="186" y="36" width="4" height="10" rx="2" fill={C.surface} />
        <circle cx="188" cy="51" r="2.3" fill={C.surface} />
        <g transform="rotate(-18 66 130)">
            <circle cx="66" cy="130" r="17" fill="none" stroke={C.primary} strokeWidth="8" />
            <rect x="80" y="126.5" width="56" height="8" rx="4" fill={C.primary} />
            <rect x="116" y="134" width="8" height="12" rx="2.5" fill={C.primary} />
            <rect x="128" y="134" width="8" height="9" rx="2.5" fill={C.primary} />
        </g>
    </Stage>
);

const NotFound = () => (
    <Stage>
        <rect x="64" y="28" width="92" height="116" rx="9" fill={C.surface} stroke={C.line} strokeWidth="3" />
        <path d="M134 28l22 22h-16a6 6 0 0 1-6-6z" fill={C.soft} />
        <rect x="78" y="62" width="52" height="6" rx="3" fill={C.line} />
        <rect x="78" y="76" width="66" height="6" rx="3" fill={C.line} />
        <rect x="78" y="90" width="42" height="6" rx="3" fill={C.line} />
        <circle cx="152" cy="110" r="27" fill={C.surface} fillOpacity="0.92" stroke={C.primary} strokeWidth="7" />
        <path d="M172 130l22 22" stroke={C.primary} strokeWidth="10" strokeLinecap="round" />
        <path d="M144 102a8.5 8.5 0 1 1 11.5 8c-3.2 1.6-3.5 3.2-3.5 6.5" fill="none" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
        <circle cx="152" cy="124" r="2.8" fill={C.ink} />
    </Stage>
);

const Forbidden = () => (
    <Stage tint={C.dangerSoft}>
        <path d="M96 84V66a24 24 0 0 1 48 0v18" fill="none" stroke={C.ink} strokeWidth="11" strokeLinecap="round" />
        <rect x="80" y="80" width="80" height="64" rx="11" fill={C.primary} />
        <rect x="80" y="80" width="40" height="64" rx="11" fill={C.surface} opacity="0.1" />
        <circle cx="120" cy="106" r="9" fill={C.surface} />
        <rect x="116.5" y="110" width="7" height="18" rx="3.5" fill={C.surface} />
        <circle cx="178" cy="56" r="17" fill={C.danger} />
        <path d="M171 49l14 14M185 49l-14 14" stroke={C.surface} strokeWidth="4.5" strokeLinecap="round" />
    </Stage>
);

const Unauthorized = () => (
    <Stage>
        <rect x="58" y="46" width="124" height="84" rx="11" fill={C.surface} stroke={C.line} strokeWidth="3" />
        <circle cx="94" cy="76" r="13" fill={C.soft} />
        <path d="M72 112a22 22 0 0 1 44 0z" fill={C.soft} />
        <rect x="128" y="66" width="42" height="6" rx="3" fill={C.line} />
        <rect x="128" y="80" width="30" height="6" rx="3" fill={C.line} />
        <rect x="128" y="94" width="38" height="6" rx="3" fill={C.line} />
        <circle cx="176" cy="128" r="20" fill={C.primary} />
        <rect x="167" y="127" width="18" height="14" rx="3.5" fill={C.surface} />
        <path d="M171 127v-4a5 5 0 0 1 10 0v4" fill="none" stroke={C.surface} strokeWidth="3.5" strokeLinecap="round" />
    </Stage>
);

const Expired = () => (
    <Stage tint={C.warningSoft}>
        <rect x="82" y="32" width="76" height="9" rx="4.5" fill={C.primary} />
        <rect x="82" y="139" width="76" height="9" rx="4.5" fill={C.primary} />
        <path
            d="M90 41h60c0 30-22 39-30 49 8 10 30 19 30 49H90c0-30 22-39 30-49-8-10-30-19-30-49z"
            fill={C.surface}
            stroke={C.primary}
            strokeWidth="4"
            strokeLinejoin="round"
        />
        <path d="M99 47h42c-2 14-12 22-21 30-9-8-19-16-21-30z" fill={C.warning} />
        <path d="M98 139c2-13 12-20 22-25 10 5 20 12 22 25z" fill={C.warning} />
        <path d="M120 86v28" stroke={C.warning} strokeWidth="2.5" strokeLinecap="round" />
    </Stage>
);

const TooMany = () => (
    <Stage>
        <path d="M54 132a66 66 0 0 1 132 0" fill="none" stroke={C.line} strokeWidth="16" strokeLinecap="round" />
        <path d="M54 132a66 66 0 0 1 17-44" fill="none" stroke={C.success} strokeWidth="16" strokeLinecap="round" />
        <path d="M82 76a66 66 0 0 1 76 0" fill="none" stroke={C.warning} strokeWidth="16" />
        <path d="M169 88a66 66 0 0 1 17 44" fill="none" stroke={C.danger} strokeWidth="16" strokeLinecap="round" />
        <path d="M120 132l40-44" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
        <circle cx="120" cy="132" r="11" fill={C.ink} />
        <circle cx="120" cy="132" r="4.5" fill={C.surface} />
        <circle cx="178" cy="52" r="13" fill={C.danger} />
        <rect x="176" y="44" width="4" height="10" rx="2" fill={C.surface} />
        <circle cx="178" cy="59" r="2.3" fill={C.surface} />
    </Stage>
);

const ServerError = () => (
    <Stage tint={C.dangerSoft}>
        <rect x="64" y="36" width="112" height="38" rx="9" fill={C.surface} stroke={C.line} strokeWidth="3" />
        <rect x="64" y="80" width="112" height="38" rx="9" fill={C.surface} stroke={C.line} strokeWidth="3" />
        <circle cx="82" cy="55" r="4.5" fill={C.success} />
        <circle cx="96" cy="55" r="4.5" fill={C.line} />
        <rect x="112" y="51" width="50" height="8" rx="4" fill={C.line} />
        <circle cx="82" cy="99" r="4.5" fill={C.danger} />
        <circle cx="96" cy="99" r="4.5" fill={C.danger} />
        <rect x="112" y="95" width="50" height="8" rx="4" fill={C.line} />
        <path d="M120 118v14q0 14-14 14H84" fill="none" stroke={C.ink} strokeWidth="4.5" strokeLinecap="round" />
        <rect x="64" y="139" width="14" height="14" rx="3" fill={C.ink} />
        <path d="M120 146v6M134 146l6 6M128 138l8-3" stroke={C.danger} strokeWidth="3" strokeLinecap="round" />
        <path d="M184 40l18 32h-36z" fill={C.danger} stroke={C.danger} strokeWidth="4" strokeLinejoin="round" />
        <rect x="182" y="50" width="4" height="12" rx="2" fill={C.surface} />
        <circle cx="184" cy="67" r="2.3" fill={C.surface} />
    </Stage>
);

const Maintenance = () => (
    <Stage tint={C.warningSoft}>
        <rect x="42" y="34" width="150" height="104" rx="11" fill={C.surface} stroke={C.line} strokeWidth="3" />
        <path d="M42 45a11 11 0 0 1 11-11h128a11 11 0 0 1 11 11v8H42z" fill={C.soft} />
        <circle cx="56" cy="44" r="3" fill={C.line} />
        <circle cx="66" cy="44" r="3" fill={C.line} />
        <circle cx="76" cy="44" r="3" fill={C.line} />
        <rect x="60" y="68" width="62" height="6" rx="3" fill={C.line} />
        <rect x="60" y="82" width="44" height="6" rx="3" fill={C.line} />
        <rect x="60" y="112" width="112" height="9" rx="4.5" fill={C.line} />
        <rect x="60" y="112" width="68" height="9" rx="4.5" fill={C.primary} />
        <g transform="translate(176 100)">
            {[0, 45, 90, 135].map((angle) => (
                <rect key={angle} x="-5" y="-34" width="10" height="68" rx="3" fill={C.primary} transform={`rotate(${angle})`} />
            ))}
            <circle r="25" fill={C.primary} />
            <circle r="10" fill={C.surface} />
        </g>
        <g transform="rotate(35 90 140)">
            <rect x="84" y="112" width="12" height="52" rx="6" fill={C.warning} />
            <circle cx="90" cy="108" r="14" fill={C.warning} />
            <rect x="85" y="92" width="10" height="14" rx="2" fill={C.warningSoft} />
        </g>
    </Stage>
);

export const ILLUSTRATIONS = {
    login: Login,
    verify: Verify,
    'password-expired': PasswordExpired,
    'not-found': NotFound,
    forbidden: Forbidden,
    unauthorized: Unauthorized,
    expired: Expired,
    'too-many': TooMany,
    error: ServerError,
    maintenance: Maintenance,
} as const;

export type IllustrationName = keyof typeof ILLUSTRATIONS;

/** One illustration by name, 240 by 180, scaling to the width it is given. Decorative (hidden from screen readers). */
export function Illustration({ name, className }: { name: IllustrationName; className?: string }) {
    const Drawing = ILLUSTRATIONS[name];

    return (
        <svg viewBox="0 0 240 180" role="presentation" aria-hidden="true" focusable="false" className={className}>
            <Drawing />
        </svg>
    );
}
