import DevocionalDetails from '@/pages/DevocionalDetails';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { useCallback, useEffect, useRef, useState } from 'react';
import '../../css/main-home.css';
import CoverflowCarousel from './CoverflowCarousel';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Devocional {
    contenido: string;
    imagen: string;
    id?: string;
    created_at?: string;
    categoria?: string;
}

interface YoutubeVideo {
    id: { videoId: string };
    snippet: {
        title: string;
        publishedAt: string;
        description: string;
        thumbnails: { default: { url: string } };
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function obtenerPrimerEtiqueta(html: string): string {
    const match = html?.match(/<([a-zA-Z0-9]+)[^>]*>(.*?)<\/\1>/i);
    return match ? match[0] : '';
}

function TituloDevocional({ contenido }: { contenido: string }) {
    const titulo = obtenerPrimerEtiqueta(contenido);
    return (
        <span
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(titulo) }}
            style={{ textTransform: 'uppercase' }}
        />
    );
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr)
        .toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
        .replace(/^\w/, (c) => c.toUpperCase());
}

function isToday(dateStr?: string): boolean {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();
}

// ─── Hook: reveal on scroll ───────────────────────────────────────────────────

function useReveal(threshold = 0.1) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
            { threshold },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, visible };
}

// ─── Iconos ───────────────────────────────────────────────────────────────────

const IconArrow = () => (
    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

const IconChevronLeft = () => (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
    </svg>
);

const IconChevronRight = () => (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
    </svg>
);

const IconPlaylist = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="rgba(247,88,21,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16M4 10h16M4 14h10M4 18h10M18 14v8M15 17l3-3 3 3" />
    </svg>
);

const IconYTExternal = () => (
    <svg viewBox="0 0 24 24" width={12} height={12} fill="currentColor">
        <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
);

// ─── Sección 1: Devocionales ──────────────────────────────────────────────────

interface DevSectionProps {
    devocionales: Devocional[];
    onOpen: (d: Devocional) => void;
}

