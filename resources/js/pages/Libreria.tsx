import PageLayout from "@/components/PageLayout";
import { Head } from '@inertiajs/react';
import '../../css/libreria.css';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Resource {
    id: string;
    title: string;
    category: 'Masterclass' | 'Curso' | 'Recurso' | 'Libro' | 'Libro Infantil';
    description: string;
    coverVariant: 'navy' | 'orange' | 'green' | 'purple' | 'blue';
    icon: string;
    meta: string;
    author?: string;
    descriptionNode?: React.ReactNode;
    imageUrl?: string;
}

// ─── Mock data — replace with LearnHub API response ──────────────────────────

const resources: Resource[] = [
    {
        id: '1',
        title: 'Primicias de Enseñanza',
        category: 'Libro',
        description: 'Una obra que siembra fundamentos sólidos de la Palabra de Dios para quienes comienzan su camino de enseñanza bíblica.',
        coverVariant: 'orange',
        icon: 'bi-book',
        meta: 'Diana López',
        author: 'Diana López',
    },
    {
        id: '2',
        title: 'Generaciones que aprenden a amar',
        category: 'Libro Infantil',
        description: 'Una serie que muestra cómo el amor se perfecciona con el tiempo y encuentra su plenitud cuando se fundamenta en Dios.',
        coverVariant: 'blue',
        icon: 'bi-journal-text',
        meta: '3 volúmenes',
        author: 'Diana López',
        imageUrl: 'https://fls-a083ae02-d46d-49e7-84b6-1804f2c1bf37.laravel.cloud/imagenes/nueva_imagen.png'
    },
    {
        id: '3',
        title: 'Decisiones que transforman tu vida',
        category: 'Masterclass',
        description: 'Una serie de masterclass que revela el costo real de tus decisiones y el peso del crecimiento, aprenderás a identificar lo que estás sacrificando en cada decisión y a sostener el crecimiento sin rendirte, desarrollando una vida intencional y con propósito.',
        coverVariant: 'navy',
        icon: 'bi-mortarboard',
        meta: '3 masterclasses',
        author: 'Diana López',
    },
    {
        id: '4',
        title: 'De lo invisible a lo visible',
        category: 'Masterclass',
        description: 'Descubre cómo renovar tu mente y romper patrones que están definiendo tu vida sin que te des cuenta.',
        coverVariant: 'navy',
        icon: 'bi-mortarboard',
        meta: '3 masterclasses',
        author: 'Diana López',
    },
    {
        id: '5',
        title: 'La clave para crecer de forma sostenible',
        category: 'Curso',
        description: 'Aprende a evitar el agotamiento espiritual, mental y físico aplicando un sistema práctico basado en la Comunión, la Construcción y el Descanso.',
        descriptionNode: <>Aprende a evitar el agotamiento espiritual, mental y físico aplicando un sistema práctico basado en <strong>la Comunión</strong>, <strong>la Construcción</strong> y <strong>el Descanso</strong>.</>,
        coverVariant: 'purple',
        icon: 'bi-mortarboard',
        meta: '3 clases',
        author: 'Diana López',
    },
];

const whyItems = [
    {
        icon: 'bi-play-circle',
        title: 'Aprende a tu ritmo',
        body: 'Accede a los recursos cuando quieras. El conocimiento de Dios disponible las 24 horas, desde cualquier dispositivo.',
    },
    {
        icon: 'bi-shield-check',
        title: 'Recursos bíblicos seleccionados',
        body: 'Cada recurso es revisado y creado con fidelidad a las Escrituras. Calidad doctrinal garantizada.',
    },
    {
        icon: 'bi-people',
        title: 'Comunidad de crecimiento',
        body: 'Crece junto a una comunidad de creyentes comprometidos con aprender y vivir la Palabra de Dios.',
    },
];

// ─── Resource Card ────────────────────────────────────────────────────────────

