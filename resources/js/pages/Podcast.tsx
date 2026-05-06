import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import '../../css/podcast.css';

// ─── Hook: reveal ─────────────────────────────────────────────────────────────
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


const IconCross = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v8M12 14v8M2 12h8M14 12h8" />
    </svg>
);

const IconHeart = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const IconDumbbell = () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5h11M8 5v3M16 5v3M8 16v3M16 16v3M3 10h18M3 14h18" />
        <rect x="2" y="9" width="2" height="6" rx="1" />
        <rect x="20" y="9" width="2" height="6" rx="1" />
    </svg>
);

// const IconBell = () => (
//     <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
//         <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
//         <path d="M13.73 21a2 2 0 0 1-3.46 0" />
//     </svg>
// );

const IconArrow = () => (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

// ─── Datos de episodios ficticios (próximamente) ──────────────────────────────

const EPISODE_PREVIEWS = [
    {
        num: '01',
        tag: 'Fe',
        title: 'Tu cuerpo, templo del Espíritu Santo',
        desc: 'Descubre por qué cuidar tu cuerpo es un acto de adoración y cómo la fe transforma tu relación con la salud.',
        duration: '~35 min',
        color: 'orange',
    },
    {
        num: '02',
        tag: 'Amor',
        title: 'Amarte a ti mismo como Cristo te ama',
        desc: 'Aprende a romper patrones de autocrítica y a construir hábitos saludables desde el amor incondicional de Dios.',
        duration: '~40 min',
        color: 'blue',
    },
    {
        num: '03',
        tag: 'Fitness',
        title: 'Disciplina espiritual y física: el mismo camino',
        desc: 'La disciplina que te forma en el espíritu es la misma que forja tu cuerpo. Un episodio para atletas de la fe.',
        duration: '~38 min',
        color: 'orange',
    },
];

// ─── Componentes ──────────────────────────────────────────────────────────────

function PodHero() {
    const { ref, visible } = useReveal();
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (visible) video.play().catch(() => { });
        else video.pause();
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
        <section className="pod-hero">
            {/* Fondo con patrón de cuadrícula */}
            <div className="pod-hero__bg" aria-hidden />

            {/* Círculos decorativos */}
            <div className="pod-hero__circle pod-hero__circle--1" aria-hidden />
            <div className="pod-hero__circle pod-hero__circle--2" aria-hidden />

            <div
                ref={ref}
                className={`pod-hero__inner pod-reveal ${visible ? 'pod-reveal--visible' : ''}`}
            >
                {/* Eyebrow */}
                <div className="pod-eyebrow">
                    <span className="pod-eyebrow__line" />
                    Podcast · En preparación
                    <span className="pod-eyebrow__line" />
                </div>

                {/* Logotipo tipográfico */}
                <h1 className="pod-hero__logo">
                    <span className="pod-hero__logo-pod">Pod</span>
                    <span className="pod-hero__logo-caf">CAF</span>
                </h1>

                {/* Tagline */}
                <p className="pod-hero__tagline">
                    Cristo · Amor · Fitness
                </p>

                {/* Descripción */}
                <p className="pod-hero__desc">
                    Una serie que integra la fe en Cristo, el amor de Dios y el cuidado del cuerpo como templo del Espíritu Santo; guiándote a una transformación integral mediante una relación genuina con Dios. Pronto exploraremos juntos cómo
                    la relación con Dios puede transformar cada área de tu vida.
                </p>

                {/* Versículo */}
                <div className="pod-hero__verse">
                    <div className="pod-hero__verse-text">
                        "Amado, yo deseo que tú seas prosperado en todas las cosas, y que tengas
                        salud, así como prospera tu alma."
                    </div>
                    <div className="pod-hero__verse-ref">3 Juan 1:2 · RVR1960</div>
                </div>

                {/* Notificación CTA */}
                <div className="pod-hero__cta">
                    {/* <a href="https://www.instagram.com/dilodepartededios" target="_blank" rel="noreferrer" className="pod-btn pod-btn--primary">
                        <IconBell />
                        Notifícame cuando llegue
                    </a> */}
                    <a href="/devocionales" className="pod-btn pod-btn--primary">
                        Mientras tanto, leer devocionales
                        <IconArrow />
                    </a>
                </div>

                {/* Tags */}
                <div className="pod-hero__tags">
                    <div className="pod-tag pod-tag--orange">
                        <IconCross />
                        Cristo
                    </div>
                    <div className="pod-tag pod-tag--muted">
                        <IconHeart />
                        Amor
                    </div>
                    <div className="pod-tag pod-tag--blue">
                        <IconDumbbell />
                        Fitness
                    </div>
                </div>
            </div>

            {/* Video central del podcast */}
            <div className="pod-hero__img-wrap">
                <div className="pod-hero__video-link">
                    <div className="pod-hero__video-glow" aria-hidden />
                    <video
                        ref={videoRef}
                        src="https://fls-a083ae02-d46d-49e7-84b6-1804f2c1bf37.laravel.cloud/videos/yPBmEoLO74GkpHETiZ4RVGVe0b8HvLMtbhX2hnkp.mp4"
                        className="pod-hero__video"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        aria-label="Promo PodCAF"
                    />
                </div>
            </div>
        </section>
    );
}

