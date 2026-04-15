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
    is_devocional: boolean;
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
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EnsenanzaCard({ ensenanza }: Props) {
    const devocionales = ensenanza.devocionales ?? [];
    const published = devocionales.filter((d) => String(d.is_devocional) === '1');
    const isComingSoon = published.length === 0;
    const sinImagen = !ensenanza.imagen;
    const sinDesc = !ensenanza.descripcion?.trim();

    // Lógica para mostrar el diseño de Próximamente espectacular
    const esPróximamente = sinImagen && sinDesc;

    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showMoreBtn, setShowMoreBtn] = useState(false);
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

    const totalViews = published.reduce((s, d) => s + (d.views_count ?? 0), 0);
    const authorFirst = ensenanza.autores[0] ?? 'Autor desconocido';

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
                <div className="ens-cover__badge" style={{ zIndex: 30 }}>
                    {ensenanza.ensenanzas_count} ens.
                </div>

                <div className="ens-cover__info">
                    {ensenanza.autores.length > 0 && (
                        <div className="ens-cover__author">
                            <span className="ens-cover__avatar">
                                {initials(authorFirst)}
                            </span>
                            <span className="ens-cover__author-name">{authorFirst}</span>
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
                    {/* Solo mostrar vistas si NO es próximamente (ya que serían 0) */}
                    {!esPróximamente && (
                        <>
                            <div className="ens-stats__dot" />
                            <div className="ens-stats__item">
                                <i className="bi bi-eye" style={{ fontSize: 13 }} />
                                <span>{totalViews} vistas</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── FOOTER / DROPDOWN ── */}
            <div className="ens-footer-container">
                {esPróximamente ? (
                    <div className="ens-footer ens-footer--disabled">
                        <span>Próximamente disponible</span>
                    </div>
                ) : isComingSoon ? (
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
                                    width="12" height="12" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor"
                                    strokeWidth="2.5" strokeLinecap="round"
                                    style={{ transition: 'transform .25s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </span>
                        </button>

                        {isOpen && (
                            <div className="ens-panel">
                                {published.map((dev, idx) => (
                                    <DevRow
                                        key={dev.id}
                                        dev={dev}
                                        idx={idx + 1}
                                        isEven={idx % 2 === 1}
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

function DevRow({ dev, idx, isEven }: DevRowProps) {
    const [open, setOpen] = useState(false);

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