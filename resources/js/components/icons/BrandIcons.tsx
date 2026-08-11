type BrandIconProps = {
    size?: number;
    className?: string;
};

export function FacebookIcon({ size = 24, className }: BrandIconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
        </svg>
    );
}

export function InstagramIcon({ size = 24, className }: BrandIconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37a4 4 0 1 1-7.914 1.174A4 4 0 0 1 16 11.37Z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    );
}

export function YoutubeIcon({ size = 24, className }: BrandIconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17Z" />
            <path d="m10 15 5-3-5-3z" />
        </svg>
    );
}

export function WhatsappIcon({ size = 24, className }: BrandIconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.27 4.9L2 22l5.25-1.27a9.96 9.96 0 0 0 4.79 1.22h.01c5.52 0 10-4.48 10-10s-4.48-9.95-10.01-9.95Zm5.87 14.2c-.25.7-1.25 1.29-2.03 1.46-.54.11-1.24.2-3.6-.77-3.02-1.25-4.96-4.32-5.11-4.52-.15-.2-1.22-1.62-1.22-3.09s.75-2.19 1.02-2.49c.25-.28.55-.35.73-.35h.53c.17 0 .4-.06.62.48.25.6.83 2.08.9 2.23.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.32.4-.45.53-.15.15-.3.32-.13.62.17.3.75 1.24 1.62 2.01 1.11.99 2.04 1.3 2.34 1.45.3.15.48.13.65-.08.17-.2.72-.84.92-1.13.2-.28.4-.24.65-.14.28.1 1.75.83 2.06.98.3.15.5.23.58.35.08.13.08.75-.17 1.43Z" />
        </svg>
    );
}
