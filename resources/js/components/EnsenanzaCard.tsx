// src/components/EnsenanzaCard.tsx
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { useState } from 'react';

type DevocionalEnsenanza = {
    id: string;
    titulo: string;
    contenido: string;
    autor?: string | null;
    pdf?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
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
    const [open, setOpen] = useState(false);

    const autoresLabel =
        ensenanza.autores.length === 0
            ? 'Autor desconocido'
            : ensenanza.autores.join(', ');

    return (
        <div
            className="ensenanza-card"
            style={{
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid #e0e0e0',
                marginBottom: 12,
                backgroundColor: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                width: '100%',
            }}
        >
            {/* Parte superior: card horizontal */}
            <div
                className="ensenanza-card-top"
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 10,
                    padding: 10,
                }}
            >
                {/* Imagen izquierda */}
                <div
                    style={{
                        flex: '0 0 150px',
                        maxWidth: 150,
                        height: 120,
                        borderRadius: 8,
                        overflow: 'hidden',
                        backgroundColor: '#f5f5f5',
                    }}
                >
                    {ensenanza.imagen && (
                        <img
                            src={ensenanza.imagen}
                            alt={ensenanza.titulo}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                            }}
                        />
                    )}
                </div>

                {/* Info derecha */}
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                    }}
                >
                    {/* Fila título + count */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 12,
                        }}
                    >
                        <h3
                            style={{
                                margin: 0,
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: '#212529',
                                textTransform: 'uppercase',
                            }}
                        >
                            Serie: {ensenanza.titulo}
                        </h3>

                        <div
                            style={{
                                minWidth: 52,
                                textAlign: 'center',
                                padding: '2px 8px',
                                borderRadius: 16,
                                backgroundColor: '#f1f3f5',
                                fontSize: 11,
                                fontWeight: 500,
                                color: '#495057',
                            }}
                        >
                            {ensenanza.ensenanzas_count}
                        </div>
                    </div>

                    {/* Descripción */}
                    <p
                        style={{
                            margin: '8px 20px 0 0',
                            fontSize: 12,
                            color: '#495057',
                            lineHeight: 1.5,
                            textAlign: 'justify',
                        }}
                    >
                        {ensenanza.descripcion}
                    </p>

                    {/* Autores (sin marginTop:auto para que no genere huecos raros) */}
                    <div
                        style={{
                            fontSize: 11,
                            color: '#6c757d',
                            borderTop: '1px solid #e9ecef',
                            paddingTop: 6,
                            marginTop: 8,
                        }}
                    >
                        <strong>Autor(es):</strong> {autoresLabel}
                    </div>
                </div>
            </div>

            {/* Dropdown / lista de devocionales */}
            <div
                style={{
                    borderTop: '1px solid #e9ecef',
                    backgroundColor: '#ebebeb',
                }}
            >
                {/* Cabecera del dropdown de devocionales */}
                <button
                    onClick={() => setOpen((o) => !o)}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#343a40',
                        textTransform: 'uppercase',
                    }}
                >
                    <span>
                        <strong>Enseñanzas</strong>
                    </span>
                    <KeyboardArrowDown
                        style={{
                            transition: 'transform 0.2s ease',
                            transform: open ? 'rotate(-180deg)' : 'rotate(0deg)',
                        }}
                    />
                </button>

                {open && (
                    <div
                        style={{
                            borderTop: '1px solid #e9ecef',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {(ensenanza.devocionales || []).map((dev) => (
                            <DevocionalRow
                                key={dev.id}
                                ensenanzaId={ensenanza.id}
                                devocional={dev}
                            />
                        ))}

                        {(!ensenanza.devocionales ||
                            ensenanza.devocionales.length === 0) && (
                                <div
                                    style={{
                                        padding: '10px 16px',
                                        fontSize: 13,
                                        color: '#868e96',
                                        borderTop: '1px solid #e9ecef',
                                    }}
                                >
                                    No hay devocionales registrados para esta enseñanza todavía.
                                </div>
                            )}
                    </div>
                )}
            </div>
        </div>
    );
}

type DevRowProps = {
    ensenanzaId: string;
    devocional: DevocionalEnsenanza;
};

function DevocionalRow({ ensenanzaId, devocional }: DevRowProps) {
    const [open, setOpen] = useState(false);

    return (
        <div
            style={{
                borderTop: '1px solid #e9ecef',
            }}
        >
            {/* Cabecera del devocional (dropdown propio) */}
            <button
                onClick={() => setOpen((o) => !o)}
                style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    background: '#f8f9fa',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 2,
                    }}
                >
                    <span
                        style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#212529',
                        }}
                    >
                        <strong>{devocional.titulo}</strong>
                    </span>
                </div>
                <KeyboardArrowDown
                    style={{
                        fontSize: 20,
                        transition: 'transform 0.2s ease',
                        transform: open ? 'rotate(-180deg)' : 'rotate(0deg)',
                        color: '#868e96',
                    }}
                />
            </button>

            {/* Acciones del devocional */}
            {open && (
                <div
                    style={{
                        borderTop: '1px solid #e9ecef',
                        display: 'grid',
                        borderRadius: 0,
                        overflow: 'hidden',
                    }}
                >
                    {devocional.id && (
                        <ActionRow
                            label="Leer"
                            href={`/ensenanzas/${devocional.id}`}
                        />
                    )}
                    {devocional.pdf && (
                        <ActionRow
                            label="Descargar PDF"
                            href={devocional.pdf}
                            target="_blank"
                        />
                    )}
                    {devocional.instagram && (
                        <ActionRow
                            label="Formato reducido"
                            href={devocional.instagram}
                            target="_blank"
                        />
                    )}
                    {devocional.tiktok && (
                        <ActionRow
                            label="Formato reels"
                            href={devocional.tiktok}
                            target="_blank"
                        />
                    )}
                </div>
            )}
        </div>
    );
}

type RowProps = {
    label: string;
    href: string;
    target?: string;
};

function ActionRow({ label, href, target }: RowProps) {
    return (
        <a
            href={href}
            style={{
                textDecoration: 'none',
                color: 'inherit',
            }}
            target={target}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    fontSize: 13,
                    borderRight: '1px solid #e9ecef',
                    borderBottom: '1px solid #e9ecef',
                    cursor: 'pointer',
                    backgroundColor: '#fff',
                }}
            >
                <span>{label}</span>
            </div>
        </a>
    );
}
