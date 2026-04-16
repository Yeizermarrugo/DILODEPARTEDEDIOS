import CardNew from '@/components/CardNew';
import PageLayout from '@/components/PageLayout';
import Spinner from '@/components/Spinner';
import FilterSheet from '@/components/ui/FilterSheet';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import '../../css/devocionals.css';
import '../../css/main.css';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type SortId = 'latest' | 'likes' | 'views';

type Category = { categoria: string; count: number };

type Devocional = {
    id: string;
    contenido: string;
    imagen: string;
    categoria: string;
    created_at?: string;
    views_count?: number;
    autor?: string;
    [key: string]: unknown;
};

type DevocionalesResponse = {
    data: Devocional[];
    current_page: number;
    last_page: number;
    total: number;
    categorias?: Category[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const obtenerPrimerEtiqueta = (html: string): string => {
    const match = html.match(/<([a-zA-Z0-9]+)[^>]*>(.*?)<\/\1>/i);
    return match ? match[2].replace(/<[^>]+>/g, '') : '';
};

const decodeHtmlEntities = (str: string): string => {
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
};

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState<T>(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

// ─── Componente Principal ─────────────────────────────────────────────────────

function Devocionals() {
    // Estados de Datos
    const [categories, setCategories] = useState<Category[]>([]);
    const [devocionales, setDevocionales] = useState<Devocional[]>([]);
    const [pagination, setPagination] = useState<Partial<DevocionalesResponse>>({});

    // Estados de Filtros y UI
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sort, setSort] = useState<SortId>('latest');

    // Estados de Modal/Sheet
    const [sheetOpen, setSheetOpen] = useState(false);
    const [pendingCategory, setPendingCategory] = useState<string | null>(null);
    const [pendingSort, setPendingSort] = useState<SortId>('latest');

    const inputRef = useRef<HTMLInputElement>(null);
    const debouncedSearch = useDebounce(searchTerm, 350);

    // Resetear página al buscar o filtrar
    useEffect(() => { setPage(1); }, [debouncedSearch, selectedCategory, sort]);

    // ── Fetch Data ────────────────────────────────────────────────────────────
    useEffect(() => {
        const controller = new AbortController();
        const fetchData = async () => {
            setLoading(true);
            try {
                let url = '';
                const params = new URLSearchParams({
                    page: String(page),
                    sort: sort
                });

                if (debouncedSearch.trim()) {
                    params.append('search', debouncedSearch.trim());
                    url = `/devocionales-search?${params.toString()}`;
                } else if (selectedCategory) {
                    url = `/devocionales/categoria/${encodeURIComponent(selectedCategory)}?${params.toString()}`;
                } else {
                    url = `/devocionales-search?${params.toString()}`;
                }

                const response = await fetch(url, { signal: controller.signal });
                const data = await response.json();

                if (data.categorias) setCategories(data.categorias);

                // Normalización de respuesta del backend
                if (data.devocionales) {
                    setDevocionales(data.devocionales.data || []);
                    setPagination(data.devocionales);
                } else if (data.data) {
                    setDevocionales(data.data);
                    setPagination(data);
                }
            } catch (err: unknown) {
                if ((err as Error).name !== 'AbortError') console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [selectedCategory, page, debouncedSearch, sort]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (e.target.value && selectedCategory) setSelectedCategory(null);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        inputRef.current?.focus();
    };

    // ── Valores Derivados ─────────────────────────────────────────────────────

    const totalResults = pagination.total || 0;
    const hasFilter = selectedCategory !== null || sort !== 'latest';
    const gridHeading = debouncedSearch.trim()
        ? `Resultados de "${debouncedSearch.trim()}"`
        : selectedCategory ?? 'Todos los Devocionales';

    const sortOptions: { key: SortId; icon: string; label: string }[] = [
        { key: 'latest', icon: 'bi-clock', label: 'Más recientes' },
        { key: 'likes', icon: pendingSort === 'likes' ? 'bi-heart-fill' : 'bi-heart', label: 'Más likes' },
        { key: 'views', icon: 'bi-eye', label: 'Más vistas' },
    ];

    const todasLasCategorias = useMemo(() =>
        categories.map(c => c.categoria.trim().toLowerCase()).sort()
        , [categories]);

    // ── Render Helpers ───────────────────────────────────────────────────────

    const renderPaginator = () => {
        if (!pagination.last_page || pagination.last_page <= 1) return null;
        const cur = pagination.current_page || 1;
        const last = pagination.last_page;

        return (
            <div className="dv-pager">
                <span className="dv-pager__info">
                    {totalResults} publicaciones · pág. {cur} de {last}
                </span>
                <div className="dv-pager__btns">
                    <button className="dv-pager__btn" onClick={() => setPage(cur - 1)} disabled={cur === 1}>‹</button>
                    {Array.from({ length: last }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === last || Math.abs(p - cur) <= 1)
                        .map((p, i, arr) => (
                            <React.Fragment key={p}>
                                {i > 0 && arr[i - 1] !== p - 1 && <span className="dv-pager__dots">...</span>}
                                <button
                                    className={`dv-pager__btn ${cur === p ? 'dv-pager__btn--active' : ''}`}
                                    onClick={() => setPage(p)}
                                >{p}</button>
                            </React.Fragment>
                        ))}
                    <button className="dv-pager__btn" onClick={() => setPage(cur + 1)} disabled={cur === last}>›</button>
                </div>
            </div>
        );
    };

    return (
        <PageLayout className="dv-page">
            <main>
                <div className="dv-page-hero">
                    <div className="dv-page-hero__inner">
                        <div className="dv-page-hero__eyebrow">Devocionales</div>
                        <h1 className="dv-page-hero__title">
                            Encuentra la <em>palabra</em> que Dios tiene para ti <em>hoy</em>
                        </h1>
                        <div className="dv-page-hero__verse">
                            <p>“Tal vez no nos damos cuenta, pero Dios no deja de hablarnos.”</p>
                            <strong>Job 33:14 TLA</strong>
                        </div>
                    </div>
                </div>

                <div className="dv-layout">
                    {/* Sidebar Desktop */}
                    <aside className="dv-sidebar">
                        <div className="dv-sidebar__section">
                            <div className="dv-sidebar__section-label">Categorías</div>
                            <div className="dv-sidebar__cats">
                                <button
                                    className={`dv-sidebar__cat ${!selectedCategory && !debouncedSearch ? 'dv-sidebar__cat--active' : ''}`}
                                    onClick={() => setSelectedCategory(null)}
                                >
                                    <span>Todas</span>
                                    <span className="dv-sidebar__cat-count">{totalResults}</span>
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.categoria}
                                        className={`dv-sidebar__cat ${selectedCategory === cat.categoria ? 'dv-sidebar__cat--active' : ''}`}
                                        onClick={() => setSelectedCategory(cat.categoria)}
                                    >
                                        <span>{cat.categoria}</span>
                                        <span className="dv-sidebar__cat-count">{cat.count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="dv-sidebar__section">
                            <div className="dv-sidebar__section-label">Ordenar por</div>
                            <div className="dv-sidebar__sort">
                                {sortOptions.map(opt => (
                                    <button
                                        key={opt.key}
                                        className={`dv-sidebar__sort-btn ${sort === opt.key ? 'dv-sidebar__sort-btn--active' : ''}`}
                                        onClick={() => setSort(opt.key)}
                                    >
                                        <i className={`bi ${opt.icon} dv-sidebar__sort-icon`} />
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    <div className="dv-content">
                        {/* Topbar: Buscador y Filtros Mobile */}
                        <div className="dv-topbar">
                            <div className="dv-topbar__left">
                                <div className="dv-topbar__heading">{gridHeading}</div>
                                <div className="dv-topbar__count">{totalResults} publicaciones</div>
                            </div>

                            <div className="dv-topbar__right">
                                <div className="dv-search">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="dv-search__input"
                                        placeholder="Buscar..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                    {loading ? <Spinner /> : searchTerm && (
                                        <button className="dv-search__clear" onClick={handleClearSearch}>✕</button>
                                    )}
                                </div>

                                <button
                                    className="dv-mobile-filter-btn"
                                    onClick={() => {
                                        setPendingCategory(selectedCategory);
                                        setPendingSort(sort);
                                        setSheetOpen(true);
                                    }}
                                >
                                    {hasFilter && <span className="dv-mobile-filter-btn__dot--active" />}
                                    Filtrar
                                </button>
                            </div>
                        </div>

                        {/* Grid de Contenido */}
                        <div className="dv-grid-wrapper">
                            {loading && devocionales.length === 0 ? (
                                <div className="dv-loading"><Spinner /></div>
                            ) : devocionales.length === 0 ? (
                                <div className="dv-empty">
                                    <div className="dv-empty__icon">📖</div>
                                    <p>No se encontraron devocionales.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="cards-container">
                                        {devocionales.map((dev) => (
                                            <CardNew
                                                key={dev.id}
                                                dev={{
                                                    ...dev,
                                                    titulo: obtenerPrimerEtiqueta(decodeHtmlEntities(dev.contenido)),
                                                    autor: dev.autor || 'Redacción',
                                                }}
                                                todasLasCategorias={todasLasCategorias}
                                            />
                                        ))}
                                    </div>
                                    {renderPaginator()}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <FilterSheet
                isOpen={sheetOpen}
                onClose={() => setSheetOpen(false)}
                categories={categories}
                total={totalResults}
                pendingCategory={pendingCategory}
                pendingSort={pendingSort}
                onCategoryChange={setPendingCategory}
                onSortChange={setPendingSort}
                onApply={() => {
                    setSelectedCategory(pendingCategory);
                    setSort(pendingSort);
                    setSheetOpen(false);
                }}
                onClear={() => {
                    setPendingCategory(null);
                    setPendingSort('latest');
                }}
            />
        </PageLayout>
    );
}

export default Devocionals;