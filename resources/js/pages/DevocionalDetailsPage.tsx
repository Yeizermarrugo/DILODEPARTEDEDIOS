import LikeButton from '@/components/LikeButton';
import { ShareButton } from '@/components/ShareButton';
import TextToSpeechButton from '@/components/TextToSpeechButton';
import { useImagePreload } from '@/components/useImagePreload';
import { Link, usePage } from '@inertiajs/react';
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

type SeriesNavEp = {
    id: string;
    titulo: string;
    visible: boolean;
    publish_at: string;
};

type SeriesNav = {
    serie_titulo: string;
    serie_id: string;
    position: number;
    total: number;
    prev: SeriesNavEp | null;
    next: SeriesNavEp | null;
};

type Props = {
    devocional: Devocional;
    like_type?: 'devocional' | 'estudio' | 'ensenanza';
    nav?: StudyNav | null;
    series_nav?: SeriesNav | null;
};

function getContentType(is_devocional?: number | string): 'devocional' | 'estudio' | 'ensenanza' {
    const val = Number(is_devocional);
    if (val === 3) return 'estudio';
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

function useCountdown(targetIso: string | null) {
    const [time, setTime] = useState<{ h: number; m: number; s: number } | null>(null);

    useEffect(() => {
        if (!targetIso) { setTime(null); return; }

        const tick = () => {
            const diff = new Date(targetIso).getTime() - Date.now();
            if (diff <= 0 || diff >= 24 * 3600 * 1000) { setTime(null); return; }
            const totalSec = Math.floor(diff / 1000);
            setTime({ h: Math.floor(totalSec / 3600), m: Math.floor((totalSec % 3600) / 60), s: totalSec % 60 });
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [targetIso]);

    return time;
}

const SeriesNavigation = ({ nav }: { nav: SeriesNav }) => {
    const progressPct = Math.round((nav.position / nav.total) * 100);
    const nextCountdown = useCountdown(nav.next && !nav.next.visible ? nav.next.publish_at : null);
    const pad = (n: number) => String(n).padStart(2, '0');

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
            .replace(/^\w/, c => c.toUpperCase());

    return (
        <div className="study-nav">
            <div className="study-nav__header">
                <span className="study-nav__book-name">{nav.serie_titulo}</span>
                <span className="study-nav__counter">{nav.position} / {nav.total}</span>
            </div>

            <div className="study-nav__progress-bar">
                <div className="study-nav__progress-fill" style={{ width: `${progressPct}%` }} />
            </div>

            <div className="study-nav__buttons">
                {nav.prev && nav.prev.visible ? (
                    <Link href={`/series/${nav.prev.id}`} className="study-nav__btn study-nav__btn--prev">
                        <ChevronLeft className="study-nav__icon" size={20} />
                        <span className="study-nav__label"><span>Anterior</span></span>
                    </Link>
                ) : (
                    <div className="study-nav__btn study-nav__btn--prev study-nav__btn--disabled">
                        <ChevronLeft className="study-nav__icon" size={20} />
                        <span className="study-nav__label"><span>Inicio</span></span>
                    </div>
                )}

                {nav.next ? (
                    nav.next.visible ? (
                        <Link href={`/series/${nav.next.id}`} className="study-nav__btn study-nav__btn--next">
                            <span className="study-nav__label"><span>Siguiente</span></span>
                            <ChevronRight className="study-nav__icon" size={20} />
                        </Link>
                    ) : (
                        <div className="study-nav__btn study-nav__btn--next study-nav__btn--upcoming">
                            <span className="study-nav__label">
                                <small>Próximamente</small>
                                {nextCountdown ? (
                                    <span className="study-nav__countdown">
                                        {pad(nextCountdown.h)}:{pad(nextCountdown.m)}:{pad(nextCountdown.s)}
                                    </span>
                                ) : (
                                    <strong>{formatDate(nav.next.publish_at)}</strong>
                                )}
                            </span>
                            <ChevronRight className="study-nav__icon" size={20} />
                        </div>
                    )
                ) : (
                    <div className="study-nav__btn study-nav__btn--next study-nav__btn--disabled">
                        <span className="study-nav__label"><span>Fin</span></span>
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
    const seriesNav = (props.series_nav ?? (page.series_nav as SeriesNav | undefined | null)) ?? null;

    const [loading, setLoading] = useState(typeof window !== 'undefined');
    const [viewsCount, setViewsCount] = useState(devocional?.views_count ?? 0);
    const imageLoaded = useImagePreload(devocional?.imagen ?? '');

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(t);
    }, []);

    // ── Track view ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const devId = devocional?.id;
        if (!devId) return;

        setViewsCount(devocional?.views_count ?? 0);

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
        })
            .then(r => r.json())
            .then((data: { status: string }) => {
                if (data.status === 'recorded') {
                    setViewsCount(c => c + 1);
                }
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
            <a href={backHref} className="back-floating-button">
                <i className="bi bi-arrow-left" /> Atrás
            </a>

            <H1Custom />

            <section style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '100%', position: 'relative' }}>
                <TextToSpeechButton html={devocional.contenido ?? ''} />

                <div className="devocional-content" style={{ padding: '5px', textAlign: 'justify' }}
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
                        <span>{viewsCount}</span>
                        <ShareButton type={likeType} id={devocional.id} sharesCount={devocional.shares_count ?? 0} variant="default" />
                        <LikeButton type={likeType} id={devocional.id} variant="default" />
                    </div>
                )}

                {nav && likeType === 'estudio' && <StudyNavigation nav={nav} />}
                {seriesNav && likeType === 'ensenanza' && <SeriesNavigation nav={seriesNav} />}
            </section>
        </div>
    );
};

export default DevocionalDetailsPage;
