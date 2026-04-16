import EnsenanzaCard from '@/components/EnsenanzaCard';
import Spinner from '@/components/Spinner';
import { JSX, useEffect, useMemo, useRef, useState } from 'react';

import PageLayout from '@/components/PageLayout';
import '../../css/enseñanzas.css';
import '../../css/main.css';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type EnsenanzaItem = {
    id: string;
    slug: string;
    titulo: string;
    descripcion: string;
    imagen: string | null;
    ensenanzas_count: number;
    autores: string[];
};

type EnsenanzasResponse = {
    data: EnsenanzaItem[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const ChevLeft = () => (
    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <path d="M15 18l-6-6 6-6" />
    </svg>
);

const ChevRight = () => (
    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <path d="M9 18l6-6-6-6" />
    </svg>
);

// ─── Hook: debounce ───────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState<T>(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

// ─── Componente Principal ─────────────────────────────────────────────────────

function Enseñanzas() {
    const [ensenanzas, setEnsenanzas] = useState<EnsenanzaItem[]>([]);
    const [pagination, setPagination] = useState<Partial<EnsenanzasResponse>>({});
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const debouncedSearch = useDebounce(searchTerm, 350);

    // Resetear página cuando cambia la búsqueda
    useEffect(() => { setPage(1); }, [debouncedSearch]);

    // ── Fetch Data ────────────────────────────────────────────────────────────
    useEffect(() => {
        const controller = new AbortController();
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: String(page),
                    ...(debouncedSearch.trim() && { search: debouncedSearch.trim() })
                });

                const url = `/series-search?${params.toString()}`;
                const response = await fetch(url, { signal: controller.signal });
                const data = await response.json();

                // Manejo flexible de la respuesta del backend
                const items = data.data || data.devocionales;
                setEnsenanzas(Array.isArray(items) ? items : []);
                setPagination(data);
            } catch (err: unknown) {
                if ((err as Error).name !== 'AbortError') console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [page, debouncedSearch]);

    // ── Valores Derivados ─────────────────────────────────────────────────────

    const totalSeries = pagination.total ?? ensenanzas.length;

    const stats = useMemo(() => {
        const totalEns = ensenanzas.reduce((s, e) => s + (e.ensenanzas_count ?? 0), 0);
        const totalAutores = new Set(ensenanzas.flatMap((e) => e.autores)).size;
        return { totalEns, totalAutores };
    }, [ensenanzas]);

    // ── Render Helpers ───────────────────────────────────────────────────────

    const renderPaginator = () => {
        if (!pagination.last_page || pagination.last_page <= 1) return null;
        const last = pagination.last_page;
        const cur = pagination.current_page ?? 1;

        const pages: JSX.Element[] = [];
        const maxShow = 5;
        let start = Math.max(1, cur - 2);
        const end = Math.min(last, start + maxShow - 1);
        if (end - start < maxShow - 1) start = Math.max(1, end - maxShow + 1);

        for (let i = start; i <= end; i++) {
            pages.push(
                <button
                    key={i}
                    className={`ens-page-btn ${cur === i ? 'ens-page-btn--active' : ''}`}
                    onClick={() => setPage(i)}
                    disabled={cur === i}
                >{i}</button>
            );
        }

        return (
            <div className="ens-paginator">
                <button className="ens-page-btn" onClick={() => setPage(cur - 1)} disabled={cur === 1}>
                    <ChevLeft />
                </button>
                {start > 1 && (
                    <>
                        <button className="ens-page-btn" onClick={() => setPage(1)}>1</button>
                        <span className="ens-paginator-dots">···</span>
                    </>
                )}
                {pages}
                {end < last && (
                    <>
                        <span className="ens-paginator-dots">···</span>
                        <button className="ens-page-btn" onClick={() => setPage(last)}>{last}</button>
                    </>
                )}
                <button className="ens-page-btn" onClick={() => setPage(cur + 1)} disabled={cur === last}>
                    <ChevRight />
                </button>
            </div>
        );
    };

    return (
        <PageLayout>
            <div className="ens-page">
                <main>
                    {/* ── HERO ── */}
                    <section className="ens-hero">
                        <div className="ens-hero__inner">
                            <div className="ens-hero__content">
                                <div className="ens-hero__eyebrow">Recursos Teológicos</div>
                                <h1 className="ens-hero__title">Series Temáticas</h1>

                                <div className="ens-hero__description-box">
                                    <p className="ens-hero__text">
                                        En esta sección encontrarás enseñanzas basadas en la Palabra de Dios, organizadas en series,
                                        donde se desarrollan temas y principios bíblicos para comprender mejor la fe y vivir conforme a la verdad.
                                    </p>
                                    <div className="ens-hero__verse-v2">
                                        <p>“La exposición de tus palabras alumbra; hace entender a los simples.”</p>
                                        <strong>Salmos 119:130 RVR1960</strong>
                                    </div>
                                </div>
                            </div>

                            {!loading && ensenanzas.length > 0 && (
                                <div className="ens-hero__stats">
                                    <div className="ens-hero__stat">
                                        <div className="ens-hero__stat-num">{totalSeries}</div>
                                        <div className="ens-hero__stat-lbl">Series</div>
                                    </div>
                                    <div className="ens-hero__stat">
                                        <div className="ens-hero__stat-num">{stats.totalEns}</div>
                                        <div className="ens-hero__stat-lbl">Enseñanzas</div>
                                    </div>
                                    {stats.totalAutores > 0 && (
                                        <div className="ens-hero__stat">
                                            <div className="ens-hero__stat-num">{stats.totalAutores}</div>
                                            <div className="ens-hero__stat-lbl">Autores</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ── SECCIÓN DE CONTENIDO ── */}
                    <section className="ens-section">
                        <div className="ens-section__topbar">
                            <div className="ens-section__heading">
                                <div className="ens-section__accent" />
                                <h2 className="ens-section__title">
                                    {debouncedSearch.trim() ? `Resultados de "${debouncedSearch.trim()}"` : 'Todas las series'}
                                </h2>
                            </div>

                            <div className="ens-section__actions">
                                <div className="dv-search">
                                    <svg className="dv-search__icon" viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                                    </svg>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="dv-search__input"
                                        placeholder="Buscar serie..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoComplete="off"
                                    />
                                    {loading && searchTerm && <div className="dv-search__spinner" />}
                                    {!loading && searchTerm && (
                                        <button className="dv-search__clear" onClick={() => { setSearchTerm(''); inputRef.current?.focus(); }}>✕</button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {loading && ensenanzas.length === 0 ? (
                            <div className="ens-loading">
                                <Spinner />
                            </div>
                        ) : (
                            <>
                                <div className="ens-grid">
                                    {ensenanzas.length > 0 ? (
                                        ensenanzas.map((ens) => (
                                            <EnsenanzaCard key={ens.id} ensenanza={ens} />
                                        ))
                                    ) : (
                                        <div className="ens-empty">
                                            <p>No se encontraron series para esta búsqueda.</p>
                                        </div>
                                    )}
                                </div>
                                {renderPaginator()}
                            </>
                        )}
                    </section>
                </main>
            </div>

        </PageLayout>
    );
}

export default Enseñanzas;