import { router } from '@inertiajs/react';
import '../../css/cardNew.css';
import { ShareButton } from './ShareButton';
import LikeButton from './LikeButton';

const colorArray = [
    '#ffabab', '#ff990086', '#c511627c', '#ffd6408c', '#0090ea9a',
    '#fc00009f', '#00e67791', '#7c4dff85', '#ff408085', '#FFD600',
    '#69F0AE', '#00B8D4', '#2979FF', '#304FFE', '#AA00FF',
];

function buildCategoryColorMap(todasLasCategorias: string[]) {
    const map: { [categoria: string]: string } = {};
    todasLasCategorias.forEach((cat, idx) => {
        map[cat] = colorArray[idx] ?? '#FFFFFF';
    });
    return map;
}

interface DevItem {
    id: string;
    imagen: string;
    titulo: string;
    autor: string;
    categoria: string;
    views_count?: number;
    is_devocional?: number;
}

interface CardNewProps {
    dev: DevItem;
    todasLasCategorias: string[];
    onClick?: () => void;
    buildHref?: (dev: DevItem) => string;
}

function getContentType(is_devocional?: number): 'devocional' | 'estudio' | 'ensenanza' {
    if (is_devocional === 0) return 'estudio';
    if (is_devocional === 2) return 'ensenanza';
    return 'devocional';
}

const CardNew = ({ dev, todasLasCategorias, onClick, buildHref }: CardNewProps) => {
    const { id, imagen, titulo, autor, categoria, views_count, is_devocional } = dev;

    const categoryColorMap = buildCategoryColorMap(todasLasCategorias);
    const normalizedCat = categoria.trim().toLowerCase();
    const categoryColor = categoryColorMap[categoria] || categoryColorMap[normalizedCat] || '#FFFFFF';
    const href = buildHref ? buildHref(dev) : `/devocional/${id}`;
    const contentType = getContentType(is_devocional);

    const addAlpha = (hex: string, opacity: number) => {
        const cleanHex = hex.length > 7 ? hex.substring(0, 7) : hex;
        const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
        return `${cleanHex}${alpha}`;
    };

    const handleCardClick = () => {
        if (onClick) { onClick(); } else { router.visit(href); }
    };

    return (
        <div className="card-wrapper-link" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            <div className="example-2 card-custom">
                <div
                    className="wrapper"
                    style={{
                        backgroundImage: `url(${imagen})`,
                        borderBottom: `4px solid ${categoryColor}`,
                    }}
                >
                    {/* ── HEADER: categoría + vistas ── */}
                    <div className="card-header-row">
                        <div className="date">
                            <span
                                className="category-badge"
                                style={{
                                    backgroundColor: addAlpha(categoryColor, 0.9),
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                                }}
                            >
                                {categoria}
                            </span>
                        </div>

                        {/* Vistas — esquina superior derecha */}
                        <div className="card-views">
                            <ul
                                className="menu-content"
                                style={{ width: 'auto', display: 'flex', marginTop: '10px', alignItems: 'center', gap: '6px' }}
                            >
                                {/* Vistas */}
                                <li style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'white' }}>
                                    <i className="bi bi-eye" />
                                    <span>{views_count ?? 0}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* ── LIKE + SHARE fijos — esquina inferior derecha ── */}
                    <div
                        className="card-like-fixed"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ul className="menu-content" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0px' }}>
                            <li style={{ display: 'flex', alignItems: 'center' }}>
                                <ShareButton
                                    type={contentType}
                                    id={id}
                                    variant="compact"
                                    className="text-white"
                                />
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center' }}>
                                <LikeButton
                                    type={contentType}
                                    id={id}
                                    variant="default"
                                    className="text-white"
                                />
                            </li>
                        </ul>
                    </div>

                    {/* ── FOOTER: autor + título + leer ── */}
                    <div className="data">
                        <div className="content">
                            <span className="author">{autor}</span>
                            <h1 className="title"><a href={href} style={{ color: 'inherit', textDecoration: 'none' }}><span>{titulo}</span></a></h1>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CardNew;