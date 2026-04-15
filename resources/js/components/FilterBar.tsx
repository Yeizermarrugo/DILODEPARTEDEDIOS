export type SortId = 'latest' | 'likes' | 'views';

type Category = { categoria: string; count: number };

type Props = {
    categories: Category[];
    total: number;
    selectedCategory: string | null;
    sort: SortId;
    onCategoryChange: (cat: string | null) => void;
    onSortToggle: (sort: 'likes' | 'views') => void;
    onOpenSheet: () => void;
    onClearAll: () => void;
};

export default function FilterBar({
    categories,
    total,
    selectedCategory,
    sort,
    onCategoryChange,
    onSortToggle,
    onOpenSheet,
    onClearAll,
}: Props) {
    const catLabel = selectedCategory
        ? categories.find(c => c.categoria === selectedCategory)?.categoria ?? 'Todas'
        : 'Todas';
    const sortLabel = sort === 'likes' ? 'Likes' : sort === 'views' ? 'Vistas' : 'Recientes';
    const hasFilter = selectedCategory !== null || sort !== 'latest';

    return (
        <>
            {/* ── DESKTOP: filtro original con pills ── */}
            <div className="filter-desktop">
                {/* Fila 1: Categorías */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: 80, whiteSpace: 'nowrap' }}>
                        Categorías
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        <button
                            onClick={() => onCategoryChange(null)}
                            style={{
                                padding: '5px 13px', borderRadius: 999,
                                border: selectedCategory === null ? 'none' : '0.5px solid #dee2e6',
                                background: selectedCategory === null ? '#f75815' : '#fff',
                                color: selectedCategory === null ? '#fff' : '#6c757d',
                                cursor: 'pointer', fontSize: 13,
                                fontWeight: selectedCategory === null ? 500 : 400,
                                transition: 'all 0.15s ease',
                            }}
                        >
                            Todas <span style={{ opacity: 0.75, fontSize: 11 }}>{total}</span>
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.categoria}
                                onClick={() => onCategoryChange(cat.categoria)}
                                style={{
                                    padding: '5px 13px', borderRadius: 999,
                                    border: selectedCategory === cat.categoria ? 'none' : '0.5px solid #dee2e6',
                                    background: selectedCategory === cat.categoria ? '#f75815' : '#fff',
                                    color: selectedCategory === cat.categoria ? '#fff' : '#6c757d',
                                    cursor: 'pointer', fontSize: 13,
                                    fontWeight: selectedCategory === cat.categoria ? 500 : 400,
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                {cat.categoria} <span style={{ opacity: 0.75, fontSize: 11 }}>{cat.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Fila 2: Ordenar por */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: 80, whiteSpace: 'nowrap' }}>
                        Ordenar por
                    </span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{
                            padding: '5px 12px', borderRadius: 999, fontSize: 13,
                            background: sort === 'latest' ? '#f5f5f5' : 'transparent',
                            color: sort === 'latest' ? '#212529' : '#6c757d',
                            fontWeight: sort === 'latest' ? 500 : 400,
                        }}>
                            🕐 Más recientes
                        </span>
                        <div style={{ width: 1, height: 18, background: '#dee2e6' }} />
                        <button
                            onClick={() => onSortToggle('likes')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '5px 13px', borderRadius: 999,
                                border: sort === 'likes' ? '1.5px solid #e63946' : '0.5px solid #dee2e6',
                                background: sort === 'likes' ? '#fff0f0' : '#fff',
                                color: sort === 'likes' ? '#c0182a' : '#6c757d',
                                cursor: 'pointer', fontSize: 13,
                                fontWeight: sort === 'likes' ? 500 : 400,
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <span style={{ fontSize: 14 }}>{sort === 'likes' ? '♥' : '♡'}</span>
                            Más likes
                            {sort === 'likes' && (
                                <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#e63946', color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</span>
                            )}
                        </button>
                        <button
                            onClick={() => onSortToggle('views')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '5px 13px', borderRadius: 999,
                                border: sort === 'views' ? '1.5px solid #2563eb' : '0.5px solid #dee2e6',
                                background: sort === 'views' ? '#ebf3ff' : '#fff',
                                color: sort === 'views' ? '#1a4db5' : '#6c757d',
                                cursor: 'pointer', fontSize: 13,
                                fontWeight: sort === 'views' ? 500 : 400,
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <i className="bi bi-eye" style={{ fontSize: 14 }} />
                            Más vistas
                            {sort === 'views' && (
                                <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#2563eb', color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── MÓVIL: sticky bar compacta ── */}
            <div className="filter-mobile">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#999' }}>
                        {total} devocionales
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '5px 12px', borderRadius: 999,
                            background: hasFilter ? '#f75815' : '#f1f1f1',
                            color: hasFilter ? '#fff' : '#555',
                            fontSize: 12, fontWeight: 500,
                            maxWidth: 150, overflow: 'hidden', whiteSpace: 'nowrap',
                        }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {catLabel} · {sortLabel}
                            </span>
                            {hasFilter && (
                                <span
                                    onClick={(e) => { e.stopPropagation(); onClearAll(); }}
                                    style={{ cursor: 'pointer', opacity: 0.8, fontSize: 13, marginLeft: 2 }}
                                >
                                    ✕
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onOpenSheet}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '7px 14px', borderRadius: 8,
                                border: '1px solid #e0e0e0', background: '#fff',
                                fontSize: 13, color: '#333', cursor: 'pointer',
                            }}
                        >
                            <span style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: hasFilter ? '#f75815' : '#ccc',
                                display: 'inline-block', flexShrink: 0,
                            }} />
                            Filtrar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
