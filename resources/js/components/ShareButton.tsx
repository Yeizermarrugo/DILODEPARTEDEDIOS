import { type ShareContentType, useShareUrl } from '@/hooks/useShareUrl';
import { Check, Share2 } from 'lucide-react';

interface ShareButtonProps {
    type: ShareContentType;
    id: string;
    variant?: 'default' | 'compact';
    className?: string;
}

export function ShareButton({ type, id, variant = 'default', className = '' }: ShareButtonProps) {
    const { loading, copied, share } = useShareUrl(type, id);
    const size = variant === 'compact' ? 17 : 21;

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
                padding: '4px',
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
        </button>
    );
}

export default ShareButton;
