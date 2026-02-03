import DevocionalCard from '@/components/DevocionalCard';
import { Head, usePage } from '@inertiajs/react';

interface Devocional {
    id: string;
    imagen: string;
    titulo: string;
    contenido: string;
    categoria: string;
    autor: string;
}

interface DevocionalesPagination {
    data: Devocional[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    // si quieres, agrega más campos del paginator
}


interface DevocionalesProps {
    className?: string;
}


interface Categoria { categoria: string; count: number }
interface Autor { autor: string; count: number }

export default function Edit({ className }: DevocionalesProps) {
    const { devocionales, categorias, autores, filters, id } = usePage<{
        devocionales: DevocionalesPagination;   // ← aquí el cambio
        categorias: Categoria[];
        autores: Autor[];
        filters: { search?: string; categoria?: string; autor?: string };
        todasLasCategorias: string[];
    }>().props;


    const decodeHtmlEntities = (str: string): string => {
        const txt = document.createElement('textarea');
        txt.innerHTML = str;
        return txt.value;
    };

    const obtenerPrimerEtiqueta = (html: string) => {
        const match = html.match(/<([a-zA-Z0-9]+)[^>]*>(.*?)<\/\1>/i);
        if (match) {
            const innerText = match[2].replace(/<[^>]+>/g, '');
            return innerText;
        }
        return '';
    };

    const todasLasCategorias = categorias.map(cat =>
        cat.categoria.trim().toLowerCase()
    ).sort();

    console.log("Devocionales: ", devocionales);

    // Podrías manejar los filtros con useForm y hacer GET a esta misma ruta.
    // Aquí solo el esqueleto:
    return (
        <div className={className}>
            <Head title="Administrar devocionales" />
            <DevocionalCard
                devocionales={devocionales.data.map((devocional) => ({
                    ...devocional,
                    titulo: obtenerPrimerEtiqueta(decodeHtmlEntities(devocional.contenido)),
                    contenido: devocional.contenido,
                    autor: devocional.autor || '',
                }))}
                todasLasCategorias={todasLasCategorias}
                buildHref={(dev) => `/devocionales-editar/${dev.id}`}
            />

        </div>
    );
}
