import { useRef, useState } from 'react';

export type ShareContentType = 'devocional' | 'estudio' | 'ensenanza';

const csrfToken = () =>
    (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

export function useShareUrl(type: ShareContentType, id: string, initialSharesCount = 0) {
    const [shortUrl, setShortUrl] = useState<string | null>(() => {
        try {
            return localStorage.getItem(`short_url_${type}_${id}`);
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [sharesCount, setSharesCount] = useState(initialSharesCount);
    const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const recordShare = () => {
        fetch(`/api/share/${type}/${id}`, {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': csrfToken() },
        }).then(() => {
            setSharesCount((c) => c + 1);
        }).catch(() => {
            // fallo silencioso — el conteo en DB puede diferir por un share, no crítico
        });
    };

    const share = async () => {
        let url = shortUrl;

        if (!url) {
            setLoading(true);
            try {
                const res = await fetch(`/api/short-url/${type}/${id}`);
                const data = await res.json();
                url = data.short_url as string;
                setShortUrl(url);
                try {
                    localStorage.setItem(`short_url_${type}_${id}`, url);
                } catch {
                    // storage lleno — no crítico
                }
            } catch {
                setLoading(false);
                return;
            }
            setLoading(false);
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    url,
                    title: 'Dilo De Parte De Dios',
                    text: 'Te comparto esto de Dilo De Parte De Dios',
                });
                recordShare();
                return;
            } catch (err) {
                // AbortError = el usuario canceló — no contamos
                if (err instanceof Error && err.name !== 'AbortError') {
                    console.error('Error al compartir:', err);
                }
                return;
            }
        }

        // Fallback: copiar al portapapeles
        try {
            await navigator.clipboard.writeText(url);
            recordShare();
            if (copiedTimer.current) clearTimeout(copiedTimer.current);
            setCopied(true);
            copiedTimer.current = setTimeout(() => setCopied(false), 2500);
        } catch {
            // Si clipboard falla, no hacemos nada
        }
    };

    return { loading, copied, sharesCount, share };
}
