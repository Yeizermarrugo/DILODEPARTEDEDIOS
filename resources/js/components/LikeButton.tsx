import { ContentType, useLike } from '@/hooks/useLike';
import { Heart } from 'lucide-react';
import { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import '../../css/LikeButton.css';

interface LikeButtonProps {
    type: ContentType;
    id: string;
    variant?: 'default' | 'compact';
    className?: string;
}

function FlyingHeart({ startX, startY }: { startX: number; startY: number }) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const deltaX = centerX - startX;
    const deltaY = centerY - startY;

    return (
        <div
            className="flying-heart"
            style={{
                left: startX,
                top: startY,
                '--dx': `${deltaX}px`,
                '--dy': `${deltaY}px`,
            } as React.CSSProperties}
        >
            <Heart
                size={60} // máximo — CSS lo reduce según breakpoint
                style={{
                    fill: '#ef4444',
                    color: '#ef4444',
                    filter: 'drop-shadow(0 0 12px rgba(239,68,68,0.9))',
                }}
            />
        </div>
    );
}

export function LikeButton({ type, id, variant = 'default', className = '' }: LikeButtonProps) {
    const { liked, total, loading, toggle } = useLike(type, id);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!liked && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();

            // Tamaño del corazón volador según breakpoint
            const heartSize = window.innerWidth >= 1200 ? 60
                : window.innerWidth >= 768 ? 48
                    : 36;
            const offset = heartSize / 2;

            const startX = rect.left + rect.width / 2 - offset;
            const startY = rect.top + rect.height / 2 - offset;

            const wrapper = document.createElement('div');
            document.body.appendChild(wrapper);
            const root = createRoot(wrapper);
            root.render(<FlyingHeart startX={startX} startY={startY} />);

            setTimeout(() => {
                root.unmount();
                wrapper.remove();
            }, 950); // coincide con duración de animación
        }

        toggle();
    };

    return (
        <button
            ref={buttonRef}
            onClick={handleClick}
            disabled={loading}
            aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
            aria-pressed={liked}
            title={liked ? 'Quitar me gusta' : 'Me gusta'}
            className={`like-button ${className}`}
        >
            <Heart
                size={variant === 'compact' ? 17 : 21}
                className="like-button__heart"
                style={{
                    fill: liked ? '#ef4444' : 'transparent',
                    color: liked ? '#ef4444' : 'currentColor',
                    transform: liked ? 'scale(1.15)' : 'scale(1)',
                }}
            />
            {variant === 'default' && (
                <span
                    className="like-button__count"
                    style={{ color: liked ? '#ef4444' : 'inherit' }}
                >
                    {fmt(total)}
                </span>
            )}
        </button>
    );
}

export default LikeButton;