function ResourceCard({ resource }: { resource: Resource }) {
    return (
        <article className="lib-card">
            <div className={`lib-card__cover lib-card__cover--${resource.coverVariant}`}>
                <div className="lib-card__cover-shine" aria-hidden />
                {resource.imageUrl ? (
                    <img src={resource.imageUrl} alt={`${resource.title} cover`} className="lib-card__cover-image" />
                ) : (
                    <div className="lib-card__cover-placeholder" aria-hidden>
                        <i className={`bi ${resource.icon} lib-card__cover-icon`} aria-hidden />
                    </div>
                )}
                <span className="lib-card__badge">{resource.category}</span>
            </div>
            <div className="lib-card__body">
                <h3 className="lib-card__title">{resource.title}</h3>
                {resource.author && (
                    <span className="lib-card__author">
                        <i className="bi bi-person" aria-hidden /> {resource.author}
                    </span>
                )}
                <p className="lib-card__desc">{resource.descriptionNode ?? resource.description}</p>
                <span className="lib-card__meta">
                    <i className={`bi ${resource.category === 'Libro' ? 'bi-book' : 'bi-play-circle'}`} aria-hidden />
                    {resource.meta}
                </span>
                <a href="#learnhub-cta" className="lib-card__btn">
                    Próximamente <i className="bi bi-arrow-right" aria-hidden />
                </a>
            </div>
        </article>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Libreria() {
    return (
        <PageLayout>
            <Head title="Dilo de parte de Dios | Recursos" />
            <div className="lib-page">

                {/* ── HERO ── */}
                <section className="lib-hero">
                    <div className="lib-hero__bg-pattern" aria-hidden />
                    <div className="lib-hero__content">
                        <span className="lib-hero__label">LearnHub · Próximamente</span>
                        <h1 className="lib-hero__title">
                            Recursos que <em>transforman</em><br />tu vida espiritual
                        </h1>
                        <p className="lib-hero__subtitle">
                            Libros, Masterclass, Cursos y otros recursos diseñados para que comprendas y vivas la Palabra de Dios. Todo en un solo lugar, a tu ritmo.
                        </p>
                        {/* <a href="#learnhub-cta" className="lib-hero__cta">
                            <i className="bi bi-arrow-right-circle-fill" aria-hidden />
                            Ir a LearnHub
                        </a> */}
                    </div>
                    <div className="lib-hero__scroll-hint" aria-hidden>
                        <span>Explorar recursos</span>
                        <i className="bi bi-chevron-down" />
                    </div>
                </section>

                {/* ── RESOURCES GRID ── */}
                <section className="lib-resources">
                    <div className="lib-resources__header">
                        <span className="lib-section-label">Recursos disponibles</span>
                        <h2 className="lib-section-title">Próximamente en LearnHub</h2>
                        <p className="lib-section-subtitle">
                            Estamos preparando recursos de calidad para tu crecimiento. Estos son algunos de los que encontrarás.
                        </p>
                    </div>
                    <div className="lib-resources__grid">
                        {resources.map(resource => (
                            <ResourceCard key={resource.id} resource={resource} />
                        ))}
                    </div>
                </section>

                {/* ── WHY LEARNHUB ── */}
                <section className="lib-why">
                    <div className="lib-why__inner">
                        <span className="lib-section-label lib-section-label--orange">Nuestra propuesta</span>
                        <h2 className="lib-section-title">¿Por qué LearnHub?</h2>
                        <div className="lib-why__grid">
                            {whyItems.map((item, i) => (
                                <div key={i} className="lib-why__item">
                                    <div className="lib-why__icon-wrap" aria-hidden>
                                        <i className={`bi ${item.icon}`} />
                                    </div>
                                    <h3>{item.title}</h3>
                                    <p>{item.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── QUOTE DIVIDER ── */}
                <section className="lib-quote" aria-label="Versículo bíblico">
                    <div className="lib-quote__mark" aria-hidden>"</div>
                    <blockquote className="lib-quote__text">
                        No solo de pan vivirá el hombre, sino de toda palabra que sale de la boca de Dios.
                    </blockquote>
                    <cite className="lib-quote__source">— Mateo 4:4</cite>
                </section>

                {/* ── CTA BANNER ── */}
                <section className="lib-cta" id="learnhub-cta">
                    <div className="lib-cta__inner">
                        <h2 className="lib-cta__title">¿Listo para crecer?</h2>
                        <p className="lib-cta__subtitle">
                            LearnHub estará disponible muy pronto. Escríbenos para recibir acceso anticipado y novedades sobre los recursos.
                        </p>
                        <div className="lib-cta__actions">
                            <a
                                href="https://wa.me/573045851480?text=Hola%20Dilo%20de%20parte%20de%20Dios,%20quiero%20recibir%20notificaciones%20sobre%20LearnHub."
                                className="lib-cta__btn lib-cta__btn--primary"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <i className="bi bi-whatsapp" aria-hidden />
                                Notificarme por WhatsApp
                            </a>
                            <a
                                href="https://www.instagram.com/diosconnosotrosyd"
                                className="lib-cta__btn lib-cta__btn--secondary"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Seguir en Instagram
                            </a>
                        </div>
                    </div>
                </section>


            </div>
        </PageLayout>
    );
}