function EpisodePreviewSection() {
    const { ref, visible } = useReveal(0.08);

    return (
        <section
            ref={ref}
            className={`pod-episodes pod-reveal ${visible ? 'pod-reveal--visible' : ''}`}
        >
            <div className="pod-episodes__inner">
                <div className="pod-section-header">
                    <div className="pod-eyebrow pod-eyebrow--dark">
                        <span className="pod-eyebrow__line pod-eyebrow__line--dark" />
                        Lo que viene
                        <span className="pod-eyebrow__line pod-eyebrow__line--dark" />
                    </div>
                    <h2 className="pod-section-title">
                        Primeros episodios<br />
                        <em>en preparación</em>
                    </h2>
                </div>

                <div className="pod-episodes__grid">
                    {EPISODE_PREVIEWS.map((ep) => (
                        <div key={ep.num} className={`pod-ep-card pod-ep-card--${ep.color}`}>
                            {/* Número decorativo */}
                            <div className="pod-ep-card__num">{ep.num}</div>

                            {/* Tag de tema */}
                            <div className="pod-ep-card__tag">{ep.tag}</div>

                            {/* Barra de acento */}
                            <div className="pod-ep-card__accent" />

                            {/* Contenido */}
                            <h3 className="pod-ep-card__title">{ep.title}</h3>
                            <p className="pod-ep-card__desc">{ep.desc}</p>

                            {/* Meta */}
                            <div className="pod-ep-card__meta">
                                <span className="pod-ep-card__duration">
                                    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2}>
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6v6l4 2" />
                                    </svg>
                                    {ep.duration}
                                </span>
                                <span className="pod-ep-card__soon">Próximamente</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// function AboutSection() {
//     const { ref, visible } = useReveal(0.08);

//     return (
//         <section
//             ref={ref}
//             className={`pod-about pod-reveal ${visible ? 'pod-reveal--visible' : ''}`}
//         >
//             <div className="pod-about__inner">
//                 <div className="pod-about__card pod-about__card--dark">
//                     <div className="pod-about__card-accent" />
//                     <div className="pod-about__card-num">01</div>
//                     <div className="pod-about__card-label">Nuestra misión</div>
//                     <h3 className="pod-about__card-title">
//                         Fe, salud<br />y propósito
//                     </h3>
//                     <p className="pod-about__card-body">
//                         PodCAF nace para ayudarte a vivir en plenitud — espiritual,
//                         emocional y físicamente. Cada episodio conectará la Palabra de Dios
//                         con hábitos prácticos que transformen tu día a día.
//                     </p>
//                     <div className="pod-about__card-verse">
//                         "¿No sabéis que sois templo de Dios?"
//                         <span>1 Corintios 3:16</span>
//                     </div>
//                 </div>

//                 <div className="pod-about__card pod-about__card--light">
//                     <div className="pod-about__card-accent" />
//                     <div className="pod-about__card-num">02</div>
//                     <div className="pod-about__card-label">¿Para quién es?</div>
//                     <h3 className="pod-about__card-title">
//                         Para todo creyente<br />que quiere crecer
//                     </h3>
//                     <p className="pod-about__card-body">
//                         No importa si eres atleta o si apenas empiezas a cuidar tu cuerpo.
//                         PodCAF es para quienes quieren vivir la voluntad de Dios en
//                         todas las áreas — sin excluir su salud física.
//                     </p>
//                     <div className="pod-about__card-verse">
//                         "Glorificad a Dios en vuestro cuerpo"
//                         <span>1 Corintios 6:20</span>
//                     </div>
//                 </div>
//             </div>
//         </section>
//     );
// }

function FinalCta() {
    const { ref, visible } = useReveal(0.1);

    return (
        <section
            ref={ref}
            className={`pod-cta pod-reveal ${visible ? 'pod-reveal--visible' : ''}`}
        >
            <div className="pod-cta__inner">
                {/* Cruz decorativa */}
                <div className="pod-cta__cross" aria-hidden>
                    <div className="pod-cta__cross-v" />
                    <div className="pod-cta__cross-h" />
                </div>

                <div className="pod-eyebrow pod-eyebrow--orange">
                    <span className="pod-eyebrow__line" />
                    Mientras tanto
                    <span className="pod-eyebrow__line" />
                </div>

                <h2 className="pod-cta__title">
                    Sigue creciendo<br />en la <em>Palabra</em>
                </h2>

                <p className="pod-cta__sub">
                    Explora nuestros devocionales, estudios bíblicos y series temáticas.
                    La plataforma está activa y lista para transformar tu vida hoy.
                </p>

                <div className="pod-cta__actions">
                    <a href="/devocionales" className="pod-btn pod-btn--primary">
                        Explorar devocionales
                        <IconArrow />
                    </a>
                    <a href="/series" className="pod-btn pod-btn--ghost-dark">
                        Ver series bíblicas
                        <IconArrow />
                    </a>
                </div>
            </div>
        </section>
    );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function Podcast() {
    return (
        <div className="pod-page">
            <Head title="Dilo de parte de Dios | Podcast y más" />
            <Header />
            <main>
                <PodHero />
                <EpisodePreviewSection />
                {/* <AboutSection /> */}
                <FinalCta />
            </main>
            <Footer />
        </div>
    );
}