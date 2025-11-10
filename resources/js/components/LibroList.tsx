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

export default function LibroList() {
    const [openCategoria, setOpenCategoria] = useState<{ [key: string]: boolean }>({});
    const [libros, setLibros] = useState<any[]>([]);

    useEffect(() => {
        fetch('/estudios')
            .then((response) => response.json())
            .then((data: any) => setLibros(Array.isArray(data) ? data : []))
            .catch((error) => console.error('Error fetching libros:', error));
    }, []);

    // Obtener todas las categorías en array (deduplicadas por nombre)
    const todasCategorias = libros
        .map((libro: any) =>
            Array.isArray(libro.categoria)
                ? libro.categoria
                : [libro.categoria].filter(Boolean)
        )
        .flat();

    const categoriasUnicas = todasCategorias.reduce((acc: any[], curr: any) => {
        if (!curr) return acc;
        const nombre = typeof curr === 'object' ? curr.nombre : curr;
        if (!acc.find((item) => item.nombre === nombre))
            acc.push({ nombre });
        return acc;
    }, []);

    const obtenerPrimerEtiqueta = (html: string) => {
        const match = html.match(/<([a-zA-Z0-9]+)[^>]*>(.*?)<\/\1>/i);
        if (match) {
            const innerText = match[2].replace(/<[^>]+>/g, '');
            return innerText;
        }
        return '';
    };

    const TituloDevocional = ({ contenido }: { contenido: string }) => {
        const titulo = obtenerPrimerEtiqueta(contenido);
        return (
            <div style={{ justifyContent: 'start', display: 'flex', paddingTop: '20px' }}
                dangerouslySetInnerHTML={{ __html: titulo }} />
        );
    };

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
                <Paper elevation={0} sx={{ maxWidth: 320 }}>
                    <FireNav component="nav" disablePadding>
                        <Divider />
                        {/* <ListItem component="div" disablePadding /> */}
                        <Divider />
                        <Box>
                            {categoriasUnicas.map((categoria: any) => {
                                const nombre = categoria.nombre;
                                const isOpen = openCategoria[nombre] ?? false;
                                // Filtrar libros por la categoría actual
                                const librosCategoria = libros.filter((libro: any) => {
                                    if (Array.isArray(libro.categoria)) {
                                        return libro.categoria.some((cat: any) =>
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
                                                    ? {
                                                        bgcolor: 'rgba(71, 98, 130, 0.2)',
                                                    }
                                                    : {
                                                        bgcolor: null,
                                                    },
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

                                                    }
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
                                            librosCategoria.map((libro: any) => (
                                                <ListItemButton
                                                    key={libro.id}
                                                    sx={[isOpen
                                                        ? {
                                                            bgcolor: 'rgba(71, 98, 130, 0.07)',
                                                        }
                                                        : {
                                                            bgcolor: null,
                                                        }, {
                                                        py: 0,
                                                        minHeight: 32,
                                                        color: 'rgba(110, 110, 110, 0.88)',
                                                        pl: 5,
                                                    }]}
                                                >
                                                    <ListItemText
                                                        primary={<TituloDevocional contenido={libro.contenido} />}
                                                        slotProps={{
                                                            primary: {
                                                                fontSize: 14,
                                                                fontWeight: 'medium',
                                                            },
                                                        }}
                                                    />
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
        </Box>
    );
}
