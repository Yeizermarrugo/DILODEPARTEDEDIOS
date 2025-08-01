import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

interface Devocional {
    imagen: string;
    // Add other properties as needed, e.g.:
    titulo: string;
    contenido: string;
}

interface DevocionalCardProps {
    devocionales: Devocional[];
}

export default function DevocionalCard({ devocionales }: DevocionalCardProps) {
    function getContentAfterH1(html: string) {
        const regex = /<h1\b[^>]*>.*?<\/h1>/i;
        const match = html.match(regex);
        if (!match) return ''; // Si no hay h1, retorna vacío o todo el texto si prefieres
        const index = (match.index ?? 0) + match[0].length;
        return html.slice(index);
    }
    const contenidoFiltrado = (contenido: string) => {
        getContentAfterH1(contenido);
    };

    console.log('object', devocionales[0].contenido);

    // Si usas dangerouslySetInnerHTML
    <div dangerouslySetInnerHTML={{ __html: contenidoFiltrado }} />;
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
            {devocionales.map((dev, idx) => (
                <Card sx={{ width: 250, display: 'flex', flexDirection: 'column', height: 350 }} key={idx}>
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
                        <Typography gutterBottom variant="h5" component="div">
                            {dev.titulo}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: 'text.secondary', padding: 0, margin: 0 }}
                            dangerouslySetInnerHTML={{ __html: getContentAfterH1(dev.contenido).split(' ').slice(0, 20).join(' ') + '...' }}
                        />
                    </CardContent>
                    <CardActions sx={{ mt: 'auto' }}>
                        <Button size="small">Share</Button>
                        <Button size="small">Learn More</Button>
                    </CardActions>
                </Card>
            ))}
        </div>
    );
}
