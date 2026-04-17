import {
    IconArrow,
    IconBook,
    IconBookOpen,
    IconCheck,
    IconCheckCircle,
    IconChevronDown,
    IconChevronUp,
    IconEyeLight,
    IconFacebook,
    IconFlame,
    IconGlobe,
    IconGlobeWave,
    IconInstagram,
    IconMic,
    IconPeople,
    IconSend,
    IconShield,
    IconStar,
    IconYouTube
} from '@/components/icons/AboutIcons';
import PageLayout from '@/components/PageLayout';
import { useEffect, useRef, useState } from 'react';
import '../../css/about.css';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface TimelineNode {
    id: number;
    side: 'left' | 'right';
    year: string;
    tag: string;
    icon: React.ReactNode;
    title: string;
    body: React.ReactNode;
    quote?: string;
    chips: { label: string; variant: 'orange' | 'blue' }[];
}

interface TeamMember {
    id: string;
    initials: string;
    imagen: string;
    name: string;
    roleTag: string;
    roleFull: string;
    desc: string;
    badge: string;
    headerClass?: string;
    links: { href: string; label: string; icon: React.ReactNode }[];
}

interface ValuePillar {
    num: string;
    name: string;
    title: string;
    body: string;
    icon: React.ReactNode;
}


// ─── Datos ────────────────────────────────────────────────────────────────────

const timelineNodes: TimelineNode[] = [
    {
        id: 0,
        side: 'right',
        year: '2017',
        tag: 'El inicio',
        icon: <IconFlame />,
        title: 'Comienza la asignación',
        body: (
            <>
                Dios enciende el fuego por enseñar y comienza un proceso de formación y expresión a través de la escritura. Nace el primer libro <strong>"Primicia de Enseñanzas"</strong> y se empiezan a compartir <strong>devocionales</strong>, sentando las bases de lo que más adelante sería una plataforma de formación bíblica.
            </>
        ),
        quote: '"Antes de ser una plataforma, fue una asignación encendida por Dios."',
        chips: [
            { label: 'Fe', variant: 'orange' },
            { label: 'Propósito', variant: 'blue' },
        ],
    },
    {
        id: 1,
        side: 'left',
        year: '2019',
        tag: 'Expansión',
        icon: <IconBookOpen />,
        title: 'La voz comienza a expandirse',
        body: (
            <>
                Lo que comenzó en lo privado empieza a tomar visibilidad. Se participa en una <strong>feria del libro en Cartagena</strong>, presentando obras con un enfoque claro: edificar vidas y llevar un mensaje de restauración, crecimiento y esperanza a través de la Palabra de Dios.
            </>
        ),
        quote: '"Lo que Dios forma en lo secreto, Él mismo lo expone en su tiempo."',
        chips: [
            { label: 'Crecimiento', variant: 'orange' },
            { label: 'Impacto', variant: 'blue' },
        ],
    },
    {
        id: 2,
        side: 'right',
        year: '2022',
        tag: 'La visión',
        icon: <IconEyeLight />,
        title: 'La visión es entregada',
        body: (
            <>
                Dios entrega la visión de una <strong>escuela de formación bíblica</strong> con un propósito claro: capacitar a las personas para comprender y vivir su Palabra. Ese mismo año nacen las <strong>redes sociales</strong>, donde comienzan a compartirse enseñanzas y recursos gratuitos enfocados en ayudar a entender las palabras de aquel que murió en la cruz y, en general, toda la Escritura.
            </>
        ),
        quote: '"La enseñanza no es una opción, es una necesidad para vivir la voluntad de Dios."',
        chips: [
            { label: 'Formación', variant: 'orange' },
            { label: 'Palabra de Dios', variant: 'blue' },
        ],
    }, {
        id: 3,
        side: 'left',
        year: '2024',
        tag: 'Formación',
        icon: <IconMic />,
        title: 'Fundamentos en doctrina',
        body: (
            <>
                Se inicia la enseñanza a través de <strong>audioclases de doctrina</strong> en el canal de YouTube, fortaleciendo las bases de la fe y guiando a las personas en el conocimiento de la <strong>sana doctrina</strong>.
            </>
        ),
        quote: '"Una fe sólida se construye sobre fundamentos firmes."',
        chips: [
            { label: 'Doctrina', variant: 'orange' },
            { label: 'Fundamentos', variant: 'blue' },
        ],
    },
    {
        id: 4,
        side: 'right',
        year: '2025',
        tag: 'Activación',
        icon: <IconSend />,
        title: 'Enviados para enseñar',
        body: (
            <>
                La visión se activa: Dios establece dirección, une el equipo y entrega la estrategia para expandir su Reino mediante una plataforma digital, facilitando el acceso a enseñanzas bíblicas comprensibles y aplicables.
            </>
        ),
        quote: '"Fuimos enviados para que otros puedan oír, creer y vivir la verdad."',
        chips: [
            { label: 'Obediencia', variant: 'orange' },
            { label: 'Misión', variant: 'blue' },
        ],
    },
    {
        id: 5,
        side: 'left',
        year: '2026',
        tag: 'Impacto',
        icon: <IconGlobeWave />,
        title: 'Expansión e impacto',
        body: (
            <>
                La plataforma comienza a impactar vidas en diferentes países, alcanzando a miles de personas. Se desarrollan <strong>recursos formativos</strong>, para fortalecer el crecimiento espiritual y personal, facilitando el acceso al conocimiento que transforma vidas.
            </>
        ),
        quote: '"La Palabra de Dios, comprendida y vivida, guía a una vida alineada a su voluntad."',
        chips: [
            { label: 'Impacto', variant: 'orange' },
            { label: 'Transformación', variant: 'blue' },
        ],
    },
];

