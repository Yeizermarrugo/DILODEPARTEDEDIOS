/**
 * CSRF headers for same-origin requests.
 *
 * Prefers the XSRF-TOKEN cookie, which Laravel refreshes on every response.
 * The <meta name="csrf-token"> tag is only rendered on full page loads, so it
 * goes stale after Inertia navigations that regenerate the session (login),
 * which caused 419 "CSRF token mismatch" until the page was reloaded.
 */
export function csrfHeaders(): Record<string, string> {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    if (match) {
        return { 'X-XSRF-TOKEN': decodeURIComponent(match[1]) };
    }

    const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
    return meta ? { 'X-CSRF-TOKEN': meta } : {};
}
