import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

interface Devocional {
    id: string;
    imagen: string;
    titulo: string;
    contenido: string;
    categoria: string;
    autor: string;
}

interface DevocionalCardProps {
    devocionales: Devocional[];
    todasLasCategorias: string[];
    buildHref?: (dev: Devocional) => string;
}

const colorArray = [
    '#FF5252',
    '#ff990086',
    '#c511627c',
    '#ffd6408c',
    '#0090ea9a',
    '#fc00009f',
    '#00e67791',
    '#7c4dff85',
    '#ff408085',
    '#FFD600',
    '#69F0AE',
    '#00B8D4',
    '#2979FF',
    '#304FFE',
    '#AA00FF',
    // '#6200EA',
    // '#0091EA',
    // '#00BFAE',
    // '#64DD17',
    // '#AEEA00',
];

function buildCategoryColorMap(todasLasCategorias: string[]) {
    const map: { [categoria: string]: string } = {};
    todasLasCategorias.forEach((cat, idx) => {
        map[cat] = colorArray[idx] ?? '#FFFFFF';
    });
    return map;
}

export default function DevocionalCard({ devocionales, todasLasCategorias, buildHref }: DevocionalCardProps) {
    const categoryColorMap = buildCategoryColorMap(todasLasCategorias);
    /**
     * Asigna un color único e inmutable por categoría.
     * Siempre retorna el mismo color para la misma categoría.
     * Si se acaban los colores, las extras serán blancas.
     */
    // function getPlainTextAfterH1(html: string) {
    //     const regex = /<h1\b[^>]*>.*?<\/h1>/i;
    //     const match = html.match(regex);
    //     if (!match) return '';
    //     const index = (match.index ?? 0) + match[0].length;
    //     const afterH1 = html.slice(index);
    //     const plainText = afterH1.replace(/<[^>]+>/g, '').trim();
    //     return plainText;
    // }


    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
            {devocionales.map((dev, idx) => {
                const normalizedCat = dev.categoria.trim().toLowerCase();
                const cardBg = categoryColorMap[normalizedCat] || '#ffffffff';
                const href = buildHref ? buildHref(dev) : `/devocional/${dev.id}`;

                return (
                    <a
                        key={idx}
                        href={href}
                        style={{ textDecoration: 'none' }}
                    >

                        <Card
                            sx={{
                                width: 170,
                                display: 'flex',
                                flexDirection: 'column',
                                height: 280,
                                backgroundColor: cardBg,
                            }}
                            key={idx}
                        >
                            <CardMedia
                                component="img"
                                image={dev.imagen}
                                alt="Descripción"
                                sx={{
                                    height: 150,
                                    width: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                }}
                            />
                            <CardContent sx={{ flex: '1 1 auto', overflow: 'hidden', paddingBottom: 0 }}>
                                <Typography sx={{ color: 'rgba(56, 56, 56, 1)', fontSize: '16px' }} gutterBottom variant="h5" component="div"
                                    dangerouslySetInnerHTML={{
                                        __html: dev.titulo.split(' ').slice(0, 7).join(' ').toUpperCase() + (dev.titulo.split(' ').length > 7 ? '...' : '')
                                    }}>
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: 'rgba(119, 119, 119, 0.81)', paddingTop: 1, margin: 0, fontSize: '12px', fontStyle: 'italic' }}
                                    dangerouslySetInnerHTML={{ __html: dev.autor ? `Autor: ${dev.autor}` : '' }}
                                />
                            </CardContent>
                        </Card>
                    </a>
                );
            })}
        </div>
    );
}