const valuePillars: ValuePillar[] = [
    {
        num: '01',
        name: 'Fe',
        title: 'Creer sin ver',
        body: 'Por fe creemos que la Biblia fue inspirada por el Espíritu Santo. La fe nos ayuda a creer que Dios existe y que somos salvos por Cristo.',
        icon: <IconStar />,
    },
    {
        num: '02',
        name: 'Humildad',
        title: 'Corazón dispuesto',
        body: 'Solo con humildad podremos recibir las enseñanzas de Dios y poner por obra su Palabra con un corazón abierto.',
        icon: <IconCheckCircle />,
    },
    {
        num: '03',
        name: 'Confianza',
        title: 'Descansar en Él',
        body: 'La confianza en que los planes de Dios son mejores nos anima a cooperar con el Espíritu Santo en nuestra transformación.',
        icon: <IconShield />,
    },
    {
        num: '04',
        name: 'Obediencia',
        title: 'Acción que transforma',
        body: 'Obedeciendo de manera práctica y completa los mandatos de Dios alcanzamos todo lo que Él ha dispuesto para nuestra vida.',
        icon: <IconCheck />,
    },
];

const teamMembers: TeamMember[] = [
    {
        id: 'yeizer',
        initials: 'YM',
        imagen: 'assets/img/person/Yeizer2.png',
        name: 'Yeizer Marrugo',
        roleTag: 'Cofundador · CTO',
        roleFull: 'Director de Tecnología (CTO) & Cofundador',
        desc: 'Discípulo de Cristo, ingeniero de sistemas y desarrollador de software, responsable del diseño y desarrollo de la plataforma. Lidera la implementación de soluciones tecnológicas que permiten escalar el alcance digital del proyecto. Cofundador de la escuela, creador de contenido y padre de familia.',
        badge: 'Ingeniero · Dev',
        links: [
            { href: 'https://www.facebook.com/yemave', label: 'Facebook', icon: <IconFacebook /> },
            { href: 'https://www.instagram.com/diosconnosotrosyd', label: 'Instagram', icon: <IconInstagram /> },
            { href: 'https://www.youtube.com/@diosconnosotrosyd', label: 'YouTube', icon: <IconYouTube /> },
        ],
    },
    {
        id: 'diana',
        initials: 'DL',
        imagen: 'assets/img/person/Diana.jpg',
        name: 'Diana López',
        roleTag: 'Fundadora · CEO',
        roleFull: 'Fundadora & Escritora Principal',
        desc: 'Discípulo de Cristo , administradora de empresas, escritora y líder de formación. Fundadora y CEO de la escuela, dirige la visión estratégica y el desarrollo de contenidos enfocados en la enseñanza, capacitación y crecimiento espiritual y personal a través de la Palabra de Dios.',
        badge: 'Escritora · CEO',
        headerClass: 'about-tc__top--diana',
        links: [
            { href: 'https://www.facebook.com/Dlopez0712', label: 'Facebook', icon: <IconFacebook /> },
            { href: 'https://www.instagram.com/diosconnosotrosyd', label: 'Instagram', icon: <IconInstagram /> },
            { href: 'https://www.youtube.com/@diosconnosotrosyd', label: 'YouTube', icon: <IconYouTube /> },
        ],
    },
];

