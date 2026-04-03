import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type ContentType = 'devocional' | 'estudio' | 'ensenanza';

interface LikeState {
    liked: boolean;
    total: number;
    loading: boolean;
}

interface UseLikeReturn extends LikeState {
    toggle: () => void;
}

const lsKey = (type: ContentType, id: string) => `liked_${type}_${id}`;
const lsTotal = (type: ContentType, id: string) => `liked_${type}_${id}_total`;

/**
 * useLike
 *
 * Identificación: cookie HttpOnly `visitor_id` (UUID, 1 año) → asignada por
 * el middleware AssignVisitorId en cada respuesta web de Laravel.
 *
 * Flujo:
 *  1. Lee LocalStorage → UI instantánea (sin esperar red)
 *  2. Verifica con GET /api/likes/{type}/{id} en segundo plano
 *  3. Toggle con POST /api/likes/{type}/{id} + debounce 300ms
 *  4. Actualización optimista → revierte si falla
 */
export function useLike(type: ContentType, id: string): UseLikeReturn {
    const key = lsKey(type, id);
    const keyT = lsTotal(type, id);

    const [state, setState] = useState<LikeState>({
        liked: localStorage.getItem(key) === 'true',
        total: parseInt(localStorage.getItem(keyT) ?? '0', 10),
        loading: false,
    });

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mounted = useRef(true);

    // ── Verificación inicial con el servidor ──────────────────────────────────
    useEffect(() => {
        mounted.current = true;

        (async () => {
            try {
                const res = await fetch(`/api/likes/${type}/${id}`);
                if (!res.ok || !mounted.current) return;
                const data = await res.json();
                setState(prev => ({ ...prev, liked: data.liked, total: data.total }));
                localStorage.setItem(key, String(data.liked));
                localStorage.setItem(keyT, String(data.total));
            } catch { /* silencioso — nos quedamos con el localStorage */ }
        })();

        return () => { mounted.current = false; };
    }, [type, id]);

    // ── Toggle ────────────────────────────────────────────────────────────────
    const toggle = useCallback(() => {
        // 1. Actualización optimista inmediata
        setState(prev => {
            const liked = !prev.liked;
            const total = liked ? prev.total + 1 : Math.max(0, prev.total - 1);
            localStorage.setItem(key, String(liked));
            localStorage.setItem(keyT, String(total));
            return { ...prev, liked, total };
        });

        // 2. Debounce: cancela si el usuario hace spam de clicks
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            try {
                // ── Hora local del dispositivo ──
                const d = new Date();
                const pad = (n: number) => String(n).padStart(2, '0');
                const localTime = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

                const res = await fetch(`/api/likes/${type}/${id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                    },
                    body: JSON.stringify({ local_time: localTime }), // ← único cambio
                });
                if (!res.ok || !mounted.current) return;
                const data = await res.json();
                setState(prev => ({ ...prev, liked: data.liked, total: data.total }));
                localStorage.setItem(key, String(data.liked));
                localStorage.setItem(keyT, String(data.total));
            } catch {
                // Revertir si falla la red
                if (!mounted.current) return;
                setState(prev => {
                    const liked = !prev.liked;
                    const total = liked ? prev.total + 1 : Math.max(0, prev.total - 1);
                    localStorage.setItem(key, String(liked));
                    localStorage.setItem(keyT, String(total));
                    return { ...prev, liked, total };
                });
            }
        }, 300);
    }, [type, id]);

    return { ...state, toggle };
}