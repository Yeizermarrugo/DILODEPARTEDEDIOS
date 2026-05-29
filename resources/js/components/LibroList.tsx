import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import LikeButton from './LikeButton';
import { EstudiosAccordionSkeleton } from './SectionSkeletons';
import { ShareButton } from './ShareButton';

const BIBLICAL_ORDER: string[] = [
    'GÉNESIS',
    'ÉXODO',
    'LEVÍTICO',
    'NÚMEROS',
    'DEUTERONOMIO',
    'JOSUÉ',
    'JUECES',
    'RUT',
    '1 SAMUEL',
    '2 SAMUEL',
    '1 REYES',
    '2 REYES',
    '1 CRÓNICAS',
    '2 CRÓNICAS',
    'ESDRAS',
    'NEHEMÍAS',
    'ESTER',
    'JOB',
    'SALMOS',
    'PROVERBIOS',
    'ECLESIASTÉS',
    'CANTARES',
    'ISAÍAS',
    'JEREMÍAS',
    'LAMENTACIONES',
    'EZEQUIEL',
    'DANIEL',
    'OSEAS',
    'JOEL',
    'AMÓS',
    'ABDÍAS',
    'JONÁS',
    'MIQUEAS',
    'NAHÚM',
    'HABACUC',
    'SOFONÍAS',
    'HAGEO',
    'ZACARÍAS',
    'MALAQUÍAS',
    'MATEO',
    'MARCOS',
    'LUCAS',
    'JUAN',
    'HECHOS',
    'ROMANOS',
    '1 CORINTIOS',
    '2 CORINTIOS',
    'GÁLATAS',
    'EFESIOS',
    'FILIPENSES',
    'COLOSENSES',
    '1 TESALONICENSES',
    '2 TESALONICENSES',
    '1 TIMOTEO',
    '2 TIMOTEO',
    'TITO',
    'FILEMÓN',
    'HEBREOS',
    'SANTIAGO',
    '1 PEDRO',
    '2 PEDRO',
    '1 JUAN',
    '2 JUAN',
    '3 JUAN',
    'JUDAS',
    'APOCALIPSIS',
];

const biblicalOrderMap = new Map(BIBLICAL_ORDER.map((b, i) => [b.toUpperCase(), i]));

type Categoria = string | { nombre: string };

type Libro = {
    id: string;
    categoria: Categoria | Categoria[];
    contenido: string;
    views_count?: number;
    shares_count?: number;
};

interface Props {
    searchTerm: string;
    onLoad?: (stats: { total: number; categorias: number }) => void;
}

function decode(str: string) {
    const el = document.createElement('textarea');
    el.innerHTML = str;
    return el.value;
}

function getH1(html: string) {
    const m = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    return m ? decode(m[1].replace(/<[^>]+>/g, '')) : '';
}

function getH2(html: string) {
    const m = html.match(/<h2[^>]*>(.*?)<\/h2>/i);
    return m ? decode(m[1].replace(/<[^>]+>/g, '')) : '';
}

function getCatNombre(c: Categoria) {
    return typeof c === 'object' ? c.nombre : c;
}

function parseRef(html: string): { cap: number; ver: number } {
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1].replace(/<[^>]+>/g, '') ?? '';
    let m = h1.match(/(\d+):\s*(\d+)/);
    if (m) return { cap: Number(m[1]), ver: Number(m[2]) };
    m = h1.match(/\b(\d+)\b/);
    if (m) return { cap: Number(m[1]), ver: 0 };
    return { cap: 9999, ver: 9999 };
}

