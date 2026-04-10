import DevocionalCard from '@/components/DevocionalCard';
import { router, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import '../../css/main.css';

// ─── Interfaces ───────────────────────────────────────────────────────────────

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
    [key: string]: unknown;
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function Edit() {
    const { devocionales, estudios, ocultos, categorias, filters } = usePage<PageProps>().props;

    const form = useForm({
        search: filters.search ?? '',
    });

    // ─── Helper: Decodificar HTML seguro para SSR ───
    const decodeHtmlEntities = (str: string): string => {
        if (!str) return '';
        // Si estamos en el servidor (SSR), usamos reemplazos básicos
        if (typeof document === 'undefined') {
            return str
                .replace(/&nbsp;/g, ' ')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");
        }
        // Si estamos en el navegador, usamos el DOM
        const txt = document.createElement('textarea');
        txt.innerHTML = str;
        return txt.value;
    };

    const obtenerPrimerEtiqueta = (html: string) => {
        if (!html) return '';
        const match = html.match(/<([a-zA-Z0-9]+)[^>]*>(.*?)<\/\1>/i);
        if (match) {
            const innerText = match[2].replace(/<[^>]+>/g, '');
            return innerText;
        }
        return '';
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/devocionales-edit',
            { search: form.data.search },
            { preserveState: true, preserveScroll: true },
        );
    };

    const todasLasCategorias = categorias
        .map((cat) => cat.categoria.trim().toLowerCase())
        .sort();

    // ─── Componente de Paginación Interno ───
    const Pagination = ({ paginator, paramName }: { paginator: DevocionalesPagination; paramName: string }) => {
        const goToPage = (pName: string, page: number) => {
            router.get(
                '/devocionales-edit',
                { search: form.data.search, [pName]: page },
                { preserveState: true, preserveScroll: true },
            );
        };

        if (paginator.last_page <= 1) return null;

        return (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                <button
                    disabled={paginator.current_page === 1}
                    onClick={() => goToPage(paramName, paginator.current_page - 1)}
                    className="rounded border px-2 py-1 disabled:opacity-50 text-black bg-white"
                >
                    Anterior
                </button>
                <span className="text-black">
                    Página {paginator.current_page} de {paginator.last_page}
                </span>
                <button
                    disabled={paginator.current_page === paginator.last_page}
                    onClick={() => goToPage(paramName, paginator.current_page + 1)}
                    className="rounded border px-2 py-1 disabled:opacity-50 text-black bg-white"
                >
                    Siguiente
                </button>
            </div>
        );
    };

    // Helper para procesar la lista antes de pasarla a la Card
    const procesarDevocionales = (lista: Devocional[]) => {
        return lista.map((d) => ({
            ...d,
            titulo: obtenerPrimerEtiqueta(decodeHtmlEntities(d.contenido)),
            contenido: d.contenido,
            autor: d.autor || '',
        }));
    };

    return (
        <div className="blog-details-page" style={{ padding: '20px' }}>
            {/* Botón Volver */}
            <button
                type="button"
                onClick={() => router.visit(route('dashboard'))}
                className="back-floating-button"
            >
                <i className="bi bi-arrow-left" />
                Atrás
            </button>

            {/* Buscador */}
            <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={form.data.search}
                    onChange={(e) => form.setData('search', e.target.value)}
                    placeholder="Buscar devocional por contenido..."
                    className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                    type="submit"
                    className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
                >
                    Buscar
                </button>
            </form>

            {/* Renderizado de Secciones */}
            {[
                { title: 'Ocultos', data: ocultos, param: 'ocultos_page', show: ocultos.data.length > 0 },
                { title: 'Devocionales', data: devocionales, param: 'devocionales_page', show: true },
                { title: 'Estudios bíblicos', data: estudios, param: 'estudios_page', show: true }
            ].map((section) => section.show && (
                <React.Fragment key={section.title}>
                    <h2
                        className="text-lg font-semibold text-black text-center"
                        style={{ padding: '50px 0 20px' }}
                    >
                        {section.title}
                    </h2>
                    <DevocionalCard
                        devocionales={procesarDevocionales(section.data.data)}
                        todasLasCategorias={todasLasCategorias}
                        buildHref={(dev) => `/devocionales-editar/${dev.id}`}
                    />
                    <Pagination paginator={section.data} paramName={section.param} />
                </React.Fragment>
            ))}
        </div>
    );
}