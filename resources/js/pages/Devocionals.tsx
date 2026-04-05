import CardNew from '@/components/CardNew';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import FilterSheet from '@/components/ui/FilterSheet';
import { useEffect, useState } from 'react';
import '../../css/main.css';

type Category = {
    categoria: string;
    count: number;
};

type Devocional = {
    id: string;
    contenido: string;
    imagen: string;
    categoria: string;
    created_at?: string;
    views_count?: number;
    [key: string]: string | number | undefined;
};

type DevocionalesResponse = {
    data: Devocional[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

type Serie = {
    nombre: string;
    categorias: { categoria: string; count: number }[];
};

const categoryColorMap: Record<string, string> = {
    'general': '#77d7b9',
    'biblia': '#ff6b6b',
    'oracion': '#4ecdc4',
    'fe': '#ffe66d',
    'reflexion': '#95e1d3',
};

function Devocionals() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [series, setSeries] = useState<Serie[]>([]);
    const [devocionales, setDevocionales] = useState<Devocional[]>([]);
    const [latestDevocionales, setLatestDevocionales] = useState<Devocional[]>([]);
    const [pagination, setPagination] = useState<Partial<DevocionalesResponse>>({});
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [devocionalSeleccionado, setDevocionalSeleccionado] = useState<Devocional | null>(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [query, setQuery] = useState(searchTerm);
    const [sort, setSort] = useState<'latest' | 'likes' | 'views'>('latest');
    const [sheetOpen, setSheetOpen] = useState(false);
    const [pendingCategory, setPendingCategory] = useState<string | null>(null);
    const [pendingSort, setPendingSort] = useState<'latest' | 'likes' | 'views'>('latest');

    // Fetch devocionales (paginación y search siempre backend)
    useEffect(() => {
        setLoading(true);

        // Cancelar peticiones anteriores si cambia algo rápido
        const controller = new AbortController();

        let url = '';
        if (query.trim() !== '') {
            // Si tu backend usa ?query= en lugar de ?search= cámbialo aquí:
            url = `/devocionales-search?search=${encodeURIComponent(query)}&page=${page}&sort=${sort}`;
        } else if (selectedCategory) {
            url = `/devocionales/categoria/${encodeURIComponent(selectedCategory)}?page=${page}&sort=${sort}`;
        } else {
            url = `/devocionales-search?page=${page}&sort=${sort}`;
        }

        fetch(url, { signal: controller.signal })
            .then((r) => r.json())
            .then((data) => {
                if (!selectedCategory && query.trim() === '') {
                    setCategories(data.categorias || []);
                    // setSeries(data.series || []);
                    setTotal(data.devocionales?.total || 0);
                }

                if (data.devocionales) {
                    setDevocionales(data.devocionales.data || []);
                    setPagination(data.devocionales);
                } else if (data.data) {
                    setDevocionales(data.data || []);
                    setPagination(data);
                }
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    console.error('Error en fetch:', err);
                }
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [selectedCategory, page, query, sort]); // <- SIN searchTerm

    // Fetch latest posts (no depende del search)
    useEffect(() => {
        fetch('devocionals-latest')
            .then((response) => response.json())
            .then((data) => {
                setLatestDevocionales(data);
            })
            .catch((error) => {
                console.error('Error fetching latest devocionales:', error);
            });
    }, []);

    const handleSelectCategory = (cat: string | null) => {
        setSelectedCategory(cat);
        setPage(1);
        setSearchTerm('');
        setQuery(''); // <- reset del query para listar por categoría
    };

    // const limpiarBusqueda = () => {
    //     setSearchTerm('');
    //     setQuery(''); // <- limpia el término que dispara el fetch
    //     setPage(1);
    // };

    const abrirModal = (devocional: Devocional) => {
        setDevocionalSeleccionado(devocional);
        setModalOpen(true);
        window.history.pushState({}, '', `?devocional=${devocional.id}`);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setDevocionalSeleccionado(null);
        window.history.pushState({}, '', window.location.pathname);
    };

    const decodeHtmlEntities = (str: string): string => {
        const txt = document.createElement('textarea');
        txt.innerHTML = str;
        return txt.value;
    };

    const obtenerPrimerEtiqueta = (html: string) => {
        const match = html.match(/<([a-zA-Z0-9]+)[^>]*>(.*?)<\/\1>/i);
        if (match) {
            const innerText = match[2].replace(/<[^>]+>/g, '');
            return innerText;
        }
        return '';
    };

    const TituloDevocional = ({ contenido }: { contenido: string }) => {
        const titulo = obtenerPrimerEtiqueta(contenido);
        return <div style={{ justifyContent: 'start', display: 'flex', paddingTop: '20px' }} dangerouslySetInnerHTML={{ __html: titulo }} />;
    };

    // Paginador (backend)
    const renderPaginator = () => {
        if (!pagination.last_page || pagination.last_page <= 1) return null;
        const pages = [];
        const maxPagesToShow = 5;
        let start = Math.max(1, (pagination.current_page || 1) - 2);
        const end = Math.min(pagination.last_page, start + maxPagesToShow - 1);
        if (end - start < maxPagesToShow - 1) {
            start = Math.max(1, end - maxPagesToShow + 1);
        }
        for (let i = start; i <= end; i++) {
            pages.push(
                <button
                    key={i}
                    className={`paginator-btn ${pagination.current_page === i ? 'active' : ''}`}
                    onClick={() => setPage(i)}
                    disabled={pagination.current_page === i}
                    style={{
                        margin: '0 3px',
                        padding: '5px 10px',
                        background: pagination.current_page === i ? '#007bff' : '#f0f0f0',
                        color: pagination.current_page === i ? '#fff' : '#333',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: pagination.current_page === i ? 'default' : 'pointer',
                    }}
                >
                    {i}
                </button>,
            );
        }
        return (
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <button
                    onClick={() => setPage((pagination.current_page || 2) - 1)}
                    disabled={pagination.current_page === 1}
                    style={{ marginRight: '5px' }}
                >
                    &laquo; Anterior
                </button>
                {pages}
                <button
                    onClick={() => setPage((pagination.current_page || 0) + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    style={{ marginLeft: '5px' }}
                >
                    Siguiente &raquo;
                </button>
            </div>
        );
    };

    const PAGE_LIMIT = 16; // Cambia este valor si tu backend usa otro límite

    const showPaginator = () => {
        if (!searchTerm.trim()) {
            // No hay búsqueda, muestra paginador si hay más de una página
            return pagination.last_page && pagination.last_page > 1;
        }
        // Hay búsqueda, solo muestra paginador si el total de resultados es más que el límite por página
        return devocionales.length > PAGE_LIMIT && (pagination.last_page ?? 0) > 1;
    };
    // const SearchWidget = () => (
    //     <div className="search-widget widget-item">
    //         <h3 className="widget-title">Search</h3>

    //         <form
    //             onSubmit={(e) => {
    //                 e.preventDefault(); // <- evita recargar la página
    //                 setPage(1);
    //                 setQuery(searchTerm.trim()); // <- dispara el fetch
    //             }}
    //             style={{ display: 'flex', gap: 8, alignItems: 'center' }}
    //         >
    //             <input
    //                 type="text"
    //                 value={searchTerm}
    //                 onChange={(e) => setSearchTerm(e.target.value)} // <- NO dispara fetch
    //                 placeholder="Buscar devocional..."
    //             />
    //             <button type="submit">Buscar</button>

    //             {searchTerm && (
    //                 <button type="button" onClick={limpiarBusqueda} title="Limpiar búsqueda">
    //                     Limpiar
    //                 </button>
    //             )}
    //         </form>
    //     </div>
    // );

    const handleSortChange = (newSort: 'likes' | 'views') => {
        setSort(prev => prev === newSort ? 'latest' : newSort);
        setPage(1);
    };

    // Sticky bar — va donde estaba top-categories-sticky-wrapper
    const FilterBar = () => {
        const catLabel = selectedCategory
            ? categories.find(c => c.categoria === selectedCategory)?.categoria ?? 'Todas'
            : 'Todas';
        const sortLabel = sort === 'likes' ? 'Likes' : sort === 'views' ? 'Vistas' : 'Recientes';
        const hasFilter = selectedCategory !== null || sort !== 'latest';

        return (
            <div style={{
                position: 'sticky', top: 0, zIndex: 20,
                background: '#fff',
                borderBottom: '1px solid #ebebeb',
                padding: '10px 56px 10px 0px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#999' }}>
                        {total} devocionales
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Chip que resume filtros activos */}
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
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCategory(null);
                                        setSort('latest');
                                        setPendingCategory(null);
                                        setPendingSort('latest');
                                        setPage(1);
                                    }}
                                    style={{ cursor: 'pointer', opacity: 0.8, fontSize: 13, marginLeft: 2 }}
                                >
                                    ✕
                                </span>
                            )}
                        </div>

                        {/* Botón filtrar */}
                        <button
                            onClick={() => {
                                setPendingCategory(selectedCategory);
                                setPendingSort(sort);
                                setSheetOpen(true);
                            }}
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
        );
    };


    // const RecentPostsWidget = () => (
    //     <div className="recent-posts-widget widget-item">
    //         <h3 className="widget-title">Recent Posts</h3>
    //         {latestDevocionales.map((post, idx) => (
    //             <div className="post-item" key={idx}>
    //                 <img src={post.imagen} alt="" className="flex-shrink-0" />
    //                 <div>
    //                     <h4 style={{ color: '#212529' }} className="recent-post-title">
    //                         <button onClick={() => abrirModal(post)}>
    //                             <TituloDevocional contenido={post.contenido} />
    //                             <time dateTime="2020-01-01">
    //                                 {post.created_at
    //                                     ? new Date(post.created_at).toLocaleDateString('es-ES', {
    //                                         weekday: 'long',
    //                                         year: 'numeric',
    //                                         month: 'long',
    //                                         day: 'numeric',
    //                                     })
    //                                     : ''}
    //                             </time>
    //                         </button>
    //                     </h4>
    //                     <time dateTime="2020-01-01">{post.date}</time>
    //                 </div>
    //             </div>
    //         ))}
    //     </div>
    // );

    const todasLasCategorias = categories.map(cat =>
        cat.categoria.trim().toLowerCase()
    ).sort();

    return (
        <div className="blog-details-page">
            <Header />
            <main className="main">
                <div className="page-title">
                    <div className="breadcrumbs"></div>
                    <div className="title-wrapper">
                        <h1>Encuentra la respuesta que Dios envía hoy a tu vida</h1>
                        <p style={{ fontStyle: 'italic' }}>
                            “Tal vez no nos damos cuenta, pero Dios no deja de hablarnos" <span style={{ fontWeight: 'bold' }}>Job 33:14 TLA</span>
                        </p>
                    </div>
                </div>

                <div className="container">
                    <div className="row">
                        {/* Columna de ancho completo */}
                        <div className="col-12">

                            {/* 1. Widget de Categorías ubicado arriba */}
                            <div className="top-categories-sticky-wrapper">
                                <div className="container">
                                    <FilterBar />
                                </div>
                            </div>

                            <section id="blog-details" className="blog-grid section pt-0">
                                <div className="container p-0">
                                    {loading ? (
                                        <div style={{ textAlign: 'center', padding: '40px' }}>
                                            <div id="preloader" className="d-flex align-items-center justify-content-center">
                                                <div className="spinner-border" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : devocionales.length === 0 ? (
                                        <p>No hay devocionales para esta búsqueda.</p>
                                    ) : (
                                        <>
                                            <div style={{ paddingBottom: '20px', marginBottom: '20px' }}>
                                                <h2 style={{ color: '#212529', fontSize: '1.5rem', borderLeft: '4px solid var(--accent-color)', paddingLeft: '15px' }}>
                                                    {searchTerm
                                                        ? `Resultados de búsqueda "${searchTerm}"`
                                                        : selectedCategory
                                                            ? `Categoría - ${selectedCategory}`
                                                            : 'Todos los Devocionales'}
                                                </h2>
                                            </div>

                                            <div className="cards-container">
                                                {devocionales.map((devocional, idx) => (
                                                    <CardNew
                                                        key={devocional.id || idx}
                                                        dev={{
                                                            id: devocional.id,
                                                            imagen: devocional.imagen,
                                                            titulo: obtenerPrimerEtiqueta(decodeHtmlEntities(devocional.contenido)),
                                                            autor: String(devocional.autor ?? ''),
                                                            categoria: devocional.categoria,
                                                            views_count: devocional.views_count || 0,
                                                        }}
                                                        todasLasCategorias={todasLasCategorias}
                                                    />
                                                ))}
                                            </div>

                                            {showPaginator() && renderPaginator()}
                                        </>
                                    )}
                                </div>
                            </section>
                        </div>
                        {/* Nota: Se eliminó el sidebar lateral col-lg-4 para dar espacio completo */}
                    </div>
                </div>
            </main>
            <Footer />
            <FilterSheet
                isOpen={sheetOpen}
                onClose={() => setSheetOpen(false)}
                categories={categories}
                total={total}
                pendingCategory={pendingCategory}
                pendingSort={pendingSort}
                onCategoryChange={setPendingCategory}
                onSortChange={setPendingSort}
                onApply={() => {
                    setSelectedCategory(pendingCategory);
                    setSort(pendingSort);
                    setPage(1);
                    setSheetOpen(false);
                }}
                onClear={() => {
                    setPendingCategory(null);
                    setPendingSort('latest');
                }}
            />
        </div>
    );
}

export default Devocionals;