export default function LibroList({ searchTerm, onLoad }: Props) {
    const [libros, setLibros] = useState<Libro[]>([]);
    const [loading, setLoading] = useState(true);
    const [openCategoria, setOpenCategoria] = useState<Record<string, boolean>>({});
    const onLoadRef = useRef(onLoad);
    onLoadRef.current = onLoad;

    useEffect(() => {
        fetch('/estudiosbiblicos')
            .then((r) => r.json())
            .then((data: Libro[]) => {
                const lista = Array.isArray(data) ? data : [];
                setLibros(lista);
                setLoading(false);

                const cats = lista.reduce<Set<string>>((s, l) => {
                    const cs = Array.isArray(l.categoria) ? l.categoria : [l.categoria];
                    cs.forEach((c) => c && s.add(getCatNombre(c)));
                    return s;
                }, new Set());
                onLoadRef.current?.({ total: lista.length, categorias: cats.size });
            })
            .catch(() => setLoading(false));
    }, []);

    const search = searchTerm.trim().toLowerCase();

    const filtrados = search
        ? libros.filter((l) => getH1(l.contenido).toLowerCase().includes(search) || getH2(l.contenido).toLowerCase().includes(search))
        : libros;

    const categorias = filtrados
        .reduce<{ nombre: string }[]>((acc, l) => {
            const cs = Array.isArray(l.categoria) ? l.categoria : [l.categoria];
            cs.forEach((c) => {
                if (!c) return;
                const nombre = getCatNombre(c);
                if (!acc.find((x) => x.nombre === nombre)) acc.push({ nombre });
            });
            return acc;
        }, [])
        .sort((a, b) => {
            const posA = biblicalOrderMap.get(a.nombre.toUpperCase()) ?? 999;
            const posB = biblicalOrderMap.get(b.nombre.toUpperCase()) ?? 999;
            return posA !== posB ? posA - posB : a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
        });

    useEffect(() => {
        if (search) {
            const open: Record<string, boolean> = {};
            categorias.forEach((c) => {
                open[c.nombre] = true;
            });
            setOpenCategoria(open);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const toggle = (nombre: string) => setOpenCategoria((prev) => ({ ...prev, [nombre]: !prev[nombre] }));

    if (loading) {
        return <EstudiosAccordionSkeleton />;
    }

    if (filtrados.length === 0) {
        return (
            <div className="est-empty">
                <div className="est-empty__icon">📖</div>
                <div className="est-empty__text">No se encontraron estudios para "{searchTerm}"</div>
            </div>
        );
    }

    return (
        <div className="est-acordeon">
            {categorias.map((cat, catIdx) => {
                const isOpen = openCategoria[cat.nombre] ?? false;
                const items = filtrados
                    .filter((l) => {
                        const cs = Array.isArray(l.categoria) ? l.categoria : [l.categoria];
                        return cs.some((c) => c && getCatNombre(c) === cat.nombre);
                    })
                    .sort((a, b) => {
                        const ra = parseRef(a.contenido);
                        const rb = parseRef(b.contenido);
                        return ra.cap !== rb.cap ? ra.cap - rb.cap : ra.ver - rb.ver;
                    });

                return (
                    <div key={cat.nombre} className={`est-book ${isOpen ? 'est-book--open' : ''}`} style={{ animationDelay: `${catIdx * 40}ms` }}>
                        <button className="est-book__head" onClick={() => toggle(cat.nombre)} aria-expanded={isOpen}>
                            <span className="est-book__num">{String(catIdx + 1).padStart(2, '0')}</span>
                            <span className="est-book__name">{cat.nombre}</span>
                            <span className="est-book__count">{items.length} est.</span>
                            <span className={`est-book__chev ${isOpen ? 'est-book__chev--open' : ''}`}>
                                <svg
                                    viewBox="0 0 24 24"
                                    width={14}
                                    height={14}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2.2}
                                    strokeLinecap="round"
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </span>
                        </button>

                        {isOpen && (
                            <div className="est-book__items">
                                {items.map((libro, libroIdx) => {
                                    const titulo = getH1(libro.contenido);
                                    const subtitulo = getH2(libro.contenido);
                                    return (
                                        <div
                                            key={libro.id}
                                            role="link"
                                            tabIndex={0}
                                            onClick={() => router.visit(`/estudio-biblico/${libro.id}`)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') router.visit(`/estudio-biblico/${libro.id}`);
                                            }}
                                            className="est-item"
                                            style={{
                                                animationDelay: `${libroIdx * 25}ms`,
                                                cursor: 'pointer',
                                                textDecoration: 'none',
                                                display: 'flex',
                                                color: 'inherit',
                                            }}
                                        >
                                            <span className="est-item__num">{String(libroIdx + 1).padStart(2, '0')}</span>

                                            <span className="est-item__body">
                                                <span className="est-item__title">{titulo}</span>
                                                {subtitulo && (
                                                    <span className="est-item__sub">
                                                        <span className="est-item__dash">–</span>
                                                        {subtitulo}
                                                    </span>
                                                )}
                                            </span>

                                            {/* Vistas + Compartir + Like — stopPropagation evita navegar al link */}
                                            <span className="est-item__meta">
                                                <span className="est-item__views">
                                                    <i className="bi bi-eye" style={{ fontSize: 12 }} />
                                                    {libro.views_count ?? 0}
                                                </span>
                                                <span onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <ShareButton
                                                        type="estudio"
                                                        id={libro.id}
                                                        sharesCount={libro.shares_count ?? 0}
                                                        variant="compact"
                                                        showCount
                                                    />
                                                </span>
                                                <span onClick={(e) => e.stopPropagation()}>
                                                    <LikeButton type="estudio" id={libro.id} variant="default" />
                                                </span>
                                            </span>

                                            <span className="est-item__arrow">
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    width={12}
                                                    height={12}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                    strokeLinecap="round"
                                                >
                                                    <path d="M9 18l6-6-6-6" />
                                                </svg>
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
