import DevocionalCard from '@/components/DevocionalCard';
import { router, useForm, usePage } from '@inertiajs/react';
import '../../css/main.css';

interface Devocional {
    id: string;
    imagen: string;
    titulo: string;
    contenido: string;
    categoria: string;
    autor: string;
    is_devocional?: boolean;
}

interface DevocionalesPagination {
    data: Devocional[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface DevocionalesProps {
    className?: string;
}

interface Categoria { categoria: string; count: number }
interface Autor { autor: string; count: number }

interface PageProps {
    devocionales: DevocionalesPagination;
    estudios: DevocionalesPagination;
    ocultos: DevocionalesPagination;
    categorias: Categoria[];
    autores: Autor[];
    filters: { search?: string; categoria?: string; autor?: string };
    todasLasCategorias: string[];
    [key: string]: any;
}

export default function Edit() {
    const { devocionales, estudios, ocultos, categorias, filters } = usePage<PageProps>().props;

    const form = useForm({
        search: filters.search ?? '',
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/devocionales-edit',
            { search: form.data.search },
            { preserveState: true, preserveScroll: true },
        );
    };



    interface PaginationProps {
        paginator: DevocionalesPagination;
        paramName: 'devocionales_page' | 'estudios_page' | 'ocultos_page';
    }

    const Pagination = ({ paginator, paramName }: PaginationProps) => {
        const goToPage = (paramName: 'devocionales_page' | 'estudios_page' | 'ocultos_page', page: number) => {
            router.get(
                '/devocionales-edit',
                {
                    search: form.data.search,
                    [paramName]: page,
                },
                { preserveState: true, preserveScroll: true },
            );
        };

        if (paginator.last_page <= 1) return null;

        return (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                <button
                    disabled={paginator.current_page === 1}
                    onClick={() => goToPage(paramName, paginator.current_page - 1)}
                    className="rounded border px-2 py-1 disabled:opacity-50"
                >
                    Anterior
                </button>
                <span>
                    Página {paginator.current_page} de {paginator.last_page}
                </span>
                <button
                    disabled={paginator.current_page === paginator.last_page}
                    onClick={() => goToPage(paramName, paginator.current_page + 1)}
                    className="rounded border px-2 py-1 disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>
        );
    };


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

    const todasLasCategorias = categorias
        .map((cat) => cat.categoria.trim().toLowerCase())
        .sort();

    return (
        <div className="blog-details-page" style={{ padding: '20px' }}>
            {/* Buscador */}
            <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={form.data.search}
                    onChange={(e) => form.setData('search', e.target.value)}
                    placeholder="Buscar devocional por contenido..."
                    className="flex-1 rounded border px-2 py-1 text-sm"
                />
                <button
                    type="submit"
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                >
                    Buscar
                </button>
            </form>

            {/* Ocultos */}
            {ocultos.data.length > 0 && <h2
                className="mb-2 text-lg font-semibold"
                style={{ color: 'black', padding: '50px 0 20px', textAlign: 'center' }}
            >
                Ocultos
            </h2>}
            <DevocionalCard
                devocionales={ocultos.data.map((d) => ({
                    ...d,
                    titulo: obtenerPrimerEtiqueta(decodeHtmlEntities(d.contenido)),
                    contenido: d.contenido,
                    autor: d.autor || '',
                }))}
                todasLasCategorias={todasLasCategorias}
                buildHref={(dev) => `/devocionales-editar/${dev.id}`}
            />
            <Pagination paginator={ocultos} paramName="ocultos_page" />

            {/* Devocionales */}
            <h2
                className="mb-2 text-lg font-semibold"
                style={{ color: 'black', padding: '50px 0 20px', textAlign: 'center' }}
            >
                Devocionales
            </h2>
            <DevocionalCard
                devocionales={devocionales.data.map((d) => ({
                    ...d,
                    titulo: obtenerPrimerEtiqueta(decodeHtmlEntities(d.contenido)),
                    contenido: d.contenido,
                    autor: d.autor || '',
                }))}
                todasLasCategorias={todasLasCategorias}
                buildHref={(dev) => `/devocionales-editar/${dev.id}`}
            />
            <Pagination paginator={devocionales} paramName="devocionales_page" />

            {/* Estudios */}
            <h2
                className="mt-6 mb-2 text-lg font-semibold"
                style={{ color: 'black', padding: '50px 0 20px', textAlign: 'center' }}
            >
                Estudios bíblicos
            </h2>
            <DevocionalCard
                devocionales={estudios.data.map((d) => ({
                    ...d,
                    titulo: obtenerPrimerEtiqueta(decodeHtmlEntities(d.contenido)),
                    contenido: d.contenido,
                    autor: d.autor || '',
                }))}
                todasLasCategorias={todasLasCategorias}
                buildHref={(dev) => `/devocionales-editar/${dev.id}`}
            />
            <Pagination paginator={estudios} paramName="estudios_page" />
        </div>
    );
}
