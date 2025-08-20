import DevocionalCard from '@/components/DevocionalCard';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useEffect, useState } from 'react';
import '../../css/main.css';
import DevocionalDetails from './DevocionalDetails';

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
    [key: string]: string | undefined;
};

// Paginación: type para la respuesta paginada
type DevocionalesResponse = {
    data: Devocional[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    // Otros campos si necesitas
};

function Devocionals() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [devocionales, setDevocionales] = useState<Devocional[]>([]);
    const [latestDevocionales, setLatestDevocionales] = useState<Devocional[]>([]);
    const [pagination, setPagination] = useState<Partial<DevocionalesResponse>>({});
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [devocionalSeleccionado, setDevocionalSeleccionado] = useState<Devocional | null>(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    // Fetch devocionales (general o por categoría)
    const fetchDevocionales = (categoria: string | null, pageNumber: number = 1) => {
        setLoading(true);
        let url = '';
        if (categoria) {
            url = `/devocionales/categoria/${encodeURIComponent(categoria)}?page=${pageNumber}`;
        } else {
            url = `/devocionales-search?page=${pageNumber}`;
        }
        fetch(url)
            .then((r) => r.json())
            .then((data) => {
                // Si es general, trae categorias y devocionales
                if (!categoria) {
                    setCategories(data.categorias || []);
                    setTotal(data.devocionales.total || 0);
                }
                // Si es por categoría, puede que solo traiga devocionales
                if (data.devocionales) {
                    setDevocionales(data.devocionales.data || []);
                    setPagination(data.devocionales);
                } else if (data.data) {
                    setDevocionales(data.data || []);
                    setPagination(data);
                }
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchDevocionales(selectedCategory, page);
        fetch('devocionals-latest')
            .then((response) => response.json())
            .then((data) => {
                setLatestDevocionales(data);
            })
            .catch((error) => {
                console.error('Error fetching latest devocionales:', error);
            });
    }, [selectedCategory, page]);

    // Cambio de categoría: resetea page a 1
    const handleSelectCategory = (cat: string | null) => {
        setSelectedCategory(cat);
        setPage(1);
    };

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

    const obtenerPrimerEtiqueta = (html: string) => {
        const match = html.match(/<([a-zA-Z0-9]+)[^>]*>(.*?)<\/\1>/i);
        if (match) {
            // match[2] es el contenido dentro de la etiqueta
            // Si ese contenido tiene HTML, lo eliminamos también
            const innerText = match[2].replace(/<[^>]+>/g, '');
            return innerText;
        }
        return '';
    };
    const TituloDevocional = ({ contenido }: { contenido: string }) => {
        const titulo = obtenerPrimerEtiqueta(contenido);
        return <div style={{ justifyContent: 'start', display: 'flex', paddingTop: '20px' }} dangerouslySetInnerHTML={{ __html: titulo }} />;
    };

    // Paginador dinámico
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
                        {/* Blog Content */}
                        <div className="col-sm-8">
                            <section id="blog-details" className="blog-grid section">
                                <div className="container" data-aos="fade-up">
                                    {loading ? (
                                        <div style={{ textAlign: 'center', padding: '40px' }}>
                                            <div id="preloader" className="d-flex align-items-center justify-content-center">
                                                <div className="spinner-border" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : devocionales.length === 0 ? (
                                        <p>No hay devocionales para esta categoría.</p>
                                    ) : (
                                        <>
                                            <div style={{ paddingBottom: '30px', marginBottom: '30px' }}>
                                                <h2 style={{ color: '#212529' }}>
                                                    {selectedCategory ? `Categoría - ${selectedCategory}` : 'Todos los Devocionales'}
                                                </h2>
                                            </div>
                                            <div className="cards-container">
                                                {devocionales.map((devocional, index) => (
                                                    <a href={`/devocional/${devocional.id}`} style={{ textDecoration: 'none' }}>
                                                        <DevocionalCard
                                                            key={index}
                                                            devocionales={[
                                                                {
                                                                    ...devocional,
                                                                    titulo: obtenerPrimerEtiqueta(devocional.contenido),
                                                                    contenido: devocional.contenido,
                                                                },
                                                            ]}
                                                        />
                                                    </a>
                                                ))}
                                            </div>

                                            {renderPaginator()}
                                        </>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Modal */}
                        {modalOpen && devocionalSeleccionado && (
                            <div
                                className="modal-overlay"
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    width: '100vw',
                                    height: '100vh',
                                    background: 'rgba(0, 0, 0, 0.7)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1000,
                                    overflow: 'auto',
                                }}
                                onClick={cerrarModal}
                            >
                                <div
                                    className="modal-content"
                                    style={{
                                        background: '#fff',
                                        padding: '24px',
                                        borderRadius: '8px',
                                        maxWidth: '800px',
                                        width: '100%',
                                        position: 'relative',
                                        maxHeight: '90vh',
                                        overflowY: 'auto',
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '1.5em',
                                            cursor: 'pointer',
                                        }}
                                        onClick={cerrarModal}
                                    >
                                        &times;
                                    </button>
                                    <DevocionalDetails devocional={devocionalSeleccionado} />
                                </div>
                            </div>
                        )}
                        {/* Sidebar */}
                        <div className="col-lg-4 sidebar">
                            <div className="widgets-container" data-aos="fade-up" data-aos-delay="200">
                                {/* Search Widget */}
                                <div className="search-widget widget-item">
                                    <h3 className="widget-title">Search</h3>
                                    <form action="">
                                        <input type="text" />
                                        <button type="submit" title="Search">
                                            <i className="bi bi-search"></i>
                                        </button>
                                    </form>
                                </div>
                                {/* Categories Widget */}
                                <div className="categories-widget widget-item">
                                    <h3 className="widget-title">Categories</h3>
                                    <ul className="mt-3">
                                        <li>
                                            <button
                                                className={selectedCategory === null ? 'active' : ''}
                                                onClick={() => handleSelectCategory(null)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                                            >
                                                Todas <span>({total})</span>
                                            </button>
                                        </li>
                                        {categories.map((cat) => (
                                            <li key={cat.categoria}>
                                                <button
                                                    className={selectedCategory === cat.categoria ? 'active' : ''}
                                                    onClick={() => handleSelectCategory(cat.categoria)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                                                >
                                                    {cat.categoria} <span>({cat.count})</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {/* Recent Posts Widget */}
                                <div className="recent-posts-widget widget-item">
                                    <h3 className="widget-title">Recent Posts</h3>
                                    {latestDevocionales.map((post, idx) => (
                                        <div className="post-item" key={idx}>
                                            <img src={post.imagen} alt="" className="flex-shrink-0" />
                                            <div>
                                                <h4 style={{ color: '#212529' }} className="recent-post-title">
                                                    <button onClick={() => abrirModal(post)}>
                                                        <TituloDevocional contenido={post.contenido} />
                                                        <time dateTime="2020-01-01">
                                                            {post.created_at
                                                                ? new Date(post.created_at).toLocaleDateString('es-ES', {
                                                                      year: 'numeric',
                                                                      month: 'long',
                                                                      day: 'numeric',
                                                                  })
                                                                : ''}
                                                        </time>
                                                    </button>
                                                </h4>
                                                <time dateTime="2020-01-01">{post.date}</time>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Tags Widget */}
                                {/* <div className="tags-widget widget-item">
                                    <h3 className="widget-title">Tags</h3>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default Devocionals;
