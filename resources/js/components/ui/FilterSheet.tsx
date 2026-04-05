// components/FilterSheet.tsx
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

export default function FilterSheet({
    isOpen, onClose, categories, total,
    pendingCategory, pendingSort,
    onCategoryChange, onSortChange,
    onApply, onClear,
}: Props) {
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Definido dentro para acceder a pendingSort (corazón activo/inactivo)
    const sortOptions: { id: SortId; label: string; icon: React.ReactNode }[] = [
        {
            id: 'latest',
            label: 'Más recientes',
            icon: <i className="bi bi-clock" style={{ fontSize: 13 }} />,
        },
        {
            id: 'likes',
            label: 'Más likes',
            icon: <span style={{ fontSize: 13 }}>{pendingSort === 'likes' ? '♥' : '♡'}</span>,
        },
        {
            id: 'views',
            label: 'Más vistas',
            icon: <i className="bi bi-eye" style={{ fontSize: 13 }} />,
        },
    ];

    const sortStyle = (id: SortId): React.CSSProperties => {
        const base: React.CSSProperties = {
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: 999,
            fontSize: 10, cursor: 'pointer',
        };
        if (id !== pendingSort) return {
            ...base,
            border: '1px solid #e5e5e5', background: '#fff', color: '#555',
        };
        if (id === 'likes') return {
            ...base,
            border: '1.5px solid #e63946', background: '#fff0f0',
            color: '#b91c2a', fontWeight: 500,
        };
        if (id === 'views') return {
            ...base,
            border: '1.5px solid #2563eb', background: '#eff6ff',
            color: '#1d4fb5', fontWeight: 500,
        };
        // latest activo
        return {
            ...base,
            border: 'none', background: '#f75815',
            color: '#fff', fontWeight: 500,
        };
    };

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: isOpen ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0)',
                    pointerEvents: isOpen ? 'auto' : 'none',
                    transition: 'background 0.25s ease',
                }}
            />

            {/* Sheet */}
            <div
                ref={sheetRef}
                style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    zIndex: 10000,
                    background: '#fff',
                    borderRadius: '20px 20px 0 0',
                    paddingBottom: 'env(safe-area-inset-bottom, 16px)',
                    transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
                    maxHeight: '85vh',
                    overflowY: 'auto',
                }}
            >
                {/* Handle */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
                    <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e0e0e0' }} />
                </div>

                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 20px 14px',
                    borderBottom: '1px solid #f0f0f0',
                }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>
                        Filtrar devocionales
                    </span>
                    <button
                        onClick={onClear}
                        style={{ fontSize: 13, color: '#f75815', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                        Limpiar todo
                    </button>
                </div>

                {/* Categorías */}
                <div style={{ padding: '16px 20px 0' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#aaa', marginBottom: 10 }}>
                        Categoría
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        <button
                            onClick={() => onCategoryChange(null)}
                            style={{
                                padding: '7px 16px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
                                border: 'none', fontWeight: pendingCategory === null ? 500 : 400,
                                background: pendingCategory === null ? '#f75815' : '#f1f1f1',
                                color: pendingCategory === null ? '#fff' : '#555',
                            }}
                        >
                            Todas <span style={{ opacity: 0.75, fontSize: 11 }}>{total}</span>
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.categoria}
                                onClick={() => onCategoryChange(cat.categoria)}
                                style={{
                                    padding: '7px 16px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
                                    border: 'none', fontWeight: pendingCategory === cat.categoria ? 500 : 400,
                                    background: pendingCategory === cat.categoria ? '#f75815' : '#f1f1f1',
                                    color: pendingCategory === cat.categoria ? '#fff' : '#555',
                                }}
                            >
                                {cat.categoria} <span style={{ opacity: 0.75, fontSize: 11 }}>{cat.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ordenar por */}
                <div style={{ padding: '16px 20px 0' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#aaa', marginBottom: 10 }}>
                        Ordenar por
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {sortOptions.map(s => (
                            <button
                                key={s.id}
                                onClick={() => onSortChange(s.id)}
                                style={sortStyle(s.id)}
                            >
                                {s.icon}
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Botón aplicar */}
                <div style={{ padding: '20px 20px 8px' }}>
                    <button
                        onClick={onApply}
                        style={{
                            width: '100%', padding: '14px',
                            background: '#f75815', color: '#fff',
                            border: 'none', borderRadius: 12,
                            fontSize: 15, fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        Aplicar filtros
                    </button>
                </div>
            </div>
        </>
    );
}