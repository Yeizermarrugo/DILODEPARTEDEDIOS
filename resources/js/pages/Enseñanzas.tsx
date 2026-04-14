import EnsenanzaCard from '@/components/EnsenanzaCard';
import Paginator from '@/components/Paginator';
import PageHero from '@/components/PageHero';
import PageLayout from '@/components/PageLayout';
import Spinner from '@/components/Spinner';
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
            url = `/series-search?search=${encodeURIComponent(query)}&page=${page}`;
        } else {
            url = `/series-search?page=${page}`;
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
        <PageLayout className="blog-details-page">
            <PageHero showBreadcrumbs>
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
            </PageHero>
            <main className="main">

                <div className="container">
                    <div className="row">
                        <div className="col-sm-12">
                            <section id="ensenanzas-list" className="blog-grid section">
                                <div className="container" data-aos="fade-up">
                                    {loading ? (
                                        <div style={{ textAlign: 'center', padding: '40px' }}>
                                            <Spinner />
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
                                                    return <EnsenanzaCard key={ens.id} ensenanza={ens} />;
                                                })}
                                            </div>

                                            {showPaginator() && <Paginator pagination={pagination} onPageChange={setPage} />}
                                        </>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
        </PageLayout>
    );
}

export default Enseñanzas;
