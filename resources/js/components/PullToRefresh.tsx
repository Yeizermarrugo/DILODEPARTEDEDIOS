import { useEffect, useRef, useState } from 'react';

const THRESHOLD   = 80;   // px raw para activar (distancia real del dedo)
const RESISTANCE  = 0.42; // factor de amortiguación visual
const MAX_VISUAL  = 88;   // límite visual del indicador en px

export default function PullToRefresh() {
    const [pullDisplay, setPullDisplay] = useState(0);
    const [refreshing, setRefreshing]   = useState(false);

    // Todos los valores de lógica en refs → sin stale closure
    const startY      = useRef(0);
    const pulling     = useRef(false);
    const rawDelta    = useRef(0);
    const isRefreshing = useRef(false);

    useEffect(() => {
        const onTouchStart = (e: TouchEvent) => {
            if (isRefreshing.current) return;
            // iOS puede tener scrollY negativo por rubber band — comparar con > 0
            if (window.scrollY > 0) return;
            startY.current  = e.touches[0].clientY;
            rawDelta.current = 0;
            pulling.current = true;
        };

        const onTouchMove = (e: TouchEvent) => {
            if (!pulling.current || isRefreshing.current) return;
            if (window.scrollY > 0) {
                pulling.current = false;
                rawDelta.current = 0;
                setPullDisplay(0);
                return;
            }
            const delta = e.touches[0].clientY - startY.current;
            if (delta <= 0) {
                rawDelta.current = 0;
                setPullDisplay(0);
                return;
            }
            // Bloquear el scroll nativo de iOS mientras el usuario jala
            e.preventDefault();
            rawDelta.current = delta;
            setPullDisplay(Math.min(MAX_VISUAL, delta * RESISTANCE));
        };

        const onTouchEnd = () => {
            if (!pulling.current || isRefreshing.current) return;
            pulling.current = false;

            if (rawDelta.current >= THRESHOLD) {
                isRefreshing.current = true;
                setRefreshing(true);
                // Dar tiempo para que el spinner sea visible antes de recargar
                setTimeout(() => window.location.reload(), 600);
            } else {
                rawDelta.current = 0;
                setPullDisplay(0);
            }
        };

        document.addEventListener('touchstart', onTouchStart, { passive: true });
        // passive: false obligatorio para poder llamar preventDefault en iOS
        document.addEventListener('touchmove',  onTouchMove,  { passive: false });
        document.addEventListener('touchend',   onTouchEnd,   { passive: true });

        return () => {
            document.removeEventListener('touchstart', onTouchStart);
            document.removeEventListener('touchmove',  onTouchMove);
            document.removeEventListener('touchend',   onTouchEnd);
        };
    }, []); // sin dependencias — toda la lógica usa refs

    if (pullDisplay === 0 && !refreshing) return null;

    // Posición: el indicador arranca oculto (−52px) y baja con el gesto
    const translateY = refreshing
        ? 48
        : pullDisplay - 52;

    const progress  = Math.min(1, rawDelta.current / THRESHOLD);
    const activated = rawDelta.current >= THRESHOLD;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                transform: `translateY(${translateY}px)`,
                transition: refreshing ? 'transform 0.25s ease' : 'none',
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {refreshing ? (
                    <svg width={20} height={20} viewBox="0 0 24 24"
                        style={{ animation: 'ptr-spin 0.65s linear infinite' }}>
                        <circle cx="12" cy="12" r="9"
                            fill="none" stroke="#f75815" strokeWidth="2.5"
                            strokeDasharray="38 18" strokeLinecap="round" />
                    </svg>
                ) : (
                    <svg width={18} height={18} viewBox="0 0 24 24"
                        fill="none"
                        stroke={activated ? '#f75815' : '#bbb'}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            transform: `rotate(${activated ? 180 : Math.round(progress * 180)}deg)`,
                            transition: 'transform 0.12s, stroke 0.12s',
                        }}
                    >
                        <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                )}
            </div>

            <style>{`
                @keyframes ptr-spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
