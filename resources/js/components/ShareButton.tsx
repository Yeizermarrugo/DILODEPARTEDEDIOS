import { type ShareContentType, useShareUrl } from '@/hooks/useShareUrl';
import { Check, Share2 } from 'lucide-react';

interface ShareButtonProps {
    type: ShareContentType;
    id: string;
    sharesCount?: number;
    variant?: 'default' | 'compact';
    className?: string;
}

export function ShareButton({ type, id, sharesCount = 0, variant = 'default', className = '' }: ShareButtonProps) {
    const { loading, copied, sharesCount: count, share } = useShareUrl(type, id, sharesCount);
    const size = variant === 'compact' ? 17 : 21;

    const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

    return (
        <button
            onClick={(e) => { e.stopPropagation(); share(); }}
            disabled={loading}
            aria-label="Compartir"
            title="Compartir"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                cursor: loading ? 'wait' : 'pointer',
                padding: '4px 2px',
                color: copied ? '#22c55e' : 'inherit',
                opacity: loading ? 0.5 : 1,
                transition: 'color 0.2s',
            }}
            className={className}
        >
            {copied && variant === 'default' && (
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#22c55e' }}>
                    ¡Copiado!
                </span>
            )}
            {copied
                ? <Check size={size} color="#22c55e" />
                : <Share2 size={size} />
            }
            {variant === 'default' && (
                <span style={{ fontSize: '0.85rem', color: copied ? '#22c55e' : 'inherit' }}>
                    {fmt(count)}
                </span>
            )}
        </button>
    );
}

export default ShareButton;
