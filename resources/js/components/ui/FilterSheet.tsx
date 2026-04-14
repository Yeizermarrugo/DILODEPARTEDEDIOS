// components/ui/FilterSheet.tsx
import { useEffect, useRef } from 'react';

type Category = { categoria: string; count: number };
type SortId = 'latest' | 'likes' | 'views';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    total: number;
    pendingCategory: string | null;
    pendingSort: SortId;
    onCategoryChange: (cat: string | null) => void;
    onSortChange: (sort: SortId) => void;
    onApply: () => void;
    onClear: () => void;
};

const BLUE = '#2d465e';
const ORANGE = '#f75815';
const CREAM = '#faf8f4';
const WARM = '#f5f0e8';
const BORDER = '#e8e2d8';
const MUTED = '#8a7f72';
const TEXT = '#1c1917';

export default function FilterSheet({
    isOpen, onClose, categories, total,
    pendingCategory, pendingSort,
    onCategoryChange, onSortChange,
    onApply, onClear,
}: Props) {
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const sortOptions: { id: SortId; label: string; icon: string }[] = [
        { id: 'latest', icon: '🕐', label: 'Más recientes' },
        { id: 'likes', icon: pendingSort === 'likes' ? '♥' : '♡', label: 'Más likes' },
        { id: 'views', icon: '👁', label: 'Más vistas' },
    ];

    const sortPillStyle = (id: SortId): React.CSSProperties => {
        const base: React.CSSProperties = {
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 999,
            fontSize: 12, fontFamily: "'Instrument Sans', sans-serif",
            cursor: 'pointer', fontWeight: pendingSort === id ? 600 : 400,
        };
        if (id !== pendingSort) return { ...base, border: `1px solid ${BORDER}`, background: '#fff', color: MUTED };
        if (id === 'likes') return { ...base, border: `1.5px solid rgba(247,88,21,0.5)`, background: 'rgba(247,88,21,0.08)', color: ORANGE };
        if (id === 'views') return { ...base, border: `1.5px solid rgba(45,70,94,0.4)`, background: 'rgba(45,70,94,0.07)', color: BLUE };
        return { ...base, border: 'none', background: ORANGE, color: '#fff' };
    };

    const catPillStyle = (cat: string | null): React.CSSProperties => ({
        padding: '7px 14px', borderRadius: 999,
        fontSize: 12, cursor: 'pointer',
        fontFamily: "'Instrument Sans', sans-serif",
        fontWeight: pendingCategory === cat ? 600 : 400,
        border: pendingCategory === cat ? 'none' : `1px solid ${BORDER}`,
        background: pendingCategory === cat ? BLUE : '#fff',
        color: pendingCategory === cat ? '#fff' : MUTED,
    });

    const activeCount = (pendingCategory !== null ? 1 : 0) + (pendingSort !== 'latest' ? 1 : 0);

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9998,
                    background: isOpen ? 'rgba(15,28,40,0.55)' : 'rgba(0,0,0,0)',
                    pointerEvents: isOpen ? 'auto' : 'none',
                    backdropFilter: isOpen ? 'blur(2px)' : 'none',
                    transition: 'background 0.3s ease',
                }}
            />

            {/* Sheet */}
            <div
                ref={sheetRef}
                style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    zIndex: 9999,
                    background: CREAM,
                    borderRadius: '20px 20px 0 0',
                    paddingBottom: 'env(safe-area-inset-bottom, 20px)',
                    transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                    maxHeight: '88vh', overflowY: 'auto',
                    boxShadow: '0 -8px 40px rgba(15,28,40,0.18)',
                    fontFamily: "'Instrument Sans', sans-serif",
                }}
            >
                {/* Handle */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px' }}>
                    <div style={{ width: 40, height: 4, borderRadius: 2, background: BORDER }} />
                </div>

                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 22px 16px', borderBottom: `1px solid ${BORDER}`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 4, height: 22, borderRadius: 2, background: ORANGE, flexShrink: 0 }} />
                        <span style={{ fontSize: 17, fontWeight: 600, color: TEXT, fontFamily: "'Cormorant Garamond', serif" }}>
                            Filtrar devocionales
                        </span>
                        {activeCount > 0 && (
                            <span style={{ background: ORANGE, color: '#fff', borderRadius: 100, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>
                                {activeCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClear}
                        style={{ fontSize: 12, color: MUTED, background: 'none', border: `1px solid ${BORDER}`, borderRadius: 100, cursor: 'pointer', padding: '5px 12px', fontFamily: "'Instrument Sans', sans-serif" }}
                    >
                        Limpiar
                    </button>
                </div>

                {/* Categorías */}
                <div style={{ padding: '18px 22px 0' }}>
                    <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(247,88,21,0.65)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        Categorías
                        <span style={{ flex: 1, height: 1, background: 'rgba(247,88,21,0.15)', display: 'block' }} />
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        <button onClick={() => onCategoryChange(null)} style={catPillStyle(null)}>
                            Todas <span style={{ opacity: 0.6, fontSize: 10, marginLeft: 3 }}>{total}</span>
                        </button>
                        {categories.map(cat => (
                            <button key={cat.categoria} onClick={() => onCategoryChange(cat.categoria)} style={catPillStyle(cat.categoria)}>
                                {cat.categoria} <span style={{ opacity: 0.6, fontSize: 10, marginLeft: 3 }}>{cat.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div style={{ margin: '18px 22px 0', height: 1, background: BORDER }} />

                {/* Ordenar */}
                <div style={{ padding: '16px 22px 0' }}>
                    <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(247,88,21,0.65)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        Ordenar por
                        <span style={{ flex: 1, height: 1, background: 'rgba(247,88,21,0.15)', display: 'block' }} />
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {sortOptions.map(s => (
                            <button key={s.id} onClick={() => onSortChange(s.id)} style={sortPillStyle(s.id)}>
                                <span style={{ fontSize: 13 }}>{s.icon}</span>
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Resumen activo */}
                {activeCount > 0 && (
                    <div style={{ margin: '16px 22px 0', background: WARM, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${BORDER}`, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: MUTED }}>Filtrando:</span>
                        {pendingCategory && (
                            <span style={{ background: BLUE, color: '#fff', borderRadius: 100, padding: '2px 10px', fontSize: 11 }}>{pendingCategory}</span>
                        )}
                        {pendingSort !== 'latest' && (
                            <span style={{ background: ORANGE, color: '#fff', borderRadius: 100, padding: '2px 10px', fontSize: 11 }}>
                                {pendingSort === 'likes' ? '♥ Más likes' : '👁 Más vistas'}
                            </span>
                        )}
                    </div>
                )}

                {/* Botón aplicar */}
                <div style={{ padding: '20px 22px 8px' }}>
                    <button
                        onClick={onApply}
                        style={{
                            width: '100%', padding: '15px',
                            background: BLUE, color: '#fff',
                            border: 'none', borderRadius: 14,
                            fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            fontFamily: "'Instrument Sans', sans-serif",
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}
                    >
                        Aplicar filtros
                        {activeCount > 0 && (
                            <span style={{ background: ORANGE, color: '#fff', borderRadius: 100, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>
                                {activeCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}