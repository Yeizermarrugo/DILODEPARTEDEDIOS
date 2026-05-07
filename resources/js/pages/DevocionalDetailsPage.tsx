import LikeButton from '@/components/LikeButton';
import { ShareButton } from '@/components/ShareButton';
import TextToSpeechButton from '@/components/TextToSpeechButton';
import { useImagePreload } from '@/components/useImagePreload';
import { Head, Link, usePage } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import '../../css/devocionalDetails.css';

type Devocional = {
    id?: string;
    titulo?: string;
    contenido: string;
    imagen: string;
    created_at?: string;
    autor?: string;
    is_devocional?: number; // 0=estudio | 1=devocional | 2=ensenanza
    views_count?: number;
    shares_count?: number;
};

type NavItem = {
    id: string;
    categoria: string;
    crosses_book: boolean;
};

type StudyNav = {
    prev: NavItem | null;
    next: NavItem | null;
    current_book: string | null;
    position_in_book: number | null;
    total_in_book: number;
};

type Props = {
    devocional: Devocional;
    like_type?: 'devocional' | 'estudio' | 'ensenanza';
    nav?: StudyNav | null;
};

function getContentType(is_devocional?: number | string): 'devocional' | 'estudio' | 'ensenanza' {
    const val = Number(is_devocional);
    if (val === 0) return 'estudio';
    if (val === 2) return 'ensenanza';
    return 'devocional';
}

const StudyNavigation = ({ nav }: { nav: StudyNav }) => {
    const progressPct = nav.position_in_book && nav.total_in_book
        ? Math.round((nav.position_in_book / nav.total_in_book) * 100)
        : 0;

    return (
        <div className="study-nav">
            <div className="study-nav__header">
                <span className="study-nav__book-name">{nav.current_book}</span>
                {nav.position_in_book != null && (
                    <span className="study-nav__counter">
                        {nav.position_in_book} / {nav.total_in_book}
                    </span>
                )}
            </div>

            <div className="study-nav__progress-bar">
                <div
                    className="study-nav__progress-fill"
                    style={{ width: `${progressPct}%` }}
                />
            </div>

            <div className="study-nav__buttons">
                {nav.prev ? (
                    <Link
                        href={`/estudio-biblico/${nav.prev.id}`}
                        className={`study-nav__btn study-nav__btn--prev${nav.prev.crosses_book ? ' study-nav__btn--cross-book' : ''}`}
                        title={nav.prev.crosses_book ? `Libro anterior: ${nav.prev.categoria}` : 'Estudio anterior'}
                    >
                        <ChevronLeft className="study-nav__icon" size={20} />
                        <span className="study-nav__label">
                            {nav.prev.crosses_book ? (
                                <>
                                    <small>Libro anterior</small>
                                    <strong>{nav.prev.categoria}</strong>
                                </>
                            ) : (
                                <span>Anterior</span>
                            )}
                        </span>
                    </Link>
                ) : (
                    <div className="study-nav__btn study-nav__btn--prev study-nav__btn--disabled">
                        <ChevronLeft className="study-nav__icon" size={20} />
                        <span className="study-nav__label">
                            <span>Inicio</span>
                        </span>
                    </div>
                )}

                {nav.next ? (
                    <Link
                        href={`/estudio-biblico/${nav.next.id}`}
                        className={`study-nav__btn study-nav__btn--next${nav.next.crosses_book ? ' study-nav__btn--cross-book' : ''}`}
                        title={nav.next.crosses_book ? `Siguiente libro: ${nav.next.categoria}` : 'Siguiente estudio'}
                    >
                        <span className="study-nav__label">
                            {nav.next.crosses_book ? (
                                <>
                                    <small>Siguiente libro</small>
                                    <strong>{nav.next.categoria}</strong>
                                </>
                            ) : (
                                <span>Siguiente</span>
                            )}
                        </span>
                        <ChevronRight className="study-nav__icon" size={20} />
                    </Link>
                ) : (
                    <div className="study-nav__btn study-nav__btn--next study-nav__btn--disabled">
                        <span className="study-nav__label">
                            <span>Fin</span>
                        </span>
                        <ChevronRight className="study-nav__icon" size={20} />
                    </div>
                )}
            </div>
        </div>
    );
};

