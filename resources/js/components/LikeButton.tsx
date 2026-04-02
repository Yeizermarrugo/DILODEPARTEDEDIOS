import { ContentType, useLike } from '@/hooks/useLike';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
    type: ContentType;
    id: string;
    /**
     * 'default'  → corazón + número  (página de detalle, enseñanzas)
     * 'compact'  → solo corazón      (cards del listado)
     */
    variant?: 'default' | 'compact';
    className?: string;
}

export function LikeButton({ type, id, variant = 'default', className = '' }: LikeButtonProps) {
    const { liked, total, loading, toggle } = useLike(type, id);

    const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

    return (
        <button
            onClick={(e) => { e.stopPropagation(); toggle(); }}
            disabled={loading}
            aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
            aria-pressed={liked}
            title={liked ? 'Quitar me gusta' : 'Me gusta'}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'none',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                padding: '4px 6px',
                borderRadius: '20px',
                opacity: loading ? 0.5 : 1,
                transition: 'opacity 0.2s',
                userSelect: 'none',
            }}
            className={className}
        >
            <Heart
                size={variant === 'compact' ? 17 : 21}
                style={{
                    fill: liked ? '#ef4444' : 'transparent',
                    color: liked ? '#ef4444' : 'currentColor',
                    transition: 'all 0.18s ease',
                    transform: liked ? 'scale(1.15)' : 'scale(1)',
                }}
            />
            {variant === 'default' && (
                <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: liked ? '#ef4444' : 'inherit',
                    transition: 'color 0.18s ease',
                    lineHeight: 1,
                }}>
                    {fmt(total)}
                </span>
            )}
        </button>
    );
}

export default LikeButton;