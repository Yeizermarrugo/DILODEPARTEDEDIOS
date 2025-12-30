import DevocionalDetails from '@/pages/DevocionalDetails';
import axios from 'axios';
import { useEffect, useState } from 'react';
import CoverflowCarousel from './CoverflowCarousel';

interface Devocional {
    contenido: string;
    imagen: string;
    id?: number;
    created_at?: string;
    categoria?: string;
}
interface YoutubeVideo {
    id: {
        videoId: string;
    };
    snippet: {
        title: string;
        publishedAt: string;
        description: string;
        thumbnails: {
            default: {
                url: string;
            };
        };
        // Puedes agregar más campos si los necesitas
    };
}
export default function MainContent() {
    const [devocionales, setDevocionales] = useState<Devocional[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [devocionalSeleccionado, setDevocionalSeleccionado] = useState<Devocional | null>(null);
    const [videos, setVideos] = useState<YoutubeVideo[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [welcomeOpen, setWelcomeOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(false);
    const URL = '/youtube/latest';

    useEffect(() => {
        axios
            .get(URL)
            .then((res) => {
                const data = res.data;
                if (data.items && data.items.length > 0) {
                    setVideos(data.items);
                    console.log('data: ', data);
                } else {
                    setError('No se encontró ningún video.');
                }
            })
            .catch((err) => {
                // setError('Error al consultar la API.');
                console.log('error Youtube API', err);
            });
    }, []);

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
        if (modalOpen || welcomeOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768); // breakpoint móvil
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            isMounted = false;
            document.body.style.overflow = '';
            window.removeEventListener('resize', checkMobile);
        };
    }, [loading, modalOpen, welcomeOpen]);

    const obtenerPrimerEtiqueta = (html: string) => {
        const match = html?.match(/<([a-zA-Z0-9]+)[^>]*>(.*?)<\/\1>/i);
        if (match) {
            return match[0]; // Devuelve la primera etiqueta completa, con HTML
        }
        return '';
    };
    const TituloDevocional = ({ contenido }: { contenido: string }) => {
        const titulo = obtenerPrimerEtiqueta(contenido);
        return <div dangerouslySetInnerHTML={{ __html: titulo }} style={{ textTransform: 'uppercase' }} />;
    };

    const dev = devocionales.slice(0, 5);
    if (error) return <div>{error}</div>;
    if (loading && !videos) {
        return (
            <div id="preloader" className="d-flex align-items-center justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }
    const desktopSrc = 'https://fls-a083ae02-d46d-49e7-84b6-1804f2c1bf37.laravel.cloud/imagenes/9MAYjI6lnGcZ2iEJ9RktAtVfHVeGZX0TqhnayWe3.png';
    const mobileSrc = 'https://fls-a083ae02-d46d-49e7-84b6-1804f2c1bf37.laravel.cloud/imagenes/9gdEhwfAaLhIDZupP7ccGVRCUb2c2DpE9HdsbcOl.png';

    const imageSrc = isMobile ? mobileSrc : desktopSrc;

    return (
        <main className="main">
            {/* Modal de bienvenida */}
            {welcomeOpen && (
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
                        zIndex: 2000,
                        overflow: 'auto',
                    }}
                >
                    <div
                        className="modal-content"
                        style={{
                            position: 'relative',
                            background: 'transparent',
                            borderRadius: '8px',
                            maxWidth: isMobile ? 'auto' : '1000px',
                            width: '100%',
                        }}
                    >
                        <button
                            onClick={() => setWelcomeOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'none',
                                border: 'none',
                                fontSize: '2rem',
                                color: '#000000ff',
                                cursor: 'pointer',
                                zIndex: 10,
                            }}
                        >
                            &times;
                        </button>

                        <img
                            src={imageSrc}
                            alt="Bienvenido"
                            style={{
                                width: '100%',
                                borderRadius: '8px',
                                display: 'block',
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Blog Hero Section */}
            <section id="blog-hero" className="blog-hero section">
                <div className="container" data-aos="fade-up" data-aos-delay="100">
                    <div className="blog-grid">
                        {/* Featured Post (Large) */}
                        <article className="blog-item featured" data-aos="fade-up">
                            <img src={dev[0]?.imagen} alt="Blog Image" className="img-fluid" />
                            <div className="blog-content">
                                <div className="post-meta">
                                    <span className="date">
                                        {dev[0]?.created_at
                                            ? new Date(dev[0]?.created_at).toLocaleDateString('es-ES', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })
                                            : ''}
                                    </span>
                                    {/* <span className="category">Technology</span> */}
                                </div>
                                <h3 className="devocional-title">
                                    <button onClick={() => abrirModal(dev[0])}>
                                        <TituloDevocional contenido={dev[0]?.contenido} />
                                    </button>
                                </h3>
                            </div>
                        </article>

                        {/* End Featured Post */}

                        {/* Regular Posts */}
                        <article className="blog-item" data-aos="fade-up" data-aos-delay="100">
                            <img src={dev[1]?.imagen} alt="Blog Image" className="img-fluid" />
                            <div className="blog-content">
                                <div className="post-meta">
                                    <span className="date">
                                        {dev[1]?.created_at
                                            ? new Date(dev[1]?.created_at).toLocaleDateString('es-ES', {
                                                weekday: 'long',
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
                                        <TituloDevocional contenido={dev[1]?.contenido} />
                                    </button>
                                </h3>
                            </div>
                        </article>
                        <article className="blog-item" data-aos="fade-up" data-aos-delay="100">
                            <img src={dev[2]?.imagen} alt="Blog Image" className="img-fluid" />
                            <div className="blog-content">
                                <div className="post-meta">
                                    <span className="date">
                                        {dev[2]?.created_at
                                            ? new Date(dev[2]?.created_at).toLocaleDateString('es-ES', {
                                                weekday: 'long',
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
                                        <TituloDevocional contenido={dev[2]?.contenido} />
                                    </button>
                                </h3>
                            </div>
                        </article>
                        <article className="blog-item" data-aos="fade-up" data-aos-delay="100">
                            <img src={dev[3]?.imagen} alt="Blog Image" className="img-fluid" />
                            <div className="blog-content">
                                <div className="post-meta">
                                    <span className="date">
                                        {dev[3]?.created_at
                                            ? new Date(dev[3]?.created_at).toLocaleDateString('es-ES', {
                                                weekday: 'long',
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
                                        <TituloDevocional contenido={dev[3]?.contenido} />
                                    </button>
                                </h3>
                            </div>
                        </article>
                        <article className="blog-item" data-aos="fade-up" data-aos-delay="100">
                            <img src={dev[4]?.imagen} alt="Blog Image" className="img-fluid" />
                            <div className="blog-content">
                                <div className="post-meta">
                                    <span className="date">
                                        {dev[4]?.created_at
                                            ? new Date(dev[4]?.created_at).toLocaleDateString('es-ES', {
                                                weekday: 'long',
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
                                        <TituloDevocional contenido={dev[4]?.contenido} />
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
                    <h2>INSPÍRATE</h2>
                    <div>
                        <span>MENSAJES QUE</span> <span className="description-title">TRANSFORMAN</span>
                    </div>
                </div>
                <div className="container" data-aos="fade-up" data-aos-delay="100">
                    <div className="blog-posts-slider swiper init-swiper">
                        {/* Swiper config script se ignora en React, usa librería Swiper para React si necesitas funcionalidad */}
                        <div className="swiper-wrapper">
                            {/* Repite los slides igual que en tu HTML original */}
                            <div className="swiper-slide carousel-slide-wrapper">
                                <div className="carousel-post-item">
                                    {/* <img src="/assets/img/blog/YouTube-Banner.png" alt="Blog Image" /> */}
                                    <CoverflowCarousel />
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
            <section id="category-section" className="category-section section" style={{ background: '#f7f7f7', minHeight: '60vh' }}>
                <div className="section-title container" data-aos="fade-up">
                    <h2>ENSEÑANZA</h2>
                    <div>
                        <span>AUDIO CLASES</span> <span className="description-title">DE DOCTRINA</span>
                    </div>
                </div>
                <div className="container py-5">
                    <div className="row gy-4 justify-content-center align-items-stretch">
                        {error && (
                            <div className="col-12">
                                <div className="alert alert-danger">{error}</div>
                            </div>
                        )}
                        {videos?.length === 0 && !error && (
                            <div id="preloader" className="d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        )}

                        {/* Cards de Video */}
                        {videos?.slice(0, 3).map((video) => (
                            <div className="col-lg-3 col-md-6 d-flex" key={video.id.videoId}>
                                <div className="card video-card h-100 w-100 shadow-sm">
                                    <div className="ratio ratio-16x9">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${video.id.videoId}`}
                                            title={video.snippet.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            style={{ borderRadius: '0.5rem 0.5rem 0 0' }}
                                        ></iframe>
                                    </div>
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title" style={{ fontWeight: 600 }}>
                                            {video.snippet.title}
                                        </h5>
                                        {/* <p className="card-text" style={{ fontSize: '0.95rem', color: '#555' }}>
                                            {video.snippet.description.length > 100
                                                ? video.snippet.description.slice(0, 97) + '...'
                                                : video.snippet.description}
                                        </p> */}
                                        <div className="d-flex justify-content-between align-items-center mt-auto">
                                            <a
                                                href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-primary btn-sm"
                                                style={{
                                                    background: 'linear-gradient(90deg,#0d6efd 0%, #6C63FF 100%)',
                                                    border: 'none',
                                                }}
                                            >
                                                Ver en YouTube
                                            </a>
                                            <small className="text-muted">{new Date(video.snippet.publishedAt).toLocaleDateString()}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Div Ver más */}
                        <div className="col-lg-3 col-md-6 d-flex align-items-stretch">
                            <div className="ver-mas-card d-flex flex-column justify-content-center align-items-center w-100 shadow-sm">
                                <h4 className="mb-3" style={{ fontWeight: 700, color: '#6C63FF' }}>
                                    Playlist completa
                                </h4>
                                <a
                                    href="https://youtube.com/playlist?list=PLA3_8ty5OhFV-hmTywh6yGTnzlaTpJpBU&si=voOhM9H8Oba3-FD7"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-lg btn-gradient"
                                >
                                    Ver más
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estilos personalizados */}
                <style>{`
        .video-card {
          border-radius: 0.7rem;
          overflow: hidden;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .video-card:hover {
          box-shadow: 0 6px 22px rgba(0,0,0,0.14);
          transform: translateY(-2px) scale(1.01);
        }
        .ver-mas-card {
          border-radius: 0.7rem;
          min-height: 100%;
          background: linear-gradient(135deg,#e9ecef 70%, #f7f7f7 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2.5rem 1rem;
        }
        .btn-gradient {
          background: linear-gradient(90deg,#0d6efd 0%, #6C63FF 100%);
          color: #fff;
          border: none;
          border-radius: 2rem;
          font-weight: bold;
          font-size: 1.15rem;
          padding: 0.7rem 2.2rem;
          box-shadow: 0 4px 18px rgba(0,0,0,0.09);
          transition: background .2s, box-shadow .2s;
          text-decoration: none;
        }
        .btn-gradient:hover {
          background: linear-gradient(90deg,#6C63FF 0%, #0d6efd 100%);
          box-shadow: 0 6px 22px rgba(108,99,255,0.18);
        }
        @media (max-width: 991px) {
          .ver-mas-card {
            margin-top: 2rem;
            min-height: 220px;
          }
        }
      `}</style>
            </section>
            {/* /Category Section */}

            {/* Call To Action 2 Section */}
            <section className="podcast-cta-section">
                <div className="podcast-cta-card">
                    <div className="podcast-cta-left">
                        <div className="podcast-mic-icon">
                            <i className="bi bi-mic-fill"></i>
                        </div>
                        <h2 className="podcast-title">PodCAF</h2>
                        <p className="podcast-description">
                            Muy pronto una serie única que unirá la fe, el amor y el cuidado de tu cuerpo. Porque Dios quiere verte prosperar en todas
                            las áreas de tu vida.
                        </p>
                        <div className="podcast-tags">
                            <span className="podcast-tag">Cristo</span>
                            <span className="podcast-tag">Amor</span>
                            <span className="podcast-tag">Fitness</span>
                        </div>
                        <div className="podcast-cta-buttons">
                            {/* <a href="/podcast" className="podcast-cta-btn btn-gradient">
          Ir a
        </a> */}
                            {/* <a href="/podcast" className="podcast-cta-btn btn-outline">
          Ver episodios
        </a> */}
                        </div>
                    </div>
                    <div className="podcast-cta-right">
                        <a href="/podcast">
                            <img src="/assets/img/misc/podCAFmobile.png" alt="Podcast PodCAF" className="podcast-img" />
                        </a>
                    </div>
                </div>
            </section>
            {/* /Call To Action 2 Section */}

            {/* Latest Posts Section */}
            {/* <section id="latest-posts" className="latest-posts section">
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
            {/* </div> */}
            {/* </div> */}
            {/* </section> */}
            {/* /Latest Posts Section */}

            {/* Call To Action Section */}
            {/* <section id="call-to-action" className="call-to-action section">
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
            </section> */}
            {/* /Call To Action Section */}
        </main>
    );
}
