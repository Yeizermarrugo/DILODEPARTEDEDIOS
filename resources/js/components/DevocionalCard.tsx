import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

interface Devocional {
    imagen: string;
    // Add other properties as needed, e.g.:
    titulo: string;
    contenido: string;
    categoria: string;
}

interface DevocionalCardProps {
    devocionales: Devocional[];
}

const colorArray = [
    // '#FF5252',
    '#ff990086',
    '#c511627c',
    '#ffd6408c',
    '#0090ea9a',
    '#fc00009f',
    '#00e67791',
    '#7c4dff85',
    '#ff408085',
    // '#FFD600',
    // '#69F0AE',
    // '#00B8D4',
    // '#2979FF',
    // '#304FFE',
    // '#AA00FF',
    // '#6200EA',
    // '#0091EA',
    // '#00BFAE',
    // '#64DD17',
    // '#AEEA00',
];

// Mapa global de categoría a color
const categoryColorMap: { [category: string]: string } = {};
export default function DevocionalCard({ devocionales }: DevocionalCardProps) {
    /**
     * Asigna un color único e inmutable por categoría.
     * Siempre retorna el mismo color para la misma categoría.
     * Si se acaban los colores, las extras serán blancas.
     */
    function getPlainTextAfterH1(html: string) {
        const regex = /<h1\b[^>]*>.*?<\/h1>/i;
        const match = html.match(regex);
        if (!match) return '';
        const index = (match.index ?? 0) + match[0].length;
        const afterH1 = html.slice(index);
        // Elimina todas las etiquetas HTML
        const plainText = afterH1.replace(/<[^>]+>/g, '').trim();
        return plainText;
    }

    function stringToColor(str: string): string {
        const normalized = str.trim().toLowerCase();

        if (categoryColorMap[normalized]) {
            return categoryColorMap[normalized];
        }

        for (const color of colorArray) {
            if (!Object.values(categoryColorMap).includes(color)) {
                categoryColorMap[normalized] = color;
                return color;
            }
        }

        // Si no hay colores disponibles, retorna blanco
        return '#FFFFFF';
    }

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
            {devocionales.map((dev, idx) => (
                <Card
                    sx={{
                        width: 170,
                        display: 'flex',
                        flexDirection: 'column',
                        height: 280,
                        backgroundColor: `${dev.categoria ? stringToColor(dev.categoria) : '#ffffffff'}`,
                    }}
                    key={idx}
                >
                    {/* <CardMedia sx={{ height: 140 }} image={dev.imagen} /> */}
                    <CardMedia
                        component="img"
                        image={dev.imagen}
                        alt="Descripción"
                        sx={{
                            height: 150, // Altura fija para todas las imágenes
                            width: '100%',
                            objectFit: 'cover', // Recorta y centra la imagen uniformemente
                            objectPosition: 'center',
                        }}
                    />
                    <CardContent sx={{ flex: '1 1 auto', overflow: 'hidden', paddingBottom: 0 }}>
                        <Typography sx={{ color: 'rgba(56, 56, 56, 1)', fontSize: '16px' }} gutterBottom variant="h5" component="div">
                            {dev.titulo}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: 'rgba(119, 119, 119, 0.81)', padding: 0, margin: 0 }}
                            dangerouslySetInnerHTML={{ __html: getPlainTextAfterH1(dev.contenido).split(' ').slice(0, 20).join(' ') + '...' }}
                        />
                    </CardContent>
                    {/* <CardActions sx={{ mt: 'auto' }}>
                        <Button size="small">Share</Button>
                        <Button size="small">Learn More</Button>
                    </CardActions> */}
                </Card>
            ))}
        </div>
    );
}