// ─── Hook: useReveal ──────────────────────────────────────────────────────────

function useReveal(threshold = 0.1) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    obs.unobserve(el);
                }
            },
            { threshold },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);

    return { ref, visible };
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
    const scrollTo = (id: string) =>
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    return (
        <section className="about-hero">
            <div className="about-hero__lines" aria-hidden>
                <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
                    <line x1="600" y1="0" x2="600" y2="800" stroke="#e8e2d8" strokeWidth="1" />
                    <line x1="0" y1="400" x2="1200" y2="400" stroke="#e8e2d8" strokeWidth="1" />
                    <circle cx="600" cy="400" r="120" fill="none" stroke="#e8e2d8" strokeWidth="1" />
                    <circle cx="600" cy="400" r="220" fill="none" stroke="#e8e2d8" strokeWidth="0.5" />
                    <circle cx="600" cy="400" r="320" fill="none" stroke="#e8e2d8" strokeWidth="0.5" />
                </svg>
            </div>

            <div className="about-hero__center">
                <div className="about-hero__pill">
                    <span className="about-hero__pill-dot" />
                    Plataforma de Formación Bíblica
                </div>

                <h1 className="about-hero__title">
                    <span className="about-hero__title-t1">Dilo</span>
                    <span className="about-hero__title-t2">de Parte</span>
                    <span className="about-hero__title-t3">de Dios</span>
                </h1>

                <p className="about-hero__verse">
                    "Lámpara es a mis pies tu palabra, y lumbrera a mi camino"
                    <cite>Salmos 119:105 RVR1960</cite>
                </p>

                <div className="about-hero__cta">
                    <button
                        className="about-btn about-btn--primary"
                        onClick={() => scrollTo('historia')}
                    >
                        Ver nuestra historia
                        <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12l7 7 7-7" />
                        </svg>
                    </button>
                    <button
                        className="about-btn about-btn--ghost"
                        onClick={() => scrollTo('equipo')}
                    >
                        Conocer el equipo
                    </button>
                </div>
            </div>

            <button
                className="about-hero__scroll"
                onClick={() => scrollTo('razon')}
                aria-label="Ir a nuestra historia"
            >
                <span className="about-hero__scroll-text">Descubrir</span>
                <div className="about-hero__scroll-line">
                    <div className="about-hero__scroll-fill" />
                </div>
            </button>
        </section>
    );
}

// ─── Journey Intro ────────────────────────────────────────────────────────────

