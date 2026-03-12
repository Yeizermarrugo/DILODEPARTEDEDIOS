import EnsenanzaCard from '@/components/EnsenanzaCard';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useEffect, useState } from 'react';
import '../../css/main.css';

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
    next_page_url: string | null;
    prev_page_url: string | null;
};

function Enseñanzas() {
    const [ensenanzas, setEnsenanzas] = useState<EnsenanzaItem[]>([]);
    const [pagination, setPagination] = useState<Partial<EnsenanzasResponse>>({});
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [query, setQuery] = useState('');

    useEffect(() => {
        setLoading(true);
        const controller = new AbortController();

        let url = '';
        if (query.trim() !== '') {
            url = `/ensenanzas-search?search=${encodeURIComponent(query)}&page=${page}`;
        } else {
            url = `/ensenanzas-search?page=${page}`;
        }

        fetch(url, { signal: controller.signal })
            .then((r) => r.json())
            .then((data: EnsenanzasResponse | any) => {
                if (Array.isArray(data.data)) {
                    setEnsenanzas(data.data);
                    setPagination(data);
                } else if (Array.isArray(data.devocionales)) {
                    setEnsenanzas(data.devocionales);
                    setPagination(data);
                } else {
                    setEnsenanzas([]);
                    setPagination({});
                }
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    console.error('Error en fetch:', err);
                }
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [page, query]);

    const PAGE_LIMIT = 12;

    const showPaginator = () => {
        if (!pagination.last_page || pagination.last_page <= 1) return false;
        if (!searchTerm.trim()) return true;
        return (pagination.total ?? 0) > PAGE_LIMIT;
    };

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
                    « Anterior
                </button>
                {pages}
                <button
                    onClick={() => setPage((pagination.current_page || 0) + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    style={{ marginLeft: '5px' }}
                >
                    Siguiente »
                </button>
            </div>
        );
    };

    const onSubmitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setQuery(searchTerm.trim());
    };

    const limpiarBusqueda = () => {
        setSearchTerm('');
        setQuery('');
        setPage(1);
    };

    return (
        <div className="blog-details-page">
            <Header />
            <main className="main">
                <div className="page-title">
                    <div className="breadcrumbs" />
                    <div className="title-wrapper">
                        <h1 style={{ textAlign: 'center' }}>Series Temáticas</h1>
                        <br />
                        <p>
                            En esta sección encontrarás enseñanzas basadas en la Palabra de Dios, organizadas en series,
                            donde se desarrollan temas y principios bíblicos para comprender mejor la fe y vivir conforme a la verdad.
                        </p>
                        <br />
                        <p>
                            Nuestro propósito es guiar a los creyentes a profundizar en el conocimiento de la Palabra y crecer en discernimiento espiritual.
                        </p>
                        <br />
                        <p style={{ fontStyle: 'italic' }}>
                            “La exposición de tus palabras alumbra; hace entender a los simples.”{' '}
                            <span style={{ fontWeight: 'bold' }}>Salmos 119:130 RVR1960</span>
                        </p>
                    </div>
                </div>

                <div className="container">
                    <div className="row">
                        <div className="col-sm-12">
                            <section id="ensenanzas-list" className="blog-grid section">
                                <div className="container" data-aos="fade-up">
                                    {loading ? (
                                        <div style={{ textAlign: 'center', padding: '40px' }}>
                                            <div id="preloader" className="d-flex align-items-center justify-content-center">
                                                <div className="spinner-border" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : ensenanzas.length === 0 ? (
                                        <p>No hay enseñanzas para esta búsqueda.</p>
                                    ) : (
                                        <>
                                            {/* Título + buscador encima de las cards */}
                                            <div
                                                style={{
                                                    paddingBottom: '20px',
                                                    marginBottom: '20px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 12,
                                                }}
                                            >
                                                {/* <h2 style={{ color: '#212529', margin: 0 }}>
                                                    {searchTerm
                                                        ? `Resultados de búsqueda "${searchTerm}"`
                                                        : 'Series de enseñanzas'}
                                                </h2> */}

                                                {/* <form
                                                    onSubmit={onSubmitSearch}
                                                    style={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: 8,
                                                        alignItems: 'center',
                                                    }}
                                                > */}
                                                {/* <input
                                                        type="text"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        placeholder="Buscar enseñanza..."
                                                        style={{
                                                            flex: '1 1 220px',
                                                            minWidth: 0,
                                                            padding: '6px 10px',
                                                        }}
                                                    /> */}
                                                {/* <button type="submit">Buscar</button>
                                                    {searchTerm && (
                                                        <button
                                                            type="button"
                                                            onClick={limpiarBusqueda}
                                                            title="Limpiar búsqueda"
                                                        >
                                                            Limpiar
                                                        </button>
                                                    )} */}
                                                {/* </form> */}
                                            </div>

                                            {/* Cards */}
                                            <div className="ensenanzas-cards">
                                                {ensenanzas.map((ens) => {
                                                    if (ens.ensenanzas_count === 0) return null;
                                                    return <EnsenanzaCard key={ens.id} ensenanza={ens} />;
                                                })}
                                            </div>

                                            {showPaginator() && renderPaginator()}
                                        </>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default Enseñanzas;