const DevocionalDetailsPage = (props: Props) => {
    const page = usePage().props as Record<string, unknown>;
    const devocional = props.devocional ?? (page.devocional as Devocional | undefined);
    const likeType = (props.like_type ?? (page.like_type as string | undefined) ?? getContentType(devocional?.is_devocional)) as 'devocional' | 'estudio' | 'ensenanza';
    const nav = (props.nav ?? (page.nav as StudyNav | undefined | null)) ?? null;

    const [loading, setLoading] = useState(true);
    const imageLoaded = useImagePreload(devocional?.imagen ?? '');

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(t);
    }, []);

    // ── Track view ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const devId = devocional?.id;
        if (!devId) return;

        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

        fetch(`/devocionales/${devId}/view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
            },
            body: JSON.stringify({ local_time: local }),
        });
    }, [devocional?.id]);

    if (!devocional) return <div>No se encontró el devocional.</div>;

    // ── Helpers ────────────────────────────────────────────────────────────────
    const getH1Text = (html: string) => html.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1].trim() ?? '';

    const splitH1Parts = (text: string): [string, string] => {
        const words = text.trim().split(/\s+/);
        const groupSize = Math.ceil(words.length / 2);
        return [words.slice(0, groupSize).join(' '), words.slice(groupSize, groupSize * 2).join(' ')];
    };

    const removeFirstH1 = (html: string) => html.replace(/<h1[^>]*>.*?<\/h1>/gi, '').trim();

    const decodeEntities = (str: string) => {
        if (typeof document === 'undefined') return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ');
        const el = document.createElement('textarea');
        el.innerHTML = str;
        return el.value;
    };

    const stripHtml = (html: string) => {
        if (typeof document === 'undefined') return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const el = document.createElement('div');
        el.innerHTML = html;
        return el.textContent || el.innerText || '';
    };

    const devocionalContent = removeFirstH1(devocional.contenido);

    const H1Custom = () => {
        const h1Text = getH1Text(devocional.contenido) || devocional.titulo || '';
        const [p1, p2] = splitH1Parts(decodeEntities(h1Text));
        return (
            <header
                className="header-modal"
                style={{
                    background: `url(${devocional.imagen}) center center no-repeat`,
                    backgroundSize: 'cover',
                    position: 'relative',
                    color: 'white',
                    zIndex: -2,
                }}
            >
                <h1 className="title" style={{ paddingTop: '70px', textTransform: 'uppercase' }}>
                    {p1} {p2}
                </h1>
            </header>
        );
    };

    const backHref = likeType === 'estudio' ? '/estudios' : likeType === 'ensenanza' ? '/series' : '/devocionales';

    if (loading && !imageLoaded) {
        return (
            <div id="preloader" className="d-flex align-items-center justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="devocional">
            <Head title={`Dilo de parte de Dios | ${devocional.titulo ?? 'Contenido'}`} />
            <a href={backHref} className="back-floating-button">
                <i className="bi bi-arrow-left" /> Atrás
            </a>

            <H1Custom />

            <section style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '100%', position: 'relative' }}>
                <TextToSpeechButton texto={stripHtml(devocional.contenido ?? '')} />

                <p style={{ padding: '5px', textAlign: 'justify' }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(devocionalContent) }}
                />

                <p style={{ color: '#888', display: 'flex', justifyContent: 'flex-end', padding: '0 20px 0 0' }}>
                    {devocional.autor ?? ''}
                </p>

                <div style={{ color: '#888', display: 'flex', justifyContent: 'flex-end', padding: '0 20px 10px 0' }}>
                    {devocional.created_at
                        ? new Date(devocional.created_at)
                            .toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                            .replace(/^\w/, c => c.toUpperCase())
                        : ''}
                </div>

                {/* ── Vistas + Compartir + Like al pie de la página ── */}
                {devocional.id && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '8px',
                        padding: '12px 20px 4px 0',
                        borderTop: '1px solid #f0f0f0',
                        marginTop: '8px',
                        color: '#888',
                    }}>
                        <i className="bi bi-eye" style={{ fontSize: '20px' }} />
                        <span>{devocional.views_count ?? 0}</span>
                        <ShareButton type={likeType} id={devocional.id} sharesCount={devocional.shares_count ?? 0} variant="default" />
                        <LikeButton type={likeType} id={devocional.id} variant="default" />
                    </div>
                )}

                {nav && likeType === 'estudio' && <StudyNavigation nav={nav} />}
            </section>
        </div>
    );
};

export default DevocionalDetailsPage;
