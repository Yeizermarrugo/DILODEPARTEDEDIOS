import LikeButton from '@/components/LikeButton';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { useEffect, useRef, useState } from 'react';

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

type Props = {
    ensenanza: EnsenanzaItem;
};

export default function EnsenanzaCard({ ensenanza }: Props) {
    const devocionales = ensenanza.devocionales ?? [];

    const publishedDevotionals = devocionales.filter(
        (item) => String(item.is_devocional) === '1',
    );

    const isComingSoon = publishedDevotionals.length === 0;
    const isDropdownDisabled = publishedDevotionals.length === 0;

    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showBtn, setShowBtn] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const check = () => {
            if (textRef.current) setShowBtn(textRef.current.scrollHeight > textRef.current.clientHeight);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, [ensenanza.descripcion]);

    const autoresLabel = ensenanza.autores.join(', ') || 'Autor desconocido';
    const sinImagen = !ensenanza.imagen;
    const sinDescripcion = !ensenanza.descripcion?.trim();
    const esPróximamente = sinImagen && sinDescripcion;

    return (
        <div
            className="ensenanza-card"
            style={{
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid #e0e0e0',
                backgroundColor: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                width: '100%',
                // ── posición relativa para que la franja se ancle aquí ──
                position: 'relative',
            }}
        >
            {/* ══ FRANJA "PRÓXIMAMENTE" — solo aparece si no tiene imagen ni descripción ══ */}
            {esPróximamente && (
                <div style={{
                    position: 'absolute',
                    inset: 0,                          // cubre toda la card
                    zIndex: 10,
                    pointerEvents: 'none',             // no bloquea clicks del resto
                    overflow: 'hidden',
                    borderRadius: 10,
                }}>
                    {/* Overlay opaco sobre la card */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.73)',
                    }} />

                    {/* Franja diagonal */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(-8deg)',
                        width: '130%',
                        padding: '12px 0',
                        background: 'linear-gradient(90deg, #e8c840 0%, #f5d84a 50%, #e8c840 100%)',
                        textAlign: 'center',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                    }}>
                        <div>
                            <span style={{
                                color: '#1a1a2e',
                                fontSize: 15,
                                fontWeight: 900,
                                letterSpacing: '6px',
                                textTransform: 'uppercase',
                                fontFamily: 'serif',
                            }}>
                                {ensenanza.titulo}
                            </span>
                        </div>
                        <span style={{
                            color: '#1a1a2e',
                            fontSize: 20,
                            fontWeight: 900,
                            letterSpacing: '6px',
                            textTransform: 'uppercase',
                            fontFamily: 'serif',
                        }}>
                            PRÓXIMAMENTE
                        </span>
                    </div>
                </div>
            )}

            {/* ── Cabecera: imagen + info ── */}
            <div className="ensenanza-card-top" style={{ display: 'flex', flexDirection: 'row', gap: 10, padding: 10 }}>

                {/* Imagen */}
                <div style={{ flex: '0 0 150px', maxWidth: 150, height: 120, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f5f5f5', position: 'relative' }}>
                    {ensenanza.imagen && (
                        <img
                            src={ensenanza.imagen}
                            alt={ensenanza.titulo}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                    )}
                </div>

                {/* Info derecha */}
                <div className="ensenanza-card-info-right">
                    <div className="ensenanza-card-text-block">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#212529', textTransform: 'uppercase' }}>
                                Serie: {ensenanza.titulo}
                            </h3>
                            <div style={{ minWidth: 52, textAlign: 'center', padding: '2px 8px', borderRadius: 16, backgroundColor: '#f1f3f5', fontSize: 11, fontWeight: 500, color: '#495057' }}>
                                {ensenanza.ensenanzas_count}
                            </div>
                        </div>

                        <div style={{ position: 'relative' }}>
                            {ensenanza.descripcion?.trim() ? (
                                <>
                                    <p
                                        ref={textRef}
                                        className={`descripcion-texto ${isExpanded ? 'expandida' : 'colapsada'}`}
                                        style={{ margin: '8px 0 0 0', fontSize: 12, color: '#495057', lineHeight: '1.4', textAlign: 'justify' }}
                                    >
                                        {ensenanza.descripcion}
                                    </p>
                                    {(showBtn || isExpanded) && (
                                        <span
                                            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                                            style={{ fontSize: 12, color: '#007bff', cursor: 'pointer', fontWeight: 'bold', display: 'block', marginTop: '2px' }}
                                        >
                                            {isExpanded ? '...ver menos' : '...ver más'}
                                        </span>
                                    )}
                                </>
                            ) : null}
                        </div>
                    </div>

                    <div className="ensenanza-card-author">
                        <strong>Autor(es):</strong> {autoresLabel}
                    </div>
                </div>
            </div>

            {/* ── Dropdown ── */}
            <div className="ensenanza-card-dropdown" style={{ borderTop: '1px solid #e9ecef' }}>
                {isComingSoon ? (
                    <div style={{ width: '100%', padding: '12px 16px', backgroundColor: '#f8f9fa', color: '#adb5bd', textAlign: 'center', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', cursor: 'not-allowed' }}>
                        Próximamente
                    </div>
                ) : (
                    <>
                        <button
                            disabled={isDropdownDisabled}
                            onClick={() => setIsOpen(!isOpen)}
                            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', border: 'none', background: '#fff', cursor: isDropdownDisabled ? 'default' : 'pointer' }}
                        >
                            <span style={{ color: isDropdownDisabled ? '#adb5bd' : 'inherit' }}>
                                <strong>Enseñanzas</strong>
                            </span>
                            {!isDropdownDisabled && (
                                <KeyboardArrowDown style={{ transition: 'transform 0.2s ease', transform: isOpen ? 'rotate(-180deg)' : 'rotate(0deg)', color: '#666' }} />
                            )}
                        </button>

                        {isOpen && !isDropdownDisabled && (
                            <div className="ensenanza-card-devocionales-list">
                                {publishedDevotionals.map((dev) => (
                                    <DevocionalRow key={dev.id} devocional={dev} ensenanzaId={ensenanza.id} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// ─── DevocionalRow ────────────────────────────────────────────────────────────
type DevRowProps = {
    ensenanzaId: string;
    devocional: DevocionalEnsenanza;
};

function DevocionalRow({ devocional }: DevRowProps) {
    const [open, setOpen] = useState(false);

    return (
        <div style={{ borderTop: '1px solid #e9ecef' }}>
            <button
                onClick={() => setOpen((o) => !o)}
                style={{ width: '100%', padding: '10px 16px', border: 'none', background: '#f8f9fa', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', gap: 2, flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#212529' }}>
                        <strong>{devocional.titulo}</strong>
                    </span>
                </div>

                <i className="bi bi-eye" />
                <span>{devocional.views_count ?? 0}</span>
                <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', marginRight: 4 }}>
                    <LikeButton type="ensenanza" id={devocional.id} variant="default" />
                </div>

                <KeyboardArrowDown
                    style={{ fontSize: 20, transition: 'transform 0.2s ease', transform: open ? 'rotate(-180deg)' : 'rotate(0deg)', color: '#868e96', flexShrink: 0 }}
                />
            </button>

            {open && (
                <div style={{ borderTop: '1px solid #e9ecef', display: 'grid' }}>
                    {devocional.id && <ActionRow label="Leer" href={`/series/${devocional.id}`} />}
                    {devocional.pdf && <ActionRow label="Descargar PDF" href={devocional.pdf} target="_blank" />}
                    {devocional.instagram && <ActionRow label="Formato reducido" href={devocional.instagram} target="_blank" />}
                    {devocional.tiktok && <ActionRow label="Formato reels" href={devocional.tiktok} target="_blank" />}
                </div>
            )}
        </div>
    );
}

function ActionRow({ label, href, target }: { label: string; href: string; target?: string }) {
    return (
        <a href={href} style={{ textDecoration: 'none', color: 'inherit' }} target={target}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', fontSize: 13, borderRight: '1px solid #e9ecef', borderBottom: '1px solid #e9ecef', cursor: 'pointer', backgroundColor: '#fff' }}>
                <span>{label}</span>
            </div>
        </a>
    );
}