function JourneyIntro() {
    const { ref, visible } = useReveal();

    return (
        <div
            ref={ref}
            className={`about-journey-intro about-reveal ${visible ? 'about-reveal--visible' : ''}`}
        >
            <div className="about-eyebrow">
                <span className="about-eyebrow__line" />
                Nuestra historia
                <span className="about-eyebrow__line" />
            </div>
            <h2 className="about-journey-intro__title">
                Un camino trazado<br />por la mano de Dios
            </h2>
            <p className="about-journey-intro__body">
                <strong>Dilo de Parte de Dios</strong> nace de una dirección dada por Dios en 2017. Lo que comenzó como un llamado personal hoy impacta y equipa a miles de personas a través de la Palabra de Dios. Este es el camino que Él ha trazado:
            </p>
        </div>
    );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function TimelineSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const fillRef = useRef<HTMLDivElement>(null);
    const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [activatedNodes, setActivatedNodes] = useState<Set<number>>(new Set());

    useEffect(() => {
        const handleScroll = () => {
            const container = containerRef.current;
            const fill = fillRef.current;
            if (!container || !fill) return;

            const cr = container.getBoundingClientRect();
            const wh = window.innerHeight;
            const totalH = container.offsetHeight;
            const pct = Math.min(1, Math.max(0, (wh * 0.6 - cr.top) / totalH));
            fill.style.height = `${pct * totalH}px`;

            const next = new Set(activatedNodes);
            nodeRefs.current.forEach((node, i) => {
                if (!node) return;
                if (node.getBoundingClientRect().top + 8 < wh * 0.7) next.add(i);
            });
            setActivatedNodes(next);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div ref={containerRef} className="about-tl" id="historia">
            <div className="about-tl__spine" />
            <div ref={fillRef} className="about-tl__fill" />

            {timelineNodes.map((node, i) => {
                const activated = activatedNodes.has(i);
                const isLeft = node.side === 'left';

                return (
                    <div
                        key={node.id}
                        ref={(el) => { nodeRefs.current[i] = el; }}
                        className={[
                            'about-tl__node',
                            isLeft ? 'about-tl__node--left' : 'about-tl__node--right',
                            activated ? 'about-tl__node--activated' : '',
                        ].join(' ')}
                    >
                        <div className={`about-tl__content ${activated ? 'about-tl__content--visible' : ''}`}>
                            <div className="about-tl__year">{node.year}</div>
                            <div className="about-tl__tag">{node.tag}</div>

                            <div className="about-tl__card">
                                <div className="about-tl__card-accent" />
                                <div className="about-tl__icon-chip">{node.icon}</div>
                                <div className="about-tl__card-title">{node.title}</div>
                                <p className="about-tl__card-body">{node.body}</p>
                                {node.quote && (
                                    <div className="about-tl__card-quote">{node.quote}</div>
                                )}
                                <div className="about-tl__chips">
                                    {node.chips.map((chip) => (
                                        <span
                                            key={chip.label}
                                            className={`about-chip about-chip--${chip.variant}`}
                                        >
                                            {chip.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="about-tl__dot" />
                        <div className="about-tl__spacer" />
                    </div>
                );
            })}
        </div>
    );
}

// ─── Pilares / Valores ────────────────────────────────────────────────────────

function ValueCard({ pillar }: { pillar: ValuePillar }) {
    return (
        <div className="about-value-card">
            <div className="about-value-card__bottom-line" />
            <div className="about-value-card__num">{pillar.num}</div>
            <div className="about-value-card__icon">{pillar.icon}</div>
            <div className="about-value-card__name">{pillar.name}</div>
            <div className="about-value-card__title">{pillar.title}</div>
            <p className="about-value-card__body">{pillar.body}</p>
        </div>
    );
}

function PilaresSection() {
    const { ref, visible } = useReveal();

    return (
        <section
            ref={ref}
            className={`about-pilares about-reveal ${visible ? 'about-reveal--visible' : ''}`}
        >
            <div className="about-pilares__inner">
                <div className="about-pilares__header">
                    <div className="about-pilares__eyebrow">
                        <span className="about-pilares__eyebrow-line" />
                        Principios que nos guían
                        <span className="about-pilares__eyebrow-line" />
                    </div>
                    <h2 className="about-pilares__title">
                        Los pilares de todo<br />lo que hacemos
                    </h2>
                </div>
                <div className="about-pilares__grid">
                    {valuePillars.map((p) => (
                        <ValueCard key={p.num} pillar={p} />
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Equipo ───────────────────────────────────────────────────────────────────

function TeamCard({ member }: { member: TeamMember }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="about-tc">
            <div className={`about-tc__top ${member.headerClass ?? ''}`}>
                <div className="about-tc__pattern" />
                <div className="about-tc__year-bg">
                    {member.id === 'yeizer' ? 'CTO' : 'CEO'}
                </div>
                <div className="about-tc__avatar">
                    <img
                        src={member.imagen}
                        alt={member.name}
                        className="about-tc__avatar-img"
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.removeAttribute('style');
                        }}
                    />
                </div>
                <div className="about-tc__header-info">
                    <div className="about-tc__name">{member.name}</div>
                    <div className="about-tc__role-tag">{member.roleTag}</div>
                </div>
            </div>

            <div className="about-tc__body">
                <div className="about-tc__role-full">{member.roleFull}</div>
                <div className={`about-tc__desc-wrap ${open ? 'about-tc__desc-wrap--open' : ''}`}>
                    <p className="about-tc__desc">{member.desc}</p>
                </div>
                <button
                    className="about-tc__readmore"
                    onClick={() => setOpen((v) => !v)}
                >
                    {open ? 'Leer menos' : 'Leer más'}
                    {open ? <IconChevronUp /> : <IconChevronDown />}
                </button>
            </div>

            <div className="about-tc__foot">
                <div className="about-tc__socials">
                    {member.links.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={link.label}
                            className="about-tc__soc"
                        >
                            {link.icon}
                        </a>
                    ))}
                </div>
                <span className="about-tc__badge">{member.badge}</span>
            </div>
        </div>
    );
}

function TeamSection() {
    const { ref, visible } = useReveal();

    return (
        <section
            ref={ref}
            id="equipo"
            className={`about-team about-reveal ${visible ? 'about-reveal--visible' : ''}`}
        >
            <div className="about-team__header">
                <div className="about-eyebrow">
                    <span className="about-eyebrow__line" />
                    Las personas detrás
                    <span className="about-eyebrow__line" />
                </div>
                <h2 className="about-section-title">Nuestro equipo</h2>
                <p className="about-section-sub">
                    Dos vidas alineadas por un mismo propósito: expandir el Reino de Dios a través de la fe, la Palabra y la tecnología
                </p>
            </div>
            <div className="about-team__grid">
                {teamMembers.map((m) => (
                    <TeamCard key={m.id} member={m} />
                ))}
            </div>
        </section>
    );
}

// ─── CTA Final ────────────────────────────────────────────────────────────────

function FinalCta() {
    const { ref, visible } = useReveal();

    return (
        <section
            ref={ref}
            className={`about-final-cta about-reveal ${visible ? 'about-reveal--visible' : ''}`}
        >
            <div className="about-final-cta__inner">
                <div className="about-final-cta__cross" aria-hidden>
                    <div className="about-final-cta__cross-v" />
                    <div className="about-final-cta__cross-h" />
                </div>

                <h2 className="about-final-cta__title">
                    Descubre el poder de<br />
                    la Palabra de <em>Dios en tu vida</em>
                </h2>
                <p className="about-final-cta__sub">
                    Comprende y aplica las Escrituras con recursos diseñados para guiarte en un crecimiento espiritual real, práctico y transformador.
                </p>

                <a
                    href="/devocionales"
                    rel="noreferrer"
                    className="about-final-cta__btn"
                >
                    Comenzar mi crecimiento
                    <IconArrow />
                </a>
            </div>
        </section>
    );
}


// ─── ¿Por qué? / ¿Qué hacemos? / ¿A quién? / ¿Diferentes? ───────────────────

const faqItems = [
    {
        icon: <IconBook />,
        q: '¿Por qué nace esta plataforma?',
        a: 'Nace de una dirección de Dios, quien encendió la pasión por enseñar y guió la creación de este espacio para formar vidas y expandir su Reino.',
        aside: null,
    },
    {
        icon: <IconGlobe />,
        q: '¿Qué hacemos?',
        a: 'Brindamos contenido y recursos diseñados para enseñar, formar y fortalecer el crecimiento espiritual y personal.',
        aside: {
            col1: { label: 'Contenido', items: ['Devocionales', 'Estudios bíblicos', 'Series', 'Podcast', 'Obras sociales'] },
            col2: { label: 'Recursos', items: ['Libros', 'Cursos', 'Programas', 'Masterclasses'] },
        },
    },
    {
        icon: <IconPeople />,
        q: '¿A quién impactamos?',
        a: 'A toda persona que desea aprender y vivir la Palabra de Dios. Llevamos el mensaje sin límites ni fronteras, alcanzando vidas en todo lugar, con el propósito de formar discípulos hasta los confines de la tierra.',
        aside: null,
    },
    {
        icon: <IconShield />,
        q: '¿Qué nos hace diferentes?',
        a: 'No solo compartimos contenido, formamos vidas. Enseñamos la Palabra de forma clara y práctica para que cada persona viva el propósito de Dios y avance sin perder tiempo ni recursos fuera de su llamado.',
        aside: null,
    },
];

function FaqSection() {
    const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
    const spineRef = useRef<HTMLDivElement>(null);
    const fillRef = useRef<HTMLDivElement>(null);
    const [activated, setActivated] = useState<Set<number>>(new Set());

    useEffect(() => {
        const onScroll = () => {
            const wh = window.innerHeight;
            const spine = spineRef.current;
            const fill = fillRef.current;

            // Animar línea de progreso igual que el timeline
            if (spine && fill) {
                const sr = spine.getBoundingClientRect();
                const pct = Math.min(1, Math.max(0, (wh * 0.65 - sr.top) / sr.height));
                fill.style.height = `${pct * sr.height}px`;
            }

            // Activar cada tarjeta cuando entra en viewport
            const next = new Set(activated);
            nodeRefs.current.forEach((el, i) => {
                if (el && el.getBoundingClientRect().top + 80 < wh * 0.78) {
                    next.add(i);
                }
            });
            setActivated(next);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <section className="about-narrative" id="razon">

            {/* Cabecera centrada */}
            <div className="about-narrative__head">
                <div className="about-eyebrow">
                    <span className="about-eyebrow__line" />
                    Nuestra razón de ser
                    <span className="about-eyebrow__line" />
                </div>
                <h2 className="about-section-title">Conócenos más</h2>
                <p className="about-narrative__head-sub">
                    Cuatro preguntas que definen todo lo que hacemos
                </p>
            </div>

            {/* Contenedor con línea central */}
            <div className="about-narrative__track">

                {/* Línea vertical — igual que el timeline */}
                <div className="about-narrative__spine" ref={spineRef}>
                    <div className="about-narrative__spine-fill" ref={fillRef} />
                </div>

                {faqItems.map((item, i) => {
                    const isRight = i % 2 === 0;
                    const isActive = activated.has(i);
                    return (
                        <div
                            key={i}
                            ref={el => { nodeRefs.current[i] = el; }}
                            className={[
                                'about-narrative__node',
                                isRight ? 'about-narrative__node--right' : 'about-narrative__node--left',
                                isActive ? 'about-narrative__node--active' : '',
                            ].join(' ')}
                        >
                            {/* Tarjeta — ocupa el lado que le toca */}
                            <div className={`about-narrative__content ${isActive ? 'about-narrative__content--visible' : ''}`}>

                                {/* Número del año — decorativo, naranja tenue */}
                                <div className={`about-narrative__num ${isActive ? 'about-narrative__num--active' : ''}`}>
                                    {String(i + 1).padStart(2, '0')}
                                </div>

                                {/* Tag */}
                                <div className={`about-tl__tag ${isActive ? '' : ''}`} style={{ marginBottom: 12 }}>
                                    {item.q.replace('¿', '').replace('?', '')}
                                </div>

                                {/* Card */}
                                <div className={`about-tl__card ${isActive ? '' : ''}`}>
                                    <div className="about-tl__card-accent" />
                                    <div className="about-tl__icon-chip">{item.icon}</div>
                                    <div className="about-tl__card-title">{item.q}</div>
                                    <p className="about-tl__card-body">{item.a}</p>
                                    {item.aside && (
                                        <div className="about-faq__item-cols" style={{ marginTop: 14 }}>
                                            {Object.values(item.aside).map((col, ci) => (
                                                <div key={ci} className="about-faq__col">
                                                    <div className="about-faq__col-label">{col.label}</div>
                                                    <ul className="about-faq__col-list">
                                                        {col.items.map((it) => (
                                                            <li key={it}>
                                                                <span className="about-faq__col-dot" />
                                                                {it}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Punto en la línea central */}
                            <div className={`about-tl__dot ${isActive ? 'about-tl__node--activated' : ''}`}
                                style={{ position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)', zIndex: 2 }}
                            />

                            {/* Lado vacío — espejo */}
                            <div className="about-narrative__spacer" />
                        </div>
                    );
                })}

                {/* Conector hacia el timeline — texto + flecha */}
                <div className="about-narrative__bridge">
                    <div className="about-narrative__bridge-line" />
                    {/* <div className="about-narrative__bridge-label">Nuestra historia</div> */}
                    <div className="about-narrative__bridge-arrow">
                        <svg viewBox="0 0 24 24" width={14} height={14} fill="none"
                            stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                            <path d="M12 5v14M5 12l7 7 7-7" />
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Misión + Visión ──────────────────────────────────────────────────────────

function MisionVisionSection() {
    const { ref, visible } = useReveal();
    return (
        <section
            ref={ref}
            className={`about-mv about-reveal ${visible ? 'about-reveal--visible' : ''}`}
        >
            <div className="about-mv__inner">
                <div className="about-mv__card about-mv__card--mision">
                    <div className="about-mv__card-accent" />
                    <div className="about-mv__card-label">Nuestra misión</div>
                    <h3 className="about-mv__card-title">
                        Capacitar al pueblo<br />de Dios
                    </h3>
                    <p className="about-mv__card-body">
                        Capacitar al pueblo de Dios para vivir con excelencia conforme a los principios bíblicos, desarrollando su potencial espiritual y personal. Nuestro enfoque es claro: <span style={{ fontStyle: 'italic' }}>"ayudar a las personas a comprender las palabras del que murió en la cruz"</span>, para que vivan la voluntad de Dios y se conviertan en instrumentos en sus planes para otros.
                    </p>
                    <div className="about-mv__card-verse">
                        "Id y haced discípulos... enseñándoles"
                        <span>Mateo 28:19-20</span>
                    </div>
                </div>

                <div className="about-mv__card about-mv__card--vision">
                    <div className="about-mv__card-accent" />
                    <div className="about-mv__card-label">Nuestra visión</div>
                    <h3 className="about-mv__card-title">
                        Líderes en la Palabra<br />a nivel mundial
                    </h3>
                    <p className="about-mv__card-body">
                        Ser líderes a nivel mundial en fomentar la lectura, comprensión y aplicación de la Palabra de Dios, brindando herramientas para su correcta interpretación. Esto se desarrolla a través de una comunión constante con el Espíritu Santo, quien nos enseña, nos redarguye, nos corrige y nos instruye para entenderla y vivirla.
                    </p>
                    <div className="about-mv__card-verse">
                        "Toda la Escritura es inspirada por Dios y útil para formar vidas preparadas para toda buena obra"
                        <span>2 Timoteo 3:16–17</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Cobertura Espiritual ─────────────────────────────────────────────────────

function CoberturaSection() {
    const { ref, visible } = useReveal();
    return (
        <section
            ref={ref}
            className={`about-cobertura about-reveal ${visible ? 'about-reveal--visible' : ''}`}
        >
            <div className="about-cobertura__inner">
                <div className="about-cobertura__icon">
                    <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="rgba(247,88,21,.8)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                    </svg>
                </div>
                <div className="about-cobertura__label">Cobertura espiritual</div>
                <p className="about-cobertura__body">
                    Actualmente, caminamos en formación y crecimiento constante a través de nuestra iglesia local y de maestros que Dios ha puesto como referencia espiritual, de quienes aprendemos y somos edificados, manteniéndonos alineados a la verdad de su Palabra.
                </p>
            </div>
        </section>
    );
}


// ─── Página principal ─────────────────────────────────────────────────────────

export default function About() {
    return (
        <div className="about-root">
            <PageLayout>
                <main>
                    <Hero />
                    <FaqSection />
                    <MisionVisionSection />
                    <PilaresSection />
                    <JourneyIntro />
                    <TimelineSection />
                    <CoberturaSection />
                    <TeamSection />
                    <FinalCta />
                </main>
            </PageLayout>
        </div>
    );
}