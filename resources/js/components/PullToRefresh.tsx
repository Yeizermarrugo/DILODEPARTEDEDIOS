import { useEffect, useRef, useState } from 'react';

const THRESHOLD = 72;   // px a jalar para activar
const MAX_PULL = 100;   // límite visual del indicador

export default function PullToRefresh() {
    const [pullY, setPullY] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const startY = useRef(0);
    const pulling = useRef(false);

    useEffect(() => {
        const onTouchStart = (e: TouchEvent) => {
            if (window.scrollY !== 0) return;
            startY.current = e.touches[0].clientY;
            pulling.current = true;
        };

        const onTouchMove = (e: TouchEvent) => {
            if (!pulling.current) return;
            if (window.scrollY !== 0) { pulling.current = false; setPullY(0); return; }
            const delta = e.touches[0].clientY - startY.current;
            if (delta <= 0) { setPullY(0); return; }
            // Resistencia progresiva para sensación natural
            setPullY(Math.min(MAX_PULL, delta * 0.45));
        };

        const onTouchEnd = () => {
            if (!pulling.current) return;
            pulling.current = false;
            if (pullY >= THRESHOLD * 0.45) {
                setRefreshing(true);
                setTimeout(() => window.location.reload(), 300);
            } else {
                setPullY(0);
            }
        };

        document.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchmove', onTouchMove, { passive: true });
        document.addEventListener('touchend', onTouchEnd);

        return () => {
            document.removeEventListener('touchstart', onTouchStart);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
        };
    }, [pullY]);

    if (pullY === 0 && !refreshing) return null;

    const progress = Math.min(1, pullY / (THRESHOLD * 0.45));
    const activated = progress >= 1;

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
                transform: `translateY(${refreshing ? 56 : pullY - 40}px)`,
                transition: refreshing ? 'transform 0.2s ease' : 'none',
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.15s',
                }}
            >
                {refreshing ? (
                    // Spinner girando
                    <svg
                        width={20} height={20}
                        viewBox="0 0 24 24"
                        style={{ animation: 'ptr-spin 0.7s linear infinite' }}
                    >
                        <circle cx="12" cy="12" r="10"
                            fill="none" stroke="#f75815" strokeWidth="2.5"
                            strokeDasharray="40 20" strokeLinecap="round" />
                    </svg>
                ) : (
                    // Flecha que rota según el progreso
                    <svg
                        width={18} height={18}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={activated ? '#f75815' : '#aaa'}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        style={{
                            transform: `rotate(${activated ? 180 : progress * 180}deg)`,
                            transition: 'transform 0.15s, stroke 0.15s',
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