function DevSection({ devocionales, onOpen }: DevSectionProps) {
    const { ref, visible } = useReveal();
    const [activeIdx, setActiveIdx] = useState(0);
    const dev = devocionales.slice(0, 5);
    const total = dev.length;

    // El featured es el activo; los minis son los otros 4 en orden
    const featured = dev[activeIdx];
    const minis = dev.filter((_, i) => i !== activeIdx);

    const goTo = (i: number) => setActiveIdx(i);
    const goPrev = () => setActiveIdx(i => (i === 0 ? total - 1 : i - 1));
    const goNext = () => setActiveIdx(i => (i === total - 1 ? 0 : i + 1));

    return (
        <section className="sp-dev">
            <div
                ref={ref}
                className={`sp-dev__inner sp-reveal ${visible ? 'sp-reveal--visible' : ''}`}
            >
                {/* Header */}
                <div className="sp-dev__header">
                    <div>
                        <div className="sp-eyebrow" style={{ marginBottom: 10 }}>
                            <span className="sp-eyebrow__line" />
                            Devocionales
                        </div>
                        <h2 className="sp-section-title sp-dev__title">
                            Más recientes
                        </h2>
                    </div>
                    <a href="/devocionales" className="sp-link-more">
                        Ver todos <IconArrow />
                    </a>
                </div>

                {/* Grid */}
                <div className="sp-dev__grid">
                    {/* Featured grande */}
                    <div
                        className="sp-dev__featured"
                        onClick={() => featured && onOpen(featured)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && featured && onOpen(featured)}
                        aria-label="Abrir devocional destacado"
                    >
                        {featured?.imagen && (
                            <img
                                src={featured.imagen}
                                alt="Devocional destacado"
                                className="sp-dev__featured-img"
                                loading="eager"
                            />
                        )}
                        <div className="sp-dev__featured-overlay" />
                        <div className="sp-dev__featured-content">
                            {isToday(featured?.created_at) && (
                                <span className="sp-dev__featured-badge">Hoy</span>
                            )}
                            <div className="sp-dev__featured-date">
                                {formatDate(featured?.created_at)}
                            </div>
                            <button
                                className="sp-dev__featured-title"
                                onClick={(e) => { e.stopPropagation(); if (featured) onOpen(featured); }}
                            >
                                <TituloDevocional contenido={featured?.contenido ?? ''} />
                            </button>
                        </div>
                    </div>

                    {/* 4 minis — todos los que no son el featured */}
                    <div className="sp-dev__minis">
                        {minis.map((d, i) => (
                            <div
                                key={d.id ?? i}
                                className="sp-dev__mini"
                                onClick={() => onOpen(d)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && onOpen(d)}
                                aria-label={`Abrir devocional ${i + 1}`}
                            >
                                {d.imagen && (
                                    <img
                                        src={d.imagen}
                                        alt=""
                                        className="sp-dev__mini-img"
                                        loading="lazy"
                                    />
                                )}
                                <div className="sp-dev__mini-overlay" />
                                <span className="sp-dev__mini-num">
                                    {String(dev.indexOf(d) + 1).padStart(2, '0')}
                                </span>
                                <div className="sp-dev__mini-content">
                                    <button
                                        className="sp-dev__mini-title"
                                        onClick={(e) => { e.stopPropagation(); onOpen(d); }}
                                    >
                                        <TituloDevocional contenido={d.contenido} />
                                    </button>
                                    <span className="sp-dev__mini-date">
                                        {formatDate(d.created_at)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Navigator ── */}
                {total > 0 && (
                    <div className="sp-dev__nav">
                        {/* Contador tipográfico */}
                        <div className="sp-dev__nav-info">
                            <span className="sp-dev__nav-current">
                                {String(activeIdx + 1).padStart(2, '0')}
                            </span>
                            <span className="sp-dev__nav-sep">/</span>
                            <span className="sp-dev__nav-total">
                                {String(total).padStart(2, '0')}
                            </span>
                        </div>

                        {/* Barra de progreso */}
                        <div className="sp-dev__nav-track">
                            <div
                                className="sp-dev__nav-progress"
                                style={{ width: `${((activeIdx + 1) / total) * 100}%` }}
                            />
                        </div>

                        {/* Dots */}
                        <div className="sp-dev__nav-dots">
                            {dev.map((_, i) => (
                                <button
                                    key={i}
                                    className={`sp-dev__nav-dot ${activeIdx === i ? 'sp-dev__nav-dot--active' : ''}`}
                                    onClick={() => goTo(i)}
                                    aria-label={`Ir al devocional ${i + 1}`}
                                >
                                    <span className="sp-dev__nav-dot-inner" />
                                </button>
                            ))}
                        </div>

                        {/* Flechas */}
                        <div className="sp-dev__nav-arrows">
                            <button
                                className="sp-dev__nav-arrow"
                                onClick={goPrev}
                                aria-label="Devocional anterior"
                            >
                                <IconChevronLeft />
                            </button>
                            <button
                                className="sp-dev__nav-arrow"
                                onClick={goNext}
                                aria-label="Devocional siguiente"
                            >
                                <IconChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

// ─── Sección 2: Carrusel ──────────────────────────────────────────────────────

function CarouselSection() {
    const { ref, visible } = useReveal();

    return (
        <section className="sp-carousel">
            <div
                ref={ref}
                className={`sp-carousel__inner sp-reveal ${visible ? 'sp-reveal--visible' : ''}`}
            >
                <div className="sp-carousel__header">
                    <div>
                        <div className="sp-eyebrow sp-eyebrow--white" style={{ marginBottom: 10 }}>
                            <span className="sp-eyebrow__line sp-eyebrow__line--white" />
                            Inspírate
                        </div>
                        <h2 className="sp-section-title sp-section-title--white" style={{ fontSize: 'clamp(1.4rem,2.5vw,2rem)' }}>
                            Mensajes que <em>transforman</em>
                        </h2>
                    </div>
                </div>
                <div className="sp-carousel__widget">
                    <CoverflowCarousel />
                </div>
            </div>
        </section>
    );
}

// ─── Sección 3: Video local ───────────────────────────────────────────────────
//
//  Coloca tu archivo de video en:  /public/assets/video/
//  y ajusta VIDEO_SRC con el nombre exacto.
//
//  VIDEO_SRC  → ruta del video  (mp4 recomendado, h.264)
//  VIDEO_POSTER → imagen de portada mientras no se reproduce
//                 (usa una captura del video o una foto tuya)
//                 Si no tienes poster aún, déjalo en '' y se mostrará
//                 el fondo oscuro con el botón play.

const VIDEO_SRC = 'https://fls-a083ae02-d46d-49e7-84b6-1804f2c1bf37.laravel.cloud/videos/ZXF3DNFj6ois2QlJp9LD2IzpmNgiayARHoWby1n0.mp4';   // ← tu archivo
const VIDEO_POSTER = '/assets/video/nosotros.png'; // ← portada (opcional)

function VideoSoonSection() {
    const [playing, setPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const { ref, visible } = useReveal(0.15);

    // Al hacer clic en el thumb: mostrar el <video> y arrancar reproducción
    const handlePlay = () => {
        setPlaying(true);
        // Pequeño timeout para que React renderice el <video> antes de llamar a play()
        setTimeout(() => {
            videoRef.current?.play().catch(() => {
                // Si el navegador bloquea autoplay, el usuario verá los controles
            });
        }, 50);
    };

    // Esc cierra el player y pausa
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && playing) {
                videoRef.current?.pause();
                setPlaying(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [playing]);

    return (
        <section className="sp-vsec">
            <div
                ref={ref}
                className={`sp-vsec__inner sp-reveal ${visible ? 'sp-reveal--visible' : ''}`}
            >
                {/* ── Encabezado ── */}
                <div className="sp-vsec__header">
                    <div>
                        <div className="sp-eyebrow sp-eyebrow--white" style={{ marginBottom: 10 }}>
                            <span className="sp-eyebrow__line sp-eyebrow__line--white" />
                            Video especial
                        </div>
                        <h2 className="sp-section-title sp-section-title--white sp-vsec__title">
                            Un mensaje que <em>transforma</em>
                        </h2>
                    </div>
                </div>

                {/* ── Player ── */}
                <div className="sp-vsec__player">

                    {/* ── Thumbnail + botón play ── visible hasta que el usuario da play */}
                    <button
                        className={`sp-vsec__thumb-btn ${playing ? 'sp-vsec__thumb-btn--hidden' : ''}`}
                        onClick={handlePlay}
                        aria-label="Reproducir video"
                        tabIndex={playing ? -1 : 0}
                    >
                        {/* Poster / portada */}
                        {VIDEO_POSTER ? (
                            <img
                                src={VIDEO_POSTER}
                                alt="Portada del video"
                                className="sp-vsec__thumb-img"
                                loading="lazy"
                            />
                        ) : (
                            /* Sin poster: fondo oscuro con patrón */
                            <div className="sp-vsec__thumb-fallback" />
                        )}

                        <div className="sp-vsec__thumb-overlay" />

                        {/* Botón play naranja con anillo pulsante */}
                        <div className="sp-vsec__play-btn">
                            <svg viewBox="0 0 24 24" width={30} height={30} fill="#fff">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>

                        <span className="sp-vsec__play-label">Reproducir</span>
                    </button>

                    {/* ── Video HTML5 nativo ── */}
                    <video
                        ref={videoRef}
                        className={`sp-vsec__video ${playing ? 'sp-vsec__video--visible' : ''}`}
                        src={VIDEO_SRC}
                        poster={VIDEO_POSTER || undefined}
                        controls
                        playsInline
                        preload="metadata"     // carga solo metadatos hasta que el usuario da play
                        onEnded={() => setPlaying(false)}
                    />

                    {/* Botón X para cerrar el player y volver al poster */}
                    {playing && (
                        <button
                            className="sp-vsec__close-btn"
                            onClick={() => {
                                videoRef.current?.pause();
                                setPlaying(false);
                            }}
                            aria-label="Cerrar reproductor"
                        >
                            <svg viewBox="0 0 24 24" width={14} height={14} fill="none"
                                stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    )}

                </div>
            </div>
        </section>
    );
}

// ─── Sección 4: YouTube ───────────────────────────────────────────────────────

interface YTSectionProps {
    videos: YoutubeVideo[];
    error: string | null;
}

function YTSection({ videos, error }: YTSectionProps) {
    const { ref, visible } = useReveal();

    return (
        <section className="sp-yt">
            <div
                ref={ref}
                className={`sp-yt__inner sp-reveal ${visible ? 'sp-reveal--visible' : ''}`}
            >
                <div className="sp-yt__header">
                    <div className="sp-yt__header-left">
                        <div className="sp-eyebrow">
                            <span className="sp-eyebrow__line" />
                            Audio clases
                        </div>
                        <h2 className="sp-section-title sp-yt__title">
                            Doctrina que <em>edifica</em>
                        </h2>
                    </div>
                    <a
                        href="https://youtube.com/playlist?list=PLA3_8ty5OhFV-hmTywh6yGTnzlaTpJpBU&si=voOhM9H8Oba3-FD7"
                        target="_blank"
                        rel="noreferrer"
                        className="sp-link-more"
                    >
                        Ver canal <IconArrow />
                    </a>
                </div>

                {error && (
                    <p style={{ color: 'var(--sp-muted)', fontSize: 13, fontFamily: 'var(--sp-sans)' }}>
                        No se pudieron cargar los videos en este momento.
                    </p>
                )}

                {!error && (
                    <div className="sp-yt__grid">
                        {videos.slice(0, 3).map((video) => (
                            <div className="sp-yt__card" key={video.id.videoId}>
                                <div className="sp-yt__thumb">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${video.id.videoId}`}
                                        title={video.snippet.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        loading="lazy"
                                    />
                                </div>
                                <div className="sp-yt__card-body">
                                    <p className="sp-yt__card-title">{video.snippet.title}</p>
                                    <div className="sp-yt__card-footer">
                                        <a
                                            href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="sp-yt__card-link"
                                        >
                                            <IconYTExternal /> Ver en YouTube
                                        </a>
                                        <span className="sp-yt__card-date">
                                            {new Date(video.snippet.publishedAt).toLocaleDateString('es-ES')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Playlist CTA */}
                        <a
                            href="https://youtube.com/playlist?list=PLA3_8ty5OhFV-hmTywh6yGTnzlaTpJpBU&si=voOhM9H8Oba3-FD7"
                            target="_blank"
                            rel="noreferrer"
                            className="sp-yt__playlist"
                        >
                            <div className="sp-yt__playlist-icon">
                                <IconPlaylist />
                            </div>
                            <p className="sp-yt__playlist-title">Playlist<br />completa</p>
                            <p className="sp-yt__playlist-sub">Todas las enseñanzas</p>
                            <span className="sp-yt__playlist-btn">
                                Ver más <IconArrow />
                            </span>
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
}

// ─── Sección 5: PodCAF ────────────────────────────────────────────────────────

function PodCAFSection() {
    const { ref, visible } = useReveal();
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (visible) {
            video.play().catch(() => { });
        } else {
            video.pause();
        }
    }, [visible]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const handleVisibility = () => {
            if (document.hidden) video.pause();
            else if (visible) video.play().catch(() => { });
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [visible]);

    return (
        <section className="sp-pod">
            <div
                ref={ref}
                className={`sp-pod__inner sp-reveal ${visible ? 'sp-reveal--visible' : ''}`}
            >
                <div className="sp-pod__left">
                    <div className="sp-eyebrow sp-pod__eyebrow">
                        <span className="sp-eyebrow__line" />
                        Podcast · próximamente
                    </div>
                    <h2 className="sp-pod__title">
                        Pod<em>CAF</em>
                    </h2>
                    <p className="sp-pod__desc">
                        Muy pronto una serie única que unirá la fe, el amor y el cuidado de tu cuerpo.
                        Porque Dios quiere verte prosperar en todas las áreas de tu vida.
                    </p>
                    <div className="sp-pod__tags">
                        <span className="sp-pod__tag">Cristo</span>
                        <span className="sp-pod__tag">Amor</span>
                        <span className="sp-pod__tag">Fitness</span>
                    </div>
                </div>
                <div className="sp-pod__img-wrap">
                    <a href="/podcast" className="sp-pod__video-link">
                        <div className="sp-pod__video-glow" />
                        <video
                            ref={videoRef}
                            src="https://fls-a083ae02-d46d-49e7-84b6-1804f2c1bf37.laravel.cloud/videos/yPBmEoLO74GkpHETiZ4RVGVe0b8HvLMtbhX2hnkp.mp4"
                            className="sp-pod__video"
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            aria-label="Promo PodCAF"
                        />
                    </a>
                </div>
            </div>
        </section>
    );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
    devocional: Devocional;
    onClose: () => void;
}

function DevocionalModal({ devocional, onClose }: ModalProps) {
    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.72)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000, overflow: 'auto', padding: '20px',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: '#fff', padding: '28px',
                    borderRadius: '16px', maxWidth: '800px', width: '100%',
                    position: 'relative', maxHeight: '90vh', overflowY: 'auto',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    style={{
                        position: 'absolute', top: '12px', right: '14px',
                        background: 'none', border: 'none',
                        fontSize: '1.6rem', cursor: 'pointer', color: '#888',
                        lineHeight: 1,
                    }}
                    onClick={onClose}
                    aria-label="Cerrar"
                >
                    &times;
                </button>
                <DevocionalDetails devocional={devocional} />
            </div>
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function MainContent() {
    const [devocionales, setDevocionales] = useState<Devocional[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState<Devocional | null>(null);
    const [videos, setVideos] = useState<YoutubeVideo[]>([]);
    const [ytError, setYtError] = useState<string | null>(null);

    // YouTube
    useEffect(() => {
        axios.get('/youtube/latest')
            .then((res) => {
                if (res.data?.items?.length > 0) setVideos(res.data.items);
                else setYtError('No se encontraron videos.');
            })
            .catch(() => setYtError('Error al cargar videos.'));
    }, []);

    // Devocionales
    useEffect(() => {
        if (!loading) return;
        fetch('/devocionals-latest')
            .then((r) => r.json())
            .then((data: Devocional[]) => {
                setDevocionales(data);
                setLoading(false);
                const id = new URLSearchParams(window.location.search).get('devocional');
                if (id) {
                    const found = data.find((d) => String(d.id) === id);
                    if (found) { setSelected(found); setModalOpen(true); }
                }
            });
    }, [loading]);

    // Scroll lock
    useEffect(() => {
        document.body.style.overflow = modalOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [modalOpen]);

    const abrirModal = useCallback((d: Devocional) => {
        setSelected(d);
        setModalOpen(true);
        window.history.pushState({}, '', `?devocional=${d.id}`);
    }, []);

    const cerrarModal = useCallback(() => {
        setModalOpen(false);
        setSelected(null);
        window.history.pushState({}, '', window.location.pathname);
    }, []);

    if (loading && videos.length === 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <main className="sp-home">
            <DevSection devocionales={devocionales} onOpen={abrirModal} />
            <CarouselSection />
            <VideoSoonSection />
            <YTSection videos={videos} error={ytError} />
            <PodCAFSection />
            {modalOpen && selected && (
                <DevocionalModal devocional={selected} onClose={cerrarModal} />
            )}
        </main>
    );
}
