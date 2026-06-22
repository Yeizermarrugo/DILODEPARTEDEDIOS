import LikeButton from '@/components/LikeButton';
import { useEffect, useRef, useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type DevocionalEnsenanza = {
    id: string;
    titulo: string;
    contenido: string;
    autor?: string | null;
    pdf?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
    views_count?: number | null;
    hidden?: boolean;
    created_at?: string | null;
};

type EnsenanzaItem = {
    id: string;
    slug: string;
    titulo: string;
    descripcion: string;
    imagen: string | null;
    ensenanzas_count: number;
    autores: string[];
    devocionales?: DevocionalEnsenanza[];
};

type Props = { ensenanza: EnsenanzaItem };

type DevRowProps = {
    dev: DevocionalEnsenanza;
    idx: number;
    isEven: boolean;
    disabled?: boolean;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
}

function formatShortDate(value?: string | null): string {
    if (!value) return '';

    return new Date(value).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Bogota',
    });
}

function formatCountdown(target: Date, now: Date): string {
    const remaining = Math.max(0, target.getTime() - now.getTime());
    const totalSeconds = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EnsenanzaCard({ ensenanza }: Props) {
    const devocionales = ensenanza.devocionales ?? [];
    const hasEpisodes = devocionales.length > 0;
    const published = devocionales.filter((d) => !d.hidden);
    const isComingSoon = published.length === 0;
    const firstEpisode = devocionales[0];
    const firstPublishTime = firstEpisode?.created_at ? new Date(firstEpisode.created_at).getTime() : null;
    const firstPublishDate = firstPublishTime ? new Date(firstPublishTime) : null;
    const sinImagen = !ensenanza.imagen;
    const sinDesc = !ensenanza.descripcion?.trim();

    // Lógica para mostrar el diseño de Próximamente espectacular
    const esPróximamente = sinImagen && sinDesc && !hasEpisodes;

    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showMoreBtn, setShowMoreBtn] = useState(false);
    const [now, setNow] = useState(() => new Date());
    const descRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const check = () => {
            if (descRef.current) {
                setShowMoreBtn(descRef.current.scrollHeight > descRef.current.clientHeight + 2);
            }
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, [ensenanza.descripcion]);

    useEffect(() => {
        if (!isComingSoon || !firstPublishTime) return;

        const interval = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(interval);
    }, [firstPublishTime, isComingSoon]);

    const totalViews = published.reduce((s, d) => s + (d.views_count ?? 0), 0);
    const authorFirst = ensenanza.autores[0] ?? 'Autor desconocido';
    const msUntilFirstPublish = firstPublishDate ? firstPublishDate.getTime() - now.getTime() : null;
    const showCountdown =
        msUntilFirstPublish !== null &&
        msUntilFirstPublish > 0 &&
        msUntilFirstPublish < 24 * 60 * 60 * 1000;
    const upcomingText = firstPublishDate
        ? `Próximamente: ${showCountdown ? formatCountdown(firstPublishDate, now) : formatShortDate(firstEpisode?.created_at)}`
        : 'Próximamente';

    return (
        <div className={`ens-card ${esPróximamente ? 'ens-card--coming' : ''}`}>

            {/* ── DISEÑO PRÓXIMAMENTE ESPECTACULAR ── */}
            {esPróximamente && (
                <div className="ens-card--coming-container">
                    <div className="ens-card--coming-overlay" />
                    <div className="ens-card--coming-strip">
                        <span className="ens-card--coming-title">{ensenanza.titulo}</span>
                        <span className="ens-card--coming-text">PRÓXIMAMENTE</span>
                    </div>
                </div>
            )}

            {/* ── COVER ── */}
            <div className="ens-cover">
                {ensenanza.imagen ? (
                    <img
                        src={ensenanza.imagen}
                        alt={ensenanza.titulo}
                        className="ens-cover__img"
                        loading="lazy"
                    />
                ) : (
                    <div className="ens-cover__placeholder">
                        <span className="ens-cover__placeholder-letter">
                            {ensenanza.titulo[0]?.toUpperCase() ?? 'S'}
                        </span>
                    </div>
                )}

                <div className="ens-cover__overlay" />

                {/* Badge visible siempre (incluso en próximamente) */}
                {/* <div className="ens-cover__badge" style={{ zIndex: 30 }}>
                    {ensenanza.ensenanzas_count} ens.
                </div> */}

                <div className="ens-cover__info">
                    {ensenanza.autores.length === 1 && (
                        <div className="ens-cover__author">
                            <span className="ens-cover__avatar">
                                {initials(authorFirst)}
                            </span>
                            <span className="ens-cover__author-name">{authorFirst}</span>
                        </div>
                    )}
                    {ensenanza.autores.length > 1 && (
                        <div className="ens-cover__author ens-cover__author--multi">
                            <div className="ens-cover__facepile">
                                {ensenanza.autores.slice(0, 4).map((a, i) => (
                                    <span
                                        key={i}
                                        className="ens-cover__avatar ens-cover__avatar--pile"
                                        style={{ zIndex: ensenanza.autores.length - i }}
                                        title={a}
                                    >
                                        {initials(a)}
                                    </span>
                                ))}
                            </div>
                            <span className="ens-cover__author-name">
                                {ensenanza.autores.join(' · ')}
                            </span>
                        </div>
                    )}
                    <h3 className="ens-cover__title">{ensenanza.titulo}</h3>
                </div>
            </div>

            {/* ── CUERPO ── */}
            <div className="ens-body">
                {!sinDesc ? (
                    <div className="ens-desc-wrap">
                        <p
                            ref={descRef}
                            className={`ens-desc ${isExpanded ? 'ens-desc--expanded' : ''}`}
                        >
                            {ensenanza.descripcion}
                        </p>
                        {(showMoreBtn || isExpanded) && (
                            <button
                                className="ens-desc__toggle"
                                onClick={() => setIsExpanded((v) => !v)}
                            >
                                {isExpanded ? 'ver menos' : 'ver más'}
                            </button>
                        )}
                    </div>
                ) : (
                    /* Espacio reservado para que la card de próximamente mida lo mismo */
                    <div className="ens-body__placeholder" style={{ flex: 1, minHeight: '60px' }} />
                )}

                {/* Stats visibles siempre (incluso en próximamente) */}
                <div className="ens-stats">
                    <div className="ens-stats__item">
                        <i className="bi bi-play-circle" style={{ fontSize: 13 }} />
                        <span>{ensenanza.ensenanzas_count} enseñanzas</span>
                    </div>
                    {!esPróximamente && (
                        <>
                            <div className="ens-stats__dot" />
                            <div className="ens-stats__item">
                                <i className="bi bi-eye" style={{ fontSize: 13 }} />
                                <span>{totalViews} vistas</span>
                            </div>
                        </>
                    )}
                    {isComingSoon && hasEpisodes && (
                        <>
                            <div className="ens-stats__dot" />
                            <div className="ens-stats__item ens-stats__item--upcoming">
                                <span>{upcomingText}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── FOOTER / DROPDOWN ── */}
            <div className="ens-footer-container">
                {!hasEpisodes ? (
                    <div className="ens-footer ens-footer--disabled">
                        <span>Sin enseñanzas publicadas aún</span>
                    </div>
                ) : (
                    <>
                        <button
                            className={`ens-trigger ${isOpen ? 'ens-trigger--open' : ''}`}
                            onClick={() => setIsOpen((v) => !v)}
                            aria-expanded={isOpen}
                        >
                            <span className="ens-trigger__label">
                                <span className="ens-trigger__dot" />
                                {isOpen ? 'Cerrar enseñanzas' : 'Ver enseñanzas'}
                            </span>
                            <span className="ens-trigger__chevron">
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    style={{ transition: 'transform .25s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </span>
                        </button>

                        {isOpen && (
                            <div className="ens-panel">
                                {devocionales.map((dev, idx) => (
                                    <DevRow
                                        key={dev.id}
                                        dev={dev}
                                        idx={idx + 1}
                                        isEven={idx % 2 === 1}
                                        disabled={!!dev.hidden}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function DevRow({ dev, idx, isEven, disabled = false }: DevRowProps) {
    const [open, setOpen] = useState(false);

    if (disabled) {
        return (
            <div className={`dev-row dev-row--disabled ${isEven ? 'dev-row--even' : ''}`}>
                <div className="dev-row__head">
                    <span className="dev-row__num">{String(idx).padStart(2, '0')}</span>
                    <span className="dev-row__title">{dev.titulo}</span>
                    <div className="dev-row__meta">
                        <span className="dev-row__badge-soon">Próximamente</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`dev-row ${isEven ? 'dev-row--even' : ''}`}>
            <button
                className={`dev-row__head ${open ? 'dev-row__head--open' : ''}`}
                onClick={() => setOpen((v) => !v)}
            >
                <span className="dev-row__num">{String(idx).padStart(2, '0')}</span>
                <span className="dev-row__title">{dev.titulo}</span>

                <div className="dev-row__meta">
                    <span className="dev-row__stat">
                        <i className="bi bi-eye" style={{ fontSize: 11 }} />
                        {dev.views_count ?? 0}
                    </span>
                    <span className="dev-row__like" onClick={(e) => e.stopPropagation()}>
                        <LikeButton type="ensenanza" id={dev.id} variant="default" />
                    </span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                        style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0)', flexShrink: 0 }}>
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </div>
            </button>

            {open && (
                <div className="dev-row__actions">
                    <a href={`/series/${dev.id}`} className="dev-action dev-action--primary">
                        <i className="bi bi-book-open" style={{ fontSize: 12 }} /> Leer
                    </a>
                    {dev.pdf && (
                        <a href={dev.pdf} target="_blank" rel="noopener noreferrer" className="dev-action dev-action--pdf">
                            <i className="bi bi-file-earmark-pdf" style={{ fontSize: 12 }} /> PDF
                        </a>
                    )}
                    {dev.instagram && (
                        <a href={dev.instagram} target="_blank" rel="noopener noreferrer" className="dev-action dev-action--reducido">
                            <i className="bi bi-card-text" style={{ fontSize: 12 }} /> Reducido
                        </a>
                    )}
                    {dev.tiktok && (
                        <a href={dev.tiktok} target="_blank" rel="noopener noreferrer" className="dev-action dev-action--reel">
                            <i className="bi bi-camera-video" style={{ fontSize: 12 }} /> Reels
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
