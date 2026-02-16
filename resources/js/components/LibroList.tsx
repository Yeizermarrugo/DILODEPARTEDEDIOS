import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import { createTheme, styled, ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';

const FireNav = styled(List)<{ component?: React.ElementType }>({
    '& .MuiListItemButton-root': {
        paddingLeft: 24,
        paddingRight: 24,
    },
    '& .MuiListItemIcon-root': {
        minWidth: 0,
        marginRight: 16,
    },
    '& .MuiSvgIcon-root': {
        fontSize: 20,
    },
});

type Categoria = string | { nombre: string };
type Libro = {
    id: string | number;
    categoria: Categoria | Categoria[];
    contenido: string;
};

export default function LibroList() {
    const [openCategoria, setOpenCategoria] = useState<Record<string, boolean>>({});
    const [libros, setLibros] = useState<Libro[]>([]);


    useEffect(() => {
        fetch('/estudiosbiblicos')
            .then((response) => response.json())
            .then((data: Libro[]) => {
                const lista = Array.isArray(data) ? data : [];

                const ordenados = [...lista].sort((a, b) => {
                    const ra = parseRefFromContenido(a.contenido);
                    const rb = parseRefFromContenido(b.contenido);

                    if (ra.cap !== rb.cap) return ra.cap - rb.cap;
                    return ra.ver - rb.ver;
                });

                setLibros(ordenados);
            })
            .catch((error) => console.error('Error fetching libros:', error));
    }, []);

    // Obtener todas las categorías en array (deduplicadas por nombre)
    const todasCategorias = libros
        .map((libro) =>
            Array.isArray(libro.categoria)
                ? libro.categoria
                : [libro.categoria].filter(Boolean)
        )
        .flat();

    const categoriasUnicas = todasCategorias.reduce<{ nombre: string }[]>((acc, curr) => {
        if (!curr) return acc;
        const nombre = typeof curr === 'object' ? curr.nombre : curr;
        if (!acc.find((item) => item.nombre === nombre)) acc.push({ nombre });
        return acc;
    }, []).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

    const obtenerPrimerEtiqueta = (html: string) => {
        const match = html.match(/<([a-zA-Z0-9]+)[^>]*>(.*?)<\/\1>/i);
        if (match) return match[2].replace(/<[^>]+>/g, '');
        return '';
    };

    const obtenerSegundaEtiqueta = (html: string) => {
        const match = html.match(/<h2[^>]*>(.*?)<\/h2>/i);
        if (match) return match[1].replace(/<[^>]+>/g, '');
        return '';
    };

    const TituloEstudioBiblico = ({ contenido }: { contenido: string }) => {
        const titulo = obtenerPrimerEtiqueta(contenido);
        return (
            <div style={{ justifyContent: 'start', display: 'flex', paddingTop: '20px' }}
                dangerouslySetInnerHTML={{ __html: titulo }} />
        );
    };

    const Heading2EstudioBiblico = ({ contenido }: { contenido: string }) => {
        const h2 = obtenerSegundaEtiqueta(contenido);
        return (
            <div style={{ justifyContent: 'start', display: 'flex', paddingTop: '20px' }}
                dangerouslySetInnerHTML={{ __html: h2 }} />
        );
    };

    // 1) Función para extraer capítulo y versículo inicial del contenido
    const parseRefFromContenido = (html: string): { cap: number; ver: number } => {
        const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        const h1Text = h1Match ? h1Match[1].replace(/<[^>]+>/g, '') : '';

        // Primero intenta "2:4"
        let refMatch = h1Text.match(/(\d+):(\d+)/);
        if (refMatch) {
            return { cap: Number(refMatch[1]), ver: Number(refMatch[2]) };
        }

        // Si no tiene ":", intenta solo "7" (capítulo)
        refMatch = h1Text.match(/\b(\d+)\b/);
        if (refMatch) {
            return { cap: Number(refMatch[1]), ver: 0 }; // versículo 0 ⇒ va antes que 1-?
        }

        // Sin número, mándalo al final
        return { cap: 9999, ver: 9999 };
    }



    return (
        <Box sx={{ display: 'flex' }}>
            <ThemeProvider
                theme={createTheme({
                    components: {
                        MuiListItemButton: {
                            defaultProps: {
                                disableTouchRipple: true,
                            },
                        },
                    },
                    // palette: {
                    //     mode: 'dark',
                    //     primary: { main: 'rgb(102, 157, 246)' },
                    //     background: { paper: 'rgb(5, 30, 52)' },
                    // },
                })}
            >
                <Paper elevation={0} sx={{ maxWidth: 600, width: '100%', minHeight: 400 }}>
                    <FireNav component="nav" disablePadding>
                        <Divider />
                        <Divider />
                        <Box>
                            {categoriasUnicas.map((categoria) => {
                                const nombre = categoria.nombre;
                                const isOpen = openCategoria[nombre] ?? false;

                                // Filtrar libros por la categoría actual (Libro)
                                const librosCategoria = libros.filter((libro: Libro) => {
                                    console.log("libro: ", libro);
                                    if (Array.isArray(libro.categoria)) {
                                        return libro.categoria.some((cat: Categoria) =>
                                            (typeof cat === 'object' ? cat.nombre : cat) === nombre
                                        );
                                    }
                                    return libro.categoria === nombre;
                                });

                                return (
                                    <Box key={nombre}>
                                        <ListItemButton
                                            alignItems="flex-start"
                                            onClick={() =>
                                                setOpenCategoria((prev) => ({
                                                    ...prev,
                                                    [nombre]: !isOpen,
                                                }))
                                            }
                                            sx={[
                                                { px: 3, pt: 2.5 },
                                                isOpen
                                                    ? { bgcolor: 'rgba(71, 98, 130, 0.2)' }
                                                    : { bgcolor: null, borderBlockEnd: '1px solid', borderColor: 'divider' },
                                                isOpen ? { pb: 0 } : { pb: 2.5 },
                                                {
                                                    '&:hover, &:focus': {
                                                        '& svg': { opacity: 1 },
                                                    },
                                                },
                                            ]}
                                        >
                                            <ListItemText
                                                primary={nombre}
                                                slotProps={{
                                                    primary: {
                                                        fontSize: 15,
                                                        fontWeight: 'medium',
                                                        lineHeight: '20px',
                                                        mb: '2px',
                                                        color: isOpen ? 'text.primary' : 'primary.main',
                                                    },
                                                }}
                                                sx={{ my: 0 }}
                                            />
                                            <KeyboardArrowDown
                                                sx={[
                                                    { mr: -1, opacity: 0, transition: '0.2s' },
                                                    isOpen
                                                        ? { transform: 'rotate(-180deg)' }
                                                        : { transform: 'rotate(0)' },
                                                ]}
                                            />
                                        </ListItemButton>
                                        {/* Libros de la categoría expandida */}
                                        {isOpen &&
                                            librosCategoria.map((libro) => (
                                                <ListItemButton
                                                    key={libro.id}
                                                    sx={[isOpen
                                                        ? { bgcolor: 'rgba(71, 98, 130, 0.07)' }
                                                        : { bgcolor: null }, {
                                                        py: 0,
                                                        minHeight: 32,
                                                        color: 'rgba(110, 110, 110, 0.88)',
                                                        // backgroundColor: 'transparent',
                                                        '&:hover': { backgroundColor: 'rgba(71, 98, 130, 0.19)' },
                                                        '& .MuiListItemText-primary': {
                                                            fontSize: 13,
                                                        },
                                                        pl: 5,
                                                    },
                                                    {
                                                        '&:hover, &:focus': {
                                                            '& svg': { opacity: 1 },
                                                        },
                                                    },]}
                                                >
                                                    <a
                                                        key={libro.id}
                                                        href={`/estudio-biblico/${libro.id}`}
                                                        style={{ textDecoration: 'none' }}
                                                    >
                                                        <ListItemText
                                                            primary={<div style={{
                                                                display: 'flex',
                                                                alignItems: 'baseline',
                                                                gap: '6px',
                                                                fontSize: '15px'
                                                            }}>
                                                                <span>
                                                                    <TituloEstudioBiblico contenido={libro.contenido} />
                                                                </span>
                                                                <span style={{ fontWeight: 400, color: '#aaa' }}>
                                                                    –
                                                                </span>
                                                                <span style={{ color: '#7a7a7a', fontWeight: 400 }}>
                                                                    <Heading2EstudioBiblico contenido={libro.contenido} />
                                                                </span>
                                                            </div>

                                                            }
                                                            slotProps={{
                                                                primary: {
                                                                    fontSize: 14,
                                                                    fontWeight: 'medium',
                                                                },
                                                            }}
                                                        />
                                                    </a>
                                                </ListItemButton>
                                            ))}
                                    </Box>
                                );
                            })}
                            <Divider />
                        </Box>
                    </FireNav>
                </Paper>
            </ThemeProvider>
        </Box >
    );
}
