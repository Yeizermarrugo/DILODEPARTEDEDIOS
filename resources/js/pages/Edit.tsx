import CardNew from '@/components/CardNew';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, Eye, GraduationCap, Hash, Pencil, PlusCircle, Search, Tv2, X } from 'lucide-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import '../../css/admin-edit.css';
import '../../css/cardNew.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Devocional {
    id: string;
    imagen: string;
    contenido: string;
    categoria: string;
    autor: string;
    is_devocional: number;
    hidden?: boolean;
    ensenanza_id?: string | null;
    views_count?: number;
    shares_count?: number;
    created_at?: string;
}

interface Pagination {
    data: Devocional[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Categoria { categoria: string; count: number }
interface Autor { autor: string; count: number }

interface PageProps {
    devocionales: Pagination;
    estudios: Pagination;
    series: Pagination;
    ocultos: Pagination;
    categorias: Categoria[];
    autores: Autor[];
    filters: { search?: string; categoria?: string; autor?: string };
    [key: string]: unknown;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const decodeHtml = (str: string): string => {
    if (!str) return '';
    if (typeof document === 'undefined') {
        return str
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
    }
    const el = document.createElement('textarea');
    el.innerHTML = str;
    return el.value;
};

const extractTitle = (html: string): string => {
    if (!html) return '';
    const match = html.match(/<([a-zA-Z0-9]+)[^>]*>(.*?)<\/\1>/i);
    if (match) return match[2].replace(/<[^>]+>/g, '');
    return html.replace(/<[^>]+>/g, '').slice(0, 80);
};

const getPublicUrl = (dev: Devocional): string | null => {
    if (dev.is_devocional === 1) return `/devocional/${dev.id}`;
    if (dev.is_devocional === 2 && dev.ensenanza_id) return `/series/${dev.ensenanza_id}`;
    if (dev.is_devocional === 3) return `/estudio-biblico/${dev.id}`;
    return null;
};

// ─── AdminCard ────────────────────────────────────────────────────────────────

function AdminCard({ dev, todasLasCategorias }: { dev: Devocional; todasLasCategorias: string[] }) {
    const publicUrl = dev.hidden ? null : getPublicUrl(dev);
    const processedDev = {
        ...dev,
        titulo: extractTitle(decodeHtml(dev.contenido)),
        autor: dev.autor || 'Redacción',
    };

    return (
        <div className="ae-card-wrap">
            <CardNew
                dev={processedDev}
                todasLasCategorias={todasLasCategorias}
                buildHref={(d) => `/devocionales-editar/${d.id}`}
                hideActions
            />
            <div className="ae-card-actions">
                <a href={`/devocionales-editar/${dev.id}`} className="ae-card-btn ae-card-btn--edit">
                    <Pencil size={11} />
                    Editar
                </a>
                {publicUrl ? (
                    <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ae-card-btn ae-card-btn--view"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Eye size={11} />
                        Ver
                    </a>
                ) : (
                    <span className="ae-card-hidden-badge">Oculto</span>
                )}
            </div>
        </div>
    );
}

// ─── Paginator ────────────────────────────────────────────────────────────────

function Paginator({
    paginator,
    paramName,
    filters,
}: {
    paginator: Pagination;
    paramName: string;
    filters: Record<string, string>;
}) {
    const { current_page: cur, last_page: last, total } = paginator;
    if (last <= 1) return null;

    const go = (page: number) =>
        router.get('/devocionales-edit', { ...filters, [paramName]: page }, { preserveState: true, preserveScroll: true });

    const pages = Array.from({ length: last }, (_, i) => i + 1).filter(
        (p) => p === 1 || p === last || Math.abs(p - cur) <= 1,
    );

    return (
        <div className="ae-pager">
            <span className="ae-pager__info">
                {total} resultados · pág. {cur} de {last}
            </span>
            <div className="ae-pager__btns">
                <button className="ae-pager__btn" onClick={() => go(cur - 1)} disabled={cur === 1}>
                    ‹
                </button>
                {pages.map((p, i) => (
                    <React.Fragment key={p}>
                        {i > 0 && pages[i - 1] !== p - 1 && (
                            <span className="ae-pager__dots">…</span>
                        )}
                        <button
                            className={`ae-pager__btn ${cur === p ? 'ae-pager__btn--active' : ''}`}
                            onClick={() => go(p)}
                        >
                            {p}
                        </button>
                    </React.Fragment>
                ))}
                <button className="ae-pager__btn" onClick={() => go(cur + 1)} disabled={cur === last}>
                    ›
                </button>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Contenido', href: '/devocionales-edit' },
];

type Tab = 'devocionales' | 'estudios' | 'series' | 'ocultos';

export default function Edit() {
    const { devocionales, estudios, series, ocultos, categorias, autores, filters } =
        usePage<PageProps>().props;

    const [activeTab, setActiveTab] = useState<Tab>('devocionales');
    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedCategoria, setSelectedCategoria] = useState(filters.categoria ?? '');
    const [selectedAutor, setSelectedAutor] = useState(filters.autor ?? '');

    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const buildParams = useCallback(
        (overrides: Record<string, string> = {}): Record<string, string> => {
            const base: Record<string, string> = {};
            if (search) base.search = search;
            if (selectedCategoria) base.categoria = selectedCategoria;
            if (selectedAutor) base.autor = selectedAutor;
            return { ...base, ...overrides };
        },
        [search, selectedCategoria, selectedAutor],
    );

    const applyFilters = useCallback((params: Record<string, string>) => {
        router.get('/devocionales-edit', params, { preserveState: true, preserveScroll: true });
    }, []);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            const p: Record<string, string> = {};
            if (value) p.search = value;
            if (selectedCategoria) p.categoria = selectedCategoria;
            if (selectedAutor) p.autor = selectedAutor;
            applyFilters(p);
        }, 380);
    };

