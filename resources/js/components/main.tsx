import DevocionalDetails from '@/pages/DevocionalDetails';
import { useEffect, useState } from 'react';

export default function MainContent() {
    interface Devocional {
        contenido: string;
        imagen: string;
        id?: number;
        created_at?: string;
        categoria?: string;
    }
    const [devocionales, setDevocionales] = useState<Devocional[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [devocionalSeleccionado, setDevocionalSeleccionado] = useState<Devocional | null>(null);

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

    useEffect(() => {
        let isMounted = true; // Para evitar actualizar el estado si el componente se desmonta

        // 1. Cargar devocionales solo si aún no están cargados
        if (loading) {
            fetch('/devocionals-latest')
                .then((res) => res.json())
                .then((data) => {
                    if (isMounted) {
                        setDevocionales(data);
                        setLoading(false);

                        // 2. Verificar el parámetro en la URL y abrir el modal si corresponde
                        const params = new URLSearchParams(window.location.search);
                        const id = params.get('devocional');
                        if (id) {
                            const encontrado = data.find((d: Devocional) => String(d.id) === id);
                            if (encontrado) {
                                setDevocionalSeleccionado(encontrado);
                                setModalOpen(true);
                            }
                        }
                    }
                });
        }

        // 3. Controlar el scroll del fondo según el estado del modal
        document.body.style.overflow = modalOpen ? 'hidden' : '';
        return () => {
            isMounted = false;
            document.body.style.overflow = '';
        };
    }, [loading, modalOpen]);

    const obtenerPrimerEtiqueta = (html: string) => {
        const match = html.match(/<([a-zA-Z0-9]+)[^>]*>(.*?)<\/\1>/i);
        if (match) {
            return match[0]; // Devuelve la primera etiqueta completa, con HTML
        }
        return '';
    };
    const TituloDevocional = ({ contenido }: { contenido: string }) => {
        const titulo = obtenerPrimerEtiqueta(contenido);
        return <div dangerouslySetInnerHTML={{ __html: titulo }} />;
    };

    const dev = devocionales.slice(0, 5);
    if (loading) {
        return (
            <div id="preloader" className="d-flex align-items-center justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }
    return (
        <main className="main">
            {/* Blog Hero Section */}
            <section id="blog-hero" className="blog-hero section">
                <div className="container" data-aos="fade-up" data-aos-delay="100">
                    <div className="blog-grid">
                        {/* Featured Post (Large) */}
                        <article className="blog-item featured" data-aos="fade-up">
                            <img src={dev[0].imagen} alt="Blog Image" className="img-fluid" />
                            <div className="blog-content">
                                <div className="post-meta">
                                    <span className="date">
                                        {dev[0].created_at
                                            ? new Date(dev[0].created_at).toLocaleDateString('es-ES', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                              })
                                            : ''}
                                    </span>
                                    {/* <span className="category">Technology</span> */}
                                </div>
                                <h2 className="devocional-title">
                                    <button onClick={() => abrirModal(dev[0])}>
                                        <TituloDevocional contenido={dev[0].contenido} />
                                    </button>
                                </h2>
                            </div>
                        </article>

                        {/* End Featured Post */}

                        {/* Regular Posts */}
                        <article className="blog-item" data-aos="fade-up" data-aos-delay="100">
                            <img src={dev[1].imagen} alt="Blog Image" className="img-fluid" />
                            <div className="blog-content">
                                <div className="post-meta">
                                    <span className="date">
                                        {dev[1].created_at
                                            ? new Date(dev[1].created_at).toLocaleDateString('es-ES', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                              })
                                            : ''}
                                    </span>
                                    {/* <span className="category">Security</span> */}
                                </div>
                                <h3 className="post-title">
                                    <button onClick={() => abrirModal(dev[1])}>
                                        <TituloDevocional contenido={dev[1].contenido} />
                                    </button>
                                </h3>
                            </div>
                        </article>
                        <article className="blog-item" data-aos="fade-up" data-aos-delay="100">
                            <img src={dev[2].imagen} alt="Blog Image" className="img-fluid" />
                            <div className="blog-content">
                                <div className="post-meta">
                                    <span className="date">
                                        {dev[2].created_at
                                            ? new Date(dev[2].created_at).toLocaleDateString('es-ES', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                              })
                                            : ''}
                                    </span>
                                    {/* <span className="category">Security</span> */}
                                </div>
                                <h3 className="post-title">
                                    <button onClick={() => abrirModal(dev[2])}>
                                        <TituloDevocional contenido={dev[2].contenido} />
                                    </button>
                                </h3>
                            </div>
                        </article>
                        <article className="blog-item" data-aos="fade-up" data-aos-delay="100">
                            <img src={dev[3].imagen} alt="Blog Image" className="img-fluid" />
                            <div className="blog-content">
                                <div className="post-meta">
                                    <span className="date">
                                        {dev[3].created_at
                                            ? new Date(dev[3].created_at).toLocaleDateString('es-ES', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                              })
                                            : ''}
                                    </span>
                                    {/* <span className="category">Security</span> */}
                                </div>
                                <h3 className="post-title">
                                    <button onClick={() => abrirModal(dev[3])}>
                                        <TituloDevocional contenido={dev[3].contenido} />
                                    </button>
                                </h3>
                            </div>
                        </article>
                        <article className="blog-item" data-aos="fade-up" data-aos-delay="100">
                            <img src={dev[4].imagen} alt="Blog Image" className="img-fluid" />
                            <div className="blog-content">
                                <div className="post-meta">
                                    <span className="date">
                                        {dev[4].created_at
                                            ? new Date(dev[4].created_at).toLocaleDateString('es-ES', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                              })
                                            : ''}
                                    </span>
                                    {/* <span className="category">Security</span> */}
                                </div>
                                <h3 className="post-title">
                                    <button onClick={() => abrirModal(dev[4])}>
                                        <TituloDevocional contenido={dev[4].contenido} />
                                    </button>
                                </h3>
                            </div>
                        </article>
                    </div>
                </div>
            </section>
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
                            maxHeight: '90vh', // Limita el alto
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
            {/* Featured Posts Section */}
            <section id="featured-posts" className="featured-posts section">
                <div className="section-title container" data-aos="fade-up">
                    <h2>PRÓXIMAMENTE</h2>
                    <div>
                        <span>MENSAJES QUE</span> <span className="description-title">TRANSFORMAN</span>
                    </div>
                </div>
                <div className="container" data-aos="fade-up" data-aos-delay="100">
                    <div className="blog-posts-slider swiper init-swiper">
                        {/* Swiper config script se ignora en React, usa librería Swiper para React si necesitas funcionalidad */}
                        <div className="swiper-wrapper">
                            {/* Repite los slides igual que en tu HTML original */}
                            <div className="swiper-slide">
                                <div className="blog-post-item">
                                    <img src="/assets/img/blog/YouTube-Banner.png" alt="Blog Image" />
                                    {/* <div className="blog-post-content">
                                        <div className="post-meta">
                                            <span>
                                                <i className="bi bi-person"></i> Julia Parker
                                            </span>
                                            <span>
                                                <i className="bi bi-clock"></i> Jan 15, 2025
                                            </span>
                                            <span>
                                                <i className="bi bi-chat-dots"></i> 6 Comments
                                            </span>
                                        </div>
                                        <h2>
                                            <a href="#">Neque porro quisquam est qui dolorem ipsum quia dolor sit amet</a>
                                        </h2>
                                        <p>
                                            Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce porttitor
                                            metus eget lectus consequat, sit amet feugiat magna vulputate.
                                        </p>
                                        <a href="#" className="read-more">
                                            Read More <i className="bi bi-arrow-right"></i>
                                        </a>
                                    </div> */}
                                </div>
                            </div>
                            {/* ...otros slides igual que en tu HTML original... */}
                        </div>
                    </div>
                </div>
            </section>
            {/* /Featured Posts Section */}

            {/* Category Section */}
            <section id="category-section" className="category-section section">
                <div className="section-title container" data-aos="fade-up">
                    <h2>Category Section</h2>
                    <div>
                        <span className="description-title">Category Section</span>
                    </div>
                </div>
                <div className="container" data-aos="fade-up" data-aos-delay="100">
                    {/* Featured Posts */}
                    <div className="row gy-4 mb-4">
                        {/* Repite las columnas igual que en tu HTML */}
                        <div className="col-lg-4">
                            <article className="featured-post">
                                <div className="post-img">
                                    <img src="/assets/img/blog/blog-post-6.webp" alt="" className="img-fluid" loading="lazy" />
                                </div>
                                <div className="post-content">
                                    <div className="category-meta">
                                        <span className="post-category">Health</span>
                                        <div className="author-meta">
                                            <img src="/assets/img/person/person-f-13.webp" alt="" className="author-img" />
                                            <span className="author-name">William G.</span>
                                            <span className="post-date">28 April 2024</span>
                                        </div>
                                    </div>
                                    <h2 className="title">
                                        <a href="blog-details.html">Sed ut perspiciatis unde omnis iste natus error sit voluptatem</a>
                                    </h2>
                                </div>
                            </article>
                        </div>
                        {/* ...otros col-lg-4 igual que en tu HTML... */}
                    </div>
                    {/* List Posts */}
                    <div className="row">
                        {/* Repite igual que en tu HTML */}
                        <div className="col-xl-4 col-lg-6">
                            <article className="list-post">
                                <div className="post-img">
                                    <img src="/assets/img/blog/blog-post-6.webp" alt="" className="img-fluid" loading="lazy" />
                                </div>
                                <div className="post-content">
                                    <div className="category-meta">
                                        <span className="post-category">Gaming</span>
                                    </div>
                                    <h3 className="title">
                                        <a href="blog-details.html">Quis autem vel eum iure reprehenderit qui in ea voluptate</a>
                                    </h3>
                                    <div className="post-meta">
                                        <span className="read-time">2 mins read</span>
                                        <span className="post-date">6 April 2026</span>
                                    </div>
                                </div>
                            </article>
                        </div>
                        {/* ...otros posts igual que en tu HTML... */}
                    </div>
                </div>
            </section>
            {/* /Category Section */}

            {/* Call To Action 2 Section */}
            <section id="call-to-action-2" className="call-to-action-2 section">
                <div className="container" data-aos="fade-up" data-aos-delay="100">
                    <div className="advertise-1 d-flex flex-column flex-lg-row align-items-center position-relative gap-4">
                        <div className="content-left flex-grow-1" data-aos="fade-right" data-aos-delay="200">
                            <span className="badge text-uppercase mb-2">Don't Miss</span>
                            <h2>Revolutionize Your Digital Experience Today</h2>
                            <p className="my-4">
                                Strategia accelerates your business growth through innovative solutions and cutting-edge technology. Join thousands of
                                satisfied customers who have transformed their operations.
                            </p>
                            <div className="features d-flex mb-4 flex-wrap gap-3">
                                <div className="feature-item">
                                    <i className="bi bi-check-circle-fill"></i>
                                    <span>Premium Support</span>
                                </div>
                                <div className="feature-item">
                                    <i className="bi bi-check-circle-fill"></i>
                                    <span>Cloud Integration</span>
                                </div>
                                <div className="feature-item">
                                    <i className="bi bi-check-circle-fill"></i>
                                    <span>Real-time Analytics</span>
                                </div>
                            </div>
                            <div className="cta-buttons d-flex flex-wrap gap-3">
                                <a href="#" className="btn btn-primary">
                                    Start Free Trial
                                </a>
                                <a href="#" className="btn btn-outline">
                                    Learn More
                                </a>
                            </div>
                        </div>
                        <div className="content-right position-relative" data-aos="fade-left" data-aos-delay="300">
                            <img src="/assets/img/misc/misc-1.webp" alt="Digital Platform" className="img-fluid rounded-4" />
                            <div className="floating-card">
                                <div className="card-icon">
                                    <i className="bi bi-graph-up-arrow"></i>
                                </div>
                                <div className="card-content">
                                    <span className="stats-number">245%</span>
                                    <span className="stats-text">Growth Rate</span>
                                </div>
                            </div>
                        </div>
                        <div className="decoration">
                            <div className="circle-1"></div>
                            <div className="circle-2"></div>
                        </div>
                    </div>
                </div>
            </section>
            {/* /Call To Action 2 Section */}

            {/* Latest Posts Section */}
            <section id="latest-posts" className="latest-posts section">
                <div className="section-title container" data-aos="fade-up">
                    <h2>Latest Posts</h2>
                    <div>
                        <span>Check Our</span> <span className="description-title">Latest Posts</span>
                    </div>
                </div>
                <div className="container" data-aos="fade-up" data-aos-delay="100">
                    <div className="row gy-4">
                        <div className="col-lg-4">
                            <article>
                                <div className="post-img">
                                    <img src="/assets/img/blog/blog-post-1.webp" alt="" className="img-fluid" />
                                </div>
                                <p className="post-category">Politics</p>
                                <h2 className="title">
                                    <a href="blog-details.html">Dolorum optio tempore voluptas dignissimos</a>
                                </h2>
                                <div className="d-flex align-items-center">
                                    <img src="/assets/img/person/person-f-12.webp" alt="" className="img-fluid post-author-img flex-shrink-0" />
                                    <div className="post-meta">
                                        <p className="post-author">Maria Doe</p>
                                        <p className="post-date">
                                            <time dateTime="2022-01-01">Jan 1, 2022</time>
                                        </p>
                                    </div>
                                </div>
                            </article>
                        </div>
                        {/* ...otros col-lg-4 igual que en tu HTML... */}
                    </div>
                </div>
            </section>
            {/* /Latest Posts Section */}

            {/* Call To Action Section */}
            <section id="call-to-action" className="call-to-action section">
                <div className="container" data-aos="fade-up" data-aos-delay="100">
                    <div className="row gy-4 justify-content-between align-items-center">
                        <div className="col-lg-6">
                            <div className="cta-content" data-aos="fade-up" data-aos-delay="200">
                                <h2>Subscribe to our newsletter</h2>
                                <p>
                                    Proin eget tortor risus. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Curabitur aliquet quam id
                                    dui posuere blandit.
                                </p>
                                <form
                                    action="forms/newsletter.php"
                                    method="post"
                                    className="php-email-form cta-form"
                                    data-aos="fade-up"
                                    data-aos-delay="300"
                                >
                                    <div className="input-group mb-3">
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="Email address..."
                                            aria-label="Email address"
                                            aria-describedby="button-subscribe"
                                        />
                                        <button className="btn btn-primary" type="submit" id="button-subscribe">
                                            Subscribe
                                        </button>
                                    </div>
                                    <div className="loading">Loading</div>
                                    <div className="error-message"></div>
                                    <div className="sent-message">Your subscription request has been sent. Thank you!</div>
                                </form>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="cta-image" data-aos="zoom-out" data-aos-delay="200">
                                <img src="/assets/img/cta/cta-1.webp" alt="" className="img-fluid" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* /Call To Action Section */}
        </main>
    );
}