    const handleCategoriaChange = (value: string) => {
        setSelectedCategoria(value);
        const p: Record<string, string> = {};
        if (search) p.search = search;
        if (value) p.categoria = value;
        if (selectedAutor) p.autor = selectedAutor;
        applyFilters(p);
    };

    const handleAutorChange = (value: string) => {
        setSelectedAutor(value);
        const p: Record<string, string> = {};
        if (search) p.search = search;
        if (selectedCategoria) p.categoria = selectedCategoria;
        if (value) p.autor = value;
        applyFilters(p);
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedCategoria('');
        setSelectedAutor('');
        applyFilters({});
    };

    const hasFilters = !!(search || selectedCategoria || selectedAutor);

    const todasLasCategorias = useMemo(
        () => categorias.map((c) => c.categoria.trim().toLowerCase()).sort(),
        [categorias],
    );

    const currentFilters = useMemo(() => buildParams(), [buildParams]);

    const tabs: { id: Tab; label: string; count: number; icon: React.ReactNode }[] = [
        { id: 'devocionales', label: 'Devocionales', count: devocionales.total, icon: <BookOpen size={13} /> },
        { id: 'estudios', label: 'Estudios', count: estudios.total, icon: <GraduationCap size={13} /> },
        { id: 'series', label: 'Series', count: series.total, icon: <Tv2 size={13} /> },
        { id: 'ocultos', label: 'Ocultos', count: ocultos.total, icon: <Hash size={13} /> },
    ];

    const sectionMap = {
        devocionales: { data: devocionales, param: 'devocionales_page' },
        estudios: { data: estudios, param: 'estudios_page' },
        series: { data: series, param: 'series_page' },
        ocultos: { data: ocultos, param: 'ocultos_page' },
    } as const;

    const activeSection = sectionMap[activeTab];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Contenido" />

            <div className="ae-root">
                {/* ── Header ── */}
                <div className="ae-header">
                    <div className="ae-header__left">
                        <div className="ae-header__accent" />
                        <div>
                            <h1 className="ae-header__title">Gestión de Contenido</h1>
                            <p className="ae-header__sub">
                                {devocionales.total + estudios.total + series.total + ocultos.total} publicaciones en total
                            </p>
                        </div>
                    </div>
                    <Link href="/devocionalesAgregar" className="ae-btn-new">
                        <PlusCircle size={15} />
                        Nuevo contenido
                    </Link>
                </div>

                {/* ── Toolbar: Tabs + Filters ── */}
                <div className="ae-toolbar">
                    <div className="ae-tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`ae-tab ${activeTab === tab.id ? 'ae-tab--active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.icon}
                                {tab.label}
                                <span className="ae-tab__count">{tab.count}</span>
                            </button>
                        ))}
                    </div>

                    <div className="ae-filters">
                        {/* Search */}
                        <div className="ae-search">
                            <Search size={13} className="ae-search__icon" />
                            <input
                                className="ae-search__input"
                                placeholder="Buscar contenido..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                            {search && (
                                <button className="ae-search__clear" onClick={() => handleSearchChange('')}>
                                    <X size={11} />
                                </button>
                            )}
                        </div>

                        {/* Category */}
                        <select
                            className="ae-select"
                            value={selectedCategoria}
                            onChange={(e) => handleCategoriaChange(e.target.value)}
                        >
                            <option value="">Todas las categorías</option>
                            {categorias.map((c) => (
                                <option key={c.categoria} value={c.categoria}>
                                    {c.categoria} ({c.count})
                                </option>
                            ))}
                        </select>

                        {/* Author */}
                        <select
                            className="ae-select"
                            value={selectedAutor}
                            onChange={(e) => handleAutorChange(e.target.value)}
                        >
                            <option value="">Todos los autores</option>
                            {autores.map((a) => (
                                <option key={a.autor} value={a.autor}>
                                    {a.autor} ({a.count})
                                </option>
                            ))}
                        </select>

                        {hasFilters && (
                            <button className="ae-btn-clear" onClick={clearFilters}>
                                <X size={12} />
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Active filter chips ── */}
                {hasFilters && (
                    <div className="ae-chips">
                        <span className="ae-chips__label">Filtrando:</span>
                        {search && <span className="ae-chip">"{search}"</span>}
                        {selectedCategoria && <span className="ae-chip">{selectedCategoria}</span>}
                        {selectedAutor && <span className="ae-chip">{selectedAutor}</span>}
                        <span className="ae-chips__count">· {activeSection.data.total} resultados</span>
                    </div>
                )}

                {/* ── Content ── */}
                <div className="ae-content">
                    {activeSection.data.data.length === 0 ? (
                        <div className="ae-empty">
                            <div className="ae-empty__icon">📭</div>
                            <p className="ae-empty__text">No hay contenido en esta sección</p>
                            {hasFilters && (
                                <button
                                    className="ae-btn-clear"
                                    onClick={clearFilters}
                                    style={{ marginTop: 14 }}
                                >
                                    <X size={12} />
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="ae-grid">
                                {activeSection.data.data.map((dev) => (
                                    <AdminCard
                                        key={dev.id}
                                        dev={dev}
                                        todasLasCategorias={todasLasCategorias}
                                    />
                                ))}
                            </div>
                            <Paginator
                                paginator={activeSection.data}
                                paramName={activeSection.param}
                                filters={currentFilters}
                            />
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
